/** Dormant evidence contract: no live adapter or gate imports this module. */
export type ResidencyRouteType = "DOCUMENTED_LONG_STAY_ROUTE" | "DOCUMENTED_RETIREMENT_ROUTE" | "DOCUMENTED_REMOTE_WORK_ROUTE" | "DOCUMENTED_PERMANENT_RESIDENCY_PATH";
export type ResidencyOutcome = "PASS" | "NO_DOCUMENTED_ROUTE" | "UNKNOWN";
export interface ResidencySource {
  name: string;
  url: string;
  verified: boolean;
  verifiedAt: string;
  /** Explicit official period establishing current program status, not a visa/stay duration. */
  officialStatusValidity?: { from: string; through: string };
}
export interface ResidencyRouteEvidence {
  destinationKey: string;
  countryCode: string;
  jurisdiction: string;
  routeType: ResidencyRouteType;
  programName: string;
  /** Preserve the actual legal duration; visa validity is not automatically stay duration. */
  legalStayDuration: string;
  beyondOrdinaryTouristStay: boolean | null;
  renewable: "YES" | "NO" | "UNKNOWN";
  currentlyAvailable: "YES" | "NO" | "UNKNOWN";
  status: "ACTIVE" | "SUSPENDED" | "EXPIRED" | "UNKNOWN";
  availableFrom?: string;
  availableThrough?: string;
  source: ResidencySource;
  eligibilityNotes?: string;
}
export interface ResidencyEvidence {
  routes: ResidencyRouteEvidence[];
  conflictingSources?: boolean;
  /** Destination/jurisdiction-scoped reviewed absence of ANY qualifying route. */
  noDocumentedRoute?: { destinationKey: string; countryCode: string; jurisdiction: string; source: ResidencySource };
}
export interface ResidencyEvidencePolicy {
  /** Reviewed official authority hosts per jurisdiction; URL shape alone proves nothing. */
  officialHostsByJurisdiction: Readonly<Record<string, readonly string[]>>;
}
export interface ResidencyIdentity { destinationKey: string; countryCode: string; jurisdiction: string }
export const MAX_RESIDENCY_REVIEW_AGE_MONTHS = 12;
const routeTypes: readonly ResidencyRouteType[] = ["DOCUMENTED_LONG_STAY_ROUTE", "DOCUMENTED_RETIREMENT_ROUTE", "DOCUMENTED_REMOTE_WORK_ROUTE", "DOCUMENTED_PERMANENT_RESIDENCY_PATH"];
function validSource(source: ResidencySource, jurisdiction: string, policy: ResidencyEvidencePolicy, now: Date): boolean {
  try {
    const url = new URL(source.url);
    const reviewed = Date.parse(source.verifiedAt);
    const cutoff = new Date(now);
    const day = cutoff.getUTCDate();
    cutoff.setUTCDate(1);
    cutoff.setUTCMonth(cutoff.getUTCMonth() - MAX_RESIDENCY_REVIEW_AGE_MONTHS);
    const lastDay = new Date(Date.UTC(cutoff.getUTCFullYear(), cutoff.getUTCMonth() + 1, 0)).getUTCDate();
    cutoff.setUTCDate(Math.min(day, lastDay));
    const validity = source.officialStatusValidity;
    const currentOfficialPeriod = !!validity && Date.parse(validity.from) <= now.getTime()
      && Date.parse(validity.through) >= now.getTime();
    return source.verified === true && !!source.name.trim() && /^https?:$/.test(url.protocol)
      && (policy.officialHostsByJurisdiction[jurisdiction] ?? []).includes(url.hostname)
      && Number.isFinite(reviewed) && reviewed <= now.getTime()
      && (reviewed >= cutoff.getTime() || currentOfficialPeriod);
  } catch { return false; }
}
function sameIdentity(record: ResidencyIdentity, identity: ResidencyIdentity): boolean {
  return !!identity.destinationKey && !!identity.countryCode && !!identity.jurisdiction
    && record.destinationKey === identity.destinationKey && record.countryCode === identity.countryCode
    && record.jurisdiction === identity.jurisdiction;
}
/** PASS establishes route existence only, never applicant eligibility or guaranteed approval. */
export function evaluateResidencyEvidence(
  evidence: ResidencyEvidence | undefined,
  identity: ResidencyIdentity,
  policy: ResidencyEvidencePolicy,
  requestedType?: ResidencyRouteType,
  now = new Date(),
): ResidencyOutcome {
  if (!evidence || evidence.conflictingSources) return "UNKNOWN";
  const negative = evidence.noDocumentedRoute;
  if (negative && sameIdentity(negative, identity) && validSource(negative.source, identity.jurisdiction, policy, now)) {
    return evidence.routes.length ? "UNKNOWN" : "NO_DOCUMENTED_ROUTE";
  }
  const found = evidence.routes.some((route) => {
    if (!sameIdentity(route, identity) || !routeTypes.includes(route.routeType)
      || (requestedType && route.routeType !== requestedType)
      || !route.programName.trim() || !route.legalStayDuration.trim()
      || route.beyondOrdinaryTouristStay !== true || route.currentlyAvailable !== "YES"
      || route.status !== "ACTIVE" || !validSource(route.source, identity.jurisdiction, policy, now)) return false;
    if (route.availableFrom && !(Date.parse(route.availableFrom) <= now.getTime())) return false;
    if (route.availableThrough && !(Date.parse(route.availableThrough) >= now.getTime())) return false;
    return true;
  });
  return found ? "PASS" : "UNKNOWN";
}
