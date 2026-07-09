import { CrmRecord, SkippedRecord } from "../../../shared/schema";

export type { CrmRecord, SkippedRecord };

export interface RawRow {
  [header: string]: string;
}

export interface ParsedCsv {
  headers: string[];
  rows: RawRow[];
  totalRows: number;
}

export interface BatchResult {
  imported: CrmRecord[];
  skipped: SkippedRecord[];
}

export interface AppError extends Error {
  statusCode: number;
  code: string;
}
