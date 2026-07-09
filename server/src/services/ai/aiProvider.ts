import { LlmBatchResponse } from "../../../../shared/schema";
import { RawRow } from "../../types";

export interface AiProvider {
  extractBatch(
    rows: RawRow[],
    headers: string[],
    batchIndex: number,
    totalBatches: number
  ): Promise<LlmBatchResponse>;
}
