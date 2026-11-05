import type { Context } from "hono";
import type { AppBindings } from "@/lib/hono-app";
import type { DocumentIdParam } from "@mini-erp/shared";
import { getValidatedParams } from "@/helpers/validated-context";
import { requireDocumentContext } from "@/helpers/document/document-context";
import { sendSuccess } from "@/utils/response-utils";
import { getDocumentFulfillmentDetails } from "@/services/document";

/**
 * Returns the fulfillment status and per-line breakdown of an order.
 * Delivered quantities derive from formalized delivery notes and are read-only.
 * @route GET /api/documents/:id/fulfillment
 * @access Private (document:read | document:manage)
 * @param c - Hono context
 */
export const getDocumentFulfillment = async (c: Context<AppBindings>) => {
  const { tenantId } = requireDocumentContext(c);
  const { id } = getValidatedParams<DocumentIdParam>(c);
  return sendSuccess(c, await getDocumentFulfillmentDetails({ documentId: id, tenantId }));
};
