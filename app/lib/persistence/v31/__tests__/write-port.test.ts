import { describe, expect, it } from "vitest";
import {
  buildDestinationPlanWriteStatements,
  checkExecutionGates,
  executeApprovedDestinationPlanWrite,
  type ExecutionGateCheckInput,
  type SqlExecutionClient,
  type SqlQueryResult,
} from "../write-port";
import type {
  ApprovedDestinationScope,
  CanonicalDestinationKey,
  ChildOperation,
  DestinationId,
  DestinationPlan,
  FactKey,
  ModuleExecutionOperation,
  NeighborhoodKey,
  ResolvedDestinationIdentity,
  ScalarOperation,
  SourceKey,
} from "../types";
import { projectComparable } from "../comparable-projection";
import type { StoredDestinationState } from "../types";

const DEST_KEY = "v31-write-port-test" as CanonicalDestinationKey;
const DEST_ID = "11111111-1111-1111-1111-111111111111" as DestinationId;

function identity(): ResolvedDestinationIdentity {
  return { destinationKey: DEST_KEY, destinationId: DEST_ID };
}

function approvedScope(): ApprovedDestinationScope {
  return [{ destinationKey: DEST_KEY, destinationId: DEST_ID }];
}

function emptyStoredState(): StoredDestinationState {
  return {
    identity: { destinationKey: DEST_KEY, slug: "v31-write-port-test", name: "V31 Write Port Test", city: "Testland City", country: "Testland" },
    editorial: { shortDescription: null, longDescription: null, currency: null, primaryLanguage: null, timeZone: null },
    facts: [], scores: [], neighborhoods: [], places: [], resources: [], media: [],
    costOfLiving: [], climateMonthly: [], housing: [], propertyResources: [], healthcare: [],
    visaResidency: [], taxesFinance: [], lgbtqInclusivity: [], safetyRisks: [], transportation: [],
    remoteWork: [], languageIntegration: [], pets: [], familyEducation: [], communitySocial: [],
    accessibility: [], bureaucracySetup: [], workBusiness: [], retirementAging: [], lifestyleLaws: [],
    realityCheck: [], moveChecklist: [], environmentQuality: null, dailyLifePracticality: null,
    eventsSeasonality: [], sources: [],
  };
}

function basePlan(overrides: Partial<DestinationPlan> = {}): DestinationPlan {
  const state = emptyStoredState();
  return {
    destinationIdentity: identity(),
    action: "UPDATE",
    scalarOperations: [],
    childOperations: [],
    warnings: [],
    errors: [],
    moduleExecutionOperations: [],
    expectedComparablePostState: projectComparable(state),
    ...overrides,
  };
}

function baseGateInput(overrides: Partial<ExecutionGateCheckInput> = {}): ExecutionGateCheckInput {
  return {
    mode: "EXECUTE",
    explicitlyApproveExecution: true,
    contractValid: true,
    unresolvedCount: 0,
    plan: basePlan(),
    approvedScope: approvedScope(),
    batchRunId: "batch-run-1",
    ...overrides,
  };
}

describe("write-port execution gates", () => {
  it("accepts a fully valid input", () => {
    expect(checkExecutionGates(baseGateInput())).toEqual({ ok: true });
  });

  it("rejects when mode is not EXECUTE", () => {
    const result = checkExecutionGates(baseGateInput({ mode: "DRY_RUN" }));
    expect(result).toEqual({ ok: false, reason: "MODE_NOT_EXECUTE", message: expect.any(String) });
  });

  it("rejects when execution was not explicitly approved", () => {
    const result = checkExecutionGates(baseGateInput({ explicitlyApproveExecution: false }));
    expect(result.ok).toBe(false);
    expect((result as { reason: string }).reason).toBe("EXECUTION_NOT_EXPLICITLY_APPROVED");
  });

  it("rejects when the contract is invalid", () => {
    const result = checkExecutionGates(baseGateInput({ contractValid: false }));
    expect((result as { reason: string }).reason).toBe("CONTRACT_INVALID");
  });

  it("rejects when unresolved count is nonzero", () => {
    const result = checkExecutionGates(baseGateInput({ unresolvedCount: 1 }));
    expect((result as { reason: string }).reason).toBe("UNRESOLVED_COUNT_NONZERO");
  });

  it("rejects a plan with action ERROR", () => {
    const result = checkExecutionGates(baseGateInput({ plan: basePlan({ action: "ERROR" }) }));
    expect((result as { reason: string }).reason).toBe("PLAN_ACTION_UNSUPPORTED");
  });

  it("rejects a hand-crafted plan with action CREATE, keeping one authority with validatePlanEnvelopeForExecution", () => {
    // buildDestinationPlan never actually emits action "CREATE" in real usage - only UNCHANGED,
    // UPDATE, or ERROR. This proves the write port refuses a hand-written CREATE-action plan the
    // same way validatePlanEnvelopeForExecution already does, so there is one consistent rule.
    const result = checkExecutionGates(baseGateInput({ plan: basePlan({ action: "CREATE" }) }));
    expect((result as { reason: string }).reason).toBe("PLAN_ACTION_UNSUPPORTED");
  });

  it("rejects a plan that has execution-blocking errors", () => {
    const result = checkExecutionGates(baseGateInput({
      plan: basePlan({ errors: [{ kind: "OUT_OF_SCOPE_DESTINATION", message: "boom", destinationKey: DEST_KEY }] }),
    }));
    expect((result as { reason: string }).reason).toBe("PLAN_HAS_ERRORS");
  });

  it("rejects a destination outside the approved scope", () => {
    const result = checkExecutionGates(baseGateInput({ approvedScope: [] }));
    expect((result as { reason: string }).reason).toBe("DESTINATION_OUTSIDE_APPROVED_SCOPE");
  });

  it("rejects when the approved scope destination_id does not match the plan", () => {
    const result = checkExecutionGates(baseGateInput({
      approvedScope: [{ destinationKey: DEST_KEY, destinationId: "different-id" as DestinationId }],
    }));
    expect((result as { reason: string }).reason).toBe("APPROVED_SCOPE_IDENTITY_MISMATCH");
  });

  it("rejects when no batch/audit run id is provided", () => {
    const result = checkExecutionGates(baseGateInput({ batchRunId: null }));
    expect((result as { reason: string }).reason).toBe("MISSING_BATCH_RUN_ID");
  });

  it("rejects a missing destination_key", () => {
    const result = checkExecutionGates(baseGateInput({
      plan: basePlan({ destinationIdentity: { destinationKey: "" as CanonicalDestinationKey, destinationId: DEST_ID } }),
    }));
    expect((result as { reason: string }).reason).toBe("MISSING_DESTINATION_KEY");
  });
});

describe("write-port statement translation", () => {
  it("produces no statements for a plan with no operations", () => {
    expect(buildDestinationPlanWriteStatements(basePlan())).toEqual([]);
  });

  it("translates a scalar CREATE on the editorial module into an upsert of premium_destination_profiles", () => {
    const scalarOperations: ScalarOperation[] = [
      { kind: "CREATE", module: "editorial", fieldPath: "shortDescription", currentValue: null, incomingValue: "A disposable synthetic test destination." },
    ];
    const statements = buildDestinationPlanWriteStatements(basePlan({ scalarOperations }));
    expect(statements).toHaveLength(1);
    expect(statements[0].text).toContain("premium_destination_profiles");
    expect(statements[0].text).toContain("summary = $3");
    expect(statements[0].values).toEqual([DEST_ID, DEST_KEY, "A disposable synthetic test destination."]);
  });

  it("translates a scalar CLEAR into setting the column to null explicitly", () => {
    const scalarOperations: ScalarOperation[] = [
      { kind: "CLEAR", module: "editorial", fieldPath: "shortDescription", currentValue: "old", incomingValue: null },
    ];
    const statements = buildDestinationPlanWriteStatements(basePlan({ scalarOperations }));
    expect(statements).toHaveLength(1);
    expect(statements[0].values).toEqual([DEST_ID, DEST_KEY, null]);
  });

  it("does not emit any statement for PRESERVE or UNCHANGED scalar operations", () => {
    const scalarOperations: ScalarOperation[] = [
      { kind: "PRESERVE", module: "editorial", fieldPath: "shortDescription", currentValue: "keep me", incomingValue: null },
      { kind: "UNCHANGED", module: "editorial", fieldPath: "currency", currentValue: "USD", incomingValue: "USD" },
    ];
    expect(buildDestinationPlanWriteStatements(basePlan({ scalarOperations }))).toEqual([]);
  });

  it("translates CREATE_CHILD for neighborhoods into an upsert plus a module-presence insert", () => {
    const childOperations: ChildOperation[] = [
      {
        kind: "CREATE_CHILD",
        module: "neighborhoods",
        stableChildKey: "hood-1" as NeighborhoodKey,
        currentChild: null,
        incomingChild: { neighborhoodKey: "hood-1" as NeighborhoodKey, name: "Testland Heights", summary: "A synthetic neighborhood.", areaType: "urban" },
      },
    ];
    const statements = buildDestinationPlanWriteStatements(basePlan({ childOperations }));
    expect(statements).toHaveLength(2);
    expect(statements[0].text).toContain("premium_neighborhoods");
    expect(statements[0].text).toContain("on conflict (destination_id, destination_key, neighborhood_key)");
    expect(statements[1].text).toContain("premium_destination_module_presence");
    expect(statements[1].values).toEqual([DEST_ID, DEST_KEY, "neighborhoods"]);
  });

  it("falls back to raw canonical snake_case field names for keyed-child payloads that were never given a camelCase alias upstream", () => {
    // Real canonical destinations parsed from a workbook only carry raw sheet column names
    // (e.g. neighborhood_name) for every keyed-child module except facts/scores - this proves the
    // write port itself is robust to that shape instead of silently inserting nulls.
    const childOperations: ChildOperation[] = [
      {
        kind: "CREATE_CHILD",
        module: "neighborhoods",
        stableChildKey: "hood-1" as NeighborhoodKey,
        currentChild: null,
        incomingChild: { neighborhood_key: "hood-1", neighborhood_name: "Snake Case Heights", summary: "ok", area_type: "urban" } as any,
      },
    ];
    const statements = buildDestinationPlanWriteStatements(basePlan({ childOperations }));
    expect(statements[0].values).toEqual([DEST_ID, DEST_KEY, "hood-1", "Snake Case Heights", "ok", "urban"]);
  });

  it("translates DELETE_CHILD for sources into a targeted delete with no presence insert", () => {
    const childOperations: ChildOperation[] = [
      {
        kind: "DELETE_CHILD",
        module: "sources",
        stableChildKey: "source-1" as SourceKey,
        currentChild: { sourceKey: "source-1" as SourceKey, name: "Old Source", url: "https://example-test.invalid/source", type: "gov" },
        incomingChild: null,
      },
    ];
    const statements = buildDestinationPlanWriteStatements(basePlan({ childOperations }));
    expect(statements).toHaveLength(1);
    expect(statements[0].text).toContain("delete from public.premium_sources");
    expect(statements[0].values).toEqual([DEST_ID, DEST_KEY, "source-1"]);
  });

  it("does not emit any statement for PRESERVE_CHILD or UNCHANGED_CHILD", () => {
    const childOperations: ChildOperation[] = [
      {
        kind: "PRESERVE_CHILD",
        module: "facts",
        stableChildKey: "fact-1" as FactKey,
        currentChild: { factKey: "fact-1" as FactKey, factGroup: null, valueText: "keep", displayLabel: null, sourceName: null },
        incomingChild: null,
      },
    ];
    expect(buildDestinationPlanWriteStatements(basePlan({ childOperations }))).toEqual([]);
  });

  it("translates a REPLACE_MODULE operation for a record_key-group module (costOfLiving) into delete-then-reinsert plus presence", () => {
    const moduleExecutionOperations: ModuleExecutionOperation[] = [
      {
        kind: "REPLACE_MODULE",
        module: "costOfLiving",
        expectedBefore: [],
        expectedAfter: [
          { itemKey: "old-1" as any, category: "housing", monthlyLow: "1200", monthlyHigh: "1800", currency: "USD" },
          { itemKey: "old-2" as any, category: "groceries", monthlyLow: "300", monthlyHigh: "500", currency: "USD" },
        ],
      },
    ];
    const statements = buildDestinationPlanWriteStatements(basePlan({ moduleExecutionOperations }));
    expect(statements).toHaveLength(4);
    expect(statements[0].text).toBe("delete from public.premium_cost_of_living where destination_id = $1 and destination_key = $2");
    expect(statements[0].values).toEqual([DEST_ID, DEST_KEY]);
    expect(statements[1].text).toContain("insert into public.premium_cost_of_living");
    expect(statements[1].text).toContain("record_key");
    expect(statements[1].values).toEqual([DEST_ID, DEST_KEY, "record-1", "housing", "1200", "1800", "USD"]);
    expect(statements[2].values).toEqual([DEST_ID, DEST_KEY, "record-2", "groceries", "300", "500", "USD"]);
    expect(statements[3].text).toContain("premium_destination_module_presence");
    expect(statements[3].values).toEqual([DEST_ID, DEST_KEY, "costOfLiving"]);
  });

  it("translates a REPLACE_MODULE operation for a position-group module (pets) into delete-then-reinsert with sequential positions", () => {
    const moduleExecutionOperations: ModuleExecutionOperation[] = [
      {
        kind: "REPLACE_MODULE",
        module: "pets",
        expectedBefore: [],
        expectedAfter: [
          { summary: "Pet-friendly overall", petFriendlyNotes: "Many parks" },
        ],
      },
    ];
    const statements = buildDestinationPlanWriteStatements(basePlan({ moduleExecutionOperations }));
    expect(statements).toHaveLength(3);
    expect(statements[0].text).toBe("delete from public.premium_pets where destination_id = $1 and destination_key = $2");
    expect(statements[1].text).toContain("position");
    expect(statements[1].values).toEqual([DEST_ID, DEST_KEY, 1, "Pet-friendly overall", "Many parks"]);
    expect(statements[2].values).toEqual([DEST_ID, DEST_KEY, "pets"]);
  });

  it("still deletes existing rows but skips presence insert when a REPLACE_MODULE has an empty expectedAfter", () => {
    const moduleExecutionOperations: ModuleExecutionOperation[] = [
      { kind: "REPLACE_MODULE", module: "healthcare", expectedBefore: [{ summary: "old" } as any], expectedAfter: [] },
    ];
    const statements = buildDestinationPlanWriteStatements(basePlan({ moduleExecutionOperations }));
    expect(statements).toHaveLength(1);
    expect(statements[0].text).toBe("delete from public.premium_healthcare_insurance where destination_id = $1 and destination_key = $2");
  });

  it("maps all 20 non-keyed REPLACE_MODULE modules to a distinct, non-empty target table without throwing", () => {
    // TypeScript's Record<ReplaceModuleExecutionModuleKey, ...> mapped type already forces
    // compile-time exhaustiveness over every module key; this proves the runtime SQL generation
    // also succeeds for every one of them and targets 20 distinct tables (no accidental collisions).
    const allTwentyModules = [
      "costOfLiving", "climateMonthly", "housing", "healthcare", "visaResidency", "taxesFinance",
      "safetyRisks", "transportation", "remoteWork", "realityCheck",
      "lgbtqInclusivity", "languageIntegration", "pets", "familyEducation", "communitySocial",
      "accessibility", "bureaucracySetup", "workBusiness", "retirementAging", "lifestyleLaws",
    ] as const;
    expect(allTwentyModules).toHaveLength(20);

    const moduleExecutionOperations: ModuleExecutionOperation[] = allTwentyModules.map((module) => ({
      kind: "REPLACE_MODULE",
      module,
      expectedBefore: [],
      expectedAfter: [{ summary: `synthetic value for ${module}` } as any],
    }));

    const statements = buildDestinationPlanWriteStatements(basePlan({ moduleExecutionOperations }));
    const insertTables = statements
      .filter((statement) => statement.text.startsWith("insert into public.") && !statement.text.includes("module_presence"))
      .map((statement) => statement.text.match(/insert into public\.(\w+)/)?.[1]);
    expect(new Set(insertTables).size).toBe(20);
  });
});

function createFakeClient(overrides: Partial<SqlExecutionClient> = {}): { client: SqlExecutionClient; calls: string[] } {
  const calls: string[] = [];
  const client: SqlExecutionClient = {
    async query(text: string): Promise<SqlQueryResult> {
      calls.push(text);
      return { rows: [], rowCount: 0 };
    },
    ...overrides,
  };
  return { client, calls };
}

describe("write-port transactional execution", () => {
  it("performs zero writes when an execution gate fails", async () => {
    const { client, calls } = createFakeClient();
    const result = await executeApprovedDestinationPlanWrite(client, baseGateInput({ mode: "DRY_RUN" }));
    expect(result.outcome).toBe("GATE_REJECTED");
    expect(calls).toEqual([]);
  });

  it("returns NO_OP and issues no SQL when the plan has no operations", async () => {
    const { client, calls } = createFakeClient();
    const result = await executeApprovedDestinationPlanWrite(client, baseGateInput());
    expect(result.outcome).toBe("NO_OP");
    expect(calls).toEqual([]);
  });

  it("wraps multiple statements in BEGIN/COMMIT on success", async () => {
    const { client, calls } = createFakeClient();
    const scalarOperations: ScalarOperation[] = [
      { kind: "CREATE", module: "editorial", fieldPath: "shortDescription", currentValue: null, incomingValue: "Synthetic." },
    ];
    const result = await executeApprovedDestinationPlanWrite(client, baseGateInput({ plan: basePlan({ scalarOperations }) }));
    expect(result.outcome).toBe("SUCCESS");
    expect(calls[0]).toBe("BEGIN");
    expect(calls[calls.length - 1]).toBe("COMMIT");
  });

  it("rolls back and reports FAILED if a statement throws partway through", async () => {
    let queryCount = 0;
    const { client, calls } = createFakeClient({
      async query(text: string): Promise<SqlQueryResult> {
        calls.push(text);
        queryCount += 1;
        if (queryCount === 2) {
          throw new Error("simulated write failure");
        }
        return { rows: [], rowCount: 0 };
      },
    });
    const scalarOperations: ScalarOperation[] = [
      { kind: "CREATE", module: "editorial", fieldPath: "shortDescription", currentValue: null, incomingValue: "Synthetic." },
    ];
    const childOperations: ChildOperation[] = [
      {
        kind: "CREATE_CHILD",
        module: "neighborhoods",
        stableChildKey: "hood-1" as NeighborhoodKey,
        currentChild: null,
        incomingChild: { neighborhoodKey: "hood-1" as NeighborhoodKey, name: "Testland Heights", summary: null, areaType: null },
      },
    ];
    const result = await executeApprovedDestinationPlanWrite(client, baseGateInput({ plan: basePlan({ scalarOperations, childOperations }) }));
    expect(result.outcome).toBe("FAILED");
    expect(result.error).toContain("simulated write failure");
    expect(calls[calls.length - 1]).toBe("ROLLBACK");
  });
});
