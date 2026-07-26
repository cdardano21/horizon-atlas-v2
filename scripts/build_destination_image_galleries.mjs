#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const args = process.argv.slice(2);

function readArg(name, fallback) {
  const direct = args.find((arg) => arg.startsWith(`--${name}=`));
  if (!direct) return fallback;
  return direct.slice(name.length + 3);
}

function readBoolArg(name, fallback = false) {
  const raw = readArg(name, fallback ? "true" : "false");
  return raw === "true" || raw === "1";
}

const batchSize = Number(readArg("limit", "60"));
const batchOffset = Number(readArg("offset", "0"));
const targetCount = Number(readArg("target", "5"));
const minAccepted = Number(readArg("min", "3"));
const unresolvedOnly = readBoolArg("unresolvedOnly", false);

const baselinePath = resolve("docs/destination-quality-baseline.json");
const curatedPrimaryPath = resolve("app/lib/curatedCityImages.ts");
const galleriesJsonPath = resolve("docs/destination-image-galleries.json");
const galleriesTsPath = resolve("app/lib/curatedCityImageGalleries.ts");
const progressPath = resolve("docs/destination-image-verification-progress.json");

const USER_AGENT = "HorizonAtlasImageVerification/1.1";
const WIKI_API = "https://en.wikipedia.org/w/api.php";
const WIKI_REST = "https://en.wikipedia.org/api/rest_v1/page";

const bannedTitleParts = [
  "map",
  "flag",
  "logo",
  "coat_of_arms",
  "coat of arms",
  "seal",
  "location",
  "locator",
  "diagram",
  ".svg",
  "route",
  "blank",
  "icon",
  "emblem",
  "chart",
  "plan",
  "railway_network",
  "transport_map",
  "rail_map",
  "station_map",
  "airport_map",
  ".gif",
  ".webm",
  "illustration",
  "painting",
  "portrait",
  "postcard",
  "stamp",
  "coat",
  "arms",
  "diagram",
];

const cityTokenStopWords = new Set(["del", "de", "la", "le", "di", "da", "of", "the", "a"]);

const nonPlaceTitleParts = [
  "list of",
  "history of",
  "economy of",
  "demographics of",
  "culture of",
  "transport in",
  "massacre",
  "battle",
  "election",
  "airport",
  "airfield",
  "university",
  "cemetery",
  "john ",
];

const nonPlaceDescriptionParts = [
  "politician",
  "singer",
  "songwriter",
  "actor",
  "footballer",
  "baseball player",
  "basketball player",
  "novelist",
  "journalist",
  "film",
  "album",
  "song",
  "company",
  "massacre",
  "battle",
];

const placeIndicators = [
  "city",
  "town",
  "village",
  "municipality",
  "capital",
  "island",
  "province",
  "state",
  "region",
  "county",
  "district",
  "commune",
  "harbor",
  "harbour",
  "port",
  "resort",
  "metropolitan",
];

const bucketKeywords = {
  waterfront: ["waterfront", "beach", "coast", "harbor", "harbour", "port", "marina", "bay", "river", "canal"],
  skyline: ["skyline", "panorama", "aerial", "cityscape", "view"],
  neighborhood: ["street", "old_town", "old town", "square", "market", "district", "avenue", "promenade"],
  landmark: ["castle", "cathedral", "church", "bridge", "palace", "temple", "fort", "museum"],
};

function normalizeForCompare(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function fetchJson(url, timeoutMs = 25000, attempts = 4) {
  let lastError = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": USER_AGENT,
        },
      });

      if (!response.ok) {
        if (response.status === 429 || response.status >= 500) {
          const delay = 600 * attempt * attempt;
          await new Promise((resolveDelay) => setTimeout(resolveDelay, delay));
          continue;
        }

        throw new Error(`${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        const delay = 500 * attempt * attempt;
        await new Promise((resolveDelay) => setTimeout(resolveDelay, delay));
      }
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError ?? new Error("fetchJson failed");
}

function parseCuratedPrimarySlugs(content) {
  const slugRegex = /"([a-z0-9-]+)"\s*:/g;
  const slugs = [];
  let match;
  while ((match = slugRegex.exec(content)) !== null) {
    slugs.push(match[1]);
  }
  return Array.from(new Set(slugs));
}

function parseCuratedPrimaryMap(content) {
  const rowRegex = /"([a-z0-9-]+)"\s*:\s*"([^"]+)"/g;
  const map = {};
  let match;
  while ((match = rowRegex.exec(content)) !== null) {
    map[match[1]] = match[2];
  }
  return map;
}

function formatPrimaryMap(map) {
  const lines = ["export const curatedCityImagesBySlug: Record<string, string> = {"];
  const entries = Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  for (const [slug, url] of entries) {
    lines.push(`  \"${slug}\": \"${url}\",`);
  }
  lines.push("};");
  lines.push("");
  return lines.join("\n");
}

function formatGalleryTs(map) {
  const lines = ["export const curatedCityImageGalleriesBySlug: Record<string, string[]> = {"];
  const entries = Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));

  for (const [slug, urls] of entries) {
    lines.push(`  \"${slug}\": [`);
    for (const url of urls) {
      lines.push(`    \"${url}\",`);
    }
    lines.push("  ],");
  }

  lines.push("};");
  lines.push("");
  return lines.join("\n");
}

function classifyBucket(title) {
  const normalized = normalizeForCompare(title).replace(/\s+/g, "_");

  for (const [bucket, keywords] of Object.entries(bucketKeywords)) {
    if (keywords.some((keyword) => normalized.includes(keyword.replace(/\s+/g, "_")))) {
      return bucket;
    }
  }

  return "general";
}

function chooseBestSrcFromSrcSet(srcset = []) {
  if (!Array.isArray(srcset) || srcset.length === 0) return null;
  const selected = srcset[srcset.length - 1]?.src ?? srcset[0]?.src;
  if (!selected) return null;
  const normalized = selected.startsWith("//") ? `https:${selected}` : selected;
  return normalized;
}

function parseThumbWidth(url) {
  const match = url.match(/\/(\d{2,5})px-/i);
  if (!match) return 0;
  return Number(match[1]) || 0;
}

function destinationCityTokens(destination) {
  const normalized = normalizeForCompare(destination.city);
  const parts = normalized
    .split(" ")
    .map((item) => item.trim())
    .filter((item) => item.length >= 3)
    .filter((item) => !cityTokenStopWords.has(item));

  return Array.from(new Set([normalized, ...parts.filter((part) => part.length >= 4)]));
}

function destinationCountryTokens(destination) {
  const normalized = normalizeForCompare(destination.country);
  if (!normalized || normalized === "other" || normalized === "unknown") {
    return [];
  }

  const parts = normalized
    .split(" ")
    .map((item) => item.trim())
    .filter((item) => item.length >= 4)
    .filter((item) => !cityTokenStopWords.has(item));

  return Array.from(new Set([normalized, ...parts]));
}

function destinationRegionTokens(destination) {
  const citySlug = slugify(destination.city);
  const countrySlug = slugify(destination.country);
  const slug = destination.slug;

  const cityPrefix = `${citySlug}-`;
  const countrySuffix = `-${countrySlug}`;
  if (!slug.startsWith(cityPrefix) || !slug.endsWith(countrySuffix)) {
    return [];
  }

  const middle = slug.slice(cityPrefix.length, slug.length - countrySuffix.length);
  if (!middle || middle === "other") return [];

  const regionPhrase = middle.replace(/-/g, " ").trim();
  const parts = middle
    .split("-")
    .filter((part) => part.length >= 4)
    .filter((part) => !cityTokenStopWords.has(part));

  return Array.from(new Set([regionPhrase, ...parts]));
}

function hasCityTokenMatch(destination, description) {
  const tokens = destinationCityTokens(destination);
  return tokens.some((token) => description.includes(token));
}

function containsAny(text, values) {
  return values.some((value) => text.includes(value));
}

function isSummarySuitable(summary, destination) {
  const title = normalizeForCompare(summary?.title ?? "");
  const description = normalizeForCompare(summary?.description ?? "");
  const extract = normalizeForCompare(summary?.extract ?? "");
  const combined = `${title} ${description} ${extract}`.trim();

  if (!combined) return false;
  if (containsAny(title, nonPlaceTitleParts)) return false;
  if (containsAny(description, nonPlaceDescriptionParts)) return false;

  const cityTokens = destinationCityTokens(destination);
  const hasCityEvidence = cityTokens.some((token) => combined.includes(token));
  if (!hasCityEvidence) return false;

  const countryTokens = destinationCountryTokens(destination);
  if (countryTokens.length > 0) {
    const hasCountryEvidence = countryTokens.some((token) => combined.includes(token));
    if (!hasCountryEvidence) return false;
  }

  const regionTokens = destinationRegionTokens(destination);
  if (regionTokens.length > 0) {
    const hasRegionEvidence = regionTokens.some((token) => combined.includes(token));
    if (!hasRegionEvidence) return false;
  }

  const hasPlaceSignal = placeIndicators.some((term) => description.includes(term));
  return hasPlaceSignal;
}

function isImageAccepted(item, destination) {
  if (!item || item.type !== "image") return false;
  if (!item.showInGallery) return false;

  const title = (item.title || "").toLowerCase();
  if (!title.startsWith("file:")) return false;
  if (bannedTitleParts.some((part) => title.includes(part))) return false;

  const src = chooseBestSrcFromSrcSet(item.srcset);
  if (!src || !src.startsWith("https://upload.wikimedia.org/")) return false;
  if (/\.png($|\?)/i.test(src)) return false;

  const thumbWidth = parseThumbWidth(src);
  if (thumbWidth > 0 && thumbWidth < 1000) return false;

  const description = normalizeForCompare(item.title || "");

  // Require direct city-token evidence in file metadata for destination-specific confidence.
  return hasCityTokenMatch(destination, description);
}

function selectDiverseImages(items, target) {
  const selected = [];
  const bucketUsed = new Set();
  const seen = new Set();

  for (const item of items) {
    const src = chooseBestSrcFromSrcSet(item.srcset);
    if (!src || seen.has(src)) continue;

    const bucket = classifyBucket(item.title || "");
    if (bucket !== "general" && bucketUsed.has(bucket) && selected.length < target - 1) {
      continue;
    }

    selected.push(src);
    seen.add(src);
    if (bucket !== "general") bucketUsed.add(bucket);

    if (selected.length >= target) break;
  }

  if (selected.length < target) {
    for (const item of items) {
      const src = chooseBestSrcFromSrcSet(item.srcset);
      if (!src || seen.has(src)) continue;
      selected.push(src);
      seen.add(src);
      if (selected.length >= target) break;
    }
  }

  return selected;
}

async function resolveWikipediaTitle(destination) {
  const city = destination.city;
  const country = destination.country;
  const titleCandidates = [
    city,
    `${city}, ${country}`,
    `${city} (${country})`,
  ];

  for (const title of titleCandidates) {
    const summaryUrl = `${WIKI_REST}/summary/${encodeURIComponent(title)}`;
    try {
      const summary = await fetchJson(summaryUrl);
      const articleTitle = summary.title ?? title;
      if (isSummarySuitable(summary, destination)) {
        return articleTitle;
      }
    } catch {
      // continue
    }
  }

  const searchUrl = `${WIKI_API}?action=query&format=json&list=search&srlimit=10&srsearch=${encodeURIComponent(`${city} ${country}`)}`;
  try {
    const search = await fetchJson(searchUrl);
    const rows = search?.query?.search ?? [];
    for (const row of rows) {
      const title = row.title;
      try {
        const summary = await fetchJson(`${WIKI_REST}/summary/${encodeURIComponent(title)}`);
        if (isSummarySuitable(summary, destination)) {
          return title;
        }
      } catch {
        // continue
      }
    }
  } catch {
    // no-op
  }

  return null;
}

async function fetchGalleryForDestination(destination, minImages, desiredImages) {
  const title = await resolveWikipediaTitle(destination);
  if (!title) {
    return {
      images: [],
      articleTitle: null,
      candidateCount: 0,
    };
  }

  const mediaUrl = `${WIKI_REST}/media-list/${encodeURIComponent(title)}`;
  let media;

  try {
    media = await fetchJson(mediaUrl);
  } catch {
    return {
      images: [],
      articleTitle: title,
      candidateCount: 0,
    };
  }

  const candidates = (media.items ?? []).filter((item) => isImageAccepted(item, destination));
  const selected = selectDiverseImages(candidates, desiredImages);

  if (selected.length < minImages) {
    return {
      images: [],
      articleTitle: title,
      candidateCount: candidates.length,
    };
  }

  return {
    images: selected,
    articleTitle: title,
    candidateCount: candidates.length,
  };
}

function rankDestinations(destinationRows, curatedPrioritySlugs) {
  const curatedSet = new Set(curatedPrioritySlugs);

  return [...destinationRows]
    .sort((left, right) => {
      const leftCurated = curatedSet.has(left.slug) ? 1 : 0;
      const rightCurated = curatedSet.has(right.slug) ? 1 : 0;
      if (leftCurated !== rightCurated) return rightCurated - leftCurated;

      if ((right.qualityScore ?? 0) !== (left.qualityScore ?? 0)) {
        return (right.qualityScore ?? 0) - (left.qualityScore ?? 0);
      }

      return left.slug.localeCompare(right.slug);
    });
}

async function main() {
  if (!Number.isFinite(batchSize) || batchSize <= 0) {
    throw new Error("--limit must be a positive number");
  }

  const baseline = JSON.parse(await readFile(baselinePath, "utf8"));
  const destinationRows = baseline.destinationRows ?? [];

  const curatedPrimaryText = await readFile(curatedPrimaryPath, "utf8");
  const curatedPrioritySlugs = parseCuratedPrimarySlugs(curatedPrimaryText);
  const curatedPrimaryMap = parseCuratedPrimaryMap(curatedPrimaryText);

  let existingGalleries = {};
  try {
    existingGalleries = JSON.parse(await readFile(galleriesJsonPath, "utf8"));
  } catch {
    existingGalleries = {};
  }

  let progress = {
    generatedAt: new Date().toISOString(),
    totalDestinations: destinationRows.length,
    completedDestinations: 0,
    remainingDestinations: destinationRows.length,
    manualReviewDestinations: [],
    batches: [],
  };

  try {
    progress = JSON.parse(await readFile(progressPath, "utf8"));
  } catch {
    // first run
  }

  const ranked = rankDestinations(destinationRows, curatedPrioritySlugs);
  const unresolvedRanked = unresolvedOnly
    ? ranked.filter((destination) => !existingGalleries[destination.slug])
    : ranked;
  const batch = unresolvedRanked.slice(batchOffset, batchOffset + batchSize);

  if (batch.length === 0) {
    console.log("No destinations selected for this batch.");
    return;
  }

  const manualReview = [];
  const processedSlugs = [];

  for (let index = 0; index < batch.length; index += 1) {
    const destination = batch[index];

    const result = await fetchGalleryForDestination(destination, minAccepted, targetCount);

    if (result.images.length >= minAccepted) {
      existingGalleries[destination.slug] = result.images;
      curatedPrimaryMap[destination.slug] = result.images[0];
      processedSlugs.push(destination.slug);
      console.log(`[${index + 1}/${batch.length}] ${destination.slug}: ${result.images.length} verified images from ${result.articleTitle}`);
    } else {
      manualReview.push({
        slug: destination.slug,
        city: destination.city,
        country: destination.country,
        reason: `Only ${result.images.length} verified images found automatically`,
        candidateCount: result.candidateCount,
        articleTitle: result.articleTitle,
      });
      console.log(`[${index + 1}/${batch.length}] ${destination.slug}: manual review required (${result.images.length} images)`);
    }

    await new Promise((resolveDelay) => setTimeout(resolveDelay, 350));
  }

  const completedSet = new Set(Object.keys(existingGalleries));
  const totalDestinations = destinationRows.length;
  const remainingDestinations = Math.max(0, totalDestinations - completedSet.size);

  progress.generatedAt = new Date().toISOString();
  progress.totalDestinations = totalDestinations;
  progress.completedDestinations = completedSet.size;
  progress.remainingDestinations = remainingDestinations;

  const previousManual = new Map((progress.manualReviewDestinations ?? []).map((item) => [item.slug, item]));
  for (const slug of processedSlugs) {
    previousManual.delete(slug);
  }
  for (const item of manualReview) {
    previousManual.set(item.slug, item);
  }
  progress.manualReviewDestinations = Array.from(previousManual.values())
    .filter((item) => !completedSet.has(item.slug))
    .sort((a, b) => a.slug.localeCompare(b.slug));

  progress.batches = [
    ...(progress.batches ?? []),
    {
      generatedAt: progress.generatedAt,
      offset: batchOffset,
      limit: batchSize,
      unresolvedOnly,
      processedCount: processedSlugs.length,
      manualReviewCount: manualReview.length,
      processedSlugs,
      manualReviewSlugs: manualReview.map((item) => item.slug),
    },
  ];

  await writeFile(galleriesJsonPath, `${JSON.stringify(existingGalleries, null, 2)}\n`, "utf8");
  await writeFile(galleriesTsPath, `${formatGalleryTs(existingGalleries)}`, "utf8");
  await writeFile(curatedPrimaryPath, formatPrimaryMap(curatedPrimaryMap), "utf8");
  await writeFile(progressPath, `${JSON.stringify(progress, null, 2)}\n`, "utf8");

  console.log(`Updated ${galleriesJsonPath}`);
  console.log(`Updated ${galleriesTsPath}`);
  console.log(`Updated ${curatedPrimaryPath}`);
  console.log(`Updated ${progressPath}`);
  console.log(`Batch processed: ${processedSlugs.length}`);
  console.log(`Batch manual review: ${manualReview.length}`);
  console.log(`Total completed destinations: ${completedSet.size}/${totalDestinations}`);
}

main().catch((error) => {
  console.error("build_destination_image_galleries failed", error);
  process.exitCode = 1;
});
