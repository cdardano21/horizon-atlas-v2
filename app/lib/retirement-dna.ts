export type RetirementDimensionId =
  | "budget"
  | "healthcare"
  | "safety"
  | "walkability"
  | "climate"
  | "coast"
  | "culture"
  | "community"
  | "connectivity"
  | "nature"
  | "pace"
  | "stability"
  | "family"
  | "hobbies"
  | "personality"
  | "goals";

export type RetirementQuestion = {
  id: string;
  dimension: RetirementDimensionId;
  prompt: string;
  helper: string;
};

export type RetirementSection = {
  id: string;
  title: string;
  description: string;
  questions: RetirementQuestion[];
};

export type RetirementDnaAnswers = Record<string, number>;

export type RetirementDnaProfile = {
  answeredCount: number;
  totalQuestions: number;
  completionPercent: number;
  dimensionScores: Record<RetirementDimensionId, number>;
  topPriorities: Array<{ id: RetirementDimensionId; label: string; score: number }>;
  derivedTags: string[];
};

export const RETIREMENT_DNA_SCALE = [
  { value: 1, label: "Not important", shortLabel: "1" },
  { value: 2, label: "Low priority", shortLabel: "2" },
  { value: 3, label: "Moderate", shortLabel: "3" },
  { value: 4, label: "Very important", shortLabel: "4" },
  { value: 5, label: "Essential", shortLabel: "5" },
] as const;

const dimensionMeta: Record<RetirementDimensionId, { label: string; description: string }> = {
  budget: { label: "Budget fit", description: "Ongoing affordability and value for day-to-day living." },
  healthcare: { label: "Healthcare", description: "Access, quality, and confidence in medical support." },
  safety: { label: "Safety", description: "Personal security, predictability, and ease of mind." },
  walkability: { label: "Walkability", description: "Living well without depending on a car every day." },
  climate: { label: "Warm climate", description: "Consistent sunshine, mild winters, and outdoor comfort." },
  coast: { label: "Coastal lifestyle", description: "Proximity to beaches, marinas, and waterfront living." },
  culture: { label: "Culture", description: "Food, arts, events, history, and stimulation." },
  community: { label: "Community", description: "Expat networks, belonging, and social ease." },
  connectivity: { label: "Connectivity", description: "Airport access, digital infrastructure, and mobility." },
  nature: { label: "Nature", description: "Green space, scenery, and outdoor recreation." },
  pace: { label: "Relaxed pace", description: "A calmer rhythm and less day-to-day friction." },
  stability: { label: "Long-term stability", description: "Confidence in governance, services, and staying power." },
  family: { label: "Family fit", description: "How well the destination supports partner, children, and family proximity needs." },
  hobbies: { label: "Hobbies & recreation", description: "How strongly golf, outdoor life, culture, fitness, and routine pursuits matter." },
  personality: { label: "Personality fit", description: "The match between your temperament and a destination's social rhythm and energy." },
  goals: { label: "Retirement goals", description: "How much your move is about reinvention, legacy, freedom, or a long-term base." },
};

const question = (
  id: string,
  dimension: RetirementDimensionId,
  prompt: string,
  helper: string,
): RetirementQuestion => ({ id, dimension, prompt, helper });

export const RETIREMENT_DNA_SECTIONS: RetirementSection[] = [
  {
    id: "financial-fit",
    title: "Financial Fit",
    description: "Define how much affordability and cost discipline should shape your shortlist.",
    questions: [
      question("budget-2", "budget", "I want a destination where my retirement income stretches meaningfully further.", "Think purchasing power rather than just headline prices."),
      question("budget-1", "budget", "Keeping monthly living costs under control is a top decision driver for me.", "This includes housing, groceries, dining, and routine services."),
      question("budget-4", "budget", "Owning or renting comfortable housing at a sensible cost matters a lot to me.", "Housing cost is one of the biggest long-term levers."),
    ],
  },
  {
    id: "health-wellbeing",
    title: "Health & Wellbeing",
    description: "Measure how heavily healthcare confidence should influence your matches.",
    questions: [
      question("healthcare-6", "healthcare", "Healthcare confidence is one of the first filters I would use to eliminate a city.", "A strong score here should sharply influence the ranking."),
      question("healthcare-1", "healthcare", "Reliable access to doctors and specialists is essential for my move.", "This is about baseline access, not only elite hospitals."),
      question("healthcare-2", "healthcare", "I want to feel confident that healthcare quality will hold up over the next decade.", "Long-horizon resilience matters as much as current availability."),
    ],
  },
  {
    id: "safety-security",
    title: "Safety & Security",
    description: "Capture how much peace of mind and predictability should drive your recommendations.",
    questions: [
      question("safety-3", "safety", "I would reject an otherwise attractive city if safety felt inconsistent.", "This tests whether safety is a hard requirement or a soft preference."),
      question("safety-1", "safety", "Feeling safe while walking around day and night is crucial for me.", "This influences everyday livability more than occasional tourism impressions."),
      question("safety-2", "safety", "I value destinations where I can relax without constantly managing risk.", "Low-friction living is a meaningful retirement advantage."),
    ],
  },
  {
    id: "mobility-walkability",
    title: "Mobility & Walkability",
    description: "Clarify whether your ideal city should work well without constant driving.",
    questions: [
      question("walkability-2", "walkability", "A compact, navigable city is much more appealing to me than car dependence.", "This supports a more active and independent lifestyle."),
      question("walkability-1", "walkability", "I want to accomplish most daily tasks on foot.", "Errands, coffee, dining, and essentials should feel close at hand."),
      question("walkability-6", "walkability", "Ease of movement matters more to me than having lots of space between destinations.", "This usually favors dense, human-scale places."),
    ],
  },
  {
    id: "climate-coast",
    title: "Climate & Coast",
    description: "Weight how strongly warm weather and seaside access should influence your shortlist.",
    questions: [
      question("climate-1", "climate", "Warm weather for most of the year is a major reason I am considering a move.", "This helps favor consistently mild destinations."),
      question("coast-1", "coast", "Living near the water feels central to my ideal retirement lifestyle.", "This supports coastal and marina-oriented destinations."),
      question("climate-3", "climate", "Avoiding long cold seasons matters strongly to me.", "Useful for prioritizing Mediterranean and warm-weather regions."),
    ],
  },
  {
    id: "culture-lifestyle",
    title: "Culture & Lifestyle",
    description: "Decide how much stimulation, dining, and cultural energy should shape the engine.",
    questions: [
      question("culture-4", "culture", "I want a city that stays interesting even after the honeymoon phase.", "Long-term curiosity matters more than postcard appeal."),
      question("culture-3", "culture", "A destination feels more compelling to me when it has distinct character and identity.", "Culture includes atmosphere, architecture, and rhythm."),
      question("culture-1", "culture", "Excellent dining and food culture are important to my next chapter.", "This captures more than occasional restaurant visits."),
    ],
  },
  {
    id: "community-support",
    title: "Community & Support",
    description: "Define how much you need belonging, social ease, and expat support structures.",
    questions: [
      question("community-3", "community", "A destination should feel welcoming rather than isolating.", "Belonging matters for both confidence and retention."),
      question("community-1", "community", "I want a place where it will be relatively easy to build a new social circle.", "This favors destinations with openness and visible communities."),
      question("community-2", "community", "Existing expat or international communities would make my move meaningfully easier.", "Especially important for early-stage settling in."),
    ],
  },
  {
    id: "travel-connectivity",
    title: "Travel & Connectivity",
    description: "Set how much access, logistics, and digital readiness should count.",
    questions: [
      question("connectivity-4", "connectivity", "I prefer destinations that feel logistically simple rather than remote.", "This can strongly affect long-term ease."),
      question("connectivity-1", "connectivity", "Good airport access is important because I expect to travel often.", "This includes visiting family and handling multi-country plans."),
      question("connectivity-2", "connectivity", "Reliable internet and digital services are important to my lifestyle.", "This matters for remote work, communication, and modern admin."),
    ],
  },
  {
    id: "nature-routine",
    title: "Nature & Routine",
    description: "Measure how much scenic access and outdoor rhythm should define your results.",
    questions: [
      question("pace-1", "pace", "A slower, calmer pace of life is important to me.", "This favors places with less rush and friction."),
      question("nature-1", "nature", "I want nature, scenery, or outdoor recreation to be part of normal daily life.", "This can mean trails, waterfronts, parks, or mountain access."),
      question("nature-2", "nature", "Beautiful surroundings contribute meaningfully to my sense of wellbeing.", "Environment shapes day-to-day satisfaction."),
    ],
  },
  {
    id: "long-horizon",
    title: "Long-Horizon Fit",
    description: "Bring together stability, resilience, and confidence in a multi-year move.",
    questions: [
      question("stability-6", "stability", "Long-term fit matters more to me than immediate excitement.", "This separates durable matches from tempting but fragile options."),
      question("stability-1", "stability", "I want a destination that feels dependable for a long multi-year stay.", "This is about staying power, not novelty."),
      question("stability-3", "stability", "I prefer destinations that feel established and trustworthy over those that feel speculative.", "This sharpens long-term risk tolerance."),
    ],
  },
  {
    id: "family-relationships",
    title: "Family & Relationships",
    description: "Capture how family structure and access should shape relocation decisions.",
    questions: [
      question("family-5", "family", "Being too remote from the people I care about would be a serious downside.", "Distance tolerance matters as much as destination appeal."),
      question("family-3", "family", "My move needs to work not just for me, but for a partner or close family member too.", "This broadens the match beyond solo preference."),
      question("family-1", "family", "Easy access for family visits is important to my ideal destination.", "This can strongly raise the value of airport access and practical logistics."),
    ],
  },
  {
    id: "identity-goals",
    title: "Identity, Hobbies & Retirement Goals",
    description: "Define the kind of life you want to build, not only the city features you want around you.",
    questions: [
      question("goals-2", "goals", "I want my destination to feel aligned with the future I imagine for myself in retirement.", "This helps the engine distinguish practical fits from genuinely aspirational fits."),
      question("personality-3", "personality", "I would rather live in a place that fits my energy and values than in a place that is simply popular.", "This helps avoid trend-driven mismatches."),
      question("personality-1", "personality", "My ideal place should match my temperament, not just my spreadsheet criteria.", "Some people thrive in energetic urban environments; others need calm and simplicity."),
      question("hobbies-1", "hobbies", "My regular hobbies and recreation should be easy to sustain where I live.", "This may include golf, walking, fitness, arts, boating, or outdoor activities."),
    ],
  },
];

export const RETIREMENT_DNA_QUESTIONS = RETIREMENT_DNA_SECTIONS.flatMap((section) => section.questions);

export const RETIREMENT_DNA_TOTAL_QUESTIONS = RETIREMENT_DNA_QUESTIONS.length;

const RETIREMENT_DNA_V2_QUESTION_IDS = [
  "budget-1",
  "budget-2",
  "budget-4",
  "healthcare-1",
  "healthcare-2",
  "healthcare-6",
  "safety-1",
  "safety-2",
  "safety-3",
  "walkability-1",
  "walkability-2",
  "walkability-6",
  "climate-1",
  "climate-3",
  "coast-1",
  "culture-1",
  "culture-3",
  "culture-4",
  "community-1",
  "community-2",
  "community-3",
  "connectivity-1",
  "connectivity-2",
  "connectivity-4",
  "nature-1",
  "nature-2",
  "pace-1",
  "stability-1",
  "stability-3",
  "stability-6",
  "family-1",
  "family-3",
  "family-5",
  "personality-1",
  "hobbies-1",
  "goals-2",
  "personality-3",
];

const RETIREMENT_DNA_CURRENT_VERSION = "v3";

const LEGACY_RETIREMENT_DNA_QUESTION_IDS = [
  ...Array.from({ length: 6 }, (_, index) => `budget-${index + 1}`),
  ...Array.from({ length: 6 }, (_, index) => `healthcare-${index + 1}`),
  ...Array.from({ length: 6 }, (_, index) => `safety-${index + 1}`),
  ...Array.from({ length: 6 }, (_, index) => `walkability-${index + 1}`),
  ...Array.from({ length: 3 }, (_, index) => `climate-${index + 1}`),
  ...Array.from({ length: 3 }, (_, index) => `coast-${index + 1}`),
  ...Array.from({ length: 6 }, (_, index) => `culture-${index + 1}`),
  ...Array.from({ length: 6 }, (_, index) => `community-${index + 1}`),
  ...Array.from({ length: 6 }, (_, index) => `connectivity-${index + 1}`),
  ...Array.from({ length: 3 }, (_, index) => `nature-${index + 1}`),
  ...Array.from({ length: 3 }, (_, index) => `pace-${index + 1}`),
  ...Array.from({ length: 6 }, (_, index) => `stability-${index + 1}`),
  ...Array.from({ length: 6 }, (_, index) => `family-${index + 1}`),
  "personality-1",
  "personality-2",
  "hobbies-1",
  "hobbies-2",
  "goals-1",
  "goals-2",
  "goals-3",
  "hobbies-3",
  "personality-3",
  "goals-4",
  "family-7",
  "hobbies-4",
];

export const getDimensionLabel = (dimension: RetirementDimensionId) => dimensionMeta[dimension].label;

export const getDimensionDescription = (dimension: RetirementDimensionId) => dimensionMeta[dimension].description;

export const serializeRetirementDnaAnswers = (answers: RetirementDnaAnswers) =>
  `${RETIREMENT_DNA_CURRENT_VERSION}:${RETIREMENT_DNA_QUESTIONS.map((questionItem) => String(Math.max(0, Math.min(5, answers[questionItem.id] ?? 0)))).join("")}`;

const parseEncodedAnswers = (encoded: string, questionIds: string[]) => {
  const answerMap: RetirementDnaAnswers = {};

  questionIds.forEach((questionId, index) => {
    const rawValue = encoded[index];
    const parsedValue = rawValue ? Number(rawValue) : 0;

    if (Number.isFinite(parsedValue) && parsedValue >= 1 && parsedValue <= 5) {
      answerMap[questionId] = parsedValue;
    }
  });

  return answerMap;
};

export const deserializeRetirementDnaAnswers = (encoded: string) => {
  const trimmed = encoded.trim();

  if (trimmed.startsWith(`${RETIREMENT_DNA_CURRENT_VERSION}:`)) {
    return parseEncodedAnswers(trimmed.slice(3), RETIREMENT_DNA_QUESTIONS.map((questionItem) => questionItem.id));
  }

  if (trimmed.startsWith("v2:")) {
    return parseEncodedAnswers(trimmed.slice(3), RETIREMENT_DNA_V2_QUESTION_IDS);
  }

  if (trimmed.length === LEGACY_RETIREMENT_DNA_QUESTION_IDS.length) {
    return parseEncodedAnswers(trimmed, LEGACY_RETIREMENT_DNA_QUESTION_IDS);
  }

  return parseEncodedAnswers(trimmed, RETIREMENT_DNA_QUESTIONS.map((questionItem) => questionItem.id));
};

const normalizeScore = (value: number) => Math.max(0, Math.min(100, Math.round(((value - 1) / 4) * 100)));

export const computeRetirementDnaProfile = (answers: RetirementDnaAnswers): RetirementDnaProfile => {
  const answeredCount = RETIREMENT_DNA_QUESTIONS.reduce((count, questionItem) => count + (answers[questionItem.id] ? 1 : 0), 0);
  const dimensionScores = Object.fromEntries(
    (Object.keys(dimensionMeta) as RetirementDimensionId[]).map((dimension) => {
      const values = RETIREMENT_DNA_QUESTIONS
        .filter((questionItem) => questionItem.dimension === dimension)
        .map((questionItem) => answers[questionItem.id])
        .filter((value): value is number => Boolean(value));

      if (values.length === 0) {
        return [dimension, 0];
      }

      const average = values.reduce((total, value) => total + value, 0) / values.length;
      return [dimension, normalizeScore(average)];
    }),
  ) as Record<RetirementDimensionId, number>;

  const topPriorities = (Object.keys(dimensionScores) as RetirementDimensionId[])
    .map((dimension) => ({ id: dimension, label: getDimensionLabel(dimension), score: dimensionScores[dimension] }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 4);

  const derivedTags = Array.from(
    new Set(
      [
        dimensionScores.budget >= 70 ? "value" : null,
        dimensionScores.healthcare >= 70 ? "healthcare" : null,
        dimensionScores.safety >= 70 ? "safety" : null,
        dimensionScores.walkability >= 70 ? "walkability" : null,
        dimensionScores.climate >= 70 ? "summer escape" : null,
        dimensionScores.coast >= 70 ? "beach" : null,
        dimensionScores.coast >= 60 ? "coast" : null,
        dimensionScores.culture >= 70 ? "culture" : null,
        dimensionScores.community >= 70 ? "expat-friendly" : null,
        dimensionScores.connectivity >= 70 ? "airport access" : null,
        dimensionScores.connectivity >= 80 ? "digital nomad" : null,
        dimensionScores.hobbies >= 75 ? "golf" : null,
      ].filter(Boolean),
    ),
  ) as string[];

  return {
    answeredCount,
    totalQuestions: RETIREMENT_DNA_TOTAL_QUESTIONS,
    completionPercent: Math.round((answeredCount / RETIREMENT_DNA_TOTAL_QUESTIONS) * 100),
    dimensionScores,
    topPriorities,
    derivedTags,
  };
};