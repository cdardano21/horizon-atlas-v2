import type { MetadataRoute } from "next";
import { loadPublishedExploreProjection } from "./lib/explore-projection";

// Recheck publication at request time, including after a destination is unpublished.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = "https://www.destinationfinderai.com";
  const publicPaths = [
    "", "/destinations", "/smart-shortlist", "/about", "/how-it-works",
    "/pricing", "/resources", "/contact", "/privacy", "/terms",
  ];
  // The existing loader validates registry ownership, workbook integrity and live status.
  // It excludes protected destinations and never falls back to Legacy identities.
  const { candidates } = await loadPublishedExploreProjection();
  const urls = [
    ...publicPaths.map(path => `${origin}${path}`),
    ...candidates.map(candidate => `${origin}/destinations/${encodeURIComponent(candidate.slug)}`),
  ];
  return [...new Set(urls)].map(url => ({ url }));
}
