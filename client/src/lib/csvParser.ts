import Papa from "papaparse";
import { ParsedFile } from "../types";

export function parseCsvFile(file: File): Promise<ParsedFile> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete(results) {
        if (results.errors.length > 0 && results.data.length === 0) {
          reject(new Error(`CSV parse error: ${results.errors[0].message}`));
          return;
        }

        if (results.data.length === 0) {
          reject(new Error("The file contains no data rows."));
          return;
        }

        const headers = results.meta.fields ?? [];
        resolve({
          file,
          headers,
          rows: results.data,
          totalRows: results.data.length,
        });
      },
      error(err) {
        reject(new Error(`Failed to parse CSV: ${err.message}`));
      },
    });
  });
}
