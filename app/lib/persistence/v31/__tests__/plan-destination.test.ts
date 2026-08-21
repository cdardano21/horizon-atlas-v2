import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

import type { DeterministicV31CanonicalDestination } from "../../../workbook-v31-deterministic-core";
import { buildDestinationPlan } from "../plan-destination";
import { projectComparable } from "../comparable-projection";
import type { OperationManifestInterpretationResult } from "../manifest";
import type { ApprovedDestinationScope, CanonicalDestinationKey, DestinationId, DiffPolicy, ResolvedDestinationIdentity, StoredDestinationState } from "../types";

const DESTINATION_A_KEY = "dest-a" as CanonicalDestinationKey;
const DESTINATION_A_ID = "dest-id-a" as DestinationId;
const DESTINATION_B_KEY = "dest-b" as CanonicalDestinationKey;
const FACT_ONE_KEY = "fact-1" as import("../types").FactKey;
const FACT_TWO_KEY = "fact-2" as import("../types").FactKey;

function createApprovedScope(): ApprovedDestinationScope {
  return Object.freeze([
    Object.freeze({ destinationKey: DESTINATION_A_KEY, destinationId: DESTINATION_A_ID }),
  ]);
}

function createResolvedIdentity(): ResolvedDestinationIdentity {
  return Object.freeze({ destinationKey: DESTINATION_A_KEY, destinationId: DESTINATION_A_ID });
}

function createDiffPolicy(): DiffPolicy {
  return Object.freeze({ updateMode: "MERGE_NONBLANK", normalizationVersion: "v1", diffPolicyVersion: "v1", arrayOrderRule: "stable-key-order" });
}

function createCanonicalDestination(overrides: Record<string, unknown> = {}): DeterministicV31CanonicalDestination {
  return {
    identity: {
      destinationKey: DESTINATION_A_KEY,
      slug: "alpha",
      name: "Alpha",
      city: "Alpha City",
      country: "Country A",
    },
    editorial: {
      shortDescription: "Short",
      longDescription: "Long",
      currency: "USD",
      primaryLanguage: "English",
      timeZone: "UTC",
    },
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
    environmentQuality: {
      air_quality_summary: "Good",
      water_quality_summary: "Clean",
    },
    dailyLifePracticality: {
      grocery_access: "Near grocery",
      things_residents_wish_they_knew: "Easy",
    },
    eventsSeasonality: [],
    sources: [],
    ...overrides,
  } as unknown as DeterministicV31CanonicalDestination;
}

function createStoredState(overrides: Record<string, unknown> = {}): StoredDestinationState {
  return {
    identity: {
      destinationKey: DESTINATION_A_KEY,
      slug: "alpha",
      name: "Alpha",
      city: "Alpha City",
      country: "Country A",
    },
    editorial: {
      shortDescription: "Short",
      longDescription: "Long",
      currency: "USD",
      primaryLanguage: "English",
      timeZone: "UTC",
    },
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
    environmentQuality: {
      summary: "Good",
      qualityNotes: "Clean",
    },
    dailyLifePracticality: {
      summary: "Near grocery",
      practicalityNotes: "Easy",
    },
    eventsSeasonality: [],
    sources: [],
    ...overrides,
  } as unknown as StoredDestinationState;
}

function createManifestInterpretation(entries: readonly import("../types").ManifestEntry[] = [], valid = true, errors: readonly import("../errors").PersistenceError[] = []): OperationManifestInterpretationResult {
  return Object.freeze({
    valid,
    errors,
    warnings: Object.freeze([]),
    interpretedManifest: Object.freeze({ entries: Object.freeze([...entries]) }),
  });
}

describe("destination plan assembly", () => {
  it("returns an unchanged plan for identical canonical and stored state", () => {
    const canonical = createCanonicalDestination();
    const stored = createStoredState();
    const plan = buildDestinationPlan({
      resolvedDestinationIdentity: createResolvedIdentity(),
      canonicalDestination: canonical,
      storedDestinationState: stored,
      manifestInterpretation: createManifestInterpretation(),
      diffPolicy: createDiffPolicy(),
      approvedScope: createApprovedScope(),
    });

    expect(plan.action).toBe("UNCHANGED");
    expect(plan.scalarOperations).toEqual([]);
    expect(plan.childOperations).toEqual([]);
    expect(plan.warnings).toEqual([]);
    expect(plan.errors).toEqual([]);
  });

  it("projects scalar expectations for create update clear preserve and unchanged operations", () => {
    const canonical = createCanonicalDestination({
      editorial: { shortDescription: "Updated short", longDescription: "Long", currency: "USD", primaryLanguage: "English", timeZone: "UTC" },
      environmentQuality: { air_quality_summary: "Great", water_quality_summary: "Clean" },
      dailyLifePracticality: null,
    });
    const stored = createStoredState({
      editorial: { shortDescription: "Original short", longDescription: "Long", currency: "USD", primaryLanguage: "English", timeZone: "UTC" },
      environmentQuality: null,
      dailyLifePracticality: { summary: "Near grocery", practicalityNotes: "Easy" },
    });
    const plan = buildDestinationPlan({
      resolvedDestinationIdentity: createResolvedIdentity(),
      canonicalDestination: canonical,
      storedDestinationState: stored,
      manifestInterpretation: createManifestInterpretation([{ destinationKey: DESTINATION_A_KEY, operation: "CLEAR_FIELD", targetModule: "environmentQuality", targetFieldPath: "qualityNotes" }]),
      diffPolicy: createDiffPolicy(),
      approvedScope: createApprovedScope(),
    });

    expect(plan.scalarOperations).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: "CREATE", module: "environmentQuality", fieldPath: "summary" }),
      expect.objectContaining({ kind: "UPDATE", module: "editorial", fieldPath: "shortDescription" }),
      expect.objectContaining({ kind: "CLEAR", module: "environmentQuality", fieldPath: "qualityNotes" }),
      expect.objectContaining({ kind: "PRESERVE", module: "dailyLifePracticality", fieldPath: "summary" }),
    ]));

    const expectedState = createStoredState({
      editorial: { shortDescription: "Updated short", longDescription: "Long", currency: "USD", primaryLanguage: "English", timeZone: "UTC" },
      environmentQuality: { summary: "Great", qualityNotes: null },
      dailyLifePracticality: { summary: "Near grocery", practicalityNotes: "Easy" },
    });
    expect(plan.expectedComparablePostState).toEqual(projectComparable(expectedState));
  });

  it("preserves checkpoint scalar ordering for manifest clear and diff create on the same field", () => {
    const canonical = createCanonicalDestination({
      environmentQuality: { air_quality_summary: null, water_quality_summary: "Clean" },
    });
    const stored = createStoredState({ environmentQuality: null });
    const plan = buildDestinationPlan({
      resolvedDestinationIdentity: createResolvedIdentity(),
      canonicalDestination: canonical,
      storedDestinationState: stored,
      manifestInterpretation: createManifestInterpretation([{ destinationKey: DESTINATION_A_KEY, operation: "CLEAR_FIELD", targetModule: "environmentQuality", targetFieldPath: "qualityNotes" }]),
      diffPolicy: createDiffPolicy(),
      approvedScope: createApprovedScope(),
    });

    expect(plan.scalarOperations.map((operation) => `${operation.kind}:${operation.module}:${operation.fieldPath}`)).toEqual([
      "CLEAR:environmentQuality:qualityNotes",
      "CREATE:environmentQuality:qualityNotes",
    ]);

    const expectedState = createStoredState({
      environmentQuality: { qualityNotes: null },
    });
    expect(plan.expectedComparablePostState).toEqual(projectComparable(expectedState));
  });

  it("projects create-child expectations by stable child identity", () => {
    const canonical = createCanonicalDestination({
      facts: [{ factKey: "fact-1", factGroup: "quality", valueText: "Alpha", displayLabel: "Alpha", sourceName: "Source" }],
    });
    const stored = createStoredState({ facts: [] });
    const plan = buildDestinationPlan({
      resolvedDestinationIdentity: createResolvedIdentity(),
      canonicalDestination: canonical,
      storedDestinationState: stored,
      manifestInterpretation: createManifestInterpretation(),
      diffPolicy: createDiffPolicy(),
      approvedScope: createApprovedScope(),
    });

    const expectedState = createStoredState({
      facts: [{ factKey: "fact-1", factGroup: "quality", valueText: "Alpha", displayLabel: "Alpha", sourceName: "Source" }],
    });
    expect(plan.expectedComparablePostState).toEqual(projectComparable(expectedState));
  });

  it("projects update-child expectations by stable child identity", () => {
    const canonical = createCanonicalDestination({
      facts: [{ factKey: "fact-1", factGroup: "quality", valueText: "Beta", displayLabel: "Beta", sourceName: "Source" }],
    });
    const stored = createStoredState({
      facts: [{ factKey: "fact-1", factGroup: "quality", valueText: "Alpha", displayLabel: "Alpha", sourceName: "Source" }],
    });
    const plan = buildDestinationPlan({
      resolvedDestinationIdentity: createResolvedIdentity(),
      canonicalDestination: canonical,
      storedDestinationState: stored,
      manifestInterpretation: createManifestInterpretation(),
      diffPolicy: createDiffPolicy(),
      approvedScope: createApprovedScope(),
    });

    const expectedState = createStoredState({
      facts: [{ factKey: "fact-1", factGroup: "quality", valueText: "Beta", displayLabel: "Beta", sourceName: "Source" }],
    });
    expect(plan.expectedComparablePostState).toEqual(projectComparable(expectedState));
  });

  it("projects delete-child expectations by stable child identity", () => {
    const canonical = createCanonicalDestination({ facts: [] });
    const stored = createStoredState({
      facts: [{ factKey: "fact-1", factGroup: "quality", valueText: "Alpha", displayLabel: "Alpha", sourceName: "Source" }],
    });
    const plan = buildDestinationPlan({
      resolvedDestinationIdentity: createResolvedIdentity(),
      canonicalDestination: canonical,
      storedDestinationState: stored,
      manifestInterpretation: createManifestInterpretation([{ destinationKey: DESTINATION_A_KEY, operation: "DELETE_CHILD", targetModule: "facts", targetChildKey: FACT_ONE_KEY }]),
      diffPolicy: createDiffPolicy(),
      approvedScope: createApprovedScope(),
    });

    const expectedState = createStoredState({ facts: [] });
    expect(plan.expectedComparablePostState).toEqual(projectComparable(expectedState));
  });

  it("preserves existing keyed children in the expected comparable post state", () => {
    const canonical = createCanonicalDestination({
      facts: [{ factKey: "fact-1", factGroup: "quality", valueText: "Alpha", displayLabel: "Alpha", sourceName: "Source" }],
    });
    const stored = createStoredState({
      facts: [{ factKey: "fact-1", factGroup: "quality", valueText: "Alpha", displayLabel: "Alpha", sourceName: "Source" }],
    });
    const plan = buildDestinationPlan({
      resolvedDestinationIdentity: createResolvedIdentity(),
      canonicalDestination: canonical,
      storedDestinationState: stored,
      manifestInterpretation: createManifestInterpretation(),
      diffPolicy: createDiffPolicy(),
      approvedScope: createApprovedScope(),
    });

    const expectedState = createStoredState({
      facts: [{ factKey: "fact-1", factGroup: "quality", valueText: "Alpha", displayLabel: "Alpha", sourceName: "Source" }],
    });
    expect(plan.expectedComparablePostState).toEqual(projectComparable(expectedState));
  });

  it("keeps unchanged scalar values stable in the expected comparable post state", () => {
    const canonical = createCanonicalDestination({
      editorial: { shortDescription: "Short", longDescription: "Long", currency: "USD", primaryLanguage: "English", timeZone: "UTC" },
      environmentQuality: { air_quality_summary: "Good", water_quality_summary: "Clean" },
      dailyLifePracticality: { grocery_access: "Near grocery", things_residents_wish_they_knew: "Easy" },
    });
    const stored = createStoredState({
      editorial: { shortDescription: "Short", longDescription: "Long", currency: "USD", primaryLanguage: "English", timeZone: "UTC" },
      environmentQuality: { summary: "Good", qualityNotes: "Clean" },
      dailyLifePracticality: { summary: "Near grocery", practicalityNotes: "Easy" },
    });
    const plan = buildDestinationPlan({
      resolvedDestinationIdentity: createResolvedIdentity(),
      canonicalDestination: canonical,
      storedDestinationState: stored,
      manifestInterpretation: createManifestInterpretation(),
      diffPolicy: createDiffPolicy(),
      approvedScope: createApprovedScope(),
    });

    expect(plan.scalarOperations).toEqual([]);
    expect(plan.expectedComparablePostState).toEqual(projectComparable(stored));
  });

  it("creates scalar operations for singleton field creation", () => {
    const canonical = createCanonicalDestination({ environmentQuality: { air_quality_summary: "Great", water_quality_summary: "Clean" } });
    const stored = createStoredState({ environmentQuality: null });
    const plan = buildDestinationPlan({
      resolvedDestinationIdentity: createResolvedIdentity(),
      canonicalDestination: canonical,
      storedDestinationState: stored,
      manifestInterpretation: createManifestInterpretation(),
      diffPolicy: createDiffPolicy(),
      approvedScope: createApprovedScope(),
    });

    expect(plan.action).toBe("UPDATE");
    expect(plan.scalarOperations).toEqual(expect.arrayContaining([expect.objectContaining({ kind: "CREATE", module: "environmentQuality", fieldPath: "summary" })]));
  });

  it("creates scalar update operations for singleton fields", () => {
    const canonical = createCanonicalDestination({ environmentQuality: { air_quality_summary: "Better", water_quality_summary: "Clean" } });
    const stored = createStoredState({ environmentQuality: { summary: "Good", qualityNotes: "Clean" } });
    const plan = buildDestinationPlan({
      resolvedDestinationIdentity: createResolvedIdentity(),
      canonicalDestination: canonical,
      storedDestinationState: stored,
      manifestInterpretation: createManifestInterpretation(),
      diffPolicy: createDiffPolicy(),
      approvedScope: createApprovedScope(),
    });

    expect(plan.scalarOperations).toEqual(expect.arrayContaining([expect.objectContaining({ kind: "UPDATE", module: "environmentQuality", fieldPath: "summary" })]));
  });

  it("preserves scalar values for blank incoming values under merge nonblank", () => {
    const canonical = createCanonicalDestination({ environmentQuality: { air_quality_summary: null, water_quality_summary: "Clean" } });
    const stored = createStoredState({ environmentQuality: { summary: "Good", qualityNotes: "Clean" } });
    const plan = buildDestinationPlan({
      resolvedDestinationIdentity: createResolvedIdentity(),
      canonicalDestination: canonical,
      storedDestinationState: stored,
      manifestInterpretation: createManifestInterpretation(),
      diffPolicy: createDiffPolicy(),
      approvedScope: createApprovedScope(),
    });

    expect(plan.scalarOperations).toEqual(expect.arrayContaining([expect.objectContaining({ kind: "PRESERVE", module: "environmentQuality", fieldPath: "summary" })]));
  });

  it("does not create CLEAR operations from ordinary blank input", () => {
    const canonical = createCanonicalDestination({ environmentQuality: { air_quality_summary: null, water_quality_summary: "Clean" } });
    const stored = createStoredState({ environmentQuality: { summary: "Good", qualityNotes: "Clean" } });
    const plan = buildDestinationPlan({
      resolvedDestinationIdentity: createResolvedIdentity(),
      canonicalDestination: canonical,
      storedDestinationState: stored,
      manifestInterpretation: createManifestInterpretation(),
      diffPolicy: createDiffPolicy(),
      approvedScope: createApprovedScope(),
    });

    expect(plan.scalarOperations.some((operation) => operation.kind === "CLEAR")).toBe(false);
  });

  it("represents explicit validated CLEAR_FIELD intent as a plan-level clear operation", () => {
    const canonical = createCanonicalDestination({ environmentQuality: { air_quality_summary: null, water_quality_summary: "Clean" } });
    const stored = createStoredState({ environmentQuality: { summary: "Good", qualityNotes: "Clean" } });
    const plan = buildDestinationPlan({
      resolvedDestinationIdentity: createResolvedIdentity(),
      canonicalDestination: canonical,
      storedDestinationState: stored,
      manifestInterpretation: createManifestInterpretation([{ destinationKey: DESTINATION_A_KEY, operation: "CLEAR_FIELD", targetModule: "environmentQuality", targetFieldPath: "summary" }]),
      diffPolicy: createDiffPolicy(),
      approvedScope: createApprovedScope(),
    });

    expect(plan.scalarOperations).toEqual(expect.arrayContaining([expect.objectContaining({ kind: "CLEAR", module: "environmentQuality", fieldPath: "summary" })]));
  });

  it("creates keyed-child create operations", () => {
    const canonical = createCanonicalDestination({ facts: [{ factKey: FACT_ONE_KEY, factGroup: "group", valueText: "incoming", displayLabel: "Incoming", sourceName: "source" }] as unknown as Array<DeterministicV31CanonicalDestination["facts"][number]> });
    const stored = createStoredState();
    const plan = buildDestinationPlan({
      resolvedDestinationIdentity: createResolvedIdentity(),
      canonicalDestination: canonical,
      storedDestinationState: stored,
      manifestInterpretation: createManifestInterpretation(),
      diffPolicy: createDiffPolicy(),
      approvedScope: createApprovedScope(),
    });

    expect(plan.childOperations).toEqual(expect.arrayContaining([expect.objectContaining({ kind: "CREATE_CHILD", module: "facts", stableChildKey: FACT_ONE_KEY })]));
  });

  it("creates keyed-child update operations", () => {
    const canonical = createCanonicalDestination({ facts: [{ factKey: FACT_ONE_KEY, factGroup: "group", valueText: "updated", displayLabel: "Incoming", sourceName: "source" }] as unknown as Array<DeterministicV31CanonicalDestination["facts"][number]> });
    const stored = createStoredState({ facts: [{ factKey: FACT_ONE_KEY, factGroup: "group", valueText: "old", displayLabel: "Incoming", sourceName: "source" }] as unknown as Array<StoredDestinationState["facts"][number]> });
    const plan = buildDestinationPlan({
      resolvedDestinationIdentity: createResolvedIdentity(),
      canonicalDestination: canonical,
      storedDestinationState: stored,
      manifestInterpretation: createManifestInterpretation(),
      diffPolicy: createDiffPolicy(),
      approvedScope: createApprovedScope(),
    });

    expect(plan.childOperations).toEqual(expect.arrayContaining([expect.objectContaining({ kind: "UPDATE_CHILD", module: "facts", stableChildKey: FACT_ONE_KEY })]));
  });

  it("treats semantically equivalent children as unchanged", () => {
    const canonical = createCanonicalDestination({ facts: [{ factKey: FACT_ONE_KEY, factGroup: "group", valueText: "same", displayLabel: "Incoming", sourceName: "source" }] as unknown as Array<DeterministicV31CanonicalDestination["facts"][number]> });
    const stored = createStoredState({ facts: [{ factKey: FACT_ONE_KEY, factGroup: "group", valueText: "same", displayLabel: "Incoming", sourceName: "source" }] as unknown as Array<StoredDestinationState["facts"][number]> });
    const plan = buildDestinationPlan({
      resolvedDestinationIdentity: createResolvedIdentity(),
      canonicalDestination: canonical,
      storedDestinationState: stored,
      manifestInterpretation: createManifestInterpretation(),
      diffPolicy: createDiffPolicy(),
      approvedScope: createApprovedScope(),
    });

    expect(plan.childOperations).toEqual(expect.arrayContaining([expect.objectContaining({ kind: "UNCHANGED_CHILD", module: "facts", stableChildKey: FACT_ONE_KEY })]));
  });

  it("does not infer keyed-child delete from omission", () => {
    const canonical = createCanonicalDestination();
    const stored = createStoredState({ facts: [{ factKey: FACT_ONE_KEY, factGroup: "group", valueText: "existing", displayLabel: "Incoming", sourceName: "source" }] as Array<StoredDestinationState["facts"][number]> });
    const plan = buildDestinationPlan({
      resolvedDestinationIdentity: createResolvedIdentity(),
      canonicalDestination: canonical,
      storedDestinationState: stored,
      manifestInterpretation: createManifestInterpretation(),
      diffPolicy: createDiffPolicy(),
      approvedScope: createApprovedScope(),
    });

    expect(plan.childOperations.some((operation) => operation.kind === "DELETE_CHILD")).toBe(false);
    expect(plan.childOperations).toEqual(expect.arrayContaining([expect.objectContaining({ kind: "PRESERVE_CHILD", module: "facts", stableChildKey: FACT_ONE_KEY })]));
  });

  it("represents validated delete-child intent as a plan delete operation", () => {
    const canonical = createCanonicalDestination();
    const stored = createStoredState({ facts: [{ factKey: FACT_ONE_KEY, factGroup: "group", valueText: "existing", displayLabel: "Incoming", sourceName: "source" }] as unknown as Array<StoredDestinationState["facts"][number]> });
    const plan = buildDestinationPlan({
      resolvedDestinationIdentity: createResolvedIdentity(),
      canonicalDestination: canonical,
      storedDestinationState: stored,
      manifestInterpretation: createManifestInterpretation([{ destinationKey: DESTINATION_A_KEY, operation: "DELETE_CHILD", targetModule: "facts", targetChildKey: FACT_ONE_KEY }]),
      diffPolicy: createDiffPolicy(),
      approvedScope: createApprovedScope(),
    });

    expect(plan.childOperations).toEqual(expect.arrayContaining([expect.objectContaining({ kind: "DELETE_CHILD", module: "facts", stableChildKey: FACT_ONE_KEY })]));
  });

  it("preserves non-keyed modules that differ without replacement authorization", () => {
    const canonical = createCanonicalDestination({ costOfLiving: [{ record_key: "row-1", category: "food", monthly_low: "100", monthly_high: "200", currency: "USD" }] as Array<DeterministicV31CanonicalDestination["costOfLiving"][number]> });
    const stored = createStoredState();
    const plan = buildDestinationPlan({
      resolvedDestinationIdentity: createResolvedIdentity(),
      canonicalDestination: canonical,
      storedDestinationState: stored,
      manifestInterpretation: createManifestInterpretation(),
      diffPolicy: createDiffPolicy(),
      approvedScope: createApprovedScope(),
    });

    expect(plan.warnings).toEqual(expect.arrayContaining([expect.stringContaining("costOfLiving")])) ;
  });

  it("does not replace non-keyed modules from ordinary incoming empty arrays", () => {
    const canonical = createCanonicalDestination({ costOfLiving: [] });
    const stored = createStoredState({ costOfLiving: [{ itemKey: "row-1", category: "food", monthlyLow: "100", monthlyHigh: "200", currency: "USD" }] as Array<StoredDestinationState["costOfLiving"][number]> });
    const plan = buildDestinationPlan({
      resolvedDestinationIdentity: createResolvedIdentity(),
      canonicalDestination: canonical,
      storedDestinationState: stored,
      manifestInterpretation: createManifestInterpretation(),
      diffPolicy: createDiffPolicy(),
      approvedScope: createApprovedScope(),
    });

    expect(plan.warnings).toEqual(expect.arrayContaining([expect.stringContaining("costOfLiving")])) ;
    expect(plan.scalarOperations).toEqual([]);
    expect(plan.childOperations).toEqual([]);
  });

  it("represents explicit REPLACE_MODULE intent in the plan", () => {
    const canonical = createCanonicalDestination({ costOfLiving: [] });
    const stored = createStoredState({ costOfLiving: [{ itemKey: "row-1", category: "food", monthlyLow: "100", monthlyHigh: "200", currency: "USD" }] as Array<StoredDestinationState["costOfLiving"][number]> });
    const plan = buildDestinationPlan({
      resolvedDestinationIdentity: createResolvedIdentity(),
      canonicalDestination: canonical,
      storedDestinationState: stored,
      manifestInterpretation: createManifestInterpretation([{ destinationKey: DESTINATION_A_KEY, operation: "REPLACE_MODULE", targetModule: "costOfLiving" }]),
      diffPolicy: createDiffPolicy(),
      approvedScope: createApprovedScope(),
    });

    expect(plan.warnings).toEqual(expect.arrayContaining([expect.stringContaining("REPLACE_MODULE")])) ;
  });

  it("preserves explicit empty replacement intent distinctly from ordinary empty arrays", () => {
    const canonical = createCanonicalDestination({ costOfLiving: [] });
    const stored = createStoredState({ costOfLiving: [{ itemKey: "row-1", category: "food", monthlyLow: "100", monthlyHigh: "200", currency: "USD" }] as Array<StoredDestinationState["costOfLiving"][number]> });
    const plan = buildDestinationPlan({
      resolvedDestinationIdentity: createResolvedIdentity(),
      canonicalDestination: canonical,
      storedDestinationState: stored,
      manifestInterpretation: createManifestInterpretation([{ destinationKey: DESTINATION_A_KEY, operation: "REPLACE_MODULE", targetModule: "costOfLiving" }]),
      diffPolicy: createDiffPolicy(),
      approvedScope: createApprovedScope(),
    });

    expect(plan.warnings.some((warning) => warning.includes("REPLACE_MODULE") && warning.includes("costOfLiving"))).toBe(true);
  });

  it("assembles execution expectations for replace-module intent and expected comparable post-state", () => {
    const canonical = createCanonicalDestination({
      costOfLiving: [{ record_key: "row-1", category: "food", monthly_low: "110", monthly_high: "220", currency: "USD" }] as Array<DeterministicV31CanonicalDestination["costOfLiving"][number]>,
    });
    const stored = createStoredState({
      costOfLiving: [{ itemKey: "row-1", category: "food", monthlyLow: "100", monthlyHigh: "200", currency: "USD" }] as Array<StoredDestinationState["costOfLiving"][number]>,
    });
    const plan = buildDestinationPlan({
      resolvedDestinationIdentity: createResolvedIdentity(),
      canonicalDestination: canonical,
      storedDestinationState: stored,
      manifestInterpretation: createManifestInterpretation([{ destinationKey: DESTINATION_A_KEY, operation: "REPLACE_MODULE", targetModule: "costOfLiving" }]),
      diffPolicy: createDiffPolicy(),
      approvedScope: createApprovedScope(),
    });

    expect(plan.moduleExecutionOperations).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: "REPLACE_MODULE", module: "costOfLiving" }),
    ]));
    expect(plan.moduleExecutionOperations[0]).toEqual(expect.objectContaining({
      expectedBefore: [expect.objectContaining({ itemKey: "row-1", monthlyLow: "100" })],
      expectedAfter: [expect.objectContaining({ itemKey: "row-1", monthlyLow: "110" })],
    }));

    const expectedState = createStoredState({
      costOfLiving: [{ itemKey: "row-1", category: "food", monthlyLow: "110", monthlyHigh: "220", currency: "USD", stayModeKey: null, verified: null, verifiedAt: null }] as Array<StoredDestinationState["costOfLiving"][number]>,
    });
    expect(plan.expectedComparablePostState).toEqual(projectComparable(expectedState));
  });

  it("projects mixed scalar child and replace-module expectations in the expected comparable post state", () => {
    const canonical = createCanonicalDestination({
      editorial: { shortDescription: "Updated short", longDescription: "Long", currency: "USD", primaryLanguage: "English", timeZone: "UTC" },
      facts: [{ factKey: FACT_ONE_KEY, factGroup: "quality", valueText: "Updated fact", displayLabel: "Updated fact", sourceName: "Source" }],
      costOfLiving: [{ record_key: "row-1", category: "food", monthly_low: "110", monthly_high: "220", currency: "USD" }] as Array<DeterministicV31CanonicalDestination["costOfLiving"][number]>,
    });
    const stored = createStoredState({
      editorial: { shortDescription: "Original short", longDescription: "Long", currency: "USD", primaryLanguage: "English", timeZone: "UTC" },
      facts: [{ factKey: FACT_ONE_KEY, factGroup: "quality", valueText: "Stored fact", displayLabel: "Stored fact", sourceName: "Source" }],
      costOfLiving: [{ itemKey: "row-1", category: "food", monthlyLow: "100", monthlyHigh: "200", currency: "USD" }] as Array<StoredDestinationState["costOfLiving"][number]>,
    });
    const manifestInterpretation = createManifestInterpretation([{ destinationKey: DESTINATION_A_KEY, operation: "REPLACE_MODULE", targetModule: "costOfLiving" }]);
    const canonicalSnapshot = JSON.parse(JSON.stringify(canonical));
    const storedSnapshot = JSON.parse(JSON.stringify(stored));
    const manifestSnapshot = JSON.parse(JSON.stringify(manifestInterpretation));

    const firstPlan = buildDestinationPlan({
      resolvedDestinationIdentity: createResolvedIdentity(),
      canonicalDestination: canonical,
      storedDestinationState: stored,
      manifestInterpretation,
      diffPolicy: createDiffPolicy(),
      approvedScope: createApprovedScope(),
    });
    const secondPlan = buildDestinationPlan({
      resolvedDestinationIdentity: createResolvedIdentity(),
      canonicalDestination: canonical,
      storedDestinationState: stored,
      manifestInterpretation,
      diffPolicy: createDiffPolicy(),
      approvedScope: createApprovedScope(),
    });

    expect(firstPlan.scalarOperations).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: "UPDATE", module: "editorial", fieldPath: "shortDescription" }),
    ]));
    expect(firstPlan.childOperations).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: "UPDATE_CHILD", module: "facts", stableChildKey: FACT_ONE_KEY }),
    ]));
    expect(firstPlan.moduleExecutionOperations).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: "REPLACE_MODULE", module: "costOfLiving" }),
    ]));

    const expectedState = createStoredState({
      editorial: { shortDescription: "Updated short", longDescription: "Long", currency: "USD", primaryLanguage: "English", timeZone: "UTC" },
      facts: [{ factKey: FACT_ONE_KEY, factGroup: "quality", valueText: "Updated fact", displayLabel: "Updated fact", sourceName: "Source" }],
      costOfLiving: [{ itemKey: "row-1", category: "food", monthlyLow: "110", monthlyHigh: "220", currency: "USD", stayModeKey: null, verified: null, verifiedAt: null }] as Array<StoredDestinationState["costOfLiving"][number]>,
    });
    expect(firstPlan.expectedComparablePostState).toEqual(projectComparable(expectedState));

    const staleState = createStoredState({
      editorial: { shortDescription: "Original short", longDescription: "Long", currency: "USD", primaryLanguage: "English", timeZone: "UTC" },
      facts: [{ factKey: FACT_ONE_KEY, factGroup: "quality", valueText: "Stored fact", displayLabel: "Stored fact", sourceName: "Source" }],
      costOfLiving: [{ itemKey: "row-1", category: "food", monthlyLow: "110", monthlyHigh: "220", currency: "USD", stayModeKey: null, verified: null, verifiedAt: null }] as Array<StoredDestinationState["costOfLiving"][number]>,
    });
    expect(firstPlan.expectedComparablePostState).not.toEqual(projectComparable(staleState));

    expect(canonical).toEqual(canonicalSnapshot);
    expect(stored).toEqual(storedSnapshot);
    expect(manifestInterpretation).toEqual(manifestSnapshot);
    expect(firstPlan.expectedComparablePostState).toEqual(secondPlan.expectedComparablePostState);
  });

  it("fails closed on canonical cross-destination mismatch", () => {
    const canonical = createCanonicalDestination({ identity: { ...createCanonicalDestination().identity, destinationKey: DESTINATION_B_KEY } });
    const plan = buildDestinationPlan({
      resolvedDestinationIdentity: createResolvedIdentity(),
      canonicalDestination: canonical,
      storedDestinationState: createStoredState(),
      manifestInterpretation: createManifestInterpretation(),
      diffPolicy: createDiffPolicy(),
      approvedScope: createApprovedScope(),
    });

    expect(plan.action).toBe("ERROR");
    expect(plan.errors.some((error) => error.kind === "CROSS_DESTINATION_REFERENCE")).toBe(true);
  });

  it("fails closed on stored cross-destination mismatch", () => {
    const stored = createStoredState({ identity: { destinationKey: DESTINATION_B_KEY, slug: "beta", name: "Beta", city: "Beta City", country: "Country B" } });
    const plan = buildDestinationPlan({
      resolvedDestinationIdentity: createResolvedIdentity(),
      canonicalDestination: createCanonicalDestination(),
      storedDestinationState: stored,
      manifestInterpretation: createManifestInterpretation(),
      diffPolicy: createDiffPolicy(),
      approvedScope: createApprovedScope(),
    });

    expect(plan.action).toBe("ERROR");
    expect(plan.errors.some((error) => error.kind === "CROSS_DESTINATION_REFERENCE")).toBe(true);
  });

  it("fails closed on invalid manifest interpretation", () => {
    const plan = buildDestinationPlan({
      resolvedDestinationIdentity: createResolvedIdentity(),
      canonicalDestination: createCanonicalDestination(),
      storedDestinationState: createStoredState(),
      manifestInterpretation: createManifestInterpretation([], false, [{ kind: "MANIFEST_CONFLICT", message: "invalid", destinationKey: DESTINATION_A_KEY, target: "facts" }]),
      diffPolicy: createDiffPolicy(),
      approvedScope: createApprovedScope(),
    });

    expect(plan.action).toBe("ERROR");
    expect(plan.errors.some((error) => error.kind === "MANIFEST_CONFLICT")).toBe(true);
  });

  it("orders scalar and child operations deterministically", () => {
    const canonical = createCanonicalDestination({ environmentQuality: { air_quality_summary: "Best", water_quality_summary: "Clean" }, facts: [{ factKey: FACT_ONE_KEY, factGroup: "group", valueText: "incoming", displayLabel: "Incoming", sourceName: "source" }, { factKey: FACT_TWO_KEY, factGroup: "group", valueText: "incoming-two", displayLabel: "Incoming", sourceName: "source" }] as unknown as Array<DeterministicV31CanonicalDestination["facts"][number]> });
    const stored = createStoredState({ environmentQuality: { summary: "Good", qualityNotes: "Clean" }, facts: [{ factKey: FACT_ONE_KEY, factGroup: "group", valueText: "old", displayLabel: "Incoming", sourceName: "source" }] as unknown as Array<StoredDestinationState["facts"][number]> });
    const plan = buildDestinationPlan({
      resolvedDestinationIdentity: createResolvedIdentity(),
      canonicalDestination: canonical,
      storedDestinationState: stored,
      manifestInterpretation: createManifestInterpretation(),
      diffPolicy: createDiffPolicy(),
      approvedScope: createApprovedScope(),
    });

    const scalarOrder = plan.scalarOperations.map((operation) => `${operation.module}:${operation.fieldPath}`).sort();
    const childOrder = plan.childOperations.map((operation) => `${operation.module}:${operation.stableChildKey}:${operation.kind}`).sort();
    expect(plan.scalarOperations.map((operation) => `${operation.module}:${operation.fieldPath}`)).toEqual(scalarOrder);
    expect(plan.childOperations.map((operation) => `${operation.module}:${operation.stableChildKey}:${operation.kind}`)).toEqual(childOrder);
  });

  it("orders warnings and errors deterministically", () => {
    const canonical = createCanonicalDestination({ costOfLiving: [{ record_key: "row-1", category: "food", monthly_low: "100", monthly_high: "200", currency: "USD" }] as Array<DeterministicV31CanonicalDestination["costOfLiving"][number]> });
    const stored = createStoredState();
    const plan = buildDestinationPlan({
      resolvedDestinationIdentity: createResolvedIdentity(),
      canonicalDestination: canonical,
      storedDestinationState: stored,
      manifestInterpretation: createManifestInterpretation([], false, [{ kind: "MANIFEST_CONFLICT", message: "zeta", destinationKey: DESTINATION_A_KEY, target: "facts" }]),
      diffPolicy: createDiffPolicy(),
      approvedScope: createApprovedScope(),
    });

    expect(plan.warnings).toEqual([...plan.warnings].sort());
    expect(plan.errors).toEqual([...plan.errors].sort((left, right) => `${left.kind}:${left.message}`.localeCompare(`${right.kind}:${right.message}`)));
  });

  it("is repeatable within the same process", () => {
    const canonical = createCanonicalDestination({ environmentQuality: { air_quality_summary: "Great", water_quality_summary: "Clean" } });
    const stored = createStoredState({ environmentQuality: null });
    const first = buildDestinationPlan({ resolvedDestinationIdentity: createResolvedIdentity(), canonicalDestination: canonical, storedDestinationState: stored, manifestInterpretation: createManifestInterpretation(), diffPolicy: createDiffPolicy(), approvedScope: createApprovedScope() });
    const second = buildDestinationPlan({ resolvedDestinationIdentity: createResolvedIdentity(), canonicalDestination: canonical, storedDestinationState: stored, manifestInterpretation: createManifestInterpretation(), diffPolicy: createDiffPolicy(), approvedScope: createApprovedScope() });

    expect(first).toEqual(second);
  });

  it("is deterministic across a fresh Node process", () => {
    const tempDir = join(tmpdir(), `plan-destination-fresh-${Date.now()}-${Math.random().toString(16).slice(2)}`);
    mkdirSync(tempDir, { recursive: true });
    const scriptPath = join(tempDir, "plan-harness.mts");
    const planDestinationModule = pathToFileURL(resolve(process.cwd(), "app/lib/persistence/v31/plan-destination.ts")).href;
    const script = `
      import { buildDestinationPlan } from ${JSON.stringify(planDestinationModule)};
      const canonical = {
        identity: { destinationKey: 'dest-a', slug: 'alpha', name: 'Alpha', city: 'Alpha City', country: 'Country A' },
        editorial: { shortDescription: 'Short', longDescription: 'Long', currency: 'USD', primaryLanguage: 'English', timeZone: 'UTC' },
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
        environmentQuality: { air_quality_summary: 'Great', water_quality_summary: 'Clean' },
        dailyLifePracticality: { grocery_access: 'Near grocery', things_residents_wish_they_knew: 'Easy' },
        eventsSeasonality: [],
        sources: []
      };
      const stored = {
        identity: { destinationKey: 'dest-a', slug: 'alpha', name: 'Alpha', city: 'Alpha City', country: 'Country A' },
        editorial: { shortDescription: 'Short', longDescription: 'Long', currency: 'USD', primaryLanguage: 'English', timeZone: 'UTC' },
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
        sources: []
      };
      const plan = buildDestinationPlan({
        resolvedDestinationIdentity: { destinationKey: 'dest-a', destinationId: 'dest-id-a' },
        canonicalDestination: canonical,
        storedDestinationState: stored,
        manifestInterpretation: { valid: true, errors: [], warnings: [], interpretedManifest: { entries: [] } },
        diffPolicy: { updateMode: 'MERGE_NONBLANK', normalizationVersion: 'v1', diffPolicyVersion: 'v1', arrayOrderRule: 'stable-key-order' },
        approvedScope: [{ destinationKey: 'dest-a', destinationId: 'dest-id-a' }],
      });
      console.log(JSON.stringify(plan));
    `;

    try {
      writeFileSync(scriptPath, script, "utf8");
      const first = spawnSync("npx", ["vite-node", "--script", scriptPath], { cwd: process.cwd(), encoding: "utf8" });
      const second = spawnSync("npx", ["vite-node", "--script", scriptPath], { cwd: process.cwd(), encoding: "utf8" });

      expect(first.status).toBe(0);
      expect(second.status).toBe(0);
      expect(first.stdout).toBe(second.stdout);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("does not mutate canonical, stored, manifest, or identity inputs", () => {
    const canonical = createCanonicalDestination({ environmentQuality: { air_quality_summary: "Great", water_quality_summary: "Clean" } });
    const stored = createStoredState({ environmentQuality: null });
    const manifest = createManifestInterpretation([{ destinationKey: DESTINATION_A_KEY, operation: "CLEAR_FIELD", targetModule: "environmentQuality", targetFieldPath: "summary" }]);
    const identity = createResolvedIdentity();
    const canonicalSnapshot = JSON.stringify(canonical);
    const storedSnapshot = JSON.stringify(stored);
    const manifestSnapshot = JSON.stringify(manifest);
    const identitySnapshot = JSON.stringify(identity);

    buildDestinationPlan({ resolvedDestinationIdentity: identity, canonicalDestination: canonical, storedDestinationState: stored, manifestInterpretation: manifest, diffPolicy: createDiffPolicy(), approvedScope: createApprovedScope() });

    expect(JSON.stringify(canonical)).toBe(canonicalSnapshot);
    expect(JSON.stringify(stored)).toBe(storedSnapshot);
    expect(JSON.stringify(manifest)).toBe(manifestSnapshot);
    expect(JSON.stringify(identity)).toBe(identitySnapshot);
  });
});
