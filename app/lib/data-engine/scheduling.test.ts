import { beforeEach, describe, expect, it, vi } from "vitest";

const { getLatestImportRunMock, getSchedulePolicyMock, executeImportRunMock } = vi.hoisted(() => ({
  getLatestImportRunMock: vi.fn(),
  getSchedulePolicyMock: vi.fn(),
  executeImportRunMock: vi.fn(),
}));

vi.mock("./repository", () => ({
  getLatestImportRun: getLatestImportRunMock,
  getSchedulePolicy: getSchedulePolicyMock,
}));

vi.mock("./orchestrator", () => ({
  executeImportRun: executeImportRunMock,
}));

import { executeScheduledImport } from "./scheduling";

describe("data-engine scheduling", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-24T12:00:00.000Z"));

    getLatestImportRunMock.mockReset();
    getSchedulePolicyMock.mockReset();
    executeImportRunMock.mockReset();

    getLatestImportRunMock.mockResolvedValue(null);
    getSchedulePolicyMock.mockResolvedValue(null);
    executeImportRunMock.mockResolvedValue({
      runId: "run_1",
      categoryKey: "monthly_weather",
      sourceKey: "openmeteo",
      destinationCount: 3,
      rawCount: 36,
      normalizedCount: 36,
      dedupedCount: 36,
      rejectedCount: 0,
      startedAt: "2026-07-24T12:00:00.000Z",
      finishedAt: "2026-07-24T12:01:00.000Z",
    });
  });

  it("skips when policy is disabled", async () => {
    getSchedulePolicyMock.mockResolvedValue({
      category_key: "monthly_weather",
      is_enabled: false,
      source_key: null,
      min_interval_hours: null,
      max_destinations_per_run: null,
    });

    const result = await executeScheduledImport({
      accessToken: "token",
      userId: "user_1",
      categoryKey: "monthly_weather",
    });

    expect(result.skipped).toBe(true);
    expect(result.reason).toContain("disabled");
    expect(executeImportRunMock).not.toHaveBeenCalled();
  });

  it("uses persisted policy source and destination cap", async () => {
    getSchedulePolicyMock.mockResolvedValue({
      category_key: "monthly_weather",
      is_enabled: true,
      source_key: "openmeteo",
      min_interval_hours: 24,
      max_destinations_per_run: 2,
    });

    await executeScheduledImport({
      accessToken: "token",
      userId: "user_1",
      categoryKey: "monthly_weather",
      destinationSlugs: ["a", "b", "c"],
    });

    expect(executeImportRunMock).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceKey: "openmeteo",
        destinationSlugs: ["a", "b"],
        triggerType: "scheduled",
      }),
    );
  });

  it("skips when cadence is not due", async () => {
    getSchedulePolicyMock.mockResolvedValue({
      category_key: "rent_prices",
      is_enabled: true,
      source_key: "numbeo",
      min_interval_hours: 168,
      max_destinations_per_run: 50,
    });

    getLatestImportRunMock.mockResolvedValue({
      id: "old_1",
      category_key: "rent_prices",
      source_key: "numbeo",
      trigger_type: "scheduled",
      status: "completed",
      started_at: "2026-07-24T08:00:00.000Z",
      finished_at: "2026-07-24T09:00:00.000Z",
      destination_count: 20,
    });

    const result = await executeScheduledImport({
      accessToken: "token",
      userId: "user_1",
      categoryKey: "rent_prices",
    });

    expect(result.skipped).toBe(true);
    expect(result.reason).toContain("not yet due");
    expect(executeImportRunMock).not.toHaveBeenCalled();
  });

  it("runs when force is true even if cadence is not due", async () => {
    getSchedulePolicyMock.mockResolvedValue({
      category_key: "rent_prices",
      is_enabled: true,
      source_key: "numbeo",
      min_interval_hours: 168,
      max_destinations_per_run: 50,
    });

    getLatestImportRunMock.mockResolvedValue({
      id: "old_1",
      category_key: "rent_prices",
      source_key: "numbeo",
      trigger_type: "scheduled",
      status: "completed",
      started_at: "2026-07-24T10:00:00.000Z",
      finished_at: "2026-07-24T11:00:00.000Z",
      destination_count: 20,
    });

    const result = await executeScheduledImport({
      accessToken: "token",
      userId: "user_1",
      categoryKey: "rent_prices",
      force: true,
      destinationSlugs: ["x", "y", "z"],
      maxDestinations: 1,
    });

    expect(result.skipped).toBe(false);
    expect(executeImportRunMock).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceKey: "numbeo",
        destinationSlugs: ["x"],
      }),
    );
  });
});
