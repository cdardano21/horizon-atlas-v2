// Shared render-layer text sanitizer for workbook-sourced prose. Several authoritative-workbook
// prose fields (LIFESTYLE_FEATURES.evidence_summary, DESTINATION_SCORES.evidence_summary, and
// assorted DESTINATION_FACTS/REALITY_CHECK notes) embed internal sheet names, raw enum "Rating:
// CODE." prefixes, or raw snake_case risk tokens directly inside otherwise-good authored sentences.
// This is content baked into the workbook itself - it cannot be fixed by rewriting the workbook, but
// it can and must be humanized wherever it is rendered to a customer. Every destination-page
// component that displays workbook prose should route it through this single function rather than
// each re-implementing its own ad hoc cleanup.

// A small, precise list of internal workbook enum/placeholder tokens that must never render as a
// polished public fact (never a broad heuristic - legitimate short labels like severity ratings
// "HIGH"/"MEDIUM"/"LOW" must keep rendering normally).
const PLACEHOLDER_TOKENS = new Set([
  "variable", "conditional", "unknown", "tbd", "n/a", "na", "pending", "search_zone",
  // These are normalized (lowercased, underscores/spaces stripped) before lookup below, so the
  // set entries must match that same normalized form (e.g. "generally_good" -> "generallygood").
  "generallygood", "touristandinternationalcontexts", "statusdependent",
  "categorydependent", "donotassume", "nodedicatedprogram",
]);

// Whole-value internal research/production-status language that must never reach a reader,
// regardless of surrounding sentence structure - matched as a substring (case-insensitive) against
// the full value, since these phrases appear embedded inside otherwise-plausible-looking prose
// rather than as a standalone token. A value containing any of these is hidden entirely (returns
// null) rather than partially edited, since the remaining text is typically also just unfinished
// research scaffolding.
const PLACEHOLDER_PHRASES = [
  "not yet verified from an authoritative source",
  "verified imagery pending",
  "address-specific review recommended",
  "more local detail coming soon",
  "specific items to confirm",
];

// Shared with sanitizePublicPlaceText (a separate, narrower place/description sanitizer) so both
// recognize the exact same set of unpublishable research-status phrases.
export const containsUnpublishablePlaceholderLanguage = (value: string): boolean => {
  const lowerText = value.toLowerCase();
  return PLACEHOLDER_PHRASES.some((phrase) => lowerText.includes(phrase));
};

export const sanitizePublicText = (value?: string | null): string | null => {
  if (typeof value !== "string") return null;
  let text = value.trim();
  if (!text) return null;
  if (/^Existing workbook long_description explicitly frames the destination as /i.test(text)) return null;
  // Move embedded "Source: <url>" citations out of public prose - the URL belongs in a structured
  // source field, not appended to visible text.
  text = text.replace(/\s*Source:\s*https?:\/\/\S+\s*$/i, "").trim();
  // Strip author-facing editorial instructions that should never have reached public copy.
  text = text.replace(/\(?retain as unknown\)?/gi, "").trim();
  text = text.replace(/\bsearch_zone\b/gi, "this area").trim();
  // Internal workbook sheet names sometimes appear inline in otherwise-good authored prose (e.g.
  // "documented in REALITY_CHECK") - replace with a plain-language equivalent rather than leaving
  // an internal system name in customer-facing copy.
  text = text
    .replace(/^Existing PLACES\/attraction entry\s+/i, "")
    .replace(/;\s*not independently verified beyond the existing workbook naming\.?$/i, ".")
    .replace(/\bREALITY_CHECK\b/g, "the reality-check notes")
    .replace(/\bCLIMATE_MONTHLY\b/g, "the monthly climate data")
    .replace(/\bCOST_OF_LIVING\b/g, "the cost-of-living breakdown")
    .replace(/\bLIFESTYLE_FEATURES\b/g, "the lifestyle features data")
    .replace(/\bDESTINATION_FACTS\b/g, "the destination facts")
    .replace(/\bSAFETY_RISKS\b/g, "the safety-risk notes")
    .trim();
  // A leading "Rating: RAW_CODE." prefix (e.g. "Rating: LOW_CENTRAL_HIGH_OUTER.") is an internal
  // classification token, not a sentence - the remaining prose reads fine without it.
  text = text.replace(/^Rating:\s*[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*\.\s*/, "").trim();
  // A "some_snake_case_token (LEVEL)" pair (e.g. "coastal_flooding (MODERATE)") is a raw internal
  // risk/category code, not prose - humanize both the token and the level rather than removing
  // real information.
  text = text.replace(/\b([a-z]+(?:_[a-z]+)+)\s*\(([A-Z][A-Z_]*)\)/g, (_match, token: string, level: string) => {
    const humanizedToken = token.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    const humanizedLevel = level.split("_").join(" ").toLowerCase();
    return `${humanizedToken} (${humanizedLevel})`;
  });
  if (!text) return null;
  const normalized = text.toLowerCase().replace(/[_\s]+/g, "");
  if (PLACEHOLDER_TOKENS.has(normalized)) return null;
  if (containsUnpublishablePlaceholderLanguage(text)) return null;
  // A bare number (e.g. a raw "0"/"1" flag value with no unit or sentence context) is never a
  // meaningful standalone public fact when mixed into a prose list.
  if (/^-?\d+(\.\d+)?$/.test(text)) return null;
  // Same reasoning for a bare "YES"/"NO" - a raw TriState/boolean flag value with no sentence
  // context is never a meaningful standalone public fact when mixed into a prose list.
  if (/^(yes|no)$/i.test(text)) return null;
  return text;
};
