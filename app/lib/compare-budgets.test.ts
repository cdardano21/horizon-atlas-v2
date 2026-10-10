import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadCompareBudgets } from "./compare-budgets";
import { loadPublishedCatalogIdentities } from "./published-catalog-identities";
import { supabaseFetch } from "./supabase";

vi.mock("./expansion-workbook-registry", () => ({ EXPANSION_WORKBOOK_REGISTRY: [{ expectedDestinationKeys: Array.from({ length: 51 }, (_, i) => `place-${i}`) }] }));
vi.mock("./published-catalog-identities", () => ({ loadPublishedCatalogIdentities: vi.fn() }));
vi.mock("./supabase", () => ({ supabaseFetch: vi.fn() }));
const identity = (i = 0) => ({ id: `00000000-0000-0000-0000-${String(i).padStart(12, "0")}`, destination_key: `place-${i}`, slug: `place-${i}`, status: "published" });
const budget = (i = 0) => ({ destination_id: identity(i).id, destination_key: identity(i).destination_key, category: "u3_r5_total_monthly_estimate", household_type: "couple", lifestyle_tier: "comfortable", stay_mode_key: "RELOCATE", currency: "USD", monthly_low: "2400", monthly_high: "3600", verified: false });
const reply = (rows: unknown, status = 200) => vi.mocked(supabaseFetch).mockResolvedValue(new Response(JSON.stringify(rows), { status }));
beforeEach(() => { vi.clearAllMocks(); vi.mocked(loadPublishedCatalogIdentities).mockResolvedValue([identity()]); reply([budget()]); });

describe("Compare persisted USD budgets", () => {
  it("uses the authored range without tag arithmetic, conversion or verification-field policy changes", async () => {
    expect(await loadCompareBudgets([identity()])).toEqual({ "place-0": "$2,400–$3,600 per month (USD)" });
    expect(supabaseFetch).toHaveBeenCalledTimes(1);
    const [path, options] = vi.mocked(supabaseFetch).mock.calls[0];
    expect(path).toContain("/rest/v1/premium_cost_of_living?");
    expect(options).toEqual({ cache: "no-store" });
    const query = new URL(path, "https://example.test").searchParams;
    expect(query.get("category")).toBe("eq.u3_r5_total_monthly_estimate");
    expect(query.get("household_type")).toBe("eq.couple");
  });
  it.each([
    { currency: "PEN" }, { household_type: "single" }, { lifestyle_tier: "luxury" },
    { stay_mode_key: "SHORT_STAY" }, { category: "rent" }, { destination_key: "other" },
    { monthly_low: null }, { monthly_low: "" }, { monthly_low: "NaN" },
    { monthly_low: -1 }, { monthly_high: 1 }, { monthly_high: "Infinity" },
  ])("omits incompatible evidence %j", async patch => {
    reply([{ ...budget(), ...patch }]); expect(await loadCompareBudgets([identity()])).toEqual({});
  });
  it.each([[], [budget(), budget()], null, [null], Array.from({ length: 1000 }, () => budget())].map(rows => ({ rows })))("fails closed for absent, ambiguous, malformed or capped results", async ({ rows }) => {
    reply(rows); expect(await loadCompareBudgets([identity()])).toEqual({});
  });
  it.each([401, 403, 500])("does not restore heuristics on HTTP %i", async status => {
    reply({}, status); expect(await loadCompareBudgets([identity()])).toEqual({});
  });
  it("handles rejected reads without fallback", async () => {
    vi.mocked(supabaseFetch).mockRejectedValue(new Error("offline")); expect(await loadCompareBudgets([identity()])).toEqual({});
  });
  it("keeps mixed availability and intentionally missing budgets unavailable", async () => {
    const catalog = [identity(), identity(1), identity(2)]; vi.mocked(loadPublishedCatalogIdentities).mockResolvedValue(catalog);
    reply([budget(), { ...budget(1), currency: "PEN" }]);
    expect(await loadCompareBudgets(catalog)).toEqual({ "place-0": "$2,400–$3,600 per month (USD)" });
  });
  it.each(["draft", "review"])("rejects %s and unregistered identities even if returned by transport", async status => {
    vi.mocked(loadPublishedCatalogIdentities).mockResolvedValue([{ ...identity(), status }, { ...identity(1), destination_key: "legacy" }]);
    expect(await loadCompareBudgets([identity(), identity(1)])).toEqual({}); expect(supabaseFetch).not.toHaveBeenCalled();
  });
  it("excludes identities absent from the public comparison catalog and duplicate catalog identities", async () => {
    vi.mocked(loadPublishedCatalogIdentities).mockResolvedValue([identity(), identity(), identity(1)]);
    expect(await loadCompareBudgets([identity()])).toEqual({}); expect(supabaseFetch).not.toHaveBeenCalled();
  });
  it("uses bounded bulk requests for all selections instead of one request per destination", async () => {
    const catalog = Array.from({ length: 51 }, (_, i) => identity(i)); vi.mocked(loadPublishedCatalogIdentities).mockResolvedValue(catalog);
    vi.mocked(supabaseFetch).mockImplementation(async path => {
      const ids = new URL(path, "https://example.test").searchParams.get("destination_id")!;
      return new Response(JSON.stringify(catalog.flatMap((row, i) => ids.includes(row.id) ? [budget(i)] : [])));
    });
    expect(Object.keys(await loadCompareBudgets(catalog))).toHaveLength(51); expect(supabaseFetch).toHaveBeenCalledTimes(2);
  });
});
