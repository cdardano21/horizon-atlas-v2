import type { Destination } from "./destinations";
import {
  computeRetirementDnaProfile,
  getDimensionLabel,
  type RetirementDnaAnswers,
  type RetirementDimensionId,
  type RetirementDnaProfile,
} from "./retirement-dna";

export type RankedRecommendation = {
  destination: Destination;
  score: number;
  matchedPriorities: string[];
  watchouts: string[];
  whyItFits: string[];
};

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const hasTag = (destination: Destination, tag: string) =>
  destination.tags?.map((item) => item.toLowerCase()).includes(tag) ?? false;

const inferDestinationDimension = (destination: Destination, dimension: RetirementDimensionId) => {
  const content = [destination.description, destination.overview, destination.climate, destination.lifestyle, destination.transportation]
    .join(" ")
    .toLowerCase();

  switch (dimension) {
    case "budget":
      return hasTag(destination, "value") ? 92 : content.includes("housing-buy profile") ? 68 : 48;
    case "healthcare":
      return hasTag(destination, "healthcare") ? 92 : content.includes("healthcare") ? 72 : 52;
    case "safety":
      return hasTag(destination, "safety") ? 92 : 55;
    case "walkability":
      return hasTag(destination, "walkability") ? 92 : 45;
    case "climate":
      return hasTag(destination, "summer escape") ? 90 : hasTag(destination, "beach") || hasTag(destination, "coast") ? 80 : 58;
    case "coast":
      return hasTag(destination, "beach") || hasTag(destination, "coast") ? 95 : 34;
    case "culture":
      return hasTag(destination, "culture") || hasTag(destination, "city") ? 88 : 50;
    case "community":
      return hasTag(destination, "expat-friendly") || hasTag(destination, "digital nomad") ? 86 : 52;
    case "connectivity":
      return hasTag(destination, "airport access") || hasTag(destination, "digital nomad") || hasTag(destination, "city") ? 86 : 54;
    case "nature":
      return hasTag(destination, "beach") || hasTag(destination, "coast") || hasTag(destination, "nature") ? 84 : 52;
    case "pace":
      return hasTag(destination, "city") || hasTag(destination, "digital nomad") ? 42 : 78;
    case "stability":
      return hasTag(destination, "safety") && hasTag(destination, "healthcare") ? 88 : hasTag(destination, "safety") ? 74 : 58;
    case "family":
      return hasTag(destination, "airport access") && hasTag(destination, "safety")
        ? 88
        : hasTag(destination, "airport access") || hasTag(destination, "safety") || hasTag(destination, "healthcare")
          ? 72
          : 52;
    case "hobbies":
      return hasTag(destination, "beach") || hasTag(destination, "coast") || hasTag(destination, "culture") || hasTag(destination, "nature")
        ? 86
        : hasTag(destination, "walkability")
          ? 70
          : 50;
    case "personality":
      return hasTag(destination, "culture") || hasTag(destination, "city")
        ? 82
        : hasTag(destination, "expat-friendly") || hasTag(destination, "walkability")
          ? 74
          : 56;
    case "goals":
      return hasTag(destination, "safety") && hasTag(destination, "healthcare") && (hasTag(destination, "walkability") || hasTag(destination, "value"))
        ? 90
        : hasTag(destination, "safety") || hasTag(destination, "healthcare")
          ? 72
          : 55;
    default:
      return 50;
  }
};

const buildRecommendation = (destination: Destination, profile: RetirementDnaProfile): RankedRecommendation => {
  const dimensionEntries = (Object.keys(profile.dimensionScores) as RetirementDimensionId[])
    .map((dimension) => ({
      dimension,
      importance: profile.dimensionScores[dimension],
      destinationScore: inferDestinationDimension(destination, dimension),
    }))
    .filter((entry) => entry.importance > 0);

  const totalImportance = dimensionEntries.reduce((total, entry) => total + entry.importance, 0) || 1;
  const weightedFit = dimensionEntries.reduce(
    (total, entry) => total + (entry.importance / totalImportance) * entry.destinationScore,
    0,
  );

  const tagBonus = profile.derivedTags.reduce((total, tag) => total + (hasTag(destination, tag) ? 2.4 : 0), 0);
  const score = clamp(weightedFit + tagBonus);

  const matchedPriorities = dimensionEntries
    .filter((entry) => entry.importance >= 65 && entry.destinationScore >= 74)
    .sort((left, right) => right.destinationScore - left.destinationScore)
    .slice(0, 4)
    .map((entry) => getDimensionLabel(entry.dimension));

  const watchouts = dimensionEntries
    .filter((entry) => entry.importance >= 65 && entry.destinationScore <= 54)
    .sort((left, right) => left.destinationScore - right.destinationScore)
    .slice(0, 3)
    .map((entry) => getDimensionLabel(entry.dimension));

  const whyItFits = dimensionEntries
    .filter((entry) => entry.destinationScore >= 70)
    .sort((left, right) => right.destinationScore - left.destinationScore)
    .slice(0, 3)
    .map((entry) => `${getDimensionLabel(entry.dimension)} is a strong fit here.`);

  return {
    destination,
    score,
    matchedPriorities,
    watchouts,
    whyItFits,
  };
};

export const rankDestinationsForRetirementDna = (destinations: Destination[], answers: RetirementDnaAnswers) => {
  const profile = computeRetirementDnaProfile(answers);
  const ranked = destinations
    .map((destination) => buildRecommendation(destination, profile))
    .sort((left, right) => right.score - left.score);

  return {
    profile,
    ranked,
  };
};