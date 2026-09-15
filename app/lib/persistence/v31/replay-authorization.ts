import type { CanonicalDestinationKey, OperationManifest, ReplaceModuleExecutionModuleKey } from "./types";

export interface ReplayAuthorizationPolicy {
  readonly workbookSuffix: string;
  readonly workbookHash: string;
  readonly destinationKeys: readonly string[];
  readonly replacementDestinationKeys?: readonly string[];
  readonly replacementModules: readonly ReplaceModuleExecutionModuleKey[];
  readonly reason: string;
}

export interface ReplayAuthorizationInput {
  readonly workbookPath: string;
  readonly workbookHash: string | null | undefined;
  readonly approvedDestinationKeys: readonly string[];
}

export interface ReplayAuthorizationResult { readonly authorized: boolean; readonly reason: string | null; }

export function validateReplayAuthorization(input: ReplayAuthorizationInput, policy: ReplayAuthorizationPolicy): ReplayAuthorizationResult {
  if (!input.workbookPath.replaceAll("\\", "/").endsWith(policy.workbookSuffix)) return { authorized: false, reason: null };
  if (input.workbookHash !== policy.workbookHash) return { authorized: false, reason: `${policy.reason}:WORKBOOK_SHA256_NOT_AUTHORIZED` };
  const expected = new Set(policy.destinationKeys);
  const supplied = new Set(input.approvedDestinationKeys);
  if (supplied.size !== expected.size || supplied.size !== input.approvedDestinationKeys.length || [...supplied].some((key) => !expected.has(key))) {
    return { authorized: false, reason: `${policy.reason}:DESTINATION_SCOPE_NOT_AUTHORIZED` };
  }
  return { authorized: true, reason: null };
}

export function buildReplayManifest(destinationKey: CanonicalDestinationKey, policy: ReplayAuthorizationPolicy): OperationManifest {
  const allowed = policy.replacementDestinationKeys ?? policy.destinationKeys;
  if (!allowed.includes(destinationKey)) return { entries: [] };
  return { entries: policy.replacementModules.map((targetModule) => ({ destinationKey, operation: "REPLACE_MODULE" as const, targetModule, reason: `${policy.reason}:REPLACE_MODULE` })) };
}
