#!/usr/bin/env node

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { buildAdoptionPlan } from "./lib/media-candidate-pipeline.mjs";

function requiredArg(name) {
  const prefix = `--${name}=`;
  const argument = process.argv.slice(2).find((item) => item.startsWith(prefix));
  if (!argument) throw new Error(`Missing required --${name}=... argument`);
  return argument.slice(prefix.length);
}

async function main() {
  const manifestPath = resolve(requiredArg("manifest"));
  const outputPath = resolve(requiredArg("out"));
  const reviewer = requiredArg("reviewer");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const plan = buildAdoptionPlan(manifest, reviewer, new Date().toISOString());

  if (plan.destinations.length === 0) {
    throw new Error("No explicitly approved candidates are available for adoption");
  }

  await mkdir(resolve(outputPath, ".."), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(plan, null, 2)}\n`, "utf8");
  console.log(`Adoption plan written: ${outputPath}`);
  console.log(`Approved destinations in plan: ${plan.destinations.length}`);
  console.log("Production media altered: NO");
  console.log("A separate reviewed implementation change is required to update runtime maps.");
}

main().catch((error) => {
  console.error("build_destination_media_adoption_plan failed", error);
  process.exitCode = 1;
});
