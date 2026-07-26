import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAuthedAdminMock, isSupabaseConfiguredMock, executeScheduledImportMock } = vi.hoisted(() => ({
  getAuthedAdminMock: vi.fn(),
  isSupabaseConfiguredMock: vi.fn(),
  executeScheduledImportMock: vi.fn(),
}));

vi.mock("../../../../lib/admin-auth", () => ({
  getAuthedAdmin: getAuthedAdminMock,
}));

vi.mock("../../../../lib/supabase", () => ({
  isSupabaseConfigured: isSupabaseConfiguredMock,
}));

vi.mock("../../../../lib/data-engine/scheduling", () => ({
  executeScheduledImport: executeScheduledImportMock,
}));

import { POST } from "./route";

describe("admin data-engine schedule route", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    getAuthedAdminMock.mockReset();
    isSupabaseConfiguredMock.mockReset();
    executeScheduledImportMock.mockReset();

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
      new Request("http://localhost:3000/api/admin/data-engine/schedule", {
        method: "POST",
        body: JSON.stringify({ categoryKey: "monthly_weather" }),
      }),
    );

    expect(response.status).toBe(500);
  });

  it("returns 403 when user is not admin-authenticated", async () => {
    getAuthedAdminMock.mockResolvedValue({ accessToken: null, user: null, adminRole: null });

    const response = await POST(
      new Request("http://localhost:3000/api/admin/data-engine/schedule", {
        method: "POST",
        body: JSON.stringify({ categoryKey: "monthly_weather" }),
      }),
    );

    expect(response.status).toBe(403);
  });

  it("returns 400 when categoryKey is missing", async () => {
    const response = await POST(
      new Request("http://localhost:3000/api/admin/data-engine/schedule", {
        method: "POST",
        body: JSON.stringify({ force: true }),
      }),
    );

    expect(response.status).toBe(400);
  });

  it("returns 400 when maxDestinations is invalid", async () => {
    const response = await POST(
      new Request("http://localhost:3000/api/admin/data-engine/schedule", {
        method: "POST",
        body: JSON.stringify({ categoryKey: "monthly_weather", maxDestinations: 0 }),
      }),
    );

    expect(response.status).toBe(400);
  });

  it("returns scheduler skip result", async () => {
    executeScheduledImportMock.mockResolvedValue({
      success: true,
      skipped: true,
      reason: "not due",
      policy: { minIntervalHours: 720, maxDestinationsPerRun: 150 },
      lastRunAt: "2026-07-24T00:00:00.000Z",
    });

    const response = await POST(
      new Request("http://localhost:3000/api/admin/data-engine/schedule", {
        method: "POST",
        body: JSON.stringify({ categoryKey: "monthly_weather" }),
      }),
    );

    const payload = (await response.json()) as { skipped?: boolean; reason?: string };
    expect(response.status).toBe(200);
    expect(payload.skipped).toBe(true);
    expect(payload.reason).toBe("not due");
  });

  it("returns scheduler run result", async () => {
    executeScheduledImportMock.mockResolvedValue({
      success: true,
      skipped: false,
      policy: { minIntervalHours: 168, maxDestinationsPerRun: 60 },
      run: {
        runId: "run_99",
        categoryKey: "rent_prices",
        sourceKey: "numbeo",
        destinationCount: 20,
        rawCount: 400,
        normalizedCount: 390,
        dedupedCount: 350,
        rejectedCount: 10,
        startedAt: "2026-07-24T00:00:00.000Z",
        finishedAt: "2026-07-24T00:03:00.000Z",
      },
    });

    const response = await POST(
      new Request("http://localhost:3000/api/admin/data-engine/schedule", {
        method: "POST",
        body: JSON.stringify({ categoryKey: "rent_prices", maxDestinations: 40 }),
      }),
    );

    const payload = (await response.json()) as {
      skipped?: boolean;
      run?: { runId?: string; sourceKey?: string };
      policy?: { maxDestinationsPerRun?: number };
    };

    expect(response.status).toBe(200);
    expect(payload.skipped).toBe(false);
    expect(payload.run?.runId).toBe("run_99");
    expect(payload.run?.sourceKey).toBe("numbeo");
    expect(payload.policy?.maxDestinationsPerRun).toBe(60);
  });

  it("returns 409 when a scheduled import conflicts with an active run", async () => {
    const conflict = new Error("An import run is already active for category rent_prices and source numbeo.");
    conflict.name = "ImportConcurrencyError";
    executeScheduledImportMock.mockRejectedValue(conflict);

    const response = await POST(
      new Request("http://localhost:3000/api/admin/data-engine/schedule", {
        method: "POST",
        body: JSON.stringify({ categoryKey: "rent_prices" }),
      }),
    );

    const payload = (await response.json()) as { error?: string };
    expect(response.status).toBe(409);
    expect(payload.error).toContain("already active");
  });
});
