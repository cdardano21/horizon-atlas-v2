"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import type {
  DestinationEditorialContent,
  DestinationMemberDetails,
  DestinationRelocationProfile,
  DestinationResearchProfile,
} from "../lib/destinations";
import {
  appendFormRow,
  isCommandCenterFormDataset,
  parseCommandCenterRowsDraft,
  removeFormRow,
  type CommandCenterDatasetKey,
  updateFormRowField,
} from "./commandCenterFormUtils";
import { buildEditorFormFromDestination, filterDestinationsByCatalog, getDestinationWorkflowState, normalizeDestinationIdentity, normalizeDestinationStatus, upsertItemById } from "./adminCatalogManagerUtils";
import { buildDashboardMetrics, createSlug, filterAdminDestinations, type AdminCmsCategory, type AdminCmsMediaAsset, type AdminCmsSearchFilter, type AdminCmsTag } from "./adminCmsUtils";
import { parseBatchImportFile } from "./batchImportFileUtils";

type AdminDestination = {
  id: string;
  slug: string;
  city: string;
  country: string;
  status: "draft" | "review" | "published" | "archived";
  tier: string;
  description: string | null;
  overview: string | null;
  updated_at: string;
  mediaCount: number;
  resourceCount: number;
  videoCount: number;
  relocationProfile?: DestinationRelocationProfile | null;
  memberDetails?: DestinationMemberDetails | null;
  editorialContent?: DestinationEditorialContent | null;
  researchProfile?: DestinationResearchProfile | null;
};

type DestinationPayload = {
  city: string;
  country: string;
  slug: string;
  status: "draft" | "review" | "published" | "archived";
  tier: string;
};

type DestinationEditorPayload = DestinationPayload & {
  description: string;
  overview: string;
};

type AssetPayload = {
  destinationId: string;
  assetType: "media" | "resource" | "video";
  label: string;
  url: string;
  provider: string;
  category: string;
  kind: string;
};

type LinkedAsset = {
  id: string;
  assetType: "media" | "resource" | "video";
  label: string;
  url: string;
  provider: string;
  category: string;
  kind: string;
  embedUrl: string;
};

type CommandCenterDatasetOption = {
  key: CommandCenterDatasetKey;
  label: string;
};

type CommandCenterDatasetGuide = {
  requiredFields: string[];
  optionalFields: string[];
  sampleRow: Record<string, unknown>;
};

const EMPTY_DESTINATION_FORM: DestinationPayload = {
  city: "",
  country: "",
  slug: "",
  status: "draft",
  tier: "launch",
};

const EMPTY_EDITOR_FORM: DestinationEditorPayload = {
  city: "",
  country: "",
  slug: "",
  status: "draft",
  tier: "launch",
  description: "",
  overview: "",
};

const EMPTY_ASSET_FORM: AssetPayload = {
  destinationId: "",
  assetType: "resource",
  label: "",
  url: "",
  provider: "manual",
  category: "guides",
  kind: "gallery",
};

type BatchImportPlanEntry = {
  rowNumber: number;
  action: "create" | "update" | "reject" | "skip";
  reason?: string;
  slug: string;
  city: string;
  country: string;
  status?: string;
  tier?: string;
  description?: string;
  overview?: string;
  existingId?: string;
  existingSlug?: string;
  warnings?: string[];
  errors?: string[];
  suggestedFix?: string;
  fieldChanges?: Array<{ field: string; currentValue?: string; newValue?: string; changed: boolean }>;
  currentValues?: Record<string, string>;
  newValues?: Record<string, string>;
};

type BatchImportSummary = {
  totalRows: number;
  create: number;
  update: number;
  reject: number;
  skip: number;
  warnings: number;
  errors: number;
};

const parseCsvLine = (line: string) => {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (character === "," && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }

    current += character;
  }

  cells.push(current);
  return cells.map((cell) => cell.trim());
};

const parseCsvText = (text: string) => {
  const rows = text
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (rows.length === 0) {
    return [];
  }

  const headers = parseCsvLine(rows[0]);
  return rows.slice(1).map((row) => {
    const values = parseCsvLine(row);
    return headers.reduce<Record<string, unknown>>((accumulator, header, index) => {
      accumulator[header] = values[index] ?? "";
      return accumulator;
    }, {});
  });
};

const COMMAND_CENTER_DATASETS: CommandCenterDatasetOption[] = [
  { key: "destination_core_metrics", label: "Core metrics" },
  { key: "destination_scores", label: "Scorecard" },
  { key: "destination_score_factors", label: "Score factors" },
  { key: "monthly_climate", label: "Monthly climate" },
  { key: "cost_of_living_items", label: "Cost of living" },
  { key: "housing_market_metrics", label: "Housing metrics" },
  { key: "neighborhoods", label: "Neighborhoods" },
  { key: "healthcare_facilities", label: "Healthcare facilities" },
  { key: "healthcare_services", label: "Healthcare services" },
  { key: "airports", label: "Airports" },
  { key: "transportation_options", label: "Transportation options" },
  { key: "golf_courses", label: "Golf courses" },
  { key: "recreation_facilities", label: "Recreation facilities" },
  { key: "beaches", label: "Beaches" },
  { key: "restaurants_or_food_metrics", label: "Food metrics" },
  { key: "schools", label: "Schools" },
  { key: "internet_metrics", label: "Internet metrics" },
  { key: "visa_programs", label: "Visa programs" },
  { key: "tax_rules", label: "Tax rules" },
  { key: "safety_metrics", label: "Safety metrics" },
  { key: "destination_pros_cons", label: "Pros and tradeoffs" },
  { key: "destination_media", label: "Command center media" },
  { key: "destination_resources", label: "Command center resources" },
  { key: "data_sources", label: "Source ledger" },
  { key: "data_verification_records", label: "Verification records" },
];

const COMMAND_CENTER_DATASET_GUIDES: Record<CommandCenterDatasetKey, CommandCenterDatasetGuide> = {
  destination_core_metrics: {
    requiredFields: ["metric_key", "metric_label"],
    optionalFields: ["metric_group", "value_numeric", "value_text", "unit", "display_value", "verification_status", "confidence_level", "last_verified_at", "source_url"],
    sampleRow: {
      metric_group: "cost",
      metric_key: "monthly_budget_single",
      metric_label: "Monthly budget (single)",
      display_value: "$2,600",
      verification_status: "estimated",
      confidence_level: "medium",
    },
  },
  destination_scores: {
    requiredFields: ["category"],
    optionalFields: ["score", "explanation", "underlying_measurements", "personalized_weight", "sort_order", "verification_status", "confidence_level"],
    sampleRow: {
      category: "Safety",
      score: 88,
      explanation: "Low violent crime in target neighborhoods.",
      sort_order: 10,
      verification_status: "verified",
      confidence_level: "high",
    },
  },
  destination_score_factors: {
    requiredFields: ["score_category", "factor_key", "factor_label"],
    optionalFields: ["factor_value", "factor_weight", "factor_note", "verification_status", "confidence_level"],
    sampleRow: {
      score_category: "Safety",
      factor_key: "violent_crime_rate",
      factor_label: "Violent crime rate",
      factor_value: "Below national urban benchmark",
      factor_weight: 0.45,
    },
  },
  monthly_climate: {
    requiredFields: ["month_index", "month_name"],
    optionalFields: ["avg_high_c", "avg_low_c", "rainfall_mm", "rainy_days", "humidity_pct", "sunshine_hours", "uv_index", "sea_temp_c", "verification_status", "confidence_level"],
    sampleRow: {
      month_index: 1,
      month_name: "January",
      avg_high_c: 18,
      avg_low_c: 10,
      rainfall_mm: 34,
      sunshine_hours: 165,
      verification_status: "verified",
      confidence_level: "high",
    },
  },
  cost_of_living_items: {
    requiredFields: ["item_key", "item_label"],
    optionalFields: ["metric_group", "value_numeric", "value_text", "unit", "display_value", "sort_order", "verification_status", "confidence_level"],
    sampleRow: {
      item_key: "groceries_index",
      item_label: "Groceries index",
      metric_group: "daily_life",
      value_numeric: 92,
      sort_order: 20,
    },
  },
  housing_market_metrics: {
    requiredFields: ["metric_key", "metric_label"],
    optionalFields: ["value_numeric", "value_text", "unit", "display_value", "sort_order", "verification_status", "confidence_level"],
    sampleRow: {
      metric_key: "rent_1br_center",
      metric_label: "1BR rent (city center)",
      display_value: "$1,250",
      sort_order: 10,
    },
  },
  neighborhoods: {
    requiredFields: ["name"],
    optionalFields: ["subtitle", "value_1", "value_2", "value_3", "url", "latitude", "longitude", "sort_order", "verification_status", "confidence_level"],
    sampleRow: {
      name: "Old Town",
      subtitle: "Walkable central district",
      value_1: "Rent: $1,300-$1,700",
      value_2: "Walkability: high",
      sort_order: 10,
    },
  },
  healthcare_facilities: {
    requiredFields: ["name"],
    optionalFields: ["subtitle", "value_1", "value_2", "value_3", "url", "sort_order", "verification_status", "confidence_level"],
    sampleRow: {
      name: "Central General Hospital",
      subtitle: "Public tertiary care",
      value_1: "Emergency: 24/7",
      sort_order: 10,
    },
  },
  healthcare_services: {
    requiredFields: ["service_name"],
    optionalFields: ["availability", "notes", "verification_status", "confidence_level"],
    sampleRow: {
      service_name: "Cardiology",
      availability: "Available",
      notes: "Public and private options",
    },
  },
  airports: {
    requiredFields: ["name"],
    optionalFields: ["subtitle", "value_1", "value_2", "value_3", "url", "sort_order", "verification_status", "confidence_level"],
    sampleRow: {
      name: "International Airport",
      subtitle: "Primary hub",
      value_1: "Drive: 28 min",
      sort_order: 10,
    },
  },
  transportation_options: {
    requiredFields: ["option_name"],
    optionalFields: ["details", "sort_order", "verification_status", "confidence_level"],
    sampleRow: {
      option_name: "Metro",
      details: "Expanded city coverage with late service",
      sort_order: 10,
    },
  },
  golf_courses: {
    requiredFields: ["name"],
    optionalFields: ["subtitle", "value_1", "value_2", "value_3", "url", "sort_order", "verification_status", "confidence_level"],
    sampleRow: {
      name: "Seaside Golf Club",
      subtitle: "18-hole public course",
      value_1: "Green fee: $85",
      sort_order: 10,
    },
  },
  recreation_facilities: {
    requiredFields: ["name"],
    optionalFields: ["subtitle", "value_1", "value_2", "value_3", "url", "sort_order", "verification_status", "confidence_level"],
    sampleRow: {
      name: "Riverfront Park",
      subtitle: "Trails and courts",
      value_1: "Pickleball: 8 courts",
      sort_order: 10,
    },
  },
  beaches: {
    requiredFields: ["name"],
    optionalFields: ["subtitle", "value_1", "value_2", "value_3", "url", "sort_order", "verification_status", "confidence_level"],
    sampleRow: {
      name: "South Beach",
      subtitle: "Blue Flag certified",
      value_1: "Drive: 12 min",
      sort_order: 10,
    },
  },
  restaurants_or_food_metrics: {
    requiredFields: ["metric_key", "metric_label"],
    optionalFields: ["value_numeric", "value_text", "unit", "display_value", "sort_order", "verification_status", "confidence_level"],
    sampleRow: {
      metric_key: "restaurants_per_100k",
      metric_label: "Restaurants per 100k",
      value_numeric: 345,
      sort_order: 10,
    },
  },
  schools: {
    requiredFields: ["name"],
    optionalFields: ["subtitle", "value_1", "value_2", "value_3", "url", "sort_order", "verification_status", "confidence_level"],
    sampleRow: {
      name: "International Academy",
      subtitle: "English curriculum",
      value_1: "K-12",
      sort_order: 10,
    },
  },
  internet_metrics: {
    requiredFields: ["metric_key", "metric_label"],
    optionalFields: ["metric_group", "value_numeric", "value_text", "unit", "display_value", "sort_order", "verification_status", "confidence_level"],
    sampleRow: {
      metric_group: "speed",
      metric_key: "median_download_mbps",
      metric_label: "Median download speed",
      value_numeric: 178,
      unit: "Mbps",
    },
  },
  visa_programs: {
    requiredFields: ["name"],
    optionalFields: ["subtitle", "value_1", "value_2", "value_3", "url", "sort_order", "verification_status", "confidence_level"],
    sampleRow: {
      name: "Retirement Visa",
      subtitle: "Long-stay residency route",
      value_1: "Minimum income: verify current policy",
      sort_order: 10,
    },
  },
  tax_rules: {
    requiredFields: ["name"],
    optionalFields: ["subtitle", "value_1", "value_2", "value_3", "url", "sort_order", "verification_status", "confidence_level"],
    sampleRow: {
      name: "Foreign pension taxation",
      subtitle: "National policy overview",
      value_1: "Confirm with tax advisor",
      sort_order: 10,
    },
  },
  safety_metrics: {
    requiredFields: ["metric_key", "metric_label"],
    optionalFields: ["value_numeric", "value_text", "unit", "display_value", "sort_order", "verification_status", "confidence_level"],
    sampleRow: {
      metric_key: "safety_index",
      metric_label: "Safety index",
      value_numeric: 71,
      sort_order: 10,
    },
  },
  destination_pros_cons: {
    requiredFields: ["kind", "statement"],
    optionalFields: ["evidence_ref", "sort_order", "verification_status", "confidence_level"],
    sampleRow: {
      kind: "pro",
      statement: "Strong healthcare depth for long-term planning.",
      sort_order: 10,
    },
  },
  destination_media: {
    requiredFields: ["media_type", "url"],
    optionalFields: ["title", "description", "source_type", "sort_order", "verification_status", "confidence_level"],
    sampleRow: {
      media_type: "map",
      title: "City map overview",
      url: "https://www.google.com/maps/...",
      sort_order: 10,
    },
  },
  destination_resources: {
    requiredFields: ["category", "title", "url"],
    optionalFields: ["description", "source_type", "sort_order", "verification_status", "confidence_level"],
    sampleRow: {
      category: "government",
      title: "Official residency portal",
      url: "https://example.gov/residency",
      sort_order: 10,
    },
  },
  data_sources: {
    requiredFields: ["category", "source_name"],
    optionalFields: ["source_url", "source_organization", "source_type", "notes"],
    sampleRow: {
      category: "cost",
      source_name: "National Statistics Office",
      source_url: "https://example.gov/statistics",
      source_type: "government",
    },
  },
  data_verification_records: {
    requiredFields: ["dataset_key"],
    optionalFields: ["verification_status", "confidence_level", "source_url", "source_organization", "source_type", "last_verified_at", "effective_at", "notes"],
    sampleRow: {
      dataset_key: "monthly_climate",
      verification_status: "verified",
      confidence_level: "high",
      last_verified_at: "2026-07-01T00:00:00.000Z",
    },
  },
};

const RELOCATION_PROFILE_TEMPLATE: DestinationRelocationProfile = {
  aiSummary: "",
  livingHereScorecard: [
    { category: "Overall Match", score: 90, context: "Weighted by DestinationFinderAI relocation model." },
    { category: "Safety", score: 90, context: "Adjust after district-level review." },
    { category: "Healthcare", score: 90, context: "Update after hospital and specialist validation." },
  ],
  comprehensiveSections: [
    {
      title: "General",
      summary: "Core orientation metrics.",
      items: [
        { label: "Country", value: "" },
        { label: "Region", value: "" },
        { label: "Language(s)", value: "" },
      ],
    },
    {
      title: "Cost of Living",
      summary: "Planning budgets and practical spend benchmarks.",
      items: [
        { label: "Estimated monthly budget", value: "" },
        { label: "Couple budget", value: "" },
        { label: "Family budget", value: "" },
      ],
    },
  ],
};

const normalizeRelocationProfile = (value: DestinationRelocationProfile): DestinationRelocationProfile => ({
  aiSummary: typeof value.aiSummary === "string" ? value.aiSummary : "",
  livingHereScorecard: Array.isArray(value.livingHereScorecard)
    ? value.livingHereScorecard
      .filter((item) => item && typeof item.category === "string")
      .map((item) => ({
        category: item.category,
        score: typeof item.score === "number" ? item.score : 85,
        context: typeof item.context === "string" ? item.context : "",
      }))
    : [],
  comprehensiveSections: Array.isArray(value.comprehensiveSections)
    ? value.comprehensiveSections
      .filter((section) => section && typeof section.title === "string")
      .map((section) => ({
        title: section.title,
        summary: typeof section.summary === "string" ? section.summary : "",
        items: Array.isArray(section.items)
          ? section.items
            .filter((item) => item && typeof item.label === "string")
            .map((item) => ({
              label: item.label,
              value: typeof item.value === "string" ? item.value : "",
              note: typeof item.note === "string" ? item.note : "",
            }))
          : [],
      }))
    : [],
});

const REQUIRED_SCORECARD_CATEGORIES = [
  "overall match",
  "safety",
  "healthcare",
  "cost of living",
  "weather",
  "internet",
  "retirement friendly",
];

type CoverageRequirement = {
  key: string;
  label: string;
  scorecardCategories?: string[];
  sectionTitles?: string[];
  requireAiSummary?: boolean;
};

const COVERAGE_REQUIREMENTS: CoverageRequirement[] = [
  {
    key: "general",
    label: "General",
    scorecardCategories: ["overall match", "safety"],
    sectionTitles: ["general"],
    requireAiSummary: true,
  },
  {
    key: "cost",
    label: "Cost of Living",
    scorecardCategories: ["cost of living"],
    sectionTitles: ["cost of living"],
  },
  {
    key: "weather",
    label: "Weather",
    scorecardCategories: ["weather"],
    sectionTitles: ["weather"],
  },
  {
    key: "healthcare",
    label: "Healthcare",
    scorecardCategories: ["healthcare"],
    sectionTitles: ["healthcare"],
  },
  {
    key: "transportation",
    label: "Transportation",
    sectionTitles: ["transportation"],
  },
  {
    key: "realestate",
    label: "Real Estate",
    sectionTitles: ["real estate"],
  },
  {
    key: "lifestyle",
    label: "Lifestyle and Recreation",
    sectionTitles: ["lifestyle and recreation"],
  },
  {
    key: "familywork",
    label: "Families, Work, and Internet",
    scorecardCategories: ["family friendly", "digital nomad", "internet"],
    sectionTitles: ["families, work, and internet"],
  },
  {
    key: "retirement",
    label: "Retirement, Neighborhoods, and Day Trips",
    scorecardCategories: ["retirement friendly"],
    sectionTitles: ["retirement, neighborhoods, and day trips"],
  },
];

type CoverageStatus = {
  key: string;
  label: string;
  covered: boolean;
  notes: string[];
};

const computeCoverage = (profile: DestinationRelocationProfile) => {
  const normalized = normalizeRelocationProfile(profile);
  const aiSummary = normalized.aiSummary?.trim() ?? "";
  const scorecardSet = new Set(
    (normalized.livingHereScorecard ?? []).map((item) => item.category.trim().toLowerCase()),
  );
  const sectionSet = new Set(
    (normalized.comprehensiveSections ?? []).map((section) => section.title.trim().toLowerCase()),
  );

  const categories: CoverageStatus[] = COVERAGE_REQUIREMENTS.map((requirement) => {
    const notes: string[] = [];

    if (requirement.requireAiSummary && aiSummary.length < 60) {
      notes.push("AI summary is missing or too short.");
    }

    for (const category of requirement.scorecardCategories ?? []) {
      if (!scorecardSet.has(category)) {
        notes.push(`Missing scorecard category: ${category}.`);
      }
    }

    for (const section of requirement.sectionTitles ?? []) {
      if (!sectionSet.has(section)) {
        notes.push(`Missing section: ${section}.`);
      }
    }

    return {
      key: requirement.key,
      label: requirement.label,
      covered: notes.length === 0,
      notes,
    };
  });

  const coveredCount = categories.filter((item) => item.covered).length;
  const readinessPercent = Math.round((coveredCount / categories.length) * 100);

  return {
    readinessPercent,
    coveredCount,
    totalCount: categories.length,
    categories,
  };
};

const validateRelocationProfile = (value: DestinationRelocationProfile): string | null => {
  const profile = normalizeRelocationProfile(value);
  const aiSummary = profile.aiSummary?.trim() ?? "";
  if (aiSummary.length < 60) {
    return "AI summary should be at least 60 characters so it reads like a real relocation advisory note.";
  }

  const scorecard = profile.livingHereScorecard ?? [];
  if (scorecard.length === 0) {
    return "Living Here Scorecard needs at least one category.";
  }

  const seen = new Set<string>();
  for (const item of scorecard) {
    const category = item.category.trim().toLowerCase();
    if (!category) return "Each scorecard row needs a category name.";
    if (seen.has(category)) return `Duplicate scorecard category found: ${item.category}.`;
    seen.add(category);
    if (typeof item.score !== "number" || Number.isNaN(item.score) || item.score < 0 || item.score > 100) {
      return `Score for ${item.category} must be between 0 and 100.`;
    }
  }

  const missingRequired = REQUIRED_SCORECARD_CATEGORIES.filter((category) => !seen.has(category));
  if (missingRequired.length > 0) {
    return `Missing required scorecard categories: ${missingRequired.join(", ")}.`;
  }

  const sections = profile.comprehensiveSections ?? [];
  if (sections.length === 0) {
    return "Add at least one comprehensive section.";
  }

  for (const section of sections) {
    if (!section.title.trim()) {
      return "Each comprehensive section requires a title.";
    }
    if (!Array.isArray(section.items) || section.items.length === 0) {
      return `Section ${section.title} needs at least one item.`;
    }
    for (const item of section.items) {
      if (!item.label.trim() || !item.value.trim()) {
        return `Section ${section.title} has an item missing label or value.`;
      }
    }
  }

  return null;
};

const buildRelocationProfileBaseline = (
  destination: AdminDestination,
  tags: string[],
): DestinationRelocationProfile => {
  const tagSet = new Set(tags.map((tag) => tag.toLowerCase()));
  const hasTag = (tag: string) => tagSet.has(tag);
  const details = destination.memberDetails;
  const hospitals = details?.hospitals?.length ?? 0;
  const airports = details?.airports?.length ?? 0;
  const restaurants = details?.amenities?.restaurants;
  const englishSchools = details?.amenities?.englishSchools;

  const score = (base: number, bonus = 0) => Math.max(55, Math.min(98, Math.round(base + bonus)));

  return {
    aiSummary: `${destination.city} is positioned as a high-confidence relocation candidate for people who value ${hasTag("walkability") ? "walkable neighborhoods" : "practical daily living"}, ${hasTag("healthcare") ? "healthcare access" : "operational stability"}, and ${hasTag("beach") || hasTag("coast") ? "coastal quality of life" : "long-term lifestyle durability"}. Use this profile as a single decision surface before spending weeks researching across separate sites.`,
    livingHereScorecard: [
      { category: "Overall Match", score: score(84, hasTag("expat-friendly") ? 6 : 0), context: "Derived from current DestinationFinderAI tags and structured signals." },
      { category: "Safety", score: score(80, hasTag("safety") ? 12 : 0), context: hasTag("safety") ? "Safety is tagged as a strength." : "Validate district-level variation." },
      { category: "Healthcare", score: score(78, (hasTag("healthcare") ? 12 : 0) + (hospitals > 0 ? 4 : 0)), context: hospitals > 0 ? `${hospitals} hospital records loaded.` : "Add hospital data for stronger confidence." },
      { category: "Cost of Living", score: score(76, hasTag("value") ? 10 : 0), context: hasTag("value") ? "Value-oriented tag in catalog." : "Cost requires neighborhood-level modeling." },
      { category: "Weather", score: score(79, hasTag("summer escape") || hasTag("beach") ? 9 : 0), context: details?.bestMonths ? `Best months: ${details.bestMonths}.` : "Add monthly climate data for deeper planning." },
      { category: "Internet", score: score(80, hasTag("expat-friendly") ? 8 : 0), context: "Confirm fiber quality in target districts." },
      { category: "Retirement Friendly", score: score(82, (hasTag("healthcare") ? 6 : 0) + (hasTag("safety") ? 4 : 0)), context: "Balanced from healthcare, safety, and value signals." },
      { category: "Family Friendly", score: score(75, typeof englishSchools === "number" ? 8 : 0), context: typeof englishSchools === "number" ? `${englishSchools} English schools tracked.` : "Add school data to improve family confidence." },
      { category: "Digital Nomad", score: score(78, (hasTag("expat-friendly") ? 8 : 0) + (airports > 0 ? 3 : 0)), context: airports > 0 ? `${airports} airport records loaded.` : "Add airport and coworking detail." },
    ],
    comprehensiveSections: [
      {
        title: "General",
        summary: "Core orientation and fit signals.",
        items: [
          { label: "Country", value: destination.country },
          { label: "Catalog status", value: destination.status },
          { label: "Expat integration", value: hasTag("expat-friendly") ? "Likely easier integration" : "Requires more local adaptation" },
        ],
      },
      {
        title: "Healthcare & Family",
        summary: "Medical depth and family-readiness overview.",
        items: [
          { label: "Hospitals tracked", value: hospitals > 0 ? String(hospitals) : "Research needed" },
          { label: "English schools", value: typeof englishSchools === "number" ? String(englishSchools) : "Research needed" },
          { label: "Healthcare signal", value: hasTag("healthcare") ? "Strength" : "Needs validation" },
        ],
      },
      {
        title: "Lifestyle & Access",
        summary: "Daily experience and transport reality.",
        items: [
          { label: "Airport records", value: airports > 0 ? String(airports) : "Research needed" },
          { label: "Restaurant depth", value: typeof restaurants === "number" ? restaurants.toLocaleString() : "Research needed" },
          { label: "Core lifestyle tags", value: tags.length > 0 ? tags.slice(0, 5).join(", ") : "No tags assigned" },
        ],
      },
    ],
  };
};

export default function AdminCatalogManager() {
  const [destinations, setDestinations] = useState<AdminDestination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [canManage, setCanManage] = useState(false);
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [catalogStatusFilter, setCatalogStatusFilter] = useState("all");
  const [catalogTierFilter, setCatalogTierFilter] = useState("all");
  const [catalogSort, setCatalogSort] = useState<"newest" | "oldest">("newest");
  const [editorDestinationId, setEditorDestinationId] = useState("");
  const [destinationForm, setDestinationForm] = useState<DestinationPayload>(EMPTY_DESTINATION_FORM);
  const [editorForm, setEditorForm] = useState<DestinationEditorPayload>(EMPTY_EDITOR_FORM);
  const [isSavingEditorForm, setIsSavingEditorForm] = useState(false);
  const [previewDestinationId, setPreviewDestinationId] = useState<string | null>(null);
  const [assetForm, setAssetForm] = useState<AssetPayload>(EMPTY_ASSET_FORM);
  const [linkedAssets, setLinkedAssets] = useState<LinkedAsset[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [assetEditForm, setAssetEditForm] = useState<LinkedAsset | null>(null);
  const [destinationTags, setDestinationTags] = useState<string[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editingTagValue, setEditingTagValue] = useState("");
  const [relocationProfileDraft, setRelocationProfileDraft] = useState("");
  const [relocationProfileError, setRelocationProfileError] = useState<string | null>(null);
  const [isSavingRelocationProfile, setIsSavingRelocationProfile] = useState(false);
  const [editorialForm, setEditorialForm] = useState<DestinationEditorialContent>({});
  const [editorialError, setEditorialError] = useState<string | null>(null);
  const [isSavingEditorial, setIsSavingEditorial] = useState(false);
  const [researchForm, setResearchForm] = useState<DestinationResearchProfile>({});
  const [researchError, setResearchError] = useState<string | null>(null);
  const [isSavingResearch, setIsSavingResearch] = useState(false);
  const [relocationEditorMode, setRelocationEditorMode] = useState<"form" | "json">("form");
  const [relocationFormTab, setRelocationFormTab] = useState<"summary" | "scorecard" | "sections" | "coverage">("summary");
  const [commandCenterDataset, setCommandCenterDataset] = useState<CommandCenterDatasetKey>("destination_core_metrics");
  const [commandCenterRowsDraft, setCommandCenterRowsDraft] = useState("[]");
  const [commandCenterRowsError, setCommandCenterRowsError] = useState<string | null>(null);
  const [isLoadingCommandCenterRows, setIsLoadingCommandCenterRows] = useState(false);
  const [isSavingCommandCenterRows, setIsSavingCommandCenterRows] = useState(false);
  const [commandCenterEditorMode, setCommandCenterEditorMode] = useState<"form" | "json">("form");
  const [activeSection, setActiveSection] = useState<"dashboard" | "catalog" | "categories" | "tags" | "media">("dashboard");
  const [selectedDestinationIds, setSelectedDestinationIds] = useState<string[]>([]);
  const [cmsCategories, setCmsCategories] = useState<AdminCmsCategory[]>([
    { id: "wellness", name: "Wellness", slug: "wellness", color: "#38bdf8", icon: "🧘", order: 0 },
    { id: "budget", name: "Budget", slug: "budget", color: "#f59e0b", icon: "💰", order: 1 },
    { id: "healthcare", name: "Healthcare", slug: "healthcare", color: "#fb7185", icon: "🩺", order: 2 },
  ]);
  const [categoryDraft, setCategoryDraft] = useState("");
  const [categoryColor, setCategoryColor] = useState("#38bdf8");
  const [categoryIcon, setCategoryIcon] = useState("✦");
  const [cmsTags, setCmsTags] = useState<AdminCmsTag[]>([
    { id: "healthcare", name: "Healthcare", color: "#fb923c", order: 0 },
    { id: "expat-friendly", name: "Expat-friendly", color: "#22c55e", order: 1 },
    { id: "beach", name: "Beach", color: "#38bdf8", order: 2 },
  ]);
  const [tagDraft, setTagDraft] = useState("");
  const [tagColor, setTagColor] = useState("#f59e0b");
  const [cmsMediaAssets, setCmsMediaAssets] = useState<AdminCmsMediaAsset[]>([
    { id: "media-1", name: "Old Town overview", type: "image", url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=900&q=80", description: "Primary hero image", category: "hero", createdAt: new Date().toISOString() },
  ]);
  const [mediaDraft, setMediaDraft] = useState({ name: "", url: "", type: "image" as AdminCmsMediaAsset["type"], description: "", category: "hero" });
  const [batchImportFileName, setBatchImportFileName] = useState("");
  const [batchImportRowsText, setBatchImportRowsText] = useState("");
  const [batchImportRows, setBatchImportRows] = useState<Array<Record<string, unknown>>>([]);
  const [batchImportWorkbookSheets, setBatchImportWorkbookSheets] = useState<string[]>([]);
  const [batchImportSelectedSheet, setBatchImportSelectedSheet] = useState("");
  const [batchImportWorkbookRowsBySheet, setBatchImportWorkbookRowsBySheet] = useState<Record<string, Array<Record<string, unknown>>>>({});
  const [batchImportWorkbookHeadersBySheet, setBatchImportWorkbookHeadersBySheet] = useState<Record<string, string[]>>({});
  const [batchImportSelectedSheetHeaders, setBatchImportSelectedSheetHeaders] = useState<string[]>([]);
  const [batchImportPreviewPlan, setBatchImportPreviewPlan] = useState<BatchImportPlanEntry[]>([]);
  const [batchImportSummary, setBatchImportSummary] = useState<BatchImportSummary | null>(null);
  const [batchImportResultSummary, setBatchImportResultSummary] = useState<string>("");
  const [batchImportMode, setBatchImportMode] = useState<"create" | "update" | "create_or_update">("create_or_update");
  const [batchImportMatchField, setBatchImportMatchField] = useState<"slug" | "city_country">("slug");
  const [batchImportSelectedColumns, setBatchImportSelectedColumns] = useState<string[]>(["description", "overview", "status", "tier"]);
  const [batchImportAllowBlankClears, setBatchImportAllowBlankClears] = useState(false);
  const [batchImportShowConfirm, setBatchImportShowConfirm] = useState(false);
  const [batchImportExpandedRow, setBatchImportExpandedRow] = useState<number | null>(null);
  const [isPreviewingBatchImport, setIsPreviewingBatchImport] = useState(false);
  const [isExecutingBatchImport, setIsExecutingBatchImport] = useState(false);
  const [batchImportError, setBatchImportError] = useState<string | null>(null);

  const selectedDestination = useMemo(
    () => destinations.find((destination) => destination.id === editorDestinationId) ?? null,
    [editorDestinationId, destinations],
  );

  const previewDestination = useMemo(
    () => destinations.find((destination) => destination.id === previewDestinationId) ?? selectedDestination ?? null,
    [previewDestinationId, selectedDestination, destinations],
  );

  const cmsFilter = useMemo<AdminCmsSearchFilter>(() => ({ sortBy: "updated", query: searchQuery }), [searchQuery]);

  const cmsDestinations = useMemo(
    () => destinations.map((destination) => ({
      id: destination.id,
      slug: destination.slug,
      city: destination.city,
      country: destination.country,
      state: destination.relocationProfile?.comprehensiveSections?.[0]?.items?.[0]?.value ?? "",
      province: "",
      region: destination.relocationProfile?.comprehensiveSections?.[0]?.title ?? "",
      continent: "",
      status: destination.status,
      tier: destination.tier,
      featured: Boolean(destination.description || destination.overview),
      needsReview: destination.status === "review",
      missingImages: destination.mediaCount === 0,
      missingAiSummary: !destination.description,
      missingClimate: !destination.relocationProfile?.aiSummary,
      missingHealthcare: !destination.memberDetails?.hospitals?.length,
      missingCostOfLiving: !destination.researchProfile?.comprehensiveSections?.length,
      missingVideos: destination.videoCount === 0,
      missingResources: destination.resourceCount === 0,
      retirementScore: destination.relocationProfile?.livingHereScorecard?.reduce((score, entry) => score + (entry.score ?? 0), 0) ?? 70,
      livingHereScore: destination.relocationProfile?.livingHereScorecard?.[0]?.score ?? 75,
      costOfLiving: destination.memberDetails?.amenities?.restaurants ? "Moderate" : "Needs review",
      tags: [],
      categories: [],
      description: destination.description ?? "",
      overview: destination.overview ?? "",
      updatedAt: destination.updated_at,
      createdAt: destination.updated_at,
      aiSummary: destination.relocationProfile?.aiSummary ?? "",
      climate: destination.relocationProfile?.comprehensiveSections?.[0]?.summary ?? "",
      healthcare: destination.memberDetails?.hospitals?.length ? `${destination.memberDetails.hospitals.length} hospitals` : "",
    })),
    [destinations],
  );

  const filteredCmsDestinations = useMemo(
    () => filterAdminDestinations(cmsDestinations, cmsFilter),
    [cmsDestinations, cmsFilter],
  );

  const hasActiveSearch = Boolean(searchQuery.trim());
  const dashboardMetrics = useMemo(() => buildDashboardMetrics(cmsDestinations), [cmsDestinations]);

  const filteredDestinations = useMemo(
    () => filterDestinationsByCatalog(destinations, {
      query: searchQuery,
      status: catalogStatusFilter === "all" ? "" : catalogStatusFilter,
      tier: catalogTierFilter === "all" ? "" : catalogTierFilter,
      sort: catalogSort,
    }),
    [destinations, searchQuery, catalogStatusFilter, catalogTierFilter, catalogSort],
  );

  const parseListField = (value: string) => value.split("\n").map((item) => item.trim()).filter(Boolean);
  const formatListField = (items?: string[]) => (items ?? []).join("\n");

  const parsedRelocationProfile = useMemo(() => {
    try {
      if (!relocationProfileDraft.trim()) {
        return normalizeRelocationProfile(RELOCATION_PROFILE_TEMPLATE);
      }

      const parsed = JSON.parse(relocationProfileDraft) as unknown;
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return null;
      }

      return normalizeRelocationProfile(parsed as DestinationRelocationProfile);
    } catch {
      return null;
    }
  }, [relocationProfileDraft]);

  const relocationCoverage = useMemo(
    () => (parsedRelocationProfile ? computeCoverage(parsedRelocationProfile) : null),
    [parsedRelocationProfile],
  );

  const commandCenterRowsCount = useMemo(() => {
    try {
      const parsed = JSON.parse(commandCenterRowsDraft) as unknown;
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  }, [commandCenterRowsDraft]);

  const parsedCommandCenterRows = useMemo(() => {
    return parseCommandCenterRowsDraft(commandCenterRowsDraft);
  }, [commandCenterRowsDraft]);

  const commandCenterFormSupported = useMemo(
    () => isCommandCenterFormDataset(commandCenterDataset),
    [commandCenterDataset],
  );

  const selectedDatasetGuide = useMemo(
    () => COMMAND_CENTER_DATASET_GUIDES[commandCenterDataset],
    [commandCenterDataset],
  );

  const statusTotals = useMemo(() => {
    return destinations.reduce(
      (totals, destination) => {
        totals[destination.status] += 1;
        return totals;
      },
      { draft: 0, review: 0, published: 0, archived: 0 },
    );
  }, [destinations]);

  const handleBulkSelection = (destinationId: string) => {
    setSelectedDestinationIds((current) => current.includes(destinationId) ? current.filter((entry) => entry !== destinationId) : [...current, destinationId]);
  };

  const handleBulkAction = (action: "publish" | "unpublish" | "delete" | "review") => {
    if (selectedDestinationIds.length === 0) {
      setStatusMessage("Select at least one destination first.");
      return;
    }

    if (action === "delete") {
      setDestinations((current) => current.filter((destination) => !selectedDestinationIds.includes(destination.id)));
      setSelectedDestinationIds([]);
      setStatusMessage(`Deleted ${selectedDestinationIds.length} destination(s).`);
      return;
    }

    setDestinations((current) => current.map((destination) => {
      if (!selectedDestinationIds.includes(destination.id)) {
        return destination;
      }

      if (action === "publish") {
        return { ...destination, status: "published" as const };
      }

      if (action === "unpublish") {
        return { ...destination, status: "draft" as const };
      }

      return { ...destination, status: "review" as const };
    }));

    setSelectedDestinationIds([]);
    setStatusMessage(`${action === "publish" ? "Published" : action === "unpublish" ? "Returned to draft" : "Sent to review"} ${selectedDestinationIds.length} destination(s).`);
  };

  const handleBatchImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setBatchImportFileName(file.name);
    setBatchImportError(null);
    setBatchImportResultSummary("");
    setBatchImportPreviewPlan([]);
    setBatchImportWorkbookSheets([]);
    setBatchImportSelectedSheet("");
    setBatchImportWorkbookRowsBySheet({});
    setBatchImportWorkbookHeadersBySheet({});
    setBatchImportSelectedSheetHeaders([]);

    try {
      const parsedFile = await parseBatchImportFile(file);
      const nextRows = parsedFile.rows;

      setBatchImportRows(nextRows);
      setBatchImportRowsText(JSON.stringify(nextRows.slice(0, 8), null, 2));
      setBatchImportWorkbookSheets(parsedFile.workbookSheets ?? []);
      setBatchImportSelectedSheet(parsedFile.selectedSheet ?? "");
      setBatchImportWorkbookRowsBySheet(parsedFile.workbookRowsBySheet ?? {});
      setBatchImportWorkbookHeadersBySheet(parsedFile.workbookHeadersBySheet ?? {});
      setBatchImportSelectedSheetHeaders(parsedFile.selectedSheetHeaders ?? []);
    } catch (error) {
      setBatchImportRows([]);
      setBatchImportRowsText("");
      setBatchImportError(error instanceof Error ? error.message : "Unable to parse the selected file.");
    }
  };

  const handleBatchImportSheetChange = (sheetName: string) => {
    setBatchImportSelectedSheet(sheetName);
    const nextRows = batchImportWorkbookRowsBySheet[sheetName] ?? [];
    setBatchImportRows(nextRows);
    setBatchImportRowsText(JSON.stringify(nextRows.slice(0, 8), null, 2));
    setBatchImportSelectedSheetHeaders(batchImportWorkbookHeadersBySheet[sheetName] ?? []);
    setBatchImportPreviewPlan([]);
    setBatchImportSummary(null);
    setBatchImportResultSummary("");
    setBatchImportError(null);
  };

  const handlePreviewBatchImport = async () => {
    if (!canManage || batchImportRows.length === 0) {
      return;
    }

    setIsPreviewingBatchImport(true);
    setBatchImportError(null);
    setBatchImportResultSummary("");

    try {
      const response = await fetch("/api/admin/destinations/batch-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: batchImportRows,
          mode: batchImportMode,
          matchField: batchImportMatchField,
          previewOnly: true,
          schema: batchImportSelectedSheetHeaders.length > 0 ? {
            sheetName: batchImportSelectedSheet,
            headers: batchImportSelectedSheetHeaders,
          } : undefined,
        }),
      });

      const payload = (await response.json().catch(() => ({ error: "Unable to prepare batch import preview." }))) as {
        error?: string;
        plan?: BatchImportPlanEntry[];
        previewCount?: number;
        summary?: BatchImportSummary;
      };

      if (!response.ok) {
        setBatchImportError(payload.error ?? "Unable to prepare batch import preview.");
        return;
      }

      setBatchImportPreviewPlan(payload.plan ?? []);
      setBatchImportSummary(payload.summary ?? null);
      setBatchImportResultSummary(payload.previewCount ? `Preview ready: ${payload.previewCount} destination(s) will be imported.` : "Preview ready: no destinations will be imported.");
    } catch (error) {
      setBatchImportError(error instanceof Error ? error.message : "Unable to prepare batch import preview.");
    } finally {
      setIsPreviewingBatchImport(false);
    }
  };

  const handleExecuteBatchImport = async () => {
    if (!canManage || batchImportRows.length === 0 || isExecutingBatchImport) {
      return;
    }

    setBatchImportShowConfirm(false);
    setIsExecutingBatchImport(true);
    setBatchImportError(null);
    setBatchImportResultSummary("");

    try {
      const response = await fetch("/api/admin/destinations/batch-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: batchImportRows,
          mode: batchImportMode,
          matchField: batchImportMatchField,
          selectedColumns: batchImportSelectedColumns,
          allowBlankClears: batchImportAllowBlankClears,
          previewOnly: false,
          schema: batchImportSelectedSheetHeaders.length > 0 ? {
            sheetName: batchImportSelectedSheet,
            headers: batchImportSelectedSheetHeaders,
          } : undefined,
        }),
      });

      const payload = (await response.json().catch(() => ({ error: "Unable to execute batch import." }))) as {
        error?: string;
        plan?: BatchImportPlanEntry[];
        importResults?: Array<{ rowNumber: number; action: string; destinationId?: string; error?: string }>;
        summary?: BatchImportSummary;
      };

      if (!response.ok) {
        setBatchImportError(payload.error ?? "Unable to execute batch import.");
        return;
      }

      setBatchImportPreviewPlan(payload.plan ?? []);
      setBatchImportSummary(payload.summary ?? null);
      const successful = payload.importResults?.filter((entry) => !entry.error).length ?? 0;
      const failed = payload.importResults?.filter((entry) => entry.error).length ?? 0;
      setBatchImportResultSummary(`Import complete: ${successful} successful, ${failed} failed.`);
      await loadDestinations(false);
      setStatusMessage("Batch import completed.");
    } catch (error) {
      setBatchImportError(error instanceof Error ? error.message : "Unable to execute batch import.");
    } finally {
      setIsExecutingBatchImport(false);
    }
  };

  const downloadBatchImportReport = () => {
    if (batchImportPreviewPlan.length === 0) {
      return;
    }

    const rows = batchImportPreviewPlan.map((entry) => ({
      rowNumber: entry.rowNumber,
      action: entry.action,
      destination: `${entry.city}, ${entry.country}`,
      slug: entry.slug,
      reason: entry.reason ?? "",
      suggestedFix: entry.suggestedFix ?? "",
      warnings: (entry.warnings ?? []).join(" | "),
      errors: (entry.errors ?? []).join(" | "),
    }));

    const csvRows = [
      ["rowNumber", "action", "destination", "slug", "reason", "suggestedFix", "warnings", "errors"],
      ...rows.map((row) => [String(row.rowNumber), row.action, row.destination, row.slug, row.reason, row.suggestedFix, row.warnings, row.errors]),
    ];

    const csvContent = csvRows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `batch-import-report-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateCategory = () => {
    const name = categoryDraft.trim();
    if (!name) {
      return;
    }

    const nextCategory: AdminCmsCategory = {
      id: createSlug(name),
      name,
      slug: createSlug(name),
      color: categoryColor,
      icon: categoryIcon,
      order: cmsCategories.length,
    };

    setCmsCategories((current) => [nextCategory, ...current]);
    setCategoryDraft("");
    setCategoryColor("#38bdf8");
    setCategoryIcon("✦");
    setStatusMessage(`Category ${name} created.`);
  };

  const handleCreateTag = () => {
    const name = tagDraft.trim();
    if (!name) {
      return;
    }

    const nextTag: AdminCmsTag = {
      id: createSlug(name),
      name,
      color: tagColor,
      order: cmsTags.length,
    };

    setCmsTags((current) => [nextTag, ...current]);
    setTagDraft("");
    setTagColor("#f59e0b");
    setStatusMessage(`Tag ${name} created.`);
  };

  const handleCreateMediaAsset = () => {
    if (!mediaDraft.name.trim() || !mediaDraft.url.trim()) {
      return;
    }

    const nextAsset: AdminCmsMediaAsset = {
      id: `media-${Math.random().toString(36).slice(2, 8)}`,
      name: mediaDraft.name.trim(),
      type: mediaDraft.type,
      url: mediaDraft.url.trim(),
      description: mediaDraft.description.trim(),
      category: mediaDraft.category.trim() || "hero",
      createdAt: new Date().toISOString(),
    };

    setCmsMediaAssets((current) => [nextAsset, ...current]);
    setMediaDraft({ name: "", url: "", type: "image", description: "", category: "hero" });
    setStatusMessage(`Media asset ${nextAsset.name} added.`);
  };

  const loadDestinations = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }
    try {
      const response = await fetch("/api/admin/destinations", { cache: "no-store" });
      const payload = (await response.json()) as {
        canManage?: boolean;
        adminRole?: string | null;
        destinations?: AdminDestination[];
      };

      setCanManage(Boolean(payload.canManage));
      setAdminRole(payload.adminRole ?? null);
      setDestinations(payload.destinations ?? []);
    } catch {
      setCanManage(false);
      setAdminRole(null);
      setDestinations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      try {
        const response = await fetch("/api/admin/destinations", { cache: "no-store" });
        const payload = (await response.json()) as {
          canManage?: boolean;
          adminRole?: string | null;
          destinations?: AdminDestination[];
        };

        setCanManage(Boolean(payload.canManage));
        setAdminRole(payload.adminRole ?? null);
        setDestinations(payload.destinations ?? []);
      } catch {
        setCanManage(false);
        setAdminRole(null);
        setDestinations([]);
      } finally {
        setIsLoading(false);
      }
    };

    void run();
  }, []);

  useEffect(() => {
    if (!statusMessage) return;
    const timeoutId = window.setTimeout(() => setStatusMessage(""), 2600);
    return () => window.clearTimeout(timeoutId);
  }, [statusMessage]);

  useEffect(() => {
    const run = async () => {
      if (!canManage || !assetForm.destinationId) {
        setLinkedAssets([]);
        return;
      }

      setIsLoadingAssets(true);
      try {
        const response = await fetch(`/api/admin/destination-assets?destinationId=${encodeURIComponent(assetForm.destinationId)}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          setLinkedAssets([]);
          return;
        }

        const payload = (await response.json()) as { assets?: LinkedAsset[] };
        setLinkedAssets(payload.assets ?? []);
      } catch {
        setLinkedAssets([]);
      } finally {
        setIsLoadingAssets(false);
      }
    };

    void run();
  }, [assetForm.destinationId, canManage]);

  useEffect(() => {
    const run = async () => {
      if (!canManage || !assetForm.destinationId) {
        setCommandCenterRowsDraft("[]");
        setCommandCenterRowsError(null);
        return;
      }

      setIsLoadingCommandCenterRows(true);
      setCommandCenterRowsError(null);
      try {
        const response = await fetch(
          `/api/admin/destinations/${assetForm.destinationId}/command-center/${commandCenterDataset}`,
          { cache: "no-store" },
        );

        if (!response.ok) {
          const payload = (await response.json().catch(() => ({ error: "Unable to load dataset." }))) as { error?: string };
          setCommandCenterRowsDraft("[]");
          setCommandCenterRowsError(payload.error ?? "Unable to load dataset.");
          return;
        }

        const payload = (await response.json()) as { rows?: unknown[] };
        setCommandCenterRowsDraft(JSON.stringify(payload.rows ?? [], null, 2));
      } catch {
        setCommandCenterRowsDraft("[]");
        setCommandCenterRowsError("Unable to load dataset.");
      } finally {
        setIsLoadingCommandCenterRows(false);
      }
    };

    void run();
  }, [assetForm.destinationId, canManage, commandCenterDataset]);

  useEffect(() => {
    queueMicrotask(() => {
      if (!selectedDestination) {
        setRelocationProfileDraft("");
        setRelocationProfileError(null);
        setEditorialForm({});
        setEditorialError(null);
        setResearchForm({});
        setResearchError(null);
        return;
      }

      const value = selectedDestination.relocationProfile ?? RELOCATION_PROFILE_TEMPLATE;
      setRelocationProfileDraft(JSON.stringify(value, null, 2));
      setRelocationProfileError(null);

      setEditorialForm(selectedDestination.editorialContent ?? {});
      setEditorialError(null);

      setResearchForm(selectedDestination.researchProfile ?? {});
      setResearchError(null);
    });
  }, [selectedDestination]);

  useEffect(() => {
    const run = async () => {
      if (!canManage || !assetForm.destinationId) {
        setDestinationTags([]);
        return;
      }

      setIsLoadingTags(true);
      try {
        const response = await fetch(`/api/admin/destination-tags?destinationId=${encodeURIComponent(assetForm.destinationId)}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          setDestinationTags([]);
          return;
        }

        const payload = (await response.json()) as { tags?: string[] };
        setDestinationTags(payload.tags ?? []);
      } catch {
        setDestinationTags([]);
      } finally {
        setIsLoadingTags(false);
      }
    };

    void run();
  }, [assetForm.destinationId, canManage]);

  const handleSaveDestinationBasics = async () => {
    if (!canManage || !selectedDestination) return;

    setIsSavingEditorForm(true);
    const response = await fetch(`/api/admin/destinations/${selectedDestination.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        city: editorForm.city,
        country: editorForm.country,
        slug: editorForm.slug,
        status: editorForm.status,
        tier: editorForm.tier,
        description: editorForm.description,
        overview: editorForm.overview,
      }),
    });
    setIsSavingEditorForm(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({ error: "Unable to update destination." }))) as { error?: string };
      setStatusMessage(payload.error ?? "Unable to update destination.");
      return;
    }

    const nextIdentity = normalizeDestinationIdentity({
      city: editorForm.city,
      country: editorForm.country,
      slug: editorForm.slug,
    });

    setDestinations((current) => current.map((destination) => destination.id === selectedDestination.id
      ? {
          ...destination,
          city: nextIdentity.city,
          country: nextIdentity.country,
          slug: nextIdentity.slug,
          status: editorForm.status,
          tier: editorForm.tier,
          description: editorForm.description || null,
          overview: editorForm.overview || null,
          updated_at: new Date().toISOString(),
        }
      : destination));
    setStatusMessage("Destination updated.");
    await loadDestinations(false);
  };

  const handleCreateDestination = async () => {
    if (!canManage) return;

    const nextIdentity = normalizeDestinationIdentity(destinationForm);
    const response = await fetch("/api/admin/destinations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...destinationForm, ...nextIdentity }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({ error: "Unable to create destination." }))) as { error?: string };
      setStatusMessage(payload.error ?? "Unable to create destination.");
      return;
    }

    const payload = (await response.json().catch(() => ({ destination: null }))) as { destination?: Partial<AdminDestination> | null };
    const createdDestination = payload.destination;

    if (createdDestination?.id) {
      const optimisticDestination: AdminDestination = {
        id: createdDestination.id,
        slug: createdDestination.slug ?? destinationForm.slug,
        city: createdDestination.city ?? destinationForm.city,
        country: createdDestination.country ?? destinationForm.country,
        status: createdDestination.status ?? destinationForm.status,
        tier: createdDestination.tier ?? destinationForm.tier,
        description: createdDestination.description ?? null,
        updated_at: createdDestination.updated_at ?? new Date().toISOString(),
        mediaCount: 0,
        resourceCount: 0,
        videoCount: 0,
        relocationProfile: null,
        memberDetails: null,
        editorialContent: null,
        researchProfile: null,
      };

      setDestinations((current) => upsertItemById(current, optimisticDestination));
      setEditorDestinationId(optimisticDestination.id);
      setAssetForm((current) => ({ ...current, destinationId: optimisticDestination.id }));
    }

    setDestinationForm(EMPTY_DESTINATION_FORM);
    setStatusMessage("Destination created.");
    await loadDestinations(false);
  };

  const handleStatusChange = async (destinationId: string, nextStatus: AdminDestination["status"]) => {
    if (!canManage) return;

    const response = await fetch(`/api/admin/destinations/${destinationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });

    if (!response.ok) {
      setStatusMessage("Could not update status.");
      return;
    }

    setDestinations((current) => current.map((destination) => destination.id === destinationId
      ? { ...destination, status: nextStatus, updated_at: new Date().toISOString() }
      : destination));
    setStatusMessage("Status updated.");
    await loadDestinations(false);
  };

  const handleDeleteDestination = async (destinationId: string) => {
    if (!canManage) return;

    const destination = destinations.find((item) => item.id === destinationId);
    const destinationLabel = destination ? `${destination.city}, ${destination.country}` : "this destination";
    const shouldDelete = window.confirm(`Delete ${destinationLabel}? This action cannot be undone.`);
    if (!shouldDelete) return;

    const response = await fetch(`/api/admin/destinations/${destinationId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setStatusMessage("Could not delete destination.");
      return;
    }

    setDestinations((current) => current.filter((destination) => destination.id !== destinationId));
    if (editorDestinationId === destinationId) {
      setEditorDestinationId("");
      setPreviewDestinationId(null);
      setAssetForm((current) => ({ ...current, destinationId: "" }));
    }
    setStatusMessage("Destination deleted.");
    await loadDestinations(false);
  };

  const handleSelectEditorDestination = (destinationId: string) => {
    const destination = destinations.find((item) => item.id === destinationId);
    setEditorDestinationId(destinationId);
    setPreviewDestinationId(destinationId);
    setAssetForm((current) => ({ ...current, destinationId }));
    if (destination) {
      setEditorForm(buildEditorFormFromDestination(destination));
    }
  };

  const handlePreviewDestination = (destinationId: string) => {
    const destination = destinations.find((item) => item.id === destinationId);
    setPreviewDestinationId(destinationId);
    setEditorDestinationId(destinationId);
    setAssetForm((current) => ({ ...current, destinationId }));
    if (destination) {
      setEditorForm(buildEditorFormFromDestination(destination));
    }
  };

  const handleTogglePublish = async (destinationId: string) => {
    const destination = destinations.find((item) => item.id === destinationId);
    if (!destination) return;

    const currentStatus = normalizeDestinationStatus(destination.status);
    const nextStatus: AdminDestination["status"] = currentStatus === "published" ? "draft" : "published";
    const previewMessage = nextStatus === "published"
      ? `Preview: ${destination.city}, ${destination.country} will become publicly visible after this change.`
      : `Preview: ${destination.city}, ${destination.country} will be moved back to draft mode.`;

    if (!window.confirm(`${previewMessage}\n\nContinue?`)) {
      return;
    }

    await handleStatusChange(destinationId, nextStatus);
    setPreviewDestinationId(destinationId);
  };

  const handleCreateAsset = async () => {
    if (!canManage) return;

    const response = await fetch("/api/admin/destination-assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(assetForm),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({ error: "Could not add linked record." }))) as { error?: string };
      setStatusMessage(payload.error ?? "Could not add linked record.");
      return;
    }

    setAssetForm((current) => ({ ...EMPTY_ASSET_FORM, destinationId: current.destinationId }));
    setStatusMessage("Linked record added.");
    await loadDestinations();
    if (assetForm.destinationId) {
      const response = await fetch(`/api/admin/destination-assets?destinationId=${encodeURIComponent(assetForm.destinationId)}`, {
        cache: "no-store",
      });
      if (response.ok) {
        const payload = (await response.json()) as { assets?: LinkedAsset[] };
        setLinkedAssets(payload.assets ?? []);
      }
    }
  };

  const handleDeleteAsset = async (asset: LinkedAsset) => {
    if (!canManage) return;

    const response = await fetch(`/api/admin/destination-assets/${asset.assetType}/${asset.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setStatusMessage("Could not delete linked record.");
      return;
    }

    setStatusMessage("Linked record deleted.");
    setLinkedAssets((current) => current.filter((item) => item.id !== asset.id));
    await loadDestinations(false);
  };

  const handleStartEditAsset = (asset: LinkedAsset) => {
    setEditingAssetId(asset.id);
    setAssetEditForm({ ...asset });
  };

  const handleSaveAssetEdit = async () => {
    if (!canManage || !editingAssetId || !assetEditForm) return;

    const response = await fetch(`/api/admin/destination-assets/${assetEditForm.assetType}/${assetEditForm.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(assetEditForm),
    });

    if (!response.ok) {
      setStatusMessage("Could not update linked record.");
      return;
    }

    setLinkedAssets((current) => current.map((item) => (item.id === assetEditForm.id ? assetEditForm : item)));
    setEditingAssetId(null);
    setAssetEditForm(null);
    setStatusMessage("Linked record updated.");
  };

  const handleAddTag = async () => {
    if (!canManage || !assetForm.destinationId || !newTag.trim()) return;

    const normalizedTag = newTag.trim().toLowerCase();
    const previousTags = destinationTags;
    const nextTags = previousTags.includes(normalizedTag) ? previousTags : [...previousTags, normalizedTag].sort();
    setDestinationTags(nextTags);
    setNewTag("");

    const response = await fetch("/api/admin/destination-tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destinationId: assetForm.destinationId, tag: normalizedTag }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({ error: "Could not add destination tag." }))) as { error?: string };
      setDestinationTags(previousTags);
      setNewTag(normalizedTag);
      setStatusMessage(payload.error ?? "Could not add destination tag.");
      return;
    }

    setStatusMessage("Destination tag added.");
  };

  const handleRemoveTag = async (tag: string) => {
    if (!canManage || !assetForm.destinationId) return;

    const shouldRemove = window.confirm(`Remove tag "${tag}" from this destination?`);
    if (!shouldRemove) return;

    const previousTags = destinationTags;
    setDestinationTags((current) => current.filter((item) => item !== tag));

    const response = await fetch("/api/admin/destination-tags", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destinationId: assetForm.destinationId, tag }),
    });

    if (!response.ok) {
      setDestinationTags(previousTags);
      setStatusMessage("Could not remove destination tag.");
      return;
    }

    setStatusMessage("Destination tag removed.");
  };

  const handleStartEditTag = (tag: string) => {
    setEditingTag(tag);
    setEditingTagValue(tag);
  };

  const handleCancelEditTag = () => {
    setEditingTag(null);
    setEditingTagValue("");
  };

  const handleSaveTagEdit = async (currentTag: string) => {
    if (!canManage || !assetForm.destinationId) return;

    const normalizedNextTag = editingTagValue.trim().toLowerCase();
    if (!normalizedNextTag) {
      setStatusMessage("Tag cannot be empty.");
      return;
    }

    if (normalizedNextTag === currentTag) {
      handleCancelEditTag();
      return;
    }

    const previousTags = destinationTags;
    const nextTags = previousTags
      .map((tag) => (tag === currentTag ? normalizedNextTag : tag))
      .filter((tag, index, allTags) => allTags.indexOf(tag) === index)
      .sort();

    setDestinationTags(nextTags);
    handleCancelEditTag();

    const response = await fetch("/api/admin/destination-tags", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        destinationId: assetForm.destinationId,
        currentTag,
        nextTag: normalizedNextTag,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({ error: "Could not rename destination tag." }))) as { error?: string };
      setDestinationTags(previousTags);
      setStatusMessage(payload.error ?? "Could not rename destination tag.");
      return;
    }

    setStatusMessage("Destination tag renamed.");
  };

  const handleLoadRelocationProfileTemplate = () => {
    setRelocationProfileDraft(JSON.stringify(RELOCATION_PROFILE_TEMPLATE, null, 2));
    setRelocationProfileError(null);
  };

  const handleGenerateRelocationBaseline = () => {
    if (!selectedDestination) return;
    const baseline = buildRelocationProfileBaseline(selectedDestination, destinationTags);
    setRelocationProfileDraft(JSON.stringify(normalizeRelocationProfile(baseline), null, 2));
    setRelocationProfileError(null);
  };

  const updateRelocationProfile = (
    updater: (current: DestinationRelocationProfile) => DestinationRelocationProfile,
  ) => {
    const source = parsedRelocationProfile ?? normalizeRelocationProfile(RELOCATION_PROFILE_TEMPLATE);
    const next = normalizeRelocationProfile(updater(source));
    setRelocationProfileDraft(JSON.stringify(next, null, 2));
    setRelocationProfileError(null);
  };

  const handleSaveRelocationProfile = async () => {
    if (!canManage || !selectedDestination) return;

    let parsed: DestinationRelocationProfile;
    try {
      const parsedJson = JSON.parse(relocationProfileDraft) as unknown;
      if (!parsedJson || typeof parsedJson !== "object" || Array.isArray(parsedJson)) {
        throw new Error("Relocation profile JSON must be an object.");
      }
      parsed = parsedJson as DestinationRelocationProfile;
    } catch (error) {
      setRelocationProfileError(error instanceof Error ? error.message : "Invalid JSON.");
      return;
    }

    const validationError = validateRelocationProfile(parsed);
    if (validationError) {
      setRelocationProfileError(validationError);
      return;
    }

    setIsSavingRelocationProfile(true);
    setRelocationProfileError(null);

    const response = await fetch(`/api/admin/destinations/${selectedDestination.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ relocationProfile: parsed }),
    });

    setIsSavingRelocationProfile(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({ error: "Could not save relocation profile." }))) as { error?: string };
      setRelocationProfileError(payload.error ?? "Could not save relocation profile.");
      return;
    }

    setStatusMessage("Relocation profile saved.");
    await loadDestinations(false);
  };

  const handleSaveEditorialContent = async () => {
    if (!canManage || !selectedDestination) return;

    setIsSavingEditorial(true);
    setEditorialError(null);

    const response = await fetch(`/api/admin/destinations/${selectedDestination.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ editorialContent: editorialForm }),
    });

    setIsSavingEditorial(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({ error: "Could not save editorial content." }))) as { error?: string };
      setEditorialError(payload.error ?? "Could not save editorial content.");
      return;
    }

    setStatusMessage("Editorial content saved.");
    await loadDestinations(false);
  };

  const handleSaveResearchProfile = async () => {
    if (!canManage || !selectedDestination) return;

    setIsSavingResearch(true);
    setResearchError(null);

    const response = await fetch(`/api/admin/destinations/${selectedDestination.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ researchProfile: researchForm }),
    });

    setIsSavingResearch(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({ error: "Could not save research profile." }))) as { error?: string };
      setResearchError(payload.error ?? "Could not save research profile.");
      return;
    }

    setStatusMessage("Research profile saved.");
    await loadDestinations(false);
  };

  const handleFormatCommandCenterRows = () => {
    try {
      const parsed = JSON.parse(commandCenterRowsDraft) as unknown;
      if (!Array.isArray(parsed)) {
        setCommandCenterRowsError("Dataset JSON must be an array of row objects.");
        return;
      }
      setCommandCenterRowsDraft(JSON.stringify(parsed, null, 2));
      setCommandCenterRowsError(null);
    } catch (error) {
      setCommandCenterRowsError(error instanceof Error ? error.message : "Invalid JSON.");
    }
  };

  const handleSaveCommandCenterRows = async () => {
    if (!canManage || !assetForm.destinationId) return;

    let rows: unknown[];
    try {
      const parsed = JSON.parse(commandCenterRowsDraft) as unknown;
      if (!Array.isArray(parsed)) {
        throw new Error("Dataset JSON must be an array of row objects.");
      }
      rows = parsed;
    } catch (error) {
      setCommandCenterRowsError(error instanceof Error ? error.message : "Invalid JSON.");
      return;
    }

    setIsSavingCommandCenterRows(true);
    setCommandCenterRowsError(null);
    const response = await fetch(`/api/admin/destinations/${assetForm.destinationId}/command-center/${commandCenterDataset}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows }),
    });
    setIsSavingCommandCenterRows(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({ error: "Could not save dataset." }))) as { error?: string; details?: string };
      setCommandCenterRowsError(payload.details ? `${payload.error ?? "Could not save dataset."} ${payload.details}` : payload.error ?? "Could not save dataset.");
      return;
    }

    setStatusMessage(`Saved ${commandCenterRowsCount} row(s) to ${commandCenterDataset}.`);
  };

  const handleLoadCommandCenterSampleRow = () => {
    const sample = selectedDatasetGuide.sampleRow;
    try {
      const parsed = JSON.parse(commandCenterRowsDraft) as unknown;
      if (!Array.isArray(parsed)) {
        setCommandCenterRowsDraft(JSON.stringify([sample], null, 2));
        setCommandCenterRowsError(null);
        return;
      }

      const nextRows = parsed.length === 0 ? [sample] : [...parsed, sample];
      setCommandCenterRowsDraft(JSON.stringify(nextRows, null, 2));
      setCommandCenterRowsError(null);
    } catch {
      setCommandCenterRowsDraft(JSON.stringify([sample], null, 2));
      setCommandCenterRowsError(null);
    }
  };

  const setCommandCenterRowsFromRecords = (rows: Array<Record<string, unknown>>) => {
    setCommandCenterRowsDraft(JSON.stringify(rows, null, 2));
    setCommandCenterRowsError(null);
  };

  const handleAddFormRow = () => {
    const currentRows = parsedCommandCenterRows ?? [];
    setCommandCenterRowsFromRecords(appendFormRow(currentRows, commandCenterDataset));
  };

  const handleRemoveFormRow = (index: number) => {
    const currentRows = parsedCommandCenterRows ?? [];
    setCommandCenterRowsFromRecords(removeFormRow(currentRows, index));
  };

  const handleUpdateFormRowField = (index: number, field: string, value: string) => {
    const currentRows = parsedCommandCenterRows ?? [];
    setCommandCenterRowsFromRecords(updateFormRowField(currentRows, commandCenterDataset, index, field, value));
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <aside className="w-full shrink-0 rounded-[2rem] border border-white/10 bg-slate-900/80 p-5 lg:w-80">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">CMS navigation</p>
        <h2 className="mt-2 text-xl font-semibold text-white">Editorial operations</h2>
        <p className="mt-2 text-sm text-slate-400">Switch between a live dashboard, the catalog editor, and the content ops modules that keep destination publishing moving.</p>
        <nav className="mt-5 space-y-2">
          {[
            { id: "dashboard", label: "Dashboard", description: "Health and velocity" },
            { id: "catalog", label: "Catalog", description: "Edit and publish" },
            { id: "categories", label: "Categories", description: "Organize content" },
            { id: "tags", label: "Tags", description: "Tag intelligence" },
            { id: "media", label: "Media", description: "Assets and embeds" },
          ].map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id as typeof activeSection)}
              className={`w-full rounded-2xl border px-4 py-3 text-left transition ${activeSection === section.id ? "border-cyan-400/50 bg-cyan-500/10 text-white" : "border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/30"}`}
            >
              <p className="text-sm font-semibold">{section.label}</p>
              <p className="mt-1 text-xs text-slate-400">{section.description}</p>
            </button>
          ))}
        </nav>
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Global search</p>
            {hasActiveSearch ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 transition hover:text-white"
              >
                Clear
              </button>
            ) : null}
          </div>
          <label className="mt-3 block">
            <span className="sr-only">Search destinations</span>
            <input
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                if (event.target.value.trim()) {
                  setActiveSection("catalog");
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  setActiveSection("catalog");
                }
              }}
              placeholder="Search city, country, or slug"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/90 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
          </label>
          <p className="mt-2 text-sm text-slate-300">{hasActiveSearch ? `Showing ${filteredCmsDestinations.length} result(s) for “${searchQuery}”.` : "Search by city, country, or slug to jump between records."}</p>
          <button
            type="button"
            onClick={() => setActiveSection("catalog")}
            className="mt-3 inline-flex rounded-full border border-cyan-400/40 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200 transition hover:border-cyan-300 hover:text-white"
          >
            Open catalog
          </button>
        </div>
      </aside>
      <div className="flex-1 space-y-6">
        {activeSection === "dashboard" ? (
          <>
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Content operations dashboard</p>
                  <h2 className="mt-2 text-2xl font-bold text-white">Enterprise-grade destination CMS</h2>
                  <p className="mt-2 text-sm text-slate-400">A unified control surface for editorial health, publishing flow, assignments, and follow-up work.</p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
                  {filteredCmsDestinations.length} visible / {cmsDestinations.length} tracked
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Tracked destinations</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{dashboardMetrics.total}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Published</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{dashboardMetrics.published}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Missing content</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{dashboardMetrics.missingContent}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Recently edited</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{dashboardMetrics.recentlyEdited}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">AI readiness</p>
                  <p className="mt-2 text-sm text-slate-200">AI summary coverage: {dashboardMetrics.aiStatus}</p>
                  <p className="mt-2 text-sm text-slate-300">Broken links and missing media are surfaced in the side navigation so the editorial backlog stays manageable at a glance.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Category mix</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Object.entries(dashboardMetrics.categoryCounts).slice(0, 6).map(([category, count]) => (
                      <span key={category} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-200">
                        {category}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}

        {activeSection === "catalog" ? (
          <>
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Live management</p>
                  <h2 className="mt-2 text-2xl font-bold text-white">Destination catalog operations</h2>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
                  {canManage ? `Role: ${adminRole ?? "admin"}` : "Read-only session"}
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-4">
                <div className="rounded-2xl bg-white/5 p-4"><p className="text-xs text-slate-400">Draft</p><p className="mt-2 text-2xl font-bold text-white">{statusTotals.draft}</p></div>
                <div className="rounded-2xl bg-white/5 p-4"><p className="text-xs text-slate-400">Review</p><p className="mt-2 text-2xl font-bold text-white">{statusTotals.review}</p></div>
                <div className="rounded-2xl bg-white/5 p-4"><p className="text-xs text-slate-400">Published</p><p className="mt-2 text-2xl font-bold text-white">{statusTotals.published}</p></div>
                <div className="rounded-2xl bg-white/5 p-4"><p className="text-xs text-slate-400">Archived</p><p className="mt-2 text-2xl font-bold text-white">{statusTotals.archived}</p></div>
              </div>

              {statusMessage ? <p className="mt-4 text-sm text-cyan-300">{statusMessage}</p> : null}
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white">Create destination</h3>
                    <p className="mt-2 text-sm text-slate-400">Create a new destination record and then choose it from the catalog to open the editor workspace.</p>
                  </div>
                  <div className="w-full max-w-md">
                    <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Catalog search</label>
                    <input
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search city, country, or slug"
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <input value={destinationForm.city} onChange={(event) => setDestinationForm((current) => ({ ...current, city: event.target.value }))} placeholder="City" className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400" />
                  <input value={destinationForm.country} onChange={(event) => setDestinationForm((current) => ({ ...current, country: event.target.value }))} placeholder="Country" className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400" />
                  <input value={destinationForm.slug} onChange={(event) => setDestinationForm((current) => ({ ...current, slug: event.target.value }))} placeholder="Slug (optional)" className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400 sm:col-span-2" />
                  <select value={destinationForm.status} onChange={(event) => setDestinationForm((current) => ({ ...current, status: event.target.value as DestinationPayload["status"] }))} className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400">
                    <option value="draft">Draft</option>
                    <option value="review">Review</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                  <input value={destinationForm.tier} onChange={(event) => setDestinationForm((current) => ({ ...current, tier: event.target.value }))} placeholder="Tier (launch/platinum/etc.)" className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400" />
                </div>
                <button type="button" onClick={() => void handleCreateDestination()} disabled={!canManage} className="mt-4 rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60">
                  Create destination
                </button>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
                <h3 className="text-xl font-semibold text-white">Add linked asset</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <select value={assetForm.destinationId} onChange={(event) => setAssetForm((current) => ({ ...current, destinationId: event.target.value }))} className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400 sm:col-span-2">
                    <option value="">Choose destination</option>
                    {destinations.map((destination) => (
                      <option key={destination.id} value={destination.id}>{destination.city}, {destination.country}</option>
                    ))}
                  </select>
                  <select value={assetForm.assetType} onChange={(event) => setAssetForm((current) => ({ ...current, assetType: event.target.value as AssetPayload["assetType"] }))} className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400">
                    <option value="resource">Resource link</option>
                    <option value="media">Media asset</option>
                    <option value="video">Video link</option>
                  </select>
                  <input value={assetForm.provider} onChange={(event) => setAssetForm((current) => ({ ...current, provider: event.target.value }))} placeholder="Provider" className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400" />
                  <input value={assetForm.label} onChange={(event) => setAssetForm((current) => ({ ...current, label: event.target.value }))} placeholder="Label" className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400" />
                  <input value={assetForm.url} onChange={(event) => setAssetForm((current) => ({ ...current, url: event.target.value }))} placeholder="URL" className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400" />
                  <input value={assetForm.category} onChange={(event) => setAssetForm((current) => ({ ...current, category: event.target.value }))} placeholder="Resource category" className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400" />
                  <input value={assetForm.kind} onChange={(event) => setAssetForm((current) => ({ ...current, kind: event.target.value }))} placeholder="Media kind" className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400" />
                </div>
                <button type="button" onClick={() => void handleCreateAsset()} disabled={!canManage} className="mt-4 rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60">
                  Add linked record
                </button>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">Batch import catalog records</h3>
                  <p className="mt-2 text-sm text-slate-400">Upload a CSV, JSON, XLSX, or XLS file, preview the planned create/update actions, and apply them to the live catalog in one step.</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Upload file</label>
                  <input
                    type="file"
                    accept=".csv,.json,.xlsx,.xls"
                    onChange={handleBatchImportFile}
                    className="mt-3 block w-full rounded-2xl border border-white/10 bg-slate-950/90 px-3 py-3 text-sm text-slate-100"
                  />
                  {batchImportFileName ? <p className="mt-2 text-sm text-slate-300">Loaded {batchImportFileName}</p> : null}
                  {batchImportWorkbookSheets.length > 0 ? (
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                      <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Worksheet</label>
                      <select
                        value={batchImportSelectedSheet}
                        onChange={(event) => handleBatchImportSheetChange(event.target.value)}
                        className="rounded-full border border-white/10 bg-slate-950/90 px-3 py-2 text-sm text-slate-200"
                      >
                        {batchImportWorkbookSheets.map((sheetName) => (
                          <option key={sheetName} value={sheetName}>{sheetName}</option>
                        ))}
                      </select>
                    </div>
                  ) : null}
                  <textarea
                    value={batchImportRowsText}
                    onChange={(event) => {
                      setBatchImportRowsText(event.target.value);
                      try {
                        const parsed = JSON.parse(event.target.value) as unknown;
                        if (Array.isArray(parsed)) {
                          setBatchImportRows(parsed as Array<Record<string, unknown>>);
                          setBatchImportError(null);
                        }
                      } catch {
                        setBatchImportRows([]);
                      }
                    }}
                    placeholder="Preview rows as JSON or leave the file upload to populate this view."
                    className="mt-4 min-h-40 w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                  />
                  <div className="mt-4 flex flex-wrap gap-3">
                    <select value={batchImportMode} onChange={(event) => setBatchImportMode(event.target.value as "create" | "update" | "create_or_update") } className="rounded-full border border-white/10 bg-slate-950/90 px-3 py-2 text-sm text-slate-200">
                      <option value="create_or_update">Create or update</option>
                      <option value="create">Create only</option>
                      <option value="update">Update only</option>
                    </select>
                    <select value={batchImportMatchField} onChange={(event) => setBatchImportMatchField(event.target.value as "slug" | "city_country") } className="rounded-full border border-white/10 bg-slate-950/90 px-3 py-2 text-sm text-slate-200">
                      <option value="slug">Match by slug</option>
                      <option value="city_country">Match by city + country</option>
                    </select>
                  </div>
                  <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/80 p-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Columns to update</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {[
                        { key: "description", label: "Description" },
                        { key: "overview", label: "Overview" },
                        { key: "status", label: "Status" },
                        { key: "tier", label: "Tier" },
                        { key: "city", label: "City" },
                        { key: "country", label: "Country" },
                        { key: "slug", label: "Slug" },
                      ].map((field) => (
                        <label key={field.key} className="flex items-center gap-2 text-sm text-slate-300">
                          <input
                            type="checkbox"
                            checked={batchImportSelectedColumns.includes(field.key)}
                            onChange={() => setBatchImportSelectedColumns((current) => current.includes(field.key) ? current.filter((item) => item !== field.key) : [...current, field.key])}
                          />
                          {field.label}
                        </label>
                      ))}
                    </div>
                    <label className="mt-3 flex items-center gap-2 text-sm text-slate-300">
                      <input type="checkbox" checked={batchImportAllowBlankClears} onChange={() => setBatchImportAllowBlankClears((current) => !current)} />
                      Allow blank workbook cells to clear existing database values
                    </label>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button type="button" onClick={() => void handlePreviewBatchImport()} disabled={!canManage || batchImportRows.length === 0 || isPreviewingBatchImport} className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60">
                      {isPreviewingBatchImport ? "Preparing preview..." : "Preview import"}
                    </button>
                    <button type="button" onClick={() => setBatchImportShowConfirm(true)} disabled={!canManage || batchImportRows.length === 0 || isExecutingBatchImport} className="rounded-full border border-cyan-400/40 px-4 py-2 text-sm font-semibold text-cyan-200 disabled:cursor-not-allowed disabled:opacity-60">
                      {isExecutingBatchImport ? "Importing..." : "Run import"}
                    </button>
                  </div>
                  {batchImportShowConfirm ? (
                    <div className="mt-4 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-3 text-sm text-cyan-100">
                      <p className="font-semibold">You are about to:</p>
                      <ul className="mt-2 space-y-1 text-sm text-cyan-100/90">
                        <li>Create {batchImportSummary?.create ?? 0} destinations</li>
                        <li>Update {batchImportSummary?.update ?? 0} destinations</li>
                        <li>Reject {batchImportSummary?.reject ?? 0} rows</li>
                        <li>Skip {batchImportSummary?.skip ?? 0} rows</li>
                      </ul>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button type="button" onClick={() => void handleExecuteBatchImport()} className="rounded-full bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950">Continue</button>
                        <button type="button" onClick={() => setBatchImportShowConfirm(false)} className="rounded-full border border-cyan-400/40 px-3 py-2 text-sm font-semibold text-cyan-200">Cancel</button>
                      </div>
                    </div>
                  ) : null}
                  {batchImportError ? <p className="mt-4 text-sm text-rose-400">{batchImportError}</p> : null}
                  {batchImportResultSummary ? <p className="mt-4 text-sm text-cyan-300">{batchImportResultSummary}</p> : null}
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Import preview</p>
                    {batchImportPreviewPlan.length > 0 ? (
                      <button type="button" onClick={downloadBatchImportReport} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">Download report</button>
                    ) : null}
                  </div>
                  {batchImportSummary ? (
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {[
                        { label: "Total rows", value: batchImportSummary.totalRows },
                        { label: "Create", value: batchImportSummary.create },
                        { label: "Update", value: batchImportSummary.update },
                        { label: "Reject", value: batchImportSummary.reject },
                        { label: "Skip", value: batchImportSummary.skip },
                        { label: "Warnings", value: batchImportSummary.warnings },
                        { label: "Errors", value: batchImportSummary.errors },
                      ].map((item) => (
                        <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                          <p className="mt-1 text-lg font-semibold text-white">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {batchImportPreviewPlan.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-400">No preview yet. Upload a file and preview planned actions to see the import plan before it is applied.</p>
                  ) : (
                    <div className="mt-4 space-y-2">
                      {batchImportPreviewPlan.slice(0, 8).map((entry) => (
                        <div key={`${entry.rowNumber}-${entry.action}`} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-white">#{entry.rowNumber}</span>
                            <span className={`rounded-full px-2 py-1 text-xs uppercase tracking-[0.2em] ${entry.action === "reject" ? "bg-rose-500/20 text-rose-300" : entry.action === "update" ? "bg-amber-500/20 text-amber-300" : entry.action === "skip" ? "bg-slate-500/20 text-slate-300" : "bg-cyan-500/20 text-cyan-300"}`}>
                              {entry.action}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-slate-300">{entry.city}, {entry.country} • {entry.slug || "(no slug)"}</p>
                          {entry.reason ? <p className="mt-1 text-xs text-slate-400">{entry.reason}</p> : null}
                          {entry.suggestedFix ? <p className="mt-1 text-xs text-cyan-300">Suggested fix: {entry.suggestedFix}</p> : null}
                          {entry.action === "update" && entry.fieldChanges ? (
                            <>
                              <button type="button" onClick={() => setBatchImportExpandedRow((current) => current === entry.rowNumber ? null : entry.rowNumber)} className="mt-3 text-xs font-semibold text-cyan-300">
                                {batchImportExpandedRow === entry.rowNumber ? "Hide change preview" : "Show change preview"}
                              </button>
                              {batchImportExpandedRow === entry.rowNumber ? (
                                <div className="mt-3 space-y-2 rounded-2xl border border-white/10 bg-slate-950/80 p-3">
                                  {entry.fieldChanges.map((fieldChange) => (
                                    <div key={fieldChange.field} className={`rounded-xl border px-3 py-2 ${fieldChange.changed ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-100" : "border-white/10 bg-white/5 text-slate-400"}`}>
                                      <div className="flex items-center justify-between gap-2 text-xs uppercase tracking-[0.2em]">
                                        <span>{fieldChange.field}</span>
                                        <span>{fieldChange.changed ? "Will change" : "No change"}</span>
                                      </div>
                                      <div className="mt-2 flex flex-col gap-1 text-sm">
                                        <div><span className="text-slate-400">Current:</span> {fieldChange.currentValue || "(empty)"}</div>
                                        <div><span className="text-slate-400">New:</span> {fieldChange.newValue || "(empty)"}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                            </>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">Destination editor workspace</h3>
                  <p className="mt-2 text-sm text-slate-400">Search, inspect, edit, preview, publish, and remove destinations from a catalog-first CMS surface.</p>
                </div>
                <div className="w-full max-w-md">
                  <select
                    value={editorDestinationId}
                    onChange={(event) => handleSelectEditorDestination(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  >
                    <option value="">Select destination to edit</option>
                    {filteredDestinations.map((destination) => (
                      <option key={destination.id} value={destination.id}>{destination.city}, {destination.country} • {destination.slug}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Catalog actions</p>
                    <p className="mt-1 text-sm text-slate-400">Open a destination, review its draft state, and move it between draft and published visibility.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={catalogStatusFilter}
                      onChange={(event) => setCatalogStatusFilter(event.target.value)}
                      className="rounded-full border border-white/10 bg-slate-950/90 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-200"
                    >
                      <option value="all">All statuses</option>
                      <option value="draft">Draft</option>
                      <option value="review">Review</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                    <select
                      value={catalogTierFilter}
                      onChange={(event) => setCatalogTierFilter(event.target.value)}
                      className="rounded-full border border-white/10 bg-slate-950/90 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-200"
                    >
                      <option value="all">All tiers</option>
                      <option value="launch">Launch</option>
                      <option value="platinum">Platinum</option>
                      <option value="premium">Premium</option>
                    </select>
                    <select
                      value={catalogSort}
                      onChange={(event) => setCatalogSort(event.target.value as "newest" | "oldest")}
                      className="rounded-full border border-white/10 bg-slate-950/90 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-200"
                    >
                      <option value="newest">Newest first</option>
                      <option value="oldest">Oldest first</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setCatalogStatusFilter("all");
                        setCatalogTierFilter("all");
                        setCatalogSort("newest");
                      }}
                      className="rounded-full border border-white/20 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-200"
                    >
                      Reset filters
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!selectedDestination) return;
                        handlePreviewDestination(selectedDestination.id);
                      }}
                      className="rounded-full border border-cyan-400/50 px-3 py-2 text-xs uppercase tracking-[0.2em] text-cyan-200"
                    >
                      Preview selected
                    </button>
                  </div>
                </div>
              </div>

              {previewDestination ? (
                <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Preview focus</p>
                      <p className="mt-1 text-lg font-semibold text-white">{previewDestination.city}, {previewDestination.country}</p>
                    </div>
                    <div className="rounded-full border border-cyan-400/30 bg-slate-950/60 px-3 py-2 text-xs uppercase tracking-[0.2em] text-cyan-200">
                      {getDestinationWorkflowState(previewDestination.status).statusLabel}
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    {previewDestination.description || previewDestination.overview || "Add description copy to shape the public destination story before publishing."}
                  </p>
                </div>
              ) : null}

              <div className="mt-4 space-y-3">
                {isLoading ? (
                  <p className="text-slate-400">Loading destinations...</p>
                ) : filteredDestinations.length === 0 ? (
                  <p className="text-slate-400">No destinations match this search yet.</p>
                ) : (
                  filteredDestinations.map((destination) => {
                    const workflowState = getDestinationWorkflowState(destination.status);
                    return (
                      <div key={destination.id} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-base font-semibold text-white">{destination.city}, {destination.country}</p>
                              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-300">{destination.slug}</span>
                            </div>
                            <p className="mt-2 text-sm text-slate-400">{destination.description || destination.overview || "This destination is ready for richer editorial copy."}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleSelectEditorDestination(destination.id)}
                              className="rounded-full border border-cyan-400/50 px-3 py-2 text-xs uppercase tracking-[0.2em] text-cyan-200"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePreviewDestination(destination.id)}
                              className="rounded-full border border-white/20 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-200"
                            >
                              Preview
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleTogglePublish(destination.id)}
                              className="rounded-full bg-cyan-500 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-950"
                            >
                              {workflowState.canPublish ? "Publish" : "Unpublish"}
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDeleteDestination(destination.id)}
                              className="rounded-full border border-rose-400/50 px-3 py-2 text-xs uppercase tracking-[0.2em] text-rose-200"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">{workflowState.statusLabel}</span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">Tier: {destination.tier}</span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">Updated {new Date(destination.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              {!assetForm.destinationId ? (
                <p className="mt-4 text-slate-400">Choose a destination from the editor workspace to manage tags.</p>
              ) : (
                <>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <input
                      value={newTag}
                      onChange={(event) => setNewTag(event.target.value)}
                      placeholder="Add tag (e.g. healthcare)"
                      className="min-w-[280px] rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400"
                    />
                    <button
                      type="button"
                      onClick={() => void handleAddTag()}
                      disabled={!canManage || !newTag.trim()}
                      className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Add tag
                    </button>
                  </div>
                  {isLoadingTags ? (
                    <p className="mt-4 text-slate-400">Loading tags...</p>
                  ) : destinationTags.length === 0 ? (
                    <p className="mt-4 text-slate-400">No tags found for this destination yet.</p>
                  ) : (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {destinationTags.map((tag) => (
                        <div key={tag} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-200">
                          {editingTag === tag ? (
                            <>
                              <input
                                value={editingTagValue}
                                onChange={(event) => setEditingTagValue(event.target.value)}
                                className="w-36 rounded-full border border-cyan-400/40 bg-slate-950/90 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white outline-none focus:border-cyan-400"
                              />
                              <button
                                type="button"
                                onClick={() => void handleSaveTagEdit(tag)}
                                disabled={!canManage || !editingTagValue.trim()}
                                className="rounded-full border border-cyan-400/60 px-2 py-1 text-[10px] text-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelEditTag}
                                className="rounded-full border border-white/20 px-2 py-1 text-[10px] text-slate-200"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <span>{tag}</span>
                              <button
                                type="button"
                                onClick={() => handleStartEditTag(tag)}
                                disabled={!canManage}
                                className="rounded-full border border-cyan-400/60 px-2 py-1 text-[10px] text-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleRemoveTag(tag)}
                                disabled={!canManage}
                                className="rounded-full border border-rose-400/60 px-2 py-1 text-[10px] text-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Remove
                              </button>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">Basic information</h3>
                  <p className="mt-2 text-sm text-slate-400">Update core destination metadata, status, and summary copy directly from the CMS workspace.</p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleSaveDestinationBasics()}
                  disabled={!canManage || !selectedDestination || isSavingEditorForm}
                  className="rounded-full bg-cyan-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSavingEditorForm ? "Saving..." : "Save basics"}
                </button>
              </div>
              {!selectedDestination ? (
                <p className="mt-4 text-slate-400">Choose a destination from the catalog to edit its basic information.</p>
              ) : (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <input value={editorForm.city} onChange={(event) => setEditorForm((current) => ({ ...current, city: event.target.value }))} placeholder="City" className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400" />
                  <input value={editorForm.country} onChange={(event) => setEditorForm((current) => ({ ...current, country: event.target.value }))} placeholder="Country" className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400" />
                  <input value={editorForm.slug} onChange={(event) => setEditorForm((current) => ({ ...current, slug: event.target.value }))} placeholder="Slug" className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400" />
                  <input value={editorForm.tier} onChange={(event) => setEditorForm((current) => ({ ...current, tier: event.target.value }))} placeholder="Tier" className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400" />
                  <select value={editorForm.status} onChange={(event) => setEditorForm((current) => ({ ...current, status: event.target.value as DestinationEditorPayload["status"] }))} className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400">
                    <option value="draft">Draft</option>
                    <option value="review">Review</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                  <textarea value={editorForm.description} onChange={(event) => setEditorForm((current) => ({ ...current, description: event.target.value }))} placeholder="Short description" rows={4} className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400 md:col-span-2" />
                  <textarea value={editorForm.overview} onChange={(event) => setEditorForm((current) => ({ ...current, overview: event.target.value }))} placeholder="Overview" rows={5} className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400 md:col-span-2" />
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
              <h3 className="text-xl font-semibold text-white">Relocation profile editor</h3>
              {!assetForm.destinationId ? (
                <p className="mt-4 text-slate-400">Choose a destination from the editor workspace to edit AI summary, scorecard, and comprehensive profile sections.</p>
              ) : (
                <>
                  <div className="mt-4 inline-flex rounded-full border border-white/10 bg-white/5 p-1">
                    <button
                      type="button"
                      onClick={() => setRelocationEditorMode("form")}
                      className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${relocationEditorMode === "form" ? "bg-cyan-500 text-slate-950" : "text-slate-200"}`}
                    >
                      Form editor
                    </button>
                    <button
                      type="button"
                      onClick={() => setRelocationEditorMode("json")}
                      className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${relocationEditorMode === "json" ? "bg-cyan-500 text-slate-950" : "text-slate-200"}`}
                    >
                      JSON editor
                    </button>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    This JSON powers the AI summary, Living Here Scorecard, and the structured relocation intelligence matrix on destination pages.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleLoadRelocationProfileTemplate}
                      className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-200"
                    >
                      Load template
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerateRelocationBaseline}
                      className="rounded-full border border-cyan-400/50 px-4 py-2 text-xs uppercase tracking-[0.2em] text-cyan-200"
                    >
                      Generate baseline
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleSaveRelocationProfile()}
                      disabled={!canManage || isSavingRelocationProfile}
                      className="rounded-full bg-cyan-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSavingRelocationProfile ? "Saving..." : "Save profile"}
                    </button>
                  </div>

                  {relocationEditorMode === "form" ? (
                    parsedRelocationProfile ? (
                      <div className="mt-4 space-y-6">
                        <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
                          <button
                            type="button"
                            onClick={() => setRelocationFormTab("summary")}
                            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${relocationFormTab === "summary" ? "bg-cyan-500 text-slate-950" : "text-slate-200"}`}
                          >
                            Summary
                          </button>
                          <button
                            type="button"
                            onClick={() => setRelocationFormTab("scorecard")}
                            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${relocationFormTab === "scorecard" ? "bg-cyan-500 text-slate-950" : "text-slate-200"}`}
                          >
                            Scorecard
                          </button>
                          <button
                            type="button"
                            onClick={() => setRelocationFormTab("sections")}
                            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${relocationFormTab === "sections" ? "bg-cyan-500 text-slate-950" : "text-slate-200"}`}
                          >
                            Sections
                          </button>
                          <button
                            type="button"
                            onClick={() => setRelocationFormTab("coverage")}
                            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${relocationFormTab === "coverage" ? "bg-cyan-500 text-slate-950" : "text-slate-200"}`}
                          >
                            Coverage
                          </button>
                        </div>

                        {relocationFormTab === "summary" ? (
                        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                          <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">AI summary</p>
                          <textarea
                            value={parsedRelocationProfile.aiSummary ?? ""}
                            onChange={(event) => updateRelocationProfile((current) => ({ ...current, aiSummary: event.target.value }))}
                            className="mt-3 min-h-[110px] w-full rounded-2xl border border-white/10 bg-slate-950/90 p-3 text-sm leading-6 text-slate-200 outline-none focus:border-cyan-400"
                          />
                        </div>
                        ) : null}

                        {relocationFormTab === "scorecard" ? (
                        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Living Here Scorecard</p>
                            <button
                              type="button"
                              onClick={() => updateRelocationProfile((current) => ({
                                ...current,
                                livingHereScorecard: [
                                  ...(current.livingHereScorecard ?? []),
                                  { category: "New Category", score: 85, context: "Add context" },
                                ],
                              }))}
                              className="rounded-full border border-white/20 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-200"
                            >
                              Add row
                            </button>
                          </div>
                          <div className="mt-3 space-y-3">
                            {(parsedRelocationProfile.livingHereScorecard ?? []).map((item, index) => (
                              <div key={`${item.category}-${index}`} className="rounded-2xl border border-white/10 bg-slate-950/80 p-3">
                                <div className="grid gap-3 md:grid-cols-[1.2fr_0.5fr_1.3fr_auto]">
                                  <input
                                    value={item.category}
                                    onChange={(event) => updateRelocationProfile((current) => {
                                      const next = [...(current.livingHereScorecard ?? [])];
                                      next[index] = { ...next[index], category: event.target.value };
                                      return { ...current, livingHereScorecard: next };
                                    })}
                                    placeholder="Category"
                                    className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                                  />
                                  <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={item.score ?? 85}
                                    onChange={(event) => updateRelocationProfile((current) => {
                                      const next = [...(current.livingHereScorecard ?? [])];
                                      next[index] = { ...next[index], score: Number(event.target.value) };
                                      return { ...current, livingHereScorecard: next };
                                    })}
                                    placeholder="Score"
                                    className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                                  />
                                  <input
                                    value={item.context ?? ""}
                                    onChange={(event) => updateRelocationProfile((current) => {
                                      const next = [...(current.livingHereScorecard ?? [])];
                                      next[index] = { ...next[index], context: event.target.value };
                                      return { ...current, livingHereScorecard: next };
                                    })}
                                    placeholder="Context"
                                    className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => updateRelocationProfile((current) => ({
                                      ...current,
                                      livingHereScorecard: (current.livingHereScorecard ?? []).filter((_, itemIndex) => itemIndex !== index),
                                    }))}
                                    className="rounded-xl border border-rose-400/60 px-3 py-2 text-xs uppercase tracking-[0.2em] text-rose-200"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        ) : null}

                        {relocationFormTab === "sections" ? (
                        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Comprehensive sections</p>
                            <button
                              type="button"
                              onClick={() => updateRelocationProfile((current) => ({
                                ...current,
                                comprehensiveSections: [
                                  ...(current.comprehensiveSections ?? []),
                                  { title: "New Section", summary: "", items: [{ label: "Metric", value: "", note: "" }] },
                                ],
                              }))}
                              className="rounded-full border border-white/20 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-200"
                            >
                              Add section
                            </button>
                          </div>

                          <div className="mt-3 space-y-4">
                            {(parsedRelocationProfile.comprehensiveSections ?? []).map((section, sectionIndex) => (
                              <div key={`${section.title}-${sectionIndex}`} className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
                                <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                                  <input
                                    value={section.title}
                                    onChange={(event) => updateRelocationProfile((current) => {
                                      const nextSections = [...(current.comprehensiveSections ?? [])];
                                      nextSections[sectionIndex] = { ...nextSections[sectionIndex], title: event.target.value };
                                      return { ...current, comprehensiveSections: nextSections };
                                    })}
                                    placeholder="Section title"
                                    className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => updateRelocationProfile((current) => ({
                                      ...current,
                                      comprehensiveSections: (current.comprehensiveSections ?? []).filter((_, idx) => idx !== sectionIndex),
                                    }))}
                                    className="rounded-xl border border-rose-400/60 px-3 py-2 text-xs uppercase tracking-[0.2em] text-rose-200"
                                  >
                                    Remove
                                  </button>
                                </div>

                                <textarea
                                  value={section.summary ?? ""}
                                  onChange={(event) => updateRelocationProfile((current) => {
                                    const nextSections = [...(current.comprehensiveSections ?? [])];
                                    nextSections[sectionIndex] = { ...nextSections[sectionIndex], summary: event.target.value };
                                    return { ...current, comprehensiveSections: nextSections };
                                  })}
                                  placeholder="Section summary"
                                  className="mt-3 min-h-[70px] w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                                />

                                <div className="mt-3 space-y-2">
                                  {(section.items ?? []).map((item, itemIndex) => (
                                    <div key={`${item.label}-${itemIndex}`} className="rounded-xl border border-white/10 bg-slate-900/80 p-3">
                                      <div className="grid gap-2 md:grid-cols-[1fr_1fr_1fr_auto]">
                                        <input
                                          value={item.label}
                                          onChange={(event) => updateRelocationProfile((current) => {
                                            const nextSections = [...(current.comprehensiveSections ?? [])];
                                            const nextItems = [...(nextSections[sectionIndex]?.items ?? [])];
                                            nextItems[itemIndex] = { ...nextItems[itemIndex], label: event.target.value };
                                            nextSections[sectionIndex] = { ...nextSections[sectionIndex], items: nextItems };
                                            return { ...current, comprehensiveSections: nextSections };
                                          })}
                                          placeholder="Label"
                                          className="rounded-lg border border-white/10 bg-slate-950 px-2 py-2 text-xs text-white outline-none focus:border-cyan-400"
                                        />
                                        <input
                                          value={item.value}
                                          onChange={(event) => updateRelocationProfile((current) => {
                                            const nextSections = [...(current.comprehensiveSections ?? [])];
                                            const nextItems = [...(nextSections[sectionIndex]?.items ?? [])];
                                            nextItems[itemIndex] = { ...nextItems[itemIndex], value: event.target.value };
                                            nextSections[sectionIndex] = { ...nextSections[sectionIndex], items: nextItems };
                                            return { ...current, comprehensiveSections: nextSections };
                                          })}
                                          placeholder="Value"
                                          className="rounded-lg border border-white/10 bg-slate-950 px-2 py-2 text-xs text-white outline-none focus:border-cyan-400"
                                        />
                                        <input
                                          value={item.note ?? ""}
                                          onChange={(event) => updateRelocationProfile((current) => {
                                            const nextSections = [...(current.comprehensiveSections ?? [])];
                                            const nextItems = [...(nextSections[sectionIndex]?.items ?? [])];
                                            nextItems[itemIndex] = { ...nextItems[itemIndex], note: event.target.value };
                                            nextSections[sectionIndex] = { ...nextSections[sectionIndex], items: nextItems };
                                            return { ...current, comprehensiveSections: nextSections };
                                          })}
                                          placeholder="Note"
                                          className="rounded-lg border border-white/10 bg-slate-950 px-2 py-2 text-xs text-white outline-none focus:border-cyan-400"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => updateRelocationProfile((current) => {
                                            const nextSections = [...(current.comprehensiveSections ?? [])];
                                            const nextItems = [...(nextSections[sectionIndex]?.items ?? [])].filter((_, idx) => idx !== itemIndex);
                                            nextSections[sectionIndex] = { ...nextSections[sectionIndex], items: nextItems };
                                            return { ...current, comprehensiveSections: nextSections };
                                          })}
                                          className="rounded-lg border border-rose-400/60 px-2 py-2 text-[11px] uppercase tracking-[0.2em] text-rose-200"
                                        >
                                          X
                                        </button>
                                      </div>
                                    </div>
                                  ))}

                                  <button
                                    type="button"
                                    onClick={() => updateRelocationProfile((current) => {
                                      const nextSections = [...(current.comprehensiveSections ?? [])];
                                      const nextItems = [...(nextSections[sectionIndex]?.items ?? [])];
                                      nextItems.push({ label: "New metric", value: "", note: "" });
                                      nextSections[sectionIndex] = { ...nextSections[sectionIndex], items: nextItems };
                                      return { ...current, comprehensiveSections: nextSections };
                                    })}
                                    className="rounded-full border border-white/20 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-200"
                                  >
                                    Add item
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        ) : null}

                        {relocationFormTab === "coverage" ? (
                        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                          <div className="flex flex-wrap items-end justify-between gap-3">
                            <div>
                              <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Required Coverage</p>
                              <h4 className="mt-2 text-xl font-semibold text-white">Relocation readiness checklist</h4>
                            </div>
                            <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-right">
                              <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300">Readiness</p>
                              <p className="mt-1 text-2xl font-black text-cyan-100">{relocationCoverage?.readinessPercent ?? 0}%</p>
                              <p className="text-xs text-cyan-200/80">
                                {relocationCoverage?.coveredCount ?? 0} / {relocationCoverage?.totalCount ?? 0} categories covered
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-900/80">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all"
                              style={{ width: `${relocationCoverage?.readinessPercent ?? 0}%` }}
                            />
                          </div>

                          <div className="mt-5 grid gap-3 md:grid-cols-2">
                            {(relocationCoverage?.categories ?? []).map((category) => (
                              <div key={category.key} className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
                                <div className="flex items-center justify-between gap-3">
                                  <p className="text-sm font-semibold text-white">{category.label}</p>
                                  <span className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em] ${category.covered ? "bg-emerald-500/15 text-emerald-200" : "bg-amber-500/15 text-amber-200"}`}>
                                    {category.covered ? "Covered" : "Missing"}
                                  </span>
                                </div>
                                {category.notes.length > 0 ? (
                                  <div className="mt-3 space-y-2 text-xs leading-5 text-amber-100/90">
                                    {category.notes.map((note) => (
                                      <p key={note}>{note}</p>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="mt-3 text-xs leading-5 text-emerald-100/90">Coverage requirements satisfied.</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="mt-4 rounded-2xl border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-200">
                        Current JSON is invalid. Switch to JSON editor to fix parsing, or load the template.
                      </div>
                    )
                  ) : (
                    <textarea
                      value={relocationProfileDraft}
                      onChange={(event) => setRelocationProfileDraft(event.target.value)}
                      className="mt-4 min-h-[360px] w-full rounded-3xl border border-white/10 bg-slate-950/90 p-4 font-mono text-xs leading-6 text-slate-200 outline-none focus:border-cyan-400"
                      spellCheck={false}
                    />
                  )}

                  {relocationProfileError ? <p className="mt-3 text-sm text-rose-300">{relocationProfileError}</p> : null}
                </>
              )}
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
              <h3 className="text-xl font-semibold text-white">Editorial content editor</h3>
              {!assetForm.destinationId ? (
                <p className="mt-4 text-slate-400">Choose a destination from the editor workspace to edit the editorial narrative fields.</p>
              ) : (
                <>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    Fill in the destination story, tone, and practical positioning without writing JSON by hand.
                  </p>
                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <label className="space-y-2 text-sm">
                      <span className="text-slate-300">Title</span>
                      <input
                        value={editorialForm.title ?? ""}
                        onChange={(event) => setEditorialForm((current) => ({ ...current, title: event.target.value }))}
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400"
                      />
                    </label>
                    <label className="space-y-2 text-sm">
                      <span className="text-slate-300">Subtitle</span>
                      <input
                        value={editorialForm.subtitle ?? ""}
                        onChange={(event) => setEditorialForm((current) => ({ ...current, subtitle: event.target.value }))}
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400"
                      />
                    </label>
                    <label className="space-y-2 text-sm lg:col-span-2">
                      <span className="text-slate-300">Introduction</span>
                      <textarea
                        value={editorialForm.introduction ?? ""}
                        onChange={(event) => setEditorialForm((current) => ({ ...current, introduction: event.target.value }))}
                        rows={4}
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                      />
                    </label>
                    <label className="space-y-2 text-sm lg:col-span-2">
                      <span className="text-slate-300">Hero narrative</span>
                      <textarea
                        value={editorialForm.heroNarrative ?? ""}
                        onChange={(event) => setEditorialForm((current) => ({ ...current, heroNarrative: event.target.value }))}
                        rows={4}
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                      />
                    </label>
                    <label className="space-y-2 text-sm">
                      <span className="text-slate-300">Lifestyle narrative</span>
                      <textarea
                        value={editorialForm.lifestyleNarrative ?? ""}
                        onChange={(event) => setEditorialForm((current) => ({ ...current, lifestyleNarrative: event.target.value }))}
                        rows={4}
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                      />
                    </label>
                    <label className="space-y-2 text-sm">
                      <span className="text-slate-300">Climate narrative</span>
                      <textarea
                        value={editorialForm.climateNarrative ?? ""}
                        onChange={(event) => setEditorialForm((current) => ({ ...current, climateNarrative: event.target.value }))}
                        rows={4}
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                      />
                    </label>
                    <label className="space-y-2 text-sm">
                      <span className="text-slate-300">Transportation narrative</span>
                      <textarea
                        value={editorialForm.transportationNarrative ?? ""}
                        onChange={(event) => setEditorialForm((current) => ({ ...current, transportationNarrative: event.target.value }))}
                        rows={4}
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                      />
                    </label>
                    <label className="space-y-2 text-sm">
                      <span className="text-slate-300">Verdict</span>
                      <textarea
                        value={editorialForm.verdict ?? ""}
                        onChange={(event) => setEditorialForm((current) => ({ ...current, verdict: event.target.value }))}
                        rows={4}
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                      />
                    </label>
                    <label className="space-y-2 text-sm lg:col-span-2">
                      <span className="text-slate-300">Best for (one per line)</span>
                      <textarea
                        value={formatListField(editorialForm.bestFor)}
                        onChange={(event) => setEditorialForm((current) => ({ ...current, bestFor: parseListField(event.target.value) }))}
                        rows={3}
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                      />
                    </label>
                    <label className="space-y-2 text-sm lg:col-span-2">
                      <span className="text-slate-300">Not ideal for (one per line)</span>
                      <textarea
                        value={formatListField(editorialForm.notIdealFor)}
                        onChange={(event) => setEditorialForm((current) => ({ ...current, notIdealFor: parseListField(event.target.value) }))}
                        rows={3}
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                      />
                    </label>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void handleSaveEditorialContent()}
                      disabled={!canManage || isSavingEditorial}
                      className="rounded-full bg-cyan-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSavingEditorial ? "Saving..." : "Save editorial content"}
                    </button>
                  </div>
                  {editorialError ? <p className="mt-3 text-sm text-rose-300">{editorialError}</p> : null}
                </>
              )}
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
              <h3 className="text-xl font-semibold text-white">Research profile editor</h3>
              {!assetForm.destinationId ? (
                <p className="mt-4 text-slate-400">Choose a destination from the editor workspace to edit the research profile fields.</p>
              ) : (
                <>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    Capture the practical and emotional reasons this destination is compelling for long-stay relocation.
                  </p>
                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <label className="space-y-2 text-sm lg:col-span-2">
                      <span className="text-slate-300">Overview</span>
                      <textarea
                        value={researchForm.overview ?? ""}
                        onChange={(event) => setResearchForm((current) => ({ ...current, overview: event.target.value }))}
                        rows={3}
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                      />
                    </label>
                    <label className="space-y-2 text-sm">
                      <span className="text-slate-300">Feel</span>
                      <textarea
                        value={researchForm.feel ?? ""}
                        onChange={(event) => setResearchForm((current) => ({ ...current, feel: event.target.value }))}
                        rows={3}
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                      />
                    </label>
                    <label className="space-y-2 text-sm">
                      <span className="text-slate-300">Why people love it</span>
                      <textarea
                        value={researchForm.whyPeopleLoveIt ?? ""}
                        onChange={(event) => setResearchForm((current) => ({ ...current, whyPeopleLoveIt: event.target.value }))}
                        rows={3}
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                      />
                    </label>
                    <label className="space-y-2 text-sm">
                      <span className="text-slate-300">Climate</span>
                      <textarea
                        value={researchForm.climate ?? ""}
                        onChange={(event) => setResearchForm((current) => ({ ...current, climate: event.target.value }))}
                        rows={3}
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                      />
                    </label>
                    <label className="space-y-2 text-sm">
                      <span className="text-slate-300">Cost of living</span>
                      <textarea
                        value={researchForm.costOfLiving ?? ""}
                        onChange={(event) => setResearchForm((current) => ({ ...current, costOfLiving: event.target.value }))}
                        rows={3}
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                      />
                    </label>
                    <label className="space-y-2 text-sm">
                      <span className="text-slate-300">Healthcare</span>
                      <textarea
                        value={researchForm.healthcare ?? ""}
                        onChange={(event) => setResearchForm((current) => ({ ...current, healthcare: event.target.value }))}
                        rows={3}
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                      />
                    </label>
                    <label className="space-y-2 text-sm">
                      <span className="text-slate-300">Safety</span>
                      <textarea
                        value={researchForm.safety ?? ""}
                        onChange={(event) => setResearchForm((current) => ({ ...current, safety: event.target.value }))}
                        rows={3}
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                      />
                    </label>
                    <label className="space-y-2 text-sm">
                      <span className="text-slate-300">Transportation</span>
                      <textarea
                        value={researchForm.transportation ?? ""}
                        onChange={(event) => setResearchForm((current) => ({ ...current, transportation: event.target.value }))}
                        rows={3}
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                      />
                    </label>
                    <label className="space-y-2 text-sm">
                      <span className="text-slate-300">Best neighborhoods (one per line)</span>
                      <textarea
                        value={formatListField(researchForm.bestNeighborhoods)}
                        onChange={(event) => setResearchForm((current) => ({ ...current, bestNeighborhoods: parseListField(event.target.value) }))}
                        rows={3}
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                      />
                    </label>
                    <label className="space-y-2 text-sm">
                      <span className="text-slate-300">Food (one per line)</span>
                      <textarea
                        value={formatListField(researchForm.food)}
                        onChange={(event) => setResearchForm((current) => ({ ...current, food: parseListField(event.target.value) }))}
                        rows={3}
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                      />
                    </label>
                    <label className="space-y-2 text-sm lg:col-span-2">
                      <span className="text-slate-300">Pros (one per line)</span>
                      <textarea
                        value={formatListField(researchForm.pros)}
                        onChange={(event) => setResearchForm((current) => ({ ...current, pros: parseListField(event.target.value) }))}
                        rows={3}
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                      />
                    </label>
                    <label className="space-y-2 text-sm lg:col-span-2">
                      <span className="text-slate-300">Cons (one per line)</span>
                      <textarea
                        value={formatListField(researchForm.cons)}
                        onChange={(event) => setResearchForm((current) => ({ ...current, cons: parseListField(event.target.value) }))}
                        rows={3}
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                      />
                    </label>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void handleSaveResearchProfile()}
                      disabled={!canManage || isSavingResearch}
                      className="rounded-full bg-cyan-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSavingResearch ? "Saving..." : "Save research profile"}
                    </button>
                  </div>
                  {researchError ? <p className="mt-3 text-sm text-rose-300">{researchError}</p> : null}
                </>
              )}
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
              <h3 className="text-xl font-semibold text-white">Command center dataset editor</h3>
              {!assetForm.destinationId ? (
                <p className="mt-4 text-slate-400">Choose a destination from the editor workspace to load and edit normalized command center rows.</p>
              ) : (
                <>
                  <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto_auto_auto_auto]">
                    <select
                      value={commandCenterDataset}
                      onChange={(event) => setCommandCenterDataset(event.target.value as CommandCenterDatasetKey)}
                      className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400"
                    >
                      {COMMAND_CENTER_DATASETS.map((dataset) => (
                        <option key={dataset.key} value={dataset.key}>{dataset.label}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleFormatCommandCenterRows}
                      className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-200"
                    >
                      Format JSON
                    </button>
                    <button
                      type="button"
                      onClick={handleLoadCommandCenterSampleRow}
                      className="rounded-full border border-cyan-400/40 px-4 py-2 text-xs uppercase tracking-[0.2em] text-cyan-200"
                    >
                      Insert sample row
                    </button>
                    <button
                      type="button"
                      onClick={() => setCommandCenterRowsDraft("[]")}
                      className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-200"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleSaveCommandCenterRows()}
                      disabled={!canManage || isSavingCommandCenterRows || isLoadingCommandCenterRows}
                      className="rounded-full bg-cyan-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSavingCommandCenterRows ? "Saving..." : "Save dataset"}
                    </button>
                  </div>

                  <p className="mt-3 text-sm text-slate-400">
                    Rows loaded: {commandCenterRowsCount}. This editor replaces all rows in the selected dataset for the current destination on save.
                  </p>

                  {commandCenterFormSupported ? (
                    <div className="mt-3 inline-flex rounded-full border border-white/10 bg-white/5 p-1">
                      <button
                        type="button"
                        onClick={() => setCommandCenterEditorMode("form")}
                        className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${commandCenterEditorMode === "form" ? "bg-cyan-500 text-slate-950" : "text-slate-200"}`}
                      >
                        Form editor
                      </button>
                      <button
                        type="button"
                        onClick={() => setCommandCenterEditorMode("json")}
                        className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${commandCenterEditorMode === "json" ? "bg-cyan-500 text-slate-950" : "text-slate-200"}`}
                      >
                        JSON editor
                      </button>
                    </div>
                  ) : null}

                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Dataset field guide</p>
                    <div className="mt-3 grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Required fields</p>
                        <p className="mt-2 text-sm text-slate-200">{selectedDatasetGuide.requiredFields.join(", ")}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Optional fields</p>
                        <p className="mt-2 text-sm text-slate-300">{selectedDatasetGuide.optionalFields.join(", ")}</p>
                      </div>
                    </div>
                  </div>

                  {isLoadingCommandCenterRows ? (
                    <p className="mt-4 text-slate-400">Loading dataset rows...</p>
                  ) : commandCenterFormSupported && commandCenterEditorMode === "form" ? (
                    parsedCommandCenterRows ? (
                      <div className="mt-4 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Structured rows</p>
                          <button
                            type="button"
                            onClick={handleAddFormRow}
                            className="rounded-full border border-cyan-400/50 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-cyan-200"
                          >
                            Add row
                          </button>
                        </div>

                        {parsedCommandCenterRows.length === 0 ? (
                          <p className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-400">No rows yet. Click Add row or Insert sample row.</p>
                        ) : null}

                        {commandCenterDataset === "destination_core_metrics"
                          ? parsedCommandCenterRows.map((row, index) => (
                            <div key={`core-${index}`} className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
                              <div className="grid gap-3 md:grid-cols-3">
                                <input value={String(row.metric_group ?? "")} onChange={(event) => handleUpdateFormRowField(index, "metric_group", event.target.value)} placeholder="metric_group" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400" />
                                <input value={String(row.metric_key ?? "")} onChange={(event) => handleUpdateFormRowField(index, "metric_key", event.target.value)} placeholder="metric_key*" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400" />
                                <input value={String(row.metric_label ?? "")} onChange={(event) => handleUpdateFormRowField(index, "metric_label", event.target.value)} placeholder="metric_label*" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400" />
                                <input value={row.value_numeric == null ? "" : String(row.value_numeric)} onChange={(event) => handleUpdateFormRowField(index, "value_numeric", event.target.value)} placeholder="value_numeric" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400" />
                                <input value={String(row.value_text ?? "")} onChange={(event) => handleUpdateFormRowField(index, "value_text", event.target.value)} placeholder="value_text" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400" />
                                <input value={String(row.unit ?? "")} onChange={(event) => handleUpdateFormRowField(index, "unit", event.target.value)} placeholder="unit" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400" />
                                <input value={String(row.display_value ?? "")} onChange={(event) => handleUpdateFormRowField(index, "display_value", event.target.value)} placeholder="display_value" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400" />
                                <input value={String(row.verification_status ?? "")} onChange={(event) => handleUpdateFormRowField(index, "verification_status", event.target.value)} placeholder="verification_status" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400" />
                                <input value={String(row.confidence_level ?? "")} onChange={(event) => handleUpdateFormRowField(index, "confidence_level", event.target.value)} placeholder="confidence_level" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400" />
                              </div>
                              <div className="mt-3 flex justify-end">
                                <button type="button" onClick={() => handleRemoveFormRow(index)} className="rounded-full border border-rose-400/60 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-rose-200">Remove</button>
                              </div>
                            </div>
                          ))
                          : null}

                        {commandCenterDataset === "destination_scores"
                          ? parsedCommandCenterRows.map((row, index) => (
                            <div key={`score-${index}`} className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
                              <div className="grid gap-3 md:grid-cols-3">
                                <input value={String(row.category ?? "")} onChange={(event) => handleUpdateFormRowField(index, "category", event.target.value)} placeholder="category*" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400" />
                                <input value={row.score == null ? "" : String(row.score)} onChange={(event) => handleUpdateFormRowField(index, "score", event.target.value)} placeholder="score" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400" />
                                <input value={row.personalized_weight == null ? "" : String(row.personalized_weight)} onChange={(event) => handleUpdateFormRowField(index, "personalized_weight", event.target.value)} placeholder="personalized_weight" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400" />
                                <input value={row.sort_order == null ? "" : String(row.sort_order)} onChange={(event) => handleUpdateFormRowField(index, "sort_order", event.target.value)} placeholder="sort_order" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400" />
                                <input value={String(row.verification_status ?? "")} onChange={(event) => handleUpdateFormRowField(index, "verification_status", event.target.value)} placeholder="verification_status" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400" />
                                <input value={String(row.confidence_level ?? "")} onChange={(event) => handleUpdateFormRowField(index, "confidence_level", event.target.value)} placeholder="confidence_level" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400" />
                              </div>
                              <textarea value={String(row.explanation ?? "")} onChange={(event) => handleUpdateFormRowField(index, "explanation", event.target.value)} placeholder="explanation" className="mt-3 min-h-[70px] w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400" />
                              <textarea value={String(row.underlying_measurements ?? "")} onChange={(event) => handleUpdateFormRowField(index, "underlying_measurements", event.target.value)} placeholder="underlying_measurements" className="mt-3 min-h-[60px] w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400" />
                              <div className="mt-3 flex justify-end">
                                <button type="button" onClick={() => handleRemoveFormRow(index)} className="rounded-full border border-rose-400/60 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-rose-200">Remove</button>
                              </div>
                            </div>
                          ))
                          : null}
                      </div>
                    ) : (
                      <div className="mt-4 rounded-2xl border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-200">
                        Current JSON is invalid for form editing. Switch to JSON editor and correct it first.
                      </div>
                    )
                  ) : (
                    <textarea
                      value={commandCenterRowsDraft}
                      onChange={(event) => {
                        setCommandCenterRowsDraft(event.target.value);
                        setCommandCenterRowsError(null);
                      }}
                      className="mt-4 min-h-[300px] w-full rounded-3xl border border-white/10 bg-slate-950/90 p-4 font-mono text-xs leading-6 text-slate-200 outline-none focus:border-cyan-400"
                      spellCheck={false}
                    />
                  )}

                  {commandCenterRowsError ? <p className="mt-3 text-sm text-rose-300">{commandCenterRowsError}</p> : null}
                </>
              )}
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
              <h3 className="text-xl font-semibold text-white">Linked records for selected destination</h3>
              {!assetForm.destinationId ? (
                <p className="mt-4 text-slate-400">Choose a destination from the editor workspace to manage media, resources, and videos.</p>
              ) : isLoadingAssets ? (
                <p className="mt-4 text-slate-400">Loading linked records...</p>
              ) : linkedAssets.length === 0 ? (
                <p className="mt-4 text-slate-400">No linked records found for this destination yet.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {linkedAssets.map((asset) => {
                    const isEditing = editingAssetId === asset.id;

                    return (
                      <article key={asset.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-cyan-300">
                          <span className="rounded-full bg-cyan-500/10 px-3 py-1">{asset.assetType}</span>
                          {asset.category ? <span className="rounded-full bg-white/10 px-3 py-1">{asset.category}</span> : null}
                          {asset.kind ? <span className="rounded-full bg-white/10 px-3 py-1">{asset.kind}</span> : null}
                        </div>

                        {isEditing && assetEditForm ? (
                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <input value={assetEditForm.label} onChange={(event) => setAssetEditForm((current) => current ? { ...current, label: event.target.value } : current)} className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400" />
                            <input value={assetEditForm.provider} onChange={(event) => setAssetEditForm((current) => current ? { ...current, provider: event.target.value } : current)} className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400" />
                            <input value={assetEditForm.url} onChange={(event) => setAssetEditForm((current) => current ? { ...current, url: event.target.value } : current)} className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400 sm:col-span-2" />
                            {asset.assetType === "resource" ? (
                              <input value={assetEditForm.category} onChange={(event) => setAssetEditForm((current) => current ? { ...current, category: event.target.value } : current)} className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400" />
                            ) : null}
                            {asset.assetType === "media" ? (
                              <input value={assetEditForm.kind} onChange={(event) => setAssetEditForm((current) => current ? { ...current, kind: event.target.value } : current)} className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400" />
                            ) : null}
                            {asset.assetType === "video" ? (
                              <input value={assetEditForm.embedUrl} onChange={(event) => setAssetEditForm((current) => current ? { ...current, embedUrl: event.target.value } : current)} className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-cyan-400" placeholder="Embed URL (optional)" />
                            ) : null}
                          </div>
                        ) : (
                          <div className="mt-4 space-y-2">
                            <p className="text-base font-semibold text-white">{asset.label}</p>
                            <p className="text-sm text-slate-400">{asset.provider}</p>
                            <p className="text-sm text-slate-500 break-all">{asset.url}</p>
                          </div>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2">
                          {isEditing ? (
                            <>
                              <button type="button" onClick={() => void handleSaveAssetEdit()} disabled={!canManage} className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60">Save</button>
                              <button type="button" onClick={() => { setEditingAssetId(null); setAssetEditForm(null); }} className="rounded-full border border-white/20 px-4 py-2 text-sm text-slate-200">Cancel</button>
                            </>
                          ) : (
                            <>
                              <button type="button" onClick={() => handleStartEditAsset(asset)} disabled={!canManage} className="rounded-full border border-cyan-400/60 px-4 py-2 text-sm text-cyan-200 disabled:cursor-not-allowed disabled:opacity-60">Edit</button>
                              <button type="button" onClick={() => void handleDeleteAsset(asset)} disabled={!canManage} className="rounded-full border border-rose-400/60 px-4 py-2 text-sm text-rose-200 disabled:cursor-not-allowed disabled:opacity-60">Delete</button>
                            </>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
              <h3 className="text-xl font-semibold text-white">Catalog entries</h3>
              {isLoading ? (
                <p className="mt-4 text-slate-400">Loading destination records...</p>
              ) : destinations.length === 0 ? (
                <p className="mt-4 text-slate-400">No destinations returned from Supabase for this session.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {destinations.map((destination) => (
                    <article key={destination.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <p className="text-lg font-semibold text-white">{destination.city}, {destination.country}</p>
                          <p className="mt-1 text-sm text-slate-400">{destination.slug}</p>
                          <p className="mt-2 text-xs text-slate-500">Media {destination.mediaCount} • Resources {destination.resourceCount} • Videos {destination.videoCount}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            value={destination.status}
                            onChange={(event) => void handleStatusChange(destination.id, event.target.value as AdminDestination["status"])}
                            disabled={!canManage}
                            className="rounded-full border border-white/10 bg-slate-950/90 px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <option value="draft">Draft</option>
                            <option value="review">Review</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => void handleDeleteDestination(destination.id)}
                            disabled={!canManage}
                            className="rounded-full border border-rose-400/60 px-3 py-2 text-sm text-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}