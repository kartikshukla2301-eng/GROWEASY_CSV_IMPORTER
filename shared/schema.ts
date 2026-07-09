import { z } from "zod";
import { CRM_STATUS_VALUES, DATA_SOURCE_VALUES } from "./enums";

export const CrmRecordSchema = z.object({
  created_at: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  country_code: z.string().nullable().optional(),
  mobile_without_country_code: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  lead_owner: z.string().nullable().optional(),
  crm_status: z
    .union([z.enum(CRM_STATUS_VALUES), z.literal("")])
    .optional()
    .default(""),
  crm_note: z.string().nullable().optional(),
  data_source: z
    .union([z.enum(DATA_SOURCE_VALUES), z.literal("")])
    .optional()
    .default(""),
  possession_time: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

export type CrmRecord = z.infer<typeof CrmRecordSchema>;

export const LlmSingleRecordSchema = CrmRecordSchema.extend({
  skipped: z.boolean(),
  skip_reason: z.string().nullable(),
});

export type LlmSingleRecord = z.infer<typeof LlmSingleRecordSchema>;

export const LlmBatchResponseSchema = z.object({
  records: z.array(LlmSingleRecordSchema),
});

export type LlmBatchResponse = z.infer<typeof LlmBatchResponseSchema>;

export const SkippedRecordSchema = z.object({
  row: z.number(),
  reason: z.string(),
  rawData: z.record(z.string()),
});

export type SkippedRecord = z.infer<typeof SkippedRecordSchema>;

export const ImportResponseSchema = z.object({
  totalRows: z.number(),
  totalImported: z.number(),
  totalSkipped: z.number(),
  imported: z.array(CrmRecordSchema),
  skipped: z.array(SkippedRecordSchema),
});

export type ImportResponse = z.infer<typeof ImportResponseSchema>;
