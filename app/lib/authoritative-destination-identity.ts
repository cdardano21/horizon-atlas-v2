import { EXPANSION_WORKBOOK_REGISTRY } from "./expansion-workbook-registry";
import { smartShortlistCandidates } from "./smart-shortlist/cohort";

// Static identity metadata only: never enables workbook preview loading or parses workbooks.
const authoritativeKeys = new Set(EXPANSION_WORKBOOK_REGISTRY.flatMap(entry => [...entry.expectedDestinationKeys]));
// Reuse the existing sealed cohort's route aliases; only registry-owned identities qualify.
for (const candidate of smartShortlistCandidates) {
  if (authoritativeKeys.has(candidate.key)) authoritativeKeys.add(candidate.slug.trim().toLowerCase());
}
export const isAuthoritativeDestinationIdentity = (identity: string): boolean =>
  authoritativeKeys.has(identity.trim().toLowerCase());

export class AuthoritativeDestinationUnavailableError extends Error {
  constructor() {
    super("Authoritative destination data is unavailable");
    this.name = "AuthoritativeDestinationUnavailableError";
  }
}
