#!/usr/bin/env node

import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const baseUrl = process.env.AUDIT_BASE_URL ?? "http://127.0.0.1:3001";
const generatedAt = new Date().toISOString();

const CORE_ROUTES = [
  "/",
  "/destinations",
  "/about",
  "/compare",
  "/contact",
  "/life-match",
  "/login",
  "/pricing",
  "/privacy",
  "/profile",
  "/results",
  "/signup",
  "/terms",
  "/admin",
  "/admin/verification",
];

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

async function auditCoreRoutes() {
  const failures = [];

  for (const route of CORE_ROUTES) {
    const response = await fetchWithTimeout(`${baseUrl}${route}`);
    if (!response.ok) {
      failures.push({ route, status: response.status });
    }
  }

  return {
    total: CORE_ROUTES.length,
    failed: failures.length,
    failures,
  };
}

async function auditDestinationRoutes(slugs, batchSize = 20) {
  const routeFailures = [];
  const missingMapLinks = [];
  const imageMarkupIssues = [];
  const brokenResourceLinks = [];

  for (let i = 0; i < slugs.length; i += batchSize) {
    const batch = slugs.slice(i, i + batchSize);
    const results = await Promise.all(batch.map(async (slug) => {
      const response = await fetchWithTimeout(`${baseUrl}/destinations/${slug}`);
      if (!response.ok) {
        return { slug, ok: false, status: response.status };
      }

      const html = await response.text();
      const hasMap = html.includes("data-testid=\"destination-resource-google-maps\"");
      const hasEarth = html.includes("data-testid=\"destination-resource-google-earth\"");
      const hasEmptyImageSrc = /<img[^>]+src=\"\"/i.test(html);
      const brokenResourceLinkCount = extractBrokenResourceLinks(html);

      return {
        slug,
        ok: true,
        hasMap,
        hasEarth,
        hasEmptyImageSrc,
        brokenResourceLinkCount,
      };
    }));

    results.forEach((item) => {
      if (!item.ok) {
        routeFailures.push({ slug: item.slug, status: item.status });
        return;
      }

      if (!item.hasMap || !item.hasEarth) {
        missingMapLinks.push(item.slug);
      }

      if (item.hasEmptyImageSrc) {
        imageMarkupIssues.push(item.slug);
      }

      if (item.brokenResourceLinkCount > 0) {
        brokenResourceLinks.push({ slug: item.slug, count: item.brokenResourceLinkCount });
      }
    });
  }

  return {
    total: slugs.length,
    failed: routeFailures.length,
    routeFailures,
    missingMapLinks,
    imageMarkupIssues,
    brokenResourceLinks,
  };
}

function buildTechnicalDebt(coreRouteAudit, destinationAudit, verificationReport) {
  const debt = [];

  if (coreRouteAudit.failed > 0) {
    debt.push(`Core routes failing HTTP checks: ${coreRouteAudit.failed}`);
  }

  if (destinationAudit.failed > 0) {
    debt.push(`Destination routes failing HTTP checks: ${destinationAudit.failed}`);
  }

  if (destinationAudit.missingMapLinks.length > 0) {
    debt.push(`Destination pages missing published map resources: ${destinationAudit.missingMapLinks.length}`);
  }

  if (verificationReport.totals.externalLinkReviewRequired > 0) {
    debt.push(`External-link verification backlog exists for ${verificationReport.totals.externalLinkReviewRequired} destinations`);
  }

  if (verificationReport.totals.imageReviewRequired > 0) {
    debt.push(`Image verification backlog exists for ${verificationReport.totals.imageReviewRequired} destinations`);
  }

  if (verificationReport.totals.lowConfidenceDestinations > 0) {
    debt.push(`Low-confidence factual coverage exists for ${verificationReport.totals.lowConfidenceDestinations} destinations`);
  }

  return debt;
}

function buildDataQualityIssues(verificationReport) {
  const issues = [];

  const missingClimate = verificationReport.destinations.filter((item) =>
    item.missingFields.includes("No published monthly climate rows"),
  );

  const missingSourceLinks = verificationReport.destinations.filter((item) =>
    item.missingFields.includes("No external source links"),
  );

  issues.push({
    name: "Missing field flags",
    count: verificationReport.totals.missingFieldFlags,
  });

  issues.push({
    name: "Destinations missing monthly climate rows",
    count: missingClimate.length,
  });

  issues.push({
    name: "Destinations with no external source links",
    count: missingSourceLinks.length,
  });

  issues.push({
    name: "Destinations flagged for low confidence",
    count: verificationReport.totals.lowConfidenceDestinations,
  });

  return issues;
}

function buildDuplicateContentSummary(qualityBaseline) {
  const duplicateRows = qualityBaseline.destinations.filter((item) => item.duplicateNarrativeFields.length > 0);
  return {
    duplicateNarrativeFlags: qualityBaseline.totals.duplicateNarrativeFlags,
    destinationsWithDuplicateNarrative: qualityBaseline.totals.destinationsWithDuplicateNarrative,
    sample: duplicateRows.slice(0, 25).map((item) => item.slug),
  };
}

function toMarkdown(report) {
  const lines = [];

  lines.push("# Final Production Readiness Report");
  lines.push("");
  lines.push(`Generated at: ${report.generatedAt}`);
  lines.push(`Audit base URL: ${report.baseUrl}`);
  lines.push("");

  lines.push("## Validation Summary");
  lines.push("");
  lines.push(`- Core route HTTP checks: ${report.checks.coreRoutes.failed === 0 ? "PASS" : "FAIL"} (${report.checks.coreRoutes.total - report.checks.coreRoutes.failed}/${report.checks.coreRoutes.total})`);
  lines.push(`- Destination route HTTP checks: ${report.checks.destinationRoutes.failed === 0 ? "PASS" : "FAIL"} (${report.checks.destinationRoutes.total - report.checks.destinationRoutes.failed}/${report.checks.destinationRoutes.total})`);
  lines.push(`- Destination map-resource publish checks: ${report.checks.destinationRoutes.missingMapLinks.length === 0 ? "PASS" : "FAIL"} (${report.checks.destinationRoutes.total - report.checks.destinationRoutes.missingMapLinks.length}/${report.checks.destinationRoutes.total})`);
  lines.push(`- Destination broken resource links: ${report.brokenLinks.count}`);
  lines.push(`- Destination broken image markup issues: ${report.brokenImages.count}`);
  lines.push(`- Manual factual review required: ${report.manualFactualReview.slugs.length}`);
  lines.push(`- Manual image verification required: ${report.manualImageReview.slugs.length}`);
  lines.push("");

  lines.push("## Broken Links and Images");
  lines.push("");
  lines.push(`- Broken destination resource links: ${report.brokenLinks.count}`);
  lines.push(`- Broken image markup issues: ${report.brokenImages.count}`);
  lines.push(`- Broken-link sample: ${report.brokenLinks.destinations.slice(0, 20).map((item) => item.slug).join(", ") || "None"}`);
  lines.push(`- Broken-image sample: ${report.brokenImages.destinations.slice(0, 20).join(", ") || "None"}`);
  lines.push("");

  lines.push("## Missing and Duplicate Content");
  lines.push("");
  lines.push(`- Missing destination field flags: ${report.missingDestinationData.missingFieldFlags}`);
  lines.push(`- Missing destination narrative flags: ${report.missingDestinationData.missingNarrativeFlags}`);
  lines.push(`- Duplicate narrative flags: ${report.duplicateContent.duplicateNarrativeFlags}`);
  lines.push(`- Destinations with duplicate narrative text: ${report.duplicateContent.destinationsWithDuplicateNarrative}`);
  lines.push(`- Duplicate-content sample: ${report.duplicateContent.sample.join(", ") || "None"}`);
  lines.push("");

  lines.push("## Photo Verification Status");
  lines.push("");
  lines.push(`- Verified photo status: ${report.photoVerificationStatus.verified}`);
  lines.push(`- Photo review required: ${report.photoVerificationStatus.reviewRequired}`);
  lines.push("");

  lines.push("## Remaining Technical Debt");
  lines.push("");
  if (report.remainingTechnicalDebt.length === 0) {
    lines.push("- None identified by this audit pass.");
  } else {
    report.remainingTechnicalDebt.forEach((item) => lines.push(`- ${item}`));
  }
  lines.push("");

  lines.push("## Remaining Data-Quality Issues");
  lines.push("");
  report.remainingDataQualityIssues.forEach((item) => {
    lines.push(`- ${item.name}: ${item.count}`);
  });
  lines.push("");

  lines.push("## Manual Factual Review Destinations");
  lines.push("");
  lines.push(`- Total: ${report.manualFactualReview.slugs.length}`);
  lines.push(`- Sample: ${report.manualFactualReview.slugs.slice(0, 25).join(", ") || "None"}`);
  lines.push("");

  lines.push("## Manual Image Verification Destinations");
  lines.push("");
  lines.push(`- Total: ${report.manualImageReview.slugs.length}`);
  lines.push(`- Sample: ${report.manualImageReview.slugs.slice(0, 25).join(", ") || "None"}`);
  lines.push("");

  lines.push("## Recommended Next Priorities");
  lines.push("");
  report.nextPriorities.forEach((item, index) => {
    lines.push(`${index + 1}. ${item}`);
  });
  lines.push("");

  return lines.join("\n");
}

async function main() {
  const verificationReport = await fetchJson("/api/admin/destination-verification");
  const imageReviewReport = await fetchJson("/api/admin/image-review-required");
  const qualityBaseline = await fetchJson("/api/admin/destination-quality-baseline");

  const destinationSlugs = verificationReport.destinations.map((item) => item.slug);

  const coreRouteAudit = await auditCoreRoutes();
  const destinationAudit = await auditDestinationRoutes(destinationSlugs);

  const manualFactualReviewSlugs = verificationReport.destinations
    .filter((item) => item.manualReviewRequired)
    .map((item) => item.slug);

  const manualImageReviewSlugs = imageReviewReport.destinations.map((item) => item.slug);

  const report = {
    generatedAt,
    baseUrl,
    checks: {
      coreRoutes: coreRouteAudit,
      destinationRoutes: destinationAudit,
      verificationTotals: verificationReport.totals,
      qualityBaselineTotals: qualityBaseline.totals,
    },
    brokenLinks: {
      count: destinationAudit.brokenResourceLinks.reduce((total, row) => total + row.count, 0),
      destinations: destinationAudit.brokenResourceLinks,
    },
    brokenImages: {
      count: destinationAudit.imageMarkupIssues.length,
      destinations: destinationAudit.imageMarkupIssues,
    },
    missingDestinationData: {
      missingFieldFlags: qualityBaseline.totals.missingFieldFlags,
      missingNarrativeFlags: qualityBaseline.totals.missingNarrativeFlags,
      manualReviewRequired: qualityBaseline.totals.manualReviewRequired,
    },
    duplicateContent: buildDuplicateContentSummary(qualityBaseline),
    photoVerificationStatus: {
      reviewRequired: qualityBaseline.totals.photoReviewRequired,
      verified: qualityBaseline.totals.destinations - qualityBaseline.totals.photoReviewRequired,
    },
    remainingTechnicalDebt: buildTechnicalDebt(coreRouteAudit, destinationAudit, verificationReport),
    remainingDataQualityIssues: buildDataQualityIssues(verificationReport),
    manualFactualReview: {
      count: manualFactualReviewSlugs.length,
      slugs: manualFactualReviewSlugs,
    },
    manualImageReview: {
      count: manualImageReviewSlugs.length,
      slugs: manualImageReviewSlugs,
    },
    nextPriorities: [
      "Close the image verification queue first, prioritizing destinations with missing image URLs or duplicate primary assets.",
      "Add asynchronous external-link health probing with cached status history and retry windows for transient failures.",
      "Backfill monthly climate rows and missing source links for destinations currently flagged with missing fields.",
      "Promote deterministic UI selectors (data-testid) as a required convention for all new interactive components.",
      "Run validate:all and production_readiness_audit on CI for every PR before merge.",
    ],
  };

  const reportJsonPath = resolve("docs/production-readiness-report.json");
  const reportMdPath = resolve("docs/production-readiness-report.md");

  await writeFile(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  await writeFile(reportMdPath, `${toMarkdown(report)}\n`, "utf8");

  console.log(`Wrote ${reportJsonPath}`);
  console.log(`Wrote ${reportMdPath}`);
  console.log(`Manual factual review count: ${report.manualFactualReview.count}`);
  console.log(`Manual image review count: ${report.manualImageReview.count}`);
}

main().catch((error) => {
  console.error("Production readiness audit failed:", error);
  process.exitCode = 1;
});
