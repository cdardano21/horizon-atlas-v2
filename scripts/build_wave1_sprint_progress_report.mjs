import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const sprintsPath = path.join(repoRoot, "docs/destination-expansion-wave1-research-sprints.json");
const extractsDir = path.join(repoRoot, "docs/wave1-sprint-inputs");
const outputPath = path.join(repoRoot, "docs/destination-expansion-wave1-sprint-progress.json");

const planConfigs = [
  {
    plan: "monthlyClimate",
    categories: ["monthlyClimate"],
  },
  {
    plan: "costHousing",
    categories: ["costOfLiving", "housingMetrics"],
  },
  {
    plan: "healthAirports",
    categories: ["healthcareFacilities", "airports"],
  },
  {
    plan: "visaTax",
    categories: ["visaPrograms", "taxRules"],
  },
  {
    plan: "practicalInfo",
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

function summarizeExtract(extractDoc, categories) {
  const destinations = Array.isArray(extractDoc.destinations) ? extractDoc.destinations : [];
  const destinationCount = destinations.length;

  const byCategory = categories.map((category) => {
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
      destinationCount,
      coveragePct: pct(destinationsWithRecords, destinationCount),
      totalRecords,
    };
  });

  let fullyCompleteDestinations = 0;
  for (const destination of destinations) {
    const done = categories.every((category) => {
      const records = Array.isArray(destination[category]) ? destination[category] : [];
      return records.length > 0;
    });
    if (done) {
      fullyCompleteDestinations += 1;
    }
  }

  return {
    destinationCount,
    byCategory,
    fullyCompleteDestinations,
    fullyCompletePct: pct(fullyCompleteDestinations, destinationCount),
  };
}

function main() {
  const sprintsDoc = readJson(sprintsPath);
  const sprints = Array.isArray(sprintsDoc.sprints) ? sprintsDoc.sprints : [];

  const sprintResults = [];
  let totalDestinationSlots = 0;
  let totalCompleteDestinations = 0;

  for (const sprint of sprints) {
    const sprintName = sprint.sprint;
    const sprintDir = path.join(extractsDir, sprintName);

    const planSummaries = [];
    let sprintDestinationCount = 0;
    let sprintCompleteCategoryChecks = 0;
    let sprintTotalCategoryChecks = 0;

    for (const planConfig of planConfigs) {
      const extractPath = path.join(sprintDir, `${planConfig.plan}.json`);
      if (!fs.existsSync(extractPath)) {
        planSummaries.push({
          plan: planConfig.plan,
          missingExtract: true,
        });
        continue;
      }

      const extractDoc = readJson(extractPath);
      const summary = summarizeExtract(extractDoc, planConfig.categories);

      if (sprintDestinationCount === 0) {
        sprintDestinationCount = summary.destinationCount;
      }

      for (const categorySummary of summary.byCategory) {
        sprintCompleteCategoryChecks += categorySummary.destinationsWithRecords;
        sprintTotalCategoryChecks += categorySummary.destinationCount;
      }

      planSummaries.push({
        plan: planConfig.plan,
        missingExtract: false,
        ...summary,
      });
    }

    totalDestinationSlots += sprintDestinationCount;

    const sprintFullyComplete = planSummaries
      .filter((plan) => !plan.missingExtract)
      .reduce((minValue, plan) => {
        if (minValue === null) {
          return plan.fullyCompleteDestinations;
        }
        return Math.min(minValue, plan.fullyCompleteDestinations);
      }, null);

    const sprintFullyCompleteSafe = sprintFullyComplete ?? 0;
    totalCompleteDestinations += sprintFullyCompleteSafe;

    sprintResults.push({
      sprint: sprintName,
      destinationCount: sprintDestinationCount,
      categoryCoveragePct: pct(sprintCompleteCategoryChecks, sprintTotalCategoryChecks),
      fullyCompleteDestinations: sprintFullyCompleteSafe,
      fullyCompletePct: pct(sprintFullyCompleteSafe, sprintDestinationCount),
      plans: planSummaries,
    });
  }

  const report = {
    generatedAt: new Date().toISOString(),
    extractsDir: path.relative(repoRoot, extractsDir),
    sprintCount: sprintResults.length,
    sprints: sprintResults,
    overall: {
      destinationCount: totalDestinationSlots,
      fullyCompleteDestinations: totalCompleteDestinations,
      fullyCompletePct: pct(totalCompleteDestinations, totalDestinationSlots),
      nextSuggestedSprint:
        sprintResults.find((sprint) => sprint.fullyCompleteDestinations < sprint.destinationCount)?.sprint || null,
    },
  };

  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`Wrote Wave 1 sprint progress report: ${path.relative(repoRoot, outputPath)}`);
}

main();
