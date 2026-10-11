import { describe, expect, it } from 'vitest';
import { buildMalagaCompletePlanFixture } from './helpers/malaga-complete-plan';

describe('Isolated Málaga complete controlled plan', () => {
  it('uses the existing planner and writer to preserve every module, lifestyle identity and catalog binding', async () => {
    const result = await buildMalagaCompletePlanFixture();
    expect(result.differences).toEqual({});
    expect(result.databaseWrites).toBe(0);
    expect(result.scope).toEqual({ destinationKey: 'malaga-spain', destinationId: '66f27e80-a7bf-4e60-b2e1-47c28d9e4a0b' });
    expect(result.statusBefore).toBe('published');
    expect(result.statusAfter).toBe('published');
    expect(result.binding.kind).toBe('UPDATE_EXISTING_CATALOG');
    expect(result.binding.currentDestinationKey).toBeNull();
    expect(result.expectedReadback.identity.name).toBe('Málaga');
    expect(result.simulatedReadback.identity.name).toBe('Málaga');
    for (const count of Object.values(result.coverage) as Array<{authored:number;readback:number}>) expect(count.readback).toBe(count.authored);
    const rows = result.simulatedReadback.lifestyleFeatures;
    expect(rows).toHaveLength(14);
    expect(new Set(rows.map((r: {featureKey:string})=>r.featureKey)).size).toBe(14);
    expect(result.plan.moduleExecutionOperations.filter((o: {module:string})=>o.module==='lifestyleFeatures')).toHaveLength(1);
    expect(result.simulatedReadback.neighborhoods).toHaveLength(9);
    expect(result.simulatedReadback.places).toHaveLength(32);
    expect(result.simulatedReadback.sources).toHaveLength(71);
    expect(result.simulatedReadback.facts).toHaveLength(63);
    expect(result.simulatedReadback.climateMonthly).toHaveLength(12);
    expect(result.simulatedReadback.media).toHaveLength(3);
    expect(result.simulatedReadback.visaResidency).toHaveLength(3);
    // A wholly blank optional singleton has no content to write. No authored nonblank fields are omitted.
    expect(result.canonicalDifferences).toEqual({environmentQuality:{canonical:{qualityNotes:null,summary:null},actual:null}});
    for (const statement of [...result.catalogStatements, ...result.statements]) {
      expect(statement.text).not.toMatch(/insert into public\.destinations_catalog/);
      expect(statement.text).not.toMatch(/set\s+status|status\s*=/i);
      expect(statement.values).toContain('66f27e80-a7bf-4e60-b2e1-47c28d9e4a0b');
    }
  });
});
