import crypto from "node:crypto";

export function stableJson(value: unknown): string {
  if (value === null || value === undefined) {
    return "null";
  }

  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableJson(entry)).join(",")}]`;
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
      a.localeCompare(b),
    );
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableJson(v)}`).join(",")}}`;
  }

  return JSON.stringify(value);
}

export function buildRecordHash(payload: Record<string, unknown>): string {
  return crypto.createHash("sha256").update(stableJson(payload)).digest("hex");
}

export function buildDedupeKey(parts: string[]): string {
  return crypto.createHash("sha256").update(parts.join("|")).digest("hex");
}
