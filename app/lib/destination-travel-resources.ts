/**
 * Permanent, destination-agnostic outbound Travel-resource system.
 *
 * Generates deterministic, clearly-labeled navigation/search utility links (never live pricing,
 * availability, inventory, or booking data) for every registered/golden-pilot destination, keyed
 * only by the destination's real public name and country - no destination_key, no batch-specific
 * branching, no workbook parsing or network calls at generation time. A future destination
 * (Batch #3+, or a synthetic test fixture) receives the exact same utilities automatically.
 *
 * These are navigation tools, not authored facts: they must never be represented as official,
 * verified, or destination-specific recommendations, and an authored resource for the same
 * category always overrides the generated equivalent (see mergeAuthoredAndGeneratedResources).
 */

export interface GeneratedTravelResource {
  readonly category: string;
  readonly label: string;
  readonly provider: string;
  readonly url: string;
}

export interface DestinationTravelResourceContext {
  readonly publicName: string;
  readonly country: string | null | undefined;
}

const joinQuery = (parts: ReadonlyArray<string | null | undefined>) =>
  encodeURIComponent(
    parts
      .map((part) => (typeof part === "string" ? part.trim() : ""))
      .filter((part) => part.length > 0)
      .join(" "),
  );

/**
 * Builds the permanent set of generated utility resources for a destination. Returns an empty
 * array (never a fabricated placeholder) when the destination has no real public name - a
 * destination with genuinely no identity must not receive search links pointed at nothing.
 */
export function buildGeneratedTravelResources(context: DestinationTravelResourceContext): GeneratedTravelResource[] {
  const publicName = typeof context.publicName === "string" ? context.publicName.trim() : "";
  if (!publicName) return [];
  const country = typeof context.country === "string" ? context.country.trim() : "";

  const placeQuery = joinQuery([publicName, country]);

  return [
    // Maps - a real, functional Google Maps deep link, not a fabricated recommendation.
    { category: "maps", provider: "Google Maps", label: "Search Google Maps", url: `https://www.google.com/maps/search/?api=1&query=${placeQuery}` },
    { category: "maps", provider: "Google Earth", label: "Search Google Earth", url: `https://earth.google.com/web/search/${placeQuery}` },
    // Official tourism - explicitly NOT labeled "Official" here; the real "Official tourism website"
    // scalar slot is reserved for a genuine workbook-authored URL only (see canonical-destination-loader.ts).
    { category: "tourism", provider: "Web search", label: "Search official tourism info", url: `https://www.google.com/search?q=${joinQuery([publicName, country, "official tourism"])}` },
    { category: "tourism", provider: "Web search", label: "Find tours and activities", url: `https://www.google.com/search?q=${joinQuery([publicName, country, "tours and activities"])}` },
    // Hotels (its own category/group - Booking.com has a long-stable, well-documented location-search
    // URL pattern).
    { category: "hotels", provider: "Booking.com", label: "Search hotels", url: `https://www.booking.com/searchresults.html?ss=${placeQuery}` },
    // Vacation rentals (Airbnb has a long-stable, well-documented location-search URL pattern; Vrbo and
    // generic short-term rentals use a clearly-labeled restricted web search rather than an
    // unverifiable brittle provider endpoint).
    { category: "vacation-stays", provider: "Airbnb", label: "Search Airbnb", url: `https://www.airbnb.com/s/${encodeURIComponent([publicName, country].filter(Boolean).join(", "))}/homes` },
    { category: "vacation-stays", provider: "Web search", label: "Search Vrbo", url: `https://www.google.com/search?q=${joinQuery(["site:vrbo.com", publicName, country])}` },
    { category: "vacation-stays", provider: "Web search", label: "Search short-term rentals", url: `https://www.google.com/search?q=${joinQuery(["short-term rental", publicName, country])}` },
    // Long-term housing / property (existing "Housing" group)
    { category: "housing", provider: "Web search", label: "Search long-term rentals", url: `https://www.google.com/search?q=${joinQuery(["long-term rental apartment", publicName, country])}` },
    { category: "housing", provider: "Web search", label: "Search property for sale", url: `https://www.google.com/search?q=${joinQuery(["property for sale", publicName, country])}` },
    // Transportation
    { category: "transportation", provider: "Web search", label: "Search rental cars", url: `https://www.google.com/search?q=${joinQuery(["rental cars", publicName, country])}` },
    { category: "transportation", provider: "Web search", label: "Find airport transfers", url: `https://www.google.com/search?q=${joinQuery(["airport transfer", publicName, country])}` },
    { category: "transportation", provider: "Web search", label: "Find local transportation", url: `https://www.google.com/search?q=${joinQuery(["public transportation", publicName, country])}` },
    // Social discovery - Facebook has no existing scalar link slot on CanonicalDestination, so it is
    // represented only through this generic resource system (never a new one-off scalar field).
    // A restricted Google search is used instead of Facebook's own internal search endpoint, which
    // reliably returns no useful results for a place-name query.
    { category: "social-discovery", provider: "Facebook", label: "Search Facebook", url: `https://www.google.com/search?q=${joinQuery(["site:facebook.com", publicName, country])}` },
    // Weather
    { category: "weather", provider: "Web search", label: "Check destination weather", url: `https://www.google.com/search?q=${joinQuery(["weather", publicName, country])}` },
    // Healthcare / government-visa - these two categories already existed as generic fallback
    // resources prior to this checkpoint; they are reproduced here only to correct the destination
    // public-name resolution (previously derived from a stale slug-cased value), not to add new
    // legal/visa content or advice.
    { category: "healthcare", provider: "Web search", label: "Search local healthcare resources", url: `https://www.google.com/search?q=${joinQuery([publicName, country, "hospitals and clinics"])}` },
    { category: "visa", provider: "Web search", label: "Search government and visa resources", url: `https://www.google.com/search?q=${joinQuery([publicName, country, "residency and visa information"])}` },
  ];
}

/**
 * An authored resource always wins over its generated equivalent for the same category - this
 * only suppresses a generated line whose category exactly matches an already-authored resource's
 * category (case-insensitive), never removes an authored resource, and never fabricates a merge.
 */
export function mergeAuthoredAndGeneratedResources<T extends { readonly category: string; readonly label: string; readonly url: string }>(
  authored: readonly T[],
  generated: readonly GeneratedTravelResource[],
): Array<T | GeneratedTravelResource> {
  const authoredCategories = new Set(authored.map((item) => item.category.trim().toLowerCase()));
  const seenLinks = new Set<string>();
  const merged: Array<T | GeneratedTravelResource> = [];

  for (const item of authored) {
    const key = item.url.trim().toLowerCase();
    if (seenLinks.has(key)) continue;
    seenLinks.add(key);
    merged.push(item);
  }

  for (const item of generated) {
    if (authoredCategories.has(item.category.trim().toLowerCase())) continue;
    const key = item.url.trim().toLowerCase();
    if (seenLinks.has(key)) continue;
    seenLinks.add(key);
    merged.push(item);
  }

  return merged;
}

export interface GeneratedScalarDiscoveryLinks {
  readonly googleMapsUrl: string;
  readonly googleEarthUrl: string;
  readonly wikipediaUrl: string;
  readonly youtubeUrl: string;
  readonly tiktokUrl: string;
  readonly instagramUrl: string;
  readonly webcamUrl: string;
}

/**
 * The scalar (single-link) discovery fields already have their own dedicated UI slot
 * (CanonicalDestinationPage's "coreLinks") - unlike the categories in buildGeneratedTravelResources,
 * these are never blanked merely because the workbook has no dedicated column for them. Callers must
 * still prefer a real authored value first; this only supplies the deterministic utility fallback.
 */
export function buildGeneratedScalarDiscoveryLinks(context: DestinationTravelResourceContext): GeneratedScalarDiscoveryLinks {
  const publicName = typeof context.publicName === "string" ? context.publicName.trim() : "";
  const country = typeof context.country === "string" ? context.country.trim() : "";
  if (!publicName) {
    return { googleMapsUrl: "", googleEarthUrl: "", wikipediaUrl: "", youtubeUrl: "", tiktokUrl: "", instagramUrl: "", webcamUrl: "" };
  }

  const placeQuery = joinQuery([publicName, country]);
  const hashtagSafeName = publicName.toLowerCase().replace(/[^a-z0-9]/g, "");

  return {
    googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${placeQuery}`,
    googleEarthUrl: `https://earth.google.com/web/search/${placeQuery}`,
    wikipediaUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(publicName.replace(/\s+/g, "_"))}`,
    youtubeUrl: `https://www.youtube.com/results?search_query=${joinQuery([publicName, country, "travel guide"])}`,
    tiktokUrl: `https://www.tiktok.com/search?q=${placeQuery}`,
    instagramUrl: `https://www.instagram.com/explore/tags/${encodeURIComponent(hashtagSafeName)}`,
    webcamUrl: `https://www.google.com/search?q=${joinQuery([publicName, country, "webcam"])}`,
  };
}
