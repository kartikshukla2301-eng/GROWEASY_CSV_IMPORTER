import pLimit from "p-limit";
import { config } from "../../config/env";
import { CrmRecord, SkippedRecord } from "../../../../shared/schema";
import { RawRow, BatchResult } from "../../types";
import { AiProvider } from "../ai/aiProvider";
import { applyBusinessRules } from "../validation/businessRules";
import { sanitizeRow } from "../../utils/sanitize";

export interface BatchProgress {
  batchIndex: number;
  totalBatches: number;
}

export type ProgressCallback = (progress: BatchProgress) => void;

export async function processBatches(
  rows: RawRow[],
  headers: string[],
  provider: AiProvider,
  onProgress?: ProgressCallback
): Promise<BatchResult> {
  const batchSize = config.batchSize;
  const concurrency = config.batchConcurrency;

  const batches: RawRow[][] = [];
  for (let i = 0; i < rows.length; i += batchSize) {
    batches.push(rows.slice(i, i + batchSize));
  }

  const totalBatches = batches.length;
  const limit = pLimit(concurrency);
  const allImported: CrmRecord[] = [];
  const allSkipped: SkippedRecord[] = [];

  const tasks = batches.map((batch, batchIndex) => {
    const batchStartIndex = batchIndex * batchSize;
    const sanitizedBatch = batch.map(sanitizeRow);

    return limit(async () => {
      onProgress?.({ batchIndex, totalBatches });

      try {
        const llmResponse = await provider.extractBatch(
          sanitizedBatch,
          headers,
          batchIndex,
          totalBatches
        );
        const result = applyBusinessRules(llmResponse.records, batch, batchStartIndex);
        return result;
      } catch (err) {
        const reason =
          err instanceof Error ? err.message : "AI extraction failed for this batch";

        // Batch-level failure: mark all rows in the batch as skipped, do not abort the import
        console.error(`Batch ${batchIndex + 1}/${totalBatches} failed: ${reason}`);
        const batchSkipped: SkippedRecord[] = batch.map((rawData, i) => ({
          row: batchStartIndex + i + 1,
          reason: "AI extraction failed for this batch",
          rawData,
        }));
        return { imported: [], skipped: batchSkipped };
      }
    });
  });

  const results = await Promise.all(tasks);

  for (const result of results) {
    allImported.push(...result.imported);
    allSkipped.push(...result.skipped);
  }

  return { imported: allImported, skipped: allSkipped };
}
