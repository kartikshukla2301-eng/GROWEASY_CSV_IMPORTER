"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useCsvParse } from "../../hooks/useCsvParse";
import { useImportStore } from "../../store/importStore";

export function UploadZone() {
  const { parseFile } = useCsvParse();
  const error = useImportStore((s) => s.error);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) parseFile(file);
    },
    [parseFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        {...getRootProps()}
        className={[
          "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-8 py-14",
          "cursor-pointer transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2",
          isDragActive
            ? "border-accent-500 bg-accent-50"
            : "border-neutral-200 bg-neutral-50 hover:border-neutral-300 hover:bg-white",
        ].join(" ")}
        role="button"
        tabIndex={0}
        aria-label="Upload CSV file"
      >
        <input {...getInputProps()} aria-label="File input" />

        <div
          className={[
            "mb-4 rounded-full p-3 transition-colors duration-200",
            isDragActive ? "bg-accent-100" : "bg-neutral-100",
          ].join(" ")}
          aria-hidden="true"
        >
          <svg
            className={["h-7 w-7", isDragActive ? "text-accent-600" : "text-neutral-400"].join(" ")}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        <p className="text-sm font-medium text-neutral-800">
          {isDragActive ? "Drop your CSV here" : "Drop a CSV file here, or click to browse"}
        </p>
        <p className="mt-1 text-xs text-neutral-400">
          CSV files only, maximum 5 MB
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}
    </div>
  );
}
