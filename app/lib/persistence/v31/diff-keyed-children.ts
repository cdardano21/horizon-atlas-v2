import { normalizeComparable } from "./normalize";
import type {
  ChildCreateOperation,
  ChildPayloadByModule,
  ChildPreserveOperation,
  ChildStableKeyByModule,
  ChildUnchangedOperation,
  ChildUpdateOperation,
  KeyedChildModuleKey,
  StableChildKey,
} from "./types";

type ChildOperationForModule<M extends KeyedChildModuleKey> =
  | ChildCreateOperation<M>
  | ChildPreserveOperation<M>
  | ChildUnchangedOperation<M>
  | ChildUpdateOperation<M>;

export interface DiffKeyedChildrenInput<M extends KeyedChildModuleKey> {
  readonly module: M;
  readonly currentChildren: readonly ChildPayloadByModule[M][];
  readonly incomingChildren: readonly ChildPayloadByModule[M][];
  readonly getStableKey: (
    child: ChildPayloadByModule[M]
  ) => ChildStableKeyByModule[M] | null;
}

class ChildKeyError extends Error {
  readonly kind: "UNSTABLE_CHILD_KEY" | "DUPLICATE_CHILD_KEY";
  readonly module: KeyedChildModuleKey;
  readonly childKey?: StableChildKey | null;

  constructor(kind: "UNSTABLE_CHILD_KEY" | "DUPLICATE_CHILD_KEY", message: string, module: KeyedChildModuleKey, childKey?: StableChildKey | null) {
    super(message);
    this.name = kind;
    this.kind = kind;
    this.module = module;
    this.childKey = childKey;
  }
}

export class UnstableChildKeyError extends ChildKeyError {
  constructor(message: string, module: KeyedChildModuleKey, childKey: StableChildKey | null) {
    super("UNSTABLE_CHILD_KEY", message, module, childKey);
  }
}

export class DuplicateChildKeyError extends ChildKeyError {
  constructor(message: string, module: KeyedChildModuleKey, childKey: StableChildKey) {
    super("DUPLICATE_CHILD_KEY", message, module, childKey);
  }
}

function compareChildren(left: unknown, right: unknown): boolean {
  return JSON.stringify(normalizeComparable(left)) === JSON.stringify(normalizeComparable(right));
}

function stableKeyToString(value: StableChildKey | null): string | null {
  return value === null ? null : String(value);
}

function createCreateOperation<M extends KeyedChildModuleKey>(
  module: M,
  stableChildKey: ChildStableKeyByModule[M],
  incomingChild: ChildPayloadByModule[M],
): ChildCreateOperation<M> {
  return {
    kind: "CREATE_CHILD",
    module,
    stableChildKey,
    currentChild: null,
    incomingChild,
  };
}

function createPreserveOperation<M extends KeyedChildModuleKey>(
  module: M,
  stableChildKey: ChildStableKeyByModule[M],
  currentChild: ChildPayloadByModule[M],
): ChildPreserveOperation<M> {
  return {
    kind: "PRESERVE_CHILD",
    module,
    stableChildKey,
    currentChild,
    incomingChild: null,
  };
}

function createUnchangedOperation<M extends KeyedChildModuleKey>(
  module: M,
  stableChildKey: ChildStableKeyByModule[M],
  currentChild: ChildPayloadByModule[M],
  incomingChild: ChildPayloadByModule[M],
): ChildUnchangedOperation<M> {
  return {
    kind: "UNCHANGED_CHILD",
    module,
    stableChildKey,
    currentChild,
    incomingChild,
  };
}

function createUpdateOperation<M extends KeyedChildModuleKey>(
  module: M,
  stableChildKey: ChildStableKeyByModule[M],
  currentChild: ChildPayloadByModule[M],
  incomingChild: ChildPayloadByModule[M],
): ChildUpdateOperation<M> {
  return {
    kind: "UPDATE_CHILD",
    module,
    stableChildKey,
    currentChild,
    incomingChild,
  };
}

export function diffKeyedChildren<M extends KeyedChildModuleKey>(
  input: DiffKeyedChildrenInput<M>
): readonly ChildOperationForModule<M>[] {
  const currentEntries = [...input.currentChildren];
  const incomingEntries = [...input.incomingChildren];

  const currentByKey = new Map<string, ChildPayloadByModule[M]>();
  for (const child of currentEntries) {
    const stableKey = input.getStableKey(child);
    const key = stableKeyToString(stableKey as StableChildKey | null);
    if (key === null) {
      throw new UnstableChildKeyError(`Missing stable child key for module ${input.module}`, input.module, stableKey as StableChildKey | null);
    }
    if (currentByKey.has(key)) {
      throw new DuplicateChildKeyError(`Duplicate stable child key ${key} for module ${input.module}`, input.module, key as StableChildKey);
    }
    currentByKey.set(key, child);
  }

  const incomingByKey = new Map<string, ChildPayloadByModule[M]>();
  for (const child of incomingEntries) {
    const stableKey = input.getStableKey(child);
    const key = stableKeyToString(stableKey as StableChildKey | null);
    if (key === null) {
      throw new UnstableChildKeyError(`Missing stable child key for module ${input.module}`, input.module, stableKey as StableChildKey | null);
    }
    if (incomingByKey.has(key)) {
      throw new DuplicateChildKeyError(`Duplicate stable child key ${key} for module ${input.module}`, input.module, key as StableChildKey);
    }
    incomingByKey.set(key, child);
  }

  const allKeys = new Set([...currentByKey.keys(), ...incomingByKey.keys()]);
  const operations = Array.from(allKeys)
    .sort((left, right) => left.localeCompare(right))
    .map((key) => {
      const currentChild = currentByKey.get(key) ?? null;
      const incomingChild = incomingByKey.get(key) ?? null;

      if (currentChild === null && incomingChild !== null) {
        return createCreateOperation(input.module, key as ChildStableKeyByModule[M], incomingChild) as ChildOperationForModule<M>;
      }

      if (currentChild !== null && incomingChild === null) {
        return createPreserveOperation(input.module, key as ChildStableKeyByModule[M], currentChild) as ChildOperationForModule<M>;
      }

      if (currentChild !== null && incomingChild !== null) {
        if (compareChildren(currentChild, incomingChild)) {
          return createUnchangedOperation(input.module, key as ChildStableKeyByModule[M], currentChild, incomingChild) as ChildOperationForModule<M>;
        }

        return createUpdateOperation(input.module, key as ChildStableKeyByModule[M], currentChild, incomingChild) as ChildOperationForModule<M>;
      }

      return createUnchangedOperation(input.module, key as ChildStableKeyByModule[M], currentChild as ChildPayloadByModule[M], incomingChild as ChildPayloadByModule[M]) as ChildOperationForModule<M>;
    });

  return operations;
}
