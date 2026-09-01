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
assert len(ALL_36) == 36, len(ALL_36)

failures = []
for key in ALL_36:
    url = BASE + key
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Smoke36/1.0"})
        with urllib.request.urlopen(req, timeout=20) as resp:
            status = resp.status
    except Exception as exc:  # noqa: BLE001
        failures.append((key, f"ERROR {exc!r}"))
        continue
    if status != 200:
        failures.append((key, f"HTTP {status}"))

print(f"{len(ALL_36) - len(failures)}/{len(ALL_36)} destinations returned 200.")
if failures:
    print("FAILURES:")
    for key, reason in failures:
        print(f"  {key}: {reason}")
else:
    print("All 36 destination pages loaded successfully.")
