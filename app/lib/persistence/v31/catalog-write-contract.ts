import type { DeterministicV31CanonicalDestination } from "../../workbook-v31-deterministic-core";
import { buildDestinationPlanWriteStatements, checkExecutionGates } from "./write-port";
import type {
  ExecutionGateCheckInput,
  SqlExecutionClient,
  SqlStatement,
  WritePlanResult,
} from "./write-port";
import type { CanonicalDestinationKey, DestinationId, ResolvedDestinationIdentity } from "./types";

export interface CatalogRootWriteValues {
  readonly destinationKey: CanonicalDestinationKey;
  readonly beachAccess: string | null;
  readonly mountainOrSkiAccess: string | null;
  readonly countryCode: string | null;
}

export interface UpdateExistingCatalogOperation extends CatalogRootWriteValues {
  readonly kind: "UPDATE_EXISTING_CATALOG";
  readonly destinationId: DestinationId;
  readonly currentDestinationKey: string | null;
}

export interface CreateCatalogOperation extends CatalogRootWriteValues {
  readonly kind: "CREATE_CATALOG";
  readonly destinationId: DestinationId;
  readonly slug: string;
  readonly city: string;
  readonly country: string;
  readonly tier: string;
}

export type CatalogWriteOperation = UpdateExistingCatalogOperation | CreateCatalogOperation;

export type CatalogWritePlanningInput =
  | {
      readonly kind: "EXISTING";
      readonly resolvedDestinationIdentity: ResolvedDestinationIdentity;
      readonly canonicalDestination: DeterministicV31CanonicalDestination;
      readonly current: {
        readonly destinationKey: string | null;
        readonly beachAccess: string | null;
        readonly mountainOrSkiAccess: string | null;
        readonly countryCode: string | null;
      };
    }
  | {
      readonly kind: "CREATE";
      readonly resolvedDestinationIdentity: ResolvedDestinationIdentity;
      readonly canonicalDestination: DeterministicV31CanonicalDestination;
      readonly bootstrap: {
        readonly slug: string;
        readonly city: string;
        readonly country: string;
        readonly tier?: string;
      };
    };

interface CheckedSqlStatement extends SqlStatement {
  readonly expectedRowCount: number;
  readonly rowCountFailureCode: string;
}

const OPERATION_KEYS: Readonly<Record<CatalogWriteOperation["kind"], readonly string[]>> = {
  UPDATE_EXISTING_CATALOG: [
    "beachAccess", "countryCode", "currentDestinationKey", "destinationId",
    "destinationKey", "kind", "mountainOrSkiAccess",
  ],
  CREATE_CATALOG: [
    "beachAccess", "city", "country", "countryCode", "destinationId",
    "destinationKey", "kind", "mountainOrSkiAccess", "slug", "tier",
  ],
};

function rootValues(canonicalDestination: DeterministicV31CanonicalDestination): CatalogRootWriteValues {
  return {
    destinationKey: canonicalDestination.identity.destinationKey as CanonicalDestinationKey,
    beachAccess: canonicalDestination.destinationRow?.beach_access ?? null,
    mountainOrSkiAccess: canonicalDestination.destinationRow?.mountain_or_ski_access ?? null,
    countryCode: canonicalDestination.destinationRow?.country_code ?? null,
  };
}

export function planCatalogWriteOperation(input: CatalogWritePlanningInput): CatalogWriteOperation | null {
  const values = rootValues(input.canonicalDestination);
  if (values.destinationKey !== input.resolvedDestinationIdentity.destinationKey) {
    throw new Error("CATALOG_OPERATION_IDENTITY_MISMATCH");
  }

  if (input.kind === "CREATE") {
    return {
      kind: "CREATE_CATALOG",
      destinationId: input.resolvedDestinationIdentity.destinationId,
      ...values,
      slug: input.bootstrap.slug,
      city: input.bootstrap.city,
      country: input.bootstrap.country,
      tier: input.bootstrap.tier ?? "launch",
    };
  }

  if (
    input.current.destinationKey === values.destinationKey
    && input.current.beachAccess === values.beachAccess
    && input.current.mountainOrSkiAccess === values.mountainOrSkiAccess
    && input.current.countryCode === values.countryCode
  ) {
    return null;
  }

  return {
    kind: "UPDATE_EXISTING_CATALOG",
    destinationId: input.resolvedDestinationIdentity.destinationId,
    currentDestinationKey: input.current.destinationKey,
    ...values,
  };
}

function assertOperationShape(operation: CatalogWriteOperation): void {
  const expected = [...OPERATION_KEYS[operation.kind]].sort();
  const actual = Object.keys(operation).sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    const unknown = actual.filter((key) => !expected.includes(key));
    throw new Error(`CATALOG_OPERATION_UNKNOWN_FIELDS:${unknown.join(",")}`);
  }
}

export function buildCatalogWriteStatements(operation: CatalogWriteOperation): readonly CheckedSqlStatement[] {
  assertOperationShape(operation);

  if (operation.kind === "UPDATE_EXISTING_CATALOG") {
    return [
      {
        text: "select id from public.destinations_catalog where destination_key = $1 and id <> $2",
        values: [operation.destinationKey, operation.destinationId],
        expectedRowCount: 0,
        rowCountFailureCode: "CATALOG_DESTINATION_KEY_COLLISION",
      },
      {
        text: "update public.destinations_catalog set destination_key = $1, beach_access = $2, mountain_or_ski_access = $3, country_code = $4 where id = $5 and destination_key is not distinct from $6 returning id",
        values: [operation.destinationKey, operation.beachAccess, operation.mountainOrSkiAccess, operation.countryCode, operation.destinationId, operation.currentDestinationKey],
        expectedRowCount: 1,
        rowCountFailureCode: "CATALOG_UPDATE_ROW_COUNT_MISMATCH",
      },
    ];
  }

  return [
    {
      text: "select id from public.destinations_catalog where slug = $1 or destination_key = $2",
      values: [operation.slug, operation.destinationKey],
      expectedRowCount: 0,
      rowCountFailureCode: "CATALOG_IDENTITY_COLLISION",
    },
    {
      text: "insert into public.destinations_catalog (id, slug, city, country, destination_key, tier, status, beach_access, mountain_or_ski_access, country_code) values ($1, $2, $3, $4, $5, $6, 'draft', $7, $8, $9) returning id",
      values: [operation.destinationId, operation.slug, operation.city, operation.country, operation.destinationKey, operation.tier, operation.beachAccess, operation.mountainOrSkiAccess, operation.countryCode],
      expectedRowCount: 1,
      rowCountFailureCode: "CATALOG_CREATE_ROW_COUNT_MISMATCH",
    },
  ];
}

export interface CatalogWriteExecutionInput {
  readonly gateInput: ExecutionGateCheckInput;
  readonly catalogOperation: CatalogWriteOperation | null;
}

export async function executeApprovedDestinationPlanWithCatalogWrite(
  client: SqlExecutionClient,
  input: CatalogWriteExecutionInput,
): Promise<WritePlanResult> {
  const gateResult = checkExecutionGates(input.gateInput);
  if (!gateResult.ok) {
    return { outcome: "GATE_REJECTED", statementsExecuted: 0, gateFailure: gateResult };
  }

  let catalogStatements: readonly CheckedSqlStatement[] = [];
  let premiumStatements: readonly SqlStatement[];
  try {
    if (input.catalogOperation) {
      const identity = input.gateInput.plan.destinationIdentity;
      if (
        input.catalogOperation.destinationId !== identity.destinationId
        || input.catalogOperation.destinationKey !== identity.destinationKey
      ) {
        throw new Error("CATALOG_OPERATION_IDENTITY_MISMATCH");
      }
      catalogStatements = buildCatalogWriteStatements(input.catalogOperation);
    }
    premiumStatements = buildDestinationPlanWriteStatements(input.gateInput.plan);
  } catch (error) {
    return { outcome: "FAILED", statementsExecuted: 0, error: error instanceof Error ? error.message : String(error) };
  }

  if (catalogStatements.length === 0 && premiumStatements.length === 0) {
    return { outcome: "NO_OP", statementsExecuted: 0 };
  }

  await client.query("BEGIN");
  try {
    for (const statement of catalogStatements) {
      const result = await client.query(statement.text, statement.values);
      if (result.rowCount !== statement.expectedRowCount) {
        throw new Error(`${statement.rowCountFailureCode}: expected ${statement.expectedRowCount}, received ${result.rowCount}`);
      }
    }
    for (const statement of premiumStatements) {
      await client.query(statement.text, statement.values);
    }
    await client.query("COMMIT");
    return { outcome: "SUCCESS", statementsExecuted: catalogStatements.length + premiumStatements.length };
  } catch (error) {
    await client.query("ROLLBACK");
    return { outcome: "FAILED", statementsExecuted: 0, error: error instanceof Error ? error.message : String(error) };
  }
}
