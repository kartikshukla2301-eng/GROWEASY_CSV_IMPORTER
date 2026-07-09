import { normalizeDate } from "../src/utils/dateNormalizer";

describe("dateNormalizer.normalizeDate", () => {
  it("accepts and normalizes an ISO 8601 date string", () => {
    const result = normalizeDate("2024-01-15T10:30:00Z");
    expect(result).not.toBeNull();
    expect(new Date(result!).getFullYear()).toBe(2024);
  });

  it("accepts a plain YYYY-MM-DD date", () => {
    const result = normalizeDate("2024-06-01");
    expect(result).not.toBeNull();
    expect(result).toContain("2024");
  });

  it("normalizes DD/MM/YYYY format to ISO 8601", () => {
    const result = normalizeDate("15/01/2024");
    expect(result).not.toBeNull();
    expect(result).toContain("2024-01-15");
  });

  it("normalizes DD-MM-YYYY format to ISO 8601", () => {
    const result = normalizeDate("15-01-2024");
    expect(result).not.toBeNull();
    expect(result).toContain("2024-01-15");
  });

  it("returns null for an empty string", () => {
    expect(normalizeDate("")).toBeNull();
  });

  it("returns null for nil literals", () => {
    expect(normalizeDate("N/A")).toBeNull();
    expect(normalizeDate("-")).toBeNull();
    expect(normalizeDate("null")).toBeNull();
    expect(normalizeDate("none")).toBeNull();
  });

  it("returns null for a completely invalid date string", () => {
    expect(normalizeDate("not-a-date")).toBeNull();
  });

  it("returns null for undefined input", () => {
    expect(normalizeDate(undefined)).toBeNull();
  });

  it("returns null for null input", () => {
    expect(normalizeDate(null)).toBeNull();
  });
});
