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
    workbookPath: "data/DestinationFinderAI_Expansion_Batch_01_5_Destinations_v3.3.xlsx",
    environment: "preview",
    expectedDestinationKeys: ["the-villages-fl-us", "sofia-bg", "puerto-vallarta-mx", "hoi-an-vn", "queenstown-nz"],
    // Updated 2026-08-31 after correcting two broken food-place links (Tintoque, Morning Glory
    // Original). Updated again 2026-09-01 after correcting links for 10 of 11 Hoi An Maps-only
    // food places (Miss Ly Cafeteria left unresolved - no confidently official link found).
    // Updated again 2026-09-01 after correcting links for 16 of 17 entries across The Villages (9)
    // and Sofia (8) (Scooter's Coffee - The Villages left unresolved - no confidently official/
    // location-specific link found; Made in Home confirmed renamed to Dark Sister by Made in Home).
    // Updated again 2026-09-01 after correcting links for all 14 entries across Puerto Vallarta (7)
    // and Queenstown (7) - all 14 resolved, no closures/replacements/renames needed.
    expectedSha256: "3153462443d85b82e621711856242cdd3cdeb86ee6776acad309a58dcc200671",
  },
  {
    registryId: "batch-02",
    workbookPath: "data/DestinationFinderAI_Expansion_Batch_02_5_Destinations_v3.3.xlsx",
    environment: "preview",
    expectedDestinationKeys: ["ascoli-piceno-it", "sarande-al", "dumaguete-ph", "las-terrenas-do", "fairhope-al-us"],
    // Updated 2026-08-31 after adding 5 verified food places each for Sarande and Dumaguete (previously zero).
    // Updated again 2026-09-01 after correcting links for all 3 Las Terrenas dining-area entries
    // (Pueblo de los Pescadores, Punta Popy beach-road dining cluster, Playa Bonita boardwalk/dining
    // cluster) to the official Dominican Republic tourism board page for Las Terrenas.
    // Updated again 2026-09-01 after accepting the exact business matches for Casablanca Restaurant
    // Dumaguete, Buglas Isla Cafe, La Mensa Italian Chophouse, Sans Rival Cakes and Pastries,
    // Hayahay Treehouse Bar and Viewdeck Restobar, and Taverna Garden (exact official Facebook or
    // Instagram profiles only; all remaining Sarandë/Dumaguete targets stay Maps-only unless identity
    // is independently confirmed).
    expectedSha256: "a2fc1e0cd99f4662b31e6846d2cc39715e0195c1098874ac9f2b637b31a7084d",
  },
  {
    registryId: "next-batch-20-private-import-authorized",
    workbookPath: "data/next-batch-20/DestinationFinderAI-Next-Batch-20-Visual-Parity-Enriched-v3.3.xlsx",
    environment: "preview",
    expectedDestinationKeys: [
      "tivat-montenegro", "matera-italy", "trieste-italy", "braga-portugal", "valencia-spain",
      "rijeka-croatia", "zadar-croatia", "piran-slovenia", "rovinj-croatia", "kanazawa-japan",
      "polignano-a-mare-italy", "cefalu-italy", "kalamata-greece", "taormina-italy", "podgorica-montenegro",
      "kotor-montenegro", "bergamo-italy", "pietrasanta-italy", "alicante-spain", "verona-italy",
    ],
    expectedSha256: "88f365b1dabfef7a3bbeb2958f53e9c3537d1f8f8b74e6cf6083482ddb802683",
  },
  {
    registryId: "legacy-carryover-batch-20-02",
    // Superseded 2026-09-08 by the premium-enriched authoritative workbook. Prior workbook
    // bytes and replacement evidence remain preserved for recovery and audit purposes.
    workbookPath: "data/legacy-carryover-batch-20-02/DestinationFinderAI-Legacy-Carryover-Batch-20-Premium-Enriched-Final-v3.3.xlsx",
    environment: "preview",
    expectedDestinationKeys: [
      "radovljica-slovenia", "osaka-japan", "sitges-spain", "estepona-spain", "lake-bled-slovenia",
      "olbia-italy", "hiroshima-japan", "kobe-japan", "alghero-italy", "hakodate-japan",
      "desenzano-del-garda-italy", "onomichi-japan", "cartagena-spain", "gijon-spain", "girona-spain",
      "ptuj-slovenia", "koper-slovenia", "murcia-spain", "takayama-japan", "dubrovnik-croatia",
    ],
    expectedSha256: "015209686a8a68c20c32288498be40b88802268cc967a4ef71fbaa143b9d2a3a",
  },
  {
    registryId: "legacy-carryover-batch-20-03",
    workbookPath: "data/legacy-carryover-batch-20-03/DestinationFinderAI-Next-Legacy-Batch-20-Premium-Enriched-Corrected-v3.3.xlsx",
    environment: "preview",
    expectedDestinationKeys: [
      "aomori-japan", "kamakura-japan", "porto-portugal", "kranj-slovenia", "coimbra-portugal",
      "kumamoto-japan", "beppu-japan", "sapporo-japan", "lecce-italy", "athens-greece",
      "matsumoto-japan", "morioka-japan", "sendai-japan", "cavtat-croatia", "sirmione-italy",
      "celje-slovenia", "nagasaki-japan", "perugia-italy", "novigrad-croatia", "ioannina-greece",
    ],
    expectedSha256: "6bae082ce0d8d2f43975971004824d202d8dcfd73be336d75d6670dd1f6f8bc7",
  },
  {
    registryId: "legacy-carryover-batch-20-06",
    workbookPath: "data/legacy-carryover-batch-20-06/DestinationFinderAI-Next-Legacy-Batch-20-06-FINAL-AUTHORITATIVE-POPULATION-REPAIRED-v3.3.xlsx",
    environment: "preview",
    expectedDestinationKeys: [
      "asheville-north-carolina-united-states", "portland-maine-united-states", "bend-oregon-united-states", "san-luis-obispo-california-united-states", "sarasota-florida-united-states",
      "reno-nevada-united-states", "viana-do-castelo-portugal", "salamanca-spain", "san-sebastian-spain", "evora-portugal",
      "prague-other-europe", "treviso-italy", "annecy-france", "ho-chi-minh-city-vietnam", "tokyo-japan",
      "bali-indonesia", "auckland-new-zealand", "cusco-peru", "valdivia-chile", "cordoba-argentina",
    ],
    expectedSha256: "9cb91d6f7ac8e6c7bb84a262960ce7dc7699099c2a40351408883af079f87558",
  },
  {
    registryId: "legacy-pilot06-populated",
    // Superseded 2026-08-30 by the authoritative curated workbook - the prior POPULATED.xlsx file is
    // intentionally left on disk, unregistered, as a recoverable historical artifact (never deleted).
    workbookPath: "data/legacy-migration-pilot-06/DestinationFinderAI_Legacy_Pilot_06_Authoritative_v3.3.xlsx",
    environment: "production",
    expectedDestinationKeys: [
      "the-hague-netherlands", "kyoto-japan", "santa-fe-new-mexico-united-states",
      "st-cloud-minnesota-united-states", "san-ramon-costa-rica", "st-john-s-canada",
    ],
    // Updated 2026-08-31 after correcting 6 broken/renamed food-place links (Foodhallen Den Haag
    // replaced with De Grote Markt, Capriole Cafe renamed to Puurr aan de Binck, Gion Kappa renamed
    // to its current name, plus Betterday Coffee/Krewe Restaurant/Chinched domain corrections).
    // Updated again 2026-09-01 after confirming Raymonds (St. John's) permanently closed and
    // replacing it with Rabble (verified official Instagram profile).
    // Updated again 2026-09-01 after accepting the exact official Instagram profile for Aromas Café
    // in San Ramón (all other San Ramón targets remain Maps-only unless exact identity evidence is
    // independently confirmed).
    expectedSha256: "9bc59b700e7eebff35578fbdea1f628b27c8a53cf8a5c9da5d648946039e77ff",
  },
  {
    registryId: "legacy-batch-20",
    workbookPath: "data/legacy-migration-batch-20/DestinationFinderAI_Legacy_Production_Batch_20_Reader_Ready_Authoritative_v3.3.xlsx",
    environment: "production",
    expectedDestinationKeys: [
      "ajijic-mexico", "boquete-panama", "chiang-mai-thailand", "cuenca-ecuador", "da-nang-vietnam",
      "florianopolis-brazil", "funchal-portugal", "george-town-malaysia", "hua-hin-thailand", "lucca-italy",
      "merida-mexico", "monopoli-italy", "montevideo-uruguay", "nafplio-greece", "nice-france",
      "palm-springs-california-united-states", "paphos-cyprus", "santander-spain",
      "savannah-georgia-united-states", "sibenik-croatia",
    ],
    // Updated 2026-08-31 after correcting 3 food-place links (La Nueva Posada, Tamarind Market,
    // Savor Nafplio Experiences) and reverting 2 unresolved broken links to Google Maps fallback.
    // Updated again 2026-09-01 after correcting links for all 5 Savannah Maps-only food places.
    // Updated again 2026-09-01 after correcting links for 8 of 9 entries across Funchal, Nafplio,
    // Sibenik, Boquete (x3), and Da Nang (x2) (Pescaria Monopoli and Madame Lan Restaurant left
    // unresolved - no confidently official/reachable link found for either).
    // Updated again 2026-09-01 after correcting links for 13 of 15 entries across Ajijic (5),
    // Chiang Mai (5), and Cuenca (5) (The Coffee Hour and Chiang Mai Food Adventures left
    // unresolved - no confidently official Ajijic-specific/identity-confirmed match found).
    // Updated again 2026-09-01: Yves' Restaurant Bar's website_url was incorrectly a third-party
    // aggregator (hey-restaurants.com) - replaced with its confirmed official Facebook page.
    // Updated again 2026-09-01 for the bounded Batch 20 food-link enrichment pass covering the 15
    // named recommendations in Mérida, Montevideo, and Palm Springs.
    // Updated 2026-09-05 to merge the duplicate Mercado Público de Florianópolis place record;
    // the richer official-source row remains and preserves the correct Portuguese diacritics.
    // Updated again 2026-09-05 to remove duplicate Teatro Solís and Mercado Agrícola de
    // Montevideo records, preserving each direct official-source row and correct diacritics.
    // Updated again 2026-09-05 to reconcile five production-planner semantic fact collisions:
    // six distinct facts received precise fact keys and two redundant fact rows were removed
    // only where their evidence and official sources remain in supported canonical modules.
    expectedSha256: "2d02e7932574caee95f955d9d900d3de65bf8a96ac258ddaf717f64f005dff10",
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
