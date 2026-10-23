import { beforeEach, describe, expect, it, vi } from "vitest";
import sitemap, { dynamic } from "../../sitemap";
import robots from "../../robots";
import { loadPublishedExploreProjection } from "../explore-projection";
vi.mock("../explore-projection", () => ({ loadPublishedExploreProjection: vi.fn() }));
const load = vi.mocked(loadPublishedExploreProjection);
const candidate = { key: "published-spain", slug: "published-spain", name: "Published", country: "Spain", summary: "Public" };
beforeEach(() => vi.resetAllMocks());
describe("public sitemap", () => {
  it("uses only eligible discovery candidates and unique canonical URLs", async () => {
    load.mockResolvedValue({ candidates: [candidate, candidate], destinationMedia: [] });
    const urls = (await sitemap()).map(item => item.url);
    expect(urls).toHaveLength(11);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls).toContain("https://www.destinationfinderai.com/destinations/published-spain");
    expect(urls.every(url => new URL(url).origin === "https://www.destinationfinderai.com")).toBe(true);
    expect(urls.some(url => /admin|preview|login|signup|profile|results/.test(url))).toBe(false);
  });
  it("does not retain a destination after publication evidence disappears", async () => {
    load.mockResolvedValueOnce({ candidates: [candidate], destinationMedia: [] })
      .mockResolvedValueOnce({ candidates: [], destinationMedia: [] });
    expect(await sitemap()).toHaveLength(11);
    expect(await sitemap()).toHaveLength(10);
    expect(dynamic).toBe("force-dynamic");
  });
  it("does not fall back when projection integrity fails", async () => {
    load.mockRejectedValue(new Error("invalid projection"));
    await expect(sitemap()).rejects.toThrow("invalid projection");
  });
  it("advertises the canonical sitemap without blocking destinations", () => {
    expect(robots()).toEqual({ rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/", "/profile", "/login", "/signup"] }, sitemap: "https://www.destinationfinderai.com/sitemap.xml" });
  });
});
