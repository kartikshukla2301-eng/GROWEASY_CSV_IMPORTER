"use client";

import { useCallback, useState } from "react";
import { importCsv } from "../lib/api";
import { useImportStore } from "../store/importStore";

export function useCsvImport() {
  const [isLoading, setIsLoading] = useState(false);
  const { parsedFile, setResult, setProgress, setError, goToStep } = useImportStore();

  const runImport = useCallback(async () => {
    if (!parsedFile) return;

    setIsLoading(true);
    setError(null);
    goToStep("processing");

    try {
      const result = await importCsv(parsedFile.file, (progress) => {
        setProgress(progress);
      });
      setResult(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred during import.";
      setError(message);
      goToStep("preview");
    } finally {
      setIsLoading(false);
    }
  }, [parsedFile, setResult, setProgress, setError, goToStep]);

  return { runImport, isLoading };
}
