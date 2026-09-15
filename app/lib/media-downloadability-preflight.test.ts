import { describe, expect, it } from "vitest";
import { inspectMediaPreflightRow } from "./media-downloadability-preflight";

describe("media downloadability preflight", () => {
  it("accepts exact supported source pages with a local asset", () => {
    expect(inspectMediaPreflightRow({ mediaKey: "m1", sourceUrl: "https://www.pexels.com/photo/123/", localPath: "/images/m1.jpg" }, true)).toEqual([]);
  });
  it("blocks generic search pages and missing local assets", () => {
    expect(inspectMediaPreflightRow({ mediaKey: "m1", sourceUrl: "https://www.pexels.com/search/city/", localPath: "/images/m1.jpg" }, false)).toEqual(["GENERIC_SEARCH_URL", "MISSING_LOCAL_ASSET"]);
  });
});
