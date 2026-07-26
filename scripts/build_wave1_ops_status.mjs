import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

const completenessPath = path.join(repoRoot, "docs/destination-expansion-wave1-input-completeness.json");
const validationPath = path.join(repoRoot, "docs/destination-expansion-wave1-input-validation.json");
const applyReportPath = path.join(repoRoot, "docs/destination-expansion-wave1-filled-categories-apply-report.json");
const sprintProgressPath = path.join(repoRoot, "docs/destination-expansion-wave1-sprint-progress.json");
const sprintPartialApplyReportPath = path.join(
  repoRoot,
  "docs/destination-expansion-wave1-sprint-partial-apply-report.json",
);

const outputJsonPath = path.join(repoRoot, "docs/destination-expansion-wave1-ops-status.json");
const outputMdPath = path.join(repoRoot, "docs/destination-expansion-wave1-ops-status.md");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function safeRead(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return readJson(filePath);
}

function summarize(completeness, validation, applyReport, sprintProgress, sprintPartialApplyReport) {
  const completenessSummary = completeness?.summary || {
    totalPlans: 0,
    readyPlansCount: 0,
    blockedPlansCount: 0,
  };

  const validationSummary = validation?.summary || {
    totalPlans: 0,
    blockingPlansCount: 0,
    totalIssues: 0,
  };

  const applyTotals = {
    appliedCount: applyReport?.appliedCount ?? 0,
    skippedCount: applyReport?.skippedCount ?? 0,
    refreshTriggered: applyReport?.refreshTriggered ?? false,
  };

  const partialTotals = sprintPartialApplyReport?.totals || {};
  const partialByCategory = sprintPartialApplyReport?.byCategory || {};
  const topBlockedCategories = Object.entries(partialByCategory)
    .map(([category, stats]) => ({
      category,
      skippedEmptyArrays: stats?.skippedEmptyArrays ?? 0,
    }))
    .sort((a, b) => b.skippedEmptyArrays - a.skippedEmptyArrays)
    .slice(0, 3);

  const overallSprint = sprintProgress?.overall || {
    destinationCount: 0,
    fullyCompleteDestinations: 0,
    fullyCompletePct: 0,
    nextSuggestedSprint: null,
  };

  const blockingPlans = Array.isArray(validationSummary.blockingPlans)
    ? validationSummary.blockingPlans
    : [];

  const status =
    completenessSummary.readyPlansCount > 0 && validationSummary.blockingPlansCount === 0
      ? "apply-ready"
      : "research-required";

  return {
    status,
    readiness: {
      readyPlansCount: completenessSummary.readyPlansCount,
      totalPlans: completenessSummary.totalPlans,
      blockedPlansCount: completenessSummary.blockedPlansCount,
      validationBlockingPlansCount: validationSummary.blockingPlansCount,
      validationIssues: validationSummary.totalIssues,
      blockingPlans,
    },
    apply: applyTotals,
    partialApply: {
      sprintCount: partialTotals.sprintCount ?? 0,
      destinationCategoryUpdates: partialTotals.destinationCategoryUpdates ?? 0,
      skippedEmptyArrays: partialTotals.skippedEmptyArrays ?? 0,
      validationErrorCount: partialTotals.validationErrorCount ?? 0,
      topBlockedCategories,
    },
    sprint: {
      destinationCount: overallSprint.destinationCount,
      fullyCompleteDestinations: overallSprint.fullyCompleteDestinations,
      fullyCompletePct: overallSprint.fullyCompletePct,
      nextSuggestedSprint: overallSprint.nextSuggestedSprint,
    },
  };
}

function buildMarkdown(summary, completeness, validation, applyReport, sprintProgress) {
  const lines = [];
  lines.push("# Wave 1 Ops Status");
  lines.push("");
  lines.push(`Generated at: ${new Date().toISOString()}`);
  lines.push("");
  lines.push(`Status: ${summary.status}`);
  lines.push("");
  lines.push("## Readiness");
  lines.push("");
  lines.push(`- Ready plans: ${summary.readiness.readyPlansCount}/${summary.readiness.totalPlans}`);
  lines.push(`- Completeness blocked plans: ${summary.readiness.blockedPlansCount}`);
  lines.push(`- Validation blocking plans: ${summary.readiness.validationBlockingPlansCount}`);
  lines.push(`- Validation issues: ${summary.readiness.validationIssues}`);
  if (summary.readiness.blockingPlans.length > 0) {
    lines.push(`- Blocking plans: ${summary.readiness.blockingPlans.join(", ")}`);
  }
  lines.push("");
  lines.push("## Apply");
  lines.push("");
  lines.push(`- Applied plans in last run: ${summary.apply.appliedCount}`);
  lines.push(`- Skipped plans in last run: ${summary.apply.skippedCount}`);
  lines.push(`- Refresh triggered: ${summary.apply.refreshTriggered}`);
  lines.push("");
  lines.push("## Partial Apply");
  lines.push("");
  lines.push(`- Sprints processed: ${summary.partialApply.sprintCount}`);
  lines.push(`- Destination-category updates: ${summary.partialApply.destinationCategoryUpdates}`);
  lines.push(`- Empty arrays skipped: ${summary.partialApply.skippedEmptyArrays}`);
  lines.push(`- Validation errors: ${summary.partialApply.validationErrorCount}`);
  if (Array.isArray(summary.partialApply.topBlockedCategories) && summary.partialApply.topBlockedCategories.length > 0) {
    lines.push(
      `- Top blocked categories: ${summary.partialApply.topBlockedCategories
        .map((item) => `${item.category} (${item.skippedEmptyArrays})`)
        .join(", ")}`,
    );
  }
  lines.push("");
  lines.push("## Sprint Progress");
  lines.push("");
  lines.push(`- Destinations in sprint system: ${summary.sprint.destinationCount}`);
  lines.push(`- Fully complete destinations: ${summary.sprint.fullyCompleteDestinations} (${summary.sprint.fullyCompletePct}%)`);
  lines.push(`- Next suggested sprint: ${summary.sprint.nextSuggestedSprint || "none"}`);
  lines.push("");

  const sprintRows = Array.isArray(sprintProgress?.sprints) ? sprintProgress.sprints : [];
  if (sprintRows.length > 0) {
    lines.push("## Sprint Table");
    lines.push("");
    lines.push("| Sprint | Destinations | Category Coverage % | Fully Complete % |");
    lines.push("|---|---:|---:|---:|");
    for (const sprint of sprintRows) {
      lines.push(
        `| ${sprint.sprint} | ${sprint.destinationCount} | ${sprint.categoryCoveragePct} | ${sprint.fullyCompletePct} |`,
      );
    }
    lines.push("");
  }

  lines.push("## Commands");
  lines.push("");
  lines.push("1. npm run expansion:wave1:sprintMerge");
  lines.push("2. npm run expansion:wave1:sprintPartialApply");
  lines.push("3. npm run expansion:wave1:preflightStrict");
  lines.push("4. npm run expansion:wave1:opsStatus");
  lines.push("");

  const blockers = Array.isArray(applyReport?.attempted)
    ? applyReport.attempted.filter((item) => item.status !== "applied")
    : [];
  if (blockers.length > 0) {
    lines.push("## Last Apply Blockers");
    lines.push("");
    for (const blocker of blockers.slice(0, 10)) {
      lines.push(`- ${blocker.name}: ${blocker.reason}`);
    }
  }

  return `${lines.join("\n")}\n`;
}

function main() {
  const completeness = safeRead(completenessPath, {});
  const validation = safeRead(validationPath, {});
  const applyReport = safeRead(applyReportPath, {});
  const sprintProgress = safeRead(sprintProgressPath, {});
  const sprintPartialApplyReport = safeRead(sprintPartialApplyReportPath, {});

  const summary = summarize(completeness, validation, applyReport, sprintProgress, sprintPartialApplyReport);

  const outputJson = {
    generatedAt: new Date().toISOString(),
    summary,
    sources: {
      completeness: path.relative(repoRoot, completenessPath),
      validation: path.relative(repoRoot, validationPath),
      applyReport: path.relative(repoRoot, applyReportPath),
      sprintProgress: path.relative(repoRoot, sprintProgressPath),
      sprintPartialApplyReport: path.relative(repoRoot, sprintPartialApplyReportPath),
    },
  };

  fs.writeFileSync(outputJsonPath, `${JSON.stringify(outputJson, null, 2)}\n`, "utf8");
  fs.writeFileSync(outputMdPath, buildMarkdown(summary, completeness, validation, applyReport, sprintProgress), "utf8");

  console.log(`Wrote Wave 1 ops status JSON: ${path.relative(repoRoot, outputJsonPath)}`);
  console.log(`Wrote Wave 1 ops status Markdown: ${path.relative(repoRoot, outputMdPath)}`);
}

main();
