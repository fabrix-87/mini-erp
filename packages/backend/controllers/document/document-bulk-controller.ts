import type { Context } from "hono";
import type { AppBindings } from "@/lib/hono-app";
import type { BulkDeleteDocumentsInput, BulkUpdateDocumentsStatusInput } from "@mini-erp/shared";
import { getValidatedBody } from "@/helpers/validated-context";
import { requireDocumentContext } from "@/helpers/document/document-context";
import { sendSuccess } from "@/utils/response-utils";
import {
  bulkChangeDocumentStatus,
  bulkDeleteDocuments as bulkDeleteDocumentsService,
} from "@/services/document";

/**
 * Changes the status of several documents. Responds 200 with a per-document outcome even when
 * some documents fail; the others are not rolled back.
 * @route POST /api/documents/bulk-change-status
 * @access Private (document:update | document:manage)
 * @param c - Hono context
 */
export const bulkChangeStatus = async (c: Context<AppBindings>) => {
  const context = requireDocumentContext(c);
  const input = getValidatedBody<BulkUpdateDocumentsStatusInput>(c);
  const summary = await bulkChangeDocumentStatus({ ...input, context });
  return sendSuccess(c, summary, {
    message: `${summary.succeeded}/${summary.requested} documenti aggiornati`,
  });
};

/**
 * Soft-deletes several draft documents. Responds 200 with a per-document outcome.
 * @route POST /api/documents/bulk-delete
 * @access Private (document:delete | document:manage)
 * @param c - Hono context
 */
export const bulkDeleteDocuments = async (c: Context<AppBindings>) => {
  const context = requireDocumentContext(c);
  const { documentIds } = getValidatedBody<BulkDeleteDocumentsInput>(c);
  const summary = await bulkDeleteDocumentsService({ documentIds, context });
  return sendSuccess(c, summary, {
    message: `${summary.succeeded}/${summary.requested} documenti eliminati`,
  });
};
