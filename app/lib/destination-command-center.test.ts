import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getDestinationContentMock,
  getDestinationIntelligenceMock,
  isSupabaseConfiguredMock,
  supabaseFetchMock,
} = vi.hoisted(() => ({
  getDestinationContentMock: vi.fn(),
  getDestinationIntelligenceMock: vi.fn(),
  isSupabaseConfiguredMock: vi.fn(),
  supabaseFetchMock: vi.fn(),
}));

vi.mock("./destination-content", () => ({
  getDestinationContent: getDestinationContentMock,
}));

vi.mock("./destination-intelligence", () => ({
  getDestinationIntelligence: getDestinationIntelligenceMock,
}));

vi.mock("./supabase", () => ({
  isSupabaseConfigured: isSupabaseConfiguredMock,
  supabaseFetch: supabaseFetchMock,
}));

vi.mock("./generated-command-center-seeds", () => ({
  generatedCommandCenterSeeds: {},
}));

vi.mock("./regional-command-center-seeds", () => ({
  REGIONAL_COMMAND_CENTER_SEEDS: {},
}));

vi.mock("./local-command-center-seeds", () => ({
  LOCAL_COMMAND_CENTER_SEEDS: {},
}));

vi.mock("./flagship-destinations", () => ({
  isFlagshipDestination: () => false,
}));

import { getDestinationCommandCenter } from "./destination-command-center";

const baseDestination = {
  slug: "valencia-spain",
  city: "Valencia",
  country: "Spain",
  tags: [],
  transportation: "",
  overview: "",
  memberDetails: {},
};

const baseIntelligence = {
  aiSummary: "",
  climateHeadline: "",
  lifestyleHeadline: "",
  healthcareHeadline: "",
  housingHeadline: "",
  costHeadline: "",
  taxHeadline: "",
  visaHeadline: "",
  restaurantHeadline: "",
  internetHeadline: "",
  golfHeadline: "",
  airportHeadline: "",
  beachHeadline: "",
  thingsToDoHeadline: "",
  cultureHeadline: "",
  retirementAdvantages: [],
  retirementTradeoffs: [],
  quickFacts: [],
  livingHereScorecard: [],
  planningSignals: [],
  briefingSections: [],
  comprehensiveSections: [],
  resources: {
    rentals: [],
    healthcare: [],
    restaurants: [],
    taxes: [],
    visas: [],
    relocation: [],
  },
  mapSearchUrl: "",
  mapEmbedUrl: "",
  youtubeUrl: "",
  youtubeEmbedUrl: "",
};

describe("destination command center resource hydration", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    getDestinationContentMock.mockReset();
    getDestinationIntelligenceMock.mockReset();
    isSupabaseConfiguredMock.mockReset();
    supabaseFetchMock.mockReset();

    getDestinationContentMock.mockResolvedValue({
      destination: baseDestination,
      source: "supabase",
    });

    getDestinationIntelligenceMock.mockReturnValue(baseIntelligence);
    isSupabaseConfiguredMock.mockReturnValue(true);

    supabaseFetchMock.mockImplementation(async (path: string) => {
      if (path.includes("/destinations_catalog?")) {
        return new Response(
          JSON.stringify([
            {
              id: "dest_1",
              region: "Spain",
              updated_at: "2026-07-25T00:00:00.000Z",
              metadata: { dataConfidence: "high" },
            },
          ]),
          { status: 200 },
        );
      }

      if (path.includes("/destination_resources?")) {
        return new Response(
          JSON.stringify([
            {
              id: "resource_food_1",
              category: "restaurants",
              title: "Ruzafa Dining Guide",
              description: "Top dinner spots in Ruzafa",
              url: "https://example.com/ruzafa-food",
              source_type: "editorial",
              source_url: "https://example.com/ruzafa-food",
              source_organization: "Guide Org",
              verification_status: "verified",
              confidence_level: "high",
              last_verified_at: "2026-07-24T00:00:00.000Z",
            },
            {
              id: "resource_practical_1",
              category: "youtube",
              title: "Valencia Neighborhood Walkthrough",
              description: "District-by-district orientation",
              url: "https://youtube.com/watch?v=xyz",
              source_type: "video",
              source_url: "https://youtube.com/watch?v=xyz",
              source_organization: "YouTube",
              verification_status: "verified",
              confidence_level: "high",
              last_verified_at: "2026-07-24T00:00:00.000Z",
            },
            {
              id: "resource_practical_2",
              category: "visa",
              title: "Spain Consular Process",
              description: "Official visa process starting point",
              url: "https://example.com/visa",
              source_type: "government",
              source_url: "https://example.com/visa",
              source_organization: "Foreign Affairs",
              verification_status: "verified",
              confidence_level: "high",
              last_verified_at: "2026-07-24T00:00:00.000Z",
            },
            {
              id: "resource_practical_3",
              category: "residency",
              title: "Residency Permit Workflow",
              description: "Long-stay residency process",
              url: "https://example.com/residency",
              source_type: "government",
              source_url: "https://example.com/residency",
              source_organization: "Immigration Office",
              verification_status: "verified",
              confidence_level: "high",
              last_verified_at: "2026-07-24T00:00:00.000Z",
            },
            {
              id: "resource_other_1",
              category: "culture",
              title: "Museums List",
              description: "General city culture",
              url: "https://example.com/culture",
              source_type: "editorial",
              source_url: "https://example.com/culture",
              source_organization: "City Guide",
              verification_status: "verified",
              confidence_level: "high",
              last_verified_at: "2026-07-24T00:00:00.000Z",
            },
          ]),
          { status: 200 },
        );
      }

      return new Response(JSON.stringify([]), { status: 200 });
    });
  });

  it("maps destination_resources into foodSpots and practicalInfo", async () => {
    const result = await getDestinationCommandCenter("valencia-spain");

    expect(result).not.toBeNull();
    expect(result?.source).toBe("supabase");

    expect(result?.foodSpots.length).toBe(1);
    expect(result?.foodSpots[0]?.name).toBe("Ruzafa Dining Guide");
    expect(result?.foodSpots[0]?.url).toBe("https://example.com/ruzafa-food");

    expect(result?.practicalInfo.length).toBe(3);
    expect(result?.practicalInfo.map((item) => item.name)).toEqual([
      "Valencia Neighborhood Walkthrough",
      "Spain Consular Process",
      "Residency Permit Workflow",
    ]);

    expect(result?.resources.length).toBe(5);
  });

  it("avoids fabricated fallback budgets when a destination has no bespoke relocation record", async () => {
    const result = await getDestinationCommandCenter("valencia-spain");
    const labels = result?.quickMetrics.map((metric) => metric.label) ?? [];

    expect(labels).not.toContain("Single monthly budget");
    expect(labels).not.toContain("Couple monthly budget");
    expect(labels).not.toContain("Family monthly budget");
    expect(labels).not.toContain("1BR rent, centre");
    expect(labels).not.toContain("Groceries");
  });

  it("sanitizes legacy tax and residency phrasing from command-center resources", async () => {
    const result = await getDestinationCommandCenter("valencia-spain");
    const combined = (result?.resources ?? []).map((resource) => `${resource.title} ${resource.description ?? ""}`).join(" ");

    expect(combined).not.toMatch(/tax context|residency context|dri signal|ordinary weekday|week after week/i);
  });
});
