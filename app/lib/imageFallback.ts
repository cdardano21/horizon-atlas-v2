import type { Destination } from "./destinations";
import { curatedCityImagesBySlug } from "./curatedCityImages";
import { curatedCityImageGalleriesBySlug } from "./curatedCityImageGalleries";

const TRUSTED_IMAGE_HOSTS = new Set(["upload.wikimedia.org", "commons.wikimedia.org"]);

const featuredPhotoRegex = /images\.unsplash\.com\/featured\/\?/i;
const sourceUnsplashRegex = /source\.unsplash\.com/i;
const placeholderTokenRegex = /(placeholder|example|default-image)/i;

export const COSTA_DEL_SOL_HERO_IMAGE = "/images/costa-del-sol-hero.jpg";


function isInvalidImageSource(src: string | null | undefined) {
  if (!src) return true;
  const trimmed = src.trim();
  if (!trimmed) return true;
  return featuredPhotoRegex.test(trimmed) || sourceUnsplashRegex.test(trimmed) || placeholderTokenRegex.test(trimmed);
}

function isVerifiedImageSource(src: string | null | undefined) {
  if (!src || isInvalidImageSource(src)) return false;
  const trimmed = src.trim();
  if (!trimmed) return false;

  // Local assets are authored and reviewed in-repo.
  if (trimmed.startsWith("/")) return true;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:") return false;
    return TRUSTED_IMAGE_HOSTS.has(parsed.hostname.toLowerCase());
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

  return COSTA_DEL_SOL_HERO_IMAGE;
}

export function getDestinationImageSet(destination: Destination, minCount = 3) {
  const primaryImages = (destination.images ?? [])
    .map((image) => image?.src)
    .filter((src): src is string => isVerifiedImageSource(src));

  const curatedPrimary = curatedCityImagesBySlug[destination.slug];
  const curatedVariants = curatedCityImageGalleriesBySlug[destination.slug] ?? [];
  const cityScoped = cityScopedImageUrls(destination);
  const combined = Array.from(new Set([...primaryImages, ...cityScoped.filter((src) => isVerifiedImageSource(src))]));
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
  if (isVerifiedImageSource(image?.src)) {
    return image.src;
  }

  const uniqueSet = getDestinationImageSet(destination, variant + 1);
  if (uniqueSet[variant]) {
    return uniqueSet[variant];
  }

  const cityScoped = cityScopedImageUrl(destination, variant);
  if (isVerifiedImageSource(cityScoped)) {
    return cityScoped;
  }

  return COSTA_DEL_SOL_HERO_IMAGE;
}
