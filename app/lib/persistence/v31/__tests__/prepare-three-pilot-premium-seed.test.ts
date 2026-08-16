import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { buildSql } from '../../../../../scripts/prepare_three_pilot_premium_seed.mjs';

function readPositionConstraintTables() {
  const migrationPath = path.resolve(process.cwd(), 'supabase/migrations/20260813120000_premium_v31_remaining_module_storage.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');
  return Array.from(migrationSql.matchAll(/create\s+table\s+public\.(premium_[a-z0-9_]+)[\s\S]*?unique\s*\(destination_id,\s*position\)/gi)).map((match) => match[1].toLowerCase());
}

function splitSqlRowValues(value: string) {
  const values: string[] = [];
  let current = '';
  let inString = false;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    const nextChar = value[index + 1];

    if (char === "'") {
      if (inString && nextChar === "'") {
        current += "''";
        index += 1;
      } else {
        inString = !inString;
        current += char;
      }
      continue;
    }

    if (char === ',' && !inString) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  if (current.trim()) {
    values.push(current.trim());
  }

  return values;
}

function parseSqlLiteral(value: string) {
  const trimmed = value.trim();
  if (trimmed === 'NULL') {
    return null;
  }
  if (/^\d+$/.test(trimmed)) {
    return Number.parseInt(trimmed, 10);
  }
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1).replace(/''/g, "'");
  }
  return trimmed;
}

function parseInsertRows(sql: string, table: string) {
  const marker = `INSERT INTO public.${table} `;
  const markerIndex = sql.indexOf(marker);
  if (markerIndex === -1) {
    return [];
  }

  let statementEnd = -1;
  let inString = false;
  for (let index = markerIndex; index < sql.length; index += 1) {
    const char = sql[index];
    const nextChar = sql[index + 1];

    if (char === "'") {
      if (inString && nextChar === "'") {
        index += 1;
      } else {
        inString = !inString;
      }
      continue;
    }

    if (!inString && char === ';') {
      statementEnd = index;
      break;
    }
  }

  if (statementEnd === -1) {
    return [];
  }

  const statement = sql.slice(markerIndex, statementEnd + 1);
  const columnsStart = statement.indexOf('(');
  const columnsEnd = statement.indexOf(')', columnsStart);
  const valuesIndex = statement.indexOf('VALUES', columnsEnd);
  if (columnsStart === -1 || columnsEnd === -1 || valuesIndex === -1) {
    return [];
  }

  const columns = statement.slice(columnsStart + 1, columnsEnd).split(',').map((column) => column.trim());
  const body = statement.slice(valuesIndex + 'VALUES'.length, statement.length - 1);

  const rowMatches: string[] = [];
  let currentRow = '';
  let depth = 0;
  let bodyInString = false;

  for (let index = 0; index < body.length; index += 1) {
    const char = body[index];
    const nextChar = body[index + 1];

    if (char === "'") {
      if (bodyInString && nextChar === "'") {
        currentRow += "''";
        index += 1;
      } else {
        bodyInString = !bodyInString;
        currentRow += char;
      }
      continue;
    }

    if (!bodyInString) {
      if (char === '(') {
        depth += 1;
        if (depth === 1) {
          currentRow = '';
          continue;
        }
      } else if (char === ')') {
        depth -= 1;
        if (depth === 0) {
          rowMatches.push(currentRow.trim());
          currentRow = '';
          continue;
        }
      }
    }

    if (depth > 0) {
      currentRow += char;
    }
  }

  const columnIndexes = Object.fromEntries(columns.map((column, index) => [column, index]));

  return rowMatches.map((row) => {
    const values = splitSqlRowValues(row);
    return {
      destinationId: parseSqlLiteral(values[columnIndexes.destination_id] ?? ''),
      destinationKey: parseSqlLiteral(values[columnIndexes.destination_key] ?? ''),
      position: columnIndexes.position !== undefined ? parseSqlLiteral(values[columnIndexes.position] ?? '') : null,
    };
  });
}

describe('prepare_three_pilot_premium_seed', () => {
  it('uses the live premium table column names', () => {
    const payload = {
      destinations: [
        {
          identity: {
            destinationKey: 'lisbon-pt',
            slug: 'lisbon-portugal',
            name: 'Lisbon',
            country: 'Portugal',
          },
          storedState: {
            identity: { name: 'Lisbon' },
            editorial: { currency: 'EUR', primaryLanguage: 'Portuguese', timeZone: 'Europe/Lisbon' },
            facts: [{ factKey: 'fact-1', factGroup: 'climate', valueText: 'Mediterranean', displayLabel: 'Climate', sourceName: 'Workbook' }],
            scores: [{ scoreKey: 'score-1', scoreValue: '90', scoreLabel: 'Excellent', methodologyVersion: '1' }],
            neighborhoods: [{ neighborhoodKey: 'neighborhood-1', name: 'Bairro', summary: 'Nice', areaType: 'urban' }],
            places: [{ placeKey: 'place-1', category: 'museum', name: 'Museum', description: 'Great' }],
            resources: [{ resourceKey: 'resource-1', category: 'tourism', name: 'Visit Lisbon', url: 'https://example.com' }],
            media: [{ mediaKey: 'media-1', kind: 'image', url: 'https://example.com/img.jpg', caption: 'Image', altText: 'Alt' }],
            costOfLiving: [{ itemKey: 'col-1', category: 'housing', monthlyLow: '1000', monthlyHigh: '2000', currency: 'EUR' }],
            climateMonthly: [{ monthKey: '1', avgHighTemp: '15', avgLowTemp: '8', precipitationMm: '100', humidityPct: '70' }],
            housing: [{ summary: 'Good', buyingSummary: 'Easy', rentalSummary: 'Strict' }],
            propertyResources: [{ itemKey: 'prop-1', category: 'for_sale', name: 'Idealista', url: 'https://example.com' }],
            healthcare: [{ summary: 'Good', publicAccessSummary: 'Easy', insuranceSummary: 'Required' }],
            visaResidency: [{ summary: 'D', residencyPath: 'Long', citizenshipPath: 'Long' }],
            taxesFinance: [{ summary: 'Simple', notes: 'No issues' }],
            lgbtqInclusivity: [{ summary: 'Good', culturalNotes: 'Active' }],
            safetyRisks: [{ itemKey: 'risk-1', topic: 'heat', severity: 'medium', summary: 'High' }],
            transportation: [{ summary: 'Good', airportSummary: 'Airport', transitSummary: 'Yes' }],
            remoteWork: [{ summary: 'Fast', internetSummary: '300', timezoneSummary: 'Good' }],
            languageIntegration: [{ summary: 'English works', englishSupport: 'Yes' }],
            pets: [{ summary: 'Pet-friendly', petFriendlyNotes: 'Good' }],
            familyEducation: [{ summary: 'Great', schoolsSummary: 'Many' }],
            communitySocial: [{ summary: 'Social', socialNotes: 'Many' }],
            accessibility: [{ summary: 'Accessible', mobilityNotes: 'Good' }],
            bureaucracySetup: [{ summary: 'Easy', setupNotes: 'Passport' }],
            workBusiness: [{ summary: 'Good', remoteWorkNotes: 'Great' }],
            retirementAging: [{ summary: 'Good', agingNotes: 'Great' }],
            lifestyleLaws: [{ summary: 'Good', legalNotes: 'Rules' }],
            realityCheck: [{ itemKey: 'reality-1', title: 'Beware', detail: 'Info', severity: 'medium' }],
            moveChecklist: [{ checklistKey: 'move-1', summary: 'Pack', checklistNotes: 'Move' }],
            eventsSeasonality: [{ eventSeasonalityKey: 'season-1', summary: 'Festival', seasonalityNotes: 'Warm' }],
            sources: [{ sourceKey: 'source-1', name: 'Source', url: 'https://example.com', type: 'gov' }],
            environmentQuality: { summary: 'Good', qualityNotes: 'Good' },
            dailyLifePracticality: { summary: 'Great', practicalityNotes: 'Be prepared' },
          },
        },
      ],
    };

    const sql = buildSql(payload);

    expect(sql).toContain('INSERT INTO public.premium_housing_property (destination_id, destination_key, record_key, restrictions_summary, buying_process_summary, rental_rules_notes)');
    expect(sql).toContain('INSERT INTO public.premium_healthcare_insurance (destination_id, destination_key, record_key, system_summary, public_access_foreigners, international_insurance_notes)');
    expect(sql).toContain('INSERT INTO public.premium_visa_residency (destination_id, destination_key, record_key, visa_type, permanent_residency_path, citizenship_path)');
    expect(sql).toContain('INSERT INTO public.premium_transport_airports (destination_id, destination_key, record_key, summary, name, public_transit_available)');
    expect(sql).toContain('INSERT INTO public.premium_connectivity_remote_work (destination_id, destination_key, record_key, remote_work_notes, avg_download_mbps, us_time_zone_fit)');
    expect(sql).not.toContain('buying_summary');
    expect(sql).not.toContain('public_access_summary');
    expect(sql).not.toContain('airport_summary');
    expect(sql).not.toContain('internet_summary');
  });

  it('derives distinct record keys for multi-row premium arrays', () => {
    const payload = {
      destinations: [
        {
          identity: {
            destinationKey: 'lisbon-pt',
            slug: 'lisbon-portugal',
            name: 'Lisbon',
            country: 'Portugal',
          },
          storedState: {
            identity: { name: 'Lisbon' },
            editorial: { currency: 'EUR', primaryLanguage: 'Portuguese', timeZone: 'Europe/Lisbon' },
            visaResidency: [
              { summary: 'Short stay', residencyPath: 'Temporary', citizenshipPath: 'None' },
              { summary: 'Long stay', residencyPath: 'Permanent', citizenshipPath: 'Eligible' },
            ],
            transportation: [
              { summary: 'Airport', airportSummary: 'Large', transitSummary: 'Good' },
              { summary: 'Intercity', airportSummary: 'None', transitSummary: 'Excellent' },
            ],
            remoteWork: [
              { summary: 'Fast', internetSummary: '400', timezoneSummary: 'Good' },
              { summary: 'Stable', internetSummary: '500', timezoneSummary: 'Great' },
            ],
            realityCheck: [
              { itemKey: 'check-1', title: 'Beware', detail: 'Info', severity: 'medium' },
              { itemKey: 'check-2', title: 'Also beware', detail: 'More info', severity: 'high' },
            ],
          },
        },
      ],
    };

    const sql = buildSql(payload);

    expect(sql).toContain("'lisbon-pt-visa-1'");
    expect(sql).toContain("'lisbon-pt-visa-2'");
    expect(sql).toContain("'lisbon-pt-transport-1'");
    expect(sql).toContain("'lisbon-pt-transport-2'");
    expect(sql).toContain("'lisbon-pt-remote-work-1'");
    expect(sql).toContain("'lisbon-pt-remote-work-2'");
    expect(sql).toContain("'lisbon-pt-reality-check-check-1'");
    expect(sql).toContain("'lisbon-pt-reality-check-check-2'");
  });

  it('writes per-destination sequential positions for every position-based module in the SQL artifact', () => {
    execFileSync('node', ['scripts/prepare_three_pilot_premium_seed.mjs'], {
      cwd: process.cwd(),
      stdio: 'pipe',
      encoding: 'utf8',
    });

    const sqlPath = path.resolve(process.cwd(), 'tmp/three-pilot-premium-write.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    const tables = [
      'premium_lgbtq_inclusivity',
      'premium_language_integration',
      'premium_pets',
      'premium_family_education',
      'premium_community_social',
      'premium_accessibility',
      'premium_bureaucracy_setup',
      'premium_work_business',
      'premium_retirement_aging',
      'premium_lifestyle_laws',
    ];

    for (const table of tables) {
      const rows = parseInsertRows(sql, table);
      expect(rows.length).toBeGreaterThan(0);

      const rowsByDestination = new Map<string, Array<{ position: number }>>();
      for (const row of rows) {
        const destinationKey = String(row.destinationKey ?? '');
        const rowsForDestination = rowsByDestination.get(destinationKey) ?? [];
        rowsForDestination.push({ position: Number(row.position) });
        rowsByDestination.set(destinationKey, rowsForDestination);
      }

      for (const [, destinationRows] of rowsByDestination.entries()) {
        const positions = destinationRows.map((row) => row.position);
        expect(positions).toEqual(positions.map((_, index) => index + 1));
        expect(new Set(positions).size).toBe(positions.length);
      }
    }
  });

  it('does not emit transaction-control statements for harness-owned rollback execution', () => {
    execFileSync('node', ['scripts/prepare_three_pilot_premium_seed.mjs'], {
      cwd: process.cwd(),
      stdio: 'pipe',
      encoding: 'utf8',
    });

    const sqlPath = path.resolve(process.cwd(), 'tmp/three-pilot-premium-write.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    expect(sql).not.toContain('COMMIT');
    expect(sql).not.toContain('BEGIN;');
  });

  it('generates zero duplicate tuples for actual destination-position unique constraints in the SQL artifact', () => {
    execFileSync('node', ['scripts/prepare_three_pilot_premium_seed.mjs'], {
      cwd: process.cwd(),
      stdio: 'pipe',
      encoding: 'utf8',
    });

    const sqlPath = path.resolve(process.cwd(), 'tmp/three-pilot-premium-write.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    const tables = readPositionConstraintTables();

    for (const table of tables) {
      const rows = parseInsertRows(sql, table);
      const tuples = rows.map((row) => `${String(row.destinationId ?? '')}|${String(row.position ?? '')}`);
      expect(new Set(tuples).size).toBe(tuples.length);
    }
  });
});
