import type { Context } from "hono";
import type { AppBindings } from "@/lib/hono-app";
import type {
  CreateDocumentLineInput,
  DocumentIdParam,
  DocumentLineIdParam,
  ReorderDocumentLinesInput,
} from "@mini-erp/shared";
import { getValidatedBody, getValidatedParams } from "@/helpers/validated-context";
import { requireDocumentContext } from "@/helpers/document/document-context";
import { sendCreated, sendSuccess } from "@/utils/response-utils";
import {
  addDocumentLine as addDocumentLineService,
  removeDocumentLine as removeDocumentLineService,
  reorderDocumentLines as reorderDocumentLinesService,
  replaceDocumentLine,
} from "@/services/document";

/**
 * Adds a line to an editable document.
 * @route POST /api/documents/:id/lines
 * @access Private (document:update | document:manage)
 * @param c - Hono context
 */
export const addDocumentLine = async (c: Context<AppBindings>) => {
  const context = requireDocumentContext(c);
  const { id } = getValidatedParams<DocumentIdParam>(c);
  const input = getValidatedBody<CreateDocumentLineInput>(c);
  const result = await addDocumentLineService({ documentId: id, input, context });
  return sendCreated(c, result, "Riga aggiunta con successo");
};

/**
 * Replaces a line with a full payload. Omit `unitPrice` on variant lines to use the price list.
 * @route PUT /api/documents/:id/lines/:lineId
 * @access Private (document:update | document:manage)
 * @param c - Hono context
 */
export const updateDocumentLine = async (c: Context<AppBindings>) => {
  const context = requireDocumentContext(c);
  const { id, lineId } = getValidatedParams<DocumentLineIdParam>(c);
  const input = getValidatedBody<CreateDocumentLineInput>(c);
  const result = await replaceDocumentLine({ documentId: id, lineId, input, context });
  return sendSuccess(c, result, { message: "Riga aggiornata con successo" });
};

/**
 * Deletes a line and renumbers the following ones.
 * @route DELETE /api/documents/:id/lines/:lineId
 * @access Private (document:update | document:manage)
 * @param c - Hono context
 */
export const deleteDocumentLine = async (c: Context<AppBindings>) => {
  const context = requireDocumentContext(c);
  const { id, lineId } = getValidatedParams<DocumentLineIdParam>(c);
  const result = await removeDocumentLineService({ documentId: id, lineId, context });
  return sendSuccess(c, result, { message: "Riga eliminata" });
};

/**
 * Reorders all lines of a document.
 * @route PATCH /api/documents/:id/lines/reorder
 * @access Private (document:update | document:manage)
 * @param c - Hono context
 */
export const reorderDocumentLines = async (c: Context<AppBindings>) => {
  const context = requireDocumentContext(c);
  const { id } = getValidatedParams<DocumentIdParam>(c);
  const { lineIds } = getValidatedBody<ReorderDocumentLinesInput>(c);
  const lines = await reorderDocumentLinesService({ documentId: id, lineIds, context });
  return sendSuccess(c, lines, { message: "Righe riordinate con successo", results: lines.length });
};
