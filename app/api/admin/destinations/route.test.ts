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
  getSupabaseServiceRoleKey: () => null,
  getSupabaseAuthHeaders: (accessToken: string) => ({
    apikey: "anon-key",
    Authorization: `Bearer ${accessToken}`,
  }),
}));

vi.mock("../../../lib/admin-local-fallback", () => ({
  shouldUseAdminLocalFallback: (accessToken: string | null, user: unknown, adminRole: string | null) =>
    process.env.NODE_ENV === "development" && !accessToken && !user && !adminRole,
  createAdminFallbackDestination: (input: { city: string; country: string; slug?: string }) => ({
    id: "local-dest-1",
    slug: input.slug ?? "lisbon-portugal",
    city: input.city,
    country: input.country,
    status: "draft" as const,
    tier: "launch",
    description: null,
    overview: null,
    updated_at: "2026-07-20T00:00:00.000Z",
    metadata: null,
  }),
  listAdminFallbackDestinations: () => [
    {
      id: "local-dest-1",
      slug: "lisbon-portugal",
      city: "Lisbon",
      country: "Portugal",
      status: "draft" as const,
      tier: "launch",
      description: null,
      overview: null,
      updated_at: "2026-07-20T00:00:00.000Z",
      metadata: {
        relocationProfile: { aiSummary: "A rich relocation profile" },
        editorialContent: { title: "Lisbon editorial" },
        researchProfile: { overview: "The research profile" },
      },
    },
  ],
  updateAdminFallbackDestination: vi.fn(),
  deleteAdminFallbackDestination: vi.fn(),
}));

import { GET, POST } from "./route";
import { PATCH } from "./[destinationId]/route";

describe("admin destinations route", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    cookieGetMock.mockReset();
    cookiesMock.mockClear();
  });

  it("returns unauthenticated shape for GET when no auth token is present", async () => {
    cookieGetMock.mockReturnValue(undefined);

    const response = await GET();
    const payload = (await response.json()) as { authenticated?: boolean; canManage?: boolean; destinations?: unknown[] };

    expect(response.status).toBe(200);
    expect(payload.authenticated).toBe(false);
    expect(payload.canManage).toBe(false);
    expect(payload.destinations).toEqual([]);
  });

  it("requests a full admin catalog window instead of a truncated 120-row slice", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    mockAdminAuthedFetch((url) => {
      if (url.includes("/rest/v1/destinations_catalog")) {
        expect(url).toContain("limit=1000");
        return jsonResponse({ body: [] });
      }

      return jsonResponse({ body: [] });
    });

    const response = await GET();

    expect(response.status).toBe(200);
  });

  it("returns destination rows with aggregated media/resource/video counts", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    mockAdminAuthedFetch((url) => {
      if (url.includes("/rest/v1/destinations_catalog?select=id,slug,city,country,status,tier,description,overview,updated_at,metadata")) {
        return jsonResponse({
          body: [
            {
              id: "dest_1",
              slug: "valencia-spain",
              city: "Valencia",
              country: "Spain",
              status: "published",
              tier: "launch",
              description: "Sun and sea",
              updated_at: "2026-07-20T00:00:00.000Z",
              metadata: null,
            },
            {
              id: "dest_2",
              slug: "porto-portugal",
              city: "Porto",
              country: "Portugal",
              status: "review",
              tier: "launch",
              description: "River city",
              updated_at: "2026-07-19T00:00:00.000Z",
              metadata: null,
            },
          ],
        });
      }

      if (url.includes("/rest/v1/destination_media_assets") && url.includes("destination_id=in.(dest_1,dest_2)")) {
        return jsonResponse({ body: [{ destination_id: "dest_1" }, { destination_id: "dest_1" }] });
      }

      if (url.includes("/rest/v1/destination_resource_links") && url.includes("destination_id=in.(dest_1,dest_2)")) {
        return jsonResponse({ body: [{ destination_id: "dest_1" }, { destination_id: "dest_2" }] });
      }

      if (url.includes("/rest/v1/destination_video_links") && url.includes("destination_id=in.(dest_1,dest_2)")) {
        return jsonResponse({ body: [{ destination_id: "dest_2" }] });
      }

      return null;
    });

    const response = await GET();
    const payload = (await response.json()) as {
      authenticated?: boolean;
      canManage?: boolean;
      adminRole?: string | null;
      destinations?: Array<{
        id: string;
        mediaCount: number;
        resourceCount: number;
        videoCount: number;
      }>;
    };

    expect(response.status).toBe(200);
    expect(payload.authenticated).toBe(true);
    expect(payload.canManage).toBe(true);
    expect(payload.adminRole).toBe("admin");
    expect(payload.destinations).toEqual([
      {
        id: "dest_1",
        slug: "valencia-spain",
        city: "Valencia",
        country: "Spain",
        status: "published",
        tier: "launch",
        description: "Sun and sea",
        updated_at: "2026-07-20T00:00:00.000Z",
        metadata: null,
        relocationProfile: null,
        memberDetails: null,
        editorialContent: null,
        researchProfile: null,
        mediaCount: 2,
        resourceCount: 1,
        videoCount: 0,
      },
      {
        id: "dest_2",
        slug: "porto-portugal",
        city: "Porto",
        country: "Portugal",
        status: "review",
        tier: "launch",
        description: "River city",
        updated_at: "2026-07-19T00:00:00.000Z",
        metadata: null,
        relocationProfile: null,
        memberDetails: null,
        editorialContent: null,
        researchProfile: null,
        mediaCount: 0,
        resourceCount: 1,
        videoCount: 1,
      },
    ]);
  });

  it("returns fallback destination metadata in the list payload", async () => {
    cookieGetMock.mockReturnValue(undefined);
    const previousNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    const response = await GET();
    const payload = (await response.json()) as {
      destinations?: Array<{
        id: string;
        relocationProfile?: unknown;
        editorialContent?: unknown;
        researchProfile?: unknown;
      }>;
    };

    expect(response.status).toBe(200);
    expect(payload.destinations?.[0]).toMatchObject({
      id: "local-dest-1",
      relocationProfile: { aiSummary: "A rich relocation profile" },
      editorialContent: { title: "Lisbon editorial" },
      researchProfile: { overview: "The research profile" },
    });

    process.env.NODE_ENV = previousNodeEnv;
  });

  it("returns 403 for POST when not admin-authenticated", async () => {
    cookieGetMock.mockReturnValue(undefined);

    const response = await POST(
      new Request("http://localhost:3000/api/admin/destinations", {
        method: "POST",
        body: JSON.stringify({ city: "Valencia", country: "Spain" }),
      }),
    );

    expect(response.status).toBe(403);
  });

  it("returns 400 for POST when required fields are missing", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    const fetchMock = mockAdminAuthedFetch(() => null);

    const response = await POST(
      new Request("http://localhost:3000/api/admin/destinations", {
        method: "POST",
        body: JSON.stringify({ city: "", country: "" }),
      }),
    );

    expect(response.status).toBe(400);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("returns 409 for duplicate slug on POST", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    mockAdminAuthedFetch((url) => {
      if (url.endsWith("/rest/v1/destinations_catalog")) {
        return jsonResponse({ status: 409, body: { message: "duplicate key" } });
      }
      return null;
    });

    const response = await POST(
      new Request("http://localhost:3000/api/admin/destinations", {
        method: "POST",
        body: JSON.stringify({ city: "Valencia", country: "Spain", slug: "valencia-spain" }),
      }),
    );

    const payload = (await response.json()) as { error?: string };
    expect(response.status).toBe(409);
    expect(payload.error).toBe("Slug already exists.");
  });

  it("returns 409 when POST targets an identity already used by an existing destination", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    mockAdminAuthedFetch((url) => {
      if (url.includes("/rest/v1/destinations_catalog?select=id,slug,city,country,status,tier,description,overview,updated_at,metadata&order=updated_at.desc&limit=1000")) {
        return jsonResponse({ body: [{ id: "dest_existing", slug: "valencia-spain", city: "Valencia", country: "Spain" }] });
      }

      if (url.endsWith("/rest/v1/destinations_catalog")) {
        return jsonResponse({ status: 200, body: [{ id: "dest_new", slug: "valencia-spain", city: "Valencia", country: "Spain" }] });
      }

      return null;
    });

    const response = await POST(
      new Request("http://localhost:3000/api/admin/destinations", {
        method: "POST",
        body: JSON.stringify({ city: "Valencia", country: "Spain", slug: "valencia-spain" }),
      }),
    );

    const payload = (await response.json()) as { error?: string };
    expect(response.status).toBe(409);
    expect(payload.error).toMatch(/already exists/i);
  });

  it("returns 200 and destination row for successful POST", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    mockAdminAuthedFetch((url, init) => {
      if (url.endsWith("/rest/v1/destinations_catalog") && init?.method === "POST") {
        return jsonResponse({
          status: 200,
          body: [{ id: "dest_3", slug: "athens-greece", city: "Athens", country: "Greece" }],
        });
      }

      if (url.includes("/rest/v1/destinations_catalog?select=id,slug,city,country,status,tier,description,overview&slug=eq.athens-greece&limit=1")) {
        return jsonResponse({
          status: 200,
          body: [{ id: "dest_3", slug: "athens-greece", city: "Athens", country: "Greece", status: "published", tier: "launch" }],
        });
      }
      return null;
    });

    const response = await POST(
      new Request("http://localhost:3000/api/admin/destinations", {
        method: "POST",
        body: JSON.stringify({ city: "Athens", country: "Greece", slug: "athens-greece" }),
      }),
    );

    const payload = (await response.json()) as {
      destination?: { id: string; slug: string; city: string; country: string };
    };

    expect(response.status).toBe(200);
    expect(payload.destination).toEqual({
      id: "dest_3",
      slug: "athens-greece",
      city: "Athens",
      country: "Greece",
    });
  });

  it("updates base destination fields and slug via PATCH", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    mockAdminAuthedFetch((url, init) => {
      if (url.endsWith("/rest/v1/destinations_catalog?id=eq.dest_3") && init?.method === "PATCH") {
        return jsonResponse({
          status: 200,
          body: [{
            id: "dest_3",
            slug: "lisbon-portugal",
            city: "Lisbon",
            country: "Portugal",
            description: "A bright Atlantic capital",
            overview: "Perfect for a slower pace",
            status: "review",
            tier: "launch",
          }],
        });
      }

      if (url.includes("/rest/v1/destinations_catalog?select=id,slug,city,country,status,tier,description,overview&id=eq.dest_3&limit=1")) {
        return jsonResponse({
          status: 200,
          body: [{
            id: "dest_3",
            slug: "lisbon-portugal",
            city: "Lisbon",
            country: "Portugal",
            description: "A bright Atlantic capital",
            overview: "Perfect for a slower pace",
            status: "review",
            tier: "launch",
          }],
        });
      }
      return null;
    });

    const response = await PATCH(
      new Request("http://localhost:3000/api/admin/destinations/dest_3", {
        method: "PATCH",
        body: JSON.stringify({
          city: "Lisbon",
          country: "Portugal",
          slug: "lisbon-portugal",
          description: "A bright Atlantic capital",
          overview: "Perfect for a slower pace",
          status: "review",
          tier: "launch",
        }),
      }),
      { params: Promise.resolve({ destinationId: "dest_3" }) },
    );

    const payload = (await response.json()) as {
      destination?: {
        slug: string;
        city: string;
        country: string;
        description: string | null;
        overview: string | null;
        status: string;
        tier: string;
      };
    };

    expect(response.status).toBe(200);
    expect(payload.destination).toMatchObject({
      slug: "lisbon-portugal",
      city: "Lisbon",
      country: "Portugal",
      description: "A bright Atlantic capital",
      overview: "Perfect for a slower pace",
      status: "review",
      tier: "launch",
    });
  });
});
