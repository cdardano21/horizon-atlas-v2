import { describe, expect, it } from "vitest";

import type { DeterministicV31CanonicalDestination } from "../../../workbook-v31-deterministic-core";
import { loadFrozenWorkbookV31DeterministicImport } from "../../../workbook-v31-deterministic-core";
import { interpretOperationManifest } from "../manifest";
import { buildDestinationPlan } from "../plan-destination";
import { buildDestinationPlanWriteStatements, KEYED_CHILD_TABLE_CONFIG, REPLACE_MODULE_TABLE_CONFIG } from "../write-port";
import type {
  ApprovedDestinationScope,
  CanonicalDestinationKey,
  DestinationId,
  DiffPolicy,
  OperationManifest,
  ReplaceModuleExecutionModuleKey,
  ResolvedDestinationIdentity,
  StoredDestinationState,
} from "../types";

// End-to-end production-path tests: canonical input -> buildDestinationPlan -> expectedAfter ->
// buildDestinationPlanWriteStatements -> SQL parameters. These exist specifically to close the
// seam that let two prior defects (REPLACE_MODULE payload truncation, scores mutable-field
// comparison) survive 444 passing unit tests: earlier tests validated write-port and the
// normalizer in isolation, never the real planner->write-port hand-off.

const DESTINATION_KEY = "parity-fix-dest" as CanonicalDestinationKey;
const DESTINATION_ID = "parity-fix-dest-id" as DestinationId;

function approvedScope(): ApprovedDestinationScope {
  return Object.freeze([Object.freeze({ destinationKey: DESTINATION_KEY, destinationId: DESTINATION_ID })]);
}

function resolvedIdentity(): ResolvedDestinationIdentity {
  return Object.freeze({ destinationKey: DESTINATION_KEY, destinationId: DESTINATION_ID });
}

function diffPolicy(): DiffPolicy {
  return Object.freeze({ updateMode: "MERGE_NONBLANK", normalizationVersion: "v1", diffPolicyVersion: "v1", arrayOrderRule: "stable-key-order" });
}

const EMPTY_MODULE_ARRAYS = {
  facts: [], scores: [], neighborhoods: [], places: [], resources: [], media: [],
  costOfLiving: [], climateMonthly: [], housing: [], propertyResources: [], healthcare: [],
  visaResidency: [], taxesFinance: [], lgbtqInclusivity: [], safetyRisks: [], transportation: [],
  remoteWork: [], languageIntegration: [], pets: [], familyEducation: [], communitySocial: [],
  accessibility: [], bureaucracySetup: [], workBusiness: [], retirementAging: [], lifestyleLaws: [],
  realityCheck: [], moveChecklist: [], eventsSeasonality: [], sources: [],
};

function baseCanonical(overrides: Record<string, unknown> = {}): DeterministicV31CanonicalDestination {
  return {
    identity: { destinationKey: DESTINATION_KEY, slug: "parity-fix", name: "Parity Fix", city: "City", country: "Country" },
    editorial: { shortDescription: null, longDescription: null, currency: null, primaryLanguage: null, timeZone: null },
    ...EMPTY_MODULE_ARRAYS,
    environmentQuality: null,
    dailyLifePracticality: null,
    ...overrides,
  } as unknown as DeterministicV31CanonicalDestination;
}

function baseStored(overrides: Record<string, unknown> = {}): StoredDestinationState {
  return {
    identity: { destinationKey: DESTINATION_KEY, slug: "parity-fix", name: "Parity Fix", city: "City", country: "Country" },
    editorial: { shortDescription: null, longDescription: null, currency: null, primaryLanguage: null, timeZone: null },
    ...EMPTY_MODULE_ARRAYS,
    environmentQuality: null,
    dailyLifePracticality: null,
    ...overrides,
  } as unknown as StoredDestinationState;
}

function interpret(canonical: DeterministicV31CanonicalDestination, stored: StoredDestinationState, entries: OperationManifest["entries"] = []) {
  return interpretOperationManifest({
    manifest: { entries },
    canonicalDestinations: [canonical],
    approvedScope: approvedScope(),
    storedDestinationStateByKey: { [DESTINATION_KEY]: stored } as never,
  });
}

function plan(canonical: DeterministicV31CanonicalDestination, stored: StoredDestinationState, entries: OperationManifest["entries"] = []) {
  const manifestInterpretation = interpret(canonical, stored, entries);
  expect(manifestInterpretation.valid).toBe(true);
  return buildDestinationPlan({
    resolvedDestinationIdentity: resolvedIdentity(),
    canonicalDestination: canonical,
    storedDestinationState: stored,
    manifestInterpretation,
    diffPolicy: diffPolicy(),
    approvedScope: approvedScope(),
  });
}

const BOOLEAN_DB_COLUMNS = new Set(["public_transit_available", "nonstop_us_service", "private_care_available", "verified"]);

interface ReplaceModuleCase {
  readonly module: ReplaceModuleExecutionModuleKey;
  readonly canonicalRow: Record<string, unknown>;
}

// One sentinel per approved field, keyed by canonical field name, distinct per module/column so a
// truncated or misrouted field is unambiguous in a failure message. Boolean-coerced DB columns
// (verified/public_transit_available/nonstop_us_service) use "1" - any other sentinel text would
// legitimately coerce to null and defeat the test.
const REPLACE_MODULE_CASES: readonly ReplaceModuleCase[] = [
  {
    module: "costOfLiving",
    canonicalRow: {
      record_key: "row-1",
      category: "costOfLiving:category",
      monthly_low: "costOfLiving:monthly_low",
      monthly_high: "costOfLiving:monthly_high",
      currency: "costOfLiving:currency",
      household_type: "costOfLiving:household_type",
      lifestyle_tier: "costOfLiving:lifestyle_tier",
      stay_mode_key: "costOfLiving:stay_mode_key",
      verified: "1",
      verified_at: "costOfLiving:verified_at",
    },
  },
  {
    module: "housing",
    canonicalRow: {
      restrictions_summary: "housing:restrictions_summary",
      buying_process_summary: "housing:buying_process_summary",
      rental_rules_notes: "housing:rental_rules_notes",
      stay_mode_key: "housing:stay_mode_key",
      can_foreigners_buy: "housing:can_foreigners_buy",
      residency_required_to_buy: "housing:residency_required_to_buy",
      verified: "1",
      verified_at: "housing:verified_at",
    },
  },
  {
    module: "healthcare",
    canonicalRow: {
      system_summary: "healthcare:system_summary",
      public_access_foreigners: "healthcare:public_access_foreigners",
      international_insurance_notes: "healthcare:international_insurance_notes",
      private_care_available: "1",
      topic: "healthcare:topic",
      english_speaking_care: "healthcare:english_speaking_care",
      typical_gp_visit_cost: "healthcare:typical_gp_visit_cost",
      typical_specialist_cost: "healthcare:typical_specialist_cost",
      verified: "1",
      verified_at: "healthcare:verified_at",
    },
  },
  {
    module: "visaResidency",
    canonicalRow: {
      visa_type: "visaResidency:visa_type",
      permanent_residency_path: "visaResidency:permanent_residency_path",
      citizenship_path: "visaResidency:citizenship_path",
      stay_mode_key: "visaResidency:stay_mode_key",
      traveler_nationality: "visaResidency:traveler_nationality",
      verified: "1",
      verified_at: "visaResidency:verified_at",
    },
  },
  {
    module: "taxesFinance",
    canonicalRow: {
      summary: "taxesFinance:summary",
      income_tax_notes: "taxesFinance:notes",
      verified: "1",
      verified_at: "taxesFinance:verified_at",
    },
  },
  {
    module: "lgbtqInclusivity",
    canonicalRow: {
      evidence_summary: "lgbtqInclusivity:summary",
      community_scene: "lgbtqInclusivity:cultural_notes",
      overall_rating: "lgbtqInclusivity:overall_rating",
      legal_protections: "lgbtqInclusivity:legal_protections",
      social_acceptance: "lgbtqInclusivity:social_acceptance",
      pride_events: "lgbtqInclusivity:pride_events",
      nightlife_social: "lgbtqInclusivity:nightlife_social",
      healthcare_access: "lgbtqInclusivity:healthcare_access",
      areas_resources: "lgbtqInclusivity:areas_resources",
      safety_considerations: "lgbtqInclusivity:safety_considerations",
      verified: "1",
      verified_at: "lgbtqInclusivity:verified_at",
    },
  },
  {
    module: "safetyRisks",
    canonicalRow: {
      record_key: "row-1",
      risk_type: "safetyRisks:topic",
      severity: "safetyRisks:severity",
      summary: "safetyRisks:summary",
      verified: "1",
      verified_at: "safetyRisks:verified_at",
    },
  },
  {
    module: "transportation",
    canonicalRow: {
      summary: "transportation:summary",
      name: "transportation:name",
      public_transit_available: "1",
      topic: "transportation:topic",
      distance_km: "transportation:distance_km",
      typical_drive_minutes: "transportation:typical_drive_minutes",
      nonstop_us_service: "1",
      car_needed_rating: "transportation:car_needed_rating",
      parking_notes: "transportation:parking_notes",
      rideshare_notes: "transportation:rideshare_notes",
      verified: "1",
      verified_at: "transportation:verified_at",
    },
  },
  {
    module: "remoteWork",
    canonicalRow: {
      remote_work_notes: "remoteWork:remote_work_notes",
      avg_download_mbps: "remoteWork:avg_download_mbps",
      us_time_zone_fit: "remoteWork:us_time_zone_fit",
      fiber_available: "remoteWork:fiber_available",
      mobile_5g: "remoteWork:mobile_5g",
      utility_reliability: "remoteWork:utility_reliability",
      coworking_summary: "remoteWork:coworking_summary",
      verified: "1",
      verified_at: "remoteWork:verified_at",
    },
  },
  {
    module: "languageIntegration",
    canonicalRow: {
      integration_notes: "languageIntegration:summary",
      can_function_in_english: "languageIntegration:english_support",
      primary_language: "languageIntegration:primary_language",
      english_proficiency: "languageIntegration:english_proficiency",
      government_english_access: "languageIntegration:government_english_access",
      medical_english_access: "languageIntegration:medical_english_access",
      language_resources: "languageIntegration:language_resources",
      verified: "1",
      verified_at: "languageIntegration:verified_at",
    },
  },
  {
    module: "communitySocial",
    canonicalRow: {
      summary: "communitySocial:summary",
      clubs_groups: "communitySocial:social_notes",
      expat_presence: "communitySocial:expat_presence",
      volunteering: "communitySocial:volunteering",
      ease_meeting_people: "communitySocial:ease_meeting_people",
      age_mix: "communitySocial:age_mix",
      transient_vs_rooted: "communitySocial:transient_vs_rooted",
      verified: "1",
      verified_at: "communitySocial:verified_at",
    },
  },
];

describe("REQUIRED TEST 1 - full REPLACE_MODULE field pass-through (planner truncation + exhaustiveness guardrail)", () => {
  for (const testCase of REPLACE_MODULE_CASES) {
    it(`carries every write-port-approved field through the real planning path for ${testCase.module}`, () => {
      const canonical = baseCanonical({ [testCase.module]: [testCase.canonicalRow] });
      const stored = baseStored();
      const destinationPlan = plan(canonical, stored, [
        { destinationKey: DESTINATION_KEY, operation: "REPLACE_MODULE", targetModule: testCase.module as never, reason: "test" },
      ]);
      expect(destinationPlan.errors).toEqual([]);

      const operation = destinationPlan.moduleExecutionOperations.find((entry) => entry.module === testCase.module);
      expect(operation).toBeDefined();
      const row = operation!.expectedAfter[0] as Record<string, unknown>;
      const config = REPLACE_MODULE_TABLE_CONFIG[testCase.module];

      // Structural guardrail: every write-port-approved key must be PRESENT (not merely non-null)
      // on the planner's payload. This is what a future added-but-not-wired field would fail on,
      // independent of any per-field sentinel value below.
      for (const storedField of Object.keys(config.columns)) {
        expect(row).toHaveProperty(storedField);
      }

      // Value guardrail: every field must carry the REAL sentinel value through, not null.
      for (const [storedField, dbColumn] of Object.entries(config.columns)) {
        const expected = BOOLEAN_DB_COLUMNS.has(dbColumn) ? "1" : `${testCase.module}:${dbColumn}`;
        expect(row[storedField]).toBe(expected);
      }

      // Prove it survives all the way to the generated SQL parameters too.
      const statements = buildDestinationPlanWriteStatements(destinationPlan);
      const insertStatement = statements.find((statement) => statement.text.startsWith(`insert into public.${config.table}`));
      expect(insertStatement).toBeDefined();
      const expectedValues = Object.entries(config.columns).map(([, dbColumn]) =>
        BOOLEAN_DB_COLUMNS.has(dbColumn)
          ? true
          : testCase.module === "healthcare" && (dbColumn === "typical_gp_visit_cost" || dbColumn === "typical_specialist_cost")
            ? null
            : `${testCase.module}:${dbColumn}`,
      );
      if (testCase.module === "healthcare") {
        expectedValues.push({
          typical_gp_visit_cost_qualifier: "healthcare:typical_gp_visit_cost",
          typical_specialist_cost_qualifier: "healthcare:typical_specialist_cost",
        } as never);
      }
      expect(insertStatement!.values.slice(3)).toEqual(expectedValues);
    });
  }
});

describe("REQUIRED TEST 2/3/4 - scores mutable-field comparison", () => {
  it("classifies same identity + changed verified/verifiedAt as UPDATE_CHILD, not UNCHANGED_CHILD or CREATE_CHILD", () => {
    // Real parsed canonical destinations add a camelCase alias for facts/scores fields alongside
    // the raw snake_case workbook column names (see write-port.ts's KEYED_CHILD_CANONICAL_FALLBACK_FIELD
    // comment) - both are set here so this fixture matches the real parser's shape.
    const canonical = baseCanonical({
      scores: [{ score_key: "s1", scoreKey: "s1", score_value: "90", scoreValue: "90", score_label: "Great", scoreLabel: "Great", methodology_version: "v1", verified: "1", verified_at: "2026-01-01" }],
    });
    const stored = baseStored({
      scores: [{ scoreKey: "s1", scoreValue: "90", scoreLabel: "Great", methodologyVersion: "v1", verified: null, verifiedAt: null }],
    });
    const destinationPlan = plan(canonical, stored);

    const scoreOps = destinationPlan.childOperations.filter((operation) => operation.module === "scores");
    expect(scoreOps).toHaveLength(1);
    expect(scoreOps[0].kind).toBe("UPDATE_CHILD");
    expect(scoreOps.some((operation) => operation.kind === "CREATE_CHILD")).toBe(false);

    const statements = buildDestinationPlanWriteStatements(destinationPlan);
    const scoreStatement = statements.find((statement) => statement.text.includes(KEYED_CHILD_TABLE_CONFIG.scores.table));
    expect(scoreStatement).toBeDefined();
    expect(scoreStatement!.values).toEqual(["parity-fix-dest-id", "parity-fix-dest", "s1", "90", "Great", true, "2026-01-01"]);
  });

  it("classifies an identical score row as UNCHANGED_CHILD with no SQL", () => {
    const canonical = baseCanonical({
      scores: [{ score_key: "s1", scoreKey: "s1", score_value: "90", scoreValue: "90", score_label: "Great", scoreLabel: "Great", verified: "1", verified_at: "2026-01-01" }],
    });
    const stored = baseStored({
      scores: [{ scoreKey: "s1", scoreValue: "90", scoreLabel: "Great", verified: "1", verifiedAt: "2026-01-01" }],
    });
    const destinationPlan = plan(canonical, stored);

    const scoreOps = destinationPlan.childOperations.filter((operation) => operation.module === "scores");
    expect(scoreOps).toHaveLength(1);
    expect(scoreOps[0].kind).toBe("UNCHANGED_CHILD");

    const statements = buildDestinationPlanWriteStatements(destinationPlan);
    expect(statements.some((statement) => statement.text.includes(KEYED_CHILD_TABLE_CONFIG.scores.table))).toBe(false);
  });

  it("does not produce a duplicate CREATE_CHILD for an existing key with only mutable metadata changed", () => {
    const canonical = baseCanonical({
      scores: [{ score_key: "s1", scoreKey: "s1", score_value: "90", scoreValue: "90", score_label: "Great", scoreLabel: "Great", verified: "1", verified_at: "2026-01-01" }],
    });
    const stored = baseStored({
      scores: [{ scoreKey: "s1", scoreValue: "90", scoreLabel: "Great", verified: null, verifiedAt: null }],
    });
    const destinationPlan = plan(canonical, stored);

    const scoreOps = destinationPlan.childOperations.filter((operation) => operation.module === "scores" && operation.stableChildKey === "s1");
    expect(scoreOps).toHaveLength(1);
    expect(scoreOps[0].kind).toBe("UPDATE_CHILD");
  });
});

describe("REQUIRED TEST 5 - blank preservation through the real planning path", () => {
  it("keeps genuinely blank canonical fields null in expectedAfter and the SQL parameter, with no invented fallback", () => {
    const canonical = baseCanonical({
      housing: [{
        restrictions_summary: "housing:restrictions_summary",
        buying_process_summary: null,
        rental_rules_notes: null,
        stay_mode_key: null,
        can_foreigners_buy: null,
        residency_required_to_buy: null,
        verified: null,
        verified_at: null,
      }],
    });
    const stored = baseStored();
    const destinationPlan = plan(canonical, stored, [
      { destinationKey: DESTINATION_KEY, operation: "REPLACE_MODULE", targetModule: "housing" as never, reason: "test" },
    ]);

    const operation = destinationPlan.moduleExecutionOperations.find((entry) => entry.module === "housing");
    const row = operation!.expectedAfter[0] as Record<string, unknown>;
    expect(row.summary).toBe("housing:restrictions_summary");
    expect(row.buyingSummary).toBeNull();
    expect(row.canForeignersBuy).toBeNull();
    expect(row.verified).toBeNull();
    expect(row.verifiedAt).toBeNull();

    const statements = buildDestinationPlanWriteStatements(destinationPlan);
    const insertStatement = statements.find((statement) => statement.text.startsWith("insert into public.premium_housing_property"));
    expect(insertStatement!.values.slice(3)).toEqual(["housing:restrictions_summary", null, null, null, null, null, null, null]);
  });
});

describe("REQUIRED TEST 6 - \"1\"/\"0\" boolean coercion through the real planning path", () => {
  it("coerces verified, public_transit_available and nonstop_us_service and leaves narrative text/blank as null", () => {
    const canonical = baseCanonical({
      transportation: [
        { summary: "row-1", public_transit_available: "1", nonstop_us_service: "0", verified: "1" },
        { summary: "row-2", public_transit_available: "Limited", nonstop_us_service: null, verified: "0" },
      ],
    });
    const stored = baseStored();
    const destinationPlan = plan(canonical, stored, [
      { destinationKey: DESTINATION_KEY, operation: "REPLACE_MODULE", targetModule: "transportation" as never, reason: "test" },
    ]);

    const statements = buildDestinationPlanWriteStatements(destinationPlan);
    const inserts = statements.filter((statement) => statement.text.startsWith("insert into public.premium_transport_airports"));
    expect(inserts).toHaveLength(2);

    const config = REPLACE_MODULE_TABLE_CONFIG.transportation;
    const columnOrder = Object.values(config.columns);
    const transitIndex = columnOrder.indexOf("public_transit_available");
    const nonstopIndex = columnOrder.indexOf("nonstop_us_service");
    const verifiedIndex = columnOrder.indexOf("verified");

    expect(inserts[0].values.slice(3)[transitIndex]).toBe(true);
    expect(inserts[0].values.slice(3)[nonstopIndex]).toBe(false);
    expect(inserts[0].values.slice(3)[verifiedIndex]).toBe(true);

    expect(inserts[1].values.slice(3)[transitIndex]).toBeNull();
    expect(inserts[1].values.slice(3)[nonstopIndex]).toBeNull();
    expect(inserts[1].values.slice(3)[verifiedIndex]).toBe(false);
  });
});

describe("REQUIRED TEST 7 - real Lisbon frozen-workbook fixture through the real production path (read-only, no DB writes)", () => {
  it("proves the same production path that will later execute the real repair produces the proven non-null workbook values", async () => {
    const workbookImport = await loadFrozenWorkbookV31DeterministicImport();
    expect(workbookImport.validationErrors ?? []).toEqual([]);
    const lisbon = workbookImport.canonicalDestinations?.find((destination) => destination.identity.destinationKey === "lisbon-pt");
    expect(lisbon).toBeDefined();

    const lisbonId = "lisbon-fixture-id" as DestinationId;
    const lisbonKey = "lisbon-pt" as CanonicalDestinationKey;
    const scope: ApprovedDestinationScope = Object.freeze([Object.freeze({ destinationKey: lisbonKey, destinationId: lisbonId })]);

    // Current DB state mirrors the confirmed real pre-repair state: REPLACE_MODULE rows already
    // exist with the OLD field set only, and scores rows exist with verified/verifiedAt missing.
    const currentScores = (lisbon!.scores as ReadonlyArray<Record<string, unknown>>).map((score) => ({
      scoreKey: score.scoreKey ?? score.score_key,
      scoreValue: score.scoreValue ?? score.score_value,
      scoreLabel: score.scoreLabel ?? score.score_label,
      verified: null,
      verifiedAt: null,
    }));
    const currentState = baseStored({
      identity: { destinationKey: lisbonKey, slug: "lisbon-portugal", name: "Lisbon", city: "Lisbon", country: "Portugal" },
      scores: currentScores,
    });

    const manifestEntries: OperationManifest["entries"] = (
      ["housing", "healthcare", "visaResidency", "taxesFinance", "lgbtqInclusivity", "safetyRisks", "transportation", "remoteWork", "languageIntegration", "communitySocial", "costOfLiving"] as const
    ).map((module) => ({ destinationKey: lisbonKey, operation: "REPLACE_MODULE" as const, targetModule: module as never, reason: "lisbon-fixture-test" }));

    const manifestInterpretation = interpretOperationManifest({
      manifest: { entries: manifestEntries },
      canonicalDestinations: [lisbon as unknown as DeterministicV31CanonicalDestination],
      approvedScope: scope,
      storedDestinationStateByKey: { [lisbonKey]: currentState } as never,
    });
    expect(manifestInterpretation.valid).toBe(true);

    const destinationPlan = buildDestinationPlan({
      resolvedDestinationIdentity: { destinationKey: lisbonKey, destinationId: lisbonId },
      canonicalDestination: lisbon as unknown as DeterministicV31CanonicalDestination,
      storedDestinationState: currentState,
      manifestInterpretation,
      diffPolicy: diffPolicy(),
      approvedScope: scope,
    });
    expect(destinationPlan.errors).toEqual([]);

    const statements = buildDestinationPlanWriteStatements(destinationPlan);

    const visaInsert = statements.find((statement) => statement.text.startsWith("insert into public.premium_visa_residency"));
    expect(visaInsert!.values).toContain("U.S. citizen");
    expect(visaInsert!.values).toContain(true); // verified "1" -> true

    const housingInsert = statements.find((statement) => statement.text.startsWith("insert into public.premium_housing_property"));
    expect(housingInsert!.values).toContain("Yes");
    expect(housingInsert!.values).toContain("No");

    const remoteWorkInsert = statements.find((statement) => statement.text.startsWith("insert into public.premium_connectivity_remote_work"));
    expect(remoteWorkInsert!.values).toContain("Widely available in urban areas");

    const languageInsert = statements.find((statement) => statement.text.startsWith("insert into public.premium_language_integration"));
    expect(languageInsert!.values).toContain("Portuguese");

    const communityInsert = statements.find((statement) => statement.text.startsWith("insert into public.premium_community_social"));
    expect(communityInsert!.values).toContain("High");

    const transportInserts = statements.filter((statement) => statement.text.startsWith("insert into public.premium_transport_airports"));
    expect(transportInserts.length).toBeGreaterThan(0);
    expect(transportInserts.some((statement) => statement.values.includes("airport"))).toBe(true);
    expect(transportInserts.some((statement) => statement.values.includes("8"))).toBe(true);
    expect(transportInserts.some((statement) => statement.values.includes(true))).toBe(true);

    // Scores: current rows share identity/content with the workbook but are missing verified
    // metadata - this must produce UPDATE_CHILD (proving Fix B end-to-end on real data), never
    // CREATE_CHILD (which would indicate the planner didn't recognize the existing rows).
    const scoreOps = destinationPlan.childOperations.filter((operation) => operation.module === "scores");
    expect(scoreOps.length).toBeGreaterThan(0);
    expect(scoreOps.every((operation) => operation.kind === "UPDATE_CHILD")).toBe(true);
    const scoreStatements = statements.filter((statement) => statement.text.includes(KEYED_CHILD_TABLE_CONFIG.scores.table));
    expect(scoreStatements.length).toBe(scoreOps.length);
    // Real Lisbon scores carry verified="0" (proven false via boolean coercion) and a real
    // verified_at date - the proof is that every statement carries a real boolean and a non-null
    // verified_at, not that any particular row happens to be true.
    expect(scoreStatements.every((statement) => statement.values.some((value) => typeof value === "boolean"))).toBe(true);
    expect(scoreStatements.every((statement) => statement.values.includes("2026-08-08"))).toBe(true);
  });
});

describe("REQUIRED TEST - real Lisbon already-repaired scores produce zero score UPDATE_CHILD (idempotency proof)", () => {
  it("classifies already-repaired scores against the real workbook as UNCHANGED_CHILD, closing the reported idempotency gap", async () => {
    const workbookImport = await loadFrozenWorkbookV31DeterministicImport();
    const lisbon = workbookImport.canonicalDestinations?.find((destination) => destination.identity.destinationKey === "lisbon-pt");
    expect(lisbon).toBeDefined();

    const lisbonId = "lisbon-fixture-id" as DestinationId;
    const lisbonKey = "lisbon-pt" as CanonicalDestinationKey;
    const scope: ApprovedDestinationScope = Object.freeze([Object.freeze({ destinationKey: lisbonKey, destinationId: lisbonId })]);

    // Current DB state mirrors the ACTUAL already-repaired representation confirmed via raw SQL
    // ground truth: verified is a Postgres boolean stringified back to "true"/"false", verifiedAt
    // is a timestamptz stringified to a full ISO instant - not the workbook's raw "0"/"1"/bare date.
    const currentScores = (lisbon!.scores as ReadonlyArray<Record<string, unknown>>).map((score) => {
      const rawVerified = String(score.verified ?? score.verified);
      const rawVerifiedAt = (score.verifiedAt ?? score.verified_at) as string | null;
      return {
        scoreKey: score.scoreKey ?? score.score_key,
        scoreValue: score.scoreValue ?? score.score_value,
        scoreLabel: score.scoreLabel ?? score.score_label,
        verified: rawVerified.trim() === "1" ? "true" : rawVerified.trim() === "0" ? "false" : null,
        verifiedAt: rawVerifiedAt ? `${rawVerifiedAt}T00:00:00+00:00` : null,
      };
    });
    const currentState = baseStored({
      identity: { destinationKey: lisbonKey, slug: "lisbon-portugal", name: "Lisbon", city: "Lisbon", country: "Portugal" },
      scores: currentScores,
    });

    const manifestInterpretation = interpretOperationManifest({
      manifest: { entries: [] },
      canonicalDestinations: [lisbon as unknown as DeterministicV31CanonicalDestination],
      approvedScope: scope,
      storedDestinationStateByKey: { [lisbonKey]: currentState } as never,
    });
    expect(manifestInterpretation.valid).toBe(true);

    const destinationPlan = buildDestinationPlan({
      resolvedDestinationIdentity: { destinationKey: lisbonKey, destinationId: lisbonId },
      canonicalDestination: lisbon as unknown as DeterministicV31CanonicalDestination,
      storedDestinationState: currentState,
      manifestInterpretation,
      diffPolicy: diffPolicy(),
      approvedScope: scope,
    });

    const scoreOps = destinationPlan.childOperations.filter((operation) => operation.module === "scores");
    expect(scoreOps.length).toBeGreaterThan(0);
    expect(scoreOps.every((operation) => operation.kind === "UNCHANGED_CHILD")).toBe(true);
    expect(scoreOps.some((operation) => operation.kind === "UPDATE_CHILD")).toBe(false);

    const statements = buildDestinationPlanWriteStatements(destinationPlan);
    const scoreStatements = statements.filter((statement) => statement.text.includes(KEYED_CHILD_TABLE_CONFIG.scores.table));
    expect(scoreStatements).toHaveLength(0);
  });
});
