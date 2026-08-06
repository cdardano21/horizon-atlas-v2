import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./supabase", () => ({
  isSupabaseConfigured: () => false,
  supabaseFetch: vi.fn(),
}));

import { createAdminFallbackDestination, updateAdminFallbackDestination } from "./admin-local-fallback";
import { buildDestinationFromCatalogRow, buildDestinationFromLocalContent, buildVisibleEditorialNarratives, findDestinationCatalogRow, getDestinationContent, resolveDestinationSlug, selectEditorialNarrative } from "./destination-content";

describe("destination content narrative selection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("prefers the source-backed catalog narrative when it is strong", () => {
    const selected = selectEditorialNarrative(
      "Cavtat is an Adriatic harbor town where the promenade, the old center, and the Rat Peninsula walk all shape the same calm daily loop.",
      "Porto is a city of river light, tiled facades, and streets that make you slow down.",
      "Fallback narrative",
    );

    expect(selected).toContain("Cavtat");
    expect(selected).not.toContain("Porto");
  });

  it("returns empty text when the catalog copy is weak and no source-only narrative exists", () => {
    const selected = selectEditorialNarrative(
      "A tier destination with standout scores for walkability and safety.",
      "A polished coastal city with strong weather, easy cafés, and a daily rhythm that feels graceful rather than hectic.",
      "Fallback narrative",
    );

    expect(selected).toBe("");
  });

  it("does not use legacy local fallback copy when no source-backed narrative is available", () => {
    const selected = selectEditorialNarrative(
      null,
      "This is a generic local fallback narrative that should not be used for source-only destinations.",
      "",
    );

    expect(selected).toBe("");
  });

  it("uses description and overview before older intro and hero narrative fields", () => {
    const result = buildVisibleEditorialNarratives(
      {
        description: "Cavtat is an Adriatic harbor town where the promenade, the old center, and the Rat Peninsula walk all shape the same calm daily loop.",
        overview: "Cavtat works best when the long-stay case is built around a compact waterfront base, easy walks, and a simple routine that feels local rather than resort-like.",
        lifestyle: "A good week here usually means harbor breakfasts, a swim, a slow promenade stroll, a coffee, and dinner within a short radius of home.",
        climate: "The Adriatic climate keeps summer warm and bright while the shoulder seasons stay long enough for outdoor living, swimming, and evening walks without much fuss.",
        transportation: "Mobility is strongest when your base keeps the harbor, daily services, cafés, and the Dubrovnik connection within a compact and manageable loop.",
        introduction: "This is an old intro that should not override the new narrative.",
        heroNarrative: "This is an old hero narrative that should not override the new narrative.",
        lifestyleNarrative: "",
        climateNarrative: "",
        transportationNarrative: "",
        verdict: "",
      },
      null,
      {
        intro: "Fallback intro",
        follow: "Fallback follow",
        dek: "Fallback dek",
        quote: "Fallback quote",
      },
    );

    expect(result.editorial.intro).toContain("Cavtat is an Adriatic harbor town");
    expect(result.editorial.follow).toContain("Cavtat works best");
    expect(result.magazine.opening).toContain("A good week here usually means harbor breakfasts");
  });

  it("prefers the curated local override when a destination has a flagship narrative override", () => {
    const selected = selectEditorialNarrative(
      "Barcelona is a Mediterranean city with beaches, museums, and lively nightlife.",
      "Barcelona is one of those cities where the everyday experience matters more than the headline image. It works because the city can be lived in at many scales: a market breakfast, a long promenade, a neighborhood café, or a late evening in a district that still feels local.",
      "Fallback narrative",
      true,
    );

    expect(selected).toContain("market breakfast");
    expect(selected).not.toContain("Mediterranean city");
  });

  it("avoids repeating the same paragraph across editorial narrative slots", () => {
    const result = buildVisibleEditorialNarratives(
      {
        description: "This is the same paragraph repeated across the page.",
        overview: "This is the same paragraph repeated across the page.",
        lifestyle: "This is the same paragraph repeated across the page.",
        climate: "This is the same paragraph repeated across the page.",
        transportation: "This is the same paragraph repeated across the page.",
      },
      null,
      {
        intro: "Fallback intro",
        follow: "Fallback follow",
        dek: "Fallback dek",
        quote: "Fallback quote",
      },
    );

    expect(result.editorial.intro).toContain("same paragraph");
    expect(result.editorial.follow).not.toBe(result.editorial.intro);
    expect(result.editorial.dek).not.toBe(result.editorial.intro);
    expect(result.magazine.opening).not.toBe(result.magazine.middle);
  });

  it("keeps the source-specific local description instead of injecting a flagship narrative override", () => {
    const destination = buildDestinationFromLocalContent(
      {
        slug: "barcelona-spain",
        city: "Barcelona",
        country: "Spain",
        description: "The real-world description should stay in place because the page should use source-specific detail rather than a curated override.",
        overview: "The real-world overview should stay in place because the page should use source-specific detail rather than a curated override.",
        climate: "The real-world climate description should stay in place because the page should use source-specific detail rather than a curated override.",
        lifestyle: "The real-world lifestyle description should stay in place because the page should use source-specific detail rather than a curated override.",
        transportation: "The real-world transportation description should stay in place because the page should use source-specific detail rather than a curated override.",
        images: [],
        tags: [],
        match: 78,
      } as never,
      "barcelona-spain",
    );

    expect(destination.description).toContain("real-world description");
    expect(destination.overview).toContain("real-world overview");
    expect(destination.lifestyle).toContain("real-world lifestyle description");
  });

  it("maps premium metadata stored inside editorial and research JSON into the public destination profile", () => {
    const destination = buildDestinationFromCatalogRow(
      {
        slug: "spearfish-sd-usa",
        city: "Spearfish",
        country: "United States",
        description: "",
        overview: "",
        climate_summary: "",
        lifestyle_summary: "",
        transportation_summary: "",
        metadata: {
          editorialContent: {
            introduction: "This is the imported intro that should feed the public narrative.",
            heroNarrative: "This is the imported hero narrative that should feed the public narrative.",
            destinationOverview: "This is the imported destination overview that should be treated as premium editorial copy.",
            lifestyleNarrative: "This is the imported lifestyle narrative for daily rhythm.",
          },
          researchProfile: {
            overview: "This is the imported research overview.",
            feel: "This is the imported feel narrative.",
          },
        },
      } as never,
      {
        slug: "spearfish-sd-usa",
        city: "Spearfish",
        country: "United States",
        description: "Generic local description.",
        overview: "Generic local overview.",
        climate: "Generic local climate.",
        lifestyle: "Generic local lifestyle.",
        transportation: "Generic local transportation.",
        images: [],
        tags: [],
        match: 78,
      } as never,
      [],
    );

    expect(destination.description).toContain("imported intro");
    expect(destination.overview).toContain("imported destination overview");
    expect(destination.researchProfile?.longFormEditorial).toContain("imported destination overview");
    expect(destination.researchProfile?.whyThisPlaceFeelsDistinct).toContain("imported feel narrative");
  });

  it("uses imported editorial metadata before generic local fallbacks", () => {
    const destination = buildDestinationFromCatalogRow(
      {
        slug: "cedar-city-utah",
        city: "Cedar City",
        country: "United States",
        description: "",
        overview: "",
        climate_summary: "",
        lifestyle_summary: "",
        transportation_summary: "",
        metadata: {
          editorialContent: {
            introduction: "The imported intro should win over the generic fallback.",
            heroNarrative: "The imported hero narrative should win over the generic fallback.",
            lifestyleNarrative: "The imported lifestyle narrative should win over the generic fallback.",
            climateNarrative: "The imported climate narrative should win over the generic fallback.",
            transportationNarrative: "The imported transportation narrative should win over the generic fallback.",
            verdict: "The imported verdict should win over the generic fallback.",
            longFormEditorial: "The imported long-form editorial should flow through the public page.",
            whyThisPlaceFeelsDistinct: "The imported distinctiveness narrative should flow through the public page.",
          },
          researchProfile: {
            overview: "Imported research profile overview.",
            feel: "Imported feel narrative.",
          },
        },
      } as never,
      {
        slug: "cedar-city-utah",
        city: "Cedar City",
        country: "United States",
        description: "Generic local description.",
        overview: "Generic local overview.",
        climate: "Generic local climate.",
        lifestyle: "Generic local lifestyle.",
        transportation: "Generic local transportation.",
        images: [],
        tags: [],
        match: 78,
      } as never,
      [],
    );

    expect(destination.description).toContain("imported intro");
    expect(destination.overview).toContain("imported hero narrative");
    expect(destination.lifestyle).toContain("imported lifestyle narrative");
    expect(destination.climate).toContain("imported climate narrative");
    expect(destination.transportation).toContain("imported transportation narrative");
    expect(destination.researchProfile?.overview).toContain("Imported research profile overview");
    expect(destination.researchProfile?.longFormEditorial).toContain("imported long-form editorial");
    expect(destination.researchProfile?.whyThisPlaceFeelsDistinct).toContain("imported distinctiveness narrative");
  });

  it("uses standard catalog fields for legacy imported destinations before local fallbacks", () => {
    const destination = buildDestinationFromCatalogRow(
      {
        slug: "spearfish-south-dakota",
        city: "Spearfish",
        country: "United States",
        description: "Generic catalog description that should be used for legacy imported destinations.",
        overview: "Generic catalog overview that should be used for legacy imported destinations.",
        climate_summary: "",
        lifestyle_summary: "",
        transportation_summary: "",
        metadata: {
          editorialContent: {},
        },
      } as never,
      {
        slug: "spearfish-south-dakota",
        city: "Spearfish",
        country: "United States",
        description: "Local legacy description that should not override imported catalog copy.",
        overview: "Local legacy overview that should not override imported catalog copy.",
        climate: "Local legacy climate that should not override imported catalog copy.",
        lifestyle: "Local legacy lifestyle that should not override imported catalog copy.",
        transportation: "Local legacy transportation that should not override imported catalog copy.",
        images: [],
        tags: [],
        match: 78,
      } as never,
      [],
    );

    expect(destination.description).toContain("Generic catalog description");
    expect(destination.overview).toContain("Generic catalog overview");
  });

  it("prefers curated local narrative over weak generic catalog copy when the row is still generic", () => {
    const destination = buildDestinationFromCatalogRow(
      {
        slug: "spearfish-south-dakota-united-states",
        city: "Spearfish",
        country: "United States",
        description: "Spearfish is a scenic Black Hills town known for outdoor access and a small university.",
        overview: "Spearfish Canyon, trails and nearby historic towns. The local economy is supported by tourism, education, healthcare and regional services.",
        climate_summary: "",
        lifestyle_summary: "",
        transportation_summary: "",
        metadata: {
          editorialContent: {},
        },
      } as never,
      {
        slug: "spearfish-south-dakota-united-states",
        city: "Spearfish",
        country: "United States",
        description: "Spearfish is a relocation candidate with mountain scenery, practical healthcare access, and a strong balance between outdoor life and affordability.",
        overview: "Spearfish offers a rare combination of canyon landscapes, small-town pacing, and dependable regional access for a long-stay base.",
        climate: "The Black Hills climate gives Spearfish four clear seasons with plenty of time to live outdoors without the intensity of a larger metro.",
        lifestyle: "A good week here usually means canyon drives, a quick downtown errand, and an evening that feels relaxed rather than overbuilt.",
        transportation: "The local setup works best when the home base keeps daily errands, the airport corridor, and canyon access in a simple loop.",
        images: [],
        tags: [],
        match: 78,
      } as never,
      [],
    );

    expect(destination.description).toContain("relocation candidate");
    expect(destination.overview).toContain("rare combination");
    expect(destination.climate).toContain("four clear seasons");
  });

  it("uses standard catalog summary fields when premium editorial metadata is absent", () => {
    const destination = buildDestinationFromCatalogRow(
      {
        slug: "spearfish-south-dakota",
        city: "Spearfish",
        country: "United States",
        description: "Generic catalog description that should be used for legacy imported destinations.",
        overview: "Generic catalog overview that should be used for legacy imported destinations.",
        climate_summary: "Generic catalog climate summary that should be used for legacy imported destinations.",
        lifestyle_summary: "Generic catalog lifestyle summary that should be used for legacy imported destinations.",
        transportation_summary: "Generic catalog transportation summary that should be used for legacy imported destinations.",
        metadata: {
          editorialContent: {},
        },
      } as never,
      {
        slug: "spearfish-south-dakota",
        city: "Spearfish",
        country: "United States",
        description: "Local legacy description that should not override imported catalog copy.",
        overview: "Local legacy overview that should not override imported catalog copy.",
        climate: "Local legacy climate that should not override imported catalog copy.",
        lifestyle: "Local legacy lifestyle that should not override imported catalog copy.",
        transportation: "Local legacy transportation that should not override imported catalog copy.",
        images: [],
        tags: [],
        match: 78,
      } as never,
      [],
    );

    expect(destination.description).toContain("Generic catalog description");
    expect(destination.overview).toContain("Generic catalog overview");
    expect(destination.climate).toContain("Generic catalog climate summary");
    expect(destination.lifestyle).toContain("Generic catalog lifestyle summary");
    expect(destination.transportation).toContain("Generic catalog transportation summary");
  });

  it("prefers legacy catalog content over source-only narrative when premium metadata is absent", () => {
    const destination = buildDestinationFromCatalogRow(
      {
        slug: "cavtat-croatia",
        city: "Cavtat",
        country: "Croatia",
        description: "Generic catalog description for Cavtat.",
        overview: "Generic catalog overview for Cavtat.",
        climate_summary: "Generic catalog climate summary for Cavtat.",
        lifestyle_summary: "Generic catalog lifestyle summary for Cavtat.",
        transportation_summary: "Generic catalog transportation summary for Cavtat.",
        metadata: {
          editorialContent: {},
        },
      } as never,
      {
        slug: "cavtat-croatia",
        city: "Cavtat",
        country: "Croatia",
        description: "Local legacy description that should not override imported catalog copy.",
        overview: "Local legacy overview that should not override imported catalog copy.",
        climate: "Local legacy climate that should not override imported catalog copy.",
        lifestyle: "Local legacy lifestyle that should not override imported catalog copy.",
        transportation: "Local legacy transportation that should not override imported catalog copy.",
        images: [],
        tags: [],
        match: 78,
      } as never,
      [],
    );

    expect(destination.description).toContain("Generic catalog description");
    expect(destination.overview).toContain("Generic catalog overview");
    expect(destination.climate).toContain("Generic catalog climate summary");
    expect(destination.lifestyle).toContain("Generic catalog lifestyle summary");
    expect(destination.transportation).toContain("Generic catalog transportation summary");
  });

  it("uses research-profile-backed imported narratives when the row metadata does not expose editorial content fields", () => {
    const destination = buildDestinationFromCatalogRow(
      {
        slug: "spearfish-south-dakota",
        city: "Spearfish",
        country: "United States",
        description: "",
        overview: "",
        climate_summary: "",
        lifestyle_summary: "",
        transportation_summary: "",
        metadata: {
          researchProfile: {
            overview: "Imported research overview for Spearfish.",
            feel: "Imported lifestyle feel for Spearfish.",
            climate: "Imported climate narrative for Spearfish.",
            transportation: "Imported transportation narrative for Spearfish.",
          },
        },
      } as never,
      {
        slug: "spearfish-south-dakota",
        city: "Spearfish",
        country: "United States",
        description: "Generic local description that should not override imported research copy.",
        overview: "Generic local overview that should not override imported research copy.",
        climate: "Generic local climate.",
        lifestyle: "Generic local lifestyle.",
        transportation: "Generic local transportation.",
        images: [],
        tags: [],
        match: 78,
      } as never,
      [],
    );

    expect(destination.description).toContain("Imported research overview");
    expect(destination.overview).toContain("Imported research overview");
    expect(destination.lifestyle).toContain("Imported lifestyle feel");
    expect(destination.climate).toContain("Imported climate narrative");
    expect(destination.transportation).toContain("Imported transportation narrative");
  });

  it("falls back to a city and country match when the route slug differs from the imported catalog slug", () => {
    const row = findDestinationCatalogRow(
      "spearfish-south-dakota-united-states",
      {
        slug: "spearfish-south-dakota-united-states",
        city: "Spearfish",
        country: "United States",
      } as never,
      [
        {
          slug: "spearfish-south-dakota",
          city: "Spearfish",
          country: "United States",
          description: "Imported premium description.",
        },
      ] as never,
    );

    expect(row?.slug).toBe("spearfish-south-dakota");
    expect(row?.description).toContain("Imported premium description");
  });

  it("uses admin fallback overrides when rendering destination content locally", async () => {
    createAdminFallbackDestination({
      city: "Spearfish",
      country: "United States",
      slug: "spearfish-sd",
      description: "Imported premium description for Spearfish.",
      overview: "Imported premium overview for Spearfish.",
    });

    const destination = await getDestinationContent("spearfish-sd");

    expect(destination).not.toBeNull();
    expect(destination?.destination.description).toContain("Imported premium description");
    expect(destination?.destination.overview).toContain("Imported premium overview");
  });

  it("matches admin fallback entries when the requested slug uses a canonical country variant", async () => {
    createAdminFallbackDestination({
      city: "Spearfish",
      country: "United States",
      slug: "spearfish-sd",
      description: "Imported premium description for canonical Spearfish slug.",
      overview: "Imported premium overview for canonical Spearfish slug.",
    });

    const destination = await getDestinationContent("spearfish-sd-usa");

    expect(destination).not.toBeNull();
    expect(destination?.destination.description).toContain("canonical Spearfish slug");
    expect(destination?.destination.overview).toContain("canonical Spearfish slug");
  });

  it("uses admin fallback metadata narrative fields when rendering destination content locally", async () => {
    const fallback = createAdminFallbackDestination({
      city: "Spearfish",
      country: "United States",
      slug: "spearfish-sd",
      description: null,
      overview: null,
    });

    updateAdminFallbackDestination(fallback.id, {
      metadata: {
        editorialContent: {
          introduction: "Imported fallback intro narrative.",
          heroNarrative: "Imported fallback hero narrative.",
          lifestyleNarrative: "Imported fallback lifestyle narrative.",
          climateNarrative: "Imported fallback climate narrative.",
          transportationNarrative: "Imported fallback transportation narrative.",
          verdict: "Imported fallback verdict.",
        },
        researchProfile: {
          overview: "Imported fallback research overview.",
          feel: "Imported fallback feel narrative.",
          climate: "Imported fallback climate research.",
          transportation: "Imported fallback transportation research.",
        },
      },
    });

    const destination = await getDestinationContent("spearfish-sd");

    expect(destination).not.toBeNull();
    expect(destination?.destination.description).toContain("Imported fallback intro narrative");
    expect(destination?.destination.overview).toContain("Imported fallback hero narrative");
    expect(destination?.destination.climate).toContain("Imported fallback climate narrative");
    expect(destination?.destination.lifestyle).toContain("Imported fallback lifestyle narrative");
    expect(destination?.destination.transportation).toContain("Imported fallback transportation narrative");
  });

  it("resolves city-only aliases to the canonical destination slug", () => {
    expect(resolveDestinationSlug("cavtat")).toBe("cavtat-croatia");
    expect(resolveDestinationSlug("hiroshima")).toBe("hiroshima-japan");
    expect(resolveDestinationSlug("barcelona")).toBe("barcelona-spain");
  });
});
