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
  CreateDocumentInput,
  DOCUMENT_TYPE_CONFIG,
  DocumentIdParam,
  DocumentQueryInput,
  DocumentType,
  UpdateDocumentInput,
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
import logger from "@/config/logger-config";

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

  logger.info("Ci sono!")

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

// ============================================================================
// DOCUMENT TYPE FILTERS — thin wrappers over getAllDocuments
// ============================================================================

/**
 * Lists all QUOTE documents. Forces documentType=QUOTE before delegating.
 * @route GET /api/documents/quotes
 * @access Private
 */
export const getAllQuotes = async (c: Context<AppBindings>) => {
  c.set("validatedQuery", { ...getValidatedQuery<DocumentQueryInput>(c), documentType: "QUOTE" });
  return getAllDocuments(c);
};

/**
 * Lists all ORDER documents. Forces documentType=ORDER before delegating.
 * @route GET /api/documents/orders
 * @access Private
 */
export const getAllOrders = async (c: Context<AppBindings>) => {
  c.set("validatedQuery", { ...getValidatedQuery<DocumentQueryInput>(c), documentType: "ORDER" });
  return getAllDocuments(c);
};

/**
 * Lists all INVOICE documents. Forces documentType=INVOICE before delegating.
 * @route GET /api/documents/invoices
 * @access Private
 */
export const getAllInvoices = async (c: Context<AppBindings>) => {
  c.set("validatedQuery", { ...getValidatedQuery<DocumentQueryInput>(c), documentType: "INVOICE" });
  return getAllDocuments(c);
};

/**
 * Lists all DELIVERY_NOTE documents. Forces documentType=DELIVERY_NOTE before delegating.
 * @route GET /api/documents/delivery-notes
 * @access Private
 */
export const getAllDeliveryNotes = async (c: Context<AppBindings>) => {
  c.set("validatedQuery", { ...getValidatedQuery<DocumentQueryInput>(c), documentType: "DELIVERY_NOTE" });
  return getAllDocuments(c);
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

  if (document.status !== "DRAFT" && document.status !== "PENDING_APPROVAL") {
    throw new BadRequestError("Impossibile ricalcolare un documento già confermato o inviato");
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
