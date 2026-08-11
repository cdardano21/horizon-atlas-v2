import type { CanonicalDestinationKey, ChildOperationKind, DestinationId, DestinationPlanAction, PersistenceModuleKey, PlanStatus, RepeatableModuleKey, ScalarOperationKind, StableChildKey } from "./types";

export type PersistenceError =
  | {
      readonly kind: "UNSTABLE_CHILD_KEY";
      readonly message: string;
      readonly module: RepeatableModuleKey;
      readonly childKey?: StableChildKey | null;
    }
  | {
      readonly kind: "DUPLICATE_CHILD_KEY";
      readonly message: string;
      readonly module: RepeatableModuleKey;
      readonly childKey: StableChildKey;
    }
  | {
      readonly kind: "CROSS_DESTINATION_REFERENCE";
      readonly message: string;
      readonly expectedDestinationKey: CanonicalDestinationKey;
      readonly foundDestinationKey: CanonicalDestinationKey;
      readonly module: RepeatableModuleKey;
      readonly childKey: StableChildKey;
    }
  | {
      readonly kind: "OUT_OF_SCOPE_DESTINATION";
      readonly message: string;
      readonly destinationKey: CanonicalDestinationKey;
    }
  | {
      readonly kind: "MANIFEST_TARGET_NOT_FOUND";
      readonly message: string;
      readonly destinationKey: CanonicalDestinationKey;
      readonly target: string;
    }
  | {
      readonly kind: "MANIFEST_CONFLICT";
      readonly message: string;
      readonly destinationKey: CanonicalDestinationKey;
      readonly target: string;
    }
  | {
      readonly kind: "MANIFEST_DESTINATION_NOT_IN_WORKBOOK";
      readonly message: string;
      readonly destinationKey: CanonicalDestinationKey;
    }
  | {
      readonly kind: "MANIFEST_FIELD_PATH_INVALID";
      readonly message: string;
      readonly fieldPath: string;
      readonly module: PersistenceModuleKey;
    }
  | {
      readonly kind: "DELETE_TARGET_MISSING";
      readonly message: string;
      readonly destination: CanonicalDestinationKey;
      readonly module: RepeatableModuleKey;
      readonly childKey: StableChildKey;
    }
  | {
      readonly kind: "NORMALIZATION_VERSION_MISMATCH";
      readonly message: string;
      readonly expectedVersion: string;
      readonly receivedVersion: string;
    }
  | {
      readonly kind: "PLAN_IDENTITY_CONFLICT";
      readonly message: string;
      readonly destinationKey: CanonicalDestinationKey;
      readonly destinationId: DestinationId;
      readonly conflictingDestinationKey?: CanonicalDestinationKey | null;
      readonly conflictingDestinationId?: DestinationId | null;
      readonly reason: "SCOPE_DESTINATION_ID_MISMATCH" | "DUPLICATE_DESTINATION_KEY" | "DUPLICATE_DESTINATION_ID";
    }
  | {
      readonly kind: "PLAN_EXECUTION_PRECHECK_FAILED";
      readonly message: string;
      readonly destinationKey?: CanonicalDestinationKey | null;
      readonly planAction?: DestinationPlanAction | null;
      readonly planStatus?: PlanStatus | null;
      readonly reason: "PLAN_HAS_ERRORS" | "UNSUPPORTED_ACTION" | "INVALID_STATUS";
    }
  | {
      readonly kind: "DIFF_POLICY_VERSION_MISMATCH";
      readonly message: string;
      readonly expectedVersion: string;
      readonly receivedVersion: string;
    }
  | {
      readonly kind: "EXECUTION_FAILURE";
      readonly message: string;
      readonly destinationKey: CanonicalDestinationKey;
      readonly destinationId: DestinationId;
      readonly reason: ExecutionFailureReason;
      readonly operation?: ScalarOperationKind | ChildOperationKind | "REPLACE_MODULE" | null;
      readonly module?: PersistenceModuleKey | null;
      readonly fieldPath?: string | null;
      readonly stableChildKey?: StableChildKey | null;
    }
  | {
      readonly kind: "UNSUPPORTED_MODULE_SHAPE";
      readonly message: string;
      readonly module: PersistenceModuleKey;
    }
  | {
      readonly kind: "SCHEMA_VERSION_MISMATCH";
      readonly message: string;
      readonly expectedVersion: string;
      readonly receivedVersion: string;
    };

export type ExecutionFailureReason =
  | "MISSING_STARTING_STATE"
  | "UNSUPPORTED_DESTINATION_ACTION"
  | "STALE_PRECONDITION"
  | "DUPLICATE_CHILD_CREATE"
  | "DUPLICATE_STORED_CHILD_IDENTITY"
  | "MISSING_CHILD"
  | "READ_BACK_MISMATCH"
  | "SIMULATED_TRANSACTION_FAILURE";

export type ExecutionFailurePersistenceError = Extract<PersistenceError, { readonly kind: "EXECUTION_FAILURE" }>;
