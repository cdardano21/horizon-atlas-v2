import type { NormalizedPersistedDestinationBundle } from "./materialize-stored-destination-state";
import type { PersistedDestinationReadResult, PersistedDestinationReadFailure, ResolvedDestinationIdentity, PersistedPresenceModuleKey, PersistedModulePresence } from "./types";
import type { PersistedDestinationReadPort } from "./persisted-destination-read-port";
import { normalizePersistedDestinationRows } from "./normalize-persisted-destination-rows";
import type { PersistedRootRow, PersistedProfileRow, PersistedPresenceRow, PersistedKeyedChildrenRows, PersistedReplaceModulesRows, PersistedSingletonsRows } from "./normalize-persisted-destination-rows";
import { CURRENT_V31_PROFILE_STORAGE_VERSION } from "./write-port";

const REQUIRED_PRESENCE_MODULES: readonly PersistedPresenceModuleKey[] = [
  "facts",
  "scores",
  "neighborhoods",
  "places",
  "resources",
  "media",
  "propertyResources",
  "moveChecklist",
  "eventsSeasonality",
  "sources",
  "costOfLiving",
  "climateMonthly",
  "housing",
  "healthcare",
  "visaResidency",
  "taxesFinance",
  "lgbtqInclusivity",
  "safetyRisks",
  "transportation",
  "remoteWork",
  "languageIntegration",
  "pets",
  "familyEducation",
  "communitySocial",
  "accessibility",
  "bureaucracySetup",
  "workBusiness",
  "retirementAging",
  "lifestyleLaws",
  "realityCheck",
  "environmentQuality",
  "dailyLifePracticality",
];

/**
 * Additive, v3.3-only modules that are NOT required for a persisted destination's presence set to be
 * considered complete/current. Real, pre-existing Supabase-backed production destinations were persisted
 * before this module existed and must keep resolving successfully (never UNSUPPORTED_LEGACY_STATE) purely
 * because they predate an additive module. When a presence row for one of these modules IS present (e.g.
 * the in-memory preview read port, which always emits one), it is still recognized as valid - it is simply
 * never required.
 */
const OPTIONAL_PRESENCE_MODULES: readonly PersistedPresenceModuleKey[] = ["lifestyleFeatures"];

const KNOWN_PRESENCE_MODULES: readonly PersistedPresenceModuleKey[] = [...REQUIRED_PRESENCE_MODULES, ...OPTIONAL_PRESENCE_MODULES];

function createFailure(reason: "DESTINATION_NOT_FOUND" | "DB_READ_FAILED" | "UNSUPPORTED_LEGACY_STATE" | "INCOMPLETE_PERSISTED_STATE" | "MALFORMED_PERSISTED_STATE", identity: ResolvedDestinationIdentity, module?: PersistedPresenceModuleKey | null): PersistedDestinationReadFailure {
  if (module == null) {
    return { reason, destinationIdentity: identity };
  }
  return { reason, destinationIdentity: identity, module };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && 
!Array.isArray(value);
}

function validateIdentity(row: { readonly destinationId: string; readonly destinationKey: string }, identity: ResolvedDestinationIdentity): boolean {
  return row.destinationId === identity.destinationId && row.destinationKey === identity.destinationKey;
}

function validatePositionSequence(rows: readonly { readonly position: number }[]): boolean {
  if (rows.length === 0) {
    return true;
  }
  const sorted = [...rows].sort((left, right) => left.position - right.position);
  const expected = sorted.map((_, index) => index + 1);
  return sorted.every((row, index) => row.position === expected[index]);
}

function normalizePositionedRows<T extends { readonly position: number; readonly summary: string | null; readonly [key: string]: unknown }>(rows: readonly T[]): readonly T[] {
  return [...rows].sort((left, right) => left.position - right.position).map((row) => ({ ...row }));
}

function validateNoDuplicateKeys(rows: readonly { readonly [key: string]: unknown }[], childKeyField: string): boolean {
  const seen = new Set<string>();
  for (const row of rows) {
    const value = row[childKeyField];
    if (typeof value !== "string" || value.length === 0) {
      return false;
    }
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
  }
  return true;
}

function isPersistedRootRow(value: unknown): value is PersistedRootRow {
  return isRecord(value)
    && typeof value.destinationId === "string"
    && typeof value.destinationKey === "string"
    && (value.slug === null || typeof value.slug === "string")
    && (value.name === null || typeof value.name === "string")
    && (value.city === null || typeof value.city === "string")
    && (value.country === null || typeof value.country === "string");
}

function isPersistedProfileRow(value: unknown): value is PersistedProfileRow {
  return isRecord(value)
    && typeof value.destinationId === "string"
    && typeof value.destinationKey === "string"
    && (value.profileStorageVersion === null || typeof value.profileStorageVersion === "number")
    && (value.identityName === null || typeof value.identityName === "string")
    && (value.shortDescription === null || typeof value.shortDescription === "string")
    && (value.longDescription === null || typeof value.longDescription === "string")
    && (value.currency === null || typeof value.currency === "string")
    && (value.primaryLanguage === null || typeof value.primaryLanguage === "string")
    && (value.timeZone === null || typeof value.timeZone === "string");
}

function isPersistedPresenceRow(value: unknown): value is PersistedPresenceRow {
  return isRecord(value)
    && typeof value.destinationId === "string"
    && typeof value.destinationKey === "string"
    && typeof value.module === "string"
    && KNOWN_PRESENCE_MODULES.includes(value.module as PersistedPresenceModuleKey);
}

function isPersistedPresenceRows(value: unknown): value is readonly PersistedPresenceRow[] {
  return Array.isArray(value) && value.every((row) => isPersistedPresenceRow(row));
}

function validatePresenceSet(rows: unknown, identity: ResolvedDestinationIdentity): { ok: true; value: readonly PersistedPresenceRow[] } | { ok: false; failure: PersistedDestinationReadFailure } {
  if (
!isPersistedPresenceRows(rows)) {
    return { ok: false, failure: createFailure("MALFORMED_PERSISTED_STATE", identity) };
  }

  const seenModules = new Set<PersistedPresenceModuleKey>();
  for (const row of rows) {
    if (!validateIdentity(row, identity)) {
      return { ok: false, failure: createFailure("MALFORMED_PERSISTED_STATE", identity, row.module) };
    }
    if (seenModules.has(row.module)) {
      return { ok: false, failure: createFailure("MALFORMED_PERSISTED_STATE", identity, row.module) };
    }
    seenModules.add(row.module);
  }

  const presenceByModule = new Map(rows.map((row) => [row.module, row]));
  for (const module of REQUIRED_PRESENCE_MODULES) {
    if (
!presenceByModule.has(module)) {
      return { ok: false, failure: createFailure("UNSUPPORTED_LEGACY_STATE", identity, module) };
    }
  }
  return { ok: true, value: rows };
}

function validateProfile(profile: unknown, identity: ResolvedDestinationIdentity): { ok: true; value: PersistedProfileRow } | { ok: false; failure: PersistedDestinationReadFailure } {
  if (profile === null) {
    return { ok: false, failure: createFailure("INCOMPLETE_PERSISTED_STATE", identity) };
  }
  if (
!isPersistedProfileRow(profile)) {
    return { ok: false, failure: createFailure("MALFORMED_PERSISTED_STATE", identity) };
  }
  if (
!validateIdentity(profile, identity)) {
    return { ok: false, failure: createFailure("MALFORMED_PERSISTED_STATE", identity) };
  }
  if (profile.profileStorageVersion === null) {
    return { ok: false, failure: createFailure("UNSUPPORTED_LEGACY_STATE", identity) };
  }
  if (profile.profileStorageVersion !== CURRENT_V31_PROFILE_STORAGE_VERSION) {
    return { ok: false, failure: createFailure("MALFORMED_PERSISTED_STATE", identity) };
  }
  return { ok: true, value: profile };
}

function validateRoot(root: unknown, identity: ResolvedDestinationIdentity): { ok: true; value: PersistedRootRow } | { ok: false; failure: PersistedDestinationReadFailure } {
  if (root === null) {
    return { ok: false, failure: createFailure("DESTINATION_NOT_FOUND", identity) };
  }
  if (
!isPersistedRootRow(root)) {
    return { ok: false, failure: createFailure("MALFORMED_PERSISTED_STATE", identity) };
  }
  if (
!validateIdentity(root, identity)) {
    return { ok: false, failure: createFailure("MALFORMED_PERSISTED_STATE", identity) };
  }
  return { ok: true, value: root };
}

function validateModuleRows<T extends { readonly destinationId: string; readonly destinationKey: string }>(rows: readonly T[], identity: ResolvedDestinationIdentity, childKeyField?: string): { ok: true; value: readonly T[] } | { ok: false; failure: PersistedDestinationReadFailure } {
  for (const row of rows) {
    if (
!validateIdentity(row, identity)) {
      return { ok: false, failure: createFailure("MALFORMED_PERSISTED_STATE", identity) };
    }
  }
  if (childKeyField) {
    if (
!validateNoDuplicateKeys(rows as readonly { readonly [key: string]: unknown }[], childKeyField)) {
      return { ok: false, failure: createFailure("MALFORMED_PERSISTED_STATE", identity) };
    }
  }
  return { ok: true, value: rows };
}

function validatePositionedModule<T extends { readonly destinationId: string; readonly destinationKey: string; readonly position: number }>(rows: readonly T[], identity: ResolvedDestinationIdentity): { ok: true; value: readonly T[] } | { ok: false; failure: PersistedDestinationReadFailure } {
  for (const row of rows) {
    if (
!validateIdentity(row, identity)) {
      return { ok: false, failure: createFailure("MALFORMED_PERSISTED_STATE", identity) };
    }
    if (
!Number.isInteger(row.position) || row.position <= 0) {
      return { ok: false, failure: createFailure("MALFORMED_PERSISTED_STATE", identity) };
    }
  }
  if (
!validatePositionSequence(rows)) {
    return { ok: false, failure: createFailure("MALFORMED_PERSISTED_STATE", identity) };
  }
  return { ok: true, value: rows };
}

function validateSingletonRows<T extends { readonly destinationId: string; readonly destinationKey: string }>(rows: readonly T[], identity: ResolvedDestinationIdentity): { ok: true; value: readonly T[] } | { ok: false; failure: PersistedDestinationReadFailure } {
  for (const row of rows) {
    if (
!validateIdentity(row, identity)) {
      return { ok: false, failure: createFailure("MALFORMED_PERSISTED_STATE", identity) };
    }
  }
  if (rows.length > 1) {
    return { ok: false, failure: createFailure("MALFORMED_PERSISTED_STATE", identity) };
  }
  return { ok: true, value: rows };
}

export async function loadNormalizedPersistedDestinationBundle(identity: ResolvedDestinationIdentity, readPort: PersistedDestinationReadPort): Promise<PersistedDestinationReadResult> {
  const rootResult = await readPort.readRoot(identity);
  if (rootResult.ok === false) {
    return { outcome: "FAILED", failure: createFailure("DB_READ_FAILED", identity) };
  }

  const rootValidation = validateRoot(rootResult.value ?? null, identity);
  if (rootValidation.ok === false) {
    return { outcome: "FAILED", failure: rootValidation.failure };
  }

  const profileResult = await readPort.readProfile(identity);
  if (profileResult.ok === false) {
    return { outcome: "FAILED", failure: createFailure("DB_READ_FAILED", identity) };
  }

  const profileValidation = validateProfile(profileResult.value ?? null, identity);
  if (profileValidation.ok === false) {
    return { outcome: "FAILED", failure: profileValidation.failure };
  }

  const presenceResult = await readPort.readPresence(identity);
  if (presenceResult.ok === false) {
    return { outcome: "FAILED", failure: createFailure("DB_READ_FAILED", identity) };
  }

  const presenceValidation = validatePresenceSet(presenceResult.value ?? null, identity);
  if (presenceValidation.ok === false) {
    return { outcome: "FAILED", failure: presenceValidation.failure };
  }

  const [keyedChildrenResult, replaceModulesResult, singletonsResult] = await Promise.all([
    readPort.readKeyedChildren(identity),
    readPort.readReplaceModules(identity),
    readPort.readSingletons(identity),
  ]);

  if (keyedChildrenResult.ok === false) {
    return { outcome: "FAILED", failure: createFailure("DB_READ_FAILED", identity, keyedChildrenResult.error?.module ?? null) };
  }
  if (replaceModulesResult.ok === false) {
    return { outcome: "FAILED", failure: createFailure("DB_READ_FAILED", identity, replaceModulesResult.error?.module ?? null) };
  }
  if (singletonsResult.ok === false) {
    return { outcome: "FAILED", failure: createFailure("DB_READ_FAILED", identity, singletonsResult.error?.module ?? null) };
  }

  const keyedChildren = keyedChildrenResult.value as PersistedKeyedChildrenRows;
  const replaceModules = replaceModulesResult.value as PersistedReplaceModulesRows;
  const singletons = singletonsResult.value as PersistedSingletonsRows;

  const keyedChildrenValidation = [
    validateModuleRows(keyedChildren.facts, identity, "factKey"),
    validateModuleRows(keyedChildren.scores, identity, "scoreKey"),
    validateModuleRows(keyedChildren.neighborhoods, identity, "neighborhoodKey"),
    validateModuleRows(keyedChildren.places, identity, "placeKey"),
    validateModuleRows(keyedChildren.resources, identity, "resourceKey"),
    validateModuleRows(keyedChildren.media, identity, "mediaKey"),
    validateModuleRows(keyedChildren.propertyResources, identity, "itemKey"),
    validateModuleRows(keyedChildren.moveChecklist, identity, "checklistKey"),
    validateModuleRows(keyedChildren.eventsSeasonality, identity, "eventSeasonalityKey"),
    validateModuleRows(keyedChildren.sources, identity, "sourceKey"),
  ];

  for (const validation of keyedChildrenValidation) {
    if (validation.ok === false) {
      return { outcome: "FAILED", failure: validation.failure };
    }
  }

  const replaceModulesValidation = [
    validateModuleRows(replaceModules.costOfLiving, identity),
    validateModuleRows(replaceModules.climateMonthly, identity),
    validateModuleRows(replaceModules.housing, identity),
    validateModuleRows(replaceModules.healthcare, identity),
    validateModuleRows(replaceModules.visaResidency, identity),
    validateModuleRows(replaceModules.taxesFinance, identity),
    validatePositionedModule(replaceModules.lgbtqInclusivity, identity),
    validateModuleRows(replaceModules.safetyRisks, identity),
    validateModuleRows(replaceModules.transportation, identity),
    validateModuleRows(replaceModules.remoteWork, identity),
    validatePositionedModule(replaceModules.languageIntegration, identity),
    validatePositionedModule(replaceModules.pets, identity),
    validatePositionedModule(replaceModules.familyEducation, identity),
    validatePositionedModule(replaceModules.communitySocial, identity),
    validatePositionedModule(replaceModules.accessibility, identity),
    validatePositionedModule(replaceModules.bureaucracySetup, identity),
    validatePositionedModule(replaceModules.workBusiness, identity),
    validatePositionedModule(replaceModules.retirementAging, identity),
    validatePositionedModule(replaceModules.lifestyleLaws, identity),
    validateModuleRows(replaceModules.realityCheck, identity),
    validateModuleRows(replaceModules.lifestyleFeatures ?? [], identity, "recordKey"),
  ];

  for (const validation of replaceModulesValidation) {
    if (validation.ok === false) {
      return { outcome: "FAILED", failure: validation.failure };
    }
  }

  const singletonValidation = [
    validateSingletonRows(singletons.environmentQuality, identity),
    validateSingletonRows(singletons.dailyLifePracticality, identity),
  ];

  for (const validation of singletonValidation) {
    if (validation.ok === false) {
      return { outcome: "FAILED", failure: validation.failure };
    }
  }

  const normalized = normalizePersistedDestinationRows({
    identity,
    root: rootValidation.value,
    profile: profileValidation.value,
    presence: presenceValidation.value,
    keyedChildren,
    replaceModules,
    singletons,
  });

  return { outcome: "SUCCESS", bundle: normalized };
}
