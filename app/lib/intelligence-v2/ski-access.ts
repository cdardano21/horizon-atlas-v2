/** Verified normal-road access from the destination centre, not a winter-condition guarantee. */
export interface SkiAccessEvidence {
  readonly nearestSkiResortName: string;
  readonly skiResortDriveMinutes: number | null;
  readonly skiAccessVerified: boolean;
  readonly resortType: "OUTDOOR_DOWNHILL" | "CROSS_COUNTRY_ONLY" | "INDOOR_ARTIFICIAL" | "UNKNOWN";
  readonly sourceName: string;
  readonly sourceUrl: string;
  readonly verifiedAt: string;
}

export function hasRequiredSkiAccess(evidence?: SkiAccessEvidence | null): boolean {
  if (!evidence || evidence.skiAccessVerified !== true || evidence.resortType !== "OUTDOOR_DOWNHILL"
    || !evidence.nearestSkiResortName?.trim() || !evidence.sourceName?.trim()
    || !evidence.verifiedAt || !Number.isFinite(Date.parse(evidence.verifiedAt))
    || typeof evidence.skiResortDriveMinutes !== "number" || !Number.isFinite(evidence.skiResortDriveMinutes)
    || evidence.skiResortDriveMinutes < 0 || evidence.skiResortDriveMinutes > 60) return false;
  try {
    const url = new URL(evidence.sourceUrl);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch { return false; }
}

/** Bounded verified seed; absent destinations remain unknown, never inferred from mountain enums. */
export const verifiedSkiAccessByDestination: Readonly<Partial<Record<string, SkiAccessEvidence>>> = {
  "queenstown-nz": {
    nearestSkiResortName: "Coronet Peak",
    skiResortDriveMinutes: 20,
    skiAccessVerified: true,
    resortType: "OUTDOOR_DOWNHILL",
    sourceName: "Coronet Peak — official transport guide (central Queenstown)",
    sourceUrl: "https://www.coronetpeak.co.nz/getting-here-guide",
    verifiedAt: "2026-09-12",
  },
  "reno-nevada-united-states": {
    nearestSkiResortName: "Mt. Rose Ski Tahoe",
    skiResortDriveMinutes: 25,
    skiAccessVerified: true,
    resortType: "OUTDOOR_DOWNHILL",
    sourceName: "Mt. Rose Ski Tahoe \u2014 official season passes, Reno access",
    sourceUrl: "https://skirose.com/season-passes/",
    verifiedAt: "2026-09-12",
  },
  "boise-idaho-united-states": {
    nearestSkiResortName: "Bogus Basin",
    skiResortDriveMinutes: 45,
    skiAccessVerified: true,
    resortType: "OUTDOOR_DOWNHILL",
    sourceName: "Visit Boise \u2014 downtown Boise to Bogus Basin",
    sourceUrl: "https://visitboise.com/go-from-sun-up-to-sun-down-in-boise/",
    verifiedAt: "2026-09-12",
  },
  "sapporo-japan": {
    nearestSkiResortName: "Sapporo Teine",
    skiResortDriveMinutes: 40,
    skiAccessVerified: true,
    resortType: "OUTDOOR_DOWNHILL",
    sourceName: "Sapporo Teine \u2014 official city-centre driving access",
    sourceUrl: "https://sapporo-teine.com/snow/lang/en/access/",
    verifiedAt: "2026-09-12",
  },
  "aosta-italy": {
    nearestSkiResortName: "Pila",
    skiResortDriveMinutes: 30,
    skiAccessVerified: true,
    resortType: "OUTDOOR_DOWNHILL",
    sourceName: "Pila \u2014 official road access from Aosta (not gondola time)",
    sourceUrl: "https://pila.it/e-come-raggiungerci/",
    verifiedAt: "2026-09-12",
  },
  "annecy-france": {
    nearestSkiResortName: "Semnoz",
    skiResortDriveMinutes: 20,
    skiAccessVerified: true,
    resortType: "OUTDOOR_DOWNHILL",
    sourceName: "Lake Annecy Tourist Office \u2014 winter resorts",
    sourceUrl: "https://www.lac-annecy.com/activites/stations-de-sports-d-hiver/",
    verifiedAt: "2026-09-12",
  },
  "sendai-japan": {
    nearestSkiResortName: "Spring Valley Sendai Izumi",
    skiResortDriveMinutes: 40,
    skiAccessVerified: true,
    resortType: "OUTDOOR_DOWNHILL",
    sourceName: "Spring Valley \u2014 official access from central Sendai by car",
    sourceUrl: "https://www.springvalley.co.jp/green/imoni",
    verifiedAt: "2026-09-12",
  },
  "ljubljana-slovenia": {
    nearestSkiResortName: "Krvavec",
    skiResortDriveMinutes: 30,
    skiAccessVerified: true,
    resortType: "OUTDOOR_DOWNHILL",
    sourceName: "Visit Ljubljana \u2014 Winter Magic, half-hour drive from Ljubljana",
    sourceUrl: "https://www.visitljubljana.com/en/meetings/planning-an-event/incentive-programmes/winter-magic-in-slovenia",
    verifiedAt: "2026-09-12",
  },
  "radovljica-slovenia": {
    nearestSkiResortName: "Kranjska Gora",
    skiResortDriveMinutes: 45,
    skiAccessVerified: true,
    resortType: "OUTDOOR_DOWNHILL",
    sourceName: "Radovljica Tourism \u2014 ski resorts within approximately 45 minutes by road",
    sourceUrl: "https://www.radolca.si/en/blog/why-radovljica-makes-an-excellent-base-for-a-holiday-in-slovenia",
    verifiedAt: "2026-09-12",
  },
  "kanazawa-japan": {
    nearestSkiResortName: "Hakusan Seymour",
    skiResortDriveMinutes: 50,
    skiAccessVerified: true,
    resortType: "OUTDOOR_DOWNHILL",
    sourceName: "Kanazawa City Tourism Association \u2014 driving from Kanazawa Station",
    sourceUrl: "https://visitkanazawa.jp/en/feature/detail_83.html",
    verifiedAt: "2026-09-12",
  },
  "takayama-japan": {
    nearestSkiResortName: "Mont Deus Hida Kuraiyama Snow Park",
    skiResortDriveMinutes: 20,
    skiAccessVerified: true,
    resortType: "OUTDOOR_DOWNHILL",
    sourceName: "Hida Takayama \u2014 municipal skiing guide, drive from Takayama town",
    sourceUrl: "https://www.hida.jp/english/recreationandleisure/sportsactivities/4000068.html",
    verifiedAt: "2026-09-12",
  },
  "ioannina-greece": {
    nearestSkiResortName: "Anilio Park",
    skiResortDriveMinutes: 50,
    skiAccessVerified: true,
    resortType: "OUTDOOR_DOWNHILL",
    sourceName: "Anilio Park \u2014 official ski school, access from Ioannina",
    sourceUrl: "https://www.aniliopark.gr/en/anilio-ski-school/",
    verifiedAt: "2026-09-12",
  },
};
