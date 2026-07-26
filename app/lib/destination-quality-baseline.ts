import { buildDestinationVerificationReport } from "./destination-verification";
import { enrichedDestinations } from "./destination-enrichment";

const NARRATIVE_FIELDS = ["description", "overview", "climate", "lifestyle", "transportation"] as const;

type NarrativeField = (typeof NARRATIVE_FIELDS)[number];

const PLACEHOLDER_PATTERNS = [
  "not published",
  "verify before decision",
  "unknown",
  "no verified",
];

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const isPlaceholder = (value: string) => {
  const normalized = normalizeText(value);
  return PLACEHOLDER_PATTERNS.some((pattern) => normalized.includes(pattern));
};

const duplicateMapByField = () => {
  const maps = new Map<NarrativeField, Map<string, string[]>>();

  for (const field of NARRATIVE_FIELDS) {
    maps.set(field, new Map<string, string[]>());
  }

  for (const destination of enrichedDestinations) {
    for (const field of NARRATIVE_FIELDS) {
      const value = destination[field];
      const normalized = normalizeText(value);

      if (normalized.length < 30) continue;

      const fieldMap = maps.get(field)!;
      const existing = fieldMap.get(normalized) ?? [];
      existing.push(destination.slug);
      fieldMap.set(normalized, existing);
    }
  }

  return maps;
};

const scoreDestination = (input: {
  missingNarrativeFields: NarrativeField[];
  duplicateNarrativeFields: NarrativeField[];
  missingFieldsCount: number;
  imageVerificationStatus: "verified" | "review_required" | "missing";
  externalLinkStatus: "healthy" | "review_required" | "missing";
  dataConfidence: "high" | "medium" | "low" | "unknown";
}) => {
  let score = 100;

  score -= Math.min(40, input.missingFieldsCount * 4);
  score -= Math.min(20, input.missingNarrativeFields.length * 6);
  score -= Math.min(16, input.duplicateNarrativeFields.length * 4);

  if (input.imageVerificationStatus === "review_required") score -= 15;
  if (input.imageVerificationStatus === "missing") score -= 25;

  if (input.externalLinkStatus === "review_required") score -= 12;
  if (input.externalLinkStatus === "missing") score -= 20;

  if (input.dataConfidence === "medium") score -= 5;
  if (input.dataConfidence === "low") score -= 10;
  if (input.dataConfidence === "unknown") score -= 15;

  return Math.max(0, Math.min(100, score));
};

const scoreBand = (score: number) => {
  if (score >= 80) return "pass" as const;
  if (score >= 60) return "warn" as const;
  return "fail" as const;
};

export async function buildDestinationQualityBaseline() {
  const verificationReport = await buildDestinationVerificationReport();
  const verificationBySlug = new Map(verificationReport.destinations.map((row) => [row.slug, row]));
  const duplicates = duplicateMapByField();

  const rows = enrichedDestinations.map((destination) => {
    const verification = verificationBySlug.get(destination.slug);
    const missingNarrativeFields = NARRATIVE_FIELDS.filter((field) => {
      const value = destination[field]?.trim() ?? "";
      return value.length === 0 || isPlaceholder(value);
    });

    const duplicateNarrativeFields = NARRATIVE_FIELDS.filter((field) => {
      const value = destination[field];
      const normalized = normalizeText(value);
      if (normalized.length < 30) return false;
      const matches = duplicates.get(field)?.get(normalized) ?? [];
      return matches.length > 1;
    });

    const score = scoreDestination({
      missingNarrativeFields,
      duplicateNarrativeFields,
      missingFieldsCount: verification?.missingFields.length ?? 0,
      imageVerificationStatus: verification?.imageVerificationStatus ?? "missing",
      externalLinkStatus: verification?.externalLinkStatus ?? "missing",
      dataConfidence: verification?.dataConfidence ?? "unknown",
    });

    return {
      slug: destination.slug,
      city: destination.city,
      country: destination.country,
      qualityScore: score,
      qualityBand: scoreBand(score),
      dataConfidence: verification?.dataConfidence ?? "unknown",
      imageVerificationStatus: verification?.imageVerificationStatus ?? "missing",
      externalLinkStatus: verification?.externalLinkStatus ?? "missing",
      missingFields: verification?.missingFields ?? ["No verification metadata available"],
      missingNarrativeFields,
      duplicateNarrativeFields,
      duplicateNarrativeWith: Object.fromEntries(
        duplicateNarrativeFields.map((field) => {
          const slugs = duplicates
            .get(field)
            ?.get(normalizeText(destination[field]))
            ?.filter((slug) => slug !== destination.slug) ?? [];
          return [field, slugs];
        }),
      ),
      manualReviewRequired: verification?.manualReviewRequired ?? true,
      reviewReasons: verification?.reviewReasons ?? ["No verification metadata available"],
      photoVerification: verification?.imageVerification,
    };
  });

  const totals = {
    destinations: rows.length,
    pass: rows.filter((row) => row.qualityBand === "pass").length,
    warn: rows.filter((row) => row.qualityBand === "warn").length,
    fail: rows.filter((row) => row.qualityBand === "fail").length,
    manualReviewRequired: rows.filter((row) => row.manualReviewRequired).length,
    missingFieldFlags: rows.reduce((total, row) => total + row.missingFields.length, 0),
    missingNarrativeFlags: rows.reduce((total, row) => total + row.missingNarrativeFields.length, 0),
    duplicateNarrativeFlags: rows.reduce((total, row) => total + row.duplicateNarrativeFields.length, 0),
    destinationsWithDuplicateNarrative: rows.filter((row) => row.duplicateNarrativeFields.length > 0).length,
    photoReviewRequired: rows.filter((row) => row.imageVerificationStatus !== "verified").length,
    linkReviewRequired: rows.filter((row) => row.externalLinkStatus !== "healthy").length,
  };

  return {
    generatedAt: new Date().toISOString(),
    standardVersion: "destination-quality-v1",
    criteria: {
      narrativeFields: NARRATIVE_FIELDS,
      scoreBands: {
        pass: "80-100",
        warn: "60-79",
        fail: "0-59",
      },
      notes: "All destinations are scored using the same weighting for missing fields, duplicate narrative text, link/image verification, and confidence.",
    },
    totals,
    destinations: rows,
  };
}