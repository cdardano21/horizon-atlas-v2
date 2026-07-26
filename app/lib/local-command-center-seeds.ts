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
};