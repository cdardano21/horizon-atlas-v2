import { fireEvent, render, screen, within } from "@testing-library/react";
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
  it("hides empty decision-lens status and developer controls on customer pages", () => {
    const destination = buildDestination();
    destination.scoring = [];

    render(<CanonicalDestinationPage destination={destination} />);

    expect(screen.queryByText("0 decision lenses")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Open developer view" })).not.toBeInTheDocument();
  });

  it("renders a destination guide section for Spearfish", () => {
    render(<CanonicalDestinationPage destination={buildDestination()} />);

    expect(screen.getAllByText("Destination Guide").length).toBeGreaterThan(0);
    expect(screen.getByText(/A magazine-style introduction to Spearfish/i)).toBeInTheDocument();
    expect(screen.getByText(/What to know first/i)).toBeInTheDocument();
  });

  it("renders Destination Guide, Practical Details, and Deep Dive content simultaneously after a single render (no hidden or conditionally mounted panel)", () => {
    render(<CanonicalDestinationPage destination={buildDestination()} />);

    expect(screen.getByText(/A magazine-style introduction to/i)).toBeInTheDocument();
    expect(screen.getByText(/Scores and fit/i)).toBeInTheDocument();
    expect(screen.getByText(/Getting around/i)).toBeInTheDocument();
  });

  it("shows the full editorial overview openly, directly after the hero/key-facts area, with no 'Continue reading' gate", () => {
    const destination = buildDestination();
    destination.premiumEditorialContent = {
      heroIntroduction: "A short hero line for this destination.",
      whyPeopleLoveIt: ["It has real character."],
      overviewArticle: "Paragraph one about the destination.\n\nParagraph two continues the story.\n\nParagraph three is now shown openly, without needing to click anything.",
    };

    render(<CanonicalDestinationPage destination={destination} />);

    expect(screen.getByText(/Paragraph three is now shown openly/i)).toBeInTheDocument();
  });

  it("keeps all score explanation content present in the DOM on initial render, inside native <details> elements with no React click state gating it", () => {
    render(<CanonicalDestinationPage destination={buildDestination()} />);

    const scoresHeading = screen.getByText("Why the destination scores the way it does");
    const scoresSection = scoresHeading.closest("section") as HTMLElement;
    const detailsInSection = scoresSection.querySelectorAll("details");
    expect(detailsInSection.length).toBeGreaterThan(0);
    detailsInSection.forEach((details) => {
      expect(details.querySelector("summary")).not.toBeNull();
      expect(within(details as HTMLElement).getByText("Expand")).toBeInTheDocument();
    });
  });

  it("uses only native <details>/<summary> disclosure for score cards, neighborhood exploration, and 'Continue reading' - no button-role controls remain for these interactions", () => {
    render(<CanonicalDestinationPage destination={buildDestination()} />);

    expect(screen.queryByRole("button", { name: "Expand" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Collapse" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Continue reading/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Explore this neighborhood/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Explore more neighborhoods/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Show more/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Show fewer/i })).not.toBeInTheDocument();
  });

  it("gives each of the three page sections its exact expected id, exactly once", () => {
    const { container } = render(<CanonicalDestinationPage destination={buildDestination()} />);

    for (const id of ["destination-guide", "practical-details", "deep-dive"]) {
      expect(container.querySelectorAll(`#${id}`)).toHaveLength(1);
    }
  });

  it("renders a prominent 'Explore this destination' anchor menu with the three correct hrefs", () => {
    render(<CanonicalDestinationPage destination={buildDestination()} />);

    const nav = screen.getByRole("navigation", { name: /Explore this destination/i });
    expect(within(nav).getByRole("link", { name: /Destination Guide/ })).toHaveAttribute("href", "#destination-guide");
    expect(within(nav).getByRole("link", { name: /Practical Details/ })).toHaveAttribute("href", "#practical-details");
    expect(within(nav).getByRole("link", { name: /Deep Dive/ })).toHaveAttribute("href", "#deep-dive");
  });

  it("never reads or writes a tab-preference key to localStorage now that there is no tab state to persist", () => {
    window.localStorage.clear();
    const destination = buildDestination();

    render(<CanonicalDestinationPage destination={destination} />);

    expect(window.localStorage.getItem(`horizon-atlas-view-mode:${destination.slug}`)).toBeNull();
    expect(window.localStorage.length).toBe(0);
  });

  it("renders the resource-link groups (hotels, rentals, tours, weather, etc.) exactly once now that Practical Details and Deep Dive are both always visible (regression: this content previously duplicated between the two former tab branches)", () => {
    const destination = buildDestination();
    destination.city = "Fairhope";
    destination.country = "United States";
    destination.title = "Fairhope";
    destination.resources = [
      { label: "Search Airbnb", url: "https://www.airbnb.com/s/Fairhope%2C%20United%20States/homes", category: "vacation-stays", provider: "Airbnb" },
    ];

    render(<CanonicalDestinationPage destination={destination} />);

    expect(screen.getAllByRole("link", { name: /Search Airbnb/i })).toHaveLength(1);
  });

  it("renders correct, non-leaking content across sequential re-renders simulating client-side navigation between Batch #1 and Batch #2 destinations (regression: Next.js can reuse the same page component instance across a route change instead of unmounting it)", () => {
    const batch1Destination = buildDestination();
    batch1Destination.slug = "queenstown-nz";
    batch1Destination.title = "Queenstown";

    const batch2Destination = buildDestination();
    batch2Destination.slug = "ascoli-piceno-it";
    batch2Destination.title = "Ascoli Piceno";

    const { rerender } = render(<CanonicalDestinationPage destination={batch1Destination} />);
    expect(screen.getAllByText(/Queenstown/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Ascoli Piceno/i)).not.toBeInTheDocument();

    // Same mounted instance, new destination prop - simulates Next.js reusing the page component
    // across a client-side route change without unmounting it.
    rerender(<CanonicalDestinationPage destination={batch2Destination} />);
    expect(screen.getAllByText(/Ascoli Piceno/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Queenstown/i)).not.toBeInTheDocument();

    rerender(<CanonicalDestinationPage destination={batch1Destination} />);
    expect(screen.getAllByText(/Queenstown/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Ascoli Piceno/i)).not.toBeInTheDocument();
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
    expect(screen.getByText(/How the city is experienced block by block/i)).toBeInTheDocument();
    expect(screen.getAllByText("Lakeview").length).toBeGreaterThan(0);
    expect(screen.getByText(/Neighborhood summary/i)).toBeInTheDocument();
    expect(screen.queryByText("Canonical content layer")).not.toBeInTheDocument();
    expect(screen.getAllByText(/Practical Details/i).length).toBeGreaterThan(0);
  });

  it("uses category-specific content rather than reusing the general overview for category cards, hiding a category cleanly instead of leaking overview text into it", () => {
    const destination = buildDestination();
    destination.overview = "This is the general destination overview that should not be reused for unrelated category cards.";
    destination.heroNarrative = "A destination narrative that should stay in the hero and overview sections.";
    destination.dailyLife = "A daily-life description that should remain distinct from category cards.";

    render(<CanonicalDestinationPage destination={destination} />);

    // Neither Population nor Golf has any supporting data for this destination - both are hidden
    // cleanly rather than rendering with the placeholder sentence repeated across the page, and
    // critically, neither ever leaks the general destination overview text into its own card.
    expect(screen.queryByText("Population")).not.toBeInTheDocument();
    expect(screen.queryByText("Golf")).not.toBeInTheDocument();
    expect(screen.getAllByText(/This is the general destination overview/i).length).toBeGreaterThan(0);
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
    expect(screen.getAllByText(/Editorial destination placeholder/i).length).toBeGreaterThan(0);
  });

  it("retains more than five verified images while previewing the first five", () => {
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

    const gallery = screen.getByRole("heading", { name: "Photos, streets, and daily life" }).closest("section") as HTMLElement;
    const previews = within(gallery).getAllByRole("button");
    expect(within(gallery).getByText("6 curated assets")).toBeInTheDocument();
    expect(previews).toHaveLength(5);
  });

  it("removes a failed gallery slot and promotes the next ordered image without leaving a broken thumbnail", () => {
    const destination = buildDestination();
    destination.heroImages = [
      { url: "https://upload.wikimedia.org/broken-hero.jpg", altText: "Broken hero", isPrimary: true },
      { url: "https://upload.wikimedia.org/working-gallery.jpg", altText: "Working gallery", isPrimary: false },
    ];

    render(<CanonicalDestinationPage destination={destination} />);

    const gallery = screen.getByRole("heading", { name: "Photos, streets, and daily life" }).closest("section") as HTMLElement;
    fireEvent.error(within(gallery).getByRole("img", { name: "Broken hero" }));

    expect(within(gallery).queryByRole("img", { name: "Broken hero" })).not.toBeInTheDocument();
    expect(within(gallery).getByRole("img", { name: "Working gallery" })).toBeInTheDocument();
  });

  it("deduplicates Wikimedia original and thumbnail URLs while preserving distinct gallery images", () => {
    const destination = buildDestination();
    destination.slug = "gallery-dedupe-test";
    destination.city = "Gallery Test";
    destination.country = "Test Country";
    destination.title = "Gallery Test";
    destination.heroImages = [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Shared_Image.jpg",
        altText: "Original shared image",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Shared_Image.jpg/1280px-Shared_Image.jpg",
        altText: "Duplicate thumbnail image",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Distinct_Image.jpg",
        altText: "Distinct gallery image",
      },
    ];

    render(<CanonicalDestinationPage destination={destination} />);

    const gallery = screen.getByRole("heading", { name: "Media gallery" }).closest("section") as HTMLElement;
    expect(within(gallery).getAllByRole("button")).toHaveLength(2);
    expect(within(gallery).getByRole("img", { name: "Original shared image" })).toBeInTheDocument();
    expect(within(gallery).getByRole("img", { name: "Distinct gallery image" })).toBeInTheDocument();
    expect(within(gallery).queryByRole("img", { name: "Duplicate thumbnail image" })).not.toBeInTheDocument();
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

    expect(screen.getAllByRole("link", { name: /Google Maps/i }).length).toBeGreaterThan(0);
    expect(screen.getByText(/Neighborhood intelligence/i)).toBeInTheDocument();
    // "Overall neighborhood score" was a synthetic composite counted from generic fallback keyword
    // matches, never a real persisted evidence signal - it was removed as unfinished filler rather
    // than asserted here.
    expect(screen.queryByText(/Overall neighborhood score/i)).not.toBeInTheDocument();
  });

  it("never leaks generated Airbnb/airport-transfer travel-search utilities into the neighborhood-scoped 'Live neighborhood resources' widget (regression for a bare /air/ substring match)", () => {
    const destination = buildDestination();
    destination.city = "Fairhope";
    destination.country = "United States";
    destination.title = "Fairhope";
    destination.neighborhoods = ["Downtown Fairhope"];
    destination.webcamUrl = "https://www.google.com/search?q=Fairhope%20United%20States%20webcam";
    destination.resources = [
      { label: "Search Airbnb", url: "https://www.airbnb.com/s/Fairhope%2C%20United%20States/homes", category: "vacation-stays", provider: "Airbnb" },
      { label: "Find airport transfers", url: "https://www.google.com/search?q=airport%20transfer%20Fairhope", category: "transportation", provider: "Web search" },
      { label: "Check destination weather", url: "https://www.google.com/search?q=weather%20Fairhope", category: "weather", provider: "Web search" },
    ];

    render(<CanonicalDestinationPage destination={destination} />);

    const liveResourcesLabel = screen.getByText(/Live neighborhood resources/i);
    const liveResourcesContainer = liveResourcesLabel.parentElement as HTMLElement;
    expect(liveResourcesContainer).toBeTruthy();
    expect(within(liveResourcesContainer).queryByRole("link", { name: /Search Airbnb/i })).not.toBeInTheDocument();
    expect(within(liveResourcesContainer).queryByRole("link", { name: /Find airport transfers/i })).not.toBeInTheDocument();
    expect(within(liveResourcesContainer).getByRole("link", { name: /Live webcam/i })).toBeInTheDocument();
    expect(within(liveResourcesContainer).getByRole("link", { name: /Check destination weather/i })).toBeInTheDocument();
    // Confirm the generated Airbnb/airport-transfer utilities still exist elsewhere on the page
    // (in the page-level Vacation Rentals / Transportation resource groups) - they are only
    // excluded from this specific neighborhood-scoped live/weather/webcam widget.
    expect(screen.getAllByRole("link", { name: /Search Airbnb/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /Find airport transfers/i }).length).toBeGreaterThan(0);
  });

  it("renders two resources in the same group that share a label but have different URLs without a React duplicate-key warning (regression for authored RESOURCES + PROPERTY_RESOURCES entries from the same provider)", () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const destination = buildDestination();
    destination.city = "Hoi An";
    destination.country = "Vietnam";
    destination.title = "Hoi An";
    destination.resources = [
      { label: "Savills Vietnam", url: "https://industrial.savills.com.vn/can-foreigners-buy-real-estate-in-vietnam/", category: "property", provider: null },
      { label: "Savills Vietnam", url: "https://www.savills.com.vn/", category: "housing", provider: null },
    ];

    render(<CanonicalDestinationPage destination={destination} />);

    const savillsLinks = screen.getAllByRole("link", { name: /Savills Vietnam/i });
    const uniqueHrefs = new Set(savillsLinks.map((link) => link.getAttribute("href")));
    expect(uniqueHrefs).toEqual(new Set([
      "https://industrial.savills.com.vn/can-foreigners-buy-real-estate-in-vietnam/",
      "https://www.savills.com.vn/",
    ]));
    const keyWarning = consoleErrorSpy.mock.calls.some((call) => String(call[0]).includes("same key"));
    expect(keyWarning).toBe(false);
    consoleErrorSpy.mockRestore();
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

  it("shows curated Chicago imagery in the hero and gallery", () => {
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

  it("omits the public monthly climate card when persisted climate is absent", () => {
    render(<CanonicalDestinationPage destination={buildV31Destination()} />);
    expect(screen.queryByText("Climate (monthly)")).not.toBeInTheDocument();
    expect(screen.queryByText("Persisted v3.1 modules")).not.toBeInTheDocument();
  });

  it.each([false, true])("renders all twelve monthly climate rows with unchanged values (developerMode=%s)", (developerMode) => {
    const destination = buildV31Destination();
    destination.v31Modules = {
      ...destination.v31Modules!,
      climateMonthly: Array.from({ length: 12 }, (_, index) => ({
        monthKey: String(index + 1), avgLowTemp: String(index - 5), avgHighTemp: String(index + 10),
        precipitationMm: null, humidityPct: null,
      })),
    };
    render(<CanonicalDestinationPage destination={destination} developerMode={developerMode} />);
    if (!developerMode) {
      expect(screen.queryByText("Persisted v3.1 modules")).not.toBeInTheDocument();
      expect(screen.queryByText("housing: USD1000–USD2000/month")).not.toBeInTheDocument();
    }
    const card = screen.getByText("Climate (monthly)").parentElement!;
    const rows = within(card).getAllByRole("listitem");
    expect(rows).toHaveLength(12);
    ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].forEach((month, index) => {
      const lowF = (index - 5) * 9 / 5 + 32;
      const highF = (index + 10) * 9 / 5 + 32;
      const format = (value: number) => Number.isInteger(value) ? String(value) : value.toFixed(1);
      expect(rows[index]).toHaveTextContent(`${month}: ${format(lowF)}–${format(highF)}°F`);
      expect(within(card).getAllByText(`${month}: ${format(lowF)}–${format(highF)}°F`)).toHaveLength(1);
      expect(rows[index]).toBeVisible();
    });
  });

  it("shows real persisted destination-level scores, never the hardcoded 76/74/72/78 fallback", () => {
    render(<CanonicalDestinationPage destination={buildV31Destination()} />);

    expect(screen.getByText("91/100")).toBeInTheDocument();
    expect(screen.getByText("88/100")).toBeInTheDocument();
    expect(screen.queryByText("76/100")).not.toBeInTheDocument();
    expect(screen.queryByText("74/100")).not.toBeInTheDocument();
    expect(screen.queryByText("72/100")).not.toBeInTheDocument();
    expect(screen.queryByText("78/100")).not.toBeInTheDocument();
  });

  it("shows real persisted neighborhood names and never a fabricated '${city} center' entry", () => {
    render(<CanonicalDestinationPage destination={buildV31Destination()} />);

    expect(screen.getAllByText("Real Neighborhood One").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Real Neighborhood Two").length).toBeGreaterThan(0);
    expect(screen.queryByText(/Real City center/i)).not.toBeInTheDocument();
  });

  it("does not render generic legacy editorial template phrases for a v3.1 destination", () => {
    render(<CanonicalDestinationPage destination={buildV31Destination()} />);

    expect(screen.queryByText(/feels most convincing when you understand it as a living place/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/is easiest to understand in a normal week rather than on a weekend checklist/i)).not.toBeInTheDocument();
  });

  it("renders the real v3.1 rich module section with representative real content for an authenticated developer/admin preview only", () => {
    render(<CanonicalDestinationPage destination={buildV31Destination()} developerMode />);

    expect(screen.getByText("Real destination-specific data")).toBeInTheDocument();
    expect(screen.getAllByText(/Real healthcare summary/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Real remote work summary/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Real pets summary/i).length).toBeGreaterThan(0);
  });

  it("never renders the raw v3.1 rich module debug section to a public (non-developer) visitor, even for a v3.1 destination", () => {
    render(<CanonicalDestinationPage destination={buildV31Destination()} />);

    expect(screen.queryByText("Real destination-specific data")).not.toBeInTheDocument();
  });

  it("does not render the v3.1 rich module section for a legacy (non-v3.1) destination", () => {
    render(<CanonicalDestinationPage destination={buildDestination()} />);

    expect(screen.queryByText("Real destination-specific data")).not.toBeInTheDocument();
  });

  it("hides a rich-module category entirely rather than fabricating content when its array is empty (developer preview)", () => {
    const destination = buildV31Destination();
    destination.v31Modules = { ...destination.v31Modules!, pets: [] };
    render(<CanonicalDestinationPage destination={destination} developerMode />);

    expect(screen.queryByText("Pets")).not.toBeInTheDocument();
  });

  it("renders the public Practical Living Snapshot / Community and Personal Comfort / Reality and Environment sections from real v3.1 module data, sanitizing internal placeholder tokens", () => {
    const destination = buildV31Destination();
    destination.v31Modules = {
      ...destination.v31Modules!,
      safetyRisks: [{ itemKey: "risk-1", summary: "Seasonal storms require basic preparedness.", topic: "weather", severity: "Medium" }],
      accessibility: [{ summary: "VARIABLE", mobilityNotes: "Sidewalks are well maintained in the historic core." }],
      dailyLifePracticality: { summary: "Groceries and pharmacies are within easy walking distance.", practicalityNotes: "UNKNOWN" },
      environmentQuality: { summary: "Air quality is generally good year-round.", qualityNotes: "CONDITIONAL" },
      remoteWork: [{ summary: "Reliable fiber internet is available in most central areas.", internetSummary: "UNKNOWN" }],
      languageIntegration: [{ summary: "English is widely understood in tourist and business areas.", englishSupport: "VARIABLE" }],
      communitySocial: [{ summary: "A visible, welcoming expat and retiree community.", socialNotes: "UNKNOWN" }],
      lgbtqInclusivity: [{ summary: "Legal protections follow national law; social comfort varies by neighborhood.", culturalNotes: "CONDITIONAL" }],
      familyEducation: [{ summary: "International schools are available in the metro area.", schoolsSummary: "VARIABLE" }],
      realityCheck: [{ summary: "The strongest fit is for residents who value walkability over car convenience.", title: "Conditional fit", severity: "n/a" }],
    };

    render(<CanonicalDestinationPage destination={destination} />);

    expect(screen.getByText("Practical Living Snapshot")).toBeInTheDocument();
    expect(screen.getByText("Community and Personal Comfort")).toBeInTheDocument();
    expect(screen.getByText("Reality and Environment")).toBeInTheDocument();
    expect(screen.getAllByText(/Seasonal storms require basic preparedness/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Sidewalks are well maintained/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Groceries and pharmacies are within easy walking distance/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Air quality is generally good year-round/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Reliable fiber internet is available/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/A visible, welcoming expat and retiree community/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Legal protections follow national law/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/not individualized legal advice, and not a guarantee of safety or comfort/i)).toBeInTheDocument();
    expect(screen.getAllByText(/The strongest fit is for residents who value walkability/i).length).toBeGreaterThan(0);

    // Internal enum/placeholder tokens must never render as if they were real public facts.
    for (const token of ["VARIABLE", "CONDITIONAL", "UNKNOWN"]) {
      expect(screen.queryByText(token, { exact: true })).not.toBeInTheDocument();
    }
  });

  it("never surfaces a generated 'Find airport transfers' travel-search label as if it were a real Airport access fact", () => {
    const destination = buildV31Destination();
    destination.knowledgeProfile = { ...destination.knowledgeProfile, majorAirports: ["Real City International Airport"] };
    destination.resources = [{ category: "transportation", label: "Find airport transfers", url: "https://www.google.com/search?q=airport%20transfer", provider: "Web search" }];

    render(<CanonicalDestinationPage destination={destination} />);

    expect(screen.getAllByText(/Real City International Airport/i).length).toBeGreaterThan(0);
    const airportLabel = screen.getByText("Airport access");
    const airportCard = airportLabel.closest("div");
    expect(airportCard?.textContent).not.toContain("Find airport transfers");
  });

  it("hides an optional category cleanly instead of repeating the placeholder sentence anywhere on the page", () => {
    const destination = buildV31Destination();
    // No bikeability data anywhere on this destination.
    destination.knowledgeProfile = { ...destination.knowledgeProfile, bikeFriendliness: undefined };

    render(<CanonicalDestinationPage destination={destination} />);

    // The redundant Executive Summary / "at a glance" grid (which used to render every remaining
    // fact, including a placeholder sentence for missing ones) was removed entirely - an optional
    // category with genuinely no supported value must not leak its placeholder sentence into any
    // surviving section (hero facts, "What to know first", or per-neighborhood insight cards).
    expect(screen.queryByText("Bikeability")).not.toBeInTheDocument();
    expect(screen.queryByText(/Detailed category information is not available yet/i)).not.toBeInTheDocument();
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

  it("renders all 8 persisted flagship neighborhood cards after expanding the collapsed list (first 4 shown by default)", () => {
    render(<CanonicalDestinationPage destination={buildV31PlaceLinkedDestination()} />);

    fireEvent.click(screen.getByRole("button", { name: /show .* more neighborhoods/i }));

    for (const name of ["Neighborhood A", "Neighborhood B", "Neighborhood C", "Neighborhood D", "Neighborhood E", "Neighborhood F", "Neighborhood G", "Neighborhood H"]) {
      expect(screen.getAllByText(name).length).toBeGreaterThan(0);
    }
  });

  it("renders each neighborhood card and the destination-level unassigned-places section exactly once now that Practical Details and Deep Dive are both always visible (regression: these previously duplicated between the two former tab branches)", () => {
    render(<CanonicalDestinationPage destination={buildV31PlaceLinkedDestination()} />);

    // Scoped to the neighborhood card's own heading - a neighborhood's name legitimately also
    // appears inside each of its own places' now-always-visible detail rows ("Neighborhood: X"),
    // which is real, non-duplicate content, not a regression.
    expect(screen.getAllByRole("heading", { name: "Neighborhood A", level: 4 })).toHaveLength(1);
    expect(screen.getAllByRole("heading", { name: "Neighborhood B", level: 4 })).toHaveLength(1);
    expect(screen.getAllByRole("heading", { name: "Neighborhood C", level: 4 })).toHaveLength(1);
    expect(screen.getAllByRole("heading", { name: "Neighborhood D", level: 4 })).toHaveLength(1);
    // Destination Highlights now standardizes on showing every real place regardless of whether it
    // also has a neighborhoodKey, so a neighborhood-linked place legitimately renders twice (once
    // inside its own neighborhood card, once inside Destination Highlights) - never more than that.
    expect(screen.getAllByText("Neighborhood A Bistro")).toHaveLength(2);
  });


  it("selects the same first-4 neighborhoods deterministically across repeated renders", () => {
    const { unmount } = render(<CanonicalDestinationPage destination={buildV31PlaceLinkedDestination()} />);
    const firstRenderHasD = screen.queryByText("Neighborhood D") !== null;
    unmount();

    render(<CanonicalDestinationPage destination={buildV31PlaceLinkedDestination()} />);
    const secondRenderHasD = screen.queryByText("Neighborhood D") !== null;

    expect(firstRenderHasD).toBe(true);
    expect(secondRenderHasD).toBe(true);
  });

  it("never fabricates a 9th neighborhood beyond the 8 real persisted rows", () => {
    render(<CanonicalDestinationPage destination={buildV31PlaceLinkedDestination()} />);

    expect(screen.queryByText("Neighborhood I")).not.toBeInTheDocument();
  });

  it("renders exactly the real persisted neighborhood count for a destination with 5-8 neighborhoods, never padding to 8 (no fabrication)", () => {
    render(<CanonicalDestinationPage destination={buildV31DestinationWithNeighborhoodCount(6)} />);

    fireEvent.click(screen.getByRole("button", { name: /show .* more neighborhoods/i }));

    expect(screen.getAllByText("Neighborhood E").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Neighborhood F").length).toBeGreaterThan(0);
    // Only 6 real neighborhoods exist - Neighborhood G/H must never appear (no fabrication).
    expect(screen.queryByText("Neighborhood G")).not.toBeInTheDocument();
    expect(screen.queryByText("Neighborhood H")).not.toBeInTheDocument();
  });

  it("filters real places by exact neighborhoodKey - a Neighborhood A restaurant never appears under Neighborhood B", () => {
    render(<CanonicalDestinationPage destination={buildV31PlaceLinkedDestination()} />);

    // Each real restaurant renders exactly twice (its own neighborhood card + Destination
    // Highlights, which now surfaces every real place) - proves no cross-neighborhood duplication
    // (neither ever renders a 3rd time under the wrong neighborhood).
    expect(screen.getAllByText("Neighborhood A Bistro")).toHaveLength(2);
    expect(screen.getAllByText("Neighborhood B Grill")).toHaveLength(2);
  });

  it("renders a place tied to a neighborhood beyond the first 4 once the collapsed list is expanded", () => {
    render(<CanonicalDestinationPage destination={buildV31PlaceLinkedDestination()} />);

    // Destination Highlights (unaffected by the neighborhoods collapse state) already surfaces
    // every real place, so the place is visible exactly once before expanding - the collapsed
    // neighborhood card itself is the only thing gated by the "Show more" control.
    expect(screen.getAllByText("Neighborhood E Cafe")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: /show .* more neighborhoods/i }));

    // After expanding, the place renders twice: once in Destination Highlights (unchanged), once
    // in its now-visible Neighborhood E card.
    expect(screen.getAllByText("Neighborhood E Cafe")).toHaveLength(2);
    // Also renders twice now (Destination Highlights + its now-visible Neighborhood G card).
    expect(screen.getAllByText("Neighborhood G Golf Club")).toHaveLength(2);
  });

  it("surfaces a real place tied to a neighborhood outside the flagship 4 (e.g. golf), with exact neighborhoodKey linkage preserved", () => {
    render(<CanonicalDestinationPage destination={buildV31PlaceLinkedDestination()} />);

    fireEvent.click(screen.getByRole("button", { name: /show .* more neighborhoods/i }));

    // Renders twice (Destination Highlights' golf bucket + its own now-visible Neighborhood G
    // card) - never a 3rd time under an unrelated neighborhood.
    expect(screen.getAllByText("Neighborhood G Golf Club")).toHaveLength(2);
    // Still never leaks into an unrelated neighborhood's card.
    expect(screen.getAllByText("Neighborhood A Bistro").length).toBeGreaterThan(0);
  });

  it("renders a real clickable website link in the DOM for a place with websiteUrl, with no click required to reveal it", () => {
    render(<CanonicalDestinationPage destination={buildV31PlaceLinkedDestination()} />);

    const websiteLink = screen.getAllByText("Visit website")[0].closest("a");
    expect(websiteLink).toHaveAttribute("href", "https://neighborhood-a-bistro.example-test.invalid/");
  });

  it("renders a real clickable Maps link in the DOM for a place with googleMapsUrl, with no click required to reveal it", () => {
    render(<CanonicalDestinationPage destination={buildV31PlaceLinkedDestination()} />);

    const mapsLink = screen.getAllByText("Open on Google Maps")[0].closest("a");
    expect(mapsLink).toHaveAttribute("href", "https://maps.example-test.invalid/neighborhood-a-bistro");
  });

  it("shows both Website and Maps actions when a real place has both links", () => {
    render(<CanonicalDestinationPage destination={buildV31PlaceLinkedDestination()} />);

    expect(screen.getAllByText("Visit website").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Open on Google Maps").length).toBeGreaterThan(0);
  });

  it("does not invent a fake URL when a real place has no website, maps, or source link at all", () => {
    render(<CanonicalDestinationPage destination={buildV31PlaceLinkedDestination()} />);

    // Renders in both its neighborhood card and Destination Highlights - neither occurrence may
    // ever invent a URL for a place that genuinely has none.
    const noLinkPlaceCards = screen.getAllByText("Neighborhood A No Link Diner").map((el) => el.closest("details") as HTMLElement);
    expect(noLinkPlaceCards.length).toBeGreaterThan(0);
    for (const card of noLinkPlaceCards) {
      expect(within(card).queryByText("Visit website")).not.toBeInTheDocument();
      expect(within(card).queryByText("Open on Google Maps")).not.toBeInTheDocument();
    }
  });

  it("removes an editorial 'retain as UNKNOWN' instruction from a place's public description while preserving the rest of the real description text", () => {
    const destination = buildV31PlaceLinkedDestination();
    const bistro = destination.v31Modules!.places.find((place) => place.name === "Neighborhood A Bistro")!;
    (bistro as { description: string }).description = "Mercato Coperto / central food-market search retain as `UNKNOWN` until exact current official operating record is confirmed.";

    render(<CanonicalDestinationPage destination={destination} />);

    expect(screen.getAllByText(/Mercato Coperto \/ central food-market search/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/retain as/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/UNKNOWN/)).not.toBeInTheDocument();
  });

  it("omits a category entirely when a neighborhood has zero real places for it (no forced empty category)", () => {
    render(<CanonicalDestinationPage destination={buildV31PlaceLinkedDestination()} />);

    // Neighborhood A has no real golf/healthcare/attractions places - these distinctive
    // compound category labels (unique to the real-places grouping) must not appear.
    expect(screen.queryByText("Entertainment & nightlife")).not.toBeInTheDocument();
    expect(screen.queryByText("Attractions & things to do")).not.toBeInTheDocument();
    expect(screen.queryByText("Outdoor recreation")).not.toBeInTheDocument();
  });

  it("does not replace real persisted places with generic 'More local detail coming soon' filler for categories that have real data", () => {
    render(<CanonicalDestinationPage destination={buildV31PlaceLinkedDestination()} />);

    // Real restaurant/coffee content must be present, not replaced by filler text for those
    // categories (present in both the neighborhood card and Destination Highlights).
    expect(screen.getAllByText("Neighborhood A Bistro").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Neighborhood A Coffee Co").length).toBeGreaterThan(0);
  });

  function buildV31DestinationWithManyRestaurantsInOneNeighborhood(): CanonicalDestination {
    const destination = buildV31Destination();
    destination.v31Modules = {
      ...destination.v31Modules!,
      neighborhoods: [{ neighborhoodKey: "nb-many", name: "Many Restaurants Neighborhood", summary: "Has more than 4 real restaurants.", areaType: "urban" }],
      places: Array.from({ length: 5 }, (_, i) => ({
        placeKey: `many-restaurant-${i + 1}`,
        category: "restaurant",
        name: `Many Restaurant ${i + 1}`,
        description: `Real restaurant ${i + 1}.`,
        neighborhoodKey: "nb-many",
        websiteUrl: null,
        googleMapsUrl: null,
        sourceUrl: null,
        address: null,
        phone: null,
        displayOrder: String(i + 1),
      })),
    };
    return destination;
  }

  it("renders every real place in a category directly, with no click required and no artificial cap", () => {
    render(<CanonicalDestinationPage destination={buildV31DestinationWithManyRestaurantsInOneNeighborhood()} />);

    // Each also appears in Destination Highlights (neighborhood-linked places are no longer
    // exclusive to their neighborhood card), so at least one occurrence of each is asserted here.
    expect(screen.getAllByText("Many Restaurant 1").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Many Restaurant 4").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Many Restaurant 5").length).toBeGreaterThan(0);
  });

  function buildV31DestinationWithUnassignedPlaces(): CanonicalDestination {
    const destination = buildV31Destination();
    destination.v31Modules = {
      ...destination.v31Modules!,
      neighborhoods: [{ neighborhoodKey: "nb-linked", name: "Linked Neighborhood", summary: "Has a correctly linked real place.", areaType: "urban" }],
      places: [
        {
          placeKey: "linked-restaurant",
          category: "restaurant",
          name: "Linked Neighborhood Bistro",
          description: "A real restaurant correctly tied to its neighborhood.",
          neighborhoodKey: "nb-linked",
          websiteUrl: null,
          googleMapsUrl: null,
          sourceUrl: null,
          address: null,
          phone: null,
          displayOrder: "1",
        },
        {
          placeKey: "unassigned-golf",
          category: "golf",
          name: "Test Destination Golf Club",
          description: "A real golf course not tied to any single neighborhood.",
          neighborhoodKey: null,
          websiteUrl: "https://test-golf.example-test.invalid/",
          googleMapsUrl: "https://maps.example-test.invalid/test-golf",
          sourceUrl: null,
          address: null,
          phone: null,
          displayOrder: "1",
        },
        {
          placeKey: "unassigned-sports",
          category: "sports",
          name: "Test Sports Complex",
          description: "A real sports facility not tied to any single neighborhood.",
          neighborhoodKey: null,
          websiteUrl: null,
          googleMapsUrl: null,
          sourceUrl: null,
          address: null,
          phone: null,
          displayOrder: "1",
        },
        // A literal duplicate DB row for the same real place (same placeKey) - proves render-time
        // deduplication without requiring any DB/workbook cleanup in this task.
        {
          placeKey: "unassigned-sports",
          category: "sports",
          name: "Test Sports Complex",
          description: "A duplicate row for the same real sports facility.",
          neighborhoodKey: null,
          websiteUrl: null,
          googleMapsUrl: null,
          sourceUrl: null,
          address: null,
          phone: null,
          displayOrder: "2",
        },
        {
          placeKey: "unassigned-coworking",
          category: "coworking",
          name: "Test Coworking Hub",
          description: "A real coworking space not tied to any single neighborhood.",
          neighborhoodKey: null,
          websiteUrl: null,
          googleMapsUrl: null,
          sourceUrl: null,
          address: null,
          phone: null,
          displayOrder: "1",
        },
      ],
    };
    return destination;
  }

  describe("destination-level unassigned-place section (Part B recommendation surfacing)", () => {
    it("renders a golf place with no neighborhoodKey in a destination-level section, reachable without a false neighborhood assignment", () => {
      render(<CanonicalDestinationPage destination={buildV31DestinationWithUnassignedPlaces()} />);

      expect(screen.getByText("Test Destination Golf Club")).toBeInTheDocument();
    });

    it("renders the sports bucket for a real unassigned sports place", () => {
      render(<CanonicalDestinationPage destination={buildV31DestinationWithUnassignedPlaces()} />);

      expect(screen.getByText("Test Sports Complex")).toBeInTheDocument();
      expect(screen.getByText(/Sports & recreation across/)).toBeInTheDocument();
    });

    it("renders the coworking bucket for a real unassigned coworking place", () => {
      render(<CanonicalDestinationPage destination={buildV31DestinationWithUnassignedPlaces()} />);

      expect(screen.getByText("Test Coworking Hub")).toBeInTheDocument();
      expect(screen.getByText(/Coworking across/)).toBeInTheDocument();
    });

    it("uses a generic heading built from the destination's own city name, never a hardcoded destination string", () => {
      const destination = buildV31DestinationWithUnassignedPlaces();
      render(<CanonicalDestinationPage destination={destination} />);

      expect(screen.getByText(`Golf across ${destination.city}`)).toBeInTheDocument();
      expect(screen.queryByText(/Golf across Summerlin/)).not.toBeInTheDocument();
    });

    it("also renders a neighborhood-linked place inside Destination Highlights, in addition to its own neighborhood card", () => {
      render(<CanonicalDestinationPage destination={buildV31DestinationWithUnassignedPlaces()} />);

      // Destination Highlights standardizes on every real place, including ones that also have a
      // neighborhoodKey - so the linked place now legitimately renders twice (its neighborhood card
      // + Destination Highlights), never more than that.
      expect(screen.getAllByText("Linked Neighborhood Bistro")).toHaveLength(2);
    });

    it("never renders an unassigned place inside any neighborhood card", () => {
      render(<CanonicalDestinationPage destination={buildV31DestinationWithUnassignedPlaces()} />);

      // The unassigned golf place's real name never appears more than once (only in the
      // destination-level section) - it is never duplicated into the linked neighborhood's card,
      // which has no real golf place of its own.
      expect(screen.getAllByText("Test Destination Golf Club")).toHaveLength(1);
    });

    it("deduplicates a literal duplicate DB row so the same real place renders exactly once", () => {
      render(<CanonicalDestinationPage destination={buildV31DestinationWithUnassignedPlaces()} />);

      expect(screen.getAllByText("Test Sports Complex")).toHaveLength(1);
    });

    it("is completely absent when a destination has no real places at all", () => {
      const destination = buildV31Destination();
      destination.v31Modules = { ...destination.v31Modules!, neighborhoods: [], places: [] };

      render(<CanonicalDestinationPage destination={destination} />);

      expect(screen.queryByText("Destination highlights")).not.toBeInTheDocument();
    });

    it("shows every unassigned real place directly, with no click required and no artificial cap", () => {
      const destination = buildV31Destination();
      destination.v31Modules = {
        ...destination.v31Modules!,
        neighborhoods: [],
        places: Array.from({ length: 5 }, (_, i) => ({
          placeKey: `unassigned-restaurant-${i + 1}`,
          category: "restaurant",
          name: `Unassigned Restaurant ${i + 1}`,
          description: `Real restaurant ${i + 1} not tied to a neighborhood.`,
          neighborhoodKey: null,
          websiteUrl: null,
          googleMapsUrl: null,
          sourceUrl: null,
          address: null,
          phone: null,
          displayOrder: String(i + 1),
        })),
      };
      render(<CanonicalDestinationPage destination={destination} />);

      expect(screen.getByText("Unassigned Restaurant 1")).toBeInTheDocument();
      expect(screen.getByText("Unassigned Restaurant 4")).toBeInTheDocument();
      expect(screen.getByText("Unassigned Restaurant 5")).toBeInTheDocument();
      // Exactly 5 real places exist in this fixture - no 6th/fabricated entry can appear.
      expect(screen.queryByText("Unassigned Restaurant 6")).not.toBeInTheDocument();
    });
  });
});

