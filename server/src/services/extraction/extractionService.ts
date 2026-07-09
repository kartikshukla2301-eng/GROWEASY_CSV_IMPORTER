import { parseCsvBuffer } from "../csv/csvParser.service";
import { getAiProvider } from "../ai/providerFactory";
import { processBatches, ProgressCallback } from "../batching/batchingService";
import { ImportResponse } from "../../../../shared/schema";

export async function runImport(
  fileBuffer: Buffer,
  onProgress?: ProgressCallback
): Promise<ImportResponse> {
  const { headers, rows, totalRows } = parseCsvBuffer(fileBuffer);
  const provider = getAiProvider();

  const { imported, skipped } = await processBatches(
    rows,
    headers,
    provider,
    onProgress
  );

  return {
    totalRows,
    totalImported: imported.length,
    totalSkipped: skipped.length,
    imported,
    skipped,
  };
}
