# DestinationFinderAI Operating Contract

## Purpose

This document is the canonical operating contract for all DestinationFinderAI destination-batch work.

It exists to prevent workflow drift, rushed authoring, templated content, unsafe imports, and premature claims that a batch is complete.

This file is documentation only. It must not alter application behavior, validators, import behavior, database behavior, build behavior, or runtime behavior.

---

## 1. Ownership of Research and Authoring

ChatGPT and the user own:

- destination research
- workbook authoring
- enrichment
- customer-facing editorial copy
- recommendations
- cost research
- housing/property research
- healthcare
- visas/residency
- taxes
- safety
- transportation
- connectivity
- language/integration
- pets/family
- bureaucracy
- retirement/aging
- lifestyle modules
- official website research
- exact Google Maps research
- media selection
- premium customer-facing QA

Codex must NOT author customer-facing destination content.

Codex may:
- validate
- test
- inspect
- compare
- self-host approved media
- import approved workbook content
- perform guarded database operations
- run persistence/runtime checks
- prepare safe repository changes

Editorial defects found by Codex must return to ChatGPT for repair.

---

## 2. No Templated Customer-Facing Prose

Customer-facing writing must be destination-specific.

Do not use destination-name-swap templates.

Repeated sentence structures across multiple destinations are a QA warning.

Descriptions must include concrete local detail where appropriate, such as:

- real neighborhoods
- local transport patterns
- actual markets
- hospitals
- parks
- trails
- museums
- food culture
- climate realities
- local bureaucracy
- local tradeoffs
- practical daily-life details

If authoring starts becoming repetitive or pattern-driven, STOP and switch to destination-by-destination writing instead of pushing through for speed.

---

## 3. Mandatory Premium Semantic QA

Before a batch can be called PREMIUM READY:

Run QA across ALL customer-facing modules for:

- exact duplicate text
- near-duplicate text
- destination-name-swap templates
- repeated sentence structures
- generic computer-sounding prose
- filler that could apply equally to many destinations
- weak descriptions that only restate a category or place name

A structurally valid workbook is NOT automatically premium-ready.

Technical validation does not substitute for editorial validation.

---

## 4. Link Standard

For named customer-facing recommendations:

- use an exact Google Maps URL for the specific place
- separately include a verified official/direct website when one genuinely exists
- official/direct site and Google Maps URL must remain separate
- never fabricate a website
- never use a generic Google search URL
- never use a generic search-results page as the final link
- never substitute a generic tourism homepage for an individual place unless that page is actually the authoritative page for that place

If no legitimate official/direct website can be verified:

- Maps-only is acceptable
- do not invent a replacement

---

## 5. Media Standard

Before Codex handoff:

ChatGPT and the user must finalize all media.

Every media row must use:

- one exact image page
OR
- one direct deterministic asset URL

Never use:

- generic search-results URLs
- `/search/` media URLs
- ambiguous listing pages

Premium QA must explicitly confirm:

- zero `/search/` media URLs
- deterministic provenance
- local asset coverage after self-hosting

Codex's role is limited to:

- validating finalized media
- self-hosting/importing it
- testing it

Codex must not independently choose replacement media unless explicitly authorized.

---

## 6. Four Mandatory Completion Gates

Never call a batch COMPLETE unless all four states are separately true:

1. AUTHORED
   ChatGPT/user research and authoring complete.

2. PREMIUM QA PASSED
   Editorial, semantic duplicate, link, media, and customer-facing quality checks passed.

3. CODEX VALIDATED
   Parser, schema, manifest, registry, tests, import planning, containment, and technical validation passed.

4. VISUALLY APPROVED
   The user reviewed the actual rendered destination pages and approved them.

Do not collapse these states into one word.

If only some gates have passed, report the exact current state.

---

## 7. Evidence Before Import

Before any database import, report evidence including as applicable:

- destination count
- UPDATE count
- CREATE count
- DRAFT status
- rows reviewed
- exact duplicate count
- near-duplicate/template count
- official/direct website coverage
- Google Maps coverage
- media count
- media local-asset coverage
- `/search/` count
- remaining UNKNOWN items
- validation errors
- warnings
- import target resolution
- strict containment status

If a check has not actually been run, say:

NOT YET VERIFIED

Do not present assumptions as completed validation.

---

## 8. Codex Is an Independent Verifier

Codex is not the customer-facing cleanup writer.

Codex should independently verify:

- workbook structure
- parser/schema
- semantic duplication
- link coverage
- media integrity
- manifest
- registry pins
- digest/exception files
- import target resolution
- scope containment
- draft/published state
- database readback
- runtime routes
- Git isolation

If Codex identifies an editorial problem:

STOP and return it to ChatGPT.

Do not let Codex rewrite customer-facing copy unless the user explicitly changes this contract.

---

## 9. New Chat / Resume Rule

Whenever DestinationFinderAI work resumes in a new chat:

Before doing substantive work:

1. Treat this operating contract as the canonical workflow.
2. Restate the active batch checkpoint.
3. Confirm which gate the batch is currently in.
4. Do not restart completed work.
5. Do not infer missing state.
6. Retrieve or request the current authoritative checkpoint if necessary.
7. Do not ask the user to re-teach these rules.

Memory is supplemental.

The canonical contract and current checkpoint control the workflow.

---

## 10. Unknown Means Unknown

Do not fabricate missing research.

If a fact, official website, price, law, policy, healthcare detail, property rule, or other field cannot be verified:

Use UNKNOWN or the workbook's approved uncertainty mechanism.

Do not fill gaps merely to make the workbook look complete.

---

## 11. Database and Import Safety

Before database writes:

- validate workbook SHA
- resolve exact destination scope
- resolve exact identities
- check collisions
- confirm CREATE/DRAFT behavior
- run guarded dry run
- verify strict containment
- review planned replace/update/delete behavior

Do not execute if dry run and intended authoring scope disagree.

Database write authorization must be explicit.

---

## 12. CREATE Destination Safety

New destinations remain DRAFT until the user visually approves them.

Import success does not equal publication approval.

Do not publish CREATE destinations automatically.

---

## 13. Git Safety

Never mix unrelated repository changes into a batch commit.

If the worktree contains unrelated changes:

- do not reset them
- do not clean them
- do not broadly stash them
- isolate only the approved batch files/hunks
- verify the staged diff before commit

Commit/push only after the batch has passed the required gates.

---

## 14. No Shortcut Rule

Speed never overrides premium quality.

A batch taking longer is acceptable.

Generic content, invented links, weak QA, or incomplete verification are not acceptable shortcuts.

When in doubt:

STOP, verify, and report the exact uncertainty.

---

## 15. Required Batch Status Language

Use these exact stage labels:

- AUTHORING IN PROGRESS
- PREMIUM QA REQUIRED
- PREMIUM QA PASS
- CODEX VALIDATION REQUIRED
- CODEX VALIDATION PASS
- IMPORT PREFLIGHT REQUIRED
- IMPORT READY
- IMPORTED
- VISUAL APPROVAL REQUIRED
- VISUALLY APPROVED
- COMPLETE

Never label a batch COMPLETE unless every required gate has passed.
