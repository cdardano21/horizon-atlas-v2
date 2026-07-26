export type CommandCenterDatasetKey =
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

const FORM_DATASETS: CommandCenterDatasetKey[] = ["destination_core_metrics", "destination_scores"];
const CORE_METRIC_NUMERIC_FIELDS = new Set(["value_numeric"]);
const SCORECARD_NUMERIC_FIELDS = new Set(["score", "personalized_weight", "sort_order"]);

export const isCommandCenterFormDataset = (dataset: CommandCenterDatasetKey): boolean =>
  FORM_DATASETS.includes(dataset);

export const parseCommandCenterRowsDraft = (draft: string): Array<Record<string, unknown>> | null => {
  try {
    const parsed = JSON.parse(draft) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed.filter((row) => typeof row === "object" && row !== null && !Array.isArray(row)) as Array<Record<string, unknown>>;
  } catch {
    return null;
  }
};

export const appendFormRow = (
  rows: Array<Record<string, unknown>>,
  dataset: CommandCenterDatasetKey,
): Array<Record<string, unknown>> => {
  if (dataset === "destination_core_metrics") {
    return [
      ...rows,
      {
        metric_group: "",
        metric_key: "",
        metric_label: "",
        value_text: "",
        unit: "",
        display_value: "",
        verification_status: "in_progress",
        confidence_level: "low",
      },
    ];
  }

  if (dataset === "destination_scores") {
    return [
      ...rows,
      {
        category: "",
        score: null,
        explanation: "",
        underlying_measurements: "",
        personalized_weight: null,
        sort_order: rows.length,
        verification_status: "in_progress",
        confidence_level: "low",
      },
    ];
  }

  return rows;
};

export const removeFormRow = (
  rows: Array<Record<string, unknown>>,
  index: number,
): Array<Record<string, unknown>> => rows.filter((_, rowIndex) => rowIndex !== index);

export const updateFormRowField = (
  rows: Array<Record<string, unknown>>,
  dataset: CommandCenterDatasetKey,
  index: number,
  field: string,
  value: string,
): Array<Record<string, unknown>> => {
  const nextRows = [...rows];
  const existingRow = nextRows[index] ?? {};
  const numericFields = dataset === "destination_core_metrics" ? CORE_METRIC_NUMERIC_FIELDS : SCORECARD_NUMERIC_FIELDS;
  let nextValue: unknown = value;

  if (numericFields.has(field)) {
    if (value.trim() === "") {
      nextValue = null;
    } else {
      const parsed = Number(value);
      nextValue = Number.isFinite(parsed) ? parsed : null;
    }
  }

  nextRows[index] = {
    ...existingRow,
    [field]: nextValue,
  };

  return nextRows;
};