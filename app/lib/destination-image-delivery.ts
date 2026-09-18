import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

const ALLOWED_IMAGE_HOSTS = new Set([
  "commons.wikimedia.org",
  "i.ytimg.com",
  "images.unsplash.com",
  "img.youtube.com",
  "thumb.wikimedia.org",
  "upload.wikimedia.org",
]);
const CACHE_CONTROL = "public, max-age=86400, stale-while-revalidate=604800";
const MAX_REDIRECTS = 5;
const MAX_ATTEMPTS = 4;
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);
const inFlight = new Map<string, Promise<CachedImage>>();
const upstreamQueue: Array<() => void> = [];
let upstreamActive = false;

type CachedImage = {
  bytes: Uint8Array;
  contentType: string;
};

type CacheMetadata = {
  contentType: string;
};

export class DestinationImageDeliveryError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "DestinationImageDeliveryError";
  }
}

export function parseApprovedImageUrl(value: string | null): URL {
  if (!value) throw new DestinationImageDeliveryError("Missing image source", 400);

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new DestinationImageDeliveryError("Invalid image source", 400);
  }

  if (url.protocol !== "https:" || !ALLOWED_IMAGE_HOSTS.has(url.hostname)) {
    throw new DestinationImageDeliveryError("Image source is not approved", 400);
  }
  return url;
}

function cachePaths(url: URL) {
  const key = createHash("sha256").update(url.href).digest("hex");
  const directory = process.env.DESTINATION_IMAGE_CACHE_DIR
    ?? path.join(process.cwd(), ".next", "cache", "destination-images");
  return {
    directory,
    image: path.join(directory, `${key}.image`),
    metadata: path.join(directory, `${key}.json`),
  };
}

async function readCachedImage(url: URL): Promise<CachedImage | null> {
  const paths = cachePaths(url);
  try {
    const [bytes, metadataText] = await Promise.all([
      readFile(paths.image),
      readFile(paths.metadata, "utf8"),
    ]);
    const metadata = JSON.parse(metadataText) as CacheMetadata;
    if (!metadata.contentType.startsWith("image/")) return null;
    return { bytes, contentType: metadata.contentType };
  } catch {
    return null;
  }
}

async function writeCachedImage(url: URL, image: CachedImage) {
  const paths = cachePaths(url);
  await mkdir(paths.directory, { recursive: true });
  const suffix = `${process.pid}-${Date.now()}`;
  const temporaryImage = `${paths.image}.${suffix}.tmp`;
  const temporaryMetadata = `${paths.metadata}.${suffix}.tmp`;
  await Promise.all([
    writeFile(temporaryImage, image.bytes),
    writeFile(temporaryMetadata, JSON.stringify({ contentType: image.contentType } satisfies CacheMetadata)),
  ]);
  await Promise.all([
    rename(temporaryImage, paths.image),
    rename(temporaryMetadata, paths.metadata),
  ]);
}

async function withUpstreamSlot<T>(operation: () => Promise<T>): Promise<T> {
  await new Promise<void>((resolve) => {
    if (!upstreamActive) {
      upstreamActive = true;
      resolve();
    } else {
      upstreamQueue.push(resolve);
    }
  });

  try {
    return await operation();
  } finally {
    const next = upstreamQueue.shift();
    if (next) next();
    else upstreamActive = false;
  }
}

function retryDelay(response: Response, attempt: number) {
  const retryAfter = Number(response.headers.get("retry-after"));
  if (Number.isFinite(retryAfter) && retryAfter > 0) return Math.min(retryAfter * 1000, 10_000);
  return 750 * (attempt + 1);
}

async function fetchWithApprovedRedirects(initialUrl: URL): Promise<Response> {
  let currentUrl = new URL(initialUrl);
  if (currentUrl.hostname === "commons.wikimedia.org"
    && /^\/wiki\/Special:(?:FilePath|Redirect\/file)\//i.test(currentUrl.pathname)
    && !currentUrl.searchParams.has("width")) {
    currentUrl.searchParams.set("width", "1280");
  }
  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect += 1) {
    const response = await fetch(currentUrl, {
      cache: "no-store",
      redirect: "manual",
      headers: {
        Accept: "image/avif,image/webp,image/*,*/*;q=0.8",
        "User-Agent": "DestinationFinderAI/1.0 (destination image delivery)",
      },
      signal: AbortSignal.timeout(20_000),
    });
    if (![301, 302, 303, 307, 308].includes(response.status)) return response;
    const location = response.headers.get("location");
    if (!location) throw new DestinationImageDeliveryError("Image redirect is missing a location", 502);
    currentUrl = parseApprovedImageUrl(new URL(location, currentUrl).href);
  }
  throw new DestinationImageDeliveryError("Too many image redirects", 502);
}

async function fetchImage(url: URL): Promise<CachedImage> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const response = await fetchWithApprovedRedirects(url);
    if (response.ok) {
      const contentType = response.headers.get("content-type")?.split(";", 1)[0]?.trim() ?? "";
      if (!contentType.startsWith("image/")) {
        throw new DestinationImageDeliveryError("Upstream response is not an image", 502);
      }
      return { bytes: new Uint8Array(await response.arrayBuffer()), contentType };
    }
    if (!RETRYABLE_STATUS.has(response.status) || attempt === MAX_ATTEMPTS - 1) {
      throw new DestinationImageDeliveryError(`Upstream image request failed (${response.status})`, response.status === 404 ? 404 : 502);
    }
    await new Promise((resolve) => setTimeout(resolve, retryDelay(response, attempt)));
  }
  throw new DestinationImageDeliveryError("Upstream image request failed", 502);
}

export async function getDeliveredDestinationImage(source: string | null): Promise<CachedImage> {
  const url = parseApprovedImageUrl(source);
  const cached = await readCachedImage(url);
  if (cached) return cached;

  const existing = inFlight.get(url.href);
  if (existing) return existing;

  const pending = withUpstreamSlot(async () => {
    const queuedCacheHit = await readCachedImage(url);
    if (queuedCacheHit) return queuedCacheHit;
    const image = await fetchImage(url);
    await writeCachedImage(url, image);
    return image;
  });
  inFlight.set(url.href, pending);
  try {
    return await pending;
  } finally {
    inFlight.delete(url.href);
  }
}

export function destinationImageResponse(image: CachedImage) {
  return new Response(image.bytes, {
    headers: {
      "Cache-Control": CACHE_CONTROL,
      "Content-Type": image.contentType,
      "X-Content-Type-Options": "nosniff",
    },
  });
}