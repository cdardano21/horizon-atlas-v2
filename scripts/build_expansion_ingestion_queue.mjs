import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const coveragePath = path.join(repoRoot, "docs/destination-expansion-coverage-report.json");
const outputPath = path.join(repoRoot, "docs/destination-expansion-ingestion-queue.json");

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

function categoryTasks(row) {
  return categoryPriority
    .filter((category) => (row.categoryCounts?.[category] ?? 0) === 0)
    .map((category) => ({
      category,
      priorityRank: categoryPriority.indexOf(category) + 1,
    }));
}

function groupRank(group) {
  return group === "US" ? 1 : 2;
}

function tierRank(tier) {
  if (tier === "TIER_1") return 1;
  if (tier === "TIER_2") return 2;
  return 3;
}

function main() {
  const coverage = JSON.parse(fs.readFileSync(coveragePath, "utf8"));
  const rows = Array.isArray(coverage.rows) ? coverage.rows : [];

  const queue = rows
    .map((row) => ({
      slug: row.slug,
      city: row.city,
      country: row.country,
      additionGroup: row.additionGroup,
      tierTarget: row.tierTarget,
      readinessBucket: row.readinessBucket,
      readinessScore: row.readinessScore,
      filledCoreCategories: row.filledCoreCategories,
      requiredCategoryTotal: row.requiredCategoryTotal,
      pendingCategories: categoryTasks(row),
    }))
    .sort((a, b) => {
      const byTier = tierRank(a.tierTarget) - tierRank(b.tierTarget);
      if (byTier !== 0) return byTier;
      const byReadiness = a.readinessScore - b.readinessScore;
      if (byReadiness !== 0) return byReadiness;
      const byGroup = groupRank(a.additionGroup) - groupRank(b.additionGroup);
      if (byGroup !== 0) return byGroup;
      return a.slug.localeCompare(b.slug);
    });

  const wave1 = queue.filter((row) => row.tierTarget === "TIER_1");
  const wave2 = queue.filter((row) => row.tierTarget === "TIER_2");
  const wave3 = queue.filter((row) => row.tierTarget === "TIER_3");

  const output = {
    generatedAt: new Date().toISOString(),
    totalQueueItems: queue.length,
    waveCounts: {
      tier1: wave1.length,
      tier2: wave2.length,
      tier3: wave3.length,
    },
    categoryPriority,
    queue,
  };

  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`Wrote expansion ingestion queue: ${path.relative(repoRoot, outputPath)}`);
}

main();
