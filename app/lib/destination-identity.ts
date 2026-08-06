type DestinationIdentityRow = {
  id?: string | null;
  slug?: string | null;
  city?: string | null;
  country?: string | null;
};

export const normalizeDestinationSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export const buildDestinationIdentity = (input: { city?: string; country?: string; slug?: string }) => {
  const city = input.city?.trim() ?? "";
  const country = input.country?.trim() ?? "";
  const slug = normalizeDestinationSlug(input.slug ?? `${city}-${country}`);

  return { city, country, slug };
};

export const destinationIdentityMatches = (identity: ReturnType<typeof buildDestinationIdentity>, destination: DestinationIdentityRow) => {
  const normalizedSlug = normalizeDestinationSlug(identity.slug);
  const normalizedDestinationSlug = normalizeDestinationSlug(String(destination.slug ?? ""));
  const normalizedCity = identity.city.trim().toLowerCase();
  const normalizedCountry = identity.country.trim().toLowerCase();
  const destinationCity = String(destination.city ?? "").trim().toLowerCase();
  const destinationCountry = String(destination.country ?? "").trim().toLowerCase();

  if (normalizedSlug && normalizedDestinationSlug && normalizedSlug === normalizedDestinationSlug) {
    return true;
  }

  if (normalizedCity && normalizedCountry && normalizedCity === destinationCity && normalizedCountry === destinationCountry) {
    return true;
  }

  return false;
};

export async function findDestinationIdentityConflict({
  accessToken,
  url,
  headers,
  currentDestinationId,
  city,
  country,
  slug,
}: {
  accessToken?: string | null;
  url: string;
  headers: HeadersInit;
  currentDestinationId?: string | null;
  city?: string;
  country?: string;
  slug?: string;
}) {
  const identity = buildDestinationIdentity({ city, country, slug });
  if (!identity.city || !identity.country || !identity.slug) {
    return null;
  }

  const response = await fetch(`${url}/rest/v1/destinations_catalog?select=id,slug,city,country,status,tier,description,overview,updated_at,metadata&order=updated_at.desc&limit=1000`, {
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const rows = (await response.json()) as DestinationIdentityRow[];
  const matchedDestination = rows.find((destination) => {
    if (currentDestinationId && String(destination.id ?? "") === currentDestinationId) {
      return false;
    }
    return destinationIdentityMatches(identity, destination);
  });

  if (!matchedDestination) {
    return null;
  }

  return {
    id: String(matchedDestination.id ?? ""),
    slug: String(matchedDestination.slug ?? ""),
    city: String(matchedDestination.city ?? ""),
    country: String(matchedDestination.country ?? ""),
  };
}
