import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const coveragePath = path.join(repoRoot, "docs/destination-expansion-coverage-report.json");
const wave1BatchesPath = path.join(repoRoot, "docs/destination-expansion-wave1-batches.json");
const checklistPath = path.join(repoRoot, "docs/destination-expansion-wave1-ingestion-checklist.md");

const categories = [
  "monthlyClimate",
  "costOfLiving",
  "housingMetrics",
  "healthcareFacilities",
  "airports",
  "visaPrograms",
  "taxRules",
  "practicalInfo",
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function yn(hasData) {
  return hasData ? "Y" : "N";
}

function main() {
  const coverage = readJson(coveragePath);
  const wave1Batches = readJson(wave1BatchesPath);

  const coverageRows = Array.isArray(coverage.rows) ? coverage.rows : [];
  const coverageBySlug = new Map(coverageRows.map((row) => [row.slug, row]));

  const monthlyClimateBatch = Array.isArray(wave1Batches.batchesByCategory)
    ? wave1Batches.batchesByCategory.find((batch) => batch.category === "monthlyClimate")
    : null;

  const wave1Slugs = Array.isArray(monthlyClimateBatch?.destinations)
    ? monthlyClimateBatch.destinations.map((d) => d.slug)
    : [];

  const wave1Rows = wave1Slugs.map((slug) => coverageBySlug.get(slug)).filter(Boolean);

  const categoryCompletion = Object.fromEntries(
    categories.map((category) => {
      const allComplete = wave1Rows.length > 0 && wave1Rows.every((row) => (row.categoryCounts?.[category] ?? 0) > 0);
      return [category, allComplete];
    }),
  );

  const source = fs.readFileSync(checklistPath, "utf8");
  const lines = source.split("\n");

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const boardMatch = line.match(/^- \[( |x)\] `([^`]+)` complete for all 30$/);
    if (boardMatch) {
      const category = boardMatch[2];
      if (categories.includes(category)) {
        const checked = categoryCompletion[category] ? "x" : " ";
        lines[i] = `- [${checked}] \`${category}\` complete for all 30`;
      }
    }
  }

  const tableHeaderIndex = lines.findIndex((line) => line.startsWith("| Destination slug |"));
  if (tableHeaderIndex === -1) {
    throw new Error("Could not find destination table header in checklist.");
  }

  const tableRowsStart = tableHeaderIndex + 2;
  let tableRowsEnd = tableRowsStart;
  while (tableRowsEnd < lines.length && lines[tableRowsEnd].startsWith("| ")) {
    tableRowsEnd += 1;
  }

  for (let i = tableRowsStart; i < tableRowsEnd; i += 1) {
    const line = lines[i];
    const match = line.match(/^\|\s([^|]+?)\s\|/);
    if (!match) continue;

    const slug = match[1].trim();
    const row = coverageBySlug.get(slug);
    if (!row) {
      continue;
    }

    const categoryStates = categories.map((category) => yn((row.categoryCounts?.[category] ?? 0) > 0));
    const readinessScore = Number.isFinite(row.readinessScore) ? row.readinessScore : 0;
    const promote = readinessScore >= 6 ? "Y" : "N";

    lines[i] = `| ${slug} | ${categoryStates.join(" | ")} | ${readinessScore} | ${promote} |`;
  }

  fs.writeFileSync(checklistPath, `${lines.join("\n")}\n`, "utf8");
  console.log(`Updated Wave 1 checklist: ${path.relative(repoRoot, checklistPath)}`);
}

main();
