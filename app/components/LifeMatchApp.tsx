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

const DRAFT_STORAGE_KEY = "destinationfinderai:retirement-dna-draft";

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

export default function LifeMatchApp() {
  const draftSnapshot = useSyncExternalStore(subscribeToDraft, readDraftSnapshot, readServerDraftSnapshot);
  const [editedAnswers, setEditedAnswers] = useState<RetirementDnaAnswers | null>(null);
  const answers = editedAnswers ?? parseDraftAnswers(draftSnapshot);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const questionHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const router = useRouter();
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
  const hasDraft = profilePreview.answeredCount > 0;

  useEffect(() => {
    if (editedAnswers === null) return;
    if (typeof window === "undefined") return;

    if (Object.keys(answers).length === 0) {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(answers));
  }, [answers, editedAnswers]);

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

  const resetAssessment = () => {
    setEditedAnswers({});
    setCurrentQuestionIndex(0);
    setHasStarted(false);
    if (typeof window !== "undefined") window.localStorage.removeItem(DRAFT_STORAGE_KEY);
  };

  const goToResults = () => {
    if (!assessmentIsComplete) return;
    if (typeof window !== "undefined") window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    router.push(`/results?dna=${encodeURIComponent(serializeRetirementDnaAnswers(answers))}`);
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
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#f1c66d]">10 matches</p>
                <p className="mt-2 text-[10px] uppercase leading-4 tracking-[0.14em] text-[#dfeaf4]">Your strongest destinations</p>
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
              Completing the assessment generates 10 ranked matches from thousands of destinations around the world.
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
                <p className="text-sm leading-6 text-[#edf3f8]">Honest tradeoffs to investigate before moving.</p>
              </div>
            </div>
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