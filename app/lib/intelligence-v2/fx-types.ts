/**
 * Explicit, frozen, versioned FX contract. This is runtime/reference-market
 * data - NOT a destination fact and NOT workbook content. It must never be
 * fetched live inside an evaluator; callers always supply an immutable
 * `FxRateTable` snapshot.
 *
 * Semantic rule for every `FxRateSnapshot`: 1 unit of `baseCurrency` = `rate`
 * units of `quoteCurrency`.
 */

export type FxModelVersion = string;

export interface FxRateSnapshot {
  readonly baseCurrency: string;
  readonly quoteCurrency: string;
  /** 1 unit of baseCurrency = this many units of quoteCurrency. Must be a finite, positive number. */
  readonly rate: number;
}

export interface FxRateTable {
  /** Versions this specific rate set, independent of every other Intelligence v2 model version. */
  readonly snapshotVersion: FxModelVersion;
  /** ISO date the rates represent. */
  readonly effectiveDate: string;
  /** Free-text provenance, e.g. "manual planning assumption", "ECB reference rate". */
  readonly source: string;
  readonly rates: readonly FxRateSnapshot[];
}
