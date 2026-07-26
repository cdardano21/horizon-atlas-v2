import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const wave1BatchesPath = path.join(repoRoot, "docs/destination-expansion-wave1-batches.json");
const inputPath = path.join(repoRoot, "docs/destination-expansion-wave1-monthly-climate-input.json");
const mergedPath = path.join(repoRoot, "supabase/generated-command-center-seeds-merged.json");
const reportPath = path.join(repoRoot, "docs/destination-expansion-wave1-monthly-climate-ingestion-report.json");

const requiredMonths = [
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

const climateMetricKeys = [
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

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function isIsoDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function normalizeMonthlyRecord(raw) {
  return {
    month: raw.month,
    avgHighC: raw.avgHighC ?? null,
    avgLowC: raw.avgLowC ?? null,
    rainfallMm: raw.rainfallMm ?? null,
    rainyDays: raw.rainyDays ?? null,
    humidityPct: raw.humidityPct ?? null,
    sunshineHours: raw.sunshineHours ?? null,
    uvIndex: raw.uvIndex ?? null,
    seaTempC: raw.seaTempC ?? null,
    snowfallCm: raw.snowfallCm ?? null,
    windKph: raw.windKph ?? null,
    verification: {
      sourceUrl: raw?.verification?.sourceUrl,
      sourceOrganization: raw?.verification?.sourceOrganization,
      sourceType: raw?.verification?.sourceType,
      confidenceLevel: raw?.verification?.confidenceLevel,
      verificationStatus: raw?.verification?.verificationStatus,
      lastVerifiedAt: raw?.verification?.lastVerifiedAt,
    },
  };
}

function validateMonthlyRecord(record, slug, index, errors) {
  if (!requiredMonths.includes(record.month)) {
    errors.push(`${slug}: monthlyClimate[${index}] has invalid month '${record.month}'.`);
  }

  const hasAtLeastOneMetric = climateMetricKeys.some((key) => record[key] !== null && record[key] !== undefined);
  if (!hasAtLeastOneMetric) {
    errors.push(`${slug}: monthlyClimate[${index}] has no climate metric values.`);
  }

  const verification = record.verification || {};
  if (!verification.sourceUrl || typeof verification.sourceUrl !== "string") {
    errors.push(`${slug}: monthlyClimate[${index}] missing verification.sourceUrl.`);
  }
  if (!verification.sourceOrganization || typeof verification.sourceOrganization !== "string") {
    errors.push(`${slug}: monthlyClimate[${index}] missing verification.sourceOrganization.`);
  }
  if (!verification.sourceType || typeof verification.sourceType !== "string") {
    errors.push(`${slug}: monthlyClimate[${index}] missing verification.sourceType.`);
  }
  if (!["low", "medium", "high"].includes(verification.confidenceLevel)) {
    errors.push(`${slug}: monthlyClimate[${index}] has invalid verification.confidenceLevel.`);
  }
  if (!["estimated", "verified"].includes(verification.verificationStatus)) {
    errors.push(`${slug}: monthlyClimate[${index}] has invalid verification.verificationStatus.`);
  }
  if (!isIsoDate(verification.lastVerifiedAt)) {
    errors.push(`${slug}: monthlyClimate[${index}] has invalid verification.lastVerifiedAt (expected YYYY-MM-DD).`);
  }
}

function validateInput(input, expectedSlugs) {
  const errors = [];
  const destinations = Array.isArray(input.destinations) ? input.destinations : [];
  const seen = new Set();

  const bySlug = new Map(destinations.map((item) => [item.slug, item]));

  for (const slug of expectedSlugs) {
    if (!bySlug.has(slug)) {
      errors.push(`Missing destination entry for slug '${slug}'.`);
    }
  }

  for (const slug of bySlug.keys()) {
    if (!expectedSlugs.includes(slug)) {
      errors.push(`Unexpected destination slug '${slug}' in input.`);
    }
  }

  for (const destination of destinations) {
    const slug = destination.slug;
    if (seen.has(slug)) {
      errors.push(`Duplicate destination slug '${slug}' in input.`);
      continue;
    }
    seen.add(slug);

    const monthlyClimate = Array.isArray(destination.monthlyClimate) ? destination.monthlyClimate : [];
    if (monthlyClimate.length !== requiredMonths.length) {
      errors.push(`${slug}: expected 12 monthlyClimate records, found ${monthlyClimate.length}.`);
      continue;
    }

    const months = monthlyClimate.map((item) => item.month);
    const uniqueMonths = new Set(months);
    if (uniqueMonths.size !== requiredMonths.length) {
      errors.push(`${slug}: monthlyClimate months must be unique and complete.`);
    }

    for (const month of requiredMonths) {
      if (!uniqueMonths.has(month)) {
        errors.push(`${slug}: missing month '${month}'.`);
      }
    }

    monthlyClimate.forEach((rawRecord, index) => {
      const record = normalizeMonthlyRecord(rawRecord);
      validateMonthlyRecord(record, slug, index, errors);
    });
  }

  return errors;
}

function main() {
  const batches = readJson(wave1BatchesPath);
  const input = readJson(inputPath);
  const merged = readJson(mergedPath);

  const monthlyClimateBatch = Array.isArray(batches.batchesByCategory)
    ? batches.batchesByCategory.find((batch) => batch.category === "monthlyClimate")
    : null;

  const expectedSlugs = Array.isArray(monthlyClimateBatch?.destinations)
    ? monthlyClimateBatch.destinations.map((destination) => destination.slug)
    : [];

  if (expectedSlugs.length === 0) {
    throw new Error("No Wave 1 monthlyClimate slugs found in wave1 batch artifact.");
  }

  const errors = validateInput(input, expectedSlugs);
  if (errors.length > 0) {
    const preview = errors.slice(0, 20).join("\n- ");
    throw new Error(`Validation failed with ${errors.length} issue(s):\n- ${preview}`);
  }

  const applied = [];
  const destinations = input.destinations || [];

  for (const destination of destinations) {
    const slug = destination.slug;
    const normalizedClimate = destination.monthlyClimate.map(normalizeMonthlyRecord);
    const existing = merged[slug] || {};

    merged[slug] = {
      ...existing,
      monthlyClimate: normalizedClimate,
    };

    applied.push({
      slug,
      monthlyClimateRecords: normalizedClimate.length,
    });
  }

  fs.writeFileSync(mergedPath, `${JSON.stringify(merged, null, 2)}\n`, "utf8");

  const report = {
    appliedAt: new Date().toISOString(),
    category: "monthlyClimate",
    wave: "TIER_1",
    destinationCount: applied.length,
    monthlyRecordCount: applied.reduce((sum, item) => sum + item.monthlyClimateRecords, 0),
    applied,
  };

  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`Applied Wave 1 monthlyClimate ingestion to merged seeds: ${path.relative(repoRoot, mergedPath)}`);
  console.log(`Wrote ingestion report: ${path.relative(repoRoot, reportPath)}`);
}

main();
