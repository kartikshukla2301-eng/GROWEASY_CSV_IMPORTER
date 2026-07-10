import { LlmBatchResponse } from "../../../../shared/schema";
import { RawRow } from "../../types";
import { AiProvider } from "./aiProvider";
import { buildExtractionPrompt } from "./prompt";
import { parseAndValidateLlmResponse } from "../validation/responseValidator";

export class OpenRouterProvider implements AiProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey;
    this.model = model;
  }

  async extractBatch(
    rows: RawRow[],
    headers: string[],
    batchIndex: number,
    totalBatches: number
  ): Promise<LlmBatchResponse> {
    const prompt = buildExtractionPrompt(rows, headers, batchIndex, totalBatches);

    try {
      return await this.makeRequest(prompt);
    } catch (error: any) {
      // Allow ProviderManager to handle retry by throwing
      if (!this.isNonRetryableError(error)) {
        // We could also do our own internal single-retry with a fallback prompt
        const retryPrompt = buildExtractionPrompt(rows, headers, batchIndex, totalBatches, true);
        return await this.makeRequest(retryPrompt);
      }
      throw error;
    }
  }

  private async makeRequest(prompt: string): Promise<LlmBatchResponse> {
    const max_tokens = Number(process.env.OPENROUTER_MAX_TOKENS ?? 2048);
    
    // Temporarily log request details as requested
    console.info(`[OpenRouter] Request Payload:`, JSON.stringify({
      model: this.model,
      max_tokens,
      temperature: 0.1 // Using a standard low temperature for data extraction
    }, null, 2));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn(`[OpenRouter] Timeout reached (60s) for model: ${this.model}. Aborting request.`);
      controller.abort();
    }, 60000);

    console.info(`[OpenRouter] Sending fetch request to completions API for model: ${this.model}...`);

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          max_tokens,
          temperature: 0.1
        }),
        signal: controller.signal
      });

      console.info(`[OpenRouter] Fetch completed. HTTP status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[OpenRouter] HTTP error response text:`, errorText);
        const error = new Error(`OpenRouter HTTP error! status: ${response.status}, message: ${errorText}`);
        (error as any).status = response.status;
        throw error;
      }

      console.info(`[OpenRouter] Reading response body as text...`);
      const rawResponseBody = await response.text();
      console.info(`[OpenRouter] Raw Response Body:`, rawResponseBody);

      console.info(`[OpenRouter] Parsing JSON response...`);
      const data = JSON.parse(rawResponseBody) as any;
      const text = data.choices?.[0]?.message?.content ?? "";
      
      console.info(`[OpenRouter] Parsing and validating extracted content...`);
      const parsed = parseAndValidateLlmResponse(text);

      if (parsed.success) {
        console.info(`[OpenRouter] Successfully extracted and validated batch response.`);
        return parsed.data;
      }

      console.error(`[OpenRouter] Schema validation failed. Error details:`, parsed.error);
      const validationError = new Error(`OpenRouter response validation failed: ${parsed.error}`);
      (validationError as any).status = 500; // Treat as retryable server error
      throw validationError;
    } catch (err: any) {
      if (err.name === "AbortError" || (err instanceof Error && err.message.includes("aborted"))) {
        console.error(`[OpenRouter] AbortError triggered. Model: ${this.model}`);
        throw new Error(`OpenRouter request timed out: The request to the model "${this.model}" did not respond within 60 seconds.`);
      }
      console.error(`[OpenRouter] Request failed with error:`, err.message);
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }
  
  private isNonRetryableError(error: any): boolean {
    const status = error.status;
    if (typeof status === "number") {
      // 400 Bad Request, 401 Unauthorized, 403 Forbidden
      if ([400, 401, 403].includes(status)) {
        return true;
      }
    }
    return false;
  }
}
