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
  getSupabaseServiceRoleKey: () => null,
  getSupabaseAuthHeaders: (accessToken: string | null) => ({
    apikey: "anon-key",
    Authorization: accessToken ? `Bearer ${accessToken}` : "Bearer anon-key",
  }),
}));

vi.mock("../../../../../lib/admin-local-fallback", () => ({
  shouldUseAdminLocalFallback: () => false,
}));

import { POST } from "./route";

describe("destination enrichment backfill route", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    cookieGetMock.mockReset();
    cookiesMock.mockClear();
  });

  it("returns a preview plan without applying enrichment when previewOnly is true", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    let patchCalls = 0;

    mockAdminAuthedFetch((url, init) => {
      if (url.includes("/rest/v1/destinations_catalog?select=id,slug,city,country,description,overview,metadata&order=city.asc")) {
        return jsonResponse({
          body: [{ id: "dest-1", slug: "bangkok-thailand", city: "Bangkok", country: "Thailand", description: "", overview: null, metadata: null }],
        });
      }

      if (url.includes("/rest/v1/destinations_catalog?id=eq.dest-1") && init?.method === "PATCH") {
        patchCalls += 1;
        return jsonResponse({ body: [{ id: "dest-1" }] });
      }

      return jsonResponse({ body: [] });
    });

    const response = await POST(new Request("https://example.com/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destinationIds: ["dest-1"], previewOnly: true, batchSize: 1 }),
    }));

    const payload = await response.json() as {
      preview?: boolean;
      plan?: Array<{ id: string }>;
      summary?: { requested?: number; processed?: number; updated?: number; failed?: number };
    };

    expect(response.status).toBe(200);
    expect(payload.preview).toBe(true);
    expect(payload.plan?.[0]?.id).toBe("dest-1");
    expect(payload.summary).toMatchObject({ requested: 1, processed: 0, updated: 0, failed: 0 });
    expect(patchCalls).toBe(0);
  });

  it("applies enrichment metadata to selected destinations and reports a successful upgrade", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    const patchBodies: Array<Record<string, unknown>> = [];

    mockAdminAuthedFetch((url, init) => {
      if (url.includes("/rest/v1/destinations_catalog?select=id,slug,city,country,description,overview,metadata&order=city.asc")) {
        return jsonResponse({
          body: [{ id: "dest-1", slug: "bangkok-thailand", city: "Bangkok", country: "Thailand", description: "", overview: null, metadata: null }],
        });
      }

      if (url.includes("/rest/v1/destinations_catalog?id=eq.dest-1") && init?.method === "PATCH") {
        patchBodies.push(JSON.parse(String(init.body ?? "{}")) as Record<string, unknown>);
        return jsonResponse({ body: [{ id: "dest-1" }] });
      }

      return jsonResponse({ body: [] });
    });

    const response = await POST(new Request("https://example.com/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destinationIds: ["dest-1"], previewOnly: false, batchSize: 1 }),
    }));

    const payload = await response.json() as {
      summary?: { requested?: number; processed?: number; updated?: number; failed?: number };
    };

    expect(response.status).toBe(200);
    expect(patchBodies).toHaveLength(1);
    expect(patchBodies[0]?.metadata).toEqual(expect.any(Object));
    expect((patchBodies[0]?.metadata as Record<string, unknown>).editorialContent).toEqual(expect.objectContaining({
      introduction: expect.any(String),
    }));
    expect(payload.summary).toMatchObject({ requested: 1, processed: 1, updated: 1, failed: 0 });
  });
});
