import sys
sys.path.insert(0, "scripts")
from commons_gallery_helper import pick_gallery_images
import json

# category_candidates: list tried in order until enough valid candidates found
DESTINATION_CATEGORIES = {
    "ajijic-mexico": ["Ajijic"],
    "boquete-panama": ["Boquete"],
    "chiang-mai-thailand": ["Chiang Mai"],
    "cuenca-ecuador": ["Cuenca, Ecuador"],
    "da-nang-vietnam": ["Da Nang", "Đà Nẵng"],
    "florianopolis-brazil": ["Florianópolis"],
    "funchal-portugal": ["Funchal"],
    "george-town-malaysia": ["George Town, Penang"],
    "hua-hin-thailand": ["Hua Hin"],
    "lucca-italy": ["Lucca"],
    "merida-mexico": ["Mérida, Yucatán"],
    "monopoli-italy": ["Monopoli"],
    "montevideo-uruguay": ["Montevideo"],
    "nafplio-greece": ["Nafplio"],
    "nice-france": ["Nice, France"],
    "palm-springs-california-united-states": ["Palm Springs, California"],
    "paphos-cyprus": ["Paphos"],
    "santander-spain": ["Santander, Spain"],
    "savannah-georgia-united-states": ["Savannah, Georgia"],
    "sibenik-croatia": ["Šibenik"],
}

HERO_FILENAMES = {
    "ajijic-mexico": "Ajijic Malecon Sunset.jpg",
    "boquete-panama": "Aerial view of Boquete, Panama.jpg",
    "chiang-mai-thailand": "Chiang Mai - East gate of the city wall - 0001.jpg",
    "cuenca-ecuador": "Cuenca Calle Juan Jaramillo 6-01.jpg",
    "da-nang-vietnam": "Da-Nang Vietnam Fisher-boats-01.jpg",
    "florianopolis-brazil": "Praia Mole em Florianopolis.jpg",
    "funchal-portugal": "Funchal (Madeira, Portugal), Rua de Santa Maria 39 -- 2025 -- 0831.jpg",
    "george-town-malaysia": "Penang Road, George Town, Penang.jpg",
    "hua-hin-thailand": "Hua Hin Sunrise.jpg",
    "lucca-italy": "Walls of Lucca, May 2013 (02).JPG",
    "merida-mexico": "Centro Cultural Teatro Yucatan - Merida, Yucatan, Mexico - Abril 2021.jpg",
    "monopoli-italy": "Cala Diavolo, Monopoli Puglia (Italia).jpg",
    "montevideo-uruguay": "Montevideo, Uruguay (3483934133).jpg",
    "nafplio-greece": "Nafplio, Greece 2022.jpg",
    "nice-france": "Promenade des Anglais (Nice), France.jpg",
    "palm-springs-california-united-states": "Downtown Palm Springs CA.JPG",
    "paphos-cyprus": "Boats near Paphos, Cyprus 1626p.jpg",
    "santander-spain": "Cantabria. Santander. Spain (3380000974).jpg",
    "savannah-georgia-united-states": "Savannah Historic District (Savannah, Georgia) 3 10.JPG",
    "sibenik-croatia": "Sibenik katedrala04 Croatia.jpg",
}

if __name__ == "__main__":
    import time as _time

    results = {}
    only_keys = sys.argv[1:] if len(sys.argv) > 1 else list(DESTINATION_CATEGORIES.keys())
    for dest_key in only_keys:
        categories = DESTINATION_CATEGORIES[dest_key]
        exclude = {HERO_FILENAMES[dest_key]}
        picked = pick_gallery_images(categories, exclude_filenames=exclude, needed=3)
        results[dest_key] = picked
        print(dest_key, "->", len(picked), "found")
        for p in picked:
            print("   ", p["bare"], "|", p["license_short"])
        _time.sleep(2.0)

    import os

    out_path = "scripts/batch20_gallery_candidates.json"
    existing = {}
    if os.path.exists(out_path):
        with open(out_path) as f:
            existing = json.load(f)
    existing.update(results)
    with open(out_path, "w") as f:
        json.dump(existing, f, indent=2)
