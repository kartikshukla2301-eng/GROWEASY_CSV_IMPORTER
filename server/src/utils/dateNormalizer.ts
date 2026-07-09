// Attempt to parse and normalize a date string to ISO 8601.
// Returns the original string if it normalizes successfully,
// returns null if no valid date can be produced.
export function normalizeDate(value: string | null | undefined): string | null {
  if (!value || value.trim() === "" || isNilLiteral(value)) return null;

  const trimmed = value.trim();

  // Fast path: already valid
  if (isValidDate(trimmed)) return new Date(trimmed).toISOString();

  // Try common formats: DD/MM/YYYY, DD-MM-YYYY, MM/DD/YYYY
  const reordered = tryReorderDate(trimmed);
  if (reordered && isValidDate(reordered)) {
    return new Date(reordered).toISOString();
  }

  return null;
}

function isValidDate(value: string): boolean {
  const d = new Date(value);
  return !isNaN(d.getTime());
}

// Handles DD/MM/YYYY and DD-MM-YYYY by converting to YYYY-MM-DD
function tryReorderDate(value: string): string | null {
  const match = value.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  // Assume DD/MM/YYYY for ambiguous cases (most common in non-US CRM exports)
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function isNilLiteral(value: string): boolean {
  const lower = value.toLowerCase().trim();
  return lower === "n/a" || lower === "-" || lower === "null" || lower === "none" || lower === "na";
}
