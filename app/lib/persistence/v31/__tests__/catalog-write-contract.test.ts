import { describe, expect, it } from "vitest";
import { projectComparable } from "../comparable-projection";
import {
  buildCatalogWriteStatements,
  executeApprovedDestinationPlanWithCatalogWrite,
  type CatalogWriteOperation,
} from "../catalog-write-contract";
import type { ExecutionGateCheckInput, SqlExecutionClient, SqlQueryResult } from "../write-port";
import type {
  CanonicalDestinationKey,
  DestinationId,
  DestinationPlan,
  ScalarOperation,
  StoredDestinationState,
} from "../types";

const DESTINATION_KEY = "guarded-catalog-test" as CanonicalDestinationKey;
const DESTINATION_ID = "11111111-1111-1111-1111-111111111111" as DestinationId;

function emptyStoredState(): StoredDestinationState {
  return {
    identity: { destinationKey: DESTINATION_KEY, slug: "guarded-catalog-test", name: "Guarded Catalog Test", city: "Test City", country: "Testland" },
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

function plan(scalarOperations: readonly ScalarOperation[] = []): DestinationPlan {
  return {
    destinationIdentity: { destinationKey: DESTINATION_KEY, destinationId: DESTINATION_ID },
    action: "UPDATE",
    scalarOperations,
    childOperations: [],
    warnings: [],
    errors: [],
    moduleExecutionOperations: [],
    expectedComparablePostState: projectComparable(emptyStoredState()),
  };
}

function gateInput(destinationPlan = plan()): ExecutionGateCheckInput {
  return {
    mode: "EXECUTE",
    explicitlyApproveExecution: true,
    contractValid: true,
    unresolvedCount: 0,
    plan: destinationPlan,
    approvedScope: [{ destinationKey: DESTINATION_KEY, destinationId: DESTINATION_ID }],
    batchRunId: "catalog-contract-test",
  };
}

function updateOperation(overrides: Partial<Extract<CatalogWriteOperation, { kind: "UPDATE_EXISTING_CATALOG" }>> = {}): Extract<CatalogWriteOperation, { kind: "UPDATE_EXISTING_CATALOG" }> {
  return {
    kind: "UPDATE_EXISTING_CATALOG",
    destinationId: DESTINATION_ID,
    currentDestinationKey: null,
    destinationKey: DESTINATION_KEY,
    beachAccess: "COASTAL",
    mountainOrSkiAccess: null,
    countryCode: "US",
    ...overrides,
  };
}

function fakeClient(responder: (text: string) => SqlQueryResult | Promise<SqlQueryResult>): { client: SqlExecutionClient; calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    client: {
      async query(text: string): Promise<SqlQueryResult> {
        calls.push(text);
        return responder(text);
      },
    },
  };
}

describe("guarded catalog write statements", () => {
  it("updates only the four approved root columns by immutable destination ID and preserves nulls", () => {
    const statements = buildCatalogWriteStatements(updateOperation());
    expect(statements).toHaveLength(2);
    expect(statements[0]).toMatchObject({ expectedRowCount: 0, rowCountFailureCode: "CATALOG_DESTINATION_KEY_COLLISION" });
    expect(statements[1]).toMatchObject({ expectedRowCount: 1, rowCountFailureCode: "CATALOG_UPDATE_ROW_COUNT_MISMATCH" });
    expect(statements[1].text).toBe(
      "update public.destinations_catalog set destination_key = $1, beach_access = $2, mountain_or_ski_access = $3, country_code = $4 where id = $5 and destination_key is not distinct from $6 returning id",
    );
    expect(statements[1].values).toEqual([DESTINATION_KEY, "COASTAL", null, "US", DESTINATION_ID, null]);
    expect(statements[1].text).not.toMatch(/slug\s*=|city\s*=|country\s*=|tier\s*=|status\s*=/);
  });

  it("rejects arbitrary catalog fields before a transaction can begin", () => {
    const unsafe = { ...updateOperation(), city: "Unauthorized" } as CatalogWriteOperation;
    expect(() => buildCatalogWriteStatements(unsafe)).toThrow("CATALOG_OPERATION_UNKNOWN_FIELDS:city");
  });

  it("builds an explicit-ID draft bootstrap with canonical identity and nullable roots", () => {
    const operation: CatalogWriteOperation = {
      kind: "CREATE_CATALOG",
      destinationId: DESTINATION_ID,
      destinationKey: DESTINATION_KEY,
      slug: "legacy-slug",
      city: "Test City",
      country: "Testland",
      tier: "launch",
      beachAccess: null,
      mountainOrSkiAccess: null,
      countryCode: null,
    };
    const statements = buildCatalogWriteStatements(operation);
    expect(statements[0].text).toContain("where slug = $1 or destination_key = $2");
    expect(statements[1].text).toContain("(id, slug, city, country, destination_key, tier, status");
    expect(statements[1].values).toEqual([DESTINATION_ID, "legacy-slug", "Test City", "Testland", DESTINATION_KEY, "launch", null, null, null]);
  });
});

describe("guarded catalog transaction", () => {
  it.each([0, 2])("rolls back when catalog UPDATE affects %i rows", async (rowCount) => {
    const { client, calls } = fakeClient((text) => {
      if (text.startsWith("select id from public.destinations_catalog")) return { rows: [], rowCount: 0 };
      if (text.startsWith("update public.destinations_catalog")) return { rows: [], rowCount };
      return { rows: [], rowCount: 0 };
    });
    const result = await executeApprovedDestinationPlanWithCatalogWrite(client, {
      gateInput: gateInput(),
      catalogOperation: updateOperation(),
    });
    expect(result.outcome).toBe("FAILED");
    expect(result.error).toContain("CATALOG_UPDATE_ROW_COUNT_MISMATCH");
    expect(calls.at(-1)).toBe("ROLLBACK");
  });

  it("stops before catalog and premium writes on canonical-key collision", async () => {
    const scalarOperations: ScalarOperation[] = [
      { kind: "CREATE", module: "editorial", fieldPath: "shortDescription", currentValue: null, incomingValue: "Must not run" },
    ];
    const { client, calls } = fakeClient((text) => {
      if (text.startsWith("select id from public.destinations_catalog")) return { rows: [{ id: "other" }], rowCount: 1 };
      return { rows: [], rowCount: 0 };
    });
    const result = await executeApprovedDestinationPlanWithCatalogWrite(client, {
      gateInput: gateInput(plan(scalarOperations)),
      catalogOperation: updateOperation(),
    });
    expect(result.error).toContain("CATALOG_DESTINATION_KEY_COLLISION");
    expect(calls.some((text) => text.startsWith("update public.destinations_catalog"))).toBe(false);
    expect(calls.some((text) => text.includes("premium_destination_profiles"))).toBe(false);
    expect(calls.at(-1)).toBe("ROLLBACK");
  });

  it("rolls back a successful catalog promotion when a later premium write fails", async () => {
    const scalarOperations: ScalarOperation[] = [
      { kind: "CREATE", module: "editorial", fieldPath: "shortDescription", currentValue: null, incomingValue: "Atomic" },
    ];
    const { client, calls } = fakeClient((text) => {
      if (text.startsWith("select id from public.destinations_catalog")) return { rows: [], rowCount: 0 };
      if (text.startsWith("update public.destinations_catalog")) return { rows: [{ id: DESTINATION_ID }], rowCount: 1 };
      if (text.includes("premium_destination_profiles")) throw new Error("PREMIUM_WRITE_FAILED");
      return { rows: [], rowCount: 0 };
    });
    const result = await executeApprovedDestinationPlanWithCatalogWrite(client, {
      gateInput: gateInput(plan(scalarOperations)),
      catalogOperation: updateOperation(),
    });
    expect(result.error).toContain("PREMIUM_WRITE_FAILED");
    expect(calls.at(-1)).toBe("ROLLBACK");
    expect(calls.includes("COMMIT")).toBe(false);
  });

  it("rejects catalog-plan identity mismatch before issuing SQL", async () => {
    const { client, calls } = fakeClient(() => ({ rows: [], rowCount: 0 }));
    const result = await executeApprovedDestinationPlanWithCatalogWrite(client, {
      gateInput: gateInput(),
      catalogOperation: updateOperation({ destinationId: "22222222-2222-2222-2222-222222222222" as DestinationId }),
    });
    expect(result.error).toBe("CATALOG_OPERATION_IDENTITY_MISMATCH");
    expect(calls).toEqual([]);
  });
});
