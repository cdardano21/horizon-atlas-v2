import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const args = process.argv.slice(2);

const sprintArg = args.find((arg) => arg.startsWith("--sprint="));
const sprintName = sprintArg ? sprintArg.split("=")[1] : "SPRINT_1";

const sprintDir = path.join(repoRoot, "docs", "wave1-sprint-inputs", sprintName);
const reportPath = path.join(
  repoRoot,
  "docs",
  "destination-expansion-wave1-sprint-template-apply-report.json",
);

const planConfigs = [
  { plan: "monthlyClimate", categories: ["monthlyClimate"] },
  { plan: "costHousing", categories: ["costOfLiving", "housingMetrics"] },
  { plan: "healthAirports", categories: ["healthcareFacilities", "airports"] },
  { plan: "visaTax", categories: ["visaPrograms", "taxRules"] },
  { plan: "practicalInfo", categories: ["practicalInfo"] },
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, payload) {
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isEmptyVerification(verification) {
  if (!verification || typeof verification !== "object") return true;
  return ![
    verification.sourceUrl,
    verification.sourceOrganization,
    verification.sourceType,
    verification.confidenceLevel,
    verification.verificationStatus,
    verification.lastVerifiedAt,
  ].some(hasText);
}

function isPlaceholderMonthlyClimate(record) {
  const metricKeys = [
    "avgHighC",
    "avgLowC",
    "rainfallMm",
    "rainyDays",
    "humidityPct",
    "sunshineHours",
    "uvIndex",
    "seaTempC",
    "snowfallCm",
    "windKph",
  ];

  const hasMetric = metricKeys.some((key) => record[key] !== null && record[key] !== undefined && record[key] !== "");
  return !hasMetric && isEmptyVerification(record.verification);
}

function isPlaceholderCommandMetric(record) {
  const hasCore = [record.key, record.label, record.value, record.displayValue].some((value) => {
    if (typeof value === "number") return true;
    return hasText(value);
  });
  return !hasCore && isEmptyVerification(record.verification);
}

function isPlaceholderNamedRecord(record) {
  const hasCore = [
    record.id,
    record.name,
    record.subtitle,
    record.value1,
    record.value2,
    record.value3,
    record.url,
    record.mapQuery,
  ].some(hasText);

  const hasZoom = typeof record.mapZoom === "number";
  return !hasCore && !hasZoom && isEmptyVerification(record.verification);
}

function nonPlaceholderRows(category, rows) {
  if (!Array.isArray(rows)) return [];

  return rows.filter((record) => {
    if (category === "monthlyClimate") return !isPlaceholderMonthlyClimate(record);
    if (category === "costOfLiving" || category === "housingMetrics") return !isPlaceholderCommandMetric(record);
    return !isPlaceholderNamedRecord(record);
  });
}

function mergePlanTemplate(planConfig, report) {
  const planPath = path.join(sprintDir, `${planConfig.plan}.json`);
  const templatePath = path.join(sprintDir, `${planConfig.plan}.fill-template.json`);

  if (!fs.existsSync(planPath)) {
    report.entries.push({
      sprint: sprintName,
      plan: planConfig.plan,
      status: "skipped",
      reason: "missing base plan file",
    });
    return;
  }

  if (!fs.existsSync(templatePath)) {
    report.entries.push({
      sprint: sprintName,
      plan: planConfig.plan,
      status: "skipped",
      reason: "missing fill-template file",
    });
    return;
  }

  const planDoc = readJson(planPath);
  const templateDoc = readJson(templatePath);

  const planDestinations = Array.isArray(planDoc.destinations) ? planDoc.destinations : [];
  const templateDestinations = Array.isArray(templateDoc.destinations) ? templateDoc.destinations : [];

  const templateBySlug = new Map(templateDestinations.map((item) => [item.slug, item]));

  let destinationUpdates = 0;
  let categoryUpdates = 0;
  const categoryCounts = {};

  for (const category of planConfig.categories) {
    categoryCounts[category] = 0;
  }

  for (const destination of planDestinations) {
    const templateDestination = templateBySlug.get(destination.slug);
    if (!templateDestination) continue;

    let updated = false;

    if (hasText(templateDestination.sourceNotes) && templateDestination.sourceNotes !== destination.sourceNotes) {
      destination.sourceNotes = templateDestination.sourceNotes;
      updated = true;
    }

    for (const category of planConfig.categories) {
      const candidateRows = nonPlaceholderRows(category, templateDestination[category]);
      if (candidateRows.length === 0) {
        continue;
      }

      const previousJson = JSON.stringify(destination[category] || []);
      const nextJson = JSON.stringify(candidateRows);

      if (previousJson !== nextJson) {
        destination[category] = candidateRows;
        categoryUpdates += 1;
        categoryCounts[category] += 1;
        updated = true;
      }
    }

    if (updated) {
      destinationUpdates += 1;
    }
  }

  writeJson(planPath, planDoc);

  report.entries.push({
    sprint: sprintName,
    plan: planConfig.plan,
    status: "applied",
    destinationUpdates,
    categoryUpdates,
    byCategory: categoryCounts,
    baseFile: path.relative(repoRoot, planPath),
    templateFile: path.relative(repoRoot, templatePath),
  });

  report.totals.destinationUpdates += destinationUpdates;
  report.totals.categoryUpdates += categoryUpdates;
}

function main() {
  if (!fs.existsSync(sprintDir)) {
    throw new Error(`Missing sprint directory: ${path.relative(repoRoot, sprintDir)}`);
  }

  const report = {
    generatedAt: new Date().toISOString(),
    sprint: sprintName,
    entries: [],
    totals: {
      plansProcessed: 0,
      destinationUpdates: 0,
      categoryUpdates: 0,
    },
  };

  for (const planConfig of planConfigs) {
    mergePlanTemplate(planConfig, report);
    report.totals.plansProcessed += 1;
  }

  writeJson(reportPath, report);

  console.log(`Wrote sprint template apply report: ${path.relative(repoRoot, reportPath)}`);
  console.log(
    `Plans processed: ${report.totals.plansProcessed}, destination updates: ${report.totals.destinationUpdates}, category updates: ${report.totals.categoryUpdates}`,
  );
}

main();
