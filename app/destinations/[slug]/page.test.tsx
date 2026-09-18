import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ eligibility: vi.fn(), canonical: vi.fn() }));
vi.mock("../../lib/public-destination-eligibility", () => ({ getPublicDestinationEligibility: mocks.eligibility }));
vi.mock("../../lib/canonical-destination-loader", () => ({ getCanonicalDestination: mocks.canonical }));
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NEXT_NOT_FOUND"); }, useRouter: () => ({}) }));
vi.mock("../../components/destination/CanonicalDestinationPage", () => ({ default: ({ destination }: { destination: { title: string } }) => <h1>{destination.title}</h1> }));
import DestinationPage from "./page";
beforeEach(() => { vi.clearAllMocks(); mocks.canonical.mockResolvedValue({ title: "Authored public content" }); });
describe("public destination route eligibility boundary", () => {
  it.each(["NONPUBLIC", "UNAVAILABLE"])("stops %s before loading draft or generated content", async eligibility => {
    mocks.eligibility.mockResolvedValue(eligibility);
    await expect(DestinationPage({ params: Promise.resolve({ slug: "wanaka-new-zealand" }) })).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mocks.canonical).not.toHaveBeenCalled();
  });
  it("renders published authored content", async () => {
    mocks.eligibility.mockResolvedValue("PUBLISHED");
    render(await DestinationPage({ params: Promise.resolve({ slug: "bariloche-argentina" }) }));
    expect(screen.getByRole("heading", { name: "Authored public content" })).toBeTruthy();
  });

  it("allows the Whitefish lean prototype to load locally when catalog eligibility is unavailable", async () => {
    mocks.eligibility.mockResolvedValue("UNAVAILABLE");
    mocks.canonical.mockResolvedValue({ title: "Whitefish prototype" });
    render(await DestinationPage({ params: Promise.resolve({ slug: "whitefish-montana-united-states" }) }));
    expect(screen.getByRole("heading", { name: "Whitefish prototype" })).toBeTruthy();
    expect(mocks.canonical).toHaveBeenCalledWith("whitefish-montana-united-states");
  });
  it("preserves canonical generation for unknown non-catalog slugs", async () => {
    mocks.eligibility.mockResolvedValue("UNKNOWN"); mocks.canonical.mockResolvedValue({ title: "Existing fallback" });
    render(await DestinationPage({ params: Promise.resolve({ slug: "unknown-island" }) }));
    expect(screen.getByRole("heading", { name: "Existing fallback" })).toBeTruthy();
  });
});
