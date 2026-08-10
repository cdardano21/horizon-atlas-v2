import type { ScalarValue } from "./types";

export const NORMALIZATION_VERSION = "v1";

export type ComparableScalarPolicy = "ordinary" | "url";

export type ComparablePrimitive = null | string | number | boolean;
export interface ComparableObject {
  [key: string]: ComparableValue;
}
export type ComparableArray = readonly ComparableValue[];
export type ComparableValue = ComparablePrimitive | ComparableObject | ComparableArray;

function normalizeStringValue(value: string): string | null {
  const normalized = value.normalize("NFC").replace(/\r\n?/g, "\n").trim();
  return normalized.length === 0 ? null : normalized;
}

function normalizeNumberValue(value: number): number | null {
  if (!Number.isFinite(value)) {
    return null;
  }
  return Object.is(value, -0) ? 0 : value;
}

function normalizeUrlValue(value: string): string | null {
  const candidate = normalizeStringValue(value);
  if (candidate === null) {
    return null;
  }

  try {
    const parsed = new URL(candidate);
    const protocol = parsed.protocol.toLowerCase();
    if (protocol !== "http:" && protocol !== "https:") {
      return candidate;
    }

    const host = parsed.hostname.toLowerCase();
    const port = parsed.port;
    const defaultPort = protocol === "http:" ? "80" : "443";
    const effectiveHost = port && port !== defaultPort ? `${host}:${port}` : host;
    const pathname = parsed.pathname;
    const search = parsed.search;
    const hash = parsed.hash;

    if (pathname === "/" && search === "" && hash === "") {
      return `${protocol}//${effectiveHost}`;
    }

    return `${protocol}//${effectiveHost}${pathname}${search}${hash}`;
  } catch {
    return candidate;
  }
}

export function normalizeScalarValue(value: unknown, policy: ComparableScalarPolicy = "ordinary"): ComparablePrimitive | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    if (policy === "url") {
      return normalizeUrlValue(value);
    }
    return normalizeStringValue(value);
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return normalizeNumberValue(value);
  }

  return null;
}

export function normalizeComparable(value: unknown): unknown {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    return normalizeStringValue(value);
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return normalizeNumberValue(value);
  }

  if (Array.isArray(value)) {
    return value.map((entry) => normalizeComparable(entry));
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right));
    const normalizedObject: ComparableObject = {};
    for (const [key, item] of entries) {
      normalizedObject[key] = normalizeComparable(item) as ComparableValue;
    }
    return normalizedObject;
  }

  return value;
}
