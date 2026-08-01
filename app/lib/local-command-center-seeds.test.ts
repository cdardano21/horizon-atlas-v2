import { describe, expect, it } from "vitest";
import { LOCAL_COMMAND_CENTER_SEEDS } from "./local-command-center-seeds";

describe("Todos Santos local command center seed", () => {
  it("includes core relocation metrics for Todos Santos", () => {
    const seed = LOCAL_COMMAND_CENTER_SEEDS["todos-santos-mexico"];

    expect(seed).toBeDefined();

    const labels = new Set((seed?.quickMetrics ?? []).map((metric) => metric.label));

    expect(labels).toContain("Population (2023)");
    expect(labels).toContain("Airport distance");
    expect(labels).toContain("Broadband internet");
    expect(labels).toContain("1BR rent, centre");
    expect(labels).toContain("2BR rent, centre");
    expect(labels).toContain("3BR rent, centre");
    expect(labels).toContain("Groceries");
    expect(labels).toContain("Utilities");
    expect(labels).toContain("Gasoline");
    expect(labels).toContain("Big Mac index");
  });
});
