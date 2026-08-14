type ReadFilter = {
  readonly column: string;
  readonly operator: string;
  readonly value: unknown;
};

type Transport = (path: string, options?: RequestInit) => Promise<Response>;

type PersistedDestinationReadClient = {
  readonly selectRows: (args: {
    readonly table: string;
    readonly select: string;
    readonly filters?: readonly {
      readonly column: string;
      readonly operator: string;
      readonly value: unknown;
    }[];
  }) => Promise<readonly Record<string, unknown>[]>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && Array.isArray(value) === false;
}

function encodeFilterValue(value: unknown): string {
  if (value === null) {
    return "null";
  }
  if (typeof value === "string") {
    return encodeURIComponent(value);
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  if (typeof value === "boolean") {
    return String(value);
  }
  throw new Error(`Unsupported filter value type: ${typeof value}`);
}

function buildSelectPath(table: string, select: string, filters: readonly ReadFilter[] | undefined): string {
  const queryParts = [`select=${encodeURIComponent(select)}`];

  for (const filter of filters == null ? [] : filters) {
    if (filter.operator === "eq") {
      queryParts.push(`${encodeURIComponent(filter.column)}=eq.${encodeFilterValue(filter.value)}`);
    } else {
      throw new Error(`Unsupported filter operator: ${filter.operator}`);
    }
  }

  return `/rest/v1/${table}?${queryParts.join("&")}`;
}

export function createPersistedDestinationReadClient(options: { readonly fetcher: Transport }): PersistedDestinationReadClient {
  const transport = options.fetcher;

  return {
    async selectRows(args) {
      const path = buildSelectPath(args.table, args.select, args.filters);
      const response = await transport(path, { cache: "no-store" });

      if (response.ok === false) {
        throw new Error(`Read failed: ${response.status}`);
      }

      const payload = await response.json();
      if (Array.isArray(payload) === false) {
        throw new Error("Read returned a non-array payload");
      }

      const rows: Array<Record<string, unknown>> = [];
      for (const row of payload) {
        if (isRecord(row) === false) {
          throw new Error("Read returned a non-object row");
        }
        rows.push(row);
      }

      return rows;
    },
  };
}
