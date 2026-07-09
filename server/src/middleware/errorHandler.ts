import { Request, Response, NextFunction } from "express";
import { AppError } from "../types";

export function createAppError(
  message: string,
  statusCode: number,
  code: string
): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

// Centralized error middleware — normalizes all errors into a consistent shape.
// Stack traces are logged server-side and never sent to the client.
export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const appError = err as AppError;
  const statusCode = appError.statusCode ?? 500;
  const code = appError.code ?? "INTERNAL_ERROR";

  console.error(`[${code}] ${err.message}`, err.stack);

  res.status(statusCode).json({
    error: {
      code,
      message: statusCode === 500 ? "An unexpected error occurred." : err.message,
    },
  });
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}
