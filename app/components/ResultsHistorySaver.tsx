"use client";

import { useEffect } from "react";
import { saveAssessmentRecord, syncAssessmentRecord } from "../lib/assessment-records";
import type { RetirementDnaProfile } from "../lib/retirement-dna";

type ResultsHistorySaverProps = {
  answersEncoded: string;
  profile: RetirementDnaProfile;
  topSlugs: string[];
};

export default function ResultsHistorySaver({ answersEncoded, profile, topSlugs }: ResultsHistorySaverProps) {
  useEffect(() => {
    if (!answersEncoded) return;

    const record = {
      id: `${Date.now()}-${answersEncoded.slice(0, 12)}`,
      createdAt: new Date().toISOString(),
      answersEncoded,
      profile,
      topSlugs,
    };

    saveAssessmentRecord(record);
    void syncAssessmentRecord(record);
  }, [answersEncoded, profile, topSlugs]);

  return null;
}