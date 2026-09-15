import type { CanonicalDestinationKey, OperationManifest, ReplaceModuleExecutionModuleKey } from "./types";

export const BATCH_20_02_PREMIUM_V6_WORKBOOK_SHA256 = "7ce9be5f9727b9e90796dbe9ba5e2c4e33e617b358dd953e5e910076483fb0be";
const WORKBOOK_SUFFIX = "data/curated-mixed-batch-20-02/DestinationFinderAI-Curated-Mixed-Batch-20-02-PREMIUM-REPAIRED-v6-v3.3.xlsx";

export const BATCH_20_02_PREMIUM_V6_DESTINATION_KEYS = Object.freeze([
  "almunecar-spain", "tavira-portugal", "kalamata-greece", "lucca-italy", "sibenik-croatia",
  "pak-nam-pran-thailand", "piriapolis-uruguay", "plovdiv-bulgaria", "denia-spain", "viana-do-castelo-portugal",
  "ascoli-piceno-it", "pezenas-france", "matsuyama-japan", "taitung-taiwan", "quy-nhon-vietnam",
  "herceg-novi-montenegro", "fethiye-turkiye", "st-george-utah-united-states", "coeur-d-alene-idaho-united-states",
  "san-luis-obispo-california-united-states",
] as const);

/** Existing premium profiles whose non-keyed modules were explicitly approved for replay. */
export const BATCH_20_02_PREMIUM_V6_REPLAY_DESTINATION_KEYS = Object.freeze([
  "kalamata-greece",
  "lucca-italy",
  "sibenik-croatia",
  "viana-do-castelo-portugal",
  "ascoli-piceno-it",
  "san-luis-obispo-california-united-states",
] as const);

export const BATCH_20_02_PREMIUM_V6_REPLACEMENT_MODULES = Object.freeze([
  "costOfLiving", "climateMonthly", "housing", "healthcare", "visaResidency", "taxesFinance", "lgbtqInclusivity",
  "safetyRisks", "transportation", "remoteWork", "languageIntegration", "pets", "familyEducation", "communitySocial",
  "accessibility", "bureaucracySetup", "workBusiness", "retirementAging", "lifestyleLaws", "realityCheck", "lifestyleFeatures",
] as readonly ReplaceModuleExecutionModuleKey[]);

export interface Batch20ReplayAuthorizationInput {
  readonly workbookPath: string;
  readonly workbookHash: string | null | undefined;
  readonly approvedDestinationKeys: readonly string[];
}

export interface Batch20ReplayAuthorizationResult { readonly authorized: boolean; readonly reason: string | null; }

function isBatch20Workbook(path: string): boolean { return path.replaceAll("\\", "/").endsWith(WORKBOOK_SUFFIX); }

function hasExactScope(keys: readonly string[]): boolean {
  const expected = new Set(BATCH_20_02_PREMIUM_V6_DESTINATION_KEYS);
  return keys.length === expected.size && new Set(keys).size === expected.size && keys.every((key) => expected.has(key));
}

export function validateBatch20PremiumV3ReplayAuthorization(input: Batch20ReplayAuthorizationInput): Batch20ReplayAuthorizationResult {
  if (!isBatch20Workbook(input.workbookPath)) return { authorized: false, reason: null };
  if (input.workbookHash !== BATCH_20_02_PREMIUM_V6_WORKBOOK_SHA256) return { authorized: false, reason: "curated-mixed-batch-20-02:WORKBOOK_SHA256_NOT_AUTHORIZED" };
  if (!hasExactScope(input.approvedDestinationKeys)) return { authorized: false, reason: "curated-mixed-batch-20-02:DESTINATION_SCOPE_NOT_AUTHORIZED" };
  return { authorized: true, reason: null };
}

export function isBatch20PremiumV3ReplayDestinationKey(destinationKey: string): boolean {
  return (BATCH_20_02_PREMIUM_V6_REPLAY_DESTINATION_KEYS as readonly string[]).includes(destinationKey);
}

export function buildBatch20PremiumV3ReplayManifest(destinationKey: CanonicalDestinationKey): OperationManifest {
  if (!isBatch20PremiumV3ReplayDestinationKey(destinationKey)) return { entries: [] };
  return {
    entries: BATCH_20_02_PREMIUM_V6_REPLACEMENT_MODULES.map((targetModule) => ({
      destinationKey,
      operation: "REPLACE_MODULE" as const,
      targetModule,
      reason: "curated-mixed-batch-20-02:premium-v6-replay-authorization",
    })),
  };
}
