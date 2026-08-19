import { describe, expect, it } from "vitest";
import type { Destination } from "./destinations";
import { rankDestinationsForRetirementDna } from "./recommendation-engine";
import { RETIREMENT_DNA_QUESTIONS, deserializeRetirementDnaAnswers, serializeRetirementDnaAnswers } from "./retirement-dna";

const destination = (overrides: Partial<Destination>): Destination => ({
  slug: "baseline-portugal",
  city: "Baseline",
  country: "Portugal",
  emoji: "",
  match: 80,
  description: "A connected destination.",
  overview: "A destination profile.",
  climate: "Mild",
  lifestyle: "Relaxed",
  transportation: "Connected",
  images: [],
  tags: [],
  ...overrides,
});

describe("retirement recommendation contracts", () => {
  it("round-trips every current question ID without changing its 1-5 value", () => {
    const answers = Object.fromEntries(RETIREMENT_DNA_QUESTIONS.map((questionItem, index) => [questionItem.id, (index % 5) + 1]));
    expect(deserializeRetirementDnaAnswers(serializeRetirementDnaAnswers(answers))).toEqual(answers);
  });

  it("keeps destination ranking driven by the existing weighted engine", () => {
    const answers = Object.fromEntries(RETIREMENT_DNA_QUESTIONS.map((questionItem) => [questionItem.id, 1]));
    for (const questionItem of RETIREMENT_DNA_QUESTIONS.filter((item) => item.dimension === "coast" || item.dimension === "walkability")) {
      answers[questionItem.id] = 5;
    }

    const coastal = destination({ slug: "coastal-portugal", city: "Coastal", tags: ["beach", "coast", "walkability"] });
    const inland = destination({ slug: "inland-portugal", city: "Inland", tags: [] });
    const result = rankDestinationsForRetirementDna([inland, coastal], answers);

    expect(result.ranked.map((item) => item.destination.slug)).toEqual(["coastal-portugal", "inland-portugal"]);
    expect(result.ranked[0].matchedPriorities).toContain("Coastal lifestyle (92)");
  });
});