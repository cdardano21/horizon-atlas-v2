import type { ImportAdapter, RawRecordEnvelope } from "../types";

type NumbeoCityPriceResponse = {
  prices?: Array<{
    item_name?: string;
    average_price?: number;
    min_price?: number;
    max_price?: number;
    currency?: string;
  }>;
};

function toMetricKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function buildCategoryGroup(categoryKey: string): string {
  if (categoryKey === "grocery_prices") return "grocery";
  if (categoryKey === "restaurant_prices") return "restaurant";
  if (categoryKey === "utility_costs") return "utility";
  if (categoryKey === "fuel_prices") return "fuel";
  if (categoryKey === "rent_prices") return "rent";
  if (categoryKey === "home_purchase_prices") return "purchase";
  return "cost";
}

function shouldInclude(categoryKey: string, metricKey: string): boolean {
  if (categoryKey === "grocery_prices") {
    return ["milk", "bread", "rice", "egg", "cheese", "chicken", "beef", "apple", "banana", "tomato", "potato", "onion"].some((token) => metricKey.includes(token));
  }

  if (categoryKey === "restaurant_prices") {
    return ["restaurant", "meal", "mcdonald", "beer", "cappuccino", "coffee", "water", "cola"].some((token) => metricKey.includes(token));
  }

  if (categoryKey === "utility_costs") {
    return ["basic", "utilities", "electricity", "water", "heating", "garbage", "internet", "mobile"].some((token) => metricKey.includes(token));
  }

  if (categoryKey === "fuel_prices") {
    return ["gasoline", "petrol"].some((token) => metricKey.includes(token));
  }

  if (categoryKey === "rent_prices") {
    return ["apartment", "rent", "city_centre", "outside_centre", "bedroom"].some((token) => metricKey.includes(token));
  }

  if (categoryKey === "home_purchase_prices") {
    return ["buy", "price_per_square_meter", "centre", "outside"].some((token) => metricKey.includes(token));
  }

  return true;
}

function buildRawRecord(
  destinationSlug: string,
  categoryKey: RawRecordEnvelope["categoryKey"],
  index: number,
  price: NonNullable<NumbeoCityPriceResponse["prices"]>[number],
): RawRecordEnvelope {
  const itemName = price.item_name?.trim() || `item_${index}`;
  const metricKey = toMetricKey(itemName);

  return {
    sourceKey: "numbeo",
    sourceRecordId: `${destinationSlug}:${categoryKey}:${metricKey}:${index}`,
    categoryKey,
    destinationSlug,
    observedAt: new Date().toISOString(),
    payload: {
      metric_group: buildCategoryGroup(categoryKey),
      metric_key: metricKey,
      metric_label: itemName,
      value_numeric: typeof price.average_price === "number" ? price.average_price : null,
      min_value_numeric: typeof price.min_price === "number" ? price.min_price : null,
      max_value_numeric: typeof price.max_price === "number" ? price.max_price : null,
      unit: price.currency ?? null,
      display_value: typeof price.average_price === "number" ? String(price.average_price) : null,
    },
  };
}

export const numbeoAdapter: ImportAdapter = {
  sourceKey: "numbeo",
  supports: [
    "cost_of_living",
    "grocery_prices",
    "restaurant_prices",
    "utility_costs",
    "fuel_prices",
    "rent_prices",
    "home_purchase_prices",
  ],
  async fetchRecords(context) {
    const { destination, category } = context;
    const apiKey = process.env.NUMBEO_API_KEY;
    if (!apiKey) {
      throw new Error("NUMBEO_API_KEY is required for numbeo adapter.");
    }

    const query = `${destination.city}, ${destination.country}`;
    const params = new URLSearchParams({
      api_key: apiKey,
      query,
    });

    const response = await fetch(`https://www.numbeo.com/api/city_prices?${params.toString()}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(`Numbeo request failed (${response.status}) for ${query}.`);
    }

    const body = (await response.json()) as NumbeoCityPriceResponse;
    const prices = Array.isArray(body.prices) ? body.prices : [];

    return prices
      .map((price, index) => buildRawRecord(destination.slug, category.key, index + 1, price))
      .filter((record) => {
        const metricKey = String(record.payload.metric_key ?? "");
        return shouldInclude(category.key, metricKey);
      });
  },
};
