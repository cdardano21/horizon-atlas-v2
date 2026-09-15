import { describe, expect, it } from "vitest";
import { AmbiguousLogicalIdentityError, diffKeyedChildren } from "../diff-keyed-children";

interface PlaceFixture { place_key: string; category_key: string; place_name: string; }

const diff = (current: PlaceFixture[], incoming: PlaceFixture[]) => diffKeyedChildren({
  module: "places",
  currentChildren: current,
  incomingChildren: incoming,
  getStableKey: (row) => row.place_key,
  getLogicalIdentity: (row) => `${String(row.category_key).trim().toLowerCase()}|${String(row.place_name).normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()}`,
});

describe("logical keyed-child reconciliation", () => {
  it("reconciles an exact or normalized same-place identity when stable keys differ", () => {
    const result = diff([{ place_key: "legacy-1", category_key: "food", place_name: "  Bluefin Cafe " }], [{ place_key: "new-1", category_key: "FOOD", place_name: "Bluefin Café" }]);
    expect(result).toHaveLength(1);
    expect(result[0]?.kind).toBe("UPDATE_CHILD");
    expect(result[0]?.stableChildKey).toBe("legacy-1");
  });
  it("preserves legitimate similar-but-distinct records", () => {
    const result = diff([{ place_key: "legacy-1", category_key: "food", place_name: "Bluefin" }], [{ place_key: "new-1", category_key: "food", place_name: "Bluefin Market" }]);
    expect(result.some((operation) => operation.kind === "CREATE_CHILD")).toBe(true);
  });
  it("blocks an ambiguous logical collision instead of deleting legacy rows", () => {
    expect(() => diff([
      { place_key: "legacy-1", category_key: "food", place_name: "Bluefin" },
      { place_key: "legacy-2", category_key: "food", place_name: "Bluefin" },
    ], [{ place_key: "new-1", category_key: "food", place_name: "Bluefin" }])).toThrow(AmbiguousLogicalIdentityError);
  });
});
