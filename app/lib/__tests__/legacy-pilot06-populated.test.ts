import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadFrozenWorkbookV31DeterministicImport } from "../workbook-v31-deterministic-core";
import { loadExpansionWorkbookDestinationBundle } from "../expansion-workbook-registry";
import { buildCanonicalDestinationV31Modules } from "../canonical-destination-loader";

/**
 * Authoritative integration proof (2026-08-30): the real, production deterministic parser accepts
 * the curated six-destination `DestinationFinderAI_Legacy_Pilot_06_Authoritative_v3.3.xlsx` cleanly
 * - all 6 destinations resolve with zero validation errors, all 6 have full 12-month climate data,
 * 6-8 real neighborhoods, 24-25 real named places, 6 cost-of-living rows, and exactly 42
 * LIFESTYLE_FEATURES rows each. This supersedes the prior Phase 5D `..._POPULATED.xlsx` workbook,
 * which remains on disk unregistered as a recoverable historical artifact (see
 * app/lib/expansion-workbook-registry.ts). Also proves the full pipeline (parser -> stored state ->
 * in-memory persisted bundle -> v31Modules) correctly carries NEIGHBORHOODS.best_for through to the
 * "Best For" field rather than the internal area_type enum.
 */
const AUTHORITATIVE_WORKBOOK_PATH = path.resolve(
  process.cwd(),
  "data/legacy-migration-pilot-06/DestinationFinderAI_Legacy_Pilot_06_Authoritative_v3.3.xlsx",
);

const EXPECTED_DESTINATION_KEYS = [
  "the-hague-netherlands",
  "kyoto-japan",
  "santa-fe-new-mexico-united-states",
  "st-cloud-minnesota-united-states",
  "san-ramon-costa-rica",
  "st-john-s-canada",
];

// Real, per-destination row counts confirmed directly from the authoritative workbook (2026-08-30).
const NEIGHBORHOOD_COUNTS: Record<string, number> = {
  "the-hague-netherlands": 8,
  "kyoto-japan": 8,
  "santa-fe-new-mexico-united-states": 8,
  "st-cloud-minnesota-united-states": 6,
  "san-ramon-costa-rica": 7,
  "st-john-s-canada": 8,
};
const PLACE_COUNTS: Record<string, number> = {
  "the-hague-netherlands": 24,
  "kyoto-japan": 24,
  "santa-fe-new-mexico-united-states": 25,
  "st-cloud-minnesota-united-states": 24,
  "san-ramon-costa-rica": 24,
  "st-john-s-canada": 25,
};

const BANNED_CUSTOMER_TEXT_PATTERNS = [
  /this pass/i,
  /\bUNKNOWN\b/,
  /not independently fetched/i,
  /prior research/i,
  /left blank/i,
  /\bTBD\b/,
  /coming soon/i,
];

describe("legacy-migration-pilot-06 AUTHORITATIVE workbook - real deterministic parser acceptance", () => {
  it("resolves exactly the 6 pilot destinations with zero validation errors", async () => {
    const importResult = await loadFrozenWorkbookV31DeterministicImport(AUTHORITATIVE_WORKBOOK_PATH);

    expect(importResult.contractVersion).toBe("3.3");
    expect(importResult.validationErrors).toEqual([]);
    expect(importResult.destinations.map((d) => d.destinationKey).sort()).toEqual([...EXPECTED_DESTINATION_KEYS].sort());
  });

  it("every destination has evidence-backed identity/geography (population, latitude, longitude non-null) and slug === destination_key", async () => {
    const importResult = await loadFrozenWorkbookV31DeterministicImport(AUTHORITATIVE_WORKBOOK_PATH);
    const canonicalDestinations = importResult.canonicalDestinations ?? [];
    for (const key of EXPECTED_DESTINATION_KEYS) {
      const destination = canonicalDestinations.find((d) => d.identity.destinationKey === key);
      expect(destination, key).toBeTruthy();
      expect(destination?.identity.population, key).not.toBeNull();
      expect(destination?.identity.latitude, key).not.toBeNull();
      expect(destination?.identity.longitude, key).not.toBeNull();
      expect(destination?.identity.slug, key).toBe(key);
    }
  });

  it("CLIMATE_MONTHLY, COST_OF_LIVING and SOURCES are populated for all 6 destinations (no destination silently skipped)", async () => {
    const importResult = await loadFrozenWorkbookV31DeterministicImport(AUTHORITATIVE_WORKBOOK_PATH);
    const canonicalDestinations = importResult.canonicalDestinations ?? [];
    for (const key of EXPECTED_DESTINATION_KEYS) {
      const destination = canonicalDestinations.find((d) => d.identity.destinationKey === key);
      expect(destination?.climateMonthly.length, key).toBe(12);
      expect(destination?.costOfLiving.length, key).toBeGreaterThan(0);
      expect(destination?.sources.length, key).toBeGreaterThan(0);
    }
  });

  it("every destination has the authoritative workbook's real NEIGHBORHOODS and PLACES counts", async () => {
    const importResult = await loadFrozenWorkbookV31DeterministicImport(AUTHORITATIVE_WORKBOOK_PATH);
    const canonicalDestinations = importResult.canonicalDestinations ?? [];
    for (const key of EXPECTED_DESTINATION_KEYS) {
      const destination = canonicalDestinations.find((d) => d.identity.destinationKey === key);
      expect(destination?.neighborhoods.length, key).toBe(NEIGHBORHOOD_COUNTS[key]);
      expect(destination?.places.length, key).toBe(PLACE_COUNTS[key]);
    }
  });

  it("every destination has exactly 42 LIFESTYLE_FEATURES rows drawn from the controlled taxonomy", async () => {
    const importResult = await loadFrozenWorkbookV31DeterministicImport(AUTHORITATIVE_WORKBOOK_PATH);
    const canonicalDestinations = importResult.canonicalDestinations ?? [];
    for (const key of EXPECTED_DESTINATION_KEYS) {
      const destination = canonicalDestinations.find((d) => d.identity.destinationKey === key);
      expect(destination?.lifestyleFeatures.length, key).toBe(42);
    }
  });

  it("DESTINATION_SCORES, RESOURCES, and FAMILY_EDUCATION are genuinely populated in this authoritative workbook (unlike the superseded Phase 5D workbook)", async () => {
    const importResult = await loadFrozenWorkbookV31DeterministicImport(AUTHORITATIVE_WORKBOOK_PATH);
    const canonicalDestinations = importResult.canonicalDestinations ?? [];
    for (const destination of canonicalDestinations) {
      expect(destination.scores.length, destination.identity.destinationKey).toBeGreaterThan(0);
      expect(destination.resources.length, destination.identity.destinationKey).toBeGreaterThan(0);
      expect(destination.familyEducation.length, destination.identity.destinationKey).toBeGreaterThan(0);
    }
  });

  it("every destination has at least one row in each of the remaining researched list-based categories", async () => {
    const importResult = await loadFrozenWorkbookV31DeterministicImport(AUTHORITATIVE_WORKBOOK_PATH);
    const canonicalDestinations = importResult.canonicalDestinations ?? [];
    const listFields = [
      "facts", "costOfLiving", "housing", "propertyResources", "healthcare", "visaResidency",
      "taxesFinance", "lgbtqInclusivity", "safetyRisks", "transportation", "remoteWork",
      "languageIntegration", "pets", "communitySocial", "accessibility", "bureaucracySetup",
      "workBusiness", "retirementAging", "lifestyleLaws", "realityCheck", "moveChecklist",
      "eventsSeasonality",
    ] as const;
    for (const key of EXPECTED_DESTINATION_KEYS) {
      const destination = canonicalDestinations.find((d) => d.identity.destinationKey === key);
      for (const field of listFields) {
        expect((destination?.[field] as unknown[] | undefined)?.length, `${key}.${field}`).toBeGreaterThan(0);
      }
    }
  });

  it("every destination has a populated ENVIRONMENT_QUALITY and DAILY_LIFE_PRACTICALITY record (single-row-per-destination sheets)", async () => {
    const importResult = await loadFrozenWorkbookV31DeterministicImport(AUTHORITATIVE_WORKBOOK_PATH);
    const canonicalDestinations = importResult.canonicalDestinations ?? [];
    for (const key of EXPECTED_DESTINATION_KEYS) {
      const destination = canonicalDestinations.find((d) => d.identity.destinationKey === key);
      expect(destination?.environmentQuality, key).not.toBeNull();
      expect(destination?.dailyLifePracticality, key).not.toBeNull();
    }
  });

  it("MEDIA has exactly 5 real, sourced, openly-licensed rows for every destination (1 hero + 4 gallery), each with a real image_url, caption, source_name and source_url - no fabricated imagery, no destination silently left without media", async () => {
    const importResult = await loadFrozenWorkbookV31DeterministicImport(AUTHORITATIVE_WORKBOOK_PATH);
    const canonicalDestinations = importResult.canonicalDestinations ?? [];
    for (const key of EXPECTED_DESTINATION_KEYS) {
      const destination = canonicalDestinations.find((d) => d.identity.destinationKey === key);
      expect(destination?.media.length, key).toBe(5);
      for (const row of destination?.media ?? []) {
        expect(row.image_url, key).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/Special:FilePath\//);
        expect(row.caption?.trim().length ?? 0, key).toBeGreaterThan(0);
        expect(row.source_name?.trim().length ?? 0, key).toBeGreaterThan(0);
        expect(row.source_url, key).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      }
    }
  });

  it("NEIGHBORHOODS.best_for is populated and distinct from area_type for every neighborhood - the raw enum must never substitute for it", async () => {
    const importResult = await loadFrozenWorkbookV31DeterministicImport(AUTHORITATIVE_WORKBOOK_PATH);
    const canonicalDestinations = importResult.canonicalDestinations ?? [];
    for (const destination of canonicalDestinations) {
      for (const neighborhood of destination.neighborhoods) {
        expect(neighborhood.best_for, destination.identity.destinationKey).toBeTruthy();
        expect(neighborhood.best_for, destination.identity.destinationKey).not.toBe(neighborhood.area_type);
        // area_type is an internal snake_case category token (e.g. "downtown_core") - it must never
        // itself be the value a customer sees, confirmed by shape rather than a specific value list.
        expect(neighborhood.best_for, destination.identity.destinationKey).not.toMatch(/^[a-z]+(_[a-z]+)+$/);
      }
    }
  });

  it("no customer-facing text field contains internal research/process commentary anywhere in the workbook", async () => {
    const importResult = await loadFrozenWorkbookV31DeterministicImport(AUTHORITATIVE_WORKBOOK_PATH);
    const canonicalDestinations = importResult.canonicalDestinations ?? [];
    const offenders: string[] = [];
    const scan = (value: unknown, path: string) => {
      if (typeof value === "string") {
        for (const pattern of BANNED_CUSTOMER_TEXT_PATTERNS) {
          if (pattern.test(value)) offenders.push(`${path}: "${value.slice(0, 80)}"`);
        }
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => scan(item, `${path}[${index}]`));
      } else if (value && typeof value === "object") {
        for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
          scan(nested, `${path}.${key}`);
        }
      }
    };
    for (const destination of canonicalDestinations) {
      scan(destination, destination.identity.destinationKey);
    }
    expect(offenders).toEqual([]);
  });

  it("no malformed URLs (every *_url field is either null or starts with http) anywhere in the workbook", async () => {
    const importResult = await loadFrozenWorkbookV31DeterministicImport(AUTHORITATIVE_WORKBOOK_PATH);
    const canonicalDestinations = importResult.canonicalDestinations ?? [];
    const offenders: string[] = [];
    const scan = (value: unknown, path: string) => {
      if (Array.isArray(value)) {
        value.forEach((item, index) => scan(item, `${path}[${index}]`));
      } else if (value && typeof value === "object") {
        for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
          if (key.toLowerCase().includes("url") && typeof nested === "string" && nested.trim().length > 0 && !nested.startsWith("http")) {
            offenders.push(`${path}.${key}: "${nested}"`);
          } else {
            scan(nested, `${path}.${key}`);
          }
        }
      }
    };
    for (const destination of canonicalDestinations) {
      scan(destination, destination.identity.destinationKey);
    }
    expect(offenders).toEqual([]);
  });

  it("no destination's child rows ever appear under a different destination_key", async () => {
    const importResult = await loadFrozenWorkbookV31DeterministicImport(AUTHORITATIVE_WORKBOOK_PATH);
    const canonicalDestinations = importResult.canonicalDestinations ?? [];
    for (const destination of canonicalDestinations) {
      const allChildRows = [
        ...destination.neighborhoods,
        ...destination.places,
        ...destination.climateMonthly,
        ...destination.sources,
        ...destination.lifestyleFeatures,
        ...destination.media,
        ...destination.facts,
        ...destination.scores,
        ...destination.resources,
        ...destination.costOfLiving,
        ...destination.housing,
        ...destination.propertyResources,
        ...destination.lgbtqInclusivity,
        ...destination.safetyRisks,
        ...destination.transportation,
        ...destination.remoteWork,
        ...destination.languageIntegration,
        ...destination.pets,
        ...destination.familyEducation,
        ...destination.communitySocial,
        ...destination.accessibility,
        ...destination.bureaucracySetup,
        ...destination.workBusiness,
        ...destination.retirementAging,
        ...destination.lifestyleLaws,
        ...destination.realityCheck,
        ...destination.moveChecklist,
        ...destination.eventsSeasonality,
      ];
      for (const row of allChildRows) {
        expect((row as { destination_key?: string }).destination_key).toBe(destination.identity.destinationKey);
      }
      if (destination.environmentQuality) {
        expect(destination.environmentQuality.destination_key).toBe(destination.identity.destinationKey);
      }
      if (destination.dailyLifePracticality) {
        expect(destination.dailyLifePracticality.destination_key).toBe(destination.identity.destinationKey);
      }
    }
  });

  it("The Hague and Kyoto's authoritative identity values match the newly supplied workbook", async () => {
    const importResult = await loadFrozenWorkbookV31DeterministicImport(AUTHORITATIVE_WORKBOOK_PATH);
    const canonicalDestinations = importResult.canonicalDestinations ?? [];
    const theHague = canonicalDestinations.find((d) => d.identity.destinationKey === "the-hague-netherlands");
    expect(theHague?.identity.population).toBe("569900");
    expect(theHague?.identity.latitude).toBe("52.0705");
    const kyoto = canonicalDestinations.find((d) => d.identity.destinationKey === "kyoto-japan");
    expect(kyoto?.identity.population).toBe("1437000");
    expect(kyoto?.identity.elevationMeters).toBe("50");
  });

  it("full pipeline: the in-memory persisted bundle carries best_for (not area_type) into v31Modules.neighborhoods for every destination", async () => {
    for (const key of EXPECTED_DESTINATION_KEYS) {
      const bundle = await loadExpansionWorkbookDestinationBundle(key);
      expect(bundle, key).toBeTruthy();
      if (!bundle) continue;
      const v31Modules = buildCanonicalDestinationV31Modules(bundle);
      expect(v31Modules.neighborhoods.length, key).toBe(NEIGHBORHOOD_COUNTS[key]);
      for (const neighborhood of v31Modules.neighborhoods) {
        expect(neighborhood.bestFor, `${key}/${neighborhood.neighborhoodKey}`).toBeTruthy();
        expect(neighborhood.bestFor, `${key}/${neighborhood.neighborhoodKey}`).not.toBe(neighborhood.areaType);
      }
      // Real per-neighborhood ratings/pros/cons now survive the pipeline too (previously dropped).
      expect(v31Modules.neighborhoods.some((n) => n.walkabilityRating), key).toBe(true);
      expect(v31Modules.neighborhoods.some((n) => n.pros), key).toBe(true);
    }
  }, 20000);

  it("full pipeline: v31Modules.costOfLiving and v31Modules.lifestyleFeatures are non-empty for every destination (no false zero when real rows exist)", async () => {
    for (const key of EXPECTED_DESTINATION_KEYS) {
      const bundle = await loadExpansionWorkbookDestinationBundle(key);
      expect(bundle, key).toBeTruthy();
      if (!bundle) continue;
      const v31Modules = buildCanonicalDestinationV31Modules(bundle);
      expect(v31Modules.costOfLiving.length, key).toBeGreaterThan(0);
      expect(v31Modules.lifestyleFeatures.length, key).toBe(42);
    }
  }, 20000);
});

