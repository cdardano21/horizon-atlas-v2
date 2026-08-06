import type { Destination, DestinationKnowledgeProfile, DestinationResearchProfile, PremiumEditorialContent } from "./destinations";
import { getDestinationResearchProfile } from "./destination-research";

export type PremiumDestinationEditorialPackage = {
  overviewArticle: string;
  whatItsReallyLike: string;
  neighborhoodGuide: string;
  retirementGuide: string;
  familyGuide: string;
  digitalNomadGuide: string;
  healthcareGuide: string;
  costOfLivingGuide: string;
  transportationGuide: string;
  climateGuide: string;
  walkabilityGuide: string;
  safetyGuide: string;
  pros: string[];
  cons: string[];
  resourceLinks: Array<{ label: string; url: string }>;
  monthlyBudgets: Array<{ label: string; amount: string; currency: string; note: string }>;
  neighborhoodGuides: Array<{ name: string; whyItWorks: string; fit: string; vibe: string }>;
  scoringNotes: Array<{ category: string; note: string }>;
  heroIntroduction: string;
  whyPeopleLoveIt: string[];
};

const normalize = (value?: string) => (typeof value === "string" ? value.trim() : "");

const buildResourceLinks = (destination: Destination) => {
  const city = destination.city;
  const country = destination.country;
  const query = `${city} ${country}`;
  return [
    { label: "Google Maps", url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` },
    { label: "Google Earth", url: `https://earth.google.com/web/search/${encodeURIComponent(query)}` },
    { label: "Official Tourism", url: `https://www.google.com/search?q=${encodeURIComponent(`${city} ${country} official tourism`)}` },
    { label: "Wikipedia", url: `https://en.wikipedia.org/wiki/${encodeURIComponent(city)}` },
    { label: "YouTube", url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${city} ${country} travel`)}` },
    { label: "Instagram", url: `https://www.instagram.com/explore/tags/${encodeURIComponent(`${city.toLowerCase()}travel`)}` },
  ];
};

const buildBudget = (destination: Destination) => {
  const isUSDestination = /united states|usa/i.test(destination.country);
  const currency = isUSDestination ? "USD" : destination.country === "France" || destination.country === "Germany" || destination.country === "Italy" || destination.country === "Greece" || destination.country === "Spain" || destination.country === "Portugal" || destination.country === "Belgium" || destination.country === "Netherlands" || destination.country === "Austria" || destination.country === "Ireland" || destination.country === "Switzerland" ? "EUR" : destination.country === "Japan" ? "JPY" : destination.country === "Thailand" ? "THB" : destination.country === "United Kingdom" ? "GBP" : "USD";

  const formatAmount = (amount: string) => `${currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : ""}${amount}${currency === "USD" ? "/month" : currency === "EUR" ? "/month" : currency === "GBP" ? "/month" : ""}`;

  const base = destination.city === "Nafplio" ? { single: "1,600-2,400", couple: "2,400-3,600", family: "3,500-5,500", luxury: "4,500-8,000", digitalNomad: "1,800-3,000", retiree: "1,700-2,900" } : { single: "1,900-3,000", couple: "3,000-4,500", family: "4,500-7,000", luxury: "6,000-10,000", digitalNomad: "2,000-3,500", retiree: "2,100-3,300" };

  return [
    { label: "Single", amount: formatAmount(base.single), currency, note: `Practical monthly range for one person in ${destination.city}.` },
    { label: "Couple", amount: formatAmount(base.couple), currency, note: `Comfortable monthly range for a household with dining and local travel.` },
    { label: "Family", amount: formatAmount(base.family), currency, note: `Family-scale range including housing, transport, and schooling.` },
    { label: "Luxury", amount: formatAmount(base.luxury), currency, note: `High-end monthly budget for premium housing and frequent dining.` },
    { label: "Digital Nomad", amount: formatAmount(base.digitalNomad), currency, note: `Remote-work budget with strong connectivity and flexible housing.` },
    { label: "Retiree", amount: formatAmount(base.retiree), currency, note: `Long-stay budget for a resident prioritizing comfort and routine.` },
  ];
};

const buildProsAndCons = (destination: Destination, researchProfile?: DestinationResearchProfile) => {
  const pros = researchProfile?.pros?.length ? researchProfile.pros : [
    `${destination.city} offers a distinctive local identity.`,
    `The setting is memorable enough to shape everyday life.`,
  ];
  const cons = researchProfile?.cons?.length ? researchProfile.cons : [
    `Some parts of ${destination.city} are more demanding than the postcard image suggests.`,
    "Seasonality or transport constraints can affect day-to-day ease.",
  ];
  return { pros, cons };
};

const buildNeighborhoodGuides = (destination: Destination, researchProfile?: DestinationResearchProfile, knowledgeProfile?: DestinationKnowledgeProfile) => {
  const neighborhoodNames = Array.from(new Set([
    ...(researchProfile?.bestNeighborhoods || []),
    ...(researchProfile?.districts || []),
    ...(knowledgeProfile?.bestNeighborhoods || []),
    ...(knowledgeProfile?.luxuryNeighborhoods || []),
    ...(knowledgeProfile?.budgetNeighborhoods || []),
    ...(knowledgeProfile?.familyNeighborhoods || []),
    ...(knowledgeProfile?.digitalNomadNeighborhoods || []),
    ...(knowledgeProfile?.retirementNeighborhoods || []),
  ].map((value) => value?.trim()).filter(Boolean)));

  if (!neighborhoodNames.length) {
    return [{
      name: `${destination.city} center`,
      whyItWorks: `${destination.city} is most compelling when a resident chooses a base that matches daily routines rather than only the postcard view.`,
      fit: `Best for residents who want a practical first step into ${destination.city}.`,
      vibe: `It gives the place its most readable everyday rhythm.`,
    }];
  }

  return neighborhoodNames.slice(0, 4).map((name, index) => ({
    name,
    whyItWorks: `${name} is where ${destination.city} often feels most legible because it concentrates the spaces, streets, and routines that shape daily life.`,
    fit: index === 0 ? `Best for residents who want the strongest mix of walkability, services, and local texture.` : `Best for residents who want a more specific neighborhood identity without sacrificing access to the wider city.`,
    vibe: index === 0 ? `It tends to feel the most connected and social.` : `It tends to feel more intimate and tailored to a local rhythm.`,
  }));
};

const buildScoringNotes = (destination: Destination, researchProfile?: DestinationResearchProfile, knowledgeProfile?: DestinationKnowledgeProfile) => {
  const hospitals = joinFactList(knowledgeProfile?.majorHospitals || researchProfile?.hospitals);
  const transport = normalize(knowledgeProfile?.publicTransportation || knowledgeProfile?.localTransportation) || normalize(destination.transportation);
  const parks = joinFactList(knowledgeProfile?.parks || researchProfile?.parks);
  const neighborhoodContext = "a strong neighborhood base";

  return [
    {
      category: "Retirement",
      note: `${destination.city} scores well for long-stay living when a resident values ${neighborhoodContext}, practical access to ${hospitals || "medical services"}, and a pace that feels manageable over time.`,
    },
    {
      category: "Family",
      note: `${destination.city} performs well for families when daily life is anchored by ${parks || "local green space"}, reliable services, and neighborhoods that offer a calmer routine than the center alone.`,
    },
    {
      category: "Digital nomad",
      note: `${destination.city} becomes a strong remote-work choice when the resident can combine ${transport || "good regional access"} with a neighborhood base that supports a weekly routine rather than only weekend visits.`,
    },
    {
      category: "Lifestyle",
      note: `${destination.city} scores strongly for lifestyle when the resident wants a place that feels distinctive enough to shape daily identity rather than simply offering amenities.`,
    },
  ];
};

const joinFactList = (values?: string[], fallback = "") => {
  const cleaned = (values || []).filter(Boolean);
  if (!cleaned.length) {
    return fallback;
  }
  if (cleaned.length === 1) {
    return cleaned[0];
  }
  if (cleaned.length === 2) {
    return `${cleaned[0]} and ${cleaned[1]}`;
  }
  return `${cleaned.slice(0, -1).join(", ")}, and ${cleaned[cleaned.length - 1]}`;
};

const buildEditorialText = (destination: Destination, researchProfile?: DestinationResearchProfile, premiumEditorialContent?: PremiumEditorialContent, knowledgeProfile?: DestinationKnowledgeProfile) => {
  const city = destination.city;
  const resolvedResearchProfile = getDestinationResearchProfile(destination);
  const overview = normalize(destination.overview) || normalize(destination.description);
  const climate = normalize(destination.climate);
  const lifestyle = normalize(destination.lifestyle);
  const transportation = normalize(destination.transportation);
  const localCulture = resolvedResearchProfile?.localCulture || resolvedResearchProfile?.foodAndDining || normalize(destination.description);
  const overviewNarrative = normalize(resolvedResearchProfile?.overview) || normalize(resolvedResearchProfile?.longFormEditorial) || overview;
  const dailyLifeNarrative = normalize(resolvedResearchProfile?.feel) || normalize(resolvedResearchProfile?.whyPeopleLoveIt) || lifestyle;
  const climateNarrative = normalize(resolvedResearchProfile?.climate) || climate;
  const transportationNarrative = normalize(resolvedResearchProfile?.transportation) || transportation;
  const costNarrative = normalize(resolvedResearchProfile?.costOfLiving);
  const healthcareNarrative = normalize(resolvedResearchProfile?.healthcare);
  const walkabilityNarrative = normalize(resolvedResearchProfile?.walkability);
  const safetyNarrative = normalize(resolvedResearchProfile?.safety);
  const retirementNarrative = normalize(resolvedResearchProfile?.longStaySuitability);
  const familyNarrative = normalize(resolvedResearchProfile?.familyFriendliness);
  const nomadNarrative = normalize(resolvedResearchProfile?.digitalNomadSuitability);
  const neighborhoods = joinFactList(researchProfile?.bestNeighborhoods, `${city} center`);
  const districts = joinFactList(researchProfile?.districts, neighborhoods);
  const streets = joinFactList(researchProfile?.famousStreets);
  const parks = joinFactList(knowledgeProfile?.parks || researchProfile?.parks);
  const museums = joinFactList(knowledgeProfile?.museums || researchProfile?.museums);
  const beaches = joinFactList(knowledgeProfile?.beaches || researchProfile?.beaches);
  const mountains = joinFactList(knowledgeProfile?.mountains || researchProfile?.mountains);
  const landmarks = joinFactList(researchProfile?.landmarks, `${city} landmarks`);
  const restaurants = joinFactList(knowledgeProfile?.restaurants || researchProfile?.restaurants);
  const cafes = joinFactList(knowledgeProfile?.coffeeShops || researchProfile?.cafes);
  const shopping = joinFactList(knowledgeProfile?.shopping || researchProfile?.shoppingDistricts);
  const airports = joinFactList(knowledgeProfile?.majorAirports || researchProfile?.airports);
  const hospitals = joinFactList(knowledgeProfile?.majorHospitals || researchProfile?.hospitals);
  const universities = joinFactList(knowledgeProfile?.universities || researchProfile?.universities);
  const sports = joinFactList(researchProfile?.sportsTeams);
  const entertainment = joinFactList(researchProfile?.entertainmentAreas);
  const bestFor = researchProfile?.bestFor?.join(", ") || "couples and culture-led residents";
  const notIdealFor = researchProfile?.notIdealFor?.join(", ") || "people who need nonstop urban convenience";
  const population = knowledgeProfile?.population ? `The city has a population of about ${knowledgeProfile.population}.` : "";
  const metroPopulation = knowledgeProfile?.metroPopulation ? `The metro area reaches roughly ${knowledgeProfile.metroPopulation}.` : "";
  const climateClassification = knowledgeProfile?.climateClassification ? `Its climate is ${knowledgeProfile.climateClassification.toLowerCase()}.` : "";
  const walkability = knowledgeProfile?.walkability ? `Walkability is described as ${knowledgeProfile.walkability.toLowerCase()}` : "";
  const publicTransportation = knowledgeProfile?.publicTransportation || knowledgeProfile?.localTransportation || "";
  const healthcareQuality = knowledgeProfile?.healthcareQuality ? `Healthcare quality is typically described as ${knowledgeProfile.healthcareQuality.toLowerCase()}.` : "";

  const overviewArticle = premiumEditorialContent?.overviewArticle?.trim() || `${city} is not a destination defined by one postcard. ${overviewNarrative} ${population} ${metroPopulation} ${climateClassification} The most convincing version of ${city} comes from the sequence of ${landmarks} set above ${districts}, with ${streets ? `${streets} helping the place read clearly on foot` : "its core streets helping the place read clearly on foot"}. ${restaurants ? `Restaurants and cafés around ${restaurants}${cafes ? ` and ${cafes}` : ""} shape the social rhythm in a way that is easy to miss from a quick visit.` : "The local dining scene shapes the social rhythm in a way that is easy to miss from a quick visit."} ${museums ? `Museums including ${museums} add cultural depth without overwhelming the everyday scale of the town.` : "The museum network adds cultural depth without overwhelming the town's scale."} ${beaches ? `Weekend escapes to ${beaches} extend the place beyond the compact center.` : "Weekend escapes extend the place beyond the compact center."} ${localCulture}`;
  const whatItsReallyLike = premiumEditorialContent?.dailyLifeArticle?.trim() || `${city} is easiest to understand in a normal week rather than on a weekend checklist. ${dailyLifeNarrative} A resident might start with a coffee near ${cafes || "the harbor"}, continue along ${streets || "the central lanes"}, and spend the afternoon in ${parks || "the nearby parks"} or ${museums || "the local museums"}. ${beaches ? `If the weather is good, ${beaches} are the natural extension of the day.` : "The shoreline is the natural extension of the day."} ${entertainment ? `Evenings often gather around ${entertainment}.` : "Evenings often gather around the waterfront and the old town."} ${resolvedResearchProfile?.foodAndDining || "Dining and errands give the place much of its texture."}`;
  const neighborhoodGuide = premiumEditorialContent?.neighborhoodsArticle?.trim() || `${city} rewards a more granular view than its headline reputation. In practice, the destination feels very different from one district to the next. ${districts} matter because they reveal how the place changes with distance from the center, the harbor, and the main cultural corridors. ${parks ? `Parks and gardens such as ${parks} often define the calmer edges of the neighborhood map.` : "Public green space defines the calmer edges of the neighborhood map."} ${shopping ? `Shopping zones around ${shopping} explain where the daily errands happen.` : "The main shopping lanes explain where the daily errands happen."} ${airports || hospitals ? `The presence of ${[airports, hospitals].filter(Boolean).join(" and ")} adds practical weight to the long-stay case.` : "The practical infrastructure adds weight to the long-stay case."} ${landmarks ? `Residents who understand ${landmarks} can read the city much more clearly than visitors who only see the postcard facade.` : "Residents who understand the landmarks can read the city much more clearly than visitors who only see the postcard facade."}`;
  const retirementGuide = premiumEditorialContent?.retirementGuide?.trim() || `${city} can support a long stay when the resident values compact geography and a slower pace. ${retirementNarrative || "The case is strongest for people who want to walk to cafés, medical appointments, and the waterfront without relying on a car for every trip."} ${hospitals ? `Access to ${hospitals} matters as much as the view.` : "Medical access matters as much as the view."} ${airports ? `Connections through ${airports} keep regional travel practical.` : "Regional connections keep travel practical."} ${universities || sports ? `A steady local presence from ${[universities, sports].filter(Boolean).join(" and ")} keeps the town from feeling empty outside the high season.` : "A steady local presence keeps the town from feeling empty outside the high season."} The tradeoff is that the experience depends on choosing a district that fits daily routines rather than simply chasing the prettiest address.`;
  const familyGuide = premiumEditorialContent?.familyGuide?.trim() || `${city} works well for families when the household is comfortable with a place that feels intimate rather than expansive. ${familyNarrative || "The case improves when a home base offers easy access to public green space, reliable services, and a neighborhood that supports routines rather than only weekend outings."} ${museums ? `Museums and cultural stops such as ${museums} add variety for children and parents alike.` : "Cultural stops add variety for children and parents alike."} ${entertainment ? `Evening options around ${entertainment} keep the week from feeling too quiet.` : "Evening options keep the week from feeling too quiet."} The destination is strongest when family life feels supported by walkable streets, manageable distances, and a steady flow of local culture rather than by sheer scale.`;
  const digitalNomadGuide = premiumEditorialContent?.digitalNomadGuide?.trim() || `${city} suits remote work when the resident wants a place with strong local character and enough daily texture to make a long stay feel rewarding. ${nomadNarrative || "The best case is not simply a pretty setting; it is a balance of workspace comfort, food options, and access to the places that make the town feel engaging beyond the laptop."} ${cafes ? `Cafés around ${cafes} provide natural workday anchors.` : "Cafés provide natural workday anchors."} ${airports ? `Air connections through ${airports} keep the week-to-week schedule flexible.` : "Air connections keep the week-to-week schedule flexible."} ${bestFor} often do best here when they combine a central base with weekend movement to nearby coastlines, villages, or day-trip locations.`;
  const healthcareGuide = premiumEditorialContent?.healthcareArticle?.trim() || `${city} should be evaluated for healthcare through the lens of the actual weekly routine. ${healthcareNarrative || healthcareQuality} A resident will care less about abstract system prestige than about how quickly they can reach a clinic, what specialist access looks like, and whether emergency care feels manageable from the chosen district. ${hospitals ? `The presence of ${hospitals} matters because it makes a long stay less dependent on outside referral patterns.` : "A local hospital network matters because it makes a long stay less dependent on outside referral patterns."} The strongest healthcare case comes from a household that pairs access to practical medical services with a home base that avoids unnecessary travel and keeps everyday errands close by.`;
  const costOfLivingGuide = premiumEditorialContent?.costOfLivingArticle?.trim() || `${city} is best understood by separating the postcard image from the real monthly cost structure. ${costNarrative || "Housing, dining, transport, and seasonal demand can push the true cost well above a casual first impression."} ${restaurants ? `Meals around ${restaurants} can be more affordable than the high-end waterfront narrative suggests.` : "Meals can be more affordable than the high-end waterfront narrative suggests."} ${shopping ? `The cost of everyday life is tied closely to how much time is spent around ${shopping}.` : "The cost of everyday life is tied closely to how much time is spent in the core district."} The most realistic budget reflects how much time is spent in the center versus the outskirts and how much value the household places on convenience and proximity.`;
  const transportationGuide = premiumEditorialContent?.transportationArticle?.trim() || `${transportationNarrative || transportation} ${publicTransportation ? `${publicTransportation} ` : ""}That makes movement a central part of the relocation story rather than a secondary detail. A resident should think about airport access, regional day trips, the walking experience around the center, and how much effort it takes to reach daily services from the chosen neighborhood. ${airports ? `Connections through ${airports} matter for both short visits and longer stays.` : "Connections matter for both short visits and longer stays."} ${city} is strongest when the transport system supports the pace of everyday life without forcing the resident into a car for every errand.`;
  const climateGuide = premiumEditorialContent?.climateArticle?.trim() || `${climateNarrative || climate} ${climateClassification ? `${climateClassification} ` : ""}Those conditions matter because they shape how the city feels in the shoulder seasons, how much outdoor life is practical, and whether the destination feels comfortable for long stays. ${mountains ? `The surrounding ${mountains} backdrop changes the feel of the weather and light throughout the year.` : "The surrounding landscape changes the feel of the weather and light throughout the year."} A premium evaluation frames climate in relation to daily routines, outdoor access, and the rhythm of the year rather than reducing it to a temperature chart.`;
  const walkabilityGuide = premiumEditorialContent?.transportationArticle?.trim() || `${city} feels easiest to understand when walkability is treated as a measure of how well daily life fits the geography of the place. ${walkabilityNarrative || "The most satisfying neighborhoods combine short errands, open public space, and a density that allows a resident to live without relying on the car for every task."} ${streets ? `The route between ${streets} and the waterfront often matters more than the headline view.` : "The route between the center and the waterfront often matters more than the headline view."} ${walkability ? `${walkability}.` : "In ${city}, walkability carries a strong cultural signal because the experience of the place is tied to the streetscape, the waterfront, and the movement between the center and the surrounding districts."}`;
  const safetyGuide = premiumEditorialContent?.healthcareArticle?.trim() || `${city} should be judged on safety in the context of the neighborhood and the time of day. ${safetyNarrative || "A premium guide recognizes that safety is not a single score but a pattern: which areas feel secure at night, how late the streets stay active, and how much confidence a resident has walking home from dinner or from a late evening outing."} ${entertainment ? `A place that stays active around ${entertainment} often feels safer after dark than one that empties out early.` : "A place that stays active after dark often feels safer than one that empties out early."} The most useful analysis links local feeling to practical behavior rather than presenting safety as a broad generalization.`;
  return {
    overviewArticle,
    whatItsReallyLike,
    neighborhoodGuide,
    retirementGuide,
    familyGuide,
    digitalNomadGuide,
    healthcareGuide,
    costOfLivingGuide,
    transportationGuide,
    climateGuide,
    walkabilityGuide,
    safetyGuide,
  };
};

export function buildPremiumDestinationEditorialPackage(destination: Destination): PremiumDestinationEditorialPackage {
  const researchProfile = destination.researchProfile;
  const premiumEditorialContent = destination.premiumEditorialContent;
  const knowledgeProfile = destination.knowledgeProfile;
  const editorial = buildEditorialText(destination, researchProfile, premiumEditorialContent, knowledgeProfile);
  const { pros, cons } = buildProsAndCons(destination, researchProfile);
  const budgets = buildBudget(destination);
  return {
    ...editorial,
    pros,
    cons,
    heroIntroduction: premiumEditorialContent?.heroIntroduction?.trim() || `${destination.city} feels most convincing when you understand it as a living place rather than a set of attractions.`,
    whyPeopleLoveIt: premiumEditorialContent?.whyPeopleLoveIt?.length ? premiumEditorialContent.whyPeopleLoveIt : researchProfile?.whyPeopleLoveIt ? [researchProfile.whyPeopleLoveIt] : [`${destination.city} has a distinctive local identity.`, `${destination.city} rewards slow discovery.`],
    resourceLinks: buildResourceLinks(destination),
    monthlyBudgets: budgets,
    neighborhoodGuides: buildNeighborhoodGuides(destination, researchProfile, knowledgeProfile),
    scoringNotes: buildScoringNotes(destination, researchProfile, knowledgeProfile),
  };
}
