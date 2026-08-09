import type { NeighborhoodIntelligencePlace } from "./canonical-destination-model";

export type WebsiteVerificationStatus = "verified" | "unverified" | "invalid" | "broken" | "parked" | "redirected";

export function normalizeWebsiteVerificationStatus(status?: string | null): WebsiteVerificationStatus {
  if (!status) return "unverified";

  const normalized = status.toLowerCase();
  if (normalized === "verified") return "verified";
  if (normalized === "invalid" || normalized === "broken" || normalized === "parked" || normalized === "redirected") {
    return normalized as WebsiteVerificationStatus;
  }

  return "unverified";
}

function isDirectWebsiteUrl(url: string) {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    if (hostname.includes("instagram") || hostname.includes("facebook") || hostname.includes("twitter") || hostname.includes("x.com") || hostname.includes("tiktok") || hostname.includes("youtube") || hostname.includes("linkedin")) {
      return false;
    }

    if (hostname === "maps.google.com" || hostname === "www.google.com" || hostname === "google.com") {
      return !parsed.pathname.toLowerCase().startsWith("/maps");
    }

    if (hostname.includes("google") && parsed.pathname.toLowerCase().includes("/maps")) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

function normalizeWebsiteTokens(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").split(/\s+/).filter(Boolean);
}

function isMeaningfulIdentityToken(token: string) {
  return token.length > 2 && !["the", "and", "for", "with", "from", "into", "city", "town", "district", "area", "place", "site", "center", "main", "street", "road", "park", "bar", "restaurant", "cafe", "coffee", "hotel", "inn", "house", "club", "store", "shop", "bakery", "pizza", "salon", "spa", "gym", "pharmacy", "market", "mall", "museum", "theater", "garden", "school", "hospital", "clinic", "office", "travel", "tourism", "visit", "guide", "web", "www", "com", "org", "net"].includes(token);
}

function getPlaceIdentityTokens(place: Pick<NeighborhoodIntelligencePlace, "name" | "destinationName" | "neighborhoodName" | "category">) {
  return Array.from(new Set([
    place.name,
    place.destinationName,
    place.neighborhoodName,
    place.category,
  ].flatMap((value) => normalizeWebsiteTokens(value ?? "")))).filter(isMeaningfulIdentityToken);
}

function hasIdentityMatch(url: string, place: Pick<NeighborhoodIntelligencePlace, "name" | "destinationName" | "neighborhoodName" | "category">) {
  const tokens = getPlaceIdentityTokens(place);
  if (!tokens.length) return true;

  const normalizedUrl = url.toLowerCase();
  const parsedUrl = (() => {
    try {
      return new URL(url);
    } catch {
      return null;
    }
  })();
  const hostname = parsedUrl?.hostname.toLowerCase() ?? "";

  const placeNameTokens = normalizeWebsiteTokens(place.name ?? "").filter(isMeaningfulIdentityToken);
  const destinationTokens = normalizeWebsiteTokens(place.destinationName ?? "").filter(isMeaningfulIdentityToken);
  const neighborhoodTokens = normalizeWebsiteTokens(place.neighborhoodName ?? "").filter(isMeaningfulIdentityToken);
  const categoryTokens = normalizeWebsiteTokens(place.category ?? "").filter(isMeaningfulIdentityToken);

  const hasPlaceTokenMatch = placeNameTokens.some((token) => normalizedUrl.includes(token) || hostname.includes(token));
  const hasCategoryMatch = categoryTokens.some((token) => normalizedUrl.includes(token));
  const hasDestinationOrNeighborhoodMatch = [...destinationTokens, ...neighborhoodTokens].some((token) => normalizedUrl.includes(token) || hostname.includes(token));
  const hasCategorySignal = hasCategoryMatch || /\/(restaurant|bar|cafe|coffee|hotel|inn|house|club|store|shop|bakery|pizza|salon|spa|gym|pharmacy|market|mall|museum|theater|park|garden|school|hospital|clinic|office|travel|tourism|visit|guide|attraction)(?:\/|$)/i.test(normalizedUrl);

  if (hasPlaceTokenMatch) return true;
  if (hasCategorySignal || hasDestinationOrNeighborhoodMatch) return false;

  const tokenMatches = tokens.some((token) => normalizedUrl.includes(token) || hostname.includes(token));
  if (tokenMatches) return true;

  return true;
}

function isGenericPlaceName(place: Pick<NeighborhoodIntelligencePlace, "name">) {
  return /\b(restaurant|bar|cafe|coffee|hotel|inn|house|club|store|shop|bakery|pizza|salon|spa|gym|pharmacy|market|mall|museum|theater|park|garden|school|hospital|clinic|office)\b/i.test(place.name ?? "");
}

function isGenericWebsiteUrl(url: string) {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return hostname === "example.com" || hostname === "example.org" || hostname === "example.net" || hostname === "localhost";
  } catch {
    return false;
  }
}

export function getPlaceWebsiteDisplayInfo(place: Pick<NeighborhoodIntelligencePlace, "websiteUrl" | "websiteVerified" | "websiteStatus" | "verified" | "name" | "destinationName" | "neighborhoodName" | "category">) {
  const url = place.websiteUrl?.trim();
  if (!url) return null;

  if (!/^https?:\/\//i.test(url)) return null;
  if (!isDirectWebsiteUrl(url)) return null;

  const status = normalizeWebsiteVerificationStatus(place.websiteStatus);
  const hasExplicitVerification = place.websiteVerified === true && (status === "verified" || status === "redirected");
  const hasExplicitFailure = place.websiteVerified === false || status === "invalid" || status === "broken" || status === "parked";
  const isWorkbookVerifiedPlace = place.verified === true;
  const hasNoVerificationMetadata = place.websiteVerified === undefined && !place.websiteStatus;
  const identityMatches = hasIdentityMatch(url, place);
  const shouldRequireIdentityMatch = isGenericPlaceName(place) && !identityMatches;
  const isRedirectedWebsite = status === "redirected";

  if (hasExplicitFailure) return null;
  if (hasExplicitVerification || (isWorkbookVerifiedPlace && hasNoVerificationMetadata)) {
    if (isRedirectedWebsite && !isGenericWebsiteUrl(url)) {
      return {
        url,
        verified: true,
        status,
      };
    }
    if (!identityMatches) return null;
    if (shouldRequireIdentityMatch) return null;
    if (!identityMatches && isGenericWebsiteUrl(url) && isGenericPlaceName(place)) return null;
    return {
      url,
      verified: true,
      status,
    };
  }

  return null;
}

export function isPlaceWebsiteVisible(place: Pick<NeighborhoodIntelligencePlace, "websiteUrl" | "websiteVerified" | "websiteStatus" | "verified" | "name" | "destinationName" | "neighborhoodName" | "category">) {
  return Boolean(getPlaceWebsiteDisplayInfo(place));
}
