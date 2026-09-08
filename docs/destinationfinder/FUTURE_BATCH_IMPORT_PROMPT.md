# Future Destination Batch Import Prompt

Use only after authoring is frozen and a human has separately authorized the requested phase. Replace every bracketed value. This prompt does not itself grant write authorization.

```text
Continue the permanent DestinationFinderAI batch workflow for this exact frozen artifact.

SCOPE
- Batch ID: [BATCH_ID]
- Registry ID: [REGISTRY_ID]
- Workbook path: [WORKBOOK_PATH]
- Expected SHA-256: [SHA256]
- Approved destination keys: [EXACT_COMMA_SEPARATED_KEYS]
- Target environment: [ENVIRONMENT]
- Requested phase: [READ_ONLY_PREFLIGHT | DRY_RUN | EXECUTE | READ_BACK_QA]
- Approved plan ID/hash, if EXECUTE: [PLAN_ID] / [PLAN_HASH]
- Explicit write authorization text, if EXECUTE: [AUTHORIZATION_OR_NONE]

READ FIRST
1. docs/destinationfinder/BATCH_AUTHORING_AND_IMPORT_PLAYBOOK.md
2. docs/destinationfinder/BATCH_OPERATOR_CHECKLIST.md
3. docs/destinationfinder/batch-contract-v3.3.json
4. docs/destinationfinder/VISUAL_QA_CHECKLIST.md
5. docs/destinationfinder/AUTHORING_DATA_REQUIREMENTS.md

RUNTIME ENTRY POINTS
- Registry: `app/lib/expansion-workbook-registry.ts`; valid environments are `preview` and `production`.
- Guarded batch API: `executeGuardedDeterministicV31Batch()` in `app/lib/runtime/execute-guarded-deterministic-v31-batch.ts`.
- Database connection/audit wiring: `app/lib/runtime/persisted-destination-write-runtime.ts`.
- Normalized read-back: `app/lib/persistence/v31/load-normalized-persisted-destination-bundle.ts` plus `materialize-stored-destination-state.ts` and `comparable-projection.ts`.
- No generic import CLI exists. Build and review a task-owned thin `tmp/` controller with separate `--preflight` and `--execute` modes as specified by the playbook; do not reuse a historical batch runner unchanged.

SAFETY RULES
- Verify the on-disk SHA-256 before any other action. Stop on mismatch.
- The complete v3.3 workbook must have exactly 48 sheets in canonical order. Do not confuse this with the parser's ten-sheet compatibility minimum.
- Use the existing expansion registry, deterministic parser, canonical mapping, normalized read path, guarded plan/execution machinery, and shared media resolver. Add no batch-specific loader, route, UI branch, static candidate list, affordability list, or media map.
- Population, metro population, and elevation must use the generic persisted destination identity path; lifestyle rows must use the generic `lifestyleFeatures` module backed by `premium_lifestyle_features`.
- Exact destination_key and approved destination-ID scope only. No fuzzy identity.
- UNKNOWN remains UNKNOWN. Never repair data by inference or fallback.
- Require `authoringParityStatus=PASS` and `authoringReadinessStatus=AUTHORING_COMPLETE`; structural/parser success cannot authorize dry-run or import when population, lifestyle depth, evidence, or customer-copy quality fails.
- READ_ONLY_PREFLIGHT and DRY_RUN must perform zero writes.
- EXECUTE is forbidden unless requested phase is exactly EXECUTE and the supplied authorization explicitly approves the exact unexpired plan/hash/workbook/scope/environment.
- The guarded API is per-destination transactional and stop-on-first-failure. The approved controller must provide the documented outer transaction when batch-level all-or-nothing behavior is required.
- Any byte, scope, policy, mapping, destination-ID, manifest, or plan change invalidates approval.
- Run focused tests and touched-file diagnostics serially. Do not use full-project `tsc --noEmit` as the default batch check; it is resource-unstable in this workspace.
- Preserve unrelated dirty-worktree changes. Stage only task-owned files/hunks, remove temporary tooling artifacts, and do not deploy, push, or commit unless separately requested.

PROCESS
1. Run `npm run --silent validate:destination-batch -- --workbook [WORKBOOK_PATH] --registry-id [REGISTRY_ID] --json`; stop unless integrity and authoring parity both pass.
2. Verify registry path/hash/exact keys and focused acceptance tests.
3. If requested phase is READ_ONLY_PREFLIGHT, stop after reporting; do not inspect target `destinations_catalog`, `premium_*`, or batch-audit rows unless separately authorized.
4. Before protected-state work, capture a scoped backup and outside-scope fingerprint. If DRY_RUN is authorized, resolve exact destination IDs, generate the deterministic hash-bound plan, and report all operations/conflicts with writes fixed at zero.
5. Save the immutable preflight report and SHA-256. If EXECUTE is authorized, require the exact approved preflight hash, revalidate every preflight gate immediately before the outer transaction, and reject stale/mismatched plans, creates/errors outside policy, implicit destructive operations, and out-of-scope identities. Execute once and roll back the outer transaction on any failure.
6. For an authorized completed write, normalize read-back for every destination/module. Explicitly reconcile identity population/metro/elevation and every `premium_lifestyle_features` row, verify the outside-scope fingerprint and an idempotent rerun, then prove the new candidates in Smart Shortlist and Explore/Browse.
7. Run `VISUAL_QA_CHECKLIST.md` on Premium Guide, Smart Shortlist, and Explore at required desktop/mobile viewports. Confirm every new candidate appears exactly once, routes successfully, and exposes no separate batch-specific data path.
8. Preserve all reports, hashes, snapshots, logs, and screenshots as the audit package.
9. Confirm destination publication status is unchanged. Import does not authorize publication; any draft-to-published transition is a separate approved operation.

FINAL REPORT
- Requested and completed phase
- Workbook/registry/plan identifiers and hashes
- Exact destination scope and database read/write counts
- Structural/parser/integrity/readiness results and warning dispositions
- Dry-run or execution operations by destination/module
- Transaction/rollback and normalized read-back results, if applicable
- Persisted identity/lifestyle read-back, outside-scope fingerprint, and idempotency results, if applicable
- Premium Guide, Smart Shortlist, and Explore/Browse product and visual QA, if applicable
- Exact post-batch candidate count, unique key/slug counts, missing/extra/duplicate results, and route status
- Catalog status before/after and explicit confirmation that import did not publish
- Remaining blockers
- Final READY FOR NEXT PHASE: YES or NO

Never advance to a later phase merely because an earlier phase passed.
```
