export type DeterministicPreviewRenderItem = {
  destinationKey: string;
  slug: string | null;
  name: string | null;
  city: string | null;
  country: string | null;
  shortDescription: string | null;
  longDescription: string | null;
  factSummaries: Array<{ label: string; value: string }>;
  scoreSummaries: Array<{ label: string; value: string }>;
  neighborhoodSummaries: Array<{ name: string | null; description: string | null }>;
  placeSummaries: Array<{ name: string | null; category: string | null }>;
  resourceSummaries: Array<{ label: string | null; provider: string | null; url: string | null }>;
  mediaSummaries: Array<{ label: string | null; provider: string | null; url: string | null }>;
};

export type DeterministicPreviewRenderModel = DeterministicPreviewRenderItem[];

const asText = (value: unknown) => {
  if (value == null) return null;
  if (typeof value === "string") return value.trim() || null;
  return String(value).trim() || null;
};

const readRecordValue = (record: Record<string, unknown>, key: string) => asText(record[key]);

export const buildDeterministicPreviewRenderModel = ({ destinations }: { destinations: Array<Record<string, unknown>> }): DeterministicPreviewRenderModel => {
  return destinations.map((destination) => {
    const identity = (destination.identity as Record<string, unknown> | undefined) ?? {};
    const canonicalDestination = (destination.canonicalDestination as Record<string, unknown> | undefined) ?? {};
    const editorial = (canonicalDestination.editorial as Record<string, unknown> | undefined) ?? {};
    const facts = Array.isArray(canonicalDestination.facts) ? (canonicalDestination.facts as Array<Record<string, unknown>>) : [];
    const scores = Array.isArray(canonicalDestination.scores) ? (canonicalDestination.scores as Array<Record<string, unknown>>) : [];
    const neighborhoods = Array.isArray(canonicalDestination.neighborhoods) ? (canonicalDestination.neighborhoods as Array<Record<string, unknown>>) : [];
    const places = Array.isArray(canonicalDestination.places) ? (canonicalDestination.places as Array<Record<string, unknown>>) : [];
    const resources = Array.isArray(canonicalDestination.resources) ? (canonicalDestination.resources as Array<Record<string, unknown>>) : [];
    const media = Array.isArray(canonicalDestination.media) ? (canonicalDestination.media as Array<Record<string, unknown>>) : [];

    return {
      destinationKey: asText(identity.destinationKey) ?? "",
      slug: asText(identity.slug),
      name: asText(identity.name),
      city: asText(identity.city),
      country: asText(identity.country),
      shortDescription: asText(editorial.shortDescription),
      longDescription: asText(editorial.longDescription),
      factSummaries: facts.slice(0, 4).map((fact) => ({ label: readRecordValue(fact, "display_label") ?? readRecordValue(fact, "fact_group") ?? "Fact", value: readRecordValue(fact, "value_text") ?? readRecordValue(fact, "value") ?? "" })),
      scoreSummaries: scores.slice(0, 4).map((score) => ({ label: readRecordValue(score, "score_label") ?? readRecordValue(score, "score_key") ?? "Score", value: readRecordValue(score, "score_value") ?? "" })),
      neighborhoodSummaries: neighborhoods.slice(0, 4).map((neighborhood) => ({ name: readRecordValue(neighborhood, "neighborhood_name") ?? readRecordValue(neighborhood, "name"), description: readRecordValue(neighborhood, "description") ?? readRecordValue(neighborhood, "subtitle") })),
      placeSummaries: places.slice(0, 4).map((place) => ({ name: readRecordValue(place, "place_name") ?? readRecordValue(place, "name"), category: readRecordValue(place, "category") ?? readRecordValue(place, "place_type") })),
      resourceSummaries: resources.slice(0, 4).map((resource) => ({ label: readRecordValue(resource, "label") ?? readRecordValue(resource, "name"), provider: readRecordValue(resource, "provider") ?? readRecordValue(resource, "source_name"), url: readRecordValue(resource, "url") ?? readRecordValue(resource, "source_url") })),
      mediaSummaries: media.slice(0, 4).map((asset) => ({ label: readRecordValue(asset, "label") ?? readRecordValue(asset, "caption") ?? readRecordValue(asset, "name"), provider: readRecordValue(asset, "provider") ?? readRecordValue(asset, "source_name"), url: readRecordValue(asset, "url") ?? readRecordValue(asset, "source_url") })),
    };
  });
};
