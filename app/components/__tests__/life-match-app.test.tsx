import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LifeMatchApp from "../LifeMatchApp";
import { RETIREMENT_DNA_QUESTIONS, serializeRetirementDnaAnswers } from "../../lib/retirement-dna";

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe("LifeMatchApp", () => {
  beforeEach(() => {
    window.localStorage.clear();
    pushMock.mockClear();
    window.scrollTo = vi.fn();
    window.requestAnimationFrame = (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    };
  });

  it("maps the selected scale value, reports real progress, and preserves it through Back", () => {
    render(<LifeMatchApp />);

    expect(screen.getByRole("heading", { name: "Find the places that fit your life." })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Start your Life Match/ }));

    expect(screen.getByRole("heading", { name: RETIREMENT_DNA_QUESTIONS[0].prompt })).toBeInTheDocument();
    const essential = screen.getByRole("radio", { name: /Essential/ });
    fireEvent.click(essential);

    expect(essential).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("3% complete")).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem("destinationfinderai:retirement-dna-draft") ?? "{}")).toEqual({
      [RETIREMENT_DNA_QUESTIONS[0].id]: 5,
    });

    fireEvent.click(screen.getByRole("button", { name: /Continue/ }));
    expect(screen.getByRole("heading", { name: RETIREMENT_DNA_QUESTIONS[1].prompt })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Back/ }));

    expect(screen.getByRole("heading", { name: RETIREMENT_DNA_QUESTIONS[0].prompt })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Essential/ })).toHaveAttribute("aria-checked", "true");
  });

  it("resumes at the first unanswered question from the existing local draft", () => {
    window.localStorage.setItem("destinationfinderai:retirement-dna-draft", JSON.stringify({
      [RETIREMENT_DNA_QUESTIONS[0].id]: 4,
      [RETIREMENT_DNA_QUESTIONS[1].id]: 3,
    }));

    render(<LifeMatchApp />);
    fireEvent.click(screen.getByRole("button", { name: /Continue your Life Match/ }));

    expect(screen.getByRole("heading", { name: RETIREMENT_DNA_QUESTIONS[2].prompt })).toBeInTheDocument();
    expect(screen.getByText("5% complete")).toBeInTheDocument();
  });

  it("uses the existing serializer and results route after all 37 answers are complete", () => {
    const completeAnswers = Object.fromEntries(RETIREMENT_DNA_QUESTIONS.map((questionItem) => [questionItem.id, 5]));
    window.localStorage.setItem("destinationfinderai:retirement-dna-draft", JSON.stringify(completeAnswers));

    render(<LifeMatchApp />);
    fireEvent.click(screen.getByRole("button", { name: /Continue your Life Match/ }));
    fireEvent.click(screen.getByRole("button", { name: /Identity, Hobbies & Retirement Goals/ }));
    fireEvent.click(screen.getByRole("button", { name: /Continue/ }));
    fireEvent.click(screen.getByRole("button", { name: /Continue/ }));
    fireEvent.click(screen.getByRole("button", { name: /Continue/ }));
    fireEvent.click(screen.getByRole("button", { name: /See my Life Match/ }));

    expect(pushMock).toHaveBeenCalledWith(`/results?dna=${encodeURIComponent(serializeRetirementDnaAnswers(completeAnswers))}`);
    expect(window.localStorage.getItem("destinationfinderai:retirement-dna-draft")).toBeNull();
  });
});