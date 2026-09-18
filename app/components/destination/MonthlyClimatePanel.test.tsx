import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MonthlyClimatePanel from "./MonthlyClimatePanel";

describe("MonthlyClimatePanel Fahrenheit presentation", () => {
  it("defaults Celsius source values to Fahrenheit without changing the source", () => {
    const rows = [{
      month: "January",
      avgHighC: 10,
      avgLowC: 0,
      rainfallMm: 20,
      rainyDays: null,
      humidityPct: null,
      sunshineHours: null,
      uvIndex: null,
      seaTempC: null,
      verification: "verified" as const,
    }];

    render(<MonthlyClimatePanel rows={rows} />);

    expect(screen.getByText("High 50°F")).toBeInTheDocument();
    expect(screen.getByText("Low 32°F")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fahrenheit" })).toBeInTheDocument();
    expect(rows[0].avgHighC).toBe(10);
    expect(rows[0].avgLowC).toBe(0);
  });
});
