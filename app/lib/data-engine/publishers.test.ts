import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createPublishRunMock,
  finalizePublishRunMock,
  insertErrorLogMock,
  listApprovedForPublishMock,
  replaceDatasetRowsMock,
  replaceDatasetRowsByCategoryMock,
} = vi.hoisted(() => ({
  createPublishRunMock: vi.fn(),
  finalizePublishRunMock: vi.fn(),
  insertErrorLogMock: vi.fn(),
  listApprovedForPublishMock: vi.fn(),
  replaceDatasetRowsMock: vi.fn(),
  replaceDatasetRowsByCategoryMock: vi.fn(),
}));

vi.mock("./repository", () => ({
  createPublishRun: createPublishRunMock,
  finalizePublishRun: finalizePublishRunMock,
  insertErrorLog: insertErrorLogMock,
  listApprovedForPublish: listApprovedForPublishMock,
  replaceDatasetRows: replaceDatasetRowsMock,
  replaceDatasetRowsByCategory: replaceDatasetRowsByCategoryMock,
}));

import { publishApprovedCategory } from "./publishers";

describe("data-engine publishers", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    createPublishRunMock.mockReset();
    finalizePublishRunMock.mockReset();
    insertErrorLogMock.mockReset();
    listApprovedForPublishMock.mockReset();
    replaceDatasetRowsMock.mockReset();
    replaceDatasetRowsByCategoryMock.mockReset();

    createPublishRunMock.mockResolvedValue("publish_run_1");
    finalizePublishRunMock.mockResolvedValue(undefined);
    insertErrorLogMock.mockResolvedValue(undefined);
    replaceDatasetRowsMock.mockResolvedValue(undefined);
    replaceDatasetRowsByCategoryMock.mockResolvedValue(undefined);
  });

  it("publishes food categories into restaurants_or_food_metrics", async () => {
    listApprovedForPublishMock.mockResolvedValue([
      {
        id: "staged_1",
        destination_id: "dest_1",
        destination_slug: "valencia-spain",
        category_key: "restaurants",
        source_key: "osm",
        source_record_id: "r_1",
        observed_at: "2026-07-25T00:00:00.000Z",
        confidence_level: "medium",
        payload: {
          metric_key: "michelin_density",
          metric_label: "Michelin density",
          value_numeric: 4,
          unit: "count",
        },
      },
    ]);

    const result = await publishApprovedCategory({
      accessToken: "token",
      userId: "user_1",
      categoryKey: "restaurants",
    });

    expect(result.publishedRows).toBe(1);
    expect(replaceDatasetRowsMock).toHaveBeenCalledTimes(1);

    const call = replaceDatasetRowsMock.mock.calls[0];
    expect(call?.[2]).toBe("restaurants_or_food_metrics");
    const insertedRows = call?.[3] as Array<Record<string, unknown>>;
    expect(insertedRows[0]?.metric_key).toBe("michelin_density");
    expect(insertedRows[0]?.metric_label).toBe("Michelin density");

    expect(replaceDatasetRowsByCategoryMock).not.toHaveBeenCalled();
  });

  it("publishes practical categories into destination_resources with scoped category replacement", async () => {
    listApprovedForPublishMock.mockResolvedValue([
      {
        id: "staged_2",
        destination_id: "dest_1",
        destination_slug: "valencia-spain",
        category_key: "youtube_links",
        source_key: "youtube",
        source_record_id: "yt_1",
        observed_at: "2026-07-25T00:00:00.000Z",
        confidence_level: "high",
        payload: {
          title: "Valencia neighborhood guide",
          url: "https://youtube.com/watch?v=abc",
          description: "Walkthrough of top districts",
        },
      },
    ]);

    const result = await publishApprovedCategory({
      accessToken: "token",
      userId: "user_1",
      categoryKey: "youtube_links",
    });

    expect(result.publishedRows).toBe(1);
    expect(replaceDatasetRowsByCategoryMock).toHaveBeenCalledTimes(1);

    const call = replaceDatasetRowsByCategoryMock.mock.calls[0];
    expect(call?.[2]).toBe("destination_resources");
    expect(call?.[3]).toBe("youtube");

    const insertedRows = call?.[4] as Array<Record<string, unknown>>;
    expect(insertedRows[0]?.category).toBe("youtube");
    expect(insertedRows[0]?.title).toBe("Valencia neighborhood guide");
    expect(insertedRows[0]?.url).toBe("https://youtube.com/watch?v=abc");

    expect(replaceDatasetRowsMock).not.toHaveBeenCalled();
  });

  it("maps google_maps_links to destination_resources category maps", async () => {
    listApprovedForPublishMock.mockResolvedValue([
      {
        id: "staged_3",
        destination_id: "dest_1",
        destination_slug: "valencia-spain",
        category_key: "google_maps_links",
        source_key: "maps",
        source_record_id: "maps_1",
        observed_at: "2026-07-25T00:00:00.000Z",
        confidence_level: "high",
        payload: {
          title: "Metro and district map",
          url: "https://maps.google.com/?q=valencia",
          description: "Primary orientation map",
        },
      },
    ]);

    const result = await publishApprovedCategory({
      accessToken: "token",
      userId: "user_1",
      categoryKey: "google_maps_links",
    });

    expect(result.publishedRows).toBe(1);
    expect(replaceDatasetRowsByCategoryMock).toHaveBeenCalledTimes(1);

    const call = replaceDatasetRowsByCategoryMock.mock.calls[0];
    expect(call?.[2]).toBe("destination_resources");
    expect(call?.[3]).toBe("maps");

    const insertedRows = call?.[4] as Array<Record<string, unknown>>;
    expect(insertedRows[0]?.category).toBe("maps");
    expect(insertedRows[0]?.title).toBe("Metro and district map");
  });
});
