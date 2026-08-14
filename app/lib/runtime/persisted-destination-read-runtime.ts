import type { PersistedDestinationReadResult, ResolvedDestinationIdentity } from "../persistence/v31/types";
import { createPersistedDestinationReadClient } from "../persistence/v31/persisted-destination-read-client";
import { createSupabasePersistedDestinationReadPort } from "../persistence/v31/supabase-persisted-destination-read-port";
import { loadNormalizedPersistedDestinationBundle } from "../persistence/v31/load-normalized-persisted-destination-bundle";
import { supabaseFetch } from "../supabase";

export async function loadPersistedDestinationFromRuntime(identity: ResolvedDestinationIdentity): Promise<PersistedDestinationReadResult> {
  const client = createPersistedDestinationReadClient({
    fetcher: supabaseFetch,
  });

  const port = createSupabasePersistedDestinationReadPort(client);

  return loadNormalizedPersistedDestinationBundle(identity, port);
}
