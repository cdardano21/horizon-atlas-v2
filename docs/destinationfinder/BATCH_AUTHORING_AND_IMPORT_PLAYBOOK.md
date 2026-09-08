# DestinationFinder Batch Authoring and Import Playbook

## Purpose

This is the permanent operating procedure for researching, authoring, validating, approving, importing, and verifying future DestinationFinder batches. It does not authorize a write. Every phase has its own exit gate, and validation never implies import approval.

Use these companion contracts:

- `AUTHORING_DATA_REQUIREMENTS.md`: exact per-destination research requirements
- `batch-contract-v3.3.json`: machine-readable workbook structure
- `BATCH_OPERATOR_CHECKLIST.md`: operator sign-offs
- `WORKBOOK_TEMPLATE_INSTRUCTIONS.md`: safe workbook creation
- `VISUAL_QA_CHECKLIST.md`: post-import user-interface verification

## Current proven production state

The private application currently resolves **56 unique destinations**: the previously established 36 plus the registered Next-20. That exact cohort has been proven through the shared Smart Shortlist data loader and is also the source of truth for Explore/Browse. The Next-20 and old-36 parity work established that workbook completeness alone does not prove persistence or rendering completeness; source validation and normalized persisted/read-back parity are separate required gates.

Current product proof covers all three consumers:

- Premium Guide/detail routes load canonical destination content and media.
- Smart Shortlist loads all 56 candidates through the shared registry-backed path, filters hard requirements before ranking survivors, and preserves UNKNOWN.
- Explore/Browse derives the same exact 56-candidate cohort from Smart Shortlist data, adds optional public-card enrichment by canonical key/slug, and does not maintain a separate static universe.

This count records the proven checkpoint, not a permanent limit. A future batch changes the expected cohort only after registry, persistence/read-back, Smart Shortlist, Explore, route, and visual proof pass.

## Authoritative sheet-count resolution

The authorized Next-20 reference workbook physically contains **48 worksheets**. This is proven independently by the XLSX workbook manifest, `WORKBOOK_METADATA.validation_sheet_count=48`, and the acceptance assertion `sheetCount: 48` in `next-batch-20-cleanup-workbook.test.ts`.

The earlier number **39 was an inspection/reporting error**, not a competing schema. There is no 39-sheet contract, 39-sheet assertion, or 39-sheet workbook in the current authority chain. Worksheet 39 in the canonical order is `IMPORT_CONTRACT`; stopping the list there omits nine real sheets: `WORKBOOK_METADATA`, `IMPORT_MANIFEST`, `DESTINATION_ALIASES`, `VALIDATION_RULES`, `DATA_DICTIONARY`, `ENVIRONMENT_QUALITY`, `DAILY_LIFE_PRACTICALITY`, `EVENTS_SEASONALITY`, and `LIFESTYLE_FEATURES`.

Three counts must not be conflated:

| Count | Meaning | Enforcement |
|---|---|---|
| **48** | Complete current v3.3 authoring template and authorized reference workbook | Permanent playbook and `validate:destination-batch` enforce exactly 48 in canonical order. |
| **10** | Backward-compatible structural minimum accepted by the deterministic parser | Parser contract detection only; not sufficient for a new authoring-complete batch. |
| **24 / 30** | Rows in `SCHEMA_INDEX` / `DATA_DICTIONARY` | Partial documentation registries, not physical sheet counts and not exhaustive manifests. |

Future v3.3 workbooks must use all 48 sheets. Empty destination-module sheets are allowed only where the authoring requirements permit no rows; the sheet and exact header still remain. A schema change that adds/removes/reorders sheets requires a new version and coordinated parser, contract, template, validator, and test update. Do not silently call it v3.3.

## Binding architecture

```text
sources + research ledger
  -> immutable 48-sheet v3.3 workbook
  -> validate:destination-batch (read-only)
  -> loadFrozenWorkbookV31DeterministicImport()
  -> canonical destination
  -> reviewed dry-run plan and explicit approval
  -> guarded transactional persistence
  -> normalized read-back
  -> Premium Guide + Smart Shortlist + Explore/Browse
  -> visual QA and final report
```

One registry, one parser, one canonical mapping, one persisted read path, and one shared media resolver serve every batch. Never add destination-specific production code, batch-numbered loaders, manual candidate lists, consumer-specific media maps, or fallback content.

### Persistence and read-back contract

- Population, metro population, and elevation use the generic persisted destination identity fields in `destinations_catalog`; persisted identity is preferred, with only the existing approved canonical fallbacks used when persisted optional values are absent.
- `LIFESTYLE_FEATURES` maps through the generic `lifestyleFeatures` module and persists in `premium_lifestyle_features` by stable destination and record identity.
- New and preexisting batches use the same mapping, write port, normalized read port, canonical loader, Smart Shortlist loader, and Explore selector. A destination-specific persistence or rendering branch is a contract failure.
- Verify full normalized row counts and values after a write. A UI disclosure limit or card cap is presentation behavior and never evidence that source or persisted rows may be discarded.

### Decision-engine contract

Smart Shortlist is **FILTER FIRST -> RANK SURVIVORS BY PREFERENCE FIT**. Each active hard requirement resolves to `PASS`, `FAIL`, or `UNKNOWN`: `FAIL` excludes, `UNKNOWN` remains visibly incomplete/needs verification, and preference fit cannot rescue a hard failure. Unsupported preference dimensions remain absent rather than becoming zero or an invented score.

U3-R5 affordability uses the selected household's single/couple 2026 USD `comfortable` monthly planning estimate. The runtime estimate is the authored range midpoint. `WITHIN_BUDGET` means midpoint at or below budget, `CLOSE_TO_BUDGET` means above budget but no more than 10% above it, and `OVER_BUDGET` means more than 10% above it. The estimate includes a modern one-bedroom home, utilities, groceries, ordinary local transportation, moderate dining, and entertainment; it excludes healthcare, taxes, international travel, major medical expenses, and luxury spending.

## Canonical 24-step workflow

Use this sequence for every future batch; the detailed phases below define each gate.

1. Freeze the batch ID, exact destination keys, environment, operator, repository commit, and authorization boundary.
2. Search exact keys, slugs, and active aliases for collisions and preserve source artifacts with SHA-256 hashes.
3. Build a destination-scoped research ledger, including unresolved conflicts and UNKNOWNs.
4. Verify the authorized template path/hash pair and copy it to a new candidate artifact.
5. Preserve exactly 48 sheets in canonical order, exact headers, formulas, validations, and control sheets.
6. Sanitize all reference destination rows and populate only the approved exact keys and stable child keys.
7. Author all required modules, provenance, population, media, hard-gate facts, and single/couple U3-R5 rows.
8. Author at least 14 useful sourced lifestyle rows per destination or record an explicit human-reviewed exception; preserve all useful resource/media rows even when a UI initially shows fewer.
9. Rebind climate formulas, recalculate cached values, reconcile manifest counts, and remove internal technical language from customer copy.
10. Save immutable candidate bytes, compute SHA-256, and run unregistered read-only validation with exact expected keys.
11. Resolve every blocking error and warning disposition in a new candidate/hash; require structural, parser, integrity, parity, and authoring-readiness gates to pass.
12. Add one generic registry entry with exact path, environment, complete keys, and pinned SHA-256.
13. Run registry validation plus focused validator, workbook, mapping, and batch acceptance tests.
14. Capture an outside-scope fingerprint and scoped pre-write backup for affected identities/modules.
15. Under separate read authorization, resolve every key to exactly one approved destination ID and load normalized persisted state.
16. Generate a deterministic dry-run plan bound to workbook, manifest, policy, code, key, destination-ID, environment, and expiry.
17. Review creates, updates, unchanged values, explicit destructive operations, warnings, and conflicts; require zero unresolved items and zero dry-run writes.
18. Obtain explicit human authorization for the exact unexpired plan/hash/scope, then revalidate all gates immediately before execution.
19. Execute once through the guarded transactional write port; roll back completely on any failure.
20. Normalize read-back and compare every destination/module, including identity population/metro/elevation and all `premium_lifestyle_features` rows; prove the outside-scope fingerprint is unchanged.
21. Replay the same operation as a dry run and require a zero-content-diff/idempotent result.
22. Prove Smart Shortlist includes every new candidate exactly once, applies hard gates/UNKNOWN/U3-R5 correctly, ranks only survivors, and routes each result successfully.
23. Prove Explore/Browse includes every new candidate exactly once with no extras, and test exact/country/region search, canonical filters, valid cards/images, destination routes, and Browse -> Destination -> Back state restoration.
24. Complete Premium Guide, Smart Shortlist, and Explore desktop/mobile visual QA, archive the full audit package, stage only task-owned files, create the requested local commit when authorized, and do not push unless separately requested.

## Phase A: freeze scope

1. Assign a stable batch ID and bounded destination-key set.
2. Search exact keys, slugs, and active aliases for collisions.
3. Capture repository commit, operator, UTC timestamp, intended environment, and authorization scope. Registry environment is exactly `preview` or `production`; `preview` may load outside `NODE_ENV=production`, while `production` is never request-time workbook loading.
4. Preserve source artifacts unchanged and compute source hashes.
5. Create a research ledger for each destination: field, exact value, source, accessed date, evidence date, confidence, and unresolved conflict.

**Exit gate:** every destination has one unambiguous proposed canonical key, source inventory, and explicit conflict state.

## Phase B: create the workbook safely

1. Follow `WORKBOOK_TEMPLATE_INSTRUCTIONS.md`; never edit the authorized reference in place.
2. Preserve all 48 sheets, canonical order, exact headers, reference taxonomies, contract sheets, validation rules, and data dictionary.
3. Replace all destination-scoped data with only the approved batch. Remove reference destination aliases, manifests, and statuses.
4. Populate fields using `AUTHORING_DATA_REQUIREMENTS.md`. Unknown stays blank or the exact supported `UNKNOWN` token.
5. Create stable semantic child keys and exact destination foreign keys.
6. Keep formula cells intact or deliberately rebuild them against the new destination's facts. Recalculate and save cached values.
7. Preserve source, URL, verification, date, confidence, media identity, license, and attribution.
8. Reconcile `IMPORT_MANIFEST` expected row counts to actual authored rows.
9. Save as a new artifact and compute SHA-256. Any byte change invalidates the hash.
10. Pass the customer-content parity contract: sourced numeric population, at least 14 useful sourced lifestyle rows per destination (or an explicitly documented human-reviewed exception), and no internal pipeline prose in customer-visible fields.

**Exit gate:** immutable candidate workbook, complete ledger, exact key set, and no fabricated values.

## Phase C: read-only validation

Run:

```bash
npm run --silent validate:destination-batch -- \
  --workbook data/<batch>/<workbook>.xlsx \
  --expected-keys key-one,key-two \
  --json
```

After a registry entry exists, use `--registry-id <id>` instead of manually supplying keys. The command performs zero database reads/writes and has no execute mode. It verifies:

- exact 48-sheet order and declared headers;
- parser-required ten-sheet subset and schema 3.3 metadata;
- deterministic parser success;
- registry SHA/path/key ownership when registered;
- exact `DESTINATIONS`/manifest/expected-key equality;
- duplicate identity checks;
- exactly one valid 2026 USD U3-R5 row for each single/couple household;
- minimum media/climate/neighborhood/source coverage warnings;
- required numeric population and destination-scoped provenance;
- at least 14 displayable, evidence-backed, sourced lifestyle rows per destination, with valid keys/order and duplicate/filler review;
- clearly internal pipeline language in customer-visible authoring fields;
- unresolved Intelligence V2 decision facts as warnings, never inferred values.

Interpret the statuses separately:

- `structuralStatus=PASS`: complete workbook shape matches v3.3.
- `parserStatus=PASS`: real parser accepts the workbook.
- `batchIntegrityStatus=PASS`: no blocking structural, parser, hash, key, manifest, or affordability error.
- `authoringParityStatus=PASS`: population, lifestyle depth/quality, and customer-copy gates pass.
- `authoringReadinessStatus=AUTHORING_COMPLETE`: both batch integrity and authoring parity pass. Non-blocking warnings still require recorded disposition; UNKNOWN remains UNKNOWN.
- `authoringReadinessStatus=REVIEW_REQUIRED`: structural/runtime validity alone is insufficient and import must not advance as authoring-complete.

Run the focused validator and workbook acceptance tests. Capture the command, exit code, report, workbook hash, and repository commit. Do not repair source data in the validator.

**Exit gate:** zero blocking errors and every warning disposition recorded. Validation does not authorize a write.

## Phase D: registry and acceptance proof

1. Add one generic `EXPANSION_WORKBOOK_REGISTRY` entry in `app/lib/expansion-workbook-registry.ts` only after workbook bytes are frozen.
2. Set a unique `registryId`, exact repository-relative `workbookPath`, `environment` (`preview` or `production`), complete `expectedDestinationKeys`, and pinned `expectedSha256`.
3. Do not add new loader branches or destination-specific candidates/affordability records.
4. Add a batch acceptance test that proves exact keys, isolation, row preservation, U3-R5 values, adapter behavior, and generic future-batch behavior.
5. Run `./node_modules/.bin/vitest run app/lib/expansion-workbook-registry.test.ts scripts/validate_destination_batch.test.ts <batch-acceptance-test>` and the batch's focused mapping tests. `validateExpansionWorkbookRegistry()` is the registry integrity function.

**Exit gate:** registry and acceptance proof pass against the exact frozen hash.

## Runtime interface: reviewed thin controller required

There is intentionally no generic import CLI. Do not improvise shell SQL and do not reuse a prior batch's `tmp/` runner unchanged. For each authorized batch, create a small, reviewable, task-owned TypeScript controller under `tmp/` that supplies only batch constants and audit plumbing to the permanent generic APIs:

- Parse with `loadFrozenWorkbookV31DeterministicImport()` from `app/lib/workbook-v31-deterministic-core.ts`.
- Connect with `connectDestinationWriteClient()` from `app/lib/runtime/persisted-destination-write-runtime.ts`, or an equivalent direct `pg` client using `SUPABASE_DB_URL`. Never place credentials in source, reports, prompts, or commits.
- Plan and execute with `executeGuardedDeterministicV31Batch()` from `app/lib/runtime/execute-guarded-deterministic-v31-batch.ts`; its input includes `client`, exact `approvedDestinationKeys`, canonical `destinations`, `workbookPath`, `workbookHash`, `contractSchemaVersion`, unique `batchRunId`, `mode`, `explicitlyApproveExecution`, and `executedBy`.
- Read with `createSupabasePersistedDestinationReadPort()`, `createTransactionPersistedReadClient()`, and `loadNormalizedPersistedDestinationBundle()`; materialize with `materializeStoredDestinationStateFromNormalizedPersistedBundle()` and compare via `projectStoredComparable()` against `mapCanonicalDestinationToStoredState()`.
- Use `buildPlanEnvelope()` / `validatePlanEnvelopeForExecution()` from `app/lib/persistence/v31/plan-envelope.ts` when producing an approval envelope. The controller must additionally bind execution to the exact saved preflight artifact SHA-256 because the guarded batch API accepts explicit approval but does not itself persist an approval signature.

The controller must have separate `--preflight` and `--execute` modes. `--preflight` uses `mode: "DRY_RUN"` and `explicitlyApproveExecution: false`; it may read protected persisted state but must report `totalStatementsExecuted=0`. `--execute` is absent or fails closed until a human supplies the exact approved environment, workbook hash, preflight artifact hash, key/ID scope, operator, and expiry. Human authorization and database credentials are external inputs, never inferred from a passing validator or stored in documentation.

The closest proven shape is the architecture exercised by `app/lib/runtime/__tests__/execute-guarded-deterministic-v31-batch.test.ts`; files under `tmp/` are historical evidence, not reusable authority. Review the new controller and run its focused test before any protected-state access.

## Phase E: dry-run and conflict resolution

This phase requires separate human authorization to read the target Supabase `destinations_catalog`, `premium_*`, and batch-audit rows. It still performs no writes.

1. Resolve each key to exactly one destination ID in approved scope.
2. Map through `mapCanonicalDestinationToStoredState()` and the normalized persisted read path.
3. Produce creates, updates, unchanged values, warnings, errors, and explicit destructive operations.
4. Bind the plan to workbook hash, manifest hash, schema/normalization/diff-policy versions, exact key/ID scope, creator, creation time, and expiry.
5. Reject implicit clears/deletes, out-of-scope identities, duplicate IDs, unresolved conflicts, and unsupported creates.
6. Change evidence in a new workbook version; recompute hashes and regenerate the plan.

Before planning, discover the exact tables the plan can touch. The proven generic scope is `destinations_catalog` plus public base tables named `premium_*` that contain `destination_id`; include the batch-audit table separately. A scoped recovery snapshot contains all rows for approved destination IDs, their catalog identity/status rows, table names, stable serialization rules, row counts, and SHA-256. The outside-scope fingerprint contains, per discovered table, the row count and SHA-256 of deterministically ordered, stable-JSON rows not owned by the approved IDs. Store the immutable snapshot and preflight report with restrictive file permissions and record each artifact hash.

The preflight report must include the exact key/ID/status scope, workbook and registry hashes, discovered table set, backup path/hash, outside-scope fingerprints, per-destination plan action and operation lists, errors/warnings, attempted/failed/skipped counts, and SQL statement count. `DRY_RUN` passes only when every destination plans, no destination fails/skips, no unapproved/destructive operation appears, and statements executed equal zero.

**Exit gate:** unresolved count zero and a deterministic hash-bound plan exists.

## Phase F: explicit approval and execution

No write occurs unless a human separately authorizes the exact plan after reviewing its hash and scope. Required gates include:

- mode exactly `EXECUTE` and explicit execution approval true;
- approved, unexpired plan envelope;
- exact workbook/plan/manifest/policy hashes;
- exact destination-key/destination-ID scope;
- zero unresolved or blocking errors;
- explicit targets for every clear/delete/replace;
- bounded credentials for the intended environment;
- transactional write port and rollback behavior verified.

Immediately before execution, re-hash the workbook, preflight report, and recovery snapshot; re-resolve key/ID/status scope; and recompute the outside-scope fingerprint. Any mismatch invalidates approval.

The guarded runtime is transactional **per destination** and stops on first failure. To reproduce the proven all-or-nothing batch procedure, the thin controller must open one outer database transaction and adapt nested `BEGIN`/`COMMIT` calls so only the outer controller commits after every destination, read-back check, privacy/status check, and outside-scope comparison passes. Any error before that commit rolls back the outer transaction. Without that wrapper, earlier destination transactions may already be committed when a later destination fails; do not describe that mode as batch-atomic.

Execute once. Do not broaden scope, publish, deploy, push, or alter the workbook during execution. Preserve the exact result, including `batchOutcome`, attempted/succeeded/failed/skipped counts, statements executed, destination reports, and audit identifiers.

**Exit gate:** transaction committed for the exact approved scope or fully rolled back.

## Phase G: read-back and visual QA

1. Read every affected destination through the normal persisted read port.
2. Materialize normalized state and compare `projectStoredComparable()` output against the expected state from `mapCanonicalDestinationToStoredState()` by stable identity and module.
3. Verify population, supported metro population/elevation, and every lifestyle stable key/value/count explicitly. Verify the outside-scope row-count/SHA-256 map is byte-for-byte equal and no authored child rows were truncated.
4. Prove the exact expected cohort, route success, hard-gate behavior, and deterministic ranking in Smart Shortlist; prove exact cohort, search/filter behavior, routes, and Back-state restoration in Explore/Browse.
5. Run `VISUAL_QA_CHECKLIST.md` for Premium Guide, Smart Shortlist, and Explore/Browse on desktop/mobile.
6. Re-run the same plan as a dry run; expected content diff is zero.
7. Preserve workbook, hashes, registry entry, validation report, approved plan, pre-write snapshot, execution log, read-back report, screenshots, and final verdict together.

**Exit gate:** normalized read-back, idempotency, and all three consumer experiences pass.

Import does not publish. The generic catalog-create path writes `status='draft'`, and existing catalog status is preserved. Any transition to customer-visible publication is a separate operation and authorization outside this import checkpoint; record the final status and stop if publication was not explicitly requested.

## Failure and recovery

- Never overwrite the failed workbook. Correct a copy, recalculate, hash, and restart validation.
- Never patch persisted rows manually to “finish” a batch.
- Never convert UNKNOWN to pass/fail without evidence.
- Never reuse approval after workbook, scope, policy, code, or plan bytes change.
- Resume by durable batch run ID, workbook hash, plan hash, destination key, and destination ID, not by observed row presence.
- Treat UI truncation as a presentation defect; do not delete source rows to fit the UI.

## Required final report

Report batch identity, workbook path/hash/schema/sheet count, exact key set, parser and validator results, warnings and dispositions, per-module counts, provenance/media coverage, dry-run plan and approval details, write count/transaction outcome when authorized, normalized read-back, idempotency, visual QA, remaining blockers, and one explicit **YES/NO** readiness verdict. Distinguish structural validity, authoring readiness, matching readiness, display readiness, and publication readiness.

## Repository operating constraints

- Prefer `./node_modules/.bin/vitest` and `./node_modules/.bin/vite-node` for focused checks in this workspace; the `npx` wrapper can fail independently of the underlying tool.
- Do not use full-project `tsc --noEmit` as the default batch validation. It has proved resource-unstable here, especially when multiple heavy checks run concurrently. Run one focused validation process at a time.
- Treat the worktree as potentially dirty. Inspect diffs, preserve unrelated user changes, and stage only task-owned files or hunks.
- Keep temporary probes and generated reports out of a commit unless they are intentional audit artifacts. Delete disposable tooling after validation.
- A requested local commit does not authorize a push.
