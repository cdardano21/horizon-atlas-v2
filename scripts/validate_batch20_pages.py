import urllib.request

BASE = "http://localhost:3000/destinations/"
KEYS = [
    "ajijic-mexico", "boquete-panama", "chiang-mai-thailand", "cuenca-ecuador", "da-nang-vietnam",
    "florianopolis-brazil", "funchal-portugal", "george-town-malaysia", "hua-hin-thailand", "lucca-italy",
    "merida-mexico", "monopoli-italy", "montevideo-uruguay", "nafplio-greece", "nice-france",
    "palm-springs-california-united-states", "paphos-cyprus", "santander-spain",
    "savannah-georgia-united-states", "sibenik-croatia",
]

PLACEHOLDER_PHRASES = [
    "Not yet verified from an authoritative source",
    "Specific items to confirm",
    "Verified imagery pending",
    "Address-specific review recommended",
    "More local detail coming soon",
]

results = []
for key in KEYS:
    req = urllib.request.Request(BASE + key, headers={"User-Agent": "smoke-test/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            status = resp.status
            html = resp.read().decode("utf-8", errors="replace")
    except Exception as e:
        results.append((key, f"ERROR: {e}"))
        continue

    has_hero = "commons.wikimedia.org/wiki/Special:FilePath" in html
    has_total_budget_label = "Total Monthly Budget" in html
    has_zero_categories = "0 live categories" in html
    has_zero_budgets = "0 budget bands" in html
    overview_idx = html.find(">Overview<")
    glance_idx = html.find("at a glance")
    order_ok = (overview_idx != -1 and glance_idx != -1 and overview_idx < glance_idx)
    # Only check VISIBLE text (rough heuristic: strip script/json blobs by checking for the phrase
    # outside of an escaped-JSON context marker like \" immediately before it).
    visible_placeholder_hits = []
    for phrase in PLACEHOLDER_PHRASES:
        idx = 0
        while True:
            idx = html.find(phrase, idx)
            if idx == -1:
                break
            # crude check: if immediately preceded by a raw '>' (real HTML text node), it's visible;
            # if preceded by an escaped quote '\"' it's inside a serialized JSON payload.
            preceding = html[max(0, idx - 2):idx]
            if preceding.endswith(">"):
                visible_placeholder_hits.append(phrase)
                break
            idx += 1

    results.append((key, {
        "status": status,
        "hero": has_hero,
        "empty_total_budget_label": has_total_budget_label,
        "zero_live_categories_shown": has_zero_categories,
        "zero_budget_bands_shown": has_zero_budgets,
        "overview_before_glance": order_ok,
        "visible_placeholder_hits": visible_placeholder_hits,
    }))

for key, r in results:
    print(key, "->", r)
