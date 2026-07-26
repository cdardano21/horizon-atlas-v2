import { describe, expect, it } from "vitest";

import {
  appendFormRow,
  isCommandCenterFormDataset,
  parseCommandCenterRowsDraft,
  removeFormRow,
  updateFormRowField,
} from "./commandCenterFormUtils";

describe("commandCenterFormUtils", () => {
  it("detects datasets with first-class form support", () => {
    expect(isCommandCenterFormDataset("destination_core_metrics")).toBe(true);
    expect(isCommandCenterFormDataset("destination_scores")).toBe(true);
    expect(isCommandCenterFormDataset("monthly_climate")).toBe(false);
  });

  it("parses row draft JSON and keeps object rows only", () => {
    const rows = parseCommandCenterRowsDraft('[{"a":1}, 2, null, [1], {"b":2}]');
    expect(rows).toEqual([{ a: 1 }, { b: 2 }]);
  });

  it("returns null for invalid or non-array row JSON", () => {
    expect(parseCommandCenterRowsDraft("not-json")).toBeNull();
    expect(parseCommandCenterRowsDraft('{"a":1}')).toBeNull();
  });

  it("appends default core metrics row", () => {
    const rows = appendFormRow([], "destination_core_metrics");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      metric_key: "",
      metric_label: "",
      verification_status: "in_progress",
      confidence_level: "low",
    });
  });

  it("appends default score row with sort order", () => {
    const rows = appendFormRow([{ category: "Safety" }], "destination_scores");
    expect(rows).toHaveLength(2);
    expect(rows[1]).toMatchObject({
      category: "",
      score: null,
      sort_order: 1,
      verification_status: "in_progress",
      confidence_level: "low",
    });
  });

  it("removes a row by index", () => {
    const rows = removeFormRow([{ a: 1 }, { b: 2 }, { c: 3 }], 1);
    expect(rows).toEqual([{ a: 1 }, { c: 3 }]);
  });

  it("coerces numeric core metric fields and keeps text fields as strings", () => {
    const startingRows = [{ metric_key: "budget", value_numeric: 10 }];
    const numericUpdated = updateFormRowField(startingRows, "destination_core_metrics", 0, "value_numeric", "42.5");
    expect(numericUpdated[0]).toMatchObject({ value_numeric: 42.5 });

    const cleared = updateFormRowField(startingRows, "destination_core_metrics", 0, "value_numeric", "");
    expect(cleared[0]).toMatchObject({ value_numeric: null });

    const textUpdated = updateFormRowField(startingRows, "destination_core_metrics", 0, "metric_label", "Monthly Budget");
    expect(textUpdated[0]).toMatchObject({ metric_label: "Monthly Budget" });

    const invalidNumeric = updateFormRowField(startingRows, "destination_core_metrics", 0, "value_numeric", "abc");
    expect(invalidNumeric[0]).toMatchObject({ value_numeric: null });
  });

  it("coerces numeric scorecard fields", () => {
    const startingRows = [{ category: "Safety", score: 80, sort_order: 0 }];
    const scoreUpdated = updateFormRowField(startingRows, "destination_scores", 0, "score", "91");
    expect(scoreUpdated[0]).toMatchObject({ score: 91 });

    const weightUpdated = updateFormRowField(startingRows, "destination_scores", 0, "personalized_weight", "0.4");
    expect(weightUpdated[0]).toMatchObject({ personalized_weight: 0.4 });

    const sortUpdated = updateFormRowField(startingRows, "destination_scores", 0, "sort_order", "5");
    expect(sortUpdated[0]).toMatchObject({ sort_order: 5 });

    const invalidScore = updateFormRowField(startingRows, "destination_scores", 0, "score", "bad-value");
    expect(invalidScore[0]).toMatchObject({ score: null });
  });
});
