import type { Destination } from "./destinations";

export type SearchRankedDestination = Destination & {
  matchKind: "exact-city" | "exact-country" | "exact-slug" | "exact-tag" | "keyword" | "fallback";
  searchScore: number;
};

export const destinationFilterAliases: Readonly<Record<string, readonly string[]>> = {
  beach: ["beach", "beaches", "beach city", "beach town", "coast", "coastal", "coastline"],
  "airport access": ["airport access", "airport", "airports"],
  affordable: ["affordable", "budget", "cheap", "low cost", "value"],
  "family friendly": ["family", "family friendly", "families"],
  golf: ["golf"],
  healthcare: ["healthcare", "hospital", "hospitals", "medical"],
  walkability: ["walkability", "walkable", "pedestrian"],
  "expat-friendly": ["expat", "expat-friendly", "international"],
  remote: ["remote", "digital nomad", "workability"],
  safety: ["safe", "safety"],
};

export const normalizeDestinationSearchText = (value: string) => value
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[’']/g, "")
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

export const getDestinationFilterAliases = (filter: string): readonly string[] => {
  const normalizedFilter = normalizeDestinationSearchText(filter);
  const entry = Object.entries(destinationFilterAliases)
    .find(([canonical]) => normalizeDestinationSearchText(canonical) === normalizedFilter);
  return entry?.[1] ?? [filter];
};

const tokenizeQuery = (value: string) =>
  normalizeDestinationSearchText(value)
    .split(/\s+/g)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);

const matchesTag = (destinationTags: string[] | undefined, selectedTags: string[]) => {
  if (selectedTags.length === 0) {
    return true;
  }

  const normalizedTags = (destinationTags ?? []).map((tag) => normalizeDestinationSearchText(tag)).filter(Boolean);
  return selectedTags.every((selectedTag) => {
    const aliases = getDestinationFilterAliases(selectedTag);
    return aliases.some((alias) => normalizedTags.includes(normalizeDestinationSearchText(alias)));
  });
};

export function rankDestinationsForSearch(destinations: Destination[], query: string, selectedTags: string[]) {
  const normalizedQuery = normalizeDestinationSearchText(query);
  const tokens = tokenizeQuery(normalizedQuery);

  return destinations
    .map((destination) => {
      const identityFields = [
        destination.city,
        destination.country,
        destination.slug,
      ].map((field) => normalizeDestinationSearchText(field)).filter(Boolean);
      const searchableFields = [
        ...identityFields,
        destination.description,
        destination.overview,
        destination.climate,
        destination.lifestyle,
        destination.transportation,
        ...(destination.tags ?? []),
      ].map((field) => normalizeDestinationSearchText(field)).filter(Boolean);

      if (!matchesTag(destination.tags, selectedTags)) {
        return null;
      }

      const queryMatches = tokens.length > 0
        ? tokens.every((token) => (token.length <= 3 ? identityFields : searchableFields)
          .some((field) => field === token || field.includes(token)))
        : true;

      if (!queryMatches) {
        return null;
      }

      const exactCityMatch = normalizedQuery === normalizeDestinationSearchText(destination.city);
      const exactCountryMatch = normalizedQuery === normalizeDestinationSearchText(destination.country);
      const exactSlugMatch = normalizedQuery === normalizeDestinationSearchText(destination.slug);
      const exactTagMatch = (destination.tags ?? []).some((tag) => normalizeDestinationSearchText(tag) === normalizedQuery);
      const cityPrefixMatch = normalizeDestinationSearchText(destination.city).startsWith(normalizedQuery);
      const slugPrefixMatch = normalizeDestinationSearchText(destination.slug).startsWith(normalizedQuery);

      let matchKind: SearchRankedDestination["matchKind"] = "fallback";
      if (exactCityMatch) matchKind = "exact-city";
      else if (exactCountryMatch) matchKind = "exact-country";
      else if (exactSlugMatch) matchKind = "exact-slug";
      else if (exactTagMatch) matchKind = "exact-tag";
      else matchKind = "keyword";

      const matchedTokenCount = tokens.filter((token) => searchableFields.some((field) => field === token || field.includes(token))).length;
      const baseScore = Math.max(0, destination.match);
      const matchBoost = exactCityMatch
        ? 1600
        : exactCountryMatch
          ? 1400
          : exactSlugMatch
            ? 1200
            : exactTagMatch
              ? 1000
              : cityPrefixMatch
                ? 800
                : slugPrefixMatch
                  ? 700
                  : 0;
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

      const matchDifference = (right.match?.valueOf() ?? 0) - (left.match?.valueOf() ?? 0);
      return matchDifference || left.slug.localeCompare(right.slug);
    });
}
