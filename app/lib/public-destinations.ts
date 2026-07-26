import { enrichedDestinations } from "./destination-enrichment";
import type { Destination } from "./destinations";

const EXCLUDED_TAGS = new Set([
  "expansion-candidate",
  "research-pending",
]);

const hasExcludedTag = (destination: Destination): boolean => {
  // Keep US catalog entries visible even when they are still marked as expansion candidates.
  if (destination.country.toLowerCase() === "united states") {
    return false;
  }

  const tags = destination.tags?.map((tag) => tag.toLowerCase()) ?? [];
  return tags.some((tag) => EXCLUDED_TAGS.has(tag));
};

export const publicDestinations: Destination[] = enrichedDestinations.filter((destination) => !hasExcludedTag(destination));

export const publicDestinationSlugSet = new Set(publicDestinations.map((destination) => destination.slug));

export const isPublicDestinationSlug = (slug: string): boolean => publicDestinationSlugSet.has(slug);
