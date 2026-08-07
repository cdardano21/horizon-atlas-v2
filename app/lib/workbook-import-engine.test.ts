import { describe, expect, it } from "vitest";
import {
  buildPremiumV2WorkbookImportPlan,
  buildWorkbookImportPlan,
  buildWorkbookSchema,
  normalizeWorkbookImportMode,
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
});
