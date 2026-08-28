# Phase 2 Research Summary — Batch #2 Lifestyle Evidence Package (Quality-Corrected)

Read-only phase: no workbook, code, registry, Supabase, or publication state was changed. This document
summarizes the **corrected** artifacts: [`feature-taxonomy.md`](./feature-taxonomy.md)/[`.json`](./feature-taxonomy.json),
[`batch02-lifestyle-evidence.csv`](./batch02-lifestyle-evidence.csv)/[`.json`](./batch02-lifestyle-evidence.json),
[`batch02-proposed-places.csv`](./batch02-proposed-places.csv), [`climate-walkability-rubric.md`](./climate-walkability-rubric.md),
and the full [`phase2-quality-corrections.json`](./phase2-quality-corrections.json) change log.

## What this correction pass was
A narrow evidence-quality audit of the existing Phase 2 package — not a new research project, not a
taxonomy redesign, not a workbook population. The original Phase 2 draft data is preserved unmodified in
`evidence_data.py`/`evidence_data_2.py`; all corrections are applied by `phase2_corrections.py` as an
explicit, reviewed, reproducible layer on top, and every altered field is recorded in
`phase2-quality-corrections.json`.

## Scope actually researched (unchanged)
Ascoli Piceno (IT), Sarandë (AL), Dumaguete (PH), Las Terrenas (DO), Fairhope (AL, US) only. Batch #1,
the pilot destinations, and the 973 legacy destinations were not touched. No new broad research was
conducted this pass; only targeted source confirmation for rows already proposed.

## 1. Taxonomy count reconciliation
The true, mechanically-verified total is **49 feature keys** (`community_form` 8 + `natural_setting` 9 +
`water_and_boating` 11 + `outdoor_recreation` 10 + `culture_and_daily_life` 11 = 49). A prior chat-response
summary had stated "40," which was simply a wrong manual total — the underlying taxonomy file and its
group counts were always correct and never needed to change. `run_phase2.py` now computes and validates
this total mechanically (`write_taxonomy()` + `validate()`) every time the artifacts are regenerated, so
this specific mismatch cannot recur silently.

## 2. Confidence audit
All 57 originally-reported `HIGH`-confidence rows were individually reviewed. **22 were downgraded to
`MEDIUM`**:
- 18 because their sole citation was Wikipedia (directly, or "via Wikipedia citation" for an underlying
  official source like PAGASA or the Philippine Retirement Authority that was never directly visited) —
  Wikipedia can support `MEDIUM` background but not independently justify `HIGH`.
- 4 because a `STRONG` availability rating rested on only one named entity (Ascoli's single hiking trail,
  Ascoli's single trail/park claim, Dumaguete's single farmers-market row, and Dumaguete's arts/culture
  rating which blended in an unverified external UNESCO fact) — a single data point does not unambiguously
  support the strongest classification band.

35 `HIGH` rows remain, all either the mirrored `DESTINATIONS.beach_access`/`mountain_or_ski_access` fields
(authoritative by construction), direct population/city_type facts from the existing workbook, directly-
fetched official tourism-agency pages (akt.gov.al), or multi-entry existing-`PLACES` facts (e.g. Fairhope's
two named golf courses, three named parks).

## 3. `NONE` audit
Every row using `availability_level = NONE`, `proximity_band = NONE`, or a negative mirrored `feature_value`
was reviewed against the standard: affirmative evidence of absence, or a decisive geographic/climatic
condition — never "a search found nothing."

- **9 rows converted from `NONE` to `UNKNOWN`** (all were "not identified/not found" search-failure
  results, not affirmative evidence): Ascoli's suburban character, boat-launch access, powerboating
  access, and sailing access; Sarandë's college-town character and surfing access; Las Terrenas's
  college-town character; Dumaguete's surfing access.
- The remaining `NONE` rows (desert/snow/skiing climate facts, Ascoli's inland-geography water-access
  conclusions, Fairhope's bay-vs-lake distinction, Sarandë's skiing conclusion) were **retained as `NONE`**
  because they rest on a decisive, source-backed geographic or climatic condition (e.g. a confirmed
  tropical/humid-subtropical Köppen climate, a confirmed inland location with no coast/lake, or the
  destination's own existing `mountain_or_ski_access = MOUNTAIN_SCENIC_ONLY` field) — but wording was
  tightened to state that decisive basis explicitly rather than the vaguer original phrasing ("no facility
  exists or is plausible"), and several were re-cited to a real, existing source URL that had gone missing
  from the original row.

## 4. Confidence → matching-enabled enforcement
Before this pass, `matching_enabled` had simply inherited the taxonomy's group-level default (`YES` for
almost every key) regardless of the row's actual confidence — **159 rows violated the required rule**.
This is now enforced mechanically by `phase2_corrections.py` on every regeneration:

| | Before | After |
|---|---|---|
| `matching_enabled = YES` among `HIGH`-confidence rows | 35 | 25 (10 are the mirrored beach/mountain rows, correctly forced to `NO`) |
| `matching_enabled = YES` among `MEDIUM`-confidence rows | ~81 | 81 |
| `matching_enabled = YES` among `LOW`-confidence rows | ~86 | **0** |
| `matching_enabled = YES` among `UNKNOWN` rows | ~73 (overlapping with LOW) | **0** |

By feature group, `matching_enabled = YES` rows now stand at: `community_form` 31, `natural_setting` 26,
`water_and_boating` 20, `outdoor_recreation` 18, `culture_and_daily_life` 11.
12 `LOW`-confidence rows whose only content was the generic, uninformative "No evidence found either way"
placeholder were also switched to `display_enabled = NO` (not useful consumer context); other `LOW`-
confidence rows with genuinely qualified, informative wording (e.g. Fairhope's regionally-known pickleball
popularity note) were left `display_enabled = YES`.

## 5. Fairhope settlement-classification correction
Primary settlement type remains `SMALL_CITY` (already correct — population 26,625, city_type "bayfront
small city"). The secondary `SUBURBAN_COMMUNITY` characteristic and the separate `suburban_character` row
were reworded and the latter's availability downgraded from `STRONG` to `MODERATE`: Fairhope's real,
sourced metro-area relationship to Mobile is now framed explicitly as a regional/metro characteristic,
not as Fairhope's own primary or dominant identity, which remains its distinct historic single-tax-colony
and arts-community character.

## 6. Promotional wording removed
- `lf_dumaguete_ph_scuba_snorkeling_access`: removed "ranked among Sport Diver Magazine's global top-100
  dive sites" and "premier regional diving access"; replaced with the preferred factual framing, "Apo
  Island is a recognized diving and snorkeling destination," retaining only the directly-documented,
  non-promotional facts (marine sanctuary since 1982, coral/fish species counts).
- The corresponding proposed named place (Apo Island Marine Sanctuary) had "globally recognized" removed
  from its description for the same reason, and its confidence was capped at `MEDIUM` (Wikipedia-sourced).

No other rows matched the prohibited superlative list (world-class, best, premier, famous, top-ranked,
exceptional) other than one legitimate exception left unchanged: Dumaguete's `retirement_orientation` row
quotes the literal, official name of a real award ("Best Place to Retire in the Philippines," Philippine
Retirement Authority) rather than using "best" as promotional language — this is a factual citation of a
named honor, not marketing copy, so the wording was kept (confidence was still downgraded per the
Wikipedia-sourcing rule).

## 7. Source validation
- The prior warning about `cityoffairhope.com` redirecting to an unrelated ad-click domain is preserved;
  that domain is not used anywhere in this package, and `fairhopeal.gov` remains the correct official
  reference.
- No row was found citing a search-results URL as if it were a direct source.
- Government/official-tourism citations (akt.gov.al) were left as directly-fetched, first-party evidence.
- Wikipedia citations were re-audited per the new rule (see §2) and are now capped at `MEDIUM`.

## 8. Proximity review
Straight-line/ambiguous-distance claims were reviewed and four were widened or downgraded rather than
silently treated as driving time:
- Dumaguete's `lake_access` (Balinsasayao Twin Lakes): widened from `WITHIN_30_MIN` to `WITHIN_60_MIN`
  (14.5 km in hilly terrain, road-vs-straight-line distance not specified).
- Dumaguete's `scuba_snorkeling_access` and `powerboating_access` (Apo Island): downgraded from
  `WITHIN_60_MIN` to `UNKNOWN` — only the ~30-minute boat-ride segment is directly sourced; the total
  door-to-door time (including the drive to Malatapay) was never confirmed.
- Fairhope's `countryside_access`: downgraded from `WITHIN_30_MIN` to `UNKNOWN` — no specific place or
  distance was ever cited, only general county character.

## 9. Proposed named places review
All 8 places were reviewed. No duplicates were found (destination + name uniqueness re-validated). One
confidence downgrade and one wording correction were applied (Apo Island, §6); all others were left as
originally proposed (Fly Creek Marina and the Sarandë port/Las Terrenas sailing-club entries were already
appropriately conservative — `already_in_workbook` flags and low/medium confidence intact). The Google
Maps links use the same name-based search-query URL pattern already used throughout the existing, approved
workbook's own `PLACES` rows; this was not changed. Fairhope Municipal Pier remains explicitly flagged as
an unconfirmed candidate (`LOW` confidence, "NOT independently source-verified") and was not upgraded,
since no new broad research was permitted this pass.

## 10. Climate/walkability rubric
Reviewed; unchanged in substance (see [`climate-walkability-rubric.md`](./climate-walkability-rubric.md)).
No destination score was calculated, no `DESTINATION_SCORES` value was touched, no monthly climate value
was invented, and no walkability score was inferred from prose.

## Final counts after correction
- 208 evidence rows (unchanged — no rows added or removed), 8 proposed places (unchanged).
- Confidence: `HIGH` 35 (was 57), `MEDIUM` 81 (was 65), `LOW` 92 (was 86).
- `UNKNOWN` (`availability_level` or `feature_value`): 81 (was 73).
- 179 total change-log entries in `phase2-quality-corrections.json`.

## Validation results
`run_phase2.py` now validates: destination keys, feature groups, feature keys, controlled values,
record-key uniqueness, required fields, the confidence/matching-enabled rule (including a hard check that
`HIGH` confidence can never be paired with a bare `Wikipedia` source_name), duplicate proposed places, URL
formatting, mechanically-computed taxonomy-count reconciliation, and full CSV/JSON row-for-row agreement.
**Result: 0 issues.**

