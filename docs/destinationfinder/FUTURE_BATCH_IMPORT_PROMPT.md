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

SAFETY RULES
- Verify the on-disk SHA-256 before any other action. Stop on mismatch.
- The complete v3.3 workbook must have exactly 48 sheets in canonical order. Do not confuse this with the parser's ten-sheet compatibility minimum.
- Use the existing expansion registry, deterministic parser, canonical mapping, normalized read path, guarded plan/execution machinery, and shared media resolver. Add no batch-specific loader, route, UI branch, static candidate list, affordability list, or media map.
- Exact destination_key and approved destination-ID scope only. No fuzzy identity.
- UNKNOWN remains UNKNOWN. Never repair data by inference or fallback.
- Require `authoringParityStatus=PASS` and `authoringReadinessStatus=AUTHORING_COMPLETE`; structural/parser success cannot authorize dry-run or import when population, lifestyle depth, evidence, or customer-copy quality fails.
- READ_ONLY_PREFLIGHT and DRY_RUN must perform zero writes.
- EXECUTE is forbidden unless requested phase is exactly EXECUTE and the supplied authorization explicitly approves the exact unexpired plan/hash/workbook/scope/environment.
- Any byte, scope, policy, mapping, destination-ID, manifest, or plan change invalidates approval.
- Do not deploy, push, or commit unless separately requested.

PROCESS
1. Run `npm run --silent validate:destination-batch -- --workbook [WORKBOOK_PATH] --registry-id [REGISTRY_ID] --json`; stop unless integrity and authoring parity both pass.
2. Verify registry path/hash/exact keys and focused acceptance tests.
3. If requested phase is READ_ONLY_PREFLIGHT, stop after reporting; do not inspect protected persisted state unless separately authorized.
4. If DRY_RUN is authorized, resolve exact destination IDs, generate the deterministic hash-bound plan, and report all operations/conflicts with writes fixed at zero.
5. If EXECUTE is authorized, revalidate every preflight gate immediately before the transaction. Reject stale/mismatched plans, creates/errors outside policy, implicit destructive operations, and out-of-scope identities. Execute once transactionally and roll back on any failure.
6. For an authorized completed write, normalize read-back, verify zero unintended changes and idempotent rerun, then perform the visual QA checklist on Premium Guide and Smart Shortlist.
7. Preserve all reports, hashes, snapshots, logs, and screenshots as the audit package.

FINAL REPORT
- Requested and completed phase
- Workbook/registry/plan identifiers and hashes
- Exact destination scope and database read/write counts
- Structural/parser/integrity/readiness results and warning dispositions
- Dry-run or execution operations by destination/module
- Transaction/rollback and normalized read-back results, if applicable
- Premium Guide and Smart Shortlist visual QA, if applicable
- Remaining blockers
- Final READY FOR NEXT PHASE: YES or NO

Never advance to a later phase merely because an earlier phase passed.
```
