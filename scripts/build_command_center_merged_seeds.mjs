import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const generatedTsPath = path.join(repoRoot, "app/lib/generated-command-center-seeds.ts");
const regionalTsPath = path.join(repoRoot, "app/lib/regional-command-center-seeds.ts");
const localTsPath = path.join(repoRoot, "app/lib/local-command-center-seeds.ts");

const mergedJsonPath = path.join(repoRoot, "supabase/generated-command-center-seeds-merged.json");

const arrayKeyExtractors = {
  quickMetrics: (item) => item?.key,
  scorecard: (item) => String(item?.category ?? "").toLowerCase(),
  monthlyClimate: (item) => String(item?.month ?? "").toLowerCase(),
  costOfLiving: (item) => item?.key,
  housingMetrics: (item) => item?.key,
  neighborhoods: (item) => item?.id || String(item?.name ?? "").toLowerCase(),
  healthcareFacilities: (item) => item?.id || String(item?.name ?? "").toLowerCase(),
  airports: (item) => item?.id || String(item?.name ?? "").toLowerCase(),
  golfCourses: (item) => item?.id || String(item?.name ?? "").toLowerCase(),
  recreationFacilities: (item) => item?.id || String(item?.name ?? "").toLowerCase(),
  beaches: (item) => item?.id || String(item?.name ?? "").toLowerCase(),
  schools: (item) => item?.id || String(item?.name ?? "").toLowerCase(),
  internetMetrics: (item) => item?.key,
  visaPrograms: (item) => item?.id || String(item?.name ?? "").toLowerCase(),
  taxRules: (item) => item?.id || String(item?.name ?? "").toLowerCase(),
  safetyMetrics: (item) => item?.key,
  foodMetrics: (item) => item?.key,
  pros: (item) => String(item ?? "").toLowerCase(),
  tradeoffs: (item) => String(item ?? "").toLowerCase(),
  resources: (item) => item?.id || `${String(item?.category ?? "")}-${String(item?.title ?? "")}`.toLowerCase(),
};

function loadTsModule(filePath) {
  const source = fs.readFileSync(filePath, "utf-8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
      skipLibCheck: true,
    },
    fileName: filePath,
  });

  const cjsModule = { exports: {} };
  const context = {
    module: cjsModule,
    exports: cjsModule.exports,
    require: () => {
      throw new Error(`Runtime require not supported while loading ${filePath}`);
    },
    __filename: filePath,
    __dirname: path.dirname(filePath),
  };

  vm.runInNewContext(transpiled.outputText, context, { filename: filePath });
  return cjsModule.exports;
}

function mergeUnique(seedItems, baseItems, keyFn) {
  if (!Array.isArray(seedItems) || seedItems.length === 0) return baseItems;
  const seen = new Set();
  const merged = [];
  for (const item of [...seedItems, ...baseItems]) {
    const rawKey = keyFn(item);
    const key = String(rawKey ?? "");
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }
  return merged;
}

function applySeed(base, seed) {
  if (!seed || typeof seed !== "object") return base;

  const hasSeedQuickMetrics = Array.isArray(seed.quickMetrics) && seed.quickMetrics.length > 0;
  const hasSeedScorecard = Array.isArray(seed.scorecard) && seed.scorecard.length > 0;

  const next = {
    ...base,
    region: seed.region ?? base.region,
    lastVerifiedAt: seed.lastVerifiedAt ?? base.lastVerifiedAt,
    dataConfidence: seed.dataConfidence ?? base.dataConfidence,
    quickMetrics: hasSeedQuickMetrics ? [...seed.quickMetrics] : (Array.isArray(base.quickMetrics) ? base.quickMetrics : []),
    scorecard: hasSeedScorecard ? [...seed.scorecard] : (Array.isArray(base.scorecard) ? base.scorecard : []),
  };

  for (const [field, keyFn] of Object.entries(arrayKeyExtractors)) {
    if (field === "quickMetrics" || field === "scorecard") {
      continue;
    }
    next[field] = mergeUnique(seed[field], Array.isArray(base[field]) ? base[field] : [], keyFn);
  }

  return next;
}

function main() {
  const generatedModule = loadTsModule(generatedTsPath);
  const regionalModule = loadTsModule(regionalTsPath);
  const localModule = loadTsModule(localTsPath);

  const generated = generatedModule.generatedCommandCenterSeeds ?? {};
  const regional = regionalModule.REGIONAL_COMMAND_CENTER_SEEDS ?? {};
  const local = localModule.LOCAL_COMMAND_CENTER_SEEDS ?? {};

  const allSlugs = new Set([
    ...Object.keys(generated),
    ...Object.keys(regional),
    ...Object.keys(local),
  ]);

  const merged = {};
  for (const slug of allSlugs) {
    const base = generated[slug] ?? {};
    merged[slug] = applySeed(applySeed(base, regional[slug]), local[slug]);
  }

  fs.writeFileSync(mergedJsonPath, `${JSON.stringify(merged, null, 2)}\n`, "utf-8");
  console.log(`Wrote merged command-center seeds to ${mergedJsonPath}.`);
}

main();
