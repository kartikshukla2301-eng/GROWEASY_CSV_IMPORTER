import { applyBusinessRules } from "../src/services/validation/businessRules";
import { LlmSingleRecord } from "../../shared/schema";

function makeRecord(overrides: Partial<LlmSingleRecord> = {}): LlmSingleRecord {
  return {
    created_at: null,
    name: "Test Lead",
    email: "test@example.com",
    country_code: "91",
    mobile_without_country_code: "9876543210",
    company: null,
    city: null,
    state: null,
    country: null,
    lead_owner: null,
    crm_status: "",
    crm_note: null,
    data_source: "",
    possession_time: null,
    description: null,
    skipped: false,
    skip_reason: null,
    ...overrides,
  };
}

const rawRows = [{ Name: "Test Lead", Email: "test@example.com" }];

describe("businessRules.applyBusinessRules", () => {
  it("imports a valid record with email and mobile", () => {
    const records = [makeRecord()];
    const result = applyBusinessRules(records, rawRows, 0);
    expect(result.imported).toHaveLength(1);
    expect(result.skipped).toHaveLength(0);
    expect(result.imported[0].email).toBe("test@example.com");
  });

  it("skips records with neither email nor mobile", () => {
    const records = [makeRecord({ email: null, mobile_without_country_code: null })];
    const result = applyBusinessRules(records, rawRows, 0);
    expect(result.imported).toHaveLength(0);
    expect(result.skipped).toHaveLength(1);
    expect(result.skipped[0].reason).toBe("missing email and mobile");
  });

  it("imports a record with only email and no mobile", () => {
    const records = [makeRecord({ mobile_without_country_code: null })];
    const result = applyBusinessRules(records, rawRows, 0);
    expect(result.imported).toHaveLength(1);
  });

  it("imports a record with only mobile and no email", () => {
    const records = [makeRecord({ email: null })];
    const result = applyBusinessRules(records, rawRows, 0);
    expect(result.imported).toHaveLength(1);
  });

  it("forces crm_status to empty string when value is not in whitelist", () => {
    const records = [makeRecord({ crm_status: "INTERESTED" as never })];
    const result = applyBusinessRules(records, rawRows, 0);
    expect(result.imported[0].crm_status).toBe("");
  });

  it("preserves valid crm_status values", () => {
    const records = [makeRecord({ crm_status: "GOOD_LEAD_FOLLOW_UP" })];
    const result = applyBusinessRules(records, rawRows, 0);
    expect(result.imported[0].crm_status).toBe("GOOD_LEAD_FOLLOW_UP");
  });

  it("forces data_source to empty string when value is not in whitelist", () => {
    const records = [makeRecord({ data_source: "facebook_ads" as never })];
    const result = applyBusinessRules(records, rawRows, 0);
    expect(result.imported[0].data_source).toBe("");
  });

  it("preserves valid data_source values", () => {
    const records = [makeRecord({ data_source: "leads_on_demand" })];
    const result = applyBusinessRules(records, rawRows, 0);
    expect(result.imported[0].data_source).toBe("leads_on_demand");
  });

  it("respects the LLM skipped flag and skip_reason", () => {
    const records = [makeRecord({ skipped: true, skip_reason: "Test reason" })];
    const result = applyBusinessRules(records, rawRows, 0);
    expect(result.skipped).toHaveLength(1);
    expect(result.skipped[0].reason).toBe("Test reason");
  });

  it("normalizes N/A email to null and skips record without contact", () => {
    const records = [
      makeRecord({ email: "N/A", mobile_without_country_code: "-" }),
    ];
    const result = applyBusinessRules(records, rawRows, 0);
    expect(result.skipped).toHaveLength(1);
    expect(result.skipped[0].reason).toBe("missing email and mobile");
  });

  it("handles an invalid created_at by appending original value to crm_note", () => {
    const records = [makeRecord({ created_at: "not-a-date", crm_note: null })];
    const result = applyBusinessRules(records, rawRows, 0);
    expect(result.imported[0].created_at).toBeNull();
    expect(result.imported[0].crm_note).toContain("not-a-date");
  });

  it("assigns correct row numbers relative to batch start index", () => {
    const records = [makeRecord({ email: null, mobile_without_country_code: null })];
    const result = applyBusinessRules(records, rawRows, 49);
    expect(result.skipped[0].row).toBe(50);
  });
});
