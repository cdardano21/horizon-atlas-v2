import { afterEach, describe, expect, it, vi } from "vitest";
import {
  executeApprovedDestinationPlanWriteWithAudit,
  recordWritePortBatchAudit,
} from "../persisted-destination-write-runtime";
import type { ExecutionGateCheckInput, SqlExecutionClient, SqlQueryResult } from "../../persistence/v31/write-port";
import type { ApprovedDestinationScope, CanonicalDestinationKey, DestinationId, DestinationPlan, ResolvedDestinationIdentity, ScalarOperation } from "../../persistence/v31/types";
import { projectComparable } from "../../persistence/v31/comparable-projection";
import type { StoredDestinationState } from "../../persistence/v31/types";

const DEST_KEY = "v31-audit-wiring-test" as CanonicalDestinationKey;
const DEST_ID = "22222222-2222-2222-2222-222222222222" as DestinationId;

function emptyState(): StoredDestinationState {
  return {
    identity: { destinationKey: DEST_KEY, slug: "v31-audit-wiring-test", name: "Audit Wiring Test", city: "Testland City", country: "Testland" },
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
  const state = emptyState();
  return {
    destinationIdentity: { destinationKey: DEST_KEY, destinationId: DEST_ID },
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

function approvedScope(): ApprovedDestinationScope {
  return [{ destinationKey: DEST_KEY, destinationId: DEST_ID }];
}

function baseGateInput(overrides: Partial<ExecutionGateCheckInput> = {}): ExecutionGateCheckInput {
  return {
    mode: "EXECUTE",
    explicitlyApproveExecution: true,
    contractValid: true,
    unresolvedCount: 0,
    plan: basePlan(),
    approvedScope: approvedScope(),
    batchRunId: "audit-wiring-test-run",
    ...overrides,
  };
}

function createFakeSqlClient(): SqlExecutionClient {
  return {
    async query(): Promise<SqlQueryResult> {
      return { rows: [], rowCount: 0 };
    },
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("recordWritePortBatchAudit", () => {
  it("posts to deterministic_v31_batch_runs and returns the inserted id", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify([{ id: "audit-row-1" }]), { status: 201 }),
    );

    const result = await recordWritePortBatchAudit({
      workbookPath: "(synthetic write-port proof)",
      contractSchemaVersion: "3.1",
      mode: "EXECUTE",
      approvedDestinationKeys: [DEST_KEY],
      destinationKeysTouched: [DEST_KEY],
      scalarOperationCounts: { CREATE: 1 },
      childOperationCounts: {},
      destinationReports: [{ destinationKey: DEST_KEY, outcome: "SUCCESS" }],
      preExecutionSnapshot: {},
      status: "COMPLETED",
    });

    expect(result).toEqual({ ok: true, id: "audit-row-1" });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, options] = fetchSpy.mock.calls[0];
    expect(String(url)).toContain("/rest/v1/deterministic_v31_batch_runs");
    const body = JSON.parse(String((options as RequestInit).body));
    expect(body.mode).toBe("EXECUTE");
    expect(body.status).toBe("COMPLETED");
  });

  it("reports ok:false when the insert fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(new Response("boom", { status: 500 }));

    const result = await recordWritePortBatchAudit({
      workbookPath: "(synthetic write-port proof)",
      contractSchemaVersion: "3.1",
      mode: "EXECUTE",
      approvedDestinationKeys: [DEST_KEY],
      destinationKeysTouched: [],
      scalarOperationCounts: {},
      childOperationCounts: {},
      destinationReports: [],
      preExecutionSnapshot: {},
      status: "FAILED",
      failureReason: "simulated",
    });

    expect(result.ok).toBe(false);
    expect(result.error).toContain("INSERT_FAILED_500");
  });
});

describe("executeApprovedDestinationPlanWriteWithAudit", () => {
  it("records status COMPLETED and mode EXECUTE for a successful write", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify([{ id: "audit-row-2" }]), { status: 201 }),
    );

    const scalarOperations: ScalarOperation[] = [
      { kind: "CREATE", module: "editorial", fieldPath: "shortDescription", currentValue: null, incomingValue: "Synthetic." },
    ];
    const result = await executeApprovedDestinationPlanWriteWithAudit(
      createFakeSqlClient(),
      baseGateInput({ plan: basePlan({ scalarOperations }) }),
      { workbookPath: "(test)", contractSchemaVersion: "3.1" },
    );

    expect(result.outcome).toBe("SUCCESS");
    expect(result.auditRecordOk).toBe(true);
    expect(result.auditRecordId).toBe("audit-row-2");
    const body = JSON.parse(String((fetchSpy.mock.calls[0][1] as RequestInit).body));
    expect(body.status).toBe("COMPLETED");
    expect(body.mode).toBe("EXECUTE");
  });

  it("records status FAILED (not a misleading success) when an execution gate rejects a DRY_RUN attempt", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify([{ id: "audit-row-3" }]), { status: 201 }),
    );

    const result = await executeApprovedDestinationPlanWriteWithAudit(
      createFakeSqlClient(),
      baseGateInput({ mode: "DRY_RUN" }),
      { workbookPath: "(test)", contractSchemaVersion: "3.1" },
    );

    expect(result.outcome).toBe("GATE_REJECTED");
    const body = JSON.parse(String((fetchSpy.mock.calls[0][1] as RequestInit).body));
    expect(body.status).toBe("FAILED");
    expect(body.mode).toBe("DRY_RUN");
    expect(body.failure_reason).toEqual(expect.any(String));
  });

  it("records status FAILED when the underlying transaction fails", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify([{ id: "audit-row-4" }]), { status: 201 }),
    );
    const failingClient: SqlExecutionClient = {
      async query(text: string): Promise<SqlQueryResult> {
        if (text === "BEGIN" || text === "ROLLBACK") return { rows: [], rowCount: 0 };
        throw new Error("simulated failure");
      },
    };
    const scalarOperations: ScalarOperation[] = [
      { kind: "CREATE", module: "editorial", fieldPath: "shortDescription", currentValue: null, incomingValue: "Synthetic." },
    ];

    const result = await executeApprovedDestinationPlanWriteWithAudit(
      failingClient,
      baseGateInput({ plan: basePlan({ scalarOperations }) }),
      { workbookPath: "(test)", contractSchemaVersion: "3.1" },
    );

    expect(result.outcome).toBe("FAILED");
    const body = JSON.parse(String((fetchSpy.mock.calls[0][1] as RequestInit).body));
    expect(body.status).toBe("FAILED");
    expect(body.failure_reason).toContain("simulated failure");
  });
});
