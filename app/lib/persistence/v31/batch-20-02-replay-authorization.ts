import type { CanonicalDestinationKey, OperationManifest, ReplaceModuleExecutionModuleKey } from "./types";
import { buildReplayManifest, validateReplayAuthorization, type ReplayAuthorizationInput, type ReplayAuthorizationResult } from "./replay-authorization";

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

export type Batch20ReplayAuthorizationInput = ReplayAuthorizationInput;
export type Batch20ReplayAuthorizationResult = ReplayAuthorizationResult;

const POLICY = { workbookSuffix: WORKBOOK_SUFFIX, workbookHash: BATCH_20_02_PREMIUM_V6_WORKBOOK_SHA256, destinationKeys: BATCH_20_02_PREMIUM_V6_DESTINATION_KEYS, replacementDestinationKeys: BATCH_20_02_PREMIUM_V6_REPLAY_DESTINATION_KEYS, replacementModules: BATCH_20_02_PREMIUM_V6_REPLACEMENT_MODULES, reason: "curated-mixed-batch-20-02" } as const;

export function validateBatch20PremiumV3ReplayAuthorization(input: Batch20ReplayAuthorizationInput): Batch20ReplayAuthorizationResult {
  return validateReplayAuthorization(input, POLICY);
}

export function isBatch20PremiumV3ReplayDestinationKey(destinationKey: string): boolean {
  return (BATCH_20_02_PREMIUM_V6_REPLAY_DESTINATION_KEYS as readonly string[]).includes(destinationKey);
}

export function buildBatch20PremiumV3ReplayManifest(destinationKey: CanonicalDestinationKey): OperationManifest {
  return buildReplayManifest(destinationKey, { ...POLICY, replacementModules: BATCH_20_02_PREMIUM_V6_REPLACEMENT_MODULES, reason: "curated-mixed-batch-20-02:premium-v6-replay-authorization" });
}
