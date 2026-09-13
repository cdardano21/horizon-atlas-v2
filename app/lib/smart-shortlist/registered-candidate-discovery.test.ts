import { afterEach, describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { EXPANSION_WORKBOOK_REGISTRY } from "../expansion-workbook-registry";
import { loadFrozenWorkbookV31DeterministicImport } from "../workbook-v31-deterministic-core";
import { deriveRegisteredAffordability, deriveRegisteredCandidate, loadSmartShortlistData } from "./server-data";

const existing = vi.hoisted(() => ({ candidates: [] as import("./cohort").PrototypeCandidate[] }));
vi.mock("./cohort", () => ({ smartShortlistCandidates: existing.candidates }));
vi.mock("./owned-affordability-records", () => ({ ownedAffordabilityRecords: [] }));
vi.mock("../supabase", () => ({
  isSupabaseConfigured: () => true,
  getSupabaseConfig: () => ({ url: "https://catalog.invalid" }),
  getSupabaseAuthHeaders: () => ({}),
}));

const entry = EXPANSION_WORKBOOK_REGISTRY.find((row) => row.registryId === "non-legacy-pilot-05")!;
const workbook = await loadFrozenWorkbookV31DeterministicImport(entry.workbookPath);
const destination = workbook.canonicalDestinations[0];
const totals = destination.costOfLiving.filter((row) => row.category === "u3_r5_total_monthly_estimate");
const catalog = workbook.canonicalDestinations.map((row) => ({
  id: `id-${row.identity.destinationKey}`, destination_key: row.identity.destinationKey,
  slug: row.identity.slug, status: "published",
}));
function respond(rows: unknown[]) {
  const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => rows });
  vi.stubGlobal("fetch", fetch);
  return fetch;
}
afterEach(() => { vi.unstubAllGlobals(); existing.candidates.length = 0; });

describe("registered U3-R5 affordability", () => {
  it("selects single and couple totals among category breakdowns", () => {
    expect(deriveRegisteredAffordability(destination)).toEqual({ destinationKey: "whistler-canada", singleMonthlyUsd: 5250, coupleMonthlyUsd: 7100, estimateYear: 2026 });
  });
  it("derives both totals for every pilot destination", () => {
    for (const row of workbook.canonicalDestinations) expect(deriveRegisteredAffordability(row), row.identity.destinationKey).not.toBeNull();
  });
  it.each([
    { monthly_low: "invalid" }, { monthly_high: "0" }, { currency: "CAD" },
    { lifestyle_tier: "budget" }, { stay_mode_key: "VISIT" },
  ])("rejects malformed or ineligible totals: %j", (change) => {
    expect(deriveRegisteredAffordability({ ...destination, costOfLiving: destination.costOfLiving.map((row) => row === totals[0] ? { ...row, ...change } : row) })).toBeNull();
  });
  it("rejects duplicate totals without falling back to a subtotal", () => {
    expect(deriveRegisteredAffordability({ ...destination, costOfLiving: [...destination.costOfLiving, totals[0]] })).toBeNull();
  });
  it("does not replace a missing total with a category subtotal", () => {
    expect(deriveRegisteredAffordability({ ...destination, costOfLiving: [destination.costOfLiving[0], totals[1]] })).toBeNull();
  });
  it("rejects a missing couple total in a rich workbook", () => {
    expect(deriveRegisteredAffordability({ ...destination, costOfLiving: destination.costOfLiving.filter((row) => row.household_type !== "couple") })).toBeNull();
  });
  it("preserves the legacy one-row-per-household USD format", () => {
    expect(deriveRegisteredAffordability({ ...destination, costOfLiving: totals.map((row) => ({ ...row, category: "legacy_total", lifestyle_tier: null, stay_mode_key: null })) })).toEqual(deriveRegisteredAffordability(destination));
  });
});

describe("published catalog discovery through the shortlist loader", () => {
  it("includes published identities with exact keys/slugs and affordability", async () => {
    const fetch = respond(catalog);
    const result = await loadSmartShortlistData([entry]);
    expect(result.candidates.map((row) => [row.key, row.slug])).toEqual(catalog.map((row) => [row.destination_key, row.slug]));
    expect(result.affordabilityRecords).toHaveLength(5);
    expect(result.intelligence).toHaveLength(5);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("status=eq.published"), expect.objectContaining({ cache: "no-store" }));
  });
  it.each(["draft", "review", "archived"])("excludes %s rows even if returned by the catalog", async (status) => {
    respond(catalog.map((row) => ({ ...row, status })));
    expect((await loadSmartShortlistData([entry])).candidates).toEqual([]);
  });
  it("excludes absent/unpublished identities", async () => {
    respond([]);
    expect((await loadSmartShortlistData([entry])).candidates).toEqual([]);
  });
  it("never adds new-policy preview identities, even with published catalog data", async () => {
    const fetch = respond(catalog);
    expect((await loadSmartShortlistData([{ ...entry, environment: "preview" }])).candidates).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("rejects slug mismatches and ambiguous catalog ownership", async () => {
    respond([...catalog.map((row) => ({ ...row, slug: "wrong-alias" })), catalog[0]]);
    expect((await loadSmartShortlistData([entry])).candidates).toEqual([]);
  });
  it("keeps an existing candidate exactly once", async () => {
    existing.candidates.push(deriveRegisteredCandidate(destination));
    respond(catalog);
    const result = await loadSmartShortlistData([entry]);
    expect(result.candidates).toHaveLength(5);
    expect(result.candidates.filter((row) => row.key === destination.identity.destinationKey)).toHaveLength(1);
  });
  it("reevaluates publication on a fresh load", async () => {
    const fetch = respond(catalog);
    expect((await loadSmartShortlistData([entry])).candidates).toHaveLength(5);
    fetch.mockResolvedValue({ ok: true, json: async () => [] });
    expect((await loadSmartShortlistData([entry])).candidates).toHaveLength(0);
  });
  it("keeps legacy candidates available when publication lookup is unavailable", async () => {
    existing.candidates.push(deriveRegisteredCandidate(destination));
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    expect((await loadSmartShortlistData([entry])).candidates.map((row) => row.key)).toEqual([destination.identity.destinationKey]);
  });
  it("fails closed on a catalog read failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    expect((await loadSmartShortlistData([entry])).candidates).toEqual([]);
  });
});

describe("non-legacy pilot 05 frozen workbook", () => {
  it("pins the exact approved bytes and unique registry ownership", () => {
    expect(createHash("sha256").update(readFileSync(entry.workbookPath)).digest("hex")).toBe("076ee8953595a9e011bb4102a44b5e958bc52405ccef6bffbe70821e1fbbeb08");
    expect(entry.expectedSha256).toBe("076ee8953595a9e011bb4102a44b5e958bc52405ccef6bffbe70821e1fbbeb08");
    expect(entry.expectedDestinationKeys).toEqual(["whistler-canada", "bansko-bulgaria", "pucon-chile", "noosa-heads-australia", "baden-baden-germany"]);
    expect(workbook.validationErrors).toEqual([]);
    expect(workbook.canonicalDestinations.map((row) => row.identity.destinationKey)).toEqual(entry.expectedDestinationKeys);
    for (const key of entry.expectedDestinationKeys) expect(EXPANSION_WORKBOOK_REGISTRY.filter((row) => row.expectedDestinationKeys.includes(key))).toHaveLength(1);
  });
  it("preserves authored module counts", () => {
    for (const row of workbook.canonicalDestinations) {
      for (const [module, count] of Object.entries({ neighborhoods: 5, places: 18, resources: 18, media: 4, climateMonthly: 12, costOfLiving: 10, lifestyleFeatures: 14, moveChecklist: 10 })) {
        expect((row[module as keyof typeof row] as unknown[]).length, `${row.identity.destinationKey}/${module}`).toBe(count);
      }
    }
  });
});
