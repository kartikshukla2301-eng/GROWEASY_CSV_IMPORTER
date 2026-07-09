// Sanitizes a CSV cell value before inclusion in an LLM prompt.
// The goal is prompt injection mitigation, not full sanitization.
// We strip sequences that could be interpreted as instructions to the model.
export function sanitizeCell(value: string): string {
  if (!value) return value;

  return value
    // Remove markdown-style role/instruction patterns
    .replace(/\b(system|user|assistant|human|ai):\s*/gi, "")
    // Remove potential instruction keywords at start of cell
    .replace(/^(ignore|forget|disregard|pretend|act as|you are)\b/gi, "")
    // Collapse excessive whitespace that could be used to hide injections
    .replace(/\s{4,}/g, " ")
    .trim();
}

// Sanitizes an entire row's values
export function sanitizeRow(row: Record<string, string>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  for (const [key, value] of Object.entries(row)) {
    sanitized[key] = sanitizeCell(value);
  }
  return sanitized;
}
