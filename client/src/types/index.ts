import { CrmRecord, SkippedRecord, ImportResponse } from "groweasy-shared";

export type { CrmRecord, SkippedRecord, ImportResponse };

export type ImportStep = "upload" | "preview" | "processing" | "result";

export interface ParsedFile {
  file: File;
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
}

export interface ImportProgress {
  batchIndex: number;
  totalBatches: number;
}

export interface ApiError {
  code: string;
  message: string;
}
