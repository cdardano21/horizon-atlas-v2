import type { DeterministicV31CanonicalDestination } from "../../workbook-v31-deterministic-core";
import type { CanonicalDestinationKey, StoredDestinationState } from "./types";

function asStoredNullableString(value: string | null | undefined): string | null {
  return value == null ? null : value;
}

function asStoredChild<T extends object, K extends keyof T>(value: T, key: K): T[K] {
  return value[key];
}

function asStoredKey<T extends string>(value: unknown): T {
  return (value == null ? "" : String(value)) as T;
}

function ensureUniqueChildRows<T extends Record<string, unknown>, K extends keyof T>(rows: readonly T[], keyField: K): Array<T> {
  const counts = new Map<string, number>();

  return rows.map((row, index) => {
    const candidateValue = String((row[keyField] as unknown) ?? "");
    const baseValue = candidateValue.trim() || `row-${index + 1}`;
    const occurrence = counts.get(baseValue) ?? 0;
    const nextValue = occurrence > 0 ? `${baseValue}-${occurrence + 1}` : baseValue;
    counts.set(baseValue, occurrence + 1);

    return { ...row, [keyField]: nextValue } as T;
  });
}

export function mapCanonicalDestinationToStoredState(canonicalDestination: DeterministicV31CanonicalDestination): StoredDestinationState {
  const facts = ensureUniqueChildRows(canonicalDestination.facts, "factKey");
  const scores = ensureUniqueChildRows(canonicalDestination.scores, "scoreKey");
  const neighborhoods = ensureUniqueChildRows(canonicalDestination.neighborhoods, "neighborhood_key");
  const places = ensureUniqueChildRows(canonicalDestination.places, "place_key");
  const resources = ensureUniqueChildRows(canonicalDestination.resources, "resource_key");
  const media = ensureUniqueChildRows(canonicalDestination.media, "media_key");
  const costOfLiving = ensureUniqueChildRows(canonicalDestination.costOfLiving, "record_key");
  const climateMonthly = ensureUniqueChildRows(canonicalDestination.climateMonthly, "month");
  const propertyResources = ensureUniqueChildRows(canonicalDestination.propertyResources, "resource_key");
  const safetyRisks = ensureUniqueChildRows(canonicalDestination.safetyRisks, "record_key");
  const realityCheck = ensureUniqueChildRows(canonicalDestination.realityCheck, "record_key");
  const moveChecklist = ensureUniqueChildRows(canonicalDestination.moveChecklist, "checklist_key");
  const eventsSeasonality = ensureUniqueChildRows(canonicalDestination.eventsSeasonality, "event_season_key");
  const sources = ensureUniqueChildRows(canonicalDestination.sources, "source_key");
  // Optional for backward compatibility with fixtures/tests predating LIFESTYLE_FEATURES (v3.3, additive, display-only).
  const lifestyleFeatures = ensureUniqueChildRows(canonicalDestination.lifestyleFeatures ?? [], "record_key");

  return {
    identity: {
      destinationKey: asStoredKey<CanonicalDestinationKey>(canonicalDestination.identity.destinationKey),
      slug: asStoredNullableString(canonicalDestination.identity.slug),
      name: asStoredNullableString(canonicalDestination.identity.name),
      city: asStoredNullableString(canonicalDestination.identity.city),
      country: asStoredNullableString(canonicalDestination.identity.country),
      beachAccess: asStoredNullableString(canonicalDestination.destinationRow?.beach_access),
      mountainOrSkiAccess: asStoredNullableString(canonicalDestination.destinationRow?.mountain_or_ski_access),
      countryCode: asStoredNullableString(canonicalDestination.destinationRow?.country_code),
      population: asStoredNullableString(canonicalDestination.identity.population),
      metroPopulation: asStoredNullableString(canonicalDestination.identity.metroPopulation),
      elevation: asStoredNullableString(canonicalDestination.identity.elevation),
    },
    editorial: {
      shortDescription: asStoredNullableString(canonicalDestination.editorial.shortDescription),
      longDescription: asStoredNullableString(canonicalDestination.editorial.longDescription),
      currency: asStoredNullableString(canonicalDestination.editorial.currency),
      primaryLanguage: asStoredNullableString(canonicalDestination.editorial.primaryLanguage),
      timeZone: asStoredNullableString(canonicalDestination.editorial.timeZone),
    },
    facts: facts.map((fact) => ({
      factKey: asStoredKey<StoredDestinationState["facts"][number]["factKey"]>(fact.factKey),
      factGroup: asStoredNullableString(fact.factGroup),
      valueText: asStoredNullableString(fact.valueText),
      displayLabel: asStoredNullableString(fact.displayLabel),
      sourceName: asStoredNullableString(fact.sourceName),
    })),
    scores: scores.map((score) => ({
      scoreKey: asStoredKey<StoredDestinationState["scores"][number]["scoreKey"]>(score.scoreKey),
      scoreValue: asStoredNullableString(score.scoreValue),
      scoreLabel: asStoredNullableString(score.scoreLabel),
      methodologyVersion: asStoredNullableString(score.methodologyVersion),
      verified: asStoredNullableString(score.verified),
      verifiedAt: asStoredNullableString(score.verified_at),
    })),
    neighborhoods: neighborhoods.map((neighborhood) => ({
      neighborhoodKey: asStoredKey<StoredDestinationState["neighborhoods"][number]["neighborhoodKey"]>(asStoredChild(neighborhood, "neighborhood_key")),
      name: asStoredNullableString(neighborhood.neighborhood_name),
      summary: asStoredNullableString(neighborhood.summary),
      areaType: asStoredNullableString(neighborhood.area_type),
      bestFor: asStoredNullableString(neighborhood.best_for),
      walkabilityRating: asStoredNullableString(neighborhood.walkability_rating),
      safetyRating: asStoredNullableString(neighborhood.safety_rating),
      transitRating: asStoredNullableString(neighborhood.transit_rating),
      housingCharacter: asStoredNullableString(neighborhood.housing_character),
      pros: asStoredNullableString(neighborhood.pros),
      cons: asStoredNullableString(neighborhood.cons),
      googleMapsUrl: asStoredNullableString(neighborhood.google_maps_url),
    })),
    places: places.map((place) => ({
      placeKey: asStoredKey<StoredDestinationState["places"][number]["placeKey"]>(asStoredChild(place, "place_key")),
      category: asStoredNullableString(place.category_key),
      name: asStoredNullableString(place.place_name),
      description: asStoredNullableString(place.description),
      neighborhoodKey: asStoredNullableString(place.neighborhood_key),
      websiteUrl: asStoredNullableString(place.website_url),
      googleMapsUrl: asStoredNullableString(place.google_maps_url),
      sourceUrl: asStoredNullableString(place.source_url),
      address: asStoredNullableString(place.address),
      phone: asStoredNullableString(place.phone),
      displayOrder: asStoredNullableString(place.display_order),
    })),
    resources: resources.map((resource) => ({
      resourceKey: asStoredKey<StoredDestinationState["resources"][number]["resourceKey"]>(asStoredChild(resource, "resource_key")),
      category: asStoredNullableString(resource.resource_category),
      name: asStoredNullableString(resource.resource_name),
      url: asStoredNullableString(resource.url),
      description: asStoredNullableString(resource.description),
      official: asStoredNullableString(resource.official),
      stayModeKey: asStoredNullableString(resource.stay_mode_key),
      sourceName: asStoredNullableString(resource.source_name),
      sourceUrl: asStoredNullableString(resource.source_url),
      verified: asStoredNullableString(resource.verified),
      verifiedAt: asStoredNullableString(resource.verified_at),
    })),
    media: media.map((media) => ({
      mediaKey: asStoredKey<StoredDestinationState["media"][number]["mediaKey"]>(asStoredChild(media, "media_key")),
      kind: asStoredNullableString(media.media_type),
      url: asStoredNullableString(media.image_url),
      caption: asStoredNullableString(media.caption),
      altText: asStoredNullableString(media.subject),
      sourceName: asStoredNullableString(media.source_name),
      sourceUrl: asStoredNullableString(media.source_url),
      licenseNotes: asStoredNullableString(media.license_notes),
    })),
    costOfLiving: costOfLiving.map((item) => ({
      itemKey: asStoredKey<StoredDestinationState["costOfLiving"][number]["itemKey"]>(asStoredChild(item, "record_key")),
      category: asStoredNullableString(item.category),
      monthlyLow: asStoredNullableString(item.monthly_low),
      monthlyHigh: asStoredNullableString(item.monthly_high),
      currency: asStoredNullableString(item.currency),
      householdType: asStoredNullableString(item.household_type),
      lifestyleTier: asStoredNullableString(item.lifestyle_tier),
      stayModeKey: asStoredNullableString(item.stay_mode_key),
      verified: asStoredNullableString(item.verified),
      verifiedAt: asStoredNullableString(item.verified_at),
    })),
    climateMonthly: climateMonthly.map((month) => ({
      monthKey: asStoredKey<StoredDestinationState["climateMonthly"][number]["monthKey"]>(asStoredChild(month, "month")),
      avgHighTemp: asStoredNullableString(month.avg_high_c),
      avgLowTemp: asStoredNullableString(month.avg_low_c),
      precipitationMm: asStoredNullableString(month.rainfall_mm),
      humidityPct: asStoredNullableString(month.humidity_pct),
    })),
    housing: canonicalDestination.housing.map((state) => ({
      summary: asStoredNullableString(state.restrictions_summary),
      buyingSummary: asStoredNullableString(state.buying_process_summary),
      rentalSummary: asStoredNullableString(state.rental_rules_notes),
      stayModeKey: asStoredNullableString(state.stay_mode_key),
      canForeignersBuy: asStoredNullableString(state.can_foreigners_buy),
      residencyRequiredToBuy: asStoredNullableString(state.residency_required_to_buy),
      verified: asStoredNullableString(state.verified),
      verifiedAt: asStoredNullableString(state.verified_at),
    })),
    propertyResources: propertyResources.map((resource) => ({
      itemKey: asStoredKey<StoredDestinationState["propertyResources"][number]["itemKey"]>(asStoredChild(resource, "resource_key")),
      category: asStoredNullableString(resource.resource_type),
      name: asStoredNullableString(resource.resource_name),
      url: asStoredNullableString(resource.url),
      description: asStoredNullableString(resource.description),
      official: asStoredNullableString(resource.official),
      sourceUrl: asStoredNullableString(resource.source_url),
      verified: asStoredNullableString(resource.verified),
      verifiedAt: asStoredNullableString(resource.verified_at),
    })),
    healthcare: canonicalDestination.healthcare.map((state) => ({
      summary: asStoredNullableString(state.system_summary),
      publicAccessSummary: asStoredNullableString(state.public_access_foreigners),
      insuranceSummary: asStoredNullableString(state.international_insurance_notes),
      privateCareAvailable: asStoredNullableString(state.private_care_available),
      topic: asStoredNullableString(state.topic),
      englishSpeakingCare: asStoredNullableString(state.english_speaking_care),
      typicalGpVisitCost: asStoredNullableString(state.typical_gp_visit_cost),
      typicalSpecialistCost: asStoredNullableString(state.typical_specialist_cost),
      verified: asStoredNullableString(state.verified),
      verifiedAt: asStoredNullableString(state.verified_at),
    })),
    visaResidency: canonicalDestination.visaResidency.map((state) => ({
      // "summary" must be real prose shown to customers - visa_type is a controlled categorical
      // token (e.g. "STATUS_DEPENDENT") and must never be used here; residency_option is the real
      // human-written explanation sentence for the same row.
      summary: asStoredNullableString(state.residency_option),
      residencyPath: asStoredNullableString(state.permanent_residency_path),
      citizenshipPath: asStoredNullableString(state.citizenship_path),
      stayModeKey: asStoredNullableString(state.stay_mode_key),
      travelerNationality: asStoredNullableString(state.traveler_nationality),
      verified: asStoredNullableString(state.verified),
      verifiedAt: asStoredNullableString(state.verified_at),
    })),
    taxesFinance: canonicalDestination.taxesFinance.map((state) => ({
      summary: asStoredNullableString(state.summary),
      notes: asStoredNullableString(state.income_tax_notes),
      verified: asStoredNullableString(state.verified),
      verifiedAt: asStoredNullableString(state.verified_at),
    })),
    lgbtqInclusivity: canonicalDestination.lgbtqInclusivity.map((state) => ({
      summary: asStoredNullableString(state.evidence_summary),
      culturalNotes: asStoredNullableString(state.community_scene),
      overallRating: asStoredNullableString(state.overall_rating),
      legalProtections: asStoredNullableString(state.legal_protections),
      socialAcceptance: asStoredNullableString(state.social_acceptance),
      prideEvents: asStoredNullableString(state.pride_events),
      nightlifeSocial: asStoredNullableString(state.nightlife_social),
      healthcareAccess: asStoredNullableString(state.healthcare_access),
      areasResources: asStoredNullableString(state.areas_resources),
      safetyConsiderations: asStoredNullableString(state.safety_considerations),
      verified: asStoredNullableString(state.verified),
      verifiedAt: asStoredNullableString(state.verified_at),
    })),
    safetyRisks: safetyRisks.map((risk) => ({
      itemKey: asStoredKey<StoredDestinationState["safetyRisks"][number]["itemKey"]>(asStoredChild(risk, "record_key")),
      topic: asStoredNullableString(risk.risk_type),
      severity: asStoredNullableString(risk.severity),
      summary: asStoredNullableString(risk.summary),
      verified: asStoredNullableString(risk.verified),
      verifiedAt: asStoredNullableString(risk.verified_at),
    })),
    transportation: canonicalDestination.transportation.map((state) => ({
      summary: asStoredNullableString(state.summary),
      airportSummary: asStoredNullableString(state.name),
      transitSummary: asStoredNullableString(state.public_transit_available),
      topic: asStoredNullableString(state.topic),
      distanceKm: asStoredNullableString(state.distance_km),
      typicalDriveMinutes: asStoredNullableString(state.typical_drive_minutes),
      nonstopUsService: asStoredNullableString(state.nonstop_us_service),
      carNeededRating: asStoredNullableString(state.car_needed_rating),
      parkingNotes: asStoredNullableString(state.parking_notes),
      rideshareNotes: asStoredNullableString(state.rideshare_notes),
      verified: asStoredNullableString(state.verified),
      verifiedAt: asStoredNullableString(state.verified_at),
    })),
    remoteWork: canonicalDestination.remoteWork.map((state) => ({
      summary: asStoredNullableString(state.remote_work_notes),
      internetSummary: asStoredNullableString(state.avg_download_mbps),
      timezoneSummary: asStoredNullableString(state.us_time_zone_fit),
      fiberAvailable: asStoredNullableString(state.fiber_available),
      mobile5g: asStoredNullableString(state.mobile_5g),
      utilityReliability: asStoredNullableString(state.utility_reliability),
      coworkingSummary: asStoredNullableString(state.coworking_summary),
      verified: asStoredNullableString(state.verified),
      verifiedAt: asStoredNullableString(state.verified_at),
    })),
    languageIntegration: canonicalDestination.languageIntegration.map((state) => ({
      summary: asStoredNullableString(state.integration_notes),
      englishSupport: asStoredNullableString(state.can_function_in_english),
      primaryLanguage: asStoredNullableString(state.primary_language),
      englishProficiency: asStoredNullableString(state.english_proficiency),
      governmentEnglishAccess: asStoredNullableString(state.government_english_access),
      medicalEnglishAccess: asStoredNullableString(state.medical_english_access),
      languageResources: asStoredNullableString(state.language_resources),
      verified: asStoredNullableString(state.verified),
      verifiedAt: asStoredNullableString(state.verified_at),
    })),
    pets: canonicalDestination.pets.map((state) => ({
      summary: asStoredNullableString(state.pet_friendly_rentals),
      petFriendlyNotes: asStoredNullableString(state.dog_parks_summary),
    })),
    familyEducation: canonicalDestination.familyEducation.map((state) => ({
      summary: asStoredNullableString(state.summary),
      schoolsSummary: asStoredNullableString(state.universities),
    })),
    communitySocial: canonicalDestination.communitySocial.map((state) => ({
      summary: asStoredNullableString(state.summary),
      socialNotes: asStoredNullableString(state.clubs_groups),
      expatPresence: asStoredNullableString(state.expat_presence),
      volunteering: asStoredNullableString(state.volunteering),
      easeMeetingPeople: asStoredNullableString(state.ease_meeting_people),
      ageMix: asStoredNullableString(state.age_mix),
      transientVsRooted: asStoredNullableString(state.transient_vs_rooted),
      verified: asStoredNullableString(state.verified),
      verifiedAt: asStoredNullableString(state.verified_at),
    })),
    accessibility: canonicalDestination.accessibility.map((state) => ({
      summary: asStoredNullableString(state.mobility_notes),
      mobilityNotes: asStoredNullableString(state.wheelchair_access),
    })),
    bureaucracySetup: canonicalDestination.bureaucracySetup.map((state) => ({
      summary: asStoredNullableString(state.summary),
      setupNotes: asStoredNullableString(state.typical_documents),
    })),
    workBusiness: canonicalDestination.workBusiness.map((state) => ({
      summary: asStoredNullableString(state.employment_notes),
      remoteWorkNotes: asStoredNullableString(state.remote_work_suitability),
    })),
    retirementAging: canonicalDestination.retirementAging.map((state) => ({
      summary: asStoredNullableString(state.retirement_notes),
      agingNotes: asStoredNullableString(state.assisted_living),
    })),
    lifestyleLaws: canonicalDestination.lifestyleLaws.map((state) => ({
      summary: asStoredNullableString(state.summary),
      legalNotes: asStoredNullableString(state.important_rules),
    })),
    realityCheck: realityCheck.map((entry) => ({
      itemKey: asStoredKey<StoredDestinationState["realityCheck"][number]["itemKey"]>(asStoredChild(entry, "record_key")),
      title: asStoredNullableString(entry.title),
      detail: asStoredNullableString(entry.detail),
      severity: asStoredNullableString(entry.severity),
    })),
    moveChecklist: moveChecklist.map((state) => ({
      checklistKey: asStoredKey<StoredDestinationState["moveChecklist"][number]["checklistKey"]>(asStoredChild(state, "checklist_key")),
      summary: asStoredNullableString(state.task),
      checklistNotes: asStoredNullableString(state.description),
    })),
    environmentQuality: canonicalDestination.environmentQuality ? {
      summary: asStoredNullableString(canonicalDestination.environmentQuality.air_quality_summary),
      qualityNotes: asStoredNullableString(canonicalDestination.environmentQuality.water_quality_summary),
    } : null,
    dailyLifePracticality: canonicalDestination.dailyLifePracticality ? {
      summary: asStoredNullableString(canonicalDestination.dailyLifePracticality.grocery_access),
      practicalityNotes: asStoredNullableString(canonicalDestination.dailyLifePracticality.things_residents_wish_they_knew),
    } : null,
    eventsSeasonality: eventsSeasonality.map((state) => ({
      eventSeasonalityKey: asStoredKey<StoredDestinationState["eventsSeasonality"][number]["eventSeasonalityKey"]>(asStoredChild(state, "event_season_key")),
      summary: asStoredNullableString(state.description),
      seasonalityNotes: asStoredNullableString(state.weather_context),
    })),
    sources: sources.map((source) => ({
      sourceKey: asStoredKey<StoredDestinationState["sources"][number]["sourceKey"]>(asStoredChild(source, "source_key")),
      name: asStoredNullableString(source.source_name),
      url: asStoredNullableString(source.source_url),
      type: asStoredNullableString(source.source_type),
    })),
    lifestyleFeatures: lifestyleFeatures.map((feature) => ({
      recordKey: asStoredKey<StoredDestinationState["lifestyleFeatures"][number]["recordKey"]>(asStoredChild(feature, "record_key")),
      featureGroup: asStoredNullableString(feature.feature_group),
      featureKey: asStoredNullableString(feature.feature_key),
      featureValue: asStoredNullableString(feature.feature_value),
      availabilityLevel: asStoredNullableString(feature.availability_level),
      proximityBand: asStoredNullableString(feature.proximity_band),
      // Simpler LIFESTYLE_FEATURES schema variant uses "display_name" instead of "display_label".
      displayLabel: asStoredNullableString(feature.display_label) ?? asStoredNullableString(feature.display_name ?? null),
      evidenceSummary: asStoredNullableString(feature.evidence_summary),
      sourceName: asStoredNullableString(feature.source_name),
      sourceUrl: asStoredNullableString(feature.source_url),
      sourceAsOfDate: asStoredNullableString(feature.source_as_of_date),
      confidence: asStoredNullableString(feature.confidence),
      matchingEnabled: asStoredNullableString(feature.matching_enabled),
      displayEnabled: asStoredNullableString(feature.display_enabled),
      notes: asStoredNullableString(feature.notes),
    })),
  };
}

