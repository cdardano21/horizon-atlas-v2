"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";

const STORAGE_KEY = "destinationfinderai:favorites";
const EMPTY_FAVORITE_SLUGS: string[] = [];

let cachedFavoriteSlugs: string[] | null = null;
const listeners = new Set<() => void>();

const normalizeSlugs = (slugs: string[]) => Array.from(new Set(slugs.map((slug) => slug.trim()).filter(Boolean)));

const readFavoriteSlugs = () => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return normalizeSlugs(parsed.filter((slug): slug is string => typeof slug === "string"));
  } catch {
    return [];
  }
};

async function persistFavoriteSlugs(slugs: string[]) {
  try {
    const response = await fetch("/api/favorites", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slugs }),
    });
    return response.ok;
  } catch {
    // Local storage remains the fallback when auth is unavailable.
    return false;
  }
}

const writeFavoriteSlugs = (slugs: string[], options?: { syncRemote?: boolean }) => {
  cachedFavoriteSlugs = normalizeSlugs(slugs);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedFavoriteSlugs));
  }

  for (const listener of listeners) {
    listener();
  }

  if (options?.syncRemote !== false) {
    void persistFavoriteSlugs(cachedFavoriteSlugs);
  }
};

const getSnapshot = () => {
  if (cachedFavoriteSlugs === null) {
    cachedFavoriteSlugs = readFavoriteSlugs();
  }

  return cachedFavoriteSlugs;
};

const getServerSnapshot = () => EMPTY_FAVORITE_SLUGS;

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export type FavoritesState = {
  favoriteSlugs: string[];
  favoriteSet: Set<string>;
  isFavorite: (slug: string) => boolean;
  toggleFavorite: (slug: string) => void;
  removeFavorite: (slug: string) => void;
  clearFavorites: () => void;
};

export const getFavoriteSlugs = () => getSnapshot();

export const setFavoriteSlugs = (slugs: string[]) => {
  writeFavoriteSlugs(slugs);
};

export const saveFavoriteSlugs = async (slugs: string[]) => {
  writeFavoriteSlugs(slugs, { syncRemote: false });
  return persistFavoriteSlugs(slugs);
};

export const buildFavoritesShareUrl = (slugs: string[]) => {
  if (slugs.length === 0) return "/profile";
  return `/profile?cities=${encodeURIComponent(slugs.join(","))}`;
};

export const buildCompareUrl = (slugs: string[]) => {
  if (slugs.length === 0) return "/compare";
  return `/compare?slugs=${encodeURIComponent(slugs.join(","))}`;
};

export function useFavorites(): FavoritesState {
  const favoriteSlugs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    let cancelled = false;

    const loadRemoteFavorites = async () => {
      try {
        const response = await fetch("/api/favorites", { cache: "no-store" });
        if (!response.ok) return;

        const payload: { authenticated?: boolean; slugs?: string[] } = await response.json();
        if (!cancelled && payload.authenticated && Array.isArray(payload.slugs)) {
          const merged = normalizeSlugs([...getSnapshot(), ...payload.slugs]);
          writeFavoriteSlugs(merged, { syncRemote: false });
          void persistFavoriteSlugs(merged);
        }
      } catch {
        // fall back to local storage
      }
    };

    void loadRemoteFavorites();

    return () => {
      cancelled = true;
    };
  }, []);

  const favoriteSet = useMemo(() => new Set(favoriteSlugs), [favoriteSlugs]);

  const isFavorite = useCallback((slug: string) => favoriteSet.has(slug), [favoriteSet]);

  const toggleFavorite = useCallback((slug: string) => {
    const current = getSnapshot();
    if (current.includes(slug)) {
      writeFavoriteSlugs(current.filter((item) => item !== slug));
      return;
    }

    writeFavoriteSlugs([...current, slug]);
  }, []);

  const removeFavorite = useCallback((slug: string) => {
    const current = getSnapshot();
    if (!current.includes(slug)) return;
    writeFavoriteSlugs(current.filter((item) => item !== slug));
  }, []);

  const clearFavorites = useCallback(() => {
    writeFavoriteSlugs([]);
  }, []);

  return {
    favoriteSlugs,
    favoriteSet,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    clearFavorites,
  };
}