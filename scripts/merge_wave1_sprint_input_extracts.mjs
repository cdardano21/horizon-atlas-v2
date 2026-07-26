import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const sprintsPath = path.join(repoRoot, "docs/destination-expansion-wave1-research-sprints.json");
const extractsDir = path.join(repoRoot, "docs/wave1-sprint-inputs");
const reportPath = path.join(repoRoot, "docs/destination-expansion-wave1-sprint-merge-report.json");

const planConfigs = [
  {
    plan: "monthlyClimate",
    inputPath: path.join(repoRoot, "docs/destination-expansion-wave1-monthly-climate-input.json"),
    categories: ["monthlyClimate"],
  },
  {
    plan: "costHousing",
    inputPath: path.join(repoRoot, "docs/destination-expansion-wave1-cost-housing-input.json"),
    categories: ["costOfLiving", "housingMetrics"],
  },
  {
    plan: "healthAirports",
    inputPath: path.join(repoRoot, "docs/destination-expansion-wave1-health-airports-input.json"),
    categories: ["healthcareFacilities", "airports"],
  },
  {
    plan: "visaTax",
    inputPath: path.join(repoRoot, "docs/destination-expansion-wave1-visa-tax-input.json"),
    categories: ["visaPrograms", "taxRules"],
  },
  {
    plan: "practicalInfo",
    inputPath: path.join(repoRoot, "docs/destination-expansion-wave1-practical-info-input.json"),
    categories: ["practicalInfo"],
  },
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function maybeMergeArray(target, sourceArray) {
  if (!Array.isArray(sourceArray) || sourceArray.length === 0) {
    return { changed: false, value: target };
  }

  const targetJson = JSON.stringify(target ?? []);
  const sourceJson = JSON.stringify(sourceArray);
  if (targetJson === sourceJson) {
    return { changed: false, value: target };
  }

  return { changed: true, value: sourceArray };
}

function main() {
  const sprintsDoc = readJson(sprintsPath);
  const sprints = Array.isArray(sprintsDoc.sprints) ? sprintsDoc.sprints : [];
  const sprintSlugMap = new Map(
    sprints.map((sprint) => [
      sprint.sprint,
      new Set(Array.isArray(sprint.destinations) ? sprint.destinations : []),
    ]),
  );

  const report = {
    generatedAt: new Date().toISOString(),
    extractsDir: path.relative(repoRoot, extractsDir),
    planResults: [],
    totals: {
      plansProcessed: 0,
      destinationUpdates: 0,
      categoryUpdates: 0,
      skippedEmptyCategoryPayloads: 0,
    },
  };

  for (const planConfig of planConfigs) {
    const canonical = readJson(planConfig.inputPath);
    const canonicalDestinations = Array.isArray(canonical.destinations) ? canonical.destinations : [];
    const canonicalBySlug = new Map(canonicalDestinations.map((destination) => [destination.slug, destination]));

    let planDestinationUpdates = 0;
    let planCategoryUpdates = 0;
    let planSkippedEmpty = 0;
    const planWarnings = [];

    for (const sprint of sprints) {
      const sprintName = sprint.sprint;
      const sprintPlanPath = path.join(extractsDir, sprintName, `${planConfig.plan}.json`);
      if (!fs.existsSync(sprintPlanPath)) {
        continue;
      }

      const sprintInput = readJson(sprintPlanPath);
      const destinations = Array.isArray(sprintInput.destinations) ? sprintInput.destinations : [];
      const allowedSlugs = sprintSlugMap.get(sprintName) || new Set();

      for (const incoming of destinations) {
        if (!allowedSlugs.has(incoming.slug)) {
          planWarnings.push(`${sprintName}: unexpected slug '${incoming.slug}' for plan '${planConfig.plan}'.`);
          continue;
        }

        const target = canonicalBySlug.get(incoming.slug);
        if (!target) {
          planWarnings.push(`${sprintName}: slug '${incoming.slug}' not found in canonical input.`);
          continue;
        }

        let destinationChanged = false;

        if (typeof incoming.sourceNotes === "string" && incoming.sourceNotes.trim().length > 0 && incoming.sourceNotes !== target.sourceNotes) {
          target.sourceNotes = incoming.sourceNotes;
          destinationChanged = true;
        }

        for (const category of planConfig.categories) {
          const merged = maybeMergeArray(target[category], incoming[category]);
          if (!Array.isArray(incoming[category]) || incoming[category].length === 0) {
            planSkippedEmpty += 1;
            continue;
          }
          if (merged.changed) {
            target[category] = merged.value;
            planCategoryUpdates += 1;
            destinationChanged = true;
          }
        }

        if (destinationChanged) {
          planDestinationUpdates += 1;
        }
      }
    }

    fs.writeFileSync(planConfig.inputPath, `${JSON.stringify(canonical, null, 2)}\n`, "utf8");

    report.planResults.push({
      plan: planConfig.plan,
      inputFile: path.relative(repoRoot, planConfig.inputPath),
      destinationUpdates: planDestinationUpdates,
      categoryUpdates: planCategoryUpdates,
      skippedEmptyCategoryPayloads: planSkippedEmpty,
      warnings: planWarnings,
    });

    report.totals.plansProcessed += 1;
    report.totals.destinationUpdates += planDestinationUpdates;
    report.totals.categoryUpdates += planCategoryUpdates;
    report.totals.skippedEmptyCategoryPayloads += planSkippedEmpty;
  }

  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`Wrote Wave 1 sprint merge report: ${path.relative(repoRoot, reportPath)}`);
  console.log(
    `Plan updates: ${report.totals.plansProcessed}, destination updates: ${report.totals.destinationUpdates}, category updates: ${report.totals.categoryUpdates}`,
  );
}

main();
