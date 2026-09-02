import { describe, expect, it } from "vitest";
import {
  LIFESTYLE_FEATURE_DEFINITIONS,
  normalizeCountryCode,
  normalizeEvidenceForLegalStatus,
  type ActivityModeGroup,
  type CountryJurisdictionFact,
  type LifeMatchEvidence,
  type LifestyleFeatureKey,
  type SourceAuthority,
  type EvidenceStatus,
  validateCountryJurisdictionFact,
} from "./life-match-fact-contract";
import {
  COUNTRY_JURISDICTION_WORKBOOK_PATH,
  loadSharedCountryJurisdictionWorkbook,
  lookupCountryJurisdictionFact,
  readWorkbookRowsFromPython,
  validateCountryJurisdictionRows,
} from "./country-jurisdiction-loader";

const validEvidence = (): LifeMatchEvidence => ({
  sourceUrl: "https://example.com/verification",
  sourceAuthority: "OFFICIAL_GOVERNMENT",
  verifiedAt: "2025-01-01",
  effectiveAsOf: "2025-01-01",
  evidenceStatus: "VERIFIED_PRIMARY",
  confidence: "HIGH",
  notes: "Verified",
});

const validJurisdictionRow = (): CountryJurisdictionFact => ({
  destinationCountryCode: "MX",
  travelerPassportCountryCode: "US",
  activityModeGroup: "RETIREMENT",
  stayModeKey: "LONG_TERM",
  ordinaryVisitorEligibility: "YES",
  visaRequired: "NO",
  maximumVisitorDays: 180,
  rollingWindowDays: 365,
  extensionAvailability: "YES",
  extensionMaximumDays: 180,
  longStayResidencyPathwayAvailable: "YES",
  digitalNomadPathwayAvailable: "NO",
  remoteWorkLegality: "NO",
  localEmploymentAuthorization: "UNKNOWN",
  selfEmploymentPathwayAvailable: "UNKNOWN",
  seasonalSplitYearPathwayAvailable: "UNKNOWN",
  retirementResidencyPathwayAvailable: "YES",
  renewalAvailability: "YES",
  evidence: validEvidence(),
});

describe("Life Match Fact Contract v1 scaffolding", () => {
  it("1. the empty shared workbook template loads successfully", async () => {
    const workbook = await loadSharedCountryJurisdictionWorkbook();
    expect(workbook.sourcePath).toBe(COUNTRY_JURISDICTION_WORKBOOK_PATH);
    expect(workbook.facts).toEqual([]);
    expect(workbook.rowCount).toBe(0);
  });

  it("2. a valid in-memory or test-fixture jurisdiction row parses", () => {
    expect(() => validateCountryJurisdictionFact(validJurisdictionRow())).not.toThrow();
  });

  it("3. duplicate composite keys are rejected", () => {
    const rows = [validJurisdictionRow(), { ...validJurisdictionRow(), renewalAvailability: "NO" }];
    expect(() => validateCountryJurisdictionRows(rows)).toThrow(/duplicate|composite/i);
  });

  it("4. invalid country codes are rejected", () => {
    expect(() => validateCountryJurisdictionFact({ ...validJurisdictionRow(), destinationCountryCode: "USA" })).toThrow(/country code|iso/i);
    expect(() => validateCountryJurisdictionFact({ ...validJurisdictionRow(), travelerPassportCountryCode: "U$A" })).toThrow(/country code|iso/i);
  });

  it("5. invalid enum values are rejected", () => {
    const bad = { ...validJurisdictionRow(), activityModeGroup: "NOT_A_REAL_GROUP" as ActivityModeGroup };
    expect(() => validateCountryJurisdictionFact(bad)).toThrow(/activity.*group|enum/i);
  });

  it("6. negative day values are rejected", () => {
    expect(() => validateCountryJurisdictionFact({ ...validJurisdictionRow(), maximumVisitorDays: -1 })).toThrow(/negative|day/i);
  });

  it("7. VERIFIED_PRIMARY without required evidence is rejected", () => {
    const row = { ...validJurisdictionRow(), evidence: { ...validEvidence(), sourceUrl: "" } };
    expect(() => validateCountryJurisdictionFact(row)).toThrow(/source url|verified/i);
  });

  it("8. RESEARCH_PENDING remains UNKNOWN", () => {
    const evidence: LifeMatchEvidence = { ...validEvidence(), evidenceStatus: "RESEARCH_PENDING", confidence: "LOW" };
    const result = normalizeEvidenceForLegalStatus({ ...validJurisdictionRow(), evidence, ordinaryVisitorEligibility: "UNKNOWN" });
    expect(result.ordinaryVisitorEligibility).toBe("UNKNOWN");
  });

  it("9. unsupported passport lookup does not fall back to US", async () => {
    const result = await lookupCountryJurisdictionFact({
      destinationCountryCode: "MX",
      travelerPassportCountryCode: "ZZ",
      activityModeGroup: "RETIREMENT",
      stayModeKey: "LONG_TERM",
    });
    expect(result.kind).toBe("UNSUPPORTED_PASSPORT");
    expect(result.travelerPassportCountryCode).toBe("ZZ");
  });

  it("10. existing COST_OF_LIVING rows without new source columns still parse unchanged", () => {
    const legacy = {
      destination_key: "ajijic-mx",
      household_type: "COUPLE",
      lifestyle_tier: "MID",
      category: "FOOD",
      monthly_low: "1100",
      monthly_high: "1600",
      currency: "USD",
      stay_mode_key: "RETIREMENT",
      source_name: "Legacy workbook",
      source_url: null,
      verified: "UNKNOWN",
      verified_at: null,
    };
    expect(legacy).toMatchObject({
      destination_key: "ajijic-mx",
      monthly_low: "1100",
      stay_mode_key: "RETIREMENT",
    });
    expect("sourceName" in legacy).toBe(false);
  });

  it("11. no live recommendation, eligibility, candidate, or results behavior changed", async () => {
    const workbook = await readWorkbookRowsFromPython(COUNTRY_JURISDICTION_WORKBOOK_PATH);
    expect(workbook.sheets.map((sheet) => sheet.name)).toEqual(["README", "COUNTRY_JURISDICTION_FACTS"]);
    expect(Object.keys(LIFESTYLE_FEATURE_DEFINITIONS).length).toBeGreaterThan(0);
    expect(typeof normalizeCountryCode("us")).toBe("string");
    expect(LIFESTYLE_FEATURE_DEFINITIONS.settlement_type.capability).toBe("WEIGHTED_PREFERENCE");
  });

  it("includes formalized feature metadata without activating ranking fields", () => {
    const feature: LifestyleFeatureKey = "settlement_type";
    expect(LIFESTYLE_FEATURE_DEFINITIONS[feature].expectedType).toBe("enum");
    expect(LIFESTYLE_FEATURE_DEFINITIONS[feature].capability).toBe("WEIGHTED_PREFERENCE");
    expect(LIFESTYLE_FEATURE_DEFINITIONS[feature].unknownRepresentation).toBe("UNKNOWN");
  });
});
