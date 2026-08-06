import { describe, expect, it } from "vitest";
import { buildPremiumDestinationContent } from "./premium-destination-content";
import type { Destination } from "./destinations";

const destination: Destination = {
  slug: "nafplio-greece",
  city: "Nafplio",
  country: "Greece",
  emoji: "🏔",
  match: 0,
  description: "Nafplio sits on the Argolic Gulf beneath three fortresses, with neoclassical houses, marble squares and a harborfront that feels more like an island town than a mainland city.",
  overview: "Nafplio is the capital of Argolis and one of mainland Greece's most admired historic towns.",
  climate: "Mediterranean climate with hot, dry summers and mild, wetter winters.",
  lifestyle: "Life revolves around the harbor, old-town cafés, evening promenades and nearby beaches.",
  transportation: "The historic center is compact and highly walkable, though Palamidi requires a steep climb or taxi.",
  images: [],
  tags: ["harbor", "fortress", "historic"],
  researchProfile: {
    whyPeopleLoveIt: ["The harbor setting feels cinematic", "The old town is walkable and atmospheric"],
    pros: ["Walkable old town", "Strong cultural identity", "Easy access to archaeological sites"],
    cons: ["Summer crowds", "Limited rail access", "Steep climbs in parts of town"],
    bestFor: ["Couples", "Photographers", "History lovers"],
    notIdealFor: ["People who want nonstop nightlife", "Residents who need frequent rail access"],
    localCulture: "The city still feels like a lived-in Peloponnesian town rather than a tourist theme park.",
    foodAndDining: "Seafood, grilled fish, and local meze shape the dining scene.",
  },
};

describe("buildPremiumDestinationContent", () => {
  it("creates destination-specific editorial content without placeholder copy", () => {
    const result = buildPremiumDestinationContent(destination);

    expect(result.heroIntroduction).toContain("Nafplio");
    expect(result.heroIntroduction).not.toMatch(/placeholder|needs enrichment|coming soon|being expanded/i);
    expect(result.majorStrengths).toContain("Walkable old town");
    expect(result.majorDrawbacks).toContain("Summer crowds");
    expect(result.overviewArticle).toContain("Argolis");
    expect(result.retirementGuide).toContain("harbor");
  });

  it("uses shared research profiles to enrich content for destinations with richer data", () => {
    const result = buildPremiumDestinationContent({
      slug: "spearfish-south-dakota-united-states",
      city: "Spearfish",
      country: "United States",
      emoji: "🏔",
      match: 0,
      description: "Spearfish is a scenic Black Hills town known for outdoor access and a small university.",
      overview: "Spearfish offers mountain views, canyon scenery, and a manageable small-town pace.",
      climate: "Semi-arid continental climate with warm summers and cold winters.",
      lifestyle: "Life revolves around outdoor access, small-town amenities, and nearby regional services.",
      transportation: "Rapid City Regional Airport is the main gateway and local transit is limited.",
      images: [],
      tags: ["outdoors", "mountains", "small-town"],
    });

    expect(result.heroIntroduction).toContain("Spearfish");
    expect(result.overviewArticle).toContain("canyon");
    expect(result.dailyLifeArticle).toContain("outdoor");
    expect(result.transportationArticle).toContain("Rapid City");
    expect(result.prosAndCons.advantages).toEqual(expect.arrayContaining([expect.stringContaining("outdoor")]))
  });
});
