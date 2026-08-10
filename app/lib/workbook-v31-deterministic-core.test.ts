import { describe, expect, it } from "vitest";
import {
  buildDeterministicV31ImportPlan,
  loadFrozenWorkbookV31DeterministicImport,
} from "./workbook-v31-deterministic-core";

describe("workbook v3.1 deterministic core", () => {
  it("loads the frozen workbook contract and resolves the three pilot destinations", async () => {
    const importResult = await loadFrozenWorkbookV31DeterministicImport();

    expect(importResult.contractVersion).toBe("3.1");
    expect(importResult.validationErrors).toEqual([]);
    expect(importResult.destinations.map((destination) => destination.destinationKey)).toEqual(expect.arrayContaining([
      "new-braunfels-tx-us",
      "lisbon-pt",
      "summerlin-nv-us",
    ]));

    const newBraunfels = importResult.destinations.find((destination) => destination.destinationKey === "new-braunfels-tx-us");
    expect(newBraunfels?.slug).toBe("new-braunfels-texas");
    expect(newBraunfels?.name).toBe("New Braunfels");
    expect(newBraunfels?.country).toBe("United States");
    expect(newBraunfels?.facts.find((fact) => fact.factKey === "climate")?.sourceName).toBe("Workbook editorial research");
    expect(newBraunfels?.scores.find((score) => score.scoreKey === "retirement")?.scoreValue).toBe("82");
  });

  it("preserves blank values and rejects orphaned module rows without fuzzy matching", () => {
    const plan = buildDeterministicV31ImportPlan({
      destinations: [
        { destination_key: "new-braunfels-tx-us", slug: "new-braunfels-tx-us", destination_name: "New Braunfels", city: "New Braunfels", country: "United States" },
      ],
      destinationFacts: [
        { destination_key: "new-braunfels-tx-us", fact_group: "climate", fact_key: "climate", display_label: "Climate", value_text: "", source_name: "" },
        { destination_key: "unknown-destination", fact_group: "climate", fact_key: "climate", display_label: "Climate", value_text: "Ghost row", source_name: "" },
      ],
      destinationScores: [],
      neighborhoods: [],
      places: [],
      resources: [],
      media: [],
      destinationAliases: [],
    });

    const climateFact = plan.destinations[0]?.facts.find((fact) => fact.factKey === "climate");
    expect(climateFact?.valueText).toBeNull();
    expect(climateFact?.sourceName).toBeNull();
    expect(plan.rejectedRows).toEqual(expect.arrayContaining([
      expect.objectContaining({ sheet: "destinationFacts", reason: expect.stringContaining("destination") }),
    ]));
  });

  it("uses explicit aliases for child routing and reports the read-only contract diagnostics", async () => {
    const importResult = await loadFrozenWorkbookV31DeterministicImport();

    const newBraunfels = importResult.destinations.find((destination) => destination.destinationKey === "new-braunfels-tx-us");
    expect(newBraunfels?.moduleCounts.NEIGHBORHOODS).toBeGreaterThan(0);
    expect(newBraunfels?.moduleCounts.PLACES).toBeGreaterThan(0);
    expect(newBraunfels?.moduleCounts.MEDIA).toBeGreaterThan(0);
    expect(importResult.diagnostics?.readOnly).toBe(true);
    expect(importResult.diagnostics?.metadata.architecture).toBe("workbook_only_no_fallback");
    expect(importResult.diagnostics?.aliasResolution["new-braunfels-texas"]).toBe("new-braunfels-tx-us");
    expect(importResult.diagnostics?.moduleCounts.DESTINATIONS).toBe(3);
  });
});
