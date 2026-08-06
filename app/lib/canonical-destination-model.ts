export type CanonicalDestinationSectionStatus = "queued" | "running" | "completed" | "failed" | "paused";

export type CanonicalDestinationSection = {
  id: string;
  title: string;
  content: string;
  version: number;
  updatedAt: string;
};

export type CanonicalDestinationResource = {
  category: string;
  label: string;
  provider: string | null;
  url: string;
};

export type CanonicalDestinationVideo = {
  provider: string;
  label: string;
  url: string;
  embedUrl: string | null;
};

export type CanonicalDestinationMedia = {
  kind: string;
  url: string;
  altText: string;
  caption: string;
  isPrimary: boolean;
};

export type CanonicalDestinationBudget = {
  label: string;
  amount: string;
  note: string;
};

export type CanonicalDestinationAiState = {
  status: CanonicalDestinationSectionStatus;
  version: string;
  lastUpdated: string;
  confidenceScore: number;
  sourcesUsed: string[];
  missingSections: string[];
  promptVersion: string;
  researchTimestamp: string;
};

export type CanonicalDestinationScoringCategory = {
  name: string;
  weight: number;
  score: number;
};

export type PremiumEditorialContent = {
  heroIntroduction?: string;
  whyPeopleLoveIt?: string[];
  majorStrengths?: string[];
  majorDrawbacks?: string[];
  bestFor?: string[];
  overviewArticle?: string;
  neighborhoodsArticle?: string;
  dailyLifeArticle?: string;
  climateArticle?: string;
  transportationArticle?: string;
  costOfLivingArticle?: string;
  healthcareArticle?: string;
  retirementGuide?: string;
  familyGuide?: string;
  digitalNomadGuide?: string;
  prosAndCons?: {
    advantages?: string[];
    disadvantages?: string[];
  };
};

export type CanonicalDestinationKnowledgeProfile = {
  officialName?: string;
  country?: string;
  adminRegion?: string;
  latitude?: string;
  longitude?: string;
  population?: string;
  metroPopulation?: string;
  elevation?: string;
  timeZone?: string;
  climateClassification?: string;
  rainfall?: string;
  sunshineHours?: string;
  humidity?: string;
  airQuality?: string;
  walkability?: string;
  bikeFriendliness?: string;
  publicTransportation?: string;
  majorAirports?: string[];
  drivingConvenience?: string;
  internetSpeed?: string;
  cellCoverage?: string;
  safety?: string;
  crime?: string;
  healthcareQuality?: string;
  majorHospitals?: string[];
  emergencyCare?: string;
  costOfLiving?: string;
  apartmentRent?: string;
  homePrices?: string;
  propertyTaxes?: string;
  incomeTaxes?: string;
  salesTaxes?: string;
  utilities?: string;
  groceryCosts?: string;
  diningCosts?: string;
  transportationCosts?: string;
  healthcareCosts?: string;
  bestNeighborhoods?: string[];
  luxuryNeighborhoods?: string[];
  budgetNeighborhoods?: string[];
  familyNeighborhoods?: string[];
  digitalNomadNeighborhoods?: string[];
  retirementNeighborhoods?: string[];
  beaches?: string[];
  mountains?: string[];
  lakes?: string[];
  parks?: string[];
  hiking?: string[];
  golf?: string[];
  museums?: string[];
  art?: string[];
  architecture?: string[];
  festivals?: string[];
  sports?: string[];
  nightlife?: string[];
  restaurants?: string[];
  coffeeShops?: string[];
  shopping?: string[];
  universities?: string[];
  economy?: string;
  majorEmployers?: string[];
  nearbyWeekendTrips?: string[];
  airportsWithDirectFlights?: string[];
  visaInfo?: string;
  residencyInfo?: string;
  retirementSuitability?: string;
  familySuitability?: string;
  digitalNomadSuitability?: string;
  lgbtqFriendliness?: string;
  accessibility?: string;
  localTransportation?: string;
  healthcareRankings?: string;
  climateRisks?: string;
  naturalDisasterRisks?: string;
};

export type CanonicalDestination = {
  slug: string;
  city: string;
  country: string;
  title: string;
  subtitle: string;
  heroNarrative: string;
  overview: string;
  editorial: string;
  whyThisPlaceFeelsDistinct: string;
  dailyLife: string;
  climate: string;
  transportation: string;
  healthcare: string;
  costOfLiving: string;
  walkability: string;
  internet: string;
  safety: string;
  neighborhoods: string[];
  restaurants: string[];
  museums: string[];
  golf: string[];
  beaches: string[];
  outdoorRecreation: string[];
  pros: string[];
  cons: string[];
  retirement: string;
  digitalNomad: string;
  family: string;
  weather: string;
  monthlyBudgets: CanonicalDestinationBudget[];
  airportInfo: string;
  googleMapsUrl: string;
  googleEarthUrl: string;
  officialTourismUrl: string;
  wikipediaUrl: string;
  youtubeUrl: string;
  tiktokUrl: string;
  instagramUrl: string;
  webcamUrl: string;
  resources: CanonicalDestinationResource[];
  realEstateResources: CanonicalDestinationResource[];
  rentalResources: CanonicalDestinationResource[];
  healthcareResources: CanonicalDestinationResource[];
  visaResources: CanonicalDestinationResource[];
  weatherResources: CanonicalDestinationResource[];
  structuredResources: CanonicalDestinationResource[];
  videos: CanonicalDestinationVideo[];
  media: CanonicalDestinationMedia[];
  heroImages: CanonicalDestinationMedia[];
  mediaGallery: CanonicalDestinationMedia[];
  sections: Record<string, CanonicalDestinationSection>;
  ai: CanonicalDestinationAiState;
  scoring: CanonicalDestinationScoringCategory[];
  aiScoringExplanation: string;
  premiumEditorialContent?: PremiumEditorialContent;
  knowledgeProfile?: CanonicalDestinationKnowledgeProfile;
};
