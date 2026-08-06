import { isSupabaseConfigured } from "./supabase";

type AdminFallbackDestination = {
  id: string;
  slug: string;
  city: string;
  country: string;
  status: "draft" | "review" | "published" | "archived";
  tier: string;
  description: string | null;
  overview: string | null;
  updated_at: string;
  metadata: {
    relocationProfile?: unknown;
    memberDetails?: unknown;
    editorialContent?: unknown;
    researchProfile?: unknown;
  } | null;
};

type AdminFallbackAsset = {
  id: string;
  destination_id: string;
  assetType: "media" | "resource" | "video";
  label: string;
  url: string;
  provider: string;
  category: string;
  kind: string;
  embedUrl: string;
  created_at: string;
};

type AdminFallbackDatasetRow = {
  destination_id: string;
  [key: string]: unknown;
};

type AdminFallbackStore = {
  destinations: AdminFallbackDestination[];
  assets: AdminFallbackAsset[];
  tags: Map<string, Set<string>>;
  datasets: Map<string, Map<string, AdminFallbackDatasetRow[]>>;
};

declare global {
  var __haAdminLocalFallbackStore: AdminFallbackStore | undefined;
}

const localFallbackStore = (): AdminFallbackStore => {
  if (!globalThis.__haAdminLocalFallbackStore) {
    globalThis.__haAdminLocalFallbackStore = {
      destinations: [],
      assets: [],
      tags: new Map(),
      datasets: new Map(),
    };
  }

  return globalThis.__haAdminLocalFallbackStore;
};

export const getAdminLocalFallbackStore = () => localFallbackStore();

export const shouldUseAdminLocalFallback = (accessToken: string | null, user: unknown, adminRole: string | null) => {
  const isLocalDev = process.env.NODE_ENV === "development";
  const hasServiceRoleKey = Boolean(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);
  const supabaseConfigured = isSupabaseConfigured();
  return isLocalDev && !supabaseConfigured && !hasServiceRoleKey && !accessToken && !user && !adminRole;
};

const normalizeSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const nowIso = () => new Date().toISOString();

export const createAdminFallbackDestination = (input: {
  city: string;
  country: string;
  slug?: string;
  status?: AdminFallbackDestination["status"];
  tier?: string;
  description?: string | null;
  overview?: string | null;
}) => {
  const store = localFallbackStore();
  const city = input.city.trim();
  const country = input.country.trim();
  const slug = normalizeSlug(input.slug ?? `${city}-${country}`);

  if (!city || !country || !slug) {
    throw new Error("City, country, and slug are required.");
  }

  const destination: AdminFallbackDestination = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    slug,
    city,
    country,
    status: input.status ?? "draft",
    tier: input.tier ?? "launch",
    description: input.description?.trim() || null,
    overview: input.overview?.trim() || null,
    updated_at: nowIso(),
    metadata: null,
  };

  store.destinations.unshift(destination);
  store.tags.set(destination.id, new Set());
  store.datasets.set(destination.id, new Map());
  return destination;
};

export const listAdminFallbackDestinations = () => localFallbackStore().destinations.slice();

export const updateAdminFallbackDestination = (
  destinationId: string,
  updates: Partial<Pick<AdminFallbackDestination, "slug" | "city" | "country" | "status" | "tier" | "description" | "overview" | "metadata">>,
) => {
  const store = localFallbackStore();
  const destination = store.destinations.find((item) => item.id === destinationId);
  if (!destination) {
    return null;
  }

  const nextMetadata = updates.metadata
    ? Object.entries(updates.metadata).reduce<Record<string, unknown>>((accumulator, [key, value]) => {
        if (value === undefined || value === null) {
          delete accumulator[key];
        } else {
          accumulator[key] = value;
        }
        return accumulator;
      }, { ...(destination.metadata ?? {}) })
    : destination.metadata;

  Object.assign(destination, {
    ...updates,
    metadata: nextMetadata,
    updated_at: nowIso(),
  });

  return destination;
};

export const deleteAdminFallbackDestination = (destinationId: string) => {
  const store = localFallbackStore();
  const before = store.destinations.length;
  store.destinations = store.destinations.filter((item) => item.id !== destinationId);
  store.tags.delete(destinationId);
  store.datasets.delete(destinationId);
  store.assets = store.assets.filter((item) => item.destination_id !== destinationId);
  return store.destinations.length < before;
};

export const upsertAdminFallbackAsset = (payload: Omit<AdminFallbackAsset, "id" | "created_at"> & { id?: string }) => {
  const store = localFallbackStore();
  const asset: AdminFallbackAsset = {
    id: payload.id ?? `asset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    destination_id: payload.destination_id,
    assetType: payload.assetType,
    label: payload.label,
    url: payload.url,
    provider: payload.provider,
    category: payload.category,
    kind: payload.kind,
    embedUrl: payload.embedUrl,
    created_at: nowIso(),
  };

  store.assets = [asset, ...store.assets.filter((item) => item.id !== asset.id)];
  return asset;
};

export const listAdminFallbackAssets = (destinationId: string) =>
  localFallbackStore().assets.filter((asset) => asset.destination_id === destinationId);

export const addAdminFallbackTag = (destinationId: string, tag: string) => {
  const store = localFallbackStore();
  const set = store.tags.get(destinationId) ?? new Set<string>();
  set.add(tag);
  store.tags.set(destinationId, set);
};

export const listAdminFallbackTags = (destinationId: string) =>
  Array.from(localFallbackStore().tags.get(destinationId) ?? []).sort();

export const removeAdminFallbackTag = (destinationId: string, tag: string) => {
  const store = localFallbackStore();
  const set = store.tags.get(destinationId);
  if (!set) return false;
  const removed = set.delete(tag);
  if (set.size === 0) {
    store.tags.delete(destinationId);
  }
  return removed;
};

export const renameAdminFallbackTag = (destinationId: string, currentTag: string, nextTag: string) => {
  const set = localFallbackStore().tags.get(destinationId);
  if (!set || !set.has(currentTag)) return false;
  set.delete(currentTag);
  set.add(nextTag);
  return true;
};

export const saveAdminFallbackDataset = (destinationId: string, dataset: string, rows: unknown[]) => {
  const store = localFallbackStore();
  const datasetMap = store.datasets.get(destinationId) ?? new Map<string, AdminFallbackDatasetRow[]>();
  datasetMap.set(dataset, rows.map((row) => ({ destination_id: destinationId, ...(row as Record<string, unknown>) })));
  store.datasets.set(destinationId, datasetMap);
  return datasetMap.get(dataset) ?? [];
};

export const loadAdminFallbackDataset = (destinationId: string, dataset: string) => {
  const store = localFallbackStore();
  const datasetMap = store.datasets.get(destinationId);
  return datasetMap?.get(dataset) ?? [];
};
