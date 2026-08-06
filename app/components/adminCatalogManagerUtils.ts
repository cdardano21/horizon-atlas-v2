export type AdminCatalogDestinationLike = {
  city: string;
  country: string;
  slug: string;
};

export function normalizeDestinationIdentity(input: { city?: string; country?: string; slug?: string }) {
  const city = input.city?.trim() ?? "";
  const country = input.country?.trim() ?? "";
  const slug = input.slug?.trim() ? input.slug.trim() : `${city}-${country}`;

  const normalizedSlug = slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return {
    city,
    country,
    slug: normalizedSlug || `${city}-${country}`.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""),
  };
}

export function filterDestinationsByQuery<T extends AdminCatalogDestinationLike>(
  destinations: T[],
  query: string,
): T[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return destinations;
  }

  return destinations.filter((destination) => {
    const haystack = [destination.city, destination.country, destination.slug]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });
}

export type DestinationCatalogFilter = {
  query?: string;
  status?: string;
  tier?: string;
  sort?: "newest" | "oldest";
};

export function filterDestinationsByCatalog<T extends AdminCatalogDestinationLike & {
  status?: string;
  tier?: string;
  updated_at?: string;
}>(
  destinations: T[],
  filter: DestinationCatalogFilter = {},
): T[] {
  const normalizedQuery = filter.query?.trim().toLowerCase() ?? "";
  const status = filter.status?.trim().toLowerCase() ?? "";
  const tier = filter.tier?.trim().toLowerCase() ?? "";

  const filtered = destinations.filter((destination) => {
    const haystack = [destination.city, destination.country, destination.slug]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
    const matchesStatus = !status || destination.status?.toLowerCase() === status;
    const matchesTier = !tier || destination.tier?.toLowerCase() === tier;

    return matchesQuery && matchesStatus && matchesTier;
  });

  return filtered.sort((left, right) => {
    const leftDate = left.updated_at ? new Date(left.updated_at).getTime() : 0;
    const rightDate = right.updated_at ? new Date(right.updated_at).getTime() : 0;

    if (filter.sort === "oldest") {
      return leftDate - rightDate;
    }

    return rightDate - leftDate;
  });
}

export function upsertItemById<T extends { id: string }>(items: T[], item: T): T[] {
  return [item, ...items.filter((existing) => existing.id !== item.id)];
}

export type DestinationWorkflowState = {
  statusLabel: string;
  canPublish: boolean;
  requiresPreview: boolean;
};

export function normalizeDestinationStatus(status?: string): "draft" | "review" | "published" | "archived" {
  switch (status?.trim().toLowerCase()) {
    case "published":
      return "published";
    case "review":
      return "review";
    case "archived":
      return "archived";
    case "draft":
    default:
      return "draft";
  }
}

export type DestinationEditorFormState = {
  city: string;
  country: string;
  slug: string;
  status: "draft" | "review" | "published" | "archived";
  tier: string;
  description: string;
  overview: string;
};

export function buildEditorFormFromDestination<T extends {
  city: string;
  country: string;
  slug: string;
  status?: string;
  tier?: string;
  description?: string | null;
  overview?: string | null;
}>(destination: T): DestinationEditorFormState {
  return {
    city: destination.city ?? "",
    country: destination.country ?? "",
    slug: destination.slug ?? "",
    status: normalizeDestinationStatus(destination.status),
    tier: destination.tier ?? "",
    description: destination.description ?? "",
    overview: destination.overview ?? "",
  };
}

export function getDestinationWorkflowState(status: string): DestinationWorkflowState {
  switch (normalizeDestinationStatus(status)) {
    case "published":
      return { statusLabel: "Published", canPublish: false, requiresPreview: false };
    case "review":
      return { statusLabel: "Review", canPublish: true, requiresPreview: true };
    case "archived":
      return { statusLabel: "Archived", canPublish: false, requiresPreview: true };
    default:
      return { statusLabel: "Draft", canPublish: true, requiresPreview: true };
  }
}
