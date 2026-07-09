import { parseAndValidateLlmResponse } from "../src/services/validation/responseValidator";

const validRecord = {
  created_at: "2024-01-15T00:00:00.000Z",
  name: "John Doe",
  email: "john@example.com",
  country_code: "91",
  mobile_without_country_code: "9876543210",
  company: "Acme Corp",
  city: "Bangalore",
  state: "Karnataka",
  country: "India",
  lead_owner: "Ravi Kumar",
  crm_status: "",
  crm_note: null,
  data_source: "",
  possession_time: null,
  description: null,
  skipped: false,
  skip_reason: null,
};

describe("responseValidator.parseAndValidateLlmResponse", () => {
  it("accepts a valid LLM response JSON string", () => {
    const json = JSON.stringify({ records: [validRecord] });
    const result = parseAndValidateLlmResponse(json);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.records).toHaveLength(1);
    }
  });

  it("accepts an empty records array", () => {
    const json = JSON.stringify({ records: [] });
    const result = parseAndValidateLlmResponse(json);
    expect(result.success).toBe(true);
  });

  it("strips markdown code fences before parsing", () => {
    const json = "```json\n" + JSON.stringify({ records: [validRecord] }) + "\n```";
    const result = parseAndValidateLlmResponse(json);
    expect(result.success).toBe(true);
  });

  it("returns failure for malformed JSON", () => {
    const result = parseAndValidateLlmResponse("not valid json {");
    expect(result.success).toBe(false);
    expect((result as { success: false; error: string }).error).toContain("JSON.parse failed");
  });

  it("returns failure when records field is missing", () => {
    const json = JSON.stringify({ data: [] });
    const result = parseAndValidateLlmResponse(json);
    expect(result.success).toBe(false);
  });

  it("returns failure when records is not an array", () => {
    const json = JSON.stringify({ records: "not an array" });
    const result = parseAndValidateLlmResponse(json);
    expect(result.success).toBe(false);
  });

  it("returns failure when a record is missing the required skipped field", () => {
    const badRecord = { ...validRecord };
    // @ts-expect-error intentional invalid data
    delete badRecord.skipped;
    const json = JSON.stringify({ records: [badRecord] });
    const result = parseAndValidateLlmResponse(json);
    expect(result.success).toBe(false);
  });

  it("accepts records with all null optional fields", () => {
    const minimalRecord = {
      ...validRecord,
      created_at: null,
      name: null,
      email: null,
      country_code: null,
      mobile_without_country_code: null,
      company: null,
      city: null,
      state: null,
      country: null,
      lead_owner: null,
      crm_note: null,
      possession_time: null,
      description: null,
    };
    const json = JSON.stringify({ records: [minimalRecord] });
    const result = parseAndValidateLlmResponse(json);
    expect(result.success).toBe(true);
  });
});
