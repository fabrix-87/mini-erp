import type { Context } from "hono";
import type { AppBindings } from "@/lib/hono-app";
import type { CloneDocumentInput, ConvertDocumentInput, DocumentIdParam } from "@mini-erp/shared";
import { getValidatedBody, getValidatedParams } from "@/helpers/validated-context";
import { requireDocumentContext } from "@/helpers/document/document-context";
import { sendCreated, sendSuccess } from "@/utils/response-utils";
import {
  cloneDocument as cloneDocumentService,
  convertDocument as convertDocumentService,
  getDocumentRelations as getDocumentRelationsService,
} from "@/services/document";

/**
 * Converts a document into another type as a DRAFT (see CONVERSION_RULES for the available pairs).
 * @route POST /api/documents/:id/convert
 * @access Private (document:create | document:manage)
 * @param c - Hono context
 */
export const convertDocument = async (c: Context<AppBindings>) => {
  const context = requireDocumentContext(c);
  const { id } = getValidatedParams<DocumentIdParam>(c);
  const input = getValidatedBody<ConvertDocumentInput>(c);
  const document = await convertDocumentService({ sourceId: id, input, context });
  return sendCreated(c, document, `Documento convertito in ${input.targetDocumentType}`);
};

/**
 * Clones a document as a new DRAFT of the same type.
 * @route POST /api/documents/:id/clone
 * @access Private (document:create | document:manage)
 * @param c - Hono context
 */
export const cloneDocument = async (c: Context<AppBindings>) => {
  const context = requireDocumentContext(c);
  const { id } = getValidatedParams<DocumentIdParam>(c);
  const input = getValidatedBody<CloneDocumentInput>(c);
  return sendCreated(
    c,
    await cloneDocumentService({ sourceId: id, input, context }),
    "Documento clonato con successo",
  );
};

/**
 * Lists the documents linked to a document, in both directions.
 * @route GET /api/documents/:id/relations
 * @access Private (document:read | document:manage)
 * @param c - Hono context
 */
export const getDocumentRelations = async (c: Context<AppBindings>) => {
  const { tenantId } = requireDocumentContext(c);
  const { id } = getValidatedParams<DocumentIdParam>(c);
  return sendSuccess(c, await getDocumentRelationsService(id, tenantId));
};
