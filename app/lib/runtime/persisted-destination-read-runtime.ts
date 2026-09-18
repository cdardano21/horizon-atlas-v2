import type { PersistedDestinationReadResult, ResolvedDestinationIdentity } from "../persistence/v31/types";
import { createPersistedDestinationReadClient } from "../persistence/v31/persisted-destination-read-client";
import { createSupabasePersistedDestinationReadPort } from "../persistence/v31/supabase-persisted-destination-read-port";
import { loadNormalizedPersistedDestinationBundle } from "../persistence/v31/load-normalized-persisted-destination-bundle";
import { supabaseFetch } from "../supabase";

type PersistedDestinationReadTransport = (path: string, options?: RequestInit) => Promise<Response>;

export interface PersistedDestinationReadRuntimeDependencies {
  readonly fetcher?: PersistedDestinationReadTransport;
}

export async function loadPersistedDestinationFromRuntime(
  identity: ResolvedDestinationIdentity,
  dependencies: PersistedDestinationReadRuntimeDependencies = {},
): Promise<PersistedDestinationReadResult> {
  const client = createPersistedDestinationReadClient({
    fetcher: dependencies.fetcher ?? supabaseFetch,
  });

  const port = createSupabasePersistedDestinationReadPort(client);

  return loadNormalizedPersistedDestinationBundle(identity, port);
}
