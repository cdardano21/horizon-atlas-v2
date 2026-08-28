import { describe, expect, it } from "vitest";
import type { CanonicalDestinationKey, DestinationId, PersistedPresenceModuleKey, ResolvedDestinationIdentity } from "../types";
import type { PersistedDestinationReadPort } from "../persisted-destination-read-port";
import { loadNormalizedPersistedDestinationBundle } from "../load-normalized-persisted-destination-bundle";
import { materializeStoredDestinationStateFromNormalizedPersistedBundle } from "../materialize-stored-destination-state";

type TestRootRow = {
  readonly destinationId: string;
  readonly destinationKey: string;
  readonly slug: string | null;
  readonly name: string | null;
  readonly city: string | null;
  readonly country: string | null;
};

type TestProfileRow = {
  readonly destinationId: string;
  readonly destinationKey: string;
  readonly profileStorageVersion: number | null;
  readonly identityName: string | null;
  readonly shortDescription: string | null;
  readonly longDescription: string | null;
  readonly currency: string | null;
  readonly primaryLanguage: string | null;
  readonly timeZone: string | null;
};

type TestPresenceRow = {
  readonly destinationId: string;
  readonly destinationKey: string;
  readonly module: PersistedPresenceModuleKey;
};

type TestKeyedChildren = {
  readonly facts: readonly { readonly destinationId: string; readonly destinationKey: string; readonly factKey: string; readonly factGroup: string | null; readonly valueText: string | null; readonly displayLabel: string | null; readonly sourceName: string | null }[];
  readonly scores: readonly { readonly destinationId: string; readonly destinationKey: string; readonly scoreKey: string; readonly scoreValue: string | null; readonly scoreLabel: string | null; readonly methodologyVersion: string | null; readonly verified?: string | null; readonly verifiedAt?: string | null }[];
  readonly neighborhoods: readonly { readonly destinationId: string; readonly destinationKey: string; readonly neighborhoodKey: string; readonly name: string | null; readonly summary: string | null; readonly areaType: string | null }[];
  readonly places: readonly { readonly destinationId: string; readonly destinationKey: string; readonly placeKey: string; readonly category: string | null; readonly name: string | null; readonly description: string | null }[];
  readonly resources: readonly { readonly destinationId: string; readonly destinationKey: string; readonly resourceKey: string; readonly category: string | null; readonly name: string | null; readonly url: string | null }[];
  readonly media: readonly { readonly destinationId: string; readonly destinationKey: string; readonly mediaKey: string; readonly kind: string | null; readonly url: string | null; readonly caption: string | null; readonly altText: string | null }[];
  readonly propertyResources: readonly { readonly destinationId: string; readonly destinationKey: string; readonly itemKey: string; readonly category: string | null; readonly name: string | null; readonly url: string | null }[];
  readonly moveChecklist: readonly { readonly destinationId: string; readonly destinationKey: string; readonly checklistKey: string; readonly summary: string | null; readonly checklistNotes: string | null }[];
  readonly eventsSeasonality: readonly { readonly destinationId: string; readonly destinationKey: string; readonly eventSeasonalityKey: string; readonly summary: string | null; readonly seasonalityNotes: string | null }[];
  readonly sources: readonly { readonly destinationId: string; readonly destinationKey: string; readonly sourceKey: string; readonly name: string | null; readonly url: string | null; readonly type: string | null }[];
};

type TestReplaceModules = {
  readonly costOfLiving: readonly { readonly destinationId: string; readonly destinationKey: string; readonly itemKey: string; readonly category: string | null; readonly monthlyLow: string | null; readonly monthlyHigh: string | null; readonly currency: string | null }[];
  readonly climateMonthly: readonly { readonly destinationId: string; readonly destinationKey: string; readonly monthKey: string; readonly avgHighTemp: string | null; readonly avgLowTemp: string | null; readonly precipitationMm: string | null; readonly humidityPct: string | null }[];
  readonly housing: readonly { readonly destinationId: string; readonly destinationKey: string; readonly summary: string | null; readonly buyingSummary: string | null; readonly rentalSummary: string | null; readonly canForeignersBuy?: string | null; readonly residencyRequiredToBuy?: string | null; readonly stayModeKey?: string | null; readonly verified?: string | null; readonly verifiedAt?: string | null }[];
  readonly healthcare: readonly { readonly destinationId: string; readonly destinationKey: string; readonly summary: string | null; readonly publicAccessSummary: string | null; readonly insuranceSummary: string | null }[];
  readonly visaResidency: readonly { readonly destinationId: string; readonly destinationKey: string; readonly summary: string | null; readonly residencyPath: string | null; readonly citizenshipPath: string | null; readonly travelerNationality?: string | null; readonly stayModeKey?: string | null; readonly verified?: string | null; readonly verifiedAt?: string | null }[];
  readonly taxesFinance: readonly { readonly destinationId: string; readonly destinationKey: string; readonly summary: string | null; readonly notes: string | null }[];
  readonly lgbtqInclusivity: readonly { readonly destinationId: string; readonly destinationKey: string; readonly position: number; readonly summary: string | null; readonly culturalNotes: string | null }[];
  readonly safetyRisks: readonly { readonly destinationId: string; readonly destinationKey: string; readonly itemKey: string; readonly topic: string | null; readonly severity: string | null; readonly summary: string | null }[];
  readonly transportation: readonly { readonly destinationId: string; readonly destinationKey: string; readonly summary: string | null; readonly airportSummary: string | null; readonly transitSummary: string | null; readonly nonstopUsService?: string | null; readonly topic?: string | null; readonly verified?: string | null; readonly verifiedAt?: string | null }[];
  readonly remoteWork: readonly { readonly destinationId: string; readonly destinationKey: string; readonly summary: string | null; readonly internetSummary: string | null; readonly timezoneSummary: string | null; readonly fiberAvailable?: string | null; readonly verified?: string | null; readonly verifiedAt?: string | null }[];
  readonly languageIntegration: readonly { readonly destinationId: string; readonly destinationKey: string; readonly position: number; readonly summary: string | null; readonly englishSupport: string | null; readonly primaryLanguage?: string | null; readonly verified?: string | null; readonly verifiedAt?: string | null }[];
  readonly pets: readonly { readonly destinationId: string; readonly destinationKey: string; readonly position: number; readonly summary: string | null; readonly petFriendlyNotes: string | null }[];
  readonly familyEducation: readonly { readonly destinationId: string; readonly destinationKey: string; readonly position: number; readonly summary: string | null; readonly schoolsSummary: string | null }[];
  readonly communitySocial: readonly { readonly destinationId: string; readonly destinationKey: string; readonly position: number; readonly summary: string | null; readonly socialNotes: string | null; readonly expatPresence?: string | null; readonly verified?: string | null; readonly verifiedAt?: string | null }[];
  readonly accessibility: readonly { readonly destinationId: string; readonly destinationKey: string; readonly position: number; readonly summary: string | null; readonly mobilityNotes: string | null }[];
  readonly bureaucracySetup: readonly { readonly destinationId: string; readonly destinationKey: string; readonly position: number; readonly summary: string | null; readonly setupNotes: string | null }[];
  readonly workBusiness: readonly { readonly destinationId: string; readonly destinationKey: string; readonly position: number; readonly summary: string | null; readonly remoteWorkNotes: string | null }[];
  readonly retirementAging: readonly { readonly destinationId: string; readonly destinationKey: string; readonly position: number; readonly summary: string | null; readonly agingNotes: string | null }[];
  readonly lifestyleLaws: readonly { readonly destinationId: string; readonly destinationKey: string; readonly position: number; readonly summary: string | null; readonly legalNotes: string | null }[];
  readonly realityCheck: readonly { readonly destinationId: string; readonly destinationKey: string; readonly itemKey: string; readonly title: string | null; readonly detail: string | null; readonly severity: string | null }[];
  readonly moveChecklist: readonly { readonly destinationId: string; readonly destinationKey: string; readonly checklistKey: string; readonly summary: string | null; readonly checklistNotes: string | null }[];
  readonly environmentQuality: readonly { readonly destinationId: string; readonly destinationKey: string; readonly summary: string | null; readonly qualityNotes: string | null }[];
  readonly dailyLifePracticality: readonly { readonly destinationId: string; readonly destinationKey: string; readonly summary: string | null; readonly practicalityNotes: string | null }[];
  readonly eventsSeasonality: readonly { readonly destinationId: string; readonly destinationKey: string; readonly eventSeasonalityKey: string; readonly summary: string | null; readonly seasonalityNotes: string | null }[];
  readonly sources: readonly { readonly destinationId: string; readonly destinationKey: string; readonly sourceKey: string; readonly name: string | null; readonly url: string | null; readonly type: string | null }[];
};

type TestSingletonRows = {
  readonly environmentQuality: readonly { readonly destinationId: string; readonly destinationKey: string; readonly summary: string | null; readonly qualityNotes: string | null }[];
  readonly dailyLifePracticality: readonly { readonly destinationId: string; readonly destinationKey: string; readonly summary: string | null; readonly practicalityNotes: string | null }[];
};

type TestReadPortState = {
  readonly root: TestRootRow | null;
  readonly profile: TestProfileRow | null;
  readonly presence: readonly TestPresenceRow[];
  readonly keyedChildren: TestKeyedChildren;
  readonly replaceModules: TestReplaceModules;
  readonly singletons: TestSingletonRows;
  readonly rootError?: { readonly reason: "DB_READ_FAILED" } | null;
  readonly profileError?: { readonly reason: "DB_READ_FAILED" } | null;
  readonly presenceError?: { readonly reason: "DB_READ_FAILED" } | null;
  readonly keyedChildrenError?: { readonly reason: "DB_READ_FAILED"; readonly module: PersistedPresenceModuleKey } | null;
  readonly replaceModulesError?: { readonly reason: "DB_READ_FAILED"; readonly module: PersistedPresenceModuleKey } | null;
  readonly singletonsError?: { readonly reason: "DB_READ_FAILED"; readonly module: PersistedPresenceModuleKey } | null;
};

class FakePersistedDestinationReadPort implements PersistedDestinationReadPort {
  readonly callLog: string[] = [];

  constructor(private readonly state: TestReadPortState) {}

  async readRoot(identity: ResolvedDestinationIdentity) {
    this.callLog.push("readRoot");
    if (this.state.rootError) {
      return { ok: false as const, error: this.state.rootError };
    }
    return { ok: true as const, value: this.state.root ? { ...this.state.root } : null };
  }

  async readProfile(identity: ResolvedDestinationIdentity) {
    this.callLog.push("readProfile");
    if (this.state.profileError) {
      return { ok: false as const, error: this.state.profileError };
    }
    return { ok: true as const, value: this.state.profile ? { ...this.state.profile } : null };
  }

  async readPresence(identity: ResolvedDestinationIdentity) {
    this.callLog.push("readPresence");
    if (this.state.presenceError) {
      return { ok: false as const, error: this.state.presenceError };
    }
    return { ok: true as const, value: this.state.presence.map((row) => ({ ...row })) };
  }

  async readKeyedChildren(identity: ResolvedDestinationIdentity) {
    this.callLog.push("readKeyedChildren");
    if (this.state.keyedChildrenError) {
      return { ok: false as const, error: this.state.keyedChildrenError };
    }
    return { ok: true as const, value: { ...this.state.keyedChildren } };
  }

  async readReplaceModules(identity: ResolvedDestinationIdentity) {
    this.callLog.push("readReplaceModules");
    if (this.state.replaceModulesError) {
      return { ok: false as const, error: this.state.replaceModulesError };
    }
    return { ok: true as const, value: { ...this.state.replaceModules } };
  }

  async readSingletons(identity: ResolvedDestinationIdentity) {
    this.callLog.push("readSingletons");
    if (this.state.singletonsError) {
      return { ok: false as const, error: this.state.singletonsError };
    }
    return { ok: true as const, value: { ...this.state.singletons } };
  }
}

function createIdentity(destinationKey = "dest-a", destinationId = "dest-id-a"): ResolvedDestinationIdentity {
  return { destinationKey: destinationKey as CanonicalDestinationKey, destinationId: destinationId as DestinationId };
}

function createDefaultState(overrides: Partial<TestReadPortState> = {}): TestReadPortState {
  const identity = createIdentity();
  return {
    root: {
      destinationId: identity.destinationId,
      destinationKey: identity.destinationKey,
      slug: "braunfels",
      name: "Braunfels",
      city: "Braunfels",
      country: "United States",
    },
    profile: {
      destinationId: identity.destinationId,
      destinationKey: identity.destinationKey,
      profileStorageVersion: 1,
      identityName: null,
      shortDescription: null,
      longDescription: null,
      currency: null,
      primaryLanguage: null,
      timeZone: null,
    },
    presence: [
      { destinationId: identity.destinationId, destinationKey: identity.destinationKey, module: "facts" },
      { destinationId: identity.destinationId, destinationKey: identity.destinationKey, module: "scores" },
      { destinationId: identity.destinationId, destinationKey: identity.destinationKey, module: "neighborhoods" },
      { destinationId: identity.destinationId, destinationKey: identity.destinationKey, module: "places" },
      { destinationId: identity.destinationId, destinationKey: identity.destinationKey, module: "resources" },
      { destinationId: identity.destinationId, destinationKey: identity.destinationKey, module: "media" },
      { destinationId: identity.destinationId, destinationKey: identity.destinationKey, module: "propertyResources" },
      { destinationId: identity.destinationId, destinationKey: identity.destinationKey, module: "moveChecklist" },
      { destinationId: identity.destinationId, destinationKey: identity.destinationKey, module: "eventsSeasonality" },
      { destinationId: identity.destinationId, destinationKey: identity.destinationKey, module: "sources" },
      { destinationId: identity.destinationId, destinationKey: identity.destinationKey, module: "costOfLiving" },
      { destinationId: identity.destinationId, destinationKey: identity.destinationKey, module: "climateMonthly" },
      { destinationId: identity.destinationId, destinationKey: identity.destinationKey, module: "housing" },
      { destinationId: identity.destinationId, destinationKey: identity.destinationKey, module: "healthcare" },
      { destinationId: identity.destinationId, destinationKey: identity.destinationKey, module: "visaResidency" },
      { destinationId: identity.destinationId, destinationKey: identity.destinationKey, module: "taxesFinance" },
      { destinationId: identity.destinationId, destinationKey: identity.destinationKey, module: "lgbtqInclusivity" },
      { destinationId: identity.destinationId, destinationKey: identity.destinationKey, module: "safetyRisks" },
      { destinationId: identity.destinationId, destinationKey: identity.destinationKey, module: "transportation" },
      { destinationId: identity.destinationId, destinationKey: identity.destinationKey, module: "remoteWork" },
      { destinationId: identity.destinationId, destinationKey: identity.destinationKey, module: "languageIntegration" },
      { destinationId: identity.destinationId, destinationKey: identity.destinationKey, module: "pets" },
      { destinationId: identity.destinationId, destinationKey: identity.destinationKey, module: "familyEducation" },
      { destinationId: identity.destinationId, destinationKey: identity.destinationKey, module: "communitySocial" },
      { destinationId: identity.destinationId, destinationKey: identity.destinationKey, module: "accessibility" },
      { destinationId: identity.destinationId, destinationKey: identity.destinationKey, module: "bureaucracySetup" },
      { destinationId: identity.destinationId, destinationKey: identity.destinationKey, module: "workBusiness" },
      { destinationId: identity.destinationId, destinationKey: identity.destinationKey, module: "retirementAging" },
      { destinationId: identity.destinationId, destinationKey: identity.destinationKey, module: "lifestyleLaws" },
      { destinationId: identity.destinationId, destinationKey: identity.destinationKey, module: "realityCheck" },
      { destinationId: identity.destinationId, destinationKey: identity.destinationKey, module: "environmentQuality" },
      { destinationId: identity.destinationId, destinationKey: identity.destinationKey, module: "dailyLifePracticality" },
      { destinationId: identity.destinationId, destinationKey: identity.destinationKey, module: "lifestyleFeatures" },
    ],
    keyedChildren: {
      facts: [],
      scores: [],
      neighborhoods: [],
      places: [],
      resources: [],
      media: [],
      propertyResources: [],
      moveChecklist: [],
      eventsSeasonality: [],
      sources: [],
    },
    replaceModules: {
      costOfLiving: [],
      climateMonthly: [],
      housing: [],
      healthcare: [],
      visaResidency: [],
      taxesFinance: [],
      lgbtqInclusivity: [],
      safetyRisks: [],
      transportation: [],
      remoteWork: [],
      languageIntegration: [],
      pets: [],
      familyEducation: [],
      communitySocial: [],
      accessibility: [],
      bureaucracySetup: [],
      workBusiness: [],
      retirementAging: [],
      lifestyleLaws: [],
      realityCheck: [],
      moveChecklist: [],
      environmentQuality: [],
      dailyLifePracticality: [],
      eventsSeasonality: [],
      sources: [],
    },
    singletons: {
      environmentQuality: [{ destinationId: identity.destinationId, destinationKey: identity.destinationKey, summary: "air quality", qualityNotes: "water quality" }],
      dailyLifePracticality: [{ destinationId: identity.destinationId, destinationKey: identity.destinationKey, summary: "life is fine", practicalityNotes: "go for it" }],
    },
    ...overrides,
  };
}

describe("loadNormalizedPersistedDestinationBundle", () => {
  it("returns a complete normalized bundle for a fully initialized destination", async () => {
    const identity = createIdentity();
    const readPort = new FakePersistedDestinationReadPort(createDefaultState());

    const result = await loadNormalizedPersistedDestinationBundle(identity, readPort);

    expect(result.outcome).toBe("SUCCESS");
    if (result.outcome !== "SUCCESS") {
      throw new Error("Expected success");
    }
    expect(result.bundle.destinationKey).toBe(identity.destinationKey);
    expect(result.bundle.identity).toEqual({ slug: "braunfels", name: "Braunfels", city: "Braunfels", country: "United States" });
    expect(result.bundle.facts).toEqual([]);
    expect(result.bundle.environmentQuality).toEqual({ summary: "air quality", qualityNotes: "water quality" });
    expect(result.bundle.dailyLifePracticality).toEqual({ summary: "life is fine", practicalityNotes: "go for it" });
  });

  it("REQUIRED TEST 7 - preserves representative new parity fields end-to-end through the real bundle assembly", async () => {
    const identity = createIdentity();
    const readPort = new FakePersistedDestinationReadPort(createDefaultState({
      replaceModules: {
        costOfLiving: [], climateMonthly: [],
        housing: [{ destinationId: identity.destinationId, destinationKey: identity.destinationKey, summary: "housing summary", buyingSummary: null, rentalSummary: null, canForeignersBuy: "Yes", residencyRequiredToBuy: "No", stayModeKey: "LONG_TERM_PERMANENT", verified: "true", verifiedAt: "2026-08-07" }],
        healthcare: [],
        visaResidency: [{ destinationId: identity.destinationId, destinationKey: identity.destinationKey, summary: "visa summary", residencyPath: null, citizenshipPath: null, travelerNationality: "U.S. citizen", stayModeKey: "SHORT_1_3_MONTHS", verified: "true", verifiedAt: "2026-08-07" }],
        taxesFinance: [], lgbtqInclusivity: [], safetyRisks: [],
        transportation: [{ destinationId: identity.destinationId, destinationKey: identity.destinationKey, summary: "transport summary", airportSummary: null, transitSummary: null, nonstopUsService: "true", topic: "airport", verified: "true", verifiedAt: "2026-08-09" }],
        remoteWork: [{ destinationId: identity.destinationId, destinationKey: identity.destinationKey, summary: "remote summary", internetSummary: null, timezoneSummary: null, fiberAvailable: "Widely available", verified: "true", verifiedAt: "2026-08-07" }],
        languageIntegration: [{ destinationId: identity.destinationId, destinationKey: identity.destinationKey, position: 1, summary: "language summary", englishSupport: null, primaryLanguage: "Portuguese", verified: "true", verifiedAt: "2026-08-08" }],
        pets: [], familyEducation: [],
        communitySocial: [{ destinationId: identity.destinationId, destinationKey: identity.destinationKey, position: 1, summary: "community summary", socialNotes: null, expatPresence: "High", verified: "true", verifiedAt: "2026-08-08" }],
        accessibility: [], bureaucracySetup: [], workBusiness: [], retirementAging: [], lifestyleLaws: [], realityCheck: [],
        moveChecklist: [], environmentQuality: [], dailyLifePracticality: [], eventsSeasonality: [], sources: [],
      },
      keyedChildren: {
        facts: [], neighborhoods: [], places: [], resources: [], media: [], propertyResources: [], moveChecklist: [], eventsSeasonality: [], sources: [],
        scores: [{ destinationId: identity.destinationId, destinationKey: identity.destinationKey, scoreKey: "retirement", scoreValue: "90", scoreLabel: "Excellent", methodologyVersion: "pilot-v3", verified: "false", verifiedAt: "2026-08-08" }],
      },
    }));

    const result = await loadNormalizedPersistedDestinationBundle(identity, readPort);
    expect(result.outcome).toBe("SUCCESS");
    if (result.outcome !== "SUCCESS") {
      throw new Error("Expected success");
    }

    const storedState = materializeStoredDestinationStateFromNormalizedPersistedBundle(result.bundle);
    expect(storedState.visaResidency[0].travelerNationality).toBe("U.S. citizen");
    expect(storedState.visaResidency[0].stayModeKey).toBe("SHORT_1_3_MONTHS");
    expect(storedState.visaResidency[0].verified).toBe("true");
    expect(storedState.housing[0].canForeignersBuy).toBe("Yes");
    expect(storedState.remoteWork[0].fiberAvailable).toBe("Widely available");
    expect(storedState.languageIntegration[0].primaryLanguage).toBe("Portuguese");
    expect(storedState.communitySocial[0].expatPresence).toBe("High");
    expect(storedState.transportation[0].nonstopUsService).toBe("true");
    expect(storedState.scores[0].verified).toBe("false");
    expect(storedState.scores[0].verifiedAt).toBe("2026-08-08");
  });

  it("returns DESTINATION_NOT_FOUND when the root record is missing", async () => {
    const readPort = new FakePersistedDestinationReadPort(createDefaultState({ root: null }));
    const result = await loadNormalizedPersistedDestinationBundle(createIdentity(), readPort);

    expect(result).toEqual({
      outcome: "FAILED",
      failure: {
        reason: "DESTINATION_NOT_FOUND",
        destinationIdentity: createIdentity(),
      },
    });
  });

  it("returns DB_READ_FAILED for a root transport failure", async () => {
    const readPort = new FakePersistedDestinationReadPort(createDefaultState({ rootError: { reason: "DB_READ_FAILED" } }));
    const result = await loadNormalizedPersistedDestinationBundle(createIdentity(), readPort);

    expect(result).toEqual({
      outcome: "FAILED",
      failure: {
        reason: "DB_READ_FAILED",
        destinationIdentity: createIdentity(),
      },
    });
  });

  it("returns MALFORMED_PERSISTED_STATE for a root identity mismatch", async () => {
    const readPort = new FakePersistedDestinationReadPort(createDefaultState({
      root: {
        destinationId: "other-id",
        destinationKey: "dest-b",
        slug: null,
        name: null,
        city: null,
        country: null,
      },
    }));

    const result = await loadNormalizedPersistedDestinationBundle(createIdentity(), readPort);
    expect(result.outcome).toBe("FAILED");
    if (result.outcome !== "FAILED") {
      throw new Error("Expected failure");
    }
    expect(result.failure.reason).toBe("MALFORMED_PERSISTED_STATE");
  });

  it("returns INCOMPLETE_PERSISTED_STATE when the profile is missing", async () => {
    const readPort = new FakePersistedDestinationReadPort(createDefaultState({ profile: null }));
    const result = await loadNormalizedPersistedDestinationBundle(createIdentity(), readPort);
    expect(result.outcome).toBe("FAILED");
    if (result.outcome !== "FAILED") {
      throw new Error("Expected failure");
    }
    expect(result.failure.reason).toBe("INCOMPLETE_PERSISTED_STATE");
  });

  it("returns UNSUPPORTED_LEGACY_STATE for a legacy profile version", async () => {
    const readPort = new FakePersistedDestinationReadPort(createDefaultState({ profile: { destinationId: createIdentity().destinationId, destinationKey: createIdentity().destinationKey, profileStorageVersion: null, identityName: null, shortDescription: null, longDescription: null, currency: null, primaryLanguage: null, timeZone: null } }));
    const result = await loadNormalizedPersistedDestinationBundle(createIdentity(), readPort);
    expect(result.outcome).toBe("FAILED");
    if (result.outcome !== "FAILED") {
      throw new Error("Expected failure");
    }
    expect(result.failure.reason).toBe("UNSUPPORTED_LEGACY_STATE");
  });

  it("preserves authoritative null profile fields when profile version is 1", async () => {
    const readPort = new FakePersistedDestinationReadPort(createDefaultState());
    const result = await loadNormalizedPersistedDestinationBundle(createIdentity(), readPort);
    expect(result.outcome).toBe("SUCCESS");
    if (result.outcome !== "SUCCESS") {
      throw new Error("Expected success");
    }
    expect(result.bundle.editorial.currency).toBeNull();
    expect(result.bundle.editorial.primaryLanguage).toBeNull();
    expect(result.bundle.editorial.timeZone).toBeNull();
    expect(result.bundle.editorial.shortDescription).toBeNull();
    expect(result.bundle.editorial.longDescription).toBeNull();
  });

  it("surfaces the persisted editorial shortDescription/longDescription into the bundle instead of hardcoding null", async () => {
    const readPort = new FakePersistedDestinationReadPort(createDefaultState({
      profile: {
        destinationId: createIdentity().destinationId,
        destinationKey: createIdentity().destinationKey,
        profileStorageVersion: 1,
        identityName: null,
        shortDescription: "A real persisted short description.",
        longDescription: "A real persisted long description.",
        currency: "USD",
        primaryLanguage: "English",
        timeZone: "America/Chicago",
      },
    }));
    const result = await loadNormalizedPersistedDestinationBundle(createIdentity(), readPort);
    expect(result.outcome).toBe("SUCCESS");
    if (result.outcome !== "SUCCESS") {
      throw new Error("Expected success");
    }
    expect(result.bundle.editorial.shortDescription).toBe("A real persisted short description.");
    expect(result.bundle.editorial.longDescription).toBe("A real persisted long description.");
  });

  it("returns MALFORMED_PERSISTED_STATE when a presence row has a mismatched destinationId", async () => {
    const baseState = createDefaultState();
    const presence: readonly TestPresenceRow[] = baseState.presence.map((row): TestPresenceRow => (row.module === "facts" ? { ...row, destinationId: "other-id" } : row));
    const readPort = new FakePersistedDestinationReadPort(createDefaultState({ presence }));
    const result = await loadNormalizedPersistedDestinationBundle(createIdentity(), readPort);
    expect(result.outcome).toBe("FAILED");
    if (result.outcome !== "FAILED") {
      throw new Error("Expected failure");
    }
    expect(result.failure.reason).toBe("MALFORMED_PERSISTED_STATE");
    expect(result.failure.module).toBe("facts");
    expect(readPort.callLog).toEqual(["readRoot", "readProfile", "readPresence"]);
  });

  it("returns MALFORMED_PERSISTED_STATE when a presence row has a mismatched destinationKey", async () => {
    const baseState = createDefaultState();
    const presence: readonly TestPresenceRow[] = baseState.presence.map((row): TestPresenceRow => (row.module === "facts" ? { ...row, destinationKey: "other-key" } : row));
    const readPort = new FakePersistedDestinationReadPort(createDefaultState({ presence }));
    const result = await loadNormalizedPersistedDestinationBundle(createIdentity(), readPort);
    expect(result.outcome).toBe("FAILED");
    if (result.outcome !== "FAILED") {
      throw new Error("Expected failure");
    }
    expect(result.failure.reason).toBe("MALFORMED_PERSISTED_STATE");
    expect(result.failure.module).toBe("facts");
    expect(readPort.callLog).toEqual(["readRoot", "readProfile", "readPresence"]);
  });

  it("returns MALFORMED_PERSISTED_STATE when presence contains a duplicate module", async () => {
    const baseState = createDefaultState();
    const presence: readonly TestPresenceRow[] = [...baseState.presence, { destinationId: createIdentity().destinationId, destinationKey: createIdentity().destinationKey, module: "facts" }];
    const readPort = new FakePersistedDestinationReadPort(createDefaultState({ presence }));
    const result = await loadNormalizedPersistedDestinationBundle(createIdentity(), readPort);
    expect(result.outcome).toBe("FAILED");
    if (result.outcome !== "FAILED") {
      throw new Error("Expected failure");
    }
    expect(result.failure.reason).toBe("MALFORMED_PERSISTED_STATE");
    expect(result.failure.module).toBe("facts");
  });

  it("returns MALFORMED_PERSISTED_STATE when the profile storage version is unsupported", async () => {
    const readPort = new FakePersistedDestinationReadPort(createDefaultState({
      profile: {
        destinationId: createIdentity().destinationId,
        destinationKey: createIdentity().destinationKey,
        profileStorageVersion: 2,
        identityName: null,
        shortDescription: null,
        longDescription: null,
        currency: null,
        primaryLanguage: null,
        timeZone: null,
      },
    }));
    const result = await loadNormalizedPersistedDestinationBundle(createIdentity(), readPort);
    expect(result.outcome).toBe("FAILED");
    if (result.outcome !== "FAILED") {
      throw new Error("Expected failure");
    }
    expect(result.failure.reason).toBe("MALFORMED_PERSISTED_STATE");
  });

  it("returns MALFORMED_PERSISTED_STATE when a positioned module has an invalid position", async () => {
    const readPort = new FakePersistedDestinationReadPort(createDefaultState({
      replaceModules: {
        ...createDefaultState().replaceModules,
        lgbtqInclusivity: [{ destinationId: createIdentity().destinationId, destinationKey: createIdentity().destinationKey, position: 0, summary: "bad", culturalNotes: "c" }],
        languageIntegration: [],
        pets: [],
        familyEducation: [],
        communitySocial: [],
        accessibility: [],
        bureaucracySetup: [],
        workBusiness: [],
        retirementAging: [],
        lifestyleLaws: [],
      },
    }));
    const result = await loadNormalizedPersistedDestinationBundle(createIdentity(), readPort);
    expect(result.outcome).toBe("FAILED");
    if (result.outcome !== "FAILED") {
      throw new Error("Expected failure");
    }
    expect(result.failure.reason).toBe("MALFORMED_PERSISTED_STATE");
  });

  it("returns UNSUPPORTED_LEGACY_STATE when presence is missing for a required module", async () => {
    const presence = createDefaultState().presence.filter((row) => row.module !== "facts");
    const readPort = new FakePersistedDestinationReadPort(createDefaultState({ presence }));
    const result = await loadNormalizedPersistedDestinationBundle(createIdentity(), readPort);
    expect(result.outcome).toBe("FAILED");
    if (result.outcome !== "FAILED") {
      throw new Error("Expected failure");
    }
    expect(result.failure.reason).toBe("UNSUPPORTED_LEGACY_STATE");
    expect(result.failure.module).toBe("facts");
  });

  it("returns empty arrays and null singletons when presence exists but rows are absent", async () => {
    const readPort = new FakePersistedDestinationReadPort(createDefaultState({
      keyedChildren: {
        facts: [],
        scores: [],
        neighborhoods: [],
        places: [],
        resources: [],
        media: [],
        propertyResources: [],
        moveChecklist: [],
        eventsSeasonality: [],
        sources: [],
      },
      replaceModules: {
        costOfLiving: [],
        climateMonthly: [],
        housing: [],
        healthcare: [],
        visaResidency: [],
        taxesFinance: [],
        lgbtqInclusivity: [],
        safetyRisks: [],
        transportation: [],
        remoteWork: [],
        languageIntegration: [],
        pets: [],
        familyEducation: [],
        communitySocial: [],
        accessibility: [],
        bureaucracySetup: [],
        workBusiness: [],
        retirementAging: [],
        lifestyleLaws: [],
        realityCheck: [],
        moveChecklist: [],
        environmentQuality: [],
        dailyLifePracticality: [],
        eventsSeasonality: [],
        sources: [],
      },
      singletons: {
        environmentQuality: [],
        dailyLifePracticality: [],
      },
    }));
    const result = await loadNormalizedPersistedDestinationBundle(createIdentity(), readPort);
    expect(result.outcome).toBe("SUCCESS");
    if (result.outcome !== "SUCCESS") {
      throw new Error("Expected success");
    }
    expect(result.bundle.facts).toEqual([]);
    expect(result.bundle.lgbtqInclusivity).toEqual([]);
    expect(result.bundle.environmentQuality).toBeNull();
    expect(result.bundle.dailyLifePracticality).toBeNull();
  });

  it("returns a singleton value when presence exists with one row", async () => {
    const readPort = new FakePersistedDestinationReadPort(createDefaultState({
      singletons: {
        environmentQuality: [{ destinationId: createIdentity().destinationId, destinationKey: createIdentity().destinationKey, summary: "air", qualityNotes: "water" }],
        dailyLifePracticality: [],
      },
    }));
    const result = await loadNormalizedPersistedDestinationBundle(createIdentity(), readPort);
    expect(result.outcome).toBe("SUCCESS");
    if (result.outcome !== "SUCCESS") {
      throw new Error("Expected success");
    }
    expect(result.bundle.environmentQuality).toEqual({ summary: "air", qualityNotes: "water" });
  });

  it("rejects multiple singleton rows as malformed", async () => {
    const readPort = new FakePersistedDestinationReadPort(createDefaultState({
      singletons: {
        environmentQuality: [
          { destinationId: createIdentity().destinationId, destinationKey: createIdentity().destinationKey, summary: "a", qualityNotes: "b" },
          { destinationId: createIdentity().destinationId, destinationKey: createIdentity().destinationKey, summary: "c", qualityNotes: "d" },
        ],
        dailyLifePracticality: [],
      },
    }));
    const result = await loadNormalizedPersistedDestinationBundle(createIdentity(), readPort);
    expect(result.outcome).toBe("FAILED");
    if (result.outcome !== "FAILED") {
      throw new Error("Expected failure");
    }
    expect(result.failure.reason).toBe("MALFORMED_PERSISTED_STATE");
  });

  it("sorts position-based arrays and removes the position field from the normalized bundle", async () => {
    const readPort = new FakePersistedDestinationReadPort(createDefaultState({
      replaceModules: {
        ...createDefaultState().replaceModules,
        lgbtqInclusivity: [{ destinationId: createIdentity().destinationId, destinationKey: createIdentity().destinationKey, position: 3, summary: "third", culturalNotes: "c" }, { destinationId: createIdentity().destinationId, destinationKey: createIdentity().destinationKey, position: 1, summary: "first", culturalNotes: "a" }, { destinationId: createIdentity().destinationId, destinationKey: createIdentity().destinationKey, position: 2, summary: "second", culturalNotes: "b" }],
        languageIntegration: [],
        pets: [],
        familyEducation: [],
        communitySocial: [],
        accessibility: [],
        bureaucracySetup: [],
        workBusiness: [],
        retirementAging: [],
        lifestyleLaws: [],
      },
    }));
    const result = await loadNormalizedPersistedDestinationBundle(createIdentity(), readPort);
    expect(result.outcome).toBe("SUCCESS");
    if (result.outcome !== "SUCCESS") {
      throw new Error("Expected success");
    }
    expect(result.bundle.lgbtqInclusivity.map((entry) => entry.summary)).toEqual(["first", "second", "third"]);
  });

  it("rejects position gaps as malformed", async () => {
    const readPort = new FakePersistedDestinationReadPort(createDefaultState({
      replaceModules: {
        ...createDefaultState().replaceModules,
        lgbtqInclusivity: [{ destinationId: createIdentity().destinationId, destinationKey: createIdentity().destinationKey, position: 1, summary: "first", culturalNotes: "a" }, { destinationId: createIdentity().destinationId, destinationKey: createIdentity().destinationKey, position: 3, summary: "third", culturalNotes: "c" }],
        languageIntegration: [],
        pets: [],
        familyEducation: [],
        communitySocial: [],
        accessibility: [],
        bureaucracySetup: [],
        workBusiness: [],
        retirementAging: [],
        lifestyleLaws: [],
      },
    }));
    const result = await loadNormalizedPersistedDestinationBundle(createIdentity(), readPort);
    expect(result.outcome).toBe("FAILED");
    if (result.outcome !== "FAILED") {
      throw new Error("Expected failure");
    }
    expect(result.failure.reason).toBe("MALFORMED_PERSISTED_STATE");
  });

  it("rejects duplicate stable child keys as malformed", async () => {
    const readPort = new FakePersistedDestinationReadPort(createDefaultState({
      keyedChildren: {
        ...createDefaultState().keyedChildren,
        facts: [
          { destinationId: createIdentity().destinationId, destinationKey: createIdentity().destinationKey, factKey: "fact-1", factGroup: null, valueText: null, displayLabel: null, sourceName: null },
          { destinationId: createIdentity().destinationId, destinationKey: createIdentity().destinationKey, factKey: "fact-1", factGroup: null, valueText: null, displayLabel: null, sourceName: null },
        ],
      },
    }));
    const result = await loadNormalizedPersistedDestinationBundle(createIdentity(), readPort);
    expect(result.outcome).toBe("FAILED");
    if (result.outcome !== "FAILED") {
      throw new Error("Expected failure");
    }
    expect(result.failure.reason).toBe("MALFORMED_PERSISTED_STATE");
  });

  it("rejects rows whose destination identity does not match the root identity", async () => {
    const readPort = new FakePersistedDestinationReadPort(createDefaultState({
      keyedChildren: {
        ...createDefaultState().keyedChildren,
        facts: [{ destinationId: "other-id", destinationKey: createIdentity().destinationKey, factKey: "fact-1", factGroup: null, valueText: null, displayLabel: null, sourceName: null }],
      },
    }));
    const result = await loadNormalizedPersistedDestinationBundle(createIdentity(), readPort);
    expect(result.outcome).toBe("FAILED");
    if (result.outcome !== "FAILED") {
      throw new Error("Expected failure");
    }
    expect(result.failure.reason).toBe("MALFORMED_PERSISTED_STATE");
  });

  it("returns DB_READ_FAILED for module payload reads and uses the module name in the failure", async () => {
    const readPort = new FakePersistedDestinationReadPort(createDefaultState({ replaceModulesError: { reason: "DB_READ_FAILED", module: "healthcare" } }));
    const result = await loadNormalizedPersistedDestinationBundle(createIdentity(), readPort);
    expect(result.outcome).toBe("FAILED");
    if (result.outcome !== "FAILED") {
      throw new Error("Expected failure");
    }
    expect(result.failure.reason).toBe("DB_READ_FAILED");
    expect(result.failure.module).toBe("healthcare");
  });

  it("returns deterministic failures regardless of promise ordering", async () => {
    const readPort = new FakePersistedDestinationReadPort(createDefaultState({
      keyedChildrenError: { reason: "DB_READ_FAILED", module: "scores" },
      replaceModulesError: { reason: "DB_READ_FAILED", module: "healthcare" },
    }));
    const first = await loadNormalizedPersistedDestinationBundle(createIdentity(), readPort);
    const second = await loadNormalizedPersistedDestinationBundle(createIdentity(), readPort);
    expect(first).toEqual(second);
  });

  it("does not mutate the identity or the fake read-port data", async () => {
    const identity = createIdentity();
    const state = createDefaultState();
    const readPort = new FakePersistedDestinationReadPort(state);
    const originalRoot = JSON.stringify(state.root);
    const originalPresence = JSON.stringify(state.presence);

    await loadNormalizedPersistedDestinationBundle(identity, readPort);

    expect(JSON.stringify(state.root)).toBe(originalRoot);
    expect(JSON.stringify(state.presence)).toBe(originalPresence);
    expect(identity).toEqual(createIdentity());
  });
});
