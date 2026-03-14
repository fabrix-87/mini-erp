import { Response } from "express";
import asyncHandler from "../middleware/async-handler";
import { NotFoundError, BadRequestError, ConflictError } from "../utils/app-error";
import { prisma } from "../config/prisma-client";
import { Prisma } from "../generated/prisma/client";
import { AuthenticatedValidatedRequest } from "@/types/validate";
import { sendCreated, sendDeleted, sendPaginatedResponse, sendSuccess } from "@/utils/response";
import {
  calculateDocumentTotals,
  calculateLineTotals,
  CreateDocumentInput,
  DOCUMENT_TYPE_CONFIG,
  DOCUMENT_TYPES_WITH_STOCK_MOVEMENTS,
  DocumentQueryInput,
  DocumentStatus,
  DocumentType,
  INSTALLMENT_STATUS_TRANSITIONS,
  InstallmentStatus,
  STATUSES_REQUIRING_NUMBER,
  TopProductsReportInput,
  UpdateDocumentInput,
  UpdateDocumentStatusInput,
} from "@mini-erp/shared";
import * as documentFulfillmentService from "@/services/document/fulfillment";
import { getDocumentSelection } from "@/helpers/document";
import {
  buildDocumentCreateData,
  buildDocumentUpdateData,
  generateDocumentNumber,
  resolveAllowedTransitions,
  updateDocumentPaidAmount,
} from "@/services/document";

// ============================================================================
// DOCUMENTS - CRUD Operations
// ============================================================================

/**
 * @desc    Lista tutti i documenti con filtri e paginazione
 * @route   GET /api/documents
 * @access  Private
 */
export const getAllDocuments = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
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
    } = req.validatedQuery as DocumentQueryInput;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Costruisci filtri dinamici
    const where: Prisma.DocumentWhereInput = {};

    // Filtro ricerca
    if (search) {
      where.OR = [
        { documentNumber: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filtri specifici
    if (documentType) where.documentType = documentType;
    if (status) where.status = status;
    if (customerId) where.customerId = Number(customerId);
    if (supplierId) where.supplierId = Number(supplierId);
    if (warehouseId) where.warehouseId = Number(warehouseId);

    // Filtro range date
    if (dateFrom || dateTo) {
      where.documentDate = {};
      if (dateFrom) where.documentDate.gte = new Date(dateFrom);
      if (dateTo) where.documentDate.lte = new Date(dateTo);
    }

    // Filtro range importo
    if (minAmount || maxAmount) {
      where.totalAmount = {};
      if (minAmount) where.totalAmount.gte = Number(minAmount);
      if (maxAmount) where.totalAmount.lte = Number(maxAmount);
    }

    // Query con paginazione
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

    sendPaginatedResponse(res, documents, total, page, limit);
  },
);

/**
 * @desc    Ottieni dettagli documento
 * @route   GET /api/documents/:id
 * @access  Private
 */
export const getDocumentById = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams;

    const document = await prisma.document.findUnique({
      where: { id: Number(id) },
      select: getDocumentSelection(),
    });

    if (!document) {
      throw new NotFoundError("Documento non trovato");
    }

    sendSuccess(res, document);
  },
);

/**
 * @desc    Crea un nuovo documento
 * @route   POST /api/documents
 * @access  Private
 */
export const createDocument = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const input = req.validatedBody as CreateDocumentInput;
    const userId = req.user!.userId;

    // Validate document type configuration
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
      throw new BadRequestError(
        `Tipo documento ${input.documentType} richiede metodo di pagamento`,
      );
    }

    const document = await prisma.$transaction(async (tx) => {
      const data = await buildDocumentCreateData(input, userId, tx);
      return tx.document.create({ data, select: getDocumentSelection() });
    });

    sendCreated(res, document, "Documento creato con successo");
  },
);

/**
 * @desc    Aggiorna un documento
 * @route   PUT /api/documents/:id
 * @access  Private
 */
export const updateDocument = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams;
    const payload = req.validatedBody as UpdateDocumentInput;

    const existingDocument = await prisma.document.findUnique({
      where: { id: Number(id) },
      select: { status: true },
    });

    if (!existingDocument) {
      throw new NotFoundError("Documento non trovato");
    }

    if (
      existingDocument.status !== "DRAFT" &&
      existingDocument.status !== "PENDING_APPROVAL"
    ) {
      throw new BadRequestError("Impossibile modificare un documento non in bozza");
    }

    const document = await prisma.document.update({
      where: { id: Number(id) },
      data: buildDocumentUpdateData(payload),
      select: getDocumentSelection(),
    });

    sendSuccess(res, document, { message: "Documento aggiornato con successo" });
  },
);

/**
 * @desc    Elimina un documento
 * @route   DELETE /api/documents/:id
 * @access  Private
 */
export const deleteDocument = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams;

    const document = await prisma.document.findUnique({
      where: { id: Number(id) },
    });

    if (!document) {
      throw new NotFoundError("Documento non trovato");
    }

    // Permetti eliminazione solo per DRAFT
    if (document.status !== "DRAFT") {
      throw new BadRequestError(
        "Impossibile eliminare un documento non in bozza. Annullalo invece.",
      );
    }

    // Elimina documento — soft delete
    await prisma.document.update({
      where: { id: Number(id) },
      data: {
        deletedAt: new Date(),
        deletedBy: req.user!.userId,
      },
    });

    sendDeleted(res, "Documento eliminato");
  },
);

// ============================================================================
// DOCUMENT STATUS Management
// ============================================================================

/**
 * @desc    Update document status with validation
 * @route   PATCH /api/documents/:id/status
 * @access  Private
 */
export const updateDocumentStatus = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams;
    const { status, reason } = req.validatedBody as UpdateDocumentStatusInput;

    // Fetch current document
    const currentDoc = await prisma.document.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        status: true,
        documentType: true,
        documentNumber: true,
      },
    });

    if (!currentDoc) {
      throw new NotFoundError("Documento non trovato");
    }

    // Cast esplicito a ReadonlyArray<DocumentStatus> su entrambi i rami
    // così il tipo risultante è sempre readonly DocumentStatus[] e .includes() accetta DocumentStatus
    const currentStatus = currentDoc.status as DocumentStatus;
    const currentType = currentDoc.documentType as DocumentType;

    const allowedTransitions = resolveAllowedTransitions(currentType, currentStatus);

    if (!allowedTransitions.includes(status as DocumentStatus)) {
      throw new BadRequestError(
        `Transizione non permessa per ${currentType}: ${currentStatus} → ${status}`,
      );
    }

    // Check if status requires document number
    if (
      STATUSES_REQUIRING_NUMBER.includes(status as DocumentStatus) &&
      !currentDoc.documentNumber
    ) {
      throw new BadRequestError(`Status ${status} richiede un numero documento`);
    }

    const document = await prisma.$transaction(async (tx) => {
      // Genera numero se necessario
      let documentNumber: string | undefined;
      if (
        STATUSES_REQUIRING_NUMBER.includes(status as DocumentStatus) &&
        !currentDoc.documentNumber
      ) {
        const generated = await generateDocumentNumber(
          currentDoc.documentType,
          new Date().getFullYear(),
          tx,
        );
        documentNumber = generated.documentNumber;
      }

      return tx.document.update({
        where: { id: Number(id) },
        data: {
          status,
          ...(documentNumber && { documentNumber }),
          ...(reason && { internalNotes: reason }),
          ...(status === "VOIDED" && { voidedAt: new Date(), voidedReason: reason ?? null }),
          ...(status === "CLOSED" && { closedAt: new Date() }),
          ...(status === "DELIVERED" && { deliveredAt: new Date() }),
        },
        select: getDocumentSelection(),
      });
    });

    sendSuccess(res, document, {
      message: "Status aggiornato con successo",
    });
  },
);

/**
 * @desc    Invia documento al cliente
 * @route   POST /api/documents/:id/send
 * @access  Private
 */
export const sendDocument = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams;

    // TODO: Implementare invio email

    const document = await prisma.document.update({
      where: { id: Number(id) },
      data: {
        status: "SENT",
        sentDate: new Date(),
      },
      select: getDocumentSelection(),
    });

    sendSuccess(res, document, {
      message: "Documento inviato con successo",
    });
  },
);

/**
 * @desc    Approva documento
 * @route   POST /api/documents/:id/approve
 * @access  Private
 */
export const approveDocument = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams;

    const document = await prisma.document.update({
      where: { id: Number(id) },
      data: { status: "ACCEPTED" },
      select: getDocumentSelection(),
    });

    sendSuccess(res, document, {
      message: "Documento approvato con successo",
    });
  },
);

/**
 * @desc    Rifiuta documento
 * @route   POST /api/documents/:id/reject
 * @access  Private
 */
export const rejectDocument = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams;

    const document = await prisma.document.update({
      where: { id: Number(id) },
      data: { status: "REJECTED" },
      select: getDocumentSelection(),
    });
    sendSuccess(res, document, {
      message: "Documento rifiutato",
    });
  },
);

/**
 * @desc    Annulla documento
 * @route   POST /api/documents/:id/void
 * @access  Private
 */
export const voidDocument = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams;

    const document = await prisma.document.update({
      where: { id: Number(id) },
      data: { status: "VOIDED" },
      select: getDocumentSelection(),
    });
    sendSuccess(res, document, {
      message: "Documento annullato",
    });
  },
);
// ============================================================================
// DOCUMENT FULFILLMENT Management
// ============================================================================

/**
 * @desc    Get order fulfillment status with per-line breakdown
 * @route   GET /api/documents/:id/fulfillment
 * @access  Private
 */
export const getOrderFulfillment = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams;

    const document = await prisma.document.findUnique({
      where: { id: Number(id) },
      select: { id: true, documentType: true },
    });

    if (!document) {
      throw new NotFoundError("Documento non trovato");
    }

    if (document.documentType !== "ORDER") {
      throw new BadRequestError("Il fulfillment è disponibile solo per ordini");
    }

    const fulfillmentDetails = await documentFulfillmentService.getDocumentFulfillmentDetails(
      Number(id),
    );

    sendSuccess(res, fulfillmentDetails);
  },
);

/**
 * @desc    Update delivered quantity for a document line
 * @route   PATCH /api/documents/:id/lines/:lineId/deliver
 * @access  Private
 */
export const updateLineDeliveredQuantity = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id, lineId } = req.validatedParams;
    const { quantityDelivered } = req.validatedBody;

    if (quantityDelivered === undefined || quantityDelivered < 0) {
      throw new BadRequestError("Quantità consegnata non valida");
    }

    // Verify line belongs to document
    const line = await prisma.documentLine.findUnique({
      where: { id: Number(lineId) },
      select: { documentId: true, quantity: true },
    });

    if (!line) {
      throw new NotFoundError("Riga non trovata");
    }

    if (line.documentId !== Number(id)) {
      throw new BadRequestError("La riga non appartiene a questo documento");
    }

    if (quantityDelivered > Number(line.quantity)) {
      throw new BadRequestError("Quantità consegnata superiore a quella ordinata");
    }

    // Update using service (automatically updates parent document status)
    await documentFulfillmentService.updateLineDeliveredQuantity(Number(lineId), quantityDelivered);

    const updatedLine = await prisma.documentLine.findUnique({
      where: { id: Number(lineId) },
    });

    sendSuccess(res, updatedLine, {
      message: "Quantità consegnata aggiornata con successo",
    });
  },
);

/**
 * @desc    Create partial delivery note from order
 * @route   POST /api/documents/:id/delivery-note
 * @access  Private
 */
export const createPartialDeliveryNote = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams;
    const { lineQuantities } = req.validatedBody;
    const userId = req.user!.userId;

    if (!Array.isArray(lineQuantities) || lineQuantities.length === 0) {
      throw new BadRequestError(
        "Array di righe con quantità richiesto: [{ lineId: number, quantity: number }]",
      );
    }

    // Verify order exists
    const order = await prisma.document.findUnique({
      where: { id: Number(id) },
      select: { id: true, documentType: true, status: true },
    });

    if (!order) {
      throw new NotFoundError("Ordine non trovato");
    }

    if (order.documentType !== "ORDER") {
      throw new BadRequestError("Solo ordini possono generare DDT");
    }

    // AGGIORNATO: include PREPARING e PARTIALLY_FULFILLED
    const allowedStatuses: DocumentStatus[] = [
      "ACCEPTED",
      "PREPARING",
      "PARTIALLY_FULFILLED",
      "FULFILLED",
    ];

    if (!allowedStatuses.includes(order.status as DocumentStatus)) {
      throw new BadRequestError(
        `Status ${order.status} non permette creazione DDT. Status richiesti: ${allowedStatuses.join(", ")}`,
      );
    }

    // Create delivery note using service
    const deliveryNoteId = await documentFulfillmentService.createPartialDeliveryNote(
      Number(id),
      lineQuantities,
      userId,
    );

    const deliveryNote = await prisma.document.findUnique({
      where: { id: deliveryNoteId },
      select: getDocumentSelection(),
    });

    sendCreated(res, deliveryNote, "DDT parziale creato con successo");
  },
);

/**
 * @desc    Mark order as fully fulfilled manually
 * @route   POST /api/documents/:id/fulfill
 * @access  Private
 */
export const fulfillOrder = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams;

    const document = await prisma.document.findUnique({
      where: { id: Number(id) },
      include: { lines: true },
    });

    if (!document) {
      throw new NotFoundError("Documento non trovato");
    }

    if (document.documentType !== "ORDER") {
      throw new BadRequestError("Solo ordini possono essere evasi");
    }

    // Validate status transition
    const allowedStatuses: DocumentStatus[] = ["ACCEPTED", "PREPARING", "PARTIALLY_FULFILLED"];
    if (!allowedStatuses.includes(document.status as DocumentStatus)) {
      throw new BadRequestError(
        `Status ${document.status} non permette evasione. Status richiesti: ${allowedStatuses.join(", ")}`,
      );
    }

    // Mark all lines as fully delivered
    await prisma.$transaction(async (tx) => {
      for (const line of document.lines) {
        await tx.documentLine.update({
          where: { id: line.id },
          data: { quantityDelivered: line.quantity },
        });
      }
    });

    // Update document status to FULFILLED
    await documentFulfillmentService.updateDocumentFulfillmentStatus(Number(id));

    const updatedDocument = await prisma.document.findUnique({
      where: { id: Number(id) },
      select: getDocumentSelection(),
    });

    sendSuccess(res, updatedDocument, {
      message: "Ordine marcato come completamente evaso",
    });
  },
);

/**
 * @desc    Get orders pending fulfillment
 * @route   GET /api/documents/orders/pending-fulfillment
 * @access  Private
 */
export const getPendingFulfillmentOrders = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { page = 1, limit = 20, sortBy = "documentDate", sortOrder = "asc" } = req.validatedQuery;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: Prisma.DocumentWhereInput = {
      documentType: "ORDER",
      status: { in: ["ACCEPTED", "PREPARING", "PARTIALLY_FULFILLED"] }, // ✅ AGGIUNTO
    };

    const [orders, total] = await Promise.all([
      prisma.document.findMany({
        where,
        select: getDocumentSelection(),
        skip,
        take,
        orderBy: { [sortBy as string]: sortOrder },
      }),
      prisma.document.count({ where }),
    ]);

    sendPaginatedResponse(res, orders, total, page, limit);
  },
);

// ============================================================================
// DOCUMENT LINES Management
// ============================================================================

/**
 * @desc    Lista righe documento
 * @route   GET /api/documents/:id/lines
 * @access  Private
 */
export const getDocumentLines = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams;

    const lines = await prisma.documentLine.findMany({
      where: { documentId: Number(id) },
      orderBy: { lineNumber: "asc" },
    });

    sendSuccess(res, lines, {
      results: lines.length,
    });
  },
);

/**
 * @desc    Aggiungi riga a documento
 * @route   POST /api/documents/:id/lines
 * @access  Private
 */
export const addDocumentLine = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams;
    const lineData = req.validatedBody;

    // Verifica che documento esista e sia modificabile
    const document = await prisma.document.findUnique({
      where: { id: Number(id) },
      include: { lines: true },
    });

    if (!document) {
      throw new NotFoundError("Documento non trovato");
    }

    if (document.status !== "DRAFT" && document.status !== "PENDING_APPROVAL") {
      throw new BadRequestError("Impossibile modificare righe di un documento non in bozza");
    }

    // Calcola numero riga
    const maxLineNumber = document.lines.reduce((max, line) => Math.max(max, line.lineNumber), 0);

    // Calcola totali riga
    const lineTotals = calculateLineTotals(
      lineData.quantity,
      lineData.unitPrice,
      lineData.discountPercent,
      lineData.taxPercent,
    );

    // Crea riga
    const line = await prisma.documentLine.create({
      data: {
        ...lineData,
        documentId: Number(id),
        lineNumber: maxLineNumber + 1,
        ...lineTotals,
      },
    });

    sendCreated(res, line, "Riga aggiunta con successo");
  },
);

/**
 * @desc    Aggiorna riga documento
 * @route   PUT /api/documents/:id/lines/:lineId
 * @access  Private
 */
export const updateDocumentLine = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { lineId } = req.validatedParams;
    const updateData = req.validatedBody;

    // Ricalcola totali se cambiano quantità/prezzo/sconti
    if (
      updateData.quantity !== undefined ||
      updateData.unitPrice !== undefined ||
      updateData.discountPercent !== undefined ||
      updateData.taxPercent !== undefined
    ) {
      const existingLine = await prisma.documentLine.findUnique({
        where: { id: Number(lineId) },
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
      where: { id: Number(lineId) },
      data: updateData,
    });

    sendSuccess(res, line, {
      message: "Riga aggiornata con successo",
    });
  },
);

/**
 * @desc    Elimina riga documento
 * @route   DELETE /api/documents/:id/lines/:lineId
 * @access  Private
 */
export const deleteDocumentLine = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { lineId } = req.validatedParams;

    await prisma.documentLine.delete({
      where: { id: Number(lineId) },
    });

    sendDeleted(res, "Linea eliminata");
  },
);

// ============================================================================
// DOCUMENT CONVERSIONS
// ============================================================================

/**
 * @desc    Converti documento (es. Quote → Order)
 * @route   POST /api/documents/:id/convert
 * @access  Private
 */
export const convertDocument = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams;
    const {
      targetType,
      copyLines = true,
      copyInstallments = true,
      status = "DRAFT",
    } = req.validatedBody;
    const userId = req.user!.userId;

    // Carica documento sorgente
    const sourceDocument = await prisma.document.findUnique({
      where: { id: Number(id) },
      include: {
        lines: true,
        installments: true,
      },
    });

    if (!sourceDocument) {
      throw new NotFoundError("Documento non trovato");
    }

    // Copia dati documento
    const {
      id: _,
      lines: __,
      installments: ___,
      documentNumber: ____,
      sequenceNumber: _____,
      createdAt: _______,
      updatedAt: ________,
      deletedAt: _________,
      statusHistory: __________,
      approvedAt: ___________,
      invoicedAt: ____________,
      deliveredAt: _____________,
      closedAt: ______________,
      voidedAt: _______________,
      voidedReason: ________________,
      sentDate: _________________,
      ...documentData
    } = sourceDocument as any;

    const currentYear = new Date().getFullYear();

    const newDocument = await prisma.$transaction(async (tx) => {
      let documentNumber: string | null = null;
      let sequenceNumber: number | undefined;

      if (status !== "DRAFT") {
        const generated = await generateDocumentNumber(targetType, currentYear, tx);
        documentNumber = generated.documentNumber;
        sequenceNumber = generated.sequenceNumber;
      }

      const doc = await tx.document.create({
        data: {
          ...documentData,
          documentType: targetType,
          status,
          documentNumber,
          sequenceNumber: sequenceNumber ?? null,
          documentYear: currentYear,
          createdByUserId: userId,
          parentDocumentId: sourceDocument.id, // ← relazione chain esistente nel modello
          lines: copyLines
            ? {
                create: sourceDocument.lines.map((line, index) => {
                  const { id, documentId, ...lineData } = line as any;
                  return { ...lineData, lineNumber: index + 1 };
                }),
              }
            : undefined,
          installments:
            copyInstallments && sourceDocument.installments.length > 0
              ? {
                  create: sourceDocument.installments.map((inst) => {
                    const { id, documentId, ...instData } = inst as any;
                    return instData;
                  }),
                }
              : undefined,
        },
        select: getDocumentSelection(),
      });

      // Crea relazione tipizzata nella tabella DocumentRelation
      await tx.documentRelation.create({
        data: {
          sourceDocumentId: sourceDocument.id,
          targetDocumentId: doc.id,
          relationType: "CONVERTS_TO",
        },
      });

      return doc;
    });

    sendCreated(
      res,
      newDocument,
      `Documento convertito da ${sourceDocument.documentType} a ${targetType}`,
    );
  },
);

/**
 * @desc    Duplica documento
 * @route   POST /api/documents/:id/duplicate
 * @access  Private
 */
export const duplicateDocument = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams;
    const {
      includeLines = true,
      includeInstallments = false,
      status = "DRAFT",
    } = req.validatedBody;
    const userId = req.user!.userId;

    // Carica documento sorgente
    const sourceDocument = await prisma.document.findUnique({
      where: { id: Number(id) },
      include: {
        lines: true,
        installments: true,
      },
    });

    if (!sourceDocument) {
      throw new NotFoundError("Documento non trovato");
    }

    // Copia dati
    const {
      id: _,
      lines: __,
      installments: ___,
      documentNumber: ____,
      sequenceNumber: _____,
      createdAt: _______,
      updatedAt: ________,
      deletedAt: _________,
      statusHistory: __________,
      approvedAt: ___________,
      invoicedAt: ____________,
      deliveredAt: _____________,
      closedAt: ______________,
      voidedAt: _______________,
      voidedReason: ________________,
      sentDate: _________________,
      ...documentData
    } = sourceDocument as any;

    // Crea duplicato
    const duplicatedDocument = await prisma.document.create({
      data: {
        ...documentData,
        status,
        documentNumber: null,
        sentDate: null,
        createdByUserId: userId,
        lines: includeLines
          ? {
              create: sourceDocument.lines.map((line, index) => {
                const { id, documentId, createdAt, updatedAt, ...lineData } = line as any;
                return { ...lineData, lineNumber: index + 1 };
              }),
            }
          : undefined,
        installments: includeInstallments
          ? {
              create: sourceDocument.installments.map((inst) => {
                const {
                  id,
                  documentId,
                  createdAt,
                  updatedAt,
                  paidDate,
                  paidAmount,
                  status: instStatus,
                  ...instData
                } = inst as any;
                return { ...instData, status: "PENDING" as InstallmentStatus };
              }),
            }
          : undefined,
      },
      select: getDocumentSelection(),
    });

    sendCreated(res, duplicatedDocument, "Documento duplicato con successo");
  },
);

// ============================================================================
// DOCUMENT CALCULATIONS
// ============================================================================

/**
 * @desc    Ricalcola totali documento
 * @route   POST /api/documents/:id/recalculate
 * @access  Private
 */
export const recalculateDocument = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams;

    const document = await prisma.document.findUnique({
      where: { id: Number(id) },
      include: { lines: true },
    });

    if (!document) {
      throw new NotFoundError("Documento non trovato");
    }

    // Ricalcola totali
    const totals = calculateDocumentTotals(
      document.lines,
      Number(document.discountPercent),
      Number(document.shippingCost),
    );

    // Aggiorna documento
    const updatedDocument = await prisma.document.update({
      where: { id: Number(id) },
      data: totals,
      select: getDocumentSelection(),
    });

    sendSuccess(res, updatedDocument, {
      message: "Totali ricalcolati con successo",
    });
  },
);

// ============================================================================
// PAYMENT INSTALLMENTS
// ============================================================================

/**
 * @desc    Lista rate pagamento documento
 * @route   GET /api/documents/:id/installments
 * @access  Private
 */
export const getDocumentInstallments = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams;

    const installments = await prisma.documentPaymentInstallment.findMany({
      where: { documentId: Number(id) },
      orderBy: { installmentNumber: "asc" },
    });

    sendSuccess(res, installments, {
      results: installments.length,
    });
  },
);

/**
 * @desc    Update installment payment status
 * @route   PATCH /api/documents/:id/installments/:installmentId
 * @access  Private
 */
export const updateInstallment = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { installmentId } = req.validatedParams;
    const updateData = req.validatedBody;

    // Validate status transition if status is being updated
    if (updateData.status) {
      const currentInstallment = await prisma.documentPaymentInstallment.findUnique({
        where: { id: Number(installmentId) },
        select: { status: true },
      });

      if (!currentInstallment) {
        throw new NotFoundError("Rata non trovata");
      }

      const allowedTransitions =
        INSTALLMENT_STATUS_TRANSITIONS[currentInstallment.status as InstallmentStatus];

      if (!allowedTransitions.includes(updateData.status as InstallmentStatus)) {
        throw new BadRequestError(
          `Transizione non permessa: ${currentInstallment.status} → ${updateData.status}`,
        );
      }
    }

    const installment = await prisma.documentPaymentInstallment.update({
      where: { id: Number(installmentId) },
      data: updateData,
    });

    sendSuccess(res, installment, {
      message: "Rata aggiornata con successo",
    });
  },
);

/**
 * @desc    Mark installment as paid
 * @route   POST /api/documents/:id/installments/:installmentId/pay
 * @access  Private
 */
export const payInstallment = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id, installmentId } = req.validatedParams;
    const {
      paidAmount,
      paidDate = new Date(),
      paymentMethodId,
      paymentReference,
      bankTransactionId,
      notes,
    } = req.validatedBody;

    const installment = await prisma.documentPaymentInstallment.findUnique({
      where: { id: Number(installmentId) },
      select: {
        amount: true,
        paidAmount: true,
        status: true,
        documentId: true,
        notes: true,
      },
    });

    if (!installment) {
      throw new NotFoundError("Rata non trovata");
    }

    if (installment.documentId !== Number(id)) {
      throw new BadRequestError("La rata non appartiene a questo documento");
    }

    if (installment.status === "PAID") {
      throw new BadRequestError("Rata già pagata");
    }

    if (installment.status === "CANCELLED") {
      throw new BadRequestError("Impossibile pagare rata annullata");
    }

    // Calculate new paid amount
    const newPaidAmount = Number(installment.paidAmount) + paidAmount;
    const totalAmount = Number(installment.amount);

    // Determine new status
    let newStatus: InstallmentStatus;
    if (newPaidAmount >= totalAmount) {
      newStatus = "PAID";
    } else if (newPaidAmount > 0) {
      newStatus = "PARTIAL";
    } else {
      newStatus = "PENDING";
    }

    // Update installment
    const updatedInstallment = await prisma.documentPaymentInstallment.update({
      where: { id: Number(installmentId) },
      data: {
        paidAmount: newPaidAmount,
        paidDate: newStatus === "PAID" ? new Date(paidDate) : null,
        status: newStatus,
        paymentMethodId,
        paymentReference,
        bankTransactionId,
        notes: notes || installment.notes,
      },
    });

    // Update document paid amount
    await updateDocumentPaidAmount(Number(id));

    sendSuccess(res, updatedInstallment, {
      message: "Pagamento registrato con successo",
    });
  },
);

// ============================================================================
// DOCUMENT BY TYPE
// ============================================================================

/**
 * @desc    Lista preventivi
 * @route   GET /api/documents/quotes
 * @access  Private
 */
export const getQuotes = asyncHandler(async (req: AuthenticatedValidatedRequest, res: Response) => {
  const documents = await prisma.document.findMany({
    where: { documentType: "QUOTE" },
    select: getDocumentSelection(),
    orderBy: { documentDate: "desc" },
  });

  sendSuccess(res, documents, {
    results: documents.length,
  });
});

/**
 * @desc    Lista ordini
 * @route   GET /api/documents/orders
 * @access  Private
 */
export const getOrders = asyncHandler(async (req: AuthenticatedValidatedRequest, res: Response) => {
  const documents = await prisma.document.findMany({
    where: { documentType: "ORDER" },
    select: getDocumentSelection(),
    orderBy: { documentDate: "desc" },
  });

  sendSuccess(res, documents, {
    results: documents.length,
  });
});

/**
 * @desc    Lista fatture
 * @route   GET /api/documents/invoices
 * @access  Private
 */
export const getInvoices = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const documents = await prisma.document.findMany({
      where: { documentType: "INVOICE" },
      select: getDocumentSelection(),
      orderBy: { documentDate: "desc" },
    });

    sendSuccess(res, documents, {
      results: documents.length,
    });
  },
);

/**
 * @desc    Lista DDT
 * @route   GET /api/documents/delivery-notes
 * @access  Private
 */
export const getDeliveryNotes = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const documents = await prisma.document.findMany({
      where: { documentType: "DELIVERY_NOTE" },
      select: getDocumentSelection(),
      orderBy: { documentDate: "desc" },
    });

    sendSuccess(res, documents, {
      results: documents.length,
    });
  },
);

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * @desc    Statistiche documenti
 * @route   GET /api/documents/statistics
 * @access  Private
 */
export const getDocumentStatistics = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const stats = await prisma.document.groupBy({
      by: ["documentType", "status"],
      _count: { id: true },
      _sum: { totalAmount: true },
    });

    sendSuccess(res, stats);
  },
);

/**
 * @desc    Documenti per cliente
 * @route   GET /api/documents/customer/:customerId
 * @access  Private
 */
export const getDocumentsByCustomer = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { customerId } = req.validatedParams;

    const documents = await prisma.document.findMany({
      where: {
        customerId: Number(customerId),
        deletedAt: null, // ← esclude soft-deleted
      },
      select: getDocumentSelection(),
      orderBy: { documentDate: "desc" },
    });

    sendSuccess(res, documents, {
      results: documents.length,
    });
  },
);

/**
 * @desc    Documenti per fornitore
 * @route   GET /api/documents/supplier/:supplierId
 * @access  Private
 */
export const getDocumentsBySupplier = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { supplierId } = req.validatedParams;

    const documents = await prisma.document.findMany({
      where: {
        supplierId: Number(supplierId),
        deletedAt: null, // ← esclude soft-deleted
      },
      select: getDocumentSelection(),
      orderBy: { documentDate: "desc" },
    });

    sendSuccess(res, documents, {
      results: documents.length,
    });
  },
);

// ============================================================================
// EXPORT & PRINT (Placeholder)
// ============================================================================

/**
 * @desc    Esporta documento in PDF
 * @route   GET /api/documents/:id/export/pdf
 * @access  Private
 */
export const exportDocumentPDF = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams;

    // TODO: Implementare generazione PDF

    res.json({
      status: "success",
      message: "Funzionalità PDF in development",
    });
  },
);

/**
 * @desc    Esporta documento in Excel
 * @route   GET /api/documents/:id/export/excel
 * @access  Private
 */
export const exportDocumentExcel = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams;

    // TODO: Implementare esportazione Excel

    res.json({
      status: "success",
      message: "Funzionalità Excel in development",
    });
  },
);

/**
 * @desc    Stampa documento
 * @route   GET /api/documents/:id/print
 * @access  Private
 */
export const printDocument = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams;

    // TODO: Implementare template stampa

    res.json({
      status: "success",
      message: "Funzionalità stampa in development",
    });
  },
);

// ============================================================================
// FUNZIONALITÀ AVANZATE - DOCUMENTI
// ============================================================================

// ============================================================================
// 1. TEMPLATE DOCUMENTI
// ============================================================================

/**
 * Sistema di template per documenti ricorrenti
 */

// Crea template da documento esistente
export const createTemplateFromDocument = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams;
    const { templateName, templateDescription } = req.validatedBody;

    const document = await prisma.document.findUnique({
      where: { id: Number(id) },
      include: { lines: true },
    });

    if (!document) {
      throw new NotFoundError("Documento non trovato");
    }

    // Salva template (usa customFields o crea tabella dedicata)
    const template = {
      name: templateName,
      description: templateDescription,
      documentType: document.documentType,
      lines: document.lines.map((line) => ({
        nameSystem: line.nameSystem,
        descriptionSystem: line.descriptionSystem,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        taxPercent: line.taxPercent,
      })),
      paymentTerms: document.paymentTerms,
      termsAndConditions: document.termsAndConditions,
    };

    sendCreated(res, template, "Template creato con successo");
  },
);

/**
 * Crea documento da template
 */
export const createDocumentFromTemplate = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { templateId, customerId, ...overrides } = req.validatedBody;
    const userId = req.user!.userId;

    // TODO: Carica template dal database
    const template = {}; // Load from DB

    // Crea documento applicando template
    const document = await prisma.document.create({
      data: {
        ...template,
        ...overrides,
        customerId,
        createdByUserId: userId,
        status: "DRAFT",
      },
      select: getDocumentSelection(),
    });

    res.status(201).json({
      status: "success",
      message: "Documento creato da template",
      data: document,
    });
  },
);

// ============================================================================
// 2. BATCH OPERATIONS
// ============================================================================

/**
 * Operazioni su multipli documenti
 */

export const bulkUpdateDocuments = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { documentIds, updateData } = req.validatedBody;

    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      throw new BadRequestError("Array di ID documenti richiesto");
    }

    const result = await prisma.document.updateMany({
      where: {
        id: { in: documentIds },
        status: "DRAFT", // Solo DRAFT modificabili in batch
      },
      data: updateData,
    });

    sendSuccess(
      res,
      {},
      {
        message: `${result.count} documenti aggiornati`,
        results: result.count,
      },
    );
  },
);

export const bulkChangeStatus = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { documentIds, newStatus } = req.validatedBody;

    const result = await prisma.document.updateMany({
      where: { id: { in: documentIds } },
      data: { status: newStatus },
    });

    sendSuccess(
      res,
      {},
      {
        message: `${result.count} documenti aggiornati`,
        results: result.count,
      },
    );
  },
);

export const bulkSendDocuments = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { documentIds } = req.validatedBody;

    // Genera numeri per tutti i documenti
    const documents = await prisma.document.findMany({
      where: { id: { in: documentIds }, status: "DRAFT" },
    });

    for (const doc of documents) {
      if (!doc.documentNumber) {
        await prisma.$transaction(async (tx) => {
          const { documentNumber, sequenceNumber } = await generateDocumentNumber(
            doc.documentType,
            doc.documentYear,
            tx,
          );
          await tx.document.update({
            where: { id: doc.id },
            data: {
              documentNumber,
              sequenceNumber,
              status: "SENT",
              sentDate: new Date(),
            },
          });
        });
      }
    }

    sendSuccess(
      res,
      {},
      {
        message: `${documents.length} documenti inviati`,
      },
    );
  },
);

// ============================================================================
// 3. NOTIFICHE E PROMEMORIA
// ============================================================================

/**
 * Sistema di notifiche scadenze
 */

export const getExpiringDocuments = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { days = 7 } = req.query;

    const expiringDate = new Date();
    expiringDate.setDate(expiringDate.getDate() + Number(days));

    const documents = await prisma.document.findMany({
      where: {
        OR: [
          {
            documentType: "QUOTE",
            validUntil: { lte: expiringDate },
            status: "SENT",
          },
          {
            documentType: "INVOICE",
            dueDate: { lte: expiringDate },
            status: { in: ["UNPAID", "PARTIALLY_PAID"] },
          },
        ],
      },
      select: getDocumentSelection(),
      orderBy: { dueDate: "asc" },
    });

    sendSuccess(res, documents, {
      results: documents.length,
    });
  },
);

export const getOverdueInvoices = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const today = new Date();

    const invoices = await prisma.document.findMany({
      where: {
        documentType: "INVOICE",
        dueDate: { lt: today },
        status: { in: ["UNPAID", "PARTIALLY_PAID"] },
      },
      select: getDocumentSelection(),
      orderBy: { dueDate: "asc" },
    });

    sendSuccess(res, invoices, {
      results: invoices.length,
    });
  },
);

// ============================================================================
// 4. REPORTISTICA AVANZATA
// ============================================================================

/**
 * Report vendite per periodo
 */
export const getSalesReport = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { dateFrom, dateTo, groupBy = "month" } = req.query;

    const where: any = {
      documentType: { in: ["ORDER", "INVOICE"] },
      status: { notIn: ["DRAFT", "VOIDED"] },
    };

    if (dateFrom || dateTo) {
      where.documentDate = {};
      if (dateFrom) where.documentDate.gte = new Date(dateFrom as string);
      if (dateTo) where.documentDate.lte = new Date(dateTo as string);
    }

    const documents = await prisma.document.findMany({
      where,
      select: {
        documentDate: true,
        documentType: true,
        totalAmount: true,
        customerId: true,
      },
    });

    // Aggrega per periodo
    const report = documents.reduce((acc: any, doc) => {
      const date = new Date(doc.documentDate);
      let key: string;

      switch (groupBy) {
        case "day":
          key = date.toISOString().split("T")[0];
          break;
        case "month":
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          break;
        case "year":
          key = String(date.getFullYear());
          break;
        default:
          key = "total";
      }

      if (!acc[key]) {
        acc[key] = {
          period: key,
          count: 0,
          totalAmount: 0,
          orders: 0,
          invoices: 0,
        };
      }

      acc[key].count++;
      acc[key].totalAmount += Number(doc.totalAmount);
      if (doc.documentType === "ORDER") acc[key].orders++;
      if (doc.documentType === "INVOICE") acc[key].invoices++;

      return acc;
    }, {});

    sendSuccess(res, Object.values(report));
  },
);

/**
 * Report clienti top
 */
export const getTopCustomersReport = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { limit = 10, dateFrom, dateTo } = req.query;

    const where: any = {
      customerId: { not: null },
      status: { notIn: ["DRAFT", "VOIDED"] },
    };

    if (dateFrom || dateTo) {
      where.documentDate = {};
      if (dateFrom) where.documentDate.gte = new Date(dateFrom as string);
      if (dateTo) where.documentDate.lte = new Date(dateTo as string);
    }

    const topCustomers = await prisma.document.groupBy({
      by: ["customerId"],
      where,
      _count: { id: true },
      _sum: { totalAmount: true },
      orderBy: { _sum: { totalAmount: "desc" } },
      take: Number(limit),
    });

    // Carica dati clienti
    const customerIds = topCustomers.map((c) => c.customerId!);
    const customers = await prisma.customer.findMany({
      where: { id: { in: customerIds } },
      include: { company: { select: { companyName: true } } },
    });

    const report = topCustomers.map((tc) => {
      const customer = customers.find((c) => c.id === tc.customerId);
      return {
        customerId: tc.customerId,
        customerName: customer?.company.companyName || "N/A",
        documentCount: tc._count.id,
        totalAmount: tc._sum.totalAmount,
      };
    });

    sendSuccess(res, report);
  },
);

/**
 * Report prodotti più venduti
 */
export const getTopProductsReport = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { limit = 10, dateFrom, dateTo } = req.validatedQuery as TopProductsReportInput;

    const { preferredLanguageId } = req.user!;

    const documentFilter: Prisma.DocumentWhereInput = {
      status: { notIn: ["DRAFT", "VOIDED"] },
    };

    if (dateFrom || dateTo) {
      documentFilter.documentDate = {
        ...(dateFrom && { gte: dateFrom }),
        ...(dateTo && { lte: dateTo }),
      };
    }

    const where: Prisma.DocumentLineWhereInput = {
      document: documentFilter,
      productId: { not: null },
      productVariantId: { not: null },
    };

    const topProducts = await prisma.documentLine.groupBy({
      by: ["productId"],
      where,
      _sum: {
        quantity: true,
        lineTotal: true,
      },
      orderBy: {
        _sum: { lineTotal: "desc" },
      },
      take: limit,
    });

    if (topProducts.length === 0) {
      sendSuccess(res, []);
      return;
    }

    // Collect productIds
    const productIds = topProducts
      .map((p) => p.productId)
      .filter((id): id is number => id !== null);

    // Carica dati prodotti
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        reference: true,
        translations: {
          select: { name: true, languageId: true },
          // Preferred language first, fallback handled in map below
          orderBy: [
            // Put preferred language first via raw order trick:
            // Prisma doesn't support conditional orderBy, so we fetch all and sort in JS
          ],
        },
      },
    });

    /**
     * Resolves the best translation name for a product:
     * 1. Preferred language
     * 2. First available translation
     * 3. Fallback "N/A"
     */
    const resolveName = (translations: { name: string; languageId: number }[]): string => {
      if (!translations.length) return "N/A";
      const preferred = translations.find((t) => t.languageId === preferredLanguageId);
      return preferred?.name ?? translations[0].name;
    };

    const report = topProducts.map((tp) => {
      const product = products.find((p) => p.id === tp.productId);
      return {
        productId: tp.productId,
        reference: product?.reference ?? "N/A",
        productName: resolveName(product?.translations ?? []),
        quantitySold: tp._sum.quantity,
        totalRevenue: tp._sum.lineTotal,
      };
    });

    sendSuccess(res, report);
  },
);

// ============================================================================
// 5. MOVIMENTI MAGAZZINO DA DOCUMENTI
// ============================================================================

/**
 * Genera movimenti magazzino da DDT/Fattura
 * UPDATED: usa quantityDelivered invece di quantity
 */
export const generateStockMovements = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams;

    const document = await prisma.document.findUnique({
      where: { id: Number(id) },
      include: { lines: true },
    });

    if (!document) {
      throw new NotFoundError("Documento non trovato");
    }

    if (!document.warehouseId) {
      throw new BadRequestError("Documento senza magazzino associato");
    }

    // Use constant from shared
    if (!DOCUMENT_TYPES_WITH_STOCK_MOVEMENTS.includes(document.documentType as DocumentType)) {
      throw new BadRequestError(
        `Tipo documento ${document.documentType} non genera movimenti magazzino`,
      );
    }

    // Verifica che non esistano già movimenti
    const existingMovements = await prisma.stockMovement.findMany({
      where: {
        referenceId: `DOC-${document.id}`,
      },
    });

    if (existingMovements.length > 0) {
      throw new ConflictError("Movimenti già generati per questo documento");
    }

    // Crea movimenti per ogni riga con prodotto
    const movements = [];
    for (const line of document.lines) {
      if (line.productVariantId) {
        // Ssa quantityDelivered se disponibile, altrimenti quantity
        const movementQuantity = line.quantityDelivered.gt(0)
          ? Number(line.quantityDelivered)
          : Number(line.quantity);

        const movement = await prisma.stockMovement.create({
          data: {
            productVariantId: line.productVariantId,
            warehouseId: document.warehouseId,
            quantity: -movementQuantity, // Negativo per uscita
            movementType: "SALE",
            referenceId: `DOC-${document.id}`,
            note: `${document.documentType} ${document.documentNumber}`,
            movementDate: document.documentDate,
          },
        });
        movements.push(movement);

        // Aggiorna stock variante
        await prisma.productVariant.update({
          where: { id: line.productVariantId },
          data: {
            quantity: {
              decrement: movementQuantity,
            },
          },
        });
      }
    }

    sendCreated(res, movements, `${movements.length} movimenti magazzino generati`);
  },
);

// ============================================================================
// 6. VALIDAZIONE FISCALE
// ============================================================================

/**
 * @desc    Validate fiscal data for document
 * @route   GET /api/documents/:id/validate-fiscal
 * @access  Private
 */
export const validateFiscalData = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams;

    const document = await prisma.document.findUnique({
      where: { id: Number(id) },
      include: { lines: true },
    });

    if (!document) {
      throw new NotFoundError("Documento non trovato");
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    const config = DOCUMENT_TYPE_CONFIG[document.documentType as DocumentType];

    // Check e-invoicing requirements
    if (config.requiresEInvoicing) {
      if (!document.customerVatNumber && !document.customerTaxCode) {
        errors.push("P.IVA o Codice Fiscale obbligatorio per fatture elettroniche");
      }

      if (
        document.customerCountryCode === "IT" &&
        !document.customerSdiCode &&
        !document.customerPec
      ) {
        errors.push("Codice SDI o PEC obbligatorio per fatture elettroniche italiane");
      }
    }

    // Validate lines
    if (document.lines.length === 0) {
      errors.push("Almeno una riga obbligatoria");
    }

    // Check negative quantities
    if (!config.allowNegativeQuantity) {
      const negativeLines = document.lines.filter((line) => Number(line.quantity) < 0);
      if (negativeLines.length > 0) {
        errors.push(`Tipo documento ${document.documentType} non permette quantità negative`);
      }
    }

    // Validate totals
    const calculatedTotals = calculateDocumentTotals(
      document.lines,
      Number(document.discountPercent),
      Number(document.shippingCost),
    );

    if (Math.abs(Number(document.totalAmount) - Number(calculatedTotals.totalAmount)) > 0.01) {
      warnings.push("Totale documento non corrisponde alla somma delle righe");
    }

    // Validate document number
    if (
      STATUSES_REQUIRING_NUMBER.includes(document.status as DocumentStatus) &&
      !document.documentNumber
    ) {
      errors.push("Numero documento mancante per status corrente");
    }

    sendSuccess(res, {
      valid: errors.length === 0,
      errors,
      warnings,
    });
  },
);

// ============================================================================
// 7. ALLEGATI DOCUMENTI
// ============================================================================

/**
 * Gestione allegati (TODO: implementare storage)
 */
export const uploadDocumentAttachment = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams;
    // const file = req.file; // multer

    // TODO: Upload file su S3/storage
    // TODO: Salva riferimento in DB

    res.json({
      status: "success",
      message: "Allegato caricato (TODO)",
    });
  },
);

export const getDocumentAttachments = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams;

    // TODO: Carica lista allegati dal DB

    res.json({
      status: "success",
      data: [],
    });
  },
);

export const deleteDocumentAttachment = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id, attachmentId } = req.validatedParams;

    // TODO: Elimina da storage e DB

    res.status(204).json({
      status: "success",
      data: null,
    });
  },
);

// ============================================================================
// 8. AUDIT LOG DOCUMENTI
// ============================================================================

/**
 * Storia modifiche documento
 */
export const getDocumentHistory = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams;

    // TODO: Implementare tabella DocumentHistory
    // Traccia: chi, quando, cosa ha modificato

    const history = [
      {
        timestamp: "2024-12-01T10:00:00Z",
        userId: 1,
        username: "admin",
        action: "CREATE",
        details: "Documento creato",
      },
      {
        timestamp: "2024-12-01T11:30:00Z",
        userId: 1,
        username: "admin",
        action: "UPDATE",
        details: "Aggiunta riga prodotto",
      },
      {
        timestamp: "2024-12-01T14:00:00Z",
        userId: 1,
        username: "admin",
        action: "STATUS_CHANGE",
        details: "Status: DRAFT → SENT",
      },
    ];

    res.json({
      status: "success",
      data: history,
    });
  },
);

// ============================================================================
// 9. INTEGRAZIONE EMAIL
// ============================================================================

/**
 * Invia documento via email
 */
export const sendDocumentByEmail = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams;
    const { recipientEmail, subject, message, attachPDF = true } = req.validatedBody;

    const document = await prisma.document.findUnique({
      where: { id: Number(id) },
      select: getDocumentSelection(),
    });

    if (!document) {
      throw new NotFoundError("Documento non trovato");
    }

    // TODO: Genera PDF
    // TODO: Invia email con nodemailer/sendgrid

    // Aggiorna documento
    await prisma.document.update({
      where: { id: Number(id) },
      data: {
        status: document.status === "DRAFT" ? "SENT" : document.status,
        sentDate: new Date(),
      },
    });

    res.json({
      status: "success",
      message: "Email inviata con successo",
    });
  },
);

// ============================================================================
// 10. EXPORT MASSIVO
// ============================================================================

/**
 * Export multipli documenti
 */
export const exportDocumentsBatch = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { documentIds, format = "pdf" } = req.validatedBody;

    // TODO: Genera ZIP con tutti i PDF/Excel

    res.json({
      status: "success",
      message: `Export ${format.toUpperCase()} in progress`,
    });
  },
);
