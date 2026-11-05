import {expect,it} from 'vitest';
import {loadFrozenWorkbookV31DeterministicImport} from '../../../workbook-v31-deterministic-core';
import {mapCanonicalDestinationToStoredState} from '../map-canonical-destination-to-stored-state';
import {buildDestinationPlan} from '../plan-destination';
import {interpretOperationManifest} from '../manifest';
import {reduceChildExecutionOperation} from '../reduce-child-execution-operation';
import {buildDestinationPlanWriteStatements} from '../write-port';
import {projectStoredComparable,projectCanonicalComparable} from '../comparable-projection';
import {createSupabasePersistedDestinationReadPort} from '../supabase-persisted-destination-read-port';
import type {DestinationId} from '../types';
const fixture='data/legacy-malaga-01/DestinationFinderAI-Malaga-Premium-Owner-Review-v3-v3.3.xlsx';
async function setup(){
 const c=(await loadFrozenWorkbookV31DeterministicImport(fixture)).canonicalDestinations![0];
 const full=mapCanonicalDestinationToStoredState(c),empty={...full,media:[]};
 const identity={destinationKey:full.identity.destinationKey,destinationId:'66f27e80-a7bf-4e60-b2e1-47c28d9e4a0b' as DestinationId};
 const interpretation=interpretOperationManifest({manifest:{entries:[]},canonicalDestinations:[{...c,identity:{...c.identity,destinationKey:identity.destinationKey}}],approvedScope:[identity]});
 const plan=buildDestinationPlan({resolvedDestinationIdentity:identity,canonicalDestination:c,storedDestinationState:empty,manifestInterpretation:interpretation,approvedScope:[identity],diffPolicy:{updateMode:'MERGE_NONBLANK',normalizationVersion:'v31-normalize-1',diffPolicyVersion:'v31-diff-1'}});
 return {c,full,empty,identity,plan,operations:plan.childOperations.filter(o=>o.module==='media')};
}
it('reduces actual canonical snake-case media operations without losing key, order or provenance',async()=>{
 const {c,empty,operations}=await setup();let state=empty;expect(operations).toHaveLength(3);
 for(const operation of operations){const result=reduceChildExecutionOperation(state,operation);expect(result.outcome).toBe('APPLIED');state=result.resultingState as typeof state;}
 expect(projectStoredComparable(state).media).toEqual(projectCanonicalComparable(c).media);
 for(const operation of operations)expect(reduceChildExecutionOperation(state,operation).outcome).toBe('ALREADY_APPLIED');
 const changed=structuredClone(operations[0]) as any;changed.incomingChild.image_url='https://example.invalid/changed.jpg';expect(reduceChildExecutionOperation(state,changed).outcome).toBe('FAILED');
 expect(reduceChildExecutionOperation({...state,media:[...state.media,state.media[0]]},operations[0]).outcome).toBe('FAILED');
});
it('keeps the existing SQL writer and persisted media reader exact for the same canonical operations',async()=>{
 const {c,full,identity,plan}=await setup();const rows=buildDestinationPlanWriteStatements(plan).filter(s=>s.text.startsWith('insert into public.premium_media ')).map(s=>Object.fromEntries(s.text.match(/\(([^)]+)\) values/)![1].split(', ').map((k,i)=>[k,s.values[i]])));
 expect(rows).toHaveLength(3);const port=createSupabasePersistedDestinationReadPort({async selectRows(args){return args.table==='premium_media'?rows:[]}});const read=await port.readKeyedChildren(identity);expect(read.ok).toBe(true);if(!read.ok)throw Error('readback');const media=(read.value as any).media.map(({destinationId,destinationKey,...r}:any)=>r);
 expect(projectStoredComparable({...full,media}).media).toEqual(projectCanonicalComparable(c).media);
});
