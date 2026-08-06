import { describe, it, expect } from "vitest";
import { getDestinationContent, buildDestinationFromLocalContent, resolveDestinationSlug } from "./destination-content";
import { getDestinationResearchProfile } from "./destination-research";
import { destinations } from "./destinations";
import { enrichedDestinations } from "./destination-enrichment";
import { listAdminFallbackDestinations } from "./admin-local-fallback";
import { isSupabaseConfigured } from "./supabase";

describe("spearfish trace", () => {
  it("prints the spearfish data stages", async () => {
    const slug = "spearfish-south-dakota-united-states";
    const resolvedSlug = resolveDestinationSlug(slug);
    const local = destinations.find((item) => item.slug === slug || item.slug === resolvedSlug)
      ?? enrichedDestinations.find((item) => item.slug === slug || item.slug === resolvedSlug);
    const adminFallbacks = listAdminFallbackDestinations().filter((item) => item.slug === resolvedSlug || item.slug === slug || item.city === "Spearfish");
    const content = await getDestinationContent(slug);
    const researchProfile = content?.destination ? getDestinationResearchProfile(content.destination) : null;

    const trace = {
      source: content?.source,
      isSupabaseConfigured: isSupabaseConfigured(),
      resolvedSlug,
      localRecord: local ? {
        slug: local.slug,
        city: local.city,
        country: local.country,
        description: local.description,
        overview: local.overview,
        lifestyle: local.lifestyle,
        climate: local.climate,
        transportation: local.transportation,
        introduction: local.introduction,
        heroNarrative: local.heroNarrative,
        lifestyleNarrative: local.lifestyleNarrative,
        climateNarrative: local.climateNarrative,
        transportationNarrative: local.transportationNarrative,
        verdict: local.verdict,
        researchProfile: local.researchProfile,
        longFormEditorial: (local as Record<string, unknown>).longFormEditorial,
        whyThisPlaceFeelsDistinct: (local as Record<string, unknown>).whyThisPlaceFeelsDistinct,
        editorial: (local as Record<string, unknown>).editorial,
        narrative: (local as Record<string, unknown>).narrative,
        premiumDescription: (local as Record<string, unknown>).premiumDescription,
        researchNotes: (local as Record<string, unknown>).researchNotes,
      } : null,
      adminFallbacks: adminFallbacks.map((item) => ({
        id: item.id,
        slug: item.slug,
        city: item.city,
        country: item.country,
        description: item.description,
        overview: item.overview,
        metadata: item.metadata,
      })),
      localBranchResult: local ? buildDestinationFromLocalContent(local, slug) : null,
      getDestinationContentResult: content ? {
        source: content.source,
        destination: {
          slug: content.destination.slug,
          city: content.destination.city,
          country: content.destination.country,
          description: content.destination.description,
          overview: content.destination.overview,
          lifestyle: content.destination.lifestyle,
          climate: content.destination.climate,
          transportation: content.destination.transportation,
          introduction: content.destination.introduction,
          heroNarrative: content.destination.heroNarrative,
          lifestyleNarrative: content.destination.lifestyleNarrative,
          climateNarrative: content.destination.climateNarrative,
          transportationNarrative: content.destination.transportationNarrative,
          verdict: content.destination.verdict,
          researchProfile: content.destination.researchProfile,
        },
      } : null,
      pageObject: content ? {
        slug: content.destination.slug,
        city: content.destination.city,
        country: content.destination.country,
        description: content.destination.description,
        overview: content.destination.overview,
        lifestyle: content.destination.lifestyle,
        climate: content.destination.climate,
        transportation: content.destination.transportation,
        introduction: content.destination.introduction,
        heroNarrative: content.destination.heroNarrative,
        lifestyleNarrative: content.destination.lifestyleNarrative,
        climateNarrative: content.destination.climateNarrative,
        transportationNarrative: content.destination.transportationNarrative,
        verdict: content.destination.verdict,
        longFormEditorial: researchProfile?.longFormEditorial,
        whyThisPlaceFeelsDistinct: researchProfile?.whyThisPlaceFeelsDistinct,
        researchNotes: researchProfile?.researchNotes,
        researchProfile,
      } : null,
    };

    console.log(JSON.stringify({
      source: content?.source,
      values: {
        longFormEditorial: researchProfile?.longFormEditorial,
        whyThisPlaceFeelsDistinct: researchProfile?.whyThisPlaceFeelsDistinct,
        feel: researchProfile?.feel,
        climate: researchProfile?.climate,
        transportation: researchProfile?.transportation,
      },
      localKeys: Object.keys(content?.destination?.researchProfile ?? {}),
    }, null, 2));
    expect(content).toBeTruthy();
    expect(researchProfile?.longFormEditorial).toBeTruthy();
    expect(researchProfile?.whyThisPlaceFeelsDistinct).toBeTruthy();
    expect(researchProfile?.feel).toBeTruthy();
    expect(researchProfile?.climate).toBeTruthy();
    expect(researchProfile?.transportation).toBeTruthy();
  });
});
