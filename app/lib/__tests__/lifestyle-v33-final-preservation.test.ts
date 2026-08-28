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
    v33ExpectedSha256: "2a0a7087123f9b4ff6eb57c3a20087e3ad966877bdef5bcd6a651787182499b8",
    expectedLifestyleRowCount: 207,
  },
  {
    registryId: "batch-02",
    label: "Batch #2",
    v32Path: path.resolve(process.cwd(), "data/DestinationFinderAI_Expansion_Batch_02_5_Destinations_v3.2.xlsx"),
    v33Path: path.resolve(process.cwd(), "data/DestinationFinderAI_Expansion_Batch_02_5_Destinations_v3.3.xlsx"),
    v32ExpectedSha256: "347afe628d5ceb3bbf0bc1b0b44a358b24bf575214946b40f4297fd3b6a80fe1",
    v33ExpectedSha256: "8abcd297014c88a884784e4f1bd2169141f3fda5750ebab36d6943c2c6925a03",
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

      it("every pre-existing sheet/header/row/cell/hyperlink is unchanged, tolerating only the approved schema_version bump and additive PLACES rows", () => {
        const report = runComparator(batch.v32Path, batch.v33Path);
        expect(report.issues).toEqual([]);
        expect(report.ok).toBe(true);
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
