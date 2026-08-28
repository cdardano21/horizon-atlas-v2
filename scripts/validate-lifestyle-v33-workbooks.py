"""
Permanent, reusable validator for the Lifestyle v3.3 candidate workbooks.

Reads the controlled taxonomy exclusively from the tracked canonical file
data/lifestyle-v33/feature-taxonomy.json (never from tmp/ scratch work), and
validates each v3.3 workbook directly against its corresponding
data/lifestyle-v33/batchNN-lifestyle-evidence.json/.csv artifacts.

Checks performed per batch:
  - destination_key values in LIFESTYLE_FEATURES are exactly that batch's 5
    destination_keys (destination scoping / no cross-contamination).
  - feature_key values are all members of the canonical taxonomy.
  - controlled-value enums (availability_level, proximity_band, confidence,
    matching_enabled, display_enabled) are all valid.
  - record_key values are globally unique within the sheet.
  - (destination_key, feature_key) pairs are unique, except settlement_type
    which is explicitly repeatable (PRIMARY/SECONDARY rows).
  - every destination_key referenced also appears in that workbook's own
    DESTINATIONS sheet (no orphaned rows).
  - LOW-confidence / UNKNOWN / mirrored (beach_access, mountain_access) rows
    all have matching_enabled = NO.
  - the workbook's LIFESTYLE_FEATURES sheet content matches the corresponding
    data/lifestyle-v33/batchNN-lifestyle-evidence.json/.csv exactly (3-way
    agreement: workbook == JSON == CSV).
  - PLACES place_key values are globally unique across the whole sheet
    (existing + newly inserted).
  - no duplicate places: no two PLACES rows share the same
    (destination_key, place_name-lowercased).
  - newly inserted PLACES rows have well-formed google_maps_url values and a
    category_key that exists in CATEGORIES, and a neighborhood_key that
    exists in NEIGHBORHOODS.

Run from repo root: python3 scripts/validate-lifestyle-v33-workbooks.py
"""
import csv
import json
import os
import re
import sys
import openpyxl

REPO_ROOT = os.path.join(os.path.dirname(__file__), "..")
EVIDENCE_DIR = os.path.join(REPO_ROOT, "data", "lifestyle-v33")

with open(os.path.join(EVIDENCE_DIR, "feature-taxonomy.json"), "r", encoding="utf-8") as fh:
    _TAXONOMY_DOC = json.load(fh)

VALID_FEATURE_KEYS = {f["feature_key"] for f in _TAXONOMY_DOC["features"]}
AVAILABILITY_LEVELS = set(_TAXONOMY_DOC["global_controlled_values"]["availability_level"])
PROXIMITY_BANDS = set(_TAXONOMY_DOC["global_controlled_values"]["proximity_band"])
CONFIDENCE_LEVELS = set(_TAXONOMY_DOC["global_controlled_values"]["confidence"])
BOOL_VALUES = set(_TAXONOMY_DOC["global_controlled_values"]["boolean_columns"])

MAPS_URL_RE = re.compile(r"^https://www\.google\.com/maps/search/\?api=1&query=\S+$")
URL_RE = re.compile(r"^https?://\S+$")

BATCHES = [
    {
        "label": "Batch #1",
        "v33": os.path.join(REPO_ROOT, "data/DestinationFinderAI_Expansion_Batch_01_5_Destinations_v3.3.xlsx"),
        "evidence_json": os.path.join(EVIDENCE_DIR, "batch01-lifestyle-evidence.json"),
        "evidence_csv": os.path.join(EVIDENCE_DIR, "batch01-lifestyle-evidence.csv"),
        "destination_keys": ["the-villages-fl-us", "sofia-bg", "puerto-vallarta-mx", "hoi-an-vn", "queenstown-nz"],
        "new_place_keys": ["puerto-vallarta-mx-playa-olas-altas", "hoi-an-vn-cham-islands-cu-lao-cham"],
    },
    {
        "label": "Batch #2",
        "v33": os.path.join(REPO_ROOT, "data/DestinationFinderAI_Expansion_Batch_02_5_Destinations_v3.3.xlsx"),
        "evidence_json": os.path.join(EVIDENCE_DIR, "batch02-lifestyle-evidence.json"),
        "evidence_csv": os.path.join(EVIDENCE_DIR, "batch02-lifestyle-evidence.csv"),
        "destination_keys": ["ascoli-piceno-it", "sarande-al", "dumaguete-ph", "las-terrenas-do", "fairhope-al-us"],
        "new_place_keys": ["ascoli-piceno-it-place-21"],
    },
]

EVIDENCE_COLUMNS = [
    "record_key", "destination_key", "feature_group", "feature_key", "feature_value",
    "availability_level", "proximity_band", "display_label", "evidence_summary",
    "source_name", "source_url", "source_as_of_date", "confidence",
    "matching_enabled", "display_enabled", "notes",
]


def read_sheet_rows(ws, header):
    idx = {h: i for i, h in enumerate(header)}
    rows = []
    for r in range(2, ws.max_row + 1):
        if ws.cell(row=r, column=1).value is None:
            continue
        rows.append({h: ws.cell(row=r, column=idx[h] + 1).value for h in header})
    return rows


def validate_batch(cfg: dict) -> list:
    issues = []
    wb = openpyxl.load_workbook(cfg["v33"])

    # --- LIFESTYLE_FEATURES ---
    lf_ws = wb["LIFESTYLE_FEATURES"]
    lf_header = [c.value for c in next(lf_ws.iter_rows(min_row=1, max_row=1))]
    if lf_header != EVIDENCE_COLUMNS:
        issues.append(f"[{cfg['label']}] LIFESTYLE_FEATURES header mismatch: {lf_header}")
    lf_rows = read_sheet_rows(lf_ws, EVIDENCE_COLUMNS)

    dest_ws = wb["DESTINATIONS"]
    dest_header = [c.value for c in next(dest_ws.iter_rows(min_row=1, max_row=1))]
    dest_key_col = dest_header.index("destination_key") + 1
    known_destination_keys = set()
    for r in range(2, dest_ws.max_row + 1):
        v = dest_ws.cell(row=r, column=dest_key_col).value
        if v:
            known_destination_keys.add(v)

    record_keys_seen = {}
    dest_feature_pairs = {}
    for row in lf_rows:
        rk = row["record_key"]
        record_keys_seen[rk] = record_keys_seen.get(rk, 0) + 1

        if row["destination_key"] not in cfg["destination_keys"]:
            issues.append(f"[{cfg['label']}] {rk}: destination_key {row['destination_key']!r} not in batch's expected set (cross-destination contamination)")
        if row["destination_key"] not in known_destination_keys:
            issues.append(f"[{cfg['label']}] {rk}: destination_key {row['destination_key']!r} orphaned - not present in this workbook's DESTINATIONS sheet")

        if row["feature_key"] not in VALID_FEATURE_KEYS:
            issues.append(f"[{cfg['label']}] {rk}: unknown feature_key {row['feature_key']!r}")

        if row["availability_level"] not in AVAILABILITY_LEVELS:
            issues.append(f"[{cfg['label']}] {rk}: invalid availability_level {row['availability_level']!r}")
        if row["proximity_band"] not in PROXIMITY_BANDS:
            issues.append(f"[{cfg['label']}] {rk}: invalid proximity_band {row['proximity_band']!r}")
        if row["confidence"] not in CONFIDENCE_LEVELS:
            issues.append(f"[{cfg['label']}] {rk}: invalid confidence {row['confidence']!r}")
        if row["matching_enabled"] not in BOOL_VALUES:
            issues.append(f"[{cfg['label']}] {rk}: invalid matching_enabled {row['matching_enabled']!r}")
        if row["display_enabled"] not in BOOL_VALUES:
            issues.append(f"[{cfg['label']}] {rk}: invalid display_enabled {row['display_enabled']!r}")

        is_unknown = row["availability_level"] == "UNKNOWN" or row["feature_value"] == "UNKNOWN"
        is_mirrored = row["feature_key"] in ("beach_access", "mountain_access")
        if (is_unknown or row["confidence"] == "LOW" or is_mirrored) and row["matching_enabled"] != "NO":
            issues.append(f"[{cfg['label']}] {rk}: matching_enabled must be NO for UNKNOWN/LOW/mirrored rows, got {row['matching_enabled']!r}")

        pair_key = (row["destination_key"], row["feature_key"])
        dest_feature_pairs[pair_key] = dest_feature_pairs.get(pair_key, 0) + 1

    dup_record_keys = [k for k, c in record_keys_seen.items() if c > 1]
    if dup_record_keys:
        issues.append(f"[{cfg['label']}] duplicate record_key values: {dup_record_keys}")

    unexpected_dup_pairs = [k for k, c in dest_feature_pairs.items() if c > 1 and k[1] != "settlement_type"]
    if unexpected_dup_pairs:
        issues.append(f"[{cfg['label']}] unexpected duplicate (destination_key, feature_key) pairs: {unexpected_dup_pairs}")

    # --- 3-way agreement: workbook vs JSON vs CSV ---
    with open(cfg["evidence_json"], "r", encoding="utf-8") as fh:
        json_rows = json.load(fh)
    with open(cfg["evidence_csv"], "r", encoding="utf-8", newline="") as fh:
        csv_rows = list(csv.DictReader(fh))

    if len(lf_rows) != len(json_rows):
        issues.append(f"[{cfg['label']}] workbook/JSON row count mismatch: workbook={len(lf_rows)} json={len(json_rows)}")
    if len(lf_rows) != len(csv_rows):
        issues.append(f"[{cfg['label']}] workbook/CSV row count mismatch: workbook={len(lf_rows)} csv={len(csv_rows)}")

    for i, (wbr, jr, cr) in enumerate(zip(lf_rows, json_rows, csv_rows)):
        for col in EVIDENCE_COLUMNS:
            wv = wbr.get(col)
            wv = "" if wv is None else str(wv)
            jv = jr.get(col)
            jv = "" if jv is None else str(jv)
            cv = cr.get(col) or ""
            if wv != jv:
                issues.append(f"[{cfg['label']}] row {i} col {col!r}: workbook={wv!r} != json={jv!r}")
            if wv != cv:
                issues.append(f"[{cfg['label']}] row {i} col {col!r}: workbook={wv!r} != csv={cv!r}")

    # --- PLACES ---
    places_ws = wb["PLACES"]
    places_header = [c.value for c in next(places_ws.iter_rows(min_row=1, max_row=1))]
    places_idx = {h: i for i, h in enumerate(places_header) if h}
    categories_ws = wb["CATEGORIES"]
    valid_categories = set()
    for r in range(2, categories_ws.max_row + 1):
        v = categories_ws.cell(row=r, column=1).value
        if v:
            valid_categories.add(v)
    neighborhoods_ws = wb["NEIGHBORHOODS"]
    valid_neighborhoods = set()
    for r in range(2, neighborhoods_ws.max_row + 1):
        v = neighborhoods_ws.cell(row=r, column=1).value
        if v:
            valid_neighborhoods.add(v)

    place_keys_seen = {}
    name_dup_seen = {}
    new_places_found = set()
    for r in range(2, places_ws.max_row + 1):
        pk = places_ws.cell(row=r, column=1).value
        if not pk:
            continue
        place_keys_seen[pk] = place_keys_seen.get(pk, 0) + 1
        d = places_ws.cell(row=r, column=places_idx["destination_key"] + 1).value
        name = places_ws.cell(row=r, column=places_idx["place_name"] + 1).value
        name_key = (d, (name or "").strip().lower())
        name_dup_seen[name_key] = name_dup_seen.get(name_key, 0) + 1

        if pk in cfg["new_place_keys"]:
            new_places_found.add(pk)
            cat = places_ws.cell(row=r, column=places_idx["category_key"] + 1).value
            nbhd = places_ws.cell(row=r, column=places_idx["neighborhood_key"] + 1).value
            gurl = places_ws.cell(row=r, column=places_idx["google_maps_url"] + 1).value
            wurl = places_ws.cell(row=r, column=places_idx["website_url"] + 1).value
            if cat not in valid_categories:
                issues.append(f"[{cfg['label']}] new place {pk}: category_key {cat!r} not in CATEGORIES")
            if nbhd not in valid_neighborhoods:
                issues.append(f"[{cfg['label']}] new place {pk}: neighborhood_key {nbhd!r} not in NEIGHBORHOODS (orphaned)")
            if not gurl or not MAPS_URL_RE.match(gurl):
                issues.append(f"[{cfg['label']}] new place {pk}: malformed google_maps_url {gurl!r}")
            if wurl and not URL_RE.match(wurl):
                issues.append(f"[{cfg['label']}] new place {pk}: malformed website_url {wurl!r}")

    dup_place_keys = [k for k, c in place_keys_seen.items() if c > 1]
    if dup_place_keys:
        issues.append(f"[{cfg['label']}] duplicate place_key values: {dup_place_keys}")
    dup_names = [k for k, c in name_dup_seen.items() if c > 1]
    if dup_names:
        issues.append(f"[{cfg['label']}] duplicate places (same destination_key + place_name): {dup_names}")

    missing_new_places = set(cfg["new_place_keys"]) - new_places_found
    if missing_new_places:
        issues.append(f"[{cfg['label']}] expected new place(s) not found in PLACES: {missing_new_places}")

    return issues


if __name__ == "__main__":
    all_issues = []
    for cfg in BATCHES:
        batch_issues = validate_batch(cfg)
        all_issues.extend(batch_issues)
        print(f"=== {cfg['label']}: {len(batch_issues)} issue(s) ===")
        for issue in batch_issues:
            print(f"  - {issue}")
    print()
    if all_issues:
        print(f"=== TOTAL: VALIDATION FAILED: {len(all_issues)} issue(s) ===")
        sys.exit(1)
    else:
        print("=== TOTAL: VALIDATION PASSED: 0 issues ===")
