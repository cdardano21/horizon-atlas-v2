import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const wave1BatchesPath = path.join(repoRoot, "docs/destination-expansion-wave1-batches.json");
const inputPath = path.join(repoRoot, "docs/destination-expansion-wave1-cost-housing-input.json");
const mergedPath = path.join(repoRoot, "supabase/generated-command-center-seeds-merged.json");
const reportPath = path.join(repoRoot, "docs/destination-expansion-wave1-cost-housing-ingestion-report.json");

const categories = ["costOfLiving", "housingMetrics"];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function isIsoDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function normalizeMetricRecord(raw) {
  return {
    key: raw.key,
    label: raw.label,
    value: raw.value,
    unit: raw.unit ?? null,
    displayValue: raw.displayValue,
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

function validateMetricRecord(record, slug, category, index, errors) {
  if (!record.key || typeof record.key !== "string") {
    errors.push(`${slug}: ${category}[${index}] missing key.`);
  }
  if (!record.label || typeof record.label !== "string") {
    errors.push(`${slug}: ${category}[${index}] missing label.`);
  }
  if (record.value === undefined || record.value === null || record.value === "") {
    errors.push(`${slug}: ${category}[${index}] missing value.`);
  }
  if (!record.displayValue || typeof record.displayValue !== "string") {
    errors.push(`${slug}: ${category}[${index}] missing displayValue.`);
  }

  const verification = record.verification || {};
  if (!verification.sourceUrl || typeof verification.sourceUrl !== "string") {
    errors.push(`${slug}: ${category}[${index}] missing verification.sourceUrl.`);
  }
  if (!verification.sourceOrganization || typeof verification.sourceOrganization !== "string") {
    errors.push(`${slug}: ${category}[${index}] missing verification.sourceOrganization.`);
  }
  if (!verification.sourceType || typeof verification.sourceType !== "string") {
    errors.push(`${slug}: ${category}[${index}] missing verification.sourceType.`);
  }
  if (!["low", "medium", "high"].includes(verification.confidenceLevel)) {
    errors.push(`${slug}: ${category}[${index}] has invalid verification.confidenceLevel.`);
  }
  if (!["estimated", "verified"].includes(verification.verificationStatus)) {
    errors.push(`${slug}: ${category}[${index}] has invalid verification.verificationStatus.`);
  }
  if (!isIsoDate(verification.lastVerifiedAt)) {
    errors.push(`${slug}: ${category}[${index}] has invalid verification.lastVerifiedAt (expected YYYY-MM-DD).`);
  }
}

function validateInput(input, expectedSlugs) {
  const errors = [];
  const destinations = Array.isArray(input.destinations) ? input.destinations : [];

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

    for (const category of categories) {
      const records = Array.isArray(destination[category]) ? destination[category] : [];
      if (records.length === 0) {
        errors.push(`${slug}: category '${category}' has no records.`);
        continue;
      }

      const seenKeys = new Set();
      records.forEach((rawRecord, index) => {
        const record = normalizeMetricRecord(rawRecord);
        validateMetricRecord(record, slug, category, index, errors);

        const key = String(record.key || "").trim().toLowerCase();
        if (!key) {
          return;
        }
        if (seenKeys.has(key)) {
          errors.push(`${slug}: category '${category}' has duplicate key '${record.key}'.`);
          return;
        }
        seenKeys.add(key);
      });
    }
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
    throw new Error("No Wave 1 slugs found in wave1 batch artifact.");
  }

  const errors = validateInput(input, expectedSlugs);
  if (errors.length > 0) {
    const preview = errors.slice(0, 30).join("\n- ");
    throw new Error(`Validation failed with ${errors.length} issue(s):\n- ${preview}`);
  }

  const applied = [];
  const destinations = input.destinations || [];

  for (const destination of destinations) {
    const slug = destination.slug;
    const existing = merged[slug] || {};

    const normalizedCost = destination.costOfLiving.map(normalizeMetricRecord);
    const normalizedHousing = destination.housingMetrics.map(normalizeMetricRecord);

    merged[slug] = {
      ...existing,
      costOfLiving: normalizedCost,
      housingMetrics: normalizedHousing,
    };

    applied.push({
      slug,
      costOfLivingRecords: normalizedCost.length,
      housingMetricsRecords: normalizedHousing.length,
    });
  }

  fs.writeFileSync(mergedPath, `${JSON.stringify(merged, null, 2)}\n`, "utf8");

  const report = {
    appliedAt: new Date().toISOString(),
    categories,
    wave: "TIER_1",
    destinationCount: applied.length,
    totals: {
      costOfLivingRecords: applied.reduce((sum, item) => sum + item.costOfLivingRecords, 0),
      housingMetricsRecords: applied.reduce((sum, item) => sum + item.housingMetricsRecords, 0),
    },
    applied,
  };

  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`Applied Wave 1 cost/housing ingestion to merged seeds: ${path.relative(repoRoot, mergedPath)}`);
  console.log(`Wrote ingestion report: ${path.relative(repoRoot, reportPath)}`);
}

main();
