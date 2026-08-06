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
  getSupabaseServiceRoleKey: () => "service-role-key",
  getSupabaseAuthHeaders: (accessToken: string | null) => ({
    apikey: "service-role-key",
    Authorization: accessToken ? `Bearer ${accessToken}` : "Bearer service-role-key",
  }),
}));

vi.mock("../../../../lib/admin-local-fallback", () => ({
  shouldUseAdminLocalFallback: () => false,
}));

import { POST } from "./route";

describe("batch import route", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    cookieGetMock.mockReset();
    cookiesMock.mockClear();
  });

  it("creates import run and import row records when executing a batch import", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    const requestPayload = {
      rows: [{ city: "Paris", country: "France", slug: "paris-france" }],
      mode: "create_or_update",
      matchField: "slug",
      previewOnly: false,
      fileName: "sample.csv",
    };

    const seenUrls: string[] = [];

    mockAdminAuthedFetch((url) => {
      seenUrls.push(url);

      if (url.includes("/rest/v1/destination_import_runs")) {
        return jsonResponse({ body: [{ id: "run-1" }] });
      }

      if (url.includes("/rest/v1/destinations_catalog?select=id,slug,city,country,status,tier,description,overview&slug=eq.paris-france&limit=1")) {
        return jsonResponse({ body: [{ id: "dest-1", slug: "paris-france", city: "Paris", country: "France", status: "draft", tier: "launch" }] });
      }

      if (url.includes("/rest/v1/destinations_catalog")) {
        return jsonResponse({ body: [{ id: "dest-1" }] });
      }

      if (url.includes("/rest/v1/destination_import_rows")) {
        return jsonResponse({ body: [{ id: "row-1" }] });
      }

      return jsonResponse({ body: [] });
    });

    const response = await POST(new Request("https://example.com/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestPayload),
    }));

    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.importResults).toHaveLength(1);
    expect(payload.importResults[0]?.action).toBe("create");
    expect(seenUrls.some((url) => url.includes("/rest/v1/destination_import_runs"))).toBe(true);
    expect(seenUrls.some((url) => url.includes("/rest/v1/destination_import_rows"))).toBe(false);
  });

  it("fails the import when post-write verification cannot confirm the destination is visible", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    const requestPayload = {
      rows: [{ city: "Milan", country: "Italy", slug: "milan-italy", status: "published", tier: "launch" }],
      mode: "create_or_update",
      matchField: "slug",
      previewOnly: false,
      fileName: "verification.csv",
    };

    mockAdminAuthedFetch((url, init) => {
      if (url.includes("/rest/v1/destination_import_runs")) {
        return jsonResponse({ body: [{ id: "run-2" }] });
      }

      if (url.includes("/rest/v1/destinations_catalog") && init?.method === "POST") {
        return jsonResponse({ body: [{ id: "created-dest-2" }] });
      }

      if (url.includes("/rest/v1/destinations_catalog?select=id,slug,city,country,status,tier,description,overview&slug=eq.milan-italy&limit=1")) {
        return jsonResponse({ body: [] });
      }

      if (url.includes("/rest/v1/destinations_catalog")) {
        return jsonResponse({ body: [] });
      }

      if (url.includes("/rest/v1/destination_import_rows")) {
        return jsonResponse({ body: [{ id: "row-2" }] });
      }

      return jsonResponse({ body: [] });
    });

    const response = await POST(new Request("https://example.com/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestPayload),
    }));

    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.importResults[0]?.action).toBe("create");
    expect(payload.importResults[0]?.error).toMatch(/verification/i);
  });

  it("enriches a minimally described destination before creating it", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    const requestPayload = {
      rows: [{ destination_name: "Cavtat", country: "Croatia" }],
      mode: "create_or_update",
      matchField: "slug",
      previewOnly: false,
      fileName: "minimal.csv",
    };

    const createBodies: Array<Record<string, unknown>> = [];

    mockAdminAuthedFetch((url, init) => {
      if (url.includes("/rest/v1/destination_import_runs")) {
        return jsonResponse({ body: [{ id: "run-3" }] });
      }

      if (url.includes("/rest/v1/destinations_catalog") && init?.method === "POST") {
        const body = JSON.parse(String(init.body ?? "{}"));
        createBodies.push(body);
        return jsonResponse({ body: [{ id: "created-dest-3", slug: body.slug, city: body.city, country: body.country }] });
      }

      if (url.includes("/rest/v1/destinations_catalog?select=id,slug,city,country,status,tier,description,overview&slug=eq.cavtat-croatia&limit=1")) {
        return jsonResponse({ body: [] });
      }

      if (url.includes("/rest/v1/destination_import_rows")) {
        return jsonResponse({ body: [{ id: "row-3" }] });
      }

      if (url.includes("/rest/v1/destinations_catalog")) {
        return jsonResponse({ body: [] });
      }

      return jsonResponse({ body: [] });
    });

    const response = await POST(new Request("https://example.com/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestPayload),
    }));

    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.importResults[0]?.action).toBe("create");
    expect(createBodies[0]).toMatchObject({
      city: "Cavtat",
      country: "Croatia",
      slug: "cavtat-croatia",
    });
    expect(createBodies[0].metadata).toEqual(expect.any(Object));
    expect((createBodies[0].metadata as Record<string, unknown>).editorialContent).toEqual(expect.objectContaining({
      introduction: expect.any(String),
    }));
    const researchProfile = (createBodies[0].metadata as Record<string, unknown>).researchProfile as Record<string, unknown>;
    expect(researchProfile).toEqual(expect.any(Object));
    expect(researchProfile.overview).toEqual(expect.any(String));
    expect(researchProfile.feel).toEqual(expect.any(String));
    expect(researchProfile.whyPeopleLoveIt).toEqual(expect.any(String));
    expect(createBodies[0].description).toEqual(expect.any(String));
    expect(createBodies[0].overview).toEqual(expect.any(String));
  });

  it("preserves premium editorial metadata from workbook-style rows when creating a destination", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    const requestPayload = {
      rows: [{
        city: "Cedar City",
        country: "United States",
        slug: "cedar-city-utah",
        hero_description: "A high-desert town forged by sandstone, long views, and a calm pace.",
        destination_overview: "A compact city with easy access to outdoor recreation and a practical retirement rhythm.",
        why_this_place_feels_distinct: "The place feels distinct because the landscape and daily routine are inseparable.",
        lifestyle: "Residents trade the noise of metro life for open skies, local cafés, and a lighter pace.",
        climate: "The climate is dry, sunny, and strongly seasonal with bright winters and hot summers.",
        cost_of_living: "Housing and everyday costs are generally manageable for a long-stay household.",
        healthcare: "Healthcare access is improving, though specialty care can require a drive.",
      }],
      mode: "create_or_update",
      matchField: "slug",
      previewOnly: false,
      fileName: "premium.csv",
    };

    const createBodies: Array<Record<string, unknown>> = [];

    mockAdminAuthedFetch((url, init) => {
      if (url.includes("/rest/v1/destination_import_runs")) {
        return jsonResponse({ body: [{ id: "run-4" }] });
      }

      if (url.includes("/rest/v1/destinations_catalog") && init?.method === "POST") {
        const body = JSON.parse(String(init.body ?? "{}"));
        createBodies.push(body);
        return jsonResponse({ body: [{ id: "created-dest-4", slug: body.slug, city: body.city, country: body.country }] });
      }

      if (url.includes("/rest/v1/destinations_catalog?select=id,slug,city,country,status,tier,description,overview&slug=eq.cedar-city-utah&limit=1")) {
        return jsonResponse({ body: [] });
      }

      if (url.includes("/rest/v1/destinations_catalog")) {
        return jsonResponse({ body: [] });
      }

      if (url.includes("/rest/v1/destination_import_rows")) {
        return jsonResponse({ body: [{ id: "row-4" }] });
      }

      return jsonResponse({ body: [] });
    });

    const response = await POST(new Request("https://example.com/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestPayload),
    }));

    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.importResults[0]?.action).toBe("create");
    expect(createBodies[0]?.metadata).toEqual(expect.any(Object));
    expect((createBodies[0].metadata as Record<string, unknown>).editorialContent).toEqual(expect.objectContaining({
      heroNarrative: "A high-desert town forged by sandstone, long views, and a calm pace.",
    }));
    expect((createBodies[0].metadata as Record<string, unknown>).researchProfile).toEqual(expect.objectContaining({
      overview: "A compact city with easy access to outdoor recreation and a practical retirement rhythm.",
      feel: "The place feels distinct because the landscape and daily routine are inseparable.",
      costOfLiving: "Housing and everyday costs are generally manageable for a long-stay household.",
      healthcare: "Healthcare access is improving, though specialty care can require a drive.",
    }));
  });

  it("persists relocation-profile narrative into metadata when the workbook row lacks premium-specific aliases", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    const requestPayload = {
      rows: [{
        city: "Spearfish",
        country: "United States",
        slug: "spearfish-south-dakota-united-states",
        description: "Spearfish is a scenic Black Hills town known for outdoor access and a small university.",
        overview: "Spearfish Canyon, trails and nearby historic towns. The local economy is supported by tourism, education, healthcare and regional services.",
        climate: "Semi-arid continental climate with warm summers and cold winters.",
        lifestyle: "Best for outdoor enthusiasts and retirees seeking mountain scenery and lower costs.",
        transportation: "Local transit is limited; Rapid City Regional Airport is the main gateway.",
        google_style_relocation_profile: "Spearfish is a relocation candidate with mountain scenery, practical healthcare access, and a strong balance between outdoor life and affordability.",
      }],
      mode: "create_or_update",
      matchField: "slug",
      previewOnly: false,
      fileName: "spearfish.csv",
    };

    const createBodies: Array<Record<string, unknown>> = [];

    mockAdminAuthedFetch((url, init) => {
      if (url.includes("/rest/v1/destination_import_runs")) {
        return jsonResponse({ body: [{ id: "run-5" }] });
      }

      if (url.includes("/rest/v1/destinations_catalog") && init?.method === "POST") {
        const body = JSON.parse(String(init.body ?? "{}"));
        createBodies.push(body);
        return jsonResponse({ body: [{ id: "created-dest-5", slug: body.slug, city: body.city, country: body.country }] });
      }

      if (url.includes("/rest/v1/destinations_catalog?select=id,slug,city,country,status,tier,description,overview&slug=eq.spearfish-south-dakota-united-states&limit=1")) {
        return jsonResponse({ body: [] });
      }

      if (url.includes("/rest/v1/destination_import_rows")) {
        return jsonResponse({ body: [{ id: "row-5" }] });
      }

      if (url.includes("/rest/v1/destinations_catalog")) {
        return jsonResponse({ body: [] });
      }

      return jsonResponse({ body: [] });
    });

    const response = await POST(new Request("https://example.com/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestPayload),
    }));

    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.importResults[0]?.action).toBe("create");
    expect(createBodies[0]?.metadata).toEqual(expect.any(Object));
    expect((createBodies[0].metadata as Record<string, unknown>).editorialContent).toEqual(expect.objectContaining({
      heroNarrative: "Spearfish is a scenic Black Hills town known for outdoor access and a small university.",
      destinationOverview: "Spearfish Canyon, trails and nearby historic towns. The local economy is supported by tourism, education, healthcare and regional services.",
      lifestyleNarrative: "Best for outdoor enthusiasts and retirees seeking mountain scenery and lower costs.",
    }));
    const researchProfile = (createBodies[0].metadata as Record<string, unknown>).researchProfile as Record<string, unknown>;
    expect(researchProfile).toEqual(expect.objectContaining({
      overview: "Spearfish Canyon, trails and nearby historic towns. The local economy is supported by tourism, education, healthcare and regional services.",
      longFormEditorial: "Spearfish is a relocation candidate with mountain scenery, practical healthcare access, and a strong balance between outdoor life and affordability.",
    }));
    expect(researchProfile.feel).toEqual(expect.any(String));
    expect(researchProfile.transportation).toEqual("Local transit is limited; Rapid City Regional Airport is the main gateway.");
  });

  it("continues execution when import tracking tables are unavailable", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    const requestPayload = {
      rows: [{ city: "Berlin", country: "Germany", slug: "berlin-germany" }],
      mode: "create_or_update",
      matchField: "slug",
      previewOnly: false,
      fileName: "sample.csv",
    };

    mockAdminAuthedFetch((url, init) => {
      if (url.includes("/rest/v1/destination_import_runs")) {
        return jsonResponse({ status: 404, body: { message: "Could not find the table 'public.destination_import_runs'" } });
      }

      if (url.includes("/rest/v1/destination_import_rows")) {
        return jsonResponse({ status: 404, body: { message: "Could not find the table 'public.destination_import_rows'" } });
      }

      if (url.includes("/rest/v1/destinations_catalog") && init?.method === "POST") {
        return jsonResponse({ body: [{ id: "created-dest-1" }] });
      }

      if (url.includes("/rest/v1/destinations_catalog?select=id,slug,city,country,status,tier,description,overview&slug=eq.berlin-germany&limit=1")) {
        return jsonResponse({ body: [{ id: "created-dest-1", slug: "berlin-germany", city: "Berlin", country: "Germany", status: "draft", tier: "launch" }] });
      }

      if (url.includes("/rest/v1/destinations_catalog")) {
        return jsonResponse({ body: [] });
      }

      return jsonResponse({ body: [] });
    });

    const response = await POST(new Request("https://example.com/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestPayload),
    }));

    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.importResults).toHaveLength(1);
    expect(payload.importResults[0]?.action).toBe("create");
    expect(payload.importResults[0]?.destinationId).toBe("created-dest-1");
  });
});
