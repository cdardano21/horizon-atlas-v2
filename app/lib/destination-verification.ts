import type { CommandMetric, NamedRecord, ResourceRecord, ScorecardEntry, VerificationMeta } from "./destination-command-center";
import { curatedCityImagesBySlug } from "./curatedCityImages";
import { getDestinationContent } from "./destination-content";
import { enrichedDestinations } from "./destination-enrichment";
import type { Destination } from "./destinations";
import { generatedCommandCenterSeeds } from "./generated-command-center-seeds";
import type { LocalCommandCenterSeed } from "./local-command-center-seeds";
import { sanitizeExternalSourceUrl } from "./source-links";

type VerificationLevel = "verified" | "review_required" | "missing";

type SourceQualityLevel = "high" | "medium" | "low";

type ExternalLinkStatus = "healthy" | "review_required" | "missing";

export type DestinationValidationMetadata = {
  slug: string;
  city: string;
  country: string;
  lastVerifiedDate: string | null;
  dataConfidence: "high" | "medium" | "low" | "unknown";
  imageVerificationStatus: VerificationLevel;
  externalLinkStatus: ExternalLinkStatus;
  missingFields: string[];
  sourceQuality: {
    level: SourceQualityLevel;
    score: number;
    totalSources: number;
    officialSources: number;
    invalidSources: number;
  };
  imageVerification: {
    status: VerificationLevel;
    totalImages: number;
    trustedSourceImages: number;
    invalidImageUrls: number;
    duplicateImageUseCount: number;
    associationChecksPassed: number;
    associationChecksFailed: number;
    manualReviewReasons: string[];
  };
  externalLinks: {
    total: number;
    valid: number;
    invalid: number;
  };
  manualReviewRequired: boolean;
  reviewReasons: string[];
};

export type DestinationVerificationReport = {
  generatedAt: string;
  totals: {
    destinations: number;
    manualReviewRequired: number;
    imageReviewRequired: number;
    externalLinkReviewRequired: number;
    lowConfidenceDestinations: number;
    missingFieldFlags: number;
  };
  destinations: DestinationValidationMetadata[];
  imageReviewRequired: Array<{
    slug: string;
    city: string;
    country: string;
    reasons: string[];
  }>;
};

type SourceEvidence = {
  url: string | null;
  sourceType: string | null;
  confidenceLevel: "high" | "medium" | "low" | null;
};

const TRUSTED_IMAGE_HOSTS = new Set(["upload.wikimedia.org", "commons.wikimedia.org"]);

const STOCK_IMAGE_HOSTS = new Set(["images.unsplash.com", "source.unsplash.com"]);

const OFFICIAL_SOURCE_TYPES = new Set(["official_site", "government_portal", "tax_summary", "official_link"]);

const stopWords = new Set(["the", "and", "del", "de", "la", "el", "di", "da"]);

const narrativeFields: Array<keyof Destination> = ["description", "overview", "climate", "lifestyle", "transportation"];

const REQUIRED_STRUCTURED_SECTIONS: Array<{ key: keyof LocalCommandCenterSeed; label: string }> = [
  { key: "monthlyClimate", label: "Monthly climate" },
  { key: "costOfLiving", label: "Cost of living" },
  { key: "housingMetrics", label: "Housing metrics" },
  { key: "healthcareFacilities", label: "Healthcare facilities" },
  { key: "safetyMetrics", label: "Safety metrics" },
  { key: "internetMetrics", label: "Internet metrics" },
  { key: "airports", label: "Airports" },
  { key: "visaPrograms", label: "Visa programs" },
  { key: "taxRules", label: "Tax rules" },
  { key: "neighborhoods", label: "Neighborhoods" },
  { key: "resources", label: "Resources" },
  { key: "scorecard", label: "Scorecard" },
];

function normalizeForCompare(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeImageUrlForCompare(rawUrl: string | null | undefined): string | null {
  const sanitized = sanitizeExternalSourceUrl(rawUrl ?? null);
  if (!sanitized) return null;
  const parsed = new URL(sanitized);
  parsed.search = "";
  parsed.hash = "";
  return parsed.toString().toLowerCase();
}

function locationTokensForDestination(destination: Destination): string[] {
  const fromSlug = destination.slug.split("-");
  const fromCity = destination.city.toLowerCase().split(/[^a-z0-9]+/g);
  const fromCountry = destination.country.toLowerCase().split(/[^a-z0-9]+/g);
  const all = [...fromSlug, ...fromCity, ...fromCountry]
    .map((token) => token.trim())
    .filter((token) => token.length >= 3)
    .filter((token) => !stopWords.has(token));
  return Array.from(new Set(all));
}

function extractImageFilenameTokens(rawUrl: string): string[] {
  const sanitized = sanitizeExternalSourceUrl(rawUrl);
  if (!sanitized) return [];
  try {
    const parsed = new URL(sanitized);
    const filename = decodeURIComponent(parsed.pathname.split("/").pop() ?? "").toLowerCase();
    return filename
      .split(/[^a-z0-9]+/g)
      .map((token) => token.trim())
      .filter((token) => token.length >= 3);
  } catch {
    return [];
  }
}

function collectImageUrls(destination: Destination): string[] {
  const fromDestination = destination.images
    .map((image) => image.src)
    .map((src) => src.trim())
    .filter((src) => src.length > 0);

  const curated = curatedCityImagesBySlug[destination.slug];
  const combined = curated ? [curated, ...fromDestination] : fromDestination;
  return Array.from(new Set(combined));
}

async function collectPublishedImageUrls(destination: Destination): Promise<string[]> {
  const urls = new Set(collectImageUrls(destination));
  const content = await getDestinationContent(destination.slug);

  content?.destination.images.forEach((image) => {
    const src = image.src.trim();
    if (src.length > 0) {
      urls.add(src);
    }
  });

  return Array.from(urls);
}

function pushVerificationEvidence(target: SourceEvidence[], verification: VerificationMeta | null | undefined) {
  if (!verification) return;
  target.push({
    url: verification.sourceUrl ?? null,
    sourceType: verification.sourceType ?? null,
    confidenceLevel: verification.confidenceLevel ?? null,
  });
}

function pushMetricEvidence(target: SourceEvidence[], rows: CommandMetric[] | undefined) {
  rows?.forEach((row) => pushVerificationEvidence(target, row.verification));
}

function pushScoreEvidence(target: SourceEvidence[], rows: ScorecardEntry[] | undefined) {
  rows?.forEach((row) => pushVerificationEvidence(target, row.verification));
}

function pushNamedRecordEvidence(target: SourceEvidence[], rows: NamedRecord[] | undefined) {
  rows?.forEach((row) => {
    pushVerificationEvidence(target, row.verification);
    target.push({
      url: row.url ?? null,
      sourceType: row.verification.sourceType ?? null,
      confidenceLevel: row.verification.confidenceLevel ?? null,
    });
  });
}

function pushResourceEvidence(target: SourceEvidence[], rows: ResourceRecord[] | undefined) {
  rows?.forEach((row) => {
    target.push({
      url: row.url,
      sourceType: row.sourceType,
      confidenceLevel: null,
    });
  });
}

function collectSourceEvidence(seed: LocalCommandCenterSeed | undefined): SourceEvidence[] {
  if (!seed) return [];

  const evidence: SourceEvidence[] = [];

  pushMetricEvidence(evidence, seed.quickMetrics);
  pushScoreEvidence(evidence, seed.scorecard);
  pushMetricEvidence(evidence, seed.costOfLiving);
  pushMetricEvidence(evidence, seed.housingMetrics);
  pushMetricEvidence(evidence, seed.internetMetrics);
  pushMetricEvidence(evidence, seed.safetyMetrics);
  pushMetricEvidence(evidence, seed.foodMetrics);

  pushNamedRecordEvidence(evidence, seed.neighborhoods);
  pushNamedRecordEvidence(evidence, seed.healthcareFacilities);
  pushNamedRecordEvidence(evidence, seed.airports);
  pushNamedRecordEvidence(evidence, seed.golfCourses);
  pushNamedRecordEvidence(evidence, seed.recreationFacilities);
  pushNamedRecordEvidence(evidence, seed.beaches);
  pushNamedRecordEvidence(evidence, seed.foodSpots);
  pushNamedRecordEvidence(evidence, seed.schools);
  pushNamedRecordEvidence(evidence, seed.visaPrograms);
  pushNamedRecordEvidence(evidence, seed.taxRules);
  pushNamedRecordEvidence(evidence, seed.practicalInfo);

  pushResourceEvidence(evidence, seed.resources);

  return evidence;
}

function resolveSourceQuality(evidence: SourceEvidence[]) {
  const valid = evidence.filter((item) => sanitizeExternalSourceUrl(item.url) !== null);
  const invalid = evidence.length - valid.length;
  const official = evidence.filter((item) => item.sourceType && OFFICIAL_SOURCE_TYPES.has(item.sourceType)).length;
  const highConfidence = evidence.filter((item) => item.confidenceLevel === "high").length;

  if (evidence.length === 0) {
    return {
      score: 0,
      level: "low" as SourceQualityLevel,
      official,
      invalid,
    };
  }

  const validRatio = valid.length / evidence.length;
  const officialRatio = official / evidence.length;
  const highConfidenceRatio = highConfidence / evidence.length;
  const score = Math.round((validRatio * 0.4 + officialRatio * 0.4 + highConfidenceRatio * 0.2) * 100);

  const level: SourceQualityLevel = score >= 75 ? "high" : score >= 50 ? "medium" : "low";

  return {
    score,
    level,
    official,
    invalid,
  };
}

function destinationIdentityKey(destination: Destination) {
  return normalizeForCompare(`${destination.city} :: ${destination.country}`);
}

function computeDuplicateImageMap(items: Destination[], imageUrlsBySlug: Map<string, string[]>) {
  const counts = new Map<string, Set<string>>();

  items.forEach((destination) => {
    const imageUrls = imageUrlsBySlug.get(destination.slug) ?? collectImageUrls(destination);
    if (imageUrls.length === 0) return;
    const primary = normalizeImageUrlForCompare(imageUrls[0]);
    if (!primary) return;
    const entries = counts.get(primary) ?? new Set<string>();
    entries.add(destinationIdentityKey(destination));
    counts.set(primary, entries);
  });

  return counts;
}

function buildDestinationValidationMetadata(
  destination: Destination,
  duplicateMap: Map<string, Set<string>>,
  imageUrls: string[],
): DestinationValidationMetadata {
  const seed = generatedCommandCenterSeeds[destination.slug];
  const sourceEvidence = collectSourceEvidence(seed);
  const curatedImageForSlug = normalizeImageUrlForCompare(curatedCityImagesBySlug[destination.slug]);

  const sourceQuality = resolveSourceQuality(sourceEvidence);
  const totalSources = sourceEvidence.length;
  const validSources = sourceEvidence.filter((item) => sanitizeExternalSourceUrl(item.url) !== null).length;
  const invalidSources = totalSources - validSources;

  const normalizedPrimary = normalizeImageUrlForCompare(imageUrls[0]);
  const duplicateImageUseCount = normalizedPrimary ? (duplicateMap.get(normalizedPrimary)?.size ?? 0) : 0;

  const locationTokens = locationTokensForDestination(destination);

  let trustedSourceImages = 0;
  let invalidImageUrls = 0;
  let associationChecksPassed = 0;
  let associationChecksFailed = 0;
  let includesStockSource = false;

  imageUrls.forEach((url) => {
    const sanitized = sanitizeExternalSourceUrl(url);
    if (!sanitized) {
      invalidImageUrls += 1;
      return;
    }

    const host = new URL(sanitized).hostname.toLowerCase();
    if (TRUSTED_IMAGE_HOSTS.has(host)) {
      trustedSourceImages += 1;
    }
    if (STOCK_IMAGE_HOSTS.has(host)) {
      includesStockSource = true;
    }

    const filenameTokens = extractImageFilenameTokens(sanitized);
    const associationMatch = curatedImageForSlug === normalizeImageUrlForCompare(sanitized)
      || locationTokens.some((token) => filenameTokens.some((fileToken) => fileToken.includes(token) || token.includes(fileToken)));

    if (associationMatch) {
      associationChecksPassed += 1;
    } else {
      associationChecksFailed += 1;
    }
  });

  const manualImageReasons: string[] = [];
  if (imageUrls.length === 0) {
    manualImageReasons.push("No destination image URL is published.");
  }
  if (invalidImageUrls > 0) {
    manualImageReasons.push(`${invalidImageUrls} image URL(s) are malformed or blocked by sanitization.`);
  }
  if (includesStockSource) {
    manualImageReasons.push("At least one image uses a stock-image domain and requires manual destination confirmation.");
  }
  if (associationChecksFailed > 0) {
    manualImageReasons.push(`${associationChecksFailed} image URL(s) do not include a clear city/country filename association.`);
  }
  if (duplicateImageUseCount > 1 && normalizedPrimary) {
    manualImageReasons.push(`Primary image appears across ${duplicateImageUseCount} distinct destination records and requires manual uniqueness review.`);
  }

  const imageStatus: VerificationLevel = imageUrls.length === 0
    ? "missing"
    : manualImageReasons.length > 0
      ? "review_required"
      : "verified";

  const missingFields: string[] = [];
  narrativeFields.forEach((fieldName) => {
    const value = destination[fieldName];
    if (typeof value !== "string" || value.trim().length === 0) {
      missingFields.push(`Missing ${fieldName}`);
    }
  });

  const monthlyRows = destination.memberDetails?.monthlyWeather?.length ?? 0;
  const seededMonthlyRows = seed?.monthlyClimate?.length ?? 0;
  if (monthlyRows + seededMonthlyRows === 0) {
    missingFields.push("No published monthly climate rows");
  }

  if ((destination.tags?.length ?? 0) === 0) {
    missingFields.push("No destination tags");
  }

  if (!seed?.lastVerifiedAt) {
    missingFields.push("No seed-level lastVerifiedAt timestamp");
  }

  for (const section of REQUIRED_STRUCTURED_SECTIONS) {
    const rows = seed?.[section.key];
    if (!Array.isArray(rows) || rows.length === 0) {
      missingFields.push(`${section.label} not published`);
    }
  }

  if (totalSources === 0) {
    missingFields.push("No external source links");
  }

  const externalLinkStatus: ExternalLinkStatus = totalSources === 0
    ? "missing"
    : invalidSources > 0
      ? "review_required"
      : "healthy";

  const reviewReasons: string[] = [];
  if (imageStatus !== "verified") {
    reviewReasons.push("Image verification requires manual review.");
  }
  if (externalLinkStatus !== "healthy") {
    reviewReasons.push("External source links require review.");
  }
  if (seed?.dataConfidence === "low") {
    reviewReasons.push("Destination has low data confidence.");
  }
  if (missingFields.length > 0) {
    reviewReasons.push(`Missing data flags: ${missingFields.length}`);
  }

  return {
    slug: destination.slug,
    city: destination.city,
    country: destination.country,
    lastVerifiedDate: seed?.lastVerifiedAt ?? null,
    dataConfidence: seed?.dataConfidence ?? "unknown",
    imageVerificationStatus: imageStatus,
    externalLinkStatus,
    missingFields,
    sourceQuality: {
      level: sourceQuality.level,
      score: sourceQuality.score,
      totalSources,
      officialSources: sourceQuality.official,
      invalidSources: sourceQuality.invalid,
    },
    imageVerification: {
      status: imageStatus,
      totalImages: imageUrls.length,
      trustedSourceImages,
      invalidImageUrls,
      duplicateImageUseCount,
      associationChecksPassed,
      associationChecksFailed,
      manualReviewReasons: manualImageReasons,
    },
    externalLinks: {
      total: totalSources,
      valid: validSources,
      invalid: invalidSources,
    },
    manualReviewRequired: reviewReasons.length > 0,
    reviewReasons,
  };
}

export async function buildDestinationVerificationReport(): Promise<DestinationVerificationReport> {
  const publishedImageUrls = new Map<string, string[]>();

  await Promise.all(
    enrichedDestinations.map(async (destination) => {
      publishedImageUrls.set(destination.slug, await collectPublishedImageUrls(destination));
    }),
  );

  const duplicateMap = computeDuplicateImageMap(enrichedDestinations, publishedImageUrls);

  const destinationRows = enrichedDestinations
    .map((destination) => buildDestinationValidationMetadata(destination, duplicateMap, publishedImageUrls.get(destination.slug) ?? collectImageUrls(destination)))
    .sort((a, b) => {
      if (a.manualReviewRequired !== b.manualReviewRequired) {
        return a.manualReviewRequired ? -1 : 1;
      }
      return normalizeForCompare(a.slug).localeCompare(normalizeForCompare(b.slug));
    });

  const imageReviewRequired = destinationRows
    .filter((row) => row.imageVerificationStatus !== "verified")
    .map((row) => ({
      slug: row.slug,
      city: row.city,
      country: row.country,
      reasons: row.imageVerification.manualReviewReasons,
    }));

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      destinations: destinationRows.length,
      manualReviewRequired: destinationRows.filter((row) => row.manualReviewRequired).length,
      imageReviewRequired: destinationRows.filter((row) => row.imageVerificationStatus !== "verified").length,
      externalLinkReviewRequired: destinationRows.filter((row) => row.externalLinkStatus !== "healthy").length,
      lowConfidenceDestinations: destinationRows.filter((row) => row.dataConfidence === "low").length,
      missingFieldFlags: destinationRows.reduce((total, row) => total + row.missingFields.length, 0),
    },
    destinations: destinationRows,
    imageReviewRequired,
  };
}
