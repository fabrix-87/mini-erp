import { BadRequestError, NotFoundError } from "@/utils/app-error-utils";
import { prisma } from "@/config/prisma-config";
import { Prisma } from "@/generated/prisma/client";
import {
  sendCreated,
  sendDeleted,
  sendPaginatedResponse,
  sendSuccess,
} from "@/utils/response-utils";
import {
  calculateDocumentTotals,
  calculateLineTotals,
  CreateDocumentInput,
  CreateDocumentLineInput,
  DOCUMENT_TYPE_CONFIG,
  DocumentIdLineIdParams,
  DocumentIdParam,
  DocumentLineIdParam,
  DocumentQueryInput,
  DocumentType,
  UpdateDocumentInput,
  UpdateDocumentLineInput,
} from "@mini-erp/shared";
import { getDocumentSelection } from "@/helpers/document";
import { buildDocumentCreateData, buildDocumentUpdateData } from "@/services/document";
import { toPagination, toIntId, withSoftDelete } from "@/helpers/prisma-helper";
import { Context } from "hono";
import { AppBindings } from "@/lib/hono-app";
import {
  getValidatedBody,
  getValidatedParams,
  getValidatedQuery,
} from "@/helpers/validated-context";

// ============================================================================
// DOCUMENT CRUD - Base operations
// ============================================================================

/**
 * Lists all documents with filters and pagination.
 * @route GET /api/documents
 * @access Private
 */
export const getAllDocuments = async (c: Context<AppBindings>) => {
  const {
    page = 1,
    limit = 20,
    search,
    documentType,
    status,
    customerId,
    supplierId,
    warehouseId,
    dateFrom,
    dateTo,
    minAmount,
    maxAmount,
    sortBy = "documentDate",
    sortOrder = "desc",
  } = getValidatedQuery<DocumentQueryInput>(c);

  const { skip, take } = toPagination(page, limit);

  const baseWhere: Prisma.DocumentWhereInput = {};

  if (search) {
    baseWhere.OR = [
      { documentNumber: { contains: search, mode: "insensitive" } },
      { customerName: { contains: search, mode: "insensitive" } },
      { notes: { contains: search, mode: "insensitive" } },
    ];
  }

  if (documentType) baseWhere.documentType = documentType;
  if (status) baseWhere.status = status;
  if (customerId) baseWhere.customerId = toIntId(customerId, "customerId");
  if (supplierId) baseWhere.supplierId = toIntId(supplierId, "supplierId");
  if (warehouseId) baseWhere.warehouseId = toIntId(warehouseId, "warehouseId");

  if (dateFrom || dateTo) {
    baseWhere.documentDate = {};
    if (dateFrom) baseWhere.documentDate.gte = new Date(dateFrom);
    if (dateTo) baseWhere.documentDate.lte = new Date(dateTo);
  }

  if (minAmount || maxAmount) {
    baseWhere.totalAmount = {};
    if (minAmount) baseWhere.totalAmount.gte = Number(minAmount);
    if (maxAmount) baseWhere.totalAmount.lte = Number(maxAmount);
  }

  // Applica soft-delete filter tramite helper
  const where = withSoftDelete(baseWhere) as Prisma.DocumentWhereInput;

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      select: getDocumentSelection(),
      skip,
      take,
      orderBy: { [sortBy as string]: sortOrder },
    }),
    prisma.document.count({ where }),
  ]);

  return sendPaginatedResponse(c, documents, total, page, limit);
};

/**
 * Returns a single document by ID.
 * @route GET /api/documents/:id
 * @access Private
 */
export const getDocumentById = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<DocumentIdParam>(c);

  const document = await prisma.document.findUnique({
    where: withSoftDelete({ id: toIntId(id) }) as Prisma.DocumentWhereUniqueInput,
    select: getDocumentSelection(),
  });

  if (!document) {
    throw new NotFoundError("Documento non trovato");
  }

  return sendSuccess(c, document);
};

/**
 * Creates a new document.
 * Validates document type configuration before creation.
 * @route POST /api/documents
 * @access Private
 */
export const createDocument = async (c: Context<AppBindings>) => {
  const input = getValidatedBody<CreateDocumentInput>(c);
  const userId = c.get("user")!.userId;

  const config = DOCUMENT_TYPE_CONFIG[input.documentType as DocumentType];

  if (config.requiresCustomer && !input.customerId) {
    throw new BadRequestError(`Tipo documento ${input.documentType} richiede un cliente`);
  }
  if (config.requiresSupplier && !input.supplierId) {
    throw new BadRequestError(`Tipo documento ${input.documentType} richiede un fornitore`);
  }
  if (config.requiresWarehouse && !input.warehouseId) {
    throw new BadRequestError(`Tipo documento ${input.documentType} richiede un magazzino`);
  }
  if (config.requiresPaymentMethod && !input.paymentMethod) {
    throw new BadRequestError(`Tipo documento ${input.documentType} richiede metodo di pagamento`);
  }

  const document = await prisma.$transaction(async (tx) => {
    const data = await buildDocumentCreateData(input, userId, tx);
    return tx.document.create({ data, select: getDocumentSelection() });
  });

  return sendCreated(c, document, "Documento creato con successo");
};

/**
 * Updates a document. Only DRAFT or PENDING_APPROVAL documents can be edited.
 * @route PUT /api/documents/:id
 * @access Private
 */
export const updateDocument = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<DocumentIdParam>(c);
  const payload = getValidatedBody<UpdateDocumentInput>(c);

  const existing = await prisma.document.findUnique({
    where: withSoftDelete({ id: toIntId(id) }) as Prisma.DocumentWhereUniqueInput,
    select: { status: true },
  });

  if (!existing) {
    throw new NotFoundError("Documento non trovato");
  }

  if (existing.status !== "DRAFT" && existing.status !== "PENDING_APPROVAL") {
    throw new BadRequestError("Impossibile modificare un documento non in bozza");
  }

  const document = await prisma.document.update({
    where: { id: toIntId(id) },
    data: buildDocumentUpdateData(payload),
    select: getDocumentSelection(),
  });

  return sendSuccess(c, document, { message: "Documento aggiornato con successo" });
};

/**
 * Soft-deletes a document. Only DRAFT documents can be deleted.
 * @route DELETE /api/documents/:id
 * @access Private
 */
export const deleteDocument = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<DocumentIdParam>(c);

  const document = await prisma.document.findUnique({
    where: withSoftDelete({ id: toIntId(id) }) as Prisma.DocumentWhereUniqueInput,
    select: { status: true },
  });

  if (!document) {
    throw new NotFoundError("Documento non trovato");
  }

  if (document.status !== "DRAFT") {
    throw new BadRequestError("Impossibile eliminare un documento non in bozza. Annullalo invece.");
  }

  await prisma.document.update({
    where: { id: toIntId(id) },
    data: {
      deletedAt: new Date(),
      deletedBy: c.get("user")!.userId,
    },
  });

  return sendDeleted(c, "Documento eliminato");
};

// ============================================================================
// DOCUMENT LINES
// ============================================================================

/**
 * Lists all lines for a document.
 * @route GET /api/documents/:id/lines
 * @access Private
 */
export const getDocumentLines = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<DocumentIdParam>(c);

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
    include: { lines: true },
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

  if (needsRecalc) {
    const existingLine = await prisma.documentLine.findUnique({
      where: { id: toIntId(lineId), documentId: toIntId(id) },
    });

    if (!existingLine) {
      throw new NotFoundError("Riga non trovata");
    }

    const lineTotals = calculateLineTotals(
      updateData.quantity ?? existingLine.quantity,
      updateData.unitPrice ?? existingLine.unitPrice,
      updateData.discountPercent ?? existingLine.discountPercent,
      updateData.taxPercent ?? existingLine.taxPercent,
    );

    Object.assign(updateData, lineTotals);
  }

  const line = await prisma.documentLine.update({
    where: { id: toIntId(lineId) },
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

  await prisma.documentLine.delete({
    where: { id: toIntId(lineId), documentId: toIntId(id) },
  });

  return sendDeleted(c, "Riga eliminata");
};

// ============================================================================
// DOCUMENT CALCULATIONS
// ============================================================================

/**
 * Recalculates and persists document totals from its lines.
 * @route POST /api/documents/:id/recalculate
 * @access Private
 */
export const recalculateDocument = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<DocumentIdParam>(c);

  const document = await prisma.document.findUnique({
    where: withSoftDelete({ id: toIntId(id) }) as Prisma.DocumentWhereUniqueInput,
    include: { lines: true },
  });

  if (!document) {
    throw new NotFoundError("Documento non trovato");
  }

  const totals = calculateDocumentTotals(
    document.lines,
    Number(document.discountPercent),
    Number(document.shippingCost),
  );

  const updatedDocument = await prisma.document.update({
    where: { id: toIntId(id) },
    data: totals,
    select: getDocumentSelection(),
  });

  return sendSuccess(c, updatedDocument, {
    message: "Totali ricalcolati con successo",
  });
};
