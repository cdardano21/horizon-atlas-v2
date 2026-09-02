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

export type LifeMatchPassportAnswer = string | "NOT_SURE";
export type LifeMatchPermitWillingnessAnswer = "YES" | "MAYBE" | "NO" | "NOT_SURE";
export type LifeMatchBudgetAnswer =
  | "UNDER_3000"
  | "FROM_3000_TO_4499"
  | "FROM_4500_TO_6499"
  | "FROM_6500_TO_8499"
  | "FROM_8500_TO_10499"
  | "FROM_10500_PLUS"
  | "NOT_SURE";

const ALL_REPO_COUNTRIES = [
  "AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AR", "AT", "AU", "AW", "AZ", "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL", "BM", "BN", "BO", "BR", "BS", "BT", "BW", "BY", "BZ", "CA", "CD", "CF", "CG", "CH", "CI", "CL", "CM", "CN", "CO", "CR", "CU", "CV", "CW", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE", "EG", "ES", "ET", "FI", "FJ", "FR", "GA", "GB", "GD", "GE", "GH", "GM", "GN", "GQ", "GR", "GT", "GW", "GY", "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IN", "IQ", "IR", "IS", "IT", "JM", "JO", "JP", "KE", "KG", "KH", "KM", "KN", "KP", "KR", "KW", "KY", "KZ", "LA", "LB", "LC", "LI", "LK", "LR", "LS", "LT", "LU", "LV", "LY", "MA", "MC", "MD", "ME", "MF", "MG", "MK", "ML", "MM", "MN", "MR", "MT", "MU", "MV", "MW", "MX", "MY", "MZ", "NA", "NE", "NG", "NI", "NL", "NO", "NP", "NZ", "OM", "PA", "PE", "PG", "PH", "PK", "PL", "PR", "PT", "PY", "QA", "RO", "RS", "RU", "RW", "SA", "SB", "SC", "SD", "SE", "SG", "SI", "SK", "SL", "SM", "SN", "SO", "SR", "SS", "ST", "SV", "SX", "SY", "SZ", "TC", "TD", "TG", "TH", "TJ", "TL", "TM", "TN", "TO", "TR", "TT", "TW", "TZ", "UA", "UG", "US", "UY", "UZ", "VC", "VE", "VN", "WS", "XK", "YE", "ZA", "ZM", "ZW",
] as const;

const COUNTRY_LABELS = new Intl.DisplayNames(["en"], { type: "region" });

export const LIFE_MATCH_PASSPORT_OPTIONS: ReadonlyArray<{ value: LifeMatchPassportAnswer; label: string }> = [
  { value: "NOT_SURE", label: "Not sure yet" },
  ...ALL_REPO_COUNTRIES
    .filter((code) => code !== "XK")
    .map((code) => ({ value: code as LifeMatchPassportAnswer, label: COUNTRY_LABELS.of(code) ?? code })),
];

export const LIFE_MATCH_PERMIT_WILLINGNESS_OPTIONS: ReadonlyArray<{ value: LifeMatchPermitWillingnessAnswer; label: string }> = [
  { value: "YES", label: "Yes" },
  { value: "MAYBE", label: "Maybe" },
  { value: "NO", label: "No" },
  { value: "NOT_SURE", label: "Not sure yet" },
];

export const LIFE_MATCH_BUDGET_OPTIONS: ReadonlyArray<{ value: LifeMatchBudgetAnswer; label: string }> = [
  { value: "UNDER_3000", label: "Under $3,000" },
  { value: "FROM_3000_TO_4499", label: "$3,000–$4,499" },
  { value: "FROM_4500_TO_6499", label: "$4,500–$6,499" },
  { value: "FROM_6500_TO_8499", label: "$6,500–$8,499" },
  { value: "FROM_8500_TO_10499", label: "$8,500–$10,499" },
  { value: "FROM_10500_PLUS", label: "$10,500 or more" },
  { value: "NOT_SURE", label: "Not sure yet" },
];

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

export const isValidLifeMatchPurposeAnswer = (value: unknown): value is LifeMatchPurposeAnswer =>
  typeof value === "string" && LIFE_MATCH_PURPOSE_OPTIONS.some((option) => option.value === value);

export const isValidLifeMatchStayDurationAnswer = (value: unknown): value is LifeMatchStayDurationAnswer =>
  typeof value === "string" && LIFE_MATCH_STAY_DURATION_OPTIONS.some((option) => option.value === value);

export const isValidLifeMatchPassportAnswer = (value: unknown): value is LifeMatchPassportAnswer => {
  if (value === "NOT_SURE") return true;
  return typeof value === "string" && /^[A-Z]{2}$/.test(value) && ALL_REPO_COUNTRIES.includes(value as (typeof ALL_REPO_COUNTRIES)[number]);
};

export const isValidLifeMatchPermitWillingnessAnswer = (value: unknown): value is LifeMatchPermitWillingnessAnswer =>
  typeof value === "string" && LIFE_MATCH_PERMIT_WILLINGNESS_OPTIONS.some((option) => option.value === value);

export const isValidLifeMatchBudgetAnswer = (value: unknown): value is LifeMatchBudgetAnswer =>
  typeof value === "string" && LIFE_MATCH_BUDGET_OPTIONS.some((option) => option.value === value);

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
