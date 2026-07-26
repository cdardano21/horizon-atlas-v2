from __future__ import annotations

import json
import re
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent
MERGED_JSON_INPUT_PATH = REPO_ROOT / "supabase/generated-command-center-seeds-merged.json"
BASE_JSON_INPUT_PATH = REPO_ROOT / "supabase/generated-command-center-seeds.json"
SQL_OUTPUT_PATH = REPO_ROOT / "supabase/generated-command-center-seed.sql"


METRIC_DATASET_CONFIG = {
    "quickMetrics": ("destination_core_metrics", "metric_key", "metric_label", "general"),
    "costOfLiving": ("cost_of_living_items", "item_key", "item_label", "cost"),
    "housingMetrics": ("housing_market_metrics", "metric_key", "metric_label", None),
    "internetMetrics": ("internet_metrics", "metric_key", "metric_label", "internet"),
    "safetyMetrics": ("safety_metrics", "metric_key", "metric_label", None),
    "foodMetrics": ("restaurants_or_food_metrics", "metric_key", "metric_label", "food"),
}

NAMED_RECORD_DATASET_CONFIG = {
    "neighborhoods": "neighborhoods",
    "healthcareFacilities": "healthcare_facilities",
    "airports": "airports",
    "golfCourses": "golf_courses",
    "recreationFacilities": "recreation_facilities",
    "schools": "schools",
    "visaPrograms": "visa_programs",
    "taxRules": "tax_rules",
}


def sql_quote(value: object | None) -> str:
    if value is None:
        return "null"
    text = str(value).replace("'", "''")
    return f"'{text}'"


def to_numeric(value: object | None) -> str:
    if value is None:
        return "null"
    text = str(value).strip()
    if not text:
        return "null"
    if re.fullmatch(r"-?\d+(?:\.\d+)?", text):
        return text
    return "null"


def build_verification_fields(verification: dict[str, object] | None) -> dict[str, str]:
    verification = verification or {}
    return {
        "source_url": sql_quote(verification.get("sourceUrl")),
        "source_organization": sql_quote(verification.get("sourceOrganization")),
        "source_type": sql_quote(verification.get("sourceType")),
        "confidence_level": sql_quote(verification.get("confidenceLevel") or "medium"),
        "verification_status": sql_quote(verification.get("verificationStatus") or "estimated"),
        "last_verified_at": sql_quote(verification.get("lastVerifiedAt")),
    }


def emit_delete(table: str, slug: str) -> str:
    return (
        f"delete from public.{table} using public.destinations_catalog d "
        f"where {table}.destination_id = d.id and d.slug = {sql_quote(slug)};"
    )


def emit_metric_insert(table: str, slug: str, rows: list[dict[str, object]], key_field: str, label_field: str, default_group: str | None) -> list[str]:
    statements: list[str] = []
    for index, row in enumerate(rows):
        verification = build_verification_fields(row.get("verification") if isinstance(row, dict) else None)
        metric_group = row.get("group") if isinstance(row, dict) else None
        unit = row.get("unit") if isinstance(row, dict) else None
        value = row.get("value") if isinstance(row, dict) else None
        display_value = row.get("displayValue") if isinstance(row, dict) else None
        value_numeric = to_numeric(value)
        value_text = sql_quote(value if value_numeric == "null" else None)
        statements.append(
            f"insert into public.{table} (destination_id, {key_field}, {label_field}, metric_group, value_numeric, value_text, unit, display_value, sort_order, source_url, source_organization, source_type, confidence_level, verification_status, last_verified_at) "
            f"select d.id, {sql_quote(row.get('key'))}, {sql_quote(row.get('label'))}, {sql_quote(metric_group or default_group)}, {value_numeric}, {value_text}, {sql_quote(unit)}, {sql_quote(display_value)}, {index}, {verification['source_url']}, {verification['source_organization']}, {verification['source_type']}, {verification['confidence_level']}, {verification['verification_status']}, {verification['last_verified_at']} "
            f"from public.destinations_catalog d where d.slug = {sql_quote(slug)};"
        )
    return statements


def emit_score_insert(slug: str, rows: list[dict[str, object]]) -> list[str]:
    statements: list[str] = []
    for index, row in enumerate(rows):
        verification = build_verification_fields(row.get("verification") if isinstance(row, dict) else None)
        statements.append(
            "insert into public.destination_scores (destination_id, category, score, explanation, underlying_measurements, personalized_weight, sort_order, source_url, source_organization, source_type, confidence_level, verification_status, last_verified_at) "
            f"select d.id, {sql_quote(row.get('category'))}, {to_numeric(row.get('score'))}, {sql_quote(row.get('explanation'))}, {sql_quote(row.get('underlyingMeasurements'))}, {to_numeric(row.get('personalizedWeight'))}, {index}, {verification['source_url']}, {verification['source_organization']}, {verification['source_type']}, {verification['confidence_level']}, {verification['verification_status']}, {verification['last_verified_at']} "
            f"from public.destinations_catalog d where d.slug = {sql_quote(slug)};"
        )
    return statements


def emit_named_record_insert(table: str, slug: str, rows: list[dict[str, object]]) -> list[str]:
    statements: list[str] = []
    for index, row in enumerate(rows):
        verification = build_verification_fields(row.get("verification") if isinstance(row, dict) else None)
        statements.append(
            f"insert into public.{table} (destination_id, name, subtitle, value_1, value_2, value_3, url, sort_order, source_url, source_organization, source_type, confidence_level, verification_status, last_verified_at) "
            f"select d.id, {sql_quote(row.get('name'))}, {sql_quote(row.get('subtitle'))}, {sql_quote(row.get('value1'))}, {sql_quote(row.get('value2'))}, {sql_quote(row.get('value3'))}, {sql_quote(row.get('url'))}, {index}, {verification['source_url']}, {verification['source_organization']}, {verification['source_type']}, {verification['confidence_level']}, {verification['verification_status']}, {verification['last_verified_at']} "
            f"from public.destinations_catalog d where d.slug = {sql_quote(slug)};"
        )
    return statements


def emit_resource_insert(slug: str, rows: list[dict[str, object]]) -> list[str]:
    statements: list[str] = []
    for index, row in enumerate(rows):
        statements.append(
            "insert into public.destination_resources (destination_id, category, title, description, url, source_type, sort_order, last_verified_at, verification_status, confidence_level) "
            f"select d.id, {sql_quote(row.get('category'))}, {sql_quote(row.get('title'))}, {sql_quote(row.get('description'))}, {sql_quote(row.get('url'))}, {sql_quote(row.get('sourceType'))}, {index}, {sql_quote(row.get('verifiedAt'))}, 'estimated', 'medium' "
            f"from public.destinations_catalog d where d.slug = {sql_quote(slug)};"
        )
    return statements


def emit_verification_row(slug: str, dataset_key: str, rows: list[dict[str, object]]) -> str | None:
    if not rows:
        return None
    verification = build_verification_fields(rows[0].get("verification") if isinstance(rows[0], dict) else None)
    return (
        "insert into public.data_verification_records (destination_id, dataset_key, verification_status, confidence_level, source_url, source_organization, source_type, last_verified_at) "
        f"select d.id, {sql_quote(dataset_key)}, {verification['verification_status']}, {verification['confidence_level']}, {verification['source_url']}, {verification['source_organization']}, {verification['source_type']}, {verification['last_verified_at']} "
        f"from public.destinations_catalog d where d.slug = {sql_quote(slug)};"
    )


def main() -> int:
    json_input_path = MERGED_JSON_INPUT_PATH if MERGED_JSON_INPUT_PATH.exists() else BASE_JSON_INPUT_PATH
    seeds = json.loads(json_input_path.read_text(encoding="utf-8"))
    statements = [
        "begin;",
        "",
        f"-- Generated from {json_input_path.relative_to(REPO_ROOT)}",
    ]

    all_tables = [
        "destination_core_metrics",
        "destination_scores",
        "cost_of_living_items",
        "housing_market_metrics",
        "healthcare_facilities",
        "airports",
        "golf_courses",
        "recreation_facilities",
        "schools",
        "internet_metrics",
        "visa_programs",
        "tax_rules",
        "safety_metrics",
        "restaurants_or_food_metrics",
        "destination_resources",
        "data_verification_records",
    ]

    for slug, seed in seeds.items():
        statements.append(f"-- {slug}")
        for table in all_tables:
            statements.append(emit_delete(table, slug))

        for seed_key, (table, key_field, label_field, default_group) in METRIC_DATASET_CONFIG.items():
            rows = seed.get(seed_key) or []
            if rows:
                statements.extend(emit_metric_insert(table, slug, rows, key_field, label_field, default_group))
                verification_stmt = emit_verification_row(slug, table, rows)
                if verification_stmt:
                    statements.append(verification_stmt)

        score_rows = seed.get("scorecard") or []
        if score_rows:
            statements.extend(emit_score_insert(slug, score_rows))
            verification_stmt = emit_verification_row(slug, "destination_scores", score_rows)
            if verification_stmt:
                statements.append(verification_stmt)

        for seed_key, table in NAMED_RECORD_DATASET_CONFIG.items():
            rows = seed.get(seed_key) or []
            if rows:
                statements.extend(emit_named_record_insert(table, slug, rows))
                verification_stmt = emit_verification_row(slug, table, rows)
                if verification_stmt:
                    statements.append(verification_stmt)

        resource_rows = seed.get("resources") or []
        if resource_rows:
            statements.extend(emit_resource_insert(slug, resource_rows))
            verification_stmt = emit_verification_row(slug, "destination_resources", [{"verification": {"verificationStatus": "estimated", "confidenceLevel": "medium", "lastVerifiedAt": resource_rows[0].get("verifiedAt")}}])
            if verification_stmt:
                statements.append(verification_stmt)

        statements.append("")

    statements.append("commit;")
    statements.append("")
    SQL_OUTPUT_PATH.write_text("\n".join(statements), encoding="utf-8")
    print(f"Wrote SQL seed export to {SQL_OUTPUT_PATH}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())