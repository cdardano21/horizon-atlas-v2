import type { PersistedKeyedChildrenRows } from '../normalize-persisted-destination-rows';
import { describe, expect, it } from 'vitest';
import { loadFrozenWorkbookV31DeterministicImport } from '../../../workbook-v31-deterministic-core';
import { mapCanonicalDestinationToStoredState } from '../map-canonical-destination-to-stored-state';
import { projectCanonicalComparable, projectStoredComparable } from '../comparable-projection';
import { buildDestinationPlan } from '../plan-destination';
import { interpretOperationManifest } from '../manifest';
import { buildDestinationPlanWriteStatements } from '../write-port';
import { createSupabasePersistedDestinationReadPort } from '../supabase-persisted-destination-read-port';
import type { DestinationId, MediaKey } from '../types';

describe('Málaga media exact persistence', () => {
  it('retains all three authored images, provenance, licenses, flags, order and verification dates', async () => {
    const parsed = await loadFrozenWorkbookV31DeterministicImport('data/legacy-malaga-01/DestinationFinderAI-Malaga-Premium-Owner-Review-v3-v3.3.xlsx');
    expect(parsed.validationErrors).toEqual([]);
    const canonical = parsed.canonicalDestinations![0];
    const full = mapCanonicalDestinationToStoredState(canonical);
    const identity = { destinationKey: full.identity.destinationKey, destinationId: '66f27e80-a7bf-4e60-b2e1-47c28d9e4a0b' as DestinationId };
    const manifestInterpretation = interpretOperationManifest({ manifest: { entries: [] }, canonicalDestinations: [{ ...canonical, identity: { ...canonical.identity, destinationKey: identity.destinationKey } }], approvedScope: [identity] });
    const plan = buildDestinationPlan({ resolvedDestinationIdentity: identity, canonicalDestination: canonical, storedDestinationState: { ...full, media: [] }, manifestInterpretation, approvedScope: [identity], diffPolicy: { updateMode: 'MERGE_NONBLANK', normalizationVersion: 'v31-normalize-1', diffPolicyVersion: 'v31-diff-1' } });
    expect(plan.errors).toEqual([]);
    const inserts = buildDestinationPlanWriteStatements(plan).filter(s => s.text.startsWith('insert into public.premium_media '));
    expect(inserts).toHaveLength(3);
    const rows = inserts.map(s => {
      const columns = s.text.match(/\(([^)]+)\) values/)![1].split(', ');
      const row = Object.fromEntries(columns.map((c, i) => [c, s.values[i]]));
      const authored = canonical.media.find(m => m.media_key === row.media_key)!;
      expect(row.url).toBe(authored.image_url);
      expect(row.caption).toBe(authored.caption);
      expect(row.alt_text).toBe(authored.subject);
      expect(row.source_name).toBe(authored.source_name);
      expect(row.source_url).toBe(authored.source_url);
      expect(row.metadata).toEqual({ licenseNotes: authored.license_notes, verifiedAt: authored.verified_at });
      expect(authored.verified_at).toBe('2026-10-11');
      // PostgreSQL boolean/integer representation, not a string-only mock.
      row.is_primary = row.is_primary === true || row.is_primary === '1' || row.is_primary === 'true';
      row.sort_order = Number(row.sort_order);
      expect(row.is_primary).toBe(authored.primary_image === '1');
      expect(row.sort_order).toBe(Number(authored.gallery_order));
      expect(row.verified).toBe(true);
      return row;
    });
    const port = createSupabasePersistedDestinationReadPort({ async selectRows(args) { return args.table === 'premium_media' ? rows : []; } });
    const read = await port.readKeyedChildren(identity);
    if (!read.ok) throw new Error('read failed');
    const restored = (read.value as PersistedKeyedChildrenRows).media.map(({ destinationId, destinationKey, ...row }) => ({ ...row, mediaKey: row.mediaKey as MediaKey }));
    const actual = projectStoredComparable({ ...full, media: restored }).media;
    expect(actual).toEqual(projectCanonicalComparable(canonical).media);
    expect(actual).toEqual(plan.expectedComparablePostState.media);
    for (const row of restored) {
      const authored = canonical.media.find(m => m.media_key === row.mediaKey)!;
      expect(row.verifiedAt).toBe(authored.verified_at);
      expect(row.licenseNotes).toBe(authored.license_notes);
    }
    expect(projectStoredComparable({ ...full, media: restored.map((r, i) => i === 0 ? { ...r, verifiedAt: null } : r) }).media).not.toEqual(actual);
    expect(projectStoredComparable({ ...full, media: restored.map((r, i) => i === 0 ? { ...r, isPrimary: 'true' } : r) }).media).not.toEqual(actual);
  });
});
