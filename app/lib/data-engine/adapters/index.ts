import type { ImportAdapter } from "../types";
import { numbeoAdapter } from "./numbeoAdapter";
import { openMeteoAdapter } from "./openMeteoAdapter";

export const ENGINE_IMPORT_ADAPTERS: ImportAdapter[] = [openMeteoAdapter, numbeoAdapter];

export function getAdapter(sourceKey: string): ImportAdapter | null {
  return ENGINE_IMPORT_ADAPTERS.find((adapter) => adapter.sourceKey === sourceKey) ?? null;
}
