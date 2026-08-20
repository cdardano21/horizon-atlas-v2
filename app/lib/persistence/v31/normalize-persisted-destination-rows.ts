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
    facts: input.keyedChildren.facts.map((fact) => ({ factKey: fact.factKey, factGroup: fact.factGroup, valueText: fact.valueText, displayLabel: fact.displayLabel, sourceName: fact.sourceName })),
    scores: input.keyedChildren.scores.map((score) => ({ scoreKey: score.scoreKey, scoreValue: score.scoreValue, scoreLabel: score.scoreLabel, methodologyVersion: score.methodologyVersion })),
    neighborhoods: input.keyedChildren.neighborhoods.map((row) => ({ neighborhoodKey: row.neighborhoodKey, name: row.name, summary: row.summary, areaType: row.areaType })),
    places: input.keyedChildren.places.map((row) => ({
      placeKey: row.placeKey,
      category: row.category,
      name: row.name,
      description: row.description,
      neighborhoodKey: row.neighborhoodKey,
      websiteUrl: row.websiteUrl,
      googleMapsUrl: row.googleMapsUrl,
      sourceUrl: row.sourceUrl,
      address: row.address,
      phone: row.phone,
      displayOrder: row.displayOrder,
    })),
    resources: input.keyedChildren.resources.map((row) => ({ resourceKey: row.resourceKey, category: row.category, name: row.name, url: row.url })),
    media: input.keyedChildren.media.map((row) => ({ mediaKey: row.mediaKey, kind: row.kind, url: row.url, caption: row.caption, altText: row.altText })),
    costOfLiving: input.replaceModules.costOfLiving.map((row) => ({ itemKey: row.itemKey, category: row.category, monthlyLow: row.monthlyLow, monthlyHigh: row.monthlyHigh, currency: row.currency })),
    climateMonthly: input.replaceModules.climateMonthly.map((row) => ({ monthKey: row.monthKey, avgHighTemp: row.avgHighTemp, avgLowTemp: row.avgLowTemp, precipitationMm: row.precipitationMm, humidityPct: row.humidityPct })),
    housing: input.replaceModules.housing.map((row) => ({ summary: row.summary, buyingSummary: row.buyingSummary, rentalSummary: row.rentalSummary })),
    propertyResources: input.keyedChildren.propertyResources.map((row) => ({ itemKey: row.itemKey, category: row.category, name: row.name, url: row.url })),
    healthcare: input.replaceModules.healthcare.map((row) => ({ summary: row.summary, publicAccessSummary: row.publicAccessSummary, insuranceSummary: row.insuranceSummary })),
    visaResidency: input.replaceModules.visaResidency.map((row) => ({ summary: row.summary, residencyPath: row.residencyPath, citizenshipPath: row.citizenshipPath })),
    taxesFinance: input.replaceModules.taxesFinance.map((row) => ({ summary: row.summary, notes: row.notes })),
    lgbtqInclusivity: sortPositionedRows(input.replaceModules.lgbtqInclusivity).map((row) => ({ summary: row.summary, culturalNotes: (row as { readonly culturalNotes?: string | null }).culturalNotes ?? null })),
    safetyRisks: input.replaceModules.safetyRisks.map((row) => ({ itemKey: row.itemKey, topic: row.topic, severity: row.severity, summary: row.summary })),
    transportation: input.replaceModules.transportation.map((row) => ({ summary: row.summary, airportSummary: row.airportSummary, transitSummary: row.transitSummary })),
    remoteWork: input.replaceModules.remoteWork.map((row) => ({ summary: row.summary, internetSummary: row.internetSummary, timezoneSummary: row.timezoneSummary })),
    languageIntegration: sortPositionedRows(input.replaceModules.languageIntegration).map((row) => ({ summary: row.summary, englishSupport: (row as { readonly englishSupport?: string | null }).englishSupport ?? null })),
    pets: sortPositionedRows(input.replaceModules.pets).map((row) => ({ summary: row.summary, petFriendlyNotes: (row as { readonly petFriendlyNotes?: string | null }).petFriendlyNotes ?? null })),
    familyEducation: sortPositionedRows(input.replaceModules.familyEducation).map((row) => ({ summary: row.summary, schoolsSummary: (row as { readonly schoolsSummary?: string | null }).schoolsSummary ?? null })),
    communitySocial: sortPositionedRows(input.replaceModules.communitySocial).map((row) => ({ summary: row.summary, socialNotes: (row as { readonly socialNotes?: string | null }).socialNotes ?? null })),
    accessibility: sortPositionedRows(input.replaceModules.accessibility).map((row) => ({ summary: row.summary, mobilityNotes: (row as { readonly mobilityNotes?: string | null }).mobilityNotes ?? null })),
    bureaucracySetup: sortPositionedRows(input.replaceModules.bureaucracySetup).map((row) => ({ summary: row.summary, setupNotes: (row as { readonly setupNotes?: string | null }).setupNotes ?? null })),
    workBusiness: sortPositionedRows(input.replaceModules.workBusiness).map((row) => ({ summary: row.summary, remoteWorkNotes: (row as { readonly remoteWorkNotes?: string | null }).remoteWorkNotes ?? null })),
    retirementAging: sortPositionedRows(input.replaceModules.retirementAging).map((row) => ({ summary: row.summary, agingNotes: (row as { readonly agingNotes?: string | null }).agingNotes ?? null })),
    lifestyleLaws: sortPositionedRows(input.replaceModules.lifestyleLaws).map((row) => ({ summary: row.summary, legalNotes: (row as { readonly legalNotes?: string | null }).legalNotes ?? null })),
    realityCheck: input.replaceModules.realityCheck.map((row) => ({ itemKey: row.itemKey, title: row.title, detail: row.detail, severity: row.severity })),
    moveChecklist: input.keyedChildren.moveChecklist.map((row) => ({ checklistKey: row.checklistKey, summary: row.summary, checklistNotes: row.checklistNotes })),
    environmentQuality: input.singletons.environmentQuality.length === 0 ? null : { summary: input.singletons.environmentQuality[0].summary, qualityNotes: input.singletons.environmentQuality[0].qualityNotes },
    dailyLifePracticality: input.singletons.dailyLifePracticality.length === 0 ? null : { summary: input.singletons.dailyLifePracticality[0].summary, practicalityNotes: input.singletons.dailyLifePracticality[0].practicalityNotes },
    eventsSeasonality: input.keyedChildren.eventsSeasonality.map((row) => ({ eventSeasonalityKey: row.eventSeasonalityKey, summary: row.summary, seasonalityNotes: row.seasonalityNotes })),
    sources: input.keyedChildren.sources.map((row) => ({ sourceKey: row.sourceKey, name: row.name, url: row.url, type: row.type })),
  };
}
