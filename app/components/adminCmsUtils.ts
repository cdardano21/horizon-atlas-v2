export type AdminCmsStatus = "draft" | "review" | "published" | "archived";

export type AdminCmsDestination = {
  id: string;
  slug: string;
  city: string;
  country: string;
  state?: string;
  province?: string;
  region?: string;
  continent?: string;
  status: AdminCmsStatus;
  tier?: string;
  featured?: boolean;
  needsReview?: boolean;
  missingImages?: boolean;
  missingAiSummary?: boolean;
  missingClimate?: boolean;
  missingHealthcare?: boolean;
  missingCostOfLiving?: boolean;
  missingVideos?: boolean;
  missingResources?: boolean;
  retirementScore?: number;
  livingHereScore?: number;
  costOfLiving?: string;
  tags: string[];
  categories: string[];
  description?: string;
  overview?: string;
  updatedAt: string;
  createdAt: string;
  aiSummary?: string;
  climate?: string;
  healthcare?: string;
};

export type AdminCmsCategory = {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon: string;
  parentId?: string;
  order: number;
};

export type AdminCmsTag = {
  id: string;
  name: string;
  color: string;
  order: number;
};

export type AdminCmsMediaAsset = {
  id: string;
  name: string;
  type: "image" | "video" | "pdf" | "document" | "youtube" | "tiktok" | "instagram";
  url: string;
  description: string;
  category: string;
  createdAt: string;
};

export type AdminCmsSearchFilter = {
  query?: string;
  status?: string;
  featured?: boolean;
  needsReview?: boolean;
  missingImages?: boolean;
  missingAiSummary?: boolean;
  missingClimate?: boolean;
  missingHealthcare?: boolean;
  missingCostOfLiving?: boolean;
  missingVideos?: boolean;
  missingResources?: boolean;
  recentlyUpdated?: boolean;
  recentlyAdded?: boolean;
  sortBy?: "name" | "score" | "updated" | "country" | "population" | "cost";
};

export function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function createAdminCmsDestination(input: Partial<AdminCmsDestination> & { id?: string; city: string; country: string }) {
  return {
    id: input.id ?? `destination-${Math.random().toString(36).slice(2, 8)}`,
    slug: input.slug ?? createSlug(`${input.city}-${input.country}`),
    city: input.city,
    country: input.country,
    state: input.state ?? "",
    province: input.province ?? "",
    region: input.region ?? "",
    continent: input.continent ?? "",
    status: input.status ?? "draft",
    tier: input.tier ?? "launch",
    featured: input.featured ?? false,
    needsReview: input.needsReview ?? false,
    missingImages: input.missingImages ?? false,
    missingAiSummary: input.missingAiSummary ?? false,
    missingClimate: input.missingClimate ?? false,
    missingHealthcare: input.missingHealthcare ?? false,
    missingCostOfLiving: input.missingCostOfLiving ?? false,
    missingVideos: input.missingVideos ?? false,
    missingResources: input.missingResources ?? false,
    retirementScore: input.retirementScore ?? 70,
    livingHereScore: input.livingHereScore ?? 75,
    costOfLiving: input.costOfLiving ?? "Moderate",
    tags: input.tags ?? [],
    categories: input.categories ?? [],
    description: input.description ?? "",
    overview: input.overview ?? "",
    updatedAt: input.updatedAt ?? new Date().toISOString(),
    createdAt: input.createdAt ?? new Date().toISOString(),
    aiSummary: input.aiSummary ?? "",
    climate: input.climate ?? "",
    healthcare: input.healthcare ?? "",
  } satisfies AdminCmsDestination;
}

export function buildAdminCmsDestinationIndex(source: Array<Partial<AdminCmsDestination> & { city: string; country: string }>) {
  return source.map((item) => createAdminCmsDestination(item));
}

export function searchAdminDestinations(destinations: AdminCmsDestination[], query: string) {
  const normalized = normalizeSearchText(query);
  if (!normalized) {
    return destinations.map((destination) => ({ destination, matches: [] as string[], score: 0 }));
  }

  return destinations
    .map((destination) => {
      const haystack = [
        destination.city,
        destination.country,
        destination.state,
        destination.province,
        destination.region,
        destination.continent,
        destination.slug,
        ...destination.tags,
        ...destination.categories,
        destination.retirementScore?.toString(),
        destination.livingHereScore?.toString(),
        destination.costOfLiving,
      ]
        .filter(Boolean)
        .map((entry) => normalizeSearchText(String(entry)))
        .join(" ");

      const matches = new Set<string>();
      if (haystack.includes(normalized)) {
        matches.add("match");
      }

      return { destination, matches: Array.from(matches), score: haystack.includes(normalized) ? 1 : 0 };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => (left.destination.city > right.destination.city ? 1 : -1));
}

export function filterAdminDestinations(destinations: AdminCmsDestination[], filter: AdminCmsSearchFilter) {
  const normalizedQuery = normalizeSearchText(filter.query ?? "");

  const filtered = destinations.filter((destination) => {
    const matchesQuery = !normalizedQuery || [
      destination.city,
      destination.country,
      destination.state,
      destination.province,
      destination.region,
      destination.continent,
      destination.slug,
      ...destination.tags,
      ...destination.categories,
      destination.retirementScore?.toString(),
      destination.livingHereScore?.toString(),
      destination.costOfLiving,
    ]
      .filter(Boolean)
      .map((entry) => normalizeSearchText(String(entry)))
      .join(" ")
      .includes(normalizedQuery);

    const matchesStatus = !filter.status || filter.status === "all" ? true : destination.status === filter.status;
    const matchesFeatured = filter.featured ? Boolean(destination.featured) : true;
    const matchesReview = filter.needsReview ? Boolean(destination.needsReview) : true;
    const matchesImages = filter.missingImages ? Boolean(destination.missingImages) : true;
    const matchesAiSummary = filter.missingAiSummary ? Boolean(destination.missingAiSummary) : true;
    const matchesClimate = filter.missingClimate ? Boolean(destination.missingClimate) : true;
    const matchesHealthcare = filter.missingHealthcare ? Boolean(destination.missingHealthcare) : true;
    const matchesCost = filter.missingCostOfLiving ? Boolean(destination.missingCostOfLiving) : true;
    const matchesVideos = filter.missingVideos ? Boolean(destination.missingVideos) : true;
    const matchesResources = filter.missingResources ? Boolean(destination.missingResources) : true;
    const matchesRecentlyUpdated = filter.recentlyUpdated ? new Date(destination.updatedAt) > new Date(Date.now() - 1000 * 60 * 60 * 24 * 14) : true;
    const matchesRecentlyAdded = filter.recentlyAdded ? new Date(destination.createdAt) > new Date(Date.now() - 1000 * 60 * 60 * 24 * 30) : true;

    return matchesQuery && matchesStatus && matchesFeatured && matchesReview && matchesImages && matchesAiSummary && matchesClimate && matchesHealthcare && matchesCost && matchesVideos && matchesResources && matchesRecentlyUpdated && matchesRecentlyAdded;
  });

  return filtered.sort((left, right) => {
    switch (filter.sortBy) {
      case "score":
        return (right.livingHereScore ?? 0) - (left.livingHereScore ?? 0);
      case "country":
        return left.country.localeCompare(right.country);
      case "population":
        return (right.retirementScore ?? 0) - (left.retirementScore ?? 0);
      case "cost":
        return (left.costOfLiving ?? "").localeCompare(right.costOfLiving ?? "");
      case "updated":
        return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
      case "name":
      default:
        return left.city.localeCompare(right.city);
    }
  });
}

export function buildDashboardMetrics(destinations: AdminCmsDestination[]) {
  return {
    total: destinations.length,
    published: destinations.filter((item) => item.status === "published").length,
    draft: destinations.filter((item) => item.status === "draft").length,
    missingContent: destinations.filter((item) => item.missingAiSummary || item.missingImages || item.missingClimate || item.missingHealthcare || item.missingCostOfLiving || item.missingVideos || item.missingResources).length,
    recentlyEdited: destinations.filter((item) => new Date(item.updatedAt) > new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)).length,
    aiStatus: `${destinations.filter((item) => item.aiSummary).length}/${destinations.length}`,
    brokenLinks: destinations.filter((item) => item.missingResources).length,
    missingMedia: destinations.filter((item) => item.missingImages).length,
    categoryCounts: destinations.reduce<Record<string, number>>((accumulator, destination) => {
      destination.categories.forEach((category) => {
        accumulator[category] = (accumulator[category] ?? 0) + 1;
      });
      return accumulator;
    }, {}),
  };
}

export function highlightSearchTerm(text: string, query: string) {
  if (!query.trim()) {
    return text;
  }

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "ig");
  return text.replace(regex, "<mark>$1</mark>");
}
