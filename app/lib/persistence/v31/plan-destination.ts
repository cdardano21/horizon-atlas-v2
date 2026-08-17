import { diffKeyedChildren } from "./diff-keyed-children";
import { diffNonKeyedRepeatableModule } from "./diff-non-keyed";
import { diffScalar } from "./diff-scalar";
import { diffSingletonModule } from "./diff-non-keyed";
import type { DeterministicV31CanonicalDestination } from "../../workbook-v31-deterministic-core";
import { projectComparable, projectComparableValue } from "./comparable-projection";
import type { ComparableObject, ComparableProjection, ComparableValue } from "./comparable-projection";
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
  ModuleExecutionOperation,
  ReplaceModuleExecutionOperation,
  ReplaceModuleExecutionPayload,
  ReplaceModuleExecutionModuleKey,
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

function sortModuleExecutionOperations(operations: readonly ModuleExecutionOperation[]): readonly ModuleExecutionOperation[] {
  return [...operations].sort((left, right) => {
    const leftKey = `${left.module}:${left.kind}`;
    const rightKey = `${right.module}:${right.kind}`;
    return leftKey.localeCompare(rightKey);
  });
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
        // Raw canonical destination objects parsed directly from a workbook only carry the
        // sheet's snake_case column names (e.g. neighborhood_key) - only facts/scores also get an
        // explicit camelCase alias added during parsing. Falling back to the snake_case column
        // name here lets every keyed-child module resolve a real stable key instead of colliding
        // on `undefined` for any raw canonical destination with more than one child in a module.
        const snakeCaseKeyField = {
          facts: "fact_key",
          scores: "score_key",
          neighborhoods: "neighborhood_key",
          places: "place_key",
          resources: "resource_key",
          media: "media_key",
          propertyResources: "resource_key",
          moveChecklist: "checklist_key",
          eventsSeasonality: "event_season_key",
          sources: "source_key",
        }[module] as string;
        const record = child as Record<string, unknown>;
        return ((record[keyField] as string | null | undefined) ?? (record[snakeCaseKeyField] as string | null | undefined)) as never;
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

function normalizeReplaceModuleExecutionPayload<M extends ReplaceModuleExecutionModuleKey>(module: M, value: unknown): ReplaceModuleExecutionPayload<M> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;

  switch (module) {
    case "costOfLiving":
      return {
        itemKey: (record.itemKey as string | null | undefined) ?? (record.record_key as string | null | undefined) ?? null,
        category: (record.category as string | null | undefined) ?? null,
        monthlyLow: (record.monthlyLow as string | null | undefined) ?? (record.monthly_low as string | null | undefined) ?? null,
        monthlyHigh: (record.monthlyHigh as string | null | undefined) ?? (record.monthly_high as string | null | undefined) ?? null,
        currency: (record.currency as string | null | undefined) ?? null,
      } as ReplaceModuleExecutionPayload<M>;
    case "climateMonthly":
      return {
        monthKey: (record.monthKey as string | null | undefined) ?? (record.month as string | null | undefined) ?? null,
        avgHighTemp: (record.avgHighTemp as string | null | undefined) ?? (record.avg_high_c as string | null | undefined) ?? null,
        avgLowTemp: (record.avgLowTemp as string | null | undefined) ?? (record.avg_low_c as string | null | undefined) ?? null,
        precipitationMm: (record.precipitationMm as string | null | undefined) ?? (record.rainfall_mm as string | null | undefined) ?? null,
        humidityPct: (record.humidityPct as string | null | undefined) ?? (record.humidity_pct as string | null | undefined) ?? null,
      } as ReplaceModuleExecutionPayload<M>;
    case "housing":
      return {
        summary: (record.summary as string | null | undefined) ?? (record.restrictions_summary as string | null | undefined) ?? null,
        buyingSummary: (record.buyingSummary as string | null | undefined) ?? (record.buying_process_summary as string | null | undefined) ?? null,
        rentalSummary: (record.rentalSummary as string | null | undefined) ?? (record.rental_rules_notes as string | null | undefined) ?? null,
      } as ReplaceModuleExecutionPayload<M>;
    case "healthcare":
      return {
        summary: (record.summary as string | null | undefined) ?? (record.system_summary as string | null | undefined) ?? null,
        publicAccessSummary: (record.publicAccessSummary as string | null | undefined) ?? (record.public_access_foreigners as string | null | undefined) ?? null,
        insuranceSummary: (record.insuranceSummary as string | null | undefined) ?? (record.international_insurance_notes as string | null | undefined) ?? null,
      } as ReplaceModuleExecutionPayload<M>;
    case "visaResidency":
      return {
        summary: (record.summary as string | null | undefined) ?? (record.visa_type as string | null | undefined) ?? null,
        residencyPath: (record.residencyPath as string | null | undefined) ?? (record.permanent_residency_path as string | null | undefined) ?? null,
        citizenshipPath: (record.citizenshipPath as string | null | undefined) ?? (record.citizenship_path as string | null | undefined) ?? null,
      } as ReplaceModuleExecutionPayload<M>;
    case "taxesFinance":
      return {
        summary: (record.summary as string | null | undefined) ?? null,
        notes: (record.notes as string | null | undefined) ?? (record.income_tax_notes as string | null | undefined) ?? null,
      } as ReplaceModuleExecutionPayload<M>;
    case "lgbtqInclusivity":
      return {
        summary: (record.summary as string | null | undefined) ?? (record.evidence_summary as string | null | undefined) ?? null,
        culturalNotes: (record.culturalNotes as string | null | undefined) ?? (record.community_scene as string | null | undefined) ?? null,
      } as ReplaceModuleExecutionPayload<M>;
    case "safetyRisks":
      return {
        itemKey: (record.itemKey as string | null | undefined) ?? (record.record_key as string | null | undefined) ?? null,
        topic: (record.topic as string | null | undefined) ?? (record.risk_type as string | null | undefined) ?? null,
        severity: (record.severity as string | null | undefined) ?? null,
        summary: (record.summary as string | null | undefined) ?? null,
      } as ReplaceModuleExecutionPayload<M>;
    case "transportation":
      return {
        summary: (record.summary as string | null | undefined) ?? null,
        airportSummary: (record.airportSummary as string | null | undefined) ?? (record.name as string | null | undefined) ?? null,
        transitSummary: (record.transitSummary as string | null | undefined) ?? (record.public_transit_available as string | null | undefined) ?? null,
      } as ReplaceModuleExecutionPayload<M>;
    case "remoteWork":
      return {
        summary: (record.summary as string | null | undefined) ?? (record.remote_work_notes as string | null | undefined) ?? null,
        internetSummary: (record.internetSummary as string | null | undefined) ?? (record.avg_download_mbps as string | null | undefined) ?? null,
        timezoneSummary: (record.timezoneSummary as string | null | undefined) ?? (record.us_time_zone_fit as string | null | undefined) ?? null,
      } as ReplaceModuleExecutionPayload<M>;
    case "languageIntegration":
      return {
        summary: (record.summary as string | null | undefined) ?? (record.integration_notes as string | null | undefined) ?? null,
        englishSupport: (record.englishSupport as string | null | undefined) ?? (record.can_function_in_english as string | null | undefined) ?? null,
      } as ReplaceModuleExecutionPayload<M>;
    case "pets":
      return {
        summary: (record.summary as string | null | undefined) ?? (record.pet_friendly_rentals as string | null | undefined) ?? null,
        petFriendlyNotes: (record.petFriendlyNotes as string | null | undefined) ?? (record.dog_parks_summary as string | null | undefined) ?? null,
      } as ReplaceModuleExecutionPayload<M>;
    case "familyEducation":
      return {
        summary: (record.summary as string | null | undefined) ?? null,
        schoolsSummary: (record.schoolsSummary as string | null | undefined) ?? (record.universities as string | null | undefined) ?? null,
      } as ReplaceModuleExecutionPayload<M>;
    case "communitySocial":
      return {
        summary: (record.summary as string | null | undefined) ?? null,
        socialNotes: (record.socialNotes as string | null | undefined) ?? (record.clubs_groups as string | null | undefined) ?? null,
      } as ReplaceModuleExecutionPayload<M>;
    case "accessibility":
      return {
        summary: (record.summary as string | null | undefined) ?? (record.mobility_notes as string | null | undefined) ?? null,
        mobilityNotes: (record.mobilityNotes as string | null | undefined) ?? (record.wheelchair_access as string | null | undefined) ?? null,
      } as ReplaceModuleExecutionPayload<M>;
    case "bureaucracySetup":
      return {
        summary: (record.summary as string | null | undefined) ?? null,
        setupNotes: (record.setupNotes as string | null | undefined) ?? (record.typical_documents as string | null | undefined) ?? null,
      } as ReplaceModuleExecutionPayload<M>;
    case "workBusiness":
      return {
        summary: (record.summary as string | null | undefined) ?? (record.employment_notes as string | null | undefined) ?? null,
        remoteWorkNotes: (record.remoteWorkNotes as string | null | undefined) ?? (record.remote_work_suitability as string | null | undefined) ?? null,
      } as ReplaceModuleExecutionPayload<M>;
    case "retirementAging":
      return {
        summary: (record.summary as string | null | undefined) ?? (record.retirement_notes as string | null | undefined) ?? null,
        agingNotes: (record.agingNotes as string | null | undefined) ?? (record.assisted_living as string | null | undefined) ?? null,
      } as ReplaceModuleExecutionPayload<M>;
    case "lifestyleLaws":
      return {
        summary: (record.summary as string | null | undefined) ?? null,
        legalNotes: (record.legalNotes as string | null | undefined) ?? (record.important_rules as string | null | undefined) ?? null,
      } as ReplaceModuleExecutionPayload<M>;
    case "realityCheck":
      return {
        itemKey: (record.itemKey as string | null | undefined) ?? (record.record_key as string | null | undefined) ?? null,
        title: (record.title as string | null | undefined) ?? null,
        detail: (record.detail as string | null | undefined) ?? null,
        severity: (record.severity as string | null | undefined) ?? null,
      } as ReplaceModuleExecutionPayload<M>;
    default:
      return null;
  }
}

function buildReplaceModuleExecutionOperation<M extends ReplaceModuleExecutionModuleKey>(
  module: M,
  currentValue: readonly unknown[],
  incomingValue: readonly unknown[],
): ReplaceModuleExecutionOperation<M> {
  const expectedBefore = (currentValue as readonly unknown[]).map((entry) => normalizeReplaceModuleExecutionPayload(module, entry)).filter((entry): entry is ReplaceModuleExecutionPayload<M> => entry !== null);
  const expectedAfter = (incomingValue as readonly unknown[]).map((entry) => normalizeReplaceModuleExecutionPayload(module, entry)).filter((entry): entry is ReplaceModuleExecutionPayload<M> => entry !== null);

  return {
    kind: "REPLACE_MODULE",
    module,
    expectedBefore,
    expectedAfter,
  };
}

function isComparableObject(value: ComparableValue): value is ComparableObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asComparableObject(value: ComparableValue): ComparableObject | null {
  return isComparableObject(value) ? value : null;
}

function buildModuleExecutionOperations(
  currentState: StoredDestinationState,
  incomingState: DeterministicV31CanonicalDestination,
  replaceModuleEntries: readonly Extract<ManifestEntry, { operation: "REPLACE_MODULE" }>[],
): readonly ModuleExecutionOperation[] {
  const operations: ModuleExecutionOperation[] = [];

  for (const entry of replaceModuleEntries) {
    const module = entry.targetModule as ReplaceModuleExecutionModuleKey;
    const currentValue = currentState[module] as readonly unknown[];
    const incomingValue = incomingState[module] as readonly unknown[];
    operations.push(buildReplaceModuleExecutionOperation(module, currentValue, incomingValue));
  }

  return sortModuleExecutionOperations(operations);
}

function applyScalarExpectation(projection: ComparableProjection, operation: ScalarOperation): ComparableProjection {
  const nextValue = (() => {
    switch (operation.kind) {
      case "CREATE":
      case "UPDATE":
        return projectComparableValue(operation.incomingValue);
      case "CLEAR":
        return null;
      case "UNCHANGED":
        return projectComparableValue(operation.incomingValue);
      case "PRESERVE":
        return projectComparableValue(operation.currentValue);
    }
  })();

  switch (operation.module) {
    case "editorial": {
      const currentEditorial = asComparableObject(projection.editorial);
      const nextEditorial = currentEditorial === null ? {} : { ...currentEditorial };
      switch (operation.fieldPath) {
        case "shortDescription":
          nextEditorial.shortDescription = nextValue;
          break;
        case "longDescription":
          nextEditorial.longDescription = nextValue;
          break;
        case "currency":
          nextEditorial.currency = nextValue;
          break;
        case "primaryLanguage":
          nextEditorial.primaryLanguage = nextValue;
          break;
        case "timeZone":
          nextEditorial.timeZone = nextValue;
          break;
        default:
          return projection;
      }

      return { ...projection, editorial: nextEditorial };
    }
    case "environmentQuality": {
      const currentEnvironmentQuality = asComparableObject(projection.environmentQuality);
      const nextEnvironmentQuality = currentEnvironmentQuality === null ? {} : { ...currentEnvironmentQuality };
      switch (operation.fieldPath) {
        case "summary":
          nextEnvironmentQuality.summary = nextValue;
          break;
        case "qualityNotes":
          nextEnvironmentQuality.qualityNotes = nextValue;
          break;
        default:
          return projection;
      }

      return { ...projection, environmentQuality: nextEnvironmentQuality };
    }
    case "dailyLifePracticality": {
      const currentDailyLifePracticality = asComparableObject(projection.dailyLifePracticality);
      const nextDailyLifePracticality = currentDailyLifePracticality === null ? {} : { ...currentDailyLifePracticality };
      switch (operation.fieldPath) {
        case "summary":
          nextDailyLifePracticality.summary = nextValue;
          break;
        case "practicalityNotes":
          nextDailyLifePracticality.practicalityNotes = nextValue;
          break;
        default:
          return projection;
      }

      return { ...projection, dailyLifePracticality: nextDailyLifePracticality };
    }
    default:
      return projection;
  }
}

function getChildKeyField(module: KeyedChildModuleKey): string {
  return {
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
  }[module];
}

function applyChildExpectation(projection: ComparableProjection, operation: ChildOperation): ComparableProjection {
  const currentChildrenValue = projection[operation.module];
  const currentChildren = Array.isArray(currentChildrenValue) ? currentChildrenValue : [];
  const keyField = getChildKeyField(operation.module);
  const stableChildKey = String(operation.stableChildKey);

  switch (operation.kind) {
    case "CREATE_CHILD": {
      const incomingChild = projectComparableValue(operation.incomingChild);
      const nextChildren = [...currentChildren, incomingChild].sort((left, right) => {
        const leftRecord = asComparableObject(left);
        const rightRecord = asComparableObject(right);
        const leftKey = leftRecord ? String(leftRecord[keyField] ?? "") : "";
        const rightKey = rightRecord ? String(rightRecord[keyField] ?? "") : "";
        return leftKey.localeCompare(rightKey);
      });
      return { ...projection, [operation.module]: nextChildren };
    }
    case "UPDATE_CHILD": {
      const incomingChild = projectComparableValue(operation.incomingChild);
      const nextChildren = currentChildren
        .filter((entry) => {
          const comparableChild = asComparableObject(entry);
          if (comparableChild === null) {
            return true;
          }
          return String(comparableChild[keyField] ?? "") !== stableChildKey;
        })
        .concat(incomingChild)
        .sort((left, right) => {
          const leftRecord = asComparableObject(left);
          const rightRecord = asComparableObject(right);
          const leftKey = leftRecord ? String(leftRecord[keyField] ?? "") : "";
          const rightKey = rightRecord ? String(rightRecord[keyField] ?? "") : "";
          return leftKey.localeCompare(rightKey);
        });
      return { ...projection, [operation.module]: nextChildren };
    }
    case "DELETE_CHILD": {
      const nextChildren = currentChildren.filter((entry) => {
        const comparableChild = asComparableObject(entry);
        if (comparableChild === null) {
          return true;
        }
        return String(comparableChild[keyField] ?? "") !== stableChildKey;
      });
      return { ...projection, [operation.module]: nextChildren };
    }
    case "PRESERVE_CHILD":
    case "UNCHANGED_CHILD":
    default:
      return projection;
  }
}

function buildExpectedComparablePostState(
  currentState: StoredDestinationState,
  incomingState: DeterministicV31CanonicalDestination,
  replaceModuleEntries: readonly Extract<ManifestEntry, { operation: "REPLACE_MODULE" }>[],
  scalarOperations: readonly ScalarOperation[],
  childOperations: readonly ChildOperation[],
): ComparableProjection {
  const expectedState: StoredDestinationState = {
    ...currentState,
    ...Object.fromEntries(
      replaceModuleEntries.map((entry) => {
        const module = entry.targetModule as ReplaceModuleExecutionModuleKey;
        const incomingValue = incomingState[module] as readonly unknown[];
        const normalizedValue = incomingValue
          .map((entryValue) => normalizeReplaceModuleExecutionPayload(module, entryValue))
          .filter((entryValue): entryValue is ReplaceModuleExecutionPayload<ReplaceModuleExecutionModuleKey> => entryValue !== null);

        return [module, normalizedValue];
      }),
    ),
  } as StoredDestinationState;

  let projection = projectComparable(expectedState);
  const fieldOperationGroups = new Map<string, ScalarOperation[]>();

  for (const operation of scalarOperations) {
    const key = `${operation.module}:${operation.fieldPath}`;
    const existing = fieldOperationGroups.get(key) ?? [];
    existing.push(operation);
    fieldOperationGroups.set(key, existing);
  }

  for (const operation of scalarOperations) {
    const key = `${operation.module}:${operation.fieldPath}`;
    const fieldOperations = fieldOperationGroups.get(key) ?? [];
    const hasClear = fieldOperations.some((candidate) => candidate.kind === "CLEAR");
    if (hasClear && operation.kind !== "CLEAR") {
      continue;
    }

    projection = applyScalarExpectation(projection, operation);
  }

  const childOperationGroups = new Map<string, ChildOperation[]>();
  for (const operation of childOperations) {
    const key = `${operation.module}:${operation.stableChildKey}`;
    const existing = childOperationGroups.get(key) ?? [];
    existing.push(operation);
    childOperationGroups.set(key, existing);
  }

  for (const operations of childOperationGroups.values()) {
    const hasDelete = operations.some((operation) => operation.kind === "DELETE_CHILD");
    const operationsToApply = hasDelete ? operations.filter((operation) => operation.kind === "DELETE_CHILD") : operations;

    for (const operation of operationsToApply) {
      projection = applyChildExpectation(projection, operation);
    }
  }

  return projection;
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
  const moduleExecutionOperations = buildModuleExecutionOperations(input.storedDestinationState, input.canonicalDestination, replaceModuleEntries);
  const expectedComparablePostState = buildExpectedComparablePostState(input.storedDestinationState, input.canonicalDestination, replaceModuleEntries, orderedScalarOperations, orderedChildOperations);

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
    moduleExecutionOperations: Object.freeze(moduleExecutionOperations),
    expectedComparablePostState: Object.freeze(expectedComparablePostState),
  });
}
