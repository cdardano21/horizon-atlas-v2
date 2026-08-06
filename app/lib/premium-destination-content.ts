import type { Destination } from "./destinations";
import { getDestinationResearchProfile } from "./destination-research";

export type PremiumDestinationEditorialContent = {
  heroIntroduction: string;
  whyPeopleLoveIt: string[];
  majorStrengths: string[];
  majorDrawbacks: string[];
  bestFor: string[];
  overviewArticle: string;
  neighborhoodsArticle: string;
  dailyLifeArticle: string;
  climateArticle: string;
  transportationArticle: string;
  costOfLivingArticle: string;
  healthcareArticle: string;
  retirementGuide: string;
  familyGuide: string;
  digitalNomadGuide: string;
  prosAndCons: {
    advantages: string[];
    disadvantages: string[];
  };
};

const cleanText = (value?: string) => (typeof value === "string" ? value.trim() : "");

const buildUniqueNarrative = (destination: Destination, base: string, fallback: string) => {
  const value = cleanText(destination.heroNarrative ?? destination.introduction ?? destination.description ?? destination.overview);
  if (value) {
    const normalized = value.replace(/\s+/g, " ").trim();
    if (normalized.length > 80) return normalized;
  }
  return base || fallback;
};

export function buildPremiumDestinationContent(destination: Destination): PremiumDestinationEditorialContent {
  const city = destination.city;
  const premiumEditorialContent = destination.premiumEditorialContent;
  const country = destination.country;
  const researchProfile = getDestinationResearchProfile(destination);
  const orientation = cleanText(destination.overview) || cleanText(researchProfile.overview) || cleanText(destination.description) || `${city} is a distinctive destination with strong local character.`;
  const lifestyle = cleanText(destination.lifestyle) || cleanText(researchProfile.feel) || `${city} rewards a routine built around local cafés, daily errands, and the rhythm of the place.`;
  const climate = cleanText(destination.climate) || cleanText(researchProfile.climate) || `${city} has a climate shaped by its geography and seasonal change.`;
  const transport = cleanText(destination.transportation) || cleanText(researchProfile.transportation) || `${city} works best when transport needs are matched to the area you plan to stay in.`;

  const whyPeopleLoveIt = premiumEditorialContent?.whyPeopleLoveIt?.length
    ? premiumEditorialContent.whyPeopleLoveIt
    : researchProfile?.whyPeopleLoveIt?.length
      ? [researchProfile.whyPeopleLoveIt]
    : [
        `${city} has a strong sense of place that is easy to feel on a first visit.`,
        `${city} rewards slow exploration rather than rushed sightseeing.`,
      ];

  const majorStrengths = premiumEditorialContent?.majorStrengths?.length
    ? premiumEditorialContent.majorStrengths
    : researchProfile?.pros?.length
      ? researchProfile.pros
    : [
        "Distinctive local character",
        "Strong daily-life rhythm",
        "Good fit for travelers who value atmosphere over convenience",
      ];

  const majorDrawbacks = premiumEditorialContent?.majorDrawbacks?.length
    ? premiumEditorialContent.majorDrawbacks
    : researchProfile?.cons?.length
      ? researchProfile.cons
    : [
        "Some areas are seasonally crowded",
        "Practical logistics can be less convenient than the postcard image suggests",
        "The most appealing districts can be expensive or harder to secure",
      ];

  const bestFor = premiumEditorialContent?.bestFor?.length
    ? premiumEditorialContent.bestFor
    : researchProfile?.bestFor?.length
      ? researchProfile.bestFor
    : ["Couples", "Culture-led travelers", "Residents who value atmosphere"];

  const heroIntroduction = premiumEditorialContent?.heroIntroduction?.trim()
    || buildUniqueNarrative(
    destination,
    `${city} feels most convincing when you see it as a place of everyday rhythm rather than a list of landmarks. ${orientation} ${cleanText(researchProfile.whyPeopleLoveIt) || "The most successful stays here are built from a careful balance of local culture, practical access, and the kind of atmosphere that makes the city feel worth returning to."}`,
    `${city} is a destination defined by atmosphere, local routine, and the way daily life unfolds in the streets around you.`,
  );

  return {
    heroIntroduction,
    whyPeopleLoveIt,
    majorStrengths,
    majorDrawbacks,
    bestFor,
    overviewArticle: premiumEditorialContent?.overviewArticle?.trim() || `${city} is shaped by its history, its local identity, and the way residents experience it across a normal week. ${orientation} The destination works best when visitors understand that its personality comes from the mix of urban energy, neighborhood life, and the specific rhythm that defines ${country}. ${cleanText(researchProfile.localCulture) || cleanText(researchProfile.foodAndDining) || lifestyle}`,
    neighborhoodsArticle: premiumEditorialContent?.neighborhoodsArticle?.trim() || `${city} rewards a more granular view than the headline reputation alone. The best districts often combine walkability, food culture, and a daily routine that feels grounded rather than performative. The most desirable neighborhoods usually offer the strongest balance of atmosphere, convenience, and access to the local social scene.`,
    dailyLifeArticle: premiumEditorialContent?.dailyLifeArticle?.trim() || `${city} is the kind of place where daily life matters as much as the landmark view. ${cleanText(researchProfile.feel) || lifestyle} Morning routines, workdays, evening walks, and weekend habits all shape whether the destination feels effortless or demanding. ${lifestyle}`,
    climateArticle: premiumEditorialContent?.climateArticle?.trim() || `${city} has a climate that shapes the tempo of the year. ${climate} ${cleanText(researchProfile.climate) || climate} The most rewarding stays usually align daily plans with the seasonal comfort of the destination rather than assuming the same rhythm applies in every month.`,
    transportationArticle: premiumEditorialContent?.transportationArticle?.trim() || `${city} can be easier to understand when you separate the postcard version from the practical one. ${transport} ${cleanText(researchProfile.transportation) || transport} The destination is strongest when the airport, local transit, and everyday walking pattern all support the way you expect to live and move.`,
    costOfLivingArticle: premiumEditorialContent?.costOfLivingArticle?.trim() || `${city} is best judged through the way a household actually spends money rather than only through broad city averages. ${cleanText(researchProfile.costOfLiving) || "A realistic budget should account for housing, groceries, restaurants, transport, and the premium that comes with the most appealing neighborhoods."}`,
    healthcareArticle: premiumEditorialContent?.healthcareArticle?.trim() || `${city} should be judged for healthcare in the same way it is judged for daily life: ${cleanText(researchProfile.healthcare) || "by how convenient it is to access care in a real week, not by headline reputation alone."}`,
    retirementGuide: premiumEditorialContent?.retirementGuide?.trim() || `${city} becomes most appealing for a long-stay resident when the daily pace, climate, housing choices, and regional access all feel compatible. ${cleanText(researchProfile.longStaySuitability) || "The best retirement case is built around a routine that is calm, walkable, and supported by the practical infrastructure that makes a place sustainable over time."} ${lifestyle}`,
    familyGuide: premiumEditorialContent?.familyGuide?.trim() || `${city} can be a strong family choice when the household values local culture, outdoor access, and a daily environment that feels lived-in rather than overbuilt. ${cleanText(researchProfile.familyFriendliness) || "Family fit depends on schools, safety, commute patterns, and whether the neighborhood can support ordinary weekly life."}`,
    digitalNomadGuide: premiumEditorialContent?.digitalNomadGuide?.trim() || `${city} suits digital nomads when the home base offers dependable internet, comfortable places to work, and enough neighborhood life to make long stays feel sustainable. ${cleanText(researchProfile.digitalNomadSuitability) || "The strongest remote-work cases usually balance work practicality with local social energy."}`,
    prosAndCons: {
      advantages: premiumEditorialContent?.prosAndCons?.advantages?.length ? premiumEditorialContent.prosAndCons.advantages : majorStrengths,
      disadvantages: premiumEditorialContent?.prosAndCons?.disadvantages?.length ? premiumEditorialContent.prosAndCons.disadvantages : majorDrawbacks,
    },
  };
}
