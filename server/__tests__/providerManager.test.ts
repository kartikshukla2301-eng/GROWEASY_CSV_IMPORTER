import { ProviderManager } from "../src/services/ai/providerManager";
import { AiProvider } from "../src/services/ai/aiProvider";
import { LlmBatchResponse } from "../../shared/schema";

const mockResponse: LlmBatchResponse = {
  records: [],
};

describe("ProviderManager", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(console, "info").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it("should fail initialization with no providers", () => {
    expect(() => new ProviderManager([])).toThrow("ProviderManager initialized with no available providers.");
  });

  it("should attempt providers in the order they were provided", async () => {
    const provider1 = { extractBatch: jest.fn().mockResolvedValue(mockResponse) } as unknown as AiProvider;
    const provider2 = { extractBatch: jest.fn().mockResolvedValue(mockResponse) } as unknown as AiProvider;

    const manager = new ProviderManager([
      { name: "Gemini", provider: provider1 },
      { name: "OpenAI", provider: provider2 },
    ]);

    const result = await manager.extractBatch([], [], 0, 1);

    expect(result).toBe(mockResponse);
    expect(provider1.extractBatch).toHaveBeenCalledTimes(1);
    expect(provider2.extractBatch).not.toHaveBeenCalled();
  });

  it("should fallback to the next provider on a retryable error", async () => {
    const provider1 = {
      extractBatch: jest.fn().mockRejectedValue(new Error("validation failed")),
    } as unknown as AiProvider;
    const provider2 = { extractBatch: jest.fn().mockResolvedValue(mockResponse) } as unknown as AiProvider;

    const manager = new ProviderManager([
      { name: "Gemini", provider: provider1 },
      { name: "OpenAI", provider: provider2 },
    ]);

    const result = await manager.extractBatch([], [], 0, 1);

    expect(result).toBe(mockResponse);
    expect(provider1.extractBatch).toHaveBeenCalledTimes(1);
    expect(provider2.extractBatch).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("[ProviderManager] Provider failed (Gemini): Retryable error."),
      "validation failed"
    );
  });

  it("should fail immediately on a non-retryable auth error (401)", async () => {
    const error401 = new Error("Unauthorized");
    (error401 as any).status = 401;

    const provider1 = {
      extractBatch: jest.fn().mockRejectedValue(error401),
    } as unknown as AiProvider;
    const provider2 = { extractBatch: jest.fn().mockResolvedValue(mockResponse) } as unknown as AiProvider;

    const manager = new ProviderManager([
      { name: "Gemini", provider: provider1 },
      { name: "OpenAI", provider: provider2 },
    ]);

    await expect(manager.extractBatch([], [], 0, 1)).rejects.toThrow("Unauthorized");
    
    expect(provider1.extractBatch).toHaveBeenCalledTimes(1);
    expect(provider2.extractBatch).not.toHaveBeenCalled(); // Should not fallback!
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("[ProviderManager] Provider failed (Gemini): Non-retryable error"),
      "Unauthorized"
    );
  });

  it("should fail immediately on a non-retryable string-based error (invalid api key)", async () => {
    const errorInvalidKey = new Error("API key not valid. Please pass a valid API key.");

    const provider1 = {
      extractBatch: jest.fn().mockRejectedValue(errorInvalidKey),
    } as unknown as AiProvider;
    const provider2 = { extractBatch: jest.fn().mockResolvedValue(mockResponse) } as unknown as AiProvider;

    const manager = new ProviderManager([
      { name: "Gemini", provider: provider1 },
      { name: "OpenAI", provider: provider2 },
    ]);

    await expect(manager.extractBatch([], [], 0, 1)).rejects.toThrow("API key not valid");
    
    expect(provider1.extractBatch).toHaveBeenCalledTimes(1);
    expect(provider2.extractBatch).not.toHaveBeenCalled();
  });

  it("should mark a provider unhealthy after 3 consecutive retryable failures and cooldown", async () => {
    let attempt = 0;
    const provider1 = {
      extractBatch: jest.fn().mockImplementation(() => {
        attempt++;
        if (attempt <= 4) throw new Error("timeout");
        return Promise.resolve(mockResponse); // Will recover eventually
      }),
    } as unknown as AiProvider;

    const provider2 = { extractBatch: jest.fn().mockResolvedValue(mockResponse) } as unknown as AiProvider;

    const manager = new ProviderManager([
      { name: "Gemini", provider: provider1 },
      { name: "OpenAI", provider: provider2 },
    ]);

    // 1st request -> Gemini fails (1), fallback to OpenAI (success)
    await manager.extractBatch([], [], 0, 1);
    expect(provider1.extractBatch).toHaveBeenCalledTimes(1);
    expect(provider2.extractBatch).toHaveBeenCalledTimes(1);

    // 2nd request -> Gemini fails (2), fallback to OpenAI (success)
    await manager.extractBatch([], [], 0, 1);
    expect(provider1.extractBatch).toHaveBeenCalledTimes(2);
    expect(provider2.extractBatch).toHaveBeenCalledTimes(2);

    // 3rd request -> Gemini fails (3), marked unhealthy! fallback to OpenAI
    await manager.extractBatch([], [], 0, 1);
    expect(provider1.extractBatch).toHaveBeenCalledTimes(3);
    expect(provider2.extractBatch).toHaveBeenCalledTimes(3);

    // 4th request -> Gemini is skipped due to cooldown, goes straight to OpenAI
    await manager.extractBatch([], [], 0, 1);
    // Gemini calls remain 3, OpenAI becomes 4
    expect(provider1.extractBatch).toHaveBeenCalledTimes(3);
    expect(provider2.extractBatch).toHaveBeenCalledTimes(4);

    // Fast-forward time past the 60s cooldown
    jest.advanceTimersByTime(60 * 1000 + 100);

    // 5th request -> Gemini cooldown expired, tried again. It fails (4), fallback to OpenAI
    await manager.extractBatch([], [], 0, 1);
    expect(provider1.extractBatch).toHaveBeenCalledTimes(4);
    expect(provider2.extractBatch).toHaveBeenCalledTimes(5);
  });
});
