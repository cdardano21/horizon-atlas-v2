import type { Destination } from "./destinations";
import { getPublicDestinations } from "./public-destinations";
import { loadSmartShortlistData, type SmartShortlistData } from "./smart-shortlist/server-data";

type ExploreCandidateData = Pick<SmartShortlistData, "candidates" | "destinationMedia">;

export function buildExploreDestinationList(
  publicDestinations: readonly Destination[],
  candidateData: ExploreCandidateData,
): Destination[] {
  const publicBySlug = new Map(publicDestinations.map((destination) => [destination.slug, destination]));
  const mediaByKey = new Map(candidateData.destinationMedia.map((media) => [media.key, media.heroImage]));
  const seenSlugs = new Set<string>();

  return candidateData.candidates.map((candidate) => {
    if (seenSlugs.has(candidate.slug)) {
      throw new Error(`Duplicate Explore destination slug: ${candidate.slug}`);
    }
    seenSlugs.add(candidate.slug);

    const existing = publicBySlug.get(candidate.slug) ?? publicBySlug.get(candidate.key);
    const heroImage = mediaByKey.get(candidate.key);
    const summary = candidate.summary.trim();

    return {
      ...existing,
      slug: candidate.slug,
      city: candidate.name,
      country: candidate.country,
      emoji: existing?.emoji ?? "",
      match: existing?.match ?? 0,
      description: existing?.description?.trim() || summary,
      overview: existing?.overview?.trim() || summary,
      climate: existing?.climate?.trim() || "",
      lifestyle: existing?.lifestyle?.trim() || "",
      transportation: existing?.transportation?.trim() || "",
      images: existing?.images?.length
        ? existing.images
        : heroImage
          ? [{ src: heroImage.src, alt: heroImage.alt, caption: `${candidate.name}, ${candidate.country}` }]
          : [],
      tags: existing?.tags ?? [],
    };
  });
}

export async function getExploreDestinations(): Promise<Destination[]> {
  const [publicDestinations, candidateData] = await Promise.all([
    getPublicDestinations(),
    loadSmartShortlistData(),
  ]);

  return buildExploreDestinationList(publicDestinations, candidateData);
}