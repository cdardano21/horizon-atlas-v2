// @vitest-environment node
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { beforeAll, afterEach, describe, expect, it, vi } from "vitest";
import { EXPANSION_WORKBOOK_REGISTRY } from "../expansion-workbook-registry";
import { loadFrozenWorkbookV31DeterministicImport, type DeterministicV31CanonicalDestination } from "../workbook-v31-deterministic-core";
import { hasRequiredOceanBeach, verifiedBeachAccessByDestination } from "./beach-access";
import { reviewedWorkbookBeachEvidence } from "./reviewed-workbook-beach-evidence";
import { loadPublishedSmartShortlistData } from "../smart-shortlist/server-data";

vi.mock("../supabase", () => ({
  isSupabaseConfigured: () => true,
  getSupabaseConfig: () => ({ url: "https://catalog.invalid" }),
  getSupabaseAuthHeaders: () => ({}),
}));
const supported = ["da-nang-vietnam", "funchal-portugal", "hua-hin-thailand", "monopoli-italy",
  "nafplio-greece", "nice-france", "paphos-cyprus", "santander-spain", "noosa-heads-australia", "the-hague-netherlands"];
const originals = new Map<string, { canonical: DeterministicV31CanonicalDestination; registryId: string; hash: string }>();
beforeAll(async () => {
  for (const entry of EXPANSION_WORKBOOK_REGISTRY) {
    const hash = createHash("sha256").update(readFileSync(entry.workbookPath)).digest("hex");
    expect(hash).toBe(entry.expectedSha256);
    const workbook = await loadFrozenWorkbookV31DeterministicImport(entry.workbookPath);
    for (const canonical of workbook.canonicalDestinations ?? []) {
      if (!originals.has(canonical.identity.destinationKey)) originals.set(canonical.identity.destinationKey, { canonical, registryId: entry.registryId, hash });
    }
  }
}, 60000);
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
function fixture(key = "nice-france") {
  const result = originals.get(key);
  if (!result) throw new Error(`Missing registered fixture ${key}`);
  return structuredClone(result);
}
function resolve(item: ReturnType<typeof fixture>) {
  return reviewedWorkbookBeachEvidence(item.canonical, item.registryId, item.hash);
}

describe("explicit reviewed workbook beach evidence", () => {
  it.each(supported)("qualifies exact verified authored record for %s", key => {
    const item = fixture(key);
    const evidence = resolve(item);
    expect(hasRequiredOceanBeach(evidence)).toBe(true);
    expect(evidence).toMatchObject({ accessType: "OCEAN_BEACH_DESTINATION", waterType: "OCEAN_SEA", verified: true, driveMinutes: null });
    expect(evidence?.sourceName).toBeTruthy();
    expect(evidence?.sourceUrl).toMatch(/^https?:\/\//);
    expect(Number.isFinite(Date.parse(evidence?.verifiedAt ?? ""))).toBe(true);
    expect(item).toEqual(fixture(key));
  });
  it("preserves Gijón and admits no unreviewed records among all 245 identities", () => {
    expect(originals.size).toBe(245);
    expect([...originals.values()].filter(row => resolve(row)).map(row => row.canonical.identity.destinationKey).sort()).toEqual([...supported].sort());
    expect(hasRequiredOceanBeach(verifiedBeachAccessByDestination["gijon-spain"])).toBe(true);
    expect(resolve(fixture("florianopolis-brazil"))).toBeUndefined();
    expect(originals.has("barcelona-spain")).toBe(false);
  });
  it.each(["registry", "pin", "identity", "record identity", "missing", "duplicate", "text", "verified", "date", "source", "url", "freshwater"])("rejects altered %s", change => {
    const item = fixture();
    const index = item.canonical.facts.findIndex(row => row.fact_key === "public_beach_and_accessibility_inventory");
    const row = item.canonical.facts[index];
    if (change === "registry") item.registryId = "future-workbook";
    if (change === "pin") item.hash = "0".repeat(64);
    if (change === "identity") item.canonical.identity.destinationKey = "barcelona-spain";
    if (change === "record identity") row.destination_key = "another-destination";
    if (change === "missing") item.canonical.facts.splice(index, 1);
    if (change === "duplicate") item.canonical.facts.push(structuredClone(row));
    if (change === "text") row.value_text = "A coastal city";
    if (change === "verified") row.verified = "0";
    if (change === "date") row.verified_at = null;
    if (change === "source") row.source_name = null;
    if (change === "url") row.source_url = "javascript:void(0)";
    if (change === "freshwater") row.value_text = "A freshwater lake beach";
    expect(resolve(item)).toBeUndefined();
  });
  it("keeps nearby opt-in, travel-time evidence, and freshwater exclusions unchanged", () => {
    for (const key of ["merida-mexico", "savannah-georgia-united-states"]) {
      const evidence = verifiedBeachAccessByDestination[key];
      expect(hasRequiredOceanBeach(evidence)).toBe(false);
      expect(hasRequiredOceanBeach(evidence, true)).toBe(true);
      expect(hasRequiredOceanBeach(evidence && { ...evidence, driveMinutes: null }, true)).toBe(false);
      expect(hasRequiredOceanBeach(evidence && { ...evidence, driveMinutes: 46 }, true)).toBe(false);
    }
    expect(hasRequiredOceanBeach(verifiedBeachAccessByDestination["queenstown-nz"], true)).toBe(false);
    expect(hasRequiredOceanBeach(verifiedBeachAccessByDestination["hoi-an-vn"], true)).toBe(false);
    expect(hasRequiredOceanBeach(undefined)).toBe(false);
  });
  it("passes evidence through the public loader but never overrides draft/review or registry membership", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => [
      ...[...originals.values()].map(({ canonical }) => ({ id: canonical.identity.destinationKey,
        destination_key: canonical.identity.destinationKey, slug: canonical.identity.slug,
        status: canonical.identity.destinationKey === "noosa-heads-australia" ? "draft"
          : canonical.identity.destinationKey === "the-hague-netherlands" ? "review" : "published" })),
      { id: "legacy", destination_key: "barcelona-spain", slug: "barcelona-spain", status: "published" },
    ] }));
    const result = await loadPublishedSmartShortlistData();
    for (const key of supported.filter(key => !["noosa-heads-australia", "the-hague-netherlands"].includes(key))) {
      expect(hasRequiredOceanBeach(result.intelligence.find(row => row.key === key)?.beachEvidence)).toBe(true);
    }
    for (const key of ["noosa-heads-australia", "the-hague-netherlands", "barcelona-spain"]) {
      expect(result.candidates.some(row => row.key === key)).toBe(false);
      expect(result.intelligence.some(row => row.key === key)).toBe(false);
    }
  }, 60000);
});
