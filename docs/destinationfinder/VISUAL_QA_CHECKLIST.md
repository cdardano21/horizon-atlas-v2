# DestinationFinder Batch Visual QA Checklist

Run this only after an authorized import and successful normalized read-back, or against an explicitly supported workbook-preview environment. Visual QA does not modify workbook or persisted data.

## Evidence record

Record:

- Batch ID, registry ID, workbook SHA-256, repository commit, environment, tester, and UTC time
- Exact destination keys tested
- Browser/version and viewport dimensions
- Premium Guide URL, Smart Shortlist URL/result state, and Explore URL/search/filter state
- Screenshot filenames and console/network logs
- Every failure with destination key, route, viewport, reproduction steps, and severity

## Required viewports

- [ ] Desktop: 1440 x 900 or larger
- [ ] Compact desktop/tablet: 1024 x 768
- [ ] Mobile: 390 x 844
- [ ] Narrow mobile: 320 x 700

Use deterministic screenshots after fonts/images settle. Disable browser extensions and record any blocked third-party media separately from application defects.

## Automated precheck

Before browser QA, update the batch acceptance assertions to the newly expected registry-backed cohort and run:

```bash
./node_modules/.bin/vitest run \
	app/lib/expansion-workbook-registry.test.ts \
	app/lib/smart-shortlist/server-data.test.ts \
	app/lib/smart-shortlist/evaluator.test.ts \
	app/lib/smart-shortlist/owned-affordability.test.ts \
	app/lib/smart-shortlist/owned-affordability-evaluator.test.ts \
	app/lib/smart-shortlist/scenarios.test.ts \
	app/lib/smart-shortlist/adversarial-matrix.test.ts \
	app/lib/explore-destinations.test.ts \
	app/components/__tests__/destination-search.test.tsx \
	app/components/destinationCardFacts.test.ts
```

The automated suite is necessary but not sufficient. Enumerate every expected canonical slug from the post-batch candidate set, request `/destinations/<slug>`, require HTTP 200 with matching identity, and then exercise the search/filter/Back interactions in a real browser.

## Premium Guide route and identity

For every destination:

- [ ] Canonical slug resolves to exactly one page; approved aliases resolve to the same permanent identity.
- [ ] Page title, city/region/country, summary, and URL all describe the same destination.
- [ ] No reference-batch or neighboring-destination content appears in text, links, images, maps, or metadata.
- [ ] Refresh and direct navigation preserve the same content; no client/server mismatch or fallback flash.
- [ ] Missing optional data hides cleanly and does not render `undefined`, `null`, empty cards, fabricated prose, or another destination's value.

## Premium Guide content preservation

- [ ] Population renders from the persisted canonical identity; metro population appears only when separately authored and supported.
- [ ] Hero intelligence values are distinct; duplicate displayed values do not consume multiple slots.
- [ ] Lifestyle & Recreation exposes all authored rows through visible cards/disclosure controls and represents multiple meaningful destination-specific themes.
- [ ] No destination is reduced to a one-card lifestyle section; a below-14 authoring exception has explicit evidence and approval.
- [ ] Customer copy contains no workbook/parser/adapter/token/engine/schema/table language.
- [ ] Overview is complete, legible, and not truncated.
- [ ] All authored neighborhoods are reachable; names, pros/cons, ratings, housing context, and maps remain associated correctly.
- [ ] Places are grouped under correct categories and retain names, descriptions, websites, maps, addresses, and ordering.
- [ ] Resource groups preserve all authored rows or provide a visible, usable expansion path; no unexplained four-item truncation.
- [ ] Cost ranges show correct household/currency/period context.
- [ ] Climate shows all 12 months with plausible units and no blank/stale/error formula values.
- [ ] Housing, healthcare, visa, tax, LGBTQ, safety, transport, connectivity, language, family, accessibility, retirement, and reality modules display the expected authored facts without coercing UNKNOWN.
- [ ] Reality checks and safety items remain balanced, specific, and visually distinguishable from promotional content.
- [ ] Source/official links point to the authored URLs and open safely; invalid links are reported, never silently substituted.

## Media and attribution

- [ ] Exactly one intended primary image is used as hero.
- [ ] Hero depicts the correct destination and is not a generic fallback when verified canonical media exists.
- [ ] At least three distinct verified images render; target is one hero plus three gallery images.
- [ ] Gallery order follows `gallery_order`; no duplicate photo is presented through alternate URLs.
- [ ] Images preserve aspect ratio, useful crop, focal subject, and adequate resolution at every viewport.
- [ ] Alt text/subject is accurate and destination-specific.
- [ ] Caption, credit, source, and license/attribution are available wherever the UI supports them.
- [ ] A failed media URL affects only that media item, never text or another module.
- [ ] No content overlaps hero controls, captions, navigation, or adjacent sections.

## Smart Shortlist discovery and hard gates

- [ ] Every activated destination appears exactly once in the candidate cohort under its canonical identity.
- [ ] Search/filter entry reaches the destination without any static per-destination code path.
- [ ] Country/geography behavior uses the expected ISO country code.
- [ ] Beach, ocean/coastal, mountain/ski, healthcare, safety, LGBTQ, legal-path, and affordability hard requirements show the expected PASS/FAIL/UNKNOWN behavior.
- [ ] UNKNOWN remains visibly incomplete and never becomes PASS, NONE, No, zero, or an exclusion without the evaluator's defined rule.
- [ ] A hard-gate failure excludes regardless of preference fit.
- [ ] Single-person profiles use the single U3-R5 midpoint; couple profiles use the couple midpoint.
- [ ] Budget-boundary behavior matches the exact midpoint values and does not fall back to static affordability.
- [ ] Missing/malformed affordability yields insufficient/unknown behavior rather than a fabricated estimate.

## Smart Shortlist preference fit

- [ ] Beach, mountain/outdoor, healthcare, and safety preferences reflect the currently populated enum-derived dimensions.
- [ ] Unsupported direct-score dimensions remain absent and do not behave as zero.
- [ ] Sorting/ranking is deterministic for the same profile and data.
- [ ] Preference ranking does not reintroduce a hard-gate-excluded destination.
- [ ] Explanations identify actual available evidence and do not claim unsupported precision.

## Explore/Browse discovery and navigation

- [ ] The rendered cohort equals the expected registry-backed cohort: every activated destination appears exactly once, with no missing destinations, extras, duplicate keys, or duplicate slugs.
- [ ] Every new destination has a valid card name, country, useful summary, destination-specific image, and accurate alt text; unsupported scores or facts are omitted rather than fabricated.
- [ ] Exact city/name searches find the intended destination and no unrelated empty-field matches.
- [ ] Country and region searches behave as expected, including diacritics, punctuation, and apostrophes.
- [ ] Canonical lifestyle filters use customer-facing aliases only; internal tags/tokens do not leak into the interface.
- [ ] Combined search and filters produce deterministic results, and clear/reset restores the full cohort.
- [ ] Every card opens the canonical Premium Guide route successfully with matching identity and media.
- [ ] Browse -> Destination -> Back restores the previous query and active filters.
- [ ] Primary navigation tabs/links between Explore, Smart Shortlist, and destination content work at desktop and mobile widths.
- [ ] Empty, loading, image-failure, and no-results states remain useful and do not change the cohort or fabricate fallback facts.

## Interaction and responsive quality

- [ ] Keyboard navigation reaches links, tabs, accordions, galleries, filters, and primary actions in logical order.
- [ ] Visible focus states, labels, headings, and accessible names are present.
- [ ] No horizontal overflow at required viewports.
- [ ] Text, chips, controls, maps, images, and tables do not overlap or clip.
- [ ] Long destination names, URLs, translated names, and unbroken tokens wrap safely.
- [ ] Opening/closing panels does not shift fixed-format controls unexpectedly.
- [ ] Loading, empty, unknown, error, and image-failure states remain usable and truthful.
- [ ] Browser console has no application errors; network failures are captured and classified.

## Cross-consumer reconciliation

- [ ] Premium Guide, Smart Shortlist, and Explore show the same canonical name, country, slug, hero identity, and decision-critical facts.
- [ ] All three consumers use canonical media/shared resolution rather than separate manual image mappings.
- [ ] Any deliberate presentation difference is documented and does not alter factual meaning.
- [ ] Normalized read-back counts reconcile with rendered/accessible item counts; UI truncation is reported as UI behavior, not repaired by deleting workbook rows.

## Control destinations

- [ ] At least one preexisting destination outside the batch is unchanged in Premium Guide.
- [ ] At least one preexisting destination outside the batch is unchanged in Smart Shortlist.
- [ ] At least one preexisting destination outside the batch is unchanged in Explore/Browse.
- [ ] Unknown and exclusion behavior for existing controls is unchanged.
- [ ] No route, image, or resource from the new batch leaks into a control destination.

## Sign-off

Record separate verdicts:

| Verdict | YES only when |
|---|---|
| Identity safe | Every route/alias resolves exactly and no cross-destination content exists. |
| Data preserved | Normalized read-back and rendered content retain all expected modules/rows. |
| Matching ready | Hard gates, U3-R5 households, UNKNOWN behavior, and preference fit are correct. |
| Display ready | All three consumer paths pass required desktop/mobile checks with correct media. |
| Publication ready | All above pass and every material source/media-rights issue is resolved. |

Any NO blocks the corresponding next phase. Attach screenshots and defects; do not “fix” a visual/data mismatch by editing production data outside the approved batch workflow.
