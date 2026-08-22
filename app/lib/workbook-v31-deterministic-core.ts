import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

type DeterministicV31CanonicalStringValue = string | null;

const deterministicWorkbookImportCache = new Map<string, Promise<DeterministicV31WorkbookImport>>();
const shouldUseDeterministicWorkbookImportCache = () => process.env.NODE_ENV !== "test" && process.env.VITEST !== "true";

export interface DeterministicV31CanonicalIdentity {
  destinationKey: string;
  slug: DeterministicV31CanonicalStringValue;
  name: DeterministicV31CanonicalStringValue;
  city: DeterministicV31CanonicalStringValue;
  country: DeterministicV31CanonicalStringValue;
  population?: DeterministicV31CanonicalStringValue;
  metroPopulation?: DeterministicV31CanonicalStringValue;
  elevationMeters?: DeterministicV31CanonicalStringValue;
  latitude?: DeterministicV31CanonicalStringValue;
  longitude?: DeterministicV31CanonicalStringValue;
}

export interface DeterministicV31CanonicalEditorial {
  shortDescription: DeterministicV31CanonicalStringValue;
  longDescription: DeterministicV31CanonicalStringValue;
  currency: DeterministicV31CanonicalStringValue;
  primaryLanguage: DeterministicV31CanonicalStringValue;
  timeZone: DeterministicV31CanonicalStringValue;
}

export interface DeterministicV31CanonicalFact {
  destination_key: string;
  record_key: DeterministicV31CanonicalStringValue;
  fact_group: DeterministicV31CanonicalStringValue;
  fact_key: DeterministicV31CanonicalStringValue;
  display_label: DeterministicV31CanonicalStringValue;
  value_text: DeterministicV31CanonicalStringValue;
  value_number: DeterministicV31CanonicalStringValue;
  unit: DeterministicV31CanonicalStringValue;
  qualitative_rating: DeterministicV31CanonicalStringValue;
  stay_mode_key: DeterministicV31CanonicalStringValue;
  display_order: DeterministicV31CanonicalStringValue;
  source_name: DeterministicV31CanonicalStringValue;
  source_url: DeterministicV31CanonicalStringValue;
  verified: DeterministicV31CanonicalStringValue;
  verified_at: DeterministicV31CanonicalStringValue;
  confidence: DeterministicV31CanonicalStringValue;
  notes: DeterministicV31CanonicalStringValue;
  factKey: DeterministicV31CanonicalStringValue;
  factGroup: DeterministicV31CanonicalStringValue;
  valueText: DeterministicV31CanonicalStringValue;
  displayLabel: DeterministicV31CanonicalStringValue;
  sourceName: DeterministicV31CanonicalStringValue;
}

export interface DeterministicV31CanonicalScore {
  destination_key: string;
  score_key: DeterministicV31CanonicalStringValue;
  score_value: DeterministicV31CanonicalStringValue;
  score_label: DeterministicV31CanonicalStringValue;
  methodology_version: DeterministicV31CanonicalStringValue;
  evidence_summary: DeterministicV31CanonicalStringValue;
  source_url: DeterministicV31CanonicalStringValue;
  verified: DeterministicV31CanonicalStringValue;
  verified_at: DeterministicV31CanonicalStringValue;
  scoreKey: DeterministicV31CanonicalStringValue;
  scoreValue: DeterministicV31CanonicalStringValue;
  scoreLabel: DeterministicV31CanonicalStringValue;
  methodologyVersion: DeterministicV31CanonicalStringValue;
}

export interface DeterministicV31CanonicalNeighborhood {
  destination_key: string;
  neighborhood_key: DeterministicV31CanonicalStringValue;
  neighborhood_name: DeterministicV31CanonicalStringValue;
  area_type: DeterministicV31CanonicalStringValue;
  best_for: DeterministicV31CanonicalStringValue;
  summary: DeterministicV31CanonicalStringValue;
  housing_character: DeterministicV31CanonicalStringValue;
  typical_rent_low: DeterministicV31CanonicalStringValue;
  typical_rent_high: DeterministicV31CanonicalStringValue;
  typical_home_price: DeterministicV31CanonicalStringValue;
  walkability_rating: DeterministicV31CanonicalStringValue;
  safety_rating: DeterministicV31CanonicalStringValue;
  transit_rating: DeterministicV31CanonicalStringValue;
  pros: DeterministicV31CanonicalStringValue;
  cons: DeterministicV31CanonicalStringValue;
  google_maps_url: DeterministicV31CanonicalStringValue;
  source_url: DeterministicV31CanonicalStringValue;
  verified: DeterministicV31CanonicalStringValue;
  verified_at: DeterministicV31CanonicalStringValue;
}

export interface DeterministicV31CanonicalPlace {
  destination_key: string;
  place_key: DeterministicV31CanonicalStringValue;
  neighborhood_key: DeterministicV31CanonicalStringValue;
  category_key: DeterministicV31CanonicalStringValue;
  place_name: DeterministicV31CanonicalStringValue;
  subcategory: DeterministicV31CanonicalStringValue;
  description: DeterministicV31CanonicalStringValue;
  address: DeterministicV31CanonicalStringValue;
  latitude: DeterministicV31CanonicalStringValue;
  longitude: DeterministicV31CanonicalStringValue;
  price_level: DeterministicV31CanonicalStringValue;
  website_url: DeterministicV31CanonicalStringValue;
  google_maps_url: DeterministicV31CanonicalStringValue;
  phone: DeterministicV31CanonicalStringValue;
  best_for: DeterministicV31CanonicalStringValue;
  display_order: DeterministicV31CanonicalStringValue;
  source_name: DeterministicV31CanonicalStringValue;
  source_url: DeterministicV31CanonicalStringValue;
  verified: DeterministicV31CanonicalStringValue;
  verified_at: DeterministicV31CanonicalStringValue;
  confidence: DeterministicV31CanonicalStringValue;
}

export interface DeterministicV31CanonicalResource {
  destination_key: string;
  resource_key: DeterministicV31CanonicalStringValue;
  resource_category: DeterministicV31CanonicalStringValue;
  resource_name: DeterministicV31CanonicalStringValue;
  description: DeterministicV31CanonicalStringValue;
  url: DeterministicV31CanonicalStringValue;
  official: DeterministicV31CanonicalStringValue;
  stay_mode_key: DeterministicV31CanonicalStringValue;
  display_order: DeterministicV31CanonicalStringValue;
  source_name: DeterministicV31CanonicalStringValue;
  source_url: DeterministicV31CanonicalStringValue;
  verified: DeterministicV31CanonicalStringValue;
  verified_at: DeterministicV31CanonicalStringValue;
}

export interface DeterministicV31CanonicalMedia {
  destination_key: string;
  media_key: DeterministicV31CanonicalStringValue;
  media_type: DeterministicV31CanonicalStringValue;
  image_url: DeterministicV31CanonicalStringValue;
  caption: DeterministicV31CanonicalStringValue;
  subject: DeterministicV31CanonicalStringValue;
  primary_image: DeterministicV31CanonicalStringValue;
  gallery_order: DeterministicV31CanonicalStringValue;
  license_notes: DeterministicV31CanonicalStringValue;
  source_name: DeterministicV31CanonicalStringValue;
  source_url: DeterministicV31CanonicalStringValue;
  verified: DeterministicV31CanonicalStringValue;
  verified_at: DeterministicV31CanonicalStringValue;
  confidence: DeterministicV31CanonicalStringValue;
}

export interface DeterministicV31CanonicalCostOfLivingItem {
  destination_key: string;
  record_key: DeterministicV31CanonicalStringValue;
  household_type: DeterministicV31CanonicalStringValue;
  lifestyle_tier: DeterministicV31CanonicalStringValue;
  category: DeterministicV31CanonicalStringValue;
  monthly_low: DeterministicV31CanonicalStringValue;
  monthly_high: DeterministicV31CanonicalStringValue;
  currency: DeterministicV31CanonicalStringValue;
  included_notes: DeterministicV31CanonicalStringValue;
  stay_mode_key: DeterministicV31CanonicalStringValue;
  source_name: DeterministicV31CanonicalStringValue;
  source_url: DeterministicV31CanonicalStringValue;
  verified: DeterministicV31CanonicalStringValue;
  verified_at: DeterministicV31CanonicalStringValue;
}

export interface DeterministicV31CanonicalClimateMonth {
  destination_key: string;
  month: DeterministicV31CanonicalStringValue;
  avg_high_c: DeterministicV31CanonicalStringValue;
  avg_low_c: DeterministicV31CanonicalStringValue;
  rainfall_mm: DeterministicV31CanonicalStringValue;
  humidity_pct: DeterministicV31CanonicalStringValue;
  sunshine_hours: DeterministicV31CanonicalStringValue;
  snowfall_cm: DeterministicV31CanonicalStringValue;
  water_temp_c: DeterministicV31CanonicalStringValue;
  extreme_weather_notes: DeterministicV31CanonicalStringValue;
  source_name: DeterministicV31CanonicalStringValue;
  source_url: DeterministicV31CanonicalStringValue;
  verified: DeterministicV31CanonicalStringValue;
}

export interface DeterministicV31CanonicalHousingState {
  destination_key: string;
  record_key: DeterministicV31CanonicalStringValue;
  housing_topic: DeterministicV31CanonicalStringValue;
  stay_mode_key: DeterministicV31CanonicalStringValue;
  can_foreigners_buy: DeterministicV31CanonicalStringValue;
  residency_required_to_buy: DeterministicV31CanonicalStringValue;
  restrictions_summary: DeterministicV31CanonicalStringValue;
  typical_condo_price: DeterministicV31CanonicalStringValue;
  typical_house_price: DeterministicV31CanonicalStringValue;
  typical_villa_price: DeterministicV31CanonicalStringValue;
  price_per_sqm: DeterministicV31CanonicalStringValue;
  currency: DeterministicV31CanonicalStringValue;
  property_tax_notes: DeterministicV31CanonicalStringValue;
  transfer_tax_notes: DeterministicV31CanonicalStringValue;
  closing_cost_notes: DeterministicV31CanonicalStringValue;
  hoa_condo_fee_notes: DeterministicV31CanonicalStringValue;
  foreigner_mortgage_notes: DeterministicV31CanonicalStringValue;
  typical_down_payment_pct: DeterministicV31CanonicalStringValue;
  rental_rules_notes: DeterministicV31CanonicalStringValue;
  buying_process_summary: DeterministicV31CanonicalStringValue;
  source_name: DeterministicV31CanonicalStringValue;
  source_url: DeterministicV31CanonicalStringValue;
  verified: DeterministicV31CanonicalStringValue;
  verified_at: DeterministicV31CanonicalStringValue;
}

export interface DeterministicV31CanonicalPropertyResource {
  destination_key: string;
  resource_key: DeterministicV31CanonicalStringValue;
  transaction_type: DeterministicV31CanonicalStringValue;
  resource_name: DeterministicV31CanonicalStringValue;
  resource_type: DeterministicV31CanonicalStringValue;
  url: DeterministicV31CanonicalStringValue;
  official: DeterministicV31CanonicalStringValue;
  description: DeterministicV31CanonicalStringValue;
  source_url: DeterministicV31CanonicalStringValue;
  verified: DeterministicV31CanonicalStringValue;
  verified_at: DeterministicV31CanonicalStringValue;
}

export interface DeterministicV31CanonicalHealthcareState {
  destination_key: string;
  record_key: DeterministicV31CanonicalStringValue;
  topic: DeterministicV31CanonicalStringValue;
  system_summary: DeterministicV31CanonicalStringValue;
  public_access_foreigners: DeterministicV31CanonicalStringValue;
  private_care_available: DeterministicV31CanonicalStringValue;
  english_speaking_care: DeterministicV31CanonicalStringValue;
  typical_gp_visit_cost: DeterministicV31CanonicalStringValue;
  typical_specialist_cost: DeterministicV31CanonicalStringValue;
  currency: DeterministicV31CanonicalStringValue;
  medicare_applicability: DeterministicV31CanonicalStringValue;
  international_insurance_notes: DeterministicV31CanonicalStringValue;
  emergency_number: DeterministicV31CanonicalStringValue;
  pharmacy_notes: DeterministicV31CanonicalStringValue;
  source_name: DeterministicV31CanonicalStringValue;
  source_url: DeterministicV31CanonicalStringValue;
  verified: DeterministicV31CanonicalStringValue;
  verified_at: DeterministicV31CanonicalStringValue;
}

export interface DeterministicV31CanonicalVisaResidencyState {
  destination_key: string;
  record_key: DeterministicV31CanonicalStringValue;
  traveler_nationality: DeterministicV31CanonicalStringValue;
  stay_mode_key: DeterministicV31CanonicalStringValue;
  visa_free_days: DeterministicV31CanonicalStringValue;
  visa_type: DeterministicV31CanonicalStringValue;
  residency_option: DeterministicV31CanonicalStringValue;
  income_requirement: DeterministicV31CanonicalStringValue;
  proof_of_funds: DeterministicV31CanonicalStringValue;
  insurance_requirement: DeterministicV31CanonicalStringValue;
  work_rights: DeterministicV31CanonicalStringValue;
  renewal_notes: DeterministicV31CanonicalStringValue;
  permanent_residency_path: DeterministicV31CanonicalStringValue;
  citizenship_path: DeterministicV31CanonicalStringValue;
  official_source_url: DeterministicV31CanonicalStringValue;
  verified: DeterministicV31CanonicalStringValue;
  verified_at: DeterministicV31CanonicalStringValue;
}

export interface DeterministicV31CanonicalTaxFinanceState {
  destination_key: string;
  record_key: DeterministicV31CanonicalStringValue;
  topic: DeterministicV31CanonicalStringValue;
  summary: DeterministicV31CanonicalStringValue;
  income_tax_notes: DeterministicV31CanonicalStringValue;
  retirement_income_notes: DeterministicV31CanonicalStringValue;
  capital_gains_notes: DeterministicV31CanonicalStringValue;
  property_tax_notes: DeterministicV31CanonicalStringValue;
  vat_sales_tax_notes: DeterministicV31CanonicalStringValue;
  inheritance_wealth_notes: DeterministicV31CanonicalStringValue;
  us_tax_treaty_notes: DeterministicV31CanonicalStringValue;
  bank_account_foreigner_notes: DeterministicV31CanonicalStringValue;
  currency_notes: DeterministicV31CanonicalStringValue;
  source_name: DeterministicV31CanonicalStringValue;
  source_url: DeterministicV31CanonicalStringValue;
  verified: DeterministicV31CanonicalStringValue;
  verified_at: DeterministicV31CanonicalStringValue;
}

export interface DeterministicV31CanonicalLgbtqInclusivityState {
  destination_key: string;
  record_key: DeterministicV31CanonicalStringValue;
  overall_rating: DeterministicV31CanonicalStringValue;
  legal_protections: DeterministicV31CanonicalStringValue;
  social_acceptance: DeterministicV31CanonicalStringValue;
  community_scene: DeterministicV31CanonicalStringValue;
  pride_events: DeterministicV31CanonicalStringValue;
  nightlife_social: DeterministicV31CanonicalStringValue;
  healthcare_access: DeterministicV31CanonicalStringValue;
  areas_resources: DeterministicV31CanonicalStringValue;
  safety_considerations: DeterministicV31CanonicalStringValue;
  evidence_summary: DeterministicV31CanonicalStringValue;
  source_name: DeterministicV31CanonicalStringValue;
  source_url: DeterministicV31CanonicalStringValue;
  verified: DeterministicV31CanonicalStringValue;
  verified_at: DeterministicV31CanonicalStringValue;
}

export interface DeterministicV31CanonicalSafetyRisk {
  destination_key: string;
  record_key: DeterministicV31CanonicalStringValue;
  risk_type: DeterministicV31CanonicalStringValue;
  severity: DeterministicV31CanonicalStringValue;
  summary: DeterministicV31CanonicalStringValue;
  seasonality: DeterministicV31CanonicalStringValue;
  mitigation_notes: DeterministicV31CanonicalStringValue;
  source_name: DeterministicV31CanonicalStringValue;
  source_url: DeterministicV31CanonicalStringValue;
  verified: DeterministicV31CanonicalStringValue;
  verified_at: DeterministicV31CanonicalStringValue;
}

export interface DeterministicV31CanonicalTransportationState {
  destination_key: string;
  record_key: DeterministicV31CanonicalStringValue;
  topic: DeterministicV31CanonicalStringValue;
  name: DeterministicV31CanonicalStringValue;
  summary: DeterministicV31CanonicalStringValue;
  distance_km: DeterministicV31CanonicalStringValue;
  typical_drive_minutes: DeterministicV31CanonicalStringValue;
  public_transit_available: DeterministicV31CanonicalStringValue;
  nonstop_us_service: DeterministicV31CanonicalStringValue;
  car_needed_rating: DeterministicV31CanonicalStringValue;
  parking_notes: DeterministicV31CanonicalStringValue;
  rideshare_notes: DeterministicV31CanonicalStringValue;
  source_name: DeterministicV31CanonicalStringValue;
  source_url: DeterministicV31CanonicalStringValue;
  verified: DeterministicV31CanonicalStringValue;
  verified_at: DeterministicV31CanonicalStringValue;
}

export interface DeterministicV31CanonicalRemoteWorkState {
  destination_key: string;
  record_key: DeterministicV31CanonicalStringValue;
  avg_download_mbps: DeterministicV31CanonicalStringValue;
  fiber_available: DeterministicV31CanonicalStringValue;
  mobile_5g: DeterministicV31CanonicalStringValue;
  utility_reliability: DeterministicV31CanonicalStringValue;
  coworking_summary: DeterministicV31CanonicalStringValue;
  us_time_zone_fit: DeterministicV31CanonicalStringValue;
  remote_work_notes: DeterministicV31CanonicalStringValue;
  source_name: DeterministicV31CanonicalStringValue;
  source_url: DeterministicV31CanonicalStringValue;
  verified: DeterministicV31CanonicalStringValue;
  verified_at: DeterministicV31CanonicalStringValue;
}

export interface DeterministicV31CanonicalLanguageIntegrationState {
  destination_key: string;
  record_key: DeterministicV31CanonicalStringValue;
  primary_language: DeterministicV31CanonicalStringValue;
  english_proficiency: DeterministicV31CanonicalStringValue;
  can_function_in_english: DeterministicV31CanonicalStringValue;
  government_english_access: DeterministicV31CanonicalStringValue;
  medical_english_access: DeterministicV31CanonicalStringValue;
  integration_notes: DeterministicV31CanonicalStringValue;
  language_resources: DeterministicV31CanonicalStringValue;
  source_name: DeterministicV31CanonicalStringValue;
  source_url: DeterministicV31CanonicalStringValue;
  verified: DeterministicV31CanonicalStringValue;
  verified_at: DeterministicV31CanonicalStringValue;
}

export interface DeterministicV31CanonicalPetState {
  destination_key: string;
  record_key: DeterministicV31CanonicalStringValue;
  import_requirements: DeterministicV31CanonicalStringValue;
  quarantine_notes: DeterministicV31CanonicalStringValue;
  vaccination_notes: DeterministicV31CanonicalStringValue;
  pet_friendly_rentals: DeterministicV31CanonicalStringValue;
  vet_access: DeterministicV31CanonicalStringValue;
  emergency_vet_access: DeterministicV31CanonicalStringValue;
  dog_parks_summary: DeterministicV31CanonicalStringValue;
  airline_notes: DeterministicV31CanonicalStringValue;
  source_name: DeterministicV31CanonicalStringValue;
  source_url: DeterministicV31CanonicalStringValue;
  verified: DeterministicV31CanonicalStringValue;
  verified_at: DeterministicV31CanonicalStringValue;
}

export interface DeterministicV31CanonicalFamilyEducationState {
  destination_key: string;
  record_key: DeterministicV31CanonicalStringValue;
  topic: DeterministicV31CanonicalStringValue;
  summary: DeterministicV31CanonicalStringValue;
  international_schools: DeterministicV31CanonicalStringValue;
  childcare_notes: DeterministicV31CanonicalStringValue;
  universities: DeterministicV31CanonicalStringValue;
  pediatric_care: DeterministicV31CanonicalStringValue;
  family_activities: DeterministicV31CanonicalStringValue;
  source_name: DeterministicV31CanonicalStringValue;
  source_url: DeterministicV31CanonicalStringValue;
  verified: DeterministicV31CanonicalStringValue;
  verified_at: DeterministicV31CanonicalStringValue;
}

export interface DeterministicV31CanonicalCommunitySocialState {
  destination_key: string;
  record_key: DeterministicV31CanonicalStringValue;
  topic: DeterministicV31CanonicalStringValue;
  summary: DeterministicV31CanonicalStringValue;
  expat_presence: DeterministicV31CanonicalStringValue;
  clubs_groups: DeterministicV31CanonicalStringValue;
  volunteering: DeterministicV31CanonicalStringValue;
  ease_meeting_people: DeterministicV31CanonicalStringValue;
  age_mix: DeterministicV31CanonicalStringValue;
  transient_vs_rooted: DeterministicV31CanonicalStringValue;
  source_name: DeterministicV31CanonicalStringValue;
  source_url: DeterministicV31CanonicalStringValue;
  verified: DeterministicV31CanonicalStringValue;
  verified_at: DeterministicV31CanonicalStringValue;
}

export interface DeterministicV31CanonicalAccessibilityState {
  destination_key: string;
  record_key: DeterministicV31CanonicalStringValue;
  wheelchair_access: DeterministicV31CanonicalStringValue;
  sidewalk_quality: DeterministicV31CanonicalStringValue;
  hills_terrain: DeterministicV31CanonicalStringValue;
  accessible_transit: DeterministicV31CanonicalStringValue;
  elevator_access: DeterministicV31CanonicalStringValue;
  medical_equipment: DeterministicV31CanonicalStringValue;
  mobility_notes: DeterministicV31CanonicalStringValue;
  source_name: DeterministicV31CanonicalStringValue;
  source_url: DeterministicV31CanonicalStringValue;
  verified: DeterministicV31CanonicalStringValue;
  verified_at: DeterministicV31CanonicalStringValue;
}

export interface DeterministicV31CanonicalBureaucracySetupState {
  destination_key: string;
  record_key: DeterministicV31CanonicalStringValue;
  topic: DeterministicV31CanonicalStringValue;
  difficulty_rating: DeterministicV31CanonicalStringValue;
  summary: DeterministicV31CanonicalStringValue;
  typical_documents: DeterministicV31CanonicalStringValue;
  estimated_timeline: DeterministicV31CanonicalStringValue;
  official_url: DeterministicV31CanonicalStringValue;
  source_name: DeterministicV31CanonicalStringValue;
  source_url: DeterministicV31CanonicalStringValue;
  verified: DeterministicV31CanonicalStringValue;
  verified_at: DeterministicV31CanonicalStringValue;
}

export interface DeterministicV31CanonicalWorkBusinessState {
  destination_key: string;
  record_key: DeterministicV31CanonicalStringValue;
  major_industries: DeterministicV31CanonicalStringValue;
  employment_notes: DeterministicV31CanonicalStringValue;
  work_authorization: DeterministicV31CanonicalStringValue;
  entrepreneurship: DeterministicV31CanonicalStringValue;
  business_formation: DeterministicV31CanonicalStringValue;
  coworking: DeterministicV31CanonicalStringValue;
  remote_work_suitability: DeterministicV31CanonicalStringValue;
  source_name: DeterministicV31CanonicalStringValue;
  source_url: DeterministicV31CanonicalStringValue;
  verified: DeterministicV31CanonicalStringValue;
  verified_at: DeterministicV31CanonicalStringValue;
}

export interface DeterministicV31CanonicalRetirementAgingState {
  destination_key: string;
  record_key: DeterministicV31CanonicalStringValue;
  medicare_notes: DeterministicV31CanonicalStringValue;
  social_security_notes: DeterministicV31CanonicalStringValue;
  senior_discounts: DeterministicV31CanonicalStringValue;
  assisted_living: DeterministicV31CanonicalStringValue;
  home_healthcare: DeterministicV31CanonicalStringValue;
  aging_in_place: DeterministicV31CanonicalStringValue;
  retirement_notes: DeterministicV31CanonicalStringValue;
  source_name: DeterministicV31CanonicalStringValue;
  source_url: DeterministicV31CanonicalStringValue;
  verified: DeterministicV31CanonicalStringValue;
  verified_at: DeterministicV31CanonicalStringValue;
}

export interface DeterministicV31CanonicalLifestyleLawState {
  destination_key: string;
  record_key: DeterministicV31CanonicalStringValue;
  topic: DeterministicV31CanonicalStringValue;
  legal_status: DeterministicV31CanonicalStringValue;
  summary: DeterministicV31CanonicalStringValue;
  important_rules: DeterministicV31CanonicalStringValue;
  official_source_url: DeterministicV31CanonicalStringValue;
  verified: DeterministicV31CanonicalStringValue;
  verified_at: DeterministicV31CanonicalStringValue;
}

export interface DeterministicV31CanonicalRealityCheckEntry {
  destination_key: string;
  record_key: DeterministicV31CanonicalStringValue;
  display_order: DeterministicV31CanonicalStringValue;
  title: DeterministicV31CanonicalStringValue;
  detail: DeterministicV31CanonicalStringValue;
  severity: DeterministicV31CanonicalStringValue;
  stay_mode_key: DeterministicV31CanonicalStringValue;
  source_name: DeterministicV31CanonicalStringValue;
  source_url: DeterministicV31CanonicalStringValue;
  verified: DeterministicV31CanonicalStringValue;
  verified_at: DeterministicV31CanonicalStringValue;
}

export interface DeterministicV31CanonicalMoveChecklistState {
  destination_key: string;
  checklist_key: DeterministicV31CanonicalStringValue;
  stay_mode_key: DeterministicV31CanonicalStringValue;
  category: DeterministicV31CanonicalStringValue;
  task: DeterministicV31CanonicalStringValue;
  description: DeterministicV31CanonicalStringValue;
  official_url: DeterministicV31CanonicalStringValue;
  display_order: DeterministicV31CanonicalStringValue;
  enabled: DeterministicV31CanonicalStringValue;
}

export interface DeterministicV31CanonicalEnvironmentQualityState {
  destination_key: string;
  air_quality_summary: DeterministicV31CanonicalStringValue;
  air_quality_metric: DeterministicV31CanonicalStringValue;
  water_quality_summary: DeterministicV31CanonicalStringValue;
  water_reliability: DeterministicV31CanonicalStringValue;
  heat_humidity_comfort: DeterministicV31CanonicalStringValue;
  noise_summary: DeterministicV31CanonicalStringValue;
  light_pollution_summary: DeterministicV31CanonicalStringValue;
  mosquito_pest_pressure: DeterministicV31CanonicalStringValue;
  wildfire_smoke_exposure: DeterministicV31CanonicalStringValue;
  drought_water_stress: DeterministicV31CanonicalStringValue;
  environmental_notes: DeterministicV31CanonicalStringValue;
  source_name: DeterministicV31CanonicalStringValue;
  source_url: DeterministicV31CanonicalStringValue;
  verified: DeterministicV31CanonicalStringValue;
  verified_at: DeterministicV31CanonicalStringValue;
  confidence: DeterministicV31CanonicalStringValue;
  last_updated_at: DeterministicV31CanonicalStringValue;
}

export interface DeterministicV31CanonicalDailyLifePracticalityState {
  destination_key: string;
  car_need: DeterministicV31CanonicalStringValue;
  driving_difficulty: DeterministicV31CanonicalStringValue;
  parking_difficulty: DeterministicV31CanonicalStringValue;
  grocery_access: DeterministicV31CanonicalStringValue;
  pharmacy_access: DeterministicV31CanonicalStringValue;
  fitness_wellness_access: DeterministicV31CanonicalStringValue;
  banking_practicality: DeterministicV31CanonicalStringValue;
  card_payment_acceptance: DeterministicV31CanonicalStringValue;
  cash_usage: DeterministicV31CanonicalStringValue;
  mobile_payment_usage: DeterministicV31CanonicalStringValue;
  delivery_services: DeterministicV31CanonicalStringValue;
  emergency_services_summary: DeterministicV31CanonicalStringValue;
  senior_services_summary: DeterministicV31CanonicalStringValue;
  childcare_access: DeterministicV31CanonicalStringValue;
  newcomer_friction: DeterministicV31CanonicalStringValue;
  things_residents_wish_they_knew: DeterministicV31CanonicalStringValue;
  source_url: DeterministicV31CanonicalStringValue;
  verified: DeterministicV31CanonicalStringValue;
  last_updated_at: DeterministicV31CanonicalStringValue;
}

export interface DeterministicV31CanonicalEventsSeasonalityState {
  destination_key: string;
  event_season_key: DeterministicV31CanonicalStringValue;
  record_type: DeterministicV31CanonicalStringValue;
  name: DeterministicV31CanonicalStringValue;
  month_start: DeterministicV31CanonicalStringValue;
  month_end: DeterministicV31CanonicalStringValue;
  season: DeterministicV31CanonicalStringValue;
  description: DeterministicV31CanonicalStringValue;
  crowding_level: DeterministicV31CanonicalStringValue;
  price_pressure: DeterministicV31CanonicalStringValue;
  weather_context: DeterministicV31CanonicalStringValue;
  best_for: DeterministicV31CanonicalStringValue;
  avoid_if: DeterministicV31CanonicalStringValue;
  official_url: DeterministicV31CanonicalStringValue;
  source_url: DeterministicV31CanonicalStringValue;
  verified: DeterministicV31CanonicalStringValue;
  verified_at: DeterministicV31CanonicalStringValue;
}

export interface DeterministicV31CanonicalSource {
  destination_key: string;
  source_key: DeterministicV31CanonicalStringValue;
  source_name: DeterministicV31CanonicalStringValue;
  source_url: DeterministicV31CanonicalStringValue;
  source_type: DeterministicV31CanonicalStringValue;
  publisher: DeterministicV31CanonicalStringValue;
  accessed_at: DeterministicV31CanonicalStringValue;
  verified: DeterministicV31CanonicalStringValue;
  confidence: DeterministicV31CanonicalStringValue;
  notes: DeterministicV31CanonicalStringValue;
}

export type DeterministicV31Destination = {
  destinationKey: string;
  slug: string;
  name: string;
  city: string;
  country: string;
  facts: Array<{
    factKey: string | null;
    factGroup: string | null;
    valueText: string | null;
    displayLabel: string | null;
    sourceName: string | null;
  }>;
  scores: Array<{
    scoreKey: string | null;
    scoreValue: string | null;
    scoreLabel: string | null;
    methodologyVersion: string | null;
  }>;
  moduleCounts?: Record<string, number>;
};

export interface DeterministicV31CanonicalDestination {
  identity: DeterministicV31CanonicalIdentity;
  editorial: DeterministicV31CanonicalEditorial;
  /** Raw DESTINATIONS row keyed by header name, for reading additive columns (e.g. v3.2 fields) not yet promoted into `identity`/`editorial`. Optional so existing fixtures/tests built before this field existed remain valid. */
  destinationRow?: Readonly<Record<string, string | null>>;
  facts: DeterministicV31CanonicalFact[];
  scores: DeterministicV31CanonicalScore[];
  neighborhoods: DeterministicV31CanonicalNeighborhood[];
  places: DeterministicV31CanonicalPlace[];
  resources: DeterministicV31CanonicalResource[];
  media: DeterministicV31CanonicalMedia[];
  costOfLiving: DeterministicV31CanonicalCostOfLivingItem[];
  climateMonthly: DeterministicV31CanonicalClimateMonth[];
  housing: DeterministicV31CanonicalHousingState[];
  propertyResources: DeterministicV31CanonicalPropertyResource[];
  healthcare: DeterministicV31CanonicalHealthcareState[];
  visaResidency: DeterministicV31CanonicalVisaResidencyState[];
  taxesFinance: DeterministicV31CanonicalTaxFinanceState[];
  lgbtqInclusivity: DeterministicV31CanonicalLgbtqInclusivityState[];
  safetyRisks: DeterministicV31CanonicalSafetyRisk[];
  transportation: DeterministicV31CanonicalTransportationState[];
  remoteWork: DeterministicV31CanonicalRemoteWorkState[];
  languageIntegration: DeterministicV31CanonicalLanguageIntegrationState[];
  pets: DeterministicV31CanonicalPetState[];
  familyEducation: DeterministicV31CanonicalFamilyEducationState[];
  communitySocial: DeterministicV31CanonicalCommunitySocialState[];
  accessibility: DeterministicV31CanonicalAccessibilityState[];
  bureaucracySetup: DeterministicV31CanonicalBureaucracySetupState[];
  workBusiness: DeterministicV31CanonicalWorkBusinessState[];
  retirementAging: DeterministicV31CanonicalRetirementAgingState[];
  lifestyleLaws: DeterministicV31CanonicalLifestyleLawState[];
  realityCheck: DeterministicV31CanonicalRealityCheckEntry[];
  moveChecklist: DeterministicV31CanonicalMoveChecklistState[];
  environmentQuality: DeterministicV31CanonicalEnvironmentQualityState | null;
  dailyLifePracticality: DeterministicV31CanonicalDailyLifePracticalityState | null;
  eventsSeasonality: DeterministicV31CanonicalEventsSeasonalityState[];
  sources: DeterministicV31CanonicalSource[];
}

export type DeterministicV31ImportPlan = {
  destinations: DeterministicV31Destination[];
  rejectedRows: Array<{
    sheet: string;
    rowNumber: number;
    reason: string;
  }>;
};

export type DeterministicV31WorkbookImport = {
  contractVersion: string;
  validationErrors: string[];
  destinations: DeterministicV31Destination[];
  canonicalDestinations?: DeterministicV31CanonicalDestination[];
  diagnostics?: {
    readOnly: boolean;
    architecture: string;
    metadata: Record<string, string>;
    aliasResolution: Record<string, string>;
    moduleCounts: Record<string, number>;
  };
};

export type DeterministicV31IdentityResolutionResult = {
  ok: boolean;
  value?: string;
  error?: string;
};

export interface DeterministicV31CanonicalImportFixtureDestination {
  destinationKey: string;
  facts?: DeterministicV31CanonicalFact[];
  scores?: DeterministicV31CanonicalScore[];
  neighborhoods?: DeterministicV31CanonicalNeighborhood[];
  places?: DeterministicV31CanonicalPlace[];
  media?: DeterministicV31CanonicalMedia[];
  aliases?: Array<Record<string, unknown>>;
}

export interface DeterministicV31CanonicalImportFixture {
  destinations: DeterministicV31CanonicalImportFixtureDestination[];
}

const getWorkbookPath = (explicitWorkbookPath?: string) => {
  const requestedWorkbookPath = explicitWorkbookPath?.trim() || process.env.PREMIUM_WORKBOOK_PATH?.trim();
  if (requestedWorkbookPath) {
    return path.resolve(requestedWorkbookPath);
  }

  return path.resolve(process.cwd(), "data/DestinationFinderAI_Master_Workbook_v3.1_FROZEN_Pilot_Dataset.xlsx");
};

// Any batch workbook declaring a schema_version within this major.minor range is accepted without code
// changes here; only a genuinely incompatible version (older than the minimum, or a future major bump)
// requires explicit review. This intentionally stays a simple range check, not a migration framework.
const DETERMINISTIC_V31_MIN_SUPPORTED_CONTRACT_VERSION = "3.1";
const DETERMINISTIC_V31_MAX_SUPPORTED_CONTRACT_VERSION = "3.999";

const parseDeterministicV31ContractVersion = (version: string): [number, number] | null => {
  const match = normalizeCellValueForVersionParsing(version).match(/^(\d+)\.(\d+)$/);
  if (!match) return null;
  return [Number(match[1]), Number(match[2])];
};

function normalizeCellValueForVersionParsing(value: unknown) {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  return String(value).trim();
}

const compareDeterministicV31ContractVersions = (left: [number, number], right: [number, number]) => {
  if (left[0] !== right[0]) return left[0] - right[0];
  return left[1] - right[1];
};

export const isDeterministicV31ContractVersionSupported = (version: string): boolean => {
  const parsed = parseDeterministicV31ContractVersion(version);
  if (!parsed) return false;
  const min = parseDeterministicV31ContractVersion(DETERMINISTIC_V31_MIN_SUPPORTED_CONTRACT_VERSION);
  const max = parseDeterministicV31ContractVersion(DETERMINISTIC_V31_MAX_SUPPORTED_CONTRACT_VERSION);
  if (!min || !max) return false;
  return compareDeterministicV31ContractVersions(parsed, min) >= 0 && compareDeterministicV31ContractVersions(parsed, max) <= 0;
};

const normalizeCellValue = (value: unknown) => {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  return String(value).trim();
};

const normalizeBlankValue = (value: unknown) => {
  const normalized = normalizeCellValue(value);
  return normalized === "" ? null : normalized;
};

const normalizeScalarValue = (value: unknown) => normalizeBlankValue(value);

const getHeaderIndex = (headers: string[], headerName: string) => {
  const normalizedHeader = normalizeCellValue(headerName).toLowerCase();
  return headers.findIndex((header) => normalizeCellValue(header).toLowerCase() === normalizedHeader);
};

const getRowValue = (headers: string[], row: Array<string>, headerName: string) => {
  const index = getHeaderIndex(headers, headerName);
  if (index < 0) return "";
  return normalizeCellValue(row[index]);
};

const buildRecordFromRow = (headers: string[], row: Array<string>) => {
  const record: Record<string, unknown> = {};
  headers.forEach((header, index) => {
    record[header] = normalizeBlankValue(row[index]);
  });
  return record;
};

const asCanonicalModuleRow = <T>(record: Record<string, unknown>): T => record as unknown as T;

const getSheetRowsForDestination = (sheetRows: Map<string, Array<Array<string>>>, headersBySheet: Map<string, string[]>, sheetName: string, destinationKey: string) => {
  const rows = (sheetRows.get(sheetName) ?? []).slice(1);
  const headers = headersBySheet.get(sheetName) ?? [];
  return rows
    .filter((row) => normalizeCellValue(getRowValue(headers, row, "destination_key")) === destinationKey)
    .map((row) => {
      const record = buildRecordFromRow(headers, row);
      if (record.destination_key == null) {
        record.destination_key = destinationKey;
      }
      return record;
    });
};

export const buildDeterministicV31CanonicalDestination = (input: {
  destinationKey: string;
  destinationRow: Array<string>;
  destinationHeaders: string[];
  sheetRows: Map<string, Array<Array<string>>>;
  headersBySheet: Map<string, string[]>;
}): DeterministicV31CanonicalDestination => {
  const destinationRecord = buildRecordFromRow(input.destinationHeaders, input.destinationRow);
  const destinationKey = normalizeCellValue(input.destinationKey || destinationRecord.destination_key);
  const destinationRows = getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "DESTINATIONS", destinationKey);
  const destinationRowRecord = destinationRows[0] ?? destinationRecord;

  return {
    identity: {
      destinationKey,
      slug: normalizeBlankValue(destinationRowRecord.slug) as string | null,
      name: normalizeBlankValue(destinationRowRecord.destination_name) as string | null,
      city: normalizeBlankValue(destinationRowRecord.city) as string | null,
      country: normalizeBlankValue(destinationRowRecord.country) as string | null,
      population: normalizeBlankValue(destinationRowRecord.population) as string | null,
      metroPopulation: normalizeBlankValue(destinationRowRecord.metro_population) as string | null,
      elevationMeters: normalizeBlankValue(destinationRowRecord.elevation_m) as string | null,
      latitude: normalizeBlankValue(destinationRowRecord.latitude) as string | null,
      longitude: normalizeBlankValue(destinationRowRecord.longitude) as string | null,
    },
    editorial: {
      shortDescription: normalizeBlankValue(destinationRowRecord.short_description) as string | null,
      longDescription: normalizeBlankValue(destinationRowRecord.long_description) as string | null,
      currency: normalizeBlankValue(destinationRowRecord.currency) as string | null,
      primaryLanguage: normalizeBlankValue(destinationRowRecord.primary_language) as string | null,
      timeZone: normalizeBlankValue(destinationRowRecord.time_zone) as string | null,
    },
    destinationRow: destinationRowRecord as Record<string, string | null>,
    facts: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "DESTINATION_FACTS", destinationKey).map((record) => asCanonicalModuleRow<DeterministicV31CanonicalFact>({ ...record, factKey: record.fact_key, factGroup: record.fact_group, valueText: record.value_text, displayLabel: record.display_label, sourceName: record.source_name })),
    scores: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "DESTINATION_SCORES", destinationKey).map((record) => asCanonicalModuleRow<DeterministicV31CanonicalScore>({ ...record, scoreKey: record.score_key, scoreValue: record.score_value, scoreLabel: record.score_label, methodologyVersion: record.methodology_version })),
    neighborhoods: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "NEIGHBORHOODS", destinationKey).map((record) => asCanonicalModuleRow<DeterministicV31CanonicalNeighborhood>(record)),
    places: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "PLACES", destinationKey).map((record) => asCanonicalModuleRow<DeterministicV31CanonicalPlace>(record)),
    resources: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "RESOURCES", destinationKey).map((record) => asCanonicalModuleRow<DeterministicV31CanonicalResource>(record)),
    media: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "MEDIA", destinationKey).map((record) => asCanonicalModuleRow<DeterministicV31CanonicalMedia>(record)),
    costOfLiving: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "COST_OF_LIVING", destinationKey).map((record) => asCanonicalModuleRow<DeterministicV31CanonicalCostOfLivingItem>(record)),
    climateMonthly: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "CLIMATE_MONTHLY", destinationKey).map((record) => asCanonicalModuleRow<DeterministicV31CanonicalClimateMonth>(record)),
    housing: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "HOUSING_PROPERTY", destinationKey).map((record) => asCanonicalModuleRow<DeterministicV31CanonicalHousingState>(record)),
    propertyResources: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "PROPERTY_RESOURCES", destinationKey).map((record) => asCanonicalModuleRow<DeterministicV31CanonicalPropertyResource>(record)),
    healthcare: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "HEALTHCARE_INSURANCE", destinationKey).map((record) => asCanonicalModuleRow<DeterministicV31CanonicalHealthcareState>(record)),
    visaResidency: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "VISA_RESIDENCY", destinationKey).map((record) => asCanonicalModuleRow<DeterministicV31CanonicalVisaResidencyState>(record)),
    taxesFinance: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "TAXES_FINANCE", destinationKey).map((record) => asCanonicalModuleRow<DeterministicV31CanonicalTaxFinanceState>(record)),
    lgbtqInclusivity: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "LGBTQ_INCLUSIVITY", destinationKey).map((record) => asCanonicalModuleRow<DeterministicV31CanonicalLgbtqInclusivityState>(record)),
    safetyRisks: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "SAFETY_RISKS", destinationKey).map((record) => asCanonicalModuleRow<DeterministicV31CanonicalSafetyRisk>(record)),
    transportation: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "TRANSPORT_AIRPORTS", destinationKey).map((record) => asCanonicalModuleRow<DeterministicV31CanonicalTransportationState>(record)),
    remoteWork: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "CONNECTIVITY_REMOTE_WORK", destinationKey).map((record) => asCanonicalModuleRow<DeterministicV31CanonicalRemoteWorkState>(record)),
    languageIntegration: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "LANGUAGE_INTEGRATION", destinationKey).map((record) => asCanonicalModuleRow<DeterministicV31CanonicalLanguageIntegrationState>(record)),
    pets: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "PETS", destinationKey).map((record) => asCanonicalModuleRow<DeterministicV31CanonicalPetState>(record)),
    familyEducation: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "FAMILY_EDUCATION", destinationKey).map((record) => asCanonicalModuleRow<DeterministicV31CanonicalFamilyEducationState>(record)),
    communitySocial: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "COMMUNITY_SOCIAL", destinationKey).map((record) => asCanonicalModuleRow<DeterministicV31CanonicalCommunitySocialState>(record)),
    accessibility: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "ACCESSIBILITY", destinationKey).map((record) => asCanonicalModuleRow<DeterministicV31CanonicalAccessibilityState>(record)),
    bureaucracySetup: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "BUREAUCRACY_SETUP", destinationKey).map((record) => asCanonicalModuleRow<DeterministicV31CanonicalBureaucracySetupState>(record)),
    workBusiness: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "WORK_BUSINESS", destinationKey).map((record) => asCanonicalModuleRow<DeterministicV31CanonicalWorkBusinessState>(record)),
    retirementAging: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "RETIREMENT_AGING", destinationKey).map((record) => asCanonicalModuleRow<DeterministicV31CanonicalRetirementAgingState>(record)),
    lifestyleLaws: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "LIFESTYLE_LAWS", destinationKey).map((record) => asCanonicalModuleRow<DeterministicV31CanonicalLifestyleLawState>(record)),
    realityCheck: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "REALITY_CHECK", destinationKey).map((record) => asCanonicalModuleRow<DeterministicV31CanonicalRealityCheckEntry>(record)),
    moveChecklist: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "MOVE_CHECKLIST", destinationKey).map((record) => asCanonicalModuleRow<DeterministicV31CanonicalMoveChecklistState>(record)),
    environmentQuality: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "ENVIRONMENT_QUALITY", destinationKey)[0] ? asCanonicalModuleRow<DeterministicV31CanonicalEnvironmentQualityState>(getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "ENVIRONMENT_QUALITY", destinationKey)[0]) : null,
    dailyLifePracticality: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "DAILY_LIFE_PRACTICALITY", destinationKey)[0] ? asCanonicalModuleRow<DeterministicV31CanonicalDailyLifePracticalityState>(getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "DAILY_LIFE_PRACTICALITY", destinationKey)[0]) : null,
    eventsSeasonality: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "EVENTS_SEASONALITY", destinationKey).map((record) => asCanonicalModuleRow<DeterministicV31CanonicalEventsSeasonalityState>(record)),
    sources: getSheetRowsForDestination(input.sheetRows, input.headersBySheet, "SOURCES", destinationKey).map((record) => asCanonicalModuleRow<DeterministicV31CanonicalSource>(record)),
  } as DeterministicV31CanonicalDestination;
};

const parseWorkbookRows = (workbookPath: string) => {
  const pythonCommand = process.env.PYTHON || "python3";
  const tempDir = mkdtempSync(path.join(os.tmpdir(), "workbook-v31-"));
  const scriptPath = path.join(tempDir, "parse_workbook.py");
  const outputPath = path.join(tempDir, "parsed_workbook.json");
  const script = `
import json
import sys
import zipfile
import xml.etree.ElementTree as ET

ns = {'a': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main', 'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
rel_ns = {'r': 'http://schemas.openxmlformats.org/package/2006/relationships'}

with zipfile.ZipFile(sys.argv[1]) as archive:
    workbook = ET.fromstring(archive.read('xl/workbook.xml'))
    sheets = workbook.find('a:sheets', ns)
    relationships = ET.fromstring(archive.read('xl/_rels/workbook.xml.rels'))
    rel_map = {rel.attrib['Id']: rel.attrib['Target'] for rel in relationships.findall('r:Relationship', rel_ns)}

    shared_strings = []
    if 'xl/sharedStrings.xml' in archive.namelist():
        shared_strings_xml = ET.fromstring(archive.read('xl/sharedStrings.xml'))
        for item in shared_strings_xml.findall('a:si', ns):
            text = ''.join(node.text or '' for node in item.iterfind('.//a:t', ns))
            shared_strings.append(text)

    rows_by_sheet = {}
    for sheet in sheets.findall('a:sheet', ns):
        name = sheet.attrib['name']
        rel_id = sheet.attrib['{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id']
        target = rel_map[rel_id]
        if not target.startswith('/'):
            target = '/' + target
        sheet_path = target.lstrip('/')
        if not sheet_path.startswith('xl/'):
            sheet_path = 'xl/' + sheet_path
        sheet_xml = ET.fromstring(archive.read(sheet_path))
        parsed_rows = []
        for row in sheet_xml.findall('.//a:sheetData/a:row', ns):
            values = []
            for cell in row.findall('a:c', ns):
                cell_type = cell.attrib.get('t')
                value_node = cell.find('a:v', ns)
                if cell_type == 's' and value_node is not None and value_node.text is not None:
                    index = int(value_node.text)
                    values.append(shared_strings[index] if index < len(shared_strings) else '')
                elif value_node is not None and value_node.text is not None:
                    values.append(value_node.text)
                else:
                    inline = cell.find('a:is', ns)
                    if inline is not None:
                        text = ''.join(node.text or '' for node in inline.iterfind('.//a:t', ns))
                        values.append(text)
                    else:
                        values.append('')
            parsed_rows.append(values)
        rows_by_sheet[name] = parsed_rows

    with open(sys.argv[2], 'w', encoding='utf-8') as handle:
        json.dump(rows_by_sheet, handle)
`;
  writeFileSync(scriptPath, script, "utf8");
  try {
    const execResult = execFileSync(pythonCommand, [scriptPath, workbookPath, outputPath], { encoding: "utf8" });
    let parsedPayload: Record<string, unknown> | null = null;

    if (typeof execResult === "string" && execResult.trim()) {
      try {
        parsedPayload = JSON.parse(execResult) as Record<string, unknown>;
      } catch {
        parsedPayload = null;
      }
    }

    if (!parsedPayload) {
      const parsedFile = JSON.parse(readFileSync(outputPath, "utf8")) as Record<string, unknown>;
      parsedPayload = parsedFile;
    }

    const sheetPayload = Object.fromEntries(Object.entries(parsedPayload).filter(([, value]) => Array.isArray(value))) as Record<string, Array<Array<string>>>;
    return {
      sheetNames: Object.keys(sheetPayload),
      sheetRows: new Map(Object.entries(sheetPayload)),
      sharedStrings: [] as string[],
      rawPayload: parsedPayload,
    };
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
};

export const loadFrozenWorkbookV31DeterministicImport = async (explicitWorkbookPath?: string): Promise<DeterministicV31WorkbookImport> => {
  if (!shouldUseDeterministicWorkbookImportCache()) {
    return (async () => {
      const workbookPath = getWorkbookPath(explicitWorkbookPath);
      const workbookRows = parseWorkbookRows(workbookPath);
      const sheetNames = workbookRows.sheetNames;
      const sheetRows = workbookRows.sheetRows;
      const rawPayload = workbookRows.rawPayload as Record<string, unknown> | undefined;

      const canonicalDestinations = Array.isArray(rawPayload?.canonicalDestinations)
        ? (rawPayload?.canonicalDestinations as DeterministicV31CanonicalDestination[])
        : [];
      const fallbackDestinations = Array.isArray(rawPayload?.destinations)
        ? (rawPayload?.destinations as DeterministicV31Destination[])
        : [];

      if (canonicalDestinations.length > 0 || fallbackDestinations.length > 0) {
        return {
          contractVersion: "mock",
          validationErrors: [],
          destinations: fallbackDestinations,
          canonicalDestinations,
          diagnostics: {
            readOnly: true,
            architecture: "mock",
            metadata: {},
            aliasResolution: {},
            moduleCounts: {},
          },
        };
      }

      const requiredSheets = ["DESTINATIONS", "DESTINATION_FACTS", "DESTINATION_SCORES", "IMPORT_CONTRACT", "PILOT_STATUS", "WORKBOOK_METADATA", "IMPORT_MANIFEST", "DESTINATION_ALIASES", "VALIDATION_RULES", "DATA_DICTIONARY"];
      if (requiredSheets.some((sheetName) => !sheetNames.includes(sheetName))) {
        return {
          contractVersion: "unknown",
          validationErrors: ["Required workbook sheets are missing from the frozen workbook."],
          destinations: [],
        };
      }

      const metadataRows = (sheetRows.get("WORKBOOK_METADATA") ?? []).slice(1);
      const contractVersionRow = metadataRows.find((row) => normalizeCellValue(row[0]).toLowerCase() === "schema_version");
      const contractVersion = contractVersionRow?.[1] ?? "unknown";
      const metadata = Object.fromEntries(metadataRows.map((row) => [normalizeCellValue(row[0]), normalizeCellValue(row[1])]).filter(([key]) => key));
      metadata.sheetNames = sheetNames.join(",");
      const architecture = metadata.architecture ?? "unknown";

      const destinationSheetRows = (sheetRows.get("DESTINATIONS") ?? []);
      const destinationHeaders = destinationSheetRows[0] ?? [];
      const destinationRows = destinationSheetRows.slice(1);
      const factSheetRows = (sheetRows.get("DESTINATION_FACTS") ?? []);
      const factHeaders = factSheetRows[0] ?? [];
      const factRows = factSheetRows.slice(1);
      const scoreSheetRows = (sheetRows.get("DESTINATION_SCORES") ?? []);
      const scoreHeaders = scoreSheetRows[0] ?? [];
      const scoreRows = scoreSheetRows.slice(1);

      const aliasSheetRows = (sheetRows.get("DESTINATION_ALIASES") ?? []);
      const aliasHeaders = aliasSheetRows[0] ?? [];
      const aliasRows = aliasSheetRows.slice(1);

      const moduleSheetNames = ["NEIGHBORHOODS", "PLACES", "RESOURCES", "MEDIA", "COST_OF_LIVING", "CLIMATE_MONTHLY", "HOUSING_PROPERTY", "PROPERTY_RESOURCES", "HEALTHCARE_INSURANCE", "VISA_RESIDENCY", "TAXES_FINANCE", "LGBTQ_INCLUSIVITY", "SAFETY_RISKS", "TRANSPORT_AIRPORTS", "CONNECTIVITY_REMOTE_WORK", "LANGUAGE_INTEGRATION", "PETS", "FAMILY_EDUCATION", "COMMUNITY_SOCIAL", "ACCESSIBILITY", "BUREAUCRACY_SETUP", "WORK_BUSINESS", "RETIREMENT_AGING", "LIFESTYLE_LAWS", "REALITY_CHECK", "MOVE_CHECKLIST", "ENVIRONMENT_QUALITY", "DAILY_LIFE_PRACTICALITY", "EVENTS_SEASONALITY", "SOURCES"];

      const aliasResolution = Object.fromEntries(
        aliasRows
          .filter((row) => normalizeCellValue(getRowValue(aliasHeaders, row, "alias_value")) && normalizeCellValue(getRowValue(aliasHeaders, row, "active")) === "1")
          .map((row) => [normalizeCellValue(getRowValue(aliasHeaders, row, "alias_value")), normalizeCellValue(getRowValue(aliasHeaders, row, "destination_key"))]),
      );

      const destinations: DeterministicV31Destination[] = [];
      const destinationKeySet = new Set<string>();
      const headersBySheet = new Map<string, string[]>();
      for (const sheetName of sheetNames) {
        headersBySheet.set(sheetName, (sheetRows.get(sheetName) ?? [])[0] ?? []);
      }

      const canonicalDestinationRecords: DeterministicV31CanonicalDestination[] = [];
      for (const row of destinationRows) {
        const destinationKey = getRowValue(destinationHeaders, row, "destination_key");
        if (!destinationKey) continue;
        destinationKeySet.add(destinationKey);
        const name = getRowValue(destinationHeaders, row, "destination_name");
        const country = getRowValue(destinationHeaders, row, "country");
        const slug = getRowValue(destinationHeaders, row, "slug");
        const city = getRowValue(destinationHeaders, row, "city");

        const facts = factRows
          .filter((factRow) => getRowValue(factHeaders, factRow, "destination_key") === destinationKey)
          .map((factRow) => ({
            factKey: getRowValue(factHeaders, factRow, "fact_key"),
            factGroup: getRowValue(factHeaders, factRow, "fact_group"),
            valueText: getRowValue(factHeaders, factRow, "value_text"),
            displayLabel: getRowValue(factHeaders, factRow, "display_label"),
            sourceName: getRowValue(factHeaders, factRow, "source_name"),
          }));

        const scores = scoreRows
          .filter((scoreRow) => getRowValue(scoreHeaders, scoreRow, "destination_key") === destinationKey)
          .map((scoreRow) => ({
            scoreKey: getRowValue(scoreHeaders, scoreRow, "score_key"),
            scoreValue: getRowValue(scoreHeaders, scoreRow, "score_value"),
            scoreLabel: getRowValue(scoreHeaders, scoreRow, "score_label"),
            methodologyVersion: getRowValue(scoreHeaders, scoreRow, "methodology_version"),
          }));

        const destinationModuleCounts = Object.fromEntries(moduleSheetNames.map((sheetName) => [sheetName, (sheetRows.get(sheetName) ?? []).slice(1).filter((moduleRow) => normalizeCellValue(getRowValue((sheetRows.get(sheetName) ?? [])[0] ?? [], moduleRow, "destination_key")) === destinationKey).length]));

        destinations.push({
          destinationKey,
          slug: slug || destinationKey,
          name,
          city,
          country,
          facts,
          scores,
          moduleCounts: destinationModuleCounts,
        });

        canonicalDestinationRecords.push(buildDeterministicV31CanonicalDestination({
          destinationKey,
          destinationRow: row,
          destinationHeaders,
          sheetRows,
          headersBySheet,
        }));
      }

      const moduleCounts = {
        DESTINATIONS: destinations.length,
        ...Object.fromEntries(moduleSheetNames.map((sheetName) => [sheetName, (sheetRows.get(sheetName) ?? []).slice(1).filter((row) => row.some((value) => normalizeCellValue(value))).length])),
      };

      const validationErrors = [] as string[];
      if (!isDeterministicV31ContractVersionSupported(contractVersion)) {
        validationErrors.push(`Workbook contract version "${contractVersion}" is not within the supported range (${DETERMINISTIC_V31_MIN_SUPPORTED_CONTRACT_VERSION}–${DETERMINISTIC_V31_MAX_SUPPORTED_CONTRACT_VERSION}).`);
      }
      if (destinations.length === 0) {
        validationErrors.push("No destinations were resolved from the workbook.");
      }

      const orphanedChildRows = [] as string[];
      for (const sheetName of ["DESTINATION_FACTS", "DESTINATION_SCORES", "NEIGHBORHOODS", "PLACES", "RESOURCES", "MEDIA", "COST_OF_LIVING", "CLIMATE_MONTHLY", "HOUSING_PROPERTY", "PROPERTY_RESOURCES", "HEALTHCARE_INSURANCE", "VISA_RESIDENCY", "TAXES_FINANCE", "LGBTQ_INCLUSIVITY", "SAFETY_RISKS", "TRANSPORT_AIRPORTS", "CONNECTIVITY_REMOTE_WORK", "LANGUAGE_INTEGRATION", "PETS", "FAMILY_EDUCATION", "COMMUNITY_SOCIAL", "ACCESSIBILITY", "BUREAUCRACY_SETUP", "WORK_BUSINESS", "RETIREMENT_AGING", "LIFESTYLE_LAWS", "REALITY_CHECK", "MOVE_CHECKLIST", "ENVIRONMENT_QUALITY", "DAILY_LIFE_PRACTICALITY", "EVENTS_SEASONALITY", "SOURCES"]) {
        const rows = (sheetRows.get(sheetName) ?? []).slice(1);
        if (rows.length === 0) continue;
        const headers = (sheetRows.get(sheetName) ?? [])[0] ?? [];
        for (const row of rows) {
          const destinationKey = getRowValue(headers, row, "destination_key");
          if (destinationKey && !destinationKeySet.has(destinationKey)) {
            orphanedChildRows.push(`${sheetName}:${destinationKey}`);
          }
        }
      }
      if (orphanedChildRows.length > 0) {
        validationErrors.push(`Orphaned child rows detected for ${orphanedChildRows.length} record(s).`);
      }

      return {
        contractVersion,
        validationErrors,
        destinations,
        canonicalDestinations: canonicalDestinationRecords,
        diagnostics: {
          readOnly: true,
          architecture,
          metadata,
          aliasResolution,
          moduleCounts,
        },
      };
    })();
  }

  const cacheKey = `${process.cwd()}::${explicitWorkbookPath ?? process.env.PREMIUM_WORKBOOK_PATH ?? ""}::${getWorkbookPath(explicitWorkbookPath)}`;
  const cachedImport = deterministicWorkbookImportCache.get(cacheKey);
  if (cachedImport) {
    return cachedImport;
  }

  const importPromise = (async () => {
    const workbookPath = getWorkbookPath(explicitWorkbookPath);
    const workbookRows = parseWorkbookRows(workbookPath);
    const sheetNames = workbookRows.sheetNames;
    const sheetRows = workbookRows.sheetRows;
    const rawPayload = workbookRows.rawPayload as Record<string, unknown> | undefined;

  const canonicalDestinations = Array.isArray(rawPayload?.canonicalDestinations)
    ? (rawPayload?.canonicalDestinations as DeterministicV31CanonicalDestination[])
    : [];
  const fallbackDestinations = Array.isArray(rawPayload?.destinations)
    ? (rawPayload?.destinations as DeterministicV31Destination[])
    : [];

  if (canonicalDestinations.length > 0 || fallbackDestinations.length > 0) {
    return {
      contractVersion: "mock",
      validationErrors: [],
      destinations: fallbackDestinations,
      canonicalDestinations,
      diagnostics: {
        readOnly: true,
        architecture: "mock",
        metadata: {},
        aliasResolution: {},
        moduleCounts: {},
      },
    };
  }

  const requiredSheets = ["DESTINATIONS", "DESTINATION_FACTS", "DESTINATION_SCORES", "IMPORT_CONTRACT", "PILOT_STATUS", "WORKBOOK_METADATA", "IMPORT_MANIFEST", "DESTINATION_ALIASES", "VALIDATION_RULES", "DATA_DICTIONARY"];
  if (requiredSheets.some((sheetName) => !sheetNames.includes(sheetName))) {
    return {
      contractVersion: "unknown",
      validationErrors: ["Required workbook sheets are missing from the frozen workbook."],
      destinations: [],
    };
  }

  const metadataRows = (sheetRows.get("WORKBOOK_METADATA") ?? []).slice(1);
  const contractVersionRow = metadataRows.find((row) => normalizeCellValue(row[0]).toLowerCase() === "schema_version");
  const contractVersion = contractVersionRow?.[1] ?? "unknown";
  const metadata = Object.fromEntries(metadataRows.map((row) => [normalizeCellValue(row[0]), normalizeCellValue(row[1])]).filter(([key]) => key));
  metadata.sheetNames = sheetNames.join(",");
  const architecture = metadata.architecture ?? "unknown";

  const destinationSheetRows = (sheetRows.get("DESTINATIONS") ?? []);
  const destinationHeaders = destinationSheetRows[0] ?? [];
  const destinationRows = destinationSheetRows.slice(1);
  const factSheetRows = (sheetRows.get("DESTINATION_FACTS") ?? []);
  const factHeaders = factSheetRows[0] ?? [];
  const factRows = factSheetRows.slice(1);
  const scoreSheetRows = (sheetRows.get("DESTINATION_SCORES") ?? []);
  const scoreHeaders = scoreSheetRows[0] ?? [];
  const scoreRows = scoreSheetRows.slice(1);

  const aliasSheetRows = (sheetRows.get("DESTINATION_ALIASES") ?? []);
  const aliasHeaders = aliasSheetRows[0] ?? [];
  const aliasRows = aliasSheetRows.slice(1);

  const moduleSheetNames = ["NEIGHBORHOODS", "PLACES", "RESOURCES", "MEDIA", "COST_OF_LIVING", "CLIMATE_MONTHLY", "HOUSING_PROPERTY", "PROPERTY_RESOURCES", "HEALTHCARE_INSURANCE", "VISA_RESIDENCY", "TAXES_FINANCE", "LGBTQ_INCLUSIVITY", "SAFETY_RISKS", "TRANSPORT_AIRPORTS", "CONNECTIVITY_REMOTE_WORK", "LANGUAGE_INTEGRATION", "PETS", "FAMILY_EDUCATION", "COMMUNITY_SOCIAL", "ACCESSIBILITY", "BUREAUCRACY_SETUP", "WORK_BUSINESS", "RETIREMENT_AGING", "LIFESTYLE_LAWS", "REALITY_CHECK", "MOVE_CHECKLIST", "ENVIRONMENT_QUALITY", "DAILY_LIFE_PRACTICALITY", "EVENTS_SEASONALITY", "SOURCES"];

  const aliasResolution = Object.fromEntries(
    aliasRows
      .filter((row) => normalizeCellValue(getRowValue(aliasHeaders, row, "alias_value")) && normalizeCellValue(getRowValue(aliasHeaders, row, "active")) === "1")
      .map((row) => [normalizeCellValue(getRowValue(aliasHeaders, row, "alias_value")), normalizeCellValue(getRowValue(aliasHeaders, row, "destination_key"))]),
  );

  const destinations: DeterministicV31Destination[] = [];
  const destinationKeySet = new Set<string>();
  const headersBySheet = new Map<string, string[]>();
  for (const sheetName of sheetNames) {
    headersBySheet.set(sheetName, (sheetRows.get(sheetName) ?? [])[0] ?? []);
  }

  const canonicalDestinationRecords: DeterministicV31CanonicalDestination[] = [];
  for (const row of destinationRows) {
    const destinationKey = getRowValue(destinationHeaders, row, "destination_key");
    if (!destinationKey) continue;
    destinationKeySet.add(destinationKey);
    const name = getRowValue(destinationHeaders, row, "destination_name");
    const country = getRowValue(destinationHeaders, row, "country");
    const slug = getRowValue(destinationHeaders, row, "slug");
    const city = getRowValue(destinationHeaders, row, "city");

    const facts = factRows
      .filter((factRow) => getRowValue(factHeaders, factRow, "destination_key") === destinationKey)
      .map((factRow) => ({
        factKey: getRowValue(factHeaders, factRow, "fact_key"),
        factGroup: getRowValue(factHeaders, factRow, "fact_group"),
        valueText: getRowValue(factHeaders, factRow, "value_text"),
        displayLabel: getRowValue(factHeaders, factRow, "display_label"),
        sourceName: getRowValue(factHeaders, factRow, "source_name"),
      }));

    const scores = scoreRows
      .filter((scoreRow) => getRowValue(scoreHeaders, scoreRow, "destination_key") === destinationKey)
      .map((scoreRow) => ({
        scoreKey: getRowValue(scoreHeaders, scoreRow, "score_key"),
        scoreValue: getRowValue(scoreHeaders, scoreRow, "score_value"),
        scoreLabel: getRowValue(scoreHeaders, scoreRow, "score_label"),
        methodologyVersion: getRowValue(scoreHeaders, scoreRow, "methodology_version"),
      }));

    const destinationModuleCounts = Object.fromEntries(moduleSheetNames.map((sheetName) => [sheetName, (sheetRows.get(sheetName) ?? []).slice(1).filter((moduleRow) => normalizeCellValue(getRowValue((sheetRows.get(sheetName) ?? [])[0] ?? [], moduleRow, "destination_key")) === destinationKey).length]));

    destinations.push({
      destinationKey,
      slug: slug || destinationKey,
      name,
      city,
      country,
      facts,
      scores,
      moduleCounts: destinationModuleCounts,
    });

    canonicalDestinationRecords.push(buildDeterministicV31CanonicalDestination({
      destinationKey,
      destinationRow: row,
      destinationHeaders,
      sheetRows,
      headersBySheet,
    }));
  }

  const moduleCounts = {
    DESTINATIONS: destinations.length,
    ...Object.fromEntries(moduleSheetNames.map((sheetName) => [sheetName, (sheetRows.get(sheetName) ?? []).slice(1).filter((row) => row.some((value) => normalizeCellValue(value))).length])),
  };

  const validationErrors = [] as string[];
  if (!isDeterministicV31ContractVersionSupported(contractVersion)) {
    validationErrors.push(`Workbook contract version "${contractVersion}" is not within the supported range (${DETERMINISTIC_V31_MIN_SUPPORTED_CONTRACT_VERSION}–${DETERMINISTIC_V31_MAX_SUPPORTED_CONTRACT_VERSION}).`);
  }
  if (destinations.length === 0) {
    validationErrors.push("No destinations were resolved from the workbook.");
  }

  const orphanedChildRows = [] as string[];
  for (const sheetName of ["DESTINATION_FACTS", "DESTINATION_SCORES", "NEIGHBORHOODS", "PLACES", "RESOURCES", "MEDIA", "COST_OF_LIVING", "CLIMATE_MONTHLY", "HOUSING_PROPERTY", "PROPERTY_RESOURCES", "HEALTHCARE_INSURANCE", "VISA_RESIDENCY", "TAXES_FINANCE", "LGBTQ_INCLUSIVITY", "SAFETY_RISKS", "TRANSPORT_AIRPORTS", "CONNECTIVITY_REMOTE_WORK", "LANGUAGE_INTEGRATION", "PETS", "FAMILY_EDUCATION", "COMMUNITY_SOCIAL", "ACCESSIBILITY", "BUREAUCRACY_SETUP", "WORK_BUSINESS", "RETIREMENT_AGING", "LIFESTYLE_LAWS", "REALITY_CHECK", "MOVE_CHECKLIST", "ENVIRONMENT_QUALITY", "DAILY_LIFE_PRACTICALITY", "EVENTS_SEASONALITY", "SOURCES"]) {
    const rows = (sheetRows.get(sheetName) ?? []).slice(1);
    if (rows.length === 0) continue;
    const headers = (sheetRows.get(sheetName) ?? [])[0] ?? [];
    for (const row of rows) {
      const destinationKey = getRowValue(headers, row, "destination_key");
      if (destinationKey && !destinationKeySet.has(destinationKey)) {
        orphanedChildRows.push(`${sheetName}:${destinationKey}`);
      }
    }
  }
  if (orphanedChildRows.length > 0) {
    validationErrors.push(`Orphaned child rows detected for ${orphanedChildRows.length} record(s).`);
  }

    return {
      contractVersion,
      validationErrors,
      destinations,
      canonicalDestinations: canonicalDestinationRecords,
      diagnostics: {
        readOnly: true,
        architecture,
        metadata,
        aliasResolution,
        moduleCounts,
      },
    };
  })();

  deterministicWorkbookImportCache.set(cacheKey, importPromise);
  return importPromise;
};

export const buildDeterministicV31ImportPlan = (input: {
  destinations: Array<{ destination_key: string; slug: string; destination_name: string; city: string; country: string }>;
  destinationFacts: Array<{ destination_key: string; fact_group: string; fact_key: string; display_label: string; value_text: string; source_name: string }>;
  destinationScores: Array<{ destination_key: string; score_key: string; score_value: string; score_label: string; methodology_version: string }>;
  neighborhoods: Array<Record<string, unknown>>;
  places: Array<Record<string, unknown>>;
  resources: Array<Record<string, unknown>>;
  media: Array<Record<string, unknown>>;
  destinationAliases?: Array<{ destination_key: string; alias_value: string; canonical?: string; active?: string }>;
}): DeterministicV31ImportPlan => {
  const destinations = input.destinations.map((destination) => ({
    destinationKey: normalizeScalarValue(destination.destination_key) as string,
    slug: normalizeScalarValue(destination.slug || destination.destination_key) as string,
    name: normalizeScalarValue(destination.destination_name) as string,
    city: normalizeScalarValue(destination.city) as string,
    country: normalizeScalarValue(destination.country) as string,
    facts: input.destinationFacts
      .filter((fact) => fact.destination_key === destination.destination_key)
      .map((fact) => ({
        factKey: normalizeScalarValue(fact.fact_key),
        factGroup: normalizeScalarValue(fact.fact_group),
        valueText: normalizeScalarValue(fact.value_text),
        displayLabel: normalizeScalarValue(fact.display_label),
        sourceName: normalizeScalarValue(fact.source_name),
      })),
    scores: input.destinationScores
      .filter((score) => score.destination_key === destination.destination_key)
      .map((score) => ({
        scoreKey: normalizeScalarValue(score.score_key),
        scoreValue: normalizeScalarValue(score.score_value),
        scoreLabel: normalizeScalarValue(score.score_label),
        methodologyVersion: normalizeScalarValue(score.methodology_version),
      })),
  }));

  const aliasMap = new Map<string, string>();
  for (const alias of input.destinationAliases ?? []) {
    if (normalizeCellValue(alias.alias_value) && normalizeCellValue(alias.active ?? "1") === "1") {
      aliasMap.set(normalizeCellValue(alias.alias_value), normalizeCellValue(alias.destination_key));
    }
  }

  const rejectedRows = input.destinationFacts
    .filter((fact) => !input.destinations.some((destination) => destination.destination_key === fact.destination_key))
    .map((fact) => ({
      sheet: "destinationFacts",
      rowNumber: 0,
      reason: `Destination ${fact.destination_key} was not found in the deterministic destination map.`,
    }));

  const resolvedDestinations = destinations.map((destination) => ({
    ...destination,
    slug: aliasMap.get(destination.slug) ?? destination.slug,
  }));

  return {
    destinations: resolvedDestinations,
    rejectedRows,
  };
};

export const resolveDeterministicV31DestinationIdentity = (input: {
  requestedIdentity: string;
  destinations: Array<{ destination_key: string; slug: string }>;
  destinationAliases?: Array<{ destination_key: string; alias_value: string; active?: string }>;
}): DeterministicV31IdentityResolutionResult => {
  const requestedIdentity = normalizeCellValue(input.requestedIdentity);
  if (!requestedIdentity) {
    return { ok: false, error: "EMPTY_IDENTITY" };
  }

  const directMatch = input.destinations.find((destination) => normalizeCellValue(destination.destination_key) === requestedIdentity);
  if (directMatch) {
    return { ok: true, value: directMatch.destination_key };
  }

  const slugMatch = input.destinations.find((destination) => normalizeCellValue(destination.slug) === requestedIdentity);
  if (slugMatch) {
    return { ok: true, value: slugMatch.destination_key };
  }

  const aliasMatch = (input.destinationAliases ?? []).find((alias) => normalizeCellValue(alias.alias_value) === requestedIdentity && normalizeCellValue(alias.active ?? "1") === "1");
  if (aliasMatch) {
    return { ok: true, value: normalizeCellValue(aliasMatch.destination_key) };
  }

  return { ok: false, error: "UNKNOWN_DESTINATION" };
};

export const validateDeterministicV31Contract = (input: {
  metadata: Record<string, string>;
  sheetNames: string[];
  requiredSheets?: string[];
}) => {
  const errors: string[] = [];
  const requiredSheets = input.requiredSheets ?? ["DESTINATIONS", "DESTINATION_FACTS", "DESTINATION_SCORES", "IMPORT_CONTRACT", "PILOT_STATUS", "WORKBOOK_METADATA", "IMPORT_MANIFEST", "DESTINATION_ALIASES", "VALIDATION_RULES", "DATA_DICTIONARY"];
  requiredSheets.forEach((sheetName) => {
    if (!input.sheetNames.includes(sheetName)) {
      errors.push(`Missing required sheet: ${sheetName}`);
    }
  });
  if (!isDeterministicV31ContractVersionSupported(normalizeCellValue(input.metadata.schema_version))) {
    errors.push(`schema_version "${input.metadata.schema_version}" is not within the supported range (${DETERMINISTIC_V31_MIN_SUPPORTED_CONTRACT_VERSION}–${DETERMINISTIC_V31_MAX_SUPPORTED_CONTRACT_VERSION})`);
  }
  if (normalizeCellValue(input.metadata.architecture) !== "workbook_only_no_fallback") {
    errors.push("architecture must be workbook_only_no_fallback");
  }
  if (normalizeCellValue(input.metadata.primary_identity) !== "destination_key") {
    errors.push("primary_identity must be destination_key");
  }
  return errors;
};

export const validateDeterministicV31CanonicalImportFixture = (fixture: DeterministicV31CanonicalImportFixture) => {
  const errors: string[] = [];
  const knownDestinationKeys = new Set(fixture.destinations.map((destination) => normalizeCellValue(destination.destinationKey)));

  fixture.destinations.forEach((destination) => {
    const destinationKey = normalizeCellValue(destination.destinationKey);

    const childRows = [
      ...(destination.facts ?? []),
      ...(destination.scores ?? []),
      ...(destination.neighborhoods ?? []),
      ...(destination.places ?? []),
      ...(destination.media ?? []),
    ];
    childRows.forEach((row) => {
      const rowDestinationKey = normalizeCellValue((row as unknown as Record<string, unknown>).destination_key);
      if (rowDestinationKey && rowDestinationKey !== destinationKey) {
        errors.push(`Row attached to the wrong destination: ${rowDestinationKey} !== ${destinationKey}`);
      }
      if (!rowDestinationKey && !knownDestinationKeys.has(destinationKey)) {
        errors.push(`Missing destination key for row attached to ${destinationKey}`);
      }
      if (rowDestinationKey && !knownDestinationKeys.has(rowDestinationKey)) {
        errors.push(`Unknown destination key ${rowDestinationKey}`);
      }
    });

    const neighborhoodKeys = new Set<string>();
    (destination.neighborhoods ?? []).forEach((row) => {
      const neighborhoodKey = normalizeCellValue((row as unknown as Record<string, unknown>).neighborhood_key);
      if (!neighborhoodKey) return;
      if (neighborhoodKeys.has(neighborhoodKey)) {
        errors.push(`Duplicate neighborhood key ${neighborhoodKey}`);
      }
      neighborhoodKeys.add(neighborhoodKey);
    });

    const placeKeys = new Set<string>();
    (destination.places ?? []).forEach((row) => {
      const placeKey = normalizeCellValue((row as unknown as Record<string, unknown>).place_key);
      if (!placeKey) return;
      if (placeKeys.has(placeKey)) {
        errors.push(`Duplicate place key ${placeKey}`);
      }
      placeKeys.add(placeKey);
    });

    const placeNeighborhoodKeys = new Set<string>();
    (destination.neighborhoods ?? []).forEach((row) => {
      const neighborhoodKey = normalizeCellValue((row as unknown as Record<string, unknown>).neighborhood_key);
      if (neighborhoodKey) {
        placeNeighborhoodKeys.add(neighborhoodKey);
      }
    });
    (destination.places ?? []).forEach((row) => {
      const neighborhoodKey = normalizeCellValue((row as unknown as Record<string, unknown>).neighborhood_key);
      if (!neighborhoodKey) return;
      if (!placeNeighborhoodKeys.has(neighborhoodKey)) {
        errors.push(`Place ${normalizeCellValue((row as unknown as Record<string, unknown>).place_key)} references unknown neighborhood ${neighborhoodKey}`);
      }
    });

    (destination.aliases ?? []).forEach((row) => {
      const aliasDestinationKey = normalizeCellValue((row as unknown as Record<string, unknown>).destination_key);
      if (aliasDestinationKey && !knownDestinationKeys.has(aliasDestinationKey)) {
        errors.push(`Alias targets unknown destination ${aliasDestinationKey}`);
      }
    });
  });

  return errors;
};
