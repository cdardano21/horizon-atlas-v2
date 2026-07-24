from __future__ import annotations

import json
import re
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path


DEFAULT_WORKBOOK = Path(
    "/Users/samuelcurtdardano/Library/Group Containers/group.com.apple.coreservices.useractivityd/shared-pasteboard/items/E53A2F28-C06E-4124-AF77-1632ED390984/Dardano_Retirement_Index_300_DRI_3_5 2.xlsx"
)
REPO_ROOT = Path(__file__).resolve().parent.parent
DESTINATIONS_PATH = REPO_ROOT / "app/lib/destinations.ts"
CURATED_IMAGES_PATH = REPO_ROOT / "app/lib/curatedCityImages.ts"

NS = {"a": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
REL_NS = {"r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships"}

TITLE_ALIASES = {
    "St. John's": ["St. John's, Antigua", "Saint John's, Antigua and Barbuda"],
    "Sarande": ["Sarandë"],
    "Vlore": ["Vlorë"],
    "Shkoder": ["Shkodër"],
    "Korce": ["Korçë"],
    "Himare": ["Himarë"],
    "Gjirokaster": ["Gjirokastër", "Gjirokaster"],
    "Khor Fakkan": ["Khawr Fakkān"],
    "Nafplio": ["Nafplion"],
    "Malaga": ["Málaga"],
    "A Coruna": ["A Coruña"],
    "Cadaques": ["Cadaqués"],
    "Porec": ["Poreč"],
    "Mali Losinj": ["Mali Lošinj"],
    "Saint-Remy-de-Provence": ["Saint-Rémy-de-Provence"],
    "Vila Real de Santo Antonio": ["Vila Real de Santo António"],
}

CURATED_IMAGE_OVERRIDES_BY_SLUG = {
    "podgorica-montenegro": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/P064720-426794_-_Panoramic_view_of_Podgorica.jpg/3840px-P064720-426794_-_Panoramic_view_of_Podgorica.jpg",
    "alghero-italy": "https://commons.wikimedia.org/wiki/Special:FilePath/Alghero%20dalla%20spiaggia%20del%20lido.jpg",
    "desenzano-del-garda-italy": "https://upload.wikimedia.org/wikipedia/commons/a/ab/Old_port_of_Desenzano.JPG",
    "takayama-japan": "https://upload.wikimedia.org/wikipedia/commons/f/f8/Takayama%27s_Early_Winter_Welcome_%28NE%29.jpg",
    "dubrovnik-croatia": "https://upload.wikimedia.org/wikipedia/commons/6/67/The_walls_of_the_fortress_and_View_of_the_old_city._panorama.jpg",
}

FLAG_TAG_MAP = {
    "under $5.5k": ["budget"],
    "beach/water": ["beach", "coast"],
    "summer escape": ["summer escape"],
}

METRIC_TAG_MAP = {
    "Safety": "safety",
    "Cleanliness": "clean",
    "Healthcare": "healthcare",
    "Walkability": "walkability",
    "Cost_Value": "value",
    "Summer_Escape": "summer escape",
    "Coffee": "cafes",
    "Photography": "photography",
    "Restaurants": "food",
    "Airport_Access": "airport access",
}

METRIC_LABELS = {
    "Safety": "safety",
    "Cleanliness": "cleanliness",
    "Healthcare": "healthcare",
    "Walkability": "walkability",
    "Cost_Value": "everyday value",
    "Summer_Escape": "summer comfort",
    "Coffee": "cafe culture",
    "Photography": "visual appeal",
    "Restaurants": "food scene",
    "Airport_Access": "airport access",
    "Lifestyle_Vibe": "lifestyle vibe",
}


def ensure_list(value):
    if value is None:
        return []
    if isinstance(value, list):
        return value
    return [value]


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")
    lowered = ascii_text.lower().replace("&", "and")
    slug = re.sub(r"[^a-z0-9]+", "-", lowered).strip("-")
    return re.sub(r"-+", "-", slug)


def normalize_ascii(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    return normalized.encode("ascii", "ignore").decode("ascii")


def to_number(value: str | int | float | None, fallback: float = 0.0) -> float:
    try:
        return float(str(value).replace(",", ""))
    except (TypeError, ValueError):
        return fallback


def format_list(values: list[str]) -> str:
    if not values:
        return "balanced quality-of-life metrics"
    if len(values) == 1:
        return values[0]
    if len(values) == 2:
        return f"{values[0]} and {values[1]}"
    return f"{', '.join(values[:-1])}, and {values[-1]}"


def pick_emoji(tags: list[str]) -> str:
    tag_set = set(tags)
    if "beach" in tag_set or "coast" in tag_set:
        return "🌊"
    if "mountains" in tag_set or "summer escape" in tag_set:
        return "🏔️"
    if "food" in tag_set or "cafes" in tag_set:
        return "🍷"
    if "city" in tag_set or "walkability" in tag_set:
        return "🏙️"
    if "nature" in tag_set:
        return "🌿"
    return "🌍"


def derive_tags(row: dict[str, str]) -> list[str]:
    tags: list[str] = []
    flags = [part.strip() for part in str(row.get("Flags", "")).split(",") if part.strip()]

    if row.get("Coastal", "").strip().lower() == "yes":
        for tag in ["beach", "coast"]:
            if tag not in tags:
                tags.append(tag)

    for flag in flags:
        for tag in FLAG_TAG_MAP.get(flag.lower(), []):
            if tag not in tags:
                tags.append(tag)

    for metric, tag in METRIC_TAG_MAP.items():
        if to_number(row.get(metric)) >= 8 and tag not in tags:
            tags.append(tag)

    retirement_metrics = {
        "Healthcare": "healthcare",
        "Safety": "safety",
        "Cost Value": "value",
        "Climate": "summer escape",
        "Walkability": "walkability",
        "Food & Culture": "culture",
        "Airport": "airport access",
        "Expat Friendly": "expat-friendly",
        "Infrastructure": "city",
        "Beach & Nature": "nature",
    }
    for metric, tag in retirement_metrics.items():
        if to_number(row.get(metric)) >= 75 and tag not in tags:
            tags.append(tag)

    if to_number(row.get("Restaurants")) >= 9 and "culture" not in tags:
        tags.append("culture")
    if to_number(row.get("Photography")) >= 9 and "nature" not in tags:
        tags.append("nature")
    if to_number(row.get("Walkability")) >= 8 and "city" not in tags:
        tags.append("city")
    if (
        to_number(row.get("Summer_Escape")) >= 9
        and "mountains" not in tags
        and re.search(r"Hokkaido|Alps|Carniola|Norway|Switzerland", row.get("Region", ""), re.I)
    ):
        tags.append("mountains")

    return tags[:6]


def top_traits(row: dict[str, str]) -> list[str]:
    scored = []
    for metric, label in METRIC_LABELS.items():
      if metric == "Lifestyle_Vibe":
          continue
      scored.append((label, to_number(row.get(metric))))

    if not any(score for _, score in scored):
        retirement_labels = {
            "Healthcare": "healthcare",
            "Safety": "safety",
            "Cost Value": "everyday value",
            "Climate": "climate comfort",
            "Walkability": "walkability",
            "Food & Culture": "food and culture",
            "Airport": "airport access",
            "Expat Friendly": "expat friendliness",
            "Infrastructure": "infrastructure",
            "Beach & Nature": "beach and nature",
        }
        scored = [(label, to_number(row.get(metric))) for metric, label in retirement_labels.items()]
    scored.sort(key=lambda item: item[1], reverse=True)
    return [label for label, _ in scored[:3]]


def build_description(row: dict[str, str], traits: list[str]) -> str:
    tier = row.get("Tier", "A") or "A"
    region = row.get("Region") or row.get("Country")
    return f"A tier {tier} destination in {region} with standout scores for {format_list(traits)}."


def build_overview(row: dict[str, str]) -> str:
    note = str(row.get("Notes", "")).strip()
    note = re.sub(r"\. Planning estimate, not live verified$", "", note)
    if note:
        return f"{note}. Ranked in DRI 3.5 for overall lifestyle fit and planning value."
    if row.get("Buy Band") or row.get("Tax Regime Note"):
        buy_band = row.get("Buy Band", "").strip().lower() or "unknown"
        tax_note = row.get("Tax Regime Note", "").strip()
        base = f"{row['City']} ranks strongly in the retirement-first DRI 9.0 model with a {buy_band} housing-buy profile"
        if tax_note:
            return f"{base} and tax screening note: {tax_note}."
        return base + "."
    return f"{row['City']} ranks strongly in the Dardano Retirement Index for lifestyle fit, cost awareness, and day-to-day livability."


def build_climate(row: dict[str, str], flags: list[str]) -> str:
    summer = int(round(to_number(row.get("Summer_Escape"))))
    climate_score = int(round(to_number(row.get("Climate"))))
    coastal = row.get("Coastal", "").strip().lower() == "yes"
    if climate_score:
        if coastal:
            return f"Coastal climate appeal rated {climate_score}/100 with retirement-first scoring weighted toward long-stay comfort."
        return f"Climate comfort rated {climate_score}/100 with retirement-first scoring focused on long-term livability rather than tourism." 
    if "Beach/Water" in flags:
        return f"Coastal living with warm-season appeal and a Summer Escape score of {summer}/10."
    if summer >= 9:
        return f"A strong summer-escape profile with a Summer Escape score of {summer}/10 and proven warm-weather relief potential."
    return f"Planning-grade climate profile with a Summer Escape score of {summer}/10; local seasonality should still be verified before relocation."


def build_lifestyle(row: dict[str, str], traits: list[str], flags: list[str]) -> str:
    vibe = int(round(to_number(row.get("Lifestyle_Vibe"))))
    if not vibe:
        vibe = int(round((to_number(row.get("Food & Culture")) + to_number(row.get("Expat Friendly")) + to_number(row.get("Beach & Nature"))) / 3))
    lowered_flags = [item.lower() for item in flags]
    if row.get("Verification Status"):
        lowered_flags.append(str(row.get("Verification Status")).lower())
    flag_text = format_list(lowered_flags) if lowered_flags else "premium quality-of-life fundamentals"
    return f"Lifestyle vibe rated {vibe}/10 with strengths in {format_list(traits)} and flags for {flag_text}."


def build_transportation(row: dict[str, str]) -> str:
    airport = int(round(to_number(row.get("Airport_Access"))))
    if not airport:
        airport = int(round(to_number(row.get("Airport"))))
    region = row.get("Region") or row.get("Country")
    return f"Airport access rated {airport}/10 with {region} serving as the main regional base for onward travel."


def read_workbook_rows(workbook_path: Path) -> list[list[str]]:
    with zipfile.ZipFile(workbook_path) as archive:
        shared_strings: list[str] = []
        if "xl/sharedStrings.xml" in archive.namelist():
            shared_root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
            for item in shared_root.findall("a:si", NS):
                texts = [node.text or "" for node in item.iterfind(".//a:t", NS)]
                shared_strings.append("".join(texts))

        workbook_root = ET.fromstring(archive.read("xl/workbook.xml"))
        rels_root = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
        rel_map = {rel.attrib["Id"]: rel.attrib["Target"] for rel in rels_root}
        preferred_target = None

        for sheet in workbook_root.find("a:sheets", NS).findall("a:sheet", NS):
            name = sheet.attrib.get("name", "")
            if name in {"Retirement Top 300", "DRI 3.5 Top 300"} or "Top 300" in name:
                rid = sheet.attrib.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id")
                if rid and rid in rel_map:
                    preferred_target = rel_map[rid].lstrip("/")
                    if not preferred_target.startswith("xl/"):
                        preferred_target = f"xl/{preferred_target}"
                    break

        sheet_path = preferred_target or "xl/worksheets/sheet1.xml"
        sheet_root = ET.fromstring(archive.read(sheet_path))
        rows: list[list[str]] = []

        for row in sheet_root.find("a:sheetData", NS).findall("a:row", NS):
            values: list[str] = []
            for cell in row.findall("a:c", NS):
                ref = cell.attrib.get("r", "A1")
                letters = re.sub(r"\d", "", ref)
                column = 0
                for letter in letters:
                    column = column * 26 + ord(letter) - 64
                column -= 1
                raw = cell.findtext("a:v", default="", namespaces=NS)
                if cell.attrib.get("t") == "s" and raw:
                    raw = shared_strings[int(raw)]
                while len(values) <= column:
                    values.append("")
                values[column] = raw
            rows.append(values)
    return rows


def select_data_table(rows: list[list[str]]) -> tuple[list[str], list[list[str]]]:
    for index, row in enumerate(rows):
        lowered = [cell.strip().lower() for cell in row]
        if "city" in lowered and "country" in lowered and ("dri 9.0" in lowered or "dri score" in lowered):
            header = [cell.strip() for cell in row]
            data_rows = []
            for candidate in rows[index + 1 :]:
                if not any(str(cell).strip() for cell in candidate):
                    continue
                first = str(candidate[0]).strip() if candidate else ""
                if first and not re.match(r"^\d+$", first):
                    continue
                data_rows.append(candidate)
            return header, data_rows
    raise ValueError("Could not locate a supported ranking table in the workbook")


def fetch_json(url: str) -> dict | None:
    request = urllib.request.Request(url, headers={"User-Agent": "horizon-atlas/1.0"})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(request, timeout=20) as response:
                return json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as error:
            if error.code == 429 and attempt < 3:
                time.sleep(0.8 + attempt * 0.4)
                continue
            return None
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError):
            return None
    return None


def fetch_curated_image(city: str, country: str, region: str) -> str | None:
    variants = [
        city,
        normalize_ascii(city),
        f"{city}, {country}",
        f"{normalize_ascii(city)}, {country}",
        f"{city}, {region}",
        f"{normalize_ascii(city)}, {region}",
    ]
    variants.extend(TITLE_ALIASES.get(city, []))
    seen: set[str] = set()

    for variant in variants:
        if not variant or variant in seen:
            continue
        seen.add(variant)
        summary = fetch_json(
            f"https://en.wikipedia.org/api/rest_v1/page/summary/{urllib.parse.quote(variant)}"
        )
        if summary:
            image = summary.get("originalimage", {}).get("source") or summary.get("thumbnail", {}).get("source")
            if image:
                return image
        media = fetch_json(
            f"https://en.wikipedia.org/api/rest_v1/page/media-list/{urllib.parse.quote(variant)}"
        )
        if media:
            for item in media.get("items", []):
                if item.get("type") != "image":
                    continue
                srcset = item.get("srcset") or []
                if srcset:
                    return srcset[-1].get("src")
        time.sleep(0.12)
    return None


def write_destinations(destinations: list[dict[str, object]]) -> None:
    lines: list[str] = [
        "export type Destination = {",
        "  slug: string;",
        "  city: string;",
        "  country: string;",
        "  emoji: string;",
        "  match: number;",
        "  description: string;",
        "  overview: string;",
        "  climate: string;",
        "  lifestyle: string;",
        "  transportation: string;",
        "  images: { src: string; alt: string; caption: string }[];",
        "  tags?: string[];",
        "};",
        "",
        "export const destinations: Destination[] = [",
    ]

    for destination in destinations:
        lines.extend(
            [
                "  {",
                f"    slug: {json.dumps(destination['slug'], ensure_ascii=False)},",
                f"    city: {json.dumps(destination['city'], ensure_ascii=False)},",
                f"    country: {json.dumps(destination['country'], ensure_ascii=False)},",
                f"    emoji: {json.dumps(destination['emoji'], ensure_ascii=False)},",
                f"    match: {destination['match']},",
                f"    description: {json.dumps(destination['description'], ensure_ascii=False)},",
                f"    overview: {json.dumps(destination['overview'], ensure_ascii=False)},",
                f"    climate: {json.dumps(destination['climate'], ensure_ascii=False)},",
                f"    lifestyle: {json.dumps(destination['lifestyle'], ensure_ascii=False)},",
                f"    transportation: {json.dumps(destination['transportation'], ensure_ascii=False)},",
                "    images: [",
                "      {",
                '        src: "",',
                f"        alt: {json.dumps(destination['city'] + ' city view', ensure_ascii=False)},",
                f"        caption: {json.dumps(destination['caption'], ensure_ascii=False)},",
                "      },",
                "    ],",
                f"    tags: [{', '.join(json.dumps(tag, ensure_ascii=False) for tag in destination['tags'])}],",
                "  },",
            ]
        )

    lines.extend(["];", "", "export const LAUNCH_CATALOG_SIZE = destinations.length;", ""])
    DESTINATIONS_PATH.write_text("\n".join(lines), encoding="utf-8")


def write_curated_images(curated: dict[str, str]) -> None:
    lines = ["export const curatedCityImagesBySlug: Record<string, string> = {"]
    for slug, image in curated.items():
        lines.append(f"  {json.dumps(slug)}: {json.dumps(image)},")
    lines.extend(["};", ""])
    CURATED_IMAGES_PATH.write_text("\n".join(lines), encoding="utf-8")


def main() -> int:
    workbook_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_WORKBOOK
    rows = read_workbook_rows(workbook_path)
    header, table_rows = select_data_table(rows)
    records = [dict(zip(header, row + [""] * (len(header) - len(row)))) for row in table_rows]

    destinations = []
    for row in records:
        city = row["City"].strip()
        country = row["Country"].strip()
        region = row.get("Region", "").strip()
        flags = [part.strip() for part in str(row.get("Flags", "")).split(",") if part.strip()]
        tags = derive_tags(row)
        traits = top_traits(row)
        note = row.get("Notes", "").strip() or f"{city}, {country}"

        destinations.append(
            {
                "slug": f"{slugify(city)}-{slugify(country)}",
                "city": city,
                "country": country,
                "emoji": pick_emoji(tags),
                "match": round(to_number(row.get("DRI Score")), 1),
                "description": build_description(row, traits),
                "overview": build_overview(row),
                "climate": build_climate(row, flags),
                "lifestyle": build_lifestyle(row, traits, flags),
                "transportation": build_transportation(row),
                "caption": note,
                "tags": tags,
                "region": region,
            }
        )

    curated: dict[str, str] = {}
    for destination in destinations[:50]:
        slug = destination["slug"]
        image = CURATED_IMAGE_OVERRIDES_BY_SLUG.get(slug)
        if not image:
            image = fetch_curated_image(destination["city"], destination["country"], destination["region"])
        if image:
            curated[slug] = image
        time.sleep(0.18)

    write_destinations(destinations)
    write_curated_images(curated)

    print(f"Imported {len(destinations)} destinations from {workbook_path.name}.")
    print(f"Curated exact images for {len(curated)} of the top 50 destinations.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())