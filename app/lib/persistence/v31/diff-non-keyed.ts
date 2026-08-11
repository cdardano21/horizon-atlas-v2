import { diffScalar } from "./diff-scalar";
import { normalizeComparable } from "./normalize";
import type { ComparableScalarPolicy } from "./normalize";
import type {
  DiffPolicy,
  NonKeyedRepeatableModuleKey,
  PersistenceModuleKey,
  ScalarOperation,
  ScalarValue,
  SingletonModuleKey,
} from "./types";

export interface DiffNonKeyedRepeatableModuleInput<M extends NonKeyedRepeatableModuleKey = NonKeyedRepeatableModuleKey> {
  readonly module: M;
  readonly currentValue: readonly unknown[];
  readonly incomingValue: readonly unknown[];
  readonly policy: DiffPolicy;
}

export interface DiffSingletonModuleInput<M extends SingletonModuleKey = SingletonModuleKey> {
  readonly module: M;
  readonly currentValue: unknown;
  readonly incomingValue: unknown;
  readonly policy: DiffPolicy;
  readonly fieldDefinitions?: readonly SingletonFieldDefinition[];
}

export interface SingletonFieldDefinition {
  readonly fieldPath: string;
  readonly scalarPolicy?: ComparableScalarPolicy;
}

export type NonKeyedRepeatableModuleDiffKind = "MODULE_UNCHANGED" | "MODULE_PRESERVED" | "MODULE_DIFFERENT_BUT_REPLACEMENT_NOT_AUTHORIZED";
export type SingletonModuleDiffKind = "MODULE_UNCHANGED" | "MODULE_PRESERVED" | "MODULE_FIELD_OPERATIONS";

export interface NonKeyedRepeatableModuleDiffResult<M extends NonKeyedRepeatableModuleKey = NonKeyedRepeatableModuleKey> {
  readonly kind: NonKeyedRepeatableModuleDiffKind;
  readonly module: M;
  readonly operations: readonly [];
}

export interface SingletonModuleDiffResult<M extends SingletonModuleKey = SingletonModuleKey> {
  readonly kind: SingletonModuleDiffKind;
  readonly module: M;
  readonly operations: readonly ScalarOperation[];
}

function evaluatePolicy(policy: DiffPolicy): void {
  if (policy.updateMode !== "MERGE_NONBLANK") {
    throw new Error(`Unsupported update mode: ${policy.updateMode}`);
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getObjectValue(value: unknown): Record<string, unknown> {
  if (!isPlainObject(value)) {
    return {};
  }
  return value;
}

function collectFieldPaths(currentValue: unknown, incomingValue: unknown): readonly string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];

  for (const candidate of [getObjectValue(currentValue), getObjectValue(incomingValue)]) {
    for (const fieldPath of Object.keys(candidate)) {
      if (!seen.has(fieldPath)) {
        seen.add(fieldPath);
        ordered.push(fieldPath);
      }
    }
  }

  return ordered;
}

function getFieldValue(source: unknown, fieldPath: string): ScalarValue | null {
  if (!isPlainObject(source)) {
    return null;
  }
  const descriptor = source[fieldPath];
  if (descriptor === undefined) {
    return null;
  }
  return descriptor as ScalarValue;
}

function compareSemanticValues(left: readonly unknown[], right: readonly unknown[]): boolean {
  return JSON.stringify(normalizeComparable(left)) === JSON.stringify(normalizeComparable(right));
}

export function diffNonKeyedRepeatableModule<M extends NonKeyedRepeatableModuleKey>(input: DiffNonKeyedRepeatableModuleInput<M>): NonKeyedRepeatableModuleDiffResult<M> {
  evaluatePolicy(input.policy);

  if (input.currentValue.length === 0 && input.incomingValue.length === 0) {
    return {
      kind: "MODULE_UNCHANGED",
      module: input.module,
      operations: [],
    };
  }

  if (input.currentValue.length > 0 && input.incomingValue.length === 0) {
    return {
      kind: "MODULE_PRESERVED",
      module: input.module,
      operations: [],
    };
  }

  if (input.currentValue.length === 0 && input.incomingValue.length > 0) {
    return {
      kind: "MODULE_DIFFERENT_BUT_REPLACEMENT_NOT_AUTHORIZED",
      module: input.module,
      operations: [],
    };
  }

  if (compareSemanticValues(input.currentValue, input.incomingValue)) {
    return {
      kind: "MODULE_UNCHANGED",
      module: input.module,
      operations: [],
    };
  }

  return {
    kind: "MODULE_DIFFERENT_BUT_REPLACEMENT_NOT_AUTHORIZED",
    module: input.module,
    operations: [],
  };
}

export function diffSingletonModule<M extends SingletonModuleKey>(input: DiffSingletonModuleInput<M>): SingletonModuleDiffResult<M> {
  evaluatePolicy(input.policy);

  const fieldDefinitions = input.fieldDefinitions ?? [];
  const descriptors = fieldDefinitions.length > 0
    ? fieldDefinitions
    : collectFieldPaths(input.currentValue, input.incomingValue).map((fieldPath) => ({ fieldPath }));

  const operations = descriptors.map((definition) => {
    const currentValue = getFieldValue(input.currentValue, definition.fieldPath);
    const incomingValue = getFieldValue(input.incomingValue, definition.fieldPath);
    return diffScalar({
      module: input.module,
      fieldPath: definition.fieldPath,
      currentValue,
      incomingValue,
      policy: input.policy,
      scalarPolicy: definition.scalarPolicy,
    });
  });

  if (operations.every((operation) => operation.kind === "UNCHANGED")) {
    return {
      kind: "MODULE_UNCHANGED",
      module: input.module,
      operations: [],
    };
  }

  if (operations.some((operation) => operation.kind === "PRESERVE") && operations.every((operation) => operation.kind === "PRESERVE" || operation.kind === "UNCHANGED")) {
    return {
      kind: "MODULE_PRESERVED",
      module: input.module,
      operations,
    };
  }

  return {
    kind: "MODULE_FIELD_OPERATIONS",
    module: input.module,
    operations,
  };
}
