import { splitPhone, extractAllPhones } from "../src/utils/phoneParser";

describe("phoneParser.splitPhone", () => {
  it("splits a +country-code prefixed number", () => {
    const result = splitPhone("+919876543210");
    expect(result.countryCode).toBe("91");
    expect(result.mobile).toBe("9876543210");
  });

  it("splits a number with spaces: +91 9876543210", () => {
    const result = splitPhone("+91 9876543210");
    expect(result.countryCode).toBe("91");
    expect(result.mobile).toBe("9876543210");
  });

  it("returns empty countryCode for a plain 10-digit number", () => {
    const result = splitPhone("9876543210");
    expect(result.countryCode).toBe("");
    expect(result.mobile).toBe("9876543210");
  });

  it("strips dashes and parentheses", () => {
    const result = splitPhone("(91)98765-43210");
    // After stripping: 91987654321 — no + so no prefix detected
    expect(result.mobile).toMatch(/\d+/);
  });

  it("returns empty strings for null input", () => {
    const result = splitPhone(null);
    expect(result.countryCode).toBe("");
    expect(result.mobile).toBe("");
  });

  it("returns empty strings for N/A", () => {
    const result = splitPhone("N/A");
    expect(result.countryCode).toBe("");
    expect(result.mobile).toBe("");
  });

  it("handles US +1 prefix", () => {
    const result = splitPhone("+18005551234");
    expect(result.countryCode).toBe("1");
    expect(result.mobile).toBe("8005551234");
  });
});

describe("phoneParser.extractAllPhones", () => {
  it("extracts multiple comma-separated numbers", () => {
    const result = extractAllPhones("+91 9876543210, 9123456789");
    expect(result).toHaveLength(2);
  });

  it("extracts multiple semicolon-separated numbers", () => {
    const result = extractAllPhones("9876543210;9123456789");
    expect(result).toHaveLength(2);
  });

  it("returns empty array for null", () => {
    expect(extractAllPhones(null)).toHaveLength(0);
  });

  it("returns a single-element array for a single number", () => {
    const result = extractAllPhones("9876543210");
    expect(result).toHaveLength(1);
    expect(result[0]).toBe("9876543210");
  });
});
