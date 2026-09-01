import type { ActivityMode, StayDuration, TenureIntent, UserProfileV2 } from "./profile-types";

/**
 * Purpose-and-duration intake — the two purpose-neutral questions asked at the
 * very beginning of Life Match, before any retirement-specific or lifestyle-scale
 * question. This is the ONLY place that maps a user's plain-language purpose and
 * intended-stay-length choice onto the three canonical `UserProfileV2` fields that
 * choice can honestly determine: `activityMode`, `stayDuration`, and `tenureIntent`.
 *
 * It never guesses a value for any other `UserProfileV2` field (e.g.
 * `intendsToWorkDuringStay`, `hardRequirements`) — those stay at their safe,
 * off/null defaults until a dedicated question sets them explicitly.
 */

export type LifeMatchPurposeAnswer =
  | "LEISURE_TRAVELER"
  | "REMOTE_EMPLOYEE"
  | "SELF_EMPLOYED"
  | "DIGITAL_NOMAD"
  | "LOCAL_EMPLOYMENT"
  | "SECOND_HOME"
  | "SPLIT_YEAR_SNOWBIRD"
  | "TESTING"
  | "RETIRED"
  | "NOT_SURE";

export type LifeMatchStayDurationAnswer =
  | "LESS_THAN_ONE_MONTH"
  | "ABOUT_ONE_MONTH"
  | "ABOUT_THREE_MONTHS"
  | "ABOUT_SIX_MONTHS"
  | "ABOUT_ONE_YEAR"
  | "INDEFINITE_OR_PERMANENT"
  | "NOT_SURE";

export const LIFE_MATCH_PURPOSE_OPTIONS: ReadonlyArray<{ value: LifeMatchPurposeAnswer; label: string }> = [
  { value: "LEISURE_TRAVELER", label: "Leisure traveler / extended stay" },
  { value: "REMOTE_EMPLOYEE", label: "Remote employee" },
  { value: "SELF_EMPLOYED", label: "Self-employed" },
  { value: "DIGITAL_NOMAD", label: "Digital nomad" },
  { value: "LOCAL_EMPLOYMENT", label: "Local employment" },
  { value: "SECOND_HOME", label: "Second home" },
  { value: "SPLIT_YEAR_SNOWBIRD", label: "Seasonal or split-year living" },
  { value: "TESTING", label: "Testing a destination before relocating" },
  { value: "RETIRED", label: "Retirement" },
  { value: "NOT_SURE", label: "Not sure yet" },
];

export const LIFE_MATCH_STAY_DURATION_OPTIONS: ReadonlyArray<{ value: LifeMatchStayDurationAnswer; label: string }> = [
  { value: "LESS_THAN_ONE_MONTH", label: "Less than one month" },
  { value: "ABOUT_ONE_MONTH", label: "Around one month" },
  { value: "ABOUT_THREE_MONTHS", label: "Around three months" },
  { value: "ABOUT_SIX_MONTHS", label: "Around six months" },
  { value: "ABOUT_ONE_YEAR", label: "Around one year" },
  { value: "INDEFINITE_OR_PERMANENT", label: "Indefinite or permanent" },
  { value: "NOT_SURE", label: "Not sure yet" },
];

/** Only the explicit 'Not sure yet' purpose maps to NOT_SURE. */
function mapPurposeToActivityMode(purpose: LifeMatchPurposeAnswer): ActivityMode {
  switch (purpose) {
    case "LEISURE_TRAVELER":
      return "LEISURE_TRAVELER";
    case "REMOTE_EMPLOYEE":
      return "REMOTE_EMPLOYEE";
    case "SELF_EMPLOYED":
      return "SELF_EMPLOYED";
    case "DIGITAL_NOMAD":
      return "DIGITAL_NOMAD";
    case "LOCAL_EMPLOYMENT":
      return "LOCAL_EMPLOYMENT";
    case "SECOND_HOME":
      return "SECOND_HOME";
    case "SPLIT_YEAR_SNOWBIRD":
      return "SPLIT_YEAR_SNOWBIRD";
    case "TESTING":
      return "TESTING";
    case "RETIRED":
      return "RETIRED";
    case "NOT_SURE":
      return "NOT_SURE";
  }
}

/** Uses the existing canonical StayDurationBand values; never invents a new band. */
function mapDurationAnswerToStayDuration(duration: LifeMatchStayDurationAnswer): StayDuration {
  switch (duration) {
    case "LESS_THAN_ONE_MONTH":
      return { band: "SHORT_1_3_MONTHS", intendedStayDurationDays: 14 };
    case "ABOUT_ONE_MONTH":
      return { band: "SHORT_1_3_MONTHS", intendedStayDurationDays: 30 };
    case "ABOUT_THREE_MONTHS":
      return { band: "SHORT_1_3_MONTHS", intendedStayDurationDays: 90 };
    case "ABOUT_SIX_MONTHS":
      return { band: "MEDIUM_3_6_MONTHS", intendedStayDurationDays: 182 };
    case "ABOUT_ONE_YEAR":
      return { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 365 };
    case "INDEFINITE_OR_PERMANENT":
      return { band: "LONG_TERM_PERMANENT", intendedStayDurationDays: null };
    case "NOT_SURE":
      return { band: "UNSURE", intendedStayDurationDays: null };
  }
}

/** Property-purchase intent must be gated behind a future explicit rent-vs-buy question. */
function mapPurposeToTenureIntent(_purpose: LifeMatchPurposeAnswer): TenureIntent {
  return "UNSURE";
}

function mapPurposeToIntendsToWorkDuringStay(purpose: LifeMatchPurposeAnswer): boolean {
  switch (purpose) {
    case "REMOTE_EMPLOYEE":
    case "SELF_EMPLOYED":
    case "DIGITAL_NOMAD":
    case "LOCAL_EMPLOYMENT":
      return true;
    case "LEISURE_TRAVELER":
    case "RETIRED":
      return false;
    case "SECOND_HOME":
    case "SPLIT_YEAR_SNOWBIRD":
    case "TESTING":
    case "NOT_SURE":
      return false;
  }
}

export function derivePurposeAndDurationProfileFields(
  purpose: LifeMatchPurposeAnswer,
  duration: LifeMatchStayDurationAnswer,
): Pick<UserProfileV2, "activityMode" | "stayDuration" | "tenureIntent" | "intendsToWorkDuringStay"> {
  return {
    activityMode: mapPurposeToActivityMode(purpose),
    stayDuration: mapDurationAnswerToStayDuration(duration),
    tenureIntent: mapPurposeToTenureIntent(purpose),
    intendsToWorkDuringStay: mapPurposeToIntendsToWorkDuringStay(purpose),
  };
}
