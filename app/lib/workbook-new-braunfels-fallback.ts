import type { CanonicalDestinationBudget, CanonicalDestinationCostProfile, CanonicalDestinationMedia, CanonicalDestinationResource, NeighborhoodIntelligenceGroup } from "./canonical-destination-model";

export interface WorkbookFallbackDestinationData {
  slug: string;
  city: string;
  country: string;
  title: string;
  subtitle: string;
  heroNarrative: string;
  overview: string;
  editorial: string;
  whyThisPlaceFeelsDistinct: string;
  dailyLife: string;
  premiumEditorialContent?: {
    heroIntroduction?: string;
    whyPeopleLoveIt?: string[];
    majorStrengths?: string[];
    majorDrawbacks?: string[];
    bestFor?: string[];
    overviewArticle?: string;
    neighborhoodsArticle?: string;
    dailyLifeArticle?: string;
    climateArticle?: string;
    transportationArticle?: string;
    costOfLivingArticle?: string;
    healthcareArticle?: string;
    retirementGuide?: string;
    familyGuide?: string;
    digitalNomadGuide?: string;
  };
  neighborhoodProfiles?: Array<{
    name: string;
    summary?: string;
    resources?: Array<{ category: string; label: string; url: string; kind?: "dataset" | "generated" | "live" }>;
    intelligence?: Array<{ key: string; label: string; value: string; description: string }>;
  }>;
  climate: string;
  transportation: string;
  healthcare: string;
  costOfLiving: string;
  walkability: string;
  internet: string;
  safety: string;
  neighborhoods: string[];
  resources: CanonicalDestinationResource[];
  media: CanonicalDestinationMedia[];
  monthlyBudgets: CanonicalDestinationBudget[];
  costOfLivingProfile: CanonicalDestinationCostProfile;
  officialTourismUrl: string;
  googleMapsUrl: string;
  googleEarthUrl: string;
  wikipediaUrl: string;
  youtubeUrl: string;
  tiktokUrl: string;
  instagramUrl: string;
  webcamUrl: string;
  neighborhoodIntelligence?: NeighborhoodIntelligenceGroup[];
}

const NEW_BRAUNFELS_FALLBACK_DATA: WorkbookFallbackDestinationData = {
  slug: "new-braunfels-texas-united-states",
  city: "New Braunfels",
  country: "United States",
  title: "New Braunfels",
  subtitle: "New Braunfels, United States",
  heroNarrative: "New Braunfels combines Texas Hill Country river life, German heritage, and a strong local identity rooted in Gruene, Downtown, and the Comal and Guadalupe rivers.",
  overview: "New Braunfels feels most compelling when the daily rhythm is visible: river access, historic districts, neighborhood cafés, and a practical mix of local services and healthcare.",
  editorial: "The place is best understood through its lived-in districts and the way daily routine is shaped by rivers, parks, hospitality, and community anchors.",
  whyThisPlaceFeelsDistinct: "The city’s distinctiveness comes from how its historic core and river culture remain visible in everyday life rather than being reduced to tourism alone.",
  premiumEditorialContent: {
    heroIntroduction: "New Braunfels feels like a river life destination with enough civic depth to support long-stay living, weekend escape, and a genuine local identity.",
    whyPeopleLoveIt: ["River access", "Historic districts", "Strong local food and culture", "Easy access to Austin and San Antonio"],
    majorStrengths: ["River access", "Walkable historic districts", "Solid healthcare access", "Strong local identity"],
    majorDrawbacks: ["More car-dependent outside core districts", "Summer heat can be intense", "Demand can rise in river-adjacent neighborhoods"],
    bestFor: ["Retirees who want river-town charm", "Families seeking a slower pace", "Remote workers who want a strong local community"],
    overviewArticle: "New Braunfels is a city where the everyday experience still matters: river mornings, historic Main Street energy, and a practical mix of services that make it feel more rooted than purely vacation-oriented.",
    neighborhoodsArticle: "Gruene and Downtown are the clearest neighborhood anchors for understanding the city’s habitability, while newer districts offer a wider spread of suburban living and convenience.",
    dailyLifeArticle: "Daily life here is shaped by rivers, cafés, groceries, local restaurants, and the sense that the city has a distinctive identity even outside peak tourism seasons.",
    climateArticle: "The climate is warm, humid, and outdoor-oriented, with river recreation and summer heat affecting how the city feels in everyday life.",
    transportationArticle: "Getting around is still mostly car-oriented, but the city is well positioned for regional access and day trips to larger metro areas.",
    costOfLivingArticle: "The city is usually more affordable than many Texas Hill Country lifestyle markets, while still seeing increased pricing in more desirable neighborhoods.",
    healthcareArticle: "Healthcare is one of the city’s strongest practical advantages, especially for long-stay households and retirees who value regional care access.",
    retirementGuide: "New Braunfels works well for retirees who want scenic living, strong local culture, and easy access to healthcare without the intensity of a major metro.",
    familyGuide: "Families tend to appreciate the city’s pace, outdoor access, and neighborhood identity, though school and district choice still matter.",
    digitalNomadGuide: "Remote workers can do well here if they value a slower pace, strong local cafés, and practical connectivity rather than a dense urban environment.",
  },
  neighborhoodProfiles: [
    {
      name: "Gruene Historic District",
      summary: "Gruene is the city’s most recognizable neighborhood for river-town charm, historic architecture, and an everyday rhythm shaped by restaurants, music, and the river.",
      resources: [
        { category: "restaurant", label: "The Gristmill Restaurant & Bar", url: "https://gristmillrestaurant.com/", kind: "dataset" },
        { category: "music", label: "Gruene Hall", url: "https://gruenehall.com/", kind: "dataset" },
      ],
      intelligence: [
        { key: "walkability", label: "Walkability", value: "Strong for a small-town historic district", description: "The district is compact, scenic, and easy to experience on foot." },
        { key: "restaurantDensity", label: "Restaurant density", value: "High", description: "Dining is one of the neighborhood’s clearest identity markers." },
        { key: "nightlife", label: "Nightlife", value: "Moderate to lively", description: "The area has a recognizable evening rhythm centered on music and hospitality." },
      ],
    },
    {
      name: "Downtown New Braunfels",
      summary: "Downtown offers a more everyday, civic-facing version of the city with local shops, practical services, and an easier path to daily errands.",
      resources: [
        { category: "healthcare", label: "Resolute Baptist Hospital", url: "https://www.baptisthealthsystem.com/locations/detail/resolute-baptist-hospital", kind: "dataset" },
      ],
      intelligence: [
        { key: "walkability", label: "Walkability", value: "Moderate", description: "The core streets are easy to navigate, but the broader district remains mixed." },
        { key: "familyFriendly", label: "Family friendly", value: "Strong", description: "The district supports a practical everyday routine for households." },
        { key: "healthcare", label: "Healthcare", value: "Strong", description: "Regional medical access is one of the area’s clearest advantages." },
      ],
    },
  ],
  dailyLife: "A strong daily-life script comes from neighborhood coffee, river recreation, local restaurants, and easy access to both San Antonio and Austin.",
  climate: "Humid subtropical climate with very hot summers and mild winters, plus seasonality shaped by river recreation and outdoor living.",
  transportation: "Transport is still largely car-dependent, but the city is well positioned for access to San Antonio, Austin, and regional airports.",
  healthcare: "Healthcare access is a major strength, anchored by major hospitals and practical access to regional care networks.",
  costOfLiving: "The cost of living is generally reasonable relative to many high-demand U.S. lifestyle destinations, though housing and river-adjacent neighborhoods can still command premiums.",
  walkability: "Downtown and Gruene offer the most walkable everyday experience, while other districts remain more car-dependent.",
  internet: "Broadband and mobile connectivity are generally reliable for long-stay and remote-work use.",
  safety: "The city is widely viewed as a practical, community-oriented place with strong local identity and manageable day-to-day risk.",
  neighborhoods: ["Downtown New Braunfels", "Gruene Historic District"],
  resources: [
    { category: "official", label: "City of New Braunfels", provider: "City of New Braunfels", url: "https://www.newbraunfels.gov/" },
    { category: "tourism", label: "New Braunfels Tourism", provider: "New Braunfels Tourism", url: "https://www.playinnewbraunfels.com/" },
    { category: "healthcare", label: "Resolute Baptist Hospital", provider: "Resolute Baptist Hospital", url: "https://www.baptisthealthsystem.com/locations/detail/resolute-baptist-hospital" },
  ],
  media: [
    {
      kind: "image",
      url: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Comal_River_in_Landa_Park.jpg",
      altText: "The Comal River in Landa Park, New Braunfels",
      caption: "The Comal River in Landa Park, New Braunfels",
      isPrimary: true,
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Comal_River_in_Landa_Park.jpg",
      attribution: "Wikimedia Commons • CC BY 4.0",
      license: "CC BY 4.0",
    },
    {
      kind: "image",
      url: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Guadalupe_river_new_braunfels_north.jpg",
      altText: "The Guadalupe River viewed from the Faust Street Bridge in New Braunfels",
      caption: "The Guadalupe River viewed from the Faust Street Bridge in New Braunfels",
      isPrimary: false,
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Guadalupe_river_new_braunfels_north.jpg",
      attribution: "Larry D. Moore / Wikimedia Commons • CC BY 4.0",
      license: "CC BY 4.0",
    },
    {
      kind: "image",
      url: "https://upload.wikimedia.org/wikipedia/commons/8/88/Revised%2C_Gruene_Hall%2C_Comal_County%2C_TX_IMG_5512.JPG",
      altText: "Gruene Hall in the historic Gruene district of New Braunfels",
      caption: "Gruene Hall in the historic Gruene district of New Braunfels",
      isPrimary: false,
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Revised,_Gruene_Hall,_Comal_County,_TX_IMG_5512.JPG",
      attribution: "Billy Hathorn / Wikimedia Commons • CC BY-SA 3.0",
      license: "CC BY-SA 3.0",
    },
    {
      kind: "image",
      url: "https://upload.wikimedia.org/wikipedia/commons/0/0f/New_Braunfels_Centennial_Monument_Close.jpg",
      altText: "The New Braunfels Centennial Monument in Landa Park",
      caption: "The New Braunfels Centennial Monument in Landa Park",
      isPrimary: false,
      sourceUrl: "https://commons.wikimedia.org/wiki/File:New_Braunfels_Centennial_Monument_Close.jpg",
      attribution: "Wikimedia Commons • CC BY 4.0",
      license: "CC BY 4.0",
    },
    {
      kind: "image",
      url: "https://upload.wikimedia.org/wikipedia/commons/3/3b/Founders_Oak_New_Braunfels_TX_2015.jpg",
      altText: "Founders Oak in Landa Park, New Braunfels",
      caption: "Founders Oak in Landa Park, New Braunfels",
      isPrimary: false,
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Founders_Oak_New_Braunfels_TX_2015.jpg",
      attribution: "Wikimedia Commons • CC BY 4.0",
      license: "CC BY 4.0",
    },
  ],
  monthlyBudgets: [
    { label: "Single resident", amount: "$1,600–$2,800/month", note: "A practical long-stay budget for New Braunfels with a simple apartment and regular local dining." },
    { label: "Couple", amount: "$2,500–$4,200/month", note: "A comfortable range that supports housing flexibility and a stronger dining and recreation mix." },
  ],
  costOfLivingProfile: {
    summary: "New Braunfels is usually more affordable than many Texas Hill Country lifestyle markets, while still carrying costs linked to river access, historic districts, and growth.",
    currency: "USD",
    methodology: "Workbook-informed expectations for a practical long-stay household budget.",
    confidence: "medium",
    assumptions: ["Single resident or small household", "Neighborhood choice affects the final monthly spend"],
    budgets: [
      { label: "Single resident", amount: "$1,600–$2,800/month", note: "Practical monthly budget for a simple apartment and regular local dining." },
      { label: "Couple", amount: "$2,500–$4,200/month", note: "Comfortable range with more flexibility for dining and recreation." },
    ],
    categories: [
      { key: "housing", label: "Housing", amount: "$1,400–$2,200/month", note: "Apartment or condo budget in a practical district." },
      { key: "food", label: "Food", amount: "$350–$700/month", note: "Groceries and local dining mix." },
      { key: "transport", label: "Transport", amount: "$150–$400/month", note: "Local travel, occasional rides, and regional movement." },
    ],
  },
  officialTourismUrl: "https://www.playinnewbraunfels.com/",
  googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=New%20Braunfels%20TX",
  googleEarthUrl: "https://earth.google.com/web/search/New%20Braunfels%20Texas",
  wikipediaUrl: "https://en.wikipedia.org/wiki/New_Braunfels,_Texas",
  youtubeUrl: "https://www.youtube.com/results?search_query=New%20Braunfels%20Texas%20travel%20guide",
  tiktokUrl: "https://www.tiktok.com/search?q=New%20Braunfels%20Texas",
  instagramUrl: "https://www.instagram.com/explore/tags/newbraunfels",
  webcamUrl: "https://www.google.com/search?q=New%20Braunfels%20Texas%20webcam",
  neighborhoodIntelligence: [
    {
      category: "Restaurants",
      neighborhoodName: "Gruene Historic District",
      places: [
        {
          id: "gruene-gristmill",
          name: "The Gristmill Restaurant & Bar",
          category: "Restaurants",
          neighborhoodName: "Gruene Historic District",
          description: "Historic riverfront restaurant and an iconic first-stop experience in Gruene.",
          whyItMatters: "It anchors the district’s identity and gives the area one of its clearest local rituals.",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Gristmill%20River%20Restaurant%20%26%20Bar%20New%20Braunfels%20TX",
          websiteUrl: "https://gristmillrestaurant.com/",
          verified: true,
        },
        {
          id: "gruene-hall",
          name: "Gruene Hall",
          category: "Live Music",
          neighborhoodName: "Gruene Historic District",
          description: "The signature live-music venue and cultural anchor for Gruene.",
          whyItMatters: "It gives the district a strong nightlife and cultural identity that extends beyond tourism.",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Gruene%20Hall%20New%20Braunfels%20TX",
          websiteUrl: "https://gruenehall.com/",
          verified: true,
        },
      ],
    },
    {
      category: "Healthcare",
      neighborhoodName: "Downtown New Braunfels",
      places: [
        {
          id: "resolute-hospital",
          name: "Resolute Baptist Hospital",
          category: "Healthcare",
          neighborhoodName: "Downtown New Braunfels",
          description: "A major local hospital for emergency, specialty, and long-stay healthcare needs.",
          whyItMatters: "It is one of the clearest practical anchors for relocation and healthcare planning.",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Resolute%20Baptist%20Hospital%20New%20Braunfels%20TX",
          websiteUrl: "https://www.baptisthealthsystem.com/locations/detail/resolute-baptist-hospital",
          verified: true,
        },
      ],
    },
  ],
};

const normalizeSlug = (slug: string) => slug.trim().toLowerCase();

export function getWorkbookFallbackDestinationData(slug: string): WorkbookFallbackDestinationData | null {
  const normalized = normalizeSlug(slug);
  if (!normalized) {
    return null;
  }

  const aliases = [
    normalized,
    normalized.replace(/-texas-united-states$/, ""),
    normalized.replace(/-tx-us$/, ""),
    normalized.replace(/-texas$/, ""),
    normalized.replace(/-united-states$/, ""),
    normalized.replace(/-us$/, ""),
  ];

  return aliases.some((alias) => alias === "new-braunfels" || alias === "new-braunfels-texas" || alias === "new-braunfels-tx-us" || alias === "new-braunfels-texas-united-states")
    ? NEW_BRAUNFELS_FALLBACK_DATA
    : null;
}
