import { type Destination, type DestinationMemberDetails, destinations } from "./destinations";
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
  metadata: { memberDetails?: DestinationMemberDetails } | null;
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

const mapMediaToImages = (rows: DestinationMediaRow[], city: string) => {
  const gallery = rows.filter((item) => item.kind === "gallery" || item.kind === "hero" || item.kind === "thumbnail");
  return gallery.map((item) => ({
    src: item.url,
    alt: item.alt_text || `${city} destination view`,
    caption: item.caption || city,
  }));
};

const toDestinationFromCatalog = (
  row: DestinationCatalogRow,
  local: Destination | undefined,
  mediaRows: DestinationMediaRow[],
): Destination => {
  const mediaImages = mapMediaToImages(mediaRows, row.city);
  const heroUrl = row.hero_image_url ?? "";

  const fallbackImage = {
    src: heroUrl,
    alt: `${row.city} destination view`,
    caption: row.city,
  };

  return {
    slug: row.slug,
    city: row.city,
    country: row.country,
    emoji: local?.emoji ?? "🌍",
    match: local?.match ?? 78,
    description:
      row.description
      ?? local?.description
      ?? `${row.city} is available in the Horizon Atlas destination catalog with curated relocation details.`,
    overview: row.overview ?? local?.overview ?? row.description ?? `${row.city} is available for relocation research and comparison.`,
    climate: row.climate_summary ?? local?.climate ?? `Review local seasonality, humidity, and heat profile in ${row.city}.`,
    lifestyle: row.lifestyle_summary ?? local?.lifestyle ?? `Evaluate neighborhood character, rhythm, and long-stay fit in ${row.city}.`,
    transportation: row.transportation_summary ?? local?.transportation ?? fallbackTransportation(row.city, row.country),
    images: mediaImages.length ? mediaImages : local?.images?.length ? local.images : [fallbackImage],
    tags: local?.tags ?? [],
    memberDetails: row.metadata?.memberDetails ?? local?.memberDetails,
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
  const local = destinations.find((item) => item.slug === slug);

  if (!isSupabaseConfigured()) {
    if (!local) return null;
    return {
      source: "local",
      destination: local,
      mediaAssets: [],
      resourceLinks: [],
      videoLinks: [],
    };
  }

  try {
    const catalogResponse = await supabaseFetch(
      `/rest/v1/destinations_catalog?select=id,slug,city,country,tier,status,hero_image_url,description,overview,climate_summary,lifestyle_summary,transportation_summary,metadata&slug=eq.${encodeURIComponent(slug)}&limit=1`,
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
    const row = rows[0];

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