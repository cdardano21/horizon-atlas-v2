import path from "node:path";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { loadFrozenWorkbookV31DeterministicImport, isDeterministicV31ContractVersionSupported, type DeterministicV31WorkbookImport } from "./workbook-v31-deterministic-core";
import { mapCanonicalDestinationToStoredState } from "./persistence/v31/map-canonical-destination-to-stored-state";
import { createInMemoryPersistedDestinationReadPort } from "./persistence/v31/in-memory-persisted-destination-read-port";
import { loadNormalizedPersistedDestinationBundle } from "./persistence/v31/load-normalized-persisted-destination-bundle";
import type { NormalizedPersistedDestinationBundle } from "./persistence/v31/materialize-stored-destination-state";
import type { CanonicalDestinationKey, DestinationId } from "./persistence/v31/types";

/**
 * Permanent, generic expansion-workbook preview architecture.
 *
 * Registering a new batch workbook (Batch #3, #4, ...) means adding one entry here - never a new
 * batch-numbered loader module, a new branch in canonical-destination-loader.ts, or new page code.
 * Every entry is resolved through the exact same real deterministic parser + real
 * mapCanonicalDestinationToStoredState + real loadNormalizedPersistedDestinationBundle contract used
 * by production, entirely in-memory, with zero Supabase writes. This registry is preview-only (see
 * isExpansionWorkbookPreviewEnabled) and never becomes a second production source of truth: production
 * destinations are always resolved from Supabase-backed persisted state, regardless of this registry's
 * contents.
 */
export interface ExpansionWorkbookRegistryEntry {
  /** Stable identifier for this registry entry, used only in diagnostics/error messages (never a customer-facing value). */
  readonly registryId: string;
  /** Path to the workbook file, resolved relative to process.cwd() if not already absolute. */
  readonly workbookPath: string;
  /** "preview" entries are eligible for local/preview resolution; "production" entries are never read by this module (reserved for future explicit production-import tooling, not request-time resolution). */
  readonly environment: "preview" | "production";
  /** The complete, permanent destination_key set this workbook is expected to own - not invented, copied from the workbook's own DESTINATIONS sheet by whoever registers the entry. */
  readonly expectedDestinationKeys: readonly string[];
  /** Optional integrity pin; when present, validateExpansionWorkbookRegistry fails if the on-disk file no longer matches. */
  readonly expectedSha256?: string;
}

export const EXPANSION_WORKBOOK_REGISTRY: readonly ExpansionWorkbookRegistryEntry[] = [
  {
    registryId: "batch-01",
    workbookPath: "data/DestinationFinderAI_Expansion_Batch_01_5_Destinations_v3.2.xlsx",
    environment: "preview",
    expectedDestinationKeys: ["the-villages-fl-us", "sofia-bg", "puerto-vallarta-mx", "hoi-an-vn", "queenstown-nz"],
    expectedSha256: "bbf101ee758733349109943510369d07c666fca1decee30250a9d2fa73016a4a",
  },
  {
    registryId: "batch-02",
    workbookPath: "data/DestinationFinderAI_Expansion_Batch_02_5_Destinations_v3.2.xlsx",
    environment: "preview",
    expectedDestinationKeys: ["ascoli-piceno-it", "sarande-al", "dumaguete-ph", "las-terrenas-do", "fairhope-al-us"],
    expectedSha256: "347afe628d5ceb3bbf0bc1b0b44a358b24bf575214946b40f4297fd3b6a80fe1",
  },
];

const previewEntries = (registry: readonly ExpansionWorkbookRegistryEntry[]) => registry.filter((entry) => entry.environment === "preview");

/**
 * The registry is preview/local-only. Production builds (NODE_ENV=production, matching the standard
 * Next.js/Vercel production convention) never resolve or load anything through this module - production
 * destinations must always come from the Supabase-backed persisted-destination path.
 */
export const isExpansionWorkbookPreviewEnabled = (): boolean => process.env.NODE_ENV !== "production";

const resolvedWorkbookPath = (entry: ExpansionWorkbookRegistryEntry) => path.resolve(process.cwd(), entry.workbookPath);

const shouldCacheWorkbookImport = () => process.env.NODE_ENV !== "test" && process.env.VITEST !== "true";
const cachedImportsByRegistryId = new Map<string, ReturnType<typeof loadFrozenWorkbookV31DeterministicImport>>();

async function loadRegistryEntryImport(entry: ExpansionWorkbookRegistryEntry): Promise<DeterministicV31WorkbookImport> {
  if (shouldCacheWorkbookImport()) {
    const cached = cachedImportsByRegistryId.get(entry.registryId);
    if (cached) return cached;
  }
  const importPromise = loadFrozenWorkbookV31DeterministicImport(resolvedWorkbookPath(entry));
  if (shouldCacheWorkbookImport()) {
    cachedImportsByRegistryId.set(entry.registryId, importPromise);
  }
  return importPromise;
}

/**
 * Resolves a raw route slug to a permanent destination_key owned by exactly one registered preview
 * workbook. Direct destination_key matches are resolved purely from the registry's own static
 * expectedDestinationKeys metadata (no workbook parse required). Anything else is checked against
 * every registered workbook's own DESTINATION_ALIASES-derived alias table - never a fuzzy match, and
 * never silently resolved if more than one workbook claims the same key or the same alias.
 */
export async function resolveExpansionWorkbookDestinationKey(
  rawSlug: string,
  registry: readonly ExpansionWorkbookRegistryEntry[] = EXPANSION_WORKBOOK_REGISTRY,
): Promise<string | null> {
  if (!isExpansionWorkbookPreviewEnabled()) return null;
  const normalized = rawSlug.trim().toLowerCase();
  if (!normalized) return null;

  const entries = previewEntries(registry);

  const directOwners = entries.filter((entry) => entry.expectedDestinationKeys.includes(normalized));
  if (directOwners.length > 1) {
    throw new Error(`Expansion workbook registry conflict: destination_key "${normalized}" is registered in multiple workbooks (${directOwners.map((entry) => entry.registryId).join(", ")}).`);
  }
  if (directOwners.length === 1) {
    return normalized;
  }

  const aliasMatches: Array<{ registryId: string; resolvedKey: string }> = [];
  for (const entry of entries) {
    const workbookImport = await loadRegistryEntryImport(entry);
    const aliasResolution = (workbookImport.diagnostics?.aliasResolution ?? {}) as Record<string, string>;
    const resolvedKey = aliasResolution[normalized] ?? aliasResolution[rawSlug.trim()];
    if (resolvedKey && entry.expectedDestinationKeys.includes(resolvedKey)) {
      aliasMatches.push({ registryId: entry.registryId, resolvedKey });
    }
  }

  if (aliasMatches.length > 1) {
    throw new Error(`Expansion workbook registry conflict: alias "${normalized}" resolves via multiple registered workbooks (${aliasMatches.map((match) => `${match.registryId}->${match.resolvedKey}`).join(", ")}).`);
  }
  if (aliasMatches.length === 1) {
    return aliasMatches[0].resolvedKey;
  }

  return null;
}

function findOwningEntry(destinationKey: string, registry: readonly ExpansionWorkbookRegistryEntry[]): ExpansionWorkbookRegistryEntry | null {
  const owners = previewEntries(registry).filter((entry) => entry.expectedDestinationKeys.includes(destinationKey));
  if (owners.length > 1) {
    throw new Error(`Expansion workbook registry conflict: destination_key "${destinationKey}" is registered in multiple workbooks (${owners.map((entry) => entry.registryId).join(", ")}).`);
  }
  return owners[0] ?? null;
}

/**
 * Loads a NormalizedPersistedDestinationBundle for a registered preview destination directly from its
 * owning workbook (via the real deterministic parser + real mapCanonicalDestinationToStoredState + real
 * loadNormalizedPersistedDestinationBundle contract), entirely in-memory. Never touches Supabase. Only
 * ever loads the single workbook that owns destinationKey - never scans every registered workbook.
 */
export async function loadExpansionWorkbookDestinationBundle(
  destinationKey: string,
  registry: readonly ExpansionWorkbookRegistryEntry[] = EXPANSION_WORKBOOK_REGISTRY,
): Promise<NormalizedPersistedDestinationBundle | null> {
  if (!isExpansionWorkbookPreviewEnabled()) return null;
  const entry = findOwningEntry(destinationKey, registry);
  if (!entry) return null;

  const workbookImport = await loadRegistryEntryImport(entry);
  const canonical = (workbookImport.canonicalDestinations ?? []).find((destination) => destination.identity.destinationKey === destinationKey);
  if (!canonical) return null;

  const storedState = mapCanonicalDestinationToStoredState(canonical);
  const identity = {
    destinationKey: destinationKey as CanonicalDestinationKey,
    destinationId: `expansion-preview-${entry.registryId}-${destinationKey}` as DestinationId,
  };
  const readPort = createInMemoryPersistedDestinationReadPort(identity, storedState);
  const result = await loadNormalizedPersistedDestinationBundle(identity, readPort);

  if (result.outcome !== "SUCCESS") {
    return null;
  }
  return result.bundle;
}

/**
 * Population/metro population/elevation live on the DESTINATIONS row itself (canonical.identity),
 * not as DESTINATION_FACTS rows, and are not part of the StoredDestinationState/bundle contract -
 * exposed separately so the renderer can restore them without fabricating a knowledgeProfile field
 * the workbook never supplied.
 */
export async function loadExpansionWorkbookRawIdentity(
  destinationKey: string,
  registry: readonly ExpansionWorkbookRegistryEntry[] = EXPANSION_WORKBOOK_REGISTRY,
): Promise<{
  readonly population: string | null;
  readonly metroPopulation: string | null;
  readonly elevationMeters: string | null;
  readonly officialTourismUrl: string | null;
  readonly googleMapsUrl: string | null;
} | null> {
  if (!isExpansionWorkbookPreviewEnabled()) return null;
  const entry = findOwningEntry(destinationKey, registry);
  if (!entry) return null;

  const workbookImport = await loadRegistryEntryImport(entry);
  const canonical = (workbookImport.canonicalDestinations ?? []).find((destination) => destination.identity.destinationKey === destinationKey);
  if (!canonical) return null;

  return {
    population: canonical.identity.population ?? null,
    metroPopulation: canonical.identity.metroPopulation ?? null,
    elevationMeters: canonical.identity.elevationMeters ?? null,
    // These two DESTINATIONS-sheet columns are real, authored links (unlike youtube/tiktok/instagram/
    // webcam, which have no workbook column at all in any schema version) - never fabricated here.
    officialTourismUrl: canonical.destinationRow?.official_tourism_url ?? null,
    googleMapsUrl: canonical.destinationRow?.google_maps_url ?? null,
  };
}

export interface ExpansionWorkbookRegistryValidationIssue {
  readonly registryId: string;
  readonly message: string;
}

export interface ExpansionWorkbookRegistryValidationResult {
  readonly ok: boolean;
  readonly issues: readonly ExpansionWorkbookRegistryValidationIssue[];
}

/**
 * Proves the registry is internally consistent before it is trusted at request time:
 * - no destination_key or alias is claimed by more than one registered workbook,
 * - every registered workbook is actually readable and passes deterministic-parser validation,
 * - every workbook's declared schema_version is within the parser's supported range,
 * - the registry's own expectedDestinationKeys exactly matches what the workbook actually parses to
 *   (neither missing keys nor undeclared extras), and
 * - an optional expectedSha256 pin still matches the on-disk file.
 * Intended to be called by tests (and optionally tooling), not on every request.
 */
export async function validateExpansionWorkbookRegistry(
  registry: readonly ExpansionWorkbookRegistryEntry[] = EXPANSION_WORKBOOK_REGISTRY,
): Promise<ExpansionWorkbookRegistryValidationResult> {
  const issues: ExpansionWorkbookRegistryValidationIssue[] = [];
  const entries = previewEntries(registry);

  const keyOwners = new Map<string, string[]>();
  for (const entry of entries) {
    for (const key of entry.expectedDestinationKeys) {
      keyOwners.set(key, [...(keyOwners.get(key) ?? []), entry.registryId]);
    }
  }
  for (const [key, owners] of keyOwners) {
    if (owners.length > 1) {
      issues.push({ registryId: owners.join(","), message: `destination_key "${key}" is registered in multiple workbooks: ${owners.join(", ")}` });
    }
  }

  const aliasOwners = new Map<string, Set<string>>();

  for (const entry of entries) {
    let workbookImport: DeterministicV31WorkbookImport;
    try {
      workbookImport = await loadRegistryEntryImport(entry);
    } catch (error) {
      issues.push({ registryId: entry.registryId, message: `Workbook could not be read: ${error instanceof Error ? error.message : String(error)}` });
      continue;
    }

    if (workbookImport.validationErrors?.length) {
      issues.push({ registryId: entry.registryId, message: `Workbook failed deterministic-parser validation: ${workbookImport.validationErrors.join("; ")}` });
    }

    if (!isDeterministicV31ContractVersionSupported(workbookImport.contractVersion)) {
      issues.push({ registryId: entry.registryId, message: `Workbook schema_version "${workbookImport.contractVersion}" is not within the parser's supported range.` });
    }

    const parsedKeys = new Set((workbookImport.canonicalDestinations ?? []).map((destination) => destination.identity.destinationKey));
    const expectedKeys = new Set(entry.expectedDestinationKeys);
    const missingFromWorkbook = [...expectedKeys].filter((key) => !parsedKeys.has(key));
    const undeclaredInRegistry = [...parsedKeys].filter((key) => !expectedKeys.has(key));
    if (missingFromWorkbook.length > 0) {
      issues.push({ registryId: entry.registryId, message: `Registered expectedDestinationKeys not found in the parsed workbook: ${missingFromWorkbook.join(", ")}` });
    }
    if (undeclaredInRegistry.length > 0) {
      issues.push({ registryId: entry.registryId, message: `Workbook parses destination_key(s) not declared in expectedDestinationKeys: ${undeclaredInRegistry.join(", ")}` });
    }

    if (entry.expectedSha256) {
      try {
        const fileBytes = readFileSync(resolvedWorkbookPath(entry));
        const actualSha256 = createHash("sha256").update(fileBytes).digest("hex");
        if (actualSha256 !== entry.expectedSha256) {
          issues.push({ registryId: entry.registryId, message: `Workbook SHA-256 mismatch: expected ${entry.expectedSha256}, got ${actualSha256}` });
        }
      } catch (error) {
        issues.push({ registryId: entry.registryId, message: `Could not compute workbook SHA-256: ${error instanceof Error ? error.message : String(error)}` });
      }
    }

    const aliasResolution = (workbookImport.diagnostics?.aliasResolution ?? {}) as Record<string, string>;
    for (const aliasKey of Object.keys(aliasResolution)) {
      const owners = aliasOwners.get(aliasKey) ?? new Set<string>();
      owners.add(entry.registryId);
      aliasOwners.set(aliasKey, owners);
    }
  }

  for (const [aliasKey, owners] of aliasOwners) {
    if (owners.size > 1) {
      issues.push({ registryId: [...owners].join(","), message: `alias "${aliasKey}" is defined in multiple registered workbooks: ${[...owners].join(", ")}` });
    }
  }

  return { ok: issues.length === 0, issues };
}
