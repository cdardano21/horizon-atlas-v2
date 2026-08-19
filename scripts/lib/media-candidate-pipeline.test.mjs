import { describe, expect, it } from "vitest";
import {
  adoptCandidate,
  buildAdoptionPlan,
  createCandidateId,
  createValidationContext,
  reviewCandidate,
  validateMediaCandidate,
} from "./media-candidate-pipeline.mjs";

const checkedAt = "2026-08-18T12:00:00.000Z";
const destinations = [
  { slug: "springfield-illinois-united-states", destinationKey: "springfield-il-us", city: "Springfield", country: "United States" },
  { slug: "springfield-massachusetts-united-states", destinationKey: "springfield-ma-us", city: "Springfield", country: "United States" },
  { slug: "beppu-japan", destinationKey: null, city: "Beppu", country: "Japan" },
];

function candidate(overrides = {}) {
  const base = {
    destinationSlug: "beppu-japan",
    destinationKey: null,
    city: "Beppu",
    country: "Japan",
    candidateUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Beppu_Japan.jpg/1600px-Beppu_Japan.jpg",
    canonicalSourcePage: "https://commons.wikimedia.org/wiki/File:Beppu_Japan.jpg",
    creator: "Example Photographer",
    rightsHolder: "Example Photographer",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    requiredAttribution: "Example Photographer, CC BY-SA 4.0, via Wikimedia Commons",
    width: 1600,
    height: 1067,
    mime: "image/jpeg",
    checksum: "a".repeat(64),
    sourceIdentityEvidence: {
      destinationSlug: "beppu-japan",
      articleTitle: "Beppu",
      fileTitle: "File:Beppu Japan.jpg",
      cityMatched: true,
      countryMatched: true,
      matchedTerms: ["beppu", "japan"],
    },
    discoveredAt: checkedAt,
    status: "discovered",
    review: { status: "pending", reviewer: null, reviewedAt: null },
    rejectionReason: null,
    transform: { resized: false, cropped: false },
    localDerivativePath: null,
    http: {
      status: 200,
      redirected: false,
      finalUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Beppu_Japan.jpg/1600px-Beppu_Japan.jpg",
    },
  };
  const merged = { ...base, ...overrides };
  merged.candidateId = overrides.candidateId ?? createCandidateId({
    destinationSlug: merged.destinationSlug,
    normalizedUrl: merged.candidateUrl,
    checksum: merged.checksum,
  });
  return merged;
}

function validate(value, context = createValidationContext(destinations, checkedAt)) {
  return validateMediaCandidate(value, context);
}

describe("media candidate pipeline", () => {
  it("scopes a valid candidate to its exact destination", () => {
    const result = validate(candidate());
    expect(result.status).toBe("needs_review");
    expect(result.validation.errors).toEqual([]);
    expect(result.destinationSlug).toBe("beppu-japan");
  });

  it("rejects same-name city ambiguity without country evidence", () => {
    const value = candidate({
      destinationSlug: "springfield-illinois-united-states",
      destinationKey: "springfield-il-us",
      city: "Springfield",
      country: "United States",
      sourceIdentityEvidence: {
        destinationSlug: "springfield-illinois-united-states",
        articleTitle: "Springfield",
        fileTitle: "File:Springfield skyline.jpg",
        cityMatched: true,
        countryMatched: false,
        matchedTerms: ["springfield"],
      },
    });
    const result = validate(value);
    expect(result.status).toBe("validation_failed");
    expect(result.validation.errors).toContain("same_name_city_ambiguity");
  });

  it("rejects a candidate with no compatible license", () => {
    const result = validate(candidate({ license: "", licenseUrl: "" }));
    expect(result.validation.errors).toContain("missing_or_incompatible_license");
  });

  it("rejects normalized duplicate URLs", () => {
    const context = createValidationContext(destinations, checkedAt);
    expect(validate(candidate(), context).status).toBe("needs_review");
    const duplicate = candidate({
      candidateId: "different-candidate",
      candidateUrl: `${candidate().candidateUrl}?utm_source=test`,
      checksum: "b".repeat(64),
    });
    expect(validate(duplicate, context).validation.errors).toContain("duplicate_normalized_url");
  });

  it("rejects duplicate checksums across different URLs", () => {
    const context = createValidationContext(destinations, checkedAt);
    expect(validate(candidate(), context).status).toBe("needs_review");
    const duplicate = candidate({
      candidateId: "different-candidate",
      candidateUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Beppu_Bay.jpg/1600px-Beppu_Bay.jpg",
      http: {
        status: 200,
        redirected: false,
        finalUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Beppu_Bay.jpg/1600px-Beppu_Bay.jpg",
      },
    });
    expect(validate(duplicate, context).validation.errors).toContain("duplicate_checksum");
  });

  it("rejects broken URLs", () => {
    const result = validate(candidate({ http: { status: 404, redirected: false, finalUrl: candidate().candidateUrl } }));
    expect(result.validation.errors).toContain("broken_url");
  });

  it("rejects non-image MIME types", () => {
    const result = validate(candidate({ mime: "text/html" }));
    expect(result.validation.errors).toContain("invalid_image_mime");
  });

  it("rejects missing creator and required attribution", () => {
    const result = validate(candidate({ creator: "", requiredAttribution: "" }));
    expect(result.validation.errors).toContain("missing_creator");
    expect(result.validation.errors).toContain("missing_required_attribution");
  });

  it("does not allow discovered or rejected candidates to be adopted", () => {
    expect(() => adoptCandidate(candidate(), "reviewer", checkedAt)).toThrow(/explicitly approved/);
    const reviewed = reviewCandidate(validate(candidate()), "rejected", "reviewer", checkedAt, "Weak composition");
    expect(() => adoptCandidate(reviewed, "reviewer", checkedAt)).toThrow(/explicitly approved/);
  });

  it("allows an explicitly approved candidate into a non-production adoption plan", () => {
    const approved = reviewCandidate(validate(candidate()), "approved", "reviewer", checkedAt);
    const plan = buildAdoptionPlan({ manifestId: "pilot", candidates: [approved] }, "publisher", checkedAt);
    expect(plan.destinations).toHaveLength(1);
    expect(plan.destinations[0].destinationSlug).toBe("beppu-japan");
    expect(plan.productionWritePerformed).toBe(false);
  });

  it("never leaks a candidate into another destination", () => {
    const result = validate(candidate({
      destinationSlug: "springfield-illinois-united-states",
      destinationKey: "springfield-il-us",
    }));
    expect(result.status).toBe("validation_failed");
    expect(result.validation.errors).toContain("destination_identity_mismatch");
  });
});
