import { describe, expect, it } from "vitest";
import type { Destination } from "./destinations";
import { buildPremiumDestinationEditorialPackage } from "./premium-destination-engine";

const destination: Destination = {
  slug: "nafplio-greece",
  city: "Nafplio",
  country: "Greece",
  emoji: "🏔",
  match: 0,
  description: "Nafplio sits on the Argolic Gulf beneath three fortresses, with neoclassical houses, marble squares and a harborfront that feels more like an island town than a mainland city.",
  overview: "Nafplio is the capital of Argolis and one of mainland Greece's most admired historic towns. Palamidi Fortress rises above the rooftops, Bourtzi Castle occupies a small offshore islet, and Akronafplia crowns the ridge above the old town.",
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
    bestNeighborhoods: ["Old Town", "Palamidi", "Kastro"],
    districts: ["Old Town", "Kastro", "Palamidi"],
    famousStreets: ["Syntagma Square", "Arvanitaki Street", "Akti Miaouli"],
    parks: ["Archaeological Museum Garden", "Koumoundourou Park"],
    museums: ["Archaeological Museum of Nafplio", "Museum of Bourdzi"],
    beaches: ["Arvanitia Beach", "Karathona Beach"],
    mountains: ["Mount Parnon"],
    landmarks: ["Palamidi Fortress", "Bourtzi", "Akronafplia"],
    restaurants: ["Akti Miaouli", "Taverna Aigis"],
    cafes: ["Cafe de Paris", "The Harbour Cafe"],
    shoppingDistricts: ["Old Town lanes", "Harbor promenade"],
    airports: ["Athens International Airport"],
    hospitals: ["General Hospital of Argolida"],
    universities: ["University of Peloponnese"],
    sportsTeams: ["Nafplio football club"],
    entertainmentAreas: ["Harbor promenade", "Old Town plazas"],
    attractions: ["Palamidi Fortress", "Bourtzi", "Akronafplia"],
    hiddenGems: ["The uphill lanes above the harbor", "Small waterfront cafés"],
  },
  memberDetails: {
    airports: [{ name: "Athens International Airport", distance: "2.5h" }],
    hospitals: [{ name: "General Hospital of Argolida", note: "Main local hospital" }],
  },
};

describe("buildPremiumDestinationEditorialPackage", () => {
  it("builds destination-specific editorial sections and resources from real destination facts", () => {
    const packageContent = buildPremiumDestinationEditorialPackage(destination);

    expect(packageContent.overviewArticle).toContain("Nafplio");
    expect(packageContent.overviewArticle).toContain("Palamidi");
    expect(packageContent.whatItsReallyLike).toContain("harbor");
    expect(packageContent.neighborhoodGuide).toContain("Old Town");
    expect(packageContent.overviewArticle).not.toMatch(/\b(daily life|strong sense of place|shaped by|works best for|local identity|people who value)\b/i);
    expect(packageContent.overviewArticle.length).toBeGreaterThan(500);
    expect(packageContent.whatItsReallyLike.length).toBeGreaterThan(400);
    expect(packageContent.neighborhoodGuide.length).toBeGreaterThan(300);
    expect(packageContent.retirementGuide.length).toBeGreaterThan(250);
    expect(packageContent.familyGuide.length).toBeGreaterThan(250);
    expect(packageContent.digitalNomadGuide.length).toBeGreaterThan(250);
    expect(packageContent.healthcareGuide.length).toBeGreaterThan(250);
    expect(packageContent.costOfLivingGuide.length).toBeGreaterThan(250);
    expect(packageContent.transportationGuide.length).toBeGreaterThan(250);
    expect(packageContent.climateGuide.length).toBeGreaterThan(250);
    expect(packageContent.walkabilityGuide.length).toBeGreaterThan(250);
    expect(packageContent.safetyGuide.length).toBeGreaterThan(250);
    expect(packageContent.pros).toEqual(expect.arrayContaining([expect.stringContaining("Walkable") ]));
    expect(packageContent.cons).toEqual(expect.arrayContaining([expect.stringContaining("crowds") ]));
    expect(packageContent.resourceLinks.some((link) => link.label === "Google Maps")).toBe(true);
    expect(packageContent.resourceLinks.some((link) => link.label === "Official Tourism")).toBe(true);
    expect(packageContent.resourceLinks.some((link) => link.label === "Wikipedia")).toBe(true);
    expect(packageContent.monthlyBudgets.some((budget) => budget.label === "Single")).toBe(true);
    expect(packageContent.monthlyBudgets.some((budget) => budget.currency === "EUR")).toBe(true);
    expect(packageContent.neighborhoodGuides.some((item) => item.name === "Old Town")).toBe(true);
    expect(packageContent.scoringNotes.some((item) => item.category === "Retirement")).toBe(true);
  });

  it("uses structured destination knowledge facts when they are available", () => {
    const packageContent = buildPremiumDestinationEditorialPackage({
      ...destination,
      knowledgeProfile: {
        population: "12,000",
        metroPopulation: "130,000",
        climateClassification: "Mediterranean",
        walkability: "Highly walkable within the historic center.",
        publicTransportation: "Bus service and ferries connect the wider region.",
        majorHospitals: ["General Hospital of Argolida"],
        bestNeighborhoods: ["Old Town", "Palamidi"],
        beaches: ["Arvanitia Beach"],
      },
    });

    expect(packageContent.overviewArticle).toContain("12,000");
    expect(packageContent.transportationGuide).toContain("Bus service");
    expect(packageContent.healthcareGuide).toContain("General Hospital of Argolida");
    expect(packageContent.neighborhoodGuide).toContain("Palamidi");
  });

  it("pulls destination-specific language from the shared research profiles for known places", () => {
    const packageContent = buildPremiumDestinationEditorialPackage({
      slug: "cavtat-croatia",
      city: "Cavtat",
      country: "Croatia",
      emoji: "🌊",
      match: 0,
      description: "Cavtat is a small Adriatic harbor town near Dubrovnik.",
      overview: "Cavtat is a compact Adriatic harbor town with a calm waterfront rhythm.",
      climate: "Mediterranean climate with warm summers and mild winters.",
      lifestyle: "Life revolves around the harbor, the promenade, and the sea.",
      transportation: "The town is compact and walkable with easy access to Dubrovnik and the airport.",
      images: [],
      tags: ["coast", "harbor", "walkable"],
    });

    expect(packageContent.overviewArticle).toContain("Adriatic");
    expect(packageContent.whatItsReallyLike).toContain("promenade");
    expect(packageContent.healthcareGuide).toContain("Dubrovnik");
    expect(packageContent.costOfLivingGuide).toContain("moderate");
  });

  it("uses the destination's own neighborhood facts instead of a hardcoded Chicago template", () => {
    const packageContent = buildPremiumDestinationEditorialPackage({
      ...destination,
      slug: "chicago-illinois-united-states",
      city: "Chicago",
      country: "United States",
      researchProfile: {
        ...destination.researchProfile,
        bestNeighborhoods: ["South Loop", "River North", "West Town"],
        districts: ["South Loop", "River North", "West Town"],
        parks: ["Grant Park"],
        museums: ["Art Institute of Chicago"],
        airports: ["O'Hare International Airport"],
        hospitals: ["Northwestern Memorial Hospital"],
      },
      knowledgeProfile: {
        bestNeighborhoods: ["South Loop", "River North", "West Town"],
        parks: ["Grant Park"],
        museums: ["Art Institute of Chicago"],
        majorAirports: ["O'Hare International Airport"],
        majorHospitals: ["Northwestern Memorial Hospital"],
      },
    });

    expect(packageContent.neighborhoodGuides.some((item) => item.name === "South Loop")).toBe(true);
    expect(packageContent.neighborhoodGuides.some((item) => item.name === "Lincoln Park")).toBe(false);
    expect(packageContent.scoringNotes.some((item) => item.note.includes("South Loop"))).toBe(false);
  });
});
