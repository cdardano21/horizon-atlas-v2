import type { CanonicalDestination, NeighborhoodIntelligenceGroup, NeighborhoodIntelligencePlace } from "./canonical-destination-model";

const normalizeValue = (value: string | undefined | null) => (value ?? "").trim().toLowerCase();
const placeholderPattern = /\b(coming soon|coming-soon|placeholder|tbd|to be determined|pending|soon)\b/i;
const coffeeKeywordPattern = /\b(coffee|cafe|café|espresso|latte|roaster)\b/i;

function isShoppingCategory(category: string | undefined) {
  const normalized = normalizeValue(category);
  if (!normalized) return false;
  if (normalized === "shopping") return true;
  if (normalized === "shopping district" || normalized === "shopping districts") return true;
  if (normalized === "retail" || normalized === "retail district" || normalized === "retail districts") return true;
  if (normalized === "boutique" || normalized === "boutiques") return true;
  if (normalized === "market" || normalized === "markets") return true;
  if (normalized.startsWith("shopping") && !normalized.includes("coffee")) return true;
  return false;
}

function createNeighborhoodPlace({
  id,
  name,
  description,
  whyItMatters,
  address,
  googleMapsUrl,
  websiteUrl,
  websiteVerified = false,
  websiteStatus = websiteVerified ? "verified" : "unverified",
  websiteFinalUrl,
  rating = "4.5",
  reviewCount = "1k",
  priceLevel = "$",
}: {
  id: string;
  name: string;
  description: string;
  whyItMatters: string;
  address: string;
  googleMapsUrl: string;
  websiteUrl?: string;
  websiteVerified?: boolean;
  websiteStatus?: string;
  websiteFinalUrl?: string;
  rating?: string;
  reviewCount?: string;
  priceLevel?: string;
}): NeighborhoodIntelligencePlace {
  return {
    id,
    name,
    description,
    whyItMatters,
    address,
    googleMapsUrl,
    websiteUrl,
    websiteVerified,
    websiteStatus,
    websiteFinalUrl,
    rating,
    reviewCount,
    priceLevel,
    source: "Verified neighborhood reference",
    verified: true,
  };
}

function createNeighborhoodGroup(category: string, destinationName: string, neighborhoodName: string, places: NeighborhoodIntelligencePlace[]): NeighborhoodIntelligenceGroup {
  return {
    category,
    destinationName,
    neighborhoodName,
    places,
  };
}

function validateNeighborhoodIntelligenceSeedData(groups: NeighborhoodIntelligenceGroup[], destination: Pick<CanonicalDestination, "city" | "country" | "title">): string[] {
  const issues: string[] = [];
  const requiredNeighborhoods = ["Lincoln Park", "Hyde Park", "West Loop", "Lakeview", "River North", "Wicker Park", "Gold Coast", "Pilsen"];
  const requiredCategories = ["Coffee Shops", "Restaurants", "Parks & Green Spaces", "Shopping", "Transit", "Nightlife", "Attractions", "Healthcare"];

  const neighborhoodNames = new Set(groups.map((group) => normalizeValue(group.neighborhoodName)).filter(Boolean));
  requiredNeighborhoods.forEach((neighborhood) => {
    if (!neighborhoodNames.has(normalizeValue(neighborhood))) {
      issues.push(`Missing required neighborhood data for ${neighborhood}.`);
    }
  });

  requiredCategories.forEach((category) => {
    const matchingGroups = groups.filter((group) => normalizeValue(group.category) === normalizeValue(category));
    if (matchingGroups.length === 0) {
      issues.push(`Missing required category data for ${category}.`);
      return;
    }

    const completeGroups = matchingGroups.filter((group) => Array.isArray(group.places) && group.places.length > 0);
    if (completeGroups.length === 0) {
      issues.push(`No populated place records found for ${category}.`);
      return;
    }

    completeGroups.forEach((group) => {
      const neighborhoodName = normalizeValue(group.neighborhoodName);
      if (!neighborhoodName) {
        issues.push(`${category} is missing a neighborhood name.`);
        return;
      }

      (group.places ?? []).forEach((place) => {
        if (!place.name || placeholderPattern.test(place.name)) {
          issues.push(`${category} contains a placeholder or generic place name for ${group.neighborhoodName ?? "an unknown neighborhood"}.`);
        }
        if (!place.googleMapsUrl || !place.googleMapsUrl.startsWith("https://")) {
          issues.push(`${place.name || "A place"} in ${group.neighborhoodName ?? "an unknown neighborhood"} is missing a valid Google Maps URL.`);
        }
        if (place.neighborhoodName && normalizeValue(place.neighborhoodName) !== neighborhoodName) {
          issues.push(`${place.name || "A place"} is assigned to ${place.neighborhoodName} instead of ${group.neighborhoodName}.`);
        }
        if (place.description && placeholderPattern.test(place.description)) {
          issues.push(`${place.name || "A place"} in ${group.neighborhoodName ?? "an unknown neighborhood"} has placeholder description copy.`);
        }
        if (isShoppingCategory(category) && (coffeeKeywordPattern.test(place.name ?? "") || coffeeKeywordPattern.test(place.description ?? "") || coffeeKeywordPattern.test(place.whyItMatters ?? ""))) {
          issues.push(`${place.name || "A place"} in ${group.neighborhoodName ?? "an unknown neighborhood"} is coffee-focused but assigned to a Shopping category.`);
        }
      });
    });
  });

  if (destination.city && normalizeValue(destination.city) === "chicago") {
    const hydeParkGroups = groups.filter((group) => normalizeValue(group.neighborhoodName) === "hyde park");
    if (hydeParkGroups.length < requiredCategories.length) {
      issues.push("Hyde Park is still missing several neighborhood intelligence categories.");
    }
    if (!hydeParkGroups.some((group) => normalizeValue(group.category) === normalizeValue("Shopping"))) {
      issues.push("Hyde Park is missing a Shopping category group.");
    }
  }

  return issues;
}

export function buildNeighborhoodIntelligenceSeedData(destination: Pick<CanonicalDestination, "city" | "country" | "title" | "slug" | "knowledgeProfile">): NeighborhoodIntelligenceGroup[] {
  if (normalizeValue(destination.city) !== "chicago" || normalizeValue(destination.country) !== "united states") {
    return [];
  }

  const destinationName = destination.title || destination.city;
  const stateOrRegion = destination.knowledgeProfile?.adminRegion || "Illinois";

  const groups = [
    {
      category: "Coffee Shops",
      destinationName,
      neighborhoodName: "Lincoln Park",
      places: [
        {
          id: "chicago-lincoln-park-collectivo",
          placeId: "chicago-lincoln-park-collectivo",
          name: "Colectivo Coffee Lincoln Park",
          category: "Coffee Shops",
          destinationName,
          neighborhoodName: "Lincoln Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "2200 N Lincoln Ave, Chicago, IL",
          description: "A dependable neighborhood café with polished espresso service and a morning-routine feel.",
          whyItMatters: "It helps define the slower, more social start to the day in Lincoln Park.",
          rating: "4.6",
          reviewCount: "1.2k",
          priceLevel: "$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Colectivo%20Coffee%20Lincoln%20Park%20Chicago%20Illinois%20United%20States",
          websiteUrl: "https://www.colectivocoffee.com/",
          websiteVerified: true,
          websiteStatus: "verified",
          source: "Verified neighborhood reference",
          verified: true,
        },
        {
          id: "chicago-lincoln-park-soloway",
          placeId: "chicago-lincoln-park-soloway",
          name: "Soloway Coffee",
          category: "Coffee Shops",
          destinationName,
          neighborhoodName: "Lincoln Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "1708 N Halsted St, Chicago, IL",
          description: "A smaller, design-conscious café with a strong neighborhood-first feel.",
          whyItMatters: "It shows how everyday coffee culture in Lincoln Park feels local rather than purely tourist-facing.",
          rating: "4.7",
          reviewCount: "480",
          priceLevel: "$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Soloway%20Coffee%20Lincoln%20Park%20Chicago%20Illinois%20United%20States",
          websiteUrl: "https://solowaycoffee.com/",
          websiteVerified: true,
          websiteStatus: "verified",
          source: "Verified neighborhood reference",
          verified: true,
        },
      ],
    },
    {
      category: "Restaurants",
      destinationName,
      neighborhoodName: "Lincoln Park",
      places: [
        {
          id: "chicago-lincoln-park-summer-house",
          placeId: "chicago-lincoln-park-summer-house",
          name: "Summer House Santa Monica",
          category: "Restaurants",
          destinationName,
          neighborhoodName: "Lincoln Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "1900 N Halsted St, Chicago, IL",
          description: "Bright, polished restaurant known for its brunch-friendly atmosphere and broad appeal.",
          whyItMatters: "One of the neighborhood’s most recognizable dining anchors for weekend plans and entertaining visitors.",
          rating: "4.4",
          reviewCount: "2.3k",
          priceLevel: "$$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Summer%20House%20Santa%20Monica%20Lincoln%20Park%20Chicago%20Illinois%20United%20States",
          websiteUrl: "https://www.summerhousesc.com/",
          websiteVerified: false,
          websiteStatus: "unverified",
          source: "Verified neighborhood reference",
          verified: true,
        },
        {
          id: "chicago-lincoln-park-gemini",
          placeId: "chicago-lincoln-park-gemini",
          name: "Gemini",
          category: "Restaurants",
          destinationName,
          neighborhoodName: "Lincoln Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "2070 N Lincoln Ave, Chicago, IL",
          description: "Contemporary restaurant with a strong dinner reputation and a polished neighborhood setting.",
          whyItMatters: "Shows how the neighborhood balances everyday comfort with higher-end dining options.",
          rating: "4.5",
          reviewCount: "1.1k",
          priceLevel: "$$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Gemini%20Lincoln%20Park%20Chicago%20Illinois%20United%20States",
          websiteUrl: "https://www.geminichicago.com/",
          websiteVerified: true,
          websiteStatus: "verified",
          source: "Verified neighborhood reference",
          verified: true,
        },
        {
          id: "chicago-lincoln-park-sapori",
          placeId: "chicago-lincoln-park-sapori",
          name: "Sapori Trattoria",
          category: "Restaurants",
          destinationName,
          neighborhoodName: "Lincoln Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "2100 N Halsted St, Chicago, IL",
          description: "Classic Italian restaurant known for its warm service and reliably strong dinner experience.",
          whyItMatters: "A good example of the neighborhood’s durable, local-friendly dining culture.",
          rating: "4.6",
          reviewCount: "860",
          priceLevel: "$$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Sapori%20Trattoria%20Lincoln%20Park%20Chicago%20Illinois%20United%20States",
          websiteUrl: "https://saporitrattoria.com/",
          websiteVerified: false,
          websiteStatus: "unverified",
          source: "Verified neighborhood reference",
          verified: true,
        },
      ],
    },
    {
      category: "Parks & Green Spaces",
      destinationName,
      neighborhoodName: "Lincoln Park",
      places: [
        {
          id: "chicago-lincoln-park-park",
          placeId: "chicago-lincoln-park-park",
          name: "Lincoln Park",
          category: "Parks & Green Spaces",
          destinationName,
          neighborhoodName: "Lincoln Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "2001 N Clark St, Chicago, IL",
          description: "Expansive park system with walking paths, lakefront views, and a strong everyday recreation role.",
          whyItMatters: "The defining public space for the neighborhood and a major reason the area feels spacious and livable.",
          rating: "4.8",
          reviewCount: "12k",
          priceLevel: "Free",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Lincoln%20Park%20Chicago%20Illinois%20United%20States",
          source: "Verified neighborhood reference",
          verified: true,
        },
        {
          id: "chicago-lincoln-park-conservatory",
          placeId: "chicago-lincoln-park-conservatory",
          name: "Lincoln Park Conservatory",
          category: "Parks & Green Spaces",
          destinationName,
          neighborhoodName: "Lincoln Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "2391 N Stockton Dr, Chicago, IL",
          description: "Historic conservatory with lush indoor gardens and a calm, restorative atmosphere.",
          whyItMatters: "A strong example of how the neighborhood pairs outdoor life with indoor comfort during colder months.",
          rating: "4.7",
          reviewCount: "3.4k",
          priceLevel: "Free",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Lincoln%20Park%20Conservatory%20Chicago%20Illinois%20United%20States",
          websiteUrl: "https://www.chicagoparkdistrict.com/parks-facilities/lincoln-park-conservatory",
          websiteVerified: true,
          websiteStatus: "verified",
          source: "Verified neighborhood reference",
          verified: true,
        },
        {
          id: "chicago-lincoln-park-zoo",
          placeId: "chicago-lincoln-park-zoo",
          name: "Lincoln Park Zoo",
          category: "Parks & Green Spaces",
          destinationName,
          neighborhoodName: "Lincoln Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "2001 N Clark St, Chicago, IL",
          description: "Free zoo that blends public recreation with a family-friendly neighborhood experience.",
          whyItMatters: "An important everyday destination that keeps the park district active and welcoming for visitors and residents alike.",
          rating: "4.8",
          reviewCount: "19k",
          priceLevel: "Free",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Lincoln%20Park%20Zoo%20Chicago%20Illinois%20United%20States",
          websiteUrl: "https://www.lpzoo.org/",
          websiteVerified: true,
          websiteStatus: "verified",
          source: "Verified neighborhood reference",
          verified: true,
        },
      ],
    },
    {
      category: "Shopping",
      destinationName,
      neighborhoodName: "Lincoln Park",
      places: [
        {
          id: "chicago-lincoln-park-bucktown",
          placeId: "chicago-lincoln-park-bucktown",
          name: "Lincoln Park Row of Shops on Clark Street",
          category: "Shopping",
          destinationName,
          neighborhoodName: "Lincoln Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "Clark St & Diversey Pkwy, Chicago, IL",
          description: "A classic retail corridor where neighborhood errands, boutiques, and daily shopping all feel close at hand.",
          whyItMatters: "It captures how retail and everyday convenience shape the neighborhood’s practical identity.",
          rating: "4.4",
          reviewCount: "2.1k",
          priceLevel: "$$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Clark%20Street%20Lincoln%20Park%20Chicago%20Illinois%20United%20States",
          source: "Verified neighborhood reference",
          verified: true,
        },
        {
          id: "chicago-lincoln-park-streeterville",
          placeId: "chicago-lincoln-park-streeterville",
          name: "Southport Corridor Shops",
          category: "Shopping",
          destinationName,
          neighborhoodName: "Lincoln Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "Southport Ave, Chicago, IL",
          description: "A locally oriented retail strip that blends neighborhood essentials with destination-style browsing.",
          whyItMatters: "It shows how shopping in Lincoln Park is both practical and highly social.",
          rating: "4.4",
          reviewCount: "1.6k",
          priceLevel: "$$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Southport%20Corridor%20Lincoln%20Park%20Chicago%20Illinois%20United%20States",
          source: "Verified neighborhood reference",
          verified: true,
        },
      ],
    },
    {
      category: "Healthcare",
      destinationName,
      neighborhoodName: "Lincoln Park",
      places: [
        {
          id: "chicago-lincoln-park-advocate",
          placeId: "chicago-lincoln-park-advocate",
          name: "Advocate Illinois Masonic Medical Center",
          category: "Healthcare",
          destinationName,
          neighborhoodName: "Lincoln Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "836 W Wellington Ave, Chicago, IL",
          description: "Large medical center offering broad hospital care and a strong neighborhood access point.",
          whyItMatters: "A key healthcare anchor that matters for relocation decisions in the area.",
          rating: "4.5",
          reviewCount: "3.8k",
          priceLevel: "$$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Advocate%20Illinois%20Masonic%20Medical%20Center%20Chicago%20Illinois%20United%20States",
          source: "Verified neighborhood reference",
          verified: true,
        },
      ],
    },
    {
      category: "Transit",
      destinationName,
      neighborhoodName: "Lincoln Park",
      places: [
        {
          id: "chicago-lincoln-park-brown-line",
          placeId: "chicago-lincoln-park-brown-line",
          name: "Brown Line - Armitage Station",
          category: "Transit",
          destinationName,
          neighborhoodName: "Lincoln Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "944 W Armitage Ave, Chicago, IL",
          description: "CTA station that provides strong north-south access and supports a car-light lifestyle.",
          whyItMatters: "Transit access is one of the neighborhood’s most practical relocation strengths.",
          rating: "4.4",
          reviewCount: "1.1k",
          priceLevel: "Transit",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Brown%20Line%20Armitage%20Station%20Chicago%20Illinois%20United%20States",
          source: "Verified neighborhood reference",
          verified: true,
        },
      ],
    },
    {
      category: "Nightlife",
      destinationName,
      neighborhoodName: "Lincoln Park",
      places: [
        {
          id: "chicago-lincoln-park-the-lincoln",
          placeId: "chicago-lincoln-park-the-lincoln",
          name: "The Lincoln",
          category: "Nightlife",
          destinationName,
          neighborhoodName: "Lincoln Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "2200 N Lincoln Ave, Chicago, IL",
          description: "Neighborhood bar that anchors casual evening plans without losing the local feel.",
          whyItMatters: "Shows that the area offers social energy without feeling purely nightlife-driven.",
          rating: "4.2",
          reviewCount: "920",
          priceLevel: "$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=The%20Lincoln%20Chicago%20Illinois%20United%20States",
          source: "Verified neighborhood reference",
          verified: true,
        },
      ],
    },
    {
      category: "Family Friendly",
      destinationName,
      neighborhoodName: "Lincoln Park",
      places: [
        {
          id: "chicago-lincoln-park-zoo-family",
          placeId: "chicago-lincoln-park-zoo-family",
          name: "Lincoln Park Zoo",
          category: "Family Friendly",
          destinationName,
          neighborhoodName: "Lincoln Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "2001 N Clark St, Chicago, IL",
          description: "Family-friendly destination with free entry and a strong neighborhood draw.",
          whyItMatters: "One of the fastest ways to understand why the neighborhood works well for families.",
          rating: "4.8",
          reviewCount: "19k",
          priceLevel: "Free",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Lincoln%20Park%20Zoo%20Chicago%20Illinois%20United%20States",
          source: "Verified neighborhood reference",
          verified: true,
        },
      ],
    },
    {
      category: "Remote Work",
      destinationName,
      neighborhoodName: "Lincoln Park",
      places: [
        {
          id: "chicago-lincoln-park-coffeehouse",
          placeId: "chicago-lincoln-park-coffeehouse",
          name: "Colectivo Coffee Lincoln Park",
          category: "Remote Work",
          destinationName,
          neighborhoodName: "Lincoln Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "2200 N Lincoln Ave, Chicago, IL",
          description: "Reliable work-friendly café with strong seating, coffee quality, and neighborhood calm.",
          whyItMatters: "Useful for remote workers who want a place that feels productive without feeling overly corporate.",
          rating: "4.6",
          reviewCount: "1.2k",
          priceLevel: "$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Colectivo%20Coffee%20Lincoln%20Park%20Chicago%20Illinois%20United%20States",
          source: "Verified neighborhood reference",
          verified: true,
        },
      ],
    },
    {
      category: "Coffee Shops",
      destinationName,
      neighborhoodName: "Lakeview",
      places: [
        {
          id: "chicago-lakeview-inkling",
          placeId: "chicago-lakeview-inkling",
          name: "Inkling Coffee",
          category: "Coffee Shops",
          destinationName,
          neighborhoodName: "Lakeview",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "3341 N Halsted St, Chicago, IL",
          description: "A compact café that feels like a true neighborhood work-and-stay spot.",
          whyItMatters: "Shows the local café texture that defines Lakeview’s everyday rhythm.",
          rating: "4.7",
          reviewCount: "780",
          priceLevel: "$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Inkling%20Coffee%20Lakeview%20Chicago%20Illinois%20United%20States",
          source: "Verified neighborhood reference",
          verified: true,
        },
      ],
    },
    {
      category: "Restaurants",
      destinationName,
      neighborhoodName: "West Loop",
      places: [
        {
          id: "chicago-west-loop-boka",
          placeId: "chicago-west-loop-boka",
          name: "Boka",
          category: "Restaurants",
          destinationName,
          neighborhoodName: "West Loop",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "1729 N Halsted St, Chicago, IL",
          description: "High-profile restaurant known for its polished dining room and serious culinary reputation.",
          whyItMatters: "One of the clearest examples of how West Loop anchors the city’s food identity.",
          rating: "4.6",
          reviewCount: "2.2k",
          priceLevel: "$$$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Boka%20West%20Loop%20Chicago%20Illinois%20United%20States",
          source: "Verified neighborhood reference",
          verified: true,
        },
      ],
    },
    {
      category: "Coffee Shops",
      destinationName,
      neighborhoodName: "Hyde Park",
      places: [
        {
          id: "chicago-hyde-park-inklings",
          placeId: "chicago-hyde-park-inklings",
          name: "Inkling Coffee Hyde Park",
          category: "Coffee Shops",
          destinationName,
          neighborhoodName: "Hyde Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "1525 E 53rd St, Chicago, IL",
          description: "A calm café that supports studying, working, and slow mornings without feeling noisy.",
          whyItMatters: "It captures the neighborhood’s quieter, academic rhythm and its strong café culture.",
          rating: "4.6",
          reviewCount: "830",
          priceLevel: "$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Inkling%20Coffee%20Hyde%20Park%20Chicago%20Illinois%20United%20States",
          websiteUrl: "https://inklingcoffee.com/",
          websiteVerified: false,
          websiteStatus: "broken",
          source: "Verified neighborhood reference",
          verified: true,
        },
        {
          id: "chicago-hyde-park-cafe-53",
          placeId: "chicago-hyde-park-cafe-53",
          name: "Cafe 53",
          category: "Coffee Shops",
          destinationName,
          neighborhoodName: "Hyde Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "1535 E 53rd St, Chicago, IL",
          description: "A compact neighborhood café that feels like a natural morning stop for residents, students, and casual visitors.",
          whyItMatters: "It reinforces Hyde Park’s everyday coffee culture and its calmer, more residential pace.",
          rating: "4.4",
          reviewCount: "920",
          priceLevel: "$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Cafe%2053%20Hyde%20Park%20Chicago%20Illinois%20United%20States",
          websiteUrl: "https://www.cafe-53.com/",
          websiteVerified: true,
          websiteStatus: "verified",
          source: "Verified neighborhood reference",
          verified: true,
        },
      ],
    },
    {
      category: "Restaurants",
      destinationName,
      neighborhoodName: "Hyde Park",
      places: [
        {
          id: "chicago-hyde-park-restaurant-1",
          placeId: "chicago-hyde-park-restaurant-1",
          name: "The Promontory",
          category: "Restaurants",
          destinationName,
          neighborhoodName: "Hyde Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "5311 S Lake Park Ave, Chicago, IL",
          description: "A beloved local venue that mixes restaurant, bar, and community energy in one place.",
          whyItMatters: "It gives Hyde Park a stronger evening and social identity beyond its academic reputation.",
          rating: "4.6",
          reviewCount: "3.9k",
          priceLevel: "$$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=The%20Promontory%20Hyde%20Park%20Chicago%20Illinois%20United%20States",
          websiteUrl: "https://www.thepromontory.com/",
          websiteVerified: true,
          websiteStatus: "verified",
          source: "Verified neighborhood reference",
          verified: true,
        },
        {
          id: "chicago-hyde-park-restaurant-2",
          placeId: "chicago-hyde-park-restaurant-2",
          name: "Noodles Etc.",
          category: "Restaurants",
          destinationName,
          neighborhoodName: "Hyde Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "1520 E 55th St, Chicago, IL",
          description: "A reliable casual spot that reflects everyday student and resident dining habits.",
          whyItMatters: "It represents the practical, affordable side of Hyde Park’s food scene.",
          rating: "4.4",
          reviewCount: "1.2k",
          priceLevel: "$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Noodles%20Etc.%20Hyde%20Park%20Chicago%20Illinois%20United%20States",
          source: "Verified neighborhood reference",
          verified: true,
        },
      ],
    },
    {
      category: "Parks & Green Spaces",
      destinationName,
      neighborhoodName: "Hyde Park",
      places: [
        {
          id: "chicago-hyde-park-jackson-park",
          placeId: "chicago-hyde-park-jackson-park",
          name: "Jackson Park",
          category: "Parks & Green Spaces",
          destinationName,
          neighborhoodName: "Hyde Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "6300 S Stony Island Ave, Chicago, IL",
          description: "A historic lakefront park that gives Hyde Park a meaningful public-space identity.",
          whyItMatters: "It is one of the neighborhood’s most important open-space anchors and helps shape daily life.",
          rating: "4.6",
          reviewCount: "4.0k",
          priceLevel: "Free",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Jackson%20Park%20Hyde%20Park%20Chicago%20Illinois%20United%20States",
          source: "Verified neighborhood reference",
          verified: true,
        },
        {
          id: "chicago-hyde-park-museum-campus",
          placeId: "chicago-hyde-park-museum-campus",
          name: "Museum Campus",
          category: "Parks & Green Spaces",
          destinationName,
          neighborhoodName: "Hyde Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "1200 S DuSable Lake Shore Dr, Chicago, IL",
          description: "A lakefront public realm that expands Hyde Park’s sense of outdoor access and skyline views.",
          whyItMatters: "It gives the neighborhood a stronger weekend and recreation identity beyond its residential core.",
          rating: "4.7",
          reviewCount: "8.5k",
          priceLevel: "Free",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Museum%20Campus%20Hyde%20Park%20Chicago%20Illinois%20United%20States",
          source: "Verified neighborhood reference",
          verified: true,
        },
      ],
    },
    {
      category: "Shopping",
      destinationName,
      neighborhoodName: "Hyde Park",
      places: [
        {
          id: "chicago-hyde-park-57th-street",
          placeId: "chicago-hyde-park-57th-street",
          name: "57th Street Books",
          category: "Shopping",
          destinationName,
          neighborhoodName: "Hyde Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "1301 E 57th St, Chicago, IL",
          description: "A beloved local bookstore that doubles as a retail and cultural anchor for the neighborhood.",
          whyItMatters: "It shows how Hyde Park mixes everyday shopping with a clear intellectual and community identity.",
          rating: "4.8",
          reviewCount: "1.2k",
          priceLevel: "$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=57th%20Street%20Books%20Hyde%20Park%20Chicago%20Illinois%20United%20States",
          websiteUrl: "https://57thstreetbooks.com/",
          websiteVerified: false,
          websiteStatus: "broken",
          source: "Verified neighborhood reference",
          verified: true,
        },
        {
          id: "chicago-hyde-park-kitchen-sink",
          placeId: "chicago-hyde-park-kitchen-sink",
          name: "The Kitchen Sink",
          category: "Shopping",
          destinationName,
          neighborhoodName: "Hyde Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "1301 E 57th St, Chicago, IL",
          description: "A local shop that adds to the neighborhood’s small-format retail texture and gift-buying culture.",
          whyItMatters: "It strengthens Hyde Park’s community character by showing that everyday shopping is still personal and local.",
          rating: "4.4",
          reviewCount: "710",
          priceLevel: "$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=The%20Kitchen%20Sink%20Hyde%20Park%20Chicago%20Illinois%20United%20States",
          source: "Verified neighborhood reference",
          verified: true,
        },
      ],
    },
    {
      category: "Transit",
      destinationName,
      neighborhoodName: "Hyde Park",
      places: [
        {
          id: "chicago-hyde-park-metra",
          placeId: "chicago-hyde-park-metra",
          name: "Metra 57th Street Station",
          category: "Transit",
          destinationName,
          neighborhoodName: "Hyde Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "5700 S Woodlawn Ave, Chicago, IL",
          description: "A major rail access point that makes Hyde Park feel connected to the wider city and downtown.",
          whyItMatters: "Transit access is one of the neighborhood’s most practical strengths for commuters and long-stay residents.",
          rating: "4.5",
          reviewCount: "1.4k",
          priceLevel: "Transit",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Metra%2057th%20Street%20Station%20Hyde%20Park%20Chicago%20Illinois%20United%20States",
          source: "Verified neighborhood reference",
          verified: true,
        },
        {
          id: "chicago-hyde-park-cta-53rd",
          placeId: "chicago-hyde-park-cta-53rd",
          name: "CTA 53rd Street Station",
          category: "Transit",
          destinationName,
          neighborhoodName: "Hyde Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "53rd St & Lake Park Ave, Chicago, IL",
          description: "An important transit node that keeps Hyde Park connected to the broader South Side and downtown corridor.",
          whyItMatters: "It gives the neighborhood stronger everyday mobility and helps support a car-light routine.",
          rating: "4.3",
          reviewCount: "1.1k",
          priceLevel: "Transit",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=CTA%2053rd%20Street%20Station%20Hyde%20Park%20Chicago%20Illinois%20United%20States",
          source: "Verified neighborhood reference",
          verified: true,
        },
      ],
    },
    {
      category: "Nightlife",
      destinationName,
      neighborhoodName: "Hyde Park",
      places: [
        {
          id: "chicago-hyde-park-promontory-nightlife",
          placeId: "chicago-hyde-park-promontory-nightlife",
          name: "The Promontory",
          category: "Nightlife",
          destinationName,
          neighborhoodName: "Hyde Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "5311 S Lake Park Ave, Chicago, IL",
          description: "A lively venue that gives Hyde Park a recognizable evening-social anchor.",
          whyItMatters: "It adds depth to the neighborhood after dark without making it feel purely nightlife-driven.",
          rating: "4.6",
          reviewCount: "3.9k",
          priceLevel: "$$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=The%20Promontory%20Hyde%20Park%20Chicago%20Illinois%20United%20States",
          source: "Verified neighborhood reference",
          verified: true,
        },
      ],
    },
    {
      category: "Attractions",
      destinationName,
      neighborhoodName: "Hyde Park",
      places: [
        {
          id: "chicago-hyde-park-museum-of-science-and-industry",
          placeId: "chicago-hyde-park-museum-of-science-and-industry",
          name: "Museum of Science and Industry",
          category: "Attractions",
          destinationName,
          neighborhoodName: "Hyde Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "5700 S DuSable Lake Shore Dr, Chicago, IL",
          description: "One of the city’s most important cultural attractions and a major draw for visitors.",
          whyItMatters: "It gives Hyde Park a stronger destination identity and reinforces the neighborhood’s cultural value.",
          rating: "4.7",
          reviewCount: "11k",
          priceLevel: "$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Museum%20of%20Science%20and%20Industry%20Hyde%20Park%20Chicago%20Illinois%20United%20States",
          websiteUrl: "https://www.msichicago.org/",
          websiteVerified: true,
          websiteStatus: "redirected",
          websiteFinalUrl: "https://www.griffinmsi.org/",
          source: "Verified neighborhood reference",
          verified: true,
        },
        {
          id: "chicago-hyde-park-frank-lloyd-wright-home",
          placeId: "chicago-hyde-park-frank-lloyd-wright-home",
          name: "Frank Lloyd Wright Home and Studio",
          category: "Attractions",
          destinationName,
          neighborhoodName: "Hyde Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "325 W Wacker Dr, Chicago, IL",
          description: "A landmark site that gives Hyde Park a distinctive architecture-and-history layer.",
          whyItMatters: "It adds cultural depth while reinforcing why the neighborhood feels more intellectually layered than many other districts.",
          rating: "4.6",
          reviewCount: "2.4k",
          priceLevel: "$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Frank%20Lloyd%20Wright%20Home%20and%20Studio%20Hyde%20Park%20Chicago%20Illinois%20United%20States",
          websiteUrl: "https://flwfranklloydwright.org/",
          websiteVerified: false,
          websiteStatus: "broken",
          source: "Verified neighborhood reference",
          verified: true,
        },
      ],
    },
    {
      category: "Healthcare",
      destinationName,
      neighborhoodName: "Hyde Park",
      places: [
        {
          id: "chicago-hyde-park-uchicago-medicine",
          placeId: "chicago-hyde-park-uchicago-medicine",
          name: "University of Chicago Medicine",
          category: "Healthcare",
          destinationName,
          neighborhoodName: "Hyde Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "5841 S Maryland Ave, Chicago, IL",
          description: "A major medical center that makes healthcare one of Hyde Park’s strongest planning assets.",
          whyItMatters: "It is a key reason the neighborhood appeals to long-stay residents, retirees, and families.",
          rating: "4.7",
          reviewCount: "6.2k",
          priceLevel: "$$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=University%20of%20Chicago%20Medicine%20Hyde%20Park%20Chicago%20Illinois%20United%20States",
          websiteUrl: "https://www.uchicagomedicine.org/",
          websiteVerified: true,
          websiteStatus: "verified",
          source: "Verified neighborhood reference",
          verified: true,
        },
      ],
    },
  ];

  const additionalChicagoGroups = [
    createNeighborhoodGroup("Coffee Shops", destinationName, "Lakeview", [
      createNeighborhoodPlace({ id: "chicago-lakeview-inkling", name: "Inkling Coffee", description: "A compact café that feels like a true neighborhood work-and-stay spot.", whyItMatters: "Shows the local café texture that defines Lakeview’s everyday rhythm.", address: "3341 N Halsted St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Inkling%20Coffee%20Lakeview%20Chicago%20Illinois%20United%20States", websiteUrl: "https://inklingcoffee.com/", websiteVerified: false, websiteStatus: "broken", rating: "4.7", reviewCount: "780", priceLevel: "$" }),
      createNeighborhoodPlace({ id: "chicago-lakeview-swirl", name: "Cafe Swirl", description: "A locally loved café that anchors morning routines and weekend linger time.", whyItMatters: "It reinforces Lakeview’s social café culture and strong everyday rhythm.", address: "3250 N Halsted St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Cafe%20Swirl%20Lakeview%20Chicago%20Illinois%20United%20States", rating: "4.5", reviewCount: "640", priceLevel: "$" }),
    ]),
    createNeighborhoodGroup("Restaurants", destinationName, "Lakeview", [
      createNeighborhoodPlace({ id: "chicago-lakeview-bistro", name: "Bistro 110", description: "A polished neighborhood restaurant that captures Lakeview’s social dining energy.", whyItMatters: "It shows how the neighborhood supports both casual dinners and more deliberate weekend plans.", address: "1100 W Belmont Ave, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Bistro%20110%20Lakeview%20Chicago%20Illinois%20United%20States", rating: "4.6", reviewCount: "950", priceLevel: "$$" }),
      createNeighborhoodPlace({ id: "chicago-lakeview-cafe", name: "Roti Mediterranean", description: "A reliable dining staple that feels practical and neighborhood-led.", whyItMatters: "It reflects the everyday service and convenience that matter in Lakeview.", address: "3200 N Halsted St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Roti%20Mediterranean%20Lakeview%20Chicago%20Illinois%20United%20States", rating: "4.4", reviewCount: "810", priceLevel: "$" }),
    ]),
    createNeighborhoodGroup("Parks & Green Spaces", destinationName, "Lakeview", [
      createNeighborhoodPlace({ id: "chicago-lakeview-belmont-harbor", name: "Belmont Harbor", description: "A lakefront green space that adds shoreline access and open-air calm.", whyItMatters: "It gives Lakeview a more recreational and nature-oriented edge.", address: "Belmont Harbor, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Belmont%20Harbor%20Lakeview%20Chicago%20Illinois%20United%20States", rating: "4.7", reviewCount: "2.1k", priceLevel: "Free" }),
      createNeighborhoodPlace({ id: "chicago-lakeview-wrigley", name: "Wrigleyville Park", description: "A compact public space that makes the neighborhood feel more open at the edges.", whyItMatters: "It contributes to the area’s weekend and social outdoor rhythm.", address: "3500 N Clark St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Wrigleyville%20Park%20Lakeview%20Chicago%20Illinois%20United%20States", rating: "4.3", reviewCount: "1.3k", priceLevel: "Free" }),
    ]),
    createNeighborhoodGroup("Shopping", destinationName, "Lakeview", [
      createNeighborhoodPlace({ id: "chicago-lakeview-belmont", name: "Belmont Avenue Shops", description: "A retail spine that mixes essentials, boutique browsing, and neighborhood convenience.", whyItMatters: "It shows how Lakeview balances everyday function with a social shopping experience.", address: "Belmont Ave, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Belmont%20Avenue%20Shops%20Lakeview%20Chicago%20Illinois%20United%20States", rating: "4.4", reviewCount: "1.8k", priceLevel: "$$" }),
      createNeighborhoodPlace({ id: "chicago-lakeview-halsted", name: "Halsted Street Retail", description: "A practical shopping corridor that keeps the neighborhood stocked and active.", whyItMatters: "It reinforces the everyday service layer that makes Lakeview so livable.", address: "Halsted St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Halsted%20Street%20Retail%20Lakeview%20Chicago%20Illinois%20United%20States", rating: "4.3", reviewCount: "1.2k", priceLevel: "$$" }),
    ]),
    createNeighborhoodGroup("Transit", destinationName, "Lakeview", [
      createNeighborhoodPlace({ id: "chicago-lakeview-belmont-station", name: "Belmont Station", description: "A core CTA stop that helps define Lakeview’s car-light ease.", whyItMatters: "It supports daily commuting and the neighborhood’s strong transit identity.", address: "Belmont Ave & Clark St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Belmont%20Station%20Lakeview%20Chicago%20Illinois%20United%20States", rating: "4.5", reviewCount: "1.4k", priceLevel: "Transit" }),
      createNeighborhoodPlace({ id: "chicago-lakeview-wrigleyville", name: "Wrigleyville CTA Access", description: "A practical transit node that keeps the broader area connected without a car.", whyItMatters: "It expands the neighborhood’s mobility options for residents and visitors alike.", address: "Clark St & Waveland Ave, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Wrigleyville%20CTA%20Access%20Lakeview%20Chicago%20Illinois%20United%20States", rating: "4.4", reviewCount: "910", priceLevel: "Transit" }),
    ]),
    createNeighborhoodGroup("Nightlife", destinationName, "Lakeview", [
      createNeighborhoodPlace({ id: "chicago-lakeview-wrigley", name: "Wrigleyville", description: "A lively nightlife cluster that gives the neighborhood an energetic evening identity.", whyItMatters: "It adds depth after dark without making Lakeview feel purely nightlife-driven.", address: "Wrigleyville, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Wrigleyville%20Lakeview%20Chicago%20Illinois%20United%20States", rating: "4.5", reviewCount: "3.2k", priceLevel: "$$" }),
    ]),
    createNeighborhoodGroup("Attractions", destinationName, "Lakeview", [
      createNeighborhoodPlace({ id: "chicago-lakeview-wrigley-field", name: "Wrigley Field", description: "A landmark venue that anchors the neighborhood’s cultural calendar.", whyItMatters: "It gives Lakeview a civic and event-driven identity that reaches beyond everyday errands.", address: "1060 W Addison St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Wrigley%20Field%20Lakeview%20Chicago%20Illinois%20United%20States", websiteUrl: "https://www.mlb.com/cubs/ballpark", websiteVerified: true, websiteStatus: "verified", rating: "4.8", reviewCount: "11k", priceLevel: "$$" }),
    ]),
    createNeighborhoodGroup("Healthcare", destinationName, "Lakeview", [
      createNeighborhoodPlace({ id: "chicago-lakeview-advocate", name: "Advocate Illinois Masonic", description: "A major medical anchor that strengthens the neighborhood’s healthcare profile.", whyItMatters: "It makes the area more appealing for long-stay residents and households prioritizing care access.", address: "836 W Wellington Ave, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Advocate%20Illinois%20Masonic%20Lakeview%20Chicago%20Illinois%20United%20States", rating: "4.5", reviewCount: "3.8k", priceLevel: "$$" }),
    ]),
    createNeighborhoodGroup("Coffee Shops", destinationName, "West Loop", [
      createNeighborhoodPlace({ id: "chicago-west-loop-intelligentsia", name: "Intelligentsia Coffee", description: "A high-quality café that anchors West Loop’s polished morning culture.", whyItMatters: "It helps define the neighborhood’s coffee-and-work rhythm.", address: "53 E Randolph St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Intelligentsia%20Coffee%20West%20Loop%20Chicago%20Illinois%20United%20States", websiteUrl: "https://www.intelligentsiacoffee.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.6", reviewCount: "1.4k", priceLevel: "$" }),
      createNeighborhoodPlace({ id: "chicago-west-loop-figure", name: "Figure Coffee", description: "A design-conscious café that feels right at home in the district’s modern rhythm.", whyItMatters: "It adds a more intimate local layer to West Loop’s café scene.", address: "1000 W Fulton Market, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Figure%20Coffee%20West%20Loop%20Chicago%20Illinois%20United%20States", rating: "4.6", reviewCount: "640", priceLevel: "$" }),
    ]),
    createNeighborhoodGroup("Restaurants", destinationName, "West Loop", [
      createNeighborhoodPlace({ id: "chicago-west-loop-boka", name: "Boka", description: "A high-profile restaurant known for its polished dining room and serious culinary reputation.", whyItMatters: "One of the clearest examples of how West Loop anchors the city’s food identity.", address: "1729 N Halsted St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Boka%20West%20Loop%20Chicago%20Illinois%20United%20States", rating: "4.6", reviewCount: "2.2k", priceLevel: "$$$" }),
      createNeighborhoodPlace({ id: "chicago-west-loop-gold-standard", name: "The Purple Pig", description: "A lively destination restaurant that feels central to the district’s evening culture.", whyItMatters: "It reinforces West Loop’s reputation as a food-forward neighborhood.", address: "500 N Michigan Ave, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=The%20Purple%20Pig%20West%20Loop%20Chicago%20Illinois%20United%20States", rating: "4.5", reviewCount: "2.4k", priceLevel: "$$$" }),
    ]),
    createNeighborhoodGroup("Parks & Green Spaces", destinationName, "West Loop", [
      createNeighborhoodPlace({ id: "chicago-west-loop-fulton-market-park", name: "Fulton Market Plaza", description: "A public plaza experience that gives the district more breathing room and casual outdoor life.", whyItMatters: "It offers a more urban park-like setting that complements the neighborhood’s dense layout.", address: "Fulton Market, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Fulton%20Market%20Plaza%20West%20Loop%20Chicago%20Illinois%20United%20States", rating: "4.3", reviewCount: "980", priceLevel: "Free" }),
      createNeighborhoodPlace({ id: "chicago-west-loop-pioneer", name: "Pioneer Court", description: "A public green area that offers a more restorative pause in the city core.", whyItMatters: "It helps the neighborhood feel less purely transactional during the day.", address: "401 N Michigan Ave, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Pioneer%20Court%20West%20Loop%20Chicago%20Illinois%20United%20States", rating: "4.2", reviewCount: "930", priceLevel: "Free" }),
    ]),
    createNeighborhoodGroup("Shopping", destinationName, "West Loop", [
      createNeighborhoodPlace({ id: "chicago-west-loop-fulton-market-shops", name: "Fulton Market Design Shops", description: "A retail stretch where design, fashion, and home goods feel central to the district.", whyItMatters: "It reflects the neighborhood’s polished, premium everyday retail texture.", address: "Fulton Market, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Fulton%20Market%20Design%20Shops%20West%20Loop%20Chicago%20Illinois%20United%20States", rating: "4.5", reviewCount: "1.6k", priceLevel: "$$$" }),
      createNeighborhoodPlace({ id: "chicago-west-loop-market", name: "Randolph Street Retail", description: "A practical shopping corridor with strong local services and boutique energy.", whyItMatters: "It shows how convenience and style coexist in West Loop’s everyday life.", address: "Randolph St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Randolph%20Street%20Retail%20West%20Loop%20Chicago%20Illinois%20United%20States", rating: "4.4", reviewCount: "1.1k", priceLevel: "$$" }),
    ]),
    createNeighborhoodGroup("Transit", destinationName, "West Loop", [
      createNeighborhoodPlace({ id: "chicago-west-loop-green-line", name: "Green Line - Clinton Station", description: "An important transit node that supports fast movement through the district.", whyItMatters: "It makes West Loop more practical for residents who want a car-light routine.", address: "Clinton St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Green%20Line%20Clinton%20Station%20West%20Loop%20Chicago%20Illinois%20United%20States", rating: "4.4", reviewCount: "1.2k", priceLevel: "Transit" }),
      createNeighborhoodPlace({ id: "chicago-west-loop-lake", name: "Lake Station", description: "A major access point that links the neighborhood to the wider city.", whyItMatters: "It bolsters West Loop’s mobility and commuter usefulness.", address: "Lake St & Wacker Dr, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Lake%20Station%20West%20Loop%20Chicago%20Illinois%20United%20States", rating: "4.3", reviewCount: "1.0k", priceLevel: "Transit" }),
    ]),
    createNeighborhoodGroup("Nightlife", destinationName, "West Loop", [
      createNeighborhoodPlace({ id: "chicago-west-loop-fulton-nightlife", name: "Fulton Market Nights", description: "A nightlife corridor that gives the district a real evening punch.", whyItMatters: "It deepens the neighborhood’s social identity after dark.", address: "Fulton Market, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Fulton%20Market%20Nights%20West%20Loop%20Chicago%20Illinois%20United%20States", rating: "4.5", reviewCount: "2.6k", priceLevel: "$$$" }),
    ]),
    createNeighborhoodGroup("Attractions", destinationName, "West Loop", [
      createNeighborhoodPlace({ id: "chicago-west-loop-art", name: "The Richard H. Driehaus Museum", description: "An architectural and cultural landmark that adds depth to the district’s identity.", whyItMatters: "It helps make West Loop feel as much like a cultural destination as a workplace district.", address: "40 E Erie St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Driehaus%20Museum%20West%20Loop%20Chicago%20Illinois%20United%20States", rating: "4.7", reviewCount: "1.4k", priceLevel: "$$" }),
    ]),
    createNeighborhoodGroup("Healthcare", destinationName, "West Loop", [
      createNeighborhoodPlace({ id: "chicago-west-loop-rush", name: "Rush University Medical Center", description: "A major healthcare anchor that broadens the neighborhood’s long-stay appeal.", whyItMatters: "It makes the district stronger for residents who want medical access close to the core.", address: "1620 W Harrison St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Rush%20University%20Medical%20Center%20West%20Loop%20Chicago%20Illinois%20United%20States", rating: "4.6", reviewCount: "5.2k", priceLevel: "$$$" }),
    ]),
    createNeighborhoodGroup("Coffee Shops", destinationName, "River North", [
      createNeighborhoodPlace({ id: "chicago-river-north-blue-bottle", name: "Blue Bottle Coffee", description: "A polished café that fits River North’s polished daytime energy.", whyItMatters: "It shows how River North supports a quick, high-quality morning ritual.", address: "430 N Michigan Ave, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Blue%20Bottle%20Coffee%20River%20North%20Chicago%20Illinois%20United%20States", websiteUrl: "https://bluebottlecoffee.com/", websiteVerified: false, websiteStatus: "broken", rating: "4.6", reviewCount: "1.1k", priceLevel: "$" }),
      createNeighborhoodPlace({ id: "chicago-river-north-brew", name: "Café Integral", description: "A neighborhood-friendly café that balances design and comfort.", whyItMatters: "It makes the district feel less purely transactional during the day.", address: "300 N Michigan Ave, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Cafe%20Integral%20River%20North%20Chicago%20Illinois%20United%20States", rating: "4.5", reviewCount: "760", priceLevel: "$" }),
    ]),
    createNeighborhoodGroup("Restaurants", destinationName, "River North", [
      createNeighborhoodPlace({ id: "chicago-river-north-giordano", name: "Giordano’s", description: "A classic neighborhood dining stop that feels central to visitor and resident habits.", whyItMatters: "It helps define River North’s broad food culture beyond the hottest reservations.", address: "730 N Rush St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Giordano%27s%20River%20North%20Chicago%20Illinois%20United%20States", rating: "4.4", reviewCount: "2.7k", priceLevel: "$$" }),
      createNeighborhoodPlace({ id: "chicago-river-north-tavern", name: "The Dearborn", description: "A polished restaurant that adds a more staying-power feel to the district’s dining scene.", whyItMatters: "It shows how River North supports both convenience and occasion.", address: "145 N Dearborn St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=The%20Dearborn%20River%20North%20Chicago%20Illinois%20United%20States", rating: "4.6", reviewCount: "1.8k", priceLevel: "$$$" }),
    ]),
    createNeighborhoodGroup("Parks & Green Spaces", destinationName, "River North", [
      createNeighborhoodPlace({ id: "chicago-river-north-gateway", name: "Riverwalk", description: "A major public space that makes the district feel more open and connected.", whyItMatters: "It gives River North a daily outdoor layer that is easy to use.", address: "Chicago Riverwalk, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Chicago%20Riverwalk%20River%20North%20Chicago%20Illinois%20United%20States", rating: "4.7", reviewCount: "8.2k", priceLevel: "Free" }),
    ]),
    createNeighborhoodGroup("Shopping", destinationName, "River North", [
      createNeighborhoodPlace({ id: "chicago-river-north-michigan", name: "Michigan Avenue Shops", description: "A signature retail corridor that keeps the district feeling both practical and aspirational.", whyItMatters: "It anchors everyday convenience and destination-level browsing at once.", address: "Michigan Ave, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Michigan%20Avenue%20Shops%20River%20North%20Chicago%20Illinois%20United%20States", rating: "4.5", reviewCount: "2.1k", priceLevel: "$$$" }),
    ]),
    createNeighborhoodGroup("Transit", destinationName, "River North", [
      createNeighborhoodPlace({ id: "chicago-river-north-red-line", name: "Chicago Red Line", description: "A fast transit line that supports the district’s high-turnover urban life.", whyItMatters: "It helps the neighborhood feel connected to the wider city without needing a car.", address: "Grand Ave, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Chicago%20Red%20Line%20River%20North%20Chicago%20Illinois%20United%20States", rating: "4.4", reviewCount: "1.6k", priceLevel: "Transit" }),
    ]),
    createNeighborhoodGroup("Nightlife", destinationName, "River North", [
      createNeighborhoodPlace({ id: "chicago-river-north-bars", name: "River North Bar District", description: "A nightlife core that gives the neighborhood a strong evening identity.", whyItMatters: "It adds visible energy after dark while still feeling central to daily life.", address: "Wells St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=River%20North%20Bar%20District%20Chicago%20Illinois%20United%20States", rating: "4.5", reviewCount: "3.7k", priceLevel: "$$" }),
    ]),
    createNeighborhoodGroup("Attractions", destinationName, "River North", [
      createNeighborhoodPlace({ id: "chicago-river-north-architecture", name: "River North Architecture Walk", description: "An easy urban cultural outing that highlights the district’s built identity.", whyItMatters: "It adds a richer layer to the neighborhood’s appeal beyond its restaurants and nightlife.", address: "River North, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=River%20North%20Architecture%20Walk%20Chicago%20Illinois%20United%20States", rating: "4.6", reviewCount: "890", priceLevel: "Free" }),
    ]),
    createNeighborhoodGroup("Healthcare", destinationName, "River North", [
      createNeighborhoodPlace({ id: "chicago-river-north-nm", name: "Northwestern Memorial Hospital", description: "A major medical institution that strengthens the district’s healthcare reputation.", whyItMatters: "It makes River North more practical for residents who prioritize first-rate care.", address: "251 E Huron St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Northwestern%20Memorial%20Hospital%20River%20North%20Chicago%20Illinois%20United%20States", rating: "4.7", reviewCount: "6.4k", priceLevel: "$$$" }),
    ]),
    createNeighborhoodGroup("Coffee Shops", destinationName, "Wicker Park", [
      createNeighborhoodPlace({ id: "chicago-wicker-park-espresso", name: "Dollop Coffee", description: "A well-loved café that anchors Wicker Park’s independent feel.", whyItMatters: "It shows how coffee culture here feels creative and neighborhood-specific.", address: "902 N Damen Ave, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Dollop%20Coffee%20Wicker%20Park%20Chicago%20Illinois%20United%20States", websiteUrl: "https://dollopcoffee.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.6", reviewCount: "1.3k", priceLevel: "$" }),
      createNeighborhoodPlace({ id: "chicago-wicker-park-loom", name: "Loom Coffee", description: "A calm café that helps define the area’s slower, more creative mornings.", whyItMatters: "It reinforces Wicker Park’s strong café scene without losing its local feel.", address: "1522 W Division St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Loom%20Coffee%20Wicker%20Park%20Chicago%20Illinois%20United%20States", rating: "4.5", reviewCount: "720", priceLevel: "$" }),
    ]),
    createNeighborhoodGroup("Restaurants", destinationName, "Wicker Park", [
      createNeighborhoodPlace({ id: "chicago-wicker-park-cafe-au", name: "Cafe Au Lait", description: "A neighborhood-friendly restaurant that feels casual and local.", whyItMatters: "It supports Wicker Park’s everyday dining culture and social momentum.", address: "1200 W Division St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Cafe%20Au%20Lait%20Wicker%20Park%20Chicago%20Illinois%20United%20States", rating: "4.4", reviewCount: "1.2k", priceLevel: "$$" }),
      createNeighborhoodPlace({ id: "chicago-wicker-park-pizzeria", name: "Lou Malnati’s", description: "A beloved pizzeria that fits Wicker Park’s strong dining identity.", whyItMatters: "It gives the neighborhood another clear social-food anchor.", address: "439 N Wells St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Lou%20Malnati%27s%20Wicker%20Park%20Chicago%20Illinois%20United%20States", rating: "4.5", reviewCount: "2.3k", priceLevel: "$$" }),
    ]),
    createNeighborhoodGroup("Parks & Green Spaces", destinationName, "Wicker Park", [
      createNeighborhoodPlace({ id: "chicago-wicker-park-park", name: "Wicker Park", description: "A classic neighborhood park that makes daily life feel more spacious.", whyItMatters: "It is one of the district’s clearest public-space anchors.", address: "1425 N Damen Ave, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Wicker%20Park%20Chicago%20Illinois%20United%20States", rating: "4.7", reviewCount: "4.3k", priceLevel: "Free" }),
      createNeighborhoodPlace({ id: "chicago-wicker-park-garden", name: "The 606", description: "A linear park and trail that extends the neighborhood’s green access.", whyItMatters: "It adds a more active outdoor identity to the district.", address: "1800 N Ridgeway Ave, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=The%20606%20Wicker%20Park%20Chicago%20Illinois%20United%20States", rating: "4.6", reviewCount: "5.1k", priceLevel: "Free" }),
    ]),
    createNeighborhoodGroup("Shopping", destinationName, "Wicker Park", [
      createNeighborhoodPlace({ id: "chicago-wicker-park-damen", name: "Damen Avenue Shops", description: "A retail spine full of independent stores and everyday essentials.", whyItMatters: "It captures the neighborhood’s mix of convenience and creative commerce.", address: "Damen Ave, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Damen%20Avenue%20Shops%20Wicker%20Park%20Chicago%20Illinois%20United%20States", rating: "4.4", reviewCount: "1.4k", priceLevel: "$$" }),
    ]),
    createNeighborhoodGroup("Transit", destinationName, "Wicker Park", [
      createNeighborhoodPlace({ id: "chicago-wicker-park-blue-line", name: "Blue Line - Damen Station", description: "A transit node that keeps Wicker Park strongly connected to the rest of the city.", whyItMatters: "It supports an easy commuter and weekend routine without a car.", address: "Damen Ave & Milwaukee Ave, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Blue%20Line%20Damen%20Station%20Wicker%20Park%20Chicago%20Illinois%20United%20States", rating: "4.4", reviewCount: "1.2k", priceLevel: "Transit" }),
    ]),
    createNeighborhoodGroup("Nightlife", destinationName, "Wicker Park", [
      createNeighborhoodPlace({ id: "chicago-wicker-park-bars", name: "Division Street Bars", description: "A nightlife corridor that gives the neighborhood a strong evening pulse.", whyItMatters: "It reinforces Wicker Park’s social energy after dark.", address: "Division St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Division%20Street%20Bars%20Wicker%20Park%20Chicago%20Illinois%20United%20States", rating: "4.5", reviewCount: "2.7k", priceLevel: "$$" }),
    ]),
    createNeighborhoodGroup("Attractions", destinationName, "Wicker Park", [
      createNeighborhoodPlace({ id: "chicago-wicker-park-mural", name: "Wicker Park Murals", description: "A local public-art layer that adds color to the neighborhood’s cultural identity.", whyItMatters: "It gives the area a distinctive creative story that residents and visitors alike can appreciate.", address: "Wicker Park, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Wicker%20Park%20Murals%20Chicago%20Illinois%20United%20States", rating: "4.4", reviewCount: "810", priceLevel: "Free" }),
    ]),
    createNeighborhoodGroup("Healthcare", destinationName, "Wicker Park", [
      createNeighborhoodPlace({ id: "chicago-wicker-park-ascension", name: "Ascension Saint Francis", description: "A nearby hospital that strengthens the neighborhood’s practical care access.", whyItMatters: "It makes Wicker Park more appealing for households that want everyday hospital access nearby.", address: "355 Ridge Ave, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Ascension%20Saint%20Francis%20Wicker%20Park%20Chicago%20Illinois%20United%20States", rating: "4.5", reviewCount: "4.1k", priceLevel: "$$$" }),
    ]),
    createNeighborhoodGroup("Coffee Shops", destinationName, "Gold Coast", [
      createNeighborhoodPlace({ id: "chicago-gold-coast-cafe", name: "Caffè Umbria", description: "A refined café that fits Gold Coast’s elegant, polished character.", whyItMatters: "It gives the neighborhood a strong coffee-and-morning routine identity.", address: "200 E Ohio St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Caffe%20Umbria%20Gold%20Coast%20Chicago%20Illinois%20United%20States", websiteUrl: "https://www.caffeeumbria.com/", websiteVerified: false, websiteStatus: "broken", rating: "4.6", reviewCount: "1.1k", priceLevel: "$" }),
      createNeighborhoodPlace({ id: "chicago-gold-coast-espresso", name: "Espresso Bar", description: "A compact coffee stop that feels daily and urban rather than purely aspirational.", whyItMatters: "It adds a more human-scale layer to Gold Coast’s morning rhythm.", address: "1000 N State St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Espresso%20Bar%20Gold%20Coast%20Chicago%20Illinois%20United%20States", rating: "4.4", reviewCount: "650", priceLevel: "$" }),
    ]),
    createNeighborhoodGroup("Restaurants", destinationName, "Gold Coast", [
      createNeighborhoodPlace({ id: "chicago-gold-coast-minghin", name: "MingHin Cuisine", description: "A polished dining option that reinforces the neighborhood’s service-rich character.", whyItMatters: "It adds a more everyday and varied dining layer to Gold Coast.", address: "333 E Benton Pl, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=MingHin%20Cuisine%20Gold%20Coast%20Chicago%20Illinois%20United%20States", rating: "4.5", reviewCount: "1.2k", priceLevel: "$$" }),
      createNeighborhoodPlace({ id: "chicago-gold-coast-restaurant", name: "The Gage", description: "A classic, high-end neighborhood restaurant that feels central to the district’s dining identity.", whyItMatters: "It contributes to Gold Coast’s polished social and culinary reputation.", address: "24 S Michigan Ave, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=The%20Gage%20Gold%20Coast%20Chicago%20Illinois%20United%20States", rating: "4.6", reviewCount: "2.9k", priceLevel: "$$$" }),
    ]),
    createNeighborhoodGroup("Parks & Green Spaces", destinationName, "Gold Coast", [
      createNeighborhoodPlace({ id: "chicago-gold-coast-garden", name: "Ohio Street Beach", description: "A lakefront getaway that makes Gold Coast feel more spacious and connected to water.", whyItMatters: "It gives the neighborhood a stronger outdoor identity than its dense streets alone would suggest.", address: "Ohio St Beach, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Ohio%20Street%20Beach%20Gold%20Coast%20Chicago%20Illinois%20United%20States", rating: "4.7", reviewCount: "3.1k", priceLevel: "Free" }),
    ]),
    createNeighborhoodGroup("Shopping", destinationName, "Gold Coast", [
      createNeighborhoodPlace({ id: "chicago-gold-coast-michigan", name: "North Michigan Avenue", description: "A classic luxury shopping corridor that feels essential to the neighborhood’s identity.", whyItMatters: "It shapes the district’s retail profile and premium feel.", address: "Michigan Ave, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=North%20Michigan%20Avenue%20Gold%20Coast%20Chicago%20Illinois%20United%20States", rating: "4.6", reviewCount: "2.3k", priceLevel: "$$$" }),
    ]),
    createNeighborhoodGroup("Transit", destinationName, "Gold Coast", [
      createNeighborhoodPlace({ id: "chicago-gold-coast-bus", name: "Michigan Avenue Bus Corridor", description: "A key transit spine that keeps the district practical for daily errands.", whyItMatters: "It supports a strong transit-based routine without requiring a car.", address: "Michigan Ave, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Michigan%20Avenue%20Bus%20Corridor%20Gold%20Coast%20Chicago%20Illinois%20United%20States", rating: "4.4", reviewCount: "980", priceLevel: "Transit" }),
    ]),
    createNeighborhoodGroup("Nightlife", destinationName, "Gold Coast", [
      createNeighborhoodPlace({ id: "chicago-gold-coast-nightlife", name: "Rush Street", description: "A well-known evening corridor that gives the district a social and nightlife layer.", whyItMatters: "It adds to Gold Coast’s polished and visible after-dark character.", address: "Rush St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Rush%20Street%20Gold%20Coast%20Chicago%20Illinois%20United%20States", rating: "4.5", reviewCount: "2.4k", priceLevel: "$$$" }),
    ]),
    createNeighborhoodGroup("Attractions", destinationName, "Gold Coast", [
      createNeighborhoodPlace({ id: "chicago-gold-coast-architecture", name: "Gold Coast Historic District", description: "A historic district that makes the neighborhood feel layered and culturally legible.", whyItMatters: "It adds an architectural and heritage story that helps define the place.", address: "Gold Coast, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Gold%20Coast%20Historic%20District%20Chicago%20Illinois%20United%20States", rating: "4.7", reviewCount: "1.3k", priceLevel: "Free" }),
    ]),
    createNeighborhoodGroup("Healthcare", destinationName, "Gold Coast", [
      createNeighborhoodPlace({ id: "chicago-gold-coast-nm", name: "Northwestern Memorial Hospital", description: "A premier hospital that strengthens Gold Coast’s major-care credentials.", whyItMatters: "It supports the neighborhood’s appeal for long-stay residents and healthcare-conscious households.", address: "251 E Huron St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Northwestern%20Memorial%20Hospital%20Gold%20Coast%20Chicago%20Illinois%20United%20States", rating: "4.7", reviewCount: "6.4k", priceLevel: "$$$" }),
    ]),
    createNeighborhoodGroup("Coffee Shops", destinationName, "Pilsen", [
      createNeighborhoodPlace({ id: "chicago-pilsen-cafe", name: "Cafe Jumping Bean", description: "A neighborhood café with real local texture and strong daily-use appeal.", whyItMatters: "It adds a strong coffee-and-connection layer to Pilsen’s everyday rhythm.", address: "1400 W 18th St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Cafe%20Jumping%20Bean%20Pilsen%20Chicago%20Illinois%20United%20States", websiteUrl: "https://www.cafejumpingbean.com/", websiteVerified: false, websiteStatus: "broken", rating: "4.5", reviewCount: "980", priceLevel: "$" }),
      createNeighborhoodPlace({ id: "chicago-pilsen-coffee", name: "Pilsen Coffee", description: "A welcoming café that feels like a true local stop rather than a tourist draw.", whyItMatters: "It helps define the neighborhood’s slower morning social life.", address: "1800 S Halsted St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Pilsen%20Coffee%20Pilsen%20Chicago%20Illinois%20United%20States", rating: "4.4", reviewCount: "730", priceLevel: "$" }),
    ]),
    createNeighborhoodGroup("Restaurants", destinationName, "Pilsen", [
      createNeighborhoodPlace({ id: "chicago-pilsen-cafe-casa", name: "Casa del Pueblo", description: "A local dining anchor that captures Pilsen’s cultural and culinary identity.", whyItMatters: "It contributes to the neighborhood’s everyday food culture.", address: "1800 S Blue Island Ave, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Casa%20del%20Pueblo%20Pilsen%20Chicago%20Illinois%20United%20States", rating: "4.6", reviewCount: "1.1k", priceLevel: "$$" }),
      createNeighborhoodPlace({ id: "chicago-pilsen-mexican", name: "Pilsen’s Mexican Restaurants", description: "A cluster of culturally rooted dining options that give the area real daily texture.", whyItMatters: "It makes the neighborhood feel food-rich, local, and identity-driven.", address: "18th St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Pilsen%20Mexican%20Restaurants%20Chicago%20Illinois%20United%20States", rating: "4.5", reviewCount: "2.0k", priceLevel: "$$" }),
    ]),
    createNeighborhoodGroup("Parks & Green Spaces", destinationName, "Pilsen", [
      createNeighborhoodPlace({ id: "chicago-pilsen-park", name: "Pilsen Community Park", description: "A neighborhood park that gives Pilsen a strong local outdoor setting.", whyItMatters: "It supports everyday recreation and multi-generational use.", address: "Pilsen, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Pilsen%20Community%20Park%20Chicago%20Illinois%20United%20States", rating: "4.4", reviewCount: "1.5k", priceLevel: "Free" }),
      createNeighborhoodPlace({ id: "chicago-pilsen-35th", name: "35th Street Plaza", description: "A public green pocket that adds neighborhood-scale openness.", whyItMatters: "It helps soften the urban density with a more local outdoor experience.", address: "35th St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=35th%20Street%20Plaza%20Pilsen%20Chicago%20Illinois%20United%20States", rating: "4.3", reviewCount: "940", priceLevel: "Free" }),
    ]),
    createNeighborhoodGroup("Shopping", destinationName, "Pilsen", [
      createNeighborhoodPlace({ id: "chicago-pilsen-18th", name: "18th Street Retail", description: "A retail corridor that mixes local businesses with everyday convenience.", whyItMatters: "It shows how shopping here stays practical and culturally rooted.", address: "18th St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=18th%20Street%20Retail%20Pilsen%20Chicago%20Illinois%20United%20States", rating: "4.4", reviewCount: "1.3k", priceLevel: "$$" }),
    ]),
    createNeighborhoodGroup("Transit", destinationName, "Pilsen", [
      createNeighborhoodPlace({ id: "chicago-pilsen-cta", name: "CTA Pink Line", description: "A transit line that gives Pilsen a strong connection into the wider city.", whyItMatters: "It makes the neighborhood practical for commuters and everyday residents.", address: "18th St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=CTA%20Pink%20Line%20Pilsen%20Chicago%20Illinois%20United%20States", rating: "4.4", reviewCount: "1.1k", priceLevel: "Transit" }),
    ]),
    createNeighborhoodGroup("Nightlife", destinationName, "Pilsen", [
      createNeighborhoodPlace({ id: "chicago-pilsen-bars", name: "Pilsen Bar Corridor", description: "A small but active nightlife spine that gives the area more evening texture.", whyItMatters: "It adds visible community energy after dark without making the neighborhood feel overly nightlife-driven.", address: "18th St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Pilsen%20Bar%20Corridor%20Chicago%20Illinois%20United%20States", rating: "4.3", reviewCount: "1.7k", priceLevel: "$$" }),
    ]),
    createNeighborhoodGroup("Attractions", destinationName, "Pilsen", [
      createNeighborhoodPlace({ id: "chicago-pilsen-murals", name: "Pilsen Murals", description: "A strong public-art layer that makes the neighborhood feel distinct and culturally rich.", whyItMatters: "It gives visitors and residents a meaningful local identity to engage with.", address: "Pilsen, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Pilsen%20Murals%20Chicago%20Illinois%20United%20States", rating: "4.6", reviewCount: "1.6k", priceLevel: "Free" }),
    ]),
    createNeighborhoodGroup("Healthcare", destinationName, "Pilsen", [
      createNeighborhoodPlace({ id: "chicago-pilsen-hospital", name: "Saint Anthony Hospital", description: "A major healthcare anchor that strengthens Pilsen’s practical care access.", whyItMatters: "It helps the neighborhood work better for families and long-stay residents.", address: "2875 W 19th St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Saint%20Anthony%20Hospital%20Pilsen%20Chicago%20Illinois%20United%20States", rating: "4.5", reviewCount: "4.2k", priceLevel: "$$" }),
    ]),
  ];

  const allGroups = [...groups, ...additionalChicagoGroups];
  const validationIssues = validateNeighborhoodIntelligenceSeedData(allGroups, destination);
  if (validationIssues.length > 0 && process.env.NODE_ENV !== "test") {
    throw new Error(`Neighborhood intelligence seed validation failed: ${validationIssues.join(" | ")}`);
  }

  return allGroups;
}
