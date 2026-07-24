import type { Destination, DestinationMemberDetails } from "./destinations";

export const getDestinationMemberDetails = (destination: Destination): DestinationMemberDetails => {
  return destination.memberDetails ?? { researchStatus: "research" };
};

const buildSearchUrl = (destination: Destination, suffix: string) =>
  `https://www.google.com/search?q=${encodeURIComponent(`${destination.city} ${destination.country} ${suffix}`)}`;

export const getDestinationResearchLinks = (destination: Destination) => [
  {
    title: "Monthly weather",
    description: "Track monthly highs, lows, rainfall, humidity, and sea temperature before treating climate as a core advantage.",
    href: buildSearchUrl(destination, "monthly weather averages"),
  },
  {
    title: "Top hospitals",
    description: "Check hospital groups, private clinics, specialist depth, and bilingual care coverage in realistic travel radius.",
    href: buildSearchUrl(destination, "best hospitals private clinics"),
  },
  {
    title: "Major airports",
    description: "Identify airport names, drive times, route quality, and nonstop long-haul options that matter for family and connections.",
    href: buildSearchUrl(destination, "nearest major airports drive time"),
  },
  {
    title: "Golf courses",
    description: "Separate public from private clubs and verify number of playable courses within normal day-to-day range.",
    href: buildSearchUrl(destination, "public private golf courses"),
  },
  {
    title: "Restaurants",
    description: "Check restaurant depth, neighborhood dining density, and whether the scene is actually broad or just tourist-heavy.",
    href: buildSearchUrl(destination, "restaurants dining map"),
  },
  {
    title: "Pickleball",
    description: "Look for dedicated pickleball courts, club play, shared tennis facilities, and expat sports groups.",
    href: buildSearchUrl(destination, "pickleball courts clubs"),
  },
  {
    title: "Schools",
    description: "Review local schools, international options, and whether the education ecosystem fits a family move.",
    href: buildSearchUrl(destination, "schools international schools"),
  },
  {
    title: "English schools",
    description: "Verify English-language or bilingual school availability instead of assuming broader school count solves it.",
    href: buildSearchUrl(destination, "english schools bilingual schools"),
  },
];

export const getMemberDetailHighlights = (destination: Destination) => {
  const details = getDestinationMemberDetails(destination);
  const highlights: Array<{ label: string; value: string }> = [];

  if (details.bestMonths) {
    highlights.push({ label: "Best months", value: details.bestMonths });
  }

  if (typeof details.amenities?.restaurants === "number") {
    highlights.push({ label: "Restaurants", value: String(details.amenities.restaurants) });
  }

  if (typeof details.golf?.publicCourses === "number" || typeof details.golf?.privateCourses === "number") {
    const publicCourses = details.golf?.publicCourses ?? 0;
    const privateCourses = details.golf?.privateCourses ?? 0;
    highlights.push({ label: "Golf", value: `${publicCourses} public / ${privateCourses} private` });
  }

  if (details.airports?.length) {
    highlights.push({ label: "Airports", value: details.airports.slice(0, 2).map((item) => item.name).join(", ") });
  }

  if (details.hospitals?.length) {
    highlights.push({ label: "Hospitals", value: `${details.hospitals.length} listed` });
  }

  if (typeof details.amenities?.pickleballCourts === "number") {
    highlights.push({ label: "Pickleball", value: String(details.amenities.pickleballCourts) });
  }

  if (typeof details.amenities?.englishSchools === "number") {
    highlights.push({ label: "English schools", value: String(details.amenities.englishSchools) });
  }

  return highlights.slice(0, 4);
};
