import type {
  DeterministicV31CanonicalAccessibilityState,
  DeterministicV31CanonicalBureaucracySetupState,
  DeterministicV31CanonicalClimateMonth,
  DeterministicV31CanonicalCommunitySocialState,
  DeterministicV31CanonicalCostOfLivingItem,
  DeterministicV31CanonicalDailyLifePracticalityState,
  DeterministicV31CanonicalDestination,
  DeterministicV31CanonicalEditorial,
  DeterministicV31CanonicalEnvironmentQualityState,
  DeterministicV31CanonicalEventsSeasonalityState,
  DeterministicV31CanonicalFact,
  DeterministicV31CanonicalFamilyEducationState,
  DeterministicV31CanonicalHealthcareState,
  DeterministicV31CanonicalHousingState,
  DeterministicV31CanonicalIdentity,
  DeterministicV31CanonicalLanguageIntegrationState,
  DeterministicV31CanonicalLifestyleLawState,
  DeterministicV31CanonicalLgbtqInclusivityState,
  DeterministicV31CanonicalMedia,
  DeterministicV31CanonicalMoveChecklistState,
  DeterministicV31CanonicalNeighborhood,
  DeterministicV31CanonicalPetState,
  DeterministicV31CanonicalPlace,
  DeterministicV31CanonicalPropertyResource,
  DeterministicV31CanonicalRealityCheckEntry,
  DeterministicV31CanonicalRemoteWorkState,
  DeterministicV31CanonicalResource,
  DeterministicV31CanonicalRetirementAgingState,
  DeterministicV31CanonicalSafetyRisk,
  DeterministicV31CanonicalScore,
  DeterministicV31CanonicalSource,
  DeterministicV31CanonicalTaxFinanceState,
  DeterministicV31CanonicalTransportationState,
  DeterministicV31CanonicalVisaResidencyState,
  DeterministicV31CanonicalWorkBusinessState,
} from "../../workbook-v31-deterministic-core";

export type CanonicalDestinationKey = string & { readonly __brand: "CanonicalDestinationKey" };
export type DestinationId = string & { readonly __brand: "DestinationId" };
export type StableChildKey = string & { readonly __brand: "StableChildKey" };

export type FactKey = StableChildKey & { readonly __factKeyBrand: true };
export type ScoreKey = StableChildKey & { readonly __scoreKeyBrand: true };
export type NeighborhoodKey = StableChildKey & { readonly __neighborhoodKeyBrand: true };
export type PlaceKey = StableChildKey & { readonly __placeKeyBrand: true };
export type ResourceKey = StableChildKey & { readonly __resourceKeyBrand: true };
export type MediaKey = StableChildKey & { readonly __mediaKeyBrand: true };
export type SourceKey = StableChildKey & { readonly __sourceKeyBrand: true };
export type CostOfLivingItemKey = StableChildKey & { readonly __costOfLivingItemKeyBrand: true };
export type PropertyResourceKey = StableChildKey & { readonly __propertyResourceKeyBrand: true };
export type SafetyRiskKey = StableChildKey & { readonly __safetyRiskKeyBrand: true };
export type RealityCheckKey = StableChildKey & { readonly __realityCheckKeyBrand: true };
export type MoveChecklistKey = StableChildKey & { readonly __moveChecklistKeyBrand: true };
export type EventsSeasonalityKey = StableChildKey & { readonly __eventsSeasonalityKeyBrand: true };
export type MonthKey = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type ScalarValue = string | number | boolean | null;

type CanonicalNullableString<T extends string | null> = T extends null ? null : string | null;

type AssertTrue<T extends true> = T;
type IsEqual<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

export type StoredEditorialStateShape<T extends DeterministicV31CanonicalEditorial> = {
  readonly shortDescription: CanonicalNullableString<T["shortDescription"]>;
  readonly longDescription: CanonicalNullableString<T["longDescription"]>;
  readonly currency: CanonicalNullableString<T["currency"]>;
  readonly primaryLanguage: CanonicalNullableString<T["primaryLanguage"]>;
  readonly timeZone: CanonicalNullableString<T["timeZone"]>;
};

export type StoredFactShape<T extends DeterministicV31CanonicalFact> = {
  readonly factKey: FactKey;
  readonly factGroup: CanonicalNullableString<T["factGroup"]>;
  readonly valueText: CanonicalNullableString<T["valueText"]>;
  readonly displayLabel: CanonicalNullableString<T["displayLabel"]>;
  readonly sourceName: CanonicalNullableString<T["sourceName"]>;
};

export type StoredScoreShape<T extends DeterministicV31CanonicalScore> = {
  readonly scoreKey: ScoreKey;
  readonly scoreValue: CanonicalNullableString<T["scoreValue"]>;
  readonly scoreLabel: CanonicalNullableString<T["scoreLabel"]>;
  readonly methodologyVersion: CanonicalNullableString<T["methodologyVersion"]>;
};

export type StoredNeighborhoodShape<T extends DeterministicV31CanonicalNeighborhood> = {
  readonly neighborhoodKey: NeighborhoodKey;
  readonly name: CanonicalNullableString<T["neighborhood_name"]>;
  readonly summary: CanonicalNullableString<T["summary"]>;
  readonly areaType: CanonicalNullableString<T["area_type"]>;
};

export type StoredPlaceShape<T extends DeterministicV31CanonicalPlace> = {
  readonly placeKey: PlaceKey;
  readonly category: CanonicalNullableString<T["category_key"]>;
  readonly name: CanonicalNullableString<T["place_name"]>;
  readonly description: CanonicalNullableString<T["description"]>;
};

export type StoredResourceShape<T extends DeterministicV31CanonicalResource> = {
  readonly resourceKey: ResourceKey;
  readonly category: CanonicalNullableString<T["resource_category"]>;
  readonly name: CanonicalNullableString<T["resource_name"]>;
  readonly url: CanonicalNullableString<T["url"]>;
};

export type StoredMediaShape<T extends DeterministicV31CanonicalMedia> = {
  readonly mediaKey: MediaKey;
  readonly kind: CanonicalNullableString<T["media_type"]>;
  readonly url: CanonicalNullableString<T["image_url"]>;
  readonly caption: CanonicalNullableString<T["caption"]>;
  readonly altText: CanonicalNullableString<T["subject"]>;
};

export type StoredCostOfLivingItemShape<T extends DeterministicV31CanonicalCostOfLivingItem> = {
  readonly itemKey: CanonicalNullableString<T["record_key"]>;
  readonly category: CanonicalNullableString<T["category"]>;
  readonly monthlyLow: CanonicalNullableString<T["monthly_low"]>;
  readonly monthlyHigh: CanonicalNullableString<T["monthly_high"]>;
  readonly currency: CanonicalNullableString<T["currency"]>;
};

export type StoredClimateMonthShape<T extends DeterministicV31CanonicalClimateMonth> = {
  readonly monthKey: CanonicalNullableString<T["month"]>;
  readonly avgHighTemp: CanonicalNullableString<T["avg_high_c"]>;
  readonly avgLowTemp: CanonicalNullableString<T["avg_low_c"]>;
  readonly precipitationMm: CanonicalNullableString<T["rainfall_mm"]>;
  readonly humidityPct: CanonicalNullableString<T["humidity_pct"]>;
};

export type StoredHousingStateShape<T extends DeterministicV31CanonicalHousingState> = {
  readonly summary: CanonicalNullableString<T["restrictions_summary"]>;
  readonly buyingSummary: CanonicalNullableString<T["buying_process_summary"]>;
  readonly rentalSummary: CanonicalNullableString<T["rental_rules_notes"]>;
};

export type StoredPropertyResourceShape<T extends DeterministicV31CanonicalPropertyResource> = {
  readonly itemKey: PropertyResourceKey;
  readonly category: CanonicalNullableString<T["resource_type"]>;
  readonly name: CanonicalNullableString<T["resource_name"]>;
  readonly url: CanonicalNullableString<T["url"]>;
};

export type StoredHealthcareStateShape<T extends DeterministicV31CanonicalHealthcareState> = {
  readonly summary: CanonicalNullableString<T["system_summary"]>;
  readonly publicAccessSummary: CanonicalNullableString<T["public_access_foreigners"]>;
  readonly insuranceSummary: CanonicalNullableString<T["international_insurance_notes"]>;
};

export type StoredVisaResidencyStateShape<T extends DeterministicV31CanonicalVisaResidencyState> = {
  readonly summary: CanonicalNullableString<T["visa_type"]>;
  readonly residencyPath: CanonicalNullableString<T["permanent_residency_path"]>;
  readonly citizenshipPath: CanonicalNullableString<T["citizenship_path"]>;
};

export type StoredTaxFinanceStateShape<T extends DeterministicV31CanonicalTaxFinanceState> = {
  readonly summary: CanonicalNullableString<T["summary"]>;
  readonly notes: CanonicalNullableString<T["income_tax_notes"]>;
};

export type StoredLgbtqInclusivityStateShape<T extends DeterministicV31CanonicalLgbtqInclusivityState> = {
  readonly summary: CanonicalNullableString<T["evidence_summary"]>;
  readonly culturalNotes: CanonicalNullableString<T["community_scene"]>;
};

export type StoredSafetyRiskShape<T extends DeterministicV31CanonicalSafetyRisk> = {
  readonly itemKey: SafetyRiskKey;
  readonly topic: CanonicalNullableString<T["risk_type"]>;
  readonly severity: CanonicalNullableString<T["severity"]>;
  readonly summary: CanonicalNullableString<T["summary"]>;
};

export type StoredTransportationStateShape<T extends DeterministicV31CanonicalTransportationState> = {
  readonly summary: CanonicalNullableString<T["summary"]>;
  readonly airportSummary: CanonicalNullableString<T["name"]>;
  readonly transitSummary: CanonicalNullableString<T["public_transit_available"]>;
};

export type StoredRemoteWorkStateShape<T extends DeterministicV31CanonicalRemoteWorkState> = {
  readonly summary: CanonicalNullableString<T["remote_work_notes"]>;
  readonly internetSummary: CanonicalNullableString<T["avg_download_mbps"]>;
  readonly timezoneSummary: CanonicalNullableString<T["us_time_zone_fit"]>;
};

export type StoredLanguageIntegrationStateShape<T extends DeterministicV31CanonicalLanguageIntegrationState> = {
  readonly summary: CanonicalNullableString<T["integration_notes"]>;
  readonly englishSupport: CanonicalNullableString<T["can_function_in_english"]>;
};

export type StoredPetStateShape<T extends DeterministicV31CanonicalPetState> = {
  readonly summary: CanonicalNullableString<T["pet_friendly_rentals"]>;
  readonly petFriendlyNotes: CanonicalNullableString<T["dog_parks_summary"]>;
};

export type StoredFamilyEducationStateShape<T extends DeterministicV31CanonicalFamilyEducationState> = {
  readonly summary: CanonicalNullableString<T["summary"]>;
  readonly schoolsSummary: CanonicalNullableString<T["universities"]>;
};

export type StoredCommunitySocialStateShape<T extends DeterministicV31CanonicalCommunitySocialState> = {
  readonly summary: CanonicalNullableString<T["summary"]>;
  readonly socialNotes: CanonicalNullableString<T["clubs_groups"]>;
};

export type StoredAccessibilityStateShape<T extends DeterministicV31CanonicalAccessibilityState> = {
  readonly summary: CanonicalNullableString<T["mobility_notes"]>;
  readonly mobilityNotes: CanonicalNullableString<T["wheelchair_access"]>;
};

export type StoredBureaucracySetupStateShape<T extends DeterministicV31CanonicalBureaucracySetupState> = {
  readonly summary: CanonicalNullableString<T["summary"]>;
  readonly setupNotes: CanonicalNullableString<T["typical_documents"]>;
};

export type StoredWorkBusinessStateShape<T extends DeterministicV31CanonicalWorkBusinessState> = {
  readonly summary: CanonicalNullableString<T["employment_notes"]>;
  readonly remoteWorkNotes: CanonicalNullableString<T["remote_work_suitability"]>;
};

export type StoredRetirementAgingStateShape<T extends DeterministicV31CanonicalRetirementAgingState> = {
  readonly summary: CanonicalNullableString<T["retirement_notes"]>;
  readonly agingNotes: CanonicalNullableString<T["assisted_living"]>;
};

export type StoredLifestyleLawStateShape<T extends DeterministicV31CanonicalLifestyleLawState> = {
  readonly summary: CanonicalNullableString<T["summary"]>;
  readonly legalNotes: CanonicalNullableString<T["important_rules"]>;
};

export type StoredRealityCheckEntryShape<T extends DeterministicV31CanonicalRealityCheckEntry> = {
  readonly itemKey: RealityCheckKey;
  readonly title: CanonicalNullableString<T["title"]>;
  readonly detail: CanonicalNullableString<T["detail"]>;
  readonly severity: CanonicalNullableString<T["severity"]>;
};

export type StoredMoveChecklistStateShape<T extends DeterministicV31CanonicalMoveChecklistState> = {
  readonly checklistKey: MoveChecklistKey;
  readonly summary: CanonicalNullableString<T["task"]>;
  readonly checklistNotes: CanonicalNullableString<T["description"]>;
};

export type StoredEnvironmentQualityStateShape<T extends DeterministicV31CanonicalEnvironmentQualityState | null> = T extends null ? null : {
  readonly summary: CanonicalNullableString<T["air_quality_summary"]>;
  readonly qualityNotes: CanonicalNullableString<T["water_quality_summary"]>;
};

export type StoredDailyLifePracticalityStateShape<T extends DeterministicV31CanonicalDailyLifePracticalityState | null> = T extends null ? null : {
  readonly summary: CanonicalNullableString<T["grocery_access"]>;
  readonly practicalityNotes: CanonicalNullableString<T["things_residents_wish_they_knew"]>;
};

export type StoredEventsSeasonalityStateShape<T extends DeterministicV31CanonicalEventsSeasonalityState> = {
  readonly eventSeasonalityKey: EventsSeasonalityKey;
  readonly summary: CanonicalNullableString<T["description"]>;
  readonly seasonalityNotes: CanonicalNullableString<T["weather_context"]>;
};

export type StoredSourceShape<T extends DeterministicV31CanonicalSource> = {
  readonly sourceKey: SourceKey;
  readonly name: CanonicalNullableString<T["source_name"]>;
  readonly url: CanonicalNullableString<T["source_url"]>;
  readonly type: CanonicalNullableString<T["source_type"]>;
};

type StoredDestinationStateShape<T extends DeterministicV31CanonicalDestination> = {
  readonly identity: {
    readonly destinationKey: CanonicalDestinationKey;
    readonly slug: CanonicalNullableString<T["identity"]["slug"]>;
    readonly name: CanonicalNullableString<T["identity"]["name"]>;
    readonly city: CanonicalNullableString<T["identity"]["city"]>;
    readonly country: CanonicalNullableString<T["identity"]["country"]>;
  };
  readonly editorial: StoredEditorialStateShape<T["editorial"]>;
  readonly facts: readonly StoredFactShape<T["facts"][number]>[];
  readonly scores: readonly StoredScoreShape<T["scores"][number]>[];
  readonly neighborhoods: readonly StoredNeighborhoodShape<T["neighborhoods"][number]>[];
  readonly places: readonly StoredPlaceShape<T["places"][number]>[];
  readonly resources: readonly StoredResourceShape<T["resources"][number]>[];
  readonly media: readonly StoredMediaShape<T["media"][number]>[];
  readonly costOfLiving: readonly StoredCostOfLivingItemShape<T["costOfLiving"][number]>[];
  readonly climateMonthly: readonly StoredClimateMonthShape<T["climateMonthly"][number]>[];
  readonly housing: readonly StoredHousingStateShape<T["housing"][number]>[];
  readonly propertyResources: readonly StoredPropertyResourceShape<T["propertyResources"][number]>[];
  readonly healthcare: readonly StoredHealthcareStateShape<T["healthcare"][number]>[];
  readonly visaResidency: readonly StoredVisaResidencyStateShape<T["visaResidency"][number]>[];
  readonly taxesFinance: readonly StoredTaxFinanceStateShape<T["taxesFinance"][number]>[];
  readonly lgbtqInclusivity: readonly StoredLgbtqInclusivityStateShape<T["lgbtqInclusivity"][number]>[];
  readonly safetyRisks: readonly StoredSafetyRiskShape<T["safetyRisks"][number]>[];
  readonly transportation: readonly StoredTransportationStateShape<T["transportation"][number]>[];
  readonly remoteWork: readonly StoredRemoteWorkStateShape<T["remoteWork"][number]>[];
  readonly languageIntegration: readonly StoredLanguageIntegrationStateShape<T["languageIntegration"][number]>[];
  readonly pets: readonly StoredPetStateShape<T["pets"][number]>[];
  readonly familyEducation: readonly StoredFamilyEducationStateShape<T["familyEducation"][number]>[];
  readonly communitySocial: readonly StoredCommunitySocialStateShape<T["communitySocial"][number]>[];
  readonly accessibility: readonly StoredAccessibilityStateShape<T["accessibility"][number]>[];
  readonly bureaucracySetup: readonly StoredBureaucracySetupStateShape<T["bureaucracySetup"][number]>[];
  readonly workBusiness: readonly StoredWorkBusinessStateShape<T["workBusiness"][number]>[];
  readonly retirementAging: readonly StoredRetirementAgingStateShape<T["retirementAging"][number]>[];
  readonly lifestyleLaws: readonly StoredLifestyleLawStateShape<T["lifestyleLaws"][number]>[];
  readonly realityCheck: readonly StoredRealityCheckEntryShape<T["realityCheck"][number]>[];
  readonly moveChecklist: readonly StoredMoveChecklistStateShape<T["moveChecklist"][number]>[];
  readonly environmentQuality: StoredEnvironmentQualityStateShape<T["environmentQuality"]> | null;
  readonly dailyLifePracticality: StoredDailyLifePracticalityStateShape<T["dailyLifePracticality"]> | null;
  readonly eventsSeasonality: readonly StoredEventsSeasonalityStateShape<T["eventsSeasonality"][number]>[];
  readonly sources: readonly StoredSourceShape<T["sources"][number]>[];
};

type CanonicalModuleCardinality<M extends keyof DeterministicV31CanonicalDestination> = DeterministicV31CanonicalDestination[M] extends ReadonlyArray<infer _> ? "array" : "singleton";
type StoredModuleCardinality<M extends keyof StoredDestinationStateShape<DeterministicV31CanonicalDestination>> = StoredDestinationStateShape<DeterministicV31CanonicalDestination>[M] extends ReadonlyArray<infer _> ? "array" : "singleton";

type CanonicalModuleShape<M extends keyof DeterministicV31CanonicalDestination> = DeterministicV31CanonicalDestination[M] extends ReadonlyArray<infer Element> ? Element : DeterministicV31CanonicalDestination[M];
type StoredModuleShape<M extends keyof StoredDestinationStateShape<DeterministicV31CanonicalDestination>> = StoredDestinationStateShape<DeterministicV31CanonicalDestination>[M] extends ReadonlyArray<infer Element> ? Element : StoredDestinationStateShape<DeterministicV31CanonicalDestination>[M];

type ModuleFieldMapping = {
  facts: { factKey: "factKey"; factGroup: "factGroup"; valueText: "valueText"; displayLabel: "displayLabel"; sourceName: "sourceName" };
  scores: { scoreKey: "scoreKey"; scoreValue: "scoreValue"; scoreLabel: "scoreLabel"; methodologyVersion: "methodologyVersion" };
  neighborhoods: { neighborhood_key: "neighborhoodKey"; neighborhood_name: "name"; summary: "summary"; area_type: "areaType" };
  places: { place_key: "placeKey"; category_key: "category"; place_name: "name"; description: "description" };
  resources: { resource_key: "resourceKey"; resource_category: "category"; resource_name: "name"; url: "url" };
  media: { media_key: "mediaKey"; media_type: "kind"; image_url: "url"; caption: "caption"; subject: "altText" };
  costOfLiving: { record_key: "itemKey"; category: "category"; monthly_low: "monthlyLow"; monthly_high: "monthlyHigh"; currency: "currency" };
  climateMonthly: { month: "monthKey"; avg_high_c: "avgHighTemp"; avg_low_c: "avgLowTemp"; rainfall_mm: "precipitationMm"; humidity_pct: "humidityPct" };
  housing: { restrictions_summary: "summary"; buying_process_summary: "buyingSummary"; rental_rules_notes: "rentalSummary" };
  propertyResources: { resource_key: "itemKey"; resource_type: "category"; resource_name: "name"; url: "url" };
  healthcare: { system_summary: "summary"; public_access_foreigners: "publicAccessSummary"; international_insurance_notes: "insuranceSummary" };
  visaResidency: { visa_type: "summary"; permanent_residency_path: "residencyPath"; citizenship_path: "citizenshipPath" };
  taxesFinance: { summary: "summary"; income_tax_notes: "notes" };
  lgbtqInclusivity: { evidence_summary: "summary"; community_scene: "culturalNotes" };
  safetyRisks: { record_key: "itemKey"; risk_type: "topic"; severity: "severity"; summary: "summary" };
  transportation: { summary: "summary"; name: "airportSummary"; public_transit_available: "transitSummary" };
  remoteWork: { remote_work_notes: "summary"; avg_download_mbps: "internetSummary"; us_time_zone_fit: "timezoneSummary" };
  languageIntegration: { integration_notes: "summary"; can_function_in_english: "englishSupport" };
  pets: { pet_friendly_rentals: "summary"; dog_parks_summary: "petFriendlyNotes" };
  familyEducation: { summary: "summary"; universities: "schoolsSummary" };
  communitySocial: { summary: "summary"; clubs_groups: "socialNotes" };
  accessibility: { mobility_notes: "summary"; wheelchair_access: "mobilityNotes" };
  bureaucracySetup: { summary: "summary"; typical_documents: "setupNotes" };
  workBusiness: { employment_notes: "summary"; remote_work_suitability: "remoteWorkNotes" };
  retirementAging: { retirement_notes: "summary"; assisted_living: "agingNotes" };
  lifestyleLaws: { summary: "summary"; important_rules: "legalNotes" };
  realityCheck: { record_key: "itemKey"; title: "title"; detail: "detail"; severity: "severity" };
  moveChecklist: { checklist_key: "checklistKey"; task: "summary"; description: "checklistNotes" };
  environmentQuality: { air_quality_summary: "summary"; water_quality_summary: "qualityNotes" };
  dailyLifePracticality: { grocery_access: "summary"; things_residents_wish_they_knew: "practicalityNotes" };
  eventsSeasonality: { event_season_key: "eventSeasonalityKey"; description: "summary"; weather_context: "seasonalityNotes" };
  sources: { source_key: "sourceKey"; source_name: "name"; source_url: "url"; source_type: "type" };
};

type CanonicalModuleConformanceSet<M extends keyof ModuleFieldMapping> = Extract<keyof CanonicalModuleShape<M>, keyof ModuleFieldMapping[M]>;
type PersistenceModuleConformanceSet<M extends keyof ModuleFieldMapping> = Extract<keyof StoredModuleShape<M>, ModuleFieldMapping[M][keyof ModuleFieldMapping[M]]>;

type _TopLevelModuleConformance = AssertTrue<IsEqual<keyof DeterministicV31CanonicalDestination, keyof StoredDestinationState>>;
type _FactsFieldConformance = AssertTrue<IsEqual<CanonicalModuleConformanceSet<"facts">, keyof ModuleFieldMapping["facts"]>>;
type _FactsPersistenceFieldConformance = AssertTrue<IsEqual<PersistenceModuleConformanceSet<"facts">, ModuleFieldMapping["facts"][keyof ModuleFieldMapping["facts"]]>>;
type _ScoresFieldConformance = AssertTrue<IsEqual<CanonicalModuleConformanceSet<"scores">, keyof ModuleFieldMapping["scores"]>>;
type _ScoresPersistenceFieldConformance = AssertTrue<IsEqual<PersistenceModuleConformanceSet<"scores">, ModuleFieldMapping["scores"][keyof ModuleFieldMapping["scores"]]>>;
type _NeighborhoodsFieldConformance = AssertTrue<IsEqual<CanonicalModuleConformanceSet<"neighborhoods">, keyof ModuleFieldMapping["neighborhoods"]>>;
type _NeighborhoodsPersistenceFieldConformance = AssertTrue<IsEqual<PersistenceModuleConformanceSet<"neighborhoods">, ModuleFieldMapping["neighborhoods"][keyof ModuleFieldMapping["neighborhoods"]]>>;
type _FactsCardinality = AssertTrue<IsEqual<CanonicalModuleCardinality<"facts">, StoredModuleCardinality<"facts">>>;
type _HousingCardinality = AssertTrue<IsEqual<CanonicalModuleCardinality<"housing">, StoredModuleCardinality<"housing">>>;
type _EnvironmentQualityCardinality = AssertTrue<IsEqual<CanonicalModuleCardinality<"environmentQuality">, StoredModuleCardinality<"environmentQuality">>>;
type _SourcesCardinality = AssertTrue<IsEqual<CanonicalModuleCardinality<"sources">, StoredModuleCardinality<"sources">>>;

export interface DestinationIdentityRef {
  readonly destinationKey: CanonicalDestinationKey;
  readonly destinationId?: DestinationId | null;
}

export interface ResolvedDestinationIdentity {
  readonly destinationKey: CanonicalDestinationKey;
  readonly destinationId: DestinationId;
}

export type StoredEditorialState = StoredEditorialStateShape<DeterministicV31CanonicalEditorial>;

export type StoredFact = StoredFactShape<DeterministicV31CanonicalFact>;

export type StoredScore = StoredScoreShape<DeterministicV31CanonicalScore>;

export type StoredNeighborhood = StoredNeighborhoodShape<DeterministicV31CanonicalNeighborhood>;

export type StoredPlace = StoredPlaceShape<DeterministicV31CanonicalPlace>;

export type StoredResource = StoredResourceShape<DeterministicV31CanonicalResource>;

export type StoredMedia = StoredMediaShape<DeterministicV31CanonicalMedia>;

export type StoredCostOfLivingItem = StoredCostOfLivingItemShape<DeterministicV31CanonicalCostOfLivingItem>;

export type StoredClimateMonth = StoredClimateMonthShape<DeterministicV31CanonicalClimateMonth>;

export type StoredHousingState = StoredHousingStateShape<DeterministicV31CanonicalHousingState>;

export type StoredPropertyResource = StoredPropertyResourceShape<DeterministicV31CanonicalPropertyResource>;

export type StoredHealthcareState = StoredHealthcareStateShape<DeterministicV31CanonicalHealthcareState>;

export type StoredVisaResidencyState = StoredVisaResidencyStateShape<DeterministicV31CanonicalVisaResidencyState>;

export type StoredTaxFinanceState = StoredTaxFinanceStateShape<DeterministicV31CanonicalTaxFinanceState>;

export type StoredLgbtqInclusivityState = StoredLgbtqInclusivityStateShape<DeterministicV31CanonicalLgbtqInclusivityState>;

export type StoredSafetyRisk = StoredSafetyRiskShape<DeterministicV31CanonicalSafetyRisk>;

export type StoredTransportationState = StoredTransportationStateShape<DeterministicV31CanonicalTransportationState>;

export type StoredRemoteWorkState = StoredRemoteWorkStateShape<DeterministicV31CanonicalRemoteWorkState>;

export type StoredLanguageIntegrationState = StoredLanguageIntegrationStateShape<DeterministicV31CanonicalLanguageIntegrationState>;

export type StoredPetState = StoredPetStateShape<DeterministicV31CanonicalPetState>;

export type StoredFamilyEducationState = StoredFamilyEducationStateShape<DeterministicV31CanonicalFamilyEducationState>;

export type StoredCommunitySocialState = StoredCommunitySocialStateShape<DeterministicV31CanonicalCommunitySocialState>;

export type StoredAccessibilityState = StoredAccessibilityStateShape<DeterministicV31CanonicalAccessibilityState>;

export type StoredBureaucracySetupState = StoredBureaucracySetupStateShape<DeterministicV31CanonicalBureaucracySetupState>;

export type StoredWorkBusinessState = StoredWorkBusinessStateShape<DeterministicV31CanonicalWorkBusinessState>;

export type StoredRetirementAgingState = StoredRetirementAgingStateShape<DeterministicV31CanonicalRetirementAgingState>;

export type StoredLifestyleLawState = StoredLifestyleLawStateShape<DeterministicV31CanonicalLifestyleLawState>;

export type StoredRealityCheckEntry = StoredRealityCheckEntryShape<DeterministicV31CanonicalRealityCheckEntry>;

export type StoredMoveChecklistState = StoredMoveChecklistStateShape<DeterministicV31CanonicalMoveChecklistState>;

export type StoredEnvironmentQualityState = StoredEnvironmentQualityStateShape<DeterministicV31CanonicalEnvironmentQualityState | null>;

export type StoredDailyLifePracticalityState = StoredDailyLifePracticalityStateShape<DeterministicV31CanonicalDailyLifePracticalityState | null>;

export type StoredEventsSeasonalityState = StoredEventsSeasonalityStateShape<DeterministicV31CanonicalEventsSeasonalityState>;

export type StoredSource = StoredSourceShape<DeterministicV31CanonicalSource>;

export type StoredDestinationState = StoredDestinationStateShape<DeterministicV31CanonicalDestination>;

export type UpdateMode = "MERGE_NONBLANK";

export interface DiffPolicy {
  readonly updateMode: UpdateMode;
  readonly normalizationVersion: string | null;
  readonly diffPolicyVersion: string | null;
  readonly arrayOrderRule?: "stable-key-order" | "preserve-existing-order" | "canonical-order" | null;
}

export type ScalarOperationKind = "CREATE" | "UPDATE" | "UNCHANGED" | "PRESERVE" | "CLEAR";

export type ScalarModuleKey = "editorial" | SingletonModuleKey;

export interface ScalarCreateOperation {
  readonly kind: "CREATE";
  readonly module: ScalarModuleKey;
  readonly fieldPath: string;
  readonly currentValue: null;
  readonly incomingValue: Exclude<ScalarValue, null>;
}

export interface ScalarUpdateOperation {
  readonly kind: "UPDATE";
  readonly module: ScalarModuleKey;
  readonly fieldPath: string;
  readonly currentValue: Exclude<ScalarValue, null>;
  readonly incomingValue: Exclude<ScalarValue, null>;
}

export interface ScalarUnchangedOperation {
  readonly kind: "UNCHANGED";
  readonly module: ScalarModuleKey;
  readonly fieldPath: string;
  readonly currentValue: Exclude<ScalarValue, null>;
  readonly incomingValue: Exclude<ScalarValue, null>;
}

export interface ScalarPreserveOperation {
  readonly kind: "PRESERVE";
  readonly module: ScalarModuleKey;
  readonly fieldPath: string;
  readonly currentValue: Exclude<ScalarValue, null>;
  readonly incomingValue: null;
}

export interface ScalarClearOperation {
  readonly kind: "CLEAR";
  readonly module: ScalarModuleKey;
  readonly fieldPath: string;
  readonly currentValue: Exclude<ScalarValue, null>;
  readonly incomingValue: null;
}

export type ScalarOperation =
  | ScalarCreateOperation
  | ScalarUpdateOperation
  | ScalarUnchangedOperation
  | ScalarPreserveOperation
  | ScalarClearOperation;

export type CanonicalRepeatableModuleKey =
  | "facts"
  | "scores"
  | "neighborhoods"
  | "places"
  | "resources"
  | "media"
  | "costOfLiving"
  | "climateMonthly"
  | "housing"
  | "propertyResources"
  | "healthcare"
  | "visaResidency"
  | "taxesFinance"
  | "lgbtqInclusivity"
  | "safetyRisks"
  | "transportation"
  | "remoteWork"
  | "languageIntegration"
  | "pets"
  | "familyEducation"
  | "communitySocial"
  | "accessibility"
  | "bureaucracySetup"
  | "workBusiness"
  | "retirementAging"
  | "lifestyleLaws"
  | "realityCheck"
  | "moveChecklist"
  | "environmentQuality"
  | "dailyLifePracticality"
  | "eventsSeasonality"
  | "sources";

export type KeyedChildModuleKey =
  | "facts"
  | "scores"
  | "neighborhoods"
  | "places"
  | "resources"
  | "media"
  | "propertyResources"
  | "moveChecklist"
  | "eventsSeasonality"
  | "sources";

export type NonKeyedRepeatableModuleKey = Exclude<CanonicalRepeatableModuleKey, KeyedChildModuleKey>;

export type RepeatableModuleKey = KeyedChildModuleKey | NonKeyedRepeatableModuleKey;

export type SingletonModuleKey = "environmentQuality" | "dailyLifePracticality";

export type PersistenceModuleKey = RepeatableModuleKey | SingletonModuleKey;

export interface ChildPayloadByModule {
  facts: StoredFact;
  scores: StoredScore;
  neighborhoods: StoredNeighborhood;
  places: StoredPlace;
  resources: StoredResource;
  media: StoredMedia;
  propertyResources: StoredPropertyResource;
  moveChecklist: StoredMoveChecklistState;
  eventsSeasonality: StoredEventsSeasonalityState;
  sources: StoredSource;
}

export type ChildPayload = ChildPayloadByModule[KeyedChildModuleKey];

export type ChildStableKeyByModule = {
  facts: FactKey;
  scores: ScoreKey;
  neighborhoods: NeighborhoodKey;
  places: PlaceKey;
  resources: ResourceKey;
  media: MediaKey;
  propertyResources: PropertyResourceKey;
  moveChecklist: MoveChecklistKey;
  eventsSeasonality: EventsSeasonalityKey;
  sources: SourceKey;
};

type _ChildPayloadAndKeySetsMatch = AssertTrue<IsEqual<keyof ChildPayloadByModule, keyof ChildStableKeyByModule>>;
type _ChildPayloadAndKeySetsMatchToKeyed = AssertTrue<IsEqual<keyof ChildPayloadByModule, KeyedChildModuleKey>>;

export type ChildOperationKind = "CREATE_CHILD" | "UPDATE_CHILD" | "UNCHANGED_CHILD" | "PRESERVE_CHILD" | "DELETE_CHILD";

export interface ChildCreateOperation<M extends KeyedChildModuleKey> {
  readonly kind: "CREATE_CHILD";
  readonly module: M;
  readonly stableChildKey: ChildStableKeyByModule[M];
  readonly currentChild: null;
  readonly incomingChild: ChildPayloadByModule[M];
}

export interface ChildUpdateOperation<M extends KeyedChildModuleKey> {
  readonly kind: "UPDATE_CHILD";
  readonly module: M;
  readonly stableChildKey: ChildStableKeyByModule[M];
  readonly currentChild: ChildPayloadByModule[M];
  readonly incomingChild: ChildPayloadByModule[M];
}

export interface ChildUnchangedOperation<M extends KeyedChildModuleKey> {
  readonly kind: "UNCHANGED_CHILD";
  readonly module: M;
  readonly stableChildKey: ChildStableKeyByModule[M];
  readonly currentChild: ChildPayloadByModule[M];
  readonly incomingChild: ChildPayloadByModule[M];
}

export interface ChildPreserveOperation<M extends KeyedChildModuleKey> {
  readonly kind: "PRESERVE_CHILD";
  readonly module: M;
  readonly stableChildKey: ChildStableKeyByModule[M];
  readonly currentChild: ChildPayloadByModule[M];
  readonly incomingChild: null;
}

export interface ChildDeleteOperation<M extends KeyedChildModuleKey> {
  readonly kind: "DELETE_CHILD";
  readonly module: M;
  readonly stableChildKey: ChildStableKeyByModule[M];
  readonly currentChild: ChildPayloadByModule[M];
  readonly incomingChild: null;
}

export type ChildOperation = { [M in KeyedChildModuleKey]: ChildCreateOperation<M> | ChildUpdateOperation<M> | ChildUnchangedOperation<M> | ChildPreserveOperation<M> | ChildDeleteOperation<M> }[KeyedChildModuleKey];

export type ManifestOperationKind = "CLEAR_FIELD" | "DELETE_CHILD" | "REPLACE_MODULE";

export interface ClearFieldManifestEntry {
  readonly destinationKey: CanonicalDestinationKey;
  readonly operation: "CLEAR_FIELD";
  readonly targetModule: PersistenceModuleKey;
  readonly targetFieldPath: string;
  readonly reason?: string | null;
  readonly operatorNote?: string | null;
}

export interface DeleteChildManifestEntry {
  readonly destinationKey: CanonicalDestinationKey;
  readonly operation: "DELETE_CHILD";
  readonly targetModule: KeyedChildModuleKey;
  readonly targetChildKey: StableChildKey;
  readonly reason?: string | null;
  readonly operatorNote?: string | null;
}

export interface ReplaceModuleManifestEntry {
  readonly destinationKey: CanonicalDestinationKey;
  readonly operation: "REPLACE_MODULE";
  readonly targetModule: CanonicalRepeatableModuleKey;
  readonly reason?: string | null;
  readonly operatorNote?: string | null;
}

export type ManifestEntry = ClearFieldManifestEntry | DeleteChildManifestEntry | ReplaceModuleManifestEntry;

export interface OperationManifest {
  readonly entries: readonly ManifestEntry[];
}

export type DestinationPlanAction = "CREATE" | "UPDATE" | "UNCHANGED" | "ERROR";

export type ExecutionTransactionGranularity = "PER_DESTINATION";
export type ExecutionFailurePolicy = "CONTINUE_AFTER_FAILURE";
export type ExecutionReplayPolicy = "IDEMPOTENT_REPLAY";
export type ExecutionStalePlanPolicy = "STRICT_PRECONDITION_MATCH";

export interface ExecutionPolicy {
  readonly transactionGranularity: ExecutionTransactionGranularity;
  readonly failurePolicy: ExecutionFailurePolicy;
  readonly replayPolicy: ExecutionReplayPolicy;
  readonly stalePlanPolicy: ExecutionStalePlanPolicy;
  readonly readBackVerification: true;
}

export interface DestinationPlan {
  readonly destinationIdentity: ResolvedDestinationIdentity;
  readonly action: DestinationPlanAction;
  readonly scalarOperations: readonly ScalarOperation[];
  readonly childOperations: readonly ChildOperation[];
  readonly warnings: readonly string[];
  readonly errors: readonly import("./errors").PersistenceError[];
  readonly preStateHash?: string | null;
  readonly canonicalPayloadHash?: string | null;
}

export interface ApprovedDestinationScopeEntry {
  readonly destinationKey: CanonicalDestinationKey;
  readonly destinationId: DestinationId;
}

export type ApprovedDestinationScope = readonly ApprovedDestinationScopeEntry[];

export type PlanStatus = "DRAFT" | "APPROVED" | "EXECUTING" | "EXECUTED" | "EXPIRED" | "FAILED";

export interface PlanEnvelope {
  readonly planId?: string | null;
  readonly planHash?: string | null;
  readonly workbookHash?: string | null;
  readonly contractSchemaVersion?: string | null;
  readonly normalizationVersion?: string | null;
  readonly diffPolicyVersion?: string | null;
  readonly operationManifestHash?: string | null;
  readonly executionPolicy: ExecutionPolicy;
  readonly approvedScope: ApprovedDestinationScope;
  readonly createdAt?: string | null;
  readonly createdBy?: string | null;
  readonly approvedAt?: string | null;
  readonly approvedBy?: string | null;
  readonly expiresAt?: string | null;
  readonly status: PlanStatus;
  readonly destinationPlans: readonly DestinationPlan[];
}

export interface DiffReport {
  readonly destinationKey: CanonicalDestinationKey;
  readonly status: DestinationPlanAction;
  readonly scalarOperations: readonly ScalarOperation[];
  readonly childOperations: readonly ChildOperation[];
  readonly warnings: readonly string[];
  readonly errors: readonly import("./errors").PersistenceError[];
}

export interface ScalarDriftEntry {
  readonly kind: "scalar";
  readonly fieldPath: string;
  readonly storedValue: ScalarValue;
  readonly incomingValue: ScalarValue;
  readonly willPreserveBecauseMergeNonBlank: boolean;
}

export interface ChildDriftEntry {
  readonly kind: "child";
  readonly module: KeyedChildModuleKey;
  readonly stableChildKey: StableChildKey;
  readonly storedChild: ChildPayloadByModule[KeyedChildModuleKey] | null;
  readonly incomingChild: ChildPayloadByModule[KeyedChildModuleKey] | null;
  readonly willPreserveBecauseMergeNonBlank: boolean;
}

export type DriftEntry = ScalarDriftEntry | ChildDriftEntry;

export interface DriftReport {
  readonly destinationKey: CanonicalDestinationKey;
  readonly entries: readonly DriftEntry[];
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: readonly import("./errors").PersistenceError[];
  readonly warnings: readonly string[];
}
