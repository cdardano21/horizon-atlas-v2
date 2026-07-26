import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const wave1BatchesPath = path.join(repoRoot, "docs/destination-expansion-wave1-batches.json");
const inputPath = path.join(repoRoot, "docs/destination-expansion-wave1-practical-info-input.json");
const mergedPath = path.join(repoRoot, "supabase/generated-command-center-seeds-merged.json");
const reportPath = path.join(repoRoot, "docs/destination-expansion-wave1-practical-info-ingestion-report.json");

const category = "practicalInfo";
const allowedVerificationStatus = ["estimated", "verified", "stale", "in_progress"];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function isIsoDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function asNullableString(value) {
  if (value === undefined || value === null) return null;
  return String(value);
}

function normalizeNamedRecord(raw) {
  return {
    id: raw.id,
    name: raw.name,
    subtitle: asNullableString(raw.subtitle),
    value1: asNullableString(raw.value1),
    value2: asNullableString(raw.value2),
    value3: asNullableString(raw.value3),
    url: asNullableString(raw.url),
    mapQuery: asNullableString(raw.mapQuery),
    mapZoom: raw.mapZoom === undefined || raw.mapZoom === null ? null : Number(raw.mapZoom),
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

function validateNamedRecord(record, slug, index, errors) {
  if (!record.id || typeof record.id !== "string") {
    errors.push(`${slug}: ${category}[${index}] missing id.`);
  }
  if (!record.name || typeof record.name !== "string") {
    errors.push(`${slug}: ${category}[${index}] missing name.`);
  }

  const hasAnyValue = [record.subtitle, record.value1, record.value2, record.value3].some(
    (value) => typeof value === "string" && value.trim().length > 0,
  );
  if (!hasAnyValue) {
    errors.push(`${slug}: ${category}[${index}] should include at least one descriptive field.`);
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
  if (!allowedVerificationStatus.includes(verification.verificationStatus)) {
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
    const records = Array.isArray(destination[category]) ? destination[category] : [];
    if (records.length === 0) {
      errors.push(`${slug}: category '${category}' has no records.`);
      continue;
    }

    const seenIds = new Set();
    records.forEach((rawRecord, index) => {
      const record = normalizeNamedRecord(rawRecord);
      validateNamedRecord(record, slug, index, errors);

      const id = String(record.id || "").trim().toLowerCase();
      if (!id) return;
      if (seenIds.has(id)) {
        errors.push(`${slug}: category '${category}' has duplicate id '${record.id}'.`);
        return;
      }
      seenIds.add(id);
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
    throw new Error("No Wave 1 slugs found in wave1 batch artifact.");
  }

  const errors = validateInput(input, expectedSlugs);
  if (errors.length > 0) {
    const preview = errors.slice(0, 30).join("\n- ");
    throw new Error(`Validation failed with ${errors.length} issue(s):\n- ${preview}`);
  }

  const destinations = input.destinations || [];
  const applied = [];

  for (const destination of destinations) {
    const slug = destination.slug;
    const existing = merged[slug] || {};
    const normalizedPracticalInfo = destination.practicalInfo.map(normalizeNamedRecord);

    merged[slug] = {
      ...existing,
      practicalInfo: normalizedPracticalInfo,
    };

    applied.push({
      slug,
      practicalInfoRecords: normalizedPracticalInfo.length,
    });
  }

  fs.writeFileSync(mergedPath, `${JSON.stringify(merged, null, 2)}\n`, "utf8");

  const report = {
    appliedAt: new Date().toISOString(),
    categories: [category],
    wave: "TIER_1",
    destinationCount: applied.length,
    totals: {
      practicalInfoRecords: applied.reduce((sum, item) => sum + item.practicalInfoRecords, 0),
    },
    applied,
  };

  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`Applied Wave 1 practicalInfo ingestion to merged seeds: ${path.relative(repoRoot, mergedPath)}`);
  console.log(`Wrote ingestion report: ${path.relative(repoRoot, reportPath)}`);
}

main();
