"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  computeRetirementDnaProfile,
  getDimensionDescription,
  RETIREMENT_DNA_QUESTIONS,
  RETIREMENT_DNA_SCALE,
  RETIREMENT_DNA_SECTIONS,
  RETIREMENT_DNA_TOTAL_QUESTIONS,
  serializeRetirementDnaAnswers,
  type RetirementDnaAnswers,
} from "../lib/retirement-dna";
import {
  derivePurposeAndDurationProfileFields,
  LIFE_MATCH_BUDGET_OPTIONS,
  LIFE_MATCH_PASSPORT_OPTIONS,
  LIFE_MATCH_PERMIT_WILLINGNESS_OPTIONS,
  LIFE_MATCH_PURPOSE_OPTIONS,
  LIFE_MATCH_STAY_DURATION_OPTIONS,
  type LifeMatchBudgetAnswer,
  type LifeMatchPassportAnswer,
  type LifeMatchPermitWillingnessAnswer,
  type LifeMatchPurposeAnswer,
  type LifeMatchStayDurationAnswer,
} from "../lib/intelligence-v2/purpose-duration-intake";

const DRAFT_STORAGE_KEY = "destinationfinderai:retirement-dna-draft";
const PURPOSE_INTAKE_STORAGE_KEY = "destinationfinderai:life-match-purpose-intake";

const parseDraftAnswers = (rawDraft: string): RetirementDnaAnswers => {
  try {
    return rawDraft ? (JSON.parse(rawDraft) as RetirementDnaAnswers) : {};
  } catch {
    return {};
  }
};

const subscribeToDraft = () => () => {};
const readDraftSnapshot = () => window.localStorage.getItem(DRAFT_STORAGE_KEY) ?? "";
const readServerDraftSnapshot = () => "";

type PurposeIntakeDraft = {
  purpose: LifeMatchPurposeAnswer | null;
  duration: LifeMatchStayDurationAnswer | null;
  passport: LifeMatchPassportAnswer | null;
  permitWillingness: LifeMatchPermitWillingnessAnswer | null;
  budget: LifeMatchBudgetAnswer | null;
};

const parsePurposeIntakeDraft = (rawDraft: string): PurposeIntakeDraft => {
  try {
    if (!rawDraft) return { purpose: null, duration: null, passport: null, permitWillingness: null, budget: null };
    const parsed = JSON.parse(rawDraft) as Partial<PurposeIntakeDraft>;
    return {
      purpose: parsed.purpose ?? null,
      duration: parsed.duration ?? null,
      passport: parsed.passport ?? null,
      permitWillingness: parsed.permitWillingness ?? null,
      budget: parsed.budget ?? null,
    };
  } catch {
    return { purpose: null, duration: null, passport: null, permitWillingness: null, budget: null };
  }
};

const readPurposeIntakeSnapshot = () => window.localStorage.getItem(PURPOSE_INTAKE_STORAGE_KEY) ?? "";

export default function LifeMatchApp() {
  const draftSnapshot = useSyncExternalStore(subscribeToDraft, readDraftSnapshot, readServerDraftSnapshot);
  const [editedAnswers, setEditedAnswers] = useState<RetirementDnaAnswers | null>(null);
  const answers = editedAnswers ?? parseDraftAnswers(draftSnapshot);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const questionHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const router = useRouter();

  const purposeIntakeSnapshot = useSyncExternalStore(subscribeToDraft, readPurposeIntakeSnapshot, readServerDraftSnapshot);
  const [editedPurposeIntake, setEditedPurposeIntake] = useState<PurposeIntakeDraft | null>(null);
  const purposeIntake = editedPurposeIntake ?? parsePurposeIntakeDraft(purposeIntakeSnapshot);
  const [passportQuery, setPassportQuery] = useState("");
  const [isPassportOpen, setIsPassportOpen] = useState(false);
  const [highlightedPassportIndex, setHighlightedPassportIndex] = useState(0);

  const derivedPurposeProfileFields = useMemo(() => {
    if (!purposeIntake.purpose || !purposeIntake.duration) return null;
    return derivePurposeAndDurationProfileFields(purposeIntake.purpose, purposeIntake.duration);
  }, [purposeIntake.purpose, purposeIntake.duration]);

  const passportOptions = useMemo(() => {
    const query = passportQuery.trim().toLowerCase();
    if (!query) return LIFE_MATCH_PASSPORT_OPTIONS;
    return LIFE_MATCH_PASSPORT_OPTIONS.filter((option) => {
      const label = option.label.toLowerCase();
      return label.includes(query) || option.value.toLowerCase().includes(query);
    });
  }, [passportQuery]);

  const selectedPassportLabel = purposeIntake.passport ? LIFE_MATCH_PASSPORT_OPTIONS.find((option) => option.value === purposeIntake.passport)?.label ?? "" : "";
  const selectedPassportOption = purposeIntake.passport ? LIFE_MATCH_PASSPORT_OPTIONS.find((option) => option.value === purposeIntake.passport) : null;

  const profilePreview = useMemo(() => computeRetirementDnaProfile(answers), [answers]);
  const currentQuestion = RETIREMENT_DNA_QUESTIONS[currentQuestionIndex];
  const currentSectionIndex = RETIREMENT_DNA_SECTIONS.findIndex((section) =>
    section.questions.some((questionItem) => questionItem.id === currentQuestion.id),
  );
  const currentSection = RETIREMENT_DNA_SECTIONS[currentSectionIndex];
  const selectedAnswer = answers[currentQuestion.id];
  const assessmentIsComplete = profilePreview.answeredCount === RETIREMENT_DNA_TOTAL_QUESTIONS;
  const isFinalQuestion = currentQuestionIndex === RETIREMENT_DNA_TOTAL_QUESTIONS - 1;
  const progressPercent = Math.round((profilePreview.answeredCount / RETIREMENT_DNA_TOTAL_QUESTIONS) * 100);
  const hasDraft = profilePreview.answeredCount > 0 || purposeIntake.purpose !== null || purposeIntake.duration !== null || purposeIntake.budget !== null;

  useEffect(() => {
    if (editedAnswers === null) return;
    if (typeof window === "undefined") return;

    if (Object.keys(answers).length === 0) {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(answers));
  }, [answers, editedAnswers]);

  useEffect(() => {
    if (editedPurposeIntake === null) return;
    if (typeof window === "undefined") return;

    if (
      purposeIntake.purpose === null &&
      purposeIntake.duration === null &&
      purposeIntake.passport === null &&
      purposeIntake.permitWillingness === null &&
      purposeIntake.budget === null
    ) {
      window.localStorage.removeItem(PURPOSE_INTAKE_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(
      PURPOSE_INTAKE_STORAGE_KEY,
      JSON.stringify({ ...purposeIntake, profileFields: derivedPurposeProfileFields }),
    );
  }, [purposeIntake, editedPurposeIntake, derivedPurposeProfileFields]);

  const focusQuestion = () => {
    window.requestAnimationFrame(() => {
      questionHeadingRef.current?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const moveToQuestion = (nextIndex: number) => {
    setCurrentQuestionIndex(Math.max(0, Math.min(RETIREMENT_DNA_TOTAL_QUESTIONS - 1, nextIndex)));
    focusQuestion();
  };

  const startAssessment = () => {
    const firstUnansweredIndex = RETIREMENT_DNA_QUESTIONS.findIndex((questionItem) => !answers[questionItem.id]);
    setCurrentQuestionIndex(firstUnansweredIndex >= 0 ? firstUnansweredIndex : 0);
    setHasStarted(true);
    focusQuestion();
  };

  const setAnswer = (questionId: string, value: number) => {
    setEditedAnswers((current) => ({ ...(current ?? answers), [questionId]: value }));
  };

  const setPurposeAnswer = (value: LifeMatchPurposeAnswer) => {
    setEditedPurposeIntake({
      purpose: value,
      duration: purposeIntake.duration,
      passport: purposeIntake.passport,
      permitWillingness: purposeIntake.permitWillingness,
      budget: purposeIntake.budget,
    });
  };

  const setDurationAnswer = (value: LifeMatchStayDurationAnswer) => {
    setEditedPurposeIntake({
      purpose: purposeIntake.purpose,
      duration: value,
      passport: purposeIntake.passport,
      permitWillingness: purposeIntake.permitWillingness,
      budget: purposeIntake.budget,
    });
  };

  const setPassportAnswer = (value: LifeMatchPassportAnswer) => {
    setEditedPurposeIntake((current) => ({
      purpose: purposeIntake.purpose ?? current?.purpose ?? null,
      duration: purposeIntake.duration ?? current?.duration ?? null,
      passport: value,
      permitWillingness: purposeIntake.permitWillingness ?? current?.permitWillingness ?? null,
      budget: purposeIntake.budget ?? current?.budget ?? null,
    }));
  };

  const setPermitWillingnessAnswer = (value: LifeMatchPermitWillingnessAnswer) => {
    setEditedPurposeIntake({
      purpose: purposeIntake.purpose,
      duration: purposeIntake.duration,
      passport: purposeIntake.passport,
      permitWillingness: value,
      budget: purposeIntake.budget,
    });
  };

  const setBudgetAnswer = (value: LifeMatchBudgetAnswer) => {
    setEditedPurposeIntake({
      purpose: purposeIntake.purpose,
      duration: purposeIntake.duration,
      passport: purposeIntake.passport,
      permitWillingness: purposeIntake.permitWillingness,
      budget: value,
    });
  };

  const goBackToPurposeStep = () => {
    setEditedPurposeIntake({ purpose: null, duration: purposeIntake.duration, passport: purposeIntake.passport, permitWillingness: purposeIntake.permitWillingness, budget: purposeIntake.budget });
  };

  const goBackToDurationStep = () => {
    setEditedPurposeIntake({ purpose: purposeIntake.purpose, duration: null, passport: purposeIntake.passport, permitWillingness: purposeIntake.permitWillingness, budget: purposeIntake.budget });
  };

  const goBackToPassportStep = () => {
    setEditedPurposeIntake({ purpose: purposeIntake.purpose, duration: purposeIntake.duration, passport: null, permitWillingness: purposeIntake.permitWillingness, budget: purposeIntake.budget });
  };

  const goBackToPermitStep = () => {
    setEditedPurposeIntake({ purpose: purposeIntake.purpose, duration: purposeIntake.duration, passport: purposeIntake.passport, permitWillingness: null, budget: purposeIntake.budget });
  };

  const resetAssessment = () => {
    setEditedAnswers({});
    setEditedPurposeIntake({ purpose: null, duration: null, passport: null, permitWillingness: null, budget: null });
    setCurrentQuestionIndex(0);
    setHasStarted(false);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      window.localStorage.removeItem(PURPOSE_INTAKE_STORAGE_KEY);
    }
  };

  const goToResults = () => {
    if (!assessmentIsComplete) return;
    if (typeof window !== "undefined") window.localStorage.removeItem(DRAFT_STORAGE_KEY);

    const params = new URLSearchParams({
      dna: serializeRetirementDnaAnswers(answers),
    });

    if (purposeIntake.purpose) params.set("purpose", purposeIntake.purpose);
    if (purposeIntake.duration) params.set("duration", purposeIntake.duration);
    if (purposeIntake.passport) params.set("passport", purposeIntake.passport);
    if (purposeIntake.permitWillingness) params.set("permitWillingness", purposeIntake.permitWillingness);
    if (purposeIntake.budget) params.set("budget", purposeIntake.budget);

    router.push(`/results?${params.toString()}`);
  };

  if (!hasStarted) {
    return (
      <section className="relative min-h-screen overflow-hidden bg-[#04162b] text-white">
        <Image
          src="/images/life-match-alpine-hero.jpg"
          alt="Mountain lake and alpine town at sunrise"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,18,37,0.96)_0%,rgba(3,18,37,0.9)_36%,rgba(3,18,37,0.52)_68%,rgba(3,18,37,0.7)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent,#04162b)]" />

        <div className="relative mx-auto grid min-h-screen max-w-[1440px] content-center gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,760px)_minmax(260px,320px)] lg:gap-10 lg:px-10">
          <div className="atlas-animate max-w-3xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#56c6c3]">DestinationFinderAI Life Match</p>
            <h1 className="mt-5 max-w-2xl text-5xl leading-[0.96] text-white sm:text-6xl lg:text-7xl">
              Find the places that fit your life.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#d5e0e9] sm:text-lg sm:leading-8">
              A thoughtful assessment of what matters most in your next chapter, translated into ranked destination matches with clear strengths and tradeoffs.
            </p>

            <div className="mt-8 grid max-w-2xl grid-cols-3 border-y border-white/15 py-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#f1c66d]">Personalized</p>
                <p className="mt-2 text-[10px] uppercase leading-4 tracking-[0.14em] text-[#dfeaf4]">Built around your priorities</p>
              </div>
              <div className="border-l border-white/15 pl-4 sm:pl-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#f1c66d]">Whole-life fit</p>
                <p className="mt-2 text-[10px] uppercase leading-4 tracking-[0.14em] text-[#dfeaf4]">Lifestyle, cost, climate &amp; what matters to you</p>
              </div>
              <div className="border-l border-white/15 pl-4 sm:pl-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#f1c66d]">UP TO 10 MATCHES</p>
                <p className="mt-2 text-[10px] uppercase leading-4 tracking-[0.14em] text-[#dfeaf4]">YOUR STRONGEST VERIFIED DESTINATIONS</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={startAssessment}
                className="inline-flex min-h-14 items-center justify-center bg-[#e7b857] px-7 text-sm font-bold text-[#06182d] shadow-[0_18px_38px_rgba(0,0,0,0.34)] transition hover:bg-[#f0c66e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#67d2cf] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04162b]"
              >
                {hasDraft ? "Continue your Life Match" : "Start your Life Match"}
                <span aria-hidden="true" className="ml-3 text-lg">&#8594;</span>
              </button>
              {hasDraft ? (
                <button type="button" onClick={resetAssessment} className="text-sm font-semibold text-[#c5d3df] underline decoration-white/25 underline-offset-4 hover:text-white">
                  Start over
                </button>
              ) : null}
            </div>

            <p className="mt-5 max-w-xl text-xs leading-5 text-[#9eb2c5]">
              Completing the assessment generates up to 10 ranked matches from thousands of destinations around the world.
            </p>
          </div>

          <div className="mt-8 max-w-[360px] self-end rounded-2xl border border-white/15 bg-[#061b2a]/72 p-5 shadow-[0_24px_55px_rgba(2,8,18,0.44)] backdrop-blur-[2px] lg:ml-auto lg:mt-0 lg:max-w-[300px] lg:rounded-[1.25rem] lg:border-white/10 lg:bg-[#071c30]/72 lg:p-6 lg:pl-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#61d5d1]">What you will receive</p>
            <div className="mt-5 space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#f0c66e]/30 bg-[#f0c66e]/12 text-[11px] font-bold text-[#f7d68a]">01</span>
                <p className="text-sm leading-6 text-[#edf3f8]">Your strongest destination matches, ranked.</p>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#f0c66e]/30 bg-[#f0c66e]/12 text-[11px] font-bold text-[#f7d68a]">02</span>
                <p className="text-sm leading-6 text-[#edf3f8]">The priorities that shaped your results.</p>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#f0c66e]/30 bg-[#f0c66e]/12 text-[11px] font-bold text-[#f7d68a]">03</span>
                <p className="text-sm leading-6 text-[#edf3f8]">Honest tradeoffs to consider before you choose.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!purposeIntake.purpose) {
    return (
      <section className="min-h-screen bg-[#04162b] px-5 py-16 text-white sm:px-8 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#56c6c3]">Step 1 of 4</p>
          <h1 className="mt-4 text-3xl leading-tight text-white sm:text-4xl">What best describes why you&rsquo;re exploring a destination?</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#bdcad5]">
            This routes your match to the right legal, work, and lifestyle pathway. Retirement-specific questions only appear if you select Retirement below.
          </p>

          <div role="radiogroup" aria-label="Purpose" className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {LIFE_MATCH_PURPOSE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={purposeIntake.purpose === option.value}
                onClick={() => setPurposeAnswer(option.value)}
                className="min-h-16 border border-white/15 bg-white/[0.045] px-5 py-4 text-left text-sm font-semibold text-white transition hover:border-[#58c7c4]/70 hover:bg-white/[0.075] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#58c7c4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04162b]"
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="mt-10 border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={() => setHasStarted(false)}
              className="min-h-12 border border-white/15 px-5 text-sm font-semibold text-[#c3d0da] transition hover:border-white/35 hover:text-white"
            >
              <span aria-hidden="true" className="mr-2">&#8592;</span> Back
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!purposeIntake.duration) {
    return (
      <section className="min-h-screen bg-[#04162b] px-5 py-16 text-white sm:px-8 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#56c6c3]">Step 2 of 4</p>
          <h1 className="mt-4 text-3xl leading-tight text-white sm:text-4xl">How long are you picturing this stay?</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#bdcad5]">
            An estimate is fine &mdash; this helps us check realistic entry, stay, and legal pathways for each destination.
          </p>

          <div role="radiogroup" aria-label="Intended stay duration" className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {LIFE_MATCH_STAY_DURATION_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={purposeIntake.duration === option.value}
                onClick={() => setDurationAnswer(option.value)}
                className="min-h-16 border border-white/15 bg-white/[0.045] px-5 py-4 text-left text-sm font-semibold text-white transition hover:border-[#58c7c4]/70 hover:bg-white/[0.075] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#58c7c4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04162b]"
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="mt-10 border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={goBackToPurposeStep}
              className="min-h-12 border border-white/15 px-5 text-sm font-semibold text-[#c3d0da] transition hover:border-white/35 hover:text-white"
            >
              <span aria-hidden="true" className="mr-2">&#8592;</span> Back
            </button>
          </div>
        </div>
      </section>
    );
  }

  const handlePassportKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsPassportOpen(true);
      setHighlightedPassportIndex((current) => Math.min(current + 1, Math.max(passportOptions.length - 1, 0)));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsPassportOpen(true);
      setHighlightedPassportIndex((current) => Math.max(current - 1, 0));
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const option = passportOptions[highlightedPassportIndex];
      if (!option) return;
      setPassportAnswer(option.value as LifeMatchPassportAnswer);
      setPassportQuery("");
      setIsPassportOpen(false);
      setHighlightedPassportIndex(0);
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setIsPassportOpen(false);
      setPassportQuery("");
      setHighlightedPassportIndex(0);
    }
  };

  if (!purposeIntake.passport) {
    return (
      <section className="min-h-screen bg-[#04162b] px-5 py-16 text-white sm:px-8 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#56c6c3]">Step 3 of 5</p>
          <h1 className="mt-4 text-3xl leading-tight text-white sm:text-4xl">Which passport would you use for this stay?</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#bdcad5]">Entry, stay, and work rules depend on the passport you use.</p>

          <div className="mt-9 max-w-xl">
            <label htmlFor="life-match-passport" className="block text-sm font-semibold text-[#dbe8f2]">Passport country</label>
            <div className="relative mt-3">
              <input
                id="life-match-passport"
                type="text"
                role="combobox"
                aria-expanded={isPassportOpen}
                aria-controls="life-match-passport-listbox"
                aria-autocomplete="list"
                placeholder="Search country"
                value={isPassportOpen ? passportQuery : selectedPassportLabel}
                onFocus={() => setIsPassportOpen(true)}
                onClick={() => setIsPassportOpen(true)}
                onChange={(event) => {
                  const nextQuery = event.target.value;
                  const normalizedQuery = nextQuery.trim();
                  const exactMatch = LIFE_MATCH_PASSPORT_OPTIONS.find(
                    (option) =>
                      option.value.toLowerCase() === normalizedQuery.toLowerCase() ||
                      option.label.toLowerCase() === normalizedQuery.toLowerCase(),
                  );

                  if (exactMatch) {
                    setPassportAnswer(exactMatch.value as LifeMatchPassportAnswer);
                    setPassportQuery("");
                    setIsPassportOpen(false);
                    setHighlightedPassportIndex(0);
                    return;
                  }

                  setPassportQuery(nextQuery);
                  setIsPassportOpen(true);
                  setHighlightedPassportIndex(0);
                }}
                onKeyDown={handlePassportKeyDown}
                className="min-h-12 w-full rounded-md border border-white/15 bg-[#061b34] px-4 py-3 text-base text-white shadow-none outline-none transition focus:border-[#58c7c4] focus:ring-2 focus:ring-[#58c7c4]/40"
              />
              {isPassportOpen ? (
                <ul id="life-match-passport-listbox" role="listbox" className="absolute z-10 mt-2 max-h-72 w-full overflow-auto rounded-md border border-white/10 bg-[#061b34] p-1 shadow-xl">
                  {passportOptions.map((option, index) => (
                    <li key={option.value}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={purposeIntake.passport === option.value}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          setPassportAnswer(option.value as LifeMatchPassportAnswer);
                          setPassportQuery("");
                          setIsPassportOpen(false);
                          setHighlightedPassportIndex(0);
                        }}
                        className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition ${highlightedPassportIndex === index ? "bg-white/10 text-white" : "text-[#dfeaf4] hover:bg-white/5"}`}
                      >
                        <span>{option.label}</span>
                        {purposeIntake.passport === option.value ? <span className="text-[10px] uppercase tracking-[0.15em] text-[#58c7c4]">Selected</span> : null}
                      </button>
                    </li>
                  ))}
                  {passportOptions.length === 0 ? (
                    <li className="px-3 py-2 text-sm text-[#91a6b8]">No matching countries</li>
                  ) : null}
                </ul>
              ) : null}
            </div>
          </div>

          <div className="mt-10 flex items-center justify-between gap-4 border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={goBackToDurationStep}
              className="min-h-12 border border-white/15 px-5 text-sm font-semibold text-[#c3d0da] transition hover:border-white/35 hover:text-white"
            >
              <span aria-hidden="true" className="mr-2">&#8592;</span> Back
            </button>
            <button
              type="button"
              onClick={() => setPassportAnswer("NOT_SURE")}
              className="min-h-12 border border-white/15 px-5 text-sm font-semibold text-[#dbe8f2] transition hover:border-white/35 hover:text-white"
            >
              Not sure yet
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (purposeIntake.permitWillingness === null) {
    return (
      <section className="min-h-screen bg-[#04162b] px-5 py-16 text-white sm:px-8 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#56c6c3]">Step 4 of 5</p>
          <h1 className="mt-4 text-3xl leading-tight text-white sm:text-4xl">If a longer stay requires a visa or residence permit, would you consider applying?</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#bdcad5]">This helps distinguish an ordinary visitor stay from destinations that may require a longer-stay pathway.</p>

          <div role="radiogroup" aria-label="Permit willingness" className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {LIFE_MATCH_PERMIT_WILLINGNESS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={purposeIntake.permitWillingness === option.value}
                onClick={() => setPermitWillingnessAnswer(option.value)}
                className="min-h-16 border border-white/15 bg-white/[0.045] px-5 py-4 text-left text-sm font-semibold text-white transition hover:border-[#58c7c4]/70 hover:bg-white/[0.075] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#58c7c4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04162b]"
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="mt-10 border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={goBackToPassportStep}
              className="min-h-12 border border-white/15 px-5 text-sm font-semibold text-[#c3d0da] transition hover:border-white/35 hover:text-white"
            >
              <span aria-hidden="true" className="mr-2">&#8592;</span> Back
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (purposeIntake.budget === null) {
    return (
      <section className="min-h-screen bg-[#04162b] px-5 py-16 text-white sm:px-8 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#56c6c3]">Step 5 of 5</p>
          <h1 className="mt-4 text-3xl leading-tight text-white sm:text-4xl">What is your estimated total monthly household budget while living in the destination?</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#bdcad5]">Include housing, utilities, food, local transportation, routine healthcare, and everyday spending. Use your total household budget, not a per-person amount.</p>

          <div role="radiogroup" aria-label="Household budget" className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {LIFE_MATCH_BUDGET_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={purposeIntake.budget === option.value}
                onClick={() => setBudgetAnswer(option.value)}
                className="min-h-16 border border-white/15 bg-white/[0.045] px-5 py-4 text-left text-sm font-semibold text-white transition hover:border-[#58c7c4]/70 hover:bg-white/[0.075] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#58c7c4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04162b]"
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="mt-10 border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={goBackToPermitStep}
              className="min-h-12 border border-white/15 px-5 text-sm font-semibold text-[#c3d0da] transition hover:border-white/35 hover:text-white"
            >
              <span aria-hidden="true" className="mr-2">&#8592;</span> Back
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#04162b] text-white">
      <div className="border-b border-white/10 bg-[#061b34]">
        <div className="mx-auto max-w-[1440px] px-5 py-4 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between gap-5">
            <button type="button" onClick={() => setHasStarted(false)} className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#58c7c4]">
              <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#58c7c4]">Life Match</span>
              <span className="mt-1 hidden text-sm text-[#c7d4df] sm:block">Discover where you belong</span>
            </button>
            <div className="text-right" aria-live="polite">
              <p className="text-sm font-semibold text-white">{progressPercent}% complete</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-[#8fa5b8]">{profilePreview.answeredCount} of {RETIREMENT_DNA_TOTAL_QUESTIONS} answered</p>
            </div>
          </div>
          <div className="mt-4 h-1 bg-white/10">
            <div className="h-full bg-[linear-gradient(90deg,#49bbb8,#e4b450)] transition-[width] duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1440px] gap-0 lg:grid-cols-[270px_minmax(0,1fr)_300px]">
        <nav aria-label="Life Match sections" className="hidden border-r border-white/10 px-6 py-10 lg:block">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7f96aa]">Your journey</p>
          <ol className="mt-6 space-y-1">
            {RETIREMENT_DNA_SECTIONS.map((section, sectionIndex) => {
              const sectionAnswered = section.questions.filter((questionItem) => answers[questionItem.id]).length;
              const isActive = sectionIndex === currentSectionIndex;
              const sectionStartIndex = RETIREMENT_DNA_QUESTIONS.findIndex((questionItem) => questionItem.id === section.questions[0].id);
              return (
                <li key={section.id}>
                  <button
                    type="button"
                    onClick={() => moveToQuestion(sectionStartIndex)}
                    aria-current={isActive ? "step" : undefined}
                    className={`grid w-full grid-cols-[24px_1fr_auto] items-center gap-3 border-l-2 px-3 py-3 text-left transition ${isActive ? "border-[#e5b654] bg-white/[0.06] text-white" : "border-transparent text-[#91a6b8] hover:bg-white/[0.04] hover:text-white"}`}
                  >
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${sectionAnswered === section.questions.length ? "bg-[#268b85] text-white" : "border border-white/15"}`}>
                      {sectionAnswered === section.questions.length ? "OK" : sectionIndex + 1}
                    </span>
                    <span className="text-xs font-semibold">{section.title}</span>
                    <span className="text-[10px] text-[#6f879b]">{sectionAnswered}/{section.questions.length}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <main className="min-w-0 px-5 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-14 xl:px-16">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#58c7c4]">{currentSection.title}</p>
              <p className="text-xs text-[#91a6b8]">Question {currentQuestionIndex + 1} of {RETIREMENT_DNA_TOTAL_QUESTIONS}</p>
            </div>

            <div className="mt-5 border-t border-[#e5b654]/35 pt-8 sm:pt-10">
              <p className="text-sm leading-6 text-[#9fb2c3]">{currentSection.description}</p>
              <h1 ref={questionHeadingRef} tabIndex={-1} className="mt-5 text-3xl leading-tight text-white outline-none sm:text-4xl lg:text-[2.8rem]">
                {currentQuestion.prompt}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[#bdcad5]">{currentQuestion.helper}</p>
              <p className="mt-3 text-xs text-[#6fcac7]">{getDimensionDescription(currentQuestion.dimension)}</p>
            </div>

            <div role="radiogroup" aria-label={currentQuestion.prompt} className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {RETIREMENT_DNA_SCALE.map((option) => {
                const isActive = selectedAnswer === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => setAnswer(currentQuestion.id, option.value)}
                    className={`group min-h-24 border p-4 text-left transition last:col-span-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#58c7c4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04162b] sm:min-h-32 sm:last:col-span-1 ${isActive ? "border-[#e5b654] bg-[#e5b654] text-[#06172c] shadow-[0_16px_32px_rgba(0,0,0,0.28)]" : "border-white/15 bg-white/[0.045] text-white hover:border-[#58c7c4]/70 hover:bg-white/[0.075]"}`}
                  >
                    <span className={`block text-2xl font-semibold ${isActive ? "text-[#06172c]" : "text-[#e5b654]"}`}>{option.shortLabel}</span>
                    <span className={`mt-4 block text-xs font-semibold leading-5 ${isActive ? "text-[#173149]" : "text-[#c3d0da]"}`}>{option.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-10 flex items-center justify-between gap-4 border-t border-white/10 pt-6">
              <button
                type="button"
                onClick={() => moveToQuestion(currentQuestionIndex - 1)}
                disabled={currentQuestionIndex === 0}
                className="min-h-12 border border-white/15 px-5 text-sm font-semibold text-[#c3d0da] transition hover:border-white/35 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
              >
                <span aria-hidden="true" className="mr-2">&#8592;</span> Back
              </button>

              {isFinalQuestion ? (
                <button
                  type="button"
                  onClick={goToResults}
                  disabled={!assessmentIsComplete}
                  className="min-h-12 bg-[#e5b654] px-6 text-sm font-bold text-[#06172c] transition hover:bg-[#f0c66e] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-[#71879a]"
                >
                  See my Life Match
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => moveToQuestion(currentQuestionIndex + 1)}
                  disabled={!selectedAnswer}
                  className="min-h-12 bg-[#43b4b0] px-6 text-sm font-bold text-[#04162b] transition hover:bg-[#61cbc7] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-[#71879a]"
                >
                  Continue <span aria-hidden="true" className="ml-2">&#8594;</span>
                </button>
              )}
            </div>
          </div>
        </main>

        <aside className="border-t border-white/10 bg-[#061b34] px-5 py-7 sm:px-8 lg:border-l lg:border-t-0 lg:px-6 lg:py-10">
          <div className="lg:sticky lg:top-24">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#58c7c4]">Your profile, taking shape</p>
            {profilePreview.topPriorities.length ? (
              <div className="mt-6 space-y-5">
                {profilePreview.topPriorities.map((priority) => (
                  <div key={priority.id}>
                    <div className="flex items-center justify-between gap-4 text-xs">
                      <span className="text-[#d6e0e8]">{priority.label}</span>
                      <span className="font-semibold text-[#e5b654]">{priority.score}</span>
                    </div>
                    <div className="mt-2 h-1 bg-white/10">
                      <div className="h-full bg-[#58c7c4]" style={{ width: `${priority.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm leading-6 text-[#91a6b8]">Your strongest lifestyle priorities will appear here as you answer.</p>
            )}

            {profilePreview.derivedTags.length ? (
              <div className="mt-8 border-t border-white/10 pt-6">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#7f96aa]">Emerging signals</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {profilePreview.derivedTags.map((tag) => (
                    <span key={tag} className="border border-[#58c7c4]/25 bg-[#58c7c4]/10 px-2.5 py-1.5 text-[10px] uppercase tracking-[0.12em] text-[#8bd8d5]">{tag}</span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="text-xs leading-6 text-[#8198ab]">Your draft is saved in this browser after every answer.</p>
              <button type="button" onClick={resetAssessment} className="mt-4 text-xs font-semibold text-[#aebdca] underline decoration-white/20 underline-offset-4 hover:text-white">
                Reset assessment
              </button>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}