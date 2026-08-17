import type { CanonicalDestinationKey, StoredDestinationState } from "./types";

export interface NormalizedPersistedDestinationBundle {
  readonly destinationKey: CanonicalDestinationKey;
  readonly identity: {
    readonly slug: string | null;
    readonly name: string | null;
    readonly city: string | null;
    readonly country: string | null;
  };
  readonly editorial: {
    readonly shortDescription: string | null;
    readonly longDescription: string | null;
    readonly currency: string | null;
    readonly primaryLanguage: string | null;
    readonly timeZone: string | null;
  };
  readonly facts: ReadonlyArray<{
    readonly factKey: string;
    readonly factGroup: string | null;
    readonly valueText: string | null;
    readonly displayLabel: string | null;
    readonly sourceName: string | null;
  }>;
  readonly scores: ReadonlyArray<{
    readonly scoreKey: string;
    readonly scoreValue: string | null;
    readonly scoreLabel: string | null;
    readonly methodologyVersion: string | null;
  }>;
  readonly neighborhoods: ReadonlyArray<{
    readonly neighborhoodKey: string;
    readonly name: string | null;
    readonly summary: string | null;
    readonly areaType: string | null;
  }>;
  readonly places: ReadonlyArray<{
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
  }>;
  readonly resources: ReadonlyArray<{
    readonly resourceKey: string;
    readonly category: string | null;
    readonly name: string | null;
    readonly url: string | null;
  }>;
  readonly media: ReadonlyArray<{
    readonly mediaKey: string;
    readonly kind: string | null;
    readonly url: string | null;
    readonly caption: string | null;
    readonly altText: string | null;
  }>;
  readonly costOfLiving: ReadonlyArray<{
    readonly itemKey: string;
    readonly category: string | null;
    readonly monthlyLow: string | null;
    readonly monthlyHigh: string | null;
    readonly currency: string | null;
  }>;
  readonly climateMonthly: ReadonlyArray<{
    readonly monthKey: string;
    readonly avgHighTemp: string | null;
    readonly avgLowTemp: string | null;
    readonly precipitationMm: string | null;
    readonly humidityPct: string | null;
  }>;
  readonly housing: ReadonlyArray<{
    readonly summary: string | null;
    readonly buyingSummary: string | null;
    readonly rentalSummary: string | null;
  }>;
  readonly propertyResources: ReadonlyArray<{
    readonly itemKey: string;
    readonly category: string | null;
    readonly name: string | null;
    readonly url: string | null;
  }>;
  readonly healthcare: ReadonlyArray<{
    readonly summary: string | null;
    readonly publicAccessSummary: string | null;
    readonly insuranceSummary: string | null;
  }>;
  readonly visaResidency: ReadonlyArray<{
    readonly summary: string | null;
    readonly residencyPath: string | null;
    readonly citizenshipPath: string | null;
  }>;
  readonly taxesFinance: ReadonlyArray<{
    readonly summary: string | null;
    readonly notes: string | null;
  }>;
  readonly lgbtqInclusivity: ReadonlyArray<{
    readonly summary: string | null;
    readonly culturalNotes: string | null;
  }>;
  readonly safetyRisks: ReadonlyArray<{
    readonly itemKey: string;
    readonly topic: string | null;
    readonly severity: string | null;
    readonly summary: string | null;
  }>;
  readonly transportation: ReadonlyArray<{
    readonly summary: string | null;
    readonly airportSummary: string | null;
    readonly transitSummary: string | null;
  }>;
  readonly remoteWork: ReadonlyArray<{
    readonly summary: string | null;
    readonly internetSummary: string | null;
    readonly timezoneSummary: string | null;
  }>;
  readonly languageIntegration: ReadonlyArray<{
    readonly summary: string | null;
    readonly englishSupport: string | null;
  }>;
  readonly pets: ReadonlyArray<{
    readonly summary: string | null;
    readonly petFriendlyNotes: string | null;
  }>;
  readonly familyEducation: ReadonlyArray<{
    readonly summary: string | null;
    readonly schoolsSummary: string | null;
  }>;
  readonly communitySocial: ReadonlyArray<{
    readonly summary: string | null;
    readonly socialNotes: string | null;
  }>;
  readonly accessibility: ReadonlyArray<{
    readonly summary: string | null;
    readonly mobilityNotes: string | null;
  }>;
  readonly bureaucracySetup: ReadonlyArray<{
    readonly summary: string | null;
    readonly setupNotes: string | null;
  }>;
  readonly workBusiness: ReadonlyArray<{
    readonly summary: string | null;
    readonly remoteWorkNotes: string | null;
  }>;
  readonly retirementAging: ReadonlyArray<{
    readonly summary: string | null;
    readonly agingNotes: string | null;
  }>;
  readonly lifestyleLaws: ReadonlyArray<{
    readonly summary: string | null;
    readonly legalNotes: string | null;
  }>;
  readonly realityCheck: ReadonlyArray<{
    readonly itemKey: string;
    readonly title: string | null;
    readonly detail: string | null;
    readonly severity: string | null;
  }>;
  readonly moveChecklist: ReadonlyArray<{
    readonly checklistKey: string;
    readonly summary: string | null;
    readonly checklistNotes: string | null;
  }>;
  readonly environmentQuality: {
    readonly summary: string | null;
    readonly qualityNotes: string | null;
  } | null;
  readonly dailyLifePracticality: {
    readonly summary: string | null;
    readonly practicalityNotes: string | null;
  } | null;
  readonly eventsSeasonality: ReadonlyArray<{
    readonly eventSeasonalityKey: string;
    readonly summary: string | null;
    readonly seasonalityNotes: string | null;
  }>;
  readonly sources: ReadonlyArray<{
    readonly sourceKey: string;
    readonly name: string | null;
    readonly url: string | null;
    readonly type: string | null;
  }>;
}

function asNullableString(value: string | null): string | null {
  return value;
}

export function materializeStoredDestinationStateFromNormalizedPersistedBundle(bundle: NormalizedPersistedDestinationBundle): StoredDestinationState {
  return {
    identity: {
      destinationKey: bundle.destinationKey,
      slug: asNullableString(bundle.identity.slug),
      name: asNullableString(bundle.identity.name),
      city: asNullableString(bundle.identity.city),
      country: asNullableString(bundle.identity.country),
    },
    editorial: {
      shortDescription: asNullableString(bundle.editorial.shortDescription),
      longDescription: asNullableString(bundle.editorial.longDescription),
      currency: asNullableString(bundle.editorial.currency),
      primaryLanguage: asNullableString(bundle.editorial.primaryLanguage),
      timeZone: asNullableString(bundle.editorial.timeZone),
    },
    facts: bundle.facts.map((fact) => ({
      factKey: fact.factKey as StoredDestinationState["facts"][number]["factKey"],
      factGroup: asNullableString(fact.factGroup),
      valueText: asNullableString(fact.valueText),
      displayLabel: asNullableString(fact.displayLabel),
      sourceName: asNullableString(fact.sourceName),
    })),
    scores: bundle.scores.map((score) => ({
      scoreKey: score.scoreKey as StoredDestinationState["scores"][number]["scoreKey"],
      scoreValue: asNullableString(score.scoreValue),
      scoreLabel: asNullableString(score.scoreLabel),
      methodologyVersion: asNullableString(score.methodologyVersion),
    })),
    neighborhoods: bundle.neighborhoods.map((neighborhood) => ({
      neighborhoodKey: neighborhood.neighborhoodKey as StoredDestinationState["neighborhoods"][number]["neighborhoodKey"],
      name: asNullableString(neighborhood.name),
      summary: asNullableString(neighborhood.summary),
      areaType: asNullableString(neighborhood.areaType),
    })),
    places: bundle.places.map((place) => ({
      placeKey: place.placeKey as StoredDestinationState["places"][number]["placeKey"],
      category: asNullableString(place.category),
      name: asNullableString(place.name),
      description: asNullableString(place.description),
      neighborhoodKey: asNullableString(place.neighborhoodKey),
      websiteUrl: asNullableString(place.websiteUrl),
      googleMapsUrl: asNullableString(place.googleMapsUrl),
      sourceUrl: asNullableString(place.sourceUrl),
      address: asNullableString(place.address),
      phone: asNullableString(place.phone),
      displayOrder: asNullableString(place.displayOrder),
    })),
    resources: bundle.resources.map((resource) => ({
      resourceKey: resource.resourceKey as StoredDestinationState["resources"][number]["resourceKey"],
      category: asNullableString(resource.category),
      name: asNullableString(resource.name),
      url: asNullableString(resource.url),
    })),
    media: bundle.media.map((media) => ({
      mediaKey: media.mediaKey as StoredDestinationState["media"][number]["mediaKey"],
      kind: asNullableString(media.kind),
      url: asNullableString(media.url),
      caption: asNullableString(media.caption),
      altText: asNullableString(media.altText),
    })),
    costOfLiving: bundle.costOfLiving.map((item) => ({
      itemKey: item.itemKey as StoredDestinationState["costOfLiving"][number]["itemKey"],
      category: asNullableString(item.category),
      monthlyLow: asNullableString(item.monthlyLow),
      monthlyHigh: asNullableString(item.monthlyHigh),
      currency: asNullableString(item.currency),
    })),
    climateMonthly: bundle.climateMonthly.map((month) => ({
      monthKey: month.monthKey as StoredDestinationState["climateMonthly"][number]["monthKey"],
      avgHighTemp: asNullableString(month.avgHighTemp),
      avgLowTemp: asNullableString(month.avgLowTemp),
      precipitationMm: asNullableString(month.precipitationMm),
      humidityPct: asNullableString(month.humidityPct),
    })),
    housing: bundle.housing.map((state) => ({
      summary: asNullableString(state.summary),
      buyingSummary: asNullableString(state.buyingSummary),
      rentalSummary: asNullableString(state.rentalSummary),
    })),
    propertyResources: bundle.propertyResources.map((resource) => ({
      itemKey: resource.itemKey as StoredDestinationState["propertyResources"][number]["itemKey"],
      category: asNullableString(resource.category),
      name: asNullableString(resource.name),
      url: asNullableString(resource.url),
    })),
    healthcare: bundle.healthcare.map((state) => ({
      summary: asNullableString(state.summary),
      publicAccessSummary: asNullableString(state.publicAccessSummary),
      insuranceSummary: asNullableString(state.insuranceSummary),
    })),
    visaResidency: bundle.visaResidency.map((state) => ({
      summary: asNullableString(state.summary),
      residencyPath: asNullableString(state.residencyPath),
      citizenshipPath: asNullableString(state.citizenshipPath),
    })),
    taxesFinance: bundle.taxesFinance.map((state) => ({
      summary: asNullableString(state.summary),
      notes: asNullableString(state.notes),
    })),
    lgbtqInclusivity: bundle.lgbtqInclusivity.map((state) => ({
      summary: asNullableString(state.summary),
      culturalNotes: asNullableString(state.culturalNotes),
    })),
    safetyRisks: bundle.safetyRisks.map((risk) => ({
      itemKey: risk.itemKey as StoredDestinationState["safetyRisks"][number]["itemKey"],
      topic: asNullableString(risk.topic),
      severity: asNullableString(risk.severity),
      summary: asNullableString(risk.summary),
    })),
    transportation: bundle.transportation.map((state) => ({
      summary: asNullableString(state.summary),
      airportSummary: asNullableString(state.airportSummary),
      transitSummary: asNullableString(state.transitSummary),
    })),
    remoteWork: bundle.remoteWork.map((state) => ({
      summary: asNullableString(state.summary),
      internetSummary: asNullableString(state.internetSummary),
      timezoneSummary: asNullableString(state.timezoneSummary),
    })),
    languageIntegration: bundle.languageIntegration.map((state) => ({
      summary: asNullableString(state.summary),
      englishSupport: asNullableString(state.englishSupport),
    })),
    pets: bundle.pets.map((state) => ({
      summary: asNullableString(state.summary),
      petFriendlyNotes: asNullableString(state.petFriendlyNotes),
    })),
    familyEducation: bundle.familyEducation.map((state) => ({
      summary: asNullableString(state.summary),
      schoolsSummary: asNullableString(state.schoolsSummary),
    })),
    communitySocial: bundle.communitySocial.map((state) => ({
      summary: asNullableString(state.summary),
      socialNotes: asNullableString(state.socialNotes),
    })),
    accessibility: bundle.accessibility.map((state) => ({
      summary: asNullableString(state.summary),
      mobilityNotes: asNullableString(state.mobilityNotes),
    })),
    bureaucracySetup: bundle.bureaucracySetup.map((state) => ({
      summary: asNullableString(state.summary),
      setupNotes: asNullableString(state.setupNotes),
    })),
    workBusiness: bundle.workBusiness.map((state) => ({
      summary: asNullableString(state.summary),
      remoteWorkNotes: asNullableString(state.remoteWorkNotes),
    })),
    retirementAging: bundle.retirementAging.map((state) => ({
      summary: asNullableString(state.summary),
      agingNotes: asNullableString(state.agingNotes),
    })),
    lifestyleLaws: bundle.lifestyleLaws.map((state) => ({
      summary: asNullableString(state.summary),
      legalNotes: asNullableString(state.legalNotes),
    })),
    realityCheck: bundle.realityCheck.map((entry) => ({
      itemKey: entry.itemKey as StoredDestinationState["realityCheck"][number]["itemKey"],
      title: asNullableString(entry.title),
      detail: asNullableString(entry.detail),
      severity: asNullableString(entry.severity),
    })),
    moveChecklist: bundle.moveChecklist.map((state) => ({
      checklistKey: state.checklistKey as StoredDestinationState["moveChecklist"][number]["checklistKey"],
      summary: asNullableString(state.summary),
      checklistNotes: asNullableString(state.checklistNotes),
    })),
    environmentQuality: bundle.environmentQuality == null ? null : {
      summary: asNullableString(bundle.environmentQuality.summary),
      qualityNotes: asNullableString(bundle.environmentQuality.qualityNotes),
    },
    dailyLifePracticality: bundle.dailyLifePracticality == null ? null : {
      summary: asNullableString(bundle.dailyLifePracticality.summary),
      practicalityNotes: asNullableString(bundle.dailyLifePracticality.practicalityNotes),
    },
    eventsSeasonality: bundle.eventsSeasonality.map((state) => ({
      eventSeasonalityKey: state.eventSeasonalityKey as StoredDestinationState["eventsSeasonality"][number]["eventSeasonalityKey"],
      summary: asNullableString(state.summary),
      seasonalityNotes: asNullableString(state.seasonalityNotes),
    })),
    sources: bundle.sources.map((source) => ({
      sourceKey: source.sourceKey as StoredDestinationState["sources"][number]["sourceKey"],
      name: asNullableString(source.name),
      url: asNullableString(source.url),
      type: asNullableString(source.type),
    })),
  };
}
