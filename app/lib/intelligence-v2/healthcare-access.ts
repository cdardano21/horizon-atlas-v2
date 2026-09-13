/** Bounded contract proof. Not wired into live matching pending sufficient verified seed coverage. */
export type HealthcareAccessLevel = "BASIC_ACCESS" | "GOOD_PRIVATE_CARE" | "INTERNATIONAL_STANDARD";
export type HealthcareAccessClassification = HealthcareAccessLevel | "NO_QUALIFYING_ACCESS" | "UNKNOWN";
export interface HealthcareSource {
  name: string;
  url: string;
  verifiedAt: string;
  /** Accreditation validity only; never extends unrelated travel/capability facts. */
  validFrom?: string;
  validThrough?: string;
}
export interface HealthcareFacilityEvidence {
  facilityName: string;
  facilityType: "GENERAL_HOSPITAL" | "TERTIARY_HOSPITAL" | "MEDICAL_CENTRE" | "UNKNOWN";
  driveMinutes: number | null;
  emergency24h: boolean | null;
  inpatient: boolean | null;
  outpatient: boolean | null;
  multispecialty: boolean | null;
  privateCareAvailable: boolean | null;
  verified: boolean;
  /** Sources must substantiate the asserted capabilities and road travel time. */
  sources: HealthcareSource[];
  qualityStandard?: { standardId: string; source: HealthcareSource };
}
export interface HealthcareAccessEvidence {
  facilities: HealthcareFacilityEvidence[];
  conflictingSources?: boolean;
  /** Explicit reviewed negative evidence, never inferred from missing records. */
  noQualifyingAccess?: { verified: boolean; source: HealthcareSource };
}
export interface HealthcareAccessPolicy {
  /** No defaults: caller must supply approved limits and recognized quality standards. */
  maxDriveMinutes: Record<HealthcareAccessLevel, number>;
  acceptedQualityStandards: readonly string[];
}
export const APPROVED_HEALTHCARE_POLICY: HealthcareAccessPolicy = {
  maxDriveMinutes: { BASIC_ACCESS: 30, GOOD_PRIVATE_CARE: 45, INTERNATIONAL_STANDARD: 60 },
  // Equivalent frameworks require explicit acceptance; none is silently inferred.
  acceptedQualityStandards: ["JCI"],
};

function validSource(source: HealthcareSource, now: Date, accreditation = false): boolean {
  try {
    const reviewed = Date.parse(source.verifiedAt);
    const cutoff = new Date(now);
    cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 2);
    const fresh = reviewed >= cutoff.getTime() && reviewed <= now.getTime();
    const currentAccreditation = accreditation && !!source.validFrom && !!source.validThrough
      && Date.parse(source.validFrom) <= now.getTime() && Date.parse(source.validThrough) >= now.getTime();
    return !!source.name.trim() && /^https?:$/.test(new URL(source.url).protocol)
      && Number.isFinite(reviewed) && reviewed <= now.getTime() && (fresh || currentAccreditation);
  } catch { return false; }
}
export function meetsHealthcareMinimum(
  evidence: HealthcareAccessEvidence | undefined,
  minimum: HealthcareAccessLevel,
  policy: HealthcareAccessPolicy = APPROVED_HEALTHCARE_POLICY,
  now = new Date(),
): boolean {
  const limit = policy.maxDriveMinutes[minimum];
  if (!Number.isFinite(limit) || limit < 0) return false;
  // Conflicting positive/negative evidence requires review, not an automatic pass.
  if (evidence?.conflictingSources || evidence?.noQualifyingAccess?.verified) return false;
  return evidence?.facilities.some((facility) => {
    if (!facility.verified || !facility.facilityName.trim() || !facility.sources.length
      || !facility.sources.every((source) => validSource(source, now)) || facility.driveMinutes === null
      || !Number.isFinite(facility.driveMinutes) || facility.driveMinutes < 0
      || facility.driveMinutes > limit) return false;
    const hospital = facility.facilityType === "GENERAL_HOSPITAL" || facility.facilityType === "TERTIARY_HOSPITAL";
    const basic = hospital && facility.emergency24h === true && facility.inpatient === true && facility.outpatient === true;
    if (minimum === "BASIC_ACCESS") return basic;
    if (minimum === "GOOD_PRIVATE_CARE") {
      return basic && facility.privateCareAvailable === true && facility.multispecialty === true;
    }
    return basic && hospital && facility.multispecialty === true
      && !!facility.qualityStandard && validSource(facility.qualityStandard.source, now, true)
      && policy.acceptedQualityStandards.includes(facility.qualityStandard.standardId);
  }) ?? false;
}
export function classifyHealthcareAccess(evidence: HealthcareAccessEvidence | undefined, policy: HealthcareAccessPolicy = APPROVED_HEALTHCARE_POLICY, now = new Date()): HealthcareAccessClassification {
  if (evidence?.conflictingSources) return "UNKNOWN";
  if (evidence?.noQualifyingAccess?.verified && validSource(evidence.noQualifyingAccess.source, now)) {
    return evidence.facilities.length ? "UNKNOWN" : "NO_QUALIFYING_ACCESS";
  }
  for (const level of ["INTERNATIONAL_STANDARD", "GOOD_PRIVATE_CARE", "BASIC_ACCESS"] as const) {
    if (meetsHealthcareMinimum(evidence, level, policy, now)) return level;
  }
  return "UNKNOWN";
}
