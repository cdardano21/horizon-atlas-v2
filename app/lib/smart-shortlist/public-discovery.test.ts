import { afterEach, describe, expect, it, vi } from "vitest";
import { EXPANSION_WORKBOOK_REGISTRY } from "../expansion-workbook-registry";
import { loadFrozenWorkbookV31DeterministicImport } from "../workbook-v31-deterministic-core";
import { loadPublishedSmartShortlistData } from "./server-data";

vi.mock("./cohort", () => ({ smartShortlistCandidates: [] }));
vi.mock("./owned-affordability-records", () => ({ ownedAffordabilityRecords: [] }));
vi.mock("../supabase", () => ({
  isSupabaseConfigured: () => true,
  getSupabaseConfig: () => ({ url: "https://catalog.invalid" }),
  getSupabaseAuthHeaders: () => ({}),
}));
const registry = EXPANSION_WORKBOOK_REGISTRY.filter(entry =>
  ["legacy-batch-20", "legacy-carryover-batch-20-07"].includes(entry.registryId));
const rows = (await Promise.all(registry.map(async entry => {
  const workbook = await loadFrozenWorkbookV31DeterministicImport(entry.workbookPath);
  if (!workbook.canonicalDestinations) throw new Error("Missing canonical fixture destinations");
  return workbook.canonicalDestinations.map(destination => ({
    id: `id-${destination.identity.destinationKey}`,
    destination_key: destination.identity.destinationKey,
    slug: destination.identity.slug,
    status: "published",
  }));
}))).flat();
afterEach(() => vi.unstubAllGlobals());

describe("published authoritative discovery", () => {
  it("includes both registry environments and excludes draft/review from every aligned output", async () => {
    const catalog = rows.map((row, index) => ({ ...row, status: index === 0 ? "draft" : index === 1 ? "review" : "published" }));
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => catalog });
    vi.stubGlobal("fetch", fetcher);
    vi.stubEnv("NODE_ENV", "production");
    try {
      const data = await loadPublishedSmartShortlistData(registry);
      const expected = catalog.filter(row => row.status === "published").map(row => row.destination_key).sort();
      expect(data.candidates.map(row => row.key).sort()).toEqual(expected);
      expect(data.intelligence.map(row => row.key).sort()).toEqual(expected);
      expect(data.intelligence.every(row => row.healthcareEvidenceScope === "PRIVATE_CARE_AVAILABILITY_ONLY")).toBe(true);
      expect(data.destinationMedia.map(row => row.key).sort()).toEqual(expected);
      expect(data.affordabilityRecords.every(row => expected.includes(row.destinationKey))).toBe(true);
      expect(data.candidates.some(row => registry[0].expectedDestinationKeys.includes(row.key))).toBe(true);
      expect(data.candidates.some(row => registry[1].expectedDestinationKeys.includes(row.key))).toBe(true);
      expect(fetcher.mock.calls[0][1].cache).toBe("no-store");
    } finally { vi.unstubAllEnvs(); }
  });
  it("excludes ambiguous or mismatched identities and never admits unregistered catalog rows", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => [
      ...rows, rows[0], { ...rows[1], id: "conflict" },
      { id: "legacy", destination_key: "legacy-only", slug: "legacy-only", status: "published" },
    ] }));
    const data = await loadPublishedSmartShortlistData(registry);
    expect(data.candidates).toHaveLength(rows.length - 2);
    expect(data.candidates.some(row => [rows[0].destination_key, rows[1].destination_key, "legacy-only"].includes(row.key))).toBe(false);
  });
  it.each([401, 403])("fails closed when publication reads return HTTP %s", async status => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status }));
    const data = await loadPublishedSmartShortlistData(registry);
    expect(data).toEqual({ candidates: [], intelligence: [], destinationMedia: [], affordabilityRecords: [] });
  });
});
