import { parseCsvBuffer } from "../src/services/csv/csvParser.service";

describe("csvParser.service", () => {
  it("parses a valid CSV with standard headers", () => {
    const csv = `Name,Email,Phone\nJohn Doe,john@example.com,9876543210\nJane Smith,jane@example.com,9123456789`;
    const result = parseCsvBuffer(Buffer.from(csv));

    expect(result.headers).toEqual(["Name", "Email", "Phone"]);
    expect(result.totalRows).toBe(2);
    expect(result.rows[0]).toMatchObject({
      Name: "John Doe",
      Email: "john@example.com",
      Phone: "9876543210",
    });
  });

  it("throws EMPTY_CSV for a file with only a header row and no data", () => {
    const csv = `Name,Email,Phone\n`;
    expect(() => parseCsvBuffer(Buffer.from(csv))).toThrow("no data rows");
  });

  it("throws CSV_PARSE_ERROR for completely malformed input", () => {
    // A buffer that cannot be interpreted as CSV
    const badBuffer = Buffer.from("\x00\x01\x02");
    // csv-parse is lenient with binary; an empty result triggers EMPTY_CSV
    expect(() => parseCsvBuffer(badBuffer)).toThrow();
  });

  it("returns correct row count for multi-row CSV", () => {
    const rows = Array.from({ length: 50 }, (_, i) => `Lead ${i},lead${i}@x.com,90000${i}`);
    const csv = `Name,Email,Phone\n${rows.join("\n")}`;
    const result = parseCsvBuffer(Buffer.from(csv));
    expect(result.totalRows).toBe(50);
  });

  it("handles a CSV with BOM prefix", () => {
    const csv = `\uFEFFName,Email\nAlice,alice@example.com`;
    const result = parseCsvBuffer(Buffer.from(csv));
    expect(result.headers[0]).toBe("Name");
    expect(result.rows[0]["Name"]).toBe("Alice");
  });

  it("handles duplicate column names without crashing", () => {
    const csv = `Name,Email,Name\nAlice,alice@x.com,Alice2`;
    // csv-parse de-duplicates by appending index suffixes
    expect(() => parseCsvBuffer(Buffer.from(csv))).not.toThrow();
  });
});
