import { beforeEach, describe, expect, it, vi } from "vitest";

const loadPremiumWorkbookDestinationDataMock = vi.hoisted(() => vi.fn());

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

vi.mock("./workbook-runtime-loader", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./workbook-runtime-loader")>();
  return {
    ...actual,
    loadPremiumWorkbookDestinationData: loadPremiumWorkbookDestinationDataMock,
  };
});

import { buildWorkbookDestinationFromData, getCanonicalDestination } from "./canonical-destination-loader";
import { loadPersistedDestinationFromRuntime } from "./runtime/persisted-destination-read-runtime";
import { supabaseFetch } from "./supabase";
import { getWorkbookFallbackDestinationData } from "./workbook-new-braunfels-fallback";

const mockedSupabaseFetch = vi.mocked(supabaseFetch);
const mockedLoadPersistedDestinationFromRuntime = vi.mocked(loadPersistedDestinationFromRuntime);
const mockedLoadPremiumWorkbookDestinationData = vi.mocked(loadPremiumWorkbookDestinationDataMock);

describe("canonical destination loader", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockedLoadPremiumWorkbookDestinationData.mockImplementation(async (slug: string) => {
      const actualModule = await vi.importActual<typeof import("./workbook-runtime-loader")>("./workbook-runtime-loader");
      return actualModule.loadPremiumWorkbookDestinationData(slug);
    });
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

  it("queries the real destinations_catalog table, not the non-existent destinations table", async () => {
    mockedSupabaseFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response);

    await getCanonicalDestination("some-destination-slug");

    const queriedPaths = mockedSupabaseFetch.mock.calls.map(([path]) => String(path));
    expect(queriedPaths.some((path) => path.startsWith("/rest/v1/destinations_catalog?"))).toBe(true);
    expect(queriedPaths.some((path) => path.startsWith("/rest/v1/destinations?"))).toBe(false);
  });

  it("never fuzzy-matches an approved pilot slug to an unrelated catalog row", async () => {
    mockedSupabaseFetch.mockImplementation(async (path: string) => {
      if (path.includes("/rest/v1/destinations_catalog?slug=eq.")) {
        return { ok: true, json: async () => [] } as Response;
      }

      if (path.includes("/rest/v1/destinations_catalog?select=")) {
        return {
          ok: true,
          json: async () => [{
            id: "unrelated-row",
            slug: "las-vegas-nevada-united-states",
            city: "Las Vegas",
            country: "United States",
            title: "Las Vegas",
          }],
        } as Response;
      }

      return { ok: true, json: async () => [] } as Response;
    });

    const destination = await getCanonicalDestination("summerlin-las-vegas-nevada");

    // The identity/isolation invariant this test protects: an unrelated catalog row (Las Vegas)
    // must never leak into Summerlin's resolved identity or workbook-backed facts.
    expect(destination).not.toBeNull();
    expect(destination?.city).toContain("Summerlin");
    expect(destination?.city).not.toBe("Las Vegas");
    expect(destination?.title).not.toBe("Las Vegas");
    expect(destination?.knowledgeProfile?.population).toBe("100000");
    expect(destination?.knowledgeProfile?.metroPopulation).toBe("Las Vegas Valley");
  });

  it("uses workbook-backed knowledge profile facts when the Supabase row has no profile", async () => {
    mockedSupabaseFetch.mockResolvedValue({
      ok: true,
      json: async () => [{
        slug: "new-braunfels-texas-united-states",
        city: "New Braunfels",
        country: "United States",
        title: "New Braunfels",
        subtitle: "New Braunfels, United States",
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
        neighborhoods: [],
        resources: [],
        videos: [],
        media: [],
        sections: {},
        scoring: [],
      }],
    } as Response);

    mockedLoadPremiumWorkbookDestinationData.mockResolvedValueOnce({
      destinationKey: "new-braunfels-tx-us",
      slug: "new-braunfels-texas-united-states",
      city: "New Braunfels",
      country: "United States",
      title: "New Braunfels",
      subtitle: "New Braunfels, United States",
      heroNarrative: "Workbook narrative",
      overview: "Workbook overview",
      editorial: "Workbook editorial",
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
        majorAirports: ["San Antonio International Airport", "Austin-Bergstrom International Airport"],
        majorHospitals: ["Resolute Baptist Hospital"],
      },
      source: "runtime-loader",
    } as never);

    const destination = await getCanonicalDestination("new-braunfels-texas-united-states");

    expect(destination).not.toBeNull();
    expect(destination?.knowledgeProfile?.majorAirports).toEqual(["San Antonio International Airport", "Austin-Bergstrom International Airport"]);
    expect(destination?.knowledgeProfile?.majorHospitals).toEqual(["Resolute Baptist Hospital"]);
  });

  it("uses the workbook-backed destination when Supabase fetches fail", async () => {
    mockedSupabaseFetch.mockRejectedValueOnce(new Error("network unavailable"));
    mockedLoadPremiumWorkbookDestinationData.mockResolvedValueOnce({
      destinationKey: "new-braunfels-tx-us",
      slug: "new-braunfels-texas-united-states",
      city: "New Braunfels",
      country: "United States",
      title: "New Braunfels",
      subtitle: "New Braunfels, United States",
      heroNarrative: "Workbook narrative",
      overview: "Workbook overview",
      editorial: "Workbook editorial",
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
        climateClassification: "Humid subtropical",
        majorAirports: ["San Antonio International Airport"],
      },
      source: "runtime-loader",
    } as never);

    const destination = await getCanonicalDestination("new-braunfels-texas-united-states");

    expect(destination).not.toBeNull();
    expect(destination?.heroNarrative).toContain("Workbook narrative");
    expect(destination?.knowledgeProfile?.population).toBe("110000");
    expect(destination?.knowledgeProfile?.majorAirports).toEqual(["San Antonio International Airport"]);
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
        media: [{ mediaKey: "media-1", kind: "image", url: "https://cdn.dfai-assets.com/lisbon.jpg", caption: "Lisbon", altText: "Lisbon" }],
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
    expect(destination?.media[0]?.url).toBe("https://cdn.dfai-assets.com/lisbon.jpg");
    expect(destination?.resources[0]?.label).toBe("Visit Lisboa");
    expect(mockedLoadPersistedDestinationFromRuntime).toHaveBeenCalled();

    // Regression: youtube/tiktok/instagram/webcam have no authored workbook column in any known
    // schema version - a resolved persisted-bundle destination must now receive a deterministic,
    // clearly-generated search-style utility link for them (never left blank/broken), generated
    // generically off the destination's real title/country, even for an approved golden pilot.
    expect(destination?.youtubeUrl).toContain("youtube.com/results");
    expect(destination?.tiktokUrl).toContain("tiktok.com/search");
    expect(destination?.instagramUrl).toContain("instagram.com/explore/tags/");
    expect(destination?.webcamUrl).toContain("google.com/search");
    // officialTourismUrl must be either a real authored value or blank - it always keeps a
    // dedicated "Official tourism website" UI label, so it must never receive a generated substitute.
    expect(destination?.officialTourismUrl ?? "").toBe("");
    // googleMapsUrl/googleEarthUrl/wikipediaUrl now fall back to a deterministic generated utility
    // when no authored value exists, since Lisbon's title/country are known.
    expect(destination?.googleMapsUrl).toContain("google.com/maps");
    expect(destination?.googleEarthUrl).toContain("earth.google.com/web/search/");
    expect(destination?.wikipediaUrl).toContain("en.wikipedia.org/wiki/");
  });

  it("resolves a brand-new, non-pilot destination through the persisted runtime path using only its real destination_key, with no source-code allowlist entry required", async () => {
    mockedSupabaseFetch.mockResolvedValue({
      ok: true,
      json: async () => [{
        id: "dest-future-batch",
        destination_id: "dest-future-batch",
        destination_key: "plovdiv-bg",
        slug: "plovdiv-bulgaria",
        city: "Plovdiv",
        country: "Bulgaria",
        title: "Plovdiv",
        subtitle: "Plovdiv, Bulgaria",
        neighborhoods: [],
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
        destinationKey: "plovdiv-bg",
        identity: { slug: "plovdiv-bulgaria", name: "Plovdiv", city: "Plovdiv", country: "Bulgaria" },
        editorial: {
          shortDescription: "Persisted Plovdiv short description",
          longDescription: "Persisted Plovdiv long description",
          currency: "BGN",
          primaryLanguage: "Bulgarian",
          timeZone: "EET",
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
        environmentQuality: null,
        dailyLifePracticality: null,
        eventsSeasonality: [],
        sources: [],
      },
    } as never);

    const destination = await getCanonicalDestination("plovdiv-bulgaria");

    expect(destination).not.toBeNull();
    expect(destination?.title).toBe("Plovdiv");
    expect(destination?.heroNarrative).toBe("Persisted Plovdiv short description");
    expect(mockedLoadPersistedDestinationFromRuntime).toHaveBeenCalledWith(expect.objectContaining({ destinationKey: "plovdiv-bg" }));
    // The runtime must never live-parse the frozen workbook for a non-golden-pilot destination.
    expect(mockedLoadPremiumWorkbookDestinationData).not.toHaveBeenCalled();
  });

  it("surfaces rich workbook neighborhoods and neighborhood intelligence instead of a single sparse persisted placeholder", async () => {
    mockedSupabaseFetch.mockResolvedValue({
      ok: true,
      json: async () => [{
        id: "dest-lisbon",
        destination_id: "dest-lisbon",
        destination_key: "lisbon-pt",
        slug: "lisbon-portugal",
        city: "Lisbon",
        country: "Portugal",
        title: "Lisbon",
        subtitle: "Lisbon, Portugal",
        neighborhoods: [],
        resources: [],
        videos: [],
        media: [],
        sections: {},
        scoring: [],
      }],
    } as Response);

    mockedLoadPremiumWorkbookDestinationData.mockResolvedValueOnce({
      destinationKey: "lisbon-pt",
      slug: "lisbon-portugal",
      city: "Lisbon",
      country: "Portugal",
      title: "Lisbon",
      subtitle: "Lisbon, Portugal",
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
      neighborhoods: [
        { name: "Príncipe Real" },
        { name: "Alfama" },
        { name: "Baixa / Chiado" },
      ],
      places: [
        { name: "Belcanto", category: "restaurant", neighborhoodName: "Baixa / Chiado" },
        { name: "Copenhagen Coffee Lab", category: "coffee_shop", neighborhoodName: "Príncipe Real" },
        { name: "Jardim da Estrela", category: "park", neighborhoodName: "Alfama" },
      ],
      resources: [],
      media: [],
      costRecords: [],
      healthcareRecords: [],
      transportRecords: [],
      housingRecords: [],
      realityChecks: [],
      sources: [],
      counts: { neighborhoods: 3, places: 3, resources: 0, media: 0, costRecords: 0 },
      source: "runtime-loader",
    } as never);

    mockedLoadPersistedDestinationFromRuntime.mockResolvedValue({
      outcome: "SUCCESS",
      bundle: {
        destinationKey: "lisbon-pt",
        identity: { slug: "lisbon-portugal", name: "Lisbon", city: "Lisbon", country: "Portugal" },
        editorial: { shortDescription: "", longDescription: "", currency: null, primaryLanguage: null, timeZone: null },
        facts: [],
        scores: [],
        neighborhoods: [{ neighborhoodKey: "neighborhood-1", name: "Bairro", summary: "Nice", areaType: "urban" }],
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
        environmentQuality: null,
        dailyLifePracticality: null,
        eventsSeasonality: [],
        sources: [],
      },
    } as never);

    const destination = await getCanonicalDestination("lisbon-portugal");

    expect(destination).not.toBeNull();
    expect(destination?.neighborhoods).toEqual(["Príncipe Real", "Alfama", "Baixa / Chiado"]);
    expect(destination?.neighborhoods).not.toContain("Bairro");
    expect(destination?.neighborhoodIntelligence?.some((group) => group.places?.some((place) => place.name === "Belcanto"))).toBe(true);
    expect(destination?.neighborhoodIntelligence?.some((group) => group.places?.some((place) => place.name === "Copenhagen Coffee Lab"))).toBe(true);
    expect(destination?.neighborhoodIntelligence?.some((group) => group.places?.some((place) => place.name === "Jardim da Estrela"))).toBe(true);
  });

  it("uses workbook content to fill sparse persisted bundle values for pilot destinations", async () => {
    mockedSupabaseFetch.mockResolvedValue({
      ok: true,
      json: async () => [{
        id: "dest-456",
        destination_id: "dest-456",
        destination_key: "new-braunfels-tx-us",
        slug: "new-braunfels-texas-united-states",
        city: "New Braunfels",
        country: "United States",
        title: "New Braunfels",
        subtitle: "New Braunfels, United States",
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
        neighborhoods: [],
        resources: [],
        videos: [],
        media: [],
        sections: {},
        scoring: [],
      }],
    } as Response);

    mockedLoadPremiumWorkbookDestinationData.mockResolvedValueOnce({
      destinationKey: "new-braunfels-tx-us",
      slug: "new-braunfels-texas-united-states",
      city: "New Braunfels",
      country: "United States",
      title: "New Braunfels",
      subtitle: "New Braunfels, United States",
      heroNarrative: "Workbook hero narrative",
      overview: "Workbook overview",
      editorial: "Workbook editorial",
      whyThisPlaceFeelsDistinct: "Workbook distinct",
      dailyLife: "Workbook daily life",
      climate: "Workbook climate",
      transportation: "Workbook transportation",
      healthcare: "Workbook healthcare",
      costOfLiving: "Workbook cost",
      walkability: "Workbook walkability",
      internet: "Workbook internet",
      safety: "Workbook safety",
      officialTourismUrl: "",
      googleMapsUrl: "",
      googleEarthUrl: "",
      wikipediaUrl: "",
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
        climateClassification: "Humid subtropical",
        majorAirports: ["San Antonio International Airport"],
        majorHospitals: ["Resolute Baptist Hospital"],
      },
      source: "runtime-loader",
    } as never);

    mockedLoadPersistedDestinationFromRuntime.mockResolvedValue({
      outcome: "SUCCESS",
      bundle: {
        destinationKey: "new-braunfels-tx-us",
        identity: {
          slug: "new-braunfels-texas-united-states",
          name: "New Braunfels",
          city: "New Braunfels",
          country: "United States",
        },
        editorial: {
          shortDescription: "",
          longDescription: "",
          currency: null,
          primaryLanguage: null,
          timeZone: null,
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
        environmentQuality: null,
        dailyLifePracticality: null,
        eventsSeasonality: [],
        sources: [],
      },
    } as never);

    const destination = await getCanonicalDestination("new-braunfels-texas-united-states");

    expect(destination).not.toBeNull();
    expect(destination?.heroNarrative).toBe("Workbook hero narrative");
    expect(destination?.knowledgeProfile?.population).toBe("110000");
    expect(destination?.knowledgeProfile?.majorAirports).toEqual(["San Antonio International Airport"]);
    expect(destination?.knowledgeProfile?.majorHospitals).toEqual(["Resolute Baptist Hospital"]);
  });

  it("ignores placeholder example.com media in the persisted bundle and falls back to real workbook media", async () => {
    mockedSupabaseFetch.mockResolvedValue({
      ok: true,
      json: async () => [{
        id: "dest-789",
        destination_id: "dest-789",
        destination_key: "new-braunfels-tx-us",
        slug: "new-braunfels-texas-united-states",
        city: "New Braunfels",
        country: "United States",
        title: "New Braunfels",
        subtitle: "New Braunfels, United States",
        neighborhoods: [],
        resources: [],
        videos: [],
        media: [],
        sections: {},
        scoring: [],
      }],
    } as Response);

    mockedLoadPremiumWorkbookDestinationData.mockResolvedValueOnce({
      destinationKey: "new-braunfels-tx-us",
      slug: "new-braunfels-texas-united-states",
      city: "New Braunfels",
      country: "United States",
      title: "New Braunfels",
      subtitle: "New Braunfels, United States",
      heroNarrative: "Workbook hero narrative",
      overview: "Workbook overview",
      editorial: "Workbook editorial",
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
      media: [{ kind: "image", url: "https://commons.wikimedia.org/wiki/Special:FilePath/New_Braunfels_Texas_Landa_Park.jpg", altText: "New Braunfels Landa Park", caption: "New Braunfels Landa Park", isPrimary: true }],
      costRecords: [],
      healthcareRecords: [],
      transportRecords: [],
      housingRecords: [],
      realityChecks: [],
      sources: [],
      counts: { neighborhoods: 0, places: 0, resources: 0, media: 1, costRecords: 0 },
      source: "runtime-loader",
    } as never);

    mockedLoadPersistedDestinationFromRuntime.mockResolvedValue({
      outcome: "SUCCESS",
      bundle: {
        destinationKey: "new-braunfels-tx-us",
        identity: {
          slug: "new-braunfels-texas-united-states",
          name: "New Braunfels",
          city: "New Braunfels",
          country: "United States",
        },
        editorial: { shortDescription: "", longDescription: "", currency: null, primaryLanguage: null, timeZone: null },
        facts: [],
        scores: [],
        neighborhoods: [],
        places: [],
        resources: [],
        media: [{ mediaKey: "media-1", kind: "image", url: "https://example.com/img.jpg", caption: "Image", altText: "Alt" }],
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

    const destination = await getCanonicalDestination("new-braunfels-texas-united-states");

    expect(destination).not.toBeNull();
    expect(destination?.media.some((item) => item.url.includes("example.com"))).toBe(false);
    expect(destination?.media[0]?.url).toBe("https://commons.wikimedia.org/wiki/Special:FilePath/New_Braunfels_Texas_Landa_Park.jpg");
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

  it("preserves valid Wikimedia Special:FilePath URLs unchanged and converts plain File: article URLs without fabricating a hash path", () => {
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
        { kind: "image", url: "https://commons.wikimedia.org/wiki/Special:FilePath/New_Braunfels_Texas_Landa_Park.jpg", altText: "New Braunfels Landa Park", caption: "New Braunfels Landa Park", isPrimary: true },
        { kind: "image", url: "https://commons.wikimedia.org/wiki/File:New_Braunfels_Gruene_Hall.jpg", altText: "New Braunfels Gruene Hall", caption: "New Braunfels Gruene Hall", isPrimary: false },
      ],
      costRecords: [],
      healthcareRecords: [],
      transportRecords: [],
      housingRecords: [],
      realityChecks: [],
      sources: [],
      counts: { neighborhoods: 0, places: 0, resources: 0, media: 2, costRecords: 0 },
    });

    const urls = destination.media.map((item) => item.url);
    expect(urls).toContain("https://commons.wikimedia.org/wiki/Special:FilePath/New_Braunfels_Texas_Landa_Park.jpg");
    expect(urls).toContain("https://commons.wikimedia.org/wiki/Special:FilePath/New_Braunfels_Gruene_Hall.jpg");
    expect(urls.some((url) => url.includes("upload.wikimedia.org"))).toBe(false);
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
    expect(destination?.media[0]?.url).toBe("https://commons.wikimedia.org/wiki/Special:FilePath/New_Braunfels_Texas_Landa_Park.jpg");
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
      if (path.includes("/rest/v1/destinations_catalog?")) {
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
    // The retired legacy fallback file must not be required for this to pass: getWorkbookFallbackDestinationData
    // returns null for New Braunfels, so every assertion below has to come from the authoritative workbook data.
    expect(getWorkbookFallbackDestinationData("new-braunfels-texas-united-states")).toBeNull();

    mockedSupabaseFetch.mockImplementation(async (path: string) => {
      if (path.includes("/rest/v1/destinations_catalog?")) {
        return {
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
        } as Response;
      }

      return { ok: true, json: async () => [] } as Response;
    });

    const destination = await getCanonicalDestination("new-braunfels-texas-united-states");

    expect(destination).not.toBeNull();
    expect(destination?.heroNarrative).toContain("German heritage");
    expect(destination?.overview).toContain("river recreation");
    // These labels/URLs are asserted directly against the authoritative workbook RESOURCES sheet, not the retired fallback.
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

  it("resolves Summerlin from authoritative workbook data when the remote row is unavailable", async () => {
    // The retired legacy fallback file must not be required for this to pass.
    expect(getWorkbookFallbackDestinationData("summerlin-las-vegas-nevada")).toBeNull();

    mockedSupabaseFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => [],
    } as Response);

    const destination = await getCanonicalDestination("summerlin-las-vegas-nevada");

    expect(destination).not.toBeNull();
    expect(destination?.heroNarrative).toContain("master-planned");
    expect(destination?.overview).toContain("neighborhoods");
    expect(destination?.resources).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: "Summerlin", url: "https://summerlin.com/" }),
      expect.objectContaining({ label: "Summerlin Hospital Medical Center", url: "https://www.summerlinhospital.com/" }),
    ]));
    expect(destination?.neighborhoods).toEqual(expect.arrayContaining([
      "Downtown Summerlin",
      "The Ridges",
      "Sun City Summerlin",
    ]));
  });

  it("hydrates media and cost profiles from premium v2 workbook rows when imported facts are sparse", async () => {
    mockedSupabaseFetch.mockImplementation(async (path: string) => {
      if (path.includes("/rest/v1/destinations_catalog?")) {
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

// ---------------------------------------------------------------------------------------------
// STEP 11 regression suite: renderer-integration authority contract (identity, facts, scores,
// neighborhoods, media, rich modules, fallback policy). Covers the audit-fixed root causes:
// unsafe fuzzy slug substitution (The Villages -> Athens, Puerto Vallarta -> Puerto Escondido),
// generic "${city} center" neighborhood fabrication, hardcoded 76/74/72/78 score fallback, and
// generic stock-photo media fallback overriding real persisted v3.1 content.
// ---------------------------------------------------------------------------------------------
function buildFullNormalizedBundle(overrides: Record<string, unknown> = {}) {
  return {
    destinationKey: "test-destination-key",
    identity: { slug: "test-destination", name: "Test Destination", city: "Test City", country: "Testland" },
    editorial: { shortDescription: "Real short description.", longDescription: "Real long description.", currency: "USD", primaryLanguage: "English", timeZone: "UTC" },
    facts: [
      { factKey: "population", factGroup: "identity", valueText: "123,456", displayLabel: "Population", sourceName: "Census" },
      { factKey: "elevation", factGroup: "identity", valueText: "42 m", displayLabel: "Elevation", sourceName: "Geo" },
      { factKey: "metro_population", factGroup: "identity", valueText: "Metro area: 200,000", displayLabel: "Metro population", sourceName: "Census" },
      { factKey: "currency", factGroup: "finance", valueText: "US Dollar (USD)", displayLabel: "Currency", sourceName: "ECB" },
      { factKey: "climate", factGroup: "climate", valueText: "Real climate narrative.", displayLabel: "Climate", sourceName: "WeatherSpark" },
      { factKey: "healthcare", factGroup: "healthcare", valueText: "Real healthcare fact narrative.", displayLabel: "Hospital access", sourceName: "Health Dept" },
    ],
    scores: [
      { scoreKey: "retirement", scoreValue: "91", scoreLabel: "Excellent", methodologyVersion: "v3.1-editorial-2026-08" },
      { scoreKey: "family", scoreValue: "88", scoreLabel: "Very strong", methodologyVersion: "v3.1-editorial-2026-08" },
    ],
    neighborhoods: [
      { neighborhoodKey: "nb-1", name: "Real Neighborhood One", summary: "Real neighborhood one summary.", areaType: "urban" },
      { neighborhoodKey: "nb-2", name: "Real Neighborhood Two", summary: "Real neighborhood two summary.", areaType: "residential" },
    ],
    places: [{ placeKey: "place-1", category: "restaurant", name: "Real Place", description: "Real place description." }],
    resources: [{ resourceKey: "resource-1", category: "tourism", name: "Real Resource", url: "https://real-resource.example.gov" }],
    media: [
      { mediaKey: "media-1", kind: "image", url: "https://commons.wikimedia.org/wiki/Special:FilePath/Real1.jpg", caption: "Real caption one", altText: "Real alt one" },
      { mediaKey: "media-2", kind: "image", url: "https://commons.wikimedia.org/wiki/Special:FilePath/Real2.jpg", caption: "Real caption two", altText: "Real alt two" },
    ],
    costOfLiving: [{ itemKey: "col-1", category: "housing", monthlyLow: "1000", monthlyHigh: "2000", currency: "USD" }],
    climateMonthly: [],
    housing: [],
    propertyResources: [],
    healthcare: [{ summary: "Real healthcare module summary.", publicAccessSummary: "Real public access summary.", insuranceSummary: "Real insurance summary." }],
    visaResidency: [],
    taxesFinance: [],
    lgbtqInclusivity: [],
    safetyRisks: [],
    transportation: [{ summary: "Real transportation module summary.", airportSummary: "Real airport summary.", transitSummary: "Real transit summary." }],
    remoteWork: [{ summary: "Real remote work module summary.", internetSummary: "Real internet summary.", timezoneSummary: "Real timezone summary." }],
    languageIntegration: [],
    pets: [{ summary: "Real pets module summary.", petFriendlyNotes: "Real pet-friendly notes." }],
    familyEducation: [{ summary: "Real family module summary.", schoolsSummary: "Real schools summary." }],
    communitySocial: [],
    accessibility: [],
    bureaucracySetup: [],
    workBusiness: [],
    retirementAging: [{ summary: "Real retirement module summary.", agingNotes: "Real aging notes." }],
    lifestyleLaws: [],
    realityCheck: [],
    moveChecklist: [],
    environmentQuality: null,
    dailyLifePracticality: null,
    eventsSeasonality: [],
    sources: [],
    ...overrides,
  };
}

function mockExactCatalogRow(destinationKey: string, slug: string, extra: Record<string, unknown> = {}) {
  mockedSupabaseFetch.mockImplementation(async (path: string) => {
    if (path.includes(`/rest/v1/destinations_catalog?slug=eq.${encodeURIComponent(slug)}`)) {
      return {
        ok: true,
        json: async () => [{ id: `id-${destinationKey}`, destination_id: `id-${destinationKey}`, destination_key: destinationKey, slug, city: "", country: "", neighborhoods: [], resources: [], videos: [], media: [], sections: {}, scoring: [], ...extra }],
      } as Response;
    }
    // Any other exact-key or fuzzy-style lookup must never return an unrelated row.
    return { ok: true, json: async () => [] } as Response;
  });
}

describe("STEP 11: renderer-integration authority contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedLoadPremiumWorkbookDestinationData.mockResolvedValue(null);
  });

  describe("identity resolution safety", () => {
    it("the-meadowlands-florida-united-states can never resolve to Athens", async () => {
      // No exact slug row, no exact destination_key row - simulates the real RLS-blocked draft
      // scenario. Historically this fell through to a fuzzy substring search that matched the
      // bare token "the" against a published "Athens" row.
      mockedSupabaseFetch.mockResolvedValue({ ok: true, json: async () => [] } as Response);
      mockedLoadPersistedDestinationFromRuntime.mockResolvedValue({ outcome: "FAILED", failure: { reason: "DB_READ_FAILED", destinationIdentity: { destinationKey: "", destinationId: "" } } } as never);

      const destination = await getCanonicalDestination("the-meadowlands-florida-united-states");

      expect(destination).not.toBeNull();
      expect(destination?.city).not.toBe("Athens");
      expect(destination?.title).not.toBe("Athens");
      expect(destination?.country).not.toBe("Greece");
      // No fuzzy full-table scan may ever occur - only exact slug and exact destination_key lookups.
      const queriedPaths = mockedSupabaseFetch.mock.calls.map(([path]) => String(path));
      for (const path of queriedPaths) {
        expect(path).toMatch(/destinations_catalog\?(slug|destination_key)=eq\./);
      }
    });

    it("puerto-esperanza-mexico can never resolve to Puerto Escondido", async () => {
      mockedSupabaseFetch.mockResolvedValue({ ok: true, json: async () => [] } as Response);
      mockedLoadPersistedDestinationFromRuntime.mockResolvedValue({ outcome: "FAILED", failure: { reason: "DB_READ_FAILED", destinationIdentity: { destinationKey: "", destinationId: "" } } } as never);

      const destination = await getCanonicalDestination("puerto-esperanza-mexico");

      expect(destination).not.toBeNull();
      expect(destination?.city).not.toBe("Puerto Escondido");
      expect(destination?.title).not.toBe("Puerto Escondido");
    });

    it("resolves through an exact destination_key match when the slug lookup misses", async () => {
      mockedSupabaseFetch.mockImplementation(async (path: string) => {
        if (path.includes("/rest/v1/destinations_catalog?slug=eq.")) {
          return { ok: true, json: async () => [] } as Response;
        }
        if (path.includes("/rest/v1/destinations_catalog?destination_key=eq.da-nang-vn")) {
          return { ok: true, json: async () => [{ id: "id-da-nang", destination_id: "id-da-nang", destination_key: "da-nang-vn", slug: "da-nang-vietnam", city: "", country: "", neighborhoods: [], resources: [], videos: [], media: [], sections: {}, scoring: [] }] } as Response;
        }
        return { ok: true, json: async () => [] } as Response;
      });
      mockedLoadPersistedDestinationFromRuntime.mockResolvedValue({ outcome: "SUCCESS", bundle: buildFullNormalizedBundle({ destinationKey: "da-nang-vn", identity: { slug: "da-nang-vietnam", name: "Da Nang", city: "Da Nang", country: "Vietnam" } }) } as never);

      const destination = await getCanonicalDestination("da-nang-vn");

      expect(destination?.city).toBe("Da Nang");
      expect(destination?.v31DestinationKey).toBe("da-nang-vn");
    });

    it("exact legacy slugs continue to resolve unaffected", async () => {
      mockedSupabaseFetch.mockResolvedValue({
        ok: true,
        json: async () => [{ slug: "barcelona-spain", city: "Barcelona", country: "Spain", title: "Barcelona", neighborhoods: [], resources: [], videos: [], media: [], sections: {}, scoring: [] }],
      } as Response);
      mockedLoadPersistedDestinationFromRuntime.mockResolvedValue({ outcome: "FAILED", failure: { reason: "DB_READ_FAILED", destinationIdentity: { destinationKey: "", destinationId: "" } } } as never);

      const destination = await getCanonicalDestination("barcelona-spain");
      expect(destination?.city).toBe("Barcelona");
    });

    it("an unknown destination stays not-found/generic rather than resolving to a different real destination", async () => {
      mockedSupabaseFetch.mockResolvedValue({ ok: true, json: async () => [] } as Response);
      mockedLoadPersistedDestinationFromRuntime.mockResolvedValue({ outcome: "FAILED", failure: { reason: "DB_READ_FAILED", destinationIdentity: { destinationKey: "", destinationId: "" } } } as never);

      const destination = await getCanonicalDestination("completely-unknown-slug-xyz");

      expect(destination).not.toBeNull();
      // Generic fallback naming derived purely from the requested slug - never another real place.
      expect(destination?.city.toLowerCase()).not.toBe("athens");
      expect(destination?.city.toLowerCase()).not.toBe("puerto escondido");
    });

    it("golden-pilot aliases still resolve via the explicit reviewed alias map", async () => {
      mockedSupabaseFetch.mockImplementation(async (path: string) => {
        if (path.includes("/rest/v1/destinations_catalog?slug=eq.")) {
          return { ok: true, json: async () => [] } as Response;
        }
        if (path.includes("/rest/v1/destinations_catalog?destination_key=eq.summerlin-nv-us")) {
          return { ok: true, json: async () => [{ id: "id-summerlin", destination_id: "id-summerlin", destination_key: "summerlin-nv-us", slug: "summerlin-nv-usa", city: "Summerlin", country: "United States", neighborhoods: [], resources: [], videos: [], media: [], sections: {}, scoring: [] }] } as Response;
        }
        return { ok: true, json: async () => [] } as Response;
      });
      mockedLoadPersistedDestinationFromRuntime.mockResolvedValue({ outcome: "FAILED", failure: { reason: "DB_READ_FAILED", destinationIdentity: { destinationKey: "", destinationId: "" } } } as never);

      const destination = await getCanonicalDestination("summerlin-las-vegas-nevada");

      expect(destination?.city).toBe("Summerlin");
    });
  });

  describe("real facts mapping", () => {
    it("prefers persisted identity demographics while mapping healthcare and climate facts", async () => {
      mockExactCatalogRow("the-meadowlands-fl-us", "the-meadowlands-florida-united-states");
      mockedLoadPersistedDestinationFromRuntime.mockResolvedValue({
        outcome: "SUCCESS",
        bundle: buildFullNormalizedBundle({
          destinationKey: "the-meadowlands-fl-us",
          identity: {
            slug: "the-meadowlands-florida-united-states",
            name: "The Meadowlands",
            city: "The Meadowlands",
            country: "United States",
            population: "987,654",
            metroPopulation: "Persisted metro: 300,000",
            elevation: "55",
          },
        }),
      } as never);

      const destination = await getCanonicalDestination("the-meadowlands-florida-united-states");

      expect(destination?.knowledgeProfile?.population).toBe("987,654");
      expect(destination?.knowledgeProfile?.metroPopulation).toBe("Persisted metro: 300,000");
      expect(destination?.knowledgeProfile?.elevation).toBe("55 m");
      expect(destination?.knowledgeProfile?.currency).toBe("USD");
      expect(destination?.healthcare).toContain("Real healthcare module summary");
      expect(destination?.climate).toContain("Real climate narrative");
    });
  });

  describe("destination-level score mapping (STEP 5 - display mapping only, no quiz/recommendation logic)", () => {
    it("maps real persisted DESTINATION_SCORES rows into v31Modules.scores", async () => {
      mockExactCatalogRow("plovdiv-bg", "plovdiv-bulgaria");
      mockedLoadPersistedDestinationFromRuntime.mockResolvedValue({ outcome: "SUCCESS", bundle: buildFullNormalizedBundle({ destinationKey: "plovdiv-bg" }) } as never);

      const destination = await getCanonicalDestination("plovdiv-bulgaria");

      expect(destination?.v31Modules?.scores).toEqual([
        { scoreKey: "retirement", scoreValue: "91", scoreLabel: "Excellent" },
        { scoreKey: "family", scoreValue: "88", scoreLabel: "Very strong" },
      ]);
    });

    it("the hardcoded 76/74/72/78 fallback scores are not present anywhere in a resolved v3.1 destination's scoring", async () => {
      mockExactCatalogRow("plovdiv-bg", "plovdiv-bulgaria");
      mockedLoadPersistedDestinationFromRuntime.mockResolvedValue({ outcome: "SUCCESS", bundle: buildFullNormalizedBundle({ destinationKey: "plovdiv-bg" }) } as never);

      const destination = await getCanonicalDestination("plovdiv-bulgaria");
      const scoreValues = (destination?.v31Modules?.scores ?? []).map((score) => score.scoreValue);
      expect(scoreValues).not.toContain("76");
      expect(scoreValues).not.toContain("74");
      expect(scoreValues).not.toContain("72");
      expect(scoreValues).not.toContain("78");
    });

    it("does not introduce any personalized quiz/match/recommendation scoring field or module", async () => {
      mockExactCatalogRow("plovdiv-bg", "plovdiv-bulgaria");
      mockedLoadPersistedDestinationFromRuntime.mockResolvedValue({ outcome: "SUCCESS", bundle: buildFullNormalizedBundle({ destinationKey: "plovdiv-bg" }) } as never);

      const destination = await getCanonicalDestination("plovdiv-bulgaria");
      const serialized = JSON.stringify(destination);
      expect(serialized.toLowerCase()).not.toContain("matchpercentage");
      expect(serialized.toLowerCase()).not.toContain("quizanswer");
      expect(serialized.toLowerCase()).not.toContain("retirementdna");
      expect(serialized.toLowerCase()).not.toContain("recommendationweight");
    });
  });

  describe("real neighborhoods mapping (STEP 6)", () => {
    it("maps persisted neighborhoods and never fabricates a generic city-center entry", async () => {
      mockExactCatalogRow("nha-trang-vn", "nha-trang-vietnam");
      mockedLoadPersistedDestinationFromRuntime.mockResolvedValue({ outcome: "SUCCESS", bundle: buildFullNormalizedBundle({ destinationKey: "nha-trang-vn", identity: { slug: "nha-trang-vietnam", name: "Nha Trang", city: "Nha Trang", country: "Vietnam" } }) } as never);

      const destination = await getCanonicalDestination("nha-trang-vietnam");

      expect(destination?.v31Modules?.neighborhoods.map((n) => n.name)).toEqual(["Real Neighborhood One", "Real Neighborhood Two"]);
      expect(destination?.neighborhoods).toEqual(["Real Neighborhood One", "Real Neighborhood Two"]);
      expect(destination?.neighborhoods.join(" ")).not.toContain("center");
    });

    it("omits neighborhoods rather than fabricating one when a v3.1 destination genuinely has zero persisted rows", async () => {
      mockExactCatalogRow("wanaka-nz", "wanaka-new-zealand");
      mockedLoadPersistedDestinationFromRuntime.mockResolvedValue({ outcome: "SUCCESS", bundle: buildFullNormalizedBundle({ destinationKey: "wanaka-nz", neighborhoods: [] }) } as never);

      const destination = await getCanonicalDestination("wanaka-new-zealand");

      expect(destination?.v31Modules?.neighborhoods).toEqual([]);
    });
  });

  describe("real media mapping (STEP 7)", () => {
    it("maps persisted media and never falls back to generic stock photos when real media exists", async () => {
      mockExactCatalogRow("puerto-esperanza-mx", "puerto-esperanza-mexico");
      mockedLoadPersistedDestinationFromRuntime.mockResolvedValue({ outcome: "SUCCESS", bundle: buildFullNormalizedBundle({ destinationKey: "puerto-esperanza-mx" }) } as never);

      const destination = await getCanonicalDestination("puerto-esperanza-mexico");

      expect(destination?.media.map((item) => item.url)).toEqual([
        "https://commons.wikimedia.org/wiki/Special:FilePath/Real1.jpg",
        "https://commons.wikimedia.org/wiki/Special:FilePath/Real2.jpg",
      ]);
      const stockPhotoIds = ["photo-1500530855697-b586d89ba3ee", "photo-1499856871958-5b9627545d1a"];
      for (const item of destination?.media ?? []) {
        for (const stockId of stockPhotoIds) {
          expect(item.url).not.toContain(stockId);
        }
      }
    });

    it("selects the explicit primary and orders the remaining gallery by persisted sort order", async () => {
      mockExactCatalogRow("ordered-media-key", "ordered-media-slug");
      mockedLoadPersistedDestinationFromRuntime.mockResolvedValue({
        outcome: "SUCCESS",
        bundle: buildFullNormalizedBundle({
          destinationKey: "ordered-media-key",
          media: [
            { mediaKey: "media-3", kind: "image", url: "https://upload.wikimedia.org/third.jpg", caption: "Third", altText: "Third", isPrimary: "false", sortOrder: "3", verified: "true", sourceName: "Commons", sourceUrl: "https://commons.wikimedia.org/wiki/File:Third.jpg", licenseNotes: "CC" },
            { mediaKey: "media-1", kind: "image", url: "https://upload.wikimedia.org/hero.jpg", caption: "Hero", altText: "Hero", isPrimary: "true", sortOrder: "1", verified: "true", sourceName: "Commons", sourceUrl: "https://commons.wikimedia.org/wiki/File:Hero.jpg", licenseNotes: "CC" },
            { mediaKey: "media-2", kind: "image", url: "https://upload.wikimedia.org/second.jpg", caption: "Second", altText: "Second", isPrimary: "false", sortOrder: "2", verified: "true", sourceName: "Commons", sourceUrl: "https://commons.wikimedia.org/wiki/File:Second.jpg", licenseNotes: "CC" },
          ],
        }),
      } as never);

      const destination = await getCanonicalDestination("ordered-media-slug");

      expect(destination?.media.map((item) => item.url)).toEqual([
        "https://upload.wikimedia.org/hero.jpg",
        "https://upload.wikimedia.org/second.jpg",
        "https://upload.wikimedia.org/third.jpg",
      ]);
      expect(destination?.media.map((item) => item.isPrimary)).toEqual([true, false, false]);
      expect(destination?.v31Modules?.media.map((item) => item.sortOrder)).toEqual(["1", "2", "3"]);
    });

    it("omits media (empty array) rather than using generic stock photos when a v3.1 destination genuinely has zero persisted/workbook media", async () => {
      mockExactCatalogRow("the-meadowlands-fl-us", "the-meadowlands-florida-united-states");
      mockedLoadPersistedDestinationFromRuntime.mockResolvedValue({ outcome: "SUCCESS", bundle: buildFullNormalizedBundle({ destinationKey: "the-meadowlands-fl-us", media: [] }) } as never);

      const destination = await getCanonicalDestination("the-meadowlands-florida-united-states");

      expect(destination?.media).toEqual([]);
      const stockPhotoIds = ["photo-1500530855697-b586d89ba3ee", "photo-1499856871958-5b9627545d1a"];
      for (const stockId of stockPhotoIds) {
        expect(JSON.stringify(destination)).not.toContain(stockId);
      }
    });
  });

  describe("rich module representative mapping (STEP 8)", () => {
    it("maps representative cost of living, transportation, remote work, pets, family, and retirement rows", async () => {
      mockExactCatalogRow("the-meadowlands-fl-us", "the-meadowlands-florida-united-states");
      mockedLoadPersistedDestinationFromRuntime.mockResolvedValue({ outcome: "SUCCESS", bundle: buildFullNormalizedBundle({ destinationKey: "the-meadowlands-fl-us" }) } as never);

      const destination = await getCanonicalDestination("the-meadowlands-florida-united-states");

      expect(destination?.v31Modules?.costOfLiving[0]).toMatchObject({ category: "housing", monthlyLow: "1000", monthlyHigh: "2000" });
      expect(destination?.v31Modules?.transportation[0]?.summary).toContain("Real transportation module summary");
      expect(destination?.v31Modules?.remoteWork[0]?.summary).toContain("Real remote work module summary");
      expect(destination?.v31Modules?.pets[0]?.summary).toContain("Real pets module summary");
      expect(destination?.v31Modules?.familyEducation[0]?.summary).toContain("Real family module summary");
      expect(destination?.v31Modules?.retirementAging[0]?.summary).toContain("Real retirement module summary");
      expect(destination?.transportation).toContain("Real transportation module summary");
      expect(destination?.family).toContain("Real family module summary");
      expect(destination?.retirement).toContain("Real retirement module summary");
      expect(destination?.digitalNomad).toContain("Real remote work module summary");
    });

    it("maps environmentQuality and dailyLifePracticality singleton modules into v31Modules (previously parsed/persisted but silently dropped before reaching the UI)", async () => {
      mockExactCatalogRow("environment-quality-test-key", "environment-quality-test-slug");
      mockedLoadPersistedDestinationFromRuntime.mockResolvedValue({
        outcome: "SUCCESS",
        bundle: buildFullNormalizedBundle({
          destinationKey: "environment-quality-test-key",
          environmentQuality: { summary: "Generally good air quality with seasonal pollen.", qualityNotes: "Water quality is municipally treated and reliable." },
          dailyLifePracticality: { summary: "Groceries and pharmacies are easy to reach on foot.", practicalityNotes: "Most residents rely on a car for regional errands." },
        }),
      } as never);

      const destination = await getCanonicalDestination("environment-quality-test-slug");

      expect(destination?.v31Modules?.environmentQuality?.summary).toBe("Generally good air quality with seasonal pollen.");
      expect(destination?.v31Modules?.environmentQuality?.qualityNotes).toBe("Water quality is municipally treated and reliable.");
      expect(destination?.v31Modules?.dailyLifePracticality?.summary).toBe("Groceries and pharmacies are easy to reach on foot.");
      expect(destination?.v31Modules?.dailyLifePracticality?.practicalityNotes).toBe("Most residents rely on a car for regional errands.");
    });

    it("environmentQuality/dailyLifePracticality are null (never fabricated) when the persisted bundle genuinely has none", async () => {
      mockExactCatalogRow("no-environment-quality-test-key", "no-environment-quality-test-slug");
      mockedLoadPersistedDestinationFromRuntime.mockResolvedValue({
        outcome: "SUCCESS",
        bundle: buildFullNormalizedBundle({ destinationKey: "no-environment-quality-test-key", environmentQuality: null, dailyLifePracticality: null }),
      } as never);

      const destination = await getCanonicalDestination("no-environment-quality-test-slug");

      expect(destination?.v31Modules?.environmentQuality).toBeNull();
      expect(destination?.v31Modules?.dailyLifePracticality).toBeNull();
    });
  });

  describe("fallback policy: real data > omit > fabricated prose", () => {
    it("an absent persisted module is represented as an empty array, never fabricated content", async () => {
      mockExactCatalogRow("puerto-esperanza-mx", "puerto-esperanza-mexico");
      mockedLoadPersistedDestinationFromRuntime.mockResolvedValue({ outcome: "SUCCESS", bundle: buildFullNormalizedBundle({ destinationKey: "puerto-esperanza-mx", visaResidency: [], taxesFinance: [], lgbtqInclusivity: [] }) } as never);

      const destination = await getCanonicalDestination("puerto-esperanza-mexico");

      expect(destination?.v31Modules?.visaResidency).toEqual([]);
      expect(destination?.v31Modules?.taxesFinance).toEqual([]);
      expect(destination?.v31Modules?.lgbtqInclusivity).toEqual([]);
    });

    it("v31Modules is present for a resolved v3.1 destination and absent for a legacy destination", async () => {
      mockExactCatalogRow("puerto-esperanza-mx", "puerto-esperanza-mexico");
      mockedLoadPersistedDestinationFromRuntime.mockResolvedValue({ outcome: "SUCCESS", bundle: buildFullNormalizedBundle({ destinationKey: "puerto-esperanza-mx" }) } as never);
      const v31Destination = await getCanonicalDestination("puerto-esperanza-mexico");
      expect(v31Destination?.v31Modules).toBeDefined();

      mockedSupabaseFetch.mockResolvedValue({
        ok: true,
        json: async () => [{ slug: "barcelona-spain", city: "Barcelona", country: "Spain", title: "Barcelona", neighborhoods: [], resources: [], videos: [], media: [], sections: {}, scoring: [] }],
      } as Response);
      mockedLoadPersistedDestinationFromRuntime.mockResolvedValue({ outcome: "FAILED", failure: { reason: "DB_READ_FAILED", destinationIdentity: { destinationKey: "", destinationId: "" } } } as never);
      const legacyDestination = await getCanonicalDestination("barcelona-spain");
      expect(legacyDestination?.v31Modules).toBeUndefined();
    });
  });
});

describe("PROPERTY_RESOURCES surfacing (Housing/Property resource presentation)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedLoadPremiumWorkbookDestinationData.mockResolvedValue(null);
  });

  it("authored PROPERTY_RESOURCES rows reach the canonical destination's resources array in the Housing category, with name/url preserved", async () => {
    mockExactCatalogRow("property-resource-test-key", "property-resource-test-slug");
    mockedLoadPersistedDestinationFromRuntime.mockResolvedValue({
      outcome: "SUCCESS",
      bundle: buildFullNormalizedBundle({
        destinationKey: "property-resource-test-key",
        propertyResources: [
          { itemKey: "pr-1", category: "official", name: "Homefinder Portal", url: "https://example.com/homefinder", description: "Official new-home search tool.", official: "true", sourceUrl: null, verified: "true", verifiedAt: "2026-01-01" },
          { itemKey: "pr-2", category: "listing", name: "Realtor Listings", url: "https://example.com/realtor", description: null, official: "false", sourceUrl: null, verified: null, verifiedAt: null },
        ],
      }),
    } as never);

    const destination = await getCanonicalDestination("property-resource-test-slug");

    const housingItems = destination?.resources.filter((resource) => resource.category === "housing") ?? [];
    expect(housingItems.some((item) => item.label === "Homefinder Portal" && item.url === "https://example.com/homefinder")).toBe(true);
    expect(housingItems.some((item) => item.label === "Realtor Listings" && item.url === "https://example.com/realtor")).toBe(true);
  });

  it("authored PROPERTY_RESOURCES take priority over the generated long-term-rental/property-for-sale search utilities for the same destination (no duplication)", async () => {
    mockExactCatalogRow("property-resource-test-key-2", "property-resource-test-slug-2");
    mockedLoadPersistedDestinationFromRuntime.mockResolvedValue({
      outcome: "SUCCESS",
      bundle: buildFullNormalizedBundle({
        destinationKey: "property-resource-test-key-2",
        identity: { slug: "property-resource-test-slug-2", name: "Property Test City", city: "Property Test City", country: "Testland" },
        propertyResources: [
          { itemKey: "pr-1", category: "agency", name: "Test City Realty", url: "https://example.com/test-city-realty", description: null, official: null, sourceUrl: null, verified: null, verifiedAt: null },
        ],
      }),
    } as never);

    const destination = await getCanonicalDestination("property-resource-test-slug-2");

    const housingItems = destination?.resources.filter((resource) => resource.category === "housing") ?? [];
    expect(housingItems).toHaveLength(1);
    expect(housingItems[0]?.label).toBe("Test City Realty");
    expect(housingItems.some((item) => item.label === "Search long-term rentals")).toBe(false);
    expect(housingItems.some((item) => item.label === "Search property for sale")).toBe(false);
  });

  it("a destination with blank PROPERTY_RESOURCES continues to show the generated long-term-rental/property-for-sale search utilities", async () => {
    mockExactCatalogRow("no-property-resource-test-key", "no-property-resource-test-slug");
    mockedLoadPersistedDestinationFromRuntime.mockResolvedValue({
      outcome: "SUCCESS",
      bundle: buildFullNormalizedBundle({
        destinationKey: "no-property-resource-test-key",
        identity: { slug: "no-property-resource-test-slug", name: "No Property City", city: "No Property City", country: "Testland" },
        propertyResources: [],
      }),
    } as never);

    const destination = await getCanonicalDestination("no-property-resource-test-slug");

    const housingItems = destination?.resources.filter((resource) => resource.category === "housing") ?? [];
    expect(housingItems.some((item) => item.label === "Search long-term rentals")).toBe(true);
    expect(housingItems.some((item) => item.label === "Search property for sale")).toBe(true);
  });
});
