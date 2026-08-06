import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CanonicalDestinationPage from "./CanonicalDestinationPage";
import type { CanonicalDestination } from "../../lib/canonical-destination-model";

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
    expect(screen.getByText(/Executive summary/i)).toBeInTheDocument();
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
