import type { OwnedAffordabilityRecord } from "./owned-affordability";

const estimate = (destinationKey: string, singleMonthlyUsd: number, coupleMonthlyUsd: number): OwnedAffordabilityRecord => ({
  destinationKey,
  singleMonthlyUsd,
  coupleMonthlyUsd,
  estimateYear: 2026,
});

export const ownedAffordabilityRecords: readonly OwnedAffordabilityRecord[] = Object.freeze([
  estimate("the-villages-fl-us", 4400, 6900),
  estimate("sofia-bg", 1850, 2950),
  estimate("puerto-vallarta-mx", 2850, 4550),
  estimate("hoi-an-vn", 1500, 2400),
  estimate("queenstown-nz", 4250, 6700),
  estimate("ascoli-piceno-it", 2200, 3500),
  estimate("sarande-al", 1650, 2650),
  estimate("dumaguete-ph", 1250, 2000),
  estimate("las-terrenas-do", 2250, 3600),
  estimate("fairhope-al-us", 3500, 5500),
  estimate("the-hague-netherlands", 2950, 3800),
  estimate("san-ramon-costa-rica", 2500, 4000),
  estimate("st-john-s-canada", 3650, 5750),
  estimate("santa-fe-new-mexico-united-states", 4750, 7450),
  estimate("st-cloud-minnesota-united-states", 3500, 5500),
  estimate("kyoto-japan", 2200, 2950),
  estimate("ajijic-mexico", 2050, 3250),
  estimate("boquete-panama", 2150, 3450),
  estimate("chiang-mai-thailand", 1450, 2300),
  estimate("cuenca-ecuador", 1600, 2550),
  estimate("da-nang-vietnam", 1350, 2150),
  estimate("florianopolis-brazil", 2650, 4200),
  estimate("funchal-portugal", 3000, 4800),
  estimate("george-town-malaysia", 1750, 2800),
  estimate("hua-hin-thailand", 1700, 2700),
  estimate("lucca-italy", 2600, 4150),
  estimate("merida-mexico", 2100, 3350),
  estimate("monopoli-italy", 2450, 3900),
  estimate("montevideo-uruguay", 2750, 4400),
  estimate("nafplio-greece", 2350, 3750),
  estimate("nice-france", 4000, 6300),
  estimate("palm-springs-california-united-states", 4650, 7300),
  estimate("paphos-cyprus", 2550, 4050),
  estimate("santander-spain", 2900, 4600),
  estimate("savannah-georgia-united-states", 4100, 6450),
  estimate("sibenik-croatia", 2300, 3650),
]);

export const ownedAffordabilityByDestination = new Map(
  ownedAffordabilityRecords.map((record) => [record.destinationKey, record]),
);