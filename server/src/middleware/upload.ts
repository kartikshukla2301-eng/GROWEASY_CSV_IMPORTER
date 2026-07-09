import multer from "multer";
import { config } from "../config/env";
import { Request } from "express";
import { createAppError } from "../middleware/errorHandler";

const ALLOWED_MIME_TYPES = ["text/csv", "application/vnd.ms-excel", "text/plain"];
const ALLOWED_EXTENSION = ".csv";

const storage = multer.memoryStorage();

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void {
  const hasValidMime = ALLOWED_MIME_TYPES.includes(file.mimetype);
  const hasValidExt = file.originalname.toLowerCase().endsWith(ALLOWED_EXTENSION);

  if (!hasValidMime || !hasValidExt) {
    cb(
      createAppError(
        "Only CSV files are accepted (.csv extension and text/csv MIME type).",
        400,
        "INVALID_FILE_TYPE"
      )
    );
    return;
  }
  cb(null, true);
}

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: config.maxUploadSizeMb * 1024 * 1024,
  },
  fileFilter,
}).single("file");
