import { Response } from 'express';
import { AuthRequest } from '../types/user';
import asyncHandler from '../middleware/async-handler';
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
} from '../utils/app-error';
import { prisma } from '../config/prisma-client';
import { Prisma } from '../generated/prisma/client';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Selezione standard per Document con relazioni
 */
const getDocumentSelection = () => ({
  id: true,
  documentType: true,
  status: true,
  documentNumber: true,
  documentYear: true,
  companyId: true,
  customerId: true,
  supplierId: true,
  contactId: true,
  opportunityId: true,
  warehouseId: true,
  documentDate: true,
  dueDate: true,
  deliveryDate: true,
  validUntil: true,
  sentDate: true,
  relatedQuoteId: true,
  relatedOrderId: true,
  relatedInvoiceId: true,
  customerName: true,
  customerVatNumber: true,
  customerTaxCode: true,
  customerAddress: true,
  customerCity: true,
  customerPostalCode: true,
  customerProvince: true,
  customerCountryCode: true,
  customerEmail: true,
  customerPhone: true,
  shippingName: true,
  shippingAddress: true,
  shippingCity: true,
  shippingPostalCode: true,
  shippingProvince: true,
  shippingCountryCode: true,
  currency: true,
  subtotal: true,
  discountPercent: true,
  discountAmount: true,
  shippingCost: true,
  shippingTaxAmount: true,
  taxableAmount: true,
  taxAmount: true,
  totalAmount: true,
  paidAmount: true,
  paymentMethod: true,
  paymentTerms: true,
  notes: true,
  internalNotes: true,
  termsAndConditions: true,
  createdAt: true,
  updatedAt: true,
  company: {
    select: {
      id: true,
      companyName: true,
      vatNumber: true,
    },
  },
  customer: {
    select: {
      id: true,
      company: {
        select: {
          companyName: true,
          vatNumber: true,
          mainEmail: true,
        },
      },
    },
  },
  supplier: {
    select: {
      id: true,
      company: {
        select: {
          companyName: true,
          vatNumber: true,
          mainEmail: true,
        },
      },
    },
  },
  warehouse: {
    select: {
      id: true,
      name: true,
      location: true,
    },
  },
  createdBy: {
    select: {
      id: true,
      username: true,
      email: true,
    },
  },
  assignedUser: {
    select: {
      id: true,
      username: true,
      email: true,
    },
  },
  lines: {
    select: {
      id: true,
      lineNumber: true,
      lineType: true,
      code: true,
      nameSystem: true,
      descriptionSystem: true,
      nameCustomer: true,
      quantity: true,
      unit: true,
      unitPrice: true,
      discountPercent: true,
      discountAmount: true,
      lineTotal: true,
      taxPercent: true,
      taxAmount: true,
      lineTotalWithTax: true,
      productVariantId: true,
      productId: true,
    },
    orderBy: { lineNumber: 'asc' as const },
  },
  installments: {
    select: {
      id: true,
      installmentNumber: true,
      percentage: true,
      amount: true,
      dueDate: true,
      paidDate: true,
      paidAmount: true,
      status: true,
    },
    orderBy: { installmentNumber: 'asc' as const },
  },
});

/**
 * Genera numero documento univoco
 */
const generateDocumentNumber = async (documentType: string, year: number): Promise<string> => {
  // Trova l'ultimo numero per questo tipo e anno
  const lastDocument = await prisma.document.findFirst({
    where: {
      documentType: documentType as any,
      documentYear: year,
    },
    orderBy: {
      documentNumber: 'desc',
    },
  });

  let nextNumber = 1;
  if (lastDocument && lastDocument.documentNumber) {
    // Estrai numero da formato "QUOTE-2024-0001"
    const parts = lastDocument.documentNumber.split('-');
    if (parts.length === 3) {
      nextNumber = parseInt(parts[2], 10) + 1;
    }
  }

  // Formato: TYPE-YEAR-NNNN
  const prefix = documentType.replace('_', '-');
  return `${prefix}-${year}-${nextNumber.toString().padStart(4, '0')}`;
};

/**
 * Calcola totali documento
 */
const calculateDocumentTotals = (
  lines: any[],
  discountPercent: number = 0,
  shippingCost: number = 0,
  shippingTaxPercent: number = 22
) => {
  // Subtotale righe
  const subtotal = lines.reduce((sum, line) => {
    return sum + parseFloat(line.lineTotal.toString());
  }, 0);

  // Sconto sul totale
  const discountAmount = (subtotal * discountPercent) / 100;

  // Imponibile
  const taxableAmount = subtotal - discountAmount;

  // IVA sulle righe
  const taxAmount = lines.reduce((sum, line) => {
    return sum + parseFloat(line.taxAmount.toString());
  }, 0);

  // IVA spedizione
  const shippingTaxAmount = (shippingCost * shippingTaxPercent) / 100;

  // Totale finale
  const totalAmount = taxableAmount + taxAmount + shippingCost + shippingTaxAmount;

  return {
    subtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    shippingTaxAmount,
    totalAmount,
  };
};

/**
 * Calcola totale riga
 */
const calculateLineTotals = (
  quantity: number,
  unitPrice: number,
  discountPercent: number = 0,
  taxPercent: number = 22
) => {
  const lineSubtotal = quantity * unitPrice;
  const discountAmount = (lineSubtotal * discountPercent) / 100;
  const lineTotal = lineSubtotal - discountAmount;
  const taxAmount = (lineTotal * taxPercent) / 100;
  const lineTotalWithTax = lineTotal + taxAmount;

  return {
    lineTotal,
    discountAmount,
    taxAmount,
    lineTotalWithTax,
  };
};

// ============================================================================
// DOCUMENTS - CRUD Operations
// ============================================================================

/**
 * @desc    Lista tutti i documenti con filtri e paginazione
 * @route   GET /api/documents
 * @access  Private
 */
export const getAllDocuments = asyncHandler(async (req: AuthRequest, res: Response) => {
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
    sortBy = 'documentDate',
    sortOrder = 'desc',
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  // Costruisci filtri dinamici
  const where: Prisma.DocumentWhereInput = {};

  // Filtro ricerca
  if (search) {
    where.OR = [
      { documentNumber: { contains: search as string, mode: 'insensitive' } },
      { customerName: { contains: search as string, mode: 'insensitive' } },
      { notes: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  // Filtri specifici
  if (documentType) where.documentType = documentType as any;
  if (status) where.status = status as any;
  if (customerId) where.customerId = Number(customerId);
  if (supplierId) where.supplierId = Number(supplierId);
  if (warehouseId) where.warehouseId = Number(warehouseId);

  // Filtro range date
  if (dateFrom || dateTo) {
    where.documentDate = {};
    if (dateFrom) where.documentDate.gte = new Date(dateFrom as string);
    if (dateTo) where.documentDate.lte = new Date(dateTo as string);
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

  res.json({
    status: 'success',
    results: documents.length,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
    data: documents,
  });
});

/**
 * @desc    Ottieni dettagli documento
 * @route   GET /api/documents/:id
 * @access  Private
 */
export const getDocumentById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const document = await prisma.document.findUnique({
    where: { id: Number(id) },
    select: getDocumentSelection(),
  });

  if (!document) {
    throw new NotFoundError('Documento non trovato');
  }

  res.json({
    status: 'success',
    data: document,
  });
});

/**
 * @desc    Crea un nuovo documento
 * @route   POST /api/documents
 * @access  Private
 */
export const createDocument = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { lines = [], installments = [], ...documentData } = req.body;
  const userId = req.user!.userId;

  // Genera numero documento se non in DRAFT
  let documentNumber = null;
  const currentYear = new Date().getFullYear();

  if (documentData.status !== 'DRAFT') {
    documentNumber = await generateDocumentNumber(documentData.documentType, currentYear);
  }

  // Calcola totali se ci sono righe
  let totals = {
    subtotal: 0,
    discountAmount: 0,
    taxableAmount: 0,
    taxAmount: 0,
    shippingTaxAmount: 0,
    totalAmount: 0,
  };

  if (lines.length > 0) {
    // Calcola totali righe
    const processedLines = lines.map((line: any, index: number) => {
      const lineTotals = calculateLineTotals(
        line.quantity,
        line.unitPrice,
        line.discountPercent,
        line.taxPercent
      );

      return {
        ...line,
        lineNumber: index + 1,
        ...lineTotals,
      };
    });

    totals = calculateDocumentTotals(
      processedLines,
      documentData.discountPercent || 0,
      documentData.shippingCost || 0
    );

    documentData.lines = { create: processedLines };
  }

  // Crea documento con righe e rate in transazione
  const document = await prisma.$transaction(async (tx) => {
    const newDocument = await tx.document.create({
      data: {
        ...documentData,
        documentNumber,
        documentYear: currentYear,
        createdByUserId: userId,
        ...totals,
        lines: documentData.lines,
        installments: installments.length > 0 ? { create: installments } : undefined,
      },
      select: getDocumentSelection(),
    });

    return newDocument;
  });

  res.status(201).json({
    status: 'success',
    message: 'Documento creato con successo',
    data: document,
  });
});

/**
 * @desc    Aggiorna un documento
 * @route   PUT /api/documents/:id
 * @access  Private
 */
export const updateDocument = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  // Verifica esistenza
  const existingDocument = await prisma.document.findUnique({
    where: { id: Number(id) },
    include: { lines: true },
  });

  if (!existingDocument) {
    throw new NotFoundError('Documento non trovato');
  }

  // Non permettere modifica se non in DRAFT
  if (existingDocument.status !== 'DRAFT' && existingDocument.status !== 'PENDING_APPROVAL') {
    throw new BadRequestError('Impossibile modificare un documento non in bozza');
  }

  // Se cambia lo status da DRAFT, genera numero
  if (existingDocument.status === 'DRAFT' && updateData.status && updateData.status !== 'DRAFT') {
    if (!existingDocument.documentNumber) {
      updateData.documentNumber = await generateDocumentNumber(
        existingDocument.documentType,
        existingDocument.documentYear
      );
    }
  }

  // Aggiorna documento
  const document = await prisma.document.update({
    where: { id: Number(id) },
    data: updateData,
    select: getDocumentSelection(),
  });

  res.json({
    status: 'success',
    message: 'Documento aggiornato con successo',
    data: document,
  });
});

/**
 * @desc    Elimina un documento
 * @route   DELETE /api/documents/:id
 * @access  Private
 */
export const deleteDocument = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const document = await prisma.document.findUnique({
    where: { id: Number(id) },
  });

  if (!document) {
    throw new NotFoundError('Documento non trovato');
  }

  // Permetti eliminazione solo per DRAFT
  if (document.status !== 'DRAFT') {
    throw new BadRequestError('Impossibile eliminare un documento non in bozza. Annullalo invece.');
  }

  // Elimina documento (cascade gestirà righe e rate)
  await prisma.document.delete({
    where: { id: Number(id) },
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// ============================================================================
// DOCUMENT STATUS Management
// ============================================================================

/**
 * @desc    Aggiorna status documento
 * @route   PATCH /api/documents/:id/status
 * @access  Private
 */
export const updateDocumentStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const document = await prisma.document.update({
    where: { id: Number(id) },
    data: {
      status,
      ...(notes && { internalNotes: notes }),
    },
    select: getDocumentSelection(),
  });

  res.json({
    status: 'success',
    message: 'Status aggiornato con successo',
    data: document,
  });
});

/**
 * @desc    Invia documento al cliente
 * @route   POST /api/documents/:id/send
 * @access  Private
 */
export const sendDocument = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  // TODO: Implementare invio email

  const document = await prisma.document.update({
    where: { id: Number(id) },
    data: {
      status: 'SENT',
      sentDate: new Date(),
    },
    select: getDocumentSelection(),
  });

  res.json({
    status: 'success',
    message: 'Documento inviato con successo',
    data: document,
  });
});

/**
 * @desc    Approva documento
 * @route   POST /api/documents/:id/approve
 * @access  Private
 */
export const approveDocument = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const document = await prisma.document.update({
    where: { id: Number(id) },
    data: { status: 'ACCEPTED' },
    select: getDocumentSelection(),
  });

  res.json({
    status: 'success',
    message: 'Documento approvato con successo',
    data: document,
  });
});

/**
 * @desc    Rifiuta documento
 * @route   POST /api/documents/:id/reject
 * @access  Private
 */
export const rejectDocument = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const document = await prisma.document.update({
    where: { id: Number(id) },
    data: { status: 'REJECTED' },
    select: getDocumentSelection(),
  });

  res.json({
    status: 'success',
    message: 'Documento rifiutato',
    data: document,
  });
});

/**
 * @desc    Annulla documento
 * @route   POST /api/documents/:id/void
 * @access  Private
 */
export const voidDocument = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const document = await prisma.document.update({
    where: { id: Number(id) },
    data: { status: 'VOIDED' },
    select: getDocumentSelection(),
  });

  res.json({
    status: 'success',
    message: 'Documento annullato',
    data: document,
  });
});

// ============================================================================
// DOCUMENT LINES Management
// ============================================================================

/**
 * @desc    Lista righe documento
 * @route   GET /api/documents/:id/lines
 * @access  Private
 */
export const getDocumentLines = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const lines = await prisma.documentLine.findMany({
    where: { documentId: Number(id) },
    orderBy: { lineNumber: 'asc' },
  });

  res.json({
    status: 'success',
    results: lines.length,
    data: lines,
  });
});

/**
 * @desc    Aggiungi riga a documento
 * @route   POST /api/documents/:id/lines
 * @access  Private
 */
export const addDocumentLine = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const lineData = req.body;

  // Verifica che documento esista e sia modificabile
  const document = await prisma.document.findUnique({
    where: { id: Number(id) },
    include: { lines: true },
  });

  if (!document) {
    throw new NotFoundError('Documento non trovato');
  }

  if (document.status !== 'DRAFT' && document.status !== 'PENDING_APPROVAL') {
    throw new BadRequestError('Impossibile modificare righe di un documento non in bozza');
  }

  // Calcola numero riga
  const maxLineNumber = document.lines.reduce(
    (max, line) => Math.max(max, line.lineNumber),
    0
  );

  // Calcola totali riga
  const lineTotals = calculateLineTotals(
    lineData.quantity,
    lineData.unitPrice,
    lineData.discountPercent,
    lineData.taxPercent
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

  res.status(201).json({
    status: 'success',
    message: 'Riga aggiunta con successo',
    data: line,
  });
});

/**
 * @desc    Aggiorna riga documento
 * @route   PUT /api/documents/:id/lines/:lineId
 * @access  Private
 */
export const updateDocumentLine = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { lineId } = req.params;
  const updateData = req.body;

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
      throw new NotFoundError('Riga non trovata');
    }

    const lineTotals = calculateLineTotals(
      updateData.quantity ?? existingLine.quantity,
      updateData.unitPrice ?? existingLine.unitPrice,
      updateData.discountPercent ?? existingLine.discountPercent,
      updateData.taxPercent ?? existingLine.taxPercent
    );

    Object.assign(updateData, lineTotals);
  }

  const line = await prisma.documentLine.update({
    where: { id: Number(lineId) },
    data: updateData,
  });

  res.json({
    status: 'success',
    message: 'Riga aggiornata con successo',
    data: line,
  });
});

/**
 * @desc    Elimina riga documento
 * @route   DELETE /api/documents/:id/lines/:lineId
 * @access  Private
 */
export const deleteDocumentLine = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { lineId } = req.params;

  await prisma.documentLine.delete({
    where: { id: Number(lineId) },
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// ============================================================================
// DOCUMENT CONVERSIONS
// ============================================================================

/**
 * @desc    Converti documento (es. Quote → Order)
 * @route   POST /api/documents/:id/convert
 * @access  Private
 */
export const convertDocument = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { targetType, copyLines = true, copyInstallments = true, status = 'DRAFT' } = req.body;
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
    throw new NotFoundError('Documento non trovato');
  }

  // Copia dati documento
  const { id: _, lines: __, installments: ___, documentNumber: ____, ...documentData } = sourceDocument as any;

  const currentYear = new Date().getFullYear();
  let documentNumber = null;

  if (status !== 'DRAFT') {
    documentNumber = await generateDocumentNumber(targetType, currentYear);
  }

  // Crea nuovo documento
  const newDocument = await prisma.document.create({
    data: {
      ...documentData,
      documentType: targetType,
      status,
      documentNumber,
      documentYear: currentYear,
      createdByUserId: userId,
      [`related${sourceDocument.documentType.charAt(0) + sourceDocument.documentType.slice(1).toLowerCase()}Id`]: sourceDocument.id,
      lines: copyLines
        ? {
            create: sourceDocument.lines.map((line, index) => {
              const { id, documentId, createdAt, updatedAt, ...lineData } = line as any;
              return { ...lineData, lineNumber: index + 1 };
            }),
          }
        : undefined,
      installments: copyInstallments && sourceDocument.installments.length > 0
        ? {
            create: sourceDocument.installments.map((inst) => {
              const { id, documentId, createdAt, updatedAt, ...instData } = inst as any;
              return instData;
            }),
          }
        : undefined,
    },
    select: getDocumentSelection(),
  });

  res.status(201).json({
    status: 'success',
    message: `Documento convertito da ${sourceDocument.documentType} a ${targetType}`,
    data: newDocument,
  });
});

/**
 * @desc    Duplica documento
 * @route   POST /api/documents/:id/duplicate
 * @access  Private
 */
export const duplicateDocument = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { includeLines = true, includeInstallments = false, status = 'DRAFT' } = req.body;
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
    throw new NotFoundError('Documento non trovato');
  }

  // Copia dati
  const { id: _, lines: __, installments: ___, documentNumber: ____, ...documentData } = sourceDocument as any;

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
              const { id, documentId, createdAt, updatedAt, paidDate, paidAmount, status: instStatus, ...instData } = inst as any;
              return { ...instData, status: 'pending' };
            }),
          }
        : undefined,
    },
    select: getDocumentSelection(),
  });

  res.status(201).json({
    status: 'success',
    message: 'Documento duplicato con successo',
    data: duplicatedDocument,
  });
});

// ============================================================================
// DOCUMENT CALCULATIONS
// ============================================================================

/**
 * @desc    Ricalcola totali documento
 * @route   POST /api/documents/:id/recalculate
 * @access  Private
 */
export const recalculateDocument = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const document = await prisma.document.findUnique({
    where: { id: Number(id) },
    include: { lines: true },
  });

  if (!document) {
    throw new NotFoundError('Documento non trovato');
  }

  // Ricalcola totali
  const totals = calculateDocumentTotals(
    document.lines,
    Number(document.discountPercent),
    Number(document.shippingCost)
  );

  // Aggiorna documento
  const updatedDocument = await prisma.document.update({
    where: { id: Number(id) },
    data: totals,
    select: getDocumentSelection(),
  });

  res.json({
    status: 'success',
    message: 'Totali ricalcolati con successo',
    data: updatedDocument,
  });
});

// ============================================================================
// PAYMENT INSTALLMENTS
// ============================================================================

/**
 * @desc    Lista rate pagamento documento
 * @route   GET /api/documents/:id/installments
 * @access  Private
 */
export const getDocumentInstallments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const installments = await prisma.documentPaymentInstallment.findMany({
    where: { documentId: Number(id) },
    orderBy: { installmentNumber: 'asc' },
  });

  res.json({
    status: 'success',
    results: installments.length,
    data: installments,
  });
});

/**
 * @desc    Aggiorna rata pagamento
 * @route   PUT /api/documents/:id/installments/:installmentId
 * @access  Private
 */
export const updateInstallment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { installmentId } = req.params;
  const updateData = req.body;

  const installment = await prisma.documentPaymentInstallment.update({
    where: { id: Number(installmentId) },
    data: updateData,
  });

  res.json({
    status: 'success',
    message: 'Rata aggiornata con successo',
    data: installment,
  });
});

// ============================================================================
// DOCUMENT BY TYPE
// ============================================================================

/**
 * @desc    Lista preventivi
 * @route   GET /api/documents/quotes
 * @access  Private
 */
export const getQuotes = asyncHandler(async (req: AuthRequest, res: Response) => {
  const documents = await prisma.document.findMany({
    where: { documentType: 'QUOTE' },
    select: getDocumentSelection(),
    orderBy: { documentDate: 'desc' },
  });

  res.json({
    status: 'success',
    results: documents.length,
    data: documents,
  });
});

/**
 * @desc    Lista ordini
 * @route   GET /api/documents/orders
 * @access  Private
 */
export const getOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const documents = await prisma.document.findMany({
    where: { documentType: 'ORDER' },
    select: getDocumentSelection(),
    orderBy: { documentDate: 'desc' },
  });

  res.json({
    status: 'success',
    results: documents.length,
    data: documents,
  });
});

/**
 * @desc    Lista fatture
 * @route   GET /api/documents/invoices
 * @access  Private
 */
export const getInvoices = asyncHandler(async (req: AuthRequest, res: Response) => {
  const documents = await prisma.document.findMany({
    where: { documentType: 'INVOICE' },
    select: getDocumentSelection(),
    orderBy: { documentDate: 'desc' },
  });

  res.json({
    status: 'success',
    results: documents.length,
    data: documents,
  });
});

/**
 * @desc    Lista DDT
 * @route   GET /api/documents/delivery-notes
 * @access  Private
 */
export const getDeliveryNotes = asyncHandler(async (req: AuthRequest, res: Response) => {
  const documents = await prisma.document.findMany({
    where: { documentType: 'DELIVERY_NOTE' },
    select: getDocumentSelection(),
    orderBy: { documentDate: 'desc' },
  });

  res.json({
    status: 'success',
    results: documents.length,
    data: documents,
  });
});

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * @desc    Statistiche documenti
 * @route   GET /api/documents/statistics
 * @access  Private
 */
export const getDocumentStatistics = asyncHandler(async (req: AuthRequest, res: Response) => {
  const stats = await prisma.document.groupBy({
    by: ['documentType', 'status'],
    _count: { id: true },
    _sum: { totalAmount: true },
  });

  res.json({
    status: 'success',
    data: stats,
  });
});

/**
 * @desc    Documenti per cliente
 * @route   GET /api/documents/customer/:customerId
 * @access  Private
 */
export const getDocumentsByCustomer = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { customerId } = req.params;

  const documents = await prisma.document.findMany({
    where: { customerId: Number(customerId) },
    select: getDocumentSelection(),
    orderBy: { documentDate: 'desc' },
  });

  res.json({
    status: 'success',
    results: documents.length,
    data: documents,
  });
});

/**
 * @desc    Documenti per fornitore
 * @route   GET /api/documents/supplier/:supplierId
 * @access  Private
 */
export const getDocumentsBySupplier = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { supplierId } = req.params;

  const documents = await prisma.document.findMany({
    where: { supplierId: Number(supplierId) },
    select: getDocumentSelection(),
    orderBy: { documentDate: 'desc' },
  });

  res.json({
    status: 'success',
    results: documents.length,
    data: documents,
  });
});

// ============================================================================
// EXPORT & PRINT (Placeholder)
// ============================================================================

/**
 * @desc    Esporta documento in PDF
 * @route   GET /api/documents/:id/export/pdf
 * @access  Private
 */
export const exportDocumentPDF = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  
  // TODO: Implementare generazione PDF
  
  res.json({
    status: 'success',
    message: 'Funzionalità PDF in development',
  });
});

/**
 * @desc    Esporta documento in Excel
 * @route   GET /api/documents/:id/export/excel
 * @access  Private
 */
export const exportDocumentExcel = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  
  // TODO: Implementare esportazione Excel
  
  res.json({
    status: 'success',
    message: 'Funzionalità Excel in development',
  });
});

/**
 * @desc    Stampa documento
 * @route   GET /api/documents/:id/print
 * @access  Private
 */
export const printDocument = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  
  // TODO: Implementare template stampa
  
  res.json({
    status: 'success',
    message: 'Funzionalità stampa in development',
  });
});

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
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { templateName, templateDescription } = req.body;

    const document = await prisma.document.findUnique({
      where: { id: Number(id) },
      include: { lines: true },
    });

    if (!document) {
      throw new NotFoundError('Documento non trovato');
    }

    // Salva template (usa customFields o crea tabella dedicata)
    const template = {
      name: templateName,
      description: templateDescription,
      documentType: document.documentType,
      lines: document.lines.map(line => ({
        nameSystem: line.nameSystem,
        descriptionSystem: line.descriptionSystem,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        taxPercent: line.taxPercent,
      })),
      paymentTerms: document.paymentTerms,
      termsAndConditions: document.termsAndConditions,
    };

    res.json({
      status: 'success',
      message: 'Template creato con successo',
      data: template,
    });
  }
);

/**
 * Crea documento da template
 */
export const createDocumentFromTemplate = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { templateId, customerId, ...overrides } = req.body;
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
        status: 'DRAFT',
      },
      select: getDocumentSelection(),
    });

    res.status(201).json({
      status: 'success',
      message: 'Documento creato da template',
      data: document,
    });
  }
);

// ============================================================================
// 2. BATCH OPERATIONS
// ============================================================================

/**
 * Operazioni su multipli documenti
 */

export const bulkUpdateDocuments = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { documentIds, updateData } = req.body;

    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      throw new BadRequestError('Array di ID documenti richiesto');
    }

    const result = await prisma.document.updateMany({
      where: {
        id: { in: documentIds },
        status: 'DRAFT', // Solo DRAFT modificabili in batch
      },
      data: updateData,
    });

    res.json({
      status: 'success',
      message: `${result.count} documenti aggiornati`,
      data: { count: result.count },
    });
  }
);

export const bulkChangeStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { documentIds, newStatus } = req.body;

    const result = await prisma.document.updateMany({
      where: { id: { in: documentIds } },
      data: { status: newStatus },
    });

    res.json({
      status: 'success',
      message: `${result.count} documenti aggiornati a ${newStatus}`,
      data: { count: result.count },
    });
  }
);

export const bulkSendDocuments = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { documentIds } = req.body;

    // Genera numeri per tutti i documenti
    const documents = await prisma.document.findMany({
      where: { id: { in: documentIds }, status: 'DRAFT' },
    });

    for (const doc of documents) {
      if (!doc.documentNumber) {
        const documentNumber = await generateDocumentNumber(
          doc.documentType,
          doc.documentYear
        );

        await prisma.document.update({
          where: { id: doc.id },
          data: {
            documentNumber,
            status: 'SENT',
            sentDate: new Date(),
          },
        });
      }
    }

    res.json({
      status: 'success',
      message: `${documents.length} documenti inviati`,
    });
  }
);

// ============================================================================
// 3. NOTIFICHE E PROMEMORIA
// ============================================================================

/**
 * Sistema di notifiche scadenze
 */

export const getExpiringDocuments = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { days = 7 } = req.query;

    const expiringDate = new Date();
    expiringDate.setDate(expiringDate.getDate() + Number(days));

    const documents = await prisma.document.findMany({
      where: {
        OR: [
          {
            documentType: 'QUOTE',
            validUntil: { lte: expiringDate },
            status: 'SENT',
          },
          {
            documentType: 'INVOICE',
            dueDate: { lte: expiringDate },
            status: { in: ['UNPAID', 'PARTIALLY_PAID'] },
          },
        ],
      },
      select: getDocumentSelection(),
      orderBy: { dueDate: 'asc' },
    });

    res.json({
      status: 'success',
      results: documents.length,
      data: documents,
    });
  }
);

export const getOverdueInvoices = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const today = new Date();

    const invoices = await prisma.document.findMany({
      where: {
        documentType: 'INVOICE',
        dueDate: { lt: today },
        status: { in: ['UNPAID', 'PARTIALLY_PAID'] },
      },
      select: getDocumentSelection(),
      orderBy: { dueDate: 'asc' },
    });

    res.json({
      status: 'success',
      results: invoices.length,
      data: invoices,
    });
  }
);

// ============================================================================
// 4. REPORTISTICA AVANZATA
// ============================================================================

/**
 * Report vendite per periodo
 */
export const getSalesReport = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { dateFrom, dateTo, groupBy = 'month' } = req.query;

    const where: any = {
      documentType: { in: ['ORDER', 'INVOICE'] },
      status: { notIn: ['DRAFT', 'VOIDED'] },
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
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'year':
          key = String(date.getFullYear());
          break;
        default:
          key = 'total';
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
      if (doc.documentType === 'ORDER') acc[key].orders++;
      if (doc.documentType === 'INVOICE') acc[key].invoices++;

      return acc;
    }, {});

    res.json({
      status: 'success',
      data: Object.values(report),
    });
  }
);

/**
 * Report clienti top
 */
export const getTopCustomersReport = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { limit = 10, dateFrom, dateTo } = req.query;

    const where: any = {
      customerId: { not: null },
      status: { notIn: ['DRAFT', 'VOIDED'] },
    };

    if (dateFrom || dateTo) {
      where.documentDate = {};
      if (dateFrom) where.documentDate.gte = new Date(dateFrom as string);
      if (dateTo) where.documentDate.lte = new Date(dateTo as string);
    }

    const topCustomers = await prisma.document.groupBy({
      by: ['customerId'],
      where,
      _count: { id: true },
      _sum: { totalAmount: true },
      orderBy: { _sum: { totalAmount: 'desc' } },
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
        customerName: customer?.company.companyName || 'N/A',
        documentCount: tc._count.id,
        totalAmount: tc._sum.totalAmount,
      };
    });

    res.json({
      status: 'success',
      data: report,
    });
  }
);

/**
 * Report prodotti più venduti
 */
export const getTopProductsReport = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { limit = 10, dateFrom, dateTo } = req.query;

    const where: any = {
      document: {
        status: { notIn: ['DRAFT', 'VOIDED'] },
      },
      productVariantId: { not: null },
    };

    if (dateFrom || dateTo) {
      where.document = {
        ...where.document,
        documentDate: {},
      };
      if (dateFrom) where.document.documentDate.gte = new Date(dateFrom as string);
      if (dateTo) where.document.documentDate.lte = new Date(dateTo as string);
    }

    const topProducts = await prisma.documentLine.groupBy({
      by: ['productVariantId'],
      where,
      _sum: {
        quantity: true,
        lineTotal: true,
      },
      orderBy: {
        _sum: { lineTotal: 'desc' },
      },
      take: Number(limit),
    });

    // Carica dati prodotti
    const variantIds = topProducts.map((p) => p.productVariantId!);
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: {
        product: {
          select: {
            reference: true,
            translations: {
              select: { name: true, languageId: true },
              take: 1,
            },
          },
        },
      },
    });

    const report = topProducts.map((tp) => {
      const variant = variants.find((v) => v.id === tp.productVariantId);
      return {
        productVariantId: tp.productVariantId,
        productName: variant?.product.translations[0]?.name || 'N/A',
        variantCode: variant?.variantCode || 'N/A',
        quantitySold: tp._sum.quantity,
        totalRevenue: tp._sum.lineTotal,
      };
    });

    res.json({
      status: 'success',
      data: report,
    });
  }
);

// ============================================================================
// 5. MOVIMENTI MAGAZZINO DA DOCUMENTI
// ============================================================================

/**
 * Genera movimenti magazzino da DDT/Fattura
 */
export const generateStockMovements = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const document = await prisma.document.findUnique({
      where: { id: Number(id) },
      include: { lines: true },
    });

    if (!document) {
      throw new NotFoundError('Documento non trovato');
    }

    if (!document.warehouseId) {
      throw new BadRequestError('Documento senza magazzino associato');
    }

    // Solo DDT e fatture generano movimenti
    if (!['DELIVERY_NOTE', 'INVOICE'].includes(document.documentType)) {
      throw new BadRequestError('Solo DDT e fatture generano movimenti magazzino');
    }

    // Verifica che non esistano già movimenti
    const existingMovements = await prisma.stockMovement.findMany({
      where: {
        referenceId: `DOC-${document.id}`,
      },
    });

    if (existingMovements.length > 0) {
      throw new ConflictError('Movimenti già generati per questo documento');
    }

    // Crea movimenti per ogni riga con prodotto
    const movements = [];
    for (const line of document.lines) {
      if (line.productVariantId) {
        const movement = await prisma.stockMovement.create({
          data: {
            productVariantId: line.productVariantId,
            warehouseId: document.warehouseId,
            quantity: -Number(line.quantity), // Negativo per uscita
            movementType: 'SALE',
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
              decrement: Number(line.quantity),
            },
          },
        });
      }
    }

    res.json({
      status: 'success',
      message: `${movements.length} movimenti magazzino generati`,
      data: movements,
    });
  }
);

// ============================================================================
// 6. VALIDAZIONE FISCALE
// ============================================================================

/**
 * Verifica dati fiscali documento
 */
export const validateFiscalData = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const document = await prisma.document.findUnique({
      where: { id: Number(id) },
      include: { lines: true },
    });

    if (!document) {
      throw new NotFoundError('Documento non trovato');
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Verifica P.IVA/CF
    if (document.documentType === 'INVOICE') {
      if (!document.customerVatNumber && !document.customerTaxCode) {
        errors.push('P.IVA o Codice Fiscale obbligatorio per fatture');
      }

      if (document.customerCountryCode === 'IT' && !document.customerSdiCode && !document.customerPec) {
        errors.push('Codice SDI o PEC obbligatorio per fatture italiane');
      }
    }

    // Verifica righe
    if (document.lines.length === 0) {
      errors.push('Almeno una riga obbligatoria');
    }

    // Verifica totali
    const calculatedTotals = calculateDocumentTotals(
      document.lines,
      Number(document.discountPercent),
      Number(document.shippingCost)
    );

    if (Math.abs(Number(document.totalAmount) - calculatedTotals.totalAmount) > 0.01) {
      warnings.push('Totale documento non corrisponde alla somma delle righe');
    }

    // Verifica numerazione
    if (document.status !== 'DRAFT' && !document.documentNumber) {
      errors.push('Numero documento mancante');
    }

    res.json({
      status: 'success',
      data: {
        valid: errors.length === 0,
        errors,
        warnings,
      },
    });
  }
);

// ============================================================================
// 7. ALLEGATI DOCUMENTI
// ============================================================================

/**
 * Gestione allegati (TODO: implementare storage)
 */
export const uploadDocumentAttachment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    // const file = req.file; // multer

    // TODO: Upload file su S3/storage
    // TODO: Salva riferimento in DB

    res.json({
      status: 'success',
      message: 'Allegato caricato (TODO)',
    });
  }
);

export const getDocumentAttachments = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    // TODO: Carica lista allegati dal DB

    res.json({
      status: 'success',
      data: [],
    });
  }
);

export const deleteDocumentAttachment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id, attachmentId } = req.params;

    // TODO: Elimina da storage e DB

    res.status(204).json({
      status: 'success',
      data: null,
    });
  }
);

// ============================================================================
// 8. AUDIT LOG DOCUMENTI
// ============================================================================

/**
 * Storia modifiche documento
 */
export const getDocumentHistory = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    // TODO: Implementare tabella DocumentHistory
    // Traccia: chi, quando, cosa ha modificato

    const history = [
      {
        timestamp: '2024-12-01T10:00:00Z',
        userId: 1,
        username: 'admin',
        action: 'CREATE',
        details: 'Documento creato',
      },
      {
        timestamp: '2024-12-01T11:30:00Z',
        userId: 1,
        username: 'admin',
        action: 'UPDATE',
        details: 'Aggiunta riga prodotto',
      },
      {
        timestamp: '2024-12-01T14:00:00Z',
        userId: 1,
        username: 'admin',
        action: 'STATUS_CHANGE',
        details: 'Status: DRAFT → SENT',
      },
    ];

    res.json({
      status: 'success',
      data: history,
    });
  }
);

// ============================================================================
// 9. INTEGRAZIONE EMAIL
// ============================================================================

/**
 * Invia documento via email
 */
export const sendDocumentByEmail = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { recipientEmail, subject, message, attachPDF = true } = req.body;

    const document = await prisma.document.findUnique({
      where: { id: Number(id) },
      select: getDocumentSelection(),
    });

    if (!document) {
      throw new NotFoundError('Documento non trovato');
    }

    // TODO: Genera PDF
    // TODO: Invia email con nodemailer/sendgrid

    // Aggiorna documento
    await prisma.document.update({
      where: { id: Number(id) },
      data: {
        status: document.status === 'DRAFT' ? 'SENT' : document.status,
        sentDate: new Date(),
      },
    });

    res.json({
      status: 'success',
      message: 'Email inviata con successo',
    });
  }
);

// ============================================================================
// 10. EXPORT MASSIVO
// ============================================================================

/**
 * Export multipli documenti
 */
export const exportDocumentsBatch = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { documentIds, format = 'pdf' } = req.body;

    // TODO: Genera ZIP con tutti i PDF/Excel

    res.json({
      status: 'success',
      message: `Export ${format.toUpperCase()} in progress`,
    });
  }
);