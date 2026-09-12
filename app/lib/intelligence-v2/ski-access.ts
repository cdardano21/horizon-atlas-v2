export type SkiAccessType = "SKI_RESORT_TOWN" | "SKI_ACCESS_WITHIN_60_MIN" | "NO_QUALIFYING_SKI_ACCESS" | "UNKNOWN";

/** Verified normal-road access from the destination centre, not a winter-condition guarantee. */
export interface SkiAccessEvidence {
  readonly accessType: SkiAccessType;
  /** Separate official evidence for the community classification; required for resort towns. */
  readonly resortTownSourceUrl?: string;
  readonly nearestSkiResortName: string;
  readonly skiResortDriveMinutes: number | null;
  readonly skiAccessVerified: boolean;
  readonly resortType: "OUTDOOR_DOWNHILL" | "CROSS_COUNTRY_ONLY" | "INDOOR_ARTIFICIAL" | "UNKNOWN";
  readonly sourceName: string;
  readonly sourceUrl: string;
  readonly verifiedAt: string;
}

export function hasRequiredSkiAccess(evidence?: SkiAccessEvidence | null): boolean {
  if (!evidence || (evidence.accessType !== "SKI_RESORT_TOWN" && evidence.accessType !== "SKI_ACCESS_WITHIN_60_MIN")
    || evidence.skiAccessVerified !== true || evidence.resortType !== "OUTDOOR_DOWNHILL"
    || !evidence.nearestSkiResortName?.trim() || !evidence.sourceName?.trim()
    || !evidence.verifiedAt || !Number.isFinite(Date.parse(evidence.verifiedAt))
    || typeof evidence.skiResortDriveMinutes !== "number" || !Number.isFinite(evidence.skiResortDriveMinutes)
    || evidence.skiResortDriveMinutes < 0 || evidence.skiResortDriveMinutes > 60) return false;
  try {
    if (evidence.accessType === "SKI_RESORT_TOWN") {
      const townSource = new URL(evidence.resortTownSourceUrl ?? "");
      if (townSource.protocol !== "https:" && townSource.protocol !== "http:") return false;
    }
    const url = new URL(evidence.sourceUrl);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch { return false; }
}

/** Bounded verified seed; absent destinations remain unknown, never inferred from mountain enums. */
export const verifiedSkiAccessByDestination: Readonly<Partial<Record<string, SkiAccessEvidence>>> = {
  "queenstown-nz": {
    accessType: "SKI_RESORT_TOWN",
    resortTownSourceUrl: "https://www.queenstownnz.co.nz/stories/post/planning-a-couples-ski-trip-to-queenstown/",
    nearestSkiResortName: "Coronet Peak",
    skiResortDriveMinutes: 20,
    skiAccessVerified: true,
    resortType: "OUTDOOR_DOWNHILL",
    sourceName: "Coronet Peak — official transport guide (central Queenstown)",
    sourceUrl: "https://www.coronetpeak.co.nz/getting-here-guide",
    verifiedAt: "2026-09-12",
  },
  "reno-nevada-united-states": {
    accessType: "SKI_ACCESS_WITHIN_60_MIN",
    nearestSkiResortName: "Mt. Rose Ski Tahoe",
    skiResortDriveMinutes: 25,
    skiAccessVerified: true,
    resortType: "OUTDOOR_DOWNHILL",
    sourceName: "Mt. Rose Ski Tahoe \u2014 official season passes, Reno access",
    sourceUrl: "https://skirose.com/season-passes/",
    verifiedAt: "2026-09-12",
  },
  "boise-idaho-united-states": {
    accessType: "SKI_ACCESS_WITHIN_60_MIN",
    nearestSkiResortName: "Bogus Basin",
    skiResortDriveMinutes: 45,
    skiAccessVerified: true,
    resortType: "OUTDOOR_DOWNHILL",
    sourceName: "Visit Boise \u2014 downtown Boise to Bogus Basin",
    sourceUrl: "https://visitboise.com/go-from-sun-up-to-sun-down-in-boise/",
    verifiedAt: "2026-09-12",
  },
  "sapporo-japan": {
    accessType: "SKI_ACCESS_WITHIN_60_MIN",
    nearestSkiResortName: "Sapporo Teine",
    skiResortDriveMinutes: 40,
    skiAccessVerified: true,
    resortType: "OUTDOOR_DOWNHILL",
    sourceName: "Sapporo Teine \u2014 official city-centre driving access",
    sourceUrl: "https://sapporo-teine.com/snow/lang/en/access/",
    verifiedAt: "2026-09-12",
  },
  "aosta-italy": {
    accessType: "SKI_ACCESS_WITHIN_60_MIN",
    nearestSkiResortName: "Pila",
    skiResortDriveMinutes: 30,
    skiAccessVerified: true,
    resortType: "OUTDOOR_DOWNHILL",
    sourceName: "Pila \u2014 official road access from Aosta (not gondola time)",
    sourceUrl: "https://pila.it/e-come-raggiungerci/",
    verifiedAt: "2026-09-12",
  },
  "annecy-france": {
    accessType: "SKI_ACCESS_WITHIN_60_MIN",
    nearestSkiResortName: "Semnoz",
    skiResortDriveMinutes: 20,
    skiAccessVerified: true,
    resortType: "OUTDOOR_DOWNHILL",
    sourceName: "Lake Annecy Tourist Office \u2014 winter resorts",
    sourceUrl: "https://www.lac-annecy.com/activites/stations-de-sports-d-hiver/",
    verifiedAt: "2026-09-12",
  },
  "sendai-japan": {
    accessType: "SKI_ACCESS_WITHIN_60_MIN",
    nearestSkiResortName: "Spring Valley Sendai Izumi",
    skiResortDriveMinutes: 40,
    skiAccessVerified: true,
    resortType: "OUTDOOR_DOWNHILL",
    sourceName: "Spring Valley \u2014 official access from central Sendai by car",
    sourceUrl: "https://www.springvalley.co.jp/green/imoni",
    verifiedAt: "2026-09-12",
  },
  "ljubljana-slovenia": {
    accessType: "SKI_ACCESS_WITHIN_60_MIN",
    nearestSkiResortName: "Krvavec",
    skiResortDriveMinutes: 30,
    skiAccessVerified: true,
    resortType: "OUTDOOR_DOWNHILL",
    sourceName: "Visit Ljubljana \u2014 Winter Magic, half-hour drive from Ljubljana",
    sourceUrl: "https://www.visitljubljana.com/en/meetings/planning-an-event/incentive-programmes/winter-magic-in-slovenia",
    verifiedAt: "2026-09-12",
  },
  "radovljica-slovenia": {
    accessType: "SKI_ACCESS_WITHIN_60_MIN",
    nearestSkiResortName: "Kranjska Gora",
    skiResortDriveMinutes: 45,
    skiAccessVerified: true,
    resortType: "OUTDOOR_DOWNHILL",
    sourceName: "Radovljica Tourism \u2014 ski resorts within approximately 45 minutes by road",
    sourceUrl: "https://www.radolca.si/en/blog/why-radovljica-makes-an-excellent-base-for-a-holiday-in-slovenia",
    verifiedAt: "2026-09-12",
  },
  "kanazawa-japan": {
    accessType: "SKI_ACCESS_WITHIN_60_MIN",
    nearestSkiResortName: "Hakusan Seymour",
    skiResortDriveMinutes: 50,
    skiAccessVerified: true,
    resortType: "OUTDOOR_DOWNHILL",
    sourceName: "Kanazawa City Tourism Association \u2014 driving from Kanazawa Station",
    sourceUrl: "https://visitkanazawa.jp/en/feature/detail_83.html",
    verifiedAt: "2026-09-12",
  },
  "takayama-japan": {
    accessType: "SKI_ACCESS_WITHIN_60_MIN",
    nearestSkiResortName: "Mont Deus Hida Kuraiyama Snow Park",
    skiResortDriveMinutes: 20,
    skiAccessVerified: true,
    resortType: "OUTDOOR_DOWNHILL",
    sourceName: "Hida Takayama \u2014 municipal skiing guide, drive from Takayama town",
    sourceUrl: "https://www.hida.jp/english/recreationandleisure/sportsactivities/4000068.html",
    verifiedAt: "2026-09-12",
  },
  "ioannina-greece": {
    accessType: "SKI_ACCESS_WITHIN_60_MIN",
    nearestSkiResortName: "Anilio Park",
    skiResortDriveMinutes: 50,
    skiAccessVerified: true,
    resortType: "OUTDOOR_DOWNHILL",
    sourceName: "Anilio Park \u2014 official ski school, access from Ioannina",
    sourceUrl: "https://www.aniliopark.gr/en/anilio-ski-school/",
    verifiedAt: "2026-09-12",
  },
  "albuquerque-new-mexico-united-states": {
    accessType: "SKI_ACCESS_WITHIN_60_MIN",
    nearestSkiResortName: "Sandia Peak Ski Area",
    skiResortDriveMinutes: 45,
    skiAccessVerified: true,
    resortType: "OUTDOOR_DOWNHILL",
    sourceName: "Sandia Peak — official drive from downtown Albuquerque",
    sourceUrl: "https://www.sandia.ski/first-time-at-sandia",
    verifiedAt: "2026-09-12",
  },
  "aomori-japan": {
    accessType: "SKI_ACCESS_WITHIN_60_MIN",
    nearestSkiResortName: "Moya Hills",
    skiResortDriveMinutes: 30,
    skiAccessVerified: true,
    resortType: "OUTDOOR_DOWNHILL",
    sourceName: "Moya Hills — official car access from Aomori city centre",
    sourceUrl: "https://www.moyahills.jp/acces/acces.html",
    verifiedAt: "2026-09-12",
  },
  "granada-spain": {
    accessType: "SKI_ACCESS_WITHIN_60_MIN",
    nearestSkiResortName: "Sierra Nevada (Pradollano)",
    skiResortDriveMinutes: 45,
    skiAccessVerified: true,
    resortType: "OUTDOOR_DOWNHILL",
    sourceName: "Granada municipal tourism — road access to Sierra Nevada",
    sourceUrl: "https://turismo.granada.org/es/moverte-granada",
    verifiedAt: "2026-09-12",
  },
  "niigata-japan": {
    accessType: "SKI_ACCESS_WITHIN_60_MIN",
    nearestSkiResortName: "Ninox Snow Park",
    skiResortDriveMinutes: 60,
    skiAccessVerified: true,
    resortType: "OUTDOOR_DOWNHILL",
    sourceName: "Ninox Snow Park — official road access from Niigata",
    sourceUrl: "https://www.ninox.co.jp/access/",
    verifiedAt: "2026-09-12",
  },
};
