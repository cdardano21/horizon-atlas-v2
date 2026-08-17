import { describe, expect, it, vi } from "vitest";
import {
  executeDeterministicV31Batch,
  type BatchDestinationSpec,
  type ExecuteDeterministicV31BatchInput,
} from "../execute-deterministic-v31-batch";
import type { SqlExecutionClient, SqlQueryResult } from "../../persistence/v31/write-port";
import type { DeterministicV31CanonicalDestination } from "../../workbook-v31-deterministic-core";
import type { CanonicalDestinationKey, DestinationId, DestinationPlan, ResolvedDestinationIdentity } from "../../persistence/v31/types";
import { projectComparable } from "../../persistence/v31/comparable-projection";
import type { StoredDestinationState } from "../../persistence/v31/types";

function makeCanonicalDestination(key: string, name: string): DeterministicV31CanonicalDestination {
  return {
    identity: { destinationKey: key, slug: `${key}-slug`, name, city: name, country: "Testland" },
    editorial: { shortDescription: `${name} short description`, longDescription: null, currency: "USD", primaryLanguage: "English", timeZone: "UTC" },
    facts: [{ factKey: `${key}-fact-1`, factGroup: "identity", valueText: "A fact", displayLabel: "Fact", sourceName: "Test source" }],
    scores: [],
    neighborhoods: [{ neighborhoodKey: `${key}-hood-1`, name: `${name} Heights`, summary: "A neighborhood", areaType: "urban" }],
    places: [],
    resources: [],
    media: [],
    costOfLiving: [{ category: "housing", monthlyLow: "1000", monthlyHigh: "2000", currency: "USD" }],
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
  } as unknown as DeterministicV31CanonicalDestination;
}

function makeDestinationSpec(key: string, name: string): BatchDestinationSpec {
  return {
    destinationKey: key,
    canonicalDestination: makeCanonicalDestination(key, name),
    bootstrapIdentity: { slug: `${key}-slug`, city: name, country: "Testland" },
  };
}

interface FakeCatalogRow {
  id: string;
  slug: string;
  destinationKey: string;
}

interface FakeClientHandle {
  readonly client: SqlExecutionClient;
  readonly statementLog: Array<{ text: string; values: readonly unknown[] }>;
  readonly catalogByKey: Map<string, FakeCatalogRow>;
}

function createFakeBatchSqlClient(options: {
  existingCatalog?: readonly FakeCatalogRow[];
  existingProfileDestinationIds?: readonly string[];
  failWriteForDestinationKeys?: readonly string[];
} = {}): FakeClientHandle {
  const catalogByKey = new Map<string, FakeCatalogRow>();
  const catalogBySlug = new Map<string, FakeCatalogRow>();
  for (const row of options.existingCatalog ?? []) {
    catalogByKey.set(row.destinationKey, row);
    catalogBySlug.set(row.slug, row);
  }
  const profiles = new Set(options.existingProfileDestinationIds ?? []);
  const failingKeys = new Set(options.failWriteForDestinationKeys ?? []);
  const statementLog: Array<{ text: string; values: readonly unknown[] }> = [];
  let nextId = 1;

  const client: SqlExecutionClient = {
    async query(text: string, values: readonly unknown[] = []): Promise<SqlQueryResult> {
      const trimmed = text.trim();
      statementLog.push({ text: trimmed, values });

      if (trimmed === "BEGIN" || trimmed === "COMMIT" || trimmed === "ROLLBACK") {
        return { rows: [], rowCount: 0 };
      }

      if (trimmed.startsWith("select id from public.destinations_catalog where destination_key")) {
        const [destinationKey, slug] = values as [string, string];
        const row = catalogByKey.get(destinationKey) ?? catalogBySlug.get(slug);
        return row ? { rows: [{ id: row.id }], rowCount: 1 } : { rows: [], rowCount: 0 };
      }

      if (trimmed.startsWith("select id, slug, destination_key from public.destinations_catalog where slug")) {
        const [slug, destinationKey] = values as [string, string];
        const row = catalogBySlug.get(slug) ?? catalogByKey.get(destinationKey);
        return row ? { rows: [{ id: row.id, slug: row.slug, destination_key: row.destinationKey }], rowCount: 1 } : { rows: [], rowCount: 0 };
      }

      if (trimmed.startsWith("insert into public.destinations_catalog")) {
        const [slug, , , destinationKey] = values as [string, string, string, string, string];
        const id = `fake-catalog-${nextId++}`;
        const row: FakeCatalogRow = { id, slug, destinationKey };
        catalogByKey.set(destinationKey, row);
        catalogBySlug.set(slug, row);
        return { rows: [{ id }], rowCount: 1 };
      }

      if (trimmed.startsWith("select 1 as present from public.premium_destination_profiles")) {
        const [destinationId] = values as [string];
        return profiles.has(destinationId) ? { rows: [{ present: 1 }], rowCount: 1 } : { rows: [], rowCount: 0 };
      }

      if (trimmed.startsWith("delete from public.destinations_catalog where id")) {
        const [id] = values as [string];
        for (const [k, v] of [...catalogByKey.entries()]) if (v.id === id) catalogByKey.delete(k);
        for (const [k, v] of [...catalogBySlug.entries()]) if (v.id === id) catalogBySlug.delete(k);
        return { rows: [], rowCount: 1 };
      }

      // Any other statement is a real write statement (scalar/keyed-child/replace-module upsert).
      const touchesFailingKey = [...failingKeys].some((key) => values.includes(key));
      if (touchesFailingKey) {
        throw new Error("SIMULATED_WRITE_FAILURE");
      }
      return { rows: [], rowCount: 1 };
    },
  };

  return { client, statementLog, catalogByKey };
}

function baseInput(overrides: Partial<ExecuteDeterministicV31BatchInput> = {}): ExecuteDeterministicV31BatchInput {
  const keys = ["batch-test-a", "batch-test-b", "batch-test-c", "batch-test-d", "batch-test-e"];
  return {
    client: createFakeBatchSqlClient().client,
    approvedDestinationKeys: keys,
    destinations: keys.map((key, i) => makeDestinationSpec(key, `Destination ${String.fromCharCode(65 + i)}`)),
    workbookPath: "(synthetic batch driver test)",
    contractSchemaVersion: "3.1",
    batchRunId: "batch-driver-test-run",
    mode: "EXECUTE",
    explicitlyApproveExecution: true,
    ...overrides,
  };
}

describe("executeDeterministicV31Batch", () => {
  it("1. succeeds for all 5 destinations, each bootstrapped and written independently", async () => {
    const fake = createFakeBatchSqlClient();
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => new Response(JSON.stringify([{ id: "audit-row" }]), { status: 201 }));

    const result = await executeDeterministicV31Batch(baseInput({ client: fake.client }));

    expect(result.ok).toBe(true);
    expect(result.attempted).toBe(5);
    expect(result.succeeded).toBe(5);
    expect(result.failed).toBe(0);
    expect(result.batchOutcome).toBe("COMPLETED");
    for (const destinationResult of result.destinationResults) {
      expect(destinationResult.bootstrapResult).toBe("CREATED");
      expect(destinationResult.writeOutcome).toBe("SUCCESS");
      expect(destinationResult.planAction).toBe("UPDATE");
    }
    vi.restoreAllMocks();
  });

  it("2 & 9. destination #3 fails while #1, #2, #4, #5 continue and complete - reports PARTIAL_FAILURE", async () => {
    const fake = createFakeBatchSqlClient({ failWriteForDestinationKeys: ["batch-test-c"] });
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => new Response(JSON.stringify([{ id: "audit-row" }]), { status: 201 }));

    const result = await executeDeterministicV31Batch(baseInput({ client: fake.client }));

    expect(result.ok).toBe(true);
    expect(result.attempted).toBe(5);
    expect(result.succeeded).toBe(4);
    expect(result.failed).toBe(1);
    expect(result.batchOutcome).toBe("PARTIAL_FAILURE");

    const [a, b, c, d, e] = result.destinationResults;
    expect(a.writeOutcome).toBe("SUCCESS");
    expect(b.writeOutcome).toBe("SUCCESS");
    expect(c.writeOutcome).toBe("FAILED");
    expect(d.writeOutcome).toBe("SUCCESS");
    expect(e.writeOutcome).toBe("SUCCESS");
    vi.restoreAllMocks();
  });

  it("3. cleans up a failed new destination's bootstrap row via cascade delete", async () => {
    const fake = createFakeBatchSqlClient({ failWriteForDestinationKeys: ["batch-test-c"] });
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => new Response(JSON.stringify([{ id: "audit-row" }]), { status: 201 }));

    const result = await executeDeterministicV31Batch(baseInput({ client: fake.client }));
    const failedResult = result.destinationResults.find((r) => r.destinationKey === "batch-test-c")!;

    expect(failedResult.bootstrapResult).toBe("CREATED");
    expect(failedResult.cleanupPerformed).toBe(true);
    expect(failedResult.cleanupRowsDeleted).toBe(1);
    expect(failedResult.error).toBeTruthy();
    // The catalog row must actually be gone after cleanup.
    expect(fake.catalogByKey.has("batch-test-c")).toBe(false);
    // The 4 successful destinations must NOT have been cleaned up.
    expect(fake.catalogByKey.has("batch-test-a")).toBe(true);
    expect(fake.catalogByKey.has("batch-test-d")).toBe(true);
    vi.restoreAllMocks();
  });

  it("4. rejects the whole batch when a destination spec is outside the approved key list", async () => {
    const input = baseInput();
    const result = await executeDeterministicV31Batch({
      ...input,
      approvedDestinationKeys: ["batch-test-a", "batch-test-b"],
      destinations: [makeDestinationSpec("batch-test-a", "A"), makeDestinationSpec("batch-test-b", "B"), makeDestinationSpec("batch-test-intruder", "Intruder")],
    });

    expect(result.ok).toBe(false);
    expect(result.rejectionReason).toContain("DESTINATION_OUTSIDE_APPROVED_SCOPE");
    expect(result.attempted).toBe(0);
  });

  it("5. a golden-pilot key is never in approved scope and is rejected if ever supplied", async () => {
    const input = baseInput();
    const result = await executeDeterministicV31Batch({
      ...input,
      approvedDestinationKeys: ["batch-test-a"],
      destinations: [makeDestinationSpec("batch-test-a", "A"), makeDestinationSpec("lisbon-pt", "Lisbon")],
    });

    expect(result.ok).toBe(false);
    expect(result.rejectionReason).toContain("lisbon-pt");
    expect(result.attempted).toBe(0);
  });

  it("6. rerunning after partial success re-plans against persisted state instead of replaying stale CREATEs", async () => {
    const existingId = "fake-catalog-existing-1";
    const fake = createFakeBatchSqlClient({
      existingCatalog: [{ id: existingId, slug: "batch-test-a-slug", destinationKey: "batch-test-a" }],
      existingProfileDestinationIds: [existingId],
    });
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => new Response(JSON.stringify([{ id: "audit-row" }]), { status: 201 }));

    const emptyState: StoredDestinationState = {
      identity: { destinationKey: "batch-test-a" as CanonicalDestinationKey, slug: "batch-test-a-slug", name: "A", city: "A", country: "Testland" },
      editorial: { shortDescription: null, longDescription: null, currency: null, primaryLanguage: null, timeZone: null },
      facts: [], scores: [], neighborhoods: [], places: [], resources: [], media: [],
      costOfLiving: [], climateMonthly: [], housing: [], propertyResources: [], healthcare: [],
      visaResidency: [], taxesFinance: [], lgbtqInclusivity: [], safetyRisks: [], transportation: [],
      remoteWork: [], languageIntegration: [], pets: [], familyEducation: [], communitySocial: [],
      accessibility: [], bureaucracySetup: [], workBusiness: [], retirementAging: [], lifestyleLaws: [],
      realityCheck: [], moveChecklist: [], environmentQuality: null, dailyLifePracticality: null,
      eventsSeasonality: [], sources: [],
    };

    const unchangedPlan: DestinationPlan = {
      destinationIdentity: { destinationKey: "batch-test-a" as CanonicalDestinationKey, destinationId: existingId as DestinationId },
      action: "UNCHANGED",
      scalarOperations: [],
      childOperations: [],
      warnings: [],
      errors: [],
      moduleExecutionOperations: [],
      expectedComparablePostState: projectComparable(emptyState),
    };

    const fakeReplayPlanner = vi.fn(async (candidate: { destinationId?: string | null; destinationKey?: string | null }) => ({
      status: "PLANNED" as const,
      candidate,
      identity: { destinationKey: candidate.destinationKey, destinationId: candidate.destinationId } as ResolvedDestinationIdentity,
      storedDestinationState: {} as StoredDestinationState,
      plan: unchangedPlan,
    }));

    const result = await executeDeterministicV31Batch({
      ...baseInput({ client: fake.client }),
      approvedDestinationKeys: ["batch-test-a"],
      destinations: [makeDestinationSpec("batch-test-a", "A")],
      deps: { orchestrateDestinationPlanForBatchCandidate: fakeReplayPlanner },
    });

    expect(fakeReplayPlanner).toHaveBeenCalledTimes(1);
    const destinationResult = result.destinationResults[0];
    expect(destinationResult.bootstrapResult).toBe("ALREADY_EXISTED");
    expect(destinationResult.planSource).toBe("REPLAY_FROM_PERSISTED_STATE");
    expect(destinationResult.planAction).toBe("UNCHANGED");
    expect(destinationResult.writeOutcome).toBe("NO_OP");
    expect(destinationResult.statementsExecuted).toBe(0);
    vi.restoreAllMocks();
  });

  it("7. never issues any statement touching publish status", async () => {
    const fake = createFakeBatchSqlClient();
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => new Response(JSON.stringify([{ id: "audit-row" }]), { status: 201 }));

    await executeDeterministicV31Batch(baseInput({ client: fake.client }));

    const publishRelatedStatements = fake.statementLog.filter((entry) => /publish/i.test(entry.text) || /status\s*=\s*'published'/i.test(entry.text));
    expect(publishRelatedStatements).toHaveLength(0);
    // The only place "status" appears at all is the hardcoded bootstrap draft insert.
    const statusStatements = fake.statementLog.filter((entry) => entry.text.includes("status"));
    for (const entry of statusStatements) {
      expect(entry.text).toContain("'draft'");
    }
    vi.restoreAllMocks();
  });

  it("8. aggregate result correctly reports full success", async () => {
    const fake = createFakeBatchSqlClient();
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => new Response(JSON.stringify([{ id: "audit-row" }]), { status: 201 }));

    const result = await executeDeterministicV31Batch(baseInput({ client: fake.client }));

    expect(result.batchOutcome).toBe("COMPLETED");
    expect(result.succeeded).toBe(result.attempted);
    expect(result.failed).toBe(0);
    vi.restoreAllMocks();
  });

  it("10. rejects an empty batch", async () => {
    const result = await executeDeterministicV31Batch(baseInput({ approvedDestinationKeys: [], destinations: [] }));

    expect(result.ok).toBe(false);
    expect(result.rejectionReason).toBe("EMPTY_BATCH");
    expect(result.attempted).toBe(0);
  });

  it("surfaces a failed best-effort cleanup instead of silently swallowing it", async () => {
    const fake = createFakeBatchSqlClient({ failWriteForDestinationKeys: ["batch-test-a"] });
    const originalQuery = fake.client.query.bind(fake.client);
    fake.client.query = async (text: string, values: readonly unknown[] = []) => {
      if (text.trim().startsWith("delete from public.destinations_catalog where id")) {
        throw new Error("SIMULATED_CLEANUP_FAILURE");
      }
      return originalQuery(text, values);
    };
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => new Response(JSON.stringify([{ id: "audit-row" }]), { status: 201 }));

    const result = await executeDeterministicV31Batch({
      ...baseInput({ client: fake.client }),
      approvedDestinationKeys: ["batch-test-a"],
      destinations: [makeDestinationSpec("batch-test-a", "A")],
    });

    const destinationResult = result.destinationResults[0];
    expect(destinationResult.writeOutcome).toBe("FAILED");
    expect(destinationResult.cleanupPerformed).toBe(false);
    expect(destinationResult.cleanupError).toContain("SIMULATED_CLEANUP_FAILURE");
    expect(destinationResult.error).toBeTruthy();
    vi.restoreAllMocks();
  });

  it("rejects a batch missing a batchRunId", async () => {
    const result = await executeDeterministicV31Batch(baseInput({ batchRunId: "" }));
    expect(result.ok).toBe(false);
    expect(result.rejectionReason).toBe("MISSING_BATCH_RUN_ID");
  });

  describe("audit-failure isolation (audit recording must never affect a committed write)", () => {
    it("CRITICAL: new destination write succeeds + audit fetch THROWS - write/result preserved, no cascade delete", async () => {
      const fake = createFakeBatchSqlClient();
      vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
        throw new Error("SIMULATED_AUDIT_NETWORK_FAILURE");
      });

      const result = await executeDeterministicV31Batch({
        ...baseInput({ client: fake.client }),
        approvedDestinationKeys: ["batch-test-a"],
        destinations: [makeDestinationSpec("batch-test-a", "A")],
      });

      const destinationResult = result.destinationResults[0];
      expect(destinationResult.bootstrapResult).toBe("CREATED");
      expect(destinationResult.writeOutcome).toBe("SUCCESS");
      expect(destinationResult.statementsExecuted).toBeGreaterThan(0);
      expect(destinationResult.error).toBeUndefined();
      expect(destinationResult.auditRecordOk).toBe(false);
      expect(destinationResult.auditError).toContain("SIMULATED_AUDIT_NETWORK_FAILURE");
      expect(destinationResult.cleanupPerformed).toBe(false);
      expect(destinationResult.cleanupRowsDeleted).toBeUndefined();
      // The committed destination must still exist - no cascade delete may occur.
      expect(fake.catalogByKey.has("batch-test-a")).toBe(true);
      expect(result.succeeded).toBe(1);
      expect(result.failed).toBe(0);
      expect(result.batchOutcome).toBe("COMPLETED");
      vi.restoreAllMocks();
    });

    it("new destination write succeeds + audit returns NON-2XX - same safety behavior as a thrown audit", async () => {
      const fake = createFakeBatchSqlClient();
      vi.spyOn(globalThis, "fetch").mockImplementation(async () => new Response("audit table unavailable", { status: 500 }));

      const result = await executeDeterministicV31Batch({
        ...baseInput({ client: fake.client }),
        approvedDestinationKeys: ["batch-test-a"],
        destinations: [makeDestinationSpec("batch-test-a", "A")],
      });

      const destinationResult = result.destinationResults[0];
      expect(destinationResult.writeOutcome).toBe("SUCCESS");
      expect(destinationResult.auditRecordOk).toBe(false);
      expect(destinationResult.auditError).toContain("INSERT_FAILED_500");
      expect(destinationResult.cleanupPerformed).toBe(false);
      expect(fake.catalogByKey.has("batch-test-a")).toBe(true);
      expect(result.succeeded).toBe(1);
      expect(result.batchOutcome).toBe("COMPLETED");
      vi.restoreAllMocks();
    });

    it("replay destination (ALREADY_EXISTED) write succeeds + audit throws - cleanup is never even attempted", async () => {
      const existingId = "fake-catalog-existing-replay-1";
      const fake = createFakeBatchSqlClient({
        existingCatalog: [{ id: existingId, slug: "batch-test-a-slug", destinationKey: "batch-test-a" }],
        existingProfileDestinationIds: [existingId],
      });
      vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
        throw new Error("SIMULATED_AUDIT_NETWORK_FAILURE");
      });

      const emptyState: StoredDestinationState = {
        identity: { destinationKey: "batch-test-a" as CanonicalDestinationKey, slug: "batch-test-a-slug", name: "A", city: "A", country: "Testland" },
        editorial: { shortDescription: null, longDescription: null, currency: null, primaryLanguage: null, timeZone: null },
        facts: [], scores: [], neighborhoods: [], places: [], resources: [], media: [],
        costOfLiving: [], climateMonthly: [], housing: [], propertyResources: [], healthcare: [],
        visaResidency: [], taxesFinance: [], lgbtqInclusivity: [], safetyRisks: [], transportation: [],
        remoteWork: [], languageIntegration: [], pets: [], familyEducation: [], communitySocial: [],
        accessibility: [], bureaucracySetup: [], workBusiness: [], retirementAging: [], lifestyleLaws: [],
        realityCheck: [], moveChecklist: [], environmentQuality: null, dailyLifePracticality: null,
        eventsSeasonality: [], sources: [],
      };
      const updatePlan: DestinationPlan = {
        destinationIdentity: { destinationKey: "batch-test-a" as CanonicalDestinationKey, destinationId: existingId as DestinationId },
        action: "UPDATE",
        scalarOperations: [{ kind: "CREATE", module: "editorial", fieldPath: "shortDescription", currentValue: null, incomingValue: "Updated" }],
        childOperations: [],
        warnings: [],
        errors: [],
        moduleExecutionOperations: [],
        expectedComparablePostState: projectComparable(emptyState),
      };
      const fakeReplayPlanner = vi.fn(async (candidate: { destinationId?: string | null; destinationKey?: string | null }) => ({
        status: "PLANNED" as const,
        candidate,
        identity: { destinationKey: candidate.destinationKey, destinationId: candidate.destinationId } as ResolvedDestinationIdentity,
        storedDestinationState: {} as StoredDestinationState,
        plan: updatePlan,
      }));

      const result = await executeDeterministicV31Batch({
        ...baseInput({ client: fake.client }),
        approvedDestinationKeys: ["batch-test-a"],
        destinations: [makeDestinationSpec("batch-test-a", "A")],
        deps: { orchestrateDestinationPlanForBatchCandidate: fakeReplayPlanner },
      });

      const destinationResult = result.destinationResults[0];
      expect(destinationResult.bootstrapResult).toBe("ALREADY_EXISTED");
      expect(destinationResult.planSource).toBe("REPLAY_FROM_PERSISTED_STATE");
      expect(destinationResult.writeOutcome).toBe("SUCCESS");
      expect(destinationResult.auditRecordOk).toBe(false);
      expect(destinationResult.auditError).toContain("SIMULATED_AUDIT_NETWORK_FAILURE");
      // bootstrappedThisCall is false for ALREADY_EXISTED, so cleanup must never even be considered.
      expect(destinationResult.cleanupPerformed).toBe(false);
      expect(destinationResult.cleanupRowsDeleted).toBeUndefined();
      expect(fake.catalogByKey.has("batch-test-a")).toBe(true);
      vi.restoreAllMocks();
    });

    it("real write fails + audit succeeds - primary write failure preserved, cleanup occurs, audit reflects the failure", async () => {
      const fake = createFakeBatchSqlClient({ failWriteForDestinationKeys: ["batch-test-a"] });
      vi.spyOn(globalThis, "fetch").mockImplementation(async () => new Response(JSON.stringify([{ id: "audit-row" }]), { status: 201 }));

      const result = await executeDeterministicV31Batch({
        ...baseInput({ client: fake.client }),
        approvedDestinationKeys: ["batch-test-a"],
        destinations: [makeDestinationSpec("batch-test-a", "A")],
      });

      const destinationResult = result.destinationResults[0];
      expect(destinationResult.writeOutcome).toBe("FAILED");
      expect(destinationResult.error).toBeTruthy();
      expect(destinationResult.cleanupPerformed).toBe(true);
      expect(destinationResult.cleanupRowsDeleted).toBe(1);
      expect(destinationResult.auditRecordOk).toBe(true);
      expect(destinationResult.auditRecordId).toBe("audit-row");
      vi.restoreAllMocks();
    });

    it("real write fails + audit THROWS - original write error remains primary, auditError populated separately, cleanup unaffected", async () => {
      const fake = createFakeBatchSqlClient({ failWriteForDestinationKeys: ["batch-test-a"] });
      vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
        throw new Error("SIMULATED_AUDIT_NETWORK_FAILURE");
      });

      const result = await executeDeterministicV31Batch({
        ...baseInput({ client: fake.client }),
        approvedDestinationKeys: ["batch-test-a"],
        destinations: [makeDestinationSpec("batch-test-a", "A")],
      });

      const destinationResult = result.destinationResults[0];
      expect(destinationResult.writeOutcome).toBe("FAILED");
      expect(destinationResult.error).toBeTruthy();
      expect(destinationResult.error).not.toContain("SIMULATED_AUDIT_NETWORK_FAILURE");
      expect(destinationResult.auditRecordOk).toBe(false);
      expect(destinationResult.auditError).toContain("SIMULATED_AUDIT_NETWORK_FAILURE");
      expect(destinationResult.cleanupPerformed).toBe(true);
      expect(destinationResult.cleanupRowsDeleted).toBe(1);
      vi.restoreAllMocks();
    });

    it("real write fails + audit returns NON-2XX - same error-preservation semantics", async () => {
      const fake = createFakeBatchSqlClient({ failWriteForDestinationKeys: ["batch-test-a"] });
      vi.spyOn(globalThis, "fetch").mockImplementation(async () => new Response("boom", { status: 500 }));

      const result = await executeDeterministicV31Batch({
        ...baseInput({ client: fake.client }),
        approvedDestinationKeys: ["batch-test-a"],
        destinations: [makeDestinationSpec("batch-test-a", "A")],
      });

      const destinationResult = result.destinationResults[0];
      expect(destinationResult.writeOutcome).toBe("FAILED");
      expect(destinationResult.error).toBeTruthy();
      expect(destinationResult.auditRecordOk).toBe(false);
      expect(destinationResult.auditError).toContain("INSERT_FAILED_500");
      expect(destinationResult.cleanupPerformed).toBe(true);
      vi.restoreAllMocks();
    });

    it("partial batch: an audit-failed-but-written destination counts as succeeded and later candidates still run", async () => {
      const fake = createFakeBatchSqlClient();
      let callCount = 0;
      vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
        callCount += 1;
        if (callCount === 2) {
          throw new Error("SIMULATED_AUDIT_NETWORK_FAILURE");
        }
        return new Response(JSON.stringify([{ id: "audit-row" }]), { status: 201 });
      });

      const result = await executeDeterministicV31Batch(baseInput({ client: fake.client }));

      expect(result.attempted).toBe(5);
      expect(result.succeeded).toBe(5);
      expect(result.failed).toBe(0);
      const [a, b, c, d, e] = result.destinationResults;
      expect(a.writeOutcome).toBe("SUCCESS");
      expect(b.writeOutcome).toBe("SUCCESS");
      expect(b.auditRecordOk).toBe(false);
      expect(b.auditError).toContain("SIMULATED_AUDIT_NETWORK_FAILURE");
      expect(c.writeOutcome).toBe("SUCCESS");
      expect(d.writeOutcome).toBe("SUCCESS");
      expect(e.writeOutcome).toBe("SUCCESS");
      // The audit-failed destination's committed data must remain intact.
      expect(fake.catalogByKey.has("batch-test-b")).toBe(true);
      vi.restoreAllMocks();
    });

    it("aggregate audit-agnostic success: all writes succeed but every audit call throws", async () => {
      const fake = createFakeBatchSqlClient();
      vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
        throw new Error("SIMULATED_AUDIT_NETWORK_FAILURE");
      });

      const result = await executeDeterministicV31Batch(baseInput({ client: fake.client }));

      expect(result.batchOutcome).toBe("COMPLETED");
      expect(result.succeeded).toBe(5);
      expect(result.failed).toBe(0);
      for (const destinationResult of result.destinationResults) {
        expect(destinationResult.writeOutcome).toBe("SUCCESS");
        expect(destinationResult.auditRecordOk).toBe(false);
        expect(destinationResult.auditError).toContain("SIMULATED_AUDIT_NETWORK_FAILURE");
        expect(destinationResult.cleanupPerformed).toBe(false);
      }
      // None of the 5 committed destinations may have been deleted.
      for (const key of ["batch-test-a", "batch-test-b", "batch-test-c", "batch-test-d", "batch-test-e"]) {
        expect(fake.catalogByKey.has(key)).toBe(true);
      }
      vi.restoreAllMocks();
    });
  });

  it("DRY_RUN mode performs zero real writes and reports GATE_REJECTED per destination", async () => {
    const fake = createFakeBatchSqlClient();
    // No implementation provided: if the driver ever called fetch during a DRY_RUN, this would
    // reject rather than silently reaching the real network, making the bug fail loudly.
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("fetch must not be called during DRY_RUN"));

    const result = await executeDeterministicV31Batch(baseInput({ client: fake.client, mode: "DRY_RUN", explicitlyApproveExecution: false }));

    expect(result.ok).toBe(true);
    expect(result.batchOutcome).toBe("COMPLETED");
    for (const destinationResult of result.destinationResults) {
      expect(destinationResult.bootstrapResult).toBe("WOULD_CREATE");
      expect(destinationResult.writeOutcome).toBe("GATE_REJECTED");
      expect(destinationResult.statementsExecuted).toBe(0);
    }
    // No catalog rows should have been created for real.
    expect(fake.catalogByKey.size).toBe(0);
    // No audit rows should have been recorded for a pure dry run, and the audit transport must
    // never even be invoked - not called-and-ignored, but genuinely never called.
    for (const destinationResult of result.destinationResults) {
      expect(destinationResult.auditRecordId).toBeUndefined();
    }
    expect(fetchSpy).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });
});
