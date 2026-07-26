import { destinations, type Destination } from "./destinations";

const EXCLUDED_TAGS = new Set([
  "expansion-candidate",
  "research-pending",
]);

const hasExcludedTag = (destination: Destination): boolean => {
  const tags = destination.tags?.map((tag) => tag.toLowerCase()) ?? [];
  return tags.some((tag) => EXCLUDED_TAGS.has(tag));
};

export const publicDestinations: Destination[] = destinations.filter((destination) => !hasExcludedTag(destination));

export const publicDestinationSlugSet = new Set(publicDestinations.map((destination) => destination.slug));

export const isPublicDestinationSlug = (slug: string): boolean => publicDestinationSlugSet.has(slug);
