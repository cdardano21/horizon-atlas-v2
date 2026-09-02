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
    window.localStorage.setItem(
      "destinationfinderai:life-match-purpose-intake",
      JSON.stringify({
        purpose: "LEISURE_TRAVELER",
        duration: "ABOUT_ONE_MONTH",
        passport: "US",
        permitWillingness: "NOT_SURE",
        budget: "FROM_4500_TO_6499",
      }),
    );

    render(<LifeMatchApp />);

    expect(screen.getByRole("heading", { name: "Find the places that fit your life." })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Continue your Life Match/ }));

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
    window.localStorage.setItem(
      "destinationfinderai:life-match-purpose-intake",
      JSON.stringify({
        purpose: "REMOTE_EMPLOYEE",
        duration: "ABOUT_SIX_MONTHS",
        passport: "US",
        permitWillingness: "NOT_SURE",
        budget: "FROM_8500_TO_10499",
      }),
    );

    render(<LifeMatchApp />);
    fireEvent.click(screen.getByRole("button", { name: /Continue your Life Match/ }));

    expect(screen.getByRole("heading", { name: RETIREMENT_DNA_QUESTIONS[2].prompt })).toBeInTheDocument();
    expect(screen.getByText("5% complete")).toBeInTheDocument();
  });

  it("uses the existing serializer and results route after all 37 answers are complete", () => {
    const completeAnswers = Object.fromEntries(RETIREMENT_DNA_QUESTIONS.map((questionItem) => [questionItem.id, 5]));
    window.localStorage.setItem("destinationfinderai:retirement-dna-draft", JSON.stringify(completeAnswers));
    window.localStorage.setItem(
      "destinationfinderai:life-match-purpose-intake",
      JSON.stringify({
        purpose: "REMOTE_EMPLOYEE",
        duration: "ABOUT_SIX_MONTHS",
        passport: "US",
        permitWillingness: "NOT_SURE",
        budget: "FROM_10500_PLUS",
      }),
    );

    render(<LifeMatchApp />);
    fireEvent.click(screen.getByRole("button", { name: /Continue your Life Match/ }));

    fireEvent.click(screen.getByRole("button", { name: /Identity, Hobbies & Life Goals/ }));
    fireEvent.click(screen.getByRole("button", { name: /Continue/ }));
    fireEvent.click(screen.getByRole("button", { name: /Continue/ }));
    fireEvent.click(screen.getByRole("button", { name: /Continue/ }));
    fireEvent.click(screen.getByRole("button", { name: /See my Life Match/ }));

    const expectedUrl = `/results?dna=${encodeURIComponent(serializeRetirementDnaAnswers(completeAnswers))}&purpose=REMOTE_EMPLOYEE&duration=ABOUT_SIX_MONTHS&passport=US&permitWillingness=NOT_SURE&budget=FROM_10500_PLUS`;
    expect(pushMock).toHaveBeenCalledWith(expectedUrl);
    expect(window.localStorage.getItem("destinationfinderai:retirement-dna-draft")).toBeNull();
  });

  it("asks purpose then duration, then passport, then permit willingness, then budget, and maps a leisure traveler's one-month answer onto the canonical profile fields without any retirement assumption", () => {
    render(<LifeMatchApp />);
    fireEvent.click(screen.getByRole("button", { name: /Start your Life Match/ }));

    expect(screen.getByRole("heading", { name: /best describes why you.re exploring/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "Leisure traveler / extended stay" }));

    expect(screen.getByRole("heading", { name: /How long are you picturing this stay/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "Around one month" }));

    expect(screen.getByRole("heading", { name: /Which passport would you use for this stay/ })).toBeInTheDocument();
    const passportInput = screen.getByLabelText("Passport country");
    expect(passportInput).toHaveValue("");
    fireEvent.change(passportInput, { target: { value: "US" } });
    expect(screen.getByText("Step 4 of 5")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: "Not sure yet" }));
    expect(screen.getByText("Step 5 of 5")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "$4,500–$6,499" }));

    const storedIntake = JSON.parse(window.localStorage.getItem("destinationfinderai:life-match-purpose-intake") ?? "{}");
    expect(storedIntake.purpose).toBe("LEISURE_TRAVELER");
    expect(storedIntake.duration).toBe("ABOUT_ONE_MONTH");
    expect(storedIntake.passport).toBe("US");
    expect(storedIntake.permitWillingness).toBe("NOT_SURE");
    expect(storedIntake.budget).toBe("FROM_4500_TO_6499");
    expect(storedIntake.profileFields).toEqual({
      activityMode: "LEISURE_TRAVELER",
      stayDuration: { band: "SHORT_1_3_MONTHS", intendedStayDurationDays: 30 },
      tenureIntent: "UNSURE",
      intendsToWorkDuringStay: false,
    });
  });

  it("keeps the purpose, duration, passport, permit willingness, and budget in the results URL without defaulting missing values", () => {
    const completeAnswers = Object.fromEntries(RETIREMENT_DNA_QUESTIONS.map((questionItem) => [questionItem.id, 5]));
    window.localStorage.setItem("destinationfinderai:retirement-dna-draft", JSON.stringify(completeAnswers));
    window.localStorage.setItem(
      "destinationfinderai:life-match-purpose-intake",
      JSON.stringify({
        purpose: "REMOTE_EMPLOYEE",
        duration: "ABOUT_SIX_MONTHS",
        passport: "US",
        permitWillingness: "MAYBE",
        budget: "FROM_3000_TO_4499",
        profileFields: { activityMode: "REMOTE_EMPLOYEE", stayDuration: { band: "MEDIUM_3_6_MONTHS", intendedStayDurationDays: 180 }, tenureIntent: "UNSURE", intendsToWorkDuringStay: true },
      }),
    );

    render(<LifeMatchApp />);
    fireEvent.click(screen.getByRole("button", { name: /Continue your Life Match/ }));

    fireEvent.click(screen.getByRole("button", { name: /Identity, Hobbies & Life Goals/ }));
    for (let index = 0; index < 20; index += 1) {
      const finalButton = screen.queryByRole("button", { name: /See my Life Match/ });
      if (finalButton) {
        fireEvent.click(finalButton);
        break;
      }

      const continueButton = screen.queryByRole("button", { name: /Continue/ });
      if (!continueButton) break;
      fireEvent.click(continueButton);
    }

    const url = pushMock.mock.calls.at(-1)?.[0] as string;
    expect(url).toContain("purpose=REMOTE_EMPLOYEE");
    expect(url).toContain("duration=ABOUT_SIX_MONTHS");
    expect(url).toContain("passport=US");
    expect(url).toContain("permitWillingness=MAYBE");
    expect(url).toContain("budget=FROM_3000_TO_4499");
  });

  it("supports type-ahead filtering and keyboard selection in the passport chooser", () => {
    render(<LifeMatchApp />);
    fireEvent.click(screen.getByRole("button", { name: /Start your Life Match/ }));
    fireEvent.click(screen.getByRole("radio", { name: "Leisure traveler / extended stay" }));
    fireEvent.click(screen.getByRole("radio", { name: "Around one month" }));

    const passportInput = screen.getByRole("combobox", { name: "Passport country" });
    fireEvent.focus(passportInput);
    fireEvent.change(passportInput, { target: { value: "can" } });
    expect(screen.getByRole("option", { name: /Canada/i })).toBeInTheDocument();
    fireEvent.keyDown(passportInput, { key: "ArrowDown" });
    fireEvent.keyDown(passportInput, { key: "Enter" });
    expect(screen.getByRole("heading", { name: /If a longer stay requires a visa or residence permit/ })).toBeInTheDocument();
  });
});