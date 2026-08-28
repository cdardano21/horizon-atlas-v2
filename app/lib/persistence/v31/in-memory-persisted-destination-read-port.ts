import type { ReadResult, PersistedDestinationReadPort } from "./persisted-destination-read-port";
import type { CanonicalDestinationKey, DestinationId, PersistedPresenceModuleKey, ResolvedDestinationIdentity, StoredDestinationState } from "./types";

const KEYED_CHILD_MODULE_KEYS = ["facts", "scores", "neighborhoods", "places", "resources", "media", "propertyResources", "moveChecklist", "eventsSeasonality", "sources"] as const;
const REPLACE_MODULE_KEYS = [
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
  "lifestyleFeatures",
] as const;
const SINGLETON_MODULE_KEYS = ["environmentQuality", "dailyLifePracticality"] as const;
const ALL_PRESENCE_MODULE_KEYS: readonly PersistedPresenceModuleKey[] = [...KEYED_CHILD_MODULE_KEYS, ...REPLACE_MODULE_KEYS, ...SINGLETON_MODULE_KEYS];

/** These replace-modules are validated as a sequential 1-based position list (see load-normalized-persisted-destination-bundle.ts's validatePositionedModule) - every other module is order-free. */
const POSITIONED_REPLACE_MODULE_KEYS: ReadonlySet<string> = new Set([
  "lgbtqInclusivity",
  "languageIntegration",
  "pets",
  "familyEducation",
  "communitySocial",
  "accessibility",
  "bureaucracySetup",
  "workBusiness",
  "retirementAging",
  "lifestyleLaws",
]);

function withDestinationTag<T extends object>(row: T, destinationId: DestinationId, destinationKey: CanonicalDestinationKey) {
  return { destinationId, destinationKey, ...row };
}

/**
 * Builds a fully in-memory PersistedDestinationReadPort from an already-mapped
 * StoredDestinationState (e.g. via mapCanonicalDestinationToStoredState), with
 * zero network/DB calls. Mirrors the exact read-port contract proven by
 * premium-pilot-dry-run-contract.test.ts, generalized for reuse outside tests
 * (e.g. local, workbook-only destination preview).
 */
export function createInMemoryPersistedDestinationReadPort(identity: ResolvedDestinationIdentity, storedState: StoredDestinationState): PersistedDestinationReadPort {
  const { destinationId, destinationKey } = identity;

  const root = {
    destinationId,
    destinationKey,
    slug: storedState.identity.slug,
    name: storedState.identity.name,
    city: storedState.identity.city,
    country: storedState.identity.country,
  };
  const profile = {
    destinationId,
    destinationKey,
    profileStorageVersion: 1,
    identityName: storedState.identity.name,
    shortDescription: storedState.editorial.shortDescription,
    longDescription: storedState.editorial.longDescription,
    currency: storedState.editorial.currency,
    primaryLanguage: storedState.editorial.primaryLanguage,
    timeZone: storedState.editorial.timeZone,
  };
  const presence = ALL_PRESENCE_MODULE_KEYS.map((module) => ({ destinationId, destinationKey, module }));

  const keyedChildren: Record<string, unknown> = {};
  for (const module of KEYED_CHILD_MODULE_KEYS) {
    keyedChildren[module] = (storedState[module] as readonly object[]).map((row) => withDestinationTag(row, destinationId, destinationKey));
  }

  const replaceModules: Record<string, unknown> = {};
  for (const module of REPLACE_MODULE_KEYS) {
    const rows = (storedState[module] as readonly object[]).map((row) => withDestinationTag(row, destinationId, destinationKey));
    replaceModules[module] = POSITIONED_REPLACE_MODULE_KEYS.has(module) ? rows.map((row, index) => ({ ...row, position: index + 1 })) : rows;
  }

  const singletons: Record<string, unknown> = {};
  for (const module of SINGLETON_MODULE_KEYS) {
    const value = storedState[module];
    singletons[module] = value ? [withDestinationTag(value as object, destinationId, destinationKey)] : [];
  }

  const ok = <T>(value: T): Promise<ReadResult<T, never>> => Promise.resolve({ ok: true, value });

  return {
    readRoot: () => ok(root),
    readProfile: () => ok(profile),
    readPresence: () => ok(presence),
    readKeyedChildren: () => ok(keyedChildren),
    readReplaceModules: () => ok(replaceModules),
    readSingletons: () => ok(singletons),
  };
}
