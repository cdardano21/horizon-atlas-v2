import type { Destination } from "./destinations";
import { curatedCityImagesBySlug } from "./curatedCityImages";

const TRUSTED_IMAGE_HOSTS = new Set(["upload.wikimedia.org", "commons.wikimedia.org"]);

const fallbackImages = {
  beach: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
  mountains: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1600&q=80",
  city: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80",
  lake: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=80",
  coastal: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80",
  default: "https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=1600&q=80",
};

const featuredPhotoRegex = /images\.unsplash\.com\/featured\/\?/i;
const sourceUnsplashRegex = /source\.unsplash\.com/i;
const placeholderTokenRegex = /(placeholder|example|default-image)/i;

export const COSTA_DEL_SOL_HERO_IMAGE = "/images/costa-del-sol-hero.jpg";

const regionalCityFallbackByCountry: Record<string, string[]> = {
  Andorra: ["https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Andorra_la_Vella_-_view2.jpg/1280px-Andorra_la_Vella_-_view2.jpg"],
  "United Arab Emirates": ["https://upload.wikimedia.org/wikipedia/en/thumb/c/c7/Burj_Khalifa_2021.jpg/3840px-Burj_Khalifa_2021.jpg"],
  Afghanistan: ["https://upload.wikimedia.org/wikipedia/commons/4/43/Kabul%2C_Afghanistan_view.jpg"],
  Albania: ["https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Skanderbeg_square_tirana_2016.jpg/3840px-Skanderbeg_square_tirana_2016.jpg"],
  "Antigua and Barbuda": ["https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/St_Johns_Antigua_2012.jpg/3840px-St_Johns_Antigua_2012.jpg"],
  Anguilla: ["https://upload.wikimedia.org/wikipedia/commons/9/9f/Sandy_Ground%2C_Anguilla.jpg"],
  Japan: [
    "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1493780474015-ba834fd0ce2f?auto=format&fit=crop&w=1600&q=80",
  ],
  Spain: [
    "https://images.unsplash.com/photo-1509840841025-9088ba78a826?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1464790719320-516ecd75af6c?auto=format&fit=crop&w=1600&q=80",
  ],
  France: [
    "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1431274172761-fca41d930114?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80",
  ],
  Portugal: [
    "https://images.unsplash.com/photo-1513735492246-483525079686?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?auto=format&fit=crop&w=1600&q=80",
  ],
  Italy: [
    "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=1600&q=80",
  ],
  Greece: [
    "https://images.unsplash.com/photo-1503152394-2b3ca9f6a3da?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1600&q=80",
  ],
  Croatia: [
    "https://images.unsplash.com/photo-1505765050516-f72dcac9c60d?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1600&q=80",
  ],
  Slovenia: [
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1530882548122-0596ee66cdfd?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1600&q=80",
  ],
  Switzerland: [
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1491557345352-5929e343eb89?auto=format&fit=crop&w=1600&q=80",
  ],
  Montenegro: [
    "https://images.unsplash.com/photo-1526481280695-3c4691f73c87?auto=format&fit=crop&w=1600&q=80",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/20090719_Crkva_Gospa_od_Zdravlja_Kotor_Bay_Montenegro.jpg/3840px-20090719_Crkva_Gospa_od_Zdravlja_Kotor_Bay_Montenegro.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/P064720-426794_-_Panoramic_view_of_Podgorica.jpg/3840px-P064720-426794_-_Panoramic_view_of_Podgorica.jpg",
  ],
};

const curatedCityImageVariantsBySlug: Record<string, string[]> = {
  "tivat-montenegro": [
    "https://upload.wikimedia.org/wikipedia/commons/e/e1/Tivat_Sv._Marko_Gospa_od_Milosti.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Porto_Montenegro%2C_Tivat_-_2018.jpg/3840px-Porto_Montenegro%2C_Tivat_-_2018.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Tivat_Municipality%2C_Montenegro_%2817164208182%29.jpg/3840px-Tivat_Municipality%2C_Montenegro_%2817164208182%29.jpg",
  ],
  "nafplio-greece": [
    "https://upload.wikimedia.org/wikipedia/commons/a/ab/%CE%94%CE%B7%CE%BC%CE%B1%CF%81%CF%87%CE%B5%CE%AF%CE%BF_%CE%9D%CE%B1%CF%85%CF%80%CE%BB%CE%AF%CE%BF%CF%85%2C_Nafplio_Town_Hall.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Nafplio_Bourtzi_%282014%29.jpg/3840px-Nafplio_Bourtzi_%282014%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Nafplio_old_town.jpg/3840px-Nafplio_old_town.jpg",
  ],
  "valencia-spain": [
    "https://upload.wikimedia.org/wikipedia/commons/f/fe/Malvarrosa_Beach%2C_Valencia%2C_Spain_%2829812271043%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Ciudad_de_las_Artes_y_las_Ciencias%2C_Valencia%2C_Espa%C3%B1a%2C_2014-06-30%2C_DD_52.JPG/3840px-Ciudad_de_las_Artes_y_las_Ciencias%2C_Valencia%2C_Espa%C3%B1a%2C_2014-06-30%2C_DD_52.JPG",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Valencia%2C_Spain_Cityscape.jpg/3840px-Valencia%2C_Spain_Cityscape.jpg",
  ],
  "rovinj-croatia": [
    "https://upload.wikimedia.org/wikipedia/commons/5/5b/Rovinj%2C_Croatia.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Rovinj_old_town_panorama.jpg/3840px-Rovinj_old_town_panorama.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Rovinj_harbor.jpg/3840px-Rovinj_harbor.jpg",
  ],
};

const aeRegionalFallbackBySlugPattern: Array<{ pattern: RegExp; image: string }> = [
  {
    pattern: /dubai|rashid|qusais|karama|twar|mizhar|bada|muteena|waheda|oud-metha|internet|festival|difc|motor-city|sports-city|investments-park|silicon-oasis/i,
    image: "https://upload.wikimedia.org/wikipedia/en/thumb/c/c7/Burj_Khalifa_2021.jpg/3840px-Burj_Khalifa_2021.jpg",
  },
  {
    pattern: /umm-al-quwain|quwain/i,
    image: "https://upload.wikimedia.org/wikipedia/commons/8/82/Umm_Al_Quwain_mangroves_%287267363924%29.jpg",
  },
  {
    pattern: /kalb|fakk/i,
    image: "https://upload.wikimedia.org/wikipedia/commons/5/57/Kalbamangrove.jpg",
  },
  {
    pattern: /ras-al-khaimah|khaimah/i,
    image: "https://upload.wikimedia.org/wikipedia/commons/3/39/Aerial_view_of_RAK_City_from_Al_Qawasim_Corniche_flagpole.jpg",
  },
  {
    pattern: /dibba|fujairah/i,
    image: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Hills_in_Fujairah_2012_01.jpg",
  },
  {
    pattern: /jumayr|suqaym/i,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Sunset_of_Jumeirah_Fish_Village.jpg/3840px-Sunset_of_Jumeirah_Fish_Village.jpg",
  },
];

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

  const curatedVariants = curatedCityImageVariantsBySlug[destination.slug];
  if (curatedVariants?.length) {
    candidates.push(...curatedVariants);
  }

  const curatedPrimary = curatedCityImagesBySlug[destination.slug];
  if (curatedPrimary) {
    candidates.push(curatedPrimary);
  }

  if (destination.country === "United Arab Emirates") {
    const matched = aeRegionalFallbackBySlugPattern.find((entry) => entry.pattern.test(destination.slug));
    if (matched) {
      candidates.push(matched.image);
    }
  }

  const regional = regionalCityFallbackByCountry[destination.country] ?? [];
  candidates.push(...regional);

  candidates.push(
    fallbackImages.coastal,
    fallbackImages.city,
    fallbackImages.mountains,
    fallbackImages.lake,
    fallbackImages.default,
  );

  return Array.from(new Set(candidates.filter(Boolean)));
}

function cityScopedImageUrl(destination: Destination, variant = 0) {
  const candidates = cityScopedImageUrls(destination);
  if (candidates.length > 0) {
    return candidates[Math.abs(variant) % candidates.length];
  }

  return getFallbackDestinationImage(destination);
}

export function getFallbackDestinationImage(destination: Destination) {
  const tags = new Set(destination.tags?.map((tag) => tag.toLowerCase()) ?? []);

  if (tags.has("beach") || tags.has("coast") || tags.has("island") || tags.has("waterfront") || tags.has("lake")) {
    return fallbackImages.coastal;
  }

  if (tags.has("mountains") || tags.has("nature") || tags.has("outdoor recreation")) {
    return fallbackImages.mountains;
  }

  if (tags.has("culture") || tags.has("city") || tags.has("nightlife") || tags.has("food")) {
    return fallbackImages.city;
  }

  if (tags.has("retirement") || tags.has("healthcare") || tags.has("quiet") || tags.has("slow pace")) {
    return fallbackImages.lake;
  }

  return fallbackImages.default;
}

export function getDestinationImageSet(destination: Destination, minCount = 3) {
  const primaryImages = (destination.images ?? [])
    .map((image) => image?.src)
    .filter((src): src is string => isVerifiedImageSource(src));

  const curatedPrimary = curatedCityImagesBySlug[destination.slug];
  const curatedVariants = curatedCityImageVariantsBySlug[destination.slug] ?? [];
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
