#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { reviewCandidate } from "./lib/media-candidate-pipeline.mjs";

function requiredArg(name) {
  const prefix = `--${name}=`;
  const argument = process.argv.slice(2).find((item) => item.startsWith(prefix));
  if (!argument) throw new Error(`Missing required --${name}=... argument`);
  return argument.slice(prefix.length);
}

async function main() {
  const manifestPath = resolve(requiredArg("manifest"));
  const candidateId = requiredArg("candidate");
  const decision = requiredArg("decision");
  const reviewer = requiredArg("reviewer");
  const reasonArgument = process.argv.slice(2).find((item) => item.startsWith("--reason="));
  const reason = reasonArgument ? reasonArgument.slice("--reason=".length) : null;
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const index = manifest.candidates.findIndex((candidate) => candidate.candidateId === candidateId);
  if (index < 0) throw new Error(`Candidate not found: ${candidateId}`);

  manifest.candidates[index] = reviewCandidate(
    manifest.candidates[index],
    decision,
    reviewer,
    new Date().toISOString(),
    reason,
  );
  manifest.lastReviewedAt = manifest.candidates[index].review.reviewedAt;
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`${candidateId}: ${decision} by ${reviewer}`);
  console.log("Production media altered: NO");
}

main().catch((error) => {
  console.error("review_destination_media_candidate failed", error);
  process.exitCode = 1;
});
