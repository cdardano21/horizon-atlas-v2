// @vitest-environment node
import {afterEach,expect,it,vi} from 'vitest';
import {readFileSync} from 'node:fs';
import {loadPublishedSmartShortlistProjection} from './projection';
vi.mock('../supabase',()=>({isSupabaseConfigured:()=>true,getSupabaseConfig:()=>({url:'https://catalog.invalid'}),getSupabaseAuthHeaders:()=>({})}));
const rows=[
 {id:'8d99ae1f-7ea9-4dde-92ee-5ecf38adfb49',slug:'bangkok-thailand',status:'review'},
 {id:'046a0f55-af9c-46c1-b524-1924b2c18333',slug:'barcelona-spain',status:'published'},
 {id:'7c8911cb-47a7-4a33-b16a-6b9bacc80c77',slug:'san-miguel-de-allende-mexico',status:'published'},
 {id:'81199a76-d49c-4a18-bf57-6acb064e9020',slug:'atenas-costa-rica',status:'published'},
];
afterEach(()=>{vi.unstubAllGlobals();vi.unstubAllEnvs();});
it('contains all four pinned inputs but excludes unbound identities before import',async()=>{
 const projection=JSON.parse(readFileSync('data/generated-smart-shortlist-projection.json','utf8'));
 expect(projection.data.candidates).toHaveLength(250);
 for(const row of rows)expect(projection.data.candidates.filter((x:{key:string})=>x.key===row.slug)).toHaveLength(1);
 vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(JSON.stringify(rows.map(row=>({...row,destination_key:null}))))));
 expect((await loadPublishedSmartShortlistProjection()).candidates).toEqual([]);
});
it('preserves Review exclusion after exact-ID key binding and admits only the three Published identities',async()=>{
 vi.stubEnv('NODE_ENV','production');
 vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(JSON.stringify(rows.map(row=>({...row,destination_key:row.slug}))))));
 const data=await loadPublishedSmartShortlistProjection();
 expect(data.candidates.map(row=>row.key).sort()).toEqual(rows.filter(row=>row.status==='published').map(row=>row.slug).sort());
 expect(data.intelligence.some(row=>row.key==='bangkok-thailand')).toBe(false);
 expect(data.destinationMedia.some(row=>row.key==='bangkok-thailand')).toBe(false);
 expect(data.affordabilityRecords.some(row=>row.destinationKey==='bangkok-thailand')).toBe(false);
});
