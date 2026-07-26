import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const wave1BatchesPath = path.join(repoRoot, "docs/destination-expansion-wave1-batches.json");
const outputPath = path.join(repoRoot, "docs/destination-expansion-wave1-monthly-climate-input.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
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
        monthlyClimate: [],
      }))
    : [];

  const output = {
    generatedAt: new Date().toISOString(),
    wave: "TIER_1",
    category: "monthlyClimate",
    destinationCount: destinations.length,
    requiredMonthOrder: [
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
    ],
    expectedRecordSchema: {
      month: "January|...|December",
      avgHighC: "number|null",
      avgLowC: "number|null",
      rainfallMm: "number|null",
      rainyDays: "number|null",
      humidityPct: "number|null",
      sunshineHours: "number|null",
      uvIndex: "number|null",
      seaTempC: "number|null",
      snowfallCm: "number|null",
      windKph: "number|null",
      verification: {
        sourceUrl: "https://...",
        sourceOrganization: "string",
        sourceType: "string",
        confidenceLevel: "low|medium|high",
        verificationStatus: "estimated|verified",
        lastVerifiedAt: "YYYY-MM-DD",
      },
    },
    destinations,
  };

  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`Wrote Wave 1 monthlyClimate input scaffold: ${path.relative(repoRoot, outputPath)}`);
}

main();
