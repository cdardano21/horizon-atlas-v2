import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const coveragePath = path.join(repoRoot, "docs/destination-expansion-coverage-report.json");
const queuePath = path.join(repoRoot, "docs/destination-expansion-ingestion-queue.json");
const outputPath = path.join(repoRoot, "docs/destination-expansion-readiness-validator.json");

const minScoreForStructured = 6;

function main() {
  const coverage = JSON.parse(fs.readFileSync(coveragePath, "utf8"));
  const queue = JSON.parse(fs.readFileSync(queuePath, "utf8"));

  const rows = Array.isArray(coverage.rows) ? coverage.rows : [];
  const queueRows = Array.isArray(queue.queue) ? queue.queue : [];

  const ready = rows.filter((row) => row.readinessScore >= minScoreForStructured);
  const pending = rows.filter((row) => row.readinessScore < minScoreForStructured);

  const topBlockers = {};
  for (const item of queueRows) {
    for (const missing of item.pendingCategories || []) {
      topBlockers[missing.category] = (topBlockers[missing.category] || 0) + 1;
    }
  }

  const output = {
    generatedAt: new Date().toISOString(),
    gates: {
      minScoreForStructured,
      requiredState: "research -> structured",
    },
    totals: {
      proposalDestinations: rows.length,
      readyForStructured: ready.length,
      pendingResearch: pending.length,
      readyRatePct: rows.length ? Number(((ready.length / rows.length) * 100).toFixed(2)) : 0,
    },
    blockersByCategory: Object.entries(topBlockers)
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({ category, count })),
    sampleReady: ready.slice(0, 20).map((row) => ({ slug: row.slug, readinessScore: row.readinessScore })),
    samplePending: pending.slice(0, 20).map((row) => ({ slug: row.slug, readinessScore: row.readinessScore })),
  };

  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`Wrote readiness validator report: ${path.relative(repoRoot, outputPath)}`);
}

main();
