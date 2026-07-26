import { getAuthedAdmin } from "../../../../lib/admin-auth";
import {
  countErrorLogsSince,
  countImportRunsByStatus,
  countStaleRunningImportRuns,
  listRecentImportRuns,
} from "../../../../lib/data-engine/repository";
import { isSupabaseConfigured } from "../../../../lib/supabase";

const DEFAULT_STALE_AFTER_HOURS = 6;
const DEFAULT_RECENT_WINDOW_HOURS = 24;
const DEFAULT_RECENT_RUN_LIMIT = 20;
const DEFAULT_WARN_RUNNING_COUNT = 3;
const DEFAULT_WARN_FAILED_RECENT_COUNT = 2;
const DEFAULT_WARN_ERROR_RECENT_COUNT = 5;
const DEFAULT_CRITICAL_STALE_RUNNING_COUNT = 1;
const DEFAULT_CRITICAL_FAILED_RECENT_COUNT = 5;
const DEFAULT_CRITICAL_ERROR_RECENT_COUNT = 12;

type HealthStatus = "ok" | "warn" | "critical";

type HealthSummary = {
  runningCount: number;
  staleRunningCount: number;
  completedRecentCount: number;
  failedRecentCount: number;
  recentErrorCount: number;
};

type HealthThresholds = {
  warnRunningCount: number;
  warnFailedRecentCount: number;
  warnErrorRecentCount: number;
  criticalStaleRunningCount: number;
  criticalFailedRecentCount: number;
  criticalErrorRecentCount: number;
};

function parsePositiveNumber(value: string | null, fallback: number): number {
  const parsed = Number(value ?? "");
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
}

function classifyHealth(summary: HealthSummary, thresholds: HealthThresholds): {
  status: HealthStatus;
  reasons: string[];
} {
  const criticalReasons: string[] = [];
  const warnReasons: string[] = [];

  if (summary.staleRunningCount >= thresholds.criticalStaleRunningCount) {
    criticalReasons.push(
      `staleRunningCount=${summary.staleRunningCount} >= ${thresholds.criticalStaleRunningCount}`,
    );
  }

  if (summary.failedRecentCount >= thresholds.criticalFailedRecentCount) {
    criticalReasons.push(
      `failedRecentCount=${summary.failedRecentCount} >= ${thresholds.criticalFailedRecentCount}`,
    );
  }

  if (summary.recentErrorCount >= thresholds.criticalErrorRecentCount) {
    criticalReasons.push(
      `recentErrorCount=${summary.recentErrorCount} >= ${thresholds.criticalErrorRecentCount}`,
    );
  }

  if (criticalReasons.length > 0) {
    return { status: "critical", reasons: criticalReasons };
  }

  if (summary.runningCount >= thresholds.warnRunningCount) {
    warnReasons.push(`runningCount=${summary.runningCount} >= ${thresholds.warnRunningCount}`);
  }

  if (summary.failedRecentCount >= thresholds.warnFailedRecentCount) {
    warnReasons.push(`failedRecentCount=${summary.failedRecentCount} >= ${thresholds.warnFailedRecentCount}`);
  }

  if (summary.recentErrorCount >= thresholds.warnErrorRecentCount) {
    warnReasons.push(`recentErrorCount=${summary.recentErrorCount} >= ${thresholds.warnErrorRecentCount}`);
  }

  if (warnReasons.length > 0) {
    return { status: "warn", reasons: warnReasons };
  }

  return { status: "ok", reasons: [] };
}

export async function GET(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return Response.json(
        { error: "Supabase is not configured. Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY (or legacy SUPABASE_ANON_KEY)." },
        { status: 500 },
      );
    }

    const { accessToken, user, adminRole } = await getAuthedAdmin();
    if (!accessToken || !user || !adminRole) {
      return Response.json({ error: "Admin access required." }, { status: 403 });
    }

    const url = new URL(request.url);
    const staleAfterHours = parsePositiveNumber(
      url.searchParams.get("staleAfterHours"),
      DEFAULT_STALE_AFTER_HOURS,
    );
    const recentWindowHours = parsePositiveNumber(
      url.searchParams.get("recentWindowHours"),
      DEFAULT_RECENT_WINDOW_HOURS,
    );
    const recentRunLimit = parsePositiveNumber(
      url.searchParams.get("recentRunLimit"),
      DEFAULT_RECENT_RUN_LIMIT,
    );
    const warnRunningCount = parsePositiveNumber(
      url.searchParams.get("warnRunningCount"),
      DEFAULT_WARN_RUNNING_COUNT,
    );
    const warnFailedRecentCount = parsePositiveNumber(
      url.searchParams.get("warnFailedRecentCount"),
      DEFAULT_WARN_FAILED_RECENT_COUNT,
    );
    const warnErrorRecentCount = parsePositiveNumber(
      url.searchParams.get("warnErrorRecentCount"),
      DEFAULT_WARN_ERROR_RECENT_COUNT,
    );
    const criticalStaleRunningCount = parsePositiveNumber(
      url.searchParams.get("criticalStaleRunningCount"),
      DEFAULT_CRITICAL_STALE_RUNNING_COUNT,
    );
    const criticalFailedRecentCount = parsePositiveNumber(
      url.searchParams.get("criticalFailedRecentCount"),
      DEFAULT_CRITICAL_FAILED_RECENT_COUNT,
    );
    const criticalErrorRecentCount = parsePositiveNumber(
      url.searchParams.get("criticalErrorRecentCount"),
      DEFAULT_CRITICAL_ERROR_RECENT_COUNT,
    );

    const staleBeforeIso = new Date(Date.now() - staleAfterHours * 60 * 60 * 1000).toISOString();
    const recentSinceIso = new Date(Date.now() - recentWindowHours * 60 * 60 * 1000).toISOString();

    const [runningCount, staleRunningCount, completedRecentCount, failedRecentCount, recentErrorCount, recentRuns] =
      await Promise.all([
        countImportRunsByStatus(accessToken, "running"),
        countStaleRunningImportRuns(accessToken, staleBeforeIso),
        countImportRunsByStatus(accessToken, "completed", recentSinceIso),
        countImportRunsByStatus(accessToken, "failed", recentSinceIso),
        countErrorLogsSince(accessToken, recentSinceIso),
        listRecentImportRuns(accessToken, recentRunLimit),
      ]);

    const summary: HealthSummary = {
      runningCount,
      staleRunningCount,
      completedRecentCount,
      failedRecentCount,
      recentErrorCount,
    };

    const thresholds: HealthThresholds = {
      warnRunningCount,
      warnFailedRecentCount,
      warnErrorRecentCount,
      criticalStaleRunningCount,
      criticalFailedRecentCount,
      criticalErrorRecentCount,
    };

    const classification = classifyHealth(summary, thresholds);

    return Response.json(
      {
        success: true,
        snapshotAt: new Date().toISOString(),
        health: {
          status: classification.status,
          reasons: classification.reasons,
        },
        window: {
          staleAfterHours,
          recentWindowHours,
          recentRunLimit,
        },
        thresholds,
        summary,
        recentRuns,
      },
      { status: 200 },
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to load data engine health." },
      { status: 500 },
    );
  }
}
