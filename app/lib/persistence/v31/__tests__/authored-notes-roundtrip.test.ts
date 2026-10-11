import {expect,it} from 'vitest';
import {loadFrozenWorkbookV31DeterministicImport} from '../../../workbook-v31-deterministic-core';
import {mapCanonicalDestinationToStoredState} from '../map-canonical-destination-to-stored-state';
import {projectCanonicalComparable,projectStoredComparable} from '../comparable-projection';
import {buildDestinationPlan} from '../plan-destination';
import {interpretOperationManifest} from '../manifest';
import {buildDestinationPlanWriteStatements} from '../write-port';
import {createSupabasePersistedDestinationReadPort} from '../supabase-persisted-destination-read-port';
import type {PersistedReplaceModulesRows, PersistedKeyedChildrenRows} from '../normalize-persisted-destination-rows';
import type {DestinationId} from '../types';

it.each(['Budget: housing shared; insurance excluded.\n€ / USD — assumptions', '', null])('preserves authored notes through SQL and readback: %s', async text=>{
 const parsed=await loadFrozenWorkbookV31DeterministicImport('data/legacy-malaga-01/DestinationFinderAI-Malaga-Premium-Owner-Review-v3-v3.3.xlsx');
 expect(parsed.validationErrors).toEqual([]);
 const base=parsed.canonicalDestinations![0];
 const canonical={...base,costOfLiving:[{...base.costOfLiving[0],included_notes:text}],safetyRisks:[{...base.safetyRisks[0],mitigation_notes:text}],sources:[{...base.sources[0],notes:text}]};
 const full=mapCanonicalDestinationToStoredState(canonical);
 const identity={destinationKey:full.identity.destinationKey,destinationId:'66f27e80-a7bf-4e60-b2e1-47c28d9e4a0b' as DestinationId};
 const manifest=interpretOperationManifest({manifest:{entries:[{destinationKey:identity.destinationKey,operation:'REPLACE_MODULE',targetModule:'costOfLiving',reason:'offline test'},{destinationKey:identity.destinationKey,operation:'REPLACE_MODULE',targetModule:'safetyRisks',reason:'offline test'}]},canonicalDestinations:[{...canonical,identity:{...canonical.identity,destinationKey:identity.destinationKey}}],approvedScope:[identity]});
 expect(manifest.valid).toBe(true);
 const plan=buildDestinationPlan({resolvedDestinationIdentity:identity,canonicalDestination:canonical,storedDestinationState:{...full,costOfLiving:[],safetyRisks:[],sources:[]},manifestInterpretation:manifest,approvedScope:[identity],diffPolicy:{updateMode:'MERGE_NONBLANK',normalizationVersion:'v31-normalize-1',diffPolicyVersion:'v31-diff-1'}});
 expect(plan.errors).toEqual([]);
 const tables:Record<string,Record<string,unknown>[]>={};
 for(const s of buildDestinationPlanWriteStatements(plan)){const m=s.text.match(/^insert into public\.(\w+) \(([^)]+)\) values/);if(m)(tables[m[1]]??=[]).push(Object.fromEntries(m[2].split(', ').map((c,i)=>[c,s.values[i]])));}
 expect(tables.premium_cost_of_living[0].included_notes).toBe(text);
 expect(tables.premium_safety_risks[0].metadata).toEqual({mitigation_notes:text});
 expect(tables.premium_sources[0].notes).toBe(text);
 const port=createSupabasePersistedDestinationReadPort({async selectRows(args){return tables[args.table]??[];}});
 const replace=await port.readReplaceModules(identity),keyed=await port.readKeyedChildren(identity);
 if(!replace.ok||!keyed.ok)throw Error('read failed');
 const strip=<T extends {destinationId:string;destinationKey:string}>(rows:readonly T[])=>rows.map(({destinationId,destinationKey,...row})=>row);
 const restored={...full,costOfLiving:strip((replace.value as PersistedReplaceModulesRows).costOfLiving),safetyRisks:strip((replace.value as PersistedReplaceModulesRows).safetyRisks),sources:strip((keyed.value as PersistedKeyedChildrenRows).sources)} as unknown as typeof full;
 for(const module of ['costOfLiving','safetyRisks','sources'] as const){
  expect(projectStoredComparable(restored)[module]).toEqual(projectCanonicalComparable(canonical)[module]);
  expect(plan.expectedComparablePostState[module]).toEqual(projectCanonicalComparable(canonical)[module]);
 }
 expect(restored.costOfLiving[0].includedNotes).toBe(text);
 expect(restored.safetyRisks[0].mitigationNotes).toBe(text);
 expect(restored.sources[0].notes).toBe(text);
 const changed={...restored,costOfLiving:restored.costOfLiving.map(r=>({...r,includedNotes:'CHANGED'})),safetyRisks:restored.safetyRisks.map(r=>({...r,mitigationNotes:'CHANGED'})),sources:restored.sources.map(r=>({...r,notes:'CHANGED'}))};
 for(const module of ['costOfLiving','safetyRisks','sources'] as const)expect(projectStoredComparable(changed)[module]).not.toEqual(projectCanonicalComparable(canonical)[module]);
 expect(full.visaResidency).toEqual(mapCanonicalDestinationToStoredState(base).visaResidency);
 expect(full.media).toEqual(mapCanonicalDestinationToStoredState(base).media);
});
