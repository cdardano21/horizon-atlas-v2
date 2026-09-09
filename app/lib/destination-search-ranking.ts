import type { Destination } from "./destinations";

export type SearchRankedDestination = Destination & {
  matchKind: "exact-city" | "exact-label" | "exact-country" | "exact-slug" | "prefix" | "substring" | "fuzzy" | "exact-tag" | "keyword" | "fallback";
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

const damerauLevenshteinDistance = (left: string, right: string) => {
  const rows = Array.from({ length: left.length + 1 }, () => Array<number>(right.length + 1).fill(0));
  for (let leftIndex = 0; leftIndex <= left.length; leftIndex += 1) rows[leftIndex][0] = leftIndex;
  for (let rightIndex = 0; rightIndex <= right.length; rightIndex += 1) rows[0][rightIndex] = rightIndex;

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const substitutionCost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;
      rows[leftIndex][rightIndex] = Math.min(
        rows[leftIndex - 1][rightIndex] + 1,
        rows[leftIndex][rightIndex - 1] + 1,
        rows[leftIndex - 1][rightIndex - 1] + substitutionCost,
      );
      if (
        leftIndex > 1
        && rightIndex > 1
        && left[leftIndex - 1] === right[rightIndex - 2]
        && left[leftIndex - 2] === right[rightIndex - 1]
      ) {
        rows[leftIndex][rightIndex] = Math.min(rows[leftIndex][rightIndex], rows[leftIndex - 2][rightIndex - 2] + 1);
      }
    }
  }

  return rows[left.length][right.length];
};

const isUsefulTypoMatch = (query: string, candidate: string) => {
  if (query.length < 4 || Math.abs(query.length - candidate.length) > 2) return false;
  const maximumDistance = query.length >= 7 ? 2 : 1;
  return damerauLevenshteinDistance(query, candidate) <= maximumDistance;
};

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
  const hasExactIdentityMatch = normalizedQuery.length > 0 && destinations.some((destination) => {
    if (!matchesTag(destination.tags, selectedTags)) return false;
    const city = normalizeDestinationSearchText(destination.city);
    const country = normalizeDestinationSearchText(destination.country);
    const label = normalizeDestinationSearchText(`${destination.city} ${destination.country}`);
    const slug = normalizeDestinationSearchText(destination.slug);
    return normalizedQuery === city || normalizedQuery === label || normalizedQuery === slug || normalizedQuery === country;
  });

  return destinations
    .map((destination) => {
      const city = normalizeDestinationSearchText(destination.city);
      const country = normalizeDestinationSearchText(destination.country);
      const label = normalizeDestinationSearchText(`${destination.city} ${destination.country}`);
      const slug = normalizeDestinationSearchText(destination.slug);
      const identityFields = [city, label, slug, country].filter(Boolean);
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

      const exactCityMatch = normalizedQuery === city;
      const exactLabelMatch = normalizedQuery === label;
      const exactCountryMatch = normalizedQuery === country;
      const exactSlugMatch = normalizedQuery === slug;
      const exactTagMatch = (destination.tags ?? []).some((tag) => normalizeDestinationSearchText(tag) === normalizedQuery);
      const prefixMatch = normalizedQuery.length >= 2 && [city, label, slug].some((field) => field.startsWith(normalizedQuery));
      const substringMatch = normalizedQuery.length >= 3 && [city, label, slug].some((field) => field.includes(normalizedQuery));
      const fuzzyMatch = isUsefulTypoMatch(normalizedQuery, city);
      const keywordMatch = tokens.length > 0 && tokens.every((token) => (token.length <= 3 ? identityFields : searchableFields)
        .some((field) => field === token || field.includes(token)));

      let matchKind: SearchRankedDestination["matchKind"] = "fallback";
      if (exactCityMatch) matchKind = "exact-city";
      else if (exactLabelMatch) matchKind = "exact-label";
      else if (exactCountryMatch) matchKind = "exact-country";
      else if (exactSlugMatch) matchKind = "exact-slug";
      else if (prefixMatch) matchKind = "prefix";
      else if (substringMatch) matchKind = "substring";
      else if (fuzzyMatch) matchKind = "fuzzy";
      else if (exactTagMatch) matchKind = "exact-tag";
      else if (keywordMatch) matchKind = "keyword";

      if (normalizedQuery && matchKind === "fallback") return null;
      if (hasExactIdentityMatch && ["fuzzy", "exact-tag", "keyword"].includes(matchKind)) return null;

      const matchedTokenCount = tokens.filter((token) => searchableFields.some((field) => field === token || field.includes(token))).length;
      const baseScore = Math.max(0, destination.match);
      const matchBoost = exactCityMatch
        ? 2400
        : exactLabelMatch
          ? 2200
          : exactSlugMatch
            ? 2100
            : exactCountryMatch
              ? 2000
              : prefixMatch
                ? 1600
                : substringMatch
                  ? 1200
                  : fuzzyMatch
                    ? 800
                    : exactTagMatch
                      ? 600
                      : keywordMatch
                        ? 300
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
            case "exact-label": return 1;
            case "exact-slug": return 2;
            case "exact-country": return 3;
            case "prefix": return 4;
            case "substring": return 5;
            case "fuzzy": return 6;
            case "exact-tag": return 7;
            case "keyword": return 8;
            default: return 9;
          }
        };

        return rank(left.matchKind) - rank(right.matchKind);
      }

      const matchDifference = (right.match?.valueOf() ?? 0) - (left.match?.valueOf() ?? 0);
      return matchDifference || left.slug.localeCompare(right.slug);
    });
}
