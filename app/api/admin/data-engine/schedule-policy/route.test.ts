import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getAuthedAdminMock,
  isSupabaseConfiguredMock,
  listSchedulePoliciesMock,
  upsertSchedulePolicyMock,
} = vi.hoisted(() => ({
  getAuthedAdminMock: vi.fn(),
  isSupabaseConfiguredMock: vi.fn(),
  listSchedulePoliciesMock: vi.fn(),
  upsertSchedulePolicyMock: vi.fn(),
}));

vi.mock("../../../../lib/admin-auth", () => ({
  getAuthedAdmin: getAuthedAdminMock,
}));

vi.mock("../../../../lib/supabase", () => ({
  isSupabaseConfigured: isSupabaseConfiguredMock,
}));

vi.mock("../../../../lib/data-engine/repository", () => ({
  listSchedulePolicies: listSchedulePoliciesMock,
  upsertSchedulePolicy: upsertSchedulePolicyMock,
}));

import { GET, PATCH } from "./route";

describe("admin data-engine schedule-policy route", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    getAuthedAdminMock.mockReset();
    isSupabaseConfiguredMock.mockReset();
    listSchedulePoliciesMock.mockReset();
    upsertSchedulePolicyMock.mockReset();

    isSupabaseConfiguredMock.mockReturnValue(true);
    getAuthedAdminMock.mockResolvedValue({
      accessToken: "token",
      user: { id: "user_1" },
      adminRole: "admin",
    });
  });

  it("lists schedule policies", async () => {
    listSchedulePoliciesMock.mockResolvedValue([
      { category_key: "monthly_weather", is_enabled: true },
      { category_key: "rent_prices", is_enabled: true },
    ]);

    const response = await GET(new Request("http://localhost:3000/api/admin/data-engine/schedule-policy"));
    const payload = (await response.json()) as { count?: number };

    expect(response.status).toBe(200);
    expect(payload.count).toBe(2);
  });

  it("filters schedule policies by category", async () => {
    listSchedulePoliciesMock.mockResolvedValue([
      { category_key: "monthly_weather", is_enabled: true },
      { category_key: "rent_prices", is_enabled: true },
    ]);

    const response = await GET(
      new Request("http://localhost:3000/api/admin/data-engine/schedule-policy?categoryKey=rent_prices"),
    );
    const payload = (await response.json()) as { rows?: Array<{ category_key: string }> };

    expect(response.status).toBe(200);
    expect(payload.rows?.length).toBe(1);
    expect(payload.rows?.[0]?.category_key).toBe("rent_prices");
  });

  it("rejects invalid category on patch", async () => {
    const response = await PATCH(
      new Request("http://localhost:3000/api/admin/data-engine/schedule-policy", {
        method: "PATCH",
        body: JSON.stringify({ categoryKey: "not_real" }),
      }),
    );

    expect(response.status).toBe(400);
  });

  it("rejects invalid numeric limits", async () => {
    const response = await PATCH(
      new Request("http://localhost:3000/api/admin/data-engine/schedule-policy", {
        method: "PATCH",
        body: JSON.stringify({ categoryKey: "monthly_weather", minIntervalHours: 0 }),
      }),
    );

    expect(response.status).toBe(400);
  });

  it("rejects invalid staleAfterHours", async () => {
    const response = await PATCH(
      new Request("http://localhost:3000/api/admin/data-engine/schedule-policy", {
        method: "PATCH",
        body: JSON.stringify({ categoryKey: "monthly_weather", staleAfterHours: 0 }),
      }),
    );

    expect(response.status).toBe(400);
  });

  it("upserts policy", async () => {
    upsertSchedulePolicyMock.mockResolvedValue({
      category_key: "monthly_weather",
      is_enabled: false,
      min_interval_hours: 48,
      max_destinations_per_run: 20,
      stale_after_hours: 12,
      source_key: "openmeteo",
      notes: "Temporary freeze",
    });

    const response = await PATCH(
      new Request("http://localhost:3000/api/admin/data-engine/schedule-policy", {
        method: "PATCH",
        body: JSON.stringify({
          categoryKey: "monthly_weather",
          isEnabled: false,
          minIntervalHours: 48,
          maxDestinationsPerRun: 20,
          staleAfterHours: 12,
          sourceKey: "openmeteo",
          notes: "Temporary freeze",
        }),
      }),
    );

    const payload = (await response.json()) as { success?: boolean; row?: { is_enabled?: boolean } };
    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.row?.is_enabled).toBe(false);
  });
});
