"""
Bounded Batch 20 recommendation-description polish: replaces the two known generic templates
("is a named dining recommendation in <city>...", "<name> is a <subcategory> that contributes to
the character of <city>...") with a place-type-aware sentence built ONLY from fields already on
the same PLACES row (category_key, subcategory, best_for, place_name) - no new research, no new
places, no new links. Descriptions that don't match either exact template are left untouched.
"""

import re

import openpyxl

WORKBOOK_PATH = "data/legacy-migration-batch-20/DestinationFinderAI_Legacy_Production_Batch_20_Reader_Ready_Authoritative_v3.3.xlsx"

DINING_TEMPLATE_RE = re.compile(r"^(.+?) is a named dining recommendation in (.+?)\. Check current hours, reservations, menu, and dietary options before going\.$")
CHARACTER_TEMPLATE_RE = re.compile(r"^(.+?) is a (.+?) that contributes to the character of (.+?)\. Use the linked site or map for current access, hours, and visitor information\.$")

DINING_STYLE_KEYWORDS = [
    ("farm-to-table", "a farm-to-table restaurant"),
    ("steakhouse", "a steakhouse"),
    ("seafood", "a seafood restaurant"),
    ("sushi", "a sushi restaurant"),
    ("pizzeria", "a pizzeria"),
    ("pizza", "a pizza restaurant"),
    ("taverna", "a taverna"),
    ("trattoria", "a trattoria"),
    ("osteria", "an osteria"),
    ("bistro", "a bistro"),
    ("grill", "a grill restaurant"),
    ("cantina", "a cantina"),
    ("cafe", "a cafe"),
    ("café", "a cafe"),
    ("bakery", "a bakery"),
    ("tapas", "a tapas restaurant"),
    ("noodle", "a noodle restaurant"),
    ("bbq", "a barbecue restaurant"),
    ("barbecue", "a barbecue restaurant"),
    ("bar & ", "a restaurant and bar"),
    ("bar and ", "a restaurant and bar"),
    (" bar", "a restaurant and bar"),
]


def dining_description(name: str, city: str) -> str:
    lower_name = name.lower()
    for keyword, phrase in DINING_STYLE_KEYWORDS:
        if keyword in lower_name:
            return f"{name} is {phrase} in {city}. Check current hours, reservations, menu, and dietary options before going."
    return f"{name} is a dining option in {city}. Check current hours, reservations, menu, and dietary options before going."


# subcategory (lowercase) -> (kind phrase, typical-use phrase)
SUBCATEGORY_PHRASES = {
    "historic_site": ("a historic site", "its history and architecture"),
    "historic_district": ("a historic district", "wandering older streets and architecture"),
    "historic_neighborhood": ("a historic neighborhood", "wandering older streets and architecture"),
    "historic_square": ("a historic square", "a central, older gathering spot"),
    "historic_culture": ("a historic and cultural site", "combining history with local culture"),
    "culture": ("a cultural site", "getting a deeper sense of local culture"),
    "church": ("a church", "its architecture and role as a place of worship"),
    "temple": ("a temple", "its role as a place of worship and a cultural landmark"),
    "temple_viewpoint": ("a temple with a scenic viewpoint", "combining a cultural visit with a good view"),
    "religious_site": ("a religious site", "a place of worship and quiet reflection"),
    "viewpoint": ("a viewpoint", "photos and views over the area"),
    "transport_viewpoint": ("a transit point with a scenic view", "combining transit access with a good view"),
    "promenade": ("a waterfront promenade", "walking and taking in the view"),
    "square": ("a public square", "a central gathering spot"),
    "square_public_space": ("a public square", "a central gathering spot"),
    "square_waterfront_public_space": ("a waterfront public square", "a central gathering spot by the water"),
    "plaza": ("a plaza", "a central gathering spot"),
    "harbour": ("a harbour", "a working waterfront worth a stroll"),
    "harbor": ("a harbor", "a working waterfront worth a stroll"),
    "coastal_place": ("a coastal spot", "beach and waterfront time"),
    "lagoon": ("a lagoon", "outdoor recreation and scenery"),
    "lake": ("a lake", "outdoor recreation and scenery"),
    "diving": ("a diving spot", "underwater exploration"),
    "diving_snorkeling": ("a diving and snorkeling spot", "underwater exploration"),
    "water_sports": ("a water-sports spot", "getting out on the water"),
    "kayak_sup_watersports": ("a kayaking and paddleboarding spot", "getting out on the water"),
    "swimming_fitness": ("a swimming and fitness spot", "staying active"),
    "hiking": ("a hiking spot", "getting outdoors on foot"),
    "rock_climbing": ("a rock-climbing spot", "an active outdoor challenge"),
    "zipline": ("a zipline attraction", "an adventure activity"),
    "cave": ("a cave", "an underground natural attraction"),
    "hot_springs": ("a hot-springs site", "relaxing in natural warm water"),
    "spa": ("a spa", "relaxation and wellness"),
    "pickleball": ("a pickleball venue", "an active social sport"),
    "sports": ("a sports venue", "staying active"),
    "sports_fitness": ("a sports and fitness venue", "staying active"),
    "sports_event": ("a sports venue", "catching local sporting events"),
    "brewery": ("a brewery", "sampling local beer"),
    "winery_tour": ("a winery tour", "tasting local wine"),
    "bookable_tour": ("a bookable tour option", "a structured way to see the area"),
    "guided_tour": ("a guided tour option", "a structured way to see the area"),
    "wildlife_tour": ("a wildlife tour", "seeing local wildlife"),
    "cooking_tour": ("a cooking tour", "hands-on learning about local cuisine"),
    "food_market": ("a food market", "browsing fresh, local food"),
    "food_tour": ("a food tour", "sampling local cuisine with guidance"),
    "guided_walking_food_tour": ("a guided walking food tour", "sampling local cuisine with guidance"),
    "food_culture_tour": ("a food and culture tour", "sampling local cuisine with cultural context"),
    "cooking_class_food_experience": ("a cooking class", "hands-on learning about local cuisine"),
    "landmark": ("a landmark", "a notable stop for visitors"),
    "grocery": ("a grocery option", "everyday shopping"),
    "education": ("an educational site", "learning more about the area"),
    "arts": ("an arts venue", "catching local exhibitions or performances"),
    "arts_complex": ("an arts complex", "catching exhibitions or performances"),
    "festival": ("a festival venue", "seasonal events and local celebrations"),
    "festival_venue": ("a festival venue", "seasonal events and local celebrations"),
    "government": ("a government office", "official business, not a visitor attraction"),
    "bike_share": ("a bike-share point", "getting around without a car"),
    "visitor_center": ("a visitor center", "orientation and local trip planning"),
    "tourism_service": ("a tourism service", "planning day trips and activities"),
    "archaeology": ("an archaeological site", "seeing preserved history firsthand"),
    "planetarium": ("a planetarium", "an educational stop for stargazing and science"),
    "mountain_resort_excursion": ("a mountain-resort excursion", "a day trip into the mountains"),
    "regional_excursion": ("a regional excursion option", "exploring beyond the city itself"),
    "cancer_center": ("a specialized medical center", "specialist healthcare access"),
    "transport": ("a transit point", "getting around the area"),
}

CATEGORY_FALLBACK_PHRASES = {
    "attraction": ("an attraction", "a notable stop for visitors"),
    "museum": ("a museum", "learning more about local history and culture"),
    "zoo_aquarium": ("a zoo/aquarium", "seeing animals up close"),
    "park": ("a park", "outdoor time and fresh air"),
    "trail": ("a trail", "walking or hiking outdoors"),
    "beach": ("a beach", "swimming and beach time"),
    "water_recreation": ("a water-recreation spot", "getting out on the water"),
    "religious_community": ("a religious site", "a place of worship and quiet reflection"),
    "golf": ("a golf option", "playing a round nearby"),
    "sports": ("a sports venue", "staying active"),
    "coffee_shop": ("a coffee shop", "a casual coffee or light bite"),
    "shopping": ("a shopping stop", "everyday or specialty shopping"),
    "farmers_market": ("a farmers market", "browsing fresh, local produce"),
    "transit_hub": ("a transit hub", "getting around the area"),
    "social_club": ("a social club", "meeting people with similar interests"),
    "theater": ("a theater", "catching a local performance"),
    "restaurant": ("a restaurant", "a meal out"),
    "brewery_winery": ("a brewery or winery", "sampling local drinks"),
    "grocery": ("a grocery option", "everyday shopping"),
    "gym": ("a gym", "staying active"),
    "pharmacy": ("a pharmacy", "everyday errands"),
    "nightlife": ("a nightlife spot", "an evening out"),
    "urgent_care": ("an urgent-care clinic", "non-emergency medical needs"),
    "school": ("a school", "local education options"),
    "senior_living": ("a senior-living option", "retirement housing research"),
    "pickleball_tennis": ("a pickleball/tennis venue", "staying active"),
    "live_music": ("a live-music venue", "catching a show"),
    "government_office": ("a government office", "official business, not a visitor attraction"),
    "hospital": ("a hospital", "medical care access"),
}


def character_description(name: str, subcategory: str, city: str, category_key: str) -> str:
    subcat = (subcategory or "").lower()
    cat = (category_key or "").lower()
    if subcat in SUBCATEGORY_PHRASES:
        kind, use = SUBCATEGORY_PHRASES[subcat]
    elif cat in CATEGORY_FALLBACK_PHRASES:
        kind, use = CATEGORY_FALLBACK_PHRASES[cat]
    else:
        kind, use = ("a local place", "exploring the area")
    return f"{name} is {kind} in {city}, useful for {use}. Use the linked site or map for current hours and details."


def main(dry_run=True):
    wb = openpyxl.load_workbook(WORKBOOK_PATH, data_only=False)
    ws = wb["PLACES"]
    header = [c.value for c in ws[1]]
    idx = {h: i for i, h in enumerate(header) if h}
    changed_dining = 0
    changed_character = 0

    for row in ws.iter_rows(min_row=2):
        desc_cell = row[idx["description"]]
        value = desc_cell.value
        if not isinstance(value, str):
            continue
        dining_match = DINING_TEMPLATE_RE.match(value.strip())
        if dining_match:
            name, city = dining_match.group(1), dining_match.group(2)
            new_value = dining_description(name, city)
            changed_dining += 1
            if dry_run and changed_dining <= 5:
                print(f"DINING: {value!r}\n     -> {new_value!r}\n")
            if not dry_run:
                desc_cell.value = new_value
            continue
        character_match = CHARACTER_TEMPLATE_RE.match(value.strip())
        if character_match:
            name, subcat_in_text, city = character_match.group(1), character_match.group(2), character_match.group(3)
            subcategory = row[idx["subcategory"]].value if idx.get("subcategory") is not None else None
            category_key = row[idx["category_key"]].value if idx.get("category_key") is not None else None
            new_value = character_description(name, subcategory, city, category_key)
            changed_character += 1
            if dry_run and changed_character <= 5:
                print(f"CHARACTER: {value!r}\n     -> {new_value!r}\n")
            if not dry_run:
                desc_cell.value = new_value

    print(f"{'[DRY RUN] ' if dry_run else ''}Dining descriptions changed: {changed_dining}")
    print(f"{'[DRY RUN] ' if dry_run else ''}Character descriptions changed: {changed_character}")

    if not dry_run:
        wb.save(WORKBOOK_PATH)
        print("Saved.")


if __name__ == "__main__":
    import sys

    main(dry_run="--apply" not in sys.argv)
