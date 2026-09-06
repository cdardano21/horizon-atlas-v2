export type ISO4217Code = string;
export type ExchangeRateStatus = "LIVE" | "FIXTURE" | "CACHED" | "STALE" | "UNAVAILABLE" | "UNSUPPORTED";
export type RateFreshness = "CURRENT" | "STALE" | "NOT_APPLICABLE";

export type ExchangeRateProvider = {
  id: string;
  name: string;
  sourceUrl: string;
};

export type ExchangeRate = {
  baseCurrency: ISO4217Code;
  quoteCurrency: ISO4217Code;
  rate: string;
  effectiveDate: string;
  retrievedAt: string;
  status: Exclude<ExchangeRateStatus, "UNAVAILABLE" | "UNSUPPORTED">;
  methodologyVersion: string;
};

export type ExchangeRateSnapshot = {
  id: string;
  provider: ExchangeRateProvider;
  rates: readonly ExchangeRate[];
};

export interface ExchangeRateAdapter {
  getSnapshot(): Promise<ExchangeRateSnapshot>;
}

export type ConversionResult = {
  status: ExchangeRateStatus;
  freshness: RateFreshness;
  originalAmount: string;
  originalCurrency: ISO4217Code;
  convertedAmount: bigint | null;
  displayCurrency: ISO4217Code;
  rate: string | null;
  snapshotId: string;
  provider: ExchangeRateProvider;
  effectiveDate: string | null;
  retrievedAt: string | null;
  methodologyVersion: string | null;
  roundingPolicy: "HALF_UP_WHOLE_DISPLAY_UNIT";
};

export type FreshnessPolicy = {
  maxBusinessDays: number;
  marketHolidays?: readonly string[];
};

export const DEFAULT_FRESHNESS_POLICY: FreshnessPolicy = {
  maxBusinessDays: 3,
  marketHolidays: [],
};

const ISO_CODE = /^[A-Z]{3}$/;
const DECIMAL = /^(0|[1-9]\d*)(?:\.(\d+))?$/;

function assertCurrency(currency: string) {
  if (!ISO_CODE.test(currency)) throw new Error(`Invalid ISO 4217 currency code: ${currency}`);
}

function parseDecimal(value: string): { integer: bigint; scale: bigint } {
  const match = DECIMAL.exec(value);
  if (!match) throw new Error(`Invalid non-negative decimal: ${value}`);
  const fraction = match[2] ?? "";
  return {
    integer: BigInt(`${value.split(".")[0]}${fraction}`),
    scale: 10n ** BigInt(fraction.length),
  };
}

function roundHalfUp(numerator: bigint, denominator: bigint): bigint {
  return (numerator * 2n + denominator) / (denominator * 2n);
}

function utcDate(value: string): Date {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid ISO date: ${value}`);
  return date;
}

export function businessDaysElapsed(
  effectiveDate: string,
  asOfDate: string,
  marketHolidays: readonly string[] = [],
): number {
  const start = utcDate(effectiveDate);
  const end = utcDate(asOfDate);
  if (end < start) return 0;
  const holidays = new Set(marketHolidays);
  let elapsed = 0;
  for (const cursor = new Date(start.getTime() + 86_400_000); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    const day = cursor.getUTCDay();
    const isoDate = cursor.toISOString().slice(0, 10);
    if (day !== 0 && day !== 6 && !holidays.has(isoDate)) elapsed += 1;
  }
  return elapsed;
}

export function rateFreshness(
  rate: ExchangeRate,
  asOfDate: string,
  policy: FreshnessPolicy = DEFAULT_FRESHNESS_POLICY,
): RateFreshness {
  if (rate.status === "STALE") return "STALE";
  return businessDaysElapsed(rate.effectiveDate, asOfDate, policy.marketHolidays) > policy.maxBusinessDays
    ? "STALE"
    : "CURRENT";
}

export function convertForDisplay(input: {
  amount: number | string;
  baseCurrency: ISO4217Code;
  displayCurrency: ISO4217Code;
  snapshot: ExchangeRateSnapshot;
  asOfDate: string;
  freshnessPolicy?: FreshnessPolicy;
}): ConversionResult {
  const originalAmount = String(input.amount);
  assertCurrency(input.baseCurrency);
  assertCurrency(input.displayCurrency);
  const provider = input.snapshot.provider;

  if (input.baseCurrency === input.displayCurrency) {
    const amount = parseDecimal(originalAmount);
    return {
      status: "CACHED",
      freshness: "NOT_APPLICABLE",
      originalAmount,
      originalCurrency: input.baseCurrency,
      convertedAmount: roundHalfUp(amount.integer, amount.scale),
      displayCurrency: input.displayCurrency,
      rate: "1",
      snapshotId: input.snapshot.id,
      provider,
      effectiveDate: null,
      retrievedAt: null,
      methodologyVersion: "ISO_IDENTITY",
      roundingPolicy: "HALF_UP_WHOLE_DISPLAY_UNIT",
    };
  }

  const rate = input.snapshot.rates.find((candidate) => candidate.baseCurrency === input.baseCurrency
    && candidate.quoteCurrency === input.displayCurrency);
  if (!rate) {
    const baseSupported = input.snapshot.rates.some((candidate) => candidate.baseCurrency === input.baseCurrency
      || candidate.quoteCurrency === input.baseCurrency);
    return {
      status: baseSupported ? "UNAVAILABLE" : "UNSUPPORTED",
      freshness: "NOT_APPLICABLE",
      originalAmount,
      originalCurrency: input.baseCurrency,
      convertedAmount: null,
      displayCurrency: input.displayCurrency,
      rate: null,
      snapshotId: input.snapshot.id,
      provider,
      effectiveDate: null,
      retrievedAt: null,
      methodologyVersion: null,
      roundingPolicy: "HALF_UP_WHOLE_DISPLAY_UNIT",
    };
  }

  const amount = parseDecimal(originalAmount);
  const parsedRate = parseDecimal(rate.rate);
  const freshness = rateFreshness(rate, input.asOfDate, input.freshnessPolicy);
  return {
    status: freshness === "STALE" ? "STALE" : rate.status,
    freshness,
    originalAmount,
    originalCurrency: input.baseCurrency,
    convertedAmount: roundHalfUp(amount.integer * parsedRate.integer, amount.scale * parsedRate.scale),
    displayCurrency: input.displayCurrency,
    rate: rate.rate,
    snapshotId: input.snapshot.id,
    provider,
    effectiveDate: rate.effectiveDate,
    retrievedAt: rate.retrievedAt,
    methodologyVersion: rate.methodologyVersion,
    roundingPolicy: "HALF_UP_WHOLE_DISPLAY_UNIT",
  };
}

export function convertRangeForDisplay(input: {
  low: number | string;
  high: number | string;
  baseCurrency: ISO4217Code;
  displayCurrency: ISO4217Code;
  snapshot: ExchangeRateSnapshot;
  asOfDate: string;
  freshnessPolicy?: FreshnessPolicy;
}) {
  const low = convertForDisplay({ ...input, amount: input.low });
  const high = convertForDisplay({ ...input, amount: input.high });
  if (low.convertedAmount !== null && high.convertedAmount !== null && high.convertedAmount < low.convertedAmount) {
    throw new Error("Converted range is inverted");
  }
  return { low, high };
}

const FIXTURE_PROVIDER: ExchangeRateProvider = {
  id: "destinationfinderai-u3-r3-fixture",
  name: "Deterministic architecture fixture (not live)",
  sourceUrl: "urn:destinationfinderai:exchange-rate-fixture:u3-r3",
};

const FIXTURE_RATES: readonly ExchangeRate[] = [
  ["THB", "0.028"],
  ["VND", "0.00004"],
  ["EUR", "1.10"],
  ["GBP", "1.27"],
  ["JPY", "0.0068"],
  ["MXN", "0.055"],
].map(([baseCurrency, rate]) => ({
  baseCurrency,
  quoteCurrency: "USD",
  rate,
  effectiveDate: "2026-09-04",
  retrievedAt: "2026-09-06T00:00:00.000Z",
  status: "FIXTURE" as const,
  methodologyVersion: "U3-R3-ARCHITECTURE-FIXTURE-V1",
}));

export const U3_R3_FIXTURE_SNAPSHOT: ExchangeRateSnapshot = Object.freeze({
  id: "u3-r3-fixture-2026-09-04-v1",
  provider: FIXTURE_PROVIDER,
  rates: Object.freeze(FIXTURE_RATES),
});

export class FixtureExchangeRateAdapter implements ExchangeRateAdapter {
  async getSnapshot(): Promise<ExchangeRateSnapshot> {
    return U3_R3_FIXTURE_SNAPSHOT;
  }
}