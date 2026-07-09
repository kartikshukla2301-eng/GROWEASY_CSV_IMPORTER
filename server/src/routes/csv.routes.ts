import { Router } from "express";
import { uploadMiddleware } from "../middleware/upload";
import { handleImport } from "../controllers/csv.controller";

const router = Router();

// POST /api/csv/import
// Accepts a CSV file via multipart/form-data (field name: "file").
// Returns SSE stream: progress events followed by a single result event.
router.post("/import", uploadMiddleware, handleImport);

export default router;
