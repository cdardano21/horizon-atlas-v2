const PLACEHOLDER_PATTERNS = [
  /research needed/i,
  /in progress/i,
  /unavailable/i,
  /no verified information currently available/i,
  /data verification in progress/i,
  /coming soon/i,
];

export const NO_VERIFIED_INFO = "Source-backed destination coverage is in progress for this field";

export function isPlaceholderCopy(value: string | null | undefined) {
  if (!value) return true;
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value));
}

export function toConsumerCopy(value: string | null | undefined, fallback = NO_VERIFIED_INFO) {
  if (!value) return fallback;
  return isPlaceholderCopy(value) ? fallback : value;
}

export function sanitizeSummary(value: string | null | undefined, fallback = NO_VERIFIED_INFO) {
  if (!value) return fallback;
  const parts = value.split("|").map((part) => part.trim()).filter(Boolean);
  const filtered = parts.filter((part) => !isPlaceholderCopy(part));
  if (filtered.length === 0) return fallback;
  return filtered.join(" | ");
}