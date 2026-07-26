import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getAuthedAdminMock,
  isSupabaseConfiguredMock,
  countImportRunsByStatusMock,
  countStaleRunningImportRunsMock,
  countErrorLogsSinceMock,
  listRecentImportRunsMock,
} = vi.hoisted(() => ({
  getAuthedAdminMock: vi.fn(),
  isSupabaseConfiguredMock: vi.fn(),
  countImportRunsByStatusMock: vi.fn(),
  countStaleRunningImportRunsMock: vi.fn(),
  countErrorLogsSinceMock: vi.fn(),
  listRecentImportRunsMock: vi.fn(),
}));

vi.mock("../../../../lib/admin-auth", () => ({
  getAuthedAdmin: getAuthedAdminMock,
}));

vi.mock("../../../../lib/supabase", () => ({
  isSupabaseConfigured: isSupabaseConfiguredMock,
}));

vi.mock("../../../../lib/data-engine/repository", () => ({
  countImportRunsByStatus: countImportRunsByStatusMock,
  countStaleRunningImportRuns: countStaleRunningImportRunsMock,
  countErrorLogsSince: countErrorLogsSinceMock,
  listRecentImportRuns: listRecentImportRunsMock,
}));

import { GET } from "./route";

describe("admin data-engine health route", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    getAuthedAdminMock.mockReset();
    isSupabaseConfiguredMock.mockReset();
    countImportRunsByStatusMock.mockReset();
    countStaleRunningImportRunsMock.mockReset();
    countErrorLogsSinceMock.mockReset();
    listRecentImportRunsMock.mockReset();

    isSupabaseConfiguredMock.mockReturnValue(true);
    getAuthedAdminMock.mockResolvedValue({
      accessToken: "token",
      user: { id: "user_1" },
      adminRole: "admin",
    });

    countImportRunsByStatusMock
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(9)
      .mockResolvedValueOnce(1);
    countStaleRunningImportRunsMock.mockResolvedValue(1);
    countErrorLogsSinceMock.mockResolvedValue(3);
    listRecentImportRunsMock.mockResolvedValue([{ id: "run_1", status: "running" }]);
  });

  it("returns 500 when supabase config is missing", async () => {
    isSupabaseConfiguredMock.mockReturnValue(false);

    const response = await GET(new Request("http://localhost:3000/api/admin/data-engine/health"));
    expect(response.status).toBe(500);
  });

  it("returns 403 for non-admin users", async () => {
    getAuthedAdminMock.mockResolvedValue({ accessToken: null, user: null, adminRole: null });

    const response = await GET(new Request("http://localhost:3000/api/admin/data-engine/health"));
    expect(response.status).toBe(403);
  });

  it("returns health snapshot with defaults", async () => {
    const response = await GET(new Request("http://localhost:3000/api/admin/data-engine/health"));
    const payload = (await response.json()) as {
      summary?: { runningCount?: number; staleRunningCount?: number; recentErrorCount?: number };
      window?: { staleAfterHours?: number; recentWindowHours?: number; recentRunLimit?: number };
      health?: { status?: string; reasons?: string[] };
      recentRuns?: Array<{ id: string }>;
    };

    expect(response.status).toBe(200);
    expect(payload.window?.staleAfterHours).toBe(6);
    expect(payload.window?.recentWindowHours).toBe(24);
    expect(payload.window?.recentRunLimit).toBe(20);
    expect(payload.summary?.runningCount).toBe(2);
    expect(payload.summary?.staleRunningCount).toBe(1);
    expect(payload.summary?.recentErrorCount).toBe(3);
    expect(payload.health?.status).toBe("critical");
    expect(payload.health?.reasons?.length).toBeGreaterThan(0);
    expect(payload.recentRuns?.[0]?.id).toBe("run_1");
  });

  it("accepts custom query windows", async () => {
    const response = await GET(
      new Request(
        "http://localhost:3000/api/admin/data-engine/health?staleAfterHours=12&recentWindowHours=72&recentRunLimit=50&criticalStaleRunningCount=2&warnFailedRecentCount=1",
      ),
    );
    const payload = (await response.json()) as {
      window?: { staleAfterHours?: number; recentWindowHours?: number; recentRunLimit?: number };
      thresholds?: { criticalStaleRunningCount?: number; warnFailedRecentCount?: number };
      health?: { status?: string; reasons?: string[] };
    };

    expect(response.status).toBe(200);
    expect(payload.window?.staleAfterHours).toBe(12);
    expect(payload.window?.recentWindowHours).toBe(72);
    expect(payload.window?.recentRunLimit).toBe(50);
    expect(payload.thresholds?.criticalStaleRunningCount).toBe(2);
    expect(payload.thresholds?.warnFailedRecentCount).toBe(1);
    expect(payload.health?.status).toBe("warn");
    expect(payload.health?.reasons?.some((reason) => reason.includes("failedRecentCount"))).toBe(true);
  });

  it("returns ok when thresholds are raised above current metrics", async () => {
    const response = await GET(
      new Request(
        "http://localhost:3000/api/admin/data-engine/health?warnRunningCount=10&warnFailedRecentCount=10&warnErrorRecentCount=10&criticalStaleRunningCount=10&criticalFailedRecentCount=10&criticalErrorRecentCount=10",
      ),
    );
    const payload = (await response.json()) as { health?: { status?: string; reasons?: string[] } };

    expect(response.status).toBe(200);
    expect(payload.health?.status).toBe("ok");
    expect(payload.health?.reasons).toEqual([]);
  });
});
