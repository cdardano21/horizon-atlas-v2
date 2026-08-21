import { describe, expect, it } from "vitest";

import { diffKeyedChildren } from "../diff-keyed-children";
import { projectKeyedChildComparableRow } from "../comparable-projection";
import type {
  ChildPayloadByModule,
  ChildStableKeyByModule,
  FactKey,
  KeyedChildModuleKey,
  MediaKey,
  MoveChecklistKey,
  PropertyResourceKey,
  ScoreKey,
  SourceKey,
} from "../types";

describe("diffKeyedChildren", () => {
  it("creates a child when the current collection is empty", () => {
    const current: readonly ChildPayloadByModule["facts"][] = [];
    const incoming = [{ factKey: "fact-a" as FactKey, factGroup: "group", valueText: "value", displayLabel: null, sourceName: null }];

    const result = diffKeyedChildren({
      module: "facts",
      currentChildren: current,
      incomingChildren: incoming,
      getStableKey: (child) => child.factKey,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      kind: "CREATE_CHILD",
      module: "facts",
      stableChildKey: "fact-a",
      currentChild: null,
      incomingChild: incoming[0],
    });
  });

  it("updates a matching keyed child when semantic content changes", () => {
    const current = [{ factKey: "fact-a" as FactKey, factGroup: "group", valueText: "old", displayLabel: null, sourceName: null }];
    const incoming = [{ factKey: "fact-a" as FactKey, factGroup: "group", valueText: "new", displayLabel: null, sourceName: null }];

    const result = diffKeyedChildren({
      module: "facts",
      currentChildren: current,
      incomingChildren: incoming,
      getStableKey: (child) => child.factKey,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      kind: "UPDATE_CHILD",
      module: "facts",
      stableChildKey: "fact-a",
      currentChild: current[0],
      incomingChild: incoming[0],
    });
  });

  it("returns unchanged for formatting-only differences", () => {
    const current = [{ factKey: "fact-a" as FactKey, factGroup: "group", valueText: " Lisbon ", displayLabel: null, sourceName: null }];
    const incoming = [{ factKey: "fact-a" as FactKey, factGroup: "group", valueText: "Lisbon", displayLabel: null, sourceName: null }];

    const result = diffKeyedChildren({
      module: "facts",
      currentChildren: current,
      incomingChildren: incoming,
      getStableKey: (child) => child.factKey,
    });

    expect(result[0]).toMatchObject({ kind: "UNCHANGED_CHILD" });
  });

  it("treats CRLF and LF as semantically equivalent", () => {
    const current = [{ factKey: "fact-a" as FactKey, factGroup: "group", valueText: "line one\nline two", displayLabel: null, sourceName: null }];
    const incoming = [{ factKey: "fact-a" as FactKey, factGroup: "group", valueText: "line one\r\nline two", displayLabel: null, sourceName: null }];

    const result = diffKeyedChildren({
      module: "facts",
      currentChildren: current,
      incomingChildren: incoming,
      getStableKey: (child) => child.factKey,
    });

    expect(result[0]).toMatchObject({ kind: "UNCHANGED_CHILD" });
  });

  it("treats Unicode NFC and NFD as semantically equivalent", () => {
    const current = [{ factKey: "fact-a" as FactKey, factGroup: "group", valueText: "Café", displayLabel: null, sourceName: null }];
    const incoming = [{ factKey: "fact-a" as FactKey, factGroup: "group", valueText: "Cafe\u0301", displayLabel: null, sourceName: null }];

    const result = diffKeyedChildren({
      module: "facts",
      currentChildren: current,
      incomingChildren: incoming,
      getStableKey: (child) => child.factKey,
    });

    expect(result[0]).toMatchObject({ kind: "UNCHANGED_CHILD" });
  });

  it("preserves current children when the incoming array is empty", () => {
    const current = [{ factKey: "fact-a" as FactKey, factGroup: "group", valueText: "value", displayLabel: null, sourceName: null }];

    const result = diffKeyedChildren({
      module: "facts",
      currentChildren: current,
      incomingChildren: [],
      getStableKey: (child) => child.factKey,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ kind: "PRESERVE_CHILD", stableChildKey: "fact-a" });
    expect(result.every((operation) => operation.kind !== "DELETE_CHILD" as never)).toBe(true);
  });

  it("creates a new child while preserving an existing child", () => {
    const current = [{ factKey: "fact-a" as FactKey, factGroup: "group", valueText: "value", displayLabel: null, sourceName: null }];
    const incoming = [
      { factKey: "fact-a" as FactKey, factGroup: "group", valueText: "value", displayLabel: null, sourceName: null },
      { factKey: "fact-b" as FactKey, factGroup: "group", valueText: "value2", displayLabel: null, sourceName: null },
    ];

    const result = diffKeyedChildren({
      module: "facts",
      currentChildren: current,
      incomingChildren: incoming,
      getStableKey: (child) => child.factKey,
    });

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "UNCHANGED_CHILD", stableChildKey: "fact-a" }),
        expect.objectContaining({ kind: "CREATE_CHILD", stableChildKey: "fact-b" }),
      ]),
    );
  });

  it("treats a stable-key change as a preserve plus create", () => {
    const current = [{ factKey: "fact-a" as FactKey, factGroup: "group", valueText: "value", displayLabel: null, sourceName: null }];
    const incoming = [{ factKey: "fact-b" as FactKey, factGroup: "group", valueText: "value", displayLabel: null, sourceName: null }];

    const result = diffKeyedChildren({
      module: "facts",
      currentChildren: current,
      incomingChildren: incoming,
      getStableKey: (child) => child.factKey,
    });

    expect(result).toHaveLength(2);
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "PRESERVE_CHILD", stableChildKey: "fact-a" }),
        expect.objectContaining({ kind: "CREATE_CHILD", stableChildKey: "fact-b" }),
      ]),
    );
    expect(result.some((operation) => operation.kind === "UPDATE_CHILD")).toBe(false);
  });

  it("treats a display-order-only change as an update", () => {
    const current = [{ factKey: "fact-a" as FactKey, factGroup: "group", valueText: "value", displayLabel: "first", sourceName: null }];
    const incoming = [{ factKey: "fact-a" as FactKey, factGroup: "group", valueText: "value", displayLabel: "second", sourceName: null }];

    const result = diffKeyedChildren({
      module: "facts",
      currentChildren: current,
      incomingChildren: incoming,
      getStableKey: (child) => child.factKey,
    });

    expect(result[0]).toMatchObject({ kind: "UPDATE_CHILD" });
  });

  it("fails deterministically on duplicate stable keys in incoming data", () => {
    const incoming = [
      { factKey: "fact-a" as FactKey, factGroup: "group", valueText: "A", displayLabel: null, sourceName: null },
      { factKey: "fact-a" as FactKey, factGroup: "group", valueText: "A", displayLabel: null, sourceName: null },
    ];

    expect(() =>
      diffKeyedChildren({
        module: "facts",
        currentChildren: [],
        incomingChildren: incoming,
        getStableKey: (child) => child.factKey,
      }),
    ).toThrowError(/Duplicate stable child key/i);
  });

  it("fails deterministically on duplicate stable keys in current data", () => {
    const current = [
      { factKey: "fact-a" as FactKey, factGroup: "group", valueText: "A", displayLabel: null, sourceName: null },
      { factKey: "fact-a" as FactKey, factGroup: "group", valueText: "A", displayLabel: null, sourceName: null },
    ];

    expect(() =>
      diffKeyedChildren({
        module: "facts",
        currentChildren: current,
        incomingChildren: [],
        getStableKey: (child) => child.factKey,
      }),
    ).toThrowError(/Duplicate stable child key/i);
  });

  it("fails deterministically when a stable key is missing", () => {
    const current = [{ factKey: null as unknown as FactKey, factGroup: "group", valueText: "A", displayLabel: null, sourceName: null }];

    expect(() =>
      diffKeyedChildren({
        module: "facts",
        currentChildren: current,
        incomingChildren: [],
        getStableKey: (child) => child.factKey,
      }),
    ).toThrowError(/Missing stable child key/i);
  });

  it("does not depend on array order", () => {
    const current = [
      { factKey: "fact-a" as FactKey, factGroup: "group", valueText: "A", displayLabel: null, sourceName: null },
      { factKey: "fact-b" as FactKey, factGroup: "group", valueText: "B", displayLabel: null, sourceName: null },
    ];
    const incoming = [
      { factKey: "fact-c" as FactKey, factGroup: "group", valueText: "C", displayLabel: null, sourceName: null },
      { factKey: "fact-a" as FactKey, factGroup: "group", valueText: "A", displayLabel: null, sourceName: null },
    ];

    const left = diffKeyedChildren({ module: "facts", currentChildren: current, incomingChildren: incoming, getStableKey: (child) => child.factKey });
    const right = diffKeyedChildren({ module: "facts", currentChildren: [...current].reverse(), incomingChildren: [...incoming].reverse(), getStableKey: (child) => child.factKey });

    expect(left).toEqual(right);
  });

  it("does not mutate the input arrays or child objects", () => {
    const current = [{ factKey: "fact-a" as FactKey, factGroup: "group", valueText: "A", displayLabel: null, sourceName: null }];
    const incoming = [{ factKey: "fact-a" as FactKey, factGroup: "group", valueText: "A", displayLabel: null, sourceName: null }];
    const currentSnapshot = structuredClone(current);
    const incomingSnapshot = structuredClone(incoming);

    diffKeyedChildren({ module: "facts", currentChildren: current, incomingChildren: incoming, getStableKey: (child) => child.factKey });

    expect(current).toEqual(currentSnapshot);
    expect(incoming).toEqual(incomingSnapshot);
  });

  it("supports every approved keyed-child module with the generic API", () => {
    const facts = diffKeyedChildren({
      module: "facts",
      currentChildren: [],
      incomingChildren: [],
      getStableKey: (child) => child.factKey,
    });
    const scores = diffKeyedChildren({
      module: "scores",
      currentChildren: [],
      incomingChildren: [],
      getStableKey: (child) => child.scoreKey,
    });
    const neighborhoods = diffKeyedChildren({
      module: "neighborhoods",
      currentChildren: [],
      incomingChildren: [],
      getStableKey: (child) => child.neighborhoodKey,
    });
    const places = diffKeyedChildren({
      module: "places",
      currentChildren: [],
      incomingChildren: [],
      getStableKey: (child) => child.placeKey,
    });
    const resources = diffKeyedChildren({
      module: "resources",
      currentChildren: [],
      incomingChildren: [],
      getStableKey: (child) => child.resourceKey,
    });
    const media = diffKeyedChildren({
      module: "media",
      currentChildren: [],
      incomingChildren: [],
      getStableKey: (child) => child.mediaKey,
    });
    const propertyResources = diffKeyedChildren({
      module: "propertyResources",
      currentChildren: [],
      incomingChildren: [],
      getStableKey: (child) => child.itemKey,
    });
    const moveChecklist = diffKeyedChildren({
      module: "moveChecklist",
      currentChildren: [],
      incomingChildren: [],
      getStableKey: (child) => child.checklistKey,
    });
    const eventsSeasonality = diffKeyedChildren({
      module: "eventsSeasonality",
      currentChildren: [],
      incomingChildren: [],
      getStableKey: (child) => child.eventSeasonalityKey,
    });
    const sources = diffKeyedChildren({
      module: "sources",
      currentChildren: [],
      incomingChildren: [],
      getStableKey: (child) => child.sourceKey,
    });

    expect(facts).toEqual([]);
    expect(scores).toEqual([]);
    expect(neighborhoods).toEqual([]);
    expect(places).toEqual([]);
    expect(resources).toEqual([]);
    expect(media).toEqual([]);
    expect(propertyResources).toEqual([]);
    expect(moveChecklist).toEqual([]);
    expect(eventsSeasonality).toEqual([]);
    expect(sources).toEqual([]);
  });

  it("classifies a persisted score against its equivalent workbook representation as UNCHANGED_CHILD, not UPDATE_CHILD or a duplicate CREATE_CHILD", () => {
    const persistedScore = { scoreKey: "retirement", scoreValue: "90", scoreLabel: "Excellent", verified: "false", verifiedAt: "2026-08-08T00:00:00+00:00" };
    const incomingScore = { score_key: "retirement", score_value: "90", score_label: "Excellent", verified: "0", verified_at: "2026-08-08" };

    const result = diffKeyedChildren({
      module: "scores",
      currentChildren: [persistedScore as never],
      incomingChildren: [incomingScore as never],
      getStableKey: (child) => (child as { scoreKey?: string; score_key?: string }).scoreKey ?? (child as { score_key?: string }).score_key ?? null,
      projectChildForComparison: (child) => projectKeyedChildComparableRow("scores", child),
    });

    expect(result).toHaveLength(1);
    expect(result[0].kind).toBe("UNCHANGED_CHILD");
    expect(result[0].stableChildKey).toBe("retirement");
    expect(result.filter((op) => op.kind === "CREATE_CHILD")).toHaveLength(0);
  });

  it("still classifies a genuinely changed score verified value as UPDATE_CHILD with the same identity", () => {
    const persistedScore = { scoreKey: "retirement", scoreValue: "90", scoreLabel: "Excellent", verified: "false", verifiedAt: "2026-08-08T00:00:00+00:00" };
    const incomingScore = { score_key: "retirement", score_value: "90", score_label: "Excellent", verified: "1", verified_at: "2026-08-08" };

    const result = diffKeyedChildren({
      module: "scores",
      currentChildren: [persistedScore as never],
      incomingChildren: [incomingScore as never],
      getStableKey: (child) => (child as { scoreKey?: string; score_key?: string }).scoreKey ?? (child as { score_key?: string }).score_key ?? null,
      projectChildForComparison: (child) => projectKeyedChildComparableRow("scores", child),
    });

    expect(result).toHaveLength(1);
    expect(result[0].kind).toBe("UPDATE_CHILD");
    expect(result[0].stableChildKey).toBe("retirement");
  });
});
