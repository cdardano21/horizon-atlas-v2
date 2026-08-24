import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../supabase", () => ({
  isSupabaseConfigured: () => true,
  supabaseFetch: vi.fn(),
}));

vi.mock("../runtime/persisted-destination-read-runtime", () => ({
  loadPersistedDestinationFromRuntime: vi.fn(),
}));

import { getCanonicalDestination } from "../canonical-destination-loader";
import { loadPersistedDestinationFromRuntime } from "../runtime/persisted-destination-read-runtime";
import { supabaseFetch } from "../supabase";
import {
  EXPANSION_WORKBOOK_REGISTRY,
  isExpansionWorkbookPreviewEnabled,
  loadExpansionWorkbookDestinationBundle,
  loadExpansionWorkbookRawIdentity,
  resolveExpansionWorkbookDestinationKey,
  validateExpansionWorkbookRegistry,
  type ExpansionWorkbookRegistryEntry,
} from "../expansion-workbook-registry";
import { evaluateEligibility } from "../intelligence-v2/eligibility-evaluator";
import { adaptWorkbookDestinationToIntelligenceV2Facts } from "../intelligence-v2/workbook-v32-adapter";
import { loadFrozenWorkbookV31DeterministicImport } from "../workbook-v31-deterministic-core";
import { buildSparseTestWorkbook } from "./sparse-ooxml-fixture-builder";
import { createHardRequirementSelectionsWithNoneActivated } from "../intelligence-v2/profile-types";
import type { UserProfileV2 } from "../intelligence-v2/profile-types";
import { CURRENT_PROFILE_CONTRACT_VERSION } from "../intelligence-v2/versions";
import path from "node:path";

const mockedSupabaseFetch = vi.mocked(supabaseFetch);
const mockedLoadPersistedDestinationFromRuntime = vi.mocked(loadPersistedDestinationFromRuntime);

const BATCH_02_ENTRY = EXPANSION_WORKBOOK_REGISTRY.find((entry) => entry.registryId === "batch-02")!;
const BATCH02_PATH = path.resolve(process.cwd(), BATCH_02_ENTRY.workbookPath);

const EXPECTED = {
  "ascoli-piceno-it": { title: "Ascoli Piceno", country: "Italy", neighborhoods: 7, places: 20, media: 5, sources: 9 },
  "sarande-al": { title: "Sarandë", country: "Albania", neighborhoods: 6, places: 20, media: 5, sources: 21 },
  "dumaguete-ph": { title: "Dumaguete City", country: "Philippines", neighborhoods: 7, places: 20, media: 5, sources: 16 },
  "las-terrenas-do": { title: "Las Terrenas", country: "Dominican Republic", neighborhoods: 7, places: 20, media: 5, sources: 17 },
  "fairhope-al-us": { title: "Fairhope", country: "United States", neighborhoods: 7, places: 24, media: 5, sources: 17 },
} as const;

const FOREIGN_TOKENS = ["lisbon", "summerlin", "braunfels", "villages", "sofia", "vallarta", "hoi an", "queenstown"];

describe("Expansion-workbook registry validation (generic, registry-driven)", () => {
  it("the real, currently-registered preview registry is internally consistent (no duplicate keys/aliases, schema version supported, expected keys match parsed keys, SHA-256 pinned and correct)", async () => {
    const result = await validateExpansionWorkbookRegistry();
    expect(result.issues).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it("detects a destination_key registered in two workbooks (fails visibly, never silently picks one)", async () => {
    const conflictingRegistry: ExpansionWorkbookRegistryEntry[] = [
      { registryId: "entry-a", workbookPath: BATCH_02_ENTRY.workbookPath, environment: "preview", expectedDestinationKeys: ["ascoli-piceno-it"] },
      { registryId: "entry-b", workbookPath: BATCH_02_ENTRY.workbookPath, environment: "preview", expectedDestinationKeys: ["ascoli-piceno-it"] },
    ];
    const result = await validateExpansionWorkbookRegistry(conflictingRegistry);
    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.message.includes('destination_key "ascoli-piceno-it" is registered in multiple workbooks'))).toBe(true);
  });

  it("detects registered expectedDestinationKeys that don't match what the workbook actually parses to", async () => {
    const wrongRegistry: ExpansionWorkbookRegistryEntry[] = [
      { registryId: "wrong-keys", workbookPath: BATCH_02_ENTRY.workbookPath, environment: "preview", expectedDestinationKeys: ["ascoli-piceno-it", "a-key-that-does-not-exist"] },
    ];
    const result = await validateExpansionWorkbookRegistry(wrongRegistry);
    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.message.includes("a-key-that-does-not-exist"))).toBe(true);
    expect(result.issues.some((issue) => issue.message.includes("sarande-al"))).toBe(true); // undeclared-in-registry: workbook has 4 more real keys not listed
  });

  it("detects a SHA-256 mismatch against a pinned expectedSha256", async () => {
    const wrongHashRegistry: ExpansionWorkbookRegistryEntry[] = [
      { registryId: "wrong-hash", workbookPath: BATCH_02_ENTRY.workbookPath, environment: "preview", expectedDestinationKeys: [...BATCH_02_ENTRY.expectedDestinationKeys], expectedSha256: "0".repeat(64) },
    ];
    const result = await validateExpansionWorkbookRegistry(wrongHashRegistry);
    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.message.includes("SHA-256 mismatch"))).toBe(true);
  });

  it("fails clearly (never throws an opaque error) when a registered workbook path is missing/unreadable", async () => {
    const missingFileRegistry: ExpansionWorkbookRegistryEntry[] = [
      { registryId: "missing-file", workbookPath: "data/this-workbook-does-not-exist.xlsx", environment: "preview", expectedDestinationKeys: ["whatever"] },
    ];
    const result = await validateExpansionWorkbookRegistry(missingFileRegistry);
    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.registryId === "missing-file" && issue.message.includes("could not be read"))).toBe(true);
  });

  it("detects the same alias defined in two different registered workbooks", async () => {
    const conflictingAliasRegistry: ExpansionWorkbookRegistryEntry[] = [
      { registryId: "alias-a", workbookPath: BATCH_02_ENTRY.workbookPath, environment: "preview", expectedDestinationKeys: [...BATCH_02_ENTRY.expectedDestinationKeys] },
      { registryId: "alias-b", workbookPath: BATCH_02_ENTRY.workbookPath, environment: "preview", expectedDestinationKeys: [] },
    ];
    // Both entries point at the same real workbook, so every real alias it defines (e.g. "sarande-albania") is now claimed by two registryIds.
    const result = await validateExpansionWorkbookRegistry(conflictingAliasRegistry);
    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.message.includes("is defined in multiple registered workbooks"))).toBe(true);
  });
});

describe("Expansion-workbook preview resolver (registry-driven, generic getCanonicalDestination integration)", () => {
  beforeEach(() => {
    mockedSupabaseFetch.mockClear();
    mockedLoadPersistedDestinationFromRuntime.mockClear();
  });

  for (const [destinationKey, expected] of Object.entries(EXPECTED)) {
    it(`${destinationKey}: resolves through its permanent identity to the correct real destination, entirely bypassing Supabase`, async () => {
      const destination = await getCanonicalDestination(destinationKey);
      expect(destination).not.toBeNull();
      expect(destination!.title).toBe(expected.title);
      expect(destination!.country).toBe(expected.country);
      expect(destination!.v31DestinationKey).toBe(destinationKey);
      expect(mockedSupabaseFetch).not.toHaveBeenCalled();
      expect(mockedLoadPersistedDestinationFromRuntime).not.toHaveBeenCalled();
    });

    it(`${destinationKey}: rendered v31Modules contain exactly this destination's own neighborhoods/places/media/sources (no cross-contamination, no truncation)`, async () => {
      const destination = await getCanonicalDestination(destinationKey);
      expect(destination!.v31Modules!.neighborhoods).toHaveLength(expected.neighborhoods);
      expect(destination!.v31Modules!.places).toHaveLength(expected.places);
      expect(destination!.v31Modules!.media).toHaveLength(expected.media);
      expect(destination!.v31Modules!.sources).toHaveLength(expected.sources);
    });

    it(`${destinationKey}: no rendered text/media/resource field contains another destination's name or key`, async () => {
      const destination = await getCanonicalDestination(destinationKey);
      const haystack = JSON.stringify(destination).toLowerCase();
      for (const token of FOREIGN_TOKENS) {
        expect(haystack).not.toContain(token);
      }
    });
  }

  it("missing optional sheets (RESOURCES, DESTINATION_SCORES) render as empty modules, never a generic destination-specific fallback fact - blank DESTINATION_SCORES stays blank", async () => {
    const destination = await getCanonicalDestination("ascoli-piceno-it");
    expect(destination!.v31Modules!.resources).toEqual([]);
    expect(destination!.v31Modules!.scores).toEqual([]);
  });

  it("Sarandë resolves via its workbook-provided alias (sarande-albania) to the exact same permanent identity as its canonical key, never a different destination, never a fuzzy match", async () => {
    const viaAlias = await resolveExpansionWorkbookDestinationKey("sarande-albania");
    const viaAccentedName = await resolveExpansionWorkbookDestinationKey("Sarandë");
    const viaAsciiAlt = await resolveExpansionWorkbookDestinationKey("Saranda");
    expect(viaAlias).toBe("sarande-al");
    expect(viaAccentedName).toBe("sarande-al");
    expect(viaAsciiAlt).toBe("sarande-al");

    const destinationViaAlias = await getCanonicalDestination("sarande-albania");
    const destinationViaKey = await getCanonicalDestination("sarande-al");
    expect(destinationViaAlias!.v31DestinationKey).toBe("sarande-al");
    expect(destinationViaKey!.v31DestinationKey).toBe("sarande-al");
    expect(destinationViaAlias!.title).toBe(destinationViaKey!.title);
  }, 30000);

  it("Batch #1 and pilot destination keys are untouched by the expansion-workbook resolver (returns null, falls through to existing logic)", async () => {
    for (const untouchedSlug of ["lisbon-pt", "new-braunfels-tx-us", "summerlin-nv-us", "hoi-an-vn", "queenstown-nz", "the-villages-fl-us", "sofia-bg", "puerto-vallarta-mx"]) {
      expect(await resolveExpansionWorkbookDestinationKey(untouchedSlug)).toBeNull();
      expect(await loadExpansionWorkbookDestinationBundle(untouchedSlug)).toBeNull();
    }
  }, 30000);

  it("the resolver never returns a key outside the registry's own declared expectedDestinationKeys", () => {
    const allRegisteredKeys = EXPANSION_WORKBOOK_REGISTRY.flatMap((entry) => entry.expectedDestinationKeys);
    expect(allRegisteredKeys.slice().sort()).toEqual(["ascoli-piceno-it", "sarande-al", "dumaguete-ph", "las-terrenas-do", "fairhope-al-us"].sort());
  });

  it("re-resolving the same destination twice returns identical, deterministic content (no stale/randomized bundle)", async () => {
    const first = await getCanonicalDestination("dumaguete-ph");
    const second = await getCanonicalDestination("dumaguete-ph");
    const stableView = (destination: typeof first) => ({ ...destination, ai: undefined });
    expect(stableView(first)).toEqual(stableView(second));
  });
});

const EXPECTED_IDENTITY = {
  "ascoli-piceno-it": { name: "Ascoli Piceno", country: "Italy", population: "46628", elevation: "154", currency: "EUR" },
  "sarande-al": { name: "Sarandë", country: "Albania", population: "20227", elevation: "10", currency: "ALL" },
  "dumaguete-ph": { name: "Dumaguete City", country: "Philippines", population: "134103", elevation: "14", currency: "PHP" },
  "las-terrenas-do": { name: "Las Terrenas", country: "Dominican Republic", population: "25696", elevation: "17", currency: "DOP" },
  "fairhope-al-us": { name: "Fairhope", country: "United States", population: "26625", elevation: "37", currency: "USD" },
} as const;

const EXPECTED_COST = {
  "ascoli-piceno-it": { currency: "EUR", low: "2200", high: "3000" },
  "sarande-al": { currency: "EUR", low: "1850", high: "2650" },
  "dumaguete-ph": { currency: "PHP", low: "85000", high: "130000" },
  "las-terrenas-do": { currency: "USD", low: "2250", high: "3400" },
  "fairhope-al-us": { currency: "USD", low: "4500", high: "6500" },
} as const;

describe("Batch #2 identity/subtitle correctness (regression for the destination_name-vs-city fallback defect)", () => {
  for (const [destinationKey, expected] of Object.entries(EXPECTED_IDENTITY)) {
    it(`${destinationKey}: title/city/subtitle use the real destination_name, never a title-cased permanent key`, async () => {
      const destination = await getCanonicalDestination(destinationKey);
      expect(destination!.title).toBe(expected.name);
      expect(destination!.city).toBe(expected.name);
      expect(destination!.subtitle).toBe(`${expected.name}, ${expected.country}`);
      expect(destination!.subtitle).not.toMatch(/\b(It|Al|Ph|Do|Us)\b,/);
    });

    it(`${destinationKey}: real population/elevation are restored from the DESTINATIONS row (previously silently dropped), while genuinely-blank metro population stays blank`, async () => {
      const destination = await getCanonicalDestination(destinationKey);
      expect(destination!.knowledgeProfile?.population).toBe(expected.population);
      expect(destination!.knowledgeProfile?.elevation).toBe(expected.elevation);
      expect(destination!.knowledgeProfile?.metroPopulation).toBeUndefined();
    });
  }
});

describe("Batch #2 cost-of-living correctness (regression for fake Rent/Utilities/Food + wrong currency defect)", () => {
  for (const [destinationKey, expected] of Object.entries(EXPECTED_COST)) {
    it(`${destinationKey}: real currency and real total range are used; no fabricated per-category breakdown is invented`, async () => {
      const destination = await getCanonicalDestination(destinationKey);
      expect(destination!.costOfLivingProfile?.currency).toBe(expected.currency);
      expect(destination!.costOfLivingProfile?.summary).toContain(expected.currency);
      expect(destination!.costOfLivingProfile?.summary).toContain(expected.low);
      expect(destination!.costOfLivingProfile?.summary).toContain(expected.high);
      expect(destination!.costOfLivingProfile?.categories ?? []).toEqual([]);
      expect(destination!.monthlyBudgets.length).toBeGreaterThan(0);
      for (const budget of destination!.monthlyBudgets) {
        expect(budget.amount).toContain(expected.currency);
      }
    });
  }
});

describe("Batch #2 recommendation-modal neighborhood label (regression for destination.city leaking into place cards)", () => {
  it("ascoli-piceno-it: every place tied to a neighborhood resolves to that neighborhood's own real name, not the destination's name", async () => {
    const workbookImport = await loadFrozenWorkbookV31DeterministicImport(BATCH02_PATH);
    const canonical = (workbookImport.canonicalDestinations ?? []).find((d) => d.identity.destinationKey === "ascoli-piceno-it")!;
    const neighborhoodNames = new Set(canonical.neighborhoods.map((n) => n.neighborhood_name));
    const destination = await getCanonicalDestination("ascoli-piceno-it");
    expect(destination!.v31Modules!.places.length).toBeGreaterThan(0);
    const placeNeighborhoodKeys = new Set(destination!.v31Modules!.places.map((p) => p.neighborhoodKey).filter(Boolean));
    for (const key of placeNeighborhoodKeys) {
      const match = destination!.v31Modules!.neighborhoods.find((n) => n.neighborhoodKey === key);
      expect(match).toBeDefined();
      expect(neighborhoodNames.has(match!.name ?? "")).toBe(true);
      expect(match!.name).not.toBe(destination!.title);
    }
  });
});

describe("Fairhope domestic-for-US-profile (cross-check against the real workbook, independent of page rendering)", () => {
  const baseCitizenship = { primaryPassportCountryCode: "US", additionalPassportCountryCodes: [] as const };
  const singleHousehold = { type: "SINGLE" as const, dependentCount: 0, spouseOrPartnerAccompanying: false };

  function makeProfile(overrides: Partial<UserProfileV2> = {}): UserProfileV2 {
    return {
      profileContractVersion: CURRENT_PROFILE_CONTRACT_VERSION,
      stayDuration: { band: "LONG_TERM_PERMANENT", intendedStayDurationDays: null },
      activityMode: "RETIRED",
      citizenship: baseCitizenship,
      household: singleHousehold,
      budget: { monthlyTargetAmount: 3500, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" },
      tenureIntent: "BUY",
      intendsToWorkDuringStay: false,
      lifestylePreferences: [],
      hardRequirements: {
        ...createHardRequirementSelectionsWithNoneActivated(),
        foreignPropertyPurchaseEssential: true,
        propertyOwnershipRequirement: "ANY_LEGAL_RESIDENTIAL_PROPERTY",
      },
      ...overrides,
    };
  }

  it("a US-citizen profile relocating to Fairhope, AL is DOMESTIC -> the foreign-purchaser gate does not apply (never fabricated PASS/FAIL)", async () => {
    const workbookImport = await loadFrozenWorkbookV31DeterministicImport(BATCH02_PATH);
    const canonical = (workbookImport.canonicalDestinations ?? []).find((d) => d.identity.destinationKey === "fairhope-al-us")!;
    const { facts } = adaptWorkbookDestinationToIntelligenceV2Facts(canonical);
    const result = evaluateEligibility(makeProfile(), facts);
    expect(result.criteria.foreignPropertyPurchaseRights).toBeNull();
  });
});

describe("Production safety: the preview registry never activates outside preview environments", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  it("isExpansionWorkbookPreviewEnabled() is false when NODE_ENV=production", () => {
    process.env.NODE_ENV = "production";
    try {
      expect(isExpansionWorkbookPreviewEnabled()).toBe(false);
    } finally {
      process.env.NODE_ENV = originalNodeEnv;
    }
  });

  it("resolveExpansionWorkbookDestinationKey never resolves anything when NODE_ENV=production, even for a real, otherwise-valid destination_key", async () => {
    process.env.NODE_ENV = "production";
    try {
      expect(await resolveExpansionWorkbookDestinationKey("ascoli-piceno-it")).toBeNull();
      expect(await resolveExpansionWorkbookDestinationKey("sarande-albania")).toBeNull();
    } finally {
      process.env.NODE_ENV = originalNodeEnv;
    }
  });

  it("loadExpansionWorkbookDestinationBundle and loadExpansionWorkbookRawIdentity never load anything when NODE_ENV=production", async () => {
    process.env.NODE_ENV = "production";
    try {
      expect(await loadExpansionWorkbookDestinationBundle("ascoli-piceno-it")).toBeNull();
      expect(await loadExpansionWorkbookRawIdentity("ascoli-piceno-it")).toBeNull();
    } finally {
      process.env.NODE_ENV = originalNodeEnv;
    }
  });

  it("getCanonicalDestination never takes the expansion-workbook preview branch in production (falls through toward the Supabase-backed path instead)", async () => {
    process.env.NODE_ENV = "production";
    mockedSupabaseFetch.mockResolvedValueOnce({ ok: false, json: async () => [] } as unknown as Response);
    mockedSupabaseFetch.mockResolvedValueOnce({ ok: false, json: async () => [] } as unknown as Response);
    try {
      const destination = await getCanonicalDestination("ascoli-piceno-it");
      // The preview branch is skipped entirely in production; resolution instead proceeds to the
      // real Supabase-backed lookup path (mocked here to return no row), proving this registry never
      // becomes a second production source of truth - the real Ascoli Piceno identity (only available
      // via the preview workbook) must never appear.
      expect(mockedSupabaseFetch).toHaveBeenCalled();
      expect(destination?.title).not.toBe("Ascoli Piceno");
    } finally {
      process.env.NODE_ENV = originalNodeEnv;
      mockedSupabaseFetch.mockClear();
    }
  });
});

describe("Future-batch proof: a second expansion workbook can be registered with zero new loader code", () => {
  it("a synthetic second workbook resolves through the exact same generic registry functions used for Batch #2, with no batch-specific code involved", async () => {
    const syntheticFixturePath = buildSparseTestWorkbook({
      DESTINATIONS: [
        { rowNumber: 1, cells: [{ col: "A", value: "destination_key" }, { col: "B", value: "destination_name" }, { col: "C", value: "country" }] },
        { rowNumber: 2, cells: [{ col: "A", value: "synthetic-future-city-zz" }, { col: "B", value: "Synthetic Future City" }, { col: "C", value: "Testland" }] },
      ],
    });

    const syntheticRegistry: ExpansionWorkbookRegistryEntry[] = [
      { registryId: "synthetic-future-batch", workbookPath: syntheticFixturePath, environment: "preview", expectedDestinationKeys: ["synthetic-future-city-zz"] },
    ];

    const validation = await validateExpansionWorkbookRegistry(syntheticRegistry);
    expect(validation.ok).toBe(true);

    const resolvedKey = await resolveExpansionWorkbookDestinationKey("synthetic-future-city-zz", syntheticRegistry);
    expect(resolvedKey).toBe("synthetic-future-city-zz");

    const bundle = await loadExpansionWorkbookDestinationBundle("synthetic-future-city-zz", syntheticRegistry);
    expect(bundle).not.toBeNull();
    expect(bundle!.identity.name).toBe("Synthetic Future City");
    expect(bundle!.identity.country).toBe("Testland");

    const rawIdentity = await loadExpansionWorkbookRawIdentity("synthetic-future-city-zz", syntheticRegistry);
    expect(rawIdentity).not.toBeNull();
  });

  it("registering the synthetic second workbook alongside the real Batch #2 entry produces zero key/alias conflicts and keeps both fully isolated", async () => {
    const syntheticFixturePath = buildSparseTestWorkbook({
      DESTINATIONS: [
        { rowNumber: 1, cells: [{ col: "A", value: "destination_key" }, { col: "B", value: "destination_name" }, { col: "C", value: "country" }] },
        { rowNumber: 2, cells: [{ col: "A", value: "synthetic-future-city-yy" }, { col: "B", value: "Another Synthetic City" }, { col: "C", value: "Testland" }] },
      ],
    });

    const combinedRegistry: ExpansionWorkbookRegistryEntry[] = [
      ...EXPANSION_WORKBOOK_REGISTRY,
      { registryId: "synthetic-future-batch-2", workbookPath: syntheticFixturePath, environment: "preview", expectedDestinationKeys: ["synthetic-future-city-yy"] },
    ];

    const validation = await validateExpansionWorkbookRegistry(combinedRegistry);
    expect(validation.ok).toBe(true);

    // Batch #2 destinations still resolve correctly with the synthetic entry present.
    expect(await resolveExpansionWorkbookDestinationKey("ascoli-piceno-it", combinedRegistry)).toBe("ascoli-piceno-it");
    // The synthetic destination resolves too, via the exact same function, no new branch anywhere.
    expect(await resolveExpansionWorkbookDestinationKey("synthetic-future-city-yy", combinedRegistry)).toBe("synthetic-future-city-yy");
    // Cross-isolation: the synthetic workbook's destination is never returned for a Batch #2 slug and vice versa.
    expect(await resolveExpansionWorkbookDestinationKey("synthetic-future-city-yy", combinedRegistry)).not.toBe("ascoli-piceno-it");
  });
});
