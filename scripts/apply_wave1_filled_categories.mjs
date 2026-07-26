import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();

const plans = [
  {
    name: "monthlyClimate",
    inputPath: path.join(repoRoot, "docs/destination-expansion-wave1-monthly-climate-input.json"),
    categories: ["monthlyClimate"],
    applyScript: path.join(repoRoot, "scripts/apply_wave1_monthly_climate_ingestion.mjs"),
  },
  {
    name: "costHousing",
    inputPath: path.join(repoRoot, "docs/destination-expansion-wave1-cost-housing-input.json"),
    categories: ["costOfLiving", "housingMetrics"],
    applyScript: path.join(repoRoot, "scripts/apply_wave1_cost_housing_ingestion.mjs"),
  },
  {
    name: "healthAirports",
    inputPath: path.join(repoRoot, "docs/destination-expansion-wave1-health-airports-input.json"),
    categories: ["healthcareFacilities", "airports"],
    applyScript: path.join(repoRoot, "scripts/apply_wave1_health_airports_ingestion.mjs"),
  },
  {
    name: "visaTax",
    inputPath: path.join(repoRoot, "docs/destination-expansion-wave1-visa-tax-input.json"),
    categories: ["visaPrograms", "taxRules"],
    applyScript: path.join(repoRoot, "scripts/apply_wave1_visa_tax_ingestion.mjs"),
  },
  {
    name: "practicalInfo",
    inputPath: path.join(repoRoot, "docs/destination-expansion-wave1-practical-info-input.json"),
    categories: ["practicalInfo"],
    applyScript: path.join(repoRoot, "scripts/apply_wave1_practical_info_ingestion.mjs"),
  },
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function isPlanReady(plan) {
  if (!fs.existsSync(plan.inputPath)) {
    return { ready: false, reason: "input file missing" };
  }

  const input = readJson(plan.inputPath);
  const destinations = Array.isArray(input.destinations) ? input.destinations : [];
  if (destinations.length === 0) {
    return { ready: false, reason: "no destinations in input" };
  }

  for (const destination of destinations) {
    for (const category of plan.categories) {
      const records = Array.isArray(destination[category]) ? destination[category] : [];
      if (records.length === 0) {
        return { ready: false, reason: `destination '${destination.slug}' has empty '${category}'` };
      }
    }
  }

  return { ready: true, reason: "all required category arrays populated" };
}

function runNodeScript(scriptPath) {
  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: repoRoot,
    encoding: "utf8",
  });

  return {
    status: result.status,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
  };
}

function runNpmRefresh() {
  const result = spawnSync("npm", ["run", "expansion:refresh"], {
    cwd: repoRoot,
    encoding: "utf8",
  });

  return {
    status: result.status,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
  };
}

function main() {
  const report = {
    generatedAt: new Date().toISOString(),
    attempted: [],
    appliedCount: 0,
    skippedCount: 0,
    refreshTriggered: false,
  };

  for (const plan of plans) {
    const readiness = isPlanReady(plan);
    if (!readiness.ready) {
      report.attempted.push({
        name: plan.name,
        status: "skipped",
        reason: readiness.reason,
      });
      report.skippedCount += 1;
      continue;
    }

    const run = runNodeScript(plan.applyScript);
    if (run.status !== 0) {
      report.attempted.push({
        name: plan.name,
        status: "failed",
        reason: "apply script failed",
        stderrPreview: run.stderr.split("\n").slice(0, 8),
      });
      console.error(run.stderr || `Apply failed for ${plan.name}`);
      process.exitCode = 1;
      continue;
    }

    report.attempted.push({
      name: plan.name,
      status: "applied",
      reason: readiness.reason,
      stdoutPreview: run.stdout.split("\n").filter(Boolean).slice(0, 5),
    });
    report.appliedCount += 1;
  }

  if (report.appliedCount > 0) {
    const refresh = runNpmRefresh();
    report.refreshTriggered = true;
    if (refresh.status !== 0) {
      console.error(refresh.stderr || "expansion:refresh failed after apply.");
      process.exitCode = 1;
    }
  }

  const reportPath = path.join(repoRoot, "docs/destination-expansion-wave1-filled-categories-apply-report.json");
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(`Wave 1 filled-category apply report: ${path.relative(repoRoot, reportPath)}`);
  console.log(`Applied: ${report.appliedCount}, skipped: ${report.skippedCount}, refreshTriggered: ${report.refreshTriggered}`);
}

main();
