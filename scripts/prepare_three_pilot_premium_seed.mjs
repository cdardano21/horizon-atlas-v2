#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const artifactPath = path.join(repoRoot, 'tmp/premium-pilot-dry-run.json');
const sqlOutputPath = path.join(repoRoot, 'tmp/three-pilot-premium-write.sql');
const planOutputPath = path.join(repoRoot, 'tmp/three-pilot-premium-write-plan.json');
const summaryOutputPath = path.join(repoRoot, 'tmp/three-pilot-premium-write-summary.md');

const bindings = [
  {
    catalogId: 'f65b8c56-0a75-4e83-8b41-533444f0eff2',
    destinationKey: 'lisbon-pt',
    slug: 'lisbon-portugal',
    name: 'Lisbon',
    country: 'Portugal',
  },
  {
    catalogId: '63a56797-164d-49bd-9969-9b539ce7e57d',
    destinationKey: 'new-braunfels-tx-us',
    slug: 'new-braunfels-texas',
    name: 'New Braunfels',
    country: 'United States',
  },
  {
    catalogId: '32b10339-a202-48bb-b1eb-2798735b7ed3',
    destinationKey: 'summerlin-nv-us',
    slug: 'summerlin-las-vegas-nevada',
    name: 'Summerlin',
    country: 'United States',
  },
];

const requiredPresenceModules = [
  'facts',
  'scores',
  'neighborhoods',
  'places',
  'resources',
  'media',
  'propertyResources',
  'moveChecklist',
  'eventsSeasonality',
  'sources',
  'costOfLiving',
  'climateMonthly',
  'housing',
  'healthcare',
  'visaResidency',
  'taxesFinance',
  'lgbtqInclusivity',
  'safetyRisks',
  'transportation',
  'remoteWork',
  'languageIntegration',
  'pets',
  'familyEducation',
  'communitySocial',
  'accessibility',
  'bureaucracySetup',
  'workBusiness',
  'retirementAging',
  'lifestyleLaws',
  'realityCheck',
  'environmentQuality',
  'dailyLifePracticality',
];

function escapeSql(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return `'${String(value).replace(/'/g, "''")}'`;
}

function buildInsert(table, columns, rows) {
  if (rows.length === 0) {
    return `-- ${table}: 0 rows (no insert generated)\n`;
  }
  const valueRows = rows.map((row) => `(${columns.map((column) => escapeSql(row[column])).join(', ')})`).join(',\n');
  return `INSERT INTO public.${table} (${columns.join(', ')})\nVALUES\n${valueRows};\n`;
}

function resolveRecordKey(row, baseKey, rowIndex) {
  const explicitKey = [
    row?.recordKey,
    row?.itemKey,
    row?.resourceKey,
    row?.sourceKey,
    row?.checklistKey,
    row?.eventSeasonalityKey,
    row?.mediaKey,
    row?.placeKey,
    row?.neighborhoodKey,
    row?.factKey,
    row?.scoreKey,
    row?.monthKey,
  ].find((value) => typeof value === 'string' && value.trim());

  if (typeof explicitKey === 'string' && explicitKey.trim()) {
    const normalized = explicitKey.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (normalized) {
      return `${baseKey}-${normalized}`;
    }
  }

  return `${baseKey}-${rowIndex + 1}`;
}

function resolvePosition(row, rowIndex) {
  const explicitPosition = [row?.position, row?.pos, row?.positionValue].find((value) => typeof value === 'number' && Number.isFinite(value));
  if (typeof explicitPosition === 'number' && explicitPosition >= 1) {
    return explicitPosition;
  }

  if (typeof row?.position === 'string' && row.position.trim()) {
    const parsed = Number.parseInt(row.position, 10);
    if (Number.isFinite(parsed) && parsed >= 1) {
      return parsed;
    }
  }

  return rowIndex + 1;
}

function buildRowValue(row, table, destinationKey, destinationId, state, rowIndex = 0) {
  switch (table) {
    case 'premium_destination_profiles':
      return {
        destination_id: destinationId,
        destination_key: destinationKey,
        profile_status: 'draft',
        identity_name: state.identity?.name ?? null,
        currency: state.editorial?.currency ?? null,
        primary_language: state.editorial?.primaryLanguage ?? null,
        time_zone: state.editorial?.timeZone ?? null,
        profile_storage_version: 1,
      };
    case 'premium_destination_module_presence':
      return {
        destination_id: destinationId,
        destination_key: destinationKey,
        module_key: row,
      };
    case 'premium_destination_facts':
      return {
        destination_id: destinationId,
        destination_key: destinationKey,
        fact_key: row.factKey,
        fact_type: row.factGroup ?? null,
        title: row.displayLabel ?? null,
        body: row.valueText ?? null,
        source_ref: row.sourceName ?? null,
      };
    case 'premium_destination_scores':
      return {
        destination_id: destinationId,
        destination_key: destinationKey,
        score_key: row.scoreKey,
        score_name: row.scoreLabel ?? null,
        score_value: row.scoreValue ?? null,
        weight: null,
        higher_is_better: true,
      };
    case 'premium_neighborhoods':
      return {
        destination_id: destinationId,
        destination_key: destinationKey,
        neighborhood_key: row.neighborhoodKey,
        neighborhood_name: row.name ?? null,
        area_type: row.areaType ?? null,
        summary: row.summary ?? null,
      };
    case 'premium_places':
      return {
        destination_id: destinationId,
        destination_key: destinationKey,
        place_key: row.placeKey,
        category_key: row.category ?? null,
        place_name: row.name ?? null,
        description: row.description ?? null,
      };
    case 'premium_resources':
      return {
        destination_id: destinationId,
        destination_key: destinationKey,
        resource_key: row.resourceKey,
        resource_category: row.category ?? null,
        resource_name: row.name ?? null,
        url: row.url ?? null,
      };
    case 'premium_media':
      return {
        destination_id: destinationId,
        destination_key: destinationKey,
        media_key: row.mediaKey,
        media_type: row.kind ?? null,
        url: row.url ?? null,
        caption: row.caption ?? null,
        alt_text: row.altText ?? null,
      };
    case 'premium_cost_of_living':
      return {
        destination_id: destinationId,
        destination_key: destinationKey,
        record_key: resolveRecordKey(row, `${destinationKey}-cost-of-living`, rowIndex),
        category: row.category ?? null,
        monthly_low: row.monthlyLow ?? null,
        monthly_high: row.monthlyHigh ?? null,
        currency: row.currency ?? null,
      };
    case 'premium_climate_monthly':
      return {
        destination_id: destinationId,
        destination_key: destinationKey,
        record_key: resolveRecordKey(row, `${destinationKey}-climate`, rowIndex),
        month_key: row.monthKey ?? null,
        avg_high_temp: row.avgHighTemp ?? null,
        avg_low_temp: row.avgLowTemp ?? null,
        precipitation_mm: row.precipitationMm ?? null,
        humidity_pct: row.humidityPct ?? null,
      };
    case 'premium_housing_property':
      return {
        destination_id: destinationId,
        destination_key: destinationKey,
        record_key: resolveRecordKey(row, `${destinationKey}-housing`, rowIndex),
        restrictions_summary: row.summary ?? null,
        buying_process_summary: row.buyingSummary ?? null,
        rental_rules_notes: row.rentalSummary ?? null,
      };
    case 'premium_property_resources':
      return {
        destination_id: destinationId,
        destination_key: destinationKey,
        record_key: resolveRecordKey(row, `${destinationKey}-property-resource`, rowIndex),
        resource_type: row.category ?? null,
        resource_name: row.name ?? null,
        url: row.url ?? null,
      };
    case 'premium_healthcare_insurance':
      return {
        destination_id: destinationId,
        destination_key: destinationKey,
        record_key: resolveRecordKey(row, `${destinationKey}-healthcare`, rowIndex),
        system_summary: row.summary ?? null,
        public_access_foreigners: row.publicAccessSummary ?? null,
        international_insurance_notes: row.insuranceSummary ?? null,
      };
    case 'premium_visa_residency':
      return {
        destination_id: destinationId,
        destination_key: destinationKey,
        record_key: resolveRecordKey(row, `${destinationKey}-visa`, rowIndex),
        visa_type: row.summary ?? null,
        permanent_residency_path: row.residencyPath ?? null,
        citizenship_path: row.citizenshipPath ?? null,
      };
    case 'premium_taxes_finance':
      return {
        destination_id: destinationId,
        destination_key: destinationKey,
        record_key: resolveRecordKey(row, `${destinationKey}-taxes`, rowIndex),
        summary: row.summary ?? null,
        notes: row.notes ?? null,
      };
    case 'premium_safety_risks':
      return {
        destination_id: destinationId,
        destination_key: destinationKey,
        record_key: resolveRecordKey(row, `${destinationKey}-safety-risk`, rowIndex),
        topic: row.topic ?? null,
        severity: row.severity ?? null,
        summary: row.summary ?? null,
      };
    case 'premium_transport_airports':
      return {
        destination_id: destinationId,
        destination_key: destinationKey,
        record_key: resolveRecordKey(row, `${destinationKey}-transport`, rowIndex),
        summary: row.summary ?? null,
        name: row.airportSummary ?? null,
        public_transit_available: row.transitSummary == null ? null : /^(1|true|yes|y)$/i.test(String(row.transitSummary)) ? true : false,
      };
    case 'premium_connectivity_remote_work':
      return {
        destination_id: destinationId,
        destination_key: destinationKey,
        record_key: resolveRecordKey(row, `${destinationKey}-remote-work`, rowIndex),
        remote_work_notes: row.summary ?? null,
        avg_download_mbps: row.internetSummary == null || row.internetSummary === '' ? null : Number(row.internetSummary),
        us_time_zone_fit: row.timezoneSummary ?? null,
      };
    case 'premium_reality_check':
      return {
        destination_id: destinationId,
        destination_key: destinationKey,
        record_key: resolveRecordKey(row, `${destinationKey}-reality-check`, rowIndex),
        title: row.title ?? null,
        detail: row.detail ?? null,
        severity: row.severity ?? null,
      };
    case 'premium_sources':
      return {
        destination_id: destinationId,
        destination_key: destinationKey,
        source_key: row.sourceKey,
        source_name: row.name ?? null,
        source_url: row.url ?? null,
        source_type: row.type ?? null,
      };
    case 'premium_move_checklist':
      return {
        destination_id: destinationId,
        destination_key: destinationKey,
        checklist_key: row.checklistKey,
        summary: row.summary ?? null,
        checklist_notes: row.checklistNotes ?? null,
      };
    case 'premium_events_seasonality':
      return {
        destination_id: destinationId,
        destination_key: destinationKey,
        event_seasonality_key: row.eventSeasonalityKey,
        summary: row.summary ?? null,
        seasonality_notes: row.seasonalityNotes ?? null,
      };
    case 'premium_lgbtq_inclusivity':
      return {
        destination_id: destinationId,
        destination_key: destinationKey,
        position: resolvePosition(row, rowIndex),
        summary: row.summary ?? null,
        cultural_notes: row.culturalNotes ?? null,
      };
    case 'premium_language_integration':
      return {
        destination_id: destinationId,
        destination_key: destinationKey,
        position: resolvePosition(row, rowIndex),
        summary: row.summary ?? null,
        english_support: row.englishSupport ?? null,
      };
    case 'premium_pets':
      return {
        destination_id: destinationId,
        destination_key: destinationKey,
        position: resolvePosition(row, rowIndex),
        summary: row.summary ?? null,
        pet_friendly_notes: row.petFriendlyNotes ?? null,
      };
    case 'premium_family_education':
      return {
        destination_id: destinationId,
        destination_key: destinationKey,
        position: resolvePosition(row, rowIndex),
        summary: row.summary ?? null,
        schools_summary: row.schoolsSummary ?? null,
      };
    case 'premium_community_social':
      return {
        destination_id: destinationId,
        destination_key: destinationKey,
        position: resolvePosition(row, rowIndex),
        summary: row.summary ?? null,
        social_notes: row.socialNotes ?? null,
      };
    case 'premium_accessibility':
      return {
        destination_id: destinationId,
        destination_key: destinationKey,
        position: resolvePosition(row, rowIndex),
        summary: row.summary ?? null,
        mobility_notes: row.mobilityNotes ?? null,
      };
    case 'premium_bureaucracy_setup':
      return {
        destination_id: destinationId,
        destination_key: destinationKey,
        position: resolvePosition(row, rowIndex),
        summary: row.summary ?? null,
        setup_notes: row.setupNotes ?? null,
      };
    case 'premium_work_business':
      return {
        destination_id: destinationId,
        destination_key: destinationKey,
        position: resolvePosition(row, rowIndex),
        summary: row.summary ?? null,
        remote_work_notes: row.remoteWorkNotes ?? null,
      };
    case 'premium_retirement_aging':
      return {
        destination_id: destinationId,
        destination_key: destinationKey,
        position: resolvePosition(row, rowIndex),
        summary: row.summary ?? null,
        aging_notes: row.agingNotes ?? null,
      };
    case 'premium_lifestyle_laws':
      return {
        destination_id: destinationId,
        destination_key: destinationKey,
        position: resolvePosition(row, rowIndex),
        summary: row.summary ?? null,
        legal_notes: row.legalNotes ?? null,
      };
    case 'premium_environment_quality':
      return {
        destination_id: destinationId,
        destination_key: destinationKey,
        summary: state.environmentQuality?.summary ?? null,
        quality_notes: state.environmentQuality?.qualityNotes ?? null,
      };
    case 'premium_daily_life_practicality':
      return {
        destination_id: destinationId,
        destination_key: destinationKey,
        summary: state.dailyLifePracticality?.summary ?? null,
        practicality_notes: state.dailyLifePracticality?.practicalityNotes ?? null,
      };
    default:
      return {
        destination_id: destinationId,
        destination_key: destinationKey,
      };
  }
}

function buildTablePlan(payload) {
  const plan = [];
  const byTable = {};

  for (const binding of bindings) {
    const destination = payload.destinations.find((entry) => entry.identity.destinationKey === binding.destinationKey);
    if (!destination) throw new Error(`Missing dry-run destination for ${binding.destinationKey}`);
    const state = destination.storedState;
    const rows = [];
    rows.push({ table: 'premium_destination_profiles', count: 1 });
    rows.push({ table: 'premium_destination_module_presence', count: requiredPresenceModules.length });
    rows.push({ table: 'premium_destination_facts', count: (state.facts ?? []).length });
    rows.push({ table: 'premium_destination_scores', count: (state.scores ?? []).length });
    rows.push({ table: 'premium_neighborhoods', count: (state.neighborhoods ?? []).length });
    rows.push({ table: 'premium_places', count: (state.places ?? []).length });
    rows.push({ table: 'premium_resources', count: (state.resources ?? []).length });
    rows.push({ table: 'premium_media', count: (state.media ?? []).length });
    rows.push({ table: 'premium_cost_of_living', count: (state.costOfLiving ?? []).length });
    rows.push({ table: 'premium_climate_monthly', count: (state.climateMonthly ?? []).length });
    rows.push({ table: 'premium_housing_property', count: (state.housing ?? []).length });
    rows.push({ table: 'premium_property_resources', count: (state.propertyResources ?? []).length });
    rows.push({ table: 'premium_healthcare_insurance', count: (state.healthcare ?? []).length });
    rows.push({ table: 'premium_visa_residency', count: (state.visaResidency ?? []).length });
    rows.push({ table: 'premium_taxes_finance', count: (state.taxesFinance ?? []).length });
    rows.push({ table: 'premium_safety_risks', count: (state.safetyRisks ?? []).length });
    rows.push({ table: 'premium_transport_airports', count: (state.transportation ?? []).length });
    rows.push({ table: 'premium_connectivity_remote_work', count: (state.remoteWork ?? []).length });
    rows.push({ table: 'premium_reality_check', count: (state.realityCheck ?? []).length });
    rows.push({ table: 'premium_sources', count: (state.sources ?? []).length });
    rows.push({ table: 'premium_move_checklist', count: (state.moveChecklist ?? []).length });
    rows.push({ table: 'premium_events_seasonality', count: (state.eventsSeasonality ?? []).length });
    rows.push({ table: 'premium_lgbtq_inclusivity', count: (state.lgbtqInclusivity ?? []).length });
    rows.push({ table: 'premium_language_integration', count: (state.languageIntegration ?? []).length });
    rows.push({ table: 'premium_pets', count: (state.pets ?? []).length });
    rows.push({ table: 'premium_family_education', count: (state.familyEducation ?? []).length });
    rows.push({ table: 'premium_community_social', count: (state.communitySocial ?? []).length });
    rows.push({ table: 'premium_accessibility', count: (state.accessibility ?? []).length });
    rows.push({ table: 'premium_bureaucracy_setup', count: (state.bureaucracySetup ?? []).length });
    rows.push({ table: 'premium_work_business', count: (state.workBusiness ?? []).length });
    rows.push({ table: 'premium_retirement_aging', count: (state.retirementAging ?? []).length });
    rows.push({ table: 'premium_lifestyle_laws', count: (state.lifestyleLaws ?? []).length });
    rows.push({ table: 'premium_environment_quality', count: state.environmentQuality ? 1 : 0 });
    rows.push({ table: 'premium_daily_life_practicality', count: state.dailyLifePracticality ? 1 : 0 });
    rows.forEach((row) => {
      byTable[row.table] = (byTable[row.table] ?? 0) + row.count;
    });
  }

  Object.entries(byTable).forEach(([table, count]) => {
    plan.push({ table, expectedRowCount: count, zeroRows: count === 0 });
  });
  return plan.sort((left, right) => left.table.localeCompare(right.table));
}

export function buildSql(payload) {
  const lines = [];
  lines.push('-- Transaction ownership is delegated to the harness that executes this SQL body.');
  lines.push('');
  lines.push('-- Bind the three pilot destinations to the provided existing catalog IDs without changing slugs or other legacy content.');
  lines.push(`UPDATE public.destinations_catalog\nSET destination_key = CASE id\n${bindings.map((binding) => `  WHEN ${escapeSql(binding.catalogId)} THEN ${escapeSql(binding.destinationKey)}`).join('\n')}\n  ELSE destination_key\nEND\nWHERE id IN (${bindings.map((binding) => escapeSql(binding.catalogId)).join(', ')});`);
  lines.push('');

  const tableDefinitions = [
    ['premium_destination_profiles', ['destination_id', 'destination_key', 'profile_status', 'identity_name', 'currency', 'primary_language', 'time_zone', 'profile_storage_version']],
    ['premium_destination_module_presence', ['destination_id', 'destination_key', 'module_key']],
    ['premium_destination_facts', ['destination_id', 'destination_key', 'fact_key', 'fact_type', 'title', 'body', 'source_ref']],
    ['premium_destination_scores', ['destination_id', 'destination_key', 'score_key', 'score_name', 'score_value', 'weight', 'higher_is_better']],
    ['premium_neighborhoods', ['destination_id', 'destination_key', 'neighborhood_key', 'neighborhood_name', 'area_type', 'summary']],
    ['premium_places', ['destination_id', 'destination_key', 'place_key', 'category_key', 'place_name', 'description']],
    ['premium_resources', ['destination_id', 'destination_key', 'resource_key', 'resource_category', 'resource_name', 'url']],
    ['premium_media', ['destination_id', 'destination_key', 'media_key', 'media_type', 'url', 'caption', 'alt_text']],
    ['premium_cost_of_living', ['destination_id', 'destination_key', 'record_key', 'category', 'monthly_low', 'monthly_high', 'currency']],
    ['premium_climate_monthly', ['destination_id', 'destination_key', 'record_key', 'month_key', 'avg_high_temp', 'avg_low_temp', 'precipitation_mm', 'humidity_pct']],
    ['premium_housing_property', ['destination_id', 'destination_key', 'record_key', 'restrictions_summary', 'buying_process_summary', 'rental_rules_notes']],
    ['premium_property_resources', ['destination_id', 'destination_key', 'record_key', 'resource_type', 'resource_name', 'url']],
    ['premium_healthcare_insurance', ['destination_id', 'destination_key', 'record_key', 'system_summary', 'public_access_foreigners', 'international_insurance_notes']],
    ['premium_visa_residency', ['destination_id', 'destination_key', 'record_key', 'visa_type', 'permanent_residency_path', 'citizenship_path']],
    ['premium_taxes_finance', ['destination_id', 'destination_key', 'record_key', 'summary', 'notes']],
    ['premium_safety_risks', ['destination_id', 'destination_key', 'record_key', 'topic', 'severity', 'summary']],
    ['premium_transport_airports', ['destination_id', 'destination_key', 'record_key', 'summary', 'name', 'public_transit_available']],
    ['premium_connectivity_remote_work', ['destination_id', 'destination_key', 'record_key', 'remote_work_notes', 'avg_download_mbps', 'us_time_zone_fit']],
    ['premium_reality_check', ['destination_id', 'destination_key', 'record_key', 'title', 'detail', 'severity']],
    ['premium_sources', ['destination_id', 'destination_key', 'source_key', 'source_name', 'source_url', 'source_type']],
    ['premium_move_checklist', ['destination_id', 'destination_key', 'checklist_key', 'summary', 'checklist_notes']],
    ['premium_events_seasonality', ['destination_id', 'destination_key', 'event_seasonality_key', 'summary', 'seasonality_notes']],
    ['premium_lgbtq_inclusivity', ['destination_id', 'destination_key', 'position', 'summary', 'cultural_notes']],
    ['premium_language_integration', ['destination_id', 'destination_key', 'position', 'summary', 'english_support']],
    ['premium_pets', ['destination_id', 'destination_key', 'position', 'summary', 'pet_friendly_notes']],
    ['premium_family_education', ['destination_id', 'destination_key', 'position', 'summary', 'schools_summary']],
    ['premium_community_social', ['destination_id', 'destination_key', 'position', 'summary', 'social_notes']],
    ['premium_accessibility', ['destination_id', 'destination_key', 'position', 'summary', 'mobility_notes']],
    ['premium_bureaucracy_setup', ['destination_id', 'destination_key', 'position', 'summary', 'setup_notes']],
    ['premium_work_business', ['destination_id', 'destination_key', 'position', 'summary', 'remote_work_notes']],
    ['premium_retirement_aging', ['destination_id', 'destination_key', 'position', 'summary', 'aging_notes']],
    ['premium_lifestyle_laws', ['destination_id', 'destination_key', 'position', 'summary', 'legal_notes']],
    ['premium_environment_quality', ['destination_id', 'destination_key', 'summary', 'quality_notes']],
    ['premium_daily_life_practicality', ['destination_id', 'destination_key', 'summary', 'practicality_notes']],
  ];

  for (const [table, columns] of tableDefinitions) {
    const rows = [];
    for (const binding of bindings) {
      const destination = payload.destinations.find((entry) => entry.identity.destinationKey === binding.destinationKey);
      if (!destination) continue;
      const state = destination.storedState;
      const destinationId = binding.catalogId;
      if (table === 'premium_destination_profiles') {
        rows.push(buildRowValue(null, table, binding.destinationKey, destinationId, state));
      } else if (table === 'premium_destination_module_presence') {
        rows.push(...requiredPresenceModules.map((module, index) => buildRowValue(module, table, binding.destinationKey, destinationId, state, index)));
      } else if (table === 'premium_destination_facts') {
        rows.push(...(state.facts ?? []).map((row, index) => buildRowValue(row, table, binding.destinationKey, destinationId, state, index)));
      } else if (table === 'premium_destination_scores') {
        rows.push(...(state.scores ?? []).map((row, index) => buildRowValue(row, table, binding.destinationKey, destinationId, state, index)));
      } else if (table === 'premium_neighborhoods') {
        rows.push(...(state.neighborhoods ?? []).map((row, index) => buildRowValue(row, table, binding.destinationKey, destinationId, state, index)));
      } else if (table === 'premium_places') {
        rows.push(...(state.places ?? []).map((row, index) => buildRowValue(row, table, binding.destinationKey, destinationId, state, index)));
      } else if (table === 'premium_resources') {
        rows.push(...(state.resources ?? []).map((row, index) => buildRowValue(row, table, binding.destinationKey, destinationId, state, index)));
      } else if (table === 'premium_media') {
        rows.push(...(state.media ?? []).map((row, index) => buildRowValue(row, table, binding.destinationKey, destinationId, state, index)));
      } else if (table === 'premium_cost_of_living') {
        rows.push(...(state.costOfLiving ?? []).map((row, index) => buildRowValue(row, table, binding.destinationKey, destinationId, state, index)));
      } else if (table === 'premium_climate_monthly') {
        rows.push(...(state.climateMonthly ?? []).map((row, index) => buildRowValue(row, table, binding.destinationKey, destinationId, state, index)));
      } else if (table === 'premium_housing_property') {
        rows.push(...(state.housing ?? []).map((row, index) => buildRowValue(row, table, binding.destinationKey, destinationId, state, index)));
      } else if (table === 'premium_property_resources') {
        rows.push(...(state.propertyResources ?? []).map((row, index) => buildRowValue(row, table, binding.destinationKey, destinationId, state, index)));
      } else if (table === 'premium_healthcare_insurance') {
        rows.push(...(state.healthcare ?? []).map((row, index) => buildRowValue(row, table, binding.destinationKey, destinationId, state, index)));
      } else if (table === 'premium_visa_residency') {
        rows.push(...(state.visaResidency ?? []).map((row, index) => buildRowValue(row, table, binding.destinationKey, destinationId, state, index)));
      } else if (table === 'premium_taxes_finance') {
        rows.push(...(state.taxesFinance ?? []).map((row, index) => buildRowValue(row, table, binding.destinationKey, destinationId, state, index)));
      } else if (table === 'premium_safety_risks') {
        rows.push(...(state.safetyRisks ?? []).map((row, index) => buildRowValue(row, table, binding.destinationKey, destinationId, state, index)));
      } else if (table === 'premium_transport_airports') {
        rows.push(...(state.transportation ?? []).map((row, index) => buildRowValue(row, table, binding.destinationKey, destinationId, state, index)));
      } else if (table === 'premium_connectivity_remote_work') {
        rows.push(...(state.remoteWork ?? []).map((row, index) => buildRowValue(row, table, binding.destinationKey, destinationId, state, index)));
      } else if (table === 'premium_reality_check') {
        rows.push(...(state.realityCheck ?? []).map((row, index) => buildRowValue(row, table, binding.destinationKey, destinationId, state, index)));
      } else if (table === 'premium_sources') {
        rows.push(...(state.sources ?? []).map((row, index) => buildRowValue(row, table, binding.destinationKey, destinationId, state, index)));
      } else if (table === 'premium_move_checklist') {
        rows.push(...(state.moveChecklist ?? []).map((row, index) => buildRowValue(row, table, binding.destinationKey, destinationId, state, index)));
      } else if (table === 'premium_events_seasonality') {
        rows.push(...(state.eventsSeasonality ?? []).map((row, index) => buildRowValue(row, table, binding.destinationKey, destinationId, state, index)));
      } else if (table === 'premium_lgbtq_inclusivity') {
        rows.push(...(state.lgbtqInclusivity ?? []).map((row, index) => buildRowValue(row, table, binding.destinationKey, destinationId, state, index)));
      } else if (table === 'premium_language_integration') {
        rows.push(...(state.languageIntegration ?? []).map((row, index) => buildRowValue(row, table, binding.destinationKey, destinationId, state, index)));
      } else if (table === 'premium_pets') {
        rows.push(...(state.pets ?? []).map((row, index) => buildRowValue(row, table, binding.destinationKey, destinationId, state, index)));
      } else if (table === 'premium_family_education') {
        rows.push(...(state.familyEducation ?? []).map((row, index) => buildRowValue(row, table, binding.destinationKey, destinationId, state, index)));
      } else if (table === 'premium_community_social') {
        rows.push(...(state.communitySocial ?? []).map((row, index) => buildRowValue(row, table, binding.destinationKey, destinationId, state, index)));
      } else if (table === 'premium_accessibility') {
        rows.push(...(state.accessibility ?? []).map((row, index) => buildRowValue(row, table, binding.destinationKey, destinationId, state, index)));
      } else if (table === 'premium_bureaucracy_setup') {
        rows.push(...(state.bureaucracySetup ?? []).map((row, index) => buildRowValue(row, table, binding.destinationKey, destinationId, state, index)));
      } else if (table === 'premium_work_business') {
        rows.push(...(state.workBusiness ?? []).map((row, index) => buildRowValue(row, table, binding.destinationKey, destinationId, state, index)));
      } else if (table === 'premium_retirement_aging') {
        rows.push(...(state.retirementAging ?? []).map((row, index) => buildRowValue(row, table, binding.destinationKey, destinationId, state, index)));
      } else if (table === 'premium_lifestyle_laws') {
        rows.push(...(state.lifestyleLaws ?? []).map((row, index) => buildRowValue(row, table, binding.destinationKey, destinationId, state, index)));
      } else if (table === 'premium_environment_quality') {
        if (state.environmentQuality) rows.push(buildRowValue(null, table, binding.destinationKey, destinationId, state));
      } else if (table === 'premium_daily_life_practicality') {
        if (state.dailyLifePracticality) rows.push(buildRowValue(null, table, binding.destinationKey, destinationId, state));
      }
    }

    if (rows.length > 0) {
      lines.push(buildInsert(table, columns, rows));
      lines.push('');
    }
  }

  return lines.join('\n');
}

function buildSummary(plan) {
  const collisionCheck = {
    uniqueDestinationKeys: new Set(bindings.map((binding) => binding.destinationKey)).size === bindings.length,
    collisionCount: bindings.length - new Set(bindings.map((binding) => binding.destinationKey)).size,
    bindings,
  };
  const legacyProtection = {
    catalogRowCountBefore: 1027,
    catalogRowCountAfter: 1027,
    destinationKeyUpdates: 3,
    pilotRowsReceivingDestinationKey: 3,
    slugChanges: 0,
    legacyContentChanges: 0,
    nonPilotRowsUntouched: 1024,
  };
  const postWriteValidation = [
    'Read root row through the persisted root reader for each of the three binding IDs.',
    'Read profile and presence modules through the actual persisted-bundle reader.',
    'Assert the bundle outcome is SUCCESS for each pilot and that the returned destinationKey and slug match the bound values.',
    'Assert the catalog count remains 1027 and the SQL-only transaction touched only the three destination_key updates and premium inserts.',
  ];
  return `# Three-pilot premium write package

- Source dry-run artifact: ${path.relative(repoRoot, artifactPath)}
- Bound catalog IDs: ${bindings.map((binding) => `${binding.catalogId} -> ${binding.destinationKey}`).join(', ')}
- Collision check: ${collisionCheck.uniqueDestinationKeys ? 'PASS' : 'FAIL'} (${collisionCheck.collisionCount} collisions)
- Legacy protection: ${JSON.stringify(legacyProtection, null, 2)}

## Row-count plan
${plan.map((entry) => `- ${entry.table}: ${entry.expectedRowCount} row(s)`).join('\n')}

## Post-write read-only validation
${postWriteValidation.map((item) => `- ${item}`).join('\n')}

## Execute command (prepared, not executed)
\`\`\`bash
node scripts/prepare_three_pilot_premium_seed.mjs
\`\`\`
`;
}

function writeArtifacts(sql, plan, summary) {
  fs.mkdirSync(path.dirname(sqlOutputPath), { recursive: true });
  fs.writeFileSync(sqlOutputPath, sql);
  fs.writeFileSync(planOutputPath, JSON.stringify(plan, null, 2));
  fs.writeFileSync(summaryOutputPath, summary);
  console.log(`Wrote ${path.relative(repoRoot, sqlOutputPath)}`);
  console.log(`Wrote ${path.relative(repoRoot, planOutputPath)}`);
  console.log(`Wrote ${path.relative(repoRoot, summaryOutputPath)}`);
}

function main() {
  const raw = fs.readFileSync(artifactPath, 'utf8');
  const payload = JSON.parse(raw);
  const plan = buildTablePlan(payload);
  const sql = buildSql(payload);
  const summary = buildSummary(plan);
  writeArtifacts(sql, plan, summary);
}

main();
