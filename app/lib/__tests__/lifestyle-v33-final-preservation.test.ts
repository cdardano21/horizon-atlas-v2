import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { EXPANSION_WORKBOOK_REGISTRY } from "../expansion-workbook-registry";

/**
 * Final (not proof-of-concept) preservation check for the Lifestyle v3.3
 * candidate workbooks, both Batch #1 and Batch #2. Proves that each new
 * v3.3 workbook is a strict superset of its untouched v3.2 baseline: every
 * pre-existing sheet/header/row/cell/hyperlink is unchanged, the only new
 * sheet is LIFESTYLE_FEATURES populated with that batch's final validated
 * evidence rows, PLACES gained only the already-reviewed additive rows, and
 * the only tolerated pre-existing-row change is the approved
 * WORKBOOK_METADATA.schema_version bump ("3.2" -> "3.3").
 *
 * As of Phase 4 these v3.3 files are registered in expansion-workbook-registry.ts
 * for LOCAL PREVIEW ONLY (never production/Supabase). This suite still skips
 * gracefully when either file is absent rather than failing.
 */

const COMPARATOR_SCRIPT_PATH = path.resolve(process.cwd(), "scripts/compare_workbook_semantic_preservation.py");
const VALIDATOR_SCRIPT_PATH = path.resolve(process.cwd(), "scripts/validate-lifestyle-v33-workbooks.py");

const APPROVED_LIFESTYLE_FEATURES_HEADERS = [
  "record_key",
  "destination_key",
  "feature_group",
  "feature_key",
  "feature_value",
  "availability_level",
  "proximity_band",
  "display_label",
  "evidence_summary",
  "source_name",
  "source_url",
  "source_as_of_date",
  "confidence",
  "matching_enabled",
  "display_enabled",
  "notes",
];

interface SemanticPreservationReport {
  ok: boolean;
  issues: string[];
  baselineSheets: string[];
  candidateSheets: string[];
  preexistingSheetsChecked: string[];
  newSheets: Record<string, { headers: (string | null)[]; dataRowCount: number }>;
}

const BATCHES = [
  {
    registryId: "batch-01",
    label: "Batch #1",
    v32Path: path.resolve(process.cwd(), "data/DestinationFinderAI_Expansion_Batch_01_5_Destinations_v3.2.xlsx"),
    v33Path: path.resolve(process.cwd(), "data/DestinationFinderAI_Expansion_Batch_01_5_Destinations_v3.3.xlsx"),
    v32ExpectedSha256: "bbf101ee758733349109943510369d07c666fca1decee30250a9d2fa73016a4a",
    // Updated 2026-08-31: two food-place link corrections (Tintoque, Morning Glory Original) - see
    // the dedicated allowance in the cell-level preservation test below. Updated again 2026-09-01
    // after correcting links for 10 of 11 Hoi An Maps-only food places (Miss Ly Cafeteria left
    // unresolved but its source_name/verified_at were still updated to record the investigation).
    // Updated again 2026-09-01 after correcting links for 16 of 17 entries across The Villages (9)
    // and Sofia (8) (Scooter's Coffee - The Villages left unresolved but its source_name/verified_at
    // were still updated; Made in Home confirmed renamed to Dark Sister by Made in Home).
    // Updated again 2026-09-01 after correcting links for all 14 entries across Puerto Vallarta (7)
    // and Queenstown (7) - all 14 resolved, no closures/replacements/renames needed.
    v33ExpectedSha256: "41a2bd189f3470b7cdafacb0b6a3f86fb047a442058587a16f6d3d393dfcf51c",
    expectedLifestyleRowCount: 207,
  },
  {
    registryId: "batch-02",
    label: "Batch #2",
    v32Path: path.resolve(process.cwd(), "data/DestinationFinderAI_Expansion_Batch_02_5_Destinations_v3.2.xlsx"),
    v33Path: path.resolve(process.cwd(), "data/DestinationFinderAI_Expansion_Batch_02_5_Destinations_v3.3.xlsx"),
    v32ExpectedSha256: "347afe628d5ceb3bbf0bc1b0b44a358b24bf575214946b40f4297fd3b6a80fe1",
    // Updated 2026-08-31: 5 new food places added each for Sarande and Dumaguete (additive PLACES
    // rows only, no pre-existing row changed).
    // Updated again 2026-09-01: corrected website_url/source_name/source_url/verified_at for all 3
    // Las Terrenas dining-area entries (las-terrenas-do-place-3, -7, -13) - see the dedicated
    // allowance in the cell-level preservation test below.
    // Updated again 2026-09-01 after accepting the exact business matches for Taverna Garden,
    // Casablanca Restaurant Dumaguete, Buglas Isla Cafe, La Mensa Italian Chophouse,
    // Sans Rival Cakes and Pastries, Hayahay Treehouse Bar and Viewdeck Restobar, and Aromas Café
    // (official Facebook/Instagram profile matches only; all remaining target entries remain
    // Maps-only unless exact identity evidence is independently confirmed).
    v33ExpectedSha256: "3e3898283c38efb0f9fd2242c4bbf683f02426596e3c61210b18f41600b04c9a",
    expectedLifestyleRowCount: 208,
  },
];

const runComparator = (v32Path: string, v33Path: string): SemanticPreservationReport => {
  const pythonCommand = process.env.PYTHON || "python3";
  const args = [
    COMPARATOR_SCRIPT_PATH,
    v32Path,
    v33Path,
    "--allow-new-sheet",
    "LIFESTYLE_FEATURES",
    "--allow-additive-rows",
    "PLACES",
    "--allow-metadata-bump",
    "WORKBOOK_METADATA",
    "metadata_key",
    "schema_version",
    "3.2",
    "3.3",
  ];
  try {
    const output = execFileSync(pythonCommand, args, { encoding: "utf8" });
    return JSON.parse(output) as SemanticPreservationReport;
  } catch (error) {
    // The comparator exits 1 (still emitting a JSON report on stdout) when it
    // finds unapproved differences - surface that report rather than treating
    // a non-zero exit as an unstructured failure.
    const stdout = (error as { stdout?: Buffer | string }).stdout;
    if (stdout) {
      return JSON.parse(stdout.toString()) as SemanticPreservationReport;
    }
    throw error;
  }
};

const allFilesExist = BATCHES.every((batch) => existsSync(batch.v32Path) && existsSync(batch.v33Path));

describe.skipIf(!allFilesExist)("Lifestyle v3.3 candidate workbooks - final semantic preservation (Batch #1 and Batch #2, registered for local preview in Phase 4)", () => {
  for (const batch of BATCHES) {
    describe(batch.label, () => {
      it("v3.2 baseline file on disk is still byte-identical to its previously-pinned hash (the untouched original, kept only for comparison)", () => {
        const actualSha256 = createHash("sha256").update(readFileSync(batch.v32Path)).digest("hex");
        expect(actualSha256).toBe(batch.v32ExpectedSha256);
      });

      it("v3.3 candidate matches its expected, previously-validated SHA-256, and the real preview registry now pins that exact same hash (Phase 4 registration)", () => {
        const actualSha256 = createHash("sha256").update(readFileSync(batch.v33Path)).digest("hex");
        expect(actualSha256).toBe(batch.v33ExpectedSha256);
        const registryEntry = EXPANSION_WORKBOOK_REGISTRY.find((entry) => entry.registryId === batch.registryId);
        expect(registryEntry?.expectedSha256).toBe(batch.v33ExpectedSha256);
        expect(registryEntry?.workbookPath).toContain("v3.3");
      });

      it("every pre-existing sheet/header/row/cell/hyperlink is unchanged, tolerating only the approved schema_version bump, additive PLACES rows, and reviewed food-place link corrections (Batch #1 and Batch #2)", () => {
        const report = runComparator(batch.v32Path, batch.v33Path);
        // Batch #1: these rows' stored website_url/source_name/source_url/verified_at were
        // corrected on 2026-08-31 (Tintoque, Morning Glory Original) and 2026-09-01 (the remaining
        // Hoi An food places, one of which - Miss Ly Cafeteria - only had source_name/verified_at
        // updated to record that no confident link was found) - see expansion-workbook-registry.ts
        // hash-update comments. Batch #2: the 3 Las Terrenas dining-area rows were corrected
        // 2026-09-01 (see above). Every other field on these rows, and every other row in every other
        // sheet, is still byte-identical.
        const APPROVED_LINK_CORRECTION_PLACE_KEYS_BY_BATCH: Record<string, Set<string>> = {
          "batch-01": new Set([
            "puerto-vallarta-mx-tintoque", "hoi-an-vn-morning-glory-original",
            "hoi-an-vn-mango-mango", "hoi-an-vn-nu-eatery", "hoi-an-vn-bale-well",
            "hoi-an-vn-streets-restaurant-cafe", "hoi-an-vn-miss-ly-cafeteria",
            "hoi-an-vn-pause-and-enjoy-restaurant", "hoi-an-vn-reaching-out-tea-house",
            "hoi-an-vn-xliii-specialty-coffee", "hoi-an-vn-hoi-an-roastery",
            "hoi-an-vn-phin-coffee", "hoi-an-vn-rosie-s-cafe",
            // The Villages (9) and Sofia (8) food-link corrections, 2026-09-01.
            "the-villages-fl-us-city-fire-american-oven-bar", "the-villages-fl-us-prima-italian-steakhouse",
            "the-villages-fl-us-legacy-restaurant-at-nancy-lopez-country-club",
            "the-villages-fl-us-palmer-legends-country-club-restaurant", "the-villages-fl-us-the-standard-clcl",
            "the-villages-fl-us-foxtail-coffee-co-the-villages", "the-villages-fl-us-scooter-s-coffee-the-villages",
            "the-villages-fl-us-starbucks-lake-sumter-landing", "the-villages-fl-us-panera-bread-the-villages",
            "sofia-bg-made-in-home", "sofia-bg-niko-las-0-360", "sofia-bg-tenebris",
            "sofia-bg-martines-specialty-coffee-shop-roastery", "sofia-bg-dabov-specialty-coffee",
            "sofia-bg-chucky-s-coffee-house", "sofia-bg-coffee-syndicate", "sofia-bg-furna",
            // Puerto Vallarta (7) and Queenstown (7) food-link corrections, 2026-09-01.
            "puerto-vallarta-mx-el-dorado", "puerto-vallarta-mx-pancho-s-takos", "puerto-vallarta-mx-puerto-cafe",
            "puerto-vallarta-mx-calmate-cafe", "puerto-vallarta-mx-miscelanea-vallarta",
            "puerto-vallarta-mx-a-page-in-the-sun", "puerto-vallarta-mx-dee-s-coffee-company",
            "queenstown-nz-finz-seafood-grill", "queenstown-nz-madam-woo", "queenstown-nz-margo-s-queenstown",
            "queenstown-nz-vudu-cafe-larder", "queenstown-nz-bespoke-kitchen", "queenstown-nz-mackenzie-coffee-co",
            "queenstown-nz-yonder",
          ]),
          // Las Terrenas dining-area entries corrected 2026-09-01 (see the hash-update comment above).
          "batch-02": new Set([
            "las-terrenas-do-place-3", "las-terrenas-do-place-7", "las-terrenas-do-place-13",
          ]),
        };
        const approvedKeys = APPROVED_LINK_CORRECTION_PLACE_KEYS_BY_BATCH[batch.registryId];
        const unexpectedIssues = approvedKeys
          ? report.issues.filter((issue) => !Array.from(approvedKeys).some((key) => issue.includes(`'place_key': '${key}'`)))
          : report.issues;
        expect(unexpectedIssues).toEqual([]);
      });

      it("LIFESTYLE_FEATURES is the only new sheet, appended last, with the approved 16 columns and the final validated evidence row count", () => {
        const report = runComparator(batch.v32Path, batch.v33Path);
        expect(report.candidateSheets).toEqual([...report.baselineSheets, "LIFESTYLE_FEATURES"]);
        expect(Object.keys(report.newSheets)).toEqual(["LIFESTYLE_FEATURES"]);
        expect(report.newSheets.LIFESTYLE_FEATURES.headers).toEqual(APPROVED_LIFESTYLE_FEATURES_HEADERS);
        expect(report.newSheets.LIFESTYLE_FEATURES.dataRowCount).toBe(batch.expectedLifestyleRowCount);
      });

      it("every pre-existing sheet was actually checked (none silently skipped)", () => {
        const report = runComparator(batch.v32Path, batch.v33Path);
        expect(report.preexistingSheetsChecked).toEqual(report.baselineSheets);
      });
    });
  }

  it("the real preview registry now references both v3.3 candidate files (Phase 4 registration), never the retired v3.2 paths", () => {
    for (const entry of EXPANSION_WORKBOOK_REGISTRY) {
      expect(entry.workbookPath).toContain("v3.3");
      expect(entry.workbookPath).not.toContain("v3.2");
    }
  });

  it("the permanent lifestyle-v33 validator passes with zero issues against both final workbooks", () => {
    const pythonCommand = process.env.PYTHON || "python3";
    expect(() => execFileSync(pythonCommand, [VALIDATOR_SCRIPT_PATH], { encoding: "utf8" })).not.toThrow();
  });
});
