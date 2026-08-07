import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CanonicalDestinationPage from "./CanonicalDestinationPage";
import type { CanonicalDestination } from "../../lib/canonical-destination-model";
import { buildNeighborhoodIntelligenceSeedData } from "../../lib/neighborhood-intelligence-seed-data";
import { isPlaceWebsiteVisible } from "../../lib/website-verification";

const buildDestination = (): CanonicalDestination => ({
  slug: "spearfish-south-dakota-united-states",
  city: "Spearfish",
  country: "United States",
  title: "Spearfish",
  subtitle: "Spearfish, United States",
  heroNarrative: "A mountain town shaped by canyon scenery and a small-city rhythm.",
  overview: "A practical Black Hills destination for people who want outdoor access and a slower pace.",
  editorial: "The town feels most compelling when daily life is tied to canyon access and local routines.",
  whyThisPlaceFeelsDistinct: "The canyon setting gives the town a strong identity.",
  dailyLife: "Daily life is anchored by outdoors, local services, and nearby regional access.",
  climate: "Semi-arid continental climate with warm summers and cold winters.",
  transportation: "Regional gateway access matters more than local transit density.",
  healthcare: "Healthcare is a planning variable and should be validated locally.",
  costOfLiving: "Moderate cost structure with strong value if you accept a smaller city lifestyle.",
  walkability: "Downtown is more practical than the broader region.",
  internet: "Connectivity is practical but should be checked at home level.",
  safety: "The town reads as a lower-pressure destination with strong daily calm.",
  neighborhoods: [],
  restaurants: [],
  museums: [],
  golf: [],
  beaches: [],
  outdoorRecreation: [],
  pros: [],
  cons: [],
  retirement: "Strong for slower-paced retirement planning.",
  digitalNomad: "Moderate fit for remote work with local tradeoffs.",
  family: "Reasonable family fit for outdoor-oriented households.",
  weather: "Cold winters and warm summers.",
  monthlyBudgets: [],
  airportInfo: "Regional gateway access.",
  googleMapsUrl: "https://maps.google.com",
  googleEarthUrl: "https://earth.google.com",
  officialTourismUrl: "https://example.com/tourism",
  wikipediaUrl: "https://en.wikipedia.org/wiki/Spearfish,_South_Dakota",
  youtubeUrl: "https://youtube.com",
  tiktokUrl: "https://tiktok.com",
  instagramUrl: "https://instagram.com",
  webcamUrl: "https://example.com/webcam",
  resources: [],
  realEstateResources: [],
  rentalResources: [],
  healthcareResources: [],
  visaResources: [],
  weatherResources: [],
  structuredResources: [],
  videos: [],
  media: [],
  heroImages: [],
  mediaGallery: [],
  sections: {},
  ai: {
    status: "completed",
    version: "v0",
    lastUpdated: "2026-01-01",
    confidenceScore: 0.75,
    sourcesUsed: [],
    missingSections: [],
    promptVersion: "test",
    researchTimestamp: "2026-01-01",
  },
  scoring: [],
  aiScoringExplanation: "The scoring framework highlights outdoor access and slower pacing.",
});

describe("CanonicalDestinationPage", () => {
  it("renders a destination guide section for Spearfish", () => {
    render(<CanonicalDestinationPage destination={buildDestination()} />);

    expect(screen.getByText("Destination Guide")).toBeInTheDocument();
    expect(screen.getByText(/A magazine-style introduction to Spearfish/i)).toBeInTheDocument();
    expect(screen.getByText(/What to know first/i)).toBeInTheDocument();
  });

  it("renders the segmented destination views and executive summary", () => {
    render(<CanonicalDestinationPage destination={buildDestination()} />);

    expect(screen.getByRole("tab", { name: /Destination Guide/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Premium Profile/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Deep Dive/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Executive summary/i).length).toBeGreaterThan(0);
  });

  it("renders premium editorial content from a destination's structured source data", () => {
    const chicagoDestination = buildDestination();
    chicagoDestination.slug = "chicago-illinois-united-states";
    chicagoDestination.city = "Chicago";
    chicagoDestination.country = "United States";
    chicagoDestination.title = "Chicago, Illinois";
    chicagoDestination.subtitle = "A premium big-city base for culture, healthcare, sports, and daily life that still feels grounded in neighborhood character.";
    chicagoDestination.heroNarrative = "Chicago is one of the few North American cities where the everyday experience can feel as compelling as the skyline.";
    chicagoDestination.overview = "Chicago is best understood as a city of distinct districts rather than a single center.";
    chicagoDestination.neighborhoods = ["Lakeview", "West Loop", "Lincoln Park"];
    chicagoDestination.monthlyBudgets = [{ label: "Single resident", amount: "$2,400–$3,800/month", note: "Comfortable monthly budget for Chicago." }];
    chicagoDestination.premiumEditorialContent = {
      heroIntroduction: "Chicago is one of the most rewarding cities in North America for people willing to think beyond its reputation.",
      whyPeopleLoveIt: ["The city has a striking mix of monumental architecture and ordinary neighborhood life."],
      overviewArticle: "Chicago is not a city that should be understood through a single landmark or a single weekend itinerary.",
      dailyLifeArticle: "Daily life in Chicago is shaped by the fact that the city is simultaneously impersonal and deeply local.",
      climateArticle: "Chicago’s climate creates a very specific form of urban life.",
      transportationArticle: "Chicago’s transportation system is one of its strongest long-stay assets.",
      costOfLivingArticle: "Chicago is often described as more affordable than coastal gateway cities, but the details matter.",
      healthcareArticle: "Chicago’s healthcare reputation is not just theoretical.",
      retirementGuide: "Chicago is a very credible retirement city for people who want urban life, cultural depth, and strong healthcare access rather than a conventional retirement resort.",
      familyGuide: "Chicago can be a very strong family city when the household values museums, parks, schools, and a dense but not overly suburban urban environment.",
      digitalNomadGuide: "Chicago is especially compelling for digital nomads who want a city with an actual social rhythm.",
    };

    render(<CanonicalDestinationPage destination={chicagoDestination} />);

    expect(screen.getAllByText(/Chicago, Illinois/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Chicago is one of the most rewarding cities/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/The city has a striking mix/i).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("tab", { name: /Premium Profile/i }));
    expect(screen.getByText(/How the city is experienced block by block/i)).toBeInTheDocument();
    expect(screen.getByText("Lakeview")).toBeInTheDocument();
    expect(screen.getByText(/Neighborhood summary/i)).toBeInTheDocument();
    expect(screen.queryByText("Canonical content layer")).not.toBeInTheDocument();
    expect(screen.getAllByText(/Premium Profile/i).length).toBeGreaterThan(0);
  });

  it("renders a structured cost-of-living profile from destination data", () => {
    const destination = buildDestination();
    destination.city = "Chicago";
    destination.country = "United States";
    destination.title = "Chicago";
    destination.costOfLiving = "Chicago sits in the middle of the cost spectrum for major U.S. cities.";
    destination.costOfLivingProfile = {
      summary: "Chicago is a mid-market city for long-stay residents who value strong transit and neighborhood choice.",
      currency: "USD",
      methodology: "Modeled from housing, groceries, transit, and healthcare assumptions for a single resident.",
      confidence: "high",
      assumptions: ["Single resident living in a central district"],
      budgets: [{ id: "single", label: "Single resident", amount: "$2,400–$3,800/month", note: "Comfortable monthly budget" }],
      categories: [{ key: "housing", label: "Housing", amount: "$1,400–$2,300/month", note: "A practical apartment budget" }],
    };

    render(<CanonicalDestinationPage destination={destination} />);

    expect(screen.getByText(/Cost of living snapshot/i)).toBeInTheDocument();
    expect(screen.getByText(/Monthly cost breakdown/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Chicago is a mid-market city/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Housing").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$1,400–$2,300/month").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Single resident").length).toBeGreaterThan(0);
  });

  it("renders a destination-specific placeholder when a destination has no verified media", () => {
    const destination = buildDestination();
    destination.slug = "brand-new-island-city";
    destination.city = "Brand New Island";
    destination.country = "Atlantis";
    destination.title = "Brand New Island";

    render(<CanonicalDestinationPage destination={destination} />);

    expect(screen.getAllByRole("img", { name: /Brand New Island/i }).length).toBeGreaterThan(0);
    expect(screen.getByText(/Editorial destination placeholder/i)).toBeInTheDocument();
  });

  it("shows a view-more gallery control when a destination has more than five verified images", () => {
    const destination = buildDestination();
    destination.slug = "chicago-illinois-united-states";
    destination.city = "Chicago";
    destination.country = "United States";
    destination.title = "Chicago";
    destination.heroImages = Array.from({ length: 6 }, (_, index) => ({
      url: `https://upload.wikimedia.org/wikipedia/commons/thumb/${index + 1}/image-${index + 1}.jpg/1280px-image-${index + 1}.jpg`,
      altText: `Chicago image ${index + 1}`,
    }));

    render(<CanonicalDestinationPage destination={destination} />);

    expect(screen.getByRole("button", { name: /view more images/i })).toBeInTheDocument();
  });

  it("shows neighborhood resource groups and intelligence for any destination", () => {
    const destination = buildDestination();
    destination.city = "Bangkok";
    destination.country = "Thailand";
    destination.title = "Bangkok";
    destination.neighborhoods = ["Sukhumvit"];
    destination.resources = [{ label: "Sukhumvit neighborhood guide", url: "https://example.com/sukhumvit", category: "Neighborhood Guide" }];
    destination.knowledgeProfile = {
      ...destination.knowledgeProfile,
      walkability: "Very strong",
      bikeFriendliness: "Good",
      publicTransportation: "Excellent",
      coffeeShops: ["A", "B"],
    };

    render(<CanonicalDestinationPage destination={destination} />);
    fireEvent.click(screen.getByRole("tab", { name: /Premium Profile/i }));
    fireEvent.click(screen.getByRole("button", { name: /Explore/i }));

    expect(screen.getAllByRole("link", { name: /Google Maps/i }).length).toBeGreaterThan(0);
    expect(screen.getByText(/Neighborhood intelligence/i)).toBeInTheDocument();
    expect(screen.getByText(/Overall neighborhood score/i)).toBeInTheDocument();
  });

  it("avoids rendering neighborhood names or category labels as fake place cards", () => {
    const destination = buildDestination();
    destination.city = "Chicago";
    destination.country = "United States";
    destination.title = "Chicago";
    destination.neighborhoods = ["Lincoln Park"];
    destination.neighborhoodIntelligence = [
      {
        category: "Coffee Shops",
        destinationName: "Chicago",
        neighborhoodName: "Lincoln Park",
        places: [
          {
            id: "place-1",
            name: "Lincoln Park",
            category: "Coffee Shops",
            destinationName: "Chicago",
            neighborhoodName: "Lincoln Park",
            description: "Neighborhood reference",
            whyItMatters: "This should not be treated as a place.",
            verified: false,
            googleMapsUrl: "https://maps.google.com/?q=Lincoln%20Park%20Chicago",
          },
        ],
      },
    ];

    render(<CanonicalDestinationPage destination={destination} />);
    fireEvent.click(screen.getByRole("tab", { name: /Premium Profile/i }));
    fireEvent.click(screen.getByRole("button", { name: /Explore/i }));

    expect(screen.queryByRole("button", { name: /Lincoln Park/i })).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Explore coffee shops in Lincoln Park/i }).length).toBeGreaterThan(0);
  });

  it("renders verified Chicago place cards from neighborhood intelligence seed data", () => {
    const chicagoDestination = buildDestination();
    chicagoDestination.slug = "chicago-illinois-united-states";
    chicagoDestination.city = "Chicago";
    chicagoDestination.country = "United States";
    chicagoDestination.title = "Chicago";
    chicagoDestination.overview = "Chicago is best understood as a city of distinct districts rather than a single center.";
    chicagoDestination.neighborhoods = ["Lincoln Park"];

    render(<CanonicalDestinationPage destination={chicagoDestination} />);
    fireEvent.click(screen.getByRole("tab", { name: /Premium Profile/i }));
    fireEvent.click(screen.getByRole("button", { name: /Explore/i }));

    expect(screen.getAllByText(/Colectivo Coffee Lincoln Park/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Lincoln Park/i).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /Google Maps/i }).length).toBeGreaterThan(0);
  });

  it("renders structured premium neighborhood sections for Chicago neighborhoods", () => {
    const chicagoDestination = buildDestination();
    chicagoDestination.slug = "chicago-illinois-united-states";
    chicagoDestination.city = "Chicago";
    chicagoDestination.country = "United States";
    chicagoDestination.title = "Chicago";
    chicagoDestination.overview = "Chicago is best understood as a city of distinct districts rather than a single center.";
    chicagoDestination.neighborhoods = ["Lincoln Park", "West Loop", "Wicker Park"];

    render(<CanonicalDestinationPage destination={chicagoDestination} />);
    fireEvent.click(screen.getByRole("tab", { name: /Premium Profile/i }));

    expect(screen.getAllByText(/Signature streets/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Restaurants/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Coffee shops/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Parks & green spaces/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Lincoln Park/i).length).toBeGreaterThan(0);
  });

  it("uses a true Shopping group for West Loop instead of coffee-shop content", () => {
    const destination = buildDestination();
    destination.city = "Chicago";
    destination.country = "United States";
    destination.title = "Chicago";
    destination.neighborhoods = ["West Loop"];
    destination.neighborhoodIntelligence = [
      {
        category: "Coffee Shops",
        destinationName: "Chicago",
        neighborhoodName: "West Loop",
        places: [
          {
            id: "coffee-1",
            name: "Intelligentsia Coffee",
            category: "Coffee Shops",
            destinationName: "Chicago",
            neighborhoodName: "West Loop",
            description: "A café",
            whyItMatters: "A coffee venue",
            verified: true,
            googleMapsUrl: "https://maps.google.com/?q=Intelligentsia+Coffee",
          },
        ],
      },
      {
        category: "Shopping",
        destinationName: "Chicago",
        neighborhoodName: "West Loop",
        places: [
          {
            id: "shop-1",
            name: "Fulton Market Design Shops",
            category: "Shopping",
            destinationName: "Chicago",
            neighborhoodName: "West Loop",
            description: "A retail corridor",
            whyItMatters: "A shopping destination",
            verified: true,
            googleMapsUrl: "https://maps.google.com/?q=Fulton+Market+Design+Shops",
          },
        ],
      },
    ];

    render(<CanonicalDestinationPage destination={destination} />);
    fireEvent.click(screen.getByRole("tab", { name: /Premium Profile/i }));
    fireEvent.click(screen.getByRole("button", { name: /Explore/i }));

    const shoppingCard = screen.getByText("Shopping").closest("div");

    expect(shoppingCard).toHaveTextContent("Fulton Market Design Shops");
    expect(shoppingCard).not.toHaveTextContent("Intelligentsia Coffee");
  });

  it("shows the website action when a place has a verified direct website URL", () => {
    const destination = buildDestination();
    destination.city = "Chicago";
    destination.country = "United States";
    destination.title = "Chicago";
    destination.neighborhoods = ["Hyde Park"];
    destination.neighborhoodIntelligence = [
      {
        category: "Restaurants",
        destinationName: "Chicago",
        neighborhoodName: "Hyde Park",
        places: [
          {
            id: "place-1",
            name: "The Promontory",
            category: "Restaurants",
            destinationName: "Chicago",
            neighborhoodName: "Hyde Park",
            description: "A restaurant and event venue.",
            whyItMatters: "An example of a place with an unverified website.",
            verified: true,
            googleMapsUrl: "https://maps.google.com/?q=The+Promontory+Chicago",
            websiteUrl: "https://example.com/parked",
            websiteVerified: true,
            websiteStatus: "verified",
          },
        ],
      },
    ];

    render(<CanonicalDestinationPage destination={destination} />);
    fireEvent.click(screen.getByRole("tab", { name: /Premium Profile/i }));
    fireEvent.click(screen.getByRole("button", { name: /Explore/i }));
    fireEvent.click(screen.getByRole("button", { name: /Open/i }));

    expect(screen.getAllByText("The Promontory").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /Visit website/i })).toBeInTheDocument();
  });

  it("shows the website action when a place has a live redirected URL", () => {
    const place = {
      id: "place-3",
      name: "Museum of Science and Industry",
      category: "Attractions",
      destinationName: "Chicago",
      neighborhoodName: "Hyde Park",
      description: "A major attraction with a redirecting website.",
      whyItMatters: "An example of a place whose live redirect should still surface the site.",
      verified: true,
      googleMapsUrl: "https://maps.google.com/?q=Museum+of+Science+and+Industry+Chicago",
      websiteUrl: "https://www.msichicago.org/",
      websiteVerified: true,
      websiteStatus: "redirected",
    };

    expect(isPlaceWebsiteVisible(place)).toBe(true);
  });

  it("hides the website action when a place website is broken", () => {
    const destination = buildDestination();
    destination.city = "Chicago";
    destination.country = "United States";
    destination.title = "Chicago";
    destination.neighborhoods = ["Hyde Park"];
    destination.neighborhoodIntelligence = [
      {
        category: "Coffee Shops",
        destinationName: "Chicago",
        neighborhoodName: "Hyde Park",
        places: [
          {
            id: "place-2",
            name: "Inkling Coffee Hyde Park",
            category: "Coffee Shops",
            destinationName: "Chicago",
            neighborhoodName: "Hyde Park",
            description: "A coffee shop with a dead website.",
            whyItMatters: "An example of a place whose website should not be surfaced.",
            verified: true,
            googleMapsUrl: "https://maps.google.com/?q=Inkling+Coffee+Hyde+Park",
            websiteUrl: "https://inklingcoffee.com/",
            websiteVerified: false,
            websiteStatus: "broken",
          },
        ],
      },
    ];

    render(<CanonicalDestinationPage destination={destination} />);
    fireEvent.click(screen.getByRole("tab", { name: /Premium Profile/i }));
    fireEvent.click(screen.getByRole("button", { name: /Explore/i }));
    fireEvent.click(screen.getByRole("button", { name: /Open/i }));

    expect(screen.queryByRole("link", { name: /Visit website/i })).not.toBeInTheDocument();
  });

  it("keeps Chicago neighborhood records category-correct and placeholder-free", () => {
    const intelligence = buildNeighborhoodIntelligenceSeedData({
      city: "Chicago",
      country: "United States",
      title: "Chicago",
      slug: "chicago-illinois-united-states",
      knowledgeProfile: {},
    });

    const neighborhoods = ["Lincoln Park", "Lakeview", "Hyde Park", "West Loop", "River North", "Wicker Park", "Gold Coast", "Pilsen"];

    neighborhoods.forEach((neighborhood) => {
      const groups = intelligence.filter((group) => group.neighborhoodName === neighborhood);
      expect(groups.length).toBeGreaterThanOrEqual(8);

      const restaurants = groups.find((group) => group.category === "Restaurants");
      const coffee = groups.find((group) => group.category === "Coffee Shops");
      const shopping = groups.find((group) => group.category === "Shopping");
      const parks = groups.find((group) => group.category === "Parks & Green Spaces");
      const transit = groups.find((group) => group.category === "Transit");

      expect(restaurants?.places?.length).toBeGreaterThanOrEqual(1);
      expect(coffee?.places?.length).toBeGreaterThanOrEqual(1);
      expect(shopping?.places?.length).toBeGreaterThanOrEqual(1);
      expect(parks?.places?.length).toBeGreaterThanOrEqual(1);
      expect(transit?.places?.length).toBeGreaterThanOrEqual(1);

      const allPlaces = groups.flatMap((group) => group.places ?? []);
      const combinedText = allPlaces.map((place) => `${place.name}: ${place.description}`).join(" ");
      expect(combinedText).not.toMatch(/coming soon|being refined|additional neighborhood/i);
      expect(allPlaces.every((place) => place.googleMapsUrl?.startsWith("https://"))).toBe(true);
      expect(shopping?.places?.every((place) => !/coffee/i.test(place.name))).toBe(true);
      expect(allPlaces.some((place) => place.googleMapsUrl?.startsWith("https://"))).toBe(true);
    });
  });

  it("shows curated Chicago imagery in the executive summary and gallery", () => {
    const chicagoDestination = buildDestination();
    chicagoDestination.slug = "chicago-illinois-united-states";
    chicagoDestination.city = "Chicago";
    chicagoDestination.country = "United States";
    chicagoDestination.title = "Chicago";
    chicagoDestination.overview = "Chicago is best understood as a city of distinct districts rather than a single center.";

    render(<CanonicalDestinationPage destination={chicagoDestination} />);

    const images = screen.getAllByRole("img");
    const chicagoImages = images.filter((image) => image.getAttribute("src")?.includes("upload.wikimedia.org") || image.getAttribute("src")?.includes("data:image"));

    expect(chicagoImages.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/Featured image/i)).toBeInTheDocument();
  });
});
