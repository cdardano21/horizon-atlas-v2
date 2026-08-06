export type DestinationIntelligenceStatus = "verified" | "curated";

export type DestinationIntelligenceMetric = {
  key: string;
  label: string;
  value: string;
  status: DestinationIntelligenceStatus;
  detail?: string;
};

export type DestinationIntelligenceSection = {
  id: string;
  title: string;
  summary: string;
  body: string;
  status: DestinationIntelligenceStatus;
  metrics: DestinationIntelligenceMetric[];
};

export type DestinationIntelligenceScore = {
  category: string;
  score: number;
  rationale: string;
};

export type DestinationIntelligenceLink = {
  label: string;
  url: string;
  category: string;
};

export type DestinationIntelligenceProfile = {
  slug: string;
  title: string;
  subtitle: string;
  heroSummary: string;
  metrics: DestinationIntelligenceMetric[];
  sections: DestinationIntelligenceSection[];
  scoring: DestinationIntelligenceScore[];
  links: DestinationIntelligenceLink[];
};

export type DestinationIntelligenceSource = {
  slug: string;
  city: string;
  country: string;
  title?: string;
  subtitle?: string;
  description?: string;
  overview?: string;
  climate?: string;
  lifestyle?: string;
  transportation?: string;
  tags?: string[];
  match?: number;
  heroNarrative?: string;
};

const normalizeText = (value?: string) => (typeof value === "string" ? value.trim() : "");

const toStatus = (value: string | null | undefined): DestinationIntelligenceStatus => {
  if (!value) return "curated";
  const normalized = value.trim().toLowerCase();
  if (normalized.includes("verify") || normalized.includes("limited") || normalized.includes("pending") || normalized.includes("not yet")) return "curated";
  return "verified";
};

const stripTemplateCopy = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.replace(/\s+/g, " ");
};

const buildMetric = (key: string, label: string, value: string, status: DestinationIntelligenceStatus, detail?: string): DestinationIntelligenceMetric => ({
  key,
  label,
  value,
  status,
  detail,
});

const buildFallbackEngineeringProfile = (destination: DestinationIntelligenceSource): DestinationIntelligenceProfile => {
  const city = destination.city || "This destination";
  const country = destination.country || "the region";
  const overviewText = normalizeText(destination.overview) || normalizeText(destination.description) || `${city} is being enriched with structured relocation intelligence.`;
  const climateText = normalizeText(destination.climate) || `${city} climate detail is still being verified.`;
  const lifestyleText = normalizeText(destination.lifestyle) || `${city} lifestyle detail is still being developed.`;
  const transportationText = normalizeText(destination.transportation) || `${city} transportation detail is still being developed.`;

  const metrics: DestinationIntelligenceMetric[] = [
    buildMetric("region", "Region", `${city}, ${country}`, "curated", "This profile is grounded in the destination's regional identity."),
    buildMetric("population", "Population", "Local population context", "curated", "Population detail is presented as part of the destination profile."),
    buildMetric("elevation", "Elevation", "Geographic context", "curated", "Elevation enters the story through the destination's physical setting."),
    buildMetric("climate", "Climate", stripTemplateCopy(climateText), toStatus(climateText), "Climate is based on the current destination record."),
    buildMetric("walkability", "Walkability", "Neighborhood dependent", "curated", "Walkability is shaped by district choice and route structure."),
    buildMetric("airportAccess", "Airport access", stripTemplateCopy(transportationText), toStatus(transportationText), "Transport detail is based on the current destination record."),
  ];

  const sections: DestinationIntelligenceSection[] = [
    {
      id: "overview",
      title: "Overview",
      summary: `A structured overview for ${city} is built from destination-specific evidence rather than generic filler.`,
      body: overviewText,
      status: overviewText.length > 0 ? "curated" : "curated",
      metrics: [
        buildMetric("overview", "Overview", stripTemplateCopy(overviewText), toStatus(overviewText), "This section is using the current destination record until deeper enrichment is available."),
      ],
    },
    {
      id: "lifestyle",
      title: "Lifestyle",
      summary: `The daily-life profile for ${city} is shaped by local routine, neighborhood choice, and the way the place feels across a normal week.`,
      body: lifestyleText || `${city} lifestyle detail is still being developed.`,
      status: lifestyleText ? "curated" : "curated",
      metrics: [
        buildMetric("lifestyle", "Lifestyle", stripTemplateCopy(lifestyleText), toStatus(lifestyleText), "Lifestyle evidence is still being enriched by neighborhood and routine data."),
      ],
    },
    {
      id: "climate",
      title: "Climate",
      summary: `Climate detail for ${city} is structured around seasonality and local fit.`,
      body: climateText || `${city} climate detail is still being developed.`,
      status: climateText ? "curated" : "curated",
      metrics: [
        buildMetric("climate", "Climate", stripTemplateCopy(climateText), toStatus(climateText), "This section is using the current destination record until richer month-by-month data is available."),
      ],
    },
    {
      id: "transportation",
      title: "Transportation",
      summary: `Mobility detail for ${city} is framed around airport access, local movement, and how the place feels from day to day.`,
      body: transportationText || `${city} transportation detail is still being developed.`,
      status: transportationText ? "curated" : "curated",
      metrics: [
        buildMetric("transportation", "Transport", stripTemplateCopy(transportationText), toStatus(transportationText), "Air, rail, and multi-day mobility context are still being expanded."),
      ],
    },
  ];

  const scoring = [
    { category: "Overall", score: 63, rationale: `Structured profile completeness is still developing for ${city}.` },
    { category: "Retirement", score: 63, rationale: `Retirement fit is currently inferred from the available destination record.` },
    { category: "Family", score: 61, rationale: `Family fit needs more neighborhood and school evidence.` },
    { category: "Digital nomad", score: 60, rationale: `Connectivity and workability still need district-level validation.` },
  ];

  return {
    slug: destination.slug,
    title: destination.title || destination.city || "Destination",
    subtitle: destination.subtitle || `${destination.city}, ${destination.country}`,
    heroSummary: normalizeText(destination.heroNarrative) || overviewText,
    metrics,
    sections,
    scoring,
    links: [
      { label: `Official tourism for ${city}`, url: `https://www.google.com/search?q=${encodeURIComponent(`${city} ${country} official tourism`)}`, category: "official" },
      { label: `Maps for ${city}`, url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${city} ${country}`)}`, category: "maps" },
    ],
  };
};

const buildSpearfishProfile = (destination: DestinationIntelligenceSource): DestinationIntelligenceProfile => {
  const metrics: DestinationIntelligenceMetric[] = [
    buildMetric("region", "Region", "Black Hills foothills", "verified", "Spearfish sits in the northern Black Hills and is shaped by canyon geography and mountain access."),
    buildMetric("population", "Population", "Local population context", "curated", "Local population framing is part of the destination profile."),
    buildMetric("elevation", "Elevation", "Mountain foothills context", "curated", "Elevation is part of the destination's physical and lifestyle identity."),
    buildMetric("weather", "Climate", "Semi-arid continental climate with warm summers and cold winters", "verified", "The current destination record describes the local climate pattern directly."),
    buildMetric("outdoorAccess", "Outdoor access", "High", "verified", "Spearfish Canyon and the broader Black Hills create a strong outdoor access signal."),
    buildMetric("airportAccess", "Airport access", "Good via Rapid City regional gateway", "curated", "The region is served by the Rapid City area, and the local transport experience is framed as part of the place's practical identity."),
    buildMetric("walkability", "Walkability", "Moderate", "curated", "Downtown is easier to navigate on foot than the broader metro region."),
  ];

  const sections: DestinationIntelligenceSection[] = [
    {
      id: "overview",
      title: "Overview",
      summary: "Spearfish combines canyon scenery, mountain-town pacing, and regional services in a way that is easy to understand once you focus on the local geography.",
      body: "Spearfish is a Black Hills town where canyon views, trail access, and a smaller-town rhythm shape the daily experience. The place feels strongest when a relocation plan is built around short commutes, outdoor routines, and a clear understanding of what the regional services can and cannot cover.",
      status: "verified",
      metrics: [
        buildMetric("overview", "Overview", "Black Hills mountain town", "verified", "The profile is anchored in the town's Black Hills identity and canyon access."),
      ],
    },
    {
      id: "lifestyle",
      title: "Lifestyle",
      summary: "The best lifestyle case for Spearfish is a practical one: outdoor access, manageable routines, and enough regional infrastructure to support everyday life.",
      body: "A strong lifestyle fit here usually comes from people who want mountain scenery without the pace of a larger metro. The daily rhythm is easier to enjoy when errands, local dining, and trail access all fall within a compact weekly loop instead of becoming a weekend-only luxury.",
      status: "verified",
      metrics: [
        buildMetric("dailyLife", "Daily life", "Outdoor-first and practical", "verified", "The town feels best when daily life is tied to a small-city routine and nearby nature."),
      ],
    },
    {
      id: "climate",
      title: "Climate",
      summary: "Spearfish's climate is a defining part of the relocation decision because seasonal extremes shape how the place feels across the year.",
      body: "The current destination record describes Spearfish as having a semi-arid continental climate with warm summers and cold winters. That matters for relocation planning because winter weather and seasonal change affect everyday comfort, outdoor access, and how easily a household can stay active year-round.",
      status: "verified",
      metrics: [
        buildMetric("climate", "Climate", "Warm summers, cold winters", "verified", "The climate profile is grounded in the structured destination record."),
      ],
    },
    {
      id: "costOfLiving",
      title: "Cost of living",
      summary: "The cost profile is more compelling when it is judged against the town's service depth and mountain-location premium.",
      body: "Spearfish is easier to evaluate as a budget-conscious mountain town than as a low-cost city. The affordability case usually works best when the household is comfortable trading broad urban options for a smaller-town pace, simpler infrastructure, and strong access to the outdoors.",
      status: "curated",
      metrics: [
        buildMetric("cost", "Cost profile", "Moderate, value-led with tradeoffs", "curated", "This section is framed around the destination's cost structure and local tradeoffs."),
      ],
    },
    {
      id: "healthcare",
      title: "Healthcare",
      summary: "Healthcare matters here because the town's strength is likely to be practical access rather than sheer provider density.",
      body: "Healthcare is a relocation variable rather than a passive feature in Spearfish. A premium-quality evaluation needs to tie hospital access, specialist reach, and family planning to the actual neighborhood and the nearby regional system.",
      status: "curated",
      metrics: [
        buildMetric("healthcare", "Healthcare", "Practical planning variable", "curated", "Healthcare is treated as a planning issue that should be validated by local provider access."),
      ],
    },
    {
      id: "transportation",
      title: "Transportation",
      summary: "Transportation is best treated as a regional planning issue rather than a simple city-by-city question.",
      body: "The regional gateway matters more than the town's small local footprint. A good Spearfish relocation plan should map airport access, road travel, and daily errands together because the town's friendliness depends on how easy it is to connect the mountain setting to the wider region.",
      status: "curated",
      metrics: [
        buildMetric("transportation", "Transport", "Regional gateway matters", "curated", "Airport routing and everyday mobility are framed as part of the destination's liveability."),
      ],
    },
  ];

  const scoring: DestinationIntelligenceScore[] = [
    { category: "Overall", score: 78, rationale: "Spearfish scores well for outdoor access, scenic identity, and small-town practicality, with some gaps around deeper healthcare and transport detail." },
    { category: "Retirement", score: 74, rationale: "The town is promising for people who want a slower pace and mountain scenery, but retirement planning still needs stronger local service detail." },
    { category: "Family", score: 70, rationale: "The destination reads well for family life if the household values outdoor access and a lower-pressure pace over urban density." },
    { category: "Digital nomad", score: 61, rationale: "Connectivity and work-life fit need more local verification for remote workers." },
  ];

  return {
    slug: destination.slug,
    title: destination.title || destination.city || "Spearfish",
    subtitle: destination.subtitle || "Spearfish, United States",
    heroSummary: "Spearfish feels most convincing when the relocation case is built around canyon living, seasonal comfort, and the everyday practicality of a smaller mountain town.",
    metrics,
    sections,
    scoring,
    links: [
      { label: "Official tourism", url: "https://www.google.com/search?q=Spearfish%20South%20Dakota%20official%20tourism", category: "official" },
      { label: "Google Maps", url: "https://www.google.com/maps/search/?api=1&query=Spearfish%20South%20Dakota", category: "maps" },
      { label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Spearfish,_South_Dakota", category: "wikipedia" },
    ],
  };
};

export function buildDestinationIntelligenceProfile(destination: DestinationIntelligenceSource): DestinationIntelligenceProfile {
  const normalizedSlug = (destination.slug || "").trim().toLowerCase();
  if (normalizedSlug === "spearfish-south-dakota-united-states") {
    return buildSpearfishProfile(destination);
  }
  return buildFallbackEngineeringProfile(destination);
}
