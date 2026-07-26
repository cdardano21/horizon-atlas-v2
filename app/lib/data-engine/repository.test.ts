import { beforeEach, describe, expect, it, vi } from "vitest";

const { getSupabaseConfigMock } = vi.hoisted(() => ({
  getSupabaseConfigMock: vi.fn(),
}));

vi.mock("../supabase", () => ({
  getSupabaseConfig: getSupabaseConfigMock,
}));

import { failStaleRunningImportRuns, replaceDatasetRowsByCategory } from "./repository";

describe("data-engine repository stale run recovery", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    getSupabaseConfigMock.mockReset();

    getSupabaseConfigMock.mockReturnValue({
      url: "https://example.supabase.co",
      anonKey: "anon_key",
    });
  });

  it("returns 0 when there are no stale running rows", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify([]), { status: 200 }),
    );

    const count = await failStaleRunningImportRuns("token", {
      categoryKey: "monthly_weather",
      sourceKey: "openmeteo",
      staleBeforeIso: "2026-07-24T00:00:00.000Z",
    });

    expect(count).toBe(0);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("marks stale running rows as failed", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify([{ id: "run_1" }, { id: "run_2" }]), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify([{ id: "run_1" }, { id: "run_2" }]), { status: 200 }),
      );

    const count = await failStaleRunningImportRuns("token", {
      categoryKey: "rent_prices",
      sourceKey: "numbeo",
      staleBeforeIso: "2026-07-24T00:00:00.000Z",
      errorMessage: "stale",
    });

    expect(count).toBe(2);
    expect(fetch).toHaveBeenCalledTimes(2);

    const secondCall = vi.mocked(fetch).mock.calls[1];
    expect(String(secondCall?.[0])).toContain("id=in.(run_1,run_2)");
    expect((secondCall?.[1] as RequestInit | undefined)?.method).toBe("PATCH");
  });
});

describe("data-engine repository category-scoped replacement", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    getSupabaseConfigMock.mockReset();

    getSupabaseConfigMock.mockReturnValue({
      url: "https://example.supabase.co",
      anonKey: "anon_key",
    });
  });

  it("deletes only the targeted destination/category slice", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(new Response(null, { status: 204 }));

    await replaceDatasetRowsByCategory(
      "token",
      "dest_1",
      "destination_resources",
      "youtube",
      [],
    );

    expect(fetch).toHaveBeenCalledTimes(1);
    const firstCall = vi.mocked(fetch).mock.calls[0];
    expect(String(firstCall?.[0])).toContain(
      "/rest/v1/destination_resources?destination_id=eq.dest_1&category=eq.youtube",
    );
    expect((firstCall?.[1] as RequestInit | undefined)?.method).toBe("DELETE");
  });

  it("inserts new rows after scoped delete", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(null, { status: 201 }));

    await replaceDatasetRowsByCategory(
      "token",
      "dest_1",
      "destination_resources",
      "visa",
      [
        {
          destination_id: "dest_1",
          category: "visa",
          title: "Spain Consular Process",
          url: "https://example.com/visa",
        },
      ],
    );

    expect(fetch).toHaveBeenCalledTimes(2);

    const secondCall = vi.mocked(fetch).mock.calls[1];
    expect(String(secondCall?.[0])).toContain("/rest/v1/destination_resources");
    expect((secondCall?.[1] as RequestInit | undefined)?.method).toBe("POST");
  });
});
