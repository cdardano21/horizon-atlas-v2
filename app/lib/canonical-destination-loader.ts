import { destinations as localDestinations } from "./destinations";
import { buildDestinationKnowledgeProfile } from "./destination-knowledge-engine";
import type { CanonicalDestination, CanonicalDestinationBudget, CanonicalDestinationCostProfile, CanonicalDestinationKnowledgeProfile, CanonicalDestinationMedia, CanonicalDestinationResource, ImportedVerifiedDestinationFacts, NeighborhoodIntelligenceGroup, PremiumEditorialContent } from "./canonical-destination-model";
import { buildNeighborhoodIntelligenceSeedData } from "./neighborhood-intelligence-seed-data";
import { getPremiumV2RuntimeModuleDefinitions } from "./premium-v2-storage";
import { isSupabaseConfigured, supabaseFetch } from "./supabase";
import { getWorkbookFallbackDestinationData } from "./workbook-new-braunfels-fallback";
import { loadPremiumWorkbookDestinationData, type PremiumWorkbookNormalizedDestinationData } from "./workbook-runtime-loader";
import { loadPersistedDestinationFromRuntime } from "./runtime/persisted-destination-read-runtime";
import type { NormalizedPersistedDestinationBundle } from "./persistence/v31/materialize-stored-destination-state";
import type { ResolvedDestinationIdentity } from "./persistence/v31/types";

const normalizeTextValue = (value: string | null | undefined) => {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return trimmed;
};

const normalizeWikimediaMediaUrl = (value: string | null | undefined) => {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";

  try {
    const parsed = new URL(trimmed);
    const hostname = parsed.hostname.toLowerCase();
    if (hostname !== "commons.wikimedia.org" && hostname !== "www.commons.wikimedia.org") {
      return trimmed;
    }

    // Special:FilePath is already a valid, direct-serving hotlink (redirects to the real upload.wikimedia.org file) — leave it untouched.
    if (/\/wiki\/Special:FilePath\//.test(parsed.pathname)) {
      return trimmed;
    }

    // Plain /wiki/File:... URLs are HTML article pages, not image bytes — redirect them through Special:FilePath on the same domain instead of guessing a hash path.
    const fileMatch = parsed.pathname.match(/\/wiki\/File:(.+)$/);
    if (fileMatch?.[1]) {
      return `https://commons.wikimedia.org/wiki/Special:FilePath/${fileMatch[1]}`;
    }

    return trimmed;
  } catch {
    return trimmed;
  }
};

const normalizeMediaUrlItem = <T extends { url?: string; altText?: string; caption?: string; kind?: string; isPrimary?: boolean; sourceUrl?: string; attribution?: string; license?: string }>(item: T) => ({
  ...item,
  url: normalizeWikimediaMediaUrl(item.url),
});

const debugCanonicalDestinationBranches = process.env.HA_CANONICAL_ROUTE_DEBUG === "1";

const logCanonicalDestinationBranch = (details: Record<string, unknown>) => {
  if (!debugCanonicalDestinationBranches) return;
  console.info("[canonical-route-debug]", JSON.stringify(details));
};

const looksLikeGenericRowContent = (value: string | null | undefined) => {
  if (typeof value !== "string") return false;
  const lowered = value.toLowerCase();
  return lowered.includes("generic") || lowered.includes("placeholder") || lowered.includes("example") || lowered.includes("sample");
};

const selectPreferredTextValue = (workbookValue: string | null | undefined, fallbackValue: string | null | undefined, rowValue: string | null | undefined) => {
  const workbookText = normalizeTextValue(workbookValue);
  if (workbookText) return workbookText;

  const fallbackText = normalizeTextValue(fallbackValue);
  const rowText = normalizeTextValue(rowValue);
  if (!rowText) return fallbackText;
  if (looksLikeGenericRowContent(rowText)) return fallbackText || rowText;
  if (fallbackText && looksLikeGenericRowContent(fallbackText)) return rowText || fallbackText;
  return rowText || fallbackText;
};

const tokenizeIdentityValue = (value: string | null | undefined) => {
  if (typeof value !== "string") return [];
  return Array.from(new Set(value.toLowerCase().replace(/[^a-z0-9]+/g, " ").split(/\s+/).filter(Boolean)));
};

const buildDestinationIdentityTokens = (destination: { city?: string; country?: string; title?: string; slug?: string }) => {
  const tokens = new Set<string>();
  [destination.city, destination.title, destination.country, destination.slug, destination.slug?.replace(/-/g, " ")].forEach((value) => {
    tokenizeIdentityValue(value).forEach((token) => tokens.add(token));
  });
  return Array.from(tokens);
};

const looksLikeGenericMediaItem = <T extends { url?: string; altText?: string; caption?: string; kind?: string; isPrimary?: boolean; sourceUrl?: string; attribution?: string; license?: string }>(item: T, normalizedTokens: string[]) => {
  const combined = [item.altText, item.caption, item.url, item.kind, item.sourceUrl, item.attribution, item.license].filter(Boolean).map(String).join(" ").toLowerCase();
  const genericPhrases = ["scenic", "river view", "waterfront", "skyline", "city skyline", "placeholder", "generic", "view"];
  const hasDestinationToken = normalizedTokens.some((token) => combined.includes(token));
  const hasVerifiedSourceMetadata = Boolean(item.sourceUrl?.trim() || item.attribution?.trim() || item.license?.trim());
  if (hasDestinationToken || hasVerifiedSourceMetadata) return false;
  return genericPhrases.some((phrase) => combined.includes(phrase));
};

const looksLikeStockImageUrl = (value: string | null | undefined) => {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;

  try {
    const parsed = new URL(trimmed);
    return ["images.unsplash.com", "source.unsplash.com", "unsplash.com", "pixabay.com", "pexels.com", "flickr.com"].includes(parsed.hostname.toLowerCase()) || parsed.hostname.toLowerCase().endsWith(".unsplash.com");
  } catch {
    return false;
  }
};

const looksLikeImageAssetUrl = (value: string | null | undefined) => {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;

  try {
    const parsed = new URL(trimmed);
    const pathname = parsed.pathname.toLowerCase();
    const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".bmp", ".svg"];
    const hasImageExtension = imageExtensions.some((extension) => pathname.endsWith(extension));
    const hasImagePathHint = pathname.includes("/image") || pathname.includes("/images") || pathname.includes("/photo") || pathname.includes("/photos") || pathname.includes("/media") || pathname.includes("/img");
    const hasImageQueryHint = parsed.searchParams.has("img") || parsed.searchParams.has("image") || parsed.searchParams.has("photo") || parsed.searchParams.has("src");
    return hasImageExtension || hasImagePathHint || hasImageQueryHint;
  } catch {
    return false;
  }
};

const IANA_RESERVED_EXAMPLE_HOSTNAMES = new Set(["example.com", "example.org", "example.net", "www.example.com", "www.example.org", "www.example.net"]);

const isReservedExampleDomainUrl = (value: string | null | undefined) => {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    return IANA_RESERVED_EXAMPLE_HOSTNAMES.has(new URL(value.trim()).hostname.toLowerCase());
  } catch {
    return false;
  }
};

const scoreDestinationMediaItem = <T extends { url?: string; altText?: string; caption?: string; kind?: string; isPrimary?: boolean; sourceUrl?: string; attribution?: string; license?: string }>(item: T, normalizedTokens: string[]) => {
  const combined = [item.altText, item.caption, item.url, item.kind, item.sourceUrl, item.attribution, item.license].filter(Boolean).map(String).join(" ").toLowerCase();
  const hasDestinationToken = normalizedTokens.some((token) => combined.includes(token));
  const hasVerifiedSourceMetadata = Boolean(item.sourceUrl?.trim() || item.attribution?.trim() || item.license?.trim());
  const isPrimary = Boolean(item.isPrimary);
  const genericPenalty = looksLikeGenericMediaItem(item, normalizedTokens) ? -3 : 0;
  const stockPenalty = looksLikeStockImageUrl(item.url) ? -2 : 0;
  const hasImageAssetEvidence = looksLikeImageAssetUrl(item.url) && !looksLikeGenericMediaItem(item, normalizedTokens) && !looksLikeStockImageUrl(item.url);
  const score = Number(hasDestinationToken) * 2 + Number(isPrimary) + Number(hasVerifiedSourceMetadata) * 1.5 + Number(hasImageAssetEvidence) + genericPenalty + stockPenalty;

  return { item, score, hasDestinationToken, hasVerifiedSourceMetadata, isPrimary, hasImageAssetEvidence };
};

const filterDestinationSpecificMedia = <T extends { url?: string; altText?: string; caption?: string; kind?: string; isPrimary?: boolean; sourceUrl?: string; attribution?: string; license?: string }>(media: T[], identityTokens: string[]) => {
  const normalizedTokens = identityTokens.filter(Boolean);
  if (normalizedTokens.length === 0) {
    return media.filter((item) => Boolean(item.url?.trim())).slice(0, 5);
  }

  const scored = media.map((item) => scoreDestinationMediaItem(item, normalizedTokens));
  const bestScore = Math.max(...scored.map(({ score }) => score), 0);

  const accepted = scored.filter(({ item, score, hasDestinationToken, hasVerifiedSourceMetadata, isPrimary, hasImageAssetEvidence }) => {
    if (!item.url?.trim()) return false;
    if (hasDestinationToken) return true;

    const isGenericPlaceholder = looksLikeGenericMediaItem(item, normalizedTokens);
    if (isGenericPlaceholder) return false;

    const hasPositiveEvidence = hasVerifiedSourceMetadata || isPrimary || hasImageAssetEvidence;
    if (score < 1 && !hasPositiveEvidence) return false;
    if (media.length === 1 && (hasPositiveEvidence || score >= 0)) return true;
    if (hasPositiveEvidence) return true;
    if (isPrimary && (score === bestScore || bestScore <= 0)) return true;
    if (score >= 1 && score === bestScore) return true;
    return false;
  });

  const ranked = accepted.sort((left, right) => right.score - left.score || Number(right.isPrimary) - Number(left.isPrimary));
  const primaryReference = ranked[0]?.item;

  return ranked.map(({ item }) => ({
    ...item,
    isPrimary: Boolean(primaryReference && item.url?.trim() && item.url.trim() === primaryReference.url?.trim()),
  })).slice(0, 5);
};

const isWorkbookFallbackMediaDestination = (slug: string) => {
  const normalized = normalizeLookupToken(slug);
  return ["new-braunfels", "new-braunfels-texas", "new-braunfels-tx-us", "new-braunfels-texas-united-states"].includes(normalized);
};

const mergeDestinationSpecificMedia = <T extends { url?: string; altText?: string; caption?: string; kind?: string; isPrimary?: boolean; sourceUrl?: string; attribution?: string; license?: string }>(primaryMedia: T[], fallbackMedia: T[], identityTokens: string[], allowFallbackSupplementation: boolean = false) => {
  const filteredPrimaryMedia = filterDestinationSpecificMedia(primaryMedia, identityTokens);
  if (!allowFallbackSupplementation || filteredPrimaryMedia.length >= 3 || fallbackMedia.length === 0) {
    return filteredPrimaryMedia;
  }

  const mergedMedia = [...filteredPrimaryMedia];
  const seenUrls = new Set<string>();
  for (const item of filteredPrimaryMedia) {
    if (item.url?.trim()) {
      seenUrls.add(item.url.trim());
    }
  }

  for (const item of fallbackMedia) {
    if (!item.url?.trim()) continue;
    const normalizedUrl = item.url.trim();
    if (seenUrls.has(normalizedUrl)) continue;
    mergedMedia.push(item);
    seenUrls.add(normalizedUrl);
    if (mergedMedia.length >= 5) break;
  }

  return filterDestinationSpecificMedia(mergedMedia, identityTokens);
};

const pickEditorialTextValue = (baseValue: string | null | undefined, fallbackValue: string | null | undefined, fallbackSourceValue: string | null | undefined) => {
  const fallbackText = normalizeTextValue(fallbackValue);
  if (fallbackText && !looksLikeGenericRowContent(fallbackText)) return fallbackText;

  const baseText = normalizeTextValue(baseValue);
  if (baseText && !looksLikeGenericRowContent(baseText)) return baseText;

  const sourceText = normalizeTextValue(fallbackSourceValue);
  if (sourceText && !looksLikeGenericRowContent(sourceText)) return sourceText;

  return fallbackText || baseText || sourceText;
};

const pickEditorialStringArray = (baseValues: string[] | undefined, fallbackValues: string[] | undefined) => {
  const fallback = fallbackValues?.filter(Boolean) ?? [];
  if (fallback.length > 0) return fallback;

  const base = baseValues?.filter(Boolean) ?? [];
  return base.length > 0 ? base : undefined;
};

const buildWorkbookPremiumEditorialContent = (workbookData: PremiumWorkbookNormalizedDestinationData | null | undefined, fallbackEditorialContent?: PremiumEditorialContent) => {
  const base = workbookData?.premiumEditorialContent ?? {};
  const fallback = fallbackEditorialContent ?? {};

  return {
    heroIntroduction: pickEditorialTextValue(base.heroIntroduction, fallback.heroIntroduction, workbookData?.heroNarrative),
    overviewArticle: pickEditorialTextValue(base.overviewArticle, fallback.overviewArticle, workbookData?.overview),
    neighborhoodsArticle: pickEditorialTextValue(base.neighborhoodsArticle, fallback.neighborhoodsArticle, undefined),
    dailyLifeArticle: pickEditorialTextValue(base.dailyLifeArticle, fallback.dailyLifeArticle, workbookData?.dailyLife),
    climateArticle: pickEditorialTextValue(base.climateArticle, fallback.climateArticle, workbookData?.climate),
    transportationArticle: pickEditorialTextValue(base.transportationArticle, fallback.transportationArticle, workbookData?.transportation),
    costOfLivingArticle: pickEditorialTextValue(base.costOfLivingArticle, fallback.costOfLivingArticle, workbookData?.costOfLiving),
    healthcareArticle: pickEditorialTextValue(base.healthcareArticle, fallback.healthcareArticle, workbookData?.healthcare),
    retirementGuide: pickEditorialTextValue(base.retirementGuide, fallback.retirementGuide, undefined),
    familyGuide: pickEditorialTextValue(base.familyGuide, fallback.familyGuide, undefined),
    digitalNomadGuide: pickEditorialTextValue(base.digitalNomadGuide, fallback.digitalNomadGuide, undefined),
    whyPeopleLoveIt: pickEditorialStringArray(base.whyPeopleLoveIt, fallback.whyPeopleLoveIt),
    majorStrengths: pickEditorialStringArray(base.majorStrengths, fallback.majorStrengths),
    majorDrawbacks: pickEditorialStringArray(base.majorDrawbacks, fallback.majorDrawbacks),
    bestFor: pickEditorialStringArray(base.bestFor, fallback.bestFor),
    prosAndCons: base.prosAndCons ?? fallback.prosAndCons,
  } satisfies PremiumEditorialContent;
};

const buildFallbackResources = (city: string, country: string): CanonicalDestinationResource[] => {
  return [
    { category: "official", label: `${city} official tourism`, provider: "official", url: `https://www.google.com/search?q=${encodeURIComponent(`${city} ${country} official tourism`)}` },
    { category: "wikipedia", label: `${city} on Wikipedia`, provider: "wikipedia", url: `https://en.wikipedia.org/wiki/${encodeURIComponent(city)}` },
    { category: "maps", label: `${city} on Google Maps`, provider: "google", url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${city} ${country}`)}` },
    { category: "earth", label: `${city} in Google Earth`, provider: "google", url: `https://earth.google.com/web/search/${encodeURIComponent(`${city} ${country}`)}` },
  ];
};

const buildFallbackMedia = (city: string, country: string): CanonicalDestinationMedia[] => {
  return [
    {
      kind: "image",
      url: `https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80`,
      altText: `${city} skyline`,
      caption: `${city}, ${country}`,
      isPrimary: true,
    },
    {
      kind: "image",
      url: `https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80`,
      altText: `${city} waterfront`,
      caption: `${city} waterfront`,
      isPrimary: false,
    },
  ];
};

const buildFallbackBudgets = (city: string): CanonicalDestinationBudget[] => {
  return [
    { label: "Single resident", amount: "$1,600–$2,800/month", note: `A practical long-stay budget for ${city} with a simple apartment and regular local dining.` },
    { label: "Couple", amount: "$2,500–$4,200/month", note: `A comfortable range with better housing, dining flexibility, and occasional regional travel.` },
  ];
};

// Permanent, intentionally narrow allowlist for the 3 golden regression-fixture pilots only.
// This is NOT the mechanism future destinations use to reach the persisted-runtime path -
// see resolvePersistedRuntimeDestinationIdentity below, which prefers the real destination_key
// column for every destination. This map exists solely to (a) preserve the pilots' exact current
// workbook-assisted rendering behavior, and (b) let the 2 pilot catalog rows that do not yet have
// destination_key populated in Supabase (see repo docs) still resolve correctly without a data write.
// Do not add future/non-pilot destinations to this map.
const GOLDEN_PILOT_FIXTURE_SLUG_ALIASES = new Map<string, string>([
  ["lisbon-portugal", "lisbon-pt"],
  ["lisbon-pt", "lisbon-pt"],
  ["new-braunfels-texas-united-states", "new-braunfels-tx-us"],
  ["new-braunfels-tx-us", "new-braunfels-tx-us"],
  ["summerlin-nevada-united-states", "summerlin-nv-us"],
  ["summerlin-las-vegas-nevada", "summerlin-nv-us"],
  ["summerlin-nv-us", "summerlin-nv-us"],
]);

const resolvePersistedRuntimeDestinationIdentity = (slug: string, row: Record<string, unknown> | undefined): ResolvedDestinationIdentity | null => {
  const normalizedSlug = slug.trim().toLowerCase();
  // Any destination with a real destination_key on its catalog row can use the persisted-runtime
  // path generically - no source-code allowlist entry is required for new destinations. The golden
  // pilot fixture map is only consulted as a fallback for the 2 pilot rows whose destination_key
  // column is not yet populated in Supabase.
  const destinationKey = (typeof row?.destination_key === "string" && row.destination_key.trim() ? row.destination_key.trim() : "")
    || GOLDEN_PILOT_FIXTURE_SLUG_ALIASES.get(normalizedSlug)
    || "";

  if (!destinationKey) {
    return null;
  }

  const destinationId = typeof row?.destination_id === "string" && row.destination_id.trim()
    ? row.destination_id.trim()
    : typeof row?.id === "string" && row.id.trim()
      ? row.id.trim()
      : "";

  return {
    destinationKey,
    destinationId,
  };
};

// A rehearsal/dry-run persisted bundle can contain a single placeholder row (e.g. one generic
// neighborhood) that would otherwise silently win over much richer authoritative workbook data.
const selectRicherPersistedArraySource = <T>(persisted: T[], workbook: T[], fallback: T[]): T[] => {
  if (workbook.length > persisted.length) return workbook;
  if (persisted.length > 0) return persisted;
  if (workbook.length > 0) return workbook;
  return fallback;
};

const buildCanonicalDestinationFromPersistedBundle = (
  slug: string,
  fallbackDestination: CanonicalDestination,
  bundle: NormalizedPersistedDestinationBundle,
  workbookData?: PremiumWorkbookNormalizedDestinationData | null,
): CanonicalDestination => {
  const city = normalizeTextValue(bundle.identity.city) || fallbackDestination.city;
  const country = normalizeTextValue(bundle.identity.country) || fallbackDestination.country;
  const title = normalizeTextValue(bundle.identity.name) || fallbackDestination.title;
  const subtitle = [city || title, country].filter(Boolean).join(", ");
  const heroNarrative = normalizeTextValue(bundle.editorial.shortDescription) || normalizeTextValue(workbookData?.heroNarrative) || fallbackDestination.heroNarrative;
  const overview = normalizeTextValue(bundle.editorial.longDescription) || normalizeTextValue(workbookData?.overview) || fallbackDestination.overview;
  const editorial = normalizeTextValue(bundle.editorial.longDescription) || normalizeTextValue(workbookData?.editorial) || fallbackDestination.editorial;

  const persistedMedia = bundle.media
    .map((item) => ({
      kind: normalizeTextValue(item.kind) || "image",
      url: normalizeTextValue(item.url) || "",
      altText: normalizeTextValue(item.altText) || title || city || "Destination media",
      caption: normalizeTextValue(item.caption) || title || city || "Destination media",
      isPrimary: false,
    }))
    .filter((item) => item.url && !isReservedExampleDomainUrl(item.url));
  const workbookMedia = (workbookData?.media ?? [])
    .map((item) => ({
      kind: normalizeTextValue(item.kind) || "image",
      url: normalizeTextValue(item.url) || "",
      altText: normalizeTextValue(item.altText) || title || city || "Destination media",
      caption: normalizeTextValue(item.caption) || title || city || "Destination media",
      isPrimary: false,
    }))
    .filter((item) => item.url);
  const media = persistedMedia.length > 0 ? persistedMedia : workbookMedia.length > 0 ? workbookMedia : (fallbackDestination.media ?? []).map((item) => ({ ...item, isPrimary: false }));

  const primaryMedia = media[0] ? [{ ...media[0], isPrimary: true }] : [];
  const normalizedMedia = [...primaryMedia, ...media.slice(1)];
  const persistedResources = bundle.resources
    .map((item) => ({
      category: normalizeTextValue(item.category) || "resource",
      label: normalizeTextValue(item.name) || "Imported resource",
      provider: null,
      url: normalizeTextValue(item.url) || "",
    }))
    .filter((item) => item.url);
  const workbookResources = (workbookData?.resources ?? [])
    .map((item) => ({
      category: normalizeTextValue(item.category) || "resource",
      label: normalizeTextValue(item.label) || "Imported resource",
      provider: item.provider ?? null,
      url: normalizeTextValue(item.url) || "",
    }))
    .filter((item) => item.url);
  const resources = selectRicherPersistedArraySource(persistedResources, workbookResources, fallbackDestination.resources ?? []);

  const persistedNeighborhoods = bundle.neighborhoods
    .map((item) => normalizeTextValue(item.name))
    .filter(Boolean);
  const workbookNeighborhoods = (workbookData?.neighborhoods ?? [])
    .map((item) => normalizeTextValue(item.name))
    .filter(Boolean);
  const neighborhoods = selectRicherPersistedArraySource(persistedNeighborhoods, workbookNeighborhoods, fallbackDestination.neighborhoods ?? []);
  const neighborhoodIntelligence = buildWorkbookNeighborhoodIntelligence(workbookData) ?? fallbackDestination.neighborhoodIntelligence;

  const premiumEditorialContent = {
    ...fallbackDestination.premiumEditorialContent,
    heroIntroduction: heroNarrative || fallbackDestination.premiumEditorialContent?.heroIntroduction,
    overviewArticle: overview || fallbackDestination.premiumEditorialContent?.overviewArticle,
  };

  const mergedKnowledgeProfile = mergeKnowledgeProfile(
    workbookData?.knowledgeProfile,
    fallbackDestination.knowledgeProfile,
  );

  return {
    ...fallbackDestination,
    slug: normalizeTextValue(bundle.identity.slug) || slug,
    city,
    country,
    title,
    subtitle,
    heroNarrative,
    overview,
    editorial,
    resources,
    structuredResources: resources,
    videos: [],
    media: normalizedMedia,
    heroImages: normalizedMedia,
    mediaGallery: normalizedMedia,
    neighborhoods,
    premiumEditorialContent,
    knowledgeProfile: mergedKnowledgeProfile,
    neighborhoodIntelligence,
  };
};

const buildFallbackCostProfile = (city: string, costOfLiving: string, budgets: CanonicalDestinationBudget[]): CanonicalDestinationCostProfile => ({
  summary: costOfLiving || `A practical cost-of-living profile for ${city} that balances housing, dining, transport, and neighborhood choice.`,
  currency: "USD",
  methodology: "Modeled from a practical long-stay household budget and typical city expenses.",
  confidence: "medium",
  assumptions: ["Single resident or small household", "Neighborhood choice affects the final monthly spend"],
  budgets: budgets.map((budget) => ({ label: budget.label, amount: budget.amount, note: budget.note })),
  categories: [
    { key: "housing", label: "Housing", amount: "$1,200–$2,200/month", note: "Apartment or condo budget in a practical district." },
    { key: "food", label: "Food", amount: "$350–$700/month", note: "Groceries and local dining mix." },
    { key: "transport", label: "Transport", amount: "$100–$250/month", note: "Transit, occasional rides, and local travel." },
  ],
});

const parseStringArray = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  return value.filter((item): item is string => typeof item === "string");
};

const parseKnowledgeProfile = (value: unknown): CanonicalDestinationKnowledgeProfile | undefined => {
  if (!value || typeof value !== "object") return undefined;
  const source = value as Record<string, unknown>;
  return {
    officialName: typeof source.officialName === "string" ? source.officialName : undefined,
    country: typeof source.country === "string" ? source.country : undefined,
    adminRegion: typeof source.adminRegion === "string" ? source.adminRegion : undefined,
    latitude: typeof source.latitude === "string" ? source.latitude : undefined,
    longitude: typeof source.longitude === "string" ? source.longitude : undefined,
    population: typeof source.population === "string" ? source.population : undefined,
    metroPopulation: typeof source.metroPopulation === "string" ? source.metroPopulation : undefined,
    elevation: typeof source.elevation === "string" ? source.elevation : undefined,
    timeZone: typeof source.timeZone === "string" ? source.timeZone : undefined,
    climateClassification: typeof source.climateClassification === "string" ? source.climateClassification : undefined,
    rainfall: typeof source.rainfall === "string" ? source.rainfall : undefined,
    sunshineHours: typeof source.sunshineHours === "string" ? source.sunshineHours : undefined,
    humidity: typeof source.humidity === "string" ? source.humidity : undefined,
    airQuality: typeof source.airQuality === "string" ? source.airQuality : undefined,
    walkability: typeof source.walkability === "string" ? source.walkability : undefined,
    bikeFriendliness: typeof source.bikeFriendliness === "string" ? source.bikeFriendliness : undefined,
    publicTransportation: typeof source.publicTransportation === "string" ? source.publicTransportation : undefined,
    majorAirports: parseStringArray(source.majorAirports),
    drivingConvenience: typeof source.drivingConvenience === "string" ? source.drivingConvenience : undefined,
    internetSpeed: typeof source.internetSpeed === "string" ? source.internetSpeed : undefined,
    cellCoverage: typeof source.cellCoverage === "string" ? source.cellCoverage : undefined,
    safety: typeof source.safety === "string" ? source.safety : undefined,
    crime: typeof source.crime === "string" ? source.crime : undefined,
    healthcareQuality: typeof source.healthcareQuality === "string" ? source.healthcareQuality : undefined,
    majorHospitals: parseStringArray(source.majorHospitals),
    emergencyCare: typeof source.emergencyCare === "string" ? source.emergencyCare : undefined,
    costOfLiving: typeof source.costOfLiving === "string" ? source.costOfLiving : undefined,
    apartmentRent: typeof source.apartmentRent === "string" ? source.apartmentRent : undefined,
    homePrices: typeof source.homePrices === "string" ? source.homePrices : undefined,
    propertyTaxes: typeof source.propertyTaxes === "string" ? source.propertyTaxes : undefined,
    incomeTaxes: typeof source.incomeTaxes === "string" ? source.incomeTaxes : undefined,
    salesTaxes: typeof source.salesTaxes === "string" ? source.salesTaxes : undefined,
    utilities: typeof source.utilities === "string" ? source.utilities : undefined,
    groceryCosts: typeof source.groceryCosts === "string" ? source.groceryCosts : undefined,
    diningCosts: typeof source.diningCosts === "string" ? source.diningCosts : undefined,
    transportationCosts: typeof source.transportationCosts === "string" ? source.transportationCosts : undefined,
    healthcareCosts: typeof source.healthcareCosts === "string" ? source.healthcareCosts : undefined,
    bestNeighborhoods: parseStringArray(source.bestNeighborhoods),
    luxuryNeighborhoods: parseStringArray(source.luxuryNeighborhoods),
    budgetNeighborhoods: parseStringArray(source.budgetNeighborhoods),
    familyNeighborhoods: parseStringArray(source.familyNeighborhoods),
    digitalNomadNeighborhoods: parseStringArray(source.digitalNomadNeighborhoods),
    retirementNeighborhoods: parseStringArray(source.retirementNeighborhoods),
    beaches: parseStringArray(source.beaches),
    mountains: parseStringArray(source.mountains),
    lakes: parseStringArray(source.lakes),
    parks: parseStringArray(source.parks),
    hiking: parseStringArray(source.hiking),
    golf: parseStringArray(source.golf),
    museums: parseStringArray(source.museums),
    art: parseStringArray(source.art),
    architecture: parseStringArray(source.architecture),
    festivals: parseStringArray(source.festivals),
    sports: parseStringArray(source.sports),
    nightlife: parseStringArray(source.nightlife),
    restaurants: parseStringArray(source.restaurants),
    coffeeShops: parseStringArray(source.coffeeShops),
    shopping: parseStringArray(source.shopping),
    universities: parseStringArray(source.universities),
    economy: typeof source.economy === "string" ? source.economy : undefined,
    majorEmployers: parseStringArray(source.majorEmployers),
    nearbyWeekendTrips: parseStringArray(source.nearbyWeekendTrips),
    airportsWithDirectFlights: parseStringArray(source.airportsWithDirectFlights),
    visaInfo: typeof source.visaInfo === "string" ? source.visaInfo : undefined,
    residencyInfo: typeof source.residencyInfo === "string" ? source.residencyInfo : undefined,
    retirementSuitability: typeof source.retirementSuitability === "string" ? source.retirementSuitability : undefined,
    familySuitability: typeof source.familySuitability === "string" ? source.familySuitability : undefined,
    digitalNomadSuitability: typeof source.digitalNomadSuitability === "string" ? source.digitalNomadSuitability : undefined,
    lgbtqFriendliness: typeof source.lgbtqFriendliness === "string" ? source.lgbtqFriendliness : undefined,
    accessibility: typeof source.accessibility === "string" ? source.accessibility : undefined,
    localTransportation: typeof source.localTransportation === "string" ? source.localTransportation : undefined,
    healthcareRankings: typeof source.healthcareRankings === "string" ? source.healthcareRankings : undefined,
    climateRisks: typeof source.climateRisks === "string" ? source.climateRisks : undefined,
    naturalDisasterRisks: typeof source.naturalDisasterRisks === "string" ? source.naturalDisasterRisks : undefined,
  };
};

const mergeKnowledgeProfile = (
  primaryProfile: CanonicalDestinationKnowledgeProfile | undefined,
  fallbackProfile: CanonicalDestinationKnowledgeProfile | undefined,
): CanonicalDestinationKnowledgeProfile | undefined => {
  if (!primaryProfile) return fallbackProfile;
  if (!fallbackProfile) return primaryProfile;

  const mergedProfile = { ...fallbackProfile } as CanonicalDestinationKnowledgeProfile;
  for (const [key, value] of Object.entries(primaryProfile) as Array<[keyof CanonicalDestinationKnowledgeProfile, unknown]>) {
    if (typeof value === "string") {
      if (value.trim()) {
        (mergedProfile[key] as string | undefined) = value;
      }
      continue;
    }

    if (Array.isArray(value)) {
      const cleanedValues = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
      if (cleanedValues.length > 0) {
        (mergedProfile[key] as string[] | undefined) = cleanedValues;
      }
      continue;
    }

    if (value != null) {
      (mergedProfile[key] as unknown) = value;
    }
  }

  return mergedProfile;
};

const parseImportedVerifiedFacts = (value: unknown): ImportedVerifiedDestinationFacts | undefined => {
  if (!value || typeof value !== "object") return undefined;
  const source = value as Record<string, unknown>;
  return {
    destination: source.destination && typeof source.destination === "object" ? source.destination as Record<string, unknown> : undefined,
    neighborhoods: Array.isArray(source.neighborhoods) ? source.neighborhoods as Array<Record<string, unknown>> : undefined,
    places: Array.isArray(source.places) ? source.places as Array<Record<string, unknown>> : undefined,
    resources: Array.isArray(source.resources) ? source.resources as Array<Record<string, unknown>> : undefined,
    media: Array.isArray(source.media) ? source.media as Array<Record<string, unknown>> : undefined,
  };
};

const normalizeLookupToken = (value: string | null | undefined) => {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
};

const resolveWorkbookMediaForSlug = (slug: string, workbookMedia: CanonicalDestinationMedia[]) => {
  if (workbookMedia.length > 0) {
    return workbookMedia;
  }

  const workbookFallback = getWorkbookFallbackDestinationData(slug);
  if (workbookFallback?.media?.length) {
    return workbookFallback.media;
  }

  return workbookMedia;
};

const buildDestinationSlugCandidates = (slug: string) => {
  const normalized = normalizeLookupToken(slug);
  const tokens = normalized.split("-").filter(Boolean);
  const candidates = new Set<string>([normalized]);

  if (tokens.length > 0) {
    candidates.add(tokens[0]);
    if (tokens.length > 1) {
      candidates.add(tokens.slice(0, 2).join("-"));
    }
  }

  const withoutCountrySuffix = normalized.replace(/-(?:us|usa|uk|gb|ca|canada|au|aus|nz|mx|de|fr|es|it|pt|jp|cn|kr|sg|ae|in|br|co|cl|za|se|no|dk|nl|be|gr|hr|ch|at|ie|fi|pl|cz|hu|ro|bg|rs|si|sk|tr|il|sa|eg|ma|my|th|vn|ph|id|pk|ng|ke|tz)$/g, "");
  if (withoutCountrySuffix && withoutCountrySuffix !== normalized) {
    candidates.add(withoutCountrySuffix);
  }

  return Array.from(candidates).filter(Boolean);
};

const matchDestinationRowToSlug = (row: Record<string, unknown>, slug: string) => {
  const candidates = buildDestinationSlugCandidates(slug);
  const haystacks = [
    String(row.slug ?? ""),
    String(row.destination_slug ?? ""),
    String(row.destination_key ?? ""),
    String(row.title ?? ""),
    String(row.city ?? ""),
    String(row.subtitle ?? ""),
  ];

  const normalizedHaystacks = haystacks.map((value) => normalizeLookupToken(value)).filter(Boolean);

  return candidates.some((candidate) => normalizedHaystacks.some((haystack) => {
    if (haystack === candidate) return true;
    if (haystack.startsWith(candidate)) return true;
    if (candidate.startsWith(haystack)) return true;
    return haystack.includes(candidate) || candidate.includes(haystack);
  }));
};

const parsePremiumEditorialContent = (value: unknown): PremiumEditorialContent | undefined => {
  if (!value || typeof value !== "object") return undefined;
  const source = value as Record<string, unknown>;
  return {
    heroIntroduction: typeof source.heroIntroduction === "string" ? source.heroIntroduction : undefined,
    whyPeopleLoveIt: Array.isArray(source.whyPeopleLoveIt) ? source.whyPeopleLoveIt.filter((item): item is string => typeof item === "string") : undefined,
    majorStrengths: Array.isArray(source.majorStrengths) ? source.majorStrengths.filter((item): item is string => typeof item === "string") : undefined,
    majorDrawbacks: Array.isArray(source.majorDrawbacks) ? source.majorDrawbacks.filter((item): item is string => typeof item === "string") : undefined,
    bestFor: Array.isArray(source.bestFor) ? source.bestFor.filter((item): item is string => typeof item === "string") : undefined,
    overviewArticle: typeof source.overviewArticle === "string" ? source.overviewArticle : undefined,
    neighborhoodsArticle: typeof source.neighborhoodsArticle === "string" ? source.neighborhoodsArticle : undefined,
    dailyLifeArticle: typeof source.dailyLifeArticle === "string" ? source.dailyLifeArticle : undefined,
    climateArticle: typeof source.climateArticle === "string" ? source.climateArticle : undefined,
    transportationArticle: typeof source.transportationArticle === "string" ? source.transportationArticle : undefined,
    costOfLivingArticle: typeof source.costOfLivingArticle === "string" ? source.costOfLivingArticle : undefined,
    healthcareArticle: typeof source.healthcareArticle === "string" ? source.healthcareArticle : undefined,
    retirementGuide: typeof source.retirementGuide === "string" ? source.retirementGuide : undefined,
    familyGuide: typeof source.familyGuide === "string" ? source.familyGuide : undefined,
    digitalNomadGuide: typeof source.digitalNomadGuide === "string" ? source.digitalNomadGuide : undefined,
    prosAndCons: typeof source.prosAndCons === "object" && source.prosAndCons
      ? {
          advantages: Array.isArray((source.prosAndCons as Record<string, unknown>).advantages) ? ((source.prosAndCons as Record<string, unknown>).advantages as unknown[]).filter((item): item is string => typeof item === "string") : undefined,
          disadvantages: Array.isArray((source.prosAndCons as Record<string, unknown>).disadvantages) ? ((source.prosAndCons as Record<string, unknown>).disadvantages as unknown[]).filter((item): item is string => typeof item === "string") : undefined,
        }
      : undefined,
  };
};

const normalizeImportedNeighborhoods = (rawFacts: ImportedVerifiedDestinationFacts | undefined, fallbackNeighborhoods: string[]) => {
  const neighborhoods = rawFacts?.neighborhoods ?? [];
  const discovered = neighborhoods
    .map((row) => {
      const name = typeof row.name === "string" ? row.name.trim() : "";
      const fallbackName = typeof row.neighborhood_name === "string" ? row.neighborhood_name.trim() : "";
      return name || fallbackName;
    })
    .filter(Boolean);

  if (discovered.length > 0) {
    return Array.from(new Set(discovered));
  }

  return fallbackNeighborhoods;
};

const normalizeImportedResources = (rawFacts: ImportedVerifiedDestinationFacts | undefined, fallbackResources: CanonicalDestinationResource[]) => {
  const resources = rawFacts?.resources ?? [];
  const normalized = resources.map((resource) => {
    const category = getImportedFieldValue(resource, ["category", "resource_category", "resourceCategory", "resource_type", "resourceType"]);
    const label = getImportedFieldValue(resource, ["label", "resource_name", "resourceName", "name", "title"]);
    const provider = getImportedFieldValue(resource, ["provider", "source_name", "sourceName"]);
    const url = getImportedFieldValue(resource, ["url", "resource_url", "resourceUrl", "website_url", "websiteUrl"]);

    return {
      category: category ?? "resource",
      label: label ?? "Imported resource",
      provider: provider ?? null,
      url: url ?? "",
    };
  }).filter((resource) => resource.url.trim().length > 0);

  if (normalized.length > 0) {
    return normalized;
  }

  return fallbackResources;
};

const normalizeMediaItem = (item: Record<string, unknown>, fallbackKind = "image") => {
  const sourceUrl = getImportedFieldValue(item, ["source_url", "sourceUrl", "source_url_text", "sourceUrlText", "source"]) ?? "";
  const attribution = getImportedFieldValue(item, ["attribution", "credit", "author", "source_name", "sourceName"]) ?? "";
  const license = getImportedFieldValue(item, ["license", "license_name", "licenseName"]) ?? "";
  const url = getImportedFieldValue(item, ["image_url", "media_url", "url", "imageUrl", "mediaUrl"]) ?? "";
  const altText = getImportedFieldValue(item, ["alt_text", "altText", "alt_text_text"])
    ?? (typeof item.caption === "string" ? item.caption : "Imported media");
  const caption = getImportedFieldValue(item, ["caption", "title", "label"]) ?? "Imported media";
  const isPrimary = Boolean(item.is_primary ?? item.isPrimary);

  return {
    kind: typeof item.kind === "string" ? item.kind : fallbackKind,
    url: typeof url === "string" ? url : "",
    altText: typeof altText === "string" ? altText : "Imported media",
    caption: typeof caption === "string" ? caption : "Imported media",
    isPrimary,
    sourceUrl: typeof sourceUrl === "string" ? sourceUrl : "",
    attribution: typeof attribution === "string" ? attribution : "",
    license: typeof license === "string" ? license : "",
  } satisfies CanonicalDestinationMedia;
};

const normalizeImportedMedia = (rawFacts: ImportedVerifiedDestinationFacts | undefined, fallbackMedia: CanonicalDestinationMedia[]) => {
  const media = rawFacts?.media ?? [];
  const normalized = media.map((item) => normalizeMediaItem(item as Record<string, unknown>)).filter((item) => item.url.trim().length > 0);

  if (normalized.length > 0) {
    return normalized;
  }

  return fallbackMedia;
};

const normalizePremiumV2Resources = (rows: Array<Record<string, unknown>> | undefined, fallbackResources: CanonicalDestinationResource[]) => {
  const normalized = (rows ?? []).map((row) => {
    const category = getImportedFieldValue(row, ["category", "resource_category", "resourceCategory", "resource_type", "resourceType"]);
    const label = getImportedFieldValue(row, ["label", "resource_name", "resourceName", "name", "title"]);
    const provider = getImportedFieldValue(row, ["provider", "source_name", "sourceName"]);
    const url = getImportedFieldValue(row, ["url", "resource_url", "resourceUrl", "website_url", "websiteUrl"]);

    return {
      category: category ?? "resource",
      label: label ?? "Imported resource",
      provider: provider ?? null,
      url: url ?? "",
    };
  }).filter((resource) => resource.url.trim().length > 0);

  // Do not silently substitute fallbackResources here: the caller's own cascade
  // (premiumResources -> workbookResources -> fallbackResources) already handles
  // the case where no real premium-v2 rows exist. Returning fallbackResources from
  // here would make premiumResources.length > 0 always true, masking richer
  // workbook-sourced resources further down the cascade.
  return normalized;
};

const normalizePremiumV2Media = (rows: Array<Record<string, unknown>> | undefined, fallbackMedia: CanonicalDestinationMedia[]) => {
  const normalized = (rows ?? []).map((item) => normalizeMediaItem(item, "image")).filter((item) => item.url.trim().length > 0);

  if (normalized.length > 0) {
    return normalized;
  }

  return fallbackMedia;
};

const normalizePremiumV2Budgets = (rows: Array<Record<string, unknown>> | undefined, fallbackBudgets: CanonicalDestinationBudget[]) => {
  const normalized = (rows ?? []).map((item) => {
    const category = getImportedFieldValue(item, ["category", "label", "name", "title", "category_key", "categoryKey"]);
    const low = getImportedFieldValue(item, ["monthly_low", "monthlyLow", "low", "min", "cost_low"]);
    const high = getImportedFieldValue(item, ["monthly_high", "monthlyHigh", "high", "max", "cost_high"]);
    const description = getImportedFieldValue(item, ["description", "summary", "note"]);
    const amount = low || high ? `${low ?? ""}${low && high ? "–" : ""}${high ?? ""}`.trim() : "";

    return {
      label: category ?? "Living budget",
      amount: amount ? `${amount}/month` : "Estimated budget",
      note: description ?? "Workbook-backed budget range",
    };
  }).filter((item) => item.amount.trim().length > 0);

  if (normalized.length > 0) {
    return normalized;
  }

  return fallbackBudgets;
};

const normalizePremiumV2CostProfile = (rows: Array<Record<string, unknown>> | undefined, fallbackCostProfile: CanonicalDestinationCostProfile) => {
  const firstRow = (rows ?? [])[0];
  if (!firstRow) {
    return fallbackCostProfile;
  }

  const description = getImportedFieldValue(firstRow, ["description", "summary", "note"]);
  const category = getImportedFieldValue(firstRow, ["category", "label", "name", "title", "category_key", "categoryKey"]);
  const low = getImportedFieldValue(firstRow, ["monthly_low", "monthlyLow", "low", "min", "cost_low"]);
  const high = getImportedFieldValue(firstRow, ["monthly_high", "monthlyHigh", "high", "max", "cost_high"]);

  return {
    ...fallbackCostProfile,
    summary: description ?? fallbackCostProfile.summary,
    categories: [
      {
        key: (category ?? "housing").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        label: category ?? "Housing",
        amount: low || high ? `${low ?? ""}${low && high ? "–" : ""}${high ?? ""}`.trim() : fallbackCostProfile.categories?.[0]?.amount ?? "$1,200–$2,200/month",
        note: description ?? fallbackCostProfile.categories?.[0]?.note ?? "Workbook-backed cost profile",
      },
      ...(fallbackCostProfile.categories ?? []).slice(1),
    ],
  };
};

const getImportedFieldValue = (row: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
    if (typeof value === "boolean") {
      return String(value);
    }
  }
  return undefined;
};

const normalizeImportedNeighborhoodIntelligence = (rawFacts: ImportedVerifiedDestinationFacts | undefined): NeighborhoodIntelligenceGroup[] | undefined => {
  const groups = rawFacts?.places ?? [];
  if (!groups || groups.length === 0) return undefined;

  const normalizedGroups = groups.reduce<Record<string, NeighborhoodIntelligenceGroup>>((accumulator, placeRow) => {
    const category = getImportedFieldValue(placeRow, ["category", "place_category", "placeCategory", "category_name"]) ?? "Places";
    const neighborhoodName = getImportedFieldValue(placeRow, ["neighborhood_name", "neighborhoodName", "neighborhood"]);
    const key = `${category}:${neighborhoodName ?? "global"}`;
    if (!accumulator[key]) {
      accumulator[key] = {
        category,
        neighborhoodName,
        places: [],
      };
    }

    const placeName = getImportedFieldValue(placeRow, ["name", "real_place_name", "realPlaceName", "place_name", "placeName", "title", "display_name"]) ?? "Imported place";
    accumulator[key].places?.push({
      id: typeof placeRow.id === "string" ? placeRow.id : `${category}-${placeName}`,
      name: placeName,
      category,
      neighborhoodName,
      description: getImportedFieldValue(placeRow, ["description", "notes", "summary", "address"]) ?? getImportedFieldValue(placeRow, ["address", "formatted_address", "formattedAddress"]),
      whyItMatters: getImportedFieldValue(placeRow, ["why_it_matters", "whyItMatters", "reason", "source"]) ?? (typeof placeRow.source === "string" ? `Imported via ${placeRow.source}` : undefined),
      address: getImportedFieldValue(placeRow, ["address", "formatted_address", "formattedAddress"]),
      googleMapsUrl: getImportedFieldValue(placeRow, ["google_maps_url", "googleMapsUrl", "maps_url", "mapsUrl"]),
      websiteUrl: getImportedFieldValue(placeRow, ["website_url", "websiteUrl", "website", "url"]),
      verified: Boolean(placeRow.verified),
      source: typeof placeRow.source === "string" ? placeRow.source : undefined,
    });
    return accumulator;
  }, {});

  return Object.values(normalizedGroups);
};

const loadPremiumV2Modules = async (destinationId: string): Promise<Record<string, Array<Record<string, unknown>>>> => {
  if (!destinationId) {
    return {};
  }

  const moduleDefinitions = getPremiumV2RuntimeModuleDefinitions();
  const rowsByModule = await Promise.all(moduleDefinitions.map(async (module) => {
    try {
      const response = await supabaseFetch(`/rest/v1/${module.storageTable}?destination_id=eq.${encodeURIComponent(destinationId)}&select=*`, {
        cache: "no-store",
      });

      if (!response.ok) {
        return [module.moduleKey, []] as const;
      }

      const rows = (await response.json()) as Array<Record<string, unknown>>;
      return [module.moduleKey, rows] as const;
    } catch {
      return [module.moduleKey, []] as const;
    }
  }));

  return Object.fromEntries(rowsByModule);
};

const buildWorkbookBudgets = (workbookData: PremiumWorkbookNormalizedDestinationData | null, fallbackBudgets: CanonicalDestinationBudget[]) => {
  const workbookBudgets = workbookData?.costRecords.map((item) => ({
    label: item.category || "Living budget",
    amount: item.monthlyLow || item.monthlyHigh ? `${item.monthlyLow ?? ""}${item.monthlyLow && item.monthlyHigh ? "–" : ""}${item.monthlyHigh ?? ""}`.trim() : "Estimated budget",
    note: item.description || "Workbook-backed budget range",
  })).filter((item) => item.amount.trim().length > 0);

  if (workbookBudgets && workbookBudgets.length > 0) {
    return workbookBudgets.map((budget) => ({
      ...budget,
      amount: budget.amount ? `${budget.amount}/month` : "Estimated budget",
    }));
  }

  return fallbackBudgets;
};

const buildWorkbookCostProfile = (workbookData: PremiumWorkbookNormalizedDestinationData | null, fallbackCostProfile: CanonicalDestinationCostProfile) => {
  const firstCost = workbookData?.costRecords[0];
  if (!firstCost) {
    return fallbackCostProfile;
  }

  const categories = workbookData.costRecords.map((item) => ({
    key: (item.category || "housing").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    label: item.category || "Housing",
    amount: item.monthlyLow || item.monthlyHigh ? `${item.monthlyLow ?? ""}${item.monthlyLow && item.monthlyHigh ? "–" : ""}${item.monthlyHigh ?? ""}`.trim() : fallbackCostProfile.categories?.[0]?.amount ?? "$1,200–$2,200/month",
    note: item.description || fallbackCostProfile.categories?.[0]?.note || "Workbook-backed cost profile",
  }));

  return {
    ...fallbackCostProfile,
    summary: firstCost.description || fallbackCostProfile.summary,
    currency: firstCost.currency || fallbackCostProfile.currency || "USD",
    categories,
    budgets: workbookData.costRecords.map((item) => ({
      label: item.category || "Living budget",
      amount: item.monthlyLow || item.monthlyHigh ? `${item.monthlyLow ?? ""}${item.monthlyLow && item.monthlyHigh ? "–" : ""}${item.monthlyHigh ?? ""}`.trim() : "Estimated budget",
      note: item.description || "Workbook-backed budget range",
    })).map((budget) => ({
      ...budget,
      amount: budget.amount ? `${budget.amount}/month` : "Estimated budget",
    })),
  };
};

const buildWorkbookNeighborhoodIntelligence = (workbookData: PremiumWorkbookNormalizedDestinationData | null): NeighborhoodIntelligenceGroup[] | undefined => {
  if (!workbookData?.places || workbookData.places.length === 0) {
    return undefined;
  }

  const groups = workbookData.places.reduce<Record<string, NeighborhoodIntelligenceGroup>>((accumulator, place) => {
    const category = place.category || "Places";
    const neighborhoodName = place.neighborhoodName || "global";
    const key = `${category}:${neighborhoodName}`;

    if (!accumulator[key]) {
      accumulator[key] = {
        category,
        neighborhoodName: neighborhoodName === "global" ? undefined : neighborhoodName,
        places: [],
      };
    }

    accumulator[key].places?.push({
      id: `${category}-${place.name}`,
      name: place.name,
      category,
      neighborhoodName: place.neighborhoodName || undefined,
      description: place.description || undefined,
      whyItMatters: place.websiteUrl || place.googleMapsUrl ? "Imported workbook place" : undefined,
      address: place.address || undefined,
      googleMapsUrl: place.googleMapsUrl || undefined,
      websiteUrl: place.websiteUrl || undefined,
      verified: place.verified,
    });

    return accumulator;
  }, {});

  return Object.values(groups);
};

export const buildWorkbookDestinationFromData = (slug: string, workbookData: PremiumWorkbookNormalizedDestinationData | null): CanonicalDestination => {
  const fallback = buildFallbackCanonicalDestination(slug);
  const workbookFallbackData = getWorkbookFallbackDestinationData(slug);
  const city = workbookData?.city || fallback?.city || slug.replace(/-/g, " ");
  const country = workbookData?.country || fallback?.country || "";
  const fallbackResources = fallback?.resources ?? buildFallbackResources(city, country);
  const fallbackMedia = fallback?.media ?? buildFallbackMedia(city, country);
  const fallbackBudgets = fallback?.monthlyBudgets ?? buildFallbackBudgets(city);
  const fallbackCostProfile = fallback?.costOfLivingProfile ?? buildFallbackCostProfile(city, workbookData?.costOfLiving || "", fallbackBudgets);
  const workbookNeighborhoodNames = workbookData?.neighborhoods.map((item) => item.name).filter(Boolean) ?? [];
  const workbookResources = workbookData?.resources ?? [];
  const workbookMedia = workbookData?.media ?? [];
  const hasWorkbookContent = Boolean(workbookData && ((workbookData?.neighborhoods?.length ?? 0) > 0 || (workbookData?.places?.length ?? 0) > 0 || (workbookData?.resources?.length ?? 0) > 0 || (workbookData?.media?.length ?? 0) > 0 || (workbookData?.costRecords?.length ?? 0) > 0));
  const preferredHeroNarrative = normalizeTextValue(workbookData?.heroNarrative) || normalizeTextValue(workbookFallbackData?.heroNarrative) || normalizeTextValue(fallback?.heroNarrative) || "";
  const preferredOverview = normalizeTextValue(workbookData?.overview) || normalizeTextValue(workbookFallbackData?.overview) || normalizeTextValue(fallback?.overview) || "";
  const preferredEditorial = normalizeTextValue(workbookData?.editorial) || normalizeTextValue(workbookFallbackData?.editorial) || normalizeTextValue(fallback?.editorial) || "";
  const preferredWhyThisPlaceFeelsDistinct = normalizeTextValue(workbookData?.whyThisPlaceFeelsDistinct) || normalizeTextValue(workbookFallbackData?.whyThisPlaceFeelsDistinct) || normalizeTextValue(fallback?.whyThisPlaceFeelsDistinct) || "";
  const preferredDailyLife = normalizeTextValue(workbookData?.dailyLife) || normalizeTextValue(workbookFallbackData?.dailyLife) || normalizeTextValue(fallback?.dailyLife) || "";
  const preferredClimate = normalizeTextValue(workbookData?.climate) || normalizeTextValue(workbookFallbackData?.climate) || normalizeTextValue(fallback?.climate) || "";
  const preferredTransportation = normalizeTextValue(workbookData?.transportation) || normalizeTextValue(workbookFallbackData?.transportation) || normalizeTextValue(fallback?.transportation) || "";
  const preferredHealthcare = normalizeTextValue(workbookData?.healthcare) || normalizeTextValue(workbookFallbackData?.healthcare) || normalizeTextValue(fallback?.healthcare) || "";
  const preferredCostOfLiving = normalizeTextValue(workbookData?.costOfLiving) || normalizeTextValue(workbookFallbackData?.costOfLiving) || normalizeTextValue(fallback?.costOfLiving) || "";
  const preferredWalkability = normalizeTextValue(workbookData?.walkability) || normalizeTextValue(workbookFallbackData?.walkability) || normalizeTextValue(fallback?.walkability) || "";
  const preferredInternet = normalizeTextValue(workbookData?.internet) || normalizeTextValue(workbookFallbackData?.internet) || normalizeTextValue(fallback?.internet) || "";
  const preferredSafety = normalizeTextValue(workbookData?.safety) || normalizeTextValue(workbookFallbackData?.safety) || normalizeTextValue(fallback?.safety) || "";
  const preferredNeighborhoodProfiles = workbookFallbackData?.neighborhoodProfiles?.length ? workbookFallbackData.neighborhoodProfiles : fallback?.neighborhoodProfiles?.length ? fallback.neighborhoodProfiles : [];
  const resolvedWorkbookMedia = resolveWorkbookMediaForSlug(slug, workbookMedia).map(normalizeMediaUrlItem);
  const workbookFallbackMedia = (workbookFallbackData?.media ?? fallbackMedia).map(normalizeMediaUrlItem);
  const workbookKnowledgeProfile = mergeKnowledgeProfile(workbookData?.knowledgeProfile, fallback?.knowledgeProfile);
  const destinationIdentityTokens = buildDestinationIdentityTokens({ city, country, title: workbookData?.title || city, slug: workbookData?.slug || slug });
  const allowFallbackSupplementation = Boolean(workbookData?.source === "runtime-loader" && isWorkbookFallbackMediaDestination(slug));
  const filteredWorkbookMedia = mergeDestinationSpecificMedia(resolvedWorkbookMedia, workbookFallbackMedia, destinationIdentityTokens, allowFallbackSupplementation);

  return {
    ...(fallback ?? {
      slug: workbookData?.slug || slug,
      city,
      country,
      title: workbookData?.title || city,
      subtitle: workbookData?.subtitle || `${city}${country ? `, ${country}` : ""}`,
      heroNarrative: workbookData?.heroNarrative || "",
      overview: workbookData?.overview || "",
      editorial: workbookData?.editorial || "",
      whyThisPlaceFeelsDistinct: workbookData?.whyThisPlaceFeelsDistinct || "",
      dailyLife: workbookData?.dailyLife || "",
      climate: workbookData?.climate || "",
      transportation: workbookData?.transportation || "",
      healthcare: workbookData?.healthcare || "",
      costOfLiving: workbookData?.costOfLiving || "",
      walkability: workbookData?.walkability || "",
      internet: workbookData?.internet || "",
      safety: workbookData?.safety || "",
      neighborhoods: [],
      restaurants: [],
      museums: [],
      golf: [],
      beaches: [],
      outdoorRecreation: [],
      pros: [],
      cons: [],
      retirement: "",
      digitalNomad: "",
      family: "",
      weather: workbookData?.climate || "",
      monthlyBudgets: fallbackBudgets,
      costOfLivingProfile: fallbackCostProfile,
      airportInfo: "",
      googleMapsUrl: workbookData?.googleMapsUrl || "",
      googleEarthUrl: workbookData?.googleEarthUrl || "",
      officialTourismUrl: workbookData?.officialTourismUrl || "",
      wikipediaUrl: workbookData?.wikipediaUrl || "",
      youtubeUrl: "",
      tiktokUrl: "",
      instagramUrl: "",
      webcamUrl: "",
      resources: fallbackResources,
      knowledgeProfile: undefined as never,
      premiumEditorialContent: workbookData?.premiumEditorialContent,
      realEstateResources: [],
      rentalResources: [],
      healthcareResources: [],
      visaResources: [],
      weatherResources: [],
      structuredResources: fallbackResources,
      videos: [],
      media: fallbackMedia,
      heroImages: fallbackMedia,
      mediaGallery: fallbackMedia,
      sections: {},
      neighborhoodProfiles: [],
      ai: {
        status: "completed",
        version: "v0-workbook",
        lastUpdated: new Date().toISOString(),
        confidenceScore: 0.7,
        sourcesUsed: [],
        missingSections: [],
        promptVersion: "workbook-fallback",
        researchTimestamp: new Date().toISOString(),
      },
      scoring: [],
      neighborhoodIntelligence: [],
    }),
    slug: workbookData?.slug || fallback?.slug || slug,
    city: workbookData?.city || fallback?.city || city,
    country: workbookData?.country || fallback?.country || country,
    title: workbookData?.title || fallback?.title || city,
    subtitle: workbookData?.subtitle || fallback?.subtitle || `${city}${country ? `, ${country}` : ""}`,
    heroNarrative: preferredHeroNarrative,
    overview: preferredOverview,
    editorial: preferredEditorial,
    whyThisPlaceFeelsDistinct: preferredWhyThisPlaceFeelsDistinct,
    dailyLife: preferredDailyLife,
    climate: preferredClimate,
    transportation: preferredTransportation,
    healthcare: preferredHealthcare,
    costOfLiving: preferredCostOfLiving,
    walkability: preferredWalkability,
    internet: preferredInternet,
    safety: preferredSafety,
    neighborhoods: hasWorkbookContent && workbookNeighborhoodNames.length > 0 ? workbookNeighborhoodNames : (fallback?.neighborhoods ?? []),
    resources: hasWorkbookContent && workbookResources.length > 0 ? workbookResources.map((item) => ({ category: item.category, label: item.label, provider: item.provider ?? null, url: item.url })) : (fallback?.resources ?? fallbackResources),
    officialTourismUrl: workbookData?.officialTourismUrl || fallback?.officialTourismUrl || "",
    googleMapsUrl: workbookData?.googleMapsUrl || fallback?.googleMapsUrl || "",
    googleEarthUrl: workbookData?.googleEarthUrl || fallback?.googleEarthUrl || "",
    wikipediaUrl: workbookData?.wikipediaUrl || fallback?.wikipediaUrl || "",
    monthlyBudgets: hasWorkbookContent ? buildWorkbookBudgets(workbookData, fallbackBudgets) : (fallback?.monthlyBudgets ?? fallbackBudgets),
    costOfLivingProfile: hasWorkbookContent ? buildWorkbookCostProfile(workbookData, fallbackCostProfile) : (fallback?.costOfLivingProfile ?? fallbackCostProfile),
    media: hasWorkbookContent && filteredWorkbookMedia.length > 0 ? filteredWorkbookMedia.map((item) => ({ kind: item.kind, url: item.url, altText: item.altText, caption: item.caption, isPrimary: item.isPrimary, sourceUrl: item.sourceUrl, attribution: item.attribution, license: item.license })) : (fallback?.media ?? fallbackMedia),
    heroImages: hasWorkbookContent && filteredWorkbookMedia.length > 0 ? filteredWorkbookMedia.map((item) => ({ kind: item.kind, url: item.url, altText: item.altText, caption: item.caption, isPrimary: item.isPrimary, sourceUrl: item.sourceUrl, attribution: item.attribution, license: item.license })) : (fallback?.heroImages ?? fallbackMedia),
    mediaGallery: hasWorkbookContent && filteredWorkbookMedia.length > 0 ? filteredWorkbookMedia.map((item) => ({ kind: item.kind, url: item.url, altText: item.altText, caption: item.caption, isPrimary: item.isPrimary, sourceUrl: item.sourceUrl, attribution: item.attribution, license: item.license })) : (fallback?.mediaGallery ?? fallbackMedia),
    premiumEditorialContent: buildWorkbookPremiumEditorialContent(workbookData, workbookFallbackData?.premiumEditorialContent ?? fallback?.premiumEditorialContent),
    knowledgeProfile: workbookKnowledgeProfile,
    neighborhoodProfiles: preferredNeighborhoodProfiles,
    neighborhoodIntelligence: buildWorkbookNeighborhoodIntelligence(workbookData) ?? fallback?.neighborhoodIntelligence,
  } as CanonicalDestination;
};

const buildFallbackCanonicalDestination = (slug: string): CanonicalDestination | null => {
  const local = localDestinations.find((item) => item.slug === slug);
  const workbookFallback = getWorkbookFallbackDestinationData(slug);
  const inferredName = slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  const fallbackSource = local ?? {
    slug,
    city: workbookFallback?.city ?? inferredName,
    country: workbookFallback?.country ?? "",
    title: workbookFallback?.title ?? inferredName,
    subtitle: workbookFallback?.subtitle ?? `${workbookFallback?.city ?? inferredName}${workbookFallback?.country ? `, ${workbookFallback.country}` : ""}`,
    description: "",
    overview: "",
    heroNarrative: "",
    climate: "",
    lifestyle: "",
    transportation: "",
    researchProfile: {},
    premiumEditorialContent: undefined,
  } as typeof local;

  const city = workbookFallback?.city ?? fallbackSource.city;
  const country = workbookFallback?.country ?? fallbackSource.country;
  const premiumMaps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${city} ${country}`)}`;
  const premiumEarth = `https://earth.google.com/web/search/${encodeURIComponent(`${city} ${country}`)}`;
  const knowledgeProfile = buildDestinationKnowledgeProfile(fallbackSource as never);
  const fallbackResources = workbookFallback?.resources ?? buildFallbackResources(city, country);
  const fallbackMedia = workbookFallback?.media ?? buildFallbackMedia(city, country);
  const fallbackBudgets = workbookFallback?.monthlyBudgets ?? buildFallbackBudgets(city);
  const fallbackCostProfile = workbookFallback?.costOfLivingProfile ?? buildFallbackCostProfile(city, normalizeTextValue(fallbackSource.researchProfile?.costOfLiving ?? fallbackSource.researchProfile?.housing) || "", fallbackBudgets);

  const neighborhoodIntelligence = workbookFallback?.neighborhoodIntelligence ?? buildNeighborhoodIntelligenceSeedData({
    city,
    country,
    title: fallbackSource.title ?? fallbackSource.city,
    slug: fallbackSource.slug,
    knowledgeProfile,
  });

  const premiumEditorialContent = workbookFallback?.premiumEditorialContent ?? fallbackSource.premiumEditorialContent;
  const neighborhoodProfiles = workbookFallback?.neighborhoodProfiles?.map((profile) => ({
    name: profile.name,
    summary: profile.summary,
    resources: profile.resources,
    intelligence: profile.intelligence,
  })) ?? [];

  return {
    slug: workbookFallback?.slug ?? fallbackSource.slug,
    city,
    country,
    title: workbookFallback?.title ?? fallbackSource.title ?? city,
    subtitle: workbookFallback?.subtitle ?? fallbackSource.subtitle ?? `${city}${country ? `, ${country}` : ""}`,
    heroNarrative: workbookFallback?.heroNarrative ?? (normalizeTextValue(fallbackSource.heroNarrative ?? fallbackSource.description) || ""),
    overview: workbookFallback?.overview ?? (normalizeTextValue(fallbackSource.overview ?? fallbackSource.description) || ""),
    editorial: workbookFallback?.editorial ?? (normalizeTextValue(fallbackSource.description ?? fallbackSource.overview) || ""),
    whyThisPlaceFeelsDistinct: workbookFallback?.whyThisPlaceFeelsDistinct ?? (normalizeTextValue(fallbackSource.researchProfile?.whyThisPlaceFeelsDistinct) || ""),
    dailyLife: workbookFallback?.dailyLife ?? (normalizeTextValue(fallbackSource.lifestyle ?? fallbackSource.researchProfile?.feel) || ""),
    climate: workbookFallback?.climate ?? (normalizeTextValue(fallbackSource.climate ?? fallbackSource.researchProfile?.climate) || ""),
    transportation: workbookFallback?.transportation ?? (normalizeTextValue(fallbackSource.transportation ?? fallbackSource.researchProfile?.transportation) || ""),
    healthcare: workbookFallback?.healthcare ?? (normalizeTextValue(fallbackSource.researchProfile?.healthcare) || ""),
    costOfLiving: workbookFallback?.costOfLiving ?? (normalizeTextValue(fallbackSource.researchProfile?.costOfLiving) || ""),
    walkability: workbookFallback?.walkability ?? (normalizeTextValue(fallbackSource.researchProfile?.walkability) || ""),
    internet: workbookFallback?.internet ?? (normalizeTextValue(fallbackSource.researchProfile?.internet) || ""),
    safety: workbookFallback?.safety ?? (normalizeTextValue(fallbackSource.researchProfile?.safety) || ""),
    neighborhoods: workbookFallback?.neighborhoods ?? fallbackSource.researchProfile?.bestNeighborhoods ?? [],
    restaurants: [],
    museums: fallbackSource.researchProfile?.museums ?? [],
    golf: fallbackSource.researchProfile?.golf ?? [],
    beaches: fallbackSource.researchProfile?.beaches ?? [],
    outdoorRecreation: fallbackSource.researchProfile?.attractions ?? [],
    pros: fallbackSource.researchProfile?.pros ?? [],
    cons: fallbackSource.researchProfile?.cons ?? [],
    retirement: normalizeTextValue(fallbackSource.researchProfile?.longStaySuitability) || "",
    digitalNomad: normalizeTextValue(fallbackSource.researchProfile?.digitalNomadSuitability) || "",
    family: normalizeTextValue(fallbackSource.researchProfile?.familyFriendliness) || "",
    weather: workbookFallback?.climate ?? (normalizeTextValue(fallbackSource.climate ?? fallbackSource.researchProfile?.climate) || ""),
    monthlyBudgets: fallbackBudgets,
    costOfLivingProfile: fallbackCostProfile,
    airportInfo: "",
    googleMapsUrl: workbookFallback?.googleMapsUrl ?? premiumMaps,
    googleEarthUrl: workbookFallback?.googleEarthUrl ?? premiumEarth,
    officialTourismUrl: workbookFallback?.officialTourismUrl ?? `https://www.google.com/search?q=${encodeURIComponent(`${city} ${country} tourism`)}`,
    wikipediaUrl: workbookFallback?.wikipediaUrl ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(city)}`,
    youtubeUrl: workbookFallback?.youtubeUrl ?? `https://www.youtube.com/results?search_query=${encodeURIComponent(`${city} ${country} travel guide`)}`,
    tiktokUrl: workbookFallback?.tiktokUrl ?? `https://www.tiktok.com/search?q=${encodeURIComponent(`${city} ${country} travel`)}`,
    instagramUrl: workbookFallback?.instagramUrl ?? `https://www.instagram.com/explore/tags/${encodeURIComponent(city.toLowerCase())}`,
    webcamUrl: workbookFallback?.webcamUrl ?? `https://www.google.com/search?q=${encodeURIComponent(`${city} ${country} webcam`)}`,
    resources: fallbackResources,
    knowledgeProfile,
    premiumEditorialContent,
    realEstateResources: [
      { category: "real-estate", label: `${city} real estate search`, provider: "google", url: `https://www.google.com/search?q=${encodeURIComponent(`${city} ${country} real estate`)}` },
      { category: "real-estate", label: `${city} property listings`, provider: "google", url: `https://www.google.com/search?q=${encodeURIComponent(`${city} ${country} property listings`)}` },
    ],
    rentalResources: [
      { category: "rental", label: `${city} long-stay rentals`, provider: "google", url: `https://www.google.com/search?q=${encodeURIComponent(`${city} ${country} long stay rentals`)}` },
      { category: "rental", label: `${city} furnished rentals`, provider: "google", url: `https://www.google.com/search?q=${encodeURIComponent(`${city} ${country} furnished rentals`)}` },
    ],
    healthcareResources: [
      { category: "healthcare", label: `${city} hospitals`, provider: "google", url: `https://www.google.com/search?q=${encodeURIComponent(`${city} ${country} hospitals`)}` },
      { category: "healthcare", label: `${city} clinics`, provider: "google", url: `https://www.google.com/search?q=${encodeURIComponent(`${city} ${country} clinics`)}` },
    ],
    visaResources: [
      { category: "visa", label: `${city} residency guidance`, provider: "google", url: `https://www.google.com/search?q=${encodeURIComponent(`${city} ${country} residency guide`)}` },
      { category: "visa", label: `${city} visa information`, provider: "google", url: `https://www.google.com/search?q=${encodeURIComponent(`${city} ${country} visa information`)}` },
    ],
    weatherResources: [
      { category: "weather", label: `${city} weather`, provider: "google", url: `https://www.google.com/search?q=${encodeURIComponent(`${city} ${country} weather`)}` },
      { category: "weather", label: `${city} climate data`, provider: "google", url: `https://www.google.com/search?q=${encodeURIComponent(`${city} ${country} climate data`)}` },
    ],
    structuredResources: workbookFallback?.resources ?? buildFallbackResources(city, country),
    videos: [],
    media: fallbackMedia,
    heroImages: fallbackMedia,
    mediaGallery: fallbackMedia,
    sections: {},
    neighborhoodProfiles,
    ai: {
      status: "completed",
      version: "v0-local",
      lastUpdated: new Date().toISOString(),
      confidenceScore: 0.7,
      sourcesUsed: [],
      missingSections: [],
      promptVersion: "local-fallback",
      researchTimestamp: new Date().toISOString(),
    },
    scoring: [],
    neighborhoodIntelligence,
  };
};

export async function getCanonicalDestination(slug: string): Promise<CanonicalDestination | null> {
  const normalizedSlug = slug.trim().toLowerCase();

  // Only the 3 golden regression-fixture pilots ever live-parse the frozen workbook at request time.
  // Every other destination (including all future batch-imported destinations) renders purely from
  // persisted database state - the runtime has no dependency on which workbook, if any, originally
  // produced a destination's data. See GOLDEN_PILOT_FIXTURE_SLUG_ALIASES for the exact, permanent scope
  // of this exception.
  const isGoldenPilotFixtureSlug = GOLDEN_PILOT_FIXTURE_SLUG_ALIASES.has(normalizedSlug);
  const workbookData = isGoldenPilotFixtureSlug ? await loadPremiumWorkbookDestinationData(normalizedSlug) : null;
  const fallbackDestination = buildFallbackCanonicalDestination(normalizedSlug);

  logCanonicalDestinationBranch({ phase: "start", slug: normalizedSlug, workbookResolved: Boolean(workbookData), workbookKey: workbookData?.destinationKey ?? null, workbookSlug: workbookData?.slug ?? null });

  if (!isSupabaseConfigured()) {
    if (workbookData) {
      logCanonicalDestinationBranch({ phase: "branch", slug: normalizedSlug, branch: "workbook-only", reason: "supabase-unconfigured" });
      return buildWorkbookDestinationFromData(normalizedSlug, workbookData);
    }

    const fallback = buildFallbackCanonicalDestination(normalizedSlug);
    if (!fallback) return null;
    logCanonicalDestinationBranch({ phase: "branch", slug: normalizedSlug, branch: "fallback", reason: "supabase-unconfigured-and-no-workbook" });
    return fallback;
  }

  try {
    const response = await supabaseFetch(`/rest/v1/destinations_catalog?slug=eq.${encodeURIComponent(normalizedSlug)}&select=*`, {
      cache: "no-store",
    });

    let rows = response.ok ? ((await response.json()) as Array<Record<string, unknown>>) : [];
    let row = rows[0];

    logCanonicalDestinationBranch({ phase: "row-check", slug: normalizedSlug, rowFound: Boolean(row), rowDestinationKey: typeof row?.destination_key === "string" ? row.destination_key : null, rowSlug: typeof row?.slug === "string" ? row.slug : null });

    if (!row) {
      // Approved pilot destinations must resolve through exact slug/alias matching only — the fuzzy
      // fallback search below can match them to an unrelated catalog row (e.g. a shared city/region name).
      const skipFuzzyFallbackSearch = GOLDEN_PILOT_FIXTURE_SLUG_ALIASES.has(normalizedSlug);
      const fallbackResponse = skipFuzzyFallbackSearch ? null : await supabaseFetch(`/rest/v1/destinations_catalog?select=*`, {
        cache: "no-store",
      });

      if (fallbackResponse?.ok) {
        const allRows = (await fallbackResponse.json()) as Array<Record<string, unknown>>;
        row = allRows.find((candidate) => matchDestinationRowToSlug(candidate, normalizedSlug));
        if (row) {
          rows = [row];
        }
      }
    }

    if (!row) {
      if (workbookData) {
        logCanonicalDestinationBranch({ phase: "branch", slug: normalizedSlug, branch: "workbook-only", reason: "no-supabase-row" });
        return buildWorkbookDestinationFromData(normalizedSlug, workbookData);
      }

      const fallback = buildFallbackCanonicalDestination(normalizedSlug);
      if (!fallback) {
        return null;
      }
      logCanonicalDestinationBranch({ phase: "branch", slug: normalizedSlug, branch: "fallback", reason: "no-supabase-row-and-no-workbook" });
      return fallback;
    }

    const persistedRuntimeIdentity = resolvePersistedRuntimeDestinationIdentity(normalizedSlug, row);
    logCanonicalDestinationBranch({ phase: "persisted-identity", slug: normalizedSlug, persistedIdentity: persistedRuntimeIdentity, rowDestinationKey: typeof row?.destination_key === "string" ? row.destination_key : null });
    if (persistedRuntimeIdentity) {
      const persistedRuntimeResult = await loadPersistedDestinationFromRuntime(persistedRuntimeIdentity);
      if (persistedRuntimeResult.outcome === "SUCCESS" && persistedRuntimeResult.bundle) {
        logCanonicalDestinationBranch({ phase: "branch", slug: normalizedSlug, branch: "persisted-bundle", destinationKey: persistedRuntimeIdentity.destinationKey, destinationId: persistedRuntimeIdentity.destinationId, bundleIdentity: persistedRuntimeResult.bundle.identity });
        return buildCanonicalDestinationFromPersistedBundle(normalizedSlug, fallbackDestination, persistedRuntimeResult.bundle, workbookData);
      }
      logCanonicalDestinationBranch({ phase: "branch", slug: normalizedSlug, branch: "row-workbook-merge", reason: "persisted-read-missed", persistedOutcome: persistedRuntimeResult.outcome });
    }

    const rawImportedFacts = parseImportedVerifiedFacts((row.metadata as Record<string, unknown> | undefined)?.importedVerifiedFacts);
    const fallbackNeighborhoods = fallbackDestination?.neighborhoods ?? (Array.isArray(row.neighborhoods) ? row.neighborhoods.map(String) : []);
    const destinationId = typeof row.destination_id === "string" && row.destination_id.trim()
      ? row.destination_id.trim()
      : typeof row.id === "string" && row.id.trim()
        ? row.id.trim()
        : "";
    const premiumV2Modules = destinationId ? await loadPremiumV2Modules(destinationId) : {};
    const workbookNeighborhoodNames = workbookData?.neighborhoods.map((item) => item.name).filter(Boolean) ?? [];
    const workbookPlaces = workbookData?.places ?? [];
    const workbookResources = workbookData?.resources ?? [];
    const workbookMedia = workbookData?.media ?? [];
    const resolvedWorkbookMedia = resolveWorkbookMediaForSlug(normalizedSlug, workbookMedia);
    const fallbackResources = fallbackDestination?.resources ?? (Array.isArray(row.resources) ? (row.resources as unknown[]).map((resource) => resource as Record<string, unknown>).map((resource) => ({
      category: String(resource.category ?? "resource"),
      label: String(resource.label ?? "Imported resource"),
      provider: typeof resource.provider === "string" ? resource.provider : null,
      url: String(resource.url ?? ""),
    })) : []);
    const fallbackMedia = fallbackDestination?.media ?? (Array.isArray(row.media) ? (row.media as unknown[]).map((item) => item as Record<string, unknown>).map((item) => ({
      kind: String(item.kind ?? "image"),
      url: String(item.url ?? ""),
      altText: String(item.alt_text ?? item.altText ?? "Imported media"),
      caption: String(item.caption ?? "Imported media"),
      isPrimary: Boolean(item.is_primary ?? item.isPrimary),
      sourceUrl: typeof item.source_url === "string" || typeof item.sourceUrl === "string" ? String(item.source_url ?? item.sourceUrl ?? "") : "",
      attribution: typeof item.attribution === "string" ? item.attribution : "",
      license: typeof item.license === "string" ? item.license : "",
    })) : []);
    const fallbackBudgets = fallbackDestination?.monthlyBudgets ?? buildFallbackBudgets(String(row.city ?? ""));
    const fallbackCostProfile = fallbackDestination?.costOfLivingProfile ?? buildFallbackCostProfile(String(row.city ?? ""), String(row.cost_of_living ?? ""), fallbackBudgets);
    const workbookBudgets = buildWorkbookBudgets(workbookData, fallbackBudgets);
    const workbookCostProfile = buildWorkbookCostProfile(workbookData, fallbackCostProfile);
    const importedResourceRows = Array.isArray(rawImportedFacts?.resources) ? rawImportedFacts.resources as Array<Record<string, unknown>> : [];
    const importedMediaRows = Array.isArray(rawImportedFacts?.media) ? rawImportedFacts.media as Array<Record<string, unknown>> : [];
    const importedResources = normalizeImportedResources(rawImportedFacts, fallbackResources);
    const importedMedia = normalizeImportedMedia(rawImportedFacts, fallbackMedia);
    const premiumResources = normalizePremiumV2Resources(premiumV2Modules.resources as Array<Record<string, unknown>> | undefined, fallbackResources);
    const premiumMedia = normalizePremiumV2Media(premiumV2Modules.media as Array<Record<string, unknown>> | undefined, fallbackMedia);
    const destinationIdentityTokens = buildDestinationIdentityTokens({ city: workbookData?.city || String(row.city ?? ""), country: workbookData?.country || String(row.country ?? ""), title: workbookData?.title || String(row.title ?? row.city ?? ""), slug: workbookData?.slug || String(row.slug ?? normalizedSlug) });
    const filteredImportedMedia = filterDestinationSpecificMedia(importedMedia, destinationIdentityTokens);
    const filteredPremiumMedia = filterDestinationSpecificMedia(premiumMedia, destinationIdentityTokens);
    const allowWorkbookFallbackSupplementation = Boolean(workbookData?.source === "runtime-loader" && isWorkbookFallbackMediaDestination(normalizedSlug));
    const filteredWorkbookMedia = mergeDestinationSpecificMedia(
      resolvedWorkbookMedia.map((item) => ({ kind: item.kind, url: item.url, altText: item.altText, caption: item.caption, isPrimary: item.isPrimary, sourceUrl: item.sourceUrl, attribution: item.attribution, license: item.license })),
      getWorkbookFallbackDestinationData(normalizedSlug)?.media ?? fallbackMedia,
      destinationIdentityTokens,
      allowWorkbookFallbackSupplementation,
    );
    const premiumBudgetRows = (premiumV2Modules.cost_of_living as Array<Record<string, unknown>> | undefined) ?? [];
    const premiumBudgets = normalizePremiumV2Budgets(premiumBudgetRows, fallbackBudgets);
    const premiumCostProfile = normalizePremiumV2CostProfile(premiumBudgetRows, fallbackCostProfile);
    const hasImportedResourceFacts = importedResourceRows.length > 0;
    const hasImportedMediaFacts = importedMediaRows.length > 0;
    const premiumNeighborhoodRows = (premiumV2Modules.neighborhoods as Array<Record<string, unknown>> | undefined) ?? [];
    const premiumPlaceRows = (premiumV2Modules.places as Array<Record<string, unknown>> | undefined) ?? [];
    const importedNeighborhoodNames = normalizeImportedNeighborhoods(rawImportedFacts, fallbackNeighborhoods);
    const hasImportedNeighborhoodFacts = Array.isArray(rawImportedFacts?.neighborhoods) && rawImportedFacts.neighborhoods.length > 0;
    const normalizedNeighborhoods = hasImportedNeighborhoodFacts
      ? importedNeighborhoodNames
      : workbookNeighborhoodNames.length > 0
        ? workbookNeighborhoodNames
        : premiumNeighborhoodRows.length > 0
          ? premiumNeighborhoodRows
              .map((item) => item as Record<string, unknown>)
              .map((item) => getImportedFieldValue(item, ["neighborhood_name", "neighborhoodName", "name", "title"]) ?? "")
              .filter(Boolean)
          : normalizeImportedNeighborhoods(rawImportedFacts, fallbackNeighborhoods);
    const importedPlaces = Array.isArray(rawImportedFacts?.places) ? (rawImportedFacts.places as Array<Record<string, unknown>>).map((item) => ({
      name: String(getImportedFieldValue(item, ["real_place_name", "place_name", "placeName", "name", "title"]) ?? "Imported place"),
      category: String(getImportedFieldValue(item, ["category", "place_category", "placeCategory", "category_key", "categoryKey"]) ?? "Places"),
      neighborhoodName: String(getImportedFieldValue(item, ["neighborhood_name", "neighborhoodName", "neighborhood"]) ?? ""),
      description: String(getImportedFieldValue(item, ["description", "notes", "summary", "address"]) ?? ""),
      websiteUrl: String(getImportedFieldValue(item, ["website_url", "websiteUrl", "url"]) ?? ""),
      googleMapsUrl: String(getImportedFieldValue(item, ["google_maps_url", "googleMapsUrl", "maps_url", "mapsUrl"]) ?? ""),
      verified: Boolean(item.verified),
    })).filter((item) => item.name.trim().length > 0) : [];
    const hasImportedPlaceFacts = importedPlaces.length > 0;
    const normalizedPlaces = hasImportedPlaceFacts
      ? importedPlaces
      : workbookPlaces.length > 0
        ? workbookPlaces.map((item) => ({
            name: String(item.name ?? "Imported place"),
            category: String(item.category ?? "Places"),
            neighborhoodName: String(item.neighborhoodName ?? ""),
            description: String(item.description ?? ""),
            websiteUrl: String(item.websiteUrl ?? ""),
            googleMapsUrl: String(item.googleMapsUrl ?? ""),
            verified: Boolean(item.verified),
          })).filter((item) => item.name.trim().length > 0)
        : premiumPlaceRows.length > 0
          ? premiumPlaceRows.map((item) => item as Record<string, unknown>).map((item) => ({
              name: String(getImportedFieldValue(item, ["real_place_name", "place_name", "placeName", "name", "title"]) ?? "Imported place"),
              category: String(getImportedFieldValue(item, ["category", "place_category", "placeCategory", "category_key", "categoryKey"]) ?? "Places"),
              neighborhoodName: String(getImportedFieldValue(item, ["neighborhood_name", "neighborhoodName", "neighborhood"]) ?? ""),
              description: String(getImportedFieldValue(item, ["description", "notes", "summary", "address"]) ?? ""),
              websiteUrl: String(getImportedFieldValue(item, ["website_url", "websiteUrl", "url"]) ?? ""),
              googleMapsUrl: String(getImportedFieldValue(item, ["google_maps_url", "googleMapsUrl", "maps_url", "mapsUrl"]) ?? ""),
              verified: Boolean(item.verified),
            })).filter((item) => item.name.trim().length > 0)
          : [];

    const destination: CanonicalDestination = {
      slug: workbookData?.slug || String(row.slug ?? normalizedSlug),
      city: workbookData?.city || String(row.city ?? ""),
      country: workbookData?.country || String(row.country ?? ""),
      title: workbookData?.title || String(row.title ?? row.city ?? ""),
      subtitle: workbookData?.subtitle || String(row.subtitle ?? ""),
      heroNarrative: selectPreferredTextValue(workbookData?.heroNarrative, fallbackDestination?.heroNarrative, String(row.hero_narrative ?? row.description ?? "")),
      overview: selectPreferredTextValue(workbookData?.overview, fallbackDestination?.overview, String(row.overview ?? row.description ?? "")),
      editorial: selectPreferredTextValue(workbookData?.editorial, fallbackDestination?.editorial, String(row.editorial ?? row.description ?? "")),
      whyThisPlaceFeelsDistinct: selectPreferredTextValue(workbookData?.whyThisPlaceFeelsDistinct, fallbackDestination?.whyThisPlaceFeelsDistinct, String(row.why_this_place_feels_distinct ?? row.overview ?? "")),
      dailyLife: selectPreferredTextValue(workbookData?.dailyLife, fallbackDestination?.dailyLife, String(row.daily_life ?? row.lifestyle ?? "")),
      climate: selectPreferredTextValue(workbookData?.climate, fallbackDestination?.climate, String(row.climate ?? "")),
      transportation: selectPreferredTextValue(workbookData?.transportation, fallbackDestination?.transportation, String(row.transportation ?? "")),
      healthcare: selectPreferredTextValue(workbookData?.healthcare, fallbackDestination?.healthcare, String(row.healthcare ?? "")),
      costOfLiving: selectPreferredTextValue(workbookData?.costOfLiving, fallbackDestination?.costOfLiving, String(row.cost_of_living ?? "")),
      walkability: selectPreferredTextValue(workbookData?.walkability, fallbackDestination?.walkability, String(row.walkability ?? "")),
      internet: selectPreferredTextValue(workbookData?.internet, fallbackDestination?.internet, String(row.internet ?? "")),
      safety: selectPreferredTextValue(workbookData?.safety, fallbackDestination?.safety, String(row.safety ?? "")),
      neighborhoods: normalizedNeighborhoods.length > 0 ? normalizedNeighborhoods : fallbackNeighborhoods,
      restaurants: Array.isArray(row.restaurants) ? row.restaurants.map(String) : [],
      museums: Array.isArray(row.museums) ? row.museums.map(String) : [],
      golf: Array.isArray(row.golf) ? row.golf.map(String) : [],
      beaches: Array.isArray(row.beaches) ? row.beaches.map(String) : [],
      outdoorRecreation: Array.isArray(row.outdoor_recreation) ? row.outdoor_recreation.map(String) : [],
      pros: Array.isArray(row.pros) ? row.pros.map(String) : [],
      cons: Array.isArray(row.cons) ? row.cons.map(String) : [],
      retirement: String(row.retirement ?? ""),
      digitalNomad: String(row.digital_nomad ?? ""),
      family: String(row.family ?? ""),
      weather: String(row.weather ?? ""),
      monthlyBudgets: premiumBudgets.length > 0 ? premiumBudgets : workbookBudgets.length > 0 ? workbookBudgets : (Array.isArray(row.monthly_budgets) ? (row.monthly_budgets as unknown[]).map((item) => item as Record<string, unknown>).map((item) => ({
        label: String(item.label ?? ""),
        amount: String(item.amount ?? ""),
        note: String(item.note ?? ""),
      })) : fallbackBudgets),
      airportInfo: String(row.airport_info ?? ""),
      googleMapsUrl: workbookData?.googleMapsUrl || String(row.google_maps_url ?? ""),
      googleEarthUrl: workbookData?.googleEarthUrl || String(row.google_earth_url ?? ""),
      officialTourismUrl: workbookData?.officialTourismUrl || String(row.official_tourism_url ?? ""),
      wikipediaUrl: workbookData?.wikipediaUrl || String(row.wikipedia_url ?? ""),
      youtubeUrl: String(row.youtube_url ?? ""),
      tiktokUrl: String(row.tiktok_url ?? ""),
      instagramUrl: String(row.instagram_url ?? ""),
      webcamUrl: String(row.webcam_url ?? ""),
      resources: hasImportedResourceFacts ? importedResources : premiumResources.length > 0 ? premiumResources : workbookResources.length > 0 ? workbookResources.map((item) => ({ category: item.category, label: item.label, provider: item.provider ?? null, url: item.url })) : fallbackResources,
      realEstateResources: Array.isArray(row.real_estate_resources) ? (row.real_estate_resources as unknown[]).map((resource) => resource as Record<string, unknown>).map((resource) => ({
        category: String(resource.category ?? "real-estate"),
        label: String(resource.label ?? ""),
        provider: typeof resource.provider === "string" ? resource.provider : null,
        url: String(resource.url ?? ""),
      })) : [],
      rentalResources: Array.isArray(row.rental_resources) ? (row.rental_resources as unknown[]).map((resource) => resource as Record<string, unknown>).map((resource) => ({
        category: String(resource.category ?? "rental"),
        label: String(resource.label ?? ""),
        provider: typeof resource.provider === "string" ? resource.provider : null,
        url: String(resource.url ?? ""),
      })) : [],
      healthcareResources: Array.isArray(row.healthcare_resources) ? (row.healthcare_resources as unknown[]).map((resource) => resource as Record<string, unknown>).map((resource) => ({
        category: String(resource.category ?? "healthcare"),
        label: String(resource.label ?? ""),
        provider: typeof resource.provider === "string" ? resource.provider : null,
        url: String(resource.url ?? ""),
      })) : [],
      visaResources: Array.isArray(row.visa_resources) ? (row.visa_resources as unknown[]).map((resource) => resource as Record<string, unknown>).map((resource) => ({
        category: String(resource.category ?? "visa"),
        label: String(resource.label ?? ""),
        provider: typeof resource.provider === "string" ? resource.provider : null,
        url: String(resource.url ?? ""),
      })) : [],
      weatherResources: Array.isArray(row.weather_resources) ? (row.weather_resources as unknown[]).map((resource) => resource as Record<string, unknown>).map((resource) => ({
        category: String(resource.category ?? "weather"),
        label: String(resource.label ?? ""),
        provider: typeof resource.provider === "string" ? resource.provider : null,
        url: String(resource.url ?? ""),
      })) : [],
      structuredResources: Array.isArray(row.structured_resources) ? (row.structured_resources as unknown[]).map((resource) => resource as Record<string, unknown>).map((resource) => ({
        category: String(resource.category ?? "structured"),
        label: String(resource.label ?? ""),
        provider: typeof resource.provider === "string" ? resource.provider : null,
        url: String(resource.url ?? ""),
      })) : [],
      videos: Array.isArray(row.videos) ? (row.videos as unknown[]).map((video) => video as Record<string, unknown>).map((video) => ({
        provider: String(video.provider ?? ""),
        label: String(video.label ?? ""),
        url: String(video.url ?? ""),
        embedUrl: typeof video.embed_url === "string" ? video.embed_url : null,
      })) : [],
      media: hasImportedMediaFacts ? filteredImportedMedia : filteredPremiumMedia.length > 0 ? filteredPremiumMedia : filteredWorkbookMedia.length > 0 ? filteredWorkbookMedia : fallbackMedia,
      heroImages: hasImportedMediaFacts ? filteredImportedMedia : filteredPremiumMedia.length > 0 ? filteredPremiumMedia : filteredWorkbookMedia.length > 0 ? filteredWorkbookMedia : fallbackMedia,
      mediaGallery: hasImportedMediaFacts ? filteredImportedMedia : filteredPremiumMedia.length > 0 ? filteredPremiumMedia : filteredWorkbookMedia.length > 0 ? filteredWorkbookMedia : fallbackMedia,
      sections: (() => {
        if (!row.sections || typeof row.sections !== "object") return {};
        const rawSections = row.sections as Record<string, unknown>;
        return Object.entries(rawSections).reduce<Record<string, { id: string; title: string; content: string; version: number; updatedAt: string }>>((accumulator, [key, value]) => {
          const section = value as Record<string, unknown>;
          accumulator[key] = {
            id: String(section.id ?? key),
            title: String(section.title ?? key),
            content: String(section.content ?? section.body ?? ""),
            version: Number(section.version ?? 1),
            updatedAt: String(section.updated_at ?? section.updatedAt ?? new Date().toISOString()),
          };
          return accumulator;
        }, {});
      })(),
      ai: {
        status: (row.ai_status as "queued" | "running" | "completed" | "failed" | "paused") ?? "completed",
        version: String(row.ai_version ?? "v0"),
        lastUpdated: String(row.ai_last_updated ?? new Date().toISOString()),
        confidenceScore: Number(row.ai_confidence_score ?? 0),
        sourcesUsed: Array.isArray(row.ai_sources_used) ? row.ai_sources_used.map(String) : [],
        missingSections: Array.isArray(row.ai_missing_sections) ? row.ai_missing_sections.map(String) : [],
        promptVersion: String(row.ai_prompt_version ?? ""),
        researchTimestamp: String(row.research_timestamp ?? new Date().toISOString()),
      },
      scoring: Array.isArray(row.scoring) ? (row.scoring as unknown[]).map((item) => item as Record<string, unknown>).map((item) => ({
        name: String(item.name ?? ""),
        weight: Number(item.weight ?? 0),
        score: Number(item.score ?? 0),
      })) : [],
      aiScoringExplanation: String(row.ai_scoring_explanation ?? ""),
      premiumEditorialContent: buildWorkbookPremiumEditorialContent(workbookData, parsePremiumEditorialContent(row.premium_editorial_content) ?? fallbackDestination?.premiumEditorialContent ?? localDestinations.find((item) => item.slug === normalizedSlug)?.premiumEditorialContent),
      knowledgeProfile: mergeKnowledgeProfile(
        mergeKnowledgeProfile(parseKnowledgeProfile(row.knowledge_profile ?? row.knowledgeProfile), workbookData?.knowledgeProfile),
        fallbackDestination?.knowledgeProfile
          ?? localDestinations.find((item) => item.slug === normalizedSlug)?.knowledgeProfile
          ?? buildDestinationKnowledgeProfile(localDestinations.find((item) => item.slug === normalizedSlug) ?? { city: String(row.city ?? ""), country: String(row.country ?? "") }),
      ),
      neighborhoodIntelligence: hasImportedPlaceFacts
        ? Object.values(importedPlaces.reduce<Record<string, NeighborhoodIntelligenceGroup>>((accumulator, placeRow) => {
            const category = placeRow.category || "Places";
            const neighborhoodName = placeRow.neighborhoodName || "global";
            const key = `${category}:${neighborhoodName}`;
            if (!accumulator[key]) {
              accumulator[key] = {
                category,
                neighborhoodName: neighborhoodName === "global" ? undefined : neighborhoodName,
                places: [],
              };
            }
            accumulator[key].places?.push({
              id: `${category}-${placeRow.name}`,
              name: placeRow.name,
              category,
              neighborhoodName: placeRow.neighborhoodName || undefined,
              description: placeRow.description || undefined,
              whyItMatters: placeRow.websiteUrl || placeRow.googleMapsUrl ? "Imported workbook place" : undefined,
              address: placeRow.description || undefined,
              googleMapsUrl: placeRow.googleMapsUrl || undefined,
              websiteUrl: placeRow.websiteUrl || undefined,
              verified: placeRow.verified,
            });
            return accumulator;
          }, {}))
        : workbookData?.places?.length
          ? buildWorkbookNeighborhoodIntelligence(workbookData)
          : normalizedPlaces.length > 0
            ? Object.values(normalizedPlaces.reduce<Record<string, NeighborhoodIntelligenceGroup>>((accumulator, placeRow) => {
                const category = placeRow.category || "Places";
                const neighborhoodName = placeRow.neighborhoodName || "global";
                const key = `${category}:${neighborhoodName}`;
                if (!accumulator[key]) {
                  accumulator[key] = {
                    category,
                    neighborhoodName: neighborhoodName === "global" ? undefined : neighborhoodName,
                    places: [],
                  };
                }
                accumulator[key].places?.push({
                  id: `${category}-${placeRow.name}`,
                  name: placeRow.name,
                  category,
                  neighborhoodName: placeRow.neighborhoodName || undefined,
                  description: placeRow.description || undefined,
                  whyItMatters: placeRow.websiteUrl || placeRow.googleMapsUrl ? "Imported workbook place" : undefined,
                  address: placeRow.description || undefined,
                  googleMapsUrl: placeRow.googleMapsUrl || undefined,
                  websiteUrl: placeRow.websiteUrl || undefined,
                  verified: placeRow.verified,
                });
                return accumulator;
              }, {}))
            : (normalizeImportedNeighborhoodIntelligence(rawImportedFacts) ?? ((row.metadata as Record<string, unknown> | undefined)?.neighborhoodIntelligence as NeighborhoodIntelligenceGroup[] | undefined) ?? fallbackDestination?.neighborhoodIntelligence ?? []).length > 0
              ? (normalizeImportedNeighborhoodIntelligence(rawImportedFacts) ?? ((row.metadata as Record<string, unknown> | undefined)?.neighborhoodIntelligence as NeighborhoodIntelligenceGroup[] | undefined) ?? fallbackDestination?.neighborhoodIntelligence ?? [])
              : fallbackDestination?.neighborhoodIntelligence ?? [],
      costOfLivingProfile: premiumBudgetRows.length > 0 ? premiumCostProfile : workbookData?.costRecords?.length ? workbookCostProfile : fallbackDestination?.costOfLivingProfile ?? fallbackCostProfile,
      premiumV2Modules: Object.keys(premiumV2Modules).length > 0 ? premiumV2Modules : undefined,
    };

    logCanonicalDestinationBranch({ phase: "branch", slug: normalizedSlug, branch: "row-workbook-merge", destinationKey: workbookData?.destinationKey ?? null, workbookSlug: workbookData?.slug ?? null, rowDestinationKey: typeof row?.destination_key === "string" ? row.destination_key : null });
    return destination;
  } catch {
    if (workbookData) {
      logCanonicalDestinationBranch({ phase: "branch", slug: normalizedSlug, branch: "workbook-only", reason: "supabase-exception" });
      return buildWorkbookDestinationFromData(normalizedSlug, workbookData);
    }

    const fallback = buildFallbackCanonicalDestination(normalizedSlug);
    if (!fallback) return null;
    logCanonicalDestinationBranch({ phase: "branch", slug: normalizedSlug, branch: "fallback", reason: "exception" });
    return fallback;
  }
}
