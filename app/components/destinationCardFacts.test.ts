import { describe, expect, it } from "vitest";

import { destinations } from "../lib/destinations";
import { getDestinationCardFacts } from "./destinationCardFacts";

describe("destinationCardFacts", () => {
  it("always returns at least three card facts", () => {
    for (const destination of destinations) {
      const result = getDestinationCardFacts(destination);
      expect(result.facts.length).toBeGreaterThanOrEqual(3);
      for (const fact of result.facts) {
        expect(fact.label.trim().length).toBeGreaterThan(0);
        expect(fact.value.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("does not use verification placeholder copy on low-coverage records", () => {
    const sparseDestination = destinations.find((destination) => destination.slug === "nafplio-greece");
    if (!sparseDestination) {
      throw new Error("Expected nafplio-greece in test fixtures");
    }

    const result = getDestinationCardFacts(sparseDestination);
    expect(result.facts.some((fact) => fact.value === "Data verification in progress")).toBe(false);
    expect(result.summary.toLowerCase()).not.toContain("verified destination evidence");
  });

  it("prioritizes destination-native facts when generated records are generic", () => {
    const destination = destinations.find((item) => item.slug === "valencia-spain");
    if (!destination) {
      throw new Error("Expected valencia-spain in test fixtures");
    }

    const result = getDestinationCardFacts(destination);
    expect(result.facts.length).toBeGreaterThan(0);
    expect(result.facts[0]?.label).toBe("Lifestyle");
  });
});
