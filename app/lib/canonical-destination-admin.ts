export type CanonicalDestinationJobStatus = "queued" | "running" | "completed" | "failed" | "paused";

export type CanonicalDestinationJob = {
  id: string;
  destinationSlug: string;
  status: CanonicalDestinationJobStatus;
  progress: number;
  estimatedTimeRemainingSeconds: number;
  lastUpdated: string;
  logs: string[];
  sourcesUsed: string[];
  confidenceScore: number;
};

export const sampleJobs: CanonicalDestinationJob[] = [
  {
    id: "job-1",
    destinationSlug: "cavtat-croatia",
    status: "completed",
    progress: 100,
    estimatedTimeRemainingSeconds: 0,
    lastUpdated: new Date().toISOString(),
    logs: ["Research completed", "Content validated"],
    sourcesUsed: ["Google Search", "Wikipedia", "Official tourism"],
    confidenceScore: 0.93,
  },
  {
    id: "job-2",
    destinationSlug: "spearfish-south-dakota-united-states",
    status: "running",
    progress: 62,
    estimatedTimeRemainingSeconds: 180,
    lastUpdated: new Date().toISOString(),
    logs: ["Gathering sources", "Generating editorial"],
    sourcesUsed: ["Google Search", "WeatherSpark"],
    confidenceScore: 0.81,
  },
];

export const sampleScoringCategories = [
  { name: "Retirement", weight: 30, score: 0 },
  { name: "Walkability", weight: 15, score: 0 },
  { name: "Climate", weight: 20, score: 0 },
  { name: "Healthcare", weight: 15, score: 0 },
  { name: "Food", weight: 10, score: 0 },
  { name: "Beach", weight: 10, score: 0 },
];
