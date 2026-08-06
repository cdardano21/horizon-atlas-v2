import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockSupabaseFetch } = vi.hoisted(() => ({
  mockSupabaseFetch: vi.fn(),
}));

vi.mock("./supabase", () => ({
  isSupabaseConfigured: () => true,
  supabaseFetch: mockSupabaseFetch,
}));

import { getDestinationContent } from "./destination-content";

describe("destination content slug aliases", () => {
  beforeEach(() => {
    mockSupabaseFetch.mockReset();
  });

  it("loads imported editorial content when the route slug differs from the catalog slug", async () => {
    mockSupabaseFetch.mockImplementation(async (path: string) => {
      if (path.includes("/rest/v1/destinations_catalog")) {
        return {
          ok: true,
          json: async () => [{
            id: "catalog-row-id",
            slug: "spearfish-sd-usa",
            city: "Spearfish",
            country: "United States",
            tier: null,
            status: "published",
            hero_image_url: null,
            description: "Imported catalog description.",
            overview: "Imported catalog overview.",
            climate_summary: "Imported climate summary.",
            lifestyle_summary: "Imported lifestyle summary.",
            transportation_summary: "Imported transportation summary.",
            metadata: {
              editorialContent: {
                introduction: "Imported intro narrative.",
                heroNarrative: "Imported hero narrative.",
                lifestyleNarrative: "Imported lifestyle narrative.",
                climateNarrative: "Imported climate narrative.",
                transportationNarrative: "Imported transportation narrative.",
                verdict: "Imported verdict.",
              },
              researchProfile: {
                overview: "Imported research overview.",
              },
            },
          }],
        } as Response;
      }

      if (path.includes("/rest/v1/destination_media_assets")) {
        return { ok: true, json: async () => [] } as Response;
      }

      if (path.includes("/rest/v1/destination_resource_links")) {
        return { ok: true, json: async () => [] } as Response;
      }

      if (path.includes("/rest/v1/destination_video_links")) {
        return { ok: true, json: async () => [] } as Response;
      }

      return { ok: false, json: async () => [] } as Response;
    });

    const content = await getDestinationContent("spearfish-south-dakota-united-states");

    expect(content?.source).toBe("supabase");
    expect(content?.destination.description).toContain("Imported intro narrative");
    expect(content?.destination.heroNarrative).toContain("Imported hero narrative");
    expect(content?.destination.transportation).toContain("Imported transportation narrative");
  });
});
