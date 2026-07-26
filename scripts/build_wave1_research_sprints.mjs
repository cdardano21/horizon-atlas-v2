import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const packetsPath = path.join(repoRoot, "docs/destination-expansion-wave1-research-source-packets.json");
const outputJsonPath = path.join(repoRoot, "docs/destination-expansion-wave1-research-sprints.json");
const outputMdPath = path.join(repoRoot, "docs/destination-expansion-wave1-research-sprints.md");

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

const sprintSize = 10;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function groupIntoSprints(destinations) {
  const sprints = [];
  for (let i = 0; i < destinations.length; i += sprintSize) {
    sprints.push(destinations.slice(i, i + sprintSize));
  }
  return sprints;
}

function buildSprintPayload(sprintDestinations, sprintIndex) {
  const sprintName = `SPRINT_${sprintIndex + 1}`;
  const tasksByCategory = categories.map((category) => {
    const tasks = sprintDestinations.map((destination) => {
      const categoryData = destination.categories?.[category] || {};
      return {
        slug: destination.slug,
        city: destination.city,
        country: destination.country,
        targetInputFile: categoryData.targetInputFile || null,
        requiredMinRecords: categoryData.requiredMinRecords || 0,
        sources: categoryData.sources || [],
      };
    });

    return {
      category,
      destinationCount: tasks.length,
      tasks,
    };
  });

  return {
    sprint: sprintName,
    destinationCount: sprintDestinations.length,
    destinations: sprintDestinations.map((item) => item.slug),
    tasksByCategory,
  };
}

function buildMarkdown(sprints) {
  const lines = [];
  lines.push("# Wave 1 Research Sprints");
  lines.push("");
  lines.push(`Generated at: ${new Date().toISOString()}`);
  lines.push("");
  lines.push("Execution");
  lines.push("1. Complete one sprint at a time.");
  lines.push("2. Fill category input files for sprint destinations.");
  lines.push("3. Run npm run expansion:wave1:preflightStrict after each sprint.");
  lines.push("");

  for (const sprint of sprints) {
    lines.push(`## ${sprint.sprint}`);
    lines.push("");
    lines.push(`- Destinations: ${sprint.destinationCount}`);
    lines.push(`- Slugs: ${sprint.destinations.join(", ")}`);
    lines.push("");

    for (const categoryBlock of sprint.tasksByCategory) {
      lines.push(`### ${categoryBlock.category}`);
      lines.push("");
      for (const task of categoryBlock.tasks) {
        lines.push(`- [ ] ${task.slug}`);
        lines.push(`- Input file: ${task.targetInputFile}`);
        lines.push(`- Minimum records: ${task.requiredMinRecords}`);
      }
      lines.push("");
    }
  }

  return `${lines.join("\n")}\n`;
}

function main() {
  const packetsDoc = readJson(packetsPath);
  const packets = Array.isArray(packetsDoc.packets) ? packetsDoc.packets : [];

  const sprints = groupIntoSprints(packets).map((sprint, index) => buildSprintPayload(sprint, index));

  const outputJson = {
    generatedAt: new Date().toISOString(),
    wave: "TIER_1",
    sprintSize,
    sprintCount: sprints.length,
    sprints,
  };

  fs.writeFileSync(outputJsonPath, `${JSON.stringify(outputJson, null, 2)}\n`, "utf8");
  fs.writeFileSync(outputMdPath, buildMarkdown(sprints), "utf8");

  console.log(`Wrote Wave 1 sprint plan JSON: ${path.relative(repoRoot, outputJsonPath)}`);
  console.log(`Wrote Wave 1 sprint plan Markdown: ${path.relative(repoRoot, outputMdPath)}`);
}

main();
