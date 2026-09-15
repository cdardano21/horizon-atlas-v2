# DestinationFinderAI batch workflow

1. Select candidates and complete collision intake.
2. ChatGPT and the user complete destination authoring and media selection.
3. Run one consolidated premium-readiness gate; unresolved media, identity, copy, or provenance blocks handoff.
4. Run Codex parser, schema, manifest, registry, semantic, and scope validation.
5. Run the guarded dry run and review its exact plan and targets.
6. Obtain direct user authorization for EXECUTE when required.
7. Execute the guarded import with explicit status intent: UPDATE preserves status; CREATE starts as DRAFT.
8. Read back persisted data and run containment/idempotency checks.
9. Perform visual review; make only narrowly approved repairs.
10. Obtain user visual approval.
11. Promote approved CREATE rows, then run final validation and commit/push only isolated batch changes.

Runtime source precedence is persisted/imported destination data first, workbook fallback only when persisted data is absent, and workbook data explicitly when an admin preview requests it. Historical audit rows remain append-only; EXECUTE rows use the guarded-import actor identity.
