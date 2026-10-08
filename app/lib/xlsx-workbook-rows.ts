import { readFileSync } from "node:fs";
import { unzipSync, strFromU8 } from "fflate";
import { DOMParser, type Element } from "@xmldom/xmldom";

const MAIN = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
const REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const PACKAGE_REL = "http://schemas.openxmlformats.org/package/2006/relationships";

function children(parent: Element, name: string, namespace = MAIN): Element[] {
  return Array.from(parent.childNodes).filter((node): node is Element =>
    node.nodeType === 1 && node.namespaceURI === namespace && node.localName === name);
}

// ElementTree's .text is the text before the first child, not all descendant text.
function initialText(element: Element | undefined): string | null {
  if (!element) return null;
  let text = "";
  for (const node of Array.from(element.childNodes)) {
    if (node.nodeType === 1) break;
    if (node.nodeType === 3 || node.nodeType === 4) text += node.nodeValue ?? "";
  }
  return text || null;
}

function richText(element: Element): string {
  return Array.from(element.getElementsByTagNameNS(MAIN, "t"))
    .map((node) => initialText(node) ?? "").join("");
}

/** Raw OOXML values, deliberately without Excel number/date formatting or formula evaluation. */
export function readXlsxWorkbookRows(workbookPath: string): Record<string, string[][]> {
  const archive = unzipSync(readFileSync(workbookPath), {
    filter: (entry) => entry.name.startsWith("xl/") && (entry.name.endsWith(".xml") || entry.name.endsWith(".rels")),
  });
  const xml = (name: string) => {
    const bytes = archive[name];
    if (!bytes) throw new Error(`Missing workbook member: ${name}`);
    const root = new DOMParser({
      normalizeLineEndings: (source) => source.replace(/\r\n?/g, "\n"),
      onError: (_level, message) => { throw new Error(message); },
    }).parseFromString(strFromU8(bytes), "application/xml").documentElement;
    if (!root) throw new Error(`Empty workbook member: ${name}`);
    return root;
  };
  const workbook = xml("xl/workbook.xml");
  const relationships = xml("xl/_rels/workbook.xml.rels");
  const targets = new Map(children(relationships, "Relationship", PACKAGE_REL)
    .map((rel) => [rel.getAttribute("Id"), rel.getAttribute("Target")]));
  const sharedStrings = archive["xl/sharedStrings.xml"]
    ? children(xml("xl/sharedStrings.xml"), "si").map(richText) : [];
  const sheets = children(workbook, "sheets")[0];
  if (!sheets) throw new Error("Workbook has no sheets element");
  const rowsBySheet: Record<string, string[][]> = {};
  for (const sheet of children(sheets, "sheet")) {
    const name = sheet.getAttribute("name");
    const target = targets.get(sheet.getAttributeNS(REL, "id"));
    if (name === null || target == null) throw new Error("Workbook sheet identity/relationship missing");
    let sheetPath = target.replace(/^\/+/, "");
    if (!sheetPath.startsWith("xl/")) sheetPath = `xl/${sheetPath}`;
    const root = xml(sheetPath);
    const rows: string[][] = [];
    for (const data of Array.from(root.getElementsByTagNameNS(MAIN, "sheetData"))) {
      for (const row of children(data, "row")) {
        const values: string[] = [];
        let nextIndex = 0;
        for (const cell of children(row, "c")) {
          const value = initialText(children(cell, "v")[0]);
          let cellValue: string;
          if (cell.getAttribute("t") === "s" && value !== null) {
            if (!/^[+-]?\d+$/.test(value.trim())) throw new Error("Invalid shared-string index");
            const index = Number(value);
            // Preserve Python indexing for negative indices as well.
            const resolved = index < 0 ? sharedStrings.length + index : index;
            if (resolved < 0) throw new Error("Shared-string index out of range");
            cellValue = sharedStrings[resolved] ?? "";
          } else if (value !== null) {
            cellValue = value;
          } else {
            const inline = children(cell, "is")[0];
            cellValue = inline ? richText(inline) : "";
          }
          const reference = cell.getAttribute("r");
          const match = reference?.match(/^([A-Za-z]+)\d+$/);
          const index = match
            ? Array.from(match[1].toUpperCase()).reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0) - 1
            : nextIndex;
          while (values.length <= index) values.push("");
          values[index] = cellValue;
          nextIndex = index + 1;
        }
        rows.push(values);
      }
    }
    Object.defineProperty(rowsBySheet, name, { value: rows, enumerable: true, configurable: true, writable: true });
  }
  return rowsBySheet;
}
