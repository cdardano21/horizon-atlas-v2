import { cookies } from "next/headers";
import * as supabase from "../../../../../../lib/supabase";
import {
  loadAdminFallbackDataset,
  saveAdminFallbackDataset,
  shouldUseAdminLocalFallback,
} from "../../../../../../lib/admin-local-fallback";

type AuthUser = {
  id: string;
};

type DatasetConfig = {
  table: string;
  orderBy: string;
};

type DatasetKey =
  | "destination_core_metrics"
  | "destination_scores"
  | "destination_score_factors"
  | "monthly_climate"
  | "cost_of_living_items"
  | "housing_market_metrics"
  | "neighborhoods"
  | "healthcare_facilities"
  | "healthcare_services"
  | "airports"
  | "transportation_options"
  | "golf_courses"
  | "recreation_facilities"
  | "beaches"
  | "restaurants_or_food_metrics"
  | "schools"
  | "internet_metrics"
  | "visa_programs"
  | "tax_rules"
  | "safety_metrics"
  | "destination_pros_cons"
  | "destination_media"
  | "destination_resources"
  | "data_sources"
  | "data_verification_records";

const DATASET_CONFIG: Record<DatasetKey, DatasetConfig> = {
  destination_core_metrics: { table: "destination_core_metrics", orderBy: "metric_group.asc,metric_label.asc" },
  destination_scores: { table: "destination_scores", orderBy: "sort_order.asc,category.asc" },
  destination_score_factors: { table: "destination_score_factors", orderBy: "score_category.asc,factor_label.asc" },
  monthly_climate: { table: "monthly_climate", orderBy: "month_index.asc" },
  cost_of_living_items: { table: "cost_of_living_items", orderBy: "sort_order.asc,item_label.asc" },
  housing_market_metrics: { table: "housing_market_metrics", orderBy: "sort_order.asc,metric_label.asc" },
  neighborhoods: { table: "neighborhoods", orderBy: "sort_order.asc,name.asc" },
  healthcare_facilities: { table: "healthcare_facilities", orderBy: "sort_order.asc,name.asc" },
  healthcare_services: { table: "healthcare_services", orderBy: "service_name.asc" },
  airports: { table: "airports", orderBy: "sort_order.asc,name.asc" },
  transportation_options: { table: "transportation_options", orderBy: "sort_order.asc,option_name.asc" },
  golf_courses: { table: "golf_courses", orderBy: "sort_order.asc,name.asc" },
  recreation_facilities: { table: "recreation_facilities", orderBy: "sort_order.asc,name.asc" },
  beaches: { table: "beaches", orderBy: "sort_order.asc,name.asc" },
  restaurants_or_food_metrics: { table: "restaurants_or_food_metrics", orderBy: "sort_order.asc,metric_label.asc" },
  schools: { table: "schools", orderBy: "sort_order.asc,name.asc" },
  internet_metrics: { table: "internet_metrics", orderBy: "sort_order.asc,metric_label.asc" },
  visa_programs: { table: "visa_programs", orderBy: "sort_order.asc,name.asc" },
  tax_rules: { table: "tax_rules", orderBy: "sort_order.asc,name.asc" },
  safety_metrics: { table: "safety_metrics", orderBy: "sort_order.asc,metric_label.asc" },
  destination_pros_cons: { table: "destination_pros_cons", orderBy: "kind.asc,sort_order.asc" },
  destination_media: { table: "destination_media", orderBy: "media_type.asc,sort_order.asc" },
  destination_resources: { table: "destination_resources", orderBy: "category.asc,sort_order.asc,title.asc" },
  data_sources: { table: "data_sources", orderBy: "category.asc,source_name.asc" },
  data_verification_records: { table: "data_verification_records", orderBy: "dataset_key.asc" },
};

const MUTABLE_SYSTEM_COLUMNS = new Set(["id", "created_at", "updated_at", "destination_id"]);

function isDatasetKey(value: string): value is DatasetKey {
  return Object.hasOwn(DATASET_CONFIG, value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sanitizeRowsForWrite(rows: unknown[], destinationId: string) {
  return rows
    .filter((row) => isRecord(row))
    .map((row) => {
      const sanitized: Record<string, unknown> = { destination_id: destinationId };
      for (const [key, value] of Object.entries(row)) {
        if (!MUTABLE_SYSTEM_COLUMNS.has(key)) {
          sanitized[key] = value;
        }
      }
      return sanitized;
    });
}

function getSupabaseExport<T>(name: string): T | undefined {
  return Object.prototype.hasOwnProperty.call(supabase, name) ? (supabase as Record<string, unknown>)[name] as T : undefined;
}

function getSupabaseConfigOrNull() {
  const getter = getSupabaseExport<() => { url: string; anonKey: string }>("getSupabaseConfig");
  if (typeof getter !== "function") {
    return null;
  }

  try {
    return getter();
  } catch {
    return null;
  }
}

function getServiceRoleKeyOrNull() {
  const getter = getSupabaseExport<() => string | undefined>("getSupabaseServiceRoleKey");
  if (typeof getter !== "function") {
    return null;
  }

  const serviceRoleKey = getter();
  return typeof serviceRoleKey === "string" && serviceRoleKey.trim() ? serviceRoleKey : null;
}

async function getAuthedAdmin() {
  const isConfigured = getSupabaseExport<() => boolean>("isSupabaseConfigured");
  if (typeof isConfigured !== "function" || !isConfigured()) {
    return { accessToken: null, user: null, adminRole: null };
  }

  const serviceRoleKey = getServiceRoleKeyOrNull();
  if (serviceRoleKey) {
    return { accessToken: serviceRoleKey, user: { id: "service-role" }, adminRole: "admin" };
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("ha-access-token")?.value;
  if (!accessToken) {
    return { accessToken: null, user: null, adminRole: null };
  }

  const config = getSupabaseConfigOrNull();
  if (!config) {
    return { accessToken: null, user: null, adminRole: null };
  }

  const { url, anonKey } = config;
  const userResponse = await fetch(`${url}/auth/v1/user`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!userResponse.ok) {
    return { accessToken: null, user: null, adminRole: null };
  }

  const user = (await userResponse.json()) as AuthUser;
  const adminResponse = await fetch(
    `${url}/rest/v1/app_admins?select=role&user_id=eq.${user.id}&limit=1`,
    {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    },
  );

  const adminRows = adminResponse.ok ? ((await adminResponse.json()) as Array<{ role: string }>) : [];
  return { accessToken, user, adminRole: adminRows[0]?.role ?? null };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ destinationId: string; dataset: string }> },
) {
  try {
    const { destinationId, dataset } = await context.params;
    if (!isDatasetKey(dataset)) {
      return Response.json({ error: "Unsupported dataset." }, { status: 400 });
    }

    const { accessToken, user, adminRole } = await getAuthedAdmin();
    if (shouldUseAdminLocalFallback(accessToken, user, adminRole)) {
      return Response.json({ dataset, rows: loadAdminFallbackDataset(destinationId, dataset) }, { status: 200 });
    }

    if (!accessToken || !user || !adminRole) {
      return Response.json({ error: "Admin access required." }, { status: 403 });
    }

    const { table, orderBy } = DATASET_CONFIG[dataset];
    const config = getSupabaseConfigOrNull();
    if (!config) {
      return Response.json({ error: "Supabase is not configured." }, { status: 500 });
    }

    const { url, anonKey } = config;
    const response = await fetch(
      `${url}/rest/v1/${table}?select=*&destination_id=eq.${destinationId}&order=${orderBy}`,
      {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return Response.json({ error: `Unable to load ${dataset}.` }, { status: response.status });
    }

    const rows = (await response.json()) as Array<Record<string, unknown>>;
    return Response.json({ dataset, rows }, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to load command center dataset." },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ destinationId: string; dataset: string }> },
) {
  try {
    const { destinationId, dataset } = await context.params;
    if (!isDatasetKey(dataset)) {
      return Response.json({ error: "Unsupported dataset." }, { status: 400 });
    }

    const { accessToken, user, adminRole } = await getAuthedAdmin();
    if (shouldUseAdminLocalFallback(accessToken, user, adminRole)) {
      const payload = (await request.json()) as { rows?: unknown };
      if (!Array.isArray(payload.rows)) {
        return Response.json({ error: "rows must be an array." }, { status: 400 });
      }
      saveAdminFallbackDataset(destinationId, dataset, payload.rows);
      return Response.json({ success: true, dataset, count: payload.rows.length }, { status: 200 });
    }

    if (!accessToken || !user || !adminRole) {
      return Response.json({ error: "Admin access required." }, { status: 403 });
    }

    const payload = (await request.json()) as { rows?: unknown };
    if (!Array.isArray(payload.rows)) {
      return Response.json({ error: "rows must be an array." }, { status: 400 });
    }

    const { table } = DATASET_CONFIG[dataset];
    const rowsForWrite = sanitizeRowsForWrite(payload.rows, destinationId);
    const config = getSupabaseConfigOrNull();
    if (!config) {
      return Response.json({ error: "Supabase is not configured." }, { status: 500 });
    }

    const { url, anonKey } = config;

    const deleteResponse = await fetch(`${url}/rest/v1/${table}?destination_id=eq.${destinationId}`, {
      method: "DELETE",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
        Prefer: "return=minimal",
      },
    });

    if (!deleteResponse.ok) {
      const details = await deleteResponse.text();
      return Response.json({ error: `Unable to clear ${dataset}.`, details }, { status: deleteResponse.status });
    }

    if (rowsForWrite.length === 0) {
      return Response.json({ success: true, dataset, count: 0 }, { status: 200 });
    }

    const insertResponse = await fetch(`${url}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(rowsForWrite),
    });

    if (!insertResponse.ok) {
      const details = await insertResponse.text();
      return Response.json({ error: `Unable to save ${dataset}.`, details }, { status: insertResponse.status });
    }

    const insertedRows = (await insertResponse.json()) as Array<Record<string, unknown>>;
    return Response.json({ success: true, dataset, count: insertedRows.length }, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to save command center dataset." },
      { status: 500 },
    );
  }
}
