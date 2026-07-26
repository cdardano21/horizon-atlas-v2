import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getAuthedAdminMock,
  isSupabaseConfiguredMock,
  listMaintenanceActionsMock,
} = vi.hoisted(() => ({
  getAuthedAdminMock: vi.fn(),
  isSupabaseConfiguredMock: vi.fn(),
  listMaintenanceActionsMock: vi.fn(),
}));

vi.mock("../../../../../lib/admin-auth", () => ({
  getAuthedAdmin: getAuthedAdminMock,
}));

vi.mock("../../../../../lib/supabase", () => ({
  isSupabaseConfigured: isSupabaseConfiguredMock,
}));

vi.mock("../../../../../lib/data-engine/repository", () => ({
  listMaintenanceActions: listMaintenanceActionsMock,
}));

import { GET } from "./route";

describe("admin maintenance actions route", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    getAuthedAdminMock.mockReset();
    isSupabaseConfiguredMock.mockReset();
    listMaintenanceActionsMock.mockReset();

    isSupabaseConfiguredMock.mockReturnValue(true);
    getAuthedAdminMock.mockResolvedValue({
      accessToken: "token",
      user: { id: "user_1" },
      adminRole: "admin",
    });
    listMaintenanceActionsMock.mockResolvedValue([
      { id: "audit_1", action_key: "cleanup_stale_import_runs", dry_run: true },
    ]);
  });

  it("returns 500 when supabase config is missing", async () => {
    isSupabaseConfiguredMock.mockReturnValue(false);

    const response = await GET(new Request("http://localhost:3000/api/admin/data-engine/maintenance/actions"));
    expect(response.status).toBe(500);
  });

  it("returns 403 for non-admin users", async () => {
    getAuthedAdminMock.mockResolvedValue({ accessToken: null, user: null, adminRole: null });

    const response = await GET(new Request("http://localhost:3000/api/admin/data-engine/maintenance/actions"));
    expect(response.status).toBe(403);
  });

  it("returns 400 for invalid category key", async () => {
    const response = await GET(
      new Request("http://localhost:3000/api/admin/data-engine/maintenance/actions?categoryKey=invalid"),
    );

    expect(response.status).toBe(400);
  });

  it("returns maintenance actions with default filters", async () => {
    const response = await GET(new Request("http://localhost:3000/api/admin/data-engine/maintenance/actions"));
    const payload = (await response.json()) as {
      success?: boolean;
      count?: number;
      rows?: Array<{ id: string }>;
      filters?: { limit?: number; sinceHours?: number; dryRun?: boolean | null };
    };

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.count).toBe(1);
    expect(payload.rows?.[0]?.id).toBe("audit_1");
    expect(payload.filters?.limit).toBe(50);
    expect(payload.filters?.sinceHours).toBe(168);
    expect(payload.filters?.dryRun).toBe(null);
  });

  it("applies query filters", async () => {
    const response = await GET(
      new Request(
        "http://localhost:3000/api/admin/data-engine/maintenance/actions?actionKey=cleanup_stale_import_runs&categoryKey=rent_prices&sourceKey=numbeo&dryRun=false&limit=25&sinceHours=72",
      ),
    );

    expect(response.status).toBe(200);
    expect(listMaintenanceActionsMock).toHaveBeenCalledTimes(1);
    const args = listMaintenanceActionsMock.mock.calls[0]?.[1] as {
      actionKey?: string;
      categoryKey?: string;
      sourceKey?: string;
      dryRun?: boolean;
      limit?: number;
      sinceIso?: string;
    };

    expect(args.actionKey).toBe("cleanup_stale_import_runs");
    expect(args.categoryKey).toBe("rent_prices");
    expect(args.sourceKey).toBe("numbeo");
    expect(args.dryRun).toBe(false);
    expect(args.limit).toBe(25);
    expect(typeof args.sinceIso).toBe("string");
  });
});
