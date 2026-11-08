import AppError from "@/utils/app-error-utils";
import type { BulkDocumentResult, BulkDocumentSummary, DocumentStatus } from "@mini-erp/shared";
import type { DocumentCreateContext } from "@/types";
import { transitionDocumentStatus } from "./document-status-service";
import { softDeleteDocument } from "./document-delete-service";

/**
 * Runs `operation` on each document in order, one transaction per document (the single-document
 * services own their transactions and locks). Failures are collected, never thrown: documents
 * processed before a failure stay processed. Expected errors report their HTTP status and message;
 * anything else is reported as a generic 500 without internal details.
 */
async function runBulk(
  documentIds: string[],
  operation: (documentId: string) => Promise<unknown>,
): Promise<BulkDocumentSummary> {
  const results: BulkDocumentResult[] = [];
  for (const id of documentIds) {
    try {
      await operation(id);
      results.push({ id, success: true });
    } catch (error) {
      if (error instanceof AppError && error.isOperational) {
        results.push({
          id,
          success: false,
          error: { status: error.statusCode, message: error.message },
        });
      } else {
        // TODO: replace with the project logger.
        console.error("Bulk document operation failed", { id, error });
        results.push({ id, success: false, error: { status: 500, message: "Unexpected error" } });
      }
    }
  }
  const succeeded = results.filter((r) => r.success).length;
  return { requested: documentIds.length, succeeded, failed: results.length - succeeded, results };
}

/**
 * Applies a status transition to several documents, each through the regular transition rules
 * (allowed transitions, formalization, history, side effects on linked documents).
 *
 * @returns Per-document outcome
 */
export function bulkChangeDocumentStatus(args: {
  documentIds: string[];
  status: DocumentStatus;
  reason?: string | null;
  context: DocumentCreateContext;
}): Promise<BulkDocumentSummary> {
  const { documentIds, status, reason, context } = args;
  return runBulk(documentIds, (documentId) =>
    transitionDocumentStatus({ documentId, targetStatus: status, reason, context }),
  );
}

/**
 * Soft-deletes several documents; only drafts without a number can be deleted.
 *
 * @returns Per-document outcome
 */
export function bulkDeleteDocuments(args: {
  documentIds: string[];
  context: DocumentCreateContext;
}): Promise<BulkDocumentSummary> {
  const { documentIds, context } = args;
  return runBulk(documentIds, (documentId) => softDeleteDocument({ documentId, context }));
}
