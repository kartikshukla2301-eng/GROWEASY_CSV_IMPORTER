import { config } from "../../config/env";
import { AiProvider } from "./aiProvider";
import { OpenRouterProvider } from "./openrouter.provider";
import { ProviderManager } from "./providerManager";

let providerInstance: AiProvider | null = null;

export function getAiProvider(): AiProvider {
  if (providerInstance) return providerInstance;

  let modelStrings: string[] = [];
  
  if (config.openRouterModels) {
    modelStrings = config.openRouterModels.split(",").map((m) => m.trim()).filter(Boolean);
  } else if (config.openRouterModel) {
    modelStrings = [config.openRouterModel.trim()];
  }
  
  if (modelStrings.length === 0) {
    throw new Error("No OpenRouter models configured in OPENROUTER_MODEL or OPENROUTER_MODELS.");
  }

  const providers = modelStrings.map((model) => ({
    name: `OpenRouter (${model})`,
    provider: new OpenRouterProvider(config.openRouterApiKey, model),
  }));

  providerInstance = new ProviderManager(providers);
  return providerInstance;
}
