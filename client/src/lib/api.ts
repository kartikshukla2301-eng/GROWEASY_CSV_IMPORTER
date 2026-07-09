import { ImportResponse } from "../types";
import { ImportProgress } from "../types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

// Calls POST /api/csv/import with SSE streaming for batch progress.
// Invokes onProgress for each progress event and resolves with the final result.
export async function importCsv(
  file: File,
  onProgress: (progress: ImportProgress) => void
): Promise<ImportResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/api/csv/import`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: { message: "Request failed" } }));
    const message = body?.error?.message ?? `HTTP ${response.status}`;
    throw new Error(message);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("Response body is not readable.");

  const decoder = new TextDecoder();
  let buffer = "";
  let result: ImportResponse | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // SSE messages are separated by double newlines
    const messages = buffer.split("\n\n");
    buffer = messages.pop() ?? "";

    for (const message of messages) {
      const lines = message.trim().split("\n");
      let eventType = "message";
      let data = "";

      for (const line of lines) {
        if (line.startsWith("event: ")) {
          eventType = line.slice(7).trim();
        } else if (line.startsWith("data: ")) {
          data = line.slice(6).trim();
        }
      }

      if (!data) continue;

      try {
        const parsed = JSON.parse(data);
        if (eventType === "progress") {
          onProgress(parsed as ImportProgress);
        } else if (eventType === "result") {
          result = parsed as ImportResponse;
        }
      } catch {
        // Malformed SSE data — skip silently
      }
    }
  }

  if (!result) {
    throw new Error("Import completed but no result was received from the server.");
  }

  return result;
}
