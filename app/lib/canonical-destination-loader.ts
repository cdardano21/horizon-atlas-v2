import { destinations as localDestinations } from "./destinations";
import { buildDestinationKnowledgeProfile } from "./destination-knowledge-engine";
import type { CanonicalDestination, CanonicalDestinationBudget, CanonicalDestinationKnowledgeProfile, CanonicalDestinationMedia, CanonicalDestinationResource, PremiumEditorialContent } from "./canonical-destination-model";
import { isSupabaseConfigured, supabaseFetch } from "./supabase";

const canonicalDestinations: CanonicalDestination[] = [];

const normalizeTextValue = (value: string | null | undefined) => {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return trimmed;
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

const buildFallbackCanonicalDestination = (slug: string): CanonicalDestination | null => {
  const local = localDestinations.find((item) => item.slug === slug);
  if (!local) return null;

  const city = local.city;
  const country = local.country;
  const premiumMaps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${city} ${country}`)}`;
  const premiumEarth = `https://earth.google.com/web/search/${encodeURIComponent(`${city} ${country}`)}`;
  const knowledgeProfile = buildDestinationKnowledgeProfile(local);
  const fallbackResources = buildFallbackResources(city, country);
  const fallbackMedia = buildFallbackMedia(city, country);
  const fallbackBudgets = buildFallbackBudgets(city);

  return {
    slug: local.slug,
    city,
    country,
    title: local.title ?? local.city,
    subtitle: local.subtitle ?? `${local.city}, ${local.country}`,
    heroNarrative: normalizeTextValue(local.heroNarrative ?? local.description) || "",
    overview: normalizeTextValue(local.overview ?? local.description) || "",
    editorial: normalizeTextValue(local.description ?? local.overview) || "",
    whyThisPlaceFeelsDistinct: normalizeTextValue(local.researchProfile?.whyThisPlaceFeelsDistinct) || "",
    dailyLife: normalizeTextValue(local.lifestyle ?? local.researchProfile?.feel) || "",
    climate: normalizeTextValue(local.climate ?? local.researchProfile?.climate) || "",
    transportation: normalizeTextValue(local.transportation ?? local.researchProfile?.transportation) || "",
    healthcare: normalizeTextValue(local.researchProfile?.healthcare) || "",
    costOfLiving: normalizeTextValue(local.researchProfile?.costOfLiving) || "",
    walkability: normalizeTextValue(local.researchProfile?.walkability) || "",
    internet: normalizeTextValue(local.researchProfile?.internet) || "",
    safety: normalizeTextValue(local.researchProfile?.safety) || "",
    neighborhoods: local.researchProfile?.bestNeighborhoods ?? [],
    restaurants: [],
    museums: local.researchProfile?.museums ?? [],
    golf: local.researchProfile?.golf ?? [],
    beaches: local.researchProfile?.beaches ?? [],
    outdoorRecreation: local.researchProfile?.attractions ?? [],
    pros: local.researchProfile?.pros ?? [],
    cons: local.researchProfile?.cons ?? [],
    retirement: normalizeTextValue(local.researchProfile?.longStaySuitability) || "",
    digitalNomad: normalizeTextValue(local.researchProfile?.digitalNomadSuitability) || "",
    family: normalizeTextValue(local.researchProfile?.familyFriendliness) || "",
    weather: normalizeTextValue(local.climate ?? local.researchProfile?.climate) || "",
    monthlyBudgets: fallbackBudgets,
    airportInfo: "",
    googleMapsUrl: premiumMaps,
    googleEarthUrl: premiumEarth,
    officialTourismUrl: `https://www.google.com/search?q=${encodeURIComponent(`${city} ${country} tourism`)}`,
    wikipediaUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(city)}`,
    youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${city} ${country} travel guide`)}`,
    tiktokUrl: `https://www.tiktok.com/search?q=${encodeURIComponent(`${city} ${country} travel`)}`,
    instagramUrl: `https://www.instagram.com/explore/tags/${encodeURIComponent(city.toLowerCase())}`,
    webcamUrl: `https://www.google.com/search?q=${encodeURIComponent(`${city} ${country} webcam`)}`,
    resources: fallbackResources,
    knowledgeProfile,
    premiumEditorialContent: local.premiumEditorialContent,
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
    structuredResources: buildFallbackResources(city, country),
    videos: [],
    media: fallbackMedia,
    heroImages: fallbackMedia,
    mediaGallery: fallbackMedia,
    sections: {},
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
  };
};

export async function getCanonicalDestination(slug: string): Promise<CanonicalDestination | null> {
  const normalizedSlug = slug.trim().toLowerCase();
  const cached = canonicalDestinations.find((item) => item.slug === normalizedSlug);
  if (cached) return cached;

  if (!isSupabaseConfigured()) {
    const fallback = buildFallbackCanonicalDestination(normalizedSlug);
    if (!fallback) return null;
    canonicalDestinations.push(fallback);
    return fallback;
  }

  try {
    const response = await supabaseFetch(`/rest/v1/destinations?slug=eq.${encodeURIComponent(normalizedSlug)}&select=*`, {
      cache: "no-store",
    });

    if (!response.ok) {
      const fallback = buildFallbackCanonicalDestination(normalizedSlug);
      if (!fallback) return null;
      canonicalDestinations.push(fallback);
      return fallback;
    }

    const rows = (await response.json()) as Array<Record<string, unknown>>;
    const row = rows[0];
    if (!row) {
      const fallback = buildFallbackCanonicalDestination(normalizedSlug);
      if (!fallback) return null;
      canonicalDestinations.push(fallback);
      return fallback;
    }

    const destination: CanonicalDestination = {
      slug: String(row.slug ?? normalizedSlug),
      city: String(row.city ?? ""),
      country: String(row.country ?? ""),
      title: String(row.title ?? row.city ?? ""),
      subtitle: String(row.subtitle ?? ""),
      heroNarrative: String(row.hero_narrative ?? row.description ?? ""),
      overview: String(row.overview ?? row.description ?? ""),
      editorial: String(row.editorial ?? row.description ?? ""),
      whyThisPlaceFeelsDistinct: String(row.why_this_place_feels_distinct ?? row.overview ?? ""),
      dailyLife: String(row.daily_life ?? row.lifestyle ?? ""),
      climate: String(row.climate ?? ""),
      transportation: String(row.transportation ?? ""),
      healthcare: String(row.healthcare ?? ""),
      costOfLiving: String(row.cost_of_living ?? ""),
      walkability: String(row.walkability ?? ""),
      internet: String(row.internet ?? ""),
      safety: String(row.safety ?? ""),
      neighborhoods: Array.isArray(row.neighborhoods) ? row.neighborhoods.map(String) : [],
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
      monthlyBudgets: Array.isArray(row.monthly_budgets) ? (row.monthly_budgets as unknown[]).map((item) => item as Record<string, unknown>).map((item) => ({
        label: String(item.label ?? ""),
        amount: String(item.amount ?? ""),
        note: String(item.note ?? ""),
      })) : [],
      airportInfo: String(row.airport_info ?? ""),
      googleMapsUrl: String(row.google_maps_url ?? ""),
      googleEarthUrl: String(row.google_earth_url ?? ""),
      officialTourismUrl: String(row.official_tourism_url ?? ""),
      wikipediaUrl: String(row.wikipedia_url ?? ""),
      youtubeUrl: String(row.youtube_url ?? ""),
      tiktokUrl: String(row.tiktok_url ?? ""),
      instagramUrl: String(row.instagram_url ?? ""),
      webcamUrl: String(row.webcam_url ?? ""),
      resources: Array.isArray(row.resources) ? (row.resources as unknown[]).map((resource) => resource as Record<string, unknown>).map((resource) => ({
        category: String(resource.category ?? ""),
        label: String(resource.label ?? ""),
        provider: typeof resource.provider === "string" ? resource.provider : null,
        url: String(resource.url ?? ""),
      })) : [],
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
      media: Array.isArray(row.media) ? (row.media as unknown[]).map((item) => item as Record<string, unknown>).map((item) => ({
        kind: String(item.kind ?? ""),
        url: String(item.url ?? ""),
        altText: String(item.alt_text ?? ""),
        caption: String(item.caption ?? ""),
        isPrimary: Boolean(item.is_primary),
      })) : [],
      heroImages: Array.isArray(row.hero_images) ? (row.hero_images as unknown[]).map((item) => item as Record<string, unknown>).map((item) => ({
        kind: String(item.kind ?? "image"),
        url: String(item.url ?? ""),
        altText: String(item.alt_text ?? ""),
        caption: String(item.caption ?? ""),
        isPrimary: Boolean(item.is_primary),
      })) : [],
      mediaGallery: Array.isArray(row.media_gallery) ? (row.media_gallery as unknown[]).map((item) => item as Record<string, unknown>).map((item) => ({
        kind: String(item.kind ?? "image"),
        url: String(item.url ?? ""),
        altText: String(item.alt_text ?? ""),
        caption: String(item.caption ?? ""),
        isPrimary: Boolean(item.is_primary),
      })) : [],
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
      premiumEditorialContent: parsePremiumEditorialContent(row.premium_editorial_content) ?? localDestinations.find((item) => item.slug === normalizedSlug)?.premiumEditorialContent,
      knowledgeProfile: parseKnowledgeProfile(row.knowledge_profile ?? row.knowledgeProfile) ?? localDestinations.find((item) => item.slug === normalizedSlug)?.knowledgeProfile ?? buildDestinationKnowledgeProfile(localDestinations.find((item) => item.slug === normalizedSlug) ?? { city: String(row.city ?? ""), country: String(row.country ?? "") }),
    };

    canonicalDestinations.push(destination);
    return destination;
  } catch {
    const fallback = buildFallbackCanonicalDestination(normalizedSlug);
    if (!fallback) return null;
    canonicalDestinations.push(fallback);
    return fallback;
  }
}
