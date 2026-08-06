export type BatchImportSourceType = "csv" | "json" | "excel";

type XlsxLibrary = {
  read: (buffer: ArrayBuffer, options: { type: string; cellDates: boolean; cellNF: boolean }) => {
    SheetNames: string[];
    Sheets: Record<string, unknown>;
  };
  utils: {
    sheet_to_json: (sheet: unknown, options: { defval: string; raw: boolean; header?: string | number | boolean }) => Array<Record<string, unknown>> | Array<Array<unknown>>;
  };
};

declare global {
  interface Window {
    XLSX?: XlsxLibrary;
  }
}

let xlsxLibraryPromise: Promise<XlsxLibrary> | null = null;

const loadXlsxLibrary = async (): Promise<XlsxLibrary> => {
  if (typeof window === "undefined") {
    throw new Error("Workbook parsing is only available in the browser.");
  }

  if (window.XLSX) {
    return window.XLSX;
  }

  if (!xlsxLibraryPromise) {
    xlsxLibraryPromise = new Promise<XlsxLibrary>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.1/dist/xlsx.full.min.js";
      script.async = true;
      script.onload = () => {
        if (window.XLSX) {
          resolve(window.XLSX);
          return;
        }
        reject(new Error("The workbook parser failed to initialize."));
      };
      script.onerror = () => reject(new Error("Unable to load the Excel parser script."));
      document.head.appendChild(script);
    });
  }

  return xlsxLibraryPromise;
};

export type ParsedBatchImportFile = {
  rows: Array<Record<string, unknown>>;
  sourceType: BatchImportSourceType;
  workbookSheets?: string[];
  selectedSheet?: string;
  workbookRowsBySheet?: Record<string, Array<Record<string, unknown>>>;
  workbookHeadersBySheet?: Record<string, string[]>;
  selectedSheetHeaders?: string[];
};

const parseCsvText = (text: string) => {
  const rows = text
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0].split(",").map((header) => header.trim());
  return rows.slice(1).map((row) => {
    const values = row.split(",").map((value) => value.trim());
    return headers.reduce<Record<string, unknown>>((accumulator, header, index) => {
      accumulator[header] = values[index] ?? "";
      return accumulator;
    }, {});
  });
};

const parseJsonRows = (content: string) => {
  const parsed = JSON.parse(content) as unknown;
  if (Array.isArray(parsed)) {
    return parsed as Array<Record<string, unknown>>;
  }
  if (parsed && typeof parsed === "object" && Array.isArray((parsed as { rows?: unknown }).rows)) {
    return (parsed as { rows: Array<Record<string, unknown>> }).rows;
  }
  throw new Error("JSON import must be an array of objects or include a rows array.");
};

const parseWorkbookRows = async (buffer: ArrayBuffer) => {
  const xlsx = await loadXlsxLibrary();
  const workbook = xlsx.read(buffer, { type: "array", cellDates: true, cellNF: false });
  const workbookSheets = workbook.SheetNames;
  const workbookRowsBySheet = workbookSheets.reduce<Record<string, Array<Record<string, unknown>>>>((accumulator, sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    accumulator[sheetName] = xlsx.utils.sheet_to_json(sheet, { defval: "", raw: false }) as Array<Record<string, unknown>>;
    return accumulator;
  }, {});
  const workbookHeadersBySheet = workbookSheets.reduce<Record<string, string[]>>((accumulator, sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const rawHeaderRows = xlsx.utils.sheet_to_json(sheet, { defval: "", raw: false, header: 1 }) as Array<Array<unknown>> | Array<Record<string, unknown>>;
    if (Array.isArray(rawHeaderRows) && rawHeaderRows.length > 0 && Array.isArray(rawHeaderRows[0])) {
      accumulator[sheetName] = (rawHeaderRows[0] as Array<unknown>).map((header) => String(header ?? "").trim()).filter(Boolean);
      return accumulator;
    }

    const fallbackRows = workbookRowsBySheet[sheetName] ?? [];
    accumulator[sheetName] = Object.keys(fallbackRows[0] ?? {}).map((header) => String(header).trim()).filter(Boolean);
    return accumulator;
  }, {});
  const selectedSheet = workbookSheets[0] ?? "";

  return {
    rows: workbookRowsBySheet[selectedSheet] ?? [],
    workbookSheets,
    selectedSheet,
    workbookRowsBySheet,
    workbookHeadersBySheet,
    selectedSheetHeaders: workbookHeadersBySheet[selectedSheet] ?? [],
  };
};

export const parseBatchImportFile = async (file: File): Promise<ParsedBatchImportFile> => {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
    const buffer = await file.arrayBuffer();
    const workbookData = await parseWorkbookRows(buffer);
    return {
      rows: workbookData.rows,
      sourceType: "excel",
      workbookSheets: workbookData.workbookSheets,
      selectedSheet: workbookData.selectedSheet,
      workbookRowsBySheet: workbookData.workbookRowsBySheet,
      workbookHeadersBySheet: workbookData.workbookHeadersBySheet,
      selectedSheetHeaders: workbookData.selectedSheetHeaders,
    };
  }

  if (fileName.endsWith(".json")) {
    const content = await file.text();
    return {
      rows: parseJsonRows(content),
      sourceType: "json",
    };
  }

  if (fileName.endsWith(".csv")) {
    const content = await file.text();
    return {
      rows: parseCsvText(content),
      sourceType: "csv",
    };
  }

  throw new Error("Unsupported file type. Please upload a CSV, JSON, XLSX, or XLS file.");
};
