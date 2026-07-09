import { CRM_STATUS_VALUES, DATA_SOURCE_VALUES } from "../../../../shared/enums";
import { RawRow } from "../../types";

export function buildExtractionPrompt(
  rows: RawRow[],
  headers: string[],
  batchIndex: number,
  totalBatches: number,
  isRetry = false
): string {
  const rowsJson = JSON.stringify(rows, null, 2);
  const retryPrefix = isRetry
    ? "IMPORTANT: Your previous response was not valid JSON or did not match the required schema. Return ONLY the JSON object described below, with no extra text, no markdown, no code fences.\n\n"
    : "";

  return `${retryPrefix}You are a CRM data extraction assistant. You are processing batch ${batchIndex + 1} of ${totalBatches}.

Your task is to extract and map data from the following CSV rows into the GrowEasy CRM schema.
The CSV headers are: ${headers.join(", ")}

TARGET SCHEMA (all fields optional, use null if not available):
- created_at: date/time the lead was created — output as ISO 8601 string parseable by JavaScript new Date()
- name: full name of the lead
- email: primary email address
- country_code: numeric country dialing code only (e.g. "91" for India, "1" for US), without the + symbol
- mobile_without_country_code: local phone number digits only, no country code, no formatting characters
- company: company or organization name
- city: city of the lead
- state: state or province
- country: country name
- lead_owner: assigned sales person or owner name
- crm_status: MUST be one of exactly: ${CRM_STATUS_VALUES.join(", ")} — or empty string "" if none apply
- crm_note: capture all remarks, follow-up notes, extra phone numbers, extra emails, and any info without a dedicated field
- data_source: MUST be one of exactly: ${DATA_SOURCE_VALUES.join(", ")} — or empty string "" if none apply
- possession_time: expected possession or delivery timeframe
- description: general description or purpose of the lead

COLUMN MAPPING RULES:
- Customer Name / Client / Lead Name / Full Name / Contact → name
- Phone / Mobile / Contact Number / WhatsApp / Ph No → mobile_without_country_code
- Email / Mail / Email Address / E-mail → email
- Organisation / Company / Employer / Business Name / Firm → company
- Location / Area / Address → city (infer state/country if possible)
- Owner / Assigned To / Sales Rep / Agent → lead_owner
- Status / Stage / Lead Stage / Lead Status → crm_status (map to closest allowed value, or "")
- Source / Channel / Campaign / Project / Property → data_source (map to closest allowed value, or "")
- Remarks / Comments / Notes / Follow-up → crm_note
- Use actual cell values to disambiguate ambiguous headers (e.g., if a "Name" column contains email addresses, treat it as email)

PHONE NUMBER RULES:
- If a phone includes a country code (e.g. "+91 9876543210"), split it: country_code="91", mobile_without_country_code="9876543210"
- Strip all spaces, dashes, parentheses from the mobile number
- If multiple phone numbers are in one field or across multiple columns, use the first as mobile_without_country_code; append the rest to crm_note

EMAIL RULES:
- If multiple emails exist, use the first as email; append the rest to crm_note

SKIP RULES:
- If a record has neither an email nor a mobile_without_country_code, mark it as skipped with skip_reason "missing email and mobile"

EMPTY VALUE RULES:
- Treat "N/A", "-", "null", "none", "na" as empty values (use null for the field)
- Do not invent values — leave as null if not present or not confidently inferable

FORMATTING RULES:
- Return STRICT JSON only — no markdown code fences, no prose, no explanation
- Any newlines inside field values (e.g. inside crm_note) must be escaped as \\n
- Each record in the output array corresponds to one input row in the same order

OUTPUT FORMAT:
{
  "records": [
    {
      "created_at": "string | null",
      "name": "string | null",
      "email": "string | null",
      "country_code": "string | null",
      "mobile_without_country_code": "string | null",
      "company": "string | null",
      "city": "string | null",
      "state": "string | null",
      "country": "string | null",
      "lead_owner": "string | null",
      "crm_status": "",
      "crm_note": "string | null",
      "data_source": "",
      "possession_time": "string | null",
      "description": "string | null",
      "skipped": false,
      "skip_reason": null
    }
  ]
}

INPUT ROWS:
${rowsJson}`;
}
