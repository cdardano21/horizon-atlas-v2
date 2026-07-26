import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mergedPath = path.join(repoRoot, "supabase", "generated-command-center-seeds-merged.json");
const outputPath = path.join(repoRoot, "app", "lib", "generated-destination-card-facts.ts");

const PRIORITY_FACT_SOURCES = [
  ["quickMetrics", (item) => ({ label: item.label || item.key || "Metric", value: item.displayValue || item.value || "In progress", sourceUrl: item?.verification?.sourceUrl || null })],
  ["costOfLiving", (item) => ({ label: item.label || "Cost", value: item.displayValue || item.value || "In progress", sourceUrl: item?.verification?.sourceUrl || null })],
  ["housingMetrics", (item) => ({ label: item.label || "Housing", value: item.displayValue || item.value || "In progress", sourceUrl: item?.verification?.sourceUrl || null })],
  ["airports", (item) => ({ label: "Nearest airport", value: [item.name, item.value1].filter(Boolean).join(" - ") || "In progress", sourceUrl: item?.verification?.sourceUrl || item?.url || null })],
  ["healthcareFacilities", (item) => ({ label: "Healthcare", value: [item.name, item.value1].filter(Boolean).join(" - ") || "In progress", sourceUrl: item?.verification?.sourceUrl || item?.url || null })],
  ["internetMetrics", (item) => ({ label: item.label || "Internet", value: item.displayValue || item.value || "In progress", sourceUrl: item?.verification?.sourceUrl || null })],
  ["visaPrograms", (item) => ({ label: "Residency", value: [item.name, item.value1].filter(Boolean).join(" - ") || "In progress", sourceUrl: item?.verification?.sourceUrl || item?.url || null })],
  ["taxRules", (item) => ({ label: "Tax", value: [item.name, item.value1].filter(Boolean).join(" - ") || "In progress", sourceUrl: item?.verification?.sourceUrl || item?.url || null })],
  ["golfCourses", (item) => ({ label: "Golf", value: [item.name, item.value1].filter(Boolean).join(" - ") || "In progress", sourceUrl: item?.verification?.sourceUrl || item?.url || null })],
  ["schools", (item) => ({ label: "Schools", value: [item.name, item.value1].filter(Boolean).join(" - ") || "In progress", sourceUrl: item?.verification?.sourceUrl || item?.url || null })],
  ["monthlyClimate", (item) => ({ label: "Climate", value: `${item.month}: ${item.avgHighC ?? "-"}C / ${item.avgLowC ?? "-"}C`, sourceUrl: item?.verification?.sourceUrl || null })],
];

const verificationStatusOf = (row) => String(row?.verification?.verificationStatus || "").toLowerCase();

const isVerifiedRow = (row) => verificationStatusOf(row) === "verified";

const hasValue = (value) => {
  if (!value) return false;
  const normalized = String(value).trim().toLowerCase();
  return normalized && normalized !== "in progress" && normalized !== "research needed" && normalized !== "0";
};

const toScores = (seed) => {
  const rows = Array.isArray(seed?.scorecard) ? seed.scorecard : [];
  const mapped = rows
    .filter((row) => isVerifiedRow(row))
    .filter((row) => Number.isFinite(Number(row?.score)))
    .map((row) => ({ category: String(row.category || "Score"), score: Number(row.score) }))
    .sort((a, b) => b.score - a.score);
  return mapped.slice(0, 3);
};

const overallScoreFrom = (seed, scoreSignals) => {
  const scorecard = Array.isArray(seed?.scorecard) ? seed.scorecard : [];
  const explicit = scorecard.find((row) => String(row?.category || "").toLowerCase() === "overall match");
  if (explicit && Number.isFinite(Number(explicit.score))) {
    return Math.round(Number(explicit.score));
  }
  if (scoreSignals.length > 0) {
    const avg = scoreSignals.reduce((sum, row) => sum + row.score, 0) / scoreSignals.length;
    return Math.round(avg);
  }
  return 80;
};

const toSummary = (seed, facts) => {
  const region = seed?.region ? `${seed.region}. ` : "";
  const topLine = facts.slice(0, 2).map((fact) => `${fact.label}: ${fact.value}`).join(" | ");
  return `${region}${topLine || "Destination intelligence loaded; verification details in progress."}`;
};

const dedupeFacts = (facts) => {
  const seen = new Set();
  const out = [];
  for (const fact of facts) {
    const key = `${fact.label}|${fact.value}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(fact);
  }
  return out;
};

const toFacts = (seed) => {
  const collected = [];
  for (const [key, mapper] of PRIORITY_FACT_SOURCES) {
    const rows = Array.isArray(seed?.[key]) ? seed[key] : [];
    for (const row of rows) {
      if (!isVerifiedRow(row)) continue;
      const fact = mapper(row);
      if (hasValue(fact.value)) {
        collected.push({
          label: String(fact.label),
          value: String(fact.value),
          sourceUrl: fact.sourceUrl ? String(fact.sourceUrl) : undefined,
        });
      }
      if (collected.length >= 8) break;
    }
    if (collected.length >= 8) break;
  }

  return dedupeFacts(collected).slice(0, 4);
};

const build = () => {
  const merged = JSON.parse(fs.readFileSync(mergedPath, "utf8"));
  const result = {};

  for (const [slug, seed] of Object.entries(merged)) {
    const scoreSignals = toScores(seed);
    const facts = toFacts(seed);
    const lowCoverage = facts.length < 3;
    const paddedFacts = [...facts];
    while (paddedFacts.length < 3) {
      paddedFacts.push({ label: "Verification", value: "Data verification in progress" });
    }

    result[slug] = {
      summary: toSummary(seed, paddedFacts),
      overallScore: overallScoreFrom(seed, scoreSignals),
      scoreSignals,
      facts: paddedFacts,
      lowCoverage,
      source: "merged_seed",
    };
  }

  const output = `export type GeneratedDestinationCardFacts = {\n  summary: string;\n  overallScore: number;\n  scoreSignals: Array<{ category: string; score: number }>;\n  facts: Array<{ label: string; value: string; sourceUrl?: string }>;\n  lowCoverage: boolean;\n  source: \"merged_seed\";\n};\n\nexport const generatedDestinationCardFacts: Record<string, GeneratedDestinationCardFacts> = ${JSON.stringify(result, null, 2)} as const;\n`;

  fs.writeFileSync(outputPath, output, "utf8");
  console.log(`Wrote ${Object.keys(result).length} generated card-fact records to ${outputPath}`);
};

build();
