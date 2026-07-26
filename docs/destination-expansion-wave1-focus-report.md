# Wave 1 Focus Report

Generated at: 2026-07-26T05:15:16.224Z

Status: research-required
Next suggested sprint: SPRINT_1

## Top Actions

### airports

- Sprint: SPRINT_1
- Plan: healthAirports
- Extract file: docs/wave1-sprint-inputs/SPRINT_1/healthAirports.json
- Target input file: docs/destination-expansion-wave1-health-airports-input.json
- Empty arrays currently blocking: 30
- Suggested first slugs: austin-texas-united-states, boston-massachusetts-united-states, charlotte-north-carolina-united-states, chicago-illinois-united-states, columbus-ohio-united-states
- Run:
  - npm run expansion:wave1:sprintMerge
  - npm run expansion:wave1:sprintPartialApply
  - npm run expansion:wave1:preflightStrict

### costOfLiving

- Sprint: SPRINT_1
- Plan: costHousing
- Extract file: docs/wave1-sprint-inputs/SPRINT_1/costHousing.json
- Target input file: docs/destination-expansion-wave1-cost-housing-input.json
- Empty arrays currently blocking: 30
- Suggested first slugs: austin-texas-united-states, boston-massachusetts-united-states, charlotte-north-carolina-united-states, chicago-illinois-united-states, columbus-ohio-united-states
- Run:
  - npm run expansion:wave1:sprintMerge
  - npm run expansion:wave1:sprintPartialApply
  - npm run expansion:wave1:preflightStrict

### healthcareFacilities

- Sprint: SPRINT_1
- Plan: healthAirports
- Extract file: docs/wave1-sprint-inputs/SPRINT_1/healthAirports.json
- Target input file: docs/destination-expansion-wave1-health-airports-input.json
- Empty arrays currently blocking: 30
- Suggested first slugs: austin-texas-united-states, boston-massachusetts-united-states, charlotte-north-carolina-united-states, chicago-illinois-united-states, columbus-ohio-united-states
- Run:
  - npm run expansion:wave1:sprintMerge
  - npm run expansion:wave1:sprintPartialApply
  - npm run expansion:wave1:preflightStrict

### housingMetrics

- Sprint: SPRINT_1
- Plan: costHousing
- Extract file: docs/wave1-sprint-inputs/SPRINT_1/costHousing.json
- Target input file: docs/destination-expansion-wave1-cost-housing-input.json
- Empty arrays currently blocking: 30
- Suggested first slugs: austin-texas-united-states, boston-massachusetts-united-states, charlotte-north-carolina-united-states, chicago-illinois-united-states, columbus-ohio-united-states
- Run:
  - npm run expansion:wave1:sprintMerge
  - npm run expansion:wave1:sprintPartialApply
  - npm run expansion:wave1:preflightStrict

### monthlyClimate

- Sprint: SPRINT_1
- Plan: monthlyClimate
- Extract file: docs/wave1-sprint-inputs/SPRINT_1/monthlyClimate.json
- Target input file: docs/destination-expansion-wave1-monthly-climate-input.json
- Empty arrays currently blocking: 30
- Suggested first slugs: austin-texas-united-states, boston-massachusetts-united-states, charlotte-north-carolina-united-states, chicago-illinois-united-states, columbus-ohio-united-states
- Run:
  - npm run expansion:wave1:sprintMerge
  - npm run expansion:wave1:sprintPartialApply
  - npm run expansion:wave1:preflightStrict

## Category Backlog

| Category | Empty Arrays | Updates | Validation Errors | Plan | Extract | Target Input |
|---|---:|---:|---:|---|---|---|
| airports | 30 | 0 | 0 | healthAirports | docs/wave1-sprint-inputs/SPRINT_1/healthAirports.json | docs/destination-expansion-wave1-health-airports-input.json |
| costOfLiving | 30 | 0 | 0 | costHousing | docs/wave1-sprint-inputs/SPRINT_1/costHousing.json | docs/destination-expansion-wave1-cost-housing-input.json |
| healthcareFacilities | 30 | 0 | 0 | healthAirports | docs/wave1-sprint-inputs/SPRINT_1/healthAirports.json | docs/destination-expansion-wave1-health-airports-input.json |
| housingMetrics | 30 | 0 | 0 | costHousing | docs/wave1-sprint-inputs/SPRINT_1/costHousing.json | docs/destination-expansion-wave1-cost-housing-input.json |
| monthlyClimate | 30 | 0 | 0 | monthlyClimate | docs/wave1-sprint-inputs/SPRINT_1/monthlyClimate.json | docs/destination-expansion-wave1-monthly-climate-input.json |
| practicalInfo | 30 | 0 | 0 | practicalInfo | docs/wave1-sprint-inputs/SPRINT_1/practicalInfo.json | unknown |
| taxRules | 30 | 0 | 0 | visaTax | docs/wave1-sprint-inputs/SPRINT_1/visaTax.json | unknown |
| visaPrograms | 30 | 0 | 0 | visaTax | docs/wave1-sprint-inputs/SPRINT_1/visaTax.json | unknown |

## Execution Loop

1. Fill one sprint extract category file with sourced records.
2. Run npm run expansion:wave1:sprintMerge.
3. Run npm run expansion:wave1:sprintPartialApply.
4. Run npm run expansion:wave1:preflightStrict.
