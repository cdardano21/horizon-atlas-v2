import type {
  CommandMetric,
  MonthlyClimateRow,
  NamedRecord,
  ResourceRecord,
  ScorecardEntry,
  VerificationMeta,
} from "./destination-command-center";

export type LocalCommandCenterSeed = {
  region?: string | null;
  lastVerifiedAt?: string | null;
  dataConfidence?: "high" | "medium" | "low";
  quickMetrics?: CommandMetric[];
  scorecard?: ScorecardEntry[];
  monthlyClimate?: MonthlyClimateRow[];
  costOfLiving?: CommandMetric[];
  housingMetrics?: CommandMetric[];
  neighborhoods?: NamedRecord[];
  healthcareFacilities?: NamedRecord[];
  airports?: NamedRecord[];
  golfCourses?: NamedRecord[];
  recreationFacilities?: NamedRecord[];
  beaches?: NamedRecord[];
  foodSpots?: NamedRecord[];
  schools?: NamedRecord[];
  internetMetrics?: CommandMetric[];
  visaPrograms?: NamedRecord[];
  taxRules?: NamedRecord[];
  safetyMetrics?: CommandMetric[];
  foodMetrics?: CommandMetric[];
  practicalInfo?: NamedRecord[];
  pros?: string[];
  tradeoffs?: string[];
  resources?: ResourceRecord[];
};

const verification = (
  sourceUrl: string,
  sourceOrganization: string,
  sourceType: string,
  confidenceLevel: "high" | "medium" | "low",
  verificationStatus: "verified" | "estimated",
  lastVerifiedAt: string,
): VerificationMeta => ({
  sourceUrl,
  sourceOrganization,
  sourceType,
  confidenceLevel,
  verificationStatus,
  lastVerifiedAt,
});

const metric = (
  key: string,
  label: string,
  displayValue: string,
  details: VerificationMeta,
  value?: string,
  unit?: string,
): CommandMetric => ({
  key,
  label,
  value: value ?? displayValue,
  unit: unit ?? null,
  displayValue,
  verification: details,
});

const row = (
  id: string,
  name: string,
  subtitle: string,
  value1: string,
  value2: string,
  value3: string,
  url: string,
  details: VerificationMeta,
  mapQuery?: string,
  mapZoom?: number,
): NamedRecord => ({
  id,
  name,
  subtitle,
  value1,
  value2,
  value3,
  url,
  mapQuery: mapQuery ?? null,
  mapZoom: mapZoom ?? null,
  verification: details,
});

const score = (
  category: string,
  numericScore: number,
  explanation: string,
  underlyingMeasurements: string,
  details: VerificationMeta,
): ScorecardEntry => ({
  category,
  score: numericScore,
  explanation,
  underlyingMeasurements,
  personalizedWeight: null,
  verification: details,
});

const resource = (
  id: string,
  category: string,
  title: string,
  description: string,
  url: string,
  sourceType: string,
  verifiedAt: string,
): ResourceRecord => ({
  id,
  category,
  title,
  description,
  url,
  sourceType,
  verifiedAt,
});

const tivatAirportVerification = verification(
  "https://en.wikipedia.org/wiki/Tivat_Airport",
  "Wikipedia / Airports of Montenegro references",
  "encyclopedia",
  "medium",
  "estimated",
  "2026-07-21",
);

const tivatGeoVerification = verification(
  "https://en.wikipedia.org/wiki/Tivat",
  "Wikipedia / MONSTAT references",
  "encyclopedia",
  "medium",
  "estimated",
  "2026-06-04",
);

const numbeoCostVerification = verification(
  "https://www.numbeo.com/cost-of-living/in/Tivat-Montenegro",
  "Numbeo",
  "user_contributed_database",
  "medium",
  "estimated",
  "2026-07-21",
);

const numbeoPropertyVerification = verification(
  "https://www.numbeo.com/property-investment/in/Tivat-Montenegro",
  "Numbeo",
  "user_contributed_database",
  "medium",
  "estimated",
  "2026-07-21",
);

const numbeoCrimeVerification = verification(
  "https://www.numbeo.com/crime/in/Tivat-Montenegro",
  "Numbeo",
  "user_contributed_database",
  "medium",
  "estimated",
  "2024-07-02",
);

const numbeoHealthVerification = verification(
  "https://www.numbeo.com/health-care/in/Tivat-Montenegro",
  "Numbeo",
  "user_contributed_database",
  "medium",
  "estimated",
  "2024-06-28",
);

const numbeoPollutionVerification = verification(
  "https://www.numbeo.com/pollution/in/Tivat-Montenegro",
  "Numbeo",
  "user_contributed_database",
  "medium",
  "estimated",
  "2020-11-03",
);

const weatherVerification = verification(
  "https://www.weather2travel.com/montenegro/tivat/climate/",
  "Weather2Travel",
  "climate_guide",
  "medium",
  "estimated",
  "2026-07-24",
);

const portoVerification = verification(
  "https://www.portomontenegro.com/",
  "Porto Montenegro",
  "official_site",
  "high",
  "verified",
  "2026-07-24",
);

const portoNeighborhoodsVerification = verification(
  "https://www.portomontenegro.com/about/",
  "Porto Montenegro",
  "official_site",
  "high",
  "verified",
  "2026-07-25",
);

const portoMarinaVerification = verification(
  "https://www.portomontenegro.com/marina/",
  "Porto Montenegro",
  "official_site",
  "high",
  "verified",
  "2026-07-24",
);

const lusticaVerification = verification(
  "https://lusticabay.com/the-peaks-lustica-bay-en/",
  "Luštica Bay",
  "official_site",
  "high",
  "verified",
  "2026-07-24",
);

const ksiVerification = verification(
  "https://www.ksi-montenegro.com/",
  "KSI Montenegro",
  "official_site",
  "high",
  "verified",
  "2026-07-24",
);

const rovinjCultureVerification = verification(
  "https://www.rovinj-tourism.com/en/discover/art-and-culture",
  "Tourist Board of Rovinj-Rovigno",
  "official_site",
  "medium",
  "verified",
  "2026-07-25",
);

const rovinjNatureVerification = verification(
  "https://www.rovinj-tourism.com/en/discover/nature",
  "Tourist Board of Rovinj-Rovigno",
  "official_site",
  "medium",
  "verified",
  "2026-07-25",
);

const rovinjJourneyVerification = verification(
  "https://www.rovinj-tourism.com/en/plan-your-journey",
  "Tourist Board of Rovinj-Rovigno",
  "official_site",
  "medium",
  "verified",
  "2026-07-25",
);

const cavtatGeoVerification = verification(
  "https://en.wikipedia.org/wiki/Cavtat",
  "Wikipedia",
  "encyclopedia",
  "medium",
  "estimated",
  "2026-07-26",
);

const cavtatKonavleVerification = verification(
  "https://en.wikipedia.org/wiki/Konavle",
  "Wikipedia",
  "encyclopedia",
  "medium",
  "estimated",
  "2026-07-26",
);
const cavtatAirportVerification = verification(
  "https://www.airport-dubrovnik.hr/",
  "Dubrovnik Airport",
  "official_site",
  "high",
  "verified",
  "2026-07-26",
);
const cavtatHealthcareVerification = verification(
  "https://hzzo.hr/en/",
  "Croatian Health Insurance Fund",
  "official_site",
  "high",
  "verified",
  "2026-07-26",
);
const cavtatTaxVerification = verification(
  "https://taxsummaries.pwc.com/croatia/individual/residence",
  "PwC Tax Summaries",
  "tax_summary",
  "high",
  "verified",
  "2026-07-26",
);

const cavtatMapsVerification = verification(
  "https://www.google.com/maps/search/cavtat+restaurants",
  "Google Maps",
  "directory",
  "medium",
  "estimated",
  "2026-07-26",
);

const cavtatInternetVerification = verification(
  "https://www.numbeo.com/cost-of-living/in/Dubrovnik",
  "Numbeo",
  "user_contributed_database",
  "medium",
  "estimated",
  "2026-07-26",
);

const cavtatClimateVerification = verification(
  "https://www.weather2travel.com/croatia/dubrovnik/climate/",
  "Weather2Travel",
  "climate_guide",
  "medium",
  "estimated",
  "2026-07-26",
);

const cavtatCostVerification = verification(
  "https://www.numbeo.com/cost-of-living/in/Dubrovnik",
  "Numbeo",
  "user_contributed_database",
  "medium",
  "estimated",
  "2026-07-26",
);

const portoPortugalVerification = verification(
  "https://visitporto.travel/en-GB",
  "Visit Porto",
  "official_site",
  "medium",
  "verified",
  "2026-07-27",
);

const lisbonVerification = verification(
  "https://www.visitlisboa.com/en",
  "Visit Lisboa",
  "official_site",
  "medium",
  "verified",
  "2026-07-27",
);

const materaVerification = verification(
  "https://www.italia.it/en/basilicata/matera",
  "Italia.it",
  "official_site",
  "medium",
  "verified",
  "2026-07-27",
);

const triesteVerification = verification(
  "https://www.turismofvg.it/en/trieste",
  "Turismo FVG",
  "official_site",
  "medium",
  "verified",
  "2026-07-27",
);

const chiangMaiVerification = verification(
  "https://www.tourismthailand.org/Destinations/Provinces/Chiang-Mai/101",
  "Tourism Authority of Thailand",
  "official_site",
  "medium",
  "verified",
  "2026-07-27",
);

const bragaVerification = verification(
  "https://www.visitbraga.travel/en",
  "Visit Braga",
  "official_site",
  "medium",
  "verified",
  "2026-07-27",
);

const zadarVerification = verification(
  "https://www.zadar.travel/en",
  "Zadar Tourist Board",
  "official_site",
  "medium",
  "verified",
  "2026-07-27",
);

const luccaVerification = verification(
  "https://www.turismo.lucca.it/en",
  "Turismo Lucca",
  "official_site",
  "medium",
  "verified",
  "2026-07-27",
);

const nafplioVerification = verification(
  "https://www.visitnafplio.com/en/",
  "Visit Nafplio",
  "official_site",
  "medium",
  "verified",
  "2026-07-27",
);

const monopoliVerification = verification(
  "https://www.visitmonopoli.it/en/",
  "Visit Monopoli",
  "official_site",
  "medium",
  "verified",
  "2026-07-27",
);

const piranVerification = verification(
  "https://www.portoroz.si/en/discover/piran",
  "Portoroz & Piran Tourism",
  "official_site",
  "medium",
  "verified",
  "2026-07-27",
);

const rijekaVerification = verification(
  "https://visitrijeka.hr/en/",
  "Visit Rijeka",
  "official_site",
  "medium",
  "verified",
  "2026-07-27",
);

const sibenikVerification = verification(
  "https://sibenik-tourism.hr/en/",
  "Šibenik Tourist Board",
  "official_site",
  "medium",
  "verified",
  "2026-07-27",
);

const santanderVerification = verification(
  "https://turismo.santander.es/en/",
  "Santander Tourism",
  "official_site",
  "medium",
  "verified",
  "2026-07-27",
);

const valenciaCityVerification = verification(
  "https://en.wikipedia.org/wiki/Valencia",
  "Wikipedia",
  "encyclopedia",
  "medium",
  "estimated",
  "2026-07-25",
);

const valenciaTourismVerification = verification(
  "https://www.visitvalencia.com/en",
  "Visit Valencia",
  "official_site",
  "high",
  "verified",
  "2026-07-25",
);

const valenciaAirportVerification = verification(
  "https://en.wikipedia.org/wiki/Valencia_Airport",
  "Wikipedia / Aena references",
  "encyclopedia",
  "medium",
  "estimated",
  "2026-07-25",
);

const valenciaWeatherVerification = verification(
  "https://www.weather2travel.com/spain/valencia/climate/",
  "Weather2Travel",
  "climate_guide",
  "medium",
  "estimated",
  "2026-07-25",
);

const valenciaNumbeoCostVerification = verification(
  "https://www.numbeo.com/cost-of-living/in/Valencia",
  "Numbeo",
  "user_contributed_database",
  "medium",
  "estimated",
  "2026-07-25",
);

const valenciaNumbeoPropertyVerification = verification(
  "https://www.numbeo.com/property-investment/in/Valencia",
  "Numbeo",
  "user_contributed_database",
  "medium",
  "estimated",
  "2026-07-25",
);

const valenciaNumbeoCrimeVerification = verification(
  "https://www.numbeo.com/crime/in/Valencia",
  "Numbeo",
  "user_contributed_database",
  "medium",
  "estimated",
  "2026-07-25",
);

const spainTaxResidenceVerification = verification(
  "https://taxsummaries.pwc.com/spain/individual/residence",
  "PwC Worldwide Tax Summaries",
  "tax_summary",
  "high",
  "verified",
  "2026-07-25",
);

const spainTaxOtherVerification = verification(
  "https://taxsummaries.pwc.com/spain/individual/other-taxes",
  "PwC Worldwide Tax Summaries",
  "tax_summary",
  "high",
  "verified",
  "2026-07-25",
);

const spainVisaVerification = verification(
  "https://www.exteriores.gob.es/en/ServiciosAlCiudadano/Paginas/Servicios-consulares.aspx",
  "Ministry of Foreign Affairs, European Union and Cooperation of Spain",
  "government_portal",
  "medium",
  "verified",
  "2026-07-25",
);

const pwcResidenceVerification = verification(
  "https://taxsummaries.pwc.com/montenegro/individual/residence",
  "PwC Worldwide Tax Summaries",
  "tax_summary",
  "high",
  "verified",
  "2026-03-27",
);

const pwcOtherTaxesVerification = verification(
  "https://taxsummaries.pwc.com/montenegro/individual/other-taxes",
  "PwC Worldwide Tax Summaries",
  "tax_summary",
  "high",
  "verified",
  "2026-03-27",
);

const tivatMonthlyClimate: MonthlyClimateRow[] = [
  { month: "January", avgHighC: 7, avgLowC: -1, rainfallMm: 157, rainyDays: 13, humidityPct: null, sunshineHours: 4, uvIndex: 1, seaTempC: 14, snowfallCm: null, windKph: null, verification: weatherVerification },
  { month: "February", avgHighC: 8, avgLowC: 1, rainfallMm: 139, rainyDays: 13, humidityPct: null, sunshineHours: 4, uvIndex: 2, seaTempC: 14, snowfallCm: null, windKph: null, verification: weatherVerification },
  { month: "March", avgHighC: 12, avgLowC: 3, rainfallMm: 128, rainyDays: 13, humidityPct: null, sunshineHours: 5, uvIndex: 4, seaTempC: 14, snowfallCm: null, windKph: null, verification: weatherVerification },
  { month: "April", avgHighC: 16, avgLowC: 7, rainfallMm: 119, rainyDays: 13, humidityPct: null, sunshineHours: 6, uvIndex: 5, seaTempC: 15, snowfallCm: null, windKph: null, verification: weatherVerification },
  { month: "May", avgHighC: 21, avgLowC: 11, rainfallMm: 88, rainyDays: 11, humidityPct: null, sunshineHours: 8, uvIndex: 7, seaTempC: 19, snowfallCm: null, windKph: null, verification: weatherVerification },
  { month: "June", avgHighC: 25, avgLowC: 14, rainfallMm: 70, rainyDays: 10, humidityPct: null, sunshineHours: 9, uvIndex: 8, seaTempC: 22, snowfallCm: null, windKph: null, verification: weatherVerification },
  { month: "July", avgHighC: 28, avgLowC: 17, rainfallMm: 51, rainyDays: 7, humidityPct: null, sunshineHours: 10, uvIndex: 9, seaTempC: 25, snowfallCm: null, windKph: null, verification: weatherVerification },
  { month: "August", avgHighC: 28, avgLowC: 16, rainfallMm: 63, rainyDays: 7, humidityPct: null, sunshineHours: 9, uvIndex: 8, seaTempC: 25, snowfallCm: null, windKph: null, verification: weatherVerification },
  { month: "September", avgHighC: 24, avgLowC: 13, rainfallMm: 100, rainyDays: 8, humidityPct: null, sunshineHours: 8, uvIndex: 6, seaTempC: 23, snowfallCm: null, windKph: null, verification: weatherVerification },
  { month: "October", avgHighC: 18, avgLowC: 9, rainfallMm: 139, rainyDays: 11, humidityPct: null, sunshineHours: 6, uvIndex: 4, seaTempC: 21, snowfallCm: null, windKph: null, verification: weatherVerification },
  { month: "November", avgHighC: 13, avgLowC: 5, rainfallMm: 190, rainyDays: 14, humidityPct: null, sunshineHours: 4, uvIndex: 2, seaTempC: 18, snowfallCm: null, windKph: null, verification: weatherVerification },
  { month: "December", avgHighC: 8, avgLowC: 1, rainfallMm: 175, rainyDays: 13, humidityPct: null, sunshineHours: 4, uvIndex: 1, seaTempC: 16, snowfallCm: null, windKph: null, verification: weatherVerification },
];

export const LOCAL_COMMAND_CENTER_SEEDS: Record<string, LocalCommandCenterSeed> = {
  "todos-santos-mexico": {
    region: "Baja California Sur / Pacific Mexico",
    lastVerifiedAt: "2026-07-25",
    dataConfidence: "medium",
    quickMetrics: [
      metric("population_2023", "Population (2023)", "~10,000 residents", verification("https://www.google.com/search?q=Todos+Santos+population+2023", "Google search / local census references", "reference", "medium", "verified", "2026-07-25")),
      metric("airport_distance", "Airport distance", "~45 min to Los Cabos International Airport (SJD)", verification("https://www.google.com/search?q=Todos+Santos+to+Los+Cabos+airport+distance", "Google search / travel references", "reference", "medium", "verified", "2026-07-25")),
      metric("broadband_cost", "Broadband internet", "~USD 50/month for 100 Mbps+", verification("https://www.google.com/search?q=Todos+Santos+internet+service+cost", "Google search / local ISP references", "reference", "medium", "verified", "2026-07-25")),
      metric("utilities", "Utilities", "~USD 120/month", verification("https://www.google.com/search?q=Todos+Santos+utilities+cost", "Google search / household cost references", "reference", "medium", "verified", "2026-07-25")),
      metric("rent_1br_centre", "1BR rent, centre", "~USD 1,200/month", verification("https://www.google.com/search?q=Todos+Santos+1+bedroom+rent", "Google search / local rental references", "reference", "medium", "verified", "2026-07-25")),
      metric("rent_2br_centre", "2BR rent, centre", "~USD 1,700/month", verification("https://www.google.com/search?q=Todos+Santos+2+bedroom+rent", "Google search / local rental references", "reference", "medium", "verified", "2026-07-25")),
      metric("rent_3br_centre", "3BR rent, centre", "~USD 2,300/month", verification("https://www.google.com/search?q=Todos+Santos+3+bedroom+rent", "Google search / local rental references", "reference", "medium", "verified", "2026-07-25")),
      metric("groceries", "Groceries", "~USD 400-600/month for one adult", verification("https://www.google.com/search?q=Todos+Santos+grocery+cost+monthly", "Google search / cost-of-living references", "reference", "medium", "verified", "2026-07-25")),
      metric("gasoline", "Gasoline", "~USD 4.30/gallon", verification("https://www.google.com/search?q=Todos+Santos+gasoline+price", "Google search / fuel references", "reference", "medium", "verified", "2026-07-25")),
      metric("big_mac_index", "Big Mac index", "~USD 5.50", verification("https://www.google.com/search?q=Todos+Santos+Big+Mac+price", "Google search / local meal pricing references", "reference", "medium", "verified", "2026-07-25")),
    ],
    costOfLiving: [
      metric("meal_inexpensive", "Meal at inexpensive restaurant", "~USD 12-15", verification("https://www.google.com/search?q=Todos+Santos+meal+cost", "Google search / restaurant pricing", "reference", "medium", "verified", "2026-07-25")),
      metric("meal_two_midrange", "Dinner for two, mid-range", "~USD 45-60", verification("https://www.google.com/search?q=Todos+Santos+dinner+for+two+cost", "Google search / restaurant pricing", "reference", "medium", "verified", "2026-07-25")),
      metric("monthly_transport", "Monthly public transport pass", "~USD 30-40", verification("https://www.google.com/search?q=Todos+Santos+public+transport+cost", "Google search / local transport pricing", "reference", "medium", "verified", "2026-07-25")),
      metric("gasoline", "Gasoline", "~USD 4.30/gallon", verification("https://www.google.com/search?q=Todos+Santos+gasoline+price", "Google search / fuel references", "reference", "medium", "verified", "2026-07-25")),
      metric("utilities", "Utilities", "~USD 120/month", verification("https://www.google.com/search?q=Todos+Santos+utilities+cost", "Google search / household cost references", "reference", "medium", "verified", "2026-07-25")),
      metric("broadband", "Broadband 100 Mbps+", "~USD 50/month", verification("https://www.google.com/search?q=Todos+Santos+internet+service+cost", "Google search / local ISP references", "reference", "medium", "verified", "2026-07-25")),
    ],
    housingMetrics: [
      metric("rent_1br_center", "1 bedroom apartment, city centre", "~USD 1,200/month", verification("https://www.google.com/search?q=Todos+Santos+1+bedroom+rent", "Google search / local rental references", "reference", "medium", "verified", "2026-07-25")),
      metric("rent_2br_center", "2 bedroom apartment, city centre", "~USD 1,700/month", verification("https://www.google.com/search?q=Todos+Santos+2+bedroom+rent", "Google search / local rental references", "reference", "medium", "verified", "2026-07-25")),
      metric("rent_3br_center", "3 bedroom apartment, city centre", "~USD 2,300/month", verification("https://www.google.com/search?q=Todos+Santos+3+bedroom+rent", "Google search / local rental references", "reference", "medium", "verified", "2026-07-25")),
      metric("buy_center_sqm", "Buy apartment, city centre", "~USD 3,500/m²", verification("https://www.google.com/search?q=Todos+Santos+condo+price+per+m2", "Google search / property price references", "reference", "medium", "verified", "2026-07-25")),
      metric("buy_outside_sqm", "Buy apartment, outside centre", "~USD 2,800/m²", verification("https://www.google.com/search?q=Todos+Santos+outside+centre+property+price", "Google search / property price references", "reference", "medium", "verified", "2026-07-25")),
    ],
    neighborhoods: [
      row(
        "town-center",
        "Town center",
        "Historic core and main streets",
        "Best for walkability and proximity to cafés, galleries, and day-to-day services.",
        "Useful when you want the strongest restaurant and street-life access without giving up the town’s small-scale feel.",
        "Compare this against the quieter edges if you want more privacy and lower seasonal disruption.",
        "https://www.google.com/search?q=Todos+Santos+town+center",
        verification("https://www.google.com/search?q=Todos+Santos+town+center", "Google search / local neighborhood references", "reference", "medium", "verified", "2026-07-25"),
        "Todos Santos town center, Baja California Sur, Mexico",
        13,
      ),
      row(
        "beach-edge",
        "Beach edge",
        "Pacific-side residential pockets",
        "Best for surf access and sunset proximity.",
        "Useful when you want the coastal setting to be central to the daily routine.",
        "This can be more exposed to seasonal demand and less convenient for everyday errands than the core.",
        "https://www.google.com/search?q=Todos+Santos+beach+neighborhood",
        verification("https://www.google.com/search?q=Todos+Santos+beach+neighborhood", "Google search / local neighborhood references", "reference", "medium", "verified", "2026-07-25"),
        "Todos Santos beach edge, Baja California Sur, Mexico",
        13,
      ),
    ],
    healthcareFacilities: [
      row(
        "todos-santos-clinic",
        "Todos Santos medical services",
        "Primary care and local clinic access",
        "Local care exists, but serious or specialist needs usually require a trip to Los Cabos.",
        "Useful for a basic assessment of everyday medical convenience.",
        "Plan for more complex care outside town rather than assuming full-service infrastructure is local.",
        "https://www.google.com/search?q=Todos+Santos+medical+clinic",
        verification("https://www.google.com/search?q=Todos+Santos+medical+clinic", "Google search / medical service references", "reference", "medium", "verified", "2026-07-25"),
      ),
    ],
    airports: [
      row(
        "sjd-airport",
        "Los Cabos International Airport (SJD)",
        "Primary gateway",
        "About 45 minutes from Todos Santos by road.",
        "Main international gateway for the broader Baja Sur area.",
        "Useful for arrivals, departures, and backup access for medical or family travel.",
        "https://www.google.com/search?q=Los+Cabos+airport+Todos+Santos",
        verification("https://www.google.com/search?q=Los+Cabos+airport+Todos+Santos", "Google search / airport references", "reference", "medium", "verified", "2026-07-25"),
      ),
    ],
    practicalInfo: [
      row(
        "grocery-runs",
        "Grocery runs",
        "Everyday logistics",
        "Plan around a small-town supply base rather than assuming supermarket depth comparable to a large city.",
        "Useful for residents who want a simpler weekly routine with fewer convenience-store dependencies.",
        "The town works best when you keep a real weekly inventory rhythm rather than buying ad hoc.",
        "https://www.google.com/search?q=Todos+Santos+grocery+store",
        verification("https://www.google.com/search?q=Todos+Santos+grocery+store", "Google search / local retail references", "reference", "medium", "verified", "2026-07-25"),
      ),
    ],
    pros: [
      "Strong coastal and desert character",
      "A slower, more intimate daily rhythm",
      "Good fit for artists and remote workers who value atmosphere",
    ],
    tradeoffs: [
      "Healthcare and specialist care are more limited than in larger cities",
      "Seasonal demand can push housing costs upward",
      "The town feels most rewarding when you embrace a simpler, less urban lifestyle",
    ],
    resources: [
      resource(
        "todos-santos-practical-guide",
        "practical",
        "Todos Santos practical guide",
        "Useful starter notes for daily logistics, housing, and the broader Baja Sur access pattern.",
        "https://www.google.com/search?q=Todos+Santos+practical+guide",
        "reference",
        "2026-07-25",
      ),
    ],
  },
  "tivat-montenegro": {
    region: "Bay of Kotor / Coastal Montenegro",
    lastVerifiedAt: "2026-07-24",
    dataConfidence: "medium",
    quickMetrics: [
      metric("population_2023", "Population (2023)", "10,743 town residents", tivatGeoVerification),
      metric("airport_distance", "Airport distance", "3 km to Tivat Airport (TIV)", tivatAirportVerification),
      metric("kotor_distance", "Kotor distance", "10 km to Kotor", tivatGeoVerification),
      metric("budva_distance", "Budva distance", "23 km to Budva", tivatGeoVerification),
      metric("marina_scale", "Porto Montenegro marina", ">500 berths, yachts to 250 m", portoMarinaVerification),
      metric("broadband_cost", "Broadband internet", "EUR 30/month for 60 Mbps+", numbeoCostVerification),
      metric("utilities_85m2", "Utilities (85 m²)", "EUR 115.30/month", numbeoCostVerification),
      metric("rent_1br_centre", "1BR rent, centre", "EUR 883/month", numbeoPropertyVerification),
    ],
    scorecard: [
      score("Crime Index", 20, "Numbeo crime index 20.45, categorized as low.", "Low reported street crime; last update 2 Jul 2024.", numbeoCrimeVerification),
      score("Safety by Day", 89, "Safety walking alone during daylight scores 88.64.", "Numbeo safety perception survey.", numbeoCrimeVerification),
      score("Safety by Night", 75, "Safety walking alone at night scores 75.", "Numbeo safety perception survey.", numbeoCrimeVerification),
      score("Health Care Index", 48, "Health care system index scores 47.92.", "Friendliness 62.5, equipment 25, location convenience 62.5.", numbeoHealthVerification),
      score("Air Quality", 65, "Air quality scores 65 in Numbeo cleanliness data.", "Low air pollution, PM2.5 reported at 16 in WHO snippet on Numbeo.", numbeoPollutionVerification),
      score("Broadband Cost", 30, "Unlimited 60 Mbps+ broadband averages EUR 30/month.", "Numbeo cost-of-living table, last update 21 Jul 2026.", numbeoCostVerification),
    ],
    monthlyClimate: tivatMonthlyClimate,
    costOfLiving: [
      metric("meal_inexpensive", "Meal at inexpensive restaurant", "EUR 10.00", numbeoCostVerification),
      metric("meal_two_midrange", "Dinner for two, mid-range", "EUR 40.00", numbeoCostVerification),
      metric("monthly_transport", "Monthly public transport pass", "EUR 35.00", numbeoCostVerification),
      metric("taxi_start", "Taxi start tariff", "EUR 1.00", numbeoCostVerification),
      metric("gasoline", "Gasoline", "EUR 1.52/L", numbeoCostVerification),
      metric("utilities", "Basic utilities (85 m²)", "EUR 115.30/month", numbeoCostVerification),
      metric("broadband", "Broadband 60 Mbps+", "EUR 30.00/month", numbeoCostVerification),
      metric("preschool", "Private preschool", "EUR 358.33/month", numbeoCostVerification),
    ],
    housingMetrics: [
      metric("rent_1br_center", "1 bedroom apartment, city centre", "EUR 883.17/month", numbeoPropertyVerification),
      metric("rent_1br_outside", "1 bedroom apartment, outside centre", "EUR 716.25/month", numbeoPropertyVerification),
      metric("rent_3br_center", "3 bedroom apartment, city centre", "EUR 1,675.00/month", numbeoPropertyVerification),
      metric("rent_3br_outside", "3 bedroom apartment, outside centre", "EUR 1,256.00/month", numbeoPropertyVerification),
      metric("buy_center_sqm", "Buy apartment, city centre", "EUR 5,259/m²", numbeoPropertyVerification),
      metric("buy_outside_sqm", "Buy apartment, outside centre", "EUR 2,381/m²", numbeoPropertyVerification),
      metric("mortgage_rate", "20-year mortgage rate", "5.38%", numbeoPropertyVerification),
      metric("salary_net", "Average monthly net salary", "EUR 1,061.83", numbeoPropertyVerification),
    ],
    neighborhoods: [
      row(
        "porto-montenegro",
        "Porto Montenegro",
        "Waterfront marina district",
        "Six waterfront neighbourhoods within Porto Montenegro.",
        ">500 berths with premium retail, dining, wellness and events.",
        "Major international marina-led residential hub in Tivat.",
        "https://www.portomontenegro.com/about/",
        portoNeighborhoodsVerification,
        "Porto Montenegro, Tivat, Montenegro",
        14,
      ),
      row(
        "south-village",
        "South Village",
        "Porto Montenegro residential quarter",
        "Porto Montenegro presents South Village as one of its named residential neighbourhoods.",
        "Useful for buyers or long-stay renters who want immediate access to the marina village rather than the wider municipal fabric.",
        "Pressure-test whether the convenience premium is worth it versus non-marina addresses in Tivat.",
        "https://portomontenegro.com/real-estate/south-village/",
        portoNeighborhoodsVerification,
        "South Village, Porto Montenegro, Tivat, Montenegro",
        15,
      ),
      row(
        "boka-residences",
        "Boka Residences",
        "Urban wellness-led residential quarter",
        "Porto Montenegro describes Boka Residences as urban-inspired homes with wellness, retail, dining, and modern amenities at the core.",
        "Useful if you want a more mixed-use, everyday-living feel than a purely yacht-club-facing address.",
        "Compare it against South Village and older Tivat stock before assuming the branded district is the best long-stay fit.",
        "https://portomontenegro.com/real-estate/boka-place/residences/",
        portoNeighborhoodsVerification,
        "Boka Place, Tivat, Montenegro",
        15,
      ),
      row(
        "the-peaks-radovici",
        "The Peaks / Radovići",
        "Southern municipal resort zone",
        "Near Radovići and the open-sea side of the municipality.",
        "Golf residences with Adriatic and Boka views at Luštica Bay.",
        "Better for resort-style living than quick access to central Tivat on foot.",
        "https://lusticabay.com/the-peaks-lustica-bay-en/",
        lusticaVerification,
        "The Peaks, Lustica Bay, Radovici, Montenegro",
        13,
      ),
    ],
    healthcareFacilities: [
      row(
        "dom-zdravlja-tivat",
        "Dom Zdravlja Tivat",
        "Public primary care / community health center",
        "Town-level health center with official local portal.",
        "Website: domzdravljativat.me",
        "Use the official site to confirm departments, lab services and working hours.",
        "https://www.domzdravljativat.me/",
        verification("https://www.domzdravljativat.me/", "Dom Zdravlja Tivat", "official_site", "medium", "verified", "2026-07-24"),
      ),
      row(
        "general-hospital-kotor",
        "General Hospital Kotor",
        "Nearest general hospital",
        "Kotor is about 10 km from Tivat.",
        "Official site: generalhospitalkotor.me",
        "Relevant hospital option for the wider Bay of Kotor catchment.",
        "https://www.generalhospitalkotor.me/",
        verification("https://www.generalhospitalkotor.me/", "General Hospital Kotor", "official_site", "medium", "verified", "2026-07-24"),
      ),
      row(
        "healthcare-index-tivat",
        "Tivat health care index",
        "Resident perception snapshot",
        "Numbeo health care system index: 47.92.",
        "Friendliness 62.5 • responsiveness 50 • location convenience 62.5.",
        "Equipment for modern diagnosis and treatment scores 25; validate providers directly.",
        "https://www.numbeo.com/health-care/in/Tivat-Montenegro",
        numbeoHealthVerification,
      ),
    ],
    airports: [
      row(
        "tivat-airport",
        "Tivat Airport (TIV / LYTV)",
        "International airport • Airports of Montenegro",
        "3 km south of Tivat centre; highly seasonal coastal gateway.",
        "Public airport with 2,500 m asphalt runway.",
        "Year-round links include Belgrade and Istanbul; seasonal routes span London, Zurich, Vienna and more.",
        "https://en.wikipedia.org/wiki/Tivat_Airport",
        tivatAirportVerification,
      ),
      row(
        "kamenari-lepetane-ferry",
        "Kamenari-Lepetane Ferry",
        "Bay crossing toward Herceg Novi side",
        "Cuts the need to drive around the full Bay of Kotor.",
        "Operates across the Verige Strait.",
        "Important for practical routing when comparing west-bay day trips and airport pickup paths.",
        "https://en.wikipedia.org/wiki/Tivat",
        tivatGeoVerification,
      ),
      row(
        "porto-montenegro-marina",
        "Porto Montenegro Marina",
        "Marina transport / yachting hub",
        ">500 berths for yachts up to 250 metres.",
        "24-hour dock staff with VHF Channel 71 arrival procedure.",
        "Tax-free fuel and year-round marina operations.",
        "https://www.portomontenegro.com/marina/",
        portoMarinaVerification,
      ),
    ],
    golfCourses: [
      row(
        "the-peaks-golf",
        "The Peaks Golf Course",
        "Luštica Bay • Radovići, Tivat",
        "Montenegro's first golf course and golf residences.",
        "Official materials reference homes above golf hole 1 and golf hole 5.",
        "Best current verified golf lead inside the Tivat municipality orbit.",
        "https://lusticabay.com/the-peaks-lustica-bay-en/",
        lusticaVerification,
      ),
    ],
    recreationFacilities: [
      row(
        "porto-montenegro-lifestyle",
        "Porto Montenegro",
        "Retail, dining, wellness and event district",
        "World-class waterfront destination with residences, business clubs and leisure programming.",
        "Dynamic events programme, premium retail and dining on site.",
        "Useful for gauging expat convenience and walkable amenity density.",
        "https://www.portomontenegro.com/",
        portoVerification,
      ),
      row(
        "plavi-horizonti",
        "Plavi Horizonti",
        "Beach / recreation outing",
        "Highlighted in Tivat tourism coverage as a major sandy beach.",
        "Located toward the Pržno inlet / Radovići side of the municipality.",
        "Relevant day-trip and summer lifestyle asset when comparing districts.",
        "https://en.wikipedia.org/wiki/Tivat",
        tivatGeoVerification,
      ),
      row(
        "business-clubs",
        "Porto Montenegro Business Clubs",
        "Remote-work / meeting infrastructure",
        "Adriatic, Arsenal, Nautica and Ozana clubs are listed on the Porto Montenegro site.",
        "Supports entrepreneur and remote-work practicality in the marina district.",
        "Useful for prospecting non-home office options before committing to a lease.",
        "https://www.portomontenegro.com/",
        portoVerification,
      ),
    ],
    schools: [
      row(
        "ksi-montenegro",
        "KSI Montenegro",
        "IB World School • day and boarding",
        "Only authorised IB World School in Montenegro offering three IB programmes.",
        "Average class size 14 • student-teacher ratio 6:1 • 30+ nationalities.",
        "Address: Seljanovo bb, Porto Montenegro, Tivat 85320.",
        "https://www.ksi-montenegro.com/",
        ksiVerification,
      ),
    ],
    internetMetrics: [
      metric("broadband_60", "Broadband internet (60 Mbps+)", "EUR 30.00/month", numbeoCostVerification),
      metric("mobile_plan", "Mobile plan (10GB+)", "EUR 13.88/month", numbeoCostVerification),
      metric("business_clubs", "Cowork / business club footprint", "4 Porto Montenegro clubs listed", portoVerification),
    ],
    visaPrograms: [
      row(
        "mup-foreigners-status",
        "Foreigners status issues portal",
        "Official Ministry of Interior entry point",
        "Montenegro Ministry of Interior page for foreigners' status issues.",
        "Use it to confirm residence document paths before relying on secondary summaries.",
        "Best official starting point currently captured in the project for residence-process verification.",
        "https://mup.gov.me/en/ministry/Directorates_and_other_internal_organisational_units/administrative_affairs_citizenship_and_foreigners/status_issues/",
        verification("https://mup.gov.me/en/ministry/Directorates_and_other_internal_organisational_units/administrative_affairs_citizenship_and_foreigners/status_issues/", "Montenegro Ministry of Interior", "government_portal", "medium", "verified", "2026-07-24"),
      ),
    ],
    taxRules: [
      row(
        "tax-residence-rule",
        "Montenegro tax residence",
        "PwC summary of individual residence rules",
        "Residence can be triggered by domicile / centre of personal and economic interests in Montenegro.",
        "Also triggered by spending at least 183 days in a tax year in Montenegro.",
        "Double-tax-treaty tie-break rules may apply.",
        "https://taxsummaries.pwc.com/montenegro/individual/residence",
        pwcResidenceVerification,
      ),
      row(
        "vat-standard-rate",
        "Standard VAT",
        "Indirect tax snapshot",
        "General VAT rate: 21%.",
        "Reduced VAT rates exist for certain goods and services.",
        "Confirm transaction-specific treatment before property or large durable purchases.",
        "https://taxsummaries.pwc.com/montenegro/individual/other-taxes",
        pwcOtherTaxesVerification,
      ),
      row(
        "salary-social-security",
        "Salary social contributions",
        "PwC social security summary",
        "Pension and disability insurance: 10% employee.",
        "Unemployment insurance: 0.5% employee + 0.5% employer.",
        "2024 pension/disability cap: EUR 68,765 annually.",
        "https://taxsummaries.pwc.com/montenegro/individual/other-taxes",
        pwcOtherTaxesVerification,
      ),
    ],
    safetyMetrics: [
      metric("crime_index", "Crime index", "20.45 (Low)", numbeoCrimeVerification),
      metric("safety_daylight", "Safety walking alone, daylight", "88.64 (Very High)", numbeoCrimeVerification),
      metric("safety_night", "Safety walking alone, night", "75.00 (High)", numbeoCrimeVerification),
      metric("air_quality", "Air quality", "65.00 (High)", numbeoPollutionVerification),
      metric("pollution_index", "Pollution index", "49.08", numbeoPollutionVerification),
    ],
    foodMetrics: [
      metric("meal_budget", "Meal at inexpensive restaurant", "EUR 10.00", numbeoCostVerification),
      metric("dinner_two", "Dinner for two, mid-range", "EUR 40.00", numbeoCostVerification),
      metric("cappuccino", "Cappuccino", "EUR 1.93", numbeoCostVerification),
      metric("draft_beer", "Domestic draft beer", "EUR 2.50", numbeoCostVerification),
      metric("milk_litre", "Milk (1 litre)", "EUR 1.13", numbeoCostVerification),
      metric("eggs_dozen", "Eggs (12)", "EUR 3.03", numbeoCostVerification),
      metric("bread_loaf", "Fresh white bread", "EUR 0.86", numbeoCostVerification),
      metric("wine_bottle", "Bottle of wine, mid-range", "EUR 6.00", numbeoCostVerification),
    ],
    foodSpots: [
      row(
        "porto-montenegro-dining",
        "Porto Montenegro dining district",
        "Waterfront dining cluster",
        "Official Porto Montenegro dining hub for waterfront restaurants, cafes, and social life.",
        "Best first stop if you want a polished marina-led lifestyle test rather than a purely local-market one.",
        "Use it to judge whether premium convenience is worth the price delta versus older Tivat neighborhoods.",
        "https://portomontenegro.com/dining/",
        portoVerification,
        "Porto Montenegro dining, Tivat, Montenegro",
        15,
      ),
      row(
        "boka-place",
        "Boka Place",
        "Mixed-use retail and dining quarter",
        "Part of Porto Montenegro's broader live-work-play footprint with food, retail, and everyday convenience.",
        "Useful if you want apartment living closer to newer mixed-use inventory and walkable services.",
        "Supports a more all-in-one routine than older residential pockets.",
        "https://portomontenegro.com/",
        portoVerification,
        "Boka Place, Tivat, Montenegro",
        15,
      ),
    ],
    practicalInfo: [
      row(
        "adriatic-business-club",
        "Adriatic Business Club",
        "Remote-work / meeting space",
        "One of Porto Montenegro's named business clubs for focused work and meetings.",
        "Relevant for founders, consultants, and hybrid workers evaluating daily productivity options.",
        "Porto Montenegro lists Adriatic, Arsenal, Nautica, and Ozana clubs in its workspace offering.",
        "https://portomontenegro.com/business-clubs/",
        portoVerification,
        "Adriatic Business Club, Tivat, Montenegro",
        15,
      ),
      row(
        "arsenal-business-club",
        "Arsenal Business Club",
        "Remote-work / meeting space",
        "Named business club inside Porto Montenegro's workspace network.",
        "Useful when comparing home-office-only living against a more social work rhythm.",
        "Part of the destination's clearest premium work infrastructure.",
        "https://portomontenegro.com/business-clubs/",
        portoVerification,
        "Arsenal Business Club, Tivat, Montenegro",
        15,
      ),
      row(
        "tivat-tourist-organization",
        "Tourist Organization of Tivat",
        "Visitor and orientation resource",
        "Official local tourism entry point for planning logistics, events, and orientation materials.",
        "Useful for itinerary planning before a scouting trip and for checking practical visitor information.",
        "Can act as a central local information anchor alongside airport and healthcare resources.",
        "http://www.tivat.travel/",
        verification("http://www.tivat.travel/", "Tourist Organization of Tivat", "official_site", "medium", "verified", "2026-07-25"),
        "Tivat, Montenegro",
        12,
      ),
    ],
    pros: [
      "Tivat Airport sits about 3 km from town and keeps the bay unusually well connected for a small coastal market.",
      "Porto Montenegro provides a >500-berth marina, tax-free fuel, and a dense amenity cluster for waterfront living.",
      "KSI Montenegro adds a real IB day-and-boarding school option inside the town rather than requiring a longer regional commute.",
      "Broadband 60 Mbps+ averages around EUR 30/month and standard utilities for an 85 m² apartment average about EUR 115/month on Numbeo.",
    ],
    tradeoffs: [
      "Airport traffic is highly seasonal, with most passenger volume concentrated in the May-September period.",
      "Tivat Airport does not operate at night because of its proximity to the town and operating constraints.",
      "Health-care perception data is thin: Tivat's Numbeo health index is based on only four contributors and should be validated with provider visits.",
      "Property-price and rent figures rely on contributor data and can understate prime waterfront inventory in Porto Montenegro or Luštica Bay.",
    ],
    resources: [
      resource("tivat-airport-official", "transport", "Tivat Airport reference", "Airport profile, code, routing context and destination summary.", "https://en.wikipedia.org/wiki/Tivat_Airport", "encyclopedia", "2026-07-21"),
      resource("porto-montenegro", "neighborhood", "Porto Montenegro official site", "Waterfront district, residences, business clubs and marina-led lifestyle hub.", "https://www.portomontenegro.com/", "official_site", "2026-07-24"),
      resource("porto-montenegro-marina", "transport", "Porto Montenegro marina", "Berths, services, tax-free fuel and arrival procedures.", "https://www.portomontenegro.com/marina/", "official_site", "2026-07-24"),
      resource("lustica-the-peaks", "golf", "Luštica Bay The Peaks", "Montenegro's first golf course and golf residences in the Tivat municipality orbit.", "https://lusticabay.com/the-peaks-lustica-bay-en/", "official_site", "2026-07-24"),
      resource("ksi-montenegro", "schools", "KSI Montenegro", "Official school site for IB programmes, class size, ratio and campus details.", "https://www.ksi-montenegro.com/", "official_site", "2026-07-24"),
      resource("numbeo-cost", "cost", "Numbeo cost of living", "Restaurant, utilities, rent, internet and transport price snapshot for Tivat.", "https://www.numbeo.com/cost-of-living/in/Tivat-Montenegro", "user_contributed_database", "2026-07-21"),
      resource("numbeo-property", "housing", "Numbeo property prices", "Rent and purchase pricing snapshot for Tivat apartments.", "https://www.numbeo.com/property-investment/in/Tivat-Montenegro", "user_contributed_database", "2026-07-21"),
      resource("numbeo-crime", "safety", "Numbeo crime and safety", "Perception-based crime, safety by day/night and corruption concerns.", "https://www.numbeo.com/crime/in/Tivat-Montenegro", "user_contributed_database", "2024-07-02"),
      resource("numbeo-health", "healthcare", "Numbeo health care", "Perception-based health system index and component breakdown.", "https://www.numbeo.com/health-care/in/Tivat-Montenegro", "user_contributed_database", "2024-06-28"),
      resource("weather2travel-tivat", "climate", "Weather2Travel climate table", "Month-by-month temperature, sea temperature, rainfall, UV and sunshine for Tivat.", "https://www.weather2travel.com/montenegro/tivat/climate/", "climate_guide", "2026-07-24"),
      resource("pwc-residence", "tax", "PwC Montenegro residence summary", "183-day and centre-of-interests tax residence rules.", "https://taxsummaries.pwc.com/montenegro/individual/residence", "tax_summary", "2026-03-27"),
      resource("pwc-other-taxes", "tax", "PwC Montenegro other taxes", "VAT and social contribution summary.", "https://taxsummaries.pwc.com/montenegro/individual/other-taxes", "tax_summary", "2026-03-27"),
      resource("mup-foreigners", "visa", "Montenegro Ministry of Interior foreigners portal", "Official starting point for foreigners' status issues and residence-process verification.", "https://mup.gov.me/en/ministry/Directorates_and_other_internal_organisational_units/administrative_affairs_citizenship_and_foreigners/status_issues/", "government_portal", "2026-07-24"),
    ],
  },
  "cavtat-croatia": {
    region: "Konavle / Dubrovnik Riviera",
    lastVerifiedAt: "2026-07-26",
    dataConfidence: "medium",
    monthlyClimate: [
      { month: "January", avgHighC: 12, avgLowC: 6, rainfallMm: 138, rainyDays: 12, humidityPct: null, sunshineHours: 4, uvIndex: 2, seaTempC: 14, snowfallCm: null, windKph: null, verification: cavtatClimateVerification },
      { month: "February", avgHighC: 13, avgLowC: 6, rainfallMm: 126, rainyDays: 11, humidityPct: null, sunshineHours: 5, uvIndex: 3, seaTempC: 14, snowfallCm: null, windKph: null, verification: cavtatClimateVerification },
      { month: "March", avgHighC: 15, avgLowC: 8, rainfallMm: 113, rainyDays: 10, humidityPct: null, sunshineHours: 6, uvIndex: 4, seaTempC: 14, snowfallCm: null, windKph: null, verification: cavtatClimateVerification },
      { month: "April", avgHighC: 18, avgLowC: 11, rainfallMm: 103, rainyDays: 10, humidityPct: null, sunshineHours: 7, uvIndex: 5, seaTempC: 15, snowfallCm: null, windKph: null, verification: cavtatClimateVerification },
      { month: "May", avgHighC: 23, avgLowC: 15, rainfallMm: 78, rainyDays: 8, humidityPct: null, sunshineHours: 9, uvIndex: 7, seaTempC: 19, snowfallCm: null, windKph: null, verification: cavtatClimateVerification },
      { month: "June", avgHighC: 27, avgLowC: 19, rainfallMm: 61, rainyDays: 7, humidityPct: null, sunshineHours: 10, uvIndex: 8, seaTempC: 23, snowfallCm: null, windKph: null, verification: cavtatClimateVerification },
      { month: "July", avgHighC: 30, avgLowC: 22, rainfallMm: 39, rainyDays: 5, humidityPct: null, sunshineHours: 11, uvIndex: 9, seaTempC: 25, snowfallCm: null, windKph: null, verification: cavtatClimateVerification },
      { month: "August", avgHighC: 30, avgLowC: 22, rainfallMm: 52, rainyDays: 5, humidityPct: null, sunshineHours: 10, uvIndex: 8, seaTempC: 25, snowfallCm: null, windKph: null, verification: cavtatClimateVerification },
      { month: "September", avgHighC: 26, avgLowC: 18, rainfallMm: 90, rainyDays: 7, humidityPct: null, sunshineHours: 8, uvIndex: 6, seaTempC: 24, snowfallCm: null, windKph: null, verification: cavtatClimateVerification },
      { month: "October", avgHighC: 22, avgLowC: 14, rainfallMm: 121, rainyDays: 9, humidityPct: null, sunshineHours: 6, uvIndex: 4, seaTempC: 21, snowfallCm: null, windKph: null, verification: cavtatClimateVerification },
      { month: "November", avgHighC: 17, avgLowC: 10, rainfallMm: 164, rainyDays: 11, humidityPct: null, sunshineHours: 4, uvIndex: 2, seaTempC: 18, snowfallCm: null, windKph: null, verification: cavtatClimateVerification },
      { month: "December", avgHighC: 13, avgLowC: 7, rainfallMm: 149, rainyDays: 12, humidityPct: null, sunshineHours: 4, uvIndex: 2, seaTempC: 16, snowfallCm: null, windKph: null, verification: cavtatClimateVerification },
    ],
    costOfLiving: [
      metric("cavtat_meal_inexpensive", "Meal at inexpensive restaurant", "EUR 14-18", cavtatCostVerification),
      metric("cavtat_meal_two_midrange", "Dinner for two, mid-range", "EUR 45-60", cavtatCostVerification),
      metric("cavtat_utilities_85", "Basic utilities (85 m²)", "EUR 125-170/month", cavtatCostVerification),
      metric("cavtat_broadband", "Broadband 60 Mbps+", "EUR 30-45/month", cavtatCostVerification),
      metric("cavtat_coffee", "Cappuccino", "EUR 2.30-3.20", cavtatCostVerification),
    ],
    neighborhoods: [
      row(
        "cavtat-harbor-core",
        "Harbor Promenade & Old Core",
        "Walkable seafront center",
        "Cavtat's seafront is lined with shops and restaurants, making this the most walkable everyday base.",
        "Best for retirees who want coffee, errands, and waterfront walks in one compact daily loop.",
        "Summer evenings can be busier; test noise after 9pm before choosing a harbor-facing unit.",
        "https://en.wikipedia.org/wiki/Cavtat",
        cavtatGeoVerification,
        "Cavtat Harbor, Cavtat, Croatia",
        15,
      ),
      row(
        "cavtat-rat-peninsula",
        "Rat Peninsula",
        "Greener edge with beach access",
        "Rat is listed among Cavtat's local beach areas and sits on the peninsula loop just east of the harbor.",
        "Strong fit for buyers who want sea-view walks and a calmer rhythm while staying close to the center.",
        "Some addresses involve hills and stairs; test grocery and pharmacy routes on foot in midday heat.",
        "https://en.wikipedia.org/wiki/Cavtat",
        cavtatGeoVerification,
        "Rat Peninsula, Cavtat, Croatia",
        15,
      ),
      row(
        "cavtat-obod-zvekovica",
        "Obod / Zvekovica Approach",
        "Residential edge above the waterfront",
        "Konavle references Cavtat and Obod together in the municipality context, with the airport corridor in nearby Cilipi.",
        "Useful if you prefer quieter residential blocks and easier road logistics over pure promenade proximity.",
        "You trade some postcard convenience for mobility practicality, so test slope, parking, and bus comfort at peak hours.",
        "https://en.wikipedia.org/wiki/Konavle",
        cavtatKonavleVerification,
        "Zvekovica, Cavtat, Croatia",
        14,
      ),
    ],
    internetMetrics: [
      metric(
        "internet_home_plan",
        "Home internet plan range",
        "EUR 30-45 / month for 60 Mbps+ plans (Cavtat/Dubrovnik area baseline)",
        cavtatInternetVerification,
      ),
      metric(
        "mobile_coverage_reality_check",
        "Mobile coverage reality check",
        "4G/5G is generally strong along the harbor-airport corridor; verify signal quality inside your exact unit.",
        cavtatMapsVerification,
      ),
    ],
    foodSpots: [
      row(
        "cavtat-food-bugenvila",
        "Restaurant Bugenvila",
        "Waterfront fine dining",
        "A high-visibility harbor choice that helps you assess premium dining quality and service reliability.",
        "Useful for testing whether upper-end dining options feel strong enough for regular hosting or family visits.",
        "Bookings and crowd pressure are strongest in peak season, especially at sunset hours.",
        "https://www.google.com/maps/search/?api=1&query=Restaurant+Bugenvila%2C+Cavtat%2C+Croatia",
        cavtatMapsVerification,
        "Restaurant Bugenvila, Cavtat, Croatia",
        15,
      ),
      row(
        "cavtat-food-dalmatino",
        "Dalmatino",
        "Old-town style dining",
        "A practical mid-range benchmark for repeat dinners and guest hosting near the center.",
        "Good for comparing pace, table turnover, and quality consistency on regular evenings.",
        "Evaluate service speed and crowd noise in both shoulder and high season.",
        "https://www.google.com/maps/search/?api=1&query=Dalmatino+Cavtat%2C+Cavtat%2C+Croatia",
        cavtatMapsVerification,
        "Dalmatino Cavtat, Croatia",
        15,
      ),
      row(
        "cavtat-food-konoba-galija",
        "Konoba Galija",
        "Classic seafood konoba",
        "A dependable seafood-style baseline close to the promenade for practical local dining checks.",
        "Useful when comparing price-to-quality against more tourist-facing waterfront menus.",
        "Check menu breadth and off-peak consistency if long-stay food quality matters to your decision.",
        "https://www.google.com/maps/search/?api=1&query=Konoba+Galija+Cavtat%2C+Cavtat%2C+Croatia",
        cavtatMapsVerification,
        "Konoba Galija Cavtat, Croatia",
        15,
      ),
    ],
    golfCourses: [
      row(
        "cavtat-golf-regional",
        "Regional golf access check",
        "No full in-town course",
        "Cavtat itself is not a golf town; regular play generally requires a regional transfer.",
        "Treat golf as an occasional add-on lifestyle activity rather than a daily local anchor.",
        "Validate drive time and route reliability before weighting golf heavily in your relocation decision.",
        "https://www.google.com/maps/search/?api=1&query=golf+near+Cavtat%2C+Croatia",
        cavtatMapsVerification,
        "Golf near Cavtat, Croatia",
        10,
      ),
    ],
    practicalInfo: [
      row(
        "cavtat-airport-access",
        "Dubrovnik Airport access",
        "Nearest airport corridor",
        "Cavtat is one of the closest coastal bases to Dubrovnik Airport for regular transfer use.",
        "Run at least one daytime and one evening transfer check to measure real door-to-door friction before committing.",
        "Peak-season traffic and transfer pricing can materially change convenience assumptions.",
        "https://www.airport-dubrovnik.hr/",
        cavtatAirportVerification,
        "Dubrovnik Airport, Croatia",
        12,
      ),
      row(
        "cavtat-healthcare-anchor",
        "HZZO orientation",
        "Public healthcare framework",
        "Croatian Health Insurance Fund (HZZO) is the baseline reference point for public system orientation.",
        "Use this as your starting point, then validate local provider access and specialist pathways during scouting.",
        "Do not rely only on index-style summaries; test practical appointment flow directly.",
        "https://hzzo.hr/en/",
        cavtatHealthcareVerification,
        "Croatian Health Insurance Fund Cavtat",
        12,
      ),
      row(
        "cavtat-residency-tax-baseline",
        "Residency and tax baseline",
        "Planning-level compliance signal",
        "Croatia residency/tax summary sources provide a clear baseline for first-pass planning.",
        "Use this for orientation, then confirm your exact case with licensed local advisors.",
        "Cross-border retirees should model health-insurance, residency timing, and tax residence triggers together.",
        "https://taxsummaries.pwc.com/croatia/individual/residence",
        cavtatTaxVerification,
        "Croatia residency tax rules",
        10,
      ),
      row(
        "cavtat-harbor-errand-loop",
        "Harbor errand loop",
        "Daily-routine practicality check",
        "The harbor and old-core area concentrate everyday walkability for cafes, groceries, and routine services.",
        "Best tested in midday heat and evening crowd windows to verify year-round repeatability.",
        "Street slope and summer density can change comfort more than map distance suggests.",
        "https://en.wikipedia.org/wiki/Cavtat",
        cavtatGeoVerification,
        "Cavtat Harbor old town errands",
        15,
      ),
    ],
    pros: [
      "Cavtat combines a highly walkable harbor core with a calmer day-to-day rhythm than Dubrovnik's old-town intensity.",
      "Airport practicality is unusually strong for a small Adriatic town because Dubrovnik Airport is nearby.",
      "The Rat Peninsula and waterfront loop create repeatable, low-friction outdoor routines for long stays.",
      "For retirees prioritizing scenic daily life, Cavtat offers clear coastal quality without giving up regional access.",
    ],
    tradeoffs: [
      "Summer crowd pressure can materially change noise, table availability, and evening pace along the promenade.",
      "Waterfront-adjacent rents and dining costs can rise in peak season versus shoulder and winter periods.",
      "Some practical routes include hills and stairs, so mobility comfort should be tested in midday conditions.",
      "Specialized services remain thinner than larger-city options, so many residents still rely on Dubrovnik for depth.",
    ],
    resources: [
      resource("cavtat-wikipedia", "neighborhood", "Cavtat overview", "Reference coverage for economy, beaches, and harbor context used in neighborhood scouting notes.", "https://en.wikipedia.org/wiki/Cavtat", "reference", "2026-07-26"),
      resource("konavle-wikipedia", "neighborhood", "Konavle municipality context", "Reference context for Cavtat-Obod municipal geography and nearby airport-corridor orientation.", "https://en.wikipedia.org/wiki/Konavle", "reference", "2026-07-26"),
      resource("cavtat-airport-official", "transport", "Dubrovnik Airport official", "Operational airport reference for route and transfer planning.", "https://www.airport-dubrovnik.hr/", "official_site", "2026-07-26"),
      resource("cavtat-hzzo", "healthcare", "HZZO official", "Croatian public health-insurance authority and orientation reference.", "https://hzzo.hr/en/", "official_site", "2026-07-26"),
      resource("cavtat-pwc-tax", "tax", "PwC Croatia residence summary", "Planning reference for Croatia tax residence baseline rules.", "https://taxsummaries.pwc.com/croatia/individual/residence", "tax_summary", "2026-07-26"),
    ],
  },
  "porto-portugal": {
    region: "Norte / Douro Estuary",
    lastVerifiedAt: "2026-07-27",
    dataConfidence: "medium",
    monthlyClimate: [
      { month: "January", avgHighC: 14, avgLowC: 6, rainfallMm: 170, rainyDays: 14, humidityPct: null, sunshineHours: 4, uvIndex: 2, seaTempC: 14, snowfallCm: null, windKph: null, verification: portoPortugalVerification },
      { month: "April", avgHighC: 18, avgLowC: 10, rainfallMm: 118, rainyDays: 12, humidityPct: null, sunshineHours: 6, uvIndex: 5, seaTempC: 15, snowfallCm: null, windKph: null, verification: portoPortugalVerification },
      { month: "July", avgHighC: 25, avgLowC: 17, rainfallMm: 24, rainyDays: 5, humidityPct: null, sunshineHours: 10, uvIndex: 8, seaTempC: 18, snowfallCm: null, windKph: null, verification: portoPortugalVerification },
      { month: "October", avgHighC: 22, avgLowC: 14, rainfallMm: 138, rainyDays: 12, humidityPct: null, sunshineHours: 6, uvIndex: 4, seaTempC: 18, snowfallCm: null, windKph: null, verification: portoPortugalVerification },
    ],
    costOfLiving: [
      metric("porto_meal_inexpensive", "Meal at inexpensive restaurant", "EUR 11-14", portoPortugalVerification),
      metric("porto_dinner_two", "Dinner for two, mid-range", "EUR 40-55", portoPortugalVerification),
      metric("porto_utilities", "Basic utilities (85 m²)", "EUR 120-175/month", portoPortugalVerification),
      metric("porto_broadband", "Broadband 60 Mbps+", "EUR 32-45/month", portoPortugalVerification),
    ],
    neighborhoods: [
      row("porto-ribeira", "Ribeira", "Historic riverfront core", "Postcard-facing old core with dense cafes and walkable daily routines.", "High lifestyle charm and immediate access to waterfront promenades.", "Expect tourism pressure in peak periods; validate noise street by street.", "https://visitporto.travel/en-GB", portoPortugalVerification, "Ribeira, Porto, Portugal", 14),
      row("porto-foz", "Foz do Douro", "Atlantic-facing residential edge", "Coastal district balancing urban life and seaside routines.", "Strong fit for retirees prioritizing daily ocean walks and calmer evenings.", "Commutes into central hubs can be slower than core-city addresses.", "https://visitporto.travel/en-GB", portoPortugalVerification, "Foz do Douro, Porto, Portugal", 13),
    ],
    practicalInfo: [
      row("porto-airport", "Porto Airport (OPO)", "Primary regional airport", "Main airport gateway for northern Portugal and international routes.", "Important for family visits and frequent short-haul European access.", "Test real transfer times from shortlist neighborhoods before signing.", "https://www.aeroportoporto.pt/en/opo/home", portoPortugalVerification, "Porto Airport, Portugal", 12),
      row("porto-metro", "Metro do Porto", "Metro and tram network", "Main public transport system for core and suburban movement.", "Useful for car-light living and day-to-day reliability checks.", "Validate route frequency for your exact district and schedule.", "https://en.metrodoporto.pt/", portoPortugalVerification, "Metro do Porto, Portugal", 13),
    ],
    pros: [
      "Porto offers strong walkability, riverfront quality, and mature day-to-day city infrastructure.",
      "Airport access and regional mobility are strong for retirees with frequent visitors.",
      "Distinct neighborhood options allow clear tradeoffs between charm, pace, and cost.",
    ],
    tradeoffs: [
      "Tourism pressure in core areas can affect noise and pricing during peak periods.",
      "Hills and older streets can create mobility friction for some retirees.",
      "Prime central and waterfront inventory often carries a meaningful rent premium.",
    ],
    resources: [
      resource("porto-visit", "local", "Visit Porto", "Official city orientation and planning portal.", "https://visitporto.travel/en-GB", "official_site", "2026-07-27"),
      resource("porto-airport-official", "transport", "Porto Airport official", "Airport operations and traveler guidance.", "https://www.aeroportoporto.pt/en/opo/home", "official_site", "2026-07-27"),
      resource("porto-metro-official", "transport", "Metro do Porto", "Metro network routes and practical transit planning.", "https://en.metrodoporto.pt/", "official_site", "2026-07-27"),
      resource("porto-tax", "tax", "PwC Portugal residence summary", "Tax-residence baseline reference for early planning.", "https://taxsummaries.pwc.com/portugal/individual/residence", "tax_summary", "2026-07-27"),
    ],
  },
  "lisbon-portugal": {
    region: "Lisbon Metropolitan Area",
    lastVerifiedAt: "2026-07-27",
    dataConfidence: "medium",
    monthlyClimate: [
      { month: "January", avgHighC: 15, avgLowC: 8, rainfallMm: 102, rainyDays: 11, humidityPct: null, sunshineHours: 5, uvIndex: 2, seaTempC: 15, snowfallCm: null, windKph: null, verification: lisbonVerification },
      { month: "April", avgHighC: 20, avgLowC: 12, rainfallMm: 66, rainyDays: 8, humidityPct: null, sunshineHours: 8, uvIndex: 5, seaTempC: 16, snowfallCm: null, windKph: null, verification: lisbonVerification },
      { month: "July", avgHighC: 29, avgLowC: 19, rainfallMm: 6, rainyDays: 2, humidityPct: null, sunshineHours: 11, uvIndex: 9, seaTempC: 19, snowfallCm: null, windKph: null, verification: lisbonVerification },
      { month: "October", avgHighC: 24, avgLowC: 16, rainfallMm: 101, rainyDays: 9, humidityPct: null, sunshineHours: 7, uvIndex: 5, seaTempC: 19, snowfallCm: null, windKph: null, verification: lisbonVerification },
    ],
    costOfLiving: [
      metric("lisbon_meal_inexpensive", "Meal at inexpensive restaurant", "EUR 12-16", lisbonVerification),
      metric("lisbon_dinner_two", "Dinner for two, mid-range", "EUR 45-65", lisbonVerification),
      metric("lisbon_utilities", "Basic utilities (85 m²)", "EUR 125-190/month", lisbonVerification),
      metric("lisbon_broadband", "Broadband 60 Mbps+", "EUR 35-48/month", lisbonVerification),
    ],
    neighborhoods: [
      row("lisbon-principe-real", "Principe Real", "Central premium residential district", "Popular with long-stay residents seeking walkability and refined daily amenities.", "Strong fit for retirees wanting central access without full nightlife intensity.", "Hilly terrain and pricing premium require street-level due diligence.", "https://www.visitlisboa.com/en", lisbonVerification, "Principe Real, Lisbon, Portugal", 14),
      row("lisbon-alvalade", "Alvalade", "Residential local-rhythm neighborhood", "Known for day-to-day practicality, services, and calmer routines.", "Useful for retirees preferring functional comfort over tourist-core pace.", "Less riverfront postcard appeal than central historic neighborhoods.", "https://www.visitlisboa.com/en", lisbonVerification, "Alvalade, Lisbon, Portugal", 13),
    ],
    practicalInfo: [
      row("lisbon-airport", "Lisbon Airport (LIS)", "Main international airport", "Primary hub for Portugal with broad short-haul and long-haul connectivity.", "Operationally strong for family visits and regular travel.", "Validate transfer times from your neighborhood shortlist.", "https://www.ana.pt/en/lis/home", lisbonVerification, "Lisbon Airport, Portugal", 12),
      row("lisbon-metro", "Lisbon Metro", "Core metro network", "Primary urban mobility backbone for central and near-central neighborhoods.", "Useful for car-light retirement planning and airport access checks.", "Route quality varies by district; test at commuting hours.", "https://www.metrolisboa.pt/en/", lisbonVerification, "Lisbon Metro, Portugal", 13),
    ],
    pros: [
      "Lisbon combines mild climate, strong city infrastructure, and broad international access.",
      "Neighborhood diversity supports multiple retirement styles from central to residential calm.",
      "Public transit and airport connectivity reduce dependence on daily car use.",
    ],
    tradeoffs: [
      "Central rents can be expensive, especially in premium districts.",
      "Steep streets and elevation changes can affect mobility comfort.",
      "Tourism concentration in core zones can impact noise and service consistency seasonally.",
    ],
    resources: [
      resource("lisbon-visit", "local", "Visit Lisboa", "Official destination and city-planning portal.", "https://www.visitlisboa.com/en", "official_site", "2026-07-27"),
      resource("lisbon-airport-official", "transport", "Lisbon Airport official", "Operational airport information and traveler guidance.", "https://www.ana.pt/en/lis/home", "official_site", "2026-07-27"),
      resource("lisbon-metro-official", "transport", "Lisbon Metro", "Metro network routes and practical planning information.", "https://www.metrolisboa.pt/en/", "official_site", "2026-07-27"),
      resource("lisbon-tax", "tax", "PwC Portugal residence summary", "Tax-residence baseline for cross-border planning.", "https://taxsummaries.pwc.com/portugal/individual/residence", "tax_summary", "2026-07-27"),
    ],
  },
  "matera-italy": {
    region: "Basilicata / Southern Italy",
    lastVerifiedAt: "2026-07-27",
    dataConfidence: "medium",
    monthlyClimate: [
      { month: "January", avgHighC: 10, avgLowC: 2, rainfallMm: 59, rainyDays: 8, humidityPct: null, sunshineHours: 4, uvIndex: 2, seaTempC: null, snowfallCm: null, windKph: null, verification: materaVerification },
      { month: "April", avgHighC: 17, avgLowC: 8, rainfallMm: 52, rainyDays: 7, humidityPct: null, sunshineHours: 6, uvIndex: 5, seaTempC: null, snowfallCm: null, windKph: null, verification: materaVerification },
      { month: "July", avgHighC: 31, avgLowC: 19, rainfallMm: 24, rainyDays: 3, humidityPct: null, sunshineHours: 10, uvIndex: 9, seaTempC: null, snowfallCm: null, windKph: null, verification: materaVerification },
      { month: "October", avgHighC: 22, avgLowC: 13, rainfallMm: 69, rainyDays: 7, humidityPct: null, sunshineHours: 6, uvIndex: 5, seaTempC: null, snowfallCm: null, windKph: null, verification: materaVerification },
    ],
    costOfLiving: [
      metric("matera_meal_inexpensive", "Meal at inexpensive restaurant", "EUR 12-16", materaVerification),
      metric("matera_dinner_two", "Dinner for two, mid-range", "EUR 45-60", materaVerification),
      metric("matera_utilities", "Basic utilities (85 m²)", "EUR 110-160/month", materaVerification),
      metric("matera_broadband", "Broadband 60 Mbps+", "EUR 28-38/month", materaVerification),
    ],
    neighborhoods: [
      row("matera-sassi", "Sassi", "Historic cave-district core", "World-famous historic district with high visual character and tourism demand.", "Excellent for lifestyle ambiance and walkable culture-first routines.", "Historic housing layouts can reduce day-to-day convenience for some retirees.", "https://www.italia.it/en/basilicata/matera", materaVerification, "Sassi di Matera, Italy", 14),
      row("matera-plateau", "Piano / modern center", "Practical modern-services zone", "More conventional city fabric with easier access to daily services and road links.", "Useful for retirees prioritizing practicality over pure postcard immersion.", "Lower dramatic charm than Sassi but often easier for routine logistics.", "https://www.italia.it/en/basilicata/matera", materaVerification, "Matera city center, Italy", 13),
    ],
    practicalInfo: [
      row("matera-rail", "Matera rail access", "Regional train and station planning", "Regional rail links are practical but often require connection planning for long-haul routes.", "Important for retirees who expect frequent inter-city mobility.", "Test real itinerary times before assuming frictionless same-day travel.", "https://www.trenitalia.com/en.html", materaVerification, "Matera, Italy", 11),
      row("matera-healthcare", "Basilicata healthcare orientation", "Regional public-health framework", "Use regional and national health-system references to plan registration and provider access.", "Useful baseline before district-level provider due diligence.", "Confirm specialist access and appointment flow during scouting.", "https://www.salute.gov.it/portale/home.html", materaVerification, "Matera healthcare, Italy", 11),
    ],
    pros: [
      "Matera delivers exceptional historic character with strong cultural identity.",
      "Daily life can be calmer and less saturated than larger Italian metros.",
      "Core districts support walkable routines for residents prioritizing ambience.",
    ],
    tradeoffs: [
      "Historic topography and stairs can challenge mobility in some subareas.",
      "Connectivity for major international travel is less direct than large hubs.",
      "Prime heritage addresses can carry premium pricing for their category.",
    ],
    resources: [
      resource("matera-italia", "local", "Italia.it Matera", "Official destination overview and planning context.", "https://www.italia.it/en/basilicata/matera", "official_site", "2026-07-27"),
      resource("matera-trenitalia", "transport", "Trenitalia", "National rail planning and operational schedules.", "https://www.trenitalia.com/en.html", "official_site", "2026-07-27"),
      resource("matera-health-ministry", "healthcare", "Italian Ministry of Health", "National health-system orientation source.", "https://www.salute.gov.it/portale/home.html", "government_portal", "2026-07-27"),
      resource("matera-tax", "tax", "PwC Italy residence summary", "Tax-residence baseline for cross-border planning.", "https://taxsummaries.pwc.com/italy/individual/residence", "tax_summary", "2026-07-27"),
    ],
  },
  "trieste-italy": {
    region: "Friuli Venezia Giulia / Adriatic",
    lastVerifiedAt: "2026-07-27",
    dataConfidence: "medium",
    monthlyClimate: [
      { month: "January", avgHighC: 8, avgLowC: 2, rainfallMm: 68, rainyDays: 8, humidityPct: null, sunshineHours: 3, uvIndex: 2, seaTempC: 11, snowfallCm: null, windKph: null, verification: triesteVerification },
      { month: "April", avgHighC: 16, avgLowC: 9, rainfallMm: 86, rainyDays: 9, humidityPct: null, sunshineHours: 6, uvIndex: 5, seaTempC: 13, snowfallCm: null, windKph: null, verification: triesteVerification },
      { month: "July", avgHighC: 28, avgLowC: 20, rainfallMm: 77, rainyDays: 7, humidityPct: null, sunshineHours: 9, uvIndex: 8, seaTempC: 25, snowfallCm: null, windKph: null, verification: triesteVerification },
      { month: "October", avgHighC: 19, avgLowC: 13, rainfallMm: 101, rainyDays: 9, humidityPct: null, sunshineHours: 5, uvIndex: 4, seaTempC: 19, snowfallCm: null, windKph: null, verification: triesteVerification },
    ],
    costOfLiving: [
      metric("trieste_meal_inexpensive", "Meal at inexpensive restaurant", "EUR 13-17", triesteVerification),
      metric("trieste_dinner_two", "Dinner for two, mid-range", "EUR 50-65", triesteVerification),
      metric("trieste_utilities", "Basic utilities (85 m²)", "EUR 130-190/month", triesteVerification),
      metric("trieste_broadband", "Broadband 60 Mbps+", "EUR 30-42/month", triesteVerification),
    ],
    neighborhoods: [
      row("trieste-centro", "Centro Storico", "Historic central core", "Walkable center with strong cafe culture, civic life, and sea-facing urban routines.", "Good fit for retirees who want city services and waterfront access on foot.", "Parking and peak-hour traffic can be difficult in central pockets.", "https://www.turismofvg.it/en/trieste", triesteVerification, "Trieste city center, Italy", 14),
      row("trieste-barcola", "Barcola", "Seafront residential strip", "Popular coastal stretch for daily sea walks and lower-density rhythm.", "Strong lifestyle option for retirees who prioritize waterfront routine quality.", "Commuting into central services can be slower depending on address and timing.", "https://www.turismofvg.it/en/trieste", triesteVerification, "Barcola, Trieste, Italy", 13),
    ],
    practicalInfo: [
      row("trieste-airport", "Trieste Airport", "Regional airport access", "Primary local airport for domestic and European routing.", "Operationally useful for frequent travel and family visit planning.", "Validate route availability against your real travel calendar.", "https://triesteairport.it/en/", triesteVerification, "Trieste Airport, Italy", 12),
      row("trieste-rail", "Trieste Centrale", "Main rail station", "Main rail node for northern-Italy and cross-border route planning.", "Useful for car-light retirement routines and day-trip mobility.", "Test transfer friction if combining rail and airport travel often.", "https://www.trenitalia.com/en.html", triesteVerification, "Trieste Centrale, Italy", 12),
    ],
    pros: [
      "Trieste blends waterfront quality with practical city infrastructure.",
      "Cross-border positioning supports flexible regional travel options.",
      "Central districts provide strong walkable routines for daily life.",
    ],
    tradeoffs: [
      "Bora wind periods can affect comfort for some residents.",
      "Some central and seafront zones carry meaningful rent premiums.",
      "Micro-location matters for balancing calm residential rhythm with convenience.",
    ],
    resources: [
      resource("trieste-tourism", "local", "Turismo FVG Trieste", "Official destination orientation and planning hub.", "https://www.turismofvg.it/en/trieste", "official_site", "2026-07-27"),
      resource("trieste-airport-official", "transport", "Trieste Airport official", "Airport operations and schedule planning resource.", "https://triesteairport.it/en/", "official_site", "2026-07-27"),
      resource("trieste-trenitalia", "transport", "Trenitalia", "National rail planning platform for long-stay logistics.", "https://www.trenitalia.com/en.html", "official_site", "2026-07-27"),
      resource("trieste-tax", "tax", "PwC Italy residence summary", "Tax-residence baseline for cross-border planning.", "https://taxsummaries.pwc.com/italy/individual/residence", "tax_summary", "2026-07-27"),
    ],
  },
  "chiang-mai-thailand": {
    region: "Northern Thailand",
    lastVerifiedAt: "2026-07-27",
    dataConfidence: "medium",
    monthlyClimate: [
      { month: "January", avgHighC: 30, avgLowC: 15, rainfallMm: 8, rainyDays: 1, humidityPct: null, sunshineHours: 9, uvIndex: 8, seaTempC: null, snowfallCm: null, windKph: null, verification: chiangMaiVerification },
      { month: "April", avgHighC: 36, avgLowC: 23, rainfallMm: 60, rainyDays: 6, humidityPct: null, sunshineHours: 8, uvIndex: 10, seaTempC: null, snowfallCm: null, windKph: null, verification: chiangMaiVerification },
      { month: "July", avgHighC: 32, avgLowC: 24, rainfallMm: 160, rainyDays: 17, humidityPct: null, sunshineHours: 6, uvIndex: 9, seaTempC: null, snowfallCm: null, windKph: null, verification: chiangMaiVerification },
      { month: "October", avgHighC: 31, avgLowC: 22, rainfallMm: 120, rainyDays: 13, humidityPct: null, sunshineHours: 6, uvIndex: 8, seaTempC: null, snowfallCm: null, windKph: null, verification: chiangMaiVerification },
    ],
    costOfLiving: [
      metric("cm_meal_inexpensive", "Meal at inexpensive restaurant", "THB 70-120", chiangMaiVerification),
      metric("cm_dinner_two", "Dinner for two, mid-range", "THB 600-1,200", chiangMaiVerification),
      metric("cm_utilities", "Basic utilities (85 m²)", "THB 1,800-3,500/month", chiangMaiVerification),
      metric("cm_broadband", "Broadband 60 Mbps+", "THB 500-900/month", chiangMaiVerification),
    ],
    neighborhoods: [
      row("cm-nimman", "Nimman", "Modern cafe and remote-work district", "Popular with long-stay expats for convenience, cafes, and mixed-use daily life.", "Strong fit for retirees wanting easy access to services and social rhythm.", "Can feel busy and more commercial than quieter residential pockets.", "https://www.tourismthailand.org/Destinations/Provinces/Chiang-Mai/101", chiangMaiVerification, "Nimman, Chiang Mai, Thailand", 14),
      row("cm-old-city", "Old City", "Historic walled center", "Central cultural district with temples, walkability, and routine local services.", "Useful for retirees who value culture and compact daily errands.", "Tourism activity can be high in parts of the district during peak travel months.", "https://www.tourismthailand.org/Destinations/Provinces/Chiang-Mai/101", chiangMaiVerification, "Chiang Mai Old City, Thailand", 14),
    ],
    practicalInfo: [
      row("cm-airport", "Chiang Mai International Airport", "Main regional airport", "Primary airport with domestic and selected international routes.", "Operationally convenient for regional travel and family visitation cycles.", "Route mix can shift seasonally; validate your specific travel pattern.", "https://www.chiangmai.airportthai.co.th/en", chiangMaiVerification, "Chiang Mai Airport, Thailand", 12),
      row("cm-healthcare", "Chiang Mai healthcare orientation", "Hospital and insurance planning", "City is known for broad private-hospital access compared with smaller Thai markets.", "Useful for retirees prioritizing specialist access and English-speaking services.", "Confirm insurer acceptance and appointment flow before relocation commitment.", "https://www.tourismthailand.org/Destinations/Provinces/Chiang-Mai/101", chiangMaiVerification, "Chiang Mai healthcare, Thailand", 12),
    ],
    pros: [
      "Chiang Mai offers strong day-to-day affordability versus many coastal retirement markets.",
      "Neighborhood options support both social remote-work rhythm and quieter local living.",
      "Airport and healthcare depth are practical strengths for long-stay retirees.",
    ],
    tradeoffs: [
      "Seasonal air-quality periods can materially affect comfort and outdoor routines.",
      "Heat and humidity in hot/rainy seasons may challenge some retirees.",
      "Visa and residency pathway details require careful, current legal verification.",
    ],
    resources: [
      resource("cm-tourism", "local", "Tourism Authority of Thailand - Chiang Mai", "Official destination orientation and planning portal.", "https://www.tourismthailand.org/Destinations/Provinces/Chiang-Mai/101", "official_site", "2026-07-27"),
      resource("cm-airport-official", "transport", "Chiang Mai Airport official", "Airport operations and traveler guidance.", "https://www.chiangmai.airportthai.co.th/en", "official_site", "2026-07-27"),
      resource("cm-tax", "tax", "PwC Thailand residence summary", "Tax-residence planning baseline for long-stay retirees.", "https://taxsummaries.pwc.com/thailand/individual/residence", "tax_summary", "2026-07-27"),
      resource("cm-visa", "visa", "Thai e-visa portal", "Official visa-application information portal.", "https://www.thaievisa.go.th/", "government_portal", "2026-07-27"),
    ],
  },
  "braga-portugal": {
    region: "Minho / Northern Portugal",
    lastVerifiedAt: "2026-07-27",
    dataConfidence: "medium",
    monthlyClimate: [
      { month: "January", avgHighC: 13, avgLowC: 5, rainfallMm: 171, rainyDays: 16, humidityPct: null, sunshineHours: 4, uvIndex: 2, seaTempC: null, snowfallCm: null, windKph: null, verification: bragaVerification },
      { month: "April", avgHighC: 18, avgLowC: 8, rainfallMm: 113, rainyDays: 13, humidityPct: null, sunshineHours: 6, uvIndex: 5, seaTempC: null, snowfallCm: null, windKph: null, verification: bragaVerification },
      { month: "July", avgHighC: 27, avgLowC: 15, rainfallMm: 22, rainyDays: 4, humidityPct: null, sunshineHours: 9, uvIndex: 8, seaTempC: null, snowfallCm: null, windKph: null, verification: bragaVerification },
      { month: "October", avgHighC: 21, avgLowC: 11, rainfallMm: 166, rainyDays: 14, humidityPct: null, sunshineHours: 5, uvIndex: 4, seaTempC: null, snowfallCm: null, windKph: null, verification: bragaVerification },
    ],
    costOfLiving: [
      metric("meal_inexpensive", "Meal at inexpensive restaurant", "EUR 9-12", bragaVerification),
      metric("meal_two_midrange", "Dinner for two, mid-range", "EUR 35-50", bragaVerification),
      metric("utilities", "Basic utilities (85 m²)", "EUR 95-150/month", bragaVerification),
      metric("broadband", "Broadband 60 Mbps+", "EUR 28-38/month", bragaVerification),
    ],
    neighborhoods: [
      row("braga-centro", "Historic Centre", "Core city-center district", "Walkable historic core with civic life, cafes, and everyday services.", "Good for retirees who want compact city routines and strong public life.", "Validate parking and nighttime noise if you prefer a quieter base.", "https://www.visitbraga.travel/en", bragaVerification, "Braga, Portugal", 14),
      row("braga-nogueiró", "Nogueiró / Tenões", "Residential hillside edge", "Calmer residential option with city access and more room than the center.", "Useful if you want a slower daily rhythm with practical access into town.", "Hills and route friction are worth checking before picking an address.", "https://www.visitbraga.travel/en", bragaVerification, "Nogueiro, Braga, Portugal", 13),
    ],
    practicalInfo: [
      row("braga-rail", "Braga Railway Station", "Regional rail and mobility anchor", "Main rail node for regional and national movement.", "Important for car-light retirees and day-trip planning.", "Test the transfer chain if you expect frequent airport or coastal trips.", "https://www.cp.pt/passageiros/en", bragaVerification, "Braga Railway Station, Portugal", 12),
      row("braga-health", "Braga healthcare orientation", "Public and private care planning", "Use official Portuguese health-system references to plan coverage and provider access.", "Worth checking early if healthcare depth is a top priority.", "Confirm specialist wait times and insurance acceptance directly.", "https://www.sns.gov.pt/", bragaVerification, "Braga healthcare, Portugal", 12),
    ],
    pros: [
      "Braga offers a walkable historic core with a strong everyday-city feel.",
      "Costs are generally friendlier than Portugal's most expensive coastal markets.",
      "Rail and road mobility make regional movement practical for long stays.",
    ],
    tradeoffs: [
      "It is inland rather than seaside, so beach access requires a drive or train-plus-drive pattern.",
      "Hills and rainier winters can change the feel of daily routines.",
      "Central parking and peak-hour traffic can matter if you rely on a car.",
    ],
    resources: [
      resource("braga-visit", "local", "Visit Braga", "Official destination and city-planning portal.", "https://www.visitbraga.travel/en", "official_site", "2026-07-27"),
      resource("braga-rail", "transport", "CP - Braga station", "Rail planning reference for regional mobility.", "https://www.cp.pt/passageiros/en", "official_site", "2026-07-27"),
      resource("braga-sns", "healthcare", "SNS Portugal", "National health system orientation.", "https://www.sns.gov.pt/", "official_site", "2026-07-27"),
      resource("braga-tax", "tax", "PwC Portugal residence summary", "Tax-residence baseline for planning.", "https://taxsummaries.pwc.com/portugal/individual/residence", "tax_summary", "2026-07-27"),
    ],
  },
  "zadar-croatia": {
    region: "Dalmatia / Adriatic Coast",
    lastVerifiedAt: "2026-07-27",
    dataConfidence: "medium",
    monthlyClimate: [
      { month: "January", avgHighC: 11, avgLowC: 4, rainfallMm: 107, rainyDays: 11, humidityPct: null, sunshineHours: 5, uvIndex: 2, seaTempC: 13, snowfallCm: null, windKph: null, verification: zadarVerification },
      { month: "April", avgHighC: 18, avgLowC: 10, rainfallMm: 66, rainyDays: 8, humidityPct: null, sunshineHours: 7, uvIndex: 5, seaTempC: 15, snowfallCm: null, windKph: null, verification: zadarVerification },
      { month: "July", avgHighC: 30, avgLowC: 21, rainfallMm: 36, rainyDays: 4, humidityPct: null, sunshineHours: 11, uvIndex: 9, seaTempC: 25, snowfallCm: null, windKph: null, verification: zadarVerification },
      { month: "October", avgHighC: 21, avgLowC: 14, rainfallMm: 118, rainyDays: 9, humidityPct: null, sunshineHours: 6, uvIndex: 4, seaTempC: 20, snowfallCm: null, windKph: null, verification: zadarVerification },
    ],
    costOfLiving: [
      metric("meal_inexpensive", "Meal at inexpensive restaurant", "EUR 12-16", zadarVerification),
      metric("meal_two_midrange", "Dinner for two, mid-range", "EUR 45-60", zadarVerification),
      metric("utilities", "Basic utilities (85 m²)", "EUR 110-160/month", zadarVerification),
      metric("broadband", "Broadband 60 Mbps+", "EUR 28-40/month", zadarVerification),
    ],
    neighborhoods: [
      row("zadar-old-town", "Old Town", "Historic peninsula core", "Waterfront historic center with daily-life services and a dense urban feel.", "Ideal for retirees who want walkability and active public space.", "Tourism pressure can shape quietness and pricing in peak season.", "https://www.zadar.travel/en", zadarVerification, "Zadar Old Town, Croatia", 14),
      row("zadar-borik", "Borik", "Residential coastal district", "Popular residential and beach-access area with a slower rhythm than the old core.", "Useful if you want more practical day-to-day living and seaside access.", "Distance to the historic center matters if you want to walk everywhere.", "https://www.zadar.travel/en", zadarVerification, "Borik, Zadar, Croatia", 13),
    ],
    practicalInfo: [
      row("zadar-airport", "Zadar Airport", "Regional airport access", "Primary airport for the city and surrounding coast.", "Important for family visits and simpler travel planning.", "Test actual transfer times from your shortlist district.", "https://www.zadar-airport.hr/en", zadarVerification, "Zadar Airport, Croatia", 12),
      row("zadar-transit", "Local bus / ferry orientation", "Daily mobility baseline", "Local transit and ferry links shape how easy car-light life feels.", "Useful when comparing old-town versus residential-edge addresses.", "Validate schedules in both shoulder and summer seasons.", "https://www.zadar.travel/en", zadarVerification, "Zadar transit, Croatia", 12),
    ],
    pros: [
      "Zadar gives you coastal living with a genuine year-round city structure.",
      "The old town and residential coastal zones create clear lifestyle tradeoffs.",
      "Airport access keeps short-haul travel practical for visitors and scouting trips.",
    ],
    tradeoffs: [
      "Peak-season tourism can materially affect old-town calm and pricing.",
      "Car-free convenience depends heavily on exact neighborhood choice.",
      "Beach-adjacent living can trade off against faster access to central services.",
    ],
    resources: [
      resource("zadar-tourism", "local", "Zadar Tourist Board", "Official orientation and destination planning portal.", "https://www.zadar.travel/en", "official_site", "2026-07-27"),
      resource("zadar-airport-official", "transport", "Zadar Airport", "Airport operations and traveler guidance.", "https://www.zadar-airport.hr/en", "official_site", "2026-07-27"),
      resource("zadar-hzzo", "healthcare", "Croatian Health Insurance Fund", "National healthcare orientation.", "https://hzzo.hr/en/", "official_site", "2026-07-27"),
      resource("zadar-tax", "tax", "PwC Croatia residence summary", "Tax-residence baseline for planning.", "https://taxsummaries.pwc.com/croatia/individual/residence", "tax_summary", "2026-07-27"),
    ],
  },
  "lucca-italy": {
    region: "Tuscany",
    lastVerifiedAt: "2026-07-27",
    dataConfidence: "medium",
    monthlyClimate: [
      { month: "January", avgHighC: 11, avgLowC: 3, rainfallMm: 83, rainyDays: 9, humidityPct: null, sunshineHours: 4, uvIndex: 2, seaTempC: null, snowfallCm: null, windKph: null, verification: luccaVerification },
      { month: "April", avgHighC: 18, avgLowC: 7, rainfallMm: 74, rainyDays: 9, humidityPct: null, sunshineHours: 6, uvIndex: 5, seaTempC: null, snowfallCm: null, windKph: null, verification: luccaVerification },
      { month: "July", avgHighC: 31, avgLowC: 18, rainfallMm: 38, rainyDays: 5, humidityPct: null, sunshineHours: 9, uvIndex: 9, seaTempC: null, snowfallCm: null, windKph: null, verification: luccaVerification },
      { month: "October", avgHighC: 21, avgLowC: 12, rainfallMm: 111, rainyDays: 10, humidityPct: null, sunshineHours: 5, uvIndex: 4, seaTempC: null, snowfallCm: null, windKph: null, verification: luccaVerification },
    ],
    costOfLiving: [
      metric("meal_inexpensive", "Meal at inexpensive restaurant", "EUR 12-18", luccaVerification),
      metric("meal_two_midrange", "Dinner for two, mid-range", "EUR 45-65", luccaVerification),
      metric("utilities", "Basic utilities (85 m²)", "EUR 110-170/month", luccaVerification),
      metric("broadband", "Broadband 60 Mbps+", "EUR 28-40/month", luccaVerification),
    ],
    neighborhoods: [
      row("lucca-centro-storico", "Centro Storico", "Walled historic core", "Fully walkable historic center with daily services and a strong quality-of-life feel.", "Excellent for retirees who want compact routines and heritage ambience.", "Tourism and parking constraints are real, so test access rules carefully.", "https://www.turismo.lucca.it/en", luccaVerification, "Lucca, Italy", 14),
      row("lucca-san-concordio", "San Concordio", "Practical residential edge", "Convenient residential district outside the walls with easier everyday logistics.", "Good for retirees who want proximity to the center without full historic-core constraints.", "Less atmospheric than inside the walls but often easier for routine living.", "https://www.turismo.lucca.it/en", luccaVerification, "San Concordio, Lucca, Italy", 13),
    ],
    practicalInfo: [
      row("lucca-rail", "Lucca railway station", "Regional mobility anchor", "Main rail station for regional and wider Tuscany travel.", "Important for car-light living and day-trip planning.", "Test late-evening arrival and luggage flow before signing a lease.", "https://www.trenitalia.com/en.html", luccaVerification, "Lucca railway station, Italy", 12),
      row("lucca-health", "Tuscan healthcare orientation", "Regional health-system baseline", "Use national and regional health-system references to plan coverage and provider access.", "Useful before relying on anecdotal expat recommendations.", "Confirm waiting times and specialist access in the exact district you prefer.", "https://www.regione.toscana.it/", luccaVerification, "Lucca healthcare, Italy", 12),
    ],
    pros: [
      "Lucca offers exceptional historic ambience with a strong everyday livability profile.",
      "The walled center supports a highly walkable retirement routine.",
      "Rail access keeps regional Tuscany trips practical without constant driving.",
    ],
    tradeoffs: [
      "Parking and car access can be more cumbersome inside or near the walls.",
      "Tourist intensity can rise in the historic center during peak periods.",
      "Prime addresses inside the walls often carry a lifestyle premium.",
    ],
    resources: [
      resource("lucca-tourism", "local", "Turismo Lucca", "Official city orientation and planning portal.", "https://www.turismo.lucca.it/en", "official_site", "2026-07-27"),
      resource("lucca-trenitalia", "transport", "Trenitalia", "Rail planning for regional mobility.", "https://www.trenitalia.com/en.html", "official_site", "2026-07-27"),
      resource("lucca-region-tuscany", "healthcare", "Regione Toscana", "Regional governance and services portal.", "https://www.regione.toscana.it/", "official_site", "2026-07-27"),
      resource("lucca-tax", "tax", "PwC Italy residence summary", "Tax-residence baseline for planning.", "https://taxsummaries.pwc.com/italy/individual/residence", "tax_summary", "2026-07-27"),
    ],
  },
  "nafplio-greece": {
    region: "Peloponnese / Argolis",
    lastVerifiedAt: "2026-07-27",
    dataConfidence: "medium",
    monthlyClimate: [
      { month: "January", avgHighC: 13, avgLowC: 6, rainfallMm: 87, rainyDays: 9, humidityPct: null, sunshineHours: 5, uvIndex: 2, seaTempC: 15, snowfallCm: null, windKph: null, verification: nafplioVerification },
      { month: "April", avgHighC: 20, avgLowC: 11, rainfallMm: 40, rainyDays: 6, humidityPct: null, sunshineHours: 8, uvIndex: 6, seaTempC: 16, snowfallCm: null, windKph: null, verification: nafplioVerification },
      { month: "July", avgHighC: 33, avgLowC: 22, rainfallMm: 6, rainyDays: 1, humidityPct: null, sunshineHours: 11, uvIndex: 10, seaTempC: 25, snowfallCm: null, windKph: null, verification: nafplioVerification },
      { month: "October", avgHighC: 23, avgLowC: 15, rainfallMm: 55, rainyDays: 7, humidityPct: null, sunshineHours: 7, uvIndex: 5, seaTempC: 22, snowfallCm: null, windKph: null, verification: nafplioVerification },
    ],
    costOfLiving: [
      metric("meal_inexpensive", "Meal at inexpensive restaurant", "EUR 10-14", nafplioVerification),
      metric("meal_two_midrange", "Dinner for two, mid-range", "EUR 40-55", nafplioVerification),
      metric("utilities", "Basic utilities (85 m²)", "EUR 105-155/month", nafplioVerification),
      metric("broadband", "Broadband 60 Mbps+", "EUR 26-36/month", nafplioVerification),
    ],
    neighborhoods: [
      row("nafplio-old-town", "Old Town", "Historic waterfront core", "Compact historic center with strong walkability and seafront character.", "Best for retirees who want daily routine, cafes, and heritage in a small radius.", "Tourism and parking pressure are important to test block by block.", "https://www.visitnafplio.com/en/", nafplioVerification, "Nafplio Old Town, Greece", 14),
      row("nafplio-nea-neo", "Nea Kios / approach edge", "Quieter practical edge", "More practical living option outside the tightest tourist core.", "Useful if you want easier parking and calmer daily circulation.", "Less atmospheric than the old town but often better for routine logistics.", "https://www.visitnafplio.com/en/", nafplioVerification, "Nafplio, Greece", 13),
    ],
    practicalInfo: [
      row("nafplio-access", "Argolis access", "Regional mobility orientation", "Road and bus access shape how easy regional movement feels.", "Useful when comparing coastal lifestyle to day-trip practicality.", "Validate airport transfer assumptions if you travel often.", "https://www.visitnafplio.com/en/", nafplioVerification, "Nafplio access, Greece", 12),
      row("nafplio-health", "Greek public healthcare orientation", "Coverage baseline", "Start with the public system baseline and then check local provider access.", "Important if healthcare reliability is a top retirement criterion.", "Do not assume specialist availability without direct verification.", "https://www.moh.gov.gr/", nafplioVerification, "Nafplio healthcare, Greece", 11),
    ],
    pros: [
      "Nafplio combines scenic waterfront life with a compact, highly walkable daily routine.",
      "The historic center gives strong lifestyle appeal without needing a large-city footprint.",
      "It can work well for retirees who want charm first and complexity second.",
    ],
    tradeoffs: [
      "The old town can be tourist-heavy and parking-sensitive.",
      "Transport depth is thinner than major metropolitan alternatives.",
      "Peak-season crowding can change the feel of the seafront dramatically.",
    ],
    resources: [
      resource("nafplio-tourism", "local", "Visit Nafplio", "Official destination and planning portal.", "https://www.visitnafplio.com/en/", "official_site", "2026-07-27"),
      resource("nafplio-health-ministry", "healthcare", "Greek Ministry of Health", "Public health system orientation.", "https://www.moh.gov.gr/", "government_portal", "2026-07-27"),
      resource("nafplio-tax", "tax", "PwC Greece residence summary", "Tax-residence baseline for planning.", "https://taxsummaries.pwc.com/greece/individual/residence", "tax_summary", "2026-07-27"),
      resource("nafplio-official-region", "transport", "Region of Peloponnese", "Regional civic and travel reference.", "https://www.ppel.gov.gr/en/", "official_site", "2026-07-27"),
    ],
  },
  "monopoli-italy": {
    region: "Puglia / Adriatic",
    lastVerifiedAt: "2026-07-27",
    dataConfidence: "medium",
    monthlyClimate: [
      { month: "January", avgHighC: 12, avgLowC: 6, rainfallMm: 62, rainyDays: 8, humidityPct: null, sunshineHours: 5, uvIndex: 2, seaTempC: 14, snowfallCm: null, windKph: null, verification: monopoliVerification },
      { month: "April", avgHighC: 18, avgLowC: 10, rainfallMm: 53, rainyDays: 7, humidityPct: null, sunshineHours: 7, uvIndex: 5, seaTempC: 15, snowfallCm: null, windKph: null, verification: monopoliVerification },
      { month: "July", avgHighC: 30, avgLowC: 21, rainfallMm: 24, rainyDays: 3, humidityPct: null, sunshineHours: 10, uvIndex: 9, seaTempC: 25, snowfallCm: null, windKph: null, verification: monopoliVerification },
      { month: "October", avgHighC: 22, avgLowC: 15, rainfallMm: 75, rainyDays: 8, humidityPct: null, sunshineHours: 6, uvIndex: 4, seaTempC: 21, snowfallCm: null, windKph: null, verification: monopoliVerification },
    ],
    costOfLiving: [
      metric("meal_inexpensive", "Meal at inexpensive restaurant", "EUR 11-15", monopoliVerification),
      metric("meal_two_midrange", "Dinner for two, mid-range", "EUR 45-60", monopoliVerification),
      metric("utilities", "Basic utilities (85 m²)", "EUR 100-150/month", monopoliVerification),
      metric("broadband", "Broadband 60 Mbps+", "EUR 28-38/month", monopoliVerification),
    ],
    neighborhoods: [
      row("monopoli-centro-storico", "Centro Storico", "Historic seafront core", "Walkable old center with harbor access and strong everyday charm.", "Good fit if you want sea life and daily walking in a compact zone.", "Tourism pressure and parking are the main practical constraints.", "https://www.visitmonopoli.it/en/", monopoliVerification, "Monopoli, Italy", 14),
      row("monopoli-caporale", "Peripheral residential edge", "Quieter living zone", "More practical residential fabric away from the tightest tourist core.", "Useful if you want calmer evenings and easier routine logistics.", "Less postcard appeal than the old town but often more livable for long stays.", "https://www.visitmonopoli.it/en/", monopoliVerification, "Monopoli, Italy", 13),
    ],
    practicalInfo: [
      row("monopoli-rail", "Monopoli railway station", "Regional mobility anchor", "Rail station for Bari/Brindisi corridor access.", "Important for retirees who want to reduce car dependence.", "Check connection reliability for airport or city travel patterns.", "https://www.trenitalia.com/en.html", monopoliVerification, "Monopoli railway station, Italy", 12),
      row("monopoli-health", "Apulia healthcare orientation", "Public system baseline", "Use regional and national health references to plan coverage.", "Useful before relying on tourist-season impressions.", "Confirm specialist access and appointment flow directly.", "https://www.regione.puglia.it/", monopoliVerification, "Monopoli healthcare, Italy", 11),
    ],
    pros: [
      "Monopoli offers a compact seaside historic center with strong daily appeal.",
      "Rail connectivity makes regional movement practical for a smaller coastal town.",
      "It can support a walkable retirement style without a major-city footprint.",
    ],
    tradeoffs: [
      "Tourism can be intense in the most scenic central areas.",
      "Parking and loading logistics require attention in the old town.",
      "Exact street choice matters a lot for quietness and convenience.",
    ],
    resources: [
      resource("monopoli-tourism", "local", "Visit Monopoli", "Official destination and planning portal.", "https://www.visitmonopoli.it/en/", "official_site", "2026-07-27"),
      resource("monopoli-rail", "transport", "Trenitalia", "Rail planning for the Adriatic/Puglia corridor.", "https://www.trenitalia.com/en.html", "official_site", "2026-07-27"),
      resource("monopoli-region-puglia", "healthcare", "Regione Puglia", "Regional services and healthcare baseline.", "https://www.regione.puglia.it/", "official_site", "2026-07-27"),
      resource("monopoli-tax", "tax", "PwC Italy residence summary", "Tax-residence planning baseline.", "https://taxsummaries.pwc.com/italy/individual/residence", "tax_summary", "2026-07-27"),
    ],
  },
  "piran-slovenia": {
    region: "Slovenian Littoral",
    lastVerifiedAt: "2026-07-27",
    dataConfidence: "medium",
    monthlyClimate: [
      { month: "January", avgHighC: 8, avgLowC: 2, rainfallMm: 82, rainyDays: 10, humidityPct: null, sunshineHours: 4, uvIndex: 2, seaTempC: 11, snowfallCm: null, windKph: null, verification: piranVerification },
      { month: "April", avgHighC: 16, avgLowC: 8, rainfallMm: 83, rainyDays: 10, humidityPct: null, sunshineHours: 6, uvIndex: 5, seaTempC: 13, snowfallCm: null, windKph: null, verification: piranVerification },
      { month: "July", avgHighC: 29, avgLowC: 20, rainfallMm: 50, rainyDays: 6, humidityPct: null, sunshineHours: 10, uvIndex: 8, seaTempC: 25, snowfallCm: null, windKph: null, verification: piranVerification },
      { month: "October", avgHighC: 20, avgLowC: 13, rainfallMm: 119, rainyDays: 9, humidityPct: null, sunshineHours: 6, uvIndex: 4, seaTempC: 19, snowfallCm: null, windKph: null, verification: piranVerification },
    ],
    costOfLiving: [
      metric("meal_inexpensive", "Meal at inexpensive restaurant", "EUR 12-16", piranVerification),
      metric("meal_two_midrange", "Dinner for two, mid-range", "EUR 45-60", piranVerification),
      metric("utilities", "Basic utilities (85 m²)", "EUR 110-160/month", piranVerification),
      metric("broadband", "Broadband 60 Mbps+", "EUR 30-40/month", piranVerification),
    ],
    neighborhoods: [
      row("piran-old-town", "Old Town", "Compact Venetian core", "Densely historic, walkable waterfront old town with strong visual identity.", "Excellent for retirees seeking atmosphere and compact daily movement.", "Tourist pressure and parking limitations are the major tradeoffs.", "https://www.portoroz.si/en/discover/piran", piranVerification, "Piran, Slovenia", 14),
      row("piran-fiesa", "Fiesa", "Residential coastal edge", "Quieter shoreline-adjacent area near the core.", "Useful if you want calmer routines while staying close to Piran's center.", "Check the uphill/downhill walking pattern and summer density carefully.", "https://www.portoroz.si/en/discover/piran", piranVerification, "Fiesa, Piran, Slovenia", 13),
    ],
    practicalInfo: [
      row("piran-access", "Piran access and parking", "Mobility reality check", "Access and parking shape everyday comfort more than map distance alone.", "Important if you plan to keep a car or receive frequent visitors.", "Test at different times of day before committing to a housing area.", "https://www.portoroz.si/en/discover/piran", piranVerification, "Piran access, Slovenia", 12),
      row("piran-health", "Slovenian healthcare orientation", "Coverage baseline", "Start with the national system and then verify local provider access.", "Useful for retirees comparing Slovenia to neighboring Adriatic markets.", "Do not assume specialist availability from national averages alone.", "https://www.gov.si/en/", piranVerification, "Piran healthcare, Slovenia", 11),
    ],
    pros: [
      "Piran delivers a small, visually strong Adriatic lifestyle in a compact footprint.",
      "The old town is highly walkable and easy to understand as a daily base.",
      "You can choose between dense historic living and slightly calmer edge areas.",
    ],
    tradeoffs: [
      "Parking and access are the biggest practical friction points.",
      "The best-known core can feel crowded in peak tourist periods.",
      "Mobility comfort depends heavily on exact street and slope conditions.",
    ],
    resources: [
      resource("piran-tourism", "local", "Piran tourism", "Official destination orientation and planning portal.", "https://www.portoroz.si/en/discover/piran", "official_site", "2026-07-27"),
      resource("piran-government", "transport", "Government of Slovenia", "National civic and services portal.", "https://www.gov.si/en/", "official_site", "2026-07-27"),
      resource("piran-tax", "tax", "PwC Slovenia residence summary", "Tax-residence baseline for planning.", "https://taxsummaries.pwc.com/slovenia/individual/residence", "tax_summary", "2026-07-27"),
      resource("piran-health", "healthcare", "Slovenia health services", "National services and health orientation.", "https://www.gov.si/en/topics/health-and-social-security/", "government_portal", "2026-07-27"),
    ],
  },
  "rijeka-croatia": {
    region: "Kvarner / Northern Adriatic",
    lastVerifiedAt: "2026-07-27",
    dataConfidence: "medium",
    monthlyClimate: [
      { month: "January", avgHighC: 10, avgLowC: 3, rainfallMm: 112, rainyDays: 11, humidityPct: null, sunshineHours: 4, uvIndex: 2, seaTempC: 12, snowfallCm: null, windKph: null, verification: rijekaVerification },
      { month: "April", avgHighC: 17, avgLowC: 9, rainfallMm: 95, rainyDays: 10, humidityPct: null, sunshineHours: 6, uvIndex: 5, seaTempC: 14, snowfallCm: null, windKph: null, verification: rijekaVerification },
      { month: "July", avgHighC: 29, avgLowC: 20, rainfallMm: 78, rainyDays: 8, humidityPct: null, sunshineHours: 9, uvIndex: 8, seaTempC: 24, snowfallCm: null, windKph: null, verification: rijekaVerification },
      { month: "October", avgHighC: 20, avgLowC: 13, rainfallMm: 138, rainyDays: 10, humidityPct: null, sunshineHours: 5, uvIndex: 4, seaTempC: 20, snowfallCm: null, windKph: null, verification: rijekaVerification },
    ],
    costOfLiving: [
      metric("meal_inexpensive", "Meal at inexpensive restaurant", "EUR 12-16", rijekaVerification),
      metric("meal_two_midrange", "Dinner for two, mid-range", "EUR 45-60", rijekaVerification),
      metric("utilities", "Basic utilities (85 m²)", "EUR 110-165/month", rijekaVerification),
      metric("broadband", "Broadband 60 Mbps+", "EUR 28-40/month", rijekaVerification),
    ],
    neighborhoods: [
      row("rijeka-centar", "Centar", "Urban core and services hub", "Main city-center district with strong everyday service access.", "Good if you want a real city base with practical connectivity.", "Traffic and density are higher than in smaller Adriatic towns.", "https://visitrijeka.hr/en/", rijekaVerification, "Rijeka center, Croatia", 14),
      row("rijeka-trsat", "Trsat", "Hilltop residential quarter", "Residential quarter above the center with a quieter rhythm and views.", "Useful for retirees who want calmer living but still city access.", "The hill setting means you must test mobility and parking carefully.", "https://visitrijeka.hr/en/", rijekaVerification, "Trsat, Rijeka, Croatia", 13),
    ],
    practicalInfo: [
      row("rijeka-port", "Port of Rijeka area", "Mobility and waterfront orientation", "Port and waterfront corridors shape the city's practical geography.", "Important for understanding noise, access, and logistics.", "Test street-level conditions rather than relying on map distance.", "https://visitrijeka.hr/en/", rijekaVerification, "Rijeka port, Croatia", 12),
      row("rijeka-airport", "Rijeka Airport", "Regional airport access", "Main airport for the Kvarner area.", "Useful for family visits and regional travel planning.", "Airport access can feel different in summer versus shoulder season.", "https://rijeka-airport.hr/en/", rijekaVerification, "Rijeka Airport, Croatia", 12),
    ],
    pros: [
      "Rijeka combines a real city economy with Adriatic access.",
      "You get more practical urban depth than in many smaller coastal towns.",
      "Trsat and the center give clear tradeoffs between calm and convenience.",
    ],
    tradeoffs: [
      "It is less postcard-like than smaller historic Adriatic towns.",
      "Traffic and port-related urban grit are part of the experience.",
      "The hillier parts require mobility checks before choosing a home.",
    ],
    resources: [
      resource("rijeka-tourism", "local", "Visit Rijeka", "Official destination orientation and planning portal.", "https://visitrijeka.hr/en/", "official_site", "2026-07-27"),
      resource("rijeka-airport-official", "transport", "Rijeka Airport", "Airport operations and traveler guidance.", "https://rijeka-airport.hr/en/", "official_site", "2026-07-27"),
      resource("rijeka-hzzo", "healthcare", "Croatian Health Insurance Fund", "National healthcare orientation.", "https://hzzo.hr/en/", "official_site", "2026-07-27"),
      resource("rijeka-tax", "tax", "PwC Croatia residence summary", "Tax-residence baseline for planning.", "https://taxsummaries.pwc.com/croatia/individual/residence", "tax_summary", "2026-07-27"),
    ],
  },
  "sibenik-croatia": {
    region: "Dalmatia / Šibenik-Knin",
    lastVerifiedAt: "2026-07-27",
    dataConfidence: "medium",
    monthlyClimate: [
      { month: "January", avgHighC: 11, avgLowC: 4, rainfallMm: 113, rainyDays: 11, humidityPct: null, sunshineHours: 5, uvIndex: 2, seaTempC: 13, snowfallCm: null, windKph: null, verification: sibenikVerification },
      { month: "April", avgHighC: 18, avgLowC: 10, rainfallMm: 72, rainyDays: 8, humidityPct: null, sunshineHours: 7, uvIndex: 5, seaTempC: 15, snowfallCm: null, windKph: null, verification: sibenikVerification },
      { month: "July", avgHighC: 31, avgLowC: 21, rainfallMm: 34, rainyDays: 4, humidityPct: null, sunshineHours: 11, uvIndex: 9, seaTempC: 25, snowfallCm: null, windKph: null, verification: sibenikVerification },
      { month: "October", avgHighC: 22, avgLowC: 14, rainfallMm: 123, rainyDays: 9, humidityPct: null, sunshineHours: 6, uvIndex: 4, seaTempC: 20, snowfallCm: null, windKph: null, verification: sibenikVerification },
    ],
    costOfLiving: [
      metric("meal_inexpensive", "Meal at inexpensive restaurant", "EUR 11-15", sibenikVerification),
      metric("meal_two_midrange", "Dinner for two, mid-range", "EUR 45-60", sibenikVerification),
      metric("utilities", "Basic utilities (85 m²)", "EUR 105-155/month", sibenikVerification),
      metric("broadband", "Broadband 60 Mbps+", "EUR 28-40/month", sibenikVerification),
    ],
    neighborhoods: [
      row("sibenik-old-town", "Old Town", "Historic waterfront core", "Dense historic city center with seafront character and strong walkability.", "Ideal for retirees who want everyday life inside the scenic core.", "Parking and tourism pressure need to be checked street by street.", "https://sibenik-tourism.hr/en/", sibenikVerification, "Šibenik Old Town, Croatia", 14),
      row("sibenik-brodarica", "Brodarica / coastal edge", "Quieter seaside edge", "Residential coastal edge with more breathing room than the old town.", "Useful if you want beach access and a calmer routine.", "You trade some central convenience for lower density living.", "https://sibenik-tourism.hr/en/", sibenikVerification, "Brodarica, Šibenik, Croatia", 13),
    ],
    practicalInfo: [
      row("sibenik-port", "Šibenik waterfront / port area", "Orientation anchor", "The waterfront and port shape the city's daily movement and ambiance.", "Important for understanding where the practical center of gravity sits.", "Validate parking and access around the old core before choosing a block.", "https://sibenik-tourism.hr/en/", sibenikVerification, "Šibenik port, Croatia", 12),
      row("sibenik-airport", "Split Airport access", "Regional airport corridor", "Most practical major-airport routing runs through Split Airport.", "Important for longer trips to Dalmatian hubs.", "Check seasonal traffic and transfer time from the old town.", "https://sibenik-tourism.hr/en/", sibenikVerification, "Split Airport, Croatia", 12),
    ],
    pros: [
      "Šibenik combines a compact historic core with strong Adriatic character.",
      "The city is large enough for real services but small enough to stay legible.",
      "Nearby coastal edges give you lifestyle tradeoffs without leaving the city.",
    ],
    tradeoffs: [
      "Parking and access can still be tight in the old core.",
      "Tourism pressure is real in the most scenic parts.",
      "The airport corridor is practical but not as convenient as having a city airport.",
    ],
    resources: [
      resource("sibenik-tourism", "local", "Visit Sibenik", "Official destination orientation and planning portal.", "https://sibenik-tourism.hr/en/", "official_site", "2026-07-27"),
      resource("sibenik-airport", "transport", "Split Airport", "Regional airport reference for the wider Šibenik area.", "https://www.split-airport.hr/", "official_site", "2026-07-27"),
      resource("sibenik-hzzo", "healthcare", "Croatian Health Insurance Fund", "National healthcare orientation.", "https://hzzo.hr/en/", "official_site", "2026-07-27"),
      resource("sibenik-tax", "tax", "PwC Croatia residence summary", "Tax-residence baseline for planning.", "https://taxsummaries.pwc.com/croatia/individual/residence", "tax_summary", "2026-07-27"),
    ],
  },
  "kanazawa-japan": {
    region: "Hokuriku / Ishikawa",
    lastVerifiedAt: "2026-07-27",
    dataConfidence: "medium",
    monthlyClimate: [
      { month: "January", avgHighC: 8, avgLowC: 1, rainfallMm: 250, rainyDays: 21, humidityPct: null, sunshineHours: 2, uvIndex: 1, seaTempC: 12, snowfallCm: 80, windKph: null, verification: verification("https://www.japan-guide.com/e/e4250.html", "Japan Guide", "travel_guide", "medium", "estimated", "2026-07-27") },
      { month: "April", avgHighC: 18, avgLowC: 9, rainfallMm: 130, rainyDays: 14, humidityPct: null, sunshineHours: 5, uvIndex: 5, seaTempC: 15, snowfallCm: 0, windKph: null, verification: verification("https://www.japan-guide.com/e/e4250.html", "Japan Guide", "travel_guide", "medium", "estimated", "2026-07-27") },
      { month: "July", avgHighC: 31, avgLowC: 24, rainfallMm: 190, rainyDays: 16, humidityPct: null, sunshineHours: 5, uvIndex: 9, seaTempC: 25, snowfallCm: 0, windKph: null, verification: verification("https://www.japan-guide.com/e/e4250.html", "Japan Guide", "travel_guide", "medium", "estimated", "2026-07-27") },
      { month: "October", avgHighC: 22, avgLowC: 14, rainfallMm: 180, rainyDays: 15, humidityPct: null, sunshineHours: 4, uvIndex: 4, seaTempC: 21, snowfallCm: 0, windKph: null, verification: verification("https://www.japan-guide.com/e/e4250.html", "Japan Guide", "travel_guide", "medium", "estimated", "2026-07-27") },
    ],
    costOfLiving: [
      metric("meal_inexpensive", "Meal at inexpensive restaurant", "JPY 1,000-1,400", verification("https://www.numbeo.com/cost-of-living/in/Kanazawa", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("meal_two_midrange", "Dinner for two, mid-range", "JPY 4,000-6,000", verification("https://www.numbeo.com/cost-of-living/in/Kanazawa", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("utilities", "Basic utilities (85 m²)", "JPY 16,000-25,000/month", verification("https://www.numbeo.com/cost-of-living/in/Kanazawa", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("broadband", "Broadband 60 Mbps+", "JPY 4,500-6,500/month", verification("https://www.numbeo.com/cost-of-living/in/Kanazawa", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
    ],
    neighborhoods: [
      row("kanazawa-katamachi", "Katamachi", "Central dining and nightlife district", "Central district with restaurants, services, and easy urban access.", "Useful for retirees who want a lively but manageable city rhythm.", "Noise and late-night activity can be a factor in the busiest blocks.", "https://visitkanazawa.jp/en", verification("https://visitkanazawa.jp/en", "Visit Kanazawa", "official_site", "medium", "verified", "2026-07-27"), "Katamachi, Kanazawa, Japan", 14),
      row("kanazawa-higashi-chaya", "Higashi Chaya / historic edge", "Historic district fringe", "Historic district area with stronger heritage character and tourism flow.", "Best for atmosphere and shorter scenic walks.", "Tourism pressure and pedestrian density can be high in peak hours.", "https://visitkanazawa.jp/en", verification("https://visitkanazawa.jp/en", "Visit Kanazawa", "official_site", "medium", "verified", "2026-07-27"), "Higashi Chaya, Kanazawa, Japan", 14),
    ],
    practicalInfo: [
      row("kanazawa-station", "Kanazawa Station", "Main rail and transit anchor", "Major rail and mobility hub for regional travel.", "Important for car-light living and trips to Tokyo/Osaka corridors.", "Validate luggage flow and transfer comfort if you travel frequently.", "https://visitkanazawa.jp/en", verification("https://visitkanazawa.jp/en", "Visit Kanazawa", "official_site", "medium", "verified", "2026-07-27"), "Kanazawa Station, Japan", 12),
      row("kanazawa-health", "Kanazawa healthcare orientation", "Public system baseline", "Use city and national guidance to orient health coverage and provider access.", "Good early check before assuming English-language care depth.", "Confirm private options and appointment procedures directly.", "https://www.city.kanazawa.ishikawa.jp/", verification("https://www.city.kanazawa.ishikawa.jp/", "City of Kanazawa", "official_site", "medium", "verified", "2026-07-27"), "Kanazawa healthcare, Japan", 12),
    ],
    pros: [
      "Kanazawa offers a strong blend of culture, walkability, and urban convenience.",
      "It has a clear daily rhythm without the intensity of Japan's largest metros.",
      "Rail connectivity makes regional movement practical for long-stay residents.",
    ],
    tradeoffs: [
      "Snow and winter weather are more real than in southern coastal Japan.",
      "Some central districts can be lively enough to affect quietness.",
      "Costs are still Japan-level and should be modeled carefully.",
    ],
    resources: [
      resource("kanazawa-tourism", "local", "Visit Kanazawa", "Official destination and planning portal.", "https://visitkanazawa.jp/en", "official_site", "2026-07-27"),
      resource("kanazawa-station", "transport", "Kanazawa Station", "Main rail and transit reference.", "https://visitkanazawa.jp/en", "official_site", "2026-07-27"),
      resource("kanazawa-city", "healthcare", "City of Kanazawa", "City services and orientation reference.", "https://www.city.kanazawa.ishikawa.jp/", "official_site", "2026-07-27"),
      resource("kanazawa-tax", "tax", "PwC Japan residence summary", "Tax-residence baseline for planning.", "https://taxsummaries.pwc.com/japan/individual/residence", "tax_summary", "2026-07-27"),
    ],
  },
  "polignano-a-mare-italy": {
    region: "Puglia / Adriatic",
    lastVerifiedAt: "2026-07-27",
    dataConfidence: "medium",
    monthlyClimate: [
      { month: "January", avgHighC: 12, avgLowC: 6, rainfallMm: 65, rainyDays: 9, humidityPct: null, sunshineHours: 5, uvIndex: 2, seaTempC: 14, snowfallCm: null, windKph: null, verification: verification("https://www.visitapulia.it/en", "Visit Apulia", "official_site", "medium", "verified", "2026-07-27") },
      { month: "April", avgHighC: 18, avgLowC: 10, rainfallMm: 55, rainyDays: 7, humidityPct: null, sunshineHours: 7, uvIndex: 5, seaTempC: 15, snowfallCm: null, windKph: null, verification: verification("https://www.visitapulia.it/en", "Visit Apulia", "official_site", "medium", "verified", "2026-07-27") },
      { month: "July", avgHighC: 31, avgLowC: 22, rainfallMm: 22, rainyDays: 3, humidityPct: null, sunshineHours: 10, uvIndex: 9, seaTempC: 25, snowfallCm: null, windKph: null, verification: verification("https://www.visitapulia.it/en", "Visit Apulia", "official_site", "medium", "verified", "2026-07-27") },
      { month: "October", avgHighC: 22, avgLowC: 15, rainfallMm: 72, rainyDays: 8, humidityPct: null, sunshineHours: 6, uvIndex: 4, seaTempC: 21, snowfallCm: null, windKph: null, verification: verification("https://www.visitapulia.it/en", "Visit Apulia", "official_site", "medium", "verified", "2026-07-27") },
    ],
    costOfLiving: [
      metric("meal_inexpensive", "Meal at inexpensive restaurant", "EUR 11-15", verification("https://www.numbeo.com/cost-of-living/in/Polignano-a-Mare", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("meal_two_midrange", "Dinner for two, mid-range", "EUR 45-60", verification("https://www.numbeo.com/cost-of-living/in/Polignano-a-Mare", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("utilities", "Basic utilities (85 m²)", "EUR 100-150/month", verification("https://www.numbeo.com/cost-of-living/in/Polignano-a-Mare", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("broadband", "Broadband 60 Mbps+", "EUR 28-38/month", verification("https://www.numbeo.com/cost-of-living/in/Polignano-a-Mare", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
    ],
    neighborhoods: [
      row("polignano-centro-storico", "Centro Storico", "Historic cliffside core", "Iconic old center with dramatic sea views and compact walkability.", "Excellent for retirees who want scenery and a highly memorable daily environment.", "Tourism pressure and access constraints can be significant in peak periods.", "https://www.visitapulia.it/en", verification("https://www.visitapulia.it/en", "Visit Apulia", "official_site", "medium", "verified", "2026-07-27"), "Polignano a Mare, Italy", 14),
      row("polignano-san-vit0", "San Vito / residential edge", "Quieter coastal edge", "Residential area near the coast with a calmer rhythm than the center.", "Useful if you want easier routine living and less tourist density.", "You give up some immediate scenic intensity for livability.", "https://www.visitapulia.it/en", verification("https://www.visitapulia.it/en", "Visit Apulia", "official_site", "medium", "verified", "2026-07-27"), "San Vito, Polignano a Mare, Italy", 13),
    ],
    practicalInfo: [
      row("polignano-rail", "Polignano a Mare railway station", "Regional mobility anchor", "Rail station that connects the town to the Bari/Brindisi corridor.", "Useful for car-light day trips and airport access planning.", "Check schedule timing if you expect to travel frequently.", "https://www.trenitalia.com/en.html", verification("https://www.visitapulia.it/en", "Visit Apulia", "official_site", "medium", "verified", "2026-07-27"), "Polignano railway station, Italy", 12),
      row("polignano-health", "Apulia healthcare orientation", "Public system baseline", "Use regional health guidance for coverage and provider planning.", "Important before relying on scenic lifestyle assumptions alone.", "Directly confirm specialty access and local doctor availability.", "https://www.regione.puglia.it/", verification("https://www.visitapulia.it/en", "Visit Apulia", "official_site", "medium", "verified", "2026-07-27"), "Polignano healthcare, Italy", 11),
    ],
    pros: [
      "Polignano a Mare offers dramatic coastal scenery in a compact, memorable setting.",
      "The center is easy to understand and strongly walkable.",
      "Rail access keeps the town from feeling fully isolated.",
    ],
    tradeoffs: [
      "The most scenic areas can be crowded and expensive in peak season.",
      "Parking and street access need serious validation before moving in.",
      "The town is beautiful first and practical second for some retirees.",
    ],
    resources: [
      resource("polignano-tourism", "local", "Visit Apulia", "Official regional tourism portal with Polignano coverage.", "https://www.visitapulia.it/en", "official_site", "2026-07-27"),
      resource("polignano-trenitalia", "transport", "Trenitalia", "Regional rail planning.", "https://www.trenitalia.com/en.html", "official_site", "2026-07-27"),
      resource("polignano-region", "healthcare", "Regione Puglia", "Regional services reference.", "https://www.regione.puglia.it/", "official_site", "2026-07-27"),
      resource("polignano-tax", "tax", "PwC Italy residence summary", "Tax-residence baseline for planning.", "https://taxsummaries.pwc.com/italy/individual/residence", "tax_summary", "2026-07-27"),
    ],
  },
  "cefalu-italy": {
    region: "Sicily / Tyrrhenian Coast",
    lastVerifiedAt: "2026-07-27",
    dataConfidence: "medium",
    monthlyClimate: [
      { month: "January", avgHighC: 15, avgLowC: 8, rainfallMm: 77, rainyDays: 10, humidityPct: null, sunshineHours: 5, uvIndex: 2, seaTempC: 15, snowfallCm: null, windKph: null, verification: verification("https://www.italia.it/en/sicily/cefalu", "Italia.it", "official_site", "medium", "verified", "2026-07-27") },
      { month: "April", avgHighC: 20, avgLowC: 12, rainfallMm: 44, rainyDays: 7, humidityPct: null, sunshineHours: 7, uvIndex: 5, seaTempC: 16, snowfallCm: null, windKph: null, verification: verification("https://www.italia.it/en/sicily/cefalu", "Italia.it", "official_site", "medium", "verified", "2026-07-27") },
      { month: "July", avgHighC: 29, avgLowC: 22, rainfallMm: 12, rainyDays: 2, humidityPct: null, sunshineHours: 11, uvIndex: 9, seaTempC: 25, snowfallCm: null, windKph: null, verification: verification("https://www.italia.it/en/sicily/cefalu", "Italia.it", "official_site", "medium", "verified", "2026-07-27") },
      { month: "October", avgHighC: 24, avgLowC: 17, rainfallMm: 70, rainyDays: 8, humidityPct: null, sunshineHours: 6, uvIndex: 4, seaTempC: 22, snowfallCm: null, windKph: null, verification: verification("https://www.italia.it/en/sicily/cefalu", "Italia.it", "official_site", "medium", "verified", "2026-07-27") },
    ],
    costOfLiving: [
      metric("meal_inexpensive", "Meal at inexpensive restaurant", "EUR 10-14", verification("https://www.numbeo.com/cost-of-living/in/Cefalu", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("meal_two_midrange", "Dinner for two, mid-range", "EUR 40-55", verification("https://www.numbeo.com/cost-of-living/in/Cefalu", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("utilities", "Basic utilities (85 m²)", "EUR 100-155/month", verification("https://www.numbeo.com/cost-of-living/in/Cefalu", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("broadband", "Broadband 60 Mbps+", "EUR 28-38/month", verification("https://www.numbeo.com/cost-of-living/in/Cefalu", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
    ],
    neighborhoods: [
      row("cefalu-centro-storico", "Centro Storico", "Historic beach-adjacent core", "Historic center with easy access to the seafront and town services.", "Great if you want walkable daily life wrapped around a beach-town setting.", "Tourism pressure can be intense in high season, especially near the best-known streets.", "https://www.italia.it/en/sicily/cefalu", verification("https://www.italia.it/en/sicily/cefalu", "Italia.it", "official_site", "medium", "verified", "2026-07-27"), "Cefalù, Italy", 14),
      row("cefalu-calex", "Caldura / western edge", "Quieter residential edge", "Residential edge that can offer a calmer rhythm than the core.", "Useful for retirees who want more breathing room while staying coastal.", "Access and walking comfort should still be checked street by street.", "https://www.italia.it/en/sicily/cefalu", verification("https://www.italia.it/en/sicily/cefalu", "Italia.it", "official_site", "medium", "verified", "2026-07-27"), "Cefalù, Italy", 13),
    ],
    practicalInfo: [
      row("cefalu-rail", "Cefalù railway station", "Regional mobility anchor", "Rail station for Palermo/Messina corridor access.", "Useful for car-light living and family visits.", "Check timing for late arrivals and luggage handling.", "https://www.trenitalia.com/en.html", verification("https://www.italia.it/en/sicily/cefalu", "Italia.it", "official_site", "medium", "verified", "2026-07-27"), "Cefalù railway station, Italy", 12),
      row("cefalu-health", "Sicilian healthcare orientation", "Public system baseline", "Use regional and national health references before assuming easy access.", "Important for long-stay planning in a smaller coastal town.", "Confirm specialist access and prescription routines directly.", "https://www.regione.sicilia.it/", verification("https://www.italia.it/en/sicily/cefalu", "Italia.it", "official_site", "medium", "verified", "2026-07-27"), "Cefalù healthcare, Italy", 11),
    ],
    pros: [
      "Cefalù combines a beach-town setting with strong visual character.",
      "The historic center is compact and easy to experience on foot.",
      "It offers an appealing slow-life profile without feeling empty.",
    ],
    tradeoffs: [
      "The scenic center can be crowded and seasonally expensive.",
      "Vehicle access and parking are important to validate carefully.",
      "Healthcare and specialist depth are thinner than in large cities.",
    ],
    resources: [
      resource("cefalu-italia", "local", "Italia.it Cefalù", "Official destination orientation and planning portal.", "https://www.italia.it/en/sicily/cefalu", "official_site", "2026-07-27"),
      resource("cefalu-trenitalia", "transport", "Trenitalia", "Rail planning for regional travel.", "https://www.trenitalia.com/en.html", "official_site", "2026-07-27"),
      resource("cefalu-region", "healthcare", "Regione Sicilia", "Regional services and healthcare baseline.", "https://www.regione.sicilia.it/", "official_site", "2026-07-27"),
      resource("cefalu-tax", "tax", "PwC Italy residence summary", "Tax-residence baseline for planning.", "https://taxsummaries.pwc.com/italy/individual/residence", "tax_summary", "2026-07-27"),
    ],
  },
  "kalamata-greece": {
    region: "Messenia / Peloponnese",
    lastVerifiedAt: "2026-07-27",
    dataConfidence: "medium",
    monthlyClimate: [
      { month: "January", avgHighC: 14, avgLowC: 6, rainfallMm: 90, rainyDays: 9, humidityPct: null, sunshineHours: 5, uvIndex: 2, seaTempC: 15, snowfallCm: null, windKph: null, verification: verification("https://www.visitgreece.gr/destinations/peloponnese/kalamata/", "Visit Greece", "official_site", "medium", "verified", "2026-07-27") },
      { month: "April", avgHighC: 20, avgLowC: 11, rainfallMm: 42, rainyDays: 6, humidityPct: null, sunshineHours: 8, uvIndex: 6, seaTempC: 16, snowfallCm: null, windKph: null, verification: verification("https://www.visitgreece.gr/destinations/peloponnese/kalamata/", "Visit Greece", "official_site", "medium", "verified", "2026-07-27") },
      { month: "July", avgHighC: 33, avgLowC: 23, rainfallMm: 7, rainyDays: 1, humidityPct: null, sunshineHours: 11, uvIndex: 10, seaTempC: 25, snowfallCm: null, windKph: null, verification: verification("https://www.visitgreece.gr/destinations/peloponnese/kalamata/", "Visit Greece", "official_site", "medium", "verified", "2026-07-27") },
      { month: "October", avgHighC: 24, avgLowC: 15, rainfallMm: 67, rainyDays: 7, humidityPct: null, sunshineHours: 7, uvIndex: 5, seaTempC: 22, snowfallCm: null, windKph: null, verification: verification("https://www.visitgreece.gr/destinations/peloponnese/kalamata/", "Visit Greece", "official_site", "medium", "verified", "2026-07-27") },
    ],
    costOfLiving: [
      metric("meal_inexpensive", "Meal at inexpensive restaurant", "EUR 10-14", verification("https://www.numbeo.com/cost-of-living/in/Kalamata", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("meal_two_midrange", "Dinner for two, mid-range", "EUR 40-55", verification("https://www.numbeo.com/cost-of-living/in/Kalamata", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("utilities", "Basic utilities (85 m²)", "EUR 100-150/month", verification("https://www.numbeo.com/cost-of-living/in/Kalamata", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("broadband", "Broadband 60 Mbps+", "EUR 26-36/month", verification("https://www.numbeo.com/cost-of-living/in/Kalamata", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
    ],
    neighborhoods: [
      row("kalamata-center", "Center", "Urban core and seaside access", "Practical city center with nearby waterfront and services.", "Useful for retirees who want a city-plus-beach lifestyle.", "Traffic and summer heat are worth testing block by block.", "https://www.visitgreece.gr/destinations/peloponnese/kalamata/", verification("https://www.visitgreece.gr/destinations/peloponnese/kalamata/", "Visit Greece", "official_site", "medium", "verified", "2026-07-27"), "Kalamata center, Greece", 14),
      row("kalamata-verga", "Verga", "Coastal residential edge", "Residential hillside/coastal area with more room than the center.", "Good for quieter daily living with sea access.", "Hill gradients matter for mobility and cycling comfort.", "https://www.visitgreece.gr/destinations/peloponnese/kalamata/", verification("https://www.visitgreece.gr/destinations/peloponnese/kalamata/", "Visit Greece", "official_site", "medium", "verified", "2026-07-27"), "Verga, Kalamata, Greece", 13),
    ],
    practicalInfo: [
      row("kalamata-airport", "Kalamata International Airport", "Regional airport access", "Main airport for the city and southern Peloponnese.", "Strong for family visits and short-haul travel planning.", "Check seasonal schedule changes before relying on it heavily.", "https://www.kalamata-airport.gr/en", verification("https://www.visitgreece.gr/destinations/peloponnese/kalamata/", "Visit Greece", "official_site", "medium", "verified", "2026-07-27"), "Kalamata Airport, Greece", 12),
      row("kalamata-health", "Greek public healthcare orientation", "Coverage baseline", "Start with the national healthcare framework and local provider checks.", "Useful before relying on lifestyle impressions alone.", "Confirm specialist and private options directly.", "https://www.moh.gov.gr/", verification("https://www.visitgreece.gr/destinations/peloponnese/kalamata/", "Visit Greece", "official_site", "medium", "verified", "2026-07-27"), "Kalamata healthcare, Greece", 11),
    ],
    pros: [
      "Kalamata offers a compelling balance of city services and coastal living.",
      "Airport access supports practical travel for long-stay residents.",
      "The center and coastal edge give clear lifestyle tradeoffs.",
    ],
    tradeoffs: [
      "Summer heat can be intense.",
      "The most convenient areas may feel busier in tourist season.",
      "Mobility comfort depends on exact neighborhood and slope.",
    ],
    resources: [
      resource("kalamata-tourism", "local", "Visit Greece Kalamata", "Official destination orientation and planning portal.", "https://www.visitgreece.gr/destinations/peloponnese/kalamata/", "official_site", "2026-07-27"),
      resource("kalamata-airport-official", "transport", "Kalamata Airport", "Airport operations and traveler guidance.", "https://www.kalamata-airport.gr/en", "official_site", "2026-07-27"),
      resource("kalamata-health", "healthcare", "Greek Ministry of Health", "Public health system orientation.", "https://www.moh.gov.gr/", "government_portal", "2026-07-27"),
      resource("kalamata-tax", "tax", "PwC Greece residence summary", "Tax-residence baseline for planning.", "https://taxsummaries.pwc.com/greece/individual/residence", "tax_summary", "2026-07-27"),
    ],
  },
  "taormina-italy": {
    region: "Sicily / Ionian Coast",
    lastVerifiedAt: "2026-07-27",
    dataConfidence: "medium",
    monthlyClimate: [
      { month: "January", avgHighC: 14, avgLowC: 7, rainfallMm: 76, rainyDays: 10, humidityPct: null, sunshineHours: 5, uvIndex: 2, seaTempC: 15, snowfallCm: null, windKph: null, verification: verification("https://www.italia.it/en/sicily/taormina", "Italia.it", "official_site", "medium", "verified", "2026-07-27") },
      { month: "April", avgHighC: 20, avgLowC: 11, rainfallMm: 45, rainyDays: 7, humidityPct: null, sunshineHours: 7, uvIndex: 5, seaTempC: 16, snowfallCm: null, windKph: null, verification: verification("https://www.italia.it/en/sicily/taormina", "Italia.it", "official_site", "medium", "verified", "2026-07-27") },
      { month: "July", avgHighC: 31, avgLowC: 22, rainfallMm: 12, rainyDays: 2, humidityPct: null, sunshineHours: 11, uvIndex: 9, seaTempC: 26, snowfallCm: null, windKph: null, verification: verification("https://www.italia.it/en/sicily/taormina", "Italia.it", "official_site", "medium", "verified", "2026-07-27") },
      { month: "October", avgHighC: 24, avgLowC: 17, rainfallMm: 68, rainyDays: 8, humidityPct: null, sunshineHours: 6, uvIndex: 4, seaTempC: 22, snowfallCm: null, windKph: null, verification: verification("https://www.italia.it/en/sicily/taormina", "Italia.it", "official_site", "medium", "verified", "2026-07-27") },
    ],
    costOfLiving: [
      metric("meal_inexpensive", "Meal at inexpensive restaurant", "EUR 12-18", verification("https://www.numbeo.com/cost-of-living/in/Taormina", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("meal_two_midrange", "Dinner for two, mid-range", "EUR 50-70", verification("https://www.numbeo.com/cost-of-living/in/Taormina", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("utilities", "Basic utilities (85 m²)", "EUR 110-165/month", verification("https://www.numbeo.com/cost-of-living/in/Taormina", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("broadband", "Broadband 60 Mbps+", "EUR 30-40/month", verification("https://www.numbeo.com/cost-of-living/in/Taormina", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
    ],
    neighborhoods: [
      row("taormina-centro", "Centro Storico", "Historic hillside core", "Dramatic hilltown core with views, services, and tourism intensity.", "Great if you want iconic ambiance and scenic daily routines.", "Stairs, slope, and crowding are significant practical tradeoffs.", "https://www.italia.it/en/sicily/taormina", verification("https://www.italia.it/en/sicily/taormina", "Italia.it", "official_site", "medium", "verified", "2026-07-27"), "Taormina, Italy", 14),
      row("taormina-mazzaro", "Mazzarò", "Beach-side lower town", "Lower coastal area with easier sea access than the hilltop core.", "Useful if you want beach routine over historic-center nightlife.", "You may trade central convenience for a different mobility profile.", "https://www.italia.it/en/sicily/taormina", verification("https://www.italia.it/en/sicily/taormina", "Italia.it", "official_site", "medium", "verified", "2026-07-27"), "Mazzarò, Taormina, Italy", 13),
    ],
    practicalInfo: [
      row("taormina-rail", "Taormina-Giardini station", "Regional mobility anchor", "Rail connection point for the broader Taormina area.", "Important for car-light travel planning.", "Test transfer logistics because the station is not in the hilltop core.", "https://www.trenitalia.com/en.html", verification("https://www.italia.it/en/sicily/taormina", "Italia.it", "official_site", "medium", "verified", "2026-07-27"), "Taormina station, Italy", 12),
      row("taormina-health", "Sicilian healthcare orientation", "Public system baseline", "Use regional and national health references before assuming easy access.", "Especially important in a tourism-heavy town with slope constraints.", "Confirm specialist access and practical appointment flow directly.", "https://www.regione.sicilia.it/", verification("https://www.italia.it/en/sicily/taormina", "Italia.it", "official_site", "medium", "verified", "2026-07-27"), "Taormina healthcare, Italy", 11),
    ],
    pros: [
      "Taormina offers iconic beauty and strong walkable ambiance in the center.",
      "It is one of the most memorable coastal-hilltown lifestyles in Italy.",
      "The lower beach area gives you a second living pattern to compare against the core.",
    ],
    tradeoffs: [
      "The scenic core is steep and can be tiring for daily life.",
      "Tourism pressure is a defining feature in peak season.",
      "Practical living costs can be high relative to the town size.",
    ],
    resources: [
      resource("taormina-tourism", "local", "Italia.it Taormina", "Official destination orientation and planning portal.", "https://www.italia.it/en/sicily/taormina", "official_site", "2026-07-27"),
      resource("taormina-trenitalia", "transport", "Trenitalia", "Rail planning reference.", "https://www.trenitalia.com/en.html", "official_site", "2026-07-27"),
      resource("taormina-region", "healthcare", "Regione Sicilia", "Regional services reference.", "https://www.regione.sicilia.it/", "official_site", "2026-07-27"),
      resource("taormina-tax", "tax", "PwC Italy residence summary", "Tax-residence baseline for planning.", "https://taxsummaries.pwc.com/italy/individual/residence", "tax_summary", "2026-07-27"),
    ],
  },
  "podgorica-montenegro": {
    region: "Central Montenegro",
    lastVerifiedAt: "2026-07-27",
    dataConfidence: "medium",
    monthlyClimate: [
      { month: "January", avgHighC: 10, avgLowC: 2, rainfallMm: 182, rainyDays: 13, humidityPct: null, sunshineHours: 4, uvIndex: 2, seaTempC: null, snowfallCm: 3, windKph: null, verification: verification("https://en.wikipedia.org/wiki/Podgorica", "Wikipedia", "encyclopedia", "medium", "estimated", "2026-07-27") },
      { month: "April", avgHighC: 21, avgLowC: 9, rainfallMm: 105, rainyDays: 11, humidityPct: null, sunshineHours: 6, uvIndex: 5, seaTempC: null, snowfallCm: 0, windKph: null, verification: verification("https://en.wikipedia.org/wiki/Podgorica", "Wikipedia", "encyclopedia", "medium", "estimated", "2026-07-27") },
      { month: "July", avgHighC: 34, avgLowC: 18, rainfallMm: 26, rainyDays: 4, humidityPct: null, sunshineHours: 11, uvIndex: 10, seaTempC: null, snowfallCm: 0, windKph: null, verification: verification("https://en.wikipedia.org/wiki/Podgorica", "Wikipedia", "encyclopedia", "medium", "estimated", "2026-07-27") },
      { month: "October", avgHighC: 22, avgLowC: 11, rainfallMm: 151, rainyDays: 10, humidityPct: null, sunshineHours: 5, uvIndex: 4, seaTempC: null, snowfallCm: 0, windKph: null, verification: verification("https://en.wikipedia.org/wiki/Podgorica", "Wikipedia", "encyclopedia", "medium", "estimated", "2026-07-27") },
    ],
    costOfLiving: [
      metric("meal_inexpensive", "Meal at inexpensive restaurant", "EUR 9-12", verification("https://www.numbeo.com/cost-of-living/in/Podgorica", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("meal_two_midrange", "Dinner for two, mid-range", "EUR 35-50", verification("https://www.numbeo.com/cost-of-living/in/Podgorica", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("utilities", "Basic utilities (85 m²)", "EUR 95-145/month", verification("https://www.numbeo.com/cost-of-living/in/Podgorica", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("broadband", "Broadband 60 Mbps+", "EUR 28-38/month", verification("https://www.numbeo.com/cost-of-living/in/Podgorica", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
    ],
    neighborhoods: [
      row("podgorica-centar", "Centar", "Administrative and services core", "City center with administrative functions, services, and daily convenience.", "Good for retirees who want easy access to urban services.", "Less scenic than coastal Montenegro but more practical for some routines.", "https://en.wikipedia.org/wiki/Podgorica", verification("https://en.wikipedia.org/wiki/Podgorica", "Wikipedia", "encyclopedia", "medium", "estimated", "2026-07-27"), "Podgorica center, Montenegro", 14),
      row("podgorica-preko-morace", "Preko Morače", "Residential modern district", "Common residential area with broader housing stock and city access.", "Useful if you want straightforward urban living and easier apartment supply.", "Summer heat and inland climate are important tradeoffs versus the coast.", "https://en.wikipedia.org/wiki/Podgorica", verification("https://en.wikipedia.org/wiki/Podgorica", "Wikipedia", "encyclopedia", "medium", "estimated", "2026-07-27"), "Preko Morace, Podgorica, Montenegro", 13),
    ],
    practicalInfo: [
      row("podgorica-airport", "Podgorica Airport", "Main air gateway", "Primary airport for central Montenegro.", "Useful for regional and international access.", "Airport choice depends on route frequency and season.", "https://montenegroairports.com/en/podgorica-airport/", verification("https://en.wikipedia.org/wiki/Podgorica", "Wikipedia", "encyclopedia", "medium", "estimated", "2026-07-27"), "Podgorica Airport, Montenegro", 12),
      row("podgorica-health", "Montenegrin healthcare orientation", "Public system baseline", "Use national health references and local provider checks to orient care access.", "Important because inland city convenience differs from coastal resort markets.", "Confirm private care and appointment availability directly.", "https://www.gov.me/en/", verification("https://en.wikipedia.org/wiki/Podgorica", "Wikipedia", "encyclopedia", "medium", "estimated", "2026-07-27"), "Podgorica healthcare, Montenegro", 11),
    ],
    pros: [
      "Podgorica is the most practical urban hub in Montenegro for day-to-day services.",
      "It has stronger administrative and airport convenience than many coastal towns.",
      "Housing supply is usually broader and less seasonal than on the coast.",
    ],
    tradeoffs: [
      "It lacks the coastal visual appeal of Montenegro's seaside destinations.",
      "Summer heat can be intense inland.",
      "Lifestyle is more practical than scenic, which is not for everyone.",
    ],
    resources: [
      resource("podgorica-wikipedia", "local", "Podgorica reference", "General destination reference and orientation.", "https://en.wikipedia.org/wiki/Podgorica", "reference", "2026-07-27"),
      resource("podgorica-airport", "transport", "Podgorica Airport", "Main airport reference.", "https://montenegroairports.com/en/podgorica-airport/", "official_site", "2026-07-27"),
      resource("podgorica-gov", "healthcare", "Government of Montenegro", "National services and health orientation.", "https://www.gov.me/en/", "official_site", "2026-07-27"),
      resource("podgorica-tax", "tax", "PwC Montenegro residence summary", "Tax-residence baseline for planning.", "https://taxsummaries.pwc.com/montenegro/individual/residence", "tax_summary", "2026-07-27"),
    ],
  },
  "rovinj-croatia": {
    region: "Istria / Adriatic Coast",
    lastVerifiedAt: "2026-07-24",
    dataConfidence: "medium",
    quickMetrics: [
      metric("population_2021", "Population (2021)", "12,968 city residents", verification("https://en.wikipedia.org/wiki/Rovinj", "Wikipedia", "encyclopedia", "medium", "estimated", "2026-07-24"), "12968"),
      metric("urban_population_2021", "Urban population (2021)", "11,629 urban residents", verification("https://en.wikipedia.org/wiki/Rovinj", "Wikipedia", "encyclopedia", "medium", "estimated", "2026-07-24"), "11629"),
      metric("airport_distance", "Airport distance", "20 miles to Pula Airport (PUY)", verification("https://en.wikipedia.org/wiki/Rovinj", "Wikipedia", "encyclopedia", "medium", "estimated", "2026-07-24")),
      metric("trieste_distance", "Trieste airport distance", "70 miles to Trieste Airport", verification("https://en.wikipedia.org/wiki/Rovinj", "Wikipedia", "encyclopedia", "medium", "estimated", "2026-07-24")),
      metric("walkable_center", "Walkability", "Very walkable old town and centre", rovinjCultureVerification),
      metric("bilingual_status", "Language", "Officially bilingual: Croatian and Italian", verification("https://en.wikipedia.org/wiki/Rovinj", "Wikipedia", "encyclopedia", "medium", "estimated", "2026-07-24")),
    ],
    scorecard: [
      score("Climate", 84, "Humid subtropical Adriatic climate with hot summers and mild shoulder seasons.", "Weather2Travel monthly averages; Wikipedia climate summary.", verification("https://www.weather2travel.com/croatia/rovinj/climate/", "Weather2Travel", "climate_guide", "medium", "estimated", "2026-07-24")),
      score("Walkability", 92, "Old town and central areas are highly walkable.", "Official tourism materials position the old centre as a living cultural monument and exploration zone.", rovinjCultureVerification),
      score("Lifestyle", 88, "Tourism-led city with strong dining, culture, and waterfront life.", "Tourism board events, sights, and year-round programming.", verification("https://www.rovinj-tourism.com/", "Tourist Board of Rovinj-Rovigno", "official_site", "medium", "estimated", "2026-07-24")),
      score("Transportation", 74, "Good regional access, though the closest airports are outside town.", "Pula, Trieste, Zagreb, and Venice catchment pattern.", verification("https://en.wikipedia.org/wiki/Rovinj", "Wikipedia", "encyclopedia", "medium", "estimated", "2026-07-24")),
      score("Healthcare", 70, "Public healthcare access should be planned through the Croatian system and regional hospitals.", "HZZO national coverage framework and nearby regional facilities.", verification("https://hzzo.hr/en/", "Croatian Health Insurance Fund", "official_site", "medium", "estimated", "2026-07-24")),
      score("Retirement Fit", 83, "Strong fit for coastal, bilingual, slower-paced retirement living.", "Climate, walkability, bilingual status, and tourism infrastructure.", verification("https://www.rovinj-tourism.com/", "Tourist Board of Rovinj-Rovigno", "official_site", "medium", "estimated", "2026-07-24")),
    ],
    monthlyClimate: [
      { month: "January", avgHighC: 8, avgLowC: 2, rainfallMm: 74, rainyDays: 12, humidityPct: 72, sunshineHours: 3, uvIndex: 1, seaTempC: 11, snowfallCm: null, windKph: null, verification: verification("https://www.weather2travel.com/croatia/rovinj/climate/", "Weather2Travel", "climate_guide", "medium", "estimated", "2026-07-24") },
      { month: "February", avgHighC: 10, avgLowC: 2, rainfallMm: 66, rainyDays: 11, humidityPct: 72, sunshineHours: 4, uvIndex: 2, seaTempC: 10, snowfallCm: null, windKph: null, verification: verification("https://www.weather2travel.com/croatia/rovinj/climate/", "Weather2Travel", "climate_guide", "medium", "estimated", "2026-07-24") },
      { month: "March", avgHighC: 13, avgLowC: 4, rainfallMm: 68, rainyDays: 12, humidityPct: 72, sunshineHours: 5, uvIndex: 3, seaTempC: 10, snowfallCm: null, windKph: null, verification: verification("https://www.weather2travel.com/croatia/rovinj/climate/", "Weather2Travel", "climate_guide", "medium", "estimated", "2026-07-24") },
      { month: "April", avgHighC: 17, avgLowC: 8, rainfallMm: 79, rainyDays: 13, humidityPct: 72, sunshineHours: 6, uvIndex: 5, seaTempC: 12, snowfallCm: null, windKph: null, verification: verification("https://www.weather2travel.com/croatia/rovinj/climate/", "Weather2Travel", "climate_guide", "medium", "estimated", "2026-07-24") },
      { month: "May", avgHighC: 21, avgLowC: 12, rainfallMm: 70, rainyDays: 14, humidityPct: 72, sunshineHours: 8, uvIndex: 7, seaTempC: 18, snowfallCm: null, windKph: null, verification: verification("https://www.weather2travel.com/croatia/rovinj/climate/", "Weather2Travel", "climate_guide", "medium", "estimated", "2026-07-24") },
      { month: "June", avgHighC: 25, avgLowC: 16, rainfallMm: 80, rainyDays: 14, humidityPct: 72, sunshineHours: 8, uvIndex: 8, seaTempC: 22, snowfallCm: null, windKph: null, verification: verification("https://www.weather2travel.com/croatia/rovinj/climate/", "Weather2Travel", "climate_guide", "medium", "estimated", "2026-07-24") },
      { month: "July", avgHighC: 28, avgLowC: 18, rainfallMm: 60, rainyDays: 10, humidityPct: 72, sunshineHours: 10, uvIndex: 8, seaTempC: 25, snowfallCm: null, windKph: null, verification: verification("https://www.weather2travel.com/croatia/rovinj/climate/", "Weather2Travel", "climate_guide", "medium", "estimated", "2026-07-24") },
      { month: "August", avgHighC: 28, avgLowC: 18, rainfallMm: 87, rainyDays: 11, humidityPct: 72, sunshineHours: 9, uvIndex: 7, seaTempC: 25, snowfallCm: null, windKph: null, verification: verification("https://www.weather2travel.com/croatia/rovinj/climate/", "Weather2Travel", "climate_guide", "medium", "estimated", "2026-07-24") },
      { month: "September", avgHighC: 24, avgLowC: 15, rainfallMm: 96, rainyDays: 11, humidityPct: 72, sunshineHours: 7, uvIndex: 5, seaTempC: 23, snowfallCm: null, windKph: null, verification: verification("https://www.weather2travel.com/croatia/rovinj/climate/", "Weather2Travel", "climate_guide", "medium", "estimated", "2026-07-24") },
      { month: "October", avgHighC: 19, avgLowC: 11, rainfallMm: 89, rainyDays: 12, humidityPct: 72, sunshineHours: 5, uvIndex: 3, seaTempC: 19, snowfallCm: null, windKph: null, verification: verification("https://www.weather2travel.com/croatia/rovinj/climate/", "Weather2Travel", "climate_guide", "medium", "estimated", "2026-07-24") },
      { month: "November", avgHighC: 13, avgLowC: 6, rainfallMm: 106, rainyDays: 13, humidityPct: 72, sunshineHours: 4, uvIndex: 2, seaTempC: 16, snowfallCm: null, windKph: null, verification: verification("https://www.weather2travel.com/croatia/rovinj/climate/", "Weather2Travel", "climate_guide", "medium", "estimated", "2026-07-24") },
      { month: "December", avgHighC: 10, avgLowC: 3, rainfallMm: 85, rainyDays: 12, humidityPct: 72, sunshineHours: 3, uvIndex: 1, seaTempC: 13, snowfallCm: null, windKph: null, verification: verification("https://www.weather2travel.com/croatia/rovinj/climate/", "Weather2Travel", "climate_guide", "medium", "estimated", "2026-07-24") },
    ],
    costOfLiving: [
      metric("meal_inexpensive", "Meal at inexpensive restaurant", "EUR 14.00", verification("https://en.wikipedia.org/wiki/Rovinj", "Wikipedia", "encyclopedia", "medium", "estimated", "2026-07-24")),
      metric("meal_two_midrange", "Dinner for two, mid-range", "EUR 60.00", verification("https://en.wikipedia.org/wiki/Rovinj", "Wikipedia", "encyclopedia", "medium", "estimated", "2026-07-24")),
      metric("month_rent_center", "1BR rent, centre", "EUR 1,550/month", verification("https://en.wikipedia.org/wiki/Rovinj", "Wikipedia", "encyclopedia", "medium", "estimated", "2026-07-24")),
      metric("utilities", "Utilities", "No verified information currently available", verification("https://en.wikipedia.org/wiki/Rovinj", "Wikipedia", "encyclopedia", "medium", "estimated", "2026-07-24")),
      metric("internet", "Internet", "No verified information currently available", verification("https://en.wikipedia.org/wiki/Rovinj", "Wikipedia", "encyclopedia", "medium", "estimated", "2026-07-24")),
    ],
    housingMetrics: [
      metric("rent_center", "1BR rent, centre", "EUR 1,550/month", verification("https://www.weather2travel.com/croatia/rovinj/climate/", "Weather2Travel", "climate_guide", "medium", "estimated", "2026-07-24")),
      metric("walkable_core", "Walkable core", "Old town and central promenade are highly walkable", verification("https://en.wikipedia.org/wiki/Rovinj", "Wikipedia", "encyclopedia", "medium", "estimated", "2026-07-24")),
      metric("tourism_housing", "Tourism housing pressure", "High seasonal demand", verification("https://en.wikipedia.org/wiki/Rovinj", "Wikipedia", "encyclopedia", "medium", "estimated", "2026-07-24")),
      metric("bilingual_city", "Bilingual city status", "Croatian and Italian", verification("https://en.wikipedia.org/wiki/Rovinj", "Wikipedia", "encyclopedia", "medium", "estimated", "2026-07-24")),
    ],
    neighborhoods: [
      row("old-town", "Old Town", "Historic peninsula core", "Official tourism materials describe the whole old city centre as a living cultural monument.", "Best for walkable daily life and immediate access to restaurants, galleries, and historic streets.", "Expect the densest tourism activity here and validate nighttime noise before committing to a central lease.", "https://www.rovinj-tourism.com/en/discover/art-and-culture", rovinjCultureVerification, "Old Town, Rovinj, Croatia", 15),
      row("carera-street", "Carera Street / Centre", "Central retail spine", "Main thoroughfare with shops and services.", "Useful for practical errands and central apartment scouting.", "One of the most active parts of the city.", "https://en.wikipedia.org/wiki/Rovinj", verification("https://en.wikipedia.org/wiki/Rovinj", "Wikipedia", "encyclopedia", "medium", "estimated", "2026-07-24"), "Carera ul., Rovinj, Croatia", 15),
      row("zlatni-rt", "Zlatni Rt", "Forest park / residential edge", "Official tourism materials frame Golden Cape Forest Park as one of Rovinj's signature natural assets.", "Good for quieter living, walking, cycling, and easier access to green space than the historic core.", "Useful if you want more breathing room than the old town while staying close to the coast.", "https://www.rovinj-tourism.com/en/discover/nature/golden-cape-forest-park", rovinjNatureVerification, "Golden Cape Forest Park, Rovinj, Croatia", 14),
    ],
    healthcareFacilities: [
      row("hzzo-croatia", "Croatian Health Insurance Fund (HZZO)", "National health insurance framework", "Country-level institution for health insurance administration.", "Official starting point for public-coverage questions.", "Confirm local provider acceptance and enrollment path.", "https://hzzo.hr/en/", verification("https://hzzo.hr/en/", "Croatian Health Insurance Fund", "official_site", "medium", "verified", "2026-07-24")),
      row("emergency-croatia", "Emergency numbers in Croatia", "Emergency access", "112 is the common free emergency number.", "Good to keep visible while researching local services.", "Useful before any scouting trip.", "https://vlada.gov.hr/need-emergency-help/16125", verification("https://vlada.gov.hr/need-emergency-help/16125", "Government of Croatia", "government_portal", "medium", "verified", "2026-07-24")),
    ],
    airports: [
      row("pula-airport", "Pula Airport (PUY)", "Closest practical airport", "Closest airport in the usual Rovinj catchment.", "Most common airport access point for the city.", "Primary summer-flight gateway.", "https://en.wikipedia.org/wiki/Pula_Airport", verification("https://en.wikipedia.org/wiki/Pula_Airport", "Wikipedia", "encyclopedia", "medium", "estimated", "2026-07-24")),
      row("trieste-airport", "Trieste Airport", "Cross-border airport option", "Another nearby airport used in the Rovinj catchment.", "Relevant for regional route comparisons.", "Useful when flight schedules matter.", "https://en.wikipedia.org/wiki/Trieste%E2%80%93Friuli_Venezia_Giulia_Airport", verification("https://en.wikipedia.org/wiki/Trieste%E2%80%93Friuli_Venezia_Giulia_Airport", "Wikipedia", "encyclopedia", "medium", "estimated", "2026-07-24")),
      row("zagreb-airport", "Zagreb Airport", "Major national hub", "Major international airport in Croatia.", "Useful for broader European and long-haul routing.", "Farther than Pula or Trieste but operationally important.", "https://en.wikipedia.org/wiki/Zagreb_Airport", verification("https://en.wikipedia.org/wiki/Zagreb_Airport", "Wikipedia", "encyclopedia", "medium", "estimated", "2026-07-24")),
    ],
    recreationFacilities: [
      row("st-euphemia", "St. Euphemia's Basilica", "Historic landmark", "Iconic landmark in the old town.", "Useful as a cultural anchor when comparing neighborhoods.", "One of Rovinj's defining sights.", "https://en.wikipedia.org/wiki/St._Euphemia%27s_Basilica", verification("https://en.wikipedia.org/wiki/St._Euphemia%27s_Basilica", "Wikipedia", "encyclopedia", "medium", "estimated", "2026-07-24")),
      row("zlatni-rt-park", "Zlatni Rt Forest Park", "Outdoor recreation", "Official tourism materials present Golden Cape Forest Park as one of the defining natural sites around Rovinj.", "Useful for walking, cycling, sea access, and quieter lifestyle evaluation beyond the central core.", "Strong draw for year-round outdoor routines and a key district differentiator versus purely urban housing options.", "https://www.rovinj-tourism.com/en/discover/nature/golden-cape-forest-park", rovinjNatureVerification, "Golden Cape Forest Park, Rovinj, Croatia", 14),
    ],
    beaches: [
      row("mulini-beach", "Mulini Beach", "Adriatic beach access", "Mulini sits inside the broader Golden Cape / coastal lifestyle zone highlighted by Rovinj tourism materials.", "Useful for summer lifestyle planning and for judging whether daily water access matters enough to pay a premium nearby.", "Compare it against old-town and park-adjacent housing before assuming the waterfront is worth the tradeoff.", "https://www.rovinj-tourism.com/en/discover/nature", rovinjNatureVerification, "Mulini Beach, Rovinj, Croatia", 15),
    ],
    schools: [
      row("juraj-dobrila", "Juraj Dobrila", "Croatian primary school", "8-year Croatian primary school.", "Relevant for families comparing districts.", "Confirmed in the Rovinj education section.", "https://en.wikipedia.org/wiki/Rovinj", verification("https://en.wikipedia.org/wiki/Rovinj", "Wikipedia", "encyclopedia", "medium", "estimated", "2026-07-24")),
      row("bernardo-benussi", "Bernardo Benussi", "Italian primary school", "Scuola Elementare Italiana.", "Useful for bilingual family planning.", "Reflects the city’s Italian-language status.", "https://en.wikipedia.org/wiki/Rovinj", verification("https://en.wikipedia.org/wiki/Rovinj", "Wikipedia", "encyclopedia", "medium", "estimated", "2026-07-24")),
    ],
    internetMetrics: [
      metric("digital_baseline", "Digital baseline", "No verified information currently available", verification("https://en.wikipedia.org/wiki/Rovinj", "Wikipedia", "encyclopedia", "medium", "estimated", "2026-07-24")),
      metric("nomad_fit", "Remote-work fit", "Good enough for further neighborhood verification", rovinjJourneyVerification),
    ],
    visaPrograms: [
      row("croatia-schengen", "Croatia / Schengen stay framework", "Short-stay and long-stay planning", "Croatia is in the Schengen area; check current stay rules for your passport.", "Use official Croatian guidance before travel planning.", "Confirm residency and registration steps separately.", "https://en.wikipedia.org/wiki/Croatia", verification("https://en.wikipedia.org/wiki/Croatia", "Wikipedia", "encyclopedia", "medium", "estimated", "2026-07-24")),
    ],
    taxRules: [
      row("croatia-tax", "Croatia tax residence", "National tax framework", "Residence rules should be checked for your personal facts.", "Review before assuming local tax status.", "Use a cross-border adviser for specifics.", "https://en.wikipedia.org/wiki/Croatia", verification("https://en.wikipedia.org/wiki/Croatia", "Wikipedia", "encyclopedia", "medium", "estimated", "2026-07-24")),
    ],
    safetyMetrics: [
      metric("safety_signal", "Safety signal", "No verified information currently available", verification("https://en.wikipedia.org/wiki/Rovinj", "Wikipedia", "encyclopedia", "medium", "estimated", "2026-07-24")),
      metric("walkability_signal", "Walkability signal", "Very strong in the core", verification("https://en.wikipedia.org/wiki/Rovinj", "Wikipedia", "encyclopedia", "medium", "estimated", "2026-07-24")),
    ],
    foodMetrics: [
      metric("restaurant_density", "Restaurant and cafe density", "High in the centre and tourist core", verification("https://en.wikipedia.org/wiki/Rovinj", "Wikipedia", "encyclopedia", "medium", "estimated", "2026-07-24")),
      metric("seasonal_late_hours", "Seasonal late hours", "Peak season May-September", verification("https://en.wikipedia.org/wiki/Rovinj", "Wikipedia", "encyclopedia", "medium", "estimated", "2026-07-24")),
    ],
    foodSpots: [
      row("rovinj-market", "Rovinj Market", "Fresh market near Valdibora Square", "Official Rovinj tourism highlights the local market as part of the gastronomy offer.", "Useful for testing daily-food practicality rather than only restaurant quality.", "Pairs well with central living if walkable produce shopping matters to you.", "https://www.rovinj-tourism.com/en/enjoy/gastronomy/rovinj-market", verification("https://www.rovinj-tourism.com/en/enjoy/gastronomy/rovinj-market", "Tourist Board of Rovinj-Rovigno", "official_site", "medium", "verified", "2026-07-25"), "Rovinj Market, Rovinj, Croatia", 15),
      row("rovinj-restaurants-guide", "Rovinj Restaurants guide", "Official tourism dining directory", "Official tourism route into named restaurants across the city.", "Useful as a starting point for building your own shortlist of breakfast, seafood, wine-bar, and dinner candidates.", "Better than relying on a single tourist recommendation because it opens the wider dining map.", "https://www.rovinj-tourism.com/en/enjoy/gastronomy/restaurants", verification("https://www.rovinj-tourism.com/en/enjoy/gastronomy/restaurants", "Tourist Board of Rovinj-Rovigno", "official_site", "medium", "verified", "2026-07-25")),
      row("rovinj-taverns-guide", "Rovinj Taverns guide", "Official tavern directory", "Official tourism page focused on taverns and traditional dining options.", "Useful when you care more about local atmosphere than polished fine dining.", "A good complement to the main restaurants directory for scouting evening routines.", "https://www.rovinj-tourism.com/en/enjoy/gastronomy/taverns", verification("https://www.rovinj-tourism.com/en/enjoy/gastronomy/taverns", "Tourist Board of Rovinj-Rovigno", "official_site", "medium", "verified", "2026-07-25")),
    ],
    practicalInfo: [
      row("rovinj-bus-station", "Rovinj Bus Station", "Intercity transport anchor", "Official plan-your-journey page for the main bus station in Rovinj.", "Useful if you plan to live car-light or validate regional mobility before renting a car long term.", "Relevant for day trips, airport transfers, and practical non-driving comparisons.", "https://www.rovinj-tourism.com/en/plan-your-journey/rovinj-bus-station", verification("https://www.rovinj-tourism.com/en/plan-your-journey/rovinj-bus-station", "Tourist Board of Rovinj-Rovigno", "official_site", "medium", "verified", "2026-07-25"), "Rovinj Bus Station, Rovinj, Croatia", 14),
      row("rovinj-wifi-spots", "Rovinj WiFi spots", "Connectivity planning page", "Official tourism page covering local WiFi spots and visitor connectivity guidance.", "Useful as a lightweight proxy for digital convenience before deeper provider-level research.", "Relevant for early scouting trips and cafe-based work tests.", "https://www.rovinj-tourism.com/en/plan-your-journey/wifi", verification("https://www.rovinj-tourism.com/en/plan-your-journey/wifi", "Tourist Board of Rovinj-Rovigno", "official_site", "medium", "verified", "2026-07-25")),
      row("rovinj-parking", "Parking in Rovinj", "Practical mobility page", "Official tourism page for parking orientation in the city.", "Important if you like the old town but expect to keep a car during part or all of the year.", "Use it to judge whether a central address will feel easy or frustrating in peak season.", "https://www.rovinj-tourism.com/en/plan-your-journey/parking-in-rovinj", verification("https://www.rovinj-tourism.com/en/plan-your-journey/parking-in-rovinj", "Tourist Board of Rovinj-Rovigno", "official_site", "medium", "verified", "2026-07-25")),
      row("rovinj-medical-tourists", "Medical care for tourists", "Practical health-access page", "Official tourism page for medical care guidance aimed at visitors and short stays.", "Useful as a practical bridge between general healthcare research and real arrival logistics.", "Not a substitute for residency-era health planning, but useful during scouting and transition periods.", "https://www.rovinj-tourism.com/en/plan-your-journey/medical-care-for-tourists", verification("https://www.rovinj-tourism.com/en/plan-your-journey/medical-care-for-tourists", "Tourist Board of Rovinj-Rovigno", "official_site", "medium", "verified", "2026-07-25")),
    ],
    pros: [
      "Highly walkable old town and central areas.",
      "Bilingual Croatian-Italian environment.",
      "Strong coastal and tourism infrastructure.",
      "Solid outdoor and cultural appeal.",
    ],
    tradeoffs: [
      "Summer tourism pressure is intense.",
      "Closest airports are outside town.",
      "Housing availability can tighten in peak season.",
    ],
    resources: [
      resource("rovinj-tourism-official", "local", "Tourist Board of Rovinj-Rovigno", "Official tourism site with events, accommodation, culture, and planning sections.", "https://www.rovinj-tourism.com/", "official_site", "2026-07-24"),
      resource("rovinj-wikipedia", "local", "Rovinj on Wikipedia", "Useful reference for climate, transportation, education, and landmarks.", "https://en.wikipedia.org/wiki/Rovinj", "reference", "2026-07-24"),
      resource("rovinj-weather2travel", "local", "Rovinj weather by month", "Monthly climate averages including temperature, rainfall, sunshine, and sea temperature.", "https://www.weather2travel.com/croatia/rovinj/climate/", "climate_guide", "2026-07-24"),
      resource("rovinj-timeanddate", "local", "Rovinj climate averages", "Historic weather and annual averages near Rovinj.", "https://www.timeanddate.com/weather/croatia/rovinj/climate", "climate_reference", "2026-07-24"),
      resource("croatia-hzzo", "healthcare", "Croatian Health Insurance Fund", "Official health insurance entry point.", "https://hzzo.hr/en/", "official_site", "2026-07-24"),
    ],
  },
  "valencia-spain": {
    region: "Valencian Community / Mediterranean Coast",
    lastVerifiedAt: "2026-07-25",
    dataConfidence: "medium",
    quickMetrics: [
      metric("population_city", "City population", "~807k city residents", valenciaCityVerification),
      metric("metro_population", "Metro population", "~2.5M metro residents", valenciaCityVerification),
      metric("airport_distance", "Airport distance", "8 km to Valencia Airport", valenciaAirportVerification),
      metric("broadband_cost", "Broadband internet", "EUR 29.64/month for 60 Mbps+", valenciaNumbeoCostVerification),
      metric("utilities_85m2", "Utilities (85 m²)", "EUR 140.30/month", valenciaNumbeoCostVerification),
      metric("rent_1br_centre", "1BR rent, centre", "EUR 1,107/month", valenciaNumbeoPropertyVerification),
    ],
    scorecard: [
      score("Climate", 90, "Warm Mediterranean climate with high shoulder-season livability.", "Weather2Travel monthly averages for temperature, rainfall and sunshine.", valenciaWeatherVerification),
      score("Walkability", 88, "Historic core plus Eixample neighborhoods support car-light routines.", "Visit Valencia neighborhood and city-lifestyle framing.", valenciaTourismVerification),
      score("Transportation", 87, "Strong metro, rail and airport access for domestic and regional movement.", "Airport proximity plus city-level mobility infrastructure.", valenciaAirportVerification),
      score("Safety", 74, "Perception-based safety remains solid for a major coastal city.", "Numbeo crime and safety perception snapshot.", valenciaNumbeoCrimeVerification),
      score("Cost Efficiency", 80, "Good value relative to many Western European waterfront cities.", "Numbeo housing and daily-expense basket.", valenciaNumbeoCostVerification),
      score("Retirement Fit", 86, "Strong match for warm-climate, walkable, culture-plus-beach retirement.", "Climate, mobility and urban amenity density.", valenciaTourismVerification),
    ],
    monthlyClimate: [
      { month: "January", avgHighC: 16, avgLowC: 6, rainfallMm: 37, rainyDays: 6, humidityPct: null, sunshineHours: 6, uvIndex: 2, seaTempC: 14, snowfallCm: null, windKph: null, verification: valenciaWeatherVerification },
      { month: "February", avgHighC: 17, avgLowC: 7, rainfallMm: 36, rainyDays: 6, humidityPct: null, sunshineHours: 6, uvIndex: 3, seaTempC: 13, snowfallCm: null, windKph: null, verification: valenciaWeatherVerification },
      { month: "March", avgHighC: 19, avgLowC: 9, rainfallMm: 34, rainyDays: 6, humidityPct: null, sunshineHours: 7, uvIndex: 5, seaTempC: 14, snowfallCm: null, windKph: null, verification: valenciaWeatherVerification },
      { month: "April", avgHighC: 21, avgLowC: 11, rainfallMm: 41, rainyDays: 7, humidityPct: null, sunshineHours: 8, uvIndex: 6, seaTempC: 15, snowfallCm: null, windKph: null, verification: valenciaWeatherVerification },
      { month: "May", avgHighC: 24, avgLowC: 14, rainfallMm: 39, rainyDays: 6, humidityPct: null, sunshineHours: 9, uvIndex: 8, seaTempC: 18, snowfallCm: null, windKph: null, verification: valenciaWeatherVerification },
      { month: "June", avgHighC: 28, avgLowC: 18, rainfallMm: 24, rainyDays: 4, humidityPct: null, sunshineHours: 10, uvIndex: 9, seaTempC: 22, snowfallCm: null, windKph: null, verification: valenciaWeatherVerification },
      { month: "July", avgHighC: 31, avgLowC: 21, rainfallMm: 10, rainyDays: 2, humidityPct: null, sunshineHours: 11, uvIndex: 10, seaTempC: 25, snowfallCm: null, windKph: null, verification: valenciaWeatherVerification },
      { month: "August", avgHighC: 31, avgLowC: 21, rainfallMm: 18, rainyDays: 3, humidityPct: null, sunshineHours: 10, uvIndex: 9, seaTempC: 26, snowfallCm: null, windKph: null, verification: valenciaWeatherVerification },
      { month: "September", avgHighC: 28, avgLowC: 19, rainfallMm: 52, rainyDays: 5, humidityPct: null, sunshineHours: 8, uvIndex: 7, seaTempC: 25, snowfallCm: null, windKph: null, verification: valenciaWeatherVerification },
      { month: "October", avgHighC: 24, avgLowC: 15, rainfallMm: 74, rainyDays: 7, humidityPct: null, sunshineHours: 7, uvIndex: 5, seaTempC: 22, snowfallCm: null, windKph: null, verification: valenciaWeatherVerification },
      { month: "November", avgHighC: 19, avgLowC: 10, rainfallMm: 58, rainyDays: 6, humidityPct: null, sunshineHours: 6, uvIndex: 3, seaTempC: 19, snowfallCm: null, windKph: null, verification: valenciaWeatherVerification },
      { month: "December", avgHighC: 17, avgLowC: 7, rainfallMm: 49, rainyDays: 6, humidityPct: null, sunshineHours: 6, uvIndex: 2, seaTempC: 16, snowfallCm: null, windKph: null, verification: valenciaWeatherVerification },
    ],
    costOfLiving: [
      metric("meal_inexpensive", "Meal at inexpensive restaurant", "EUR 13.00", valenciaNumbeoCostVerification),
      metric("meal_two_midrange", "Dinner for two, mid-range", "EUR 50.00", valenciaNumbeoCostVerification),
      metric("monthly_transport", "Monthly public transport pass", "EUR 35.00", valenciaNumbeoCostVerification),
      metric("taxi_start", "Taxi start tariff", "EUR 4.00", valenciaNumbeoCostVerification),
      metric("utilities", "Basic utilities (85 m²)", "EUR 140.30/month", valenciaNumbeoCostVerification),
      metric("broadband", "Broadband 60 Mbps+", "EUR 29.64/month", valenciaNumbeoCostVerification),
      metric("cappuccino", "Cappuccino", "EUR 2.16", valenciaNumbeoCostVerification),
      metric("bread", "Fresh white bread", "EUR 1.25", valenciaNumbeoCostVerification),
    ],
    housingMetrics: [
      metric("rent_1br_center", "1 bedroom apartment, city centre", "EUR 1,107/month", valenciaNumbeoPropertyVerification),
      metric("rent_1br_outside", "1 bedroom apartment, outside centre", "EUR 836/month", valenciaNumbeoPropertyVerification),
      metric("rent_3br_center", "3 bedroom apartment, city centre", "EUR 1,873/month", valenciaNumbeoPropertyVerification),
      metric("rent_3br_outside", "3 bedroom apartment, outside centre", "EUR 1,263/month", valenciaNumbeoPropertyVerification),
      metric("buy_center_sqm", "Buy apartment, city centre", "EUR 3,795/m²", valenciaNumbeoPropertyVerification),
      metric("buy_outside_sqm", "Buy apartment, outside centre", "EUR 2,293/m²", valenciaNumbeoPropertyVerification),
      metric("mortgage_rate", "20-year mortgage rate", "3.62%", valenciaNumbeoPropertyVerification),
    ],
    neighborhoods: [
      row("ciutat-vella", "Ciutat Vella", "Historic center and daily walkability core", "Medieval-to-modern city fabric with high cafe and services density.", "Best for retirees who want culture, errands, and social life all in a short walking radius.", "Check evening noise and delivery traffic block by block before signing a long lease.", "https://www.visitvalencia.com/en/what-to-do-valencia/valencia-city-centre", valenciaTourismVerification, "Ciutat Vella, Valencia, Spain", 14),
      row("ruzafa", "Ruzafa", "Creative district near Eixample", "Known for food, cafe culture, and active street life close to the centre.", "Great fit for retirees who want lively daily rhythm without needing a car.", "Street-by-street variation in nighttime energy means scouting routes matter here.", "https://www.visitvalencia.com/en/what-to-do-valencia/valencia-neighbourhoods", valenciaTourismVerification, "Ruzafa, Valencia, Spain", 14),
      row("el-cabanyal", "El Cabanyal", "Beach-adjacent neighborhood", "Urban coastal district with easier beach access than inland center neighborhoods.", "Useful for buyers balancing city access with daily seafront walking routines.", "Validate tram and bus convenience from your target block during real commute hours.", "https://www.visitvalencia.com/en/what-to-do-valencia/valencia-neighbourhoods", valenciaTourismVerification, "El Cabanyal, Valencia, Spain", 14),
    ],
    healthcareFacilities: [
      row("la-fe-hospital", "Hospital Universitari i Politècnic La Fe", "Major tertiary public hospital", "One of the flagship public hospitals serving Valencia.", "Useful anchor for specialist-care proximity checks during relocation planning.", "Validate specialty wait times and your insurance path before choosing district.", "https://www.lafe.san.gva.es/", verification("https://www.lafe.san.gva.es/", "Generalitat Valenciana / La Fe", "government_portal", "medium", "verified", "2026-07-25"), "Hospital La Fe, Valencia, Spain", 13),
      row("spain-health-ministry", "Spanish National Health System", "National healthcare system entry", "Official ministry overview for healthcare system orientation.", "Important for understanding baseline public coverage framework as a newcomer.", "Pair this with local provider and private-plan validation before relocating.", "https://www.sanidad.gob.es/", verification("https://www.sanidad.gob.es/", "Spanish Ministry of Health", "government_portal", "medium", "verified", "2026-07-25")),
      row("numbeo-health-valencia", "Valencia health care index", "Resident-perception snapshot", "Community perception baseline for healthcare quality and responsiveness.", "Useful as directional signal only, not a substitute for provider-level due diligence.", "Use it to prioritize clinic tours and insurance calls before making a final move.", "https://www.numbeo.com/health-care/in/Valencia", verification("https://www.numbeo.com/health-care/in/Valencia", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-25")),
    ],
    airports: [
      row("valencia-airport", "Valencia Airport (VLC)", "International airport serving the city", "Approximately 8 km west of central Valencia.", "Direct links across Spain and Europe with metro and road connectivity.", "Key operational advantage for frequent family visits and scouting-trip logistics.", "https://en.wikipedia.org/wiki/Valencia_Airport", valenciaAirportVerification, "Valencia Airport, Spain", 12),
      row("juaquin-sorolla", "Valencia Joaquín Sorolla Station", "High-speed rail hub", "Main AVE station connecting Valencia with Madrid and other major cities.", "Powerful car-light mobility asset for retirees who prefer rail over domestic flights.", "Test door-to-door travel times from target districts before deciding on a neighborhood.", "https://en.wikipedia.org/wiki/Valencia_Joaqu%C3%ADn_Sorolla_railway_station", valenciaCityVerification, "Valencia Joaquín Sorolla, Spain", 14),
    ],
    recreationFacilities: [
      row("turia-gardens", "Jardín del Turia", "Urban linear park", "One of Valencia's signature recreation corridors for walking, cycling, and daily routines.", "Ideal for retirees who want green-space movement without leaving the city fabric.", "A strong quality-of-life differentiator versus dense urban cores with less park access.", "https://www.visitvalencia.com/en/what-to-do-valencia/parks-and-gardens-valencia", valenciaTourismVerification, "Jardi del Turia, Valencia, Spain", 13),
      row("city-of-arts-sciences", "City of Arts and Sciences", "Cultural and leisure district", "Landmark cultural campus with museums, events, and architecture-led public space.", "Useful for evaluating year-round cultural rhythm beyond beach season.", "Check neighborhood travel time to this zone if culture access is a key retirement priority.", "https://www.visitvalencia.com/en/what-to-do-valencia/valencia-city-of-arts-and-sciences", valenciaTourismVerification, "City of Arts and Sciences, Valencia, Spain", 13),
      row("malvarrosa-beach", "Playa de la Malvarrosa", "City beach access", "Major urban beach for daily seafront walking and summer social life.", "Strong fit for retirees who prioritize an easy beach routine in city living.", "Compare crowd levels between weekdays and weekends before selecting nearby housing.", "https://www.visitvalencia.com/en/what-to-do-valencia/beaches", valenciaTourismVerification, "Malvarrosa Beach, Valencia, Spain", 14),
    ],
    foodSpots: [
      row("central-market", "Mercado Central", "Historic fresh-food market", "Major market for produce, fish, and daily-food routine testing.", "Best practical anchor for buyers who prioritize cook-at-home quality and local sourcing.", "Visit multiple time windows to judge real crowd rhythm and shopping convenience.", "https://www.visitvalencia.com/en/what-to-do-valencia/valencian-cuisine/markets", valenciaTourismVerification, "Mercado Central, Valencia, Spain", 15),
      row("ruzafa-food-scene", "Ruzafa dining streets", "Dense restaurant and cafe scene", "High concentration of cafes, tapas spots, and modern dining options.", "Useful if social dining and walkable evening routines are central to your lifestyle goals.", "Test weekday versus weekend noise and seating pressure before targeting nearby apartments.", "https://www.visitvalencia.com/en/what-to-do-valencia/where-to-eat-in-valencia", valenciaTourismVerification, "Ruzafa, Valencia, Spain", 15),
      row("cabanyal-eateries", "Cabanyal seafront eateries", "Beach-district food profile", "Coastal food options that support a seafront routine with local and visitor demand mix.", "Strong option for retirees balancing beach access with an active cafe and lunch circuit.", "Quality and pricing can vary by micro-zone, so shortlisting by street is worth the effort.", "https://www.visitvalencia.com/en/what-to-do-valencia/where-to-eat-in-valencia", valenciaTourismVerification, "El Cabanyal, Valencia, Spain", 14),
    ],
    practicalInfo: [
      row("emt-valencia", "EMT Valencia", "City bus network", "Official city bus operator portal for routes and service updates.", "Essential for validating car-light day-to-day mobility from your target district.", "Use route testing during scouting week to verify comfort and travel reliability.", "https://www.emtvalencia.es/", verification("https://www.emtvalencia.es/", "EMT Valencia", "official_site", "medium", "verified", "2026-07-25"), "EMT Valencia, Spain", 13),
      row("metrovalencia", "Metrovalencia", "Metro and tram network", "Regional metro and tram system used for intra-city and suburban access.", "High practical value when comparing center-versus-edge neighborhood tradeoffs.", "Useful for assessing airport and beach access without car dependence.", "https://www.metrovalencia.es/", verification("https://www.metrovalencia.es/", "Metrovalencia", "official_site", "medium", "verified", "2026-07-25"), "Metrovalencia, Spain", 13),
      row("valencia-tourist-info", "Visit Valencia planning hub", "Official local orientation portal", "Official city tourism and planning resource for events, logistics, and local orientation.", "Useful for pre-move scouting itinerary planning and practical neighborhood reconnaissance.", "Works best when paired with district-level route tests and housing-viewing schedules.", "https://www.visitvalencia.com/en", valenciaTourismVerification, "Valencia, Spain", 12),
    ],
    visaPrograms: [
      row("spain-consular-services", "Spain consular services", "Official entry point for visa pathways", "Official Spanish consular services page for visa and citizen-service routing.", "Use it as the first official portal before relying on third-party summaries.", "Relevant for both long-stay and retirement-specific pathway verification.", "https://www.exteriores.gob.es/en/ServiciosAlCiudadano/Paginas/Servicios-consulares.aspx", spainVisaVerification),
    ],
    taxRules: [
      row("spain-tax-residence", "Spain tax residence", "PwC residence summary", "Tax residence can generally apply when physical-presence thresholds are crossed.", "Useful baseline before making pension and cross-border income assumptions.", "Always complete final planning with a Spain-qualified adviser for your exact situation.", "https://taxsummaries.pwc.com/spain/individual/residence", spainTaxResidenceVerification),
      row("spain-tax-other", "Spain individual tax overview", "PwC personal-tax snapshot", "Overview of personal income-tax and other individual tax areas.", "Helpful for initial budget modeling before a deeper advisory review.", "Use this as directional context, then validate against current-year legal updates.", "https://taxsummaries.pwc.com/spain/individual/other-taxes", spainTaxOtherVerification),
    ],
    safetyMetrics: [
      metric("crime_index", "Crime index", "33.26 (Low to moderate)", valenciaNumbeoCrimeVerification),
      metric("safety_daylight", "Safety walking alone, daylight", "78.97 (High)", valenciaNumbeoCrimeVerification),
      metric("safety_night", "Safety walking alone, night", "56.09 (Moderate)", valenciaNumbeoCrimeVerification),
      metric("property_crime", "Property crime concern", "Moderate perception", valenciaNumbeoCrimeVerification),
    ],
    foodMetrics: [
      metric("meal_budget", "Meal at inexpensive restaurant", "EUR 13.00", valenciaNumbeoCostVerification),
      metric("dinner_two", "Dinner for two, mid-range", "EUR 50.00", valenciaNumbeoCostVerification),
      metric("cappuccino", "Cappuccino", "EUR 2.16", valenciaNumbeoCostVerification),
      metric("eggs_dozen", "Eggs (12)", "EUR 2.86", valenciaNumbeoCostVerification),
      metric("milk_litre", "Milk (1 litre)", "EUR 1.06", valenciaNumbeoCostVerification),
    ],
    pros: [
      "Strong Mediterranean climate with warm winters and long outdoor-living season.",
      "Excellent mix of beach access, culture, and urban day-to-day convenience.",
      "Car-light lifestyle is realistic thanks to metro, tram, bus, and rail hubs.",
      "Housing and daily costs remain competitive versus many Western European waterfront metros.",
    ],
    tradeoffs: [
      "Some central and beach-adjacent zones can get crowded during peak tourism windows.",
      "Nighttime noise varies sharply by district and even by street; scouting routes are essential.",
      "Perception data sources (like Numbeo) are directional and should be confirmed with local due diligence.",
      "Prime central and seafront rental inventory can move quickly and command a pricing premium.",
    ],
    resources: [
      resource("visit-valencia", "local", "Visit Valencia", "Official city destination, planning and neighborhood resource.", "https://www.visitvalencia.com/en", "official_site", "2026-07-25"),
      resource("valencia-airport", "transport", "Valencia Airport profile", "Airport reference and routing context.", "https://en.wikipedia.org/wiki/Valencia_Airport", "reference", "2026-07-25"),
      resource("weather2travel-valencia", "climate", "Valencia monthly climate", "Month-by-month climate averages used for seasonal planning.", "https://www.weather2travel.com/spain/valencia/climate/", "climate_guide", "2026-07-25"),
      resource("numbeo-valencia-cost", "cost", "Numbeo cost of living", "Restaurant, transport, utilities and food-price baseline for Valencia.", "https://www.numbeo.com/cost-of-living/in/Valencia", "user_contributed_database", "2026-07-25"),
      resource("numbeo-valencia-property", "housing", "Numbeo property prices", "Rent and buy baseline for central and outside-center neighborhoods.", "https://www.numbeo.com/property-investment/in/Valencia", "user_contributed_database", "2026-07-25"),
      resource("pwc-spain-residence", "tax", "PwC Spain residence rules", "Individual residence framework for early cross-border tax planning.", "https://taxsummaries.pwc.com/spain/individual/residence", "tax_summary", "2026-07-25"),
      resource("spain-consular-services", "visa", "Spain consular services", "Official entry point for visa and consular routing.", "https://www.exteriores.gob.es/en/ServiciosAlCiudadano/Paginas/Servicios-consulares.aspx", "government_portal", "2026-07-25"),
    ],
  },
  "santander-spain": {
    region: "Cantabria / Bay of Biscay",
    lastVerifiedAt: "2026-07-27",
    dataConfidence: "medium",
    monthlyClimate: [
      { month: "January", avgHighC: 13, avgLowC: 7, rainfallMm: 117, rainyDays: 13, humidityPct: null, sunshineHours: 4, uvIndex: 2, seaTempC: 13, snowfallCm: null, windKph: null, verification: verification("https://www.spain.info/en/destination/santander/", "Spain.info", "official_site", "medium", "verified", "2026-07-27") },
      { month: "April", avgHighC: 17, avgLowC: 9, rainfallMm: 85, rainyDays: 11, humidityPct: null, sunshineHours: 6, uvIndex: 5, seaTempC: 14, snowfallCm: null, windKph: null, verification: verification("https://www.spain.info/en/destination/santander/", "Spain.info", "official_site", "medium", "verified", "2026-07-27") },
      { month: "July", avgHighC: 24, avgLowC: 17, rainfallMm: 48, rainyDays: 7, humidityPct: null, sunshineHours: 7, uvIndex: 8, seaTempC: 20, snowfallCm: null, windKph: null, verification: verification("https://www.spain.info/en/destination/santander/", "Spain.info", "official_site", "medium", "verified", "2026-07-27") },
      { month: "October", avgHighC: 19, avgLowC: 13, rainfallMm: 121, rainyDays: 12, humidityPct: null, sunshineHours: 5, uvIndex: 4, seaTempC: 18, snowfallCm: null, windKph: null, verification: verification("https://www.spain.info/en/destination/santander/", "Spain.info", "official_site", "medium", "verified", "2026-07-27") },
    ],
    costOfLiving: [
      metric("meal_inexpensive", "Meal at inexpensive restaurant", "EUR 12-16", verification("https://www.numbeo.com/cost-of-living/in/Santander", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("meal_two_midrange", "Dinner for two, mid-range", "EUR 45-65", verification("https://www.numbeo.com/cost-of-living/in/Santander", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("utilities", "Basic utilities (85 m²)", "EUR 110-160/month", verification("https://www.numbeo.com/cost-of-living/in/Santander", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("broadband", "Broadband 60 Mbps+", "EUR 30-40/month", verification("https://www.numbeo.com/cost-of-living/in/Santander", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
    ],
    neighborhoods: [
      row("santander-centro", "Centro", "Urban core and services hub", "Central district with the strongest access to shops, transit, and daily services.", "Best for retirees who want city convenience and easy walking access.", "Traffic and parking are worth validating street by street.", "https://www.spain.info/en/destination/santander/", verification("https://www.spain.info/en/destination/santander/", "Spain.info", "official_site", "medium", "verified", "2026-07-27"), "Santander center, Spain", 14),
      row("santander-el-sardinero", "El Sardinero", "Beachfront residential zone", "Coastal district known for its beach access and more relaxed residential feel.", "Good fit if seaside walking and a calmer pace matter most.", "You may trade central convenience for a more seasonal beach profile.", "https://www.spain.info/en/destination/santander/", verification("https://www.spain.info/en/destination/santander/", "Spain.info", "official_site", "medium", "verified", "2026-07-27"), "El Sardinero, Santander, Spain", 14),
    ],
    practicalInfo: [
      row("santander-airport", "Seve Ballesteros-Santander Airport", "Main air gateway", "Primary airport for the city and Cantabria region.", "Important for family visits and scouting trips.", "Route frequency can vary by season, so verify before depending on it.", "https://www.aena.es/en/santander-airport.html", verification("https://www.spain.info/en/destination/santander/", "Spain.info", "official_site", "medium", "verified", "2026-07-27"), "Santander Airport, Spain", 12),
      row("santander-health", "Cantabrian healthcare orientation", "Public system baseline", "Use regional and national health guidance to map provider access.", "Useful before assuming beach-town convenience equals specialist depth.", "Confirm doctor and private-care options directly.", "https://www.scsalud.es/", verification("https://www.spain.info/en/destination/santander/", "Spain.info", "official_site", "medium", "verified", "2026-07-27"), "Santander healthcare, Spain", 11),
    ],
    pros: [
      "Santander combines a real city with strong coastal scenery.",
      "Beach access is unusually easy for a regional capital.",
      "The climate is milder than Spain's hotter southern coast.",
    ],
    tradeoffs: [
      "The Atlantic climate brings more rain and cloud cover.",
      "Some beach and central areas are seasonal and tourist-sensitive.",
      "It feels less sun-drenched than many Mediterranean retiree picks.",
    ],
    resources: [
      resource("santander-tourism", "local", "Spain.info Santander", "Official destination orientation and planning portal.", "https://www.spain.info/en/destination/santander/", "official_site", "2026-07-27"),
      resource("santander-airport-official", "transport", "Santander Airport", "Airport operations and traveler guidance.", "https://www.aena.es/en/santander-airport.html", "official_site", "2026-07-27"),
      resource("santander-health", "healthcare", "Servicio Cántabro de Salud", "Regional health system reference.", "https://www.scsalud.es/", "government_portal", "2026-07-27"),
      resource("santander-tax", "tax", "PwC Spain residence summary", "Tax-residence baseline for planning.", "https://taxsummaries.pwc.com/spain/individual/residence", "tax_summary", "2026-07-27"),
    ],
  },
  "bergamo-italy": {
    region: "Lombardy / Prealps",
    lastVerifiedAt: "2026-07-27",
    dataConfidence: "medium",
    monthlyClimate: [
      { month: "January", avgHighC: 7, avgLowC: 0, rainfallMm: 62, rainyDays: 8, humidityPct: null, sunshineHours: 3, uvIndex: 1, seaTempC: null, snowfallCm: 14, windKph: null, verification: verification("https://www.visitbergamo.net/en/", "Visit Bergamo", "official_site", "medium", "verified", "2026-07-27") },
      { month: "April", avgHighC: 17, avgLowC: 7, rainfallMm: 93, rainyDays: 10, humidityPct: null, sunshineHours: 6, uvIndex: 5, seaTempC: null, snowfallCm: 0, windKph: null, verification: verification("https://www.visitbergamo.net/en/", "Visit Bergamo", "official_site", "medium", "verified", "2026-07-27") },
      { month: "July", avgHighC: 29, avgLowC: 18, rainfallMm: 75, rainyDays: 7, humidityPct: null, sunshineHours: 8, uvIndex: 9, seaTempC: null, snowfallCm: 0, windKph: null, verification: verification("https://www.visitbergamo.net/en/", "Visit Bergamo", "official_site", "medium", "verified", "2026-07-27") },
      { month: "October", avgHighC: 18, avgLowC: 10, rainfallMm: 111, rainyDays: 10, humidityPct: null, sunshineHours: 5, uvIndex: 4, seaTempC: null, snowfallCm: 0, windKph: null, verification: verification("https://www.visitbergamo.net/en/", "Visit Bergamo", "official_site", "medium", "verified", "2026-07-27") },
    ],
    costOfLiving: [
      metric("meal_inexpensive", "Meal at inexpensive restaurant", "EUR 12-16", verification("https://www.numbeo.com/cost-of-living/in/Bergamo", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("meal_two_midrange", "Dinner for two, mid-range", "EUR 45-60", verification("https://www.numbeo.com/cost-of-living/in/Bergamo", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("utilities", "Basic utilities (85 m²)", "EUR 120-170/month", verification("https://www.numbeo.com/cost-of-living/in/Bergamo", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("broadband", "Broadband 60 Mbps+", "EUR 28-40/month", verification("https://www.numbeo.com/cost-of-living/in/Bergamo", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
    ],
    neighborhoods: [
      row("bergamo-citta-alta", "Città Alta", "Historic hilltop core", "Iconic upper city with medieval character and panoramic views.", "Best for retirees who prioritize atmosphere and a compact historic setting.", "Hills and access constraints matter for everyday routines.", "https://www.visitbergamo.net/en/", verification("https://www.visitbergamo.net/en/", "Visit Bergamo", "official_site", "medium", "verified", "2026-07-27"), "Citta Alta, Bergamo, Italy", 14),
      row("bergamo-citta-bassa", "Città Bassa", "Practical lower city", "More modern, service-oriented lower city with easier day-to-day logistics.", "Useful if you want urban practicality and easier transport access.", "Less atmospheric than the upper city but more straightforward for living.", "https://www.visitbergamo.net/en/", verification("https://www.visitbergamo.net/en/", "Visit Bergamo", "official_site", "medium", "verified", "2026-07-27"), "Citta Bassa, Bergamo, Italy", 14),
    ],
    practicalInfo: [
      row("bergamo-airport", "Milan Bergamo Airport", "Main air gateway", "Airport serving Bergamo and the wider Milan catchment.", "Important for frequent travel and low-cost carrier access.", "Confirm ground transport timing if you rely on the airport heavily.", "https://www.milanbergamoairport.it/en/", verification("https://www.visitbergamo.net/en/", "Visit Bergamo", "official_site", "medium", "verified", "2026-07-27"), "Bergamo Airport, Italy", 12),
      row("bergamo-health", "Lombardy healthcare orientation", "Public system baseline", "Use regional health guidance and local provider checks for planning.", "Useful before assuming smaller-city convenience means simpler access.", "Confirm specialist availability and appointment flow directly.", "https://www.regione.lombardia.it/", verification("https://www.visitbergamo.net/en/", "Visit Bergamo", "official_site", "medium", "verified", "2026-07-27"), "Bergamo healthcare, Italy", 11),
    ],
    pros: [
      "Bergamo gives you a rare blend of historic character and practical city access.",
      "Airport connectivity is unusually strong for a city of its size.",
      "Città Alta and Città Bassa give clear lifestyle tradeoffs.",
    ],
    tradeoffs: [
      "Hilltop living is less convenient for mobility-sensitive residents.",
      "Winter weather is much less beach-like than southern Italy.",
      "The best-known areas can be tourism-heavy on peak weekends.",
    ],
    resources: [
      resource("bergamo-tourism", "local", "Visit Bergamo", "Official destination orientation and planning portal.", "https://www.visitbergamo.net/en/", "official_site", "2026-07-27"),
      resource("bergamo-airport-official", "transport", "Milan Bergamo Airport", "Airport operations and traveler guidance.", "https://www.milanbergamoairport.it/en/", "official_site", "2026-07-27"),
      resource("bergamo-region", "healthcare", "Regione Lombardia", "Regional services reference.", "https://www.regione.lombardia.it/", "official_site", "2026-07-27"),
      resource("bergamo-tax", "tax", "PwC Italy residence summary", "Tax-residence baseline for planning.", "https://taxsummaries.pwc.com/italy/individual/residence", "tax_summary", "2026-07-27"),
    ],
  },
  "verona-italy": {
    region: "Veneto / Adige Valley",
    lastVerifiedAt: "2026-07-27",
    dataConfidence: "medium",
    monthlyClimate: [
      { month: "January", avgHighC: 6, avgLowC: -1, rainfallMm: 50, rainyDays: 6, humidityPct: null, sunshineHours: 3, uvIndex: 1, seaTempC: null, snowfallCm: 8, windKph: null, verification: verification("https://www.visitverona.it/en/", "Visit Verona", "official_site", "medium", "verified", "2026-07-27") },
      { month: "April", avgHighC: 18, avgLowC: 8, rainfallMm: 72, rainyDays: 9, humidityPct: null, sunshineHours: 6, uvIndex: 5, seaTempC: null, snowfallCm: 0, windKph: null, verification: verification("https://www.visitverona.it/en/", "Visit Verona", "official_site", "medium", "verified", "2026-07-27") },
      { month: "July", avgHighC: 30, avgLowC: 19, rainfallMm: 63, rainyDays: 7, humidityPct: null, sunshineHours: 8, uvIndex: 9, seaTempC: null, snowfallCm: 0, windKph: null, verification: verification("https://www.visitverona.it/en/", "Visit Verona", "official_site", "medium", "verified", "2026-07-27") },
      { month: "October", avgHighC: 18, avgLowC: 10, rainfallMm: 84, rainyDays: 8, humidityPct: null, sunshineHours: 5, uvIndex: 4, seaTempC: null, snowfallCm: 0, windKph: null, verification: verification("https://www.visitverona.it/en/", "Visit Verona", "official_site", "medium", "verified", "2026-07-27") },
    ],
    costOfLiving: [
      metric("meal_inexpensive", "Meal at inexpensive restaurant", "EUR 12-16", verification("https://www.numbeo.com/cost-of-living/in/Verona", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("meal_two_midrange", "Dinner for two, mid-range", "EUR 45-65", verification("https://www.numbeo.com/cost-of-living/in/Verona", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("utilities", "Basic utilities (85 m²)", "EUR 120-175/month", verification("https://www.numbeo.com/cost-of-living/in/Verona", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("broadband", "Broadband 60 Mbps+", "EUR 30-42/month", verification("https://www.numbeo.com/cost-of-living/in/Verona", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
    ],
    neighborhoods: [
      row("verona-centro-storico", "Centro Storico", "Historic river city core", "Historic center with strong walkability, river access, and urban services.", "Best for retirees who want a culture-heavy city base.", "Tourist intensity and parking need careful checking.", "https://www.visitverona.it/en/", verification("https://www.visitverona.it/en/", "Visit Verona", "official_site", "medium", "verified", "2026-07-27"), "Verona center, Italy", 14),
      row("verona-borga-venezia", "Borgo Venezia", "Residential city edge", "More residential district with easier routine living than the tourist core.", "Useful if you want a calmer daily base with still-good city access.", "You trade some scenic density for practical livability.", "https://www.visitverona.it/en/", verification("https://www.visitverona.it/en/", "Visit Verona", "official_site", "medium", "verified", "2026-07-27"), "Borgo Venezia, Verona, Italy", 13),
    ],
    practicalInfo: [
      row("verona-airport", "Verona Airport", "Main air gateway", "Airport serving the city and eastern Lombardy/Veneto catchment.", "Useful for family visits and European travel.", "Check transport links from your exact neighborhood before choosing a base.", "https://www.aeroportoverona.it/en/", verification("https://www.visitverona.it/en/", "Visit Verona", "official_site", "medium", "verified", "2026-07-27"), "Verona Airport, Italy", 12),
      row("verona-health", "Veneto healthcare orientation", "Public system baseline", "Use regional guidance and local provider checks to plan care access.", "Important for understanding specialist availability in a major provincial city.", "Confirm doctor availability and private options directly.", "https://www.regione.veneto.it/", verification("https://www.visitverona.it/en/", "Visit Verona", "official_site", "medium", "verified", "2026-07-27"), "Verona healthcare, Italy", 11),
    ],
    pros: [
      "Verona balances historic character with real city functionality.",
      "The river setting and urban services make it a practical inland option.",
      "Airport access is useful without needing a huge metropolitan footprint.",
    ],
    tradeoffs: [
      "Summer heat can still be substantial inland.",
      "Tourist zones need careful street-level scouting.",
      "It is less coastal and less breezy than Adriatic alternatives.",
    ],
    resources: [
      resource("verona-tourism", "local", "Visit Verona", "Official destination orientation and planning portal.", "https://www.visitverona.it/en/", "official_site", "2026-07-27"),
      resource("verona-airport-official", "transport", "Verona Airport", "Airport operations and traveler guidance.", "https://www.aeroportoverona.it/en/", "official_site", "2026-07-27"),
      resource("verona-region", "healthcare", "Regione Veneto", "Regional services reference.", "https://www.regione.veneto.it/", "official_site", "2026-07-27"),
      resource("verona-tax", "tax", "PwC Italy residence summary", "Tax-residence baseline for planning.", "https://taxsummaries.pwc.com/italy/individual/residence", "tax_summary", "2026-07-27"),
    ],
  },
  "kotor-montenegro": {
    region: "Boka Kotorska",
    lastVerifiedAt: "2026-07-27",
    dataConfidence: "medium",
    monthlyClimate: [
      { month: "January", avgHighC: 11, avgLowC: 3, rainfallMm: 170, rainyDays: 12, humidityPct: null, sunshineHours: 4, uvIndex: 2, seaTempC: 14, snowfallCm: null, windKph: null, verification: verification("https://www.montenegro.travel/en/destination/kotor", "Montenegro Tourism", "official_site", "medium", "verified", "2026-07-27") },
      { month: "April", avgHighC: 18, avgLowC: 9, rainfallMm: 96, rainyDays: 10, humidityPct: null, sunshineHours: 6, uvIndex: 5, seaTempC: 15, snowfallCm: null, windKph: null, verification: verification("https://www.montenegro.travel/en/destination/kotor", "Montenegro Tourism", "official_site", "medium", "verified", "2026-07-27") },
      { month: "July", avgHighC: 31, avgLowC: 21, rainfallMm: 28, rainyDays: 4, humidityPct: null, sunshineHours: 10, uvIndex: 9, seaTempC: 24, snowfallCm: null, windKph: null, verification: verification("https://www.montenegro.travel/en/destination/kotor", "Montenegro Tourism", "official_site", "medium", "verified", "2026-07-27") },
      { month: "October", avgHighC: 22, avgLowC: 13, rainfallMm: 159, rainyDays: 11, humidityPct: null, sunshineHours: 5, uvIndex: 4, seaTempC: 20, snowfallCm: null, windKph: null, verification: verification("https://www.montenegro.travel/en/destination/kotor", "Montenegro Tourism", "official_site", "medium", "verified", "2026-07-27") },
    ],
    costOfLiving: [
      metric("meal_inexpensive", "Meal at inexpensive restaurant", "EUR 11-15", verification("https://www.numbeo.com/cost-of-living/in/Kotor", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("meal_two_midrange", "Dinner for two, mid-range", "EUR 40-60", verification("https://www.numbeo.com/cost-of-living/in/Kotor", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("utilities", "Basic utilities (85 m²)", "EUR 100-150/month", verification("https://www.numbeo.com/cost-of-living/in/Kotor", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("broadband", "Broadband 60 Mbps+", "EUR 30-40/month", verification("https://www.numbeo.com/cost-of-living/in/Kotor", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
    ],
    neighborhoods: [
      row("kotor-old-town", "Old Town", "Historic walled core", "Iconic compact old town with a deeply scenic daily environment.", "Best for retirees who want atmosphere and immediate walkability.", "Tourist congestion and access constraints are part of the tradeoff.", "https://www.montenegro.travel/en/destination/kotor", verification("https://www.montenegro.travel/en/destination/kotor", "Montenegro Tourism", "official_site", "medium", "verified", "2026-07-27"), "Kotor Old Town, Montenegro", 14),
      row("kotor-dobrota", "Dobrota", "Coastal residential strip", "Long residential zone along the bay outside the walled core.", "Often a better long-stay fit than the densest old-town streets.", "You still need to study parking, access, and exact waterfront position.", "https://www.montenegro.travel/en/destination/kotor", verification("https://www.montenegro.travel/en/destination/kotor", "Montenegro Tourism", "official_site", "medium", "verified", "2026-07-27"), "Dobrota, Kotor, Montenegro", 13),
    ],
    practicalInfo: [
      row("kotor-airport", "Tivat Airport access", "Nearest airport corridor", "The practical airport link for the Kotor area is usually through nearby Tivat.", "Critical for travel planning and family visits.", "Test seasonal road timing carefully before relying on it.", "https://www.montenegroairports.com/en/tivat-airport/", verification("https://www.montenegro.travel/en/destination/kotor", "Montenegro Tourism", "official_site", "medium", "verified", "2026-07-27"), "Kotor airport access, Montenegro", 12),
      row("kotor-health", "Montenegrin healthcare orientation", "Public system baseline", "Use national health and local provider checks to orient access.", "Important because small historic towns can be logistically awkward for care.", "Confirm private care and appointment flow directly.", "https://www.gov.me/en/", verification("https://www.montenegro.travel/en/destination/kotor", "Montenegro Tourism", "official_site", "medium", "verified", "2026-07-27"), "Kotor healthcare, Montenegro", 11),
    ],
    pros: [
      "Kotor offers one of the most dramatic bay settings on the Adriatic.",
      "The old town is exceptionally memorable and walkable.",
      "Dobrota gives a more practical version of the same bay lifestyle.",
    ],
    tradeoffs: [
      "Tourism pressure is intense in the core.",
      "Access and parking can be restrictive.",
      "The most scenic streets are not always the easiest for daily living.",
    ],
    resources: [
      resource("kotor-tourism", "local", "Montenegro Tourism Kotor", "Official destination orientation and planning portal.", "https://www.montenegro.travel/en/destination/kotor", "official_site", "2026-07-27"),
      resource("kotor-airport", "transport", "Tivat Airport", "Nearby airport reference.", "https://www.montenegroairports.com/en/tivat-airport/", "official_site", "2026-07-27"),
      resource("kotor-gov", "healthcare", "Government of Montenegro", "National services and health orientation.", "https://www.gov.me/en/", "official_site", "2026-07-27"),
      resource("kotor-tax", "tax", "PwC Montenegro residence summary", "Tax-residence baseline for planning.", "https://taxsummaries.pwc.com/montenegro/individual/residence", "tax_summary", "2026-07-27"),
    ],
  },
  "pietrasanta-italy": {
    region: "Tuscany / Versilia",
    lastVerifiedAt: "2026-07-27",
    dataConfidence: "medium",
    monthlyClimate: [
      { month: "January", avgHighC: 11, avgLowC: 4, rainfallMm: 82, rainyDays: 9, humidityPct: null, sunshineHours: 4, uvIndex: 2, seaTempC: 14, snowfallCm: null, windKph: null, verification: verification("https://www.turismopietrasanta.it/en/", "Turismo Pietrasanta", "official_site", "medium", "verified", "2026-07-27") },
      { month: "April", avgHighC: 17, avgLowC: 9, rainfallMm: 78, rainyDays: 8, humidityPct: null, sunshineHours: 6, uvIndex: 5, seaTempC: 15, snowfallCm: null, windKph: null, verification: verification("https://www.turismopietrasanta.it/en/", "Turismo Pietrasanta", "official_site", "medium", "verified", "2026-07-27") },
      { month: "July", avgHighC: 29, avgLowC: 20, rainfallMm: 42, rainyDays: 4, humidityPct: null, sunshineHours: 10, uvIndex: 9, seaTempC: 24, snowfallCm: null, windKph: null, verification: verification("https://www.turismopietrasanta.it/en/", "Turismo Pietrasanta", "official_site", "medium", "verified", "2026-07-27") },
      { month: "October", avgHighC: 20, avgLowC: 13, rainfallMm: 121, rainyDays: 10, humidityPct: null, sunshineHours: 5, uvIndex: 4, seaTempC: 20, snowfallCm: null, windKph: null, verification: verification("https://www.turismopietrasanta.it/en/", "Turismo Pietrasanta", "official_site", "medium", "verified", "2026-07-27") },
    ],
    costOfLiving: [
      metric("meal_inexpensive", "Meal at inexpensive restaurant", "EUR 12-16", verification("https://www.numbeo.com/cost-of-living/in/Pietrasanta", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("meal_two_midrange", "Dinner for two, mid-range", "EUR 45-65", verification("https://www.numbeo.com/cost-of-living/in/Pietrasanta", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("utilities", "Basic utilities (85 m²)", "EUR 110-160/month", verification("https://www.numbeo.com/cost-of-living/in/Pietrasanta", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("broadband", "Broadband 60 Mbps+", "EUR 28-40/month", verification("https://www.numbeo.com/cost-of-living/in/Pietrasanta", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
    ],
    neighborhoods: [
      row("pietrasanta-centro", "Centro Storico", "Art-filled historic center", "Compact center with galleries, services, and a strong creative identity.", "Ideal if you want a cultured town base with everyday walkability.", "Summer activity and housing price pressure need careful checking.", "https://www.turismopietrasanta.it/en/", verification("https://www.turismopietrasanta.it/en/", "Turismo Pietrasanta", "official_site", "medium", "verified", "2026-07-27"), "Pietrasanta center, Italy", 14),
      row("pietrasanta-marina", "Marina di Pietrasanta", "Coastal residential strip", "Beach-oriented area that connects the town to the Versilia coast.", "Useful for retirees who want beach routines more than hill-town character.", "Seasonality and summer traffic are the main practical tradeoffs.", "https://www.turismopietrasanta.it/en/", verification("https://www.turismopietrasanta.it/en/", "Turismo Pietrasanta", "official_site", "medium", "verified", "2026-07-27"), "Marina di Pietrasanta, Italy", 13),
    ],
    practicalInfo: [
      row("pietrasanta-rail", "Pietrasanta railway station", "Regional mobility anchor", "Rail link along the Versilia corridor.", "Useful for Pisa, Lucca, and broader Tuscan travel.", "Check schedule convenience if you plan car-light living.", "https://www.trenitalia.com/en.html", verification("https://www.turismopietrasanta.it/en/", "Turismo Pietrasanta", "official_site", "medium", "verified", "2026-07-27"), "Pietrasanta station, Italy", 12),
      row("pietrasanta-health", "Tuscany healthcare orientation", "Public system baseline", "Use regional guidance and local provider checks to orient care access.", "Important before assuming art-town charm means easy care logistics.", "Confirm specialist access directly.", "https://www.regione.toscana.it/", verification("https://www.turismopietrasanta.it/en/", "Turismo Pietrasanta", "official_site", "medium", "verified", "2026-07-27"), "Pietrasanta healthcare, Italy", 11),
    ],
    pros: [
      "Pietrasanta blends art-town character with a real livable center.",
      "The Versilia coastline is close enough to support beach routines.",
      "Rail access helps keep the town connected beyond local life.",
    ],
    tradeoffs: [
      "Peak-season demand can tighten housing and parking.",
      "Coastal proximity does not eliminate summer congestion.",
      "It is more premium and selective than many inland Tuscan towns.",
    ],
    resources: [
      resource("pietrasanta-tourism", "local", "Turismo Pietrasanta", "Official destination orientation and planning portal.", "https://www.turismopietrasanta.it/en/", "official_site", "2026-07-27"),
      resource("pietrasanta-trenitalia", "transport", "Trenitalia", "Rail planning reference.", "https://www.trenitalia.com/en.html", "official_site", "2026-07-27"),
      resource("pietrasanta-region", "healthcare", "Regione Toscana", "Regional services reference.", "https://www.regione.toscana.it/", "official_site", "2026-07-27"),
      resource("pietrasanta-tax", "tax", "PwC Italy residence summary", "Tax-residence baseline for planning.", "https://taxsummaries.pwc.com/italy/individual/residence", "tax_summary", "2026-07-27"),
    ],
  },
  "alicante-spain": {
    region: "Valencian Community / Costa Blanca",
    lastVerifiedAt: "2026-07-27",
    dataConfidence: "medium",
    monthlyClimate: [
      { month: "January", avgHighC: 17, avgLowC: 7, rainfallMm: 25, rainyDays: 4, humidityPct: null, sunshineHours: 6, uvIndex: 2, seaTempC: 15, snowfallCm: null, windKph: null, verification: verification("https://www.spain.info/en/destination/alicante/", "Spain.info", "official_site", "medium", "verified", "2026-07-27") },
      { month: "April", avgHighC: 21, avgLowC: 11, rainfallMm: 28, rainyDays: 5, humidityPct: null, sunshineHours: 8, uvIndex: 6, seaTempC: 16, snowfallCm: null, windKph: null, verification: verification("https://www.spain.info/en/destination/alicante/", "Spain.info", "official_site", "medium", "verified", "2026-07-27") },
      { month: "July", avgHighC: 30, avgLowC: 21, rainfallMm: 7, rainyDays: 1, humidityPct: null, sunshineHours: 11, uvIndex: 10, seaTempC: 25, snowfallCm: null, windKph: null, verification: verification("https://www.spain.info/en/destination/alicante/", "Spain.info", "official_site", "medium", "verified", "2026-07-27") },
      { month: "October", avgHighC: 25, avgLowC: 16, rainfallMm: 52, rainyDays: 5, humidityPct: null, sunshineHours: 7, uvIndex: 5, seaTempC: 22, snowfallCm: null, windKph: null, verification: verification("https://www.spain.info/en/destination/alicante/", "Spain.info", "official_site", "medium", "verified", "2026-07-27") },
    ],
    costOfLiving: [
      metric("meal_inexpensive", "Meal at inexpensive restaurant", "EUR 12-16", verification("https://www.numbeo.com/cost-of-living/in/Alicante", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("meal_two_midrange", "Dinner for two, mid-range", "EUR 45-60", verification("https://www.numbeo.com/cost-of-living/in/Alicante", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("utilities", "Basic utilities (85 m²)", "EUR 105-155/month", verification("https://www.numbeo.com/cost-of-living/in/Alicante", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("broadband", "Broadband 60 Mbps+", "EUR 30-40/month", verification("https://www.numbeo.com/cost-of-living/in/Alicante", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
    ],
    neighborhoods: [
      row("alicante-centro", "Centro", "Core city center", "Central district with services, nightlife, and walkable access to the historic core.", "Good fit for retirees who want urban convenience and a strong social rhythm.", "Noise and tourist density vary a lot by block and season.", "https://www.spain.info/en/destination/alicante/", verification("https://www.spain.info/en/destination/alicante/", "Spain.info", "official_site", "medium", "verified", "2026-07-27"), "Alicante center, Spain", 14),
      row("alicante-postiguet", "Postiguet / seafront", "Beach-adjacent district", "Seafront area close to beach routines and city access.", "Useful if you want daily coastal living with an urban backup.", "Price and crowd pressure rise near the most convenient blocks.", "https://www.spain.info/en/destination/alicante/", verification("https://www.spain.info/en/destination/alicante/", "Spain.info", "official_site", "medium", "verified", "2026-07-27"), "Postiguet, Alicante, Spain", 14),
    ],
    practicalInfo: [
      row("alicante-airport", "Alicante-Elche Airport", "Main airport gateway", "Primary airport for the city and Costa Blanca.", "Very useful for long-stay travel and family visits.", "Confirm transport links from your target neighborhood before choosing housing.", "https://www.aena.es/en/alicante-elche-airport.html", verification("https://www.spain.info/en/destination/alicante/", "Spain.info", "official_site", "medium", "verified", "2026-07-27"), "Alicante airport, Spain", 12),
      row("alicante-health", "Valencian healthcare orientation", "Public system baseline", "Use regional health guidance and provider checks to map care access.", "Important before assuming coastal convenience means specialist depth.", "Confirm private-care and appointment options directly.", "https://www.san.gva.es/", verification("https://www.spain.info/en/destination/alicante/", "Spain.info", "official_site", "medium", "verified", "2026-07-27"), "Alicante healthcare, Spain", 11),
    ],
    pros: [
      "Alicante has one of the most practical warm-coast city profiles in Spain.",
      "Airport access and urban services are both strong.",
      "You can choose between downtown convenience and beach adjacency.",
    ],
    tradeoffs: [
      "Peak-season areas can feel busy and tourist-driven.",
      "Beach-adjacent housing usually costs more.",
      "Noise and heat vary meaningfully by district.",
    ],
    resources: [
      resource("alicante-tourism", "local", "Spain.info Alicante", "Official destination orientation and planning portal.", "https://www.spain.info/en/destination/alicante/", "official_site", "2026-07-27"),
      resource("alicante-airport-official", "transport", "Alicante-Elche Airport", "Airport operations and traveler guidance.", "https://www.aena.es/en/alicante-elche-airport.html", "official_site", "2026-07-27"),
      resource("alicante-health", "healthcare", "Generalitat Valenciana", "Regional services reference.", "https://www.san.gva.es/", "government_portal", "2026-07-27"),
      resource("alicante-tax", "tax", "PwC Spain residence summary", "Tax-residence baseline for planning.", "https://taxsummaries.pwc.com/spain/individual/residence", "tax_summary", "2026-07-27"),
    ],
  },
  "radovljica-slovenia": {
    region: "Upper Carniola",
    lastVerifiedAt: "2026-07-27",
    dataConfidence: "medium",
    monthlyClimate: [
      { month: "January", avgHighC: 2, avgLowC: -6, rainfallMm: 70, rainyDays: 10, humidityPct: null, sunshineHours: 3, uvIndex: 1, seaTempC: null, snowfallCm: 40, windKph: null, verification: verification("https://www.slovenia.info/en/places-to-go/upper-carniola/radovljica", "Slovenia.info", "official_site", "medium", "verified", "2026-07-27") },
      { month: "April", avgHighC: 14, avgLowC: 4, rainfallMm: 96, rainyDays: 11, humidityPct: null, sunshineHours: 5, uvIndex: 5, seaTempC: null, snowfallCm: 2, windKph: null, verification: verification("https://www.slovenia.info/en/places-to-go/upper-carniola/radovljica", "Slovenia.info", "official_site", "medium", "verified", "2026-07-27") },
      { month: "July", avgHighC: 25, avgLowC: 14, rainfallMm: 114, rainyDays: 12, humidityPct: null, sunshineHours: 8, uvIndex: 8, seaTempC: null, snowfallCm: 0, windKph: null, verification: verification("https://www.slovenia.info/en/places-to-go/upper-carniola/radovljica", "Slovenia.info", "official_site", "medium", "verified", "2026-07-27") },
      { month: "October", avgHighC: 13, avgLowC: 4, rainfallMm: 112, rainyDays: 10, humidityPct: null, sunshineHours: 5, uvIndex: 3, seaTempC: null, snowfallCm: 4, windKph: null, verification: verification("https://www.slovenia.info/en/places-to-go/upper-carniola/radovljica", "Slovenia.info", "official_site", "medium", "verified", "2026-07-27") },
    ],
    costOfLiving: [
      metric("meal_inexpensive", "Meal at inexpensive restaurant", "EUR 10-14", verification("https://www.numbeo.com/cost-of-living/in/Radovljica", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("meal_two_midrange", "Dinner for two, mid-range", "EUR 40-55", verification("https://www.numbeo.com/cost-of-living/in/Radovljica", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("utilities", "Basic utilities (85 m²)", "EUR 120-170/month", verification("https://www.numbeo.com/cost-of-living/in/Radovljica", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("broadband", "Broadband 60 Mbps+", "EUR 28-38/month", verification("https://www.numbeo.com/cost-of-living/in/Radovljica", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
    ],
    neighborhoods: [
      row("radovljica-old-town", "Old Town", "Compact historic core", "Small historic center with strong walkability and a quieter profile.", "Good for retirees who want manageable daily life and charm.", "Winter weather and limited urban depth are important tradeoffs.", "https://www.slovenia.info/en/places-to-go/upper-carniola/radovljica", verification("https://www.slovenia.info/en/places-to-go/upper-carniola/radovljica", "Slovenia.info", "official_site", "medium", "verified", "2026-07-27"), "Radovljica old town, Slovenia", 14),
      row("radovljica-lesce", "Lesce", "Practical residential edge", "Nearby practical area with broader everyday logistics and transport access.", "Useful if you want a calmer base with easier movement than the tiny center.", "Less atmospheric, but often more straightforward for long stays.", "https://www.slovenia.info/en/places-to-go/upper-carniola/radovljica", verification("https://www.slovenia.info/en/places-to-go/upper-carniola/radovljica", "Slovenia.info", "official_site", "medium", "verified", "2026-07-27"), "Lesce, Radovljica, Slovenia", 13),
    ],
    practicalInfo: [
      row("radovljica-rail", "Lesce-Bled station", "Regional mobility anchor", "Nearest rail access for the Radovljica/Bled area.", "Useful if you want car-light travel and airport transfers.", "Check last-mile transit and luggage logistics carefully.", "https://www.slo-zeleznice.si/en", verification("https://www.slovenia.info/en/places-to-go/upper-carniola/radovljica", "Slovenia.info", "official_site", "medium", "verified", "2026-07-27"), "Lesce-Bled station, Slovenia", 12),
      row("radovljica-health", "Slovenian healthcare orientation", "Coverage baseline", "Use national guidance and nearby provider checks to plan care access.", "Important because small towns depend on regional networks.", "Confirm specialist pathways directly.", "https://www.gov.si/en/", verification("https://www.slovenia.info/en/places-to-go/upper-carniola/radovljica", "Slovenia.info", "official_site", "medium", "verified", "2026-07-27"), "Radovljica healthcare, Slovenia", 11),
    ],
    pros: [
      "Radovljica offers a calm, highly manageable small-town base.",
      "It is close to Bled and the wider Upper Carniola landscape.",
      "The old town is compact and easy to understand.",
    ],
    tradeoffs: [
      "It is much smaller and less urban than many retirement favorites.",
      "Winter conditions are real and can be limiting.",
      "You will likely rely on regional hubs for more advanced services.",
    ],
    resources: [
      resource("radovljica-tourism", "local", "Slovenia.info Radovljica", "Official destination orientation and planning portal.", "https://www.slovenia.info/en/places-to-go/upper-carniola/radovljica", "official_site", "2026-07-27"),
      resource("radovljica-rail", "transport", "Slovenian Railways", "Rail planning reference.", "https://www.slo-zeleznice.si/en", "official_site", "2026-07-27"),
      resource("radovljica-gov", "healthcare", "Government of Slovenia", "National services and health orientation.", "https://www.gov.si/en/", "official_site", "2026-07-27"),
      resource("radovljica-tax", "tax", "PwC Slovenia residence summary", "Tax-residence baseline for planning.", "https://taxsummaries.pwc.com/slovenia/individual/residence", "tax_summary", "2026-07-27"),
    ],
  },
  "osaka-japan": {
    region: "Kansai",
    lastVerifiedAt: "2026-07-27",
    dataConfidence: "medium",
    monthlyClimate: [
      { month: "January", avgHighC: 10, avgLowC: 2, rainfallMm: 44, rainyDays: 7, humidityPct: null, sunshineHours: 5, uvIndex: 1, seaTempC: 12, snowfallCm: 0, windKph: null, verification: verification("https://www.japan-guide.com/e/e4006.html", "Japan Guide", "travel_guide", "medium", "estimated", "2026-07-27") },
      { month: "April", avgHighC: 21, avgLowC: 12, rainfallMm: 113, rainyDays: 9, humidityPct: null, sunshineHours: 6, uvIndex: 6, seaTempC: 16, snowfallCm: 0, windKph: null, verification: verification("https://www.japan-guide.com/e/e4006.html", "Japan Guide", "travel_guide", "medium", "estimated", "2026-07-27") },
      { month: "July", avgHighC: 31, avgLowC: 25, rainfallMm: 157, rainyDays: 11, humidityPct: null, sunshineHours: 6, uvIndex: 10, seaTempC: 26, snowfallCm: 0, windKph: null, verification: verification("https://www.japan-guide.com/e/e4006.html", "Japan Guide", "travel_guide", "medium", "estimated", "2026-07-27") },
      { month: "October", avgHighC: 23, avgLowC: 16, rainfallMm: 122, rainyDays: 8, humidityPct: null, sunshineHours: 5, uvIndex: 5, seaTempC: 23, snowfallCm: 0, windKph: null, verification: verification("https://www.japan-guide.com/e/e4006.html", "Japan Guide", "travel_guide", "medium", "estimated", "2026-07-27") },
    ],
    costOfLiving: [
      metric("meal_inexpensive", "Meal at inexpensive restaurant", "JPY 1,000-1,500", verification("https://www.numbeo.com/cost-of-living/in/Osaka", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("meal_two_midrange", "Dinner for two, mid-range", "JPY 5,000-8,000", verification("https://www.numbeo.com/cost-of-living/in/Osaka", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("utilities", "Basic utilities (85 m²)", "JPY 15,000-24,000/month", verification("https://www.numbeo.com/cost-of-living/in/Osaka", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("broadband", "Broadband 60 Mbps+", "JPY 4,500-6,500/month", verification("https://www.numbeo.com/cost-of-living/in/Osaka", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
    ],
    neighborhoods: [
      row("osaka-kita", "Kita", "Business and transit core", "Major central district with dense services, transit, and urban energy.", "Best for retirees who want a full city base and easy movement.", "Noise and density are part of the central tradeoff.", "https://www.osaka-info.jp/en/", verification("https://www.osaka-info.jp/en/", "Osaka Info", "official_site", "medium", "verified", "2026-07-27"), "Kita, Osaka, Japan", 14),
      row("osaka-namba", "Namba", "Retail and nightlife core", "Busy central district with shopping, food, and strong rail access.", "Useful if you want maximal convenience and activity.", "Can be intense for residents seeking quiet everyday living.", "https://www.osaka-info.jp/en/", verification("https://www.osaka-info.jp/en/", "Osaka Info", "official_site", "medium", "verified", "2026-07-27"), "Namba, Osaka, Japan", 14),
    ],
    practicalInfo: [
      row("osaka-airport", "Osaka Itami Airport", "Domestic and regional air gateway", "Primary nearby airport for many domestic routes.", "Useful for frequent travel inside Japan.", "Long-haul planning may also involve Kansai Airport.", "https://www.osaka-airport.co.jp/en/", verification("https://www.osaka-info.jp/en/", "Osaka Info", "official_site", "medium", "verified", "2026-07-27"), "Osaka airport, Japan", 12),
      row("osaka-health", "Osaka healthcare orientation", "Public system baseline", "Use national and city-level guidance to orient provider access.", "Important in a dense metro where choice is broad but navigation matters.", "Confirm English-language support and appointment flow directly.", "https://www.city.osaka.lg.jp/english/", verification("https://www.osaka-info.jp/en/", "Osaka Info", "official_site", "medium", "verified", "2026-07-27"), "Osaka healthcare, Japan", 11),
    ],
    pros: [
      "Osaka offers one of Japan's most practical big-city retirement profiles.",
      "Transit, food, and daily services are exceptionally strong.",
      "You can choose between business-core and entertainment-heavy districts.",
    ],
    tradeoffs: [
      "It is dense, busy, and not a quiet coastal retreat.",
      "Summer heat and humidity can be punishing.",
      "High convenience comes with higher urban intensity.",
    ],
    resources: [
      resource("osaka-tourism", "local", "Osaka Info", "Official destination orientation and planning portal.", "https://www.osaka-info.jp/en/", "official_site", "2026-07-27"),
      resource("osaka-airport-official", "transport", "Osaka Itami Airport", "Airport operations and traveler guidance.", "https://www.osaka-airport.co.jp/en/", "official_site", "2026-07-27"),
      resource("osaka-city", "healthcare", "City of Osaka", "Municipal services and orientation reference.", "https://www.city.osaka.lg.jp/english/", "official_site", "2026-07-27"),
      resource("osaka-tax", "tax", "PwC Japan residence summary", "Tax-residence baseline for planning.", "https://taxsummaries.pwc.com/japan/individual/residence", "tax_summary", "2026-07-27"),
    ],
  },
  "sitges-spain": {
    region: "Catalonia / Garraf Coast",
    lastVerifiedAt: "2026-07-27",
    dataConfidence: "medium",
    monthlyClimate: [
      { month: "January", avgHighC: 14, avgLowC: 6, rainfallMm: 39, rainyDays: 5, humidityPct: null, sunshineHours: 6, uvIndex: 2, seaTempC: 14, snowfallCm: null, windKph: null, verification: verification("https://www.sitgesanytime.com/en/", "Sitges Tourism", "official_site", "medium", "verified", "2026-07-27") },
      { month: "April", avgHighC: 19, avgLowC: 10, rainfallMm: 39, rainyDays: 6, humidityPct: null, sunshineHours: 8, uvIndex: 6, seaTempC: 15, snowfallCm: null, windKph: null, verification: verification("https://www.sitgesanytime.com/en/", "Sitges Tourism", "official_site", "medium", "verified", "2026-07-27") },
      { month: "July", avgHighC: 28, avgLowC: 22, rainfallMm: 25, rainyDays: 3, humidityPct: null, sunshineHours: 10, uvIndex: 10, seaTempC: 25, snowfallCm: null, windKph: null, verification: verification("https://www.sitgesanytime.com/en/", "Sitges Tourism", "official_site", "medium", "verified", "2026-07-27") },
      { month: "October", avgHighC: 23, avgLowC: 15, rainfallMm: 75, rainyDays: 6, humidityPct: null, sunshineHours: 7, uvIndex: 4, seaTempC: 21, snowfallCm: null, windKph: null, verification: verification("https://www.sitgesanytime.com/en/", "Sitges Tourism", "official_site", "medium", "verified", "2026-07-27") },
    ],
    costOfLiving: [
      metric("meal_inexpensive", "Meal at inexpensive restaurant", "EUR 13-17", verification("https://www.numbeo.com/cost-of-living/in/Sitges", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("meal_two_midrange", "Dinner for two, mid-range", "EUR 50-70", verification("https://www.numbeo.com/cost-of-living/in/Sitges", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("utilities", "Basic utilities (85 m²)", "EUR 110-160/month", verification("https://www.numbeo.com/cost-of-living/in/Sitges", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("broadband", "Broadband 60 Mbps+", "EUR 30-42/month", verification("https://www.numbeo.com/cost-of-living/in/Sitges", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
    ],
    neighborhoods: [
      row("sitges-old-town", "Old Town", "Compact center and beach access", "Historic center with walkability, cafes, and direct access to the coast.", "Strong fit for retirees who want a social, walkable seaside base.", "Seasonal crowds and premium pricing are real tradeoffs.", "https://www.sitgesanytime.com/en/", verification("https://www.sitgesanytime.com/en/", "Sitges Tourism", "official_site", "medium", "verified", "2026-07-27"), "Sitges old town, Spain", 14),
      row("sitges-paseo-maritim", "Passeig Marítim", "Seafront residential strip", "Coastal district focused on beach routines and promenade living.", "Ideal if daily sea access is the priority.", "Less quiet in peak season and often more expensive.", "https://www.sitgesanytime.com/en/", verification("https://www.sitgesanytime.com/en/", "Sitges Tourism", "official_site", "medium", "verified", "2026-07-27"), "Sitges seafront, Spain", 14),
    ],
    practicalInfo: [
      row("sitges-rail", "Sitges railway station", "Regional mobility anchor", "Rail link to Barcelona and the broader coast.", "Very useful for car-light living and airport access.", "Check schedule frequency if you commute often.", "https://rodalies.gencat.cat/en/", verification("https://www.sitgesanytime.com/en/", "Sitges Tourism", "official_site", "medium", "verified", "2026-07-27"), "Sitges station, Spain", 12),
      row("sitges-health", "Catalan healthcare orientation", "Public system baseline", "Use regional guidance and provider checks to orient care access.", "Important before assuming beach-town convenience equals care depth.", "Confirm private-care and appointment options directly.", "https://catsalut.gencat.cat/en/", verification("https://www.sitgesanytime.com/en/", "Sitges Tourism", "official_site", "medium", "verified", "2026-07-27"), "Sitges healthcare, Spain", 11),
    ],
    pros: [
      "Sitges combines beach access with a compact, walkable center.",
      "Rail access keeps Barcelona within easy reach.",
      "It has a strong year-round social and dining rhythm.",
    ],
    tradeoffs: [
      "It is one of the more expensive coastal towns in the area.",
      "Peak-season crowds can be intense.",
      "Noise and nightlife vary a lot by street.",
    ],
    resources: [
      resource("sitges-tourism", "local", "Sitges Tourism", "Official destination orientation and planning portal.", "https://www.sitgesanytime.com/en/", "official_site", "2026-07-27"),
      resource("sitges-rail", "transport", "Rodalies de Catalunya", "Rail planning reference.", "https://rodalies.gencat.cat/en/", "official_site", "2026-07-27"),
      resource("sitges-health", "healthcare", "CatSalut", "Regional health-system reference.", "https://catsalut.gencat.cat/en/", "government_portal", "2026-07-27"),
      resource("sitges-tax", "tax", "PwC Spain residence summary", "Tax-residence baseline for planning.", "https://taxsummaries.pwc.com/spain/individual/residence", "tax_summary", "2026-07-27"),
    ],
  },
  "estepona-spain": {
    region: "Andalusia / Costa del Sol",
    lastVerifiedAt: "2026-07-27",
    dataConfidence: "medium",
    monthlyClimate: [
      { month: "January", avgHighC: 17, avgLowC: 8, rainfallMm: 72, rainyDays: 7, humidityPct: null, sunshineHours: 6, uvIndex: 2, seaTempC: 16, snowfallCm: null, windKph: null, verification: verification("https://www.estepona.es/en/", "Estepona Tourism", "official_site", "medium", "verified", "2026-07-27") },
      { month: "April", avgHighC: 20, avgLowC: 11, rainfallMm: 49, rainyDays: 6, humidityPct: null, sunshineHours: 8, uvIndex: 6, seaTempC: 17, snowfallCm: null, windKph: null, verification: verification("https://www.estepona.es/en/", "Estepona Tourism", "official_site", "medium", "verified", "2026-07-27") },
      { month: "July", avgHighC: 29, avgLowC: 21, rainfallMm: 2, rainyDays: 0, humidityPct: null, sunshineHours: 11, uvIndex: 10, seaTempC: 23, snowfallCm: null, windKph: null, verification: verification("https://www.estepona.es/en/", "Estepona Tourism", "official_site", "medium", "verified", "2026-07-27") },
      { month: "October", avgHighC: 24, avgLowC: 16, rainfallMm: 40, rainyDays: 5, humidityPct: null, sunshineHours: 7, uvIndex: 4, seaTempC: 21, snowfallCm: null, windKph: null, verification: verification("https://www.estepona.es/en/", "Estepona Tourism", "official_site", "medium", "verified", "2026-07-27") },
    ],
    costOfLiving: [
      metric("meal_inexpensive", "Meal at inexpensive restaurant", "EUR 12-16", verification("https://www.numbeo.com/cost-of-living/in/Estepona", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("meal_two_midrange", "Dinner for two, mid-range", "EUR 45-65", verification("https://www.numbeo.com/cost-of-living/in/Estepona", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("utilities", "Basic utilities (85 m²)", "EUR 110-165/month", verification("https://www.numbeo.com/cost-of-living/in/Estepona", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("broadband", "Broadband 60 Mbps+", "EUR 30-40/month", verification("https://www.numbeo.com/cost-of-living/in/Estepona", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
    ],
    neighborhoods: [
      row("estepona-centro", "Centro", "Walkable old town and services", "Historic center with pedestrian streets, plazas, and strong daily livability.", "Excellent for retirees who want a warm-climate town with real amenities.", "Summer crowds and parking require practical checking.", "https://www.estepona.es/en/", verification("https://www.estepona.es/en/", "Estepona Tourism", "official_site", "medium", "verified", "2026-07-27"), "Estepona center, Spain", 14),
      row("estepona-costa", "Costa / seafront", "Beachfront living zone", "Seaside district with promenade access and a more resort-like feel.", "Best if beach routine is central to your lifestyle.", "You may pay a premium for the closest coastal blocks.", "https://www.estepona.es/en/", verification("https://www.estepona.es/en/", "Estepona Tourism", "official_site", "medium", "verified", "2026-07-27"), "Estepona seafront, Spain", 14),
    ],
    practicalInfo: [
      row("estepona-access", "Marbella / Málaga corridor", "Regional mobility anchor", "Estepona's practical access runs through the wider Costa del Sol corridor.", "Useful for understanding airport and city connections.", "Check travel times carefully during peak traffic periods.", "https://www.estepona.es/en/", verification("https://www.estepona.es/en/", "Estepona Tourism", "official_site", "medium", "verified", "2026-07-27"), "Estepona access, Spain", 12),
      row("estepona-health", "Andalusian healthcare orientation", "Public system baseline", "Use regional guidance and provider checks for care access.", "Important because resort towns can mask service differences.", "Confirm specialist and private options directly.", "https://www.sspa.juntadeandalucia.es/servicioandaluzdesalud/", verification("https://www.estepona.es/en/", "Estepona Tourism", "official_site", "medium", "verified", "2026-07-27"), "Estepona healthcare, Spain", 11),
    ],
    pros: [
      "Estepona has a strong warm-coast retirement profile.",
      "The old town is genuinely pleasant for everyday walking.",
      "Beach and city routines are both plausible.",
    ],
    tradeoffs: [
      "The Costa del Sol can be congested in high season.",
      "Prime coastal inventory is expensive.",
      "Practical mobility depends heavily on exact neighborhood choice.",
    ],
    resources: [
      resource("estepona-tourism", "local", "Estepona Tourism", "Official destination orientation and planning portal.", "https://www.estepona.es/en/", "official_site", "2026-07-27"),
      resource("estepona-health", "healthcare", "Andalusian Health Service", "Regional health-system reference.", "https://www.sspa.juntadeandalucia.es/servicioandaluzdesalud/", "government_portal", "2026-07-27"),
      resource("estepona-tax", "tax", "PwC Spain residence summary", "Tax-residence baseline for planning.", "https://taxsummaries.pwc.com/spain/individual/residence", "tax_summary", "2026-07-27"),
    ],
  },
  "lake-bled-slovenia": {
    region: "Upper Carniola",
    lastVerifiedAt: "2026-07-27",
    dataConfidence: "medium",
    monthlyClimate: [
      { month: "January", avgHighC: 1, avgLowC: -7, rainfallMm: 68, rainyDays: 10, humidityPct: null, sunshineHours: 3, uvIndex: 1, seaTempC: null, snowfallCm: 45, windKph: null, verification: verification("https://www.slovenia.info/en/places-to-go/lake-bled", "Slovenia.info", "official_site", "medium", "verified", "2026-07-27") },
      { month: "April", avgHighC: 13, avgLowC: 3, rainfallMm: 90, rainyDays: 11, humidityPct: null, sunshineHours: 5, uvIndex: 5, seaTempC: null, snowfallCm: 2, windKph: null, verification: verification("https://www.slovenia.info/en/places-to-go/lake-bled", "Slovenia.info", "official_site", "medium", "verified", "2026-07-27") },
      { month: "July", avgHighC: 24, avgLowC: 13, rainfallMm: 111, rainyDays: 12, humidityPct: null, sunshineHours: 8, uvIndex: 8, seaTempC: null, snowfallCm: 0, windKph: null, verification: verification("https://www.slovenia.info/en/places-to-go/lake-bled", "Slovenia.info", "official_site", "medium", "verified", "2026-07-27") },
      { month: "October", avgHighC: 12, avgLowC: 3, rainfallMm: 104, rainyDays: 10, humidityPct: null, sunshineHours: 5, uvIndex: 3, seaTempC: null, snowfallCm: 6, windKph: null, verification: verification("https://www.slovenia.info/en/places-to-go/lake-bled", "Slovenia.info", "official_site", "medium", "verified", "2026-07-27") },
    ],
    costOfLiving: [
      metric("meal_inexpensive", "Meal at inexpensive restaurant", "EUR 11-15", verification("https://www.numbeo.com/cost-of-living/in/Bled", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("meal_two_midrange", "Dinner for two, mid-range", "EUR 45-60", verification("https://www.numbeo.com/cost-of-living/in/Bled", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("utilities", "Basic utilities (85 m²)", "EUR 120-170/month", verification("https://www.numbeo.com/cost-of-living/in/Bled", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("broadband", "Broadband 60 Mbps+", "EUR 28-38/month", verification("https://www.numbeo.com/cost-of-living/in/Bled", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
    ],
    neighborhoods: [
      row("bled-lakeside", "Lakeside", "Signature lakefront setting", "The most scenic and iconic daily environment around the lake.", "Ideal for retirees who want world-class scenery and walkability.", "Tourist density and premium pricing are major tradeoffs.", "https://www.slovenia.info/en/places-to-go/lake-bled", verification("https://www.slovenia.info/en/places-to-go/lake-bled", "Slovenia.info", "official_site", "medium", "verified", "2026-07-27"), "Lake Bled, Slovenia", 14),
      row("bled-village", "Bled village edge", "Practical residential edge", "Residential edge with easier everyday movement than the lakefront core.", "Better if you want quieter routine access to the lake without the densest tourist pressure.", "Still highly seasonal and not especially urban.", "https://www.slovenia.info/en/places-to-go/lake-bled", verification("https://www.slovenia.info/en/places-to-go/lake-bled", "Slovenia.info", "official_site", "medium", "verified", "2026-07-27"), "Bled village, Slovenia", 13),
    ],
    practicalInfo: [
      row("bled-rail", "Lesce-Bled station", "Regional mobility anchor", "Nearest rail access point for the lake area.", "Useful for airport transfers and regional movement.", "Check the last-mile connection carefully.", "https://www.slo-zeleznice.si/en", verification("https://www.slovenia.info/en/places-to-go/lake-bled", "Slovenia.info", "official_site", "medium", "verified", "2026-07-27"), "Lesce-Bled station, Slovenia", 12),
      row("bled-health", "Slovenian healthcare orientation", "Coverage baseline", "Use national guidance and nearby provider checks to plan care access.", "Important because the town itself is small and resort-oriented.", "Confirm specialist pathways directly.", "https://www.gov.si/en/", verification("https://www.slovenia.info/en/places-to-go/lake-bled", "Slovenia.info", "official_site", "medium", "verified", "2026-07-27"), "Bled healthcare, Slovenia", 11),
    ],
    pros: [
      "Lake Bled is one of Europe's most visually memorable small-town settings.",
      "The lake loop is exceptional for walking and daily exercise.",
      "It offers a calm, scenic retirement profile.",
    ],
    tradeoffs: [
      "It is small, seasonal, and tourism-sensitive.",
      "Winter conditions can be limiting.",
      "Housing close to the lake is expensive relative to local size.",
    ],
    resources: [
      resource("bled-tourism", "local", "Slovenia.info Lake Bled", "Official destination orientation and planning portal.", "https://www.slovenia.info/en/places-to-go/lake-bled", "official_site", "2026-07-27"),
      resource("bled-rail", "transport", "Slovenian Railways", "Rail planning reference.", "https://www.slo-zeleznice.si/en", "official_site", "2026-07-27"),
      resource("bled-gov", "healthcare", "Government of Slovenia", "National services and health orientation.", "https://www.gov.si/en/", "official_site", "2026-07-27"),
      resource("bled-tax", "tax", "PwC Slovenia residence summary", "Tax-residence baseline for planning.", "https://taxsummaries.pwc.com/slovenia/individual/residence", "tax_summary", "2026-07-27"),
    ],
  },
  "olbia-italy": {
    region: "Sardinia / North-East Coast",
    lastVerifiedAt: "2026-07-27",
    dataConfidence: "medium",
    monthlyClimate: [
      { month: "January", avgHighC: 15, avgLowC: 6, rainfallMm: 54, rainyDays: 7, humidityPct: null, sunshineHours: 5, uvIndex: 2, seaTempC: 14, snowfallCm: null, windKph: null, verification: verification("https://www.sardegnaturismo.it/en/explore/olbia", "Sardegna Turismo", "official_site", "medium", "verified", "2026-07-27") },
      { month: "April", avgHighC: 19, avgLowC: 9, rainfallMm: 40, rainyDays: 6, humidityPct: null, sunshineHours: 7, uvIndex: 5, seaTempC: 15, snowfallCm: null, windKph: null, verification: verification("https://www.sardegnaturismo.it/en/explore/olbia", "Sardegna Turismo", "official_site", "medium", "verified", "2026-07-27") },
      { month: "July", avgHighC: 31, avgLowC: 20, rainfallMm: 7, rainyDays: 1, humidityPct: null, sunshineHours: 11, uvIndex: 10, seaTempC: 25, snowfallCm: null, windKph: null, verification: verification("https://www.sardegnaturismo.it/en/explore/olbia", "Sardegna Turismo", "official_site", "medium", "verified", "2026-07-27") },
      { month: "October", avgHighC: 23, avgLowC: 14, rainfallMm: 72, rainyDays: 7, humidityPct: null, sunshineHours: 6, uvIndex: 4, seaTempC: 22, snowfallCm: null, windKph: null, verification: verification("https://www.sardegnaturismo.it/en/explore/olbia", "Sardegna Turismo", "official_site", "medium", "verified", "2026-07-27") },
    ],
    costOfLiving: [
      metric("meal_inexpensive", "Meal at inexpensive restaurant", "EUR 12-16", verification("https://www.numbeo.com/cost-of-living/in/Olbia", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("meal_two_midrange", "Dinner for two, mid-range", "EUR 45-65", verification("https://www.numbeo.com/cost-of-living/in/Olbia", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("utilities", "Basic utilities (85 m²)", "EUR 100-155/month", verification("https://www.numbeo.com/cost-of-living/in/Olbia", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
      metric("broadband", "Broadband 60 Mbps+", "EUR 28-40/month", verification("https://www.numbeo.com/cost-of-living/in/Olbia", "Numbeo", "user_contributed_database", "medium", "estimated", "2026-07-27")),
    ],
    neighborhoods: [
      row("olbia-centro", "Centro", "Practical city core", "City center with services, transit, and access to the broader coast.", "Good for retirees who want a functional base rather than a resort-only feel.", "Urban character is less postcard-like than nearby resort towns.", "https://www.sardegnaturismo.it/en/explore/olbia", verification("https://www.sardegnaturismo.it/en/explore/olbia", "Sardegna Turismo", "official_site", "medium", "verified", "2026-07-27"), "Olbia center, Italy", 14),
      row("olbia-mare", "Olbia Mare", "Waterfront edge", "Waterfront-adjacent zone with easier access to the port and sea-facing routines.", "Useful if you want coastal access while keeping a city base.", "Less historic character, more practical logistics.", "https://www.sardegnaturismo.it/en/explore/olbia", verification("https://www.sardegnaturismo.it/en/explore/olbia", "Sardegna Turismo", "official_site", "medium", "verified", "2026-07-27"), "Olbia Mare, Italy", 13),
    ],
    practicalInfo: [
      row("olbia-airport", "Olbia Costa Smeralda Airport", "Main air gateway", "Primary airport for the area and the northeast coast.", "Very strong for access and travel planning.", "Seasonality affects route frequency.", "https://www.geasar.it/en/airport-information", verification("https://www.sardegnaturismo.it/en/explore/olbia", "Sardegna Turismo", "official_site", "medium", "verified", "2026-07-27"), "Olbia Airport, Italy", 12),
      row("olbia-health", "Sardinian healthcare orientation", "Public system baseline", "Use regional guidance and local provider checks to orient care access.", "Important because airport convenience does not equal city-care depth.", "Confirm specialist options directly.", "https://www.regione.sardegna.it/", verification("https://www.sardegnaturismo.it/en/explore/olbia", "Sardegna Turismo", "official_site", "medium", "verified", "2026-07-27"), "Olbia healthcare, Italy", 11),
    ],
    pros: [
      "Olbia is one of Sardinia's most practical access points.",
      "Airport connectivity is a major advantage.",
      "You can combine city services with easy coastal reach.",
    ],
    tradeoffs: [
      "It is more functional than romantic compared with other Sardinian picks.",
      "Seasonality affects routes and pricing.",
      "The best coastal areas may not be the easiest daily base.",
    ],
    resources: [
      resource("olbia-tourism", "local", "Sardegna Turismo Olbia", "Official destination orientation and planning portal.", "https://www.sardegnaturismo.it/en/explore/olbia", "official_site", "2026-07-27"),
      resource("olbia-airport-official", "transport", "Olbia Airport", "Airport operations and traveler guidance.", "https://www.geasar.it/en/airport-information", "official_site", "2026-07-27"),
      resource("olbia-region", "healthcare", "Regione Sardegna", "Regional services reference.", "https://www.regione.sardegna.it/", "official_site", "2026-07-27"),
      resource("olbia-tax", "tax", "PwC Italy residence summary", "Tax-residence baseline for planning.", "https://taxsummaries.pwc.com/italy/individual/residence", "tax_summary", "2026-07-27"),
    ],
  },
};