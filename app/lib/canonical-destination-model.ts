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
  sortOrder?: number;
  verified?: boolean;
  sourceUrl?: string;
  attribution?: string;
  license?: string;
};

export type CanonicalDestinationBudget = {
  label: string;
  amount: string;
  note: string;
};

export type CanonicalDestinationCostBudget = {
  id?: string;
  label: string;
  amount: string;
  note?: string;
};

export type CanonicalDestinationCostCategory = {
  key: string;
  label: string;
  amount: string;
  note?: string;
};

export type CanonicalDestinationCostProfile = {
  summary?: string;
  currency?: string;
  methodology?: string;
  confidence?: string;
  assumptions?: string[];
  budgets?: CanonicalDestinationCostBudget[];
  categories?: CanonicalDestinationCostCategory[];
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
  currency?: string;
  primaryLanguage?: string;
  climateClassification?: string;
  rainfall?: string;
  sunshineHours?: string;
  humidity?: string;
  averageTemperatures?: string;
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

export type NeighborhoodResourceItem = {
  category: string;
  label: string;
  url: string;
  kind?: "dataset" | "generated" | "live";
};

export type NeighborhoodIntelligenceMetric = {
  key: string;
  label: string;
  value: string;
  description: string;
};

export type NeighborhoodProfile = {
  name: string;
  summary?: string;
  resources?: NeighborhoodResourceItem[];
  liveResources?: NeighborhoodResourceItem[];
  intelligence?: NeighborhoodIntelligenceMetric[];
};

export type NeighborhoodIntelligencePlace = {
  id: string;
  name: string;
  category: string;
  destinationName?: string;
  neighborhoodName?: string;
  description?: string;
  whyItMatters?: string;
  address?: string;
  latitude?: string;
  longitude?: string;
  googleMapsUrl?: string;
  websiteUrl?: string;
  websiteVerified?: boolean;
  websiteStatus?: string;
  websiteFinalUrl?: string;
  imageUrl?: string;
  rating?: string;
  reviewCount?: string;
  courseType?: string;
  publicStatus?: string;
  holes?: string;
  priceContext?: string;
  amenities?: string;
  relationshipToNeighborhood?: string;
  source?: string;
  verified?: boolean;
};

export type NeighborhoodIntelligenceGroup = {
  category: string;
  destinationName?: string;
  neighborhoodName?: string;
  places?: NeighborhoodIntelligencePlace[];
};

export type ImportedVerifiedDestinationFacts = {
  destination?: Record<string, unknown> | null;
  neighborhoods?: Array<Record<string, unknown>>;
  places?: Array<Record<string, unknown>>;
  resources?: Array<Record<string, unknown>>;
  media?: Array<Record<string, unknown>>;
};

export type CanonicalDestinationPremiumV2Modules = Record<string, Array<Record<string, unknown>>>;

/**
 * Typed carrier for the full normalized v3.1 persisted bundle (see
 * NormalizedPersistedDestinationBundle in persistence/v31/materialize-stored-destination-state.ts).
 * Present ONLY when a destination was resolved through the real persisted v3.1 read path - its
 * presence is the single signal the renderer uses to decide real module data is authoritative and
 * legacy generic-template generation must not run (see CanonicalDestinationPage.tsx / STEP 9).
 * Every array here is exactly what was persisted - empty means "no rows", never a synthesized entry.
 */
export type CanonicalDestinationV31Fact = { readonly factKey: string; readonly factGroup: string | null; readonly valueText: string | null; readonly displayLabel: string | null; readonly sourceName: string | null };
export type CanonicalDestinationV31Score = { readonly scoreKey: string; readonly scoreValue: string | null; readonly scoreLabel: string | null };
export type CanonicalDestinationV31Neighborhood = {
  readonly neighborhoodKey: string;
  readonly name: string | null;
  readonly summary: string | null;
  readonly areaType: string | null;
  // Real, human-authored fields (NEIGHBORHOODS sheet) - areaType is an internal category token and
  // must never substitute for these in customer-facing copy.
  readonly bestFor: string | null;
  readonly walkabilityRating: string | null;
  readonly safetyRating: string | null;
  readonly transitRating: string | null;
  readonly housingCharacter: string | null;
  readonly pros: string | null;
  readonly cons: string | null;
  readonly googleMapsUrl: string | null;
};
export type CanonicalDestinationV31Place = {
  readonly placeKey: string;
  readonly category: string | null;
  readonly name: string | null;
  readonly description: string | null;
  readonly neighborhoodKey: string | null;
  readonly websiteUrl: string | null;
  readonly googleMapsUrl: string | null;
  readonly sourceUrl: string | null;
  readonly address: string | null;
  readonly phone: string | null;
  readonly displayOrder: string | null;
};
export type CanonicalDestinationV31Resource = { readonly resourceKey: string; readonly category: string | null; readonly name: string | null; readonly url: string | null };
export type CanonicalDestinationV31Media = { readonly mediaKey: string; readonly kind: string | null; readonly url: string | null; readonly caption: string | null; readonly altText: string | null; readonly isPrimary: string | null; readonly sortOrder: string | null; readonly verified: string | null };
export type CanonicalDestinationV31CostOfLivingItem = {
  readonly itemKey: string;
  readonly category: string | null;
  readonly monthlyLow: string | null;
  readonly monthlyHigh: string | null;
  readonly currency: string | null;
  readonly householdType: string | null;
  readonly lifestyleTier: string | null;
};
export type CanonicalDestinationV31ClimateMonth = { readonly monthKey: string; readonly avgHighTemp: string | null; readonly avgLowTemp: string | null; readonly precipitationMm: string | null; readonly humidityPct: string | null };
export type CanonicalDestinationV31Singleton = { readonly summary: string | null } & Record<string, string | null>;

export type CanonicalDestinationV31Modules = {
  readonly facts: readonly CanonicalDestinationV31Fact[];
  readonly scores: readonly CanonicalDestinationV31Score[];
  readonly neighborhoods: readonly CanonicalDestinationV31Neighborhood[];
  readonly places: readonly CanonicalDestinationV31Place[];
  readonly resources: readonly CanonicalDestinationV31Resource[];
  readonly media: readonly CanonicalDestinationV31Media[];
  readonly costOfLiving: readonly CanonicalDestinationV31CostOfLivingItem[];
  readonly climateMonthly: readonly CanonicalDestinationV31ClimateMonth[];
  readonly housing: readonly CanonicalDestinationV31Singleton[];
  readonly propertyResources: readonly CanonicalDestinationV31Resource[];
  readonly healthcare: readonly CanonicalDestinationV31Singleton[];
  readonly environmentQuality: CanonicalDestinationV31Singleton | null;
  readonly dailyLifePracticality: CanonicalDestinationV31Singleton | null;
  readonly visaResidency: readonly CanonicalDestinationV31Singleton[];
  readonly taxesFinance: readonly CanonicalDestinationV31Singleton[];
  readonly lgbtqInclusivity: readonly CanonicalDestinationV31Singleton[];
  readonly safetyRisks: readonly (CanonicalDestinationV31Singleton & { readonly itemKey: string; readonly topic: string | null; readonly severity: string | null })[];
  readonly transportation: readonly CanonicalDestinationV31Singleton[];
  readonly remoteWork: readonly CanonicalDestinationV31Singleton[];
  readonly languageIntegration: readonly CanonicalDestinationV31Singleton[];
  readonly pets: readonly CanonicalDestinationV31Singleton[];
  readonly familyEducation: readonly CanonicalDestinationV31Singleton[];
  readonly communitySocial: readonly CanonicalDestinationV31Singleton[];
  readonly accessibility: readonly CanonicalDestinationV31Singleton[];
  readonly bureaucracySetup: readonly CanonicalDestinationV31Singleton[];
  readonly workBusiness: readonly CanonicalDestinationV31Singleton[];
  readonly retirementAging: readonly CanonicalDestinationV31Singleton[];
  readonly lifestyleLaws: readonly CanonicalDestinationV31Singleton[];
  readonly realityCheck: readonly CanonicalDestinationV31Singleton[];
  readonly moveChecklist: readonly { readonly checklistKey: string; readonly summary: string | null; readonly checklistNotes: string | null }[];
  readonly eventsSeasonality: readonly { readonly eventSeasonalityKey: string; readonly summary: string | null; readonly seasonalityNotes: string | null }[];
  readonly sources: readonly { readonly sourceKey: string; readonly name: string | null; readonly url: string | null; readonly type: string | null }[];
  /** LIFESTYLE_FEATURES (v3.3, additive, display-only) - not yet connected to Intelligence v2/scoring. */
  readonly lifestyleFeatures: readonly {
    readonly recordKey: string;
    readonly featureGroup: string | null;
    readonly featureKey: string | null;
    readonly featureValue: string | null;
    readonly availabilityLevel: string | null;
    readonly proximityBand: string | null;
    readonly displayLabel: string | null;
    readonly evidenceSummary: string | null;
    readonly sourceName: string | null;
    readonly sourceUrl: string | null;
    readonly confidence: string | null;
    readonly matchingEnabled: string | null;
    readonly displayEnabled: string | null;
  }[];
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
  costOfLivingProfile?: CanonicalDestinationCostProfile;
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
  neighborhoodProfiles?: NeighborhoodProfile[];
  neighborhoodIntelligence?: NeighborhoodIntelligenceGroup[];
  premiumV2Modules?: CanonicalDestinationPremiumV2Modules;
  /** Only set when resolved through the real persisted v3.1 read path - see CanonicalDestinationV31Modules. */
  v31Modules?: CanonicalDestinationV31Modules;
  /** The real v3.1 destination_key this bundle was resolved from, when applicable. */
  v31DestinationKey?: string;
};
