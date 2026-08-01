import { describe, expect, it } from "vitest";
import { getDestinationRelocationFrame } from "./destination-page-structure";

describe("destination relocation frames", () => {
  it("returns a practical relocation frame for Cavtat, Hiroshima, and Kobe", () => {
    const cavtat = getDestinationRelocationFrame("Cavtat");
    const hiroshima = getDestinationRelocationFrame("Hiroshima");
    const kobe = getDestinationRelocationFrame("Kobe");

    expect(cavtat?.heroLabel).toBe("Daily reality");
    expect(cavtat?.sections.some((section) => section.title === "Who it fits")).toBe(true);
    expect(cavtat?.sections.some((section) => section.title === "Main tradeoff")).toBe(true);

    expect(hiroshima?.heroLabel).toBe("Daily reality");
    expect(hiroshima?.sections.some((section) => section.title === "Who it fits")).toBe(true);
    expect(hiroshima?.sections.some((section) => section.title === "After three months")).toBe(true);

    expect(kobe?.heroLabel).toBe("Daily reality");
    expect(kobe?.sections.some((section) => section.title === "Neighborhoods")).toBe(true);
    expect(kobe?.sections.some((section) => section.title === "Practical fit")).toBe(true);
  });

  it("returns null for destinations outside the targeted set", () => {
    expect(getDestinationRelocationFrame("Lisbon")).toBeNull();
  });
});
