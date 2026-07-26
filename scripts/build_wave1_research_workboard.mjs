import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const packetsPath = path.join(repoRoot, "docs/destination-expansion-wave1-research-source-packets.json");
const completenessPath = path.join(repoRoot, "docs/destination-expansion-wave1-input-completeness.json");
const outputPath = path.join(repoRoot, "docs/destination-expansion-wave1-research-workboard.md");

const categoriesInOrder = [
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

function mapCompleteness(completenessDoc) {
  const byPlan = new Map();
  const plans = Array.isArray(completenessDoc.plans) ? completenessDoc.plans : [];
  for (const plan of plans) {
    const categories = Array.isArray(plan.categories) ? plan.categories : [];
    for (const category of categories) {
      byPlan.set(category.category, {
        destinationsWithRecords: category.destinationsWithRecords,
        destinationCoveragePct: category.destinationCoveragePct,
        totalRecords: category.totalRecords,
      });
    }
  }
  return byPlan;
}

function findCategoryBlockers(completenessDoc, category) {
  const plans = Array.isArray(completenessDoc.plans) ? completenessDoc.plans : [];
  const matchedPlan = plans.find((plan) =>
    Array.isArray(plan.categories) ? plan.categories.some((item) => item.category === category) : false,
  );

  if (!matchedPlan) return [];
  const blockers = Array.isArray(matchedPlan.blockers) ? matchedPlan.blockers : [];
  return blockers.slice(0, 10);
}

function renderSources(sources) {
  if (!Array.isArray(sources) || sources.length === 0) return "";
  return sources
    .map((source) => `- ${source.sourceName} (${source.sourceType}): ${source.url}`)
    .join("\n");
}

function buildCategorySection(packets, completenessMap, completenessDoc, category) {
  const summary = completenessMap.get(category) || {
    destinationsWithRecords: 0,
    destinationCoveragePct: 0,
    totalRecords: 0,
  };

  const lines = [];
  lines.push(`## ${category}`);
  lines.push("");
  lines.push(`- Coverage: ${summary.destinationsWithRecords}/${packets.length} destinations (${summary.destinationCoveragePct}%)`);
  lines.push(`- Total records captured: ${summary.totalRecords}`);
  lines.push("");

  const blockers = findCategoryBlockers(completenessDoc, category);
  if (blockers.length > 0) {
    lines.push("Top blockers:");
    for (const blocker of blockers) {
      lines.push(`- ${blocker}`);
    }
    lines.push("");
  }

  lines.push("Destination tasks:");
  lines.push("");

  for (const packet of packets) {
    const categoryData = packet.categories?.[category];
    if (!categoryData) continue;

    lines.push(`- [ ] ${packet.slug}`);
    lines.push(`- Input file: ${categoryData.targetInputFile}`);
    lines.push(`- Minimum records: ${categoryData.requiredMinRecords}`);
    const sourceText = renderSources(categoryData.sources);
    if (sourceText) {
      lines.push("- Source targets:");
      lines.push(sourceText);
    }
    lines.push("");
  }

  return lines.join("\n");
}

function main() {
  const packetsDoc = readJson(packetsPath);
  const completenessDoc = readJson(completenessPath);
  const packets = Array.isArray(packetsDoc.packets) ? packetsDoc.packets : [];

  const completenessMap = mapCompleteness(completenessDoc);

  const lines = [];
  lines.push("# Wave 1 Research Workboard");
  lines.push("");
  lines.push(`Generated at: ${new Date().toISOString()}`);
  lines.push(`Wave: ${packetsDoc.wave || "TIER_1"}`);
  lines.push(`Destinations: ${packets.length}`);
  lines.push("");
  lines.push("Usage:");
  lines.push("1. Pick one category section below.");
  lines.push("2. Fill records in the listed input file using the source targets.");
  lines.push("3. Run npm run expansion:wave1:preflightStrict after each batch.");
  lines.push("");

  for (const category of categoriesInOrder) {
    lines.push(buildCategorySection(packets, completenessMap, completenessDoc, category));
    lines.push("");
  }

  fs.writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");
  console.log(`Wrote Wave 1 research workboard: ${path.relative(repoRoot, outputPath)}`);
}

main();
