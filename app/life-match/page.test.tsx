import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const redirectMock = vi.hoisted(() => vi.fn(() => {
  throw new Error("NEXT_REDIRECT");
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("../components/LifeMatchApp", () => ({
  default: () => <div>Obsolete Life Match introduction</div>,
}));

import LifeMatchPage from "./page";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Footer from "../components/Footer";

vi.mock("../components/AuthStatus", () => ({ default: () => null }));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("Life Match compatibility route", () => {
  it("keeps Life Match navigation and calls to action on the redirecting entry point", () => {
    render(<><Navbar /><Hero /><Footer /></>);
    const links = screen.getAllByRole("link").filter(link => /life match/i.test(link.textContent ?? ""));
    expect(links).toHaveLength(2); // Navbar and footer; hero uses action-oriented copy.
    for (const link of links) expect(link).toHaveAttribute("href", "/life-match");
    expect(screen.getByTestId("hero-cta-life-match")).toHaveAttribute("href", "/life-match");
  });
  it.each([
    ["development", undefined],
    ["development", "0"],
    ["development", "1"],
    ["production", undefined],
    ["production", "0"],
    ["production", "1"],
  ])("redirects without rendering the old assessment in %s with flag %s", (environment, flag) => {
    vi.stubEnv("NODE_ENV", environment);
    vi.stubEnv("SMART_SHORTLIST_LOCAL_PROTOTYPE", flag);
    expect(() => LifeMatchPage()).toThrow("NEXT_REDIRECT");
    expect(redirectMock).toHaveBeenCalledWith("/smart-shortlist");
    expect(screen.queryByText("Obsolete Life Match introduction")).not.toBeInTheDocument();
    expect(document.body).not.toHaveTextContent("0 of 37 answered");
  });
});
