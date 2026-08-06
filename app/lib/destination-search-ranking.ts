import type { Destination } from "./destinations";

export type SearchRankedDestination = Destination & {
  matchKind: "exact-city" | "exact-country" | "exact-slug" | "exact-tag" | "keyword" | "fallback";
  searchScore: number;
};

const normalize = (value: string) => value.toLowerCase().trim();

const tokenizeQuery = (value: string) =>
  value
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);

const matchesTag = (destinationTags: string[] | undefined, selectedTags: string[]) => {
  if (selectedTags.length === 0) {
    return true;
  }

  const normalizedTags = (destinationTags ?? []).map((tag) => normalize(tag));
  return selectedTags.every((selectedTag) => {
    const normalizedSelectedTag = normalize(selectedTag);
    return normalizedTags.some((tag) => tag === normalizedSelectedTag || tag.includes(normalizedSelectedTag) || normalizedSelectedTag.includes(tag));
  });
};

export function rankDestinationsForSearch(destinations: Destination[], query: string, selectedTags: string[]) {
  const normalizedQuery = normalize(query);
  const tokens = tokenizeQuery(normalizedQuery);

  return destinations
    .map((destination) => {
      const searchableFields = [
        destination.city,
        destination.country,
        destination.slug,
        destination.description,
        destination.overview,
        destination.climate,
        destination.lifestyle,
        destination.transportation,
        ...(destination.tags ?? []),
      ].map((field) => normalize(field));

      if (!matchesTag(destination.tags, selectedTags)) {
        return null;
      }

      const queryMatches = tokens.length > 0
        ? tokens.every((token) => searchableFields.some((field) => field === token || field.includes(token) || token.includes(field)))
        : true;

      if (!queryMatches) {
        return null;
      }

      const exactCityMatch = normalizedQuery === normalize(destination.city);
      const exactCountryMatch = normalizedQuery === normalize(destination.country);
      const exactSlugMatch = normalizedQuery === normalize(destination.slug);
      const exactTagMatch = (destination.tags ?? []).some((tag) => normalize(tag) === normalizedQuery);

      let matchKind: SearchRankedDestination["matchKind"] = "fallback";
      if (exactCityMatch) matchKind = "exact-city";
      else if (exactCountryMatch) matchKind = "exact-country";
      else if (exactSlugMatch) matchKind = "exact-slug";
      else if (exactTagMatch) matchKind = "exact-tag";
      else matchKind = "keyword";

      const matchedTokenCount = tokens.filter((token) => searchableFields.some((field) => field === token || field.includes(token) || token.includes(field))).length;
      const baseScore = Math.max(0, destination.match);
      const matchBoost = exactCityMatch ? 1600 : exactCountryMatch ? 1400 : exactSlugMatch ? 1200 : exactTagMatch ? 1000 : 0;
      const tokenBoost = tokens.length > 0 ? matchedTokenCount * 120 : 0;
      const tagBoost = selectedTags.length * 8;

      return {
        ...destination,
        matchKind,
        searchScore: baseScore + matchBoost + tokenBoost + tagBoost,
      } satisfies SearchRankedDestination;
    })
    .filter((item): item is SearchRankedDestination => item !== null)
    .sort((left, right) => {
      if (right.searchScore !== left.searchScore) {
        return right.searchScore - left.searchScore;
      }

      if (left.matchKind !== right.matchKind) {
        const rank = (kind: SearchRankedDestination["matchKind"]) => {
          switch (kind) {
            case "exact-city": return 0;
            case "exact-country": return 1;
            case "exact-slug": return 2;
            case "exact-tag": return 3;
            case "keyword": return 4;
            default: return 5;
          }
        };

        return rank(left.matchKind) - rank(right.matchKind);
      }

      return (right.match?.valueOf() ?? 0) - (left.match?.valueOf() ?? 0);
    });
}
