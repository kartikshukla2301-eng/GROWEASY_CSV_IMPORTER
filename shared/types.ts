import { CrmStatus, DataSource } from "./enums";

export interface CrmRecord {
  created_at?: string | null;
  name?: string | null;
  email?: string | null;
  country_code?: string | null;
  mobile_without_country_code?: string | null;
  company?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  lead_owner?: string | null;
  crm_status?: CrmStatus;
  crm_note?: string | null;
  data_source?: DataSource;
  possession_time?: string | null;
  description?: string | null;
}

export interface LlmSingleRecord extends CrmRecord {
  skipped: boolean;
  skip_reason: string | null;
}

export interface LlmBatchResponse {
  records: LlmSingleRecord[];
}

export interface SkippedRecord {
  row: number;
  reason: string;
  rawData: Record<string, string>;
}

export interface ImportResponse {
  totalRows: number;
  totalImported: number;
  totalSkipped: number;
  imported: CrmRecord[];
  skipped: SkippedRecord[];
}
