import { describe, expect, it } from "vitest";
import {
  buildDeterministicV31CanonicalDestination,
  buildDeterministicV31ImportPlan,
  loadFrozenWorkbookV31DeterministicImport,
  resolveDeterministicV31DestinationIdentity,
  validateDeterministicV31CanonicalImportFixture,
  validateDeterministicV31Contract,
} from "./workbook-v31-deterministic-core";

const expectedPilotKeys = ["new-braunfels-tx-us", "lisbon-pt", "summerlin-nv-us"] as const;

const getCanonicalModuleList = () => [
  "identity",
  "editorial",
  "facts",
  "scores",
  "neighborhoods",
  "places",
  "resources",
  "media",
  "costOfLiving",
  "climateMonthly",
  "housing",
  "propertyResources",
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
  "moveChecklist",
  "environmentQuality",
  "dailyLifePracticality",
  "eventsSeasonality",
  "sources",
];

describe("workbook v3.1 deterministic core proof", () => {
  it("builds the full canonical object for each pilot and exposes the full module list", async () => {
    const importResult = await loadFrozenWorkbookV31DeterministicImport();
    expect(importResult.validationErrors).toEqual([]);
    expect(importResult.canonicalDestinations?.map((destination) => destination.identity.destinationKey)).toEqual(expect.arrayContaining(expectedPilotKeys));

    const canonicalByKey = new Map(importResult.canonicalDestinations?.map((destination) => [destination.identity.destinationKey, destination]));

    for (const destinationKey of expectedPilotKeys) {
      const canonical = canonicalByKey.get(destinationKey);
      expect(canonical).toBeDefined();
      for (const moduleName of getCanonicalModuleList()) {
        expect(canonical?.[moduleName as keyof typeof canonical]).toBeDefined();
      }
    }
  });

  it("matches the workbook count matrix for the requested modules", async () => {
    const importResult = await loadFrozenWorkbookV31DeterministicImport();
    const canonicalByKey = new Map(importResult.canonicalDestinations?.map((destination) => [destination.identity.destinationKey, destination]));
    const workbookCounts = new Map<string, Record<string, number>>([
      ["new-braunfels-tx-us", {
        DESTINATION_FACTS: 4,
        DESTINATION_SCORES: 3,
        NEIGHBORHOODS: 8,
        PLACES: 36,
        RESOURCES: 5,
        MEDIA: 5,
        COST_OF_LIVING: 10,
        CLIMATE_MONTHLY: 12,
        PROPERTY_RESOURCES: 3,
        VISA_RESIDENCY: 1,
        SAFETY_RISKS: 2,
        TRANSPORT_AIRPORTS: 3,
        BUREAUCRACY_SETUP: 5,
        LIFESTYLE_LAWS: 2,
        REALITY_CHECK: 5,
        MOVE_CHECKLIST: 10,
        EVENTS_SEASONALITY: 2,
        SOURCES: 17,
      }],
      ["lisbon-pt", {
        DESTINATION_FACTS: 3,
        DESTINATION_SCORES: 3,
        NEIGHBORHOODS: 8,
        PLACES: 29,
        RESOURCES: 9,
        MEDIA: 3,
        COST_OF_LIVING: 10,
        CLIMATE_MONTHLY: 12,
        PROPERTY_RESOURCES: 3,
        VISA_RESIDENCY: 2,
        SAFETY_RISKS: 1,
        TRANSPORT_AIRPORTS: 2,
        BUREAUCRACY_SETUP: 5,
        LIFESTYLE_LAWS: 2,
        REALITY_CHECK: 5,
        MOVE_CHECKLIST: 10,
        EVENTS_SEASONALITY: 2,
        SOURCES: 16,
      }],
      ["summerlin-nv-us", {
        DESTINATION_FACTS: 3,
        DESTINATION_SCORES: 3,
        NEIGHBORHOODS: 8,
        PLACES: 40,
        RESOURCES: 6,
        MEDIA: 3,
        COST_OF_LIVING: 10,
        CLIMATE_MONTHLY: 12,
        PROPERTY_RESOURCES: 3,
        VISA_RESIDENCY: 1,
        SAFETY_RISKS: 1,
        TRANSPORT_AIRPORTS: 2,
        BUREAUCRACY_SETUP: 5,
        LIFESTYLE_LAWS: 2,
        REALITY_CHECK: 5,
        MOVE_CHECKLIST: 10,
        EVENTS_SEASONALITY: 2,
        SOURCES: 18,
      }],
    ]);

    const canonicalModuleMap: Record<string, keyof typeof importResult.canonicalDestinations![0]> = {
      DESTINATION_FACTS: "facts",
      DESTINATION_SCORES: "scores",
      NEIGHBORHOODS: "neighborhoods",
      PLACES: "places",
      RESOURCES: "resources",
      MEDIA: "media",
      COST_OF_LIVING: "costOfLiving",
      CLIMATE_MONTHLY: "climateMonthly",
      PROPERTY_RESOURCES: "propertyResources",
      VISA_RESIDENCY: "visaResidency",
      SAFETY_RISKS: "safetyRisks",
      TRANSPORT_AIRPORTS: "transportation",
      BUREAUCRACY_SETUP: "bureaucracySetup",
      LIFESTYLE_LAWS: "lifestyleLaws",
      REALITY_CHECK: "realityCheck",
      MOVE_CHECKLIST: "moveChecklist",
      EVENTS_SEASONALITY: "eventsSeasonality",
      SOURCES: "sources",
    };

    for (const destinationKey of expectedPilotKeys) {
      const canonical = canonicalByKey.get(destinationKey);
      const expectedCounts = workbookCounts.get(destinationKey)!;
      for (const [sheetName, canonicalField] of Object.entries(canonicalModuleMap)) {
        const workbookCount = expectedCounts[sheetName as keyof typeof expectedCounts];
        const canonicalCount = Array.isArray(canonical?.[canonicalField as keyof typeof canonical]) ? (canonical?.[canonicalField as keyof typeof canonical] as Array<unknown>).length : 0;
        expect(canonicalCount).toBe(workbookCount);
      }
    }
  });

  it("verifies the required known pilot counts", async () => {
    const importResult = await loadFrozenWorkbookV31DeterministicImport();
    const canonicalByKey = new Map(importResult.canonicalDestinations?.map((destination) => [destination.identity.destinationKey, destination]));
    expect(canonicalByKey.get("new-braunfels-tx-us")?.neighborhoods).toHaveLength(8);
    expect(canonicalByKey.get("new-braunfels-tx-us")?.climateMonthly).toHaveLength(12);
    expect(canonicalByKey.get("new-braunfels-tx-us")?.moveChecklist).toHaveLength(10);
    expect(canonicalByKey.get("new-braunfels-tx-us")?.media).toHaveLength(5);
    expect(canonicalByKey.get("lisbon-pt")?.neighborhoods).toHaveLength(8);
    expect(canonicalByKey.get("lisbon-pt")?.climateMonthly).toHaveLength(12);
    expect(canonicalByKey.get("lisbon-pt")?.moveChecklist).toHaveLength(10);
    expect(canonicalByKey.get("lisbon-pt")?.media).toHaveLength(3);
    expect(canonicalByKey.get("summerlin-nv-us")?.neighborhoods).toHaveLength(8);
    expect(canonicalByKey.get("summerlin-nv-us")?.climateMonthly).toHaveLength(12);
    expect(canonicalByKey.get("summerlin-nv-us")?.moveChecklist).toHaveLength(10);
    expect(canonicalByKey.get("summerlin-nv-us")?.media).toHaveLength(3);
  });

  it("resolves exact identities without fuzzy matching", async () => {
    const importResult = await loadFrozenWorkbookV31DeterministicImport();
    const identities = [
      ["new-braunfels-tx-us", "new-braunfels-tx-us"],
      ["new-braunfels-texas", "new-braunfels-tx-us"],
      ["new-braunfels-texas-united-states", "new-braunfels-tx-us"],
      ["lisbon-pt", "lisbon-pt"],
      ["lisbon-portugal", "lisbon-pt"],
      ["summerlin-nv-us", "summerlin-nv-us"],
      ["summerlin-las-vegas-nevada", "summerlin-nv-us"],
      ["summerlin-nevada-united-states", "summerlin-nv-us"],
      ["summerlin-nv-usa", "summerlin-nv-us"],
    ] as const;

    for (const [requested, expected] of identities) {
      const resolution = resolveDeterministicV31DestinationIdentity({
        requestedIdentity: requested,
        destinations: importResult.destinations.map((destination) => ({ destination_key: destination.destinationKey, slug: destination.slug })),
        destinationAliases: importResult.diagnostics?.aliasResolution ? Object.entries(importResult.diagnostics.aliasResolution).map(([alias, destinationKey]) => ({ destination_key: destinationKey, alias_value: alias, active: "1" })) : [],
      });
      expect(resolution.ok).toBe(true);
      expect(resolution.value).toBe(expected);
    }

    const unknownResolution = resolveDeterministicV31DestinationIdentity({
      requestedIdentity: "definitely-not-a-real-destination",
      destinations: importResult.destinations.map((destination) => ({ destination_key: destination.destinationKey, slug: destination.slug })),
      destinationAliases: [],
    });
    expect(unknownResolution.ok).toBe(false);
    expect(unknownResolution.error).toBe("UNKNOWN_DESTINATION");
  });

  it("rejects invalid child fixtures and alias fixtures", () => {
    const fixture = {
      destinations: [{
        destinationKey: "new-braunfels-tx-us",
        facts: [{ destination_key: "does-not-exist", fact_key: "climate" }],
        scores: [],
        neighborhoods: [{ neighborhood_key: "nb-1", destination_key: "new-braunfels-tx-us" }],
        places: [{ place_key: "place-1", destination_key: "new-braunfels-tx-us", neighborhood_key: "ghost-neighborhood" }],
        media: [{ media_key: "media-1", destination_key: "lisbon-pt" }],
        aliases: [{ destination_key: "ghost-destination", alias_value: "legacy" }],
      }, {
        destinationKey: "lisbon-pt",
        facts: [],
        scores: [],
        neighborhoods: [{ neighborhood_key: "lisbon-1", destination_key: "lisbon-pt" }],
        places: [{ place_key: "place-2", destination_key: "lisbon-pt", neighborhood_key: "lisbon-1" }],
        media: [],
        aliases: [],
      }],
    };

    const errors = validateDeterministicV31CanonicalImportFixture(fixture);
    expect(errors).toEqual(expect.arrayContaining([
      expect.stringContaining("wrong destination"),
      expect.stringContaining("unknown neighborhood"),
      expect.stringContaining("Alias targets unknown destination"),
    ]));
  });

  it("rejects invalid contract fixtures without touching the frozen workbook", () => {
    const invalidContract = validateDeterministicV31Contract({
      metadata: { schema_version: "3.0", architecture: "legacy", primary_identity: "slug" },
      sheetNames: ["DESTINATIONS"],
    });
    expect(invalidContract).toEqual(expect.arrayContaining([
      expect.stringContaining("schema_version"),
      expect.stringContaining("architecture"),
      expect.stringContaining("primary_identity"),
      expect.stringContaining("Missing required sheet"),
    ]));
  });

  it("keeps recursive destination_key isolation intact for every nested record", async () => {
    const importResult = await loadFrozenWorkbookV31DeterministicImport();
    let inspected = 0;
    for (const destination of importResult.canonicalDestinations ?? []) {
      const queue: Array<{ value: unknown }> = [destination];
      while (queue.length > 0) {
        const current = queue.shift();
        if (current == null) continue;
        if (typeof current === "object") {
          if (Array.isArray(current)) {
            current.forEach((entry) => queue.push(entry));
            continue;
          }
          const record = current as Record<string, unknown>;
          if (typeof record.destination_key === "string") {
            inspected += 1;
            expect(record.destination_key).toBe(destination.identity.destinationKey);
          }
          Object.values(record).forEach((value) => queue.push(value));
        }
      }
    }
    expect(inspected).toBeGreaterThan(0);
  });

  it("preserves blank values and empty repeatable modules without fallback content", () => {
    const plan = buildDeterministicV31ImportPlan({
      destinations: [{ destination_key: "new-braunfels-tx-us", slug: "new-braunfels-tx-us", destination_name: "New Braunfels", city: "New Braunfels", country: "United States" }],
      destinationFacts: [{ destination_key: "new-braunfels-tx-us", fact_group: "climate", fact_key: "climate", display_label: "Climate", value_text: "", source_name: "" }],
      destinationScores: [],
      neighborhoods: [],
      places: [],
      resources: [],
      media: [],
      destinationAliases: [],
    });
    const fact = plan.destinations[0]?.facts[0];
    expect(fact?.valueText).toBeNull();
    expect(plan.destinations[0]?.facts).not.toContainEqual(expect.objectContaining({ valueText: expect.stringMatching(/fallback|generated|default|legacy/i) }));
    expect(plan.destinations[0]?.facts).toEqual(expect.any(Array));
  });

  it("normalizes blank scalars consistently and preserves legitimate values", () => {
    const plan = buildDeterministicV31ImportPlan({
      destinations: [{ destination_key: "new-braunfels-tx-us", slug: "new-braunfels-tx-us", destination_name: "New Braunfels", city: "New Braunfels", country: "United States" }],
      destinationFacts: [{ destination_key: "new-braunfels-tx-us", fact_group: "climate", fact_key: "climate", display_label: "Climate", value_text: "   ", source_name: "   " }],
      destinationScores: [],
      neighborhoods: [],
      places: [],
      resources: [],
      media: [],
      destinationAliases: [],
    });

    expect(plan.destinations[0]?.facts[0]?.valueText).toBeNull();
    expect(plan.destinations[0]?.facts[0]?.sourceName).toBeNull();
    expect(plan.destinations[0]?.facts[0]?.displayLabel).toBe("Climate");
    expect(plan.destinations[0]?.facts[0]?.factKey).toBe("climate");
    expect(plan.destinations[0]?.facts).toEqual(expect.any(Array));
  });

  it("builds a deterministic canonical object across repeated parses", async () => {
    const first = await loadFrozenWorkbookV31DeterministicImport();
    const second = await loadFrozenWorkbookV31DeterministicImport();
    expect(JSON.stringify(first.canonicalDestinations)).toBe(JSON.stringify(second.canonicalDestinations));
  });

  it("builds a canonical destination object from a raw workbook row", () => {
    const sheetRows = new Map<string, Array<Array<string>>>([
      ["DESTINATIONS", [["destination_key", "destination_name", "country", "city", "slug", "short_description", "long_description", "currency", "primary_language", "time_zone"], ["new-braunfels-tx-us", "New Braunfels", "United States", "New Braunfels", "new-braunfels-texas", "Short", "Long", "USD", "English", "CDT"]]],
      ["DESTINATION_FACTS", [["destination_key", "fact_key", "fact_group", "value_text", "display_label", "source_name"], ["new-braunfels-tx-us", "climate", "climate", "Warm", "Climate", "Workbook"]]],
      ["DESTINATION_SCORES", [["destination_key", "score_key", "score_value", "score_label", "methodology_version"], ["new-braunfels-tx-us", "retirement", "82", "Retirement", "v1"]]],
      ["NEIGHBORHOODS", []],
      ["PLACES", []],
      ["RESOURCES", []],
      ["MEDIA", []],
      ["COST_OF_LIVING", []],
      ["CLIMATE_MONTHLY", []],
      ["HOUSING_PROPERTY", []],
      ["PROPERTY_RESOURCES", []],
      ["HEALTHCARE_INSURANCE", []],
      ["VISA_RESIDENCY", []],
      ["TAXES_FINANCE", []],
      ["LGBTQ_INCLUSIVITY", []],
      ["SAFETY_RISKS", []],
      ["TRANSPORT_AIRPORTS", []],
      ["CONNECTIVITY_REMOTE_WORK", []],
      ["LANGUAGE_INTEGRATION", []],
      ["PETS", []],
      ["FAMILY_EDUCATION", []],
      ["COMMUNITY_SOCIAL", []],
      ["ACCESSIBILITY", []],
      ["BUREAUCRACY_SETUP", []],
      ["WORK_BUSINESS", []],
      ["RETIREMENT_AGING", []],
      ["LIFESTYLE_LAWS", []],
      ["REALITY_CHECK", []],
      ["MOVE_CHECKLIST", []],
      ["ENVIRONMENT_QUALITY", []],
      ["DAILY_LIFE_PRACTICALITY", []],
      ["EVENTS_SEASONALITY", []],
      ["SOURCES", []],
    ]);
    const headersBySheet = new Map<string, string[]>([["DESTINATIONS", ["destination_key", "destination_name", "country", "city", "slug", "short_description", "long_description", "currency", "primary_language", "time_zone"]], ["DESTINATION_FACTS", ["destination_key", "fact_key", "fact_group", "value_text", "display_label", "source_name"]], ["DESTINATION_SCORES", ["destination_key", "score_key", "score_value", "score_label", "methodology_version"]]]);
    const canonical = buildDeterministicV31CanonicalDestination({
      destinationKey: "new-braunfels-tx-us",
      destinationRow: ["new-braunfels-tx-us", "New Braunfels", "United States", "New Braunfels", "new-braunfels-texas", "Short", "Long", "USD", "English", "CDT"],
      destinationHeaders: ["destination_key", "destination_name", "country", "city", "slug", "short_description", "long_description", "currency", "primary_language", "time_zone"],
      sheetRows,
      headersBySheet,
    });
    expect(canonical.identity.destinationKey).toBe("new-braunfels-tx-us");
    expect(canonical.facts).toHaveLength(1);
    expect(canonical.scores).toHaveLength(1);
  });
});
