import type { Destination } from "./destinations";
import { curatedCityImagesBySlug } from "./curatedCityImages";

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

export const COSTA_DEL_SOL_HERO_IMAGE = "/images/costa-del-sol-hero.jpg";

const regionalCityFallbackByCountry: Record<string, string> = {
  Andorra: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Andorra_la_Vella_-_view2.jpg/1280px-Andorra_la_Vella_-_view2.jpg",
  "United Arab Emirates": "https://upload.wikimedia.org/wikipedia/en/thumb/c/c7/Burj_Khalifa_2021.jpg/3840px-Burj_Khalifa_2021.jpg",
  Afghanistan: "https://upload.wikimedia.org/wikipedia/commons/4/43/Kabul%2C_Afghanistan_view.jpg",
  Albania: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Skanderbeg_square_tirana_2016.jpg/3840px-Skanderbeg_square_tirana_2016.jpg",
  "Antigua and Barbuda": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/St_Johns_Antigua_2012.jpg/3840px-St_Johns_Antigua_2012.jpg",
  Anguilla: "https://upload.wikimedia.org/wikipedia/commons/9/9f/Sandy_Ground%2C_Anguilla.jpg",
  Japan: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80",
  Spain: "https://images.unsplash.com/photo-1509840841025-9088ba78a826?auto=format&fit=crop&w=1600&q=80",
  France: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1600&q=80",
  Portugal: "https://images.unsplash.com/photo-1513735492246-483525079686?auto=format&fit=crop&w=1600&q=80",
  Italy: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1600&q=80",
  Greece: "https://images.unsplash.com/photo-1503152394-2b3ca9f6a3da?auto=format&fit=crop&w=1600&q=80",
  Croatia: "https://images.unsplash.com/photo-1505765050516-f72dcac9c60d?auto=format&fit=crop&w=1600&q=80",
  Slovenia: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1600&q=80",
  Switzerland: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80",
  Montenegro: "https://images.unsplash.com/photo-1526481280695-3c4691f73c87?auto=format&fit=crop&w=1600&q=80",
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

function cityScopedImageUrl(destination: Destination) {
  if (destination.country === "United Arab Emirates") {
    const matched = aeRegionalFallbackBySlugPattern.find((entry) => entry.pattern.test(destination.slug));
    if (matched) {
      return matched.image;
    }
  }

  const regional = regionalCityFallbackByCountry[destination.country];
  if (regional) {
    return regional;
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

export function getDestinationImageUrl(image: { src: string; alt?: string }, destination: Destination) {
  const curatedImage = curatedCityImagesBySlug[destination.slug];
  if (curatedImage) {
    return curatedImage;
  }

  if (!image?.src || featuredPhotoRegex.test(image.src) || sourceUnsplashRegex.test(image.src)) {
    return cityScopedImageUrl(destination);
  }

  return image.src;
}
