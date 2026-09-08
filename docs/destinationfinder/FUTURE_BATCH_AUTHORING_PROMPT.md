# Future Destination Batch Authoring Prompt

Use this prompt with a fresh coding/research agent. Replace bracketed values before starting.

```text
You are authoring a new DestinationFinderAI v3.3 destination batch in the existing repository.

BATCH
- Batch ID: [BATCH_ID]
- Approved destination keys: [EXACT_COMMA_SEPARATED_KEYS]
- Candidate workbook output path: [NEW_XLSX_PATH]
- Research cutoff/as-of date: [YYYY-MM-DD]
- Intended environment: [preview/private/etc.]

READ FIRST, IN THIS ORDER
1. docs/destinationfinder/AUTHORING_DATA_REQUIREMENTS.md
2. docs/destinationfinder/batch-contract-v3.3.json
3. docs/destinationfinder/WORKBOOK_TEMPLATE_INSTRUCTIONS.md
4. docs/destinationfinder/BATCH_AUTHORING_AND_IMPORT_PLAYBOOK.md

NON-NEGOTIABLE CONTRACT
- The complete v3.3 authoring workbook has exactly 48 sheets in the contract's canonical order. The parser's ten-sheet minimum is compatibility behavior, not the authoring template.
- Start from a verified copy of the authorized reference. Never overwrite any existing workbook.
- Use exact destination_key identity and stable child keys. Never fuzzy-match or copy content across destinations.
- Research every destination independently. Populate only evidence-supported values.
- Preserve UNKNOWN honestly. Do not turn missing evidence into No, NONE, zero, low risk, legal, available, or a passing gate.
- Use official/primary sources for legal, visa, tax, property, healthcare, and other decision-critical claims whenever available.
- Preserve source URL/name, verification, date, confidence, media credit/license, and research-ledger evidence.
- Preserve every useful authored resource/media row in the workbook even when the current UI uses an initial display cap or disclosure control; never truncate source data to match presentation.
- Create exactly one valid single and one valid couple U3-R5 2026 USD row per destination using the current `comfortable` / `u3_r5_total_monthly_estimate` / `RELOCATE` tokens.
- Do not invent DESTINATION_SCORES without an approved 0-100 methodology.
- SCHEMA-VALID IS NOT AUTHORING-COMPLETE. Every destination requires a positive numeric population with destination-scoped credible provenance and targets at least 14 useful, evidence-backed, sourced `LIFESTYLE_FEATURES` rows across multiple locally meaningful themes.
- `metro_population` and `elevation_m` are optional: author them only when meaningful and supported, never as guesses or copied regional values.
- Do not force irrelevant lifestyle topics to reach 14. Explicitly document and request human review for a legitimate exception; duplicated/generic filler is a failure.
- Customer-visible copy must describe the destination, never the parser, adapter, workbook, schema, engine, runtime, hard gates, preference fit, normalization, database, import, or internal table/field names.
- Preserve/rebind climate formulas and recalculate cached values.
- Do not edit application code to accommodate a destination. Do not import, write to a database, deploy, push, or commit.

WORK
1. Freeze source inventory and identity conflicts.
2. Create the candidate workbook with the safe template procedure.
3. Complete the field-level and minimum-count requirements for every destination.
4. Reconcile manifest counts, formulas, keys, provenance, media, and UNKNOWNs.
5. Compute SHA-256.
6. Run the read-only validator:
   npm run --silent validate:destination-batch -- --workbook [NEW_XLSX_PATH] --expected-keys [EXACT_COMMA_SEPARATED_KEYS] --json
7. Fix only evidence-supported workbook defects, save a new candidate/hash, and rerun.

FINAL REPORT
- Exact workbook path and SHA-256
- Exact destination-key set
- Sheet count/order/header result
- Parser and batch-integrity result
- Authoring parity/readiness result, population/provenance coverage, lifestyle count by destination, and technical-copy diagnostics
- Per-destination module/minimum coverage
- Full resource/media counts and any deliberate UI disclosure expectations
- Every unresolved UNKNOWN, warning, conflict, stale source, formula issue, or media-rights issue
- Explicit confirmation: database writes 0; imports 0; deployments 0; pushes 0; commits 0
- Final AUTHORING READY: YES or NO

Do not claim YES unless all blocking requirements pass. Do not proceed to import.
```
