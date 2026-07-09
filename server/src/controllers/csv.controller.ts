import { Request, Response, NextFunction } from "express";
import { runImport } from "../services/extraction/extractionService";
import { createAppError } from "../middleware/errorHandler";

export async function handleImport(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.file) {
      throw createAppError("No file was uploaded.", 400, "NO_FILE");
    }

    // Stream batch progress updates via SSE so the client can show a real progress indicator
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const result = await runImport(req.file.buffer, ({ batchIndex, totalBatches }) => {
      const data = JSON.stringify({ batchIndex: batchIndex + 1, totalBatches });
      res.write(`event: progress\ndata: ${data}\n\n`);
    });

    res.write(`event: result\ndata: ${JSON.stringify(result)}\n\n`);
    res.end();
  } catch (err) {
    next(err);
  }
}

export async function handleHealthCheck(
  _req: Request,
  res: Response
): Promise<void> {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
}
