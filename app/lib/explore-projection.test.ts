// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { EXPANSION_WORKBOOK_REGISTRY } from "./expansion-workbook-registry";
import {
  exploreProjectionPath, validateExploreProjection, loadPublishedExploreProjection,
  projectionDigest, selectExploreCandidate, type ExploreProjection,
} from "./explore-projection";
import * as workbookCore from "./workbook-v31-deterministic-core";
import { loadSmartShortlistData } from "./smart-shortlist/server-data";
import { buildExploreDestinationList } from "./explore-destinations";
import type { Destination } from "./destinations";

const artifactRead = vi.hoisted(() => ({ failure: false, malformed: false }));
vi.mock("node:fs", async importOriginal => {
  const actual = await importOriginal<typeof import("node:fs")>();
  return { ...actual, readFileSync: (...args: Parameters<typeof actual.readFileSync>) => {
    if (String(args[0]).endsWith("generated-explore-projection.json")) {
      if (artifactRead.failure) throw new Error("ENOENT");
      if (artifactRead.malformed) return "{invalid";
    }
    return actual.readFileSync(...args);
  } };
});
vi.mock("./supabase", () => ({
  isSupabaseConfigured: () => true,
  getSupabaseConfig: () => ({ url: "https://test.supabase.co" }),
  getSupabaseAuthHeaders: () => ({}),
}));
afterEach(() => vi.unstubAllGlobals());
const artifact = (): ExploreProjection => JSON.parse(readFileSync(exploreProjectionPath, "utf8"));
const published = (key: string, status = "published") => ({ id: `id-${key}`, destination_key: key, slug: artifact().data.candidates.find(c => c.key === key)!.slug, status });

beforeEach(() => {
  vi.unstubAllGlobals();
  artifactRead.failure = false; artifactRead.malformed = false;
});

describe("validated Explore projection", () => {
  it("preserves every registered identity, order, candidate field and hero against the production workbook pipeline", async () => {
    const source = await loadSmartShortlistData(EXPANSION_WORKBOOK_REGISTRY, true);
    const registered = new Set(EXPANSION_WORKBOOK_REGISTRY.flatMap(entry => [...entry.expectedDestinationKeys]));
    const expected = {
      candidates: source.candidates.filter(c => registered.has(c.key)).map(selectExploreCandidate),
      destinationMedia: source.destinationMedia.filter(m => registered.has(m.key)),
    };
    expect(registered.size).toBe(245);
    expect(validateExploreProjection(artifact())).toEqual(expected);
    // Empty public data exercises every workbook summary and hero fallback, not just
    // today's successful catalog/media responses.
    expect(JSON.stringify(buildExploreDestinationList([], expected)))
      .toBe(JSON.stringify(buildExploreDestinationList([], artifact().data)));
    const publicRows = expected.candidates.map(c => ({
      slug: c.slug, city: "public name", country: c.country, emoji: "", match: 0, description: "public description",
      overview: "public overview", images: [{ src: "https://example.org/image.jpg", alt: "alt", caption: "credit" }],
      tags: ["tag"], climate: "climate", lifestyle: "lifestyle", transportation: "transport",
    } satisfies Destination));
    expect(JSON.stringify(buildExploreDestinationList(publicRows, expected)))
      .toBe(JSON.stringify(buildExploreDestinationList(publicRows, artifact().data)));
  }, 60_000);

  it("never calls the workbook decoder at request time", async () => {
    const decoder = vi.spyOn(workbookCore, "loadFrozenWorkbookV31DeterministicImport");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("[]")));
    try {
      await loadPublishedExploreProjection();
      expect(decoder).not.toHaveBeenCalled();
    } finally { decoder.mockRestore(); }
  });
  it("rejects missing artifacts without falling back", async () => {
    artifactRead.failure = true;
    await expect(loadPublishedExploreProjection()).rejects.toThrow("ENOENT");
  });
  it("rejects invalid JSON without falling back", async () => {
    artifactRead.malformed = true;
    await expect(loadPublishedExploreProjection()).rejects.toThrow();
  });
  it("rejects corrupt content", () => {
    const value = artifact(); value.data.candidates[0].summary += "changed";
    expect(() => validateExploreProjection(value)).toThrow(/stale or corrupt/);
  });
  it("rejects stale registry ownership or pins", () => {
    expect(() => validateExploreProjection(artifact(), EXPANSION_WORKBOOK_REGISTRY.slice(1))).toThrow(/stale or corrupt/);
  });
  it("rejects old format versions", () => {
    const value = artifact(); value.version++;
    expect(() => validateExploreProjection(value)).toThrow(/stale or corrupt/);
  });
  it("rejects altered workbook bytes", () => {
    expect(() => validateExploreProjection(artifact(), EXPANSION_WORKBOOK_REGISTRY, () => Buffer.from("changed")))
      .toThrow(/SHA-256/);
  });
  it("does not accept duplicate identities even with a matching digest", () => {
    const value = artifact(); value.data = { ...value.data, candidates: value.data.candidates.map((candidate, index) => index === 1 ? value.data.candidates[0] : candidate) }; value.digest = projectionDigest(value.data);
    expect(() => validateExploreProjection(value)).toThrow(/ownership/);
  });
  it("checks every pinned workbook on every load", () => {
    const reader = vi.fn((file: string) => readFileSync(file));
    validateExploreProjection(artifact(), EXPANSION_WORKBOOK_REGISTRY, reader);
    expect(reader).toHaveBeenCalledTimes(16);
    for (let i = 0; i < 16; i++) expect(createHash("sha256").update(reader.mock.results[i].value).digest("hex"))
      .toBe(EXPANSION_WORKBOOK_REGISTRY[i].expectedSha256);
  });
  it("reflects publication and unpublication without regeneration and excludes draft/review", async () => {
    const keys = artifact().data.candidates.slice(0, 3).map(c => c.key);
    const fetcher = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify([
      published(keys[0]), published(keys[1], "draft"), published(keys[2], "review"),
    ]))).mockResolvedValueOnce(new Response(JSON.stringify([published(keys[1])])));
    vi.stubGlobal("fetch", fetcher);
    expect((await loadPublishedExploreProjection()).candidates.map(c => c.key)).toEqual([keys[0]]);
    expect((await loadPublishedExploreProjection()).candidates.map(c => c.key)).toEqual([keys[1]]);
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher.mock.calls.every(([, options]) => options.cache === "no-store")).toBe(true);
  });
  it.each([401, 403, 500])("excludes all identities on HTTP %s", async status => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("error", { status })));
    expect(await loadPublishedExploreProjection()).toEqual({ candidates: [], destinationMedia: [] });
  });
  it("excludes identities on network failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    expect((await loadPublishedExploreProjection()).candidates).toEqual([]);
  });
  it("rejects ambiguous and mismatched catalog identities", async () => {
    const keys = artifact().data.candidates.slice(0, 2).map(c => c.key);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify([
      published(keys[0]), published(keys[0]), { ...published(keys[1]), slug: "wrong-slug" },
    ]))));
    expect((await loadPublishedExploreProjection()).candidates).toEqual([]);
  });
});
