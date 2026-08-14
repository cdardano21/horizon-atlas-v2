import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PersistedDestinationReadResult, ResolvedDestinationIdentity } from "../persistence/v31/types";
import { loadPersistedDestinationFromRuntime } from "./persisted-destination-read-runtime";

const createIdentity = (): ResolvedDestinationIdentity => ({
  destinationKey: "new-braunfels-tx-us" as never,
  destinationId: "11111111-1111-1111-1111-111111111111" as never,
});

const createReadResult = (): PersistedDestinationReadResult => ({
  outcome: "SUCCESS",
  bundle: {
    destinationKey: "new-braunfels-tx-us" as never,
    identity: { slug: "new-braunfels", name: "New Braunfels", city: "New Braunfels", country: "United States" },
    editorial: { shortDescription: null, longDescription: null, currency: null, primaryLanguage: null, timeZone: null },
    facts: [],
    scores: [],
    neighborhoods: [],
    places: [],
    resources: [],
    media: [],
    costOfLiving: [],
    climateMonthly: [],
    housing: [],
    propertyResources: [],
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
    environmentQuality: null,
    dailyLifePracticality: null,
    eventsSeasonality: [],
    sources: [],
  },
});

describe("loadPersistedDestinationFromRuntime", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("composes the runtime chain and returns the loader result", async () => {
    const identity = createIdentity();
    const readResult = createReadResult();

    const fetcher = vi.fn(async () => {
      throw new Error("transport failure");
    });

    const clientFactory = vi.fn(() => ({ selectRows: vi.fn() }));
    const portFactory = vi.fn(() => ({ readRoot: vi.fn(), readProfile: vi.fn(), readPresence: vi.fn(), readKeyedChildren: vi.fn(), readReplaceModules: vi.fn(), readSingletons: vi.fn() }));
    const loader = vi.fn(async () => readResult);

    vi.doMock("../persistence/v31/persisted-destination-read-client", () => ({
      createPersistedDestinationReadClient: clientFactory,
    }));
    vi.doMock("../persistence/v31/supabase-persisted-destination-read-port", () => ({
      createSupabasePersistedDestinationReadPort: portFactory,
    }));
    vi.doMock("../persistence/v31/load-normalized-persisted-destination-bundle", () => ({
      loadNormalizedPersistedDestinationBundle: loader,
    }));
    vi.doMock("../supabase", () => ({
      supabaseFetch: fetcher,
    }));

    const { loadPersistedDestinationFromRuntime: runtimeLoader } = await import("./persisted-destination-read-runtime");

    const result = await runtimeLoader(identity);

    expect(result).toBe(readResult);
    expect(fetcher).not.toHaveBeenCalled();
    expect(clientFactory).toHaveBeenCalledWith({ fetcher });
    expect(portFactory).toHaveBeenCalledTimes(1);
    expect(loader).toHaveBeenCalledWith(identity, expect.objectContaining({ readRoot: expect.any(Function) }));
  });

  it("preserves the existing DB_READ_FAILED path through the composed chain", async () => {
    const identity = createIdentity();
    const clientFactory = vi.fn(() => ({
      selectRows: async () => {
        throw new Error("transport down");
      },
    }));

    const portFactory = vi.fn((client: { selectRows: (args: { table: string; select: string; filters?: unknown[] }) => Promise<unknown> }) => ({
      readRoot: async () => ({ ok: false, error: { reason: "DB_READ_FAILED" } }),
      readProfile: async () => ({ ok: false, error: { reason: "DB_READ_FAILED" } }),
      readPresence: async () => ({ ok: false, error: { reason: "DB_READ_FAILED" } }),
      readKeyedChildren: async () => ({ ok: false, error: { reason: "DB_READ_FAILED", module: "facts" } }),
      readReplaceModules: async () => ({ ok: false, error: { reason: "DB_READ_FAILED", module: "facts" } }),
      readSingletons: async () => ({ ok: false, error: { reason: "DB_READ_FAILED", module: "facts" } }),
    }));

    const loader = vi.fn(async () => ({ outcome: "FAILED", failure: { reason: "DB_READ_FAILED", destinationIdentity: identity } }));

    vi.doMock("../persistence/v31/persisted-destination-read-client", () => ({
      createPersistedDestinationReadClient: clientFactory,
    }));
    vi.doMock("../persistence/v31/supabase-persisted-destination-read-port", () => ({
      createSupabasePersistedDestinationReadPort: portFactory,
    }));
    vi.doMock("../persistence/v31/load-normalized-persisted-destination-bundle", () => ({
      loadNormalizedPersistedDestinationBundle: loader,
    }));
    vi.doMock("../supabase", () => ({
      supabaseFetch: vi.fn(async () => {
        throw new Error("transport down");
      }),
    }));

    const { loadPersistedDestinationFromRuntime: runtimeLoader } = await import("./persisted-destination-read-runtime");
    const result = await runtimeLoader(identity);

    expect(result).toEqual({ outcome: "FAILED", failure: { reason: "DB_READ_FAILED", destinationIdentity: identity } });
    expect(loader).toHaveBeenCalledWith(identity, expect.any(Object));
  });
});
