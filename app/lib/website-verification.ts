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

export function getPlaceWebsiteDisplayInfo(place: Pick<NeighborhoodIntelligencePlace, "websiteUrl" | "websiteVerified" | "websiteStatus">) {
  const url = place.websiteUrl?.trim();
  if (!url) return null;

  if (!/^https?:\/\//i.test(url)) return null;
  if (!isDirectWebsiteUrl(url)) return null;

  const status = normalizeWebsiteVerificationStatus(place.websiteStatus);
  const shouldShow = place.websiteVerified === true && (status === "verified" || status === "redirected");
  if (!shouldShow) return null;

  return {
    url,
    verified: shouldShow,
    status,
  };
}

export function isPlaceWebsiteVisible(place: Pick<NeighborhoodIntelligencePlace, "websiteUrl" | "websiteVerified" | "websiteStatus">) {
  return Boolean(getPlaceWebsiteDisplayInfo(place));
}
