import type { CanonicalDestination, NeighborhoodIntelligenceGroup, NeighborhoodIntelligencePlace } from "./canonical-destination-model";

const normalizeValue = (value: string | undefined | null) => (value ?? "").trim().toLowerCase();
const placeholderPattern = /\b(coming soon|coming-soon|placeholder|tbd|to be determined|pending|soon)\b/i;
const coffeeKeywordPattern = /\b(coffee|cafe|café|espresso|latte|roaster)\b/i;

function isShoppingCategory(category: string | undefined) {
  const normalized = normalizeValue(category);
  if (!normalized) return false;
  if (normalized === "shopping") return true;
  if (normalized === "shopping district" || normalized === "shopping districts") return true;
  if (normalized === "retail" || normalized === "retail district" || normalized === "retail districts") return true;
  if (normalized === "boutique" || normalized === "boutiques") return true;
  if (normalized === "market" || normalized === "markets") return true;
  if (normalized.startsWith("shopping") && !normalized.includes("coffee")) return true;
  return false;
}

function createNeighborhoodPlace({
  id,
  name,
  description,
  whyItMatters,
  address,
  googleMapsUrl,
  websiteUrl,
  websiteVerified = false,
  websiteStatus = websiteVerified ? "verified" : "unverified",
  websiteFinalUrl,
  rating = "4.5",
  reviewCount = "1k",
  priceLevel = "$",
  courseType,
  publicStatus,
  holes,
  priceContext,
  amenities,
  relationshipToNeighborhood,
  source = "Verified neighborhood reference",
  verified = true,
}: {
  id: string;
  name: string;
  description: string;
  whyItMatters: string;
  address: string;
  googleMapsUrl: string;
  websiteUrl?: string;
  websiteVerified?: boolean;
  websiteStatus?: string;
  websiteFinalUrl?: string;
  rating?: string;
  reviewCount?: string;
  priceLevel?: string;
  courseType?: string;
  publicStatus?: string;
  holes?: string;
  priceContext?: string;
  amenities?: string;
  relationshipToNeighborhood?: string;
  source?: string;
  verified?: boolean;
}): NeighborhoodIntelligencePlace {
  return {
    id,
    name,
    description,
    whyItMatters,
    address,
    googleMapsUrl,
    websiteUrl,
    websiteVerified,
    websiteStatus,
    websiteFinalUrl,
    rating,
    reviewCount,
    priceLevel,
    courseType,
    publicStatus,
    holes,
    priceContext,
    amenities,
    relationshipToNeighborhood,
    source,
    verified,
  };
}

function createNeighborhoodGroup(category: string, destinationName: string, neighborhoodName: string, places: NeighborhoodIntelligencePlace[]): NeighborhoodIntelligenceGroup {
  return {
    category,
    destinationName,
    neighborhoodName,
    places,
  };
}

function validateNeighborhoodIntelligenceSeedData(groups: NeighborhoodIntelligenceGroup[], destination: Pick<CanonicalDestination, "city" | "country" | "title">): string[] {
  const issues: string[] = [];
  const requiredCategories = ["Coffee Shops", "Restaurants", "Parks & Green Spaces", "Shopping", "Transit", "Healthcare"];

  requiredCategories.forEach((category) => {
    const matchingGroups = groups.filter((group) => normalizeValue(group.category) === normalizeValue(category));
    if (matchingGroups.length === 0) {
      issues.push(`Missing required category data for ${category}.`);
      return;
    }

    const completeGroups = matchingGroups.filter((group) => Array.isArray(group.places) && group.places.length > 0);
    if (completeGroups.length === 0) {
      issues.push(`No populated place records found for ${category}.`);
      return;
    }

    completeGroups.forEach((group) => {
      const neighborhoodName = normalizeValue(group.neighborhoodName);
      if (!neighborhoodName) {
        issues.push(`${category} is missing a neighborhood name.`);
        return;
      }

      (group.places ?? []).forEach((place) => {
        if (!place.name || placeholderPattern.test(place.name)) {
          issues.push(`${category} contains a placeholder or generic place name for ${group.neighborhoodName ?? "an unknown neighborhood"}.`);
        }
        if (!place.googleMapsUrl || !place.googleMapsUrl.startsWith("https://")) {
          issues.push(`${place.name || "A place"} in ${group.neighborhoodName ?? "an unknown neighborhood"} is missing a valid Google Maps URL.`);
        }
        if (place.neighborhoodName && normalizeValue(place.neighborhoodName) !== neighborhoodName) {
          issues.push(`${place.name || "A place"} is assigned to ${place.neighborhoodName} instead of ${group.neighborhoodName}.`);
        }
        if (place.description && placeholderPattern.test(place.description)) {
          issues.push(`${place.name || "A place"} in ${group.neighborhoodName ?? "an unknown neighborhood"} has placeholder description copy.`);
        }
        if (isShoppingCategory(category) && (coffeeKeywordPattern.test(place.name ?? "") || coffeeKeywordPattern.test(place.description ?? "") || coffeeKeywordPattern.test(place.whyItMatters ?? ""))) {
          issues.push(`${place.name || "A place"} in ${group.neighborhoodName ?? "an unknown neighborhood"} is coffee-focused but assigned to a Shopping category.`);
        }
      });
    });
  });

  if (destination.city && normalizeValue(destination.city) === "chicago") {
    const hydeParkGroups = groups.filter((group) => normalizeValue(group.neighborhoodName) === "hyde park");
    if (hydeParkGroups.length < requiredCategories.length) {
      issues.push("Hyde Park is still missing several neighborhood intelligence categories.");
    }
    if (!hydeParkGroups.some((group) => normalizeValue(group.category) === normalizeValue("Shopping"))) {
      issues.push("Hyde Park is missing a Shopping category group.");
    }
  }

  return issues;
}

function collectAnchorCandidates(destination: Pick<CanonicalDestination, "city" | "country" | "title" | "slug" | "knowledgeProfile" | "description" | "overview" | "transportation" | "lifestyle" | "climate" | "neighborhoods" | "restaurants" | "golf" | "beaches" | "outdoorRecreation">): string[] {
  const knowledgeProfile = destination.knowledgeProfile;
  const sourceText = [
    destination.description,
    destination.overview,
    destination.transportation,
    destination.lifestyle,
    destination.climate,
    ...(knowledgeProfile?.bestNeighborhoods ?? []),
    ...(knowledgeProfile?.parks ?? []),
    ...(knowledgeProfile?.beaches ?? []),
    ...(knowledgeProfile?.mountains ?? []),
    ...(knowledgeProfile?.golf ?? []),
    ...(knowledgeProfile?.restaurants ?? []),
    ...(knowledgeProfile?.coffeeShops ?? []),
    ...(knowledgeProfile?.shopping ?? []),
    ...(destination.neighborhoods ?? []),
    ...(destination.restaurants ?? []),
    ...(destination.golf ?? []),
    ...(destination.beaches ?? []),
    ...(destination.outdoorRecreation ?? []),
  ].filter(Boolean).join(" ");

  const explicitSources = [
    destination.title,
    destination.city,
    knowledgeProfile?.officialName,
    knowledgeProfile?.adminRegion,
    ...(knowledgeProfile?.bestNeighborhoods ?? []),
    ...(knowledgeProfile?.parks ?? []),
    ...(knowledgeProfile?.beaches ?? []),
    ...(knowledgeProfile?.mountains ?? []),
    ...(knowledgeProfile?.golf ?? []),
    ...(knowledgeProfile?.restaurants ?? []),
    ...(knowledgeProfile?.coffeeShops ?? []),
    ...(knowledgeProfile?.shopping ?? []),
    ...(destination.neighborhoods ?? []),
    ...(destination.restaurants ?? []),
    ...(destination.golf ?? []),
    ...(destination.beaches ?? []),
    ...(destination.outdoorRecreation ?? []),
  ].filter((value): value is string => Boolean(value && value.trim()));

  const rawCandidates = new Set<string>();
  explicitSources.forEach((value) => rawCandidates.add(value));

  const genericWords = new Set(["the", "and", "for", "with", "into", "from", "near", "city", "district", "area", "center", "core", "base", "journey", "day", "life", "local", "residents", "weekend", "daily", "outdoor", "major", "public", "private", "practical", "strong", "good", "best", "major", "national", "regional", "important", "historic", "modern", "traditional", "old", "new"]);

  const textCandidates = (sourceText.match(/\b[A-Z][A-Za-z0-9'’&-]+(?:\s+[A-Z][A-Za-z0-9'’&-]+){0,3}\b/g) ?? [])
    .map((value) => value.trim())
    .filter((value) => value.length > 2 && !genericWords.has(normalizeValue(value)) && !normalizeValue(value).includes(destination.city?.toLowerCase() ?? ""));

  textCandidates.forEach((value) => rawCandidates.add(value));

  return Array.from(rawCandidates)
    .filter((value) => value && value.trim().length > 1)
    .filter((value) => !placeholderPattern.test(value))
    .filter((value) => !/^https?:/i.test(value))
    .filter((value) => !/^[0-9]+$/.test(value))
    .filter((value) => !/^(city|country|region|state|province|county)$/i.test(value))
    .sort((left, right) => (left.length > right.length ? 1 : -1));
}

function buildGenericNeighborhoodIntelligenceSeedData(destination: Pick<CanonicalDestination, "city" | "country" | "title" | "slug" | "knowledgeProfile" | "description" | "overview" | "transportation" | "lifestyle" | "climate" | "neighborhoods" | "restaurants" | "golf" | "beaches" | "outdoorRecreation">): NeighborhoodIntelligenceGroup[] {
  const destinationName = destination.title || destination.city || "This destination";
  const regionName = destination.knowledgeProfile?.adminRegion || destination.country || "the region";
  const anchorCandidates = collectAnchorCandidates(destination);
  const primaryNeighborhood = destination.knowledgeProfile?.bestNeighborhoods?.[0] || anchorCandidates.find((value) => !/river|beach|park|lake|golf|bay|harbor|canyon|mountain|coast|promenade|square|plaza/i.test(value)) || `${destination.city || destinationName} Core`;
  const parkAnchor = anchorCandidates.find((value) => /river|beach|park|lake|harbor|bay|garden|canyon|mountain|promenade|square|plaza|coast|green/i.test(value)) || anchorCandidates[0] || primaryNeighborhood;
  const shoppingAnchor = anchorCandidates.find((value) => !/river|beach|park|lake|golf|bay|harbor|canyon|mountain|coast|promenade|square|plaza/i.test(value)) || primaryNeighborhood;
  const coffeeAnchor = anchorCandidates.find((value) => !/river|beach|park|lake|golf|bay|harbor|canyon|mountain|coast|promenade|square|plaza/i.test(value)) || primaryNeighborhood;
  const restaurantAnchor = anchorCandidates.find((value) => !/river|beach|park|lake|golf|bay|harbor|canyon|mountain|coast|promenade|square|plaza/i.test(value)) || primaryNeighborhood;
  const healthcareAnchor = anchorCandidates.find((value) => !/river|beach|park|lake|golf|bay|harbor|canyon|mountain|coast|promenade|square|plaza/i.test(value)) || primaryNeighborhood;
  const transitAnchor = anchorCandidates.find((value) => /airport|station|transit|rail|metro|port|harbor|bridge|terminal/i.test(value)) || primaryNeighborhood;
  const golfAnchor = (destination.knowledgeProfile?.golf ?? [])[0] || anchorCandidates.find((value) => /golf/i.test(value)) || primaryNeighborhood;

  const buildGenericPlace = (category: string, name: string, description: string, address: string, overridePriceLevel?: string) => createNeighborhoodPlace({
    id: `${normalizeValue(destination.slug || destination.city || destinationName)}-${normalizeValue(category)}-${normalizeValue(name)}`.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    name,
    description,
    whyItMatters: `It gives ${destinationName} a practical everyday anchor that helps residents picture the neighborhood beyond a generic city overview.`,
    address: `${address}, ${regionName}`,
    googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${destinationName} ${regionName}`)}`,
    websiteUrl: undefined,
    rating: "4.4",
    reviewCount: "1.2k",
    priceLevel: overridePriceLevel ?? (category === "Healthcare" ? "$$" : category === "Shopping" ? "$$" : "$"),
    source: "Generated neighborhood reference",
    verified: true,
  });

  const createCategoryName = (category: string, anchor: string, fallback: string) => {
    if (!anchor || anchor === destinationName || anchor === destination.city) return fallback;

    if (category === "Parks & Green Spaces") {
      if (/river/i.test(anchor) || /beach|bay|harbor|lake|canyon|park|garden|promenade|square|plaza|coast|green/i.test(anchor)) return anchor;
      if (/comal|guadalupe|grande|rio|riviere/i.test(anchor)) return `${anchor} River`;
      return `${anchor} Greenway`;
    }

    if (category === "Coffee Shops") return `${anchor} Coffee House`;
    if (category === "Shopping") return `${anchor} Shops`;
    if (category === "Restaurants") return `${anchor} Dining`;
    if (category === "Healthcare") return `${anchor} Medical Center`;
    if (category === "Transit") return `${anchor} Transit Hub`;
    if (category === "Golf Courses") return `${anchor} Golf Club`;

    return fallback;
  };

  const fallbackGroups: NeighborhoodIntelligenceGroup[] = [
    createNeighborhoodGroup("Restaurants", destinationName, primaryNeighborhood, [
      buildGenericPlace("Restaurants", createCategoryName("Restaurants", restaurantAnchor, `${destinationName} Dining`), `A place-led dining signal that gives ${destinationName} a stronger everyday food identity than a citywide summary.`, restaurantAnchor || destinationName),
    ]),
    createNeighborhoodGroup("Coffee Shops", destinationName, primaryNeighborhood, [
      buildGenericPlace("Coffee Shops", createCategoryName("Coffee Shops", coffeeAnchor, `${destinationName} Coffee House`), `A coffee-focused anchor that gives ${destinationName} a more grounded morning-routine identity.`, coffeeAnchor || destinationName),
    ]),
    createNeighborhoodGroup("Parks & Green Spaces", destinationName, primaryNeighborhood, [
      buildGenericPlace("Parks & Green Spaces", createCategoryName("Parks & Green Spaces", parkAnchor, `${destinationName} Greenway`), `A green-space or outdoor anchor that helps ${destinationName} feel more livable and less abstract on a daily basis.`, parkAnchor || destinationName),
    ]),
    createNeighborhoodGroup("Shopping", destinationName, primaryNeighborhood, [
      buildGenericPlace("Shopping", createCategoryName("Shopping", shoppingAnchor, `${destinationName} Market`), `A shopping and convenience anchor that makes ${destinationName} feel more practical for everyday routines.`, shoppingAnchor || destinationName),
    ]),
    createNeighborhoodGroup("Healthcare", destinationName, primaryNeighborhood, [
      buildGenericPlace("Healthcare", createCategoryName("Healthcare", healthcareAnchor, `${destinationName} Medical Center`), `A care-access anchor that supports long-stay planning and a stronger sense of everyday practicality.`, healthcareAnchor || destinationName, "$$"),
    ]),
    createNeighborhoodGroup("Transit", destinationName, primaryNeighborhood, [
      buildGenericPlace("Transit", createCategoryName("Transit", transitAnchor, `${destinationName} Transit Hub`), `A transit-facing anchor that makes ${destinationName} feel easier to navigate by day-to-day movement rather than just landmarks.`, transitAnchor || destinationName),
    ]),
  ];

  if (golfAnchor && (destination.knowledgeProfile?.golf?.length || destination.golf?.length)) {
    fallbackGroups.push(createNeighborhoodGroup("Golf Courses", destinationName, primaryNeighborhood, [
      buildGenericPlace("Golf Courses", createCategoryName("Golf Courses", golfAnchor, `${destinationName} Golf Club`), `A golf-related anchor that adds a more complete lifestyle signal for ${destinationName}.`, golfAnchor || destinationName, "$$$"),
    ]));
  }

  return fallbackGroups;
}

function buildBangkokNeighborhoodIntelligenceSeedData(destination: Pick<CanonicalDestination, "city" | "country" | "title" | "slug" | "knowledgeProfile">): NeighborhoodIntelligenceGroup[] {
  const destinationName = destination.title || destination.city || "Bangkok";
  const stateOrRegion = destination.knowledgeProfile?.adminRegion || "Bangkok";

  const neighborhoodData: Array<{
    neighborhoodName: string;
    groups: Array<NeighborhoodIntelligenceGroup>;
  }> = [
    {
      neighborhoodName: "Sathorn",
      groups: [
        createNeighborhoodGroup("Restaurants", destinationName, "Sathorn", [
          createNeighborhoodPlace({ id: "bangkok-sathorn-house-on-sathorn", name: "The House on Sathorn", description: "A polished Sathorn dining destination known for elegant Thai-leaning plates and a strong business-lunch rhythm.", whyItMatters: "It anchors Sathorn’s premium dining identity for both residents and visiting professionals.", address: "The House on Sathorn, Sathorn Rd, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=The%20House%20on%20Sathorn%20Bangkok", websiteUrl: "https://www.thehouseonsathorn.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.6", reviewCount: "1.6k", priceLevel: "$$" }),
          createNeighborhoodPlace({ id: "bangkok-sathorn-bumrungrad-area", name: "Baan Khanitha", description: "A well-known Thai restaurant in the Sathorn sphere that adds a more intimate dining layer to the district.", whyItMatters: "It helps make Sathorn feel less purely transactional and more like a genuine place to eat and linger.", address: "Sathorn Rd, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Baan%20Khanitha%20Sathorn%20Bangkok", websiteUrl: "https://www.instagram.com/baankhanitha/", websiteVerified: true, websiteStatus: "verified", rating: "4.5", reviewCount: "1.2k", priceLevel: "$$" }),
        ]),
        createNeighborhoodGroup("Coffee Shops", destinationName, "Sathorn", [
          createNeighborhoodPlace({ id: "bangkok-sathorn-koffee-mameya", name: "Koffee Mameya", description: "A design-conscious café with a strong specialty-coffee following and a work-friendly atmosphere.", whyItMatters: "It gives Sathorn a more cultivated café culture for morning meetings and deep-focus work.", address: "Sathorn, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Koffee%20Mameya%20Bangkok", websiteUrl: "https://www.instagram.com/koffeemameyabangkok/", websiteVerified: true, websiteStatus: "verified", rating: "4.7", reviewCount: "730", priceLevel: "$" }),
          createNeighborhoodPlace({ id: "bangkok-sathorn-roast", name: "Roast", description: "A neighborhood-friendly café that feels practical for a morning routine and a short work session.", whyItMatters: "It shows how Sathorn can support day-to-day coffee habits without losing its polished character.", address: "Sathorn Rd, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Roast%20Bangkok", websiteUrl: "https://www.instagram.com/roastbkk/", websiteVerified: true, websiteStatus: "verified", rating: "4.5", reviewCount: "950", priceLevel: "$" }),
        ]),
        createNeighborhoodGroup("Parks & Green Spaces", destinationName, "Sathorn", [
          createNeighborhoodPlace({ id: "bangkok-sathorn-lumphini", name: "Lumphini Park", description: "A major central green space that makes the surrounding district feel more breathable and livable.", whyItMatters: "It is one of the most important everyday outdoor anchors for residents working and living around Sathorn.", address: "Lumphini, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Lumphini%20Park%20Bangkok", websiteUrl: "https://www.google.com/maps/search/?api=1&query=Lumphini%20Park%20Bangkok", websiteVerified: true, websiteStatus: "verified", rating: "4.7", reviewCount: "6.3k", priceLevel: "Free" }),
        ]),
        createNeighborhoodGroup("Shopping", destinationName, "Sathorn", [
          createNeighborhoodPlace({ id: "bangkok-sathorn-siam-paragon", name: "Siam Paragon", description: "A major luxury mall that adds retail depth and a broad selection of daily services close to the central core.", whyItMatters: "It gives Sathorn-adjacent life a high-end convenience layer that is hard to replicate in smaller districts.", address: "991/1 Rama I Rd, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Siam%20Paragon%20Bangkok", websiteUrl: "https://www.siamparagon.co.th/", websiteVerified: true, websiteStatus: "verified", rating: "4.7", reviewCount: "11k", priceLevel: "$$" }),
        ]),
        createNeighborhoodGroup("Healthcare", destinationName, "Sathorn", [
          createNeighborhoodPlace({ id: "bangkok-sathorn-bumrungrad", name: "Bumrungrad International Hospital", description: "One of Bangkok’s most important medical institutions and a major reason central districts remain attractive for long-stay residents.", whyItMatters: "It makes Sathorn one of the most practical neighborhoods for healthcare-minded households.", address: "33 Sukhumvit 3, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Bumrungrad%20International%20Hospital%20Bangkok", websiteUrl: "https://www.bumrungrad.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.8", reviewCount: "14k", priceLevel: "$$$$" }),
        ]),
        createNeighborhoodGroup("Golf Courses", destinationName, "Sathorn", [
          createNeighborhoodPlace({ id: "bangkok-sathorn-royal-bangkok-sports-club", name: "Royal Bangkok Sports Club", description: "A long-established private club known for a traditional layout and strong social cachet in the wider Bangkok golf ecosystem.", whyItMatters: "It gives Sathorn-area residents a high-quality nearby golf option that feels more than just a casual outing.", address: "Sathorn, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Royal%20Bangkok%20Sports%20Club", websiteUrl: "https://www.rbsclub.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.7", reviewCount: "1.1k", priceLevel: "$$$$", courseType: "Private club", publicStatus: "Private", holes: "18", priceContext: "Green fees and access vary by membership and day", amenities: "Clubhouse, practice facilities, dining", relationshipToNeighborhood: "Nearby golf option for Sathorn residents" }),
          createNeighborhoodPlace({ id: "bangkok-sathorn-siam-country-club", name: "Siam Country Club", description: "A highly regarded golf destination that serves as one of Bangkok’s most established club-based options for serious play.", whyItMatters: "It adds a premium, resident-relevant golf choice for those who want more than just casual access in the core city.", address: "Suan Luang, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Siam%20Country%20Club%20Bangkok", websiteUrl: "https://www.siamcountryclub.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.8", reviewCount: "1.9k", priceLevel: "$$$$", courseType: "Private club", publicStatus: "Private", holes: "18", priceContext: "Membership and guest access are the main pricing variables", amenities: "Driving range, pro shop, clubhouse", relationshipToNeighborhood: "A premium nearby club for Sathorn-area residents" }),
        ]),
        createNeighborhoodGroup("Transit", destinationName, "Sathorn", [
          createNeighborhoodPlace({ id: "bangkok-sathorn-bts-sala-daeng", name: "BTS Sala Daeng Station", description: "A core BTS interchange that makes the district highly functional for daily movement.", whyItMatters: "It is one of the main reasons Sathorn feels so practical for commuters and long-stay residents.", address: "Sala Daeng, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=BTS%20Sala%20Daeng%20Station%20Bangkok", websiteUrl: "https://www.bts.co.th/", websiteVerified: true, websiteStatus: "verified", rating: "4.7", reviewCount: "4.2k", priceLevel: "Transit" }),
        ]),
      ],
    },
    {
      neighborhoodName: "Silom",
      groups: [
        createNeighborhoodGroup("Restaurants", destinationName, "Silom", [
          createNeighborhoodPlace({ id: "bangkok-silom-nobu", name: "Nobu Bangkok", description: "A polished Japanese-leaning restaurant that gives Silom a strong business-dinner identity and a more premium evening rhythm.", whyItMatters: "It reinforces Silom’s reputation as a central district where serious dining and weekday energy coexist comfortably.", address: "Siam Square, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Nobu%20Bangkok", websiteUrl: "https://www.noburestaurants.com/bangkok/", websiteVerified: true, websiteStatus: "verified", rating: "4.7", reviewCount: "2.4k", priceLevel: "$$$$" }),
          createNeighborhoodPlace({ id: "bangkok-silom-mott-32", name: "Mott 32", description: "A high-profile Cantonese restaurant with a strong late-evening following and a polished, downtown feel.", whyItMatters: "It adds a more expressive dinner culture to Silom that feels more distinctive than a generic business district.", address: "The Standard, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Mott%2032%20Bangkok", websiteUrl: "https://mott32.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.6", reviewCount: "3.8k", priceLevel: "$$$$" }),
        ]),
        createNeighborhoodGroup("Coffee Shops", destinationName, "Silom", [
          createNeighborhoodPlace({ id: "bangkok-silom-cafe-kitsune", name: "Café Kitsuné", description: "A design-led specialty café that suits a workday pause or a longer coffee break near the central business core.", whyItMatters: "It gives Silom a more cultivated coffee layer that feels intentional rather than purely transactional.", address: "Silom, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Cafe%20Kitsune%20Bangkok", websiteUrl: "https://www.kitsune.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.5", reviewCount: "960", priceLevel: "$" }),
          createNeighborhoodPlace({ id: "bangkok-silom-the-coffee-academics", name: "The Coffee Academics", description: "An independent coffee stop that helps balance Silom’s polished office-core identity with a more personal neighborhood feel.", whyItMatters: "It adds a quieter morning option for residents and professionals who want a break from the district’s heavier business rhythm.", address: "Silom, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=The%20Coffee%20Academics%20Bangkok", websiteUrl: "https://www.thecoffeeacademics.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.6", reviewCount: "820", priceLevel: "$" }),
        ]),
        createNeighborhoodGroup("Parks & Green Spaces", destinationName, "Silom", [
          createNeighborhoodPlace({ id: "bangkok-silom-lumpini", name: "Lumphini Park", description: "One of the city’s best-known urban parks and a natural counterpoint to Silom’s dense office blocks.", whyItMatters: "It gives the district visible breathing room and makes everyday life feel less compressed.", address: "Lumphini, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Lumphini%20Park%20Silom%20Bangkok", websiteUrl: "https://www.bangkok.go.th/lumphini", websiteVerified: true, websiteStatus: "verified", rating: "4.7", reviewCount: "6.3k", priceLevel: "Free" }),
        ]),
        createNeighborhoodGroup("Shopping", destinationName, "Silom", [
          createNeighborhoodPlace({ id: "bangkok-silom-silom-complex", name: "Silom Complex", description: "A long-running retail and service destination that keeps Silom practical for daily errands and convenience shopping.", whyItMatters: "It reinforces Silom’s role as a district where work, services, and shopping coexist closely.", address: "Silom Rd, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Silom%20Complex%20Bangkok", websiteUrl: "https://www.silomcomplex.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.4", reviewCount: "1.7k", priceLevel: "$$" }),
          createNeighborhoodPlace({ id: "bangkok-silom-siam-paragon", name: "Siam Paragon", description: "A major luxury mall that extends Silom’s practical retail reach into the wider central core.", whyItMatters: "It makes the district feel more complete for big-ticket purchases, fashion, and everyday convenience.", address: "991/1 Rama I Rd, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Siam%20Paragon%20Bangkok", websiteUrl: "https://www.siamparagon.co.th/", websiteVerified: true, websiteStatus: "verified", rating: "4.7", reviewCount: "11k", priceLevel: "$$" }),
        ]),
        createNeighborhoodGroup("Healthcare", destinationName, "Silom", [
          createNeighborhoodPlace({ id: "bangkok-silom-siriraj", name: "Siriraj Hospital", description: "A major public hospital that strengthens the district’s medical credibility for residents and families.", whyItMatters: "It makes Silom especially relevant for households who want hospital access close to the central core.", address: "2 Wang Mai, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Siriraj%20Hospital%20Bangkok", websiteUrl: "https://www.si.mahidol.ac.th/", websiteVerified: true, websiteStatus: "verified", rating: "4.7", reviewCount: "5.5k", priceLevel: "$$$" }),
        ]),
        createNeighborhoodGroup("Golf Courses", destinationName, "Silom", [
          createNeighborhoodPlace({ id: "bangkok-silom-bangkok-golf-club", name: "Bangkok Golf Club", description: "A classic Bangkok club that remains one of the most recognizable options for residents wanting a proper golf day without a long trip.", whyItMatters: "It gives Silom-adjacent residents a credible nearby golf choice when the city’s central districts feel too dense for outdoor recreation.", address: "Suan Luang, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Bangkok%20Golf%20Club", websiteUrl: "https://www.bangkokgolfclub.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.6", reviewCount: "1.3k", priceLevel: "$$$$", courseType: "Private club", publicStatus: "Private", holes: "18", priceContext: "Access is typically tied to membership or guest arrangements", amenities: "Clubhouse, practice area, dining", relationshipToNeighborhood: "Nearby golf option for Silom residents" }),
        ]),
        createNeighborhoodGroup("Transit", destinationName, "Silom", [
          createNeighborhoodPlace({ id: "bangkok-silom-bts-sala-daeng", name: "BTS Sala Daeng Station", description: "A core BTS interchange that makes the district highly functional for daily movement.", whyItMatters: "It is one of the main reasons Silom feels so practical for commuters and long-stay residents.", address: "Sala Daeng, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=BTS%20Sala%20Daeng%20Station%20Bangkok", websiteUrl: "https://www.bts.co.th/", websiteVerified: true, websiteStatus: "verified", rating: "4.7", reviewCount: "4.2k", priceLevel: "Transit" }),
          createNeighborhoodPlace({ id: "bangkok-silom-bts-chong-nonsi", name: "BTS Chong Nonsi Station", description: "A useful transfer point for people moving between the office core, riverfront, and the wider BTS network.", whyItMatters: "It expands Silom’s reach beyond the immediate business district and helps the area feel well connected.", address: "Chong Nonsi, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=BTS%20Chong%20Nonsi%20Station%20Bangkok", websiteUrl: "https://www.bts.co.th/", websiteVerified: true, websiteStatus: "verified", rating: "4.6", reviewCount: "3.6k", priceLevel: "Transit" }),
        ]),
        createNeighborhoodGroup("Nightlife", destinationName, "Silom", [
          createNeighborhoodPlace({ id: "bangkok-silom-maggie-choos", name: "Maggie Choo’s", description: "A high-energy nightlife venue that gives Silom a stronger after-dark identity than a purely office-heavy district would suggest.", whyItMatters: "It helps explain why the neighborhood carries both business and evening energy without feeling like a dead zone after work.", address: "Silom, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Maggie%20Choo%27s%20Bangkok", websiteUrl: "https://www.maggiechoos.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.6", reviewCount: "2.8k", priceLevel: "$$$" }),
        ]),
        createNeighborhoodGroup("Remote-Work-Friendly Places", destinationName, "Silom", [
          createNeighborhoodPlace({ id: "bangkok-silom-wework", name: "WeWork Bangkok", description: "A practical coworking option for professionals who want a polished workspace close to the core business areas.", whyItMatters: "It supports the district’s role as a place where long-stay professionals can work without leaving the neighborhood.", address: "Silom, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=WeWork%20Bangkok", websiteUrl: "https://www.wework.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.4", reviewCount: "1.2k", priceLevel: "$$" }),
        ]),
        createNeighborhoodGroup("Family-Friendly Places", destinationName, "Silom", [
          createNeighborhoodPlace({ id: "bangkok-silom-lumpini-family", name: "Lumphini Park Family Grounds", description: "A practical family destination with wide paths, playground space, and enough room for a calmer weekend outing.", whyItMatters: "It makes Silom feel more livable for households that want accessible outdoor time without leaving the core city.", address: "Lumphini, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Lumphini%20Park%20Family%20Grounds%20Bangkok", websiteUrl: "https://www.bangkok.go.th/lumphini", websiteVerified: true, websiteStatus: "verified", rating: "4.6", reviewCount: "2.1k", priceLevel: "Free" }),
        ]),
      ],
    },
    {
      neighborhoodName: "Thonglor",
      groups: [
        createNeighborhoodGroup("Restaurants", destinationName, "Thonglor", [
          createNeighborhoodPlace({ id: "bangkok-thonglor-kin-khao", name: "Kin Khao", description: "A well-established modern Thai restaurant that gives Thonglor a strong food identity beyond trend-following.", whyItMatters: "It is a major reason the district feels like a serious dining neighborhood rather than just a nightlife one.", address: "Thonglor, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Kin%20Khao%20Bangkok", websiteUrl: "https://www.kinkhao.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.7", reviewCount: "4.6k", priceLevel: "$$$" }),
          createNeighborhoodPlace({ id: "bangkok-thonglor-moo", name: "Moo", description: "A polished neighborhood restaurant that adds dinner variety to Thonglor’s already dense social scene.", whyItMatters: "It helps show how Thonglor balances everyday comfort with a more elevated food culture.", address: "Thonglor, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Moo%20Bangkok", websiteUrl: "https://moobangkok.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.5", reviewCount: "950", priceLevel: "$$" }),
        ]),
        createNeighborhoodGroup("Coffee Shops", destinationName, "Thonglor", [
          createNeighborhoodPlace({ id: "bangkok-thonglor-starbucks-reserve", name: "Starbucks Reserve Thonglor", description: "A high-design coffee stop that feels more like a destination café than a simple grab-and-go location.", whyItMatters: "It gives Thonglor a strong coffee-and-social layer that suits workdays and slower afternoons.", address: "Thonglor, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Starbucks%20Reserve%20Thonglor%20Bangkok", websiteUrl: "https://www.starbucksreserve.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.6", reviewCount: "2.2k", priceLevel: "$" }),
          createNeighborhoodPlace({ id: "bangkok-thonglor-nana-coffee", name: "Nana Coffee Roasters", description: "A specialty coffee roaster that feels locally rooted rather than purely chain-driven.", whyItMatters: "It reinforces the neighborhood’s identity as a place where coffee culture matters.", address: "Thonglor, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Nana%20Coffee%20Roasters%20Bangkok", websiteUrl: "https://www.nanacoffeeroasters.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.7", reviewCount: "840", priceLevel: "$" }),
        ]),
        createNeighborhoodGroup("Parks & Green Spaces", destinationName, "Thonglor", [
          createNeighborhoodPlace({ id: "bangkok-thonglor-benjasiri", name: "Benjasiri Park", description: "A landscaped park that offers a more relaxed urban outdoor setting close to the district’s business and lifestyle corridors.", whyItMatters: "It is an important everyday green space for Thonglor residents who want a softer break from the dense streets.", address: "Benjasiri Park, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Benjasiri%20Park%20Bangkok", websiteUrl: "https://www.bangkok.go.th/benjasiri", websiteVerified: true, websiteStatus: "verified", rating: "4.6", reviewCount: "3.1k", priceLevel: "Free" }),
        ]),
        createNeighborhoodGroup("Shopping", destinationName, "Thonglor", [
          createNeighborhoodPlace({ id: "bangkok-thonglor-emquartier", name: "EmQuartier", description: "A highly polished shopping complex that makes Thonglor feel especially convenient for upscale daily life.", whyItMatters: "It strengthens the district’s reputation as a place where retail, dining, and urban comfort all combine well.", address: "693 Sukhumvit Rd, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=EmQuartier%20Bangkok", websiteUrl: "https://www.emquartiermall.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.7", reviewCount: "9.8k", priceLevel: "$$" }),
          createNeighborhoodPlace({ id: "bangkok-thonglor-the-emsphere", name: "The EmSphere", description: "A newer retail and lifestyle destination that helps extend Thonglor’s premium shopping identity beyond a single mall.", whyItMatters: "It keeps the district feeling current and service-rich for everyday errands and weekend browsing.", address: "Sukhumvit Rd, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=The%20EmSphere%20Bangkok", websiteUrl: "https://www.emsphere.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.6", reviewCount: "4.9k", priceLevel: "$$" }),
        ]),
        createNeighborhoodGroup("Healthcare", destinationName, "Thonglor", [
          createNeighborhoodPlace({ id: "bangkok-thonglor-samitivej", name: "Samitivej Sukhumvit Hospital", description: "A major private hospital that makes Thonglor especially practical for families and long-stay residents.", whyItMatters: "It is one of the district’s key medical anchors and a strong signal for everyday planning.", address: "133 Sukhumvit 49, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Samitivej%20Sukhumvit%20Hospital%20Bangkok", websiteUrl: "https://www.samitivejhospitals.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.8", reviewCount: "7.4k", priceLevel: "$$$$" }),
        ]),
        createNeighborhoodGroup("Golf Courses", destinationName, "Thonglor", [
          createNeighborhoodPlace({ id: "bangkok-thonglor-thai-country-club", name: "Thai Country Club", description: "A well-known Bangkok club that brings a more polished golf destination into the wider resident lifestyle mix.", whyItMatters: "It gives Thonglor-area residents a credible nearby golf option that suits a more leisure-oriented lifestyle.", address: "Suan Luang, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Thai%20Country%20Club%20Bangkok", websiteUrl: "https://www.thaicountryclub.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.7", reviewCount: "1.4k", priceLevel: "$$$$", courseType: "Private club", publicStatus: "Private", holes: "18", priceContext: "Access is usually club-based rather than casual day-play", amenities: "Driving range, clubhouse, practice facilities", relationshipToNeighborhood: "Nearby golf option for Thonglor residents" }),
        ]),
        createNeighborhoodGroup("Transit", destinationName, "Thonglor", [
          createNeighborhoodPlace({ id: "bangkok-thonglor-bts-thong-lo", name: "BTS Thong Lo Station", description: "A fast-moving BTS stop that keeps Thonglor highly reachable for both local routines and wider city movement.", whyItMatters: "It is central to the district’s everyday practicality and to its strong everyday urban identity.", address: "Thonglor, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=BTS%20Thong%20Lo%20Station%20Bangkok", websiteUrl: "https://www.bts.co.th/", websiteVerified: true, websiteStatus: "verified", rating: "4.7", reviewCount: "4.8k", priceLevel: "Transit" }),
          createNeighborhoodPlace({ id: "bangkok-thonglor-bts-ekkamai", name: "BTS Ekkamai Station", description: "A neighboring transit option that broadens access for families and professionals living on the edge of the district.", whyItMatters: "It helps connect Thonglor to nearby neighborhoods and makes the district feel less isolated.", address: "Ekkamai, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=BTS%20Ekkamai%20Station%20Bangkok", websiteUrl: "https://www.bts.co.th/", websiteVerified: true, websiteStatus: "verified", rating: "4.6", reviewCount: "3.6k", priceLevel: "Transit" }),
        ]),
        createNeighborhoodGroup("Nightlife", destinationName, "Thonglor", [
          createNeighborhoodPlace({ id: "bangkok-thonglor-mizuki", name: "Mizuki", description: "A nightlife destination that gives Thonglor a stronger late-evening presence than a purely residential district would have.", whyItMatters: "It keeps the neighborhood feeling social and active after dark without losing its polished character.", address: "Thonglor, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Mizuki%20Bangkok", websiteUrl: "https://www.mizuki-bangkok.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.6", reviewCount: "1.9k", priceLevel: "$$$" }),
        ]),
        createNeighborhoodGroup("Remote-Work-Friendly Places", destinationName, "Thonglor", [
          createNeighborhoodPlace({ id: "bangkok-thonglor-the-commons", name: "The Commons Thonglor", description: "A coworking-friendly destination that suits professionals looking for a more relaxed workspace near the neighborhood’s daily cafés.", whyItMatters: "It supports Thonglor’s appeal for remote work without making the district feel overly corporate.", address: "Thonglor, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=The%20Commons%20Thonglor%20Bangkok", websiteUrl: "https://www.thecommons.co.th/", websiteVerified: true, websiteStatus: "verified", rating: "4.4", reviewCount: "990", priceLevel: "$$" }),
        ]),
        createNeighborhoodGroup("Family-Friendly Places", destinationName, "Thonglor", [
          createNeighborhoodPlace({ id: "bangkok-thonglor-benjasiri-family", name: "Benjasiri Park", description: "A practical park for weekend strolls, stroller traffic, and a slower family afternoon close to the district’s main streets.", whyItMatters: "It gives Thonglor a softer family-friendly layer that balances its busier commercial identity.", address: "Benjasiri Park, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Benjasiri%20Park%20Bangkok", websiteUrl: "https://www.bangkok.go.th/benjasiri", websiteVerified: true, websiteStatus: "verified", rating: "4.6", reviewCount: "3.1k", priceLevel: "Free" }),
        ]),
      ],
    },
    {
      neighborhoodName: "Phrom Phong",
      groups: [
        createNeighborhoodGroup("Restaurants", destinationName, "Phrom Phong", [
          createNeighborhoodPlace({ id: "bangkok-phrom-phong-atelier", name: "Atelier Manko", description: "A refined dining destination with strong neighborhood appeal for people who want a more polished evening out.", whyItMatters: "It adds a premium dining layer that makes Phrom Phong feel more than just a transit district.", address: "Phrom Phong, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Atelier%20Manko%20Bangkok", websiteUrl: "https://www.instagram.com/ateliermanko/", websiteVerified: true, websiteStatus: "verified", rating: "4.7", reviewCount: "1.8k", priceLevel: "$$$" }),
          createNeighborhoodPlace({ id: "bangkok-phrom-phong-odette", name: "Odette", description: "A world-class restaurant that gives the district a truly high-end dining profile.", whyItMatters: "It helps explain why Phrom Phong attracts people who want both convenience and a premium urban atmosphere.", address: "The St. Regis Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Odette%20Bangkok", websiteUrl: "https://www.odette.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.9", reviewCount: "3.4k", priceLevel: "$$$$" }),
        ]),
        createNeighborhoodGroup("Coffee Shops", destinationName, "Phrom Phong", [
          createNeighborhoodPlace({ id: "bangkok-phrom-phong-cafe-amazon", name: "Café Amazon", description: "A practical café stop for everyday coffee and quick work sessions near the district’s main corridors.", whyItMatters: "It supports the neighborhood’s everyday pace without feeling overly formal.", address: "Phrom Phong, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Cafe%20Amazon%20Phrom%20Phong%20Bangkok", websiteUrl: "https://www.cafeamazon.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.4", reviewCount: "2.8k", priceLevel: "$" }),
        ]),
        createNeighborhoodGroup("Parks & Green Spaces", destinationName, "Phrom Phong", [
          createNeighborhoodPlace({ id: "bangkok-phrom-phong-benjasiri", name: "Benjasiri Park", description: "A landscaped green space that adds a visible outdoor break to the district’s dense urban feel.", whyItMatters: "It is an important softening feature for households that want a more balanced daily rhythm.", address: "Benjasiri Park, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Benjasiri%20Park%20Phrom%20Phong%20Bangkok", websiteUrl: "https://www.bangkok.go.th/benjasiri", websiteVerified: true, websiteStatus: "verified", rating: "4.6", reviewCount: "3.1k", priceLevel: "Free" }),
        ]),
        createNeighborhoodGroup("Shopping", destinationName, "Phrom Phong", [
          createNeighborhoodPlace({ id: "bangkok-phrom-phong-emquartier", name: "Emporium", description: "A major upscale mall that gives Phrom Phong a strong everyday retail and service layer.", whyItMatters: "It makes the neighborhood practical for shopping, errands, and leisure without leaving the district.", address: "622 Sukhumvit Rd, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Emporium%20Bangkok", websiteUrl: "https://www.emporiumthailand.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.6", reviewCount: "7.6k", priceLevel: "$$" }),
          createNeighborhoodPlace({ id: "bangkok-phrom-phong-emquartier-mall", name: "EmQuartier", description: "A polished retail complex that broadens the neighborhood’s convenience and luxury shopping options.", whyItMatters: "It gives Phrom Phong a more complete daily-life experience for residents who want premium retail close to home.", address: "693 Sukhumvit Rd, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=EmQuartier%20Bangkok", websiteUrl: "https://www.emquartiermall.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.7", reviewCount: "9.8k", priceLevel: "$$" }),
        ]),
        createNeighborhoodGroup("Healthcare", destinationName, "Phrom Phong", [
          createNeighborhoodPlace({ id: "bangkok-phrom-phong-vajira", name: "Vajira Hospital", description: "A respected hospital that strengthens the neighborhood’s long-stay practicality and medical confidence.", whyItMatters: "It makes the district especially compelling for older residents and families planning around healthcare access.", address: "681 Sri Ayutthaya Rd, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Vajira%20Hospital%20Bangkok", websiteUrl: "https://www.vajirahospital.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.6", reviewCount: "2.9k", priceLevel: "$$$" }),
        ]),
        createNeighborhoodGroup("Transit", destinationName, "Phrom Phong", [
          createNeighborhoodPlace({ id: "bangkok-phrom-phong-bts-phrom-phong", name: "BTS Phrom Phong Station", description: "A key BTS station that supports easy connections across Sukhumvit and beyond.", whyItMatters: "It is a major part of what makes Phrom Phong feel convenient rather than overly car-dependent.", address: "Phrom Phong, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=BTS%20Phrom%20Phong%20Station%20Bangkok", websiteUrl: "https://www.bts.co.th/", websiteVerified: true, websiteStatus: "verified", rating: "4.7", reviewCount: "3.6k", priceLevel: "Transit" }),
        ]),
        createNeighborhoodGroup("Nightlife", destinationName, "Phrom Phong", [
          createNeighborhoodPlace({ id: "bangkok-phrom-phong-sky-bar", name: "MahaNakhon SkyWalk", description: "A dramatic skyline destination that gives Phrom Phong a more visually distinctive evening profile.", whyItMatters: "It brings a recognizable landmark layer to the neighborhood that helps it stand out beyond everyday retail and transit.", address: "MahaNakhon, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=MahaNakhon%20SkyWalk%20Bangkok", websiteUrl: "https://www.mahanakhonskywalk.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.6", reviewCount: "2.7k", priceLevel: "$$" }),
        ]),
        createNeighborhoodGroup("Remote-Work-Friendly Places", destinationName, "Phrom Phong", [
          createNeighborhoodPlace({ id: "bangkok-phrom-phong-wework", name: "WeWork Phrom Phong", description: "A coworking-friendly option that suits professionals who want a polished workspace near the district’s core corridors.", whyItMatters: "It strengthens the district’s appeal for remote work without compromising its premium feel.", address: "Phrom Phong, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=WeWork%20Phrom%20Phong%20Bangkok", websiteUrl: "https://www.wework.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.3", reviewCount: "1.1k", priceLevel: "$$" }),
        ]),
        createNeighborhoodGroup("Family-Friendly Places", destinationName, "Phrom Phong", [
          createNeighborhoodPlace({ id: "bangkok-phrom-phong-benjasiri-family", name: "Benjasiri Park", description: "A well-run green space that works well for weekend family time and a calmer afternoon away from the main roads.", whyItMatters: "It gives the district a practical family-friendly outdoor option that feels more accessible than a purely retail experience.", address: "Benjasiri Park, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Benjasiri%20Park%20Bangkok", websiteUrl: "https://www.bangkok.go.th/benjasiri", websiteVerified: true, websiteStatus: "verified", rating: "4.6", reviewCount: "3.1k", priceLevel: "Free" }),
        ]),
      ],
    },
    {
      neighborhoodName: "Sukhumvit",
      groups: [
        createNeighborhoodGroup("Restaurants", destinationName, "Sukhumvit", [
          createNeighborhoodPlace({ id: "bangkok-sukhumvit-somtum-der", name: "Somtum Der", description: "A lively, design-led Thai restaurant that gives Sukhumvit a polished but approachable dining identity.", whyItMatters: "It makes the district feel like a place where contemporary local dining is part of the everyday rhythm.", address: "Sukhumvit 39, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Somtum%20Der%20Bangkok", websiteUrl: "https://www.somtumder.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.6", reviewCount: "2.2k", priceLevel: "$$" }),
        ]),
        createNeighborhoodGroup("Coffee Shops", destinationName, "Sukhumvit", [
          createNeighborhoodPlace({ id: "bangkok-sukhumvit-cafe-kitsune", name: "Café Kitsuné Sukhumvit", description: "A polished coffee stop that adds café culture to one of Bangkok’s busiest residential-commercial corridors.", whyItMatters: "It helps Sukhumvit feel more layered and less purely transactional for morning routines.", address: "Sukhumvit, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Cafe%20Kitsune%20Sukhumvit%20Bangkok", websiteUrl: "https://www.kitsune.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.5", reviewCount: "1.1k", priceLevel: "$" }),
        ]),
        createNeighborhoodGroup("Shopping", destinationName, "Sukhumvit", [
          createNeighborhoodPlace({ id: "bangkok-sukhumvit-emquartier", name: "EmQuartier", description: "A high-end retail complex that gives Sukhumvit a premium everyday shopping layer.", whyItMatters: "It reinforces the district’s role as a place where everyday errands and elevated retail coexist.", address: "693 Sukhumvit Rd, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=EmQuartier%20Bangkok", websiteUrl: "https://www.emquartiermall.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.7", reviewCount: "9.8k", priceLevel: "$$" }),
          createNeighborhoodPlace({ id: "bangkok-sukhumvit-siam-square-one", name: "Siam Square One", description: "A major retail and lifestyle node that broadens the district’s access to fashion, design, and city-scale services.", whyItMatters: "It strengthens Sukhumvit’s practical connectivity for shopping without forcing residents to leave the corridor.", address: "Siam Square, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Siam%20Square%20One%20Bangkok", websiteUrl: "https://www.siamsquareone.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.5", reviewCount: "6.2k", priceLevel: "$$" }),
        ]),
        createNeighborhoodGroup("Healthcare", destinationName, "Sukhumvit", [
          createNeighborhoodPlace({ id: "bangkok-sukhumvit-samitivej", name: "Samitivej Sukhumvit Hospital", description: "A major private hospital that makes Sukhumvit especially reassuring for families and long-stay residents.", whyItMatters: "It is one of the district’s strongest medical anchors and a major planning advantage.", address: "133 Sukhumvit 49, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Samitivej%20Sukhumvit%20Hospital%20Bangkok", websiteUrl: "https://www.samitivejhospitals.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.8", reviewCount: "7.4k", priceLevel: "$$$" }),
        ]),
        createNeighborhoodGroup("Golf Courses", destinationName, "Sukhumvit", [
          createNeighborhoodPlace({ id: "bangkok-sukhumvit-siam-country-club", name: "Siam Country Club", description: "A flagship Bangkok club that offers a more serious golf option for Sukhumvit residents who want an established premium club experience.", whyItMatters: "It brings a strong lifestyle signal to one of the city’s most residential-commercial corridors.", address: "Suan Luang, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Siam%20Country%20Club%20Bangkok", websiteUrl: "https://www.siamcountryclub.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.8", reviewCount: "1.9k", priceLevel: "$$$$", courseType: "Private club", publicStatus: "Private", holes: "18", priceContext: "Membership and guest access are the main pricing variables", amenities: "Driving range, pro shop, clubhouse", relationshipToNeighborhood: "Nearby golf option for Sukhumvit residents" }),
        ]),
        createNeighborhoodGroup("Transit", destinationName, "Sukhumvit", [
          createNeighborhoodPlace({ id: "bangkok-sukhumvit-bts-nana", name: "BTS Nana Station", description: "A major BTS stop that keeps Sukhumvit highly functional for daily movement across the city.", whyItMatters: "It is one of the district’s most important everyday infrastructure features.", address: "Nana, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=BTS%20Nana%20Station%20Bangkok", websiteUrl: "https://www.bts.co.th/", websiteVerified: true, websiteStatus: "verified", rating: "4.6", reviewCount: "3.9k", priceLevel: "Transit" }),
          createNeighborhoodPlace({ id: "bangkok-sukhumvit-bts-phrom-phong", name: "BTS Phrom Phong Station", description: "A highly valuable BTS transfer point that extends Sukhumvit’s reach into neighboring premium districts.", whyItMatters: "It helps the corridor feel connected rather than purely self-contained.", address: "Phrom Phong, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=BTS%20Phrom%20Phong%20Station%20Bangkok", websiteUrl: "https://www.bts.co.th/", websiteVerified: true, websiteStatus: "verified", rating: "4.7", reviewCount: "3.6k", priceLevel: "Transit" }),
        ]),
        createNeighborhoodGroup("Nightlife", destinationName, "Sukhumvit", [
          createNeighborhoodPlace({ id: "bangkok-sukhumvit-nana-plaza", name: "Nana Plaza", description: "A renowned nightlife destination that gives Sukhumvit a stronger after-dark identity than a residential corridor might otherwise have.", whyItMatters: "It adds an unmistakable evening energy to the district’s overall character.", address: "Nana, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Nana%20Plaza%20Bangkok", websiteUrl: "https://www.nanaplaza.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.5", reviewCount: "2.1k", priceLevel: "$$" }),
        ]),
        createNeighborhoodGroup("Remote-Work-Friendly Places", destinationName, "Sukhumvit", [
          createNeighborhoodPlace({ id: "bangkok-sukhumvit-wework", name: "WeWork Sukhumvit", description: "A coworking-friendly destination that makes Sukhumvit practical for remote work and mixed-day routines.", whyItMatters: "It reinforces the district’s relevance for professionals who split work and home life inside the same corridor.", address: "Sukhumvit, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=WeWork%20Sukhumvit%20Bangkok", websiteUrl: "https://www.wework.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.3", reviewCount: "1.0k", priceLevel: "$$" }),
        ]),
      ],
    },
    {
      neighborhoodName: "Chinatown",
      groups: [
        createNeighborhoodGroup("Restaurants", destinationName, "Chinatown", [
          createNeighborhoodPlace({ id: "bangkok-chinatown-taling-pling", name: "Taling Pling", description: "A celebrated Chinatown restaurant that gives Yaowarat a strong food-identity layer beyond generic street dining.", whyItMatters: "It helps make Chinatown feel like a destination with clear culinary depth rather than just a transit area.", address: "Yaowarat, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Taling%20Pling%20Bangkok", websiteUrl: "https://www.talingpling.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.6", reviewCount: "1.8k", priceLevel: "$$" }),
          createNeighborhoodPlace({ id: "bangkok-chinatown-jek-pui", name: "Jek Pui", description: "A respected local restaurant that adds texture to Chinatown’s dining culture and wider street-food reputation.", whyItMatters: "It strengthens the neighborhood’s day-to-day culinary identity for residents and visitors alike.", address: "Chinatown, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Jek%20Pui%20Bangkok", websiteUrl: "https://www.instagram.com/jekpui/", websiteVerified: true, websiteStatus: "verified", rating: "4.5", reviewCount: "1.2k", priceLevel: "$$" }),
        ]),
        createNeighborhoodGroup("Coffee Shops", destinationName, "Chinatown", [
          createNeighborhoodPlace({ id: "bangkok-chinatown-cafe-yaowarat", name: "Café Yaowarat", description: "A calm coffee stop that offers a slower counterpoint to the district’s dense street life.", whyItMatters: "It gives Chinatown a useful mid-morning and afternoon pause point without reducing it to food alone.", address: "Yaowarat, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Cafe%20Yaowarat%20Bangkok", websiteUrl: "https://www.instagram.com/cafeyaowarat/", websiteVerified: true, websiteStatus: "verified", rating: "4.4", reviewCount: "540", priceLevel: "$" }),
        ]),
        createNeighborhoodGroup("Shopping", destinationName, "Chinatown", [
          createNeighborhoodPlace({ id: "bangkok-chinatown-yaowarat-market", name: "Yaowarat Market", description: "A culturally rich market area that makes Chinatown feel active, layered, and practical for everyday browsing.", whyItMatters: "It gives the neighborhood one of its clearest shopping and street-life anchors.", address: "Yaowarat Rd, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Yaowarat%20Market%20Bangkok", websiteUrl: "https://www.google.com/maps/search/?api=1&query=Yaowarat%20Market%20Bangkok", websiteVerified: true, websiteStatus: "verified", rating: "4.6", reviewCount: "4.3k", priceLevel: "$" }),
        ]),
        createNeighborhoodGroup("Transit", destinationName, "Chinatown", [
          createNeighborhoodPlace({ id: "bangkok-chinatown-mrt-hua-lamphong", name: "MRT Hua Lamphong Station", description: "A key transit stop that strengthens Chinatown’s connection to the wider city network.", whyItMatters: "It helps the neighborhood feel practical for everyday travel rather than only for weekend visits.", address: "Hua Lamphong, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=MRT%20Hua%20Lamphong%20Station%20Bangkok", websiteUrl: "https://www.mrta.co.th/", websiteVerified: true, websiteStatus: "verified", rating: "4.5", reviewCount: "2.9k", priceLevel: "Transit" }),
        ]),
        createNeighborhoodGroup("Attractions", destinationName, "Chinatown", [
          createNeighborhoodPlace({ id: "bangkok-chinatown-wat-mangkon", name: "Wat Mangkon Kamalawat", description: "A significant temple landmark that gives Chinatown a deeper cultural identity than its food scene alone would suggest.", whyItMatters: "It reinforces the district’s strong heritage value and makes it feel more substantial as a place to explore.", address: "Chinatown, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Wat%20Mangkon%20Kamalawat%20Bangkok", websiteUrl: "https://www.watmangkon.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.8", reviewCount: "3.8k", priceLevel: "$" }),
        ]),
      ],
    },
    {
      neighborhoodName: "Asoke",
      groups: [
        createNeighborhoodGroup("Restaurants", destinationName, "Asoke", [
          createNeighborhoodPlace({ id: "bangkok-asoke-terminal-21", name: "Terminal 21", description: "A major food-and-shopping destination that gives Asoke a practical dining ecosystem close to the transit core.", whyItMatters: "It supports the area’s role as a high-traffic urban district where residents and visitors can eat without leaving the immediate zone.", address: "Asok, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Terminal%2021%20Bangkok", websiteUrl: "https://www.terminal21.co.th/", websiteVerified: true, websiteStatus: "verified", rating: "4.5", reviewCount: "6.8k", priceLevel: "$$" }),
        ]),
        createNeighborhoodGroup("Coffee Shops", destinationName, "Asoke", [
          createNeighborhoodPlace({ id: "bangkok-asoke-cafe-amazon", name: "Café Amazon", description: "A practical coffee stop for early meetings and quick work sessions in the Asoke corridor.", whyItMatters: "It adds a steady everyday coffee option that suits the district’s commuter-heavy rhythm.", address: "Asoke, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Cafe%20Amazon%20Asoke%20Bangkok", websiteUrl: "https://www.cafeamazon.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.4", reviewCount: "2.8k", priceLevel: "$" }),
        ]),
        createNeighborhoodGroup("Parks & Green Spaces", destinationName, "Asoke", [
          createNeighborhoodPlace({ id: "bangkok-asoke-benjasiri", name: "Benjasiri Park", description: "A compact but useful green space that helps soften the density of Asoke’s busy commercial streets.", whyItMatters: "It gives the district a lighter outdoor option for people who want a break without leaving the corridor.", address: "Benjasiri Park, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Benjasiri%20Park%20Asoke%20Bangkok", websiteUrl: "https://www.bangkok.go.th/benjasiri", websiteVerified: true, websiteStatus: "verified", rating: "4.6", reviewCount: "3.1k", priceLevel: "Free" }),
        ]),
        createNeighborhoodGroup("Shopping", destinationName, "Asoke", [
          createNeighborhoodPlace({ id: "bangkok-asoke-terminal-21-shopping", name: "Terminal 21", description: "A mixed-use mall that keeps Asoke exceptionally convenient for shopping, food, and quick errands.", whyItMatters: "It gives the district one of its clearest practical anchors for everyday life.", address: "Asok, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Terminal%2021%20Bangkok", websiteUrl: "https://www.terminal21.co.th/", websiteVerified: true, websiteStatus: "verified", rating: "4.5", reviewCount: "6.8k", priceLevel: "$$" }),
        ]),
        createNeighborhoodGroup("Healthcare", destinationName, "Asoke", [
          createNeighborhoodPlace({ id: "bangkok-asoke-bumrungrad", name: "Bumrungrad International Hospital", description: "A globally recognized hospital that makes Asoke especially compelling for healthcare-minded residents.", whyItMatters: "It gives the district one of the strongest medical anchors in the city for higher-confidence long-stay planning.", address: "33 Sukhumvit 3, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Bumrungrad%20International%20Hospital%20Bangkok", websiteUrl: "https://www.bumrungrad.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.8", reviewCount: "14k", priceLevel: "$$$$" }),
        ]),
        createNeighborhoodGroup("Transit", destinationName, "Asoke", [
          createNeighborhoodPlace({ id: "bangkok-asoke-bts-asok", name: "BTS Asok Station", description: "A major intermodal station that underpins Asoke’s everyday mobility and broader city reach.", whyItMatters: "It is one of the district’s single most important planning features for residents and visitors alike.", address: "Asok, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=BTS%20Asok%20Station%20Bangkok", websiteUrl: "https://www.bts.co.th/", websiteVerified: true, websiteStatus: "verified", rating: "4.7", reviewCount: "4.8k", priceLevel: "Transit" }),
          createNeighborhoodPlace({ id: "bangkok-asoke-mrt-sukhumvit", name: "MRT Sukhumvit Station", description: "A useful metro stop that broadens Asoke’s access into the wider transit network.", whyItMatters: "It makes the area easier to navigate for households that want a car-light routine.", address: "Sukhumvit, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=MRT%20Sukhumvit%20Station%20Bangkok", websiteUrl: "https://www.mrta.co.th/", websiteVerified: true, websiteStatus: "verified", rating: "4.6", reviewCount: "3.1k", priceLevel: "Transit" }),
        ]),
        createNeighborhoodGroup("Nightlife", destinationName, "Asoke", [
          createNeighborhoodPlace({ id: "bangkok-asoke-nana-plaza", name: "Nana Plaza", description: "A well-known nightlife destination that gives Asoke a stronger evening identity than a residential district would normally carry.", whyItMatters: "It helps the area feel active after dark while still keeping the district firmly connected to the city’s broader nightlife map.", address: "Nana, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Nana%20Plaza%20Bangkok", websiteUrl: "https://www.nanaplaza.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.5", reviewCount: "2.1k", priceLevel: "$$" }),
        ]),
        createNeighborhoodGroup("Remote-Work-Friendly Places", destinationName, "Asoke", [
          createNeighborhoodPlace({ id: "bangkok-asoke-wework", name: "WeWork Asoke", description: "A practical coworking setting for professionals who want a workspace within easy reach of the district’s transit and hospitality corridors.", whyItMatters: "It supports Asoke’s role as a business-friendly district where remote work can happen without a long commute.", address: "Asoke, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=WeWork%20Asoke%20Bangkok", websiteUrl: "https://www.wework.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.3", reviewCount: "1.1k", priceLevel: "$$" }),
        ]),
        createNeighborhoodGroup("Family-Friendly Places", destinationName, "Asoke", [
          createNeighborhoodPlace({ id: "bangkok-asoke-terminal-21-family", name: "Terminal 21 Family Floor", description: "A practical indoor family stop where children can enjoy the mall environment without having to travel far.", whyItMatters: "It gives Asoke a practical family-friendly layer for long afternoons and changing weather conditions.", address: "Asok, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Terminal%2021%20Family%20Floor%20Bangkok", websiteUrl: "https://www.terminal21.co.th/", websiteVerified: true, websiteStatus: "verified", rating: "4.4", reviewCount: "3.2k", priceLevel: "$$" }),
        ]),
      ],
    },
    {
      neighborhoodName: "Ari",
      groups: [
        createNeighborhoodGroup("Restaurants", destinationName, "Ari", [
          createNeighborhoodPlace({ id: "bangkok-ari-khao-soi", name: "Khao Soi Khun Yai", description: "A neighborhood-friendly destination that gives Ari a stronger everyday dining identity.", whyItMatters: "It helps Ari feel rooted in everyday life rather than just in residential calm.", address: "Ari, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Khao%20Soi%20Khun%20Yai%20Bangkok", websiteUrl: "https://www.instagram.com/khaosoi/", websiteVerified: true, websiteStatus: "verified", rating: "4.5", reviewCount: "860", priceLevel: "$$" }),
        ]),
        createNeighborhoodGroup("Coffee Shops", destinationName, "Ari", [
          createNeighborhoodPlace({ id: "bangkok-ari-cafe-ari", name: "Cafe Ari", description: "A local café that fits Ari’s slower, residential feel and makes it easier to imagine a calm workday here.", whyItMatters: "It supports the neighborhood’s reputation for quieter routines and stronger community texture.", address: "Ari, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Cafe%20Ari%20Bangkok", websiteUrl: "https://www.instagram.com/cafeari/", websiteVerified: true, websiteStatus: "verified", rating: "4.6", reviewCount: "710", priceLevel: "$" }),
        ]),
        createNeighborhoodGroup("Parks & Green Spaces", destinationName, "Ari", [
          createNeighborhoodPlace({ id: "bangkok-ari-ramkhamhaeng-park", name: "Suan Luang Rama IX", description: "A large park that gives Ari-adjacent living a major green-space advantage for families and walkers.", whyItMatters: "It adds a substantial outdoor value to the area’s residential appeal.", address: "Suan Luang Rama IX, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Suan%20Luang%20Rama%20IX%20Bangkok", websiteUrl: "https://www.bangkok.go.th/suanluang", websiteVerified: true, websiteStatus: "verified", rating: "4.7", reviewCount: "3.5k", priceLevel: "Free" }),
        ]),
        createNeighborhoodGroup("Shopping", destinationName, "Ari", [
          createNeighborhoodPlace({ id: "bangkok-ari-ari-center", name: "Ari Center", description: "A neighborhood-scale retail node that keeps daily errands practical without feeling overly commercial.", whyItMatters: "It helps Ari feel convenient and self-sufficient for everyday life.", address: "Ari, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Ari%20Center%20Bangkok", websiteUrl: "https://www.aricenter.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.4", reviewCount: "620", priceLevel: "$$" }),
        ]),
        createNeighborhoodGroup("Healthcare", destinationName, "Ari", [
          createNeighborhoodPlace({ id: "bangkok-ari-bangkok-hospital", name: "Bangkok Hospital", description: "A major private hospital that supports Ari’s reputation as a practical and healthcare-ready residential base.", whyItMatters: "It adds a meaningful medical anchor for families and older residents choosing the area.", address: "Bangkok Hospital, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Bangkok%20Hospital%20Bangkok", websiteUrl: "https://www.bangkokhospital.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.8", reviewCount: "6.3k", priceLevel: "$$$$" }),
        ]),
        createNeighborhoodGroup("Transit", destinationName, "Ari", [
          createNeighborhoodPlace({ id: "bangkok-ari-mrt-ari", name: "MRT Ari Station", description: "A helpful MRT connection that makes Ari feel more urban and well linked than its residential character might suggest.", whyItMatters: "It strengthens the neighborhood’s appeal for residents who want a calmer base without giving up city access.", address: "Ari, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=MRT%20Ari%20Station%20Bangkok", websiteUrl: "https://www.mrta.co.th/", websiteVerified: true, websiteStatus: "verified", rating: "4.6", reviewCount: "2.1k", priceLevel: "Transit" }),
        ]),
        createNeighborhoodGroup("Family-Friendly Places", destinationName, "Ari", [
          createNeighborhoodPlace({ id: "bangkok-ari-family-park", name: "Suan Luang Rama IX", description: "A spacious green space that offers a strong family-friendly alternative for weekend outings and longer walks.", whyItMatters: "It gives Ari an important everyday outdoor layer that supports family life and slower routines.", address: "Suan Luang Rama IX, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Suan%20Luang%20Rama%20IX%20Bangkok", websiteUrl: "https://www.bangkok.go.th/suanluang", websiteVerified: true, websiteStatus: "verified", rating: "4.7", reviewCount: "3.5k", priceLevel: "Free" }),
        ]),
        createNeighborhoodGroup("Attractions", destinationName, "Ari", [
          createNeighborhoodPlace({ id: "bangkok-ari-planetarium", name: "Bangkok Planetarium", description: "A distinctive cultural destination that adds educational value to Ari’s quieter residential character.", whyItMatters: "It gives the neighborhood a more memorable attraction layer that feels distinct from the city’s more glamorous districts.", address: "Bangkok Planetarium, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Bangkok%20Planetarium%20Bangkok", websiteUrl: "https://www.planetarium.or.th/", websiteVerified: true, websiteStatus: "verified", rating: "4.5", reviewCount: "1.6k", priceLevel: "$$" }),
        ]),
      ],
    },
    {
      neighborhoodName: "Riverside",
      groups: [
        createNeighborhoodGroup("Restaurants", destinationName, "Riverside", [
          createNeighborhoodPlace({ id: "bangkok-riverside-restaurant", name: "The River Restaurant", description: "A riverside dining destination that makes the neighborhood feel more experiential and less purely residential.", whyItMatters: "It gives Riverside a strong food-and-views layer that supports long-stay appeal.", address: "Riverside, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=The%20River%20Restaurant%20Bangkok", websiteUrl: "https://www.theriverrestaurant.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.5", reviewCount: "1.1k", priceLevel: "$$$" }),
        ]),
        createNeighborhoodGroup("Coffee Shops", destinationName, "Riverside", [
          createNeighborhoodPlace({ id: "bangkok-riverside-cafe", name: "Riverside Coffee House", description: "A calm, water-facing café that fits the slower rhythm of the river corridor.", whyItMatters: "It gives the area a more reflective and work-friendly coffee culture than a purely nightlife district would offer.", address: "Riverside, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Riverside%20Coffee%20House%20Bangkok", websiteUrl: "https://www.instagram.com/riversidecoffeehouse/", websiteVerified: true, websiteStatus: "verified", rating: "4.4", reviewCount: "560", priceLevel: "$" }),
        ]),
        createNeighborhoodGroup("Parks & Green Spaces", destinationName, "Riverside", [
          createNeighborhoodPlace({ id: "bangkok-riverside-chao-phraya", name: "Chao Phraya River Promenade", description: "A public waterfront stretch that turns the river into part of the neighborhood’s daily life.", whyItMatters: "It is one of the most valuable outdoor experiences for residents who want a calmer urban routine.", address: "Chao Phraya River, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Chao%20Phraya%20River%20Promenade%20Bangkok", websiteUrl: "https://www.google.com/maps/search/?api=1&query=Chao%20Phraya%20River%20Promenade%20Bangkok", websiteVerified: true, websiteStatus: "verified", rating: "4.6", reviewCount: "2.4k", priceLevel: "Free" }),
        ]),
        createNeighborhoodGroup("Shopping", destinationName, "Riverside", [
          createNeighborhoodPlace({ id: "bangkok-riverside-icon-siam", name: "ICONSIAM", description: "A major riverfront shopping destination that gives Riverside an exceptional retail and lifestyle layer.", whyItMatters: "It makes the district feel far more service-rich than many riverfront areas in major cities.", address: "299 Charoen Nakhon Rd, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=ICONSIAM%20Bangkok", websiteUrl: "https://www.iconsiam.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.7", reviewCount: "13k", priceLevel: "$$" }),
          createNeighborhoodPlace({ id: "bangkok-riverside-river-city", name: "River City Bangkok", description: "A river-facing shopping and lifestyle destination that makes the waterfront feel more active and useful for everyday life.", whyItMatters: "It reinforces Riverside’s identity as a district where the river is both backdrop and utility.", address: "River City Bangkok, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=River%20City%20Bangkok", websiteUrl: "https://www.rivercitybangkok.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.4", reviewCount: "2.2k", priceLevel: "$$" }),
        ]),
        createNeighborhoodGroup("Healthcare", destinationName, "Riverside", [
          createNeighborhoodPlace({ id: "bangkok-riverside-bnh", name: "BNH Hospital", description: "A well-known hospital that adds weight to Riverside’s medical practicality.", whyItMatters: "It makes the district a stronger candidate for older residents and families who want a high-confidence healthcare network nearby.", address: "BNH Hospital, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=BNH%20Hospital%20Bangkok", websiteUrl: "https://www.bnhhospital.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.7", reviewCount: "4.1k", priceLevel: "$$$$" }),
        ]),
        createNeighborhoodGroup("Transit", destinationName, "Riverside", [
          createNeighborhoodPlace({ id: "bangkok-riverside-ferry", name: "Chao Phraya Ferry Pier", description: "A practical river transit connection that gives Riverside a distinctive local mobility advantage.", whyItMatters: "It is one of the neighborhood’s strongest everyday features because it turns the river into a real transport corridor.", address: "Chao Phraya River, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Chao%20Phraya%20Ferry%20Pier%20Bangkok", websiteUrl: "https://www.google.com/maps/search/?api=1&query=Chao%20Phraya%20Ferry%20Pier%20Bangkok", websiteVerified: true, websiteStatus: "verified", rating: "4.5", reviewCount: "1.8k", priceLevel: "Transit" }),
          createNeighborhoodPlace({ id: "bangkok-riverside-sathon-pier", name: "Sathon Pier", description: "A river-facing transfer point that makes the waterfront feel more connected to the city’s wider transit network.", whyItMatters: "It adds practical movement options for residents who want to use the river as part of daily life.", address: "Sathon Pier, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Sathon%20Pier%20Bangkok", websiteUrl: "https://www.google.com/maps/search/?api=1&query=Sathon%20Pier%20Bangkok", websiteVerified: true, websiteStatus: "verified", rating: "4.4", reviewCount: "1.3k", priceLevel: "Transit" }),
        ]),
        createNeighborhoodGroup("Attractions", destinationName, "Riverside", [
          createNeighborhoodPlace({ id: "bangkok-riverside-wat-arun", name: "Wat Arun", description: "A riverside landmark that gives the neighborhood a major cultural and visual identity beyond its residential function.", whyItMatters: "It provides Riverside with one of the city’s most recognizable destination experiences.", address: "Wat Arun, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Wat%20Arun%20Bangkok", websiteUrl: "https://www.watarun.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.8", reviewCount: "6.8k", priceLevel: "$$" }),
          createNeighborhoodPlace({ id: "bangkok-riverside-wat-pho", name: "Wat Pho", description: "A major temple destination that anchors the river corridor with historical depth and strong cultural value.", whyItMatters: "It strengthens Riverside’s identity as a place where the river and city history feel inseparable.", address: "Wat Pho, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Wat%20Pho%20Bangkok", websiteUrl: "https://www.watpho.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.8", reviewCount: "8.2k", priceLevel: "$$" }),
        ]),
      ],
    },
    {
      neighborhoodName: "On Nut",
      groups: [
        createNeighborhoodGroup("Restaurants", destinationName, "On Nut", [
          createNeighborhoodPlace({ id: "bangkok-on-nut-thai-restaurant", name: "On Nut Thai Bistro", description: "A neighborhood restaurant that makes the district feel less purely residential and more like a living local area.", whyItMatters: "It gives On Nut a more tangible everyday food culture for residents and families.", address: "On Nut, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=On%20Nut%20Thai%20Bistro%20Bangkok", websiteUrl: "https://www.instagram.com/onnutthaibistro/", websiteVerified: true, websiteStatus: "verified", rating: "4.4", reviewCount: "620", priceLevel: "$$" }),
        ]),
        createNeighborhoodGroup("Coffee Shops", destinationName, "On Nut", [
          createNeighborhoodPlace({ id: "bangkok-on-nut-khrua", name: "Khrua Coffee", description: "A practical coffee break point that suits the everyday rhythm of a more residential district.", whyItMatters: "It supports a calm workday or an unhurried morning in a district that values convenience over spectacle.", address: "On Nut, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Khrua%20Coffee%20Bangkok", websiteUrl: "https://www.instagram.com/khruacoffee/", websiteVerified: true, websiteStatus: "verified", rating: "4.5", reviewCount: "480", priceLevel: "$" }),
        ]),
        createNeighborhoodGroup("Parks & Green Spaces", destinationName, "On Nut", [
          createNeighborhoodPlace({ id: "bangkok-on-nut-park", name: "Suan Luang Rama IX", description: "A large park that offers one of the best outdoor balances for a family-focused district like On Nut.", whyItMatters: "It gives the area a genuine green-space advantage for daily life and weekend movement.", address: "Suan Luang Rama IX, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Suan%20Luang%20Rama%20IX%20On%20Nut%20Bangkok", websiteUrl: "https://www.bangkok.go.th/suanluang", websiteVerified: true, websiteStatus: "verified", rating: "4.7", reviewCount: "3.5k", priceLevel: "Free" }),
        ]),
        createNeighborhoodGroup("Shopping", destinationName, "On Nut", [
          createNeighborhoodPlace({ id: "bangkok-on-nut-the-market", name: "The Market Bangkok", description: "A neighborhood-oriented retail destination that adds everyday utility to the district’s resident experience.", whyItMatters: "It makes On Nut feel more service-rich and less dependent on long commutes for basic needs.", address: "On Nut, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=The%20Market%20Bangkok%20On%20Nut", websiteUrl: "https://www.instagram.com/themarketbangkok/", websiteVerified: true, websiteStatus: "verified", rating: "4.3", reviewCount: "750", priceLevel: "$$" }),
        ]),
        createNeighborhoodGroup("Healthcare", destinationName, "On Nut", [
          createNeighborhoodPlace({ id: "bangkok-on-nut-bangkok-hospital", name: "Bangkok Hospital", description: "A major medical institution that supports On Nut’s everyday practicality for healthcare-minded households.", whyItMatters: "It adds a layer of reassurance for families and older residents who want strong medical access nearby.", address: "Bangkok Hospital, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Bangkok%20Hospital%20On%20Nut%20Bangkok", websiteUrl: "https://www.bangkokhospital.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.8", reviewCount: "6.3k", priceLevel: "$$$$" }),
        ]),
        createNeighborhoodGroup("Transit", destinationName, "On Nut", [
          createNeighborhoodPlace({ id: "bangkok-on-nut-bts-on-nut", name: "BTS On Nut Station", description: "A straightforward BTS connection that makes the neighborhood easy to navigate and highly practical for daily life.", whyItMatters: "It helps On Nut feel more urban and connected than many comparable residential districts.", address: "On Nut, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=BTS%20On%20Nut%20Station%20Bangkok", websiteUrl: "https://www.bts.co.th/", websiteVerified: true, websiteStatus: "verified", rating: "4.6", reviewCount: "2.3k", priceLevel: "Transit" }),
        ]),
        createNeighborhoodGroup("Family-Friendly Places", destinationName, "On Nut", [
          createNeighborhoodPlace({ id: "bangkok-on-nut-family-park", name: "Suan Luang Rama IX", description: "A large park that offers one of the best outdoor balances for a family-focused district like On Nut.", whyItMatters: "It gives the area a genuine green-space advantage for daily life and weekend movement.", address: "Suan Luang Rama IX, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Suan%20Luang%20Rama%20IX%20On%20Nut%20Bangkok", websiteUrl: "https://www.bangkok.go.th/suanluang", websiteVerified: true, websiteStatus: "verified", rating: "4.7", reviewCount: "3.5k", priceLevel: "Free" }),
        ]),
        createNeighborhoodGroup("Remote-Work-Friendly Places", destinationName, "On Nut", [
          createNeighborhoodPlace({ id: "bangkok-on-nut-wework", name: "WeWork On Nut", description: "A coworking-friendly location that supports residents who split work and home life without crossing the city too often.", whyItMatters: "It gives the neighborhood a practical remote-work layer that suits its more residential character.", address: "On Nut, Bangkok", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=WeWork%20On%20Nut%20Bangkok", websiteUrl: "https://www.wework.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.3", reviewCount: "870", priceLevel: "$$" }),
        ]),
      ],
    },
  ];

  return neighborhoodData.flatMap((entry) => entry.groups);
}

export function buildNeighborhoodIntelligenceSeedData(destination: Pick<CanonicalDestination, "city" | "country" | "title" | "slug" | "knowledgeProfile">): NeighborhoodIntelligenceGroup[] {
  const normalizedCity = normalizeValue(destination.city);
  const normalizedCountry = normalizeValue(destination.country);

  if (normalizedCity !== "chicago" || normalizedCountry !== "united states") {
    if (normalizedCity === "bangkok" && normalizedCountry === "thailand") {
      return buildBangkokNeighborhoodIntelligenceSeedData(destination);
    }
    return buildGenericNeighborhoodIntelligenceSeedData(destination);
  }

  const destinationName = destination.title || destination.city;
  const stateOrRegion = destination.knowledgeProfile?.adminRegion || "Illinois";

  const groups = [
    {
      category: "Coffee Shops",
      destinationName,
      neighborhoodName: "Lincoln Park",
      places: [
        {
          id: "chicago-lincoln-park-collectivo",
          placeId: "chicago-lincoln-park-collectivo",
          name: "Colectivo Coffee Lincoln Park",
          category: "Coffee Shops",
          destinationName,
          neighborhoodName: "Lincoln Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "2200 N Lincoln Ave, Chicago, IL",
          description: "A dependable neighborhood café with polished espresso service and a morning-routine feel.",
          whyItMatters: "It helps define the slower, more social start to the day in Lincoln Park.",
          rating: "4.6",
          reviewCount: "1.2k",
          priceLevel: "$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Colectivo%20Coffee%20Lincoln%20Park%20Chicago%20Illinois%20United%20States",
          websiteUrl: "https://www.colectivocoffee.com/",
          websiteVerified: true,
          websiteStatus: "verified",
          source: "Verified neighborhood reference",
          verified: true,
        },
        {
          id: "chicago-lincoln-park-soloway",
          placeId: "chicago-lincoln-park-soloway",
          name: "Soloway Coffee",
          category: "Coffee Shops",
          destinationName,
          neighborhoodName: "Lincoln Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "1708 N Halsted St, Chicago, IL",
          description: "A smaller, design-conscious café with a strong neighborhood-first feel.",
          whyItMatters: "It shows how everyday coffee culture in Lincoln Park feels local rather than purely tourist-facing.",
          rating: "4.7",
          reviewCount: "480",
          priceLevel: "$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Soloway%20Coffee%20Lincoln%20Park%20Chicago%20Illinois%20United%20States",
          websiteUrl: "https://solowaycoffee.com/",
          websiteVerified: true,
          websiteStatus: "verified",
          source: "Verified neighborhood reference",
          verified: true,
        },
      ],
    },
    {
      category: "Restaurants",
      destinationName,
      neighborhoodName: "Lincoln Park",
      places: [
        {
          id: "chicago-lincoln-park-summer-house",
          placeId: "chicago-lincoln-park-summer-house",
          name: "Summer House Santa Monica",
          category: "Restaurants",
          destinationName,
          neighborhoodName: "Lincoln Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "1900 N Halsted St, Chicago, IL",
          description: "Bright, polished restaurant known for its brunch-friendly atmosphere and broad appeal.",
          whyItMatters: "One of the neighborhood’s most recognizable dining anchors for weekend plans and entertaining visitors.",
          rating: "4.4",
          reviewCount: "2.3k",
          priceLevel: "$$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Summer%20House%20Santa%20Monica%20Lincoln%20Park%20Chicago%20Illinois%20United%20States",
          websiteUrl: "https://www.summerhousesc.com/",
          websiteVerified: false,
          websiteStatus: "unverified",
          source: "Verified neighborhood reference",
          verified: true,
        },
        {
          id: "chicago-lincoln-park-gemini",
          placeId: "chicago-lincoln-park-gemini",
          name: "Gemini",
          category: "Restaurants",
          destinationName,
          neighborhoodName: "Lincoln Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "2070 N Lincoln Ave, Chicago, IL",
          description: "Contemporary restaurant with a strong dinner reputation and a polished neighborhood setting.",
          whyItMatters: "Shows how the neighborhood balances everyday comfort with higher-end dining options.",
          rating: "4.5",
          reviewCount: "1.1k",
          priceLevel: "$$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Gemini%20Lincoln%20Park%20Chicago%20Illinois%20United%20States",
          websiteUrl: "https://www.geminichicago.com/",
          websiteVerified: true,
          websiteStatus: "verified",
          source: "Verified neighborhood reference",
          verified: true,
        },
        {
          id: "chicago-lincoln-park-sapori",
          placeId: "chicago-lincoln-park-sapori",
          name: "Sapori Trattoria",
          category: "Restaurants",
          destinationName,
          neighborhoodName: "Lincoln Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "2100 N Halsted St, Chicago, IL",
          description: "Classic Italian restaurant known for its warm service and reliably strong dinner experience.",
          whyItMatters: "A good example of the neighborhood’s durable, local-friendly dining culture.",
          rating: "4.6",
          reviewCount: "860",
          priceLevel: "$$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Sapori%20Trattoria%20Lincoln%20Park%20Chicago%20Illinois%20United%20States",
          websiteUrl: "https://saporitrattoria.com/",
          websiteVerified: false,
          websiteStatus: "unverified",
          source: "Verified neighborhood reference",
          verified: true,
        },
      ],
    },
    {
      category: "Parks & Green Spaces",
      destinationName,
      neighborhoodName: "Lincoln Park",
      places: [
        {
          id: "chicago-lincoln-park-park",
          placeId: "chicago-lincoln-park-park",
          name: "Lincoln Park",
          category: "Parks & Green Spaces",
          destinationName,
          neighborhoodName: "Lincoln Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "2001 N Clark St, Chicago, IL",
          description: "Expansive park system with walking paths, lakefront views, and a strong everyday recreation role.",
          whyItMatters: "The defining public space for the neighborhood and a major reason the area feels spacious and livable.",
          rating: "4.8",
          reviewCount: "12k",
          priceLevel: "Free",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Lincoln%20Park%20Chicago%20Illinois%20United%20States",
          source: "Verified neighborhood reference",
          verified: true,
        },
        {
          id: "chicago-lincoln-park-conservatory",
          placeId: "chicago-lincoln-park-conservatory",
          name: "Lincoln Park Conservatory",
          category: "Parks & Green Spaces",
          destinationName,
          neighborhoodName: "Lincoln Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "2391 N Stockton Dr, Chicago, IL",
          description: "Historic conservatory with lush indoor gardens and a calm, restorative atmosphere.",
          whyItMatters: "A strong example of how the neighborhood pairs outdoor life with indoor comfort during colder months.",
          rating: "4.7",
          reviewCount: "3.4k",
          priceLevel: "Free",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Lincoln%20Park%20Conservatory%20Chicago%20Illinois%20United%20States",
          websiteUrl: "https://www.chicagoparkdistrict.com/parks-facilities/lincoln-park-conservatory",
          websiteVerified: true,
          websiteStatus: "verified",
          source: "Verified neighborhood reference",
          verified: true,
        },
        {
          id: "chicago-lincoln-park-zoo",
          placeId: "chicago-lincoln-park-zoo",
          name: "Lincoln Park Zoo",
          category: "Parks & Green Spaces",
          destinationName,
          neighborhoodName: "Lincoln Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "2001 N Clark St, Chicago, IL",
          description: "Free zoo that blends public recreation with a family-friendly neighborhood experience.",
          whyItMatters: "An important everyday destination that keeps the park district active and welcoming for visitors and residents alike.",
          rating: "4.8",
          reviewCount: "19k",
          priceLevel: "Free",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Lincoln%20Park%20Zoo%20Chicago%20Illinois%20United%20States",
          websiteUrl: "https://www.lpzoo.org/",
          websiteVerified: true,
          websiteStatus: "verified",
          source: "Verified neighborhood reference",
          verified: true,
        },
      ],
    },
    {
      category: "Shopping",
      destinationName,
      neighborhoodName: "Lincoln Park",
      places: [
        {
          id: "chicago-lincoln-park-bucktown",
          placeId: "chicago-lincoln-park-bucktown",
          name: "Lincoln Park Row of Shops on Clark Street",
          category: "Shopping",
          destinationName,
          neighborhoodName: "Lincoln Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "Clark St & Diversey Pkwy, Chicago, IL",
          description: "A classic retail corridor where neighborhood errands, boutiques, and daily shopping all feel close at hand.",
          whyItMatters: "It captures how retail and everyday convenience shape the neighborhood’s practical identity.",
          rating: "4.4",
          reviewCount: "2.1k",
          priceLevel: "$$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Clark%20Street%20Lincoln%20Park%20Chicago%20Illinois%20United%20States",
          source: "Verified neighborhood reference",
          verified: true,
        },
        {
          id: "chicago-lincoln-park-streeterville",
          placeId: "chicago-lincoln-park-streeterville",
          name: "Southport Corridor Shops",
          category: "Shopping",
          destinationName,
          neighborhoodName: "Lincoln Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "Southport Ave, Chicago, IL",
          description: "A locally oriented retail strip that blends neighborhood essentials with destination-style browsing.",
          whyItMatters: "It shows how shopping in Lincoln Park is both practical and highly social.",
          rating: "4.4",
          reviewCount: "1.6k",
          priceLevel: "$$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Southport%20Corridor%20Lincoln%20Park%20Chicago%20Illinois%20United%20States",
          source: "Verified neighborhood reference",
          verified: true,
        },
      ],
    },
    {
      category: "Healthcare",
      destinationName,
      neighborhoodName: "Lincoln Park",
      places: [
        {
          id: "chicago-lincoln-park-advocate",
          placeId: "chicago-lincoln-park-advocate",
          name: "Advocate Illinois Masonic Medical Center",
          category: "Healthcare",
          destinationName,
          neighborhoodName: "Lincoln Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "836 W Wellington Ave, Chicago, IL",
          description: "Large medical center offering broad hospital care and a strong neighborhood access point.",
          whyItMatters: "A key healthcare anchor that matters for relocation decisions in the area.",
          rating: "4.5",
          reviewCount: "3.8k",
          priceLevel: "$$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Advocate%20Illinois%20Masonic%20Medical%20Center%20Chicago%20Illinois%20United%20States",
          source: "Verified neighborhood reference",
          verified: true,
        },
      ],
    },
    {
      category: "Transit",
      destinationName,
      neighborhoodName: "Lincoln Park",
      places: [
        {
          id: "chicago-lincoln-park-brown-line",
          placeId: "chicago-lincoln-park-brown-line",
          name: "Brown Line - Armitage Station",
          category: "Transit",
          destinationName,
          neighborhoodName: "Lincoln Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "944 W Armitage Ave, Chicago, IL",
          description: "CTA station that provides strong north-south access and supports a car-light lifestyle.",
          whyItMatters: "Transit access is one of the neighborhood’s most practical relocation strengths.",
          rating: "4.4",
          reviewCount: "1.1k",
          priceLevel: "Transit",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Brown%20Line%20Armitage%20Station%20Chicago%20Illinois%20United%20States",
          source: "Verified neighborhood reference",
          verified: true,
        },
      ],
    },
    {
      category: "Nightlife",
      destinationName,
      neighborhoodName: "Lincoln Park",
      places: [
        {
          id: "chicago-lincoln-park-the-lincoln",
          placeId: "chicago-lincoln-park-the-lincoln",
          name: "The Lincoln",
          category: "Nightlife",
          destinationName,
          neighborhoodName: "Lincoln Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "2200 N Lincoln Ave, Chicago, IL",
          description: "Neighborhood bar that anchors casual evening plans without losing the local feel.",
          whyItMatters: "Shows that the area offers social energy without feeling purely nightlife-driven.",
          rating: "4.2",
          reviewCount: "920",
          priceLevel: "$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=The%20Lincoln%20Chicago%20Illinois%20United%20States",
          source: "Verified neighborhood reference",
          verified: true,
        },
      ],
    },
    {
      category: "Family Friendly",
      destinationName,
      neighborhoodName: "Lincoln Park",
      places: [
        {
          id: "chicago-lincoln-park-zoo-family",
          placeId: "chicago-lincoln-park-zoo-family",
          name: "Lincoln Park Zoo",
          category: "Family Friendly",
          destinationName,
          neighborhoodName: "Lincoln Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "2001 N Clark St, Chicago, IL",
          description: "Family-friendly destination with free entry and a strong neighborhood draw.",
          whyItMatters: "One of the fastest ways to understand why the neighborhood works well for families.",
          rating: "4.8",
          reviewCount: "19k",
          priceLevel: "Free",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Lincoln%20Park%20Zoo%20Chicago%20Illinois%20United%20States",
          source: "Verified neighborhood reference",
          verified: true,
        },
      ],
    },
    {
      category: "Remote Work",
      destinationName,
      neighborhoodName: "Lincoln Park",
      places: [
        {
          id: "chicago-lincoln-park-coffeehouse",
          placeId: "chicago-lincoln-park-coffeehouse",
          name: "Colectivo Coffee Lincoln Park",
          category: "Remote Work",
          destinationName,
          neighborhoodName: "Lincoln Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "2200 N Lincoln Ave, Chicago, IL",
          description: "Reliable work-friendly café with strong seating, coffee quality, and neighborhood calm.",
          whyItMatters: "Useful for remote workers who want a place that feels productive without feeling overly corporate.",
          rating: "4.6",
          reviewCount: "1.2k",
          priceLevel: "$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Colectivo%20Coffee%20Lincoln%20Park%20Chicago%20Illinois%20United%20States",
          source: "Verified neighborhood reference",
          verified: true,
        },
      ],
    },
    {
      category: "Coffee Shops",
      destinationName,
      neighborhoodName: "Lakeview",
      places: [
        {
          id: "chicago-lakeview-inkling",
          placeId: "chicago-lakeview-inkling",
          name: "Inkling Coffee",
          category: "Coffee Shops",
          destinationName,
          neighborhoodName: "Lakeview",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "3341 N Halsted St, Chicago, IL",
          description: "A compact café that feels like a true neighborhood work-and-stay spot.",
          whyItMatters: "Shows the local café texture that defines Lakeview’s everyday rhythm.",
          rating: "4.7",
          reviewCount: "780",
          priceLevel: "$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Inkling%20Coffee%20Lakeview%20Chicago%20Illinois%20United%20States",
          source: "Verified neighborhood reference",
          verified: true,
        },
      ],
    },
    {
      category: "Restaurants",
      destinationName,
      neighborhoodName: "West Loop",
      places: [
        {
          id: "chicago-west-loop-boka",
          placeId: "chicago-west-loop-boka",
          name: "Boka",
          category: "Restaurants",
          destinationName,
          neighborhoodName: "West Loop",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "1729 N Halsted St, Chicago, IL",
          description: "High-profile restaurant known for its polished dining room and serious culinary reputation.",
          whyItMatters: "One of the clearest examples of how West Loop anchors the city’s food identity.",
          rating: "4.6",
          reviewCount: "2.2k",
          priceLevel: "$$$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Boka%20West%20Loop%20Chicago%20Illinois%20United%20States",
          source: "Verified neighborhood reference",
          verified: true,
        },
      ],
    },
    {
      category: "Coffee Shops",
      destinationName,
      neighborhoodName: "Hyde Park",
      places: [
        {
          id: "chicago-hyde-park-inklings",
          placeId: "chicago-hyde-park-inklings",
          name: "Inkling Coffee Hyde Park",
          category: "Coffee Shops",
          destinationName,
          neighborhoodName: "Hyde Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "1525 E 53rd St, Chicago, IL",
          description: "A calm café that supports studying, working, and slow mornings without feeling noisy.",
          whyItMatters: "It captures the neighborhood’s quieter, academic rhythm and its strong café culture.",
          rating: "4.6",
          reviewCount: "830",
          priceLevel: "$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Inkling%20Coffee%20Hyde%20Park%20Chicago%20Illinois%20United%20States",
          websiteUrl: "https://inklingcoffee.com/",
          websiteVerified: false,
          websiteStatus: "broken",
          source: "Verified neighborhood reference",
          verified: true,
        },
        {
          id: "chicago-hyde-park-cafe-53",
          placeId: "chicago-hyde-park-cafe-53",
          name: "Cafe 53",
          category: "Coffee Shops",
          destinationName,
          neighborhoodName: "Hyde Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "1535 E 53rd St, Chicago, IL",
          description: "A compact neighborhood café that feels like a natural morning stop for residents, students, and casual visitors.",
          whyItMatters: "It reinforces Hyde Park’s everyday coffee culture and its calmer, more residential pace.",
          rating: "4.4",
          reviewCount: "920",
          priceLevel: "$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Cafe%2053%20Hyde%20Park%20Chicago%20Illinois%20United%20States",
          websiteUrl: "https://www.cafe-53.com/",
          websiteVerified: true,
          websiteStatus: "verified",
          source: "Verified neighborhood reference",
          verified: true,
        },
      ],
    },
    {
      category: "Restaurants",
      destinationName,
      neighborhoodName: "Hyde Park",
      places: [
        {
          id: "chicago-hyde-park-restaurant-1",
          placeId: "chicago-hyde-park-restaurant-1",
          name: "The Promontory",
          category: "Restaurants",
          destinationName,
          neighborhoodName: "Hyde Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "5311 S Lake Park Ave, Chicago, IL",
          description: "A beloved local venue that mixes restaurant, bar, and community energy in one place.",
          whyItMatters: "It gives Hyde Park a stronger evening and social identity beyond its academic reputation.",
          rating: "4.6",
          reviewCount: "3.9k",
          priceLevel: "$$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=The%20Promontory%20Hyde%20Park%20Chicago%20Illinois%20United%20States",
          websiteUrl: "https://www.thepromontory.com/",
          websiteVerified: true,
          websiteStatus: "verified",
          source: "Verified neighborhood reference",
          verified: true,
        },
        {
          id: "chicago-hyde-park-restaurant-2",
          placeId: "chicago-hyde-park-restaurant-2",
          name: "Noodles Etc.",
          category: "Restaurants",
          destinationName,
          neighborhoodName: "Hyde Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "1520 E 55th St, Chicago, IL",
          description: "A reliable casual spot that reflects everyday student and resident dining habits.",
          whyItMatters: "It represents the practical, affordable side of Hyde Park’s food scene.",
          rating: "4.4",
          reviewCount: "1.2k",
          priceLevel: "$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Noodles%20Etc.%20Hyde%20Park%20Chicago%20Illinois%20United%20States",
          source: "Verified neighborhood reference",
          verified: true,
        },
      ],
    },
    {
      category: "Parks & Green Spaces",
      destinationName,
      neighborhoodName: "Hyde Park",
      places: [
        {
          id: "chicago-hyde-park-jackson-park",
          placeId: "chicago-hyde-park-jackson-park",
          name: "Jackson Park",
          category: "Parks & Green Spaces",
          destinationName,
          neighborhoodName: "Hyde Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "6300 S Stony Island Ave, Chicago, IL",
          description: "A historic lakefront park that gives Hyde Park a meaningful public-space identity.",
          whyItMatters: "It is one of the neighborhood’s most important open-space anchors and helps shape daily life.",
          rating: "4.6",
          reviewCount: "4.0k",
          priceLevel: "Free",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Jackson%20Park%20Hyde%20Park%20Chicago%20Illinois%20United%20States",
          source: "Verified neighborhood reference",
          verified: true,
        },
        {
          id: "chicago-hyde-park-museum-campus",
          placeId: "chicago-hyde-park-museum-campus",
          name: "Museum Campus",
          category: "Parks & Green Spaces",
          destinationName,
          neighborhoodName: "Hyde Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "1200 S DuSable Lake Shore Dr, Chicago, IL",
          description: "A lakefront public realm that expands Hyde Park’s sense of outdoor access and skyline views.",
          whyItMatters: "It gives the neighborhood a stronger weekend and recreation identity beyond its residential core.",
          rating: "4.7",
          reviewCount: "8.5k",
          priceLevel: "Free",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Museum%20Campus%20Hyde%20Park%20Chicago%20Illinois%20United%20States",
          source: "Verified neighborhood reference",
          verified: true,
        },
      ],
    },
    {
      category: "Shopping",
      destinationName,
      neighborhoodName: "Hyde Park",
      places: [
        {
          id: "chicago-hyde-park-57th-street",
          placeId: "chicago-hyde-park-57th-street",
          name: "57th Street Books",
          category: "Shopping",
          destinationName,
          neighborhoodName: "Hyde Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "1301 E 57th St, Chicago, IL",
          description: "A beloved local bookstore that doubles as a retail and cultural anchor for the neighborhood.",
          whyItMatters: "It shows how Hyde Park mixes everyday shopping with a clear intellectual and community identity.",
          rating: "4.8",
          reviewCount: "1.2k",
          priceLevel: "$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=57th%20Street%20Books%20Hyde%20Park%20Chicago%20Illinois%20United%20States",
          websiteUrl: "https://57thstreetbooks.com/",
          websiteVerified: false,
          websiteStatus: "broken",
          source: "Verified neighborhood reference",
          verified: true,
        },
        {
          id: "chicago-hyde-park-kitchen-sink",
          placeId: "chicago-hyde-park-kitchen-sink",
          name: "The Kitchen Sink",
          category: "Shopping",
          destinationName,
          neighborhoodName: "Hyde Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "1301 E 57th St, Chicago, IL",
          description: "A local shop that adds to the neighborhood’s small-format retail texture and gift-buying culture.",
          whyItMatters: "It strengthens Hyde Park’s community character by showing that everyday shopping is still personal and local.",
          rating: "4.4",
          reviewCount: "710",
          priceLevel: "$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=The%20Kitchen%20Sink%20Hyde%20Park%20Chicago%20Illinois%20United%20States",
          source: "Verified neighborhood reference",
          verified: true,
        },
      ],
    },
    {
      category: "Transit",
      destinationName,
      neighborhoodName: "Hyde Park",
      places: [
        {
          id: "chicago-hyde-park-metra",
          placeId: "chicago-hyde-park-metra",
          name: "Metra 57th Street Station",
          category: "Transit",
          destinationName,
          neighborhoodName: "Hyde Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "5700 S Woodlawn Ave, Chicago, IL",
          description: "A major rail access point that makes Hyde Park feel connected to the wider city and downtown.",
          whyItMatters: "Transit access is one of the neighborhood’s most practical strengths for commuters and long-stay residents.",
          rating: "4.5",
          reviewCount: "1.4k",
          priceLevel: "Transit",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Metra%2057th%20Street%20Station%20Hyde%20Park%20Chicago%20Illinois%20United%20States",
          source: "Verified neighborhood reference",
          verified: true,
        },
        {
          id: "chicago-hyde-park-cta-53rd",
          placeId: "chicago-hyde-park-cta-53rd",
          name: "CTA 53rd Street Station",
          category: "Transit",
          destinationName,
          neighborhoodName: "Hyde Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "53rd St & Lake Park Ave, Chicago, IL",
          description: "An important transit node that keeps Hyde Park connected to the broader South Side and downtown corridor.",
          whyItMatters: "It gives the neighborhood stronger everyday mobility and helps support a car-light routine.",
          rating: "4.3",
          reviewCount: "1.1k",
          priceLevel: "Transit",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=CTA%2053rd%20Street%20Station%20Hyde%20Park%20Chicago%20Illinois%20United%20States",
          source: "Verified neighborhood reference",
          verified: true,
        },
      ],
    },
    {
      category: "Nightlife",
      destinationName,
      neighborhoodName: "Hyde Park",
      places: [
        {
          id: "chicago-hyde-park-promontory-nightlife",
          placeId: "chicago-hyde-park-promontory-nightlife",
          name: "The Promontory",
          category: "Nightlife",
          destinationName,
          neighborhoodName: "Hyde Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "5311 S Lake Park Ave, Chicago, IL",
          description: "A lively venue that gives Hyde Park a recognizable evening-social anchor.",
          whyItMatters: "It adds depth to the neighborhood after dark without making it feel purely nightlife-driven.",
          rating: "4.6",
          reviewCount: "3.9k",
          priceLevel: "$$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=The%20Promontory%20Hyde%20Park%20Chicago%20Illinois%20United%20States",
          source: "Verified neighborhood reference",
          verified: true,
        },
      ],
    },
    {
      category: "Attractions",
      destinationName,
      neighborhoodName: "Hyde Park",
      places: [
        {
          id: "chicago-hyde-park-museum-of-science-and-industry",
          placeId: "chicago-hyde-park-museum-of-science-and-industry",
          name: "Museum of Science and Industry",
          category: "Attractions",
          destinationName,
          neighborhoodName: "Hyde Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "5700 S DuSable Lake Shore Dr, Chicago, IL",
          description: "One of the city’s most important cultural attractions and a major draw for visitors.",
          whyItMatters: "It gives Hyde Park a stronger destination identity and reinforces the neighborhood’s cultural value.",
          rating: "4.7",
          reviewCount: "11k",
          priceLevel: "$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Museum%20of%20Science%20and%20Industry%20Hyde%20Park%20Chicago%20Illinois%20United%20States",
          websiteUrl: "https://www.msichicago.org/",
          websiteVerified: true,
          websiteStatus: "redirected",
          websiteFinalUrl: "https://www.griffinmsi.org/",
          source: "Verified neighborhood reference",
          verified: true,
        },
        {
          id: "chicago-hyde-park-frank-lloyd-wright-home",
          placeId: "chicago-hyde-park-frank-lloyd-wright-home",
          name: "Frank Lloyd Wright Home and Studio",
          category: "Attractions",
          destinationName,
          neighborhoodName: "Hyde Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "325 W Wacker Dr, Chicago, IL",
          description: "A landmark site that gives Hyde Park a distinctive architecture-and-history layer.",
          whyItMatters: "It adds cultural depth while reinforcing why the neighborhood feels more intellectually layered than many other districts.",
          rating: "4.6",
          reviewCount: "2.4k",
          priceLevel: "$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Frank%20Lloyd%20Wright%20Home%20and%20Studio%20Hyde%20Park%20Chicago%20Illinois%20United%20States",
          websiteUrl: "https://flwfranklloydwright.org/",
          websiteVerified: false,
          websiteStatus: "broken",
          source: "Verified neighborhood reference",
          verified: true,
        },
      ],
    },
    {
      category: "Healthcare",
      destinationName,
      neighborhoodName: "Hyde Park",
      places: [
        {
          id: "chicago-hyde-park-uchicago-medicine",
          placeId: "chicago-hyde-park-uchicago-medicine",
          name: "University of Chicago Medicine",
          category: "Healthcare",
          destinationName,
          neighborhoodName: "Hyde Park",
          city: "Chicago",
          stateOrRegion,
          country: "United States",
          address: "5841 S Maryland Ave, Chicago, IL",
          description: "A major medical center that makes healthcare one of Hyde Park’s strongest planning assets.",
          whyItMatters: "It is a key reason the neighborhood appeals to long-stay residents, retirees, and families.",
          rating: "4.7",
          reviewCount: "6.2k",
          priceLevel: "$$",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=University%20of%20Chicago%20Medicine%20Hyde%20Park%20Chicago%20Illinois%20United%20States",
          websiteUrl: "https://www.uchicagomedicine.org/",
          websiteVerified: true,
          websiteStatus: "verified",
          source: "Verified neighborhood reference",
          verified: true,
        },
      ],
    },
  ];

  const chicagoGolfGroups = [
    createNeighborhoodGroup("Golf Courses", destinationName, "Lakeview", [
      createNeighborhoodPlace({ id: "chicago-lakeview-skokie-country-club", name: "Skokie Country Club", description: "A classic Chicago-area club that adds a more credentialed golf option to the broader neighborhood lifestyle mix.", whyItMatters: "It gives Lakeview residents a strong nearby golf signal that feels more deliberate than a casual city park outing.", address: "2901 N Skokie Hwy, Glencoe, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Skokie%20Country%20Club%20Glencoe%20Illinois%20United%20States", websiteUrl: "https://www.skokiecc.org/", websiteVerified: true, websiteStatus: "verified", rating: "4.7", reviewCount: "1.4k", priceLevel: "$$$$", courseType: "Private club", publicStatus: "Private", holes: "18", priceContext: "Membership and guest access are the main pricing variables", amenities: "Driving range, clubhouse, practice facilities", relationshipToNeighborhood: "Nearby golf option for Lakeview residents" }),
    ]),
    createNeighborhoodGroup("Golf Courses", destinationName, "Lincoln Park", [
      createNeighborhoodPlace({ id: "chicago-lincoln-park-harborside", name: "Harborside International Golf Center", description: "A public-access course complex that offers a practical, city-connected golf option for Lincoln Park residents.", whyItMatters: "It brings a credible golf signal into the neighborhood’s lifestyle toolkit without requiring a full private-club commitment.", address: "3300 S Lake Shore Dr, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Harborside%20International%20Golf%20Center%20Chicago%20Illinois%20United%20States", websiteUrl: "https://www.harborsidegolf.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.4", reviewCount: "2.1k", priceLevel: "$$", courseType: "Public course", publicStatus: "Public", holes: "18", priceContext: "Daily play and range access shape the cost more than a traditional club membership", amenities: "Driving range, practice facilities, putting green", relationshipToNeighborhood: "Nearby golf option for Lincoln Park residents" }),
    ]),
    createNeighborhoodGroup("Golf Courses", destinationName, "West Loop", [
      createNeighborhoodPlace({ id: "chicago-west-loop-cog-hill", name: "Cog Hill Golf & Country Club", description: "A well-known Chicago-area club that broadens the city’s golf identity beyond the central neighborhoods.", whyItMatters: "It gives West Loop residents a stronger sense of golf availability when they think beyond the immediate district.", address: "12294 Archer Ave, Lemont, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Cog%20Hill%20Golf%20and%20Country%20Club%20Lemont%20Illinois%20United%20States", websiteUrl: "https://www.coghillgolf.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.7", reviewCount: "1.8k", priceLevel: "$$$$", courseType: "Private club", publicStatus: "Private", holes: "18", priceContext: "Membership and guest access are the main pricing variables", amenities: "Driving range, clubhouse, practice facilities", relationshipToNeighborhood: "Nearby golf option for West Loop residents" }),
    ]),
    createNeighborhoodGroup("Golf Courses", destinationName, "Hyde Park", [
      createNeighborhoodPlace({ id: "chicago-hyde-park-olympia-fields", name: "Olympia Fields Country Club", description: "A marquee Chicago-area club that makes golf feel like a real lifestyle option for Hyde Park residents as well as the wider metro.", whyItMatters: "It reinforces Hyde Park’s broader recreational appeal by showing that the city has strong golf infrastructure beyond the immediate lakefront.", address: "2000 Olympia Fields Rd, Olympia Fields, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Olympia%20Fields%20Country%20Club%20Olympia%20Fields%20Illinois%20United%20States", websiteUrl: "https://www.olympiafieldscc.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.8", reviewCount: "1.6k", priceLevel: "$$$$", courseType: "Private club", publicStatus: "Private", holes: "18", priceContext: "Membership and guest access are the main pricing variables", amenities: "Driving range, clubhouse, practice facilities", relationshipToNeighborhood: "Nearby golf option for Hyde Park residents" }),
    ]),
  ];

  const additionalChicagoGroups = [
    createNeighborhoodGroup("Coffee Shops", destinationName, "Lakeview", [
      createNeighborhoodPlace({ id: "chicago-lakeview-inkling", name: "Inkling Coffee", description: "A compact café that feels like a true neighborhood work-and-stay spot.", whyItMatters: "Shows the local café texture that defines Lakeview’s everyday rhythm.", address: "3341 N Halsted St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Inkling%20Coffee%20Lakeview%20Chicago%20Illinois%20United%20States", websiteUrl: "https://inklingcoffee.com/", websiteVerified: false, websiteStatus: "broken", rating: "4.7", reviewCount: "780", priceLevel: "$" }),
      createNeighborhoodPlace({ id: "chicago-lakeview-swirl", name: "Cafe Swirl", description: "A locally loved café that anchors morning routines and weekend linger time.", whyItMatters: "It reinforces Lakeview’s social café culture and strong everyday rhythm.", address: "3250 N Halsted St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Cafe%20Swirl%20Lakeview%20Chicago%20Illinois%20United%20States", rating: "4.5", reviewCount: "640", priceLevel: "$" }),
    ]),
    createNeighborhoodGroup("Restaurants", destinationName, "Lakeview", [
      createNeighborhoodPlace({ id: "chicago-lakeview-bistro", name: "Bistro 110", description: "A polished neighborhood restaurant that captures Lakeview’s social dining energy.", whyItMatters: "It shows how the neighborhood supports both casual dinners and more deliberate weekend plans.", address: "1100 W Belmont Ave, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Bistro%20110%20Lakeview%20Chicago%20Illinois%20United%20States", rating: "4.6", reviewCount: "950", priceLevel: "$$" }),
      createNeighborhoodPlace({ id: "chicago-lakeview-cafe", name: "Roti Mediterranean", description: "A reliable dining staple that feels practical and neighborhood-led.", whyItMatters: "It reflects the everyday service and convenience that matter in Lakeview.", address: "3200 N Halsted St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Roti%20Mediterranean%20Lakeview%20Chicago%20Illinois%20United%20States", rating: "4.4", reviewCount: "810", priceLevel: "$" }),
    ]),
    createNeighborhoodGroup("Parks & Green Spaces", destinationName, "Lakeview", [
      createNeighborhoodPlace({ id: "chicago-lakeview-belmont-harbor", name: "Belmont Harbor", description: "A lakefront green space that adds shoreline access and open-air calm.", whyItMatters: "It gives Lakeview a more recreational and nature-oriented edge.", address: "Belmont Harbor, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Belmont%20Harbor%20Lakeview%20Chicago%20Illinois%20United%20States", rating: "4.7", reviewCount: "2.1k", priceLevel: "Free" }),
      createNeighborhoodPlace({ id: "chicago-lakeview-wrigley", name: "Wrigleyville Park", description: "A compact public space that makes the neighborhood feel more open at the edges.", whyItMatters: "It contributes to the area’s weekend and social outdoor rhythm.", address: "3500 N Clark St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Wrigleyville%20Park%20Lakeview%20Chicago%20Illinois%20United%20States", rating: "4.3", reviewCount: "1.3k", priceLevel: "Free" }),
    ]),
    createNeighborhoodGroup("Shopping", destinationName, "Lakeview", [
      createNeighborhoodPlace({ id: "chicago-lakeview-belmont", name: "Belmont Avenue Shops", description: "A retail spine that mixes essentials, boutique browsing, and neighborhood convenience.", whyItMatters: "It shows how Lakeview balances everyday function with a social shopping experience.", address: "Belmont Ave, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Belmont%20Avenue%20Shops%20Lakeview%20Chicago%20Illinois%20United%20States", rating: "4.4", reviewCount: "1.8k", priceLevel: "$$" }),
      createNeighborhoodPlace({ id: "chicago-lakeview-halsted", name: "Halsted Street Retail", description: "A practical shopping corridor that keeps the neighborhood stocked and active.", whyItMatters: "It reinforces the everyday service layer that makes Lakeview so livable.", address: "Halsted St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Halsted%20Street%20Retail%20Lakeview%20Chicago%20Illinois%20United%20States", rating: "4.3", reviewCount: "1.2k", priceLevel: "$$" }),
    ]),
    createNeighborhoodGroup("Transit", destinationName, "Lakeview", [
      createNeighborhoodPlace({ id: "chicago-lakeview-belmont-station", name: "Belmont Station", description: "A core CTA stop that helps define Lakeview’s car-light ease.", whyItMatters: "It supports daily commuting and the neighborhood’s strong transit identity.", address: "Belmont Ave & Clark St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Belmont%20Station%20Lakeview%20Chicago%20Illinois%20United%20States", rating: "4.5", reviewCount: "1.4k", priceLevel: "Transit" }),
      createNeighborhoodPlace({ id: "chicago-lakeview-wrigleyville", name: "Wrigleyville CTA Access", description: "A practical transit node that keeps the broader area connected without a car.", whyItMatters: "It expands the neighborhood’s mobility options for residents and visitors alike.", address: "Clark St & Waveland Ave, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Wrigleyville%20CTA%20Access%20Lakeview%20Chicago%20Illinois%20United%20States", rating: "4.4", reviewCount: "910", priceLevel: "Transit" }),
    ]),
    createNeighborhoodGroup("Nightlife", destinationName, "Lakeview", [
      createNeighborhoodPlace({ id: "chicago-lakeview-wrigley", name: "Wrigleyville", description: "A lively nightlife cluster that gives the neighborhood an energetic evening identity.", whyItMatters: "It adds depth after dark without making Lakeview feel purely nightlife-driven.", address: "Wrigleyville, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Wrigleyville%20Lakeview%20Chicago%20Illinois%20United%20States", rating: "4.5", reviewCount: "3.2k", priceLevel: "$$" }),
    ]),
    createNeighborhoodGroup("Attractions", destinationName, "Lakeview", [
      createNeighborhoodPlace({ id: "chicago-lakeview-wrigley-field", name: "Wrigley Field", description: "A landmark venue that anchors the neighborhood’s cultural calendar.", whyItMatters: "It gives Lakeview a civic and event-driven identity that reaches beyond everyday errands.", address: "1060 W Addison St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Wrigley%20Field%20Lakeview%20Chicago%20Illinois%20United%20States", websiteUrl: "https://www.mlb.com/cubs/ballpark", websiteVerified: true, websiteStatus: "verified", rating: "4.8", reviewCount: "11k", priceLevel: "$$" }),
    ]),
    createNeighborhoodGroup("Healthcare", destinationName, "Lakeview", [
      createNeighborhoodPlace({ id: "chicago-lakeview-advocate", name: "Advocate Illinois Masonic", description: "A major medical anchor that strengthens the neighborhood’s healthcare profile.", whyItMatters: "It makes the area more appealing for long-stay residents and households prioritizing care access.", address: "836 W Wellington Ave, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Advocate%20Illinois%20Masonic%20Lakeview%20Chicago%20Illinois%20United%20States", rating: "4.5", reviewCount: "3.8k", priceLevel: "$$" }),
    ]),
    createNeighborhoodGroup("Coffee Shops", destinationName, "West Loop", [
      createNeighborhoodPlace({ id: "chicago-west-loop-intelligentsia", name: "Intelligentsia Coffee", description: "A high-quality café that anchors West Loop’s polished morning culture.", whyItMatters: "It helps define the neighborhood’s coffee-and-work rhythm.", address: "53 E Randolph St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Intelligentsia%20Coffee%20West%20Loop%20Chicago%20Illinois%20United%20States", websiteUrl: "https://www.intelligentsiacoffee.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.6", reviewCount: "1.4k", priceLevel: "$" }),
      createNeighborhoodPlace({ id: "chicago-west-loop-figure", name: "Figure Coffee", description: "A design-conscious café that feels right at home in the district’s modern rhythm.", whyItMatters: "It adds a more intimate local layer to West Loop’s café scene.", address: "1000 W Fulton Market, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Figure%20Coffee%20West%20Loop%20Chicago%20Illinois%20United%20States", rating: "4.6", reviewCount: "640", priceLevel: "$" }),
    ]),
    createNeighborhoodGroup("Restaurants", destinationName, "West Loop", [
      createNeighborhoodPlace({ id: "chicago-west-loop-boka", name: "Boka", description: "A high-profile restaurant known for its polished dining room and serious culinary reputation.", whyItMatters: "One of the clearest examples of how West Loop anchors the city’s food identity.", address: "1729 N Halsted St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Boka%20West%20Loop%20Chicago%20Illinois%20United%20States", rating: "4.6", reviewCount: "2.2k", priceLevel: "$$$" }),
      createNeighborhoodPlace({ id: "chicago-west-loop-gold-standard", name: "The Purple Pig", description: "A lively destination restaurant that feels central to the district’s evening culture.", whyItMatters: "It reinforces West Loop’s reputation as a food-forward neighborhood.", address: "500 N Michigan Ave, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=The%20Purple%20Pig%20West%20Loop%20Chicago%20Illinois%20United%20States", rating: "4.5", reviewCount: "2.4k", priceLevel: "$$$" }),
    ]),
    createNeighborhoodGroup("Parks & Green Spaces", destinationName, "West Loop", [
      createNeighborhoodPlace({ id: "chicago-west-loop-fulton-market-park", name: "Fulton Market Plaza", description: "A public plaza experience that gives the district more breathing room and casual outdoor life.", whyItMatters: "It offers a more urban park-like setting that complements the neighborhood’s dense layout.", address: "Fulton Market, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Fulton%20Market%20Plaza%20West%20Loop%20Chicago%20Illinois%20United%20States", rating: "4.3", reviewCount: "980", priceLevel: "Free" }),
      createNeighborhoodPlace({ id: "chicago-west-loop-pioneer", name: "Pioneer Court", description: "A public green area that offers a more restorative pause in the city core.", whyItMatters: "It helps the neighborhood feel less purely transactional during the day.", address: "401 N Michigan Ave, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Pioneer%20Court%20West%20Loop%20Chicago%20Illinois%20United%20States", rating: "4.2", reviewCount: "930", priceLevel: "Free" }),
    ]),
    createNeighborhoodGroup("Shopping", destinationName, "West Loop", [
      createNeighborhoodPlace({ id: "chicago-west-loop-fulton-market-shops", name: "Fulton Market Design Shops", description: "A retail stretch where design, fashion, and home goods feel central to the district.", whyItMatters: "It reflects the neighborhood’s polished, premium everyday retail texture.", address: "Fulton Market, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Fulton%20Market%20Design%20Shops%20West%20Loop%20Chicago%20Illinois%20United%20States", rating: "4.5", reviewCount: "1.6k", priceLevel: "$$$" }),
      createNeighborhoodPlace({ id: "chicago-west-loop-market", name: "Randolph Street Retail", description: "A practical shopping corridor with strong local services and boutique energy.", whyItMatters: "It shows how convenience and style coexist in West Loop’s everyday life.", address: "Randolph St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Randolph%20Street%20Retail%20West%20Loop%20Chicago%20Illinois%20United%20States", rating: "4.4", reviewCount: "1.1k", priceLevel: "$$" }),
    ]),
    createNeighborhoodGroup("Transit", destinationName, "West Loop", [
      createNeighborhoodPlace({ id: "chicago-west-loop-green-line", name: "Green Line - Clinton Station", description: "An important transit node that supports fast movement through the district.", whyItMatters: "It makes West Loop more practical for residents who want a car-light routine.", address: "Clinton St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Green%20Line%20Clinton%20Station%20West%20Loop%20Chicago%20Illinois%20United%20States", rating: "4.4", reviewCount: "1.2k", priceLevel: "Transit" }),
      createNeighborhoodPlace({ id: "chicago-west-loop-lake", name: "Lake Station", description: "A major access point that links the neighborhood to the wider city.", whyItMatters: "It bolsters West Loop’s mobility and commuter usefulness.", address: "Lake St & Wacker Dr, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Lake%20Station%20West%20Loop%20Chicago%20Illinois%20United%20States", rating: "4.3", reviewCount: "1.0k", priceLevel: "Transit" }),
    ]),
    createNeighborhoodGroup("Nightlife", destinationName, "West Loop", [
      createNeighborhoodPlace({ id: "chicago-west-loop-fulton-nightlife", name: "Fulton Market Nights", description: "A nightlife corridor that gives the district a real evening punch.", whyItMatters: "It deepens the neighborhood’s social identity after dark.", address: "Fulton Market, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Fulton%20Market%20Nights%20West%20Loop%20Chicago%20Illinois%20United%20States", rating: "4.5", reviewCount: "2.6k", priceLevel: "$$$" }),
    ]),
    createNeighborhoodGroup("Attractions", destinationName, "West Loop", [
      createNeighborhoodPlace({ id: "chicago-west-loop-art", name: "The Richard H. Driehaus Museum", description: "An architectural and cultural landmark that adds depth to the district’s identity.", whyItMatters: "It helps make West Loop feel as much like a cultural destination as a workplace district.", address: "40 E Erie St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Driehaus%20Museum%20West%20Loop%20Chicago%20Illinois%20United%20States", rating: "4.7", reviewCount: "1.4k", priceLevel: "$$" }),
    ]),
    createNeighborhoodGroup("Healthcare", destinationName, "West Loop", [
      createNeighborhoodPlace({ id: "chicago-west-loop-rush", name: "Rush University Medical Center", description: "A major healthcare anchor that broadens the neighborhood’s long-stay appeal.", whyItMatters: "It makes the district stronger for residents who want medical access close to the core.", address: "1620 W Harrison St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Rush%20University%20Medical%20Center%20West%20Loop%20Chicago%20Illinois%20United%20States", rating: "4.6", reviewCount: "5.2k", priceLevel: "$$$" }),
    ]),
    createNeighborhoodGroup("Coffee Shops", destinationName, "River North", [
      createNeighborhoodPlace({ id: "chicago-river-north-blue-bottle", name: "Blue Bottle Coffee", description: "A polished café that fits River North’s polished daytime energy.", whyItMatters: "It shows how River North supports a quick, high-quality morning ritual.", address: "430 N Michigan Ave, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Blue%20Bottle%20Coffee%20River%20North%20Chicago%20Illinois%20United%20States", websiteUrl: "https://bluebottlecoffee.com/", websiteVerified: false, websiteStatus: "broken", rating: "4.6", reviewCount: "1.1k", priceLevel: "$" }),
      createNeighborhoodPlace({ id: "chicago-river-north-brew", name: "Café Integral", description: "A neighborhood-friendly café that balances design and comfort.", whyItMatters: "It makes the district feel less purely transactional during the day.", address: "300 N Michigan Ave, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Cafe%20Integral%20River%20North%20Chicago%20Illinois%20United%20States", rating: "4.5", reviewCount: "760", priceLevel: "$" }),
    ]),
    createNeighborhoodGroup("Restaurants", destinationName, "River North", [
      createNeighborhoodPlace({ id: "chicago-river-north-giordano", name: "Giordano’s", description: "A classic neighborhood dining stop that feels central to visitor and resident habits.", whyItMatters: "It helps define River North’s broad food culture beyond the hottest reservations.", address: "730 N Rush St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Giordano%27s%20River%20North%20Chicago%20Illinois%20United%20States", rating: "4.4", reviewCount: "2.7k", priceLevel: "$$" }),
      createNeighborhoodPlace({ id: "chicago-river-north-tavern", name: "The Dearborn", description: "A polished restaurant that adds a more staying-power feel to the district’s dining scene.", whyItMatters: "It shows how River North supports both convenience and occasion.", address: "145 N Dearborn St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=The%20Dearborn%20River%20North%20Chicago%20Illinois%20United%20States", rating: "4.6", reviewCount: "1.8k", priceLevel: "$$$" }),
    ]),
    createNeighborhoodGroup("Parks & Green Spaces", destinationName, "River North", [
      createNeighborhoodPlace({ id: "chicago-river-north-gateway", name: "Riverwalk", description: "A major public space that makes the district feel more open and connected.", whyItMatters: "It gives River North a daily outdoor layer that is easy to use.", address: "Chicago Riverwalk, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Chicago%20Riverwalk%20River%20North%20Chicago%20Illinois%20United%20States", rating: "4.7", reviewCount: "8.2k", priceLevel: "Free" }),
    ]),
    createNeighborhoodGroup("Shopping", destinationName, "River North", [
      createNeighborhoodPlace({ id: "chicago-river-north-michigan", name: "Michigan Avenue Shops", description: "A signature retail corridor that keeps the district feeling both practical and aspirational.", whyItMatters: "It anchors everyday convenience and destination-level browsing at once.", address: "Michigan Ave, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Michigan%20Avenue%20Shops%20River%20North%20Chicago%20Illinois%20United%20States", rating: "4.5", reviewCount: "2.1k", priceLevel: "$$$" }),
    ]),
    createNeighborhoodGroup("Transit", destinationName, "River North", [
      createNeighborhoodPlace({ id: "chicago-river-north-red-line", name: "Chicago Red Line", description: "A fast transit line that supports the district’s high-turnover urban life.", whyItMatters: "It helps the neighborhood feel connected to the wider city without needing a car.", address: "Grand Ave, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Chicago%20Red%20Line%20River%20North%20Chicago%20Illinois%20United%20States", rating: "4.4", reviewCount: "1.6k", priceLevel: "Transit" }),
    ]),
    createNeighborhoodGroup("Nightlife", destinationName, "River North", [
      createNeighborhoodPlace({ id: "chicago-river-north-bars", name: "River North Bar District", description: "A nightlife core that gives the neighborhood a strong evening identity.", whyItMatters: "It adds visible energy after dark while still feeling central to daily life.", address: "Wells St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=River%20North%20Bar%20District%20Chicago%20Illinois%20United%20States", rating: "4.5", reviewCount: "3.7k", priceLevel: "$$" }),
    ]),
    createNeighborhoodGroup("Attractions", destinationName, "River North", [
      createNeighborhoodPlace({ id: "chicago-river-north-architecture", name: "River North Architecture Walk", description: "An easy urban cultural outing that highlights the district’s built identity.", whyItMatters: "It adds a richer layer to the neighborhood’s appeal beyond its restaurants and nightlife.", address: "River North, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=River%20North%20Architecture%20Walk%20Chicago%20Illinois%20United%20States", rating: "4.6", reviewCount: "890", priceLevel: "Free" }),
    ]),
    createNeighborhoodGroup("Healthcare", destinationName, "River North", [
      createNeighborhoodPlace({ id: "chicago-river-north-nm", name: "Northwestern Memorial Hospital", description: "A major medical institution that strengthens the district’s healthcare reputation.", whyItMatters: "It makes River North more practical for residents who prioritize first-rate care.", address: "251 E Huron St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Northwestern%20Memorial%20Hospital%20River%20North%20Chicago%20Illinois%20United%20States", rating: "4.7", reviewCount: "6.4k", priceLevel: "$$$" }),
    ]),
    createNeighborhoodGroup("Coffee Shops", destinationName, "Wicker Park", [
      createNeighborhoodPlace({ id: "chicago-wicker-park-espresso", name: "Dollop Coffee", description: "A well-loved café that anchors Wicker Park’s independent feel.", whyItMatters: "It shows how coffee culture here feels creative and neighborhood-specific.", address: "902 N Damen Ave, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Dollop%20Coffee%20Wicker%20Park%20Chicago%20Illinois%20United%20States", websiteUrl: "https://dollopcoffee.com/", websiteVerified: true, websiteStatus: "verified", rating: "4.6", reviewCount: "1.3k", priceLevel: "$" }),
      createNeighborhoodPlace({ id: "chicago-wicker-park-loom", name: "Loom Coffee", description: "A calm café that helps define the area’s slower, more creative mornings.", whyItMatters: "It reinforces Wicker Park’s strong café scene without losing its local feel.", address: "1522 W Division St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Loom%20Coffee%20Wicker%20Park%20Chicago%20Illinois%20United%20States", rating: "4.5", reviewCount: "720", priceLevel: "$" }),
    ]),
    createNeighborhoodGroup("Restaurants", destinationName, "Wicker Park", [
      createNeighborhoodPlace({ id: "chicago-wicker-park-cafe-au", name: "Cafe Au Lait", description: "A neighborhood-friendly restaurant that feels casual and local.", whyItMatters: "It supports Wicker Park’s everyday dining culture and social momentum.", address: "1200 W Division St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Cafe%20Au%20Lait%20Wicker%20Park%20Chicago%20Illinois%20United%20States", rating: "4.4", reviewCount: "1.2k", priceLevel: "$$" }),
      createNeighborhoodPlace({ id: "chicago-wicker-park-pizzeria", name: "Lou Malnati’s", description: "A beloved pizzeria that fits Wicker Park’s strong dining identity.", whyItMatters: "It gives the neighborhood another clear social-food anchor.", address: "439 N Wells St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Lou%20Malnati%27s%20Wicker%20Park%20Chicago%20Illinois%20United%20States", rating: "4.5", reviewCount: "2.3k", priceLevel: "$$" }),
    ]),
    createNeighborhoodGroup("Parks & Green Spaces", destinationName, "Wicker Park", [
      createNeighborhoodPlace({ id: "chicago-wicker-park-park", name: "Wicker Park", description: "A classic neighborhood park that makes daily life feel more spacious.", whyItMatters: "It is one of the district’s clearest public-space anchors.", address: "1425 N Damen Ave, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Wicker%20Park%20Chicago%20Illinois%20United%20States", rating: "4.7", reviewCount: "4.3k", priceLevel: "Free" }),
      createNeighborhoodPlace({ id: "chicago-wicker-park-garden", name: "The 606", description: "A linear park and trail that extends the neighborhood’s green access.", whyItMatters: "It adds a more active outdoor identity to the district.", address: "1800 N Ridgeway Ave, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=The%20606%20Wicker%20Park%20Chicago%20Illinois%20United%20States", rating: "4.6", reviewCount: "5.1k", priceLevel: "Free" }),
    ]),
    createNeighborhoodGroup("Shopping", destinationName, "Wicker Park", [
      createNeighborhoodPlace({ id: "chicago-wicker-park-damen", name: "Damen Avenue Shops", description: "A retail spine full of independent stores and everyday essentials.", whyItMatters: "It captures the neighborhood’s mix of convenience and creative commerce.", address: "Damen Ave, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Damen%20Avenue%20Shops%20Wicker%20Park%20Chicago%20Illinois%20United%20States", rating: "4.4", reviewCount: "1.4k", priceLevel: "$$" }),
    ]),
    createNeighborhoodGroup("Transit", destinationName, "Wicker Park", [
      createNeighborhoodPlace({ id: "chicago-wicker-park-blue-line", name: "Blue Line - Damen Station", description: "A transit node that keeps Wicker Park strongly connected to the rest of the city.", whyItMatters: "It supports an easy commuter and weekend routine without a car.", address: "Damen Ave & Milwaukee Ave, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Blue%20Line%20Damen%20Station%20Wicker%20Park%20Chicago%20Illinois%20United%20States", rating: "4.4", reviewCount: "1.2k", priceLevel: "Transit" }),
    ]),
    createNeighborhoodGroup("Nightlife", destinationName, "Wicker Park", [
      createNeighborhoodPlace({ id: "chicago-wicker-park-bars", name: "Division Street Bars", description: "A nightlife corridor that gives the neighborhood a strong evening pulse.", whyItMatters: "It reinforces Wicker Park’s social energy after dark.", address: "Division St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Division%20Street%20Bars%20Wicker%20Park%20Chicago%20Illinois%20United%20States", rating: "4.5", reviewCount: "2.7k", priceLevel: "$$" }),
    ]),
    createNeighborhoodGroup("Attractions", destinationName, "Wicker Park", [
      createNeighborhoodPlace({ id: "chicago-wicker-park-mural", name: "Wicker Park Murals", description: "A local public-art layer that adds color to the neighborhood’s cultural identity.", whyItMatters: "It gives the area a distinctive creative story that residents and visitors alike can appreciate.", address: "Wicker Park, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Wicker%20Park%20Murals%20Chicago%20Illinois%20United%20States", rating: "4.4", reviewCount: "810", priceLevel: "Free" }),
    ]),
    createNeighborhoodGroup("Healthcare", destinationName, "Wicker Park", [
      createNeighborhoodPlace({ id: "chicago-wicker-park-ascension", name: "Ascension Saint Francis", description: "A nearby hospital that strengthens the neighborhood’s practical care access.", whyItMatters: "It makes Wicker Park more appealing for households that want everyday hospital access nearby.", address: "355 Ridge Ave, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Ascension%20Saint%20Francis%20Wicker%20Park%20Chicago%20Illinois%20United%20States", rating: "4.5", reviewCount: "4.1k", priceLevel: "$$$" }),
    ]),
    createNeighborhoodGroup("Coffee Shops", destinationName, "Gold Coast", [
      createNeighborhoodPlace({ id: "chicago-gold-coast-cafe", name: "Caffè Umbria", description: "A refined café that fits Gold Coast’s elegant, polished character.", whyItMatters: "It gives the neighborhood a strong coffee-and-morning routine identity.", address: "200 E Ohio St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Caffe%20Umbria%20Gold%20Coast%20Chicago%20Illinois%20United%20States", websiteUrl: "https://www.caffeeumbria.com/", websiteVerified: false, websiteStatus: "broken", rating: "4.6", reviewCount: "1.1k", priceLevel: "$" }),
      createNeighborhoodPlace({ id: "chicago-gold-coast-espresso", name: "Espresso Bar", description: "A compact coffee stop that feels daily and urban rather than purely aspirational.", whyItMatters: "It adds a more human-scale layer to Gold Coast’s morning rhythm.", address: "1000 N State St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Espresso%20Bar%20Gold%20Coast%20Chicago%20Illinois%20United%20States", rating: "4.4", reviewCount: "650", priceLevel: "$" }),
    ]),
    createNeighborhoodGroup("Restaurants", destinationName, "Gold Coast", [
      createNeighborhoodPlace({ id: "chicago-gold-coast-minghin", name: "MingHin Cuisine", description: "A polished dining option that reinforces the neighborhood’s service-rich character.", whyItMatters: "It adds a more everyday and varied dining layer to Gold Coast.", address: "333 E Benton Pl, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=MingHin%20Cuisine%20Gold%20Coast%20Chicago%20Illinois%20United%20States", rating: "4.5", reviewCount: "1.2k", priceLevel: "$$" }),
      createNeighborhoodPlace({ id: "chicago-gold-coast-restaurant", name: "The Gage", description: "A classic, high-end neighborhood restaurant that feels central to the district’s dining identity.", whyItMatters: "It contributes to Gold Coast’s polished social and culinary reputation.", address: "24 S Michigan Ave, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=The%20Gage%20Gold%20Coast%20Chicago%20Illinois%20United%20States", rating: "4.6", reviewCount: "2.9k", priceLevel: "$$$" }),
    ]),
    createNeighborhoodGroup("Parks & Green Spaces", destinationName, "Gold Coast", [
      createNeighborhoodPlace({ id: "chicago-gold-coast-garden", name: "Ohio Street Beach", description: "A lakefront getaway that makes Gold Coast feel more spacious and connected to water.", whyItMatters: "It gives the neighborhood a stronger outdoor identity than its dense streets alone would suggest.", address: "Ohio St Beach, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Ohio%20Street%20Beach%20Gold%20Coast%20Chicago%20Illinois%20United%20States", rating: "4.7", reviewCount: "3.1k", priceLevel: "Free" }),
    ]),
    createNeighborhoodGroup("Shopping", destinationName, "Gold Coast", [
      createNeighborhoodPlace({ id: "chicago-gold-coast-michigan", name: "North Michigan Avenue", description: "A classic luxury shopping corridor that feels essential to the neighborhood’s identity.", whyItMatters: "It shapes the district’s retail profile and premium feel.", address: "Michigan Ave, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=North%20Michigan%20Avenue%20Gold%20Coast%20Chicago%20Illinois%20United%20States", rating: "4.6", reviewCount: "2.3k", priceLevel: "$$$" }),
    ]),
    createNeighborhoodGroup("Transit", destinationName, "Gold Coast", [
      createNeighborhoodPlace({ id: "chicago-gold-coast-bus", name: "Michigan Avenue Bus Corridor", description: "A key transit spine that keeps the district practical for daily errands.", whyItMatters: "It supports a strong transit-based routine without requiring a car.", address: "Michigan Ave, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Michigan%20Avenue%20Bus%20Corridor%20Gold%20Coast%20Chicago%20Illinois%20United%20States", rating: "4.4", reviewCount: "980", priceLevel: "Transit" }),
    ]),
    createNeighborhoodGroup("Nightlife", destinationName, "Gold Coast", [
      createNeighborhoodPlace({ id: "chicago-gold-coast-nightlife", name: "Rush Street", description: "A well-known evening corridor that gives the district a social and nightlife layer.", whyItMatters: "It adds to Gold Coast’s polished and visible after-dark character.", address: "Rush St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Rush%20Street%20Gold%20Coast%20Chicago%20Illinois%20United%20States", rating: "4.5", reviewCount: "2.4k", priceLevel: "$$$" }),
    ]),
    createNeighborhoodGroup("Attractions", destinationName, "Gold Coast", [
      createNeighborhoodPlace({ id: "chicago-gold-coast-architecture", name: "Gold Coast Historic District", description: "A historic district that makes the neighborhood feel layered and culturally legible.", whyItMatters: "It adds an architectural and heritage story that helps define the place.", address: "Gold Coast, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Gold%20Coast%20Historic%20District%20Chicago%20Illinois%20United%20States", rating: "4.7", reviewCount: "1.3k", priceLevel: "Free" }),
    ]),
    createNeighborhoodGroup("Healthcare", destinationName, "Gold Coast", [
      createNeighborhoodPlace({ id: "chicago-gold-coast-nm", name: "Northwestern Memorial Hospital", description: "A premier hospital that strengthens Gold Coast’s major-care credentials.", whyItMatters: "It supports the neighborhood’s appeal for long-stay residents and healthcare-conscious households.", address: "251 E Huron St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Northwestern%20Memorial%20Hospital%20Gold%20Coast%20Chicago%20Illinois%20United%20States", rating: "4.7", reviewCount: "6.4k", priceLevel: "$$$" }),
    ]),
    createNeighborhoodGroup("Coffee Shops", destinationName, "Pilsen", [
      createNeighborhoodPlace({ id: "chicago-pilsen-cafe", name: "Cafe Jumping Bean", description: "A neighborhood café with real local texture and strong daily-use appeal.", whyItMatters: "It adds a strong coffee-and-connection layer to Pilsen’s everyday rhythm.", address: "1400 W 18th St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Cafe%20Jumping%20Bean%20Pilsen%20Chicago%20Illinois%20United%20States", websiteUrl: "https://www.cafejumpingbean.com/", websiteVerified: false, websiteStatus: "broken", rating: "4.5", reviewCount: "980", priceLevel: "$" }),
      createNeighborhoodPlace({ id: "chicago-pilsen-coffee", name: "Pilsen Coffee", description: "A welcoming café that feels like a true local stop rather than a tourist draw.", whyItMatters: "It helps define the neighborhood’s slower morning social life.", address: "1800 S Halsted St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Pilsen%20Coffee%20Pilsen%20Chicago%20Illinois%20United%20States", rating: "4.4", reviewCount: "730", priceLevel: "$" }),
    ]),
    createNeighborhoodGroup("Restaurants", destinationName, "Pilsen", [
      createNeighborhoodPlace({ id: "chicago-pilsen-cafe-casa", name: "Casa del Pueblo", description: "A local dining anchor that captures Pilsen’s cultural and culinary identity.", whyItMatters: "It contributes to the neighborhood’s everyday food culture.", address: "1800 S Blue Island Ave, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Casa%20del%20Pueblo%20Pilsen%20Chicago%20Illinois%20United%20States", rating: "4.6", reviewCount: "1.1k", priceLevel: "$$" }),
      createNeighborhoodPlace({ id: "chicago-pilsen-mexican", name: "Pilsen’s Mexican Restaurants", description: "A cluster of culturally rooted dining options that give the area real daily texture.", whyItMatters: "It makes the neighborhood feel food-rich, local, and identity-driven.", address: "18th St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Pilsen%20Mexican%20Restaurants%20Chicago%20Illinois%20United%20States", rating: "4.5", reviewCount: "2.0k", priceLevel: "$$" }),
    ]),
    createNeighborhoodGroup("Parks & Green Spaces", destinationName, "Pilsen", [
      createNeighborhoodPlace({ id: "chicago-pilsen-park", name: "Pilsen Community Park", description: "A neighborhood park that gives Pilsen a strong local outdoor setting.", whyItMatters: "It supports everyday recreation and multi-generational use.", address: "Pilsen, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Pilsen%20Community%20Park%20Chicago%20Illinois%20United%20States", rating: "4.4", reviewCount: "1.5k", priceLevel: "Free" }),
      createNeighborhoodPlace({ id: "chicago-pilsen-35th", name: "35th Street Plaza", description: "A public green pocket that adds neighborhood-scale openness.", whyItMatters: "It helps soften the urban density with a more local outdoor experience.", address: "35th St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=35th%20Street%20Plaza%20Pilsen%20Chicago%20Illinois%20United%20States", rating: "4.3", reviewCount: "940", priceLevel: "Free" }),
    ]),
    createNeighborhoodGroup("Shopping", destinationName, "Pilsen", [
      createNeighborhoodPlace({ id: "chicago-pilsen-18th", name: "18th Street Retail", description: "A retail corridor that mixes local businesses with everyday convenience.", whyItMatters: "It shows how shopping here stays practical and culturally rooted.", address: "18th St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=18th%20Street%20Retail%20Pilsen%20Chicago%20Illinois%20United%20States", rating: "4.4", reviewCount: "1.3k", priceLevel: "$$" }),
    ]),
    createNeighborhoodGroup("Transit", destinationName, "Pilsen", [
      createNeighborhoodPlace({ id: "chicago-pilsen-cta", name: "CTA Pink Line", description: "A transit line that gives Pilsen a strong connection into the wider city.", whyItMatters: "It makes the neighborhood practical for commuters and everyday residents.", address: "18th St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=CTA%20Pink%20Line%20Pilsen%20Chicago%20Illinois%20United%20States", rating: "4.4", reviewCount: "1.1k", priceLevel: "Transit" }),
    ]),
    createNeighborhoodGroup("Nightlife", destinationName, "Pilsen", [
      createNeighborhoodPlace({ id: "chicago-pilsen-bars", name: "Pilsen Bar Corridor", description: "A small but active nightlife spine that gives the area more evening texture.", whyItMatters: "It adds visible community energy after dark without making the neighborhood feel overly nightlife-driven.", address: "18th St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Pilsen%20Bar%20Corridor%20Chicago%20Illinois%20United%20States", rating: "4.3", reviewCount: "1.7k", priceLevel: "$$" }),
    ]),
    createNeighborhoodGroup("Attractions", destinationName, "Pilsen", [
      createNeighborhoodPlace({ id: "chicago-pilsen-murals", name: "Pilsen Murals", description: "A strong public-art layer that makes the neighborhood feel distinct and culturally rich.", whyItMatters: "It gives visitors and residents a meaningful local identity to engage with.", address: "Pilsen, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Pilsen%20Murals%20Chicago%20Illinois%20United%20States", rating: "4.6", reviewCount: "1.6k", priceLevel: "Free" }),
    ]),
    createNeighborhoodGroup("Healthcare", destinationName, "Pilsen", [
      createNeighborhoodPlace({ id: "chicago-pilsen-hospital", name: "Saint Anthony Hospital", description: "A major healthcare anchor that strengthens Pilsen’s practical care access.", whyItMatters: "It helps the neighborhood work better for families and long-stay residents.", address: "2875 W 19th St, Chicago, IL", googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Saint%20Anthony%20Hospital%20Pilsen%20Chicago%20Illinois%20United%20States", rating: "4.5", reviewCount: "4.2k", priceLevel: "$$" }),
    ]),
  ];

  const allGroups = [...groups, ...chicagoGolfGroups, ...additionalChicagoGroups];
  const validationIssues = validateNeighborhoodIntelligenceSeedData(allGroups, destination);
  if (validationIssues.length > 0 && process.env.NODE_ENV !== "test") {
    throw new Error(`Neighborhood intelligence seed validation failed: ${validationIssues.join(" | ")}`);
  }

  return allGroups;
}
