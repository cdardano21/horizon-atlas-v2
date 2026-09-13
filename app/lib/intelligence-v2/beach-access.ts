export type BeachAccessType = "OCEAN_BEACH_DESTINATION" | "OCEAN_BEACH_ACCESS_NEARBY" | "LAKE_BEACH_ACCESS" | "NO_QUALIFYING_BEACH_ACCESS" | "UNKNOWN";

export interface BeachAccessEvidence {
  readonly accessType: BeachAccessType;
  readonly beachName: string;
  /** Normal-road minutes from the centre; null means not established, never inferred. */
  readonly driveMinutes: number | null;
  readonly waterType: "OCEAN_SEA" | "FRESHWATER" | "UNKNOWN";
  readonly verified: boolean;
  readonly sourceName: string;
  readonly sourceUrl: string;
  readonly verifiedAt: string;
}

export const MAX_NEARBY_OCEAN_BEACH_DRIVE_MINUTES = 45;

/** Destination-only by default; nearby eligibility is an explicit questionnaire choice. */
export function hasRequiredOceanBeach(evidence?: BeachAccessEvidence | null, allowNearby = false): boolean {
  if (!evidence
    || evidence.waterType !== "OCEAN_SEA" || evidence.verified !== true
    || !evidence.beachName?.trim() || !evidence.sourceName?.trim()
    || !evidence.verifiedAt || !Number.isFinite(Date.parse(evidence.verifiedAt))) return false;
  const destination = evidence.accessType === "OCEAN_BEACH_DESTINATION";
  const nearby = allowNearby && evidence.accessType === "OCEAN_BEACH_ACCESS_NEARBY"
    && typeof evidence.driveMinutes === "number" && Number.isFinite(evidence.driveMinutes)
    && evidence.driveMinutes >= 0 && evidence.driveMinutes <= MAX_NEARBY_OCEAN_BEACH_DRIVE_MINUTES;
  if (!destination && !nearby) return false;
  try {
    const url = new URL(evidence.sourceUrl);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch { return false; }
}

/** Bounded proof only. Absence means UNKNOWN, not evidence of no beaches. */
export const verifiedBeachAccessByDestination: Readonly<Partial<Record<string, BeachAccessEvidence>>> = {
  "puerto-vallarta-mx": {
    accessType: "OCEAN_BEACH_DESTINATION", beachName: "Playa Los Muertos", driveMinutes: null,
    waterType: "OCEAN_SEA", verified: true,
    sourceName: "Puerto Vallarta official tourism — Playa Los Muertos",
    sourceUrl: "https://visitapuertovallarta.com.mx/cosas-que-hacer/playas/playa-los-muertos",
    verifiedAt: "2026-09-12",
  },
  "hoi-an-vn": {
    // Ancient Town identity: authority places An Bang 7 km outside it; no drive time inferred.
    accessType: "OCEAN_BEACH_ACCESS_NEARBY", beachName: "An Bang Beach", driveMinutes: null,
    waterType: "OCEAN_SEA", verified: true,
    sourceName: "Vietnam Tourism — beach day outside Hoi An Ancient Town",
    sourceUrl: "https://vietnam.travel/node/575", verifiedAt: "2026-09-12",
  },
  "queenstown-nz": {
    accessType: "LAKE_BEACH_ACCESS", beachName: "Queenstown Bay Beach", driveMinutes: null,
    waterType: "FRESHWATER", verified: true,
    sourceName: "Destination Queenstown — beaches on Lake Whakatipu",
    sourceUrl: "https://www.queenstownnz.co.nz/stories/post/the-best-of-queenstowns-beaches/",
    verifiedAt: "2026-09-12",
  },
  "alicante-spain": {
    accessType: "OCEAN_BEACH_DESTINATION", beachName: "El Postiguet", driveMinutes: null,
    waterType: "OCEAN_SEA", verified: true,
    sourceName: "Spain national tourism — urban El Postiguet beach",
    sourceUrl: "https://www.spain.info/en/beach/postiguet/", verifiedAt: "2026-09-12",
  },
  "gijon-spain": {
    accessType: "OCEAN_BEACH_DESTINATION", beachName: "San Lorenzo", driveMinutes: null,
    waterType: "OCEAN_SEA", verified: true,
    sourceName: "Spain national tourism — San Lorenzo beach in central Gijón",
    sourceUrl: "https://www.spain.info/en/beach/san-lorenzo-gijon/", verifiedAt: "2026-09-12",
  },
  "merida-mexico": {
    accessType: "OCEAN_BEACH_ACCESS_NEARBY", beachName: "Progreso Beach", driveMinutes: 30,
    waterType: "OCEAN_SEA", verified: true,
    sourceName: "Universidad Marista de Mérida — international visitor guide, road access",
    sourceUrl: "https://www.marista.edu.mx/descargar/132", verifiedAt: "2026-09-12",
  },
  "savannah-georgia-united-states": {
    accessType: "OCEAN_BEACH_ACCESS_NEARBY", beachName: "Tybee Island Beach", driveMinutes: 20,
    waterType: "OCEAN_SEA", verified: true,
    sourceName: "Visit Savannah — beach day, drive from historic downtown",
    sourceUrl: "https://visitsavannah.com/list/10-exciting-things-do-savannah", verifiedAt: "2026-09-12",
  },
};
