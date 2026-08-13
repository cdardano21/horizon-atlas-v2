import type { PersistedPresenceModuleKey, ResolvedDestinationIdentity } from "./types";

export interface ReadResult<T, E> {
  readonly ok: boolean;
  readonly value?: T;
  readonly error?: E;
}

export interface PersistedDestinationReadPort {
  readonly readRoot: (identity: ResolvedDestinationIdentity) => Promise<ReadResult<unknown, { readonly reason: "DB_READ_FAILED" }>>;
  readonly readProfile: (identity: ResolvedDestinationIdentity) => Promise<ReadResult<unknown, { readonly reason: "DB_READ_FAILED" }>>;
  readonly readPresence: (identity: ResolvedDestinationIdentity) => Promise<ReadResult<unknown, { readonly reason: "DB_READ_FAILED" }>>;
  readonly readKeyedChildren: (identity: ResolvedDestinationIdentity) => Promise<ReadResult<unknown, { readonly reason: "DB_READ_FAILED"; readonly module: PersistedPresenceModuleKey }>>;
  readonly readReplaceModules: (identity: ResolvedDestinationIdentity) => Promise<ReadResult<unknown, { readonly reason: "DB_READ_FAILED"; readonly module: PersistedPresenceModuleKey }>>;
  readonly readSingletons: (identity: ResolvedDestinationIdentity) => Promise<ReadResult<unknown, { readonly reason: "DB_READ_FAILED"; readonly module: PersistedPresenceModuleKey }>>;
}
