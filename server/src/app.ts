import express from "express";
import cors from "cors";
import { config } from "./config/env";
import csvRoutes from "./routes/csv.routes";
import healthRoutes from "./routes/health.routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }
    const isAllowed =
      origin === config.corsOrigin ||
      /^https?:\/\/localhost(:\d+)?$/.test(origin) ||
      origin.endsWith(".vercel.app");
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true
}));
app.use(express.json());

app.use("/api", healthRoutes);
app.use("/api/csv", csvRoutes);

// Centralized error handler must be registered last
app.use(errorHandler);

export default app;
