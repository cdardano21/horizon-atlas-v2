import type { ShortlistFacts } from "./evaluator";

export type AffordabilityReadiness = "DIRECT_INDEX_READY" | "LOCAL_EVIDENCE_READY" | "PROXY_REQUIRED" | "INSUFFICIENT_FOR_AFFORDABILITY";
export type LocalCostRow = { category: string; household: string; low: number; high: number; currency: string; verifiedAt: string | null };
export type PrototypeCandidate = ShortlistFacts & { slug: string; country: string; summary: string; affordabilityReadiness: AffordabilityReadiness; normalizedAffordability: { providerId: null; index: null; band: null }; localTotals: Record<string, { monthlyLow: number; monthlyHigh: number; currency: string; verifiedAt: string | null }>; costRows: LocalCostRow[]; costSources: Array<{ name: string; type: string; url: string }> };

export const SMART_SHORTLIST_COHORT_VERSION = "sealed-u1-reconstruction-20260906";
export const smartShortlistCandidates: PrototypeCandidate[] = [
  {
    "key": "the-villages-fl-us",
    "name": "The Villages",
    "slug": "the-villages-florida-united-states",
    "country": "United States",
    "countryCode": "US",
    "beachAccess": "NEARBY",
    "mountainAccess": "NONE",
    "affordability": {},
    "summary": "A vast 55+ master-planned community built around golf-cart mobility, recreation, healthcare access, town squares and an unusually dense social calendar.",
    "affordabilityReadiness": "INSUFFICIENT_FOR_AFFORDABILITY",
    "normalizedAffordability": {
      "providerId": null,
      "index": null,
      "band": null
    },
    "localTotals": {},
    "costRows": [
      {
        "category": "housing",
        "household": "single",
        "low": 1800,
        "high": 3200,
        "currency": "USD",
        "verifiedAt": "2026-08-16"
      },
      {
        "category": "groceries",
        "household": "single",
        "low": 400,
        "high": 650,
        "currency": "USD",
        "verifiedAt": "2026-08-16"
      },
      {
        "category": "utilities",
        "household": "single",
        "low": 200,
        "high": 350,
        "currency": "USD",
        "verifiedAt": "2026-08-16"
      },
      {
        "category": "transportation",
        "household": "single",
        "low": 300,
        "high": 700,
        "currency": "USD",
        "verifiedAt": "2026-08-16"
      },
      {
        "category": "dining",
        "household": "single",
        "low": 300,
        "high": 700,
        "currency": "USD",
        "verifiedAt": "2026-08-16"
      },
      {
        "category": "healthcare",
        "household": "single",
        "low": 250,
        "high": 600,
        "currency": "USD",
        "verifiedAt": "2026-08-16"
      },
      {
        "category": "recreation_amenity",
        "household": "single",
        "low": 204,
        "high": 450,
        "currency": "USD",
        "verifiedAt": "2026-08-16"
      },
      {
        "category": "total_monthly",
        "household": "single",
        "low": 3450,
        "high": 6650,
        "currency": "USD",
        "verifiedAt": "2026-08-16"
      }
    ],
    "costSources": [
      {
        "name": "The Villages Cost of Living",
        "type": "official",
        "url": "https://www.thevillages.com/cost-of-living/"
      }
    ]
  },
  {
    "key": "sofia-bg",
    "name": "Sofia",
    "slug": "sofia-bulgaria",
    "country": "Bulgaria",
    "countryCode": "BG",
    "beachAccess": "NONE",
    "mountainAccess": "SKI_RESORT_ACCESS",
    "affordability": {},
    "summary": "A high-elevation European capital combining metro-connected urban life, Roman and Orthodox heritage, comparatively moderate costs and immediate access to Vitosha Mountain.",
    "affordabilityReadiness": "INSUFFICIENT_FOR_AFFORDABILITY",
    "normalizedAffordability": {
      "providerId": null,
      "index": null,
      "band": null
    },
    "localTotals": {},
    "costRows": [
      {
        "category": "housing",
        "household": "single",
        "low": 650,
        "high": 1200,
        "currency": "EUR",
        "verifiedAt": "2026-08-16"
      },
      {
        "category": "groceries",
        "household": "single",
        "low": 250,
        "high": 400,
        "currency": "EUR",
        "verifiedAt": "2026-08-16"
      },
      {
        "category": "utilities",
        "household": "single",
        "low": 100,
        "high": 180,
        "currency": "EUR",
        "verifiedAt": "2026-08-16"
      },
      {
        "category": "transportation",
        "household": "single",
        "low": 30,
        "high": 80,
        "currency": "EUR",
        "verifiedAt": "2026-08-16"
      },
      {
        "category": "dining",
        "household": "single",
        "low": 180,
        "high": 350,
        "currency": "EUR",
        "verifiedAt": "2026-08-16"
      },
      {
        "category": "healthcare",
        "household": "single",
        "low": 60,
        "high": 200,
        "currency": "EUR",
        "verifiedAt": "2026-08-16"
      },
      {
        "category": "leisure",
        "household": "single",
        "low": 100,
        "high": 250,
        "currency": "EUR",
        "verifiedAt": "2026-08-16"
      },
      {
        "category": "total_monthly",
        "household": "single",
        "low": 1400,
        "high": 2600,
        "currency": "EUR",
        "verifiedAt": "2026-08-16"
      }
    ],
    "costSources": [
      {
        "name": "Numbeo Sofia",
        "type": "reference",
        "url": "https://www.numbeo.com/cost-of-living/in/Sofia/"
      }
    ]
  },
  {
    "key": "puerto-vallarta-mx",
    "name": "Puerto Vallarta",
    "slug": "puerto-vallarta-mexico",
    "country": "Mexico",
    "countryCode": "MX",
    "beachAccess": "DIRECT_ACCESS",
    "mountainAccess": "MOUNTAIN_ACCESS",
    "affordability": {},
    "summary": "A Pacific coast city where a walkable historic center, beaches, strong dining, established expat networks and direct North American air service meet tropical weather.",
    "affordabilityReadiness": "INSUFFICIENT_FOR_AFFORDABILITY",
    "normalizedAffordability": {
      "providerId": null,
      "index": null,
      "band": null
    },
    "localTotals": {},
    "costRows": [
      {
        "category": "housing",
        "household": "single",
        "low": 18000,
        "high": 35000,
        "currency": "MXN",
        "verifiedAt": "2026-08-16"
      },
      {
        "category": "groceries",
        "household": "single",
        "low": 5000,
        "high": 8500,
        "currency": "MXN",
        "verifiedAt": "2026-08-16"
      },
      {
        "category": "utilities",
        "household": "single",
        "low": 1800,
        "high": 4500,
        "currency": "MXN",
        "verifiedAt": "2026-08-16"
      },
      {
        "category": "transportation",
        "household": "single",
        "low": 1500,
        "high": 3500,
        "currency": "MXN",
        "verifiedAt": "2026-08-16"
      },
      {
        "category": "dining",
        "household": "single",
        "low": 4000,
        "high": 9000,
        "currency": "MXN",
        "verifiedAt": "2026-08-16"
      },
      {
        "category": "healthcare",
        "household": "single",
        "low": 1800,
        "high": 5000,
        "currency": "MXN",
        "verifiedAt": "2026-08-16"
      },
      {
        "category": "leisure",
        "household": "single",
        "low": 2500,
        "high": 6000,
        "currency": "MXN",
        "verifiedAt": "2026-08-16"
      },
      {
        "category": "total_monthly",
        "household": "single",
        "low": 35000,
        "high": 65000,
        "currency": "MXN",
        "verifiedAt": "2026-08-16"
      }
    ],
    "costSources": [
      {
        "name": "Numbeo Puerto Vallarta",
        "type": "reference",
        "url": "https://www.numbeo.com/cost-of-living/in/Puerto-Vallarta"
      }
    ]
  },
  {
    "key": "hoi-an-vn",
    "name": "Hoi An",
    "slug": "hoi-an-vietnam",
    "country": "Vietnam",
    "countryCode": "VN",
    "beachAccess": "DIRECT_ACCESS",
    "mountainAccess": "MOUNTAIN_ACCESS",
    "affordability": {},
    "summary": "A compact UNESCO-listed trading-port city with exceptional walkability in the historic core, low everyday costs, beach access and a strong café-and-food culture.",
    "affordabilityReadiness": "INSUFFICIENT_FOR_AFFORDABILITY",
    "normalizedAffordability": {
      "providerId": null,
      "index": null,
      "band": null
    },
    "localTotals": {},
    "costRows": [
      {
        "category": "housing",
        "household": "single",
        "low": 8000000,
        "high": 18000000,
        "currency": "VND",
        "verifiedAt": "2026-08-16"
      },
      {
        "category": "groceries",
        "household": "single",
        "low": 4000000,
        "high": 7000000,
        "currency": "VND",
        "verifiedAt": "2026-08-16"
      },
      {
        "category": "utilities",
        "household": "single",
        "low": 1500000,
        "high": 3000000,
        "currency": "VND",
        "verifiedAt": "2026-08-16"
      },
      {
        "category": "transportation",
        "household": "single",
        "low": 1000000,
        "high": 3000000,
        "currency": "VND",
        "verifiedAt": "2026-08-16"
      },
      {
        "category": "dining",
        "household": "single",
        "low": 3000000,
        "high": 6000000,
        "currency": "VND",
        "verifiedAt": "2026-08-16"
      },
      {
        "category": "healthcare",
        "household": "single",
        "low": 1000000,
        "high": 3000000,
        "currency": "VND",
        "verifiedAt": "2026-08-16"
      },
      {
        "category": "leisure",
        "household": "single",
        "low": 2000000,
        "high": 5000000,
        "currency": "VND",
        "verifiedAt": "2026-08-16"
      },
      {
        "category": "total_monthly",
        "household": "single",
        "low": 22000000,
        "high": 42000000,
        "currency": "VND",
        "verifiedAt": "2026-08-16"
      }
    ],
    "costSources": [
      {
        "name": "Numbeo Hoi An",
        "type": "reference",
        "url": "https://www.numbeo.com/cost-of-living/in/Hoi-An-Vietnam"
      }
    ]
  },
  {
    "key": "queenstown-nz",
    "name": "Queenstown",
    "slug": "queenstown-new-zealand",
    "country": "New Zealand",
    "countryCode": "NZ",
    "beachAccess": "DIRECT_ACCESS",
    "mountainAccess": "SKI_RESORT_ACCESS",
    "affordability": {},
    "summary": "A spectacular Southern Alps lake town with world-class outdoor recreation, strong tourism infrastructure, excellent safety and a severe housing-cost premium.",
    "affordabilityReadiness": "INSUFFICIENT_FOR_AFFORDABILITY",
    "normalizedAffordability": {
      "providerId": null,
      "index": null,
      "band": null
    },
    "localTotals": {},
    "costRows": [
      {
        "category": "housing",
        "household": "single",
        "low": 2600,
        "high": 4200,
        "currency": "NZD",
        "verifiedAt": "2026-08-16"
      },
      {
        "category": "groceries",
        "household": "single",
        "low": 650,
        "high": 900,
        "currency": "NZD",
        "verifiedAt": "2026-08-16"
      },
      {
        "category": "utilities",
        "household": "single",
        "low": 250,
        "high": 400,
        "currency": "NZD",
        "verifiedAt": "2026-08-16"
      },
      {
        "category": "transportation",
        "household": "single",
        "low": 250,
        "high": 550,
        "currency": "NZD",
        "verifiedAt": "2026-08-16"
      },
      {
        "category": "dining",
        "household": "single",
        "low": 450,
        "high": 900,
        "currency": "NZD",
        "verifiedAt": "2026-08-16"
      },
      {
        "category": "healthcare",
        "household": "single",
        "low": 100,
        "high": 250,
        "currency": "NZD",
        "verifiedAt": "2026-08-16"
      },
      {
        "category": "leisure",
        "household": "single",
        "low": 300,
        "high": 800,
        "currency": "NZD",
        "verifiedAt": "2026-08-16"
      },
      {
        "category": "total_monthly",
        "household": "single",
        "low": 4700,
        "high": 7800,
        "currency": "NZD",
        "verifiedAt": "2026-08-16"
      }
    ],
    "costSources": [
      {
        "name": "Numbeo Queenstown",
        "type": "reference",
        "url": "https://www.numbeo.com/cost-of-living/in/Queenstown"
      }
    ]
  },
  {
    "key": "ascoli-piceno-it",
    "name": "Ascoli Piceno",
    "slug": "ascoli-piceno-italy",
    "country": "Italy",
    "countryCode": "IT",
    "beachAccess": "NEARBY",
    "mountainAccess": "MOUNTAIN_ACCESS",
    "affordability": {},
    "summary": "Elegant travertine city in southern Marche combining a walkable historic center, food culture and Apennine access.",
    "affordabilityReadiness": "INSUFFICIENT_FOR_AFFORDABILITY",
    "normalizedAffordability": {
      "providerId": null,
      "index": null,
      "band": null
    },
    "localTotals": {},
    "costRows": [
      {
        "category": "total",
        "household": "couple",
        "low": 2200,
        "high": 3000,
        "currency": "EUR",
        "verifiedAt": "2026-08-23"
      }
    ],
    "costSources": []
  },
  {
    "key": "sarande-al",
    "name": "Sarandë",
    "slug": "sarande-albania",
    "country": "Albania",
    "countryCode": "AL",
    "beachAccess": "DIRECT_ACCESS",
    "mountainAccess": "MOUNTAIN_ACCESS",
    "affordability": {},
    "summary": "Ionian coastal city with a long promenade, seasonal international energy and comparatively moderate living costs.",
    "affordabilityReadiness": "INSUFFICIENT_FOR_AFFORDABILITY",
    "normalizedAffordability": {
      "providerId": null,
      "index": null,
      "band": null
    },
    "localTotals": {},
    "costRows": [
      {
        "category": "total",
        "household": "couple",
        "low": 1850,
        "high": 2650,
        "currency": "EUR",
        "verifiedAt": "2026-08-23"
      }
    ],
    "costSources": []
  },
  {
    "key": "dumaguete-ph",
    "name": "Dumaguete City",
    "slug": "dumaguete-philippines",
    "country": "Philippines",
    "countryCode": "PH",
    "beachAccess": "NEARBY",
    "mountainAccess": "MOUNTAIN_ACCESS",
    "affordability": {},
    "summary": "English-usable university city with a strong retiree community, regional healthcare and attractive Philippine living costs.",
    "affordabilityReadiness": "INSUFFICIENT_FOR_AFFORDABILITY",
    "normalizedAffordability": {
      "providerId": null,
      "index": null,
      "band": null
    },
    "localTotals": {},
    "costRows": [
      {
        "category": "total",
        "household": "couple",
        "low": 85000,
        "high": 130000,
        "currency": "PHP",
        "verifiedAt": "2026-08-23"
      }
    ],
    "costSources": [
      {
        "name": "Philippine Retirement Authority — current SRRV options and requirements",
        "type": "official",
        "url": "https://pra.gov.ph/srrvisa"
      }
    ]
  },
  {
    "key": "las-terrenas-do",
    "name": "Las Terrenas",
    "slug": "las-terrenas-dominican-republic",
    "country": "Dominican Republic",
    "countryCode": "DO",
    "beachAccess": "DIRECT_ACCESS",
    "mountainAccess": "MOUNTAIN_ACCESS",
    "affordability": {},
    "summary": "International Caribbean beach town with multiple residential zones, foreign ownership rights and pensioner residence paths.",
    "affordabilityReadiness": "INSUFFICIENT_FOR_AFFORDABILITY",
    "normalizedAffordability": {
      "providerId": null,
      "index": null,
      "band": null
    },
    "localTotals": {},
    "costRows": [
      {
        "category": "total",
        "household": "couple",
        "low": 2250,
        "high": 3400,
        "currency": "USD",
        "verifiedAt": "2026-08-23"
      }
    ],
    "costSources": [
      {
        "name": "DGII — Law 171-07 first-property transfer-tax exemption",
        "type": "official",
        "url": "https://ayuda.dgii.gov.do/conversations/discusiones/exencin-del-3-por-transferencia-inmobiliaria-ipi-extranjero-visa-rentista/65b17bb9ab59de79d2a1c1cd"
      },
      {
        "name": "Dominican Migration — rentista residence",
        "type": "official",
        "url": "https://migracion.gob.do/servicio/residencia-por-inversion-en-calidad-de-rentista/"
      },
      {
        "name": "DGII — 2026 individual income-tax scale",
        "type": "official",
        "url": "https://dgii.gov.do/cicloContribuyente/obligacionesTributarias/principalesImpuestos/Paginas/impuestoSobreRenta.aspx"
      }
    ]
  },
  {
    "key": "fairhope-al-us",
    "name": "Fairhope",
    "slug": "fairhope-alabama",
    "country": "United States",
    "countryCode": "US",
    "beachAccess": "DIRECT_ACCESS",
    "mountainAccess": "NONE",
    "affordability": {},
    "summary": "Polished Mobile Bay community with a walkable downtown, golf, parks, arts and a full-service local hospital.",
    "affordabilityReadiness": "INSUFFICIENT_FOR_AFFORDABILITY",
    "normalizedAffordability": {
      "providerId": null,
      "index": null,
      "band": null
    },
    "localTotals": {},
    "costRows": [
      {
        "category": "total",
        "household": "couple",
        "low": 4500,
        "high": 6500,
        "currency": "USD",
        "verifiedAt": "2026-08-23"
      }
    ],
    "costSources": [
      {
        "name": "Zillow — Fairhope housing values and rents, July 2026",
        "type": "reference",
        "url": "https://www.zillow.com/home-values/4660/fairhope-al/"
      },
      {
        "name": "Zillow — Fairhope rental manager trends, August 2026",
        "type": "reference",
        "url": "https://www.zillow.com/rental-manager/market-trends/fairhope-al/"
      },
      {
        "name": "Redfin — Fairhope housing market, June 2026",
        "type": "reference",
        "url": "https://www.redfin.com/city/6502/AL/Fairhope/housing-market"
      }
    ]
  },
  {
    "key": "the-hague-netherlands",
    "name": "The Hague",
    "slug": "the-hague-netherlands",
    "country": "Netherlands",
    "countryCode": "NL",
    "beachAccess": "DIRECT_ACCESS",
    "mountainAccess": "NONE",
    "affordability": {},
    "summary": "International seat of government with tram-served neighborhoods, North Sea beaches, major museums and a calmer daily rhythm than Amsterdam.",
    "affordabilityReadiness": "INSUFFICIENT_FOR_AFFORDABILITY",
    "normalizedAffordability": {
      "providerId": null,
      "index": null,
      "band": null
    },
    "localTotals": {},
    "costRows": [
      {
        "category": "total_planning_band",
        "household": "single",
        "low": 2700,
        "high": 3200,
        "currency": "USD",
        "verifiedAt": "2026-08-30"
      },
      {
        "category": "total_planning_band",
        "household": "couple",
        "low": 3480,
        "high": 4130,
        "currency": "USD",
        "verifiedAt": "2026-08-30"
      },
      {
        "category": "total_planning_band",
        "household": "family4",
        "low": 6660,
        "high": 7660,
        "currency": "USD",
        "verifiedAt": "2026-08-30"
      },
      {
        "category": "rent_1br_center",
        "household": "single",
        "low": 1233,
        "high": 1667,
        "currency": "USD",
        "verifiedAt": "2026-08-30"
      },
      {
        "category": "rent_1br_outside",
        "household": "single",
        "low": 935,
        "high": 1265,
        "currency": "USD",
        "verifiedAt": "2026-08-30"
      },
      {
        "category": "rent_3br_center",
        "household": "family4",
        "low": 2363,
        "high": 3197,
        "currency": "USD",
        "verifiedAt": "2026-08-30"
      }
    ],
    "costSources": []
  },
  {
    "key": "san-ramon-costa-rica",
    "name": "San Ramón",
    "slug": "san-ramon-costa-rica",
    "country": "Costa Rica",
    "countryCode": "CR",
    "beachAccess": "NONE",
    "mountainAccess": "MOUNTAIN_ACCESS",
    "affordability": {},
    "summary": "Cooler coffee-country town with a walkable center, regional hospital and authentic Costa Rican daily life, balanced by rain, Spanish dependence and limited urban amenities.",
    "affordabilityReadiness": "INSUFFICIENT_FOR_AFFORDABILITY",
    "normalizedAffordability": {
      "providerId": null,
      "index": null,
      "band": null
    },
    "localTotals": {},
    "costRows": [],
    "costSources": []
  },
  {
    "key": "st-john-s-canada",
    "name": "St. John's",
    "slug": "st-john-s-canada",
    "country": "Canada",
    "countryCode": "CA",
    "beachAccess": "DIRECT_ACCESS",
    "mountainAccess": "NONE",
    "affordability": {},
    "summary": "Colourful Atlantic capital with serious coastal hiking, universities, healthcare and nightlife, offset by wind, fog, winter weather and geographic isolation.",
    "affordabilityReadiness": "INSUFFICIENT_FOR_AFFORDABILITY",
    "normalizedAffordability": {
      "providerId": null,
      "index": null,
      "band": null
    },
    "localTotals": {},
    "costRows": [],
    "costSources": []
  },
  {
    "key": "santa-fe-new-mexico-united-states",
    "name": "Santa Fe",
    "slug": "santa-fe-new-mexico-united-states",
    "country": "United States",
    "countryCode": "US",
    "beachAccess": "NONE",
    "mountainAccess": "SKI_RESORT_ACCESS",
    "affordability": {},
    "summary": "Adobe state capital with an outsized art, food and museum scene, immediate mountain access and significant housing, altitude and healthcare tradeoffs.",
    "affordabilityReadiness": "INSUFFICIENT_FOR_AFFORDABILITY",
    "normalizedAffordability": {
      "providerId": null,
      "index": null,
      "band": null
    },
    "localTotals": {},
    "costRows": [],
    "costSources": []
  },
  {
    "key": "st-cloud-minnesota-united-states",
    "name": "St. Cloud",
    "slug": "st-cloud-minnesota-united-states",
    "country": "United States",
    "countryCode": "US",
    "beachAccess": "NONE",
    "mountainAccess": "NONE",
    "affordability": {},
    "summary": "Central Minnesota service hub on the Mississippi with attainable housing, strong healthcare, colleges and excellent regional trails—but severe winters and car dependence.",
    "affordabilityReadiness": "INSUFFICIENT_FOR_AFFORDABILITY",
    "normalizedAffordability": {
      "providerId": null,
      "index": null,
      "band": null
    },
    "localTotals": {},
    "costRows": [],
    "costSources": []
  },
  {
    "key": "kyoto-japan",
    "name": "Kyoto",
    "slug": "kyoto-japan",
    "country": "Japan",
    "countryCode": "JP",
    "beachAccess": "NONE",
    "mountainAccess": "MOUNTAIN_ACCESS",
    "affordability": {},
    "summary": "Japan’s former imperial capital: temple districts, university neighborhoods, exceptional rail access and intense seasonal tourism inside a hot-summer basin.",
    "affordabilityReadiness": "INSUFFICIENT_FOR_AFFORDABILITY",
    "normalizedAffordability": {
      "providerId": null,
      "index": null,
      "band": null
    },
    "localTotals": {},
    "costRows": [
      {
        "category": "total_planning_band",
        "household": "single",
        "low": 1920,
        "high": 2420,
        "currency": "USD",
        "verifiedAt": "2026-08-30"
      },
      {
        "category": "total_planning_band",
        "household": "couple",
        "low": 2600,
        "high": 3250,
        "currency": "USD",
        "verifiedAt": "2026-08-30"
      },
      {
        "category": "total_planning_band",
        "household": "family4",
        "low": 5290,
        "high": 6290,
        "currency": "USD",
        "verifiedAt": "2026-08-30"
      },
      {
        "category": "rent_1br_center",
        "household": "single",
        "low": 706,
        "high": 954,
        "currency": "USD",
        "verifiedAt": "2026-08-30"
      },
      {
        "category": "rent_1br_outside",
        "household": "single",
        "low": 553,
        "high": 747,
        "currency": "USD",
        "verifiedAt": "2026-08-30"
      },
      {
        "category": "rent_3br_center",
        "household": "family4",
        "low": 1199,
        "high": 1621,
        "currency": "USD",
        "verifiedAt": "2026-08-30"
      }
    ],
    "costSources": []
  },
  {
    "key": "ajijic-mexico",
    "name": "Ajijic",
    "slug": "ajijic-mexico",
    "country": "Mexico",
    "countryCode": "MX",
    "beachAccess": "NONE",
    "mountainAccess": "MOUNTAIN_ACCESS",
    "affordability": {},
    "summary": "A colorful Lake Chapala village known for cobblestone streets, a lively arts community, mild highland weather, and one of Mexico's most established international-resident networks. Guadalajara broadens airport and specialist-care access.",
    "affordabilityReadiness": "PROXY_REQUIRED",
    "normalizedAffordability": {
      "providerId": null,
      "index": null,
      "band": null
    },
    "localTotals": {
      "couple": {
        "monthlyLow": 31000,
        "monthlyHigh": 61500,
        "currency": "MXN",
        "verifiedAt": "2026-08-31"
      },
      "single": {
        "monthlyLow": 25000,
        "monthlyHigh": 45000,
        "currency": "MXN",
        "verifiedAt": "2026-08-31"
      }
    },
    "costRows": [
      {
        "category": "dining",
        "household": "single",
        "low": 3000,
        "high": 6000,
        "currency": "MXN",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "groceries",
        "household": "single",
        "low": 4000,
        "high": 7000,
        "currency": "MXN",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "healthcare",
        "household": "single",
        "low": 1500,
        "high": 3500,
        "currency": "MXN",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "housing",
        "household": "single",
        "low": 10000,
        "high": 20000,
        "currency": "MXN",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "leisure",
        "household": "single",
        "low": 2000,
        "high": 4000,
        "currency": "MXN",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "total_monthly_budget",
        "household": "couple",
        "low": 31000,
        "high": 61500,
        "currency": "MXN",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "transportation",
        "household": "single",
        "low": 1000,
        "high": 2500,
        "currency": "MXN",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "utilities",
        "household": "single",
        "low": 1500,
        "high": 3000,
        "currency": "MXN",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "total_monthly_budget",
        "household": "single",
        "low": 25000,
        "high": 45000,
        "currency": "MXN",
        "verifiedAt": "2026-08-31"
      }
    ],
    "costSources": []
  },
  {
    "key": "boquete-panama",
    "name": "Boquete",
    "slug": "boquete-panama",
    "country": "Panama",
    "countryCode": "PA",
    "beachAccess": "NONE",
    "mountainAccess": "MOUNTAIN_ACCESS",
    "affordability": {},
    "summary": "A green highland town surrounded by coffee farms, cloud-forest trails, and mountain scenery, with a cooler climate and an established international community. David supplies broader shopping and specialist services.",
    "affordabilityReadiness": "INSUFFICIENT_FOR_AFFORDABILITY",
    "normalizedAffordability": {
      "providerId": null,
      "index": null,
      "band": null
    },
    "localTotals": {},
    "costRows": [
      {
        "category": "dining",
        "household": "single",
        "low": 150,
        "high": 350,
        "currency": "USD",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "groceries",
        "household": "single",
        "low": 250,
        "high": 400,
        "currency": "USD",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "healthcare",
        "household": "single",
        "low": 80,
        "high": 200,
        "currency": "USD",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "housing",
        "household": "single",
        "low": 500,
        "high": 1000,
        "currency": "USD",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "leisure",
        "household": "single",
        "low": 100,
        "high": 250,
        "currency": "USD",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "total_monthly_budget",
        "household": "couple",
        "low": 1650,
        "high": 3400,
        "currency": "USD",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "transportation",
        "household": "single",
        "low": 60,
        "high": 150,
        "currency": "USD",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "utilities",
        "household": "single",
        "low": 80,
        "high": 150,
        "currency": "USD",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "total_monthly_budget",
        "household": "single",
        "low": 1200,
        "high": 2200,
        "currency": "USD",
        "verifiedAt": "2026-08-31"
      }
    ],
    "costSources": [
      {
        "name": "mida.gob.pa",
        "type": "official_agriculture",
        "url": "https://mida.gob.pa/direccion-ejecutiva-de-cuarentena-agropecuaria/"
      }
    ]
  },
  {
    "key": "chiang-mai-thailand",
    "name": "Chiang Mai",
    "slug": "chiang-mai-thailand",
    "country": "Thailand",
    "countryCode": "TH",
    "beachAccess": "NONE",
    "mountainAccess": "MOUNTAIN_ACCESS",
    "affordability": {},
    "summary": "Northern Thailand's cultural capital offers temples, markets, mountain access, healthcare, cafés, and creative energy—alongside a serious seasonal smoke problem. Neighborhood choice and season matter enormously here.",
    "affordabilityReadiness": "PROXY_REQUIRED",
    "normalizedAffordability": {
      "providerId": null,
      "index": null,
      "band": null
    },
    "localTotals": {
      "couple": {
        "monthlyLow": 32500,
        "monthlyHigh": 64000,
        "currency": "THB",
        "verifiedAt": "2026-08-31"
      },
      "single": {
        "monthlyLow": 25000,
        "monthlyHigh": 50000,
        "currency": "THB",
        "verifiedAt": "2026-08-31"
      }
    },
    "costRows": [
      {
        "category": "dining",
        "household": "single",
        "low": 4000,
        "high": 8000,
        "currency": "THB",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "groceries",
        "household": "single",
        "low": 4000,
        "high": 7000,
        "currency": "THB",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "healthcare",
        "household": "single",
        "low": 1500,
        "high": 3000,
        "currency": "THB",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "housing",
        "household": "single",
        "low": 10000,
        "high": 20000,
        "currency": "THB",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "leisure",
        "household": "single",
        "low": 2000,
        "high": 4000,
        "currency": "THB",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "total_monthly_budget",
        "household": "couple",
        "low": 32500,
        "high": 64000,
        "currency": "THB",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "transportation",
        "household": "single",
        "low": 1000,
        "high": 2500,
        "currency": "THB",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "utilities",
        "household": "single",
        "low": 1500,
        "high": 3000,
        "currency": "THB",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "total_monthly_budget",
        "household": "single",
        "low": 25000,
        "high": 50000,
        "currency": "THB",
        "verifiedAt": "2026-08-31"
      }
    ],
    "costSources": []
  },
  {
    "key": "cuenca-ecuador",
    "name": "Cuenca",
    "slug": "cuenca-ecuador",
    "country": "Ecuador",
    "countryCode": "EC",
    "beachAccess": "NONE",
    "mountainAccess": "MOUNTAIN_ACCESS",
    "affordability": {},
    "summary": "A cultured Andean city of rivers, plazas, markets, and historic architecture, offering an urban lifestyle at high elevation with a well-established international community. The tram and river corridors shape everyday movement.",
    "affordabilityReadiness": "PROXY_REQUIRED",
    "normalizedAffordability": {
      "providerId": null,
      "index": null,
      "band": null
    },
    "localTotals": {
      "couple": {
        "monthlyLow": 1400,
        "monthlyHigh": 2700,
        "currency": "USD",
        "verifiedAt": "2026-08-31"
      },
      "single": {
        "monthlyLow": 1000,
        "monthlyHigh": 1800,
        "currency": "USD",
        "verifiedAt": "2026-08-31"
      }
    },
    "costRows": [
      {
        "category": "dining",
        "household": "single",
        "low": 150,
        "high": 300,
        "currency": "USD",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "groceries",
        "household": "single",
        "low": 200,
        "high": 350,
        "currency": "USD",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "healthcare",
        "household": "single",
        "low": 80,
        "high": 180,
        "currency": "USD",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "housing",
        "household": "single",
        "low": 400,
        "high": 700,
        "currency": "USD",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "leisure",
        "household": "single",
        "low": 100,
        "high": 200,
        "currency": "USD",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "total_monthly_budget",
        "household": "couple",
        "low": 1400,
        "high": 2700,
        "currency": "USD",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "transportation",
        "household": "single",
        "low": 40,
        "high": 100,
        "currency": "USD",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "utilities",
        "household": "single",
        "low": 60,
        "high": 120,
        "currency": "USD",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "total_monthly_budget",
        "household": "single",
        "low": 1000,
        "high": 1800,
        "currency": "USD",
        "verifiedAt": "2026-08-31"
      }
    ],
    "costSources": []
  },
  {
    "key": "da-nang-vietnam",
    "name": "Da Nang",
    "slug": "da-nang-vietnam",
    "country": "Vietnam",
    "countryCode": "VN",
    "beachAccess": "DIRECT_ACCESS",
    "mountainAccess": "MOUNTAIN_ACCESS",
    "affordability": {},
    "summary": "A fast-growing Vietnamese coastal city with a broad urban beach, riverfront districts, excellent regional access, abundant food, and a modern everyday pace. Its airport makes regional travel unusually convenient.",
    "affordabilityReadiness": "PROXY_REQUIRED",
    "normalizedAffordability": {
      "providerId": null,
      "index": null,
      "band": null
    },
    "localTotals": {
      "couple": {
        "monthlyLow": 25100000,
        "monthlyHigh": 47800000,
        "currency": "VND",
        "verifiedAt": "2026-08-31"
      },
      "single": {
        "monthlyLow": 20000000,
        "monthlyHigh": 35000000,
        "currency": "VND",
        "verifiedAt": "2026-08-31"
      }
    },
    "costRows": [
      {
        "category": "dining",
        "household": "single",
        "low": 3000000,
        "high": 6000000,
        "currency": "VND",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "groceries",
        "household": "single",
        "low": 3000000,
        "high": 5000000,
        "currency": "VND",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "healthcare",
        "household": "single",
        "low": 1000000,
        "high": 2500000,
        "currency": "VND",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "housing",
        "household": "single",
        "low": 8000000,
        "high": 15000000,
        "currency": "VND",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "leisure",
        "household": "single",
        "low": 1500000,
        "high": 3000000,
        "currency": "VND",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "total_monthly_budget",
        "household": "couple",
        "low": 25100000,
        "high": 47800000,
        "currency": "VND",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "transportation",
        "household": "single",
        "low": 800000,
        "high": 1500000,
        "currency": "VND",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "utilities",
        "household": "single",
        "low": 1500000,
        "high": 2500000,
        "currency": "VND",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "total_monthly_budget",
        "household": "single",
        "low": 20000000,
        "high": 35000000,
        "currency": "VND",
        "verifiedAt": "2026-08-31"
      }
    ],
    "costSources": []
  },
  {
    "key": "florianopolis-brazil",
    "name": "Florianópolis",
    "slug": "florianopolis-brazil",
    "country": "Brazil",
    "countryCode": "BR",
    "beachAccess": "DIRECT_ACCESS",
    "mountainAccess": "MOUNTAIN_ACCESS",
    "affordability": {},
    "summary": "An island-and-mainland city celebrated for beaches, trails, lagoons, surfing, and technology, with neighborhood lifestyles ranging from urban to distinctly coastal. Island traffic makes neighborhood choice especially important.",
    "affordabilityReadiness": "PROXY_REQUIRED",
    "normalizedAffordability": {
      "providerId": null,
      "index": null,
      "band": null
    },
    "localTotals": {
      "couple": {
        "monthlyLow": 7950,
        "monthlyHigh": 15500,
        "currency": "BRL",
        "verifiedAt": "2026-08-31"
      },
      "single": {
        "monthlyLow": 6000,
        "monthlyHigh": 11000,
        "currency": "BRL",
        "verifiedAt": "2026-08-31"
      }
    },
    "costRows": [
      {
        "category": "dining",
        "household": "single",
        "low": 800,
        "high": 1600,
        "currency": "BRL",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "groceries",
        "household": "single",
        "low": 900,
        "high": 1500,
        "currency": "BRL",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "healthcare",
        "household": "single",
        "low": 500,
        "high": 1000,
        "currency": "BRL",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "housing",
        "household": "single",
        "low": 2500,
        "high": 5000,
        "currency": "BRL",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "leisure",
        "household": "single",
        "low": 500,
        "high": 1000,
        "currency": "BRL",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "total_monthly_budget",
        "household": "couple",
        "low": 7950,
        "high": 15500,
        "currency": "BRL",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "transportation",
        "household": "single",
        "low": 300,
        "high": 600,
        "currency": "BRL",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "utilities",
        "household": "single",
        "low": 400,
        "high": 700,
        "currency": "BRL",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "total_monthly_budget",
        "household": "single",
        "low": 6000,
        "high": 11000,
        "currency": "BRL",
        "verifiedAt": "2026-08-31"
      }
    ],
    "costSources": []
  },
  {
    "key": "funchal-portugal",
    "name": "Funchal",
    "slug": "funchal-portugal",
    "country": "Portugal",
    "countryCode": "PT",
    "beachAccess": "DIRECT_ACCESS",
    "mountainAccess": "MOUNTAIN_ACCESS",
    "affordability": {},
    "summary": "Madeira's subtropical capital rises from the Atlantic in steep, garden-filled neighborhoods, offering urban services, dramatic scenery, and year-round outdoor access. Steep slopes make address selection unusually consequential.",
    "affordabilityReadiness": "PROXY_REQUIRED",
    "normalizedAffordability": {
      "providerId": null,
      "index": null,
      "band": null
    },
    "localTotals": {
      "couple": {
        "monthlyLow": 2000,
        "monthlyHigh": 3650,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      "single": {
        "monthlyLow": 1400,
        "monthlyHigh": 2400,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      }
    },
    "costRows": [
      {
        "category": "dining",
        "household": "single",
        "low": 200,
        "high": 400,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "groceries",
        "household": "single",
        "low": 250,
        "high": 400,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "healthcare",
        "household": "single",
        "low": 60,
        "high": 150,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "housing",
        "household": "single",
        "low": 700,
        "high": 1200,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "leisure",
        "household": "single",
        "low": 150,
        "high": 300,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "total_monthly_budget",
        "household": "couple",
        "low": 2000,
        "high": 3650,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "transportation",
        "household": "single",
        "low": 60,
        "high": 120,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "utilities",
        "household": "single",
        "low": 100,
        "high": 180,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "total_monthly_budget",
        "household": "single",
        "low": 1400,
        "high": 2400,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      }
    ],
    "costSources": []
  },
  {
    "key": "george-town-malaysia",
    "name": "George Town",
    "slug": "george-town-malaysia",
    "country": "Malaysia",
    "countryCode": "MY",
    "beachAccess": "DIRECT_ACCESS",
    "mountainAccess": "MOUNTAIN_ACCESS",
    "affordability": {},
    "summary": "Penang's heritage capital combines celebrated street food, multicultural neighborhoods, historic architecture, modern hospitals, and island access in a hot tropical setting. The wider Penang urban area extends well beyond the old town.",
    "affordabilityReadiness": "LOCAL_EVIDENCE_READY",
    "normalizedAffordability": {
      "providerId": null,
      "index": null,
      "band": null
    },
    "localTotals": {
      "couple": {
        "monthlyLow": 6000,
        "monthlyHigh": 11500,
        "currency": "MYR",
        "verifiedAt": "2026-08-31"
      },
      "single": {
        "monthlyLow": 4500,
        "monthlyHigh": 8000,
        "currency": "MYR",
        "verifiedAt": "2026-08-31"
      }
    },
    "costRows": [
      {
        "category": "dining",
        "household": "single",
        "low": 700,
        "high": 1400,
        "currency": "MYR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "groceries",
        "household": "single",
        "low": 700,
        "high": 1200,
        "currency": "MYR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "healthcare",
        "household": "single",
        "low": 250,
        "high": 600,
        "currency": "MYR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "housing",
        "household": "single",
        "low": 2000,
        "high": 3800,
        "currency": "MYR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "leisure",
        "household": "single",
        "low": 350,
        "high": 700,
        "currency": "MYR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "total_monthly_budget",
        "household": "couple",
        "low": 6000,
        "high": 11500,
        "currency": "MYR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "transportation",
        "household": "single",
        "low": 250,
        "high": 500,
        "currency": "MYR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "utilities",
        "household": "single",
        "low": 250,
        "high": 450,
        "currency": "MYR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "total_monthly_budget",
        "household": "single",
        "low": 4500,
        "high": 8000,
        "currency": "MYR",
        "verifiedAt": "2026-08-31"
      }
    ],
    "costSources": [
      {
        "name": "kpkt.gov.my",
        "type": "official_housing_ministry",
        "url": "https://www.kpkt.gov.my"
      }
    ]
  },
  {
    "key": "hua-hin-thailand",
    "name": "Hua Hin",
    "slug": "hua-hin-thailand",
    "country": "Thailand",
    "countryCode": "TH",
    "beachAccess": "DIRECT_ACCESS",
    "mountainAccess": "MOUNTAIN_ACCESS",
    "affordability": {},
    "summary": "A long-established Thai beach city known for golf, markets, hospitals, seafood, and relatively easy access to Bangkok, with a relaxed but seasonal rhythm. Central and outlying districts function very differently.",
    "affordabilityReadiness": "PROXY_REQUIRED",
    "normalizedAffordability": {
      "providerId": null,
      "index": null,
      "band": null
    },
    "localTotals": {
      "couple": {
        "monthlyLow": 40000,
        "monthlyHigh": 74000,
        "currency": "THB",
        "verifiedAt": "2026-08-31"
      },
      "single": {
        "monthlyLow": 30000,
        "monthlyHigh": 55000,
        "currency": "THB",
        "verifiedAt": "2026-08-31"
      }
    },
    "costRows": [
      {
        "category": "dining",
        "household": "single",
        "low": 5000,
        "high": 9000,
        "currency": "THB",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "groceries",
        "household": "single",
        "low": 4500,
        "high": 8000,
        "currency": "THB",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "healthcare",
        "household": "single",
        "low": 2000,
        "high": 4000,
        "currency": "THB",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "housing",
        "household": "single",
        "low": 12000,
        "high": 22000,
        "currency": "THB",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "leisure",
        "household": "single",
        "low": 2500,
        "high": 5000,
        "currency": "THB",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "total_monthly_budget",
        "household": "couple",
        "low": 40000,
        "high": 74000,
        "currency": "THB",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "transportation",
        "household": "single",
        "low": 1500,
        "high": 3000,
        "currency": "THB",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "utilities",
        "household": "single",
        "low": 2000,
        "high": 3500,
        "currency": "THB",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "total_monthly_budget",
        "household": "single",
        "low": 30000,
        "high": 55000,
        "currency": "THB",
        "verifiedAt": "2026-08-31"
      }
    ],
    "costSources": []
  },
  {
    "key": "lucca-italy",
    "name": "Lucca",
    "slug": "lucca-italy",
    "country": "Italy",
    "countryCode": "IT",
    "beachAccess": "DIRECT_ACCESS",
    "mountainAccess": "MOUNTAIN_ACCESS",
    "affordability": {},
    "summary": "A refined Tuscan city enclosed by Renaissance walls, with a walkable center, cycling, music, markets, and rail access to Pisa and Florence. Life inside and outside the walls feels meaningfully different.",
    "affordabilityReadiness": "LOCAL_EVIDENCE_READY",
    "normalizedAffordability": {
      "providerId": null,
      "index": null,
      "band": null
    },
    "localTotals": {
      "couple": {
        "monthlyLow": 2250,
        "monthlyHigh": 4050,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      "single": {
        "monthlyLow": 1600,
        "monthlyHigh": 2700,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      }
    },
    "costRows": [
      {
        "category": "dining",
        "household": "single",
        "low": 250,
        "high": 450,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "groceries",
        "household": "single",
        "low": 280,
        "high": 450,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "healthcare",
        "household": "single",
        "low": 60,
        "high": 150,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "housing",
        "household": "single",
        "low": 800,
        "high": 1400,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "leisure",
        "household": "single",
        "low": 150,
        "high": 300,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "total_monthly_budget",
        "household": "couple",
        "low": 2250,
        "high": 4050,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "transportation",
        "household": "single",
        "low": 60,
        "high": 120,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "utilities",
        "household": "single",
        "low": 120,
        "high": 200,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "total_monthly_budget",
        "household": "single",
        "low": 1600,
        "high": 2700,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      }
    ],
    "costSources": [
      {
        "name": "agenziaentrate.gov.it",
        "type": "official_tax_authority",
        "url": "https://www.agenziaentrate.gov.it/portale/agenzia/amministrazione-trasparente/servizi-erogati/carta-servizi/servizi-per-gli-stranieri/services-for-foreign-citizens"
      },
      {
        "name": "idealista.it",
        "type": "property_portal_market_indicator",
        "url": "https://www.idealista.it/valutazione-di-immobili/lucca-lucca"
      }
    ]
  },
  {
    "key": "merida-mexico",
    "name": "Mérida",
    "slug": "merida-mexico",
    "country": "Mexico",
    "countryCode": "MX",
    "beachAccess": "NEARBY",
    "mountainAccess": "NONE",
    "affordability": {},
    "summary": "Yucatán's gracious capital blends Maya heritage, colonial architecture, neighborhood markets, strong regional healthcare, and an active cultural calendar with serious tropical heat. Its neighborhoods offer sharply different versions of city life.",
    "affordabilityReadiness": "PROXY_REQUIRED",
    "normalizedAffordability": {
      "providerId": null,
      "index": null,
      "band": null
    },
    "localTotals": {
      "couple": {
        "monthlyLow": 28500,
        "monthlyHigh": 55500,
        "currency": "MXN",
        "verifiedAt": "2026-08-31"
      },
      "single": {
        "monthlyLow": 22000,
        "monthlyHigh": 40000,
        "currency": "MXN",
        "verifiedAt": "2026-08-31"
      }
    },
    "costRows": [
      {
        "category": "dining",
        "household": "single",
        "low": 2500,
        "high": 5000,
        "currency": "MXN",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "groceries",
        "household": "single",
        "low": 3500,
        "high": 6000,
        "currency": "MXN",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "healthcare",
        "household": "single",
        "low": 1500,
        "high": 3000,
        "currency": "MXN",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "housing",
        "household": "single",
        "low": 9000,
        "high": 18000,
        "currency": "MXN",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "leisure",
        "household": "single",
        "low": 2000,
        "high": 3800,
        "currency": "MXN",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "total_monthly_budget",
        "household": "couple",
        "low": 28500,
        "high": 55500,
        "currency": "MXN",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "transportation",
        "household": "single",
        "low": 1000,
        "high": 2200,
        "currency": "MXN",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "utilities",
        "household": "single",
        "low": 1800,
        "high": 3500,
        "currency": "MXN",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "total_monthly_budget",
        "household": "single",
        "low": 22000,
        "high": 40000,
        "currency": "MXN",
        "verifiedAt": "2026-08-31"
      }
    ],
    "costSources": []
  },
  {
    "key": "monopoli-italy",
    "name": "Monopoli",
    "slug": "monopoli-italy",
    "country": "Italy",
    "countryCode": "IT",
    "beachAccess": "DIRECT_ACCESS",
    "mountainAccess": "NONE",
    "affordability": {},
    "summary": "A working Adriatic port city in Puglia where a whitewashed old town, small beaches, seafood, and rail links support an appealing coastal routine. Its winter rhythm is quieter and more locally focused.",
    "affordabilityReadiness": "LOCAL_EVIDENCE_READY",
    "normalizedAffordability": {
      "providerId": null,
      "index": null,
      "band": null
    },
    "localTotals": {
      "couple": {
        "monthlyLow": 2050,
        "monthlyHigh": 3700,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      "single": {
        "monthlyLow": 1400,
        "monthlyHigh": 2400,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      }
    },
    "costRows": [
      {
        "category": "dining",
        "household": "single",
        "low": 220,
        "high": 400,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "groceries",
        "household": "single",
        "low": 280,
        "high": 450,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "healthcare",
        "household": "single",
        "low": 60,
        "high": 150,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "housing",
        "household": "single",
        "low": 650,
        "high": 1150,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "leisure",
        "household": "single",
        "low": 150,
        "high": 300,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "total_monthly_budget",
        "household": "couple",
        "low": 2050,
        "high": 3700,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "transportation",
        "household": "single",
        "low": 60,
        "high": 120,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "utilities",
        "household": "single",
        "low": 110,
        "high": 190,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "total_monthly_budget",
        "household": "single",
        "low": 1400,
        "high": 2400,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      }
    ],
    "costSources": [
      {
        "name": "agenziaentrate.gov.it",
        "type": "official_tax_authority",
        "url": "https://www.agenziaentrate.gov.it/portale/agenzia/amministrazione-trasparente/servizi-erogati/carta-servizi/servizi-per-gli-stranieri/services-for-foreign-citizens"
      },
      {
        "name": "idealista.it",
        "type": "property_portal_market_indicator",
        "url": "https://www.idealista.it/valutazione-di-immobili/monopoli-bari"
      },
      {
        "name": "comune.monopoli.ba.it",
        "type": "official_municipal_civil_protection_plan",
        "url": "https://www.comune.monopoli.ba.it/Amministrazione-Trasparente/Interventi-straordinari-e-di-emergenza/Piano-di-Protezione-Civile-Comunale-edizione-2016"
      }
    ]
  },
  {
    "key": "montevideo-uruguay",
    "name": "Montevideo",
    "slug": "montevideo-uruguay",
    "country": "Uruguay",
    "countryCode": "UY",
    "beachAccess": "DIRECT_ACCESS",
    "mountainAccess": "NONE",
    "affordability": {},
    "summary": "Uruguay's relaxed coastal capital pairs long Rambla walks, distinctive neighborhoods, cultural life, and strong urban services with a comparatively high regional cost of living. Each major neighborhood has a notably different personality.",
    "affordabilityReadiness": "PROXY_REQUIRED",
    "normalizedAffordability": {
      "providerId": null,
      "index": null,
      "band": null
    },
    "localTotals": {
      "couple": {
        "monthlyLow": 74000,
        "monthlyHigh": 135000,
        "currency": "UYU",
        "verifiedAt": "2026-08-31"
      },
      "single": {
        "monthlyLow": 55000,
        "monthlyHigh": 95000,
        "currency": "UYU",
        "verifiedAt": "2026-08-31"
      }
    },
    "costRows": [
      {
        "category": "dining",
        "household": "single",
        "low": 8000,
        "high": 14000,
        "currency": "UYU",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "groceries",
        "household": "single",
        "low": 9000,
        "high": 15000,
        "currency": "UYU",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "healthcare",
        "household": "single",
        "low": 4000,
        "high": 8000,
        "currency": "UYU",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "housing",
        "household": "single",
        "low": 22000,
        "high": 40000,
        "currency": "UYU",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "leisure",
        "household": "single",
        "low": 5000,
        "high": 9000,
        "currency": "UYU",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "total_monthly_budget",
        "household": "couple",
        "low": 74000,
        "high": 135000,
        "currency": "UYU",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "transportation",
        "household": "single",
        "low": 2500,
        "high": 5000,
        "currency": "UYU",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "utilities",
        "household": "single",
        "low": 4000,
        "high": 7000,
        "currency": "UYU",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "total_monthly_budget",
        "household": "single",
        "low": 55000,
        "high": 95000,
        "currency": "UYU",
        "verifiedAt": "2026-08-31"
      }
    ],
    "costSources": []
  },
  {
    "key": "nafplio-greece",
    "name": "Nafplio",
    "slug": "nafplio-greece",
    "country": "Greece",
    "countryCode": "GR",
    "beachAccess": "DIRECT_ACCESS",
    "mountainAccess": "MOUNTAIN_ACCESS",
    "affordability": {},
    "summary": "A picturesque Peloponnese seafront city with a walkable old town, fortress views, café-lined squares, and easy access to major archaeological sites. Its quieter off-season character deserves equal attention.",
    "affordabilityReadiness": "LOCAL_EVIDENCE_READY",
    "normalizedAffordability": {
      "providerId": null,
      "index": null,
      "band": null
    },
    "localTotals": {
      "couple": {
        "monthlyLow": 1900,
        "monthlyHigh": 3400,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      "single": {
        "monthlyLow": 1300,
        "monthlyHigh": 2200,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      }
    },
    "costRows": [
      {
        "category": "dining",
        "household": "single",
        "low": 200,
        "high": 380,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "groceries",
        "household": "single",
        "low": 250,
        "high": 400,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "healthcare",
        "household": "single",
        "low": 60,
        "high": 140,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "housing",
        "household": "single",
        "low": 600,
        "high": 1050,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "leisure",
        "household": "single",
        "low": 130,
        "high": 260,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "total_monthly_budget",
        "household": "couple",
        "low": 1900,
        "high": 3400,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "transportation",
        "household": "single",
        "low": 60,
        "high": 120,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "utilities",
        "household": "single",
        "low": 110,
        "high": 190,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "total_monthly_budget",
        "household": "single",
        "low": 1300,
        "high": 2200,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      }
    ],
    "costSources": [
      {
        "name": "spitogatos.gr",
        "type": "property_portal_live_inventory",
        "url": "https://www.spitogatos.gr/en/to_rent-homes/nafplio"
      }
    ]
  },
  {
    "key": "nice-france",
    "name": "Nice",
    "slug": "nice-france",
    "country": "France",
    "countryCode": "FR",
    "beachAccess": "DIRECT_ACCESS",
    "mountainAccess": "MOUNTAIN_ACCESS",
    "affordability": {},
    "summary": "A sophisticated Mediterranean city with beaches, markets, museums, tram service, a major airport, and effortless access to the French Riviera and nearby Italy. Neighborhood selection can reduce both cost and crowding.",
    "affordabilityReadiness": "LOCAL_EVIDENCE_READY",
    "normalizedAffordability": {
      "providerId": null,
      "index": null,
      "band": null
    },
    "localTotals": {
      "couple": {
        "monthlyLow": 3150,
        "monthlyHigh": 5750,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      "single": {
        "monthlyLow": 2200,
        "monthlyHigh": 3800,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      }
    },
    "costRows": [
      {
        "category": "dining",
        "household": "single",
        "low": 350,
        "high": 650,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "groceries",
        "household": "single",
        "low": 350,
        "high": 550,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "healthcare",
        "household": "single",
        "low": 70,
        "high": 160,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "housing",
        "household": "single",
        "low": 1200,
        "high": 2200,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "leisure",
        "household": "single",
        "low": 250,
        "high": 500,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "total_monthly_budget",
        "household": "couple",
        "low": 3150,
        "high": 5750,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "transportation",
        "household": "single",
        "low": 80,
        "high": 150,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "utilities",
        "household": "single",
        "low": 130,
        "high": 220,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "total_monthly_budget",
        "household": "single",
        "low": 2200,
        "high": 3800,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      }
    ],
    "costSources": [
      {
        "name": "observatoires-des-loyers.org",
        "type": "official_local_rent_observatory",
        "url": "https://www.observatoires-des-loyers.org/connaitre-les-loyers/carte-des-niveaux-de-loyers/departement-des-alpes-maritimes/nice-06088"
      },
      {
        "name": "nice.fr",
        "type": "official_municipal_family_services_directory",
        "url": "https://www.nice.fr/type-lieu/lieux-daccueil-enfant-parent-laep/"
      }
    ]
  },
  {
    "key": "palm-springs-california-united-states",
    "name": "Palm Springs",
    "slug": "palm-springs-california-united-states",
    "country": "United States",
    "countryCode": "US",
    "beachAccess": "NONE",
    "mountainAccess": "MOUNTAIN_ACCESS",
    "affordability": {},
    "summary": "A design-forward desert city known for mid-century architecture, mountain views, golf, LGBTQ+ community life, and winter sunshine—balanced by extreme summer heat. Seasonal population changes are part of its identity.",
    "affordabilityReadiness": "LOCAL_EVIDENCE_READY",
    "normalizedAffordability": {
      "providerId": null,
      "index": null,
      "band": null
    },
    "localTotals": {
      "couple": {
        "monthlyLow": 4600,
        "monthlyHigh": 8500,
        "currency": "USD",
        "verifiedAt": "2026-08-31"
      },
      "single": {
        "monthlyLow": 3200,
        "monthlyHigh": 5500,
        "currency": "USD",
        "verifiedAt": "2026-08-31"
      }
    },
    "costRows": [
      {
        "category": "dining",
        "household": "single",
        "low": 400,
        "high": 750,
        "currency": "USD",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "groceries",
        "household": "single",
        "low": 400,
        "high": 650,
        "currency": "USD",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "healthcare",
        "household": "single",
        "low": 250,
        "high": 500,
        "currency": "USD",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "housing",
        "household": "single",
        "low": 1800,
        "high": 3200,
        "currency": "USD",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "leisure",
        "household": "single",
        "low": 300,
        "high": 600,
        "currency": "USD",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "total_monthly_budget",
        "household": "couple",
        "low": 4600,
        "high": 8500,
        "currency": "USD",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "transportation",
        "household": "single",
        "low": 200,
        "high": 400,
        "currency": "USD",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "utilities",
        "household": "single",
        "low": 200,
        "high": 400,
        "currency": "USD",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "total_monthly_budget",
        "household": "single",
        "low": 3200,
        "high": 5500,
        "currency": "USD",
        "verifiedAt": "2026-08-31"
      }
    ],
    "costSources": [
      {
        "name": "palmspringsca.gov",
        "type": "official_city",
        "url": "https://www.palmspringsca.gov/government/departments/special-program-compliance/vacation-rentals"
      }
    ]
  },
  {
    "key": "paphos-cyprus",
    "name": "Paphos",
    "slug": "paphos-cyprus",
    "country": "Cyprus",
    "countryCode": "CY",
    "beachAccess": "DIRECT_ACCESS",
    "mountainAccess": "NONE",
    "affordability": {},
    "summary": "A sunny Cypriot coastal city combining archaeological sites, beaches, an international community, and its own airport with a spread-out, car-oriented layout. Coastal, central, and hillside communities function quite differently.",
    "affordabilityReadiness": "LOCAL_EVIDENCE_READY",
    "normalizedAffordability": {
      "providerId": null,
      "index": null,
      "band": null
    },
    "localTotals": {
      "couple": {
        "monthlyLow": 2150,
        "monthlyHigh": 3950,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      "single": {
        "monthlyLow": 1500,
        "monthlyHigh": 2500,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      }
    },
    "costRows": [
      {
        "category": "dining",
        "household": "single",
        "low": 220,
        "high": 420,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "groceries",
        "household": "single",
        "low": 280,
        "high": 450,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "healthcare",
        "household": "single",
        "low": 70,
        "high": 160,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "housing",
        "household": "single",
        "low": 700,
        "high": 1250,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "leisure",
        "household": "single",
        "low": 150,
        "high": 300,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "total_monthly_budget",
        "household": "couple",
        "low": 2150,
        "high": 3950,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "transportation",
        "household": "single",
        "low": 70,
        "high": 140,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "utilities",
        "household": "single",
        "low": 130,
        "high": 220,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "total_monthly_budget",
        "household": "single",
        "low": 1500,
        "high": 2500,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      }
    ],
    "costSources": [
      {
        "name": "cystatdb23px.cystat.gov.cy",
        "type": "official_national_statistics",
        "url": "https://cystatdb23px.cystat.gov.cy/pxweb/en/8.CYSTAT-DB/8.CYSTAT-DB__Population__Census%20of%20Population%20and%20Housing%202021__Population__Population%20-%20Place%20of%20Residence/1891108E.px/"
      },
      {
        "name": "cystatdb23px.cystat.gov.cy",
        "type": "official_national_statistics",
        "url": "https://cystatdb23px.cystat.gov.cy/pxweb/en/8.CYSTAT-DB/8.CYSTAT-DB__Population__Census%20of%20Population%20and%20Housing%202021__Households__Households%20-%20Household%20Size/1895114E.px/"
      },
      {
        "name": "cystatdb23px.cystat.gov.cy",
        "type": "official_national_statistics",
        "url": "https://cystatdb23px.cystat.gov.cy/pxweb/en/8.CYSTAT-DB/8.CYSTAT-DB__Population__Census%20of%20Population%20and%20Housing%202021__Population__Population%20-%20Country%20of%20Citizenship%2C%20Country%20of%20Birth/1891213E.px/"
      }
    ]
  },
  {
    "key": "santander-spain",
    "name": "Santander",
    "slug": "santander-spain",
    "country": "Spain",
    "countryCode": "ES",
    "beachAccess": "DIRECT_ACCESS",
    "mountainAccess": "MOUNTAIN_ACCESS",
    "affordability": {},
    "summary": "A green northern Spanish bay city with beaches, promenades, cultural institutions, healthcare, and a cooler Atlantic climate than the Mediterranean coast. Its Atlantic weather creates a distinctly greener lifestyle.",
    "affordabilityReadiness": "LOCAL_EVIDENCE_READY",
    "normalizedAffordability": {
      "providerId": null,
      "index": null,
      "band": null
    },
    "localTotals": {
      "couple": {
        "monthlyLow": 2150,
        "monthlyHigh": 3850,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      "single": {
        "monthlyLow": 1500,
        "monthlyHigh": 2600,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      }
    },
    "costRows": [
      {
        "category": "dining",
        "household": "single",
        "low": 220,
        "high": 420,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "groceries",
        "household": "single",
        "low": 280,
        "high": 450,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "healthcare",
        "household": "single",
        "low": 60,
        "high": 140,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "housing",
        "household": "single",
        "low": 750,
        "high": 1300,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "leisure",
        "household": "single",
        "low": 150,
        "high": 300,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "total_monthly_budget",
        "household": "couple",
        "low": 2150,
        "high": 3850,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "transportation",
        "household": "single",
        "low": 60,
        "high": 120,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "utilities",
        "household": "single",
        "low": 110,
        "high": 190,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "total_monthly_budget",
        "household": "single",
        "low": 1500,
        "high": 2600,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      }
    ],
    "costSources": [
      {
        "name": "idealista.com",
        "type": "property_portal_market_indicator",
        "url": "https://www.idealista.com/valoracion-de-inmuebles/santander-cantabria"
      }
    ]
  },
  {
    "key": "savannah-georgia-united-states",
    "name": "Savannah",
    "slug": "savannah-georgia-united-states",
    "country": "United States",
    "countryCode": "US",
    "beachAccess": "DIRECT_ACCESS",
    "mountainAccess": "NONE",
    "affordability": {},
    "summary": "A deeply atmospheric Southern city of live-oak squares, historic architecture, art, food, and riverfront energy, with heat, humidity, storms, and tourism to consider. Block-level conditions matter more than the postcard image suggests.",
    "affordabilityReadiness": "LOCAL_EVIDENCE_READY",
    "normalizedAffordability": {
      "providerId": null,
      "index": null,
      "band": null
    },
    "localTotals": {
      "couple": {
        "monthlyLow": 3700,
        "monthlyHigh": 6900,
        "currency": "USD",
        "verifiedAt": "2026-08-31"
      },
      "single": {
        "monthlyLow": 2600,
        "monthlyHigh": 4400,
        "currency": "USD",
        "verifiedAt": "2026-08-31"
      }
    },
    "costRows": [
      {
        "category": "dining",
        "household": "single",
        "low": 300,
        "high": 600,
        "currency": "USD",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "groceries",
        "household": "single",
        "low": 350,
        "high": 550,
        "currency": "USD",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "healthcare",
        "household": "single",
        "low": 200,
        "high": 450,
        "currency": "USD",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "housing",
        "household": "single",
        "low": 1400,
        "high": 2500,
        "currency": "USD",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "leisure",
        "household": "single",
        "low": 250,
        "high": 500,
        "currency": "USD",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "total_monthly_budget",
        "household": "couple",
        "low": 3700,
        "high": 6900,
        "currency": "USD",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "transportation",
        "household": "single",
        "low": 150,
        "high": 300,
        "currency": "USD",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "utilities",
        "household": "single",
        "low": 180,
        "high": 320,
        "currency": "USD",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "total_monthly_budget",
        "household": "single",
        "low": 2600,
        "high": 4400,
        "currency": "USD",
        "verifiedAt": "2026-08-31"
      }
    ],
    "costSources": [
      {
        "name": "savannahga.gov",
        "type": "official_city",
        "url": "https://www.savannahga.gov/484/Housing-Department"
      }
    ]
  },
  {
    "key": "sibenik-croatia",
    "name": "Šibenik",
    "slug": "sibenik-croatia",
    "country": "Croatia",
    "countryCode": "HR",
    "beachAccess": "DIRECT_ACCESS",
    "mountainAccess": "NONE",
    "affordability": {},
    "summary": "A compact Adriatic city of stone lanes, fortresses, waterfront life, and island access, positioned between the coast and Krka National Park. The difference between summer and winter is substantial.",
    "affordabilityReadiness": "PROXY_REQUIRED",
    "normalizedAffordability": {
      "providerId": null,
      "index": null,
      "band": null
    },
    "localTotals": {
      "couple": {
        "monthlyLow": 1650,
        "monthlyHigh": 3050,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      "single": {
        "monthlyLow": 1100,
        "monthlyHigh": 1900,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      }
    },
    "costRows": [
      {
        "category": "dining",
        "household": "single",
        "low": 180,
        "high": 340,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "groceries",
        "household": "single",
        "low": 220,
        "high": 380,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "healthcare",
        "household": "single",
        "low": 50,
        "high": 120,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "housing",
        "household": "single",
        "low": 500,
        "high": 900,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "leisure",
        "household": "single",
        "low": 120,
        "high": 240,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "total_monthly_budget",
        "household": "couple",
        "low": 1650,
        "high": 3050,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "transportation",
        "household": "single",
        "low": 50,
        "high": 100,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "utilities",
        "household": "single",
        "low": 100,
        "high": 170,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      },
      {
        "category": "total_monthly_budget",
        "household": "single",
        "low": 1100,
        "high": 1900,
        "currency": "EUR",
        "verifiedAt": "2026-08-31"
      }
    ],
    "costSources": []
  }
];
