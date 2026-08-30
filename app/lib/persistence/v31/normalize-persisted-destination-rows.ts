import type { NormalizedPersistedDestinationBundle } from "./materialize-stored-destination-state";
import type { PersistedPresenceModuleKey, ResolvedDestinationIdentity } from "./types";

export interface PersistedRootRow {
  readonly destinationId: string;
  readonly destinationKey: string;
  readonly slug: string | null;
  readonly name: string | null;
  readonly city: string | null;
  readonly country: string | null;
}

export interface PersistedProfileRow {
  readonly destinationId: string;
  readonly destinationKey: string;
  readonly profileStorageVersion: number | null;
  readonly identityName: string | null;
  readonly shortDescription: string | null;
  readonly longDescription: string | null;
  readonly currency: string | null;
  readonly primaryLanguage: string | null;
  readonly timeZone: string | null;
}

export interface PersistedPresenceRow {
  readonly destinationId: string;
  readonly destinationKey: string;
  readonly module: PersistedPresenceModuleKey;
}

export interface PersistedKeyedChildrenRows {
  readonly facts: readonly PersistedFactRow[];
  readonly scores: readonly PersistedScoreRow[];
  readonly neighborhoods: readonly PersistedNeighborhoodRow[];
  readonly places: readonly PersistedPlaceRow[];
  readonly resources: readonly PersistedResourceRow[];
  readonly media: readonly PersistedMediaRow[];
  readonly propertyResources: readonly PersistedPropertyResourceRow[];
  readonly moveChecklist: readonly PersistedMoveChecklistRow[];
  readonly eventsSeasonality: readonly PersistedEventsSeasonalityRow[];
  readonly sources: readonly PersistedSourceRow[];
}

export interface PersistedReplaceModulesRows {
  readonly costOfLiving: readonly PersistedCostOfLivingRow[];
  readonly climateMonthly: readonly PersistedClimateMonthRow[];
  readonly housing: readonly PersistedHousingRow[];
  readonly healthcare: readonly PersistedHealthcareRow[];
  readonly visaResidency: readonly PersistedVisaResidencyRow[];
  readonly taxesFinance: readonly PersistedTaxFinanceRow[];
  readonly lgbtqInclusivity: readonly PersistedPositionedRow[];
  readonly safetyRisks: readonly PersistedSafetyRiskRow[];
  readonly transportation: readonly PersistedTransportationRow[];
  readonly remoteWork: readonly PersistedRemoteWorkRow[];
  readonly languageIntegration: readonly PersistedPositionedRow[];
  readonly pets: readonly PersistedPositionedRow[];
  readonly familyEducation: readonly PersistedPositionedRow[];
  readonly communitySocial: readonly PersistedPositionedRow[];
  readonly accessibility: readonly PersistedPositionedRow[];
  readonly bureaucracySetup: readonly PersistedPositionedRow[];
  readonly workBusiness: readonly PersistedPositionedRow[];
  readonly retirementAging: readonly PersistedPositionedRow[];
  readonly lifestyleLaws: readonly PersistedPositionedRow[];
  readonly realityCheck: readonly PersistedRealityCheckRow[];
  /** Optional for backward compatibility with callers/fixtures predating LIFESTYLE_FEATURES (v3.3, additive, display-only). */
  readonly lifestyleFeatures?: readonly PersistedLifestyleFeatureRow[];
}

export interface PersistedSingletonsRows {
  readonly environmentQuality: readonly PersistedEnvironmentQualityRow[];
  readonly dailyLifePracticality: readonly PersistedDailyLifePracticalityRow[];
}

export interface PersistedFactRow {
  readonly destinationId: string;
  readonly destinationKey: string;
  readonly factKey: string;
  readonly factGroup: string | null;
  readonly valueText: string | null;
  readonly displayLabel: string | null;
  readonly sourceName: string | null;
}

export interface PersistedScoreRow {
  readonly destinationId: string;
  readonly destinationKey: string;
  readonly scoreKey: string;
  readonly scoreValue: string | null;
  readonly scoreLabel: string | null;
  readonly methodologyVersion: string | null;
  readonly verified: string | null;
  readonly verifiedAt: string | null;
}

export interface PersistedNeighborhoodRow {
  readonly destinationId: string;
  readonly destinationKey: string;
  readonly neighborhoodKey: string;
  readonly name: string | null;
  readonly summary: string | null;
  readonly areaType: string | null;
  readonly bestFor: string | null;
  readonly walkabilityRating: string | null;
  readonly safetyRating: string | null;
  readonly transitRating: string | null;
  readonly housingCharacter: string | null;
  readonly pros: string | null;
  readonly cons: string | null;
  readonly googleMapsUrl: string | null;
}

export interface PersistedPlaceRow {
  readonly destinationId: string;
  readonly destinationKey: string;
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
}

export interface PersistedResourceRow {
  readonly destinationId: string;
  readonly destinationKey: string;
  readonly resourceKey: string;
  readonly category: string | null;
  readonly name: string | null;
  readonly url: string | null;
}

export interface PersistedMediaRow {
  readonly destinationId: string;
  readonly destinationKey: string;
  readonly mediaKey: string;
  readonly kind: string | null;
  readonly url: string | null;
  readonly caption: string | null;
  readonly altText: string | null;
  readonly sourceName: string | null;
  readonly sourceUrl: string | null;
  readonly licenseNotes: string | null;
}

export interface PersistedPropertyResourceRow {
  readonly destinationId: string;
  readonly destinationKey: string;
  readonly itemKey: string;
  readonly category: string | null;
  readonly name: string | null;
  readonly url: string | null;
}

export interface PersistedMoveChecklistRow {
  readonly destinationId: string;
  readonly destinationKey: string;
  readonly checklistKey: string;
  readonly summary: string | null;
  readonly checklistNotes: string | null;
}

export interface PersistedEventsSeasonalityRow {
  readonly destinationId: string;
  readonly destinationKey: string;
  readonly eventSeasonalityKey: string;
  readonly summary: string | null;
  readonly seasonalityNotes: string | null;
}

export interface PersistedSourceRow {
  readonly destinationId: string;
  readonly destinationKey: string;
  readonly sourceKey: string;
  readonly name: string | null;
  readonly url: string | null;
  readonly type: string | null;
}

export interface PersistedCostOfLivingRow {
  readonly destinationId: string;
  readonly destinationKey: string;
  readonly itemKey: string;
  readonly category: string | null;
  readonly monthlyLow: string | null;
  readonly monthlyHigh: string | null;
  readonly currency: string | null;
  readonly householdType: string | null;
  readonly lifestyleTier: string | null;
  readonly stayModeKey: string | null;
  readonly verified: string | null;
  readonly verifiedAt: string | null;
}

export interface PersistedClimateMonthRow {
  readonly destinationId: string;
  readonly destinationKey: string;
  readonly monthKey: string;
  readonly avgHighTemp: string | null;
  readonly avgLowTemp: string | null;
  readonly precipitationMm: string | null;
  readonly humidityPct: string | null;
}

export interface PersistedHousingRow {
  readonly destinationId: string;
  readonly destinationKey: string;
  readonly summary: string | null;
  readonly buyingSummary: string | null;
  readonly rentalSummary: string | null;
  readonly stayModeKey: string | null;
  readonly canForeignersBuy: string | null;
  readonly residencyRequiredToBuy: string | null;
  readonly verified: string | null;
  readonly verifiedAt: string | null;
}

export interface PersistedHealthcareRow {
  readonly destinationId: string;
  readonly destinationKey: string;
  readonly summary: string | null;
  readonly publicAccessSummary: string | null;
  readonly insuranceSummary: string | null;
  readonly topic: string | null;
  readonly englishSpeakingCare: string | null;
  readonly typicalGpVisitCost: string | null;
  readonly typicalSpecialistCost: string | null;
  readonly verified: string | null;
  readonly verifiedAt: string | null;
}

export interface PersistedVisaResidencyRow {
  readonly destinationId: string;
  readonly destinationKey: string;
  readonly summary: string | null;
  readonly residencyPath: string | null;
  readonly citizenshipPath: string | null;
  readonly stayModeKey: string | null;
  readonly travelerNationality: string | null;
  readonly verified: string | null;
  readonly verifiedAt: string | null;
}

export interface PersistedTaxFinanceRow {
  readonly destinationId: string;
  readonly destinationKey: string;
  readonly summary: string | null;
  readonly notes: string | null;
  readonly verified: string | null;
  readonly verifiedAt: string | null;
}

export interface PersistedPositionedRow {
  readonly destinationId: string;
  readonly destinationKey: string;
  readonly position: number;
  readonly summary: string | null;
  readonly [key: string]: unknown;
}

export interface PersistedSafetyRiskRow {
  readonly destinationId: string;
  readonly destinationKey: string;
  readonly itemKey: string;
  readonly topic: string | null;
  readonly severity: string | null;
  readonly summary: string | null;
  readonly verified: string | null;
  readonly verifiedAt: string | null;
}

export interface PersistedTransportationRow {
  readonly destinationId: string;
  readonly destinationKey: string;
  readonly summary: string | null;
  readonly airportSummary: string | null;
  readonly transitSummary: string | null;
  readonly topic: string | null;
  readonly distanceKm: string | null;
  readonly typicalDriveMinutes: string | null;
  readonly nonstopUsService: string | null;
  readonly carNeededRating: string | null;
  readonly parkingNotes: string | null;
  readonly rideshareNotes: string | null;
  readonly verified: string | null;
  readonly verifiedAt: string | null;
}

export interface PersistedRemoteWorkRow {
  readonly destinationId: string;
  readonly destinationKey: string;
  readonly summary: string | null;
  readonly internetSummary: string | null;
  readonly timezoneSummary: string | null;
  readonly fiberAvailable: string | null;
  readonly mobile5g: string | null;
  readonly utilityReliability: string | null;
  readonly coworkingSummary: string | null;
  readonly verified: string | null;
  readonly verifiedAt: string | null;
}

export interface PersistedRealityCheckRow {
  readonly destinationId: string;
  readonly destinationKey: string;
  readonly itemKey: string;
  readonly title: string | null;
  readonly detail: string | null;
  readonly severity: string | null;
}

/** LIFESTYLE_FEATURES (v3.3, additive, display-only) - every field preserved verbatim. */
export interface PersistedLifestyleFeatureRow {
  readonly destinationId: string;
  readonly destinationKey: string;
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
  readonly sourceAsOfDate: string | null;
  readonly confidence: string | null;
  readonly matchingEnabled: string | null;
  readonly displayEnabled: string | null;
  readonly notes: string | null;
}

export interface PersistedEnvironmentQualityRow {
  readonly destinationId: string;
  readonly destinationKey: string;
  readonly summary: string | null;
  readonly qualityNotes: string | null;
}

export interface PersistedDailyLifePracticalityRow {
  readonly destinationId: string;
  readonly destinationKey: string;
  readonly summary: string | null;
  readonly practicalityNotes: string | null;
}

function sortPositionedRows(rows: readonly PersistedPositionedRow[]): readonly PersistedPositionedRow[] {
  return [...rows].sort((left, right) => left.position - right.position);
}

// The read-port already owns DB -> normalized transformation (snake_case -> camelCase, string
// coercion, fallbacks); every PersistedXRow arriving here is already the exact runtime shape plus
// persistence-only identity/ordering metadata. Omitting just that metadata - rather than hand
// re-listing every remaining field - is what actually prevents a future approved field from
// silently disappearing here the way verified/verifiedAt and the new structured fields just did.
function omitIdentity<T extends { readonly destinationId: string; readonly destinationKey: string }>(
  row: T,
): Omit<T, "destinationId" | "destinationKey"> {
  const { destinationId, destinationKey, ...rest } = row;
  return rest;
}

function omitPositionedIdentity<T extends { readonly destinationId: string; readonly destinationKey: string; readonly position: number }>(
  row: T,
): Omit<T, "destinationId" | "destinationKey" | "position"> {
  const { destinationId, destinationKey, position, ...rest } = row;
  return rest;
}

export function normalizePersistedDestinationRows(input: {
  readonly identity: ResolvedDestinationIdentity;
  readonly root: PersistedRootRow;
  readonly profile: PersistedProfileRow;
  readonly presence: readonly PersistedPresenceRow[];
  readonly keyedChildren: PersistedKeyedChildrenRows;
  readonly replaceModules: PersistedReplaceModulesRows;
  readonly singletons: PersistedSingletonsRows;
}): NormalizedPersistedDestinationBundle {
  return {
    destinationKey: input.identity.destinationKey,
    identity: {
      slug: input.root.slug,
      name: input.root.name ?? input.profile.identityName ?? null,
      city: input.root.city,
      country: input.root.country,
    },
    editorial: {
      shortDescription: input.profile.shortDescription,
      longDescription: input.profile.longDescription,
      currency: input.profile.currency,
      primaryLanguage: input.profile.primaryLanguage,
      timeZone: input.profile.timeZone,
    },
    facts: input.keyedChildren.facts.map(omitIdentity),
    scores: input.keyedChildren.scores.map(omitIdentity),
    neighborhoods: input.keyedChildren.neighborhoods.map(omitIdentity),
    places: input.keyedChildren.places.map(omitIdentity),
    resources: input.keyedChildren.resources.map(omitIdentity),
    media: input.keyedChildren.media.map(omitIdentity),
    costOfLiving: input.replaceModules.costOfLiving.map(omitIdentity),
    climateMonthly: input.replaceModules.climateMonthly.map(omitIdentity),
    housing: input.replaceModules.housing.map(omitIdentity),
    propertyResources: input.keyedChildren.propertyResources.map(omitIdentity),
    healthcare: input.replaceModules.healthcare.map(omitIdentity),
    visaResidency: input.replaceModules.visaResidency.map(omitIdentity),
    taxesFinance: input.replaceModules.taxesFinance.map(omitIdentity),
    lgbtqInclusivity: sortPositionedRows(input.replaceModules.lgbtqInclusivity).map((row) => omitPositionedIdentity(row) as NormalizedPersistedDestinationBundle["lgbtqInclusivity"][number]),
    safetyRisks: input.replaceModules.safetyRisks.map(omitIdentity),
    transportation: input.replaceModules.transportation.map(omitIdentity),
    remoteWork: input.replaceModules.remoteWork.map(omitIdentity),
    languageIntegration: sortPositionedRows(input.replaceModules.languageIntegration).map((row) => omitPositionedIdentity(row) as NormalizedPersistedDestinationBundle["languageIntegration"][number]),
    pets: sortPositionedRows(input.replaceModules.pets).map((row) => omitPositionedIdentity(row) as NormalizedPersistedDestinationBundle["pets"][number]),
    familyEducation: sortPositionedRows(input.replaceModules.familyEducation).map((row) => omitPositionedIdentity(row) as NormalizedPersistedDestinationBundle["familyEducation"][number]),
    communitySocial: sortPositionedRows(input.replaceModules.communitySocial).map((row) => omitPositionedIdentity(row) as NormalizedPersistedDestinationBundle["communitySocial"][number]),
    accessibility: sortPositionedRows(input.replaceModules.accessibility).map((row) => omitPositionedIdentity(row) as NormalizedPersistedDestinationBundle["accessibility"][number]),
    bureaucracySetup: sortPositionedRows(input.replaceModules.bureaucracySetup).map((row) => omitPositionedIdentity(row) as NormalizedPersistedDestinationBundle["bureaucracySetup"][number]),
    workBusiness: sortPositionedRows(input.replaceModules.workBusiness).map((row) => omitPositionedIdentity(row) as NormalizedPersistedDestinationBundle["workBusiness"][number]),
    retirementAging: sortPositionedRows(input.replaceModules.retirementAging).map((row) => omitPositionedIdentity(row) as NormalizedPersistedDestinationBundle["retirementAging"][number]),
    lifestyleLaws: sortPositionedRows(input.replaceModules.lifestyleLaws).map((row) => omitPositionedIdentity(row) as NormalizedPersistedDestinationBundle["lifestyleLaws"][number]),
    realityCheck: input.replaceModules.realityCheck.map(omitIdentity),
    moveChecklist: input.keyedChildren.moveChecklist.map(omitIdentity),
    environmentQuality: input.singletons.environmentQuality.length === 0 ? null : omitIdentity(input.singletons.environmentQuality[0]),
    dailyLifePracticality: input.singletons.dailyLifePracticality.length === 0 ? null : omitIdentity(input.singletons.dailyLifePracticality[0]),
    eventsSeasonality: input.keyedChildren.eventsSeasonality.map(omitIdentity),
    sources: input.keyedChildren.sources.map(omitIdentity),
    lifestyleFeatures: (input.replaceModules.lifestyleFeatures ?? []).map(omitIdentity),
  };
}
