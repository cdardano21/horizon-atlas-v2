import { beforeEach, describe, expect, it, vi } from "vitest";

const isSupabaseConfiguredMock = vi.hoisted(() => vi.fn());
const getSupabaseConfigMock = vi.hoisted(() => vi.fn());
const getSupabaseServiceRoleKeyMock = vi.hoisted(() => vi.fn());
const loadNormalizedPersistedDestinationBundleMock = vi.hoisted(() => vi.fn());

vi.mock("../lib/supabase", () => ({
  isSupabaseConfigured: isSupabaseConfiguredMock,
  getSupabaseConfig: getSupabaseConfigMock,
  getSupabaseServiceRoleKey: getSupabaseServiceRoleKeyMock,
}));

vi.mock("../lib/persistence/v31/load-normalized-persisted-destination-bundle", () => ({
  loadNormalizedPersistedDestinationBundle: loadNormalizedPersistedDestinationBundleMock,
}));

import { loadCanonicalDestinationForAdminPreview } from "../lib/canonical-destination-admin-preview";

const originalFetch = globalThis.fetch;

describe("loadCanonicalDestinationForAdminPreview: security + correctness", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isSupabaseConfiguredMock.mockReturnValue(true);
    getSupabaseConfigMock.mockReturnValue({ url: "https://example-project.supabase.co", anonKey: "anon-key" });
    getSupabaseServiceRoleKeyMock.mockReturnValue("real-service-role-key");
  });

  it("refuses to run when Supabase is not configured", async () => {
    isSupabaseConfiguredMock.mockReturnValue(false);
    const result = await loadCanonicalDestinationForAdminPreview("the-villages-fl-us");
    expect(result).toEqual({ ok: false, reason: "SUPABASE_NOT_CONFIGURED" });
  });

  it("refuses to bypass RLS when no service-role key is configured (fails closed, does not fall back to anon key)", async () => {
    getSupabaseServiceRoleKeyMock.mockReturnValue("");
    const result = await loadCanonicalDestinationForAdminPreview("the-villages-fl-us");
    expect(result).toEqual({ ok: false, reason: "SERVICE_ROLE_KEY_REQUIRED" });
  });

  it("returns NOT_FOUND for an unknown slug and destination_key - no fuzzy fallback is ever attempted", async () => {
    globalThis.fetch = vi.fn(async () => new Response(JSON.stringify([]), { status: 200 })) as never;
    const result = await loadCanonicalDestinationForAdminPreview("completely-unknown-slug");
    expect(result).toEqual({ ok: false, reason: "NOT_FOUND" });
    globalThis.fetch = originalFetch;
  });

  it("loads the real persisted bundle (not the workbook) for a valid draft destination using the service-role key", async () => {
    const fetchMock = vi.fn(async (input: string | URL, init?: RequestInit) => {
      const url = String(input);
      const headers = new Headers(init?.headers);
      expect(headers.get("apikey")).toBe("real-service-role-key");
      if (url.includes("/rest/v1/destinations_catalog?slug=eq.")) {
        return new Response(JSON.stringify([{ id: "id-1", destination_key: "the-villages-fl-us", slug: "the-villages-florida-united-states" }]), { status: 200 });
      }
      return new Response(JSON.stringify([]), { status: 200 });
    });
    globalThis.fetch = fetchMock as never;

    loadNormalizedPersistedDestinationBundleMock.mockResolvedValue({
      outcome: "SUCCESS",
      bundle: {
        destinationKey: "the-villages-fl-us",
        identity: { slug: "the-villages-florida-united-states", name: "The Villages", city: "The Villages", country: "United States" },
        editorial: { shortDescription: "Real short", longDescription: "Real long", currency: "USD", primaryLanguage: "English", timeZone: "EST" },
        facts: [], scores: [], neighborhoods: [], places: [], resources: [], media: [],
        costOfLiving: [], climateMonthly: [], housing: [], propertyResources: [], healthcare: [],
        visaResidency: [], taxesFinance: [], lgbtqInclusivity: [], safetyRisks: [], transportation: [],
        remoteWork: [], languageIntegration: [], pets: [], familyEducation: [], communitySocial: [],
        accessibility: [], bureaucracySetup: [], workBusiness: [], retirementAging: [], lifestyleLaws: [],
        realityCheck: [], moveChecklist: [], environmentQuality: null, dailyLifePracticality: null,
        eventsSeasonality: [], sources: [],
      },
    });

    const result = await loadCanonicalDestinationForAdminPreview("the-villages-florida-united-states");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.destination.city).toBe("The Villages");
      expect(result.destination.heroNarrative).toBe("Real short");
      expect(result.destination.v31DestinationKey).toBe("the-villages-fl-us");
    }
    globalThis.fetch = originalFetch;
  });
});
