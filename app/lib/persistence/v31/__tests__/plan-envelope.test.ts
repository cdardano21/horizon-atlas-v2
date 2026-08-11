import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

import type { PersistenceError } from "../errors";
import { buildPlanEnvelope, validatePlanEnvelopeForExecution } from "../plan-envelope";
import type { ApprovedDestinationScope, CanonicalDestinationKey, DestinationId, DestinationPlan, ExecutionPolicy, PlanEnvelope, ResolvedDestinationIdentity } from "../types";

const DESTINATION_A_KEY = "dest-a" as CanonicalDestinationKey;
const DESTINATION_A_ID = "dest-id-a" as DestinationId;
const DESTINATION_B_KEY = "dest-b" as CanonicalDestinationKey;
const DESTINATION_B_ID = "dest-id-b" as DestinationId;
const LEGAL_EXECUTION_POLICY: ExecutionPolicy = Object.freeze({
  transactionGranularity: "PER_DESTINATION",
  failurePolicy: "CONTINUE_AFTER_FAILURE",
  replayPolicy: "IDEMPOTENT_REPLAY",
  stalePlanPolicy: "STRICT_PRECONDITION_MATCH",
  readBackVerification: true,
});

function createApprovedScope(): ApprovedDestinationScope {
  return Object.freeze([
    Object.freeze({ destinationKey: DESTINATION_A_KEY, destinationId: DESTINATION_A_ID }),
  ]);
}

function createResolvedIdentity(destinationKey: CanonicalDestinationKey = DESTINATION_A_KEY, destinationId: DestinationId = DESTINATION_A_ID): ResolvedDestinationIdentity {
  return Object.freeze({ destinationKey, destinationId });
}

function createDestinationPlan(destinationKey: CanonicalDestinationKey = DESTINATION_A_KEY, destinationId: DestinationId = DESTINATION_A_ID, overrides: Partial<DestinationPlan> = {}): DestinationPlan {
  return Object.freeze({
    destinationIdentity: Object.freeze({ destinationKey, destinationId }),
    action: "UNCHANGED",
    scalarOperations: Object.freeze([]),
    childOperations: Object.freeze([]),
    warnings: Object.freeze([]),
    errors: Object.freeze([]),
    moduleExecutionOperations: Object.freeze([]),
    expectedComparablePostState: Object.freeze({}),
    ...overrides,
  });
}

describe("plan envelope assembly", () => {
  it("preserves explicit hashes and leaves absent hashes null", () => {
    const envelope = buildPlanEnvelope({
      planId: "plan-1",
      approvedScope: createApprovedScope(),
      executionPolicy: LEGAL_EXECUTION_POLICY,
      status: "APPROVED",
      destinationPlans: [createDestinationPlan()],
      contractSchemaVersion: "v3.1",
      normalizationVersion: "v1",
      diffPolicyVersion: "v1",
    });

    expect(envelope.planHash).toBeNull();
    expect(envelope.workbookHash).toBeNull();
    expect(envelope.operationManifestHash).toBeNull();

    const explicitEnvelope = buildPlanEnvelope({
      planId: "plan-2",
      approvedScope: createApprovedScope(),
      executionPolicy: LEGAL_EXECUTION_POLICY,
      destinationPlans: [createDestinationPlan()],
      planHash: "plan-hash",
      workbookHash: "workbook-hash",
      operationManifestHash: "manifest-hash",
    });

    expect(explicitEnvelope.planHash).toBe("plan-hash");
    expect(explicitEnvelope.workbookHash).toBe("workbook-hash");
    expect(explicitEnvelope.operationManifestHash).toBe("manifest-hash");
  });

  it("does not mutate build or preflight inputs", () => {
    const approvedScope = [{ destinationKey: DESTINATION_A_KEY, destinationId: DESTINATION_A_ID }];
    const destinationPlans = [createDestinationPlan()];
    const input = {
      planId: "plan-3",
      approvedScope,
      executionPolicy: LEGAL_EXECUTION_POLICY,
      destinationPlans,
      status: "APPROVED" as const,
      contractSchemaVersion: "v3.1",
      normalizationVersion: "v1",
      diffPolicyVersion: "v1",
    };
    const beforeBuild = JSON.parse(JSON.stringify(input));
    const envelope = buildPlanEnvelope(input);
    expect(JSON.parse(JSON.stringify(input))).toEqual(beforeBuild);

    const beforeValidation = JSON.parse(JSON.stringify(envelope));
    const result = validatePlanEnvelopeForExecution({ envelope });
    expect(JSON.parse(JSON.stringify(envelope))).toEqual(beforeValidation);
    expect(result.valid).toBe(true);
  });

  it("rejects scope identity mismatches with PLAN_IDENTITY_CONFLICT", () => {
    const envelope = buildPlanEnvelope({
      approvedScope: [{ destinationKey: DESTINATION_A_KEY, destinationId: DESTINATION_A_ID }],
      executionPolicy: LEGAL_EXECUTION_POLICY,
      destinationPlans: [createDestinationPlan(DESTINATION_A_KEY, DESTINATION_B_ID)],
      status: "APPROVED",
      contractSchemaVersion: "v3.1",
      normalizationVersion: "v1",
      diffPolicyVersion: "v1",
    });

    const result = validatePlanEnvelopeForExecution({ envelope, expectedContractSchemaVersion: "v3.1", expectedNormalizationVersion: "v1", expectedDiffPolicyVersion: "v1" });

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining([expect.objectContaining({ kind: "PLAN_IDENTITY_CONFLICT", reason: "SCOPE_DESTINATION_ID_MISMATCH" })]));
  });

  it("rejects duplicate destination keys and duplicate destination ids", () => {
    const duplicateKeyEnvelope = buildPlanEnvelope({
      approvedScope: [{ destinationKey: DESTINATION_A_KEY, destinationId: DESTINATION_A_ID }],
      executionPolicy: LEGAL_EXECUTION_POLICY,
      destinationPlans: [createDestinationPlan(DESTINATION_A_KEY, DESTINATION_A_ID), createDestinationPlan(DESTINATION_A_KEY, DESTINATION_A_ID)],
      status: "APPROVED",
      contractSchemaVersion: "v3.1",
      normalizationVersion: "v1",
      diffPolicyVersion: "v1",
    });

    const duplicateKeyResult = validatePlanEnvelopeForExecution({ envelope: duplicateKeyEnvelope, expectedContractSchemaVersion: "v3.1", expectedNormalizationVersion: "v1", expectedDiffPolicyVersion: "v1" });
    expect(duplicateKeyResult.errors).toEqual(expect.arrayContaining([expect.objectContaining({ kind: "PLAN_IDENTITY_CONFLICT", reason: "DUPLICATE_DESTINATION_KEY" })]));

    const duplicateIdEnvelope = buildPlanEnvelope({
      approvedScope: [
        { destinationKey: DESTINATION_A_KEY, destinationId: DESTINATION_A_ID },
        { destinationKey: DESTINATION_B_KEY, destinationId: DESTINATION_A_ID },
      ],
      executionPolicy: LEGAL_EXECUTION_POLICY,
      destinationPlans: [createDestinationPlan(DESTINATION_A_KEY, DESTINATION_A_ID), createDestinationPlan(DESTINATION_B_KEY, DESTINATION_A_ID)],
      status: "APPROVED",
      contractSchemaVersion: "v3.1",
      normalizationVersion: "v1",
      diffPolicyVersion: "v1",
    });

    const duplicateIdResult = validatePlanEnvelopeForExecution({ envelope: duplicateIdEnvelope, expectedContractSchemaVersion: "v3.1", expectedNormalizationVersion: "v1", expectedDiffPolicyVersion: "v1" });
    expect(duplicateIdResult.errors).toEqual(expect.arrayContaining([expect.objectContaining({ kind: "PLAN_IDENTITY_CONFLICT", reason: "DUPLICATE_DESTINATION_ID" })]));
  });

  it("rejects CREATE and ERROR actions and preserves wrapped plan errors", () => {
    const createEnvelope = buildPlanEnvelope({
      approvedScope: createApprovedScope(),
      executionPolicy: LEGAL_EXECUTION_POLICY,
      destinationPlans: [createDestinationPlan(DESTINATION_A_KEY, DESTINATION_A_ID, { action: "CREATE" })],
      status: "APPROVED",
      contractSchemaVersion: "v3.1",
      normalizationVersion: "v1",
      diffPolicyVersion: "v1",
    });

    const createResult = validatePlanEnvelopeForExecution({ envelope: createEnvelope, expectedContractSchemaVersion: "v3.1", expectedNormalizationVersion: "v1", expectedDiffPolicyVersion: "v1" });
    expect(createResult.errors).toEqual(expect.arrayContaining([expect.objectContaining({ kind: "PLAN_EXECUTION_PRECHECK_FAILED", reason: "UNSUPPORTED_ACTION", planAction: "CREATE" })]));

    const underlyingError: PersistenceError = { kind: "OUT_OF_SCOPE_DESTINATION", message: "blocked", destinationKey: DESTINATION_A_KEY };
    const errorEnvelope = buildPlanEnvelope({
      approvedScope: createApprovedScope(),
      executionPolicy: LEGAL_EXECUTION_POLICY,
      destinationPlans: [createDestinationPlan(DESTINATION_A_KEY, DESTINATION_A_ID, { action: "ERROR", errors: Object.freeze([underlyingError]) })],
      status: "APPROVED",
      contractSchemaVersion: "v3.1",
      normalizationVersion: "v1",
      diffPolicyVersion: "v1",
    });

    const errorResult = validatePlanEnvelopeForExecution({ envelope: errorEnvelope, expectedContractSchemaVersion: "v3.1", expectedNormalizationVersion: "v1", expectedDiffPolicyVersion: "v1" });
    expect(errorResult.errors).toEqual(expect.arrayContaining([expect.objectContaining({ kind: "PLAN_EXECUTION_PRECHECK_FAILED", reason: "UNSUPPORTED_ACTION", planAction: "ERROR" }), expect.objectContaining({ kind: "OUT_OF_SCOPE_DESTINATION", destinationKey: DESTINATION_A_KEY })]));
  });

  it("rejects non-approved status and version mismatches with the approved error kinds", () => {
    const envelope = buildPlanEnvelope({
      approvedScope: createApprovedScope(),
      executionPolicy: LEGAL_EXECUTION_POLICY,
      destinationPlans: [createDestinationPlan()],
      status: "DRAFT",
      contractSchemaVersion: "v3.0",
      normalizationVersion: "v0",
      diffPolicyVersion: "v0",
    });

    const result = validatePlanEnvelopeForExecution({ envelope, expectedContractSchemaVersion: "v3.1", expectedNormalizationVersion: "v1", expectedDiffPolicyVersion: "v1" });

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: "PLAN_EXECUTION_PRECHECK_FAILED", reason: "INVALID_STATUS", planStatus: "DRAFT" }),
      expect.objectContaining({ kind: "SCHEMA_VERSION_MISMATCH" }),
      expect.objectContaining({ kind: "NORMALIZATION_VERSION_MISMATCH" }),
      expect.objectContaining({ kind: "DIFF_POLICY_VERSION_MISMATCH" }),
    ]));
  });

  it("produces identical serialized envelopes for same semantic input and reversed order", () => {
    const first = buildPlanEnvelope({
      approvedScope: [
        { destinationKey: DESTINATION_A_KEY, destinationId: DESTINATION_A_ID },
        { destinationKey: DESTINATION_B_KEY, destinationId: DESTINATION_B_ID },
      ],
      executionPolicy: LEGAL_EXECUTION_POLICY,
      destinationPlans: [createDestinationPlan(DESTINATION_A_KEY, DESTINATION_A_ID), createDestinationPlan(DESTINATION_B_KEY, DESTINATION_B_ID)],
      status: "APPROVED",
      contractSchemaVersion: "v3.1",
      normalizationVersion: "v1",
      diffPolicyVersion: "v1",
    });

    const reversed = buildPlanEnvelope({
      approvedScope: [
        { destinationKey: DESTINATION_A_KEY, destinationId: DESTINATION_A_ID },
        { destinationKey: DESTINATION_B_KEY, destinationId: DESTINATION_B_ID },
      ],
      executionPolicy: LEGAL_EXECUTION_POLICY,
      destinationPlans: [createDestinationPlan(DESTINATION_B_KEY, DESTINATION_B_ID), createDestinationPlan(DESTINATION_A_KEY, DESTINATION_A_ID)],
      status: "APPROVED",
      contractSchemaVersion: "v3.1",
      normalizationVersion: "v1",
      diffPolicyVersion: "v1",
    });

    expect(JSON.stringify(first)).toBe(JSON.stringify(reversed));
  });

  it("preserves execution policy and keeps envelope semantics deterministic", () => {
    const suppliedPolicy: ExecutionPolicy = {
      transactionGranularity: "PER_DESTINATION",
      failurePolicy: "CONTINUE_AFTER_FAILURE",
      replayPolicy: "IDEMPOTENT_REPLAY",
      stalePlanPolicy: "STRICT_PRECONDITION_MATCH",
      readBackVerification: true,
    };

    const envelope = buildPlanEnvelope({
      approvedScope: [
        { destinationKey: DESTINATION_A_KEY, destinationId: DESTINATION_A_ID },
        { destinationKey: DESTINATION_B_KEY, destinationId: DESTINATION_B_ID },
      ],
      executionPolicy: suppliedPolicy,
      destinationPlans: [createDestinationPlan(DESTINATION_A_KEY, DESTINATION_A_ID), createDestinationPlan(DESTINATION_B_KEY, DESTINATION_B_ID)],
      status: "APPROVED",
      contractSchemaVersion: "v3.1",
      normalizationVersion: "v1",
      diffPolicyVersion: "v1",
    });

    expect(envelope.executionPolicy).toEqual(suppliedPolicy);
    expect(suppliedPolicy).toEqual({
      transactionGranularity: "PER_DESTINATION",
      failurePolicy: "CONTINUE_AFTER_FAILURE",
      replayPolicy: "IDEMPOTENT_REPLAY",
      stalePlanPolicy: "STRICT_PRECONDITION_MATCH",
      readBackVerification: true,
    });

    const result = validatePlanEnvelopeForExecution({ envelope, expectedContractSchemaVersion: "v3.1", expectedNormalizationVersion: "v1", expectedDiffPolicyVersion: "v1" });
    expect(result.valid).toBe(true);

    const reversed = buildPlanEnvelope({
      approvedScope: [
        { destinationKey: DESTINATION_A_KEY, destinationId: DESTINATION_A_ID },
        { destinationKey: DESTINATION_B_KEY, destinationId: DESTINATION_B_ID },
      ],
      executionPolicy: suppliedPolicy,
      destinationPlans: [createDestinationPlan(DESTINATION_B_KEY, DESTINATION_B_ID), createDestinationPlan(DESTINATION_A_KEY, DESTINATION_A_ID)],
      status: "APPROVED",
      contractSchemaVersion: "v3.1",
      normalizationVersion: "v1",
      diffPolicyVersion: "v1",
    });

    expect(JSON.stringify(envelope)).toBe(JSON.stringify(reversed));
  });

  it("is deterministic across a fresh Node process", () => {
    const tempDir = join(tmpdir(), `plan-envelope-fresh-${Date.now()}-${Math.random().toString(16).slice(2)}`);
    mkdirSync(tempDir, { recursive: true });
    const scriptPath = join(tempDir, "plan-envelope-harness.mts");
    const planEnvelopeModule = pathToFileURL(resolve(process.cwd(), "app/lib/persistence/v31/plan-envelope.ts")).href;
    const script = `
      import { buildPlanEnvelope } from ${JSON.stringify(planEnvelopeModule)};
      const envelope = buildPlanEnvelope({
        planId: 'plan-1',
        approvedScope: [{ destinationKey: 'dest-a', destinationId: 'dest-id-a' }],
        executionPolicy: {
          transactionGranularity: 'PER_DESTINATION',
          failurePolicy: 'CONTINUE_AFTER_FAILURE',
          replayPolicy: 'IDEMPOTENT_REPLAY',
          stalePlanPolicy: 'STRICT_PRECONDITION_MATCH',
          readBackVerification: true,
        },
        status: 'APPROVED',
        destinationPlans: [{ destinationIdentity: { destinationKey: 'dest-a', destinationId: 'dest-id-a' }, action: 'UNCHANGED', scalarOperations: [], childOperations: [], warnings: [], errors: [] }],
        contractSchemaVersion: 'v3.1',
        normalizationVersion: 'v1',
        diffPolicyVersion: 'v1',
        operationManifestHash: 'manifest-hash',
        workbookHash: 'workbook-hash',
      });
      console.log(JSON.stringify(envelope));
    `;

    try {
      writeFileSync(scriptPath, script, "utf8");
      const first = spawnSync("npx", ["vite-node", "--script", scriptPath], { cwd: process.cwd(), encoding: "utf8" });
      const second = spawnSync("npx", ["vite-node", "--script", scriptPath], { cwd: process.cwd(), encoding: "utf8" });

      expect(first.status).toBe(0);
      expect(second.status).toBe(0);
      expect(first.stdout).toBe(second.stdout);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
