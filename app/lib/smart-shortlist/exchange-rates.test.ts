import { describe, expect, it } from "vitest";
import {
  businessDaysElapsed,
  convertForDisplay,
  convertRangeForDisplay,
  FixtureExchangeRateAdapter,
  rateFreshness,
  U3_R3_FIXTURE_SNAPSHOT,
  type ExchangeRateSnapshot,
} from "./exchange-rates";

const convert = (amount: number | string, baseCurrency: string, displayCurrency = "USD", asOfDate = "2026-09-06") => convertForDisplay({
  amount,
  baseCurrency,
  displayCurrency,
  snapshot: U3_R3_FIXTURE_SNAPSHOT,
  asOfDate,
});

describe("provider-neutral exchange-rate conversion", () => {
  it.each([
    ["THB", 45_000, 1_260n],
    ["VND", 25_000_000, 1_000n],
    ["EUR", 1_500, 1_650n],
    ["GBP", 1_500, 1_905n],
    ["JPY", 200_000, 1_360n],
    ["MXN", 25_000, 1_375n],
  ])("converts %s to USD with fixed-point arithmetic", (currency, amount, expected) => {
    expect(convert(amount, currency).convertedAmount).toBe(expected);
  });

  it("handles USD identity without looking up or inventing a rate", () => {
    const result = convert("4500", "USD");
    expect(result.convertedAmount).toBe(4_500n);
    expect(result.rate).toBe("1");
    expect(result.methodologyVersion).toBe("ISO_IDENTITY");
  });

  it("never inverts a currency pair", () => {
    const result = convert(1_000, "USD", "THB");
    expect(result.status).toBe("UNAVAILABLE");
    expect(result.convertedAmount).toBeNull();
  });

  it("distinguishes unsupported currencies from unavailable quote pairs", () => {
    expect(convert(100, "CAD").status).toBe("UNSUPPORTED");
    expect(convert(100, "THB", "EUR").status).toBe("UNAVAILABLE");
  });

  it("never turns a missing rate into zero", () => {
    expect(convert(100, "CAD").convertedAmount).toBeNull();
  });

  it("preserves range order and source values", () => {
    const range = convertRangeForDisplay({ low: 45_000, high: 60_000, baseCurrency: "THB", displayCurrency: "USD", snapshot: U3_R3_FIXTURE_SNAPSHOT, asOfDate: "2026-09-06" });
    expect([range.low.originalAmount, range.high.originalAmount]).toEqual(["45000", "60000"]);
    expect([range.low.convertedAmount, range.high.convertedAmount]).toEqual([1_260n, 1_680n]);
  });

  it("rounds half up to whole display-currency units", () => {
    expect(convert("1", "MXN").convertedAmount).toBe(0n);
    expect(convert("10", "MXN").convertedAmount).toBe(1n);
  });

  it("uses one immutable snapshot for an adapter session", async () => {
    const adapter = new FixtureExchangeRateAdapter();
    const first = await adapter.getSnapshot();
    const second = await adapter.getSnapshot();
    expect(first).toBe(second);
    expect(Object.isFrozen(first)).toBe(true);
  });

  it("labels an explicitly stale rate", () => {
    const snapshot: ExchangeRateSnapshot = {
      ...U3_R3_FIXTURE_SNAPSHOT,
      rates: [{ ...U3_R3_FIXTURE_SNAPSHOT.rates[0], status: "STALE" }],
    };
    expect(convertForDisplay({ amount: 1_000, baseCurrency: "THB", displayCurrency: "USD", snapshot, asOfDate: "2026-09-06" }).status).toBe("STALE");
  });

  it("applies freshness in business days so weekends and declared holidays do not age a rate", () => {
    const rate = U3_R3_FIXTURE_SNAPSHOT.rates[0];
    expect(businessDaysElapsed("2026-09-04", "2026-09-07", ["2026-09-07"])).toBe(0);
    expect(rateFreshness(rate, "2026-09-09", { maxBusinessDays: 3, marketHolidays: ["2026-09-07"] })).toBe("CURRENT");
    expect(rateFreshness(rate, "2026-09-11", { maxBusinessDays: 3, marketHolidays: ["2026-09-07"] })).toBe("STALE");
  });

  it("rejects malformed and negative decimals instead of guessing", () => {
    expect(() => convert("-1", "EUR")).toThrow("Invalid non-negative decimal");
    expect(() => convert("1e3", "EUR")).toThrow("Invalid non-negative decimal");
  });
});