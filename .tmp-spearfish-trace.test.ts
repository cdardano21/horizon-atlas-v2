import { describe, it, expect } from 'vitest';
import { getDestinationContent, resolveDestinationSlug } from './app/lib/destination-content';
import { isSupabaseConfigured } from './app/lib/supabase';

describe('spearfish trace', () => {
  it('logs the catalog query and row', async () => {
    const slug = 'spearfish-south-dakota-united-states';
    const resolvedSlug = resolveDestinationSlug(slug);
    let catalogQuery: string | null = null;
    let rowPayload: any = null;
    let queryExecuted = false;

    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      if (typeof url === 'string' && url.includes('/rest/v1/destinations_catalog')) {
        queryExecuted = true;
        catalogQuery = url;
        const response = await originalFetch(input, init);
        const text = await response.text();
        rowPayload = JSON.parse(text);
        return new Response(text, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      }
      return originalFetch(input, init);
    };

    try {
      const content = await getDestinationContent(slug);
      const row = Array.isArray(rowPayload) ? rowPayload[0] ?? null : null;
      const editorialContent = row?.metadata?.editorialContent ?? null;
      const researchProfile = row?.metadata?.researchProfile ?? null;

      console.log(JSON.stringify({
        envLoaded: isSupabaseConfigured(),
        slug,
        resolvedSlug,
        queryExecuted,
        catalogQuery,
        row,
        rowSummary: row ? {
          slug: row.slug,
          city: row.city,
          country: row.country,
          description: row.description,
          overview: row.overview,
          climateSummary: row.climate_summary,
          lifestyleSummary: row.lifestyle_summary,
          transportationSummary: row.transportation_summary,
          editorialContentExists: Boolean(editorialContent),
          researchProfileExists: Boolean(researchProfile),
          heroNarrativeExists: Object.prototype.hasOwnProperty.call(editorialContent ?? {}, 'heroNarrative'),
          heroNarrativeValue: editorialContent?.heroNarrative ?? null,
          destinationOverviewExists: Object.prototype.hasOwnProperty.call(editorialContent ?? {}, 'destinationOverview'),
          destinationOverviewValue: editorialContent?.destinationOverview ?? null,
          longFormEditorialExists: Object.prototype.hasOwnProperty.call(editorialContent ?? {}, 'longFormEditorial'),
          longFormEditorialValue: editorialContent?.longFormEditorial ?? null,
          lifestyleNarrativeExists: Object.prototype.hasOwnProperty.call(editorialContent ?? {}, 'lifestyleNarrative'),
          lifestyleNarrativeValue: editorialContent?.lifestyleNarrative ?? null,
        } : null,
        contentResult: content ? {
          source: content.source,
          destination: {
            slug: content.destination.slug,
            city: content.destination.city,
            country: content.destination.country,
            description: content.destination.description,
            overview: content.destination.overview,
            climate: content.destination.climate,
            lifestyle: content.destination.lifestyle,
            transportation: content.destination.transportation,
            introduction: content.destination.introduction,
            heroNarrative: content.destination.heroNarrative,
            lifestyleNarrative: content.destination.lifestyleNarrative,
            climateNarrative: content.destination.climateNarrative,
            transportationNarrative: content.destination.transportationNarrative,
            verdict: content.destination.verdict,
            researchProfile: content.destination.researchProfile ? {
              overview: content.destination.researchProfile.overview ?? null,
              longFormEditorial: content.destination.researchProfile.longFormEditorial ?? null,
              whyThisPlaceFeelsDistinct: content.destination.researchProfile.whyThisPlaceFeelsDistinct ?? null,
            } : null,
          },
        } : null,
      }, null, 2));

      expect(queryExecuted).toBe(true);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
