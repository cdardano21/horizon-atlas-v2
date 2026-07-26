import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const queuePath = path.join(repoRoot, "docs/destination-expansion-ingestion-queue.json");
const coveragePath = path.join(repoRoot, "docs/destination-expansion-coverage-report.json");
const readinessPath = path.join(repoRoot, "docs/destination-expansion-readiness-validator.json");

const wave1OutputPath = path.join(repoRoot, "docs/destination-expansion-wave1-batches.json");
const dashboardOutputPath = path.join(repoRoot, "docs/destination-expansion-progress-dashboard.json");

const categoryPriority = [
  "monthlyClimate",
  "costOfLiving",
  "housingMetrics",
  "healthcareFacilities",
  "airports",
  "visaPrograms",
  "taxRules",
  "practicalInfo",
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function pct(numerator, denominator) {
  if (!denominator) return 0;
  return Number(((numerator / denominator) * 100).toFixed(2));
}

function summarizeGroup(rows) {
  const total = rows.length;
  const ready = rows.filter((row) => row.readinessBucket === "ready").length;
  const partial = rows.filter((row) => row.readinessBucket === "partial").length;
  const pending = rows.filter((row) => row.readinessBucket === "pending").length;
  const avgScore = total
    ? Number((rows.reduce((sum, row) => sum + (row.readinessScore || 0), 0) / total).toFixed(2))
    : 0;

  return {
    total,
    ready,
    partial,
    pending,
    readyPct: pct(ready, total),
    avgReadinessScore: avgScore,
  };
}

function main() {
  const queueDoc = readJson(queuePath);
  const coverageDoc = readJson(coveragePath);
  const readinessDoc = readJson(readinessPath);

  const queueRows = Array.isArray(queueDoc.queue) ? queueDoc.queue : [];
  const wave1Rows = queueRows.filter((row) => row.tierTarget === "TIER_1");

  const batchesByCategory = categoryPriority.map((category, index) => {
    const destinations = wave1Rows
      .filter((row) =>
        Array.isArray(row.pendingCategories)
          ? row.pendingCategories.some((pending) => pending.category === category)
          : false,
      )
      .map((row) => ({
        slug: row.slug,
        city: row.city,
        country: row.country,
        additionGroup: row.additionGroup,
      }));

    return {
      category,
      executionOrder: index + 1,
      destinationCount: destinations.length,
      destinations,
    };
  });

  const wave1Output = {
    generatedAt: new Date().toISOString(),
    sourceFiles: {
      queue: "docs/destination-expansion-ingestion-queue.json",
      coverage: "docs/destination-expansion-coverage-report.json",
      readiness: "docs/destination-expansion-readiness-validator.json",
    },
    wave: "TIER_1",
    destinationCount: wave1Rows.length,
    categoryPriority,
    batchesByCategory,
  };

  fs.writeFileSync(wave1OutputPath, `${JSON.stringify(wave1Output, null, 2)}\n`, "utf8");

  const coverageRows = Array.isArray(coverageDoc.rows) ? coverageDoc.rows : [];
  const tier1CoverageRows = coverageRows.filter((row) => row.tierTarget === "TIER_1");
  const tier2CoverageRows = coverageRows.filter((row) => row.tierTarget === "TIER_2");
  const tier3CoverageRows = coverageRows.filter((row) => row.tierTarget === "TIER_3");

  const dashboard = {
    generatedAt: new Date().toISOString(),
    proposalScope: {
      total: readinessDoc?.totals?.proposalDestinations ?? coverageRows.length,
      tiers: {
        TIER_1: summarizeGroup(tier1CoverageRows),
        TIER_2: summarizeGroup(tier2CoverageRows),
        TIER_3: summarizeGroup(tier3CoverageRows),
      },
      overall: {
        ready: readinessDoc?.totals?.readyForStructured ?? 0,
        pending: readinessDoc?.totals?.pendingResearch ?? 0,
        readyRatePct: readinessDoc?.totals?.readyRatePct ?? 0,
        averageReadinessScore: coverageDoc?.summary?.averageReadinessScore ?? 0,
      },
    },
    coreCategoryCoverage: coverageDoc?.summary?.coreCategoryCoverage ?? {},
    blockersByCategory: readinessDoc?.blockersByCategory ?? [],
    queueStatus: {
      totalQueueItems: queueDoc?.totalQueueItems ?? queueRows.length,
      waveCounts: queueDoc?.waveCounts ?? {
        tier1: wave1Rows.length,
        tier2: queueRows.filter((row) => row.tierTarget === "TIER_2").length,
        tier3: queueRows.filter((row) => row.tierTarget === "TIER_3").length,
      },
      activeWave: "TIER_1",
      activeWaveDestinationCount: wave1Rows.length,
    },
  };

  fs.writeFileSync(dashboardOutputPath, `${JSON.stringify(dashboard, null, 2)}\n`, "utf8");

  console.log(`Wrote Wave 1 run artifact: ${path.relative(repoRoot, wave1OutputPath)}`);
  console.log(`Wrote expansion dashboard: ${path.relative(repoRoot, dashboardOutputPath)}`);
}

main();
