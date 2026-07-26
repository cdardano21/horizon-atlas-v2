import type { DataCategoryKey } from "./types";

const OPEN_METEO_CATEGORIES: DataCategoryKey[] = [
  "monthly_weather",
  "climate_averages",
  "rainfall",
  "humidity",
  "sunshine_hours",
  "uv_index",
  "sea_temperature",
];

const OSM_CATEGORIES: DataCategoryKey[] = [
  "hospitals",
  "clinics",
  "pharmacies",
  "golf_courses",
  "pickleball",
  "tennis",
  "beaches",
  "hiking",
  "parks",
  "museums",
  "restaurants",
  "coffee_shops",
  "nightlife",
  "schools",
  "international_schools",
  "universities",
];

export function inferDefaultSourceKey(categoryKey: DataCategoryKey): string | null {
  if (OPEN_METEO_CATEGORIES.includes(categoryKey)) {
    return "openmeteo";
  }

  if (OSM_CATEGORIES.includes(categoryKey)) {
    return "osm";
  }

  if (["airport_drive_times"].includes(categoryKey)) {
    return "routing";
  }

  if (["youtube_links"].includes(categoryKey)) {
    return "youtube";
  }

  if (
    [
      "cost_of_living",
      "grocery_prices",
      "restaurant_prices",
      "utility_costs",
      "fuel_prices",
      "rent_prices",
      "home_purchase_prices",
      "crime_safety",
    ].includes(categoryKey)
  ) {
    return "numbeo";
  }

  if (["airports", "airlines"].includes(categoryKey)) {
    return "ourairports";
  }

  return null;
}
