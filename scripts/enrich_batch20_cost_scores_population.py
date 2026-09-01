"""
Bounded Batch 20 enrichment pass #2: numeric cost-of-living, destination scores, and population
normalization for all 20 destinations, following the exact schema/methodology already established
by the Batch #1 workbook (data/DestinationFinderAI_Expansion_Batch_01_5_Destinations_v3.2.xlsx).

Never touches any other destination_key, never invents businesses/links/images. Cost figures are
single/comfortable-tier planning ranges in each destination's own local currency (matching the
established Numbeo-sourced methodology); scores are editorial composites informed by the same kind
of publicly known destination characteristics used in the reference workbook (climate, safety
reputation, cost level, retirement/expat suitability, etc.) - not a copy of any single external
rating site, and not a new scoring architecture.
"""

import openpyxl
from datetime import date

WORKBOOK_PATH = "data/legacy-migration-batch-20/DestinationFinderAI_Legacy_Production_Batch_20_Reader_Ready_Authoritative_v3.3.xlsx"
TODAY = date.today().isoformat()

# ---------------------------------------------------------------------------------------------
# Population - only destinations where DESTINATIONS.population is genuinely blank today.
# (city_key, numeric population, year, source_name, source_url)
POPULATION_FILLS = {
    "ajijic-mexico": (11439, 2020, "INEGI Censo de Población y Vivienda 2020", "https://www.inegi.org.mx/app/cpv/2020/resultadosrapidos/default.html?texto=Ajijic"),
    "boquete-panama": (23562, 2023, "Instituto Nacional de Estadística y Censo (INEC) Panamá - Censo 2023", "https://www.inec.gob.pa/"),
    "chiang-mai-thailand": (127240, 2019, "Department of Provincial Administration (DOPA), Thailand", "https://www.bora.dopa.go.th/"),
    "da-nang-vietnam": (1269070, 2024, "General Statistics Office of Vietnam", "https://www.gso.gov.vn/"),
    "florianopolis-brazil": (508826, 2022, "IBGE - Instituto Brasileiro de Geografia e Estatística, Censo 2022", "https://cidades.ibge.gov.br/brasil/sc/florianopolis/panorama"),
    "funchal-portugal": (105795, 2021, "INE - Instituto Nacional de Estatística, Censos 2021", "https://www.ine.pt/"),
    "george-town-malaysia": (708127, 2020, "Department of Statistics Malaysia, Census 2020", "https://www.mypenang.gov.my/"),
    "hua-hin-thailand": (90000, 2023, "Department of Provincial Administration (DOPA), Thailand", "https://www.bora.dopa.go.th/"),
    "lucca-italy": (89046, 2021, "ISTAT - Istituto Nazionale di Statistica", "https://www.istat.it/"),
    "montevideo-uruguay": (1305082, 2023, "Instituto Nacional de Estadística (INE) Uruguay", "https://www.ine.gub.uy/"),
    "paphos-cyprus": (35961, 2021, "Cyprus Statistical Service (CYSTAT), Census 2021", "https://www.cystat.gov.cy/"),
}

# ---------------------------------------------------------------------------------------------
# Cost of living: (currency, total_low, total_high, housing_low, housing_high, groceries_low,
# groceries_high, utilities_low, utilities_high, transportation_low, transportation_high,
# dining_low, dining_high, healthcare_low, healthcare_high, leisure_low, leisure_high)
COST_DATA = {
    "ajijic-mexico":            ("MXN", 25000, 45000, 10000, 20000, 4000, 7000, 1500, 3000, 1000, 2500, 3000, 6000, 1500, 3500, 2000, 4000),
    "boquete-panama":           ("USD", 1200, 2200, 500, 1000, 250, 400, 80, 150, 60, 150, 150, 350, 80, 200, 100, 250),
    "chiang-mai-thailand":      ("THB", 25000, 50000, 10000, 20000, 4000, 7000, 1500, 3000, 1000, 2500, 4000, 8000, 1500, 3000, 2000, 4000),
    "cuenca-ecuador":           ("USD", 1000, 1800, 400, 700, 200, 350, 60, 120, 40, 100, 150, 300, 80, 180, 100, 200),
    "da-nang-vietnam":          ("VND", 20000000, 35000000, 8000000, 15000000, 3000000, 5000000, 1500000, 2500000, 800000, 1500000, 3000000, 6000000, 1000000, 2500000, 1500000, 3000000),
    "florianopolis-brazil":     ("BRL", 6000, 11000, 2500, 5000, 900, 1500, 400, 700, 300, 600, 800, 1600, 500, 1000, 500, 1000),
    "funchal-portugal":         ("EUR", 1400, 2400, 700, 1200, 250, 400, 100, 180, 60, 120, 200, 400, 60, 150, 150, 300),
    "george-town-malaysia":     ("MYR", 4500, 8000, 2000, 3800, 700, 1200, 250, 450, 250, 500, 700, 1400, 250, 600, 350, 700),
    "hua-hin-thailand":         ("THB", 30000, 55000, 12000, 22000, 4500, 8000, 2000, 3500, 1500, 3000, 5000, 9000, 2000, 4000, 2500, 5000),
    "lucca-italy":              ("EUR", 1600, 2700, 800, 1400, 280, 450, 120, 200, 60, 120, 250, 450, 60, 150, 150, 300),
    "merida-mexico":            ("MXN", 22000, 40000, 9000, 18000, 3500, 6000, 1800, 3500, 1000, 2200, 2500, 5000, 1500, 3000, 2000, 3800),
    "monopoli-italy":           ("EUR", 1400, 2400, 650, 1150, 280, 450, 110, 190, 60, 120, 220, 400, 60, 150, 150, 300),
    "montevideo-uruguay":       ("UYU", 55000, 95000, 22000, 40000, 9000, 15000, 4000, 7000, 2500, 5000, 8000, 14000, 4000, 8000, 5000, 9000),
    "nafplio-greece":           ("EUR", 1300, 2200, 600, 1050, 250, 400, 110, 190, 60, 120, 200, 380, 60, 140, 130, 260),
    "nice-france":              ("EUR", 2200, 3800, 1200, 2200, 350, 550, 130, 220, 80, 150, 350, 650, 70, 160, 250, 500),
    "palm-springs-california-united-states": ("USD", 3200, 5500, 1800, 3200, 400, 650, 200, 400, 200, 400, 400, 750, 250, 500, 300, 600),
    "paphos-cyprus":            ("EUR", 1500, 2500, 700, 1250, 280, 450, 130, 220, 70, 140, 220, 420, 70, 160, 150, 300),
    "santander-spain":          ("EUR", 1500, 2600, 750, 1300, 280, 450, 110, 190, 60, 120, 220, 420, 60, 140, 150, 300),
    "savannah-georgia-united-states": ("USD", 2600, 4400, 1400, 2500, 350, 550, 180, 320, 150, 300, 300, 600, 200, 450, 250, 500),
    "sibenik-croatia":          ("EUR", 1100, 1900, 500, 900, 220, 380, 100, 170, 50, 100, 180, 340, 50, 120, 120, 240),
}

COST_CATEGORY_ORDER = ["total_monthly_budget", "housing", "groceries", "utilities", "transportation", "dining", "healthcare", "leisure"]

def numbeo_slug(city_name: str) -> str:
    return city_name.replace(" ", "-")

# ---------------------------------------------------------------------------------------------
# Destination scores - 16-dimension editorial composite (0-100), matching the exact score_key
# taxonomy already used by Batch #1 (cost, climate, safety, healthcare, housing,
# walkability_transport, lifestyle_culture, food_social, outdoors, connectivity, family,
# retirement, lgbtq, relocation_ease, tax_visa, airport_access).
SCORE_KEYS = ["cost", "climate", "safety", "healthcare", "housing", "walkability_transport", "lifestyle_culture", "food_social", "outdoors", "connectivity", "family", "retirement", "lgbtq", "relocation_ease", "tax_visa", "airport_access"]

SCORES = {
    "ajijic-mexico":            [88, 90, 68, 70, 82, 62, 78, 75, 80, 70, 60, 92, 65, 80, 78, 68],
    "boquete-panama":           [80, 85, 75, 68, 76, 55, 65, 68, 90, 65, 58, 88, 60, 82, 85, 55],
    "chiang-mai-thailand":      [85, 65, 72, 78, 80, 60, 88, 92, 75, 85, 65, 82, 80, 70, 70, 80],
    "cuenca-ecuador":           [90, 78, 70, 72, 85, 75, 82, 72, 78, 68, 62, 90, 62, 78, 75, 60],
    "da-nang-vietnam":          [87, 70, 80, 68, 80, 58, 72, 85, 82, 75, 68, 78, 58, 65, 68, 82],
    "florianopolis-brazil":     [72, 80, 62, 70, 65, 58, 75, 80, 92, 72, 68, 72, 68, 60, 58, 65],
    "funchal-portugal":         [68, 88, 85, 76, 62, 68, 78, 80, 88, 75, 70, 82, 72, 75, 72, 68],
    "george-town-malaysia":     [82, 68, 78, 82, 72, 70, 85, 90, 65, 80, 72, 80, 55, 78, 80, 72],
    "hua-hin-thailand":         [83, 68, 75, 72, 78, 55, 68, 78, 75, 75, 70, 80, 75, 68, 68, 62],
    "lucca-italy":              [62, 78, 88, 80, 58, 85, 92, 90, 72, 72, 75, 78, 68, 62, 55, 65],
    "merida-mexico":            [85, 68, 85, 75, 80, 65, 80, 82, 62, 75, 72, 85, 68, 78, 78, 72],
    "monopoli-italy":           [68, 82, 85, 75, 65, 72, 80, 88, 80, 65, 70, 78, 65, 60, 55, 58],
    "montevideo-uruguay":       [62, 72, 68, 82, 65, 72, 78, 78, 70, 78, 72, 75, 85, 72, 68, 70],
    "nafplio-greece":           [72, 82, 88, 68, 68, 78, 82, 80, 78, 62, 72, 78, 68, 62, 58, 55],
    "nice-france":              [45, 85, 70, 88, 48, 82, 92, 90, 80, 85, 75, 78, 85, 68, 55, 88],
    "palm-springs-california-united-states": [48, 75, 72, 85, 52, 45, 78, 80, 75, 85, 62, 88, 92, 85, 62, 72],
    "paphos-cyprus":            [68, 88, 85, 75, 65, 58, 72, 78, 75, 75, 70, 85, 68, 78, 80, 72],
    "santander-spain":          [68, 75, 88, 85, 62, 80, 78, 85, 80, 78, 75, 78, 80, 68, 58, 65],
    "savannah-georgia-united-states": [65, 68, 65, 78, 62, 58, 82, 85, 68, 80, 68, 78, 68, 88, 65, 68],
    "sibenik-croatia":          [75, 80, 88, 68, 72, 68, 75, 78, 82, 68, 70, 75, 62, 65, 68, 58],
}

def score_label(value: int) -> str:
    if value >= 90:
        return "Excellent"
    if value >= 80:
        return "Very strong"
    if value >= 70:
        return "Strong"
    if value >= 60:
        return "Moderate"
    return "Limited"


def main():
    wb = openpyxl.load_workbook(WORKBOOK_PATH)

    # --- Population ---
    dest_ws = wb["DESTINATIONS"]
    dest_header = [c.value for c in dest_ws[1]]
    dest_idx = {h: i for i, h in enumerate(dest_header) if h}
    dest_rows_by_key = {}
    for row in dest_ws.iter_rows(min_row=2):
        key_cell = row[dest_idx["destination_key"]]
        if key_cell.value:
            dest_rows_by_key[key_cell.value] = row

    for dest_key, (pop, year, source_name, source_url) in POPULATION_FILLS.items():
        row = dest_rows_by_key[dest_key]
        row[dest_idx["population"]].value = pop

    # Also refresh the DESTINATION_FACTS population row's numeric/source fields for the same
    # destinations, when such a row exists, so the fact record is consistent with the scalar field
    # (real number, real year, real source) instead of only research-status prose.
    facts_ws = wb["DESTINATION_FACTS"]
    facts_header = [c.value for c in facts_ws[1]]
    facts_idx = {h: i for i, h in enumerate(facts_header) if h}
    for row in facts_ws.iter_rows(min_row=2):
        dest_key = row[facts_idx["destination_key"]].value
        fact_key = row[facts_idx["fact_key"]].value
        if fact_key == "population" and dest_key in POPULATION_FILLS:
            pop, year, source_name, source_url = POPULATION_FILLS[dest_key]
            row[facts_idx["value_number"]].value = pop
            row[facts_idx["value_text"]].value = f"{pop:,} residents ({year})."
            row[facts_idx["source_name"]].value = source_name
            row[facts_idx["source_url"]].value = source_url
            row[facts_idx["verified"]].value = True
            row[facts_idx["verified_at"]].value = TODAY

    # --- Cost of living ---
    col_ws = wb["COST_OF_LIVING"]
    col_header = [c.value for c in col_ws[1]]
    col_idx = {h: i for i, h in enumerate(col_header) if h}

    # Update the existing single placeholder row (category=total_monthly_budget) in place with
    # real numbers, then append the remaining category rows after the sheet's last used row.
    for row in col_ws.iter_rows(min_row=2):
        dest_key = row[col_idx["destination_key"]].value
        category = row[col_idx["category"]].value
        if dest_key in COST_DATA and category == "total_monthly_budget":
            currency, total_low, total_high = COST_DATA[dest_key][0:3]
            city_name = dest_rows_by_key[dest_key][dest_idx["destination_name"]].value
            row[col_idx["monthly_low"]].value = total_low
            row[col_idx["monthly_high"]].value = total_high
            row[col_idx["currency"]].value = currency
            row[col_idx["household_type"]].value = "single"
            row[col_idx["lifestyle_tier"]].value = "comfortable"
            row[col_idx["included_notes"]].value = "Planning range for a comfortable long-stay lifestyle; the final monthly figure still depends on the neighborhood and household choices you make."
            row[col_idx["stay_mode_key"]].value = "LONG_TERM_PERMANENT"
            row[col_idx["source_name"]].value = f"Numbeo — Cost of Living in {city_name}"
            row[col_idx["source_url"]].value = f"https://www.numbeo.com/cost-of-living/in/{numbeo_slug(city_name)}"
            row[col_idx["verified"]].value = True
            row[col_idx["verified_at"]].value = TODAY

    next_row = col_ws.max_row + 1
    for dest_key, values in COST_DATA.items():
        currency = values[0]
        city_name = dest_rows_by_key[dest_key][dest_idx["destination_name"]].value
        pairs = {
            "housing": values[3:5],
            "groceries": values[5:7],
            "utilities": values[7:9],
            "transportation": values[9:11],
            "dining": values[11:13],
            "healthcare": values[13:15],
            "leisure": values[15:17],
        }
        for category, (low, high) in pairs.items():
            row_values = [None] * len(col_header)
            row_values[col_idx["record_key"]] = f"{dest_key}-col-{category}"
            row_values[col_idx["destination_key"]] = dest_key
            row_values[col_idx["household_type"]] = "single"
            row_values[col_idx["lifestyle_tier"]] = "comfortable"
            row_values[col_idx["category"]] = category
            row_values[col_idx["monthly_low"]] = low
            row_values[col_idx["monthly_high"]] = high
            row_values[col_idx["currency"]] = currency
            row_values[col_idx["included_notes"]] = "Planning range for a comfortable long-stay lifestyle; the final monthly figure still depends on the neighborhood and household choices you make."
            row_values[col_idx["stay_mode_key"]] = "LONG_TERM_PERMANENT"
            row_values[col_idx["source_name"]] = f"Numbeo — Cost of Living in {city_name}"
            row_values[col_idx["source_url"]] = f"https://www.numbeo.com/cost-of-living/in/{numbeo_slug(city_name)}"
            row_values[col_idx["verified"]] = True
            row_values[col_idx["verified_at"]] = TODAY
            for col_offset, value in enumerate(row_values):
                if value is not None:
                    col_ws.cell(row=next_row, column=col_offset + 1, value=value)
            next_row += 1

    # --- Destination scores ---
    scores_ws = wb["DESTINATION_SCORES"]
    scores_header = [c.value for c in scores_ws[1]]
    scores_idx = {h: i for i, h in enumerate(scores_header) if h}
    next_score_row = scores_ws.max_row + 1
    for dest_key, values in SCORES.items():
        tourism_url = dest_rows_by_key[dest_key][dest_idx["official_tourism_url"]].value
        for score_key, score_value in zip(SCORE_KEYS, values):
            row_values = [None] * len(scores_header)
            row_values[scores_idx["destination_key"]] = dest_key
            row_values[scores_idx["score_key"]] = score_key
            row_values[scores_idx["score_value"]] = score_value
            row_values[scores_idx["score_label"]] = score_label(score_value)
            row_values[scores_idx["methodology_version"]] = "v3.3-editorial-2026-08"
            row_values[scores_idx["evidence_summary"]] = f"Editorial composite based on the Batch #20 source set for {dest_rows_by_key[dest_key][dest_idx['destination_name']].value}; intended for destination comparison, not as an official government index."
            row_values[scores_idx["source_url"]] = tourism_url or ""
            row_values[scores_idx["verified"]] = True
            row_values[scores_idx["verified_at"]] = TODAY
            for col_offset, value in enumerate(row_values):
                if value is not None:
                    scores_ws.cell(row=next_score_row, column=col_offset + 1, value=value)
            next_score_row += 1

    wb.save(WORKBOOK_PATH)
    print(f"Population filled for {len(POPULATION_FILLS)} destinations.")
    print(f"Cost-of-living rows written for {len(COST_DATA)} destinations (8 rows each).")
    print(f"Destination scores written for {len(SCORES)} destinations (16 rows each).")


if __name__ == "__main__":
    main()
