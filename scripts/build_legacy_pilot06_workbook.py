#!/usr/bin/env python3
"""
Deterministically builds the empty, structurally-valid six-destination
"legacy-migration-pilot-06" v3.3 skeleton workbook from
data/legacy-migration-pilot-06/pilot-destinations.json.

Read-only against every existing workbook file (data/DestinationFinderAI_Expansion_Batch_01_5_Destinations_v3.3.xlsx
is opened only to copy its non-destination-specific CONTROL/REFERENCE sheets verbatim - CATEGORIES,
SCORING_DIMENSIONS, STAY_MODES, SCHEMA_INDEX, PREMIUM_REQUIREMENTS, IMPORT_CONTRACT, VALIDATION_RULES,
DATA_DICTIONARY, README - since these are workbook-level constants, not per-batch content, and the
existing schema/enum/header conventions must be reused, never re-invented).

This script fabricates NO destination research. Every destination-content sheet (DESTINATION_FACTS
through LIFESTYLE_FEATURES) is written with its real header row and ZERO data rows. Only the
DESTINATIONS sheet gets real rows, and only for the 4 fields that are genuinely known, unfabricated
facts already present in the legacy TypeScript catalog: destination_key, destination_name, country, slug.
Every other DESTINATIONS column is left blank.

As of Phase 5B, LIFESTYLE_FEATURES is included with its real headers and zero data rows, completing
the full 48-sheet v3.3 structure.

As of Phase 5C, the two Wave 1 destinations (The Hague, Kyoto) have evidence-backed DESTINATIONS
identity/geography fields and 12-month CLIMATE_MONTHLY rows populated from
data/legacy-migration-pilot-06/research-ledger/*.json (KNMI, JMA, CBS, City of Kyoto, and the
municipal/tourism official sites cited therein), with corresponding SOURCES rows. The other 4 pilot
destinations remain completely untouched, empty identity-only skeletons. No field is ever populated
with a fabricated placeholder ("N/A", "TBD", "unknown", 0-as-filler, generic prose) - unresearched
fields are left as genuinely blank cells.

Usage:
  python3 scripts/build_legacy_pilot06_workbook.py
"""
import json
from pathlib import Path

import openpyxl

REPO_ROOT = Path(__file__).resolve().parent.parent
REFERENCE_WORKBOOK = REPO_ROOT / "data" / "DestinationFinderAI_Expansion_Batch_01_5_Destinations_v3.3.xlsx"
PILOT_DIR = REPO_ROOT / "data" / "legacy-migration-pilot-06"
PILOT_DESTINATIONS_JSON = PILOT_DIR / "pilot-destinations.json"
OUTPUT_WORKBOOK = PILOT_DIR / "DestinationFinderAI_LegacyMigrationPilot06_v3.3_SKELETON.xlsx"

# Phase 5C: Wave 1 (The Hague, Kyoto) evidence-backed research ledger inputs. Only these two
# destination_keys receive any DESTINATIONS/CLIMATE_MONTHLY/SOURCES population - the other 4
# pilot destinations remain identity-only skeletons, exactly as in Phase 5A/5B.
RESEARCH_LEDGER_DIR = PILOT_DIR / "research-ledger"
WAVE1_IDENTITY_FIELDS_JSON = RESEARCH_LEDGER_DIR / "wave1-identity-fields.json"
WAVE1_DESTINATION_KEYS = ["the-hague-netherlands", "kyoto-japan"]
WAVE1_CLIMATE_JSON = {
    "the-hague-netherlands": RESEARCH_LEDGER_DIR / "the-hague-netherlands-climate.json",
    "kyoto-japan": RESEARCH_LEDGER_DIR / "kyoto-japan-climate.json",
}
WAVE1_LEDGER_JSON = {
    "the-hague-netherlands": RESEARCH_LEDGER_DIR / "the-hague-netherlands.json",
    "kyoto-japan": RESEARCH_LEDGER_DIR / "kyoto-japan.json",
}

# Sheets copied verbatim from the reference workbook - true workbook-level constants, never
# destination-specific, never modified here. Order matches the real workbook's own sheet order.
VERBATIM_REFERENCE_SHEETS_EARLY = ["README", "CATEGORIES", "SCORING_DIMENSIONS", "STAY_MODES"]
VERBATIM_REFERENCE_SHEETS_LATE = ["SCHEMA_INDEX", "PREMIUM_REQUIREMENTS", "IMPORT_CONTRACT", "VALIDATION_RULES", "DATA_DICTIONARY"]


# Destination-content sheets: header row copied from the reference workbook, but written with
# ZERO data rows in this skeleton - no fabricated research.
EMPTY_CONTENT_SHEETS = [
    "DESTINATION_FACTS",
    "DESTINATION_SCORES",
    "NEIGHBORHOODS",
    "PLACES",
    "RESOURCES",
    "MEDIA",
    "COST_OF_LIVING",
    "CLIMATE_MONTHLY",
    "HOUSING_PROPERTY",
    "PROPERTY_RESOURCES",
    "HEALTHCARE_INSURANCE",
    "VISA_RESIDENCY",
    "TAXES_FINANCE",
    "LGBTQ_INCLUSIVITY",
    "SAFETY_RISKS",
    "TRANSPORT_AIRPORTS",
    "CONNECTIVITY_REMOTE_WORK",
    "LANGUAGE_INTEGRATION",
    "PETS",
    "FAMILY_EDUCATION",
    "COMMUNITY_SOCIAL",
    "ACCESSIBILITY",
    "BUREAUCRACY_SETUP",
    "WORK_BUSINESS",
    "RETIREMENT_AGING",
    "LIFESTYLE_LAWS",
    "REALITY_CHECK",
    "MOVE_CHECKLIST",
    "SOURCES",
    "ENVIRONMENT_QUALITY",
    "DAILY_LIFE_PRACTICALITY",
    "EVENTS_SEASONALITY",
]

# LIFESTYLE_FEATURES (v3.3) - completes the full 48-sheet structure. Real headers, zero data rows:
# no lifestyle research exists yet for this pilot.
LIFESTYLE_FEATURES_SHEET = "LIFESTYLE_FEATURES"

# DESTINATION_ALIASES and IMPORT_MANIFEST get real, batch-specific but honest rows (not copied
# verbatim from the reference workbook, since their content is inherently per-batch).
BATCH_SPECIFIC_SHEETS = ["DESTINATION_ALIASES", "IMPORT_MANIFEST", "WORKBOOK_METADATA", "CHANGELOG", "PILOT_STATUS"]


def load_pilot_destinations():
    data = json.loads(PILOT_DESTINATIONS_JSON.read_text(encoding="utf-8"))
    return data["destinations"]


def copy_sheet_verbatim(src_wb, dest_wb, sheet_name):
    src_ws = src_wb[sheet_name]
    dest_ws = dest_wb.create_sheet(sheet_name)
    for row in src_ws.iter_rows():
        for cell in row:
            if cell.value is not None:
                dest_ws.cell(row=cell.row, column=cell.column, value=cell.value)


def get_header(src_wb, sheet_name):
    src_ws = src_wb[sheet_name]
    first_row = next(src_ws.iter_rows(max_row=1, values_only=True))
    return [v for v in first_row if v is not None]


def main():
    if not REFERENCE_WORKBOOK.exists():
        raise SystemExit(f"Reference workbook not found: {REFERENCE_WORKBOOK}")

    destinations = load_pilot_destinations()
    ref_wb = openpyxl.load_workbook(REFERENCE_WORKBOOK, read_only=True, data_only=True)

    out_wb = openpyxl.Workbook()
    out_wb.remove(out_wb.active)  # remove the default blank sheet

    # 1) Verbatim reference/control sheets that appear early in the real workbook's sheet order.
    for name in VERBATIM_REFERENCE_SHEETS_EARLY:
        copy_sheet_verbatim(ref_wb, out_wb, name)

    # 2) DESTINATIONS - 6 rows, identity-only fields, PLUS Phase 5C evidence-backed
    # identity/geography fields for the two Wave 1 destinations (The Hague, Kyoto) only.
    wave1_identity = {}
    if WAVE1_IDENTITY_FIELDS_JSON.exists():
        wave1_identity = json.loads(WAVE1_IDENTITY_FIELDS_JSON.read_text(encoding="utf-8"))

    dest_headers = get_header(ref_wb, "DESTINATIONS")
    ws = out_wb.create_sheet("DESTINATIONS")
    for col_idx, header in enumerate(dest_headers, start=1):
        ws.cell(row=1, column=col_idx, value=header)
    key_col = dest_headers.index("destination_key") + 1
    name_col = dest_headers.index("destination_name") + 1
    country_col = dest_headers.index("country") + 1
    slug_col = dest_headers.index("slug") + 1
    for row_idx, dest in enumerate(destinations, start=2):
        ws.cell(row=row_idx, column=key_col, value=dest["destinationKey"])
        ws.cell(row=row_idx, column=name_col, value=dest["city"])
        ws.cell(row=row_idx, column=country_col, value=dest["country"])
        ws.cell(row=row_idx, column=slug_col, value=dest["slug"])
        # every other DESTINATIONS column is left blank - not yet migrated -
        # EXCEPT the Phase 5C evidence-backed fields for the two Wave 1 destinations below.
        fields = wave1_identity.get(dest["destinationKey"])
        if fields:
            for field_name, field_value in fields.items():
                if field_name in dest_headers and field_value is not None:
                    ws.cell(row=row_idx, column=dest_headers.index(field_name) + 1, value=field_value)

    # 3) Empty content sheets - real headers, zero data rows for 4 destinations; Phase 5C
    # populates CLIMATE_MONTHLY rows for the two Wave 1 destinations only (below, after this loop).
    for name in EMPTY_CONTENT_SHEETS:
        headers = get_header(ref_wb, name)
        content_ws = out_wb.create_sheet(name)
        for col_idx, header in enumerate(headers, start=1):
            content_ws.cell(row=1, column=col_idx, value=header)

    # 3b) Phase 5C: CLIMATE_MONTHLY - 12 rows each for The Hague and Kyoto, evidence-backed
    # from KNMI (The Hague) and JMA (Kyoto) climate normals. The other 4 destinations get
    # zero CLIMATE_MONTHLY rows, exactly as before.
    climate_ws = out_wb["CLIMATE_MONTHLY"]
    climate_headers = get_header(ref_wb, "CLIMATE_MONTHLY")
    climate_row_idx = 2
    sources_rows = []  # (destination_key, source_name, source_url, source_type) accumulated for SOURCES sheet
    seen_source_urls_per_dest = {}  # dest_key -> set of urls already recorded, to avoid duplicate SOURCES rows
    for dest_key in WAVE1_DESTINATION_KEYS:
        climate_path = WAVE1_CLIMATE_JSON[dest_key]
        if not climate_path.exists():
            continue
        climate_data = json.loads(climate_path.read_text(encoding="utf-8"))
        source_name = climate_data["sourceName"]
        source_url = climate_data["sourceUrl"]
        for month_row in climate_data["months"]:
            row_values = {
                "destination_key": dest_key,
                "month": month_row["month"],
                "avg_high_c": month_row.get("avg_high_c"),
                "avg_low_c": month_row.get("avg_low_c"),
                "rainfall_mm": month_row.get("rainfall_mm"),
                "humidity_pct": month_row.get("humidity_pct"),
                "sunshine_hours": month_row.get("sunshine_hours"),
                "snowfall_cm": month_row.get("snowfall_cm"),
                "source_name": source_name,
                "source_url": source_url,
                "verified": "TRUE",
            }
            for field_name, field_value in row_values.items():
                if field_name in climate_headers and field_value is not None:
                    climate_ws.cell(row=climate_row_idx, column=climate_headers.index(field_name) + 1, value=field_value)
            climate_row_idx += 1
        sources_rows.append((dest_key, source_name, source_url, "official_climate_normal"))
        seen_source_urls_per_dest.setdefault(dest_key, set()).add(source_url)

    # 3c) Phase 5C: SOURCES - one row per distinct citation used for the two Wave 1 destinations'
    # DESTINATIONS/CLIMATE_MONTHLY population this pass. The other 4 destinations get zero rows.
    for dest_key in WAVE1_DESTINATION_KEYS:
        ledger_path = WAVE1_LEDGER_JSON[dest_key]
        if not ledger_path.exists():
            continue
        ledger = json.loads(ledger_path.read_text(encoding="utf-8"))
        seen_urls = seen_source_urls_per_dest.setdefault(dest_key, set())
        for fact in ledger.get("facts", []):
            url = fact.get("sourceUrl")
            if not url or url in seen_urls:
                continue
            seen_urls.add(url)
            sources_rows.append((dest_key, fact.get("sourceName", ""), url, "research_citation"))

    sources_ws = out_wb["SOURCES"]
    sources_headers = get_header(ref_wb, "SOURCES")
    for row_idx, (dest_key, source_name, source_url, source_type) in enumerate(sources_rows, start=2):
        row_values = {
            "source_key": f"{dest_key}__source_{row_idx - 1}",
            "destination_key": dest_key,
            "source_name": source_name,
            "source_url": source_url,
            "source_type": source_type,
            "accessed_at": "2026-08-28",
            "verified": "TRUE",
        }
        for field_name, field_value in row_values.items():
            if field_name in sources_headers and field_value is not None:
                sources_ws.cell(row=row_idx, column=sources_headers.index(field_name) + 1, value=field_value)



    # 4) SCHEMA_INDEX, PREMIUM_REQUIREMENTS, IMPORT_CONTRACT, VALIDATION_RULES, DATA_DICTIONARY - verbatim,
    # each copied exactly once here (not in step 1).
    for name in VERBATIM_REFERENCE_SHEETS_LATE:
        copy_sheet_verbatim(ref_wb, out_wb, name)

    # 5) WORKBOOK_METADATA - fresh, honest, batch-specific.
    wm = out_wb.create_sheet("WORKBOOK_METADATA")
    wm_headers = get_header(ref_wb, "WORKBOOK_METADATA")
    for col_idx, header in enumerate(wm_headers, start=1):
        wm.cell(row=1, column=col_idx, value=header)
    wm_rows = [
        ("schema_version", "3.3", "Importer compatibility contract"),
        ("architecture", "workbook_only_no_fallback", "Destination-specific content originates in this workbook at import time."),
        ("default_operation", "UPSERT", "Create if absent, update if present"),
        ("default_update_mode", "MERGE_NONBLANK", "Blank incoming values do not erase existing values"),
        ("default_publish_mode", "VALIDATE_THEN_PUBLISH", "Validate/diff before persistence"),
        ("primary_identity", "destination_key", "Stable identity across slug/name changes"),
        ("batch_ready", "FALSE", "This is a pre-migration identity skeleton, not a batch ready for import"),
        ("batch_id", "legacy-migration-pilot-06", "Phase 5A pilot package identifier"),
        ("batch_keys", "; ".join(d["destinationKey"] for d in destinations), "Six legacy-catalog pilot destinations"),
        ("created_from", "app/lib/destinations.ts (legacy TypeScript catalog)", "Identity fields only - no editorial content ported yet"),
        ("contract_updated_at", "2026-08-28", "Phase 5C update date"),
        ("population_strategy", "wave1_evidence_backed_partial", "The Hague and Kyoto have evidence-backed DESTINATIONS identity/geography + CLIMATE_MONTHLY fields; the other 4 destinations remain an empty identity skeleton"),
        ("source_policy", "authoritative_urls_required", "No invented fallback content; blanks remain blanks when evidence is unavailable"),
        ("batch_revision", "PHASE_5C_WAVE1_EVIDENCE_POPULATION", "Wave 1 (The Hague, Kyoto) identity/geography/climate populated from cited sources; see pilot-manifest.json and research-ledger/ for provenance"),
        ("wave1_researched_keys", "; ".join(WAVE1_DESTINATION_KEYS), "Only these destination_keys received Phase 5C content population"),
    ]
    for row_idx, row in enumerate(wm_rows, start=2):
        for col_idx, value in enumerate(row, start=1):
            wm.cell(row=row_idx, column=col_idx, value=value)

    # 6) CHANGELOG - fresh.
    cl = out_wb.create_sheet("CHANGELOG")
    cl_headers = get_header(ref_wb, "CHANGELOG")
    for col_idx, header in enumerate(cl_headers, start=1):
        cl.cell(row=1, column=col_idx, value=header)
    cl.cell(row=2, column=1, value="3.3-pilot06-phase5a")
    cl.cell(row=2, column=2, value="Created empty six-destination legacy-migration-pilot-06 identity skeleton.")
    cl.cell(row=2, column=3, value="No destination research populated. Structural validation only.")
    cl.cell(row=2, column=4, value="2026-08-28")
    cl.cell(row=3, column=1, value="3.3-pilot06-phase5c")
    cl.cell(row=3, column=2, value="Populated evidence-backed DESTINATIONS identity/geography and CLIMATE_MONTHLY (12 rows each) for The Hague and Kyoto (Wave 1), citing KNMI/JMA/CBS/City of Kyoto/Wikipedia-relayed-official-sources; added SOURCES rows.")
    cl.cell(row=3, column=3, value="The other 4 pilot destinations remain untouched, identity-only skeletons. See research-ledger/ for full provenance and notResearchedThisPass fields.")
    cl.cell(row=3, column=4, value="2026-08-28")

    # 7) PILOT_STATUS - fresh, honest, one row per destination. Phase 5C marks the two Wave 1
    # destinations as partially researched (identity + climate only) - the other 4 are untouched.
    ps = out_wb.create_sheet("PILOT_STATUS")
    ps_headers = get_header(ref_wb, "PILOT_STATUS")
    for col_idx, header in enumerate(ps_headers, start=1):
        ps.cell(row=1, column=col_idx, value=header)
    for row_idx, dest in enumerate(destinations, start=2):
        if dest["destinationKey"] in WAVE1_DESTINATION_KEYS:
            values = [dest["city"], "PARTIAL (identity + climate only)", "0", "0", "0", "0",
                      "WAVE1_IDENTITY_AND_CLIMATE_RESEARCHED", "3.3", "legacy-migration-pilot-06"]
        else:
            values = [dest["city"], "NOT_STARTED", "0", "0", "0", "0", "PRE_MIGRATION_NOT_YET_RESEARCHED", "3.3", "legacy-migration-pilot-06"]
        for col_idx, value in enumerate(values, start=1):
            ps.cell(row=row_idx, column=col_idx, value=value)

    # 8) IMPORT_MANIFEST - fresh, honest, one row per destination.
    im = out_wb.create_sheet("IMPORT_MANIFEST")
    im_headers = get_header(ref_wb, "IMPORT_MANIFEST")
    for col_idx, header in enumerate(im_headers, start=1):
        im.cell(row=1, column=col_idx, value=header)
    for row_idx, dest in enumerate(destinations, start=2):
        values = [dest["destinationKey"], "UPSERT", "MERGE_NONBLANK", "VALIDATE_THEN_PUBLISH", "FALSE", 1, 0, 0, 0, 0, "PENDING",
                  "legacy-migration-pilot-06 skeleton; no destination content populated yet."]
        for col_idx, value in enumerate(values, start=1):
            im.cell(row=row_idx, column=col_idx, value=value)

    # 9) DESTINATION_ALIASES - header only, zero rows (no alias exists - destination_key IS the slug).
    da = out_wb.create_sheet("DESTINATION_ALIASES")
    da_headers = get_header(ref_wb, "DESTINATION_ALIASES")
    for col_idx, header in enumerate(da_headers, start=1):
        da.cell(row=1, column=col_idx, value=header)

    # 10) LIFESTYLE_FEATURES - real headers, zero data rows, completing the full 48-sheet structure.
    lf_headers = get_header(ref_wb, LIFESTYLE_FEATURES_SHEET)
    lf = out_wb.create_sheet(LIFESTYLE_FEATURES_SHEET)
    for col_idx, header in enumerate(lf_headers, start=1):
        lf.cell(row=1, column=col_idx, value=header)

    ref_wb.close()
    PILOT_DIR.mkdir(parents=True, exist_ok=True)
    out_wb.save(OUTPUT_WORKBOOK)
    print(f"Wrote {OUTPUT_WORKBOOK.relative_to(REPO_ROOT)}")
    print(f"Sheets ({len(out_wb.sheetnames)}): {out_wb.sheetnames}")


if __name__ == "__main__":
    main()
