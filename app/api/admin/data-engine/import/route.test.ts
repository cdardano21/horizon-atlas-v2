import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAuthedAdminMock, isSupabaseConfiguredMock, executeImportRunMock } = vi.hoisted(() => ({
  getAuthedAdminMock: vi.fn(),
  isSupabaseConfiguredMock: vi.fn(),
  executeImportRunMock: vi.fn(),
}));

vi.mock("../../../../lib/admin-auth", () => ({
  getAuthedAdmin: getAuthedAdminMock,
}));

vi.mock("../../../../lib/supabase", () => ({
  isSupabaseConfigured: isSupabaseConfiguredMock,
}));

vi.mock("../../../../lib/data-engine/orchestrator", () => ({
  executeImportRun: executeImportRunMock,
}));

import { POST } from "./route";

describe("admin data-engine import route", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    getAuthedAdminMock.mockReset();
    isSupabaseConfiguredMock.mockReset();
    executeImportRunMock.mockReset();

    isSupabaseConfiguredMock.mockReturnValue(true);
    getAuthedAdminMock.mockResolvedValue({
      accessToken: "token",
      user: { id: "user_1" },
      adminRole: "admin",
    });
  });

  it("returns 500 when supabase config is missing", async () => {
    isSupabaseConfiguredMock.mockReturnValue(false);

    const response = await POST(
      new Request("http://localhost:3000/api/admin/data-engine/import", {
        method: "POST",
        body: JSON.stringify({ categoryKey: "monthly_weather" }),
      }),
    );

    expect(response.status).toBe(500);
  });

  it("returns 403 when user is not admin-authenticated", async () => {
    getAuthedAdminMock.mockResolvedValue({ accessToken: null, user: null, adminRole: null });

    const response = await POST(
      new Request("http://localhost:3000/api/admin/data-engine/import", {
        method: "POST",
        body: JSON.stringify({ categoryKey: "monthly_weather" }),
      }),
    );

    expect(response.status).toBe(403);
  });

  it("returns 400 when categoryKey is missing", async () => {
    const response = await POST(
      new Request("http://localhost:3000/api/admin/data-engine/import", {
        method: "POST",
        body: JSON.stringify({ sourceKey: "openmeteo" }),
      }),
    );

    expect(response.status).toBe(400);
  });

  it("returns 200 with import run summary on success", async () => {
    executeImportRunMock.mockResolvedValue({
      runId: "run_1",
      categoryKey: "monthly_weather",
      sourceKey: "openmeteo",
      destinationCount: 5,
      rawCount: 60,
      normalizedCount: 60,
      dedupedCount: 60,
      rejectedCount: 0,
      startedAt: "2026-07-24T00:00:00.000Z",
      finishedAt: "2026-07-24T00:00:05.000Z",
    });

    const response = await POST(
      new Request("http://localhost:3000/api/admin/data-engine/import", {
        method: "POST",
        body: JSON.stringify({
          categoryKey: "monthly_weather",
          destinationSlugs: ["lisbon-portugal"],
        }),
      }),
    );

    const payload = (await response.json()) as { success?: boolean; result?: { runId?: string } };
    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.result?.runId).toBe("run_1");
  });

  it("returns 409 when a run is already active", async () => {
    const conflict = new Error("An import run is already active for category monthly_weather and source openmeteo.");
    conflict.name = "ImportConcurrencyError";
    executeImportRunMock.mockRejectedValue(conflict);

    const response = await POST(
      new Request("http://localhost:3000/api/admin/data-engine/import", {
        method: "POST",
        body: JSON.stringify({ categoryKey: "monthly_weather", sourceKey: "openmeteo" }),
      }),
    );

    const payload = (await response.json()) as { error?: string };
    expect(response.status).toBe(409);
    expect(payload.error).toContain("already active");
  });
});
