import type { Destination } from "../lib/destinations";
import { generatedDestinationCardFacts } from "../lib/generated-destination-card-facts";

export type DestinationCardFact = {
  label: string;
  value: string;
  sourceUrl?: string;
};

export function getFactSourceDomain(sourceUrl: string): string {
  try {
    const hostname = new URL(sourceUrl).hostname.toLowerCase();
    return hostname.replace(/^www\./, "");
  } catch {
    return "source";
  }
}

export function getFactSourcePublisherUrl(sourceUrl: string): string | null {
  try {
    const parsed = new URL(sourceUrl);
    return parsed.origin;
  } catch {
    return null;
  }
}

export type DestinationCardFactsResult = {
  summary: string;
  overallScore: number;
  scoreSignals: Array<{ category: string; score: number }>;
  facts: DestinationCardFact[];
  lowCoverage: boolean;
};

function truncate(value: string, maxLength = 160): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trimEnd()}...`;
}

function buildFallbackFacts(destination: Destination): DestinationCardFact[] {
  const candidates: DestinationCardFact[] = [
    { label: "Lifestyle", value: destination.lifestyle },
    { label: "Climate", value: destination.climate },
    { label: "Transportation", value: destination.transportation },
    { label: "Overview", value: destination.overview },
  ];

  const deduped: DestinationCardFact[] = [];
  const seen = new Set<string>();

  candidates.forEach((fact) => {
    const key = `${fact.label}:${fact.value}`;
    if (fact.value && !seen.has(key)) {
      seen.add(key);
      deduped.push({ label: fact.label, value: truncate(fact.value) });
    }
  });

  return deduped;
}

function isGenericGeneratedRecord(
  generated: (typeof generatedDestinationCardFacts)[string] | undefined,
): boolean {
  if (!generated) return true;

  if (generated.lowCoverage) return true;

  if ((generated.scoreSignals?.length ?? 0) === 0) {
    return true;
  }

  return false;
}

function isVerificationPlaceholder(value: string): boolean {
  const normalized = value.toLowerCase();
  return normalized.includes("data verification in progress");
}

export function getDestinationCardFacts(destination: Destination): DestinationCardFactsResult {
  const generated = generatedDestinationCardFacts[destination.slug];
  const preferFallbackFirst = isGenericGeneratedRecord(generated);

  const combinedFacts: DestinationCardFact[] = [];
  const seen = new Set<string>();

  const addFact = (fact: DestinationCardFact) => {
    if (!fact.value || isVerificationPlaceholder(fact.value)) {
      return;
    }
    const key = `${fact.label}:${fact.value}`;
    if (!seen.has(key)) {
      seen.add(key);
      combinedFacts.push(fact);
    }
  };

  if (preferFallbackFirst) {
    buildFallbackFacts(destination).forEach((fact) => addFact(fact));
  }

  (generated?.facts ?? []).forEach((fact) => {
    addFact(fact);
  });

  if (!preferFallbackFirst) {
    buildFallbackFacts(destination).forEach((fact) => addFact(fact));
  }

  const facts = combinedFacts.slice(0, 4);
  const lowCoverage = !generated || (generated.facts?.length ?? 0) < 3 || generated.lowCoverage;
  const generatedSummary = generated?.summary?.trim() ?? "";
  const summary =
    preferFallbackFirst || isVerificationPlaceholder(generatedSummary)
      ? destination.description || truncate(destination.overview, 170)
      : generatedSummary || destination.description || truncate(destination.overview, 170);

  const fallbackScoreSignals = [
    { category: "Lifestyle Fit", score: 82 },
    { category: "Climate Comfort", score: 79 },
    { category: "Access & Mobility", score: 76 },
  ];

  return {
    summary,
    overallScore: generated?.overallScore ?? 80,
    scoreSignals: generated?.scoreSignals?.length
      ? generated.scoreSignals
      : fallbackScoreSignals,
    facts,
    lowCoverage,
  };
}
