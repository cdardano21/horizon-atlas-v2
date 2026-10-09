// Server-only: filesystem integrity checks must never run in a browser bundle.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { EXPANSION_WORKBOOK_REGISTRY, type ExpansionWorkbookRegistryEntry } from "./expansion-workbook-registry";
import { smartShortlistCandidates } from "./smart-shortlist/cohort";
import { loadPublishedCatalogIdentities } from "./published-catalog-identities";

export type ExploreCandidate = { key: string; slug: string; name: string; country: string; summary: string };
export type ExploreProjectionData = {
  candidates: readonly ExploreCandidate[];
  destinationMedia: readonly { key: string; heroImage: { src: string; alt: string } | null }[];
};
export const EXPLORE_PROJECTION_VERSION = 1;
export const exploreProjectionPath = "data/generated-explore-projection.json";
export function projectionDigest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}
export function selectExploreCandidate(candidate: ExploreCandidate): ExploreCandidate {
  const { key, slug, name, country, summary } = candidate;
  return { key, slug, name, country, summary };
}
export function exploreSourceSignature(registry: readonly ExpansionWorkbookRegistryEntry[]): string {
  return projectionDigest({ registry, cohort: smartShortlistCandidates.map(selectExploreCandidate) });
}
export type ExploreProjection = {
  version: number;
  sourceSignature: string;
  digest: string;
  data: ExploreProjectionData;
};

/** Fail closed. Never decode or serve Legacy content when the build artifact is invalid. */
export function validateExploreProjection(
  projection: ExploreProjection,
  registry: readonly ExpansionWorkbookRegistryEntry[] = EXPANSION_WORKBOOK_REGISTRY,
  readWorkbook: (file: string) => Buffer = readFileSync,
): ExploreProjectionData {
  if (projection.version !== EXPLORE_PROJECTION_VERSION
    || projection.sourceSignature !== exploreSourceSignature(registry)
    || projection.digest !== projectionDigest(projection.data)) {
    throw new Error("Explore projection is stale or corrupt; rebuild from validated workbooks");
  }
  const registered = new Set(registry.flatMap(entry => [...entry.expectedDestinationKeys]));
  const { candidates, destinationMedia } = projection.data;
  if (!Array.isArray(candidates) || !Array.isArray(destinationMedia)
    || candidates.length !== registered.size || destinationMedia.length !== registered.size
    || new Set(candidates.map(item => item.key)).size !== registered.size
    || new Set(candidates.map(item => item.slug)).size !== registered.size
    || candidates.some(item => !registered.has(item.key)
      || [item.key, item.slug, item.name, item.country, item.summary].some(value => typeof value !== "string" || !value.trim()))
    || destinationMedia.some((item, index) => item.key !== candidates[index].key
      || (item.heroImage !== null && (typeof item.heroImage.src !== "string" || typeof item.heroImage.alt !== "string")))) {
    throw new Error("Explore projection does not match registered destination ownership");
  }
  for (const entry of registry) {
    if (!entry.expectedSha256 || createHash("sha256")
      .update(readWorkbook(path.resolve(process.cwd(), entry.workbookPath))).digest("hex") !== entry.expectedSha256) {
      throw new Error(`${entry.registryId} failed Explore workbook SHA-256 validation`);
    }
  }
  return projection.data;
}

export async function loadPublishedExploreProjection(): Promise<ExploreProjectionData> {
  const projection: ExploreProjection = JSON.parse(readFileSync(
    path.join(process.cwd(), "data/generated-explore-projection.json"), "utf8",
  ));
  const data = validateExploreProjection(projection);
  // Fresh publication evidence, same exact identity rule as matching discovery.
  const rows = await loadPublishedCatalogIdentities([...new Set(EXPANSION_WORKBOOK_REGISTRY.flatMap(entry => [...entry.expectedDestinationKeys]))]);
  const candidates = data.candidates.filter(candidate => {
    const owners = rows.filter(row => row.destination_key === candidate.key || row.slug === candidate.slug);
    return owners.length === 1 && owners[0].status === "published" && Boolean(owners[0].id)
      && owners[0].destination_key === candidate.key && owners[0].slug === candidate.slug;
  });
  const eligible = new Set(candidates.map(candidate => candidate.key));
  return { candidates, destinationMedia: data.destinationMedia.filter(item => eligible.has(item.key)) };
}
