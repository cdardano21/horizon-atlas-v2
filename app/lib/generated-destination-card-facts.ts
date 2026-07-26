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
