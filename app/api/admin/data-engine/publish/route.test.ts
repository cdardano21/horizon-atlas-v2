import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAuthedAdminMock, isSupabaseConfiguredMock, publishApprovedCategoryMock } = vi.hoisted(() => ({
  getAuthedAdminMock: vi.fn(),
  isSupabaseConfiguredMock: vi.fn(),
  publishApprovedCategoryMock: vi.fn(),
}));

vi.mock("../../../../lib/admin-auth", () => ({
  getAuthedAdmin: getAuthedAdminMock,
}));

vi.mock("../../../../lib/supabase", () => ({
  isSupabaseConfigured: isSupabaseConfiguredMock,
}));

vi.mock("../../../../lib/data-engine/publishers", () => ({
  publishApprovedCategory: publishApprovedCategoryMock,
}));

import { POST } from "./route";

describe("admin data-engine publish route", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    getAuthedAdminMock.mockReset();
    isSupabaseConfiguredMock.mockReset();
    publishApprovedCategoryMock.mockReset();

    isSupabaseConfiguredMock.mockReturnValue(true);
    getAuthedAdminMock.mockResolvedValue({
      accessToken: "token",
      user: { id: "user_1" },
      adminRole: "admin",
    });
  });

  it("returns 400 when categoryKey is missing", async () => {
    const response = await POST(
      new Request("http://localhost:3000/api/admin/data-engine/publish", {
        method: "POST",
        body: JSON.stringify({ runId: "run_1" }),
      }),
    );

    expect(response.status).toBe(400);
  });

  it("returns publish result on success", async () => {
    publishApprovedCategoryMock.mockResolvedValue({
      publishRunId: "pub_1",
      publishedDestinations: 3,
      publishedRows: 18,
    });

    const response = await POST(
      new Request("http://localhost:3000/api/admin/data-engine/publish", {
        method: "POST",
        body: JSON.stringify({ categoryKey: "cost_of_living", runId: "run_1" }),
      }),
    );

    const payload = (await response.json()) as {
      success?: boolean;
      result?: { publishRunId?: string; publishedRows?: number };
    };

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.result?.publishRunId).toBe("pub_1");
    expect(payload.result?.publishedRows).toBe(18);
  });
});
