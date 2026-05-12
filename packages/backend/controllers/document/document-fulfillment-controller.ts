import { BadRequestError, NotFoundError } from "@/utils/app-error-utils";
import { prisma } from "@/config/prisma-config";
import { Prisma } from "@/generated/prisma/client";
import { sendSuccess } from "@/utils/response-utils";
import { DocumentIdParam } from "@mini-erp/shared";
import { getDocumentSelection } from "@/helpers/document";
import {
  calculateFulfillmentStatus,
  createPartialDeliveryNote,
  getDocumentFulfillmentDetails,
  updateLineDeliveredQuantity,
} from "@/services/document";
import { toIntId, withSoftDelete, toDecimal } from "@/helpers/prisma-helper";
import { Context } from "hono";
import { AppBindings } from "@/lib/hono-app";
import { getValidatedBody, getValidatedParams } from "@/helpers/validated-context";

// ============================================================================
// FULFILLMENT READ
// ============================================================================

/**
 * Returns the fulfillment status and per-line breakdown for a document.
 * Includes overall fulfillment rate, total/delivered quantities, and status.
 * @route GET /api/documents/:id/fulfillment
 * @access Private
 */
export const getDocumentFulfillment = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<DocumentIdParam>(c);

  const document = await prisma.document.findUnique({
    where: withSoftDelete({ id: toIntId(id) }) as Prisma.DocumentWhereUniqueInput,
    select: { id: true, documentType: true, status: true },
  });

  if (!document) {
    throw new NotFoundError("Documento non trovato");
  }

  const details = await getDocumentFulfillmentDetails(toIntId(id));

  return sendSuccess(c, details);
};

// ============================================================================
// FULFILLMENT UPDATE — SINGLE LINE
// ============================================================================

/**
 * Updates the delivered quantity on a single document line.
 * Automatically recalculates and persists parent document fulfillment status.
 * @route PATCH /api/documents/:id/lines/:lineId/delivered
 * @access Private
 */
export const updateLineDelivered = async (c: Context<AppBindings>) => {
  const { id, lineId } = getValidatedParams<DocumentIdParam & { lineId: string }>(c);

  const body = getValidatedBody<{ quantityDelivered: number }>(c);

  // Verify the line belongs to the document
  const line = await prisma.documentLine.findFirst({
    where: {
      id: toIntId(lineId, "lineId"),
      documentId: toIntId(id),
      deletedAt: null,
    },
    select: {
      id: true,
      quantity: true,
      quantityDelivered: true,
    },
  });

  if (!line) {
    throw new NotFoundError("Riga documento non trovata");
  }

  const newDelivered = toDecimal(body.quantityDelivered);
  if (!newDelivered) {
    throw new BadRequestError("Quantità consegnata non valida");
  }

  // Delivered cannot exceed total quantity
  if (newDelivered.greaterThan(line.quantity)) {
    throw new BadRequestError(
      `Quantità consegnata (${body.quantityDelivered}) supera la quantità totale (${line.quantity})`
    );
  }

  await updateLineDeliveredQuantity(toIntId(lineId, "lineId"), newDelivered);

  const updated = await prisma.documentLine.findUnique({
    where: { id: toIntId(lineId, "lineId") },
    select: {
      id: true,
      lineNumber: true,
      quantity: true,
      quantityDelivered: true,
    },
  });

  return sendSuccess(c, updated, { message: "Quantità consegnata aggiornata" });
};

// ============================================================================
// PARTIAL DELIVERY NOTE
// ============================================================================

/**
 * Creates a partial delivery note from an order document.
 * Each entry in lineQuantities specifies a line ID and the quantity to include.
 * Automatically updates the parent order fulfillment status.
 * @route POST /api/documents/:id/delivery-note
 * @access Private
 */
export const createDeliveryNote = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<DocumentIdParam>(c);
  const { lineQuantities } = getValidatedBody<{
    lineQuantities: Array<{ lineId: number; quantity: number }>;
  }>(c);
  const userId = c.get("user")!.userId;

  if (!lineQuantities || lineQuantities.length === 0) {
    throw new BadRequestError("Nessuna riga specificata per la consegna parziale");
  }

  // Validate that the source document exists and is in a fulfillable state
  const document = await prisma.document.findUnique({
    where: withSoftDelete({ id: toIntId(id) }) as Prisma.DocumentWhereUniqueInput,
    select: { id: true, documentType: true, status: true },
  });

  if (!document) {
    throw new NotFoundError("Documento non trovato");
  }

  const fulfillableTypes = ["ORDER", "PURCHASE_ORDER"];
  if (!fulfillableTypes.includes(document.documentType)) {
    throw new BadRequestError(
      `Tipo documento non supporta la generazione di DDT: ${document.documentType}`
    );
  }

  const fulfillableStatuses = ["ACCEPTED", "PARTIALLY_FULFILLED"];
  if (!fulfillableStatuses.includes(document.status)) {
    throw new BadRequestError(
      `Stato documento non permette la consegna parziale: ${document.status}`
    );
  }

  // Validate quantities against remaining deliverable amounts
  const lines = await prisma.documentLine.findMany({
    where: {
      id: { in: lineQuantities.map((l) => l.lineId) },
      documentId: toIntId(id),
      deletedAt: null,
    },
    select: {
      id: true,
      quantity: true,
      quantityDelivered: true,
    },
  });

  for (const item of lineQuantities) {
    const line = lines.find((l) => l.id === item.lineId);
    if (!line) {
      throw new BadRequestError(`Riga ${item.lineId} non trovata nel documento`);
    }

    const remaining =
      parseFloat(line.quantity.toString()) - parseFloat(line.quantityDelivered.toString());

    if (item.quantity <= 0) {
      throw new BadRequestError(`Quantità non valida per riga ${item.lineId}: deve essere > 0`);
    }

    if (item.quantity > remaining) {
      throw new BadRequestError(
        `Quantità richiesta (${item.quantity}) supera il residuo disponibile (${remaining}) per riga ${item.lineId}`
      );
    }
  }

  const deliveryNoteId = await createPartialDeliveryNote(toIntId(id), lineQuantities, userId);

  const deliveryNote = await prisma.document.findUnique({
    where: { id: deliveryNoteId },
    select: getDocumentSelection(),
  });

  return sendSuccess(c, deliveryNote, {
    message: "DDT creato con successo",
  });
};

// ============================================================================
// FULFILLMENT STATUS CHECK
// ============================================================================

/**
 * Returns aggregated fulfillment metrics for a document (no line details).
 * Lightweight alternative to getDocumentFulfillment when only the summary is needed.
 * @route GET /api/documents/:id/fulfillment/status
 * @access Private
 */
export const getFulfillmentStatus = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<DocumentIdParam>(c);

  const document = await prisma.document.findUnique({
    where: withSoftDelete({ id: toIntId(id) }) as Prisma.DocumentWhereUniqueInput,
    select: { id: true },
  });

  if (!document) {
    throw new NotFoundError("Documento non trovato");
  }

  const status = await calculateFulfillmentStatus(toIntId(id));

  return sendSuccess(c, status);
};