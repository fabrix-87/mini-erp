import type { Context } from "hono";
import type { AppBindings } from "@/lib/hono-app";
import {
  IDEMPOTENCY_KEY_HEADER,
  type CreateDocumentInput,
  type DocumentIdParam,
  type DocumentQueryInput,
  type UpdateDocumentInput,
} from "@mini-erp/shared";
import { idempotencyKeySchema } from "@mini-erp/shared/validators/document";
import {
  getValidatedBody,
  getValidatedParams,
  getValidatedQuery,
} from "@/helpers/validated-context";
import { requireDocumentContext } from "@/helpers/document/document-context";
import { BadRequestError } from "@/utils/app-error-utils";
import {
  sendCreated,
  sendDeleted,
  sendPaginatedResponse,
  sendSuccess,
} from "@/utils/response-utils";
import {
  computeRequestHash,
  createDocument as createDocumentService,
  getDocumentDetail,
  listDocuments,
  recalculateDraftDocument,
  softDeleteDocument,
  updateDocumentHeader,
} from "@/services/document";

/** Reads and validates the Idempotency-Key header. @throws BadRequestError when missing or malformed. */
function readIdempotencyKey(c: Context<AppBindings>): string {
  const header = c.req.header(IDEMPOTENCY_KEY_HEADER);
  if (!header) throw new BadRequestError(`${IDEMPOTENCY_KEY_HEADER} header is required`);
  const parsed = idempotencyKeySchema.safeParse(header);
  if (!parsed.success)
    throw new BadRequestError(parsed.error.issues[0]?.message ?? "Invalid idempotency key");
  return parsed.data;
}

/**
 * Lists documents with filters, sorting and pagination.
 * @route GET /api/documents
 * @access Private (document:read | document:manage)
 * @param c - Hono context
 */
export const getAllDocuments = async (c: Context<AppBindings>) => {
  const { tenantId } = requireDocumentContext(c);
  const query = getValidatedQuery<DocumentQueryInput>(c);
  const { items, total } = await listDocuments(query, tenantId);
  return sendPaginatedResponse(c, items, total, query.page, query.limit);
};

/**
 * Returns the full detail of a document.
 * @route GET /api/documents/:id
 * @access Private (document:read | document:manage)
 * @param c - Hono context
 */
export const getDocumentById = async (c: Context<AppBindings>) => {
  const { tenantId } = requireDocumentContext(c);
  const { id } = getValidatedParams<DocumentIdParam>(c);
  return sendSuccess(c, await getDocumentDetail(id, tenantId));
};

/**
 * Creates a DRAFT document idempotently. Returns 201 on creation and 200 on replay.
 * The hash is computed on the raw JSON body, not on the validated input, because
 * Zod defaults (e.g. documentDate) change on every retry.
 * @route POST /api/documents
 * @access Private (document:create | document:manage)
 * @param c - Hono context
 */
export const createDocument = async (c: Context<AppBindings>) => {
  const context = requireDocumentContext(c);
  const input = getValidatedBody<CreateDocumentInput>(c);
  const key = readIdempotencyKey(c);
  const rawBody: unknown = await c.req.json();

  const { document, replayed } = await createDocumentService(input, context, {
    key,
    requestHash: computeRequestHash(rawBody),
  });

  return replayed
    ? sendSuccess(c, document, { message: "Documento già creato con la stessa Idempotency-Key" })
    : sendCreated(c, document, "Documento creato con successo");
};

/**
 * Updates the header of an editable document.
 * @route PATCH /api/documents/:id
 * @access Private (document:update | document:manage)
 * @param c - Hono context
 */
export const updateDocument = async (c: Context<AppBindings>) => {
  const context = requireDocumentContext(c);
  const { id } = getValidatedParams<DocumentIdParam>(c);
  const input = getValidatedBody<UpdateDocumentInput>(c);
  const document = await updateDocumentHeader({ documentId: id, input, context });
  return sendSuccess(c, document, { message: "Documento aggiornato con successo" });
};

/**
 * Soft-deletes a DRAFT document without a number.
 * @route DELETE /api/documents/:id
 * @access Private (document:delete | document:manage)
 * @param c - Hono context
 */
export const deleteDocument = async (c: Context<AppBindings>) => {
  const context = requireDocumentContext(c);
  const { id } = getValidatedParams<DocumentIdParam>(c);
  await softDeleteDocument({ documentId: id, context });
  return sendDeleted(c, "Documento eliminato");
};

/**
 * Recalculates and persists the totals of an editable document.
 * @route POST /api/documents/:id/recalculate
 * @access Private (document:update | document:manage)
 * @param c - Hono context
 */
export const recalculateDocument = async (c: Context<AppBindings>) => {
  const context = requireDocumentContext(c);
  const { id } = getValidatedParams<DocumentIdParam>(c);
  const document = await recalculateDraftDocument({ documentId: id, context });
  return sendSuccess(c, document, { message: "Totali ricalcolati con successo" });
};
