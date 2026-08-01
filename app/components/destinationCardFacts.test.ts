import { describe, expect, it } from "vitest";

import { destinations } from "../lib/destinations";
import { generatedDestinationCardFacts } from "../lib/generated-destination-card-facts";
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

  it("filters legacy source-card phrasing before rendering facts", () => {
    const destination = destinations.find((item) => item.slug === "valencia-spain");
    if (!destination) {
      throw new Error("Expected valencia-spain in test fixtures");
    }

    const result = getDestinationCardFacts(destination);
    const hasLegacyPhrase = result.facts.some((fact) => /tax context|residency context|dri signal|ordinary weekday|week after week/i.test(fact.value));

    expect(hasLegacyPhrase).toBe(false);
    expect(result.facts.length).toBeGreaterThan(0);
  });

  it("provides generated card facts for Brazilian cities that previously fell back to generic text", () => {
    const slugs = ["maringa-brazil", "porto-alegre-brazil", "belo-horizonte-brazil", "curitiba-brazil", "florianopolis-brazil", "campinas-brazil", "joao-pessoa-brazil", "maceio-brazil", "natal-brazil", "vitoria-brazil", "balneario-camboriu-brazil", "gramado-brazil", "niteroi-brazil", "ribeirao-preto-brazil", "santos-brazil", "joinville-brazil", "ajijic-mexico", "chapala-mexico", "grecia-costa-rica", "liberia-costa-rica", "tamarindo-costa-rica", "san-isidro-de-el-general-costa-rica", "quito-ecuador", "ambato-ecuador", "valdivia-chile", "puerto-varas-chile", "cartago-costa-rica", "mazatlan-mexico", "puerto-escondido-mexico", "todos-santos-mexico", "alajuela-costa-rica", "atenas-costa-rica", "coronado-panama", "el-valle-de-anton-panama", "las-tablas-panama", "cumbaya-ecuador"];

    for (const slug of slugs) {
      const entry = generatedDestinationCardFacts[slug];
      expect(entry).toBeDefined();
      expect(entry?.facts.length).toBeGreaterThan(0);
      expect(entry?.summary.toLowerCase()).not.toContain("verification");
    }
  });

  it("builds a usable card for destinations with sparse native content", () => {
    const destination = {
      slug: "sparse-test",
      city: "Test City",
      country: "Test Country",
      emoji: "🌍",
      description: "",
      overview: "",
      lifestyle: "",
      climate: "",
      transportation: "",
      tags: [],
      match: 0,
      images: [],
    } as typeof destinations[number];

    const result = getDestinationCardFacts(destination);

    expect(result.summary.trim().length).toBeGreaterThan(0);
    expect(result.facts.length).toBeGreaterThan(0);
  });
});
