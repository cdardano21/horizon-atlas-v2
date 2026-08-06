import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./supabase", () => ({
  isSupabaseConfigured: () => true,
  supabaseFetch: vi.fn(),
}));

vi.mock("./destinations", () => ({
  destinations: [
    {
      slug: "demo-town",
      city: "Demo Town",
      country: "Example",
      title: "Demo Town",
      subtitle: "Demo Town, Example",
      description: "Generic destination copy that should not be used for healthcare sections.",
      overview: "Generic overview copy.",
      heroNarrative: "Generic hero copy.",
      climate: "Generic climate copy.",
      lifestyle: "Generic lifestyle copy.",
      transportation: "Generic transportation copy.",
      researchProfile: {},
    },
    {
      slug: "chicago-illinois-united-states",
      city: "Chicago",
      country: "United States",
      title: "Chicago, Illinois",
      subtitle: "A premium big-city base for culture, healthcare, sports, and daily life that still feels grounded in neighborhood character.",
      description: "Chicago is the rare American metropolis that feels both grand and practical.",
      overview: "Chicago is best understood as a city of distinct districts rather than a single center.",
      heroNarrative: "Chicago is one of the few North American cities where the everyday experience can feel as compelling as the skyline.",
      climate: "Chicago has a classic humid continental climate.",
      lifestyle: "Chicago is a city for people who want culture without surrendering their everyday life to spectacle.",
      transportation: "Chicago’s transportation story is one of its greatest advantages.",
      researchProfile: {
        bestNeighborhoods: ["Lincoln Park", "Lakeview", "West Loop", "Hyde Park"],
        pros: ["Great transit"],
        cons: ["Cold winters"],
      },
      premiumEditorialContent: {
        heroIntroduction: "Chicago is one of the most rewarding cities in North America for people willing to think beyond its reputation.",
      },
    },
  ],
}));

import { getCanonicalDestination } from "./canonical-destination-loader";
import { supabaseFetch } from "./supabase";

const mockedSupabaseFetch = vi.mocked(supabaseFetch);

describe("canonical destination loader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps section payloads from Supabase rows into the canonical destination model", async () => {
    mockedSupabaseFetch.mockResolvedValue({
      ok: true,
      json: async () => [{
        slug: "barcelona-spain",
        city: "Barcelona",
        country: "Spain",
        title: "Barcelona",
        subtitle: "Barcelona, Spain",
        hero_narrative: "A city of neighborhoods and long pedestrian days.",
        overview: "Barcelona works best when neighborhood rhythm is chosen carefully.",
        editorial: "Barcelona’s texture comes from its districts and daily habits.",
        why_this_place_feels_distinct: "The city feels distinct because every district has its own rhythm.",
        daily_life: "Days often mix markets, walks, and late dinners.",
        climate: "Mediterranean climate with mild winters and warm summers.",
        transportation: "Strong transit supports a car-light life.",
        healthcare: "Good healthcare access across major districts.",
        cost_of_living: "Cost of living is high in the best-connected districts.",
        walkability: "Walkability is strong in the central neighborhoods.",
        internet: "Reliable internet is common in most neighborhoods.",
        neighborhoods: ["Eixample", "Gràcia"],
        restaurants: ["Can Culleretes"],
        museums: ["Museu Picasso"],
        golf: [],
        beaches: ["Barceloneta"],
        outdoor_recreation: ["Park Güell"],
        pros: ["Transit"],
        cons: ["Housing costs"],
        retirement: "Strong for residents who value culture and daily ease.",
        digital_nomad: "Great for remote work with a strong café network.",
        family: "Good with schools and neighborhood infrastructure.",
        weather: "Mild winters and warm summers.",
        resources: [],
        videos: [],
        media: [],
        sections: {
          overview: {
            id: "overview",
            title: "Overview",
            content: "Barcelona is a city that rewards district choice.",
            version: 1,
            updated_at: "2024-01-01T00:00:00.000Z",
          },
        },
        ai_status: "completed",
        ai_version: "v1",
        ai_last_updated: "2024-01-01T00:00:00.000Z",
        ai_confidence_score: 0.92,
        ai_sources_used: ["source-a"],
        ai_missing_sections: [],
        ai_prompt_version: "p1",
        research_timestamp: "2024-01-01T00:00:00.000Z",
        scoring: [{ name: "Lifestyle", weight: 0.5, score: 82 }],
      }],
    } as Response);

    const destination = await getCanonicalDestination("barcelona-spain");

    expect(destination).not.toBeNull();
    expect(destination?.sections.overview).toMatchObject({
      title: "Overview",
      content: "Barcelona is a city that rewards district choice.",
    });
  });

  it("builds premium enrichment fields and resources for local fallback destinations", async () => {
    mockedSupabaseFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => [],
    } as Response);

    const destination = await getCanonicalDestination("demo-town");

    expect(destination).not.toBeNull();
    expect(destination?.safety).toBe("");
    expect(destination?.airportInfo).toBe("");
    expect(destination?.googleMapsUrl).toContain("google.com/maps");
    expect(destination?.monthlyBudgets.length).toBeGreaterThan(0);
    expect(destination?.realEstateResources.length).toBeGreaterThan(0);
    expect(destination?.healthcareResources.length).toBeGreaterThan(0);
  });

  it("leaves section-specific canonical fields empty when no destination-specific data exists", async () => {
    mockedSupabaseFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => [],
    } as Response);

    const destination = await getCanonicalDestination("demo-town");

    expect(destination).not.toBeNull();
    expect(destination?.healthcare).toBe("");
    expect(destination?.costOfLiving).toBe("");
    expect(destination?.walkability).toBe("");
  });

  it("uses Chicago-specific fallback media and USD budgets when Supabase is unavailable", async () => {
    mockedSupabaseFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => [],
    } as Response);

    const destination = await getCanonicalDestination("chicago-illinois-united-states");

    expect(destination).not.toBeNull();
    expect(destination?.monthlyBudgets.some((budget) => budget.amount.includes("$"))).toBe(true);
    expect(destination?.monthlyBudgets.some((budget) => budget.amount.includes("€"))).toBe(false);
    expect(destination?.media.some((item) => item.caption.toLowerCase().includes("chicago"))).toBe(true);
    expect(destination?.media.some((item) => /paris|las vegas|nevada|desert highway/i.test(item.caption))).toBe(false);
    expect(destination?.visaResources.length).toBeGreaterThanOrEqual(0);
  });
});
