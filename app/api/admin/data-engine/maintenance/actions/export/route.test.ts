import { beforeEach, describe, expect, it, vi } from "vitest";
import { gunzipSync } from "node:zlib";

const {
  getAuthedAdminMock,
  isSupabaseConfiguredMock,
  listMaintenanceActionsMock,
} = vi.hoisted(() => ({
  getAuthedAdminMock: vi.fn(),
  isSupabaseConfiguredMock: vi.fn(),
  listMaintenanceActionsMock: vi.fn(),
}));

vi.mock("../../../../../../lib/admin-auth", () => ({
  getAuthedAdmin: getAuthedAdminMock,
}));

vi.mock("../../../../../../lib/supabase", () => ({
  isSupabaseConfigured: isSupabaseConfiguredMock,
}));

vi.mock("../../../../../../lib/data-engine/repository", () => ({
  listMaintenanceActions: listMaintenanceActionsMock,
}));

import { GET } from "./route";

describe("admin maintenance actions export route", () => {
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
      {
        id: "audit_1",
        action_key: "cleanup_stale_import_runs",
        initiated_by: "user_1",
        category_key: "rent_prices",
        source_key: "numbeo",
        dry_run: false,
        stale_after_hours: 8,
        stale_before_iso: "2026-07-24T00:00:00.000Z",
        stale_match_count: 2,
        affected_count: 2,
        notes: "Applied",
        details: { region: "eu" },
        created_at: "2026-07-24T01:00:00.000Z",
      },
    ]);
  });

  it("returns 500 when supabase config is missing", async () => {
    isSupabaseConfiguredMock.mockReturnValue(false);

    const response = await GET(
      new Request("http://localhost:3000/api/admin/data-engine/maintenance/actions/export"),
    );
    expect(response.status).toBe(500);
  });

  it("returns 403 for non-admin users", async () => {
    getAuthedAdminMock.mockResolvedValue({ accessToken: null, user: null, adminRole: null });

    const response = await GET(
      new Request("http://localhost:3000/api/admin/data-engine/maintenance/actions/export"),
    );
    expect(response.status).toBe(403);
  });

  it("returns 400 for invalid category key", async () => {
    const response = await GET(
      new Request(
        "http://localhost:3000/api/admin/data-engine/maintenance/actions/export?categoryKey=invalid",
      ),
    );
    expect(response.status).toBe(400);
  });

  it("exports maintenance actions as csv", async () => {
    const response = await GET(
      new Request(
        "http://localhost:3000/api/admin/data-engine/maintenance/actions/export?actionKey=cleanup_stale_import_runs&categoryKey=rent_prices&sourceKey=numbeo&dryRun=false&limit=25&sinceHours=72",
      ),
    );

    const csv = await response.text();
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/csv");
    expect(response.headers.get("Content-Disposition")).toContain("attachment; filename=");
    expect(csv).toContain("action_key");
    expect(csv).toContain("cleanup_stale_import_runs");
    expect(csv).toContain("rent_prices");

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

  it("exports maintenance actions as gzipped csv when requested", async () => {
    const response = await GET(
      new Request(
        "http://localhost:3000/api/admin/data-engine/maintenance/actions/export?gzip=true",
      ),
    );

    const bytes = new Uint8Array(await response.arrayBuffer());
    const csv = gunzipSync(Buffer.from(bytes)).toString("utf-8");

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Encoding")).toBe("gzip");
    expect(response.headers.get("X-Export-Compression")).toBe("forced-gzip");
    expect(response.headers.get("Content-Disposition")).toContain(".csv.gz");
    expect(csv).toContain("action_key");
    expect(csv).toContain("cleanup_stale_import_runs");
  });

  it("uses auto gzip when threshold is exceeded", async () => {
    listMaintenanceActionsMock.mockResolvedValue(
      Array.from({ length: 20 }, (_, index) => ({
        id: `audit_${index}`,
        action_key: "cleanup_stale_import_runs",
        initiated_by: "user_1",
        category_key: "rent_prices",
        source_key: "numbeo",
        dry_run: false,
        stale_after_hours: 8,
        stale_before_iso: "2026-07-24T00:00:00.000Z",
        stale_match_count: 2,
        affected_count: 2,
        notes: "Applied",
        details: { payload: "x".repeat(200) },
        created_at: "2026-07-24T01:00:00.000Z",
      })),
    );

    const response = await GET(
      new Request(
        "http://localhost:3000/api/admin/data-engine/maintenance/actions/export?gzip=auto&gzipThresholdBytes=200",
      ),
    );

    const bytes = new Uint8Array(await response.arrayBuffer());
    const csv = gunzipSync(Buffer.from(bytes)).toString("utf-8");

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Encoding")).toBe("gzip");
    expect(response.headers.get("X-Export-Compression")).toBe("auto-gzip");
    expect(csv).toContain("cleanup_stale_import_runs");
  });

  it("keeps plain csv in auto mode when under threshold", async () => {
    const response = await GET(
      new Request(
        "http://localhost:3000/api/admin/data-engine/maintenance/actions/export?gzip=auto&gzipThresholdBytes=1000000",
      ),
    );

    const csv = await response.text();
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Encoding")).toBeNull();
    expect(response.headers.get("X-Export-Compression")).toBe("auto-none");
    expect(csv).toContain("action_key");
  });
});
