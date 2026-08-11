import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

import { interpretOperationManifest, validateOperationManifest } from "../manifest";
import type { ApprovedDestinationScope, CanonicalDestinationKey, ClearFieldManifestEntry, DeleteChildManifestEntry, DestinationId, FactKey, ManifestEntry, OperationManifest, ReplaceModuleManifestEntry, StableChildKey, StoredDestinationState } from "../types";

const DESTINATION_A_KEY = "dest-a" as CanonicalDestinationKey;
const DESTINATION_A_ID = "dest-id-a" as DestinationId;
const FACT_ONE_KEY = "fact-1" as FactKey;
const FACT_MISSING_KEY = "fact-9" as FactKey;
const ROW_ONE_KEY = "row-1" as StableChildKey;

type MinimalCanonicalDestination = {
  readonly identity: {
    readonly destinationKey: CanonicalDestinationKey;
    readonly slug: string | null;
    readonly name: string | null;
    readonly city: string | null;
    readonly country: string | null;
  };
  readonly editorial: Record<string, unknown>;
  readonly facts: readonly unknown[];
  readonly scores: readonly unknown[];
  readonly neighborhoods: readonly unknown[];
  readonly places: readonly unknown[];
  readonly resources: readonly unknown[];
  readonly media: readonly unknown[];
  readonly costOfLiving: readonly unknown[];
  readonly climateMonthly: readonly unknown[];
  readonly housing: readonly unknown[];
  readonly propertyResources: readonly unknown[];
  readonly healthcare: readonly unknown[];
  readonly visaResidency: readonly unknown[];
  readonly taxesFinance: readonly unknown[];
  readonly lgbtqInclusivity: readonly unknown[];
  readonly safetyRisks: readonly unknown[];
  readonly transportation: readonly unknown[];
  readonly remoteWork: readonly unknown[];
  readonly languageIntegration: readonly unknown[];
  readonly pets: readonly unknown[];
  readonly familyEducation: readonly unknown[];
  readonly communitySocial: readonly unknown[];
  readonly accessibility: readonly unknown[];
  readonly bureaucracySetup: readonly unknown[];
  readonly workBusiness: readonly unknown[];
  readonly retirementAging: readonly unknown[];
  readonly lifestyleLaws: readonly unknown[];
  readonly realityCheck: readonly unknown[];
  readonly moveChecklist: readonly unknown[];
  readonly environmentQuality: Record<string, unknown> | null;
  readonly dailyLifePracticality: Record<string, unknown> | null;
  readonly eventsSeasonality: readonly unknown[];
  readonly sources: readonly unknown[];
};

function createCanonicalDestinations(): readonly MinimalCanonicalDestination[] {
  return Object.freeze([
    Object.freeze({
      identity: Object.freeze({
        destinationKey: "dest-a" as CanonicalDestinationKey,
        slug: "alpha",
        name: "Alpha",
        city: "Alpha City",
        country: "Country A",
      }),
      editorial: Object.freeze({}),
      facts: Object.freeze([]),
      scores: Object.freeze([]),
      neighborhoods: Object.freeze([]),
      places: Object.freeze([]),
      resources: Object.freeze([]),
      media: Object.freeze([]),
      costOfLiving: Object.freeze([]),
      climateMonthly: Object.freeze([]),
      housing: Object.freeze([]),
      propertyResources: Object.freeze([]),
      healthcare: Object.freeze([]),
      visaResidency: Object.freeze([]),
      taxesFinance: Object.freeze([]),
      lgbtqInclusivity: Object.freeze([]),
      safetyRisks: Object.freeze([]),
      transportation: Object.freeze([]),
      remoteWork: Object.freeze([]),
      languageIntegration: Object.freeze([]),
      pets: Object.freeze([]),
      familyEducation: Object.freeze([]),
      communitySocial: Object.freeze([]),
      accessibility: Object.freeze([]),
      bureaucracySetup: Object.freeze([]),
      workBusiness: Object.freeze([]),
      retirementAging: Object.freeze([]),
      lifestyleLaws: Object.freeze([]),
      realityCheck: Object.freeze([]),
      moveChecklist: Object.freeze([]),
      environmentQuality: Object.freeze({ summary: "Good", qualityNotes: "Clean" }),
      dailyLifePracticality: Object.freeze({ summary: "Practical", practicalityNotes: "Easy" }),
      eventsSeasonality: Object.freeze([]),
      sources: Object.freeze([]),
    }),
    Object.freeze({
      identity: Object.freeze({
        destinationKey: "dest-b" as CanonicalDestinationKey,
        slug: "beta",
        name: "Beta",
        city: "Beta City",
        country: "Country B",
      }),
      editorial: Object.freeze({}),
      facts: Object.freeze([]),
      scores: Object.freeze([]),
      neighborhoods: Object.freeze([]),
      places: Object.freeze([]),
      resources: Object.freeze([]),
      media: Object.freeze([]),
      costOfLiving: Object.freeze([]),
      climateMonthly: Object.freeze([]),
      housing: Object.freeze([]),
      propertyResources: Object.freeze([]),
      healthcare: Object.freeze([]),
      visaResidency: Object.freeze([]),
      taxesFinance: Object.freeze([]),
      lgbtqInclusivity: Object.freeze([]),
      safetyRisks: Object.freeze([]),
      transportation: Object.freeze([]),
      remoteWork: Object.freeze([]),
      languageIntegration: Object.freeze([]),
      pets: Object.freeze([]),
      familyEducation: Object.freeze([]),
      communitySocial: Object.freeze([]),
      accessibility: Object.freeze([]),
      bureaucracySetup: Object.freeze([]),
      workBusiness: Object.freeze([]),
      retirementAging: Object.freeze([]),
      lifestyleLaws: Object.freeze([]),
      realityCheck: Object.freeze([]),
      moveChecklist: Object.freeze([]),
      environmentQuality: Object.freeze({ summary: "Average", qualityNotes: "Mixed" }),
      dailyLifePracticality: Object.freeze({ summary: "Busy", practicalityNotes: "Needs planning" }),
      eventsSeasonality: Object.freeze([]),
      sources: Object.freeze([]),
    }),
  ]);
}

function createApprovedScope(): ApprovedDestinationScope {
  return Object.freeze([
    Object.freeze({ destinationKey: DESTINATION_A_KEY, destinationId: DESTINATION_A_ID }),
  ]);
}

function createStoredState(): StoredDestinationState {
  return Object.freeze({
    identity: Object.freeze({
      destinationKey: DESTINATION_A_KEY,
      slug: "alpha",
      name: "Alpha",
      city: "Alpha City",
      country: "Country A",
    }),
    editorial: Object.freeze({ shortDescription: "Short", longDescription: "Long", currency: "USD", primaryLanguage: "English", timeZone: "UTC" }),
    facts: Object.freeze([
      Object.freeze({ factKey: FACT_ONE_KEY, factGroup: "group", valueText: "value", displayLabel: "label", sourceName: "source" }),
    ]),
    scores: Object.freeze([]),
    neighborhoods: Object.freeze([]),
    places: Object.freeze([]),
    resources: Object.freeze([]),
    media: Object.freeze([]),
    costOfLiving: Object.freeze([]),
    climateMonthly: Object.freeze([]),
    housing: Object.freeze([]),
    propertyResources: Object.freeze([]),
    healthcare: Object.freeze([]),
    visaResidency: Object.freeze([]),
    taxesFinance: Object.freeze([]),
    lgbtqInclusivity: Object.freeze([]),
    safetyRisks: Object.freeze([]),
    transportation: Object.freeze([]),
    remoteWork: Object.freeze([]),
    languageIntegration: Object.freeze([]),
    pets: Object.freeze([]),
    familyEducation: Object.freeze([]),
    communitySocial: Object.freeze([]),
    accessibility: Object.freeze([]),
    bureaucracySetup: Object.freeze([]),
    workBusiness: Object.freeze([]),
    retirementAging: Object.freeze([]),
    lifestyleLaws: Object.freeze([]),
    realityCheck: Object.freeze([]),
    moveChecklist: Object.freeze([]),
    environmentQuality: Object.freeze({ summary: "Good", qualityNotes: "Clean" }),
    dailyLifePracticality: Object.freeze({ summary: "Practical", practicalityNotes: "Easy" }),
    eventsSeasonality: Object.freeze([]),
    sources: Object.freeze([]),
  } as StoredDestinationState);
}

function createStoredDestinationStateByKey(): Readonly<Record<CanonicalDestinationKey, StoredDestinationState>> {
  return { [DESTINATION_A_KEY]: createStoredState() };
}

describe("manifest validation", () => {
  it("accepts a valid destination in the workbook and approved scope", () => {
    const manifest: OperationManifest = {
      entries: [
        {
          destinationKey: "dest-a" as CanonicalDestinationKey,
          operation: "CLEAR_FIELD",
          targetModule: "environmentQuality",
          targetFieldPath: "summary",
          reason: "audit",
        } satisfies ClearFieldManifestEntry,
      ],
    };

    const result = validateOperationManifest({
      manifest,
      canonicalDestinations: createCanonicalDestinations(),
      approvedScope: createApprovedScope(),
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("rejects manifest destinations that are missing from the workbook", () => {
    const result = validateOperationManifest({
      manifest: {
        entries: [{ destinationKey: "missing" as CanonicalDestinationKey, operation: "CLEAR_FIELD", targetModule: "environmentQuality", targetFieldPath: "summary" }],
      },
      canonicalDestinations: createCanonicalDestinations(),
      approvedScope: createApprovedScope(),
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.kind === "MANIFEST_DESTINATION_NOT_IN_WORKBOOK")).toBe(true);
  });

  it("rejects destinations that are outside the approved scope", () => {
    const result = validateOperationManifest({
      manifest: {
        entries: [{ destinationKey: "dest-b" as CanonicalDestinationKey, operation: "CLEAR_FIELD", targetModule: "environmentQuality", targetFieldPath: "summary" }],
      },
      canonicalDestinations: createCanonicalDestinations(),
      approvedScope: createApprovedScope(),
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.kind === "OUT_OF_SCOPE_DESTINATION")).toBe(true);
  });

  it("does not match by name or slug when validating destination identity", () => {
    const result = validateOperationManifest({
      manifest: {
        entries: [{ destinationKey: "dest-b" as CanonicalDestinationKey, operation: "CLEAR_FIELD", targetModule: "environmentQuality", targetFieldPath: "summary" }],
      },
      canonicalDestinations: createCanonicalDestinations(),
      approvedScope: createApprovedScope(),
    });

    expect(result.errors.some((error) => error.kind === "OUT_OF_SCOPE_DESTINATION")).toBe(true);
  });

  it("validates a clear-field operation against a singleton module field", () => {
    const result = validateOperationManifest({
      manifest: {
        entries: [{ destinationKey: "dest-a" as CanonicalDestinationKey, operation: "CLEAR_FIELD", targetModule: "environmentQuality", targetFieldPath: "summary" }],
      },
      canonicalDestinations: createCanonicalDestinations(),
      approvedScope: createApprovedScope(),
    });

    expect(result.valid).toBe(true);
  });

  it("rejects unknown clear-field paths", () => {
    const result = validateOperationManifest({
      manifest: {
        entries: [{ destinationKey: "dest-a" as CanonicalDestinationKey, operation: "CLEAR_FIELD", targetModule: "environmentQuality", targetFieldPath: "unknownField" }],
      },
      canonicalDestinations: createCanonicalDestinations(),
      approvedScope: createApprovedScope(),
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.kind === "MANIFEST_FIELD_PATH_INVALID")).toBe(true);
  });

  it("rejects malformed clear-field paths", () => {
    const result = validateOperationManifest({
      manifest: {
        entries: [{ destinationKey: "dest-a" as CanonicalDestinationKey, operation: "CLEAR_FIELD", targetModule: "environmentQuality", targetFieldPath: "summary..x" }],
      },
      canonicalDestinations: createCanonicalDestinations(),
      approvedScope: createApprovedScope(),
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.kind === "MANIFEST_FIELD_PATH_INVALID")).toBe(true);
  });

  it("rejects clear-field on identity-like fields", () => {
    const result = validateOperationManifest({
      manifest: {
        entries: [{ destinationKey: "dest-a" as CanonicalDestinationKey, operation: "CLEAR_FIELD", targetModule: "environmentQuality", targetFieldPath: "destinationKey" }],
      },
      canonicalDestinations: createCanonicalDestinations(),
      approvedScope: createApprovedScope(),
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.kind === "MANIFEST_FIELD_PATH_INVALID")).toBe(true);
  });

  it("rejects delete-child on non-keyed modules", () => {
    const result = validateOperationManifest({
      manifest: {
        entries: [{ destinationKey: DESTINATION_A_KEY, operation: "DELETE_CHILD", targetModule: "costOfLiving", targetChildKey: ROW_ONE_KEY }],
      } as unknown as OperationManifest,
      canonicalDestinations: createCanonicalDestinations(),
      approvedScope: createApprovedScope(),
    });

    expect(result.valid).toBe(false);
  });

  it("validates delete-child for an existing keyed child when the stored state contains it", () => {
    const result = validateOperationManifest({
      manifest: {
        entries: [{ destinationKey: DESTINATION_A_KEY, operation: "DELETE_CHILD", targetModule: "facts", targetChildKey: FACT_ONE_KEY }],
      },
      canonicalDestinations: createCanonicalDestinations(),
      approvedScope: createApprovedScope(),
      storedDestinationStateByKey: createStoredDestinationStateByKey(),
    });

    expect(result.valid).toBe(true);
  });

  it("rejects delete-child when the keyed child is missing from the stored state", () => {
    const result = validateOperationManifest({
      manifest: {
        entries: [{ destinationKey: DESTINATION_A_KEY, operation: "DELETE_CHILD", targetModule: "facts", targetChildKey: FACT_MISSING_KEY }],
      },
      canonicalDestinations: createCanonicalDestinations(),
      approvedScope: createApprovedScope(),
      storedDestinationStateByKey: createStoredDestinationStateByKey(),
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.kind === "DELETE_TARGET_MISSING")).toBe(true);
  });

  it("rejects replace-module for a singleton or identity module", () => {
    const result = validateOperationManifest({
      manifest: {
        entries: [{ destinationKey: "dest-a" as CanonicalDestinationKey, operation: "REPLACE_MODULE", targetModule: "environmentQuality" }],
      },
      canonicalDestinations: createCanonicalDestinations(),
      approvedScope: createApprovedScope(),
    });

    expect(result.valid).toBe(false);
  });

  it("accepts replace-module for a non-keyed repeatable module and preserves explicit empty intent", () => {
    const interpretation = interpretOperationManifest({
      manifest: {
        entries: [{ destinationKey: "dest-a" as CanonicalDestinationKey, operation: "REPLACE_MODULE", targetModule: "costOfLiving" }],
      },
      canonicalDestinations: createCanonicalDestinations(),
      approvedScope: createApprovedScope(),
    });

    expect(interpretation.valid).toBe(true);
    expect(interpretation.interpretedManifest.entries[0]).toEqual(expect.objectContaining({
      destinationKey: "dest-a",
      operation: "REPLACE_MODULE",
      targetModule: "costOfLiving",
    }));
  });

  it("rejects duplicate and conflicting destructive instructions deterministically", () => {
    const result = validateOperationManifest({
      manifest: {
        entries: [
          { destinationKey: DESTINATION_A_KEY, operation: "REPLACE_MODULE", targetModule: "costOfLiving", reason: "one" },
          { destinationKey: DESTINATION_A_KEY, operation: "DELETE_CHILD", targetModule: "facts", targetChildKey: FACT_ONE_KEY, reason: "two" },
          { destinationKey: DESTINATION_A_KEY, operation: "REPLACE_MODULE", targetModule: "costOfLiving", reason: "three" },
        ],
      },
      canonicalDestinations: createCanonicalDestinations(),
      approvedScope: createApprovedScope(),
      storedDestinationStateByKey: createStoredDestinationStateByKey(),
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.kind === "MANIFEST_CONFLICT")).toBe(true);
  });

  it("preserves reason and note data and ignores them for duplicate identity", () => {
    const result = validateOperationManifest({
      manifest: {
        entries: [
          { destinationKey: "dest-a" as CanonicalDestinationKey, operation: "CLEAR_FIELD", targetModule: "environmentQuality", targetFieldPath: "summary", reason: "one", operatorNote: "alpha" },
          { destinationKey: "dest-a" as CanonicalDestinationKey, operation: "CLEAR_FIELD", targetModule: "environmentQuality", targetFieldPath: "summary", reason: "two", operatorNote: "beta" },
        ],
      },
      canonicalDestinations: createCanonicalDestinations(),
      approvedScope: createApprovedScope(),
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.kind === "MANIFEST_CONFLICT")).toBe(true);
  });

  it("does not mutate stored state or manifest inputs during validation or interpretation", () => {
    const manifest: OperationManifest = {
      entries: [
        { destinationKey: "dest-a" as CanonicalDestinationKey, operation: "CLEAR_FIELD", targetModule: "environmentQuality", targetFieldPath: "summary", reason: "audit" },
      ],
    };
    const storedDestinationStateByKey = {
      "dest-a": createStoredState(),
    };
    const manifestSnapshot = JSON.stringify(manifest);
    const storedSnapshot = JSON.stringify(storedDestinationStateByKey);

    validateOperationManifest({ manifest, canonicalDestinations: createCanonicalDestinations(), approvedScope: createApprovedScope(), storedDestinationStateByKey });
    interpretOperationManifest({ manifest, canonicalDestinations: createCanonicalDestinations(), approvedScope: createApprovedScope(), storedDestinationStateByKey });

    expect(JSON.stringify(manifest)).toBe(manifestSnapshot);
    expect(JSON.stringify(storedDestinationStateByKey)).toBe(storedSnapshot);
  });

  it("produces the same result across fresh processes for the same manifest", () => {
    const script = [
      "import { validateOperationManifest } from './app/lib/persistence/v31/manifest.ts';",
      "const manifest = { entries: [{ destinationKey: 'dest-a', operation: 'CLEAR_FIELD', targetModule: 'environmentQuality', targetFieldPath: 'summary', reason: 'audit' }] };",
      "const result = validateOperationManifest({",
      "  manifest,",
      "  canonicalDestinations: [{ identity: { destinationKey: 'dest-a', slug: 'alpha', name: 'Alpha', city: 'Alpha City', country: 'Country A' }, editorial: {}, facts: [], scores: [], neighborhoods: [], places: [], resources: [], media: [], costOfLiving: [], climateMonthly: [], housing: [], propertyResources: [], healthcare: [], visaResidency: [], taxesFinance: [], lgbtqInclusivity: [], safetyRisks: [], transportation: [], remoteWork: [], languageIntegration: [], pets: [], familyEducation: [], communitySocial: [], accessibility: [], bureaucracySetup: [], workBusiness: [], retirementAging: [], lifestyleLaws: [], realityCheck: [], moveChecklist: [], environmentQuality: { summary: 'Good', qualityNotes: 'Clean' }, dailyLifePracticality: { summary: 'Practical', practicalityNotes: 'Easy' }, eventsSeasonality: [], sources: [] }],",
      "  approvedScope: [{ destinationKey: 'dest-a', destinationId: 'dest-id-a' }],",
      "});",
      "console.log(JSON.stringify({ valid: result.valid, errorKinds: result.errors.map((error) => error.kind) }));",
      "",
    ].join("\n");

    const child = spawnSync(process.execPath, ["--experimental-strip-types", "--input-type=module", "-e", script], {
      cwd: process.cwd(),
      encoding: "utf8",
    });

    expect(child.status).toBe(0);
    expect(JSON.parse(child.stdout)).toEqual({ valid: true, errorKinds: [] });
  });

  it("is order-independent for valid manifests and preserves immutability", () => {
    const manifestA: OperationManifest = {
      entries: [
        { destinationKey: "dest-a" as CanonicalDestinationKey, operation: "CLEAR_FIELD", targetModule: "environmentQuality", targetFieldPath: "summary", reason: "audit" },
        { destinationKey: "dest-a" as CanonicalDestinationKey, operation: "REPLACE_MODULE", targetModule: "costOfLiving", reason: "replace" },
      ],
    };

    const manifestB: OperationManifest = {
      entries: [
        { destinationKey: "dest-a" as CanonicalDestinationKey, operation: "REPLACE_MODULE", targetModule: "costOfLiving", reason: "replace" },
        { destinationKey: "dest-a" as CanonicalDestinationKey, operation: "CLEAR_FIELD", targetModule: "environmentQuality", targetFieldPath: "summary", reason: "audit" },
      ],
    };

    const resultA = interpretOperationManifest({ manifest: manifestA, canonicalDestinations: createCanonicalDestinations(), approvedScope: createApprovedScope() });
    const resultB = interpretOperationManifest({ manifest: manifestB, canonicalDestinations: createCanonicalDestinations(), approvedScope: createApprovedScope() });

    expect(resultA.valid).toBe(true);
    expect(resultB.valid).toBe(true);
    expect(JSON.stringify(resultA.interpretedManifest)).toBe(JSON.stringify(resultB.interpretedManifest));
    expect(manifestA.entries[0]).toEqual({ destinationKey: "dest-a", operation: "CLEAR_FIELD", targetModule: "environmentQuality", targetFieldPath: "summary", reason: "audit" });
  });
});
