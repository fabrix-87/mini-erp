import { BadRequestError, NotFoundError } from "@/utils/app-error-utils";
import { prisma } from "@/config/prisma-config";
import { sendCreated, sendDeleted, sendSuccess } from "@/utils/response-utils";
import { toIntId, withSoftDelete } from "@/helpers/prisma-helper";
import { getValidatedBody, getValidatedParams } from "@/helpers/validated-context";
import {
  calculateLineTotals,
  CreateDocumentLineInput,
  DocumentIdLineIdParams,
  DocumentIdParam,
  DocumentLineIdParam,
  UpdateDocumentLineInput,
} from "@mini-erp/shared";
import { Prisma } from "@/generated/prisma/client";
import { AppBindings } from "@/lib/hono-app";
import { Context } from "hono";

// ============================================================================
// DOCUMENT LINES — CRUD
// ============================================================================

/**
 * Lists all lines for a document.
 * @route GET /api/documents/:id/lines
 * @access Private
 */
export const getDocumentLines = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<DocumentIdParam>(c);

  const document = await prisma.document.findUnique({
    where: withSoftDelete({ id: toIntId(id) }) as Prisma.DocumentWhereUniqueInput,
    select: { id: true },
  });
  if (!document) throw new NotFoundError("Documento non trovato");

  const lines = await prisma.documentLine.findMany({
    where: { documentId: toIntId(id) },
    orderBy: { lineNumber: "asc" },
  });

  return sendSuccess(c, lines, { results: lines.length });
};

/**
 * Adds a line to an existing document.
 * Recalculates line totals automatically.
 * @route POST /api/documents/:id/lines
 * @access Private
 */
export const addDocumentLine = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<DocumentIdParam>(c);
  const lineData = getValidatedBody<CreateDocumentLineInput>(c);

  const document = await prisma.document.findUnique({
    where: withSoftDelete({ id: toIntId(id) }) as Prisma.DocumentWhereUniqueInput,
    select: {
      status: true,
      lines: { select: { lineNumber: true } },
    },
  });

  if (!document) {
    throw new NotFoundError("Documento non trovato");
  }

  if (document.status !== "DRAFT" && document.status !== "PENDING_APPROVAL") {
    throw new BadRequestError("Impossibile modificare righe di un documento non in bozza");
  }

  const maxLineNumber = document.lines.reduce((max, line) => Math.max(max, line.lineNumber), 0);

  const lineTotals = calculateLineTotals(
    lineData.quantity || 0,
    lineData.unitPrice,
    lineData.discountPercent,
    lineData.taxPercent,
  );

  const line = await prisma.documentLine.create({
    data: {
      ...lineData,
      documentId: toIntId(id),
      lineNumber: maxLineNumber + 1,
      ...lineTotals,
    },
  });

  return sendCreated(c, line, "Riga aggiunta con successo");
};

/**
 * Updates a document line, recalculating totals when pricing fields change.
 * @route PUT /api/documents/:id/lines/:lineId
 * @access Private
 */
export const updateDocumentLine = async (c: Context<AppBindings>) => {
  const { id, lineId } = getValidatedParams<DocumentLineIdParam>(c);
  const updateData = getValidatedBody<UpdateDocumentLineInput>(c);

  const needsRecalc =
    updateData.quantity !== undefined ||
    updateData.unitPrice !== undefined ||
    updateData.discountPercent !== undefined ||
    updateData.taxPercent !== undefined;

  const existingLine = await prisma.documentLine.findUnique({
    where: { id: toIntId(lineId, "lineId") },
    select: {
      documentId: true,
      quantity: true,
      unitPrice: true,
      discountPercent: true,
      taxPercent: true,
    },
  });

  if (!existingLine) throw new NotFoundError("Riga non trovata");
  if (existingLine.documentId !== toIntId(id)) {
    throw new BadRequestError("La riga non appartiene a questo documento");
  }

  if (needsRecalc) {
    const lineTotals = calculateLineTotals(
      updateData.quantity ?? existingLine.quantity,
      updateData.unitPrice ?? existingLine.unitPrice,
      updateData.discountPercent ?? existingLine.discountPercent,
      updateData.taxPercent ?? existingLine.taxPercent,
    );

    Object.assign(updateData, lineTotals);
  }

  const line = await prisma.documentLine.update({
    where: { id: toIntId(lineId, "lineId") },
    data: updateData,
  });

  return sendSuccess(c, line, { message: "Riga aggiornata con successo" });
};

/**
 * Deletes a document line by ID.
 * @route DELETE /api/documents/:id/lines/:lineId
 * @access Private
 */
export const deleteDocumentLine = async (c: Context<AppBindings>) => {
  const { id, lineId } = getValidatedParams<DocumentIdLineIdParams>(c);

  const line = await prisma.documentLine.findUnique({
    where: { id: toIntId(lineId, "lineId") },
    select: { documentId: true },
  });
  if (!line) throw new NotFoundError("Riga non trovata");
  if (line.documentId !== toIntId(id))
    throw new BadRequestError("La riga non appartiene a questo documento");

  await prisma.documentLine.delete({ where: { id: toIntId(lineId, "lineId") } });

  return sendDeleted(c, "Riga eliminata");
};

/**
 * Reorders document lines by reassigning lineNumber based on the provided ID array order.
 * All provided IDs must belong to the specified document.
 * @route PATCH /api/documents/:id/lines/reorder
 * @access Private
 */
export const reorderDocumentLines = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<DocumentIdParam>(c);
  const { lineIds } = getValidatedBody<{ lineIds: number[] }>(c);

  const documentId = toIntId(id);

  if (!Array.isArray(lineIds) || lineIds.length === 0) {
    throw new BadRequestError("Array di ID righe richiesto");
  }

  // Verifica che tutte le righe appartengano al documento
  const lines = await prisma.documentLine.findMany({
    where: { id: { in: lineIds }, documentId },
    select: { id: true },
  });

  if (lines.length !== lineIds.length) {
    throw new BadRequestError("Alcune righe non appartengono a questo documento");
  }

  // Aggiorna i numeri di riga in transazione
  await prisma.$transaction(
    lineIds.map((lineId, index) =>
      prisma.documentLine.update({
        where: { id: lineId },
        data: { lineNumber: index + 1 },
      }),
    ),
  );

  const updatedLines = await prisma.documentLine.findMany({
    where: { documentId },
    orderBy: { lineNumber: "asc" },
  });

  return sendSuccess(c, updatedLines, {
    message: "Righe riordinate con successo",
  });
};
