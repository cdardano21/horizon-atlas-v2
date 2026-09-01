"""
Bounded Batch 20 public-text polish: removes internal editorial/research-instruction language that
leaked into reader-facing prose fields (all 20 destinations), without touching numeric costs,
scores, media, recommendations/resources, or legitimate reader-facing cautions (e.g. "confirm
before travel"/"before relocation" is untouched - only the internal "before publication"-style
process references and pure research-instruction sentences are removed).

Two transforms, applied sentence-by-sentence:
1. STRIP_SUFFIX phrases ("before publication" and its "directly before publication" variant): the
   internal trailing qualifier is removed, the rest of the (still-useful) sentence is kept.
2. REMOVE_SENTENCE phrases ("must be extracted", "research seed", "specific items to confirm"):
   the whole sentence is a research-instruction with no reader-facing content, so it is dropped
   entirely. If removing it empties the field, the field is left blank (never a fabricated filler).
"""

import re

import openpyxl

WORKBOOK_PATH = "data/legacy-migration-batch-20/DestinationFinderAI_Legacy_Production_Batch_20_Reader_Ready_Authoritative_v3.3.xlsx"

KEYS = [
    "ajijic-mexico", "boquete-panama", "chiang-mai-thailand", "cuenca-ecuador", "da-nang-vietnam",
    "florianopolis-brazil", "funchal-portugal", "george-town-malaysia", "hua-hin-thailand", "lucca-italy",
    "merida-mexico", "monopoli-italy", "montevideo-uruguay", "nafplio-greece", "nice-france",
    "palm-springs-california-united-states", "paphos-cyprus", "santander-spain",
    "savannah-georgia-united-states", "sibenik-croatia",
]

REMOVE_SENTENCE_PHRASES = ["must be extracted", "research seed", "specific items to confirm"]
STRIP_SUFFIX_PHRASE = "before publication"

PROVENANCE_COLUMNS = {"source_name", "source_url", "verified", "verified_at", "confidence", "record_key", "destination_key", "methodology_version"}
SKIP_SHEETS = {
    "README", "CATEGORIES", "SCORING_DIMENSIONS", "STAY_MODES", "SCHEMA_INDEX", "PREMIUM_REQUIREMENTS",
    "CHANGELOG", "PILOT_STATUS", "IMPORT_CONTRACT", "WORKBOOK_METADATA", "IMPORT_MANIFEST",
    "DESTINATION_ALIASES", "VALIDATION_RULES", "DATA_DICTIONARY",
}

SENTENCE_SPLIT_RE = re.compile(r"(?<=[a-zA-Z0-9\)%])\.\s+(?=[A-Z])")
STRIP_RE_1 = re.compile(r"\s*directly\s+before publication\b", re.IGNORECASE)
STRIP_RE_2 = re.compile(r"\s*before publication\b", re.IGNORECASE)


def split_sentences(text):
    parts = SENTENCE_SPLIT_RE.split(text)
    sentences = []
    for i, part in enumerate(parts):
        if i < len(parts) - 1:
            sentences.append(part + ".")
        else:
            sentences.append(part)
    return sentences


def clean_sentence(sentence):
    lower = sentence.lower()
    if any(phrase in lower for phrase in REMOVE_SENTENCE_PHRASES):
        return None
    if STRIP_SUFFIX_PHRASE in lower:
        cleaned = STRIP_RE_1.sub("", sentence)
        cleaned = STRIP_RE_2.sub("", cleaned)
        cleaned = cleaned.rstrip()
        if cleaned and not cleaned.endswith((".", "!", "?")):
            cleaned += "."
        return cleaned if cleaned.strip(" .") else None
    return sentence


def clean_field(value):
    if not isinstance(value, str) or not value.strip():
        return value, False
    lower = value.lower()
    if not any(phrase in lower for phrase in REMOVE_SENTENCE_PHRASES + [STRIP_SUFFIX_PHRASE]):
        return value, False
    sentences = split_sentences(value)
    cleaned_sentences = [clean_sentence(s) for s in sentences]
    cleaned_sentences = [s for s in cleaned_sentences if s and s.strip()]
    result = " ".join(cleaned_sentences).strip()
    return (result if result else None), True


def main(dry_run=True):
    wb = openpyxl.load_workbook(WORKBOOK_PATH, data_only=False)
    total_changed = 0
    per_sheet = {}
    for sheet_name in wb.sheetnames:
        if sheet_name in SKIP_SHEETS:
            continue
        ws = wb[sheet_name]
        header = [c.value for c in ws[1]] if ws.max_row >= 1 else []
        if "destination_key" not in header:
            continue
        idx = {h: i for i, h in enumerate(header) if h}
        dk_col = idx["destination_key"]
        changed_here = 0
        for row in ws.iter_rows(min_row=2):
            if dk_col >= len(row):
                continue
            dest_key = row[dk_col].value
            if dest_key not in KEYS:
                continue
            for col_name, col_i in idx.items():
                if col_name in PROVENANCE_COLUMNS or col_i >= len(row):
                    continue
                cell = row[col_i]
                new_value, changed = clean_field(cell.value)
                if changed:
                    changed_here += 1
                    total_changed += 1
                    if dry_run:
                        print(f"[{sheet_name}] dest={dest_key} col={col_name}")
                        print(f"  OLD: {cell.value!r}")
                        print(f"  NEW: {new_value!r}\n")
                    else:
                        cell.value = new_value
        if changed_here:
            per_sheet[sheet_name] = changed_here

    print(f"{'[DRY RUN] ' if dry_run else ''}Total cells changed: {total_changed}")
    for sheet_name, count in sorted(per_sheet.items(), key=lambda item: -item[1]):
        print(f"  {sheet_name}: {count}")

    if not dry_run:
        wb.save(WORKBOOK_PATH)
        print("Saved.")


if __name__ == "__main__":
    import sys

    main(dry_run="--apply" not in sys.argv)
