import type { Destination } from "./destinations";
import { NO_VERIFIED_INFO } from "./consumer-copy";
import { generatedDestinationCardFacts } from "./generated-destination-card-facts";

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

type IntelligenceScorecardItem = {
  category: string;
  score: number;
  context: string;
};

type IntelligenceProfileItem = {
  label: string;
  value: string;
  note?: string;
  sourceUrl?: string;
};

type IntelligenceProfileSection = {
  title: string;
  summary: string;
  items: IntelligenceProfileItem[];
};

export type DestinationIntelligence = {
  aiSummary: string;
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
  livingHereScorecard: IntelligenceScorecardItem[];
  planningSignals: Array<{ label: string; tone: "strong" | "review"; detail: string }>;
  briefingSections: IntelligenceSection[];
  comprehensiveSections: IntelligenceProfileSection[];
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

const clampScore = (score: number) => Math.max(55, Math.min(99, Math.round(score)));

const toUnknown = (value: string | undefined) => value ?? NO_VERIFIED_INFO;

const toRange = (base: number, spread: number) => {
  const low = Math.max(850, Math.round(base - spread));
  const high = Math.round(base + spread);
  return `${low.toLocaleString()}-${high.toLocaleString()} / month`;
};

const formatCount = (count?: number): string => (typeof count === "number" ? count.toLocaleString() : "Unavailable");

const avg = (values: Array<number | undefined>): number | null => {
  const filtered = values.filter((value): value is number => typeof value === "number");
  if (filtered.length === 0) return null;
  return Math.round((filtered.reduce((total, value) => total + value, 0) / filtered.length) * 10) / 10;
};

const sum = (values: Array<number | undefined>): number | null => {
  const filtered = values.filter((value): value is number => typeof value === "number");
  if (filtered.length === 0) return null;
  return filtered.reduce((total, value) => total + value, 0);
};

const ratio = (part: number, whole: number): number => {
  if (whole <= 0) return 0;
  return Math.max(0, Math.min(1, part / whole));
};

const formatMaybeNumber = (value: number | null, suffix = ""): string => (typeof value === "number" ? `${value}${suffix}` : "Unavailable");

const factResources = (destination: Destination) => {
  const facts = generatedDestinationCardFacts[destination.slug]?.facts ?? [];
  return facts.map((fact, index) => ({
    id: `${destination.slug}-fact-${index + 1}`,
    title: fact.label,
    description: fact.value,
    url: fact.sourceUrl ?? "",
    category: fact.label.toLowerCase().includes("airport")
      ? "transportation"
      : fact.label.toLowerCase().includes("health")
        ? "healthcare"
        : fact.label.toLowerCase().includes("visa") || fact.label.toLowerCase().includes("resid")
          ? "residency"
          : fact.label.toLowerCase().includes("tax")
            ? "taxes"
            : "local",
    sourceType: fact.sourceUrl ? "official_link" : null,
    verifiedAt: null,
  }));
};

const groupedFactValues = (destination: Destination, label: string) => {
  const facts = generatedDestinationCardFacts[destination.slug]?.facts ?? [];
  return facts.filter((fact) => fact.label.toLowerCase() === label.toLowerCase()).map((fact) => fact.value);
};

const firstFactValue = (destination: Destination, label: string) => {
  const values = groupedFactValues(destination, label);
  return values.length > 0 ? values[0] : null;
};

const missingValueRegex = /^(unavailable|not published|no structured|no .* yet|see source references below|data pending)$/i;

const isMissingValue = (value: string) => missingValueRegex.test(value.trim());

const contextualFallbackValue = (
  sectionTitle: string,
  itemLabel: string,
  destination: Destination,
  scoreHints: { internet: number; walkability: number; food: number; safety: number },
) => {
  const city = destination.city;
  const country = destination.country;
  const label = itemLabel.toLowerCase();
  const section = sectionTitle.toLowerCase();

  if (section.includes("climate")) {
    return `Verify month-level weather for ${city} before locking housing or scouting dates.`;
  }
  if (section.includes("cost")) {
    return `Use live local listings and grocery baskets in ${city} to calibrate this line item.`;
  }
  if (section.includes("healthcare")) {
    return `Shortlist named hospitals in ${city} and validate specialist wait times directly.`;
  }
  if (section.includes("transport")) {
    return `Open map routes for ${city} and test airport + daily-errand travel time assumptions.`;
  }
  if (section.includes("lifestyle")) {
    return `Audit this in ${city} by district; score trends are ${scoreHints.food >= 80 ? "strong" : "mixed"} for day-to-day fit.`;
  }
  if (section.includes("demographics")) {
    return `Pull current municipal and national statistics for ${city} to confirm this signal.`;
  }
  if (section.includes("retirement")) {
    return `Treat as planning-critical for ${country}; validate with current legal and tax advisers before decisions.`;
  }
  if (section.includes("housing")) {
    return `Compare at least 3 neighborhoods in ${city} for rent, noise, slope, and walkability.`;
  }
  if (section.includes("dining")) {
    return `Build a local short-list in ${city} from neighborhood-level sources, not citywide lists.`;
  }
  if (section.includes("practical")) {
    return `Confirm this from city and national official portals for ${city}, ${country}.`;
  }
  if (section.includes("weather")) {
    return `Validate monthly highs/lows and humidity for ${city} before seasonal planning.`;
  }
  if (section.includes("real estate")) {
    return `Use active listings in ${city} to replace broad assumptions with street-level comps.`;
  }
  if (section.includes("families") || section.includes("internet")) {
    return `Check this against your weekly routine in ${city}; current model indicates internet ${scoreHints.internet}/100 and walkability ${scoreHints.walkability}/100.`;
  }
  if (section.includes("neighborhood") || section.includes("day trips")) {
    return `Prioritize district-level validation in ${city}; safety trend currently reads ${scoreHints.safety}/100.`;
  }

  if (label.includes("airport")) {
    return `Validate the primary airport for ${city} and its year-round route depth.`;
  }
  if (label.includes("hospital") || label.includes("doctor")) {
    return `Confirm healthcare providers in ${city} with direct facility sources.`;
  }
  if (label.includes("internet")) {
    return `Verify fiber/mobile options in your shortlisted districts in ${city}.`;
  }
  if (label.includes("school")) {
    return `Confirm school catchments and language tracks for neighborhoods you would actually choose in ${city}.`;
  }

  return `Validate this signal with current local sources for ${city}, ${country}.`;
};

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
  const family = hasTag(destination, "family") || hasTag(destination, "expat-friendly");
  const digitalNomad = hasTag(destination, "digital nomad") || hasTag(destination, "expat-friendly");
  const golfTag = hasTag(destination, "golf");
  const details = destination.memberDetails;
  const profileOverrides = destination.relocationProfile;

  const golfCourseCount = (details?.golf?.publicCourses ?? 0) + (details?.golf?.privateCourses ?? 0);
  const restaurantCount = details?.amenities?.restaurants;
  const englishSchoolCount = details?.amenities?.englishSchools;
  const hasHospitalData = Boolean(details?.hospitals?.length);
  const airportFacts = groupedFactValues(destination, "Nearest airport");
  const healthcareFacts = groupedFactValues(destination, "Healthcare");
  const residencyFacts = groupedFactValues(destination, "Residency");
  const taxFacts = groupedFactValues(destination, "Tax");
  const weatherRows = details?.monthlyWeather ?? [];

  const totalFactRows = generatedDestinationCardFacts[destination.slug]?.facts?.length ?? 0;
  const sourceBackedFactRows = (generatedDestinationCardFacts[destination.slug]?.facts ?? []).filter((fact) => Boolean(fact.sourceUrl)).length;
  const climateDataPoints = weatherRows.length;
  const housingSignalCount = Number(housingIsStrong) + Number(budgetFriendly);
  const foodSignalCount = Number(typeof restaurantCount === "number") + Number(cultural);
  const internetSignalCount = Number(digitalNomad) + Number(expat);

  const healthcareEvidence = ratio((details?.hospitals?.length ?? 0) + healthcareFacts.length, 6);
  const airportEvidence = ratio((details?.airports?.length ?? 0) + airportFacts.length, 6);
  const climateEvidence = ratio(climateDataPoints, 12);
  const retirementEvidence = ratio(residencyFacts.length + taxFacts.length, 6);
  const sourceEvidence = ratio(sourceBackedFactRows, Math.max(4, totalFactRows));
  const lifestyleEvidence = ratio(golfCourseCount + (typeof restaurantCount === "number" ? 1 : 0), 12);

  const scoreSafety = clampScore(62 + (safety ? 16 : 0) + Math.round(sourceEvidence * 18));
  const scoreHealthcare = clampScore(60 + (healthcare ? 12 : 0) + Math.round(healthcareEvidence * 24) + Math.round(sourceEvidence * 8));
  const scoreCost = clampScore(60 + (budgetFriendly ? 10 : 0) + housingSignalCount * 6 + Math.round(sourceEvidence * 14));
  const scoreWeather = clampScore(58 + (coastal ? 10 : 5) + Math.round(climateEvidence * 28));
  const scoreGolf = clampScore(55 + (golfTag ? 16 : 0) + Math.min(20, golfCourseCount * 2) + Math.round(lifestyleEvidence * 6));
  const scoreBeaches = clampScore(56 + (coastal ? 24 : 2) + Math.round(airportEvidence * 8));
  const scoreWalkability = clampScore(58 + (walkable ? 20 : 3) + Math.round(sourceEvidence * 12));
  const scoreFood = clampScore(58 + (cultural ? 16 : 4) + foodSignalCount * 5 + Math.round(sourceEvidence * 10));
  const scoreInternet = clampScore(57 + internetSignalCount * 9 + Math.round(sourceEvidence * 12));
  const scoreRetirement = clampScore(60 + (healthcare ? 6 : 0) + (safety ? 6 : 0) + Math.round(retirementEvidence * 18) + Math.round(sourceEvidence * 8));
  const scoreFamily = clampScore(58 + (family ? 12 : 3) + (typeof englishSchoolCount === "number" ? 8 : 0) + Math.round(sourceEvidence * 10));
  const scoreNomad = clampScore(57 + (digitalNomad ? 15 : 3) + Math.round(airportEvidence * 12) + Math.round(sourceEvidence * 8));

  const scoreAverage = Math.round(
    [
      scoreSafety,
      scoreHealthcare,
      scoreCost,
      scoreWeather,
      scoreGolf,
      scoreBeaches,
      scoreWalkability,
      scoreFood,
      scoreInternet,
      scoreRetirement,
      scoreFamily,
      scoreNomad,
    ].reduce((total, score) => total + score, 0) / 12,
  );

  const overallMatch = destination.match > 0 ? clampScore(destination.match) : scoreAverage;

  const monthlyBudgetBase = 2200 + (budgetFriendly ? -450 : 350) + (coastal ? 150 : 0);
  const monthlyBudget = toRange(monthlyBudgetBase, 500);
  const coupleBudget = toRange(monthlyBudgetBase * 1.5, 700);
  const familyBudget = toRange(monthlyBudgetBase * 2.1, 950);

  const baseAiSummary = `${destination.city} feels strongest for people who want ${coastal ? "coastal" : "balanced"} living with ${walkable ? "walkable daily routines" : "a quieter pace"}, supported by ${healthcare ? "credible healthcare signals" : "solid core infrastructure"}. If your goal is a confident long-stay relocation decision, this profile gives you one place to compare costs, climate, healthcare, mobility, neighborhoods, and retirement practicality before booking a scouting trip.`;

  const baseLivingHereScorecard: IntelligenceScorecardItem[] = [
    { category: "Overall Match", score: overallMatch, context: "Weighted from relocation-fit signals." },
    { category: "Safety", score: scoreSafety, context: safety ? "Strong signal in current model." : "Verify neighborhood-level variation." },
    { category: "Healthcare", score: scoreHealthcare, context: hasHospitalData ? "Includes structured facility data." : "Requires facility-level verification." },
    { category: "Cost of Living", score: scoreCost, context: budgetFriendly ? "Value-oriented in current profile." : "Quality-led; model your budget carefully." },
    { category: "Weather", score: scoreWeather, context: coastal ? "Coastal climate profile." : "Seasonality should be validated month-by-month." },
    { category: "Golf", score: scoreGolf, context: golfCourseCount > 0 ? `${golfCourseCount} known public/private courses.` : "Course depth needs local validation." },
    { category: "Beaches", score: scoreBeaches, context: coastal ? "Waterfront access is a core advantage." : "Not a beach-led destination." },
    { category: "Walkability", score: scoreWalkability, context: walkable ? "Daily mobility is likely easier." : "District choice will matter more." },
    { category: "Food", score: scoreFood, context: cultural ? "Good local life and dining potential." : "Research local dining depth by district." },
    { category: "Internet", score: scoreInternet, context: digitalNomad ? "Remote-friendly signal is above baseline." : "Check fiber availability per neighborhood." },
    { category: "Retirement Friendly", score: scoreRetirement, context: "Balanced across healthcare, safety, and cost fit." },
    { category: "Family Friendly", score: scoreFamily, context: typeof englishSchoolCount === "number" ? `${englishSchoolCount} English/bilingual schools tracked.` : "Education ecosystem needs deeper validation." },
    { category: "Digital Nomad", score: scoreNomad, context: "Combines connectivity, transport, and integration factors." },
  ];

  const climateBestMonth = details?.bestMonths ?? (weatherRows.length > 0 ? "See monthly weather table" : "Unavailable");
  const climateAverageHigh = avg(weatherRows.map((row) => row.avgHighC));
  const climateAverageLow = avg(weatherRows.map((row) => row.avgLowC));
  const climateRainfall = sum(weatherRows.map((row) => row.rainfallMm));
  const climateSunshine = avg(weatherRows.map((row) => row.sunshineHours));
  const climateSea = avg(weatherRows.map((row) => row.avgSeaC));
  const climateHottestMonth = weatherRows.reduce<{ month: string; temp: number } | null>((current, row) => {
    if (typeof row.avgHighC !== "number") return current;
    if (!current || row.avgHighC > current.temp) return { month: row.month, temp: row.avgHighC };
    return current;
  }, null);
  const climateWettestMonth = weatherRows.reduce<{ month: string; rainfall: number } | null>((current, row) => {
    if (typeof row.rainfallMm !== "number") return current;
    if (!current || row.rainfallMm > current.rainfall) return { month: row.month, rainfall: row.rainfallMm };
    return current;
  }, null);

  const lowestCostBudget = formatMaybeNumber(monthlyBudgetBase, " / month");

  const baseComprehensiveSections: IntelligenceProfileSection[] = [
    {
      title: "Climate",
      summary: "Actual month-by-month weather matters more than a single score for relocation planning.",
      items: [
        { label: "Average monthly high", value: climateAverageHigh !== null ? `${climateAverageHigh}°C` : "Unavailable" },
        { label: "Average monthly low", value: climateAverageLow !== null ? `${climateAverageLow}°C` : "Unavailable" },
        { label: "Annual rainfall", value: climateRainfall !== null ? `${climateRainfall} mm` : "Unavailable" },
        { label: "Average sunshine hours", value: climateSunshine !== null ? `${climateSunshine} hours/day` : "Unavailable" },
        { label: "Sea temperature", value: climateSea !== null ? `${climateSea}°C` : "Unavailable" },
        { label: "Best months", value: climateBestMonth },
        { label: "Hottest month", value: climateHottestMonth ? `${climateHottestMonth.month} (${climateHottestMonth.temp}°C avg high)` : "Unavailable" },
        { label: "Wettest month", value: climateWettestMonth ? `${climateWettestMonth.month} (${climateWettestMonth.rainfall} mm)` : "Unavailable" },
      ],
    },
    {
      title: "Cost of Living",
      summary: "Use household-level budget planning instead of broad relocation scores.",
      items: [
        { label: "Single person budget", value: `${lowestCostBudget}` },
        { label: "Couple budget", value: coupleBudget },
        { label: "Family of four budget", value: familyBudget },
        { label: "Retired couple budget", value: `${formatMaybeNumber(monthlyBudgetBase + 250, " / month")}` },
        { label: "1BR rent", value: "Unavailable" },
        { label: "2BR rent", value: "Unavailable" },
        { label: "3BR rent", value: "Unavailable" },
        { label: "Utilities", value: "Unavailable" },
        { label: "Internet", value: "Unavailable" },
        { label: "Groceries", value: budgetFriendly ? "Value-led market access likely" : "Premium city pricing likely" },
        { label: "Coffee price", value: "Unavailable" },
        { label: "Dinner for two", value: "Unavailable" },
        { label: "Healthcare costs", value: healthcare ? "Private top-ups likely needed" : "Unavailable" },
      ],
    },
    {
      title: "Healthcare",
      summary: "Named facilities and emergency access should be visible before you book a scouting trip.",
      items: [
        { label: "Public hospitals", value: formatCount(details?.hospitals?.length) },
        { label: "Private hospitals", value: "Unavailable" },
        {
          label: "Top facilities",
          value: details?.hospitals?.length
            ? details.hospitals.slice(0, 3).map((hospital) => hospital.name).join(" • ")
            : healthcareFacts.length > 0
              ? healthcareFacts.join(" • ")
              : "No structured facility list yet",
        },
        { label: "English-speaking doctors", value: expat ? "Likely available in private networks" : "Unavailable" },
        {
          label: "Emergency care",
          value: healthcare ? "Strong enough to warrant further verification" : healthcareFacts.length > 0 ? healthcareFacts[0] : "No structured emergency-care record yet",
        },
        { label: "Pharmacy availability", value: "Unavailable" },
      ],
    },
    {
      title: "Transportation",
      summary: "Airport choice and daily mobility can change the lived experience of the same city.",
      items: [
        {
          label: "Major airports",
          value: details?.airports?.length
            ? details.airports.map((airport) => airport.name).join(" • ")
            : airportFacts.length > 0
              ? airportFacts.join(" • ")
              : "No structured airport list yet",
        },
        { label: "Airport count", value: formatCount(details?.airports?.length) },
        { label: "Distance to airport", value: details?.airports?.[0]?.distance ?? "Unavailable" },
        { label: "Public transportation quality", value: walkable ? "Likely solid in core zones" : "Unavailable" },
        { label: "Walkability", value: `${scoreWalkability}/100` },
        { label: "Bike friendliness", value: coastal ? "Worth verifying by district" : "Unavailable" },
      ],
    },
    {
      title: "Lifestyle",
      summary: "This is where counts and named places matter more than broad appeal statements.",
      items: [
        { label: "Golf courses", value: formatCount(golfCourseCount) },
        { label: "Restaurants", value: formatCount(restaurantCount) },
        { label: "Pickleball courts", value: formatCount(details?.amenities?.pickleballCourts) },
        { label: "Schools", value: formatCount(details?.amenities?.schools) },
        { label: "English schools", value: formatCount(details?.amenities?.englishSchools) },
        { label: "Beaches", value: coastal ? "Coastal access likely" : "Unavailable" },
        { label: "Coffee shops", value: "Unavailable" },
        { label: "Museums", value: "Unavailable" },
        { label: "Nightlife", value: cultural ? "Likely stronger" : "Unavailable" },
      ],
    },
    {
      title: "Demographics",
      summary: "Use real statistics when available and leave the field blank when the data has not been normalized yet.",
      items: [
        { label: "Population", value: "Unavailable" },
        { label: "Median age", value: "Unavailable" },
        { label: "English spoken", value: expat ? "Likely above average in tourist/private-service contexts" : "Unavailable" },
        { label: "Internet speed", value: "Unavailable" },
        { label: "Crime statistics", value: safety ? `${scoreSafety}/100 safety signal` : "Unavailable" },
        { label: "Air quality", value: "Unavailable" },
        { label: "Education level", value: "Unavailable" },
      ],
    },
    {
      title: "Retirement",
      summary: "Visa, tax, insurance, currency, and daily admin need to be visible in one place.",
      items: [
        {
          label: "Retirement visa requirements",
          value: countryVisaHeadlines[destination.country] ?? firstFactValue(destination, "Residency") ?? "Unavailable",
        },
        {
          label: "Residency options",
          value: countryVisaHeadlines[destination.country] ?? firstFactValue(destination, "Residency") ?? "Unavailable",
        },
        {
          label: "Tax information",
          value: countryTaxHeadlines[destination.country] ?? firstFactValue(destination, "Tax") ?? "Unavailable",
        },
        { label: "Healthcare eligibility", value: healthcare ? "Verify public/private eligibility and insurance rules" : "Unavailable" },
        { label: "Currency", value: "Unavailable" },
        { label: "Time zone", value: "Unavailable" },
        { label: "Electrical outlets", value: "Unavailable" },
        { label: "Driving requirements", value: "Unavailable" },
      ],
    },
    {
      title: "Housing",
      summary: "District choice matters more than a generic city label.",
      items: [
        { label: "Best neighborhoods for retirees", value: "Unavailable" },
        { label: "Best neighborhoods for families", value: "Unavailable" },
        { label: "Luxury areas", value: "Unavailable" },
        { label: "Budget areas", value: "Unavailable" },
        { label: "Rental resources", value: "See the resource links below" },
        { label: "Home buying resources", value: "See the resource links below" },
      ],
    },
    {
      title: "Dining",
      summary: "Real restaurant recommendations should come from named places and verified local guides.",
      items: [
        { label: "Best breakfast", value: "Unavailable" },
        { label: "Best coffee", value: "Unavailable" },
        { label: "Best pizza", value: "Unavailable" },
        { label: "Best steak", value: "Unavailable" },
        { label: "Best seafood", value: "Unavailable" },
        { label: "Fine dining", value: "Unavailable" },
        { label: "Local favorites", value: "Unavailable" },
        { label: "Hidden gems", value: "Unavailable" },
      ],
    },
    {
      title: "Practical Information",
      summary: "The stuff people end up searching for at the last minute should live on the page up front.",
      items: [
        { label: "Emergency phone numbers", value: destination.country === "Greece" ? "112" : "Unavailable" },
        { label: "Power outlets", value: "Unavailable" },
        { label: "Internet providers", value: "Unavailable" },
        { label: "Cell providers", value: "Unavailable" },
        { label: "Grocery chains", value: "Unavailable" },
        { label: "Major hospitals", value: details?.hospitals?.length ? details.hospitals.map((hospital) => hospital.name).join(" • ") : "Unavailable" },
        { label: "Universities", value: "Unavailable" },
      ],
    },
    {
      title: "Official resources",
      summary: "Direct source material surfaced from the generated fact bundle when available.",
      items: factResources(destination).map((fact) => ({
        label: fact.title,
        value: fact.description,
        sourceUrl: fact.url,
      })),
    },
    {
      title: "Source-backed highlights",
      summary: "A compact view of the official links and public references currently wired for this destination.",
      items: [
        { label: "Airport links", value: airportFacts.length > 0 ? airportFacts.join(" • ") : "No airport fact bundle yet" },
        { label: "Healthcare links", value: healthcareFacts.length > 0 ? healthcareFacts.join(" • ") : "No healthcare fact bundle yet" },
        { label: "Residency links", value: residencyFacts.length > 0 ? residencyFacts.join(" • ") : "No residency fact bundle yet" },
        { label: "Tax links", value: taxFacts.length > 0 ? taxFacts.join(" • ") : "No tax fact bundle yet" },
      ],
    },
    {
      title: "General",
      summary: "Core orientation data for fast city-level comparison.",
      items: [
        { label: "Country", value: destination.country },
        { label: "Region", value: `${destination.country} region (verify local province/metro in admin data)` },
        { label: "Expat population estimate", value: expat ? "Moderate to high expat visibility" : "Lower expat visibility" },
        { label: "Digital nomad friendliness", value: `${scoreNomad}/100` },
        { label: "Retirement friendliness", value: `${scoreRetirement}/100` },
        { label: "Safety score", value: `${scoreSafety}/100` },
      ],
    },
    {
      title: "Cost of Living",
      summary: "Planning budgets for solo, couple, and family scenarios.",
      items: [
        { label: "Estimated monthly budget", value: monthlyBudget },
        { label: "Couple budget", value: coupleBudget },
        { label: "Family budget", value: familyBudget },
        { label: "Rent ranges", value: budgetFriendly ? "Below premium-med coastal benchmarks" : "Premium-leaning in top districts" },
        { label: "Home purchase profile", value: destination.overview.includes("housing-buy profile") ? "Positive buy-side signal in current model" : "Needs market-level verification" },
        { label: "Healthcare cost profile", value: healthcare ? "Likely moderate with private top-ups" : "Cost and insurer acceptance should be modeled" },
      ],
    },
    {
      title: "Weather",
      summary: "Lifestyle viability by season and monthly comfort patterns.",
      items: [
        { label: "Climate summary", value: destination.climate },
        { label: "Best months", value: toUnknown(details?.bestMonths) },
        { label: "Monthly weather table", value: details?.monthlyWeather?.length ? `${details.monthlyWeather.length} months loaded` : NO_VERIFIED_INFO },
        { label: "Humidity and rainfall", value: "Track monthly humidity and rainfall before long-stay commitment" },
        { label: "Extreme weather risks", value: coastal ? "Seasonal coastal storm/watch periods should be checked" : "Heat and rainfall swings should be checked" },
      ],
    },
    {
      title: "Healthcare",
      summary: "Hospital access and practical care readiness.",
      items: [
        { label: "Top hospitals", value: details?.hospitals?.length ? details.hospitals.slice(0, 2).map((h) => h.name).join(", ") : NO_VERIFIED_INFO },
        { label: "Hospital depth", value: details?.hospitals?.length ? `${details.hospitals.length} facilities listed` : NO_VERIFIED_INFO },
        { label: "English-speaking doctors", value: expat ? "Likely available in private networks" : "Verify provider by provider" },
        { label: "Emergency care quality", value: healthcare ? "Above baseline signal" : "Requires local validation" },
        { label: "Private/public mix", value: "Evaluate private speed versus public breadth for your age profile" },
      ],
    },
    {
      title: "Transportation",
      summary: "Airport and intra-city mobility for everyday life.",
      items: [
        { label: "Nearest international airport", value: details?.airports?.[0]?.name ?? NO_VERIFIED_INFO },
        { label: "Airport distance", value: details?.airports?.[0]?.distance ?? NO_VERIFIED_INFO },
        { label: "Public transportation quality", value: walkable ? "Likely strong in core zones" : "Varies by district" },
        { label: "Walkability score", value: `${scoreWalkability}/100` },
        { label: "Traffic score", value: coastal ? "Seasonal surge risk in peak months" : "Moderate; validate commute corridors" },
      ],
    },
    {
      title: "Real Estate",
      summary: "Housing choices from practical rentals to premium ownership.",
      items: [
        { label: "Rental market", value: budgetFriendly ? "Value-oriented rental pockets likely" : "Demand-led in top neighborhoods" },
        { label: "Luxury housing", value: coastal ? "Strong waterfront and premium district options" : "Boutique high-end pockets" },
        { label: "Waterfront housing", value: coastal ? "Available" : "Limited" },
        { label: "Listing workflow", value: "Use Horizon resource stack plus local portals for district-level comps" },
      ],
    },
    {
      title: "Lifestyle and Recreation",
      summary: "Golf, beaches, outdoor, food, and entertainment in one view.",
      items: [
        { label: "Golf courses", value: golfCourseCount > 0 ? `${golfCourseCount} tracked courses` : NO_VERIFIED_INFO },
        { label: "Beach and waterfront", value: coastal ? "Core lifestyle driver" : "Secondary" },
        { label: "Restaurants", value: typeof restaurantCount === "number" ? `${restaurantCount.toLocaleString()} tracked` : NO_VERIFIED_INFO },
        { label: "Outdoor life", value: "Use map layer + day-trip stack to evaluate trails, parks, and nature access" },
        { label: "Entertainment", value: cultural ? "Likely stronger culture/events density" : "Quieter event profile" },
      ],
    },
    {
      title: "Families, Work, and Internet",
      summary: "Family readiness and remote-work practicality.",
      items: [
        { label: "Family friendly score", value: `${scoreFamily}/100` },
        { label: "English-speaking schools", value: typeof englishSchoolCount === "number" ? `${englishSchoolCount} tracked` : NO_VERIFIED_INFO },
        { label: "Childcare and universities", value: "Validate by district and commute pattern" },
        { label: "Internet and coworking", value: `${scoreInternet}/100 internet fit with ${scoreNomad}/100 nomad fit` },
      ],
    },
    {
      title: "Retirement, Neighborhoods, and Day Trips",
      summary: "Decision-critical planning areas before committing to a move.",
      items: [
        { label: "Retirement visa/residency", value: countryVisaHeadlines[destination.country] ?? "Validate pathways with current legal guidance" },
        { label: "Tax orientation", value: countryTaxHeadlines[destination.country] ?? "Obtain specialist tax guidance before assumptions" },
        { label: "Best neighborhoods", value: "Use map + housing + walkability stack to shortlist luxury, value, beach, golf, and family zones" },
        { label: "Day trips", value: "Add top nearby towns, attractions, and weekend loops through admin-managed records" },
        { label: "Media stack", value: "Hero imagery, map embeds, YouTube, and short-form social links supported" },
      ],
    },
  ];

  const scorecardOverrideByCategory = new Map(
    (profileOverrides?.livingHereScorecard ?? []).map((item) => [item.category.toLowerCase(), item]),
  );

  const livingHereScorecard = baseLivingHereScorecard.map((item) => {
    const override = scorecardOverrideByCategory.get(item.category.toLowerCase());
    if (!override) return item;
    return {
      ...item,
      score: typeof override.score === "number" ? clampScore(override.score) : item.score,
      context: override.context?.trim() || item.context,
    };
  });

  const sectionOverrideByTitle = new Map(
    (profileOverrides?.comprehensiveSections ?? []).map((section) => [section.title.toLowerCase(), section]),
  );

  const comprehensiveSections = baseComprehensiveSections.map((section) => {
    const override = sectionOverrideByTitle.get(section.title.toLowerCase());
    const mergedSection = !override
      ? section
      : {
        ...section,
        summary: override.summary?.trim() || section.summary,
        items: Array.isArray(override.items) && override.items.length > 0
          ? override.items.map((item) => ({
              label: item.label,
              value: item.value,
              note: item.note,
            }))
          : section.items,
      };

    return {
      ...mergedSection,
      items: mergedSection.items.map((item) => ({
        ...item,
        value: isMissingValue(item.value)
          ? contextualFallbackValue(
              mergedSection.title,
              item.label,
              destination,
              {
                internet: scoreInternet,
                walkability: scoreWalkability,
                food: scoreFood,
                safety: scoreSafety,
              },
            )
          : item.value,
      })),
    };
  });

  const aiSummary = profileOverrides?.aiSummary?.trim() || baseAiSummary;

  return {
    aiSummary,
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
    livingHereScorecard,
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
    comprehensiveSections,
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