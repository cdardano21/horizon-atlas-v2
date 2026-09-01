import re
import urllib.request

BASE = "http://localhost:3000/destinations/"

LEGACY = [
    "the-hague-netherlands", "kyoto-japan", "santa-fe-new-mexico-united-states",
    "st-cloud-minnesota-united-states", "san-ramon-costa-rica", "st-john-s-canada",
]
BATCH01 = ["the-villages-fl-us", "sofia-bg", "puerto-vallarta-mx", "hoi-an-vn", "queenstown-nz"]
BATCH02 = ["ascoli-piceno-it", "sarande-al", "dumaguete-ph", "las-terrenas-do", "fairhope-al-us"]
BATCH20 = [
    "ajijic-mexico", "boquete-panama", "chiang-mai-thailand", "cuenca-ecuador", "da-nang-vietnam",
    "florianopolis-brazil", "funchal-portugal", "george-town-malaysia", "hua-hin-thailand", "lucca-italy",
    "merida-mexico", "monopoli-italy", "montevideo-uruguay", "nafplio-greece", "nice-france",
    "palm-springs-california-united-states", "paphos-cyprus", "santander-spain",
    "savannah-georgia-united-states", "sibenik-croatia",
]
ALL_36 = LEGACY + BATCH01 + BATCH02 + BATCH20

INTERNAL_PHRASES = [
    "must be extracted", "before publication", "research seed", "population boundary guardrail",
    "final records must verify", "dynamic composite built from the strongest available signals",
]


def fetch(key):
    req = urllib.request.Request(BASE + key, headers={"User-Agent": "Batch36Check/1.0"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.read().decode("utf-8", errors="replace")


def strip_tags(html):
    return re.sub(r"<[^>]+>", " ", html)


issues = {}


def record(key, message):
    issues.setdefault(key, []).append(message)


for key in ALL_36:
    html = fetch(key)
    text = strip_tags(html)
    lower_text = text.lower()

    # Scores and fit panel present when score data exists (heuristic: "Scores and fit" heading OR score bars)
    has_scores_heading = "scores and fit" in lower_text
    # Both galleries: "Media and atmosphere" (top) + "Media gallery" (bottom) headings
    has_gallery_1 = "media and atmosphere" in lower_text
    has_gallery_2 = "media gallery" in lower_text
    # Neighborhood summary section presence + count badge
    neighborhood_match = re.search(r"(\d+)\s+districts", text)
    # Show-more button presence when >4 neighborhoods
    has_show_more = bool(re.search(r"show \d+ more neighborhoods", lower_text))
    # Empty Pros and cons heading check - if heading present, at least one list item should exist nearby
    has_pros_cons_heading = "pros and cons" in lower_text
    # Internal phrase leakage (visible text only, crude tag-stripped check)
    leaked_phrases = [p for p in INTERNAL_PHRASES if p in lower_text]
    # Repeated cost block heuristic: "Total Monthly Budget" or "Single total" should never appear
    has_old_redundant_cost_text = "single total" in lower_text or "total monthly budget" in lower_text
    # Tab nav prominence
    has_explore_label = "explore this destination" in lower_text

    if not has_gallery_1 or not has_gallery_2:
        record(key, f"Gallery missing: media-and-atmosphere={has_gallery_1}, media-gallery={has_gallery_2}")
    if neighborhood_match:
        count = int(neighborhood_match.group(1))
        if count > 4 and not has_show_more:
            record(key, f"{count} neighborhoods but no 'show more' control found")
    if leaked_phrases:
        record(key, f"Internal phrases visible: {leaked_phrases}")
    if has_old_redundant_cost_text:
        record(key, "Redundant 'Single total'/'Total Monthly Budget' text still present")
    if not has_explore_label:
        record(key, "Missing 'Explore this destination' label")

print(f"Checked {len(ALL_36)} destinations.")
if issues:
    print(f"{len(issues)} destination(s) have flagged issues:")
    for key, msgs in issues.items():
        print(f"  {key}:")
        for m in msgs:
            print(f"    - {m}")
else:
    print("No issues found across all 36 destinations.")
