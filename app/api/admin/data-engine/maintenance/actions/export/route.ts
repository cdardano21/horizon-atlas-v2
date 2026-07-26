import { getAuthedAdmin } from "../../../../../../lib/admin-auth";
import { DATA_CATEGORY_CATALOG } from "../../../../../../lib/data-engine/category-catalog";
import { listMaintenanceActions } from "../../../../../../lib/data-engine/repository";
import { isSupabaseConfigured } from "../../../../../../lib/supabase";
import type { DataCategoryKey } from "../../../../../../lib/data-engine/types";
import { gzipSync } from "node:zlib";

const DEFAULT_LIMIT = 200;
const DEFAULT_SINCE_HOURS = 168;
const DEFAULT_GZIP_THRESHOLD_BYTES = 64 * 1024;

type GzipMode = "off" | "on" | "auto";

function parsePositiveNumber(value: string | null, fallback: number): number {
  const parsed = Number(value ?? "");
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
}

function parseOptionalBoolean(value: string | null): boolean | undefined {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
}

function parseGzipMode(value: string | null): GzipMode {
  if (value === "true" || value === "1" || value === "gzip") {
    return "on";
  }

  if (value === "auto") {
    return "auto";
  }

  return "off";
}

function isValidCategoryKey(value: string): value is DataCategoryKey {
  return Object.prototype.hasOwnProperty.call(DATA_CATEGORY_CATALOG, value);
}

function csvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const text = typeof value === "string" ? value : JSON.stringify(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function toCsv(rows: Array<Record<string, unknown>>): string {
  const headers = [
    "id",
    "action_key",
    "initiated_by",
    "category_key",
    "source_key",
    "dry_run",
    "stale_after_hours",
    "stale_before_iso",
    "stale_match_count",
    "affected_count",
    "notes",
    "details",
    "created_at",
  ];

  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => csvCell(row[header])).join(","));
  }

  return lines.join("\n");
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
    const actionKey = url.searchParams.get("actionKey") ?? undefined;
    const categoryKeyParam = url.searchParams.get("categoryKey") ?? undefined;
    const sourceKey = url.searchParams.get("sourceKey") ?? undefined;
    const dryRun = parseOptionalBoolean(url.searchParams.get("dryRun"));
    const gzipMode = parseGzipMode(url.searchParams.get("gzip"));
    const gzipThresholdBytes = parsePositiveNumber(
      url.searchParams.get("gzipThresholdBytes"),
      DEFAULT_GZIP_THRESHOLD_BYTES,
    );
    const limit = parsePositiveNumber(url.searchParams.get("limit"), DEFAULT_LIMIT);
    const sinceHours = parsePositiveNumber(url.searchParams.get("sinceHours"), DEFAULT_SINCE_HOURS);

    if (categoryKeyParam && !isValidCategoryKey(categoryKeyParam)) {
      return Response.json({ error: "categoryKey is invalid." }, { status: 400 });
    }

    const categoryKey: DataCategoryKey | undefined =
      categoryKeyParam && isValidCategoryKey(categoryKeyParam)
        ? categoryKeyParam
        : undefined;

    const sinceIso = new Date(Date.now() - sinceHours * 60 * 60 * 1000).toISOString();
    const rows = await listMaintenanceActions(accessToken, {
      actionKey,
      categoryKey,
      sourceKey,
      dryRun,
      limit,
      sinceIso,
    });

    const csv = toCsv(rows as Array<Record<string, unknown>>);
    const csvBytes = Buffer.byteLength(csv, "utf-8");
    const shouldGzip = gzipMode === "on" || (gzipMode === "auto" && csvBytes >= gzipThresholdBytes);
    const timestamp = new Date().toISOString().replaceAll(":", "-");
    const filename = shouldGzip
      ? `maintenance-actions-${timestamp}.csv.gz`
      : `maintenance-actions-${timestamp}.csv`;

    if (shouldGzip) {
      const compressed = gzipSync(csv);
      return new Response(compressed, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename=\"${filename}\"`,
          "Content-Encoding": "gzip",
          "X-Export-Compression": gzipMode === "on" ? "forced-gzip" : "auto-gzip",
          "Cache-Control": "no-store",
        },
      });
    }

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=\"${filename}\"`,
        "X-Export-Compression": gzipMode === "auto" ? "auto-none" : "none",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to export maintenance actions." },
      { status: 500 },
    );
  }
}
