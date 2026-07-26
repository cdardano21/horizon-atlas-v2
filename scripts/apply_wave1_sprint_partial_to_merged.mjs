import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const extractsRoot = path.join(repoRoot, "docs/wave1-sprint-inputs");
const mergedPath = path.join(repoRoot, "supabase/generated-command-center-seeds-merged.json");
const reportPath = path.join(repoRoot, "docs/destination-expansion-wave1-sprint-partial-apply-report.json");

const args = process.argv.slice(2);
const sprintArg = args.find((arg) => arg.startsWith("--sprint="));
const sprintFilter = sprintArg ? sprintArg.split("=")[1] : null;

const sprintPlanFiles = new Set([
  "monthlyClimate.json",
  "costHousing.json",
  "healthAirports.json",
  "visaTax.json",
  "practicalInfo.json",
]);

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

const allowedConfidence = ["low", "medium", "high"];
const allowedVerificationStatus = ["estimated", "verified", "stale", "in_progress"];
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

function isIsoDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function validateVerification(verification, context, issues) {
  if (!verification || typeof verification !== "object") {
    issues.push(`${context}: missing verification object.`);
    return;
  }
  if (!verification.sourceUrl || typeof verification.sourceUrl !== "string") {
    issues.push(`${context}: missing verification.sourceUrl.`);
  }
  if (!verification.sourceOrganization || typeof verification.sourceOrganization !== "string") {
    issues.push(`${context}: missing verification.sourceOrganization.`);
  }
  if (!verification.sourceType || typeof verification.sourceType !== "string") {
    issues.push(`${context}: missing verification.sourceType.`);
  }
  if (!allowedConfidence.includes(verification.confidenceLevel)) {
    issues.push(`${context}: invalid verification.confidenceLevel.`);
  }
  if (!allowedVerificationStatus.includes(verification.verificationStatus)) {
    issues.push(`${context}: invalid verification.verificationStatus.`);
  }
  if (!isIsoDate(verification.lastVerifiedAt)) {
    issues.push(`${context}: invalid verification.lastVerifiedAt.`);
  }
}

function validateMonthlyClimate(records, context, issues) {
  const seenMonths = new Set();
  records.forEach((record, index) => {
    const rowContext = `${context}[${index}]`;
    if (!monthOrder.includes(record.month)) {
      issues.push(`${rowContext}: invalid month.`);
    }
    if (seenMonths.has(record.month)) {
      issues.push(`${rowContext}: duplicate month '${record.month}'.`);
    }
    seenMonths.add(record.month);

    const hasMetric = [
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
    ].some((key) => record[key] !== null && record[key] !== undefined);

    if (!hasMetric) {
      issues.push(`${rowContext}: missing climate metric values.`);
    }

    validateVerification(record.verification, rowContext, issues);
  });
}

function validateCommandMetrics(records, context, issues) {
  const seenKeys = new Set();
  records.forEach((record, index) => {
    const rowContext = `${context}[${index}]`;
    if (!record.key || typeof record.key !== "string") {
      issues.push(`${rowContext}: missing key.`);
    }
    if (!record.label || typeof record.label !== "string") {
      issues.push(`${rowContext}: missing label.`);
    }
    if (record.value === undefined || record.value === null || record.value === "") {
      issues.push(`${rowContext}: missing value.`);
    }
    if (!record.displayValue || typeof record.displayValue !== "string") {
      issues.push(`${rowContext}: missing displayValue.`);
    }

    const key = String(record.key || "").trim().toLowerCase();
    if (key) {
      if (seenKeys.has(key)) {
        issues.push(`${rowContext}: duplicate key '${record.key}'.`);
      }
      seenKeys.add(key);
    }

    validateVerification(record.verification, rowContext, issues);
  });
}

function validateNamedRecords(records, context, issues) {
  const seenIds = new Set();
  records.forEach((record, index) => {
    const rowContext = `${context}[${index}]`;
    if (!record.id || typeof record.id !== "string") {
      issues.push(`${rowContext}: missing id.`);
    }
    if (!record.name || typeof record.name !== "string") {
      issues.push(`${rowContext}: missing name.`);
    }

    const hasDescriptor = [record.subtitle, record.value1, record.value2, record.value3].some(
      (value) => typeof value === "string" && value.trim().length > 0,
    );
    if (!hasDescriptor) {
      issues.push(`${rowContext}: missing descriptive values.`);
    }

    const id = String(record.id || "").trim().toLowerCase();
    if (id) {
      if (seenIds.has(id)) {
        issues.push(`${rowContext}: duplicate id '${record.id}'.`);
      }
      seenIds.add(id);
    }

    validateVerification(record.verification, rowContext, issues);
  });
}

function validateRecords(kind, records, context) {
  const issues = [];
  if (!Array.isArray(records) || records.length === 0) {
    return issues;
  }

  if (kind === "monthlyClimate") {
    validateMonthlyClimate(records, context, issues);
    return issues;
  }
  if (kind === "commandMetric") {
    validateCommandMetrics(records, context, issues);
    return issues;
  }
  validateNamedRecords(records, context, issues);
  return issues;
}

function listSprintDirs() {
  if (!fs.existsSync(extractsRoot)) return [];
  return fs
    .readdirSync(extractsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !sprintFilter || name === sprintFilter)
    .sort();
}

function main() {
  const merged = readJson(mergedPath);
  const sprintDirs = listSprintDirs();

  const report = {
    generatedAt: new Date().toISOString(),
    sprintFilter: sprintFilter || null,
    processedSprints: sprintDirs,
    updates: [],
    validationErrors: [],
    bySprint: {},
    byCategory: {},
    totals: {
      sprintCount: sprintDirs.length,
      destinationCategoryUpdates: 0,
      skippedEmptyArrays: 0,
      validationErrorCount: 0,
    },
  };

  for (const sprintName of sprintDirs) {
    report.bySprint[sprintName] = {
      updates: 0,
      skippedEmptyArrays: 0,
      validationErrors: 0,
    };

    const sprintPath = path.join(extractsRoot, sprintName);
    const files = fs
      .readdirSync(sprintPath)
      .filter((name) => sprintPlanFiles.has(name))
      .sort();

    for (const fileName of files) {
      const filePath = path.join(sprintPath, fileName);
      const extractDoc = readJson(filePath);
      const destinations = Array.isArray(extractDoc.destinations) ? extractDoc.destinations : [];
      const categories = Array.isArray(extractDoc.categories) ? extractDoc.categories : [];

      for (const destination of destinations) {
        const slug = destination.slug;
        if (!merged[slug]) {
          merged[slug] = {};
        }

        for (const category of categories) {
          if (!report.byCategory[category]) {
            report.byCategory[category] = {
              updates: 0,
              skippedEmptyArrays: 0,
              validationErrors: 0,
            };
          }

          const records = destination[category];
          if (!Array.isArray(records) || records.length === 0) {
            report.totals.skippedEmptyArrays += 1;
            report.bySprint[sprintName].skippedEmptyArrays += 1;
            report.byCategory[category].skippedEmptyArrays += 1;
            continue;
          }

          const kind = categoryKinds[category];
          if (!kind) {
            report.validationErrors.push(`${sprintName}/${fileName}:${slug}.${category} unknown category kind.`);
            report.bySprint[sprintName].validationErrors += 1;
            report.byCategory[category].validationErrors += 1;
            continue;
          }

          const issues = validateRecords(kind, records, `${sprintName}/${fileName}:${slug}.${category}`);
          if (issues.length > 0) {
            report.validationErrors.push(...issues);
            report.bySprint[sprintName].validationErrors += issues.length;
            report.byCategory[category].validationErrors += issues.length;
            continue;
          }

          const previousJson = JSON.stringify(merged[slug][category] || []);
          const nextJson = JSON.stringify(records);
          if (previousJson !== nextJson) {
            merged[slug][category] = records;
            report.updates.push({
              sprint: sprintName,
              file: fileName,
              slug,
              category,
              recordCount: records.length,
            });
            report.totals.destinationCategoryUpdates += 1;
            report.bySprint[sprintName].updates += 1;
            report.byCategory[category].updates += 1;
          }
        }
      }
    }
  }

  report.totals.validationErrorCount = report.validationErrors.length;

  fs.writeFileSync(mergedPath, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(`Wrote Wave 1 sprint partial apply report: ${path.relative(repoRoot, reportPath)}`);
  console.log(
    `Sprints: ${report.totals.sprintCount}, updates: ${report.totals.destinationCategoryUpdates}, validation errors: ${report.totals.validationErrorCount}`,
  );
}

main();
