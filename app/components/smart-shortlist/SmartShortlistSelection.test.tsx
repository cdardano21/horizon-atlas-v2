import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SmartShortlistPrototype from "./SmartShortlistPrototype";
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

describe("questionnaire selection presentation", () => {
  it("moves the visible pressed indicator and preserves Europe through review", () => {
    render(<SmartShortlistPrototype candidates={[]} intelligence={[]} />);
    const anywhere = screen.getByRole("button", { name: "Anywhere in the profiled set" });
    const europe = screen.getByRole("button", { name: "Europe" });
    expect(anywhere).toHaveAttribute("aria-pressed", "true");
    expect(anywhere).toHaveTextContent("✓");
    fireEvent.click(europe);
    expect(europe).toHaveAttribute("aria-pressed", "true");
    expect(europe).toHaveTextContent("✓");
    expect(anywhere).toHaveAttribute("aria-pressed", "false");
    expect(anywhere).not.toHaveTextContent("✓");
    expect(europe.className).toContain("bg-[#1f5f63]");
    expect(europe.className).not.toContain("bg-white");
    expect(europe.className).toContain("focus-visible:outline-offset-2");
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByText("europe", { selector: "dd" })).toBeInTheDocument();
  });
  it("applies the shared selected styling to requirement choices", () => {
    render(<SmartShortlistPrototype candidates={[]} intelligence={[]} />);
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    const choices = screen.getAllByRole("button", { name: "Must have" });
    fireEvent.click(choices[0]);
    expect(choices[0]).toHaveAttribute("aria-pressed", "true");
    expect(choices[0]).toHaveTextContent("✓");
    expect(choices[0].className).toContain("hover:bg-[#1f5f63]");
  });
});
