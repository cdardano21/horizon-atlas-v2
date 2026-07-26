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
      <div className="mb-12 rounded-[2rem] border border-[var(--atlas-border)] bg-[linear-gradient(145deg,rgba(255,252,246,0.97),rgba(247,238,222,0.9))] p-10 shadow-[var(--atlas-shadow)] backdrop-blur-xl">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="atlas-kicker">Retirement DNA</p>
            <h1 className="mt-4 text-4xl text-[var(--atlas-ink)] sm:text-5xl">
              A {RETIREMENT_DNA_TOTAL_QUESTIONS}-question relocation assessment across {LAUNCH_CATALOG_SIZE} destinations.
            </h1>
            <p className="mt-5 text-lg leading-8 text-[var(--atlas-muted)]">
              Build a full retirement profile across budget, healthcare, safety, climate, social fit, and long-term stability. Horizon Atlas then ranks the best destinations for your exact pattern of priorities.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-[rgba(31,95,99,0.12)] px-4 py-2 text-[var(--atlas-accent)]">{RETIREMENT_DNA_TOTAL_QUESTIONS} scored questions</span>
              <span className="rounded-full bg-[rgba(255,255,255,0.75)] px-4 py-2 text-[var(--atlas-muted)]">{LAUNCH_CATALOG_SIZE} destinations</span>
              <span className="rounded-full bg-[rgba(255,255,255,0.75)] px-4 py-2 text-[var(--atlas-muted)]">10 ranked recommendations</span>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.72)] px-5 py-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--atlas-accent)]">Decision quality</p>
              <p className="mt-2 text-sm leading-7 text-[var(--atlas-muted)]">
                Treat each answer as a signal about how you want to live week after week, not as a test you need to get right.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,253,248,0.88)] p-8 text-[var(--atlas-muted)] shadow-[0_24px_48px_-34px_rgba(43,35,23,0.6)]">
            <p className="text-sm uppercase tracking-[0.35em] text-[var(--atlas-accent)]">Assessment flow</p>
            <div className="mt-6 space-y-4 text-sm leading-7">
              <div className="rounded-3xl bg-[rgba(246,238,225,0.86)] p-4">
                <p className="font-semibold text-[var(--atlas-ink)]">1. Complete {totalSections} premium sections</p>
                <p className="mt-2 text-[var(--atlas-muted)]">Financial fit, healthcare, safety, mobility, climate, community, and long-horizon readiness are all captured.</p>
              </div>
              <div className="rounded-3xl bg-[rgba(246,238,225,0.86)] p-4">
                <p className="font-semibold text-[var(--atlas-ink)]">2. Score the full catalog</p>
                <p className="mt-2 text-[var(--atlas-muted)]">The Retirement DNA engine weighs each dimension against every destination in the launch catalog.</p>
              </div>
              <div className="rounded-3xl bg-[rgba(246,238,225,0.86)] p-4">
                <p className="font-semibold text-[var(--atlas-ink)]">3. Review strengths and tradeoffs</p>
                <p className="mt-2 text-[var(--atlas-muted)]">Your results show where each city aligns with your priorities and where you may want to investigate further.</p>
              </div>
            </div>
            <div className="mt-8 rounded-3xl bg-[rgba(255,255,255,0.7)] p-5 text-sm text-[var(--atlas-muted)]">
              <p className="font-semibold text-[var(--atlas-ink)]">Drafts save locally while you work</p>
              <p className="mt-3">You can move through the assessment in sections and come back without losing progress on this device.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.86)] p-8 shadow-[0_24px_44px_-34px_rgba(39,31,20,0.55)]">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-[var(--atlas-accent)]">Assessment sections</p>
            <h2 className="mt-4 text-4xl font-semibold text-[var(--atlas-ink)]">Build a complete retirement decision profile.</h2>
            <p className="mt-3 text-[var(--atlas-muted)]">Rate how important each statement is to your move. The engine uses those weights to rank destinations and explain the tradeoffs.</p>

            <div className="mt-5 rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.72)] px-5 py-4">
              <p className="text-sm text-[var(--atlas-muted)]">
                Progress: <span className="font-semibold text-[var(--atlas-ink)]">{profilePreview.answeredCount}</span> of {RETIREMENT_DNA_TOTAL_QUESTIONS} answered.
              </p>
            </div>

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
                    className={`rounded-3xl border px-5 py-4 text-left transition ${isActive ? "border-[rgba(31,95,99,0.45)] bg-[rgba(31,95,99,0.1)]" : "border-[var(--atlas-border)] bg-[rgba(255,255,255,0.65)] hover:border-[rgba(31,95,99,0.45)]"}`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-semibold text-[var(--atlas-ink)]">{section.title}</p>
                      <span className={`rounded-full px-3 py-1 text-xs ${isComplete ? "bg-emerald-500/15 text-emerald-700" : "bg-[rgba(255,255,255,0.7)] text-[var(--atlas-muted)]"}`}>
                        {sectionAnsweredCount}/{section.questions.length}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[var(--atlas-muted)]">{section.description}</p>
                  </button>
                );
              })}
            </div>

            <div ref={sectionHeaderRef} className="mt-10 rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.76)] p-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-[var(--atlas-accent)]">Section {currentSectionIndex + 1} of {totalSections}</p>
                  <h3 className="mt-3 text-3xl font-semibold text-[var(--atlas-ink)]">{currentSection.title}</h3>
                  <p className="mt-3 max-w-3xl text-[var(--atlas-muted)]">{currentSection.description}</p>
                </div>
                <div className="rounded-full bg-[rgba(246,238,225,0.9)] px-4 py-2 text-sm text-[var(--atlas-muted)]">
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
                    className="rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,253,248,0.82)] p-5"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="max-w-3xl">
                        <p className="text-xs uppercase tracking-[0.25em] text-[var(--atlas-accent)]">Question {currentQuestionOffset + questionIndex + 1}</p>
                        <h4 className="mt-2 text-xl font-semibold text-[var(--atlas-ink)]">{questionItem.prompt}</h4>
                        <p className="mt-2 text-sm leading-6 text-[var(--atlas-muted)]">{questionItem.helper}</p>
                      </div>
                      <div className="rounded-2xl bg-[rgba(246,238,225,0.9)] px-4 py-3 text-xs text-[var(--atlas-muted)]">
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
                            className={`rounded-2xl border px-4 py-4 text-left transition ${isActive ? "border-[rgba(31,95,99,0.5)] bg-[linear-gradient(145deg,rgba(31,95,99,0.14),rgba(31,95,99,0.08))] text-[var(--atlas-accent)]" : "border-[var(--atlas-border)] bg-[rgba(255,255,255,0.8)] text-[var(--atlas-ink)] hover:border-[rgba(31,95,99,0.45)]"}`}
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
                <p className="text-sm text-[var(--atlas-muted)]">
                  {sectionIsComplete ? "Section complete. Move forward or review earlier answers." : "Answer every question in this section to keep the assessment balanced."}
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => moveToSection(currentSectionIndex - 1, true)}
                    disabled={currentSectionIndex === 0}
                    className="rounded-full border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.75)] px-5 py-3 text-sm font-semibold text-[var(--atlas-muted)] transition hover:border-[rgba(31,95,99,0.45)] hover:text-[var(--atlas-accent)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Previous section
                  </button>
                  <button
                    type="button"
                    onClick={() => moveToSection(currentSectionIndex + 1, true)}
                    disabled={currentSectionIndex === totalSections - 1 || !sectionIsComplete}
                    className="rounded-full border border-[rgba(31,95,99,0.45)] px-5 py-3 text-sm font-semibold text-[var(--atlas-accent)] transition hover:bg-[rgba(31,95,99,0.08)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Next section
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="rounded-[2rem] border border-[var(--atlas-border)] bg-[linear-gradient(145deg,rgba(255,252,246,0.95),rgba(247,238,222,0.88))] p-8 text-[var(--atlas-muted)] shadow-[0_24px_46px_-34px_rgba(42,34,23,0.6)] lg:sticky lg:top-24 lg:self-start">
          <p className="uppercase tracking-[0.35em] text-[var(--atlas-accent)]">Retirement DNA profile</p>
          <div className="mt-6 space-y-4">
            <div className="rounded-3xl bg-[rgba(255,255,255,0.75)] p-5">
              <p className="text-sm text-[var(--atlas-muted)]">Completion</p>
              <p className="mt-2 text-4xl font-black text-[var(--atlas-accent)]">{profilePreview.completionPercent}%</p>
              <p className="mt-2 text-sm text-[var(--atlas-muted)]">{profilePreview.answeredCount} of {RETIREMENT_DNA_TOTAL_QUESTIONS} questions answered</p>
            </div>

            <div className="rounded-3xl bg-[rgba(255,255,255,0.75)] p-5">
              <p className="text-sm uppercase tracking-[0.25em] text-[var(--atlas-accent)]">Top priorities so far</p>
              <div className="mt-4 space-y-3">
                {profilePreview.topPriorities.length === 0 ? (
                  <p className="text-sm text-[var(--atlas-muted)]">Start answering to reveal your strongest decision drivers.</p>
                ) : profilePreview.topPriorities.map((priority) => (
                  <div key={priority.id}>
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-[var(--atlas-ink)]">{priority.label}</span>
                      <span className="text-[var(--atlas-accent)]">{priority.score}</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-[rgba(31,95,99,0.12)]">
                      <div className="h-2 rounded-full bg-[linear-gradient(90deg,#235f63,#3f8a86)]" style={{ width: `${priority.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-[rgba(255,255,255,0.75)] p-5">
              <p className="text-sm uppercase tracking-[0.25em] text-[var(--atlas-accent)]">Derived match signals</p>
              {profilePreview.derivedTags.length === 0 ? (
                <p className="mt-4 text-sm text-[var(--atlas-muted)]">No strong destination signals yet. They will appear as your priorities become clearer.</p>
              ) : (
                <div className="mt-4 flex flex-wrap gap-2">
                  {profilePreview.derivedTags.map((tag) => (
                    <span key={tag} className="rounded-full bg-[rgba(31,95,99,0.1)] px-3 py-2 text-xs uppercase tracking-[0.2em] text-[var(--atlas-accent)]">
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
              <p className="text-sm text-[var(--atlas-muted)]">Complete every section for the full recommendation engine and explanation layer.</p>
            )}
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={goToResults}
              disabled={!assessmentIsComplete}
              className={`rounded-full px-6 py-4 text-sm font-semibold transition ${assessmentIsComplete ? "bg-[linear-gradient(145deg,#235f63,#3f8a86)] text-[#f8f4ec] hover:brightness-105" : "cursor-not-allowed bg-[rgba(255,255,255,0.7)] text-[var(--atlas-muted)]"}`}
            >
              Generate my recommendations
            </button>
            <button
              type="button"
              onClick={resetAssessment}
              className="rounded-full border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.75)] px-6 py-4 text-sm font-semibold text-[var(--atlas-muted)] transition hover:border-[rgba(31,95,99,0.45)] hover:text-[var(--atlas-accent)]"
            >
              Reset assessment
            </button>
          </div>

          <div className="mt-10 rounded-3xl bg-[rgba(255,255,255,0.75)] p-5 text-sm text-[var(--atlas-muted)]">
            <p className="font-semibold text-[var(--atlas-ink)]">Why this module is deeper</p>
            <p className="mt-3">
              Instead of matching on a few tags, Horizon Atlas now builds a weighted retirement profile across 12 dimensions, then scores the destination catalog against that full profile.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
