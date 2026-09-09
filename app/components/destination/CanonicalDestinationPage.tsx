"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CanonicalDestination, NeighborhoodIntelligenceGroup, NeighborhoodIntelligenceMetric, NeighborhoodIntelligencePlace, NeighborhoodProfile, NeighborhoodResourceItem } from "../../lib/canonical-destination-model";
import { buildDestinationIntelligenceProfile } from "../../lib/destination-intelligence-engine";
import { getDestinationHeroImage, getDestinationImageSet, getDestinationImageUrl } from "../../lib/imageFallback";
import { buildNeighborhoodIntelligenceSeedData } from "../../lib/neighborhood-intelligence-seed-data";
import { buildPremiumDestinationEditorialPackage } from "../../lib/premium-destination-engine";
import { isPlaceWebsiteVisible } from "../../lib/website-verification";
import { containsUnpublishablePlaceholderLanguage, sanitizePublicText } from "../../lib/sanitize-public-text";
import Footer from "../Footer";
import LifestyleRecreationSection from "./LifestyleRecreationSection";
import Navbar from "../Navbar";

interface CanonicalDestinationPageProps {
  destination: CanonicalDestination;
  developerMode?: boolean;
}

function getMediaIdentity(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    const pathname = decodeURIComponent(parsed.pathname);
    if (parsed.hostname === "upload.wikimedia.org") {
      const thumbnailPrefix = "/wikipedia/commons/thumb/";
      if (pathname.startsWith(thumbnailPrefix)) {
        const parts = pathname.slice(thumbnailPrefix.length).split("/");
        if (parts.length >= 4) return `wikimedia:${parts.slice(0, -1).join("/")}`;
      }
      const originalPrefix = "/wikipedia/commons/";
      if (pathname.startsWith(originalPrefix)) {
        return `wikimedia:${pathname.slice(originalPrefix.length)}`;
      }
    }
    return `${parsed.origin}${pathname}`;
  } catch {
    return rawUrl.trim();
  }
}

function dedupeMediaUrls(urls: readonly string[]): string[] {
  const seen = new Set<string>();
  return urls.filter((url) => {
    const identity = getMediaIdentity(url);
    if (!identity || seen.has(identity)) return false;
    seen.add(identity);
    return true;
  });
}

// Shared, single source of truth for the sticky tab bar - anchor targets/labels are unchanged
// from the existing section ids; only presentation (prominence, descriptor, active state) changed.
const SECTION_TABS: ReadonlyArray<{ id: string; label: string; descriptor: string }> = [
  { id: "destination-guide", label: "Destination Guide", descriptor: "Overview and neighborhoods" },
  { id: "practical-details", label: "Practical Details", descriptor: "Costs, transportation, and setup" },
  { id: "deep-dive", label: "Deep Dive", descriptor: "Detailed local intelligence" },
];

function buildGalleryItems(destination: CanonicalDestination) {
  const sources = [
    ...(destination.heroImages ?? []),
    ...(destination.mediaGallery ?? []),
    ...(destination.media ?? []),
  ];

  const seen = new Set<string>();
  return sources.filter((item) => {
    if (!item?.url) return false;
    const identity = getMediaIdentity(item.url);
    if (seen.has(identity)) return false;
    seen.add(identity);
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

// Builds a PremiumSectionBlock body from labeled candidate lines, but never maps the same
// underlying value into more than one granular label - if a later label would just repeat an
// earlier one verbatim (case-insensitive), it is silently omitted rather than shown twice. Blank
// values are omitted outright. This never fabricates replacement content; it only hides
// duplication that would otherwise misrepresent one real field as several distinct ones.
function buildDedupedSectionBody(pairs: ReadonlyArray<readonly [string, string | null | undefined]>): string {
  const seen = new Set<string>();
  const lines: string[] = [];
  for (const [label, rawValue] of pairs) {
    const value = typeof rawValue === "string" ? rawValue.trim() : "";
    if (!value) continue;
    const normalized = value.toLowerCase();
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    lines.push(`${label}: ${value}`);
  }
  return lines.join("\n\n");
}

// Within a single rendered grid, two differently-labeled cards can end up carrying the exact same
// underlying evidence (e.g. two cards both built from the same source module). This compares each
// card's complete, normalized line content against every earlier card in the same list and drops
// an exact repeat - never a fuzzy/partial match, and never a card that merely shares one sentence.
function dedupeCardsByNormalizedValue<T extends { lines: readonly string[] }>(cards: readonly T[]): T[] {
  const seen = new Set<string>();
  return cards.filter((card) => {
    const normalized = card.lines.map((line) => line.trim().toLowerCase().replace(/\s+/g, " ")).join("\n");
    if (!normalized) return true;
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

// The workbook's SAFETY_RISKS sheet is a mixed-content sheet: most rows describe environmental/
// natural-hazard risk (flood, earthquake, heat, storms, wind, isolation, etc.), but a real
// personal-safety/crime-relevant risk_type occasionally appears (e.g. "petty_theft", "fraud", or a
// composite like "hurricane-flood-crime"). Classifying by the structured risk_type token itself -
// never by reading/guessing from the free-text summary - keeps this deterministic.
const PERSONAL_SAFETY_TOPIC_PATTERN = /theft|fraud|crime|mugg|robbery|assault|scam|burglary|pickpocket|violent/i;
function isPersonalSafetyTopic(topic: string | null): boolean {
  return Boolean(topic) && PERSONAL_SAFETY_TOPIC_PATTERN.test(topic as string);
}
// A composite topic (e.g. "hurricane-flood-crime") is genuinely about both categories, so it is
// never excluded from the environmental bucket just because it also matches the personal-safety
// pattern - only a row whose topic is exclusively personal-safety content is excluded from here.
const ENVIRONMENTAL_TOPIC_PATTERN = /flood|storm|hurricane|earthquake|seismic|heat|cold|snow|ice|wind|fog|wildfire|drought|typhoon|volcano|landslide|traffic|altitude|humidity|monsoon|air_pollution|outdoor_risk|isolation|infrastructure/i;
function isEnvironmentallyRelevantTopic(topic: string | null): boolean {
  if (!topic) return true;
  if (ENVIRONMENTAL_TOPIC_PATTERN.test(topic)) return true;
  return !isPersonalSafetyTopic(topic);
}

// A destination-level score dimension can be authored on either a 0-10 or a 0-100 scale (see
// scoreCards below) - this shared normalizer is used for both the public score bars and the
// personal-safety plain-language distinction so the same rule is applied everywhere a raw score
// value needs to become a 0-100 figure. The stored workbook value itself is never altered.
function normalizeScoreToHundred(rawValue: number): number {
  return rawValue > 0 && rawValue <= 10 ? Math.round(rawValue * 10) : Math.round(rawValue);
}

// Neighborhood-level safety_rating vocabulary is not identical across every workbook (pilot-06
// uses Good/Very good/Mixed; Batch #2 uses High/Moderate/etc.) - classify by an explicit known-term
// lookup rather than guessing, so an unrecognized value never silently reads as either tier.
const POSITIVE_SAFETY_RATING_TERMS = new Set(["good", "very good", "high", "very high", "excellent", "strong"]);
const CAUTION_SAFETY_RATING_TERMS = new Set(["mixed", "moderate", "fair", "variable", "low", "poor", "very low"]);
function classifySafetyRatingTier(value: string): "positive" | "caution" | "unknown" {
  const normalized = value.trim().toLowerCase();
  if (POSITIVE_SAFETY_RATING_TERMS.has(normalized)) return "positive";
  if (CAUTION_SAFETY_RATING_TERMS.has(normalized)) return "caution";
  return "unknown";
}

const PERSONAL_SAFETY_NOT_DOCUMENTED = "PERSONAL SAFETY NOT YET DOCUMENTED for this destination - treat as unknown, not as safe or unsafe.";

// Correct field-to-label mapping for "Personal safety", applied identically for every workbook-
// backed destination (Batch #1, Batch #2, and the legacy migrations): prefers a real crime/theft-
// relevant SAFETY_RISKS narrative, then a destination-level "safety" score dimension where one
// exists, then real per-neighborhood safety_rating variation - never weather/environmental content,
// and never a guess when none of these exist.
function buildPersonalSafetySignal(destination: CanonicalDestination): { value: string; documented: boolean } {
  const modules = destination.v31Modules;
  const narrativeLines = modules
    ? modules.safetyRisks
        .filter((row) => isPersonalSafetyTopic(row.topic))
        .map((row) => sanitizePublicText(row.summary))
        .filter((value): value is string => value !== null)
    : [];

  const safetyScore = modules?.scores.find((score) => score.scoreKey === "safety");
  const scoreDistinction = (() => {
    if (!safetyScore?.scoreValue) return null;
    const raw = Number(safetyScore.scoreValue);
    if (!Number.isFinite(raw)) return null;
    const scaled = normalizeScoreToHundred(raw);
    if (scaled >= 80) return "The destination's overall safety score suggests generally low personal-safety concern.";
    if (scaled >= 60) return "The destination's overall safety score suggests normal urban precautions are appropriate.";
    return "The destination's overall safety score suggests heightened personal-safety caution is warranted.";
  })();

  const neighborhoodRatings = (modules?.neighborhoods ?? [])
    .map((item) => item.safetyRating)
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0);
  const tiers = neighborhoodRatings.map(classifySafetyRatingTier);
  const neighborhoodNote = tiers.length === 0
    ? null
    : tiers.includes("caution")
    ? "Neighborhood-level evidence shows meaningful variation - some areas warrant more caution than others, especially after dark."
    : tiers.every((tier) => tier === "positive")
    ? "Neighborhood-level evidence is consistently favorable across the districts covered here."
    : "Neighborhood-level safety evidence exists and varies by district - check the specific area before assuming citywide consistency.";

  const parts = [...narrativeLines, scoreDistinction, neighborhoodNote].filter((value): value is string => Boolean(value));
  if (parts.length === 0) {
    return { value: PERSONAL_SAFETY_NOT_DOCUMENTED, documented: false };
  }
  return { value: parts.join(" "), documented: true };
}

type GalleryItem = {
  kind: string;
  url: string;
  altText: string;
  caption: string;
  isPrimary?: boolean;
  resolvedUrl: string;
  attribution?: string;
  sourceUrl?: string;
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

// Structured PLACES categories that represent a genuine clinical healthcare facility (hospital,
// clinic, urgent care) - matched against the structured category_key field only, never derived
// from narrative text. Deliberately excludes non-clinical categories like "wellness" (spas, cloud
// forest resorts, etc. observed in the source data) so a wellness/resort venue is never presented
// as a hospital or clinic.
const HEALTHCARE_PLACE_CATEGORIES = new Set(["hospital", "healthcare", "urgent_care"]);

// Real, structured named facilities (from the destination's own persisted PLACES rows) only - never
// a researched or invented facility, and never rendered at all when a destination has none.
function buildStructuredHealthcareFacilityItems(destination: CanonicalDestination): NeighborhoodResourceItem[] {
  const places = destination.v31Modules?.places ?? [];
  const seenNames = new Set<string>();
  const items: NeighborhoodResourceItem[] = [];
  for (const place of places) {
    if (!place.category || !HEALTHCARE_PLACE_CATEGORIES.has(place.category)) continue;
    const name = (place.name ?? "").trim();
    if (!name || seenNames.has(name)) continue;
    seenNames.add(name);
    const generatedUrl = buildNeighborhoodSearchUrl([name, destination.city, destination.country].filter(Boolean).join(" "), "maps");
    const url = place.websiteUrl || place.googleMapsUrl || generatedUrl;
    items.push({ category: "healthcare", label: name, url, kind: place.websiteUrl || place.googleMapsUrl ? "dataset" : "generated" });
  }
  return items;
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
    { title: "Hotels", items: resources.filter((resource) => /hotel/i.test(resource.category)) },
    { title: "Vacation Rentals", items: resources.filter((resource) => /vacation-stays/i.test(resource.category)) },
    { title: "Housing", items: resources.filter((resource) => /housing|real estate|rental|property/i.test(resource.category)) },
    { title: "Healthcare", items: [...resources.filter((resource) => /health|medical|hospital|clinic|care/i.test(resource.category)), ...buildStructuredHealthcareFacilityItems(destination)] },
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
    { title: "Social Discovery", items: resources.filter((resource) => /social-discovery/i.test(resource.category)) },
  ]
    .map((group) => ({ ...group, items: dedupeResourceItems(group.items as unknown as NeighborhoodResourceItem[]) }))
    .filter((group) => group.items.length > 0);

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

function getNeighborhoodProfile(destination: CanonicalDestination, neighborhoodName: string) {
  const normalizedName = normalizeText(neighborhoodName);
  if (!normalizedName) return undefined;

  return destination.neighborhoodProfiles?.find((profile) => normalizeText(profile.name) === normalizedName);
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
      // Note: "air" is deliberately "air quality" (not a bare substring) - a bare /air/ pattern
      // false-matched "Search Airbnb" and "Find airport transfers" (regression introduced by the
      // generic Travel-resource system's new labels), incorrectly surfacing destination-level
      // travel-search utilities inside this neighborhood-scoped live/weather/webcam widget.
      .filter((resource) => /weather|traffic|air quality|transit|sunrise|sunset|live|webcam|camera/i.test(resource.category) || /weather|traffic|air quality|transit|sunrise|sunset|live|webcam|camera/i.test(resource.label))
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

/**
 * Strips author-facing editorial instructions (e.g. "retain as `UNKNOWN` until ...") and internal
 * "search_zone" wording that should never reach public place/description text, without altering
 * any genuinely authored content. Never touches the workbook itself - presentation-layer only.
 */
function sanitizePublicPlaceText(value: string | undefined | null): string | undefined {
  if (typeof value !== "string") return undefined;
  let text = value.trim();
  if (!text) return undefined;
  text = text.replace(/\s*Source:\s*https?:\/\/\S+\s*$/i, "").trim();
  text = text.replace(/,?\s*retain as `?unknown`?[^.]*\.?/gi, "").trim();
  text = text.replace(/\bsearch_zone\b/gi, "this area").trim();
  if (!text || containsUnpublishablePlaceholderLanguage(text)) return undefined;
  return text.length > 0 ? text : undefined;
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
    metadata: {},
  } satisfies NeighborhoodInsightPlace;
}

function buildVerifiableInsightPlaces(destination: CanonicalDestination, neighborhoodName: string, group: NeighborhoodIntelligenceGroup) {
  const verifiedPlaces = (group.places ?? [])
    .filter((place) => place?.name && place.verified === true)
    .filter((place) => !isGenericPlaceName(place.name, neighborhoodName, group.category, destination.title || destination.city))
    .slice(0, 4)
    .map((place, index) => {
      const metadata: Record<string, string> = {
        Category: group.category,
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
        description: sanitizePublicPlaceText(place.description) || `${place.name} is a verified ${group.category.toLowerCase()} that helps explain what makes ${neighborhoodName || destination.city} feel distinctive.`,
        neighborhood: place.neighborhoodName || neighborhoodName || destination.city,
        category: group.category,
        mapUrl: place.googleMapsUrl || undefined,
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

// Real persisted category_key -> display bucket mapping, covering every category_key value
// observed across the real Batch #1 workbook data. A category only ever appears on the page when
// at least one real, exact-neighborhoodKey-matched place exists for it - never forced, never
// fabricated.
const REAL_PLACE_CATEGORY_BUCKETS: ReadonlyArray<{ key: string; label: string; matches: (category: string) => boolean }> = [
  { key: "restaurants", label: "Restaurants", matches: (category) => category === "restaurant" },
  { key: "coffee", label: "Coffee", matches: (category) => category === "coffee_shop" || category === "bakery" },
  { key: "parks", label: "Parks & recreation", matches: (category) => category === "park" || category === "trail" },
  { key: "shopping", label: "Shopping", matches: (category) => category === "shopping" || category === "grocery" || category === "farmers_market" },
  { key: "golf", label: "Golf", matches: (category) => category === "golf" },
  { key: "healthcare", label: "Healthcare", matches: (category) => category === "hospital" || category === "urgent_care" || category === "pharmacy" },
  { key: "entertainment", label: "Entertainment & nightlife", matches: (category) => category === "live_music" || category === "nightlife" || category === "theater" || category === "brewery_winery" },
  { key: "attractions", label: "Attractions & things to do", matches: (category) => category === "attraction" || category === "museum" || category === "zoo_aquarium" },
  { key: "outdoor", label: "Outdoor recreation", matches: (category) => category === "beach" || category === "water_recreation" || category === "skiing_winter" },
  { key: "sports", label: "Sports & recreation", matches: (category) => category === "sports" || category === "gym" || category === "pickleball_tennis" },
  { key: "coworking", label: "Coworking", matches: (category) => category === "coworking" },
  { key: "services", label: "Services & government resources", matches: (category) => /government|transit_hub|social_club|senior_living|school|religious/i.test(category) },
];

/**
 * Builds neighborhood-intelligence-style category cards directly from real persisted v3.1 places,
 * filtered by an exact neighborhoodKey match (never fuzzy, never destination-wide). A category is
 * only ever included when it has at least one real matching place - no generic filler, no invented
 * URLs. Places are ordered by their real persisted displayOrder where present. The full real count
 * is returned here - progressive disclosure (initial 4, "Show more") is a presentation concern
 * handled by CategoryPlaceList at render time, not a data-shape concern.
 */
function buildRealNeighborhoodPlaceCards(destination: CanonicalDestination, neighborhoodKey: string): NeighborhoodInsightCard[] {
  const allPlaces = destination.v31Modules?.places ?? [];
  const neighborhoodPlaces = allPlaces.filter((place) => place.neighborhoodKey === neighborhoodKey);
  // Resolve the real neighborhood display name from its own persisted record - never the
  // destination's own name/city, which would misrepresent every place as belonging to the whole
  // destination rather than this specific neighborhood.
  const neighborhoodDisplayName = destination.v31Modules?.neighborhoods.find((item) => item.neighborhoodKey === neighborhoodKey)?.name || destination.city;

  return REAL_PLACE_CATEGORY_BUCKETS.flatMap((bucket) => {
    const matchingPlaces = neighborhoodPlaces
      .filter((place) => place.category && bucket.matches(place.category) && place.name && place.name.trim().length > 0)
      .sort((left, right) => {
        const orderLeft = left.displayOrder ? Number(left.displayOrder) : Number.MAX_SAFE_INTEGER;
        const orderRight = right.displayOrder ? Number(right.displayOrder) : Number.MAX_SAFE_INTEGER;
        return orderLeft - orderRight;
      });

    if (matchingPlaces.length === 0) {
      return [];
    }

    const places: NeighborhoodInsightPlace[] = matchingPlaces.map((place) => {
      const website = place.websiteUrl && place.websiteUrl.trim().length > 0 ? place.websiteUrl : undefined;
      const mapUrl = place.googleMapsUrl && place.googleMapsUrl.trim().length > 0
        ? place.googleMapsUrl
        : website
        ? undefined
        : (place.sourceUrl && place.sourceUrl.trim().length > 0 ? place.sourceUrl : undefined);

      return {
        id: place.placeKey,
        title: place.name as string,
        description: sanitizePublicPlaceText(place.description) ?? `${place.name} is a real place tied to this neighborhood.`,
        neighborhood: neighborhoodDisplayName,
        category: bucket.label,
        mapUrl,
        website,
        address: place.address ?? undefined,
        phone: place.phone ?? undefined,
      } satisfies NeighborhoodInsightPlace;
    });

    return [{
      key: bucket.key,
      label: bucket.label,
      value: bucket.label,
      description: `Real persisted places tied to this neighborhood.`,
      places,
      emptyMessage: "",
    } satisfies NeighborhoodInsightCard];
  });
}

/**
 * Destination Highlights: a centralized, destination-wide view of every real persisted place,
 * grouped into useful categories - regardless of whether a place also has a neighborhoodKey (a
 * place tied to a neighborhood still belongs to its neighborhood card too; this section is an
 * additional, not exclusive, way to discover it). Deduplicated by placeKey first, then by
 * normalized name + URL, so a place is never listed twice within the same category. A category
 * only ever appears when at least one real place exists for it - never forced, never fabricated.
 */
function buildDestinationLevelPlaceHighlightGroups(destination: CanonicalDestination): NeighborhoodInsightCard[] {
  const allPlaces = destination.v31Modules?.places ?? [];
  const seenPlaceKeys = new Set<string>();
  const seenNameUrlPairs = new Set<string>();
  const dedupedPlaces = allPlaces.filter((place) => {
    if (!place.name || place.name.trim().length === 0) return false;
    if (place.placeKey) {
      if (seenPlaceKeys.has(place.placeKey)) return false;
      seenPlaceKeys.add(place.placeKey);
    }
    const dedupeKey = `${normalizeText(place.name)}|${(place.websiteUrl || place.googleMapsUrl || place.sourceUrl || "").trim().toLowerCase()}`;
    if (seenNameUrlPairs.has(dedupeKey)) return false;
    seenNameUrlPairs.add(dedupeKey);
    return true;
  });

  const buildCardForPlaces = (bucketKey: string, bucketLabel: string, matchingPlaces: typeof dedupedPlaces) => {
    const sorted = [...matchingPlaces].sort((left, right) => {
      const orderLeft = left.displayOrder ? Number(left.displayOrder) : Number.MAX_SAFE_INTEGER;
      const orderRight = right.displayOrder ? Number(right.displayOrder) : Number.MAX_SAFE_INTEGER;
      return orderLeft - orderRight;
    });

    const places: NeighborhoodInsightPlace[] = sorted.map((place) => {
      const website = place.websiteUrl && place.websiteUrl.trim().length > 0 ? place.websiteUrl : undefined;
      const mapUrl = place.googleMapsUrl && place.googleMapsUrl.trim().length > 0
        ? place.googleMapsUrl
        : website
        ? undefined
        : (place.sourceUrl && place.sourceUrl.trim().length > 0 ? place.sourceUrl : undefined);

      return {
        id: place.placeKey,
        title: place.name as string,
        description: sanitizePublicPlaceText(place.description) ?? `${place.name} is a real place associated with ${destination.city} as a whole.`,
        neighborhood: destination.city,
        category: bucketLabel,
        mapUrl,
        website,
        address: place.address ?? undefined,
        phone: place.phone ?? undefined,
      } satisfies NeighborhoodInsightPlace;
    });

    return {
      key: bucketKey,
      label: `${bucketLabel} across ${destination.city}`,
      value: bucketLabel,
      description: `Real, verified ${destination.city} places in this category.`,
      places,
      emptyMessage: "",
    } satisfies NeighborhoodInsightCard;
  };

  const matchedPlaceKeys = new Set<string>();
  const namedBucketCards = REAL_PLACE_CATEGORY_BUCKETS.flatMap((bucket) => {
    const matchingPlaces = dedupedPlaces.filter((place) => place.category && bucket.matches(place.category));
    if (matchingPlaces.length === 0) return [];
    matchingPlaces.forEach((place) => place.placeKey && matchedPlaceKeys.add(place.placeKey));
    return [buildCardForPlaces(bucket.key, bucket.label, matchingPlaces)];
  });

  // Catch-all: any real, named place whose category_key didn't match a known bucket (a different
  // workbook's own category vocabulary, or genuinely uncategorized) is still surfaced here rather
  // than silently disappearing from every recommendation surface.
  const leftoverPlaces = dedupedPlaces.filter((place) => !(place.placeKey && matchedPlaceKeys.has(place.placeKey)));
  const catchAllCard = leftoverPlaces.length > 0 ? [buildCardForPlaces("other-resources", "Other useful destination resources", leftoverPlaces)] : [];

  return [...namedBucketCards, ...catchAllCard];
}

/**
 * Shared progressive-disclosure list for a category's real places: shows the first 4, then a
 * "Show more" control reveals the full real count (never fabricated beyond what was passed in),
 * with an optional "Show fewer" to collapse back. Deduplicates by place id so the same real place
 * never renders twice within one list.
 */
function CategoryPlaceList({ places }: { places: NeighborhoodInsightPlace[] }) {
  const deduped = Array.from(new Map(places.map((place) => [place.id, place])).values());

  return (
    <div className="mt-3 divide-y divide-white/10 border-y border-white/10">
      {deduped.map((place) => {
        if (place.isFallback) {
          return (
            <a key={place.id} href={place.mapUrl} target="_blank" rel="noopener noreferrer" className="flex w-full items-start justify-between gap-3 px-1 py-3 text-left transition hover:bg-[#0a2745]">
              <span>
                <span className="block text-sm font-semibold text-[#edf2fb]">{place.title}</span>
                <span className="mt-1 block text-xs leading-5 text-[#9eb2c6]">{place.description}</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#55c7c9]">Explore</span>
            </a>
          );
        }

        // Native disclosure - the full detail (rating, distance, website/maps links) is always
        // present in the DOM from initial render; no React click state gates it.
        return (
          <details key={place.id} className="group px-1 py-3">
            <summary className="flex min-h-11 w-full cursor-pointer list-none items-start justify-between gap-3 text-left">
              <span>
                <span className="block text-sm font-semibold text-[#edf2fb]">{place.title}</span>
                <span className="mt-1 block text-xs leading-5 text-[#9eb2c6]">{place.description}</span>
              </span>
              <span className="flex shrink-0 items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#55c7c9]">
                Open
                <span className="transition group-open:rotate-45" aria-hidden="true">+</span>
              </span>
            </summary>
            <div className="mt-3 space-y-3">
              {place.aiSummary && place.aiSummary.trim().length > 0 && place.aiSummary !== place.description ? (
                <p className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm leading-7 text-slate-300">{place.aiSummary}</p>
              ) : null}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Neighborhood</p>
                  <p className="mt-2 text-sm font-semibold text-white">{place.neighborhood}</p>
                </div>
                {place.rating ? (
                  <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Rating</p>
                    <p className="mt-2 text-sm font-semibold text-white">{place.rating}</p>
                  </div>
                ) : null}
                {place.distance ? (
                  <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Distance</p>
                    <p className="mt-2 text-sm font-semibold text-white">{place.distance}</p>
                  </div>
                ) : null}
                {place.metadata && Object.keys(place.metadata).length > 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3 sm:col-span-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Why it matters</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {Object.entries(place.metadata).map(([key, value]) => (
                        <span key={key} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
                          {key}: {value}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {place.mapUrl ? (
                  <a href={place.mapUrl} target="_blank" rel="noopener noreferrer" className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyan-200 transition hover:border-cyan-400/40 hover:bg-cyan-500/20">
                    Open on Google Maps
                  </a>
                ) : null}
                {place.website ? (
                  <a href={place.website} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/30 hover:bg-cyan-500/10">
                    Visit website
                  </a>
                ) : null}
              </div>
            </div>
          </details>
        );
      })}
    </div>
  );
}

/**
 * Destination-level section for real places with no neighborhoodKey - never invents a
 * neighborhood association. Absent entirely when no such places exist. Generic across every
 * destination: headings are built purely from the category bucket label and the destination's own
 * name, never a hardcoded destination string.
 */
function DestinationHighlightsSection({ destination }: { destination: CanonicalDestination }) {
  const groups = useMemo(() => buildDestinationLevelPlaceHighlightGroups(destination), [destination]);

  if (groups.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-[0_20px_60px_rgba(2,8,23,0.16)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Destination highlights</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Real recommendations that span all of {destination.city}</h2>
        </div>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {groups.map((group) => (
          <div key={group.key} className="rounded-[1.5rem] border border-white/10 bg-slate-950/30 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#eabc5b]">{group.label}</p>
            <p className="mt-1.5 text-sm leading-6 text-[#9eb2c6]">{group.description}</p>
            <CategoryPlaceList places={group.places} />
          </div>
        ))}
      </div>
    </section>
  );
}

function buildNeighborhoodInsightCards(destination: CanonicalDestination, neighborhoodName: string, neighborhoodKey?: string) {
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

  // Real persisted v3.1 places are authoritative for a v3.1 destination's neighborhood cards -
  // never fall back to generic seed-based category signals (which have no real neighborhoodKey
  // scoping and can leak an unrelated neighborhood's name into the fallback search query) when
  // real, exact-neighborhoodKey-matched place rows exist.
  const categoryCards: NeighborhoodInsightCard[] = neighborhoodKey && (destination.v31Modules?.places?.length ?? 0) > 0
    ? buildRealNeighborhoodPlaceCards(destination, neighborhoodKey)
    : [
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
      emptyMessage: "",
    } satisfies NeighborhoodInsightCard];
  });

  // Narrow, exact-match detection of the known unfinished/generic fallback strings used above when
  // no real per-neighborhood evidence exists (never a fuzzy/substring match against real content) -
  // a card built entirely from one of these is unfinished filler, not destination-specific value,
  // and is dropped rather than rendered.
  const GENERIC_NEIGHBORHOOD_FALLBACK_TEXT = new Set([
    "Well-suited for everyday life",
    "Strong cycling potential when paired with a good neighborhood layout",
    "Useful transit access for daily movement",
    "A practical and grounded everyday feel",
    "Good fit for households seeking everyday ease",
    "A useful neighborhood for pet-friendly routines",
    "A practical base for focused work and slow routines",
    "A few local corridors shape the neighborhood’s everyday rhythm",
  ]);
  const isGenericNeighborhoodFallback = (text: string) =>
    GENERIC_NEIGHBORHOOD_FALLBACK_TEXT.has(text) || /is often defined by a few streets that anchor daily errands/i.test(text);

  const cards: NeighborhoodInsightCard[] = [
    ...(isGenericNeighborhoodFallback(signatureStreets) ? [] : [{
      key: "signature-streets",
      label: "Signature streets",
      value: "Local corridors that shape the place",
      description: signatureStreets,
      places: [],
      emptyMessage: "",
    }]),
    ...categoryCards,
    ...(isGenericNeighborhoodFallback(bikeability) ? [] : [{
      key: "bikeability",
      label: "Bikeability",
      value: "Bike-friendly routes",
      description: bikeability,
      places: [],
      emptyMessage: "",
    }]),
    ...(isGenericNeighborhoodFallback(familyFriendly) ? [] : [{
      key: "family-empty",
      label: "Family friendly",
      value: "Family-friendly places",
      description: familyFriendly,
      places: [],
      emptyMessage: "",
    }]),
    ...(isGenericNeighborhoodFallback(petFriendly) ? [] : [{
      key: "pet",
      label: "Pet friendly",
      value: "Pet-friendly places",
      description: petFriendly,
      places: [],
      emptyMessage: "",
    }]),
    ...(isGenericNeighborhoodFallback(remoteWork) ? [] : [{
      key: "remote-work-empty",
      label: "Remote work",
      value: "Remote-work-friendly spots",
      description: remoteWork,
      places: [],
      emptyMessage: "",
    }]),
    ...(isGenericNeighborhoodFallback(walkability) ? [] : [{ key: "walkability", label: "Walkability", value: String(walkability), description: "How easily daily errands and neighborhood life can be handled on foot.", places: [], emptyMessage: "" }]),
    ...(isGenericNeighborhoodFallback(transit) ? [] : [{ key: "transit-signal", label: "Transit", value: String(transit), description: "How well the area supports car-light routines and local travel.", places: [], emptyMessage: "" }]),
    ...(isGenericNeighborhoodFallback(safety) ? [] : [{ key: "safety", label: "Safety", value: String(safety), description: "How the area is perceived for daily calm and residential comfort.", places: [], emptyMessage: "" }]),
    // The "overall" score was a synthetic composite counted from generic fallback keyword matches,
    // never a real persisted evidence signal - always generic filler, so it is never included.
  ];

  return cards;
}

function PremiumSectionBlock({
  title,
  summary,
  body,
  eyebrow,
}: {
  title: string;
  summary: string;
  body: string;
  eyebrow?: string;
}) {
  const { intro, body: remainder } = splitEditorialText(summary);
  // Never repeat the visible preview sentence inside the expanded area - a labeled body line or
  // extra paragraph that's identical (ignoring whitespace/case) to what's already shown in `intro`
  // is dropped rather than shown twice. "Continue reading" only appears when genuinely additional,
  // non-duplicate content survives this filter.
  const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");
  const normalizedIntro = normalize(intro);
  const uniqueBodyLines = body
    .split("\n\n")
    .map((line) => line.trim())
    .filter((line) => {
      if (!line) return false;
      const value = line.includes(": ") ? line.slice(line.indexOf(": ") + 2) : line;
      return normalize(value) !== normalizedIntro;
    });
  const uniqueRemainder = normalize(remainder) !== normalizedIntro ? remainder.trim() : "";
  const hasBody = uniqueBodyLines.length > 0 || uniqueRemainder.length > 0;

  return (
    <article className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-6 shadow-[0_18px_50px_rgba(2,8,23,0.16)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-300">{eyebrow}</p> : null}
          <h3 className="mt-2 text-xl font-semibold text-white">{title}</h3>
        </div>
      </div>
      <div className="mt-5 space-y-4">
        <p className="text-[15px] leading-8 text-slate-300 whitespace-pre-line">{intro}</p>
        {hasBody ? (
          // Native disclosure - the full body is always present in the DOM from initial render.
          <details className="group">
            <summary className="flex min-h-11 w-fit cursor-pointer list-none items-center gap-2 rounded-full border border-white/10 bg-slate-950/50 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:border-cyan-400/40 hover:bg-cyan-500/10">
              Continue reading
              <span className="transition group-open:rotate-45" aria-hidden="true">+</span>
            </summary>
            <div className="mt-4 space-y-4">
              {uniqueBodyLines.length > 0 ? <p className="text-[15px] leading-8 text-slate-300 whitespace-pre-line">{uniqueBodyLines.join("\n\n")}</p> : null}
              {uniqueRemainder.length > 0 ? <p className="text-[15px] leading-8 text-slate-300 whitespace-pre-line">{uniqueRemainder}</p> : null}
            </div>
          </details>
        ) : null}
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
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-5 shadow-[0_18px_50px_rgba(2,8,23,0.16)]">
      <h4 className="text-base font-semibold text-white">{title}</h4>
      <p className="mt-2 text-[15px] leading-8 text-slate-300">{summary}</p>
      {/* Native disclosure - the full body is always present in the DOM from initial render. */}
      <details className="group mt-3">
        <summary className="flex min-h-11 w-fit cursor-pointer list-none items-center gap-1.5 rounded-full border border-white/10 bg-slate-950/40 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
          Expand
          <span className="transition group-open:rotate-45" aria-hidden="true">+</span>
        </summary>
        <div className="mt-4">
        <p className="text-[15px] leading-8 text-slate-300">{body}</p>
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
      </details>
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
  neighborhood: {
    name: string;
    neighborhoodKey?: string;
    whyItWorks: string;
    fit: string;
    vibe: string;
    profile?: NeighborhoodProfile;
    walkabilityRating?: string | null;
    safetyRating?: string | null;
    transitRating?: string | null;
    housingCharacter?: string | null;
    pros?: string | null;
    cons?: string | null;
    googleMapsUrl?: string | null;
  };
  index: number;
  destination: CanonicalDestination;
}) {
  // A v3.1 destination's neighborhood category signals come from real persisted places only -
  // suppress the legacy synthetic Google-search-link resource groups entirely for v3.1 bundles
  // (never a per-neighborhood generic fallback, which has no real neighborhoodKey scoping and can
  // leak an unrelated neighborhood's name into the generated query). If this neighborhood genuinely
  // has zero real places, the category is simply omitted rather than shown with a fabricated link.
  const isV31Bundle = Boolean(destination.v31Modules);
  const neighborhoodResourceGroups = useMemo(() => (isV31Bundle ? [] : buildNeighborhoodResourceGroups(destination, neighborhood.name)), [destination, neighborhood.name, isV31Bundle]);
  const neighborhoodLiveResources = useMemo(() => buildNeighborhoodLiveResources(destination, neighborhood.name), [destination, neighborhood.name]);
  const neighborhoodInsightCards = useMemo(() => buildNeighborhoodInsightCards(destination, neighborhood.name, neighborhood.neighborhoodKey), [destination, neighborhood.name, neighborhood.neighborhoodKey]);
  const neighborhoodProfileResources = useMemo(() => dedupeResourceItems([
    ...(neighborhood.profile?.resources ?? []),
    ...(neighborhood.profile?.liveResources ?? []),
    // Real per-neighborhood Google Maps link from the workbook's own NEIGHBORHOODS row - never a
    // generated search-query fallback (those stay suppressed for v3.1 bundles, see above).
    ...(neighborhood.googleMapsUrl ? [{ label: "Google Maps", url: neighborhood.googleMapsUrl, category: "navigation", kind: "dataset" as const }] : []),
  ].filter((resource): resource is NeighborhoodResourceItem => Boolean(resource?.url && resource.url.trim().length > 0))), [neighborhood.profile, neighborhood.googleMapsUrl]);
  // A v3.1/v3.2 neighborhood record only ever supplies a summary (whyItWorks/vibe) and an area_type
  // (fit) - there is no real per-neighborhood breakdown for walkability/transit/dining/coffee/etc.
  // For a real workbook-backed neighborhood, showing 15 index-based "flavor text" fields would
  // fabricate distinctions the data never supports; only the fields with a real backing value are
  // shown, and "Healthcare" is omitted entirely (never a generic placeholder) when genuinely blank.
  const detailMap = isV31Bundle
    ? [
        { label: "Best For", value: neighborhood.fit },
        { label: "Overall Vibe", value: neighborhood.vibe },
        { label: "Walkability", value: neighborhood.walkabilityRating },
        { label: "Transit", value: neighborhood.transitRating },
        { label: "Safety", value: neighborhood.safetyRating },
        { label: "Housing", value: neighborhood.housingCharacter },
        { label: "Pros", value: neighborhood.pros },
        { label: "Cons", value: neighborhood.cons },
        ...(destination.healthcare ? [{ label: "Healthcare", value: destination.healthcare }] : []),
      ].filter((row) => row.value && row.value.trim().length > 0)
    : [
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
    <article className="border border-[#d8ad5548] bg-[#061a32] shadow-[0_18px_45px_rgba(0,0,0,0.2)]">
      <div className="min-w-0 p-5 sm:p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#55c7c9]">Flagship neighborhood {index + 1}</p>
        <h4 className="mt-1 font-serif text-2xl text-[#fff8e9]">{neighborhood.name}</h4>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-[#b7c8d8]">{neighborhood.whyItWorks}</p>
      </div>
      <div className="grid border-t border-white/10 sm:grid-cols-2">
        <div className="px-5 py-4 sm:border-r sm:border-white/10 sm:px-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#eabc5b]">Best for</p>
          <p className="mt-1.5 text-sm leading-6 text-[#d5e0ea]">{neighborhood.fit}</p>
        </div>
        <div className="border-t border-white/10 px-5 py-4 sm:border-t-0 sm:px-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#eabc5b]">Overall vibe</p>
          <p className="mt-1.5 text-sm leading-6 text-[#d5e0ea]">{neighborhood.vibe}</p>
        </div>
      </div>
      {neighborhoodProfileResources.length > 0 ? (
        <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Neighborhood resources</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {neighborhoodProfileResources.map((resource) => (
              <a key={`${resource.label}-${resource.url}`} href={resource.url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyan-200 transition hover:border-cyan-400/40 hover:bg-cyan-500/20">
                {resource.label}
              </a>
            ))}
          </div>
        </div>
      ) : null}
      {/* Native disclosure - the full neighborhood detail is always present in the DOM from initial render. */}
      <details className="group">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-center gap-1.5 border-t border-white/10 bg-slate-950/40 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
          Explore this neighborhood
          <span className="transition group-open:rotate-45" aria-hidden="true">+</span>
        </summary>
        <div className="border-t border-white/10">
        <div className="grid md:grid-cols-2 xl:grid-cols-3">
          {detailMap.map((detail) => (
            <div key={detail.label} className="border-b border-white/10 px-5 py-3.5 md:border-r md:px-6 xl:[&:nth-child(3n)]:border-r-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#55c7c9]">{detail.label}</p>
              <p className="mt-1.5 text-sm leading-6 text-[#b7c8d8]">{detail.value}</p>
            </div>
          ))}
        </div>
        {neighborhoodInsightCards.length > 0 ? (
          <div className="border-t border-[#d8ad5548] bg-[#04172d] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Neighborhood intelligence</p>
                <h5 className="mt-1 text-lg font-semibold text-white">A curatorial guide to the places that make the neighborhood feel real</h5>
              </div>
            </div>
            <div className="mt-4 grid border-t border-white/10 lg:grid-cols-2">
              {neighborhoodInsightCards.map((card) => (
                <div key={card.key} className="border-b border-white/10 py-4 lg:px-4 lg:[&:nth-child(odd)]:border-r">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#eabc5b]">{card.label}</p>
                  <p className="mt-1.5 text-sm font-semibold text-[#edf2fb]">{card.value}</p>
                  <p className="mt-1.5 text-sm leading-6 text-[#9eb2c6]">{card.description}</p>
                  {card.places.length > 0 ? (
                    <CategoryPlaceList places={card.places} />
                  ) : card.emptyMessage ? (
                    <p className="mt-3 text-[15px] leading-7 text-slate-300">{card.emptyMessage}</p>
                  ) : null}
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
      </details>
    </article>
  );
}

export default function CanonicalDestinationPage({ destination, developerMode = false }: CanonicalDestinationPageProps) {
  const [selectedMedia, setSelectedMedia] = useState<GalleryItem | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [failedMediaUrls, setFailedMediaUrls] = useState<Set<string>>(() => new Set());
  const [activeSectionId, setActiveSectionId] = useState<string>(SECTION_TABS[0].id);
  const [neighborhoodsExpanded, setNeighborhoodsExpanded] = useState(false);

  // Lightweight scroll-position indicator for the sticky tab bar - purely a visual "current
  // section" cue (aria-current), never gates rendering of any section (all three remain
  // permanently in the DOM as one continuous page, so behavior/semantics are unchanged).
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const sectionElements = SECTION_TABS.map((tab) => document.getElementById(tab.id)).filter((el): el is HTMLElement => el !== null);
    if (sectionElements.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((left, right) => right.intersectionRatio - left.intersectionRatio);
        if (visible.length > 0) {
          setActiveSectionId(visible[0].target.id);
        }
      },
      { rootMargin: "-140px 0px -60% 0px", threshold: [0, 0.1, 0.25, 0.5] },
    );
    sectionElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

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
    // A real, curated media row (with its own caption/altText/attribution - e.g. a sourced
    // Wikimedia Commons photo) must never be overwritten by the generic "skyline and civic
    // identity" template below - the template is a last-resort label for a destination that
    // genuinely has no real per-image metadata yet.
    const realItemByUrl = new Map(galleryItems.map((item) => [item.url, item]));
    const heroImage = getDestinationHeroImage(mediaDestination);
    const imageSet = getDestinationImageSet(mediaDestination, 5);
    const heroFirstImageSet = heroImage
      ? [heroImage, ...imageSet.filter((imageUrl) => imageUrl !== heroImage)]
      : imageSet;
    if (imageSet.length > 0) {
      return dedupeMediaUrls(heroFirstImageSet).slice(0, 10).map((imageUrl, index) => {
        const real = realItemByUrl.get(imageUrl);
        const fallbackCaption = index === 0
          ? `${destination.title} skyline and civic identity`
          : `${destination.title} destination view ${index + 1}`;
        const altText = real?.altText || fallbackCaption;
        return {
          kind: real?.kind || (index === 0 ? "featured" : "gallery"),
          url: imageUrl,
          altText,
          caption: real?.caption || fallbackCaption,
          isPrimary: real?.isPrimary ?? index === 0,
          resolvedUrl: getDestinationImageUrl({ src: imageUrl, alt: altText }, mediaDestination),
          attribution: real?.attribution,
          sourceUrl: real?.sourceUrl,
        };
      });
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
  }, [galleryItems, destination.title, mediaDestination]);
  const availableGalleryItems = resolvedGalleryItems.filter((item) => !failedMediaUrls.has(item.resolvedUrl ?? item.url));
  const galleryModalItems = availableGalleryItems.length > 0
    ? availableGalleryItems.slice(0, 10)
    : resolvedGalleryItems.filter((item) => item.kind === "placeholder").slice(0, 1);
  const previewGalleryItems = galleryModalItems.slice(0, 5);
  const googleImagesHref = `https://www.google.com/search?q=${encodeURIComponent(`${destination.title} ${destination.country} travel photos`)}&tbm=isch`;
  const executiveSummaryImage = galleryModalItems[0] ?? resolvedGalleryItems[0];
  const handleMediaError = (url: string) => {
    setFailedMediaUrls((current) => {
      if (current.has(url)) return current;
      return new Set([...current, url]);
    });
  };
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
  // A destination resolved through the real persisted v3.1 read path carries v31Modules - the
  // single signal used to disable every legacy generic-template generator (STEP 9). Legacy
  // (pre-v3.1) destinations keep their existing behavior completely unchanged below.
  const hasV31Bundle = Boolean(destination.v31Modules);

  const premiumEditorialPackage = hasV31Bundle
    ? {
        overviewArticle: destination.overview || "",
        whatItsReallyLike: destination.dailyLife || "",
        neighborhoodGuide: "",
        retirementGuide: destination.retirement || "",
        familyGuide: destination.family || "",
        digitalNomadGuide: destination.digitalNomad || "",
        healthcareGuide: destination.healthcare || "",
        costOfLivingGuide: destination.costOfLiving || "",
        transportationGuide: destination.transportation || "",
        climateGuide: destination.climate || "",
        walkabilityGuide: destination.walkability || "",
        safetyGuide: destination.safety || "",
        pros: destination.pros ?? [],
        cons: destination.cons ?? [],
        resourceLinks: buildResourceGroups(destination).flatMap((group) => group.items.map((item) => ({ label: item.label, url: item.url }))),
        monthlyBudgets: destination.monthlyBudgets ?? [],
        neighborhoodGuides: [],
        scoringNotes: [],
        heroIntroduction: destination.heroNarrative || "",
        whyPeopleLoveIt: [],
      }
    : buildPremiumDestinationEditorialPackage({
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
    // A v3.1/v3.2 bundle's costOfLivingProfile is built purely from real COST_OF_LIVING rows (see
    // buildCanonicalDestinationFromPersistedBundle) - an empty categories array there is an honest
    // "no granular breakdown exists", never a signal to invent Housing/Food/Transport lines from
    // unrelated narrative fields. That synthetic 3-category fallback is legacy-destination-only.
    const categories = profile?.categories?.length
      ? profile.categories
      : hasV31Bundle
      ? []
      : [
          { key: "housing", label: "Housing", amount: "", note: destination.costOfLiving },
          { key: "food", label: "Food", amount: "", note: destination.dailyLife },
          { key: "transport", label: "Transport", amount: "", note: destination.transportation },
        ].filter((category) => category.note || category.amount);

    return {
      summary: profile?.summary || destination.costOfLiving || premiumContent.costOfLivingArticle,
      currency: profile?.currency || destination.knowledgeProfile?.currency || "USD",
      methodology: profile?.methodology || "Modeled from housing, food, transport, and neighborhood assumptions.",
      confidence: profile?.confidence || "medium",
      assumptions: profile?.assumptions || [],
      budgets,
      categories,
    };
  }, [destination.costOfLiving, destination.costOfLivingProfile, destination.dailyLife, destination.monthlyBudgets, destination.transportation, destination.knowledgeProfile?.currency, hasV31Bundle, premiumContent.costOfLivingArticle]);

  const narrativeSummary = [destination.heroNarrative, destination.overview, destination.editorial, destination.dailyLife].find((value) => typeof value === "string" && value.trim().length > 0) ?? "A place with a distinct everyday rhythm and a strong sense of local identity.";
  const lifestyleSummary = [destination.dailyLife, destination.overview, destination.heroNarrative, destination.editorial].find((value) => typeof value === "string" && value.trim().length > 0) ?? narrativeSummary;
  const outdoorSummary = [destination.overview, destination.heroNarrative, destination.editorial, destination.weather].find((value) => typeof value === "string" && value.trim().length > 0) ?? narrativeSummary;
  const categoryPlaceholder = "Detailed category information is not available yet.";
  // The generic Travel-resource system (destination-travel-resources.ts) adds labels like "Find
  // airport transfers" to every destination's resources array - a substring match on "airport"
  // would wrongly surface that generated search-utility label as if it were a real airport-access
  // fact. v3.1/v3.2 bundles must never let a named-resource match stand in for real workbook facts
  // for categories the generic system also generates (airport, healthcare already had this fix).
  const GENERIC_UTILITY_COLLISION_CATEGORIES = new Set(["airport", "healthcare"]);
  const categoryValue = (value?: string | null) => {
    const sanitized = sanitizePublicText(value);
    return sanitized && sanitized.trim().length > 0 ? sanitized : categoryPlaceholder;
  };
  const categoryListValue = (values: Array<string | undefined | null>) => {
    const firstMatch = values.find((value) => typeof value === "string" && value.trim().length > 0);
    return firstMatch ?? categoryPlaceholder;
  };
  const getNamedResourceValues = (category: string) => {
    if (hasV31Bundle && GENERIC_UTILITY_COLLISION_CATEGORIES.has(category.toLowerCase())) return [];
    const normalizedCategory = category.toLowerCase();
    return [
      ...destination.resources,
      ...destination.realEstateResources,
      ...destination.rentalResources,
      ...destination.healthcareResources,
      ...destination.weatherResources,
      ...destination.structuredResources,
      ...destination.visaResources,
    ]
      .filter((resource) => resource?.label && resource.label.trim().length > 0)
      .filter((resource) => {
        const label = resource.label.toLowerCase();
        const categoryValue = resource.category?.toLowerCase() ?? "";
        return label.includes(normalizedCategory) || categoryValue.includes(normalizedCategory) || normalizedCategory.includes(label) || normalizedCategory.includes(categoryValue);
      })
      .map((resource) => resource.label)
      .filter(Boolean);
  };
  const getSpecificCategoryValue = (category: string, fallbackValue?: string | null, namedValues?: string[]) => {
    const explicitValues = (namedValues ?? []).filter(Boolean);
    if (explicitValues.length > 0) return explicitValues.join(" • ");
    return categoryValue(fallbackValue);
  };
  const formatPopulationValue = (value?: string | null) => {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const digitsOnly = trimmed.replace(/,/g, "");
    if (/^-?\d+$/.test(digitsOnly)) {
      return new Intl.NumberFormat("en-US").format(Number(digitsOnly));
    }
    return trimmed;
  };
  const formatListValue = (values?: Array<string | undefined | null> | null) => {
    const filtered = values?.filter((value) => typeof value === "string" && value.trim().length > 0) ?? [];
    return filtered.length > 0 ? filtered.join(" • ") : undefined;
  };
  const formatClimateValue = () => {
    const values = [destination.knowledgeProfile?.rainfall, destination.knowledgeProfile?.sunshineHours, destination.knowledgeProfile?.humidity]
      .filter((value): value is string => typeof value === "string" && value.trim().length > 0);
    if (values.length > 0) {
      return values.join(" • ");
    }
    return destination.knowledgeProfile?.climateClassification || destination.climate || undefined;
  };

  const essentialFacts = useMemo(() => {
    return [
    { label: "Population", value: categoryValue(formatPopulationValue(destination.knowledgeProfile?.population)), note: "Population helps frame the city’s scale and whether it feels intimate or metropolitan." },
    { label: "Metro population", value: categoryValue(formatPopulationValue(destination.knowledgeProfile?.metroPopulation)), note: "The metro explains how far the city’s labor, healthcare, and airport ecosystems extend." },
    { label: "Climate", value: categoryValue(formatClimateValue()), note: "Climate influences daily life, outdoor behavior, and long-stay comfort." },
    { label: "Elevation", value: categoryValue(destination.knowledgeProfile?.elevation), note: "Elevation influences weather, views, and how the city feels on the ground." },
    { label: "Average temperatures", value: categoryValue(destination.knowledgeProfile?.averageTemperatures), note: "Temperature patterns are one of the clearest differences between visiting and living somewhere." },
    { label: "Walkability", value: categoryValue(destination.knowledgeProfile?.walkability || sanitizePublicText(destination.walkability) || undefined), note: "Walkability determines whether daily errands can happen on foot or by transit." },
    { label: "Bikeability", value: categoryValue(destination.knowledgeProfile?.bikeFriendliness), note: "Cycling often changes the feel of a city more than most visitors expect." },
    { label: "Transit", value: categoryValue(destination.knowledgeProfile?.publicTransportation || sanitizePublicText(destination.transportation) || undefined), note: "Transit turns a city into a daily-life system rather than a postcard image." },
    // A v3.1/v3.2 bundle's healthcareResources array is always the generic, unconditional
    // "${city} hospitals"/"${city} clinics" fallback (buildCanonicalDestinationFromPersistedBundle
    // never populates it from real data) - never let that masquerade as a specific named resource
    // ahead of the real workbook healthcare summary. Legacy (non-v3.1) destinations may have a
    // genuinely curated named resource here, so their existing named-resource-first behavior is untouched.
    { label: "Healthcare", value: categoryValue(getSpecificCategoryValue("healthcare", formatListValue(destination.knowledgeProfile?.majorHospitals) || destination.knowledgeProfile?.healthcareQuality || destination.healthcare, hasV31Bundle ? [] : getNamedResourceValues("healthcare"))), note: "Healthcare is often the deciding factor for long-stay households and retirees." },
    // Personal safety uses the shared buildPersonalSafetySignal mapping (crime/theft-relevant
    // SAFETY_RISKS rows, a destination-level "safety" score, and neighborhood-level variation) -
    // never weather/environmental content, and never silently replaced with a guess when the
    // destination genuinely has none. See "Reality and Environment" for the separate weather and
    // natural-hazard breakdown.
    { label: "Personal safety", value: categoryValue(buildPersonalSafetySignal(destination).value), note: "Reflects documented personal-safety evidence (crime context, neighborhood variation, and any safety score) - not weather or an individualized guarantee." },
    { label: "Internet", value: categoryValue(destination.knowledgeProfile?.internetSpeed || destination.internet), note: "Internet quality matters for remote work, digital nomads, and modern households." },
    { label: "Airport access", value: categoryValue(getSpecificCategoryValue("airport", formatListValue(destination.knowledgeProfile?.majorAirports) || destination.airportInfo || sanitizePublicText(destination.v31Modules?.transportation.find((row) => row.airportSummary)?.airportSummary), getNamedResourceValues("airport"))), note: "Airport access is a major part of relocation ease for families and frequent travelers." },
    { label: "Currency", value: categoryValue(destination.knowledgeProfile?.currency || (destination.country === "United States" ? "USD" : destination.country === "United Kingdom" ? "GBP" : destination.country === "Japan" ? "JPY" : destination.country === "Thailand" ? "THB" : undefined)), note: "Currency affects budgeting, transfers, and how a budget feels in practice." },
    { label: "Language", value: categoryValue(destination.knowledgeProfile?.primaryLanguage || (destination.country === "United States" ? "English" : destination.country === "Spain" ? "Spanish" : destination.country === "France" ? "French" : destination.country === "Italy" ? "Italian" : destination.country === "Croatia" ? "Croatian" : undefined)), note: "Language shapes the ease of everyday administration and local immersion." },
    { label: "Time zone", value: categoryValue(destination.knowledgeProfile?.timeZone), note: "Time-zone fit affects travel, work, and family communication." },
    { label: "Cost level", value: categoryValue(destination.knowledgeProfile?.costOfLiving || destination.costOfLiving), note: "Cost is shaped by housing, utilities, food, and the neighborhood you choose." },
    { label: "Family friendly", value: categoryValue(getSpecificCategoryValue("family", destination.family || destination.knowledgeProfile?.familySuitability, getNamedResourceValues("family"))), note: "Family friendliness depends on parks, schools, and neighborhood routines." },
    { label: "Retirement friendly", value: categoryValue(getSpecificCategoryValue("retirement", destination.retirement || destination.knowledgeProfile?.retirementSuitability, getNamedResourceValues("retirement"))), note: "Retirement fit depends on healthcare, pace, climate, and transport access." },
    { label: "Digital nomad", value: categoryValue(getSpecificCategoryValue("nomad", destination.digitalNomad || destination.knowledgeProfile?.digitalNomadSuitability, getNamedResourceValues("nomad"))), note: "Remote-work fit depends on internet, cafés, transit, and social energy." },
    { label: "Visa friendly", value: categoryValue(destination.v31Modules?.visaResidency.find((row) => row.summary)?.summary || destination.knowledgeProfile?.visaInfo), note: "Visa expectations are essential for long-stay planning and relocation logistics." },
    { label: "Pet friendly", value: categoryValue(destination.v31Modules?.pets.find((row) => row.petFriendlyNotes || row.summary)?.summary || getSpecificCategoryValue("pet", categoryListValue([destination.knowledgeProfile?.parks?.join(", "), destination.knowledgeProfile?.beaches?.join(", ")]), getNamedResourceValues("pet"))), note: "Pet-friendliness is shaped by green space, density, and neighborhood culture." },
    { label: "Golf", value: categoryValue(getSpecificCategoryValue("golf", categoryListValue([destination.knowledgeProfile?.golf?.join(", "), destination.golf?.join(", ")]), getNamedResourceValues("golf"))), note: "Golf availability can be a deciding factor for certain lifestyles." },
    { label: "Museums", value: categoryValue(getSpecificCategoryValue("museum", categoryListValue([destination.knowledgeProfile?.museums?.join(", "), destination.museums?.join(", ")]), getNamedResourceValues("museum"))), note: "Museums often define how a city feels to residents over time." },
    { label: "Food scene", value: categoryValue(getSpecificCategoryValue("restaurant", categoryListValue([destination.knowledgeProfile?.restaurants?.join(", "), destination.restaurants?.join(", ")]), getNamedResourceValues("restaurant"))), note: "Food culture often becomes a daily-life anchor, not just a tourist attraction." },
    { label: "Nightlife", value: categoryValue(getSpecificCategoryValue("nightlife", categoryListValue([destination.knowledgeProfile?.nightlife?.join(", "), destination.dailyLife]), getNamedResourceValues("nightlife"))), note: "Nightlife changes the energy of a city from day to night." },
    { label: "Beach", value: categoryValue(getSpecificCategoryValue("beach", categoryListValue([destination.knowledgeProfile?.beaches?.join(", ")]), getNamedResourceValues("beach"))), note: "Beach access can strongly shape recreation and weekend life." },
    { label: "Mountains", value: categoryValue(getSpecificCategoryValue("mountain", categoryListValue([destination.knowledgeProfile?.mountains?.join(", ")]), getNamedResourceValues("mountain"))), note: "Mountains and natural landscapes add a layer of weekend escape." },
    { label: "Parks", value: categoryValue(getSpecificCategoryValue("park", categoryListValue([destination.knowledgeProfile?.parks?.join(", ")]), getNamedResourceValues("park"))), note: "Parks shape how a city feels in both weekdays and weekends." },
  ];
  }, [destination]);
  const availableFacts = essentialFacts.filter((fact) => fact.value !== categoryPlaceholder);
  const heroFacts = availableFacts.slice(0, 4);
  // Currency/Language/Time zone/Visa friendly/Airport access/Healthcare are essentialFacts
  // subjects with no other polished, exact-label home elsewhere on the page (walkability, safety,
  // family, pets, retirement, cost, and lifestyle-interest facts are all covered by the Cost of
  // living, Practical Living Snapshot, Community and Personal Comfort, or Lifestyle & Recreation
  // sections under their own headings) - guaranteed into the existing "What to know first" panel
  // regardless of how many other facts rank ahead of them, instead of being silently crowded out
  // when the redundant Executive Summary / "at a glance" grid was removed (that grid used to show
  // every remaining fact, not just the first six).
  const UNIQUE_SCALAR_FACT_LABELS = ["Currency", "Language", "Time zone", "Visa friendly", "Airport access", "Healthcare"];

  // STEP 8: representative UI for the rich v3.1 modules that have no existing dedicated section -
  // built entirely from real persisted rows. A module with zero rows is simply omitted from this
  // list, never replaced with generic prose.
  const v31RichModuleCards = useMemo(() => {
    const modules = destination.v31Modules;
    if (!modules) return [] as Array<{ title: string; lines: string[] }>;
    const cards: Array<{ title: string; lines: string[] }> = [];
    const singletonLines = (rows: ReadonlyArray<{ summary: string | null } & Record<string, string | null>>, extraKeys: string[] = []) =>
      rows
        .flatMap((row) => [row.summary, ...extraKeys.map((key) => row[key])])
        .filter((value) => value !== null && value !== undefined && String(value).trim().length > 0)
        .map((value) => String(value));

    if (modules.costOfLiving.length > 0) {
      cards.push({ title: "Cost of living", lines: modules.costOfLiving.map((item) => `${item.category ?? "Category"}: ${item.currency ?? ""}${item.monthlyLow ?? "?"}–${item.currency ?? ""}${item.monthlyHigh ?? "?"}/month`) });
    }
    if (modules.climateMonthly.length > 0) {
      cards.push({ title: "Climate (monthly)", lines: modules.climateMonthly.slice(0, 6).map((item) => `${item.monthKey}: ${item.avgLowTemp ?? "?"}–${item.avgHighTemp ?? "?"}°`) });
    }
    if (modules.housing.length > 0) {
      cards.push({ title: "Housing / property", lines: singletonLines(modules.housing, ["buyingSummary", "rentalSummary"]) });
    }
    if (modules.healthcare.length > 0) {
      cards.push({ title: "Healthcare", lines: singletonLines(modules.healthcare, ["publicAccessSummary", "insuranceSummary"]) });
    }
    if (modules.visaResidency.length > 0) {
      cards.push({ title: "Visa / residency", lines: singletonLines(modules.visaResidency, ["residencyPath", "citizenshipPath"]) });
    }
    if (modules.taxesFinance.length > 0) {
      cards.push({ title: "Taxes / finance", lines: singletonLines(modules.taxesFinance, ["notes"]) });
    }
    if (modules.lgbtqInclusivity.length > 0) {
      cards.push({ title: "LGBTQ inclusivity", lines: singletonLines(modules.lgbtqInclusivity, ["culturalNotes"]) });
    }
    if (modules.safetyRisks.length > 0) {
      cards.push({ title: "Safety", lines: modules.safetyRisks.map((item) => `${item.topic ?? "Topic"} (${item.severity ?? "n/a"}): ${item.summary ?? ""}`) });
    }
    if (modules.transportation.length > 0) {
      cards.push({ title: "Transportation", lines: singletonLines(modules.transportation, ["airportSummary", "transitSummary"]) });
    }
    if (modules.remoteWork.length > 0) {
      cards.push({ title: "Remote work", lines: singletonLines(modules.remoteWork, ["internetSummary", "timezoneSummary"]) });
    }
    if (modules.languageIntegration.length > 0) {
      cards.push({ title: "Language / integration", lines: singletonLines(modules.languageIntegration, ["englishSupport"]) });
    }
    if (modules.pets.length > 0) {
      cards.push({ title: "Pets", lines: singletonLines(modules.pets, ["petFriendlyNotes"]) });
    }
    if (modules.familyEducation.length > 0) {
      cards.push({ title: "Family / education", lines: singletonLines(modules.familyEducation, ["schoolsSummary"]) });
    }
    if (modules.communitySocial.length > 0) {
      cards.push({ title: "Community / social", lines: singletonLines(modules.communitySocial, ["socialNotes"]) });
    }
    if (modules.accessibility.length > 0) {
      cards.push({ title: "Accessibility", lines: singletonLines(modules.accessibility, ["mobilityNotes"]) });
    }
    if (modules.bureaucracySetup.length > 0) {
      cards.push({ title: "Bureaucracy / setup", lines: singletonLines(modules.bureaucracySetup, ["setupNotes"]) });
    }
    if (modules.workBusiness.length > 0) {
      cards.push({ title: "Work / business", lines: singletonLines(modules.workBusiness, ["remoteWorkNotes"]) });
    }
    if (modules.retirementAging.length > 0) {
      cards.push({ title: "Retirement / aging", lines: singletonLines(modules.retirementAging, ["agingNotes"]) });
    }
    if (modules.lifestyleLaws.length > 0) {
      cards.push({ title: "Lifestyle / laws", lines: singletonLines(modules.lifestyleLaws, ["legalNotes"]) });
    }
    if (modules.realityCheck.length > 0) {
      cards.push({ title: "Reality checks", lines: modules.realityCheck.map((item) => `${(item as { title?: string }).title ?? "Note"} (${(item as { severity?: string }).severity ?? "n/a"}): ${item.summary ?? ""}`) });
    }
    return cards.filter((card) => card.lines.length > 0);
  }, [destination.v31Modules]);

  // Compact, public-facing curated sections built from the same real v3.1 modules as the
  // developer-only debug list above - sanitized (no internal enum tokens) and never fabricated;
  // a section/line only appears when real, sanitized content exists for it.
  const singletonSanitizedLines = (rows: ReadonlyArray<{ summary: string | null } & Record<string, string | null>> | undefined, extraKeys: string[] = []) =>
    (rows ?? [])
      .flatMap((row) => [row.summary, ...extraKeys.map((key) => row[key])])
      .map((value) => sanitizePublicText(value))
      .filter((value): value is string => value !== null)
      .filter((value, index, all) => all.indexOf(value) === index);

  const practicalLivingSnapshot = useMemo(() => {
    const modules = destination.v31Modules;
    if (!modules) return [] as Array<{ label: string; lines: string[] }>;
    const items: Array<{ label: string; lines: string[] }> = [];
    const personalSafety = buildPersonalSafetySignal(destination);
    if (personalSafety.documented) items.push({ label: "Personal safety", lines: [personalSafety.value] });
    const walkabilityLines = singletonSanitizedLines(modules.accessibility, ["mobilityNotes"]);
    if (walkabilityLines.length > 0) items.push({ label: "Walkability and terrain", lines: walkabilityLines });
    const accessibilityLines = singletonSanitizedLines(modules.accessibility, ["mobilityNotes"]);
    if (accessibilityLines.length > 0) items.push({ label: "Accessibility", lines: accessibilityLines });
    const dailyLines = singletonSanitizedLines(modules.dailyLifePracticality ? [modules.dailyLifePracticality] : [], ["practicalityNotes"]);
    if (dailyLines.length > 0) items.push({ label: "Daily errands and convenience", lines: dailyLines });
    const transportLines = singletonSanitizedLines(modules.transportation, ["airportSummary", "transitSummary"]);
    if (transportLines.length > 0) items.push({ label: "Local transportation and airport access", lines: transportLines });
    const internetLines = singletonSanitizedLines(modules.remoteWork, ["internetSummary"]);
    if (internetLines.length > 0) items.push({ label: "Internet and remote-work reliability", lines: internetLines });
    const languageLines = singletonSanitizedLines(modules.languageIntegration, ["englishSupport"]);
    if (languageLines.length > 0) items.push({ label: "Language ease", lines: languageLines });
    const healthcareLines = singletonSanitizedLines(modules.healthcare, ["publicAccessSummary", "insuranceSummary"]);
    if (healthcareLines.length > 0) items.push({ label: "Healthcare access", lines: healthcareLines });
    return dedupeCardsByNormalizedValue(items);
  }, [destination.v31Modules, destination]);

  const communityAndPersonalComfort = useMemo(() => {
    const modules = destination.v31Modules;
    if (!modules) return [] as Array<{ label: string; lines: string[] }>;
    const items: Array<{ label: string; lines: string[] }> = [];
    const communityLines = singletonSanitizedLines(modules.communitySocial, ["socialNotes"]);
    if (communityLines.length > 0) items.push({ label: "Social integration and community character", lines: communityLines });
    const lgbtqLines = singletonSanitizedLines(modules.lgbtqInclusivity, ["culturalNotes"]);
    if (lgbtqLines.length > 0) {
      items.push({ label: "LGBTQ+ considerations", lines: [...lgbtqLines, "This reflects general legal and cultural context only - not individualized legal advice, and not a guarantee of safety or comfort."] });
    }
    const familyLines = singletonSanitizedLines(modules.familyEducation, ["schoolsSummary"]);
    if (familyLines.length > 0) items.push({ label: "Family", lines: familyLines });
    const petLines = singletonSanitizedLines(modules.pets, ["petFriendlyNotes"]);
    if (petLines.length > 0) items.push({ label: "Pets", lines: petLines });
    return dedupeCardsByNormalizedValue(items);
  }, [destination.v31Modules]);

  const realityAndEnvironment = useMemo(() => {
    const modules = destination.v31Modules;
    if (!modules) return [] as Array<{ label: string; lines: string[] }>;
    const items: Array<{ label: string; lines: string[] }> = [];
    const climateLines = modules.climateMonthly.length > 0
      ? [`Typical monthly range: ${modules.climateMonthly.map((item) => `${item.avgLowTemp ?? "?"}\u2013${item.avgHighTemp ?? "?"}\u00b0`).slice(0, 3).join(", ")}`]
      : singletonSanitizedLines(destination.climate ? [{ summary: destination.climate }] : []);
    if (climateLines.length > 0) items.push({ label: "Climate realities", lines: climateLines });
    const environmentLines = singletonSanitizedLines(modules.environmentQuality ? [modules.environmentQuality] : [], ["qualityNotes"]);
    // Personal-safety-only rows (e.g. petty_theft, fraud) are excluded here - they belong under
    // Personal Safety, not Environmental risk; a composite row (e.g. hurricane-flood-crime) still
    // legitimately appears in both since it is genuinely about both.
    const hazardLines = singletonSanitizedLines(modules.safetyRisks.filter((row) => isEnvironmentallyRelevantTopic(row.topic)) as unknown as Array<{ summary: string | null } & Record<string, string | null>>);
    const combinedHazardLines = [...environmentLines, ...hazardLines].filter((value, index, all) => all.indexOf(value) === index);
    if (combinedHazardLines.length > 0) items.push({ label: "Environmental and natural-hazard risks", lines: combinedHazardLines });
    const seasonalityLines = modules.eventsSeasonality.map((item) => sanitizePublicText(item.seasonalityNotes) || sanitizePublicText(item.summary)).filter((value): value is string => value !== null).filter((value, index, all) => all.indexOf(value) === index);
    if (seasonalityLines.length > 0) items.push({ label: "Crowds and seasonality", lines: seasonalityLines.slice(0, 3) });
    const realityLines = modules.realityCheck.map((item) => sanitizePublicText(item.summary)).filter((value): value is string => value !== null);
    if (realityLines.length > 0) items.push({ label: "Who tends to love or struggle with this destination", lines: realityLines });
    return dedupeCardsByNormalizedValue(items);
  }, [destination.v31Modules, destination]);

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
  // STEP 5: destination-level scores only - map the real persisted DESTINATION_SCORES rows into
  // the score-card UI. Hide the section (empty array) rather than inventing a score when a v3.1
  // destination genuinely has none. The hardcoded 76/74/72/78 defaults are never used for a
  // resolved v3.1 destination. This is a display mapping only - no personalized quiz/match/
  // recommendation scoring logic is introduced here.
  // A handful of score_key tokens don't read well under plain Title Case splitting (e.g.
  // "walkability_transport" -> "Walkability Transport") - these get a specific, clearer label;
  // any other token still falls back to the generic Title Case conversion.
  const KNOWN_SCORE_KEY_LABELS: Record<string, string> = {
    walkability_transport: "Walkability & Transportation",
    tax_visa: "Tax & Visa",
    lgbtq: "LGBTQ+",
  };
  const v31ScoreLabel = (scoreKey: string) => KNOWN_SCORE_KEY_LABELS[scoreKey.toLowerCase()] || scoreKey.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
  // The workbook's real DESTINATION_SCORES values are on a 0-10 scale (e.g. 7, 9) - the UI always
  // displays "/100", so a sub-11 raw value is scaled up ×10 for display only; the stored workbook
  // value itself is never altered. A value already above 10 (a future 0-100-scale workbook) is
  // left as-is. Shared with buildPersonalSafetySignal's safety-score distinction above.
  const scoreCards = hasV31Bundle
    ? (destination.v31Modules?.scores ?? []).map((score) => ({
        name: v31ScoreLabel(score.scoreKey),
        weight: 0,
        score: score.scoreValue ? normalizeScoreToHundred(Number(score.scoreValue)) : 0,
        label: score.scoreLabel ?? undefined,
      }))
    : destination.scoring.length > 0
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

  // STEP 6: persisted neighborhood rows are authoritative for a v3.1 destination - never fall
  // back to the legacy engine's generic "${city} center" single entry, and never fabricate one
  // when a destination genuinely has zero persisted neighborhoods (the section is simply empty).
  // Up to 8 real persisted neighborhoods are made available and all are rendered directly.
  const neighborhoods = (hasV31Bundle
    ? (destination.v31Modules?.neighborhoods ?? []).map((item) => ({
        name: item.name ?? item.neighborhoodKey,
        neighborhoodKey: item.neighborhoodKey as string | undefined,
        whyItWorks: item.summary ?? "",
        // Real human-authored "best for" copy only - areaType is an internal category token
        // (e.g. "downtown_core") and must never be shown to a customer in this slot.
        fit: item.bestFor ?? "",
        vibe: item.summary ?? "",
        walkabilityRating: item.walkabilityRating,
        safetyRating: item.safetyRating,
        transitRating: item.transitRating,
        housingCharacter: item.housingCharacter,
        pros: item.pros,
        cons: item.cons,
        googleMapsUrl: item.googleMapsUrl,
      }))
    : premiumContent.neighborhoodGuides.length > 0 ? premiumContent.neighborhoodGuides : destination.neighborhoods.map((name) => ({ name, whyItWorks: `${name} helps anchor the city’s local character.`, fit: `Best for residents who want a neighborhood identity that feels specific and lived in.`, vibe: `It offers a clear local rhythm and strong daily-life texture.` }))).slice(0, 8).map((item) => {
    const profile = getNeighborhoodProfile(destination, item.name);
    const summary = profile?.summary?.trim() || item.whyItWorks || `${item.name} helps anchor the city’s local character.`;
    const fit = profile?.intelligence?.find((metric) => /family|pet|remote|transit|walk/i.test(metric.key))?.value || item.fit || `Best for residents who want a neighborhood identity that feels specific and lived in.`;
    const vibe = profile?.summary?.trim() || item.vibe || `It offers a clear local rhythm and strong daily-life texture.`;

    return {
      ...item,
      profile,
      whyItWorks: summary,
      fit,
      vibe,
    };
  });
  const golfGroups = (destination.neighborhoodIntelligence?.length ? destination.neighborhoodIntelligence : buildNeighborhoodIntelligenceSeedData(destination))
    .filter((group) => /golf/i.test(group.category))
    .slice(0, 4);
  const destinationGolfSummary = [
    destination.knowledgeProfile?.golf?.join(", ") || destination.golf?.join(", ") || null,
    golfGroups.length > 0 ? `${golfGroups.length} verified golf-focused neighborhood records` : null,
  ].filter(Boolean).join(" • ");

  // A "Daily life" living-rhythm card used to render here too, but its title and visible preview
  // (premiumContent.dailyLifeArticle || destination.dailyLife) were identical to the standalone
  // "Daily life" Guide card below - which carries genuinely richer, section-specific
  // Morning/Afternoon/Evening/Seasonal-rhythm body content. The redundant version is suppressed
  // here rather than duplicated; the richer Guide card is the one retained.
  const deepDiveSections = [
    {
      title: "Getting around",
      eyebrow: "Movement",
      summary: premiumContent.transportationArticle || destination.transportation,
      body: buildDedupedSectionBody([["Transportation", destination.transportation], ["Walkability", destination.walkability], ["Internet", destination.internet]]),
    },
    {
      title: "Climate and recreation",
      eyebrow: "Seasonal living",
      summary: premiumContent.climateArticle || destination.climate,
      body: buildDedupedSectionBody([["Climate", destination.climate], ["Weather", destination.weather], ["Outdoor recreation", destination.outdoorRecreation.slice(0, 4).join(" • ")]]),
    },
    {
      title: "Who it suits",
      eyebrow: "Fit and tradeoffs",
      summary: premiumContent.retirementGuide || destination.retirement,
      body: buildDedupedSectionBody([["Retirement fit", destination.retirement], ["Family fit", destination.family], ["Digital nomad fit", destination.digitalNomad], ["Personal safety", buildPersonalSafetySignal(destination).value]]),
    },
  ];
  // Three "living rhythm" headings are always offered, but the destination's underlying facts don't
  // always support three genuinely distinct summaries - never repeat the same real sentence under a
  // second heading just to fill the grid; a section is dropped rather than duplicated.
  const seenDeepDiveSummaries = new Set<string>();
  const dedupedDeepDiveSections = deepDiveSections.filter((section) => {
    const normalized = (section.summary ?? "").trim().toLowerCase();
    if (!normalized) return true;
    if (seenDeepDiveSummaries.has(normalized)) return false;
    seenDeepDiveSummaries.add(normalized);
    return true;
  });

  const developerExitHref = `/destinations/${destination.slug}`;
  const destinationLocation = [destination.knowledgeProfile?.adminRegion, destination.country].filter(Boolean).join(" / ");
  const firstSixFacts = availableFacts.slice(0, 6);
  const firstSixFactLabels = new Set(firstSixFacts.map((fact) => fact.label));
  const whatToKnowFirstFacts = [
    ...firstSixFacts,
    ...availableFacts.filter((fact) => UNIQUE_SCALAR_FACT_LABELS.includes(fact.label) && !firstSixFactLabels.has(fact.label)),
  ];
  // Genuinely empty after real-data-then-fallback resolution - the whole section is hidden rather
  // than rendering an empty "Pros and cons" heading with two blank columns.
  const resolvedPros = destination.pros.length > 0 ? destination.pros : premiumContent.prosAndCons.advantages;
  const resolvedCons = destination.cons.length > 0 ? destination.cons : premiumContent.prosAndCons.disadvantages;
  const hasProsOrCons = resolvedPros.length > 0 || resolvedCons.length > 0;
  const visibleNeighborhoods = neighborhoodsExpanded ? neighborhoods : neighborhoods.slice(0, 4);

  return (
    <>
      <Navbar />
      <main className="space-y-7 bg-[linear-gradient(180deg,#03142a_0%,#061d37_45%,#03142a_100%)] pb-28 pt-[72px] text-[#edf2fb] sm:space-y-8 sm:pb-32">
        <section className="relative isolate min-h-[600px] overflow-hidden border-b border-[#d8ad554f] bg-[#03142a]">
          <Image src={executiveSummaryImage.resolvedUrl} alt={executiveSummaryImage.altText || destination.title} fill sizes="100vw" preload unoptimized className="z-0 object-cover object-center" onError={() => handleMediaError(executiveSummaryImage.resolvedUrl ?? executiveSummaryImage.url)} />
          <div className="absolute inset-0 z-10 bg-[linear-gradient(90deg,rgba(2,13,29,0.88)_0%,rgba(3,20,42,0.7)_42%,rgba(3,20,42,0.16)_76%,rgba(2,13,29,0.3)_100%)]" />
          <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(2,12,27,0.04)_25%,rgba(2,13,29,0.82)_100%)]" />
          <div className="relative z-20 mx-auto flex min-h-[600px] max-w-[1440px] flex-col justify-end px-5 pb-6 pt-8 sm:px-8 sm:pb-8 lg:px-10">
            <div className="grid items-end gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
              <div className="max-w-3xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f0bd56]">DestinationFinderAI premium guide</p>
                {destinationLocation ? <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#69d5d4]">{destinationLocation}</p> : null}
                <h1 className="mt-3 font-serif text-5xl font-semibold leading-none text-[#fff8e9] sm:text-6xl lg:text-7xl">{destination.title}</h1>
                <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-[#e5edf6] sm:text-lg">{destination.subtitle}</p>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#c7d5e2] sm:text-[15px]">{premiumContent.heroIntroduction}</p>
              </div>
              <aside className="border border-[#d8ad554f] bg-[#03172edb] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#55c7c9]">Destination intelligence</p>
                <div className="mt-3 divide-y divide-white/10">
                  {heroFacts.map((fact) => (
                    <div key={fact.label} className="grid grid-cols-[110px_1fr] gap-3 py-2.5 text-sm">
                      <span className="text-[#eabc5b]">{fact.label}</span>
                      <strong className="text-right font-semibold text-[#edf2fb]">{fact.value}</strong>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Still plain native anchors (no panel show/hide, no role="tab" misuse - there is only
            ever one continuous scrolling page) so keyboard/link semantics and existing behavior
            are fully preserved; only visual prominence and a lightweight scroll-position indicator
            (aria-current, the correct attribute for "current item in a set of page sections") were
            added. Mirrors the proven DestinationStickyNav pattern, kept as a sibling of (not nested
            inside) the hero so sticky positioning is not fighting the hero's flex-col justify-end layout. */}
        <nav aria-label="Explore this destination" className="sticky top-[72px] z-30 border-y border-[#d8ad5548] bg-[#03172ee6] backdrop-blur-2xl shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
          <div className="mx-auto max-w-[1440px] px-5 pt-3 sm:px-8 lg:px-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#69d5d4]">Explore this destination</p>
          </div>
          <div className="mx-auto max-w-[1440px] overflow-x-auto px-5 pb-3 pt-2 sm:px-8 lg:px-10">
            <ul className="flex min-w-max items-stretch gap-2.5 text-sm sm:gap-3">
              {SECTION_TABS.map((tab) => {
                const isActive = activeSectionId === tab.id;
                return (
                  <li key={tab.id} className="flex-1">
                    <a
                      href={`#${tab.id}`}
                      aria-current={isActive ? "true" : undefined}
                      className={`flex min-h-[3.25rem] w-full flex-col justify-center rounded-2xl border-2 px-4 py-2 text-center font-semibold transition sm:min-w-[200px] sm:text-left ${
                        isActive
                          ? "border-[#f3c666] bg-[#f3c666] text-[#03172e] shadow-[0_10px_24px_rgba(243,198,102,0.35)]"
                          : "border-[#d8ad5548] bg-white/5 text-[#d9e4ee] hover:border-cyan-400/60 hover:bg-white/10 hover:text-[#f3c666]"
                      }`}
                    >
                      <span className="text-[15px] leading-tight">{tab.label}</span>
                      <span className={`mt-0.5 hidden text-[11px] font-normal leading-tight sm:block ${isActive ? "text-[#03172e]/70" : "text-[#9eb2c6]"}`}>{tab.descriptor}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* The full editorial overview - shown once, in full, immediately after the hero/nav,
            directly above the Executive Summary facts grid. This is the single canonical
            rendering; every other place that used to repeat this same text has been removed
            rather than duplicated. */}
        {(premiumContent.overviewArticle || destination.overview) ? (
          <section className="mx-5 border border-[#d8ad5548] bg-[#061a32] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.18)] sm:mx-8 sm:p-6 lg:mx-10">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Overview</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">The complete picture of {destination.title}</h2>
            <p className="mt-4 text-sm leading-8 text-slate-300 whitespace-pre-line">{premiumContent.overviewArticle || destination.overview}</p>
          </section>
        ) : null}

        {/* Hidden entirely (never an empty "0 budget bands" shell) when the destination genuinely
            has no real cost-of-living summary or budget rows - an honest absence, never a
            fabricated placeholder. */}
        {(costProfile.summary || costProfile.budgets.length > 0) ? (
        <section className="mx-5 border border-[#d8ad5548] bg-[#061a32] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.18)] sm:mx-8 sm:p-6 lg:mx-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Cost of living snapshot</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">A practical executive summary for residents and relocators</h2>
          </div>
          {costProfile.budgets.length > 0 ? <p className="text-sm text-slate-400">{costProfile.budgets.length} budget bands</p> : null}
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.5rem] border border-cyan-400/20 bg-cyan-500/10 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300">Executive summary</p>
            {costProfile.summary ? <p className="mt-3 text-sm leading-8 text-slate-200">{costProfile.summary}</p> : null}
            <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-slate-300">
              <span className="rounded-full border border-white/10 bg-slate-950/40 px-3 py-2">{costProfile.currency}</span>
              <span className="rounded-full border border-white/10 bg-slate-950/40 px-3 py-2">{costProfile.confidence} confidence</span>
            </div>
          </div>
          {costProfile.budgets.length > 0 ? (
          <div className="space-y-3 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            {costProfile.budgets.map((budget, index) => (
              <div key={`${budget.label}-${index}`} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <p className="text-sm font-semibold text-white">{budget.label}</p>
                <p className="mt-2 text-lg font-semibold text-cyan-300">{budget.amount}</p>
                {budget.note ? <p className="mt-2 text-sm leading-7 text-slate-300">{budget.note}</p> : null}
              </div>
            ))}
          </div>
          ) : null}
        </div>
      </section>
      ) : null}

      {costProfile.categories.length > 0 ? (
      <section className="rounded-[2rem] border border-white/20 bg-slate-900/70 p-8 shadow-[0_20px_70px_rgba(2,8,23,0.22)] sm:p-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Monthly cost breakdown</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">The detailed budget categories that shape the monthly picture</h2>
          </div>
          <p className="text-sm text-slate-400">{costProfile.categories.length} live categories</p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {costProfile.categories.map((category) => (
            <div key={category.key} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">{category.label}</p>
              {category.amount ? <p className="mt-2 text-lg font-semibold text-cyan-300">{category.amount}</p> : null}
              {category.note ? <p className="mt-2 text-sm leading-7 text-slate-300">{category.note}</p> : null}
            </div>
          ))}
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
      ) : null}

      <section className="rounded-[2rem] border border-white/20 bg-slate-900/70 p-8 shadow-[0_20px_70px_rgba(2,8,23,0.22)] sm:p-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Media and atmosphere</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Photos, streets, and daily life</h2>
          </div>
          <p className="text-sm text-slate-400">{galleryItems.length} curated assets</p>
        </div>
        <div className={`mt-5 grid gap-3 ${previewGalleryItems.length > 2 ? "md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2" : "md:grid-cols-2"}`}>
          {previewGalleryItems.map((item, index) => (
            <button key={`${item.url}-${index}`} type="button" onClick={() => openGalleryItem(item, index)} className={`group relative min-h-52 overflow-hidden border border-white/10 bg-[#08223c] text-left shadow-[0_16px_40px_rgba(0,0,0,0.22)] ${index === 0 && previewGalleryItems.length > 2 ? "md:col-span-2 lg:row-span-2 lg:min-h-[29rem]" : "lg:min-h-56"}`}>
              <img src={item.resolvedUrl} alt={item.altText || item.caption || destination.title} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" onError={() => handleMediaError(item.resolvedUrl ?? item.url)} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#021326f2] via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-xs leading-5 text-[#d5e0ea]">{item.caption || item.altText || item.kind}</div>
            </button>
          ))}
        </div>
        <div className="mt-6 flex justify-start">
          <a
            href={googleImagesHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:border-cyan-400/50 hover:bg-cyan-500/20"
          >
            View more photos of {destination.title}
          </a>
        </div>
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
              <img src={selectedMedia.resolvedUrl ?? selectedMedia.url} alt={selectedMedia.altText || selectedMedia.caption || destination.title} className="max-h-[72vh] w-full rounded-[1.5rem] object-contain transition duration-300" onError={() => { handleMediaError(selectedMedia.resolvedUrl ?? selectedMedia.url); setSelectedMedia(null); }} />
            </div>
            <p className="mt-3 px-2 text-sm leading-7 text-slate-300">{selectedMedia.caption || selectedMedia.altText || selectedMedia.kind}</p>
            {selectedMedia.attribution ? (
              <p className="mt-1 px-2 text-xs leading-6 text-slate-500">
                {selectedMedia.sourceUrl ? (
                  <a href={selectedMedia.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="underline decoration-slate-600 underline-offset-2 hover:text-slate-300">
                    {selectedMedia.attribution}
                  </a>
                ) : selectedMedia.attribution}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      <section id="destination-guide" className="scroll-mt-28 space-y-8">
        <h2 className="font-serif text-3xl text-[#fff8e9]">Destination Guide</h2>
        <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-[0_20px_60px_rgba(2,8,23,0.16)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Destination guide</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">A magazine-style introduction to {destination.title}</h2>
              </div>
            </div>
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300">What you&apos;ll learn</p>
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
                  {whatToKnowFirstFacts.map((fact) => (
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
      </section>

      <section id="practical-details" className="scroll-mt-28 space-y-8">
        <h2 className="font-serif text-3xl text-[#fff8e9]">Practical Details</h2>
        <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-[0_20px_60px_rgba(2,8,23,0.16)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Premium intelligence</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Scores and fit</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {scoreCards.length > 0 ? (
                <div className="rounded-3xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200">{scoreCards.length} decision lenses</div>
              ) : null}
              {developerMode ? (
                <Link href={developerExitHref} className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/40 hover:text-cyan-200">
                  Exit developer view
                </Link>
              ) : null}
            </div>
            </div>
            <div className="mt-6 divide-y divide-white/10 border-y border-white/10">
              {scoreCards.map((category) => (
                <div key={category.name} className="grid items-center gap-3 py-4 sm:grid-cols-[180px_minmax(0,1fr)_90px]">
                  <div>
                    <p className="text-sm font-semibold text-[#edf2fb]">{category.name}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#eabc5b]">{hasV31Bundle ? (category as { label?: string }).label ?? "Destination attribute" : `${category.weight}% weight`}</p>
                  </div>
                  <div className="h-2 overflow-hidden bg-[#03142a]" aria-hidden="true">
                    <div className="h-full bg-[linear-gradient(90deg,#11aeb6,#55c7c9,#f0bd56)]" style={{ width: `${Math.max(0, Math.min(category.score, 100))}%` }} />
                  </div>
                  <p className="text-left font-serif text-3xl text-[#69d5d4] sm:text-right">{category.score}/100</p>
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
              {/* One-adult/couple totals and the category breakdown are already presented in full
                  in the "Cost of living snapshot" and "Monthly cost breakdown" sections above -
                  repeating every budget and category card here again duplicated the same total
                  multiple times on the page, so this teaser only links back to that detail. */}
              {costProfile.budgets.length > 0 ? (
                <div className="mt-6 flex flex-wrap gap-3">
                  {costProfile.budgets.map((budget, index) => (
                    <span key={`${budget.label}-${index}`} className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-100">
                      {budget.label}: <span className="font-semibold text-cyan-300">{budget.amount}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-6 text-sm leading-8 text-slate-400">{premiumContent.costOfLivingArticle}</p>
              )}
            </article>
          </section>

          {hasProsOrCons ? (
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
                  {resolvedPros.map((item) => <li key={item} className="text-sm leading-7 text-slate-300">• {item}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-300">Cons</h3>
                <ul className="mt-3 space-y-2">
                  {resolvedCons.map((item) => <li key={item} className="text-sm leading-7 text-slate-300">• {item}</li>)}
                </ul>
              </div>
            </div>
          </section>
          ) : null}

          <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-[0_20px_60px_rgba(2,8,23,0.16)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Neighborhood summary</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">How the city is experienced block by block</h2>
              </div>
              <div className="rounded-3xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200">{neighborhoods.length} districts</div>
            </div>
            <div className="mt-6 space-y-4">
              {visibleNeighborhoods.map((neighborhood, index) => (
                <ExpandableNeighborhoodCard key={neighborhood.name} neighborhood={neighborhood} index={index} destination={destination} />
              ))}
            </div>
            {neighborhoods.length > 4 ? (
              <div className="mt-5 flex justify-center">
                <button
                  type="button"
                  onClick={() => setNeighborhoodsExpanded((current) => !current)}
                  aria-expanded={neighborhoodsExpanded}
                  className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-5 py-2.5 text-sm font-semibold text-cyan-200 transition hover:border-cyan-400/70 hover:bg-cyan-500/20"
                >
                  {neighborhoodsExpanded ? "Show fewer neighborhoods" : `Show ${neighborhoods.length - 4} more neighborhoods (view all ${neighborhoods.length})`}
                </button>
              </div>
            ) : null}
          </section>

          <DestinationHighlightsSection destination={destination} />

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
                        <a key={`${group.title}-${resource.label}-${resource.url}`} href={resource.url} target="_blank" rel="noopener noreferrer" className="block rounded-2xl border border-white/10 bg-slate-950/30 px-3 py-3 text-sm text-slate-300">
                          {resource.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </section>

        <section id="deep-dive" className="scroll-mt-28 space-y-8">
          <h2 className="font-serif text-3xl text-[#fff8e9]">Deep Dive</h2>

          <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-[0_20px_60px_rgba(2,8,23,0.16)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Editorial overview</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">The living rhythms that shape the place</h2>
              </div>
            </div>
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              {dedupedDeepDiveSections.map((section) => (
                <PremiumSectionBlock key={section.title} title={section.title} summary={section.summary} body={section.body} eyebrow={section.eyebrow} />
              ))}
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            {premiumContent.dailyLifeArticle ? <PremiumSectionBlock title="Daily life" summary={premiumContent.dailyLifeArticle} body={buildDedupedSectionBody([["Morning", destination.heroNarrative], ["Afternoon", destination.dailyLife], ["Evening", destination.editorial], ["Seasonal rhythm", destination.climate]])} eyebrow="Living there" /> : null}
            {premiumContent.climateArticle ? <PremiumSectionBlock title="Climate" summary={premiumContent.climateArticle} body={destination.climate} eyebrow="Weather" /> : null}
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            {premiumContent.transportationArticle ? <PremiumSectionBlock title="Transportation" summary={premiumContent.transportationArticle} body={buildDedupedSectionBody([["Airport access", destination.airportInfo || destination.knowledgeProfile?.majorAirports?.join(", ") || "Regional and international access"], ["Transit", destination.transportation], ["Car dependency", destination.transportation], ["Walking and cycling", destination.walkability], ["Typical commute", destination.transportation]])} eyebrow="Movement" /> : null}
            {/* The prior "Cost of living" card here duplicated the already-rendered budgets/
                categories above AND mislabeled the same destination.costOfLiving scalar as three
                different, unrelated fields (Rent/Utilities/Taxes) - removed rather than repeated
                or left semantically wrong; the authoritative cost section above is the single
                source for these figures. */}
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            {premiumContent.healthcareArticle ? <PremiumSectionBlock title="Healthcare" summary={premiumContent.healthcareArticle} body={buildDedupedSectionBody([["Top hospitals", destination.knowledgeProfile?.majorHospitals?.join(", ") || destination.healthcare], ["Specialty care", destination.healthcare], ["Insurance quality", destination.healthcare], ["Emergency care", destination.healthcare], ["Retirement healthcare", destination.retirement], ["Medical tourism", destination.healthcare]])} eyebrow="Wellness" /> : null}
            {premiumContent.retirementGuide ? <PremiumSectionBlock title="Retirement" summary={premiumContent.retirementGuide} body={buildDedupedSectionBody([["Ideal retiree profile", destination.retirement], ["Who should retire here", destination.retirement], ["Who should not", destination.cons.join(", ") || destination.editorial], ["Best neighborhoods", destination.neighborhoods.join(", ") || "A strong district match matters"], ["Climate considerations", destination.climate], ["Healthcare considerations", destination.healthcare], ["Lifestyle", destination.dailyLife], ["Taxes", destination.costOfLiving]])} eyebrow="Retirement" /> : null}
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            {premiumContent.familyGuide ? <PremiumSectionBlock title="Family" summary={premiumContent.familyGuide} body={buildDedupedSectionBody([["School quality", destination.family], ["Activities", destination.dailyLife], ["Safety", destination.safety], ["Parks", destination.knowledgeProfile?.parks?.join(", ")], ["Museums", destination.knowledgeProfile?.museums?.join(", ") || destination.museums.join(", ")], ["Sports", destination.knowledgeProfile?.sports?.join(", ")], ["Healthcare", destination.healthcare], ["Neighborhood recommendations", destination.neighborhoods.join(", ") || destination.city]])} eyebrow="Family" /> : null}
            {premiumContent.digitalNomadGuide ? <PremiumSectionBlock title="Digital nomad" summary={premiumContent.digitalNomadGuide} body={buildDedupedSectionBody([["Internet", destination.internet], ["Coworking", destination.dailyLife], ["Coffee shops", destination.knowledgeProfile?.coffeeShops?.join(", ") || destination.dailyLife], ["Remote work", destination.digitalNomad], ["Visa", destination.knowledgeProfile?.visaInfo || "Requirements vary by citizenship"], ["Monthly costs", destination.monthlyBudgets.map((budget) => `${budget.label}: ${budget.amount}`).join(" \u2022 ")], ["Best neighborhoods", destination.neighborhoods.join(", ") || destination.city]])} eyebrow="Remote work" /> : null}
          </section>

          {/* For a v3.1/workbook-backed destination, this grid used to just restate the exact
              same score number already shown in "Scores and fit" above - no genuinely unique
              explanation exists to preserve, so it's only rendered for legacy destinations, where
              getScoreReason/scoringNotes provide real explanatory prose the bars don't carry. */}
          {!hasV31Bundle ? (
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
          ) : null}

          {[
            { title: "Practical Living Snapshot", items: practicalLivingSnapshot },
            { title: "Community and Personal Comfort", items: communityAndPersonalComfort },
            { title: "Reality and Environment", items: realityAndEnvironment },
          ].filter((panel) => panel.items.length > 0).map((panel) => (
            <section key={panel.title} className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-[0_20px_60px_rgba(2,8,23,0.16)]">
              <h2 className="text-2xl font-semibold text-white">{panel.title}</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {panel.items.map((item) => (
                  <div key={item.label} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">{item.label}</p>
                    <ul className="mt-3 space-y-2">
                      {item.lines.map((line, index) => (
                        <li key={index} className="text-sm leading-6 text-slate-300">{line}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {destination.v31Modules ? (
            <LifestyleRecreationSection
              lifestyleFeatures={destination.v31Modules.lifestyleFeatures ?? []}
              places={destination.v31Modules.places ?? []}
              destinationCity={destination.city}
              destinationCountry={destination.country}
              overviewText={premiumContent.overviewArticle || destination.overview || ""}
            />
          ) : null}

          {/* Raw per-module fields (notes/severity/TriState tokens) - developer/admin diagnostic only, never public. */}
          {hasV31Bundle && developerMode ? (
            <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-[0_20px_60px_rgba(2,8,23,0.16)]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Persisted v3.1 modules</p>
                  <h2 className="mt-3 text-2xl font-semibold text-white">Real destination-specific data</h2>
                </div>
              </div>
              <div className="mt-6 grid border-t border-white/10 md:grid-cols-2">
                {v31RichModuleCards.map((card) => (
                  <div key={card.title} className="border-b border-white/10 py-4 md:px-5 md:[&:nth-child(odd)]:border-r">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#eabc5b]">{card.title}</p>
                    <ul className="mt-2 divide-y divide-white/10">
                      {card.lines.map((line, index) => (
                        <li key={index} className="py-2 text-sm leading-6 text-[#b7c8d8]">{line}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

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
                  <PremiumSectionBlock key={section.id} title={section.title} summary={section.content} body={section.content} eyebrow="Editorial section" />
                ))}
              </div>
            </section>
          ) : null}
        </section>

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
      <Footer />
    </>
  );
}
