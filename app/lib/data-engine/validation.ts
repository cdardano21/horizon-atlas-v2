import { DATA_CATEGORY_CATALOG } from "./category-catalog";
import type { ConfidenceLevel, NormalizedRecord, ValidationIssue, ValidationResult } from "./types";

const confidenceRank: Record<ConfidenceLevel, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export function determineConfidence(
  categoryKey: keyof typeof DATA_CATEGORY_CATALOG,
  verificationCount: number,
  staleDays: number,
): ConfidenceLevel {
  if (verificationCount >= 2 && staleDays <= 45) {
    return "high";
  }

  if (verificationCount >= 1 && staleDays <= 120) {
    return "medium";
  }

  return "low";
}

export function validateNormalizedRecord(record: NormalizedRecord): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!record.destinationSlug) {
    issues.push({ code: "missing_destination", message: "destinationSlug is required", field: "destinationSlug" });
  }

  if (!record.sourceKey) {
    issues.push({ code: "missing_source", message: "sourceKey is required", field: "sourceKey" });
  }

  if (!record.sourceRecordId) {
    issues.push({ code: "missing_source_record_id", message: "sourceRecordId is required", field: "sourceRecordId" });
  }

  if (!record.observedAt) {
    issues.push({ code: "missing_observed_at", message: "observedAt is required", field: "observedAt" });
  } else if (Number.isNaN(Date.parse(record.observedAt))) {
    issues.push({ code: "invalid_observed_at", message: "observedAt must be an ISO date", field: "observedAt" });
  }

  if (!record.normalizedAt || Number.isNaN(Date.parse(record.normalizedAt))) {
    issues.push({ code: "invalid_normalized_at", message: "normalizedAt must be an ISO date", field: "normalizedAt" });
  }

  if (!record.dedupeKey) {
    issues.push({ code: "missing_dedupe_key", message: "dedupeKey is required", field: "dedupeKey" });
  }

  if (!record.recordHash) {
    issues.push({ code: "missing_record_hash", message: "recordHash is required", field: "recordHash" });
  }

  if (!record.payload || Object.keys(record.payload).length === 0) {
    issues.push({ code: "missing_payload", message: "payload must not be empty", field: "payload" });
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

export function selectMoreConfident(a: NormalizedRecord, b: NormalizedRecord): NormalizedRecord {
  const aRank = confidenceRank[a.confidenceLevel];
  const bRank = confidenceRank[b.confidenceLevel];

  if (aRank !== bRank) {
    return aRank > bRank ? a : b;
  }

  return Date.parse(a.normalizedAt) >= Date.parse(b.normalizedAt) ? a : b;
}
