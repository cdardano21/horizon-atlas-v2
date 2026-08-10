import { beforeEach, describe, expect, it, vi } from "vitest";
import { jsonResponse, mockAdminAuthedFetch } from "../../../../test-utils/adminRouteFetchMocks";

const { cookieGetMock, cookiesMock, buildDeterministicV31PreviewResponseMock, classifyDeterministicV31WorkbookContractMock, buildBatchImportPlanMock, buildDestinationUpdatePayloadMock, buildImportSummaryMock, buildImportedDestinationMetadataMock, normalizeSlugMock, verifyDestinationImportMock } = vi.hoisted(() => ({
  cookieGetMock: vi.fn(),
  cookiesMock: vi.fn(async () => ({ get: cookieGetMock })),
  buildDeterministicV31PreviewResponseMock: vi.fn(),
  classifyDeterministicV31WorkbookContractMock: vi.fn(),
  buildBatchImportPlanMock: vi.fn(),
  buildDestinationUpdatePayloadMock: vi.fn(),
  buildImportSummaryMock: vi.fn(),
  buildImportedDestinationMetadataMock: vi.fn(),
  normalizeSlugMock: vi.fn(),
  verifyDestinationImportMock: vi.fn(async () => ({ ok: true })),
}));

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

vi.mock("./deterministic-preview", async () => {
  const actual = await vi.importActual<typeof import("./deterministic-preview")>("./deterministic-preview");
  return {
    ...actual,
    buildDeterministicV31PreviewResponse: buildDeterministicV31PreviewResponseMock,
    classifyDeterministicV31WorkbookContract: classifyDeterministicV31WorkbookContractMock,
  };
});

vi.mock("./processor", async () => {
  const actual = await vi.importActual<typeof import("./processor")>("./processor");
  return {
    ...actual,
    buildBatchImportPlan: buildBatchImportPlanMock,
    buildDestinationUpdatePayload: buildDestinationUpdatePayloadMock,
    buildImportSummary: buildImportSummaryMock,
    buildImportedDestinationMetadata: buildImportedDestinationMetadataMock,
    normalizeSlug: normalizeSlugMock,
  };
});

vi.mock("../../../../lib/destination-enrichment", () => ({
  buildEnrichedDestinationCreatePayload: vi.fn(({ city, country, slug }: { city: string; country: string; slug?: string }) => ({
    slug: slug ?? `${city}-${country}`,
    description: `${city} in ${country} offers a compelling destination experience.`,
    overview: `${city} is a welcoming destination in ${country}.`,
    metadata: {
      editorialContent: {
        introduction: `${city} in ${country} offers a compelling destination experience.`,
      },
      researchProfile: {
        overview: `${city} is a welcoming destination in ${country}.`,
        feel: "Relaxed and welcoming",
        whyPeopleLoveIt: "It balances charm, convenience, and a strong sense of place.",
      },
      neighborhoodIntelligence: [],
      knowledgeProfile: { vibe: "balanced" },
      premiumEditorialContent: { tone: "premium" },
    },
  })),
}));

vi.mock("../../../../lib/destination-import-verification", () => ({
  verifyDestinationImport: verifyDestinationImportMock,
}));

import { POST } from "./route";

describe("batch import route", () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    cookieGetMock.mockReset();
    cookiesMock.mockClear();
    buildDeterministicV31PreviewResponseMock.mockReset();
    classifyDeterministicV31WorkbookContractMock.mockReset();
    buildBatchImportPlanMock.mockReset();
    buildDestinationUpdatePayloadMock.mockReset();
    buildImportSummaryMock.mockReset();
    buildImportedDestinationMetadataMock.mockReset();
    normalizeSlugMock.mockReset();
    verifyDestinationImportMock.mockReset();
    verifyDestinationImportMock.mockImplementation(async () => ({ ok: true }));

    const actualProcessor = await vi.importActual<typeof import("./processor")>("./processor");
    buildBatchImportPlanMock.mockImplementation(actualProcessor.buildBatchImportPlan as typeof buildBatchImportPlanMock);
    buildDestinationUpdatePayloadMock.mockImplementation(actualProcessor.buildDestinationUpdatePayload as typeof buildDestinationUpdatePayloadMock);
    buildImportSummaryMock.mockImplementation(actualProcessor.buildImportSummary as typeof buildImportSummaryMock);
    buildImportedDestinationMetadataMock.mockImplementation(actualProcessor.buildImportedDestinationMetadata as typeof buildImportedDestinationMetadataMock);
    normalizeSlugMock.mockImplementation(actualProcessor.normalizeSlug as typeof normalizeSlugMock);

    const actualDeterministicPreview = await vi.importActual<typeof import("./deterministic-preview")>("./deterministic-preview");
    classifyDeterministicV31WorkbookContractMock.mockImplementation(actualDeterministicPreview.classifyDeterministicV31WorkbookContract as typeof classifyDeterministicV31WorkbookContractMock);
  });

  it("routes valid v3.1 workbook contracts deterministically regardless of request flags", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    const previewPayload = {
      workbook: {
        schemaVersion: "3.1",
        architecture: "workbook_only_no_fallback",
        validationStatus: "PASS",
        destinationCount: 3,
        destinationKeys: ["new-braunfels-tx-us"],
        validationErrors: [],
        validationWarnings: [],
        orphanRowErrors: [],
        aliasErrors: [],
        deterministicStatus: "NO_FALLBACK",
        writeStatus: "PREVIEW_ONLY",
        writeBlocked: true,
        databaseReads: 0,
        databaseWrites: 0,
      },
      destinations: [{
        identity: { destinationKey: "new-braunfels-tx-us", slug: "new-braunfels-texas-united-states", name: "New Braunfels", city: "New Braunfels", country: "United States" },
        moduleCounts: { facts: 1, scores: 1, neighborhoods: 1, places: 0, resources: 0, media: 0 },
        canonicalDestination: { identity: { destinationKey: "new-braunfels-tx-us" } },
      }],
    };

    buildDeterministicV31PreviewResponseMock.mockResolvedValue(previewPayload);
    buildBatchImportPlanMock.mockImplementation(() => { throw new Error("legacy importer should not run"); });
    buildDestinationUpdatePayloadMock.mockImplementation(() => { throw new Error("legacy importer should not run"); });
    buildImportSummaryMock.mockImplementation(() => ({ totalRows: 0, create: 0, update: 0, reject: 0, skip: 0, warnings: 0, errors: 0 }));
    buildImportedDestinationMetadataMock.mockImplementation(() => ({ editorialContent: {}, researchProfile: {} }));
    normalizeSlugMock.mockImplementation((slug: string) => slug);

    const seenUrls: string[] = [];

    mockAdminAuthedFetch((url) => {
      seenUrls.push(url);
      if (url.includes("/auth/v1/user")) {
        return jsonResponse({ body: { id: "user-1" } });
      }
      if (url.includes("/rest/v1/app_admins")) {
        return jsonResponse({ body: [{ role: "admin" }] });
      }
      return jsonResponse({ body: [] });
    });

    const response = await POST(new Request("https://example.com/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rows: [{ city: "New Braunfels", country: "United States", slug: "new-braunfels-texas-united-states" }],
        mode: "import",
        previewOnly: false,
        dryRun: false,
        execute: true,
        commit: true,
        confirm: true,
        deterministicPreview: false,
        fileName: "workbook.xlsx",
        schema: {
          schemaVersion: "3.1",
          architecture: "workbook_only_no_fallback",
          primaryIdentity: "destination_key",
          sheetNames: ["DESTINATIONS", "DESTINATION_FACTS", "DESTINATION_SCORES", "IMPORT_CONTRACT", "PILOT_STATUS", "WORKBOOK_METADATA", "IMPORT_MANIFEST", "DESTINATION_ALIASES", "VALIDATION_RULES", "DATA_DICTIONARY"],
          headers: ["destination_key"],
        },
        workbookSheets: ["DESTINATIONS"],
        workbookRowsBySheet: { DESTINATIONS: [{ destination_key: "new-braunfels-tx-us" }] },
        workbookHeadersBySheet: { DESTINATIONS: ["destination_key"] },
      }),
    }));

    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.deterministicPreview).toBe(true);
    expect(payload.workbook.validationStatus).toBe("PASS");
    expect(payload.workbook.writeStatus).toBe("PREVIEW_ONLY");
    expect(buildBatchImportPlanMock).not.toHaveBeenCalled();
    expect(buildDestinationUpdatePayloadMock).not.toHaveBeenCalled();
    expect(verifyDestinationImportMock).not.toHaveBeenCalled();
    expect(buildDeterministicV31PreviewResponseMock).toHaveBeenCalledWith({ writeRequested: true });
    expect(seenUrls.filter((url) => url.includes("/rest/v1/destinations_catalog") || url.includes("/rest/v1/destination_import_runs") || url.includes("/rest/v1/destination_import_rows"))).toHaveLength(0);
  });

  it.each([
    ["deterministicPreview omitted", undefined],
    ["deterministicPreview false", false],
    ["deterministicPreview null", null],
    ["deterministicPreview empty string", ""],
    ["deterministicPreview zero", 0],
  ])("routes a valid v3.1 workbook to deterministic preview when %s", async (_label, deterministicPreviewValue) => {
    cookieGetMock.mockReturnValue({ value: "token" });

    buildDeterministicV31PreviewResponseMock.mockResolvedValue({
      workbook: {
        schemaVersion: "3.1",
        architecture: "workbook_only_no_fallback",
        validationStatus: "PASS",
        destinationCount: 1,
        destinationKeys: ["new-braunfels-tx-us"],
        validationErrors: [],
        validationWarnings: [],
        orphanRowErrors: [],
        aliasErrors: [],
        deterministicStatus: "NO_FALLBACK",
        writeStatus: "PREVIEW_ONLY",
        writeBlocked: true,
        databaseReads: 0,
        databaseWrites: 0,
      },
      destinations: [],
    });

    const requestBody: Record<string, unknown> = {
      rows: [{ city: "New Braunfels", country: "United States", slug: "new-braunfels-texas-united-states" }],
      mode: "import",
      previewOnly: false,
      dryRun: false,
      execute: true,
      commit: true,
      confirm: true,
      fileName: "workbook.xlsx",
      schema: {
        schemaVersion: "3.1",
        architecture: "workbook_only_no_fallback",
        primaryIdentity: "destination_key",
        sheetNames: ["DESTINATIONS", "DESTINATION_FACTS", "DESTINATION_SCORES", "IMPORT_CONTRACT", "PILOT_STATUS", "WORKBOOK_METADATA", "IMPORT_MANIFEST", "DESTINATION_ALIASES", "VALIDATION_RULES", "DATA_DICTIONARY"],
        headers: ["destination_key"],
      },
      workbookSheets: ["DESTINATIONS"],
      workbookRowsBySheet: { DESTINATIONS: [{ destination_key: "new-braunfels-tx-us" }] },
      workbookHeadersBySheet: { DESTINATIONS: ["destination_key"] },
    };

    if (deterministicPreviewValue !== undefined) {
      requestBody.deterministicPreview = deterministicPreviewValue;
    }

    const response = await POST(new Request("https://example.com/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    }));

    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.deterministicPreview).toBe(true);
    expect(buildBatchImportPlanMock).not.toHaveBeenCalled();
    expect(buildDestinationUpdatePayloadMock).not.toHaveBeenCalled();
    expect(verifyDestinationImportMock).not.toHaveBeenCalled();
  });

  it("returns a validation error and never falls through when workbook classification throws", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });
    classifyDeterministicV31WorkbookContractMock.mockRejectedValueOnce(new Error("classifier exploded"));

    buildBatchImportPlanMock.mockImplementation(() => { throw new Error("legacy importer should not run"); });
    buildDestinationUpdatePayloadMock.mockImplementation(() => { throw new Error("legacy importer should not run"); });

    const seenUrls: string[] = [];

    mockAdminAuthedFetch((url) => {
      seenUrls.push(url);
      if (url.includes("/auth/v1/user")) {
        return jsonResponse({ body: { id: "user-3" } });
      }
      if (url.includes("/rest/v1/app_admins")) {
        return jsonResponse({ body: [{ role: "admin" }] });
      }
      return jsonResponse({ body: [] });
    });

    const response = await POST(new Request("https://example.com/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rows: [{ city: "Test", country: "Country", slug: "test-country" }],
        mode: "import",
        deterministicPreview: true,
        fileName: "workbook.xlsx",
        schema: {
          schemaVersion: "3.1",
          architecture: "workbook_only_no_fallback",
          primaryIdentity: "destination_key",
          headers: ["destination_key"],
        },
        workbookSheets: ["DESTINATIONS"],
        workbookRowsBySheet: { DESTINATIONS: [{ destination_key: "test-country" }] },
        workbookHeadersBySheet: { DESTINATIONS: ["destination_key"] },
      }),
    }));

    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toMatch(/classifier|classification/i);
    expect(buildBatchImportPlanMock).not.toHaveBeenCalled();
    expect(buildDestinationUpdatePayloadMock).not.toHaveBeenCalled();
    expect(verifyDestinationImportMock).not.toHaveBeenCalled();
    expect(seenUrls.filter((url) => url.includes("/rest/v1/destinations_catalog") || url.includes("/rest/v1/destination_import_runs") || url.includes("/rest/v1/destination_import_rows"))).toHaveLength(0);
  });

  it.each([
    ["schema_version != 3.1", { schemaVersion: "3.0", architecture: "workbook_only_no_fallback", primaryIdentity: "destination_key" }],
    ["architecture != workbook_only_no_fallback", { schemaVersion: "3.1", architecture: "with_fallback", primaryIdentity: "destination_key" }],
    ["primary_identity != destination_key", { schemaVersion: "3.1", architecture: "workbook_only_no_fallback", primaryIdentity: "slug" }],
    ["missing required v3.1 sheet", { schemaVersion: "3.1", architecture: "workbook_only_no_fallback", primaryIdentity: "destination_key", sheetNames: ["DESTINATIONS"] }],
  ])("fails closed for invalid deterministic contracts when %s", async (_label, schemaMetadata) => {
    cookieGetMock.mockReturnValue({ value: "token" });

    buildDeterministicV31PreviewResponseMock.mockResolvedValue({
      workbook: {
        schemaVersion: "3.0",
        architecture: "with_fallback",
        validationStatus: "FAIL",
        destinationCount: 0,
        destinationKeys: [],
        validationErrors: ["schema_version must be 3.1"],
        validationWarnings: [],
        orphanRowErrors: [],
        aliasErrors: [],
        deterministicStatus: "NO_FALLBACK",
        writeStatus: "PREVIEW_ONLY",
        writeBlocked: true,
        databaseReads: 0,
        databaseWrites: 0,
      },
      destinations: [],
    });

    mockAdminAuthedFetch((url) => {
      if (url.includes("/auth/v1/user")) {
        return jsonResponse({ body: { id: "user-2" } });
      }
      if (url.includes("/rest/v1/app_admins")) {
        return jsonResponse({ body: [{ role: "admin" }] });
      }
      return jsonResponse({ body: [] });
    });

    const response = await POST(new Request("https://example.com/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rows: [{ city: "Test", country: "Country", slug: "test-country" }],
        mode: "import",
        deterministicPreview: true,
        fileName: "workbook.xlsx",
        schema: {
          ...schemaMetadata,
          headers: ["destination_key"],
        },
        workbookSheets: ["DESTINATIONS"],
        workbookRowsBySheet: { DESTINATIONS: [{ destination_key: "test-country" }] },
        workbookHeadersBySheet: { DESTINATIONS: ["destination_key"] },
      }),
    }));

    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toEqual(expect.any(String));
    expect(buildBatchImportPlanMock).not.toHaveBeenCalled();
    expect(buildDestinationUpdatePayloadMock).not.toHaveBeenCalled();
    expect(verifyDestinationImportMock).not.toHaveBeenCalled();
  });

  it("keeps genuinely non-v3.1 workbook requests on the legacy path", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    buildBatchImportPlanMock.mockImplementation(() => [{ action: "create", rowNumber: 1, slug: "paris-france", city: "Paris", country: "France" }]);
    buildImportSummaryMock.mockImplementation(() => ({ totalRows: 1, create: 1, update: 0, reject: 0, skip: 0, warnings: 0, errors: 0 }));

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
        return jsonResponse({ body: [{ id: "run-legacy" }] });
      }

      if (url.includes("/rest/v1/destinations_catalog?select=id,slug,city,country,status,tier,description,overview&slug=eq.paris-france&limit=1")) {
        return jsonResponse({ body: [] });
      }

      if (url.includes("/rest/v1/destinations_catalog")) {
        return jsonResponse({ body: [{ id: "dest-1" }] });
      }

      if (url.includes("/rest/v1/destination_import_rows")) {
        return jsonResponse({ body: [{ id: "row-legacy" }] });
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
    expect(buildBatchImportPlanMock).toHaveBeenCalled();
    expect(buildDestinationUpdatePayloadMock).toHaveBeenCalled();
    expect(payload.importResults).toHaveLength(1);
    expect(seenUrls.some((url) => url.includes("/rest/v1/destination_import_runs"))).toBe(true);
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
    expect(seenUrls.some((url) => url.includes("/rest/v1/destination_import_rows"))).toBe(true);
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

    verifyDestinationImportMock.mockRejectedValueOnce(new Error("Destination verification failed."));

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
    expect((createBodies[0].metadata as Record<string, unknown>).neighborhoodIntelligence).toEqual(expect.any(Array));
    expect((createBodies[0].metadata as Record<string, unknown>).knowledgeProfile).toEqual(expect.any(Object));
    expect((createBodies[0].metadata as Record<string, unknown>).premiumEditorialContent).toEqual(expect.any(Object));
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

  it("builds a Premium V2 import plan from multi-sheet workbook payloads", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    const requestPayload = {
      previewOnly: true,
      workbookSheets: ["Destinations", "Neighborhoods"],
      workbookRowsBySheet: {
        Destinations: [{ destination_name: "Cavtat", country: "Croatia", slug: "cavtat-croatia" }],
        Neighborhoods: [{ destination_name: "Cavtat", neighborhood_name: "Old Town", neighborhood_slug: "old-town" }],
      },
      workbookHeadersBySheet: {
        Destinations: ["destination_name", "country", "slug"],
        Neighborhoods: ["destination_name", "neighborhood_name", "neighborhood_slug"],
      },
    };

    mockAdminAuthedFetch((url) => {
      if (url.includes("/rest/v1/destinations_catalog")) {
        return jsonResponse({ body: [{ id: "dest-1", slug: "cavtat-croatia", city: "Cavtat", country: "Croatia" }] });
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
    expect(payload.plan).toEqual(expect.any(Array));
    expect(payload.plan.some((entry: Record<string, unknown>) => entry.action === "update")).toBe(true);
    expect(payload.plan.some((entry: Record<string, unknown>) => entry.action === "create")).toBe(true);
    expect(payload.summary?.destinationCount).toBe(1);
  });

  it("returns a Premium V2 contract preview during workbook preview requests", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    const requestPayload = {
      previewOnly: true,
      workbookSheets: ["Destinations", "Neighborhoods"],
      workbookRowsBySheet: {
        Destinations: [{ destination_name: "Cavtat", country: "Croatia", slug: "cavtat-croatia" }],
        Neighborhoods: [{ destination_name: "Cavtat", neighborhood_name: "Old Town", neighborhood_slug: "old-town" }],
      },
      workbookHeadersBySheet: {
        Destinations: ["destination_name", "country", "slug"],
        Neighborhoods: ["destination_name", "neighborhood_name", "neighborhood_slug"],
      },
    };

    mockAdminAuthedFetch((url) => {
      if (url.includes("/rest/v1/destinations_catalog")) {
        return jsonResponse({ body: [{ id: "dest-1", slug: "cavtat-croatia", city: "Cavtat", country: "Croatia" }] });
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
    expect(payload.contractPreview).toEqual(expect.objectContaining({
      recognized: true,
      runtimeModules: expect.arrayContaining([expect.objectContaining({ key: "destinations", detected: true })]),
      structuralSheets: expect.arrayContaining([expect.objectContaining({ key: "schema_index" })]),
      errors: expect.any(Array),
      warnings: expect.any(Array),
    }));
  });

  it("persists premium V2 workbook rows into destinations, neighborhoods, places, resources, and media when applied", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    const requestPayload = {
      previewOnly: false,
      workbookSheets: ["Destinations", "Neighborhoods", "Neighborhood Places", "Resources", "Media"],
      workbookRowsBySheet: {
        Destinations: [{ destination_name: "Cavtat", country: "Croatia", slug: "cavtat-croatia" }],
        Neighborhoods: [{ destination_name: "Cavtat", neighborhood_name: "Old Town" }],
        "Neighborhood Places": [{ destination_name: "Cavtat", neighborhood_name: "Old Town", category: "Restaurant", real_place_name: "Tanjga Restaurant", address: "Obala 11", google_maps_url: "https://maps.google.com/?q=Tanjga%20Restaurant", website_url: "https://www.tanjga.hr" }],
        Resources: [{ destination: "Cavtat", resource_name: "Cavtat Tourism", resource_category: "Official Tourism", url: "https://www.cavtat-tourism.com" }],
        Media: [{ destination: "Cavtat", image_url: "https://example.com/cavtat.jpg", verified: true }],
      },
    };

    const postedBodies: Array<Record<string, unknown>> = [];

    mockAdminAuthedFetch((url, init) => {
      if (url.includes("/rest/v1/destination_import_runs")) {
        return jsonResponse({ body: [{ id: "run-apply" }] });
      }

      if (url.includes("/rest/v1/destinations_catalog?select=id,slug,city,country,description,overview,status,tier&order=city.asc")) {
        return jsonResponse({ body: [] });
      }

      if (url.includes("/rest/v1/neighborhoods") && init?.method === "POST") {
        const body = JSON.parse(String(init.body ?? "{}"));
        postedBodies.push({ table: "neighborhoods", body });
        return jsonResponse({ body: [{ id: "neigh-1" }] });
      }

      if (url.includes("/rest/v1/destination_places") && init?.method === "POST") {
        const body = JSON.parse(String(init.body ?? "{}"));
        postedBodies.push({ table: "destination_places", body });
        return jsonResponse({ body: [{ id: "place-1" }] });
      }

      if (url.includes("/rest/v1/destination_resource_links") && init?.method === "POST") {
        const body = JSON.parse(String(init.body ?? "{}"));
        postedBodies.push({ table: "destination_resource_links", body });
        return jsonResponse({ body: [{ id: "resource-1" }] });
      }

      if (url.includes("/rest/v1/destination_media_assets") && init?.method === "POST") {
        const body = JSON.parse(String(init.body ?? "{}"));
        postedBodies.push({ table: "destination_media_assets", body });
        return jsonResponse({ body: [{ id: "media-1" }] });
      }

      if (url.includes("/rest/v1/destinations_catalog") && init?.method === "POST") {
        const body = JSON.parse(String(init.body ?? "{}"));
        postedBodies.push({ table: "destinations_catalog", body });
        return jsonResponse({ body: [{ id: "dest-created", slug: body.slug, city: body.city, country: body.country }] });
      }

      if (url.includes("/rest/v1/destinations_catalog") && init?.method === "PATCH") {
        return jsonResponse({ body: [{ id: "dest-1", slug: "cavtat-croatia", city: "Cavtat", country: "Croatia" }] });
      }

      if (url.includes("/rest/v1/destination_import_rows")) {
        return jsonResponse({ body: [{ id: "row-apply" }] });
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
    expect(payload.importResults.some((entry: Record<string, unknown>) => entry.action === "create")).toBe(true);
    expect(postedBodies.some((entry) => entry.table === "neighborhoods")).toBe(true);
    expect(postedBodies.some((entry) => entry.table === "destination_places")).toBe(true);
    expect(postedBodies.some((entry) => entry.table === "destination_resource_links")).toBe(true);
    expect(postedBodies.some((entry) => entry.table === "destination_media_assets")).toBe(true);
  });

  it("runs a final post-apply enrichment pass for Premium V2 workbook imports and marks destinations for review", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    const requestPayload = {
      previewOnly: false,
      workbookSheets: ["Destinations", "Neighborhoods", "Neighborhood Places", "Resources", "Media"],
      workbookRowsBySheet: {
        Destinations: [{ destination_name: "Cavtat", country: "Croatia", slug: "cavtat-croatia", description: "Cavtat is a harbor town." }],
        Neighborhoods: [{ destination_name: "Cavtat", neighborhood_name: "Old Town" }],
        "Neighborhood Places": [{ destination_name: "Cavtat", neighborhood_name: "Old Town", category: "Restaurant", real_place_name: "Tanjga Restaurant", address: "Obala 11", google_maps_url: "https://maps.google.com/?q=Tanjga%20Restaurant", website_url: "https://www.tanjga.hr", verified: true }],
        Resources: [{ destination: "Cavtat", resource_name: "Cavtat Tourism", resource_category: "Official Tourism", url: "https://www.cavtat-tourism.com", verified: true }],
        Media: [{ destination: "Cavtat", image_url: "https://example.com/cavtat.jpg", verified: true }],
      },
    };

    const enrichmentPatchBodies: Array<Record<string, unknown>> = [];

    mockAdminAuthedFetch((url, init) => {
      if (url.includes("/rest/v1/destination_import_runs")) {
        return jsonResponse({ body: [{ id: "run-enrichment" }] });
      }

      if (url.includes("/rest/v1/destinations_catalog?select=id,slug,city,country,description,overview,status,tier&order=city.asc")) {
        return jsonResponse({ body: [] });
      }

      if (url.includes("/rest/v1/neighborhoods") && init?.method === "POST") {
        return jsonResponse({ body: [{ id: "neigh-2" }] });
      }

      if (url.includes("/rest/v1/destination_places") && init?.method === "POST") {
        return jsonResponse({ body: [{ id: "place-2" }] });
      }

      if (url.includes("/rest/v1/destination_resource_links") && init?.method === "POST") {
        return jsonResponse({ body: [{ id: "resource-2" }] });
      }

      if (url.includes("/rest/v1/destination_media_assets") && init?.method === "POST") {
        return jsonResponse({ body: [{ id: "media-2" }] });
      }

      if (url.includes("/rest/v1/destinations_catalog") && init?.method === "POST") {
        return jsonResponse({ body: [{ id: "dest-created-2", slug: "cavtat-croatia", city: "Cavtat", country: "Croatia" }] });
      }

      if (url.includes("/rest/v1/destinations_catalog") && init?.method === "PATCH") {
        const body = JSON.parse(String(init.body ?? "{}"));
        enrichmentPatchBodies.push(body);
        return jsonResponse({ body: [{ id: "dest-created-2", slug: "cavtat-croatia", city: "Cavtat", country: "Croatia" }] });
      }

      if (url.includes("/rest/v1/destination_import_rows")) {
        return jsonResponse({ body: [{ id: "row-enrichment" }] });
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
    expect(payload.importResults.some((entry: Record<string, unknown>) => entry.action === "create")).toBe(true);
    expect(enrichmentPatchBodies).toHaveLength(1);
    expect(enrichmentPatchBodies[0]).toEqual(expect.objectContaining({
      status: "review",
      metadata: expect.objectContaining({
        importedVerifiedFacts: expect.objectContaining({
          neighborhoods: expect.any(Array),
          places: expect.any(Array),
          resources: expect.any(Array),
          media: expect.any(Array),
        }),
        postApplyEnrichment: expect.objectContaining({ status: "completed" }),
      }),
    }));
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
