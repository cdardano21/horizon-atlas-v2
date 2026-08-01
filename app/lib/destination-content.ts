import { enrichedDestinations, getDestinationEditorialFields } from "./destination-enrichment";
import { getSourceOnlyNarrative } from "./source-only-destination-narratives";
import {
  type Destination,
  type DestinationEditorialContent,
  type DestinationMemberDetails,
  type DestinationRelocationProfile,
  type DestinationResearchProfile,
} from "./destinations";
import { isSupabaseConfigured, supabaseFetch } from "./supabase";

type DestinationCatalogRow = {
  id: string;
  slug: string;
  city: string;
  country: string;
  tier: string | null;
  status: string;
  hero_image_url: string | null;
  description: string | null;
  overview: string | null;
  climate_summary: string | null;
  lifestyle_summary: string | null;
  transportation_summary: string | null;
  metadata: {
    memberDetails?: DestinationMemberDetails;
    relocationProfile?: DestinationRelocationProfile;
    editorialContent?: DestinationEditorialContent;
    researchProfile?: DestinationResearchProfile;
  } | null;
};

type DestinationMediaRow = {
  kind: string;
  url: string;
  alt_text: string | null;
  caption: string | null;
  is_primary: boolean;
};

type DestinationResourceRow = {
  category: string;
  label: string;
  provider: string | null;
  url: string;
};

type DestinationVideoRow = {
  provider: string;
  label: string;
  url: string;
  embed_url: string | null;
};

export type DestinationResourceLink = {
  category: string;
  label: string;
  provider: string | null;
  url: string;
};

export type DestinationVideoLink = {
  provider: string;
  label: string;
  url: string;
  embedUrl: string | null;
};

const WEAK_NARRATIVE_PATTERNS = [
  /a tier/i,
  /standout scores/i,
  /verify before decision/i,
  /residency context/i,
  /tax context/i,
  /dri signal/i,
  /ordinary weekday/i,
  /week after week/i,
  /test everyday essentials/i,
  /run a normal day/i,
  /lived-in place/i,
  /source expansion underway/i,
  /professional review needed/i,
  /available in the horizon atlas/i,
  /available for relocation research/i,
  /destination in/i,
  /known for.*practical transport links/i,
  /works well for longer stays because/i,
  /daily rhythm that feels practical/i,
  /historic streets and neighborhood life/i,
  /city where the everyday life/i,
];

const isSpecificNarrative = (value: string | null | undefined) => {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return /(palamidi|bourtzi|akronafplia|arvanitia|mycenae|epidaurus|trastevere|tiber|piazza|marina|promenade|churches|squares|fortress|harbor)/i.test(normalized);
};

const isWeakEditorialNarrative = (value: string | null | undefined) => {
  if (!value) return true;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return true;
  if (normalized.length < 40) return true;
  return WEAK_NARRATIVE_PATTERNS.some((pattern) => pattern.test(normalized));
};

export const selectEditorialNarrative = (
  rowValue: string | null | undefined,
  localValue: string | null | undefined,
  fallback: string,
) => {
  const normalizedRow = rowValue?.trim();
  const normalizedLocal = localValue?.trim();

  if (normalizedLocal && !isWeakEditorialNarrative(normalizedLocal)) {
    if (normalizedRow && !isWeakEditorialNarrative(normalizedRow)) {
      if (isSpecificNarrative(normalizedLocal) && !isSpecificNarrative(normalizedRow)) {
        return normalizedLocal;
      }
      return normalizedRow;
    }
    return normalizedLocal;
  }

  if (normalizedRow && !isWeakEditorialNarrative(normalizedRow)) return normalizedRow;
  return fallback;
};

export type DestinationContent = {
  source: "local" | "supabase";
  destination: Destination;
  mediaAssets: Array<{
    kind: string;
    url: string;
    altText: string;
    caption: string;
    isPrimary: boolean;
  }>;
  resourceLinks: DestinationResourceLink[];
  videoLinks: DestinationVideoLink[];
};

const fallbackTransportation = (city: string, country: string) =>
  `${city} can be reached through regional transport corridors in ${country}; check airport and intercity routing for your exact itinerary.`;

const chooseNarrativeText = (
  candidates: Array<string | null | undefined>,
  fallback: string,
  avoid?: string,
) => {
  const cleaned = candidates
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value && value.trim().length > 0));

  const preferred = cleaned.find((value) => value !== avoid);
  return preferred ?? fallback;
};

export const buildVisibleEditorialNarratives = (
  destination: Partial<Pick<Destination, "description" | "overview" | "lifestyle" | "climate" | "transportation" | "introduction" | "heroNarrative" | "lifestyleNarrative" | "climateNarrative" | "transportationNarrative" | "verdict">>,
  researchProfile: Partial<{
    overview: string | null;
    whyPeopleLoveIt: string | null;
    retirementSuitability: string | null;
    feel: string | null;
    climate: string | null;
    transportation: string | null;
  }> | null,
  editorialFallback: { intro: string; follow: string; dek: string; quote: string },
) => {
  const intro = chooseNarrativeText(
    [destination.description, destination.introduction, destination.heroNarrative, researchProfile?.overview],
    editorialFallback.intro,
  );

  const follow = chooseNarrativeText(
    [destination.overview, destination.heroNarrative, researchProfile?.whyPeopleLoveIt, researchProfile?.overview],
    editorialFallback.follow,
    intro,
  );

  const dek = chooseNarrativeText(
    [destination.verdict, destination.lifestyleNarrative, destination.lifestyle, researchProfile?.retirementSuitability, destination.description, destination.overview],
    editorialFallback.dek,
    intro,
  );

  const quote = chooseNarrativeText(
    [researchProfile?.whyPeopleLoveIt, researchProfile?.overview],
    editorialFallback.quote,
    intro,
  );

  const opening = chooseNarrativeText(
    [destination.lifestyle, destination.lifestyleNarrative, researchProfile?.feel, researchProfile?.whyPeopleLoveIt],
    editorialFallback.follow,
    intro,
  );

  const middle = chooseNarrativeText(
    [destination.climate, destination.climateNarrative, researchProfile?.climate],
    editorialFallback.dek,
    opening,
  );

  const closing = chooseNarrativeText(
    [destination.transportation, destination.transportationNarrative, researchProfile?.transportation],
    editorialFallback.follow,
    opening,
  );

  return {
    editorial: { intro, follow, dek, quote },
    magazine: {
      opening,
      middle,
      closing,
    },
  };
};

const canonicalSlugAliases: Record<string, string> = {
  cavtat: "cavtat-croatia",
  hiroshima: "hiroshima-japan",
  kobe: "kobe-japan",
  porto: "porto-portugal",
  nice: "nice-france",
  rome: "rome-italy",
  monpoli: "monopoli-italy",
  monopoli: "monopoli-italy",
  cascais: "cascais-portugal",
  tivat: "tivat-montenegro",
  braga: "braga-portugal",
};

export const resolveDestinationSlug = (slug: string) => {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return slug;
  return canonicalSlugAliases[normalized] ?? normalized;
};

const mapMediaToImages = (rows: DestinationMediaRow[], city: string) => {
  const gallery = rows.filter((item) => item.kind === "gallery" || item.kind === "hero" || item.kind === "thumbnail");
  return gallery.map((item) => ({
    src: item.url,
    alt: item.alt_text || `${city} destination view`,
    caption: item.caption || city,
  }));
};

const applySourceOnlyNarrative = (destination: Destination, slug: string): Destination => {
  const narrative = getSourceOnlyNarrative(slug);
  if (!narrative) return destination;

  return {
    ...destination,
    description: narrative.description,
    overview: narrative.overview,
    climate: narrative.climate,
    lifestyle: narrative.lifestyle,
    transportation: narrative.transportation,
  };
};

const toDestinationFromCatalog = (
  row: DestinationCatalogRow,
  local: Destination | undefined,
  mediaRows: DestinationMediaRow[],
): Destination => {
  const mediaImages = mapMediaToImages(mediaRows, row.city);

  const editorialContent = row.metadata?.editorialContent;
  const researchProfile = row.metadata?.researchProfile ?? local?.researchProfile;
  const sourceOnlyNarrative = getSourceOnlyNarrative(row.slug);

  const destination: Destination = {
    slug: row.slug,
    city: row.city,
    country: row.country,
    emoji: local?.emoji ?? "🌍",
    match: local?.match ?? 78,
    description: sourceOnlyNarrative?.description
      ?? selectEditorialNarrative(
        row.description,
        local?.description,
        `${row.city} is available in the Horizon Atlas destination catalog with curated relocation details.`,
      ),
    overview: sourceOnlyNarrative?.overview
      ?? selectEditorialNarrative(
        row.overview ?? row.description,
        local?.overview,
        `${row.city} is available for relocation research and comparison.`,
      ),
    climate: sourceOnlyNarrative?.climate
      ?? selectEditorialNarrative(
        row.climate_summary,
        local?.climate,
        `Review local seasonality, humidity, and heat profile in ${row.city}.`,
      ),
    lifestyle: sourceOnlyNarrative?.lifestyle
      ?? selectEditorialNarrative(
        row.lifestyle_summary,
        local?.lifestyle,
        `Evaluate neighborhood character, rhythm, and long-stay fit in ${row.city}.`,
      ),
    transportation: sourceOnlyNarrative?.transportation
      ?? selectEditorialNarrative(
        row.transportation_summary,
        local?.transportation,
        fallbackTransportation(row.city, row.country),
      ),
    images: mediaImages.length ? mediaImages : local?.images?.length ? local.images : [],
    tags: local?.tags ?? [],
    memberDetails: row.metadata?.memberDetails ?? local?.memberDetails,
    relocationProfile: row.metadata?.relocationProfile ?? local?.relocationProfile,
    title: editorialContent?.title ?? local?.title,
    subtitle: editorialContent?.subtitle ?? local?.subtitle,
    introduction: editorialContent?.introduction ?? local?.introduction,
    heroNarrative: editorialContent?.heroNarrative ?? local?.heroNarrative,
    lifestyleNarrative: editorialContent?.lifestyleNarrative ?? local?.lifestyleNarrative,
    climateNarrative: editorialContent?.climateNarrative ?? local?.climateNarrative,
    transportationNarrative: editorialContent?.transportationNarrative ?? local?.transportationNarrative,
    verdict: editorialContent?.verdict ?? local?.verdict,
    dayMoments: editorialContent?.dayMoments ?? local?.dayMoments,
    rapidAnswers: editorialContent?.rapidAnswers ?? local?.rapidAnswers,
    coreRelocationQa: editorialContent?.coreRelocationQa ?? local?.coreRelocationQa,
    practicalTopLinks: editorialContent?.practicalTopLinks ?? local?.practicalTopLinks,
    researchProfile: researchProfile,
  };

  const anchoredDestination = applySourceOnlyNarrative(destination, row.slug);

  return {
    ...anchoredDestination,
    ...getDestinationEditorialFields(anchoredDestination),
  };
};

const toMediaAssets = (rows: DestinationMediaRow[], city: string) =>
  rows.map((item) => ({
    kind: item.kind,
    url: item.url,
    altText: item.alt_text || `${city} destination view`,
    caption: item.caption || city,
    isPrimary: Boolean(item.is_primary),
  }));

export async function getDestinationContent(slug: string): Promise<DestinationContent | null> {
  const resolvedSlug = resolveDestinationSlug(slug);
  const local = enrichedDestinations.find((item) => item.slug === resolvedSlug || item.slug === slug);

  if (!isSupabaseConfigured()) {
    if (!local) return null;
    return {
      source: "local",
      destination: applySourceOnlyNarrative(local, resolvedSlug),
      mediaAssets: [],
      resourceLinks: [],
      videoLinks: [],
    };
  }

  try {
    const catalogResponse = await supabaseFetch(
      `/rest/v1/destinations_catalog?select=id,slug,city,country,tier,status,hero_image_url,description,overview,climate_summary,lifestyle_summary,transportation_summary,metadata&slug=eq.${encodeURIComponent(resolvedSlug)}&limit=1`,
      { cache: "no-store" },
    );

    if (!catalogResponse.ok) {
      if (!local) return null;
      return {
        source: "local",
        destination: local,
        mediaAssets: [],
        resourceLinks: [],
        videoLinks: [],
      };
    }

    const rows = (await catalogResponse.json()) as DestinationCatalogRow[];
    const row = rows[0] ?? undefined;

    if (!row) {
      if (!local) return null;
      return {
        source: "local",
        destination: local,
        mediaAssets: [],
        resourceLinks: [],
        videoLinks: [],
      };
    }

    const [mediaResponse, resourcesResponse, videosResponse] = await Promise.all([
      supabaseFetch(
        `/rest/v1/destination_media_assets?select=kind,url,alt_text,caption,is_primary&destination_id=eq.${row.id}&order=sort_order.asc`,
        { cache: "no-store" },
      ),
      supabaseFetch(
        `/rest/v1/destination_resource_links?select=category,label,provider,url&destination_id=eq.${row.id}&order=sort_order.asc`,
        { cache: "no-store" },
      ),
      supabaseFetch(
        `/rest/v1/destination_video_links?select=provider,label,url,embed_url&destination_id=eq.${row.id}&order=sort_order.asc`,
        { cache: "no-store" },
      ),
    ]);

    const mediaRows = mediaResponse.ok ? ((await mediaResponse.json()) as DestinationMediaRow[]) : [];
    const resourceRows = resourcesResponse.ok ? ((await resourcesResponse.json()) as DestinationResourceRow[]) : [];
    const videoRows = videosResponse.ok ? ((await videosResponse.json()) as DestinationVideoRow[]) : [];

    return {
      source: "supabase",
      destination: toDestinationFromCatalog(row, local, mediaRows),
      mediaAssets: toMediaAssets(mediaRows, row.city),
      resourceLinks: resourceRows.map((item) => ({
        category: item.category,
        label: item.label,
        provider: item.provider,
        url: item.url,
      })),
      videoLinks: videoRows.map((item) => ({
        provider: item.provider,
        label: item.label,
        url: item.url,
        embedUrl: item.embed_url,
      })),
    };
  } catch {
    if (!local) return null;
    return {
      source: "local",
      destination: local,
      mediaAssets: [],
      resourceLinks: [],
      videoLinks: [],
    };
  }
}