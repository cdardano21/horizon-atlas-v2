import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Destination } from "../../lib/destinations";
import CompareClient from "../CompareClient";

const { favoriteSlugs } = vi.hoisted(() => ({ favoriteSlugs: [] as string[] }));

vi.mock("../favorites", () => ({
  useFavorites: () => ({ favoriteSlugs }),
}));

const makeDestination = (city: string, index: number): Destination => ({
  slug: `${city.toLowerCase()}-${index}`,
  city,
  country: `Country ${index}`,
  emoji: "",
  match: 60 + index,
  description: `${city} destination description.`,
  overview: `${city} destination overview.`,
  climate: `${city} climate summary.`,
  lifestyle: `${city} lifestyle summary.`,
  transportation: `${city} transportation summary.`,
  images: [],
  tags: index % 2 === 0 ? ["walkability", "cultural"] : [],
});

const destinations = ["Lisbon", "Valencia", "Malaga", "Summerlin", "Cascais"].map(makeDestination);

describe("CompareClient", () => {
  beforeEach(() => {
    favoriteSlugs.splice(0);
  });

  it.each([1, 2, 4])("renders an ordered %s-destination comparison", (count) => {
    const selected = destinations.slice(0, count);
    render(<CompareClient destinations={destinations} initialSlugs={selected.map((item) => item.slug)} />);

    const headers = screen.getAllByTestId("compare-destination-header");
    expect(headers).toHaveLength(count);
    expect(headers.map((header) => within(header).getByRole("heading").textContent)).toEqual(selected.map((item) => item.city));
  });

  it("blocks a fifth destination while preserving the first four in order", () => {
    render(<CompareClient destinations={destinations} initialSlugs={destinations.slice(0, 4).map((item) => item.slug)} />);

    fireEvent.click(screen.getByRole("button", { name: /Add Cascais/i }));

    const headers = screen.getAllByTestId("compare-destination-header");
    expect(headers).toHaveLength(4);
    expect(headers.map((header) => within(header).getByRole("heading").textContent)).toEqual(["Lisbon", "Valencia", "Malaga", "Summerlin"]);
  });

  it("adds, removes, and clears destinations without corrupting the remaining order", () => {
    render(<CompareClient destinations={destinations} initialSlugs={destinations.slice(0, 2).map((item) => item.slug)} />);

    fireEvent.click(screen.getByRole("button", { name: /Add Malaga/i }));
    fireEvent.click(screen.getByRole("button", { name: /Remove Valencia/i }));

    expect(screen.getAllByTestId("compare-destination-header").map((header) => within(header).getByRole("heading").textContent)).toEqual(["Lisbon", "Malaga"]);

    fireEvent.click(screen.getByRole("button", { name: /Clear comparison/i }));
    expect(screen.getByRole("heading", { name: "Compare destinations" })).toBeInTheDocument();
    expect(screen.queryAllByTestId("compare-destination-header")).toHaveLength(0);
  });

  it("keeps destination links valid and renders unavailable values honestly", () => {
    render(<CompareClient destinations={destinations} initialSlugs={[destinations[0].slug]} />);

    expect(screen.getByRole("link", { name: /Open Lisbon guide/i })).toHaveAttribute("href", `/destinations/${destinations[0].slug}`);
    expect(screen.getAllByText("Not yet verified").length).toBeGreaterThan(0);
  });

  it("preserves favorites precedence for the default selection", () => {
    favoriteSlugs.push(destinations[3].slug, destinations[4].slug);
    render(<CompareClient destinations={destinations} initialSlugs={destinations.slice(0, 3).map((item) => item.slug)} />);

    expect(screen.getAllByTestId("compare-destination-header").map((header) => within(header).getByRole("heading").textContent)).toEqual(["Summerlin", "Cascais"]);
  });

  it("preserves an explicit URL selection over favorites", () => {
    favoriteSlugs.push(destinations[3].slug, destinations[4].slug);
    render(<CompareClient destinations={destinations} initialSlugs={[destinations[1].slug]} />);

    expect(screen.getAllByTestId("compare-destination-header").map((header) => within(header).getByRole("heading").textContent)).toEqual(["Valencia"]);
  });

  it("filters add controls by city or country without changing the selection", () => {
    render(<CompareClient destinations={destinations} initialSlugs={[destinations[0].slug]} />);

    fireEvent.change(screen.getByRole("searchbox", { name: /Add a destination/i }), { target: { value: "country 4" } });

    expect(screen.getByRole("button", { name: /Add Cascais/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Add Valencia/i })).not.toBeInTheDocument();
    expect(screen.getAllByTestId("compare-destination-header")).toHaveLength(1);
  });

  it("uses a quieter shared-lead treatment when leading scores tie", () => {
    render(<CompareClient destinations={destinations} initialSlugs={destinations.slice(0, 4).map((item) => item.slug)} />);

    expect(screen.getAllByText("Shared lead").length).toBeGreaterThan(1);
    expect(screen.getAllByText("Leading score").length).toBeGreaterThan(0);
  });
});