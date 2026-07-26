import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const destinationsPath = path.join(repoRoot, "app/lib/destinations.ts");
const proposalPath = path.join(repoRoot, "docs/destination-expansion-proposed-300.json");

function tagify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeString(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function buildEntry(item) {
  const city = escapeString(item.city);
  const country = escapeString(item.country);
  const slug = escapeString(item.slug);
  const stateOrRegion = escapeString(item.stateOrRegion);
  const tierTag = escapeString(String(item.tierTarget || "tier-3").toLowerCase().replace(/_/g, "-"));
  const groupTag = item.additionGroup === "US" ? "united-states" : "international";
  const geoTag = item.additionGroup === "US" ? "us-market" : "global-market";
  const emoji = item.additionGroup === "US" ? "🗽" : "🌍";

  return `  {\n    slug: "${slug}",\n    city: "${city}",\n    country: "${country}",\n    emoji: "${emoji}",\n    match: 0.0,\n    description: "Research candidate in ${stateOrRegion}, ${country} for retirement relocation planning.",\n    overview: "This destination has been added through the Horizon Atlas expansion workflow. Structured verification for cost, climate, healthcare, legal residency, and taxes is in progress.",\n    climate: "Climate profile is pending structured verification through the destination data engine.",\n    lifestyle: "Lifestyle and neighborhood profile is pending structured verification through the destination data engine.",\n    transportation: "Transportation and airport-access profile is pending structured verification through the destination data engine.",\n    images: [\n      {\n        src: "",\n        alt: "${city} city view",\n        caption: "${city}, ${country}",\n      },\n    ],\n    tags: ["expansion-candidate", "research-pending", "${groupTag}", "${geoTag}", "${tierTag}", "${tagify(stateOrRegion)}"],\n    memberDetails: {\n      researchStatus: "research",\n      note: "Expansion candidate queued for structured ingestion and verification.",\n    },\n  },`;
}

function main() {
  const proposal = JSON.parse(fs.readFileSync(proposalPath, "utf8"));
  const destinationText = fs.readFileSync(destinationsPath, "utf8");

  const existingSlugs = new Set([...destinationText.matchAll(/slug:\s*"([^"]+)"/g)].map((match) => match[1]));

  const missing = proposal.filter((item) => !existingSlugs.has(item.slug));

  if (missing.length === 0) {
    console.log("No missing proposal destinations to append.");
    return;
  }

  const marker = "\n];\n\nexport const LAUNCH_CATALOG_SIZE = destinations.length;\n";
  const markerIndex = destinationText.lastIndexOf(marker);

  if (markerIndex === -1) {
    throw new Error("Could not locate destinations array terminator marker.");
  }

  const block = `\n${missing.map((item) => buildEntry(item)).join("\n")}\n`;
  const updated = `${destinationText.slice(0, markerIndex)}${block}${destinationText.slice(markerIndex)}`;

  fs.writeFileSync(destinationsPath, updated, "utf8");
  console.log(`Appended ${missing.length} destination entries to app/lib/destinations.ts.`);
}

main();
