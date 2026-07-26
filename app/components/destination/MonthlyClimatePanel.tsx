"use client";

import { useMemo, useState } from "react";
import type { MonthlyClimateRow } from "../../lib/destination-command-center";
import SourceVerificationBadge from "./SourceVerificationBadge";
import MissingDataState from "./MissingDataState";

const C_TO_F = (c: number) => (c * 9) / 5 + 32;
const MM_TO_IN = (mm: number) => mm / 25.4;

function toDisplay(value: number | null, digits = 0) {
  if (typeof value !== "number") return "-";
  return value.toFixed(digits);
}

function average(values: Array<number | null>) {
  const filtered = values.filter((value): value is number => typeof value === "number");
  if (filtered.length === 0) return null;
  return filtered.reduce((sum, value) => sum + value, 0) / filtered.length;
}

export default function MonthlyClimatePanel({ rows }: { rows: MonthlyClimateRow[] }) {
  const [tempUnit, setTempUnit] = useState<"C" | "F">("C");
  const [rainUnit, setRainUnit] = useState<"mm" | "in">("mm");

  const normalized = useMemo(() => {
    return rows.map((row) => {
      const high = typeof row.avgHighC === "number" ? (tempUnit === "C" ? row.avgHighC : C_TO_F(row.avgHighC)) : null;
      const low = typeof row.avgLowC === "number" ? (tempUnit === "C" ? row.avgLowC : C_TO_F(row.avgLowC)) : null;
      const rain = typeof row.rainfallMm === "number" ? (rainUnit === "mm" ? row.rainfallMm : MM_TO_IN(row.rainfallMm)) : null;
      return { ...row, high, low, rain };
    });
  }, [rows, tempUnit, rainUnit]);

  const highMax = Math.max(...normalized.map((row) => row.high ?? Number.NEGATIVE_INFINITY));
  const highSafe = Number.isFinite(highMax) ? highMax : 0;
  const swimmingMonths = rows.filter((row) => typeof row.seaTempC === "number" && row.seaTempC >= 20).map((row) => row.month);
  const walkingMonths = rows.filter((row) => typeof row.avgHighC === "number" && row.avgHighC >= 16 && row.avgHighC <= 26).map((row) => row.month);
  const warmestMonth = rows.reduce<MonthlyClimateRow | null>((current, row) => {
    if (typeof row.avgHighC !== "number") return current;
    if (!current || typeof current.avgHighC !== "number" || row.avgHighC > current.avgHighC) return row;
    return current;
  }, null);
  const averageRain = average(rows.map((row) => row.rainfallMm));

  if (rows.length === 0) {
    return (
      <MissingDataState
        title="No verified climate information currently available"
        description="Publish monthly climate rows with source URLs and update dates to unlock seasonal guidance, swimming windows, and comfort comparisons."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[linear-gradient(145deg,rgba(255,252,246,0.95),rgba(247,238,222,0.84))] p-6 shadow-xl shadow-[rgba(41,34,23,0.18)]">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--atlas-accent)]">Seasonal lens</p>
          <h3 className="mt-3 text-3xl font-semibold text-[var(--atlas-ink)]">See the rhythm of the year before you compare raw numbers.</h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--atlas-muted)]">
            Horizon Atlas translates the climate table into living signals: when the city feels best for long walks, when the water gets inviting, and when rain starts to shape daily routines.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.7)] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--atlas-accent)]">Swimming season</p>
              <p className="mt-2 text-lg font-semibold text-[var(--atlas-ink)]">{swimmingMonths.length > 0 ? `${swimmingMonths[0]} to ${swimmingMonths[swimmingMonths.length - 1]}` : "Not yet published"}</p>
              <p className="mt-1 text-sm text-[var(--atlas-muted)]">Sea temperature at or above 20°C.</p>
            </div>
            <div className="rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.7)] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--atlas-accent)]">Walking season</p>
              <p className="mt-2 text-lg font-semibold text-[var(--atlas-ink)]">{walkingMonths.length > 0 ? `${walkingMonths[0]} to ${walkingMonths[walkingMonths.length - 1]}` : "Not yet published"}</p>
              <p className="mt-1 text-sm text-[var(--atlas-muted)]">Comfortable daytime highs for exploring.</p>
            </div>
            <div className="rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.7)] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--atlas-accent)]">Warmest stretch</p>
              <p className="mt-2 text-lg font-semibold text-[var(--atlas-ink)]">{warmestMonth ? `${warmestMonth.month} · ${toDisplay(tempUnit === "C" ? warmestMonth.avgHighC : typeof warmestMonth.avgHighC === "number" ? C_TO_F(warmestMonth.avgHighC) : null)}°${tempUnit}` : "Not yet published"}</p>
              <p className="mt-1 text-sm text-[var(--atlas-muted)]">Average rain {toDisplay(rainUnit === "mm" ? averageRain : averageRain !== null ? MM_TO_IN(averageRain) : null, rainUnit === "mm" ? 0 : 2)} {rainUnit}.</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.85)] p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--atlas-accent)]">Units</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTempUnit("C")}
              className={`rounded-full border px-3 py-1 text-xs ${tempUnit === "C" ? "border-[rgba(31,95,99,0.45)] bg-[rgba(31,95,99,0.1)] text-[var(--atlas-accent)]" : "border-[var(--atlas-border)] text-[var(--atlas-muted)]"}`}
            >
              Celsius
            </button>
            <button
              type="button"
              onClick={() => setTempUnit("F")}
              className={`rounded-full border px-3 py-1 text-xs ${tempUnit === "F" ? "border-[rgba(31,95,99,0.45)] bg-[rgba(31,95,99,0.1)] text-[var(--atlas-accent)]" : "border-[var(--atlas-border)] text-[var(--atlas-muted)]"}`}
            >
              Fahrenheit
            </button>
            <button
              type="button"
              onClick={() => setRainUnit("mm")}
              className={`rounded-full border px-3 py-1 text-xs ${rainUnit === "mm" ? "border-[rgba(31,95,99,0.45)] bg-[rgba(31,95,99,0.1)] text-[var(--atlas-accent)]" : "border-[var(--atlas-border)] text-[var(--atlas-muted)]"}`}
            >
              mm
            </button>
            <button
              type="button"
              onClick={() => setRainUnit("in")}
              className={`rounded-full border px-3 py-1 text-xs ${rainUnit === "in" ? "border-[rgba(31,95,99,0.45)] bg-[rgba(31,95,99,0.1)] text-[var(--atlas-accent)]" : "border-[var(--atlas-border)] text-[var(--atlas-muted)]"}`}
            >
              inches
            </button>
          </div>
          <p className="mt-4 text-sm leading-7 text-[var(--atlas-muted)]">
            Use this panel to compare long-stay comfort, not just summer postcards. Shoulder seasons often tell you more about real daily life than peak travel months.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-6">
        {normalized.map((row, index) => {
          const highPercent = highSafe > 0 && typeof row.high === "number" ? Math.max(8, (row.high / highSafe) * 100) : 0;
          const lowPercent = highSafe > 0 && typeof row.low === "number" ? Math.max(8, (row.low / highSafe) * 100) : 0;
          const palette = [
            "from-sky-500/25 to-cyan-500/10",
            "from-emerald-500/20 to-cyan-500/10",
            "from-amber-500/20 to-orange-500/10",
            "from-rose-500/20 to-fuchsia-500/10",
          ][index % 4];

          return (
            <div key={row.month} className={`rounded-[1.75rem] border border-[var(--atlas-border)] bg-gradient-to-br ${palette} p-4 shadow-lg shadow-[rgba(41,34,23,0.16)]`}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--atlas-ink)]">{row.month.slice(0, 3)}</p>
                <p className="text-xs text-[var(--atlas-muted)]">UV {toDisplay(row.uvIndex, 1)}</p>
              </div>
              <div className="mt-4 space-y-3">
                <div>
                    <div className="h-2 rounded-full bg-[rgba(31,95,99,0.14)]">
                    <div className="h-2 rounded-full bg-orange-300" style={{ width: `${highPercent}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-[var(--atlas-ink)]">High {toDisplay(row.high)}°{tempUnit}</p>
                </div>
                <div>
                    <div className="h-2 rounded-full bg-[rgba(31,95,99,0.14)]">
                    <div className="h-2 rounded-full bg-cyan-300" style={{ width: `${lowPercent}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-[var(--atlas-ink)]">Low {toDisplay(row.low)}°{tempUnit}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-[var(--atlas-ink)]">
                <div className="rounded-2xl bg-[rgba(255,255,255,0.66)] p-2">Rain {toDisplay(row.rain, rainUnit === "mm" ? 0 : 2)} {rainUnit}</div>
                <div className="rounded-2xl bg-[rgba(255,255,255,0.66)] p-2">Sea {toDisplay(row.seaTempC)}°C</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.86)] shadow-lg shadow-[rgba(41,34,23,0.16)]">
        <table className="min-w-full text-left text-sm text-[var(--atlas-muted)]">
          <thead className="bg-[rgba(31,95,99,0.08)] text-xs uppercase tracking-[0.2em] text-[var(--atlas-accent)]">
            <tr>
              <th className="px-4 py-3">Month</th>
              <th className="px-4 py-3">High</th>
              <th className="px-4 py-3">Low</th>
              <th className="px-4 py-3">Rain</th>
              <th className="px-4 py-3">Rainy days</th>
              <th className="px-4 py-3">Humidity</th>
              <th className="px-4 py-3">Sun</th>
              <th className="px-4 py-3">UV</th>
              <th className="px-4 py-3">Sea</th>
              <th className="px-4 py-3">Source status</th>
            </tr>
          </thead>
          <tbody>
            {normalized.map((row) => (
              <tr key={row.month} className="border-t border-[var(--atlas-border)] align-top">
                <td className="px-4 py-3 font-semibold text-[var(--atlas-ink)]">{row.month}</td>
                <td className="px-4 py-3">{toDisplay(row.high)}°{tempUnit}</td>
                <td className="px-4 py-3">{toDisplay(row.low)}°{tempUnit}</td>
                <td className="px-4 py-3">{toDisplay(row.rain, rainUnit === "mm" ? 0 : 2)} {rainUnit}</td>
                <td className="px-4 py-3">{toDisplay(row.rainyDays)}</td>
                <td className="px-4 py-3">{toDisplay(row.humidityPct)}%</td>
                <td className="px-4 py-3">{toDisplay(row.sunshineHours)}</td>
                <td className="px-4 py-3">{toDisplay(row.uvIndex, 1)}</td>
                <td className="px-4 py-3">{toDisplay(row.seaTempC)}°C</td>
                <td className="px-4 py-3"><SourceVerificationBadge verification={row.verification} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
