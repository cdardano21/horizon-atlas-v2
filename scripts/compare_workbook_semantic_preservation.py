#!/usr/bin/env python3
"""
Generic, read-only semantic-preservation comparator for two .xlsx workbooks.

Proves that every sheet/header/row/cell-value/cell-type/hyperlink present in
`baseline` is unchanged in `candidate`, tolerating only an explicitly declared,
closed set of brand-new sheets which must be appended strictly after every
pre-existing sheet (never inserted in the middle, never replacing one).

Never writes to either input file. Intended as reusable tooling for any future
"vNext is a strict superset of vCurrent" workbook migration, not just this one.

Usage:
  python3 compare_workbook_semantic_preservation.py <baseline.xlsx> <candidate.xlsx> \
      [--allow-new-sheet NAME ...] [--allow-additive-rows SHEET ...]

--allow-additive-rows SHEET tolerates the candidate having MORE data rows than
the baseline in that named pre-existing sheet (e.g. PLACES gaining new rows),
as long as every baseline row is still present, unchanged, at its original
position - the extra trailing rows are otherwise unconstrained by this script.

Prints a JSON report to stdout. Exits 0 if every pre-existing item is
byte-for-byte semantically unchanged, exits 1 otherwise.
"""
import argparse
import json
import sys

import openpyxl


def normalize(value):
    if value is None:
        return None
    if isinstance(value, str):
        stripped = value.strip()
        return stripped if stripped != "" else None
    return value


def read_sheet(ws):
    """Returns (header list, list of {record, hyperlinks, types} per data row)."""
    rows_iter = ws.iter_rows()
    try:
        header_cells = next(rows_iter)
    except StopIteration:
        return [], []
    header = [normalize(c.value) for c in header_cells]

    data_rows = []
    for row in rows_iter:
        if all(normalize(c.value) is None for c in row):
            continue
        record = {}
        hyperlinks = {}
        types = {}
        for idx, cell in enumerate(row):
            name = header[idx] if idx < len(header) and header[idx] is not None else f"__col_{idx}"
            record[name] = normalize(cell.value)
            if cell.hyperlink is not None and cell.hyperlink.target:
                hyperlinks[name] = cell.hyperlink.target
            types[name] = cell.data_type
        data_rows.append({"record": record, "hyperlinks": hyperlinks, "types": types})
    return header, data_rows


def row_identity(record: dict) -> str:
    for key in ("record_key", "destination_key", "score_key", "category_key", "alias_value", "month"):
        if record.get(key):
            return f"{key}={record[key]}"
    return json.dumps(record, sort_keys=True, default=str)[:120]


def compare_sheet(sheet_name: str, base_ws, cand_ws, issues: list, allowed_metadata_bump=None, allow_additive_rows=False):
    base_header, base_rows = read_sheet(base_ws)
    cand_header, cand_rows = read_sheet(cand_ws)

    if base_header != cand_header:
        issues.append(f"[{sheet_name}] header changed: baseline={base_header} candidate={cand_header}")
        return

    if allow_additive_rows:
        if len(cand_rows) < len(base_rows):
            issues.append(f"[{sheet_name}] row count decreased (pre-existing rows removed): baseline={len(base_rows)} candidate={len(cand_rows)}")
    elif len(base_rows) != len(cand_rows):
        issues.append(f"[{sheet_name}] row count changed: baseline={len(base_rows)} candidate={len(cand_rows)}")

    shared_row_count = min(len(base_rows), len(cand_rows))
    for i in range(shared_row_count):
        base_row = base_rows[i]
        cand_row = cand_rows[i]
        if base_row == cand_row:
            continue

        # A single, explicitly-approved metadata_key/value bump (e.g. schema_version
        # "3.2" -> "3.3") is the only tolerated pre-existing-row difference - every
        # other field on the row must still match exactly.
        if allowed_metadata_bump and sheet_name == allowed_metadata_bump["sheet"]:
            key_field, key_value, value_field, old_value, new_value = (
                allowed_metadata_bump["key_field"],
                allowed_metadata_bump["key_value"],
                allowed_metadata_bump["value_field"],
                allowed_metadata_bump["old_value"],
                allowed_metadata_bump["new_value"],
            )
            base_record = base_row["record"]
            cand_record = cand_row["record"]
            if base_record.get(key_field) == key_value:
                expected_cand_record = dict(base_record)
                if base_record.get(value_field) == old_value:
                    expected_cand_record[value_field] = new_value
                    if cand_record == expected_cand_record and base_row["hyperlinks"] == cand_row["hyperlinks"] and base_row["types"] == cand_row["types"]:
                        continue

        issues.append(
            f"[{sheet_name}] row {i + 2} changed ({row_identity(base_row['record'])}): "
            f"baseline={base_row} candidate={cand_row}"
        )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("baseline")
    parser.add_argument("candidate")
    parser.add_argument("--allow-new-sheet", action="append", default=[], dest="allow_new_sheet")
    parser.add_argument("--allow-additive-rows", action="append", default=[], dest="allow_additive_rows")
    parser.add_argument(
        "--allow-metadata-bump",
        nargs=5,
        metavar=("SHEET", "KEY_FIELD", "KEY_VALUE", "OLD_VALUE", "NEW_VALUE"),
        default=None,
        help="Tolerate exactly one approved metadata value bump, e.g. WORKBOOK_METADATA metadata_key schema_version 3.2 3.3",
    )
    args = parser.parse_args()

    allowed_metadata_bump = None
    if args.allow_metadata_bump:
        sheet, key_field, key_value, old_value, new_value = args.allow_metadata_bump
        allowed_metadata_bump = {
            "sheet": sheet,
            "key_field": key_field,
            "key_value": key_value,
            "value_field": "value",
            "old_value": old_value,
            "new_value": new_value,
        }

    issues: list = []

    wb_base = openpyxl.load_workbook(args.baseline, data_only=False)
    wb_cand = openpyxl.load_workbook(args.candidate, data_only=False)

    base_sheets = list(wb_base.sheetnames)
    cand_sheets = list(wb_cand.sheetnames)
    allowed_new = set(args.allow_new_sheet)

    missing_sheets = [s for s in base_sheets if s not in cand_sheets]
    if missing_sheets:
        issues.append(f"Missing pre-existing sheet(s) in candidate: {missing_sheets}")

    new_sheets = [s for s in cand_sheets if s not in base_sheets]
    unexpected_new_sheets = [s for s in new_sheets if s not in allowed_new]
    if unexpected_new_sheets:
        issues.append(f"Unexpected new sheet(s) not covered by --allow-new-sheet: {unexpected_new_sheets}")
    missing_allowed_sheets = [s for s in allowed_new if s not in new_sheets]
    if missing_allowed_sheets:
        issues.append(f"Expected new sheet(s) not found in candidate: {missing_allowed_sheets}")

    # Pre-existing sheets, in candidate, must appear in the exact same relative
    # order as in baseline, and every new sheet must come strictly after all of
    # them (appended, never inserted/interleaved, never replacing one).
    preexisting_in_candidate_order = [s for s in cand_sheets if s in base_sheets]
    if preexisting_in_candidate_order != base_sheets:
        issues.append(
            f"Pre-existing sheet order changed: baseline={base_sheets} "
            f"candidate(pre-existing only)={preexisting_in_candidate_order}"
        )
    expected_full_order = base_sheets + new_sheets
    if cand_sheets != expected_full_order:
        issues.append(
            f"New sheet(s) are not strictly appended after every pre-existing sheet: "
            f"candidate={cand_sheets} expected={expected_full_order}"
        )

    preexisting_checked = [s for s in base_sheets if s in cand_sheets]
    allow_additive_rows_sheets = set(args.allow_additive_rows)
    for sheet_name in preexisting_checked:
        compare_sheet(
            sheet_name, wb_base[sheet_name], wb_cand[sheet_name], issues, allowed_metadata_bump,
            allow_additive_rows=sheet_name in allow_additive_rows_sheets,
        )

    new_sheet_reports = {}
    for sheet_name in new_sheets:
        header, data_rows = read_sheet(wb_cand[sheet_name])
        new_sheet_reports[sheet_name] = {"headers": header, "dataRowCount": len(data_rows)}

    report = {
        "ok": len(issues) == 0,
        "issues": issues,
        "baselineSheets": base_sheets,
        "candidateSheets": cand_sheets,
        "preexistingSheetsChecked": preexisting_checked,
        "newSheets": new_sheet_reports,
    }
    print(json.dumps(report, indent=2, default=str))
    return 0 if report["ok"] else 1


if __name__ == "__main__":
    sys.exit(main())
