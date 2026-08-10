import { normalizeScalarValue } from "./normalize";
import type { ComparableScalarPolicy } from "./normalize";
import type {
  DiffPolicy,
  PersistenceModuleKey,
  ScalarOperation,
  ScalarValue,
} from "./types";

export interface DiffScalarInput {
  readonly fieldPath: string;
  readonly currentValue: ScalarValue;
  readonly incomingValue: ScalarValue;
  readonly policy: DiffPolicy;
  readonly scalarPolicy?: ComparableScalarPolicy;
  readonly module?: PersistenceModuleKey;
}

function asNonNullScalar(value: ScalarValue | null): Exclude<ScalarValue, null> {
  return value as Exclude<ScalarValue, null>;
}

function evaluatePolicy(policy: DiffPolicy): void {
  if (policy.updateMode !== "MERGE_NONBLANK") {
    throw new Error(`Unsupported update mode: ${policy.updateMode}`);
  }
}

export function diffScalar(input: DiffScalarInput): ScalarOperation {
  const module = input.module ?? "environmentQuality";
  evaluatePolicy(input.policy);

  const scalarPolicy = input.scalarPolicy ?? "ordinary";
  if (scalarPolicy !== "ordinary" && scalarPolicy !== "url") {
    throw new Error(`Unsupported scalar policy: ${scalarPolicy}`);
  }

  const currentSemantic = normalizeScalarValue(input.currentValue, scalarPolicy);
  const incomingSemantic = normalizeScalarValue(input.incomingValue, scalarPolicy);

  if (currentSemantic === null && incomingSemantic === null) {
    return {
      kind: "UNCHANGED",
      module,
      fieldPath: input.fieldPath,
      currentValue: asNonNullScalar(currentSemantic),
      incomingValue: asNonNullScalar(incomingSemantic),
    };
  }

  if (currentSemantic === null && incomingSemantic !== null) {
    return {
      kind: "CREATE",
      module,
      fieldPath: input.fieldPath,
      currentValue: null,
      incomingValue: incomingSemantic,
    };
  }

  if (currentSemantic !== null && incomingSemantic === null) {
    return {
      kind: "PRESERVE",
      module,
      fieldPath: input.fieldPath,
      currentValue: currentSemantic,
      incomingValue: null,
    };
  }

  if (currentSemantic !== incomingSemantic) {
    return {
      kind: "UPDATE",
      module,
      fieldPath: input.fieldPath,
      currentValue: currentSemantic,
      incomingValue: incomingSemantic,
    };
  }

  return {
    kind: "UNCHANGED",
    module,
    fieldPath: input.fieldPath,
    currentValue: currentSemantic,
    incomingValue: incomingSemantic,
  };
}
