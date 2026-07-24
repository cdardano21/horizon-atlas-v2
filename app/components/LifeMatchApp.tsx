"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LAUNCH_CATALOG_SIZE } from "../lib/destinations";
import {
  computeRetirementDnaProfile,
  getDimensionDescription,
  RETIREMENT_DNA_SCALE,
  RETIREMENT_DNA_SECTIONS,
  RETIREMENT_DNA_TOTAL_QUESTIONS,
  serializeRetirementDnaAnswers,
  type RetirementDnaAnswers,
} from "../lib/retirement-dna";

const DRAFT_STORAGE_KEY = "horizon-atlas:retirement-dna-draft";

const loadDraftAnswers = (): RetirementDnaAnswers => {
  if (typeof window === "undefined") return {};

  try {
    const rawDraft = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    return rawDraft ? (JSON.parse(rawDraft) as RetirementDnaAnswers) : {};
  } catch {
    return {};
  }
};

export default function LifeMatchApp() {
  const [answers, setAnswers] = useState<RetirementDnaAnswers>(() => loadDraftAnswers());
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const sectionHeaderRef = useRef<HTMLDivElement | null>(null);
  const questionCardRefs = useRef<Record<string, HTMLElement | null>>({});
  const router = useRouter();
  const currentSection = RETIREMENT_DNA_SECTIONS[currentSectionIndex];

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (Object.keys(answers).length === 0) {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(answers));
  }, [answers]);

  const profilePreview = useMemo(() => computeRetirementDnaProfile(answers), [answers]);

  const currentSectionAnsweredCount = currentSection.questions.filter((questionItem) => answers[questionItem.id]).length;
  const sectionIsComplete = currentSectionAnsweredCount === currentSection.questions.length;
  const assessmentIsComplete = profilePreview.answeredCount === RETIREMENT_DNA_TOTAL_QUESTIONS;
  const currentQuestionOffset = RETIREMENT_DNA_SECTIONS.slice(0, currentSectionIndex).reduce(
    (total, section) => total + section.questions.length,
    0,
  );

  const totalSections = RETIREMENT_DNA_SECTIONS.length;

  const moveToSection = (nextIndex: number, shouldScroll = false) => {
    const boundedIndex = Math.max(0, Math.min(totalSections - 1, nextIndex));
    setCurrentSectionIndex(boundedIndex);

    if (shouldScroll && typeof window !== "undefined") {
      window.requestAnimationFrame(() => {
        sectionHeaderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  const setAnswer = (questionId: string, value: number) => {
    setAnswers((current) => ({ ...current, [questionId]: value }));

    if (typeof window === "undefined") return;

    const currentQuestionIndex = currentSection.questions.findIndex((questionItem) => questionItem.id === questionId);
    const nextQuestion = currentSection.questions[currentQuestionIndex + 1];

    if (!nextQuestion) {
      if (currentSectionIndex < totalSections - 1) {
        moveToSection(currentSectionIndex + 1, true);
      }
      return;
    }

    window.requestAnimationFrame(() => {
      questionCardRefs.current[nextQuestion.id]?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const resetAssessment = () => {
    setAnswers({});
    setCurrentSectionIndex(0);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  };

  const goToResults = () => {
    if (!assessmentIsComplete) return;

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    }

    router.push(`/results?dna=${encodeURIComponent(serializeRetirementDnaAnswers(answers))}`);
  };

  return (
    <section id="life-match" className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:py-24">
      <div className="mb-12 rounded-[2rem] border border-white/10 bg-slate-950/80 p-10 shadow-xl shadow-cyan-500/10 backdrop-blur-xl">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="uppercase tracking-[0.35em] text-cyan-400">Retirement DNA</p>
            <h1 className="mt-4 text-4xl font-black text-white sm:text-5xl">
              A {RETIREMENT_DNA_TOTAL_QUESTIONS}-question relocation assessment across {LAUNCH_CATALOG_SIZE} destinations.
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-400">
              Build a full retirement profile across budget, healthcare, safety, climate, social fit, and long-term stability. Horizon Atlas then ranks the best destinations for your exact pattern of priorities.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-cyan-500/10 px-4 py-2 text-cyan-200">{RETIREMENT_DNA_TOTAL_QUESTIONS} scored questions</span>
              <span className="rounded-full bg-white/5 px-4 py-2 text-slate-300">{LAUNCH_CATALOG_SIZE} destinations</span>
              <span className="rounded-full bg-white/5 px-4 py-2 text-slate-300">10 ranked recommendations</span>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 text-slate-300">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Assessment flow</p>
            <div className="mt-6 space-y-4 text-sm leading-7">
              <div className="rounded-3xl bg-slate-950/80 p-4">
                <p className="font-semibold text-white">1. Complete {totalSections} premium sections</p>
                <p className="mt-2 text-slate-400">Financial fit, healthcare, safety, mobility, climate, community, and long-horizon readiness are all captured.</p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-4">
                <p className="font-semibold text-white">2. Score the full catalog</p>
                <p className="mt-2 text-slate-400">The Retirement DNA engine weighs each dimension against every destination in the launch catalog.</p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-4">
                <p className="font-semibold text-white">3. Review strengths and tradeoffs</p>
                <p className="mt-2 text-slate-400">Your results show where each city aligns with your priorities and where you may want to investigate further.</p>
              </div>
            </div>
            <div className="mt-8 rounded-3xl bg-white/5 p-5 text-sm text-slate-300">
              <p className="font-semibold text-white">Drafts save locally while you work</p>
              <p className="mt-3">You can move through the assessment in sections and come back without losing progress on this device.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Assessment sections</p>
            <h2 className="mt-4 text-3xl font-bold text-white">Build a complete retirement decision profile.</h2>
            <p className="mt-3 text-slate-400">Rate how important each statement is to your move. The engine uses those weights to rank destinations and explain the tradeoffs.</p>

            <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {RETIREMENT_DNA_SECTIONS.map((section, index) => {
                const sectionAnsweredCount = section.questions.filter((questionItem) => answers[questionItem.id]).length;
                const isActive = index === currentSectionIndex;
                const isComplete = sectionAnsweredCount === section.questions.length;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => moveToSection(index, true)}
                    className={`rounded-3xl border px-5 py-4 text-left transition ${isActive ? "border-cyan-400 bg-cyan-500/10" : "border-white/10 bg-slate-950/80 hover:border-cyan-400/50"}`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-semibold text-white">{section.title}</p>
                      <span className={`rounded-full px-3 py-1 text-xs ${isComplete ? "bg-emerald-500/15 text-emerald-300" : "bg-white/5 text-slate-400"}`}>
                        {sectionAnsweredCount}/{section.questions.length}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{section.description}</p>
                  </button>
                );
              })}
            </div>

            <div ref={sectionHeaderRef} className="mt-10 rounded-[2rem] border border-white/10 bg-slate-950/80 p-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Section {currentSectionIndex + 1} of {totalSections}</p>
                  <h3 className="mt-3 text-2xl font-bold text-white">{currentSection.title}</h3>
                  <p className="mt-3 max-w-3xl text-slate-400">{currentSection.description}</p>
                </div>
                <div className="rounded-full bg-white/5 px-4 py-2 text-sm text-slate-300">
                  {currentSectionAnsweredCount} of {currentSection.questions.length} answered
                </div>
              </div>

              <div className="mt-8 space-y-5">
                {currentSection.questions.map((questionItem, questionIndex) => (
                  <article
                    key={questionItem.id}
                    ref={(node) => {
                      questionCardRefs.current[questionItem.id] = node;
                    }}
                    className="rounded-3xl border border-white/10 bg-white/5 p-5"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="max-w-3xl">
                        <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">Question {currentQuestionOffset + questionIndex + 1}</p>
                        <h4 className="mt-2 text-lg font-semibold text-white">{questionItem.prompt}</h4>
                        <p className="mt-2 text-sm leading-6 text-slate-400">{questionItem.helper}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-950/80 px-4 py-3 text-xs text-slate-300">
                        {getDimensionDescription(questionItem.dimension)}
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-5">
                      {RETIREMENT_DNA_SCALE.map((option) => {
                        const isActive = answers[questionItem.id] === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setAnswer(questionItem.id, option.value)}
                            className={`rounded-2xl border px-4 py-4 text-left transition ${isActive ? "border-cyan-400 bg-cyan-500/15 text-cyan-100" : "border-white/10 bg-slate-950/80 text-slate-200 hover:border-cyan-400/50"}`}
                          >
                            <div className="text-xl font-bold">{option.shortLabel}</div>
                            <div className="mt-2 text-sm">{option.label}</div>
                          </button>
                        );
                      })}
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-400">
                  {sectionIsComplete ? "Section complete. Move forward or review earlier answers." : "Answer every question in this section to keep the assessment balanced."}
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => moveToSection(currentSectionIndex - 1, true)}
                    disabled={currentSectionIndex === 0}
                    className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Previous section
                  </button>
                  <button
                    type="button"
                    onClick={() => moveToSection(currentSectionIndex + 1, true)}
                    disabled={currentSectionIndex === totalSections - 1 || !sectionIsComplete}
                    className="rounded-full border border-cyan-400 px-5 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Next section
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 text-slate-300">
          <p className="uppercase tracking-[0.35em] text-cyan-400">Retirement DNA profile</p>
          <div className="mt-6 space-y-4">
            <div className="rounded-3xl bg-slate-900/80 p-5">
              <p className="text-sm text-slate-400">Completion</p>
              <p className="mt-2 text-4xl font-black text-white">{profilePreview.completionPercent}%</p>
              <p className="mt-2 text-sm text-slate-400">{profilePreview.answeredCount} of {RETIREMENT_DNA_TOTAL_QUESTIONS} questions answered</p>
            </div>

            <div className="rounded-3xl bg-slate-900/80 p-5">
              <p className="text-sm uppercase tracking-[0.25em] text-cyan-400">Top priorities so far</p>
              <div className="mt-4 space-y-3">
                {profilePreview.topPriorities.length === 0 ? (
                  <p className="text-sm text-slate-400">Start answering to reveal your strongest decision drivers.</p>
                ) : profilePreview.topPriorities.map((priority) => (
                  <div key={priority.id}>
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-white">{priority.label}</span>
                      <span className="text-cyan-300">{priority.score}</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-white/5">
                      <div className="h-2 rounded-full bg-cyan-400" style={{ width: `${priority.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-slate-900/80 p-5">
              <p className="text-sm uppercase tracking-[0.25em] text-cyan-400">Derived match signals</p>
              {profilePreview.derivedTags.length === 0 ? (
                <p className="mt-4 text-sm text-slate-400">No strong destination signals yet. They will appear as your priorities become clearer.</p>
              ) : (
                <div className="mt-4 flex flex-wrap gap-2">
                  {profilePreview.derivedTags.map((tag) => (
                    <span key={tag} className="rounded-full bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-200">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {assessmentIsComplete ? (
              <div className="rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-5 text-sm text-emerald-100">
                Assessment complete. Your full recommendation engine output is ready.
              </div>
            ) : (
              <p className="text-sm text-slate-400">Complete every section for the full recommendation engine and explanation layer.</p>
            )}
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={goToResults}
              disabled={!assessmentIsComplete}
              className={`rounded-full px-6 py-4 text-sm font-semibold transition ${assessmentIsComplete ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400" : "cursor-not-allowed bg-white/5 text-slate-500"}`}
            >
              Generate my recommendations
            </button>
            <button
              type="button"
              onClick={resetAssessment}
              className="rounded-full border border-white/10 bg-slate-900/80 px-6 py-4 text-sm font-semibold text-slate-100 transition hover:border-cyan-400"
            >
              Reset assessment
            </button>
          </div>

          <div className="mt-10 rounded-3xl bg-slate-900/80 p-5 text-sm text-slate-400">
            <p className="font-semibold text-white">Why this module is deeper</p>
            <p className="mt-3">
              Instead of matching on a few tags, Horizon Atlas now builds a weighted retirement profile across 12 dimensions, then scores the destination catalog against that full profile.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
