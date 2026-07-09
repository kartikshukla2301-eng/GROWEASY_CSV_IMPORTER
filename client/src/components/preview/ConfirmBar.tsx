"use client";

import { Button } from "../ui/Button";
import { useCsvImport } from "../../hooks/useCsvImport";
import { useImportStore } from "../../store/importStore";

export function ConfirmBar() {
  const { runImport, isLoading } = useCsvImport();
  const { parsedFile, reset } = useImportStore();

  if (!parsedFile) return null;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-neutral-200 bg-white px-5 py-4">
      <div>
        <p className="text-sm font-medium text-neutral-800">
          {parsedFile.totalRows.toLocaleString()} rows ready to import
        </p>
        <p className="text-xs text-neutral-400 mt-0.5">
          The AI will extract and map each row into the GrowEasy CRM schema.
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button variant="secondary" size="md" onClick={reset} disabled={isLoading}>
          Start over
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={runImport}
          loading={isLoading}
          disabled={isLoading}
          aria-label={`Confirm import of ${parsedFile.totalRows} rows`}
        >
          Confirm import
        </Button>
      </div>
    </div>
  );
}
