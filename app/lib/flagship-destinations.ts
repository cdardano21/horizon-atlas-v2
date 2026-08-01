import type { Destination } from "./destinations";

export const FLAGSHIP_DESTINATION_SLUGS = [
  "valencia-spain",
  "porto-portugal",
  "matera-italy",
  "chiang-mai-thailand",
  "lisbon-portugal",
  "tivat-montenegro",
  "cavtat-croatia",
  "rovinj-croatia",
  "trieste-italy",
] as const;

const FEATURED_PRIORITY_SLUGS = [
  "cartago-costa-rica",
  "mazatlan-mexico",
  "puerto-escondido-mexico",
  "todos-santos-mexico",
  "alajuela-costa-rica",
  "atenas-costa-rica",
  "coronado-panama",
  "el-valle-de-anton-panama",
  "las-tablas-panama",
  "cumbaya-ecuador",
] as const;

const FLAGSHIP_SET = new Set<string>(FLAGSHIP_DESTINATION_SLUGS);
const PRIORITY_SET = new Set<string>(FEATURED_PRIORITY_SLUGS);

const countMediaAssets = (destination: Destination) => destination.images.filter((image) => image.src?.trim()).length;

const countTags = (destination: Destination) => destination.tags?.filter(Boolean).length ?? 0;

const hasSubstantiveSummary = (destination: Destination) => {
  const text = [destination.description, destination.overview, destination.climate, destination.lifestyle, destination.transportation]
    .join(" ")
    .trim();

  return text.length >= 260;
};

export function isFlagshipDestination(slug: string): boolean {
  return FLAGSHIP_SET.has(slug);
}

export function sortDestinationsForFeaturedPlacement(destinations: Destination[]): Destination[] {
  return [...destinations].sort((left, right) => {
    const leftIsFlagship = isFlagshipDestination(left.slug);
    const rightIsFlagship = isFlagshipDestination(right.slug);

    if (leftIsFlagship !== rightIsFlagship) {
      return leftIsFlagship ? -1 : 1;
    }

    const leftIsPriority = PRIORITY_SET.has(left.slug);
    const rightIsPriority = PRIORITY_SET.has(right.slug);

    if (leftIsPriority !== rightIsPriority) {
      return leftIsPriority ? -1 : 1;
    }

    const leftSignal = Number(hasSubstantiveSummary(left)) + Math.min(countMediaAssets(left), 3) * 0.4 + Math.min(countTags(left), 6) * 0.2;
    const rightSignal = Number(hasSubstantiveSummary(right)) + Math.min(countMediaAssets(right), 3) * 0.4 + Math.min(countTags(right), 6) * 0.2;

    if (leftSignal !== rightSignal) {
      return rightSignal - leftSignal;
    }

    return (right.match ?? 0) - (left.match ?? 0);
  });
}
