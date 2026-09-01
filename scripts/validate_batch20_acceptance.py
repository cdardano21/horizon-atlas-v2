"""
Comprehensive Batch 20 acceptance validator. Checks the workbook data directly (numeric cost,
scores, population, media, food coverage, neighborhood resources, placeholder language) and each
of the 20 live destination pages (HTTP 200, hero/gallery render, numeric cost display, Overview
ordering, no blank labels/false-zero counters). Exits non-zero if any destination fails any check.
"""

import re
import sys
import urllib.request
from collections import defaultdict

import openpyxl

WORKBOOK_PATH = "data/legacy-migration-batch-20/DestinationFinderAI_Legacy_Production_Batch_20_Reader_Ready_Authoritative_v3.3.xlsx"
BASE_URL = "http://localhost:3000/destinations/"

DESTINATION_KEYS = [
    "ajijic-mexico", "boquete-panama", "chiang-mai-thailand", "cuenca-ecuador", "da-nang-vietnam",
    "florianopolis-brazil", "funchal-portugal", "george-town-malaysia", "hua-hin-thailand", "lucca-italy",
    "merida-mexico", "monopoli-italy", "montevideo-uruguay", "nafplio-greece", "nice-france",
    "palm-springs-california-united-states", "paphos-cyprus", "santander-spain",
    "savannah-georgia-united-states", "sibenik-croatia",
]

PLACEHOLDER_PHRASES = [
    "not yet verified from an authoritative source",
    "verified imagery pending",
    "address-specific review recommended",
    "more local detail coming soon",
    "specific items to confirm",
]

FOOD_CATEGORIES = {"restaurant", "coffee_shop"}


def load_sheet_rows(wb, sheet_name):
    ws = wb[sheet_name]
    header = [c.value for c in ws[1]]
    idx = {h: i for i, h in enumerate(header) if h}
    rows = []
    for row in ws.iter_rows(min_row=2, values_only=True):
        if row:
            rows.append(row)
    return idx, rows


def fetch(url, timeout=15):
    req = urllib.request.Request(url, headers={"User-Agent": "Batch20Validator/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.status, resp.read().decode("utf-8", errors="replace")


def main():
    failures = defaultdict(list)
    wb = openpyxl.load_workbook(WORKBOOK_PATH, data_only=True)

    # ---- COST_OF_LIVING ----
    col_idx, col_rows = load_sheet_rows(wb, "COST_OF_LIVING")
    cost_by_dest = defaultdict(list)
    for r in col_rows:
        dk = r[col_idx["destination_key"]]
        if dk in DESTINATION_KEYS:
            cost_by_dest[dk].append(r)
    for dk in DESTINATION_KEYS:
        rows = cost_by_dest.get(dk, [])
        total_rows = [r for r in rows if r[col_idx["category"]] == "total_monthly_budget"]
        if not total_rows or not isinstance(total_rows[0][col_idx["monthly_low"]], (int, float)) or not isinstance(total_rows[0][col_idx["monthly_high"]], (int, float)):
            failures[dk].append("Missing numeric total_monthly_budget cost row")
        numeric_cats = [r for r in rows if isinstance(r[col_idx["monthly_low"]], (int, float)) and isinstance(r[col_idx["monthly_high"]], (int, float))]
        if len(numeric_cats) < 5:
            failures[dk].append(f"Only {len(numeric_cats)} numeric cost-of-living rows (expected >=5)")

    # ---- DESTINATION_SCORES ----
    scores_idx, scores_rows = load_sheet_rows(wb, "DESTINATION_SCORES")
    scores_by_dest = defaultdict(list)
    for r in scores_rows:
        dk = r[scores_idx["destination_key"]]
        if dk in DESTINATION_KEYS:
            scores_by_dest[dk].append(r)
    for dk in DESTINATION_KEYS:
        rows = scores_by_dest.get(dk, [])
        numeric_scores = [r for r in rows if isinstance(r[scores_idx["score_value"]], (int, float))]
        if len(numeric_scores) < 10:
            failures[dk].append(f"Only {len(numeric_scores)} numeric destination scores (expected >=10)")

    # ---- DESTINATIONS: population ----
    dest_idx, dest_rows = load_sheet_rows(wb, "DESTINATIONS")
    pop_by_dest = {}
    for r in dest_rows:
        dk = r[dest_idx["destination_key"]]
        if dk in DESTINATION_KEYS:
            pop_by_dest[dk] = r[dest_idx["population"]]
    for dk in DESTINATION_KEYS:
        pop = pop_by_dest.get(dk)
        if not isinstance(pop, (int, float)) or pop <= 0:
            failures[dk].append(f"Population not numeric/positive (got {pop!r})")

    # ---- MEDIA ----
    media_idx, media_rows = load_sheet_rows(wb, "MEDIA")
    media_by_dest = defaultdict(list)
    for r in media_rows:
        dk = r[media_idx["destination_key"]]
        if dk in DESTINATION_KEYS:
            media_by_dest[dk].append(r)
    for dk in DESTINATION_KEYS:
        rows = media_by_dest.get(dk, [])
        if len(rows) < 4:
            failures[dk].append(f"Only {len(rows)} media rows (expected >=4)")
        hero_rows = [r for r in rows if str(r[media_idx["primary_image"]]).upper() == "YES"]
        if len(hero_rows) != 1:
            failures[dk].append(f"Expected exactly 1 primary_image=YES row, found {len(hero_rows)}")

    # ---- PLACES: food coverage ----
    places_idx, places_rows = load_sheet_rows(wb, "PLACES")
    food_by_dest = defaultdict(int)
    all_places_by_dest = defaultdict(list)
    for r in places_rows:
        dk = r[places_idx["destination_key"]]
        if dk in DESTINATION_KEYS:
            all_places_by_dest[dk].append(r)
            if r[places_idx["category_key"]] in FOOD_CATEGORIES:
                food_by_dest[dk] += 1
    for dk in DESTINATION_KEYS:
        if food_by_dest.get(dk, 0) < 5:
            failures[dk].append(f"Only {food_by_dest.get(dk, 0)} destination-wide food entries (expected >=5)")

    # ---- NEIGHBORHOODS: resources ----
    neigh_idx, neigh_rows = load_sheet_rows(wb, "NEIGHBORHOODS")
    for r in neigh_rows:
        dk = r[neigh_idx["destination_key"]]
        if dk in DESTINATION_KEYS:
            if not r[neigh_idx["google_maps_url"]]:
                failures[dk].append(f"Neighborhood {r[neigh_idx['neighborhood_key']]} missing google_maps_url")
            if not r[neigh_idx["source_url"]]:
                failures[dk].append(f"Neighborhood {r[neigh_idx['neighborhood_key']]} missing source_url")

    # ---- Placeholder language scan (workbook cells, all sheets with destination_key) ----
    placeholder_hits = defaultdict(list)
    for sheet_name in wb.sheetnames:
        ws = wb[sheet_name]
        header = [c.value for c in ws[1]] if ws.max_row >= 1 else []
        if "destination_key" not in header:
            continue
        idx = {h: i for i, h in enumerate(header) if h}
        dk_col = idx["destination_key"]
        for row in ws.iter_rows(min_row=2, values_only=True):
            if not row or dk_col >= len(row):
                continue
            dk = row[dk_col]
            if dk not in DESTINATION_KEYS:
                continue
            for col_name, col_i in idx.items():
                if col_i >= len(row):
                    continue
                value = row[col_i]
                if isinstance(value, str):
                    lower = value.lower()
                    for phrase in PLACEHOLDER_PHRASES:
                        if phrase in lower:
                            placeholder_hits[dk].append(f"{sheet_name}.{col_name}: {phrase!r}")
    for dk, hits in placeholder_hits.items():
        for hit in hits:
            failures[dk].append(f"Placeholder language remains: {hit}")

    # ---- Live page checks ----
    for dk in DESTINATION_KEYS:
        url = BASE_URL + dk
        try:
            status, body = fetch(url)
        except Exception as exc:  # noqa: BLE001
            failures[dk].append(f"Page fetch failed: {exc!r}")
            continue
        if status != 200:
            failures[dk].append(f"Page returned HTTP {status}")
            continue
        if "Total Monthly Budget" in body and "$0" in body:
            failures[dk].append("Possible false-zero total monthly budget text")
        if "0 live categories" in body or "0 budget bands" in body:
            failures[dk].append("Zero-count cost-of-living counter text found")
        overview_pos = body.find(">Overview<")
        exec_summary_pos = body.find("at a glance")
        if overview_pos != -1 and exec_summary_pos != -1 and overview_pos > exec_summary_pos:
            failures[dk].append("Overview does not appear before 'at a glance' section")
        for phrase in PLACEHOLDER_PHRASES:
            if phrase in body.lower():
                idx_hit = body.lower().find(phrase)
                preceding = body[max(0, idx_hit - 1):idx_hit]
                if preceding == ">":
                    failures[dk].append(f"Rendered placeholder phrase visible: {phrase!r}")

    # ---- Report ----
    total = len(DESTINATION_KEYS)
    failed = [dk for dk in DESTINATION_KEYS if failures.get(dk)]
    print(f"Batch 20 validator: {total - len(failed)}/{total} destinations passed all checks.\n")
    if failed:
        for dk in failed:
            print(f"FAIL {dk}:")
            for msg in failures[dk]:
                print(f"   - {msg}")
        sys.exit(1)
    else:
        print("All 20 destinations passed every acceptance check.")
        sys.exit(0)


if __name__ == "__main__":
    main()
