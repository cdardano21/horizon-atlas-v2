import {expect,it} from 'vitest';
import {loadFrozenWorkbookV31DeterministicImport} from '../../../workbook-v31-deterministic-core';
import {mapCanonicalDestinationToStoredState} from '../map-canonical-destination-to-stored-state';
import {buildFirstTimeModuleAuthorizationManifest} from '../first-time-module-authorization';
import {buildDestinationPlan} from '../plan-destination';
import {interpretOperationManifest} from '../manifest';
import {buildDestinationPlanWriteStatements} from '../write-port';
import {createSupabasePersistedDestinationReadPort} from '../supabase-persisted-destination-read-port';
import {projectCanonicalComparable,projectStoredComparable} from '../comparable-projection';
import type {DestinationId} from '../types';
const workbook='data/east-asia-oceania-daejeon-south-korea-01/DestinationFinderAI-daejeon-south-korea-Premium-Candidate-v3.3.xlsx';
it('authorizes only empty lifestyle storage and roundtrips all 14 authored rows through SQL and reader',async()=>{
 const canonical=(await loadFrozenWorkbookV31DeterministicImport(workbook)).canonicalDestinations[0];
 const full=mapCanonicalDestinationToStoredState(canonical);const empty={...full,lifestyleFeatures:[]};
 const identity={destinationKey:full.identity.destinationKey,destinationId:'00000000-0000-4000-8000-000000000001' as DestinationId};
 const m=buildFirstTimeModuleAuthorizationManifest(identity.destinationKey,canonical,empty);
 expect(m.entries.filter((e:any)=>e.targetModule==='lifestyleFeatures')).toHaveLength(1);
 expect(buildFirstTimeModuleAuthorizationManifest(identity.destinationKey,canonical,full).entries).toEqual([]);
 expect(buildFirstTimeModuleAuthorizationManifest(identity.destinationKey,{...canonical,lifestyleFeatures:[]},empty).entries).toEqual([]);
 const interpretation=interpretOperationManifest({manifest:m,canonicalDestinations:[{...canonical,identity:{...canonical.identity,destinationKey:identity.destinationKey}}],approvedScope:[identity]});
 const plan=buildDestinationPlan({resolvedDestinationIdentity:identity,canonicalDestination:canonical,storedDestinationState:empty,manifestInterpretation:interpretation,approvedScope:[identity],diffPolicy:{updateMode:'MERGE_NONBLANK',normalizationVersion:'v31-normalize-1',diffPolicyVersion:'v31-diff-1'}});
 expect(plan.errors).toEqual([]);
 const sql=buildDestinationPlanWriteStatements(plan).filter(x=>x.text.startsWith('insert into public.premium_lifestyle_features '));expect(sql).toHaveLength(14);
 const rows=sql.map(s=>Object.fromEntries(s.text.match(/\(([^)]+)\) values/)![1].split(', ').map((c,i)=>[c,s.values[i]])));
 expect(rows.every(r=>r.destination_id===identity.destinationId&&r.destination_key===identity.destinationKey)).toBe(true);
 const port=createSupabasePersistedDestinationReadPort({async selectRows(args){return args.table==='premium_lifestyle_features'?rows:[]}});
 const read=await port.readReplaceModules(identity);expect(read.ok).toBe(true);if(!read.ok)throw Error('read failure');
 const restored={...full,lifestyleFeatures:(read.value as any).lifestyleFeatures.map(({destinationId,destinationKey,...r}:any)=>r)};
 expect(restored.lifestyleFeatures).toHaveLength(14);
 expect(projectStoredComparable(restored).lifestyleFeatures).toEqual(projectCanonicalComparable(canonical).lifestyleFeatures);
 expect(projectStoredComparable({...restored,lifestyleFeatures:restored.lifestyleFeatures.slice(1)}).lifestyleFeatures).not.toEqual(projectCanonicalComparable(canonical).lifestyleFeatures);
});
it('normalizes only empty environment fields; missing nonempty content still fails parity',async()=>{
 const base=(await loadFrozenWorkbookV31DeterministicImport(workbook)).canonicalDestinations[0];const full=mapCanonicalDestinationToStoredState(base);
 expect(projectCanonicalComparable(base).environmentQuality).toBeNull();
 expect(projectStoredComparable({...full,environmentQuality:null}).environmentQuality).toBeNull();
 expect(projectStoredComparable({...full,environmentQuality:{summary:' ',qualityNotes:null}}).environmentQuality).toBeNull();
 for(const [air,water] of [['Measured air evidence',null],[null,'Water evidence'],['A','B']]){
  const c={...base,environmentQuality:{...base.environmentQuality,air_quality_summary:air,water_quality_summary:water}};
  const s={...full,environmentQuality:{summary:air,qualityNotes:water}};
  expect(projectCanonicalComparable(c).environmentQuality).toEqual(projectStoredComparable(s).environmentQuality);
  expect(projectCanonicalComparable(c).environmentQuality).not.toEqual(projectStoredComparable({...s,environmentQuality:null}).environmentQuality);
 }
});
