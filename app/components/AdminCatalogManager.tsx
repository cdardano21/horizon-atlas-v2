"use client";

import { useEffect, useMemo, useState } from "react";
import type { DestinationMemberDetails, DestinationRelocationProfile } from "../lib/destinations";
import {
  appendFormRow,
  isCommandCenterFormDataset,
  parseCommandCenterRowsDraft,
  removeFormRow,
  type CommandCenterDatasetKey,
  updateFormRowField,
} from "./commandCenterFormUtils";

type AdminDestination = {
  id: string;
  slug: string;
  city: string;
  country: string;
  status: "draft" | "review" | "published" | "archived";
  tier: string;
  description: string | null;
  updated_at: string;
  mediaCount: number;
  resourceCount: number;
  videoCount: number;
  relocationProfile?: DestinationRelocationProfile | null;
  memberDetails?: DestinationMemberDetails | null;
};

type DestinationPayload = {
  city: string;
  country: string;
  slug: string;
  status: "draft" | "review" | "published" | "archived";
  tier: string;
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

const EMPTY_ASSET_FORM: AssetPayload = {
  destinationId: "",
  assetType: "resource",
  label: "",
  url: "",
  provider: "manual",
  category: "guides",
  kind: "gallery",
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
    { category: "Overall Match", score: 90, context: "Weighted by Horizon Atlas relocation model." },
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
      { category: "Overall Match", score: score(84, hasTag("expat-friendly") ? 6 : 0), context: "Derived from current Horizon Atlas tags and structured signals." },
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
  const [destinationForm, setDestinationForm] = useState<DestinationPayload>(EMPTY_DESTINATION_FORM);
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
  const [relocationEditorMode, setRelocationEditorMode] = useState<"form" | "json">("form");
  const [relocationFormTab, setRelocationFormTab] = useState<"summary" | "scorecard" | "sections" | "coverage">("summary");
  const [commandCenterDataset, setCommandCenterDataset] = useState<CommandCenterDatasetKey>("destination_core_metrics");
  const [commandCenterRowsDraft, setCommandCenterRowsDraft] = useState("[]");
  const [commandCenterRowsError, setCommandCenterRowsError] = useState<string | null>(null);
  const [isLoadingCommandCenterRows, setIsLoadingCommandCenterRows] = useState(false);
  const [isSavingCommandCenterRows, setIsSavingCommandCenterRows] = useState(false);
  const [commandCenterEditorMode, setCommandCenterEditorMode] = useState<"form" | "json">("form");

  const selectedDestination = useMemo(
    () => destinations.find((destination) => destination.id === assetForm.destinationId) ?? null,
    [assetForm.destinationId, destinations],
  );

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
        return;
      }

      const value = selectedDestination.relocationProfile ?? RELOCATION_PROFILE_TEMPLATE;
      setRelocationProfileDraft(JSON.stringify(value, null, 2));
      setRelocationProfileError(null);
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

  const handleCreateDestination = async () => {
    if (!canManage) return;

    const response = await fetch("/api/admin/destinations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(destinationForm),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({ error: "Unable to create destination." }))) as { error?: string };
      setStatusMessage(payload.error ?? "Unable to create destination.");
      return;
    }

    setDestinationForm(EMPTY_DESTINATION_FORM);
    setStatusMessage("Destination created.");
    await loadDestinations();
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

    setStatusMessage("Status updated.");
    await loadDestinations();
  };

  const handleDeleteDestination = async (destinationId: string) => {
    if (!canManage) return;

    const response = await fetch(`/api/admin/destinations/${destinationId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setStatusMessage("Could not delete destination.");
      return;
    }

    setStatusMessage("Destination deleted.");
    await loadDestinations();
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
    <div className="space-y-6">
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
          <h3 className="text-xl font-semibold text-white">Create destination</h3>
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
        <h3 className="text-xl font-semibold text-white">Destination taxonomy</h3>
        {!assetForm.destinationId ? (
          <p className="mt-4 text-slate-400">Choose a destination above to manage tags.</p>
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
        <h3 className="text-xl font-semibold text-white">Relocation profile editor</h3>
        {!assetForm.destinationId ? (
          <p className="mt-4 text-slate-400">Choose a destination above to edit AI summary, scorecard, and comprehensive profile sections.</p>
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
        <h3 className="text-xl font-semibold text-white">Command center dataset editor</h3>
        {!assetForm.destinationId ? (
          <p className="mt-4 text-slate-400">Choose a destination above to load and edit normalized command center rows.</p>
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
          <p className="mt-4 text-slate-400">Choose a destination above to manage media, resources, and videos.</p>
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
    </div>
  );
}