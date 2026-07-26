import { DATA_CATEGORY_CATALOG } from "./category-catalog";
import { assertSourceEnv } from "./env";
import { normalizeRawRecord } from "./normalization";
import {
  createImportRun,
  failStaleRunningImportRuns,
  finalizeImportRun,
  getSchedulePolicy,
  hasRunningImportRun,
  insertErrorLog,
  insertStagedNormalized,
  listDestinationRows,
} from "./repository";
import { SOURCE_REGISTRY } from "./source-registry";
import { inferDefaultSourceKey } from "./source-selection";
import { selectMoreConfident, validateNormalizedRecord } from "./validation";
import { getAdapter } from "./adapters";
import type { DataCategoryKey, ImportRunSummary, NormalizedRecord } from "./types";

export type ExecuteImportOptions = {
  accessToken: string;
  userId: string;
  categoryKey: DataCategoryKey;
  sourceKey?: string;
  destinationSlugs?: string[];
  triggerType?: "manual" | "scheduled";
};

export class ImportConcurrencyError extends Error {
  constructor(categoryKey: DataCategoryKey, sourceKey: string) {
    super(`An import run is already active for category ${categoryKey} and source ${sourceKey}.`);
    this.name = "ImportConcurrencyError";
  }
}

const DEFAULT_STALE_RUNNING_MAX_AGE_HOURS = 6;

export async function executeImportRun(options: ExecuteImportOptions): Promise<ImportRunSummary> {
  const startedAt = new Date().toISOString();
  const category = DATA_CATEGORY_CATALOG[options.categoryKey];
  if (!category) {
    throw new Error(`Unsupported category: ${options.categoryKey}`);
  }

  const selectedSourceKey = options.sourceKey ?? inferDefaultSourceKey(options.categoryKey);
  if (!selectedSourceKey) {
    throw new Error(`No source adapter selected for category ${options.categoryKey}`);
  }

  const source = SOURCE_REGISTRY[selectedSourceKey];
  if (!source) {
    throw new Error(`Unknown source registry key: ${selectedSourceKey}`);
  }

  const schedulePolicy = await getSchedulePolicy(options.accessToken, options.categoryKey);
  const staleAfterHours =
    schedulePolicy?.stale_after_hours && schedulePolicy.stale_after_hours > 0
      ? schedulePolicy.stale_after_hours
      : DEFAULT_STALE_RUNNING_MAX_AGE_HOURS;
  const staleBefore = new Date(Date.now() - staleAfterHours * 60 * 60 * 1000).toISOString();
  await failStaleRunningImportRuns(options.accessToken, {
    categoryKey: options.categoryKey,
    sourceKey: selectedSourceKey,
    staleBeforeIso: staleBefore,
    errorMessage: `Auto-failed stale running import run older than ${staleAfterHours}h.`,
  });

  const alreadyRunning = await hasRunningImportRun(
    options.accessToken,
    options.categoryKey,
    selectedSourceKey,
  );
  if (alreadyRunning) {
    throw new ImportConcurrencyError(options.categoryKey, selectedSourceKey);
  }

  const adapter = getAdapter(selectedSourceKey);
  if (!adapter || !adapter.supports.includes(options.categoryKey)) {
    throw new Error(
      `No implemented adapter for source ${selectedSourceKey} and category ${options.categoryKey}`,
    );
  }

  assertSourceEnv(selectedSourceKey, source.authEnv);

  const destinations = await listDestinationRows(options.accessToken, options.destinationSlugs);
  const destinationIdBySlug = Object.fromEntries(destinations.map((destination) => [destination.slug, destination.id]));

  const runId = await createImportRun(options.accessToken, {
    categoryKey: options.categoryKey,
    sourceKey: selectedSourceKey,
    triggerType: options.triggerType ?? "manual",
    triggeredBy: options.userId,
    destinationCount: destinations.length,
  });

  let rawCount = 0;
  let normalizedCount = 0;
  let dedupedCount = 0;
  let rejectedCount = 0;

  try {
    const dedupeMap = new Map<string, NormalizedRecord>();

    for (const destination of destinations) {
      try {
        const rawRecords = await adapter.fetchRecords({
          destination: {
            slug: destination.slug,
            city: destination.city,
            country: destination.country,
            latitude: destination.latitude ?? undefined,
            longitude: destination.longitude ?? undefined,
          },
          category,
          source,
        });

        rawCount += rawRecords.length;

        for (const raw of rawRecords) {
          const normalized = normalizeRawRecord(raw, 1);
          const validation = validateNormalizedRecord(normalized);
          if (!validation.valid) {
            rejectedCount += 1;
            await insertErrorLog(options.accessToken, {
              runId,
              categoryKey: options.categoryKey,
              sourceKey: selectedSourceKey,
              destinationSlug: destination.slug,
              errorCode: "validation_failed",
              errorMessage: validation.issues.map((issue) => issue.message).join("; "),
              details: { issues: validation.issues, payload: normalized.payload },
            });
            continue;
          }

          normalizedCount += 1;

          const existing = dedupeMap.get(normalized.dedupeKey);
          if (!existing) {
            dedupeMap.set(normalized.dedupeKey, normalized);
            continue;
          }

          dedupeMap.set(normalized.dedupeKey, selectMoreConfident(existing, normalized));
        }
      } catch (error) {
        rejectedCount += 1;
        await insertErrorLog(options.accessToken, {
          runId,
          categoryKey: options.categoryKey,
          sourceKey: selectedSourceKey,
          destinationSlug: destination.slug,
          errorCode: "destination_import_error",
          errorMessage: error instanceof Error ? error.message : "Destination import failed.",
        });
      }
    }

    dedupedCount = dedupeMap.size;
    await insertStagedNormalized(options.accessToken, runId, destinationIdBySlug, Array.from(dedupeMap.values()));

    await finalizeImportRun(options.accessToken, runId, {
      status: "completed",
      rawCount,
      normalizedCount,
      dedupedCount,
      rejectedCount,
    });

    return {
      runId,
      categoryKey: options.categoryKey,
      sourceKey: selectedSourceKey,
      destinationCount: destinations.length,
      rawCount,
      normalizedCount,
      dedupedCount,
      rejectedCount,
      startedAt,
      finishedAt: new Date().toISOString(),
    };
  } catch (error) {
    await finalizeImportRun(options.accessToken, runId, {
      status: "failed",
      rawCount,
      normalizedCount,
      dedupedCount,
      rejectedCount,
      errorMessage: error instanceof Error ? error.message : "Import run failed.",
    });

    throw error;
  }
}
