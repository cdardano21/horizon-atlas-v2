"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CanonicalDestination, NeighborhoodIntelligenceGroup, NeighborhoodIntelligenceMetric, NeighborhoodIntelligencePlace, NeighborhoodProfile, NeighborhoodResourceItem } from "../../lib/canonical-destination-model";
import { buildDestinationIntelligenceProfile } from "../../lib/destination-intelligence-engine";
import { getDestinationImageSet, getDestinationImageUrl } from "../../lib/imageFallback";
import { buildNeighborhoodIntelligenceSeedData } from "../../lib/neighborhood-intelligence-seed-data";
import { buildPremiumDestinationEditorialPackage } from "../../lib/premium-destination-engine";
import { isPlaceWebsiteVisible } from "../../lib/website-verification";

interface CanonicalDestinationPageProps {
  destination: CanonicalDestination;
  developerMode?: boolean;
}

function buildGalleryItems(destination: CanonicalDestination) {
  const sources = [
    ...(destination.heroImages ?? []),
    ...(destination.mediaGallery ?? []),
    ...(destination.media ?? []),
  ];

  const seen = new Set<string>();
  return sources.filter((item) => {
    if (!item?.url || seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}

function splitEditorialText(text: string) {
  const paragraphs = text.split(/\n\n+/).map((paragraph) => paragraph.trim()).filter(Boolean);
  if (paragraphs.length <= 2) {
    return { intro: text, body: "" };
  }

  return {
    intro: paragraphs.slice(0, 2).join("\n\n"),
    body: paragraphs.slice(2).join("\n\n"),
  };
}

function getReadTime(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (words > 260) return "5 min read";
  if (words > 140) return "3 min read";
  return "2 min read";
}

type GalleryItem = {
  kind: string;
  url: string;
  altText: string;
  caption: string;
  isPrimary?: boolean;
  resolvedUrl: string;
};

function getScoreReason(categoryName: string, destination: CanonicalDestination) {
  const normalized = categoryName.toLowerCase();
  if (normalized.includes("retire")) {
    return `${destination.title} tends to score well for retirement when healthcare access, climate comfort, and daily-life ease are aligned. The strongest signal is how well the city supports a calmer, lower-friction long-stay routine.`;
  }

  if (normalized.includes("family")) {
    return `${destination.title} earns family points when schools, parks, safety, and everyday convenience are all strong. The score rises when the neighborhood makes routine life feel easy rather than overly demanding.`;
  }

  if (normalized.includes("digital") || normalized.includes("nomad")) {
    return `${destination.title} performs well for digital nomads when internet quality, café culture, transit, and a productive rhythm all reinforce remote work. The score reflects how well the city supports both work and life outside the laptop.`;
  }

  return `${destination.title} is weighted by how well the destination balances atmosphere, ease of living, and practical day-to-day quality. That means the score reflects both the emotional appeal and the operational reality of living there.`;
}

function buildResourceGroups(destination: CanonicalDestination) {
  const resources = [
    ...destination.resources,
    ...destination.realEstateResources,
    ...destination.rentalResources,
    ...destination.healthcareResources,
    ...destination.weatherResources,
    ...destination.structuredResources,
    ...destination.visaResources,
  ].filter((resource) => resource.url && resource.url.trim().length > 0);

  const groups = [
    { title: "Maps", items: resources.filter((resource) => /map|atlas|geo/i.test(resource.category)) },
    { title: "Housing", items: resources.filter((resource) => /housing|real estate|rental|property/i.test(resource.category)) },
    { title: "Healthcare", items: resources.filter((resource) => /health|medical|hospital|clinic|care/i.test(resource.category)) },
    { title: "Government", items: resources.filter((resource) => /gov|municipal|city|county|consul/i.test(resource.category)) },
    { title: "Tourism", items: resources.filter((resource) => /tour|visit|tourism|travel/i.test(resource.category)) },
    { title: "Transportation", items: resources.filter((resource) => /transport|transit|airport|train|bus/i.test(resource.category)) },
    { title: "Schools", items: resources.filter((resource) => /school|education|university|college/i.test(resource.category)) },
    { title: "Weather", items: resources.filter((resource) => /weather|climate|forecast/i.test(resource.category)) },
    { title: "Neighborhood Guides", items: resources.filter((resource) => /neighborhood|district|area/i.test(resource.category)) },
    { title: "Restaurants", items: resources.filter((resource) => /restaurant|food|dining/i.test(resource.category)) },
    { title: "Museums", items: resources.filter((resource) => /museum|culture|arts|heritage/i.test(resource.category)) },
    { title: "Nightlife", items: resources.filter((resource) => /night|bar|club|entertainment/i.test(resource.category)) },
    { title: "Golf", items: resources.filter((resource) => /golf/i.test(resource.category)) },
    { title: "Emergency Services", items: resources.filter((resource) => /emergency|police|fire|ambulance/i.test(resource.category)) },
    { title: "Consulates", items: resources.filter((resource) => /consul|embassy|visa/i.test(resource.category)) },
    { title: "Digital Nomad Resources", items: resources.filter((resource) => /nomad|remote|cowork|digital/i.test(resource.category)) },
    { title: "Webcams", items: resources.filter((resource) => /webcam|camera|stream/i.test(resource.category)) },
  ].filter((group) => group.items.length > 0);

  return groups;
}

function buildNeighborhoodSearchUrl(query: string, mode: "maps" | "street-view" | "directions" | "directions-bike" | "directions-transit" = "maps") {
  const encodedQuery = encodeURIComponent(query);

  switch (mode) {
    case "street-view":
      return `https://www.google.com/maps?q=${encodedQuery}&layer=c`;
    case "directions":
      return `https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${encodedQuery}`;
    case "directions-bike":
      return `https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${encodedQuery}&dirflg=b`;
    case "directions-transit":
      return `https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${encodedQuery}&dirflg=r`;
    default:
      return `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;
  }
}

function buildNeighborhoodQuery(destination: CanonicalDestination, neighborhoodName: string, term: string) {
  return [neighborhoodName, term, destination.city, destination.country].filter(Boolean).join(" ").trim();
}

function dedupeResourceItems(items: NeighborhoodResourceItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.label}::${item.url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildNeighborhoodResourceGroups(destination: CanonicalDestination, neighborhoodName: string) {
  const baseQuery = buildNeighborhoodQuery(destination, neighborhoodName, "");
  const explicitResources = [
    ...destination.resources,
    ...destination.realEstateResources,
    ...destination.rentalResources,
    ...destination.healthcareResources,
    ...destination.weatherResources,
    ...destination.structuredResources,
    ...destination.visaResources,
  ].filter((resource) => resource?.url && resource.url.trim().length > 0);

  const groupTemplates = [
    {
      id: "navigation",
      title: "Navigation",
      icon: "🧭",
      keywords: ["map", "street", "direction", "transit", "walking", "bike"],
      items: [
        { label: "Google Maps", url: buildNeighborhoodSearchUrl(baseQuery, "maps"), kind: "generated" as const },
        { label: "Street View", url: buildNeighborhoodSearchUrl(baseQuery, "street-view"), kind: "generated" as const },
        { label: "Walking Directions", url: buildNeighborhoodSearchUrl(baseQuery, "directions"), kind: "generated" as const },
        { label: "Bike Directions", url: buildNeighborhoodSearchUrl(baseQuery, "directions-bike"), kind: "generated" as const },
        { label: "Transit Directions", url: buildNeighborhoodSearchUrl(baseQuery, "directions-transit"), kind: "generated" as const },
      ],
    },
    {
      id: "housing",
      title: "Housing",
      icon: "🏠",
      keywords: ["housing", "real estate", "rental", "property", "apartment", "zillow", "redfin"],
      items: [
        { label: "Zillow", url: buildNeighborhoodSearchUrl(buildNeighborhoodQuery(destination, neighborhoodName, "zillow rentals"), "maps"), kind: "generated" as const },
        { label: "Redfin", url: buildNeighborhoodSearchUrl(buildNeighborhoodQuery(destination, neighborhoodName, "redfin homes"), "maps"), kind: "generated" as const },
        { label: "Apartments", url: buildNeighborhoodSearchUrl(buildNeighborhoodQuery(destination, neighborhoodName, "apartments"), "maps"), kind: "generated" as const },
        { label: "Furnished rentals", url: buildNeighborhoodSearchUrl(buildNeighborhoodQuery(destination, neighborhoodName, "furnished rentals"), "maps"), kind: "generated" as const },
        { label: "Long-term rentals", url: buildNeighborhoodSearchUrl(buildNeighborhoodQuery(destination, neighborhoodName, "long term rentals"), "maps"), kind: "generated" as const },
      ],
    },
    {
      id: "food",
      title: "Food & Coffee",
      icon: "🍽",
      keywords: ["restaurant", "coffee", "bakery", "grocery", "market", "food", "dining"],
      items: [
        { label: "Top restaurants", url: buildNeighborhoodSearchUrl(buildNeighborhoodQuery(destination, neighborhoodName, "restaurants"), "maps"), kind: "generated" as const },
        { label: "Coffee shops", url: buildNeighborhoodSearchUrl(buildNeighborhoodQuery(destination, neighborhoodName, "coffee shops"), "maps"), kind: "generated" as const },
        { label: "Bakeries", url: buildNeighborhoodSearchUrl(buildNeighborhoodQuery(destination, neighborhoodName, "bakeries"), "maps"), kind: "generated" as const },
        { label: "Grocery stores", url: buildNeighborhoodSearchUrl(buildNeighborhoodQuery(destination, neighborhoodName, "grocery stores"), "maps"), kind: "generated" as const },
        { label: "Farmers markets", url: buildNeighborhoodSearchUrl(buildNeighborhoodQuery(destination, neighborhoodName, "farmers markets"), "maps"), kind: "generated" as const },
      ],
    },
    {
      id: "lifestyle",
      title: "Lifestyle",
      icon: "🌳",
      keywords: ["park", "trail", "gym", "recreation", "dog"],
      items: [
        { label: "Parks", url: buildNeighborhoodSearchUrl(buildNeighborhoodQuery(destination, neighborhoodName, "parks"), "maps"), kind: "generated" as const },
        { label: "Dog parks", url: buildNeighborhoodSearchUrl(buildNeighborhoodQuery(destination, neighborhoodName, "dog parks"), "maps"), kind: "generated" as const },
        { label: "Running trails", url: buildNeighborhoodSearchUrl(buildNeighborhoodQuery(destination, neighborhoodName, "running trails"), "maps"), kind: "generated" as const },
        { label: "Gyms", url: buildNeighborhoodSearchUrl(buildNeighborhoodQuery(destination, neighborhoodName, "gyms"), "maps"), kind: "generated" as const },
        { label: "Recreation", url: buildNeighborhoodSearchUrl(buildNeighborhoodQuery(destination, neighborhoodName, "recreation"), "maps"), kind: "generated" as const },
      ],
    },
    {
      id: "healthcare",
      title: "Healthcare",
      icon: "🏥",
      keywords: ["health", "medical", "hospital", "clinic", "pharmacy", "urgent care", "primary care"],
      items: [
        { label: "Hospitals", url: buildNeighborhoodSearchUrl(buildNeighborhoodQuery(destination, neighborhoodName, "hospitals"), "maps"), kind: "generated" as const },
        { label: "Urgent care", url: buildNeighborhoodSearchUrl(buildNeighborhoodQuery(destination, neighborhoodName, "urgent care"), "maps"), kind: "generated" as const },
        { label: "Primary care", url: buildNeighborhoodSearchUrl(buildNeighborhoodQuery(destination, neighborhoodName, "primary care"), "maps"), kind: "generated" as const },
        { label: "Pharmacies", url: buildNeighborhoodSearchUrl(buildNeighborhoodQuery(destination, neighborhoodName, "pharmacies"), "maps"), kind: "generated" as const },
      ],
    },
    {
      id: "transportation",
      title: "Transportation",
      icon: "🚇",
      keywords: ["transport", "transit", "station", "metro", "subway", "airport", "parking", "bike share"],
      items: [
        { label: "Transit stations", url: buildNeighborhoodSearchUrl(buildNeighborhoodQuery(destination, neighborhoodName, "transit stations"), "maps"), kind: "generated" as const },
        { label: "Metro/Subway", url: buildNeighborhoodSearchUrl(buildNeighborhoodQuery(destination, neighborhoodName, "metro subway"), "maps"), kind: "generated" as const },
        { label: "Airport directions", url: buildNeighborhoodSearchUrl(buildNeighborhoodQuery(destination, neighborhoodName, "airport"), "maps"), kind: "generated" as const },
        { label: "Parking", url: buildNeighborhoodSearchUrl(buildNeighborhoodQuery(destination, neighborhoodName, "parking"), "maps"), kind: "generated" as const },
        { label: "Bike share", url: buildNeighborhoodSearchUrl(buildNeighborhoodQuery(destination, neighborhoodName, "bike share"), "maps"), kind: "generated" as const },
      ],
    },
    {
      id: "entertainment",
      title: "Entertainment",
      icon: "🎭",
      keywords: ["museum", "music", "sport", "theater", "event", "entertainment"],
      items: [
        { label: "Museums", url: buildNeighborhoodSearchUrl(buildNeighborhoodQuery(destination, neighborhoodName, "museums"), "maps"), kind: "generated" as const },
        { label: "Live music", url: buildNeighborhoodSearchUrl(buildNeighborhoodQuery(destination, neighborhoodName, "live music"), "maps"), kind: "generated" as const },
        { label: "Sports", url: buildNeighborhoodSearchUrl(buildNeighborhoodQuery(destination, neighborhoodName, "sports"), "maps"), kind: "generated" as const },
        { label: "Theaters", url: buildNeighborhoodSearchUrl(buildNeighborhoodQuery(destination, neighborhoodName, "theaters"), "maps"), kind: "generated" as const },
        { label: "Events", url: buildNeighborhoodSearchUrl(buildNeighborhoodQuery(destination, neighborhoodName, "events"), "maps"), kind: "generated" as const },
      ],
    },
    {
      id: "daily-living",
      title: "Daily living",
      icon: "🛍",
      keywords: ["shopping", "costco", "target", "whole foods", "trader joe", "market"],
      items: [
        { label: "Shopping centers", url: buildNeighborhoodSearchUrl(buildNeighborhoodQuery(destination, neighborhoodName, "shopping centers"), "maps"), kind: "generated" as const },
        { label: "Costco", url: buildNeighborhoodSearchUrl(buildNeighborhoodQuery(destination, neighborhoodName, "costco"), "maps"), kind: "generated" as const },
        { label: "Target", url: buildNeighborhoodSearchUrl(buildNeighborhoodQuery(destination, neighborhoodName, "target"), "maps"), kind: "generated" as const },
        { label: "Whole Foods", url: buildNeighborhoodSearchUrl(buildNeighborhoodQuery(destination, neighborhoodName, "whole foods"), "maps"), kind: "generated" as const },
        { label: "Trader Joe's", url: buildNeighborhoodSearchUrl(buildNeighborhoodQuery(destination, neighborhoodName, "trader joe's"), "maps"), kind: "generated" as const },
      ],
    },
    {
      id: "community",
      title: "Community",
      icon: "👨‍👩‍👧",
      keywords: ["school", "library", "community", "police", "fire"],
      items: [
        { label: "Schools", url: buildNeighborhoodSearchUrl(buildNeighborhoodQuery(destination, neighborhoodName, "schools"), "maps"), kind: "generated" as const },
        { label: "Libraries", url: buildNeighborhoodSearchUrl(buildNeighborhoodQuery(destination, neighborhoodName, "libraries"), "maps"), kind: "generated" as const },
        { label: "Community centers", url: buildNeighborhoodSearchUrl(buildNeighborhoodQuery(destination, neighborhoodName, "community centers"), "maps"), kind: "generated" as const },
        { label: "Police", url: buildNeighborhoodSearchUrl(buildNeighborhoodQuery(destination, neighborhoodName, "police"), "maps"), kind: "generated" as const },
        { label: "Fire department", url: buildNeighborhoodSearchUrl(buildNeighborhoodQuery(destination, neighborhoodName, "fire department"), "maps"), kind: "generated" as const },
      ],
    },
  ];

  return groupTemplates
    .map((group) => {
      const matchedResources = explicitResources.filter((resource) => group.keywords.some((keyword) => new RegExp(keyword, "i").test(resource.category) || new RegExp(keyword, "i").test(resource.label)));
      const items = dedupeResourceItems([
        ...matchedResources.map((resource) => ({ label: resource.label, url: resource.url, kind: "dataset" as const })),
        ...group.items,
      ]).slice(0, 4);

      return { ...group, items };
    })
    .filter((group) => group.items.length > 0);
}

function buildNeighborhoodLiveResources(destination: CanonicalDestination, neighborhoodName: string) {
  const explicitResources = [
    ...destination.resources,
    ...destination.realEstateResources,
    ...destination.rentalResources,
    ...destination.healthcareResources,
    ...destination.weatherResources,
    ...destination.structuredResources,
    ...destination.visaResources,
  ].filter((resource) => resource?.url && resource.url.trim().length > 0);

  const liveItems = [
    ...(destination.webcamUrl ? [{ label: "Live webcam", url: destination.webcamUrl, kind: "live" as const }] : []),
    ...explicitResources
      .filter((resource) => /weather|traffic|air|transit|sunrise|sunset|live|webcam|camera/i.test(resource.category) || /weather|traffic|air|transit|sunrise|sunset|live|webcam|camera/i.test(resource.label))
      .map((resource) => ({ label: resource.label, url: resource.url, kind: "live" as const })),
  ];

  return dedupeResourceItems(liveItems).filter((item) => item.url && item.url.trim().length > 0);
}

type NeighborhoodInsightPlace = {
  id: string;
  title: string;
  description: string;
  neighborhood: string;
  rating?: string;
  distance?: string;
  category: string;
  mapUrl?: string;
  website?: string;
  address?: string;
  hours?: string;
  phone?: string;
  aiSummary?: string;
  metadata?: Record<string, string>;
  isFallback?: boolean;
};

type NeighborhoodInsightCard = {
  key: string;
  label: string;
  value: string;
  description: string;
  places: NeighborhoodInsightPlace[];
  emptyMessage: string;
};

function normalizeText(value: string | undefined | null) {
  return (value ?? "").trim().toLowerCase();
}

function isShoppingCategory(category: string | undefined) {
  const normalized = normalizeText(category);
  if (!normalized) return false;
  if (normalized === "shopping") return true;
  if (normalized === "shopping district" || normalized === "shopping districts") return true;
  if (normalized === "retail" || normalized === "retail district" || normalized === "retail districts") return true;
  if (normalized === "boutique" || normalized === "boutiques") return true;
  if (normalized === "market" || normalized === "markets") return true;
  if (normalized.startsWith("shopping") && !normalized.includes("coffee")) return true;
  return false;
}

function isGenericPlaceName(name: string | undefined, neighborhoodName: string, category: string, destinationName: string) {
  const normalizedName = normalizeText(name);
  if (!normalizedName) return true;

  const blockedTerms = [
    normalizeText(neighborhoodName),
    normalizeText(destinationName),
    normalizeText(category),
    "neighborhood",
    "district",
    "area",
    "city",
    "place",
    "spot",
    "local",
    "guide",
    "category",
    "destination",
    "community",
  ];

  if (blockedTerms.includes(normalizedName)) return true;
  if (normalizedName.includes("neighborhood")) return true;
  if (normalizedName.includes("district")) return true;
  if (normalizedName.includes("city")) return true;
  if (normalizedName.includes("area")) return true;
  return false;
}

function buildCategoryFallbackPlace(destination: CanonicalDestination, neighborhoodName: string, category: string) {
  const query = [neighborhoodName, category, destination.city, destination.country].filter(Boolean).join(" ").trim();
  return {
    id: `fallback-${category}-${neighborhoodName}`,
    title: `Explore ${category.toLowerCase()} in ${neighborhoodName}`,
    description: `Open a neighborhood-specific search for ${category.toLowerCase()} in ${neighborhoodName}.`,
    neighborhood: neighborhoodName || destination.city,
    category,
    mapUrl: buildNeighborhoodSearchUrl(query, "maps"),
    isFallback: true,
    metadata: { Source: "Neighborhood-specific search" },
  } satisfies NeighborhoodInsightPlace;
}

function buildVerifiableInsightPlaces(destination: CanonicalDestination, neighborhoodName: string, group: NeighborhoodIntelligenceGroup) {
  const verifiedPlaces = (group.places ?? [])
    .filter((place) => place?.name && place.verified === true)
    .filter((place) => !isGenericPlaceName(place.name, neighborhoodName, group.category, destination.title || destination.city))
    .slice(0, 4)
    .map((place, index) => {
      const mapQuery = [neighborhoodName, place.name, destination.city, destination.country].filter(Boolean).join(" ").trim();
      const metadata: Record<string, string> = {
        Category: group.category,
        Source: place.source || "Verified neighborhood intelligence",
      };

      if (place.relationshipToNeighborhood) metadata["Relationship"] = place.relationshipToNeighborhood;
      if (place.address) metadata["Location"] = place.address;
      if (place.courseType) metadata["Course type"] = place.courseType;
      if (place.publicStatus) metadata["Public/private"] = place.publicStatus;
      if (place.holes) metadata["Holes"] = place.holes;
      if (place.priceContext) metadata["Pricing"] = place.priceContext;
      if (place.amenities) metadata["Amenities"] = place.amenities;

      return {
        id: place.id || `${group.category}-${index}-${place.name}`,
        title: place.name,
        description: place.description || `${place.name} is a verified ${group.category.toLowerCase()} that helps explain what makes ${neighborhoodName || destination.city} feel distinctive.`,
        neighborhood: place.neighborhoodName || neighborhoodName || destination.city,
        category: group.category,
        mapUrl: place.googleMapsUrl || buildNeighborhoodSearchUrl(mapQuery, "maps"),
        website: isPlaceWebsiteVisible(place) ? place.websiteUrl : undefined,
        aiSummary: place.whyItMatters || `${place.name} is a place-level signal that helps explain the local rhythm of ${neighborhoodName || destination.city}.`,
        metadata,
      } satisfies NeighborhoodInsightPlace;
    });

  if (verifiedPlaces.length > 0) {
    return verifiedPlaces;
  }

  return [buildCategoryFallbackPlace(destination, neighborhoodName, group.category)];
}

function getSignatureStreetsForNeighborhood(destination: CanonicalDestination, neighborhoodName: string) {
  const normalized = normalizeText(neighborhoodName);
  const city = normalizeText(destination.city);

  if (city === "chicago") {
    const signatureMap: Record<string, string> = {
      "lincoln park": "Clark Street, Halsted Street, and Diversey Parkway",
      lakeview: "Halsted Street, Belmont Avenue, and Broadway",
      "west loop": "Randolph Street, Fulton Market, and Halsted Street",
      "hyde park": "57th Street, 53rd Street, and the lakefront corridors",
      "wicker park": "Milwaukee Avenue, Damen Avenue, and Division Street",
      "river north": "Michigan Avenue, Wells Street, and Ohio Street",
      "gold coast": "Rush Street, Michigan Avenue, and Oak Street",
      "logan square": "Milwaukee Avenue, Kedzie Avenue, and Armitage Avenue",
      "south loop": "Michigan Avenue, Roosevelt Road, and State Street",
    };

    return signatureMap[normalized] || "A few local corridors shape the neighborhood’s everyday rhythm";
  }

  return profileSignatureStreets(neighborhoodName, destination.city);
}

function profileSignatureStreets(neighborhoodName: string, cityName: string) {
  const fallback = neighborhoodName || cityName || "the neighborhood";
  return `${fallback} is often defined by a few streets that anchor daily errands, cafés, and the social rhythm of the area.`;
}

function buildNeighborhoodInsightCards(destination: CanonicalDestination, neighborhoodName: string) {
  const profile = destination.neighborhoodProfiles?.find((item) => item.name.toLowerCase() === neighborhoodName.toLowerCase());
  const directMetrics = profile?.intelligence ?? [];
  const getDirectValue = (key: string) => directMetrics.find((metric) => metric.key === key)?.value;

  const summarizeValue = (value: string | undefined, fallback: string) => (value && value.trim().length > 0 ? value : fallback);

  const walkability = summarizeValue(getDirectValue("walkability"), destination.knowledgeProfile?.walkability ?? destination.walkability ?? "Well-suited for everyday life");
  const bikeability = summarizeValue(getDirectValue("bikeability"), destination.knowledgeProfile?.bikeFriendliness ?? "Strong cycling potential when paired with a good neighborhood layout");
  const transit = summarizeValue(getDirectValue("transit"), destination.knowledgeProfile?.publicTransportation ?? destination.transportation ?? "Useful transit access for daily movement");
  const coffeeCulture = summarizeValue(getDirectValue("coffeeCulture"), destination.knowledgeProfile?.coffeeShops?.length ? "A lively café scene is part of the local rhythm" : "Coffee culture is an important part of everyday life here");
  const restaurantDensity = summarizeValue(getDirectValue("restaurantDensity"), destination.restaurants.length || destination.knowledgeProfile?.restaurants?.length ? "A strong dining scene helps define the neighborhood" : "A compelling food scene helps define the neighborhood");
  const greenSpace = summarizeValue(getDirectValue("greenSpace"), destination.knowledgeProfile?.parks?.length || destination.outdoorRecreation.length ? "Green space and outdoor access deepen the experience" : "Outdoor access is part of the neighborhood’s appeal");
  const safety = summarizeValue(getDirectValue("safety"), destination.knowledgeProfile?.safety ?? destination.safety ?? "A practical and grounded everyday feel");
  const familyFriendly = summarizeValue(getDirectValue("familyFriendly"), destination.knowledgeProfile?.familySuitability ?? destination.family ?? "Good fit for households seeking everyday ease");
  const petFriendly = summarizeValue(getDirectValue("petFriendly"), destination.knowledgeProfile?.parks?.length || destination.outdoorRecreation.length ? "Dog-friendly and outdoor routines feel easy here" : "A useful neighborhood for pet-friendly routines");
  const remoteWork = summarizeValue(getDirectValue("remoteWork"), destination.knowledgeProfile?.internetSpeed ?? destination.internet ?? destination.digitalNomad ?? "A practical base for focused work and slow routines");
  const nightlifeValue = summarizeValue(getDirectValue("nightlife"), destination.knowledgeProfile?.nightlife?.length ? "A lively evening scene adds depth to the neighborhood" : "Evening energy is part of the local character");
  const shoppingValue = summarizeValue(getDirectValue("shopping"), destination.knowledgeProfile?.shopping?.length ? "Essential day-to-day retail keeps the area practical" : "Convenience retail shapes the everyday experience");

  const positiveSignals = [walkability, transit, coffeeCulture, restaurantDensity, greenSpace, safety, familyFriendly, remoteWork].filter((value) => /strong|good|excellent|high|dense|abundant|moderate|comfortable|solid|reliable|clear|well|lively|practical/i.test(value));
  const overallScore = Math.min(10, Math.max(4, 4 + positiveSignals.length / 2));
  const signatureStreets = getSignatureStreetsForNeighborhood(destination, neighborhoodName);

  const intelligenceGroups = (destination.neighborhoodIntelligence?.length ? destination.neighborhoodIntelligence : buildNeighborhoodIntelligenceSeedData(destination))
    .filter((group) => {
      const sameDestination = !group.destinationName || normalizeText(group.destinationName) === normalizeText(destination.title || destination.city);
      const sameNeighborhood = !group.neighborhoodName || normalizeText(group.neighborhoodName) === normalizeText(neighborhoodName);
      return sameDestination && (sameNeighborhood || /golf/i.test(group.category));
    });

  const categoryCards = [
    {
      key: "restaurants",
      label: "Restaurants",
      value: "Popular restaurants",
      description: "Verified place-level dining signals that reflect the neighborhood’s everyday identity.",
      matcher: (group: NeighborhoodIntelligenceGroup) => group.category.toLowerCase().includes("restaurant"),
    },
    {
      key: "coffee",
      label: "Coffee shops",
      value: "Popular coffee shops",
      description: "Verified café and coffee signals that support slower mornings and local routines.",
      matcher: (group: NeighborhoodIntelligenceGroup) => /coffee/i.test(group.category),
    },
    {
      key: "parks",
      label: "Parks & green spaces",
      value: "Popular green spaces",
      description: "Verified outdoor and green-space signals that make daily life feel calmer and more spacious.",
      matcher: (group: NeighborhoodIntelligenceGroup) => /park|green|outdoor/i.test(group.category),
    },
    {
      key: "shopping",
      label: "Shopping",
      value: "Popular shopping spots",
      description: "Verified retail and everyday convenience signals that shape the neighborhood routine.",
      matcher: (group: NeighborhoodIntelligenceGroup) => isShoppingCategory(group.category),
    },
    {
      key: "golf",
      label: "Golf courses",
      value: "Nearby golf options",
      description: "Verified golf clubs and courses that matter for neighborhood-level lifestyle access and recreation.",
      matcher: (group: NeighborhoodIntelligenceGroup) => /golf/i.test(group.category),
      getLabel: (neighborhoodName: string, group: NeighborhoodIntelligenceGroup) => {
        const sameNeighborhood = !group.neighborhoodName || normalizeText(group.neighborhoodName) === normalizeText(neighborhoodName);
        return sameNeighborhood ? "Golf courses" : "Nearby Golf Courses";
      },
    },
    {
      key: "transit",
      label: "Transit",
      value: "Transit anchors",
      description: "Verified mobility signals that shape how the neighborhood feels from day to day.",
      matcher: (group: NeighborhoodIntelligenceGroup) => /transit|transport|station|airport|metro|subway/i.test(group.category),
    },
    {
      key: "healthcare",
      label: "Healthcare",
      value: "Healthcare anchors",
      description: "Verified medical and care-access signals that shape long-stay practicality.",
      matcher: (group: NeighborhoodIntelligenceGroup) => /health|care|clinic|hospital|medical/i.test(group.category),
    },
    {
      key: "nightlife",
      label: "Nightlife",
      value: "Popular nightlife spots",
      description: "Verified evening-energy signals that add depth after dark.",
      matcher: (group: NeighborhoodIntelligenceGroup) => /night|bar|club|music|event|theater/i.test(group.category),
    },
    {
      key: "family-insight",
      label: "Family friendly",
      value: "Family-friendly places",
      description: "Verified family-oriented places that support a calm, practical week.",
      matcher: (group: NeighborhoodIntelligenceGroup) => /family/i.test(group.category),
    },
    {
      key: "pet",
      label: "Pet friendly",
      value: "Pet-friendly places",
      description: "Verified pet-oriented spots and services that make daily life easier.",
      matcher: (group: NeighborhoodIntelligenceGroup) => /pet/i.test(group.category),
    },
    {
      key: "remote-work-insight",
      label: "Remote work",
      value: "Remote-work-friendly spots",
      description: "Verified coworking, café, and work-friendly locations that support a productive daily routine.",
      matcher: (group: NeighborhoodIntelligenceGroup) => /remote|cowork|workspace|library|work/i.test(group.category),
    },
  ].flatMap((cardConfig) => {
    const sameNeighborhoodGroup = intelligenceGroups.find((group) => cardConfig.matcher(group) && (!group.neighborhoodName || normalizeText(group.neighborhoodName) === normalizeText(neighborhoodName)));
    const matchingGroup = sameNeighborhoodGroup ?? intelligenceGroups.find(cardConfig.matcher);
    if (!matchingGroup) return [];

    const places = buildVerifiableInsightPlaces(destination, neighborhoodName, matchingGroup);
    if (places.length === 0) return [];

    const label = typeof cardConfig.getLabel === "function"
      ? cardConfig.getLabel(neighborhoodName, matchingGroup)
      : cardConfig.label;

    return [{
      key: cardConfig.key,
      label,
      value: cardConfig.value,
      description: cardConfig.description,
      places,
      emptyMessage: "No verified place-level data is available for this category yet.",
    } satisfies NeighborhoodInsightCard];
  });

  const cards: NeighborhoodInsightCard[] = [
    {
      key: "signature-streets",
      label: "Signature streets",
      value: "Local corridors that shape the place",
      description: signatureStreets,
      places: [],
      emptyMessage: "Signature street context is being refined for this neighborhood.",
    },
    ...categoryCards,
    {
      key: "bikeability",
      label: "Bikeability",
      value: "Bike-friendly routes",
      description: bikeability,
      places: [],
      emptyMessage: "No verified bikeability data is available for this neighborhood yet.",
    },
    {
      key: "family-empty",
      label: "Family friendly",
      value: "Family-friendly places",
      description: familyFriendly,
      places: [],
      emptyMessage: "No verified family-friendly data is available for this neighborhood yet.",
    },
    {
      key: "pet",
      label: "Pet friendly",
      value: "Pet-friendly places",
      description: petFriendly,
      places: [],
      emptyMessage: "No verified pet-friendly data is available for this neighborhood yet.",
    },
    {
      key: "remote-work-empty",
      label: "Remote work",
      value: "Remote-work-friendly spots",
      description: remoteWork,
      places: [],
      emptyMessage: "No verified remote-work data is available for this neighborhood yet.",
    },
    { key: "walkability", label: "Walkability", value: String(walkability), description: "How easily daily errands and neighborhood life can be handled on foot.", places: [], emptyMessage: "No verified walkability data is available for this neighborhood yet." },
    { key: "transit-signal", label: "Transit", value: String(transit), description: "How well the area supports car-light routines and local travel.", places: [], emptyMessage: "No verified transit data is available for this neighborhood yet." },
    { key: "safety", label: "Safety", value: String(safety), description: "How the area is perceived for daily calm and residential comfort.", places: [], emptyMessage: "No verified safety data is available for this neighborhood yet." },
    { key: "overall", label: "Overall neighborhood score", value: `${overallScore.toFixed(1)}/10`, description: "A dynamic composite built from the strongest available neighborhood signals.", places: [], emptyMessage: "No verified neighborhood score data is available for this neighborhood yet." },
  ];

  return cards;
}

function PremiumSectionBlock({
  title,
  summary,
  body,
  readTime,
  eyebrow,
}: {
  title: string;
  summary: string;
  body: string;
  readTime: string;
  eyebrow?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const { intro, body: remainder } = splitEditorialText(summary);
  const hasBody = body.trim().length > 0 || remainder.trim().length > 0;

  return (
    <article className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(2,8,23,0.2)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-300">{eyebrow}</p> : null}
          <h3 className="mt-2 text-xl font-semibold text-white">{title}</h3>
          <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-400">{readTime}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-slate-500">Estimated completion</p>
        </div>
        {hasBody ? (
          <button type="button" onClick={() => setExpanded((value) => !value)} className="rounded-full border border-white/10 bg-slate-950/50 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:border-cyan-400/40 hover:bg-cyan-500/10">
            {expanded ? "▲ Collapse" : "▼ Continue reading"}
          </button>
        ) : null}
      </div>
      <div className="mt-5 space-y-4">
        <p className="text-sm leading-8 text-slate-300 whitespace-pre-line">{intro}</p>
        <div className={`overflow-hidden transition-all duration-300 ${expanded ? "max-h-[2200px] opacity-100" : "max-h-0 opacity-0"}`}>
          {body.trim().length > 0 ? <p className="text-sm leading-8 text-slate-300 whitespace-pre-line">{body}</p> : null}
          {remainder.trim().length > 0 ? <p className="mt-4 text-sm leading-8 text-slate-300 whitespace-pre-line">{remainder}</p> : null}
        </div>
      </div>
    </article>
  );
}

function ExpandableInsightCard({
  title,
  summary,
  body,
  strengths,
  weaknesses,
  bestFor,
  avoidFor,
  similarDestinations,
}: {
  title: string;
  summary: string;
  body: string;
  strengths?: string[];
  weaknesses?: string[];
  bestFor?: string[];
  avoidFor?: string[];
  similarDestinations?: string[];
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 shadow-[0_20px_60px_rgba(2,8,23,0.18)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-base font-semibold text-white">{title}</h4>
          <p className="mt-2 text-sm leading-7 text-slate-300">{summary}</p>
        </div>
        <button type="button" onClick={() => setExpanded((value) => !value)} className="rounded-full border border-white/10 bg-slate-950/40 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
          {expanded ? "Collapse" : "Expand"}
        </button>
      </div>
      <div className={`overflow-hidden transition-all duration-300 ${expanded ? "mt-4 max-h-[900px] opacity-100" : "max-h-0 opacity-0"}`}>
        <p className="text-sm leading-8 text-slate-400">{body}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {strengths && strengths.length > 0 ? (
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">Strengths</p>
              <ul className="mt-2 space-y-2 text-sm leading-7 text-slate-300">
                {strengths.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </div>
          ) : null}
          {weaknesses && weaknesses.length > 0 ? (
            <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-300">Weaknesses</p>
              <ul className="mt-2 space-y-2 text-sm leading-7 text-slate-300">
                {weaknesses.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </div>
          ) : null}
        </div>
        {bestFor && bestFor.length > 0 ? (
          <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/40 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300">Best for</p>
            <p className="mt-2 text-sm leading-7 text-slate-300">{bestFor.join(" • ")}</p>
          </div>
        ) : null}
        {avoidFor && avoidFor.length > 0 ? (
          <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/40 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Who should avoid it</p>
            <p className="mt-2 text-sm leading-7 text-slate-300">{avoidFor.join(" • ")}</p>
          </div>
        ) : null}
        {similarDestinations && similarDestinations.length > 0 ? (
          <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/40 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Similar destinations</p>
            <p className="mt-2 text-sm leading-7 text-slate-300">{similarDestinations.join(" • ")}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function getNeighborhoodResourceLinks(destination: CanonicalDestination, neighborhoodName: string) {
  const resources = [
    ...destination.resources,
    ...destination.realEstateResources,
    ...destination.rentalResources,
    ...destination.healthcareResources,
    ...destination.weatherResources,
    ...destination.structuredResources,
    ...destination.visaResources,
  ].filter((resource) => resource?.url && resource.url.trim().length > 0);

  const normalizedName = neighborhoodName.toLowerCase();
  const scored = resources.map((resource) => {
    const label = `${resource.label} ${resource.category}`.toLowerCase();
    let score = 0;

    if (normalizedName && label.includes(normalizedName)) score += 8;
    if (/neighborhood|district|area|map|guide/i.test(label)) score += 4;
    if (/housing|real estate|rental|property/i.test(label)) score += 3;
    if (/health|medical|hospital|clinic|care/i.test(label)) score += 3;
    if (/transport|transit|airport|train|bus/i.test(label)) score += 3;
    if (/restaurant|food|dining/i.test(label)) score += 3;
    if (/school|education|university|college/i.test(label)) score += 2;
    if (/museum|culture|arts|heritage/i.test(label)) score += 2;
    if (/tour|visit|tourism|travel/i.test(label)) score += 2;

    return { resource, score };
  });

  const ranked = scored.sort((left, right) => right.score - left.score);
  return ranked.filter((item) => item.score > 0).slice(0, 3).map((item) => item.resource);
}

function ExpandableNeighborhoodCard({
  neighborhood,
  index,
  destination,
}: {
  neighborhood: { name: string; whyItWorks: string; fit: string; vibe: string };
  index: number;
  destination: CanonicalDestination;
}) {
  const [expanded, setExpanded] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<NeighborhoodInsightPlace | null>(null);
  const neighborhoodResourceGroups = useMemo(() => buildNeighborhoodResourceGroups(destination, neighborhood.name), [destination, neighborhood.name]);
  const neighborhoodLiveResources = useMemo(() => buildNeighborhoodLiveResources(destination, neighborhood.name), [destination, neighborhood.name]);
  const neighborhoodInsightCards = useMemo(() => buildNeighborhoodInsightCards(destination, neighborhood.name), [destination, neighborhood.name]);
  const detailMap = [
    { label: "Best For", value: neighborhood.fit },
    { label: "Overall Vibe", value: neighborhood.vibe },
    { label: "Walkability", value: index === 0 ? `Very strong around parks, cafés, and daily errands in ${destination.city}` : index === 1 ? `Practical without a car for many routines in ${destination.city}` : index === 2 ? `Excellent for a foot-first lifestyle near core amenities` : `Solid for most daily needs with a few longer walks to the center` },
    { label: "Transit", value: index === 0 ? `Good transit access that support a car-light routine` : index === 1 ? `Dense transit links make commuting manageable` : index === 2 ? `Easy access into the wider city and major corridors` : `Reliable transit is useful, especially in colder months` },
    { label: "Dining", value: index === 0 ? `A calm but well-fed neighborhood with strong local restaurants` : index === 1 ? `A more energetic culinary scene with broad everyday options` : index === 2 ? `A polished food destination with strong weekend dining energy` : `More understated than headline-grabbing, but very livable` },
    { label: "Coffee", value: index === 0 ? `Classic local cafés that make slow mornings easy` : index === 1 ? `A heavier café culture for working days and meetings` : index === 2 ? `Design-forward coffee spots with an elevated pace` : `Quiet and reflective, with a strong neighborhood rhythm` },
    { label: "Housing", value: index === 0 ? `A premium mix of apartments, townhomes, and renovated units` : index === 1 ? `A broader range of rentals and long-term homes` : index === 2 ? `Luxury and design-led properties with strong demand` : `More residential and often quieter than the core districts` },
    { label: "Safety", value: index === 0 ? `Generally stable and residential when the right blocks are chosen` : index === 1 ? `Practical and active, with more urban energy at night` : index === 2 ? `More dynamic and visible, so street-level context matters` : `Calmer and more academic in feel overall` },
    { label: "Parks", value: index === 0 ? `Strong parks and green space make daily life feel more spacious` : index === 1 ? `Good access to open space and easy urban breaks` : index === 2 ? `Well-positioned for waterfront or green-space access` : `More nature-forward and slower-paced than the center` },
    { label: "Schools", value: index === 0 ? `A strong pick for families prioritizing neighborhood stability` : index === 1 ? `Useful for households that value access and convenience` : index === 2 ? `Better for those who prefer a more urban, adult-centered rhythm` : `A thoughtful choice for students and quieter households` },
    { label: "Healthcare", value: destination.healthcare || `Medical access is an important part of the neighborhood decision in ${destination.city}` },
    { label: "Restaurants", value: index === 0 ? `A strong local dining scene that supports everyday comfort and weekend plans` : index === 1 ? `Excellent for a broad mix of casual and polished food options` : index === 2 ? `One of the city’s most compelling culinary zones` : `Reliable neighborhood dining with a quieter pace` },
    { label: "Nightlife", value: index === 0 ? `Low-key evenings and social plans that stay close to home` : index === 1 ? `More energetic after dark and easier for evening outings` : index === 2 ? `High-energy nightlife and late-night culture` : `More relaxed evenings and a quieter social rhythm` },
    { label: "Pros", value: index === 0 ? `Parks, calm, and a strong residential identity` : index === 1 ? `Convenience, energy, and practical everyday logistics` : index === 2 ? `Dining, design, and a more cosmopolitan rhythm` : `Quiet, human-scale living and strong local texture` },
    { label: "Cons", value: index === 0 ? `Can feel expensive and more family-oriented than nightlife-heavy` : index === 1 ? `Some blocks can feel busy or less serene` : index === 2 ? `High cost and strong premium demand` : `Less nightlife energy and a slower social pace` },
    { label: "Typical Resident", value: index === 0 ? `Residents who value calm, walkability, and a polished residential feel` : index === 1 ? `Residents who want convenience, strong transit, and broad everyday options` : index === 2 ? `Residents who like culture, design, and a more urban rhythm` : `Residents who want a quieter base with a strong local identity` },
    { label: "Nearby Attractions", value: index === 0 ? `Waterfront access, cultural institutions, and easy weekend escapes` : index === 1 ? `Core dining, local landmarks, and a broad urban calendar` : index === 2 ? `Museums, architecture, nightlife, and polished neighborhood culture` : `Quiet green space, local cafés, and nearby cultural sites` },
    { label: "Estimated Cost", value: index === 0 ? `Premium pricing with strong value if the neighborhood fits your daily rhythm` : index === 1 ? `Broad price points with a mix of approachable and high-end options` : index === 2 ? `Higher-end living with stronger demand and premium rents` : `Usually more manageable than the core districts while still offering a strong lifestyle` },
  ];

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 shadow-[0_20px_60px_rgba(2,8,23,0.18)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-lg font-semibold text-white">{neighborhood.name}</h4>
          <p className="mt-2 text-sm leading-7 text-slate-300">{neighborhood.whyItWorks}</p>
        </div>
        <button type="button" onClick={() => setExpanded((value) => !value)} className="rounded-full border border-white/10 bg-slate-950/40 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
          {expanded ? "Collapse" : "Explore"}
        </button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Best for</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">{neighborhood.fit}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Overall vibe</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">{neighborhood.vibe}</p>
        </div>
      </div>
      <div className={`overflow-hidden transition-all duration-300 ${expanded ? "mt-4 max-h-[4000px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {detailMap.map((detail) => (
            <div key={detail.label} className="rounded-2xl border border-white/10 bg-slate-950/35 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{detail.label}</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{detail.value}</p>
            </div>
          ))}
        </div>
        {neighborhoodInsightCards.length > 0 ? (
          <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Neighborhood intelligence</p>
                <h5 className="mt-1 text-lg font-semibold text-white">A curatorial guide to the places that make the neighborhood feel real</h5>
              </div>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {neighborhoodInsightCards.map((card) => (
                <div key={card.key} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{card.label}</p>
                  <p className="mt-2 text-sm font-semibold text-white">{card.value}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{card.description}</p>
                  {card.places.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {Array.from(new Map(card.places.slice(0, 4).map((place) => [place.id, place])).values()).map((place) => {
                        const linkClasses = "flex w-full items-start justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-left transition hover:border-cyan-400/30 hover:bg-cyan-500/10";
                        const actionLabel = place.isFallback ? "Explore" : "Open";

                        if (place.isFallback) {
                          return (
                            <a key={place.id} href={place.mapUrl} target="_blank" rel="noopener noreferrer" className={linkClasses}>
                              <span>
                                <span className="block text-sm font-semibold text-white">{place.title}</span>
                                <span className="mt-1 block text-sm leading-6 text-slate-400">{place.description}</span>
                              </span>
                              <span className="text-xs uppercase tracking-[0.2em] text-cyan-200">{actionLabel}</span>
                            </a>
                          );
                        }

                        return (
                          <button key={place.id} type="button" onClick={() => setSelectedPlace(place)} className={linkClasses}>
                            <span>
                              <span className="block text-sm font-semibold text-white">{place.title}</span>
                              <span className="mt-1 block text-sm leading-6 text-slate-400">{place.description}</span>
                            </span>
                            <span className="text-xs uppercase tracking-[0.2em] text-cyan-200">{actionLabel}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-slate-400">{card.emptyMessage}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {neighborhoodLiveResources.length > 0 ? (
          <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Live neighborhood resources</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {neighborhoodLiveResources.map((resource) => (
                <a key={`${resource.label}-${resource.url}`} href={resource.url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyan-200 transition hover:border-cyan-400/40 hover:bg-cyan-500/20">
                  {resource.label}
                </a>
              ))}
            </div>
          </div>
        ) : null}
        {neighborhoodResourceGroups.length > 0 ? (
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {neighborhoodResourceGroups.map((group) => (
              <div key={group.id} className="rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{group.icon}</span>
                  <h5 className="text-base font-semibold text-white">{group.title}</h5>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {group.items.map((resource) => (
                    <a key={`${group.id}-${resource.label}-${resource.url}`} href={resource.url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-400/30 hover:bg-cyan-500/10 hover:text-cyan-100">
                      {resource.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      {selectedPlace ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-white/10 bg-slate-900/95 p-6 shadow-[0_30px_100px_rgba(2,8,23,0.48)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300">{selectedPlace.category}</p>
                <h5 className="mt-2 text-2xl font-semibold text-white">{selectedPlace.title}</h5>
              </div>
              <button type="button" onClick={() => setSelectedPlace(null)} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/30 hover:bg-cyan-500/10">
                Close
              </button>
            </div>
            <div className="mt-5 space-y-4">
              <p className="text-sm leading-7 text-slate-300">{selectedPlace.description}</p>
              {selectedPlace.aiSummary ? <p className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm leading-7 text-slate-300">{selectedPlace.aiSummary}</p> : null}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Neighborhood</p>
                  <p className="mt-2 text-sm font-semibold text-white">{selectedPlace.neighborhood}</p>
                </div>
                {selectedPlace.rating ? (
                  <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Rating</p>
                    <p className="mt-2 text-sm font-semibold text-white">{selectedPlace.rating}</p>
                  </div>
                ) : null}
                {selectedPlace.distance ? (
                  <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Distance</p>
                    <p className="mt-2 text-sm font-semibold text-white">{selectedPlace.distance}</p>
                  </div>
                ) : null}
                {selectedPlace.metadata && Object.keys(selectedPlace.metadata).length > 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3 sm:col-span-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Why it matters</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {Object.entries(selectedPlace.metadata).map(([key, value]) => (
                        <span key={key} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
                          {key}: {value}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedPlace.mapUrl ? (
                  <a href={selectedPlace.mapUrl} target="_blank" rel="noopener noreferrer" className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyan-200 transition hover:border-cyan-400/40 hover:bg-cyan-500/20">
                    Open on Google Maps
                  </a>
                ) : null}
                {selectedPlace.website ? (
                  <a href={selectedPlace.website} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/30 hover:bg-cyan-500/10">
                    Visit website
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function CanonicalDestinationPage({ destination, developerMode = false }: CanonicalDestinationPageProps) {
  type ViewMode = "guide" | "profile" | "deep";

  const [viewMode, setViewMode] = useState<ViewMode>("guide");
  const [selectedMedia, setSelectedMedia] = useState<GalleryItem | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedView = window.localStorage.getItem("horizon-atlas-view-mode");
    if (storedView === "guide" || storedView === "profile" || storedView === "deep") {
      setViewMode(storedView as ViewMode);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("horizon-atlas-view-mode", viewMode);
  }, [viewMode]);

  const sectionEntries = Object.values(destination.sections ?? {}).sort((left, right) => left.title.localeCompare(right.title));
  const galleryItems = buildGalleryItems(destination).slice(0, 10);
  const mediaDestination = useMemo(() => ({
    slug: destination.slug,
    city: destination.city,
    country: destination.country,
    images: [
      ...(destination.heroImages ?? []),
      ...(destination.mediaGallery ?? []),
      ...(destination.media ?? []),
    ].map((image) => ({ src: image.url, alt: image.altText })),
  } as unknown as Parameters<typeof getDestinationImageSet>[0]), [destination]);
  const resolvedGalleryItems = useMemo(() => {
    const imageSet = getDestinationImageSet(mediaDestination, 5);
    if (imageSet.length > 0) {
      return imageSet.slice(0, 10).map((imageUrl, index) => ({
        kind: index === 0 ? "featured" : "gallery",
        url: imageUrl,
        altText: destination.title,
        caption: index === 0 ? `${destination.title} skyline and civic identity` : `${destination.title} streetscape and daily-life texture`,
        isPrimary: index === 0,
        resolvedUrl: getDestinationImageUrl({ src: imageUrl, alt: destination.title }, mediaDestination),
      }));
    }

    const fallbackUrl = getDestinationImageUrl({ src: "", alt: destination.title }, mediaDestination);
    return [{
      kind: "placeholder",
      url: fallbackUrl,
      altText: destination.title,
      caption: "Editorial destination placeholder • verified imagery pending",
      isPrimary: true,
      resolvedUrl: fallbackUrl,
    }];
  }, [destination.title, mediaDestination]);
  const previewGalleryItems = resolvedGalleryItems.slice(0, 5);
  const galleryModalItems = resolvedGalleryItems.slice(0, 10);
  const hasMoreGalleryItems = resolvedGalleryItems.length > 5;
  const executiveSummaryImage = resolvedGalleryItems[0];
  const openGalleryItem = (item: GalleryItem, index: number) => {
    setSelectedMedia(item);
    setGalleryIndex(index);
  };
  const navigateGallery = (direction: -1 | 1) => {
    if (galleryModalItems.length === 0) return;
    const nextIndex = (galleryIndex + direction + galleryModalItems.length) % galleryModalItems.length;
    setGalleryIndex(nextIndex);
    setSelectedMedia(galleryModalItems[nextIndex] ?? null);
  };
  const premiumEditorialPackage = buildPremiumDestinationEditorialPackage({
    slug: destination.slug,
    city: destination.city,
    country: destination.country,
    emoji: "",
    match: 0,
    description: destination.overview || destination.heroNarrative,
    overview: destination.overview,
    climate: destination.climate,
    lifestyle: destination.dailyLife,
    transportation: destination.transportation,
    images: [],
    tags: [],
    heroNarrative: destination.heroNarrative,
    title: destination.title,
    subtitle: destination.subtitle,
    introduction: destination.heroNarrative,
    researchProfile: {
      overview: destination.overview,
      feel: destination.dailyLife,
      whyPeopleLoveIt: destination.whyThisPlaceFeelsDistinct ? [destination.whyThisPlaceFeelsDistinct] : undefined,
      climate: destination.climate,
      costOfLiving: destination.costOfLiving,
      housing: destination.costOfLiving,
      healthcare: destination.healthcare,
      safety: destination.safety,
      walkability: destination.walkability,
      transportation: destination.transportation,
      internet: destination.internet,
      bestNeighborhoods: destination.neighborhoods,
      pros: destination.pros?.length ? destination.pros : undefined,
      cons: destination.cons?.length ? destination.cons : undefined,
      longStaySuitability: destination.retirement,
      digitalNomadSuitability: destination.digitalNomad,
      familyFriendliness: destination.family,
      bestFor: destination.pros?.length ? [destination.pros[0]] : undefined,
      notIdealFor: destination.cons?.length ? [destination.cons[0]] : undefined,
      localCulture: destination.editorial || destination.overview,
      foodAndDining: destination.dailyLife,
      relocationAdvice: destination.editorial || destination.overview,
      longFormEditorial: destination.editorial || destination.overview,
    },
    premiumEditorialContent: destination.premiumEditorialContent,
    knowledgeProfile: destination.knowledgeProfile,
  });
  const premiumContent = {
    heroIntroduction: premiumEditorialPackage.heroIntroduction,
    overviewArticle: premiumEditorialPackage.overviewArticle,
    whyPeopleLoveIt: premiumEditorialPackage.whyPeopleLoveIt,
    dailyLifeArticle: premiumEditorialPackage.whatItsReallyLike,
    climateArticle: premiumEditorialPackage.climateGuide,
    transportationArticle: premiumEditorialPackage.transportationGuide,
    costOfLivingArticle: premiumEditorialPackage.costOfLivingGuide,
    healthcareArticle: premiumEditorialPackage.healthcareGuide,
    retirementGuide: premiumEditorialPackage.retirementGuide,
    familyGuide: premiumEditorialPackage.familyGuide,
    digitalNomadGuide: premiumEditorialPackage.digitalNomadGuide,
    neighborhoodsArticle: premiumEditorialPackage.neighborhoodGuide,
    neighborhoodGuides: premiumEditorialPackage.neighborhoodGuides,
    scoringNotes: premiumEditorialPackage.scoringNotes,
    prosAndCons: {
      advantages: premiumEditorialPackage.pros,
      disadvantages: premiumEditorialPackage.cons,
    },
    resourceLinks: premiumEditorialPackage.resourceLinks,
  };

  const costProfile = useMemo(() => {
    const profile = destination.costOfLivingProfile;
    const budgets = profile?.budgets?.length ? profile.budgets : destination.monthlyBudgets.map((budget) => ({ label: budget.label, amount: budget.amount, note: budget.note }));
    const categories = profile?.categories?.length ? profile.categories : [
      { key: "housing", label: "Housing", amount: "", note: destination.costOfLiving },
      { key: "food", label: "Food", amount: "", note: destination.dailyLife },
      { key: "transport", label: "Transport", amount: "", note: destination.transportation },
    ].filter((category) => category.note || category.amount);

    return {
      summary: profile?.summary || destination.costOfLiving || premiumContent.costOfLivingArticle,
      currency: profile?.currency || "USD",
      methodology: profile?.methodology || "Modeled from housing, food, transport, and neighborhood assumptions.",
      confidence: profile?.confidence || "medium",
      assumptions: profile?.assumptions || [],
      budgets,
      categories,
    };
  }, [destination.costOfLiving, destination.costOfLivingProfile, destination.dailyLife, destination.monthlyBudgets, destination.transportation, premiumContent.costOfLivingArticle]);

  const essentialFacts = useMemo(() => [
    { label: "Population", value: destination.knowledgeProfile?.population ?? "Local context available", note: "Population helps frame the city’s scale and whether it feels intimate or metropolitan." },
    { label: "Metro population", value: destination.knowledgeProfile?.metroPopulation ?? "Regional context available", note: "The metro explains how far the city’s labor, healthcare, and airport ecosystems extend." },
    { label: "Climate", value: destination.knowledgeProfile?.climateClassification ?? destination.climate ?? "Seasonal shifts matter", note: "Climate influences daily life, outdoor behavior, and long-stay comfort." },
    { label: "Elevation", value: destination.knowledgeProfile?.elevation ?? "Varies by district", note: "Elevation influences weather, views, and how the city feels on the ground." },
    { label: "Average temperatures", value: destination.weather || destination.knowledgeProfile?.rainfall || "Seasonal ranges vary", note: "Temperature patterns are one of the clearest differences between visiting and living somewhere." },
    { label: "Walkability", value: destination.knowledgeProfile?.walkability ?? destination.walkability ?? "Varies by neighborhood", note: "Walkability determines whether daily errands can happen on foot or by transit." },
    { label: "Bikeability", value: destination.knowledgeProfile?.bikeFriendliness ?? destination.walkability ?? "Varies by district", note: "Cycling often changes the feel of a city more than most visitors expect." },
    { label: "Transit", value: destination.knowledgeProfile?.publicTransportation ?? destination.transportation ?? "Transit quality depends on district", note: "Transit turns a city into a daily-life system rather than a postcard image." },
    { label: "Healthcare", value: destination.knowledgeProfile?.healthcareQuality ?? destination.healthcare ?? "Strong medical ecosystem", note: "Healthcare is often the deciding factor for long-stay households and retirees." },
    { label: "Safety", value: destination.knowledgeProfile?.safety ?? destination.safety ?? "Neighborhood dependent", note: "A city’s safety is rarely uniform, so district-level context matters." },
    { label: "Internet", value: destination.knowledgeProfile?.internetSpeed ?? destination.internet ?? "Strong in core districts", note: "Internet quality matters for remote work, digital nomads, and modern households." },
    { label: "Airport access", value: destination.knowledgeProfile?.majorAirports?.join(", ") ?? destination.airportInfo ?? "Regional and international access", note: "Airport access is a major part of relocation ease for families and frequent travelers." },
    { label: "Currency", value: destination.country === "United States" ? "USD" : destination.country === "United Kingdom" ? "GBP" : destination.country === "Japan" ? "JPY" : destination.country === "Thailand" ? "THB" : "Local currency", note: "Currency affects budgeting, transfers, and how a budget feels in practice." },
    { label: "Language", value: destination.country === "United States" ? "English" : destination.country === "Spain" ? "Spanish" : destination.country === "France" ? "French" : destination.country === "Italy" ? "Italian" : destination.country === "Croatia" ? "Croatian" : "Local language", note: "Language shapes the ease of everyday administration and local immersion." },
    { label: "Time zone", value: destination.knowledgeProfile?.timeZone ?? "Local context available", note: "Time-zone fit affects travel, work, and family communication." },
    { label: "Cost level", value: destination.knowledgeProfile?.costOfLiving ?? destination.costOfLiving ?? "Location sensitive", note: "Cost is shaped by housing, utilities, food, and the neighborhood you choose." },
    { label: "Family friendly", value: destination.family || "Strong with the right district", note: "Family friendliness depends on parks, schools, and neighborhood routines." },
    { label: "Retirement friendly", value: destination.retirement || "Highly suitable with the right neighborhood", note: "Retirement fit depends on healthcare, pace, climate, and transport access." },
    { label: "Digital nomad", value: destination.digitalNomad || "Works well with the right base", note: "Remote-work fit depends on internet, cafés, transit, and social energy." },
    { label: "Visa friendly", value: destination.knowledgeProfile?.visaInfo ?? "Requirements depend on citizenship", note: "Visa expectations are essential for long-stay planning and relocation logistics." },
    { label: "Pet friendly", value: destination.knowledgeProfile?.parks?.join(", ") || "Parks and open space matter", note: "Pet-friendliness is shaped by green space, density, and neighborhood culture." },
    { label: "Golf", value: destination.knowledgeProfile?.golf?.join(", ") || "Available with local clubs and courses", note: "Golf availability can be a deciding factor for certain lifestyles." },
    { label: "Museums", value: destination.knowledgeProfile?.museums?.join(", ") || destination.museums.join(", ") || "Cultural depth is a major draw", note: "Museums often define how a city feels to residents over time." },
    { label: "Food scene", value: destination.knowledgeProfile?.restaurants?.join(", ") || destination.restaurants.join(", ") || "Dining is a core part of daily life", note: "Food culture often becomes a daily-life anchor, not just a tourist attraction." },
    { label: "Nightlife", value: destination.knowledgeProfile?.nightlife?.join(", ") || "Varies by district", note: "Nightlife changes the energy of a city from day to night." },
    { label: "Beach", value: destination.knowledgeProfile?.beaches?.join(", ") || "Water access is part of the appeal", note: "Beach access can strongly shape recreation and weekend life." },
    { label: "Mountains", value: destination.knowledgeProfile?.mountains?.join(", ") || "Nature access broadens the city’s identity", note: "Mountains and natural landscapes add a layer of weekend escape." },
    { label: "Parks", value: destination.knowledgeProfile?.parks?.join(", ") || "Green space helps define daily life", note: "Parks shape how a city feels in both weekdays and weekends." },
  ], [destination]);

  const intelligenceProfile = buildDestinationIntelligenceProfile({
    slug: destination.slug,
    city: destination.city,
    country: destination.country,
    title: destination.title,
    subtitle: destination.subtitle,
    description: destination.overview || destination.heroNarrative,
    overview: destination.overview,
    climate: destination.climate,
    lifestyle: destination.dailyLife,
    transportation: destination.transportation,
    tags: [],
    match: destination.scoring?.[0]?.score ?? 0,
    heroNarrative: destination.heroNarrative,
  });
  const scoreCards = destination.scoring.length > 0
    ? destination.scoring
    : [
      { name: "Retirement", weight: 30, score: 76 },
      { name: "Family", weight: 25, score: 74 },
      { name: "Digital nomad", weight: 20, score: 72 },
      { name: "Lifestyle", weight: 25, score: 78 },
    ];

  const coreLinks = [
    { label: "Google Maps", url: destination.googleMapsUrl },
    { label: "Google Earth", url: destination.googleEarthUrl },
    { label: "Official tourism website", url: destination.officialTourismUrl },
    { label: "Wikipedia", url: destination.wikipediaUrl },
    { label: "YouTube", url: destination.youtubeUrl },
    { label: "TikTok", url: destination.tiktokUrl },
    { label: "Instagram", url: destination.instagramUrl },
    { label: "Webcam", url: destination.webcamUrl },
  ].filter((item) => item.url && item.url.trim().length > 0);

  const resourceGroups = buildResourceGroups(destination);

  const neighborhoods = (premiumContent.neighborhoodGuides.length > 0 ? premiumContent.neighborhoodGuides : destination.neighborhoods.slice(0, 4).map((name) => ({ name, whyItWorks: `${name} helps anchor the city’s local character.`, fit: `Best for residents who want a neighborhood identity that feels specific and lived in.`, vibe: `It offers a clear local rhythm and strong daily-life texture.` }))).slice(0, 4);
  const golfGroups = (destination.neighborhoodIntelligence?.length ? destination.neighborhoodIntelligence : buildNeighborhoodIntelligenceSeedData(destination))
    .filter((group) => /golf/i.test(group.category))
    .slice(0, 4);
  const destinationGolfSummary = [
    destination.knowledgeProfile?.golf?.join(", ") || destination.golf?.join(", ") || null,
    golfGroups.length > 0 ? `${golfGroups.length} verified golf-focused neighborhood records` : null,
  ].filter(Boolean).join(" • ");

  const viewTabs: Array<{ id: ViewMode; label: string }> = [
    { id: "guide", label: "Destination Guide" },
    { id: "profile", label: "Premium Profile" },
    { id: "deep", label: "Deep Dive" },
  ];

  const deepDiveSections = [
    {
      title: "Morning rhythm",
      eyebrow: "Daily life",
      summary: premiumContent.dailyLifeArticle || destination.dailyLife,
      body: `${destination.dailyLife}\n\n${destination.editorial}\n\n${destination.overview}`,
    },
    {
      title: "Afternoon reality",
      eyebrow: "Movement",
      summary: premiumContent.transportationArticle || destination.transportation,
      body: `${destination.transportation}\n\n${destination.walkability}\n\n${destination.internet}`,
    },
    {
      title: "Weekend energy",
      eyebrow: "Seasonal living",
      summary: premiumContent.climateArticle || destination.climate,
      body: `${destination.climate}\n\n${destination.weather}\n\n${destination.outdoorRecreation.slice(0, 4).join(" • ") || destination.overview}`,
    },
    {
      title: "Who it suits",
      eyebrow: "Fit and tradeoffs",
      summary: premiumContent.retirementGuide || destination.retirement,
      body: `${destination.retirement}\n\n${destination.family}\n\n${destination.digitalNomad}\n\n${destination.safety}`,
    },
  ];

  const developerToggleHref = developerMode
    ? `/destinations/${destination.slug}`
    : `/destinations/${destination.slug}?developer=1`;

  return (
    <main className="space-y-8 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.12),_transparent_35%),linear-gradient(180deg,_rgba(7,12,30,0.97),_rgba(15,23,42,0.96))] px-3 py-4 text-slate-100 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
      <section className="rounded-[2rem] border border-white/20 bg-slate-900/70 p-7 shadow-[0_30px_90px_rgba(2,8,23,0.28)] backdrop-blur sm:p-9">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">DestinationFinderAI premium guide</span>
          </div>
          <div role="tablist" aria-label="Destination page views" className="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
            {viewTabs.map((tab, index) => {
              const isActive = viewMode === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setViewMode(tab.id)}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowRight") {
                      event.preventDefault();
                      const nextIndex = (index + 1) % viewTabs.length;
                      setViewMode(viewTabs[nextIndex].id);
                    }
                    if (event.key === "ArrowLeft") {
                      event.preventDefault();
                      const nextIndex = (index - 1 + viewTabs.length) % viewTabs.length;
                      setViewMode(viewTabs[nextIndex].id);
                    }
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${isActive ? "bg-cyan-500/15 text-cyan-200 shadow-[0_0_0_1px_rgba(34,211,238,0.15)]" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
        <h1 className="mt-6 text-4xl font-black text-white sm:text-5xl">{destination.title}</h1>
        <p className="mt-3 text-lg text-slate-300">{destination.subtitle}</p>
        <p className="mt-6 max-w-4xl text-base leading-8 text-slate-400">{premiumContent.heroIntroduction}</p>
      </section>

      <section className="rounded-[2rem] border border-white/20 bg-slate-900/70 p-6 shadow-[0_20px_70px_rgba(2,8,23,0.22)] sm:p-8">
        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Executive summary</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">{destination.title} at a glance</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">A 20-second orientation for people deciding whether the city deserves deeper attention. It highlights the essentials without reducing the lived experience to a single score.</p>
          </div>
          <div className="space-y-3">
            <div className="overflow-hidden rounded-[1.5rem] border border-white/20 bg-white/10 shadow-[0_20px_70px_rgba(2,8,23,0.22)]">
              <img src={executiveSummaryImage.resolvedUrl} alt={executiveSummaryImage.altText || destination.title} className="h-[18rem] w-full object-cover sm:h-[20rem]" loading="lazy" decoding="async" />
              <div className="p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300">Featured image</p>
                <p className="mt-2 text-sm font-semibold text-white">{destination.city} at a glance</p>
                <p className="mt-2 text-xs leading-6 text-slate-400">{destination.overview}</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {essentialFacts.slice(0, 8).map((fact) => (
                <div key={fact.label} className="rounded-2xl border border-white/15 bg-white/10 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{fact.label}</p>
                  <p className="mt-2 text-sm font-semibold text-white">{fact.value}</p>
                  <p className="mt-2 text-xs leading-6 text-slate-400">{fact.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {essentialFacts.slice(8).map((fact) => (
            <div key={fact.label} className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{fact.label}</p>
              <p className="mt-2 text-sm font-semibold text-white">{fact.value}</p>
              <p className="mt-2 text-xs leading-6 text-slate-400">{fact.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/20 bg-slate-900/70 p-8 shadow-[0_20px_70px_rgba(2,8,23,0.22)] sm:p-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Cost of living snapshot</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">A practical executive summary for residents and relocators</h2>
          </div>
          <p className="text-sm text-slate-400">{costProfile.budgets.length} budget bands</p>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.5rem] border border-cyan-400/20 bg-cyan-500/10 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300">Executive summary</p>
            <p className="mt-3 text-sm leading-8 text-slate-200">{costProfile.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-slate-300">
              <span className="rounded-full border border-white/10 bg-slate-950/40 px-3 py-2">{costProfile.currency}</span>
              <span className="rounded-full border border-white/10 bg-slate-950/40 px-3 py-2">{costProfile.confidence} confidence</span>
            </div>
          </div>
          <div className="space-y-3 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            {costProfile.budgets.length > 0 ? costProfile.budgets.map((budget) => (
              <div key={budget.label} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <p className="text-sm font-semibold text-white">{budget.label}</p>
                <p className="mt-2 text-lg font-semibold text-cyan-300">{budget.amount}</p>
                {budget.note ? <p className="mt-2 text-sm leading-7 text-slate-300">{budget.note}</p> : null}
              </div>
            )) : null}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/20 bg-slate-900/70 p-8 shadow-[0_20px_70px_rgba(2,8,23,0.22)] sm:p-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Monthly cost breakdown</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">The detailed budget categories that shape the monthly picture</h2>
          </div>
          <p className="text-sm text-slate-400">{costProfile.categories.length} live categories</p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {costProfile.categories.length > 0 ? costProfile.categories.map((category) => (
            <div key={category.key} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">{category.label}</p>
              {category.amount ? <p className="mt-2 text-lg font-semibold text-cyan-300">{category.amount}</p> : null}
              {category.note ? <p className="mt-2 text-sm leading-7 text-slate-300">{category.note}</p> : null}
            </div>
          )) : null}
        </div>
        <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300">How the estimate is framed</p>
          <p className="mt-3 text-sm leading-8 text-slate-300">{costProfile.methodology}</p>
          {costProfile.assumptions.length > 0 ? (
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-300">
              {costProfile.assumptions.map((item) => <li key={item}>{item}</li>)}
            </ul>
          ) : null}
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/20 bg-slate-900/70 p-8 shadow-[0_20px_70px_rgba(2,8,23,0.22)] sm:p-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Media and atmosphere</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Photos, streets, and daily life</h2>
          </div>
          <p className="text-sm text-slate-400">{galleryItems.length} curated assets</p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {previewGalleryItems.map((item, index) => (
            <button key={`${item.url}-${index}`} type="button" onClick={() => openGalleryItem(item, index)} className="overflow-hidden rounded-[1.5rem] border border-white/15 bg-white/10 text-left shadow-[0_20px_70px_rgba(2,8,23,0.2)] transition duration-200 hover:-translate-y-1">
              <img src={item.resolvedUrl} alt={item.altText || item.caption || destination.title} loading="lazy" decoding="async" className="h-56 w-full object-cover" />
              <div className="p-4 text-sm leading-7 text-slate-300">{item.caption || item.altText || item.kind}</div>
            </button>
          ))}
        </div>
        {hasMoreGalleryItems ? (
          <div className="mt-6 flex justify-start">
            <button type="button" onClick={() => openGalleryItem(previewGalleryItems[0], 0)} className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:border-cyan-400/50 hover:bg-cyan-500/20">
              View More Images
            </button>
          </div>
        ) : null}
      </section>

      {selectedMedia ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm" onClick={() => setSelectedMedia(null)}>
          <div className="relative max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/20 bg-slate-900/95 p-3 shadow-[0_30px_90px_rgba(2,8,23,0.35)]" onClick={(event) => event.stopPropagation()}>
            <div className="flex flex-wrap items-center justify-between gap-3 px-2 py-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">Destination imagery</p>
                <p className="mt-1 text-sm text-slate-400">{galleryIndex + 1} of {galleryModalItems.length}</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => navigateGallery(-1)} className="rounded-full border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-white">← Prev</button>
                <button type="button" onClick={() => navigateGallery(1)} className="rounded-full border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-white">Next →</button>
                <button type="button" onClick={() => setSelectedMedia(null)} className="rounded-full border border-white/15 bg-slate-950/70 px-3 py-2 text-sm font-semibold text-white">Close</button>
              </div>
            </div>
            <div className="mt-3 overflow-hidden rounded-[1.5rem]">
              <img src={selectedMedia.resolvedUrl ?? selectedMedia.url} alt={selectedMedia.altText || selectedMedia.caption || destination.title} className="max-h-[72vh] w-full rounded-[1.5rem] object-contain transition duration-300" />
            </div>
            <p className="mt-3 px-2 text-sm leading-7 text-slate-300">{selectedMedia.caption || selectedMedia.altText || selectedMedia.kind}</p>
          </div>
        </div>
      ) : null}

      {viewMode === "guide" ? (
        <>
          <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-[0_20px_60px_rgba(2,8,23,0.16)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Destination guide</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">A magazine-style introduction to {destination.title}</h2>
              </div>
            </div>
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Fast overview</p>
                <p className="mt-3 text-sm leading-8 text-slate-400">{premiumContent.overviewArticle || destination.overview}</p>
                <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300">What you'll learn</p>
                  <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-200">
                    <li>• Whether the destination deserves serious consideration</li>
                    <li>• Which facts matter most before you dig deeper</li>
                    <li>• The lifestyle qualities that make the place feel distinct</li>
                  </ul>
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">What to know first</p>
                <div className="mt-3 space-y-2">
                  {essentialFacts.slice(0, 6).map((fact) => (
                    <div key={fact.label} className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-3">
                      <span className="text-sm text-slate-400">{fact.label}</span>
                      <span className="text-right text-sm font-semibold text-white">{fact.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-[0_20px_60px_rgba(2,8,23,0.16)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">What makes it distinctive</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">The qualities that shape daily life</h2>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-2">
              {premiumContent.whyPeopleLoveIt.slice(0, 4).map((item) => (
                <ExpandableInsightCard key={item} title="Why it works" summary={item} body={item} />
              ))}
            </div>
          </section>
        </>
      ) : viewMode === "profile" ? (
        <>
          <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-[0_20px_60px_rgba(2,8,23,0.16)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Premium intelligence</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">Scores and fit</h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-3xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200">{scoreCards.length} decision lenses</div>
            <Link href={developerToggleHref} className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/40 hover:text-cyan-200">
              {developerMode ? "Exit developer view" : "Open developer view"}
            </Link>
          </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {scoreCards.map((category) => (
                <div key={category.name} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white">{category.name}</p>
                  <p className="mt-3 text-3xl font-black text-cyan-300">{category.score}/100</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">{category.weight}% weight</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <article className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-[0_20px_60px_rgba(2,8,23,0.16)]">
              <h2 className="text-2xl font-semibold text-white">Lifestyle at a glance</h2>
              <p className="mt-4 text-sm leading-8 text-slate-400">{premiumContent.dailyLifeArticle || destination.dailyLife}</p>
              <div className="mt-6 space-y-4">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300">Daily life</p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">{destination.dailyLife}</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300">Lifestyle fit</p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">{destination.retirement} {destination.family}</p>
                </div>
              </div>
            </article>
            {destinationGolfSummary ? (
              <article className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-[0_20px_60px_rgba(2,8,23,0.16)]">
                <h2 className="text-2xl font-semibold text-white">Golf access</h2>
                <p className="mt-4 text-sm leading-8 text-slate-400">{destinationGolfSummary}</p>
                {golfGroups.length > 0 ? (
                  <div className="mt-6 space-y-3">
                    {golfGroups.map((group) => (
                      <div key={`${group.neighborhoodName}-${group.category}`} className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300">{group.neighborhoodName || destination.city}</p>
                        <p className="mt-2 text-sm font-semibold text-white">{group.category}</p>
                        <p className="mt-2 text-sm leading-7 text-slate-300">{group.places?.find((place) => place?.verified)?.name || "Verified golf options are available for this neighborhood."}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </article>
            ) : null}
            <article className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-[0_20px_60px_rgba(2,8,23,0.16)]">
              <h2 className="text-2xl font-semibold text-white">Cost of living</h2>
              <p className="mt-4 text-sm leading-8 text-slate-400">{intelligenceProfile.heroSummary}</p>
              <div className="mt-6 rounded-[1.5rem] border border-cyan-400/20 bg-cyan-500/10 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300">Structured profile</p>
                <p className="mt-3 text-sm leading-7 text-slate-200">{costProfile.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-slate-300">
                  <span className="rounded-full border border-white/10 bg-slate-950/40 px-3 py-2">{costProfile.currency}</span>
                  <span className="rounded-full border border-white/10 bg-slate-950/40 px-3 py-2">{costProfile.confidence} confidence</span>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-300">{costProfile.methodology}</p>
                {costProfile.assumptions.length > 0 ? (
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-300">
                    {costProfile.assumptions.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                ) : null}
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {costProfile.categories.length > 0 ? costProfile.categories.map((category) => (
                  <div key={category.key} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-semibold text-white">{category.label}</p>
                    {category.amount ? <p className="mt-2 text-lg font-semibold text-cyan-300">{category.amount}</p> : null}
                    {category.note ? <p className="mt-2 text-sm leading-7 text-slate-300">{category.note}</p> : null}
                  </div>
                )) : null}
              </div>
              <div className="mt-6 space-y-4">
                {costProfile.budgets.length > 0 ? costProfile.budgets.map((budget) => (
                  <div key={budget.label} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-semibold text-white">{budget.label}</p>
                    <p className="mt-2 text-lg font-semibold text-cyan-300">{budget.amount}</p>
                    {budget.note ? <p className="mt-2 text-sm leading-7 text-slate-300">{budget.note}</p> : null}
                  </div>
                )) : <p className="text-sm leading-8 text-slate-400">{premiumContent.costOfLivingArticle}</p>}
              </div>
            </article>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-[0_20px_60px_rgba(2,8,23,0.16)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Pros and cons</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">Where the city feels strongest and where it asks more of you</h2>
              </div>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Pros</h3>
                <ul className="mt-3 space-y-2">
                  {destination.pros.length > 0 ? destination.pros.map((item) => <li key={item} className="text-sm leading-7 text-slate-300">• {item}</li>) : premiumContent.prosAndCons.advantages.map((item) => <li key={item} className="text-sm leading-7 text-slate-300">• {item}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-300">Cons</h3>
                <ul className="mt-3 space-y-2">
                  {destination.cons.length > 0 ? destination.cons.map((item) => <li key={item} className="text-sm leading-7 text-slate-300">• {item}</li>) : premiumContent.prosAndCons.disadvantages.map((item) => <li key={item} className="text-sm leading-7 text-slate-300">• {item}</li>)}
                </ul>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-[0_20px_60px_rgba(2,8,23,0.16)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Neighborhood summary</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">How the city is experienced block by block</h2>
              </div>
              <div className="rounded-3xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200">{neighborhoods.length} flagship districts</div>
            </div>
            <div className="mt-6 space-y-4">
              {neighborhoods.map((neighborhood, index) => (
                <ExpandableNeighborhoodCard key={neighborhood.name} neighborhood={neighborhood} index={index} destination={destination} />
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-[0_20px_60px_rgba(2,8,23,0.16)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Maps and resources</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">Discovery links grouped by category</h2>
              </div>
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {coreLinks.length > 0 ? (
                <div className="space-y-3 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  {coreLinks.map((item) => (
                    <a key={item.label} href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-300">
                      <span>{item.label}</span>
                      <span className="text-cyan-300">Open</span>
                    </a>
                  ))}
                </div>
              ) : null}
              <div className="space-y-4">
                {resourceGroups.map((group) => (
                  <div key={group.title} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">{group.title}</p>
                    <div className="mt-3 space-y-2">
                      {group.items.filter((resource) => resource.url && resource.url.trim().length > 0).slice(0, 4).map((resource) => (
                        <a key={`${group.title}-${resource.label}`} href={resource.url} target="_blank" rel="noopener noreferrer" className="block rounded-2xl border border-white/10 bg-slate-950/30 px-3 py-3 text-sm text-slate-300">
                          {resource.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      ) : (
        <div className="space-y-8">
          <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-[0_20px_60px_rgba(2,8,23,0.16)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Editorial overview</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">Overview</h2>
              </div>
              <div className="rounded-3xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200">{getReadTime(premiumContent.overviewArticle)}</div>
            </div>
            <div className="mt-6 space-y-4">
              <PremiumSectionBlock title="Overview" summary={premiumContent.overviewArticle} body="" readTime={getReadTime(premiumContent.overviewArticle)} eyebrow="Editorial" />
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-[0_20px_60px_rgba(2,8,23,0.16)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Editorial overview</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">The living rhythms that shape the place</h2>
              </div>
            </div>
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              {deepDiveSections.map((section) => (
                <PremiumSectionBlock key={section.title} title={section.title} summary={section.summary} body={section.body} readTime={getReadTime(section.body)} eyebrow={section.eyebrow} />
              ))}
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <PremiumSectionBlock title="Daily life" summary={premiumContent.dailyLifeArticle} body={`Morning: ${destination.heroNarrative}\n\nAfternoon: ${destination.dailyLife}\n\nEvening: ${destination.editorial}\n\nWeekend: ${destination.overview}\n\nSeasonal rhythm: ${destination.climate}`} readTime={getReadTime(premiumContent.dailyLifeArticle)} eyebrow="Living there" />
            <PremiumSectionBlock title="Climate" summary={premiumContent.climateArticle} body={destination.climate} readTime={getReadTime(premiumContent.climateArticle)} eyebrow="Weather" />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <PremiumSectionBlock title="Transportation" summary={premiumContent.transportationArticle} body={`Airport access: ${destination.airportInfo || destination.knowledgeProfile?.majorAirports?.join(", ") || "Regional and international access"}\n\nTransit: ${destination.transportation}\n\nCar dependency: ${destination.transportation}\n\nWalking and cycling: ${destination.walkability}\n\nTypical commute: ${destination.transportation}`} readTime={getReadTime(premiumContent.transportationArticle)} eyebrow="Movement" />
            <PremiumSectionBlock title="Cost of living" summary={premiumContent.costOfLivingArticle} body={`Monthly budgets: ${destination.monthlyBudgets.map((budget) => `${budget.label}: ${budget.amount}`).join(" • ")}\n\nRent: ${destination.costOfLiving}\n\nUtilities: ${destination.costOfLiving}\n\nFood: ${destination.dailyLife}\n\nHealthcare: ${destination.healthcare}\n\nTransportation: ${destination.transportation}\n\nEntertainment: ${destination.editorial}\n\nTaxes: ${destination.costOfLiving}`} readTime={getReadTime(premiumContent.costOfLivingArticle)} eyebrow="Economics" />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <PremiumSectionBlock title="Healthcare" summary={premiumContent.healthcareArticle} body={`Top hospitals: ${destination.knowledgeProfile?.majorHospitals?.join(", ") || destination.healthcare}\n\nSpecialty care: ${destination.healthcare}\n\nInsurance quality: ${destination.healthcare}\n\nEmergency care: ${destination.healthcare}\n\nRetirement healthcare: ${destination.retirement}\n\nMedical tourism: ${destination.healthcare}`} readTime={getReadTime(premiumContent.healthcareArticle)} eyebrow="Wellness" />
            <PremiumSectionBlock title="Retirement" summary={premiumContent.retirementGuide} body={`Ideal retiree profile: ${destination.retirement}\n\nWho should retire here: ${destination.retirement}\n\nWho should not: ${destination.cons.join(", ") || destination.editorial}\n\nBest neighborhoods: ${destination.neighborhoods.join(", ") || "A strong district match matters"}\n\nClimate considerations: ${destination.climate}\n\nHealthcare considerations: ${destination.healthcare}\n\nLifestyle: ${destination.dailyLife}\n\nTaxes: ${destination.costOfLiving}`} readTime={getReadTime(premiumContent.retirementGuide)} eyebrow="Retirement" />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <PremiumSectionBlock title="Family" summary={premiumContent.familyGuide} body={`School quality: ${destination.family}\n\nActivities: ${destination.dailyLife}\n\nSafety: ${destination.safety}\n\nParks: ${destination.knowledgeProfile?.parks?.join(", ") || destination.overview}\n\nMuseums: ${destination.knowledgeProfile?.museums?.join(", ") || destination.museums.join(", ") || destination.overview}\n\nSports: ${destination.knowledgeProfile?.sports?.join(", ") || destination.overview}\n\nHealthcare: ${destination.healthcare}\n\nNeighborhood recommendations: ${destination.neighborhoods.join(", ") || destination.city}`} readTime={getReadTime(premiumContent.familyGuide)} eyebrow="Family" />
            <PremiumSectionBlock title="Digital nomad" summary={premiumContent.digitalNomadGuide} body={`Internet: ${destination.internet}\n\nCoworking: ${destination.dailyLife}\n\nCoffee shops: ${destination.knowledgeProfile?.coffeeShops?.join(", ") || destination.dailyLife}\n\nRemote work: ${destination.digitalNomad}\n\nCommunity: ${destination.overview}\n\nVisa: ${destination.knowledgeProfile?.visaInfo || "Requirements vary by citizenship"}\n\nMonthly costs: ${destination.monthlyBudgets.map((budget) => `${budget.label}: ${budget.amount}`).join(" • ")}\n\nBest neighborhoods: ${destination.neighborhoods.join(", ") || destination.city}`} readTime={getReadTime(premiumContent.digitalNomadGuide)} eyebrow="Remote work" />
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-[0_20px_60px_rgba(2,8,23,0.16)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Flagship neighborhoods</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">Premium neighborhood cards</h2>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {neighborhoods.map((neighborhood, index) => (
                <ExpandableNeighborhoodCard key={neighborhood.name} neighborhood={neighborhood} index={index} destination={destination} />
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-[0_20px_60px_rgba(2,8,23,0.16)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Scores and explanations</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">Why the destination scores the way it does</h2>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {scoreCards.map((category) => (
                <ExpandableInsightCard
                  key={category.name}
                  title={category.name}
                  summary={`${category.score}/100 — ${category.weight}% weight`}
                  body={premiumContent.scoringNotes.find((note) => note.category.toLowerCase() === category.name.toLowerCase())?.note || getScoreReason(category.name, destination)}
                />
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-[0_20px_60px_rgba(2,8,23,0.16)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Resources</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">Maps, housing, healthcare, and local intelligence</h2>
              </div>
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {coreLinks.length > 0 ? (
                <div className="space-y-3 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  {coreLinks.map((item) => (
                    <a key={item.label} href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-300">
                      <span>{item.label}</span>
                      <span className="text-cyan-300">Open</span>
                    </a>
                  ))}
                </div>
              ) : null}
              <div className="space-y-4">
                {resourceGroups.map((group) => (
                  <div key={group.title} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">{group.title}</p>
                    <div className="mt-3 space-y-2">
                      {group.items.filter((resource) => resource.url && resource.url.trim().length > 0).slice(0, 4).map((resource) => (
                        <a key={`${group.title}-${resource.label}`} href={resource.url} target="_blank" rel="noopener noreferrer" className="block rounded-2xl border border-white/10 bg-slate-950/30 px-3 py-3 text-sm text-slate-300">
                          {resource.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-[0_20px_60px_rgba(2,8,23,0.16)]">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold text-white">Media gallery</h2>
              <span className="text-sm uppercase tracking-[0.24em] text-slate-400">{galleryItems.length} verified assets</span>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {resolvedGalleryItems.map((item, index) => (
                <button key={`${item.url}-${index}`} type="button" onClick={() => setSelectedMedia(item)} className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 text-left">
                  <img src={item.resolvedUrl} alt={item.altText || item.caption || destination.title} loading="lazy" decoding="async" className="h-48 w-full object-cover" />
                  <div className="p-4 text-sm leading-7 text-slate-300">{item.caption || item.altText || item.kind}</div>
                </button>
              ))}
            </div>
          </section>

          {sectionEntries.length > 0 ? (
            <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-[0_20px_60px_rgba(2,8,23,0.16)]">
              <h2 className="text-2xl font-semibold text-white">Structured editorial sections</h2>
              <div className="mt-6 space-y-4">
                {sectionEntries.map((section) => (
                  <PremiumSectionBlock key={section.id} title={section.title} summary={section.content} body={section.content} readTime={getReadTime(section.content)} eyebrow="Editorial section" />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}

      {developerMode ? (
        <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-[0_20px_60px_rgba(2,8,23,0.16)]">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-white">Developer enrichment status</h2>
            <span className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">{destination.ai.status}</span>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Version</p>
              <p className="mt-2 text-white">{destination.ai.version}</p>
            </div>
            <div className="rounded-3xl bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Confidence</p>
              <p className="mt-2 text-white">{destination.ai.confidenceScore.toFixed(2)}</p>
            </div>
            <div className="rounded-3xl bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Sources</p>
              <p className="mt-2 text-white">{destination.ai.sourcesUsed.length}</p>
            </div>
          </div>
        </section>
      ) : null}

      {developerMode ? (
        <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-[0_20px_60px_rgba(2,8,23,0.16)]">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-white">Structured resources</h2>
            <Link href="/admin" className="text-sm font-semibold text-cyan-300">Open admin</Link>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {destination.resources.map((resource) => (
              <a key={`${resource.category}-${resource.label}`} href={resource.url} target="_blank" rel="noreferrer" className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                <p className="font-semibold text-white">{resource.label}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-cyan-300">{resource.category}</p>
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
