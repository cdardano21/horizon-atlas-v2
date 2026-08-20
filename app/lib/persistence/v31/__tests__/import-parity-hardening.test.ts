import { describe, expect, it } from "vitest";
import { buildDestinationPlanWriteStatements } from "../write-port";
import { createSupabasePersistedDestinationReadPort, type PersistedDestinationSupabaseReadClient } from "../supabase-persisted-destination-read-port";
import { mapCanonicalDestinationToStoredState } from "../map-canonical-destination-to-stored-state";
import { projectCanonicalComparable, projectStoredComparable } from "../comparable-projection";
import type {
  CanonicalDestinationKey,
  ChildOperation,
  DestinationId,
  DestinationPlan,
  ModuleExecutionOperation,
  ResolvedDestinationIdentity,
  ScoreKey,
} from "../types";
import type { DeterministicV31CanonicalDestination } from "../../../workbook-v31-deterministic-core";

// Phase 0 (Intelligence v2 prerequisite): import-parity hardening tests.
// Proves that verified/verified_at, VISA_RESIDENCY stay_mode_key, HOUSING_PROPERTY
// can_foreigners_buy/residency_required_to_buy, HEALTHCARE_INSURANCE topic/english_speaking_care/cost
// fields, and the previously-unmapped LGBTQ_INCLUSIVITY fields now survive the full
// workbook -> write-port -> Supabase -> read-port round trip, using the same fake-client
// patterns already established in write-port.test.ts and supabase-persisted-destination-read-port.test.ts.

const DEST_KEY = "import-parity-test" as CanonicalDestinationKey;
const DEST_ID = "22222222-2222-2222-2222-222222222222" as DestinationId;

function identity(): ResolvedDestinationIdentity {
  return { destinationKey: DEST_KEY, destinationId: DEST_ID };
}

function basePlan(overrides: { moduleExecutionOperations?: readonly ModuleExecutionOperation[]; childOperations?: readonly ChildOperation[] } = {}): DestinationPlan {
  return {
    destinationIdentity: identity(),
    action: "UPDATE",
    scalarOperations: [],
    childOperations: overrides.childOperations ?? [],
    moduleExecutionOperations: overrides.moduleExecutionOperations ?? [],
    errors: [],
    warnings: [],
  } as unknown as DestinationPlan;
}

class FakeSupabaseReadClient implements PersistedDestinationSupabaseReadClient {
  constructor(private readonly rowsByTable: Record<string, readonly Record<string, unknown>[]>) {}

  async selectRows(args: { readonly table: string; readonly select: string }) {
    return this.rowsByTable[args.table] ?? [];
  }
}

describe("import-parity hardening: verified / verified_at", () => {
  it("verified=true survives write-port -> DB column for every fixed module (boolean coercion applied uniformly)", () => {
    const moduleExecutionOperations: ModuleExecutionOperation[] = [
      { kind: "REPLACE_MODULE", module: "safetyRisks", expectedBefore: [], expectedAfter: [{ itemKey: "r1", topic: "flood", severity: "medium", summary: "Occasional", verified: "TRUE", verifiedAt: "2026-01-01T00:00:00Z" }] },
    ];
    const statements = buildDestinationPlanWriteStatements(basePlan({ moduleExecutionOperations }));
    // insert statement values: [destId, destKey, record_key, topic, severity, summary, verified, verifiedAt]
    expect(statements[1].values).toEqual([DEST_ID, DEST_KEY, "record-1", "flood", "medium", "Occasional", true, "2026-01-01T00:00:00Z"]);
  });

  it("verified='false' (not 'true') coerces to false rather than null, and blank verified stays null", () => {
    const moduleExecutionOperations: ModuleExecutionOperation[] = [
      { kind: "REPLACE_MODULE", module: "taxesFinance", expectedBefore: [], expectedAfter: [
        { summary: "Simple", notes: "No issues", verified: "false", verifiedAt: null },
      ] },
    ];
    const statements = buildDestinationPlanWriteStatements(basePlan({ moduleExecutionOperations }));
    expect(statements[1].values).toEqual([DEST_ID, DEST_KEY, "record-1", "Simple", "No issues", false, null]);
  });

  it("verified='1'/'0' (the frozen workbook's real XLSX boolean cell encoding) coerces correctly, unlike a bare true/false-only check would", () => {
    const moduleExecutionOperations: ModuleExecutionOperation[] = [
      { kind: "REPLACE_MODULE", module: "safetyRisks", expectedBefore: [], expectedAfter: [
        { itemKey: "r1", topic: "flood", severity: "medium", summary: "Occasional", verified: "1", verifiedAt: "2026-08-07" },
        { itemKey: "r2", topic: "heat", severity: "low", summary: "Rare", verified: "0", verifiedAt: "2026-08-07" },
      ] },
    ];
    const statements = buildDestinationPlanWriteStatements(basePlan({ moduleExecutionOperations }));
    expect(statements[1].values).toEqual([DEST_ID, DEST_KEY, "record-1", "flood", "medium", "Occasional", true, "2026-08-07"]);
    expect(statements[2].values).toEqual([DEST_ID, DEST_KEY, "record-2", "heat", "low", "Rare", false, "2026-08-07"]);
  });

  it("recognizes public_transit_available='1'/'0' (confirmed real workbook encoding on some rows), while narrative text like 'Limited' still stays null", () => {
    const moduleExecutionOperations: ModuleExecutionOperation[] = [
      { kind: "REPLACE_MODULE", module: "transportation", expectedBefore: [], expectedAfter: [
        { summary: "A", airportSummary: "Airport A", transitSummary: "1" },
        { summary: "B", airportSummary: "Airport B", transitSummary: "Limited" },
      ] },
    ];
    const statements = buildDestinationPlanWriteStatements(basePlan({ moduleExecutionOperations }));
    expect(statements[1].values).toEqual([DEST_ID, DEST_KEY, "record-1", "A", "Airport A", true, null, null, null, null, null, null, null, null, null]);
    expect(statements[2].values).toEqual([DEST_ID, DEST_KEY, "record-2", "B", "Airport B", null, null, null, null, null, null, null, null, null, null]);
  });

  it("verified_at reads back through the loader for a module that previously had no verified_at column at all (lgbtqInclusivity)", async () => {
    const client = new FakeSupabaseReadClient({
      premium_lgbtq_inclusivity: [{
        destination_id: DEST_ID, destination_key: DEST_KEY, position: 1,
        summary: "Welcoming", cultural_notes: "Active scene",
        overall_rating: "High", legal_protections: "Protected", social_acceptance: "Strong",
        pride_events: "Annual pride", nightlife_social: "Several venues", healthcare_access: "LGBTQ-friendly clinics",
        areas_resources: "Community center downtown", safety_considerations: "Generally safe",
        verified: true, verified_at: "2026-02-01T00:00:00Z",
      }],
    });
    const port = createSupabasePersistedDestinationReadPort(client);
    const result = await port.readReplaceModules(identity());
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected success");

    const lgbtq = (result.value as { lgbtqInclusivity: readonly Record<string, unknown>[] }).lgbtqInclusivity[0];
    expect(lgbtq.overallRating).toBe("High");
    expect(lgbtq.legalProtections).toBe("Protected");
    expect(lgbtq.socialAcceptance).toBe("Strong");
    expect(lgbtq.prideEvents).toBe("Annual pride");
    expect(lgbtq.nightlifeSocial).toBe("Several venues");
    expect(lgbtq.healthcareAccess).toBe("LGBTQ-friendly clinics");
    expect(lgbtq.areasResources).toBe("Community center downtown");
    expect(lgbtq.safetyConsiderations).toBe("Generally safe");
    expect(lgbtq.verified).toBe("true");
    expect(lgbtq.verifiedAt).toBe("2026-02-01T00:00:00Z");
  });
});

describe("import-parity hardening: VISA_RESIDENCY stay_mode_key", () => {
  it("stay_mode_key survives write-port insert", () => {
    const moduleExecutionOperations: ModuleExecutionOperation[] = [
      { kind: "REPLACE_MODULE", module: "visaResidency", expectedBefore: [], expectedAfter: [
        { summary: "D7", residencyPath: "Long", citizenshipPath: "Long", stayModeKey: "LONG_TERM_PERMANENT", verified: null, verifiedAt: null },
      ] },
    ];
    const statements = buildDestinationPlanWriteStatements(basePlan({ moduleExecutionOperations }));
    expect(statements[1].values).toEqual([DEST_ID, DEST_KEY, "record-1", "D7", "Long", "Long", "LONG_TERM_PERMANENT", null, null, null]);
  });

  it("stay_mode_key reads back through the loader", async () => {
    const client = new FakeSupabaseReadClient({
      premium_visa_residency: [{ destination_id: DEST_ID, destination_key: DEST_KEY, record_key: "v1", visa_type: "D7", permanent_residency_path: "Long", citizenship_path: "Long", stay_mode_key: "LONG_TERM_PERMANENT", verified: false, verified_at: null }],
    });
    const port = createSupabasePersistedDestinationReadPort(client);
    const result = await port.readReplaceModules(identity());
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected success");
    const visa = (result.value as { visaResidency: readonly Record<string, unknown>[] }).visaResidency[0];
    expect(visa.stayModeKey).toBe("LONG_TERM_PERMANENT");
  });
});

describe("import-parity hardening: HOUSING_PROPERTY can_foreigners_buy / residency_required_to_buy", () => {
  it("both fields survive write-port insert", () => {
    const moduleExecutionOperations: ModuleExecutionOperation[] = [
      { kind: "REPLACE_MODULE", module: "housing", expectedBefore: [], expectedAfter: [
        { summary: "Open market", buyingSummary: "Straightforward", rentalSummary: "Common", stayModeKey: null, canForeignersBuy: "YES", residencyRequiredToBuy: "NO", verified: null, verifiedAt: null },
      ] },
    ];
    const statements = buildDestinationPlanWriteStatements(basePlan({ moduleExecutionOperations }));
    expect(statements[1].values).toEqual([DEST_ID, DEST_KEY, "record-1", "Open market", "Straightforward", "Common", null, "YES", "NO", null, null]);
  });

  it("both fields read back through the loader instead of staying null forever", async () => {
    const client = new FakeSupabaseReadClient({
      premium_housing_property: [{ destination_id: DEST_ID, destination_key: DEST_KEY, record_key: "h1", restrictions_summary: "Open", buying_process_summary: "Easy", rental_rules_notes: "Common", stay_mode_key: null, can_foreigners_buy: "YES", residency_required_to_buy: "NO", verified: true, verified_at: "2026-01-15T00:00:00Z" }],
    });
    const port = createSupabasePersistedDestinationReadPort(client);
    const result = await port.readReplaceModules(identity());
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected success");
    const housing = (result.value as { housing: readonly Record<string, unknown>[] }).housing[0];
    expect(housing.canForeignersBuy).toBe("YES");
    expect(housing.residencyRequiredToBuy).toBe("NO");
    expect(housing.verified).toBe("true");
    expect(housing.verifiedAt).toBe("2026-01-15T00:00:00Z");
  });
});

describe("import-parity hardening: HEALTHCARE_INSURANCE structured fields", () => {
  it("topic, english_speaking_care, and both cost fields survive write-port insert", () => {
    const moduleExecutionOperations: ModuleExecutionOperation[] = [
      { kind: "REPLACE_MODULE", module: "healthcare", expectedBefore: [], expectedAfter: [
        { summary: "Good system", publicAccessSummary: "Open", insuranceSummary: "Recommended", topic: "general", englishSpeakingCare: "Widely available", typicalGpVisitCost: "40", typicalSpecialistCost: "120", verified: null, verifiedAt: null },
      ] },
    ];
    const statements = buildDestinationPlanWriteStatements(basePlan({ moduleExecutionOperations }));
    expect(statements[1].values).toEqual([DEST_ID, DEST_KEY, "record-1", "Good system", "Open", "Recommended", "general", "Widely available", "40", "120", null, null]);
  });

  it("all four fields read back through the loader", async () => {
    const client = new FakeSupabaseReadClient({
      premium_healthcare_insurance: [{ destination_id: DEST_ID, destination_key: DEST_KEY, record_key: "hc1", system_summary: "Good", public_access_foreigners: "Open", international_insurance_notes: "Recommended", topic: "general", english_speaking_care: "Widely available", typical_gp_visit_cost: 40, typical_specialist_cost: 120, verified: false, verified_at: null }],
    });
    const port = createSupabasePersistedDestinationReadPort(client);
    const result = await port.readReplaceModules(identity());
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected success");
    const healthcare = (result.value as { healthcare: readonly Record<string, unknown>[] }).healthcare[0];
    expect(healthcare.topic).toBe("general");
    expect(healthcare.englishSpeakingCare).toBe("Widely available");
    expect(healthcare.typicalGpVisitCost).toBe("40");
    expect(healthcare.typicalSpecialistCost).toBe("120");
  });
});

describe("import-parity hardening: blank workbook fields remain blank (no invented fallback)", () => {
  it("a destination with no verified/stay_mode_key/can_foreigners_buy values writes and reads back as null, never a fabricated default", async () => {
    const moduleExecutionOperations: ModuleExecutionOperation[] = [
      { kind: "REPLACE_MODULE", module: "housing", expectedBefore: [], expectedAfter: [
        { summary: "Open market", buyingSummary: null, rentalSummary: null, stayModeKey: null, canForeignersBuy: null, residencyRequiredToBuy: null, verified: null, verifiedAt: null },
      ] },
    ];
    const statements = buildDestinationPlanWriteStatements(basePlan({ moduleExecutionOperations }));
    expect(statements[1].values).toEqual([DEST_ID, DEST_KEY, "record-1", "Open market", null, null, null, null, null, null, null]);

    const client = new FakeSupabaseReadClient({
      premium_housing_property: [{ destination_id: DEST_ID, destination_key: DEST_KEY, record_key: "h1", restrictions_summary: "Open market", buying_process_summary: null, rental_rules_notes: null, stay_mode_key: null, can_foreigners_buy: null, residency_required_to_buy: null, verified: null, verified_at: null }],
    });
    const port = createSupabasePersistedDestinationReadPort(client);
    const result = await port.readReplaceModules(identity());
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected success");
    const housing = (result.value as { housing: readonly Record<string, unknown>[] }).housing[0];
    expect(housing.canForeignersBuy).toBeNull();
    expect(housing.residencyRequiredToBuy).toBeNull();
    expect(housing.stayModeKey).toBeNull();
    expect(housing.verified).toBeNull();
    expect(housing.verifiedAt).toBeNull();
  });
});

describe("import-parity hardening: no cross-destination contamination", () => {
  it("REPLACE_MODULE delete/insert for the fixed modules still scopes strictly to this destination_id + destination_key", () => {
    const moduleExecutionOperations: ModuleExecutionOperation[] = [
      { kind: "REPLACE_MODULE", module: "visaResidency", expectedBefore: [], expectedAfter: [
        { summary: "D7", residencyPath: "Long", citizenshipPath: "Long", stayModeKey: "LONG_TERM_PERMANENT", verified: "true", verifiedAt: null },
      ] },
    ];
    const statements = buildDestinationPlanWriteStatements(basePlan({ moduleExecutionOperations }));
    expect(statements[0].text).toBe("delete from public.premium_visa_residency where destination_id = $1 and destination_key = $2");
    expect(statements[0].values).toEqual([DEST_ID, DEST_KEY]);
    expect(statements[1].values[0]).toBe(DEST_ID);
    expect(statements[1].values[1]).toBe(DEST_KEY);
  });
});

describe("import-parity hardening: idempotent re-import", () => {
  it("mapping the same canonical destination to stored state twice produces identical comparable projections (deterministic, no drift)", () => {
    const canonicalFixture = {
      identity: { destinationKey: "idempotent-test", slug: "idempotent-test", name: "Idempotent Test", city: "Idempotent Test", country: "Testland" },
      editorial: { shortDescription: null, longDescription: null, currency: null, primaryLanguage: null, timeZone: null },
      facts: [], scores: [], neighborhoods: [], places: [], resources: [], media: [],
      costOfLiving: [{ destination_key: "idempotent-test", record_key: "food", category: "Food", monthly_low: "1000", monthly_high: "1500", currency: "USD", household_type: null, lifestyle_tier: null, included_notes: null, stay_mode_key: "LONG_TERM_PERMANENT", source_name: null, source_url: null, verified: "TRUE", verified_at: "2026-01-01T00:00:00Z" }],
      climateMonthly: [], propertyResources: [],
      housing: [{ destination_key: "idempotent-test", record_key: "h1", housing_topic: null, stay_mode_key: null, can_foreigners_buy: "YES", residency_required_to_buy: "NO", restrictions_summary: "Open", typical_condo_price: null, typical_house_price: null, typical_villa_price: null, price_per_sqm: null, currency: null, property_tax_notes: null, transfer_tax_notes: null, closing_cost_notes: null, hoa_condo_fee_notes: null, foreigner_mortgage_notes: null, typical_down_payment_pct: null, rental_rules_notes: null, buying_process_summary: null, source_name: null, source_url: null, verified: null, verified_at: null }],
      healthcare: [], visaResidency: [], taxesFinance: [], lgbtqInclusivity: [], safetyRisks: [],
      transportation: [], remoteWork: [], languageIntegration: [], pets: [], familyEducation: [],
      communitySocial: [], accessibility: [], bureaucracySetup: [], workBusiness: [], retirementAging: [],
      lifestyleLaws: [], realityCheck: [], moveChecklist: [], environmentQuality: null, dailyLifePracticality: null,
      eventsSeasonality: [], sources: [],
    } as unknown as DeterministicV31CanonicalDestination;

    const firstPass = projectCanonicalComparable(canonicalFixture);
    const secondPass = projectCanonicalComparable(canonicalFixture);
    expect(firstPass).toEqual(secondPass);

    const storedState = mapCanonicalDestinationToStoredState(canonicalFixture);
    expect(projectStoredComparable(storedState)).toEqual(firstPass);
  });
});

describe("import-parity hardening: VISA_RESIDENCY traveler_nationality", () => {
  it("survives write-port insert", () => {
    const moduleExecutionOperations: ModuleExecutionOperation[] = [
      { kind: "REPLACE_MODULE", module: "visaResidency", expectedBefore: [], expectedAfter: [
        { summary: "D7", residencyPath: "Long", citizenshipPath: "Long", stayModeKey: "LONG_TERM_PERMANENT", travelerNationality: "US", verified: null, verifiedAt: null },
      ] },
    ];
    const statements = buildDestinationPlanWriteStatements(basePlan({ moduleExecutionOperations }));
    expect(statements[1].values).toEqual([DEST_ID, DEST_KEY, "record-1", "D7", "Long", "Long", "LONG_TERM_PERMANENT", "US", null, null]);
  });

  it("reads back through the loader, alongside stay_mode_key, verified, and verified_at, in one row", async () => {
    const client = new FakeSupabaseReadClient({
      premium_visa_residency: [{
        destination_id: DEST_ID, destination_key: DEST_KEY, record_key: "v1",
        visa_type: "D7", permanent_residency_path: "Long", citizenship_path: "Long",
        stay_mode_key: "LONG_TERM_PERMANENT", traveler_nationality: "US", verified: true, verified_at: "2026-08-07",
      }],
    });
    const port = createSupabasePersistedDestinationReadPort(client);
    const result = await port.readReplaceModules(identity());
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected success");
    const visa = (result.value as { visaResidency: readonly Record<string, unknown>[] }).visaResidency[0];
    expect(visa.travelerNationality).toBe("US");
    expect(visa.stayModeKey).toBe("LONG_TERM_PERMANENT");
    expect(visa.verified).toBe("true");
    expect(visa.verifiedAt).toBe("2026-08-07");
  });

  it("blank traveler_nationality remains null, never defaulted to a guessed nationality", async () => {
    const client = new FakeSupabaseReadClient({
      premium_visa_residency: [{ destination_id: DEST_ID, destination_key: DEST_KEY, record_key: "v1", visa_type: "D7", permanent_residency_path: null, citizenship_path: null, stay_mode_key: null, traveler_nationality: null, verified: null, verified_at: null }],
    });
    const port = createSupabasePersistedDestinationReadPort(client);
    const result = await port.readReplaceModules(identity());
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected success");
    const visa = (result.value as { visaResidency: readonly Record<string, unknown>[] }).visaResidency[0];
    expect(visa.travelerNationality).toBeNull();
  });
});

describe("import-parity hardening: CONNECTIVITY_REMOTE_WORK structured fields", () => {
  it("fiber_available, mobile_5g, utility_reliability, coworking_summary, and verified/verified_at all survive write-port insert", () => {
    const moduleExecutionOperations: ModuleExecutionOperation[] = [
      { kind: "REPLACE_MODULE", module: "remoteWork", expectedBefore: [], expectedAfter: [
        { summary: "Fast", internetSummary: "300", timezoneSummary: "Good overlap", fiberAvailable: "Yes", mobile5g: "Yes", utilityReliability: "Stable", coworkingSummary: "Several spaces", verified: "1", verifiedAt: "2026-08-07" },
      ] },
    ];
    const statements = buildDestinationPlanWriteStatements(basePlan({ moduleExecutionOperations }));
    expect(statements[1].values).toEqual([DEST_ID, DEST_KEY, "record-1", "Fast", "300", "Good overlap", "Yes", "Yes", "Stable", "Several spaces", true, "2026-08-07"]);
  });

  it("all fields read back through the loader", async () => {
    const client = new FakeSupabaseReadClient({
      premium_connectivity_remote_work: [{
        destination_id: DEST_ID, destination_key: DEST_KEY, record_key: "rw1",
        remote_work_notes: "Fast", avg_download_mbps: 300, us_time_zone_fit: "Good overlap",
        fiber_available: "Yes", mobile_5g: "Yes", utility_reliability: "Stable", coworking_summary: "Several spaces",
        verified: true, verified_at: "2026-08-07",
      }],
    });
    const port = createSupabasePersistedDestinationReadPort(client);
    const result = await port.readReplaceModules(identity());
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected success");
    const remoteWork = (result.value as { remoteWork: readonly Record<string, unknown>[] }).remoteWork[0];
    expect(remoteWork.fiberAvailable).toBe("Yes");
    expect(remoteWork.mobile5g).toBe("Yes");
    expect(remoteWork.utilityReliability).toBe("Stable");
    expect(remoteWork.coworkingSummary).toBe("Several spaces");
    expect(remoteWork.verified).toBe("true");
    expect(remoteWork.verifiedAt).toBe("2026-08-07");
  });
});

describe("import-parity hardening: LANGUAGE_INTEGRATION structured fields", () => {
  it("primary_language, english_proficiency, government_english_access, medical_english_access, language_resources, and verified/verified_at all survive write-port insert", () => {
    const moduleExecutionOperations: ModuleExecutionOperation[] = [
      { kind: "REPLACE_MODULE", module: "languageIntegration", expectedBefore: [], expectedAfter: [
        { summary: "Fine for English speakers", englishSupport: "Good", primaryLanguage: "Portuguese", englishProficiency: "High", governmentEnglishAccess: "Limited", medicalEnglishAccess: "Common in private care", languageResources: "Language exchange meetups", verified: "0", verifiedAt: "2026-08-07" },
      ] },
    ];
    const statements = buildDestinationPlanWriteStatements(basePlan({ moduleExecutionOperations }));
    expect(statements[1].values).toEqual([DEST_ID, DEST_KEY, 1, "Fine for English speakers", "Good", "Portuguese", "High", "Limited", "Common in private care", "Language exchange meetups", false, "2026-08-07"]);
  });

  it("all fields read back through the loader", async () => {
    const client = new FakeSupabaseReadClient({
      premium_language_integration: [{
        destination_id: DEST_ID, destination_key: DEST_KEY, position: 1,
        summary: "Fine for English speakers", english_support: "Good",
        primary_language: "Portuguese", english_proficiency: "High",
        government_english_access: "Limited", medical_english_access: "Common in private care",
        language_resources: "Language exchange meetups", verified: false, verified_at: "2026-08-07",
      }],
    });
    const port = createSupabasePersistedDestinationReadPort(client);
    const result = await port.readReplaceModules(identity());
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected success");
    const language = (result.value as { languageIntegration: readonly Record<string, unknown>[] }).languageIntegration[0];
    expect(language.primaryLanguage).toBe("Portuguese");
    expect(language.englishProficiency).toBe("High");
    expect(language.governmentEnglishAccess).toBe("Limited");
    expect(language.medicalEnglishAccess).toBe("Common in private care");
    expect(language.languageResources).toBe("Language exchange meetups");
    expect(language.verified).toBe("false");
    expect(language.verifiedAt).toBe("2026-08-07");
  });
});

describe("import-parity hardening: COMMUNITY_SOCIAL structured fields", () => {
  it("expat_presence, volunteering, ease_meeting_people, age_mix, transient_vs_rooted, and verified/verified_at all survive write-port insert", () => {
    const moduleExecutionOperations: ModuleExecutionOperation[] = [
      { kind: "REPLACE_MODULE", module: "communitySocial", expectedBefore: [], expectedAfter: [
        { summary: "Active expat scene", socialNotes: "Several clubs", expatPresence: "High", volunteering: "Common", easeMeetingPeople: "Easy", ageMix: "Skews older", transientVsRooted: "Rooted", verified: "1", verifiedAt: "2026-08-07" },
      ] },
    ];
    const statements = buildDestinationPlanWriteStatements(basePlan({ moduleExecutionOperations }));
    expect(statements[1].values).toEqual([DEST_ID, DEST_KEY, 1, "Active expat scene", "Several clubs", "High", "Common", "Easy", "Skews older", "Rooted", true, "2026-08-07"]);
  });

  it("all fields read back through the loader", async () => {
    const client = new FakeSupabaseReadClient({
      premium_community_social: [{
        destination_id: DEST_ID, destination_key: DEST_KEY, position: 1,
        summary: "Active expat scene", social_notes: "Several clubs",
        expat_presence: "High", volunteering: "Common", ease_meeting_people: "Easy",
        age_mix: "Skews older", transient_vs_rooted: "Rooted", verified: true, verified_at: "2026-08-07",
      }],
    });
    const port = createSupabasePersistedDestinationReadPort(client);
    const result = await port.readReplaceModules(identity());
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected success");
    const community = (result.value as { communitySocial: readonly Record<string, unknown>[] }).communitySocial[0];
    expect(community.expatPresence).toBe("High");
    expect(community.volunteering).toBe("Common");
    expect(community.easeMeetingPeople).toBe("Easy");
    expect(community.ageMix).toBe("Skews older");
    expect(community.transientVsRooted).toBe("Rooted");
    expect(community.verified).toBe("true");
    expect(community.verifiedAt).toBe("2026-08-07");
  });
});

describe("import-parity hardening: TRANSPORT_AIRPORTS structured fields (repeatable rows, ordering preserved)", () => {
  it("topic, distance_km, typical_drive_minutes, nonstop_us_service, car_needed_rating, parking_notes, rideshare_notes, and verified/verified_at all survive write-port insert across multiple keyed rows", () => {
    const moduleExecutionOperations: ModuleExecutionOperation[] = [
      { kind: "REPLACE_MODULE", module: "transportation", expectedBefore: [], expectedAfter: [
        { summary: "Main airport", airportSummary: "Humberto Delgado", transitSummary: "true", topic: "airport", distanceKm: "8", typicalDriveMinutes: "20", nonstopUsService: "true", carNeededRating: "low", parkingNotes: "Metered", rideshareNotes: "Widely available", verified: "1", verifiedAt: "2026-08-07" },
        { summary: "Rail hub", airportSummary: "Oriente Station", transitSummary: "true", topic: "rail", distanceKm: "3", typicalDriveMinutes: "10", nonstopUsService: "false", carNeededRating: "very low", parkingNotes: "Limited", rideshareNotes: "Available", verified: "0", verifiedAt: "2026-08-07" },
      ] },
    ];
    const statements = buildDestinationPlanWriteStatements(basePlan({ moduleExecutionOperations }));
    expect(statements[1].values).toEqual([DEST_ID, DEST_KEY, "record-1", "Main airport", "Humberto Delgado", true, "airport", "8", "20", true, "low", "Metered", "Widely available", true, "2026-08-07"]);
    expect(statements[2].values).toEqual([DEST_ID, DEST_KEY, "record-2", "Rail hub", "Oriente Station", true, "rail", "3", "10", false, "very low", "Limited", "Available", false, "2026-08-07"]);
    // Keyed rows remain stable/ordered: record-1 always precedes record-2 for the same destination.
    expect(statements[1].values[2]).toBe("record-1");
    expect(statements[2].values[2]).toBe("record-2");
  });

  it("all fields read back through the loader, preserving row order across repeated keyed rows", async () => {
    const client = new FakeSupabaseReadClient({
      premium_transport_airports: [
        { destination_id: DEST_ID, destination_key: DEST_KEY, record_key: "t1", summary: "Main airport", name: "Humberto Delgado", public_transit_available: true, topic: "airport", distance_km: 8, typical_drive_minutes: 20, nonstop_us_service: true, car_needed_rating: "low", parking_notes: "Metered", rideshare_notes: "Widely available", verified: true, verified_at: "2026-08-07" },
        { destination_id: DEST_ID, destination_key: DEST_KEY, record_key: "t2", summary: "Rail hub", name: "Oriente Station", public_transit_available: true, topic: "rail", distance_km: 3, typical_drive_minutes: 10, nonstop_us_service: false, car_needed_rating: "very low", parking_notes: "Limited", rideshare_notes: "Available", verified: false, verified_at: "2026-08-07" },
      ],
    });
    const port = createSupabasePersistedDestinationReadPort(client);
    const result = await port.readReplaceModules(identity());
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected success");
    const transportation = (result.value as { transportation: readonly Record<string, unknown>[] }).transportation;
    expect(transportation).toHaveLength(2);
    expect(transportation[0].topic).toBe("airport");
    expect(transportation[0].distanceKm).toBe("8");
    expect(transportation[0].typicalDriveMinutes).toBe("20");
    expect(transportation[0].nonstopUsService).toBe("true");
    expect(transportation[0].carNeededRating).toBe("low");
    expect(transportation[0].parkingNotes).toBe("Metered");
    expect(transportation[0].rideshareNotes).toBe("Widely available");
    expect(transportation[0].verified).toBe("true");
    expect(transportation[1].topic).toBe("rail");
    expect(transportation[1].nonstopUsService).toBe("false");
    expect(transportation[1].verified).toBe("false");
  });

  it("does not widen nonstop_us_service's boolean coercion to accept narrative prose (fails safe to null, matching public_transit_available's existing contract)", () => {
    const moduleExecutionOperations: ModuleExecutionOperation[] = [
      { kind: "REPLACE_MODULE", module: "transportation", expectedBefore: [], expectedAfter: [
        { summary: "A", airportSummary: "Airport A", transitSummary: "true", nonstopUsService: "Sometimes seasonal" },
      ] },
    ];
    const statements = buildDestinationPlanWriteStatements(basePlan({ moduleExecutionOperations }));
    // nonstopUsService column index: [destId, destKey, record_key, summary, airportSummary, transitSummary, topic, distanceKm, typicalDriveMinutes, nonstopUsService, ...]
    expect(statements[1].values[9]).toBeNull();
  });
});

describe("import-parity hardening: DESTINATION_SCORES verified/verified_at (keyed-child module)", () => {
  it("verified coerces correctly on the keyed-child write path (a different code path from REPLACE_MODULE), including the workbook's real '1'/'0' encoding", () => {
    const childOperations: ChildOperation[] = [
      {
        kind: "CREATE_CHILD",
        module: "scores",
        stableChildKey: "retirement" as ScoreKey,
        currentChild: null,
        incomingChild: { scoreKey: "retirement" as ScoreKey, scoreValue: "82", scoreLabel: "Very Good", methodologyVersion: "pilot-v3", verified: "1", verifiedAt: "2026-08-07" } as any,
      },
    ];
    const statements = buildDestinationPlanWriteStatements(basePlan({ childOperations }));
    expect(statements[0].text).toContain("insert into public.premium_destination_scores");
    expect(statements[0].values).toEqual([DEST_ID, DEST_KEY, "retirement", "82", "Very Good", true, "2026-08-07"]);
  });

  it("verified/verified_at read back through the loader for scores (a module with no verified column at all before this phase)", async () => {
    const client = new FakeSupabaseReadClient({
      premium_destination_scores: [{ destination_id: DEST_ID, destination_key: DEST_KEY, score_key: "retirement", score_name: "Very Good", score_value: 82, weight: 1, higher_is_better: true, verified: true, verified_at: "2026-08-07" }],
    });
    const port = createSupabasePersistedDestinationReadPort(client);
    const result = await port.readKeyedChildren(identity());
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected success");
    const score = (result.value as { scores: readonly Record<string, unknown>[] }).scores[0];
    expect(score.verified).toBe("true");
    expect(score.verifiedAt).toBe("2026-08-07");
  });
});

