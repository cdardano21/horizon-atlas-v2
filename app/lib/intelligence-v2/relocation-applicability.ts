/**
 * Small, pure, contextual helper: determines whether a profile+destination pair
 * represents a cross-border relocation. This is deliberately NOT a destination
 * fact (the workbook/adapter never compute or store it) and NOT a profile fact —
 * it is the relationship BETWEEN the two, derived fresh on every call.
 *
 * V1 rule (documented, not hidden): a move is DOMESTIC only when the user's
 * primary passport/citizenship country code exactly matches the destination's
 * country code. Anything else - including cases a future rule might treat as
 * "domestic-like" (e.g. an EU citizen moving within the EU/EEA under freedom of
 * movement) - is CROSS_BORDER under this V1 rule. Recognizing free-movement
 * blocs is an explicit future extension of this function's RULE, not a change to
 * its contract/signature - callers never need to change when that happens.
 */
import type { UserProfileV2 } from "./profile-types";
import type { SyntheticDestinationFixture } from "./destination-fact-types";

export type RelocationApplicability = "CROSS_BORDER" | "DOMESTIC" | "UNKNOWN";

function normalizeCountryCode(code: string | null | undefined): string | null {
  const trimmed = (code ?? "").trim();
  return trimmed.length > 0 ? trimmed.toUpperCase() : null;
}

/**
 * Never assumes a citizenship or destination country when one is missing -
 * returns UNKNOWN rather than silently defaulting to DOMESTIC or CROSS_BORDER.
 */
export function deriveRelocationApplicability(profile: UserProfileV2, destination: SyntheticDestinationFixture): RelocationApplicability {
  const citizenshipCountryCode = normalizeCountryCode(profile.citizenship?.primaryPassportCountryCode);
  const destinationCountryCode = normalizeCountryCode(destination.countryCode);

  if (citizenshipCountryCode === null || destinationCountryCode === null) return "UNKNOWN";
  return citizenshipCountryCode === destinationCountryCode ? "DOMESTIC" : "CROSS_BORDER";
}
