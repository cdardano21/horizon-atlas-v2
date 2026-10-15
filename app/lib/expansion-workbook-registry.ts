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
{"registryId": "legacy-aguascalientes-mexico-01", "workbookPath": "data/legacy-aguascalientes-mexico-01/DestinationFinderAI-aguascalientes-Premium-Candidate-v3.3.xlsx", "expectedSha256": "5745d65df86e5b5ee91a831a7dda1fc99a2bf91c9852bdee73f451ab9d7909c0", "expectedDestinationKeys": ["aguascalientes-mexico"], "environment": "production", "candidateDiscovery": "published-catalog"},
{"registryId": "legacy-galway-ireland-01", "workbookPath": "data/legacy-galway-ireland-01/DestinationFinderAI-galway-Premium-Candidate-v3.3.xlsx", "expectedSha256": "eec19273032828d7316fae75b2330d4e848bd3b68cfaf1799f342fcad0e3c2f6", "expectedDestinationKeys": ["galway-ireland"], "environment": "production", "candidateDiscovery": "published-catalog"},
{"registryId": "legacy-ann-arbor-michigan-united-states-01", "workbookPath": "data/legacy-ann-arbor-michigan-united-states-01/DestinationFinderAI-ann-arbor-Premium-Candidate-v3.3.xlsx", "expectedSha256": "2e1b9b46eb0954cf899ffecc47905c3490fad7abe3d12028f97d24598fc89c35", "expectedDestinationKeys": ["ann-arbor-michigan-united-states"], "environment": "production", "candidateDiscovery": "published-catalog"},
{"registryId": "legacy-izola-slovenia-01", "workbookPath": "data/legacy-izola-slovenia-01/DestinationFinderAI-izola-Premium-Candidate-v3.3.xlsx", "expectedSha256": "d60bbd1175c9fd63b69d94602c9ec29665b20a63cf1087c87b1e4ead6d97d788", "expectedDestinationKeys": ["izola-slovenia"], "environment": "production", "candidateDiscovery": "published-catalog"},
{"registryId": "legacy-takamatsu-japan-01", "workbookPath": "data/legacy-takamatsu-japan-01/DestinationFinderAI-takamatsu-Premium-Candidate-v3.3.xlsx", "expectedSha256": "7322431fc04d23d22a25a176492ca2f388ba68baa38782381f88aaa54613aae6", "expectedDestinationKeys": ["takamatsu-japan"], "environment": "production", "candidateDiscovery": "published-catalog"},
{"registryId": "legacy-cuernavaca-mexico-01", "workbookPath": "data/legacy-cuernavaca-mexico-01/DestinationFinderAI-cuernavaca-Premium-Candidate-v3.3.xlsx", "expectedSha256": "1dbb492c8a87d1711a6ccff1874425e4f6f36f1fb677e34f0715d96d3423bce3", "expectedDestinationKeys": ["cuernavaca-mexico"], "environment": "production", "candidateDiscovery": "published-catalog"},
{"registryId": "legacy-el-valle-de-anton-panama-01", "workbookPath": "data/legacy-el-valle-de-anton-panama-01/DestinationFinderAI-el-valle-de-anton-Premium-Candidate-v3.3.xlsx", "expectedSha256": "f635a68c7c7398da781bae4c323dbcc2e50679971561b998d5dd30b35aa3a2c7", "expectedDestinationKeys": ["el-valle-de-anton-panama"], "environment": "production", "candidateDiscovery": "published-catalog"},
{"registryId": "legacy-bentonville-arkansas-united-states-01", "workbookPath": "data/legacy-bentonville-arkansas-united-states-01/DestinationFinderAI-bentonville-Premium-Candidate-v3.3.xlsx", "expectedSha256": "98b1ca0329e719855449e55d1c0e3365145100352608329ed9c242816d3c50d2", "expectedDestinationKeys": ["bentonville-arkansas-united-states"], "environment": "production", "candidateDiscovery": "published-catalog"},
{"registryId": "legacy-canberra-australia-01", "workbookPath": "data/legacy-canberra-australia-01/DestinationFinderAI-canberra-Premium-Candidate-v3.3.xlsx", "expectedSha256": "2975ae68d94e4619db9920a83ff8bad4ae3c266829485655531337e67ff132e8", "expectedDestinationKeys": ["canberra-australia"], "environment": "production", "candidateDiscovery": "published-catalog"},
{"registryId": "legacy-zagreb-croatia-01", "workbookPath": "data/legacy-zagreb-croatia-01/DestinationFinderAI-zagreb-Premium-Candidate-v3.3.xlsx", "expectedSha256": "7171d40db3eb934d247ee5ccae98aaca34e5db5c4c507d7582fc3075ed0e88e3", "expectedDestinationKeys": ["zagreb-croatia"], "environment": "production", "candidateDiscovery": "published-catalog"},

{"registryId": "legacy-vina-del-mar-chile-01", "workbookPath": "data/legacy-vina-del-mar-chile-01/DestinationFinderAI-vina-del-mar-Premium-Candidate-v3.3.xlsx", "expectedSha256": "4d08be3890ad569b231a91aaf037b9957bdfdb62a3214a167eb02f5909b87498", "expectedDestinationKeys": ["vina-del-mar-chile"], "environment": "production", "candidateDiscovery": "published-catalog"},
{"registryId": "legacy-trento-italy-01", "workbookPath": "data/legacy-trento-italy-01/DestinationFinderAI-trento-Premium-Candidate-v3.3.xlsx", "expectedSha256": "087654ca9ba2cce944144718b289d221eacdd1a0284dbc2d00fa04de7a39cbaa", "expectedDestinationKeys": ["trento-italy"], "environment": "production", "candidateDiscovery": "published-catalog"},
{"registryId": "legacy-heredia-costa-rica-01", "workbookPath": "data/legacy-heredia-costa-rica-01/DestinationFinderAI-heredia-Premium-Candidate-v3.3.xlsx", "expectedSha256": "8944952e0914be848266dcb9e49d30ab39a9f960eeb1deb6e311d5cfc86ad441", "expectedDestinationKeys": ["heredia-costa-rica"], "environment": "production", "candidateDiscovery": "published-catalog"},
{"registryId": "legacy-brasov-romania-01", "workbookPath": "data/legacy-brasov-romania-01/DestinationFinderAI-brasov-Premium-Candidate-v3.3.xlsx", "expectedSha256": "85697d4cb90da9e8378781db86689180f335b78cd3d49c00bb5e802d22441bb6", "expectedDestinationKeys": ["brasov-romania"], "environment": "production", "candidateDiscovery": "published-catalog"},
{"registryId": "legacy-luang-prabang-laos-01", "workbookPath": "data/legacy-luang-prabang-laos-01/DestinationFinderAI-luang-prabang-Premium-Candidate-v3.3.xlsx", "expectedSha256": "9904d3e4cd5af1cd6ed83a1e2c6f5497a8463808b1cd95f716cdb45a7d486417", "expectedDestinationKeys": ["luang-prabang-laos"], "environment": "production", "candidateDiscovery": "published-catalog"},

{"registryId": "legacy-ensenada-mexico-01", "workbookPath": "data/legacy-ensenada-mexico-01/DestinationFinderAI-ensenada-Premium-Candidate-v3.3.xlsx", "expectedSha256": "fdc459448024cf52f02ba94d9f4106d168e1b8875f3e5336dab1e54be82ed408", "expectedDestinationKeys": ["ensenada-mexico"], "environment": "production", "candidateDiscovery": "published-catalog"},
{"registryId": "legacy-cluj-napoca-romania-01", "workbookPath": "data/legacy-cluj-napoca-romania-01/DestinationFinderAI-cluj-napoca-Premium-Candidate-v3.3.xlsx", "expectedSha256": "526b66ec687dbac2cc4ce7a929554f5daacd4338b4b2e4a5403e12774a10fc72", "expectedDestinationKeys": ["cluj-napoca-romania"], "environment": "production", "candidateDiscovery": "published-catalog"},
{"registryId": "legacy-tampere-finland-01", "workbookPath": "data/legacy-tampere-finland-01/DestinationFinderAI-tampere-Premium-Candidate-v3.3.xlsx", "expectedSha256": "93471501859ef18648b254208206c2b81e4b9ff202013ae3781eaef3af20fe9b", "expectedDestinationKeys": ["tampere-finland"], "environment": "production", "candidateDiscovery": "published-catalog"},
{"registryId": "legacy-rennes-france-01", "workbookPath": "data/legacy-rennes-france-01/DestinationFinderAI-rennes-Premium-Candidate-v3.3.xlsx", "expectedSha256": "8e7586a76338b5347496b5198b610741f70bc452a0470f2038bcb0eaa9c3bc33", "expectedDestinationKeys": ["rennes-france"], "environment": "production", "candidateDiscovery": "published-catalog"},
{"registryId": "legacy-york-united-kingdom-01", "workbookPath": "data/legacy-york-united-kingdom-01/DestinationFinderAI-york-Premium-Candidate-v3.3.xlsx", "expectedSha256": "958e05b266a6347789fdaa8c812dee3447c213a35f33083e9745da3fde9a6c48", "expectedDestinationKeys": ["york-united-kingdom"], "environment": "production", "candidateDiscovery": "published-catalog"},
{"registryId": "legacy-encarnacion-paraguay-01", "workbookPath": "data/legacy-encarnacion-paraguay-01/DestinationFinderAI-encarnacion-Premium-Candidate-v3.3.xlsx", "expectedSha256": "0221e7655ce36ff7ce00bdb78a3ac2ed575c7cd2e472dc09169b9965d67fc939", "expectedDestinationKeys": ["encarnacion-paraguay"], "environment": "production", "candidateDiscovery": "published-catalog"},
{"registryId": "legacy-nara-japan-01", "workbookPath": "data/legacy-nara-japan-01/DestinationFinderAI-nara-Premium-Candidate-v3.3.xlsx", "expectedSha256": "a61726a033ce0286337aa286d3bd2f7e6615e92947c4b54f22b48500342f238e", "expectedDestinationKeys": ["nara-japan"], "environment": "production", "candidateDiscovery": "published-catalog"},
{"registryId": "legacy-regensburg-germany-01", "workbookPath": "data/legacy-regensburg-germany-01/DestinationFinderAI-regensburg-Premium-Candidate-v3.3.xlsx", "expectedSha256": "71ebd552ec677a3d0556ca18b799df0095cc1f716462d9f10edb3aa0683b9030", "expectedDestinationKeys": ["regensburg-germany"], "environment": "production", "candidateDiscovery": "published-catalog"},
{"registryId": "legacy-siem-reap-cambodia-01", "workbookPath": "data/legacy-siem-reap-cambodia-01/DestinationFinderAI-siem-reap-Premium-Candidate-v3.3.xlsx", "expectedSha256": "ce207c40725310ea0f5ff0fd2ef1bf60e8930c13968d0d47e890ee86c69e23a1", "expectedDestinationKeys": ["siem-reap-cambodia"], "environment": "production", "candidateDiscovery": "published-catalog"},
{"registryId": "legacy-vitoria-brazil-01", "workbookPath": "data/legacy-vitoria-brazil-01/DestinationFinderAI-vitoria-Premium-Candidate-v3.3.xlsx", "expectedSha256": "406f9222b29f8be103e857aa9046bc2e752b7a20b3af3d1c8b7073f28a5f9485", "expectedDestinationKeys": ["vitoria-brazil"], "environment": "production", "candidateDiscovery": "published-catalog"},
{"registryId": "legacy-asuncion-paraguay-01", "workbookPath": "data/legacy-asuncion-paraguay-01/DestinationFinderAI-asuncion-Premium-Candidate-v3.3.xlsx", "expectedSha256": "2bc9b8d3597b2ed8fe95fa851e8ac7684bf5e98aa3dc3545b223ecadc3e179d0", "expectedDestinationKeys": ["asuncion-paraguay"], "environment": "production", "candidateDiscovery": "published-catalog"},
{"registryId": "legacy-la-serena-chile-01", "workbookPath": "data/legacy-la-serena-chile-01/DestinationFinderAI-la-serena-Premium-Candidate-v3.3.xlsx", "expectedSha256": "e3badeae6e24ae9dceb8609db4eac96054638cdb846880096fdf415e745bbd7a", "expectedDestinationKeys": ["la-serena-chile"], "environment": "production", "candidateDiscovery": "published-catalog"},
{"registryId": "legacy-coronado-panama-01", "workbookPath": "data/legacy-coronado-panama-01/DestinationFinderAI-coronado-Premium-Candidate-v3.3.xlsx", "expectedSha256": "8830dde26c86325e5941d7c29f699919b975aeb5f3987be0bb5e6048bdf08ecf", "expectedDestinationKeys": ["coronado-panama"], "environment": "production", "candidateDiscovery": "published-catalog"},
{"registryId": "legacy-salerno-italy-01", "workbookPath": "data/legacy-salerno-italy-01/DestinationFinderAI-salerno-Premium-Candidate-v3.3.xlsx", "expectedSha256": "1f1ae1b03a21e7fd1a740043d0d138d8f17aa35b9a57a03d004d7f60c1875f28", "expectedDestinationKeys": ["salerno-italy"], "environment": "production", "candidateDiscovery": "published-catalog"},
{"registryId": "legacy-morelia-mexico-01", "workbookPath": "data/legacy-morelia-mexico-01/DestinationFinderAI-morelia-Premium-Candidate-v3.3.xlsx", "expectedSha256": "e6b5dfb32bd62b08ebddb62133c3adbcc76b20eea1f15a98ba8a2cf03145441b", "expectedDestinationKeys": ["morelia-mexico"], "environment": "production", "candidateDiscovery": "published-catalog"},
{"registryId": "legacy-tbilisi-georgia-01", "workbookPath": "data/legacy-tbilisi-georgia-01/DestinationFinderAI-tbilisi-Premium-Candidate-v3.3.xlsx", "expectedSha256": "573b68070a1147b1143398e537bb6114802f9357c1e67b225261cd725440b085", "expectedDestinationKeys": ["tbilisi-georgia"], "environment": "production", "candidateDiscovery": "published-catalog"},
{"registryId": "legacy-rethymno-greece-01", "workbookPath": "data/legacy-rethymno-greece-01/DestinationFinderAI-rethymno-Premium-Candidate-v3.3.xlsx", "expectedSha256": "200871cf2cc38234bacaf5d344c4834ed987f89552b63cfb09f2c3b7ead46cbb", "expectedDestinationKeys": ["rethymno-greece"], "environment": "production", "candidateDiscovery": "published-catalog"},
{"registryId": "legacy-nantes-france-01", "workbookPath": "data/legacy-nantes-france-01/DestinationFinderAI-nantes-Premium-Candidate-v3.3.xlsx", "expectedSha256": "44caf14b2aacb0445481634e764215523c901cc278808533dfa429e77513ce0c", "expectedDestinationKeys": ["nantes-france"], "environment": "production", "candidateDiscovery": "published-catalog"},
{"registryId": "legacy-san-diego-california-united-states-01", "workbookPath": "data/legacy-san-diego-california-united-states-01/DestinationFinderAI-san-diego-Premium-Candidate-v3.3.xlsx", "expectedSha256": "0c83162aaebcd32ce5245d2ec487b6c51bb84b89c27968182ad946eebe4adb14", "expectedDestinationKeys": ["san-diego-california-united-states"], "environment": "production", "candidateDiscovery": "published-catalog"},
{"registryId": "legacy-jeju-city-south-korea-01", "workbookPath": "data/legacy-jeju-city-south-korea-01/DestinationFinderAI-jeju-city-Premium-Candidate-v3.3.xlsx", "expectedSha256": "c25b1abdf35014c1e7a5dce41d42fdc6dbd24e7aa7bf0799ec9de0f1b454b351", "expectedDestinationKeys": ["jeju-city-south-korea"], "environment": "production", "candidateDiscovery": "published-catalog"},
{"registryId": "legacy-edinburgh-united-kingdom-01", "workbookPath": "data/legacy-edinburgh-united-kingdom-01/DestinationFinderAI-edinburgh-Premium-Candidate-v3.3.xlsx", "expectedSha256": "d593edfb85c198261df85dcc4300b17a9383ae5a6cdc50bc65d5167947cff95a", "expectedDestinationKeys": ["edinburgh-united-kingdom"], "environment": "production", "candidateDiscovery": "published-catalog"},
{"registryId": "legacy-christchurch-new-zealand-01", "workbookPath": "data/legacy-christchurch-new-zealand-01/DestinationFinderAI-christchurch-Premium-Candidate-v3.3.xlsx", "expectedSha256": "96917b617fb01a740c65318520f209000d17c2489d39f155bf4e1371f1f3b7da", "expectedDestinationKeys": ["christchurch-new-zealand"], "environment": "production", "candidateDiscovery": "published-catalog"},
{"registryId": "legacy-utrecht-netherlands-01", "workbookPath": "data/legacy-utrecht-netherlands-01/DestinationFinderAI-utrecht-Premium-Candidate-v3.3.xlsx", "expectedSha256": "4374c69cb76c46c14e687614b8674931a5d19cfa9baf50545ecfea2024aad046", "expectedDestinationKeys": ["utrecht-netherlands"], "environment": "production", "candidateDiscovery": "published-catalog"},
{"registryId": "legacy-hanoi-vietnam-01", "workbookPath": "data/legacy-hanoi-vietnam-01/DestinationFinderAI-hanoi-Premium-Candidate-v3.3.xlsx", "expectedSha256": "7c0e41c1ea83ceb4a5c661e319c72418f32146ca04f77054d12ca36fd43c12a1", "expectedDestinationKeys": ["hanoi-vietnam"], "environment": "production", "candidateDiscovery": "published-catalog"},
{"registryId": "legacy-mexico-city-mexico-01", "workbookPath": "data/legacy-mexico-city-mexico-01/DestinationFinderAI-mexico-city-Premium-Candidate-v3.3.xlsx", "expectedSha256": "141f15e09c30491bc77af271ea1a272b01f6926cf862046baa8d07d7e56ddb44", "expectedDestinationKeys": ["mexico-city-mexico"], "environment": "production", "candidateDiscovery": "published-catalog"},
{
  "registryId": "legacy-graz-austria-01",
  "workbookPath": "data/legacy-graz-austria-01/DestinationFinderAI-graz-Premium-Candidate-v3.3.xlsx",
  "expectedSha256": "16b3f7a164299dcdb83b73d3a4f53e09ee99a54d79596e91346e67c135cf6d11",
  "expectedDestinationKeys": [
    "graz-austria"
  ],
  "environment": "production",
  "candidateDiscovery": "published-catalog"
},
{
  "registryId": "legacy-ponta-delgada-portugal-01",
  "workbookPath": "data/legacy-ponta-delgada-portugal-01/DestinationFinderAI-ponta-delgada-Premium-Candidate-v3.3.xlsx",
  "expectedSha256": "0163f3aaac295a362fe536a4cda119e448aeba08b620e857a71e4e099e9c89fb",
  "expectedDestinationKeys": [
    "ponta-delgada-portugal"
  ],
  "environment": "production",
  "candidateDiscovery": "published-catalog"
},
{
  "registryId": "legacy-quebec-city-canada-01",
  "workbookPath": "data/legacy-quebec-city-canada-01/DestinationFinderAI-quebec-city-Premium-Candidate-v3.3.xlsx",
  "expectedSha256": "7aff177e67663cd4e96d5b36d002fa18c4f33b8a4640c28afffa681eed310442",
  "expectedDestinationKeys": [
    "quebec-city-canada"
  ],
  "environment": "production",
  "candidateDiscovery": "published-catalog"
},
{
  "registryId": "legacy-seville-spain-01",
  "workbookPath": "data/legacy-seville-spain-01/DestinationFinderAI-seville-Premium-Candidate-v3.3.xlsx",
  "expectedSha256": "80a3d5ead976418a2d904420d6e771bd1cfa976b886bc080b66d3ae416fac3c5",
  "expectedDestinationKeys": [
    "seville-spain"
  ],
  "environment": "production",
  "candidateDiscovery": "published-catalog"
},
{
  "registryId": "legacy-lyon-france-01",
  "workbookPath": "data/legacy-lyon-france-01/DestinationFinderAI-lyon-Premium-Candidate-v3.3.xlsx",
  "expectedSha256": "8e6f5cb321dbef9afa4258b51176f620c6b55e32faf364188e0cd98684108836",
  "expectedDestinationKeys": [
    "lyon-france"
  ],
  "environment": "production",
  "candidateDiscovery": "published-catalog"
},
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
