import { LlmBatchResponse, LlmBatchResponseSchema } from "../../../../shared/schema";

type ParseResult =
  | { success: true; data: LlmBatchResponse }
  | { success: false; error: string };

// Strips markdown code fences that some models include despite instructions
function stripMarkdownFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

export function parseAndValidateLlmResponse(rawText: string): ParseResult {
  const cleaned = stripMarkdownFences(rawText);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return { success: false, error: `JSON.parse failed: ${cleaned.slice(0, 200)}` };
  }

  const result = LlmBatchResponseSchema.safeParse(parsed);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const errorSummary = result.error.issues
    .slice(0, 3)
    .map((issue: { path: (string | number)[]; message: string }) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");

  return { success: false, error: `Schema validation failed: ${errorSummary}` };
}
