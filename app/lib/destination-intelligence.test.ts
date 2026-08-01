import { describe, expect, it } from "vitest";
import { getDestinationIntelligence } from "./destination-intelligence";
import { destinations } from "./destinations";

describe("destination intelligence", () => {
  it("builds destination-specific planning signals from the city's real profile", () => {
    const destination = destinations.find((item) => item.slug === "valencia-spain");

    expect(destination).toBeDefined();

    const intelligence = getDestinationIntelligence(destination!);
    const cityLogic = intelligence.quickFacts.find((item) => item.label === "City logic")?.value ?? "";

    expect(cityLogic.toLowerCase()).toContain("district");
    expect(cityLogic.toLowerCase()).toContain("beach");
    expect(intelligence.briefingSections.some((section) => section.title.toLowerCase().includes("daily rhythm"))).toBe(true);
  });

  it("surfaces neighborhood-fit guidance for retirement planning", () => {
    const destination = destinations.find((item) => item.slug === "valencia-spain");

    expect(destination).toBeDefined();

    const intelligence = getDestinationIntelligence(destination!);
    const neighborhoodFit = intelligence.quickFacts.find((fact) => fact.label.toLowerCase().includes("neighborhood"));

    expect(neighborhoodFit?.value).toBeTruthy();
    expect(neighborhoodFit?.value.toLowerCase()).toContain("district");
  });

  it("surfaces distinctive character for specific coastal and urban destinations", () => {
    const hiroshima = destinations.find((item) => item.slug === "hiroshima-japan");
    const kobe = destinations.find((item) => item.slug === "kobe-japan");
    const cavtat = destinations.find((item) => item.slug === "cavtat-croatia");

    expect(hiroshima).toBeDefined();
    expect(kobe).toBeDefined();
    expect(cavtat).toBeDefined();

    const hiroshimaIntelligence = getDestinationIntelligence(hiroshima!);
    const kobeIntelligence = getDestinationIntelligence(kobe!);
    const cavtatIntelligence = getDestinationIntelligence(cavtat!);

    expect(hiroshimaIntelligence.aiSummary.toLowerCase()).toContain("river");
    expect(kobeIntelligence.aiSummary.toLowerCase()).toContain("harbor");
    expect(cavtatIntelligence.aiSummary.toLowerCase()).toContain("harbor");
  });
});
