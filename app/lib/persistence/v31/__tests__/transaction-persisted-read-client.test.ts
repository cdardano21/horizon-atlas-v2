import { describe, expect, it, vi } from "vitest";
import { createTransactionPersistedReadClient } from "../transaction-persisted-read-client";

const queryArgs = { table: "premium_healthcare_insurance", select: "destination_id,verified_at", filters: [{ column: "destination_id", operator: "eq", value: "approved-id" }] };

describe("transaction-scoped persisted read client", () => {
  it("uses the supplied connection and retains JSON date and numeric representations", async () => {
    const data = { destination_id: "approved-id", verified_at: "2026-09-05", value: 42 };
    const query = vi.fn().mockResolvedValue({ rows: [{ data }], rowCount: 1 });
    expect(await createTransactionPersistedReadClient({ query }).selectRows(queryArgs)).toEqual([data]);
    expect(query).toHaveBeenCalledWith('select to_jsonb(selected) as data from (select "destination_id", "verified_at" from public."premium_healthcare_insurance" where "destination_id" = $1) selected', ["approved-id"]);
  });
  it("serializes concurrent calls on one transaction connection", async () => {
    let active = 0;
    let maximum = 0;
    const query = vi.fn(async () => {
      active += 1;
      maximum = Math.max(maximum, active);
      await Promise.resolve();
      active -= 1;
      return { rows: [], rowCount: 0 };
    });
    const client = createTransactionPersistedReadClient({ query });
    await Promise.all([client.selectRows(queryArgs), client.selectRows(queryArgs)]);
    expect(maximum).toBe(1);
  });
  it.each([
    { ...queryArgs, table: "audit" },
    { ...queryArgs, select: "destination_id; delete" },
    { ...queryArgs, filters: [] },
    { ...queryArgs, filters: [{ column: "destination_key", operator: "eq", value: "key" }] },
    { ...queryArgs, filters: [{ column: "destination_id", operator: "neq", value: "id" }] },
  ])("rejects non-scoped or unsafe reads before querying", async (args) => {
    const query = vi.fn();
    await expect(createTransactionPersistedReadClient({ query }).selectRows(args)).rejects.toThrow();
    expect(query).not.toHaveBeenCalled();
  });
});