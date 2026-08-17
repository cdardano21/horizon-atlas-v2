import { describe, expect, it } from "vitest";
import type { CanonicalDestinationKey, DestinationId, PersistedPresenceModuleKey, ResolvedDestinationIdentity } from "../types";
import { createSupabasePersistedDestinationReadPort, type PersistedDestinationSupabaseReadClient } from "../supabase-persisted-destination-read-port";

class FakeSupabaseReadClient implements PersistedDestinationSupabaseReadClient {
  readonly writeCalls: string[] = [];
  readonly selectCalls: Array<{ readonly table: string; readonly select: string; readonly filters?: readonly { readonly column: string; readonly operator: string; readonly value: unknown }[] }> = [];

  constructor(
    private readonly rowsByTable: Record<string, readonly Record<string, unknown>[]>,
    private readonly errorsByTable: Record<string, Error | undefined> = {},
    private readonly delayedErrorsByTable: Record<string, number> = {},
  ) {}

  async selectRows(args: { readonly table: string; readonly select: string; readonly filters?: readonly { readonly column: string; readonly operator: string; readonly value: unknown }[] }) {
    this.selectCalls.push({ table: args.table, select: args.select, filters: args.filters });
    const error = this.errorsByTable[args.table];
    if (error) {
      if (this.delayedErrorsByTable[args.table]) {
        await new Promise((resolve) => setTimeout(resolve, this.delayedErrorsByTable[args.table]));
      }
      throw error;
    }

    return this.rowsByTable[args.table] ?? [];
  }

  async insertRows(_args: { readonly table: string; readonly rows: readonly Record<string, unknown>[] }) {
    this.writeCalls.push("insert");
    throw new Error("writes are not allowed");
  }

  async updateRows(_args: { readonly table: string; readonly updates: Record<string, unknown> }) {
    this.writeCalls.push("update");
    throw new Error("writes are not allowed");
  }
}

function createIdentity(destinationKey = "dest-a", destinationId = "dest-id-a"): ResolvedDestinationIdentity {
  return {
    destinationKey: destinationKey as CanonicalDestinationKey,
    destinationId: destinationId as DestinationId,
  };
}

describe("createSupabasePersistedDestinationReadPort", () => {
  it("maps a physical root row into the persisted root shape", async () => {
    const identity = createIdentity();
    const client = new FakeSupabaseReadClient({
      destinations_catalog: [{
        destination_id: "dest-id-a",
        destination_key: "dest-a",
        slug: "braunfels",
        name: "Braunfels",
        city: "Braunfels",
        country: "United States",
      }],
    });

    const port = createSupabasePersistedDestinationReadPort(client);
    const result = await port.readRoot(identity);

    expect(result).toEqual({
      ok: true,
      value: {
        destinationId: "dest-id-a",
        destinationKey: "dest-a",
        slug: "braunfels",
        name: null,
        city: "Braunfels",
        country: "United States",
      },
    });
  });

  it("uses the catalog id column for root lookups", async () => {
    const identity = createIdentity();
    const client = new FakeSupabaseReadClient({ destinations_catalog: [] });
    const port = createSupabasePersistedDestinationReadPort(client);

    await port.readRoot(identity);

    expect(client.selectCalls[0]).toEqual({
      table: "destinations_catalog",
      select: "id,destination_key,slug,city,country",
      filters: [{ column: "id", operator: "eq", value: identity.destinationId }],
    });
  });

  it("returns success with null for a missing root row", async () => {
    const identity = createIdentity();
    const client = new FakeSupabaseReadClient({ destinations_catalog: [] });
    const port = createSupabasePersistedDestinationReadPort(client);

    const result = await port.readRoot(identity);

    expect(result).toEqual({ ok: true, value: null });
  });

  it("converts a root transport error into a read-port failure", async () => {
    const identity = createIdentity();
    const client = new FakeSupabaseReadClient({}, { destinations_catalog: new Error("boom") });
    const port = createSupabasePersistedDestinationReadPort(client);

    const result = await port.readRoot(identity);

    expect(result).toEqual({ ok: false, error: { reason: "DB_READ_FAILED" } });
  });

  it("maps profile columns to the internal persisted profile shape", async () => {
    const identity = createIdentity();
    const client = new FakeSupabaseReadClient({
      premium_destination_profiles: [{
        destination_id: "dest-id-a",
        destination_key: "dest-a",
        identity_name: "Braunfels",
        summary: "A short description.",
        overview: "A long overview.",
        currency: "USD",
        primary_language: "English",
        time_zone: "America/Chicago",
        profile_storage_version: 1,
      }],
    });

    const port = createSupabasePersistedDestinationReadPort(client);
    const result = await port.readProfile(identity);

    expect(result).toEqual({
      ok: true,
      value: {
        destinationId: "dest-id-a",
        destinationKey: "dest-a",
        profileStorageVersion: 1,
        identityName: "Braunfels",
        shortDescription: "A short description.",
        longDescription: "A long overview.",
        currency: "USD",
        primaryLanguage: "English",
        timeZone: "America/Chicago",
      },
    });
  });

  it("returns success with null for an absent profile row", async () => {
    const identity = createIdentity();
    const client = new FakeSupabaseReadClient({ premium_destination_profiles: [] });
    const port = createSupabasePersistedDestinationReadPort(client);

    const result = await port.readProfile(identity);

    expect(result).toEqual({ ok: true, value: null });
  });

  it("maps presence rows and preserves persisted identity fields", async () => {
    const identity = createIdentity();
    const client = new FakeSupabaseReadClient({
      premium_destination_module_presence: [{
        destination_id: "dest-id-a",
        destination_key: "dest-a",
        module_key: "facts",
      }, {
        destination_id: "dest-id-a",
        destination_key: "wrong-key",
        module_key: "scores",
      }],
    });

    const port = createSupabasePersistedDestinationReadPort(client);
    const result = await port.readPresence(identity);

    expect(result).toEqual({
      ok: true,
      value: [
        { destinationId: "dest-id-a", destinationKey: "dest-a", module: "facts" },
        { destinationId: "dest-id-a", destinationKey: "wrong-key", module: "scores" },
      ],
    });
  });

  it("maps keyed-child rows into the grouped read contract", async () => {
    const identity = createIdentity();
    const client = new FakeSupabaseReadClient({
      premium_destination_facts: [{ destination_id: "dest-id-a", destination_key: "dest-a", fact_key: "fact-1", fact_type: null, title: null, body: null, source_ref: null, metadata: {} }],
      premium_destination_scores: [{ destination_id: "dest-id-a", destination_key: "dest-a", score_key: "score-1", score_value: 5, score_name: null, weight: null, higher_is_better: true, metadata: {} }],
      premium_neighborhoods: [{ destination_id: "dest-id-a", destination_key: "dest-a", neighborhood_key: "hood-1", neighborhood_name: "Old Town", area_type: "urban", summary: null, housing_character: null, walkability_rating: null, safety_rating: null, transit_rating: null, pros: null, cons: null, google_maps_url: null, source_url: null, verified: false, metadata: {}, sort_order: 1 }],
      premium_places: [{ destination_id: "dest-id-a", destination_key: "dest-a", place_key: "place-1", category_key: "food", place_name: "Market", subcategory: null, description: "Nice market", neighborhood_key: "hood-1", address: "123 Main St", latitude: null, longitude: null, price_level: null, website_url: "https://example.com/market", google_maps_url: "https://maps.example.com/market", phone: "+1 555-1234", best_for: null, display_order: 1, source_name: null, source_url: "https://example.com/source-market", verified: false, confidence: null, metadata: {} }],
      premium_resources: [{ destination_id: "dest-id-a", destination_key: "dest-a", resource_key: "resource-1", resource_category: "gov", resource_name: "Visa office", description: null, url: "https://example.com", official: true, stay_mode_key: null, display_order: 1, source_name: null, source_url: null, verified: false, metadata: {} }],
      premium_media: [{ destination_id: "dest-id-a", destination_key: "dest-a", media_key: "media-1", media_type: "image", url: "https://cdn.example.com/a.jpg", caption: "View", alt_text: "A", sort_order: 1, is_primary: true, verified: false, source_name: null, source_url: null, metadata: {} }],
      premium_property_resources: [{ destination_id: "dest-id-a", destination_key: "dest-a", record_key: "property-1", transaction_type: null, resource_name: "Broker", resource_type: "real-estate", url: "https://example.com/broker", official: false, description: null, source_url: null, verified: false, metadata: {} }],
      premium_move_checklist: [{ destination_id: "dest-id-a", destination_key: "dest-a", checklist_key: "check-1", summary: "Ship everything", checklist_notes: "Pack carefully" }],
      premium_events_seasonality: [{ destination_id: "dest-id-a", destination_key: "dest-a", event_seasonality_key: "event-1", summary: "Festival", seasonality_notes: "Spring" }],
      premium_sources: [{ destination_id: "dest-id-a", destination_key: "dest-a", source_key: "source-1", source_name: "Local guide", source_url: "https://example.com/source", source_type: "gov", publisher: null, accessed_at: null, verified: false, confidence: null, notes: null, metadata: {} }],
    });

    const port = createSupabasePersistedDestinationReadPort(client);
    const result = await port.readKeyedChildren(identity);

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Expected keyed-child success");
    }

    expect(result.value).toEqual({
      facts: [{ destinationId: "dest-id-a", destinationKey: "dest-a", factKey: "fact-1", factGroup: null, valueText: null, displayLabel: null, sourceName: null }],
      scores: [{ destinationId: "dest-id-a", destinationKey: "dest-a", scoreKey: "score-1", scoreValue: "5", scoreLabel: null, methodologyVersion: null }],
      neighborhoods: [{ destinationId: "dest-id-a", destinationKey: "dest-a", neighborhoodKey: "hood-1", name: "Old Town", summary: null, areaType: "urban" }],
      places: [{ destinationId: "dest-id-a", destinationKey: "dest-a", placeKey: "place-1", category: "food", name: "Market", description: "Nice market", neighborhoodKey: "hood-1", websiteUrl: "https://example.com/market", googleMapsUrl: "https://maps.example.com/market", sourceUrl: "https://example.com/source-market", address: "123 Main St", phone: "+1 555-1234", displayOrder: "1" }],
      resources: [{ destinationId: "dest-id-a", destinationKey: "dest-a", resourceKey: "resource-1", category: "gov", name: "Visa office", url: "https://example.com" }],
      media: [{ destinationId: "dest-id-a", destinationKey: "dest-a", mediaKey: "media-1", kind: "image", url: "https://cdn.example.com/a.jpg", caption: "View", altText: "A" }],
      propertyResources: [{ destinationId: "dest-id-a", destinationKey: "dest-a", itemKey: "property-1", category: "real-estate", name: "Broker", url: "https://example.com/broker" }],
      moveChecklist: [{ destinationId: "dest-id-a", destinationKey: "dest-a", checklistKey: "check-1", summary: "Ship everything", checklistNotes: "Pack carefully" }],
      eventsSeasonality: [{ destinationId: "dest-id-a", destinationKey: "dest-a", eventSeasonalityKey: "event-1", summary: "Festival", seasonalityNotes: "Spring" }],
      sources: [{ destinationId: "dest-id-a", destinationKey: "dest-a", sourceKey: "source-1", name: "Local guide", url: "https://example.com/source", type: "gov" }],
    });
  });

  it("maps replace modules into the grouped read contract", async () => {
    const identity = createIdentity();
    const client = new FakeSupabaseReadClient({
      premium_cost_of_living: [{ destination_id: "dest-id-a", destination_key: "dest-a", record_key: "col-1", category: "rent", monthly_low: 2000, monthly_high: 3000, currency: "USD" }],
      premium_climate_monthly: [{ destination_id: "dest-id-a", destination_key: "dest-a", record_key: "month-1", month_key: "january", avg_high_temp: 20, avg_low_temp: 10, precipitation_mm: 100, humidity_pct: 75 }],
      premium_housing_property: [{ destination_id: "dest-id-a", destination_key: "dest-a", record_key: "housing-1", restrictions_summary: "Limited", buying_process_summary: "Easy", rental_rules_notes: "Strict" }],
      premium_healthcare_insurance: [{ destination_id: "dest-id-a", destination_key: "dest-a", record_key: "health-1", system_summary: "Good", public_access_foreigners: "Easy", international_insurance_notes: "Required" }],
      premium_visa_residency: [{ destination_id: "dest-id-a", destination_key: "dest-a", record_key: "visa-1", visa_type: "D", permanent_residency_path: "Long", citizenship_path: "Long" }],
      premium_taxes_finance: [{ destination_id: "dest-id-a", destination_key: "dest-a", record_key: "tax-1", summary: "Simple", notes: "No issues" }],
      premium_lgbtq_inclusivity: [{ destination_id: "dest-id-a", destination_key: "dest-a", position: 2, summary: "Friendly", cultural_notes: "Welcoming" }],
      premium_safety_risks: [{ destination_id: "dest-id-a", destination_key: "dest-a", record_key: "risk-1", topic: "flood", severity: "medium", summary: "Occasional" }],
      premium_transport_airports: [{ destination_id: "dest-id-a", destination_key: "dest-a", record_key: "transport-1", summary: "Good access", name: "Airport", public_transit_available: true }],
      premium_connectivity_remote_work: [{ destination_id: "dest-id-a", destination_key: "dest-a", record_key: "remote-1", remote_work_notes: "Fast", avg_download_mbps: 300, fiber_available: "yes", mobile_5g: "yes", utility_reliability: null, coworking_summary: null, us_time_zone_fit: "Good" }],
      premium_language_integration: [{ destination_id: "dest-id-a", destination_key: "dest-a", position: 1, summary: "English works", english_support: "Good" }],
      premium_pets: [{ destination_id: "dest-id-a", destination_key: "dest-a", position: 3, summary: "Pet friendly", pet_friendly_notes: "Good" }],
      premium_family_education: [{ destination_id: "dest-id-a", destination_key: "dest-a", position: 4, summary: "Schools", schools_summary: "Great" }],
      premium_community_social: [{ destination_id: "dest-id-a", destination_key: "dest-a", position: 5, summary: "Social", social_notes: "Active" }],
      premium_accessibility: [{ destination_id: "dest-id-a", destination_key: "dest-a", position: 6, summary: "Wheelchair", mobility_notes: "Good" }],
      premium_bureaucracy_setup: [{ destination_id: "dest-id-a", destination_key: "dest-a", position: 7, summary: "Setup", setup_notes: "Easy" }],
      premium_work_business: [{ destination_id: "dest-id-a", destination_key: "dest-a", position: 8, summary: "Work", remote_work_notes: "Easy" }],
      premium_retirement_aging: [{ destination_id: "dest-id-a", destination_key: "dest-a", position: 9, summary: "Aging", aging_notes: "Good" }],
      premium_lifestyle_laws: [{ destination_id: "dest-id-a", destination_key: "dest-a", position: 10, summary: "Laws", legal_notes: "Some restrictions" }],
      premium_reality_check: [{ destination_id: "dest-id-a", destination_key: "dest-a", record_key: "reality-1", title: "Watch out", detail: "Detail", severity: "medium" }],
    });

    const port = createSupabasePersistedDestinationReadPort(client);
    const result = await port.readReplaceModules(identity);

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Expected replace-module success");
    }

    expect(result.value).toEqual({
      costOfLiving: [{ destinationId: "dest-id-a", destinationKey: "dest-a", itemKey: "col-1", category: "rent", monthlyLow: "2000", monthlyHigh: "3000", currency: "USD" }],
      climateMonthly: [{ destinationId: "dest-id-a", destinationKey: "dest-a", monthKey: "month-1", avgHighTemp: "20", avgLowTemp: "10", precipitationMm: "100", humidityPct: "75" }],
      housing: [{ destinationId: "dest-id-a", destinationKey: "dest-a", summary: "Limited", buyingSummary: "Easy", rentalSummary: "Strict" }],
      healthcare: [{ destinationId: "dest-id-a", destinationKey: "dest-a", summary: "Good", publicAccessSummary: "Easy", insuranceSummary: "Required" }],
      visaResidency: [{ destinationId: "dest-id-a", destinationKey: "dest-a", summary: "D", residencyPath: "Long", citizenshipPath: "Long" }],
      taxesFinance: [{ destinationId: "dest-id-a", destinationKey: "dest-a", summary: "Simple", notes: "No issues" }],
      lgbtqInclusivity: [{ destinationId: "dest-id-a", destinationKey: "dest-a", position: 2, summary: "Friendly", culturalNotes: "Welcoming" }],
      safetyRisks: [{ destinationId: "dest-id-a", destinationKey: "dest-a", itemKey: "risk-1", topic: "flood", severity: "medium", summary: "Occasional" }],
      transportation: [{ destinationId: "dest-id-a", destinationKey: "dest-a", summary: "Good access", airportSummary: "Airport", transitSummary: "true" }],
      remoteWork: [{ destinationId: "dest-id-a", destinationKey: "dest-a", summary: "Fast", internetSummary: "300", timezoneSummary: "Good" }],
      languageIntegration: [{ destinationId: "dest-id-a", destinationKey: "dest-a", position: 1, summary: "English works", englishSupport: "Good" }],
      pets: [{ destinationId: "dest-id-a", destinationKey: "dest-a", position: 3, summary: "Pet friendly", petFriendlyNotes: "Good" }],
      familyEducation: [{ destinationId: "dest-id-a", destinationKey: "dest-a", position: 4, summary: "Schools", schoolsSummary: "Great" }],
      communitySocial: [{ destinationId: "dest-id-a", destinationKey: "dest-a", position: 5, summary: "Social", socialNotes: "Active" }],
      accessibility: [{ destinationId: "dest-id-a", destinationKey: "dest-a", position: 6, summary: "Wheelchair", mobilityNotes: "Good" }],
      bureaucracySetup: [{ destinationId: "dest-id-a", destinationKey: "dest-a", position: 7, summary: "Setup", setupNotes: "Easy" }],
      workBusiness: [{ destinationId: "dest-id-a", destinationKey: "dest-a", position: 8, summary: "Work", remoteWorkNotes: "Easy" }],
      retirementAging: [{ destinationId: "dest-id-a", destinationKey: "dest-a", position: 9, summary: "Aging", agingNotes: "Good" }],
      lifestyleLaws: [{ destinationId: "dest-id-a", destinationKey: "dest-a", position: 10, summary: "Laws", legalNotes: "Some restrictions" }],
      realityCheck: [{ destinationId: "dest-id-a", destinationKey: "dest-a", itemKey: "reality-1", title: "Watch out", detail: "Detail", severity: "medium" }],
    });
  });

  it("preserves positioned row order and raw position values", async () => {
    const identity = createIdentity();
    const client = new FakeSupabaseReadClient({
      premium_lgbtq_inclusivity: [{ destination_id: "dest-id-a", destination_key: "dest-a", position: 3, summary: "Third", cultural_notes: null }, { destination_id: "dest-id-a", destination_key: "dest-a", position: 1, summary: "First", cultural_notes: null }],
    });

    const port = createSupabasePersistedDestinationReadPort(client);
    const result = await port.readReplaceModules(identity);

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Expected replace-module success");
    }

    const groupedValue = result.value as {
      lgbtqInclusivity: Array<{
        destinationId: string;
        destinationKey: string;
        position: number;
        summary: string | null;
        culturalNotes: string | null;
      }>
    };

    expect(groupedValue.lgbtqInclusivity).toEqual([
      { destinationId: "dest-id-a", destinationKey: "dest-a", position: 3, summary: "Third", culturalNotes: null },
      { destinationId: "dest-id-a", destinationKey: "dest-a", position: 1, summary: "First", culturalNotes: null },
    ]);
  });

  it("passes singleton rows through as arrays without collapsing semantics", async () => {
    const identity = createIdentity();
    const client = new FakeSupabaseReadClient({
      premium_environment_quality: [],
      premium_daily_life_practicality: [{ destination_id: "dest-id-a", destination_key: "dest-a", summary: "Practical", practicality_notes: "Easy" }, { destination_id: "dest-id-a", destination_key: "dest-a", summary: "Also practical", practicality_notes: "Even easier" }],
    });

    const port = createSupabasePersistedDestinationReadPort(client);
    const result = await port.readSingletons(identity);

    expect(result).toEqual({
      ok: true,
      value: {
        environmentQuality: [],
        dailyLifePracticality: [
          { destinationId: "dest-id-a", destinationKey: "dest-a", summary: "Practical", practicalityNotes: "Easy" },
          { destinationId: "dest-id-a", destinationKey: "dest-a", summary: "Also practical", practicalityNotes: "Even easier" },
        ],
      },
    });
  });

  it("attributes grouped read failures to the failing module", async () => {
    const identity = createIdentity();
    const client = new FakeSupabaseReadClient({
      premium_taxes_finance: [],
      premium_lgbtq_inclusivity: [],
    }, { premium_taxes_finance: new Error("boom") });

    const port = createSupabasePersistedDestinationReadPort(client);
    const result = await port.readReplaceModules(identity);

    expect(result).toEqual({ ok: false, error: { reason: "DB_READ_FAILED", module: "taxesFinance" } });
  });

  it("selects a deterministic failed module across multiple grouped errors", async () => {
    const identity = createIdentity();
    const client = new FakeSupabaseReadClient({
      premium_safety_risks: [],
      premium_transport_airports: [],
    }, {
      premium_safety_risks: new Error("boom"),
      premium_transport_airports: new Error("boom"),
    }, {
      premium_transport_airports: 10,
    });

    const port = createSupabasePersistedDestinationReadPort(client);
    const result = await port.readReplaceModules(identity);

    expect(result).toEqual({ ok: false, error: { reason: "DB_READ_FAILED", module: "safetyRisks" } });
  });

  it("preserves null values through mapping", async () => {
    const identity = createIdentity();
    const client = new FakeSupabaseReadClient({
      premium_destination_profiles: [{
        destination_id: "dest-id-a",
        destination_key: "dest-a",
        identity_name: null,
        summary: null,
        overview: null,
        currency: null,
        primary_language: null,
        time_zone: null,
        profile_storage_version: null,
      }],
    });

    const port = createSupabasePersistedDestinationReadPort(client);
    const result = await port.readProfile(identity);

    expect(result).toEqual({
      ok: true,
      value: {
        destinationId: "dest-id-a",
        destinationKey: "dest-a",
        profileStorageVersion: null,
        identityName: null,
        shortDescription: null,
        longDescription: null,
        currency: null,
        primaryLanguage: null,
        timeZone: null,
      },
    });
  });

  it("performs only read/select operations", async () => {
    const identity = createIdentity();
    const client = new FakeSupabaseReadClient({
      premium_destination_profiles: [{
        destination_id: "dest-id-a",
        destination_key: "dest-a",
        identity_name: null,
        currency: null,
        primary_language: null,
        time_zone: null,
        profile_storage_version: 1,
      }],
    });

    const port = createSupabasePersistedDestinationReadPort(client);
    await port.readProfile(identity);

    expect(client.writeCalls).toEqual([]);
  });

  it("selects neighborhood_key, website_url, google_maps_url, source_url, address, phone, and display_order for premium_places", async () => {
    const identity = createIdentity();
    const client = new FakeSupabaseReadClient({});

    const port = createSupabasePersistedDestinationReadPort(client);
    await port.readKeyedChildren(identity);

    const placesCall = client.selectCalls.find((call) => call.table === "premium_places");
    expect(placesCall).toBeDefined();
    for (const column of ["place_key", "category_key", "place_name", "description", "neighborhood_key", "website_url", "google_maps_url", "source_url", "address", "phone", "display_order"]) {
      expect(placesCall?.select).toContain(column);
    }
  });
});

