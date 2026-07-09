import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

function getEnvInt(key: string, defaultValue: number): number {
  const raw = process.env[key];
  if (!raw) return defaultValue;
  const parsed = parseInt(raw, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

function getEnvString(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

export const config = {
  port: getEnvInt("PORT", 4000),
  corsOrigin: getEnvString("CORS_ORIGIN", "http://localhost:3000"),
  maxUploadSizeMb: getEnvInt("MAX_UPLOAD_SIZE_MB", 5),
  batchSize: getEnvInt("BATCH_SIZE", 25),
  batchConcurrency: getEnvInt("BATCH_CONCURRENCY", 3),
  openRouterApiKey: getEnvString("OPENROUTER_API_KEY", ""),
  openRouterModel: getEnvString("OPENROUTER_MODEL", ""),
  openRouterModels: getEnvString("OPENROUTER_MODELS", ""),
  openRouterMaxTokens: getEnvInt("OPENROUTER_MAX_TOKENS", 2048),
} as const;

export function validateProviderConfig(): void {
  if (!config.openRouterApiKey.trim()) {
    throw new Error("OPENROUTER_API_KEY is not set. Please provide it in the .env file.");
  }
  
  const hasModel = config.openRouterModel.trim().length > 0;
  const hasModels = config.openRouterModels.trim().length > 0;
  
  if (!hasModel && !hasModels) {
    throw new Error("Either OPENROUTER_MODEL or OPENROUTER_MODELS must be set in the .env file.");
  }
}
