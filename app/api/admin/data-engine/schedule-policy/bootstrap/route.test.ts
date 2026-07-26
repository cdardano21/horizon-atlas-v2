import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getAuthedAdminMock,
  isSupabaseConfiguredMock,
  listSchedulePoliciesMock,
  bulkUpsertSchedulePoliciesMock,
} = vi.hoisted(() => ({
  getAuthedAdminMock: vi.fn(),
  isSupabaseConfiguredMock: vi.fn(),
  listSchedulePoliciesMock: vi.fn(),
  bulkUpsertSchedulePoliciesMock: vi.fn(),
}));

vi.mock("../../../../../lib/admin-auth", () => ({
  getAuthedAdmin: getAuthedAdminMock,
}));

vi.mock("../../../../../lib/supabase", () => ({
  isSupabaseConfigured: isSupabaseConfiguredMock,
}));

vi.mock("../../../../../lib/data-engine/repository", () => ({
  listSchedulePolicies: listSchedulePoliciesMock,
  bulkUpsertSchedulePolicies: bulkUpsertSchedulePoliciesMock,
}));

import { POST } from "./route";

describe("admin data-engine schedule-policy bootstrap route", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    getAuthedAdminMock.mockReset();
    isSupabaseConfiguredMock.mockReset();
    listSchedulePoliciesMock.mockReset();
    bulkUpsertSchedulePoliciesMock.mockReset();

    isSupabaseConfiguredMock.mockReturnValue(true);
    getAuthedAdminMock.mockResolvedValue({
      accessToken: "token",
      user: { id: "user_1" },
      adminRole: "admin",
    });

    listSchedulePoliciesMock.mockResolvedValue([]);
    bulkUpsertSchedulePoliciesMock.mockImplementation(async (_token, rows) =>
      rows.map((row: { categoryKey: string }) => ({ category_key: row.categoryKey })),
    );
  });

  it("returns 403 for non-admin users", async () => {
    getAuthedAdminMock.mockResolvedValue({ accessToken: null, user: null, adminRole: null });

    const response = await POST(
      new Request("http://localhost:3000/api/admin/data-engine/schedule-policy/bootstrap", {
        method: "POST",
        body: JSON.stringify({ overwrite: false }),
      }),
    );

    expect(response.status).toBe(403);
  });

  it("seeds only missing categories when overwrite is false", async () => {
    listSchedulePoliciesMock.mockResolvedValue([{ category_key: "monthly_weather" }]);

    const response = await POST(
      new Request("http://localhost:3000/api/admin/data-engine/schedule-policy/bootstrap", {
        method: "POST",
        body: JSON.stringify({ overwrite: false }),
      }),
    );

    const payload = (await response.json()) as {
      success?: boolean;
      overwrite?: boolean;
      categoryCount?: number;
      seededCount?: number;
      skippedCount?: number;
    };

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.overwrite).toBe(false);
    expect(payload.categoryCount).toBeGreaterThan(1);
    expect(payload.skippedCount).toBe(1);
    expect(payload.seededCount).toBe((payload.categoryCount ?? 0) - 1);
  });

  it("seeds all categories when overwrite is true", async () => {
    listSchedulePoliciesMock.mockResolvedValue([{ category_key: "monthly_weather" }]);

    const response = await POST(
      new Request("http://localhost:3000/api/admin/data-engine/schedule-policy/bootstrap", {
        method: "POST",
        body: JSON.stringify({ overwrite: true }),
      }),
    );

    const payload = (await response.json()) as { overwrite?: boolean; categoryCount?: number; seededCount?: number };

    expect(response.status).toBe(200);
    expect(payload.overwrite).toBe(true);
    expect(payload.seededCount).toBe(payload.categoryCount);

    const calls = bulkUpsertSchedulePoliciesMock.mock.calls;
    const rows = calls.at(-1)?.[1] as Array<{ staleAfterHours?: number }> | undefined;
    expect(rows && rows.length > 0).toBe(true);
    expect(rows?.every((row) => row.staleAfterHours === 6)).toBe(true);
  });
});
