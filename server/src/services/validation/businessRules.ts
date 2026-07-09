import { CRM_STATUS_VALUES, DATA_SOURCE_VALUES } from "../../../../shared/enums";
import { CrmRecord, LlmSingleRecord, SkippedRecord } from "../../../../shared/schema";
import { RawRow } from "../../types";
import { normalizeDate } from "../../utils/dateNormalizer";

export interface RuleResult {
  imported: CrmRecord[];
  skipped: SkippedRecord[];
}

export function applyBusinessRules(
  llmRecords: LlmSingleRecord[],
  rawRows: RawRow[],
  batchStartIndex: number
): RuleResult {
  const imported: CrmRecord[] = [];
  const skipped: SkippedRecord[] = [];

  llmRecords.forEach((record, i) => {
    const rowNumber = batchStartIndex + i + 1;
    const rawData = rawRows[i] ?? {};

    // LLM already flagged this record as skipped
    if (record.skipped) {
      skipped.push({
        row: rowNumber,
        reason: record.skip_reason ?? "Skipped by AI extraction",
        rawData,
      });
      return;
    }

    const email = normalizeStringOrNull(record.email);
    const mobile = normalizeStringOrNull(record.mobile_without_country_code);

    // Hard skip rule: must have at least one contact field
    if (!email && !mobile) {
      skipped.push({
        row: rowNumber,
        reason: "missing email and mobile",
        rawData,
      });
      return;
    }

    // Enforce enum whitelists
    const crmStatus = CRM_STATUS_VALUES.includes(record.crm_status as never)
      ? (record.crm_status as CrmRecord["crm_status"])
      : "";

    const dataSource = DATA_SOURCE_VALUES.includes(record.data_source as never)
      ? (record.data_source as CrmRecord["data_source"])
      : "";

    // Normalize date, append note if invalid
    let createdAt = normalizeStringOrNull(record.created_at);
    let crmNote = normalizeStringOrNull(record.crm_note);

    if (record.created_at && !isValidDate(record.created_at)) {
      const normalized = normalizeDate(record.created_at);
      if (normalized) {
        createdAt = normalized;
      } else {
        createdAt = null;
        const dateNote = `original_date: ${record.created_at}`;
        crmNote = crmNote ? `${crmNote}; ${dateNote}` : dateNote;
      }
    }

    imported.push({
      created_at: createdAt,
      name: normalizeStringOrNull(record.name),
      email,
      country_code: normalizeStringOrNull(record.country_code),
      mobile_without_country_code: mobile,
      company: normalizeStringOrNull(record.company),
      city: normalizeStringOrNull(record.city),
      state: normalizeStringOrNull(record.state),
      country: normalizeStringOrNull(record.country),
      lead_owner: normalizeStringOrNull(record.lead_owner),
      crm_status: crmStatus,
      crm_note: crmNote,
      data_source: dataSource,
      possession_time: normalizeStringOrNull(record.possession_time),
      description: normalizeStringOrNull(record.description),
    });
  });

  return { imported, skipped };
}

function normalizeStringOrNull(value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const trimmed = value.trim();
  if (
    trimmed === "" ||
    trimmed.toLowerCase() === "n/a" ||
    trimmed === "-" ||
    trimmed.toLowerCase() === "null" ||
    trimmed.toLowerCase() === "none"
  ) {
    return null;
  }
  return trimmed;
}

function isValidDate(value: string): boolean {
  return !isNaN(new Date(value).getTime());
}
