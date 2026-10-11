// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { EXPANSION_WORKBOOK_REGISTRY } from "../expansion-workbook-registry";
import { projectionDigest } from "../explore-projection";
import * as workbookCore from "../workbook-v31-deterministic-core";
import { loadSmartShortlistData, loadPublishedSmartShortlistData } from "./server-data";
import { evaluateShortlist } from "./evaluator";
import {
  createSmartShortlistProjection, loadPublishedSmartShortlistProjection,
  smartShortlistProjectionPath, validateSmartShortlistProjection,
  type SmartShortlistProjection,
} from "./projection";

const reads = vi.hoisted(() => ({ mode: "normal" }));
vi.mock("node:fs", async importOriginal => {
  const actual = await importOriginal<typeof import("node:fs")>();
  return { ...actual, readFileSync: (...args: Parameters<typeof actual.readFileSync>) => {
    if (String(args[0]).endsWith("generated-smart-shortlist-projection.json")) {
      if (reads.mode === "missing") throw new Error("ENOENT");
      if (reads.mode === "malformed") return "{invalid";
    }
    return actual.readFileSync(...args);
  } };
});
vi.mock("../supabase", () => ({
  isSupabaseConfigured: () => true,
  getSupabaseConfig: () => ({ url: "https://catalog.invalid" }),
  getSupabaseAuthHeaders: () => ({}),
}));
const artifact = (): SmartShortlistProjection => JSON.parse(readFileSync(smartShortlistProjectionPath, "utf8"));
const row = (index: number, status = "published") => {
  const c = artifact().data.candidates[index];
  return { id: `id-${c.key}`, destination_key: c.key, slug: c.slug, status };
};
afterEach(() => { reads.mode = "normal"; vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("complete matching projection", () => {
  it("preserves serialized matching inputs and evaluated outcomes for all 250 identities", async () => {
    const original = await loadSmartShortlistData(EXPANSION_WORKBOOK_REGISTRY, true);
    const expected = createSmartShortlistProjection(original);
    const actual = artifact();
    expect(actual.data.candidates).toHaveLength(250);
    expect(JSON.stringify(actual)).toBe(JSON.stringify(expected));
    const restored = validateSmartShortlistProjection(actual);
    expect(JSON.stringify(restored)).toBe(JSON.stringify(expected.data));
    expect(restored).toStrictEqual(expected.data);
    const merged = (data: typeof original) => data.candidates.map(c => ({ ...c, ...data.intelligence.find(i => i.key === c.key) }));
    for (const minimum of ["BASIC_ACCESS", "GOOD_PRIVATE_AVAILABLE", "INTERNATIONAL_STANDARD"] as const) {
      const profile = { healthcare: { minimum, mode: "MUST_HAVE" as const } };
      expect(evaluateShortlist(merged(restored), profile)).toEqual(evaluateShortlist(merged(expected.data), profile));
    }
  }, 60_000);
  it("normal public loading never calls the decoder and reads publication afresh", async () => {
    const decoder = vi.spyOn(workbookCore, "loadFrozenWorkbookV31DeterministicImport");
    const fetcher = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify([row(0)])))
      .mockResolvedValueOnce(new Response(JSON.stringify([row(1)])));
    vi.stubGlobal("fetch", fetcher);
    const first = await loadPublishedSmartShortlistData();
    const second = await loadPublishedSmartShortlistData();
    expect(first.candidates.map(c => c.key)).toEqual([row(0).destination_key]);
    expect(second.candidates.map(c => c.key)).toEqual([row(1).destination_key]);
    expect(decoder).not.toHaveBeenCalled();
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher.mock.calls.every(([, options]) => options.cache === "no-store")).toBe(true);
  });
  it("excludes draft/review and Legacy-only identities from all aligned inputs", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify([
      row(0), row(1, "draft"), row(2, "review"),
      { id: "legacy", destination_key: "legacy-only", slug: "legacy-only", status: "published" },
    ]))));
    const data = await loadPublishedSmartShortlistProjection();
    const key = row(0).destination_key;
    expect(data.candidates.map(c => c.key)).toEqual([key]);
    expect(data.intelligence.map(c => c.key)).toEqual([key]);
    expect(data.destinationMedia.map(c => c.key)).toEqual([key]);
    expect(data.affordabilityRecords.every(c => c.destinationKey === key)).toBe(true);
  });
  it.each([401, 403, 500])("fails closed on publication HTTP %s", async status => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("error", { status })));
    expect(await loadPublishedSmartShortlistProjection()).toEqual({ candidates: [], intelligence: [], destinationMedia: [], affordabilityRecords: [] });
  });
  it.each(["network", "malformed"])("fails closed on %s publication response", async mode => {
    vi.stubGlobal("fetch", mode === "network" ? vi.fn().mockRejectedValue(new Error("offline")) : vi.fn().mockResolvedValue(new Response("invalid")));
    expect((await loadPublishedSmartShortlistProjection()).candidates).toEqual([]);
  });
  it("rejects ambiguous, mismatched and missing catalog identities", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify([
      row(0), row(0), { ...row(1), slug: "wrong" }, { ...row(2), id: "" },
    ]))));
    expect((await loadPublishedSmartShortlistProjection()).candidates).toEqual([]);
  });
  it.each(["missing", "malformed"])("rejects %s projection without decoding or fallback", async mode => {
    const decoder = vi.spyOn(workbookCore, "loadFrozenWorkbookV31DeterministicImport");
    reads.mode = mode;
    await expect(loadPublishedSmartShortlistData()).rejects.toThrow();
    expect(decoder).not.toHaveBeenCalled();
  });
  it.each(["version", "sourceSignature", "digest"] as const)("rejects stale %s", key => {
    const value = artifact();
    if (key === "version") value.version++; else value[key] += "stale";
    expect(() => validateSmartShortlistProjection(value)).toThrow(/stale or corrupt/);
  });
  it("rejects changed registry pins and altered workbook bytes", () => {
    expect(() => validateSmartShortlistProjection(artifact(), EXPANSION_WORKBOOK_REGISTRY.slice(1))).toThrow(/stale or corrupt/);
    expect(() => validateSmartShortlistProjection(artifact(), EXPANSION_WORKBOOK_REGISTRY, () => Buffer.from("changed"))).toThrow(/SHA-256/);
  });
  it("checks all twenty-one pinned workbooks on each validation", () => {
    const reader = vi.fn((file: string) => readFileSync(file));
    validateSmartShortlistProjection(artifact(), EXPANSION_WORKBOOK_REGISTRY, reader);
    expect(reader).toHaveBeenCalledTimes(21);
  });
  it("rejects corrupted matching evidence", () => {
    const value = artifact(); value.data.intelligence = [];
    expect(() => validateSmartShortlistProjection(value)).toThrow(/stale or corrupt/);
  });
  it.each(["intelligence", "affordabilityRecords"] as const)("rejects misowned %s even with a recomputed digest", key => {
    const value = artifact();
    if (key === "intelligence") value.data.intelligence = value.data.intelligence.slice(1);
    else value.data.affordabilityRecords = [...value.data.affordabilityRecords, { ...value.data.affordabilityRecords[0], destinationKey: "legacy-only" }];
    value.digest = projectionDigest(value.data);
    expect(() => validateSmartShortlistProjection(value)).toThrow(/ownership/);
  });
});
