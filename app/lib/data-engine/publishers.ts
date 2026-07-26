import {
  createPublishRun,
  finalizePublishRun,
  insertErrorLog,
  listApprovedForPublish,
  replaceDatasetRows,
  replaceDatasetRowsByCategory,
} from "./repository";
import type { DataCategoryKey } from "./types";

type StagedRecord = Awaited<ReturnType<typeof listApprovedForPublish>>[number];

type PublishResult = {
  publishRunId: string;
  publishedDestinations: number;
  publishedRows: number;
};

function monthNameFromDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString("en-US", { month: "long", timeZone: "UTC" });
}

function monthIndexFromDate(value: string): number {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 1;
  }

  return date.getUTCMonth() + 1;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function toMonthlyClimateRow(record: StagedRecord): Record<string, unknown> {
  const observedAt = record.observed_at;
  return {
    destination_id: record.destination_id,
    month_index: monthIndexFromDate(observedAt),
    month_name: monthNameFromDate(observedAt),
    avg_high_c: toNumber(record.payload.temp_high_c ?? record.payload.temperature_c),
    avg_low_c: toNumber(record.payload.temp_low_c),
    rainfall_mm: toNumber(record.payload.rainfall_mm),
    rainy_days: null,
    humidity_pct: toNumber(record.payload.humidity_pct),
    sunshine_hours: toNumber(record.payload.sunshine_hours),
    uv_index: toNumber(record.payload.uv_index),
    sea_temp_c: toNumber(record.payload.sea_temp_c),
    snowfall_cm: null,
    wind_kph: null,
    source_url: null,
    source_organization: record.source_key,
    source_type: "api",
    verification_status: "verified",
    confidence_level: record.confidence_level,
    last_verified_at: new Date().toISOString(),
    effective_at: observedAt,
    notes: `Published from data_engine_staged_records:${record.id}`,
  };
}

function toCostOfLivingRow(record: StagedRecord): Record<string, unknown>[] {
  const payload = record.payload;
  const itemPrefix = typeof payload.metric_group === "string" ? payload.metric_group : "general";

  const candidates = Object.entries(payload).filter(([key]) =>
    ["value", "price", "amount", "median", "index"].some((token) => key.toLowerCase().includes(token)),
  );

  return candidates.map(([key, value], idx) => ({
    destination_id: record.destination_id,
    item_key: `${itemPrefix}_${key}`.toLowerCase(),
    item_label: key.replace(/_/g, " "),
    metric_group: itemPrefix,
    value_numeric: toNumber(value),
    value_text: typeof value === "string" ? value : null,
    unit: typeof payload.unit === "string" ? payload.unit : null,
    display_value: typeof value === "number" ? value.toString() : typeof value === "string" ? value : null,
    sort_order: idx,
    source_url: null,
    source_organization: record.source_key,
    source_type: "api",
    verification_status: "verified",
    confidence_level: record.confidence_level,
    last_verified_at: new Date().toISOString(),
    effective_at: record.observed_at,
    notes: `Published from data_engine_staged_records:${record.id}`,
  }));
}

function toHousingMetricRow(record: StagedRecord): Record<string, unknown> {
  const payload = record.payload;
  const metricKey = typeof payload.metric_key === "string" ? payload.metric_key : record.source_record_id;
  const metricLabel = typeof payload.metric_label === "string" ? payload.metric_label : metricKey;
  const numeric = toNumber(payload.value_numeric ?? payload.display_value);
  const textValue = typeof payload.value_text === "string" ? payload.value_text : null;

  return {
    destination_id: record.destination_id,
    metric_key: metricKey,
    metric_label: metricLabel,
    value_numeric: numeric,
    value_text: textValue,
    unit: typeof payload.unit === "string" ? payload.unit : null,
    display_value:
      typeof payload.display_value === "string"
        ? payload.display_value
        : numeric !== null
          ? String(numeric)
          : textValue,
    sort_order: 0,
    source_url: null,
    source_organization: record.source_key,
    source_type: "api",
    verification_status: "verified",
    confidence_level: record.confidence_level,
    last_verified_at: new Date().toISOString(),
    effective_at: record.observed_at,
    notes: `Published from data_engine_staged_records:${record.id}`,
  };
}

type TargetTable = "monthly_climate" | "cost_of_living_items" | "housing_market_metrics";

type ReplaceMode = "destination" | "destination-and-category";

type PublishTarget = {
  table: TargetTable | "restaurants_or_food_metrics" | "destination_resources";
  replaceMode: ReplaceMode;
  tableCategory?: string;
};

const FOOD_CATEGORY_KEYS: DataCategoryKey[] = ["restaurants", "coffee_shops", "nightlife", "restaurant_prices"];

const PRACTICAL_CATEGORY_KEYS: DataCategoryKey[] = [
  "emergency_numbers",
  "local_government",
  "tourism",
  "google_maps_links",
  "youtube_links",
  "rental_resources",
  "real_estate_resources",
  "tax_information",
  "visa_options",
  "residency",
];

const PRACTICAL_RESOURCE_CATEGORY_BY_KEY: Partial<Record<DataCategoryKey, string>> = {
  emergency_numbers: "emergency",
  local_government: "local_government",
  tourism: "tourism",
  google_maps_links: "maps",
  youtube_links: "youtube",
  rental_resources: "rental",
  real_estate_resources: "real_estate",
  tax_information: "tax",
  visa_options: "visa",
  residency: "residency",
};

function targetForCategory(categoryKey: DataCategoryKey): PublishTarget {
  if (
    ["monthly_weather", "rainfall", "humidity", "sunshine_hours", "uv_index", "sea_temperature"].includes(
      categoryKey,
    )
  ) {
    return {
      table: "monthly_climate",
      replaceMode: "destination",
    };
  }

  if (
    ["cost_of_living", "grocery_prices", "restaurant_prices", "utility_costs", "fuel_prices"].includes(
      categoryKey)
  ) {
    return {
      table: "cost_of_living_items",
      replaceMode: "destination",
    };
  }

  if (["rent_prices", "home_purchase_prices", "property_taxes"].includes(categoryKey)) {
    return {
      table: "housing_market_metrics",
      replaceMode: "destination",
    };
  }

  if (FOOD_CATEGORY_KEYS.includes(categoryKey)) {
    return {
      table: "restaurants_or_food_metrics",
      replaceMode: "destination",
    };
  }

  if (PRACTICAL_CATEGORY_KEYS.includes(categoryKey)) {
    return {
      table: "destination_resources",
      replaceMode: "destination-and-category",
      tableCategory: PRACTICAL_RESOURCE_CATEGORY_BY_KEY[categoryKey] ?? "practical",
    };
  }

  throw new Error(`No publish mapper implemented for category ${categoryKey}`);
}

function rowsForRecord(categoryKey: DataCategoryKey, record: StagedRecord): Record<string, unknown>[] {
  const target = targetForCategory(categoryKey);
  const table = target.table;
  if (table === "monthly_climate") {
    return [toMonthlyClimateRow(record)];
  }

  if (table === "housing_market_metrics") {
    return [toHousingMetricRow(record)];
  }

  if (table === "restaurants_or_food_metrics") {
    return [toHousingMetricRow(record)];
  }

  if (table === "destination_resources") {
    const payload = record.payload;
    const rawUrl = payload.url ?? payload.href ?? payload.link ?? payload.value;
    const url = typeof rawUrl === "string" ? rawUrl : null;
    if (!url) {
      return [];
    }

    const title =
      typeof payload.title === "string"
        ? payload.title
        : typeof payload.label === "string"
          ? payload.label
          : record.source_record_id;

    return [
      {
        destination_id: record.destination_id,
        category: target.tableCategory ?? "practical",
        title,
        description:
          typeof payload.description === "string"
            ? payload.description
            : typeof payload.note === "string"
              ? payload.note
              : null,
        url,
        source_type: "api",
        sort_order: 0,
        source_url: null,
        source_organization: record.source_key,
        verification_status: "verified",
        confidence_level: record.confidence_level,
        last_verified_at: new Date().toISOString(),
        effective_at: record.observed_at,
        notes: `Published from data_engine_staged_records:${record.id}`,
      },
    ];
  }

  return toCostOfLivingRow(record);
}

export async function publishApprovedCategory(options: {
  accessToken: string;
  userId: string;
  categoryKey: DataCategoryKey;
  runId?: string;
}): Promise<PublishResult> {
  const approvedRows = await listApprovedForPublish(options.accessToken, options.categoryKey, options.runId);

  const publishRunId = await createPublishRun(options.accessToken, {
    categoryKey: options.categoryKey,
    runId: options.runId ?? null,
    triggeredBy: options.userId,
    publishedCount: 0,
  });

  let publishedRows = 0;

  try {
    const byDestination = new Map<string, StagedRecord[]>();
    for (const row of approvedRows) {
      const key = row.destination_id;
      const existing = byDestination.get(key);
      if (existing) {
        existing.push(row);
      } else {
        byDestination.set(key, [row]);
      }
    }

    for (const [destinationId, rows] of byDestination.entries()) {
      const target = targetForCategory(options.categoryKey);
      const mappedRows = rows.flatMap((row) => rowsForRecord(options.categoryKey, row));
      if (target.replaceMode === "destination-and-category") {
        await replaceDatasetRowsByCategory(
          options.accessToken,
          destinationId,
          target.table,
          target.tableCategory ?? options.categoryKey,
          mappedRows,
        );
      } else {
        await replaceDatasetRows(options.accessToken, destinationId, target.table, mappedRows);
      }
      publishedRows += mappedRows.length;
    }

    await finalizePublishRun(options.accessToken, publishRunId, {
      status: "completed",
      publishedCount: publishedRows,
    });

    return {
      publishRunId,
      publishedDestinations: byDestination.size,
      publishedRows,
    };
  } catch (error) {
    await insertErrorLog(options.accessToken, {
      publishRunId,
      categoryKey: options.categoryKey,
      errorCode: "publish_failed",
      errorMessage: error instanceof Error ? error.message : "Publish failed.",
    });

    await finalizePublishRun(options.accessToken, publishRunId, {
      status: "failed",
      publishedCount: publishedRows,
      errorMessage: error instanceof Error ? error.message : "Publish failed.",
    });

    throw error;
  }
}
