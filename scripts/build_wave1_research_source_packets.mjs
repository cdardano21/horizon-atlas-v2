import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const wave1Path = path.join(repoRoot, "docs/destination-expansion-wave1-batches.json");
const outputPath = path.join(repoRoot, "docs/destination-expansion-wave1-research-source-packets.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function encodeQuery(value) {
  return encodeURIComponent(value);
}

function countryGroup(country) {
  if (country === "United States") return "US";
  if (country === "United Kingdom") return "UK";
  if (country === "Ireland") return "IE";
  return "OTHER";
}

function monthlyClimateSources(city, country) {
  const query = encodeQuery(`${city} ${country} climate`);
  const group = countryGroup(country);

  const shared = [
    {
      sourceName: "Weather2Travel Climate Guide",
      sourceType: "climate_guide",
      url: `https://www.weather2travel.com/`,
      notes: "Use only as secondary climate guide; cross-check month-level values.",
    },
  ];

  if (group === "US") {
    return [
      {
        sourceName: "NOAA Climate Normals",
        sourceType: "government_portal",
        url: "https://www.ncei.noaa.gov/products/land-based-station/us-climate-normals",
        notes: "Primary source for monthly averages where station coverage is available.",
      },
      {
        sourceName: "NWS Climate Data",
        sourceType: "government_portal",
        url: `https://www.weather.gov/search?query=${query}`,
        notes: "Supplement NOAA normals for city-specific station context.",
      },
      ...shared,
    ];
  }

  if (group === "UK") {
    return [
      {
        sourceName: "Met Office Climate",
        sourceType: "government_portal",
        url: `https://www.metoffice.gov.uk/search?query=${query}`,
        notes: "Primary source for UK monthly climate context.",
      },
      ...shared,
    ];
  }

  if (group === "IE") {
    return [
      {
        sourceName: "Met Eireann Climate",
        sourceType: "government_portal",
        url: `https://www.met.ie/search?q=${query}`,
        notes: "Primary source for Ireland monthly climate context.",
      },
      ...shared,
    ];
  }

  return shared;
}

function costHousingSources(city, country) {
  const citySlug = encodeURIComponent(city);
  const countrySlug = encodeURIComponent(country);
  return [
    {
      sourceName: "Numbeo Cost of Living",
      sourceType: "user_contributed_database",
      url: `https://www.numbeo.com/cost-of-living/in/${citySlug}`,
      notes: "Capture displayed local-currency values and preserve display text.",
    },
    {
      sourceName: "Numbeo Property Prices",
      sourceType: "user_contributed_database",
      url: `https://www.numbeo.com/property-investment/in/${citySlug}`,
      notes: "Use for rent and buy-per-square-meter metrics.",
    },
    {
      sourceName: "National Statistics Search",
      sourceType: "government_portal",
      url: `https://www.google.com/search?q=${encodeQuery(`${city} ${country} official statistics housing costs`)}`,
      notes: "Prefer official statistical agencies when available; record source org exactly.",
    },
  ];
}

function healthcareSources(city, country) {
  return [
    {
      sourceName: "Official Health Ministry / NHS Search",
      sourceType: "government_portal",
      url: `https://www.google.com/search?q=${encodeQuery(`${city} ${country} official hospital directory`)}`,
      notes: "Prioritize official hospital or ministry portals over directories.",
    },
    {
      sourceName: "Municipal Health Services",
      sourceType: "official_site",
      url: `https://www.google.com/search?q=${encodeQuery(`${city} ${country} municipal health center official`)}`,
      notes: "Capture at least one primary-care and one hospital option when possible.",
    },
  ];
}

function airportSources(city, country) {
  return [
    {
      sourceName: "IATA Airport Search",
      sourceType: "transport_authority",
      url: `https://www.iata.org/en/publications/directories/code-search/`,
      notes: "Use for airport code verification.",
    },
    {
      sourceName: "Official Airport Site Search",
      sourceType: "official_site",
      url: `https://www.google.com/search?q=${encodeQuery(`${city} ${country} airport official site`)}`,
      notes: "Prefer operator websites for route and facility summaries.",
    },
  ];
}

function visaTaxSources(city, country) {
  return {
    visaPrograms: [
      {
        sourceName: "National Immigration Portal",
        sourceType: "government_portal",
        url: `https://www.google.com/search?q=${encodeQuery(`${country} official immigration residence permit`)}`,
        notes: "Use country-level official portals for residence and stay requirements.",
      },
      {
        sourceName: "US State Dept Country Info",
        sourceType: "government_portal",
        url: "https://travel.state.gov/content/travel/en/international-travel.html",
        notes: "Secondary context source; do not replace country official requirements.",
      },
    ],
    taxRules: [
      {
        sourceName: "PwC Tax Summaries",
        sourceType: "tax_summary",
        url: `https://taxsummaries.pwc.com/`,
        notes: "Good baseline; verify with country tax authority for high-confidence entries.",
      },
      {
        sourceName: "National Tax Authority",
        sourceType: "government_portal",
        url: `https://www.google.com/search?q=${encodeQuery(`${country} official tax authority individual tax residency`)}`,
        notes: "Primary source for residency and filing obligations.",
      },
    ],
  };
}

function practicalInfoSources(city, country) {
  return [
    {
      sourceName: "Official Tourism Board",
      sourceType: "official_site",
      url: `https://www.google.com/search?q=${encodeQuery(`${city} ${country} official tourism`)}`,
      notes: "Use for orientation, visitor resources, and practical local links.",
    },
    {
      sourceName: "Municipal Government Portal",
      sourceType: "government_portal",
      url: `https://www.google.com/search?q=${encodeQuery(`${city} ${country} official city government`)}`,
      notes: "Use for administrative and civic practical resources.",
    },
  ];
}

function buildPacket(destination) {
  const city = destination.city;
  const country = destination.country;
  const visaTax = visaTaxSources(city, country);

  return {
    slug: destination.slug,
    city,
    country,
    additionGroup: destination.additionGroup,
    tierTarget: "TIER_1",
    categories: {
      monthlyClimate: {
        targetInputFile: "docs/destination-expansion-wave1-monthly-climate-input.json",
        requiredMinRecords: 12,
        sources: monthlyClimateSources(city, country),
      },
      costOfLiving: {
        targetInputFile: "docs/destination-expansion-wave1-cost-housing-input.json",
        requiredMinRecords: 1,
        sources: costHousingSources(city, country),
      },
      housingMetrics: {
        targetInputFile: "docs/destination-expansion-wave1-cost-housing-input.json",
        requiredMinRecords: 1,
        sources: costHousingSources(city, country),
      },
      healthcareFacilities: {
        targetInputFile: "docs/destination-expansion-wave1-health-airports-input.json",
        requiredMinRecords: 1,
        sources: healthcareSources(city, country),
      },
      airports: {
        targetInputFile: "docs/destination-expansion-wave1-health-airports-input.json",
        requiredMinRecords: 1,
        sources: airportSources(city, country),
      },
      visaPrograms: {
        targetInputFile: "docs/destination-expansion-wave1-visa-tax-input.json",
        requiredMinRecords: 1,
        sources: visaTax.visaPrograms,
      },
      taxRules: {
        targetInputFile: "docs/destination-expansion-wave1-visa-tax-input.json",
        requiredMinRecords: 1,
        sources: visaTax.taxRules,
      },
      practicalInfo: {
        targetInputFile: "docs/destination-expansion-wave1-practical-info-input.json",
        requiredMinRecords: 1,
        sources: practicalInfoSources(city, country),
      },
    },
  };
}

function main() {
  const wave1 = readJson(wave1Path);
  const climateBatch = Array.isArray(wave1.batchesByCategory)
    ? wave1.batchesByCategory.find((item) => item.category === "monthlyClimate")
    : null;

  const destinations = Array.isArray(climateBatch?.destinations) ? climateBatch.destinations : [];

  const packets = destinations.map(buildPacket);

  const output = {
    generatedAt: new Date().toISOString(),
    wave: "TIER_1",
    destinationCount: packets.length,
    notes: [
      "This file provides sourcing targets only and does not include inferred metrics.",
      "All values entered into category input files must come from verifiable sources.",
    ],
    packets,
  };

  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`Wrote Wave 1 research source packets: ${path.relative(repoRoot, outputPath)}`);
}

main();
