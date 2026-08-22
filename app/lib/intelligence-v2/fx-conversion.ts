/**
 * Pure, deterministic currency conversion over an explicit, frozen FxRateTable.
 * No network access, no current-date dependency, no hidden global state - the
 * caller always supplies the table; nothing is fetched here.
 */
import type { FxRateTable } from "./fx-types";

export type FxConversionFailureReason = "INVALID_CURRENCY_CODE" | "INVALID_RATE_IN_TABLE" | "MISSING_RATE_FOR_CURRENCY_PAIR";

export type FxConversionResult = { readonly ok: true; readonly amount: number } | { readonly ok: false; readonly reason: FxConversionFailureReason };

function isValidCurrencyCode(code: string): boolean {
  return typeof code === "string" && code.trim().length > 0;
}

function isValidRateValue(rate: number): boolean {
  return Number.isFinite(rate) && rate > 0;
}

/** True if this raw (unvalidated) snapshot describes the requested pair, in either direction. */
function snapshotDescribesPair(snapshot: FxRateTable["rates"][number], fromCurrency: string, toCurrency: string): boolean {
  return (snapshot.baseCurrency === fromCurrency && snapshot.quoteCurrency === toCurrency) || (snapshot.baseCurrency === toCurrency && snapshot.quoteCurrency === fromCurrency);
}

/** Deterministic BFS over valid-only edges (direct + safely-inverted), composing the multiplier along the path. Table order is fixed, so the discovered path is always the same for the same table. */
function findCompositeRate(fromCurrency: string, toCurrency: string, fxTable: FxRateTable): number | null {
  const adjacency = new Map<string, Array<{ to: string; multiplier: number }>>();
  const addEdge = (from: string, to: string, multiplier: number) => {
    const edges = adjacency.get(from) ?? [];
    edges.push({ to, multiplier });
    adjacency.set(from, edges);
  };
  for (const snapshot of fxTable.rates) {
    if (!isValidRateValue(snapshot.rate)) continue; // never compose through a corrupted entry
    addEdge(snapshot.baseCurrency, snapshot.quoteCurrency, snapshot.rate);
    addEdge(snapshot.quoteCurrency, snapshot.baseCurrency, 1 / snapshot.rate);
  }

  const visited = new Set<string>([fromCurrency]);
  const queue: Array<{ currency: string; multiplier: number }> = [{ currency: fromCurrency, multiplier: 1 }];
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.currency === toCurrency) return current.multiplier;
    for (const edge of adjacency.get(current.currency) ?? []) {
      if (visited.has(edge.to)) continue;
      visited.add(edge.to);
      queue.push({ currency: edge.to, multiplier: current.multiplier * edge.multiplier });
    }
  }
  return null;
}

/**
 * Converts `amount` from `fromCurrency` to `toCurrency` using `fxTable`.
 * Same currency short-circuits with no table lookup at all. Full precision is
 * preserved (no intermediate rounding) - round only for display, elsewhere.
 */
export function convertAmount(amount: number, fromCurrency: string, toCurrency: string, fxTable: FxRateTable): FxConversionResult {
  if (!isValidCurrencyCode(fromCurrency) || !isValidCurrencyCode(toCurrency)) {
    return { ok: false, reason: "INVALID_CURRENCY_CODE" };
  }
  if (fromCurrency === toCurrency) {
    return { ok: true, amount };
  }

  const directOrInverseSnapshot = fxTable.rates.find((snapshot) => snapshotDescribesPair(snapshot, fromCurrency, toCurrency));
  if (directOrInverseSnapshot && !isValidRateValue(directOrInverseSnapshot.rate)) {
    return { ok: false, reason: "INVALID_RATE_IN_TABLE" };
  }

  const compositeRate = findCompositeRate(fromCurrency, toCurrency, fxTable);
  if (compositeRate === null) {
    return { ok: false, reason: "MISSING_RATE_FOR_CURRENCY_PAIR" };
  }
  return { ok: true, amount: amount * compositeRate };
}

export interface ConvertibleMoneyRange {
  readonly low: number;
  readonly high: number;
  readonly currencyCode: string;
}

export type FxRangeConversionResult = { readonly ok: true; readonly range: ConvertibleMoneyRange } | { readonly ok: false; readonly reason: FxConversionFailureReason };

/** Converts both bounds of a range with the same table/currencies, so `low` and `high` are always converted consistently (never a different rate for one than the other). */
export function convertMoneyRange(range: ConvertibleMoneyRange, toCurrency: string, fxTable: FxRateTable): FxRangeConversionResult {
  if (range.currencyCode === toCurrency) return { ok: true, range };

  const lowResult = convertAmount(range.low, range.currencyCode, toCurrency, fxTable);
  if (!lowResult.ok) return lowResult;
  const highResult = convertAmount(range.high, range.currencyCode, toCurrency, fxTable);
  if (!highResult.ok) return highResult;

  return { ok: true, range: { low: lowResult.amount, high: highResult.amount, currencyCode: toCurrency } };
}
