import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ComparePage from "./page";
import { getPublicDestinations } from "../lib/public-destinations";
import { loadCompareBudgets } from "../lib/compare-budgets";
import { destinations } from "../lib/destinations";
const capture = vi.hoisted(() => vi.fn());
vi.mock("../lib/public-destinations", () => ({ getPublicDestinations: vi.fn() }));
vi.mock("../lib/compare-budgets", () => ({ loadCompareBudgets: vi.fn() }));
vi.mock("../components/CompareClient", () => ({ default: (props: unknown) => { capture(props); return <div>Comparison ready</div>; } }));
vi.mock("next/image", () => ({ default: () => null }));
beforeEach(() => { vi.clearAllMocks(); });
describe("Compare server budget wiring", () => {
  it("loads budgets for the entire existing public selection set while preserving initial slugs", async () => {
    const catalog = destinations.slice(0, 3);
    vi.mocked(getPublicDestinations).mockResolvedValue(catalog);
    const budgets = { [catalog[2].slug]: "$2,400–$3,600 per month (USD)" };
    vi.mocked(loadCompareBudgets).mockResolvedValue(budgets);
    render(await ComparePage({ searchParams: Promise.resolve({ slugs: catalog[0].slug }) }));
    expect(screen.getByText("Comparison ready")).toBeInTheDocument();
    expect(loadCompareBudgets).toHaveBeenCalledExactlyOnceWith(catalog);
    expect(capture).toHaveBeenCalledWith({ destinations: catalog, initialSlugs: [catalog[0].slug], budgetsBySlug: budgets });
  });
  it("does not add identities when publication discovery returns no destinations", async () => {
    vi.mocked(getPublicDestinations).mockResolvedValue([]);
    vi.mocked(loadCompareBudgets).mockResolvedValue({});
    render(await ComparePage({ searchParams: Promise.resolve({ slugs: "draft-town" }) }));
    expect(capture).toHaveBeenCalledWith({ destinations: [], initialSlugs: [], budgetsBySlug: {} });
  });
});
