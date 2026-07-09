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
    console.log(JSON.stringify({
      model: this.model,
      max_tokens,
      temperature: 0.1 // Using a standard low temperature for data extraction
    }, null, 2));

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
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      const error = new Error(`OpenRouter HTTP error! status: ${response.status}, message: ${errorText}`);
      (error as any).status = response.status;
      throw error;
    }

    const data = (await response.json()) as any;
    const text = data.choices?.[0]?.message?.content ?? "";
    const parsed = parseAndValidateLlmResponse(text);

    if (parsed.success) return parsed.data;

    const validationError = new Error(`OpenRouter response validation failed: ${parsed.error}`);
    (validationError as any).status = 500; // Treat as retryable server error
    throw validationError;
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
