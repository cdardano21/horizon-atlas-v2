import re
import urllib.request

BASE = "http://localhost:3000/destinations/"
KEYS = [
    "ajijic-mexico", "boquete-panama", "chiang-mai-thailand", "cuenca-ecuador", "da-nang-vietnam",
    "florianopolis-brazil", "funchal-portugal", "george-town-malaysia", "hua-hin-thailand", "lucca-italy",
    "merida-mexico", "monopoli-italy", "montevideo-uruguay", "nafplio-greece", "nice-france",
    "palm-springs-california-united-states", "paphos-cyprus", "santander-spain",
    "savannah-georgia-united-states", "sibenik-croatia",
]

PHRASES = [
    "before publication",
    "must be extracted",
    "research seed",
    "specific items to confirm",
    "editor",
    "researcher",
    "TODO",
    "placeholder",
]


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Batch20Scan/1.0"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return resp.read().decode("utf-8", errors="replace")


def strip_tags(html):
    return re.sub(r"<[^>]+>", " ", html)


for key in KEYS:
    try:
        html = fetch(BASE + key)
    except Exception as exc:  # noqa: BLE001
        print(key, "FETCH ERROR", exc)
        continue
    text = strip_tags(html)
    lower = text.lower()
    for phrase in PHRASES:
        idx = lower.find(phrase.lower())
        if idx != -1:
            snippet = text[max(0, idx - 100):idx + 150]
            print(f"{key} | {phrase!r} | ...{snippet}...")
