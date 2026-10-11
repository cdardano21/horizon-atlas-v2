import { describe, expect, it } from 'vitest';
import { loadFrozenWorkbookV31DeterministicImport } from '../../../workbook-v31-deterministic-core';
import { mapCanonicalDestinationToStoredState } from '../map-canonical-destination-to-stored-state';
import { projectCanonicalComparable, projectStoredComparable } from '../comparable-projection';
import { buildDestinationPlan } from '../plan-destination';
import { interpretOperationManifest } from '../manifest';
import { buildDestinationPlanWriteStatements } from '../write-port';
import { createSupabasePersistedDestinationReadPort } from '../supabase-persisted-destination-read-port';
import { normalizeHealthcareAvailabilityUnknown } from '../healthcare-availability-storage';
import type { PersistedReplaceModulesRows } from '../normalize-persisted-destination-rows';
import type { DestinationId } from '../types';

const workbook = 'data/legacy-malaga-01/DestinationFinderAI-Malaga-Premium-Owner-Review-v3-v3.3.xlsx';
describe('Healthcare unassessed availability persistence', () => {
  it.each(['Unknown', 'UNKNOWN', ' unknown ', null])('normalizes only explicit unknown/absent availability: %s', value => {
    expect(normalizeHealthcareAvailabilityUnknown(value)).toBeNull();
  });
  it.each(['Yes', 'No', 'true', 'false', '1', '0', 'Limited private services'])('preserves other evidence for existing validation: %s', value => {
    expect(normalizeHealthcareAvailabilityUnknown(value)).toBe(value);
  });
  it('round-trips unknown, positive and negative availability through planner, SQL and existing reader', async () => {
    const parsed = await loadFrozenWorkbookV31DeterministicImport(workbook);
    expect(parsed.validationErrors).toEqual([]);
    const base = parsed.canonicalDestinations![0];
    const canonical = { ...base, healthcare: ['Unknown', 'Yes', 'No'].map((value, index) => ({ ...base.healthcare[0], record_key: `health-${index}`, private_care_available: value })) };
    const full = mapCanonicalDestinationToStoredState(canonical);
    expect(full.healthcare.map(row => row.privateCareAvailable)).toEqual([null, 'Yes', 'No']);
    expect(canonical.healthcare[0].private_care_available).toBe('Unknown');
    const identity = { destinationKey: full.identity.destinationKey, destinationId: '66f27e80-a7bf-4e60-b2e1-47c28d9e4a0b' as DestinationId };
    const manifest = interpretOperationManifest({ manifest: { entries: [{ destinationKey: identity.destinationKey, operation: 'REPLACE_MODULE', targetModule: 'healthcare', reason: 'offline round-trip test' }] }, canonicalDestinations: [{ ...canonical, identity: { ...canonical.identity, destinationKey: identity.destinationKey } }], approvedScope: [identity] });
    expect(manifest.valid).toBe(true);
    const plan = buildDestinationPlan({ resolvedDestinationIdentity: identity, canonicalDestination: canonical, storedDestinationState: { ...full, healthcare: [] }, manifestInterpretation: manifest, approvedScope: [identity], diffPolicy: { updateMode: 'MERGE_NONBLANK', normalizationVersion: 'v31-normalize-1', diffPolicyVersion: 'v31-diff-1' } });
    expect(plan.errors).toEqual([]);
    const rows = buildDestinationPlanWriteStatements(plan).filter(s => s.text.startsWith('insert into public.premium_healthcare_insurance ')).map(s => {
      const columns = s.text.match(/\(([^)]+)\) values/)![1].split(', ');
      return Object.fromEntries(columns.map((column, index) => [column, s.values[index]]));
    });
    expect(rows).toHaveLength(3);
    expect(rows.map(row => row.private_care_available)).toEqual([null, true, false]);
    const port = createSupabasePersistedDestinationReadPort({ async selectRows(args) { return args.table === 'premium_healthcare_insurance' ? rows : []; } });
    const read = await port.readReplaceModules(identity);
    if (!read.ok) throw new Error('read failed');
    const restored = (read.value as PersistedReplaceModulesRows).healthcare.map(({ destinationId, destinationKey, ...row }) => row);
    expect(restored.map(row => row.privateCareAvailable)).toEqual([null, true, false]);
    expect(projectStoredComparable({ ...full, healthcare: restored }).healthcare).toEqual(projectCanonicalComparable(canonical).healthcare);
    expect(plan.expectedComparablePostState.healthcare).toEqual(projectCanonicalComparable(canonical).healthcare);
    const negative = { ...canonical, healthcare: canonical.healthcare.map(row => ({ ...row, private_care_available: 'No' })) };
    expect(projectCanonicalComparable(canonical).healthcare).not.toEqual(projectCanonicalComparable(negative).healthcare);
    const unsupported = { ...canonical, healthcare: canonical.healthcare.map(row => ({ ...row, private_care_available: 'Limited private services' })) };
    expect(projectCanonicalComparable(unsupported).healthcare).not.toEqual(projectCanonicalComparable(canonical).healthcare);
  });
});
