import json
import re
import time
import urllib.parse
import urllib.request

API = "https://commons.wikimedia.org/w/api.php"

BAD_NAME_PATTERNS = [
    r"^500px photo",
    r"panoramio",
    r"\.svg$",
    r"\.wav$",
    r"\.ogg$",
    r"\.pdf$",
    r"logo",
    r"flag of",
    r"^dsc[_ ]?\d",
    r"^img[_ ]?\d",
    r"^p\d{7,}",
    r"^\d{4,}",
    r"banner",
    r"coat of arms",
    r"blank map",
    r"locator map",
    r" map\.",
    r"^map ",
    r"bandera de",
    r"bandeira de",
    r"drapeau",
    r"stemma di",
    r"escudo de",
    r"\.webm$",
    r"\.mp3$",
]

GOOD_LICENSE_MARKERS = ["cc-by", "cc0", "public domain", "cc by"]


def http_get_json(url, retries=5):
    last_error = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "HorizonAtlasBatch20/1.0"})
            with urllib.request.urlopen(req, timeout=20) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            time.sleep(3.0 + attempt * 3.0)
    raise last_error


def category_members(category, limit=40):
    url = (
        f"{API}?action=query&list=categorymembers&cmtitle=Category:{urllib.parse.quote(category)}"
        f"&cmtype=file&cmlimit={limit}&format=json"
    )
    try:
        data = http_get_json(url)
    except Exception as exc:  # noqa: BLE001
        print(f"  [category_members error] {category!r}: {exc!r}")
        return []
    time.sleep(0.4)
    return [m["title"] for m in data.get("query", {}).get("categorymembers", [])]


def search_files(query, limit=20):
    url = (
        f"{API}?action=query&list=search&srnamespace=6&srsearch={urllib.parse.quote(query)}"
        f"&srlimit={limit}&format=json"
    )
    try:
        data = http_get_json(url)
    except Exception as exc:  # noqa: BLE001
        print(f"  [search_files error] {query!r}: {exc!r}")
        return []
    time.sleep(0.4)
    return [r["title"] for r in data.get("query", {}).get("search", [])]


def looks_bad(title: str) -> bool:
    lower = title.lower().replace("file:", "", 1).strip()
    return any(re.search(pattern, lower) for pattern in BAD_NAME_PATTERNS)


def imageinfo_batch(titles):
    if not titles:
        return {}
    joined = "|".join(titles)
    url = (
        f"{API}?action=query&titles={urllib.parse.quote(joined)}&prop=imageinfo"
        f"&iiprop=url|size|extmetadata|mime&format=json"
    )
    try:
        data = http_get_json(url)
    except Exception as exc:  # noqa: BLE001
        print(f"  [imageinfo_batch error] {exc!r}")
        return {}
    time.sleep(0.4)
    pages = data.get("query", {}).get("pages", {})
    out = {}
    for page in pages.values():
        title = page.get("title")
        infos = page.get("imageinfo")
        if not infos:
            continue
        info = infos[0]
        out[title] = info
    return out


def acceptable_license(info) -> bool:
    meta = info.get("extmetadata", {})
    license_short = meta.get("LicenseShortName", {}).get("value", "").lower()
    if any(marker in license_short for marker in GOOD_LICENSE_MARKERS):
        return True
    return False


def pick_gallery_images(category_candidates, exclude_filenames, needed=3):
    """category_candidates: list of category name strings to try in order."""
    seen_titles = []
    for category in category_candidates:
        members = category_members(category, limit=40)
        for title in members:
            if title in seen_titles:
                continue
            if not (title.lower().endswith(".jpg") or title.lower().endswith(".jpeg") or title.lower().endswith(".png")):
                continue
            if looks_bad(title):
                continue
            bare = title.replace("File:", "")
            if bare in exclude_filenames:
                continue
            seen_titles.append(title)
        if len(seen_titles) >= needed * 4:
            break

    picked = []
    # Check imageinfo in chunks of 20
    for i in range(0, len(seen_titles), 20):
        chunk = seen_titles[i : i + 20]
        infos = imageinfo_batch(chunk)
        for title in chunk:
            info = infos.get(title)
            if not info:
                continue
            if info.get("width", 0) < 500 or info.get("height", 0) < 300:
                continue
            if not acceptable_license(info):
                continue
            meta = info.get("extmetadata", {})
            license_short = meta.get("LicenseShortName", {}).get("value", "Wikimedia Commons license")
            picked.append(
                {
                    "title": title,
                    "bare": title.replace("File:", ""),
                    "url": info.get("descriptionurl"),
                    "license_short": license_short,
                }
            )
            if len(picked) >= needed:
                return picked
        time.sleep(0.2)
    return picked


if __name__ == "__main__":
    # quick smoke test
    result = pick_gallery_images(["Nice, France"], exclude_filenames={"Promenade des Anglais (Nice), France.jpg"}, needed=3)
    for r in result:
        print(r)
