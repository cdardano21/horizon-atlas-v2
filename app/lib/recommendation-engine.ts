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

const normalizedTags = (destination: Destination) => new Set(destination.tags?.map((item) => item.toLowerCase()) ?? []);

const hasTag = (destination: Destination, tag: string) => normalizedTags(destination).has(tag);

const hasAnyTag = (destination: Destination, tags: string[]) => tags.some((tag) => hasTag(destination, tag));

const countOptional = (...values: Array<unknown>) => values.filter(Boolean).length;

const toEvidenceScore = (destination: Destination) => {
  const details = destination.memberDetails;
  const weatherRows = details?.monthlyWeather?.length ?? 0;
  const airportRows = details?.airports?.length ?? 0;
  const hospitalRows = details?.hospitals?.length ?? 0;
  const amenitiesEvidence = countOptional(
    details?.amenities?.restaurants,
    details?.amenities?.schools,
    details?.amenities?.englishSchools,
    details?.amenities?.pickleballCourts,
    details?.golf?.publicCourses,
    details?.golf?.privateCourses,
  );

  const evidenceSignals = [
    Math.min(1, weatherRows / 12),
    Math.min(1, airportRows / 3),
    Math.min(1, hospitalRows / 3),
    Math.min(1, amenitiesEvidence / 5),
  ];

  return evidenceSignals.reduce((total, value) => total + value, 0) / evidenceSignals.length;
};

const inferDestinationDimension = (destination: Destination, dimension: RetirementDimensionId) => {
  const details = destination.memberDetails;
  const content = [destination.description, destination.overview, destination.climate, destination.lifestyle, destination.transportation]
    .join(" ")
    .toLowerCase();
  const hospitals = details?.hospitals?.length ?? 0;
  const airports = details?.airports?.length ?? 0;
  const weatherRows = details?.monthlyWeather?.length ?? 0;
  const englishSchools = details?.amenities?.englishSchools ?? 0;
  const restaurants = details?.amenities?.restaurants ?? 0;
  const golfCourses = (details?.golf?.publicCourses ?? 0) + (details?.golf?.privateCourses ?? 0);

  const coastal = hasAnyTag(destination, ["beach", "coast"]);
  const walkable = hasTag(destination, "walkability");
  const healthcare = hasTag(destination, "healthcare");
  const safety = hasTag(destination, "safety");
  const value = hasTag(destination, "value");
  const city = hasTag(destination, "city");
  const digital = hasTag(destination, "digital nomad");
  const culture = hasTag(destination, "culture");

  const clampFrom = (base: number) => clamp(base);

  switch (dimension) {
    case "budget":
      return clampFrom(46 + (value ? 34 : 0) + (content.includes("budget") ? 8 : 0));
    case "healthcare":
      return clampFrom(50 + (healthcare ? 28 : 0) + Math.min(16, hospitals * 4) + (content.includes("healthcare") ? 6 : 0));
    case "safety":
      return clampFrom(52 + (safety ? 30 : 0) + (content.includes("safety") ? 6 : 0));
    case "walkability":
      return clampFrom(44 + (walkable ? 36 : 0) + (city ? 8 : 0));
    case "climate":
      return clampFrom(52 + (coastal ? 20 : 6) + Math.min(18, weatherRows * 1.5));
    case "coast":
      return clampFrom(34 + (coastal ? 58 : 0));
    case "culture":
      return clampFrom(48 + (culture ? 24 : 0) + (city ? 12 : 0) + Math.min(8, Math.floor(restaurants / 120)));
    case "community":
      return clampFrom(50 + (hasTag(destination, "expat-friendly") ? 18 : 0) + (digital ? 10 : 0) + (englishSchools > 0 ? 10 : 0));
    case "connectivity":
      return clampFrom(50 + (hasTag(destination, "airport access") ? 18 : 0) + Math.min(20, airports * 8) + (digital ? 8 : 0));
    case "nature":
      return clampFrom(50 + (hasAnyTag(destination, ["beach", "coast", "nature", "mountains"]) ? 26 : 0));
    case "pace":
      return clampFrom(city || digital ? 44 : 78);
    case "stability":
      return clampFrom(56 + (safety ? 14 : 0) + (healthcare ? 12 : 0) + Math.min(10, hospitals * 2));
    case "family":
      return clampFrom(52 + (safety ? 12 : 0) + (healthcare ? 10 : 0) + (englishSchools > 0 ? 14 : 0) + Math.min(8, airports * 3));
    case "hobbies":
      return clampFrom(50 + (hasAnyTag(destination, ["beach", "coast", "culture", "nature"]) ? 20 : 0) + Math.min(16, golfCourses * 2));
    case "personality":
      return clampFrom(56 + (culture ? 14 : 0) + (city ? 10 : 0) + (walkable ? 8 : 0) + (hasTag(destination, "expat-friendly") ? 6 : 0));
    case "goals":
      return clampFrom(55 + (safety ? 10 : 0) + (healthcare ? 10 : 0) + (walkable ? 8 : 0) + (value ? 8 : 0));
    default:
      return 50;
  }
};

const explainDimensionFit = (destination: Destination, dimension: RetirementDimensionId, score: number) => {
  const label = getDimensionLabel(dimension);
  const details = destination.memberDetails;

  if (dimension === "healthcare") {
    const hospitals = details?.hospitals?.length ?? 0;
    return `${label} scored ${score}/100 with ${hospitals > 0 ? `${hospitals} tracked hospital references` : "limited facility references so far"}.`;
  }

  if (dimension === "connectivity") {
    const airports = details?.airports?.length ?? 0;
    return `${label} scored ${score}/100 with ${airports > 0 ? `${airports} airport records` : "regional-access assumptions that still need route-depth validation"}.`;
  }

  if (dimension === "climate") {
    const weatherRows = details?.monthlyWeather?.length ?? 0;
    return `${label} scored ${score}/100 using ${weatherRows}/12 structured monthly climate rows.`;
  }

  return `${label} scored ${score}/100 and aligned with your weighted priorities.`;
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

  const tagBonus = profile.derivedTags.reduce((total, tag) => total + (hasTag(destination, tag) ? 2.1 : 0), 0);
  const evidenceScore = toEvidenceScore(destination);
  const evidenceBonus = Math.round(evidenceScore * 8);
  const uncertaintyPenalty = evidenceScore < 0.35 ? Math.round((0.35 - evidenceScore) * 20) : 0;
  const score = clamp(weightedFit + tagBonus + evidenceBonus - uncertaintyPenalty);

  const matchedPriorities = dimensionEntries
    .filter((entry) => entry.importance >= 65 && entry.destinationScore >= 74)
    .sort((left, right) => right.destinationScore - left.destinationScore)
    .slice(0, 4)
    .map((entry) => `${getDimensionLabel(entry.dimension)} (${entry.destinationScore})`);

  const watchouts = dimensionEntries
    .filter((entry) => entry.importance >= 65 && entry.destinationScore <= 54)
    .sort((left, right) => left.destinationScore - right.destinationScore)
    .slice(0, 3)
    .map((entry) => `${getDimensionLabel(entry.dimension)} (${entry.destinationScore})`);

  const whyItFits = dimensionEntries
    .filter((entry) => entry.destinationScore >= 70)
    .sort((left, right) => right.destinationScore - left.destinationScore)
    .slice(0, 3)
    .map((entry) => explainDimensionFit(destination, entry.dimension, entry.destinationScore));

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