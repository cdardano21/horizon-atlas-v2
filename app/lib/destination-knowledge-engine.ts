import type { Destination, DestinationKnowledgeProfile } from "./destinations";

const normalizeText = (value?: string) => (typeof value === "string" ? value.trim() : "");

const pickList = <T>(values?: T[]) => (Array.isArray(values) ? values.filter(Boolean) : undefined);

const inferClimateClassification = (value?: string) => {
  const normalized = normalizeText(value).toLowerCase();
  if (normalized.includes("mediterranean")) return "Mediterranean";
  if (normalized.includes("continental")) return "Continental";
  if (normalized.includes("subtropical")) return "Subtropical";
  if (normalized.includes("arid")) return "Arid";
  if (normalized.includes("tropical")) return "Tropical";
  if (normalized.includes("marine")) return "Marine";
  return undefined;
};

export function buildDestinationKnowledgeProfile(destination: Partial<Destination> & { knowledgeProfile?: DestinationKnowledgeProfile }): DestinationKnowledgeProfile {
  const explicit = destination.knowledgeProfile;
  const researchProfile = destination.researchProfile;
  const memberDetails = destination.memberDetails;

  return {
    officialName: explicit?.officialName || destination.city,
    country: explicit?.country || destination.country,
    adminRegion: explicit?.adminRegion,
    latitude: explicit?.latitude,
    longitude: explicit?.longitude,
    population: explicit?.population,
    metroPopulation: explicit?.metroPopulation,
    elevation: explicit?.elevation,
    timeZone: explicit?.timeZone,
    climateClassification: explicit?.climateClassification || inferClimateClassification(destination.climate || researchProfile?.climate),
    rainfall: explicit?.rainfall,
    sunshineHours: explicit?.sunshineHours,
    humidity: explicit?.humidity,
    airQuality: explicit?.airQuality,
    walkability: explicit?.walkability || researchProfile?.walkability || normalizeText(destination.transportation),
    bikeFriendliness: explicit?.bikeFriendliness,
    publicTransportation: explicit?.publicTransportation || explicit?.localTransportation || normalizeText(destination.transportation),
    majorAirports: explicit?.majorAirports?.length ? explicit.majorAirports : pickList(memberDetails?.airports?.map((entry) => entry.name)),
    drivingConvenience: explicit?.drivingConvenience,
    internetSpeed: explicit?.internetSpeed,
    cellCoverage: explicit?.cellCoverage,
    safety: explicit?.safety || researchProfile?.safety,
    crime: explicit?.crime,
    healthcareQuality: explicit?.healthcareQuality || researchProfile?.healthcare,
    majorHospitals: explicit?.majorHospitals?.length ? explicit.majorHospitals : pickList(memberDetails?.hospitals?.map((entry) => entry.name)),
    emergencyCare: explicit?.emergencyCare,
    costOfLiving: explicit?.costOfLiving || researchProfile?.costOfLiving,
    apartmentRent: explicit?.apartmentRent,
    homePrices: explicit?.homePrices,
    propertyTaxes: explicit?.propertyTaxes,
    incomeTaxes: explicit?.incomeTaxes,
    salesTaxes: explicit?.salesTaxes,
    utilities: explicit?.utilities,
    groceryCosts: explicit?.groceryCosts,
    diningCosts: explicit?.diningCosts,
    transportationCosts: explicit?.transportationCosts,
    healthcareCosts: explicit?.healthcareCosts,
    bestNeighborhoods: explicit?.bestNeighborhoods?.length ? explicit.bestNeighborhoods : pickList(researchProfile?.bestNeighborhoods),
    luxuryNeighborhoods: explicit?.luxuryNeighborhoods,
    budgetNeighborhoods: explicit?.budgetNeighborhoods,
    familyNeighborhoods: explicit?.familyNeighborhoods,
    digitalNomadNeighborhoods: explicit?.digitalNomadNeighborhoods,
    retirementNeighborhoods: explicit?.retirementNeighborhoods,
    beaches: explicit?.beaches?.length ? explicit.beaches : pickList(researchProfile?.beaches),
    mountains: explicit?.mountains?.length ? explicit.mountains : pickList(researchProfile?.mountains),
    lakes: explicit?.lakes,
    parks: explicit?.parks?.length ? explicit.parks : pickList(researchProfile?.parks),
    hiking: explicit?.hiking,
    golf: explicit?.golf?.length ? explicit.golf : pickList(researchProfile?.golf),
    museums: explicit?.museums?.length ? explicit.museums : pickList(researchProfile?.museums),
    art: explicit?.art,
    architecture: explicit?.architecture,
    festivals: explicit?.festivals,
    sports: explicit?.sports,
    nightlife: explicit?.nightlife,
    restaurants: explicit?.restaurants?.length ? explicit.restaurants : pickList(researchProfile?.restaurants),
    coffeeShops: explicit?.coffeeShops?.length ? explicit.coffeeShops : pickList(researchProfile?.cafes),
    shopping: explicit?.shopping?.length ? explicit.shopping : pickList(researchProfile?.shoppingDistricts),
    universities: explicit?.universities?.length ? explicit.universities : pickList(researchProfile?.universities),
    economy: explicit?.economy,
    majorEmployers: explicit?.majorEmployers,
    nearbyWeekendTrips: explicit?.nearbyWeekendTrips,
    airportsWithDirectFlights: explicit?.airportsWithDirectFlights,
    visaInfo: explicit?.visaInfo,
    residencyInfo: explicit?.residencyInfo,
    retirementSuitability: explicit?.retirementSuitability || researchProfile?.longStaySuitability,
    familySuitability: explicit?.familySuitability || researchProfile?.familyFriendliness,
    digitalNomadSuitability: explicit?.digitalNomadSuitability || researchProfile?.digitalNomadSuitability,
    lgbtqFriendliness: explicit?.lgbtqFriendliness,
    accessibility: explicit?.accessibility,
    localTransportation: explicit?.localTransportation || normalizeText(destination.transportation),
    healthcareRankings: explicit?.healthcareRankings,
    climateRisks: explicit?.climateRisks,
    naturalDisasterRisks: explicit?.naturalDisasterRisks,
  };
}
