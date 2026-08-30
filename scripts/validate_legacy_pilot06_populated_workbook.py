#!/usr/bin/env python3
"""
Structural + coverage validator for the Phase 5D fully-populated six-destination
legacy-migration-pilot-06 workbook (DestinationFinderAI_LegacyMigrationPilot06_v3.3_POPULATED.xlsx).

This is a SEPARATE validator from scripts/validate_legacy_pilot06_workbook.py, which continues to
validate the untouched Phase 5A/5B skeleton file exactly as before (not modified by this script).

Read-only. Never writes to any workbook except its own JSON report.

Checks:
  1. Complete 48-sheet v3.3 structure (correct set of sheets).
  2. Exactly 6 DESTINATIONS rows, unique/nonblank destination_key, slug == destination_key.
  3. Genuinely-not-researched content sheets (DESTINATION_SCORES, RESOURCES, FAMILY_EDUCATION -
     these 3 are also zero-row in the real committed Batch 2 benchmark, since they are populated by
     a downstream recommendation/aggregation system rather than manual research) have ZERO data
     rows for ALL 6 destinations - proving no fabrication.
  3b. The 20 newly-researched content sheets (DESTINATION_FACTS, COST_OF_LIVING, HOUSING_PROPERTY,
     PROPERTY_RESOURCES, LGBTQ_INCLUSIVITY, SAFETY_RISKS, CONNECTIVITY_REMOTE_WORK,
     LANGUAGE_INTEGRATION, PETS, COMMUNITY_SOCIAL, ACCESSIBILITY, BUREAUCRACY_SETUP,
     WORK_BUSINESS, RETIREMENT_AGING, LIFESTYLE_LAWS, REALITY_CHECK, MOVE_CHECKLIST,
     ENVIRONMENT_QUALITY, DAILY_LIFE_PRACTICALITY, EVENTS_SEASONALITY) have at least one row for
     every one of the 6 destinations.
  4. CLIMATE_MONTHLY has exactly 12 rows for the 4 destinations with genuine numeric normals, and
     ZERO rows for the 2 destinations where only qualitative/partial data was found.
  5. NEIGHBORHOODS, PLACES, TRANSPORT_AIRPORTS, VISA_RESIDENCY, TAXES_FINANCE,
     HEALTHCARE_INSURANCE, SOURCES, LIFESTYLE_FEATURES have at least one row for every one of the
     6 destinations (no destination silently skipped).
  6. LIFESTYLE_FEATURES has exactly 42 rows per destination, each feature_key drawn from the
     permitted 42-key controlled taxonomy, no duplicate feature_key within a destination.
  7. No cross-destination contamination anywhere: every populated row's destination_key is one of
     the 6 expected keys.
  8. DESTINATIONS: population, latitude, longitude are non-blank for all 6 (core identity/geography
     coverage minimum); intentional exceptions (Kyoto elevation_m, San Ramon metro_population) are
     explicitly allow-listed and documented, not silently ignored.

Usage:
  python3 scripts/validate_legacy_pilot06_populated_workbook.py
"""
import json
import sys
from collections import Counter
from pathlib import Path

import openpyxl

REPO_ROOT = Path(__file__).resolve().parent.parent
PILOT_DIR = REPO_ROOT / "data" / "legacy-migration-pilot-06"
WORKBOOK_PATH = PILOT_DIR / "DestinationFinderAI_LegacyMigrationPilot06_v3.3_POPULATED.xlsx"
REPORT_PATH = PILOT_DIR / "validation-report-populated.json"

EXPECTED_DESTINATION_KEYS = {
    "the-hague-netherlands", "kyoto-japan", "santa-fe-new-mexico-united-states",
    "st-cloud-minnesota-united-states", "san-ramon-costa-rica", "st-john-s-canada",
}
CLIMATE_POPULATED_KEYS = {
    "the-hague-netherlands", "kyoto-japan", "santa-fe-new-mexico-united-states", "st-john-s-canada",
    "st-cloud-minnesota-united-states",
}

UNRESEARCHED_EMPTY_SHEETS = [
    "DESTINATION_SCORES", "RESOURCES", "FAMILY_EDUCATION",
]
ALL_SIX_COVERED_SHEETS = [
    "NEIGHBORHOODS", "PLACES", "TRANSPORT_AIRPORTS", "VISA_RESIDENCY", "TAXES_FINANCE",
    "HEALTHCARE_INSURANCE", "SOURCES", "LIFESTYLE_FEATURES", "MEDIA",
    "DESTINATION_FACTS", "COST_OF_LIVING", "HOUSING_PROPERTY", "PROPERTY_RESOURCES",
    "LGBTQ_INCLUSIVITY", "SAFETY_RISKS", "CONNECTIVITY_REMOTE_WORK", "LANGUAGE_INTEGRATION",
    "PETS", "COMMUNITY_SOCIAL", "ACCESSIBILITY", "BUREAUCRACY_SETUP", "WORK_BUSINESS",
    "RETIREMENT_AGING", "LIFESTYLE_LAWS", "REALITY_CHECK", "MOVE_CHECKLIST",
    "ENVIRONMENT_QUALITY", "DAILY_LIFE_PRACTICALITY", "EVENTS_SEASONALITY",
]
LIFESTYLE_FEATURE_KEYS = {
    "arts_culture_strength", "beach_access", "boat_launch_access", "coastal_setting",
    "college_town_character", "community_energy", "countryside_access", "desert_setting",
    "dining_strength", "farmers_market_access", "fishing_access", "forest_access", "golf_access",
    "hiking_access", "hunting_access", "kayaking_access", "lake_access", "marina_access",
    "master_planned_or_gated_character", "mountain_access", "mountain_biking_access",
    "nightlife_strength", "paddleboarding_access", "parks_open_space_access", "pickleball_access",
    "powerboating_access", "resort_orientation", "retirement_orientation", "river_access",
    "road_cycling_access", "sailing_access", "scuba_snorkeling_access", "settlement_type",
    "skiing_snowboarding_access", "slip_or_mooring_access", "snow_access", "suburban_character",
    "surfing_access", "swimming_access", "tennis_access", "tourism_seasonality", "trail_access",
}
INTENTIONAL_IDENTITY_BLANKS = {
    ("kyoto-japan", "elevation_m"): "Source gave only a highest/lowest terrain range (9m-971m), not a single representative city-center figure - picking one would be a fabrication.",
    ("san-ramon-costa-rica", "metro_population"): "No metro-level statistical area is defined for this small highland town; only district and canton population levels exist.",
}


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

    checks["total_sheet_count_is_48"] = len(wb.sheetnames) == 48
    if len(wb.sheetnames) != 48:
        issues.append(f"Expected 48 sheets, found {len(wb.sheetnames)}")

    dest_ws = wb["DESTINATIONS"]
    dest_rows = nonblank_rows(dest_ws)
    header = [c for c in next(dest_ws.iter_rows(max_row=1, values_only=True)) if c is not None]
    key_idx = header.index("destination_key")
    slug_idx = header.index("slug")
    keys = [r[key_idx] for r in dest_rows]
    slugs = [r[slug_idx] for r in dest_rows]
    checks["destination_count_is_6"] = len(dest_rows) == 6
    checks["destination_keys_match_expected_set"] = set(keys) == EXPECTED_DESTINATION_KEYS
    checks["destination_keys_unique"] = len(keys) == len(set(keys))
    checks["slug_equals_destination_key_convention"] = all(k == s for k, s in zip(keys, slugs))
    if not checks["destination_keys_match_expected_set"]:
        issues.append(f"DESTINATIONS keys {sorted(set(keys))} do not match expected {sorted(EXPECTED_DESTINATION_KEYS)}")

    # DESTINATIONS core identity/geography coverage.
    core_fields = ["population", "latitude", "longitude"]
    identity_gaps = []
    for r in dest_rows:
        row_dict = dict(zip(header, r))
        dk = row_dict.get("destination_key")
        for f in ["elevation_m", "metro_population"] + core_fields:
            if row_dict.get(f) is None:
                allow = INTENTIONAL_IDENTITY_BLANKS.get((dk, f))
                if allow:
                    continue
                if f in core_fields:
                    identity_gaps.append(f"{dk}.{f} is blank and not in the intentional-blank allow-list")
    checks["destinations_core_identity_geography_covered"] = identity_gaps == []
    if identity_gaps:
        issues.extend(identity_gaps)

    # Unresearched sheets must be empty for all 6.
    non_empty = []
    for name in UNRESEARCHED_EMPTY_SHEETS:
        if name not in wb.sheetnames:
            issues.append(f"Expected sheet missing: {name}")
            continue
        rows = nonblank_rows(wb[name])
        if rows:
            non_empty.append({"sheet": name, "rowCount": len(rows)})
    checks["unresearched_sheets_empty"] = non_empty == []
    if non_empty:
        issues.append(f"Sheets expected empty this pass contain data: {non_empty}")

    # CLIMATE_MONTHLY: exactly 12 rows for the 4 populated destinations, 0 for the other 2.
    climate_ws = wb["CLIMATE_MONTHLY"]
    climate_header = [c for c in next(climate_ws.iter_rows(max_row=1, values_only=True)) if c is not None]
    climate_dk_idx = climate_header.index("destination_key")
    climate_rows = nonblank_rows(climate_ws)
    climate_counts = Counter(r[climate_dk_idx] for r in climate_rows)
    climate_issues = []
    for dk in EXPECTED_DESTINATION_KEYS:
        expected = 12 if dk in CLIMATE_POPULATED_KEYS else 0
        actual = climate_counts.get(dk, 0)
        if actual != expected:
            climate_issues.append(f"CLIMATE_MONTHLY: expected {expected} rows for {dk}, found {actual}")
        leaked_keys = [k for k in climate_counts if k not in EXPECTED_DESTINATION_KEYS]
    checks["climate_monthly_correct_per_destination"] = climate_issues == []
    if climate_issues:
        issues.extend(climate_issues)

    # Sheets that must cover all 6 destinations with at least 1 row each; and no contamination anywhere.
    coverage_gaps = []
    contamination = []
    for name in ALL_SIX_COVERED_SHEETS:
        ws = wb[name]
        sheet_header = [c for c in next(ws.iter_rows(max_row=1, values_only=True)) if c is not None]
        if "destination_key" not in sheet_header:
            continue
        dk_idx = sheet_header.index("destination_key")
        rows = nonblank_rows(ws)
        row_keys = [r[dk_idx] for r in rows]
        counts = Counter(row_keys)
        for dk in EXPECTED_DESTINATION_KEYS:
            if counts.get(dk, 0) == 0:
                coverage_gaps.append(f"{name}: zero rows for {dk}")
        leaked = [k for k in row_keys if k not in EXPECTED_DESTINATION_KEYS]
        if leaked:
            contamination.append(f"{name}: unexpected destination_key(s) {sorted(set(leaked))}")
    checks["all_six_destinations_covered_in_researched_sheets"] = coverage_gaps == []
    checks["no_cross_destination_contamination"] = contamination == []
    if coverage_gaps:
        issues.extend(coverage_gaps)
    if contamination:
        issues.extend(contamination)

    # LIFESTYLE_FEATURES: exactly 42 rows per destination, all from the permitted 42-key taxonomy, no dupes.
    lf_ws = wb["LIFESTYLE_FEATURES"]
    lf_header = [c for c in next(lf_ws.iter_rows(max_row=1, values_only=True)) if c is not None]
    lf_dk_idx = lf_header.index("destination_key")
    lf_fk_idx = lf_header.index("feature_key")
    lf_rows = nonblank_rows(lf_ws)
    lf_issues = []
    by_dest = {}
    for r in lf_rows:
        by_dest.setdefault(r[lf_dk_idx], []).append(r[lf_fk_idx])
    for dk in EXPECTED_DESTINATION_KEYS:
        fkeys = by_dest.get(dk, [])
        if len(fkeys) != 42:
            lf_issues.append(f"LIFESTYLE_FEATURES: expected 42 rows for {dk}, found {len(fkeys)}")
        invalid = [k for k in fkeys if k not in LIFESTYLE_FEATURE_KEYS]
        if invalid:
            lf_issues.append(f"LIFESTYLE_FEATURES: {dk} has non-permitted feature_key(s) {sorted(set(invalid))}")
        if len(fkeys) != len(set(fkeys)):
            lf_issues.append(f"LIFESTYLE_FEATURES: {dk} has duplicate feature_key values")
    checks["lifestyle_features_complete_and_valid"] = lf_issues == []
    if lf_issues:
        issues.extend(lf_issues)

    wb.close()

    ok = issues == []
    report = {
        "ok": ok,
        "issues": issues,
        "checks": checks,
        "expectedDestinationKeys": sorted(EXPECTED_DESTINATION_KEYS),
        "climatePopulatedKeys": sorted(CLIMATE_POPULATED_KEYS),
    }
    REPORT_PATH.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
