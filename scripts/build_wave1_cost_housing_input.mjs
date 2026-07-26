import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const wave1BatchesPath = path.join(repoRoot, "docs/destination-expansion-wave1-batches.json");
const outputPath = path.join(repoRoot, "docs/destination-expansion-wave1-cost-housing-input.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function metricSchemaDescription() {
  return {
    key: "string (unique within destination/category)",
    label: "string",
    value: "string|number",
    unit: "string|null",
    displayValue: "string",
    verification: {
      sourceUrl: "https://...",
      sourceOrganization: "string",
      sourceType: "string",
      confidenceLevel: "low|medium|high",
      verificationStatus: "estimated|verified",
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
        costOfLiving: [],
        housingMetrics: [],
      }))
    : [];

  const output = {
    generatedAt: new Date().toISOString(),
    wave: "TIER_1",
    categories: ["costOfLiving", "housingMetrics"],
    destinationCount: destinations.length,
    expectedRecordSchema: {
      costOfLiving: metricSchemaDescription(),
      housingMetrics: metricSchemaDescription(),
    },
    destinations,
  };

  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`Wrote Wave 1 cost/housing input scaffold: ${path.relative(repoRoot, outputPath)}`);
}

main();
