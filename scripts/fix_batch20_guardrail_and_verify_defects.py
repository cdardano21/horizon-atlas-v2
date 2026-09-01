"""
Isolated Batch 20 data-defect correction (3 destinations: chiang-mai-thailand,
george-town-malaysia, hua-hin-thailand): removes rows that mistakenly treated an internal
population-boundary-methodology caveat as if it were a real named place/resource/transport-topic
("Population Boundary Guardrail"). These rows have zero legitimate reader-facing content (they are
not a real transport facility or resource), so they are removed rather than merely reworded.
Also strips the "final records must verify ..." internal-instruction sentence found in
george-town-malaysia content (same sentence-level pattern as the prior internal-instruction pass).
"""

import re

import openpyxl

WORKBOOK_PATH = "data/legacy-migration-batch-20/DestinationFinderAI_Legacy_Production_Batch_20_Reader_Ready_Authoritative_v3.3.xlsx"

GUARDRAIL_TOPIC = "population_boundary_guardrail"
GUARDRAIL_NAME = "population boundary guardrail"

SENTENCE_SPLIT_RE = re.compile(r"(?<=[a-zA-Z0-9\)%])\.\s+(?=[A-Z])")


def split_sentences(text):
    parts = SENTENCE_SPLIT_RE.split(text)
    return [part + "." if i < len(parts) - 1 else part for i, part in enumerate(parts)]


def strip_final_records_sentence(value):
    if not isinstance(value, str) or "final records must verify" not in value.lower():
        return value, False
    sentences = split_sentences(value)
    kept = [s for s in sentences if "final records must verify" not in s.lower()]
    result = " ".join(kept).strip()
    return (result if result else None), True


def main():
    wb = openpyxl.load_workbook(WORKBOOK_PATH)
    removed_rows = 0

    # --- Remove fake TRANSPORT_AIRPORTS / RESOURCES rows keyed by the guardrail topic ---
    for sheet_name, topic_col, name_col in [
        ("TRANSPORT_AIRPORTS", "topic", "name"),
        ("RESOURCES", None, "resource_name"),
    ]:
        ws = wb[sheet_name]
        header = [c.value for c in ws[1]]
        idx = {h: i for i, h in enumerate(header) if h}
        rows_to_delete = []
        for row in ws.iter_rows(min_row=2):
            name_value = row[idx[name_col]].value if idx.get(name_col) is not None else None
            topic_value = row[idx[topic_col]].value if topic_col and idx.get(topic_col) is not None else None
            if (isinstance(name_value, str) and GUARDRAIL_NAME in name_value.lower()) or (isinstance(topic_value, str) and topic_value == GUARDRAIL_TOPIC):
                rows_to_delete.append(row[0].row)
        for row_num in sorted(rows_to_delete, reverse=True):
            ws.delete_rows(row_num, 1)
            removed_rows += 1
        print(f"{sheet_name}: removed {len(rows_to_delete)} guardrail row(s)")

    # --- Blank the same-topic DESTINATION_FACTS rows (unused by any lookup, but tidy anyway) ---
    ws = wb["DESTINATION_FACTS"]
    header = [c.value for c in ws[1]]
    idx = {h: i for i, h in enumerate(header) if h}
    rows_to_delete = []
    for row in ws.iter_rows(min_row=2):
        fact_key = row[idx["fact_key"]].value if idx.get("fact_key") is not None else None
        if fact_key == GUARDRAIL_TOPIC:
            rows_to_delete.append(row[0].row)
    for row_num in sorted(rows_to_delete, reverse=True):
        ws.delete_rows(row_num, 1)
        removed_rows += 1
    print(f"DESTINATION_FACTS: removed {len(rows_to_delete)} guardrail row(s)")

    # --- Strip "final records must verify ..." sentences wherever they appear ---
    changed_sentences = 0
    for sheet_name in wb.sheetnames:
        ws = wb[sheet_name]
        header = [c.value for c in ws[1]] if ws.max_row >= 1 else []
        if "destination_key" not in header:
            continue
        idx = {h: i for i, h in enumerate(header) if h}
        for row in ws.iter_rows(min_row=2):
            for col_name, col_i in idx.items():
                if col_name in {"source_name", "source_url", "verified", "verified_at", "confidence"} or col_i >= len(row):
                    continue
                cell = row[col_i]
                new_value, changed = strip_final_records_sentence(cell.value)
                if changed:
                    cell.value = new_value
                    changed_sentences += 1

    print(f"Stripped 'final records must verify' sentence from {changed_sentences} cell(s)")
    print(f"Total rows removed: {removed_rows}")
    wb.save(WORKBOOK_PATH)


if __name__ == "__main__":
    main()
