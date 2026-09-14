import type { CanonicalDestinationKey, OperationManifest, ReplaceModuleExecutionModuleKey } from "./types";

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

export interface Batch20ReplayAuthorizationInput {
  readonly workbookPath: string;
  readonly workbookHash: string | null | undefined;
  readonly approvedDestinationKeys: readonly string[];
}

export interface Batch20ReplayAuthorizationResult { readonly authorized: boolean; readonly reason: string | null; }

function isBatch20Workbook(path: string): boolean { return path.replaceAll("\\", "/").endsWith(WORKBOOK_SUFFIX); }
function hasExactScope(keys: readonly string[]): boolean {
  const expected = new Set(BATCH_20_01_PREMIUM_V2_DESTINATION_KEYS);
  return keys.length === expected.size && new Set(keys).size === expected.size && keys.every((key) => expected.has(key));
}

export function validateBatch20PremiumV2ReplayAuthorization(input: Batch20ReplayAuthorizationInput): Batch20ReplayAuthorizationResult {
  if (!isBatch20Workbook(input.workbookPath)) return { authorized: false, reason: null };
  if (input.workbookHash !== BATCH_20_01_PREMIUM_V2_WORKBOOK_SHA256) return { authorized: false, reason: "curated-mixed-batch-20-01:WORKBOOK_SHA256_NOT_AUTHORIZED" };
  if (!hasExactScope(input.approvedDestinationKeys)) return { authorized: false, reason: "curated-mixed-batch-20-01:DESTINATION_SCOPE_NOT_AUTHORIZED" };
  return { authorized: true, reason: null };
}

export function buildBatch20PremiumV2ReplayManifest(destinationKey: CanonicalDestinationKey): OperationManifest {
  if (!(BATCH_20_01_PREMIUM_V2_DESTINATION_KEYS as readonly string[]).includes(destinationKey)) return { entries: [] };
  return { entries: BATCH_20_01_PREMIUM_V2_REPLACEMENT_MODULES.map((targetModule) => ({ destinationKey, operation: "REPLACE_MODULE" as const, targetModule, reason: "curated-mixed-batch-20-01:premium-v2-replay-authorization" })) };
}
