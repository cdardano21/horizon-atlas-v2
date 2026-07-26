from __future__ import annotations

import datetime as dt
import json
from pathlib import Path

from import_dri import read_workbook_rows, select_data_table, slugify


WORKBOOK_PATH = Path(
    "/Users/samuelcurtdardano/Library/Mobile Documents/com~apple~CloudDocs/Dardano_Retirement_Index_300_DRI_7_0_Live_Source_Framework.xlsx"
)
ATLAS_WORKBOOK_PATH = Path(
    "/Users/samuelcurtdardano/Library/Mobile Documents/com~apple~CloudDocs/Dardano_Global_Retirement_Atlas_4_0_300_Cities.xlsx"
)
OUTPUT_PATH = Path(__file__).resolve().parent.parent / "app/lib/generated-command-center-seeds.ts"
JSON_OUTPUT_PATH = Path(__file__).resolve().parent.parent / "supabase/generated-command-center-seeds.json"


SCORE_FIELDS = [
    ("Lifestyle", "Lifestyle"),
    ("Safety", "Safety"),
    ("Cleanliness", "Cleanliness"),
    ("Healthcare", "Healthcare"),
    ("Walkability", "Walkability"),
    ("Cost Value", "Cost Value"),
    ("Summer Escape", "Summer Escape"),
    ("Coffee", "Coffee"),
    ("Photography", "Photography"),
    ("Restaurants", "Restaurants"),
    ("Airport Access", "Airport Access"),
]


def to_number(value: str | None) -> float | None:
    if value is None:
        return None
    text = str(value).strip().replace(",", "")
    if not text:
        return None
    try:
        return float(text)
    except ValueError:
        return None


def to_int_score(value: str | None) -> int | None:
    numeric = to_number(value)
    if numeric is None:
        return None
    if numeric <= 10:
        return int(round(numeric * 10))
    return int(round(numeric))


def source_type(url: str) -> str:
    lowered = url.lower()
    if "wikipedia.org" in lowered:
        return "encyclopedia"
    if "numbeo.com" in lowered:
        return "user_contributed_database"
    if "gov" in lowered:
        return "government_portal"
    return "source_link"


def confidence_band(value: str | None) -> str:
    numeric = to_number(value)
    if numeric is None:
        return "medium"
    if numeric >= 85:
        return "high"
    if numeric >= 65:
        return "medium"
    return "low"


def verification_status(value: str | None) -> str:
    text = (value or "").strip().lower()
    if "verified" in text:
        return "verified"
    if "partial" in text:
        return "estimated"
    if text:
        return "estimated"
    return "in_progress"


def verification_object(row: dict[str, str]) -> dict[str, object]:
    primary_source = next(
        (row.get(key, "").strip() for key in ("Source 1", "Source 2", "Source 3") if row.get(key, "").strip()),
        "",
    )
    return {
        "sourceUrl": primary_source or None,
        "sourceOrganization": "Dardano Retirement Index 7.0",
        "sourceType": source_type(primary_source) if primary_source else "curated_index",
        "confidenceLevel": confidence_band(row.get("Confidence %")),
        "verificationStatus": verification_status(row.get("Verification Status")),
        "lastVerifiedAt": dt.date.today().isoformat(),
    }


def metric(
    key: str,
    label: str,
    display_value: str,
    verification: dict[str, object],
    value: str | None = None,
    unit: str | None = None,
) -> dict[str, object]:
    return {
        "key": key,
        "label": label,
        "value": value if value is not None else display_value,
        "unit": unit,
        "displayValue": display_value,
        "verification": verification,
    }


def scorecard_row(category: str, score: int, explanation: str, underlying: str, verification: dict[str, object]) -> dict[str, object]:
    return {
        "category": category,
        "score": score,
        "explanation": explanation,
        "underlyingMeasurements": underlying,
        "personalizedWeight": None,
        "verification": verification,
    }


def record_row(row_id: str, name: str, subtitle: str, value1: str, value2: str, value3: str, url: str | None, verification: dict[str, object]) -> dict[str, object]:
    return {
        "id": row_id,
        "name": name,
        "subtitle": subtitle,
        "value1": value1,
        "value2": value2,
        "value3": value3,
        "url": url,
        "verification": verification,
    }


def resource_row(resource_id: str, category: str, title: str, description: str, url: str) -> dict[str, object]:
    return {
        "id": resource_id,
        "category": category,
        "title": title,
        "description": description,
        "url": url,
        "sourceType": source_type(url),
        "verifiedAt": dt.date.today().isoformat(),
    }
def build_seed(row: dict[str, str], atlas_row: dict[str, str] | None) -> dict[str, object]:
    city = row["City"].strip()
    country = row["Country"].strip()
    slug = f"{slugify(city)}-{slugify(country)}"
    verification = verification_object(row)
    confidence = row.get("Confidence %", "").strip()
    verification_text = row.get("Verification Status", "").strip() or "Review current sources"
    visa_text = row.get("Visa / Stay Framework", "").strip() or "Country-specific"
    rent_value = row.get("Rent/mo", "").strip()
    total_value = row.get("Total/mo for 2", "").strip()
    dri_score = row.get("DRI Score", "").strip()
    country_specific_transport = row.get("Country", "").strip()

    quick_metrics = []
    if dri_score:
        quick_metrics.append(metric("dri_score", "DRI score", dri_score, verification, dri_score))
    if confidence:
        quick_metrics.append(metric("confidence_pct", "Confidence", f"{int(round(float(confidence)))}%", verification, confidence))
    if total_value:
        quick_metrics.append(metric("total_monthly_two", "Estimated monthly total for two", f"EUR {int(round(float(total_value))):,}", verification, total_value))
    if rent_value:
        quick_metrics.append(metric("monthly_rent", "Indicative monthly rent", f"EUR {int(round(float(rent_value))):,}", verification, rent_value))
    if atlas_row and atlas_row.get("Best Months", "").strip():
        quick_metrics.append(metric("best_months", "Best months", atlas_row["Best Months"].strip(), verification, atlas_row["Best Months"].strip()))
    one_month_score = to_int_score(atlas_row.get("One-Month Score") if atlas_row else None)
    if one_month_score is not None:
        quick_metrics.append(metric("one_month_score", "One-month stay score", f"{one_month_score}/100", verification, str(one_month_score), "/100"))
    hidden_gem_score = to_int_score(atlas_row.get("Hidden Gem Score") if atlas_row else None)
    if hidden_gem_score is not None:
        quick_metrics.append(metric("hidden_gem_score", "Hidden gem score", f"{hidden_gem_score}/100", verification, str(hidden_gem_score), "/100"))
    quick_metrics.append(metric("visa_framework", "Visa / stay framework", visa_text, verification, visa_text))
    quick_metrics.append(metric("verification_state", "Verification status", verification_text, verification, verification_text))
    airport_score = to_int_score(row.get("Airport Access"))
    if airport_score is not None:
        quick_metrics.append(metric("airport_access_score", "Airport access score", f"{airport_score}/100", verification, str(airport_score), "/100"))

    scorecard = []
    for column, label in SCORE_FIELDS:
        score = to_int_score(row.get(column))
        if score is None:
            continue
        raw_value = row.get(column, "").strip()
        explanation_map = {
            "Lifestyle": "Composite lifestyle score based on the DRI model's place-quality weighting.",
            "Safety": "Safety score from the DRI comparative model.",
            "Cleanliness": "Cleanliness and day-to-day upkeep score from the DRI comparative model.",
            "Healthcare": "Healthcare access and quality score from the DRI comparative model.",
            "Walkability": "Walkability score from the DRI comparative model.",
            "Cost Value": "Relative cost-value score from the DRI comparative model.",
            "Summer Escape": "Warm-season comfort score from the DRI comparative model.",
            "Coffee": "Cafe culture score from the DRI comparative model.",
            "Photography": "Visual appeal score from the DRI comparative model.",
            "Restaurants": "Restaurant and food-scene score from the DRI comparative model.",
            "Airport Access": f"Airport access score using {country_specific_transport or 'regional'} connectivity assumptions in the DRI model.",
        }
        underlying = f"Model input: {raw_value} / 10" if raw_value else "Model-derived comparative score"
        scorecard.append(scorecard_row(label, score, explanation_map.get(label, f"{label} score from the DRI comparative model."), underlying, verification))

    cost_of_living = []
    if total_value:
        cost_of_living.append(metric("monthly_total_two", "Estimated monthly total for two", f"EUR {int(round(float(total_value))):,}", verification, total_value))
    if rent_value:
        cost_of_living.append(metric("rent_month", "Indicative monthly rent", f"EUR {int(round(float(rent_value))):,}", verification, rent_value))
    cost_score = to_int_score(row.get("Cost Value"))
    if cost_score is not None:
        cost_of_living.append(metric("cost_value_score", "Cost value score", f"{cost_score}/100", verification, str(cost_score), "/100"))

    housing_metrics = []
    if rent_value:
        housing_metrics.append(metric("rent_month", "Indicative monthly rent", f"EUR {int(round(float(rent_value))):,}", verification, rent_value))
    if total_value:
        housing_metrics.append(metric("budget_two", "Estimated monthly budget for two", f"EUR {int(round(float(total_value))):,}", verification, total_value))
    if atlas_row and atlas_row.get("🏡", "").strip() == "✓":
        housing_metrics.append(metric("home_buy_signal", "Home-buy signal", "Positive buy-side signal", verification, "Positive buy-side signal"))

    safety_metrics = []
    for column, label in (("Safety", "Safety score"), ("Cleanliness", "Cleanliness score")):
        score = to_int_score(row.get(column))
        if score is not None:
            safety_metrics.append(metric(slugify(label), label, f"{score}/100", verification, str(score), "/100"))

    food_metrics = []
    for column, label in (("Restaurants", "Restaurants score"), ("Coffee", "Coffee score")):
        score = to_int_score(row.get(column))
        if score is not None:
            food_metrics.append(metric(slugify(label), label, f"{score}/100", verification, str(score), "/100"))
    if atlas_row and atlas_row.get("☕", "").strip() == "✓":
        food_metrics.append(metric("cafe_presence", "Cafe culture signal", "Present in atlas shortlist", verification, "Present in atlas shortlist"))

    resources = []
    for index, key in enumerate(("Source 1", "Source 2", "Source 3"), start=1):
        source = row.get(key, "").strip()
        if source.startswith("http"):
            resources.append(resource_row(f"{slug}-source-{index}", "source", key, f"Workbook citation for {city}", source))

    recreation_rows = []
    if atlas_row and atlas_row.get("🌊", "").strip() == "✓":
        recreation_rows.append(record_row(f"{slug}-coastal-signal", "Coastal / water access", "Atlas shortlist feature", "Coastal or water orientation is explicitly flagged.", "Supports beach, marina, or waterfront lifestyle positioning.", "Validate the exact waterfront asset mix via source links below.", next((item["url"] for item in resources if isinstance(item, dict) and item.get("url")), None), verification))
    if atlas_row and atlas_row.get("⛳", "").strip() == "✓":
        recreation_rows.append(record_row(f"{slug}-golf-signal", "Golf signal", "Atlas shortlist feature", "Golf is explicitly flagged in the atlas shortlist.", "Use city-level sources to validate named courses and fee structure.", "Acts as a screening signal rather than a named-course database row.", next((item["url"] for item in resources if isinstance(item, dict) and item.get("url")), None), verification))

    school_rows = []
    if atlas_row and atlas_row.get("🌍", "").strip() == "✓":
        school_rows.append(record_row(f"{slug}-expat-signal", "International / expat signal", "Atlas shortlist feature", "Atlas flags this destination for broader international adaptability.", "Use school and language sources to confirm exact education depth.", "Screening signal only; not a named-school directory.", next((item["url"] for item in resources if isinstance(item, dict) and item.get("url")), None), verification))

    airport_metrics = []
    if airport_score is not None:
        airport_metrics.append(metric("airport_access_score", "Airport access score", f"{airport_score}/100", verification, str(airport_score), "/100"))

    healthcare_score = to_int_score(row.get("Healthcare"))
    healthcare_rows = []
    if healthcare_score is not None:
        healthcare_rows.append(
            record_row(
                f"{slug}-healthcare-model",
                "Healthcare model score",
                f"{healthcare_score}/100 comparative DRI score",
                f"Verification: {verification_text}",
                f"Confidence: {int(round(float(confidence)))}%" if confidence else "Confidence not supplied",
                "Use source links below to validate hospitals and specialists.",
                next((item["url"] for item in resources if isinstance(item, dict) and item.get("url")), None),
                verification,
            )
        )

    return {
        "slug": slug,
        "seed": {
            "dataConfidence": confidence_band(row.get("Confidence %")),
            "lastVerifiedAt": dt.date.today().isoformat(),
            "quickMetrics": quick_metrics,
            "scorecard": scorecard,
            "costOfLiving": cost_of_living,
            "housingMetrics": housing_metrics,
            "healthcareFacilities": healthcare_rows,
            "airports": [
                record_row(
                    f"{slug}-airport-framework",
                    "Airport access framework",
                    f"Airport access score: {airport_score}/100" if airport_score is not None else "Airport access score unavailable",
                    f"Country / region: {country_specific_transport}",
                    f"Verification: {verification_text}",
                    "Use source links below for airport-specific validation.",
                    next((item["url"] for item in resources if isinstance(item, dict) and item.get("url")), None),
                    verification,
                )
            ] if airport_score is not None else [],
            "recreationFacilities": recreation_rows,
            "schools": school_rows,
            "safetyMetrics": safety_metrics,
            "foodMetrics": food_metrics,
            "visaPrograms": [
                record_row(
                    f"{slug}-visa-framework",
                    "Visa / stay framework",
                    visa_text,
                    f"Country: {country}",
                    f"Verification: {verification_text}",
                    f"Confidence: {int(round(float(confidence)))}%" if confidence else "Confidence not supplied",
                    next((item["url"] for item in resources if isinstance(item, dict) and item.get("url")), None),
                    verification,
                )
            ],
            "resources": resources,
        },
    }


def main() -> int:
    rows = read_workbook_rows(WORKBOOK_PATH)
    header, table_rows = select_data_table(rows)
    records = [dict(zip(header, row + [""] * (len(header) - len(row)))) for row in table_rows]

    atlas_rows = read_workbook_rows(ATLAS_WORKBOOK_PATH)
    atlas_header, atlas_table_rows = select_data_table(atlas_rows)
    atlas_records = [dict(zip(atlas_header, row + [""] * (len(atlas_header) - len(row)))) for row in atlas_table_rows]
    atlas_by_slug = {
        f"{slugify(record['City'].strip())}-{slugify(record['Country'].strip())}": record
        for record in atlas_records
    }

    seeds = [
        build_seed(row, atlas_by_slug.get(f"{slugify(row['City'].strip())}-{slugify(row['Country'].strip())}"))
        for row in records
    ]
    seeds.sort(key=lambda item: item["slug"])

    lines = [
        'import type { LocalCommandCenterSeed } from "./local-command-center-seeds";',
        "",
        "export const generatedCommandCenterSeeds: Record<string, LocalCommandCenterSeed> = {",
    ]

    for item in seeds:
        lines.append(f'  {json.dumps(item["slug"])}: {json.dumps(item["seed"], ensure_ascii=False)},')

    lines.extend(["};", ""])
    OUTPUT_PATH.write_text("\n".join(lines), encoding="utf-8")
    JSON_OUTPUT_PATH.write_text(json.dumps({item["slug"]: item["seed"] for item in seeds}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(seeds)} generated command-center seeds to {OUTPUT_PATH}.")
    print(f"Wrote JSON seed export to {JSON_OUTPUT_PATH}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())