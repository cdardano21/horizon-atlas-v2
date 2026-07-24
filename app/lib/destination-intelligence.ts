import type { Destination } from "./destinations";

type IntelligenceResource = {
  label: string;
  href: string;
  note: string;
};

type IntelligenceSection = {
  title: string;
  summary: string;
  bullets: string[];
};

export type DestinationIntelligence = {
  climateHeadline: string;
  lifestyleHeadline: string;
  healthcareHeadline: string;
  housingHeadline: string;
  costHeadline: string;
  taxHeadline: string;
  visaHeadline: string;
  restaurantHeadline: string;
  internetHeadline: string;
  golfHeadline: string;
  airportHeadline: string;
  beachHeadline: string;
  thingsToDoHeadline: string;
  cultureHeadline: string;
  retirementAdvantages: string[];
  retirementTradeoffs: string[];
  quickFacts: Array<{ label: string; value: string }>;
  planningSignals: Array<{ label: string; tone: "strong" | "review"; detail: string }>;
  briefingSections: IntelligenceSection[];
  resources: {
    rentals: IntelligenceResource[];
    healthcare: IntelligenceResource[];
    restaurants: IntelligenceResource[];
    taxes: IntelligenceResource[];
    visas: IntelligenceResource[];
    relocation: IntelligenceResource[];
  };
  mapSearchUrl: string;
  mapEmbedUrl: string;
  youtubeUrl: string;
  youtubeEmbedUrl: string;
};

const hasTag = (destination: Destination, tag: string) =>
  destination.tags?.map((item) => item.toLowerCase()).includes(tag) ?? false;

const countryTaxHeadlines: Record<string, string> = {
  Italy: "Tax treatment can be highly favorable in specific retiree-qualified municipalities, but eligibility must be verified before planning around it.",
  Portugal: "Portugal remains attractive for international retirees, but personal tax planning should be modeled carefully against current residency rules.",
  Spain: "Spain can be straightforward operationally, but residency and tax residency timing should be reviewed with a cross-border specialist.",
  Greece: "Greek residency and tax treatment may work well for some retirees, but practical setup details should be checked early.",
  Croatia: "Croatia is promising operationally, but tax residency and healthcare coordination deserve careful review before committing.",
  Montenegro: "Montenegro may offer flexibility and value, but formal tax and long-stay planning should be confirmed locally.",
  Slovenia: "Slovenia can support a stable long-term plan, though formal residency and tax treatment should be verified before moving.",
  Japan: "Japan offers strong quality-of-life fundamentals, but immigration pathways and tax implications should be reviewed in detail before relying on them.",
};

const countryVisaHeadlines: Record<string, string> = {
  Italy: "Long-stay and elective residence pathways can work, but documentation, passive-income proof, and municipality-level details matter.",
  Portugal: "Portugal typically requires a clear legal residency route and documentation package, so pathway timing should be planned in advance.",
  Spain: "Spain often works best when residency paperwork, proof-of-means, and healthcare coverage are organized before relocation.",
  Greece: "Greece can be attractive operationally, though application timing and residency documentation should be mapped carefully.",
  Croatia: "Croatia usually requires a well-documented long-stay path, with private healthcare and local admin steps considered up front.",
  Montenegro: "Montenegro can be easier than some EU pathways, but local legal guidance still helps avoid avoidable delays.",
  Slovenia: "Slovenia requires more deliberate paperwork and should be treated as a formal planning exercise rather than a casual move.",
  Japan: "Japan is not a casual retirement move; visa strategy should be validated before treating the destination as relocation-ready.",
};

const getAirportSignal = (destination: Destination) =>
  hasTag(destination, "airport access") || destination.transportation.toLowerCase().includes("90/10")
    ? "Well connected"
    : "Regional access";

const getClimateSignal = (destination: Destination) =>
  hasTag(destination, "beach") || hasTag(destination, "coast") || hasTag(destination, "summer escape")
    ? "Warm-weather bias"
    : "Balanced four-season profile";

const buildResourceQuery = (destination: Destination, suffix: string) =>
  encodeURIComponent(`${destination.city} ${destination.country} ${suffix}`);

export function getDestinationIntelligence(destination: Destination): DestinationIntelligence {
  const mapSearchUrl = `https://www.google.com/maps/search/${encodeURIComponent(`${destination.city}, ${destination.country}`)}`;
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(`${destination.city}, ${destination.country}`)}&z=12&output=embed`;
  const youtubeUrl = `https://www.youtube.com/results?search_query=${buildResourceQuery(destination, "retirement guide")}`;
  const youtubeEmbedUrl = `https://www.youtube.com/embed?listType=search&list=${buildResourceQuery(destination, "retirement guide neighborhood tour")}`;
  const housingIsStrong = destination.overview.toLowerCase().includes("excellent housing-buy profile");
  const walkable = hasTag(destination, "walkability");
  const healthcare = hasTag(destination, "healthcare");
  const safety = hasTag(destination, "safety");
  const expat = hasTag(destination, "expat-friendly") || hasTag(destination, "digital nomad");
  const budgetFriendly = hasTag(destination, "value");
  const coastal = hasTag(destination, "coast") || hasTag(destination, "beach");
  const cultural = hasTag(destination, "culture") || hasTag(destination, "city");

  return {
    climateHeadline: destination.climate,
    lifestyleHeadline: destination.lifestyle,
    healthcareHeadline: healthcare
      ? `${destination.city} screens as a stronger healthcare-aligned option in the current model, but hospital network, insurance acceptance, and specialist access should still be verified locally.`
      : `${destination.city} may still work well, but healthcare specifics should be validated before treating it as a core advantage.`,
    housingHeadline: housingIsStrong
      ? `${destination.city} currently reads as one of the stronger housing-fit options in the launch dataset, which makes it worth deeper rental and purchase-market review.`
      : `${destination.city} may require closer housing-market validation, especially if budget control is one of your main decision drivers.`,
    costHeadline: budgetFriendly
      ? `${destination.city} appears more likely to support a favorable cost-to-lifestyle balance, though your exact spending pattern still needs local validation.`
      : `${destination.city} may reward quality of life more than low spending, so it should be modeled carefully against your personal budget.`,
    taxHeadline: countryTaxHeadlines[destination.country] ?? "Tax treatment is not fully normalized yet, so professional review is still required before making financial assumptions.",
    visaHeadline: countryVisaHeadlines[destination.country] ?? "Visa and long-stay planning should be treated as a formal workstream and validated against current immigration rules.",
    restaurantHeadline: hasTag(destination, "culture")
      ? `${destination.city} is more likely to reward someone who values dining, street life, and repeatable neighborhood experiences over purely transactional convenience.`
      : `${destination.city} may be less about culinary density and more about overall lifestyle fit, so restaurant research is still worth doing city by city.`,
    internetHeadline: expat
      ? `${destination.city} has stronger odds of supporting modern connectivity expectations, especially if you value digital flexibility or hybrid work habits.`
      : `${destination.city} may still work well, but internet reliability and home-office practicality should be checked neighborhood by neighborhood.`,
    golfHeadline: coastal || budgetFriendly
      ? `${destination.city} is worth screening for golf access if leisure-oriented routines matter to you, especially in the broader regional catchment.`
      : `${destination.city} is less obviously golf-led in the current model, so recreational fit should be validated based on your actual hobbies.`,
    airportHeadline: getAirportSignal(destination) === "Well connected"
      ? `${destination.city} appears better positioned for regular family travel and onward connections.`
      : `${destination.city} may require more tolerance for regional routing and longer travel days.`,
    beachHeadline: coastal
      ? `${destination.city} is meaningfully supported by coastal lifestyle signals, which can strengthen daily quality of life if water access matters to you.`
      : `${destination.city} is less about beach access and more about overall liveability, culture, or structural stability.`,
    thingsToDoHeadline: cultural || coastal || walkable
      ? `${destination.city} looks more likely to sustain daily interest through neighborhood exploration, dining, waterfront life, or walkable routines.`
      : `${destination.city} may depend more on personal routine and quieter living than on constant activity density.`,
    cultureHeadline: cultural
      ? `${destination.city} likely offers more repeatable character and local identity, which matters if you want your environment to keep feeling alive over time.`
      : `${destination.city} may be appealing more for ease and stability than for strong cultural immersion alone.`,
    retirementAdvantages: [
      healthcare ? "Healthcare is a relative strength in the current model." : null,
      safety ? "Safety reads as a meaningful advantage for everyday retirement confidence." : null,
      walkable ? "Walkability supports a lighter, lower-friction daily routine." : null,
      budgetFriendly ? "Value orientation can stretch retirement income further." : null,
      coastal ? "Coastal access can materially improve lifestyle quality if sea proximity matters to you." : null,
      expat ? "Expat-friendly or internationally aware signals may ease the transition phase." : null,
    ].filter(Boolean) as string[],
    retirementTradeoffs: [
      !budgetFriendly ? "Cost structure may need closer validation against your budget." : null,
      !healthcare ? "Healthcare should be confirmed in detail before treating it as a strength." : null,
      !walkable ? "Daily mobility could depend more on district choice or transportation planning." : null,
      !expat ? "Integration may rely more on personal initiative and local adaptation." : null,
      !coastal ? "If beach living is central to your ideal future, this may be a weaker fit." : null,
    ].filter(Boolean) as string[],
    quickFacts: [
      { label: "Lifestyle lens", value: walkable ? "Walkable daily rhythm" : "More location-specific mobility" },
      { label: "Climate bias", value: getClimateSignal(destination) },
      { label: "Airport access", value: getAirportSignal(destination) },
      { label: "Community fit", value: expat ? "Easier for transition" : "Requires deeper local integration" },
    ],
    planningSignals: [
      {
        label: "Healthcare confidence",
        tone: healthcare ? "strong" : "review",
        detail: healthcare ? "Strong relative signal in the launch model." : "Needs deeper local verification before deciding.",
      },
      {
        label: "Safety profile",
        tone: safety ? "strong" : "review",
        detail: safety ? "Day-to-day security looks like a relative strength." : "Check neighborhood-level safety and routines." ,
      },
      {
        label: "Housing practicality",
        tone: housingIsStrong ? "strong" : "review",
        detail: housingIsStrong ? "Worth serious rental and purchase-market analysis." : "Do not assume value without current market checks.",
      },
    ],
    briefingSections: [
      {
        title: "Healthcare and everyday support",
        summary: "Treat healthcare as both an emergency question and an aging-in-place question.",
        bullets: [
          "Validate hospital networks, private clinics, and specialist access within realistic travel time.",
          "Check whether the city supports your preferred mix of public and private healthcare options.",
          "Map out pharmacies, diagnostics, and bilingual provider availability before a scouting trip.",
        ],
      },
      {
        title: "Visas, residency, and compliance",
        summary: "A great city can still fail operationally if the paperwork path is weak or slow.",
        bullets: [
          "Confirm the actual long-stay route that fits your income, citizenship, and retirement structure.",
          "Review tax-residency timing, proof-of-funds requirements, and documentation lead times.",
          "Plan your move sequence around residency approval, insurance, and housing commitments.",
        ],
      },
      {
        title: "Housing and neighborhood selection",
        summary: "The city may be right while the wrong district ruins the experience.",
        bullets: [
          "Compare central walkable neighborhoods against quieter edges for noise, convenience, and value.",
          "Track rental inventory, furnished options, and lease terms before treating the move as low-friction.",
          "Use street-level exploration and maps to judge slope, sidewalks, and proximity to daily essentials.",
        ],
      },
    ],
    resources: {
      rentals: [
        {
          label: "Rental listings",
          href: `https://www.google.com/search?q=${buildResourceQuery(destination, "rent apartments")}`,
          note: "Start with broad inventory to understand pricing and district variety.",
        },
        {
          label: "Neighborhood research",
          href: mapSearchUrl,
          note: "Use maps to compare walkability, grocery access, and district layout.",
        },
      ],
      healthcare: [
        {
          label: "Hospital search",
          href: `https://www.google.com/search?q=${buildResourceQuery(destination, "hospital private clinic")}`,
          note: "Review both hospitals and private outpatient options.",
        },
        {
          label: "Doctor and specialist reviews",
          href: `https://www.google.com/search?q=${buildResourceQuery(destination, "doctor reviews specialist")}`,
          note: "Useful for checking language access and patient feedback patterns.",
        },
      ],
      restaurants: [
        {
          label: "Restaurant map",
          href: `https://www.google.com/search?q=${buildResourceQuery(destination, "best restaurants")}`,
          note: "Evaluate depth, not just a few tourist highlights.",
        },
        {
          label: "Local food video search",
          href: `https://www.youtube.com/results?search_query=${buildResourceQuery(destination, "food tour")}`,
          note: "Helps judge street life, cafe culture, and neighborhood rhythm.",
        },
      ],
      taxes: [
        {
          label: "Tax planning research",
          href: `https://www.google.com/search?q=${buildResourceQuery(destination, "retiree tax residency")}`,
          note: "Use this to identify the issues to review with a cross-border advisor.",
        },
      ],
      visas: [
        {
          label: "Residency pathway research",
          href: `https://www.google.com/search?q=${buildResourceQuery(destination, "retirement visa residency")}`,
          note: "Start with current requirements, then validate via official sources.",
        },
      ],
      relocation: [
        {
          label: "YouTube relocation overview",
          href: youtubeUrl,
          note: "Useful for first-person walkthroughs and district impressions.",
        },
        {
          label: "Official tourism and city guide",
          href: `https://www.google.com/search?q=${buildResourceQuery(destination, "official tourism")}`,
          note: "Good for transport, culture, events, and public-facing city information.",
        },
      ],
    },
    mapSearchUrl,
    mapEmbedUrl,
    youtubeUrl,
    youtubeEmbedUrl,
  };
}