import { beforeEach, describe, expect, it, vi } from "vitest";
import { jsonResponse, mockAdminAuthedFetch } from "../../../test-utils/adminRouteFetchMocks";

const { cookieGetMock, cookiesMock } = vi.hoisted(() => {
  const cookieGetMock = vi.fn();
  const cookiesMock = vi.fn(async () => ({ get: cookieGetMock }));
  return { cookieGetMock, cookiesMock };
});

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("../../../lib/supabase", () => ({
  isSupabaseConfigured: () => true,
  getSupabaseConfig: () => ({
    url: "https://example.supabase.co",
    anonKey: "anon-key",
  }),
}));

import { GET, POST } from "./route";

describe("admin destination-assets route", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    cookieGetMock.mockReset();
    cookiesMock.mockClear();
  });

  it("returns 403 for GET when unauthenticated", async () => {
    cookieGetMock.mockReturnValue(undefined);

    const response = await GET(new Request("http://localhost:3000/api/admin/destination-assets?destinationId=dest_1"));

    expect(response.status).toBe(403);
  });

  it("returns empty assets for GET when destinationId is not provided", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    const fetchMock = mockAdminAuthedFetch(() => null);

    const response = await GET(new Request("http://localhost:3000/api/admin/destination-assets"));
    const payload = (await response.json()) as { assets?: unknown[] };

    expect(response.status).toBe(200);
    expect(payload.assets).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("returns mapped assets from media/resource/video rows", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    mockAdminAuthedFetch((url) => {
      if (url.includes("/rest/v1/destination_media_assets?") && url.includes("destination_id=eq.dest_1")) {
        return jsonResponse({
          body: [
            {
              id: "m1",
              provider: "manual",
              url: "https://cdn/image-1.jpg",
              kind: "gallery",
              caption: "Beachfront",
              alt_text: null,
            },
          ],
        });
      }

      if (url.includes("/rest/v1/destination_resource_links?") && url.includes("destination_id=eq.dest_1")) {
        return jsonResponse({
          body: [
            {
              id: "r1",
              provider: "gov",
              url: "https://example.gov/visa",
              category: "visa",
              label: "Visa Guide",
            },
          ],
        });
      }

      if (url.includes("/rest/v1/destination_video_links?") && url.includes("destination_id=eq.dest_1")) {
        return jsonResponse({
          body: [
            {
              id: "v1",
              provider: "youtube",
              url: "https://youtube.com/watch?v=123",
              label: "City Walkthrough",
              embed_url: "https://youtube.com/embed/123",
            },
          ],
        });
      }

      return null;
    });

    const response = await GET(new Request("http://localhost:3000/api/admin/destination-assets?destinationId=dest_1"));
    const payload = (await response.json()) as {
      assets?: Array<{
        id: string;
        assetType: string;
        label: string;
        url: string;
        provider: string;
        category: string;
        kind: string;
        embedUrl: string;
      }>;
    };

    expect(response.status).toBe(200);
    expect(payload.assets).toEqual([
      {
        id: "m1",
        assetType: "media",
        label: "Beachfront",
        url: "https://cdn/image-1.jpg",
        provider: "manual",
        category: "",
        kind: "gallery",
        embedUrl: "",
      },
      {
        id: "r1",
        assetType: "resource",
        label: "Visa Guide",
        url: "https://example.gov/visa",
        provider: "gov",
        category: "visa",
        kind: "",
        embedUrl: "",
      },
      {
        id: "v1",
        assetType: "video",
        label: "City Walkthrough",
        url: "https://youtube.com/watch?v=123",
        provider: "youtube",
        category: "",
        kind: "",
        embedUrl: "https://youtube.com/embed/123",
      },
    ]);
  });

  it("returns 403 for POST when unauthenticated", async () => {
    cookieGetMock.mockReturnValue(undefined);

    const response = await POST(
      new Request("http://localhost:3000/api/admin/destination-assets", {
        method: "POST",
        body: JSON.stringify({ destinationId: "dest_1", assetType: "media", label: "Beach", url: "https://cdn/image.jpg" }),
      }),
    );

    expect(response.status).toBe(403);
  });

  it("returns 400 for POST validation when required fields are missing", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    const fetchMock = mockAdminAuthedFetch(() => null);

    const response = await POST(
      new Request("http://localhost:3000/api/admin/destination-assets", {
        method: "POST",
        body: JSON.stringify({ destinationId: "", assetType: "media", label: "", url: "" }),
      }),
    );

    expect(response.status).toBe(400);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("returns 200 for successful media POST", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    mockAdminAuthedFetch((url, init) => {
      if (url.endsWith("/rest/v1/destination_media_assets") && init?.method === "POST") {
        return jsonResponse({ status: 200, body: {} });
      }
      return null;
    });

    const response = await POST(
      new Request("http://localhost:3000/api/admin/destination-assets", {
        method: "POST",
        body: JSON.stringify({
          destinationId: "dest_1",
          assetType: "media",
          label: "Beachfront",
          url: "https://cdn/image.jpg",
          provider: "manual",
          kind: "gallery",
        }),
      }),
    );

    expect(response.status).toBe(200);
  });

  it("maps media POST payload fields and defaults", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });
    let capturedBody: Array<Record<string, string>> | null = null;

    mockAdminAuthedFetch((url, init) => {
      if (url.endsWith("/rest/v1/destination_media_assets") && init?.method === "POST") {
        capturedBody = JSON.parse(String(init.body)) as Array<Record<string, string>>;
        return jsonResponse({ status: 200, body: {} });
      }
      return null;
    });

    const response = await POST(
      new Request("http://localhost:3000/api/admin/destination-assets", {
        method: "POST",
        body: JSON.stringify({
          destinationId: "dest_1",
          assetType: "media",
          label: "  Beachfront  ",
          url: " https://cdn/image.jpg ",
          provider: "",
          kind: "",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(capturedBody).toEqual([
      {
        destination_id: "dest_1",
        kind: "gallery",
        provider: "manual",
        url: "https://cdn/image.jpg",
        caption: "Beachfront",
        alt_text: "Beachfront",
      },
    ]);
  });

  it("propagates resource POST upstream failure status", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    mockAdminAuthedFetch((url, init) => {
      if (url.endsWith("/rest/v1/destination_resource_links") && init?.method === "POST") {
        return jsonResponse({ status: 422, body: { message: "invalid category" } });
      }
      return null;
    });

    const response = await POST(
      new Request("http://localhost:3000/api/admin/destination-assets", {
        method: "POST",
        body: JSON.stringify({
          destinationId: "dest_1",
          assetType: "resource",
          label: "Visa Info",
          url: "https://example.gov/visa",
          category: "visa",
        }),
      }),
    );

    expect(response.status).toBe(422);
  });

  it("returns 200 for successful video POST", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    mockAdminAuthedFetch((url, init) => {
      if (url.endsWith("/rest/v1/destination_video_links") && init?.method === "POST") {
        return jsonResponse({ status: 200, body: {} });
      }
      return null;
    });

    const response = await POST(
      new Request("http://localhost:3000/api/admin/destination-assets", {
        method: "POST",
        body: JSON.stringify({
          destinationId: "dest_1",
          assetType: "video",
          label: "City Tour",
          url: "https://youtube.com/watch?v=abc",
        }),
      }),
    );

    expect(response.status).toBe(200);
  });

  it("maps resource and video POST payloads with normalization", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });
    const capturedBodies: Array<Array<Record<string, string>>> = [];

    mockAdminAuthedFetch((url, init) => {
      if (url.endsWith("/rest/v1/destination_resource_links") && init?.method === "POST") {
        capturedBodies.push(JSON.parse(String(init.body)) as Array<Record<string, string>>);
        return jsonResponse({ status: 200, body: {} });
      }

      if (url.endsWith("/rest/v1/destination_video_links") && init?.method === "POST") {
        capturedBodies.push(JSON.parse(String(init.body)) as Array<Record<string, string>>);
        return jsonResponse({ status: 200, body: {} });
      }

      return null;
    });

    const resourceResponse = await POST(
      new Request("http://localhost:3000/api/admin/destination-assets", {
        method: "POST",
        body: JSON.stringify({
          destinationId: "dest_1",
          assetType: "resource",
          label: "  Visa Info  ",
          url: " https://example.gov/visa ",
          category: "",
          provider: "",
        }),
      }),
    );

    const videoResponse = await POST(
      new Request("http://localhost:3000/api/admin/destination-assets", {
        method: "POST",
        body: JSON.stringify({
          destinationId: "dest_1",
          assetType: "video",
          label: "  City Tour  ",
          url: " https://youtube.com/watch?v=abc ",
          provider: "",
        }),
      }),
    );

    expect(resourceResponse.status).toBe(200);
    expect(videoResponse.status).toBe(200);
    expect(capturedBodies).toEqual([
      [
        {
          destination_id: "dest_1",
          category: "guides",
          label: "Visa Info",
          provider: "manual",
          url: "https://example.gov/visa",
        },
      ],
      [
        {
          destination_id: "dest_1",
          provider: "custom",
          label: "City Tour",
          url: "https://youtube.com/watch?v=abc",
          embed_url: "https://www.youtube.com/embed/abc",
        },
      ],
    ]);
  });
});
