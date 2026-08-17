import { describe, expect, it } from "vitest";

import type { DeterministicV31CanonicalDestination } from "../../../workbook-v31-deterministic-core";
import { mapCanonicalDestinationToStoredState } from "../map-canonical-destination-to-stored-state";
import { buildDestinationPlan } from "../plan-destination";
import type { ApprovedDestinationScope, CanonicalDestinationKey, DestinationId, DiffPolicy, KeyedChildModuleKey, ResolvedDestinationIdentity, StoredDestinationState } from "../types";

const DESTINATION_KEY = "dest-a" as CanonicalDestinationKey;
const DESTINATION_ID = "dest-id-a" as DestinationId;

function createApprovedScope(): ApprovedDestinationScope {
  return [
    { destinationKey: DESTINATION_KEY, destinationId: DESTINATION_ID },
  ];
}

function createResolvedIdentity(): ResolvedDestinationIdentity {
  return { destinationKey: DESTINATION_KEY, destinationId: DESTINATION_ID };
}

function createDiffPolicy(): DiffPolicy {
  return { updateMode: "MERGE_NONBLANK", normalizationVersion: "v31-normalize-1", diffPolicyVersion: "v31-diff-1", arrayOrderRule: "stable-key-order" };
}

function createCanonicalDestination(overrides: Partial<DeterministicV31CanonicalDestination> = {}): DeterministicV31CanonicalDestination {
  return {
    identity: {
      destinationKey: DESTINATION_KEY,
      slug: "alpha",
      name: "Alpha",
      city: "Alpha City",
      country: "Country A",
    },
    editorial: {
      shortDescription: "Short",
      longDescription: "Long",
      currency: "USD",
      primaryLanguage: "English",
      timeZone: "UTC",
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
    environmentQuality: {
      air_quality_summary: "Good",
      water_quality_summary: "Clean",
    },
    dailyLifePracticality: {
      grocery_access: "Near grocery",
      things_residents_wish_they_knew: "Easy",
    },
    eventsSeasonality: [],
    sources: [],
    ...overrides,
  } as DeterministicV31CanonicalDestination;
}

function buildPlan(canonical: DeterministicV31CanonicalDestination, storedOverride?: StoredDestinationState) {
  return buildDestinationPlan({
    resolvedDestinationIdentity: createResolvedIdentity(),
    canonicalDestination: canonical,
    storedDestinationState: storedOverride ?? mapCanonicalDestinationToStoredState(canonical),
    manifestInterpretation: { valid: true, errors: [], warnings: [], interpretedManifest: { entries: [] } },
    diffPolicy: createDiffPolicy(),
    approvedScope: createApprovedScope(),
  });
}

function childOpsForModule(plan: ReturnType<typeof buildDestinationPlan>, module: KeyedChildModuleKey) {
  return plan.childOperations.filter((operation) => operation.module === module);
}

describe("keyed-child replay diff normalization", () => {
  it("marks unchanged keyed-child rows as UNCHANGED across all keyed-child modules", () => {
    const canonical = createCanonicalDestination({
      facts: [{ factKey: "fact-1", factGroup: "overview", valueText: "A", displayLabel: "A", sourceName: "Workbook" }] as DeterministicV31CanonicalDestination["facts"],
      scores: [{ scoreKey: "score-1", scoreValue: "8.4", scoreLabel: "Overall", methodologyVersion: "v3.1" }] as DeterministicV31CanonicalDestination["scores"],
      neighborhoods: [{ neighborhood_key: "hood-1", neighborhood_name: "Old Town", summary: "Center", area_type: "urban" }] as DeterministicV31CanonicalDestination["neighborhoods"],
      places: [{ place_key: "place-1", category_key: "food", place_name: "Bluefin", description: "Seafood", neighborhood_key: "hood-1", website_url: "https://example.com", google_maps_url: "https://maps.example.com", source_url: "https://source.example.com", address: "123 Main", phone: "+1 111", display_order: "1" }] as DeterministicV31CanonicalDestination["places"],
      resources: [{ resource_key: "resource-1", resource_category: "government", resource_name: "City Hall", url: "https://city.example.com" }] as DeterministicV31CanonicalDestination["resources"],
      media: [{ media_key: "media-1", media_type: "image", image_url: "https://img.example.com/a.jpg", caption: "Main square", subject: "Square" }] as DeterministicV31CanonicalDestination["media"],
      propertyResources: [{ resource_key: "property-1", resource_type: "agent", resource_name: "Local Realty", url: "https://realty.example.com" }] as DeterministicV31CanonicalDestination["propertyResources"],
      moveChecklist: [{ checklist_key: "check-1", task: "Open bank account", description: "Bring passport" }] as DeterministicV31CanonicalDestination["moveChecklist"],
      eventsSeasonality: [{ event_season_key: "season-1", description: "Summer high season", weather_context: "Hot and dry" }] as DeterministicV31CanonicalDestination["eventsSeasonality"],
      sources: [{ source_key: "source-1", source_name: "Tourism Board", source_url: "https://source.example.com", source_type: "official" }] as DeterministicV31CanonicalDestination["sources"],
    });

    const plan = buildPlan(canonical);

    const modules: KeyedChildModuleKey[] = ["facts", "scores", "neighborhoods", "places", "resources", "media", "propertyResources", "moveChecklist", "eventsSeasonality", "sources"];
    for (const module of modules) {
      const operations = childOpsForModule(plan, module);
      expect(operations).toHaveLength(1);
      expect(operations[0]?.kind).toBe("UNCHANGED_CHILD");
      expect(operations.some((operation) => operation.kind === "UPDATE_CHILD" || operation.kind === "CREATE_CHILD")).toBe(false);
    }
  });

  it("creates exactly one UPDATE_CHILD when a single place field changes", () => {
    const baseCanonical = createCanonicalDestination({
      places: [{ place_key: "place-1", category_key: "food", place_name: "Bluefin", description: "Seafood", neighborhood_key: "hood-1", website_url: "https://example.com", google_maps_url: "https://maps.example.com", source_url: "https://source.example.com", address: "123 Main", phone: "+1 111", display_order: "1" }] as DeterministicV31CanonicalDestination["places"],
    });

    const changedCanonical = createCanonicalDestination({
      places: [{ place_key: "place-1", category_key: "food", place_name: "Bluefin", description: "Updated description", neighborhood_key: "hood-1", website_url: "https://example.com", google_maps_url: "https://maps.example.com", source_url: "https://source.example.com", address: "123 Main", phone: "+1 111", display_order: "1" }] as DeterministicV31CanonicalDestination["places"],
    });

    const plan = buildPlan(changedCanonical, mapCanonicalDestinationToStoredState(baseCanonical));
    const placeOps = childOpsForModule(plan, "places");

    expect(placeOps).toHaveLength(1);
    expect(placeOps[0]?.kind).toBe("UPDATE_CHILD");
  });

  it("creates exactly one UPDATE_CHILD when a neighborhood summary changes", () => {
    const baseCanonical = createCanonicalDestination({
      neighborhoods: [{ neighborhood_key: "hood-1", neighborhood_name: "Old Town", summary: "Center", area_type: "urban" }] as DeterministicV31CanonicalDestination["neighborhoods"],
    });

    const changedCanonical = createCanonicalDestination({
      neighborhoods: [{ neighborhood_key: "hood-1", neighborhood_name: "Old Town", summary: "Waterfront", area_type: "urban" }] as DeterministicV31CanonicalDestination["neighborhoods"],
    });

    const plan = buildPlan(changedCanonical, mapCanonicalDestinationToStoredState(baseCanonical));
    const ops = childOpsForModule(plan, "neighborhoods");

    expect(ops).toHaveLength(1);
    expect(ops[0]?.kind).toBe("UPDATE_CHILD");
  });

  it("creates CREATE_CHILD only for genuinely new stable keys", () => {
    const baseCanonical = createCanonicalDestination({
      facts: [{ factKey: "fact-1", factGroup: "overview", valueText: "A", displayLabel: "A", sourceName: "Workbook" }] as DeterministicV31CanonicalDestination["facts"],
    });

    const incomingCanonical = createCanonicalDestination({
      facts: [
        { factKey: "fact-1", factGroup: "overview", valueText: "A", displayLabel: "A", sourceName: "Workbook" },
        { factKey: "fact-2", factGroup: "overview", valueText: "B", displayLabel: "B", sourceName: "Workbook" },
      ] as DeterministicV31CanonicalDestination["facts"],
    });

    const plan = buildPlan(incomingCanonical, mapCanonicalDestinationToStoredState(baseCanonical));
    const factOps = childOpsForModule(plan, "facts");

    expect(factOps.some((operation) => operation.kind === "CREATE_CHILD" && operation.stableChildKey === "fact-2")).toBe(true);
    expect(factOps.some((operation) => operation.kind === "CREATE_CHILD" && operation.stableChildKey === "fact-1")).toBe(false);
  });

  it("does not recreate existing stable keys because canonical and stored naming differs", () => {
    const canonical = createCanonicalDestination({
      neighborhoods: [{ neighborhood_key: "hood-1", neighborhood_name: "Old Town", summary: "Center", area_type: "urban" }] as DeterministicV31CanonicalDestination["neighborhoods"],
    });

    const plan = buildPlan(canonical);
    const ops = childOpsForModule(plan, "neighborhoods");

    expect(ops).toHaveLength(1);
    expect(ops[0]?.kind).toBe("UNCHANGED_CHILD");
    expect(ops.some((operation) => operation.kind === "CREATE_CHILD")).toBe(false);
  });

  it("ignores keyed-child object property order changes", () => {
    const canonical = createCanonicalDestination({
      facts: [{ sourceName: "Workbook", displayLabel: "A", valueText: "A", factGroup: "overview", factKey: "fact-1" }] as DeterministicV31CanonicalDestination["facts"],
    });

    const stored = mapCanonicalDestinationToStoredState(createCanonicalDestination({
      facts: [{ factKey: "fact-1", factGroup: "overview", valueText: "A", displayLabel: "A", sourceName: "Workbook" }] as DeterministicV31CanonicalDestination["facts"],
    }));

    const plan = buildPlan(canonical, stored);
    const ops = childOpsForModule(plan, "facts");

    expect(ops).toHaveLength(1);
    expect(ops[0]?.kind).toBe("UNCHANGED_CHILD");
  });

  it("treats null and undefined place optional fields as equivalent under merge nonblank", () => {
    const canonical = createCanonicalDestination({
      places: [{ place_key: "place-1", category_key: "food", place_name: "Bluefin", description: null, neighborhood_key: null, website_url: undefined, google_maps_url: null, source_url: undefined, address: undefined, phone: null, display_order: null }] as unknown as DeterministicV31CanonicalDestination["places"],
    });

    const stored = mapCanonicalDestinationToStoredState(createCanonicalDestination({
      places: [{ place_key: "place-1", category_key: "food", place_name: "Bluefin", description: null, neighborhood_key: null, website_url: null, google_maps_url: null, source_url: null, address: null, phone: null, display_order: null }] as unknown as DeterministicV31CanonicalDestination["places"],
    }));

    const plan = buildPlan(canonical, stored);
    const placeOps = childOpsForModule(plan, "places");

    expect(placeOps).toHaveLength(1);
    expect(placeOps[0]?.kind).toBe("UNCHANGED_CHILD");
  });

  it("does not emit score updates when only methodologyVersion differs", () => {
    const canonical = createCanonicalDestination({
      scores: [{ scoreKey: "score-1", scoreValue: "8.4", scoreLabel: "Overall", methodologyVersion: "v3.1" }] as DeterministicV31CanonicalDestination["scores"],
    });

    const stored = mapCanonicalDestinationToStoredState(canonical);
    const storedWithNullMethodology: StoredDestinationState = {
      ...stored,
      scores: stored.scores.map((score) => ({
        ...score,
        methodologyVersion: null,
      })),
    };

    const plan = buildPlan(canonical, storedWithNullMethodology);
    const scoreOps = childOpsForModule(plan, "scores");

    expect(scoreOps).toHaveLength(1);
    expect(scoreOps[0]?.kind).toBe("UNCHANGED_CHILD");
  });

  it("has no cross-destination leakage when approved scope contains other destinations", () => {
    const canonical = createCanonicalDestination({
      facts: [{ factKey: "fact-1", factGroup: "overview", valueText: "A", displayLabel: "A", sourceName: "Workbook" }] as DeterministicV31CanonicalDestination["facts"],
    });

    const plan = buildDestinationPlan({
      resolvedDestinationIdentity: createResolvedIdentity(),
      canonicalDestination: canonical,
      storedDestinationState: mapCanonicalDestinationToStoredState(canonical),
      manifestInterpretation: { valid: true, errors: [], warnings: [], interpretedManifest: { entries: [] } },
      diffPolicy: createDiffPolicy(),
      approvedScope: [
        { destinationKey: DESTINATION_KEY, destinationId: DESTINATION_ID },
        { destinationKey: "dest-b" as CanonicalDestinationKey, destinationId: "dest-id-b" as DestinationId },
      ],
    });

    expect(plan.childOperations.every((operation) => operation.kind === "UNCHANGED_CHILD")).toBe(true);
  });

  it("keeps delete policy unchanged by preserving omitted keyed children", () => {
    const stored = mapCanonicalDestinationToStoredState(createCanonicalDestination({
      places: [{ place_key: "place-1", category_key: "food", place_name: "Bluefin", description: "Seafood", neighborhood_key: "hood-1", website_url: null, google_maps_url: null, source_url: null, address: null, phone: null, display_order: "1" }] as DeterministicV31CanonicalDestination["places"],
    }));

    const canonical = createCanonicalDestination({ places: [] });
    const plan = buildPlan(canonical, stored);
    const placeOps = childOpsForModule(plan, "places");

    expect(placeOps).toHaveLength(1);
    expect(placeOps[0]?.kind).toBe("PRESERVE_CHILD");
    expect(placeOps.some((operation) => operation.kind === "DELETE_CHILD")).toBe(false);
  });
});
