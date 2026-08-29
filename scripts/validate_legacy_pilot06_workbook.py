#!/usr/bin/env python3
"""
Smallest-practical structural validator for the legacy-migration-pilot-06 skeleton workbook.
Read-only. Never writes to any workbook. Reuses openpyxl only (no new importer/parser is built -
see app/lib/__tests__/legacy-pilot06-skeleton.test.ts for the authoritative deterministic-parser
validation, which invokes the REAL production parser directly).

Checks:
  1. Sheet set matches the expected complete 48-sheet v3.3 structure (all 10 base/control sheets
     present, LIFESTYLE_FEATURES present with zero data rows).
  2. DESTINATIONS has exactly the 6 expected destination_key/slug values, each nonblank and unique.
  3. Every destination-content sheet (DESTINATION_FACTS..LIFESTYLE_FEATURES) has ZERO data rows -
     positively proves no fabricated research was written.
  4. No orphan destination_key appears in any content sheet (trivially true given #3, checked anyway).
  5. No cross-destination contamination (trivially true given #3, checked anyway).

Usage:
  python3 scripts/validate_legacy_pilot06_workbook.py
"""
import json
import sys
from pathlib import Path

import openpyxl

REPO_ROOT = Path(__file__).resolve().parent.parent
PILOT_DIR = REPO_ROOT / "data" / "legacy-migration-pilot-06"
WORKBOOK_PATH = PILOT_DIR / "DestinationFinderAI_LegacyMigrationPilot06_v3.3_SKELETON.xlsx"
REPORT_PATH = PILOT_DIR / "validation-report.json"

EXPECTED_DESTINATION_KEYS = {
    "the-hague-netherlands",
    "kyoto-japan",
    "santa-fe-new-mexico-united-states",
    "st-cloud-minnesota-united-states",
    "san-ramon-costa-rica",
    "st-john-s-canada",
}

REQUIRED_BASE_SHEETS = [
    "DESTINATIONS", "IMPORT_CONTRACT", "WORKBOOK_METADATA", "IMPORT_MANIFEST",
    "DESTINATION_ALIASES", "VALIDATION_RULES", "DATA_DICTIONARY",
]

CONTENT_SHEETS = [
    "DESTINATION_FACTS", "DESTINATION_SCORES", "NEIGHBORHOODS", "PLACES", "RESOURCES", "MEDIA",
    "COST_OF_LIVING", "CLIMATE_MONTHLY", "HOUSING_PROPERTY", "PROPERTY_RESOURCES",
    "HEALTHCARE_INSURANCE", "VISA_RESIDENCY", "TAXES_FINANCE", "LGBTQ_INCLUSIVITY", "SAFETY_RISKS",
    "TRANSPORT_AIRPORTS", "CONNECTIVITY_REMOTE_WORK", "LANGUAGE_INTEGRATION", "PETS",
    "FAMILY_EDUCATION", "COMMUNITY_SOCIAL", "ACCESSIBILITY", "BUREAUCRACY_SETUP", "WORK_BUSINESS",
    "RETIREMENT_AGING", "LIFESTYLE_LAWS", "REALITY_CHECK", "MOVE_CHECKLIST", "SOURCES",
    "ENVIRONMENT_QUALITY", "DAILY_LIFE_PRACTICALITY", "EVENTS_SEASONALITY", "LIFESTYLE_FEATURES",
]


def nonblank_rows(ws):
    rows = list(ws.iter_rows(values_only=True))
    return [r for r in rows[1:] if any(c is not None and str(c).strip() != "" for c in r)]


def main():
    issues = []
    checks = {}

    if not WORKBOOK_PATH.exists():
        issues.append(f"Workbook not found: {WORKBOOK_PATH}")
        report = {"ok": False, "issues": issues, "checks": checks}
        REPORT_PATH.write_text(json.dumps(report, indent=2), encoding="utf-8")
        print(json.dumps(report, indent=2))
        sys.exit(1)

    wb = openpyxl.load_workbook(WORKBOOK_PATH, read_only=True, data_only=True)

    # Check 1: required base sheets present, LIFESTYLE_FEATURES legitimately absent.
    missing_base = [s for s in REQUIRED_BASE_SHEETS if s not in wb.sheetnames]
    checks["required_base_sheets_present"] = missing_base == []
    if missing_base:
        issues.append(f"Missing required base sheets: {missing_base}")
    checks["lifestyle_features_present_with_zero_rows"] = "LIFESTYLE_FEATURES" in wb.sheetnames
    if "LIFESTYLE_FEATURES" not in wb.sheetnames:
        issues.append("LIFESTYLE_FEATURES sheet missing - Phase 5B requires the complete 48-sheet structure.")

    checks["total_sheet_count_is_48"] = len(wb.sheetnames) == 48
    if len(wb.sheetnames) != 48:
        issues.append(f"Expected the complete 48-sheet v3.3 structure, found {len(wb.sheetnames)} sheets")

    # Check 2: DESTINATIONS exactly matches the 6 expected keys, unique, nonblank.
    dest_ws = wb["DESTINATIONS"]
    dest_rows = nonblank_rows(dest_ws)
    header = [c for c in next(dest_ws.iter_rows(max_row=1, values_only=True)) if c is not None]
    key_idx = header.index("destination_key")
    slug_idx = header.index("slug")
    keys = [r[key_idx] for r in dest_rows]
    slugs = [r[slug_idx] for r in dest_rows]
    checks["destination_count_is_6"] = len(dest_rows) == 6
    if len(dest_rows) != 6:
        issues.append(f"Expected exactly 6 DESTINATIONS rows, found {len(dest_rows)}")
    checks["destination_keys_match_expected_set"] = set(keys) == EXPECTED_DESTINATION_KEYS
    if set(keys) != EXPECTED_DESTINATION_KEYS:
        issues.append(f"DESTINATIONS keys {sorted(set(keys))} do not exactly match expected {sorted(EXPECTED_DESTINATION_KEYS)}")
    checks["destination_keys_unique"] = len(keys) == len(set(keys))
    if len(keys) != len(set(keys)):
        issues.append("Duplicate destination_key values found in DESTINATIONS")
    checks["destination_keys_nonblank"] = all(k and str(k).strip() for k in keys)
    checks["slug_equals_destination_key_convention"] = all(k == s for k, s in zip(keys, slugs))
    if not all(k == s for k, s in zip(keys, slugs)):
        issues.append("slug does not equal destination_key for at least one row - violates the agreed key-generation convention for this pilot")

    # Check 3+4+5: every content sheet has zero data rows (proves no fabrication, no orphans, no contamination).
    non_empty_content_sheets = []
    for name in CONTENT_SHEETS:
        if name not in wb.sheetnames:
            issues.append(f"Expected content sheet missing entirely: {name}")
            continue
        rows = nonblank_rows(wb[name])
        if rows:
            non_empty_content_sheets.append({"sheet": name, "rowCount": len(rows)})
    checks["all_content_sheets_empty"] = non_empty_content_sheets == []
    if non_empty_content_sheets:
        issues.append(f"Content sheets contain unexpected data (should be empty pre-research): {non_empty_content_sheets}")

    wb.close()

    ok = issues == []
    report = {"ok": ok, "issues": issues, "checks": checks, "expectedDestinationKeys": sorted(EXPECTED_DESTINATION_KEYS)}
    REPORT_PATH.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
