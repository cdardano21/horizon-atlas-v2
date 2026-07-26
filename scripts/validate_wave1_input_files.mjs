import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const outputPath = path.join(repoRoot, "docs/destination-expansion-wave1-input-validation.json");

const inputPlans = [
  {
    name: "monthlyClimate",
    path: path.join(repoRoot, "docs/destination-expansion-wave1-monthly-climate-input.json"),
    categories: ["monthlyClimate"],
  },
  {
    name: "costHousing",
    path: path.join(repoRoot, "docs/destination-expansion-wave1-cost-housing-input.json"),
    categories: ["costOfLiving", "housingMetrics"],
  },
  {
    name: "healthAirports",
    path: path.join(repoRoot, "docs/destination-expansion-wave1-health-airports-input.json"),
    categories: ["healthcareFacilities", "airports"],
  },
  {
    name: "visaTax",
    path: path.join(repoRoot, "docs/destination-expansion-wave1-visa-tax-input.json"),
    categories: ["visaPrograms", "taxRules"],
  },
  {
    name: "practicalInfo",
    path: path.join(repoRoot, "docs/destination-expansion-wave1-practical-info-input.json"),
    categories: ["practicalInfo"],
  },
];

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

const allowedConfidence = ["low", "medium", "high"];
const allowedVerificationStatus = ["estimated", "verified", "stale", "in_progress"];
const args = new Set(process.argv.slice(2));
const strictMode = args.has("--require-populated");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function isIsoDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function assertVerification(verification, issuePrefix, issues) {
  if (!verification || typeof verification !== "object") {
    issues.push(`${issuePrefix}: missing verification object.`);
    return;
  }
  if (!verification.sourceUrl || typeof verification.sourceUrl !== "string") {
    issues.push(`${issuePrefix}: missing verification.sourceUrl.`);
  }
  if (!verification.sourceOrganization || typeof verification.sourceOrganization !== "string") {
    issues.push(`${issuePrefix}: missing verification.sourceOrganization.`);
  }
  if (!verification.sourceType || typeof verification.sourceType !== "string") {
    issues.push(`${issuePrefix}: missing verification.sourceType.`);
  }
  if (!allowedConfidence.includes(verification.confidenceLevel)) {
    issues.push(`${issuePrefix}: invalid verification.confidenceLevel.`);
  }
  if (!allowedVerificationStatus.includes(verification.verificationStatus)) {
    issues.push(`${issuePrefix}: invalid verification.verificationStatus.`);
  }
  if (!isIsoDate(verification.lastVerifiedAt)) {
    issues.push(`${issuePrefix}: invalid verification.lastVerifiedAt.`);
  }
}

function validateMonthlyClimate(records, issuePrefix, issues, options) {
  if (!Array.isArray(records)) {
    issues.push(`${issuePrefix}: records must be an array.`);
    return;
  }
  if (records.length === 0) {
    if (options.requirePopulated) {
      issues.push(`${issuePrefix}: no records present.`);
    }
    return;
  }

  const seenMonths = new Set();
  for (let i = 0; i < records.length; i += 1) {
    const record = records[i] || {};
    const recordPrefix = `${issuePrefix}[${i}]`;

    if (!monthOrder.includes(record.month)) {
      issues.push(`${recordPrefix}: invalid month.`);
    }
    if (seenMonths.has(record.month)) {
      issues.push(`${recordPrefix}: duplicate month '${record.month}'.`);
    }
    seenMonths.add(record.month);

    const climateKeys = [
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
    const hasAnyMetric = climateKeys.some((key) => record[key] !== null && record[key] !== undefined);
    if (!hasAnyMetric) {
      issues.push(`${recordPrefix}: no climate metric value found.`);
    }

    assertVerification(record.verification, recordPrefix, issues);
  }

  if (records.length > 0 && seenMonths.size !== records.length) {
    issues.push(`${issuePrefix}: duplicate month values detected.`);
  }
}

function validateCommandMetrics(records, issuePrefix, issues, options) {
  if (!Array.isArray(records)) {
    issues.push(`${issuePrefix}: records must be an array.`);
    return;
  }
  if (records.length === 0) {
    if (options.requirePopulated) {
      issues.push(`${issuePrefix}: no records present.`);
    }
    return;
  }

  const seenKeys = new Set();
  for (let i = 0; i < records.length; i += 1) {
    const record = records[i] || {};
    const recordPrefix = `${issuePrefix}[${i}]`;

    if (!record.key || typeof record.key !== "string") {
      issues.push(`${recordPrefix}: missing key.`);
    }
    if (!record.label || typeof record.label !== "string") {
      issues.push(`${recordPrefix}: missing label.`);
    }
    if (record.value === undefined || record.value === null || record.value === "") {
      issues.push(`${recordPrefix}: missing value.`);
    }
    if (!record.displayValue || typeof record.displayValue !== "string") {
      issues.push(`${recordPrefix}: missing displayValue.`);
    }

    const key = String(record.key || "").trim().toLowerCase();
    if (key) {
      if (seenKeys.has(key)) {
        issues.push(`${recordPrefix}: duplicate key '${record.key}'.`);
      }
      seenKeys.add(key);
    }

    assertVerification(record.verification, recordPrefix, issues);
  }
}

function validateNamedRecords(records, issuePrefix, issues, options) {
  if (!Array.isArray(records)) {
    issues.push(`${issuePrefix}: records must be an array.`);
    return;
  }
  if (records.length === 0) {
    if (options.requirePopulated) {
      issues.push(`${issuePrefix}: no records present.`);
    }
    return;
  }

  const seenIds = new Set();
  for (let i = 0; i < records.length; i += 1) {
    const record = records[i] || {};
    const recordPrefix = `${issuePrefix}[${i}]`;

    if (!record.id || typeof record.id !== "string") {
      issues.push(`${recordPrefix}: missing id.`);
    }
    if (!record.name || typeof record.name !== "string") {
      issues.push(`${recordPrefix}: missing name.`);
    }

    const hasAnyDescriptor = [record.subtitle, record.value1, record.value2, record.value3].some(
      (value) => typeof value === "string" && value.trim().length > 0,
    );
    if (!hasAnyDescriptor) {
      issues.push(`${recordPrefix}: missing descriptive values.`);
    }

    const id = String(record.id || "").trim().toLowerCase();
    if (id) {
      if (seenIds.has(id)) {
        issues.push(`${recordPrefix}: duplicate id '${record.id}'.`);
      }
      seenIds.add(id);
    }

    assertVerification(record.verification, recordPrefix, issues);
  }
}

function validateCategory(category, records, issuePrefix, issues, options) {
  if (category === "monthlyClimate") {
    validateMonthlyClimate(records, issuePrefix, issues, options);
    return;
  }

  if (category === "costOfLiving" || category === "housingMetrics") {
    validateCommandMetrics(records, issuePrefix, issues, options);
    return;
  }

  validateNamedRecords(records, issuePrefix, issues, options);
}

function validatePlan(plan, options) {
  const relativePath = path.relative(repoRoot, plan.path);
  if (!fs.existsSync(plan.path)) {
    return {
      name: plan.name,
      inputFile: relativePath,
      exists: false,
      destinationCount: 0,
      issues: ["input file missing"],
      issueCount: 1,
      hasBlockingErrors: true,
    };
  }

  const data = readJson(plan.path);
  const destinations = Array.isArray(data.destinations) ? data.destinations : [];
  const issues = [];

  if (destinations.length === 0) {
    issues.push("destinations array is empty");
  }

  const seenSlugs = new Set();
  for (let i = 0; i < destinations.length; i += 1) {
    const destination = destinations[i] || {};
    const slug = destination.slug;
    const prefix = `${plan.name}.destinations[${i}]`;

    if (!slug || typeof slug !== "string") {
      issues.push(`${prefix}: missing slug.`);
      continue;
    }

    if (seenSlugs.has(slug)) {
      issues.push(`${prefix}: duplicate slug '${slug}'.`);
    }
    seenSlugs.add(slug);

    for (const category of plan.categories) {
      const records = destination[category];
      validateCategory(category, records, `${slug}.${category}`, issues, options);
    }
  }

  return {
    name: plan.name,
    inputFile: relativePath,
    exists: true,
    destinationCount: destinations.length,
    issues: issues.slice(0, 250),
    issueCount: issues.length,
    hasBlockingErrors: issues.length > 0,
    validationMode: options.requirePopulated ? "apply-readiness" : "schema-only",
  };
}

function summarizeResults(planResults) {
  const blockingPlans = planResults.filter((plan) => plan.hasBlockingErrors).map((plan) => plan.name);
  return {
    totalPlans: planResults.length,
    blockingPlansCount: blockingPlans.length,
    blockingPlans,
    totalIssues: planResults.reduce((sum, plan) => sum + plan.issueCount, 0),
  };
}

function buildValidationModes() {
  const schemaOnlyPlans = inputPlans.map((plan) => validatePlan(plan, { requirePopulated: false }));
  const applyReadinessPlans = inputPlans.map((plan) => validatePlan(plan, { requirePopulated: true }));

  return {
    schemaOnly: {
      plans: schemaOnlyPlans,
      summary: summarizeResults(schemaOnlyPlans),
    },
    applyReadiness: {
      plans: applyReadinessPlans,
      summary: summarizeResults(applyReadinessPlans),
    },
  };
}

function main() {
  const validationModes = buildValidationModes();
  const selected = strictMode ? validationModes.applyReadiness : validationModes.schemaOnly;

  const report = {
    generatedAt: new Date().toISOString(),
    wave: "TIER_1",
    mode: strictMode ? "apply-readiness" : "schema-only",
    plans: selected.plans,
    summary: selected.summary,
    modes: {
      schemaOnly: validationModes.schemaOnly.summary,
      applyReadiness: validationModes.applyReadiness.summary,
    },
  };

  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`Wrote Wave 1 input validation report: ${path.relative(repoRoot, outputPath)}`);
}

main();
