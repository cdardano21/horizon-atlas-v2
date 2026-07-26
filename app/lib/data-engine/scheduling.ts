import { DATA_CATEGORY_CATALOG } from "./category-catalog";
import { executeImportRun } from "./orchestrator";
import { getLatestImportRun, getSchedulePolicy } from "./repository";
import type { DataCategoryKey, ImportRunSummary } from "./types";

export type SchedulePolicy = {
  isEnabled: boolean;
  sourceKey: string | null;
  minIntervalHours: number;
  maxDestinationsPerRun: number;
};

export type ScheduledImportRequest = {
  accessToken: string;
  userId: string;
  categoryKey: DataCategoryKey;
  sourceKey?: string;
  destinationSlugs?: string[];
  force?: boolean;
  maxDestinations?: number;
};

export type ScheduledImportResult = {
  success: boolean;
  skipped: boolean;
  reason?: string;
  policy: SchedulePolicy;
  lastRunAt?: string;
  run?: ImportRunSummary;
};

const DEFAULT_MAX_DESTINATIONS = 75;

const MAX_DESTINATION_OVERRIDES: Partial<Record<DataCategoryKey, number>> = {
  monthly_weather: 150,
  climate_averages: 150,
  rainfall: 150,
  humidity: 150,
  sunshine_hours: 150,
  uv_index: 150,
  sea_temperature: 120,
  rent_prices: 60,
  home_purchase_prices: 60,
  airport_drive_times: 50,
};

export function inferMinIntervalHours(updateFrequency: string): number {
  const value = updateFrequency.toLowerCase();
  if (value.includes("weekly")) {
    return 24 * 7;
  }

  if (value.includes("quarterly")) {
    return 24 * 90;
  }

  if (value.includes("monthly")) {
    return 24 * 30;
  }

  if (value.includes("daily")) {
    return 24;
  }

  return 24 * 14;
}

export function getDefaultSchedulePolicy(
  categoryKey: DataCategoryKey,
  maxDestinations?: number,
): SchedulePolicy {
  const category = DATA_CATEGORY_CATALOG[categoryKey];
  const inferredCap = MAX_DESTINATION_OVERRIDES[categoryKey] ?? DEFAULT_MAX_DESTINATIONS;

  return {
    isEnabled: true,
    sourceKey: null,
    minIntervalHours: inferMinIntervalHours(category.updateFrequency),
    maxDestinationsPerRun:
      typeof maxDestinations === "number" && Number.isFinite(maxDestinations) && maxDestinations > 0
        ? Math.floor(maxDestinations)
        : inferredCap,
  };
}

function canRunNow(lastRunAt: string | undefined, minIntervalHours: number, force = false): {
  shouldRun: boolean;
  reason?: string;
} {
  if (force) {
    return { shouldRun: true };
  }

  if (!lastRunAt) {
    return { shouldRun: true };
  }

  const last = Date.parse(lastRunAt);
  if (!Number.isFinite(last)) {
    return { shouldRun: true };
  }

  const minMs = minIntervalHours * 60 * 60 * 1000;
  const elapsed = Date.now() - last;
  if (elapsed >= minMs) {
    return { shouldRun: true };
  }

  const remainingHours = Math.max(1, Math.ceil((minMs - elapsed) / (60 * 60 * 1000)));
  return {
    shouldRun: false,
    reason: `Category ${minIntervalHours}h cadence not yet due. Retry in ~${remainingHours}h.`,
  };
}

export async function executeScheduledImport(
  request: ScheduledImportRequest,
): Promise<ScheduledImportResult> {
  const defaultPolicy = getDefaultSchedulePolicy(request.categoryKey, request.maxDestinations);
  const persisted = await getSchedulePolicy(request.accessToken, request.categoryKey);

  const policy: SchedulePolicy = {
    isEnabled: persisted?.is_enabled ?? defaultPolicy.isEnabled,
    sourceKey: persisted?.source_key ?? null,
    minIntervalHours: persisted?.min_interval_hours ?? defaultPolicy.minIntervalHours,
    maxDestinationsPerRun: persisted?.max_destinations_per_run ?? defaultPolicy.maxDestinationsPerRun,
  };

  if (
    typeof request.maxDestinations === "number" &&
    Number.isFinite(request.maxDestinations) &&
    request.maxDestinations > 0
  ) {
    policy.maxDestinationsPerRun = Math.min(policy.maxDestinationsPerRun, Math.floor(request.maxDestinations));
  }

  const selectedSourceKey = request.sourceKey ?? policy.sourceKey ?? undefined;

  if (!policy.isEnabled) {
    return {
      success: true,
      skipped: true,
      reason: "Category schedule policy is disabled.",
      policy,
    };
  }

  const lastRun = await getLatestImportRun(request.accessToken, request.categoryKey, selectedSourceKey);
  const lastRunAt = lastRun?.finished_at ?? lastRun?.started_at;
  const decision = canRunNow(lastRunAt ?? undefined, policy.minIntervalHours, request.force);

  if (!decision.shouldRun) {
    return {
      success: true,
      skipped: true,
      reason: decision.reason,
      policy,
      lastRunAt: lastRunAt ?? undefined,
    };
  }

  const destinationSlugs = request.destinationSlugs?.slice(0, policy.maxDestinationsPerRun);

  const run = await executeImportRun({
    accessToken: request.accessToken,
    userId: request.userId,
    categoryKey: request.categoryKey,
    sourceKey: selectedSourceKey,
    destinationSlugs,
    triggerType: "scheduled",
  });

  return {
    success: true,
    skipped: false,
    policy,
    lastRunAt: lastRunAt ?? undefined,
    run,
  };
}
