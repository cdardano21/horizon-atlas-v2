import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const args = process.argv.slice(2);

const sprintArg = args.find((arg) => arg.startsWith("--sprint="));
const sprintName = sprintArg ? sprintArg.split("=")[1] : "SPRINT_1";

const extractPath = path.join(repoRoot, "docs", "wave1-sprint-inputs", sprintName, "monthlyClimate.json");
const outputPath = path.join(repoRoot, "docs", "wave1-sprint-inputs", sprintName, "monthlyClimate.fill-template.json");

const monthOrder = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function createMonthRow(month) {
  return {
    month,
    avgHighC: null,
    avgLowC: null,
    rainfallMm: null,
    rainyDays: null,
    humidityPct: null,
    sunshineHours: null,
    uvIndex: null,
    seaTempC: null,
    snowfallCm: null,
    windKph: null,
    verification: {
      sourceUrl: "",
      sourceOrganization: "",
      sourceType: "",
      confidenceLevel: "",
      verificationStatus: "",
      lastVerifiedAt: "",
    },
  };
}

function main() {
  if (!fs.existsSync(extractPath)) {
    throw new Error(`Missing sprint extract: ${path.relative(repoRoot, extractPath)}`);
  }

  const extractDoc = readJson(extractPath);
  const destinations = Array.isArray(extractDoc.destinations) ? extractDoc.destinations : [];

  const template = {
    generatedAt: new Date().toISOString(),
    sprint: sprintName,
    plan: "monthlyClimate",
    intent: "fill-template",
    notes: [
      "Template rows are placeholders only. Replace values with sourced data before merge/apply.",
      "Each destination should keep all 12 months in order.",
      "Allowed confidenceLevel: low|medium|high.",
      "Allowed verificationStatus: estimated|verified|stale|in_progress.",
      "lastVerifiedAt must be YYYY-MM-DD.",
    ],
    targetWorkflow: [
      "1. Fill this template with sourced values.",
      "2. Copy monthlyClimate arrays into monthlyClimate.json for the same sprint.",
      "3. Run npm run expansion:wave1:sprintMerge.",
      "4. Run npm run expansion:wave1:sprintPartialApply.",
      "5. Run npm run expansion:wave1:preflightStrict.",
    ],
    destinationCount: destinations.length,
    destinations: destinations.map((destination) => ({
      slug: destination.slug,
      city: destination.city,
      country: destination.country,
      additionGroup: destination.additionGroup,
      sourceNotes: destination.sourceNotes || "",
      monthlyClimate: monthOrder.map(createMonthRow),
    })),
  };

  fs.writeFileSync(outputPath, `${JSON.stringify(template, null, 2)}\n`, "utf8");

  console.log(`Wrote monthly climate fill template: ${path.relative(repoRoot, outputPath)}`);
}

main();
