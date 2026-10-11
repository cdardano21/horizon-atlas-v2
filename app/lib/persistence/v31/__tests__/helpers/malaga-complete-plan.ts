// Offline regression helper: repository-owned inputs, no network or database writes.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {loadFrozenWorkbookV31DeterministicImport} from '../../../../workbook-v31-deterministic-core';
import {mapCanonicalDestinationToStoredState} from '../../map-canonical-destination-to-stored-state';
import {buildFirstTimeModuleAuthorizationManifest} from '../../first-time-module-authorization';
import {interpretOperationManifest} from '../../manifest';
import {buildDestinationPlan} from '../../plan-destination';
import {buildDestinationPlanWriteStatements} from '../../write-port';
import {createSupabasePersistedDestinationReadPort} from '../../supabase-persisted-destination-read-port';
import {loadNormalizedPersistedDestinationBundle} from '../../load-normalized-persisted-destination-bundle';
import {materializeStoredDestinationStateFromNormalizedPersistedBundle} from '../../materialize-stored-destination-state';
import {projectStoredComparable, projectCanonicalComparable, type ComparableProjection} from '../../comparable-projection';
import {planCatalogWriteOperation, buildCatalogWriteStatements} from '../../catalog-write-contract';
import fixture from "./malaga-complete-plan.fixture.json";
import type { DestinationId, OperationManifest, ModulePresenceOperation } from "../../types";


export async function buildMalagaCompletePlanFixture(): Promise<any> {
const snapshot=fixture.snapshot;
assert.equal(snapshot.catalog.length,1); const catalog=snapshot.catalog[0];
assert.equal(catalog.id,'66f27e80-a7bf-4e60-b2e1-47c28d9e4a0b');assert.equal(catalog.slug,'malaga-spain');assert.equal(catalog.status,'published');assert.equal(catalog.destination_key,null);
assert(Object.values(snapshot.modules).every((rows:any)=>rows.length===0),'Existing premium rows require separate reconciliation');
const entry=fixture.entry;
assert.equal(createHash('sha256').update(fs.readFileSync(entry.workbookPath)).digest('hex'),entry.expectedSha256);
const parsed=await loadFrozenWorkbookV31DeterministicImport(entry.workbookPath);assert.deepEqual(parsed.validationErrors,[]);
const canonical=parsed.canonicalDestinations![0];const full=mapCanonicalDestinationToStoredState(canonical);
const identity={destinationKey:full.identity.destinationKey,destinationId:catalog.id as DestinationId};
const empty:any={...full,identity:{destinationKey:identity.destinationKey,slug:catalog.slug,name:null,city:catalog.city,country:catalog.country},editorial:{shortDescription:null,longDescription:null,currency:null,primaryLanguage:null,timeZone:null},environmentQuality:null,dailyLifePracticality:null};
for(const [k,v] of Object.entries(full)) if(Array.isArray(v))empty[k]=[];
const supplement: OperationManifest = { entries: fixture.supplement.entries.map(entry => {
  assert.equal(entry.destinationKey, identity.destinationKey);
  assert.equal(entry.operation, 'REPLACE_MODULE');
  assert.equal(entry.targetModule, 'lifestyleFeatures');
  return { ...entry, destinationKey: identity.destinationKey, operation: 'REPLACE_MODULE', targetModule: 'lifestyleFeatures' };
}) };
const manifest={entries:[...buildFirstTimeModuleAuthorizationManifest(identity.destinationKey,canonical,empty).entries,...supplement.entries]};
assert.equal(new Set(manifest.entries.map(e=>e.targetModule)).size,manifest.entries.length);
const interpretation=interpretOperationManifest({manifest,canonicalDestinations:[{...canonical,identity:{...canonical.identity,destinationKey:identity.destinationKey}}],approvedScope:[identity]});assert.equal(interpretation.valid,true);
const corePlan=buildDestinationPlan({resolvedDestinationIdentity:identity,canonicalDestination:canonical,storedDestinationState:empty,manifestInterpretation:interpretation,approvedScope:[identity],diffPolicy:{updateMode:'MERGE_NONBLANK',normalizationVersion:'v31-normalize-1',diffPolicyVersion:'v31-diff-1'}});assert.deepEqual(corePlan.errors,[]);
const prepared=fixture.prepared;
const plan={...corePlan,modulePresenceOperations:prepared.modulePresenceOperations as ModulePresenceOperation[]};
const binding=planCatalogWriteOperation({kind:'EXISTING',resolvedDestinationIdentity:identity,canonicalDestination:canonical,current:{destinationKey:null,beachAccess:catalog.beach_access,mountainOrSkiAccess:catalog.mountain_or_ski_access,countryCode:catalog.country_code}})!;
const statements=buildDestinationPlanWriteStatements(plan);
const tables:Record<string,any[]>={destinations_catalog:[{...catalog,destination_key:identity.destinationKey,beach_access:binding.beachAccess,mountain_or_ski_access:binding.mountainOrSkiAccess,country_code:binding.countryCode}]};
// Test double only: represent the exact generated INSERT parameters as rows returned by PostgreSQL.
for(const s of statements){
 if(s.text.startsWith('delete from '))continue;
 const update=s.text.match(/^update public\.(\w+) set (\w+) = \$3/);
 if(update){assert.equal(s.values[0],identity.destinationId);assert.equal(s.values[1],identity.destinationKey);tables[update[1]][0][update[2]]=s.values[2];continue;}
 const match=s.text.match(/^insert into public\.(\w+) \(([^)]+)\) values/);assert(match,'Unexpected statement: '+s.text);
 const cols=match[2].split(', '); const row:any=Object.fromEntries(cols.map((c,i)=>[c,s.values[i]]));
 for(const c of ['is_primary','verified','private_care_available','public_transit_available','nonstop_us_service'])if(row[c]!=null&&['0','1','false','true'].includes(String(row[c])))row[c]=['1','true'].includes(String(row[c]));
 if(row.sort_order!=null)row.sort_order=Number(row.sort_order);
 const conflict=s.text.match(/on conflict \(([^)]+)\)/); const keys=conflict?.[1].split(', ')??[];
 const list=tables[match[1]]??=[]; const prior=keys.length?list.find(r=>keys.every(k=>r[k]===row[k])):null;
 if(prior)Object.assign(prior,row);else list.push(row);
}
const port=createSupabasePersistedDestinationReadPort({async selectRows(args){return tables[args.table]??[];}});
const read=await loadNormalizedPersistedDestinationBundle(identity,port);
assert.equal(read.outcome,'SUCCESS',JSON.stringify(read));
if(read.outcome!=='SUCCESS')throw Error('Readback failed');
const stored=materializeStoredDestinationStateFromNormalizedPersistedBundle(read.bundle);
const actual=projectStoredComparable(stored);
const expected: ComparableProjection={...plan.expectedComparablePostState,identity:{...(plan.expectedComparablePostState.identity as object),beachAccess:binding.beachAccess,mountainOrSkiAccess:binding.mountainOrSkiAccess,countryCode:binding.countryCode}};
const differences=Object.keys(expected).filter(k=>{try{assert.deepEqual(actual[k],expected[k]);return false}catch{return true}});
const coverage=Object.fromEntries(Object.entries(full).filter(([k,v])=>Array.isArray(v)).map(([k,v])=>[k,{authored:(v as any[]).length,readback:(stored as any)[k]?.length}]));
const canonicalExpected=projectCanonicalComparable(canonical);
const canonicalDifferences=Object.keys(canonicalExpected).filter(k=>{try{assert.deepEqual(actual[k],canonicalExpected[k]);return false}catch{return true}});
const report={canonicalDifferences:Object.fromEntries(canonicalDifferences.map(k=>[k,{canonical:canonicalExpected[k],actual:actual[k]}])),catalogStatements:buildCatalogWriteStatements(binding),databaseWrites:0,readbackMode:'Generated SQL parameter rows through production persisted reader; no database execution',snapshotCreatedAt:snapshot.createdAt,scope:identity,statusBefore:catalog.status,statusAfter:tables.destinations_catalog[0].status,manifest,plan,binding,statements,expectedReadback:expected,simulatedReadback:actual,coverage,differences: Object.fromEntries(differences.map(k=>[k,{expected:expected[k],actual:actual[k]}]))};


assert.deepEqual(differences,[],'Exact full readback mismatch');
assert(Object.values(coverage).every((c:any)=>c.authored===c.readback),'Authored record count mismatch');
assert.equal(stored.lifestyleFeatures.length,14);

return report;
}
