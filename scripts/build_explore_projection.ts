import { readFileSync, writeFileSync } from "node:fs";
import { EXPANSION_WORKBOOK_REGISTRY } from "../app/lib/expansion-workbook-registry";
import { loadSmartShortlistData } from "../app/lib/smart-shortlist/server-data";
import {
  EXPLORE_PROJECTION_VERSION, exploreProjectionPath, exploreSourceSignature,
  projectionDigest, selectExploreCandidate, validateExploreProjection,
  type ExploreProjection,
} from "../app/lib/explore-projection";

// Pure offline generation: the existing deterministic parser validates pinned bytes,
// schemas, ownership, source precedence and media. Publication is never baked in.
const registry = EXPANSION_WORKBOOK_REGISTRY;
const registered = new Set(registry.flatMap(entry => [...entry.expectedDestinationKeys]));
const source = await loadSmartShortlistData(registry, true);
const data = {
  candidates: source.candidates.filter(candidate => registered.has(candidate.key)).map(selectExploreCandidate),
  destinationMedia: source.destinationMedia.filter(item => registered.has(item.key)),
};
const projection: ExploreProjection = {
  version: EXPLORE_PROJECTION_VERSION,
  sourceSignature: exploreSourceSignature(registry),
  digest: projectionDigest(data),
  data,
};
validateExploreProjection(projection);
const serialized = JSON.stringify(projection, null, 2) + "\n";
if (process.argv.includes("--check")) {
  if (readFileSync(exploreProjectionPath, "utf8") !== serialized) {
    throw new Error("Explore projection differs from current validated source; regenerate before release");
  }
} else {
  writeFileSync(exploreProjectionPath, serialized);
}
console.log(`Explore projection validated: ${data.candidates.length} identities, ${registry.length} pinned workbooks`);
