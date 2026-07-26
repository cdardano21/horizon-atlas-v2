const KNOWN_UNRELIABLE_SOURCE_HOSTS = new Set([
  "generalhospitalkotor.me",
  "www.generalhospitalkotor.me",
  "domzdravljativat.me",
  "www.domzdravljativat.me",
]);

export function sanitizeExternalSourceUrl(rawUrl?: string | null): string | null {
  if (!rawUrl) return null;

  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(candidate);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;

    const host = parsed.hostname.toLowerCase();
    if (host === "localhost" || host.endsWith(".local")) return null;
    if (KNOWN_UNRELIABLE_SOURCE_HOSTS.has(host)) return null;

    const oref = parsed.searchParams.get("oref") ?? "";
    if (oref.toLowerCase().includes("localhost")) {
      parsed.searchParams.delete("oref");
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

export function buildOfficialSourceSearchUrl(queryParts: Array<string | null | undefined>): string {
  const query = queryParts
    .map((part) => (part ?? "").trim())
    .filter(Boolean)
    .join(" ");

  return `https://www.google.com/search?q=${encodeURIComponent(`${query} official source`)}`;
}

export function resolveSourceHref(rawUrl: string | null | undefined, queryParts: Array<string | null | undefined>): string {
  return sanitizeExternalSourceUrl(rawUrl) ?? buildOfficialSourceSearchUrl(queryParts);
}
