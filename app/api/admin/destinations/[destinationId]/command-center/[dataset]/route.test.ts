import { beforeEach, describe, expect, it, vi } from "vitest";
import { jsonResponse, mockAdminAuthedFetch } from "../../../../../../test-utils/adminRouteFetchMocks";

const { cookieGetMock, cookiesMock } = vi.hoisted(() => {
  const cookieGetMock = vi.fn();
  const cookiesMock = vi.fn(async () => ({ get: cookieGetMock }));
  return { cookieGetMock, cookiesMock };
});

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("../../../../../../lib/supabase", () => ({
  isSupabaseConfigured: () => true,
  getSupabaseConfig: () => ({
    url: "https://example.supabase.co",
    anonKey: "anon-key",
  }),
}));

import { GET, PUT } from "./route";

const routeContext = (destinationId: string, dataset: string) => ({
  params: Promise.resolve({ destinationId, dataset }),
});

describe("admin destination command-center dataset route", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    cookieGetMock.mockReset();
    cookiesMock.mockClear();
  });

  it("returns 400 for unsupported dataset on GET", async () => {
    const response = await GET(
      new Request("http://localhost:3000/api/admin/destinations/d1/command-center/unknown"),
      routeContext("d1", "unknown"),
    );

    expect(response.status).toBe(400);
  });

  it("returns 403 for GET when unauthenticated", async () => {
    cookieGetMock.mockReturnValue(undefined);

    const response = await GET(
      new Request("http://localhost:3000/api/admin/destinations/d1/command-center/destination_core_metrics"),
      routeContext("d1", "destination_core_metrics"),
    );

    expect(response.status).toBe(403);
  });

  it("returns mapped rows for GET when authenticated", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    mockAdminAuthedFetch((url) => {
      if (url.includes("/rest/v1/destination_core_metrics?select=*&destination_id=eq.d1")) {
        return jsonResponse({
          status: 200,
          body: [
            {
              id: "m1",
              destination_id: "d1",
              metric_key: "monthly_budget",
              metric_label: "Monthly budget",
              display_value: "$2,600",
            },
          ],
        });
      }
      return null;
    });

    const response = await GET(
      new Request("http://localhost:3000/api/admin/destinations/d1/command-center/destination_core_metrics"),
      routeContext("d1", "destination_core_metrics"),
    );
    const payload = (await response.json()) as {
      dataset?: string;
      rows?: Array<Record<string, unknown>>;
    };

    expect(response.status).toBe(200);
    expect(payload.dataset).toBe("destination_core_metrics");
    expect(payload.rows).toEqual([
      {
        id: "m1",
        destination_id: "d1",
        metric_key: "monthly_budget",
        metric_label: "Monthly budget",
        display_value: "$2,600",
      },
    ]);
  });

  it("returns 400 for PUT when rows is not an array", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });
    mockAdminAuthedFetch(() => null);

    const response = await PUT(
      new Request("http://localhost:3000/api/admin/destinations/d1/command-center/destination_core_metrics", {
        method: "PUT",
        body: JSON.stringify({ rows: { bad: true } }),
      }),
      routeContext("d1", "destination_core_metrics"),
    );

    expect(response.status).toBe(400);
  });

  it("returns 200 for PUT clear operation when rows is empty", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    mockAdminAuthedFetch((url, init) => {
      if (url.includes("/rest/v1/destination_core_metrics?destination_id=eq.d1") && init?.method === "DELETE") {
        return jsonResponse({ status: 200, body: {} });
      }
      return null;
    });

    const response = await PUT(
      new Request("http://localhost:3000/api/admin/destinations/d1/command-center/destination_core_metrics", {
        method: "PUT",
        body: JSON.stringify({ rows: [] }),
      }),
      routeContext("d1", "destination_core_metrics"),
    );

    const payload = (await response.json()) as { success?: boolean; count?: number };
    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.count).toBe(0);
  });

  it("sanitizes system fields on PUT and inserts rows", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });
    let capturedInsertBody: Array<Record<string, unknown>> | null = null;

    mockAdminAuthedFetch((url, init) => {
      if (url.includes("/rest/v1/monthly_climate?destination_id=eq.d1") && init?.method === "DELETE") {
        return jsonResponse({ status: 200, body: {} });
      }

      if (url.endsWith("/rest/v1/monthly_climate") && init?.method === "POST") {
        capturedInsertBody = JSON.parse(String(init.body)) as Array<Record<string, unknown>>;
        return jsonResponse({ status: 200, body: capturedInsertBody });
      }

      return null;
    });

    const response = await PUT(
      new Request("http://localhost:3000/api/admin/destinations/d1/command-center/monthly_climate", {
        method: "PUT",
        body: JSON.stringify({
          rows: [
            {
              id: "old-id",
              destination_id: "wrong",
              created_at: "2020-01-01",
              updated_at: "2020-01-01",
              month_index: 1,
              month_name: "January",
              avg_high_c: 18,
              avg_low_c: 9,
            },
          ],
        }),
      }),
      routeContext("d1", "monthly_climate"),
    );

    const payload = (await response.json()) as { success?: boolean; count?: number };
    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.count).toBe(1);
    expect(capturedInsertBody).toEqual([
      {
        destination_id: "d1",
        month_index: 1,
        month_name: "January",
        avg_high_c: 18,
        avg_low_c: 9,
      },
    ]);
  });

  it("filters out non-object rows and clears without insert when no valid rows remain", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });
    let insertCalled = false;

    mockAdminAuthedFetch((url, init) => {
      if (url.includes("/rest/v1/monthly_climate?destination_id=eq.d1") && init?.method === "DELETE") {
        return jsonResponse({ status: 200, body: {} });
      }

      if (url.endsWith("/rest/v1/monthly_climate") && init?.method === "POST") {
        insertCalled = true;
        return jsonResponse({ status: 200, body: [] });
      }

      return null;
    });

    const response = await PUT(
      new Request("http://localhost:3000/api/admin/destinations/d1/command-center/monthly_climate", {
        method: "PUT",
        body: JSON.stringify({
          rows: [null, "bad", 42, ["array-row"]],
        }),
      }),
      routeContext("d1", "monthly_climate"),
    );

    const payload = (await response.json()) as { success?: boolean; count?: number };
    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.count).toBe(0);
    expect(insertCalled).toBe(false);
  });

  it("preserves business fields while stripping mutable system columns", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });
    let capturedInsertBody: Array<Record<string, unknown>> | null = null;

    mockAdminAuthedFetch((url, init) => {
      if (url.includes("/rest/v1/destination_scores?destination_id=eq.d1") && init?.method === "DELETE") {
        return jsonResponse({ status: 200, body: {} });
      }

      if (url.endsWith("/rest/v1/destination_scores") && init?.method === "POST") {
        capturedInsertBody = JSON.parse(String(init.body)) as Array<Record<string, unknown>>;
        return jsonResponse({ status: 200, body: capturedInsertBody });
      }

      return null;
    });

    const response = await PUT(
      new Request("http://localhost:3000/api/admin/destinations/d1/command-center/destination_scores", {
        method: "PUT",
        body: JSON.stringify({
          rows: [
            {
              id: "old-id",
              destination_id: "wrong",
              created_at: "2020-01-01",
              updated_at: "2020-01-01",
              category: "Safety",
              score: 92,
              explanation: "Low violent crime in target districts",
            },
          ],
        }),
      }),
      routeContext("d1", "destination_scores"),
    );

    expect(response.status).toBe(200);
    expect(capturedInsertBody).toEqual([
      {
        destination_id: "d1",
        category: "Safety",
        score: 92,
        explanation: "Low violent crime in target districts",
      },
    ]);
  });

  it("propagates delete failure status on PUT", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    mockAdminAuthedFetch((url, init) => {
      if (url.includes("/rest/v1/schools?destination_id=eq.d1") && init?.method === "DELETE") {
        return jsonResponse({ status: 503, body: { message: "service unavailable" } });
      }
      return null;
    });

    const response = await PUT(
      new Request("http://localhost:3000/api/admin/destinations/d1/command-center/schools", {
        method: "PUT",
        body: JSON.stringify({ rows: [{ name: "School A" }] }),
      }),
      routeContext("d1", "schools"),
    );

    expect(response.status).toBe(503);
  });

  it("returns insert failure details on PUT", async () => {
    cookieGetMock.mockReturnValue({ value: "token" });

    mockAdminAuthedFetch((url, init) => {
      if (url.includes("/rest/v1/destination_scores?destination_id=eq.d1") && init?.method === "DELETE") {
        return jsonResponse({ status: 200, body: {} });
      }

      if (url.endsWith("/rest/v1/destination_scores") && init?.method === "POST") {
        return new Response("duplicate key value violates unique constraint", {
          status: 409,
          headers: { "Content-Type": "text/plain" },
        });
      }

      return null;
    });

    const response = await PUT(
      new Request("http://localhost:3000/api/admin/destinations/d1/command-center/destination_scores", {
        method: "PUT",
        body: JSON.stringify({ rows: [{ category: "Safety", score: 90 }] }),
      }),
      routeContext("d1", "destination_scores"),
    );

    const payload = (await response.json()) as { error?: string; details?: string };
    expect(response.status).toBe(409);
    expect(payload.error).toBe("Unable to save destination_scores.");
    expect(payload.details).toContain("duplicate key value violates unique constraint");
  });
});
