import { describe, expect, it } from "vitest";
import type { Destination } from "./destinations";
import { buildDestinationKnowledgeProfile } from "./destination-knowledge-engine";

const destination = {
  slug: "nafplio-greece",
  city: "Nafplio",
  country: "Greece",
  climate: "Mediterranean climate with hot, dry summers and mild, wetter winters.",
  transportation: "The historic center is compact and highly walkable.",
  researchProfile: {
    walkability: "Highly walkable within the historic center.",
    healthcare: "A solid local hospital network supports shorter stays.",
    bestNeighborhoods: ["Old Town", "Palamidi"],
    beaches: ["Arvanitia Beach"],
    parks: ["Archaeological Museum Garden"],
    museums: ["Archaeological Museum of Nafplio"],
    restaurants: ["Akti Miaouli"],
    cafes: ["Cafe de Paris"],
    shoppingDistricts: ["Old Town lanes"],
    airports: ["Athens International Airport"],
    hospitals: ["General Hospital of Argolida"],
    universities: ["University of Peloponnese"],
    attractions: ["Palamidi Fortress"],
    longStaySuitability: "Good for slow, walkable relocation.",
    digitalNomadSuitability: "Strong for remote work with a historic setting.",
    familyFriendliness: "Comfortable for families who value walkability.",
  },
  memberDetails: {
    airports: [{ name: "Athens International Airport", distance: "2.5h" }],
    hospitals: [{ name: "General Hospital of Argolida", note: "Main local hospital" }],
  },
} as Partial<Destination> & { knowledgeProfile?: unknown };

describe("buildDestinationKnowledgeProfile", () => {
  it("derives a structured knowledge profile from research and member details", () => {
    const knowledgeProfile = buildDestinationKnowledgeProfile(destination);

    expect(knowledgeProfile.climateClassification).toBe("Mediterranean");
    expect(knowledgeProfile.walkability).toContain("walkable");
    expect(knowledgeProfile.publicTransportation).toContain("compact");
    expect(knowledgeProfile.majorAirports).toEqual(["Athens International Airport"]);
    expect(knowledgeProfile.majorHospitals).toEqual(["General Hospital of Argolida"]);
    expect(knowledgeProfile.bestNeighborhoods).toEqual(["Old Town", "Palamidi"]);
    expect(knowledgeProfile.beaches).toEqual(["Arvanitia Beach"]);
    expect(knowledgeProfile.restaurants).toEqual(["Akti Miaouli"]);
    expect(knowledgeProfile.universities).toEqual(["University of Peloponnese"]);
  });
});
