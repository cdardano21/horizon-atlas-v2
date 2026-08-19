#!/usr/bin/env node

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import {
  checksumBuffer,
  createCandidateId,
  createValidationContext,
  normalizeIdentity,
  normalizeMediaUrl,
  validateMediaCandidate,
} from "./lib/media-candidate-pipeline.mjs";

const USER_AGENT = "DestinationFinderAI-MediaStaging/2.0";
const WIKI_REST = "https://en.wikipedia.org/api/rest_v1/page";
const WIKI_API = "https://en.wikipedia.org/w/api.php";
const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
const DEFAULT_PILOT_PATH = resolve("docs/media-pipeline/pilot-10-destinations.json");
const DEFAULT_MANIFEST_PATH = resolve("docs/media-pipeline/pilot-10-media-candidates.json");
const DEFAULT_REPORT_PATH = resolve("docs/media-pipeline/pilot-10-dry-run.md");
const CURATED_PRIMARY_PATH = resolve("app/lib/curatedCityImages.ts");
const CURATED_GALLERIES_PATH = resolve("app/lib/curatedCityImageGalleries.ts");
const MAX_BATCH_SIZE = 25;
const DEFAULT_TARGET_PER_DESTINATION = 2;

function readArg(name, fallback) {
  const prefix = `--${name}=`;
  const direct = process.argv.slice(2).find((argument) => argument.startsWith(prefix));
  return direct ? direct.slice(prefix.length) : fallback;
}

function stripHtml(value) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function cityTokens(destination) {
  const normalized = normalizeIdentity(destination.city);
  const withoutSuffix = normalized.replace(/\b(city|town|village)\b/g, " ").replace(/\s+/g, " ").trim();
  return [...new Set([
    normalized,
    withoutSuffix,
    ...withoutSuffix.split(" ").filter((token) => token.length >= 4),
    ...(destination.identityAliases ?? []).map(normalizeIdentity),
  ])].filter(Boolean);
}

function identityMatch(text, values) {
  const normalizedText = normalizeIdentity(text);
  return values.some((value) => normalizedText.includes(normalizeIdentity(value)));
}

async function fetchWithEvidence(url, { binary = false } = {}) {
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    redirect: "follow",
  });
  const evidence = {
    status: response.status,
    redirected: response.redirected,
    finalUrl: response.url,
  };
  if (!response.ok) return { response, evidence, body: null };
  return {
    response,
    evidence,
    body: binary ? Buffer.from(await response.arrayBuffer()) : await response.json(),
  };
}

async function fetchJson(url) {
  const result = await fetchWithEvidence(url);
  if (!result.response.ok) throw new Error(`${result.response.status} ${result.response.statusText}: ${url}`);
  return result.body;
}

function assertPilotIsUnpublished(destinations, curatedSources) {
  if (destinations.length !== 10) throw new Error(`Pilot must contain exactly 10 destinations; received ${destinations.length}`);
  if (destinations.length > MAX_BATCH_SIZE) throw new Error(`Batch exceeds hard maximum of ${MAX_BATCH_SIZE}`);
  const duplicateSlugs = destinations.filter((destination, index) => destinations.findIndex((item) => item.slug === destination.slug) !== index);
  if (duplicateSlugs.length > 0) throw new Error(`Duplicate pilot slugs: ${duplicateSlugs.map((item) => item.slug).join(", ")}`);

  const alreadyPublished = destinations
    .filter((destination) => curatedSources.some((source) => source.includes(`"${destination.slug}"`)))
    .map((destination) => destination.slug);
  if (alreadyPublished.length > 0) {
    throw new Error(`STOP: pilot destination already has production curated media: ${alreadyPublished.join(", ")}`);
  }
}

function summaryMatchesDestination(summary, destination) {
  const combined = `${summary?.title ?? ""} ${summary?.description ?? ""} ${summary?.extract ?? ""}`;
  return identityMatch(combined, cityTokens(destination)) && identityMatch(combined, [destination.country]);
}

async function resolveArticle(destination) {
  const candidates = [destination.articleTitle, destination.city, `${destination.city}, ${destination.country}`].filter(Boolean);
  for (const title of candidates) {
    try {
      const summary = await fetchJson(`${WIKI_REST}/summary/${encodeURIComponent(title)}`);
      if (summaryMatchesDestination(summary, destination)) return summary;
    } catch {
      // Continue to the exact city-country search.
    }
  }

  try {
    const search = await fetchJson(`${WIKI_API}?action=query&format=json&list=search&srlimit=8&srsearch=${encodeURIComponent(`${destination.city} ${destination.country}`)}`);
    for (const row of search?.query?.search ?? []) {
      try {
        const summary = await fetchJson(`${WIKI_REST}/summary/${encodeURIComponent(row.title)}`);
        if (summaryMatchesDestination(summary, destination)) return summary;
      } catch {
        // Continue until an exact identity match is found.
      }
    }
  } catch {
    return null;
  }
  return null;
}

function isCandidateMediaItem(item, destination) {
  if (item?.type !== "image" || !item.showInGallery || !String(item.title ?? "").startsWith("File:")) return false;
  const title = normalizeIdentity(item.title);
  const banned = [
    "map",
    "flag",
    "logo",
    "emblem",
    "coat of arms",
    "diagram",
    "painting",
    "portrait",
    "montage",
    "coin",
    "tetradracma",
    "tetradrachm",
    "medal",
    "artifact",
    "airport",
    "station",
  ];
  return !/\.(svg|gif|png)$/i.test(item.title)
    && !banned.some((term) => title.includes(term))
    && identityMatch(title, cityTokens(destination));
}

async function fetchCommonsMetadata(fileTitle) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    prop: "imageinfo",
    iiprop: "url|size|mime|sha1|extmetadata",
    iiurlwidth: "1600",
    titles: fileTitle,
  });
  const payload = await fetchJson(`${COMMONS_API}?${params}`);
  const page = Object.values(payload?.query?.pages ?? {})[0];
  const info = page?.imageinfo?.[0];
  return info ? { page, info } : null;
}

function metadataValue(metadata, key) {
  return stripHtml(metadata?.[key]?.value);
}

function canonicalFilePage(fileTitle) {
  return `https://commons.wikimedia.org/wiki/${encodeURIComponent(fileTitle.replace(/ /g, "_"))}`;
}

async function buildCandidate(destination, article, item, discoveredAt) {
  const metadataResult = await fetchCommonsMetadata(item.title);
  if (!metadataResult) return null;
  const { info } = metadataResult;
  const metadata = info.extmetadata ?? {};
  const candidateUrl = info.thumburl || info.url;
  const binaryResult = await fetchWithEvidence(candidateUrl, { binary: true });
  const body = binaryResult.body;
  const checksum = body ? checksumBuffer(body) : String(info.sha1 ?? "").padEnd(64, "0").slice(0, 64);
  const normalizedUrl = normalizeMediaUrl(candidateUrl);
  const creator = metadataValue(metadata, "Artist") || metadataValue(metadata, "Credit");
  const license = metadataValue(metadata, "LicenseShortName");
  const licenseUrl = metadataValue(metadata, "LicenseUrl");
  const imageDescription = metadataValue(metadata, "ImageDescription");
  const cityMatched = identityMatch(`${item.title} ${imageDescription}`, cityTokens(destination));
  const countryMatched = summaryMatchesDestination(article, destination);
  const requiredAttribution = [creator, license, "via Wikimedia Commons"].filter(Boolean).join(", ");

  const candidate = {
    candidateId: "",
    destinationSlug: destination.slug,
    destinationKey: destination.destinationKey,
    city: destination.city,
    country: destination.country,
    candidateUrl,
    normalizedUrl,
    canonicalSourcePage: canonicalFilePage(item.title),
    creator,
    rightsHolder: creator,
    license,
    licenseUrl,
    requiredAttribution,
    width: Number(info.thumbwidth || info.width || 0),
    height: Number(info.thumbheight || info.height || 0),
    mime: binaryResult.response.headers.get("content-type")?.split(";")[0] || info.mime || "",
    checksum,
    sourceIdentityEvidence: {
      destinationSlug: destination.slug,
      articleTitle: article.title,
      articleDescription: article.description ?? null,
      fileTitle: item.title,
      imageDescription,
      cityMatched,
      countryMatched,
      matchedTerms: [destination.city, destination.country],
    },
    discoveredAt,
    status: "discovered",
    review: { status: "pending", reviewer: null, reviewedAt: null },
    rejectionReason: null,
    transform: { resized: false, cropped: false },
    localDerivativePath: null,
    http: binaryResult.evidence,
  };
  candidate.candidateId = createCandidateId({ destinationSlug: destination.slug, normalizedUrl, checksum });
  return candidate;
}

function buildReport(manifest) {
  const lines = [
    "# Media Candidate Pilot Dry Run",
    "",
    `- Manifest: ${manifest.manifestId}`,
    `- Generated: ${manifest.generatedAt}`,
    `- Production media altered: **No**`,
    `- Human approval required: **Yes**`,
    "",
    "| Destination | Discovered | Rejected | Needs review | Approved | License/source | Local derivative | Remains on fallback |",
    "| --- | ---: | ---: | ---: | ---: | --- | --- | --- |",
  ];

  for (const result of manifest.destinationResults) {
    const candidates = manifest.candidates.filter((candidate) => candidate.destinationSlug === result.slug);
    const rejected = candidates.filter((candidate) => candidate.status === "validation_failed" || candidate.status === "rejected");
    const review = candidates.filter((candidate) => candidate.status === "needs_review");
    const approved = candidates.filter((candidate) => candidate.status === "approved" || candidate.status === "adopted");
    const sourceSummary = [...new Set(candidates.map((candidate) => `${candidate.license || "missing license"} / Wikimedia Commons`))].join("; ") || "No candidate";
    const rejectionSummary = rejected.flatMap((candidate) => candidate.validation?.errors ?? [candidate.rejectionReason]).filter(Boolean).join(", ");
    lines.push(`| ${result.slug} | ${candidates.length} | ${rejected.length}${rejectionSummary ? ` (${rejectionSummary})` : ""} | ${review.length} | ${approved.length} | ${sourceSummary} | No | ${approved.length === 0 ? "Yes" : "Pending adoption"} |`);
  }

  lines.push("", "## Gate State", "", "All valid candidates remain `needs_review`. No runtime map, database table, workbook, or destination detail media was modified.", "");
  return lines.join("\n");
}

async function main() {
  const pilotPath = resolve(readArg("pilot", DEFAULT_PILOT_PATH));
  const manifestPath = resolve(readArg("manifest", DEFAULT_MANIFEST_PATH));
  const reportPath = resolve(readArg("report", DEFAULT_REPORT_PATH));
  const targetPerDestination = Number(readArg("target", String(DEFAULT_TARGET_PER_DESTINATION)));
  if (!Number.isInteger(targetPerDestination) || targetPerDestination < 1 || targetPerDestination > 3) {
    throw new Error("--target must be an integer from 1 to 3");
  }

  const pilot = JSON.parse(await readFile(pilotPath, "utf8"));
  const destinations = pilot.destinations ?? [];
  const curatedSources = await Promise.all([
    readFile(CURATED_PRIMARY_PATH, "utf8"),
    readFile(CURATED_GALLERIES_PATH, "utf8"),
  ]);
  assertPilotIsUnpublished(destinations, curatedSources);

  console.log("Verified missing-media pilot slugs:");
  destinations.forEach((destination) => console.log(`- ${destination.slug}`));
  console.log("Discovery mode: STAGE ONLY; production writes are disabled.");

  const generatedAt = new Date().toISOString();
  const context = createValidationContext(destinations, generatedAt);
  const candidates = [];
  const destinationResults = [];

  for (const destination of destinations) {
    const article = await resolveArticle(destination);
    if (!article) {
      destinationResults.push({ slug: destination.slug, articleTitle: null, candidatesDiscovered: 0, reason: "destination_article_not_resolved" });
      continue;
    }

    let media;
    try {
      media = await fetchJson(`${WIKI_REST}/media-list/${encodeURIComponent(article.title)}`);
    } catch (error) {
      destinationResults.push({
        slug: destination.slug,
        articleTitle: article.title,
        candidatesDiscovered: 0,
        reason: `media_list_fetch_failed: ${error instanceof Error ? error.message : String(error)}`,
      });
      continue;
    }
    const items = (media?.items ?? []).filter((item) => isCandidateMediaItem(item, destination)).slice(0, targetPerDestination);
    const candidateErrors = [];
    for (const item of items) {
      try {
        const discovered = await buildCandidate(destination, article, item, generatedAt);
        if (discovered) candidates.push(validateMediaCandidate(discovered, context));
      } catch (error) {
        candidateErrors.push(`candidate_fetch_failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    const discoveredCount = candidates.filter((candidate) => candidate.destinationSlug === destination.slug).length;
    destinationResults.push({
      slug: destination.slug,
      articleTitle: article.title,
      candidatesDiscovered: discoveredCount,
      reason: items.length === 0
        ? "no_identity_scoped_file_candidates"
        : discoveredCount === 0 && candidateErrors.length > 0
          ? candidateErrors.join("; ")
          : null,
    });
  }

  const manifestId = `media-pilot-${createCandidateId({ destinationSlug: pilot.pilotId, normalizedUrl: generatedAt, checksum: String(candidates.length) })}`;
  const manifest = {
    schemaVersion: 1,
    manifestId,
    pilotId: pilot.pilotId,
    generatedAt,
    mode: "stage_only",
    productionWritePerformed: false,
    runtimeMapsModified: false,
    humanApprovalRequired: true,
    destinations,
    destinationResults,
    candidates,
  };

  await mkdir(resolve(manifestPath, ".."), { recursive: true });
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  await writeFile(reportPath, `${buildReport(manifest)}\n`, "utf8");

  console.log(`Staged manifest: ${manifestPath}`);
  console.log(`Dry-run report: ${reportPath}`);
  console.log(`Candidates needing review: ${candidates.filter((candidate) => candidate.status === "needs_review").length}`);
  console.log(`Candidates rejected by validation: ${candidates.filter((candidate) => candidate.status === "validation_failed").length}`);
  console.log("Production media altered: NO");
}

main().catch((error) => {
  console.error("stage_destination_media_candidates failed", error);
  process.exitCode = 1;
});
