import { beforeEach, describe, expect, it, vi } from "vitest";
import { jsonResponse, mockAdminAuthedFetch } from "../../../../test-utils/adminRouteFetchMocks";

const { cookieGetMock, cookiesMock } = vi.hoisted(() => {
  const cookieGetMock = vi.fn();
  const cookiesMock = vi.fn(async () => ({ get: cookieGetMock }));
  return { cookieGetMock, cookiesMock };
});

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("../../../../lib/supabase", () => ({
  isSupabaseConfigured: () => true,
  getSupabaseConfig: () => ({
    url: "https://example.supabase.co",
    anonKey: "anon-key",
  }),
}));

import { DELETE, PATCH } from "./route";

const destinationContext = (destinationId: string) => ({
  params: Promise.resolve({ destinationId }),
});

describe("admin destination-by-id route", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    cookieGetMock.mockReset();
    cookiesMock.mockClear();
  });

  it("returns 403 for PATCH when unauthenticated", async () => {
    cookieGetMock.mockReturnValue(undefined);

    const response = await PATCH(
      new Request("http://localhost:3000/api/admin/destinations/dest_1", {
        method: "PATCH",
        body: JSON.stringify({ status: "published" }),
      }),
      destinationContext("dest_1"),
    );

    expect(response.status).toBe(403);
  });

  it("returns 200 for PATCH and returns updated destination", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    mockAdminAuthedFetch((url, init) => {
      if (url.includes("/rest/v1/destinations_catalog?select=metadata&id=eq.dest_1&limit=1")) {
        return jsonResponse({ status: 200, body: [{ metadata: null }] });
      }

      if (url.includes("/rest/v1/destinations_catalog?id=eq.dest_1") && init?.method === "PATCH") {
        return jsonResponse({
          status: 200,
          body: [{ id: "dest_1", status: "published", tier: "launch", city: "Valencia", country: "Spain" }],
        });
      }
      return null;
    });

    const response = await PATCH(
      new Request("http://localhost:3000/api/admin/destinations/dest_1", {
        method: "PATCH",
        body: JSON.stringify({ status: "published", tier: "launch" }),
      }),
      destinationContext("dest_1"),
    );

    const payload = (await response.json()) as {
      destination?: { id: string; status: string; tier: string; city: string; country: string };
    };

    expect(response.status).toBe(200);
    expect(payload.destination).toEqual({
      id: "dest_1",
      status: "published",
      tier: "launch",
      city: "Valencia",
      country: "Spain",
    });
  });

  it("propagates PATCH upstream failure status", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    mockAdminAuthedFetch((url, init) => {
      if (url.includes("/rest/v1/destinations_catalog?select=metadata&id=eq.dest_1&limit=1")) {
        return jsonResponse({ status: 200, body: [{ metadata: null }] });
      }

      if (url.includes("/rest/v1/destinations_catalog?id=eq.dest_1") && init?.method === "PATCH") {
        return jsonResponse({ status: 422, body: { message: "invalid state transition" } });
      }
      return null;
    });

    const response = await PATCH(
      new Request("http://localhost:3000/api/admin/destinations/dest_1", {
        method: "PATCH",
        body: JSON.stringify({ status: "published" }),
      }),
      destinationContext("dest_1"),
    );

    expect(response.status).toBe(422);
  });

  it("returns 403 for DELETE when unauthenticated", async () => {
    cookieGetMock.mockReturnValue(undefined);

    const response = await DELETE(
      new Request("http://localhost:3000/api/admin/destinations/dest_1", { method: "DELETE" }),
      destinationContext("dest_1"),
    );

    expect(response.status).toBe(403);
  });

  it("returns 200 for successful DELETE", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    mockAdminAuthedFetch((url, init) => {
      if (url.includes("/rest/v1/destinations_catalog?id=eq.dest_1") && init?.method === "DELETE") {
        return jsonResponse({ status: 200, body: {} });
      }
      return null;
    });

    const response = await DELETE(
      new Request("http://localhost:3000/api/admin/destinations/dest_1", { method: "DELETE" }),
      destinationContext("dest_1"),
    );

    const payload = (await response.json()) as { success?: boolean };
    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
  });

  it("propagates DELETE upstream failure status", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    mockAdminAuthedFetch((url, init) => {
      if (url.includes("/rest/v1/destinations_catalog?id=eq.dest_1") && init?.method === "DELETE") {
        return jsonResponse({ status: 500, body: { message: "storage unavailable" } });
      }
      return null;
    });

    const response = await DELETE(
      new Request("http://localhost:3000/api/admin/destinations/dest_1", { method: "DELETE" }),
      destinationContext("dest_1"),
    );

    expect(response.status).toBe(500);
  });
});
