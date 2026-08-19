import { createHash } from "node:crypto";

export const MEDIA_CANDIDATE_STATUSES = Object.freeze([
  "discovered",
  "validation_failed",
  "needs_review",
  "approved",
  "rejected",
  "adopted",
]);

const ALLOWED_LICENSES = new Map([
  ["cc0", "https://creativecommons.org/publicdomain/zero/1.0/"],
  ["public domain", "https://creativecommons.org/publicdomain/mark/1.0/"],
  ["cc by 2.0", "https://creativecommons.org/licenses/by/2.0/"],
  ["cc by 3.0", "https://creativecommons.org/licenses/by/3.0/"],
  ["cc by 4.0", "https://creativecommons.org/licenses/by/4.0/"],
  ["cc by-sa 2.0", "https://creativecommons.org/licenses/by-sa/2.0/"],
  ["cc by-sa 3.0", "https://creativecommons.org/licenses/by-sa/3.0/"],
  ["cc by-sa 4.0", "https://creativecommons.org/licenses/by-sa/4.0/"],
]);

const ALLOWED_IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const ALLOWED_MEDIA_HOSTS = new Set(["upload.wikimedia.org", "commons.wikimedia.org"]);
const MIN_IMAGE_WIDTH = 1000;
const MIN_IMAGE_HEIGHT = 600;

export function normalizeIdentity(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function normalizeMediaUrl(value) {
  try {
    const url = new URL(String(value ?? "").trim());
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      if (key.toLowerCase().startsWith("utm_")) url.searchParams.delete(key);
    }
    url.hostname = url.hostname.toLowerCase();
    return url.toString();
  } catch {
    return "";
  }
}

export function checksumBuffer(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

export function createCandidateId({ destinationSlug, normalizedUrl, checksum }) {
  return createHash("sha256")
    .update(`${destinationSlug}\n${normalizedUrl}\n${checksum ?? ""}`)
    .digest("hex")
    .slice(0, 24);
}

function normalizedLicense(value) {
  return normalizeIdentity(value)
    .replace(/^creative commons /, "cc ")
    .replace(/^cc by sa /, "cc by-sa ")
    .replace(/ (\d) (\d)$/, " $1.$2");
}

function normalizedComparableUrl(value) {
  return normalizeMediaUrl(value).replace(/\/$/, "");
}

function isAttributionRequired(license) {
  const normalized = normalizedLicense(license);
  return normalized !== "cc0" && normalized !== "public domain";
}

function destinationIdentityMatches(candidate, destination) {
  const evidence = candidate.sourceIdentityEvidence ?? {};
  return candidate.destinationSlug === destination.slug
    && normalizeIdentity(candidate.city) === normalizeIdentity(destination.city)
    && normalizeIdentity(candidate.country) === normalizeIdentity(destination.country)
    && evidence.cityMatched === true
    && evidence.countryMatched === true
    && evidence.destinationSlug === destination.slug;
}

function hostIsAllowed(value) {
  try {
    return ALLOWED_MEDIA_HOSTS.has(new URL(value).hostname.toLowerCase());
  } catch {
    return false;
  }
}

export function validateMediaCandidate(candidate, context) {
  const destination = context.destinations.find((item) => item.slug === candidate.destinationSlug);
  const errors = [];
  const warnings = [];
  const normalizedUrl = normalizeMediaUrl(candidate.candidateUrl);
  const finalUrl = normalizeMediaUrl(candidate.http?.finalUrl || candidate.candidateUrl);
  const license = normalizedLicense(candidate.license);
  const expectedLicenseUrl = ALLOWED_LICENSES.get(license);

  if (!destination) errors.push("unknown_destination_slug");
  if (destination && !destinationIdentityMatches(candidate, destination)) errors.push("destination_identity_mismatch");

  const sameNameDestinations = context.destinations.filter(
    (item) => normalizeIdentity(item.city) === normalizeIdentity(candidate.city),
  );
  if (sameNameDestinations.length > 1 && candidate.sourceIdentityEvidence?.countryMatched !== true) {
    errors.push("same_name_city_ambiguity");
  }

  if (!normalizedUrl || !normalizedUrl.startsWith("https://")) errors.push("invalid_candidate_url");
  if (!candidate.canonicalSourcePage || !hostIsAllowed(candidate.canonicalSourcePage)) errors.push("invalid_canonical_source_page");
  if (!candidate.creator?.trim()) errors.push("missing_creator");
  if (!license || !expectedLicenseUrl) errors.push("missing_or_incompatible_license");
  if (expectedLicenseUrl && normalizedComparableUrl(candidate.licenseUrl) !== normalizedComparableUrl(expectedLicenseUrl)) {
    errors.push("license_url_mismatch");
  }
  if (isAttributionRequired(candidate.license) && !candidate.requiredAttribution?.trim()) {
    errors.push("missing_required_attribution");
  }

  if (candidate.http?.status !== 200) errors.push("broken_url");
  if (!finalUrl || !hostIsAllowed(finalUrl)) errors.push("redirected_to_untrusted_host");
  if (candidate.http?.redirected && normalizedUrl === finalUrl) warnings.push("redirect_reported_without_url_change");
  if (!ALLOWED_IMAGE_MIME_TYPES.has(String(candidate.mime ?? "").toLowerCase())) errors.push("invalid_image_mime");
  if (!Number.isFinite(candidate.width) || candidate.width < MIN_IMAGE_WIDTH) errors.push("image_width_too_small");
  if (!Number.isFinite(candidate.height) || candidate.height < MIN_IMAGE_HEIGHT) errors.push("image_height_too_small");
  if (!/^[a-f0-9]{64}$/i.test(candidate.checksum ?? "")) errors.push("missing_or_invalid_checksum");

  const duplicateUrlOwner = context.seenNormalizedUrls.get(normalizedUrl);
  if (duplicateUrlOwner && duplicateUrlOwner !== candidate.candidateId) errors.push("duplicate_normalized_url");
  const duplicateChecksumOwner = context.seenChecksums.get(candidate.checksum);
  if (duplicateChecksumOwner && duplicateChecksumOwner !== candidate.candidateId) errors.push("duplicate_checksum");

  if (errors.length === 0) {
    context.seenNormalizedUrls.set(normalizedUrl, candidate.candidateId);
    context.seenChecksums.set(candidate.checksum, candidate.candidateId);
  }

  return {
    ...candidate,
    normalizedUrl,
    status: errors.length > 0 ? "validation_failed" : "needs_review",
    validation: {
      checkedAt: context.checkedAt,
      errors,
      warnings,
    },
    review: candidate.review ?? {
      status: "pending",
      reviewer: null,
      reviewedAt: null,
    },
    rejectionReason: errors.length > 0 ? errors.join(", ") : null,
  };
}

export function reviewCandidate(candidate, decision, reviewer, reviewedAt, reason = null) {
  if (candidate.status !== "needs_review") {
    throw new Error(`Only needs_review candidates can be reviewed; received ${candidate.status}`);
  }
  if (!reviewer?.trim()) throw new Error("A reviewer is required");
  if (decision !== "approved" && decision !== "rejected") throw new Error("Decision must be approved or rejected");
  if (decision === "rejected" && !reason?.trim()) throw new Error("A rejection reason is required");

  return {
    ...candidate,
    status: decision,
    review: {
      status: decision,
      reviewer: reviewer.trim(),
      reviewedAt,
    },
    rejectionReason: decision === "rejected" ? reason.trim() : null,
  };
}

export function adoptCandidate(candidate, adoptedBy, adoptedAt) {
  if (candidate.status !== "approved" || candidate.review?.status !== "approved") {
    throw new Error("Only explicitly approved candidates can be adopted");
  }
  if (!adoptedBy?.trim()) throw new Error("An adopter is required");

  return {
    ...candidate,
    status: "adopted",
    adoption: {
      adoptedBy: adoptedBy.trim(),
      adoptedAt,
      productionWritePerformed: false,
    },
  };
}

export function buildAdoptionPlan(manifest, adoptedBy, adoptedAt) {
  const adopted = manifest.candidates
    .filter((candidate) => candidate.status === "approved")
    .map((candidate) => adoptCandidate(candidate, adoptedBy, adoptedAt));

  return {
    schemaVersion: 1,
    sourceManifestId: manifest.manifestId,
    generatedAt: adoptedAt,
    productionWritePerformed: false,
    destinations: adopted.map((candidate) => ({
      destinationSlug: candidate.destinationSlug,
      destinationKey: candidate.destinationKey,
      candidateId: candidate.candidateId,
      candidateUrl: candidate.candidateUrl,
      localDerivativePath: candidate.localDerivativePath,
      requiredAttribution: candidate.requiredAttribution,
      license: candidate.license,
      licenseUrl: candidate.licenseUrl,
    })),
  };
}

export function createValidationContext(destinations, checkedAt) {
  return {
    destinations,
    checkedAt,
    seenNormalizedUrls: new Map(),
    seenChecksums: new Map(),
  };
}

export const MEDIA_VALIDATION_LIMITS = Object.freeze({
  allowedImageMimeTypes: [...ALLOWED_IMAGE_MIME_TYPES],
  allowedMediaHosts: [...ALLOWED_MEDIA_HOSTS],
  minimumWidth: MIN_IMAGE_WIDTH,
  minimumHeight: MIN_IMAGE_HEIGHT,
  allowedLicenses: Object.fromEntries(ALLOWED_LICENSES),
});
