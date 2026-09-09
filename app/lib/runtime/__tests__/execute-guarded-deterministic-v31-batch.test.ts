import { describe, expect, it, vi } from "vitest";
import type { DeterministicV31CanonicalDestination } from "../../workbook-v31-deterministic-core";
import type { SqlExecutionClient, SqlQueryResult } from "../../persistence/v31/write-port";
import {
  executeGuardedDeterministicV31Batch,
  type ExecuteGuardedDeterministicV31BatchInput,
} from "../execute-guarded-deterministic-v31-batch";
import type { BatchDestinationSpec } from "../execute-deterministic-v31-batch";
import { REQUIRED_PRESENCE_MODULES } from "../../persistence/v31/load-normalized-persisted-destination-bundle";
import type { DestinationPlan } from "../../persistence/v31/types";

interface CatalogRow {
  id: string;
  slug: string;
  city?: string;
  country?: string;
  destinationKey: string | null;
  beachAccess: string | null;
  mountainOrSkiAccess: string | null;
  countryCode: string | null;
}

function canonical(key: string): DeterministicV31CanonicalDestination {
  return {
    identity: { destinationKey: key, slug: `${key}-slug`, name: key, city: key, country: "Testland" },
    destinationRow: { beach_access: "COASTAL", mountain_or_ski_access: null, country_code: "US" },
    editorial: { shortDescription: `${key} description`, longDescription: null, currency: "USD", primaryLanguage: "English", timeZone: "UTC" },
    facts: [], scores: [], neighborhoods: [], places: [], resources: [], media: [], costOfLiving: [], climateMonthly: [],
    housing: [], propertyResources: [], healthcare: [], visaResidency: [], taxesFinance: [], lgbtqInclusivity: [], safetyRisks: [],
    transportation: [], remoteWork: [], languageIntegration: [], pets: [], familyEducation: [], communitySocial: [], accessibility: [],
    bureaucracySetup: [], workBusiness: [], retirementAging: [], lifestyleLaws: [], realityCheck: [], moveChecklist: [],
    environmentQuality: null, dailyLifePracticality: null, eventsSeasonality: [], sources: [],
  } as unknown as DeterministicV31CanonicalDestination;
}

function spec(key: string): BatchDestinationSpec {
  return {
    destinationKey: key,
    canonicalDestination: canonical(key),
    bootstrapIdentity: { slug: `${key}-slug`, city: key, country: "Testland" },
  };
}

function cloneRows(rows: Map<string, CatalogRow>): Map<string, CatalogRow> {
  return new Map([...rows].map(([id, row]) => [id, { ...row }]));
}

function transactionalClient(initial: readonly CatalogRow[], failPremiumKey?: string): {
  client: SqlExecutionClient;
  rows: Map<string, CatalogRow>;
  log: Array<{ text: string; values: readonly unknown[] }>;
} {
  const rows = new Map(initial.map((row) => [row.id, { ...row }]));
  const log: Array<{ text: string; values: readonly unknown[] }> = [];
  let transactionSnapshot: Map<string, CatalogRow> | null = null;
  const findByKeyOrSlug = (key: string, slug: string) => [...rows.values()].filter((row) => row.destinationKey === key || row.slug === slug);

  const client: SqlExecutionClient = {
    async query(text: string, values: readonly unknown[] = []): Promise<SqlQueryResult> {
      const sql = text.trim();
      log.push({ text: sql, values });
      if (sql === "BEGIN") {
        transactionSnapshot = cloneRows(rows);
        return { rows: [], rowCount: 0 };
      }
      if (sql === "COMMIT") {
        transactionSnapshot = null;
        return { rows: [], rowCount: 0 };
      }
      if (sql === "ROLLBACK") {
        rows.clear();
        for (const [id, row] of transactionSnapshot ?? []) rows.set(id, row);
        transactionSnapshot = null;
        return { rows: [], rowCount: 0 };
      }
      if (sql.startsWith("select id, slug, city, country, destination_key, beach_access")) {
        const matches = findByKeyOrSlug(String(values[0]), String(values[1]));
        return {
          rows: matches.map((row) => ({
            id: row.id,
            slug: row.slug,
            city: row.city,
            country: row.country,
            destination_key: row.destinationKey,
            beach_access: row.beachAccess,
            mountain_or_ski_access: row.mountainOrSkiAccess,
            country_code: row.countryCode,
          })),
          rowCount: matches.length,
        };
      }
      if (sql.startsWith("select 1 as present from public.premium_destination_profiles")) {
        return { rows: [], rowCount: 0 };
      }
      if (sql.startsWith("select id from public.destinations_catalog where (destination_key = $1 or slug = $2) and id <> $3")) {
        const matches = [...rows.values()].filter((row) => (row.destinationKey === values[0] || row.slug === values[1]) && row.id !== values[2]);
        return { rows: matches.map((row) => ({ id: row.id })), rowCount: matches.length };
      }
      if (sql.startsWith("select id from public.destinations_catalog where slug = $1 or destination_key = $2")) {
        const matches = findByKeyOrSlug(String(values[1]), String(values[0]));
        return { rows: matches.map((row) => ({ id: row.id })), rowCount: matches.length };
      }
      if (sql.startsWith("update public.destinations_catalog")) {
        const row = rows.get(String(values[7]));
        if (!row || row.destinationKey !== values[8] || row.slug !== values[9] || row.city !== values[10] || row.country !== values[11]) return { rows: [], rowCount: 0 };
        row.destinationKey = String(values[0]);
        row.slug = String(values[1]);
        row.city = String(values[2]);
        row.country = String(values[3]);
        row.beachAccess = values[4] as string | null;
        row.mountainOrSkiAccess = values[5] as string | null;
        row.countryCode = values[6] as string | null;
        return { rows: [{ id: row.id }], rowCount: 1 };
      }
      if (sql.startsWith("insert into public.destinations_catalog")) {
        const row: CatalogRow = {
          id: String(values[0]), slug: String(values[1]), destinationKey: String(values[4]),
          city: String(values[2]), country: String(values[3]),
          beachAccess: values[6] as string | null, mountainOrSkiAccess: values[7] as string | null,
          countryCode: values[8] as string | null,
        };
        rows.set(row.id, row);
        return { rows: [{ id: row.id }], rowCount: 1 };
      }
      if (failPremiumKey && values.includes(failPremiumKey)) throw new Error(`SIMULATED_PREMIUM_FAILURE:${failPremiumKey}`);
      return { rows: [], rowCount: 1 };
    },
  };
  return { client, rows, log };
}

function input(destinations: readonly BatchDestinationSpec[], client: SqlExecutionClient, mode: "DRY_RUN" | "EXECUTE" = "EXECUTE"): ExecuteGuardedDeterministicV31BatchInput {
  let nextId = 1;
  return {
    client,
    approvedDestinationKeys: destinations.map((destination) => destination.destinationKey),
    destinations,
    workbookPath: "(guarded synthetic test)",
    contractSchemaVersion: "3.2",
    batchRunId: "guarded-batch-test",
    mode,
    explicitlyApproveExecution: mode === "EXECUTE",
    deps: { allocateDestinationId: () => `00000000-0000-4000-8000-${String(nextId++).padStart(12, "0")}` },
  };
}

describe("executeGuardedDeterministicV31Batch", () => {
  it("promotes a legacy-slug row inside the same transaction before premium writes", async () => {
    const destination = spec("legacy-key");
    const fake = transactionalClient([{
      id: "legacy-id", slug: "legacy-key-slug", destinationKey: null,
      city: "legacy-key", country: "Testland",
      beachAccess: null, mountainOrSkiAccess: null, countryCode: null,
    }]);
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify([{ id: "audit-id" }]), { status: 201 }));

    const result = await executeGuardedDeterministicV31Batch(input([destination], fake.client));

    expect(result.batchOutcome).toBe("COMPLETED");
    expect(result.failurePolicy).toBe("STOP_ON_FIRST_FAILURE");
    expect(result.destinationResults[0].catalogOperationKind).toBe("UPDATE_EXISTING_CATALOG");
    expect(fake.rows.get("legacy-id")?.destinationKey).toBe("legacy-key");
    const begin = fake.log.findIndex(({ text }) => text === "BEGIN");
    const catalogUpdate = fake.log.findIndex(({ text }) => text.startsWith("update public.destinations_catalog"));
    const premiumWrite = fake.log.findIndex(({ text }) => text.includes("premium_destination_profiles") && !text.startsWith("select"));
    const commit = fake.log.findIndex(({ text }) => text === "COMMIT");
    expect(begin).toBeLessThan(catalogUpdate);
    expect(catalogUpdate).toBeLessThan(premiumWrite);
    expect(premiumWrite).toBeLessThan(commit);
    vi.restoreAllMocks();
  });

  it("rolls back a newly created catalog row with premium failure and skips every later destination", async () => {
    const destinations = [spec("create-fails"), spec("must-be-skipped"), spec("also-skipped")];
    const fake = transactionalClient([], "create-fails");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify([{ id: "audit-id" }]), { status: 201 }));

    const result = await executeGuardedDeterministicV31Batch(input(destinations, fake.client));

    expect(result.attempted).toBe(1);
    expect(result.failed).toBe(1);
    expect(result.skipped).toBe(2);
    expect(result.destinationResults[0].catalogOperationKind).toBe("CREATE_CATALOG");
    expect(result.destinationResults[0].cleanupPerformed).toBe(false);
    expect([...fake.rows.values()].some((row) => row.destinationKey === "create-fails")).toBe(false);
    expect(fake.log.some(({ text, values }) => text.includes("premium_destination_profiles") && values.includes("must-be-skipped"))).toBe(false);
    expect(fake.log.at(-1)?.text).toBe("ROLLBACK");
    vi.restoreAllMocks();
  });

  it("dry-runs the approved 31 existing / 5 missing shape with 26 legacy promotions and zero writes", async () => {
    const destinations = Array.from({ length: 36 }, (_, index) => spec(`destination-${String(index + 1).padStart(2, "0")}`));
    const existing: CatalogRow[] = destinations.slice(0, 31).map((destination, index) => ({
      id: `existing-${index + 1}`,
      slug: destination.bootstrapIdentity.slug,
      city: destination.bootstrapIdentity.city,
      country: destination.bootstrapIdentity.country,
      destinationKey: index < 5 ? destination.destinationKey : null,
      beachAccess: index < 5 ? "COASTAL" : null,
      mountainOrSkiAccess: null,
      countryCode: index < 5 ? "US" : null,
    }));
    const fake = transactionalClient(existing);
    const prepared: DestinationPlan[] = [];
    const request = input(destinations, fake.client, "DRY_RUN");
    const result = await executeGuardedDeterministicV31Batch({ ...request, deps: { ...request.deps, observePreparedPlan: (plan) => { prepared.push(plan); } } });

    expect(result.batchOutcome).toBe("COMPLETED");
    expect(prepared).toHaveLength(36);
    for (const plan of prepared) {
      expect(plan.modulePresenceOperations).toEqual(REQUIRED_PRESENCE_MODULES.map((moduleKey) => ({ kind: "INITIALIZE_MODULE", module: moduleKey })));
      expect(plan.moduleExecutionOperations).toEqual([]);
    }
    expect(result.failed).toBe(0);
    expect(result.attempted).toBe(36);
    expect(result.destinationResults.filter((row) => row.bootstrapResult === "ALREADY_EXISTED")).toHaveLength(31);
    expect(result.destinationResults.filter((row) => row.bootstrapResult === "WOULD_CREATE")).toHaveLength(5);
    expect(result.destinationResults.filter((row) => row.catalogOperationKind === "UPDATE_EXISTING_CATALOG")).toHaveLength(26);
    expect(result.destinationResults.filter((row) => row.catalogOperationKind === "CREATE_CATALOG")).toHaveLength(5);
    expect(fake.log.some(({ text }) => text === "BEGIN" || text.startsWith("insert ") || text.startsWith("update ") || text.startsWith("delete "))).toBe(false);
  });

  it("dry-runs a first import with Lifestyle features without reading an undefined stored module", async () => {
    const destination = spec("lifestyle-first-import");
    destination.canonicalDestination.lifestyleFeatures = [{
      destination_key: "lifestyle-first-import",
      record_key: "lifestyle-first-import-feature-walkability",
      feature_group: "daily_life",
      feature_key: "walkability",
      feature_value: "HIGH",
      availability_level: "STRONG",
      proximity_band: "IN_DESTINATION",
      display_label: "Walkability",
      evidence_summary: "Compact test fixture.",
      source_name: "Fixture",
      source_url: "https://example.com",
      source_as_of_date: "2026-01-01",
      confidence: "HIGH",
      matching_enabled: "YES",
      display_enabled: "YES",
      notes: null,
    }];
    const fake = transactionalClient([{
      id: "legacy-id", slug: destination.bootstrapIdentity.slug, destinationKey: null,
      city: destination.bootstrapIdentity.city, country: destination.bootstrapIdentity.country,
      beachAccess: null, mountainOrSkiAccess: null, countryCode: null,
    }]);
    const prepared: DestinationPlan[] = [];
    const request = input([destination], fake.client, "DRY_RUN");

    const result = await executeGuardedDeterministicV31Batch({
      ...request,
      deps: { ...request.deps, observePreparedPlan: (plan) => { prepared.push(plan); } },
    });

    expect(result).toMatchObject({ batchOutcome: "COMPLETED", attempted: 1, failed: 0, totalStatementsExecuted: 0 });
    expect(prepared[0].moduleExecutionOperations).toEqual([
      expect.objectContaining({ module: "lifestyleFeatures", expectedBefore: [], expectedAfter: [expect.any(Object)] }),
    ]);
  });

  it("rejects an ambiguous canonical-key/legacy-slug resolution before any write", async () => {
    const destination = spec("ambiguous");
    const fake = transactionalClient([
      { id: "by-key", slug: "other", destinationKey: "ambiguous", beachAccess: null, mountainOrSkiAccess: null, countryCode: null },
      { id: "by-slug", slug: "ambiguous-slug", destinationKey: null, beachAccess: null, mountainOrSkiAccess: null, countryCode: null },
    ]);

    const result = await executeGuardedDeterministicV31Batch(input([destination], fake.client));

    expect(result.ok).toBe(false);
    expect(result.rejectionReason).toBe("CATALOG_IDENTITY_AMBIGUOUS:ambiguous");
    expect(fake.log.some(({ text }) => text === "BEGIN")).toBe(false);
  });
});
