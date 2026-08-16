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

vi.mock("./runtime/persisted-destination-read-runtime", () => ({
  loadPersistedDestinationFromRuntime: vi.fn(),
}));

import { buildWorkbookDestinationFromData, getCanonicalDestination } from "./canonical-destination-loader";
import { loadPersistedDestinationFromRuntime } from "./runtime/persisted-destination-read-runtime";
import { supabaseFetch } from "./supabase";

const mockedSupabaseFetch = vi.mocked(supabaseFetch);
const mockedLoadPersistedDestinationFromRuntime = vi.mocked(loadPersistedDestinationFromRuntime);

describe("canonical destination loader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedLoadPersistedDestinationFromRuntime.mockResolvedValue({
      outcome: "FAILED",
      failure: {
        reason: "DB_READ_FAILED",
        destinationIdentity: { destinationKey: "", destinationId: "" },
      },
    } as never);
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

  it("hydrates a canonical destination from the persisted runtime bundle for approved pilots", async () => {
    mockedSupabaseFetch.mockResolvedValue({
      ok: true,
      json: async () => [{
        id: "dest-123",
        destination_id: "dest-123",
        destination_key: "lisbon-pt",
        slug: "lisbon-portugal",
        city: "Lisbon",
        country: "Portugal",
        title: "Lisbon",
        subtitle: "Lisbon, Portugal",
        hero_narrative: "Legacy hero copy",
        overview: "Legacy overview copy",
        editorial: "Legacy editorial copy",
        why_this_place_feels_distinct: "Legacy distinct copy",
        daily_life: "Legacy daily life copy",
        climate: "Legacy climate copy",
        transportation: "Legacy transportation copy",
        healthcare: "Legacy healthcare copy",
        cost_of_living: "Legacy cost copy",
        walkability: "Legacy walkability copy",
        internet: "Legacy internet copy",
        safety: "Legacy safety copy",
        neighborhoods: ["Alfama"],
        resources: [],
        videos: [],
        media: [],
        sections: {},
        scoring: [],
      }],
    } as Response);

    mockedLoadPersistedDestinationFromRuntime.mockResolvedValue({
      outcome: "SUCCESS",
      bundle: {
        destinationKey: "lisbon-pt",
        identity: {
          slug: "lisbon-portugal",
          name: "Lisbon",
          city: "Lisbon",
          country: "Portugal",
        },
        editorial: {
          shortDescription: "Persisted short description",
          longDescription: "Persisted long description",
          currency: "EUR",
          primaryLanguage: "Portuguese",
          timeZone: "WET",
        },
        facts: [{ factKey: "fact-1", factGroup: "overview", valueText: "Persisted fact", displayLabel: "Fact", sourceName: "Workbook" }],
        scores: [{ scoreKey: "score-1", scoreValue: "82", scoreLabel: "Retirement", methodologyVersion: "v1" }],
        neighborhoods: [{ neighborhoodKey: "nb-1", name: "Alfama", summary: "Historic district", areaType: "historic" }],
        places: [],
        resources: [{ resourceKey: "resource-1", category: "tourism", name: "Visit Lisboa", url: "https://www.visitlisboa.com" }],
        media: [{ mediaKey: "media-1", kind: "image", url: "https://example.com/lisbon.jpg", caption: "Lisbon", altText: "Lisbon" }],
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
        environmentQuality: null,
        dailyLifePracticality: null,
        eventsSeasonality: [],
        sources: [],
      },
    } as never);

    const destination = await getCanonicalDestination("lisbon-portugal");

    expect(destination).not.toBeNull();
    expect(destination?.title).toBe("Lisbon");
    expect(destination?.heroNarrative).toBe("Persisted short description");
    expect(destination?.overview).toBe("Persisted long description");
    expect(destination?.media[0]?.url).toBe("https://example.com/lisbon.jpg");
    expect(destination?.resources[0]?.label).toBe("Visit Lisboa");
    expect(mockedLoadPersistedDestinationFromRuntime).toHaveBeenCalled();
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

  it("prefers workbook copy over fallback copy for core narrative fields and premium editorial content", () => {
    const destination = buildWorkbookDestinationFromData("demo-town", {
      destinationKey: "demo-town",
      slug: "demo-town",
      city: "Demo Town",
      country: "Example",
      title: "Demo Town",
      subtitle: "Demo Town, Example",
      heroNarrative: "Workbook hero narrative",
      overview: "Workbook overview narrative",
      editorial: "Workbook editorial narrative",
      whyThisPlaceFeelsDistinct: "Workbook distinct narrative",
      dailyLife: "Workbook daily life narrative",
      climate: "Workbook climate narrative",
      transportation: "Workbook transportation narrative",
      healthcare: "Workbook healthcare narrative",
      costOfLiving: "Workbook cost-of-living narrative",
      walkability: "Workbook walkability narrative",
      internet: "Workbook internet narrative",
      safety: "Workbook safety narrative",
      officialTourismUrl: "https://example.com/tourism",
      googleMapsUrl: "https://example.com/maps",
      googleEarthUrl: "https://example.com/earth",
      wikipediaUrl: "https://example.com/wiki",
      neighborhoods: [],
      places: [],
      resources: [],
      media: [],
      costRecords: [],
      healthcareRecords: [],
      transportRecords: [],
      housingRecords: [],
      realityChecks: [],
      sources: [],
      premiumEditorialContent: {
        heroIntroduction: "Workbook hero introduction",
        overviewArticle: "Workbook overview article",
        neighborhoodsArticle: "Workbook neighborhood article",
        dailyLifeArticle: "Workbook daily life article",
      },
      counts: { neighborhoods: 0, places: 0, resources: 0, media: 0, costRecords: 0 },
    });

    expect(destination.heroNarrative).toBe("Workbook hero narrative");
    expect(destination.overview).toBe("Workbook overview narrative");
    expect(destination.healthcare).toBe("Workbook healthcare narrative");
    expect(destination.premiumEditorialContent?.heroIntroduction).toBe("Workbook hero introduction");
    expect(destination.premiumEditorialContent?.overviewArticle).toBe("Workbook overview article");
  });

  it("hydrates structured factual intelligence from workbook data into the canonical knowledge profile", () => {
    const destination = buildWorkbookDestinationFromData("new-braunfels-tx-us", {
      destinationKey: "new-braunfels-tx-us",
      slug: "new-braunfels-tx-us",
      city: "New Braunfels",
      country: "United States",
      title: "New Braunfels",
      subtitle: "New Braunfels, United States",
      heroNarrative: "Workbook hero narrative",
      overview: "Workbook overview narrative",
      editorial: "Workbook editorial narrative",
      whyThisPlaceFeelsDistinct: "Workbook distinct narrative",
      dailyLife: "Workbook daily life narrative",
      climate: "Workbook climate narrative",
      transportation: "Workbook transportation narrative",
      healthcare: "Workbook healthcare narrative",
      costOfLiving: "Workbook cost-of-living narrative",
      walkability: "Workbook walkability narrative",
      internet: "Workbook internet narrative",
      safety: "Workbook safety narrative",
      officialTourismUrl: "https://example.com/tourism",
      googleMapsUrl: "https://example.com/maps",
      googleEarthUrl: "https://example.com/earth",
      wikipediaUrl: "https://example.com/wiki",
      neighborhoods: [],
      places: [],
      resources: [],
      media: [],
      costRecords: [],
      healthcareRecords: [],
      transportRecords: [],
      housingRecords: [],
      realityChecks: [],
      sources: [],
      counts: { neighborhoods: 0, places: 0, resources: 0, media: 0, costRecords: 0 },
      knowledgeProfile: {
        population: "110000",
        metroPopulation: "San Antonio–New Braunfels metro",
        elevation: "192 m",
        timeZone: "America/Chicago",
        rainfall: "884 mm/year",
        sunshineHours: "2,500 hrs/year",
        humidity: "65% avg",
        majorAirports: ["San Antonio International Airport", "Austin-Bergstrom International Airport"],
        majorHospitals: ["Resolute Baptist Hospital"],
      },
    } as any);

    expect(destination.knowledgeProfile?.population).toBe("110000");
    expect(destination.knowledgeProfile?.metroPopulation).toBe("San Antonio–New Braunfels metro");
    expect(destination.knowledgeProfile?.elevation).toBe("192 m");
    expect(destination.knowledgeProfile?.timeZone).toBe("America/Chicago");
    expect(destination.knowledgeProfile?.rainfall).toBe("884 mm/year");
    expect(destination.knowledgeProfile?.sunshineHours).toBe("2,500 hrs/year");
    expect(destination.knowledgeProfile?.humidity).toBe("65% avg");
    expect(destination.knowledgeProfile?.majorAirports).toEqual(["San Antonio International Airport", "Austin-Bergstrom International Airport"]);
    expect(destination.knowledgeProfile?.majorHospitals).toEqual(["Resolute Baptist Hospital"]);
  });

  it("filters workbook media to destination-specific images instead of accepting generic scenic placeholders", () => {
    const destination = buildWorkbookDestinationFromData("new-braunfels-tx-us", {
      destinationKey: "new-braunfels-tx-us",
      slug: "new-braunfels-tx-us",
      city: "New Braunfels",
      country: "United States",
      title: "New Braunfels",
      subtitle: "New Braunfels, United States",
      heroNarrative: "",
      overview: "",
      editorial: "",
      whyThisPlaceFeelsDistinct: "",
      dailyLife: "",
      climate: "",
      transportation: "",
      healthcare: "",
      costOfLiving: "",
      walkability: "",
      internet: "",
      safety: "",
      officialTourismUrl: "",
      googleMapsUrl: "",
      googleEarthUrl: "",
      wikipediaUrl: "",
      neighborhoods: [],
      places: [],
      resources: [],
      media: [
        { kind: "image", url: "https://example.com/scenic-river-view.jpg", altText: "Scenic river view", caption: "Scenic river view", isPrimary: true },
        { kind: "image", url: "https://example.com/new-braunfels-main-plaza.jpg", altText: "New Braunfels Main Plaza", caption: "New Braunfels Main Plaza", isPrimary: false },
        { kind: "image", url: "https://example.com/other-city.jpg", altText: "A different city skyline", caption: "A different city skyline", isPrimary: false },
      ],
      costRecords: [],
      healthcareRecords: [],
      transportRecords: [],
      housingRecords: [],
      realityChecks: [],
      sources: [],
      counts: { neighborhoods: 0, places: 0, resources: 0, media: 3, costRecords: 0 },
    });

    expect(destination.media.map((item) => item.url)).toEqual(["https://example.com/new-braunfels-main-plaza.jpg"]);
  });

  it("keeps primary media when it is clearly relevant even without explicit destination text", () => {
    const destination = buildWorkbookDestinationFromData("new-braunfels-tx-us", {
      destinationKey: "new-braunfels-tx-us",
      slug: "new-braunfels-tx-us",
      city: "New Braunfels",
      country: "United States",
      title: "New Braunfels",
      subtitle: "New Braunfels, United States",
      heroNarrative: "",
      overview: "",
      editorial: "",
      whyThisPlaceFeelsDistinct: "",
      dailyLife: "",
      climate: "",
      transportation: "",
      healthcare: "",
      costOfLiving: "",
      walkability: "",
      internet: "",
      safety: "",
      officialTourismUrl: "",
      googleMapsUrl: "",
      googleEarthUrl: "",
      wikipediaUrl: "",
      neighborhoods: [],
      places: [],
      resources: [],
      media: [
        { kind: "image", url: "https://example.com/hero.jpg", altText: "Historic downtown", caption: "Historic downtown", isPrimary: true },
      ],
      costRecords: [],
      healthcareRecords: [],
      transportRecords: [],
      housingRecords: [],
      realityChecks: [],
      sources: [],
      counts: { neighborhoods: 0, places: 0, resources: 0, media: 1, costRecords: 0 },
    });

    expect(destination.media.map((item) => item.url)).toEqual(["https://example.com/hero.jpg"]);
  });

  it("preserves a direct image asset when it is a plausible destination photo and the other option is clearly generic", () => {
    const destination = buildWorkbookDestinationFromData("new-braunfels-tx-us", {
      destinationKey: "new-braunfels-tx-us",
      slug: "new-braunfels-tx-us",
      city: "New Braunfels",
      country: "United States",
      title: "New Braunfels",
      subtitle: "New Braunfels, United States",
      heroNarrative: "",
      overview: "",
      editorial: "",
      whyThisPlaceFeelsDistinct: "",
      dailyLife: "",
      climate: "",
      transportation: "",
      healthcare: "",
      costOfLiving: "",
      walkability: "",
      internet: "",
      safety: "",
      officialTourismUrl: "",
      googleMapsUrl: "",
      googleEarthUrl: "",
      wikipediaUrl: "",
      neighborhoods: [],
      places: [],
      resources: [],
      media: [
        { kind: "image", url: "https://example.com/scenic-river-view.jpg", altText: "Scenic river view", caption: "Scenic river view", isPrimary: false },
        { kind: "image", url: "https://example.com/main-street.jpg", altText: "Main Street", caption: "Main Street", isPrimary: false },
      ],
      costRecords: [],
      healthcareRecords: [],
      transportRecords: [],
      housingRecords: [],
      realityChecks: [],
      sources: [],
      counts: { neighborhoods: 0, places: 0, resources: 0, media: 2, costRecords: 0 },
    });

    expect(destination.media.map((item) => item.url)).toEqual(["https://example.com/main-street.jpg"]);
  });

  it("retains verified media when the destination evidence lives in source metadata rather than the asset URL", () => {
    const destination = buildWorkbookDestinationFromData("new-braunfels-texas-united-states", {
      destinationKey: "new-braunfels-texas-united-states",
      slug: "new-braunfels-texas-united-states",
      city: "New Braunfels",
      country: "United States",
      title: "New Braunfels",
      subtitle: "New Braunfels, United States",
      heroNarrative: "",
      overview: "",
      editorial: "",
      whyThisPlaceFeelsDistinct: "",
      dailyLife: "",
      climate: "",
      transportation: "",
      healthcare: "",
      costOfLiving: "",
      walkability: "",
      internet: "",
      safety: "",
      officialTourismUrl: "",
      googleMapsUrl: "",
      googleEarthUrl: "",
      wikipediaUrl: "",
      neighborhoods: [],
      places: [],
      resources: [],
      media: [
        {
          kind: "image",
          url: "https://upload.wikimedia.org/wikipedia/commons/4/4a/river-view.jpg",
          altText: "River view",
          caption: "River view",
          isPrimary: false,
          sourceUrl: "https://commons.wikimedia.org/wiki/File:New_Braunfels_Texas_Landa_Park.jpg",
          attribution: "Wikimedia Commons • CC BY-SA 4.0",
          license: "CC BY-SA 4.0",
        },
      ],
      costRecords: [],
      healthcareRecords: [],
      transportRecords: [],
      housingRecords: [],
      realityChecks: [],
      sources: [],
      counts: { neighborhoods: 0, places: 0, resources: 0, media: 1, costRecords: 0 },
    });

    expect(destination.media).toHaveLength(1);
    expect(destination.media[0]?.sourceUrl).toContain("commons.wikimedia.org");
    expect(destination.media[0]?.attribution).toContain("Wikimedia Commons");
  });

  it("hydrates New Braunfels with a verified Wikimedia-backed media set and preserves attribution metadata", async () => {
    mockedSupabaseFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => [],
    } as Response);

    const destination = await getCanonicalDestination("new-braunfels-texas-united-states");

    expect(destination).not.toBeNull();
    expect(destination?.media).toHaveLength(5);
    expect(destination?.media[0]?.url).toContain("upload.wikimedia.org");
    expect(destination?.media[0]?.isPrimary).toBe(true);
    expect(destination?.media.slice(1).every((item) => !item.isPrimary)).toBe(true);
    expect(destination?.media.some((item) => item.url.includes("images.unsplash.com"))).toBe(false);
    expect(destination?.media[0]?.sourceUrl).toContain("commons.wikimedia.org");
    expect(destination?.media[0]?.attribution).toContain("Wikimedia Commons");
  });

  it("hydrates neighborhood intelligence, media, and resources from Premium V2 metadata", async () => {
    mockedSupabaseFetch.mockResolvedValue({
      ok: true,
      json: async () => [{
        slug: "palma-de-mallorca",
        city: "Palma de Mallorca",
        country: "Spain",
        title: "Palma de Mallorca",
        subtitle: "Palma de Mallorca, Spain",
        hero_narrative: "A Mediterranean capital with grounded neighborhood life.",
        overview: "A city whose local texture matters as much as the waterfront.",
        editorial: "The city feels most compelling through its neighborhoods and everyday routines.",
        why_this_place_feels_distinct: "The city balances sea, old town, and modern life.",
        daily_life: "Daily life is shaped by waterfront walks, markets, and local cafés.",
        climate: "Mediterranean climate with warm summers and mild winters.",
        transportation: "Transit and walkability make the city feel practical.",
        healthcare: "The city offers solid healthcare access for long stays.",
        cost_of_living: "Costs are moderate relative to the broader island setting.",
        walkability: "Walkability is strong in the core districts.",
        internet: "Internet quality is strong in the central districts.",
        safety: "The city feels livable and grounded.",
        neighborhoods: [],
        restaurants: [],
        museums: [],
        golf: [],
        beaches: [],
        outdoor_recreation: [],
        pros: [],
        cons: [],
        retirement: "A strong long-stay option for people who value Mediterranean ease.",
        digital_nomad: "Good for remote work when the right district is chosen.",
        family: "A practical family city with strong amenities and outdoor access.",
        weather: "Warm and bright for much of the year.",
        resources: [],
        videos: [],
        media: [],
        sections: {},
        metadata: {
          importedVerifiedFacts: {
            neighborhoods: [{ name: "Santa Catalina" }, { name: "Portixol" }],
            places: [{
              name: "Mercat de l’Olivar",
              neighborhood_name: "Santa Catalina",
              category: "Restaurants",
              address: "Carrer de la Unió, Palma",
              google_maps_url: "https://maps.google.com/?q=Mercat%20de%20l’Olivar",
              website_url: "https://example.com/mercat",
              verified: true,
              source: "Premium V2 import",
            }],
            resources: [{ category: "official", label: "Palma tourism", url: "https://example.com/palma-tourism" }],
            media: [{ kind: "image", url: "https://example.com/palma.jpg", alt_text: "Palma de Mallorca waterfront", caption: "Palma waterfront", is_primary: true }],
          },
          neighborhoodIntelligence: [{
            category: "Restaurants",
            neighborhoodName: "Santa Catalina",
            places: [{
              id: "place-1",
              name: "Mercat de l’Olivar",
              category: "Restaurants",
              neighborhoodName: "Santa Catalina",
              description: "A cherished market and dining anchor.",
              whyItMatters: "It gives the district a lived-in daily rhythm.",
              verified: true,
              googleMapsUrl: "https://maps.google.com/?q=Mercat%20de%20l’Olivar",
              websiteUrl: "https://example.com/mercat",
              source: "Premium V2 import",
            }],
          }],
          premiumEditorialContent: {
            heroIntroduction: "Palma feels strongest when its neighborhood texture is visible.",
          },
        },
      }],
    } as Response);

    const destination = await getCanonicalDestination("palma-de-mallorca");

    expect(destination).not.toBeNull();
    expect(destination?.neighborhoods).toEqual(["Santa Catalina", "Portixol"]);
    expect(destination?.resources[0]?.label).toBe("Palma tourism");
    expect(destination?.media[0]?.url).toBe("https://example.com/palma.jpg");
    expect(destination?.heroImages[0]?.url).toBe("https://example.com/palma.jpg");
    expect(destination?.neighborhoodIntelligence?.some((group) => group.category === "Restaurants" && (group.places ?? []).some((place) => place.name === "Mercat de l’Olivar"))).toBe(true);
  });

  it("hydrates Premium V2 module rows into the canonical destination payload without overwriting existing destination fields", async () => {
    mockedSupabaseFetch.mockImplementation(async (path: string) => {
      if (path.includes("/rest/v1/destinations?")) {
        return {
          ok: true,
          json: async () => [{
            slug: "premium-v2-read-sample",
            destination_id: "11111111-1111-1111-1111-111111111111",
            city: "Palma de Mallorca",
            country: "Spain",
            title: "Palma de Mallorca",
            subtitle: "Palma de Mallorca, Spain",
            hero_narrative: "A Mediterranean capital with grounded neighborhood life.",
            overview: "A city whose local texture matters as much as the waterfront.",
            editorial: "The city feels most compelling through its neighborhoods and everyday routines.",
            neighborhoods: [],
            resources: [],
            videos: [],
            media: [],
            sections: {},
          }],
        } as Response;
      }

      if (path.includes("/rest/v1/premium_places")) {
        return {
          ok: true,
          json: async () => [{
            place_name: "Mercat de l’Olivar",
            category_key: "Restaurants",
            description: "A cherished market and dining anchor.",
          }],
        } as Response;
      }

      if (path.includes("/rest/v1/premium_resources")) {
        return {
          ok: true,
          json: async () => [{
            resource_name: "Palma tourism",
            url: "https://example.com/palma-tourism",
          }],
        } as Response;
      }

      if (path.includes("/rest/v1/premium_media")) {
        return {
          ok: true,
          json: async () => [{
            url: "https://example.com/palma.jpg",
            caption: "Palma waterfront",
            alt_text: "Palma de Mallorca waterfront",
          }],
        } as Response;
      }

      return {
        ok: true,
        json: async () => [],
      } as Response;
    });

    const destination = await getCanonicalDestination("premium-v2-read-sample");
    const premiumModules = (destination as { premiumV2Modules?: Record<string, Array<Record<string, unknown>>> }).premiumV2Modules;

    expect(destination).not.toBeNull();
    expect(destination?.heroNarrative).toBe("A Mediterranean capital with grounded neighborhood life.");
    expect(premiumModules?.places?.[0]?.place_name).toBe("Mercat de l’Olivar");
    expect(premiumModules?.resources?.[0]?.resource_name).toBe("Palma tourism");
    expect(premiumModules?.media?.[0]?.url).toBe("https://example.com/palma.jpg");
  });

  it("hydrates imported neighborhood intelligence from alternate place field names", async () => {
    mockedSupabaseFetch.mockResolvedValue({
      ok: true,
      json: async () => [{
        slug: "new-braunfels-texas-united-states",
        city: "New Braunfels",
        country: "United States",
        title: "New Braunfels",
        subtitle: "New Braunfels, United States",
        hero_narrative: "A river town with a strong local identity.",
        overview: "A destination that feels grounded in its neighborhoods and daily routines.",
        editorial: "The place feels best understood through its lived-in districts.",
        neighborhoods: [],
        resources: [],
        videos: [],
        media: [],
        sections: {},
        metadata: {
          importedVerifiedFacts: {
            neighborhoods: [{ name: "Gruene" }, { name: "Historic Downtown" }],
            places: [{
              real_place_name: "The Gristmill Restaurant & Bar",
              neighborhood_name: "Gruene",
              place_category: "Restaurants",
              verified: true,
              google_maps_url: "https://maps.google.com/?q=The%20Gristmill%20Restaurant%20%26%20Bar",
            }],
          },
        },
      }],
    } as Response);

    const destination = await getCanonicalDestination("new-braunfels-texas-united-states");

    expect(destination).not.toBeNull();
    expect(destination?.neighborhoods).toEqual(["Gruene", "Historic Downtown"]);
    expect(destination?.neighborhoodIntelligence?.some((group) => group.category === "Restaurants" && (group.places ?? []).some((place) => place.name === "The Gristmill Restaurant & Bar"))).toBe(true);
  });

  it("hydrates real workbook-style resources from imported facts using workbook field names", async () => {
    mockedSupabaseFetch.mockResolvedValue({
      ok: true,
      json: async () => [{
        slug: "new-braunfels-tx-us",
        city: "New Braunfels",
        country: "United States",
        title: "New Braunfels",
        subtitle: "New Braunfels, United States",
        hero_narrative: "A river town with a strong local identity.",
        overview: "A destination with a distinctive riverfront identity and strong community texture.",
        editorial: "The place feels most compelling when its neighborhoods and daily routines are visible.",
        neighborhoods: [],
        resources: [],
        videos: [],
        media: [],
        sections: {},
        metadata: {
          importedVerifiedFacts: {
            neighborhoods: [{ name: "Gruene" }],
            places: [{
              real_place_name: "The Gristmill Restaurant & Bar",
              neighborhood_name: "Gruene",
              place_category: "Restaurants",
              verified: true,
              google_maps_url: "https://maps.google.com/?q=The%20Gristmill%20Restaurant%20%26%20Bar",
            }],
            resources: [{
              resource_category: "official",
              resource_name: "City of New Braunfels",
              description: "City government and resident services.",
              url: "https://www.newbraunfels.gov/",
            }],
          },
        },
      }],
    } as Response);

    const destination = await getCanonicalDestination("new-braunfels-tx-us");

    expect(destination).not.toBeNull();
    expect(destination?.resources[0]?.label).toBe("City of New Braunfels");
    expect(destination?.resources[0]?.category).toBe("official");
    expect(destination?.resources[0]?.url).toBe("https://www.newbraunfels.gov/");
    expect(destination?.neighborhoodIntelligence?.some((group) => group.category === "Restaurants" && (group.places ?? []).some((place) => place.name === "The Gristmill Restaurant & Bar"))).toBe(true);
  });

  it("uses workbook-backed fallback content for Supabase-backed destinations when the row is generic", async () => {
    mockedSupabaseFetch.mockResolvedValue({
      ok: true,
      json: async () => [{
        slug: "new-braunfels-texas-united-states",
        city: "New Braunfels",
        country: "United States",
        title: "New Braunfels",
        subtitle: "New Braunfels, United States",
        hero_narrative: "Generic row copy that should not replace the richer workbook narrative.",
        overview: "Generic row overview.",
        editorial: "Generic row editorial.",
        why_this_place_feels_distinct: "Generic row distinct copy.",
        daily_life: "Generic row daily life copy.",
        climate: "Generic row climate copy.",
        transportation: "Generic row transportation copy.",
        healthcare: "Generic row healthcare copy.",
        cost_of_living: "Generic row cost of living copy.",
        walkability: "Generic row walkability copy.",
        internet: "Generic row internet copy.",
        safety: "Generic row safety copy.",
        neighborhoods: [],
        resources: [],
        videos: [],
        media: [],
        sections: {},
        metadata: {},
      }],
    } as Response);

    const destination = await getCanonicalDestination("new-braunfels-texas-united-states");

    expect(destination).not.toBeNull();
    expect(destination?.heroNarrative).toContain("German heritage");
    expect(destination?.overview).toContain("river recreation");
    expect(destination?.resources).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: "City of New Braunfels", url: "https://www.newbraunfels.gov/" }),
      expect.objectContaining({ label: "New Braunfels Tourism", url: "https://www.playinnewbraunfels.com/" }),
    ]));
    expect(destination?.neighborhoodIntelligence?.some((group) => (group.places ?? []).some((place) => place.name === "The Gristmill Restaurant & Bar" || place.name === "Resolute Baptist Hospital"))).toBe(true);
  });

  it("prefers workbook-backed destination rows over fallback content for New Braunfels", async () => {
    mockedSupabaseFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => [],
    } as Response);

    const destination = await getCanonicalDestination("new-braunfels-texas-united-states");

    expect(destination).not.toBeNull();
    expect(destination?.neighborhoods.length).toBe(8);
    expect(destination?.neighborhoods).toEqual(expect.arrayContaining([
      "Downtown New Braunfels",
      "Gruene Historic District",
      "Veramendi",
    ]));
    expect(destination?.resources).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: "City of New Braunfels", url: "https://www.newbraunfels.gov/" }),
      expect.objectContaining({ label: "New Braunfels Tourism", url: "https://www.playinnewbraunfels.com/" }),
    ]));
    expect(destination?.resources.length).toBe(5);
    const placeNames = (destination?.neighborhoodIntelligence ?? []).flatMap((group) => (group.places ?? []).map((place) => place.name));
    expect(placeNames).toEqual(expect.arrayContaining([
      "McAdoo's Seafood Company",
      "Landa Park",
      "Resolute Baptist Hospital",
    ]));
    expect(destination?.costOfLivingProfile?.summary).toContain("Planning estimate");
  });

  it("uses richer fallback content for Summerlin when the remote row is unavailable", async () => {
    mockedSupabaseFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => [],
    } as Response);

    const destination = await getCanonicalDestination("summerlin");

    expect(destination).not.toBeNull();
    expect(destination?.heroNarrative).toContain("master-planned");
    expect(destination?.overview).toContain("neighborhoods");
    expect(destination?.resources).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: "Visit Summerlin", url: "https://www.summerlin.com/" }),
      expect.objectContaining({ label: "The Summerlin Company", url: "https://www.thesummerlincompany.com/" }),
    ]));
    expect(destination?.neighborhoods).toEqual(expect.arrayContaining([
      "The Gardens",
      "The Pueblo",
      "Summerlin Centre",
    ]));
  });

  it("hydrates media and cost profiles from premium v2 workbook rows when imported facts are sparse", async () => {
    mockedSupabaseFetch.mockImplementation(async (path: string) => {
      if (path.includes("/rest/v1/destinations?")) {
        return {
          ok: true,
          json: async () => [{
            slug: "summerlin",
            destination_id: "summerlin-1",
            city: "Summerlin",
            country: "United States",
            title: "Summerlin",
            subtitle: "Summerlin, United States",
            hero_narrative: "A suburban resort-style community with strong parks and amenities.",
            overview: "The place feels strongest when its neighborhood and amenity layers are visible.",
            editorial: "The public experience should reflect its real neighborhood and amenity texture.",
            neighborhoods: [],
            resources: [],
            videos: [],
            media: [],
            sections: {},
          }],
        } as Response;
      }

      if (path.includes("/rest/v1/premium_media")) {
        return {
          ok: true,
          json: async () => [{ image_url: "https://example.com/summerlin-media.jpg", alt_text: "Summerlin media", caption: "Workbook media", is_primary: true }],
        } as Response;
      }

      if (path.includes("/rest/v1/premium_resources")) {
        return {
          ok: true,
          json: async () => [{ resource_name: "Summerlin amenities", resource_category: "official", url: "https://summerlin.com/amenities" }],
        } as Response;
      }

      if (path.includes("/rest/v1/premium_cost_of_living")) {
        return {
          ok: true,
          json: async () => [{ category: "Housing", monthly_low: 1800, monthly_high: 3200, description: "Practical long-stay budget" }],
        } as Response;
      }

      return {
        ok: true,
        json: async () => [],
      } as Response;
    });

    const destination = await getCanonicalDestination("summerlin-las-vegas-nevada");

    expect(destination).not.toBeNull();
    expect(destination?.media[0]?.url).toBe("https://example.com/summerlin-media.jpg");
    expect(destination?.resources[0]?.label).toBe("Summerlin amenities");
    expect(destination?.monthlyBudgets[0]?.amount).toContain("1800");
    expect(destination?.costOfLivingProfile?.summary).toContain("Practical long-stay budget");
  });
});
