import { normalizeDestinationSlug } from "./destination-identity";
import type { Destination } from "./destinations";
import { smartShortlistCandidates } from "./smart-shortlist/cohort";
import { EXPANSION_WORKBOOK_REGISTRY } from "./expansion-workbook-registry";

type RegistryEntryLike = {
  environment?: string;
  expectedDestinationKeys?: readonly string[];
};

export const getRegisteredWorkbookDestinationKeys = (
  registry: readonly RegistryEntryLike[] = EXPANSION_WORKBOOK_REGISTRY,
): string[] => Array.from(
  new Set(
    registry
      .flatMap((entry) => entry.expectedDestinationKeys ?? [])
      .map((destinationKey) => normalizeDestinationSlug(destinationKey))
      .filter(Boolean),
  ),
);

export const getLifeMatchCandidateDestinations = (
  publicDestinations: Destination[],
  registry: readonly RegistryEntryLike[] = EXPANSION_WORKBOOK_REGISTRY,
): Destination[] => {
  const registeredKeys = new Set(getRegisteredWorkbookDestinationKeys(registry));
  if (!registeredKeys.size) {
    return [];
  }

  const aliases = new Map(smartShortlistCandidates
    .filter(candidate => registeredKeys.has(candidate.key))
    .map(candidate => [normalizeDestinationSlug(candidate.slug), candidate.key]));
  const seen = new Set<string>();
  const candidateDestinations: Destination[] = [];

  for (const destination of publicDestinations) {
    const slug = normalizeDestinationSlug(destination.slug ?? "");
    const normalizedKey = aliases.get(slug) ?? slug;
    if (!normalizedKey || !registeredKeys.has(normalizedKey)) {
      continue;
    }

    if (seen.has(normalizedKey)) {
      continue;
    }

    seen.add(normalizedKey);
    candidateDestinations.push(destination);
  }

  return candidateDestinations;
};
