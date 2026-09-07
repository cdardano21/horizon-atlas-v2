import type { PersistedDestinationSupabaseReadClient } from "./supabase-persisted-destination-read-port";
import type { SqlExecutionClient } from "./write-port";

export function createTransactionPersistedReadClient(client: SqlExecutionClient): PersistedDestinationSupabaseReadClient {
  let queue: Promise<unknown> = Promise.resolve();
  const identifier = (value: string) => {
    if (!/^[a-z][a-z0-9_]*$/.test(value)) throw new Error("INVALID_READ_IDENTIFIER");
    return `"${value}"`;
  };
  return {
    selectRows(args) {
      const operation = queue.then(async () => {
        if (args.table !== "destinations_catalog" && !args.table.startsWith("premium_")) throw new Error("UNSUPPORTED_READ_TABLE");
        if (args.filters?.length !== 1 || args.filters[0].operator !== "eq" || args.filters[0].column !== (args.table === "destinations_catalog" ? "id" : "destination_id") || typeof args.filters[0].value !== "string") throw new Error("EXACT_DESTINATION_FILTER_REQUIRED");
        const columns = args.select.split(",").map(identifier).join(", ");
        const result = await client.query(`select to_jsonb(selected) as data from (select ${columns} from public.${identifier(args.table)} where ${identifier(args.filters[0].column)} = $1) selected`, [args.filters[0].value]);
        return result.rows.map((row) => {
          if (!row.data || typeof row.data !== "object" || Array.isArray(row.data)) throw new Error("INVALID_TRANSACTION_READ_ROW");
          return row.data as Record<string, unknown>;
        });
      });
      queue = operation.then(() => undefined, () => undefined);
      return operation;
    },
  };
}