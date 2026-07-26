import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const packetsPath = path.join(repoRoot, "docs/destination-expansion-wave1-research-source-packets.json");
const completenessPath = path.join(repoRoot, "docs/destination-expansion-wave1-input-completeness.json");
const bundleDir = path.join(repoRoot, "docs/wave1-research-bundles");
const indexPath = path.join(bundleDir, "README.md");

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

function safeSlug(value) {
  return value.replace(/[^a-zA-Z0-9-]/g, "-");
}

function categorySummaryMap(completeness) {
  const map = new Map();
  const plans = Array.isArray(completeness.plans) ? completeness.plans : [];
  for (const plan of plans) {
    const planCategories = Array.isArray(plan.categories) ? plan.categories : [];
    for (const entry of planCategories) {
      map.set(entry.category, {
        destinationsWithRecords: entry.destinationsWithRecords,
        destinationCoveragePct: entry.destinationCoveragePct,
        totalRecords: entry.totalRecords,
      });
    }
  }
  return map;
}

function writeCategoryFile(category, packets, summary) {
  const filePath = path.join(bundleDir, `${safeSlug(category)}.md`);
  const lines = [];

  lines.push(`# Wave 1 Bundle: ${category}`);
  lines.push("");
  lines.push(`- Coverage: ${summary.destinationsWithRecords}/${packets.length} (${summary.destinationCoveragePct}%)`);
  lines.push(`- Total records captured: ${summary.totalRecords}`);
  lines.push("");
  lines.push("Execution");
  lines.push("1. Gather values from source targets below.");
  lines.push("2. Write records into the listed target input file.");
  lines.push("3. Run npm run expansion:wave1:preflightStrict.");
  lines.push("");

  for (const packet of packets) {
    const categoryData = packet.categories?.[category];
    if (!categoryData) continue;

    lines.push(`## ${packet.slug}`);
    lines.push("");
    lines.push(`- [ ] Research complete`);
    lines.push(`- Input file: ${categoryData.targetInputFile}`);
    lines.push(`- Minimum records: ${categoryData.requiredMinRecords}`);
    lines.push("- Source targets:");

    const sources = Array.isArray(categoryData.sources) ? categoryData.sources : [];
    for (const source of sources) {
      lines.push(`- ${source.sourceName} (${source.sourceType}): ${source.url}`);
      if (source.notes) {
        lines.push(`- Note: ${source.notes}`);
      }
    }

    lines.push("- Verification notes:");
    lines.push("- [ ] sourceUrl captured");
    lines.push("- [ ] sourceOrganization captured");
    lines.push("- [ ] sourceType captured");
    lines.push("- [ ] confidenceLevel set");
    lines.push("- [ ] verificationStatus set");
    lines.push("- [ ] lastVerifiedAt set (YYYY-MM-DD)");
    lines.push("");
  }

  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
  return filePath;
}

function writeIndex(categoryFiles, packets, completenessSummary) {
  const lines = [];
  lines.push("# Wave 1 Research Bundles");
  lines.push("");
  lines.push(`Generated at: ${new Date().toISOString()}`);
  lines.push(`Destinations: ${packets.length}`);
  lines.push("");
  lines.push(`Plans ready for apply: ${completenessSummary.readyPlansCount}/${completenessSummary.totalPlans}`);
  lines.push("");
  lines.push("Bundle files:");
  for (const item of categoryFiles) {
    const relative = path.relative(bundleDir, item.filePath);
    lines.push(`- [${item.category}](./${relative})`);
  }
  lines.push("");
  lines.push("Runbook");
  lines.push("1. Pick one bundle file.");
  lines.push("2. Fill the corresponding Wave 1 category input file.");
  lines.push("3. Run npm run expansion:wave1:preflightStrict.");

  fs.writeFileSync(indexPath, `${lines.join("\n")}\n`, "utf8");
}

function main() {
  const packetsDoc = readJson(packetsPath);
  const completenessDoc = readJson(completenessPath);
  const packets = Array.isArray(packetsDoc.packets) ? packetsDoc.packets : [];

  fs.mkdirSync(bundleDir, { recursive: true });

  const summaryMap = categorySummaryMap(completenessDoc);
  const categoryFiles = [];

  for (const category of categories) {
    const summary = summaryMap.get(category) || {
      destinationsWithRecords: 0,
      destinationCoveragePct: 0,
      totalRecords: 0,
    };
    const filePath = writeCategoryFile(category, packets, summary);
    categoryFiles.push({ category, filePath });
  }

  writeIndex(categoryFiles, packets, completenessDoc.summary || { totalPlans: 0, readyPlansCount: 0 });

  console.log(`Wrote Wave 1 research bundle index: ${path.relative(repoRoot, indexPath)}`);
  for (const item of categoryFiles) {
    console.log(`Wrote category bundle: ${path.relative(repoRoot, item.filePath)}`);
  }
}

main();
