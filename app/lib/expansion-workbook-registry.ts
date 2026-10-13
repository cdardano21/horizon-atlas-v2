import path from "node:path";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { loadFrozenWorkbookV31DeterministicImport, isDeterministicV31ContractVersionSupported, type DeterministicV31WorkbookImport } from "./workbook-v31-deterministic-core";
import { mapCanonicalDestinationToStoredState } from "./persistence/v31/map-canonical-destination-to-stored-state";
import { createInMemoryPersistedDestinationReadPort } from "./persistence/v31/in-memory-persisted-destination-read-port";
import { loadNormalizedPersistedDestinationBundle } from "./persistence/v31/load-normalized-persisted-destination-bundle";
import type { NormalizedPersistedDestinationBundle } from "./persistence/v31/materialize-stored-destination-state";
import type { CanonicalDestinationKey, DestinationId } from "./persistence/v31/types";

/**
 * Permanent, generic expansion-workbook preview architecture.
 *
 * Registering a new batch workbook (Batch #3, #4, ...) means adding one entry here - never a new
 * batch-numbered loader module, a new branch in canonical-destination-loader.ts, or new page code.
 * Every entry is resolved through the exact same real deterministic parser + real
 * mapCanonicalDestinationToStoredState + real loadNormalizedPersistedDestinationBundle contract used
 * by production, entirely in-memory, with zero Supabase writes. This registry is preview-only (see
 * isExpansionWorkbookPreviewEnabled) and never becomes a second production source of truth: production
 * destinations are always resolved from Supabase-backed persisted state, regardless of this registry's
 * contents.
 */
export interface ExpansionWorkbookRegistryEntry {
  /** Stable identifier for this registry entry, used only in diagnostics/error messages (never a customer-facing value). */
  readonly registryId: string;
  /** Path to the workbook file, resolved relative to process.cwd() if not already absolute. */
  readonly workbookPath: string;
  /** "preview" entries are eligible for local/preview resolution; "production" entries are never read by this module (reserved for future explicit production-import tooling, not request-time resolution). */
  readonly environment: "preview" | "production";
  /** The complete, permanent destination_key set this workbook is expected to own - not invented, copied from the workbook's own DESTINATIONS sheet by whoever registers the entry. */
  readonly expectedDestinationKeys: readonly string[];
  /** Optional integrity pin; when present, validateExpansionWorkbookRegistry fails if the on-disk file no longer matches. */
  readonly expectedSha256?: string;
  /** New catalog identities require live publication eligibility before shortlist discovery. */
  readonly candidateDiscovery?: "published-catalog";
}

export const EXPANSION_WORKBOOK_REGISTRY: readonly ExpansionWorkbookRegistryEntry[] = [
{
  "registryId": "legacy-colonia-del-sacramento-uruguay-01",
  "workbookPath": "data/legacy-colonia-del-sacramento-uruguay-01/DestinationFinderAI-colonia-del-sacramento-Premium-Candidate-v3.3.xlsx",
  "expectedSha256": "9f45d73ecd7c1acfe8a323b021e4415b691c1f5e929d6da382ea827b26c536b7",
  "expectedDestinationKeys": [
    "colonia-del-sacramento-uruguay"
  ],
  "environment": "production",
  "candidateDiscovery": "published-catalog"
},
{
  "registryId": "legacy-leiden-netherlands-01",
  "workbookPath": "data/legacy-leiden-netherlands-01/DestinationFinderAI-leiden-Premium-Candidate-v3.3.xlsx",
  "expectedSha256": "85c5679ec8ad3684dac185ddacb84520de89b226552a70b5abe92715c816cfdd",
  "expectedDestinationKeys": [
    "leiden-netherlands"
  ],
  "environment": "production",
  "candidateDiscovery": "published-catalog"
},
{
  "registryId": "legacy-salta-argentina-01",
  "workbookPath": "data/legacy-salta-argentina-01/DestinationFinderAI-salta-Premium-Candidate-v3.3.xlsx",
  "expectedSha256": "17dcb27730960e3c5174c354dd3b70e772e4c1bc74f5ab37a3b930ae5a27fec4",
  "expectedDestinationKeys": [
    "salta-argentina"
  ],
  "environment": "production",
  "candidateDiscovery": "published-catalog"
},
{
  "registryId": "legacy-pula-croatia-01",
  "workbookPath": "data/legacy-pula-croatia-01/DestinationFinderAI-pula-Premium-Candidate-v3.3.xlsx",
  "expectedSha256": "74d67f52a25f7a7d9a24566931c303655401dc2746a55a20f6102fafe44c5829",
  "expectedDestinationKeys": [
    "pula-croatia"
  ],
  "environment": "production",
  "candidateDiscovery": "published-catalog"
},
{
  "registryId": "legacy-grecia-costa-rica-01",
  "workbookPath": "data/legacy-grecia-costa-rica-01/DestinationFinderAI-grecia-Premium-Candidate-v3.3.xlsx",
  "expectedSha256": "563cf4d1227eacf7f9619367a100a7928c5070f7c67b269c4d5108e96e73c0ad",
  "expectedDestinationKeys": [
    "grecia-costa-rica"
  ],
  "environment": "production",
  "candidateDiscovery": "published-catalog"
},
{"registryId": "legacy-cadiz-spain-01", "workbookPath": "data/legacy-cadiz-spain-01/DestinationFinderAI-cadiz-Premium-Candidate-v3.3.xlsx", "environment": "production", "candidateDiscovery": "published-catalog", "expectedDestinationKeys": ["cadiz-spain"], "expectedSha256": "545a732f506605a3c397af32ed826e62d1be0e3a54f7ceb48094b9aaabcfb2f9"},{"registryId": "legacy-heidelberg-germany-01", "workbookPath": "data/legacy-heidelberg-germany-01/DestinationFinderAI-heidelberg-Premium-Candidate-v3.3.xlsx", "environment": "production", "candidateDiscovery": "published-catalog", "expectedDestinationKeys": ["heidelberg-germany"], "expectedSha256": "ff0443b36d84853cd8728bd99394e5957fbeda342fff90807bc268fc8bfb155a"},{"registryId": "legacy-puerto-varas-chile-01", "workbookPath": "data/legacy-puerto-varas-chile-01/DestinationFinderAI-puerto-varas-Premium-Candidate-v3.3.xlsx", "environment": "production", "candidateDiscovery": "published-catalog", "expectedDestinationKeys": ["puerto-varas-chile"], "expectedSha256": "cd147ba6b0a2b700c590852691fe6be4a3695487cafb0f2085dfb77af7eeaebc"},{"registryId": "legacy-nagano-japan-01", "workbookPath": "data/legacy-nagano-japan-01/DestinationFinderAI-nagano-Premium-Candidate-v3.3.xlsx", "environment": "production", "candidateDiscovery": "published-catalog", "expectedDestinationKeys": ["nagano-japan"], "expectedSha256": "9011f323dbab5f83fbe843b4a3f069d37ff40f71c78fe533e9f21679bbefdca3"},
{
  "registryId": "legacy-antigua-guatemala-guatemala-01",
  "workbookPath": "data/legacy-antigua-guatemala-guatemala-01/DestinationFinderAI-antigua-guatemala-Premium-Candidate-v3.3.xlsx",
  "expectedSha256": "0a01c020533144ecae746634bfd82543489ddbab712771e649cd7af47648fdd6",
  "expectedDestinationKeys": [
    "antigua-guatemala-guatemala"
  ],
  "environment": "production",
  "candidateDiscovery": "published-catalog"
},

{"registryId": "legacy-perth-australia-01", "workbookPath": "data/legacy-perth-australia-01/DestinationFinderAI-perth-Premium-Candidate-v3.3.xlsx", "expectedSha256": "dfc8755b270594da2360903a0866eb44f2afc87bf5bae72ead10aa2477ed9d18", "expectedDestinationKeys": ["perth-australia"], "environment": "production", "candidateDiscovery": "published-catalog"},{"registryId": "legacy-cork-ireland-01", "workbookPath": "data/legacy-cork-ireland-01/DestinationFinderAI-cork-Premium-Candidate-v3.3.xlsx", "expectedSha256": "cc132c2fc956577cb795161f98c2ee0bb6b5af41de8eb103689dadaa36036329", "expectedDestinationKeys": ["cork-ireland"], "environment": "production", "candidateDiscovery": "published-catalog"},{"registryId": "legacy-turin-italy-01", "workbookPath": "data/legacy-turin-italy-01/DestinationFinderAI-turin-Premium-Candidate-v3.3.xlsx", "expectedSha256": "51181eec874d3e96fea3a9c3729ccab75bd163d449ea406e3a80c0387d876508", "expectedDestinationKeys": ["turin-italy"], "environment": "production", "candidateDiscovery": "published-catalog"},{"registryId": "legacy-escazu-costa-rica-01", "workbookPath": "data/legacy-escazu-costa-rica-01/DestinationFinderAI-escazu-Premium-Candidate-v3.3.xlsx", "expectedSha256": "1bcda4d1d9c70aa4bfe32324324e101e091048c37e5478264c93f3a6a156c6b7", "expectedDestinationKeys": ["escazu-costa-rica"], "environment": "production", "candidateDiscovery": "published-catalog"},

{
  "registryId": "legacy-puebla-mexico-01",
  "workbookPath": "data/legacy-puebla-mexico-01/DestinationFinderAI-puebla-Premium-Candidate-v3.3.xlsx",
  "environment": "production",
  "candidateDiscovery": "published-catalog",
  "expectedDestinationKeys": [
    "puebla-mexico"
  ],
  "expectedSha256": "11421e242948e2df3c824f75e8de769d3faac3fd6cb81984364d374a9b4a4c21"
},
{
  "registryId": "legacy-split-croatia-01",
  "workbookPath": "data/legacy-split-croatia-01/DestinationFinderAI-split-Premium-Candidate-v3.3.xlsx",
  "environment": "production",
  "candidateDiscovery": "published-catalog",
  "expectedDestinationKeys": [
    "split-croatia"
  ],
  "expectedSha256": "af0278137841414099d38a9bd481d5a2ed607aa70dd45a68290ba3a4e964f07d"
},
{
  "registryId": "legacy-cebu-city-philippines-01",
  "workbookPath": "data/legacy-cebu-city-philippines-01/DestinationFinderAI-cebu-city-Premium-Candidate-v3.3.xlsx",
  "environment": "production",
  "candidateDiscovery": "published-catalog",
  "expectedDestinationKeys": [
    "cebu-city-philippines"
  ],
  "expectedSha256": "c0a85a77574289ff1f1fdce559173f1fa400e0c8cbf42fa871cbf809678acf56"
},
{
  "registryId": "legacy-halifax-canada-01",
  "workbookPath": "data/legacy-halifax-canada-01/DestinationFinderAI-halifax-Premium-Candidate-v3.3.xlsx",
  "environment": "production",
  "candidateDiscovery": "published-catalog",
  "expectedDestinationKeys": [
    "halifax-canada"
  ],
  "expectedSha256": "25951cf5e533bb087a562842880b06b8d4fcb2157d04390db16eb49ecfa9f4b3"
},
{
  "registryId": "legacy-wellington-new-zealand-01",
  "workbookPath": "data/legacy-wellington-new-zealand-01/DestinationFinderAI-wellington-Premium-Candidate-v3.3.xlsx",
  "environment": "production",
  "candidateDiscovery": "published-catalog",
  "expectedDestinationKeys": [
    "wellington-new-zealand"
  ],
  "expectedSha256": "07bb830864f42c3562fb93bf42e1837c0304d9ba25951ee9b63f88df9c608970"
},
{
  "registryId": "legacy-charleston-south-carolina-united-states-01",
  "workbookPath": "data/legacy-charleston-south-carolina-united-states-01/DestinationFinderAI-charleston-Premium-Candidate-v3.3.xlsx",
  "environment": "production",
  "candidateDiscovery": "published-catalog",
  "expectedDestinationKeys": [
    "charleston-south-carolina-united-states"
  ],
  "expectedSha256": "5dce07577b9eaf50f69033dc8aa3ded836230f1f64dfce9448643af7359d8c1b"
},
{
  "registryId": "legacy-kota-kinabalu-malaysia-01",
  "workbookPath": "data/legacy-kota-kinabalu-malaysia-01/DestinationFinderAI-kota-kinabalu-Premium-Candidate-v3.3.xlsx",
  "environment": "production",
  "candidateDiscovery": "published-catalog",
  "expectedDestinationKeys": [
    "kota-kinabalu-malaysia"
  ],
  "expectedSha256": "e616707a47a9389736a47e35c8f31223c03f9838094aa50db943e18a3e97bb61"
},
{
  "registryId": "legacy-montpellier-france-01",
  "workbookPath": "data/legacy-montpellier-france-01/DestinationFinderAI-montpellier-Premium-Candidate-v3.3.xlsx",
  "environment": "production",
  "candidateDiscovery": "published-catalog",
  "expectedDestinationKeys": [
    "montpellier-france"
  ],
  "expectedSha256": "a4b1776599ed1484bece6c10f51097e74138355ae9e8faabda6fefa7ae2bb5ec"
},
{
  "registryId": "legacy-victoria-canada-01",
  "workbookPath": "data/legacy-victoria-canada-01/DestinationFinderAI-victoria-Premium-Candidate-v3.3.xlsx",
  "environment": "production",
  "candidateDiscovery": "published-catalog",
  "expectedDestinationKeys": [
    "victoria-canada"
  ],
  "expectedSha256": "0bf1ab0885786b687d4c5ff6f75a634a5959f6f4d79218f3d5a1b23310946d02"
},
{
  "registryId": "legacy-las-palmas-spain-01",
  "workbookPath": "data/legacy-las-palmas-spain-01/DestinationFinderAI-las-palmas-de-gran-canaria-Premium-Candidate-v3.3.xlsx",
  "environment": "production",
  "candidateDiscovery": "published-catalog",
  "expectedDestinationKeys": [
    "las-palmas-spain"
  ],
  "expectedSha256": "07e3dff9b63f8fb4c54911868ebca9492968aebed899a752b83c8eed32b1eba1"
},
{
  "registryId": "legacy-la-rochelle-france-01",
  "workbookPath": "data/legacy-la-rochelle-france-01/DestinationFinderAI-la-rochelle-Premium-Candidate-v3.3.xlsx",
  "environment": "production",
  "candidateDiscovery": "published-catalog",
  "expectedDestinationKeys": [
    "la-rochelle-france"
  ],
  "expectedSha256": "9e6a5a67ff9a43662d754de540e0a7231a8277f76df53967ce3f06160f627e0e"
},
{
  "registryId": "legacy-freiburg-im-breisgau-germany-01",
  "workbookPath": "data/legacy-freiburg-im-breisgau-germany-01/DestinationFinderAI-freiburg-im-breisgau-Premium-Candidate-v3.3.xlsx",
  "environment": "production",
  "candidateDiscovery": "published-catalog",
  "expectedDestinationKeys": [
    "freiburg-im-breisgau-germany"
  ],
  "expectedSha256": "0c5874e01684e8b2659d2f8d189f9f940ddbc2907d0201b105d91f77f0733410"
},
{
  "registryId": "legacy-viseu-portugal-01",
  "workbookPath": "data/legacy-viseu-portugal-01/DestinationFinderAI-viseu-Premium-Candidate-v3.3.xlsx",
  "environment": "production",
  "candidateDiscovery": "published-catalog",
  "expectedDestinationKeys": [
    "viseu-portugal"
  ],
  "expectedSha256": "841e73e2aa6c69dbc4f6e8d3f5b775e19d2722870f26e7fa0344d57255978549"
},
{
  "registryId": "legacy-taichung-taiwan-01",
  "workbookPath": "data/legacy-taichung-taiwan-01/DestinationFinderAI-taichung-Premium-Candidate-v3.3.xlsx",
  "environment": "production",
  "candidateDiscovery": "published-catalog",
  "expectedDestinationKeys": [
    "taichung-taiwan"
  ],
  "expectedSha256": "ca00d75716c630c6dcd6f0e7df83134fb7d8b7a862d2f71cc30049647241387e"
},
{
  "registryId": "legacy-hobart-australia-01",
  "workbookPath": "data/legacy-hobart-australia-01/DestinationFinderAI-hobart-Premium-Candidate-v3.3.xlsx",
  "environment": "production",
  "candidateDiscovery": "published-catalog",
  "expectedDestinationKeys": [
    "hobart-australia"
  ],
  "expectedSha256": "f36f9db752dbe3a4c544f3a1645613a373858e2190590fb00dd058481b322bbf"
},
{
  "registryId": "legacy-la-paz-mexico-01",
  "workbookPath": "data/legacy-la-paz-mexico-01/DestinationFinderAI-la-paz-Premium-Candidate-v3.3.xlsx",
  "environment": "production",
  "candidateDiscovery": "published-catalog",
  "expectedDestinationKeys": [
    "la-paz-mexico"
  ],
  "expectedSha256": "5dc227cfffae5195ddb77291e5aef318981184b0e2d81e57c7c47c9cad4762c0"
},
{
  "registryId": "legacy-queretaro-mexico-01",
  "workbookPath": "data/legacy-queretaro-mexico-01/DestinationFinderAI-queretaro-Premium-Candidate-v3.3.xlsx",
  "environment": "production",
  "candidateDiscovery": "published-catalog",
  "expectedDestinationKeys": [
    "queretaro-mexico"
  ],
  "expectedSha256": "4a71f7715bea089f18b74a884b32ea0be8233270ea253eb196ff2557f7e8461c"
},
{
  "registryId": "legacy-bologna-italy-01",
  "workbookPath": "data/legacy-bologna-italy-01/DestinationFinderAI-bologna-Premium-Candidate-v3.3.xlsx",
  "environment": "production",
  "candidateDiscovery": "published-catalog",
  "expectedDestinationKeys": [
    "bologna-italy"
  ],
  "expectedSha256": "3f6940da7f9a3d1fb9318174dda83267ab420cc10b53178a6dc4bcb842612783"
},
{
  "registryId": "legacy-medellin-colombia-01",
  "workbookPath": "data/legacy-medellin-colombia-01/DestinationFinderAI-medellin-Premium-Candidate-v3.3.xlsx",
  "environment": "production",
  "candidateDiscovery": "published-catalog",
  "expectedDestinationKeys": [
    "medellin-colombia"
  ],
  "expectedSha256": "0a6db8f1b35db77eacc28f81ca9907b07bf1f0d09cb586947e7f47ceda9a9566"
},
{
  "registryId": "legacy-bangkok-thailand-01",
  "workbookPath": "data/legacy-bangkok-thailand-01/DestinationFinderAI-bangkok-thailand-Premium-Review-r2-v3.3.xlsx",
  "environment": "production",
  "candidateDiscovery": "published-catalog",
  "expectedDestinationKeys": [
    "bangkok-thailand"
  ],
  "expectedSha256": "e4c95528a6dc9415f8ee46e0541cf43ca872c7209625de8ed40b031e2345239a"
},
{
  "registryId": "legacy-barcelona-spain-01",
  "workbookPath": "data/legacy-barcelona-spain-01/DestinationFinderAI-barcelona-spain-Premium-Review-r2-v3.3.xlsx",
  "environment": "production",
  "candidateDiscovery": "published-catalog",
  "expectedDestinationKeys": [
    "barcelona-spain"
  ],
  "expectedSha256": "6ec73e9700d985bc2d1b8e99f32ce192cb9d8d9f1b65aa7be62afc1f63841f79"
},
{
  "registryId": "legacy-san-miguel-de-allende-mexico-01",
  "workbookPath": "data/legacy-san-miguel-de-allende-mexico-01/DestinationFinderAI-san-miguel-de-allende-mexico-Premium-Review-r2-v3.3.xlsx",
  "environment": "production",
  "candidateDiscovery": "published-catalog",
  "expectedDestinationKeys": [
    "san-miguel-de-allende-mexico"
  ],
  "expectedSha256": "1e52277a2f95a98ba043bf1d829ebe3a2a1a07f951d8beba0de927505544cc6e"
},
{
  "registryId": "legacy-atenas-costa-rica-01",
  "workbookPath": "data/legacy-atenas-costa-rica-01/DestinationFinderAI-atenas-costa-rica-Premium-Review-r2-v3.3.xlsx",
  "environment": "production",
  "candidateDiscovery": "published-catalog",
  "expectedDestinationKeys": [
    "atenas-costa-rica"
  ],
  "expectedSha256": "65d7e815b337e07f6e756e8ea793e8a33c8711ff9f370ab7d7cb225b9685d7d6"
},
{
  "registryId": "legacy-malaga-01",
  "workbookPath": "data/legacy-malaga-01/DestinationFinderAI-Malaga-Premium-Owner-Review-v3-v3.3.xlsx",
  "environment": "production",
  "candidateDiscovery": "published-catalog",
  "expectedDestinationKeys": [
    "malaga-spain"
  ],
  "expectedSha256": "143bc306c4f7fa844ea3f787dba4e4f2a83a64d3089953cbfc0ab069245b01a5"
},
  {
    registryId: "curated-mixed-batch-10-01",
    workbookPath: "data/curated-mixed-batch-10-01/DestinationFinderAI-Curated-Mixed-Batch-10-01-Authoring-Complete-v3.3.xlsx",
    environment: "production",
    candidateDiscovery: "published-catalog",
    expectedDestinationKeys: ["bariloche-argentina", "mendoza-argentina", "joao-pessoa-brazil", "punta-del-este-uruguay", "ghent-belgium", "wanaka-new-zealand", "stellenbosch-south-africa", "loreto-mexico", "vevey-switzerland", "hakuba-japan"],
    expectedSha256: "23d4a18924d6a9ccc94d8389c4e76c4a669a5411e0f1385d7d83a7a138c35b48",
  },
  {
    registryId: "non-legacy-pilot-05",
    workbookPath: "data/non-legacy-pilot-05/DestinationFinderAI-Non-Legacy-Pilot-05-Authoring-Checkpoint-04-v3.3.xlsx",
    environment: "production",
    candidateDiscovery: "published-catalog",
    expectedDestinationKeys: ["whistler-canada", "bansko-bulgaria", "pucon-chile", "noosa-heads-australia", "baden-baden-germany"],
    expectedSha256: "4d298b1883608c8a08e7b2a6f04fce91fca4aa9d738b96e006dd446e9a1bb2a3",
  },
  {
    registryId: "curated-mixed-batch-20-01",
    workbookPath: "data/curated-mixed-batch-20-01/DestinationFinderAI-Curated-Mixed-Batch-20-01-PREMIUM-REPAIRED-v2-v3.3.xlsx",
    environment: "production",
    candidateDiscovery: "published-catalog",
    expectedDestinationKeys: [
      "sarajevo-bosnia-and-herzegovina", "da-lat-vietnam", "sete-france", "tainan-taiwan", "arequipa-peru",
      "sibiu-romania", "ohrid-north-macedonia", "kuching-malaysia", "ipoh-malaysia", "dunedin-new-zealand",
      "sucre-bolivia", "loja-ecuador", "campeche-mexico", "oberstdorf-germany", "frutillar-chile",
      "launceston-australia", "sandpoint-idaho-united-states", "nelson-new-zealand", "albany-western-australia", "essaouira-morocco",
    ],
    expectedSha256: "899b9d0ec5b7577e97e42f059cda20fae55e9846b7f3e688f8369b3fc0f1df85",
  },
  {
    registryId: "curated-mixed-batch-20-02",
    workbookPath: "data/curated-mixed-batch-20-02/DestinationFinderAI-Curated-Mixed-Batch-20-02-PREMIUM-REPAIRED-v6-v3.3.xlsx",
    environment: "production",
    candidateDiscovery: "published-catalog",
    expectedDestinationKeys: [
      "almunecar-spain", "tavira-portugal", "kalamata-greece", "lucca-italy", "sibenik-croatia",
      "pak-nam-pran-thailand", "piriapolis-uruguay", "plovdiv-bulgaria", "denia-spain", "viana-do-castelo-portugal",
      "ascoli-piceno-it", "pezenas-france", "matsuyama-japan", "taitung-taiwan", "quy-nhon-vietnam",
      "herceg-novi-montenegro", "fethiye-turkiye", "st-george-utah-united-states", "coeur-d-alene-idaho-united-states",
      "san-luis-obispo-california-united-states",
    ],
    expectedSha256: "7ce9be5f9727b9e90796dbe9ba5e2c4e33e617b358dd953e5e910076483fb0be",
  },
  {
    registryId: "curated-mixed-batch-20-03",
    workbookPath: "data/curated-mixed-batch-20-03/DestinationFinderAI-Curated-Mixed-Batch-20-03-Final-Premium-Completed-v3.3.xlsx",
    environment: "production",
    candidateDiscovery: "published-catalog",
    expectedDestinationKeys: [
      "flagstaff-arizona-united-states", "ashland-oregon-united-states", "whitefish-montana-united-states",
      "saratoga-springs-new-york-united-states", "annapolis-maryland-united-states", "wilmington-north-carolina-united-states",
      "st-augustine-florida-united-states", "hilton-head-island-south-carolina-united-states", "traverse-city-michigan-united-states",
      "delray-beach-florida-united-states", "lagos-portugal", "chiang-rai-thailand", "guanajuato-mexico",
      "newport-rhode-island-united-states", "cascais-portugal", "hood-river-oregon-united-states",
      "eureka-springs-arkansas-united-states", "new-hope-pennsylvania-united-states", "healdsburg-california-united-states",
      "bocas-del-toro-panama",
    ],
    expectedSha256: "b61de798d3b12611e9be0a7c5179771ce538966d51381852feeedf23aab90946",
  },
  {
    registryId: "batch-01",
    workbookPath: "data/DestinationFinderAI_Expansion_Batch_01_5_Destinations_v3.3.xlsx",
    environment: "preview",
    expectedDestinationKeys: ["the-villages-fl-us", "sofia-bg", "puerto-vallarta-mx", "hoi-an-vn", "queenstown-nz"],
    // Updated 2026-08-31 after correcting two broken food-place links (Tintoque, Morning Glory
    // Original). Updated again 2026-09-01 after correcting links for 10 of 11 Hoi An Maps-only
    // food places (Miss Ly Cafeteria left unresolved - no confidently official link found).
    // Updated again 2026-09-01 after correcting links for 16 of 17 entries across The Villages (9)
    // and Sofia (8) (Scooter's Coffee - The Villages left unresolved - no confidently official/
    // location-specific link found; Made in Home confirmed renamed to Dark Sister by Made in Home).
    // Updated again 2026-09-01 after correcting links for all 14 entries across Puerto Vallarta (7)
    // and Queenstown (7) - all 14 resolved, no closures/replacements/renames needed.
    expectedSha256: "3153462443d85b82e621711856242cdd3cdeb86ee6776acad309a58dcc200671",
  },
  {
    registryId: "batch-02",
    workbookPath: "data/DestinationFinderAI_Expansion_Batch_02_5_Destinations_v3.3.xlsx",
    environment: "preview",
    expectedDestinationKeys: ["ascoli-piceno-it", "sarande-al", "dumaguete-ph", "las-terrenas-do", "fairhope-al-us"],
    // Updated 2026-08-31 after adding 5 verified food places each for Sarande and Dumaguete (previously zero).
    // Updated again 2026-09-01 after correcting links for all 3 Las Terrenas dining-area entries
    // (Pueblo de los Pescadores, Punta Popy beach-road dining cluster, Playa Bonita boardwalk/dining
    // cluster) to the official Dominican Republic tourism board page for Las Terrenas.
    // Updated again 2026-09-01 after accepting the exact business matches for Casablanca Restaurant
    // Dumaguete, Buglas Isla Cafe, La Mensa Italian Chophouse, Sans Rival Cakes and Pastries,
    // Hayahay Treehouse Bar and Viewdeck Restobar, and Taverna Garden (exact official Facebook or
    // Instagram profiles only; all remaining Sarandë/Dumaguete targets stay Maps-only unless identity
    // is independently confirmed).
    expectedSha256: "a2fc1e0cd99f4662b31e6846d2cc39715e0195c1098874ac9f2b637b31a7084d",
  },
  {
    registryId: "next-batch-20-private-import-authorized",
    workbookPath: "data/next-batch-20/DestinationFinderAI-Next-Batch-20-Visual-Parity-Enriched-v3.3.xlsx",
    environment: "preview",
    expectedDestinationKeys: [
      "tivat-montenegro", "matera-italy", "trieste-italy", "braga-portugal", "valencia-spain",
      "rijeka-croatia", "zadar-croatia", "piran-slovenia", "rovinj-croatia", "kanazawa-japan",
      "polignano-a-mare-italy", "cefalu-italy", "kalamata-greece", "taormina-italy", "podgorica-montenegro",
      "kotor-montenegro", "bergamo-italy", "pietrasanta-italy", "alicante-spain", "verona-italy",
    ],
    expectedSha256: "88f365b1dabfef7a3bbeb2958f53e9c3537d1f8f8b74e6cf6083482ddb802683",
  },
  {
    registryId: "legacy-carryover-batch-20-02",
    // Superseded 2026-09-08 by the premium-enriched authoritative workbook. Prior workbook
    // bytes and replacement evidence remain preserved for recovery and audit purposes.
    workbookPath: "data/legacy-carryover-batch-20-02/DestinationFinderAI-Legacy-Carryover-Batch-20-Premium-Enriched-Final-v3.3.xlsx",
    environment: "preview",
    expectedDestinationKeys: [
      "radovljica-slovenia", "osaka-japan", "sitges-spain", "estepona-spain", "lake-bled-slovenia",
      "olbia-italy", "hiroshima-japan", "kobe-japan", "alghero-italy", "hakodate-japan",
      "desenzano-del-garda-italy", "onomichi-japan", "cartagena-spain", "gijon-spain", "girona-spain",
      "ptuj-slovenia", "koper-slovenia", "murcia-spain", "takayama-japan", "dubrovnik-croatia",
    ],
    expectedSha256: "015209686a8a68c20c32288498be40b88802268cc967a4ef71fbaa143b9d2a3a",
  },
  {
    registryId: "legacy-carryover-batch-20-03",
    workbookPath: "data/legacy-carryover-batch-20-03/DestinationFinderAI-Batch-20-03-Media-Repaired-Non-Media-Preserved-v3.3.xlsx",
    environment: "preview",
    expectedDestinationKeys: [
      "aomori-japan", "kamakura-japan", "porto-portugal", "kranj-slovenia", "coimbra-portugal",
      "kumamoto-japan", "beppu-japan", "sapporo-japan", "lecce-italy", "athens-greece",
      "matsumoto-japan", "morioka-japan", "sendai-japan", "cavtat-croatia", "sirmione-italy",
      "celje-slovenia", "nagasaki-japan", "perugia-italy", "novigrad-croatia", "ioannina-greece",
    ],
    expectedSha256: "4b8000f89855fb1cc063d145bd3548874bc3cb6caf21e3e9ca91b5727fe7aa9a",
  },
  {
    registryId: "legacy-carryover-batch-20-04",
    workbookPath: "data/legacy-carryover-batch-20-04/DestinationFinderAI-Next-Legacy-Batch-20-Authoritative-Final-v3.3.xlsx",
    environment: "preview",
    expectedDestinationKeys: [
      "siracusa-italy", "toyama-japan", "kardamyli-greece", "trogir-croatia", "korcula-town-croatia",
      "fukuoka-japan", "maribor-slovenia", "mali-losinj-croatia", "naha-japan", "niigata-japan",
      "kagoshima-japan", "bari-italy", "miyazaki-japan", "hvar-town-croatia", "oviedo-spain",
      "cagliari-italy", "naxos-town-greece", "corfu-town-greece", "thessaloniki-greece", "okayama-japan",
    ],
    expectedSha256: "f352b0fbf84e5e22bfc0d4b3942324cb82ebe6f1518517b24b3d2df4e12b2129",
  },
  {
    registryId: "legacy-carryover-batch-20-05",
    workbookPath: "data/legacy-carryover-batch-20-05/DestinationFinderAI-Next-Legacy-Batch-20-05-Authoritative-Final-v3.3.xlsx",
    environment: "preview",
    expectedDestinationKeys: [
      "chattanooga-tennessee-united-states", "greenville-south-carolina-united-states", "tucson-arizona-united-states", "st-petersburg-florida-united-states", "fort-collins-colorado-united-states",
      "boise-idaho-united-states", "leiria-portugal", "granada-spain", "bilbao-spain", "osijek-croatia",
      "vienna-austria", "ljubljana-slovenia", "tallinn-estonia", "kuala-lumpur-malaysia", "taipei-taiwan",
      "busan-south-korea", "adelaide-australia", "oaxaca-mexico", "pereira-colombia", "salinas-ecuador",
    ],
    expectedSha256: "28141ee6331438080ad0d1e82c1226759539c6cd4144401ab4c677142d212e6b",
  },
  {
    registryId: "legacy-carryover-batch-20-06",
    workbookPath: "data/legacy-carryover-batch-20-06/DestinationFinderAI-Next-Legacy-Batch-20-06-FINAL-AUTHORITATIVE-POPULATION-REPAIRED-v3.3.xlsx",
    environment: "preview",
    expectedDestinationKeys: [
      "asheville-north-carolina-united-states", "portland-maine-united-states", "bend-oregon-united-states", "san-luis-obispo-california-united-states", "sarasota-florida-united-states",
      "reno-nevada-united-states", "viana-do-castelo-portugal", "salamanca-spain", "san-sebastian-spain", "evora-portugal",
      "prague-other-europe", "treviso-italy", "annecy-france", "ho-chi-minh-city-vietnam", "tokyo-japan",
      "bali-indonesia", "auckland-new-zealand", "cusco-peru", "valdivia-chile", "cordoba-argentina",
    ],
    expectedSha256: "9cb91d6f7ac8e6c7bb84a262960ce7dc7699099c2a40351408883af079f87558",
  },
  {
    registryId: "legacy-carryover-batch-20-07",
    workbookPath: "data/legacy-carryover-batch-20-07/DestinationFinderAI-Next-Legacy-Batch-20-07-Contract-Repaired-v3.3.xlsx",
    environment: "preview",
    expectedDestinationKeys: [
      "buenos-aires-argentina", "brisbane-australia", "bruges-belgium", "curitiba-brazil", "santiago-chile",
      "bogota-colombia", "makarska-croatia", "aix-en-provence-france", "chania-greece", "aosta-italy",
      "kurashiki-japan", "todos-santos-mexico", "muscat-oman", "panama-city-panama", "cape-town-south-africa",
      "seoul-south-korea", "a-coruna-spain", "phuket-thailand", "belfast-united-kingdom", "albuquerque-new-mexico-united-states",
    ],
    expectedSha256: "20191e74867828cc15cd6f1ffd2b5e8ef89ef9ba8bb92900cdca60bf79ed2cd4",
  },
  {
    registryId: "legacy-pilot06-populated",
    // Superseded 2026-08-30 by the authoritative curated workbook - the prior POPULATED.xlsx file is
    // intentionally left on disk, unregistered, as a recoverable historical artifact (never deleted).
    workbookPath: "data/legacy-migration-pilot-06/DestinationFinderAI_Legacy_Pilot_06_Authoritative_v3.3.xlsx",
    environment: "production",
    expectedDestinationKeys: [
      "the-hague-netherlands", "kyoto-japan", "santa-fe-new-mexico-united-states",
      "st-cloud-minnesota-united-states", "san-ramon-costa-rica", "st-john-s-canada",
    ],
    // Updated 2026-08-31 after correcting 6 broken/renamed food-place links (Foodhallen Den Haag
    // replaced with De Grote Markt, Capriole Cafe renamed to Puurr aan de Binck, Gion Kappa renamed
    // to its current name, plus Betterday Coffee/Krewe Restaurant/Chinched domain corrections).
    // Updated again 2026-09-01 after confirming Raymonds (St. John's) permanently closed and
    // replacing it with Rabble (verified official Instagram profile).
    // Updated again 2026-09-01 after accepting the exact official Instagram profile for Aromas Café
    // in San Ramón (all other San Ramón targets remain Maps-only unless exact identity evidence is
    // independently confirmed).
    expectedSha256: "91bcc28a9df767d20831c698c841fa8ab42e499914f0fc524e87479a07db6373",
  },
  {
    registryId: "legacy-batch-20",
    workbookPath: "data/legacy-migration-batch-20/DestinationFinderAI_Legacy_Production_Batch_20_Reader_Ready_Authoritative_v3.3.xlsx",
    environment: "production",
    expectedDestinationKeys: [
      "ajijic-mexico", "boquete-panama", "chiang-mai-thailand", "cuenca-ecuador", "da-nang-vietnam",
      "florianopolis-brazil", "funchal-portugal", "george-town-malaysia", "hua-hin-thailand", "lucca-italy",
      "merida-mexico", "monopoli-italy", "montevideo-uruguay", "nafplio-greece", "nice-france",
      "palm-springs-california-united-states", "paphos-cyprus", "santander-spain",
      "savannah-georgia-united-states", "sibenik-croatia",
    ],
    // Updated 2026-08-31 after correcting 3 food-place links (La Nueva Posada, Tamarind Market,
    // Savor Nafplio Experiences) and reverting 2 unresolved broken links to Google Maps fallback.
    // Updated again 2026-09-01 after correcting links for all 5 Savannah Maps-only food places.
    // Updated again 2026-09-01 after correcting links for 8 of 9 entries across Funchal, Nafplio,
    // Sibenik, Boquete (x3), and Da Nang (x2) (Pescaria Monopoli and Madame Lan Restaurant left
    // unresolved - no confidently official/reachable link found for either).
    // Updated again 2026-09-01 after correcting links for 13 of 15 entries across Ajijic (5),
    // Chiang Mai (5), and Cuenca (5) (The Coffee Hour and Chiang Mai Food Adventures left
    // unresolved - no confidently official Ajijic-specific/identity-confirmed match found).
    // Updated again 2026-09-01: Yves' Restaurant Bar's website_url was incorrectly a third-party
    // aggregator (hey-restaurants.com) - replaced with its confirmed official Facebook page.
    // Updated again 2026-09-01 for the bounded Batch 20 food-link enrichment pass covering the 15
    // named recommendations in Mérida, Montevideo, and Palm Springs.
    // Updated 2026-09-05 to merge the duplicate Mercado Público de Florianópolis place record;
    // the richer official-source row remains and preserves the correct Portuguese diacritics.
    // Updated again 2026-09-05 to remove duplicate Teatro Solís and Mercado Agrícola de
    // Montevideo records, preserving each direct official-source row and correct diacritics.
    // Updated again 2026-09-05 to reconcile five production-planner semantic fact collisions:
    // six distinct facts received precise fact keys and two redundant fact rows were removed
    // only where their evidence and official sources remain in supported canonical modules.
    expectedSha256: "2d02e7932574caee95f955d9d900d3de65bf8a96ac258ddaf717f64f005dff10",
  },
];

const previewEntries = (registry: readonly ExpansionWorkbookRegistryEntry[]) => registry.filter((entry) => entry.environment === "preview");

/**
 * The registry is preview/local-only. Production builds (NODE_ENV=production, matching the standard
 * Next.js/Vercel production convention) never resolve or load anything through this module - production
 * destinations must always come from the Supabase-backed persisted-destination path.
 */
export const isExpansionWorkbookPreviewEnabled = (): boolean => process.env.NODE_ENV !== "production";

const resolvedWorkbookPath = (entry: ExpansionWorkbookRegistryEntry) => path.resolve(process.cwd(), entry.workbookPath);

const shouldCacheWorkbookImport = () => process.env.NODE_ENV !== "test" && process.env.VITEST !== "true";
const cachedImportsByRegistryId = new Map<string, ReturnType<typeof loadFrozenWorkbookV31DeterministicImport>>();

async function loadRegistryEntryImport(entry: ExpansionWorkbookRegistryEntry): Promise<DeterministicV31WorkbookImport> {
  if (shouldCacheWorkbookImport()) {
    const cached = cachedImportsByRegistryId.get(entry.registryId);
    if (cached) return cached;
  }
  const importPromise = loadFrozenWorkbookV31DeterministicImport(resolvedWorkbookPath(entry));
  if (shouldCacheWorkbookImport()) {
    cachedImportsByRegistryId.set(entry.registryId, importPromise);
  }
  return importPromise;
}

/**
 * Resolves a raw route slug to a permanent destination_key owned by exactly one registered preview
 * workbook. Direct destination_key matches are resolved purely from the registry's own static
 * expectedDestinationKeys metadata (no workbook parse required). Anything else is checked against
 * every registered workbook's own DESTINATION_ALIASES-derived alias table - never a fuzzy match, and
 * never silently resolved if more than one workbook claims the same key or the same alias.
 */
export async function resolveExpansionWorkbookDestinationKey(
  rawSlug: string,
  registry: readonly ExpansionWorkbookRegistryEntry[] = EXPANSION_WORKBOOK_REGISTRY,
): Promise<string | null> {
  if (!isExpansionWorkbookPreviewEnabled()) return null;
  const normalized = rawSlug.trim().toLowerCase();
  if (!normalized) return null;

  if (findOwningEntry(normalized, registry)) {
    return normalized;
  }

  const entries = previewEntries(registry);
  const aliasMatches: Array<{ registryId: string; resolvedKey: string }> = [];
  for (const entry of entries) {
    const workbookImport = await loadRegistryEntryImport(entry);
    const aliasResolution = (workbookImport.diagnostics?.aliasResolution ?? {}) as Record<string, string>;
    const resolvedKey = aliasResolution[normalized] ?? aliasResolution[rawSlug.trim()];
    if (resolvedKey && entry.expectedDestinationKeys.includes(resolvedKey)) {
      aliasMatches.push({ registryId: entry.registryId, resolvedKey });
    }
  }

  if (aliasMatches.length > 1) {
    throw new Error(`Expansion workbook registry conflict: alias "${normalized}" resolves via multiple registered workbooks (${aliasMatches.map((match) => `${match.registryId}->${match.resolvedKey}`).join(", ")}).`);
  }
  if (aliasMatches.length === 1) {
    return aliasMatches[0].resolvedKey;
  }

  return null;
}

function findOwningEntry(destinationKey: string, registry: readonly ExpansionWorkbookRegistryEntry[]): ExpansionWorkbookRegistryEntry | null {
  const owners = previewEntries(registry).filter((entry) => entry.expectedDestinationKeys.includes(destinationKey));
  if (owners.length > 1) {
    throw new Error(`Expansion workbook registry conflict: destination_key "${destinationKey}" is registered in multiple workbooks (${owners.map((entry) => entry.registryId).join(", ")}).`);
  }
  return owners[0] ?? null;
}

/**
 * Loads a NormalizedPersistedDestinationBundle for a registered preview destination directly from its
 * owning workbook (via the real deterministic parser + real mapCanonicalDestinationToStoredState + real
 * loadNormalizedPersistedDestinationBundle contract), entirely in-memory. Never touches Supabase. Only
 * ever loads the single workbook that owns destinationKey - never scans every registered workbook.
 */
export async function loadExpansionWorkbookDestinationBundle(
  destinationKey: string,
  registry: readonly ExpansionWorkbookRegistryEntry[] = EXPANSION_WORKBOOK_REGISTRY,
): Promise<NormalizedPersistedDestinationBundle | null> {
  if (!isExpansionWorkbookPreviewEnabled()) return null;
  const entry = findOwningEntry(destinationKey, registry);
  if (!entry) return null;

  const workbookImport = await loadRegistryEntryImport(entry);
  const canonical = (workbookImport.canonicalDestinations ?? []).find((destination) => destination.identity.destinationKey === destinationKey);
  if (!canonical) return null;

  const storedState = mapCanonicalDestinationToStoredState(canonical);
  const identity = {
    destinationKey: destinationKey as CanonicalDestinationKey,
    destinationId: `expansion-preview-${entry.registryId}-${destinationKey}` as DestinationId,
  };
  const readPort = createInMemoryPersistedDestinationReadPort(identity, storedState);
  const result = await loadNormalizedPersistedDestinationBundle(identity, readPort);

  if (result.outcome !== "SUCCESS") {
    return null;
  }
  return result.bundle;
}

/**
 * Population/metro population/elevation live on the DESTINATIONS row itself (canonical.identity),
 * not as DESTINATION_FACTS rows, and are not part of the StoredDestinationState/bundle contract -
 * exposed separately so the renderer can restore them without fabricating a knowledgeProfile field
 * the workbook never supplied.
 */
export async function loadExpansionWorkbookRawIdentity(
  destinationKey: string,
  registry: readonly ExpansionWorkbookRegistryEntry[] = EXPANSION_WORKBOOK_REGISTRY,
): Promise<{
  readonly population: string | null;
  readonly metroPopulation: string | null;
  readonly elevationMeters: string | null;
  readonly officialTourismUrl: string | null;
  readonly googleMapsUrl: string | null;
} | null> {
  if (!isExpansionWorkbookPreviewEnabled()) return null;
  const entry = findOwningEntry(destinationKey, registry);
  if (!entry) return null;

  const workbookImport = await loadRegistryEntryImport(entry);
  const canonical = (workbookImport.canonicalDestinations ?? []).find((destination) => destination.identity.destinationKey === destinationKey);
  if (!canonical) return null;

  return {
    population: canonical.identity.population ?? null,
    metroPopulation: canonical.identity.metroPopulation ?? null,
    elevationMeters: canonical.identity.elevationMeters ?? null,
    // These two DESTINATIONS-sheet columns are real, authored links (unlike youtube/tiktok/instagram/
    // webcam, which have no workbook column at all in any schema version) - never fabricated here.
    officialTourismUrl: canonical.destinationRow?.official_tourism_url ?? null,
    googleMapsUrl: canonical.destinationRow?.google_maps_url ?? null,
  };
}

export interface ExpansionWorkbookRegistryValidationIssue {
  readonly registryId: string;
  readonly message: string;
}

export interface ExpansionWorkbookRegistryValidationResult {
  readonly ok: boolean;
  readonly issues: readonly ExpansionWorkbookRegistryValidationIssue[];
}

/**
 * Proves the registry is internally consistent before it is trusted at request time:
 * - no destination_key or alias is claimed by more than one registered workbook,
 * - every registered workbook is actually readable and passes deterministic-parser validation,
 * - every workbook's declared schema_version is within the parser's supported range,
 * - the registry's own expectedDestinationKeys exactly matches what the workbook actually parses to
 *   (neither missing keys nor undeclared extras), and
 * - an optional expectedSha256 pin still matches the on-disk file.
 * Intended to be called by tests (and optionally tooling), not on every request.
 */
export async function validateExpansionWorkbookRegistry(
  registry: readonly ExpansionWorkbookRegistryEntry[] = EXPANSION_WORKBOOK_REGISTRY,
): Promise<ExpansionWorkbookRegistryValidationResult> {
  const issues: ExpansionWorkbookRegistryValidationIssue[] = [];
  const entries = previewEntries(registry);

  const keyOwners = new Map<string, string[]>();
  for (const entry of entries) {
    for (const key of entry.expectedDestinationKeys) {
      keyOwners.set(key, [...(keyOwners.get(key) ?? []), entry.registryId]);
    }
  }
  for (const [key, owners] of keyOwners) {
    if (owners.length > 1) {
      issues.push({ registryId: owners.join(","), message: `destination_key "${key}" is registered in multiple workbooks: ${owners.join(", ")}` });
    }
  }

  const aliasOwners = new Map<string, Set<string>>();

  for (const entry of entries) {
    let workbookImport: DeterministicV31WorkbookImport;
    try {
      workbookImport = await loadRegistryEntryImport(entry);
    } catch (error) {
      issues.push({ registryId: entry.registryId, message: `Workbook could not be read (${entry.workbookPath}): ${error instanceof Error ? error.message : String(error)}` });
      continue;
    }

    if (workbookImport.validationErrors?.length) {
      issues.push({ registryId: entry.registryId, message: `Workbook failed deterministic-parser validation: ${workbookImport.validationErrors.join("; ")}` });
    }

    if (!isDeterministicV31ContractVersionSupported(workbookImport.contractVersion)) {
      issues.push({ registryId: entry.registryId, message: `Workbook schema_version "${workbookImport.contractVersion}" is not within the parser's supported range.` });
    }

    const parsedKeys = new Set((workbookImport.canonicalDestinations ?? []).map((destination) => destination.identity.destinationKey));
    const expectedKeys = new Set(entry.expectedDestinationKeys);
    const missingFromWorkbook = [...expectedKeys].filter((key) => !parsedKeys.has(key));
    const undeclaredInRegistry = [...parsedKeys].filter((key) => !expectedKeys.has(key));
    if (missingFromWorkbook.length > 0) {
      issues.push({ registryId: entry.registryId, message: `Registered expectedDestinationKeys not found in the parsed workbook: ${missingFromWorkbook.join(", ")}` });
    }
    if (undeclaredInRegistry.length > 0) {
      issues.push({ registryId: entry.registryId, message: `Workbook parses destination_key(s) not declared in expectedDestinationKeys: ${undeclaredInRegistry.join(", ")}` });
    }

    if (entry.expectedSha256) {
      try {
        const fileBytes = readFileSync(resolvedWorkbookPath(entry));
        const actualSha256 = createHash("sha256").update(fileBytes).digest("hex");
        if (actualSha256 !== entry.expectedSha256) {
          issues.push({ registryId: entry.registryId, message: `Workbook SHA-256 mismatch: expected ${entry.expectedSha256}, got ${actualSha256}` });
        }
      } catch (error) {
        issues.push({ registryId: entry.registryId, message: `Could not compute workbook SHA-256: ${error instanceof Error ? error.message : String(error)}` });
      }
    }

    const aliasResolution = (workbookImport.diagnostics?.aliasResolution ?? {}) as Record<string, string>;
    for (const aliasKey of Object.keys(aliasResolution)) {
      const owners = aliasOwners.get(aliasKey) ?? new Set<string>();
      owners.add(entry.registryId);
      aliasOwners.set(aliasKey, owners);
    }
  }

  for (const [aliasKey, owners] of aliasOwners) {
    if (owners.size > 1) {
      issues.push({ registryId: [...owners].join(","), message: `alias "${aliasKey}" is defined in multiple registered workbooks: ${[...owners].join(", ")}` });
    }
  }

  return { ok: issues.length === 0, issues };
}
