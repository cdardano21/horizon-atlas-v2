import { beforeEach, describe, expect, it, vi } from "vitest";
import { jsonResponse, mockAdminAuthedFetch } from "../../../../../test-utils/adminRouteFetchMocks";

const { cookieGetMock, cookiesMock } = vi.hoisted(() => {
  const cookieGetMock = vi.fn();
  const cookiesMock = vi.fn(async () => ({ get: cookieGetMock }));
  return { cookieGetMock, cookiesMock };
});

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("../../../../../lib/supabase", () => ({
  isSupabaseConfigured: () => true,
  getSupabaseConfig: () => ({
    url: "https://example.supabase.co",
    anonKey: "anon-key",
  }),
}));

import { DELETE, PATCH } from "./route";

const assetContext = (assetType: string, assetId: string) => ({
  params: Promise.resolve({ assetType, assetId }),
});

describe("admin destination-asset by-id route", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    cookieGetMock.mockReset();
    cookiesMock.mockClear();
  });

  it("returns 400 for PATCH with invalid asset type", async () => {
    const response = await PATCH(
      new Request("http://localhost:3000/api/admin/destination-assets/unknown/a1", {
        method: "PATCH",
        body: JSON.stringify({ label: "Updated label" }),
      }),
      assetContext("unknown", "a1"),
    );

    expect(response.status).toBe(400);
  });

  it("returns 403 for PATCH when unauthenticated", async () => {
    cookieGetMock.mockReturnValue(undefined);

    const response = await PATCH(
      new Request("http://localhost:3000/api/admin/destination-assets/media/a1", {
        method: "PATCH",
        body: JSON.stringify({ label: "Updated label" }),
      }),
      assetContext("media", "a1"),
    );

    expect(response.status).toBe(403);
  });

  it("returns 200 for successful PATCH", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    mockAdminAuthedFetch((url, init) => {
      if (url.includes("/rest/v1/destination_media_assets?id=eq.a1") && init?.method === "PATCH") {
        return jsonResponse({ status: 200, body: {} });
      }
      return null;
    });

    const response = await PATCH(
      new Request("http://localhost:3000/api/admin/destination-assets/media/a1", {
        method: "PATCH",
        body: JSON.stringify({ label: "Updated label", kind: "gallery" }),
      }),
      assetContext("media", "a1"),
    );

    const payload = (await response.json()) as { success?: boolean };
    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
  });

  it("maps media PATCH payload fields and defaults", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });
    let capturedBody: Record<string, string> | null = null;

    mockAdminAuthedFetch((url, init) => {
      if (url.includes("/rest/v1/destination_media_assets?id=eq.a1") && init?.method === "PATCH") {
        capturedBody = JSON.parse(String(init.body)) as Record<string, string>;
        return jsonResponse({ status: 200, body: {} });
      }
      return null;
    });

    const response = await PATCH(
      new Request("http://localhost:3000/api/admin/destination-assets/media/a1", {
        method: "PATCH",
        body: JSON.stringify({ label: "  Updated label  ", provider: "", kind: "" }),
      }),
      assetContext("media", "a1"),
    );

    expect(response.status).toBe(200);
    expect(capturedBody).toEqual({
      caption: "Updated label",
      alt_text: "Updated label",
      provider: "manual",
      kind: "gallery",
    });
  });

  it("maps resource and video PATCH payloads with normalization", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });
    const capturedBodies: Record<string, string>[] = [];

    mockAdminAuthedFetch((url, init) => {
      if (url.includes("/rest/v1/destination_resource_links?id=eq.a2") && init?.method === "PATCH") {
        capturedBodies.push(JSON.parse(String(init.body)) as Record<string, string>);
        return jsonResponse({ status: 200, body: {} });
      }
      if (url.includes("/rest/v1/destination_video_links?id=eq.a3") && init?.method === "PATCH") {
        capturedBodies.push(JSON.parse(String(init.body)) as Record<string, string>);
        return jsonResponse({ status: 200, body: {} });
      }
      return null;
    });

    const resourceResponse = await PATCH(
      new Request("http://localhost:3000/api/admin/destination-assets/resource/a2", {
        method: "PATCH",
        body: JSON.stringify({ category: "", provider: "", label: "  Visa Link  " }),
      }),
      assetContext("resource", "a2"),
    );

    const videoResponse = await PATCH(
      new Request("http://localhost:3000/api/admin/destination-assets/video/a3", {
        method: "PATCH",
        body: JSON.stringify({ provider: "", url: " https://youtube.com/watch?v=abc ", embedUrl: "" }),
      }),
      assetContext("video", "a3"),
    );

    expect(resourceResponse.status).toBe(200);
    expect(videoResponse.status).toBe(200);
    expect(capturedBodies).toEqual([
      {
        category: "guides",
        provider: "manual",
        label: "Visa Link",
      },
      {
        provider: "custom",
        url: "https://youtube.com/watch?v=abc",
        embed_url: "https://www.youtube.com/embed/abc",
      },
    ]);
  });

  it("propagates PATCH upstream failure status", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    mockAdminAuthedFetch((url, init) => {
      if (url.includes("/rest/v1/destination_resource_links?id=eq.a2") && init?.method === "PATCH") {
        return jsonResponse({ status: 422, body: { message: "invalid category" } });
      }
      return null;
    });

    const response = await PATCH(
      new Request("http://localhost:3000/api/admin/destination-assets/resource/a2", {
        method: "PATCH",
        body: JSON.stringify({ category: "bad-category" }),
      }),
      assetContext("resource", "a2"),
    );

    expect(response.status).toBe(422);
  });

  it("returns 400 for DELETE with invalid asset type", async () => {
    const response = await DELETE(
      new Request("http://localhost:3000/api/admin/destination-assets/unknown/a1", { method: "DELETE" }),
      assetContext("unknown", "a1"),
    );

    expect(response.status).toBe(400);
  });

  it("returns 403 for DELETE when unauthenticated", async () => {
    cookieGetMock.mockReturnValue(undefined);

    const response = await DELETE(
      new Request("http://localhost:3000/api/admin/destination-assets/video/a3", { method: "DELETE" }),
      assetContext("video", "a3"),
    );

    expect(response.status).toBe(403);
  });

  it("returns 200 for successful DELETE", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    mockAdminAuthedFetch((url, init) => {
      if (url.includes("/rest/v1/destination_video_links?id=eq.a3") && init?.method === "DELETE") {
        return jsonResponse({ status: 200, body: {} });
      }
      return null;
    });

    const response = await DELETE(
      new Request("http://localhost:3000/api/admin/destination-assets/video/a3", { method: "DELETE" }),
      assetContext("video", "a3"),
    );

    const payload = (await response.json()) as { success?: boolean };
    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
  });

  it("propagates DELETE upstream failure status", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    mockAdminAuthedFetch((url, init) => {
      if (url.includes("/rest/v1/destination_video_links?id=eq.a3") && init?.method === "DELETE") {
        return jsonResponse({ status: 500, body: { message: "storage unavailable" } });
      }
      return null;
    });

    const response = await DELETE(
      new Request("http://localhost:3000/api/admin/destination-assets/video/a3", { method: "DELETE" }),
      assetContext("video", "a3"),
    );

    expect(response.status).toBe(500);
  });
});
