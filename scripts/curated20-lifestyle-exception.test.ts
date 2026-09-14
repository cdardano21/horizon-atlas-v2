import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import contract from '../docs/destinationfinder/batch-contract-v3.3.json';
import { validateAuthoringParity } from './validate_destination_batch';
const input = JSON.parse(execFileSync('python3', ['-c', `
import openpyxl,json
w=openpyxl.load_workbook('data/curated-mixed-batch-20-01/DestinationFinderAI-Curated-Mixed-Batch-20-01-PREMIUM-REPAIRED-v2-v3.3.xlsx')
def rows(n):
 r=list(w[n].values);return [dict(zip(r[0],x)) for x in r[1:] if x[0]]
ds=rows('DESTINATIONS')
print(json.dumps(dict(destinationRows=[dict(destinationKey=r['destination_key'],population=r['population']) for r in ds],sourceRows=[dict(destinationKey=r['destination_key'],sourceKey=r['source_key'],sourceName=r['source_name'],sourceUrl=r['source_url'],sourceType=r.get('source_type') or '',notes=r.get('notes') or '') for r in rows('SOURCES')],lifestyleRows=[dict(recordKey=r['record_key'],destinationKey=r['destination_key'],featureKey=r['feature_key'],displayName=r['display_name'],displayOrder=r['display_order'],evidenceSummary=r['evidence_summary'],sourceUrl=r['source_url']) for r in rows('LIFESTYLE_FEATURES')],customerCopyCells=[dict(sheet='DESTINATIONS',field=f,row=i+2,destinationKey=r['destination_key'],value=r[f]) for i,r in enumerate(ds) for f in ['short_description','long_description']]),ensure_ascii=False))
`], {encoding:'utf8'}));
const keys = input.destinationRows.map((r: {destinationKey:string}) => r.destinationKey);
const context = {batchId:'curated-mixed-batch-20-01',parserAndAdapterClean:true};
function run(value = structuredClone(input), ctx = context) { return validateAuthoringParity(value, keys, contract.authoringParity, ctx).errors; }
describe('Batch 20-01 reviewed lifestyle composition', () => {
  it('accepts the exact 20-destination preserved 13-row composition', () => expect(run()).toEqual([]));
  it('rejects 12 rows', () => {const x=structuredClone(input);x.lifestyleRows.shift();expect(run(x).join()).toContain('TOO_THIN');});
  for (const key of ['unsupported','signature_lifestyle','walkability']) {
    it(`rejects invalid or duplicate key ${key}`, () => {const x=structuredClone(input);x.lifestyleRows[0].featureKey=key;expect(run(x).length).toBeGreaterThan(0);});
  }
  it('retains ordinary 13-row rejection', () => expect(run(undefined,{...context,batchId:'another-batch'}).join()).toContain('TOO_THIN'));
  it('retains the ordinary 14-row standard', () => {const x=structuredClone(input);for(const key of keys)x.lifestyleRows.push({recordKey:key+'-extra',destinationKey:key,featureKey:'airport_access',displayName:'Airport access',displayOrder:14,evidenceSummary:'Distinct airport evidence for '+key,sourceUrl:'https://example.gov/airport'});expect(run(x,{...context,batchId:'another-batch'})).toEqual([]);});
  it('rejects lost signature prose', () => {const x=structuredClone(input);x.customerCopyCells[0].value='Missing synthesis';expect(run(x).join()).toContain('TOO_THIN');});
  it('rejects parser/adapter failure', () => expect(run(undefined,{...context,parserAndAdapterClean:false}).join()).toContain('TOO_THIN'));
  it('rejects deleted or altered reviewed evidence', () => {const x=structuredClone(input);x.lifestyleRows[0].evidenceSummary='Altered';expect(run(x).join()).toContain('TOO_THIN');});
  it('rejects incomplete batch scope', () => {const x=structuredClone(input);x.destinationRows.pop();expect(run(x).join()).toContain('TOO_THIN');});
});
