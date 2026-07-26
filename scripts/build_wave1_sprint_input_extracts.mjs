import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const sprintsPath = path.join(repoRoot, "docs/destination-expansion-wave1-research-sprints.json");
const outputDir = path.join(repoRoot, "docs/wave1-sprint-inputs");

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

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function buildDestinationSubset(destination, categories) {
  const base = {
    slug: destination.slug,
    city: destination.city,
    country: destination.country,
    additionGroup: destination.additionGroup,
    sourceNotes: destination.sourceNotes || "",
  };

  for (const category of categories) {
    base[category] = Array.isArray(destination[category]) ? destination[category] : [];
  }

  return base;
}

function main() {
  const sprintsDoc = readJson(sprintsPath);
  const sprints = Array.isArray(sprintsDoc.sprints) ? sprintsDoc.sprints : [];

  ensureDir(outputDir);

  for (const planConfig of planConfigs) {
    if (!fs.existsSync(planConfig.inputPath)) {
      throw new Error(`Missing canonical input file: ${planConfig.inputPath}`);
    }
  }

  const planInputs = Object.fromEntries(
    planConfigs.map((planConfig) => [
      planConfig.plan,
      readJson(planConfig.inputPath),
    ]),
  );

  let writtenFiles = 0;

  for (const sprint of sprints) {
    const sprintName = sprint.sprint;
    const sprintDir = path.join(outputDir, sprintName);
    ensureDir(sprintDir);

    const sprintSlugs = new Set(Array.isArray(sprint.destinations) ? sprint.destinations : []);

    for (const planConfig of planConfigs) {
      const inputDoc = planInputs[planConfig.plan];
      const destinations = Array.isArray(inputDoc.destinations) ? inputDoc.destinations : [];

      const extractedDestinations = destinations
        .filter((destination) => sprintSlugs.has(destination.slug))
        .map((destination) => buildDestinationSubset(destination, planConfig.categories));

      const outputDoc = {
        generatedAt: new Date().toISOString(),
        sprint: sprintName,
        plan: planConfig.plan,
        inputSource: path.relative(repoRoot, planConfig.inputPath),
        categories: planConfig.categories,
        destinationCount: extractedDestinations.length,
        destinations: extractedDestinations,
      };

      const outPath = path.join(sprintDir, `${planConfig.plan}.json`);
      fs.writeFileSync(outPath, `${JSON.stringify(outputDoc, null, 2)}\n`, "utf8");
      writtenFiles += 1;
    }
  }

  console.log(`Wrote Wave 1 sprint input extracts to ${path.relative(repoRoot, outputDir)} (${writtenFiles} files).`);
}

main();
