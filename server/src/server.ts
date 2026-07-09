import { config, validateProviderConfig } from "./config/env";
import app from "./app";

try {
  validateProviderConfig();
} catch (err) {
  console.error((err as Error).message);
  process.exit(1);
}

const server = app.listen(config.port, () => {
  console.info(`[Server] Environment: PORT=${config.port}, BATCH_SIZE=${config.batchSize}, BATCH_CONCURRENCY=${config.batchConcurrency}`);
  console.info(`[Server] Models: ${config.openRouterModels || config.openRouterModel}`);});

process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});
