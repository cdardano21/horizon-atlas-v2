import { diffKeyedChildren } from "./diff-keyed-children";
import { diffNonKeyedRepeatableModule } from "./diff-non-keyed";
import { diffScalar } from "./diff-scalar";
import { diffSingletonModule } from "./diff-non-keyed";
import type { DeterministicV31CanonicalDestination } from "../../workbook-v31-deterministic-core";
import type { PersistenceError } from "./errors";
import type { OperationManifestInterpretationResult } from "./manifest";
import type {
  ApprovedDestinationScope,
  CanonicalDestinationKey,
  ChildOperation,
  ClearFieldManifestEntry,
  DeleteChildManifestEntry,
  DestinationPlan,
  DestinationPlanAction,
  DiffPolicy,
  KeyedChildModuleKey,
  ManifestEntry,
  ResolvedDestinationIdentity,
  ScalarOperation,
  ScalarValue,
  StoredDestinationState,
} from "./types";

export interface BuildDestinationPlanInput {
  readonly resolvedDestinationIdentity: ResolvedDestinationIdentity;
  readonly canonicalDestination: DeterministicV31CanonicalDestination;
  readonly storedDestinationState: StoredDestinationState;
  readonly manifestInterpretation: OperationManifestInterpretationResult;
  readonly diffPolicy: DiffPolicy;
  readonly approvedScope: ApprovedDestinationScope;
}

function makeError(kind: PersistenceError["kind"], message: string, extra: Record<string, unknown>): PersistenceError {
  return { kind, message, ...extra } as PersistenceError;
}

function getDestinationKey(value: { readonly identity?: { readonly destinationKey?: string | CanonicalDestinationKey } } | null | undefined): CanonicalDestinationKey | null {
  if (!value?.identity?.destinationKey) {
    return null;
  }
  return value.identity.destinationKey as CanonicalDestinationKey;
}

function buildFieldPaths(module: "environmentQuality" | "dailyLifePracticality"): readonly string[] {
  return module === "environmentQuality" ? ["summary", "qualityNotes"] : ["summary", "practicalityNotes"];
}

function buildScalarOperationsForSingletonModule(module: "environmentQuality" | "dailyLifePracticality", currentValue: unknown, incomingValue: unknown, policy: DiffPolicy): ScalarOperation[] {
  return Array.from(diffSingletonModule({
    module,
    currentValue,
    incomingValue,
    policy,
    fieldDefinitions: buildFieldPaths(module).map((fieldPath) => ({ fieldPath })),
  }).operations);
}

function buildScalarOperationsForEditorial(fields: readonly { fieldPath: string; currentValue: ScalarValue; incomingValue: ScalarValue }[], policy: DiffPolicy): ScalarOperation[] {
  return fields.map((field) => diffScalar({
    module: "editorial",
    fieldPath: field.fieldPath,
    currentValue: field.currentValue,
    incomingValue: field.incomingValue,
    policy,
  }));
}

function isClearFieldOperation(entry: ManifestEntry): entry is ClearFieldManifestEntry {
  return entry.operation === "CLEAR_FIELD";
}

function isDeleteChildOperation(entry: ManifestEntry): entry is DeleteChildManifestEntry {
  return entry.operation === "DELETE_CHILD";
}

function sortScalarOperations(operations: readonly ScalarOperation[]): readonly ScalarOperation[] {
  return [...operations]
    .filter((operation) => operation.kind !== "UNCHANGED")
    .sort((left, right) => {
    const leftKey = `${left.module}:${left.fieldPath}:${left.kind}`;
    const rightKey = `${right.module}:${right.fieldPath}:${right.kind}`;
    return leftKey.localeCompare(rightKey);
  });
}

function sortChildOperations(operations: readonly ChildOperation[]): readonly ChildOperation[] {
  return [...operations].sort((left, right) => {
    const leftKey = `${left.module}:${left.stableChildKey}:${left.kind}`;
    const rightKey = `${right.module}:${right.stableChildKey}:${right.kind}`;
    return leftKey.localeCompare(rightKey);
  });
}

function sortWarnings(warnings: readonly string[]): readonly string[] {
  return [...warnings].sort((left, right) => left.localeCompare(right));
}

function sortErrors(errors: readonly PersistenceError[]): readonly PersistenceError[] {
  return [...errors].sort((left, right) => {
    const leftKey = `${left.kind}:${left.message}`;
    const rightKey = `${right.kind}:${right.message}`;
    return leftKey.localeCompare(rightKey);
  });
}

function normalizeSingletonModuleValue(module: "environmentQuality" | "dailyLifePracticality", value: unknown): Record<string, ScalarValue> | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;

  if (module === "environmentQuality") {
    return {
      summary: ((record.summary as ScalarValue | undefined) ?? (record.air_quality_summary as ScalarValue | undefined) ?? null),
      qualityNotes: ((record.qualityNotes as ScalarValue | undefined) ?? (record.water_quality_summary as ScalarValue | undefined) ?? null),
    };
  }

  return {
    summary: ((record.summary as ScalarValue | undefined) ?? (record.grocery_access as ScalarValue | undefined) ?? null),
    practicalityNotes: ((record.practicalityNotes as ScalarValue | undefined) ?? (record.things_residents_wish_they_knew as ScalarValue | undefined) ?? null),
  };
}

function buildChildOperations(currentState: StoredDestinationState, incomingState: DeterministicV31CanonicalDestination): readonly ChildOperation[] {
  const modules: KeyedChildModuleKey[] = ["facts", "scores", "neighborhoods", "places", "resources", "media", "propertyResources", "moveChecklist", "eventsSeasonality", "sources"];
  const operations: ChildOperation[] = [];

  for (const module of modules) {
    const currentChildren = currentState[module] as readonly unknown[];
    const incomingChildren = incomingState[module] as readonly unknown[];
    const diffResult = diffKeyedChildren({
      module,
      currentChildren: currentChildren as readonly never[],
      incomingChildren: incomingChildren as readonly never[],
      getStableKey: (child) => {
        const keyField = {
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
        }[module] as string;
        const record = child as Record<string, unknown>;
        return (record[keyField] as string | null | undefined) as never;
      },
    });

    operations.push(...(diffResult as readonly ChildOperation[]));
  }

  return sortChildOperations(operations);
}

function buildModuleWarnings(module: string, hadReplacementIntent: boolean): readonly string[] {
  if (hadReplacementIntent) {
    return [`REPLACE_MODULE:${module}`];
  }
  return [`PRESERVED_BY_POLICY:${module}`];
}

function isSingletonScalarTarget(module: unknown): module is "environmentQuality" | "dailyLifePracticality" {
  return module === "environmentQuality" || module === "dailyLifePracticality";
}

export function buildDestinationPlan(input: BuildDestinationPlanInput): DestinationPlan {
  const errors: PersistenceError[] = [];
  const warnings: string[] = [];
  const scalarOperations: ScalarOperation[] = [];
  const childOperations: ChildOperation[] = [];
  const destinationKey = input.resolvedDestinationIdentity.destinationKey;
  const canonicalDestinationKey = getDestinationKey(input.canonicalDestination);
  const storedDestinationKey = getDestinationKey(input.storedDestinationState);

  if (canonicalDestinationKey !== null && canonicalDestinationKey !== destinationKey) {
    errors.push(makeError("CROSS_DESTINATION_REFERENCE", "Canonical destination identity does not match the resolved destination identity", { expectedDestinationKey: destinationKey, foundDestinationKey: canonicalDestinationKey, module: "facts", childKey: "fact-1" as import("./types").StableChildKey }));
  }

  if (storedDestinationKey !== null && storedDestinationKey !== destinationKey) {
    errors.push(makeError("CROSS_DESTINATION_REFERENCE", "Stored destination identity does not match the resolved destination identity", { expectedDestinationKey: destinationKey, foundDestinationKey: storedDestinationKey, module: "facts", childKey: "fact-1" as import("./types").StableChildKey }));
  }

  if (!input.manifestInterpretation.valid) {
    errors.push(...input.manifestInterpretation.errors);
  }

  const manifestEntries = input.manifestInterpretation.interpretedManifest.entries;
  const clearFieldEntries = manifestEntries.filter(isClearFieldOperation);
  const deleteChildEntries = manifestEntries.filter(isDeleteChildOperation);
  const replaceModuleEntries = manifestEntries.filter((entry): entry is Extract<ManifestEntry, { operation: "REPLACE_MODULE" }> => entry.operation === "REPLACE_MODULE");

  if (clearFieldEntries.length > 0) {
    for (const entry of clearFieldEntries) {
      if (isSingletonScalarTarget(entry.targetModule)) {
        scalarOperations.push({ kind: "CLEAR", module: entry.targetModule, fieldPath: entry.targetFieldPath, currentValue: null, incomingValue: null });
      } else {
        errors.push(makeError("MANIFEST_FIELD_PATH_INVALID", "CLEAR_FIELD target is not a scalar singleton module", { destinationKey: entry.destinationKey, fieldPath: entry.targetFieldPath, module: entry.targetModule }));
      }
    }
  }

  if (deleteChildEntries.length > 0) {
    for (const entry of deleteChildEntries) {
      childOperations.push({ kind: "DELETE_CHILD", module: entry.targetModule, stableChildKey: entry.targetChildKey as import("./types").ChildStableKeyByModule[typeof entry.targetModule], currentChild: null, incomingChild: null } as ChildOperation);
    }
  }

  const nonKeyedModules = ["costOfLiving", "climateMonthly", "housing", "healthcare", "visaResidency", "taxesFinance", "lgbtqInclusivity", "safetyRisks", "transportation", "remoteWork", "languageIntegration", "pets", "familyEducation", "communitySocial", "accessibility", "bureaucracySetup", "workBusiness", "retirementAging", "lifestyleLaws", "realityCheck", "eventsSeasonality", "sources"] as const;

  for (const module of nonKeyedModules) {
    const currentValue = input.storedDestinationState[module as keyof StoredDestinationState] as readonly unknown[];
    const incomingValue = input.canonicalDestination[module as keyof DeterministicV31CanonicalDestination] as readonly unknown[];
    const diffResult = diffNonKeyedRepeatableModule({ module: module as never, currentValue, incomingValue, policy: input.diffPolicy });
    if (diffResult.kind === "MODULE_PRESERVED" || diffResult.kind === "MODULE_DIFFERENT_BUT_REPLACEMENT_NOT_AUTHORIZED") {
      warnings.push(...buildModuleWarnings(module, false));
    }
  }

  for (const entry of replaceModuleEntries) {
    warnings.push(...buildModuleWarnings(entry.targetModule, true));
  }

  const currentEnvironmentQuality = normalizeSingletonModuleValue("environmentQuality", input.storedDestinationState.environmentQuality);
  const incomingEnvironmentQuality = normalizeSingletonModuleValue("environmentQuality", input.canonicalDestination.environmentQuality);
  scalarOperations.push(...buildScalarOperationsForSingletonModule("environmentQuality", currentEnvironmentQuality, incomingEnvironmentQuality, input.diffPolicy));

  const currentDailyLifePracticality = normalizeSingletonModuleValue("dailyLifePracticality", input.storedDestinationState.dailyLifePracticality);
  const incomingDailyLifePracticality = normalizeSingletonModuleValue("dailyLifePracticality", input.canonicalDestination.dailyLifePracticality);
  scalarOperations.push(...buildScalarOperationsForSingletonModule("dailyLifePracticality", currentDailyLifePracticality, incomingDailyLifePracticality, input.diffPolicy));

  const editorialFields = [
    { fieldPath: "shortDescription", currentValue: input.storedDestinationState.editorial.shortDescription, incomingValue: input.canonicalDestination.editorial.shortDescription },
    { fieldPath: "longDescription", currentValue: input.storedDestinationState.editorial.longDescription, incomingValue: input.canonicalDestination.editorial.longDescription },
    { fieldPath: "currency", currentValue: input.storedDestinationState.editorial.currency, incomingValue: input.canonicalDestination.editorial.currency },
    { fieldPath: "primaryLanguage", currentValue: input.storedDestinationState.editorial.primaryLanguage, incomingValue: input.canonicalDestination.editorial.primaryLanguage },
    { fieldPath: "timeZone", currentValue: input.storedDestinationState.editorial.timeZone, incomingValue: input.canonicalDestination.editorial.timeZone },
  ];
  scalarOperations.push(...buildScalarOperationsForEditorial(editorialFields, input.diffPolicy));

  const childOps = buildChildOperations(input.storedDestinationState, input.canonicalDestination);
  childOperations.push(...childOps);

  const orderedScalarOperations = sortScalarOperations(scalarOperations);
  const orderedChildOperations = sortChildOperations(childOperations);
  const orderedWarnings = sortWarnings(warnings);
  const orderedErrors = sortErrors(errors);

  let action: DestinationPlanAction = "UNCHANGED";
  if (orderedErrors.length > 0) {
    action = "ERROR";
  } else if (orderedScalarOperations.length > 0 || orderedChildOperations.length > 0) {
    action = "UPDATE";
  }

  return Object.freeze({
    destinationIdentity: input.resolvedDestinationIdentity,
    action,
    scalarOperations: Object.freeze(orderedScalarOperations),
    childOperations: Object.freeze(orderedChildOperations),
    warnings: Object.freeze(orderedWarnings),
    errors: Object.freeze(orderedErrors),
  });
}
