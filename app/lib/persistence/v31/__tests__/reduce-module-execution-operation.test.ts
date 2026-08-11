import { describe, expect, it } from "vitest";
import { reduceModuleExecutionOperation } from "../reduce-module-execution-operation";
import type { ModuleExecutionOperation, ReplaceModuleExecutionModuleKey, StoredDestinationState } from "../types";

function buildDestinationState(overrides: Partial<StoredDestinationState> = {}): StoredDestinationState {
  const baseState: StoredDestinationState = {
    identity: {
      destinationKey: "dest-1" as StoredDestinationState["identity"]["destinationKey"],
      slug: "dest-1",
      name: "Destination One",
      city: "Destination City",
      country: "Country",
    },
    editorial: {
      shortDescription: null,
      longDescription: null,
      currency: null,
      primaryLanguage: null,
      timeZone: null,
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
    environmentQuality: null,
    dailyLifePracticality: null,
    eventsSeasonality: [],
    sources: [],
  };

  return {
    ...baseState,
    ...overrides,
  };
}

function createPayload(module: ReplaceModuleExecutionModuleKey): any {
  switch (module) {
    case "costOfLiving":
      return { itemKey: "row-1", category: null, monthlyLow: "100", monthlyHigh: "200", currency: null };
    case "climateMonthly":
      return { monthKey: "1", avgHighTemp: "20", avgLowTemp: "10", precipitationMm: "50", humidityPct: "60" };
    case "housing":
      return { summary: "Example", buyingSummary: null, rentalSummary: null };
    case "healthcare":
      return { summary: "Health", publicAccessSummary: null, insuranceSummary: null };
    case "visaResidency":
      return { summary: "Visa", residencyPath: null, citizenshipPath: null };
    case "taxesFinance":
      return { summary: "Taxes", notes: null };
    case "lgbtqInclusivity":
      return { summary: "Inclusive", culturalNotes: null };
    case "safetyRisks":
      return { itemKey: "risk-1", topic: "Crime", severity: null, summary: null };
    case "transportation":
      return { summary: "Transit", airportSummary: null, transitSummary: null };
    case "remoteWork":
      return { summary: "Remote", internetSummary: null, timezoneSummary: null };
    case "languageIntegration":
      return { summary: "English", englishSupport: null };
    case "pets":
      return { summary: "Pets", petFriendlyNotes: null };
    case "familyEducation":
      return { summary: "Education", schoolsSummary: null };
    case "communitySocial":
      return { summary: "Community", socialNotes: null };
    case "accessibility":
      return { summary: "Accessible", mobilityNotes: null };
    case "bureaucracySetup":
      return { summary: "Setup", setupNotes: null };
    case "workBusiness":
      return { summary: "Work", remoteWorkNotes: null };
    case "retirementAging":
      return { summary: "Retirement", agingNotes: null };
    case "lifestyleLaws":
      return { summary: "Laws", legalNotes: null };
    case "realityCheck":
      return { itemKey: "check-1", title: "Check", detail: null, severity: null };
  }
}

function buildReplaceModuleOperation(module: ReplaceModuleExecutionModuleKey, expectedBefore: readonly any[], expectedAfter: readonly any[]): ModuleExecutionOperation {
  return {
    kind: "REPLACE_MODULE",
    module,
    expectedBefore,
    expectedAfter,
  } as ModuleExecutionOperation;
}

describe("module execution reducer", () => {
  it.each([
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
  ] as ReplaceModuleExecutionModuleKey[])("applies REPLACE_MODULE for %s", (module) => {
    const beforePayload = createPayload(module);
    const afterPayload = { ...beforePayload, summary: beforePayload.summary ? `${beforePayload.summary}-updated` : "updated" };
    const state = buildDestinationState({
      facts: [],
      [module]: [beforePayload],
    } as Partial<StoredDestinationState>);

    const operation = buildReplaceModuleOperation(module, [beforePayload], [afterPayload]);
    const result = reduceModuleExecutionOperation(state, operation);

    expect(result.outcome).toBe("APPLIED");
    expect(result.resultingState[module]).toEqual([afterPayload]);
    expect(result.resultingState.facts).toEqual([]);
  });

  it("returns ALREADY_APPLIED when the module already matches the expected after state", () => {
    const module = "costOfLiving" as ReplaceModuleExecutionModuleKey;
    const beforePayload = createPayload(module);
    const afterPayload = { ...beforePayload, monthlyLow: "220" };
    const state = buildDestinationState({ costOfLiving: [afterPayload] } as Partial<StoredDestinationState>);

    const operation = buildReplaceModuleOperation(module, [beforePayload], [afterPayload]);
    const result = reduceModuleExecutionOperation(state, operation);

    expect(result.outcome).toBe("ALREADY_APPLIED");
    expect(result.resultingState).toBe(state);
  });

  it("fails when the current module state does not match expectedBefore", () => {
    const module = "costOfLiving" as ReplaceModuleExecutionModuleKey;
    const beforePayload = createPayload(module);
    const afterPayload = { ...beforePayload, monthlyLow: "220" };
    const driftPayload = { ...beforePayload, monthlyLow: "999" };
    const state = buildDestinationState({ costOfLiving: [driftPayload] } as Partial<StoredDestinationState>);

    const operation = buildReplaceModuleOperation(module, [beforePayload], [afterPayload]);
    const result = reduceModuleExecutionOperation(state, operation);

    expect(result.outcome).toBe("FAILED");
    expect(result.reason).toBe("STALE_PRECONDITION");
    expect(result.resultingState).toBe(state);
  });

  it("uses comparable semantics and preserves immutability", () => {
    const module = "costOfLiving" as ReplaceModuleExecutionModuleKey;
    const beforePayload = createPayload(module);
    const afterPayload = { ...beforePayload, monthlyLow: "220" };
    const state = buildDestinationState({ costOfLiving: [beforePayload] } as Partial<StoredDestinationState>);
    const beforeSnapshot = structuredClone(state);
    const operation = buildReplaceModuleOperation(module, [{ ...beforePayload, monthlyLow: " 100 " }], [afterPayload]);

    const result = reduceModuleExecutionOperation(state, operation);

    expect(beforeSnapshot).toEqual(state);
    expect(result.outcome).toBe("APPLIED");
    expect(result.resultingState).not.toBe(state);
    expect(result.resultingState.costOfLiving).toEqual([afterPayload]);
  });
});
