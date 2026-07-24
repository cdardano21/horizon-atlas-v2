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

import { DELETE, GET, PATCH, POST } from "./route";

describe("destination-tags route", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    cookieGetMock.mockReset();
    cookiesMock.mockClear();
  });

  it("returns 403 when no auth token is present", async () => {
    cookieGetMock.mockReturnValue(undefined);

    const response = await POST(
      new Request("http://localhost:3000/api/admin/destination-tags", {
        method: "POST",
        body: JSON.stringify({ destinationId: "dest_1", tag: "healthcare" }),
      }),
    );

    expect(response.status).toBe(403);
  });

  it("returns 400 for invalid POST payload", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    const fetchMock = mockAdminAuthedFetch(() => null);

    const response = await POST(
      new Request("http://localhost:3000/api/admin/destination-tags", {
        method: "POST",
        body: JSON.stringify({ destinationId: "", tag: "" }),
      }),
    );

    expect(response.status).toBe(400);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("returns 409 when POST hits duplicate-tag constraint", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    mockAdminAuthedFetch((url) => {
      if (url.endsWith("/rest/v1/destination_tags")) {
        return jsonResponse({
          status: 409,
          body: { code: "23505", message: "duplicate key value violates unique constraint" },
        });
      }
      return null;
    });

    const response = await POST(
      new Request("http://localhost:3000/api/admin/destination-tags", {
        method: "POST",
        body: JSON.stringify({ destinationId: "dest_1", tag: "healthcare" }),
      }),
    );

    const payload = (await response.json()) as { error?: string };
    expect(response.status).toBe(409);
    expect(payload.error).toBe("Tag already exists for this destination.");
  });

  it("returns 200 for successful PATCH rename", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    mockAdminAuthedFetch((url) => {
      if (url.includes("/rest/v1/destination_tags") && url.includes("destination_id=eq.dest_1") && url.includes("tag=eq.healthcare")) {
        return jsonResponse({ status: 200, body: {} });
      }
      return null;
    });

    const response = await PATCH(
      new Request("http://localhost:3000/api/admin/destination-tags", {
        method: "PATCH",
        body: JSON.stringify({ destinationId: "dest_1", currentTag: "healthcare", nextTag: "coastal" }),
      }),
    );

    expect(response.status).toBe(200);
  });

  it("returns 409 when PATCH rename hits duplicate-tag constraint", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    mockAdminAuthedFetch((url) => {
      if (url.includes("/rest/v1/destination_tags") && url.includes("destination_id=eq.dest_1") && url.includes("tag=eq.healthcare")) {
        return jsonResponse({
          status: 409,
          body: { code: "23505", message: "duplicate key value violates unique constraint" },
        });
      }
      return null;
    });

    const response = await PATCH(
      new Request("http://localhost:3000/api/admin/destination-tags", {
        method: "PATCH",
        body: JSON.stringify({ destinationId: "dest_1", currentTag: "healthcare", nextTag: "coastal" }),
      }),
    );

    const payload = (await response.json()) as { error?: string };
    expect(response.status).toBe(409);
    expect(payload.error).toBe("Tag already exists for this destination.");
  });

  it("returns 403 for GET when unauthenticated", async () => {
    cookieGetMock.mockReturnValue(undefined);

    const response = await GET(new Request("http://localhost:3000/api/admin/destination-tags?destinationId=dest_1"));

    expect(response.status).toBe(403);
  });

  it("returns tags for successful GET", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    mockAdminAuthedFetch((url) => {
      if (url.includes("/rest/v1/destination_tags?select=tag") && url.includes("destination_id=eq.dest_1")) {
        return jsonResponse({ body: [{ tag: "coastal" }, { tag: "healthcare" }] });
      }
      return null;
    });

    const response = await GET(new Request("http://localhost:3000/api/admin/destination-tags?destinationId=dest_1"));
    const payload = (await response.json()) as { tags?: string[] };

    expect(response.status).toBe(200);
    expect(payload.tags).toEqual(["coastal", "healthcare"]);
  });

  it("propagates GET upstream failure status", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    mockAdminAuthedFetch((url) => {
      if (url.includes("/rest/v1/destination_tags?select=tag") && url.includes("destination_id=eq.dest_1")) {
        return jsonResponse({ status: 503, body: { message: "service unavailable" } });
      }
      return null;
    });

    const response = await GET(new Request("http://localhost:3000/api/admin/destination-tags?destinationId=dest_1"));

    expect(response.status).toBe(503);
  });

  it("returns 400 for DELETE payload validation", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    mockAdminAuthedFetch(() => null);

    const response = await DELETE(
      new Request("http://localhost:3000/api/admin/destination-tags", {
        method: "DELETE",
        body: JSON.stringify({ destinationId: "", tag: "" }),
      }),
    );

    expect(response.status).toBe(400);
  });

  it("returns 200 for successful DELETE", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    mockAdminAuthedFetch((url) => {
      if (url.includes("/rest/v1/destination_tags?destination_id=eq.dest_1&tag=eq.healthcare")) {
        return jsonResponse({ status: 200, body: {} });
      }
      return null;
    });

    const response = await DELETE(
      new Request("http://localhost:3000/api/admin/destination-tags", {
        method: "DELETE",
        body: JSON.stringify({ destinationId: "dest_1", tag: "healthcare" }),
      }),
    );

    expect(response.status).toBe(200);
  });
});
