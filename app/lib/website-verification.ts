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

export function getPlaceWebsiteDisplayInfo(place: Pick<NeighborhoodIntelligencePlace, "websiteUrl" | "websiteVerified" | "websiteStatus">) {
  const url = place.websiteUrl?.trim();
  if (!url) return null;

  if (!/^https?:\/\//i.test(url)) return null;

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
