import type { LocalCommandCenterSeed } from "./local-command-center-seeds";
import type { NamedRecord, ResourceRecord, VerificationMeta } from "./destination-command-center";

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

const row = (
  id: string,
  name: string,
  subtitle: string,
  value1: string,
  value2: string,
  value3: string,
  url: string,
  details: VerificationMeta,
): NamedRecord => ({
  id,
  name,
  subtitle,
  value1,
  value2,
  value3,
  url,
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

const kotorHospitalVerification = verification(
  "https://www.generalhospitalkotor.me/",
  "General Hospital Kotor",
  "official_site",
  "medium",
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

const portoVerification = verification(
  "https://www.portomontenegro.com/marina/",
  "Porto Montenegro",
  "official_site",
  "high",
  "verified",
  "2026-07-24",
);

const mupVerification = verification(
  "https://mup.gov.me/en/ministry/Directorates_and_other_internal_organisational_units/administrative_affairs_citizenship_and_foreigners/status_issues/",
  "Montenegro Ministry of Interior",
  "government_portal",
  "medium",
  "verified",
  "2026-07-24",
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

const greeceResidenceVerification = verification(
  "https://taxsummaries.pwc.com/greece/individual/residence",
  "PwC Worldwide Tax Summaries",
  "tax_summary",
  "high",
  "verified",
  "2026-02-16",
);

const greeceOtherTaxesVerification = verification(
  "https://taxsummaries.pwc.com/greece/individual/other-taxes",
  "PwC Worldwide Tax Summaries",
  "tax_summary",
  "high",
  "verified",
  "2026-02-16",
);

const greeceMigrationVerification = verification(
  "https://migration.gov.gr/en/",
  "Hellenic Republic Ministry of Migration and Asylum",
  "government_portal",
  "high",
  "verified",
  "2026-07-24",
);

const greeceImmigrationPortalVerification = verification(
  "https://immigration-portal.ec.europa.eu/greece_en",
  "European Union Immigration Portal",
  "government_portal",
  "high",
  "verified",
  "2026-07-24",
);

const greeceAirportsVerification = verification(
  "https://www.fraport-greece.com/english/our-airports/",
  "Fraport Greece",
  "official_site",
  "high",
  "verified",
  "2026-07-24",
);

const athensAirportVerification = verification(
  "https://www.aia.gr/traveler/",
  "Athens International Airport",
  "official_site",
  "high",
  "verified",
  "2026-07-24",
);

const greeceHealthcareVerification = verification(
  "https://www.eopyy.gov.gr/",
  "EOPYY (National Organization for the Provision of Health Services)",
  "government_portal",
  "medium",
  "verified",
  "2026-07-24",
);

const greeceEmergencyVerification = verification(
  "https://www.gov.gr/en/sdg/travel-and-leisure/travel-outside-greece/emergency-numbers-and-services",
  "gov.gr",
  "government_portal",
  "high",
  "verified",
  "2026-07-24",
);

const croatiaResidenceVerification = verification(
  "https://taxsummaries.pwc.com/croatia/individual/residence",
  "PwC Worldwide Tax Summaries",
  "tax_summary",
  "high",
  "verified",
  "2025-12-30",
);

const croatiaOtherTaxesVerification = verification(
  "https://taxsummaries.pwc.com/croatia/individual/other-taxes",
  "PwC Worldwide Tax Summaries",
  "tax_summary",
  "high",
  "verified",
  "2025-12-30",
);

const croatiaAliensVerification = verification(
  "https://mup.gov.hr/aliens-281621/281621",
  "Ministry of the Interior of the Republic of Croatia",
  "government_portal",
  "high",
  "verified",
  "2026-07-24",
);

const croatiaStayWorkVerification = verification(
  "https://mup.gov.hr/aliens-281621/stay-and-work/281622",
  "Ministry of the Interior of the Republic of Croatia",
  "government_portal",
  "medium",
  "estimated",
  "2026-07-24",
);

const croatiaHealthcareVerification = verification(
  "https://hzzo.hr/en/",
  "Croatian Health Insurance Fund (HZZO)",
  "government_portal",
  "high",
  "verified",
  "2026-07-24",
);

const croatiaEmergencyVerification = verification(
  "https://vlada.gov.hr/need-emergency-help/16125",
  "Government of the Republic of Croatia",
  "government_portal",
  "high",
  "verified",
  "2026-07-24",
);

const zagrebAirportVerification = verification(
  "https://www.zag.aero/en/passengers",
  "Zagreb Airport",
  "official_site",
  "high",
  "verified",
  "2026-07-24",
);

const splitAirportVerification = verification(
  "https://www.split-airport.hr/index.php?lang=en",
  "Split Airport",
  "official_site",
  "high",
  "verified",
  "2026-07-24",
);

const japanResidenceVerification = verification(
  "https://taxsummaries.pwc.com/japan/individual/residence",
  "PwC Worldwide Tax Summaries",
  "tax_summary",
  "high",
  "verified",
  "2026-07-21",
);

const japanOtherTaxesVerification = verification(
  "https://taxsummaries.pwc.com/japan/individual/other-taxes",
  "PwC Worldwide Tax Summaries",
  "tax_summary",
  "high",
  "verified",
  "2026-07-21",
);

const japanImmigrationVerification = verification(
  "https://www.moj.go.jp/isa/?hl=en",
  "Immigration Services Agency of Japan",
  "government_portal",
  "high",
  "verified",
  "2026-07-24",
);

const japanSupportPortalVerification = verification(
  "https://www.moj.go.jp/isa/support/portal/index.html",
  "Immigration Services Agency of Japan",
  "government_portal",
  "high",
  "verified",
  "2026-07-24",
);

const japanVisaVerification = verification(
  "https://www.mofa.go.jp/j_info/visit/visa/index.html",
  "Ministry of Foreign Affairs of Japan",
  "government_portal",
  "high",
  "verified",
  "2026-06-24",
);

const japanHanedaVerification = verification(
  "https://tokyo-haneda.com/en/",
  "Haneda Airport Passenger Terminal",
  "official_site",
  "high",
  "verified",
  "2026-07-24",
);

const japanNaritaVerification = verification(
  "https://www.narita-airport.jp/en/",
  "Narita International Airport Corporation",
  "official_site",
  "high",
  "verified",
  "2026-07-24",
);

const japanKixVerification = verification(
  "https://www.kansai-airport.or.jp/en/",
  "Kansai Airports",
  "official_site",
  "high",
  "verified",
  "2026-07-24",
);


const italyResidenceVerification = verification(
  "https://taxsummaries.pwc.com/italy/individual/residence",
  "PwC Worldwide Tax Summaries",
  "tax_summary",
  "high",
  "verified",
  "2026-07-23",
);

const italyOtherTaxesVerification = verification(
  "https://taxsummaries.pwc.com/italy/individual/other-taxes",
  "PwC Worldwide Tax Summaries",
  "tax_summary",
  "high",
  "verified",
  "2026-07-23",
);

const italyVisaVerification = verification(
  "https://vistoperitalia.esteri.it/home/en",
  "Italian Ministry of Foreign Affairs visa platform",
  "government_portal",
  "medium",
  "estimated",
  "2026-07-24",
);

const italyImmigrationVerification = verification(
  "https://www.interno.gov.it/en/special-content/immigration",
  "Italian Ministry of the Interior",
  "government_portal",
  "medium",
  "estimated",
  "2026-07-24",
);

const italyAviationVerification = verification(
  "https://www.enac.gov.it/en/passengers",
  "ENAC (Italian Civil Aviation Authority)",
  "government_portal",
  "high",
  "verified",
  "2026-07-24",
);

const italyMalpensaVerification = verification(
  "https://www.milanomalpensa-airport.com/en",
  "Milan Malpensa Airport",
  "official_site",
  "high",
  "verified",
  "2026-07-24",
);


const portugalResidenceVerification = verification(
  "https://taxsummaries.pwc.com/portugal/individual/residence",
  "PwC Worldwide Tax Summaries",
  "tax_summary",
  "high",
  "verified",
  "2026-01-05",
);

const portugalOtherTaxesVerification = verification(
  "https://taxsummaries.pwc.com/portugal/individual/other-taxes",
  "PwC Worldwide Tax Summaries",
  "tax_summary",
  "high",
  "verified",
  "2026-01-05",
);

const portugalAimaVerification = verification(
  "https://aima.gov.pt/en",
  "AIMA (Portugal Agency for Integration, Migration and Asylum)",
  "government_portal",
  "high",
  "verified",
  "2026-07-24",
);

const portugalGovResidenceVerification = verification(
  "https://www2.gov.pt/en/cidadaos-europeus-viajar-viver-e-fazer-negocios-em-portugal/viver-em-portugal/residir-em-portugal",
  "gov.pt",
  "government_portal",
  "high",
  "verified",
  "2026-07-24",
);

const portugalAnaVerification = verification(
  "https://www.ana.pt/en",
  "ANA Aeroportos de Portugal",
  "official_site",
  "high",
  "verified",
  "2026-07-24",
);

const portugalSnsVerification = verification(
  "https://www.sns24.gov.pt/en/",
  "SNS 24 / Portuguese National Health Service",
  "government_portal",
  "high",
  "verified",
  "2026-07-24",
);

const spainResidenceVerification = verification(
  "https://taxsummaries.pwc.com/spain/individual/residence",
  "PwC Worldwide Tax Summaries",
  "tax_summary",
  "high",
  "verified",
  "2025-12-31",
);

const spainOtherTaxesVerification = verification(
  "https://taxsummaries.pwc.com/spain/individual/other-taxes",
  "PwC Worldwide Tax Summaries",
  "tax_summary",
  "high",
  "verified",
  "2025-12-31",
);

const spainImmigrationVerification = verification(
  "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/",
  "Spanish Ministry of the Interior",
  "government_portal",
  "high",
  "verified",
  "2026-07-24",
);

const spainAenaVerification = verification(
  "https://www.aena.es/en/home.html",
  "Aena",
  "official_site",
  "medium",
  "estimated",
  "2026-07-24",
);

const spainHealthVerification = verification(
  "https://www.sanidad.gob.es/en/home.htm",
  "Spanish Ministry of Health",
  "government_portal",
  "high",
  "verified",
  "2026-07-24",
);

const spainCivilProtectionVerification = verification(
  "https://www.proteccioncivil.es/",
  "Spanish Civil Protection",
  "government_portal",
  "medium",
  "estimated",
  "2026-07-24",
);

const franceResidenceVerification = verification(
  "https://taxsummaries.pwc.com/france/individual/residence",
  "PwC Worldwide Tax Summaries",
  "tax_summary",
  "high",
  "verified",
  "2026-04-24",
);

const franceOtherTaxesVerification = verification(
  "https://taxsummaries.pwc.com/france/individual/other-taxes",
  "PwC Worldwide Tax Summaries",
  "tax_summary",
  "high",
  "verified",
  "2026-04-24",
);

const franceVisasVerification = verification(
  "https://france-visas.gouv.fr/en/",
  "France-Visas (French government visa portal)",
  "government_portal",
  "high",
  "verified",
  "2026-07-24",
);

const franceResidencePermitsVerification = verification(
  "https://www.service-public.gouv.fr/particuliers/vosdroits/N110",
  "Service-Public.fr",
  "government_portal",
  "high",
  "verified",
  "2026-07-24",
);

const franceAviationVerification = verification(
  "https://www.aviation-civile.gouv.fr/",
  "French Civil Aviation portal",
  "government_portal",
  "medium",
  "estimated",
  "2026-07-24",
);

const franceHealthVerification = verification(
  "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811",
  "Service-Public.fr",
  "government_portal",
  "high",
  "verified",
  "2026-07-24",
);

const franceCivilSecurityVerification = verification(
  "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile",
  "French Ministry of the Interior",
  "government_portal",
  "high",
  "verified",
  "2026-07-24",
);

const switzerlandResidenceVerification = verification(
  "https://taxsummaries.pwc.com/switzerland/individual/residence",
  "PwC Worldwide Tax Summaries",
  "tax_summary",
  "high",
  "verified",
  "2026-07-01",
);

const switzerlandOtherTaxesVerification = verification(
  "https://taxsummaries.pwc.com/switzerland/individual/other-taxes",
  "PwC Worldwide Tax Summaries",
  "tax_summary",
  "high",
  "verified",
  "2026-07-01",
);

const switzerlandSemEntryVerification = verification(
  "https://www.sem.admin.ch/sem/en/home/themen/einreise.html",
  "State Secretariat for Migration (SEM)",
  "government_portal",
  "high",
  "verified",
  "2026-07-24",
);

const switzerlandSemLongStayVerification = verification(
  "https://www.sem.admin.ch/sem/en/home/themen/aufenthalt.html",
  "State Secretariat for Migration (SEM)",
  "government_portal",
  "medium",
  "estimated",
  "2026-07-24",
);

const switzerlandZurichAirportVerification = verification(
  "https://www.flughafen-zuerich.ch/en/passengers",
  "Zurich Airport Ltd.",
  "official_site",
  "high",
  "verified",
  "2026-07-24",
);

const switzerlandHealthVerification = verification(
  "https://www.ch.ch/en/health/health-insurance",
  "ch.ch (Swiss authorities portal)",
  "government_portal",
  "high",
  "verified",
  "2026-07-24",
);

const switzerlandPremiumsVerification = verification(
  "https://www.priminfo.admin.ch/",
  "Federal Office of Public Health (BAG)",
  "government_portal",
  "high",
  "verified",
  "2026-07-24",
);

const sloveniaResidenceVerification = verification(
  "https://taxsummaries.pwc.com/slovenia/individual/residence",
  "PwC Worldwide Tax Summaries",
  "tax_summary",
  "high",
  "verified",
  "2026-07-15",
);

const sloveniaOtherTaxesVerification = verification(
  "https://taxsummaries.pwc.com/slovenia/individual/other-taxes",
  "PwC Worldwide Tax Summaries",
  "tax_summary",
  "high",
  "verified",
  "2026-07-15",
);

const sloveniaImmigrationVerification = verification(
  "https://www.gov.si/en/policies/state-and-society/immigration-to-slovenia/",
  "gov.si (Republic of Slovenia)",
  "government_portal",
  "high",
  "verified",
  "2026-07-24",
);

const sloveniaAirportVerification = verification(
  "https://www.lju-airport.si/en/",
  "Ljubljana Airport",
  "official_site",
  "medium",
  "estimated",
  "2026-07-24",
);

const sloveniaHealthcareVerification = verification(
  "https://nijz.si/en",
  "National Institute of Public Health (NIJZ)",
  "government_portal",
  "high",
  "verified",
  "2026-07-24",
);

const sloveniaEmergencyVerification = verification(
  "https://www.gov.si/en/policies/defence-civil-protection-and-public-order/protection-against-natural-and-other-disasters/",
  "gov.si (Republic of Slovenia)",
  "government_portal",
  "high",
  "verified",
  "2026-07-24",
);


const austriaResidenceVerification = verification(
  "https://www.bmi.gv.at/312_en/start.html",
  "Austrian Federal Ministry of the Interior",
  "government_portal",
  "high",
  "verified",
  "2026-07-24",
);

const austriaOtherTaxesVerification = verification(
  "https://taxsummaries.pwc.com/austria/individual/other-taxes",
  "PwC Worldwide Tax Summaries",
  "tax_summary",
  "high",
  "verified",
  "2026-07-23",
);

const austriaTaxResidenceVerification = verification(
  "https://taxsummaries.pwc.com/austria/individual/residence",
  "PwC Worldwide Tax Summaries",
  "tax_summary",
  "high",
  "verified",
  "2026-07-23",
);

const austriaAirportVerification = verification(
  "https://viennaairport.com/en/passengers",
  "Vienna Airport",
  "official_site",
  "medium",
  "estimated",
  "2026-07-24",
);

const austriaHealthcareVerification = verification(
  "https://www.sozialministerium.gv.at/en/Topics/Health.html",
  "Federal Ministry - Labour, Social Affairs, Health, Care and Consumer Protection",
  "government_portal",
  "high",
  "verified",
  "2026-07-24",
);

const austriaEmergencyVerification = verification(
  "https://www.oesterreich.gv.at/en/themen/notfaelle_unfaelle_und_kriminalitaet/notrufnummern",
  "oesterreich.gv.at",
  "government_portal",
  "high",
  "verified",
  "2026-07-24",
);

const montenegroVisaRows = [
  row(
    "montenegro-foreigners-portal",
    "Foreigners status issues portal",
    "Official Ministry of Interior entry point",
    "Official starting point for foreigners' status issues and residence-process verification.",
    "Use for temporary residence and legal-status checks before relying on summaries.",
    "Country-level rule set applies across Montenegro destinations.",
    "https://mup.gov.me/en/ministry/Directorates_and_other_internal_organisational_units/administrative_affairs_citizenship_and_foreigners/status_issues/",
    mupVerification,
  ),
];

const montenegroTaxRows = [
  row(
    "montenegro-tax-residence",
    "Montenegro tax residence",
    "PwC residence summary",
    "Tax residence can be triggered by domicile / centre of personal and economic interests.",
    "Also triggered by spending at least 183 days in a tax year in Montenegro.",
    "Double-tax-treaty tie-break rules may apply.",
    "https://taxsummaries.pwc.com/montenegro/individual/residence",
    pwcResidenceVerification,
  ),
  row(
    "montenegro-vat",
    "Montenegro VAT and salary contributions",
    "PwC other taxes summary",
    "General VAT rate: 21%.",
    "Employee pension and disability insurance: 10%.",
    "Unemployment insurance: 0.5% employee and 0.5% employer.",
    "https://taxsummaries.pwc.com/montenegro/individual/other-taxes",
    pwcOtherTaxesVerification,
  ),
];

const montenegroCommonResources = [
  resource(
    "montenegro-foreigners-resource",
    "visa",
    "Montenegro Ministry of Interior foreigners portal",
    "Official country-level starting point for foreigners' status issues and residence-process verification.",
    "https://mup.gov.me/en/ministry/Directorates_and_other_internal_organisational_units/administrative_affairs_citizenship_and_foreigners/status_issues/",
    "government_portal",
    "2026-07-24",
  ),
  resource(
    "montenegro-tax-residence-resource",
    "tax",
    "PwC Montenegro residence summary",
    "183-day and centre-of-interests tax residence rules.",
    "https://taxsummaries.pwc.com/montenegro/individual/residence",
    "tax_summary",
    "2026-03-27",
  ),
  resource(
    "montenegro-other-taxes-resource",
    "tax",
    "PwC Montenegro other taxes",
    "VAT and salary social-contribution summary.",
    "https://taxsummaries.pwc.com/montenegro/individual/other-taxes",
    "tax_summary",
    "2026-03-27",
  ),
];

const greeceVisaRows = [
  row(
    "greece-migration-ministry",
    "Greek residence permits and migration policy portal",
    "Ministry of Migration and Asylum",
    "Official policy and process landing page for residence permits in Greece.",
    "Use official ministry routes to confirm eligibility, documents, and permit category before filing.",
    "Country-level framework applies to all Greek destinations in the catalog.",
    "https://migration.gov.gr/en/",
    greeceMigrationVerification,
  ),
  row(
    "greece-eu-immigration-portal",
    "EU Immigration Portal for Greece",
    "Country entry requirements by purpose of stay",
    "Covers long-stay pathways and links to national authorities.",
    "Useful secondary source for retirees comparing permit routes.",
    "Always confirm final requirements with Greek official agencies.",
    "https://immigration-portal.ec.europa.eu/greece_en",
    greeceImmigrationPortalVerification,
  ),
];

const greeceTaxRows = [
  row(
    "greece-tax-residence",
    "Greece tax residence",
    "PwC residence summary",
    "Tax residence can arise from center-of-vital-interests criteria.",
    "Physical presence for more than 183 days in a tax year is a core threshold.",
    "Treaty tie-break rules may apply when dual residence issues occur.",
    "https://taxsummaries.pwc.com/greece/individual/residence",
    greeceResidenceVerification,
  ),
  row(
    "greece-vat-property-social",
    "Greece VAT, property, and social taxes",
    "PwC other taxes summary",
    "Standard VAT rate: 24%; reduced rates include 13% and 6%.",
    "Transfer tax and annual ENFIA property-tax rules can affect buyers.",
    "Employee and employer social-contribution obligations apply to wage income.",
    "https://taxsummaries.pwc.com/greece/individual/other-taxes",
    greeceOtherTaxesVerification,
  ),
];

const greeceAirportRows = [
  row(
    "greece-fraport-14-regional-airports",
    "Fraport Greece regional airport network",
    "14 managed regional airports",
    "Corfu, Chania, Rhodes, Thessaloniki catchments connect through managed regional gateways.",
    "Official operator source for airport network reference and traveler services.",
    "Use airport-specific pages for seasonal route confirmation.",
    "https://www.fraport-greece.com/english/our-airports/",
    greeceAirportsVerification,
  ),
  row(
    "greece-athens-international-airport",
    "Athens International Airport (ATH)",
    "Primary national intercontinental gateway",
    "Key long-haul and Schengen transfer node for Greek retiree travel logistics.",
    "Official airport traveler portal provides operational passenger information.",
    "Relevant backup routing node even for non-Athens destinations.",
    "https://www.aia.gr/traveler/",
    athensAirportVerification,
  ),
];

const greeceHealthcareRows = [
  row(
    "greece-eopyy",
    "EOPYY national health-services payer",
    "Country-level health coverage administration",
    "EOPYY is the central organization coordinating reimbursed healthcare services in Greece.",
    "Useful reference point for public/private network and beneficiary process validation.",
    "Destination-level provider choice should be verified locally before relocation.",
    "https://www.eopyy.gov.gr/",
    greeceHealthcareVerification,
  ),
  row(
    "greece-emergency-services",
    "Emergency numbers and services (Greece)",
    "Official gov.gr traveler safety reference",
    "Emergency number 112 and core emergency-service access guidance.",
    "Essential baseline safety logistics for all Greece relocations.",
    "Use as a practical preparedness reference in relocation planning.",
    "https://www.gov.gr/en/sdg/travel-and-leisure/travel-outside-greece/emergency-numbers-and-services",
    greeceEmergencyVerification,
  ),
];

const greeceCommonResources = [
  resource(
    "greece-migration-resource",
    "visa",
    "Greek Ministry of Migration and Asylum",
    "Official migration policy and residence-permit portal.",
    "https://migration.gov.gr/en/",
    "government_portal",
    "2026-07-24",
  ),
  resource(
    "greece-eu-immigration-resource",
    "visa",
    "EU Immigration Portal: Greece",
    "Country-level long-stay guidance and process links.",
    "https://immigration-portal.ec.europa.eu/greece_en",
    "government_portal",
    "2026-07-24",
  ),
  resource(
    "greece-pwc-residence-resource",
    "tax",
    "PwC Greece residence summary",
    "183-day and center-of-vital-interests tax-residency framing.",
    "https://taxsummaries.pwc.com/greece/individual/residence",
    "tax_summary",
    "2026-02-16",
  ),
  resource(
    "greece-pwc-other-taxes-resource",
    "tax",
    "PwC Greece other taxes",
    "VAT, ENFIA, transfer-tax, and social-contribution overview.",
    "https://taxsummaries.pwc.com/greece/individual/other-taxes",
    "tax_summary",
    "2026-02-16",
  ),
  resource(
    "greece-fraport-resource",
    "airport",
    "Fraport Greece regional airports",
    "Official index for the managed regional airport network.",
    "https://www.fraport-greece.com/english/our-airports/",
    "official_site",
    "2026-07-24",
  ),
  resource(
    "greece-aia-resource",
    "airport",
    "Athens International Airport traveler portal",
    "Official airport operations and traveler-information portal.",
    "https://www.aia.gr/traveler/",
    "official_site",
    "2026-07-24",
  ),
  resource(
    "greece-eopyy-resource",
    "healthcare",
    "EOPYY health-services portal",
    "National payer and healthcare-benefits administration reference.",
    "https://www.eopyy.gov.gr/",
    "government_portal",
    "2026-07-24",
  ),
  resource(
    "greece-emergency-resource",
    "safety",
    "gov.gr emergency numbers and services",
    "Official emergency contact and service guidance for Greece.",
    "https://www.gov.gr/en/sdg/travel-and-leisure/travel-outside-greece/emergency-numbers-and-services",
    "government_portal",
    "2026-07-24",
  ),
];

const croatiaVisaRows = [
  row(
    "croatia-aliens-portal",
    "Croatia foreigners and residence portal",
    "MUP Aliens section",
    "Official immigration information hub covering border checks, stay-and-work, and visa questions.",
    "Core process reference for long-stay planning in Croatia.",
    "Use MUP pages first for definitive residence documentation requirements.",
    "https://mup.gov.hr/aliens-281621/281621",
    croatiaAliensVerification,
  ),
  row(
    "croatia-stay-and-work",
    "Stay and work permits",
    "MUP stay-and-work route",
    "Official section for stay-and-work pathways for non-Croatian nationals.",
    "Relevant for retirees evaluating legal stay logistics and permit category options.",
    "Pair with personal legal/tax advice before any relocation commitment.",
    "https://mup.gov.hr/aliens-281621/stay-and-work/281622",
    croatiaStayWorkVerification,
  ),
];

const croatiaTaxRows = [
  row(
    "croatia-tax-residence",
    "Croatia tax residence",
    "PwC residence summary",
    "Resident status can be triggered by real estate availability for at least 183 days in one or two calendar years.",
    "Physical presence for at least 183 days in one or two calendar years is also a core threshold.",
    "Family location and treaty tie-break tests may apply in dual-residence cases.",
    "https://taxsummaries.pwc.com/croatia/individual/residence",
    croatiaResidenceVerification,
  ),
  row(
    "croatia-vat-rett-social",
    "Croatia VAT, RETT, and social contributions",
    "PwC other taxes summary",
    "General VAT rate is 25%; reduced rates may apply for specified categories.",
    "Real estate transfer tax is stated at 3% where VAT is not applicable.",
    "Employee pension contributions and employer health contributions are material budget factors.",
    "https://taxsummaries.pwc.com/croatia/individual/other-taxes",
    croatiaOtherTaxesVerification,
  ),
];

const croatiaAirportRows = [
  row(
    "croatia-zagreb-airport",
    "Zagreb Airport (ZAG)",
    "Primary international gateway",
    "Key year-round network node for inland and coastal onward connections.",
    "Official passenger portal provides operational and traveler guidance.",
    "Useful fallback routing hub across Croatia destinations.",
    "https://www.zag.aero/en/passengers",
    zagrebAirportVerification,
  ),
  row(
    "croatia-split-airport",
    "Split Airport (SPU)",
    "Major coastal international gateway",
    "Core Dalmatian air gateway with significant seasonal route expansion.",
    "Operational passenger information published on the official airport site.",
    "Relevant access node for Split, Trogir, Sibenik, Makarska, Hvar, and nearby areas.",
    "https://www.split-airport.hr/index.php?lang=en",
    splitAirportVerification,
  ),
];

const croatiaHealthcareRows = [
  row(
    "croatia-hzzo",
    "Croatian Health Insurance Fund (HZZO)",
    "National health-insurance authority",
    "HZZO is the country-level institution for health insurance administration and coverage information.",
    "National Contact Point resources include guidance on using healthcare in Croatia and EU contexts.",
    "Use official HZZO channels to validate practical coverage and provider-access details.",
    "https://hzzo.hr/en/",
    croatiaHealthcareVerification,
  ),
  row(
    "croatia-emergency-services",
    "Emergency numbers in Croatia",
    "Official government emergency reference",
    "112 is the common free emergency number for ambulance, fire/rescue, and police services.",
    "Published direct lines include 192 police, 193 fire, and 194 emergency medical help.",
    "Critical baseline safety logistics for all Croatia relocations.",
    "https://vlada.gov.hr/need-emergency-help/16125",
    croatiaEmergencyVerification,
  ),
];

const croatiaCommonResources = [
  resource(
    "croatia-aliens-resource",
    "visa",
    "MUP Croatia Aliens portal",
    "Official foreigners information hub with visa and stay-and-work pathways.",
    "https://mup.gov.hr/aliens-281621/281621",
    "government_portal",
    "2026-07-24",
  ),
  resource(
    "croatia-stay-work-resource",
    "visa",
    "MUP stay-and-work",
    "Official stay-and-work information for foreign nationals.",
    "https://mup.gov.hr/aliens-281621/stay-and-work/281622",
    "government_portal",
    "2026-07-24",
  ),
  resource(
    "croatia-pwc-residence-resource",
    "tax",
    "PwC Croatia residence summary",
    "183-day and accommodation/family tests for tax-residency framing.",
    "https://taxsummaries.pwc.com/croatia/individual/residence",
    "tax_summary",
    "2025-12-30",
  ),
  resource(
    "croatia-pwc-other-taxes-resource",
    "tax",
    "PwC Croatia other taxes",
    "VAT, social-contribution, inheritance/gift, and transfer-tax overview.",
    "https://taxsummaries.pwc.com/croatia/individual/other-taxes",
    "tax_summary",
    "2025-12-30",
  ),
  resource(
    "croatia-zagreb-airport-resource",
    "airport",
    "Zagreb Airport passenger portal",
    "Official passenger and operations reference for Croatia's primary gateway.",
    "https://www.zag.aero/en/passengers",
    "official_site",
    "2026-07-24",
  ),
  resource(
    "croatia-split-airport-resource",
    "airport",
    "Split Airport portal",
    "Official operations and traveler-information source for the Dalmatian gateway.",
    "https://www.split-airport.hr/index.php?lang=en",
    "official_site",
    "2026-07-24",
  ),
  resource(
    "croatia-hzzo-resource",
    "healthcare",
    "HZZO national health insurance",
    "Country-level healthcare coverage and contact-point resources.",
    "https://hzzo.hr/en/",
    "government_portal",
    "2026-07-24",
  ),
  resource(
    "croatia-emergency-resource",
    "safety",
    "Croatia emergency numbers",
    "Official emergency numbers and service access guidance.",
    "https://vlada.gov.hr/need-emergency-help/16125",
    "government_portal",
    "2026-07-24",
  ),
];

const japanVisaRows = [
  row(
    "japan-isa-portal",
    "Immigration Services Agency (ISA)",
    "Residence and immigration procedures",
    "Official national portal for immigration and residence procedures in Japan.",
    "Use for procedure guides, online application routes, and regional bureau access details.",
    "Core authority for post-entry residence status and permit procedures.",
    "https://www.moj.go.jp/isa/?hl=en",
    japanImmigrationVerification,
  ),
  row(
    "japan-mofa-visa",
    "MOFA visa information",
    "Visa rules and process guidance",
    "Official visa process hub clarifying short-stay versus long-stay pathways.",
    "Long-term stays generally require Certificate of Eligibility workflow before visa issuance.",
    "Final requirements depend on nationality and the responsible Japanese mission.",
    "https://www.mofa.go.jp/j_info/visit/visa/index.html",
    japanVisaVerification,
  ),
];

const japanTaxRows = [
  row(
    "japan-tax-residence",
    "Japan tax residence categories",
    "PwC residence summary",
    "Resident status can be based on domicile (jusho) or one-year-or-more temporary place of abode (kyosho).",
    "Foreign nationals with five years or less in Japan over the preceding ten years can be classified as non-permanent residents.",
    "Longer aggregate presence can shift classification to permanent resident taxpayer status.",
    "https://taxsummaries.pwc.com/japan/individual/residence",
    japanResidenceVerification,
  ),
  row(
    "japan-consumption-social-fixed-assets",
    "Japan consumption tax, social insurance, and fixed assets tax",
    "PwC other taxes summary",
    "Consumption tax applies to transfers of goods/services and imports under domestic tax rules.",
    "Employee social insurance contributions are material payroll-budget items in many work-income scenarios.",
    "Annual fixed assets tax is generally assessed by local authorities on real property.",
    "https://taxsummaries.pwc.com/japan/individual/other-taxes",
    japanOtherTaxesVerification,
  ),
];

const japanAirportRows = [
  row(
    "japan-haneda-hnd",
    "Haneda Airport (HND)",
    "Primary Tokyo metro gateway",
    "Major domestic and international gateway with extensive metropolitan ground-transport integration.",
    "Official traveler portal includes live flight, access, and terminal service information.",
    "Key routing node for eastern and central Japan destination access.",
    "https://tokyo-haneda.com/en/",
    japanHanedaVerification,
  ),
  row(
    "japan-narita-nrt",
    "Narita International Airport (NRT)",
    "Primary long-haul Tokyo-area gateway",
    "Global long-haul network hub with official access, floor, clinic, and operations guidance.",
    "Operated by Narita International Airport Corporation.",
    "Useful intercontinental access anchor for retiree travel planning.",
    "https://www.narita-airport.jp/en/",
    japanNaritaVerification,
  ),
  row(
    "japan-kansai-kix",
    "Kansai International Airport (KIX)",
    "Primary international gateway for Kansai",
    "Major international access node for Osaka, Kyoto, Kobe, and nearby regions.",
    "Official portal includes flight search, airport map, and transport/congestion tools.",
    "Relevant for western Japan relocation logistics and seasonal route planning.",
    "https://www.kansai-airport.or.jp/en/",
    japanKixVerification,
  ),
];

const japanHealthcareRows = [
  row(
    "japan-foreign-resident-support-portal",
    "Foreign resident support portal",
    "ISA life-support portal",
    "Government support portal for foreigners living in Japan with links to medical care, pensions, tax, and local procedures.",
    "Contains multilingual support links and practical contact resources by category.",
    "Useful baseline hub before city-level provider and insurance enrollment checks.",
    "https://www.moj.go.jp/isa/support/portal/index.html",
    japanSupportPortalVerification,
  ),
  row(
    "japan-health-employment-insurance-links",
    "Public insurance guidance links",
    "Referenced from ISA support portal",
    "ISA support pages include official links to pension and social insurance information resources for foreign residents.",
    "Use the linked government resources for up-to-date enrollment and eligibility details.",
    "Treat destination-level hospital choice as a separate local verification step.",
    "https://www.moj.go.jp/isa/support/portal/index.html",
    japanSupportPortalVerification,
  ),
];

const japanCommonResources = [
  resource(
    "japan-isa-resource",
    "visa",
    "Immigration Services Agency of Japan",
    "Primary national source for immigration and residence procedures.",
    "https://www.moj.go.jp/isa/?hl=en",
    "government_portal",
    "2026-07-24",
  ),
  resource(
    "japan-mofa-visa-resource",
    "visa",
    "MOFA visa information",
    "Official Ministry of Foreign Affairs visa requirements and process guidance.",
    "https://www.mofa.go.jp/j_info/visit/visa/index.html",
    "government_portal",
    "2026-06-24",
  ),
  resource(
    "japan-pwc-residence-resource",
    "tax",
    "PwC Japan residence summary",
    "Resident vs non-permanent/permanent resident taxpayer framework.",
    "https://taxsummaries.pwc.com/japan/individual/residence",
    "tax_summary",
    "2026-07-21",
  ),
  resource(
    "japan-pwc-other-taxes-resource",
    "tax",
    "PwC Japan other taxes",
    "Consumption tax, social insurance, inheritance/gift, and property-tax overview.",
    "https://taxsummaries.pwc.com/japan/individual/other-taxes",
    "tax_summary",
    "2026-07-21",
  ),
  resource(
    "japan-haneda-resource",
    "airport",
    "Haneda Airport traveler portal",
    "Official passenger-facing operations, access, and terminal information.",
    "https://tokyo-haneda.com/en/",
    "official_site",
    "2026-07-24",
  ),
  resource(
    "japan-narita-resource",
    "airport",
    "Narita International Airport portal",
    "Official operations, access, and traveler-services reference.",
    "https://www.narita-airport.jp/en/",
    "official_site",
    "2026-07-24",
  ),
  resource(
    "japan-kix-resource",
    "airport",
    "Kansai International Airport portal",
    "Official flight, transport, and airport-services reference for Kansai.",
    "https://www.kansai-airport.or.jp/en/",
    "official_site",
    "2026-07-24",
  ),
  resource(
    "japan-support-portal-resource",
    "healthcare",
    "ISA foreign resident support portal",
    "Government support resources for medical care and life setup in Japan.",
    "https://www.moj.go.jp/isa/support/portal/index.html",
    "government_portal",
    "2026-07-24",
  ),
  resource(
    "japan-npa-resource",
    "safety",
    "National Police Agency portal",
    "National public safety institution reference.",
    "https://www.npa.go.jp/english/index.html",
    "government_portal",
    "2026-07-24",
  ),
  resource(
    "japan-fdma-resource",
    "safety",
    "Fire and Disaster Management Agency",
    "National fire and disaster-management authority reference.",
    "https://www.fdma.go.jp/en/",
    "government_portal",
    "2026-07-24",
  ),
];

const italyVisaRows = [
  row(
    "italy-visa-portal",
    "Visa for Italy portal",
    "Official visa information and procedure lookup",
    "Government-aligned portal for visa requirements and route guidance by nationality and purpose.",
    "Use this as the first screening point for long-stay and national-visa pathways.",
    "Always validate with the competent consulate and current legal text before filing.",
    "https://vistoperitalia.esteri.it/home/en",
    italyVisaVerification,
  ),
  row(
    "italy-interior-immigration",
    "Italian Ministry of the Interior immigration hub",
    "Institutional immigration content area",
    "Country-level institutional context for immigration and foreigners-related governance.",
    "Use official ministry channels for legal-status and administrative updates.",
    "Treat destination-level permit logistics as a separate local verification step.",
    "https://www.interno.gov.it/en/special-content/immigration",
    italyImmigrationVerification,
  ),
];

const italyTaxRows = [
  row(
    "italy-tax-residence",
    "Italy tax residence criteria",
    "PwC residence summary",
    "For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
    "Residency analysis prioritizes personal and family relationships over economic links.",
    "Treaty tie-break and anti-abuse considerations can affect cross-border cases.",
    "https://taxsummaries.pwc.com/italy/individual/residence",
    italyResidenceVerification,
  ),
  row(
    "italy-vat-social-imu",
    "Italy VAT, social contributions, and property taxes",
    "PwC other taxes summary",
    "Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
    "Employment social contributions are material and split between employer and employee in typical payroll cases.",
    "IMU/TARI and other property-related taxes should be budgeted for ownership scenarios.",
    "https://taxsummaries.pwc.com/italy/individual/other-taxes",
    italyOtherTaxesVerification,
  ),
];

const italyAirportRows = [
  row(
    "italy-enac-passengers",
    "ENAC passenger and airport rights hub",
    "National civil-aviation authority reference",
    "Official regulator source for passenger rights and airport system context in Italy.",
    "Useful country-level authority reference across all Italy destinations.",
    "Use airport-level portals for daily operations and route specifics.",
    "https://www.enac.gov.it/en/passengers",
    italyAviationVerification,
  ),
  row(
    "italy-malpensa-mxp",
    "Milan Malpensa Airport (MXP)",
    "Major intercontinental northern gateway",
    "Large international gateway relevant to many northern and central Italy relocation routes.",
    "Official portal includes flights, parking, airport services, and contacts.",
    "Useful baseline gateway reference for long-haul and Schengen connectivity planning.",
    "https://www.milanomalpensa-airport.com/en",
    italyMalpensaVerification,
  ),
];

const italyCommonResources = [
  resource(
    "italy-visa-portal-resource",
    "visa",
    "Visa for Italy portal",
    "Official visa and procedure guidance entry point.",
    "https://vistoperitalia.esteri.it/home/en",
    "government_portal",
    "2026-07-24",
  ),
  resource(
    "italy-immigration-resource",
    "visa",
    "Italian Ministry of the Interior immigration area",
    "Institutional immigration policy and related content area.",
    "https://www.interno.gov.it/en/special-content/immigration",
    "government_portal",
    "2026-07-24",
  ),
  resource(
    "italy-pwc-residence-resource",
    "tax",
    "PwC Italy residence summary",
    "183-day, domicile, and habitual-abode tax residency framework.",
    "https://taxsummaries.pwc.com/italy/individual/residence",
    "tax_summary",
    "2026-07-23",
  ),
  resource(
    "italy-pwc-other-taxes-resource",
    "tax",
    "PwC Italy other taxes",
    "VAT, social contribution, wealth-tax, and property-tax overview.",
    "https://taxsummaries.pwc.com/italy/individual/other-taxes",
    "tax_summary",
    "2026-07-23",
  ),
  resource(
    "italy-enac-resource",
    "airport",
    "ENAC passengers portal",
    "National civil aviation authority passenger reference.",
    "https://www.enac.gov.it/en/passengers",
    "government_portal",
    "2026-07-24",
  ),
  resource(
    "italy-malpensa-resource",
    "airport",
    "Milan Malpensa airport portal",
    "Official passenger services and operations portal for MXP.",
    "https://www.milanomalpensa-airport.com/en",
    "official_site",
    "2026-07-24",
  ),
  resource(
    "italy-112-resource",
    "safety",
    "Italy emergency number 112 portal",
    "Official emergency number service and operational guidance.",
    "https://www.112.gov.it/en/",
    "government_portal",
    "2026-07-24",
  ),
];

const portugalVisaRows = [
  row(
    "portugal-aima",
    "AIMA migration authority",
    "Portugal migration and asylum agency",
    "Primary authority for migration services and resident support pathways in Portugal.",
    "Use AIMA resources to verify current process requirements and contacts.",
    "Applicable as a country-level baseline across all Portugal destinations.",
    "https://aima.gov.pt/en",
    portugalAimaVerification,
  ),
  row(
    "portugal-gov-residence",
    "gov.pt residence guidance",
    "Living and residence pathways in Portugal",
    "Official gov.pt guidance covers residence for up to and over 3 months and permanent-residence pathways.",
    "Includes practical process framing for EU and non-EU family scenarios.",
    "Treat legal filings as case-specific and confirm with competent authorities.",
    "https://www2.gov.pt/en/cidadaos-europeus-viajar-viver-e-fazer-negocios-em-portugal/viver-em-portugal/residir-em-portugal",
    portugalGovResidenceVerification,
  ),
];

const portugalTaxRows = [
  row(
    "portugal-tax-residence",
    "Portugal tax residence",
    "PwC residence summary",
    "Tax residence can be triggered by spending more than 183 days in Portugal in a relevant 12-month window.",
    "Habitual residence maintained in Portugal can also trigger tax residence even below 183 days.",
    "Entry and exit timing can affect the resident/non-resident period in the tax year.",
    "https://taxsummaries.pwc.com/portugal/individual/residence",
    portugalResidenceVerification,
  ),
  row(
    "portugal-vat-social-property",
    "Portugal VAT, social contributions, and property tax context",
    "PwC other taxes summary",
    "VAT rates include 23% standard on mainland, with reduced regional rates in Madeira and Azores.",
    "Employee and employer social-security contributions are a key budget factor for work-income households.",
    "Municipal property taxation applies to real-estate holdings and should be budgeted in ownership scenarios.",
    "https://taxsummaries.pwc.com/portugal/individual/other-taxes",
    portugalOtherTaxesVerification,
  ),
];

const portugalAirportRows = [
  row(
    "portugal-ana-network",
    "ANA Portugal airport network",
    "National airport operator network",
    "ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways.",
    "Useful country-level transport reference for route planning between mainland and islands.",
    "Use airport-specific portals for day-of-travel operations and seasonal schedules.",
    "https://www.ana.pt/en",
    portugalAnaVerification,
  ),
];

const portugalHealthcareRows = [
  row(
    "portugal-sns24",
    "SNS 24 services",
    "National Health Service digital and phone access",
    "SNS 24 provides national digital-health access points and service channels.",
    "Official contact line and app channels support practical healthcare navigation.",
    "Country-level reference before destination-specific provider and facility checks.",
    "https://www.sns24.gov.pt/en/",
    portugalSnsVerification,
  ),
];

const portugalCommonResources = [
  resource(
    "portugal-aima-resource",
    "visa",
    "AIMA migration authority",
    "Official migration authority portal for residence and integration pathways.",
    "https://aima.gov.pt/en",
    "government_portal",
    "2026-07-24",
  ),
  resource(
    "portugal-gov-residence-resource",
    "visa",
    "gov.pt residence in Portugal",
    "Official residence-process guidance for EU and non-EU scenarios.",
    "https://www2.gov.pt/en/cidadaos-europeus-viajar-viver-e-fazer-negocios-em-portugal/viver-em-portugal/residir-em-portugal",
    "government_portal",
    "2026-07-24",
  ),
  resource(
    "portugal-pwc-residence-resource",
    "tax",
    "PwC Portugal residence summary",
    "183-day and habitual-residence tax-residency framework.",
    "https://taxsummaries.pwc.com/portugal/individual/residence",
    "tax_summary",
    "2026-01-05",
  ),
  resource(
    "portugal-pwc-other-taxes-resource",
    "tax",
    "PwC Portugal other taxes",
    "VAT, social-contribution, inheritance, and property-tax overview.",
    "https://taxsummaries.pwc.com/portugal/individual/other-taxes",
    "tax_summary",
    "2026-01-05",
  ),
  resource(
    "portugal-ana-resource",
    "airport",
    "ANA Portugal airports network",
    "Official airport-network and gateway reference for Portugal.",
    "https://www.ana.pt/en",
    "official_site",
    "2026-07-24",
  ),
  resource(
    "portugal-sns24-resource",
    "healthcare",
    "SNS 24 portal",
    "Official Portuguese National Health Service digital and contact gateway.",
    "https://www.sns24.gov.pt/en/",
    "government_portal",
    "2026-07-24",
  ),
];

const spainVisaRows = [
  row(
    "spain-immigration-portal",
    "Spain immigration procedures",
    "Ministry of the Interior foreigners procedures hub",
    "Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "Includes links to application forms, procedural guidance, and core immigration administration resources.",
    "Country-level baseline before province-level office appointment and filing steps.",
    "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/",
    spainImmigrationVerification,
  ),
];

const spainTaxRows = [
  row(
    "spain-tax-residence",
    "Spain tax residence",
    "PwC residence summary",
    "Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
    "Residence can also arise if Spain is the main center of activities or economic interests.",
    "Spanish law generally treats individuals as either resident or non-resident for the whole tax year.",
    "https://taxsummaries.pwc.com/spain/individual/residence",
    spainResidenceVerification,
  ),
  row(
    "spain-vat-social-wealth",
    "Spain VAT, social contributions, and wealth/property tax context",
    "PwC other taxes summary",
    "Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
    "Social-security contributions and regional tax variations can materially affect household budgeting.",
    "Wealth and local property taxes may apply depending on assets, region, and ownership structure.",
    "https://taxsummaries.pwc.com/spain/individual/other-taxes",
    spainOtherTaxesVerification,
  ),
];

const spainAirportRows = [
  row(
    "spain-aena-network",
    "Aena airport network",
    "Primary Spanish airport operator reference",
    "Aena is the main operator for Spain's national airport network and associated passenger information.",
    "Use this official network gateway to navigate airport-level operations and service links.",
    "Confirm schedules and operational notices on each airport-specific page before travel.",
    "https://www.aena.es/en/home.html",
    spainAenaVerification,
  ),
];

const spainHealthcareRows = [
  row(
    "spain-health-ministry",
    "Spanish Ministry of Health",
    "National health policy and service portal",
    "Official national health portal with links to health areas, citizen services, and system resources.",
    "Useful country-level starting point before destination-specific provider and waiting-time checks.",
    "Use local autonomous-community services for operational appointment and coverage details.",
    "https://www.sanidad.gob.es/en/home.htm",
    spainHealthVerification,
  ),
  row(
    "spain-civil-protection",
    "Spanish Civil Protection",
    "National civil-protection reference",
    "Civil-protection portal referenced by the Ministry of the Interior for emergency preparedness context.",
    "Useful for baseline emergency-readiness orientation alongside local emergency contacts.",
    "Maintain destination-level emergency plans and verify local response channels after arrival.",
    "https://www.proteccioncivil.es/",
    spainCivilProtectionVerification,
  ),
];

const spainCommonResources = [
  resource(
    "spain-immigration-resource",
    "visa",
    "Spain immigration procedures portal",
    "Official Ministry of the Interior foreigners procedures and residence-guidance entry point.",
    "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/",
    "government_portal",
    "2026-07-24",
  ),
  resource(
    "spain-pwc-residence-resource",
    "tax",
    "PwC Spain residence summary",
    "183-day and center-of-economic-interests tax-residency framework.",
    "https://taxsummaries.pwc.com/spain/individual/residence",
    "tax_summary",
    "2025-12-31",
  ),
  resource(
    "spain-pwc-other-taxes-resource",
    "tax",
    "PwC Spain other taxes",
    "VAT, social-contribution, wealth, and property-tax overview.",
    "https://taxsummaries.pwc.com/spain/individual/other-taxes",
    "tax_summary",
    "2025-12-31",
  ),
  resource(
    "spain-aena-resource",
    "airport",
    "Aena network gateway",
    "Official airport-network entry point for Spain air-travel operations.",
    "https://www.aena.es/en/home.html",
    "official_site",
    "2026-07-24",
  ),
  resource(
    "spain-health-ministry-resource",
    "healthcare",
    "Spanish Ministry of Health",
    "Official health-system portal and citizen information gateway.",
    "https://www.sanidad.gob.es/en/home.htm",
    "government_portal",
    "2026-07-24",
  ),
  resource(
    "spain-civil-protection-resource",
    "safety",
    "Spanish Civil Protection",
    "National civil-protection and preparedness reference portal.",
    "https://www.proteccioncivil.es/",
    "government_portal",
    "2026-07-24",
  ),
];

const franceVisaRows = [
  row(
    "france-visas-official",
    "France-Visas official portal",
    "National visa application entry point",
    "Official portal for checking visa requirements, completing applications, and tracking status.",
    "Provides process guidance by travel purpose, including long-stay pathways.",
    "Use as the first step before consular appointments and document preparation.",
    "https://france-visas.gouv.fr/en/",
    franceVisasVerification,
  ),
  row(
    "france-residence-permits",
    "Residence permits and foreigner documents in France",
    "Service-Public procedures index",
    "Government directory of residence permits and stay-document pathways for foreign nationals in France.",
    "Includes visitor, retiree, resident, and family-route process references.",
    "Use this index to route to permit-specific requirements and administrative steps.",
    "https://www.service-public.gouv.fr/particuliers/vosdroits/N110",
    franceResidencePermitsVerification,
  ),
];

const franceTaxRows = [
  row(
    "france-tax-residence",
    "France tax residence criteria",
    "PwC residence summary",
    "Tax domicile can apply when habitual abode or principal place of stay is in France.",
    "Residence can also be triggered by professional activity in France or center of economic interests.",
    "Treaty tie-break rules may apply in dual-residence scenarios.",
    "https://taxsummaries.pwc.com/france/individual/residence",
    franceResidenceVerification,
  ),
  row(
    "france-vat-social-ifi",
    "France VAT, social contributions, and real-estate wealth-tax context",
    "PwC other taxes summary",
    "Standard VAT rate is 20%, with reduced rates including 10%, 5.5%, and 2.1% for specified cases.",
    "Employer and employee social-security contributions are significant budgeting factors for wage income.",
    "Real-estate wealth-tax and local property-tax rules can affect ownership planning.",
    "https://taxsummaries.pwc.com/france/individual/other-taxes",
    franceOtherTaxesVerification,
  ),
];

const franceAirportRows = [
  row(
    "france-civil-aviation-portal",
    "French civil aviation portal",
    "National civil aviation reference",
    "Country-level civil aviation portal reference for regulatory and aviation-system context.",
    "Useful as a baseline authority source alongside airport-specific operational sites.",
    "Confirm route, delay, and operations details on airport-level portals before travel.",
    "https://www.aviation-civile.gouv.fr/",
    franceAviationVerification,
  ),
];

const franceHealthcareRows = [
  row(
    "france-social-health-portal",
    "France social and health public-services portal",
    "Service-Public social-health directory",
    "Government index covering social security, reimbursements, patient rights, and health-service procedures.",
    "Includes dedicated health-insurance sections relevant to residents and foreign nationals.",
    "Country-level baseline before selecting destination-level providers and care pathways.",
    "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811",
    franceHealthVerification,
  ),
  row(
    "france-civil-security",
    "French civil security preparedness framework",
    "Ministry of the Interior civil-security dossier",
    "Official national civil-security reference with crisis-readiness and emergency-management context.",
    "Useful baseline for understanding public-safety coordination and preparedness priorities.",
    "Pair with local emergency contacts and municipality-specific guidance after relocation.",
    "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile",
    franceCivilSecurityVerification,
  ),
];

const franceCommonResources = [
  resource(
    "france-visas-resource",
    "visa",
    "France-Visas portal",
    "Official national visa process and application guidance portal.",
    "https://france-visas.gouv.fr/en/",
    "government_portal",
    "2026-07-24",
  ),
  resource(
    "france-residence-permits-resource",
    "visa",
    "Service-Public residence permits index",
    "Official procedures index for residence permits and foreigner stay documents.",
    "https://www.service-public.gouv.fr/particuliers/vosdroits/N110",
    "government_portal",
    "2026-07-24",
  ),
  resource(
    "france-pwc-residence-resource",
    "tax",
    "PwC France residence summary",
    "Tax-domicile framework based on abode, activity, and economic-interest tests.",
    "https://taxsummaries.pwc.com/france/individual/residence",
    "tax_summary",
    "2026-04-24",
  ),
  resource(
    "france-pwc-other-taxes-resource",
    "tax",
    "PwC France other taxes",
    "VAT, social-contribution, capital-gains, and property-tax overview.",
    "https://taxsummaries.pwc.com/france/individual/other-taxes",
    "tax_summary",
    "2026-04-24",
  ),
  resource(
    "france-aviation-resource",
    "airport",
    "French civil aviation portal",
    "National aviation authority and system-context reference.",
    "https://www.aviation-civile.gouv.fr/",
    "government_portal",
    "2026-07-24",
  ),
  resource(
    "france-social-health-resource",
    "healthcare",
    "Service-Public social-health section",
    "Government health-system and social-security procedures index.",
    "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811",
    "government_portal",
    "2026-07-24",
  ),
  resource(
    "france-civil-security-resource",
    "safety",
    "Ministry of Interior civil-security dossier",
    "Official civil-security and crisis-management orientation reference.",
    "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile",
    "government_portal",
    "2026-07-24",
  ),
];

const switzerlandVisaRows = [
  row(
    "switzerland-sem-entry",
    "Switzerland entry requirements",
    "State Secretariat for Migration (SEM)",
    "Official federal source for entry requirements by nationality, visa pathways, and stay-length rules.",
    "Includes guidance for visa-required and visa-free entry scenarios and Schengen-related checks.",
    "Use as baseline before canton-level permit execution and appointment logistics.",
    "https://www.sem.admin.ch/sem/en/home/themen/einreise.html",
    switzerlandSemEntryVerification,
  ),
  row(
    "switzerland-sem-long-stay",
    "Long-term stays in Switzerland",
    "SEM long-stay framework",
    "Federal long-stay pathway reference for residence durations over 90 days.",
    "Use together with canton migration office procedures for document filing and approval timelines.",
    "Country-level orientation for retirees evaluating legal stay structure in Switzerland.",
    "https://www.sem.admin.ch/sem/en/home/themen/aufenthalt.html",
    switzerlandSemLongStayVerification,
  ),
];

const switzerlandTaxRows = [
  row(
    "switzerland-tax-residence",
    "Switzerland tax residence",
    "PwC residence summary",
    "Tax residence can apply when an individual intends to establish a permanent usual abode in Switzerland.",
    "Residence may also be triggered by at least 30 consecutive days with gainful activity or 90 days without gainful activity.",
    "Worldwide income and wealth principles can apply once tax residency is established.",
    "https://taxsummaries.pwc.com/switzerland/individual/residence",
    switzerlandResidenceVerification,
  ),
  row(
    "switzerland-vat-social-wealth",
    "Switzerland VAT, social contributions, and wealth-tax context",
    "PwC other taxes summary",
    "Standard VAT rate is 8.1%, with reduced rates including 2.6% and a special lodging rate of 3.8%.",
    "Swiss social-security contributions include old-age, unemployment, health, and long-term care-related components.",
    "Cantonal wealth/property tax structures and transfer-tax rules can materially affect location-specific budgeting.",
    "https://taxsummaries.pwc.com/switzerland/individual/other-taxes",
    switzerlandOtherTaxesVerification,
  ),
];

const switzerlandAirportRows = [
  row(
    "switzerland-zurich-airport",
    "Zurich Airport passenger portal",
    "Primary Swiss international gateway reference",
    "Official passenger portal with departures, arrivals, security guidance, and airport services.",
    "Useful national baseline for intercontinental access and Switzerland-wide onward transfer planning.",
    "Use airport-specific pages for time-sensitive operations and route-level changes.",
    "https://www.flughafen-zuerich.ch/en/passengers",
    switzerlandZurichAirportVerification,
  ),
];

const switzerlandHealthcareRows = [
  row(
    "switzerland-health-insurance-basics",
    "Swiss health insurance framework",
    "ch.ch health-insurance guidance",
    "Government portal section describing mandatory health-insurance structure and related practical guidance.",
    "Includes links for costs, benefits, and switching/taking out insurance pathways.",
    "Country-level baseline before canton-specific provider and plan selection.",
    "https://www.ch.ch/en/health/health-insurance",
    switzerlandHealthVerification,
  ),
  row(
    "switzerland-premium-calculator",
    "Swiss health-insurance premium calculator",
    "Federal premium comparison portal",
    "Official premium-comparison portal for Swiss health-insurance planning and insurer comparison workflows.",
    "Managed under the Federal Office of Public Health context with practical FAQ and data tools.",
    "Useful for budgeting before destination-level healthcare network choices.",
    "https://www.priminfo.admin.ch/",
    switzerlandPremiumsVerification,
  ),
];

const switzerlandCommonResources = [
  resource(
    "switzerland-sem-entry-resource",
    "visa",
    "SEM entry requirements",
    "Official federal entry and visa-requirements guidance portal.",
    "https://www.sem.admin.ch/sem/en/home/themen/einreise.html",
    "government_portal",
    "2026-07-24",
  ),
  resource(
    "switzerland-sem-longstay-resource",
    "visa",
    "SEM long-term stays",
    "Federal orientation for stays over 90 days and longer-term residence pathways.",
    "https://www.sem.admin.ch/sem/en/home/themen/aufenthalt.html",
    "government_portal",
    "2026-07-24",
  ),
  resource(
    "switzerland-pwc-residence-resource",
    "tax",
    "PwC Switzerland residence summary",
    "Tax-residency triggers based on abode intention and stay duration thresholds.",
    "https://taxsummaries.pwc.com/switzerland/individual/residence",
    "tax_summary",
    "2026-07-01",
  ),
  resource(
    "switzerland-pwc-other-taxes-resource",
    "tax",
    "PwC Switzerland other taxes",
    "VAT, social-security, wealth-tax, and transfer-tax overview.",
    "https://taxsummaries.pwc.com/switzerland/individual/other-taxes",
    "tax_summary",
    "2026-07-01",
  ),
  resource(
    "switzerland-zurich-airport-resource",
    "airport",
    "Zurich Airport passenger portal",
    "Official passenger operations and travel-services gateway.",
    "https://www.flughafen-zuerich.ch/en/passengers",
    "official_site",
    "2026-07-24",
  ),
  resource(
    "switzerland-health-insurance-resource",
    "healthcare",
    "ch.ch health insurance",
    "Government portal guidance on Swiss mandatory health insurance.",
    "https://www.ch.ch/en/health/health-insurance",
    "government_portal",
    "2026-07-24",
  ),
  resource(
    "switzerland-priminfo-resource",
    "healthcare",
    "priminfo premium calculator",
    "Federal tool for health-insurance premium comparison and planning.",
    "https://www.priminfo.admin.ch/",
    "government_portal",
    "2026-07-24",
  ),
  resource(
    "switzerland-emergency-resource",
    "safety",
    "ch.ch emergencies and danger",
    "Official emergency-number and danger-response orientation page.",
    "https://www.ch.ch/en/safety-and-justice/emergencies-and-danger/",
    "government_portal",
    "2026-07-24",
  ),
];

const sloveniaVisaRows = [
  row(
    "slovenia-immigration-policy",
    "Immigration to Slovenia",
    "gov.si immigration policy and procedures",
    "Official policy page covering entry, residence permits, and core foreigner pathways in Slovenia.",
    "EU/EEA citizens may enter with valid ID/passport, while third-country nationals generally require visa or residence permit before arrival.",
    "Country-level baseline before municipality and permit-type specific filing steps.",
    "https://www.gov.si/en/policies/state-and-society/immigration-to-slovenia/",
    sloveniaImmigrationVerification,
  ),
];

const sloveniaTaxRows = [
  row(
    "slovenia-tax-residence",
    "Slovenia tax residence",
    "PwC residence summary",
    "Residence can be established via permanent residence, habitual abode, or center of personal and economic interests.",
    "Presence of more than 183 days in a taxable year can also create tax residence.",
    "Applies regardless of nationality under Slovenian PIT residence framework.",
    "https://taxsummaries.pwc.com/slovenia/individual/residence",
    sloveniaResidenceVerification,
  ),
  row(
    "slovenia-vat-social-contributions",
    "Slovenia VAT and social contribution framework",
    "PwC other taxes summary",
    "Standard VAT rate is 22% with reduced 9.5% rate for certain supplies.",
    "Employer and employee social-security contributions both apply and affect take-home and payroll budgets.",
    "Additional compulsory health and long-term care contributions are material planning factors.",
    "https://taxsummaries.pwc.com/slovenia/individual/other-taxes",
    sloveniaOtherTaxesVerification,
  ),
];

const sloveniaAirportRows = [
  row(
    "slovenia-ljubljana-airport",
    "Ljubljana Airport (LJU)",
    "Primary international airport gateway",
    "Primary commercial air gateway for Slovenia with passenger services and flight operations.",
    "Use official airport channels for route, check-in, and operational notices.",
    "Relevant transfer hub for all Slovenia destinations in this catalog set.",
    "https://www.lju-airport.si/en/",
    sloveniaAirportVerification,
  ),
];

const sloveniaHealthcareRows = [
  row(
    "slovenia-nijz-public-health",
    "National Institute of Public Health (NIJZ)",
    "National public-health information source",
    "NIJZ provides public-health information, prevention content, and health-system resources in Slovenia.",
    "Useful country-level health reference before city-level provider selection.",
    "Includes links to eHealth and travel-clinic resources.",
    "https://nijz.si/en",
    sloveniaHealthcareVerification,
  ),
  row(
    "slovenia-emergency-notification-centres",
    "Emergency notification and rescue system",
    "24/7 emergency-notification framework",
    "Slovenia's emergency-notification centres operate 24/7 and respond to 112 emergency calls.",
    "National and regional centres support dispatch and rapid activation of rescue and medical responses.",
    "Core safety baseline for relocation planning across all Slovenian destinations.",
    "https://www.gov.si/en/policies/defence-civil-protection-and-public-order/protection-against-natural-and-other-disasters/",
    sloveniaEmergencyVerification,
  ),
];

const sloveniaCommonResources = [
  resource(
    "slovenia-immigration-resource",
    "visa",
    "Immigration to Slovenia (gov.si)",
    "Official immigration policy and entry/residence guidance.",
    "https://www.gov.si/en/policies/state-and-society/immigration-to-slovenia/",
    "government_portal",
    "2026-07-24",
  ),
  resource(
    "slovenia-pwc-residence-resource",
    "tax",
    "PwC Slovenia residence summary",
    "Residency tests including permanent tie, habitual abode, center of interests, and 183-day presence.",
    "https://taxsummaries.pwc.com/slovenia/individual/residence",
    "tax_summary",
    "2026-07-15",
  ),
  resource(
    "slovenia-pwc-other-taxes-resource",
    "tax",
    "PwC Slovenia other taxes",
    "VAT and social-contribution overview including newer compulsory contributions.",
    "https://taxsummaries.pwc.com/slovenia/individual/other-taxes",
    "tax_summary",
    "2026-07-15",
  ),
  resource(
    "slovenia-ljubljana-airport-resource",
    "airport",
    "Ljubljana Airport portal",
    "Primary airport operations and passenger information reference.",
    "https://www.lju-airport.si/en/",
    "official_site",
    "2026-07-24",
  ),
  resource(
    "slovenia-nijz-resource",
    "healthcare",
    "NIJZ public health portal",
    "National public-health and prevention information source.",
    "https://nijz.si/en",
    "government_portal",
    "2026-07-24",
  ),
  resource(
    "slovenia-112-resource",
    "safety",
    "Protection against natural and other disasters",
    "Government guidance noting 24/7 emergency notification centres responding to 112 calls.",
    "https://www.gov.si/en/policies/defence-civil-protection-and-public-order/protection-against-natural-and-other-disasters/",
    "government_portal",
    "2026-07-24",
  ),
  resource(
    "slovenia-police-113-resource",
    "safety",
    "Slovenian Police emergency number 113",
    "Official police emergency contact and response process guidance.",
    "https://www.policija.si/eng/contacts/police-emergency-telephone-number-113",
    "government_portal",
    "2026-07-24",
  ),
];

const austriaVisaRows = [
  row(
    "austria-settlement-and-residence-act",
    "Settlement and Residence Act (NAG)",
    "Austrian residence-law overview",
    "The NAG framework governs planned stays over six months and residence-permit pathways for non-Austrian nationals.",
    "For stays up to six months, a visa may be required depending on nationality and entry conditions.",
    "Use this as the country-level legal baseline before selecting permit purpose and filing route.",
    "https://www.bmi.gv.at/312_en/start.html",
    austriaResidenceVerification,
  ),
];

const austriaTaxRows = [
  row(
    "austria-tax-residence",
    "Austria tax residence",
    "PwC residence summary",
    "A person is generally regarded as resident with the establishment of an abode.",
    "Residence is in any event triggered after a six-month stay in Austria.",
    "Nationality is not itself a residence criterion under the Austrian tax-residence overview.",
    "https://taxsummaries.pwc.com/austria/individual/residence",
    austriaTaxResidenceVerification,
  ),
  row(
    "austria-vat-social-security",
    "Austria VAT and social-security framework",
    "PwC other taxes summary",
    "General Austrian VAT rate is 20%, with reduced rates including 10% and 13% for specified goods and services.",
    "PwC also details compulsory social-security contribution categories for employers and employees.",
    "These tax and payroll obligations are core budget inputs for relocation planning.",
    "https://taxsummaries.pwc.com/austria/individual/other-taxes",
    austriaOtherTaxesVerification,
  ),
];

const austriaAirportRows = [
  row(
    "austria-vienna-airport-passenger-portal",
    "Vienna Airport passenger portal",
    "Primary airport operations reference",
    "Vienna Airport provides check-in, airline, and passenger-operations guidance from its official portal.",
    "The portal includes security, baggage, arrival, and transfer information needed for route planning.",
    "Use as the baseline airport operations source for Austrian destinations in this catalog set.",
    "https://viennaairport.com/en/passengers",
    austriaAirportVerification,
  ),
];

const austriaHealthcareRows = [
  row(
    "austria-health-ministry-topics",
    "Federal Ministry health topics",
    "National health-system policy entry point",
    "The ministry health section provides country-level public-health and health-system policy orientation.",
    "This is a core federal source before selecting local providers or specialty-care pathways.",
    "Use it as the baseline official healthcare context for Austria destinations.",
    "https://www.sozialministerium.gv.at/en/Topics/Health.html",
    austriaHealthcareVerification,
  ),
  row(
    "austria-emergency-number-baseline",
    "Austria emergency numbers baseline",
    "Official emergency and service-line reference",
    "The official portal lists single European emergency number 112 and national response numbers.",
    "Published entries include police 133, ambulance 144, and fire service 122.",
    "Use as the country-level safety baseline before municipality-specific emergency planning.",
    "https://www.oesterreich.gv.at/en/themen/notfaelle_unfaelle_und_kriminalitaet/notrufnummern",
    austriaEmergencyVerification,
  ),
];

const austriaCommonResources = [
  resource(
    "austria-residence-resource",
    "visa",
    "Settlement in Austria (BMI)",
    "Official Austrian Settlement and Residence Act overview for stays over three and six months.",
    "https://www.bmi.gv.at/312_en/start.html",
    "government_portal",
    "2026-07-24",
  ),
  resource(
    "austria-pwc-residence-resource",
    "tax",
    "PwC Austria residence summary",
    "Tax residence triggers including abode and six-month stay threshold.",
    "https://taxsummaries.pwc.com/austria/individual/residence",
    "tax_summary",
    "2026-07-23",
  ),
  resource(
    "austria-pwc-other-taxes-resource",
    "tax",
    "PwC Austria other taxes",
    "VAT, social-security, and other non-income tax overview.",
    "https://taxsummaries.pwc.com/austria/individual/other-taxes",
    "tax_summary",
    "2026-07-23",
  ),
  resource(
    "austria-vienna-airport-resource",
    "airport",
    "Vienna Airport passenger portal",
    "Official airport operations, check-in, and passenger-services reference.",
    "https://viennaairport.com/en/passengers",
    "official_site",
    "2026-07-24",
  ),
  resource(
    "austria-health-ministry-resource",
    "healthcare",
    "Austrian federal health topics",
    "Official health-policy and public-health orientation pages.",
    "https://www.sozialministerium.gv.at/en/Topics/Health.html",
    "government_portal",
    "2026-07-24",
  ),
  resource(
    "austria-emergency-numbers-resource",
    "safety",
    "Austria emergency numbers",
    "Official emergency numbers and service-line reference for police, fire, ambulance, and pan-European emergency contact.",
    "https://www.oesterreich.gv.at/en/themen/notfaelle_unfaelle_und_kriminalitaet/notrufnummern",
    "government_portal",
    "2026-07-24",
  ),
];

const GREECE_SLUGS = [
  "nafplio-greece",
  "kalamata-greece",
  "athens-greece",
  "ioannina-greece",
  "kardamyli-greece",
  "naxos-town-greece",
  "corfu-town-greece",
  "thessaloniki-greece",
  "syros-greece",
  "kavala-greece",
  "parga-greece",
  "chania-greece",
  "nafpaktos-greece",
  "preveza-greece",
  "rhodes-town-greece",
  "volos-greece",
  "monemvasia-greece",
  "rethymno-greece",
  "patras-greece",
  "agios-nikolaos-greece",
] as const;

const CROATIA_SLUGS = [
  "rijeka-croatia",
  "zadar-croatia",
  "rovinj-croatia",
  "sibenik-croatia",
  "dubrovnik-croatia",
  "cavtat-croatia",
  "novigrad-croatia",
  "trogir-croatia",
  "korcula-town-croatia",
  "mali-losinj-croatia",
  "hvar-town-croatia",
  "pula-croatia",
  "split-croatia",
  "makarska-croatia",
  "varazdin-croatia",
  "zagreb-croatia",
  "primosten-croatia",
  "porec-croatia",
  "opatija-croatia",
  "osijek-croatia",
] as const;

const JAPAN_SLUGS = [
  "kanazawa-japan",
  "osaka-japan",
  "hiroshima-japan",
  "kobe-japan",
  "hakodate-japan",
  "onomichi-japan",
  "takayama-japan",
  "aomori-japan",
  "kamakura-japan",
  "kumamoto-japan",
  "beppu-japan",
  "sapporo-japan",
  "matsumoto-japan",
  "kyoto-japan",
  "morioka-japan",
  "sendai-japan",
  "nagasaki-japan",
  "toyama-japan",
  "fukuoka-japan",
  "naha-japan",
  "niigata-japan",
  "kagoshima-japan",
  "miyazaki-japan",
  "okayama-japan",
  "kurashiki-japan",
  "yokohama-japan",
  "oita-japan",
  "nagoya-japan",
  "nara-japan",
  "tokyo-japan",
] as const;

const ITALY_SLUGS = [
  "monopoli-italy",
  "matera-italy",
  "trieste-italy",
  "lucca-italy",
  "polignano-a-mare-italy",
  "cefalu-italy",
  "taormina-italy",
  "bergamo-italy",
  "pietrasanta-italy",
  "verona-italy",
  "olbia-italy",
  "alghero-italy",
  "desenzano-del-garda-italy",
  "lecce-italy",
  "sirmione-italy",
  "perugia-italy",
  "siracusa-italy",
  "bari-italy",
  "cagliari-italy",
  "salerno-italy",
  "riva-del-garda-italy",
  "cortona-italy",
  "padua-italy",
  "udine-italy",
  "la-spezia-italy",
  "asolo-italy",
  "arezzo-italy",
  "spoleto-italy",
  "stresa-italy",
  "catania-italy",
  "palermo-italy",
  "varenna-italy",
  "genoa-italy",
  "rapallo-italy",
  "modena-italy",
  "bolzano-italy",
  "treviso-italy",
  "camogli-italy",
  "pietra-ligure-italy",
  "parma-italy",
  "como-italy",
  "bassano-del-grappa-italy",
  "mantua-italy",
  "siena-italy",
  "santa-margherita-ligure-italy",
  "aosta-italy",
  "vicenza-italy",
  "ferrara-italy",
  "ravenna-italy",
  "levanto-italy",
  "trento-italy",
  "merano-italy",
  "belluno-italy",
  "orvieto-italy",
  "bologna-italy",
  "lake-garda-italy",
  "turin-italy",
  "rome-italy",
  "florence-italy",
  "milan-italy",
] as const;

const PORTUGAL_SLUGS = [
  "braga-portugal",
  "porto-portugal",
  "coimbra-portugal",
  "lagos-portugal",
  "leiria-portugal",
  "sesimbra-portugal",
  "loule-portugal",
  "cascais-portugal",
  "viana-do-castelo-portugal",
  "faro-portugal",
  "obidos-portugal",
  "albufeira-portugal",
  "tomar-portugal",
  "ericeira-portugal",
  "tavira-portugal",
  "evora-portugal",
  "caminha-portugal",
  "sintra-portugal",
  "funchal-portugal",
  "ponta-delgada-portugal",
  "setubal-portugal",
  "angra-do-heroismo-portugal",
  "vila-real-de-santo-antonio-portugal",
  "portimao-portugal",
  "nazare-portugal",
  "figueira-da-foz-portugal",
  "aveiro-portugal",
  "guimaraes-portugal",
  "lisbon-portugal",
] as const;

const SPAIN_SLUGS = [
  "valencia-spain",
  "santander-spain",
  "alicante-spain",
  "sitges-spain",
  "estepona-spain",
  "cartagena-spain",
  "gijon-spain",
  "girona-spain",
  "murcia-spain",
  "oviedo-spain",
  "malaga-spain",
  "madrid-spain",
  "santa-cruz-de-tenerife-spain",
  "san-sebastian-spain",
  "a-coruna-spain",
  "tarragona-spain",
  "toledo-spain",
  "cordoba-spain",
  "las-palmas-spain",
  "marbella-spain",
  "salamanca-spain",
  "fuengirola-spain",
  "nerja-spain",
  "altea-spain",
  "zaragoza-spain",
  "seville-spain",
  "llanes-spain",
  "tossa-de-mar-spain",
  "segovia-spain",
  "cadiz-spain",
  "granada-spain",
  "ronda-spain",
  "cadaques-spain",
  "soller-spain",
  "mahon-spain",
  "comillas-spain",
  "vigo-spain",
  "bilbao-spain",
  "valladolid-spain",
  "leon-spain",
  "logrono-spain",
  "pamplona-spain",
  "burgos-spain",
  "jerez-de-la-frontera-spain",
  "frigiliana-spain",
  "hondarribia-spain",
  "begur-spain",
  "palma-de-mallorca-spain",
  "barcelona-spain",
] as const;

const FRANCE_SLUGS = [
  "aix-en-provence-france",
  "annecy-france",
  "lyon-france",
  "arles-france",
  "perpignan-france",
  "sete-france",
  "la-rochelle-france",
  "besancon-france",
  "strasbourg-france",
  "antibes-france",
  "carcassonne-france",
  "biarritz-france",
  "pau-france",
  "collioure-france",
  "chambery-france",
  "saint-malo-france",
  "toulon-france",
  "avignon-france",
  "saint-remy-de-provence-france",
  "bayonne-france",
  "bordeaux-france",
  "rouen-france",
  "reims-france",
  "tours-france",
  "clermont-ferrand-france",
  "menton-france",
  "vannes-france",
  "dinan-france",
  "aix-les-bains-france",
  "colmar-france",
  "uzes-france",
  "nimes-france",
  "honfleur-france",
  "chamonix-france",
  "dijon-france",
  "grenoble-france",
  "montpellier-france",
  "cassis-france",
  "nantes-france",
  "nice-france",
] as const;

const SWITZERLAND_SLUGS = [
  "lausanne-switzerland",
  "locarno-switzerland",
  "ascona-switzerland",
  "montreux-switzerland",
  "lugano-switzerland",
  "basel-switzerland",
  "lucerne-switzerland",
  "bern-switzerland",
  "zurich-switzerland",
  "geneva-switzerland",
] as const;

const SLOVENIA_SLUGS = [
  "piran-slovenia",
  "radovljica-slovenia",
  "lake-bled-slovenia",
  "ptuj-slovenia",
  "koper-slovenia",
  "kranj-slovenia",
  "celje-slovenia",
  "maribor-slovenia",
  "ljubljana-slovenia",
  "izola-slovenia",
] as const;

const AUSTRIA_SLUGS = [
  "vienna-austria",
  "linz-austria",
  "klagenfurt-austria",
  "graz-austria",
  "hallstatt-austria",
  "innsbruck-austria",
  "bregenz-austria",
  "salzburg-austria",
] as const;

const makeGreeceRegionalSeed = (): LocalCommandCenterSeed => ({
  region: "Greece",
  lastVerifiedAt: "2026-07-24",
  airports: greeceAirportRows,
  healthcareFacilities: greeceHealthcareRows,
  visaPrograms: greeceVisaRows,
  taxRules: greeceTaxRows,
  resources: greeceCommonResources,
});

const makeCroatiaRegionalSeed = (): LocalCommandCenterSeed => ({
  region: "Croatia",
  lastVerifiedAt: "2026-07-24",
  airports: croatiaAirportRows,
  healthcareFacilities: croatiaHealthcareRows,
  visaPrograms: croatiaVisaRows,
  taxRules: croatiaTaxRows,
  resources: croatiaCommonResources,
});

const makeJapanRegionalSeed = (): LocalCommandCenterSeed => ({
  region: "Japan",
  lastVerifiedAt: "2026-07-24",
  airports: japanAirportRows,
  healthcareFacilities: japanHealthcareRows,
  visaPrograms: japanVisaRows,
  taxRules: japanTaxRows,
  resources: japanCommonResources,
});

const makeItalyRegionalSeed = (): LocalCommandCenterSeed => ({
  region: "Italy",
  lastVerifiedAt: "2026-07-24",
  airports: italyAirportRows,
  visaPrograms: italyVisaRows,
  taxRules: italyTaxRows,
  resources: [...italyCommonResources],
});

const makePortugalRegionalSeed = (): LocalCommandCenterSeed => ({
  region: "Portugal",
  lastVerifiedAt: "2026-07-24",
  airports: portugalAirportRows,
  healthcareFacilities: portugalHealthcareRows,
  visaPrograms: portugalVisaRows,
  taxRules: portugalTaxRows,
  resources: [...portugalCommonResources],
});

const makeSpainRegionalSeed = (): LocalCommandCenterSeed => ({
  region: "Spain",
  lastVerifiedAt: "2026-07-24",
  airports: spainAirportRows,
  healthcareFacilities: spainHealthcareRows,
  visaPrograms: spainVisaRows,
  taxRules: spainTaxRows,
  resources: [...spainCommonResources],
});

const makeFranceRegionalSeed = (): LocalCommandCenterSeed => ({
  region: "France",
  lastVerifiedAt: "2026-07-24",
  airports: franceAirportRows,
  healthcareFacilities: franceHealthcareRows,
  visaPrograms: franceVisaRows,
  taxRules: franceTaxRows,
  resources: [...franceCommonResources],
});

const makeSwitzerlandRegionalSeed = (): LocalCommandCenterSeed => ({
  region: "Switzerland",
  lastVerifiedAt: "2026-07-24",
  airports: switzerlandAirportRows,
  healthcareFacilities: switzerlandHealthcareRows,
  visaPrograms: switzerlandVisaRows,
  taxRules: switzerlandTaxRows,
  resources: [...switzerlandCommonResources],
});

const makeSloveniaRegionalSeed = (): LocalCommandCenterSeed => ({
  region: "Slovenia",
  lastVerifiedAt: "2026-07-24",
  airports: sloveniaAirportRows,
  healthcareFacilities: sloveniaHealthcareRows,
  visaPrograms: sloveniaVisaRows,
  taxRules: sloveniaTaxRows,
  resources: [...sloveniaCommonResources],
});

const makeAustriaRegionalSeed = (): LocalCommandCenterSeed => ({
  region: "Austria",
  lastVerifiedAt: "2026-07-24",
  airports: austriaAirportRows,
  healthcareFacilities: austriaHealthcareRows,
  visaPrograms: austriaVisaRows,
  taxRules: austriaTaxRows,
  resources: [...austriaCommonResources],
});

export const REGIONAL_COMMAND_CENTER_SEEDS: Record<string, LocalCommandCenterSeed> = {
  "kotor-montenegro": {
    region: "Bay of Kotor / Coastal Montenegro",
    lastVerifiedAt: "2026-07-24",
    airports: [
      row(
        "kotor-tivat-airport",
        "Tivat Airport (TIV / LYTV)",
        "Regional international airport",
        "Tivat Airport is about 7 km from Kotor city center.",
        "Public airport operated by Airports of Montenegro.",
        "Year-round Belgrade and Istanbul links plus broad seasonal network.",
        "https://en.wikipedia.org/wiki/Tivat_Airport",
        tivatAirportVerification,
      ),
    ],
    healthcareFacilities: [
      row(
        "kotor-general-hospital",
        "General Hospital Kotor",
        "Public general hospital",
        "Named hospital resource in the immediate Bay of Kotor catchment.",
        "Official site: generalhospitalkotor.me",
        "Use for department, emergency, and specialty verification.",
        "https://www.generalhospitalkotor.me/",
        kotorHospitalVerification,
      ),
    ],
    schools: [
      row(
        "kotor-ksi-montenegro",
        "KSI Montenegro",
        "Regional IB day and boarding option",
        "Only authorised IB World School in Montenegro offering three IB programmes.",
        "Campus address: Seljanovo bb, Porto Montenegro, Tivat.",
        "Relevant family-education option for Bay of Kotor relocations.",
        "https://www.ksi-montenegro.com/",
        ksiVerification,
      ),
    ],
    recreationFacilities: [
      row(
        "kotor-porto-montenegro-marina",
        "Porto Montenegro Marina",
        "Nearby premium marina and leisure hub",
        ">500 berths for yachts up to 250 metres.",
        "Tax-free fuel and year-round marina operations.",
        "Useful for yachting, retail, dining, and business-club access from Kotor.",
        "https://www.portomontenegro.com/marina/",
        portoVerification,
      ),
    ],
    visaPrograms: montenegroVisaRows,
    taxRules: montenegroTaxRows,
    resources: montenegroCommonResources,
  },
  "perast-montenegro": {
    region: "Bay of Kotor / Coastal Montenegro",
    lastVerifiedAt: "2026-07-24",
    airports: [
      row(
        "perast-tivat-airport",
        "Tivat Airport (TIV / LYTV)",
        "Regional international airport for Bay of Kotor access",
        "Primary airport gateway for the Bay of Kotor region.",
        "Public airport operated by Airports of Montenegro.",
        "Seasonal coastal traffic is heavy; plan arrival and transfer timing carefully.",
        "https://en.wikipedia.org/wiki/Tivat_Airport",
        tivatAirportVerification,
      ),
    ],
    healthcareFacilities: [
      row(
        "perast-general-hospital-kotor",
        "General Hospital Kotor",
        "Nearest named general hospital resource",
        "Kotor is the immediate hospital reference point for Bay settlements.",
        "Official site: generalhospitalkotor.me",
        "Use the official site to validate services and specialties.",
        "https://www.generalhospitalkotor.me/",
        kotorHospitalVerification,
      ),
    ],
    schools: [
      row(
        "perast-ksi-montenegro",
        "KSI Montenegro",
        "Regional IB day and boarding option",
        "Only authorised IB World School in Montenegro offering three IB programmes.",
        "Address: Seljanovo bb, Porto Montenegro, Tivat.",
        "Relevant for Bay of Kotor family relocations.",
        "https://www.ksi-montenegro.com/",
        ksiVerification,
      ),
    ],
    visaPrograms: montenegroVisaRows,
    taxRules: montenegroTaxRows,
    resources: montenegroCommonResources,
  },
  "herceg-novi-montenegro": {
    region: "Bay of Kotor / Coastal Montenegro",
    lastVerifiedAt: "2026-07-24",
    airports: [
      row(
        "herceg-novi-tivat-airport",
        "Tivat Airport (TIV / LYTV)",
        "Regional international airport",
        "Tivat is about 19 km from Herceg Novi by municipal reference distance.",
        "Kamenari-Lepetane ferry can reduce the need to drive around the full bay.",
        "Plan airport routing around seasonal traffic and ferry timing.",
        "https://en.wikipedia.org/wiki/Tivat",
        tivatGeoVerification,
      ),
    ],
    schools: [
      row(
        "herceg-novi-ksi-montenegro",
        "KSI Montenegro",
        "Regional IB day and boarding option",
        "Only authorised IB World School in Montenegro offering three IB programmes.",
        "Boarding makes it relevant even when the daily commute is not ideal.",
        "Address: Seljanovo bb, Porto Montenegro, Tivat.",
        "https://www.ksi-montenegro.com/",
        ksiVerification,
      ),
    ],
    recreationFacilities: [
      row(
        "herceg-novi-ferry",
        "Kamenari-Lepetane Ferry",
        "Bay crossing transport link",
        "Eliminates the need to go all the way around Boka Kotorska Bay.",
        "Important for west-bay routing toward Tivat Airport and central bay amenities.",
        "Useful in practical relocation mobility planning.",
        "https://en.wikipedia.org/wiki/Tivat",
        tivatGeoVerification,
      ),
    ],
    visaPrograms: montenegroVisaRows,
    taxRules: montenegroTaxRows,
    resources: montenegroCommonResources,
  },
  "budva-montenegro": {
    region: "Coastal Montenegro",
    lastVerifiedAt: "2026-07-24",
    airports: [
      row(
        "budva-tivat-airport",
        "Tivat Airport (TIV / LYTV)",
        "Nearest major coastal airport",
        "Tivat Airport is about 20 km north-west of Budva.",
        "Public airport with strong seasonal coastal connectivity.",
        "Most relevant air gateway for Budva-area relocations.",
        "https://en.wikipedia.org/wiki/Tivat_Airport",
        tivatAirportVerification,
      ),
    ],
    schools: [
      row(
        "budva-ksi-montenegro",
        "KSI Montenegro",
        "Regional IB day and boarding option",
        "Only authorised IB World School in Montenegro offering three IB programmes.",
        "Boarding option broadens practicality for families outside Tivat itself.",
        "Address: Seljanovo bb, Porto Montenegro, Tivat.",
        "https://www.ksi-montenegro.com/",
        ksiVerification,
      ),
    ],
    healthcareFacilities: [
      row(
        "budva-general-hospital-kotor",
        "General Hospital Kotor",
        "Named regional hospital reference",
        "Useful named hospital reference inside the wider coastal catchment.",
        "Official site: generalhospitalkotor.me",
        "Use official sources to confirm departments before making neighborhood decisions.",
        "https://www.generalhospitalkotor.me/",
        kotorHospitalVerification,
      ),
    ],
    visaPrograms: montenegroVisaRows,
    taxRules: montenegroTaxRows,
    resources: montenegroCommonResources,
  },
  ...Object.fromEntries(GREECE_SLUGS.map((slug) => [slug, makeGreeceRegionalSeed()])),
  ...Object.fromEntries(CROATIA_SLUGS.map((slug) => [slug, makeCroatiaRegionalSeed()])),
  ...Object.fromEntries(JAPAN_SLUGS.map((slug) => [slug, makeJapanRegionalSeed()])),
  ...Object.fromEntries(ITALY_SLUGS.map((slug) => [slug, makeItalyRegionalSeed()])),
  ...Object.fromEntries(PORTUGAL_SLUGS.map((slug) => [slug, makePortugalRegionalSeed()])),
  ...Object.fromEntries(SPAIN_SLUGS.map((slug) => [slug, makeSpainRegionalSeed()])),
  ...Object.fromEntries(FRANCE_SLUGS.map((slug) => [slug, makeFranceRegionalSeed()])),
  ...Object.fromEntries(SWITZERLAND_SLUGS.map((slug) => [slug, makeSwitzerlandRegionalSeed()])),
  ...Object.fromEntries(SLOVENIA_SLUGS.map((slug) => [slug, makeSloveniaRegionalSeed()])),
  ...Object.fromEntries(AUSTRIA_SLUGS.map((slug) => [slug, makeAustriaRegionalSeed()])),
};