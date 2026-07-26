import { buildDedupeKey, buildRecordHash } from "./hash";
import { determineConfidence } from "./validation";
import type { NormalizedRecord, RawRecordEnvelope } from "./types";

function toIsoDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }

  return parsed.toISOString();
}

export function normalizeRawRecord(raw: RawRecordEnvelope, verificationCount = 1): NormalizedRecord {
  const normalizedAt = new Date().toISOString();
  const observedAt = toIsoDate(raw.observedAt);
  const staleDays = Math.max(0, Math.floor((Date.now() - Date.parse(observedAt)) / (1000 * 60 * 60 * 24)));

  const normalizedPayload = {
    ...raw.payload,
    category_key: raw.categoryKey,
    source_key: raw.sourceKey,
    source_record_id: raw.sourceRecordId,
  };

  return {
    destinationSlug: raw.destinationSlug,
    categoryKey: raw.categoryKey,
    sourceKey: raw.sourceKey,
    sourceRecordId: raw.sourceRecordId,
    observedAt,
    normalizedAt,
    confidenceLevel: determineConfidence(raw.categoryKey, verificationCount, staleDays),
    payload: normalizedPayload,
    dedupeKey: buildDedupeKey([raw.destinationSlug, raw.categoryKey, raw.sourceKey, raw.sourceRecordId]),
    recordHash: buildRecordHash(normalizedPayload),
  };
}
