import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const destinationsPath = resolve(repoRoot, "app/lib/destinations.ts");
const curatedPath = resolve(repoRoot, "app/lib/curatedCityImages.ts");

const MIN_DESTINATIONS = Number.parseInt(process.env.MIN_DESTINATIONS ?? "300", 10);
const TOP_N = Number.parseInt(process.env.TOP_N ?? "50", 10);
const MIN_TOP_COVERAGE = Number.parseInt(process.env.MIN_TOP_COVERAGE ?? "50", 10);

const destinationsSource = readFileSync(destinationsPath, "utf8");
const curatedSource = readFileSync(curatedPath, "utf8");

const slugMatches = [...destinationsSource.matchAll(/\bslug:\s*"([^"]+)"/g)];
const destinationSlugs = slugMatches.map((match) => match[1]);

const curatedMatches = [...curatedSource.matchAll(/^\s*"([^"]+)":\s*"[^"]+",?\s*$/gm)];
const curatedSlugs = new Set(curatedMatches.map((match) => match[1]));

const topSlugs = destinationSlugs.slice(0, TOP_N);
const coveredTopSlugs = topSlugs.filter((slug) => curatedSlugs.has(slug));
const missingTopSlugs = topSlugs.filter((slug) => !curatedSlugs.has(slug));

const issues = [];

if (destinationSlugs.length < MIN_DESTINATIONS) {
  issues.push(
    `Destination count too low: ${destinationSlugs.length} (minimum ${MIN_DESTINATIONS}).`
  );
}

if (topSlugs.length < TOP_N) {
  issues.push(`Top slice too small: ${topSlugs.length} (expected at least ${TOP_N}).`);
}

if (coveredTopSlugs.length < MIN_TOP_COVERAGE) {
  issues.push(
    `Top-${TOP_N} curated coverage too low: ${coveredTopSlugs.length}/${topSlugs.length} (minimum ${MIN_TOP_COVERAGE}).`
  );
}

if (issues.length > 0) {
  console.error("Catalog quality check failed.");
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  if (missingTopSlugs.length > 0) {
    console.error(`- Missing curated slugs: ${missingTopSlugs.join(", ")}`);
  }
  process.exit(1);
}

console.log("Catalog quality check passed.");
console.log(`- Destinations: ${destinationSlugs.length}`);
console.log(`- Top-${TOP_N} curated coverage: ${coveredTopSlugs.length}/${topSlugs.length}`);
