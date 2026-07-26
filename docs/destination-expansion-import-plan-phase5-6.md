# Destination Expansion Import Plan (Phases 5-6)

## Scope Guardrails

- This plan covers destination catalog expansion only.
- No non-destination product modules are modified.
- Existing destination records remain unchanged.
- New records are marked as research-pending until structured data is verified.

## Current Expansion Status

- Existing catalog audited: 300 baseline destinations confirmed.
- New proposal generated: 300 destinations (200 United States + 100 international).
- Duplicate check completed: zero duplicate slugs.
- Catalog expansion applied: 300 new records appended.
- Current catalog total: 600 destinations.

## Phase 5: Structured Import and Enrichment

1. Keep newly appended catalog entries as discovery-shell records only.
2. Run category-first ingestion through existing pipeline modules:
   - climate and weather
   - cost of living and housing
   - healthcare and airports
   - legal and tax
   - practical and resource links
3. For each category import run, enforce:
   - source attribution
   - confidence assignment
   - verification status
   - freshness timestamp
4. Publish only approved records through existing review/publish workflow.

## Phase 6: Expansion Stabilization Toward 600 Production-Ready Destinations

1. Promote destinations from research-pending to structured only after core category coverage is complete.
2. Keep fallback summaries conservative until confidence thresholds are met.
3. Track readiness by destination using these gates:
   - climate coverage present
   - cost/housing coverage present
   - healthcare coverage present
   - transport coverage present
   - residency/tax references present
4. Keep destination pages render-safe by preserving current fallback behavior when a category is incomplete.

## Execution Commands

- Append missing proposal destinations to catalog:
  - node scripts/expand_destination_catalog_from_proposal.mjs
- Verify count and slug uniqueness:
  - node audit script against app/lib/destinations.ts

## Architecture Alignment Notes

- Destination catalog source: app/lib/destinations.ts
- Proposal source: docs/destination-expansion-proposed-300.json
- Expansion script: scripts/expand_destination_catalog_from_proposal.mjs
- Command-center and destination-content layers continue to use existing local/Supabase fallback strategy.

## Risk Controls

- No fabricated numeric claims are introduced for new destinations.
- New destination records are explicitly labeled as research-pending.
- Existing curated destination records are not overwritten.
- Duplicate slug guard is enforced before and after insertion.
