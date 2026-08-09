import type { Destination } from "./destinations";
import { curatedCityImagesBySlug } from "./curatedCityImages";
import { curatedCityImageGalleriesBySlug } from "./curatedCityImageGalleries";

const TRUSTED_IMAGE_HOSTS = new Set(["upload.wikimedia.org", "commons.wikimedia.org"]);const GENERIC_IMAGE_HOSTS = new Set(["images.unsplash.com", "source.unsplash.com", "unsplash.com", "pixabay.com", "pexels.com", "flickr.com"]);
const featuredPhotoRegex = /images\.unsplash\.com\/featured\/\?/i;
const sourceUnsplashRegex = /source\.unsplash\.com/i;
const placeholderTokenRegex = /(placeholder|default-image)/i;
const legacyGenericFallbackPath = "/images/costa-del-sol-hero.jpg";

function escapeSvgText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function createDestinationPlaceholderImage(city: string, country: string, seed = "atlas") {
  const safeCity = escapeSvgText(city.trim() || "Destination");
  const safeCountry = escapeSvgText(country.trim() || "Your next chapter");
  const paletteSeed = Math.abs(seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0));
  const hue = 180 + (paletteSeed % 120);
  const accentHue = (hue + 45) % 360;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 900">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="hsl(${hue} 48% 16%)" />
          <stop offset="45%" stop-color="hsl(${hue + 18} 44% 24%)" />
          <stop offset="100%" stop-color="hsl(${accentHue} 36% 35%)" />
        </linearGradient>
      </defs>
      <rect width="1400" height="900" fill="url(#bg)" rx="36" />
      <rect x="86" y="86" width="1228" height="728" rx="32" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.22)" />
      <circle cx="1120" cy="240" r="180" fill="rgba(255,255,255,0.14)" />
      <path d="M0 700 C250 620 370 630 540 690 C720 760 885 785 1400 660 L1400 900 L0 900 Z" fill="rgba(14,24,25,0.48)" />
      <path d="M0 760 C210 710 330 715 520 775 C690 824 830 840 1400 760 L1400 900 L0 900 Z" fill="rgba(255,255,255,0.14)" />
      <text x="110" y="360" fill="#fef7e9" font-family="Arial, Helvetica, sans-serif" font-size="78" font-weight="700">${safeCity}</text>
      <text x="110" y="438" fill="#f7d9a8" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="600">${safeCountry}</text>
      <text x="110" y="520" fill="rgba(255,247,233,0.78)" font-family="Arial, Helvetica, sans-serif" font-size="24">Editorial destination placeholder • verified imagery pending</text>
    </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export const COSTA_DEL_SOL_HERO_IMAGE = createDestinationPlaceholderImage("Costa del Sol", "Spain", "costa-del-sol");

function getDestinationPlaceholderImage(destination: { city?: string; country?: string; slug?: string }) {
  return createDestinationPlaceholderImage(destination.city ?? "Destination", destination.country ?? "Your next chapter", destination.slug ?? "atlas");
}

function isInvalidImageSource(src: string | null | undefined) {
  if (!src) return true;
  const trimmed = src.trim();
  if (!trimmed) return true;
  return featuredPhotoRegex.test(trimmed)
    || sourceUnsplashRegex.test(trimmed)
    || placeholderTokenRegex.test(trimmed)
    || trimmed === legacyGenericFallbackPath;
}

function getDestinationIdentityTokens(destination: { city?: string; country?: string; slug?: string }) {
  const values = [destination.slug, destination.city, destination.country];
  return Array.from(new Set(values.flatMap((value) => (value ?? "").toLowerCase().split(/[^a-z0-9]+/g).filter(Boolean))));
}

function isCuratedImageSource(src: string, destination: Destination) {
  const curatedVariants = curatedCityImageGalleriesBySlug[destination.slug] ?? [];
  const curatedPrimary = curatedCityImagesBySlug[destination.slug];
  return [curatedPrimary, ...curatedVariants].filter(Boolean).includes(src);
}

function hasDestinationIdentityMatch(src: string, destination: Destination, metadata?: string | null) {
  const tokens = getDestinationIdentityTokens(destination);
  if (!tokens.length) return false;
  const normalized = [src, metadata].filter(Boolean).join(" ").toLowerCase();
  return tokens.some((token) => normalized.includes(token));
}

function isLikelyStockImageUrl(src: string) {
  try {
    const parsed = new URL(src);
    return GENERIC_IMAGE_HOSTS.has(parsed.hostname.toLowerCase()) || parsed.hostname.toLowerCase().endsWith(".unsplash.com");
  } catch {
    return false;
  }
}

function isLikelyImageAssetUrl(src: string) {
  const trimmed = src.trim();
  try {
    const parsed = new URL(trimmed);
    const pathname = parsed.pathname.toLowerCase();
    const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".bmp", ".svg"];
    const hasImageExtension = imageExtensions.some((extension) => pathname.endsWith(extension));
    const hasImagePathHint = pathname.includes("/image") || pathname.includes("/images") || pathname.includes("/photo") || pathname.includes("/photos") || pathname.includes("/media") || pathname.includes("/img");
    const hasImageQueryHint = parsed.searchParams.has("img") || parsed.searchParams.has("image") || parsed.searchParams.has("photo") || parsed.searchParams.has("src");
    return hasImageExtension || hasImagePathHint || hasImageQueryHint;
  } catch {
    return false;
  }
}

function isVerifiedImageSource(src: string | null | undefined, destination?: Destination, metadata?: string | null) {
  if (!src || isInvalidImageSource(src)) return false;
  const trimmed = src.trim();
  if (!trimmed) return false;

  // Local assets are authored and reviewed in-repo.
  if (trimmed.startsWith("/")) return true;

  if (destination && isCuratedImageSource(trimmed, destination)) return true;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    if (TRUSTED_IMAGE_HOSTS.has(host)) return true;

    if (destination && hasDestinationIdentityMatch(trimmed, destination, metadata)) return true;
    if (isLikelyStockImageUrl(trimmed)) return false;

    if (destination) {
      return isLikelyImageAssetUrl(trimmed);
    }
    return isLikelyImageAssetUrl(trimmed);
  } catch {
    return false;
  }
}

function stableHash(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function rotate<T>(items: T[], start: number) {
  if (items.length === 0) return items;
  const offset = start % items.length;
  if (offset === 0) return items;
  return [...items.slice(offset), ...items.slice(0, offset)];
}

function cityScopedImageUrls(destination: Destination) {
  const candidates: string[] = [];

  const curatedVariants = curatedCityImageGalleriesBySlug[destination.slug];
  if (curatedVariants?.length) {
    candidates.push(...curatedVariants);
  }

  const curatedPrimary = curatedCityImagesBySlug[destination.slug];
  if (curatedPrimary) {
    candidates.push(curatedPrimary);
  }

  for (const image of destination.images ?? []) {
    if (image?.src) {
      candidates.push(image.src);
    }
  }

  return Array.from(new Set(candidates.filter(Boolean)));
}

function cityScopedImageUrl(destination: Destination, variant = 0) {
  const candidates = cityScopedImageUrls(destination);
  if (candidates.length > 0) {
    return candidates[Math.abs(variant) % candidates.length];
  }

  return getDestinationPlaceholderImage(destination);
}

export function getDestinationImageSet(destination: Destination, minCount = 3) {
  const primaryImages = (destination.images ?? [])
    .map((image) => ({ src: image?.src, metadata: image?.alt }))
    .filter(({ src, metadata }) => isVerifiedImageSource(src, destination, metadata))
    .map(({ src }) => src)
    .filter((src): src is string => Boolean(src));

  const curatedPrimary = curatedCityImagesBySlug[destination.slug];
  const curatedVariants = curatedCityImageGalleriesBySlug[destination.slug] ?? [];
  const cityScoped = cityScopedImageUrls(destination);
  const combined = Array.from(new Set([...primaryImages, ...cityScoped.filter((src) => isVerifiedImageSource(src, destination))]));
  const rotationSeed = stableHash(`${destination.slug}:${destination.city}:${destination.country}`);

  let ordered = primaryImages.length > 0 ? combined : rotate(combined, rotationSeed);

  if (primaryImages.length === 0) {
    const curatedLead = [
      ...curatedVariants,
      ...(curatedPrimary ? [curatedPrimary] : []),
    ].filter((src, index, array) => array.indexOf(src) === index && combined.includes(src));

    if (curatedLead.length > 0) {
      const tail = combined.filter((src) => !curatedLead.includes(src));
      ordered = [...curatedLead, ...rotate(tail, rotationSeed)];
    }
  }

  if (ordered.length >= minCount) return ordered;

  return ordered;
}

export function hasVerifiedDestinationImage(destination: Destination) {
  return getDestinationImageSet(destination, 1).length > 0;
}

export function getDestinationImageSequence(destination: Destination, count: number, startAt = 0) {
  const imageSet = getDestinationImageSet(destination, Math.max(count, 3));
  if (imageSet.length === 0) return [];

  const sequence: string[] = [];
  for (let index = 0; index < count; index += 1) {
    sequence.push(imageSet[(startAt + index) % imageSet.length]);
  }

  return sequence;
}

export function getDestinationImageUrl(image: { src: string; alt?: string }, destination: Destination, variant = 0) {
  if (isVerifiedImageSource(image?.src, destination, image?.alt)) {
    return image.src;
  }

  const uniqueSet = getDestinationImageSet(destination, variant + 1);
  if (uniqueSet[variant]) {
    return uniqueSet[variant];
  }

  const cityScoped = cityScopedImageUrl(destination, variant);
  if (isVerifiedImageSource(cityScoped, destination)) {
    return cityScoped;
  }

  return getDestinationPlaceholderImage(destination);
}
