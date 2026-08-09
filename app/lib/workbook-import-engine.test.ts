import { describe, expect, it } from "vitest";
import {
  buildPremiumV2WorkbookContractPreview,
  buildPremiumV2WorkbookImportPlan,
  buildWorkbookImportPlan,
  buildWorkbookSchema,
  normalizeWorkbookImportMode,
  normalizeWorkbookPayloadToPremiumV2ImportInput,
} from "./workbook-import-engine";

describe("workbook import engine", () => {
  it("infers a schema from workbook headers without assuming a fixed field count", () => {
    const schema = buildWorkbookSchema("Master Destinations", ["slug", "city", "country", "description", "custom_score"]);

    expect(schema.columns.map((column) => column.canonicalName)).toEqual([
      "slug",
      "city",
      "country",
      "description",
      "custom_score",
    ]);
    expect(schema.columns.find((column) => column.rawName === "custom_score")?.canonicalName).toBe("custom_score");
  });

  it("supports create-only mode for existing destinations", () => {
    const schema = buildWorkbookSchema("Master Destinations", ["slug", "city", "country", "description"]);
    const plan = buildWorkbookImportPlan(
      [{ slug: "devon", city: "Devon", country: "United Kingdom", description: "A coastal county" }],
      [{ id: "existing-1", slug: "devon", city: "Devon", country: "United Kingdom" }],
      schema,
      normalizeWorkbookImportMode("CREATE_ONLY"),
    );

    expect(plan[0]?.action).toBe("reject");
    expect(plan[0]?.reason).toContain("already exists");
  });

  it("fills only blank fields for existing destinations and honors delete markers", () => {
    const schema = buildWorkbookSchema("Master Destinations", ["slug", "city", "country", "description"]);
    const plan = buildWorkbookImportPlan(
      [{ slug: "devon", city: "Devon", country: "United Kingdom", description: "[delete]" }],
      [{ id: "existing-1", slug: "devon", city: "Devon", country: "United Kingdom", description: "Existing copy" }],
      schema,
      normalizeWorkbookImportMode("FILL_BLANKS_ONLY"),
    );

    const descriptionUpdate = plan[0]?.fieldUpdates?.find((fieldUpdate) => fieldUpdate.field === "description");

    expect(plan[0]?.action).toBe("update");
    expect(descriptionUpdate?.changeType).toBe("clear");
    expect(descriptionUpdate?.newValue).toBe("");
  });

  it("matches existing destinations by name plus state and country when slug is missing", () => {
    const schema = buildWorkbookSchema("Master Destinations", ["name", "state", "country", "description"]);
    const plan = buildWorkbookImportPlan(
      [{ name: "Devon", state: "Devon", country: "United Kingdom", description: "Updated copy" }],
      [{ id: "existing-2", slug: "devon-united-kingdom", name: "Devon", state: "Devon", country: "United Kingdom", description: "Original copy" }],
      schema,
      normalizeWorkbookImportMode("UPDATE_SUPPLIED_FIELDS"),
    );

    expect(plan[0]?.action).toBe("update");
    expect(plan[0]?.fieldUpdates?.find((fieldUpdate) => fieldUpdate.field === "description")?.changeType).toBe("set");
  });

  it("builds a Premium V2 workbook plan with verified neighborhood facts and blocks synthetic place names", () => {
    const plan = buildPremiumV2WorkbookImportPlan({
      destinationRows: [{ destination_name: "Cavtat", country: "Croatia", slug: "cavtat-croatia" }],
      neighborhoodRows: [{ destination_name: "Cavtat", neighborhood_name: "Old Town", neighborhood_slug: "old-town" }],
      neighborhoodPlaceRows: [
        { destination_name: "Cavtat", neighborhood_name: "Old Town", category: "Restaurants", real_place_name: "Tanjga Restaurant", address: "Obala 11", google_maps_url: "https://maps.google.com/?q=Tanjga%20Restaurant" },
        { destination_name: "Cavtat", neighborhood_name: "Old Town", category: "Restaurants", real_place_name: "Coffee District", address: "" },
      ],
      resourceRows: [{ destination: "Cavtat", resource_category: "Official Tourism", resource_name: "Cavtat Tourism", url: "https://www.cavtat-tourism.com" }],
      mediaRows: [{ destination: "Cavtat", media_type: "image", image_url: "https://example.com/cavtat.jpg", verified: true }],
      existingDestinations: [{ id: "dest-1", slug: "cavtat-croatia", city: "Cavtat", country: "Croatia" }],
      mode: normalizeWorkbookImportMode("UPDATE_SUPPLIED_FIELDS"),
    });

    expect(plan.previewSummary.destinationCount).toBe(1);
    expect(plan.destinations[0]?.action).toBe("update");
    expect(plan.neighborhoods[0]?.action).toBe("create");
    expect(plan.neighborhoodPlaces[0]?.action).toBe("create");
    expect(plan.neighborhoodPlaces[1]?.action).toBe("reject");
    expect(plan.neighborhoodPlaces[1]?.reason).toContain("real identifiable place");
    expect(plan.previewSummary.placeCount).toBe(1);
    expect(plan.previewSummary.resourceCount).toBe(1);
    expect(plan.previewSummary.mediaCount).toBe(1);
  });

  it("rejects ambiguous destination matches instead of silently choosing the first result", () => {
    const plan = buildWorkbookImportPlan(
      [{ destination_name: "Cavtat", country: "Croatia" }],
      [
        { id: "dest-1", slug: "cavtat-croatia", city: "Cavtat", country: "Croatia" },
        { id: "dest-2", slug: "cavtat-hr", city: "Cavtat", country: "Croatia" },
      ],
      buildWorkbookSchema("Destinations", ["destination_name", "country"]),
      normalizeWorkbookImportMode("UPDATE_SUPPLIED_FIELDS"),
    );

    expect(plan[0]?.action).toBe("reject");
    expect(plan[0]?.reason).toContain("ambiguous");
  });

  it("normalizes a single Master Destinations sheet into the premium V2 workbook import shape", () => {
    const normalized = normalizeWorkbookPayloadToPremiumV2ImportInput({
      workbookSheets: ["Master Destinations"],
      workbookRowsBySheet: {
        "Master Destinations": [{
          slug: "new-braunfels-texas",
          city: "New Braunfels",
          country: "United States",
          description: "A lively Hill Country town.",
          overview: "Known for rivers and breweries.",
          climate: "Warm humid subtropical",
          lifestyle: "Outdoor focused",
          best_for_relocation: "Retirees",
          relocation_watchouts: "Summer heat",
        }],
      },
      workbookHeadersBySheet: {
        "Master Destinations": ["slug", "city", "country", "description", "overview", "climate", "lifestyle", "best_for_relocation", "relocation_watchouts"],
      },
    });

    expect(normalized.destinationRows).toHaveLength(1);
    expect(normalized.destinationRows[0]?.slug).toBe("new-braunfels-texas");
    expect(normalized.compatibilityNotes?.[0]?.unsupportedColumns).toEqual(expect.arrayContaining(["best_for_relocation", "relocation_watchouts"]));
  });

  it("recognizes the Premium v2 workbook contract and classifies runtime versus structural sheets", () => {
    const preview = buildPremiumV2WorkbookContractPreview({
      workbookSheets: [
        "README",
        "DESTINATIONS",
        "NEIGHBORHOODS",
        "PLACES",
        "RESOURCES",
        "MEDIA",
        "COST_OF_LIVING",
        "CLIMATE_MONTHLY",
        "SOURCES",
        "SCHEMA_INDEX",
      ],
      workbookRowsBySheet: {
        DESTINATIONS: [{ destination_name: "New Braunfels", country: "United States", slug: "new-braunfels" }],
        NEIGHBORHOODS: [{ destination_name: "New Braunfels", neighborhood_name: "Downtown" }],
        PLACES: [{ destination_name: "New Braunfels", neighborhood_name: "Downtown", real_place_name: "The Riverhouse", category: "Restaurant" }],
        RESOURCES: [{ destination_name: "New Braunfels", resource_name: "City Tourism", url: "https://example.com" }],
        MEDIA: [{ destination_name: "New Braunfels", media_type: "image", image_url: "https://example.com/image.jpg" }],
        COST_OF_LIVING: [{ destination_key: "new-braunfels", category: "housing", monthly_low: 1400, monthly_high: 2200 }],
        CLIMATE_MONTHLY: [{ destination_key: "new-braunfels", month: "January" }],
        SOURCES: [{ destination_key: "new-braunfels", source_name: "City Data" }],
      },
      workbookHeadersBySheet: {
        DESTINATIONS: ["destination_name", "country", "slug"],
        NEIGHBORHOODS: ["destination_name", "neighborhood_name"],
        PLACES: ["destination_name", "neighborhood_name", "real_place_name", "category"],
        RESOURCES: ["destination_name", "resource_name", "url"],
        MEDIA: ["destination_name", "media_type", "image_url"],
        COST_OF_LIVING: ["destination_key", "category", "monthly_low", "monthly_high"],
        CLIMATE_MONTHLY: ["destination_key", "month"],
        SOURCES: ["destination_key", "source_name"],
      },
    });

    expect(preview.recognized).toBe(true);
    expect(preview.runtimeModules).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "destinations", detected: true }),
      expect.objectContaining({ key: "neighborhoods", detected: true }),
      expect.objectContaining({ key: "places", detected: true }),
      expect.objectContaining({ key: "resources", detected: true }),
      expect.objectContaining({ key: "media", detected: true }),
      expect.objectContaining({ key: "cost_of_living", detected: true }),
    ]));
    expect(preview.structuralSheets).toEqual(expect.arrayContaining([expect.objectContaining({ sheetName: "README" }), expect.objectContaining({ sheetName: "SCHEMA_INDEX" })]));
    expect(preview.errors).toEqual([]);
  });

  it("resolves pilot destinations generically and rejects orphaned module rows without destructive behavior", () => {
    const preview = buildPremiumV2WorkbookContractPreview({
      workbookSheets: ["DESTINATIONS", "PLACES", "RESOURCES"],
      workbookRowsBySheet: {
        DESTINATIONS: [
          { destination_name: "New Braunfels", country: "United States", slug: "new-braunfels" },
          { destination_name: "Lisbon", country: "Portugal", slug: "lisbon" },
          { destination_name: "Summerlin", country: "United States", slug: "summerlin" },
        ],
        PLACES: [{ destination_name: "New Braunfels", neighborhood_name: "Downtown", real_place_name: "The Riverhouse", category: "Restaurant" }],
        RESOURCES: [{ destination_name: "Unknown Place", resource_name: "Missing Destination", url: "https://example.com" }],
      },
      workbookHeadersBySheet: {
        DESTINATIONS: ["destination_name", "country", "slug"],
        PLACES: ["destination_name", "neighborhood_name", "real_place_name", "category"],
        RESOURCES: ["destination_name", "resource_name", "url"],
      },
      existingDestinations: [{ id: "existing-1", slug: "new-braunfels", city: "New Braunfels", country: "United States" }],
    });

    const placeModule = preview.runtimeModules.find((module) => module.key === "places");
    const resourceModule = preview.runtimeModules.find((module) => module.key === "resources");

    expect(preview.destinationResolution?.resolvedDestinations).toEqual(expect.arrayContaining([
      expect.objectContaining({ slug: "new-braunfels" }),
      expect.objectContaining({ slug: "lisbon" }),
      expect.objectContaining({ slug: "summerlin" }),
    ]));
    expect(placeModule?.rowCount).toBe(1);
    expect(resourceModule?.validationErrors).toEqual(expect.arrayContaining([expect.stringContaining("destination")]))
  });

  it("resolves module rows using workbook destination_key values", () => {
    const preview = buildPremiumV2WorkbookContractPreview({
      workbookSheets: ["DESTINATIONS", "PLACES"],
      workbookRowsBySheet: {
        DESTINATIONS: [{ destination_key: "new-braunfels-tx-us", destination_name: "New Braunfels", country: "United States", slug: "new-braunfels-texas" }],
        PLACES: [{ destination_key: "new-braunfels-tx-us", neighborhood_name: "Downtown", real_place_name: "The Riverhouse", category: "Restaurant" }],
      },
      workbookHeadersBySheet: {
        DESTINATIONS: ["destination_key", "destination_name", "country", "slug"],
        PLACES: ["destination_key", "neighborhood_name", "real_place_name", "category"],
      },
      existingDestinations: [],
    });

    expect(preview.destinationResolution?.resolvedDestinations).toEqual(expect.arrayContaining([
      expect.objectContaining({ slug: "new-braunfels-texas", name: "New Braunfels" }),
    ]));
    expect(preview.destinationResolution?.unresolvedRows).toEqual([]);
  });

  it("processes multiple destinations through the same Premium V2 pipeline without cross-destination contamination", () => {
    const plan = buildPremiumV2WorkbookImportPlan({
      destinationRows: [
        { destination_key: "new-braunfels-tx-us", destination_name: "New Braunfels", country: "United States", slug: "new-braunfels-texas" },
        { destination_key: "lisbon-pt", destination_name: "Lisbon", country: "Portugal", slug: "lisbon-portugal" },
        { destination_key: "summerlin-nv-us", destination_name: "Summerlin", country: "United States", slug: "summerlin-las-vegas-nevada" },
      ],
      neighborhoodRows: [
        { destination_key: "new-braunfels-tx-us", neighborhood_name: "Downtown" },
        { destination_key: "lisbon-pt", neighborhood_name: "Alfama" },
        { destination_key: "summerlin-nv-us", neighborhood_name: "The Gardens" },
      ],
      neighborhoodPlaceRows: [
        { destination_key: "new-braunfels-tx-us", neighborhood_name: "Downtown", real_place_name: "The Riverhouse", category: "Restaurant", address: "123 Main St" },
        { destination_key: "lisbon-pt", neighborhood_name: "Alfama", real_place_name: "Time Out Market", category: "Restaurant", address: "Rua de Santa Maria 1" },
        { destination_key: "summerlin-nv-us", neighborhood_name: "The Gardens", real_place_name: "The Gardens Park", category: "Park", address: "100 Garden Rd" },
      ],
      resourceRows: [
        { destination_key: "new-braunfels-tx-us", resource_name: "City of New Braunfels", url: "https://www.newbraunfels.gov" },
        { destination_key: "lisbon-pt", resource_name: "Visit Lisboa", url: "https://www.visitlisboa.com" },
        { destination_key: "summerlin-nv-us", resource_name: "Summerlin.com", url: "https://www.summerlin.com" },
      ],
      mediaRows: [
        { destination_key: "new-braunfels-tx-us", image_url: "https://example.com/new-braunfels.jpg" },
        { destination_key: "lisbon-pt", image_url: "https://example.com/lisbon.jpg" },
        { destination_key: "summerlin-nv-us", image_url: "https://example.com/summerlin.jpg" },
      ],
      existingDestinations: [{ id: "existing-new-braunfels", slug: "new-braunfels-texas", destination_key: "new-braunfels-tx-us", city: "New Braunfels", country: "United States" }],
      mode: normalizeWorkbookImportMode("UPDATE_SUPPLIED_FIELDS"),
    });

    expect(plan.destinations.filter((entry) => entry.action === "create")).toHaveLength(2);
    expect(plan.destinations.find((entry) => entry.slug === "new-braunfels-texas")?.action).toBe("update");
    expect(plan.neighborhoods.every((entry) => entry.destinationSlug === entry.destinationSlug)).toBe(true);
    expect(plan.neighborhoods.filter((entry) => entry.destinationSlug === "new-braunfels-texas")).toHaveLength(1);
    expect(plan.neighborhoods.filter((entry) => entry.destinationSlug === "lisbon-portugal")).toHaveLength(1);
    expect(plan.neighborhoods.filter((entry) => entry.destinationSlug === "summerlin-las-vegas-nevada")).toHaveLength(1);
    expect(plan.resources.every((entry) => entry.destinationSlug && entry.destinationSlug.length > 0)).toBe(true);
    expect(plan.previewSummary.destinationCount).toBe(3);
    expect(plan.previewSummary.rejectedCount).toBe(0);
  });

  it("prevents duplicate rows and safely handles missing or partial Premium V2 data", () => {
    const plan = buildPremiumV2WorkbookImportPlan({
      destinationRows: [{ destination_key: "alpha", destination_name: "Alpha", country: "Country", slug: "alpha" }],
      neighborhoodRows: [
        { destination_key: "alpha", neighborhood_name: "Downtown" },
        { destination_key: "alpha", neighborhood_name: "Downtown" },
      ],
      neighborhoodPlaceRows: [
        { destination_key: "alpha", neighborhood_name: "Downtown", real_place_name: "Real Place", category: "Restaurant", address: "123 Main St" },
        { destination_key: "alpha", neighborhood_name: "Downtown", real_place_name: "Real Place", category: "Restaurant", address: "123 Main St" },
        { destination_key: "alpha", neighborhood_name: "Downtown", real_place_name: "", category: "Restaurant", address: "123 Main St" },
      ],
      resourceRows: [
        { destination_key: "alpha", resource_name: "Official Resource", url: "https://example.com/resource" },
        { destination_key: "alpha", resource_name: "", url: "https://example.com/missing" },
      ],
      mediaRows: [
        { destination_key: "alpha", image_url: "https://example.com/one.jpg" },
        { destination_key: "alpha", image_url: "" },
      ],
      existingDestinations: [],
      mode: normalizeWorkbookImportMode("UPDATE_SUPPLIED_FIELDS"),
    });

    expect(plan.neighborhoods.filter((entry) => entry.action === "reject")).toHaveLength(1);
    expect(plan.neighborhoodPlaces.filter((entry) => entry.action === "reject")).toHaveLength(2);
    expect(plan.resources.filter((entry) => entry.action === "reject")).toHaveLength(1);
    expect(plan.media.filter((entry) => entry.action === "reject")).toHaveLength(1);
    expect(plan.previewSummary.rejectedCount).toBe(5);
    expect(plan.previewSummary.destinationCount).toBe(1);
    expect(plan.previewSummary.placeCount).toBe(1);
    expect(plan.previewSummary.resourceCount).toBe(1);
    expect(plan.previewSummary.mediaCount).toBe(1);
  });
});
