import { enrichedDestinations } from "./destination-enrichment";
import type { Destination } from "./destinations";
import { listAdminFallbackDestinations } from "./admin-local-fallback";
import { isSupabaseConfigured, supabaseFetch } from "./supabase";

type DestinationCatalogRow = {
  id: string;
  slug: string;
  city: string;
  country: string;
  status: string | null;
  description: string | null;
  overview: string | null;
  climate_summary: string | null;
  lifestyle_summary: string | null;
  transportation_summary: string | null;
  metadata?: Record<string, unknown> | null;
};

const EXCLUDED_TAGS = new Set([
  "expansion-candidate",
  "research-pending",
]);

const PUBLIC_CATALOG_QUERY_LIMIT = 1000;

const debugPublicCatalog = (...args: unknown[]) => {
  if (process.env.NEXT_PUBLIC_DEBUG_PUBLIC_CATALOG === "1") {
    console.info("[public-destinations]", ...args);
  }
};

const logLoadedCatalogSummary = (destinations: Destination[], source: string) => {
  debugPublicCatalog("loaded catalog summary", {
    source,
    count: destinations.length,
    first10Slugs: destinations.slice(0, 10).map((destination) => destination.slug),
    hasDevon: destinations.some((destination) => destination.slug === "devon-pa-usa"),
  });
};

const normalizeCountryValue = (value: string | null | undefined) =>
  (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const hasExcludedTag = (destination: Destination): boolean => {
  const normalizedCountry = normalizeCountryValue(destination.country);
  const isUnitedStatesCountry = normalizedCountry === "united states"
    || normalizedCountry === "united states of america"
    || normalizedCountry === "usa"
    || normalizedCountry === "us"
    || normalizedCountry.startsWith("united states");

  if (isUnitedStatesCountry) {
    return false;
  }

  const tags = destination.tags?.map((tag) => tag.toLowerCase()) ?? [];
  return tags.some((tag) => EXCLUDED_TAGS.has(tag));
};

const normalizeCatalogRowStatus = (status: string | null | undefined) => status?.trim().toLowerCase();

const buildFallbackCatalogDestination = (destination: {
  slug: string;
  city: string;
  country: string;
  status: string;
  description: string | null;
  overview: string | null;
}): DestinationCatalogRow => ({
  id: `fallback-${destination.slug}`,
  slug: destination.slug,
  city: destination.city,
  country: destination.country,
  status: destination.status,
  description: destination.description,
  overview: destination.overview,
  climate_summary: null,
  lifestyle_summary: null,
  transportation_summary: null,
  metadata: null,
});

const buildCatalogDestination = (row: DestinationCatalogRow, fallback?: Destination): Destination => ({
  slug: row.slug || fallback?.slug || "",
  city: row.city || fallback?.city || "",
  country: row.country || fallback?.country || "",
  emoji: fallback?.emoji ?? "🌍",
  match: fallback?.match ?? 0,
  description: row.description || fallback?.description || "",
  overview: row.overview || fallback?.overview || "",
  climate: row.climate_summary || fallback?.climate || "",
  lifestyle: row.lifestyle_summary || fallback?.lifestyle || "",
  transportation: row.transportation_summary || fallback?.transportation || "",
  images: fallback?.images ?? [],
  tags: fallback?.tags ?? [],
  title: fallback?.title,
  subtitle: fallback?.subtitle,
  introduction: fallback?.introduction,
  heroNarrative: fallback?.heroNarrative,
  lifestyleNarrative: fallback?.lifestyleNarrative,
  climateNarrative: fallback?.climateNarrative,
  transportationNarrative: fallback?.transportationNarrative,
  verdict: fallback?.verdict,
  dayMoments: fallback?.dayMoments,
  rapidAnswers: fallback?.rapidAnswers,
  coreRelocationQa: fallback?.coreRelocationQa,
  practicalTopLinks: fallback?.practicalTopLinks,
  researchProfile: fallback?.researchProfile,
});

export const buildPublicDestinationCatalogList = (
  catalogRows: DestinationCatalogRow[],
  localDestinations: Destination[] = enrichedDestinations,
): Destination[] => {
  const mergedBySlug = new Map<string, Destination>();

  for (const destination of localDestinations) {
    if (!destination.slug) continue;
    mergedBySlug.set(destination.slug, destination);
  }

  debugPublicCatalog("catalog rows received", { count: catalogRows.length });

  let publishedRows = 0;
  let rowsWithSlug = 0;

  for (const row of catalogRows) {
    const status = normalizeCatalogRowStatus(row.status);
    if (status !== "published") continue;
    publishedRows += 1;
    if (!row.slug) continue;
    rowsWithSlug += 1;

    const baseDestination = mergedBySlug.get(row.slug);
    mergedBySlug.set(row.slug, buildCatalogDestination(row, baseDestination));
  }

  debugPublicCatalog("after published/slug filters", { publishedRows, rowsWithSlug });

  const mergedDestinations = Array.from(mergedBySlug.values());
  const visibleDestinations: Destination[] = [];

  mergedDestinations.forEach((destination) => {
    const excluded = hasExcludedTag(destination);
    if (excluded) {
      debugPublicCatalog("excluded destination", {
        slug: destination.slug,
        city: destination.city,
        country: destination.country,
        tags: destination.tags,
      });
      return;
    }

    visibleDestinations.push(destination);
  });

  debugPublicCatalog("after exclusion filter", { mergedCount: mergedDestinations.length, visibleCount: visibleDestinations.length });

  return visibleDestinations;
};

export const publicDestinations: Destination[] = buildPublicDestinationCatalogList([], enrichedDestinations);

export const publicDestinationSlugSet = new Set(publicDestinations.map((destination) => destination.slug));

export const isPublicDestinationSlug = (slug: string): boolean => publicDestinationSlugSet.has(slug);

export async function getPublicDestinations(): Promise<Destination[]> {
  const localDestinations = enrichedDestinations.filter((destination) => !hasExcludedTag(destination));
  logLoadedCatalogSummary(localDestinations, "fallback-local");

  const fallbackDestinations = listAdminFallbackDestinations()
    .filter((destination) => normalizeCatalogRowStatus(destination.status) === "published")
    .map((destination) => buildFallbackCatalogDestination({
      slug: destination.slug,
      city: destination.city,
      country: destination.country,
      status: destination.status,
      description: destination.description,
      overview: destination.overview,
    }));

  if (!isSupabaseConfigured()) {
    const fallbackCatalogRows = fallbackDestinations.length
      ? buildPublicDestinationCatalogList(fallbackDestinations, localDestinations)
      : localDestinations;

    debugPublicCatalog("supabase not configured; using fallback dataset", {
      count: fallbackCatalogRows.length,
      fallbackRows: fallbackDestinations.length,
    });
    return fallbackCatalogRows;
  }

  try {
    const response = await supabaseFetch(
      `/rest/v1/destinations_catalog?select=id,slug,city,country,status,description,overview,climate_summary,lifestyle_summary,transportation_summary,metadata&limit=${PUBLIC_CATALOG_QUERY_LIMIT}`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      debugPublicCatalog("supabase response not ok; using local fallback dataset", { status: response.status });
      return localDestinations;
    }

    const rows = (await response.json()) as DestinationCatalogRow[];
    const publishedRows = [
      ...rows.filter((row) => normalizeCatalogRowStatus(row.status) === "published"),
      ...fallbackDestinations,
    ];
    debugPublicCatalog("supabase rows returned", {
      count: rows.length,
      publishedCount: publishedRows.length,
      slugs: publishedRows.slice(0, 8).map((row) => row.slug),
    });
    const mergedDestinations = buildPublicDestinationCatalogList(publishedRows, localDestinations);
    logLoadedCatalogSummary(mergedDestinations, "supabase-merged");
    return mergedDestinations;
  } catch (error) {
    debugPublicCatalog("supabase request failed; using local fallback dataset", { error: error instanceof Error ? error.message : String(error) });
    return localDestinations;
  }
}
