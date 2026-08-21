import { describe, expect, it } from "vitest";
import {
  ALL_SYNTHETIC_DESTINATION_FIXTURES,
  TOURIST_FRIENDLY_NO_LONG_STAY_PATH,
} from "../fixtures/synthetic-destinations";
import {
  ALL_SYNTHETIC_PROFILE_FIXTURES,
  PERMANENT_RETIREE_BUYER,
  REMOTE_EMPLOYEE_7_MONTH,
  RETIRED_7_MONTH_RENTER,
  RETIRED_90_DAY_RENTER,
  SPLIT_YEAR_SNOWBIRD_RENTER,
} from "../fixtures/synthetic-profiles";

describe("synthetic destination fixtures satisfy the contract", () => {
  it("provides between 10 and 15 fixtures", () => {
    expect(ALL_SYNTHETIC_DESTINATION_FIXTURES.length).toBeGreaterThanOrEqual(10);
    expect(ALL_SYNTHETIC_DESTINATION_FIXTURES.length).toBeLessThanOrEqual(15);
  });

  it("has unique, clearly-synthetic ids and display names (never a real destination)", () => {
    const ids = ALL_SYNTHETIC_DESTINATION_FIXTURES.map((fixture) => fixture.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const fixture of ALL_SYNTHETIC_DESTINATION_FIXTURES) {
      expect(fixture.id).toMatch(/^fixture-/);
      expect(fixture.displayName).toMatch(/^Fixture:/);
      expect(fixture.notes.length).toBeGreaterThan(0);
    }
  });

  it("every fixture has the full minimal fact shape (entryAndStay, hardGates, cost, financial, lifestyleDimensions)", () => {
    for (const fixture of ALL_SYNTHETIC_DESTINATION_FIXTURES) {
      expect(fixture.entryAndStay).toBeDefined();
      expect(fixture.hardGates).toBeDefined();
      expect(fixture.cost).toBeDefined();
      expect(fixture.financial).toBeDefined();
      expect(fixture.lifestyleDimensions).toBeDefined();
    }
  });

  it("includes at least one fixture per requested edge case", () => {
    const notes = ALL_SYNTHETIC_DESTINATION_FIXTURES.map((fixture) => fixture.notes.toLowerCase());
    const hasNoteMatching = (fragment: string) => notes.some((note) => note.includes(fragment));

    expect(hasNoteMatching("no extended-stay")).toBe(true); // cheap but legally infeasible
    expect(hasNoteMatching("strong climate/culture/community/walkability")).toBe(true); // expensive but excellent lifestyle
    expect(hasNoteMatching("does not grant residency")).toBe(true); // 90-day tourist-friendly, no long-stay path
    expect(hasNoteMatching("remote work prohibited or unresearched") || hasNoteMatching("remote work is disallowed")).toBe(true);
    expect(hasNoteMatching("digital-nomad")).toBe(true);
    expect(hasNoteMatching("no mountain or ski access")).toBe(true);
    expect(hasNoteMatching("no beach access")).toBe(true);
    expect(hasNoteMatching("international-standard healthcare")).toBe(true);
    expect(hasNoteMatching("no legal protections")).toBe(true);
    expect(hasNoteMatching("not been researched")).toBe(true); // missing legal data
    expect(hasNoteMatching("no tax/pension/property-tax research")).toBe(true); // missing financial data
    expect(hasNoteMatching("not allowed") && hasNoteMatching("renting")).toBe(true); // buying restricted, renting easy
    expect(hasNoteMatching("$4,500") || hasNoteMatching("4,500")).toBe(true); // affordable at 6500 not 4500
  });
});

describe("synthetic profile fixtures satisfy the contract", () => {
  it("provides exactly the 10 Navigator Report scenario-matrix profiles", () => {
    expect(ALL_SYNTHETIC_PROFILE_FIXTURES.length).toBe(10);
  });

  it("every profile carries the current profile contract version", () => {
    for (const profile of ALL_SYNTHETIC_PROFILE_FIXTURES) {
      expect(profile.profileContractVersion).toBe("intelligence-v2-profile@1");
    }
  });
});

describe("same synthetic destination legitimately supports different future Layer 1 outcomes per profile", () => {
  // These are data-sufficiency assertions only — comparisons between raw fixture facts
  // and raw profile fields. No evaluator/scoring logic is implemented or exercised here.
  const facts = TOURIST_FRIENDLY_NO_LONG_STAY_PATH.entryAndStay;

  it("a 90-day retired renter's intended stay fits within the tourist stay limit", () => {
    expect(RETIRED_90_DAY_RENTER.stayDuration.intendedStayDurationDays).not.toBeNull();
    expect(RETIRED_90_DAY_RENTER.stayDuration.intendedStayDurationDays! <= facts.touristStayLimitDays!).toBe(true);
  });

  it("a 7-month retiree's intended stay exceeds the tourist limit with no extended-stay or retirement-visa path", () => {
    expect(RETIRED_7_MONTH_RENTER.stayDuration.intendedStayDurationDays! > facts.touristStayLimitDays!).toBe(true);
    expect(facts.extendedStayOrLongStayVisaAvailable).toBe("NO");
    expect(facts.retirementVisaProgramAvailable).toBe("NO");
    // Distinct from the 90-day renter's outcome: this profile's intended duration alone
    // already exceeds the destination's tourist limit, which is not true for RETIRED_90_DAY_RENTER.
    expect(RETIRED_7_MONTH_RENTER.stayDuration.intendedStayDurationDays).not.toBe(
      RETIRED_90_DAY_RENTER.stayDuration.intendedStayDurationDays,
    );
  });

  it("a 7-month remote employee faces the same overstay problem PLUS an activated remote-work-legality question the retiree never triggers", () => {
    expect(REMOTE_EMPLOYEE_7_MONTH.stayDuration.intendedStayDurationDays! > facts.touristStayLimitDays!).toBe(true);
    expect(facts.remoteWorkOrDigitalNomadVisaAvailable).toBe("NO");
    expect(facts.remoteWorkLegalUnderTouristStatus).toBe("UNKNOWN");

    // The remote-work-legality question only applies because this profile intends to work; the
    // retiree profile with the identical stay duration does not intend to work at all.
    expect(REMOTE_EMPLOYEE_7_MONTH.intendsToWorkDuringStay).toBe(true);
    expect(RETIRED_7_MONTH_RENTER.intendsToWorkDuringStay).toBe(false);
    expect(REMOTE_EMPLOYEE_7_MONTH.stayDuration).toEqual(RETIRED_7_MONTH_RENTER.stayDuration);
  });

  it("a permanent buyer can pass the property-purchase fact while the residency-path fact still fails, proving the two must remain separate criteria", () => {
    expect(PERMANENT_RETIREE_BUYER.tenureIntent).toBe("BUY");
    expect(PERMANENT_RETIREE_BUYER.hardRequirements.foreignPropertyPurchaseEssential).toBe(true);
    expect(facts.foreignPropertyPurchaseAllowed).toBe("YES");
    expect(facts.propertyPurchaseGrantsResidencyPath).toBe("NO");
    expect(facts.permanentResidencyPathAvailable).toBe("NO");
    // Property rights and residency path diverge on this single fixture — they cannot be
    // collapsed into one criterion without losing this exact case.
    expect(facts.foreignPropertyPurchaseAllowed).not.toBe(facts.permanentResidencyPathAvailable);
  });

  it("the split-year/snowbird renter is represented without implying property ownership on this same fixture", () => {
    expect(SPLIT_YEAR_SNOWBIRD_RENTER.activityMode).toBe("SPLIT_YEAR_SNOWBIRD");
    expect(SPLIT_YEAR_SNOWBIRD_RENTER.tenureIntent).toBe("RENT");
    expect(facts.foreignPropertyPurchaseAllowed).toBe("YES"); // available, but irrelevant since this profile rents
  });
});
