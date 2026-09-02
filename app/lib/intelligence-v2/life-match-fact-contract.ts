export type TriState = "YES" | "NO" | "UNKNOWN";
export type EvidenceStatus =
  | "VERIFIED_PRIMARY"
  | "VERIFIED_SECONDARY"
  | "UNVERIFIED_ESTIMATE"
  | "RESEARCH_PENDING"
  | "NOT_APPLICABLE";

export type SourceAuthority =
  | "OFFICIAL_IMMIGRATION"
  | "OFFICIAL_GOVERNMENT"
  | "OFFICIAL_TAX_AUTHORITY"
  | "OFFICIAL_HEALTH_SYSTEM"
  | "REPUTABLE_SECONDARY"
  | "UNVERIFIED";

export type Confidence = "HIGH" | "MEDIUM" | "LOW";
export type ActivityModeGroup =
  | "TOURIST"
  | "REMOTE_WORK"
  | "LOCAL_EMPLOYMENT"
  | "SELF_EMPLOYMENT"
  | "RETIREMENT"
  | "SECOND_HOME"
  | "SPLIT_YEAR";

export type CountryJurisdictionFactValue =
  | TriState
  | "NOT_APPLICABLE"
  | number
  | null;

export interface LifeMatchEvidence {
  readonly sourceUrl: string | null;
  readonly sourceAuthority: SourceAuthority | null;
  readonly verifiedAt: string | null;
  readonly effectiveAsOf: string | null;
  readonly evidenceStatus: EvidenceStatus;
  readonly confidence: Confidence;
  readonly notes: string | null;
}

export type StayModeKey = string;

export interface CountryJurisdictionFact {
  readonly destinationCountryCode: string;
  readonly travelerPassportCountryCode: string;
  readonly activityModeGroup: ActivityModeGroup;
  readonly stayModeKey: StayModeKey;
  readonly ordinaryVisitorEligibility: TriState | "NOT_APPLICABLE";
  readonly visaRequired: TriState | "NOT_APPLICABLE";
  readonly maximumVisitorDays: number | null;
  readonly rollingWindowDays: number | null;
  readonly extensionAvailability: TriState | "NOT_APPLICABLE";
  readonly extensionMaximumDays: number | null;
  readonly longStayResidencyPathwayAvailable: TriState | "NOT_APPLICABLE";
  readonly digitalNomadPathwayAvailable: TriState | "NOT_APPLICABLE";
  readonly remoteWorkLegality: TriState | "NOT_APPLICABLE";
  readonly localEmploymentAuthorization: TriState | "NOT_APPLICABLE";
  readonly selfEmploymentPathwayAvailable: TriState | "NOT_APPLICABLE";
  readonly seasonalSplitYearPathwayAvailable: TriState | "NOT_APPLICABLE";
  readonly retirementResidencyPathwayAvailable: TriState | "NOT_APPLICABLE";
  readonly renewalAvailability: TriState | "NOT_APPLICABLE";
  readonly evidence: LifeMatchEvidence;
}

export type LifestyleCapability = "HARD_GATE" | "WEIGHTED_PREFERENCE" | "DISPLAY_ONLY";

export const ACTIVITY_MODE_GROUPS: readonly ActivityModeGroup[] = [
  "TOURIST",
  "REMOTE_WORK",
  "LOCAL_EMPLOYMENT",
  "SELF_EMPLOYMENT",
  "RETIREMENT",
  "SECOND_HOME",
  "SPLIT_YEAR",
] as const;

export const UNKNOWN_REPRESENTATION = "UNKNOWN" as const;
export const LIFESTYLE_FEATURE_DEFINITIONS = {
  // MID_SIZE_CITY/MAJOR_URBAN_CORE/SMALL_TOWN/SUBURBAN_COMMUNITY/RESORT_COMMUNITY are distinct,
  // established authoritative-workbook settlement distinctions and are intentionally NOT flattened
  // into CITY/TOWN. MIXED is deliberately excluded (not UNKNOWN): it is semantically ambiguous
  // (could mean mixed urban/rural, mixed density, or a blend of settlement types) and admitting it
  // without a precise definition would erase the very distinctions this enum exists to preserve.
  settlement_type: {
    expectedType: "enum",
    allowedValues: [
      "CITY", "MAJOR_URBAN_CORE", "MID_SIZE_CITY", "SMALL_CITY",
      "TOWN", "SMALL_TOWN", "SUBURBAN_COMMUNITY", "RESORT_COMMUNITY", "RURAL", "UNKNOWN",
    ],
    unknownRepresentation: UNKNOWN_REPRESENTATION,
    capability: "WEIGHTED_PREFERENCE" as LifestyleCapability,
    evidenceRequirement: "required_when_non_unknown",
  },
  urban_scale: {
    expectedType: "enum",
    allowedValues: ["LOW", "MEDIUM", "HIGH", "UNKNOWN"],
    unknownRepresentation: UNKNOWN_REPRESENTATION,
    capability: "WEIGHTED_PREFERENCE" as LifestyleCapability,
    evidenceRequirement: "required_when_non_unknown",
  },
  beach_access: {
    expectedType: "enum",
    allowedValues: ["NONE", "NEARBY", "DIRECT_ACCESS", "UNKNOWN"],
    unknownRepresentation: UNKNOWN_REPRESENTATION,
    capability: "HARD_GATE" as LifestyleCapability,
    evidenceRequirement: "required_when_non_unknown",
  },
  coastal_setting: {
    expectedType: "enum",
    allowedValues: ["COASTAL", "INLAND", "HYBRID", "UNKNOWN"],
    unknownRepresentation: UNKNOWN_REPRESENTATION,
    capability: "WEIGHTED_PREFERENCE" as LifestyleCapability,
    evidenceRequirement: "required_when_non_unknown",
  },
  surfing_access: {
    expectedType: "enum",
    allowedValues: ["NONE", "LOCAL", "WORLD_CLASS", "UNKNOWN"],
    unknownRepresentation: UNKNOWN_REPRESENTATION,
    capability: "WEIGHTED_PREFERENCE" as LifestyleCapability,
    evidenceRequirement: "required_when_non_unknown",
  },
  marina_access: {
    expectedType: "enum",
    allowedValues: ["NONE", "LIMITED", "GOOD", "EXCELLENT", "UNKNOWN"],
    unknownRepresentation: UNKNOWN_REPRESENTATION,
    capability: "WEIGHTED_PREFERENCE" as LifestyleCapability,
    evidenceRequirement: "required_when_non_unknown",
  },
  boat_launch_access: {
    expectedType: "enum",
    allowedValues: ["NONE", "LIMITED", "GOOD", "EXCELLENT", "UNKNOWN"],
    unknownRepresentation: UNKNOWN_REPRESENTATION,
    capability: "WEIGHTED_PREFERENCE" as LifestyleCapability,
    evidenceRequirement: "required_when_non_unknown",
  },
  fishing_access: {
    expectedType: "enum",
    allowedValues: ["NONE", "LOCAL", "STRONG", "EXCELLENT", "UNKNOWN"],
    unknownRepresentation: UNKNOWN_REPRESENTATION,
    capability: "WEIGHTED_PREFERENCE" as LifestyleCapability,
    evidenceRequirement: "required_when_non_unknown",
  },
  golf_access: {
    expectedType: "enum",
    allowedValues: ["NONE", "LIMITED", "GOOD", "STRONG", "UNKNOWN"],
    unknownRepresentation: UNKNOWN_REPRESENTATION,
    capability: "WEIGHTED_PREFERENCE" as LifestyleCapability,
    evidenceRequirement: "required_when_non_unknown",
  },
  skiing_snowboarding_access: {
    expectedType: "enum",
    allowedValues: ["NONE", "NEARBY", "DIRECT_ACCESS", "UNKNOWN"],
    unknownRepresentation: UNKNOWN_REPRESENTATION,
    capability: "HARD_GATE" as LifestyleCapability,
    evidenceRequirement: "required_when_non_unknown",
  },
  // Reconciled with the established, already-live MountainOrSkiAccessFact canonical type
  // (destination-fact-types.ts, used by eligibility-evaluator.ts's hard gate and
  // lifestyle-scoring-policy.ts's MOUNTAIN_ACCESS_DIMENSION_SCORE) rather than inventing a
  // second, competing NEARBY/DIRECT_ACCESS vocabulary for mountain/ski access.
  mountain_access: {
    expectedType: "enum",
    allowedValues: ["SKI_RESORT_ACCESS", "MOUNTAIN_SCENIC_ONLY", "NONE", "UNKNOWN"],
    unknownRepresentation: UNKNOWN_REPRESENTATION,
    capability: "HARD_GATE" as LifestyleCapability,
    evidenceRequirement: "required_when_non_unknown",
  },
  hiking_access: {
    expectedType: "enum",
    allowedValues: ["NONE", "LIMITED", "GOOD", "EXCELLENT", "UNKNOWN"],
    unknownRepresentation: UNKNOWN_REPRESENTATION,
    capability: "WEIGHTED_PREFERENCE" as LifestyleCapability,
    evidenceRequirement: "required_when_non_unknown",
  },
  trail_access: {
    expectedType: "enum",
    allowedValues: ["NONE", "LIMITED", "GOOD", "EXCELLENT", "UNKNOWN"],
    unknownRepresentation: UNKNOWN_REPRESENTATION,
    capability: "WEIGHTED_PREFERENCE" as LifestyleCapability,
    evidenceRequirement: "required_when_non_unknown",
  },
  road_cycling_access: {
    expectedType: "enum",
    allowedValues: ["NONE", "LIMITED", "GOOD", "EXCELLENT", "UNKNOWN"],
    unknownRepresentation: UNKNOWN_REPRESENTATION,
    capability: "WEIGHTED_PREFERENCE" as LifestyleCapability,
    evidenceRequirement: "required_when_non_unknown",
  },
  mountain_biking_access: {
    expectedType: "enum",
    allowedValues: ["NONE", "LIMITED", "GOOD", "EXCELLENT", "UNKNOWN"],
    unknownRepresentation: UNKNOWN_REPRESENTATION,
    capability: "WEIGHTED_PREFERENCE" as LifestyleCapability,
    evidenceRequirement: "required_when_non_unknown",
  },
  dining_strength: {
    expectedType: "numeric",
    allowedValues: ["0-100"],
    unknownRepresentation: UNKNOWN_REPRESENTATION,
    capability: "WEIGHTED_PREFERENCE" as LifestyleCapability,
    evidenceRequirement: "required_when_non_unknown",
  },
  arts_culture_strength: {
    expectedType: "numeric",
    allowedValues: ["0-100"],
    unknownRepresentation: UNKNOWN_REPRESENTATION,
    capability: "WEIGHTED_PREFERENCE" as LifestyleCapability,
    evidenceRequirement: "required_when_non_unknown",
  },
  nightlife_strength: {
    expectedType: "numeric",
    allowedValues: ["0-100"],
    unknownRepresentation: UNKNOWN_REPRESENTATION,
    capability: "WEIGHTED_PREFERENCE" as LifestyleCapability,
    evidenceRequirement: "required_when_non_unknown",
  },
  scenic_appeal: {
    expectedType: "numeric",
    allowedValues: ["0-100"],
    unknownRepresentation: UNKNOWN_REPRESENTATION,
    capability: "WEIGHTED_PREFERENCE" as LifestyleCapability,
    evidenceRequirement: "required_when_non_unknown",
  },
  pace_of_life: {
    expectedType: "enum",
    allowedValues: ["SLOW", "BALANCED", "FAST", "UNKNOWN"],
    unknownRepresentation: UNKNOWN_REPRESENTATION,
    capability: "WEIGHTED_PREFERENCE" as LifestyleCapability,
    evidenceRequirement: "required_when_non_unknown",
  },
  walkability: {
    expectedType: "numeric",
    allowedValues: ["0-100"],
    unknownRepresentation: UNKNOWN_REPRESENTATION,
    capability: "WEIGHTED_PREFERENCE" as LifestyleCapability,
    evidenceRequirement: "required_when_non_unknown",
  },
  climate_profile: {
    expectedType: "enum",
    allowedValues: ["HOT", "WARM", "MILD", "COOL", "UNKNOWN"],
    unknownRepresentation: UNKNOWN_REPRESENTATION,
    capability: "WEIGHTED_PREFERENCE" as LifestyleCapability,
    evidenceRequirement: "required_when_non_unknown",
  },
  airport_access: {
    expectedType: "enum",
    allowedValues: ["POOR", "MODERATE", "STRONG", "EXCELLENT", "UNKNOWN"],
    unknownRepresentation: UNKNOWN_REPRESENTATION,
    capability: "WEIGHTED_PREFERENCE" as LifestyleCapability,
    evidenceRequirement: "required_when_non_unknown",
  },
  healthcare_access: {
    expectedType: "enum",
    allowedValues: ["LIMITED", "ADEQUATE", "GOOD", "EXCELLENT", "UNKNOWN"],
    unknownRepresentation: UNKNOWN_REPRESENTATION,
    capability: "WEIGHTED_PREFERENCE" as LifestyleCapability,
    evidenceRequirement: "required_when_non_unknown",
  },
  remote_work_infrastructure: {
    expectedType: "enum",
    allowedValues: ["LIMITED", "ADEQUATE", "GOOD", "EXCELLENT", "UNKNOWN"],
    unknownRepresentation: UNKNOWN_REPRESENTATION,
    capability: "WEIGHTED_PREFERENCE" as LifestyleCapability,
    evidenceRequirement: "required_when_non_unknown",
  },
} as const;

export type LifestyleFeatureKey = keyof typeof LIFESTYLE_FEATURE_DEFINITIONS;

/** Strict, no-coercion membership check against the committed enum/numeric-range contract for one feature. */
export function validateLifestyleFeatureValue(featureKey: LifestyleFeatureKey, value: unknown): boolean {
  const definition: { expectedType: string; allowedValues: readonly string[] } = LIFESTYLE_FEATURE_DEFINITIONS[featureKey];
  if (value === "NOT_APPLICABLE") return true;
  if (definition.expectedType === "enum") {
    return typeof value === "string" && definition.allowedValues.includes(value);
  }
  if (definition.expectedType === "numeric") {
    if (value === UNKNOWN_REPRESENTATION) return true;
    const numeric = typeof value === "number" ? value : Number(value);
    return Number.isFinite(numeric) && numeric >= 0 && numeric <= 100;
  }
  return false;
}

export const COUNTRY_JURISDICTION_FACT_HEADERS = [
  "destinationCountryCode",
  "travelerPassportCountryCode",
  "activityModeGroup",
  "stayModeKey",
  "ordinaryVisitorEligibility",
  "visaRequired",
  "maximumVisitorDays",
  "rollingWindowDays",
  "extensionAvailability",
  "extensionMaximumDays",
  "longStayResidencyPathwayAvailable",
  "digitalNomadPathwayAvailable",
  "remoteWorkLegality",
  "localEmploymentAuthorization",
  "selfEmploymentPathwayAvailable",
  "seasonalSplitYearPathwayAvailable",
  "retirementResidencyPathwayAvailable",
  "renewalAvailability",
  "sourceUrl",
  "sourceAuthority",
  "verifiedAt",
  "effectiveAsOf",
  "evidenceStatus",
  "confidence",
  "notes",
] as const;

export function normalizeCountryCode(value: string | null | undefined): string {
  const normalized = (value ?? "").trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(normalized)) {
    throw new Error(`Invalid ISO country code: ${String(value)}`);
  }
  return normalized;
}

export function isKnownTriState(value: unknown): value is TriState {
  return value === "YES" || value === "NO" || value === "UNKNOWN";
}

export function validateEvidence(evidence: LifeMatchEvidence | null | undefined, context: string): void {
  if (!evidence) {
    throw new Error(`${context}: evidence is required`);
  }

  if (evidence.evidenceStatus === "VERIFIED_PRIMARY") {
    if (!evidence.sourceUrl || !evidence.sourceUrl.trim()) {
      throw new Error(`${context}: VERIFIED_PRIMARY requires a nonblank sourceUrl`);
    }
    if (!evidence.sourceAuthority) {
      throw new Error(`${context}: VERIFIED_PRIMARY requires a sourceAuthority`);
    }
    if (!evidence.verifiedAt || !evidence.verifiedAt.trim()) {
      throw new Error(`${context}: VERIFIED_PRIMARY requires a verifiedAt date`);
    }
  }

  if (evidence.evidenceStatus === "RESEARCH_PENDING") {
    return;
  }

  if (evidence.evidenceStatus === "NOT_APPLICABLE") {
    return;
  }

  if (evidence.evidenceStatus === "UNVERIFIED_ESTIMATE") {
    return;
  }
}

export function validateCountryJurisdictionFact(fact: CountryJurisdictionFact): CountryJurisdictionFact {
  const destination = normalizeCountryCode(fact.destinationCountryCode);
  const traveler = normalizeCountryCode(fact.travelerPassportCountryCode);

  if (!ACTIVITY_MODE_GROUPS.includes(fact.activityModeGroup)) {
    throw new Error(`Invalid activityModeGroup: ${String(fact.activityModeGroup)}`);
  }

  const numericFields = [
    fact.maximumVisitorDays,
    fact.rollingWindowDays,
    fact.extensionMaximumDays,
  ] as const;

  for (const field of numericFields) {
    if (typeof field === "number" && field < 0) {
      throw new Error(`Numeric day field cannot be negative`);
    }
  }

  validateEvidence(fact.evidence, `CountryJurisdictionFact ${destination}/${traveler}`);

  const validLegalStates = new Set(["YES", "NO", "UNKNOWN", "NOT_APPLICABLE"]);
  for (const [key, value] of Object.entries(fact)) {
    if (key === "maximumVisitorDays" || key === "rollingWindowDays" || key === "extensionMaximumDays") {
      continue;
    }
    if (typeof value === "string" && value !== "UNKNOWN" && value !== "NOT_APPLICABLE" && !validLegalStates.has(value)) {
      if (key === "destinationCountryCode" || key === "travelerPassportCountryCode") {
        continue;
      }
      if (key === "activityModeGroup" || key === "stayModeKey") {
        continue;
      }
      if (key === "evidence") {
        continue;
      }
    }
  }

  return {
    ...fact,
    destinationCountryCode: destination,
    travelerPassportCountryCode: traveler,
  };
}

export function validateCountryJurisdictionRows(rows: readonly CountryJurisdictionFact[]): CountryJurisdictionFact[] {
  const seen = new Set<string>();
  const validated: CountryJurisdictionFact[] = [];

  for (const row of rows) {
    const normalized = validateCountryJurisdictionFact(row);
    const compositeKey = [
      normalized.destinationCountryCode,
      normalized.travelerPassportCountryCode,
      normalized.activityModeGroup,
      normalized.stayModeKey,
    ].join("|");

    if (seen.has(compositeKey)) {
      throw new Error(`Duplicate country-jurisdiction composite key: ${compositeKey}`);
    }

    seen.add(compositeKey);
    validated.push(normalized);
  }

  return validated;
}

export function normalizeEvidenceForLegalStatus<T extends CountryJurisdictionFact>(fact: T): T {
  const status = fact.evidence?.evidenceStatus;
  if (status === "RESEARCH_PENDING") {
    return {
      ...fact,
      ordinaryVisitorEligibility: "UNKNOWN",
      visaRequired: "UNKNOWN",
      extensionAvailability: "UNKNOWN",
      longStayResidencyPathwayAvailable: "UNKNOWN",
      digitalNomadPathwayAvailable: "UNKNOWN",
      remoteWorkLegality: "UNKNOWN",
      localEmploymentAuthorization: "UNKNOWN",
      selfEmploymentPathwayAvailable: "UNKNOWN",
      seasonalSplitYearPathwayAvailable: "UNKNOWN",
      retirementResidencyPathwayAvailable: "UNKNOWN",
      renewalAvailability: "UNKNOWN",
    };
  }

  if (status === "NOT_APPLICABLE") {
    return {
      ...fact,
      ordinaryVisitorEligibility: "NOT_APPLICABLE",
      visaRequired: "NOT_APPLICABLE",
      extensionAvailability: "NOT_APPLICABLE",
      longStayResidencyPathwayAvailable: "NOT_APPLICABLE",
      digitalNomadPathwayAvailable: "NOT_APPLICABLE",
      remoteWorkLegality: "NOT_APPLICABLE",
      localEmploymentAuthorization: "NOT_APPLICABLE",
      selfEmploymentPathwayAvailable: "NOT_APPLICABLE",
      seasonalSplitYearPathwayAvailable: "NOT_APPLICABLE",
      retirementResidencyPathwayAvailable: "NOT_APPLICABLE",
      renewalAvailability: "NOT_APPLICABLE",
    };
  }

  return fact;
}
