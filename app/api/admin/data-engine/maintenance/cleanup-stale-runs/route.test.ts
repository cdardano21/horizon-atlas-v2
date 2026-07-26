import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getAuthedAdminMock,
  isSupabaseConfiguredMock,
  countStaleRunningImportRunsMock,
  failStaleRunningImportRunsMock,
  insertMaintenanceActionMock,
} = vi.hoisted(() => ({
  getAuthedAdminMock: vi.fn(),
  isSupabaseConfiguredMock: vi.fn(),
  countStaleRunningImportRunsMock: vi.fn(),
  failStaleRunningImportRunsMock: vi.fn(),
  insertMaintenanceActionMock: vi.fn(),
}));

vi.mock("../../../../../lib/admin-auth", () => ({
  getAuthedAdmin: getAuthedAdminMock,
}));

vi.mock("../../../../../lib/supabase", () => ({
  isSupabaseConfigured: isSupabaseConfiguredMock,
}));

vi.mock("../../../../../lib/data-engine/repository", () => ({
  countStaleRunningImportRuns: countStaleRunningImportRunsMock,
  failStaleRunningImportRuns: failStaleRunningImportRunsMock,
  insertMaintenanceAction: insertMaintenanceActionMock,
}));

import { POST } from "./route";

describe("admin cleanup stale-runs route", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    getAuthedAdminMock.mockReset();
    isSupabaseConfiguredMock.mockReset();
    countStaleRunningImportRunsMock.mockReset();
    failStaleRunningImportRunsMock.mockReset();
    insertMaintenanceActionMock.mockReset();

    isSupabaseConfiguredMock.mockReturnValue(true);
    getAuthedAdminMock.mockResolvedValue({
      accessToken: "token",
      user: { id: "user_1" },
      adminRole: "admin",
    });

    countStaleRunningImportRunsMock.mockResolvedValue(2);
    failStaleRunningImportRunsMock.mockResolvedValue(2);
    insertMaintenanceActionMock.mockResolvedValue({ id: "audit_1" });
  });

  it("returns 500 when supabase config is missing", async () => {
    isSupabaseConfiguredMock.mockReturnValue(false);

    const response = await POST(
      new Request("http://localhost:3000/api/admin/data-engine/maintenance/cleanup-stale-runs", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(500);
  });

  it("returns 403 for non-admin users", async () => {
    getAuthedAdminMock.mockResolvedValue({ accessToken: null, user: null, adminRole: null });

    const response = await POST(
      new Request("http://localhost:3000/api/admin/data-engine/maintenance/cleanup-stale-runs", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(403);
  });

  it("returns 400 for invalid staleAfterHours", async () => {
    const response = await POST(
      new Request("http://localhost:3000/api/admin/data-engine/maintenance/cleanup-stale-runs", {
        method: "POST",
        body: JSON.stringify({ staleAfterHours: 0 }),
      }),
    );

    expect(response.status).toBe(400);
  });

  it("supports dry run mode", async () => {
    const response = await POST(
      new Request("http://localhost:3000/api/admin/data-engine/maintenance/cleanup-stale-runs", {
        method: "POST",
        body: JSON.stringify({ dryRun: true, categoryKey: "monthly_weather" }),
      }),
    );

    const payload = (await response.json()) as {
      dryRun?: boolean;
      staleMatchCount?: number;
      affectedCount?: number;
      auditActionId?: string;
    };
    expect(response.status).toBe(200);
    expect(payload.dryRun).toBe(true);
    expect(payload.staleMatchCount).toBe(2);
    expect(payload.affectedCount).toBe(0);
    expect(payload.auditActionId).toBe("audit_1");
    expect(failStaleRunningImportRunsMock).not.toHaveBeenCalled();
    expect(insertMaintenanceActionMock).toHaveBeenCalledTimes(1);
  });

  it("executes cleanup when dryRun is false", async () => {
    const response = await POST(
      new Request("http://localhost:3000/api/admin/data-engine/maintenance/cleanup-stale-runs", {
        method: "POST",
        body: JSON.stringify({
          dryRun: false,
          categoryKey: "rent_prices",
          sourceKey: "numbeo",
          staleAfterHours: 8,
        }),
      }),
    );

    const payload = (await response.json()) as {
      dryRun?: boolean;
      staleAfterHours?: number;
      staleMatchCount?: number;
      affectedCount?: number;
      auditActionId?: string;
    };

    expect(response.status).toBe(200);
    expect(payload.dryRun).toBe(false);
    expect(payload.staleAfterHours).toBe(8);
    expect(payload.staleMatchCount).toBe(2);
    expect(payload.affectedCount).toBe(2);
    expect(payload.auditActionId).toBe("audit_1");
    expect(failStaleRunningImportRunsMock).toHaveBeenCalledTimes(1);
    expect(insertMaintenanceActionMock).toHaveBeenCalledTimes(1);
  });
});
