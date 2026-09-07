# DestinationFinder Batch Authoring and Import Playbook

## Purpose

This is the permanent operating procedure for researching, authoring, validating, approving, importing, and verifying future DestinationFinder batches. It does not authorize a write. Every phase has its own exit gate, and validation never implies import approval.

Use these companion contracts:

- `AUTHORING_DATA_REQUIREMENTS.md`: exact per-destination research requirements
- `batch-contract-v3.3.json`: machine-readable workbook structure
- `BATCH_OPERATOR_CHECKLIST.md`: operator sign-offs
- `WORKBOOK_TEMPLATE_INSTRUCTIONS.md`: safe workbook creation
- `VISUAL_QA_CHECKLIST.md`: post-import user-interface verification

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
  -> Premium Guide + Smart Shortlist
  -> visual QA and final report
```

One registry, one parser, one canonical mapping, one persisted read path, and one shared media resolver serve every batch. Never add destination-specific production code, batch-numbered loaders, manual candidate lists, consumer-specific media maps, or fallback content.

## Phase A: freeze scope

1. Assign a stable batch ID and bounded destination-key set.
2. Search exact keys, slugs, and active aliases for collisions.
3. Capture repository commit, operator, UTC timestamp, intended environment, and authorization scope.
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

1. Add one generic `EXPANSION_WORKBOOK_REGISTRY` entry only after workbook bytes are frozen.
2. Set exact path, environment, complete key set, and SHA-256.
3. Do not add new loader branches or destination-specific candidates/affordability records.
4. Add a batch acceptance test that proves exact keys, isolation, row preservation, U3-R5 values, adapter behavior, and generic future-batch behavior.
5. Run registry validation and the batch's focused tests.

**Exit gate:** registry and acceptance proof pass against the exact frozen hash.

## Phase E: dry-run and conflict resolution

This phase requires separate authorization if it reads protected persisted state. It still performs no writes.

1. Resolve each key to exactly one destination ID in approved scope.
2. Map through `mapCanonicalDestinationToStoredState()` and the normalized persisted read path.
3. Produce creates, updates, unchanged values, warnings, errors, and explicit destructive operations.
4. Bind the plan to workbook hash, manifest hash, schema/normalization/diff-policy versions, exact key/ID scope, creator, creation time, and expiry.
5. Reject implicit clears/deletes, out-of-scope identities, duplicate IDs, unresolved conflicts, and unsupported creates.
6. Change evidence in a new workbook version; recompute hashes and regenerate the plan.

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

Execute once. Do not broaden scope, deploy, push, or alter the workbook during execution. On any failure, roll back and preserve the failure report.

**Exit gate:** transaction committed for the exact approved scope or fully rolled back.

## Phase G: read-back and visual QA

1. Read every affected destination through the normal persisted read port.
2. Compare normalized expected versus persisted state by stable identity and module.
3. Verify no unrelated destination changed and no authored child rows were truncated.
4. Run `VISUAL_QA_CHECKLIST.md` for Premium Guide and Smart Shortlist on desktop/mobile.
5. Re-run the same plan as a dry run; expected content diff is zero.
6. Preserve workbook, hashes, registry entry, validation report, approved plan, pre-write snapshot, execution log, read-back report, screenshots, and final verdict together.

**Exit gate:** normalized read-back, idempotency, and both consumer experiences pass.

## Failure and recovery

- Never overwrite the failed workbook. Correct a copy, recalculate, hash, and restart validation.
- Never patch persisted rows manually to “finish” a batch.
- Never convert UNKNOWN to pass/fail without evidence.
- Never reuse approval after workbook, scope, policy, code, or plan bytes change.
- Resume by durable batch run ID, workbook hash, plan hash, destination key, and destination ID, not by observed row presence.
- Treat UI truncation as a presentation defect; do not delete source rows to fit the UI.

## Required final report

Report batch identity, workbook path/hash/schema/sheet count, exact key set, parser and validator results, warnings and dispositions, per-module counts, provenance/media coverage, dry-run plan and approval details, write count/transaction outcome when authorized, normalized read-back, idempotency, visual QA, remaining blockers, and one explicit **YES/NO** readiness verdict. Distinguish structural validity, authoring readiness, matching readiness, display readiness, and publication readiness.
