import { LlmBatchResponse } from "../../../../shared/schema";
import { RawRow } from "../../types";
import { AiProvider } from "./aiProvider";

interface ProviderState {
  name: string;
  provider: AiProvider;
  consecutiveFailures: number;
  cooldownUntil: number;
}

const MAX_CONSECUTIVE_FAILURES = 3;
const COOLDOWN_MS = 60 * 1000; // 1 minute

export class ProviderManager implements AiProvider {
  private states: ProviderState[];

  constructor(providers: { name: string; provider: AiProvider }[]) {
    if (providers.length === 0) {
      throw new Error("ProviderManager initialized with no available providers.");
    }
    this.states = providers.map((p) => ({
      name: p.name,
      provider: p.provider,
      consecutiveFailures: 0,
      cooldownUntil: 0,
    }));
  }

  async extractBatch(
    rows: RawRow[],
    headers: string[],
    batchIndex: number,
    totalBatches: number
  ): Promise<LlmBatchResponse> {
    const attemptedProviders: string[] = [];
    let lastError: unknown = null;

    for (let i = 0; i < this.states.length; i++) {
      const state = this.states[i];
      const now = Date.now();

      if (state.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
        if (now < state.cooldownUntil) {
          continue; // Still cooling down
        } else {
          // Cooldown expired, recover
          console.info(`[ProviderManager] Provider recovered: ${state.name}`);
          state.consecutiveFailures = 0;
          state.cooldownUntil = 0;
        }
      }

      attemptedProviders.push(state.name);

      if (i === 0) {
        console.info(`[ProviderManager] Provider selected: ${state.name} for batch ${batchIndex + 1}`);
      } else {
        console.warn(`[ProviderManager] Fallback initiated: Switching to ${state.name} for batch ${batchIndex + 1}`);
      }

      try {
        const response = await state.provider.extractBatch(rows, headers, batchIndex, totalBatches);
        // On success, reset failures
        if (state.consecutiveFailures > 0) {
          state.consecutiveFailures = 0;
        }
        return response;
      } catch (error: any) {
        lastError = error;
        
        const isNonRetryable = this.isNonRetryableError(error);
        
        if (isNonRetryable) {
          console.error(`[ProviderManager] Provider failed (${state.name}): Non-retryable error (e.g., Auth, Invalid Request).`, error.message);
          throw error; // Fail immediately
        }

        // Retryable error (rate limit, timeout, 5xx, validation failure)
        console.warn(`[ProviderManager] Provider failed (${state.name}): Retryable error.`, error.message);
        state.consecutiveFailures++;

        if (state.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
          state.cooldownUntil = Date.now() + COOLDOWN_MS;
          console.error(`[ProviderManager] Provider ${state.name} marked unhealthy. Cooling down for ${COOLDOWN_MS / 1000}s.`);
        }
      }
    }

    throw new Error(
      `All available AI providers failed for batch ${batchIndex + 1}. Attempted: ${attemptedProviders.join(", ")}. Last error: ${
        lastError instanceof Error ? lastError.message : String(lastError)
      }`
    );
  }

  private isNonRetryableError(error: any): boolean {
    if (!error) return false;

    // Check status properties commonly set by SDKs (OpenAI, Anthropic, fetch)
    const status = error.status ?? error.statusCode ?? error.code;
    if (typeof status === "number") {
      // 400 Bad Request, 401 Unauthorized, 403 Forbidden
      if ([400, 401, 403].includes(status)) {
        return true;
      }
    }

    // Check stringified status in message (Common in Gemini responses)
    const msg = String(error.message || "").toLowerCase();
    
    // Explicit exclusions that usually indicate invalid keys or prompts
    if (
      msg.includes("[400") ||
      msg.includes("[401") ||
      msg.includes("[403") ||
      msg.includes("unauthorized") ||
      msg.includes("invalid api key") ||
      msg.includes("api key not valid") ||
      msg.includes("permission denied")
    ) {
      return true;
    }

    return false;
  }
}
