import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CanonicalDestinationPage from "./CanonicalDestinationPage";
import type { CanonicalDestination } from "../../lib/canonical-destination-model";
import { buildNeighborhoodIntelligenceSeedData } from "../../lib/neighborhood-intelligence-seed-data";
import { isPlaceWebsiteVisible } from "../../lib/website-verification";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

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
  beforeEach(() => {
    window.localStorage.clear();
  });

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

  it("switches to the premium profile view when the tab receives a pointer interaction", () => {
    render(<CanonicalDestinationPage destination={buildDestination()} />);

    fireEvent.pointerDown(screen.getByRole("tab", { name: /Premium Profile/i }));

    expect(screen.getByText(/Premium intelligence/i)).toBeInTheDocument();
    expect(screen.getByText(/Scores and fit/i)).toBeInTheDocument();
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
    expect(screen.getAllByText("Lakeview").length).toBeGreaterThan(0);
    expect(screen.getByText(/Neighborhood summary/i)).toBeInTheDocument();
    expect(screen.queryByText("Canonical content layer")).not.toBeInTheDocument();
    expect(screen.getAllByText(/Premium Profile/i).length).toBeGreaterThan(0);
  });

  it("uses category-specific content rather than reusing the general overview for category cards", () => {
    const destination = buildDestination();
    destination.overview = "This is the general destination overview that should not be reused for unrelated category cards.";
    destination.heroNarrative = "A destination narrative that should stay in the hero and overview sections.";
    destination.dailyLife = "A daily-life description that should remain distinct from category cards.";

    render(<CanonicalDestinationPage destination={destination} />);

    const populationCard = screen.getAllByText("Population")[0].closest("div");
    const golfCard = screen.getAllByText("Golf")[0].closest("div");

    expect(populationCard?.textContent).toContain("Detailed category information is not available yet.");
    expect(populationCard?.textContent).not.toContain("This is the general destination overview that should not be reused for unrelated category cards.");
    expect(golfCard?.textContent).toContain("Detailed category information is not available yet.");
    expect(golfCard?.textContent).not.toContain("This is the general destination overview that should not be reused for unrelated category cards.");
  });

  it("renders structured factual intelligence from the canonical knowledge profile in the existing essential-facts cards", () => {
    const destination = buildDestination();
    destination.knowledgeProfile = {
      population: "110000",
      metroPopulation: "San Antonio–New Braunfels metro",
      elevation: "192 m",
      timeZone: "America/Chicago",
      rainfall: "884 mm/month",
      sunshineHours: "2,500 hrs/month",
      humidity: "65%",
      majorAirports: ["San Antonio International Airport", "Austin-Bergstrom International Airport"],
      majorHospitals: ["Resolute Baptist Hospital"],
    };

    render(<CanonicalDestinationPage destination={destination} />);

    expect(screen.getAllByText("Population")[0].closest("div")?.textContent).toContain("110,000");
    expect(screen.getAllByText("Metro population")[0].closest("div")?.textContent).toContain("San Antonio–New Braunfels metro");
    expect(screen.getAllByText("Elevation")[0].closest("div")?.textContent).toContain("192 m");
    expect(screen.getAllByText("Time zone")[0].closest("div")?.textContent).toContain("America/Chicago");
    expect(screen.getAllByText("Climate")[0].closest("div")?.textContent).toContain("884 mm/month");
    expect(screen.getAllByText("Airport access")[0].closest("div")?.textContent).toContain("San Antonio International Airport");
    expect(screen.getAllByText("Healthcare")[0].closest("div")?.textContent).toContain("Resolute Baptist Hospital");
  });

  it("surfaces named healthcare resources already present in the canonical payload instead of falling back to generic copy", () => {
    const destination = buildDestination();
    destination.healthcare = "Healthcare access is a major strength for long-stay households.";
    destination.healthcareResources = [{
      category: "healthcare",
      label: "Resolute Baptist Hospital",
      provider: "Resolute Baptist Hospital",
      url: "https://example.com/resolute",
    }];

    render(<CanonicalDestinationPage destination={destination} />);

    expect(screen.getAllByText("Healthcare")[0].closest("div")?.textContent).toContain("Resolute Baptist Hospital");
    expect(screen.getAllByText("Healthcare")[0].closest("div")?.textContent).not.toContain("Healthcare access is a major strength");
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

  it("renders workbook-backed neighborhood profiles and resources in the premium view", () => {
    const destination = buildDestination();
    destination.city = "New Braunfels";
    destination.country = "United States";
    destination.title = "New Braunfels";
    destination.neighborhoods = ["Gruene Historic District"];
    destination.neighborhoodProfiles = [{
      name: "Gruene Historic District",
      summary: "A historic district with live music, river access, and a slower pace.",
      resources: [{ category: "guide", label: "Gruene live music guide", url: "https://example.com/gruene", kind: "dataset" }],
      intelligence: [{ key: "walkability", label: "Walkability", value: "Strong", description: "The district is highly walkable for a weekend and a long stay." }],
    }];

    render(<CanonicalDestinationPage destination={destination} />);
    fireEvent.click(screen.getByRole("tab", { name: /Premium Profile/i }));

    expect(screen.getAllByText(/A historic district with live music/i).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /Gruene live music guide/i }).length).toBeGreaterThan(0);
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
    const exploreButtons = screen.getAllByRole("button", { name: /Explore/i });
    expect(exploreButtons.length).toBeGreaterThan(0);
    fireEvent.click(exploreButtons[0]);

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

  it("renders Bangkok neighborhood intelligence with Bangkok-specific place names and healthcare content", () => {
    const bangkokDestination = buildDestination();
    bangkokDestination.slug = "bangkok-thailand";
    bangkokDestination.city = "Bangkok";
    bangkokDestination.country = "Thailand";
    bangkokDestination.title = "Bangkok, Thailand";
    bangkokDestination.overview = "Bangkok rewards residents who choose the right neighborhood for daily life.";
    bangkokDestination.neighborhoods = ["Sathorn", "Silom", "Thonglor"];

    render(<CanonicalDestinationPage destination={bangkokDestination} />);
    fireEvent.click(screen.getByRole("tab", { name: /Premium Profile/i }));
    const exploreButtons = screen.getAllByRole("button", { name: /Explore/i });
    expect(exploreButtons.length).toBeGreaterThan(0);
    fireEvent.click(exploreButtons[0]);

    expect(screen.getAllByText(/Sathorn/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Restaurants/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Healthcare/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Bumrungrad International Hospital/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Siam Paragon/i).length).toBeGreaterThan(0);
  });

  it("builds distinct Bangkok neighborhoods with richer place intelligence than the generic fallback state", () => {
    const intelligence = buildNeighborhoodIntelligenceSeedData({
      city: "Bangkok",
      country: "Thailand",
      title: "Bangkok",
      slug: "bangkok-thailand",
      knowledgeProfile: {},
    });

    const groupsByNeighborhood = (neighborhood: string) => intelligence.filter((group) => group.neighborhoodName === neighborhood);

    const silom = groupsByNeighborhood("Silom");
    const thonglor = groupsByNeighborhood("Thonglor");
    const phromPhong = groupsByNeighborhood("Phrom Phong");
    const asoke = groupsByNeighborhood("Asoke");
    const ari = groupsByNeighborhood("Ari");
    const riverside = groupsByNeighborhood("Riverside");
    const onNut = groupsByNeighborhood("On Nut");
    const sukhumvit = groupsByNeighborhood("Sukhumvit");
    const chinatown = groupsByNeighborhood("Chinatown");

    expect(silom.some((group) => group.category === "Nightlife" && (group.places ?? []).length > 0)).toBe(true);
    expect(silom.some((group) => group.category === "Remote-Work-Friendly Places" && (group.places ?? []).length > 0)).toBe(true);
    expect(silom.some((group) => group.category === "Healthcare" && (group.places ?? []).length > 0)).toBe(true);

    expect(thonglor.some((group) => group.category === "Nightlife" && (group.places ?? []).length > 0)).toBe(true);
    expect(phromPhong.some((group) => group.category === "Shopping" && (group.places ?? []).length > 0)).toBe(true);
    expect(asoke.some((group) => group.category === "Transit" && (group.places ?? []).length > 0)).toBe(true);
    expect(ari.some((group) => group.category === "Family-Friendly Places" && (group.places ?? []).length > 0)).toBe(true);
    expect(riverside.some((group) => group.category === "Attractions" && (group.places ?? []).length > 0)).toBe(true);
    expect(onNut.some((group) => group.category === "Shopping" && (group.places ?? []).length > 0)).toBe(true);
    expect(sukhumvit.some((group) => group.category === "Restaurants" && (group.places ?? []).length > 0)).toBe(true);
    expect(sukhumvit.some((group) => group.category === "Transit" && (group.places ?? []).length > 0)).toBe(true);
    expect(chinatown.some((group) => group.category === "Restaurants" && (group.places ?? []).length > 0)).toBe(true);
    expect(chinatown.some((group) => group.category === "Attractions" && (group.places ?? []).length > 0)).toBe(true);

    const allPlaces = [...silom, ...thonglor, ...phromPhong, ...asoke, ...ari, ...riverside, ...onNut, ...sukhumvit, ...chinatown]
      .flatMap((group) => group.places ?? [])
      .filter((place) => Boolean(place.name));

    expect(allPlaces.length).toBeGreaterThan(40);
    expect(new Set(allPlaces.map((place) => place.name)).size).toBeGreaterThan(20);
    expect(allPlaces.every((place) => place.googleMapsUrl?.startsWith("https://"))).toBe(true);
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

  it("renders golf courses as a place-level neighborhood category with rich detail", () => {
    const destination = buildDestination();
    destination.city = "Bangkok";
    destination.country = "Thailand";
    destination.title = "Bangkok";
    destination.neighborhoods = ["Sathorn"];
    destination.neighborhoodIntelligence = [
      {
        category: "Golf Courses",
        destinationName: "Bangkok",
        neighborhoodName: "Sathorn",
        places: [
          {
            id: "golf-1",
            name: "Royal Bangkok Sports Club",
            category: "Golf Courses",
            destinationName: "Bangkok",
            neighborhoodName: "Sathorn",
            description: "A private club with a classic layout and strong resident appeal.",
            whyItMatters: "An example of a nearby golf option that should surface for the neighborhood.",
            verified: true,
            googleMapsUrl: "https://maps.google.com/?q=Royal+Bangkok+Sports+Club",
            websiteUrl: "https://www.rbsclub.com/",
            websiteVerified: true,
            websiteStatus: "verified",
            courseType: "Private club",
            publicStatus: "Private",
            holes: "18",
            priceContext: "Green fees vary by day and membership status.",
            amenities: "Driving range, clubhouse, practice facilities",
            relationshipToNeighborhood: "Nearby golf option for Sathorn residents",
            source: "Verified neighborhood reference",
          },
        ],
      },
    ];

    render(<CanonicalDestinationPage destination={destination} />);
    fireEvent.click(screen.getByRole("tab", { name: /Premium Profile/i }));
    fireEvent.click(screen.getByRole("button", { name: /Explore/i }));
    fireEvent.click(screen.getByRole("button", { name: /Open/i }));

    expect(screen.getAllByText(/Golf courses/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Royal Bangkok Sports Club/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Private/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/18/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /Open on Google Maps/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Visit website/i })).toBeInTheDocument();
  });

  it("labels off-neighborhood golf groups as nearby golf courses", () => {
    const destination = buildDestination();
    destination.city = "Chicago";
    destination.country = "United States";
    destination.title = "Chicago";
    destination.neighborhoods = ["Lincoln Park"];
    destination.neighborhoodIntelligence = [
      {
        category: "Golf Courses",
        destinationName: "Chicago",
        neighborhoodName: "Lakeview",
        places: [
          {
            id: "golf-2",
            name: "Lakeview Golf Club",
            category: "Golf Courses",
            destinationName: "Chicago",
            neighborhoodName: "Lakeview",
            description: "A premium nearby course that should surface in the Lincoln Park neighborhood guide.",
            whyItMatters: "This reinforces how golf can be presented as a nearby lifestyle signal rather than a local-only amenity.",
            verified: true,
            googleMapsUrl: "https://maps.google.com/?q=Lakeview+Golf+Club",
            websiteUrl: "https://www.lakeviewgolfclub.com/",
            websiteVerified: true,
            websiteStatus: "verified",
            courseType: "Public course",
            publicStatus: "Public",
            holes: "18",
            priceContext: "Daily play and membership options vary by season.",
            amenities: "Driving range, pro shop, practice facilities",
            relationshipToNeighborhood: "Nearby golf option for Lincoln Park residents",
            source: "Verified neighborhood reference",
          },
        ],
      },
    ];

    render(<CanonicalDestinationPage destination={destination} />);
    fireEvent.click(screen.getByRole("tab", { name: /Premium Profile/i }));
    fireEvent.click(screen.getByRole("button", { name: /Explore/i }));

    expect(screen.getByText("Nearby Golf Courses")).toBeInTheDocument();
    expect(screen.getAllByText("Lakeview Golf Club").length).toBeGreaterThan(0);
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

  it("shows the website action without inventing a Google Maps link when a place has only a direct website", () => {
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
            id: "place-4",
            name: "The Promontory",
            category: "Restaurants",
            destinationName: "Chicago",
            neighborhoodName: "Hyde Park",
            description: "A major attraction with a direct website and no maps URL.",
            whyItMatters: "An example of a place whose website should surface without synthesizing a maps action.",
            verified: true,
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

    expect(screen.getByRole("link", { name: /Visit website/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Open on Google Maps/i })).not.toBeInTheDocument();
  });

  it("does not surface social or maps-only URLs as direct websites", () => {
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
            id: "place-5",
            name: "Example Place",
            category: "Restaurants",
            destinationName: "Chicago",
            neighborhoodName: "Hyde Park",
            description: "A place with a social-only URL.",
            whyItMatters: "An example of a place whose website should not be surfaced.",
            verified: true,
            googleMapsUrl: "https://maps.google.com/?q=Example+Place+Chicago",
            websiteUrl: "https://www.instagram.com/exampleplace/",
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

    expect(screen.queryByRole("link", { name: /Visit website/i })).not.toBeInTheDocument();
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

describe("CanonicalDestinationPage - v3.1 renderer-integration authority contract", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  function buildV31Destination(): CanonicalDestination {
    return {
      ...buildDestination(),
      slug: "test-v31-destination",
      city: "Real City",
      country: "Real Country",
      title: "Real City",
      neighborhoods: ["Real Neighborhood One", "Real Neighborhood Two"],
      media: [{ kind: "image", url: "https://commons.wikimedia.org/wiki/Special:FilePath/Real1.jpg", altText: "Real alt", caption: "Real caption", isPrimary: true }],
      heroImages: [{ kind: "image", url: "https://commons.wikimedia.org/wiki/Special:FilePath/Real1.jpg", altText: "Real alt", caption: "Real caption", isPrimary: true }],
      v31DestinationKey: "real-city-key",
      v31Modules: {
        facts: [{ factKey: "population", factGroup: "identity", valueText: "50,000", displayLabel: "Population", sourceName: "Census" }],
        scores: [
          { scoreKey: "retirement", scoreValue: "91", scoreLabel: "Excellent" },
          { scoreKey: "family", scoreValue: "88", scoreLabel: "Very strong" },
        ],
        neighborhoods: [
          { neighborhoodKey: "nb-1", name: "Real Neighborhood One", summary: "Real neighborhood one summary.", areaType: "urban" },
          { neighborhoodKey: "nb-2", name: "Real Neighborhood Two", summary: "Real neighborhood two summary.", areaType: "residential" },
        ],
        places: [],
        resources: [],
        media: [{ mediaKey: "media-1", kind: "image", url: "https://commons.wikimedia.org/wiki/Special:FilePath/Real1.jpg", caption: "Real caption", altText: "Real alt" }],
        costOfLiving: [{ itemKey: "col-1", category: "housing", monthlyLow: "1000", monthlyHigh: "2000", currency: "USD" }],
        climateMonthly: [],
        housing: [],
        propertyResources: [],
        healthcare: [{ summary: "Real healthcare summary." }],
        visaResidency: [],
        taxesFinance: [],
        lgbtqInclusivity: [],
        safetyRisks: [],
        transportation: [{ summary: "Real transportation summary." }],
        remoteWork: [{ summary: "Real remote work summary." }],
        languageIntegration: [],
        pets: [{ summary: "Real pets summary." }],
        familyEducation: [{ summary: "Real family summary." }],
        communitySocial: [],
        accessibility: [],
        bureaucracySetup: [],
        workBusiness: [],
        retirementAging: [{ summary: "Real retirement summary." }],
        lifestyleLaws: [],
        realityCheck: [],
        moveChecklist: [],
        eventsSeasonality: [],
        sources: [],
      },
    };
  }

  it("shows real persisted destination-level scores, never the hardcoded 76/74/72/78 fallback", () => {
    render(<CanonicalDestinationPage destination={buildV31Destination()} />);
    fireEvent.pointerDown(screen.getByRole("tab", { name: /Premium Profile/i }));

    expect(screen.getByText("91/100")).toBeInTheDocument();
    expect(screen.getByText("88/100")).toBeInTheDocument();
    expect(screen.queryByText("76/100")).not.toBeInTheDocument();
    expect(screen.queryByText("74/100")).not.toBeInTheDocument();
    expect(screen.queryByText("72/100")).not.toBeInTheDocument();
    expect(screen.queryByText("78/100")).not.toBeInTheDocument();
  });

  it("shows real persisted neighborhood names and never a fabricated '${city} center' entry", () => {
    render(<CanonicalDestinationPage destination={buildV31Destination()} />);
    fireEvent.pointerDown(screen.getByRole("tab", { name: /Premium Profile/i }));

    expect(screen.getAllByText("Real Neighborhood One").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Real Neighborhood Two").length).toBeGreaterThan(0);
    expect(screen.queryByText(/Real City center/i)).not.toBeInTheDocument();
  });

  it("does not render generic legacy editorial template phrases for a v3.1 destination", () => {
    render(<CanonicalDestinationPage destination={buildV31Destination()} />);

    expect(screen.queryByText(/feels most convincing when you understand it as a living place/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/is easiest to understand in a normal week rather than on a weekend checklist/i)).not.toBeInTheDocument();
  });

  it("renders the real v3.1 rich module section with representative real content", () => {
    render(<CanonicalDestinationPage destination={buildV31Destination()} />);
    fireEvent.pointerDown(screen.getByRole("tab", { name: /Deep Dive/i }));

    expect(screen.getByText("Real destination-specific data")).toBeInTheDocument();
    expect(screen.getAllByText(/Real healthcare summary/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Real remote work summary/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Real pets summary/i).length).toBeGreaterThan(0);
  });

  it("does not render the v3.1 rich module section for a legacy (non-v3.1) destination", () => {
    render(<CanonicalDestinationPage destination={buildDestination()} />);
    fireEvent.pointerDown(screen.getByRole("tab", { name: /Deep Dive/i }));

    expect(screen.queryByText("Real destination-specific data")).not.toBeInTheDocument();
  });

  it("hides a rich-module category entirely rather than fabricating content when its array is empty", () => {
    const destination = buildV31Destination();
    destination.v31Modules = { ...destination.v31Modules!, pets: [] };
    render(<CanonicalDestinationPage destination={destination} />);
    fireEvent.pointerDown(screen.getByRole("tab", { name: /Deep Dive/i }));

    expect(screen.queryByText("Pets")).not.toBeInTheDocument();
  });

  function buildV31PlaceLinkedDestination(): CanonicalDestination {
    const destination = buildV31Destination();
    destination.neighborhoods = ["Neighborhood A", "Neighborhood B", "Neighborhood C", "Neighborhood D", "Neighborhood E", "Neighborhood F", "Neighborhood G", "Neighborhood H"];
    destination.v31Modules = {
      ...destination.v31Modules!,
      neighborhoods: [
        { neighborhoodKey: "nb-a", name: "Neighborhood A", summary: "First neighborhood.", areaType: "urban" },
        { neighborhoodKey: "nb-b", name: "Neighborhood B", summary: "Second neighborhood.", areaType: "urban" },
        { neighborhoodKey: "nb-c", name: "Neighborhood C", summary: "Third neighborhood.", areaType: "urban" },
        { neighborhoodKey: "nb-d", name: "Neighborhood D", summary: "Fourth neighborhood.", areaType: "urban" },
        { neighborhoodKey: "nb-e", name: "Neighborhood E", summary: "Fifth neighborhood - hidden until expanded.", areaType: "urban" },
        { neighborhoodKey: "nb-f", name: "Neighborhood F", summary: "Sixth neighborhood - hidden until expanded.", areaType: "urban" },
        { neighborhoodKey: "nb-g", name: "Neighborhood G", summary: "Seventh neighborhood - hidden until expanded.", areaType: "urban" },
        { neighborhoodKey: "nb-h", name: "Neighborhood H", summary: "Eighth neighborhood - hidden until expanded.", areaType: "urban" },
      ],
      places: [
        {
          placeKey: "place-a-restaurant",
          category: "restaurant",
          name: "Neighborhood A Bistro",
          description: "A real restaurant in Neighborhood A.",
          neighborhoodKey: "nb-a",
          websiteUrl: "https://neighborhood-a-bistro.example-test.invalid/",
          googleMapsUrl: "https://maps.example-test.invalid/neighborhood-a-bistro",
          sourceUrl: "https://neighborhood-a-bistro.example-test.invalid/",
          address: "1 Main St",
          phone: "+1 555-0001",
          displayOrder: "1",
        },
        {
          placeKey: "place-a-coffee",
          category: "coffee_shop",
          name: "Neighborhood A Coffee Co",
          description: "A real coffee shop in Neighborhood A.",
          neighborhoodKey: "nb-a",
          websiteUrl: null,
          googleMapsUrl: "https://maps.example-test.invalid/neighborhood-a-coffee",
          sourceUrl: "https://maps.example-test.invalid/neighborhood-a-coffee",
          address: null,
          phone: null,
          displayOrder: "2",
        },
        {
          placeKey: "place-a-no-links",
          category: "restaurant",
          name: "Neighborhood A No Link Diner",
          description: "A real restaurant with no verified links at all.",
          neighborhoodKey: "nb-a",
          websiteUrl: null,
          googleMapsUrl: null,
          sourceUrl: null,
          address: null,
          phone: null,
          displayOrder: "3",
        },
        {
          placeKey: "place-b-restaurant",
          category: "restaurant",
          name: "Neighborhood B Grill",
          description: "A real restaurant in Neighborhood B.",
          neighborhoodKey: "nb-b",
          websiteUrl: "https://neighborhood-b-grill.example-test.invalid/",
          googleMapsUrl: "https://maps.example-test.invalid/neighborhood-b-grill",
          sourceUrl: "https://neighborhood-b-grill.example-test.invalid/",
          address: null,
          phone: null,
          displayOrder: "1",
        },
        {
          placeKey: "place-e-restaurant",
          category: "restaurant",
          name: "Neighborhood E Cafe",
          description: "A real restaurant in Neighborhood E - hidden until the neighborhood list is expanded past the first 4.",
          neighborhoodKey: "nb-e",
          websiteUrl: "https://neighborhood-e-cafe.example-test.invalid/",
          googleMapsUrl: "https://maps.example-test.invalid/neighborhood-e-cafe",
          sourceUrl: "https://neighborhood-e-cafe.example-test.invalid/",
          address: null,
          phone: null,
          displayOrder: "1",
        },
        {
          placeKey: "place-g-golf",
          category: "golf",
          name: "Neighborhood G Golf Club",
          description: "A real golf course in Neighborhood G - only reachable by expanding past the first 4 neighborhoods.",
          neighborhoodKey: "nb-g",
          websiteUrl: "https://neighborhood-g-golf.example-test.invalid/",
          googleMapsUrl: "https://maps.example-test.invalid/neighborhood-g-golf",
          sourceUrl: "https://neighborhood-g-golf.example-test.invalid/",
          address: null,
          phone: null,
          displayOrder: "1",
        },
      ],
    };
    return destination;
  }

  function buildV31DestinationWithNeighborhoodCount(count: number): CanonicalDestination {
    const destination = buildV31Destination();
    const allKeys = ["nb-a", "nb-b", "nb-c", "nb-d", "nb-e", "nb-f", "nb-g", "nb-h"];
    const allNames = ["Neighborhood A", "Neighborhood B", "Neighborhood C", "Neighborhood D", "Neighborhood E", "Neighborhood F", "Neighborhood G", "Neighborhood H"];
    destination.neighborhoods = allNames.slice(0, count);
    destination.v31Modules = {
      ...destination.v31Modules!,
      neighborhoods: allKeys.slice(0, count).map((key, index) => ({ neighborhoodKey: key, name: allNames[index], summary: `${allNames[index]} summary.`, areaType: "urban" })),
      places: [],
    };
    return destination;
  }

  it("renders exactly 4 flagship neighborhood cards initially when more than 4 are persisted", () => {
    render(<CanonicalDestinationPage destination={buildV31PlaceLinkedDestination()} />);
    fireEvent.pointerDown(screen.getByRole("tab", { name: /Premium Profile/i }));

    expect(screen.getAllByText("Neighborhood A").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Neighborhood B").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Neighborhood C").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Neighborhood D").length).toBeGreaterThan(0);
    expect(screen.queryByText("Neighborhood E")).not.toBeInTheDocument();
    expect(screen.getAllByText("Explore more neighborhoods").length).toBeGreaterThan(0);
  });

  it("selects the same first-4 neighborhoods deterministically across repeated renders", () => {
    const { unmount } = render(<CanonicalDestinationPage destination={buildV31PlaceLinkedDestination()} />);
    fireEvent.pointerDown(screen.getByRole("tab", { name: /Premium Profile/i }));
    const firstRenderHasD = screen.queryByText("Neighborhood D") !== null;
    unmount();

    render(<CanonicalDestinationPage destination={buildV31PlaceLinkedDestination()} />);
    fireEvent.pointerDown(screen.getByRole("tab", { name: /Premium Profile/i }));
    const secondRenderHasD = screen.queryByText("Neighborhood D") !== null;

    expect(firstRenderHasD).toBe(true);
    expect(secondRenderHasD).toBe(true);
  });

  it("reveals up to 8 real persisted neighborhoods, in persisted order, after activating Explore more neighborhoods - never fabricating beyond what is persisted", () => {
    render(<CanonicalDestinationPage destination={buildV31PlaceLinkedDestination()} />);
    fireEvent.pointerDown(screen.getByRole("tab", { name: /Premium Profile/i }));

    expect(screen.queryByText("Neighborhood E")).not.toBeInTheDocument();
    fireEvent.click(screen.getAllByText("Explore more neighborhoods")[0]);

    expect(screen.getAllByText("Neighborhood E").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Neighborhood F").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Neighborhood G").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Neighborhood H").length).toBeGreaterThan(0);
    // Exactly 8 real neighborhoods exist in the fixture - no 9th/fabricated entry can appear, and
    // no further "Explore more" control remains since every persisted neighborhood is now shown.
    expect(screen.queryByText("Explore more neighborhoods")).not.toBeInTheDocument();
  });

  it("returns to the flagship 4 after activating Show fewer neighborhoods", () => {
    render(<CanonicalDestinationPage destination={buildV31PlaceLinkedDestination()} />);
    fireEvent.pointerDown(screen.getByRole("tab", { name: /Premium Profile/i }));
    fireEvent.click(screen.getAllByText("Explore more neighborhoods")[0]);
    expect(screen.getAllByText("Neighborhood H").length).toBeGreaterThan(0);

    fireEvent.click(screen.getAllByText("Show fewer neighborhoods")[0]);

    expect(screen.queryByText("Neighborhood E")).not.toBeInTheDocument();
    expect(screen.queryByText("Neighborhood H")).not.toBeInTheDocument();
    expect(screen.getAllByText("Neighborhood A").length).toBeGreaterThan(0);
  });

  it("does not show an Explore more neighborhoods control when 4 or fewer real neighborhoods are persisted", () => {
    render(<CanonicalDestinationPage destination={buildV31DestinationWithNeighborhoodCount(4)} />);
    fireEvent.pointerDown(screen.getByRole("tab", { name: /Premium Profile/i }));

    expect(screen.getAllByText("Neighborhood D").length).toBeGreaterThan(0);
    expect(screen.queryByText("Explore more neighborhoods")).not.toBeInTheDocument();
    expect(screen.queryByText("Show fewer neighborhoods")).not.toBeInTheDocument();
  });

  it("shows the Explore more control and reveals exactly the real additional count for a destination with 5-8 neighborhoods (no padding to 8)", () => {
    render(<CanonicalDestinationPage destination={buildV31DestinationWithNeighborhoodCount(6)} />);
    fireEvent.pointerDown(screen.getByRole("tab", { name: /Premium Profile/i }));

    expect(screen.queryByText("Neighborhood E")).not.toBeInTheDocument();
    fireEvent.click(screen.getAllByText("Explore more neighborhoods")[0]);

    expect(screen.getAllByText("Neighborhood E").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Neighborhood F").length).toBeGreaterThan(0);
    // Only 6 real neighborhoods exist - Neighborhood G/H must never appear (no fabrication).
    expect(screen.queryByText("Neighborhood G")).not.toBeInTheDocument();
    expect(screen.queryByText("Neighborhood H")).not.toBeInTheDocument();
    expect(screen.queryByText("Explore more neighborhoods")).not.toBeInTheDocument();
  });

  it("filters real places by exact neighborhoodKey - a Neighborhood A restaurant never appears under Neighborhood B", () => {
    render(<CanonicalDestinationPage destination={buildV31PlaceLinkedDestination()} />);
    fireEvent.pointerDown(screen.getByRole("tab", { name: /Premium Profile/i }));

    expect(screen.getByText("Neighborhood A Bistro")).toBeInTheDocument();
    expect(screen.getByText("Neighborhood B Grill")).toBeInTheDocument();
    // Both real restaurants render exactly once each - proves no cross-neighborhood duplication.
    expect(screen.getAllByText("Neighborhood A Bistro")).toHaveLength(1);
    expect(screen.getAllByText("Neighborhood B Grill")).toHaveLength(1);
  });

  it("never renders a place from a neighborhood beyond the currently visible set (cross-destination/leakage safety)", () => {
    render(<CanonicalDestinationPage destination={buildV31PlaceLinkedDestination()} />);
    fireEvent.pointerDown(screen.getByRole("tab", { name: /Premium Profile/i }));

    expect(screen.queryByText("Neighborhood E Cafe")).not.toBeInTheDocument();
    expect(screen.queryByText("Neighborhood G Golf Club")).not.toBeInTheDocument();
  });

  it("surfaces a real place tied to a neighborhood outside the flagship 4 (e.g. golf) only once that neighborhood is revealed, with exact neighborhoodKey linkage preserved", () => {
    render(<CanonicalDestinationPage destination={buildV31PlaceLinkedDestination()} />);
    fireEvent.pointerDown(screen.getByRole("tab", { name: /Premium Profile/i }));
    expect(screen.queryByText("Neighborhood G Golf Club")).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByText("Explore more neighborhoods")[0]);

    expect(screen.getByText("Neighborhood G Golf Club")).toBeInTheDocument();
    expect(screen.getAllByText("Neighborhood G Golf Club")).toHaveLength(1);
    // Still never leaks into an unrelated neighborhood's card.
    expect(screen.queryByText("Neighborhood A Bistro")).toBeInTheDocument();
  });

  it("opens the place modal with a real clickable website link when websiteUrl is present", () => {
    render(<CanonicalDestinationPage destination={buildV31PlaceLinkedDestination()} />);
    fireEvent.pointerDown(screen.getByRole("tab", { name: /Premium Profile/i }));

    fireEvent.click(screen.getByText("Neighborhood A Bistro"));

    const websiteLink = screen.getByText("Visit website").closest("a");
    expect(websiteLink).toHaveAttribute("href", "https://neighborhood-a-bistro.example-test.invalid/");
  });

  it("opens the place modal with a real clickable Maps link when googleMapsUrl is present", () => {
    render(<CanonicalDestinationPage destination={buildV31PlaceLinkedDestination()} />);
    fireEvent.pointerDown(screen.getByRole("tab", { name: /Premium Profile/i }));

    fireEvent.click(screen.getByText("Neighborhood A Bistro"));

    const mapsLink = screen.getByText("Open on Google Maps").closest("a");
    expect(mapsLink).toHaveAttribute("href", "https://maps.example-test.invalid/neighborhood-a-bistro");
  });

  it("shows both Website and Maps actions when a real place has both links", () => {
    render(<CanonicalDestinationPage destination={buildV31PlaceLinkedDestination()} />);
    fireEvent.pointerDown(screen.getByRole("tab", { name: /Premium Profile/i }));

    fireEvent.click(screen.getByText("Neighborhood A Bistro"));

    expect(screen.getByText("Visit website")).toBeInTheDocument();
    expect(screen.getByText("Open on Google Maps")).toBeInTheDocument();
  });

  it("does not invent a fake URL when a real place has no website, maps, or source link at all", () => {
    render(<CanonicalDestinationPage destination={buildV31PlaceLinkedDestination()} />);
    fireEvent.pointerDown(screen.getByRole("tab", { name: /Premium Profile/i }));

    fireEvent.click(screen.getByText("Neighborhood A No Link Diner"));

    expect(screen.queryByText("Visit website")).not.toBeInTheDocument();
    expect(screen.queryByText("Open on Google Maps")).not.toBeInTheDocument();
  });

  it("omits a category entirely when a neighborhood has zero real places for it (no forced empty category)", () => {
    render(<CanonicalDestinationPage destination={buildV31PlaceLinkedDestination()} />);
    fireEvent.pointerDown(screen.getByRole("tab", { name: /Premium Profile/i }));

    // Neighborhood A has no real golf/healthcare/attractions places - these distinctive
    // compound category labels (unique to the real-places grouping) must not appear.
    expect(screen.queryByText("Entertainment & nightlife")).not.toBeInTheDocument();
    expect(screen.queryByText("Attractions & things to do")).not.toBeInTheDocument();
    expect(screen.queryByText("Outdoor recreation")).not.toBeInTheDocument();
  });

  it("does not replace real persisted places with generic 'More local detail coming soon' filler for categories that have real data", () => {
    render(<CanonicalDestinationPage destination={buildV31PlaceLinkedDestination()} />);
    fireEvent.pointerDown(screen.getByRole("tab", { name: /Premium Profile/i }));

    // Real restaurant/coffee content must be present, not replaced by filler text for those categories.
    expect(screen.getByText("Neighborhood A Bistro")).toBeInTheDocument();
    expect(screen.getByText("Neighborhood A Coffee Co")).toBeInTheDocument();
  });
});

