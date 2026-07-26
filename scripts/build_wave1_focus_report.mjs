import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

const partialApplyPath = path.join(repoRoot, "docs/destination-expansion-wave1-sprint-partial-apply-report.json");
const sprintProgressPath = path.join(repoRoot, "docs/destination-expansion-wave1-sprint-progress.json");
const sprintPlanPath = path.join(repoRoot, "docs/destination-expansion-wave1-research-sprints.json");
const opsStatusPath = path.join(repoRoot, "docs/destination-expansion-wave1-ops-status.json");

const outputJsonPath = path.join(repoRoot, "docs/destination-expansion-wave1-focus-report.json");
const outputMdPath = path.join(repoRoot, "docs/destination-expansion-wave1-focus-report.md");

const categoryToPlan = {
  monthlyClimate: "monthlyClimate",
  costOfLiving: "costHousing",
  housingMetrics: "costHousing",
  healthcareFacilities: "healthAirports",
  airports: "healthAirports",
  visaPrograms: "visaTax",
  taxRules: "visaTax",
  practicalInfo: "practicalInfo",
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function safeRead(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return readJson(filePath);
}

function sortCategoryStats(stats) {
  return [...stats].sort((a, b) => {
    if (b.skippedEmptyArrays !== a.skippedEmptyArrays) {
      return b.skippedEmptyArrays - a.skippedEmptyArrays;
    }
    if (a.updates !== b.updates) {
      return a.updates - b.updates;
    }
    if (a.validationErrors !== b.validationErrors) {
      return b.validationErrors - a.validationErrors;
    }
    return a.category.localeCompare(b.category);
  });
}

function buildTopActions(categoryStats, sprintPlan, nextSuggestedSprint) {
  const sprints = Array.isArray(sprintPlan?.sprints) ? sprintPlan.sprints : [];
  const preferredSprint =
    (nextSuggestedSprint && sprints.find((item) => item.sprint === nextSuggestedSprint)) ||
    sprints[0] ||
    null;

  if (!preferredSprint) return [];

  return categoryStats.slice(0, 5).map((item) => {
    const plan = categoryToPlan[item.category] || null;
    const extractFile = plan
      ? `docs/wave1-sprint-inputs/${preferredSprint.sprint}/${plan}.json`
      : null;

    const categoryBlock = Array.isArray(preferredSprint.tasksByCategory)
      ? preferredSprint.tasksByCategory.find((task) => task.category === item.category)
      : null;

    const targetInputFile = categoryBlock?.tasks?.[0]?.targetInputFile || null;
    const suggestedSlugs = Array.isArray(categoryBlock?.tasks)
      ? categoryBlock.tasks.slice(0, 5).map((task) => task.slug)
      : [];

    return {
      category: item.category,
      sprint: preferredSprint.sprint,
      plan,
      extractFile,
      targetInputFile,
      skippedEmptyArrays: item.skippedEmptyArrays,
      updates: item.updates,
      validationErrors: item.validationErrors,
      suggestedSlugs,
      commandSequence: [
        "npm run expansion:wave1:sprintMerge",
        "npm run expansion:wave1:sprintPartialApply",
        "npm run expansion:wave1:preflightStrict",
      ],
    };
  });
}

function buildMarkdown(report) {
  const lines = [];
  lines.push("# Wave 1 Focus Report");
  lines.push("");
  lines.push(`Generated at: ${report.generatedAt}`);
  lines.push("");
  lines.push(`Status: ${report.status}`);
  lines.push(`Next suggested sprint: ${report.nextSuggestedSprint || "none"}`);
  lines.push("");

  lines.push("## Top Actions");
  lines.push("");
  if (report.topActions.length === 0) {
    lines.push("- No actions available (missing sprint plan or category telemetry).");
  } else {
    for (const action of report.topActions) {
      lines.push(`### ${action.category}`);
      lines.push("");
      lines.push(`- Sprint: ${action.sprint}`);
      lines.push(`- Plan: ${action.plan || "unknown"}`);
      lines.push(`- Extract file: ${action.extractFile || "unknown"}`);
      lines.push(`- Target input file: ${action.targetInputFile || "unknown"}`);
      lines.push(`- Empty arrays currently blocking: ${action.skippedEmptyArrays}`);
      lines.push(`- Suggested first slugs: ${action.suggestedSlugs.join(", ") || "none"}`);
      lines.push("- Run:");
      for (const command of action.commandSequence) {
        lines.push(`  - ${command}`);
      }
      lines.push("");
    }
  }

  lines.push("## Category Backlog");
  lines.push("");
  lines.push("| Category | Empty Arrays | Updates | Validation Errors | Plan | Extract | Target Input |\n|---|---:|---:|---:|---|---|---|");
  for (const row of report.categoryBacklog) {
    lines.push(
      `| ${row.category} | ${row.skippedEmptyArrays} | ${row.updates} | ${row.validationErrors} | ${row.plan || "unknown"} | ${row.extractFile || "unknown"} | ${row.targetInputFile || "unknown"} |`,
    );
  }

  lines.push("");
  lines.push("## Execution Loop");
  lines.push("");
  lines.push("1. Fill one sprint extract category file with sourced records.");
  lines.push("2. Run npm run expansion:wave1:sprintMerge.");
  lines.push("3. Run npm run expansion:wave1:sprintPartialApply.");
  lines.push("4. Run npm run expansion:wave1:preflightStrict.");

  return `${lines.join("\n")}\n`;
}

function main() {
  const partialApply = safeRead(partialApplyPath, {});
  const sprintProgress = safeRead(sprintProgressPath, {});
  const sprintPlan = safeRead(sprintPlanPath, {});
  const opsStatus = safeRead(opsStatusPath, {});

  const byCategory = partialApply?.byCategory || {};
  const nextSuggestedSprint = sprintProgress?.overall?.nextSuggestedSprint || null;

  const categoryStats = sortCategoryStats(
    Object.entries(byCategory).map(([category, stats]) => ({
      category,
      skippedEmptyArrays: stats?.skippedEmptyArrays ?? 0,
      updates: stats?.updates ?? 0,
      validationErrors: stats?.validationErrors ?? 0,
    })),
  );

  const topActions = buildTopActions(categoryStats, sprintPlan, nextSuggestedSprint);
  const topByCategory = new Map(topActions.map((action) => [action.category, action]));

  const categoryBacklog = categoryStats.map((row) => {
    const action = topByCategory.get(row.category);
    return {
      ...row,
      plan: action?.plan || categoryToPlan[row.category] || null,
      extractFile:
        action?.extractFile ||
        (categoryToPlan[row.category] && nextSuggestedSprint
          ? `docs/wave1-sprint-inputs/${nextSuggestedSprint}/${categoryToPlan[row.category]}.json`
          : null),
      targetInputFile: action?.targetInputFile || null,
    };
  });

  const output = {
    generatedAt: new Date().toISOString(),
    status: opsStatus?.summary?.status || "unknown",
    nextSuggestedSprint,
    totals: {
      categories: categoryBacklog.length,
      skippedEmptyArrays: partialApply?.totals?.skippedEmptyArrays ?? 0,
      destinationCategoryUpdates: partialApply?.totals?.destinationCategoryUpdates ?? 0,
      validationErrorCount: partialApply?.totals?.validationErrorCount ?? 0,
    },
    topActions,
    categoryBacklog,
    sources: {
      partialApply: path.relative(repoRoot, partialApplyPath),
      sprintProgress: path.relative(repoRoot, sprintProgressPath),
      sprintPlan: path.relative(repoRoot, sprintPlanPath),
      opsStatus: path.relative(repoRoot, opsStatusPath),
    },
  };

  fs.writeFileSync(outputJsonPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  fs.writeFileSync(outputMdPath, buildMarkdown(output), "utf8");

  console.log(`Wrote Wave 1 focus report JSON: ${path.relative(repoRoot, outputJsonPath)}`);
  console.log(`Wrote Wave 1 focus report Markdown: ${path.relative(repoRoot, outputMdPath)}`);
}

main();
