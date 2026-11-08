/** Outcome of a bulk operation on one document. */
export interface BulkDocumentResult {
  id: string;
  success: boolean;
  error?: { status: number; message: string };
}

/** Aggregated outcome of a bulk operation. */
export interface BulkDocumentSummary {
  requested: number;
  succeeded: number;
  failed: number;
  results: BulkDocumentResult[];
}
