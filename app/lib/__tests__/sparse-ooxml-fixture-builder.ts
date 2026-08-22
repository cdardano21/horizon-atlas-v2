import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * Builds a minimal, valid synthetic XLSX file for testing the deterministic
 * parser's sparse-OOXML column alignment, giving full control over exactly
 * which `<c>` elements physically exist in a row (bypassing any spreadsheet
 * library's own cell-omission heuristics). READ-ONLY / test-only utility -
 * never touches a real workbook file.
 */

export interface SparseCellSpec {
  /** Excel-style column reference, e.g. "A", "S", "AA". */
  readonly col: string;
  readonly value: string;
  /** Defaults to "inline" (t="inlineStr"). "shared" resolves through sharedStrings.xml. "bool" writes t="b" with the raw "1"/"0" dialect. "number" writes a typeless numeric cell. */
  readonly type?: "inline" | "shared" | "bool" | "number";
  /** Omit the r="..." attribute entirely, to test the malformed/missing-reference fallback. */
  readonly omitRef?: boolean;
}

export interface SparseRowSpec {
  readonly rowNumber: number;
  readonly cells: readonly SparseCellSpec[];
}

const REQUIRED_SHEETS = ["DESTINATIONS", "DESTINATION_FACTS", "DESTINATION_SCORES", "IMPORT_CONTRACT", "PILOT_STATUS", "WORKBOOK_METADATA", "IMPORT_MANIFEST", "DESTINATION_ALIASES", "VALIDATION_RULES", "DATA_DICTIONARY"];

function buildRowXml(rowSpec: SparseRowSpec, sharedStrings: string[]): string {
  const cellsXml = rowSpec.cells
    .map((cell) => {
      const ref = cell.omitRef ? "" : ` r="${cell.col}${rowSpec.rowNumber}"`;
      if (cell.type === "shared") {
        let index = sharedStrings.indexOf(cell.value);
        if (index === -1) {
          sharedStrings.push(cell.value);
          index = sharedStrings.length - 1;
        }
        return `<c${ref} t="s"><v>${index}</v></c>`;
      }
      if (cell.type === "bool") {
        return `<c${ref} t="b"><v>${cell.value}</v></c>`;
      }
      if (cell.type === "number") {
        return `<c${ref}><v>${cell.value}</v></c>`;
      }
      return `<c${ref} t="inlineStr"><is><t>${cell.value}</t></is></c>`;
    })
    .join("");
  return `<row r="${rowSpec.rowNumber}">${cellsXml}</row>`;
}

/**
 * `sheetRowSpecs` maps sheet name -> the exact rows/cells to physically write.
 * Any of the 10 workbook-contract-required sheets not supplied gets a trivial
 * one-column header row so the loader's required-sheet check passes; WORKBOOK_METADATA
 * always gets a schema_version=3.1 row appended automatically.
 */
export function buildSparseTestWorkbook(sheetRowSpecs: Record<string, SparseRowSpec[]>): string {
  const tempDir = mkdtempSync(path.join(os.tmpdir(), "sparse-ooxml-fixture-"));
  const outputPath = path.join(tempDir, "fixture.xlsx");
  const specPath = path.join(tempDir, "spec.json");
  const scriptPath = path.join(tempDir, "build_fixture.py");

  const sharedStrings: string[] = [];
  const finalSheets: Record<string, string[]> = {};

  for (const sheetName of REQUIRED_SHEETS) {
    const rows = sheetRowSpecs[sheetName];
    if (rows) {
      finalSheets[sheetName] = rows.map((row) => buildRowXml(row, sharedStrings));
    } else if (sheetName === "WORKBOOK_METADATA") {
      finalSheets[sheetName] = [
        buildRowXml({ rowNumber: 1, cells: [{ col: "A", value: "metadata_key" }, { col: "B", value: "value" }] }, sharedStrings),
        buildRowXml({ rowNumber: 2, cells: [{ col: "A", value: "schema_version" }, { col: "B", value: "3.1" }] }, sharedStrings),
      ];
    } else {
      finalSheets[sheetName] = [buildRowXml({ rowNumber: 1, cells: [{ col: "A", value: "x" }] }, sharedStrings)];
    }
  }
  // Any extra, non-required sheet supplied by the caller (e.g. a dedicated probe sheet).
  for (const [sheetName, rows] of Object.entries(sheetRowSpecs)) {
    if (!REQUIRED_SHEETS.includes(sheetName)) {
      finalSheets[sheetName] = rows.map((row) => buildRowXml(row, sharedStrings));
    }
  }

  writeFileSync(specPath, JSON.stringify({ sheets: finalSheets, sharedStrings }), "utf8");

  const script = `
import json
import sys
import zipfile

with open(sys.argv[1], encoding="utf-8") as handle:
    spec = json.load(handle)

sheets = list(spec["sheets"].items())
shared_strings = spec["sharedStrings"]

content_types = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
                  '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
                  '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
                  '<Default Extension="xml" ContentType="application/xml"/>',
                  '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>']
for i in range(len(sheets)):
    content_types.append(f'<Override PartName="/xl/worksheets/sheet{i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>')
content_types.append('<Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>')
content_types.append('</Types>')

root_rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'

workbook_xml = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
                '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">',
                '<sheets>']
for i, (name, _rows) in enumerate(sheets):
    workbook_xml.append(f'<sheet name="{name}" sheetId="{i+1}" r:id="rId{i+1}"/>')
workbook_xml.append('</sheets></workbook>')

workbook_rels = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
                  '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">']
for i in range(len(sheets)):
    workbook_rels.append(f'<Relationship Id="rId{i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet{i+1}.xml"/>')
workbook_rels.append(f'<Relationship Id="rId{len(sheets)+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>')
workbook_rels.append('</Relationships>')

shared_strings_xml = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
                      f'<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="{len(shared_strings)}" uniqueCount="{len(shared_strings)}">']
for s in shared_strings:
    shared_strings_xml.append(f'<si><t>{s}</t></si>')
shared_strings_xml.append('</sst>')

with zipfile.ZipFile(sys.argv[2], "w", zipfile.ZIP_STORED) as z:
    z.writestr("[Content_Types].xml", "".join(content_types))
    z.writestr("_rels/.rels", root_rels)
    z.writestr("xl/workbook.xml", "".join(workbook_xml))
    z.writestr("xl/_rels/workbook.xml.rels", "".join(workbook_rels))
    z.writestr("xl/sharedStrings.xml", "".join(shared_strings_xml))
    for i, (name, rows) in enumerate(sheets):
        sheet_xml = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                     '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
                     '<sheetData>' + "".join(rows) + '</sheetData></worksheet>')
        z.writestr(f"xl/worksheets/sheet{i+1}.xml", sheet_xml)
`;
  writeFileSync(scriptPath, script, "utf8");
  execFileSync(process.env.PYTHON || "python3", [scriptPath, specPath, outputPath], { encoding: "utf8" });
  return outputPath;
}
