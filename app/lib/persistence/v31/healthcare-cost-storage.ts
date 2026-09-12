export interface HealthcareCostQualifiers {
  readonly typical_gp_visit_cost_qualifier?: string;
  readonly typical_specialist_cost_qualifier?: string;
}

function isNumeric(value: string): boolean {
  return value.trim() !== "" && Number.isFinite(Number(value));
}

function qualifier(value: string | null | undefined): string | undefined {
  if (value == null || value === "" || value.trim().toUpperCase() === "UNKNOWN" || isNumeric(value)) return undefined;
  return value;
}

export function deriveHealthcareCostQualifiers(gp: string | null | undefined, specialist: string | null | undefined): HealthcareCostQualifiers {
  const gpQualifier = qualifier(gp);
  const specialistQualifier = qualifier(specialist);
  return {
    ...(gpQualifier === undefined ? {} : { typical_gp_visit_cost_qualifier: gpQualifier }),
    ...(specialistQualifier === undefined ? {} : { typical_specialist_cost_qualifier: specialistQualifier }),
  };
}

export function healthcareNumericStorageValue(value: unknown, costQualifier: unknown): unknown {
  if (value == null || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") throw new Error("HEALTHCARE_NUMERIC_VALUE_UNSUPPORTED");
  if (value.trim().toUpperCase() === "UNKNOWN") return null;
  if (isNumeric(value)) return value;
  if (costQualifier === value) return null;
  throw new Error(`HEALTHCARE_NUMERIC_QUALIFIER_NOT_PRESERVED:${value}`);
}

export function readHealthcareCostQualifiers(value: unknown): HealthcareCostQualifiers {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const metadata = value as Record<string, unknown>;
  return {
    ...(typeof metadata.typical_gp_visit_cost_qualifier === "string" ? { typical_gp_visit_cost_qualifier: metadata.typical_gp_visit_cost_qualifier } : {}),
    ...(typeof metadata.typical_specialist_cost_qualifier === "string" ? { typical_specialist_cost_qualifier: metadata.typical_specialist_cost_qualifier } : {}),
  };
}

export function restoreHealthcareCostValue(value: unknown, costQualifier: string | undefined): string | null {
  if (value != null) return String(value);
  return costQualifier ?? null;
}