import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const wave1BatchesPath = path.join(repoRoot, "docs/destination-expansion-wave1-batches.json");
const outputPath = path.join(repoRoot, "docs/destination-expansion-wave1-health-airports-input.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function namedRecordSchemaDescription() {
  return {
    id: "string (unique within destination/category)",
    name: "string",
    subtitle: "string|null",
    value1: "string|null",
    value2: "string|null",
    value3: "string|null",
    url: "string|null",
    mapQuery: "string|null",
    mapZoom: "number|null",
    verification: {
      sourceUrl: "https://...",
      sourceOrganization: "string",
      sourceType: "string",
      confidenceLevel: "low|medium|high",
      verificationStatus: "estimated|verified|stale|in_progress",
      lastVerifiedAt: "YYYY-MM-DD",
    },
  };
}

function main() {
  const batches = readJson(wave1BatchesPath);
  const monthlyClimateBatch = Array.isArray(batches.batchesByCategory)
    ? batches.batchesByCategory.find((batch) => batch.category === "monthlyClimate")
    : null;

  const destinations = Array.isArray(monthlyClimateBatch?.destinations)
    ? monthlyClimateBatch.destinations.map((destination) => ({
        slug: destination.slug,
        city: destination.city,
        country: destination.country,
        additionGroup: destination.additionGroup,
        sourceNotes: "",
        healthcareFacilities: [],
        airports: [],
      }))
    : [];

  const output = {
    generatedAt: new Date().toISOString(),
    wave: "TIER_1",
    categories: ["healthcareFacilities", "airports"],
    destinationCount: destinations.length,
    expectedRecordSchema: {
      healthcareFacilities: namedRecordSchemaDescription(),
      airports: namedRecordSchemaDescription(),
    },
    destinations,
  };

  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`Wrote Wave 1 health/airports input scaffold: ${path.relative(repoRoot, outputPath)}`);
}

main();
