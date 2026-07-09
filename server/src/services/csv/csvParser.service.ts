import { parse } from "csv-parse/sync";
import { ParsedCsv, RawRow } from "../../types";
import { createAppError } from "../../middleware/errorHandler";

export function parseCsvBuffer(buffer: Buffer): ParsedCsv {
  let records: RawRow[];

  try {
    records = parse(buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
      relax_column_count: true,
      encoding: "utf8",
    }) as RawRow[];
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown parse error";
    throw createAppError(`CSV parsing failed: ${message}`, 422, "CSV_PARSE_ERROR");
  }

  if (records.length === 0) {
    throw createAppError("The uploaded CSV file contains no data rows.", 422, "EMPTY_CSV");
  }

  const headers = Object.keys(records[0]);

  // Detect duplicate headers — csv-parse appends _1, _2 suffixes; flag this explicitly
  const rawHeaders = headers.map((h) => h.replace(/_\d+$/, ""));
  const hasDuplicates = rawHeaders.length !== new Set(rawHeaders).size;
  if (hasDuplicates) {
    console.warn("CSV contains duplicate column names — they have been de-duplicated automatically.");
  }

  return { headers, rows: records, totalRows: records.length };
}
