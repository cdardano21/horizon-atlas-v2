import fs from "node:fs";
import { enrichedDestinations, getDestinationEditorialFields } from "./destination-enrichment";
import { listAdminFallbackDestinations } from "./admin-local-fallback";
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

const TRACE_LOG_PATH = process.env.HORIZON_ATLAS_TRACE_LOG ?? "/tmp/horizon-atlas-trace.log";

const writeTrace = (label: string, payload: unknown) => {
  try {
    const line = `[${new Date().toISOString()}] ${label} ${JSON.stringify(payload)}\n`;
    fs.appendFileSync(TRACE_LOG_PATH, line);
  } catch {
    // ignore trace-file failures
  }
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
  /available in the destinationfinderai/i,
  /available for relocation research/i,
  /destination in/i,
  /known for.*practical transport links/i,
  /works well for longer stays because/i,
  /daily rhythm that feels practical/i,
  /historic streets and neighborhood life/i,
  /city where the everyday life/i,
  /known for/i,
  /small university/i,
  /scenic black hills town/i,
  /regional services/i,
  /local economy is supported/i,
  /available in the destination catalog/i,
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
  return WEAK_NARRATIVE_PATTERNS.some((pattern) => pattern.test(normalized));
};

export const selectEditorialNarrative = (
  rowValue: string | null | undefined,
  localValue: string | null | undefined,
  fallback: string,
  preferLocalOverride = false,
) => {
  const normalizedRow = rowValue?.trim();
  const normalizedLocal = localValue?.trim();

  if (preferLocalOverride && normalizedLocal && !isWeakEditorialNarrative(normalizedLocal)) {
    return normalizedLocal;
  }

  if (normalizedRow && !isWeakEditorialNarrative(normalizedRow)) {
    if (normalizedLocal && !isWeakEditorialNarrative(normalizedLocal)) {
      if (isSpecificNarrative(normalizedLocal) && !isSpecificNarrative(normalizedRow)) {
        return normalizedLocal;
      }
      return normalizedRow;
    }
    return normalizedRow;
  }

  return "";
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

const preferImportedNarrative = (
  candidates: Array<string | null | undefined>,
  fallback: string,
) => {
  const strongValue = candidates
    .map((value) => value?.trim())
    .find((value): value is string => Boolean(value && !isWeakEditorialNarrative(value)));

  return strongValue ?? fallback;
};

const selectCatalogNarrativeValue = (
  editorialCandidates: Array<string | null | undefined>,
  researchCandidates: Array<string | null | undefined>,
  fallbackCandidates: Array<string | null | undefined>,
  fallback: string,
  catalogCandidates: Array<string | null | undefined>,
) => {
  const strongImportedValue = preferImportedNarrative([...editorialCandidates, ...researchCandidates], "");
  if (strongImportedValue) {
    return strongImportedValue;
  }

  const strongCatalogValue = preferImportedNarrative(catalogCandidates, "");
  const strongFallbackValue = preferImportedNarrative(fallbackCandidates, "");
  const hasWeakCatalogValue = catalogCandidates.some((value) => Boolean(value && isWeakEditorialNarrative(value)));

  if (!strongCatalogValue && strongFallbackValue && hasWeakCatalogValue) {
    return strongFallbackValue;
  }

  if (strongCatalogValue) {
    return strongCatalogValue;
  }

  if (strongFallbackValue) {
    return strongFallbackValue;
  }

  return fallback;
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
    [destination.description, destination.introduction, destination.heroNarrative, researchProfile?.longFormEditorial, researchProfile?.overview, researchProfile?.whyThisPlaceFeelsDistinct],
    editorialFallback.intro,
  );

  const follow = chooseNarrativeText(
    [destination.overview, destination.heroNarrative, researchProfile?.whyThisPlaceFeelsDistinct, researchProfile?.whyPeopleLoveIt, researchProfile?.overview, researchProfile?.longFormEditorial],
    editorialFallback.follow,
    intro,
  );

  const dek = chooseNarrativeText(
    [destination.verdict, destination.lifestyleNarrative, destination.lifestyle, researchProfile?.retirementSuitability, researchProfile?.longFormEditorial, destination.description, destination.overview],
    editorialFallback.dek,
    intro,
  );

  const quote = chooseNarrativeText(
    [researchProfile?.whyPeopleLoveIt, researchProfile?.whyThisPlaceFeelsDistinct, researchProfile?.longFormEditorial, researchProfile?.overview],
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
  barcelona: "barcelona-spain",
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

const normalizeAdminFallbackKey = (value: string | null | undefined) =>
  (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const getAdminFallbackSlugCandidates = (value: string | null | undefined) => {
  const normalized = normalizeAdminFallbackKey(value);
  if (!normalized) return [];

  const candidates = new Set<string>([normalized]);
  const withoutCountrySuffix = normalized.replace(/-(?:us|usa|uk|gb|ca|canada|au|aus|nz|mx|de|fr|es|it|pt|jp|cn|kr|sg|ae|in|br|co|cl|za|se|no|dk|nl|be|gr|hr|ch|at|ie|fi|pl|cz|hu|ro|bg|rs|si|sk|tr|il|sa|eg|ma|my|th|vn|ph|id|pk|ng|ke|tz)$/g, "");
  if (withoutCountrySuffix) candidates.add(withoutCountrySuffix);
  return Array.from(candidates);
};

const hasAdminFallbackSlugMatch = (requestedValue: string | null | undefined, candidateValue: string | null | undefined) => {
  const requestedCandidates = getAdminFallbackSlugCandidates(requestedValue);
  const candidateCandidates = getAdminFallbackSlugCandidates(candidateValue);

  return requestedCandidates.some((requestedCandidate) => candidateCandidates.some((candidateCandidate) => {
    if (!requestedCandidate || !candidateCandidate) return false;
    return requestedCandidate === candidateCandidate
      || requestedCandidate.startsWith(`${candidateCandidate}-`)
      || candidateCandidate.startsWith(`${requestedCandidate}-`);
  }));
};

const buildDestinationFromAdminFallback = (slug: string, local: Destination | undefined): Destination | undefined => {
  const fallbackEntries = listAdminFallbackDestinations();
  if (fallbackEntries.length === 0) return local;

  const matchingFallback = fallbackEntries.find((entry) => {
    return hasAdminFallbackSlugMatch(slug, entry.slug)
      || hasAdminFallbackSlugMatch(slug, `${entry.city}-${entry.country}`)
      || hasAdminFallbackSlugMatch(slug, entry.city);
  });

  if (!matchingFallback) return local;

  const editorialContent = (matchingFallback.metadata?.editorialContent as Partial<DestinationEditorialContent> | undefined) ?? undefined;
  const researchProfile = (matchingFallback.metadata?.researchProfile as Partial<DestinationResearchProfile> | undefined) ?? undefined;
  const mergedResearchProfile = researchProfile ? {
    ...(local?.researchProfile ?? {}),
    ...researchProfile,
    longFormEditorial: researchProfile.longFormEditorial ?? editorialContent?.longFormEditorial ?? (local?.researchProfile as Partial<DestinationResearchProfile> | undefined)?.longFormEditorial,
    whyThisPlaceFeelsDistinct: researchProfile.whyThisPlaceFeelsDistinct ?? editorialContent?.whyThisPlaceFeelsDistinct ?? (local?.researchProfile as Partial<DestinationResearchProfile> | undefined)?.whyThisPlaceFeelsDistinct,
  } as DestinationResearchProfile : (editorialContent?.longFormEditorial || editorialContent?.whyThisPlaceFeelsDistinct)
    ? ({
        ...(local?.researchProfile ?? {}),
        longFormEditorial: editorialContent?.longFormEditorial,
        whyThisPlaceFeelsDistinct: editorialContent?.whyThisPlaceFeelsDistinct,
      } as DestinationResearchProfile)
    : local?.researchProfile;

  const description = preferImportedNarrative(
    [editorialContent?.introduction, editorialContent?.heroNarrative, researchProfile?.overview, matchingFallback.description, local?.description],
    matchingFallback.description ?? local?.description ?? "",
  );
  const overview = preferImportedNarrative(
    [editorialContent?.destinationOverview, editorialContent?.heroNarrative, researchProfile?.overview, matchingFallback.overview, local?.overview],
    matchingFallback.overview ?? local?.overview ?? "",
  );
  const climate = preferImportedNarrative(
    [editorialContent?.climateNarrative, researchProfile?.climate, local?.climate],
    local?.climate ?? "",
  );
  const lifestyle = preferImportedNarrative(
    [editorialContent?.lifestyleNarrative, researchProfile?.feel, local?.lifestyle],
    local?.lifestyle ?? "",
  );
  const transportation = preferImportedNarrative(
    [editorialContent?.transportationNarrative, researchProfile?.transportation, local?.transportation],
    local?.transportation ?? "",
  );

  return {
    ...(local ?? {}),
    slug: matchingFallback.slug || local?.slug || slug,
    city: matchingFallback.city || local?.city || "",
    country: matchingFallback.country || local?.country || "",
    description,
    overview,
    climate,
    lifestyle,
    transportation,
    introduction: editorialContent?.introduction ?? local?.introduction,
    heroNarrative: editorialContent?.heroNarrative ?? local?.heroNarrative,
    lifestyleNarrative: editorialContent?.lifestyleNarrative ?? local?.lifestyleNarrative,
    climateNarrative: editorialContent?.climateNarrative ?? local?.climateNarrative,
    transportationNarrative: editorialContent?.transportationNarrative ?? local?.transportationNarrative,
    verdict: editorialContent?.verdict ?? local?.verdict,
    researchProfile: mergedResearchProfile,
  };
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

const normalizeCatalogLookupValue = (value: string | null | undefined) =>
  (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .replace(/\s+/g, "");

export const findDestinationCatalogRow = (slug: string, local: Pick<Destination, "slug" | "city" | "country"> | undefined, rows: DestinationCatalogRow[]) => {
  const resolvedSlug = resolveDestinationSlug(slug);
  const normalizedResolvedSlug = normalizeCatalogLookupValue(resolvedSlug);
  const normalizedLocalSlug = normalizeCatalogLookupValue(local?.slug);
  const normalizedLocalCity = normalizeCatalogLookupValue(local?.city);
  const normalizedLocalCountry = normalizeCatalogLookupValue(local?.country);

  const directMatch = rows.find((row) => normalizeCatalogLookupValue(row.slug) === normalizedResolvedSlug || normalizeCatalogLookupValue(row.slug) === normalizedLocalSlug);
  if (directMatch) return directMatch;

  return rows.find((row) => {
    const normalizedRowSlug = normalizeCatalogLookupValue(row.slug);
    const normalizedRowCity = normalizeCatalogLookupValue(row.city);
    const normalizedRowCountry = normalizeCatalogLookupValue(row.country);
    const sameCity = normalizedRowCity && normalizedLocalCity && normalizedRowCity === normalizedLocalCity;
    const sameCountry = normalizedRowCountry && normalizedLocalCountry && normalizedRowCountry === normalizedLocalCountry;
    const addressMatch = sameCity && sameCountry;
    const slugVariantMatch = normalizedRowSlug && (normalizedResolvedSlug.includes(normalizedRowSlug) || normalizedRowSlug.includes(normalizedResolvedSlug));
    return addressMatch || slugVariantMatch;
  });
};

export const buildDestinationFromLocalContent = (local: Destination | undefined, slug: string): Destination | null => {
  if (!local) return null;

  const resolvedSlug = resolveDestinationSlug(slug);
  const withSourceOnlyNarrative = applySourceOnlyNarrative(local, resolvedSlug);
  return {
    ...withSourceOnlyNarrative,
    ...getDestinationEditorialFields(withSourceOnlyNarrative),
  };
};

export const buildDestinationFromCatalogRow = (
  row: DestinationCatalogRow,
  local: Destination | undefined,
  mediaRows: DestinationMediaRow[],
): Destination => {
  const mediaImages = mapMediaToImages(mediaRows, row.city);

  const editorialContent = row.metadata?.editorialContent;
  const researchProfile = row.metadata?.researchProfile ?? local?.researchProfile;
  const inferredLongFormEditorial = researchProfile?.longFormEditorial
    ?? editorialContent?.longFormEditorial
    ?? editorialContent?.destinationOverview
    ?? editorialContent?.heroNarrative
    ?? editorialContent?.introduction
    ?? researchProfile?.overview
    ?? (local?.researchProfile as Partial<DestinationResearchProfile> | undefined)?.longFormEditorial;
  const inferredWhyThisPlaceFeelsDistinct = researchProfile?.whyThisPlaceFeelsDistinct
    ?? editorialContent?.whyThisPlaceFeelsDistinct
    ?? researchProfile?.feel
    ?? editorialContent?.lifestyleNarrative
    ?? editorialContent?.heroNarrative
    ?? (local?.researchProfile as Partial<DestinationResearchProfile> | undefined)?.whyThisPlaceFeelsDistinct;
  const mergedResearchProfile = researchProfile ? {
    ...(local?.researchProfile ?? {}),
    ...researchProfile,
    longFormEditorial: inferredLongFormEditorial,
    whyThisPlaceFeelsDistinct: inferredWhyThisPlaceFeelsDistinct,
  } as DestinationResearchProfile : (editorialContent?.longFormEditorial || editorialContent?.whyThisPlaceFeelsDistinct || editorialContent?.destinationOverview || researchProfile?.feel)
    ? ({
        ...(local?.researchProfile ?? {}),
        longFormEditorial: inferredLongFormEditorial,
        whyThisPlaceFeelsDistinct: inferredWhyThisPlaceFeelsDistinct,
      } as DestinationResearchProfile)
    : local?.researchProfile;
  const sourceOnlyNarrative = getSourceOnlyNarrative(row.slug);

  const descriptionFallback = [local?.description, sourceOnlyNarrative?.description]
    .map((value) => value?.trim())
    .find((value): value is string => Boolean(value && value.length > 0))
    ?? `${row.city} is available in the DestinationFinderAI destination catalog with curated relocation details.`;
  const overviewFallback = [local?.overview, sourceOnlyNarrative?.overview]
    .map((value) => value?.trim())
    .find((value): value is string => Boolean(value && value.length > 0))
    ?? `${row.city} is available for relocation research and comparison.`;
  const climateFallback = [local?.climate, sourceOnlyNarrative?.climate]
    .map((value) => value?.trim())
    .find((value): value is string => Boolean(value && value.length > 0))
    ?? `Review local seasonality, humidity, and heat profile in ${row.city}.`;
  const lifestyleFallback = [local?.lifestyle, sourceOnlyNarrative?.lifestyle]
    .map((value) => value?.trim())
    .find((value): value is string => Boolean(value && value.length > 0))
    ?? `Evaluate neighborhood character, rhythm, and long-stay fit in ${row.city}.`;
  const transportationFallback = [local?.transportation, sourceOnlyNarrative?.transportation]
    .map((value) => value?.trim())
    .find((value): value is string => Boolean(value && value.length > 0))
    ?? fallbackTransportation(row.city, row.country);

  const destination: Destination = {
    slug: row.slug,
    city: row.city,
    country: row.country,
    emoji: local?.emoji ?? "🌍",
    match: local?.match ?? 78,
    description: selectCatalogNarrativeValue(
      [editorialContent?.introduction, editorialContent?.heroNarrative],
      [researchProfile?.overview, researchProfile?.whyThisPlaceFeelsDistinct, researchProfile?.longFormEditorial],
      [local?.description, sourceOnlyNarrative?.description],
      descriptionFallback,
      [row.description],
    ),
    overview: selectCatalogNarrativeValue(
      [editorialContent?.destinationOverview, editorialContent?.heroNarrative],
      [researchProfile?.overview, researchProfile?.whyThisPlaceFeelsDistinct, researchProfile?.longFormEditorial],
      [local?.overview, sourceOnlyNarrative?.overview],
      overviewFallback,
      [row.overview, row.description],
    ),
    climate: selectCatalogNarrativeValue(
      [editorialContent?.climateNarrative],
      [researchProfile?.climate, researchProfile?.overview],
      [local?.climate, sourceOnlyNarrative?.climate],
      climateFallback,
      [row.climate_summary],
    ),
    lifestyle: selectCatalogNarrativeValue(
      [editorialContent?.lifestyleNarrative],
      [researchProfile?.feel, researchProfile?.whyPeopleLoveIt, researchProfile?.overview],
      [local?.lifestyle, sourceOnlyNarrative?.lifestyle],
      lifestyleFallback,
      [row.lifestyle_summary],
    ),
    transportation: selectCatalogNarrativeValue(
      [editorialContent?.transportationNarrative],
      [researchProfile?.transportation, researchProfile?.overview],
      [local?.transportation, sourceOnlyNarrative?.transportation],
      transportationFallback,
      [row.transportation_summary],
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
    researchProfile: mergedResearchProfile,
  };

  return {
    ...destination,
    ...getDestinationEditorialFields(destination),
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

const fetchCatalogRowsForDestination = async (
  slug: string,
  local: Pick<Destination, "slug" | "city" | "country"> | undefined,
) => {
  const resolvedSlug = resolveDestinationSlug(slug);
  console.log("[destination-content] fetchCatalogRowsForDestination:start", { slug, resolvedSlug, local });
  writeTrace("[destination-content] fetchCatalogRowsForDestination:start", { slug, resolvedSlug, local });
  const exactResponse = await supabaseFetch(
    `/rest/v1/destinations_catalog?select=id,slug,city,country,tier,status,hero_image_url,description,overview,climate_summary,lifestyle_summary,transportation_summary,metadata&slug=eq.${encodeURIComponent(resolvedSlug)}&limit=1`,
    { cache: "no-store" },
  );

  if (!exactResponse.ok) {
    console.log("[destination-content] branch:exact-response-not-ok", { status: exactResponse.status });
    writeTrace("[destination-content] branch:exact-response-not-ok", { status: exactResponse.status });
    return [] as DestinationCatalogRow[];
  }

  const exactRows = (await exactResponse.json()) as DestinationCatalogRow[];
  console.log("[destination-content] exactRows", { count: exactRows.length, rows: exactRows });
  writeTrace("[destination-content] exactRows", { count: exactRows.length, rows: exactRows });
  if (exactRows.length > 0) {
    return exactRows;
  }

  const city = local?.city?.trim();
  const country = local?.country?.trim();
  if (!city || !country) {
    console.log("[destination-content] branch:no-city-country-for-address-fallback", { city, country });
    writeTrace("[destination-content] branch:no-city-country-for-address-fallback", { city, country });
    return exactRows;
  }

  console.log("[destination-content] branch:address-fallback", { city, country });
  writeTrace("[destination-content] branch:address-fallback", { city, country });
  const addressResponse = await supabaseFetch(
    `/rest/v1/destinations_catalog?select=id,slug,city,country,tier,status,hero_image_url,description,overview,climate_summary,lifestyle_summary,transportation_summary,metadata&city=eq.${encodeURIComponent(city)}&country=eq.${encodeURIComponent(country)}&limit=10`,
    { cache: "no-store" },
  );

  if (!addressResponse.ok) {
    console.log("[destination-content] branch:address-response-not-ok", { status: addressResponse.status });
    writeTrace("[destination-content] branch:address-response-not-ok", { status: addressResponse.status });
    return exactRows;
  }

  const addressRows = (await addressResponse.json()) as DestinationCatalogRow[];
  console.log("[destination-content] addressRows", { count: addressRows.length, rows: addressRows });
  writeTrace("[destination-content] addressRows", { count: addressRows.length, rows: addressRows });
  return addressRows;
};

export async function getDestinationContent(slug: string): Promise<DestinationContent | null> {
  const resolvedSlug = resolveDestinationSlug(slug);
  console.log("[destination-content] getDestinationContent:start", { slug, resolvedSlug });
  writeTrace("[destination-content] getDestinationContent:start", { slug, resolvedSlug });
  const local = enrichedDestinations.find((item) => item.slug === resolvedSlug || item.slug === slug);

  const localWithFallbackOverrides = buildDestinationFromAdminFallback(resolvedSlug, local);
  console.log("[destination-content] localWithFallbackOverrides", { localWithFallbackOverrides });
  writeTrace("[destination-content] localWithFallbackOverrides", { localWithFallbackOverrides });

  if (!isSupabaseConfigured()) {
    console.log("[destination-content] branch:supabase-not-configured");
    writeTrace("[destination-content] branch:supabase-not-configured", {});
    const destination = buildDestinationFromLocalContent(localWithFallbackOverrides, resolvedSlug);
    if (!destination) return null;
    const result = {
      source: "local",
      destination,
      mediaAssets: [],
      resourceLinks: [],
      videoLinks: [],
    } as DestinationContent;
    console.log("[destination-content] return:local", result);
    writeTrace("[destination-content] return:local", result);
    return result;
  }

  try {
    console.log("[destination-content] branch:supabase-configured");
    writeTrace("[destination-content] branch:supabase-configured", {});
    const rows = await fetchCatalogRowsForDestination(resolvedSlug, localWithFallbackOverrides);
    const row = findDestinationCatalogRow(resolvedSlug, localWithFallbackOverrides, rows);
    console.log("[destination-content] selected-row", { row });
    writeTrace("[destination-content] selected-row", { row });

    if (!row) {
      console.log("[destination-content] branch:no-catalog-row");
      writeTrace("[destination-content] branch:no-catalog-row", {});
      const destination = buildDestinationFromLocalContent(localWithFallbackOverrides, resolvedSlug);
      if (!destination) return null;
      const result = {
        source: "local",
        destination,
        mediaAssets: [],
        resourceLinks: [],
        videoLinks: [],
      } as DestinationContent;
      console.log("[destination-content] return:local-no-row", result);
      writeTrace("[destination-content] return:local-no-row", result);
      return result;
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

    const result = {
      source: "supabase",
      destination: buildDestinationFromCatalogRow(row, localWithFallbackOverrides, mediaRows),
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
    } as DestinationContent;
    console.log("[destination-content] return:supabase", result);
    writeTrace("[destination-content] return:supabase", result);
    return result;
  } catch (error) {
    console.error("[destination-content] branch:catch", error);
    writeTrace("[destination-content] branch:catch", { error });
    const destination = buildDestinationFromLocalContent(localWithFallbackOverrides, resolvedSlug);
    if (!destination) return null;
    const result = {
      source: "local",
      destination,
      mediaAssets: [],
      resourceLinks: [],
      videoLinks: [],
    } as DestinationContent;
    console.log("[destination-content] return:local-catch", result);
    writeTrace("[destination-content] return:local-catch", result);
    return result;
  }
}