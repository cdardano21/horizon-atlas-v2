import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const proposalPath = path.join(repoRoot, "docs/destination-expansion-proposed-300.json");
const mergedPath = path.join(repoRoot, "supabase/generated-command-center-seeds-merged.json");
const outputPath = path.join(repoRoot, "docs/destination-expansion-coverage-report.json");

const requiredCategories = [
  "monthlyClimate",
  "costOfLiving",
  "housingMetrics",
  "healthcareFacilities",
  "airports",
  "visaPrograms",
  "taxRules",
  "practicalInfo",
];

function countFilledArray(seed, key) {
  const value = seed?.[key];
  return Array.isArray(value) ? value.length : 0;
}

function bucketReadiness(score) {
  if (score >= 8) return "ready";
  if (score >= 5) return "partial";
  return "pending";
}

function main() {
  const proposal = JSON.parse(fs.readFileSync(proposalPath, "utf8"));
  const merged = JSON.parse(fs.readFileSync(mergedPath, "utf8"));

  const rows = proposal.map((item) => {
    const seed = merged[item.slug] || {};

    const categoryCounts = Object.fromEntries(
      requiredCategories.map((category) => [category, countFilledArray(seed, category)]),
    );

    const filledCoreCategories = requiredCategories.filter((category) => categoryCounts[category] > 0).length;
    const readinessScore = filledCoreCategories;

    return {
      slug: item.slug,
      city: item.city,
      country: item.country,
      additionGroup: item.additionGroup,
      tierTarget: item.tierTarget,
      readinessScore,
      readinessBucket: bucketReadiness(readinessScore),
      filledCoreCategories,
      requiredCategoryTotal: requiredCategories.length,
      categoryCounts,
    };
  });

  const summary = {
    generatedAt: new Date().toISOString(),
    proposalCount: proposal.length,
    readinessBuckets: rows.reduce((acc, row) => {
      acc[row.readinessBucket] = (acc[row.readinessBucket] || 0) + 1;
      return acc;
    }, {}),
    averageReadinessScore:
      rows.length > 0 ? Number((rows.reduce((sum, row) => sum + row.readinessScore, 0) / rows.length).toFixed(2)) : 0,
    coreCategoryCoverage: requiredCategories.reduce((acc, category) => {
      const withCoverage = rows.filter((row) => row.categoryCounts[category] > 0).length;
      acc[category] = {
        coveredDestinations: withCoverage,
        coverageRate: Number(((withCoverage / rows.length) * 100).toFixed(2)),
      };
      return acc;
    }, {}),
  };

  const output = {
    summary,
    rows,
  };

  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`Wrote expansion coverage report: ${path.relative(repoRoot, outputPath)}`);
}

main();
