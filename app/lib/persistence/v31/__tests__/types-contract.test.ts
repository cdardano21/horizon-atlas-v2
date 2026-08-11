import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { DeterministicV31CanonicalDestination } from "../../../workbook-v31-deterministic-core";
import type { PersistenceError } from "../errors";
import type {
  ApprovedDestinationScope,
  ApprovedDestinationScopeEntry,
  CanonicalDestinationKey,
  ChildOperation,
  ClearFieldManifestEntry,
  DeleteChildManifestEntry,
  DestinationId,
  DestinationPlan,
  DestinationPlanAction,
  DiffPolicy,
  DriftReport,
  FactKey,
  KeyedChildModuleKey,
  ManifestEntry,
  NonKeyedRepeatableModuleKey,
  OperationManifest,
  PlanEnvelope,
  PlanStatus,
  ReplaceModuleManifestEntry,
  ScalarClearOperation,
  ScalarOperation,
  ScalarPreserveOperation,
  ScalarValue,
  SingletonModuleKey,
  StoredDestinationState,
  ValidationResult,
  MonthKey,
  RepeatableModuleKey,
  ScoreKey,
  StoredFact,
  StoredScore,
  StoredClimateMonth,
} from "../types";
import type { ScalarModuleKey, StoredEditorialStateShape, StoredEnvironmentQualityStateShape, StoredFactShape } from "../types";

const asDestinationKey = (value: string): CanonicalDestinationKey => value as CanonicalDestinationKey;
const asDestinationId = (value: string): DestinationId => value as DestinationId;
const asFactKey = (value: string): FactKey => value as FactKey;
const asScoreKey = (value: string): ScoreKey => value as ScoreKey;

type AssertTrue<T extends true> = T;
type IsEqual<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

const collectTsFiles = (root: string): string[] => {
  const entries = readdirSync(root, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      return collectTsFiles(fullPath);
    }
    if (entry.isFile() && /\.tsx?$/.test(entry.name)) {
      return [fullPath];
    }
    return [];
  });
};

describe("persistence v3.1 types contract", () => {
  it("public exports exist and representative fixtures satisfy the contract", () => {
    const newBraunfels: StoredDestinationState = {
      identity: { destinationKey: asDestinationKey("new-braunfels-tx-us"), slug: "new-braunfels", name: "New Braunfels", city: "New Braunfels", country: "United States" },
      editorial: { shortDescription: "A vibrant Texas Hill Country city", longDescription: "A vibrant Texas Hill Country city", currency: "USD", primaryLanguage: "English", timeZone: "Central" },
      facts: [{ factKey: asFactKey("fact-1"), factGroup: "overview", valueText: "Popular with retirees", displayLabel: "Overview", sourceName: "Workbook editorial research" }],
      scores: [{ scoreKey: asScoreKey("score-1"), scoreValue: "8.4", scoreLabel: "Overall", methodologyVersion: "v3.1" }],
      neighborhoods: [],
      places: [],
      resources: [],
      media: [],
      costOfLiving: [],
      climateMonthly: [],
      housing: [{ summary: "Strong market", buyingSummary: null, rentalSummary: null }],
      propertyResources: [],
      healthcare: [{ summary: "Accessible", publicAccessSummary: null, insuranceSummary: null }],
      visaResidency: [],
      taxesFinance: [],
      lgbtqInclusivity: [],
      safetyRisks: [],
      transportation: [],
      remoteWork: [],
      languageIntegration: [],
      pets: [],
      familyEducation: [],
      communitySocial: [],
      accessibility: [],
      bureaucracySetup: [],
      workBusiness: [],
      retirementAging: [],
      lifestyleLaws: [],
      realityCheck: [],
      moveChecklist: [],
      environmentQuality: null,
      dailyLifePracticality: null,
      eventsSeasonality: [],
      sources: [],
    };

    const lisbon: StoredDestinationState = {
      identity: { destinationKey: asDestinationKey("lisbon-pt"), slug: "lisbon", name: "Lisbon", city: "Lisbon", country: "Portugal" },
      editorial: { shortDescription: "Historic coastal city", longDescription: "Historic coastal city", currency: "EUR", primaryLanguage: "Portuguese", timeZone: "Western Europe" },
      facts: [],
      scores: [],
      neighborhoods: [],
      places: [],
      resources: [],
      media: [],
      costOfLiving: [],
      climateMonthly: [],
      housing: [],
      propertyResources: [],
      healthcare: [],
      visaResidency: [],
      taxesFinance: [],
      lgbtqInclusivity: [],
      safetyRisks: [],
      transportation: [],
      remoteWork: [],
      languageIntegration: [],
      pets: [],
      familyEducation: [],
      communitySocial: [],
      accessibility: [],
      bureaucracySetup: [],
      workBusiness: [],
      retirementAging: [],
      lifestyleLaws: [],
      realityCheck: [],
      moveChecklist: [],
      environmentQuality: null,
      dailyLifePracticality: null,
      eventsSeasonality: [],
      sources: [],
    };

    const summerlin: StoredDestinationState = {
      identity: { destinationKey: asDestinationKey("summerlin-nv-us"), slug: "summerlin", name: "Summerlin", city: "Summerlin", country: "United States" },
      editorial: { shortDescription: "Master-planned desert city", longDescription: "Master-planned desert city", currency: "USD", primaryLanguage: "English", timeZone: "Pacific" },
      facts: [],
      scores: [{ scoreKey: asScoreKey("score-2"), scoreValue: "0", scoreLabel: "Walkability", methodologyVersion: "v3.1" }],
      neighborhoods: [],
      places: [],
      resources: [],
      media: [],
      costOfLiving: [],
      climateMonthly: [],
      housing: [],
      propertyResources: [],
      healthcare: [],
      visaResidency: [],
      taxesFinance: [],
      lgbtqInclusivity: [],
      safetyRisks: [],
      transportation: [],
      remoteWork: [],
      languageIntegration: [],
      pets: [],
      familyEducation: [],
      communitySocial: [],
      accessibility: [],
      bureaucracySetup: [],
      workBusiness: [],
      retirementAging: [],
      lifestyleLaws: [],
      realityCheck: [],
      moveChecklist: [],
      environmentQuality: null,
      dailyLifePracticality: null,
      eventsSeasonality: [],
      sources: [],
    };

    expect(newBraunfels.identity.destinationKey).toBe("new-braunfels-tx-us");
    expect(lisbon.editorial.longDescription).toBe("Historic coastal city");
    expect(summerlin.scores[0]?.scoreValue).toBe("0");
    expect(summerlin.scores[0]?.scoreLabel).toBe("Walkability");
    expect(newBraunfels.housing[0]?.summary).toBe("Strong market");
    expect(newBraunfels.facts[0]?.factGroup).toBe("overview");
  });

  it("discriminated operation unions and manifest entries are structural and explicit", () => {
    const scalarOperation: ScalarOperation = {
      kind: "PRESERVE",
      module: "environmentQuality",
      fieldPath: "summary",
      currentValue: "stored",
      incomingValue: null,
    };

    const childOperation: ChildOperation = {
      kind: "DELETE_CHILD",
      module: "facts",
      stableChildKey: asFactKey("fact-9"),
      currentChild: { factKey: asFactKey("fact-9"), factGroup: "overview", valueText: null, displayLabel: null, sourceName: null },
      incomingChild: null,
    };

    const manifestEntry: ManifestEntry = {
      destinationKey: asDestinationKey("lisbon-pt"),
      operation: "REPLACE_MODULE",
      targetModule: "facts",
      reason: "Explicit module replacement",
    };

    const manifest: OperationManifest = { entries: [manifestEntry] };

    expect(scalarOperation.kind).toBe("PRESERVE");
    expect(childOperation.kind).toBe("DELETE_CHILD");
    expect(manifest.entries[0]?.operation).toBe("REPLACE_MODULE");
  });

  it("supports update policy, scope, plan envelope, and validation shape", () => {
    const policy: DiffPolicy = {
      updateMode: "MERGE_NONBLANK",
      normalizationVersion: "v3.1",
      diffPolicyVersion: "v3.1",
    };

    const approvedScope: ApprovedDestinationScope = [
      { destinationKey: asDestinationKey("new-braunfels-tx-us"), destinationId: asDestinationId("11111111-1111-1111-1111-111111111111") },
    ];

    const plan: DestinationPlan = {
      destinationIdentity: { destinationKey: asDestinationKey("new-braunfels-tx-us"), destinationId: asDestinationId("11111111-1111-1111-1111-111111111111") },
      action: "UPDATE",
      scalarOperations: [],
      childOperations: [],
      warnings: [],
      errors: [],
      preStateHash: null,
      canonicalPayloadHash: null,
    };

    const envelope: PlanEnvelope = {
      planId: null,
      planHash: null,
      workbookHash: null,
      contractSchemaVersion: "v3.1",
      normalizationVersion: "v3.1",
      diffPolicyVersion: "v3.1",
      operationManifestHash: null,
      approvedScope,
      createdAt: null,
      createdBy: null,
      approvedAt: null,
      approvedBy: null,
      expiresAt: null,
      status: "DRAFT",
      destinationPlans: [plan],
    };

    const validation: ValidationResult = { valid: true, errors: [], warnings: [] };
    const drift: DriftReport = {
      destinationKey: asDestinationKey("new-braunfels-tx-us"),
      entries: [{ kind: "scalar", fieldPath: "factGroup", storedValue: "existing", incomingValue: null, willPreserveBecauseMergeNonBlank: true }],
    };

    expect(policy.updateMode).toBe("MERGE_NONBLANK");
    expect(envelope.approvedScope[0]?.destinationId).toBe("11111111-1111-1111-1111-111111111111");
    expect(validation.valid).toBe(true);
    expect(drift.entries[0]?.kind).toBe("scalar");
  });

  it("supports the new execution-preflight error taxonomy", () => {
    const identityConflict: PersistenceError = {
      kind: "PLAN_IDENTITY_CONFLICT",
      message: "Approved scope identity mismatch",
      destinationKey: asDestinationKey("dest-a"),
      destinationId: asDestinationId("dest-id-a"),
      conflictingDestinationKey: asDestinationKey("dest-b"),
      conflictingDestinationId: asDestinationId("dest-id-b"),
      reason: "SCOPE_DESTINATION_ID_MISMATCH",
    };

    const precheckFailure: PersistenceError = {
      kind: "PLAN_EXECUTION_PRECHECK_FAILED",
      message: "Plan cannot execute",
      destinationKey: asDestinationKey("dest-a"),
      planAction: "CREATE",
      planStatus: "DRAFT",
      reason: "UNSUPPORTED_ACTION",
    };

    const diffPolicyMismatch: PersistenceError = {
      kind: "DIFF_POLICY_VERSION_MISMATCH",
      message: "Diff policy version mismatch",
      expectedVersion: "v1",
      receivedVersion: "v2",
    };

    expect(identityConflict.kind).toBe("PLAN_IDENTITY_CONFLICT");
    expect(precheckFailure.reason).toBe("UNSUPPORTED_ACTION");
    expect(diffPolicyMismatch.kind).toBe("DIFF_POLICY_VERSION_MISMATCH");
  });

  it("proves the negative compile-time contract cases", () => {
    // @ts-expect-error DestinationId cannot be assigned as CanonicalDestinationKey.
    const invalidDestinationKey: CanonicalDestinationKey = asDestinationId("destination-id");

    // @ts-expect-error CanonicalDestinationKey cannot be assigned as DestinationId.
    const invalidDestinationId: DestinationId = asDestinationKey("destination-key");

    // @ts-expect-error invalid PLAN_IDENTITY_CONFLICT reason rejected.
    const invalidIdentityConflict: PersistenceError = { kind: "PLAN_IDENTITY_CONFLICT", message: "invalid", destinationKey: asDestinationKey("dest-a"), destinationId: asDestinationId("dest-id-a"), reason: "INVALID_REASON" };

    // @ts-expect-error invalid PLAN_EXECUTION_PRECHECK_FAILED reason rejected.
    const invalidPrecheckFailure: PersistenceError = { kind: "PLAN_EXECUTION_PRECHECK_FAILED", message: "invalid", reason: "INVALID_REASON" };

    // @ts-expect-error DIFF_POLICY_VERSION_MISMATCH requires both expectedVersion and receivedVersion.
    const invalidDiffPolicyVersionMismatch: PersistenceError = { kind: "DIFF_POLICY_VERSION_MISMATCH", message: "invalid" };

    // @ts-expect-error arbitrary plan status string cannot be supplied as PlanStatus.
    const invalidPlanStatus: PlanStatus = "not-a-real-status";

    // @ts-expect-error arbitrary action string cannot be supplied as DestinationPlanAction.
    const invalidPlanAction: DestinationPlanAction = "not-a-real-action";

    // @ts-expect-error CLEAR cannot have non-null incomingValue.
    const invalidClearOperation: ScalarClearOperation = { kind: "CLEAR", module: "facts", fieldPath: "factGroup", currentValue: "stored", incomingValue: "unexpected" };

    // @ts-expect-error PRESERVE cannot have populated incomingValue.
    const invalidPreserveOperation: ScalarPreserveOperation = { kind: "PRESERVE", module: "facts", fieldPath: "factGroup", currentValue: "stored", incomingValue: "unexpected" };

    // @ts-expect-error CREATE_CHILD cannot have a current child.
    const invalidCreateChildOperation: ChildOperation = { kind: "CREATE_CHILD", module: "facts", stableChildKey: asFactKey("fact-1"), currentChild: { factKey: asFactKey("fact-1"), factGroup: null, valueText: null, displayLabel: null, sourceName: null }, incomingChild: { factKey: asFactKey("fact-1"), factGroup: null, valueText: null, displayLabel: null, sourceName: null } };

    // @ts-expect-error score payload cannot be used for facts child operation.
    const invalidChildPayloadModule: ChildOperation = { kind: "UPDATE_CHILD", module: "facts", stableChildKey: asFactKey("fact-1"), currentChild: { factKey: asFactKey("fact-1"), factGroup: null, valueText: null, displayLabel: null, sourceName: null }, incomingChild: { scoreKey: asScoreKey("score-1"), scoreValue: "8.4", scoreLabel: "Overall", methodologyVersion: "v3.1" } };

    // @ts-expect-error singleton module cannot be used as keyed child operation.
    const invalidSingletonChildModule: ChildOperation = { kind: "UPDATE_CHILD", module: "housing", stableChildKey: asFactKey("fact-1"), currentChild: { factKey: asFactKey("fact-1"), factGroup: null, valueText: null, displayLabel: null, sourceName: null }, incomingChild: { factKey: asFactKey("fact-1"), factGroup: null, valueText: null, displayLabel: null, sourceName: null } };

    // @ts-expect-error non-keyed repeatable module cannot be used as keyed child operation.
    const invalidNonKeyedChildModule: ChildOperation = { kind: "UPDATE_CHILD", module: "costOfLiving", stableChildKey: asFactKey("fact-1"), currentChild: { factKey: asFactKey("fact-1"), factGroup: null, valueText: null, displayLabel: null, sourceName: null }, incomingChild: { factKey: asFactKey("fact-1"), factGroup: null, valueText: null, displayLabel: null, sourceName: null } };

    // @ts-expect-error ApprovedDestinationScopeEntry without destinationId fails.
    const invalidScopeEntry: ApprovedDestinationScopeEntry = { destinationKey: asDestinationKey("new-braunfels-tx-us") };

    // @ts-expect-error invalid MonthOfYear fails IF MonthOfYear remains in Phase 3A types.
    const invalidMonthKey: MonthKey = 13;

    // @ts-expect-error one module-specific child key cannot be substituted for another.
    const invalidChildKeySubtype: FactKey = asScoreKey("score-1");

    const editorialScalarOperation: ScalarOperation = { kind: "UPDATE", module: "editorial", fieldPath: "shortDescription", currentValue: "old", incomingValue: "new" };
    const environmentQualityScalarOperation: ScalarOperation = { kind: "UPDATE", module: "environmentQuality", fieldPath: "summary", currentValue: "old", incomingValue: "new" };
    const dailyLifePracticalityScalarOperation: ScalarOperation = { kind: "UPDATE", module: "dailyLifePracticality", fieldPath: "summary", currentValue: "old", incomingValue: "new" };

    // @ts-expect-error ScalarModuleKey rejects identity.
    const invalidIdentityScalarModule: ScalarModuleKey = "identity";

    // @ts-expect-error ScalarModuleKey rejects facts.
    const invalidFactsScalarModule: ScalarModuleKey = "facts";

    // @ts-expect-error SingletonModuleKey rejects editorial.
    const invalidEditorialSingletonModule: SingletonModuleKey = "editorial";

    // @ts-expect-error KeyedChildModuleKey rejects editorial.
    const invalidEditorialKeyedChildModule: KeyedChildModuleKey = "editorial";

    // @ts-expect-error NonKeyedRepeatableModuleKey rejects editorial.
    const invalidEditorialNonKeyedModule: NonKeyedRepeatableModuleKey = "editorial";

    // @ts-expect-error ClearFieldManifestEntry rejects editorial.
    const invalidEditorialClearFieldTarget: ClearFieldManifestEntry["targetModule"] = "editorial";

    // @ts-expect-error DeleteChildManifestEntry rejects editorial.
    const invalidEditorialDeleteTarget: DeleteChildManifestEntry["targetModule"] = "editorial";

    // @ts-expect-error ReplaceModuleManifestEntry rejects editorial.
    const invalidEditorialReplaceTarget: ReplaceModuleManifestEntry["targetModule"] = "editorial";

    // @ts-expect-error ScalarModuleKey rejects invalid scalar module values.
    const invalidScalarModuleValue: ScalarModuleKey = "facts";

    // @ts-expect-error missing canonical persistence field breaks conformance.
    type MissingCanonicalFieldInFacts = AssertTrue<IsEqual<keyof DeterministicV31CanonicalDestination["facts"][number], keyof Pick<StoredDestinationState["facts"][number], "factKey" | "factGroup" | "valueText" | "displayLabel">>>;

    // @ts-expect-error invented persistence field breaks conformance.
    type InventedPersistenceFieldInFacts = AssertTrue<IsEqual<keyof DeterministicV31CanonicalDestination["facts"][number], keyof Pick<StoredDestinationState["facts"][number], "factKey" | "factGroup" | "valueText" | "displayLabel" | "sourceName" | "inventedField">>>;

    // @ts-expect-error wrong persistence field type breaks conformance.
    type WrongPersistenceFieldType = AssertTrue<IsEqual<keyof StoredFactShape<DeterministicV31CanonicalDestination["facts"][number]>, keyof StoredScore>>;

    // @ts-expect-error wrong canonical module cardinality breaks conformance.
    type WrongFactsCardinality = AssertTrue<IsEqual<"singleton", "array">>;

    // @ts-expect-error canonical top-level module omission breaks conformance.
    type DriftedModuleCoverage = AssertTrue<IsEqual<keyof DeterministicV31CanonicalDestination, keyof Pick<StoredDestinationState, "identity" | "editorial" | "facts" | "scores">>>;

    expect(true).toBe(true);
  });

  it("keeps the import boundary free of protected runtime dependencies", () => {
    const packageRoot = path.resolve(process.cwd(), "app/lib/persistence/v31");
    const files = collectTsFiles(packageRoot).filter((file) => !file.includes("/__tests__/") && !file.endsWith(".test.ts") && !file.includes(".test.ts"));

    const forbiddenImports = [
      "workbook-import-engine",
      "premium-v2-storage",
      "destination-enrichment",
      "workbook-new-braunfels-fallback",
      "canonical-destination-loader",
      "@supabase",
      "supabase",
      "/api/",
      "app/components",
      "app/api",
    ];

    for (const file of files) {
      const content = readFileSync(file, "utf8");
      for (const forbiddenImport of forbiddenImports) {
        expect(content).not.toContain(forbiddenImport);
      }
    }
  });

  it("detects explicit any syntax without matching comments or words", () => {
    const packageRoot = path.resolve(process.cwd(), "app/lib/persistence/v31");
    const files = collectTsFiles(packageRoot).filter((file) => !file.includes("/__tests__/") && !file.endsWith(".test.ts") && !file.includes(".test.ts"));

    for (const file of files) {
      const source = readFileSync(file, "utf8");
      const withoutComments = source.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "");
      const explicitAnyPattern = /(^|[^A-Za-z0-9_$])any([^A-Za-z0-9_$]|$)/;
      expect(withoutComments).not.toMatch(explicitAnyPattern);
    }
  });
});
