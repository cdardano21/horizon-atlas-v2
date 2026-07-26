import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const outputPath = path.join(repoRoot, "docs/destination-expansion-wave1-input-completeness.json");

const plans = [
  {
    name: "monthlyClimate",
    inputPath: path.join(repoRoot, "docs/destination-expansion-wave1-monthly-climate-input.json"),
    categories: ["monthlyClimate"],
  },
  {
    name: "costHousing",
    inputPath: path.join(repoRoot, "docs/destination-expansion-wave1-cost-housing-input.json"),
    categories: ["costOfLiving", "housingMetrics"],
  },
  {
    name: "healthAirports",
    inputPath: path.join(repoRoot, "docs/destination-expansion-wave1-health-airports-input.json"),
    categories: ["healthcareFacilities", "airports"],
  },
  {
    name: "visaTax",
    inputPath: path.join(repoRoot, "docs/destination-expansion-wave1-visa-tax-input.json"),
    categories: ["visaPrograms", "taxRules"],
  },
  {
    name: "practicalInfo",
    inputPath: path.join(repoRoot, "docs/destination-expansion-wave1-practical-info-input.json"),
    categories: ["practicalInfo"],
  },
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function pct(numerator, denominator) {
  if (!denominator) return 0;
  return Number(((numerator / denominator) * 100).toFixed(2));
}

function summarizePlan(plan) {
  const relativePath = path.relative(repoRoot, plan.inputPath);
  if (!fs.existsSync(plan.inputPath)) {
    return {
      name: plan.name,
      inputFile: relativePath,
      exists: false,
      destinationCount: 0,
      categories: plan.categories.map((category) => ({
        category,
        destinationsWithRecords: 0,
        destinationCoveragePct: 0,
        totalRecords: 0,
      })),
      overall: {
        destinationsFullyPopulated: 0,
        destinationsFullyPopulatedPct: 0,
        recordsTotal: 0,
        readyForApply: false,
      },
      blockers: ["input file missing"],
    };
  }

  const data = readJson(plan.inputPath);
  const destinations = Array.isArray(data.destinations) ? data.destinations : [];
  const destinationCount = destinations.length;

  const categorySummaries = plan.categories.map((category) => {
    let destinationsWithRecords = 0;
    let totalRecords = 0;

    for (const destination of destinations) {
      const records = Array.isArray(destination[category]) ? destination[category] : [];
      if (records.length > 0) {
        destinationsWithRecords += 1;
      }
      totalRecords += records.length;
    }

    return {
      category,
      destinationsWithRecords,
      destinationCoveragePct: pct(destinationsWithRecords, destinationCount),
      totalRecords,
    };
  });

  let destinationsFullyPopulated = 0;
  const blockers = [];

  for (const destination of destinations) {
    const missing = plan.categories.filter((category) => {
      const records = Array.isArray(destination[category]) ? destination[category] : [];
      return records.length === 0;
    });

    if (missing.length === 0) {
      destinationsFullyPopulated += 1;
    }

    if (missing.length > 0 && blockers.length < 10) {
      blockers.push(`${destination.slug}: missing ${missing.join(", ")}`);
    }
  }

  const recordsTotal = categorySummaries.reduce((sum, category) => sum + category.totalRecords, 0);
  const readyForApply = destinationCount > 0 && destinationsFullyPopulated === destinationCount;

  return {
    name: plan.name,
    inputFile: relativePath,
    exists: true,
    destinationCount,
    categories: categorySummaries,
    overall: {
      destinationsFullyPopulated,
      destinationsFullyPopulatedPct: pct(destinationsFullyPopulated, destinationCount),
      recordsTotal,
      readyForApply,
    },
    blockers,
  };
}

function main() {
  const planSummaries = plans.map(summarizePlan);
  const readyPlans = planSummaries.filter((plan) => plan.overall?.readyForApply).map((plan) => plan.name);

  const report = {
    generatedAt: new Date().toISOString(),
    wave: "TIER_1",
    plans: planSummaries,
    summary: {
      totalPlans: planSummaries.length,
      readyPlansCount: readyPlans.length,
      readyPlans,
      blockedPlansCount: planSummaries.length - readyPlans.length,
    },
  };

  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`Wrote Wave 1 input completeness report: ${path.relative(repoRoot, outputPath)}`);
}

main();
