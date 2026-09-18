import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const imageHeaders = { "content-type": "image/jpeg" };
let cacheDirectory = "";

function requestFor(source: string) {
  return new Request(`http://localhost/api/destination-image?src=${encodeURIComponent(source)}`);
}

beforeEach(async () => {
  cacheDirectory = await mkdtemp(path.join(tmpdir(), "destination-images-"));
  process.env.DESTINATION_IMAGE_CACHE_DIR = cacheDirectory;
});

afterEach(async () => {
  vi.unstubAllGlobals();
  delete process.env.DESTINATION_IMAGE_CACHE_DIR;
  await rm(cacheDirectory, { force: true, recursive: true });
});

describe("destination image delivery", () => {
  it("rejects unapproved image hosts without making an upstream request", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(requestFor("https://example.com/image.jpg"));

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("coalesces duplicate requests and reuses the successful disk cache", async () => {
    const source = "https://upload.wikimedia.org/example/coalesced.jpg";
    const fetchMock = vi.fn(async () => new Response(new Uint8Array([1, 2, 3]), { headers: imageHeaders }));
    vi.stubGlobal("fetch", fetchMock);

    const responses = await Promise.all([
      GET(requestFor(source)),
      GET(requestFor(source)),
      GET(requestFor(source)),
    ]);
    const cachedResponse = await GET(requestFor(source));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(responses.every((response) => response.status === 200)).toBe(true);
    expect(cachedResponse.headers.get("cache-control")).toContain("stale-while-revalidate");
    expect([...new Uint8Array(await cachedResponse.arrayBuffer())]).toEqual([1, 2, 3]);
  });

  it("requests an official bounded rendition for the unchanged Commons source URL", async () => {
    const source = "https://commons.wikimedia.org/wiki/Special:FilePath/example.jpg";
    const fetchMock = vi.fn(async () => new Response(new Uint8Array([7, 8, 9]), { headers: imageHeaders }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(requestFor(source));

    expect(response.status).toBe(200);
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(`${source}?width=1280`);
  });

  it("serializes distinct uncached requests and retries a rate-limited response", async () => {
    let activeRequests = 0;
    let maximumActiveRequests = 0;
    let firstAttempt = true;
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      activeRequests += 1;
      maximumActiveRequests = Math.max(maximumActiveRequests, activeRequests);
      await new Promise((resolve) => setTimeout(resolve, 5));
      activeRequests -= 1;
      if (String(input).includes("retry.jpg") && firstAttempt) {
        firstAttempt = false;
        return new Response(null, { status: 429, headers: { "retry-after": "0.001" } });
      }
      return new Response(new Uint8Array([4, 5, 6]), { headers: imageHeaders });
    });
    vi.stubGlobal("fetch", fetchMock);

    const responses = await Promise.all([
      GET(requestFor("https://images.unsplash.com/serial.jpg")),
      GET(requestFor("https://upload.wikimedia.org/retry.jpg")),
    ]);

    expect(responses.every((response) => response.status === 200)).toBe(true);
    expect(maximumActiveRequests).toBe(1);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});