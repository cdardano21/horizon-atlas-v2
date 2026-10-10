import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CompareClient from "./CompareClient";
import { destinations } from "../lib/destinations";
vi.mock("./favorites", () => ({ useFavorites: () => ({ favoriteSlugs: [] }) }));
vi.mock("./CompareDestinationImage", () => ({ default: () => null }));
const samples = destinations.slice(0, 3);
const budgetRow = () => screen.getByText("Couple budget (USD)").parentElement!;
describe("Compare authoritative budget presentation", () => {
  it("renders supplied canonical USD ranges alongside honest unavailable values and guide links", () => {
    render(<CompareClient destinations={samples} initialSlugs={samples.slice(0, 2).map(d => d.slug)} budgetsBySlug={{ [samples[0].slug]: "$2,400–$3,600 per month (USD)" }} />);
    expect(within(budgetRow()).getByText("$2,400–$3,600 per month (USD)")).toBeInTheDocument();
    expect(within(budgetRow()).getByText("USD estimate unavailable.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: `Open ${samples[0].city} guide` })).toHaveAttribute("href", `/destinations/${samples[0].slug}`);
    expect(screen.queryByText("Estimated monthly budget")).not.toBeInTheDocument();
  });
  it("does not synthesize a budget from destination tags when no persisted range is supplied", () => {
    render(<CompareClient destinations={samples} initialSlugs={[samples[0].slug]} />);
    expect(within(budgetRow()).getByText("USD estimate unavailable.")).toBeInTheDocument();
  });
  it("updates budgets for interactive selections without losing layout or guide navigation", () => {
    render(<CompareClient destinations={samples} initialSlugs={[samples[0].slug]} budgetsBySlug={{ [samples[1].slug]: "$2,800–$3,500 per month (USD)" }} />);
    fireEvent.click(screen.getByRole("button", { name: `Add ${samples[1].city}` }));
    expect(within(budgetRow()).getByText("$2,800–$3,500 per month (USD)")).toBeInTheDocument();
    expect(within(budgetRow()).getByText("USD estimate unavailable.")).toBeInTheDocument();
  });
});
