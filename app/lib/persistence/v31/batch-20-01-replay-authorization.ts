import type { CanonicalDestinationKey, OperationManifest, ReplaceModuleExecutionModuleKey } from "./types";
import { buildReplayManifest, validateReplayAuthorization, type ReplayAuthorizationInput, type ReplayAuthorizationResult } from "./replay-authorization";

export const BATCH_20_01_PREMIUM_V2_WORKBOOK_SHA256 = "899b9d0ec5b7577e97e42f059cda20fae55e9846b7f3e688f8369b3fc0f1df85";
const WORKBOOK_SUFFIX = "data/curated-mixed-batch-20-01/DestinationFinderAI-Curated-Mixed-Batch-20-01-PREMIUM-REPAIRED-v2-v3.3.xlsx";

export const BATCH_20_01_PREMIUM_V2_DESTINATION_KEYS = Object.freeze([
  "sarajevo-bosnia-and-herzegovina", "da-lat-vietnam", "sete-france", "tainan-taiwan", "arequipa-peru",
  "sibiu-romania", "ohrid-north-macedonia", "kuching-malaysia", "ipoh-malaysia", "dunedin-new-zealand",
  "sucre-bolivia", "loja-ecuador", "campeche-mexico", "oberstdorf-germany", "frutillar-chile",
  "launceston-australia", "sandpoint-idaho-united-states", "nelson-new-zealand", "albany-western-australia", "essaouira-morocco",
] as const);

export const BATCH_20_01_PREMIUM_V2_REPLACEMENT_MODULES = Object.freeze([
  "costOfLiving", "climateMonthly", "housing", "healthcare", "visaResidency", "taxesFinance", "lgbtqInclusivity",
  "safetyRisks", "transportation", "remoteWork", "languageIntegration", "pets", "familyEducation", "communitySocial",
  "accessibility", "bureaucracySetup", "workBusiness", "retirementAging", "lifestyleLaws", "realityCheck", "lifestyleFeatures",
] as readonly ReplaceModuleExecutionModuleKey[]);

export type Batch20ReplayAuthorizationInput = ReplayAuthorizationInput;
export type Batch20ReplayAuthorizationResult = ReplayAuthorizationResult;

const POLICY = { workbookSuffix: WORKBOOK_SUFFIX, workbookHash: BATCH_20_01_PREMIUM_V2_WORKBOOK_SHA256, destinationKeys: BATCH_20_01_PREMIUM_V2_DESTINATION_KEYS, replacementModules: BATCH_20_01_PREMIUM_V2_REPLACEMENT_MODULES, reason: "curated-mixed-batch-20-01" } as const;

export function validateBatch20PremiumV2ReplayAuthorization(input: Batch20ReplayAuthorizationInput): Batch20ReplayAuthorizationResult {
  return validateReplayAuthorization(input, POLICY);
}

export function buildBatch20PremiumV2ReplayManifest(destinationKey: CanonicalDestinationKey): OperationManifest {
  return buildReplayManifest(destinationKey, { ...POLICY, replacementModules: BATCH_20_01_PREMIUM_V2_REPLACEMENT_MODULES, reason: "curated-mixed-batch-20-01:premium-v2-replay-authorization" });
}
