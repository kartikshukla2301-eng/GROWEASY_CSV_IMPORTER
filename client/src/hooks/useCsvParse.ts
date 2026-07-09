"use client";

import { useCallback } from "react";
import { parseCsvFile } from "../lib/csvParser";
import { useImportStore } from "../store/importStore";

const MAX_SIZE_MB = 5;
const ALLOWED_EXTENSION = ".csv";

export function useCsvParse() {
  const { setParsedFile, setError } = useImportStore();

  const parseFile = useCallback(
    async (file: File) => {
      setError(null);

      if (!file.name.toLowerCase().endsWith(ALLOWED_EXTENSION)) {
        setError("Only CSV files are accepted. Please upload a file with a .csv extension.");
        return;
      }

      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`File size exceeds the ${MAX_SIZE_MB}MB limit.`);
        return;
      }

      try {
        const parsed = await parseCsvFile(file);
        setParsedFile(parsed);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to parse the CSV file.";
        setError(message);
      }
    },
    [setParsedFile, setError]
  );

  return { parseFile };
}
