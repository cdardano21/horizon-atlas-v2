import { describe, expect, it } from "vitest";
import {
  buildDeterministicV31ImportPlan,
  isDeterministicV31ContractVersionSupported,
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

  it("loads identically when the frozen workbook path is supplied explicitly, proving the loader is parameterized", async () => {
    const explicitPath = `${process.cwd()}/data/DestinationFinderAI_Master_Workbook_v3.1_FROZEN_Pilot_Dataset.xlsx`;
    const defaultResult = await loadFrozenWorkbookV31DeterministicImport();
    const explicitResult = await loadFrozenWorkbookV31DeterministicImport(explicitPath);

    expect(explicitResult.validationErrors).toEqual([]);
    expect(explicitResult.destinations.map((destination) => destination.destinationKey).sort()).toEqual(
      defaultResult.destinations.map((destination) => destination.destinationKey).sort(),
    );
  });

  it("rejects an explicit workbook path that does not resolve to a real file, proving the parameter is not silently ignored", async () => {
    await expect(loadFrozenWorkbookV31DeterministicImport("/tmp/definitely-not-a-real-workbook-path.xlsx")).rejects.toBeTruthy();
  });

  it("no longer requires a minimum pilot-status row count for a workbook to be considered valid", async () => {
    const importResult = await loadFrozenWorkbookV31DeterministicImport();
    expect(importResult.validationErrors.some((error) => error.toLowerCase().includes("pilot status"))).toBe(false);
  });

  describe("isDeterministicV31ContractVersionSupported", () => {
    it("accepts the current supported version", () => {
      expect(isDeterministicV31ContractVersionSupported("3.1")).toBe(true);
    });

    it("accepts a compatible future minor version within the supported range", () => {
      expect(isDeterministicV31ContractVersionSupported("3.2")).toBe(true);
      expect(isDeterministicV31ContractVersionSupported("3.9")).toBe(true);
    });

    it("rejects an unsupported older version", () => {
      expect(isDeterministicV31ContractVersionSupported("3.0")).toBe(false);
      expect(isDeterministicV31ContractVersionSupported("2.9")).toBe(false);
    });

    it("rejects an unsupported future major version safely", () => {
      expect(isDeterministicV31ContractVersionSupported("4.0")).toBe(false);
    });

    it("handles malformed version strings safely without throwing", () => {
      expect(isDeterministicV31ContractVersionSupported("")).toBe(false);
      expect(isDeterministicV31ContractVersionSupported("not-a-version")).toBe(false);
      expect(isDeterministicV31ContractVersionSupported("3")).toBe(false);
    });
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

  it("keeps metadata.sheetNames stable in value and order across repeated parses", async () => {
    const firstImport = await loadFrozenWorkbookV31DeterministicImport();
    const secondImport = await loadFrozenWorkbookV31DeterministicImport();

    const firstSheetNames = firstImport.diagnostics?.metadata.sheetNames?.split(",") ?? [];
    const secondSheetNames = secondImport.diagnostics?.metadata.sheetNames?.split(",") ?? [];

    expect(firstSheetNames).toEqual(secondSheetNames);
    expect(firstSheetNames).toEqual(expect.arrayContaining(["DESTINATIONS", "WORKBOOK_METADATA", "DATA_DICTIONARY"]));
    expect(firstSheetNames.length).toBeGreaterThan(0);
  });
});
