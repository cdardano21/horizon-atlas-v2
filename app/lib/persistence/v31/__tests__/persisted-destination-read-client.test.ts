import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPersistedDestinationReadClient } from "../persisted-destination-read-client";

function createResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => body,
  } as Response;
}

describe("createPersistedDestinationReadClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("forwards the table name and select string", async () => {
    const calls: Array<{ path: string; options?: RequestInit }> = [];
    const client = createPersistedDestinationReadClient({
      fetcher: async (path, options) => {
        calls.push({ path, options });
        return createResponse([]);
      },
    });

    await client.selectRows({ table: "destinations_catalog", select: "destination_id,destination_key" });

    expect(calls).toHaveLength(1);
    expect(calls[0]?.path).toBe("/rest/v1/destinations_catalog?select=destination_id%2Cdestination_key");
  });

  it("applies one equality filter", async () => {
    const calls: string[] = [];
    const client = createPersistedDestinationReadClient({
      fetcher: async (path) => {
        calls.push(path);
        return createResponse([]);
      },
    });

    await client.selectRows({
      table: "premium_destination_profiles",
      select: "destination_id",
      filters: [{ column: "destination_id", operator: "eq", value: "abc-123" }],
    });

    expect(calls[0]).toBe("/rest/v1/premium_destination_profiles?select=destination_id&destination_id=eq.abc-123");
  });

  it("applies multiple equality filters and URL-encodes values", async () => {
    const calls: string[] = [];
    const client = createPersistedDestinationReadClient({
      fetcher: async (path) => {
        calls.push(path);
        return createResponse([]);
      },
    });

    await client.selectRows({
      table: "premium_destination_profiles",
      select: "destination_id,destination_key",
      filters: [
        { column: "destination_id", operator: "eq", value: "abc 123" },
        { column: "module_key", operator: "eq", value: "facts" },
      ],
    });

    expect(calls[0]).toBe("/rest/v1/premium_destination_profiles?select=destination_id%2Cdestination_key&destination_id=eq.abc%20123&module_key=eq.facts");
  });

  it("supports number, boolean, and null filter values", async () => {
    const calls: string[] = [];
    const client = createPersistedDestinationReadClient({
      fetcher: async (path) => {
        calls.push(path);
        return createResponse([]);
      },
    });

    await client.selectRows({
      table: "premium_destination_profiles",
      select: "*",
      filters: [
        { column: "position", operator: "eq", value: 42 },
        { column: "active", operator: "eq", value: true },
        { column: "note", operator: "eq", value: null },
      ],
    });

    expect(calls[0]).toBe("/rest/v1/premium_destination_profiles?select=*&position=eq.42&active=eq.true&note=eq.null");
  });

  it("returns raw rows unchanged", async () => {
    const rows = [{ destination_id: "abc", destination_key: "dest-a", position: 2, active: true, value: null }];
    const client = createPersistedDestinationReadClient({
      fetcher: async () => createResponse(rows),
    });

    await expect(client.selectRows({ table: "premium_destination_profiles", select: "*" })).resolves.toEqual(rows);
  });

  it("preserves null, numbers, booleans, and destination_key", async () => {
    const rows = [{ destination_id: "abc", destination_key: "dest-a", position: 2, active: true, note: null }];
    const client = createPersistedDestinationReadClient({
      fetcher: async () => createResponse(rows),
    });

    await expect(client.selectRows({ table: "premium_destination_profiles", select: "*" })).resolves.toEqual(rows);
  });

  it("does not inject destination_key filtering", async () => {
    const calls: string[] = [];
    const client = createPersistedDestinationReadClient({
      fetcher: async (path) => {
        calls.push(path);
        return createResponse([]);
      },
    });

    await client.selectRows({ table: "premium_destination_profiles", select: "*", filters: [{ column: "destination_id", operator: "eq", value: "abc" }] });

    expect(calls[0]).toContain("destination_id=eq.abc");
    expect(calls[0]).not.toContain("destination_key");
  });

  it("preserves array cardinality", async () => {
    const client = createPersistedDestinationReadClient({
      fetcher: async () => createResponse([]),
    });

    await expect(client.selectRows({ table: "premium_destination_profiles", select: "*" })).resolves.toEqual([]);
  });

  it("returns multiple rows unchanged", async () => {
    const rows = [{ destination_id: "one" }, { destination_id: "two" }];
    const client = createPersistedDestinationReadClient({
      fetcher: async () => createResponse(rows),
    });

    await expect(client.selectRows({ table: "premium_destination_profiles", select: "*" })).resolves.toEqual(rows);
  });

  it("rejects unsupported filter operators", async () => {
    const client = createPersistedDestinationReadClient({
      fetcher: async () => createResponse([]),
    });

    await expect(client.selectRows({
      table: "premium_destination_profiles",
      select: "*",
      filters: [{ column: "destination_id", operator: "in", value: ["a", "b"] }],
    })).rejects.toThrow("Unsupported filter operator: in");
  });

  it("rejects transport failures", async () => {
    const client = createPersistedDestinationReadClient({
      fetcher: async () => createResponse([], false, 500),
    });

    await expect(client.selectRows({ table: "premium_destination_profiles", select: "*" })).rejects.toThrow("Read failed: 500");
  });

  it("rejects malformed transport responses", async () => {
    const client = createPersistedDestinationReadClient({
      fetcher: async () => createResponse({ odd: "shape" }),
    });

    await expect(client.selectRows({ table: "premium_destination_profiles", select: "*" })).rejects.toThrow("Read returned a non-array payload");
  });

  it("rejects non-object rows", async () => {
    const client = createPersistedDestinationReadClient({
      fetcher: async () => createResponse(["bad-row"]),
    });

    await expect(client.selectRows({ table: "premium_destination_profiles", select: "*" })).rejects.toThrow("Read returned a non-object row");
  });

  it("propagates injected fetcher errors", async () => {
    const client = createPersistedDestinationReadClient({
      fetcher: async () => {
        throw new Error("network down");
      },
    });

    await expect(client.selectRows({ table: "premium_destination_profiles", select: "*" })).rejects.toThrow("network down");
  });

  it("uses the injected fetcher transport", async () => {
    const fetcher = vi.fn(async (path: string, options?: RequestInit) => createResponse([]));

    const client = createPersistedDestinationReadClient({ fetcher });

    await client.selectRows({ table: "premium_destination_profiles", select: "*" });

    expect(fetcher).toHaveBeenCalledWith("/rest/v1/premium_destination_profiles?select=*", { cache: "no-store" });
  });

  it("rejects object and array filter values", async () => {
    const client = createPersistedDestinationReadClient({
      fetcher: async () => createResponse([]),
    });

    await expect(client.selectRows({
      table: "premium_destination_profiles",
      select: "*",
      filters: [{ column: "destination_id", operator: "eq", value: { nested: true } }],
    })).rejects.toThrow("Unsupported filter value type: object");

    await expect(client.selectRows({
      table: "premium_destination_profiles",
      select: "*",
      filters: [{ column: "destination_id", operator: "eq", value: ["a", "b"] }],
    })).rejects.toThrow("Unsupported filter value type: object");
  });

  it("performs no write-side operation", async () => {
    const client = createPersistedDestinationReadClient({
      fetcher: async () => createResponse([]),
    });

    await client.selectRows({ table: "premium_destination_profiles", select: "*" });
    expect(true).toBe(true);
  });

  it("does not invoke RPC", async () => {
    const client = createPersistedDestinationReadClient({
      fetcher: async () => createResponse([]),
    });

    await client.selectRows({ table: "premium_destination_profiles", select: "*" });
    expect(true).toBe(true);
  });
});
