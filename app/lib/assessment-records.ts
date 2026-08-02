"use client";

import type { RetirementDnaProfile } from "./retirement-dna";

const STORAGE_KEY = "destinationfinderai:assessment-records";
const PROFILE_STORAGE_KEY = "destinationfinderai:dashboard-profile";

export type SavedAssessmentRecord = {
  id: string;
  createdAt: string;
  answersEncoded: string;
  profile: RetirementDnaProfile;
  topSlugs: string[];
};

export type DashboardProfileDraft = {
  displayName: string;
  homeCountry: string;
  moveWindow: string;
  planningNotes: string;
};

type AssessmentsResponse = {
  authenticated: boolean;
  records: SavedAssessmentRecord[];
};

type PlanningResponse = {
  authenticated: boolean;
  draft: DashboardProfileDraft;
};

const EMPTY_DASHBOARD_DRAFT: DashboardProfileDraft = {
  displayName: "",
  homeCountry: "",
  moveWindow: "",
  planningNotes: "",
};

const normalizeAssessmentRecords = (value: unknown): SavedAssessmentRecord[] => {
  if (!Array.isArray(value)) return [];

  return value.filter((item): item is SavedAssessmentRecord => {
    if (!item || typeof item !== "object") return false;

    const record = item as Partial<SavedAssessmentRecord>;
    return (
      typeof record.id === "string"
      && typeof record.createdAt === "string"
      && typeof record.answersEncoded === "string"
      && Array.isArray(record.topSlugs)
      && record.profile !== undefined
    );
  });
};

export const getSavedAssessmentRecords = (): SavedAssessmentRecord[] => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return normalizeAssessmentRecords(JSON.parse(raw));
  } catch {
    return [];
  }
};

export const saveAssessmentRecord = (record: SavedAssessmentRecord) => {
  if (typeof window === "undefined") return;

  const next = [record, ...getSavedAssessmentRecords().filter((item) => item.answersEncoded !== record.answersEncoded)].slice(0, 12);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
};

export const getDashboardProfileDraft = (): DashboardProfileDraft => {
  if (typeof window === "undefined") {
    return EMPTY_DASHBOARD_DRAFT;
  }

  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) {
      return EMPTY_DASHBOARD_DRAFT;
    }

    const parsed = JSON.parse(raw) as Partial<DashboardProfileDraft>;
    return {
      displayName: parsed.displayName ?? "",
      homeCountry: parsed.homeCountry ?? "",
      moveWindow: parsed.moveWindow ?? "",
      planningNotes: parsed.planningNotes ?? "",
    };
  } catch {
    return EMPTY_DASHBOARD_DRAFT;
  }
};

export const saveDashboardProfileDraft = (draft: DashboardProfileDraft) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(draft));
};

export const mergeAssessmentRecords = (
  localRecords: SavedAssessmentRecord[],
  remoteRecords: SavedAssessmentRecord[],
) => {
  const merged = new Map<string, SavedAssessmentRecord>();

  [...remoteRecords, ...localRecords].forEach((record) => {
    const key = record.answersEncoded || record.id;
    if (!merged.has(key)) {
      merged.set(key, record);
    }
  });

  return Array.from(merged.values())
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, 12);
};

export const fetchSyncedAssessmentRecords = async (): Promise<AssessmentsResponse> => {
  const response = await fetch("/api/assessments", { cache: "no-store" });
  if (!response.ok) {
    return { authenticated: false, records: [] };
  }

  const payload = (await response.json()) as Partial<AssessmentsResponse>;
  return {
    authenticated: Boolean(payload.authenticated),
    records: normalizeAssessmentRecords(payload.records),
  };
};

export const syncAssessmentRecord = async (record: SavedAssessmentRecord) => {
  const response = await fetch("/api/assessments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      answersEncoded: record.answersEncoded,
      profile: record.profile,
      topSlugs: record.topSlugs,
    }),
  });

  if (response.status === 401) {
    return false;
  }

  return response.ok;
};

export const fetchSyncedPlanningDraft = async (): Promise<PlanningResponse> => {
  const response = await fetch("/api/profile/planning", { cache: "no-store" });
  if (!response.ok) {
    return { authenticated: false, draft: EMPTY_DASHBOARD_DRAFT };
  }

  const payload = (await response.json()) as Partial<PlanningResponse>;
  const draft = payload.draft;
  return {
    authenticated: Boolean(payload.authenticated),
    draft: {
      displayName: draft?.displayName ?? "",
      homeCountry: draft?.homeCountry ?? "",
      moveWindow: draft?.moveWindow ?? "",
      planningNotes: draft?.planningNotes ?? "",
    },
  };
};

export const syncPlanningDraft = async (draft: DashboardProfileDraft) => {
  const response = await fetch("/api/profile/planning", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(draft),
  });

  if (response.status === 401) {
    return { synced: false, localOnly: true };
  }

  if (!response.ok) {
    return { synced: false, localOnly: false };
  }

  return { synced: true, localOnly: false };
};