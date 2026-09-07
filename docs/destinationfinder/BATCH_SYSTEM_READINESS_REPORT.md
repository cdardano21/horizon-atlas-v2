# DestinationFinder Permanent Batch System Readiness Report

**Assessment date:** 2026-09-07<br>
**Mode:** documentation and read-only validation only<br>
**Reference workbook:** `data/next-batch-20/DestinationFinderAI-Next-Batch-20-Visual-Parity-Enriched-v3.3.xlsx`<br>
**Reference SHA-256:** `88f365b1dabfef7a3bbeb2958f53e9c3537d1f8f8b74e6cf6083482ddb802683`

## 39 versus 48: authoritative resolution

1. **Why did 39 versus 48 appear?** The authorized workbook's canonical order places `IMPORT_CONTRACT` at worksheet 39. An earlier inspection/report stopped there and incorrectly described 39 as the total. The nine omitted physical sheets are `WORKBOOK_METADATA`, `IMPORT_MANIFEST`, `DESTINATION_ALIASES`, `VALIDATION_RULES`, `DATA_DICTIONARY`, `ENVIRONMENT_QUALITY`, `DAILY_LIFE_PRACTICALITY`, `EVENTS_SEASONALITY`, and `LIFESTYLE_FEATURES`. No repository contract or acceptance test defines a 39-sheet v3.3 workbook.
2. **Is 39 the current workbook count?** No. Direct XLSX inspection returns 48 worksheet names.
3. **What does 48 mean?** It is the complete current v3.3 physical authoring template, not an older or merely logical-module count. The workbook's own `WORKBOOK_METADATA.validation_sheet_count` is `48`, and the Next-20 acceptance test pins `sheetCount: 48`.
4. **What must future workbooks contain?** All 48 sheets in the canonical order with the exact headers in `batch-contract-v3.3.json`. The deterministic parser checks a narrower ten-sheet structural subset for backward compatibility; that minimum does not define authoring completeness. `SCHEMA_INDEX` and `DATA_DICTIONARY` contain 24 and 30 entries respectively and are partial documentation registries, not exhaustive sheet manifests.
5. **What number must be enforced?** The permanent authoring playbook and validator enforce **48**. The parser continues to enforce its existing **10-sheet** compatibility minimum. **39 must not be used.**

## Delivered system

- `AUTHORING_DATA_REQUIREMENTS.md`: exact field-level research contract
- `BATCH_AUTHORING_AND_IMPORT_PLAYBOOK.md`: phases A-G and authorization gates
- `BATCH_OPERATOR_CHECKLIST.md`: operator sign-offs and stop conditions
- `batch-contract-v3.3.json`: exact 48-sheet order, headers, enums, U3-R5 and climate rules
- `WORKBOOK_TEMPLATE_INSTRUCTIONS.md`: safe copy-and-sanitize template method
- `FUTURE_BATCH_AUTHORING_PROMPT.md`: self-contained authoring prompt
- `FUTURE_BATCH_IMPORT_PROMPT.md`: phase-bounded import prompt
- `VISUAL_QA_CHECKLIST.md`: Premium Guide and Smart Shortlist QA
- `scripts/validate_destination_batch.ts`: read-only validator
- `scripts/validate_destination_batch.test.ts`: focused validator tests
- `package.json`: `validate:destination-batch` command

## Current Next-20 validation

Command:

```bash
npm run --silent validate:destination-batch -- \
  --workbook data/next-batch-20/DestinationFinderAI-Next-Batch-20-Visual-Parity-Enriched-v3.3.xlsx \
  --registry-id next-batch-20-private-import-authorized \
  --json
```

Result:

| Check | Result |
|---|---|
| Physical sheets | 48/48 |
| Exact sheet order and headers | PASS |
| Schema metadata | PASS |
| Climate formulas | 960/960 with numeric cached values |
| Deterministic parser | PASS |
| Registry SHA-256 | PASS |
| Registry/manifest/parsed keys | PASS, 20/20 |
| U3-R5 row structure and numeric ranges | PASS, 40/40 rows |
| Blocking errors | 0 |
| Population/provenance | PASS, 20/20 and 20/20 |
| Lifestyle parity | PASS, 312 rows; 14-18 per destination |
| Customer-copy blocking terms | PASS, 0 |
| Authoring parity | PASS |
| Authoring readiness | AUTHORING_COMPLETE |

The readiness result is intentionally separate from integrity. UNKNOWN and evidence-quality warnings remain reviewable rather than being coerced into known values. Exact duplicate evidence summaries in Valencia and Kanazawa are flagged for non-blocking filler review.

- 20 destinations have U3-R5 planning-estimate rows intentionally marked unverified.
- Each destination has one or more unresolved decision facts. Aggregate counts are: `foreignPropertyPurchaseAllowed` 20, `remoteWorkLegalUnderTouristStatus` 20, `retirementVisaProgramAvailable` 20, `mountainOrSkiAccess` 18, `remoteWorkOrDigitalNomadVisaAvailable` 16, `spouseOrDependentInclusionSupported` 16, `healthcareStandard` 12, `beachAccess` 7, and `lgbtqLegalProtectionStatus` 1.

These warnings are preserved rather than converted to passing values. They do not negate the previously authorized controlled import, but the stricter permanent authoring standard requires explicit warning disposition before a future batch is called authoring-ready.

## Fresh-agent simulation

A new read-only Explore agent was given only the permanent artifacts and relevant code references, with no conversation history. It independently:

- identified 48 as the full authoring contract and 10 as the parser compatibility minimum;
- rejected 39 as a contract number;
- recovered the copy-and-sanitize template method;
- produced the correct registered and unregistered validator commands;
- distinguished structural validity, authoring readiness, dry run, write approval, read-back, and visual QA;
- found no missing external context required for authoring or read-only preflight;
- returned **PASS** and performed no edits, imports, database operations, deployments, pushes, or commits.

## Validation evidence

- Contract-to-workbook comparison: 48-sheet order matched; 46 tabular header sets matched; `README` and title-based `IMPORT_CONTRACT` were handled as nonstandard/reference sheets.
- Focused validator tests: 2/2 passed.
- Validator plus Next-20 acceptance suite: 12/12 passed.
- Markdown/JSON/TypeScript editor diagnostics: no errors at the point of focused validation.

## Final verdict

**YES: the permanent batch system prevents a schema-valid workbook from reaching AUTHORING COMPLETE when population/provenance is missing, lifestyle content is materially thin, or clearly internal pipeline language appears in customer-visible copy.**

This YES does not authorize import or publication. A particular future workbook must independently pass the 48-sheet contract, deterministic parser, key/hash/manifest/affordability checks, authoring parity, warning review, dry-run planning, explicit write approval, normalized read-back, and visual QA.

No workbook was imported. No database was read or written. No deployment, push, or commit was performed.
