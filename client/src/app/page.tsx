"use client";

import { useImportStore } from "../store/importStore";
import { StepIndicator } from "../components/ui/StepIndicator";
import { UploadZone } from "../components/upload/UploadZone";
import { PreviewTable } from "../components/preview/PreviewTable";
import { ConfirmBar } from "../components/preview/ConfirmBar";
import { ResultSummary } from "../components/result/ResultSummary";
import { ImportedTable } from "../components/result/ImportedTable";
import { SkippedTable } from "../components/result/SkippedTable";
import { Spinner } from "../components/ui/Spinner";
import { ProgressBar } from "../components/ui/ProgressBar";
import { Button } from "../components/ui/Button";

export default function HomePage() {
  const { step, parsedFile, progress, result, reset } = useImportStore();

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            <div>
              <span className="text-sm font-semibold text-neutral-900">GrowEasy</span>
              <span className="mx-2 text-neutral-300">/</span>
              <span className="text-sm text-neutral-500">CSV Importer</span>
            </div>
            <StepIndicator currentStep={step} />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
        {/* Upload step */}
        {step === "upload" && (
          <section aria-label="Upload CSV file">
            <div className="mb-8 text-center">
              <h1 className="text-xl font-semibold text-neutral-900">Import leads from CSV</h1>
              <p className="mt-2 text-sm text-neutral-500">
                Upload any CSV — the AI will map columns to the GrowEasy CRM schema automatically.
              </p>
            </div>
            <UploadZone />
          </section>
        )}

        {/* Preview step */}
        {step === "preview" && parsedFile && (
          <section aria-label="Preview uploaded data">
            <div className="mb-5">
              <h1 className="text-lg font-semibold text-neutral-900">Preview</h1>
              <p className="mt-1 text-sm text-neutral-500">
                {parsedFile.totalRows.toLocaleString()} rows, {parsedFile.headers.length} columns — confirm to start AI extraction.
              </p>
            </div>
            <div className="space-y-4">
              <PreviewTable headers={parsedFile.headers} rows={parsedFile.rows} />
              <ConfirmBar />
            </div>
          </section>
        )}

        {/* Processing step */}
        {step === "processing" && (
          <section
            aria-label="Processing import"
            aria-live="polite"
            className="flex flex-col items-center justify-center py-24 gap-6"
          >
            <Spinner size="lg" />
            <div className="text-center">
              <p className="text-sm font-medium text-neutral-800">
                {progress
                  ? `Processing batch ${progress.batchIndex} of ${progress.totalBatches}`
                  : "Preparing extraction..."}
              </p>
              <p className="mt-1 text-xs text-neutral-400">
                The AI is mapping each row to the CRM schema.
              </p>
            </div>
            {progress && (
              <ProgressBar
                value={progress.batchIndex}
                max={progress.totalBatches}
                label={`Batch ${progress.batchIndex} of ${progress.totalBatches}`}
                className="w-full max-w-xs"
              />
            )}
          </section>
        )}

        {/* Result step */}
        {step === "result" && result && (
          <section aria-label="Import results">
            <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-lg font-semibold text-neutral-900">Import complete</h1>
                <p className="mt-1 text-sm text-neutral-500">
                  Review the extracted CRM records below.
                </p>
              </div>
              <Button variant="secondary" size="md" onClick={reset}>
                Import another file
              </Button>
            </div>

            <div className="space-y-8">
              <ResultSummary result={result} />

              <div>
                <h2 className="mb-3 text-sm font-semibold text-neutral-800">
                  Imported records
                  <span className="ml-2 text-xs font-normal text-neutral-400">
                    ({result.totalImported.toLocaleString()})
                  </span>
                </h2>
                <ImportedTable records={result.imported} />
              </div>

              {result.totalSkipped > 0 && (
                <div>
                  <h2 className="mb-3 text-sm font-semibold text-neutral-800">
                    Skipped records
                    <span className="ml-2 text-xs font-normal text-neutral-400">
                      ({result.totalSkipped.toLocaleString()})
                    </span>
                  </h2>
                  <SkippedTable records={result.skipped} />
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
