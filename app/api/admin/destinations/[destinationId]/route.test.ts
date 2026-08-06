import { beforeEach, describe, expect, it, vi } from "vitest";
import { jsonResponse, mockAdminAuthedFetch } from "../../../../test-utils/adminRouteFetchMocks";

const { cookieGetMock, cookiesMock, updateAdminFallbackDestinationMock, fallbackState, supabaseState } = vi.hoisted(() => {
  const cookieGetMock = vi.fn();
  const cookiesMock = vi.fn(async () => ({ get: cookieGetMock }));
  const updateAdminFallbackDestinationMock = vi.fn((destinationId: string, updates: Record<string, unknown>) => ({
    id: destinationId,
    ...updates,
  }));
  const fallbackState = { shouldUseLocalFallback: false };
  const supabaseState = { serviceRoleKey: null as string | null };
  return { cookieGetMock, cookiesMock, updateAdminFallbackDestinationMock, fallbackState, supabaseState };
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
  getSupabaseServiceRoleKey: () => supabaseState.serviceRoleKey,
  getSupabaseAuthHeaders: (accessToken: string | null) => ({
    apikey: supabaseState.serviceRoleKey ?? "anon-key",
    Authorization: accessToken ? `Bearer ${accessToken}` : "Bearer anon-key",
  }),
}));

vi.mock("../../../../lib/admin-local-fallback", () => ({
  shouldUseAdminLocalFallback: () => fallbackState.shouldUseLocalFallback,
  updateAdminFallbackDestination: updateAdminFallbackDestinationMock,
  deleteAdminFallbackDestination: vi.fn(),
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
    fallbackState.shouldUseLocalFallback = false;
    supabaseState.serviceRoleKey = null;
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

  it("sends only the provided fields for partial fallback updates", async () => {
    cookieGetMock.mockReturnValue(undefined);
    fallbackState.shouldUseLocalFallback = true;
    updateAdminFallbackDestinationMock.mockClear();

    const response = await PATCH(
      new Request("http://localhost:3000/api/admin/destinations/dest_1", {
        method: "PATCH",
        body: JSON.stringify({ status: "published" }),
      }),
      destinationContext("dest_1"),
    );

    expect(response.status).toBe(200);
    expect(updateAdminFallbackDestinationMock).toHaveBeenCalledWith("dest_1", { status: "published" });
  });

  it("returns 200 for PATCH and returns updated destination", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    mockAdminAuthedFetch((url, init) => {
      if (url.includes("/rest/v1/destinations_catalog?select=metadata&id=eq.dest_1&limit=1")) {
        return jsonResponse({ status: 200, body: [{ metadata: null }] });
      }

      if (url.includes("/rest/v1/destinations_catalog?select=id,slug,city,country,status,tier,description,overview&id=eq.dest_1&limit=1")) {
        return jsonResponse({
          status: 200,
          body: [{ id: "dest_1", slug: "valencia-spain", city: "Valencia", country: "Spain", status: "published", tier: "launch" }],
        });
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

  it("returns 409 for PATCH when another destination already uses the requested identity", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    mockAdminAuthedFetch((url, init) => {
      if (url.includes("/rest/v1/destinations_catalog?select=metadata&id=eq.dest_1&limit=1")) {
        return jsonResponse({ status: 200, body: [{ metadata: null }] });
      }

      if (url.includes("/rest/v1/destinations_catalog?select=id,slug,city,country,status,tier,description,overview,updated_at,metadata&order=updated_at.desc&limit=1000")) {
        return jsonResponse({ status: 200, body: [{ id: "dest_other", slug: "lisbon-portugal", city: "Lisbon", country: "Portugal" }] });
      }

      if (url.includes("/rest/v1/destinations_catalog?id=eq.dest_1") && init?.method === "PATCH") {
        return jsonResponse({ status: 200, body: [{ id: "dest_1", slug: "lisbon-portugal", city: "Lisbon", country: "Portugal" }] });
      }
      return null;
    });

    const response = await PATCH(
      new Request("http://localhost:3000/api/admin/destinations/dest_1", {
        method: "PATCH",
        body: JSON.stringify({ slug: "lisbon-portugal", city: "Lisbon", country: "Portugal" }),
      }),
      destinationContext("dest_1"),
    );

    const payload = (await response.json()) as { error?: string };
    expect(response.status).toBe(409);
    expect(payload.error).toMatch(/already uses this identity/i);
  });

  it("uses service-role headers for PATCH updates when available", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });
    supabaseState.serviceRoleKey = "service-role-key";

    let observedHeaders: Record<string, string> | null = null;

    mockAdminAuthedFetch((url, init) => {
      if (url.includes("/rest/v1/destinations_catalog?select=metadata&id=eq.dest_1&limit=1")) {
        return jsonResponse({ status: 200, body: [{ metadata: null }] });
      }

      if (url.includes("/rest/v1/destinations_catalog?id=eq.dest_1") && init?.method === "PATCH") {
        observedHeaders = Object.fromEntries(Object.entries(init.headers ?? {}).map(([key, value]) => [key, String(value)]));
        return jsonResponse({
          status: 200,
          body: [{ id: "dest_1", status: "published", tier: "launch", city: "Valencia", country: "Spain" }],
        });
      }

      if (url.includes("/rest/v1/destinations_catalog?select=id,slug,city,country,status,tier,description,overview&id=eq.dest_1&limit=1")) {
        return jsonResponse({
          status: 200,
          body: [{ id: "dest_1", slug: "valencia-spain", city: "Valencia", country: "Spain", status: "published", tier: "launch" }],
        });
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

    expect(response.status).toBe(200);
    expect(observedHeaders).toMatchObject({
      apikey: "service-role-key",
      Authorization: "Bearer service-role-key",
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

  it("persists editorial content and research profile into destination metadata", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    let patchBody: Record<string, unknown> | null = null;

    mockAdminAuthedFetch((url, init) => {
      if (url.includes("/rest/v1/destinations_catalog?select=metadata&id=eq.dest_1&limit=1")) {
        return jsonResponse({ status: 200, body: [{ metadata: { relocationProfile: { aiSummary: "Keep it local" } } }] });
      }

      if (url.includes("/rest/v1/destinations_catalog?select=id,slug,city,country,status,tier,description,overview&id=eq.dest_1&limit=1")) {
        return jsonResponse({
          status: 200,
          body: [{ id: "dest_1", slug: "valencia-spain", city: "Valencia", country: "Spain", status: "draft", tier: "launch" }],
        });
      }

      if (url.includes("/rest/v1/destinations_catalog?id=eq.dest_1") && init?.method === "PATCH") {
        patchBody = JSON.parse(init.body as string) as Record<string, unknown>;
        return jsonResponse({ status: 200, body: [{ id: "dest_1", status: "draft", tier: "launch" }] });
      }
      return null;
    });

    const response = await PATCH(
      new Request("http://localhost:3000/api/admin/destinations/dest_1", {
        method: "PATCH",
        body: JSON.stringify({
          editorialContent: {
            introduction: "A fresh intro",
            heroNarrative: "A stronger hero narrative",
            climateNarrative: "A cooler climate summary",
          },
          researchProfile: {
            overview: "Local feel",
            whyPeopleLoveIt: ["Food", "Weather"],
          },
        }),
      }),
      destinationContext("dest_1"),
    );

    expect(response.status).toBe(200);
    expect(patchBody).toMatchObject({
      metadata: {
        relocationProfile: { aiSummary: "Keep it local" },
        editorialContent: {
          introduction: "A fresh intro",
          heroNarrative: "A stronger hero narrative",
          climateNarrative: "A cooler climate summary",
        },
        researchProfile: {
          overview: "Local feel",
          whyPeopleLoveIt: ["Food", "Weather"],
        },
      },
    });
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
