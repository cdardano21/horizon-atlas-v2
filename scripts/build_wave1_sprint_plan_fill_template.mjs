import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const args = process.argv.slice(2);

const sprintArg = args.find((arg) => arg.startsWith("--sprint="));
const planArg = args.find((arg) => arg.startsWith("--plan="));

const sprintName = sprintArg ? sprintArg.split("=")[1] : "SPRINT_1";
const planName = planArg ? planArg.split("=")[1] : "monthlyClimate";

const extractPath = path.join(repoRoot, "docs", "wave1-sprint-inputs", sprintName, `${planName}.json`);
const outputPath = path.join(repoRoot, "docs", "wave1-sprint-inputs", sprintName, `${planName}.fill-template.json`);

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

const categoryKinds = {
  monthlyClimate: "monthlyClimate",
  costOfLiving: "commandMetric",
  housingMetrics: "commandMetric",
  healthcareFacilities: "namedRecord",
  airports: "namedRecord",
  visaPrograms: "namedRecord",
  taxRules: "namedRecord",
  practicalInfo: "namedRecord",
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function emptyVerification() {
  return {
    sourceUrl: "",
    sourceOrganization: "",
    sourceType: "",
    confidenceLevel: "",
    verificationStatus: "",
    lastVerifiedAt: "",
  };
}

function createMonthlyClimateRows() {
  return monthOrder.map((month) => ({
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
    verification: emptyVerification(),
  }));
}

function createCommandMetricRows() {
  return [
    {
      key: "",
      label: "",
      value: "",
      unit: "",
      displayValue: "",
      verification: emptyVerification(),
    },
  ];
}

function createNamedRecordRows() {
  return [
    {
      id: "",
      name: "",
      subtitle: "",
      value1: "",
      value2: "",
      value3: "",
      url: "",
      mapQuery: "",
      mapZoom: null,
      verification: emptyVerification(),
    },
  ];
}

function templateRowsForCategory(category) {
  const kind = categoryKinds[category];
  if (!kind) {
    throw new Error(`Unsupported category '${category}' in template generator.`);
  }
  if (kind === "monthlyClimate") {
    return createMonthlyClimateRows();
  }
  if (kind === "commandMetric") {
    return createCommandMetricRows();
  }
  return createNamedRecordRows();
}

function main() {
  if (!fs.existsSync(extractPath)) {
    throw new Error(`Missing sprint extract: ${path.relative(repoRoot, extractPath)}`);
  }

  const extractDoc = readJson(extractPath);
  const categories = Array.isArray(extractDoc.categories) ? extractDoc.categories : [];
  const destinations = Array.isArray(extractDoc.destinations) ? extractDoc.destinations : [];

  const template = {
    generatedAt: new Date().toISOString(),
    sprint: sprintName,
    plan: planName,
    intent: "fill-template",
    notes: [
      "Template rows are placeholders only. Replace values with sourced data before merge/apply.",
      "Use additional rows where needed; keep unique keys/ids per destination-category.",
      "Allowed confidenceLevel: low|medium|high.",
      "Allowed verificationStatus: estimated|verified|stale|in_progress.",
      "lastVerifiedAt must be YYYY-MM-DD.",
    ],
    targetWorkflow: [
      "1. Fill this template with sourced values.",
      `2. Copy category arrays into ${planName}.json for the same sprint.`,
      "3. Run npm run expansion:wave1:sprintMerge.",
      "4. Run npm run expansion:wave1:sprintPartialApply.",
      "5. Run npm run expansion:wave1:preflightStrict.",
    ],
    destinationCount: destinations.length,
    categories,
    destinations: destinations.map((destination) => {
      const row = {
        slug: destination.slug,
        city: destination.city,
        country: destination.country,
        additionGroup: destination.additionGroup,
        sourceNotes: destination.sourceNotes || "",
      };

      for (const category of categories) {
        row[category] = templateRowsForCategory(category);
      }

      return row;
    }),
  };

  fs.writeFileSync(outputPath, `${JSON.stringify(template, null, 2)}\n`, "utf8");
  console.log(`Wrote sprint plan fill template: ${path.relative(repoRoot, outputPath)}`);
}

main();
