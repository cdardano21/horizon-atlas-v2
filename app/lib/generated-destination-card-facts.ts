export type GeneratedDestinationCardFacts = {
  summary: string;
  overallScore: number;
  scoreSignals: Array<{ category: string; score: number }>;
  facts: Array<{ label: string; value: string; sourceUrl?: string }>;
  lowCoverage: boolean;
  source: "merged_seed";
};

export const generatedDestinationCardFacts: Record<string, GeneratedDestinationCardFacts> = {
  "a-coruna-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "agios-nikolaos-greece": {
    "summary": "Greece. Nearest airport: Fraport Greece regional airport network - Corfu, Chania, Rhodes, Thessaloniki catchments connect through managed regional gateways. | Nearest airport: Athens International Airport (ATH) - Key long-haul and Schengen transfer node for Greek retiree travel logistics.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Fraport Greece regional airport network - Corfu, Chania, Rhodes, Thessaloniki catchments connect through managed regional gateways.",
        "sourceUrl": "https://www.fraport-greece.com/english/our-airports/"
      },
      {
        "label": "Nearest airport",
        "value": "Athens International Airport (ATH) - Key long-haul and Schengen transfer node for Greek retiree travel logistics.",
        "sourceUrl": "https://www.aia.gr/traveler/"
      },
      {
        "label": "Healthcare",
        "value": "EOPYY national health-services payer - EOPYY is the central organization coordinating reimbursed healthcare services in Greece.",
        "sourceUrl": "https://www.eopyy.gov.gr/"
      },
      {
        "label": "Healthcare",
        "value": "Emergency numbers and services (Greece) - Emergency number 112 and core emergency-service access guidance.",
        "sourceUrl": "https://www.gov.gr/en/sdg/travel-and-leisure/travel-outside-greece/emergency-numbers-and-services"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "aix-en-provence-france": {
    "summary": "France. Healthcare: France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures. | Healthcare: French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811"
      },
      {
        "label": "Healthcare",
        "value": "French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
        "sourceUrl": "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile"
      },
      {
        "label": "Residency",
        "value": "France-Visas official portal - Official portal for checking visa requirements, completing applications, and tracking status.",
        "sourceUrl": "https://france-visas.gouv.fr/en/"
      },
      {
        "label": "Residency",
        "value": "Residence permits and foreigner documents in France - Government directory of residence permits and stay-document pathways for foreign nationals in France.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N110"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "aix-les-bains-france": {
    "summary": "France. Healthcare: France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures. | Healthcare: French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811"
      },
      {
        "label": "Healthcare",
        "value": "French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
        "sourceUrl": "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile"
      },
      {
        "label": "Residency",
        "value": "France-Visas official portal - Official portal for checking visa requirements, completing applications, and tracking status.",
        "sourceUrl": "https://france-visas.gouv.fr/en/"
      },
      {
        "label": "Residency",
        "value": "Residence permits and foreigner documents in France - Government directory of residence permits and stay-document pathways for foreign nationals in France.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N110"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "albufeira-portugal": {
    "summary": "Portugal. Nearest airport: ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways. | Healthcare: SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways.",
        "sourceUrl": "https://www.ana.pt/en"
      },
      {
        "label": "Healthcare",
        "value": "SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
        "sourceUrl": "https://www.sns24.gov.pt/en/"
      },
      {
        "label": "Residency",
        "value": "AIMA migration authority - Primary authority for migration services and resident support pathways in Portugal.",
        "sourceUrl": "https://aima.gov.pt/en"
      },
      {
        "label": "Residency",
        "value": "gov.pt residence guidance - Official gov.pt guidance covers residence for up to and over 3 months and permanent-residence pathways.",
        "sourceUrl": "https://www2.gov.pt/en/cidadaos-europeus-viajar-viver-e-fazer-negocios-em-portugal/viver-em-portugal/residir-em-portugal"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "alesund-other-europe": {
    "summary": "Verification: Data verification in progress | Verification: Data verification in progress",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Verification",
        "value": "Data verification in progress"
      },
      {
        "label": "Verification",
        "value": "Data verification in progress"
      },
      {
        "label": "Verification",
        "value": "Data verification in progress"
      }
    ],
    "lowCoverage": true,
    "source": "merged_seed"
  },
  "alghero-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "alicante-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "altea-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "angra-do-heroismo-portugal": {
    "summary": "Portugal. Nearest airport: ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways. | Healthcare: SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways.",
        "sourceUrl": "https://www.ana.pt/en"
      },
      {
        "label": "Healthcare",
        "value": "SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
        "sourceUrl": "https://www.sns24.gov.pt/en/"
      },
      {
        "label": "Residency",
        "value": "AIMA migration authority - Primary authority for migration services and resident support pathways in Portugal.",
        "sourceUrl": "https://aima.gov.pt/en"
      },
      {
        "label": "Residency",
        "value": "gov.pt residence guidance - Official gov.pt guidance covers residence for up to and over 3 months and permanent-residence pathways.",
        "sourceUrl": "https://www2.gov.pt/en/cidadaos-europeus-viajar-viver-e-fazer-negocios-em-portugal/viver-em-portugal/residir-em-portugal"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "annecy-france": {
    "summary": "France. Healthcare: France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures. | Healthcare: French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811"
      },
      {
        "label": "Healthcare",
        "value": "French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
        "sourceUrl": "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile"
      },
      {
        "label": "Residency",
        "value": "France-Visas official portal - Official portal for checking visa requirements, completing applications, and tracking status.",
        "sourceUrl": "https://france-visas.gouv.fr/en/"
      },
      {
        "label": "Residency",
        "value": "Residence permits and foreigner documents in France - Government directory of residence permits and stay-document pathways for foreign nationals in France.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N110"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "antibes-france": {
    "summary": "France. Healthcare: France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures. | Healthcare: French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811"
      },
      {
        "label": "Healthcare",
        "value": "French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
        "sourceUrl": "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile"
      },
      {
        "label": "Residency",
        "value": "France-Visas official portal - Official portal for checking visa requirements, completing applications, and tracking status.",
        "sourceUrl": "https://france-visas.gouv.fr/en/"
      },
      {
        "label": "Residency",
        "value": "Residence permits and foreigner documents in France - Government directory of residence permits and stay-document pathways for foreign nationals in France.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N110"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "aomori-japan": {
    "summary": "Japan. Nearest airport: Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration. | Nearest airport: Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration.",
        "sourceUrl": "https://tokyo-haneda.com/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
        "sourceUrl": "https://www.narita-airport.jp/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Kansai International Airport (KIX) - Major international access node for Osaka, Kyoto, Kobe, and nearby regions.",
        "sourceUrl": "https://www.kansai-airport.or.jp/en/"
      },
      {
        "label": "Healthcare",
        "value": "Foreign resident support portal - Government support portal for foreigners living in Japan with links to medical care, pensions, tax, and local procedures.",
        "sourceUrl": "https://www.moj.go.jp/isa/support/portal/index.html"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "aosta-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "arezzo-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "arles-france": {
    "summary": "France. Healthcare: France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures. | Healthcare: French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811"
      },
      {
        "label": "Healthcare",
        "value": "French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
        "sourceUrl": "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile"
      },
      {
        "label": "Residency",
        "value": "France-Visas official portal - Official portal for checking visa requirements, completing applications, and tracking status.",
        "sourceUrl": "https://france-visas.gouv.fr/en/"
      },
      {
        "label": "Residency",
        "value": "Residence permits and foreigner documents in France - Government directory of residence permits and stay-document pathways for foreign nationals in France.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N110"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "ascona-switzerland": {
    "summary": "Switzerland. Nearest airport: Zurich Airport passenger portal - Official passenger portal with departures, arrivals, security guidance, and airport services. | Healthcare: Swiss health insurance framework - Government portal section describing mandatory health-insurance structure and related practical guidance.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Zurich Airport passenger portal - Official passenger portal with departures, arrivals, security guidance, and airport services.",
        "sourceUrl": "https://www.flughafen-zuerich.ch/en/passengers"
      },
      {
        "label": "Healthcare",
        "value": "Swiss health insurance framework - Government portal section describing mandatory health-insurance structure and related practical guidance.",
        "sourceUrl": "https://www.ch.ch/en/health/health-insurance"
      },
      {
        "label": "Healthcare",
        "value": "Swiss health-insurance premium calculator - Official premium-comparison portal for Swiss health-insurance planning and insurer comparison workflows.",
        "sourceUrl": "https://www.priminfo.admin.ch/"
      },
      {
        "label": "Residency",
        "value": "Switzerland entry requirements - Official federal source for entry requirements by nationality, visa pathways, and stay-length rules.",
        "sourceUrl": "https://www.sem.admin.ch/sem/en/home/themen/einreise.html"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "asolo-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "athens-greece": {
    "summary": "Greece. Nearest airport: Fraport Greece regional airport network - Corfu, Chania, Rhodes, Thessaloniki catchments connect through managed regional gateways. | Nearest airport: Athens International Airport (ATH) - Key long-haul and Schengen transfer node for Greek retiree travel logistics.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Fraport Greece regional airport network - Corfu, Chania, Rhodes, Thessaloniki catchments connect through managed regional gateways.",
        "sourceUrl": "https://www.fraport-greece.com/english/our-airports/"
      },
      {
        "label": "Nearest airport",
        "value": "Athens International Airport (ATH) - Key long-haul and Schengen transfer node for Greek retiree travel logistics.",
        "sourceUrl": "https://www.aia.gr/traveler/"
      },
      {
        "label": "Healthcare",
        "value": "EOPYY national health-services payer - EOPYY is the central organization coordinating reimbursed healthcare services in Greece.",
        "sourceUrl": "https://www.eopyy.gov.gr/"
      },
      {
        "label": "Healthcare",
        "value": "Emergency numbers and services (Greece) - Emergency number 112 and core emergency-service access guidance.",
        "sourceUrl": "https://www.gov.gr/en/sdg/travel-and-leisure/travel-outside-greece/emergency-numbers-and-services"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "aveiro-portugal": {
    "summary": "Portugal. Nearest airport: ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways. | Healthcare: SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways.",
        "sourceUrl": "https://www.ana.pt/en"
      },
      {
        "label": "Healthcare",
        "value": "SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
        "sourceUrl": "https://www.sns24.gov.pt/en/"
      },
      {
        "label": "Residency",
        "value": "AIMA migration authority - Primary authority for migration services and resident support pathways in Portugal.",
        "sourceUrl": "https://aima.gov.pt/en"
      },
      {
        "label": "Residency",
        "value": "gov.pt residence guidance - Official gov.pt guidance covers residence for up to and over 3 months and permanent-residence pathways.",
        "sourceUrl": "https://www2.gov.pt/en/cidadaos-europeus-viajar-viver-e-fazer-negocios-em-portugal/viver-em-portugal/residir-em-portugal"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "avignon-france": {
    "summary": "France. Healthcare: France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures. | Healthcare: French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811"
      },
      {
        "label": "Healthcare",
        "value": "French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
        "sourceUrl": "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile"
      },
      {
        "label": "Residency",
        "value": "France-Visas official portal - Official portal for checking visa requirements, completing applications, and tracking status.",
        "sourceUrl": "https://france-visas.gouv.fr/en/"
      },
      {
        "label": "Residency",
        "value": "Residence permits and foreigner documents in France - Government directory of residence permits and stay-document pathways for foreign nationals in France.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N110"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "barcelona-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "bari-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "basel-switzerland": {
    "summary": "Switzerland. Nearest airport: Zurich Airport passenger portal - Official passenger portal with departures, arrivals, security guidance, and airport services. | Healthcare: Swiss health insurance framework - Government portal section describing mandatory health-insurance structure and related practical guidance.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Zurich Airport passenger portal - Official passenger portal with departures, arrivals, security guidance, and airport services.",
        "sourceUrl": "https://www.flughafen-zuerich.ch/en/passengers"
      },
      {
        "label": "Healthcare",
        "value": "Swiss health insurance framework - Government portal section describing mandatory health-insurance structure and related practical guidance.",
        "sourceUrl": "https://www.ch.ch/en/health/health-insurance"
      },
      {
        "label": "Healthcare",
        "value": "Swiss health-insurance premium calculator - Official premium-comparison portal for Swiss health-insurance planning and insurer comparison workflows.",
        "sourceUrl": "https://www.priminfo.admin.ch/"
      },
      {
        "label": "Residency",
        "value": "Switzerland entry requirements - Official federal source for entry requirements by nationality, visa pathways, and stay-length rules.",
        "sourceUrl": "https://www.sem.admin.ch/sem/en/home/themen/einreise.html"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "bassano-del-grappa-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "bayonne-france": {
    "summary": "France. Healthcare: France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures. | Healthcare: French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811"
      },
      {
        "label": "Healthcare",
        "value": "French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
        "sourceUrl": "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile"
      },
      {
        "label": "Residency",
        "value": "France-Visas official portal - Official portal for checking visa requirements, completing applications, and tracking status.",
        "sourceUrl": "https://france-visas.gouv.fr/en/"
      },
      {
        "label": "Residency",
        "value": "Residence permits and foreigner documents in France - Government directory of residence permits and stay-document pathways for foreign nationals in France.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N110"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "begur-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "belluno-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "beppu-japan": {
    "summary": "Japan. Nearest airport: Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration. | Nearest airport: Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration.",
        "sourceUrl": "https://tokyo-haneda.com/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
        "sourceUrl": "https://www.narita-airport.jp/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Kansai International Airport (KIX) - Major international access node for Osaka, Kyoto, Kobe, and nearby regions.",
        "sourceUrl": "https://www.kansai-airport.or.jp/en/"
      },
      {
        "label": "Healthcare",
        "value": "Foreign resident support portal - Government support portal for foreigners living in Japan with links to medical care, pensions, tax, and local procedures.",
        "sourceUrl": "https://www.moj.go.jp/isa/support/portal/index.html"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "bergamo-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "bergen-other-europe": {
    "summary": "Verification: Data verification in progress | Verification: Data verification in progress",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Verification",
        "value": "Data verification in progress"
      },
      {
        "label": "Verification",
        "value": "Data verification in progress"
      },
      {
        "label": "Verification",
        "value": "Data verification in progress"
      }
    ],
    "lowCoverage": true,
    "source": "merged_seed"
  },
  "bern-switzerland": {
    "summary": "Switzerland. Nearest airport: Zurich Airport passenger portal - Official passenger portal with departures, arrivals, security guidance, and airport services. | Healthcare: Swiss health insurance framework - Government portal section describing mandatory health-insurance structure and related practical guidance.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Zurich Airport passenger portal - Official passenger portal with departures, arrivals, security guidance, and airport services.",
        "sourceUrl": "https://www.flughafen-zuerich.ch/en/passengers"
      },
      {
        "label": "Healthcare",
        "value": "Swiss health insurance framework - Government portal section describing mandatory health-insurance structure and related practical guidance.",
        "sourceUrl": "https://www.ch.ch/en/health/health-insurance"
      },
      {
        "label": "Healthcare",
        "value": "Swiss health-insurance premium calculator - Official premium-comparison portal for Swiss health-insurance planning and insurer comparison workflows.",
        "sourceUrl": "https://www.priminfo.admin.ch/"
      },
      {
        "label": "Residency",
        "value": "Switzerland entry requirements - Official federal source for entry requirements by nationality, visa pathways, and stay-length rules.",
        "sourceUrl": "https://www.sem.admin.ch/sem/en/home/themen/einreise.html"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "besancon-france": {
    "summary": "France. Healthcare: France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures. | Healthcare: French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811"
      },
      {
        "label": "Healthcare",
        "value": "French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
        "sourceUrl": "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile"
      },
      {
        "label": "Residency",
        "value": "France-Visas official portal - Official portal for checking visa requirements, completing applications, and tracking status.",
        "sourceUrl": "https://france-visas.gouv.fr/en/"
      },
      {
        "label": "Residency",
        "value": "Residence permits and foreigner documents in France - Government directory of residence permits and stay-document pathways for foreign nationals in France.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N110"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "biarritz-france": {
    "summary": "France. Healthcare: France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures. | Healthcare: French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811"
      },
      {
        "label": "Healthcare",
        "value": "French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
        "sourceUrl": "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile"
      },
      {
        "label": "Residency",
        "value": "France-Visas official portal - Official portal for checking visa requirements, completing applications, and tracking status.",
        "sourceUrl": "https://france-visas.gouv.fr/en/"
      },
      {
        "label": "Residency",
        "value": "Residence permits and foreigner documents in France - Government directory of residence permits and stay-document pathways for foreign nationals in France.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N110"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "bilbao-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "bologna-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "bolzano-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "bordeaux-france": {
    "summary": "France. Healthcare: France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures. | Healthcare: French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811"
      },
      {
        "label": "Healthcare",
        "value": "French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
        "sourceUrl": "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile"
      },
      {
        "label": "Residency",
        "value": "France-Visas official portal - Official portal for checking visa requirements, completing applications, and tracking status.",
        "sourceUrl": "https://france-visas.gouv.fr/en/"
      },
      {
        "label": "Residency",
        "value": "Residence permits and foreigner documents in France - Government directory of residence permits and stay-document pathways for foreign nationals in France.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N110"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "braga-portugal": {
    "summary": "Portugal. Nearest airport: ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways. | Healthcare: SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways.",
        "sourceUrl": "https://www.ana.pt/en"
      },
      {
        "label": "Healthcare",
        "value": "SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
        "sourceUrl": "https://www.sns24.gov.pt/en/"
      },
      {
        "label": "Residency",
        "value": "AIMA migration authority - Primary authority for migration services and resident support pathways in Portugal.",
        "sourceUrl": "https://aima.gov.pt/en"
      },
      {
        "label": "Residency",
        "value": "gov.pt residence guidance - Official gov.pt guidance covers residence for up to and over 3 months and permanent-residence pathways.",
        "sourceUrl": "https://www2.gov.pt/en/cidadaos-europeus-viajar-viver-e-fazer-negocios-em-portugal/viver-em-portugal/residir-em-portugal"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "bregenz-austria": {
    "summary": "Austria. Healthcare: Federal Ministry health topics - The ministry health section provides country-level public-health and health-system policy orientation. | Healthcare: Austria emergency numbers baseline - The official portal lists single European emergency number 112 and national response numbers.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Federal Ministry health topics - The ministry health section provides country-level public-health and health-system policy orientation.",
        "sourceUrl": "https://www.sozialministerium.gv.at/en/Topics/Health.html"
      },
      {
        "label": "Healthcare",
        "value": "Austria emergency numbers baseline - The official portal lists single European emergency number 112 and national response numbers.",
        "sourceUrl": "https://www.oesterreich.gv.at/en/themen/notfaelle_unfaelle_und_kriminalitaet/notrufnummern"
      },
      {
        "label": "Residency",
        "value": "Settlement and Residence Act (NAG) - The NAG framework governs planned stays over six months and residence-permit pathways for non-Austrian nationals.",
        "sourceUrl": "https://www.bmi.gv.at/312_en/start.html"
      },
      {
        "label": "Tax",
        "value": "Austria tax residence - A person is generally regarded as resident with the establishment of an abode.",
        "sourceUrl": "https://taxsummaries.pwc.com/austria/individual/residence"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "brno-other-europe": {
    "summary": "Verification: Data verification in progress | Verification: Data verification in progress",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Verification",
        "value": "Data verification in progress"
      },
      {
        "label": "Verification",
        "value": "Data verification in progress"
      },
      {
        "label": "Verification",
        "value": "Data verification in progress"
      }
    ],
    "lowCoverage": true,
    "source": "merged_seed"
  },
  "budapest-other-europe": {
    "summary": "Verification: Data verification in progress | Verification: Data verification in progress",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Verification",
        "value": "Data verification in progress"
      },
      {
        "label": "Verification",
        "value": "Data verification in progress"
      },
      {
        "label": "Verification",
        "value": "Data verification in progress"
      }
    ],
    "lowCoverage": true,
    "source": "merged_seed"
  },
  "budva-montenegro": {
    "summary": "Coastal Montenegro. Healthcare: General Hospital Kotor - Useful named hospital reference inside the wider coastal catchment. | Residency: Foreigners status issues portal - Official starting point for foreigners' status issues and residence-process verification.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "General Hospital Kotor - Useful named hospital reference inside the wider coastal catchment.",
        "sourceUrl": "https://www.generalhospitalkotor.me/"
      },
      {
        "label": "Residency",
        "value": "Foreigners status issues portal - Official starting point for foreigners' status issues and residence-process verification.",
        "sourceUrl": "https://mup.gov.me/en/ministry/Directorates_and_other_internal_organisational_units/administrative_affairs_citizenship_and_foreigners/status_issues/"
      },
      {
        "label": "Tax",
        "value": "Montenegro tax residence - Tax residence can be triggered by domicile / centre of personal and economic interests.",
        "sourceUrl": "https://taxsummaries.pwc.com/montenegro/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Montenegro VAT and salary contributions - General VAT rate: 21%.",
        "sourceUrl": "https://taxsummaries.pwc.com/montenegro/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "burgos-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "cadaques-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "cadiz-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "cagliari-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "caminha-portugal": {
    "summary": "Portugal. Nearest airport: ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways. | Healthcare: SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways.",
        "sourceUrl": "https://www.ana.pt/en"
      },
      {
        "label": "Healthcare",
        "value": "SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
        "sourceUrl": "https://www.sns24.gov.pt/en/"
      },
      {
        "label": "Residency",
        "value": "AIMA migration authority - Primary authority for migration services and resident support pathways in Portugal.",
        "sourceUrl": "https://aima.gov.pt/en"
      },
      {
        "label": "Residency",
        "value": "gov.pt residence guidance - Official gov.pt guidance covers residence for up to and over 3 months and permanent-residence pathways.",
        "sourceUrl": "https://www2.gov.pt/en/cidadaos-europeus-viajar-viver-e-fazer-negocios-em-portugal/viver-em-portugal/residir-em-portugal"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "camogli-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "carcassonne-france": {
    "summary": "France. Healthcare: France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures. | Healthcare: French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811"
      },
      {
        "label": "Healthcare",
        "value": "French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
        "sourceUrl": "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile"
      },
      {
        "label": "Residency",
        "value": "France-Visas official portal - Official portal for checking visa requirements, completing applications, and tracking status.",
        "sourceUrl": "https://france-visas.gouv.fr/en/"
      },
      {
        "label": "Residency",
        "value": "Residence permits and foreigner documents in France - Government directory of residence permits and stay-document pathways for foreign nationals in France.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N110"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "cartagena-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "cascais-portugal": {
    "summary": "Portugal. Nearest airport: ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways. | Healthcare: SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways.",
        "sourceUrl": "https://www.ana.pt/en"
      },
      {
        "label": "Healthcare",
        "value": "SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
        "sourceUrl": "https://www.sns24.gov.pt/en/"
      },
      {
        "label": "Residency",
        "value": "AIMA migration authority - Primary authority for migration services and resident support pathways in Portugal.",
        "sourceUrl": "https://aima.gov.pt/en"
      },
      {
        "label": "Residency",
        "value": "gov.pt residence guidance - Official gov.pt guidance covers residence for up to and over 3 months and permanent-residence pathways.",
        "sourceUrl": "https://www2.gov.pt/en/cidadaos-europeus-viajar-viver-e-fazer-negocios-em-portugal/viver-em-portugal/residir-em-portugal"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "cassis-france": {
    "summary": "France. Healthcare: France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures. | Healthcare: French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811"
      },
      {
        "label": "Healthcare",
        "value": "French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
        "sourceUrl": "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile"
      },
      {
        "label": "Residency",
        "value": "France-Visas official portal - Official portal for checking visa requirements, completing applications, and tracking status.",
        "sourceUrl": "https://france-visas.gouv.fr/en/"
      },
      {
        "label": "Residency",
        "value": "Residence permits and foreigner documents in France - Government directory of residence permits and stay-document pathways for foreign nationals in France.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N110"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "catania-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "cavtat-croatia": {
    "summary": "Croatia. Nearest airport: Zagreb Airport (ZAG) - Key year-round network node for inland and coastal onward connections. | Nearest airport: Split Airport (SPU) - Core Dalmatian air gateway with significant seasonal route expansion.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Zagreb Airport (ZAG) - Key year-round network node for inland and coastal onward connections.",
        "sourceUrl": "https://www.zag.aero/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Split Airport (SPU) - Core Dalmatian air gateway with significant seasonal route expansion.",
        "sourceUrl": "https://www.split-airport.hr/index.php?lang=en"
      },
      {
        "label": "Healthcare",
        "value": "Croatian Health Insurance Fund (HZZO) - HZZO is the country-level institution for health insurance administration and coverage information.",
        "sourceUrl": "https://hzzo.hr/en/"
      },
      {
        "label": "Healthcare",
        "value": "Emergency numbers in Croatia - 112 is the common free emergency number for ambulance, fire/rescue, and police services.",
        "sourceUrl": "https://vlada.gov.hr/need-emergency-help/16125"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "cefalu-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "celje-slovenia": {
    "summary": "Slovenia. Healthcare: National Institute of Public Health (NIJZ) - NIJZ provides public-health information, prevention content, and health-system resources in Slovenia. | Healthcare: Emergency notification and rescue system - Slovenia's emergency-notification centres operate 24/7 and respond to 112 emergency calls.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "National Institute of Public Health (NIJZ) - NIJZ provides public-health information, prevention content, and health-system resources in Slovenia.",
        "sourceUrl": "https://nijz.si/en"
      },
      {
        "label": "Healthcare",
        "value": "Emergency notification and rescue system - Slovenia's emergency-notification centres operate 24/7 and respond to 112 emergency calls.",
        "sourceUrl": "https://www.gov.si/en/policies/defence-civil-protection-and-public-order/protection-against-natural-and-other-disasters/"
      },
      {
        "label": "Residency",
        "value": "Immigration to Slovenia - Official policy page covering entry, residence permits, and core foreigner pathways in Slovenia.",
        "sourceUrl": "https://www.gov.si/en/policies/state-and-society/immigration-to-slovenia/"
      },
      {
        "label": "Tax",
        "value": "Slovenia tax residence - Residence can be established via permanent residence, habitual abode, or center of personal and economic interests.",
        "sourceUrl": "https://taxsummaries.pwc.com/slovenia/individual/residence"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "chambery-france": {
    "summary": "France. Healthcare: France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures. | Healthcare: French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811"
      },
      {
        "label": "Healthcare",
        "value": "French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
        "sourceUrl": "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile"
      },
      {
        "label": "Residency",
        "value": "France-Visas official portal - Official portal for checking visa requirements, completing applications, and tracking status.",
        "sourceUrl": "https://france-visas.gouv.fr/en/"
      },
      {
        "label": "Residency",
        "value": "Residence permits and foreigner documents in France - Government directory of residence permits and stay-document pathways for foreign nationals in France.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N110"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "chamonix-france": {
    "summary": "France. Healthcare: France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures. | Healthcare: French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811"
      },
      {
        "label": "Healthcare",
        "value": "French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
        "sourceUrl": "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile"
      },
      {
        "label": "Residency",
        "value": "France-Visas official portal - Official portal for checking visa requirements, completing applications, and tracking status.",
        "sourceUrl": "https://france-visas.gouv.fr/en/"
      },
      {
        "label": "Residency",
        "value": "Residence permits and foreigner documents in France - Government directory of residence permits and stay-document pathways for foreign nationals in France.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N110"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "chania-greece": {
    "summary": "Greece. Nearest airport: Fraport Greece regional airport network - Corfu, Chania, Rhodes, Thessaloniki catchments connect through managed regional gateways. | Nearest airport: Athens International Airport (ATH) - Key long-haul and Schengen transfer node for Greek retiree travel logistics.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Fraport Greece regional airport network - Corfu, Chania, Rhodes, Thessaloniki catchments connect through managed regional gateways.",
        "sourceUrl": "https://www.fraport-greece.com/english/our-airports/"
      },
      {
        "label": "Nearest airport",
        "value": "Athens International Airport (ATH) - Key long-haul and Schengen transfer node for Greek retiree travel logistics.",
        "sourceUrl": "https://www.aia.gr/traveler/"
      },
      {
        "label": "Healthcare",
        "value": "EOPYY national health-services payer - EOPYY is the central organization coordinating reimbursed healthcare services in Greece.",
        "sourceUrl": "https://www.eopyy.gov.gr/"
      },
      {
        "label": "Healthcare",
        "value": "Emergency numbers and services (Greece) - Emergency number 112 and core emergency-service access guidance.",
        "sourceUrl": "https://www.gov.gr/en/sdg/travel-and-leisure/travel-outside-greece/emergency-numbers-and-services"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "clermont-ferrand-france": {
    "summary": "France. Healthcare: France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures. | Healthcare: French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811"
      },
      {
        "label": "Healthcare",
        "value": "French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
        "sourceUrl": "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile"
      },
      {
        "label": "Residency",
        "value": "France-Visas official portal - Official portal for checking visa requirements, completing applications, and tracking status.",
        "sourceUrl": "https://france-visas.gouv.fr/en/"
      },
      {
        "label": "Residency",
        "value": "Residence permits and foreigner documents in France - Government directory of residence permits and stay-document pathways for foreign nationals in France.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N110"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "coimbra-portugal": {
    "summary": "Portugal. Nearest airport: ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways. | Healthcare: SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways.",
        "sourceUrl": "https://www.ana.pt/en"
      },
      {
        "label": "Healthcare",
        "value": "SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
        "sourceUrl": "https://www.sns24.gov.pt/en/"
      },
      {
        "label": "Residency",
        "value": "AIMA migration authority - Primary authority for migration services and resident support pathways in Portugal.",
        "sourceUrl": "https://aima.gov.pt/en"
      },
      {
        "label": "Residency",
        "value": "gov.pt residence guidance - Official gov.pt guidance covers residence for up to and over 3 months and permanent-residence pathways.",
        "sourceUrl": "https://www2.gov.pt/en/cidadaos-europeus-viajar-viver-e-fazer-negocios-em-portugal/viver-em-portugal/residir-em-portugal"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "collioure-france": {
    "summary": "France. Healthcare: France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures. | Healthcare: French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811"
      },
      {
        "label": "Healthcare",
        "value": "French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
        "sourceUrl": "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile"
      },
      {
        "label": "Residency",
        "value": "France-Visas official portal - Official portal for checking visa requirements, completing applications, and tracking status.",
        "sourceUrl": "https://france-visas.gouv.fr/en/"
      },
      {
        "label": "Residency",
        "value": "Residence permits and foreigner documents in France - Government directory of residence permits and stay-document pathways for foreign nationals in France.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N110"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "colmar-france": {
    "summary": "France. Healthcare: France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures. | Healthcare: French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811"
      },
      {
        "label": "Healthcare",
        "value": "French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
        "sourceUrl": "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile"
      },
      {
        "label": "Residency",
        "value": "France-Visas official portal - Official portal for checking visa requirements, completing applications, and tracking status.",
        "sourceUrl": "https://france-visas.gouv.fr/en/"
      },
      {
        "label": "Residency",
        "value": "Residence permits and foreigner documents in France - Government directory of residence permits and stay-document pathways for foreign nationals in France.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N110"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "comillas-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "como-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "copenhagen-other-europe": {
    "summary": "Verification: Data verification in progress | Verification: Data verification in progress",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Verification",
        "value": "Data verification in progress"
      },
      {
        "label": "Verification",
        "value": "Data verification in progress"
      },
      {
        "label": "Verification",
        "value": "Data verification in progress"
      }
    ],
    "lowCoverage": true,
    "source": "merged_seed"
  },
  "cordoba-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "corfu-town-greece": {
    "summary": "Greece. Nearest airport: Fraport Greece regional airport network - Corfu, Chania, Rhodes, Thessaloniki catchments connect through managed regional gateways. | Nearest airport: Athens International Airport (ATH) - Key long-haul and Schengen transfer node for Greek retiree travel logistics.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Fraport Greece regional airport network - Corfu, Chania, Rhodes, Thessaloniki catchments connect through managed regional gateways.",
        "sourceUrl": "https://www.fraport-greece.com/english/our-airports/"
      },
      {
        "label": "Nearest airport",
        "value": "Athens International Airport (ATH) - Key long-haul and Schengen transfer node for Greek retiree travel logistics.",
        "sourceUrl": "https://www.aia.gr/traveler/"
      },
      {
        "label": "Healthcare",
        "value": "EOPYY national health-services payer - EOPYY is the central organization coordinating reimbursed healthcare services in Greece.",
        "sourceUrl": "https://www.eopyy.gov.gr/"
      },
      {
        "label": "Healthcare",
        "value": "Emergency numbers and services (Greece) - Emergency number 112 and core emergency-service access guidance.",
        "sourceUrl": "https://www.gov.gr/en/sdg/travel-and-leisure/travel-outside-greece/emergency-numbers-and-services"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "cortona-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "desenzano-del-garda-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "dijon-france": {
    "summary": "France. Healthcare: France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures. | Healthcare: French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811"
      },
      {
        "label": "Healthcare",
        "value": "French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
        "sourceUrl": "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile"
      },
      {
        "label": "Residency",
        "value": "France-Visas official portal - Official portal for checking visa requirements, completing applications, and tracking status.",
        "sourceUrl": "https://france-visas.gouv.fr/en/"
      },
      {
        "label": "Residency",
        "value": "Residence permits and foreigner documents in France - Government directory of residence permits and stay-document pathways for foreign nationals in France.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N110"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "dinan-france": {
    "summary": "France. Healthcare: France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures. | Healthcare: French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811"
      },
      {
        "label": "Healthcare",
        "value": "French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
        "sourceUrl": "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile"
      },
      {
        "label": "Residency",
        "value": "France-Visas official portal - Official portal for checking visa requirements, completing applications, and tracking status.",
        "sourceUrl": "https://france-visas.gouv.fr/en/"
      },
      {
        "label": "Residency",
        "value": "Residence permits and foreigner documents in France - Government directory of residence permits and stay-document pathways for foreign nationals in France.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N110"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "dubrovnik-croatia": {
    "summary": "Croatia. Nearest airport: Zagreb Airport (ZAG) - Key year-round network node for inland and coastal onward connections. | Nearest airport: Split Airport (SPU) - Core Dalmatian air gateway with significant seasonal route expansion.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Zagreb Airport (ZAG) - Key year-round network node for inland and coastal onward connections.",
        "sourceUrl": "https://www.zag.aero/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Split Airport (SPU) - Core Dalmatian air gateway with significant seasonal route expansion.",
        "sourceUrl": "https://www.split-airport.hr/index.php?lang=en"
      },
      {
        "label": "Healthcare",
        "value": "Croatian Health Insurance Fund (HZZO) - HZZO is the country-level institution for health insurance administration and coverage information.",
        "sourceUrl": "https://hzzo.hr/en/"
      },
      {
        "label": "Healthcare",
        "value": "Emergency numbers in Croatia - 112 is the common free emergency number for ambulance, fire/rescue, and police services.",
        "sourceUrl": "https://vlada.gov.hr/need-emergency-help/16125"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "ericeira-portugal": {
    "summary": "Portugal. Nearest airport: ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways. | Healthcare: SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways.",
        "sourceUrl": "https://www.ana.pt/en"
      },
      {
        "label": "Healthcare",
        "value": "SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
        "sourceUrl": "https://www.sns24.gov.pt/en/"
      },
      {
        "label": "Residency",
        "value": "AIMA migration authority - Primary authority for migration services and resident support pathways in Portugal.",
        "sourceUrl": "https://aima.gov.pt/en"
      },
      {
        "label": "Residency",
        "value": "gov.pt residence guidance - Official gov.pt guidance covers residence for up to and over 3 months and permanent-residence pathways.",
        "sourceUrl": "https://www2.gov.pt/en/cidadaos-europeus-viajar-viver-e-fazer-negocios-em-portugal/viver-em-portugal/residir-em-portugal"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "estepona-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "evora-portugal": {
    "summary": "Portugal. Nearest airport: ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways. | Healthcare: SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways.",
        "sourceUrl": "https://www.ana.pt/en"
      },
      {
        "label": "Healthcare",
        "value": "SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
        "sourceUrl": "https://www.sns24.gov.pt/en/"
      },
      {
        "label": "Residency",
        "value": "AIMA migration authority - Primary authority for migration services and resident support pathways in Portugal.",
        "sourceUrl": "https://aima.gov.pt/en"
      },
      {
        "label": "Residency",
        "value": "gov.pt residence guidance - Official gov.pt guidance covers residence for up to and over 3 months and permanent-residence pathways.",
        "sourceUrl": "https://www2.gov.pt/en/cidadaos-europeus-viajar-viver-e-fazer-negocios-em-portugal/viver-em-portugal/residir-em-portugal"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "faro-portugal": {
    "summary": "Portugal. Nearest airport: ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways. | Healthcare: SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways.",
        "sourceUrl": "https://www.ana.pt/en"
      },
      {
        "label": "Healthcare",
        "value": "SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
        "sourceUrl": "https://www.sns24.gov.pt/en/"
      },
      {
        "label": "Residency",
        "value": "AIMA migration authority - Primary authority for migration services and resident support pathways in Portugal.",
        "sourceUrl": "https://aima.gov.pt/en"
      },
      {
        "label": "Residency",
        "value": "gov.pt residence guidance - Official gov.pt guidance covers residence for up to and over 3 months and permanent-residence pathways.",
        "sourceUrl": "https://www2.gov.pt/en/cidadaos-europeus-viajar-viver-e-fazer-negocios-em-portugal/viver-em-portugal/residir-em-portugal"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "ferrara-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "figueira-da-foz-portugal": {
    "summary": "Portugal. Nearest airport: ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways. | Healthcare: SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways.",
        "sourceUrl": "https://www.ana.pt/en"
      },
      {
        "label": "Healthcare",
        "value": "SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
        "sourceUrl": "https://www.sns24.gov.pt/en/"
      },
      {
        "label": "Residency",
        "value": "AIMA migration authority - Primary authority for migration services and resident support pathways in Portugal.",
        "sourceUrl": "https://aima.gov.pt/en"
      },
      {
        "label": "Residency",
        "value": "gov.pt residence guidance - Official gov.pt guidance covers residence for up to and over 3 months and permanent-residence pathways.",
        "sourceUrl": "https://www2.gov.pt/en/cidadaos-europeus-viajar-viver-e-fazer-negocios-em-portugal/viver-em-portugal/residir-em-portugal"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "florence-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "frigiliana-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "fuengirola-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "fukuoka-japan": {
    "summary": "Japan. Nearest airport: Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration. | Nearest airport: Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration.",
        "sourceUrl": "https://tokyo-haneda.com/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
        "sourceUrl": "https://www.narita-airport.jp/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Kansai International Airport (KIX) - Major international access node for Osaka, Kyoto, Kobe, and nearby regions.",
        "sourceUrl": "https://www.kansai-airport.or.jp/en/"
      },
      {
        "label": "Healthcare",
        "value": "Foreign resident support portal - Government support portal for foreigners living in Japan with links to medical care, pensions, tax, and local procedures.",
        "sourceUrl": "https://www.moj.go.jp/isa/support/portal/index.html"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "funchal-portugal": {
    "summary": "Portugal. Nearest airport: ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways. | Healthcare: SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways.",
        "sourceUrl": "https://www.ana.pt/en"
      },
      {
        "label": "Healthcare",
        "value": "SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
        "sourceUrl": "https://www.sns24.gov.pt/en/"
      },
      {
        "label": "Residency",
        "value": "AIMA migration authority - Primary authority for migration services and resident support pathways in Portugal.",
        "sourceUrl": "https://aima.gov.pt/en"
      },
      {
        "label": "Residency",
        "value": "gov.pt residence guidance - Official gov.pt guidance covers residence for up to and over 3 months and permanent-residence pathways.",
        "sourceUrl": "https://www2.gov.pt/en/cidadaos-europeus-viajar-viver-e-fazer-negocios-em-portugal/viver-em-portugal/residir-em-portugal"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "gdansk-other-europe": {
    "summary": "Verification: Data verification in progress | Verification: Data verification in progress",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Verification",
        "value": "Data verification in progress"
      },
      {
        "label": "Verification",
        "value": "Data verification in progress"
      },
      {
        "label": "Verification",
        "value": "Data verification in progress"
      }
    ],
    "lowCoverage": true,
    "source": "merged_seed"
  },
  "geneva-switzerland": {
    "summary": "Switzerland. Nearest airport: Zurich Airport passenger portal - Official passenger portal with departures, arrivals, security guidance, and airport services. | Healthcare: Swiss health insurance framework - Government portal section describing mandatory health-insurance structure and related practical guidance.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Zurich Airport passenger portal - Official passenger portal with departures, arrivals, security guidance, and airport services.",
        "sourceUrl": "https://www.flughafen-zuerich.ch/en/passengers"
      },
      {
        "label": "Healthcare",
        "value": "Swiss health insurance framework - Government portal section describing mandatory health-insurance structure and related practical guidance.",
        "sourceUrl": "https://www.ch.ch/en/health/health-insurance"
      },
      {
        "label": "Healthcare",
        "value": "Swiss health-insurance premium calculator - Official premium-comparison portal for Swiss health-insurance planning and insurer comparison workflows.",
        "sourceUrl": "https://www.priminfo.admin.ch/"
      },
      {
        "label": "Residency",
        "value": "Switzerland entry requirements - Official federal source for entry requirements by nationality, visa pathways, and stay-length rules.",
        "sourceUrl": "https://www.sem.admin.ch/sem/en/home/themen/einreise.html"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "genoa-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "gijon-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "girona-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "granada-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "graz-austria": {
    "summary": "Austria. Healthcare: Federal Ministry health topics - The ministry health section provides country-level public-health and health-system policy orientation. | Healthcare: Austria emergency numbers baseline - The official portal lists single European emergency number 112 and national response numbers.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Federal Ministry health topics - The ministry health section provides country-level public-health and health-system policy orientation.",
        "sourceUrl": "https://www.sozialministerium.gv.at/en/Topics/Health.html"
      },
      {
        "label": "Healthcare",
        "value": "Austria emergency numbers baseline - The official portal lists single European emergency number 112 and national response numbers.",
        "sourceUrl": "https://www.oesterreich.gv.at/en/themen/notfaelle_unfaelle_und_kriminalitaet/notrufnummern"
      },
      {
        "label": "Residency",
        "value": "Settlement and Residence Act (NAG) - The NAG framework governs planned stays over six months and residence-permit pathways for non-Austrian nationals.",
        "sourceUrl": "https://www.bmi.gv.at/312_en/start.html"
      },
      {
        "label": "Tax",
        "value": "Austria tax residence - A person is generally regarded as resident with the establishment of an abode.",
        "sourceUrl": "https://taxsummaries.pwc.com/austria/individual/residence"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "grenoble-france": {
    "summary": "France. Healthcare: France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures. | Healthcare: French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811"
      },
      {
        "label": "Healthcare",
        "value": "French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
        "sourceUrl": "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile"
      },
      {
        "label": "Residency",
        "value": "France-Visas official portal - Official portal for checking visa requirements, completing applications, and tracking status.",
        "sourceUrl": "https://france-visas.gouv.fr/en/"
      },
      {
        "label": "Residency",
        "value": "Residence permits and foreigner documents in France - Government directory of residence permits and stay-document pathways for foreign nationals in France.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N110"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "guimaraes-portugal": {
    "summary": "Portugal. Nearest airport: ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways. | Healthcare: SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways.",
        "sourceUrl": "https://www.ana.pt/en"
      },
      {
        "label": "Healthcare",
        "value": "SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
        "sourceUrl": "https://www.sns24.gov.pt/en/"
      },
      {
        "label": "Residency",
        "value": "AIMA migration authority - Primary authority for migration services and resident support pathways in Portugal.",
        "sourceUrl": "https://aima.gov.pt/en"
      },
      {
        "label": "Residency",
        "value": "gov.pt residence guidance - Official gov.pt guidance covers residence for up to and over 3 months and permanent-residence pathways.",
        "sourceUrl": "https://www2.gov.pt/en/cidadaos-europeus-viajar-viver-e-fazer-negocios-em-portugal/viver-em-portugal/residir-em-portugal"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "hakodate-japan": {
    "summary": "Japan. Nearest airport: Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration. | Nearest airport: Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration.",
        "sourceUrl": "https://tokyo-haneda.com/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
        "sourceUrl": "https://www.narita-airport.jp/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Kansai International Airport (KIX) - Major international access node for Osaka, Kyoto, Kobe, and nearby regions.",
        "sourceUrl": "https://www.kansai-airport.or.jp/en/"
      },
      {
        "label": "Healthcare",
        "value": "Foreign resident support portal - Government support portal for foreigners living in Japan with links to medical care, pensions, tax, and local procedures.",
        "sourceUrl": "https://www.moj.go.jp/isa/support/portal/index.html"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "hallstatt-austria": {
    "summary": "Austria. Healthcare: Federal Ministry health topics - The ministry health section provides country-level public-health and health-system policy orientation. | Healthcare: Austria emergency numbers baseline - The official portal lists single European emergency number 112 and national response numbers.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Federal Ministry health topics - The ministry health section provides country-level public-health and health-system policy orientation.",
        "sourceUrl": "https://www.sozialministerium.gv.at/en/Topics/Health.html"
      },
      {
        "label": "Healthcare",
        "value": "Austria emergency numbers baseline - The official portal lists single European emergency number 112 and national response numbers.",
        "sourceUrl": "https://www.oesterreich.gv.at/en/themen/notfaelle_unfaelle_und_kriminalitaet/notrufnummern"
      },
      {
        "label": "Residency",
        "value": "Settlement and Residence Act (NAG) - The NAG framework governs planned stays over six months and residence-permit pathways for non-Austrian nationals.",
        "sourceUrl": "https://www.bmi.gv.at/312_en/start.html"
      },
      {
        "label": "Tax",
        "value": "Austria tax residence - A person is generally regarded as resident with the establishment of an abode.",
        "sourceUrl": "https://taxsummaries.pwc.com/austria/individual/residence"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "helsinki-other-europe": {
    "summary": "Verification: Data verification in progress | Verification: Data verification in progress",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Verification",
        "value": "Data verification in progress"
      },
      {
        "label": "Verification",
        "value": "Data verification in progress"
      },
      {
        "label": "Verification",
        "value": "Data verification in progress"
      }
    ],
    "lowCoverage": true,
    "source": "merged_seed"
  },
  "herceg-novi-montenegro": {
    "summary": "Bay of Kotor / Coastal Montenegro. Residency: Foreigners status issues portal - Official starting point for foreigners' status issues and residence-process verification. | Tax: Montenegro tax residence - Tax residence can be triggered by domicile / centre of personal and economic interests.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Residency",
        "value": "Foreigners status issues portal - Official starting point for foreigners' status issues and residence-process verification.",
        "sourceUrl": "https://mup.gov.me/en/ministry/Directorates_and_other_internal_organisational_units/administrative_affairs_citizenship_and_foreigners/status_issues/"
      },
      {
        "label": "Tax",
        "value": "Montenegro tax residence - Tax residence can be triggered by domicile / centre of personal and economic interests.",
        "sourceUrl": "https://taxsummaries.pwc.com/montenegro/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Montenegro VAT and salary contributions - General VAT rate: 21%.",
        "sourceUrl": "https://taxsummaries.pwc.com/montenegro/individual/other-taxes"
      },
      {
        "label": "Schools",
        "value": "KSI Montenegro - Only authorised IB World School in Montenegro offering three IB programmes.",
        "sourceUrl": "https://www.ksi-montenegro.com/"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "hiroshima-japan": {
    "summary": "Japan. Nearest airport: Hiroshima Airport (HIJ) - Primary regional gateway for Hiroshima with direct airport-bus links to the city center. | Alternate airport: Iwakuni Kintaikyo Airport (IWK) - Useful domestic option for western Hiroshima and Miyajima-side routing.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Hiroshima Airport (HIJ) - Primary airport for Hiroshima Prefecture with direct limousine-bus access to central Hiroshima.",
        "sourceUrl": "https://www.hij.airport.jp/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Iwakuni Kintaikyo Airport (IWK) - Secondary airport option with domestic routes and practical access for western Hiroshima-area travel.",
        "sourceUrl": "https://www.iwakuni-airport.jp/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Fukuoka Airport (FUK) - Common international backup gateway reachable from Hiroshima by Shinkansen plus local transfer.",
        "sourceUrl": "https://www.fukuoka-airport.jp/en/"
      },
      {
        "label": "Healthcare",
        "value": "Foreign resident support portal - Government support portal for foreigners living in Japan with links to medical care, pensions, tax, and local procedures.",
        "sourceUrl": "https://www.moj.go.jp/isa/support/portal/index.html"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "hondarribia-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "honfleur-france": {
    "summary": "France. Healthcare: France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures. | Healthcare: French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811"
      },
      {
        "label": "Healthcare",
        "value": "French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
        "sourceUrl": "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile"
      },
      {
        "label": "Residency",
        "value": "France-Visas official portal - Official portal for checking visa requirements, completing applications, and tracking status.",
        "sourceUrl": "https://france-visas.gouv.fr/en/"
      },
      {
        "label": "Residency",
        "value": "Residence permits and foreigner documents in France - Government directory of residence permits and stay-document pathways for foreign nationals in France.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N110"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "hvar-town-croatia": {
    "summary": "Croatia. Nearest airport: Zagreb Airport (ZAG) - Key year-round network node for inland and coastal onward connections. | Nearest airport: Split Airport (SPU) - Core Dalmatian air gateway with significant seasonal route expansion.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Zagreb Airport (ZAG) - Key year-round network node for inland and coastal onward connections.",
        "sourceUrl": "https://www.zag.aero/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Split Airport (SPU) - Core Dalmatian air gateway with significant seasonal route expansion.",
        "sourceUrl": "https://www.split-airport.hr/index.php?lang=en"
      },
      {
        "label": "Healthcare",
        "value": "Croatian Health Insurance Fund (HZZO) - HZZO is the country-level institution for health insurance administration and coverage information.",
        "sourceUrl": "https://hzzo.hr/en/"
      },
      {
        "label": "Healthcare",
        "value": "Emergency numbers in Croatia - 112 is the common free emergency number for ambulance, fire/rescue, and police services.",
        "sourceUrl": "https://vlada.gov.hr/need-emergency-help/16125"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "innsbruck-austria": {
    "summary": "Austria. Healthcare: Federal Ministry health topics - The ministry health section provides country-level public-health and health-system policy orientation. | Healthcare: Austria emergency numbers baseline - The official portal lists single European emergency number 112 and national response numbers.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Federal Ministry health topics - The ministry health section provides country-level public-health and health-system policy orientation.",
        "sourceUrl": "https://www.sozialministerium.gv.at/en/Topics/Health.html"
      },
      {
        "label": "Healthcare",
        "value": "Austria emergency numbers baseline - The official portal lists single European emergency number 112 and national response numbers.",
        "sourceUrl": "https://www.oesterreich.gv.at/en/themen/notfaelle_unfaelle_und_kriminalitaet/notrufnummern"
      },
      {
        "label": "Residency",
        "value": "Settlement and Residence Act (NAG) - The NAG framework governs planned stays over six months and residence-permit pathways for non-Austrian nationals.",
        "sourceUrl": "https://www.bmi.gv.at/312_en/start.html"
      },
      {
        "label": "Tax",
        "value": "Austria tax residence - A person is generally regarded as resident with the establishment of an abode.",
        "sourceUrl": "https://taxsummaries.pwc.com/austria/individual/residence"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "ioannina-greece": {
    "summary": "Greece. Nearest airport: Fraport Greece regional airport network - Corfu, Chania, Rhodes, Thessaloniki catchments connect through managed regional gateways. | Nearest airport: Athens International Airport (ATH) - Key long-haul and Schengen transfer node for Greek retiree travel logistics.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Fraport Greece regional airport network - Corfu, Chania, Rhodes, Thessaloniki catchments connect through managed regional gateways.",
        "sourceUrl": "https://www.fraport-greece.com/english/our-airports/"
      },
      {
        "label": "Nearest airport",
        "value": "Athens International Airport (ATH) - Key long-haul and Schengen transfer node for Greek retiree travel logistics.",
        "sourceUrl": "https://www.aia.gr/traveler/"
      },
      {
        "label": "Healthcare",
        "value": "EOPYY national health-services payer - EOPYY is the central organization coordinating reimbursed healthcare services in Greece.",
        "sourceUrl": "https://www.eopyy.gov.gr/"
      },
      {
        "label": "Healthcare",
        "value": "Emergency numbers and services (Greece) - Emergency number 112 and core emergency-service access guidance.",
        "sourceUrl": "https://www.gov.gr/en/sdg/travel-and-leisure/travel-outside-greece/emergency-numbers-and-services"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "izola-slovenia": {
    "summary": "Slovenia. Healthcare: National Institute of Public Health (NIJZ) - NIJZ provides public-health information, prevention content, and health-system resources in Slovenia. | Healthcare: Emergency notification and rescue system - Slovenia's emergency-notification centres operate 24/7 and respond to 112 emergency calls.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "National Institute of Public Health (NIJZ) - NIJZ provides public-health information, prevention content, and health-system resources in Slovenia.",
        "sourceUrl": "https://nijz.si/en"
      },
      {
        "label": "Healthcare",
        "value": "Emergency notification and rescue system - Slovenia's emergency-notification centres operate 24/7 and respond to 112 emergency calls.",
        "sourceUrl": "https://www.gov.si/en/policies/defence-civil-protection-and-public-order/protection-against-natural-and-other-disasters/"
      },
      {
        "label": "Residency",
        "value": "Immigration to Slovenia - Official policy page covering entry, residence permits, and core foreigner pathways in Slovenia.",
        "sourceUrl": "https://www.gov.si/en/policies/state-and-society/immigration-to-slovenia/"
      },
      {
        "label": "Tax",
        "value": "Slovenia tax residence - Residence can be established via permanent residence, habitual abode, or center of personal and economic interests.",
        "sourceUrl": "https://taxsummaries.pwc.com/slovenia/individual/residence"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "jerez-de-la-frontera-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "kagoshima-japan": {
    "summary": "Japan. Nearest airport: Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration. | Nearest airport: Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration.",
        "sourceUrl": "https://tokyo-haneda.com/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
        "sourceUrl": "https://www.narita-airport.jp/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Kansai International Airport (KIX) - Major international access node for Osaka, Kyoto, Kobe, and nearby regions.",
        "sourceUrl": "https://www.kansai-airport.or.jp/en/"
      },
      {
        "label": "Healthcare",
        "value": "Foreign resident support portal - Government support portal for foreigners living in Japan with links to medical care, pensions, tax, and local procedures.",
        "sourceUrl": "https://www.moj.go.jp/isa/support/portal/index.html"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "kalamata-greece": {
    "summary": "Greece. Nearest airport: Fraport Greece regional airport network - Corfu, Chania, Rhodes, Thessaloniki catchments connect through managed regional gateways. | Nearest airport: Athens International Airport (ATH) - Key long-haul and Schengen transfer node for Greek retiree travel logistics.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Fraport Greece regional airport network - Corfu, Chania, Rhodes, Thessaloniki catchments connect through managed regional gateways.",
        "sourceUrl": "https://www.fraport-greece.com/english/our-airports/"
      },
      {
        "label": "Nearest airport",
        "value": "Athens International Airport (ATH) - Key long-haul and Schengen transfer node for Greek retiree travel logistics.",
        "sourceUrl": "https://www.aia.gr/traveler/"
      },
      {
        "label": "Healthcare",
        "value": "EOPYY national health-services payer - EOPYY is the central organization coordinating reimbursed healthcare services in Greece.",
        "sourceUrl": "https://www.eopyy.gov.gr/"
      },
      {
        "label": "Healthcare",
        "value": "Emergency numbers and services (Greece) - Emergency number 112 and core emergency-service access guidance.",
        "sourceUrl": "https://www.gov.gr/en/sdg/travel-and-leisure/travel-outside-greece/emergency-numbers-and-services"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "kamakura-japan": {
    "summary": "Japan. Nearest airport: Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration. | Nearest airport: Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration.",
        "sourceUrl": "https://tokyo-haneda.com/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
        "sourceUrl": "https://www.narita-airport.jp/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Kansai International Airport (KIX) - Major international access node for Osaka, Kyoto, Kobe, and nearby regions.",
        "sourceUrl": "https://www.kansai-airport.or.jp/en/"
      },
      {
        "label": "Healthcare",
        "value": "Foreign resident support portal - Government support portal for foreigners living in Japan with links to medical care, pensions, tax, and local procedures.",
        "sourceUrl": "https://www.moj.go.jp/isa/support/portal/index.html"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "kanazawa-japan": {
    "summary": "Japan. Nearest airport: Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration. | Nearest airport: Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration.",
        "sourceUrl": "https://tokyo-haneda.com/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
        "sourceUrl": "https://www.narita-airport.jp/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Kansai International Airport (KIX) - Major international access node for Osaka, Kyoto, Kobe, and nearby regions.",
        "sourceUrl": "https://www.kansai-airport.or.jp/en/"
      },
      {
        "label": "Healthcare",
        "value": "Foreign resident support portal - Government support portal for foreigners living in Japan with links to medical care, pensions, tax, and local procedures.",
        "sourceUrl": "https://www.moj.go.jp/isa/support/portal/index.html"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "kardamyli-greece": {
    "summary": "Greece. Nearest airport: Fraport Greece regional airport network - Corfu, Chania, Rhodes, Thessaloniki catchments connect through managed regional gateways. | Nearest airport: Athens International Airport (ATH) - Key long-haul and Schengen transfer node for Greek retiree travel logistics.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Fraport Greece regional airport network - Corfu, Chania, Rhodes, Thessaloniki catchments connect through managed regional gateways.",
        "sourceUrl": "https://www.fraport-greece.com/english/our-airports/"
      },
      {
        "label": "Nearest airport",
        "value": "Athens International Airport (ATH) - Key long-haul and Schengen transfer node for Greek retiree travel logistics.",
        "sourceUrl": "https://www.aia.gr/traveler/"
      },
      {
        "label": "Healthcare",
        "value": "EOPYY national health-services payer - EOPYY is the central organization coordinating reimbursed healthcare services in Greece.",
        "sourceUrl": "https://www.eopyy.gov.gr/"
      },
      {
        "label": "Healthcare",
        "value": "Emergency numbers and services (Greece) - Emergency number 112 and core emergency-service access guidance.",
        "sourceUrl": "https://www.gov.gr/en/sdg/travel-and-leisure/travel-outside-greece/emergency-numbers-and-services"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "kavala-greece": {
    "summary": "Greece. Nearest airport: Fraport Greece regional airport network - Corfu, Chania, Rhodes, Thessaloniki catchments connect through managed regional gateways. | Nearest airport: Athens International Airport (ATH) - Key long-haul and Schengen transfer node for Greek retiree travel logistics.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Fraport Greece regional airport network - Corfu, Chania, Rhodes, Thessaloniki catchments connect through managed regional gateways.",
        "sourceUrl": "https://www.fraport-greece.com/english/our-airports/"
      },
      {
        "label": "Nearest airport",
        "value": "Athens International Airport (ATH) - Key long-haul and Schengen transfer node for Greek retiree travel logistics.",
        "sourceUrl": "https://www.aia.gr/traveler/"
      },
      {
        "label": "Healthcare",
        "value": "EOPYY national health-services payer - EOPYY is the central organization coordinating reimbursed healthcare services in Greece.",
        "sourceUrl": "https://www.eopyy.gov.gr/"
      },
      {
        "label": "Healthcare",
        "value": "Emergency numbers and services (Greece) - Emergency number 112 and core emergency-service access guidance.",
        "sourceUrl": "https://www.gov.gr/en/sdg/travel-and-leisure/travel-outside-greece/emergency-numbers-and-services"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "klagenfurt-austria": {
    "summary": "Austria. Healthcare: Federal Ministry health topics - The ministry health section provides country-level public-health and health-system policy orientation. | Healthcare: Austria emergency numbers baseline - The official portal lists single European emergency number 112 and national response numbers.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Federal Ministry health topics - The ministry health section provides country-level public-health and health-system policy orientation.",
        "sourceUrl": "https://www.sozialministerium.gv.at/en/Topics/Health.html"
      },
      {
        "label": "Healthcare",
        "value": "Austria emergency numbers baseline - The official portal lists single European emergency number 112 and national response numbers.",
        "sourceUrl": "https://www.oesterreich.gv.at/en/themen/notfaelle_unfaelle_und_kriminalitaet/notrufnummern"
      },
      {
        "label": "Residency",
        "value": "Settlement and Residence Act (NAG) - The NAG framework governs planned stays over six months and residence-permit pathways for non-Austrian nationals.",
        "sourceUrl": "https://www.bmi.gv.at/312_en/start.html"
      },
      {
        "label": "Tax",
        "value": "Austria tax residence - A person is generally regarded as resident with the establishment of an abode.",
        "sourceUrl": "https://taxsummaries.pwc.com/austria/individual/residence"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "kobe-japan": {
    "summary": "Japan. Nearest airport: Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration. | Nearest airport: Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration.",
        "sourceUrl": "https://tokyo-haneda.com/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
        "sourceUrl": "https://www.narita-airport.jp/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Kansai International Airport (KIX) - Major international access node for Osaka, Kyoto, Kobe, and nearby regions.",
        "sourceUrl": "https://www.kansai-airport.or.jp/en/"
      },
      {
        "label": "Healthcare",
        "value": "Foreign resident support portal - Government support portal for foreigners living in Japan with links to medical care, pensions, tax, and local procedures.",
        "sourceUrl": "https://www.moj.go.jp/isa/support/portal/index.html"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "koper-slovenia": {
    "summary": "Slovenia. Healthcare: National Institute of Public Health (NIJZ) - NIJZ provides public-health information, prevention content, and health-system resources in Slovenia. | Healthcare: Emergency notification and rescue system - Slovenia's emergency-notification centres operate 24/7 and respond to 112 emergency calls.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "National Institute of Public Health (NIJZ) - NIJZ provides public-health information, prevention content, and health-system resources in Slovenia.",
        "sourceUrl": "https://nijz.si/en"
      },
      {
        "label": "Healthcare",
        "value": "Emergency notification and rescue system - Slovenia's emergency-notification centres operate 24/7 and respond to 112 emergency calls.",
        "sourceUrl": "https://www.gov.si/en/policies/defence-civil-protection-and-public-order/protection-against-natural-and-other-disasters/"
      },
      {
        "label": "Residency",
        "value": "Immigration to Slovenia - Official policy page covering entry, residence permits, and core foreigner pathways in Slovenia.",
        "sourceUrl": "https://www.gov.si/en/policies/state-and-society/immigration-to-slovenia/"
      },
      {
        "label": "Tax",
        "value": "Slovenia tax residence - Residence can be established via permanent residence, habitual abode, or center of personal and economic interests.",
        "sourceUrl": "https://taxsummaries.pwc.com/slovenia/individual/residence"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "korcula-town-croatia": {
    "summary": "Croatia. Nearest airport: Zagreb Airport (ZAG) - Key year-round network node for inland and coastal onward connections. | Nearest airport: Split Airport (SPU) - Core Dalmatian air gateway with significant seasonal route expansion.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Zagreb Airport (ZAG) - Key year-round network node for inland and coastal onward connections.",
        "sourceUrl": "https://www.zag.aero/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Split Airport (SPU) - Core Dalmatian air gateway with significant seasonal route expansion.",
        "sourceUrl": "https://www.split-airport.hr/index.php?lang=en"
      },
      {
        "label": "Healthcare",
        "value": "Croatian Health Insurance Fund (HZZO) - HZZO is the country-level institution for health insurance administration and coverage information.",
        "sourceUrl": "https://hzzo.hr/en/"
      },
      {
        "label": "Healthcare",
        "value": "Emergency numbers in Croatia - 112 is the common free emergency number for ambulance, fire/rescue, and police services.",
        "sourceUrl": "https://vlada.gov.hr/need-emergency-help/16125"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "kotor-montenegro": {
    "summary": "Bay of Kotor / Coastal Montenegro. Healthcare: General Hospital Kotor - Named hospital resource in the immediate Bay of Kotor catchment. | Residency: Foreigners status issues portal - Official starting point for foreigners' status issues and residence-process verification.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "General Hospital Kotor - Named hospital resource in the immediate Bay of Kotor catchment.",
        "sourceUrl": "https://www.generalhospitalkotor.me/"
      },
      {
        "label": "Residency",
        "value": "Foreigners status issues portal - Official starting point for foreigners' status issues and residence-process verification.",
        "sourceUrl": "https://mup.gov.me/en/ministry/Directorates_and_other_internal_organisational_units/administrative_affairs_citizenship_and_foreigners/status_issues/"
      },
      {
        "label": "Tax",
        "value": "Montenegro tax residence - Tax residence can be triggered by domicile / centre of personal and economic interests.",
        "sourceUrl": "https://taxsummaries.pwc.com/montenegro/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Montenegro VAT and salary contributions - General VAT rate: 21%.",
        "sourceUrl": "https://taxsummaries.pwc.com/montenegro/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "krakow-other-europe": {
    "summary": "Verification: Data verification in progress | Verification: Data verification in progress",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Verification",
        "value": "Data verification in progress"
      },
      {
        "label": "Verification",
        "value": "Data verification in progress"
      },
      {
        "label": "Verification",
        "value": "Data verification in progress"
      }
    ],
    "lowCoverage": true,
    "source": "merged_seed"
  },
  "kranj-slovenia": {
    "summary": "Slovenia. Healthcare: National Institute of Public Health (NIJZ) - NIJZ provides public-health information, prevention content, and health-system resources in Slovenia. | Healthcare: Emergency notification and rescue system - Slovenia's emergency-notification centres operate 24/7 and respond to 112 emergency calls.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "National Institute of Public Health (NIJZ) - NIJZ provides public-health information, prevention content, and health-system resources in Slovenia.",
        "sourceUrl": "https://nijz.si/en"
      },
      {
        "label": "Healthcare",
        "value": "Emergency notification and rescue system - Slovenia's emergency-notification centres operate 24/7 and respond to 112 emergency calls.",
        "sourceUrl": "https://www.gov.si/en/policies/defence-civil-protection-and-public-order/protection-against-natural-and-other-disasters/"
      },
      {
        "label": "Residency",
        "value": "Immigration to Slovenia - Official policy page covering entry, residence permits, and core foreigner pathways in Slovenia.",
        "sourceUrl": "https://www.gov.si/en/policies/state-and-society/immigration-to-slovenia/"
      },
      {
        "label": "Tax",
        "value": "Slovenia tax residence - Residence can be established via permanent residence, habitual abode, or center of personal and economic interests.",
        "sourceUrl": "https://taxsummaries.pwc.com/slovenia/individual/residence"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "kumamoto-japan": {
    "summary": "Japan. Nearest airport: Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration. | Nearest airport: Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration.",
        "sourceUrl": "https://tokyo-haneda.com/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
        "sourceUrl": "https://www.narita-airport.jp/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Kansai International Airport (KIX) - Major international access node for Osaka, Kyoto, Kobe, and nearby regions.",
        "sourceUrl": "https://www.kansai-airport.or.jp/en/"
      },
      {
        "label": "Healthcare",
        "value": "Foreign resident support portal - Government support portal for foreigners living in Japan with links to medical care, pensions, tax, and local procedures.",
        "sourceUrl": "https://www.moj.go.jp/isa/support/portal/index.html"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "kurashiki-japan": {
    "summary": "Japan. Nearest airport: Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration. | Nearest airport: Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration.",
        "sourceUrl": "https://tokyo-haneda.com/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
        "sourceUrl": "https://www.narita-airport.jp/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Kansai International Airport (KIX) - Major international access node for Osaka, Kyoto, Kobe, and nearby regions.",
        "sourceUrl": "https://www.kansai-airport.or.jp/en/"
      },
      {
        "label": "Healthcare",
        "value": "Foreign resident support portal - Government support portal for foreigners living in Japan with links to medical care, pensions, tax, and local procedures.",
        "sourceUrl": "https://www.moj.go.jp/isa/support/portal/index.html"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "kyoto-japan": {
    "summary": "Japan. Nearest airport: Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration. | Nearest airport: Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration.",
        "sourceUrl": "https://tokyo-haneda.com/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
        "sourceUrl": "https://www.narita-airport.jp/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Kansai International Airport (KIX) - Major international access node for Osaka, Kyoto, Kobe, and nearby regions.",
        "sourceUrl": "https://www.kansai-airport.or.jp/en/"
      },
      {
        "label": "Healthcare",
        "value": "Foreign resident support portal - Government support portal for foreigners living in Japan with links to medical care, pensions, tax, and local procedures.",
        "sourceUrl": "https://www.moj.go.jp/isa/support/portal/index.html"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "la-rochelle-france": {
    "summary": "France. Healthcare: France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures. | Healthcare: French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811"
      },
      {
        "label": "Healthcare",
        "value": "French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
        "sourceUrl": "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile"
      },
      {
        "label": "Residency",
        "value": "France-Visas official portal - Official portal for checking visa requirements, completing applications, and tracking status.",
        "sourceUrl": "https://france-visas.gouv.fr/en/"
      },
      {
        "label": "Residency",
        "value": "Residence permits and foreigner documents in France - Government directory of residence permits and stay-document pathways for foreign nationals in France.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N110"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "la-spezia-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "lagos-portugal": {
    "summary": "Portugal. Nearest airport: ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways. | Healthcare: SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways.",
        "sourceUrl": "https://www.ana.pt/en"
      },
      {
        "label": "Healthcare",
        "value": "SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
        "sourceUrl": "https://www.sns24.gov.pt/en/"
      },
      {
        "label": "Residency",
        "value": "AIMA migration authority - Primary authority for migration services and resident support pathways in Portugal.",
        "sourceUrl": "https://aima.gov.pt/en"
      },
      {
        "label": "Residency",
        "value": "gov.pt residence guidance - Official gov.pt guidance covers residence for up to and over 3 months and permanent-residence pathways.",
        "sourceUrl": "https://www2.gov.pt/en/cidadaos-europeus-viajar-viver-e-fazer-negocios-em-portugal/viver-em-portugal/residir-em-portugal"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "lake-bled-slovenia": {
    "summary": "Slovenia. Healthcare: National Institute of Public Health (NIJZ) - NIJZ provides public-health information, prevention content, and health-system resources in Slovenia. | Healthcare: Emergency notification and rescue system - Slovenia's emergency-notification centres operate 24/7 and respond to 112 emergency calls.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "National Institute of Public Health (NIJZ) - NIJZ provides public-health information, prevention content, and health-system resources in Slovenia.",
        "sourceUrl": "https://nijz.si/en"
      },
      {
        "label": "Healthcare",
        "value": "Emergency notification and rescue system - Slovenia's emergency-notification centres operate 24/7 and respond to 112 emergency calls.",
        "sourceUrl": "https://www.gov.si/en/policies/defence-civil-protection-and-public-order/protection-against-natural-and-other-disasters/"
      },
      {
        "label": "Residency",
        "value": "Immigration to Slovenia - Official policy page covering entry, residence permits, and core foreigner pathways in Slovenia.",
        "sourceUrl": "https://www.gov.si/en/policies/state-and-society/immigration-to-slovenia/"
      },
      {
        "label": "Tax",
        "value": "Slovenia tax residence - Residence can be established via permanent residence, habitual abode, or center of personal and economic interests.",
        "sourceUrl": "https://taxsummaries.pwc.com/slovenia/individual/residence"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "lake-garda-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "las-palmas-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "lausanne-switzerland": {
    "summary": "Switzerland. Nearest airport: Zurich Airport passenger portal - Official passenger portal with departures, arrivals, security guidance, and airport services. | Healthcare: Swiss health insurance framework - Government portal section describing mandatory health-insurance structure and related practical guidance.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Zurich Airport passenger portal - Official passenger portal with departures, arrivals, security guidance, and airport services.",
        "sourceUrl": "https://www.flughafen-zuerich.ch/en/passengers"
      },
      {
        "label": "Healthcare",
        "value": "Swiss health insurance framework - Government portal section describing mandatory health-insurance structure and related practical guidance.",
        "sourceUrl": "https://www.ch.ch/en/health/health-insurance"
      },
      {
        "label": "Healthcare",
        "value": "Swiss health-insurance premium calculator - Official premium-comparison portal for Swiss health-insurance planning and insurer comparison workflows.",
        "sourceUrl": "https://www.priminfo.admin.ch/"
      },
      {
        "label": "Residency",
        "value": "Switzerland entry requirements - Official federal source for entry requirements by nationality, visa pathways, and stay-length rules.",
        "sourceUrl": "https://www.sem.admin.ch/sem/en/home/themen/einreise.html"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "lecce-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "leiria-portugal": {
    "summary": "Portugal. Nearest airport: ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways. | Healthcare: SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways.",
        "sourceUrl": "https://www.ana.pt/en"
      },
      {
        "label": "Healthcare",
        "value": "SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
        "sourceUrl": "https://www.sns24.gov.pt/en/"
      },
      {
        "label": "Residency",
        "value": "AIMA migration authority - Primary authority for migration services and resident support pathways in Portugal.",
        "sourceUrl": "https://aima.gov.pt/en"
      },
      {
        "label": "Residency",
        "value": "gov.pt residence guidance - Official gov.pt guidance covers residence for up to and over 3 months and permanent-residence pathways.",
        "sourceUrl": "https://www2.gov.pt/en/cidadaos-europeus-viajar-viver-e-fazer-negocios-em-portugal/viver-em-portugal/residir-em-portugal"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "leon-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "levanto-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "linz-austria": {
    "summary": "Austria. Healthcare: Federal Ministry health topics - The ministry health section provides country-level public-health and health-system policy orientation. | Healthcare: Austria emergency numbers baseline - The official portal lists single European emergency number 112 and national response numbers.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Federal Ministry health topics - The ministry health section provides country-level public-health and health-system policy orientation.",
        "sourceUrl": "https://www.sozialministerium.gv.at/en/Topics/Health.html"
      },
      {
        "label": "Healthcare",
        "value": "Austria emergency numbers baseline - The official portal lists single European emergency number 112 and national response numbers.",
        "sourceUrl": "https://www.oesterreich.gv.at/en/themen/notfaelle_unfaelle_und_kriminalitaet/notrufnummern"
      },
      {
        "label": "Residency",
        "value": "Settlement and Residence Act (NAG) - The NAG framework governs planned stays over six months and residence-permit pathways for non-Austrian nationals.",
        "sourceUrl": "https://www.bmi.gv.at/312_en/start.html"
      },
      {
        "label": "Tax",
        "value": "Austria tax residence - A person is generally regarded as resident with the establishment of an abode.",
        "sourceUrl": "https://taxsummaries.pwc.com/austria/individual/residence"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "lisbon-portugal": {
    "summary": "Portugal. Nearest airport: ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways. | Healthcare: SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways.",
        "sourceUrl": "https://www.ana.pt/en"
      },
      {
        "label": "Healthcare",
        "value": "SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
        "sourceUrl": "https://www.sns24.gov.pt/en/"
      },
      {
        "label": "Residency",
        "value": "AIMA migration authority - Primary authority for migration services and resident support pathways in Portugal.",
        "sourceUrl": "https://aima.gov.pt/en"
      },
      {
        "label": "Residency",
        "value": "gov.pt residence guidance - Official gov.pt guidance covers residence for up to and over 3 months and permanent-residence pathways.",
        "sourceUrl": "https://www2.gov.pt/en/cidadaos-europeus-viajar-viver-e-fazer-negocios-em-portugal/viver-em-portugal/residir-em-portugal"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "ljubljana-slovenia": {
    "summary": "Slovenia. Healthcare: National Institute of Public Health (NIJZ) - NIJZ provides public-health information, prevention content, and health-system resources in Slovenia. | Healthcare: Emergency notification and rescue system - Slovenia's emergency-notification centres operate 24/7 and respond to 112 emergency calls.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "National Institute of Public Health (NIJZ) - NIJZ provides public-health information, prevention content, and health-system resources in Slovenia.",
        "sourceUrl": "https://nijz.si/en"
      },
      {
        "label": "Healthcare",
        "value": "Emergency notification and rescue system - Slovenia's emergency-notification centres operate 24/7 and respond to 112 emergency calls.",
        "sourceUrl": "https://www.gov.si/en/policies/defence-civil-protection-and-public-order/protection-against-natural-and-other-disasters/"
      },
      {
        "label": "Residency",
        "value": "Immigration to Slovenia - Official policy page covering entry, residence permits, and core foreigner pathways in Slovenia.",
        "sourceUrl": "https://www.gov.si/en/policies/state-and-society/immigration-to-slovenia/"
      },
      {
        "label": "Tax",
        "value": "Slovenia tax residence - Residence can be established via permanent residence, habitual abode, or center of personal and economic interests.",
        "sourceUrl": "https://taxsummaries.pwc.com/slovenia/individual/residence"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "llanes-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "locarno-switzerland": {
    "summary": "Switzerland. Nearest airport: Zurich Airport passenger portal - Official passenger portal with departures, arrivals, security guidance, and airport services. | Healthcare: Swiss health insurance framework - Government portal section describing mandatory health-insurance structure and related practical guidance.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Zurich Airport passenger portal - Official passenger portal with departures, arrivals, security guidance, and airport services.",
        "sourceUrl": "https://www.flughafen-zuerich.ch/en/passengers"
      },
      {
        "label": "Healthcare",
        "value": "Swiss health insurance framework - Government portal section describing mandatory health-insurance structure and related practical guidance.",
        "sourceUrl": "https://www.ch.ch/en/health/health-insurance"
      },
      {
        "label": "Healthcare",
        "value": "Swiss health-insurance premium calculator - Official premium-comparison portal for Swiss health-insurance planning and insurer comparison workflows.",
        "sourceUrl": "https://www.priminfo.admin.ch/"
      },
      {
        "label": "Residency",
        "value": "Switzerland entry requirements - Official federal source for entry requirements by nationality, visa pathways, and stay-length rules.",
        "sourceUrl": "https://www.sem.admin.ch/sem/en/home/themen/einreise.html"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "logrono-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "loule-portugal": {
    "summary": "Portugal. Nearest airport: ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways. | Healthcare: SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways.",
        "sourceUrl": "https://www.ana.pt/en"
      },
      {
        "label": "Healthcare",
        "value": "SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
        "sourceUrl": "https://www.sns24.gov.pt/en/"
      },
      {
        "label": "Residency",
        "value": "AIMA migration authority - Primary authority for migration services and resident support pathways in Portugal.",
        "sourceUrl": "https://aima.gov.pt/en"
      },
      {
        "label": "Residency",
        "value": "gov.pt residence guidance - Official gov.pt guidance covers residence for up to and over 3 months and permanent-residence pathways.",
        "sourceUrl": "https://www2.gov.pt/en/cidadaos-europeus-viajar-viver-e-fazer-negocios-em-portugal/viver-em-portugal/residir-em-portugal"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "lucca-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "lucerne-switzerland": {
    "summary": "Switzerland. Nearest airport: Zurich Airport passenger portal - Official passenger portal with departures, arrivals, security guidance, and airport services. | Healthcare: Swiss health insurance framework - Government portal section describing mandatory health-insurance structure and related practical guidance.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Zurich Airport passenger portal - Official passenger portal with departures, arrivals, security guidance, and airport services.",
        "sourceUrl": "https://www.flughafen-zuerich.ch/en/passengers"
      },
      {
        "label": "Healthcare",
        "value": "Swiss health insurance framework - Government portal section describing mandatory health-insurance structure and related practical guidance.",
        "sourceUrl": "https://www.ch.ch/en/health/health-insurance"
      },
      {
        "label": "Healthcare",
        "value": "Swiss health-insurance premium calculator - Official premium-comparison portal for Swiss health-insurance planning and insurer comparison workflows.",
        "sourceUrl": "https://www.priminfo.admin.ch/"
      },
      {
        "label": "Residency",
        "value": "Switzerland entry requirements - Official federal source for entry requirements by nationality, visa pathways, and stay-length rules.",
        "sourceUrl": "https://www.sem.admin.ch/sem/en/home/themen/einreise.html"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "lugano-switzerland": {
    "summary": "Switzerland. Nearest airport: Zurich Airport passenger portal - Official passenger portal with departures, arrivals, security guidance, and airport services. | Healthcare: Swiss health insurance framework - Government portal section describing mandatory health-insurance structure and related practical guidance.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Zurich Airport passenger portal - Official passenger portal with departures, arrivals, security guidance, and airport services.",
        "sourceUrl": "https://www.flughafen-zuerich.ch/en/passengers"
      },
      {
        "label": "Healthcare",
        "value": "Swiss health insurance framework - Government portal section describing mandatory health-insurance structure and related practical guidance.",
        "sourceUrl": "https://www.ch.ch/en/health/health-insurance"
      },
      {
        "label": "Healthcare",
        "value": "Swiss health-insurance premium calculator - Official premium-comparison portal for Swiss health-insurance planning and insurer comparison workflows.",
        "sourceUrl": "https://www.priminfo.admin.ch/"
      },
      {
        "label": "Residency",
        "value": "Switzerland entry requirements - Official federal source for entry requirements by nationality, visa pathways, and stay-length rules.",
        "sourceUrl": "https://www.sem.admin.ch/sem/en/home/themen/einreise.html"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "lyon-france": {
    "summary": "France. Healthcare: France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures. | Healthcare: French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811"
      },
      {
        "label": "Healthcare",
        "value": "French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
        "sourceUrl": "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile"
      },
      {
        "label": "Residency",
        "value": "France-Visas official portal - Official portal for checking visa requirements, completing applications, and tracking status.",
        "sourceUrl": "https://france-visas.gouv.fr/en/"
      },
      {
        "label": "Residency",
        "value": "Residence permits and foreigner documents in France - Government directory of residence permits and stay-document pathways for foreign nationals in France.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N110"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "madrid-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "mahon-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "makarska-croatia": {
    "summary": "Croatia. Nearest airport: Zagreb Airport (ZAG) - Key year-round network node for inland and coastal onward connections. | Nearest airport: Split Airport (SPU) - Core Dalmatian air gateway with significant seasonal route expansion.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Zagreb Airport (ZAG) - Key year-round network node for inland and coastal onward connections.",
        "sourceUrl": "https://www.zag.aero/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Split Airport (SPU) - Core Dalmatian air gateway with significant seasonal route expansion.",
        "sourceUrl": "https://www.split-airport.hr/index.php?lang=en"
      },
      {
        "label": "Healthcare",
        "value": "Croatian Health Insurance Fund (HZZO) - HZZO is the country-level institution for health insurance administration and coverage information.",
        "sourceUrl": "https://hzzo.hr/en/"
      },
      {
        "label": "Healthcare",
        "value": "Emergency numbers in Croatia - 112 is the common free emergency number for ambulance, fire/rescue, and police services.",
        "sourceUrl": "https://vlada.gov.hr/need-emergency-help/16125"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "malaga-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "mali-losinj-croatia": {
    "summary": "Croatia. Nearest airport: Zagreb Airport (ZAG) - Key year-round network node for inland and coastal onward connections. | Nearest airport: Split Airport (SPU) - Core Dalmatian air gateway with significant seasonal route expansion.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Zagreb Airport (ZAG) - Key year-round network node for inland and coastal onward connections.",
        "sourceUrl": "https://www.zag.aero/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Split Airport (SPU) - Core Dalmatian air gateway with significant seasonal route expansion.",
        "sourceUrl": "https://www.split-airport.hr/index.php?lang=en"
      },
      {
        "label": "Healthcare",
        "value": "Croatian Health Insurance Fund (HZZO) - HZZO is the country-level institution for health insurance administration and coverage information.",
        "sourceUrl": "https://hzzo.hr/en/"
      },
      {
        "label": "Healthcare",
        "value": "Emergency numbers in Croatia - 112 is the common free emergency number for ambulance, fire/rescue, and police services.",
        "sourceUrl": "https://vlada.gov.hr/need-emergency-help/16125"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "mantua-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "marbella-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "maribor-slovenia": {
    "summary": "Slovenia. Healthcare: National Institute of Public Health (NIJZ) - NIJZ provides public-health information, prevention content, and health-system resources in Slovenia. | Healthcare: Emergency notification and rescue system - Slovenia's emergency-notification centres operate 24/7 and respond to 112 emergency calls.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "National Institute of Public Health (NIJZ) - NIJZ provides public-health information, prevention content, and health-system resources in Slovenia.",
        "sourceUrl": "https://nijz.si/en"
      },
      {
        "label": "Healthcare",
        "value": "Emergency notification and rescue system - Slovenia's emergency-notification centres operate 24/7 and respond to 112 emergency calls.",
        "sourceUrl": "https://www.gov.si/en/policies/defence-civil-protection-and-public-order/protection-against-natural-and-other-disasters/"
      },
      {
        "label": "Residency",
        "value": "Immigration to Slovenia - Official policy page covering entry, residence permits, and core foreigner pathways in Slovenia.",
        "sourceUrl": "https://www.gov.si/en/policies/state-and-society/immigration-to-slovenia/"
      },
      {
        "label": "Tax",
        "value": "Slovenia tax residence - Residence can be established via permanent residence, habitual abode, or center of personal and economic interests.",
        "sourceUrl": "https://taxsummaries.pwc.com/slovenia/individual/residence"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "matera-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "matsumoto-japan": {
    "summary": "Japan. Nearest airport: Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration. | Nearest airport: Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration.",
        "sourceUrl": "https://tokyo-haneda.com/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
        "sourceUrl": "https://www.narita-airport.jp/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Kansai International Airport (KIX) - Major international access node for Osaka, Kyoto, Kobe, and nearby regions.",
        "sourceUrl": "https://www.kansai-airport.or.jp/en/"
      },
      {
        "label": "Healthcare",
        "value": "Foreign resident support portal - Government support portal for foreigners living in Japan with links to medical care, pensions, tax, and local procedures.",
        "sourceUrl": "https://www.moj.go.jp/isa/support/portal/index.html"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "menton-france": {
    "summary": "France. Healthcare: France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures. | Healthcare: French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811"
      },
      {
        "label": "Healthcare",
        "value": "French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
        "sourceUrl": "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile"
      },
      {
        "label": "Residency",
        "value": "France-Visas official portal - Official portal for checking visa requirements, completing applications, and tracking status.",
        "sourceUrl": "https://france-visas.gouv.fr/en/"
      },
      {
        "label": "Residency",
        "value": "Residence permits and foreigner documents in France - Government directory of residence permits and stay-document pathways for foreign nationals in France.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N110"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "merano-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "milan-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "miyazaki-japan": {
    "summary": "Japan. Nearest airport: Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration. | Nearest airport: Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration.",
        "sourceUrl": "https://tokyo-haneda.com/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
        "sourceUrl": "https://www.narita-airport.jp/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Kansai International Airport (KIX) - Major international access node for Osaka, Kyoto, Kobe, and nearby regions.",
        "sourceUrl": "https://www.kansai-airport.or.jp/en/"
      },
      {
        "label": "Healthcare",
        "value": "Foreign resident support portal - Government support portal for foreigners living in Japan with links to medical care, pensions, tax, and local procedures.",
        "sourceUrl": "https://www.moj.go.jp/isa/support/portal/index.html"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "modena-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "monemvasia-greece": {
    "summary": "Greece. Nearest airport: Fraport Greece regional airport network - Corfu, Chania, Rhodes, Thessaloniki catchments connect through managed regional gateways. | Nearest airport: Athens International Airport (ATH) - Key long-haul and Schengen transfer node for Greek retiree travel logistics.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Fraport Greece regional airport network - Corfu, Chania, Rhodes, Thessaloniki catchments connect through managed regional gateways.",
        "sourceUrl": "https://www.fraport-greece.com/english/our-airports/"
      },
      {
        "label": "Nearest airport",
        "value": "Athens International Airport (ATH) - Key long-haul and Schengen transfer node for Greek retiree travel logistics.",
        "sourceUrl": "https://www.aia.gr/traveler/"
      },
      {
        "label": "Healthcare",
        "value": "EOPYY national health-services payer - EOPYY is the central organization coordinating reimbursed healthcare services in Greece.",
        "sourceUrl": "https://www.eopyy.gov.gr/"
      },
      {
        "label": "Healthcare",
        "value": "Emergency numbers and services (Greece) - Emergency number 112 and core emergency-service access guidance.",
        "sourceUrl": "https://www.gov.gr/en/sdg/travel-and-leisure/travel-outside-greece/emergency-numbers-and-services"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "monopoli-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "montpellier-france": {
    "summary": "France. Healthcare: France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures. | Healthcare: French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811"
      },
      {
        "label": "Healthcare",
        "value": "French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
        "sourceUrl": "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile"
      },
      {
        "label": "Residency",
        "value": "France-Visas official portal - Official portal for checking visa requirements, completing applications, and tracking status.",
        "sourceUrl": "https://france-visas.gouv.fr/en/"
      },
      {
        "label": "Residency",
        "value": "Residence permits and foreigner documents in France - Government directory of residence permits and stay-document pathways for foreign nationals in France.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N110"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "montreux-switzerland": {
    "summary": "Switzerland. Nearest airport: Zurich Airport passenger portal - Official passenger portal with departures, arrivals, security guidance, and airport services. | Healthcare: Swiss health insurance framework - Government portal section describing mandatory health-insurance structure and related practical guidance.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Zurich Airport passenger portal - Official passenger portal with departures, arrivals, security guidance, and airport services.",
        "sourceUrl": "https://www.flughafen-zuerich.ch/en/passengers"
      },
      {
        "label": "Healthcare",
        "value": "Swiss health insurance framework - Government portal section describing mandatory health-insurance structure and related practical guidance.",
        "sourceUrl": "https://www.ch.ch/en/health/health-insurance"
      },
      {
        "label": "Healthcare",
        "value": "Swiss health-insurance premium calculator - Official premium-comparison portal for Swiss health-insurance planning and insurer comparison workflows.",
        "sourceUrl": "https://www.priminfo.admin.ch/"
      },
      {
        "label": "Residency",
        "value": "Switzerland entry requirements - Official federal source for entry requirements by nationality, visa pathways, and stay-length rules.",
        "sourceUrl": "https://www.sem.admin.ch/sem/en/home/themen/einreise.html"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "morioka-japan": {
    "summary": "Japan. Nearest airport: Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration. | Nearest airport: Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration.",
        "sourceUrl": "https://tokyo-haneda.com/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
        "sourceUrl": "https://www.narita-airport.jp/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Kansai International Airport (KIX) - Major international access node for Osaka, Kyoto, Kobe, and nearby regions.",
        "sourceUrl": "https://www.kansai-airport.or.jp/en/"
      },
      {
        "label": "Healthcare",
        "value": "Foreign resident support portal - Government support portal for foreigners living in Japan with links to medical care, pensions, tax, and local procedures.",
        "sourceUrl": "https://www.moj.go.jp/isa/support/portal/index.html"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "murcia-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "nafpaktos-greece": {
    "summary": "Greece. Nearest airport: Fraport Greece regional airport network - Corfu, Chania, Rhodes, Thessaloniki catchments connect through managed regional gateways. | Nearest airport: Athens International Airport (ATH) - Key long-haul and Schengen transfer node for Greek retiree travel logistics.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Fraport Greece regional airport network - Corfu, Chania, Rhodes, Thessaloniki catchments connect through managed regional gateways.",
        "sourceUrl": "https://www.fraport-greece.com/english/our-airports/"
      },
      {
        "label": "Nearest airport",
        "value": "Athens International Airport (ATH) - Key long-haul and Schengen transfer node for Greek retiree travel logistics.",
        "sourceUrl": "https://www.aia.gr/traveler/"
      },
      {
        "label": "Healthcare",
        "value": "EOPYY national health-services payer - EOPYY is the central organization coordinating reimbursed healthcare services in Greece.",
        "sourceUrl": "https://www.eopyy.gov.gr/"
      },
      {
        "label": "Healthcare",
        "value": "Emergency numbers and services (Greece) - Emergency number 112 and core emergency-service access guidance.",
        "sourceUrl": "https://www.gov.gr/en/sdg/travel-and-leisure/travel-outside-greece/emergency-numbers-and-services"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "nafplio-greece": {
    "summary": "Greece. Nearest airport: Fraport Greece regional airport network - Corfu, Chania, Rhodes, Thessaloniki catchments connect through managed regional gateways. | Nearest airport: Athens International Airport (ATH) - Key long-haul and Schengen transfer node for Greek retiree travel logistics.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Fraport Greece regional airport network - Corfu, Chania, Rhodes, Thessaloniki catchments connect through managed regional gateways.",
        "sourceUrl": "https://www.fraport-greece.com/english/our-airports/"
      },
      {
        "label": "Nearest airport",
        "value": "Athens International Airport (ATH) - Key long-haul and Schengen transfer node for Greek retiree travel logistics.",
        "sourceUrl": "https://www.aia.gr/traveler/"
      },
      {
        "label": "Healthcare",
        "value": "EOPYY national health-services payer - EOPYY is the central organization coordinating reimbursed healthcare services in Greece.",
        "sourceUrl": "https://www.eopyy.gov.gr/"
      },
      {
        "label": "Healthcare",
        "value": "Emergency numbers and services (Greece) - Emergency number 112 and core emergency-service access guidance.",
        "sourceUrl": "https://www.gov.gr/en/sdg/travel-and-leisure/travel-outside-greece/emergency-numbers-and-services"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "nagasaki-japan": {
    "summary": "Japan. Nearest airport: Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration. | Nearest airport: Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration.",
        "sourceUrl": "https://tokyo-haneda.com/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
        "sourceUrl": "https://www.narita-airport.jp/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Kansai International Airport (KIX) - Major international access node for Osaka, Kyoto, Kobe, and nearby regions.",
        "sourceUrl": "https://www.kansai-airport.or.jp/en/"
      },
      {
        "label": "Healthcare",
        "value": "Foreign resident support portal - Government support portal for foreigners living in Japan with links to medical care, pensions, tax, and local procedures.",
        "sourceUrl": "https://www.moj.go.jp/isa/support/portal/index.html"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "nagoya-japan": {
    "summary": "Japan. Nearest airport: Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration. | Nearest airport: Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration.",
        "sourceUrl": "https://tokyo-haneda.com/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
        "sourceUrl": "https://www.narita-airport.jp/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Kansai International Airport (KIX) - Major international access node for Osaka, Kyoto, Kobe, and nearby regions.",
        "sourceUrl": "https://www.kansai-airport.or.jp/en/"
      },
      {
        "label": "Healthcare",
        "value": "Foreign resident support portal - Government support portal for foreigners living in Japan with links to medical care, pensions, tax, and local procedures.",
        "sourceUrl": "https://www.moj.go.jp/isa/support/portal/index.html"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "naha-japan": {
    "summary": "Japan. Nearest airport: Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration. | Nearest airport: Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration.",
        "sourceUrl": "https://tokyo-haneda.com/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
        "sourceUrl": "https://www.narita-airport.jp/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Kansai International Airport (KIX) - Major international access node for Osaka, Kyoto, Kobe, and nearby regions.",
        "sourceUrl": "https://www.kansai-airport.or.jp/en/"
      },
      {
        "label": "Healthcare",
        "value": "Foreign resident support portal - Government support portal for foreigners living in Japan with links to medical care, pensions, tax, and local procedures.",
        "sourceUrl": "https://www.moj.go.jp/isa/support/portal/index.html"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "nantes-france": {
    "summary": "France. Healthcare: France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures. | Healthcare: French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811"
      },
      {
        "label": "Healthcare",
        "value": "French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
        "sourceUrl": "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile"
      },
      {
        "label": "Residency",
        "value": "France-Visas official portal - Official portal for checking visa requirements, completing applications, and tracking status.",
        "sourceUrl": "https://france-visas.gouv.fr/en/"
      },
      {
        "label": "Residency",
        "value": "Residence permits and foreigner documents in France - Government directory of residence permits and stay-document pathways for foreign nationals in France.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N110"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "nara-japan": {
    "summary": "Japan. Nearest airport: Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration. | Nearest airport: Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration.",
        "sourceUrl": "https://tokyo-haneda.com/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
        "sourceUrl": "https://www.narita-airport.jp/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Kansai International Airport (KIX) - Major international access node for Osaka, Kyoto, Kobe, and nearby regions.",
        "sourceUrl": "https://www.kansai-airport.or.jp/en/"
      },
      {
        "label": "Healthcare",
        "value": "Foreign resident support portal - Government support portal for foreigners living in Japan with links to medical care, pensions, tax, and local procedures.",
        "sourceUrl": "https://www.moj.go.jp/isa/support/portal/index.html"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "naxos-town-greece": {
    "summary": "Greece. Nearest airport: Fraport Greece regional airport network - Corfu, Chania, Rhodes, Thessaloniki catchments connect through managed regional gateways. | Nearest airport: Athens International Airport (ATH) - Key long-haul and Schengen transfer node for Greek retiree travel logistics.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Fraport Greece regional airport network - Corfu, Chania, Rhodes, Thessaloniki catchments connect through managed regional gateways.",
        "sourceUrl": "https://www.fraport-greece.com/english/our-airports/"
      },
      {
        "label": "Nearest airport",
        "value": "Athens International Airport (ATH) - Key long-haul and Schengen transfer node for Greek retiree travel logistics.",
        "sourceUrl": "https://www.aia.gr/traveler/"
      },
      {
        "label": "Healthcare",
        "value": "EOPYY national health-services payer - EOPYY is the central organization coordinating reimbursed healthcare services in Greece.",
        "sourceUrl": "https://www.eopyy.gov.gr/"
      },
      {
        "label": "Healthcare",
        "value": "Emergency numbers and services (Greece) - Emergency number 112 and core emergency-service access guidance.",
        "sourceUrl": "https://www.gov.gr/en/sdg/travel-and-leisure/travel-outside-greece/emergency-numbers-and-services"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "nazare-portugal": {
    "summary": "Portugal. Nearest airport: ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways. | Healthcare: SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways.",
        "sourceUrl": "https://www.ana.pt/en"
      },
      {
        "label": "Healthcare",
        "value": "SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
        "sourceUrl": "https://www.sns24.gov.pt/en/"
      },
      {
        "label": "Residency",
        "value": "AIMA migration authority - Primary authority for migration services and resident support pathways in Portugal.",
        "sourceUrl": "https://aima.gov.pt/en"
      },
      {
        "label": "Residency",
        "value": "gov.pt residence guidance - Official gov.pt guidance covers residence for up to and over 3 months and permanent-residence pathways.",
        "sourceUrl": "https://www2.gov.pt/en/cidadaos-europeus-viajar-viver-e-fazer-negocios-em-portugal/viver-em-portugal/residir-em-portugal"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "nerja-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "nice-france": {
    "summary": "France. Healthcare: France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures. | Healthcare: French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811"
      },
      {
        "label": "Healthcare",
        "value": "French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
        "sourceUrl": "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile"
      },
      {
        "label": "Residency",
        "value": "France-Visas official portal - Official portal for checking visa requirements, completing applications, and tracking status.",
        "sourceUrl": "https://france-visas.gouv.fr/en/"
      },
      {
        "label": "Residency",
        "value": "Residence permits and foreigner documents in France - Government directory of residence permits and stay-document pathways for foreign nationals in France.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N110"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "niigata-japan": {
    "summary": "Japan. Nearest airport: Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration. | Nearest airport: Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration.",
        "sourceUrl": "https://tokyo-haneda.com/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
        "sourceUrl": "https://www.narita-airport.jp/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Kansai International Airport (KIX) - Major international access node for Osaka, Kyoto, Kobe, and nearby regions.",
        "sourceUrl": "https://www.kansai-airport.or.jp/en/"
      },
      {
        "label": "Healthcare",
        "value": "Foreign resident support portal - Government support portal for foreigners living in Japan with links to medical care, pensions, tax, and local procedures.",
        "sourceUrl": "https://www.moj.go.jp/isa/support/portal/index.html"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "nimes-france": {
    "summary": "France. Healthcare: France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures. | Healthcare: French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811"
      },
      {
        "label": "Healthcare",
        "value": "French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
        "sourceUrl": "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile"
      },
      {
        "label": "Residency",
        "value": "France-Visas official portal - Official portal for checking visa requirements, completing applications, and tracking status.",
        "sourceUrl": "https://france-visas.gouv.fr/en/"
      },
      {
        "label": "Residency",
        "value": "Residence permits and foreigner documents in France - Government directory of residence permits and stay-document pathways for foreign nationals in France.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N110"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "novigrad-croatia": {
    "summary": "Croatia. Nearest airport: Zagreb Airport (ZAG) - Key year-round network node for inland and coastal onward connections. | Nearest airport: Split Airport (SPU) - Core Dalmatian air gateway with significant seasonal route expansion.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Zagreb Airport (ZAG) - Key year-round network node for inland and coastal onward connections.",
        "sourceUrl": "https://www.zag.aero/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Split Airport (SPU) - Core Dalmatian air gateway with significant seasonal route expansion.",
        "sourceUrl": "https://www.split-airport.hr/index.php?lang=en"
      },
      {
        "label": "Healthcare",
        "value": "Croatian Health Insurance Fund (HZZO) - HZZO is the country-level institution for health insurance administration and coverage information.",
        "sourceUrl": "https://hzzo.hr/en/"
      },
      {
        "label": "Healthcare",
        "value": "Emergency numbers in Croatia - 112 is the common free emergency number for ambulance, fire/rescue, and police services.",
        "sourceUrl": "https://vlada.gov.hr/need-emergency-help/16125"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "obidos-portugal": {
    "summary": "Portugal. Nearest airport: ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways. | Healthcare: SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways.",
        "sourceUrl": "https://www.ana.pt/en"
      },
      {
        "label": "Healthcare",
        "value": "SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
        "sourceUrl": "https://www.sns24.gov.pt/en/"
      },
      {
        "label": "Residency",
        "value": "AIMA migration authority - Primary authority for migration services and resident support pathways in Portugal.",
        "sourceUrl": "https://aima.gov.pt/en"
      },
      {
        "label": "Residency",
        "value": "gov.pt residence guidance - Official gov.pt guidance covers residence for up to and over 3 months and permanent-residence pathways.",
        "sourceUrl": "https://www2.gov.pt/en/cidadaos-europeus-viajar-viver-e-fazer-negocios-em-portugal/viver-em-portugal/residir-em-portugal"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "oita-japan": {
    "summary": "Japan. Nearest airport: Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration. | Nearest airport: Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration.",
        "sourceUrl": "https://tokyo-haneda.com/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
        "sourceUrl": "https://www.narita-airport.jp/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Kansai International Airport (KIX) - Major international access node for Osaka, Kyoto, Kobe, and nearby regions.",
        "sourceUrl": "https://www.kansai-airport.or.jp/en/"
      },
      {
        "label": "Healthcare",
        "value": "Foreign resident support portal - Government support portal for foreigners living in Japan with links to medical care, pensions, tax, and local procedures.",
        "sourceUrl": "https://www.moj.go.jp/isa/support/portal/index.html"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "okayama-japan": {
    "summary": "Japan. Nearest airport: Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration. | Nearest airport: Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration.",
        "sourceUrl": "https://tokyo-haneda.com/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
        "sourceUrl": "https://www.narita-airport.jp/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Kansai International Airport (KIX) - Major international access node for Osaka, Kyoto, Kobe, and nearby regions.",
        "sourceUrl": "https://www.kansai-airport.or.jp/en/"
      },
      {
        "label": "Healthcare",
        "value": "Foreign resident support portal - Government support portal for foreigners living in Japan with links to medical care, pensions, tax, and local procedures.",
        "sourceUrl": "https://www.moj.go.jp/isa/support/portal/index.html"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "olbia-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "onomichi-japan": {
    "summary": "Japan. Nearest airport: Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration. | Nearest airport: Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration.",
        "sourceUrl": "https://tokyo-haneda.com/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
        "sourceUrl": "https://www.narita-airport.jp/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Kansai International Airport (KIX) - Major international access node for Osaka, Kyoto, Kobe, and nearby regions.",
        "sourceUrl": "https://www.kansai-airport.or.jp/en/"
      },
      {
        "label": "Healthcare",
        "value": "Foreign resident support portal - Government support portal for foreigners living in Japan with links to medical care, pensions, tax, and local procedures.",
        "sourceUrl": "https://www.moj.go.jp/isa/support/portal/index.html"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "opatija-croatia": {
    "summary": "Croatia. Nearest airport: Zagreb Airport (ZAG) - Key year-round network node for inland and coastal onward connections. | Nearest airport: Split Airport (SPU) - Core Dalmatian air gateway with significant seasonal route expansion.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Zagreb Airport (ZAG) - Key year-round network node for inland and coastal onward connections.",
        "sourceUrl": "https://www.zag.aero/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Split Airport (SPU) - Core Dalmatian air gateway with significant seasonal route expansion.",
        "sourceUrl": "https://www.split-airport.hr/index.php?lang=en"
      },
      {
        "label": "Healthcare",
        "value": "Croatian Health Insurance Fund (HZZO) - HZZO is the country-level institution for health insurance administration and coverage information.",
        "sourceUrl": "https://hzzo.hr/en/"
      },
      {
        "label": "Healthcare",
        "value": "Emergency numbers in Croatia - 112 is the common free emergency number for ambulance, fire/rescue, and police services.",
        "sourceUrl": "https://vlada.gov.hr/need-emergency-help/16125"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "orvieto-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "osaka-japan": {
    "summary": "Japan. Nearest airport: Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration. | Nearest airport: Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration.",
        "sourceUrl": "https://tokyo-haneda.com/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
        "sourceUrl": "https://www.narita-airport.jp/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Kansai International Airport (KIX) - Major international access node for Osaka, Kyoto, Kobe, and nearby regions.",
        "sourceUrl": "https://www.kansai-airport.or.jp/en/"
      },
      {
        "label": "Healthcare",
        "value": "Foreign resident support portal - Government support portal for foreigners living in Japan with links to medical care, pensions, tax, and local procedures.",
        "sourceUrl": "https://www.moj.go.jp/isa/support/portal/index.html"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "osijek-croatia": {
    "summary": "Croatia. Nearest airport: Zagreb Airport (ZAG) - Key year-round network node for inland and coastal onward connections. | Nearest airport: Split Airport (SPU) - Core Dalmatian air gateway with significant seasonal route expansion.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Zagreb Airport (ZAG) - Key year-round network node for inland and coastal onward connections.",
        "sourceUrl": "https://www.zag.aero/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Split Airport (SPU) - Core Dalmatian air gateway with significant seasonal route expansion.",
        "sourceUrl": "https://www.split-airport.hr/index.php?lang=en"
      },
      {
        "label": "Healthcare",
        "value": "Croatian Health Insurance Fund (HZZO) - HZZO is the country-level institution for health insurance administration and coverage information.",
        "sourceUrl": "https://hzzo.hr/en/"
      },
      {
        "label": "Healthcare",
        "value": "Emergency numbers in Croatia - 112 is the common free emergency number for ambulance, fire/rescue, and police services.",
        "sourceUrl": "https://vlada.gov.hr/need-emergency-help/16125"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "oviedo-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "padua-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "palermo-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "palma-de-mallorca-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "pamplona-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "parga-greece": {
    "summary": "Greece. Nearest airport: Fraport Greece regional airport network - Corfu, Chania, Rhodes, Thessaloniki catchments connect through managed regional gateways. | Nearest airport: Athens International Airport (ATH) - Key long-haul and Schengen transfer node for Greek retiree travel logistics.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Fraport Greece regional airport network - Corfu, Chania, Rhodes, Thessaloniki catchments connect through managed regional gateways.",
        "sourceUrl": "https://www.fraport-greece.com/english/our-airports/"
      },
      {
        "label": "Nearest airport",
        "value": "Athens International Airport (ATH) - Key long-haul and Schengen transfer node for Greek retiree travel logistics.",
        "sourceUrl": "https://www.aia.gr/traveler/"
      },
      {
        "label": "Healthcare",
        "value": "EOPYY national health-services payer - EOPYY is the central organization coordinating reimbursed healthcare services in Greece.",
        "sourceUrl": "https://www.eopyy.gov.gr/"
      },
      {
        "label": "Healthcare",
        "value": "Emergency numbers and services (Greece) - Emergency number 112 and core emergency-service access guidance.",
        "sourceUrl": "https://www.gov.gr/en/sdg/travel-and-leisure/travel-outside-greece/emergency-numbers-and-services"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "parma-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "patras-greece": {
    "summary": "Greece. Nearest airport: Fraport Greece regional airport network - Corfu, Chania, Rhodes, Thessaloniki catchments connect through managed regional gateways. | Nearest airport: Athens International Airport (ATH) - Key long-haul and Schengen transfer node for Greek retiree travel logistics.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Fraport Greece regional airport network - Corfu, Chania, Rhodes, Thessaloniki catchments connect through managed regional gateways.",
        "sourceUrl": "https://www.fraport-greece.com/english/our-airports/"
      },
      {
        "label": "Nearest airport",
        "value": "Athens International Airport (ATH) - Key long-haul and Schengen transfer node for Greek retiree travel logistics.",
        "sourceUrl": "https://www.aia.gr/traveler/"
      },
      {
        "label": "Healthcare",
        "value": "EOPYY national health-services payer - EOPYY is the central organization coordinating reimbursed healthcare services in Greece.",
        "sourceUrl": "https://www.eopyy.gov.gr/"
      },
      {
        "label": "Healthcare",
        "value": "Emergency numbers and services (Greece) - Emergency number 112 and core emergency-service access guidance.",
        "sourceUrl": "https://www.gov.gr/en/sdg/travel-and-leisure/travel-outside-greece/emergency-numbers-and-services"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "pau-france": {
    "summary": "France. Healthcare: France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures. | Healthcare: French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811"
      },
      {
        "label": "Healthcare",
        "value": "French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
        "sourceUrl": "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile"
      },
      {
        "label": "Residency",
        "value": "France-Visas official portal - Official portal for checking visa requirements, completing applications, and tracking status.",
        "sourceUrl": "https://france-visas.gouv.fr/en/"
      },
      {
        "label": "Residency",
        "value": "Residence permits and foreigner documents in France - Government directory of residence permits and stay-document pathways for foreign nationals in France.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N110"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "perast-montenegro": {
    "summary": "Bay of Kotor / Coastal Montenegro. Healthcare: General Hospital Kotor - Kotor is the immediate hospital reference point for Bay settlements. | Residency: Foreigners status issues portal - Official starting point for foreigners' status issues and residence-process verification.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "General Hospital Kotor - Kotor is the immediate hospital reference point for Bay settlements.",
        "sourceUrl": "https://www.generalhospitalkotor.me/"
      },
      {
        "label": "Residency",
        "value": "Foreigners status issues portal - Official starting point for foreigners' status issues and residence-process verification.",
        "sourceUrl": "https://mup.gov.me/en/ministry/Directorates_and_other_internal_organisational_units/administrative_affairs_citizenship_and_foreigners/status_issues/"
      },
      {
        "label": "Tax",
        "value": "Montenegro tax residence - Tax residence can be triggered by domicile / centre of personal and economic interests.",
        "sourceUrl": "https://taxsummaries.pwc.com/montenegro/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Montenegro VAT and salary contributions - General VAT rate: 21%.",
        "sourceUrl": "https://taxsummaries.pwc.com/montenegro/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "perpignan-france": {
    "summary": "France. Healthcare: France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures. | Healthcare: French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811"
      },
      {
        "label": "Healthcare",
        "value": "French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
        "sourceUrl": "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile"
      },
      {
        "label": "Residency",
        "value": "France-Visas official portal - Official portal for checking visa requirements, completing applications, and tracking status.",
        "sourceUrl": "https://france-visas.gouv.fr/en/"
      },
      {
        "label": "Residency",
        "value": "Residence permits and foreigner documents in France - Government directory of residence permits and stay-document pathways for foreign nationals in France.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N110"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "perugia-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "pietra-ligure-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "pietrasanta-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "piran-slovenia": {
    "summary": "Slovenia. Healthcare: National Institute of Public Health (NIJZ) - NIJZ provides public-health information, prevention content, and health-system resources in Slovenia. | Healthcare: Emergency notification and rescue system - Slovenia's emergency-notification centres operate 24/7 and respond to 112 emergency calls.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "National Institute of Public Health (NIJZ) - NIJZ provides public-health information, prevention content, and health-system resources in Slovenia.",
        "sourceUrl": "https://nijz.si/en"
      },
      {
        "label": "Healthcare",
        "value": "Emergency notification and rescue system - Slovenia's emergency-notification centres operate 24/7 and respond to 112 emergency calls.",
        "sourceUrl": "https://www.gov.si/en/policies/defence-civil-protection-and-public-order/protection-against-natural-and-other-disasters/"
      },
      {
        "label": "Residency",
        "value": "Immigration to Slovenia - Official policy page covering entry, residence permits, and core foreigner pathways in Slovenia.",
        "sourceUrl": "https://www.gov.si/en/policies/state-and-society/immigration-to-slovenia/"
      },
      {
        "label": "Tax",
        "value": "Slovenia tax residence - Residence can be established via permanent residence, habitual abode, or center of personal and economic interests.",
        "sourceUrl": "https://taxsummaries.pwc.com/slovenia/individual/residence"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "podgorica-montenegro": {
    "summary": "Verification: Data verification in progress | Verification: Data verification in progress",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Verification",
        "value": "Data verification in progress"
      },
      {
        "label": "Verification",
        "value": "Data verification in progress"
      },
      {
        "label": "Verification",
        "value": "Data verification in progress"
      }
    ],
    "lowCoverage": true,
    "source": "merged_seed"
  },
  "polignano-a-mare-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "ponta-delgada-portugal": {
    "summary": "Portugal. Nearest airport: ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways. | Healthcare: SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways.",
        "sourceUrl": "https://www.ana.pt/en"
      },
      {
        "label": "Healthcare",
        "value": "SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
        "sourceUrl": "https://www.sns24.gov.pt/en/"
      },
      {
        "label": "Residency",
        "value": "AIMA migration authority - Primary authority for migration services and resident support pathways in Portugal.",
        "sourceUrl": "https://aima.gov.pt/en"
      },
      {
        "label": "Residency",
        "value": "gov.pt residence guidance - Official gov.pt guidance covers residence for up to and over 3 months and permanent-residence pathways.",
        "sourceUrl": "https://www2.gov.pt/en/cidadaos-europeus-viajar-viver-e-fazer-negocios-em-portugal/viver-em-portugal/residir-em-portugal"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "porec-croatia": {
    "summary": "Croatia. Nearest airport: Zagreb Airport (ZAG) - Key year-round network node for inland and coastal onward connections. | Nearest airport: Split Airport (SPU) - Core Dalmatian air gateway with significant seasonal route expansion.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Zagreb Airport (ZAG) - Key year-round network node for inland and coastal onward connections.",
        "sourceUrl": "https://www.zag.aero/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Split Airport (SPU) - Core Dalmatian air gateway with significant seasonal route expansion.",
        "sourceUrl": "https://www.split-airport.hr/index.php?lang=en"
      },
      {
        "label": "Healthcare",
        "value": "Croatian Health Insurance Fund (HZZO) - HZZO is the country-level institution for health insurance administration and coverage information.",
        "sourceUrl": "https://hzzo.hr/en/"
      },
      {
        "label": "Healthcare",
        "value": "Emergency numbers in Croatia - 112 is the common free emergency number for ambulance, fire/rescue, and police services.",
        "sourceUrl": "https://vlada.gov.hr/need-emergency-help/16125"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "portimao-portugal": {
    "summary": "Portugal. Nearest airport: ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways. | Healthcare: SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways.",
        "sourceUrl": "https://www.ana.pt/en"
      },
      {
        "label": "Healthcare",
        "value": "SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
        "sourceUrl": "https://www.sns24.gov.pt/en/"
      },
      {
        "label": "Residency",
        "value": "AIMA migration authority - Primary authority for migration services and resident support pathways in Portugal.",
        "sourceUrl": "https://aima.gov.pt/en"
      },
      {
        "label": "Residency",
        "value": "gov.pt residence guidance - Official gov.pt guidance covers residence for up to and over 3 months and permanent-residence pathways.",
        "sourceUrl": "https://www2.gov.pt/en/cidadaos-europeus-viajar-viver-e-fazer-negocios-em-portugal/viver-em-portugal/residir-em-portugal"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "porto-portugal": {
    "summary": "Portugal. Nearest airport: ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways. | Healthcare: SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways.",
        "sourceUrl": "https://www.ana.pt/en"
      },
      {
        "label": "Healthcare",
        "value": "SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
        "sourceUrl": "https://www.sns24.gov.pt/en/"
      },
      {
        "label": "Residency",
        "value": "AIMA migration authority - Primary authority for migration services and resident support pathways in Portugal.",
        "sourceUrl": "https://aima.gov.pt/en"
      },
      {
        "label": "Residency",
        "value": "gov.pt residence guidance - Official gov.pt guidance covers residence for up to and over 3 months and permanent-residence pathways.",
        "sourceUrl": "https://www2.gov.pt/en/cidadaos-europeus-viajar-viver-e-fazer-negocios-em-portugal/viver-em-portugal/residir-em-portugal"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "prague-other-europe": {
    "summary": "Verification: Data verification in progress | Verification: Data verification in progress",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Verification",
        "value": "Data verification in progress"
      },
      {
        "label": "Verification",
        "value": "Data verification in progress"
      },
      {
        "label": "Verification",
        "value": "Data verification in progress"
      }
    ],
    "lowCoverage": true,
    "source": "merged_seed"
  },
  "preveza-greece": {
    "summary": "Greece. Nearest airport: Fraport Greece regional airport network - Corfu, Chania, Rhodes, Thessaloniki catchments connect through managed regional gateways. | Nearest airport: Athens International Airport (ATH) - Key long-haul and Schengen transfer node for Greek retiree travel logistics.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Fraport Greece regional airport network - Corfu, Chania, Rhodes, Thessaloniki catchments connect through managed regional gateways.",
        "sourceUrl": "https://www.fraport-greece.com/english/our-airports/"
      },
      {
        "label": "Nearest airport",
        "value": "Athens International Airport (ATH) - Key long-haul and Schengen transfer node for Greek retiree travel logistics.",
        "sourceUrl": "https://www.aia.gr/traveler/"
      },
      {
        "label": "Healthcare",
        "value": "EOPYY national health-services payer - EOPYY is the central organization coordinating reimbursed healthcare services in Greece.",
        "sourceUrl": "https://www.eopyy.gov.gr/"
      },
      {
        "label": "Healthcare",
        "value": "Emergency numbers and services (Greece) - Emergency number 112 and core emergency-service access guidance.",
        "sourceUrl": "https://www.gov.gr/en/sdg/travel-and-leisure/travel-outside-greece/emergency-numbers-and-services"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "primosten-croatia": {
    "summary": "Croatia. Nearest airport: Zagreb Airport (ZAG) - Key year-round network node for inland and coastal onward connections. | Nearest airport: Split Airport (SPU) - Core Dalmatian air gateway with significant seasonal route expansion.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Zagreb Airport (ZAG) - Key year-round network node for inland and coastal onward connections.",
        "sourceUrl": "https://www.zag.aero/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Split Airport (SPU) - Core Dalmatian air gateway with significant seasonal route expansion.",
        "sourceUrl": "https://www.split-airport.hr/index.php?lang=en"
      },
      {
        "label": "Healthcare",
        "value": "Croatian Health Insurance Fund (HZZO) - HZZO is the country-level institution for health insurance administration and coverage information.",
        "sourceUrl": "https://hzzo.hr/en/"
      },
      {
        "label": "Healthcare",
        "value": "Emergency numbers in Croatia - 112 is the common free emergency number for ambulance, fire/rescue, and police services.",
        "sourceUrl": "https://vlada.gov.hr/need-emergency-help/16125"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "ptuj-slovenia": {
    "summary": "Slovenia. Healthcare: National Institute of Public Health (NIJZ) - NIJZ provides public-health information, prevention content, and health-system resources in Slovenia. | Healthcare: Emergency notification and rescue system - Slovenia's emergency-notification centres operate 24/7 and respond to 112 emergency calls.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "National Institute of Public Health (NIJZ) - NIJZ provides public-health information, prevention content, and health-system resources in Slovenia.",
        "sourceUrl": "https://nijz.si/en"
      },
      {
        "label": "Healthcare",
        "value": "Emergency notification and rescue system - Slovenia's emergency-notification centres operate 24/7 and respond to 112 emergency calls.",
        "sourceUrl": "https://www.gov.si/en/policies/defence-civil-protection-and-public-order/protection-against-natural-and-other-disasters/"
      },
      {
        "label": "Residency",
        "value": "Immigration to Slovenia - Official policy page covering entry, residence permits, and core foreigner pathways in Slovenia.",
        "sourceUrl": "https://www.gov.si/en/policies/state-and-society/immigration-to-slovenia/"
      },
      {
        "label": "Tax",
        "value": "Slovenia tax residence - Residence can be established via permanent residence, habitual abode, or center of personal and economic interests.",
        "sourceUrl": "https://taxsummaries.pwc.com/slovenia/individual/residence"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "pula-croatia": {
    "summary": "Croatia. Nearest airport: Zagreb Airport (ZAG) - Key year-round network node for inland and coastal onward connections. | Nearest airport: Split Airport (SPU) - Core Dalmatian air gateway with significant seasonal route expansion.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Zagreb Airport (ZAG) - Key year-round network node for inland and coastal onward connections.",
        "sourceUrl": "https://www.zag.aero/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Split Airport (SPU) - Core Dalmatian air gateway with significant seasonal route expansion.",
        "sourceUrl": "https://www.split-airport.hr/index.php?lang=en"
      },
      {
        "label": "Healthcare",
        "value": "Croatian Health Insurance Fund (HZZO) - HZZO is the country-level institution for health insurance administration and coverage information.",
        "sourceUrl": "https://hzzo.hr/en/"
      },
      {
        "label": "Healthcare",
        "value": "Emergency numbers in Croatia - 112 is the common free emergency number for ambulance, fire/rescue, and police services.",
        "sourceUrl": "https://vlada.gov.hr/need-emergency-help/16125"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "radovljica-slovenia": {
    "summary": "Slovenia. Healthcare: National Institute of Public Health (NIJZ) - NIJZ provides public-health information, prevention content, and health-system resources in Slovenia. | Healthcare: Emergency notification and rescue system - Slovenia's emergency-notification centres operate 24/7 and respond to 112 emergency calls.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "National Institute of Public Health (NIJZ) - NIJZ provides public-health information, prevention content, and health-system resources in Slovenia.",
        "sourceUrl": "https://nijz.si/en"
      },
      {
        "label": "Healthcare",
        "value": "Emergency notification and rescue system - Slovenia's emergency-notification centres operate 24/7 and respond to 112 emergency calls.",
        "sourceUrl": "https://www.gov.si/en/policies/defence-civil-protection-and-public-order/protection-against-natural-and-other-disasters/"
      },
      {
        "label": "Residency",
        "value": "Immigration to Slovenia - Official policy page covering entry, residence permits, and core foreigner pathways in Slovenia.",
        "sourceUrl": "https://www.gov.si/en/policies/state-and-society/immigration-to-slovenia/"
      },
      {
        "label": "Tax",
        "value": "Slovenia tax residence - Residence can be established via permanent residence, habitual abode, or center of personal and economic interests.",
        "sourceUrl": "https://taxsummaries.pwc.com/slovenia/individual/residence"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "rapallo-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "ravenna-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "reims-france": {
    "summary": "France. Healthcare: France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures. | Healthcare: French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811"
      },
      {
        "label": "Healthcare",
        "value": "French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
        "sourceUrl": "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile"
      },
      {
        "label": "Residency",
        "value": "France-Visas official portal - Official portal for checking visa requirements, completing applications, and tracking status.",
        "sourceUrl": "https://france-visas.gouv.fr/en/"
      },
      {
        "label": "Residency",
        "value": "Residence permits and foreigner documents in France - Government directory of residence permits and stay-document pathways for foreign nationals in France.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N110"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "rethymno-greece": {
    "summary": "Greece. Nearest airport: Fraport Greece regional airport network - Corfu, Chania, Rhodes, Thessaloniki catchments connect through managed regional gateways. | Nearest airport: Athens International Airport (ATH) - Key long-haul and Schengen transfer node for Greek retiree travel logistics.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Fraport Greece regional airport network - Corfu, Chania, Rhodes, Thessaloniki catchments connect through managed regional gateways.",
        "sourceUrl": "https://www.fraport-greece.com/english/our-airports/"
      },
      {
        "label": "Nearest airport",
        "value": "Athens International Airport (ATH) - Key long-haul and Schengen transfer node for Greek retiree travel logistics.",
        "sourceUrl": "https://www.aia.gr/traveler/"
      },
      {
        "label": "Healthcare",
        "value": "EOPYY national health-services payer - EOPYY is the central organization coordinating reimbursed healthcare services in Greece.",
        "sourceUrl": "https://www.eopyy.gov.gr/"
      },
      {
        "label": "Healthcare",
        "value": "Emergency numbers and services (Greece) - Emergency number 112 and core emergency-service access guidance.",
        "sourceUrl": "https://www.gov.gr/en/sdg/travel-and-leisure/travel-outside-greece/emergency-numbers-and-services"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "rhodes-town-greece": {
    "summary": "Greece. Nearest airport: Fraport Greece regional airport network - Corfu, Chania, Rhodes, Thessaloniki catchments connect through managed regional gateways. | Nearest airport: Athens International Airport (ATH) - Key long-haul and Schengen transfer node for Greek retiree travel logistics.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Fraport Greece regional airport network - Corfu, Chania, Rhodes, Thessaloniki catchments connect through managed regional gateways.",
        "sourceUrl": "https://www.fraport-greece.com/english/our-airports/"
      },
      {
        "label": "Nearest airport",
        "value": "Athens International Airport (ATH) - Key long-haul and Schengen transfer node for Greek retiree travel logistics.",
        "sourceUrl": "https://www.aia.gr/traveler/"
      },
      {
        "label": "Healthcare",
        "value": "EOPYY national health-services payer - EOPYY is the central organization coordinating reimbursed healthcare services in Greece.",
        "sourceUrl": "https://www.eopyy.gov.gr/"
      },
      {
        "label": "Healthcare",
        "value": "Emergency numbers and services (Greece) - Emergency number 112 and core emergency-service access guidance.",
        "sourceUrl": "https://www.gov.gr/en/sdg/travel-and-leisure/travel-outside-greece/emergency-numbers-and-services"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "riga-other-europe": {
    "summary": "Verification: Data verification in progress | Verification: Data verification in progress",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Verification",
        "value": "Data verification in progress"
      },
      {
        "label": "Verification",
        "value": "Data verification in progress"
      },
      {
        "label": "Verification",
        "value": "Data verification in progress"
      }
    ],
    "lowCoverage": true,
    "source": "merged_seed"
  },
  "rijeka-croatia": {
    "summary": "Croatia. Nearest airport: Zagreb Airport (ZAG) - Key year-round network node for inland and coastal onward connections. | Nearest airport: Split Airport (SPU) - Core Dalmatian air gateway with significant seasonal route expansion.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Zagreb Airport (ZAG) - Key year-round network node for inland and coastal onward connections.",
        "sourceUrl": "https://www.zag.aero/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Split Airport (SPU) - Core Dalmatian air gateway with significant seasonal route expansion.",
        "sourceUrl": "https://www.split-airport.hr/index.php?lang=en"
      },
      {
        "label": "Healthcare",
        "value": "Croatian Health Insurance Fund (HZZO) - HZZO is the country-level institution for health insurance administration and coverage information.",
        "sourceUrl": "https://hzzo.hr/en/"
      },
      {
        "label": "Healthcare",
        "value": "Emergency numbers in Croatia - 112 is the common free emergency number for ambulance, fire/rescue, and police services.",
        "sourceUrl": "https://vlada.gov.hr/need-emergency-help/16125"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "riva-del-garda-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "rome-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "ronda-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "rouen-france": {
    "summary": "France. Healthcare: France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures. | Healthcare: French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811"
      },
      {
        "label": "Healthcare",
        "value": "French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
        "sourceUrl": "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile"
      },
      {
        "label": "Residency",
        "value": "France-Visas official portal - Official portal for checking visa requirements, completing applications, and tracking status.",
        "sourceUrl": "https://france-visas.gouv.fr/en/"
      },
      {
        "label": "Residency",
        "value": "Residence permits and foreigner documents in France - Government directory of residence permits and stay-document pathways for foreign nationals in France.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N110"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "rovinj-croatia": {
    "summary": "Croatia. Nearest airport: Zagreb Airport (ZAG) - Key year-round network node for inland and coastal onward connections. | Nearest airport: Split Airport (SPU) - Core Dalmatian air gateway with significant seasonal route expansion.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Zagreb Airport (ZAG) - Key year-round network node for inland and coastal onward connections.",
        "sourceUrl": "https://www.zag.aero/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Split Airport (SPU) - Core Dalmatian air gateway with significant seasonal route expansion.",
        "sourceUrl": "https://www.split-airport.hr/index.php?lang=en"
      },
      {
        "label": "Healthcare",
        "value": "Croatian Health Insurance Fund (HZZO) - HZZO is the country-level institution for health insurance administration and coverage information.",
        "sourceUrl": "https://hzzo.hr/en/"
      },
      {
        "label": "Healthcare",
        "value": "Emergency numbers in Croatia - 112 is the common free emergency number for ambulance, fire/rescue, and police services.",
        "sourceUrl": "https://vlada.gov.hr/need-emergency-help/16125"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "saint-malo-france": {
    "summary": "France. Healthcare: France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures. | Healthcare: French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811"
      },
      {
        "label": "Healthcare",
        "value": "French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
        "sourceUrl": "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile"
      },
      {
        "label": "Residency",
        "value": "France-Visas official portal - Official portal for checking visa requirements, completing applications, and tracking status.",
        "sourceUrl": "https://france-visas.gouv.fr/en/"
      },
      {
        "label": "Residency",
        "value": "Residence permits and foreigner documents in France - Government directory of residence permits and stay-document pathways for foreign nationals in France.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N110"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "saint-remy-de-provence-france": {
    "summary": "France. Healthcare: France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures. | Healthcare: French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811"
      },
      {
        "label": "Healthcare",
        "value": "French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
        "sourceUrl": "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile"
      },
      {
        "label": "Residency",
        "value": "France-Visas official portal - Official portal for checking visa requirements, completing applications, and tracking status.",
        "sourceUrl": "https://france-visas.gouv.fr/en/"
      },
      {
        "label": "Residency",
        "value": "Residence permits and foreigner documents in France - Government directory of residence permits and stay-document pathways for foreign nationals in France.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N110"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "salamanca-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "salerno-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "salzburg-austria": {
    "summary": "Austria. Healthcare: Federal Ministry health topics - The ministry health section provides country-level public-health and health-system policy orientation. | Healthcare: Austria emergency numbers baseline - The official portal lists single European emergency number 112 and national response numbers.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Federal Ministry health topics - The ministry health section provides country-level public-health and health-system policy orientation.",
        "sourceUrl": "https://www.sozialministerium.gv.at/en/Topics/Health.html"
      },
      {
        "label": "Healthcare",
        "value": "Austria emergency numbers baseline - The official portal lists single European emergency number 112 and national response numbers.",
        "sourceUrl": "https://www.oesterreich.gv.at/en/themen/notfaelle_unfaelle_und_kriminalitaet/notrufnummern"
      },
      {
        "label": "Residency",
        "value": "Settlement and Residence Act (NAG) - The NAG framework governs planned stays over six months and residence-permit pathways for non-Austrian nationals.",
        "sourceUrl": "https://www.bmi.gv.at/312_en/start.html"
      },
      {
        "label": "Tax",
        "value": "Austria tax residence - A person is generally regarded as resident with the establishment of an abode.",
        "sourceUrl": "https://taxsummaries.pwc.com/austria/individual/residence"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "san-sebastian-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "santa-cruz-de-tenerife-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "santa-margherita-ligure-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "santander-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "sapporo-japan": {
    "summary": "Japan. Nearest airport: Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration. | Nearest airport: Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration.",
        "sourceUrl": "https://tokyo-haneda.com/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
        "sourceUrl": "https://www.narita-airport.jp/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Kansai International Airport (KIX) - Major international access node for Osaka, Kyoto, Kobe, and nearby regions.",
        "sourceUrl": "https://www.kansai-airport.or.jp/en/"
      },
      {
        "label": "Healthcare",
        "value": "Foreign resident support portal - Government support portal for foreigners living in Japan with links to medical care, pensions, tax, and local procedures.",
        "sourceUrl": "https://www.moj.go.jp/isa/support/portal/index.html"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "segovia-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "sendai-japan": {
    "summary": "Japan. Nearest airport: Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration. | Nearest airport: Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration.",
        "sourceUrl": "https://tokyo-haneda.com/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
        "sourceUrl": "https://www.narita-airport.jp/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Kansai International Airport (KIX) - Major international access node for Osaka, Kyoto, Kobe, and nearby regions.",
        "sourceUrl": "https://www.kansai-airport.or.jp/en/"
      },
      {
        "label": "Healthcare",
        "value": "Foreign resident support portal - Government support portal for foreigners living in Japan with links to medical care, pensions, tax, and local procedures.",
        "sourceUrl": "https://www.moj.go.jp/isa/support/portal/index.html"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "sesimbra-portugal": {
    "summary": "Portugal. Nearest airport: ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways. | Healthcare: SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways.",
        "sourceUrl": "https://www.ana.pt/en"
      },
      {
        "label": "Healthcare",
        "value": "SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
        "sourceUrl": "https://www.sns24.gov.pt/en/"
      },
      {
        "label": "Residency",
        "value": "AIMA migration authority - Primary authority for migration services and resident support pathways in Portugal.",
        "sourceUrl": "https://aima.gov.pt/en"
      },
      {
        "label": "Residency",
        "value": "gov.pt residence guidance - Official gov.pt guidance covers residence for up to and over 3 months and permanent-residence pathways.",
        "sourceUrl": "https://www2.gov.pt/en/cidadaos-europeus-viajar-viver-e-fazer-negocios-em-portugal/viver-em-portugal/residir-em-portugal"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "sete-france": {
    "summary": "France. Healthcare: France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures. | Healthcare: French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811"
      },
      {
        "label": "Healthcare",
        "value": "French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
        "sourceUrl": "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile"
      },
      {
        "label": "Residency",
        "value": "France-Visas official portal - Official portal for checking visa requirements, completing applications, and tracking status.",
        "sourceUrl": "https://france-visas.gouv.fr/en/"
      },
      {
        "label": "Residency",
        "value": "Residence permits and foreigner documents in France - Government directory of residence permits and stay-document pathways for foreign nationals in France.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N110"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "setubal-portugal": {
    "summary": "Portugal. Nearest airport: ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways. | Healthcare: SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways.",
        "sourceUrl": "https://www.ana.pt/en"
      },
      {
        "label": "Healthcare",
        "value": "SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
        "sourceUrl": "https://www.sns24.gov.pt/en/"
      },
      {
        "label": "Residency",
        "value": "AIMA migration authority - Primary authority for migration services and resident support pathways in Portugal.",
        "sourceUrl": "https://aima.gov.pt/en"
      },
      {
        "label": "Residency",
        "value": "gov.pt residence guidance - Official gov.pt guidance covers residence for up to and over 3 months and permanent-residence pathways.",
        "sourceUrl": "https://www2.gov.pt/en/cidadaos-europeus-viajar-viver-e-fazer-negocios-em-portugal/viver-em-portugal/residir-em-portugal"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "seville-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "sibenik-croatia": {
    "summary": "Croatia. Nearest airport: Zagreb Airport (ZAG) - Key year-round network node for inland and coastal onward connections. | Nearest airport: Split Airport (SPU) - Core Dalmatian air gateway with significant seasonal route expansion.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Zagreb Airport (ZAG) - Key year-round network node for inland and coastal onward connections.",
        "sourceUrl": "https://www.zag.aero/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Split Airport (SPU) - Core Dalmatian air gateway with significant seasonal route expansion.",
        "sourceUrl": "https://www.split-airport.hr/index.php?lang=en"
      },
      {
        "label": "Healthcare",
        "value": "Croatian Health Insurance Fund (HZZO) - HZZO is the country-level institution for health insurance administration and coverage information.",
        "sourceUrl": "https://hzzo.hr/en/"
      },
      {
        "label": "Healthcare",
        "value": "Emergency numbers in Croatia - 112 is the common free emergency number for ambulance, fire/rescue, and police services.",
        "sourceUrl": "https://vlada.gov.hr/need-emergency-help/16125"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "siena-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "sintra-portugal": {
    "summary": "Portugal. Nearest airport: ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways. | Healthcare: SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways.",
        "sourceUrl": "https://www.ana.pt/en"
      },
      {
        "label": "Healthcare",
        "value": "SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
        "sourceUrl": "https://www.sns24.gov.pt/en/"
      },
      {
        "label": "Residency",
        "value": "AIMA migration authority - Primary authority for migration services and resident support pathways in Portugal.",
        "sourceUrl": "https://aima.gov.pt/en"
      },
      {
        "label": "Residency",
        "value": "gov.pt residence guidance - Official gov.pt guidance covers residence for up to and over 3 months and permanent-residence pathways.",
        "sourceUrl": "https://www2.gov.pt/en/cidadaos-europeus-viajar-viver-e-fazer-negocios-em-portugal/viver-em-portugal/residir-em-portugal"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "siracusa-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "sirmione-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "sitges-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "soller-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "sopot-other-europe": {
    "summary": "Verification: Data verification in progress | Verification: Data verification in progress",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Verification",
        "value": "Data verification in progress"
      },
      {
        "label": "Verification",
        "value": "Data verification in progress"
      },
      {
        "label": "Verification",
        "value": "Data verification in progress"
      }
    ],
    "lowCoverage": true,
    "source": "merged_seed"
  },
  "split-croatia": {
    "summary": "Croatia. Nearest airport: Zagreb Airport (ZAG) - Key year-round network node for inland and coastal onward connections. | Nearest airport: Split Airport (SPU) - Core Dalmatian air gateway with significant seasonal route expansion.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Zagreb Airport (ZAG) - Key year-round network node for inland and coastal onward connections.",
        "sourceUrl": "https://www.zag.aero/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Split Airport (SPU) - Core Dalmatian air gateway with significant seasonal route expansion.",
        "sourceUrl": "https://www.split-airport.hr/index.php?lang=en"
      },
      {
        "label": "Healthcare",
        "value": "Croatian Health Insurance Fund (HZZO) - HZZO is the country-level institution for health insurance administration and coverage information.",
        "sourceUrl": "https://hzzo.hr/en/"
      },
      {
        "label": "Healthcare",
        "value": "Emergency numbers in Croatia - 112 is the common free emergency number for ambulance, fire/rescue, and police services.",
        "sourceUrl": "https://vlada.gov.hr/need-emergency-help/16125"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "spoleto-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "stockholm-other-europe": {
    "summary": "Verification: Data verification in progress | Verification: Data verification in progress",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Verification",
        "value": "Data verification in progress"
      },
      {
        "label": "Verification",
        "value": "Data verification in progress"
      },
      {
        "label": "Verification",
        "value": "Data verification in progress"
      }
    ],
    "lowCoverage": true,
    "source": "merged_seed"
  },
  "strasbourg-france": {
    "summary": "France. Healthcare: France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures. | Healthcare: French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811"
      },
      {
        "label": "Healthcare",
        "value": "French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
        "sourceUrl": "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile"
      },
      {
        "label": "Residency",
        "value": "France-Visas official portal - Official portal for checking visa requirements, completing applications, and tracking status.",
        "sourceUrl": "https://france-visas.gouv.fr/en/"
      },
      {
        "label": "Residency",
        "value": "Residence permits and foreigner documents in France - Government directory of residence permits and stay-document pathways for foreign nationals in France.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N110"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "stresa-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "syros-greece": {
    "summary": "Greece. Nearest airport: Fraport Greece regional airport network - Corfu, Chania, Rhodes, Thessaloniki catchments connect through managed regional gateways. | Nearest airport: Athens International Airport (ATH) - Key long-haul and Schengen transfer node for Greek retiree travel logistics.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Fraport Greece regional airport network - Corfu, Chania, Rhodes, Thessaloniki catchments connect through managed regional gateways.",
        "sourceUrl": "https://www.fraport-greece.com/english/our-airports/"
      },
      {
        "label": "Nearest airport",
        "value": "Athens International Airport (ATH) - Key long-haul and Schengen transfer node for Greek retiree travel logistics.",
        "sourceUrl": "https://www.aia.gr/traveler/"
      },
      {
        "label": "Healthcare",
        "value": "EOPYY national health-services payer - EOPYY is the central organization coordinating reimbursed healthcare services in Greece.",
        "sourceUrl": "https://www.eopyy.gov.gr/"
      },
      {
        "label": "Healthcare",
        "value": "Emergency numbers and services (Greece) - Emergency number 112 and core emergency-service access guidance.",
        "sourceUrl": "https://www.gov.gr/en/sdg/travel-and-leisure/travel-outside-greece/emergency-numbers-and-services"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "szentendre-other-europe": {
    "summary": "Verification: Data verification in progress | Verification: Data verification in progress",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Verification",
        "value": "Data verification in progress"
      },
      {
        "label": "Verification",
        "value": "Data verification in progress"
      },
      {
        "label": "Verification",
        "value": "Data verification in progress"
      }
    ],
    "lowCoverage": true,
    "source": "merged_seed"
  },
  "takayama-japan": {
    "summary": "Japan. Nearest airport: Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration. | Nearest airport: Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration.",
        "sourceUrl": "https://tokyo-haneda.com/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
        "sourceUrl": "https://www.narita-airport.jp/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Kansai International Airport (KIX) - Major international access node for Osaka, Kyoto, Kobe, and nearby regions.",
        "sourceUrl": "https://www.kansai-airport.or.jp/en/"
      },
      {
        "label": "Healthcare",
        "value": "Foreign resident support portal - Government support portal for foreigners living in Japan with links to medical care, pensions, tax, and local procedures.",
        "sourceUrl": "https://www.moj.go.jp/isa/support/portal/index.html"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "tallinn-other-europe": {
    "summary": "Verification: Data verification in progress | Verification: Data verification in progress",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Verification",
        "value": "Data verification in progress"
      },
      {
        "label": "Verification",
        "value": "Data verification in progress"
      },
      {
        "label": "Verification",
        "value": "Data verification in progress"
      }
    ],
    "lowCoverage": true,
    "source": "merged_seed"
  },
  "taormina-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "tarragona-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "tartu-other-europe": {
    "summary": "Verification: Data verification in progress | Verification: Data verification in progress",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Verification",
        "value": "Data verification in progress"
      },
      {
        "label": "Verification",
        "value": "Data verification in progress"
      },
      {
        "label": "Verification",
        "value": "Data verification in progress"
      }
    ],
    "lowCoverage": true,
    "source": "merged_seed"
  },
  "tavira-portugal": {
    "summary": "Portugal. Nearest airport: ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways. | Healthcare: SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways.",
        "sourceUrl": "https://www.ana.pt/en"
      },
      {
        "label": "Healthcare",
        "value": "SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
        "sourceUrl": "https://www.sns24.gov.pt/en/"
      },
      {
        "label": "Residency",
        "value": "AIMA migration authority - Primary authority for migration services and resident support pathways in Portugal.",
        "sourceUrl": "https://aima.gov.pt/en"
      },
      {
        "label": "Residency",
        "value": "gov.pt residence guidance - Official gov.pt guidance covers residence for up to and over 3 months and permanent-residence pathways.",
        "sourceUrl": "https://www2.gov.pt/en/cidadaos-europeus-viajar-viver-e-fazer-negocios-em-portugal/viver-em-portugal/residir-em-portugal"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "thessaloniki-greece": {
    "summary": "Greece. Nearest airport: Fraport Greece regional airport network - Corfu, Chania, Rhodes, Thessaloniki catchments connect through managed regional gateways. | Nearest airport: Athens International Airport (ATH) - Key long-haul and Schengen transfer node for Greek retiree travel logistics.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Fraport Greece regional airport network - Corfu, Chania, Rhodes, Thessaloniki catchments connect through managed regional gateways.",
        "sourceUrl": "https://www.fraport-greece.com/english/our-airports/"
      },
      {
        "label": "Nearest airport",
        "value": "Athens International Airport (ATH) - Key long-haul and Schengen transfer node for Greek retiree travel logistics.",
        "sourceUrl": "https://www.aia.gr/traveler/"
      },
      {
        "label": "Healthcare",
        "value": "EOPYY national health-services payer - EOPYY is the central organization coordinating reimbursed healthcare services in Greece.",
        "sourceUrl": "https://www.eopyy.gov.gr/"
      },
      {
        "label": "Healthcare",
        "value": "Emergency numbers and services (Greece) - Emergency number 112 and core emergency-service access guidance.",
        "sourceUrl": "https://www.gov.gr/en/sdg/travel-and-leisure/travel-outside-greece/emergency-numbers-and-services"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "tivat-montenegro": {
    "summary": "Bay of Kotor / Coastal Montenegro. Porto Montenegro marina: >500 berths, yachts to 250 m | Nearest airport: Porto Montenegro Marina - >500 berths for yachts up to 250 metres.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Porto Montenegro marina",
        "value": ">500 berths, yachts to 250 m",
        "sourceUrl": "https://www.portomontenegro.com/marina/"
      },
      {
        "label": "Nearest airport",
        "value": "Porto Montenegro Marina - >500 berths for yachts up to 250 metres.",
        "sourceUrl": "https://www.portomontenegro.com/marina/"
      },
      {
        "label": "Healthcare",
        "value": "Dom Zdravlja Tivat - Town-level health center with official local portal.",
        "sourceUrl": "https://www.domzdravljativat.me/"
      },
      {
        "label": "Healthcare",
        "value": "General Hospital Kotor - Kotor is about 10 km from Tivat.",
        "sourceUrl": "https://www.generalhospitalkotor.me/"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "tokyo-japan": {
    "summary": "Japan. Nearest airport: Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration. | Nearest airport: Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration.",
        "sourceUrl": "https://tokyo-haneda.com/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
        "sourceUrl": "https://www.narita-airport.jp/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Kansai International Airport (KIX) - Major international access node for Osaka, Kyoto, Kobe, and nearby regions.",
        "sourceUrl": "https://www.kansai-airport.or.jp/en/"
      },
      {
        "label": "Healthcare",
        "value": "Foreign resident support portal - Government support portal for foreigners living in Japan with links to medical care, pensions, tax, and local procedures.",
        "sourceUrl": "https://www.moj.go.jp/isa/support/portal/index.html"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "toledo-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "tomar-portugal": {
    "summary": "Portugal. Nearest airport: ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways. | Healthcare: SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways.",
        "sourceUrl": "https://www.ana.pt/en"
      },
      {
        "label": "Healthcare",
        "value": "SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
        "sourceUrl": "https://www.sns24.gov.pt/en/"
      },
      {
        "label": "Residency",
        "value": "AIMA migration authority - Primary authority for migration services and resident support pathways in Portugal.",
        "sourceUrl": "https://aima.gov.pt/en"
      },
      {
        "label": "Residency",
        "value": "gov.pt residence guidance - Official gov.pt guidance covers residence for up to and over 3 months and permanent-residence pathways.",
        "sourceUrl": "https://www2.gov.pt/en/cidadaos-europeus-viajar-viver-e-fazer-negocios-em-portugal/viver-em-portugal/residir-em-portugal"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "tossa-de-mar-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "toulon-france": {
    "summary": "France. Healthcare: France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures. | Healthcare: French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811"
      },
      {
        "label": "Healthcare",
        "value": "French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
        "sourceUrl": "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile"
      },
      {
        "label": "Residency",
        "value": "France-Visas official portal - Official portal for checking visa requirements, completing applications, and tracking status.",
        "sourceUrl": "https://france-visas.gouv.fr/en/"
      },
      {
        "label": "Residency",
        "value": "Residence permits and foreigner documents in France - Government directory of residence permits and stay-document pathways for foreign nationals in France.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N110"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "tours-france": {
    "summary": "France. Healthcare: France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures. | Healthcare: French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811"
      },
      {
        "label": "Healthcare",
        "value": "French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
        "sourceUrl": "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile"
      },
      {
        "label": "Residency",
        "value": "France-Visas official portal - Official portal for checking visa requirements, completing applications, and tracking status.",
        "sourceUrl": "https://france-visas.gouv.fr/en/"
      },
      {
        "label": "Residency",
        "value": "Residence permits and foreigner documents in France - Government directory of residence permits and stay-document pathways for foreign nationals in France.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N110"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "toyama-japan": {
    "summary": "Japan. Nearest airport: Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration. | Nearest airport: Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration.",
        "sourceUrl": "https://tokyo-haneda.com/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
        "sourceUrl": "https://www.narita-airport.jp/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Kansai International Airport (KIX) - Major international access node for Osaka, Kyoto, Kobe, and nearby regions.",
        "sourceUrl": "https://www.kansai-airport.or.jp/en/"
      },
      {
        "label": "Healthcare",
        "value": "Foreign resident support portal - Government support portal for foreigners living in Japan with links to medical care, pensions, tax, and local procedures.",
        "sourceUrl": "https://www.moj.go.jp/isa/support/portal/index.html"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "trento-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "treviso-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "trieste-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "trogir-croatia": {
    "summary": "Croatia. Nearest airport: Zagreb Airport (ZAG) - Key year-round network node for inland and coastal onward connections. | Nearest airport: Split Airport (SPU) - Core Dalmatian air gateway with significant seasonal route expansion.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Zagreb Airport (ZAG) - Key year-round network node for inland and coastal onward connections.",
        "sourceUrl": "https://www.zag.aero/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Split Airport (SPU) - Core Dalmatian air gateway with significant seasonal route expansion.",
        "sourceUrl": "https://www.split-airport.hr/index.php?lang=en"
      },
      {
        "label": "Healthcare",
        "value": "Croatian Health Insurance Fund (HZZO) - HZZO is the country-level institution for health insurance administration and coverage information.",
        "sourceUrl": "https://hzzo.hr/en/"
      },
      {
        "label": "Healthcare",
        "value": "Emergency numbers in Croatia - 112 is the common free emergency number for ambulance, fire/rescue, and police services.",
        "sourceUrl": "https://vlada.gov.hr/need-emergency-help/16125"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "turin-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "udine-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "ulcinj-montenegro": {
    "summary": "Verification: Data verification in progress | Verification: Data verification in progress",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Verification",
        "value": "Data verification in progress"
      },
      {
        "label": "Verification",
        "value": "Data verification in progress"
      },
      {
        "label": "Verification",
        "value": "Data verification in progress"
      }
    ],
    "lowCoverage": true,
    "source": "merged_seed"
  },
  "uzes-france": {
    "summary": "France. Healthcare: France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures. | Healthcare: French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811"
      },
      {
        "label": "Healthcare",
        "value": "French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
        "sourceUrl": "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile"
      },
      {
        "label": "Residency",
        "value": "France-Visas official portal - Official portal for checking visa requirements, completing applications, and tracking status.",
        "sourceUrl": "https://france-visas.gouv.fr/en/"
      },
      {
        "label": "Residency",
        "value": "Residence permits and foreigner documents in France - Government directory of residence permits and stay-document pathways for foreign nationals in France.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N110"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "valencia-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "valladolid-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "vannes-france": {
    "summary": "France. Healthcare: France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures. | Healthcare: French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "France social and health public-services portal - Government index covering social security, reimbursements, patient rights, and health-service procedures.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N19811"
      },
      {
        "label": "Healthcare",
        "value": "French civil security preparedness framework - Official national civil-security reference with crisis-readiness and emergency-management context.",
        "sourceUrl": "https://www.interieur.gouv.fr/actualites/grands-dossiers/beauvau-de-securite-civile"
      },
      {
        "label": "Residency",
        "value": "France-Visas official portal - Official portal for checking visa requirements, completing applications, and tracking status.",
        "sourceUrl": "https://france-visas.gouv.fr/en/"
      },
      {
        "label": "Residency",
        "value": "Residence permits and foreigner documents in France - Government directory of residence permits and stay-document pathways for foreign nationals in France.",
        "sourceUrl": "https://www.service-public.gouv.fr/particuliers/vosdroits/N110"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "varazdin-croatia": {
    "summary": "Croatia. Nearest airport: Zagreb Airport (ZAG) - Key year-round network node for inland and coastal onward connections. | Nearest airport: Split Airport (SPU) - Core Dalmatian air gateway with significant seasonal route expansion.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Zagreb Airport (ZAG) - Key year-round network node for inland and coastal onward connections.",
        "sourceUrl": "https://www.zag.aero/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Split Airport (SPU) - Core Dalmatian air gateway with significant seasonal route expansion.",
        "sourceUrl": "https://www.split-airport.hr/index.php?lang=en"
      },
      {
        "label": "Healthcare",
        "value": "Croatian Health Insurance Fund (HZZO) - HZZO is the country-level institution for health insurance administration and coverage information.",
        "sourceUrl": "https://hzzo.hr/en/"
      },
      {
        "label": "Healthcare",
        "value": "Emergency numbers in Croatia - 112 is the common free emergency number for ambulance, fire/rescue, and police services.",
        "sourceUrl": "https://vlada.gov.hr/need-emergency-help/16125"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "varenna-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "verona-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "viana-do-castelo-portugal": {
    "summary": "Portugal. Nearest airport: ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways. | Healthcare: SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways.",
        "sourceUrl": "https://www.ana.pt/en"
      },
      {
        "label": "Healthcare",
        "value": "SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
        "sourceUrl": "https://www.sns24.gov.pt/en/"
      },
      {
        "label": "Residency",
        "value": "AIMA migration authority - Primary authority for migration services and resident support pathways in Portugal.",
        "sourceUrl": "https://aima.gov.pt/en"
      },
      {
        "label": "Residency",
        "value": "gov.pt residence guidance - Official gov.pt guidance covers residence for up to and over 3 months and permanent-residence pathways.",
        "sourceUrl": "https://www2.gov.pt/en/cidadaos-europeus-viajar-viver-e-fazer-negocios-em-portugal/viver-em-portugal/residir-em-portugal"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "vicenza-italy": {
    "summary": "Italy. Nearest airport: ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy. | Nearest airport: Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ENAC passenger and airport rights hub - Official regulator source for passenger rights and airport system context in Italy.",
        "sourceUrl": "https://www.enac.gov.it/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Milan Malpensa Airport (MXP) - Large international gateway relevant to many northern and central Italy relocation routes.",
        "sourceUrl": "https://www.milanomalpensa-airport.com/en"
      },
      {
        "label": "Tax",
        "value": "Italy tax residence criteria - For more than 183 days, physical presence, habitual abode, or domicile can trigger Italian tax residency.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Italy VAT, social contributions, and property taxes - Standard VAT rate is 22%, with reduced rates including 10% and 4% for listed categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/italy/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "vienna-austria": {
    "summary": "Austria. Healthcare: Federal Ministry health topics - The ministry health section provides country-level public-health and health-system policy orientation. | Healthcare: Austria emergency numbers baseline - The official portal lists single European emergency number 112 and national response numbers.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Federal Ministry health topics - The ministry health section provides country-level public-health and health-system policy orientation.",
        "sourceUrl": "https://www.sozialministerium.gv.at/en/Topics/Health.html"
      },
      {
        "label": "Healthcare",
        "value": "Austria emergency numbers baseline - The official portal lists single European emergency number 112 and national response numbers.",
        "sourceUrl": "https://www.oesterreich.gv.at/en/themen/notfaelle_unfaelle_und_kriminalitaet/notrufnummern"
      },
      {
        "label": "Residency",
        "value": "Settlement and Residence Act (NAG) - The NAG framework governs planned stays over six months and residence-permit pathways for non-Austrian nationals.",
        "sourceUrl": "https://www.bmi.gv.at/312_en/start.html"
      },
      {
        "label": "Tax",
        "value": "Austria tax residence - A person is generally regarded as resident with the establishment of an abode.",
        "sourceUrl": "https://taxsummaries.pwc.com/austria/individual/residence"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "vigo-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "vila-real-de-santo-antonio-portugal": {
    "summary": "Portugal. Nearest airport: ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways. | Healthcare: SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "ANA Portugal airport network - ANA lists and operates 10 Portugal airports, including Lisbon, Porto, Faro, Madeira, and Azores gateways.",
        "sourceUrl": "https://www.ana.pt/en"
      },
      {
        "label": "Healthcare",
        "value": "SNS 24 services - SNS 24 provides national digital-health access points and service channels.",
        "sourceUrl": "https://www.sns24.gov.pt/en/"
      },
      {
        "label": "Residency",
        "value": "AIMA migration authority - Primary authority for migration services and resident support pathways in Portugal.",
        "sourceUrl": "https://aima.gov.pt/en"
      },
      {
        "label": "Residency",
        "value": "gov.pt residence guidance - Official gov.pt guidance covers residence for up to and over 3 months and permanent-residence pathways.",
        "sourceUrl": "https://www2.gov.pt/en/cidadaos-europeus-viajar-viver-e-fazer-negocios-em-portugal/viver-em-portugal/residir-em-portugal"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "vilnius-other-europe": {
    "summary": "Verification: Data verification in progress | Verification: Data verification in progress",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Verification",
        "value": "Data verification in progress"
      },
      {
        "label": "Verification",
        "value": "Data verification in progress"
      },
      {
        "label": "Verification",
        "value": "Data verification in progress"
      }
    ],
    "lowCoverage": true,
    "source": "merged_seed"
  },
  "volos-greece": {
    "summary": "Greece. Nearest airport: Fraport Greece regional airport network - Corfu, Chania, Rhodes, Thessaloniki catchments connect through managed regional gateways. | Nearest airport: Athens International Airport (ATH) - Key long-haul and Schengen transfer node for Greek retiree travel logistics.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Fraport Greece regional airport network - Corfu, Chania, Rhodes, Thessaloniki catchments connect through managed regional gateways.",
        "sourceUrl": "https://www.fraport-greece.com/english/our-airports/"
      },
      {
        "label": "Nearest airport",
        "value": "Athens International Airport (ATH) - Key long-haul and Schengen transfer node for Greek retiree travel logistics.",
        "sourceUrl": "https://www.aia.gr/traveler/"
      },
      {
        "label": "Healthcare",
        "value": "EOPYY national health-services payer - EOPYY is the central organization coordinating reimbursed healthcare services in Greece.",
        "sourceUrl": "https://www.eopyy.gov.gr/"
      },
      {
        "label": "Healthcare",
        "value": "Emergency numbers and services (Greece) - Emergency number 112 and core emergency-service access guidance.",
        "sourceUrl": "https://www.gov.gr/en/sdg/travel-and-leisure/travel-outside-greece/emergency-numbers-and-services"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "wrocaw-other-europe": {
    "summary": "Verification: Data verification in progress | Verification: Data verification in progress",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Verification",
        "value": "Data verification in progress"
      },
      {
        "label": "Verification",
        "value": "Data verification in progress"
      },
      {
        "label": "Verification",
        "value": "Data verification in progress"
      }
    ],
    "lowCoverage": true,
    "source": "merged_seed"
  },
  "yokohama-japan": {
    "summary": "Japan. Nearest airport: Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration. | Nearest airport: Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Haneda Airport (HND) - Major domestic and international gateway with extensive metropolitan ground-transport integration.",
        "sourceUrl": "https://tokyo-haneda.com/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Narita International Airport (NRT) - Global long-haul network hub with official access, floor, clinic, and operations guidance.",
        "sourceUrl": "https://www.narita-airport.jp/en/"
      },
      {
        "label": "Nearest airport",
        "value": "Kansai International Airport (KIX) - Major international access node for Osaka, Kyoto, Kobe, and nearby regions.",
        "sourceUrl": "https://www.kansai-airport.or.jp/en/"
      },
      {
        "label": "Healthcare",
        "value": "Foreign resident support portal - Government support portal for foreigners living in Japan with links to medical care, pensions, tax, and local procedures.",
        "sourceUrl": "https://www.moj.go.jp/isa/support/portal/index.html"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "zadar-croatia": {
    "summary": "Croatia. Nearest airport: Zagreb Airport (ZAG) - Key year-round network node for inland and coastal onward connections. | Nearest airport: Split Airport (SPU) - Core Dalmatian air gateway with significant seasonal route expansion.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Zagreb Airport (ZAG) - Key year-round network node for inland and coastal onward connections.",
        "sourceUrl": "https://www.zag.aero/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Split Airport (SPU) - Core Dalmatian air gateway with significant seasonal route expansion.",
        "sourceUrl": "https://www.split-airport.hr/index.php?lang=en"
      },
      {
        "label": "Healthcare",
        "value": "Croatian Health Insurance Fund (HZZO) - HZZO is the country-level institution for health insurance administration and coverage information.",
        "sourceUrl": "https://hzzo.hr/en/"
      },
      {
        "label": "Healthcare",
        "value": "Emergency numbers in Croatia - 112 is the common free emergency number for ambulance, fire/rescue, and police services.",
        "sourceUrl": "https://vlada.gov.hr/need-emergency-help/16125"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "zagreb-croatia": {
    "summary": "Croatia. Nearest airport: Zagreb Airport (ZAG) - Key year-round network node for inland and coastal onward connections. | Nearest airport: Split Airport (SPU) - Core Dalmatian air gateway with significant seasonal route expansion.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Zagreb Airport (ZAG) - Key year-round network node for inland and coastal onward connections.",
        "sourceUrl": "https://www.zag.aero/en/passengers"
      },
      {
        "label": "Nearest airport",
        "value": "Split Airport (SPU) - Core Dalmatian air gateway with significant seasonal route expansion.",
        "sourceUrl": "https://www.split-airport.hr/index.php?lang=en"
      },
      {
        "label": "Healthcare",
        "value": "Croatian Health Insurance Fund (HZZO) - HZZO is the country-level institution for health insurance administration and coverage information.",
        "sourceUrl": "https://hzzo.hr/en/"
      },
      {
        "label": "Healthcare",
        "value": "Emergency numbers in Croatia - 112 is the common free emergency number for ambulance, fire/rescue, and police services.",
        "sourceUrl": "https://vlada.gov.hr/need-emergency-help/16125"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "zaragoza-spain": {
    "summary": "Spain. Healthcare: Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources. | Residency: Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Healthcare",
        "value": "Spanish Ministry of Health - Official national health portal with links to health areas, citizen services, and system resources.",
        "sourceUrl": "https://www.sanidad.gob.es/en/home.htm"
      },
      {
        "label": "Residency",
        "value": "Spain immigration procedures - Official foreigners section covering residence, circulation, and immigration procedures in Spain.",
        "sourceUrl": "https://www.interior.gob.es/opencms/en/servicios-al-ciudadano/tramites-y-gestiones/extranjeria/"
      },
      {
        "label": "Tax",
        "value": "Spain tax residence - Tax residence generally applies when spending more than 183 days in Spain in a calendar year.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/residence"
      },
      {
        "label": "Tax",
        "value": "Spain VAT, social contributions, and wealth/property tax context - Standard VAT rate is 21%, with reduced rates including 10% and 4% for specified categories.",
        "sourceUrl": "https://taxsummaries.pwc.com/spain/individual/other-taxes"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "belo-horizonte-brazil": {
    "summary": "Brazil. Belo Horizonte stands out for a green, high-amenity urban rhythm with strong healthcare, education, and neighborhood variety, while traffic and climate still matter for long-stay planning.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Lifestyle",
        "value": "The city is especially appealing to people who want a large urban base with parks, dining, and a more manageable daily pace than many Brazilian metros."
      },
      {
        "label": "Climate",
        "value": "Belo Horizonte has a mild highland climate that makes the city feel more comfortable than many tropical capitals for much of the year."
      },
      {
        "label": "Transportation",
        "value": "Metro lines, buses, and airport access make the city practical for daily living, though traffic still shapes neighborhood choice."
      },
      {
        "label": "Neighborhood fit",
        "value": "The strongest long-stay fit tends to be a district that balances access to services, green space, and quieter residential streets."
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "curitiba-brazil": {
    "summary": "Brazil. Curitiba is known for cooler weather, extensive parks, and one of Latin America’s most recognizable bus rapid transit systems, which gives it a strong practical edge for long-stay living.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Lifestyle",
        "value": "Curitiba is especially compelling for families and professionals who value parks, culture, and a more structured daily rhythm."
      },
      {
        "label": "Climate",
        "value": "The highland climate is cooler and more forgiving than many Brazilian cities, with mild summers and cooler winters."
      },
      {
        "label": "Transportation",
        "value": "The BRT network is one of the city’s clearest strengths, making daily movement easier than in many comparable capitals."
      },
      {
        "label": "Neighborhood fit",
        "value": "The best fit often comes from choosing a district that balances transit access, safety, and access to green space."
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "florianopolis-brazil": {
    "summary": "Brazil. Florianópolis combines island scenery, beaches, and a growing technology economy, but its appeal depends heavily on choosing a neighborhood that works for everyday life rather than just vacation living.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Lifestyle",
        "value": "The city is strongest for people who want beach access, outdoor life, and a more scenic coastal routine while still keeping urban services nearby."
      },
      {
        "label": "Climate",
        "value": "The climate is warm and humid with strong seasonal variation, and ocean conditions make microclimates feel very different across the island."
      },
      {
        "label": "Transportation",
        "value": "Island travel can be slow and car-dependent in some areas, so the home base matters more than in a more compact city."
      },
      {
        "label": "Neighborhood fit",
        "value": "A strong long-stay fit usually depends on balancing beach access with daily errands, bridge travel, and traffic tolerance."
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "maringa-brazil": {
    "summary": "Brazil. Maringá is a well-planned city with strong greenery, solid services, and a practical urban layout that makes it appealing for families and long-stay residents seeking steadiness over spectacle.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Lifestyle",
        "value": "The city is especially appealing for families and residents who want a greener, more orderly daily environment with reliable services."
      },
      {
        "label": "Climate",
        "value": "Maringá has a humid subtropical climate with hot summers and mild winters, so comfort planning matters in the warmest months."
      },
      {
        "label": "Transportation",
        "value": "Airport access and regional road connections support mobility, though the city remains more practical than glamorous for most long-stay residents."
      },
      {
        "label": "Neighborhood fit",
        "value": "The best fit usually comes from a neighborhood that combines greenery, daily convenience, and a calm residential feel."
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "porto-alegre-brazil": {
    "summary": "Brazil. Porto Alegre stands out for universities, healthcare, cultural life, and a dense urban feel, but the strongest case depends on balancing those benefits against flood risk and neighborhood variation.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Lifestyle",
        "value": "The city suits people who want a major-city cultural scene, strong healthcare, and a more intellectually engaged everyday rhythm."
      },
      {
        "label": "Climate",
        "value": "Porto Alegre has a humid subtropical climate with warm summers and cooler winters, with rain and seasonal swings shaping daily life."
      },
      {
        "label": "Transportation",
        "value": "Airport access and urban transit support daily movement, though flood risk and traffic still require careful neighborhood selection."
      },
      {
        "label": "Neighborhood fit",
        "value": "The best long-stay fit is usually a district that balances services, safety, and lower flood exposure."
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "campinas-brazil": {
    "summary": "Brazil. Campinas is a strong choice for people who want a large-service city with universities, technology, and healthcare, while accepting traffic and a more competitive housing market.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Lifestyle",
        "value": "The city works well for professionals and families who want a more practical urban base with strong employment and service density."
      },
      {
        "label": "Climate",
        "value": "Campinas has a warm climate with a clear wet season, which makes indoor comfort and shade planning important."
      },
      {
        "label": "Transportation",
        "value": "Airport access and road connectivity make the city very workable, even though traffic can become a major daily friction point."
      },
      {
        "label": "Neighborhood fit",
        "value": "The strongest long-stay fit tends to be a district that balances job access, schools, and a calmer residential rhythm."
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "joao-pessoa-brazil": {
    "summary": "Brazil. João Pessoa is appealing for people who want a calmer coastal capital with beaches, lower costs, and a slower daily rhythm than larger Brazilian metros.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Lifestyle",
        "value": "The city suits long-stay residents who want beaches, greenery, and a gentler tempo without giving up urban services."
      },
      {
        "label": "Climate",
        "value": "The climate is hot and humid for much of the year, so comfort planning matters more than in cooler southern cities."
      },
      {
        "label": "Transportation",
        "value": "Local connectivity is practical for day-to-day life, while airport access is adequate rather than world-class."
      },
      {
        "label": "Neighborhood fit",
        "value": "The best fit is usually a coastal district or an interior neighborhood that balances quiet living with everyday convenience."
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "maceio-brazil": {
    "summary": "Brazil. Maceió combines bright beaches, a strong coastal identity, and fairly approachable costs, which gives it a strong appeal for people who want tropical living without a giant-city pace.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Lifestyle",
        "value": "The city is strongest for beach-oriented residents who want water access, a lively seafront, and a manageable daily rhythm."
      },
      {
        "label": "Climate",
        "value": "The tropical climate is warm and humid year-round, which makes ocean breezes and indoor comfort planning especially important."
      },
      {
        "label": "Transportation",
        "value": "Airport and local transport are workable, but the city is most appealing when daily life is built around a well-chosen base."
      },
      {
        "label": "Neighborhood fit",
        "value": "The best fit is usually a district that balances beach access with safety, errands, and less hectic streets."
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "natal-brazil": {
    "summary": "Brazil. Natal stands out for dunes, beaches, and a relaxed coastal rhythm, making it especially attractive to people who want warmth and easy outdoor living.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Lifestyle",
        "value": "The city fits beach lovers and long-stay residents who value lower costs, strong sun, and a slower coastal lifestyle."
      },
      {
        "label": "Climate",
        "value": "The tropical climate is warm and sunny for most of the year, with steady winds that make the coast feel more comfortable than the heat alone suggests."
      },
      {
        "label": "Transportation",
        "value": "Airport and local transit are sufficient for everyday life, though the city stays most practical when home and beach access are close."
      },
      {
        "label": "Neighborhood fit",
        "value": "The strongest long-stay fit usually comes from a neighborhood that keeps the beach, services, and daily errands within a simple loop."
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "vitoria-brazil": {
    "summary": "Brazil. Vitória offers a compact island-capital experience with beaches, a strong healthcare base, and a more manageable scale than Brazil’s largest metropolises.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Lifestyle",
        "value": "The city suits professionals and long-stay residents who want coastal living, city services, and a less overwhelming urban scale."
      },
      {
        "label": "Climate",
        "value": "The tropical climate is warm and humid, but the coastal setting makes it feel more livable than inland heat would suggest."
      },
      {
        "label": "Transportation",
        "value": "Local transit and airport access make the city practical for everyday living, especially when the home base is selected with movement in mind."
      },
      {
        "label": "Neighborhood fit",
        "value": "The best fit often comes from a waterfront or near-water district that balances views, access, and calm daily routines."
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "balneario-camboriu-brazil": {
    "summary": "Brazil. Balneário Camboriú is a high-energy beach destination where modern amenities, waterfront living, and a resort-like atmosphere shape the long-stay case.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Lifestyle",
        "value": "The city is strongest for people who want a polished beachfront lifestyle with strong service density and a more resort-like daily rhythm."
      },
      {
        "label": "Climate",
        "value": "The climate is warm, humid, and very beach-oriented, which makes the coast feel like the main feature of daily life."
      },
      {
        "label": "Transportation",
        "value": "Airport access is convenient for a beach city, but the experience is still shaped by seasonal traffic and the need to plan around busy periods."
      },
      {
        "label": "Neighborhood fit",
        "value": "The best long-stay fit is usually a quieter district that balances sea access with everyday convenience and less noise."
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "gramado-brazil": {
    "summary": "Brazil. Gramado is a cooler, more polished mountain-resort city where safety, scenery, and a slower pace give it a distinctive long-stay profile.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Lifestyle",
        "value": "The city suits residents who want charm, cooler weather, and a more curated daily experience centered on food, nature, and leisure."
      },
      {
        "label": "Climate",
        "value": "The highland climate is cooler and more comfortable than many Brazilian coastal cities, especially in the warmer months."
      },
      {
        "label": "Transportation",
        "value": "Airport access is good enough for a resort city, though the place is most enjoyable when daily movement stays simple and local."
      },
      {
        "label": "Neighborhood fit",
        "value": "The strongest fit usually comes from a neighborhood that offers calm, easy access to restaurants, and a less tourist-heavy rhythm."
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "niteroi-brazil": {
    "summary": "Brazil. Niterói is a bay-facing city that combines coastal scenery, urban convenience, and easy access to Rio, which makes it attractive to people who want a more polished city edge without leaving the region.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Lifestyle",
        "value": "The city suits people who want coastal living, urban services, and access to a larger regional cultural scene."
      },
      {
        "label": "Climate",
        "value": "The tropical climate is warm and humid, but the bay setting and sea breezes make the experience feel more varied than inland heat would suggest."
      },
      {
        "label": "Transportation",
        "value": "Ferries and road access make the city especially practical for people who want Rio access without living in the core."
      },
      {
        "label": "Neighborhood fit",
        "value": "The best fit is usually a district that balances bay views, access to services, and a calmer residential feel."
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "ribeirao-preto-brazil": {
    "summary": "Brazil. Ribeirão Preto is a strong utility-driven city with healthcare, education, and agribusiness strength, making it attractive to people who value services over spectacle.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Lifestyle",
        "value": "The city works especially well for families and professionals who want a practical urban base with strong healthcare and education options."
      },
      {
        "label": "Climate",
        "value": "The climate is warm with a clear dry season, so comfort planning matters most in the hottest months."
      },
      {
        "label": "Transportation",
        "value": "Airport access and road connectivity make the city practical, especially for people who are comfortable with a more car-oriented routine."
      },
      {
        "label": "Neighborhood fit",
        "value": "The best fit tends to be a district that balances services, safety, and a quieter residential rhythm."
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "santos-brazil": {
    "summary": "Brazil. Santos offers beach living, port identity, and healthcare access in a more compact urban setting, which makes it attractive to people who want a coastal base without the scale of São Paulo.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Lifestyle",
        "value": "The city suits residents who want seaside living, a lower-key urban rhythm, and a strong healthcare and service base."
      },
      {
        "label": "Climate",
        "value": "The climate is hot and humid, and the coast makes daily life feel more comfortable when the home base is well chosen."
      },
      {
        "label": "Transportation",
        "value": "Road access and proximity to São Paulo airports make the city practical, although commute patterns still matter."
      },
      {
        "label": "Neighborhood fit",
        "value": "The strongest fit often comes from a neighborhood that balances beach access, quieter streets, and everyday convenience."
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "joinville-brazil": {
    "summary": "Brazil. Joinville stands out for a more orderly urban feel, solid infrastructure, and a strong family-oriented lifestyle that makes it appealing beyond pure industrial appeal.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Lifestyle",
        "value": "The city fits families and professionals who want good infrastructure, moderate costs, and a calmer suburban feel than larger Brazilian metros."
      },
      {
        "label": "Climate",
        "value": "The humid subtropical climate is generally comfortable, though summer humidity and rain can still shape daily routines."
      },
      {
        "label": "Transportation",
        "value": "Local transit and airport access make the city practical, even though the urban footprint is still shaped by car use."
      },
      {
        "label": "Neighborhood fit",
        "value": "The strongest long-stay fit usually comes from a neighborhood that balances green space, daily convenience, and a calmer residential pace."
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "ajijic-mexico": {
    "summary": "Mexico. Ajijic is especially compelling for people who want a mild-climate lakeside community with a strong long-stay identity and access to Guadalajara.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Lifestyle",
        "value": "The town is strongest for people who want a community-centered life with lake views, everyday services, and a more relaxed pace."
      },
      {
        "label": "Climate",
        "value": "The highland climate is mild and forgiving, which is one of the main reasons the place resonates with long-stay residents."
      },
      {
        "label": "Transportation",
        "value": "Guadalajara access is a major practical advantage, though the town still depends on a chosen base for daily comfort."
      },
      {
        "label": "Neighborhood fit",
        "value": "The best fit is usually a neighborhood that balances lake access, quieter streets, and easy proximity to daily services."
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "chapala-mexico": {
    "summary": "Mexico. Chapala is attractive to long-stay residents who want lake views, lower costs, and a gentler rhythm than larger Mexican cities.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Lifestyle",
        "value": "The town suits residents who want a slower lakeside life with local commerce, community, and outdoor access."
      },
      {
        "label": "Climate",
        "value": "The climate is mild and comfortable for much of the year, which makes it easier to live outdoors than in hotter inland destinations."
      },
      {
        "label": "Transportation",
        "value": "Guadalajara airport is a clear plus, though the town remains more about lifestyle than rapid urban mobility."
      },
      {
        "label": "Neighborhood fit",
        "value": "The best fit tends to be a spot that balances lakefront beauty with practical access to groceries, clinics, and daily errands."
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "grecia-costa-rica": {
    "summary": "Costa Rica. Grecia is compelling for people who want coffee-country scenery, mild weather, and a small-town lifestyle without losing basic services.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Lifestyle",
        "value": "The town suits long-stay residents who want a slower pace, community life, and access to nature without fully leaving urban convenience behind."
      },
      {
        "label": "Climate",
        "value": "The highland climate is mild and easy to live with, which is one of the place’s strongest advantages."
      },
      {
        "label": "Transportation",
        "value": "Regional road access keeps the city practical for everyday life, though the place is still best understood as a small-town base."
      },
      {
        "label": "Neighborhood fit",
        "value": "The strongest fit usually comes from a neighborhood that balances quiet streets with practical access to shops and services."
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "liberia-costa-rica": {
    "summary": "Costa Rica. Liberia is attractive to people who want airport access, Guanacaste beaches, and a practical gateway city that supports outdoor living.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Lifestyle",
        "value": "The city works well for residents who want beach access, nature, and a practical hub without needing a large metropolis."
      },
      {
        "label": "Climate",
        "value": "The climate is warm and dry for much of the year, with a clear seasonal rhythm that shapes daily life."
      },
      {
        "label": "Transportation",
        "value": "Airport access is a major strength, and the city is especially easy to recommend for people who value mobility."
      },
      {
        "label": "Neighborhood fit",
        "value": "The best long-stay fit usually comes from a district that balances beach access, errands, and less hectic streets."
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "tamarindo-costa-rica": {
    "summary": "Costa Rica. Tamarindo attracts people who want surf, a busy beach-town social scene, and a strong international community, while accepting higher costs and seasonal crowds.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Lifestyle",
        "value": "The town is strongest for people who want a beach-oriented lifestyle with nightlife, dining, and a social rhythm that feels active."
      },
      {
        "label": "Climate",
        "value": "The climate is warm and sunny for much of the year, with a clear wet season that changes the pace of daily life."
      },
      {
        "label": "Transportation",
        "value": "Liberia airport makes the place practical for international arrivals, but the town still depends on timing and planning."
      },
      {
        "label": "Neighborhood fit",
        "value": "The strongest fit usually comes from a neighborhood that balances beach access with a quieter residential feel."
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "san-isidro-de-el-general-costa-rica": {
    "summary": "Costa Rica. San Isidro de El General is appealing to people who want a lower-cost mountain base with a local feel, access to nature, and a more grounded daily rhythm.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Lifestyle",
        "value": "The town suits long-stay residents who want affordability, mountain scenery, and a slower local pace."
      },
      {
        "label": "Climate",
        "value": "The highland climate is mild and green, though seasonal rain can shape comfort and travel."
      },
      {
        "label": "Transportation",
        "value": "Road access keeps it connected to San José and the coast, though the place is still best for people who value practicality over speed."
      },
      {
        "label": "Neighborhood fit",
        "value": "The best fit is usually a district that balances daily needs with quiet residential streets and mountain views."
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "quito-ecuador": {
    "summary": "Ecuador. Quito is attractive to people who want major hospitals, deep cultural texture, and an Andean setting without giving up a large-city service base.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Lifestyle",
        "value": "The city suits residents who want a big historic capital with strong healthcare, education, and everyday urban variety."
      },
      {
        "label": "Climate",
        "value": "The altitude makes the climate mild and more livable than the equator suggests, though the air is thinner and comfort can vary."
      },
      {
        "label": "Transportation",
        "value": "Airport access and urban transit make it practical, though traffic and elevation still shape day-to-day movement."
      },
      {
        "label": "Neighborhood fit",
        "value": "The strongest fit usually comes from a district that balances historic charm with safety, services, and less steep terrain."
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "ambato-ecuador": {
    "summary": "Ecuador. Ambato is appealing for residents who want a central Andean city with lower costs, practical services, and a more understated daily rhythm.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Lifestyle",
        "value": "The city works especially well for families and long-stay residents who prioritize value, commerce, and an easier daily pace than Quito."
      },
      {
        "label": "Climate",
        "value": "The highland climate is mild and consistent, which helps the city feel comfortable for much of the year."
      },
      {
        "label": "Transportation",
        "value": "Regional transport makes the city practical, though it remains more about everyday usefulness than major international mobility."
      },
      {
        "label": "Neighborhood fit",
        "value": "The best fit tends to be a neighborhood that balances lower cost with access to daily services and quieter streets."
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "valdivia-chile": {
    "summary": "Chile. Valdivia is attractive to people who want a riverside city with a strong nature connection, a slower pace, and a climate that feels softer than much of southern Chile.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Lifestyle",
        "value": "The city suits people who want a smaller urban base with access to forests, rivers, and a very livable outdoor lifestyle."
      },
      {
        "label": "Climate",
        "value": "The weather is mild and green, with a strong link between the landscape and day-to-day comfort."
      },
      {
        "label": "Transportation",
        "value": "Regional access is workable, though the city is more compelling for lifestyle fit than for fast mobility."
      },
      {
        "label": "Neighborhood fit",
        "value": "The best fit usually comes from a district that balances river access with practical everyday convenience."
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "puerto-varas-chile": {
    "summary": "Chile. Puerto Varas is especially appealing for people who want lakeside scenery, a strong outdoor culture, and a calmer pace than larger Chilean cities.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Lifestyle",
        "value": "The town suits residents who want a scenic lakefront life with walking, nature, and a quieter daily rhythm."
      },
      {
        "label": "Climate",
        "value": "The climate is cool, fresh, and highly attractive for people who value nature over heat."
      },
      {
        "label": "Transportation",
        "value": "The city is more practical than dramatic in terms of transit, but the setting still makes daily life feel very rewarding."
      },
      {
        "label": "Neighborhood fit",
        "value": "The strongest fit usually comes from a neighborhood that balances lake views with access to groceries, services, and a calmer street life."
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "cartago-costa-rica": {
    "summary": "Costa Rica. Cartago is especially compelling for people who want historic character, cooler weather, and a more grounded Central Valley lifestyle than the larger capital areas.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Lifestyle",
        "value": "The city works well for families and long-stay residents who value culture, affordability, and a cooler climate without giving up services."
      },
      {
        "label": "Climate",
        "value": "The highland climate is notably cooler and more comfortable than many tropical destinations, which is one of its strongest appeals."
      },
      {
        "label": "Transportation",
        "value": "Access to San José makes the city practical, especially for people who want a quieter base with good regional connectivity."
      },
      {
        "label": "Neighborhood fit",
        "value": "The best fit is usually a neighborhood that balances local character with everyday convenience and less urban stress."
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "mazatlan-mexico": {
    "summary": "Mexico. Mazatlán combines beach living, a historic center, and strong value, which makes it especially appealing to people who want a lively coastal city without the intensity of a megacity.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Lifestyle",
        "value": "The city suits long-stay residents who want a more active seafront life, local culture, and a manageable daily rhythm."
      },
      {
        "label": "Climate",
        "value": "The climate is warm and tropical, with enough humidity to make comfort planning more important than in drier coastal regions."
      },
      {
        "label": "Transportation",
        "value": "Airport access and the port make the city practical for both visitors and residents, even if daily traffic still matters."
      },
      {
        "label": "Neighborhood fit",
        "value": "The strongest fit usually comes from a district that balances beach access with a quieter residential feel."
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "puerto-escondido-mexico": {
    "summary": "Mexico. Puerto Escondido appeals to people who want surf, an easygoing coastal pace, and a lower-cost base than more polished beach towns.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Lifestyle",
        "value": "The destination is strongest for surfers, remote workers, and long-stay residents who want a more relaxed coastal routine."
      },
      {
        "label": "Climate",
        "value": "The tropical climate is hot and humid, and the beach setting makes the heat feel more central to daily life than in inland towns."
      },
      {
        "label": "Transportation",
        "value": "Airport access is enough for a beach destination, but the town is still most appealing when day-to-day logistics are kept simple."
      },
      {
        "label": "Neighborhood fit",
        "value": "The best fit usually comes from a neighborhood that balances beach access with convenience and less disruption from tourism."
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "todos-santos-mexico": {
    "summary": "Mexico. Todos Santos is attractive to people who want an artsy Baja setting with beaches, desert scenery, and a small-town pace.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Lifestyle",
        "value": "The town suits artists and long-stay residents who want a quieter coastal life with strong local character."
      },
      {
        "label": "Climate",
        "value": "The arid climate is sunny and dry, with strong seasonal contrast that makes the place feel very different from humid coastal cities."
      },
      {
        "label": "Transportation",
        "value": "Los Cabos airport makes the place practical for arrivals, though the town still feels more intimate than connected."
      },
      {
        "label": "Neighborhood fit",
        "value": "The strongest fit is usually a district that balances beach access with a calmer residential atmosphere."
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "alajuela-costa-rica": {
    "summary": "Costa Rica. Alajuela is compelling for people who want airport access, Central Valley services, and a practical base that supports daily life without excess complexity.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Lifestyle",
        "value": "The city suits families and long-stay residents who want convenience, everyday services, and a more functional urban pace."
      },
      {
        "label": "Climate",
        "value": "The highland climate is warm and comfortable, with enough seasonal variation to make the place feel livable year-round."
      },
      {
        "label": "Transportation",
        "value": "Airport access is one of the city’s clearest strengths, especially for residents who value easy arrivals and departures."
      },
      {
        "label": "Neighborhood fit",
        "value": "The best fit is usually a district that balances urban convenience with a quieter residential feel."
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "atenas-costa-rica": {
    "summary": "Costa Rica. Atenas appeals to people who want cool mountain air, a calmer pace, and a strong expat-friendly community without sacrificing access to the Central Valley.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Lifestyle",
        "value": "The town is strongest for long-stay residents who want tranquility, community, and a more manageable daily rhythm."
      },
      {
        "label": "Climate",
        "value": "The climate is mild and highly attractive, with cooler evenings that make the town feel more comfortable than many tropical settings."
      },
      {
        "label": "Transportation",
        "value": "Road access keeps the town connected, though the place is still most appealing for people who value lifestyle over urban intensity."
      },
      {
        "label": "Neighborhood fit",
        "value": "The best fit is usually a neighborhood that balances views, quiet streets, and practical access to services."
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "coronado-panama": {
    "summary": "Panama. Coronado is attractive for people who want a developed beach community with clinics, supermarkets, and an easy path to Panama City.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Lifestyle",
        "value": "The town suits long-stay residents who want beach access, a stronger service base, and a more convenient daily setup than a remote village."
      },
      {
        "label": "Climate",
        "value": "The tropical climate is warm and humid, but the coast keeps the experience more comfortable than inland heat would suggest."
      },
      {
        "label": "Transportation",
        "value": "Highway access makes the place practical, especially for people who want Panama City access without living in the capital."
      },
      {
        "label": "Neighborhood fit",
        "value": "The strongest fit usually comes from a neighborhood that balances beach access with daily errands and less weekend traffic."
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "el-valle-de-anton-panama": {
    "summary": "Panama. El Valle de Antón is compelling for people who want cooler mountain weather, nature access, and a more intimate small-town rhythm.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Lifestyle",
        "value": "The town is strongest for long-stay residents and outdoor enthusiasts who want a slower pace and a cooler climate than the coast."
      },
      {
        "label": "Climate",
        "value": "The highland climate is one of the town’s greatest assets, offering cooler temperatures and a very different feel from Panama’s lower elevations."
      },
      {
        "label": "Transportation",
        "value": "The town remains more about lifestyle than mobility, so the best fits are usually people comfortable with a more self-directed routine."
      },
      {
        "label": "Neighborhood fit",
        "value": "The best fit usually comes from a spot that balances mountain views, quiet streets, and practical access to services."
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "las-tablas-panama": {
    "summary": "Panama. Las Tablas appeals to people who want affordability, traditional culture, and a small-town pace with Pacific beach access nearby.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Lifestyle",
        "value": "The town suits long-stay residents who want authenticity, a slower pace, and a lower-cost daily rhythm."
      },
      {
        "label": "Climate",
        "value": "The climate is warm and tropical, with a clear dry season that makes comfort planning more predictable than in wetter regions."
      },
      {
        "label": "Transportation",
        "value": "Regional roads keep it connected enough for day-to-day life, though the town is not primarily about mobility or urban convenience."
      },
      {
        "label": "Neighborhood fit",
        "value": "The strongest fit usually comes from a neighborhood that balances local culture, quiet streets, and practical access to services."
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "cumbaya-ecuador": {
    "summary": "Ecuador. Cumbayá is attractive to people who want upscale valley living, strong schools, and a quieter, more curated environment close to Quito.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Lifestyle",
        "value": "The area suits families and expats who want convenience, educational options, and a more polished suburban setting."
      },
      {
        "label": "Climate",
        "value": "The mild highland climate is one of the main reasons the area feels so livable, especially compared with hotter lowland cities."
      },
      {
        "label": "Transportation",
        "value": "Quito airport access is a clear practical advantage, though the area still works best when daily movement is planned with care."
      },
      {
        "label": "Neighborhood fit",
        "value": "The best fit usually comes from a neighborhood that balances schools, services, and a calmer residential atmosphere."
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  },
  "zurich-switzerland": {
    "summary": "Switzerland. Nearest airport: Zurich Airport passenger portal - Official passenger portal with departures, arrivals, security guidance, and airport services. | Healthcare: Swiss health insurance framework - Government portal section describing mandatory health-insurance structure and related practical guidance.",
    "overallScore": 80,
    "scoreSignals": [],
    "facts": [
      {
        "label": "Nearest airport",
        "value": "Zurich Airport passenger portal - Official passenger portal with departures, arrivals, security guidance, and airport services.",
        "sourceUrl": "https://www.flughafen-zuerich.ch/en/passengers"
      },
      {
        "label": "Healthcare",
        "value": "Swiss health insurance framework - Government portal section describing mandatory health-insurance structure and related practical guidance.",
        "sourceUrl": "https://www.ch.ch/en/health/health-insurance"
      },
      {
        "label": "Healthcare",
        "value": "Swiss health-insurance premium calculator - Official premium-comparison portal for Swiss health-insurance planning and insurer comparison workflows.",
        "sourceUrl": "https://www.priminfo.admin.ch/"
      },
      {
        "label": "Residency",
        "value": "Switzerland entry requirements - Official federal source for entry requirements by nationality, visa pathways, and stay-length rules.",
        "sourceUrl": "https://www.sem.admin.ch/sem/en/home/themen/einreise.html"
      }
    ],
    "lowCoverage": false,
    "source": "merged_seed"
  }
} as const;
