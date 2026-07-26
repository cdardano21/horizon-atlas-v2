import type {
  CategoryDefinition,
  DataCategoryKey,
  ImportAdapter,
  ImportAdapterContext,
  RawRecordEnvelope,
} from "../types";

function supportsCategory(categoryKey: DataCategoryKey): boolean {
  return [
    "monthly_weather",
    "rainfall",
    "humidity",
    "sunshine_hours",
    "uv_index",
    "sea_temperature",
  ].includes(categoryKey);
}

function buildMonthlyWeatherUrl(destination: ImportAdapterContext["destination"]): string {
  const params = new URLSearchParams({
    latitude: String(destination.latitude ?? 0),
    longitude: String(destination.longitude ?? 0),
    start_date: "2023-01-01",
    end_date: "2023-12-31",
    daily: [
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
      "sunshine_duration",
      "relative_humidity_2m_mean",
      "uv_index_max",
    ].join(","),
    timezone: "UTC",
  });

  return `https://archive-api.open-meteo.com/v1/archive?${params.toString()}`;
}

type DailyArchivePayload = {
  daily?: {
    time?: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_sum?: number[];
    sunshine_duration?: number[];
    relative_humidity_2m_mean?: number[];
    uv_index_max?: number[];
  };
};

type MonthBucket = {
  sumHigh: number;
  countHigh: number;
  sumLow: number;
  countLow: number;
  sumRain: number;
  sumSunHours: number;
  sumHumidity: number;
  countHumidity: number;
  sumUv: number;
  countUv: number;
};

const emptyMonthBucket = (): MonthBucket => ({
  sumHigh: 0,
  countHigh: 0,
  sumLow: 0,
  countLow: 0,
  sumRain: 0,
  sumSunHours: 0,
  sumHumidity: 0,
  countHumidity: 0,
  sumUv: 0,
  countUv: 0,
});

const round = (value: number): number => Math.round(value * 100) / 100;

const toMonthKey = (isoDate: string): string => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${date.getUTCFullYear()}-${month}`;
};

function asRecord(
  sourceKey: string,
  category: CategoryDefinition,
  destinationSlug: string,
  index: number,
  observedAt: string,
  payload: Record<string, unknown>,
): RawRecordEnvelope {
  return {
    sourceKey,
    sourceRecordId: `${destinationSlug}:${category.key}:${index}`,
    categoryKey: category.key,
    destinationSlug,
    observedAt,
    payload,
  };
}

export const openMeteoAdapter: ImportAdapter = {
  sourceKey: "openmeteo",
  supports: [
    "monthly_weather",
    "rainfall",
    "humidity",
    "sunshine_hours",
    "uv_index",
    "sea_temperature",
  ],
  async fetchRecords(context) {
    const { destination, category } = context;

    if (!supportsCategory(category.key)) {
      return [];
    }

    if (destination.latitude == null || destination.longitude == null) {
      return [];
    }

    const url = buildMonthlyWeatherUrl(destination);
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(`Open-Meteo request failed (${response.status})`);
    }

    const body = (await response.json()) as DailyArchivePayload;

    const times = body.daily?.time ?? [];
    const highs = body.daily?.temperature_2m_max ?? [];
    const lows = body.daily?.temperature_2m_min ?? [];
    const rain = body.daily?.precipitation_sum ?? [];
    const sun = body.daily?.sunshine_duration ?? [];
    const humidity = body.daily?.relative_humidity_2m_mean ?? [];
    const uv = body.daily?.uv_index_max ?? [];

    const monthly = new Map<string, MonthBucket>();

    for (let idx = 0; idx < times.length; idx += 1) {
      const monthKey = toMonthKey(times[idx] ?? "");
      if (!monthKey) continue;

      const bucket = monthly.get(monthKey) ?? emptyMonthBucket();

      const high = highs[idx];
      if (typeof high === "number") {
        bucket.sumHigh += high;
        bucket.countHigh += 1;
      }

      const low = lows[idx];
      if (typeof low === "number") {
        bucket.sumLow += low;
        bucket.countLow += 1;
      }

      const rainValue = rain[idx];
      if (typeof rainValue === "number") {
        bucket.sumRain += rainValue;
      }

      const sunValue = sun[idx];
      if (typeof sunValue === "number") {
        bucket.sumSunHours += sunValue / 3600;
      }

      const humidityValue = humidity[idx];
      if (typeof humidityValue === "number") {
        bucket.sumHumidity += humidityValue;
        bucket.countHumidity += 1;
      }

      const uvValue = uv[idx];
      if (typeof uvValue === "number") {
        bucket.sumUv += uvValue;
        bucket.countUv += 1;
      }

      monthly.set(monthKey, bucket);
    }

    return Array.from(monthly.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([monthKey, bucket], idx) => {
        const observedAt = `${monthKey}-01`;
        const avgHigh = bucket.countHigh > 0 ? round(bucket.sumHigh / bucket.countHigh) : null;
        const avgLow = bucket.countLow > 0 ? round(bucket.sumLow / bucket.countLow) : null;
        const avgTemp =
          typeof avgHigh === "number" && typeof avgLow === "number"
            ? round((avgHigh + avgLow) / 2)
            : avgHigh;

        return asRecord("openmeteo", category, destination.slug, idx + 1, observedAt, {
          month: monthKey,
          temperature_c: avgTemp,
          temp_high_c: avgHigh,
          temp_low_c: avgLow,
          rainfall_mm: round(bucket.sumRain),
          sunshine_hours: round(bucket.sumSunHours),
          humidity_pct: bucket.countHumidity > 0 ? round(bucket.sumHumidity / bucket.countHumidity) : null,
          uv_index: bucket.countUv > 0 ? round(bucket.sumUv / bucket.countUv) : null,
        });
      });
  },
};
