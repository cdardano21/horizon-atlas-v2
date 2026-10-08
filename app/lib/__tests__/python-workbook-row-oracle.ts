// Unchanged release decoder retained as a test-only parity oracle.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

export const parseWorkbookRowsWithPython = (workbookPath: string) => {
  const pythonCommand = process.env.PYTHON || "python3";
  const tempDir = mkdtempSync(path.join(os.tmpdir(), "workbook-v31-"));
  const scriptPath = path.join(tempDir, "parse_workbook.py");
  const outputPath = path.join(tempDir, "parsed_workbook.json");
  const script = `
import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET

ns = {'a': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main', 'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
rel_ns = {'r': 'http://schemas.openxmlformats.org/package/2006/relationships'}

# Valid OOXML may omit a cell's <c> element entirely when it is blank - a row's
# physical cell sequence is therefore not reliable positional evidence of column
# membership. Every cell instead carries its true column in its r="A1"-style
# reference, which must be honored to avoid a left-shift once any interior cell
# is omitted (e.g. Q2 present, R2 omitted, S2 present -> S2 is NOT column R).
CELL_REF_PATTERN = re.compile(r'^([A-Za-z]+)\\d+$')

def column_letters_to_index(letters):
    index = 0
    for ch in letters.upper():
        index = index * 26 + (ord(ch) - ord('A') + 1)
    return index - 1

with zipfile.ZipFile(sys.argv[1]) as archive:
    workbook = ET.fromstring(archive.read('xl/workbook.xml'))
    sheets = workbook.find('a:sheets', ns)
    relationships = ET.fromstring(archive.read('xl/_rels/workbook.xml.rels'))
    rel_map = {rel.attrib['Id']: rel.attrib['Target'] for rel in relationships.findall('r:Relationship', rel_ns)}

    shared_strings = []
    if 'xl/sharedStrings.xml' in archive.namelist():
        shared_strings_xml = ET.fromstring(archive.read('xl/sharedStrings.xml'))
        for item in shared_strings_xml.findall('a:si', ns):
            text = ''.join(node.text or '' for node in item.iterfind('.//a:t', ns))
            shared_strings.append(text)

    rows_by_sheet = {}
    for sheet in sheets.findall('a:sheet', ns):
        name = sheet.attrib['name']
        rel_id = sheet.attrib['{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id']
        target = rel_map[rel_id]
        if not target.startswith('/'):
            target = '/' + target
        sheet_path = target.lstrip('/')
        if not sheet_path.startswith('xl/'):
            sheet_path = 'xl/' + sheet_path
        sheet_xml = ET.fromstring(archive.read(sheet_path))
        parsed_rows = []
        for row in sheet_xml.findall('.//a:sheetData/a:row', ns):
            values = []
            next_index = 0
            for cell in row.findall('a:c', ns):
                cell_type = cell.attrib.get('t')
                value_node = cell.find('a:v', ns)
                if cell_type == 's' and value_node is not None and value_node.text is not None:
                    index = int(value_node.text)
                    cell_value = shared_strings[index] if index < len(shared_strings) else ''
                elif value_node is not None and value_node.text is not None:
                    cell_value = value_node.text
                else:
                    inline = cell.find('a:is', ns)
                    if inline is not None:
                        cell_value = ''.join(node.text or '' for node in inline.iterfind('.//a:t', ns))
                    else:
                        cell_value = ''

                # Resolve this cell's true column from its r="A1"-style reference. A
                # missing/malformed reference falls back to sequential placement right
                # after the previously resolved column - defensive compatibility only,
                # never a crash, matching the deterministic-core's existing philosophy.
                cell_ref = cell.attrib.get('r')
                match = CELL_REF_PATTERN.match(cell_ref) if cell_ref else None
                col_index = column_letters_to_index(match.group(1)) if match else next_index

                while len(values) <= col_index:
                    values.append('')
                values[col_index] = cell_value  # last-write-wins on an unexpected duplicate reference
                next_index = col_index + 1
            parsed_rows.append(values)
        rows_by_sheet[name] = parsed_rows

    with open(sys.argv[2], 'w', encoding='utf-8') as handle:
        json.dump(rows_by_sheet, handle)
`;
  writeFileSync(scriptPath, script, "utf8");
  try {
    const execResult = execFileSync(pythonCommand, [scriptPath, workbookPath, outputPath], { encoding: "utf8" });
    let parsedPayload: Record<string, unknown> | null = null;

    if (typeof execResult === "string" && execResult.trim()) {
      try {
        parsedPayload = JSON.parse(execResult) as Record<string, unknown>;
      } catch {
        parsedPayload = null;
      }
    }

    if (!parsedPayload) {
      const parsedFile = JSON.parse(readFileSync(outputPath, "utf8")) as Record<string, unknown>;
      parsedPayload = parsedFile;
    }

    const sheetPayload = Object.fromEntries(Object.entries(parsedPayload).filter(([, value]) => Array.isArray(value))) as Record<string, Array<Array<string>>>;
    return {
      sheetNames: Object.keys(sheetPayload),
      sheetRows: new Map(Object.entries(sheetPayload)),
      sharedStrings: [] as string[],
      rawPayload: parsedPayload,
    };
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
};
