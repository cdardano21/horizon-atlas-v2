import { getSupabaseConfig } from "../supabase";
import type { DataCategoryKey, NormalizedRecord, ReviewStatus } from "./types";

type DestinationRow = {
  id: string;
  slug: string;
  city: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
};

type EngineImportRow = {
  id: string;
  run_id: string;
  destination_id: string;
  destination_slug: string;
  category_key: string;
  source_key: string;
  source_record_id: string;
  observed_at: string;
  normalized_at: string;
  confidence_level: string;
  payload: Record<string, unknown>;
  dedupe_key: string;
  record_hash: string;
  review_status: string;
  review_notes: string | null;
};

type ImportRunRow = {
  id: string;
  category_key: string;
  source_key: string;
  trigger_type: string;
  status: string;
  started_at: string;
  finished_at: string | null;
  destination_count: number | null;
};

export type ImportRunStatus = "queued" | "running" | "completed" | "failed";

export type SchedulePolicyRow = {
  category_key: string;
  is_enabled: boolean;
  source_key: string | null;
  min_interval_hours: number | null;
  max_destinations_per_run: number | null;
  stale_after_hours: number | null;
  notes: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type MaintenanceActionRow = {
  id: string;
  action_key: string;
  initiated_by: string | null;
  category_key: string | null;
  source_key: string | null;
  dry_run: boolean;
  stale_after_hours: number | null;
  stale_before_iso: string | null;
  stale_match_count: number;
  affected_count: number;
  notes: string | null;
  details: Record<string, unknown>;
  created_at: string;
};

function buildHeaders(accessToken: string, contentType = false): HeadersInit {
  const { anonKey } = getSupabaseConfig();
  return {
    apikey: anonKey,
    Authorization: `Bearer ${accessToken}`,
    ...(contentType ? { "Content-Type": "application/json" } : {}),
  };
}

async function parseErrorText(response: Response): Promise<string> {
  const text = await response.text();
  return text || `HTTP ${response.status}`;
}

export async function listDestinationRows(
  accessToken: string,
  destinationSlugs?: string[],
): Promise<DestinationRow[]> {
  const { url } = getSupabaseConfig();
  const slugFilter = destinationSlugs && destinationSlugs.length > 0
    ? `&slug=in.(${destinationSlugs.map((slug) => encodeURIComponent(slug)).join(",")})`
    : "";

  const response = await fetch(
    `${url}/rest/v1/destinations_catalog?select=id,slug,city,country,latitude,longitude${slugFilter}&order=slug.asc`,
    {
      headers: buildHeaders(accessToken),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Unable to load destinations: ${await parseErrorText(response)}`);
  }

  return (await response.json()) as DestinationRow[];
}

export async function createImportRun(
  accessToken: string,
  payload: {
    categoryKey: DataCategoryKey;
    sourceKey: string;
    triggerType: "manual" | "scheduled";
    triggeredBy: string;
    destinationCount: number;
  },
): Promise<string> {
  const { url } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/data_engine_import_runs`, {
    method: "POST",
    headers: {
      ...buildHeaders(accessToken, true),
      Prefer: "return=representation",
    },
    body: JSON.stringify([
      {
        category_key: payload.categoryKey,
        source_key: payload.sourceKey,
        trigger_type: payload.triggerType,
        status: "running",
        triggered_by: payload.triggeredBy,
        started_at: new Date().toISOString(),
        destination_count: payload.destinationCount,
      },
    ]),
  });

  if (!response.ok) {
    throw new Error(`Unable to create import run: ${await parseErrorText(response)}`);
  }

  const rows = (await response.json()) as Array<{ id: string }>;
  if (!rows[0]?.id) {
    throw new Error("Import run insert returned no id.");
  }

  return rows[0].id;
}

export async function getLatestImportRun(
  accessToken: string,
  categoryKey: DataCategoryKey,
  sourceKey?: string,
): Promise<ImportRunRow | null> {
  const { url } = getSupabaseConfig();
  const sourceFilter = sourceKey ? `&source_key=eq.${encodeURIComponent(sourceKey)}` : "";
  const response = await fetch(
    `${url}/rest/v1/data_engine_import_runs?select=id,category_key,source_key,trigger_type,status,started_at,finished_at,destination_count&category_key=eq.${encodeURIComponent(categoryKey)}${sourceFilter}&order=started_at.desc&limit=1`,
    {
      headers: buildHeaders(accessToken),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Unable to load latest import run: ${await parseErrorText(response)}`);
  }

  const rows = (await response.json()) as ImportRunRow[];
  return rows[0] ?? null;
}

export async function hasRunningImportRun(
  accessToken: string,
  categoryKey: DataCategoryKey,
  sourceKey?: string,
): Promise<boolean> {
  const { url } = getSupabaseConfig();
  const sourceFilter = sourceKey ? `&source_key=eq.${encodeURIComponent(sourceKey)}` : "";
  const response = await fetch(
    `${url}/rest/v1/data_engine_import_runs?select=id&category_key=eq.${encodeURIComponent(categoryKey)}&status=eq.running${sourceFilter}&limit=1`,
    {
      headers: buildHeaders(accessToken),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Unable to check running import run: ${await parseErrorText(response)}`);
  }

  const rows = (await response.json()) as Array<{ id: string }>;
  return rows.length > 0;
}

export async function countImportRunsByStatus(
  accessToken: string,
  status: ImportRunStatus,
  startedAfterIso?: string,
): Promise<number> {
  const { url } = getSupabaseConfig();
  const sinceFilter = startedAfterIso ? `&started_at=gte.${encodeURIComponent(startedAfterIso)}` : "";
  const response = await fetch(
    `${url}/rest/v1/data_engine_import_runs?select=id&status=eq.${status}${sinceFilter}&limit=1000`,
    {
      headers: buildHeaders(accessToken),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Unable to count import runs for status ${status}: ${await parseErrorText(response)}`);
  }

  const rows = (await response.json()) as Array<{ id: string }>;
  return rows.length;
}

export async function countStaleRunningImportRuns(
  accessToken: string,
  staleBeforeIso: string,
  categoryKey?: DataCategoryKey,
  sourceKey?: string,
): Promise<number> {
  const { url } = getSupabaseConfig();
  const categoryFilter = categoryKey ? `&category_key=eq.${encodeURIComponent(categoryKey)}` : "";
  const sourceFilter = sourceKey ? `&source_key=eq.${encodeURIComponent(sourceKey)}` : "";
  const response = await fetch(
    `${url}/rest/v1/data_engine_import_runs?select=id&status=eq.running${categoryFilter}${sourceFilter}&started_at=lt.${encodeURIComponent(staleBeforeIso)}&limit=1000`,
    {
      headers: buildHeaders(accessToken),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Unable to count stale running import runs: ${await parseErrorText(response)}`);
  }

  const rows = (await response.json()) as Array<{ id: string }>;
  return rows.length;
}

export async function listRecentImportRuns(
  accessToken: string,
  limit = 20,
): Promise<ImportRunRow[]> {
  const { url } = getSupabaseConfig();
  const response = await fetch(
    `${url}/rest/v1/data_engine_import_runs?select=id,category_key,source_key,trigger_type,status,started_at,finished_at,destination_count&order=started_at.desc&limit=${limit}`,
    {
      headers: buildHeaders(accessToken),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Unable to load recent import runs: ${await parseErrorText(response)}`);
  }

  return (await response.json()) as ImportRunRow[];
}

export async function countErrorLogsSince(
  accessToken: string,
  sinceIso: string,
): Promise<number> {
  const { url } = getSupabaseConfig();
  const response = await fetch(
    `${url}/rest/v1/data_engine_error_logs?select=id&created_at=gte.${encodeURIComponent(sinceIso)}&limit=1000`,
    {
      headers: buildHeaders(accessToken),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Unable to count data engine error logs: ${await parseErrorText(response)}`);
  }

  const rows = (await response.json()) as Array<{ id: string }>;
  return rows.length;
}

export async function failStaleRunningImportRuns(
  accessToken: string,
  payload: {
    categoryKey?: DataCategoryKey;
    sourceKey?: string;
    staleBeforeIso: string;
    errorMessage?: string;
  },
): Promise<number> {
  const { url } = getSupabaseConfig();
  const categoryFilter = payload.categoryKey
    ? `&category_key=eq.${encodeURIComponent(payload.categoryKey)}`
    : "";
  const sourceFilter = payload.sourceKey ? `&source_key=eq.${encodeURIComponent(payload.sourceKey)}` : "";
  const lookupResponse = await fetch(
    `${url}/rest/v1/data_engine_import_runs?select=id&status=eq.running${categoryFilter}${sourceFilter}&started_at=lt.${encodeURIComponent(payload.staleBeforeIso)}&limit=200`,
    {
      headers: buildHeaders(accessToken),
      cache: "no-store",
    },
  );

  if (!lookupResponse.ok) {
    throw new Error(`Unable to query stale running import runs: ${await parseErrorText(lookupResponse)}`);
  }

  const staleRows = (await lookupResponse.json()) as Array<{ id: string }>;
  if (staleRows.length === 0) {
    return 0;
  }

  const staleIds = staleRows.map((row) => row.id);
  const finalizeResponse = await fetch(
    `${url}/rest/v1/data_engine_import_runs?id=in.(${staleIds.join(",")})`,
    {
      method: "PATCH",
      headers: {
        ...buildHeaders(accessToken, true),
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        status: "failed",
        finished_at: new Date().toISOString(),
        error_message:
          payload.errorMessage ??
          `Auto-failed stale running import run after threshold ${payload.staleBeforeIso}.`,
      }),
    },
  );

  if (!finalizeResponse.ok) {
    throw new Error(`Unable to fail stale import runs: ${await parseErrorText(finalizeResponse)}`);
  }

  const updatedRows = (await finalizeResponse.json()) as Array<{ id: string }>;
  return updatedRows.length;
}

export async function getSchedulePolicy(
  accessToken: string,
  categoryKey: DataCategoryKey,
): Promise<SchedulePolicyRow | null> {
  const { url } = getSupabaseConfig();
  const response = await fetch(
    `${url}/rest/v1/data_engine_schedule_policies?select=*&category_key=eq.${encodeURIComponent(categoryKey)}&limit=1`,
    {
      headers: buildHeaders(accessToken),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Unable to load schedule policy: ${await parseErrorText(response)}`);
  }

  const rows = (await response.json()) as SchedulePolicyRow[];
  return rows[0] ?? null;
}

export async function listSchedulePolicies(
  accessToken: string,
): Promise<SchedulePolicyRow[]> {
  const { url } = getSupabaseConfig();
  const response = await fetch(
    `${url}/rest/v1/data_engine_schedule_policies?select=*&order=category_key.asc`,
    {
      headers: buildHeaders(accessToken),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Unable to list schedule policies: ${await parseErrorText(response)}`);
  }

  return (await response.json()) as SchedulePolicyRow[];
}

export async function upsertSchedulePolicy(
  accessToken: string,
  payload: {
    categoryKey: DataCategoryKey;
    updatedBy: string;
    isEnabled?: boolean;
    sourceKey?: string | null;
    minIntervalHours?: number | null;
    maxDestinationsPerRun?: number | null;
    staleAfterHours?: number | null;
    notes?: string | null;
  },
): Promise<SchedulePolicyRow> {
  const existing = await getSchedulePolicy(accessToken, payload.categoryKey);
  const { url } = getSupabaseConfig();

  const row = {
    category_key: payload.categoryKey,
    is_enabled: payload.isEnabled ?? existing?.is_enabled ?? true,
    source_key: payload.sourceKey ?? existing?.source_key ?? null,
    min_interval_hours: payload.minIntervalHours ?? existing?.min_interval_hours ?? null,
    max_destinations_per_run:
      payload.maxDestinationsPerRun ?? existing?.max_destinations_per_run ?? null,
    stale_after_hours: payload.staleAfterHours ?? existing?.stale_after_hours ?? null,
    notes: payload.notes ?? existing?.notes ?? null,
    updated_by: payload.updatedBy,
  };

  const response = await fetch(
    `${url}/rest/v1/data_engine_schedule_policies?on_conflict=category_key`,
    {
      method: "POST",
      headers: {
        ...buildHeaders(accessToken, true),
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify([row]),
    },
  );

  if (!response.ok) {
    throw new Error(`Unable to upsert schedule policy: ${await parseErrorText(response)}`);
  }

  const rows = (await response.json()) as SchedulePolicyRow[];
  if (!rows[0]) {
    throw new Error("Schedule policy upsert returned no row.");
  }

  return rows[0];
}

export async function bulkUpsertSchedulePolicies(
  accessToken: string,
  rows: Array<{
    categoryKey: DataCategoryKey;
    updatedBy: string;
    isEnabled?: boolean;
    sourceKey?: string | null;
    minIntervalHours?: number | null;
    maxDestinationsPerRun?: number | null;
    staleAfterHours?: number | null;
    notes?: string | null;
  }>,
): Promise<SchedulePolicyRow[]> {
  if (rows.length === 0) {
    return [];
  }

  const { url } = getSupabaseConfig();
  const body = rows.map((row) => ({
    category_key: row.categoryKey,
    is_enabled: row.isEnabled ?? true,
    source_key: row.sourceKey ?? null,
    min_interval_hours: row.minIntervalHours ?? null,
    max_destinations_per_run: row.maxDestinationsPerRun ?? null,
    stale_after_hours: row.staleAfterHours ?? null,
    notes: row.notes ?? null,
    updated_by: row.updatedBy,
  }));

  const response = await fetch(
    `${url}/rest/v1/data_engine_schedule_policies?on_conflict=category_key`,
    {
      method: "POST",
      headers: {
        ...buildHeaders(accessToken, true),
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    throw new Error(`Unable to bulk upsert schedule policies: ${await parseErrorText(response)}`);
  }

  return (await response.json()) as SchedulePolicyRow[];
}

export async function insertMaintenanceAction(
  accessToken: string,
  payload: {
    actionKey: string;
    initiatedBy: string;
    categoryKey?: DataCategoryKey;
    sourceKey?: string;
    dryRun: boolean;
    staleAfterHours?: number;
    staleBeforeIso?: string;
    staleMatchCount: number;
    affectedCount: number;
    notes?: string;
    details?: Record<string, unknown>;
  },
): Promise<MaintenanceActionRow> {
  const { url } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/data_engine_maintenance_actions`, {
    method: "POST",
    headers: {
      ...buildHeaders(accessToken, true),
      Prefer: "return=representation",
    },
    body: JSON.stringify([
      {
        action_key: payload.actionKey,
        initiated_by: payload.initiatedBy,
        category_key: payload.categoryKey ?? null,
        source_key: payload.sourceKey ?? null,
        dry_run: payload.dryRun,
        stale_after_hours: payload.staleAfterHours ?? null,
        stale_before_iso: payload.staleBeforeIso ?? null,
        stale_match_count: payload.staleMatchCount,
        affected_count: payload.affectedCount,
        notes: payload.notes ?? null,
        details: payload.details ?? {},
      },
    ]),
  });

  if (!response.ok) {
    throw new Error(`Unable to insert maintenance action: ${await parseErrorText(response)}`);
  }

  const rows = (await response.json()) as MaintenanceActionRow[];
  if (!rows[0]) {
    throw new Error("Maintenance action insert returned no row.");
  }

  return rows[0];
}

export async function listMaintenanceActions(
  accessToken: string,
  filters?: {
    actionKey?: string;
    categoryKey?: DataCategoryKey;
    sourceKey?: string;
    dryRun?: boolean;
    sinceIso?: string;
    limit?: number;
  },
): Promise<MaintenanceActionRow[]> {
  const { url } = getSupabaseConfig();
  const actionFilter = filters?.actionKey
    ? `&action_key=eq.${encodeURIComponent(filters.actionKey)}`
    : "";
  const categoryFilter = filters?.categoryKey
    ? `&category_key=eq.${encodeURIComponent(filters.categoryKey)}`
    : "";
  const sourceFilter = filters?.sourceKey
    ? `&source_key=eq.${encodeURIComponent(filters.sourceKey)}`
    : "";
  const dryRunFilter =
    typeof filters?.dryRun === "boolean" ? `&dry_run=eq.${filters.dryRun}` : "";
  const sinceFilter = filters?.sinceIso
    ? `&created_at=gte.${encodeURIComponent(filters.sinceIso)}`
    : "";
  const limit =
    typeof filters?.limit === "number" && Number.isFinite(filters.limit) && filters.limit > 0
      ? Math.floor(filters.limit)
      : 50;

  const response = await fetch(
    `${url}/rest/v1/data_engine_maintenance_actions?select=*&order=created_at.desc&limit=${limit}${actionFilter}${categoryFilter}${sourceFilter}${dryRunFilter}${sinceFilter}`,
    {
      headers: buildHeaders(accessToken),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Unable to list maintenance actions: ${await parseErrorText(response)}`);
  }

  return (await response.json()) as MaintenanceActionRow[];
}

export async function finalizeImportRun(
  accessToken: string,
  runId: string,
  payload: {
    status: "completed" | "failed";
    rawCount: number;
    normalizedCount: number;
    dedupedCount: number;
    rejectedCount: number;
    errorMessage?: string;
  },
): Promise<void> {
  const { url } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/data_engine_import_runs?id=eq.${runId}`, {
    method: "PATCH",
    headers: {
      ...buildHeaders(accessToken, true),
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      status: payload.status,
      raw_count: payload.rawCount,
      normalized_count: payload.normalizedCount,
      deduped_count: payload.dedupedCount,
      rejected_count: payload.rejectedCount,
      error_message: payload.errorMessage ?? null,
      finished_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Unable to finalize import run: ${await parseErrorText(response)}`);
  }
}

export async function insertStagedNormalized(
  accessToken: string,
  runId: string,
  destinationIdBySlug: Record<string, string>,
  rows: NormalizedRecord[],
): Promise<number> {
  if (rows.length === 0) {
    return 0;
  }

  const { url } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/data_engine_staged_records`, {
    method: "POST",
    headers: {
      ...buildHeaders(accessToken, true),
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify(
      rows
        .map((row) => {
          const destinationId = destinationIdBySlug[row.destinationSlug];
          if (!destinationId) {
            return null;
          }

          return {
            run_id: runId,
            destination_id: destinationId,
            destination_slug: row.destinationSlug,
            category_key: row.categoryKey,
            source_key: row.sourceKey,
            source_record_id: row.sourceRecordId,
            observed_at: row.observedAt,
            normalized_at: row.normalizedAt,
            confidence_level: row.confidenceLevel,
            payload: row.payload,
            dedupe_key: row.dedupeKey,
            record_hash: row.recordHash,
            review_status: "pending",
          };
        })
        .filter((row) => row !== null),
    ),
  });

  if (!response.ok) {
    throw new Error(`Unable to insert staged records: ${await parseErrorText(response)}`);
  }

  const inserted = (await response.json()) as Array<{ id: string }>;
  return inserted.length;
}

export async function listRunStagedRecords(
  accessToken: string,
  runId: string,
): Promise<EngineImportRow[]> {
  const { url } = getSupabaseConfig();
  const response = await fetch(
    `${url}/rest/v1/data_engine_staged_records?select=*&run_id=eq.${runId}&order=destination_slug.asc,category_key.asc,observed_at.desc`,
    {
      headers: buildHeaders(accessToken),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Unable to load staged records for run: ${await parseErrorText(response)}`);
  }

  return (await response.json()) as EngineImportRow[];
}

export async function listPendingStagedRecords(
  accessToken: string,
  limit = 200,
  categoryKey?: DataCategoryKey,
): Promise<EngineImportRow[]> {
  const { url } = getSupabaseConfig();
  const categoryFilter = categoryKey ? `&category_key=eq.${encodeURIComponent(categoryKey)}` : "";
  const response = await fetch(
    `${url}/rest/v1/data_engine_staged_records?select=*&review_status=eq.pending${categoryFilter}&order=created_at.asc&limit=${limit}`,
    {
      headers: buildHeaders(accessToken),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Unable to load pending staged records: ${await parseErrorText(response)}`);
  }

  return (await response.json()) as EngineImportRow[];
}

export async function patchReviewStatus(
  accessToken: string,
  recordIds: string[],
  status: ReviewStatus,
  reviewerId: string,
  notes?: string,
): Promise<number> {
  if (recordIds.length === 0) {
    return 0;
  }

  const { url } = getSupabaseConfig();
  const response = await fetch(
    `${url}/rest/v1/data_engine_staged_records?id=in.(${recordIds.join(",")})`,
    {
      method: "PATCH",
      headers: {
        ...buildHeaders(accessToken, true),
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        review_status: status,
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
        review_notes: notes ?? null,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Unable to patch review status: ${await parseErrorText(response)}`);
  }

  const rows = (await response.json()) as Array<{ id: string }>;
  return rows.length;
}

export async function listApprovedForPublish(
  accessToken: string,
  categoryKey: DataCategoryKey,
  runId?: string,
): Promise<EngineImportRow[]> {
  const { url } = getSupabaseConfig();
  const runFilter = runId ? `&run_id=eq.${runId}` : "";
  const response = await fetch(
    `${url}/rest/v1/data_engine_staged_records?select=*&review_status=eq.approved&category_key=eq.${encodeURIComponent(categoryKey)}${runFilter}&order=destination_slug.asc,observed_at.desc`,
    {
      headers: buildHeaders(accessToken),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Unable to list approved staged rows: ${await parseErrorText(response)}`);
  }

  return (await response.json()) as EngineImportRow[];
}

export async function replaceDatasetRows(
  accessToken: string,
  destinationId: string,
  table: string,
  rows: Array<Record<string, unknown>>,
): Promise<void> {
  const { url } = getSupabaseConfig();

  const deleteResponse = await fetch(`${url}/rest/v1/${table}?destination_id=eq.${destinationId}`, {
    method: "DELETE",
    headers: {
      ...buildHeaders(accessToken),
      Prefer: "return=minimal",
    },
  });

  if (!deleteResponse.ok) {
    throw new Error(`Unable to clear ${table}: ${await parseErrorText(deleteResponse)}`);
  }

  if (rows.length === 0) {
    return;
  }

  const insertResponse = await fetch(`${url}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      ...buildHeaders(accessToken, true),
      Prefer: "return=minimal",
    },
    body: JSON.stringify(rows),
  });

  if (!insertResponse.ok) {
    throw new Error(`Unable to insert ${table}: ${await parseErrorText(insertResponse)}`);
  }
}

export async function replaceDatasetRowsByCategory(
  accessToken: string,
  destinationId: string,
  table: string,
  category: string,
  rows: Array<Record<string, unknown>>,
): Promise<void> {
  const { url } = getSupabaseConfig();

  const deleteResponse = await fetch(
    `${url}/rest/v1/${table}?destination_id=eq.${destinationId}&category=eq.${encodeURIComponent(category)}`,
    {
      method: "DELETE",
      headers: {
        ...buildHeaders(accessToken),
        Prefer: "return=minimal",
      },
    },
  );

  if (!deleteResponse.ok) {
    throw new Error(`Unable to clear ${table} category ${category}: ${await parseErrorText(deleteResponse)}`);
  }

  if (rows.length === 0) {
    return;
  }

  const insertResponse = await fetch(`${url}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      ...buildHeaders(accessToken, true),
      Prefer: "return=minimal",
    },
    body: JSON.stringify(rows),
  });

  if (!insertResponse.ok) {
    throw new Error(`Unable to insert ${table} category ${category}: ${await parseErrorText(insertResponse)}`);
  }
}

export async function createPublishRun(
  accessToken: string,
  payload: {
    categoryKey: DataCategoryKey;
    runId: string | null;
    triggeredBy: string;
    publishedCount: number;
  },
): Promise<string> {
  const { url } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/data_engine_publish_runs`, {
    method: "POST",
    headers: {
      ...buildHeaders(accessToken, true),
      Prefer: "return=representation",
    },
    body: JSON.stringify([
      {
        category_key: payload.categoryKey,
        import_run_id: payload.runId,
        status: "running",
        triggered_by: payload.triggeredBy,
        started_at: new Date().toISOString(),
        published_count: payload.publishedCount,
      },
    ]),
  });

  if (!response.ok) {
    throw new Error(`Unable to create publish run: ${await parseErrorText(response)}`);
  }

  const rows = (await response.json()) as Array<{ id: string }>;
  if (!rows[0]?.id) {
    throw new Error("Publish run insert returned no id.");
  }

  return rows[0].id;
}

export async function finalizePublishRun(
  accessToken: string,
  publishRunId: string,
  payload: {
    status: "completed" | "failed";
    publishedCount: number;
    errorMessage?: string;
  },
): Promise<void> {
  const { url } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/data_engine_publish_runs?id=eq.${publishRunId}`, {
    method: "PATCH",
    headers: {
      ...buildHeaders(accessToken, true),
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      status: payload.status,
      finished_at: new Date().toISOString(),
      published_count: payload.publishedCount,
      error_message: payload.errorMessage ?? null,
    }),
  });

  if (!response.ok) {
    throw new Error(`Unable to finalize publish run: ${await parseErrorText(response)}`);
  }
}

export async function insertErrorLog(
  accessToken: string,
  payload: {
    runId?: string;
    publishRunId?: string;
    categoryKey?: string;
    sourceKey?: string;
    destinationSlug?: string;
    errorCode: string;
    errorMessage: string;
    details?: Record<string, unknown>;
  },
): Promise<void> {
  const { url } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/data_engine_error_logs`, {
    method: "POST",
    headers: {
      ...buildHeaders(accessToken, true),
      Prefer: "return=minimal",
    },
    body: JSON.stringify([
      {
        run_id: payload.runId ?? null,
        publish_run_id: payload.publishRunId ?? null,
        category_key: payload.categoryKey ?? null,
        source_key: payload.sourceKey ?? null,
        destination_slug: payload.destinationSlug ?? null,
        error_code: payload.errorCode,
        error_message: payload.errorMessage,
        details: payload.details ?? {},
      },
    ]),
  });

  if (!response.ok) {
    throw new Error(`Unable to insert error log: ${await parseErrorText(response)}`);
  }
}
