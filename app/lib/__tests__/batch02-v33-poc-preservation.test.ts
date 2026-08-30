import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { EXPANSION_WORKBOOK_REGISTRY } from "../expansion-workbook-registry";

/**
 * Phase 1 proof-of-concept preservation check for the v3.3 lifestyle-data
 * expansion (Batch #2 only). Proves that the new, LOCAL-ONLY, not-yet-registered
 * v3.3 proof-of-concept workbook is a strict superset of the untouched v3.2
 * baseline: every pre-existing sheet/header/row/cell/hyperlink is unchanged,
 * the only new sheet is LIFESTYLE_FEATURES (header row only, zero data rows),
 * and the only tolerated pre-existing-row change is the approved
 * WORKBOOK_METADATA.schema_version bump ("3.2" -> "3.3").
 *
 * The v3.3 PoC file is intentionally not committed (this phase is
 * structure-only, pre-approval), so this suite skips gracefully when it is
 * absent (e.g. a fresh clone or CI) rather than failing.
 */

const BATCH02_V32_PATH = path.resolve(process.cwd(), "data/DestinationFinderAI_Expansion_Batch_02_5_Destinations_v3.2.xlsx");
const BATCH02_V33_POC_PATH = path.resolve(process.cwd(), "data/DestinationFinderAI_Expansion_Batch_02_5_Destinations_v3.3_POC.xlsx");
const COMPARATOR_SCRIPT_PATH = path.resolve(process.cwd(), "scripts/compare_workbook_semantic_preservation.py");

const BATCH02_V32_EXPECTED_SHA256 = "347afe628d5ceb3bbf0bc1b0b44a358b24bf575214946b40f4297fd3b6a80fe1";

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

const runComparator = (): SemanticPreservationReport => {
  const pythonCommand = process.env.PYTHON || "python3";
  const args = [
    COMPARATOR_SCRIPT_PATH,
    BATCH02_V32_PATH,
    BATCH02_V33_POC_PATH,
    "--allow-new-sheet",
    "LIFESTYLE_FEATURES",
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

const pocFileExists = existsSync(BATCH02_V33_POC_PATH);

describe.skipIf(!pocFileExists)("Batch #2 v3.3 proof-of-concept - semantic preservation (Phase 1, not yet registered)", () => {
  it("v3.2 Batch #2 baseline file on disk is still byte-identical to its previously-pinned hash (the untouched original, kept only for comparison)", () => {
    const actualSha256 = createHash("sha256").update(readFileSync(BATCH02_V32_PATH)).digest("hex");
    expect(actualSha256).toBe(BATCH02_V32_EXPECTED_SHA256);
  });

  it("the real registry does not reference the superseded v3.3 proof-of-concept file (the final, approved v3.3 file is registered instead)", () => {
    for (const entry of EXPANSION_WORKBOOK_REGISTRY) {
      expect(entry.workbookPath).not.toContain("v3.3_POC");
    }
  });

  it("every pre-existing sheet/header/row/cell/hyperlink is unchanged, with only the approved schema_version bump", () => {
    const report = runComparator();
    expect(report.issues).toEqual([]);
    expect(report.ok).toBe(true);
  });

  it("LIFESTYLE_FEATURES is the only new sheet, appended last, header-only with the approved 16 columns", () => {
    const report = runComparator();
    expect(report.candidateSheets).toEqual([...report.baselineSheets, "LIFESTYLE_FEATURES"]);
    expect(Object.keys(report.newSheets)).toEqual(["LIFESTYLE_FEATURES"]);
    expect(report.newSheets.LIFESTYLE_FEATURES.headers).toEqual(APPROVED_LIFESTYLE_FEATURES_HEADERS);
    expect(report.newSheets.LIFESTYLE_FEATURES.dataRowCount).toBe(0);
  });

  it("every pre-existing sheet was actually checked (none silently skipped)", () => {
    const report = runComparator();
    expect(report.preexistingSheetsChecked).toEqual(report.baselineSheets);
  });
});
