import type {
  ApprovedDestinationScope,
  CanonicalDestinationKey,
  CanonicalRepeatableModuleKey,
  ClearFieldManifestEntry,
  DeleteChildManifestEntry,
  KeyedChildModuleKey,
  ManifestEntry,
  OperationManifest,
  PersistenceModuleKey,
  ReplaceModuleManifestEntry,
  SingletonModuleKey,
  StableChildKey,
  StoredDestinationState,
} from "./types";
import type { PersistenceError } from "./errors";

export interface ValidateOperationManifestInput {
  readonly manifest: OperationManifest;
  readonly canonicalDestinations: readonly CanonicalDestinationInput[];
  readonly approvedScope: ApprovedDestinationScope;
  readonly storedDestinationStateByKey?: Readonly<Record<CanonicalDestinationKey, StoredDestinationState>>;
}

export interface CanonicalDestinationInput {
  readonly identity: {
    readonly destinationKey: CanonicalDestinationKey;
    readonly slug: string | null;
    readonly name: string | null;
    readonly city: string | null;
    readonly country: string | null;
  };
  readonly [moduleName: string]: unknown;
}

export interface OperationManifestInterpretationResult {
  readonly valid: boolean;
  readonly errors: readonly PersistenceError[];
  readonly warnings: readonly string[];
  readonly interpretedManifest: OperationManifest;
}

const KEYED_CHILD_MODULES: readonly KeyedChildModuleKey[] = [
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
];

const NON_KEYED_REPEATABLE_MODULES: readonly CanonicalRepeatableModuleKey[] = [
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
  "moveChecklist",
  "eventsSeasonality",
  "sources",
  "facts",
  "scores",
  "neighborhoods",
  "places",
  "resources",
  "media",
  "propertyResources",
];

const SINGLETON_MODULE_FIELDS: Readonly<Record<SingletonModuleKey, readonly string[]>> = {
  environmentQuality: ["summary", "qualityNotes"],
  dailyLifePracticality: ["summary", "practicalityNotes"],
};

const SINGLETON_MODULES: readonly SingletonModuleKey[] = ["environmentQuality", "dailyLifePracticality"];

const CHILD_KEY_FIELD_BY_MODULE: Readonly<Record<KeyedChildModuleKey, string>> = {
  facts: "factKey",
  scores: "scoreKey",
  neighborhoods: "neighborhoodKey",
  places: "placeKey",
  resources: "resourceKey",
  media: "mediaKey",
  propertyResources: "itemKey",
  moveChecklist: "checklistKey",
  eventsSeasonality: "eventSeasonalityKey",
  sources: "sourceKey",
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function listCanonicalDestinationKeys(canonicalDestinations: readonly CanonicalDestinationInput[]): readonly CanonicalDestinationKey[] {
  return canonicalDestinations.map((destination) => destination.identity.destinationKey);
}

function buildDestinationLookup(canonicalDestinations: readonly CanonicalDestinationInput[]): ReadonlyMap<CanonicalDestinationKey, CanonicalDestinationInput> {
  const map = new Map<CanonicalDestinationKey, CanonicalDestinationInput>();
  for (const destination of canonicalDestinations) {
    map.set(destination.identity.destinationKey, destination);
  }
  return map;
}

function buildApprovedScopeLookup(approvedScope: ApprovedDestinationScope): ReadonlySet<CanonicalDestinationKey> {
  return new Set(approvedScope.map((entry) => entry.destinationKey));
}

function isKnownFieldPath(module: PersistenceModuleKey, fieldPath: string): boolean {
  if (!SINGLETON_MODULES.includes(module as SingletonModuleKey)) {
    return false;
  }
  const allowed = SINGLETON_MODULE_FIELDS[module as SingletonModuleKey];
  return allowed.includes(fieldPath);
}

function isValidFieldPath(fieldPath: string): boolean {
  if (fieldPath.length === 0) {
    return false;
  }
  if (fieldPath.includes("..") || fieldPath.includes("[") || fieldPath.includes("]") || fieldPath.includes(".") || fieldPath.includes("/") || fieldPath.includes("\\") || fieldPath.includes(" ")) {
    return false;
  }
  if (fieldPath === "__proto__" || fieldPath === "prototype" || fieldPath === "constructor") {
    return false;
  }
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(fieldPath)) {
    return false;
  }
  return true;
}

function moduleExistsInDestination(destination: CanonicalDestinationInput, module: PersistenceModuleKey): boolean {
  return Object.prototype.hasOwnProperty.call(destination, module);
}

function isKeyedChildModule(module: PersistenceModuleKey): module is KeyedChildModuleKey {
  return KEYED_CHILD_MODULES.includes(module as KeyedChildModuleKey);
}

function isNonKeyedRepeatableModule(module: PersistenceModuleKey): module is CanonicalRepeatableModuleKey {
  return NON_KEYED_REPEATABLE_MODULES.includes(module as CanonicalRepeatableModuleKey);
}

function canonicalizeManifestEntry(entry: ManifestEntry): ManifestEntry {
  if (entry.operation === "CLEAR_FIELD") {
    return Object.freeze({
      destinationKey: entry.destinationKey,
      operation: entry.operation,
      targetModule: entry.targetModule,
      targetFieldPath: entry.targetFieldPath,
      reason: entry.reason ?? null,
      operatorNote: entry.operatorNote ?? null,
    }) as ClearFieldManifestEntry;
  }

  if (entry.operation === "DELETE_CHILD") {
    return Object.freeze({
      destinationKey: entry.destinationKey,
      operation: entry.operation,
      targetModule: entry.targetModule,
      targetChildKey: entry.targetChildKey,
      reason: entry.reason ?? null,
      operatorNote: entry.operatorNote ?? null,
    }) as DeleteChildManifestEntry;
  }

  return Object.freeze({
    destinationKey: entry.destinationKey,
    operation: entry.operation,
    targetModule: entry.targetModule,
    reason: entry.reason ?? null,
    operatorNote: entry.operatorNote ?? null,
  }) as ReplaceModuleManifestEntry;
}

function semanticEntryIdentity(entry: ManifestEntry): string {
  if (entry.operation === "CLEAR_FIELD") {
    return `${entry.destinationKey}:${entry.operation}:${entry.targetModule}:${entry.targetFieldPath}`;
  }
  if (entry.operation === "DELETE_CHILD") {
    return `${entry.destinationKey}:${entry.operation}:${entry.targetModule}:${entry.targetChildKey}`;
  }
  return `${entry.destinationKey}:${entry.operation}:${entry.targetModule}`;
}

function compareEntries(left: ManifestEntry, right: ManifestEntry): number {
  const leftKey = semanticEntryIdentity(left);
  const rightKey = semanticEntryIdentity(right);
  if (leftKey < rightKey) {
    return -1;
  }
  if (leftKey > rightKey) {
    return 1;
  }
  return 0;
}

function makeError<T extends PersistenceError>(error: T): T {
  return error;
}

function hasMatchingChild(state: StoredDestinationState, module: KeyedChildModuleKey, targetChildKey: StableChildKey): boolean {
  const childKeyField = CHILD_KEY_FIELD_BY_MODULE[module];
  const values = state[module] as readonly Record<string, unknown>[];
  return values.some((child) => child[childKeyField] === targetChildKey);
}

function validateClearFieldEntry(
  entry: ClearFieldManifestEntry,
  destination: CanonicalDestinationInput,
  errors: PersistenceError[],
): void {
  if (!moduleExistsInDestination(destination, entry.targetModule)) {
    errors.push(makeError({
      kind: "MANIFEST_TARGET_NOT_FOUND",
      message: `Target module ${entry.targetModule} does not exist in the canonical destination`,
      destinationKey: entry.destinationKey,
      target: entry.targetModule,
    }));
    return;
  }

  if (!SINGLETON_MODULES.includes(entry.targetModule as SingletonModuleKey)) {
    errors.push(makeError({
      kind: "MANIFEST_FIELD_PATH_INVALID",
      message: `CLEAR_FIELD is only legal for singleton modules`,
      fieldPath: entry.targetFieldPath,
      module: entry.targetModule,
    }));
    return;
  }

  if (!isValidFieldPath(entry.targetFieldPath)) {
    errors.push(makeError({
      kind: "MANIFEST_FIELD_PATH_INVALID",
      message: `Field path ${entry.targetFieldPath} is not a valid scalar field path`,
      fieldPath: entry.targetFieldPath,
      module: entry.targetModule,
    }));
    return;
  }

  if (!isKnownFieldPath(entry.targetModule, entry.targetFieldPath)) {
    errors.push(makeError({
      kind: "MANIFEST_FIELD_PATH_INVALID",
      message: `Field path ${entry.targetFieldPath} is not a recognized field for module ${entry.targetModule}`,
      fieldPath: entry.targetFieldPath,
      module: entry.targetModule,
    }));
    return;
  }

  if (entry.targetFieldPath === "destinationKey") {
    errors.push(makeError({
      kind: "MANIFEST_FIELD_PATH_INVALID",
      message: `Identity fields cannot be cleared`,
      fieldPath: entry.targetFieldPath,
      module: entry.targetModule,
    }));
  }
}

function validateDeleteChildEntry(
  entry: DeleteChildManifestEntry,
  destination: CanonicalDestinationInput,
  storedDestinationStateByKey: Readonly<Record<CanonicalDestinationKey, StoredDestinationState>> | undefined,
  errors: PersistenceError[],
): void {
  if (!moduleExistsInDestination(destination, entry.targetModule)) {
    errors.push(makeError({
      kind: "MANIFEST_TARGET_NOT_FOUND",
      message: `Target module ${entry.targetModule} does not exist in the canonical destination`,
      destinationKey: entry.destinationKey,
      target: entry.targetModule,
    }));
    return;
  }

  if (!isKeyedChildModule(entry.targetModule)) {
    errors.push(makeError({
      kind: "MANIFEST_TARGET_NOT_FOUND",
      message: `DELETE_CHILD is only legal for keyed child modules`,
      destinationKey: entry.destinationKey,
      target: entry.targetModule,
    }));
    return;
  }

  const state = storedDestinationStateByKey?.[entry.destinationKey];
  if (state) {
    const exists = hasMatchingChild(state, entry.targetModule, entry.targetChildKey);
    if (!exists) {
      errors.push(makeError({
        kind: "DELETE_TARGET_MISSING",
        message: `Target child ${entry.targetChildKey} was not found in module ${entry.targetModule}`,
        destination: entry.destinationKey,
        module: entry.targetModule,
        childKey: entry.targetChildKey,
      }));
    }
  }
}

function validateReplaceModuleEntry(
  entry: ReplaceModuleManifestEntry,
  destination: CanonicalDestinationInput,
  errors: PersistenceError[],
): void {
  if (!moduleExistsInDestination(destination, entry.targetModule)) {
    errors.push(makeError({
      kind: "MANIFEST_TARGET_NOT_FOUND",
      message: `Target module ${entry.targetModule} does not exist in the canonical destination`,
      destinationKey: entry.destinationKey,
      target: entry.targetModule,
    }));
    return;
  }

  if (!isNonKeyedRepeatableModule(entry.targetModule)) {
    errors.push(makeError({
      kind: "MANIFEST_TARGET_NOT_FOUND",
      message: `REPLACE_MODULE is only legal for non-keyed repeatable modules`,
      destinationKey: entry.destinationKey,
      target: entry.targetModule,
    }));
  }
}

export function validateOperationManifest(input: ValidateOperationManifestInput): { readonly valid: boolean; readonly errors: readonly PersistenceError[]; readonly warnings: readonly string[] } {
  const canonicalDestinations = input.canonicalDestinations;
  const approvedScopeLookup = buildApprovedScopeLookup(input.approvedScope);
  const destinationLookup = buildDestinationLookup(canonicalDestinations);
  const canonicalDestinationKeys = new Set(listCanonicalDestinationKeys(canonicalDestinations));
  const errors: PersistenceError[] = [];
  const warnings: string[] = [];

  const sortedEntries = [...input.manifest.entries]
    .map((entry) => canonicalizeManifestEntry(entry))
    .sort(compareEntries);

  const seenSemanticIds = new Set<string>();
  const moduleTargets = new Map<string, Set<string>>();

  for (const entry of sortedEntries) {
    const destinationKey = entry.destinationKey;
    if (!canonicalDestinationKeys.has(destinationKey)) {
      errors.push(makeError({
        kind: "MANIFEST_DESTINATION_NOT_IN_WORKBOOK",
        message: `Destination ${destinationKey} is not present in the canonical workbook input`,
        destinationKey,
      }));
      continue;
    }

    if (!approvedScopeLookup.has(destinationKey)) {
      errors.push(makeError({
        kind: "OUT_OF_SCOPE_DESTINATION",
        message: `Destination ${destinationKey} is not approved for destructive manifest operations`,
        destinationKey,
      }));
      continue;
    }

    const destination = destinationLookup.get(destinationKey);
    if (!destination) {
      continue;
    }

    const semanticId = semanticEntryIdentity(entry);
    if (seenSemanticIds.has(semanticId)) {
      errors.push(makeError({
        kind: "MANIFEST_CONFLICT",
        message: `Duplicate manifest entry ${semanticId}`,
        destinationKey,
        target: semanticId,
      }));
      continue;
    }
    seenSemanticIds.add(semanticId);

    const targetBucket = `${destinationKey}:${entry.targetModule}`;
    const bucketEntries = moduleTargets.get(targetBucket) ?? new Set<string>();
    if (entry.operation === "REPLACE_MODULE") {
      if (bucketEntries.has("REPLACE_MODULE")) {
        errors.push(makeError({
          kind: "MANIFEST_CONFLICT",
          message: `Conflicting REPLACE_MODULE instructions for module ${entry.targetModule}`,
          destinationKey,
          target: entry.targetModule,
        }));
      }
      if (bucketEntries.has("CLEAR_FIELD") || bucketEntries.has("DELETE_CHILD")) {
        errors.push(makeError({
          kind: "MANIFEST_CONFLICT",
          message: `Conflicting destructive instructions for module ${entry.targetModule}`,
          destinationKey,
          target: entry.targetModule,
        }));
      }
    }

    if (entry.operation === "CLEAR_FIELD") {
      if (bucketEntries.has("REPLACE_MODULE")) {
        errors.push(makeError({
          kind: "MANIFEST_CONFLICT",
          message: `Conflicting destructive instructions for module ${entry.targetModule}`,
          destinationKey,
          target: entry.targetModule,
        }));
      }
      bucketEntries.add("CLEAR_FIELD");
    } else if (entry.operation === "DELETE_CHILD") {
      if (bucketEntries.has("REPLACE_MODULE")) {
        errors.push(makeError({
          kind: "MANIFEST_CONFLICT",
          message: `Conflicting destructive instructions for module ${entry.targetModule}`,
          destinationKey,
          target: entry.targetModule,
        }));
      }
      bucketEntries.add("DELETE_CHILD");
    } else {
      bucketEntries.add("REPLACE_MODULE");
    }
    moduleTargets.set(targetBucket, bucketEntries);

    switch (entry.operation) {
      case "CLEAR_FIELD": {
        validateClearFieldEntry(entry, destination, errors);
        break;
      }
      case "DELETE_CHILD": {
        validateDeleteChildEntry(entry, destination, input.storedDestinationStateByKey, errors);
        break;
      }
      case "REPLACE_MODULE": {
        validateReplaceModuleEntry(entry, destination, errors);
        break;
      }
      default: {
        break;
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function interpretOperationManifest(input: ValidateOperationManifestInput): OperationManifestInterpretationResult {
  const baseValidation = validateOperationManifest(input);
  const sortedEntries = [...input.manifest.entries]
    .map((entry) => canonicalizeManifestEntry(entry))
    .sort(compareEntries);

  const interpretedManifest: OperationManifest = Object.freeze({
    entries: Object.freeze(sortedEntries),
  });

  return {
    valid: baseValidation.valid,
    errors: baseValidation.errors,
    warnings: baseValidation.warnings,
    interpretedManifest,
  };
}
