#!/usr/bin/env node

import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const baseUrl = process.env.AUDIT_BASE_URL ?? "http://127.0.0.1:3001";
const generatedAt = new Date().toISOString();

async function fetchWithTimeout(url, timeoutMs = 30000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchJson(pathname) {
  const response = await fetchWithTimeout(`${baseUrl}${pathname}`);
  if (!response.ok) {
    throw new Error(`Failed ${pathname}: ${response.status}`);
  }
  return response.json();
}

function extractBrokenResourceLinks(html) {
  const broken = [];
  const resourceLinkRegex = /<a[^>]+data-testid="destination-resource-[^"]+"[^>]*>/gi;
  const hrefRegex = /href="([^"]*)"/i;

  for (const tag of html.match(resourceLinkRegex) ?? []) {
    const hrefMatch = tag.match(hrefRegex);
    const href = hrefMatch?.[1] ?? "";
    if (!href || href === "#" || href.toLowerCase().startsWith("javascript:")) {
      broken.push(tag);
    }
  }

  return broken.length;
}

async function auditDestinationRoutes(slugs, batchSize = 20) {
  const routeFailures = [];
  const imageMarkupIssues = [];
  const brokenResourceLinks = [];

  for (let i = 0; i < slugs.length; i += batchSize) {
    const batch = slugs.slice(i, i + batchSize);

    const results = await Promise.all(batch.map(async (slug) => {
      const response = await fetchWithTimeout(`${baseUrl}/destinations/${slug}`);
      if (!response.ok) {
        return {
          slug,
          ok: false,
          status: response.status,
          hasEmptyImageSrc: false,
          brokenResourceLinkCount: 0,
        };
      }

      const html = await response.text();
      const hasEmptyImageSrc = /<img[^>]+src=""/i.test(html);
      const brokenResourceLinkCount = extractBrokenResourceLinks(html);

      return {
        slug,
        ok: true,
        status: response.status,
        hasEmptyImageSrc,
        brokenResourceLinkCount,
      };
    }));

    for (const result of results) {
      if (!result.ok) {
        routeFailures.push({ slug: result.slug, status: result.status });
        continue;
      }

      if (result.hasEmptyImageSrc) {
        imageMarkupIssues.push(result.slug);
      }

      if (result.brokenResourceLinkCount > 0) {
        brokenResourceLinks.push({ slug: result.slug, count: result.brokenResourceLinkCount });
      }
    }
  }

  return {
    total: slugs.length,
    failed: routeFailures.length,
    routeFailures,
    imageMarkupIssues,
    brokenResourceLinks,
  };
}

function toMarkdown(report) {
  const lines = [];
  lines.push("# Destination Quality Baseline");
  lines.push("");
  lines.push(`Generated at: ${report.generatedAt}`);
  lines.push(`Audit base URL: ${report.baseUrl}`);
  lines.push(`Quality standard version: ${report.standardVersion}`);
  lines.push("");

  lines.push("## Coverage");
  lines.push("");
  lines.push(`- Destinations evaluated: ${report.coverage.destinationsEvaluated}`);
  lines.push(`- Pass: ${report.coverage.pass}`);
  lines.push(`- Warn: ${report.coverage.warn}`);
  lines.push(`- Fail: ${report.coverage.fail}`);
  lines.push("");

  lines.push("## Route and Reference Health");
  lines.push("");
  lines.push(`- Destination route failures: ${report.routeHealth.failed}`);
  lines.push(`- Broken destination resource links: ${report.brokenLinks.count}`);
  lines.push(`- Broken image markup issues: ${report.brokenImages.markupIssuesCount}`);
  lines.push("");

  lines.push("## Data and Content Quality");
  lines.push("");
  lines.push(`- Missing field flags: ${report.missingDestinationData.missingFieldFlags}`);
  lines.push(`- Missing narrative flags: ${report.missingDestinationData.missingNarrativeFlags}`);
  lines.push(`- Duplicate narrative flags: ${report.duplicateContent.duplicateNarrativeFlags}`);
  lines.push(`- Destinations with duplicate narrative text: ${report.duplicateContent.destinationsWithDuplicateNarrative}`);
  lines.push("");

  lines.push("## Photo Verification");
  lines.push("");
  lines.push(`- Review required: ${report.photoVerification.reviewRequired}`);
  lines.push(`- Verified: ${report.photoVerification.verified}`);
  lines.push("");

  lines.push("## Samples");
  lines.push("");
  lines.push(`- Route failures sample: ${report.routeHealth.routeFailures.slice(0, 20).map((item) => item.slug).join(", ") || "None"}`);
  lines.push(`- Broken resource links sample: ${report.brokenLinks.destinations.slice(0, 20).map((item) => item.slug).join(", ") || "None"}`);
  lines.push(`- Duplicate narrative sample: ${report.duplicateContent.sample.join(", ") || "None"}`);
  lines.push("");

  return lines.join("\n");
}

async function main() {
  const baseline = await fetchJson("/api/admin/destination-quality-baseline");
  const slugs = baseline.destinations.map((item) => item.slug);
  const routeHealth = await auditDestinationRoutes(slugs);

  const report = {
    generatedAt,
    baseUrl,
    standardVersion: baseline.standardVersion,
    coverage: {
      destinationsEvaluated: baseline.totals.destinations,
      pass: baseline.totals.pass,
      warn: baseline.totals.warn,
      fail: baseline.totals.fail,
    },
    routeHealth,
    brokenLinks: {
      count: routeHealth.brokenResourceLinks.reduce((total, item) => total + item.count, 0),
      destinations: routeHealth.brokenResourceLinks,
    },
    brokenImages: {
      markupIssuesCount: routeHealth.imageMarkupIssues.length,
      destinations: routeHealth.imageMarkupIssues,
    },
    missingDestinationData: {
      missingFieldFlags: baseline.totals.missingFieldFlags,
      missingNarrativeFlags: baseline.totals.missingNarrativeFlags,
      manualReviewRequired: baseline.totals.manualReviewRequired,
    },
    duplicateContent: {
      duplicateNarrativeFlags: baseline.totals.duplicateNarrativeFlags,
      destinationsWithDuplicateNarrative: baseline.totals.destinationsWithDuplicateNarrative,
      sample: baseline.destinations
        .filter((item) => item.duplicateNarrativeFields.length > 0)
        .slice(0, 25)
        .map((item) => item.slug),
    },
    photoVerification: {
      reviewRequired: baseline.totals.photoReviewRequired,
      verified: baseline.totals.destinations - baseline.totals.photoReviewRequired,
    },
    destinationRows: baseline.destinations,
  };

  const reportJsonPath = resolve("docs/destination-quality-baseline.json");
  const reportMdPath = resolve("docs/destination-quality-baseline.md");

  await writeFile(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  await writeFile(reportMdPath, `${toMarkdown(report)}\n`, "utf8");

  const criticalFailures = [];
  if (routeHealth.failed > 0) criticalFailures.push(`Destination route failures: ${routeHealth.failed}`);
  if (report.brokenLinks.count > 0) criticalFailures.push(`Broken destination resource links: ${report.brokenLinks.count}`);
  if (report.brokenImages.markupIssuesCount > 0) criticalFailures.push(`Broken image markup issues: ${report.brokenImages.markupIssuesCount}`);

  console.log(`Wrote ${reportJsonPath}`);
  console.log(`Wrote ${reportMdPath}`);
  console.log(`Destinations evaluated: ${report.coverage.destinationsEvaluated}`);
  console.log(`Quality bands -> pass: ${report.coverage.pass}, warn: ${report.coverage.warn}, fail: ${report.coverage.fail}`);

  if (criticalFailures.length > 0) {
    console.error("Destination quality baseline failed:");
    for (const failure of criticalFailures) {
      console.error(`- ${failure}`);
    }
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("Destination quality baseline failed:", error);
  process.exitCode = 1;
});