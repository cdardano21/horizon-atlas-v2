# DestinationFinder Batch Operator Checklist

This checklist is a sign-off record, not authorization. Record evidence beside every item. Stop at the first blocking failure.

## Scope and custody

- [ ] Batch ID, operator, UTC start time, repository commit, target environment, and requested operation recorded.
- [ ] Exact destination-key set approved; exact-key/slug/alias collision search complete.
- [ ] Source artifacts preserved unchanged with SHA-256 hashes and research ledgers.
- [ ] No database write, deployment, push, or production activation is implied by authoring/validation.

## Workbook construction

- [ ] New workbook created from the safe template procedure, never by modifying the reference in place.
- [ ] Exactly 48 sheets exist in canonical order; no sheet was added, deleted, renamed, or reordered.
- [ ] Exact v3.3 headers retained; `README`, taxonomies, contract, validation rules, and dictionary preserved.
- [ ] `WORKBOOK_METADATA.schema_version=3.3` and `validation_sheet_count=48`.
- [ ] `DESTINATIONS`, `IMPORT_MANIFEST`, `DESTINATION_ALIASES`, and `PILOT_STATUS` contain only this batch.
- [ ] Manifest expected row counts equal actual destination-scoped row counts.
- [ ] Stable child keys are nonblank/unique; every child references its own valid `destination_key`.
- [ ] No fuzzy identity, fallback content, cross-destination copy, guessed value, or silent URL substitution.

## Authoring completeness

- [ ] Every REQUIRED item in `AUTHORING_DATA_REQUIREMENTS.md` reviewed per destination.
- [ ] Short and long overview are place-specific and supported by module evidence.
- [ ] All current hard-gate inputs explicitly researched; remaining UNKNOWNs listed and dispositioned.
- [ ] Exactly one valid `single` and one valid `couple` U3-R5 2026 USD row per destination.
- [ ] Both U3-R5 ranges are positive, ordered, sourced, and independently midpoint-checked.
- [ ] Twelve climate rows per destination; formulas/cached values recalculated and spot-checked.
- [ ] Minimum neighborhood/place/resource/source/reality-check counts met with distinct current records.
- [ ] At least three verified images per destination, exactly one primary; four total preferred under current photo policy.
- [ ] Image identity, source, license/credit, availability, order, verification, and date checked.
- [ ] Direct `DESTINATION_SCORES` omitted unless an approved 0-100 methodology exists.
- [ ] Every destination has a positive numeric `DESTINATIONS.population` and destination-scoped credible population provenance; metro population is optional.
- [ ] Every destination has at least 14 useful displayable `LIFESTYLE_FEATURES` rows, or a documented human-approved exception; no irrelevant filler was added to meet the number.
- [ ] Every lifestyle row has evidence, a valid source URL, valid feature key, unique stable record key, and unique positive display order.
- [ ] Customer-visible copy describes the destination and contains no internal pipeline/schema language.

## Read-only preflight

- [ ] Workbook saved as immutable candidate; SHA-256 recorded.
- [ ] Run `npm run --silent validate:destination-batch -- --workbook <path> --expected-keys <csv> --json`.
- [ ] `sheetCount=48`, `structuralStatus=PASS`, `parserStatus=PASS`, `batchIntegrityStatus=PASS`.
- [ ] `authoringParityStatus=PASS` and `authoringReadinessStatus=AUTHORING_COMPLETE`; schema validity alone is not accepted.
- [ ] Every `REVIEW_REQUIRED` warning reviewed; no warning silently treated as PASS.
- [ ] Focused batch acceptance and registry tests pass.
- [ ] Validation report, command, exit code, hash, and repository commit archived.
- [ ] Confirm validator performed zero database writes and exposed no execute mode.

## Registry and dry run

- [ ] One generic entry added to `app/lib/expansion-workbook-registry.ts` with unique ID, exact path, `preview` or `production` environment, complete key set, and SHA-256.
- [ ] No batch-specific loader, route, UI branch, candidate list, affordability list, or media map added.
- [ ] `./node_modules/.bin/vitest run app/lib/expansion-workbook-registry.test.ts scripts/validate_destination_batch.test.ts <batch-acceptance-test>` passes with no duplicate key/alias.
- [ ] A new task-owned thin controller uses `executeGuardedDeterministicV31Batch()` and the normalized read APIs; historical `tmp/` runners were not reused unchanged.
- [ ] Controller review confirms separate fail-closed `--preflight`/`--execute` modes, exact workbook/key/environment constants, no embedded credentials, and no publication mutation.
- [ ] Scoped pre-write backup contains approved catalog/module rows, stable serialization, row counts, and SHA-256; file path/hash are recorded.
- [ ] Outside-scope fingerprint covers `destinations_catalog` plus discovered public `premium_*` destination tables, with deterministically ordered stable-JSON row count/SHA-256 per table.
- [ ] Separately authorized dry run resolves every key to exactly one approved destination ID.
- [ ] Dry-run plan lists creates/updates/unchanged/warnings/errors and all explicit destructive operations.
- [ ] Workbook, manifest, plan, policy, scope, and destination-ID hashes/versions bound in the plan envelope.
- [ ] Immutable preflight report records scope/statuses, hashes, table set, backup, fingerprints, plan operations, counts, and errors/warnings; its SHA-256 is recorded.
- [ ] Unresolved count is zero; every destination plans; failed/skipped and dry-run SQL statements are zero; changed input caused a new hash and new plan.

## Write authorization

- [ ] Human approval identifies exact plan ID/hash, workbook hash, environment, scope, approver, and expiry.
- [ ] Mode is exactly `EXECUTE`; explicit execution approval is true.
- [ ] Credentials are bounded to the authorized environment/window.
- [ ] Workbook, preflight, and backup hashes plus key/ID/status scope and outside-scope fingerprint are revalidated immediately before execution.
- [ ] Controller owns one outer transaction for batch-level atomicity; the guarded API's nested per-destination transaction boundaries cannot commit independently.
- [ ] No unrelated worktree/deployment/push activity is bundled with the operation.

## Post-write verification

- [ ] Transaction committed once for exact scope, or fully rolled back on failure.
- [ ] Database write count and affected identities match the approved plan.
- [ ] Normalized read-back equals expected canonical state per destination/module.
- [ ] Population, supported metro population/elevation, and canonical identity read back through the generic `destinations_catalog` path.
- [ ] Every expected lifestyle row reads back through `premium_lifestyle_features`; full row counts and stable record keys reconcile even when the UI initially discloses fewer items.
- [ ] Outside-scope fingerprint and unrelated destination controls are unchanged.
- [ ] Repeat dry run proposes zero changes.
- [ ] Smart Shortlist contains every new candidate exactly once, with no missing/extra keys or destination-specific candidate branch.
- [ ] Smart Shortlist proves FILTER FIRST -> RANK SURVIVORS: FAIL excludes, UNKNOWN needs verification, preference fit cannot rescue failure, and selected-household U3-R5 midpoint/tolerance behavior matches policy.
- [ ] Explore/Browse contains every new candidate exactly once with no missing/extra keys; exact/country/region search and canonical filters work.
- [ ] Every new Smart Shortlist and Explore card routes to its canonical destination; Browse -> Destination -> Back restores search/filter state.
- [ ] Premium Guide, Smart Shortlist, and Explore consume the same canonical identity, facts, and media.
- [ ] `VISUAL_QA_CHECKLIST.md` passed on desktop and mobile; screenshots archived.
- [ ] Catalog publication status is unchanged; any draft-to-published transition remains a separately authorized operation.
- [ ] Final report distinguishes structural, authoring, matching, display, and publication readiness.
- [ ] Final **YES/NO** readiness verdict and remaining blockers recorded.

## Repository handoff

- [ ] Full-project `tsc --noEmit` was not used as a default batch check; focused tests and touched-file diagnostics were run serially.
- [ ] Temporary scripts, reports, screenshots, and workbook artifacts are retained only in their intended audit location or removed.
- [ ] Dirty-worktree changes were reviewed; only task-owned files/hunks are staged.
- [ ] Local commit message matches the requested checkpoint/batch operation; no push occurs without separate authorization.

## Immediate stop conditions

- [ ] Hash/path/key/sheet/header/manifest mismatch.
- [ ] Parser or batch-integrity failure.
- [ ] Duplicate/cross-destination identity or child key.
- [ ] Missing/malformed single or couple U3-R5 row.
- [ ] Missing/unsupported population or population provenance; materially thin lifestyle content without an approved exception; clearly internal technical language in customer copy.
- [ ] Implicit delete/clear/replace or unapproved scope change.
- [ ] Unresolved conflict, stale approval, transaction uncertainty, or read-back mismatch.
- [ ] Preflight/backup/fingerprint mismatch, nonzero dry-run statements, or partial per-destination commit risk without the approved outer transaction.
- [ ] Broken/wrong/unlicensed primary media or destination identity uncertainty.

If any stop condition is checked, do not import. Preserve evidence, create a corrected workbook/plan as a new artifact, and restart at read-only validation.
