import { createHash } from "node:crypto";
import type { DeterministicV31CanonicalDestination } from "../workbook-v31-deterministic-core";
import { hasRequiredOceanBeach, type BeachAccessEvidence } from "./beach-access";

type ReviewedBeachRecord = {
  readonly destinationKey: string;
  readonly registryId: string;
  readonly workbookSha256: string;
  readonly module: "facts" | "places" | "lifestyleFeatures";
  readonly recordKey: string;
  readonly recordSha256: string;
  readonly beachName: string;
};

// Explicit record-level review, not geographic inference. Classification applies only
// to these exact authored records in these exact pinned workbooks. Workbook revisions
// require a new evidence review; registration alone never grants beach qualification.
// Seasonal swimming safety/accessibility are not asserted by this access contract.
const reviewedRecords: readonly ReviewedBeachRecord[] = [
  {
    "destinationKey": "da-nang-vietnam",
    "registryId": "legacy-batch-20",
    "workbookSha256": "2d02e7932574caee95f955d9d900d3de65bf8a96ac258ddaf717f64f005dff10",
    "module": "facts",
    "recordKey": "beach_access_guardrail",
    "recordSha256": "a237738e225a29ac5dcbacfc5f92cb379a475f9f9ee2daaad228720b59f2cef8",
    "beachName": "My Khe; Non Nuoc"
  },
  {
    "destinationKey": "funchal-portugal",
    "registryId": "legacy-batch-20",
    "workbookSha256": "2d02e7932574caee95f955d9d900d3de65bf8a96ac258ddaf717f64f005dff10",
    "module": "facts",
    "recordKey": "urban_beach",
    "recordSha256": "8dedf5593061c6438ed5c6ec44447e0c311eb0eb19ec4fadc085179a6ec38231",
    "beachName": "São Tiago Beach"
  },
  {
    "destinationKey": "hua-hin-thailand",
    "registryId": "legacy-batch-20",
    "workbookSha256": "2d02e7932574caee95f955d9d900d3de65bf8a96ac258ddaf717f64f005dff10",
    "module": "facts",
    "recordKey": "beach_resort_lifestyle",
    "recordSha256": "9bab11404cd15f54d7202a1b6a900464c217528c65b6ed9966279c60b94a1259",
    "beachName": "Hua Hin Beach"
  },
  {
    "destinationKey": "monopoli-italy",
    "registryId": "legacy-batch-20",
    "workbookSha256": "2d02e7932574caee95f955d9d900d3de65bf8a96ac258ddaf717f64f005dff10",
    "module": "facts",
    "recordKey": "individual_beaches_and_access",
    "recordSha256": "429c15f32333e57736524ccb99389a8d8c4b1c21849f24b8935550a10cc67900",
    "beachName": "Porto Bianco; Porto Rosso"
  },
  {
    "destinationKey": "nafplio-greece",
    "registryId": "legacy-batch-20",
    "workbookSha256": "2d02e7932574caee95f955d9d900d3de65bf8a96ac258ddaf717f64f005dff10",
    "module": "facts",
    "recordKey": "beaches",
    "recordSha256": "1842f8e5ca7f514bf0fe07c9ac7bb1250bfe9f90a422d82f659eb030065c8c22",
    "beachName": "Arvanitia"
  },
  {
    "destinationKey": "nice-france",
    "registryId": "legacy-batch-20",
    "workbookSha256": "2d02e7932574caee95f955d9d900d3de65bf8a96ac258ddaf717f64f005dff10",
    "module": "facts",
    "recordKey": "public_beach_and_accessibility_inventory",
    "recordSha256": "1fbcab83a94892c781c5d72ff64b6234c65f2903524e6317933fece96a34be84",
    "beachName": "Carras; Centenaire"
  },
  {
    "destinationKey": "paphos-cyprus",
    "registryId": "legacy-batch-20",
    "workbookSha256": "2d02e7932574caee95f955d9d900d3de65bf8a96ac258ddaf717f64f005dff10",
    "module": "facts",
    "recordKey": "beach_and_swimming",
    "recordSha256": "377d6c7a9442622bc9382da9e29cff86b66988c48c8367d492aa8c413d325f2e",
    "beachName": "Faros Beach"
  },
  {
    "destinationKey": "santander-spain",
    "registryId": "legacy-batch-20",
    "workbookSha256": "2d02e7932574caee95f955d9d900d3de65bf8a96ac258ddaf717f64f005dff10",
    "module": "facts",
    "recordKey": "surfing_and_beach_sport",
    "recordSha256": "f26c765a4c2ea9be84766544a2a9cdfa643ab8166d610c80458103e15bcf16c2",
    "beachName": "Second Sardinero"
  },
  {
    "destinationKey": "noosa-heads-australia",
    "registryId": "non-legacy-pilot-05",
    "workbookSha256": "4d298b1883608c8a08e7b2a6f04fce91fca4aa9d738b96e006dd446e9a1bb2a3",
    "module": "lifestyleFeatures",
    "recordKey": "swimming",
    "recordSha256": "565408ffe104920c2e03d106d7f44e1e1bc4e42e0c0fdafcb244e9dd74628734",
    "beachName": "Noosa Main Beach"
  },
  {
    "destinationKey": "the-hague-netherlands",
    "registryId": "legacy-pilot06-populated",
    "workbookSha256": "91bcc28a9df767d20831c698c841fa8ab42e499914f0fc524e87479a07db6373",
    "module": "places",
    "recordKey": "the-hague-netherlands-scheveningen-beach",
    "recordSha256": "aed54067eb71130b039855dd19049ee79f8606691f518568a513c70c3517b2bc",
    "beachName": "Scheveningen Beach"
  }
];

/** Call only after the existing registry ownership and workbook SHA checks. */
export function reviewedWorkbookBeachEvidence(
  destination: DeterministicV31CanonicalDestination,
  registryId: string,
  validatedWorkbookSha256: string,
): BeachAccessEvidence | undefined {
  const review = reviewedRecords.find((item) => item.destinationKey === destination.identity.destinationKey
    && item.registryId === registryId && item.workbookSha256 === validatedWorkbookSha256);
  if (!review) return undefined;
  const records = review.module === "facts"
    ? destination.facts.filter((row) => row.fact_key === review.recordKey)
    : review.module === "places"
      ? destination.places.filter((row) => row.place_key === review.recordKey)
      : destination.lifestyleFeatures.filter((row) => row.feature_key === review.recordKey);
  if (records.length !== 1) return undefined;
  const record = records[0];
  if (record.destination_key !== destination.identity.destinationKey) return undefined;
  const recordHash = createHash("sha256")
    .update(JSON.stringify(Object.entries(record).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)))
    .digest("hex");
  if (recordHash !== review.recordSha256) return undefined;
  // Some older lifestyle sheets retain these raw columns without declaring them
  // on the common lifestyle interface. Narrow their actual values; never infer them.
  if (!("verified" in record) || record.verified !== "1"
    || !("verified_at" in record) || typeof record.verified_at !== "string"
    || !record.source_name || !record.source_url) return undefined;
  const evidence: BeachAccessEvidence = {
    accessType: "OCEAN_BEACH_DESTINATION",
    beachName: review.beachName,
    driveMinutes: null,
    waterType: "OCEAN_SEA",
    verified: true,
    sourceName: record.source_name,
    sourceUrl: record.source_url,
    verifiedAt: record.verified_at,
  };
  return hasRequiredOceanBeach(evidence) ? evidence : undefined;
}
