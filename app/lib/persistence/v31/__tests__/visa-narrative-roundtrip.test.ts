import type { PersistedReplaceModulesRows } from "../normalize-persisted-destination-rows";
import { describe, expect, it } from 'vitest';
import { loadFrozenWorkbookV31DeterministicImport } from '../../../workbook-v31-deterministic-core';
import { mapCanonicalDestinationToStoredState } from '../map-canonical-destination-to-stored-state';
import { projectCanonicalComparable, projectStoredComparable } from '../comparable-projection';
import { buildDestinationPlan } from '../plan-destination';
import { interpretOperationManifest } from '../manifest';
import { buildDestinationPlanWriteStatements } from '../write-port';
import { createSupabasePersistedDestinationReadPort } from '../supabase-persisted-destination-read-port';
import type { DestinationId } from '../types';
import { visaResidencyFields } from '../visa-residency-fields';

const workbook = 'data/legacy-malaga-01/DestinationFinderAI-Malaga-Premium-Owner-Review-v3-v3.3.xlsx';

describe('Málaga visa narrative persistence', () => {
  it('preserves all three authored classifications and narratives through real planner, SQL and read port', async () => {
    const parsed = await loadFrozenWorkbookV31DeterministicImport(workbook);
    expect(parsed.validationErrors).toEqual([]);
    const canonical = parsed.canonicalDestinations![0];
    const full = mapCanonicalDestinationToStoredState(canonical);
    const identity = { destinationKey: full.identity.destinationKey, destinationId: '66f27e80-a7bf-4e60-b2e1-47c28d9e4a0b' as DestinationId };
    const manifest = interpretOperationManifest({ manifest: { entries: [{ destinationKey: identity.destinationKey, operation: 'REPLACE_MODULE', targetModule: 'visaResidency', reason: 'isolated round-trip test' }] }, canonicalDestinations: [{ ...canonical, identity: { ...canonical.identity, destinationKey: identity.destinationKey } }], approvedScope: [identity] });
    expect(manifest.valid).toBe(true);
    const plan = buildDestinationPlan({ resolvedDestinationIdentity: identity, canonicalDestination: canonical, storedDestinationState: { ...full, visaResidency: [] }, manifestInterpretation: manifest, approvedScope: [identity], diffPolicy: { updateMode: 'MERGE_NONBLANK', normalizationVersion: 'v31-normalize-1', diffPolicyVersion: 'v31-diff-1' } });
    expect(plan.errors).toEqual([]);
    const inserts = buildDestinationPlanWriteStatements(plan).filter(s => s.text.startsWith('insert into public.premium_visa_residency '));
    expect(inserts).toHaveLength(3);
    const rows = inserts.map(s => {
      const columns = s.text.match(/\(([^)]+)\) values/)![1].split(', ');
      return Object.fromEntries(columns.map((c, i) => [c, s.values[i]]));
    });
    rows.forEach((row, i) => {
      expect(row.visa_type).toBe(canonical.visaResidency[i].visa_type ?? null);
      expect(row.residency_option).toBe(canonical.visaResidency[i].residency_option ?? null);
    });
    expect(rows[1].visa_type).toBe('UNKNOWN');
    expect(rows[1].residency_option).toBe('International telework route identified; complete current requirements not independently retrieved.');
    const port = createSupabasePersistedDestinationReadPort({ async selectRows(args) {
      if (args.table !== 'premium_visa_residency') return [];
      expect(args.select.split(',')).toContain('visa_type');
      expect(args.select.split(',')).toContain('residency_option');
      return rows;
    } });
    const read = await port.readReplaceModules(identity);
    if (!read.ok) throw new Error('read failed');
    const restored = (read.value as PersistedReplaceModulesRows).visaResidency.map(({ destinationId, destinationKey, ...row }) => row);
    expect(projectStoredComparable({ ...full, visaResidency: restored }).visaResidency).toEqual(projectCanonicalComparable(canonical).visaResidency);
    expect(plan.expectedComparablePostState.visaResidency).toEqual(projectStoredComparable({ ...full, visaResidency: restored }).visaResidency);
    expect(restored[1].summary).toBe(rows[1].residency_option);
    expect(restored[1].visaType).toBe('UNKNOWN');
  });
  it('retains legacy classification display without inventing a narrative', () => {
    expect(visaResidencyFields('D7', null)).toEqual({ summary: 'D7', visaType: 'D7', residencyOption: null });
    expect(visaResidencyFields(null, null)).toEqual({ summary: null, visaType: null, residencyOption: null });
  });
  it('preserves exact narrative bytes separately from the category', () => {
    const narrative = '  Explanation with accents: Málaga.\nSecond line.  ';
    expect(visaResidencyFields('UNKNOWN', narrative)).toEqual({ summary: narrative, visaType: 'UNKNOWN', residencyOption: narrative });
  });
});
