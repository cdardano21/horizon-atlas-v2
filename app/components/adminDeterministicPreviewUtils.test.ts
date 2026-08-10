import { describe, expect, it } from "vitest";
import { buildDeterministicPreviewRenderModel } from "./adminDeterministicPreviewUtils";

describe("admin deterministic preview utilities", () => {
  it("extracts canonical workbook content for the admin preview card", () => {
    const renderModel = buildDeterministicPreviewRenderModel({
      workbook: { schemaVersion: "3.1" },
      destinations: [
        {
          identity: {
            destinationKey: "new-braunfels-tx-us",
            slug: "new-braunfels-texas",
            name: "New Braunfels",
            city: "New Braunfels",
            country: "United States",
          },
          moduleCounts: { facts: 2, neighborhoods: 1, media: 1 },
          canonicalDestination: {
            editorial: {
              shortDescription: "A fast-growing Hill Country city.",
              longDescription: "A family-friendly destination with a strong quality-of-life profile.",
              currency: "USD",
              primaryLanguage: "English",
              timeZone: "CDT",
            },
            facts: [
              { display_label: "Climate", value_text: "Warm and humid" },
              { display_label: "Cost of living", value_text: "Moderate" },
            ],
            scores: [{ score_label: "Retirement", score_value: "82" }],
            neighborhoods: [{ neighborhood_name: "Historic District" }],
            places: [{ place_name: "Comal River" }],
            resources: [{ label: "Local guide", provider: "City", url: "https://example.com" }],
            media: [{ label: "Riverfront view", provider: "Local", url: "https://example.com/media" }],
          },
        },
      ],
    });

    expect(renderModel).toHaveLength(1);
    expect(renderModel[0]?.shortDescription).toBe("A fast-growing Hill Country city.");
    expect(renderModel[0]?.factSummaries).toEqual([
      { label: "Climate", value: "Warm and humid" },
      { label: "Cost of living", value: "Moderate" },
    ]);
    expect(renderModel[0]?.neighborhoodSummaries).toEqual([{ name: "Historic District", description: null }]);
    expect(renderModel[0]?.placeSummaries).toEqual([{ name: "Comal River", category: null }]);
    expect(renderModel[0]?.resourceSummaries).toEqual([{ label: "Local guide", provider: "City", url: "https://example.com" }]);
    expect(renderModel[0]?.mediaSummaries).toEqual([{ label: "Riverfront view", provider: "Local", url: "https://example.com/media" }]);
  });
});
