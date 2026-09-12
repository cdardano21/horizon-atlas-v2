import { describe, expect, it } from "vitest";
import {
  buildDestinationPlanWriteStatements,
  buildKeyedChildConflictTarget,
  checkExecutionGates,
  executeApprovedDestinationPlanWrite,
  CURRENT_V31_PROFILE_STORAGE_VERSION,
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
  EventsSeasonalityKey,
  FactKey,
  LifestyleFeatureKey,
  MediaKey,
  ModuleExecutionOperation,
  MoveChecklistKey,
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

  it("maps media primary identity, gallery order, and verification to premium_media", () => {
    const childOperations: ChildOperation[] = [{
      kind: "CREATE_CHILD",
      module: "media",
      stableChildKey: "media-1" as any,
      currentChild: null,
      incomingChild: { mediaKey: "media-1", kind: "image", url: "https://upload.wikimedia.org/example.jpg", caption: "View", altText: "View", isPrimary: "1", sortOrder: "2", verified: "1", sourceName: "Commons", sourceUrl: "https://commons.wikimedia.org/wiki/File:Example.jpg", licenseNotes: "CC BY-SA" } as any,
    }];

    const statements = buildDestinationPlanWriteStatements(basePlan({ childOperations }));

    expect(statements[0].text).toContain("premium_media");
    for (const column of ["is_primary", "sort_order", "verified"]) expect(statements[0].text).toContain(column);
    expect(statements[0].values).toEqual([DEST_ID, DEST_KEY, "media-1", "image", "https://upload.wikimedia.org/example.jpg", "View", "View", "1", "2", true, "Commons", "https://commons.wikimedia.org/wiki/File:Example.jpg", { licenseNotes: "CC BY-SA" }]);
  });

  describe.each(["canonical", "stored"] as const)("%s media sort-order SQL contract", (shape) => {
    it.each([
      [null, 0], [undefined, 0], ["", 0], [" ", 0],
      [0, 0], ["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"],
    ])("preserves authored order or defaults missing order %s to %s", (order, expected) => {
      for (const role of ["hero", "gallery"]) {
        const incomingChild = shape === "canonical"
          ? { media_key: "media-order", media_type: role, image_url: "https://upload.wikimedia.org/media.jpg", caption: "View", subject: "Skyline", primary_image: role === "hero" ? "1" : "0", gallery_order: order, source_name: "Commons", source_url: "https://commons.wikimedia.org/wiki/File:Media.jpg", verified: "1" }
          : { mediaKey: "media-order", kind: role, url: "https://upload.wikimedia.org/media.jpg", caption: "View", altText: "Skyline", isPrimary: role === "hero" ? "1" : "0", sortOrder: order, sourceName: "Commons", sourceUrl: "https://commons.wikimedia.org/wiki/File:Media.jpg", verified: "1" };
        const childOperations = [{
          kind: "CREATE_CHILD", module: "media", stableChildKey: "media-order" as MediaKey,
          currentChild: null, incomingChild,
        }] as unknown as ChildOperation[];
        // Statement generation only: no SQL executor or database connection.
        const plan = basePlan({ childOperations });
        const statements = buildDestinationPlanWriteStatements(plan);
        const statement = statements[0];
        expect(statement.text).toContain("insert into public.premium_media");
        const columns = statement.text.match(/premium_media \(([^)]+)\)/)![1].split(", ");
        const values = Object.fromEntries(columns.map((column, index) => [column, statement.values[index]]));
        expect(values.sort_order, `${shape}/${role}`).toBe(expected);
        expect(values.sort_order, `${shape}/${role}`).not.toBeNull();
        expect(values).toMatchObject({
          destination_id: DEST_ID, destination_key: DEST_KEY, media_key: "media-order",
          media_type: role, url: "https://upload.wikimedia.org/media.jpg", caption: "View",
          alt_text: "Skyline", is_primary: role === "hero" ? "1" : "0",
          source_name: "Commons", source_url: "https://commons.wikimedia.org/wiki/File:Media.jpg", verified: true,
        });
        expect(buildDestinationPlanWriteStatements(plan)).toEqual(statements);
      }
    });
  });

  it("translates a scalar CREATE on the editorial module into an upsert of premium_destination_profiles", () => {
    const scalarOperations: ScalarOperation[] = [
      { kind: "CREATE", module: "editorial", fieldPath: "shortDescription", currentValue: null, incomingValue: "A disposable synthetic test destination." },
    ];
    const statements = buildDestinationPlanWriteStatements(basePlan({ scalarOperations }));
    expect(statements).toHaveLength(1);
    expect(statements[0].text).toContain("premium_destination_profiles");
    expect(statements[0].text).toContain("summary = $3");
    expect(statements[0].text).toContain("profile_storage_version");
    expect(statements[0].text).toContain("greatest(coalesce(premium_destination_profiles.profile_storage_version, 0), excluded.profile_storage_version)");
    expect(statements[0].values).toEqual([DEST_ID, DEST_KEY, "A disposable synthetic test destination.", CURRENT_V31_PROFILE_STORAGE_VERSION]);
  });

  it("translates demographic identity fields into a destination-key-guarded root update", () => {
    const scalarOperations: ScalarOperation[] = [
      { kind: "CREATE", module: "identity", fieldPath: "population", currentValue: null, incomingValue: "98,857" },
      { kind: "UPDATE", module: "identity", fieldPath: "metroPopulation", currentValue: "2.5m", incomingValue: "2,655,342" },
      { kind: "CREATE", module: "identity", fieldPath: "elevation", currentValue: null, incomingValue: "192 m" },
    ];
    const statements = buildDestinationPlanWriteStatements(basePlan({ scalarOperations }));
    expect(statements).toEqual([{
      text: "update public.destinations_catalog set population = $3, metro_population = $4, elevation = $5, updated_at = now() where id = $1 and destination_key = $2",
      values: [DEST_ID, DEST_KEY, "98,857", "2,655,342", "192 m"],
    }]);
  });

  it("translates a scalar CLEAR into setting the column to null explicitly", () => {
    const scalarOperations: ScalarOperation[] = [
      { kind: "CLEAR", module: "editorial", fieldPath: "shortDescription", currentValue: "old", incomingValue: null },
    ];
    const statements = buildDestinationPlanWriteStatements(basePlan({ scalarOperations }));
    expect(statements).toHaveLength(1);
    expect(statements[0].values).toEqual([DEST_ID, DEST_KEY, null, CURRENT_V31_PROFILE_STORAGE_VERSION]);
  });

  it("does not emit any statement for PRESERVE or UNCHANGED scalar operations", () => {
    const scalarOperations: ScalarOperation[] = [
      { kind: "PRESERVE", module: "editorial", fieldPath: "shortDescription", currentValue: "keep me", incomingValue: null },
      { kind: "UNCHANGED", module: "editorial", fieldPath: "currency", currentValue: "USD", incomingValue: "USD" },
    ];
    expect(buildDestinationPlanWriteStatements(basePlan({ scalarOperations }))).toEqual([]);
  });

  it("stamps profile_storage_version forward-safely using GREATEST(coalesce(existing, 0), excluded) rather than an unconditional overwrite", () => {
    const scalarOperations: ScalarOperation[] = [
      { kind: "UPDATE", module: "editorial", fieldPath: "shortDescription", currentValue: "old", incomingValue: "new" },
    ];
    const statements = buildDestinationPlanWriteStatements(basePlan({ scalarOperations }));
    expect(statements).toHaveLength(1);
    // Never a bare `profile_storage_version = $n` overwrite - always guarded by GREATEST so an
    // older writer replaying against a row a newer process already advanced can never downgrade it.
    expect(statements[0].text).toContain(
      "profile_storage_version = greatest(coalesce(premium_destination_profiles.profile_storage_version, 0), excluded.profile_storage_version)",
    );
    expect(statements[0].values.at(-1)).toBe(CURRENT_V31_PROFILE_STORAGE_VERSION);
  });

  it("does not emit a module-presence row for the editorial module (it is the root profile row, not a REQUIRED_PRESENCE_MODULES entry)", () => {
    const scalarOperations: ScalarOperation[] = [
      { kind: "CREATE", module: "editorial", fieldPath: "shortDescription", currentValue: null, incomingValue: "A disposable synthetic test destination." },
    ];
    const statements = buildDestinationPlanWriteStatements(basePlan({ scalarOperations }));
    expect(statements).toHaveLength(1);
    expect(statements.some((statement) => statement.text.includes("premium_destination_module_presence"))).toBe(false);
  });

  it("translates a scalar CREATE on the environmentQuality singleton module into a content upsert plus a module-presence insert", () => {
    const scalarOperations: ScalarOperation[] = [
      { kind: "CREATE", module: "environmentQuality", fieldPath: "summary", currentValue: null, incomingValue: "Clean air, low pollution." },
    ];
    const statements = buildDestinationPlanWriteStatements(basePlan({ scalarOperations }));
    expect(statements).toHaveLength(2);
    expect(statements[0].text).toContain("premium_environment_quality");
    expect(statements[0].text).toContain("on conflict (destination_id)");
    expect(statements[0].text).not.toContain("profile_storage_version");
    expect(statements[0].values).toEqual([DEST_ID, DEST_KEY, "Clean air, low pollution."]);
    expect(statements[1].text).toBe(
      "insert into public.premium_destination_module_presence (destination_id, destination_key, module_key) values ($1, $2, $3) on conflict (destination_id, module_key) do nothing",
    );
    expect(statements[1].values).toEqual([DEST_ID, DEST_KEY, "environmentQuality"]);
  });

  it("translates a scalar CREATE on the dailyLifePracticality singleton module into a content upsert plus a module-presence insert", () => {
    const scalarOperations: ScalarOperation[] = [
      { kind: "CREATE", module: "dailyLifePracticality", fieldPath: "summary", currentValue: null, incomingValue: "Everyday errands are simple here." },
    ];
    const statements = buildDestinationPlanWriteStatements(basePlan({ scalarOperations }));
    expect(statements).toHaveLength(2);
    expect(statements[0].text).toContain("premium_daily_life_practicality");
    expect(statements[1].text).toContain("premium_destination_module_presence");
    expect(statements[1].values).toEqual([DEST_ID, DEST_KEY, "dailyLifePracticality"]);
  });

  it("does not emit any statement (content or presence) for a singleton module with only PRESERVE/UNCHANGED scalar operations", () => {
    const scalarOperations: ScalarOperation[] = [
      { kind: "PRESERVE", module: "environmentQuality", fieldPath: "summary", currentValue: "keep me", incomingValue: null },
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
        incomingChild: { neighborhoodKey: "hood-1" as NeighborhoodKey, name: "Testland Heights", summary: "A synthetic neighborhood.", areaType: "urban", bestFor: null, walkabilityRating: null, safetyRating: null, transitRating: null, housingCharacter: null, pros: null, cons: null, googleMapsUrl: null },
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
        incomingChild: { neighborhood_key: "hood-1", neighborhood_name: "Snake Case Heights", summary: "ok", area_type: "urban", best_for: "walkers", walkability_rating: "high", safety_rating: "high", transit_rating: "medium", housing_character: "mixed", pros: "parks", cons: "traffic", google_maps_url: "https://maps.example.com/hood-1" } as any,
      },
    ];
    const statements = buildDestinationPlanWriteStatements(basePlan({ childOperations }));
    expect(statements[0].values).toEqual([DEST_ID, DEST_KEY, "hood-1", "Snake Case Heights", "ok", "urban", "walkers", "high", "high", "medium", "mixed", "parks", "traffic", "https://maps.example.com/hood-1"]);
  });

  it("translates CREATE_CHILD for places into an upsert that includes neighborhood_key, website_url, google_maps_url, source_url, address, phone, and display_order alongside category/name/description", () => {
    const childOperations: ChildOperation[] = [
      {
        kind: "CREATE_CHILD",
        module: "places",
        stableChildKey: "place-1" as any,
        currentChild: null,
        incomingChild: {
          placeKey: "place-1" as any,
          category: "restaurant",
          name: "Bluefin Grill & Bar",
          description: "Seafood-focused restaurant.",
          neighborhoodKey: "hood-1",
          websiteUrl: "https://www.bluefingrillbar.com/",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Bluefin",
          sourceUrl: "https://www.bluefingrillbar.com/",
          address: "2738 Brownwood Blvd",
          phone: "+1 352-571-5344",
          displayOrder: "1",
        },
      },
    ];
    const statements = buildDestinationPlanWriteStatements(basePlan({ childOperations }));
    expect(statements[0].text).toContain("premium_places");
    for (const column of ["category_key", "place_name", "description", "neighborhood_key", "website_url", "google_maps_url", "source_url", "address", "phone", "display_order"]) {
      expect(statements[0].text).toContain(column);
    }
    expect(statements[0].values).toEqual([
      DEST_ID,
      DEST_KEY,
      "place-1",
      "restaurant",
      "Bluefin Grill & Bar",
      "Seafood-focused restaurant.",
      "hood-1",
      "https://www.bluefingrillbar.com/",
      "https://www.google.com/maps/search/?api=1&query=Bluefin",
      "https://www.bluefingrillbar.com/",
      "2738 Brownwood Blvd",
      "+1 352-571-5344",
      "1",
    ]);
  });

  it("falls back to raw canonical snake_case field names for place payloads that were never given a camelCase alias upstream (neighborhood_key, website_url, google_maps_url, source_url, display_order)", () => {
    const childOperations: ChildOperation[] = [
      {
        kind: "CREATE_CHILD",
        module: "places",
        stableChildKey: "place-1" as any,
        currentChild: null,
        incomingChild: {
          place_key: "place-1",
          category_key: "restaurant",
          place_name: "Snake Case Bistro",
          description: "ok",
          neighborhood_key: "hood-1",
          website_url: "https://example-test.invalid/bistro",
          google_maps_url: "https://maps.example-test.invalid/bistro",
          source_url: "https://example-test.invalid/bistro",
          address: "1 Main St",
          phone: "+1 555-0000",
          display_order: "2",
        } as any,
      },
    ];
    const statements = buildDestinationPlanWriteStatements(basePlan({ childOperations }));
    expect(statements[0].values).toEqual([
      DEST_ID,
      DEST_KEY,
      "place-1",
      "restaurant",
      "Snake Case Bistro",
      "ok",
      "hood-1",
      "https://example-test.invalid/bistro",
      "https://maps.example-test.invalid/bistro",
      "https://example-test.invalid/bistro",
      "1 Main St",
      "+1 555-0000",
      "2",
    ]);
  });

  it("does not add columns to any other keyed-child module's write statement when the places config is extended", () => {
    const childOperations: ChildOperation[] = [
      {
        kind: "CREATE_CHILD",
        module: "sources",
        stableChildKey: "source-1" as SourceKey,
        currentChild: null,
        incomingChild: { sourceKey: "source-1" as SourceKey, name: "Unrelated Source", url: "https://example-test.invalid/source", type: "gov" },
      },
    ];
    const statements = buildDestinationPlanWriteStatements(basePlan({ childOperations }));
    expect(statements[0].text).toContain("premium_sources");
    expect(statements[0].values).toEqual([DEST_ID, DEST_KEY, "source-1", "Unrelated Source", "https://example-test.invalid/source", "gov"]);
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
    expect(statements[1].values).toEqual([DEST_ID, DEST_KEY, "old-1", "housing", "1200", "1800", "USD", null, null, null, null, null]);
    expect(statements[2].values).toEqual([DEST_ID, DEST_KEY, "old-2", "groceries", "300", "500", "USD", null, null, null, null, null]);
    expect(statements[3].text).toContain("premium_destination_module_presence");
    expect(statements[3].values).toEqual([DEST_ID, DEST_KEY, "costOfLiving"]);
  });

  it("persists every lifestyle-feature field with stable record-key identity", () => {
    const moduleExecutionOperations: ModuleExecutionOperation[] = [{
      kind: "REPLACE_MODULE",
      module: "lifestyleFeatures",
      expectedBefore: [],
      expectedAfter: [{
        recordKey: "life-1" as LifestyleFeatureKey,
        featureGroup: "outdoors",
        featureKey: "coastal_walks",
        featureValue: "Strong",
        availabilityLevel: "HIGH",
        proximityBand: "LOCAL",
        displayLabel: "Coastal walks",
        evidenceSummary: "Several signed waterfront routes.",
        sourceName: "Tourism office",
        sourceUrl: "https://example.com/walks",
        sourceAsOfDate: "2026-08-01",
        confidence: "HIGH",
        matchingEnabled: "0",
        displayEnabled: "1",
        notes: "Seasonal shade varies.",
      }],
    }];
    const statements = buildDestinationPlanWriteStatements(basePlan({ moduleExecutionOperations }));
    expect(statements).toHaveLength(3);
    expect(statements[0].text).toBe("delete from public.premium_lifestyle_features where destination_id = $1 and destination_key = $2");
    expect(statements[1].text).toContain("insert into public.premium_lifestyle_features");
    expect(statements[1].values).toEqual([DEST_ID, DEST_KEY, "life-1", "outdoors", "coastal_walks", "Strong", "HIGH", "LOCAL", "Coastal walks", "Several signed waterfront routes.", "Tourism office", "https://example.com/walks", "2026-08-01", "HIGH", "0", "1", "Seasonal shade varies."]);
    expect(statements[2].values).toEqual([DEST_ID, DEST_KEY, "lifestyleFeatures"]);
  });

  describe("REPLACE_MODULE boolean-column coercion (transportation.public_transit_available)", () => {
    it("preserves null rather than inventing a boolean from narrative workbook prose", () => {
      const moduleExecutionOperations: ModuleExecutionOperation[] = [
        {
          kind: "REPLACE_MODULE",
          module: "transportation",
          expectedBefore: [],
          expectedAfter: [{ summary: "Airport 30 min away", airportSummary: "Harry Reid International", transitSummary: "Limited" }],
        },
      ];
      const statements = buildDestinationPlanWriteStatements(basePlan({ moduleExecutionOperations }));
      expect(statements[1].text).not.toContain("Limited");
      expect(statements[1].values).toEqual([DEST_ID, DEST_KEY, "record-1", "Airport 30 min away", "Harry Reid International", null, null, null, null, null, null, null, null, null, null, { transit_summary_qualifier: "Limited" }]);
    });

    it("coerces the read port's own round-trip strings 'true'/'false' into real booleans", () => {
      const moduleExecutionOperations: ModuleExecutionOperation[] = [
        {
          kind: "REPLACE_MODULE",
          module: "transportation",
          expectedBefore: [],
          expectedAfter: [
            { summary: "A", airportSummary: "Airport A", transitSummary: "true" },
            { summary: "B", airportSummary: "Airport B", transitSummary: "FALSE" },
          ],
        },
      ];
      const statements = buildDestinationPlanWriteStatements(basePlan({ moduleExecutionOperations }));
      expect(statements[1].values).toEqual([DEST_ID, DEST_KEY, "record-1", "A", "Airport A", true, null, null, null, null, null, null, null, null, null]);
      expect(statements[2].values).toEqual([DEST_ID, DEST_KEY, "record-2", "B", "Airport B", false, null, null, null, null, null, null, null, null, null]);
    });

    it("keeps null/undefined transit data safely null instead of throwing", () => {
      const moduleExecutionOperations: ModuleExecutionOperation[] = [
        {
          kind: "REPLACE_MODULE",
          module: "transportation",
          expectedBefore: [],
          expectedAfter: [{ summary: "A", airportSummary: "Airport A", transitSummary: null }],
        },
      ];
      const statements = buildDestinationPlanWriteStatements(basePlan({ moduleExecutionOperations }));
      expect(statements[1].values).toEqual([DEST_ID, DEST_KEY, "record-1", "A", "Airport A", null, null, null, null, null, null, null, null, null, null]);
    });

    it("passes an already-boolean value through unchanged", () => {
      const moduleExecutionOperations: ModuleExecutionOperation[] = [
        {
          kind: "REPLACE_MODULE",
          module: "transportation",
          expectedBefore: [],
          expectedAfter: [{ summary: "A", airportSummary: "Airport A", transitSummary: true as unknown as string }],
        },
      ];
      const statements = buildDestinationPlanWriteStatements(basePlan({ moduleExecutionOperations }));
      expect(statements[1].values).toEqual([DEST_ID, DEST_KEY, "record-1", "A", "Airport A", true, null, null, null, null, null, null, null, null, null]);
    });

    it("does not touch narrative string columns (summary/name) even though the coercion set is checked per-column", () => {
      const moduleExecutionOperations: ModuleExecutionOperation[] = [
        {
          kind: "REPLACE_MODULE",
          module: "transportation",
          expectedBefore: [],
          expectedAfter: [{ summary: "true", airportSummary: "false", transitSummary: null }],
        },
      ];
      const statements = buildDestinationPlanWriteStatements(basePlan({ moduleExecutionOperations }));
      // "summary" and "name" are not in REPLACE_MODULE_BOOLEAN_COLUMNS, so literal "true"/"false"
      // text in those unrelated columns must pass through as plain strings, not booleans.
      expect(statements[1].values).toEqual([DEST_ID, DEST_KEY, "record-1", "true", "false", null, null, null, null, null, null, null, null, null, null]);
    });

    it("leaves healthcare narrative columns unaffected while defaulting absent private care to null", () => {
      const moduleExecutionOperations: ModuleExecutionOperation[] = [
        { kind: "REPLACE_MODULE", module: "healthcare", expectedBefore: [], expectedAfter: [{ summary: "true", publicAccessSummary: "false", insuranceSummary: "Limited" }] },
      ];
      const statements = buildDestinationPlanWriteStatements(basePlan({ moduleExecutionOperations }));
      expect(statements[1].values).toEqual([DEST_ID, DEST_KEY, "record-1", "true", "false", "Limited", null, null, null, null, null, null, null, {}]);
    });
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

  it("deletes existing rows and writes presence when a REPLACE_MODULE has an empty expectedAfter", () => {
    const moduleExecutionOperations: ModuleExecutionOperation[] = [
      { kind: "REPLACE_MODULE", module: "healthcare", expectedBefore: [{ summary: "old" } as any], expectedAfter: [] },
    ];
    const statements = buildDestinationPlanWriteStatements(basePlan({ moduleExecutionOperations }));
    expect(statements).toHaveLength(2);
    expect(statements[0].text).toBe("delete from public.premium_healthcare_insurance where destination_id = $1 and destination_key = $2");
    expect(statements[1].text).toContain("premium_destination_module_presence");
    expect(statements[1].values).toEqual([DEST_ID, DEST_KEY, "healthcare"]);
  });

  it("real-schema regression: moveChecklist CREATE_CHILD conflict target is (destination_id, checklist_key) - NOT 3-column", () => {
    // premium_move_checklist's real live unique constraint is UNIQUE(destination_id, checklist_key)
    // (no destination_key) - confirmed against pg_constraint. The generic 3-column assumption used
    // here previously caused every real Batch #1 write to fail with "there is no unique or
    // exclusion constraint matching the ON CONFLICT specification".
    const childOperations: ChildOperation[] = [
      {
        kind: "CREATE_CHILD",
        module: "moveChecklist",
        stableChildKey: "checklist-1" as MoveChecklistKey,
        currentChild: null,
        incomingChild: { checklistKey: "checklist-1" as MoveChecklistKey, summary: "Pack boxes", checklistNotes: "Start early" },
      },
    ];
    const statements = buildDestinationPlanWriteStatements(basePlan({ childOperations }));
    expect(statements[0].text).toContain("insert into public.premium_move_checklist");
    expect(statements[0].text).toContain("on conflict (destination_id, checklist_key) do update");
    expect(statements[0].text).not.toContain("on conflict (destination_id, destination_key, checklist_key)");
  });

  it("real-schema regression: eventsSeasonality CREATE_CHILD conflict target is (destination_id, event_seasonality_key) - NOT 3-column", () => {
    // premium_events_seasonality's real live unique constraint is
    // UNIQUE(destination_id, event_seasonality_key) (no destination_key) - confirmed against
    // pg_constraint, the second of the two real schema mismatches this fix addresses.
    const childOperations: ChildOperation[] = [
      {
        kind: "CREATE_CHILD",
        module: "eventsSeasonality",
        stableChildKey: "event-1" as EventsSeasonalityKey,
        currentChild: null,
        incomingChild: { eventSeasonalityKey: "event-1" as EventsSeasonalityKey, summary: "Rainy season", seasonalityNotes: "Bring an umbrella" },
      },
    ];
    const statements = buildDestinationPlanWriteStatements(basePlan({ childOperations }));
    expect(statements[0].text).toContain("insert into public.premium_events_seasonality");
    expect(statements[0].text).toContain("on conflict (destination_id, event_seasonality_key) do update");
    expect(statements[0].text).not.toContain("on conflict (destination_id, destination_key, event_seasonality_key)");
  });

  it("an ordinary 3-column keyed module (facts) still uses the full (destination_id, destination_key, stableKey) conflict target", () => {
    const childOperations: ChildOperation[] = [
      {
        kind: "CREATE_CHILD",
        module: "facts",
        stableChildKey: "fact-1" as FactKey,
        currentChild: null,
        incomingChild: { factKey: "fact-1" as FactKey, factGroup: "identity", valueText: "A fact", displayLabel: "Fact", sourceName: "Test" },
      },
    ];
    const statements = buildDestinationPlanWriteStatements(basePlan({ childOperations }));
    expect(statements[0].text).toContain("on conflict (destination_id, destination_key, fact_key) do update");
  });

  it("every keyed-child module has a non-empty conflictColumns config (no silently unsafe ON CONFLICT target possible)", () => {
    // Exercises CREATE_CHILD for every one of the 10 keyed-child modules and proves each produces
    // a non-empty ON CONFLICT target - the write port throws rather than emitting invalid SQL if a
    // module's conflictColumns config were ever left empty (see the throw in buildKeyedChildStatements).
    const modules: ReadonlyArray<ChildOperation["module"]> = [
      "facts", "scores", "neighborhoods", "places", "resources", "media",
      "propertyResources", "moveChecklist", "eventsSeasonality", "sources",
    ];
    for (const module of modules) {
      const childOperations: ChildOperation[] = [
        { kind: "CREATE_CHILD", module, stableChildKey: "k1" as any, currentChild: null, incomingChild: { summary: "x" } as any },
      ];
      const statements = buildDestinationPlanWriteStatements(basePlan({ childOperations }));
      const insertStatement = statements.find((statement) => statement.text.startsWith("insert into public."));
      expect(insertStatement?.text).toMatch(/on conflict \([^)]+\) do update/);
    }
  });

  it("UPDATE_CHILD for an existing moveChecklist row uses DO UPDATE against the same 2-column target, never a duplicate insert-only path", () => {
    const childOperations: ChildOperation[] = [
      {
        kind: "UPDATE_CHILD",
        module: "moveChecklist",
        stableChildKey: "checklist-1" as MoveChecklistKey,
        currentChild: { checklistKey: "checklist-1" as MoveChecklistKey, summary: "Pack boxes", checklistNotes: "old" },
        incomingChild: { checklistKey: "checklist-1" as MoveChecklistKey, summary: "Pack boxes", checklistNotes: "Start early" },
      },
    ];
    const statements = buildDestinationPlanWriteStatements(basePlan({ childOperations }));
    expect(statements[0].text).toContain("on conflict (destination_id, checklist_key) do update set summary = excluded.summary, checklist_notes = excluded.checklist_notes");
  });

  it("UPDATE_CHILD for an existing eventsSeasonality row uses DO UPDATE against the same 2-column target", () => {
    const childOperations: ChildOperation[] = [
      {
        kind: "UPDATE_CHILD",
        module: "eventsSeasonality",
        stableChildKey: "event-1" as EventsSeasonalityKey,
        currentChild: { eventSeasonalityKey: "event-1" as EventsSeasonalityKey, summary: "Rainy season", seasonalityNotes: "old" },
        incomingChild: { eventSeasonalityKey: "event-1" as EventsSeasonalityKey, summary: "Rainy season", seasonalityNotes: "Bring an umbrella" },
      },
    ];
    const statements = buildDestinationPlanWriteStatements(basePlan({ childOperations }));
    expect(statements[0].text).toContain("on conflict (destination_id, event_seasonality_key) do update set summary = excluded.summary, seasonality_notes = excluded.seasonality_notes");
  });

  it("destination isolation for the 2-column conflict targets is structural: destination_id is always the first bound parameter and part of the conflict target, so identical checklist/event keys under a different destination_id can never collide", () => {
    const otherDestinationId = "22222222-2222-2222-2222-222222222222" as DestinationId;
    const otherIdentity: ResolvedDestinationIdentity = { destinationKey: "other-dest" as CanonicalDestinationKey, destinationId: otherDestinationId };
    const childOperations: ChildOperation[] = [
      {
        kind: "CREATE_CHILD",
        module: "moveChecklist",
        stableChildKey: "checklist-1" as MoveChecklistKey,
        currentChild: null,
        incomingChild: { checklistKey: "checklist-1" as MoveChecklistKey, summary: "Pack boxes", checklistNotes: "Start early" },
      },
    ];
    const forDestA = buildDestinationPlanWriteStatements(basePlan({ childOperations }));
    const forDestB = buildDestinationPlanWriteStatements(basePlan({ destinationIdentity: otherIdentity, childOperations }));
    expect(forDestA[0].text).toBe(forDestB[0].text);
    expect(forDestA[0].values[0]).toBe(DEST_ID);
    expect(forDestB[0].values[0]).toBe(otherDestinationId);
    expect(forDestA[0].values[0]).not.toBe(forDestB[0].values[0]);
  });

  it("rejects an empty conflictColumns config rather than silently generating unsafe SQL", () => {
    expect(() => buildKeyedChildConflictTarget("someModule", [])).toThrow(/empty conflictColumns/);
    expect(buildKeyedChildConflictTarget("moveChecklist", ["destination_id", "checklist_key"])).toBe("destination_id, checklist_key");
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
        incomingChild: { neighborhoodKey: "hood-1" as NeighborhoodKey, name: "Testland Heights", summary: null, areaType: null, bestFor: null, walkabilityRating: null, safetyRating: null, transitRating: null, housingCharacter: null, pros: null, cons: null, googleMapsUrl: null },
      },
    ];
    const result = await executeApprovedDestinationPlanWrite(client, baseGateInput({ plan: basePlan({ scalarOperations, childOperations }) }));
    expect(result.outcome).toBe("FAILED");
    expect(result.error).toContain("simulated write failure");
    expect(calls[calls.length - 1]).toBe("ROLLBACK");
  });
});
