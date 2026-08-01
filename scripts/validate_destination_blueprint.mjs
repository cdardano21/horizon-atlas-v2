import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

const destinationsPath = resolve(repoRoot, "app/lib/destinations.ts");
const flagshipPath = resolve(repoRoot, "app/lib/flagship-destinations.ts");
const localSeedsPath = resolve(repoRoot, "app/lib/local-command-center-seeds.ts");
const regionalSeedsPath = resolve(repoRoot, "app/lib/regional-command-center-seeds.ts");
const generatedSeedsPath = resolve(repoRoot, "app/lib/generated-command-center-seeds.ts");
const destinationPagePath = resolve(repoRoot, "app/destinations/[slug]/page.tsx");
const galleryPath = resolve(repoRoot, "app/components/DestinationGallery.tsx");
const neighborhoodExplorerPath = resolve(repoRoot, "app/components/destination/NeighborhoodExplorer.tsx");

const strictMode = process.env.BLUEPRINT_STRICT === "1";

const requiredSeedFields = [
  "practicalInfo",
  "pros",
  "tradeoffs",
  "resources",
  "monthlyClimate",
  "costOfLiving",
  "neighborhoods",
];

const uiSignatures = [
  {
    filePath: destinationPagePath,
    label: "Practical Top 10 quick jump",
    needle: "Quick jump: Top 10 practical links",
  },
  {
    filePath: destinationPagePath,
    label: "Practical pinboard section",
    needle: "Practical pinboard",
  },
  {
    filePath: destinationPagePath,
    label: "Page orientation Live webcams link",
    needle: "live webcam",
  },
  {
    filePath: galleryPath,
    label: "Gallery sidebar Live webcams link",
    needle: "Live webcams",
  },
  {
    filePath: neighborhoodExplorerPath,
    label: "Neighborhood practical top chips",
    needle: "#practical-top-restaurant",
  },
];

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseDestinationSlugs = (source) => {
  const matches = [...source.matchAll(/\bslug:\s*"([^"]+)"/g)];
  return matches.map((match) => match[1]);
};

const parseFlagshipSlugs = (source) => {
  const blockMatch = source.match(/FLAGSHIP_DESTINATION_SLUGS\s*=\s*\[([\s\S]*?)\]/m);
  if (!blockMatch) return [];
  const rawBlock = blockMatch[1];
  const matches = [...rawBlock.matchAll(/"([^"]+)"/g)];
  return matches.map((match) => match[1]);
};

const extractObjectBlock = (source, openingBraceIndex) => {
  let depth = 0;
  let inString = false;
  let stringQuote = "";
  let escaped = false;

  for (let index = openingBraceIndex; index < source.length; index += 1) {
    const char = source[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === stringQuote) {
        inString = false;
      }
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      inString = true;
      stringQuote = char;
      continue;
    }

    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return source.slice(openingBraceIndex, index + 1);
      }
    }
  }

  return null;
};

const extractSeedBlockForSlug = (source, slug) => {
  const keyPattern = new RegExp(`^\\s*"${escapeRegExp(slug)}":\\s*\\{`, "m");
  const keyMatch = keyPattern.exec(source);
  if (!keyMatch || typeof keyMatch.index !== "number") return null;

  const keyStart = keyMatch.index;
  const openingBraceOffset = keyMatch[0].lastIndexOf("{");
  if (openingBraceOffset < 0) return null;

  const openingBraceIndex = keyStart + openingBraceOffset;
  return extractObjectBlock(source, openingBraceIndex);
};

const getMissingFields = (seedBlock) => {
  const missing = [];
  for (const field of requiredSeedFields) {
    const fieldPattern = new RegExp(`^\\s{4}${escapeRegExp(field)}\\s*:`, "m");
    if (!fieldPattern.test(seedBlock)) {
      missing.push(field);
    }
  }
  return missing;
};

const destinationsSource = readFileSync(destinationsPath, "utf8");
const flagshipSource = readFileSync(flagshipPath, "utf8");
const localSeedsSource = readFileSync(localSeedsPath, "utf8");
const regionalSeedsSource = readFileSync(regionalSeedsPath, "utf8");
const generatedSeedsSource = readFileSync(generatedSeedsPath, "utf8");

const destinationSlugs = parseDestinationSlugs(destinationsSource);
const flagshipSlugs = parseFlagshipSlugs(flagshipSource);

const uiIssues = [];
for (const signature of uiSignatures) {
  const source = readFileSync(signature.filePath, "utf8");
  if (!source.includes(signature.needle)) {
    uiIssues.push(`${signature.label} missing in ${signature.filePath.replace(`${repoRoot}/`, "")}`);
  }
}

const bySlug = [];
for (const slug of destinationSlugs) {
  const localBlock = extractSeedBlockForSlug(localSeedsSource, slug);
  const regionalBlock = extractSeedBlockForSlug(regionalSeedsSource, slug);
  const generatedBlock = extractSeedBlockForSlug(generatedSeedsSource, slug);

  const chosen =
    localBlock !== null
      ? { source: "local", block: localBlock }
      : regionalBlock !== null
        ? { source: "regional", block: regionalBlock }
        : generatedBlock !== null
          ? { source: "generated", block: generatedBlock }
          : null;

  if (!chosen) {
    bySlug.push({ slug, seedSource: "none", missingFields: requiredSeedFields.slice() });
    continue;
  }

  bySlug.push({
    slug,
    seedSource: chosen.source,
    missingFields: getMissingFields(chosen.block),
  });
}

const missingAny = bySlug.filter((entry) => entry.missingFields.length > 0);
const missingByFlagship = bySlug.filter(
  (entry) => flagshipSlugs.includes(entry.slug) && entry.missingFields.length > 0,
);

const hardFailures = [];
if (uiIssues.length > 0) {
  hardFailures.push(...uiIssues.map((issue) => `UI blueprint mismatch: ${issue}`));
}
if (missingByFlagship.length > 0) {
  for (const issue of missingByFlagship) {
    hardFailures.push(
      `Flagship ${issue.slug} missing Cavtat-standard data fields in ${issue.seedSource} seed: ${issue.missingFields.join(", ")}`,
    );
  }
}
if (strictMode && missingAny.length > 0) {
  for (const issue of missingAny) {
    hardFailures.push(
      `Destination ${issue.slug} missing Cavtat-standard data fields in ${issue.seedSource} seed: ${issue.missingFields.join(", ")}`,
    );
  }
}

if (hardFailures.length > 0) {
  console.error("Destination blueprint validation failed.");
  for (const failure of hardFailures) {
    console.error(`- ${failure}`);
  }
  if (!strictMode && missingAny.length > 0) {
    console.error(
      `- ${missingAny.length} destination(s) still miss one or more Cavtat-standard fields. Run with BLUEPRINT_STRICT=1 to fail on all missing fields.`,
    );
  }
  process.exit(1);
}

console.log("Destination blueprint validation passed.");
console.log(`- Shared UI signatures intact: ${uiSignatures.length}`);
console.log(`- Destination slugs checked: ${destinationSlugs.length}`);
console.log(`- Flagships fully covered: ${flagshipSlugs.length - missingByFlagship.length}/${flagshipSlugs.length}`);

if (missingAny.length > 0) {
  console.log(
    `- ${missingAny.length} destination(s) still miss one or more Cavtat-standard fields (warning mode). Enable strict mode with BLUEPRINT_STRICT=1 to block release.`,
  );

  const sample = missingAny.slice(0, 10).map((entry) => `${entry.slug} [${entry.seedSource}] => ${entry.missingFields.join(", ")}`);
  for (const line of sample) {
    console.log(`  * ${line}`);
  }
}
