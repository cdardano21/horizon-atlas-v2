import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAuthedAdminMock, isSupabaseConfiguredMock, listPendingStagedRecordsMock, patchReviewStatusMock } = vi.hoisted(() => ({
  getAuthedAdminMock: vi.fn(),
  isSupabaseConfiguredMock: vi.fn(),
  listPendingStagedRecordsMock: vi.fn(),
  patchReviewStatusMock: vi.fn(),
}));

vi.mock("../../../../lib/admin-auth", () => ({
  getAuthedAdmin: getAuthedAdminMock,
}));

vi.mock("../../../../lib/supabase", () => ({
  isSupabaseConfigured: isSupabaseConfiguredMock,
}));

vi.mock("../../../../lib/data-engine/repository", () => ({
  listPendingStagedRecords: listPendingStagedRecordsMock,
  patchReviewStatus: patchReviewStatusMock,
}));

import { GET, PATCH } from "./route";

describe("admin data-engine review route", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    getAuthedAdminMock.mockReset();
    isSupabaseConfiguredMock.mockReset();
    listPendingStagedRecordsMock.mockReset();
    patchReviewStatusMock.mockReset();

    isSupabaseConfiguredMock.mockReturnValue(true);
    getAuthedAdminMock.mockResolvedValue({
      accessToken: "token",
      user: { id: "user_1" },
      adminRole: "admin",
    });
  });

  it("returns review queue rows", async () => {
    listPendingStagedRecordsMock.mockResolvedValue([
      { id: "row_1", review_status: "pending", category_key: "monthly_weather" },
    ]);

    const response = await GET(
      new Request("http://localhost:3000/api/admin/data-engine/review?limit=10&categoryKey=monthly_weather"),
    );

    const payload = (await response.json()) as { count?: number; rows?: Array<{ id: string }> };
    expect(response.status).toBe(200);
    expect(payload.count).toBe(1);
    expect(payload.rows?.[0]?.id).toBe("row_1");
  });

  it("validates PATCH recordIds", async () => {
    const response = await PATCH(
      new Request("http://localhost:3000/api/admin/data-engine/review", {
        method: "PATCH",
        body: JSON.stringify({ recordIds: [], status: "approved" }),
      }),
    );

    expect(response.status).toBe(400);
  });

  it("validates PATCH status", async () => {
    const response = await PATCH(
      new Request("http://localhost:3000/api/admin/data-engine/review", {
        method: "PATCH",
        body: JSON.stringify({ recordIds: ["row_1"], status: "invalid" }),
      }),
    );

    expect(response.status).toBe(400);
  });

  it("updates review status successfully", async () => {
    patchReviewStatusMock.mockResolvedValue(2);

    const response = await PATCH(
      new Request("http://localhost:3000/api/admin/data-engine/review", {
        method: "PATCH",
        body: JSON.stringify({
          recordIds: ["row_1", "row_2"],
          status: "approved",
          notes: "Looks good",
        }),
      }),
    );

    const payload = (await response.json()) as { success?: boolean; updated?: number };
    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.updated).toBe(2);
  });
});
