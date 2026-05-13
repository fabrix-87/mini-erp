import { BadRequestError, NotFoundError } from "@/utils/app-error-utils";
import { prisma } from "@/config/prisma-config";
import { Prisma } from "@/generated/prisma/client";
import { sendCreated, sendSuccess } from "@/utils/response-utils";
import {
  CloneDocumentInput,
  ConvertDocumentInput,
  CreateDocumentRelationInput,
  DocumentIdParam,
} from "@mini-erp/shared";
import { getDocumentSelection } from "@/helpers/document";
import {
  buildDocumentCreateData,
  buildDocumentLine,
} from "@/services/document/builder";
import { generateDocumentNumber } from "@/services/document/numbering";
import { toIntId, withSoftDelete, toJsonField } from "@/helpers/prisma-helper";
import { Context } from "hono";
import { AppBindings } from "@/lib/hono-app";
import { getValidatedBody, getValidatedParams } from "@/helpers/validated-context";
import { Decimal } from "@prisma/client/runtime/client";
import {
  DOCUMENT_CONVERSION_MAP,
  STATUSES_REQUIRING_NUMBER,
} from "@mini-erp/shared";
import type { DocumentRelationType, DocumentStatus, DocumentType } from "@mini-erp/shared";

// ============================================================================
// CLONE
// ============================================================================

/**
 * Clones an existing document into a new DRAFT with the same type.
 * Lines and installments are deep-copied; sequence number and dates are reset.
 * The original document is linked via a CLONE relation.
 * @route POST /api/documents/:id/clone
 * @access Private
 */
export const cloneDocument = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<DocumentIdParam>(c);
  const input = getValidatedBody<CloneDocumentInput>(c);
  const userId = c.get("user")!.userId;

  const sourceId = toIntId(id);

  const source = await prisma.document.findUnique({
    where: withSoftDelete({ id: sourceId }) as Prisma.DocumentWhereUniqueInput,
    include: {
      lines: { orderBy: { lineNumber: "asc" } },
      installments: { orderBy: { installmentNumber: "asc" } },
    },
  });

  if (!source) {
    throw new NotFoundError("Documento sorgente non trovato");
  }

  const currentYear = new Date().getFullYear();
  const targetStatus: DocumentStatus = "DRAFT";

  // Generate number only for statuses that require it (DRAFT never does)
  let documentNumber: string | null = null;
  let sequenceNumber: number | null = null;

  const cloned = await prisma.$transaction(async (tx) => {
    // Build cloned lines
    const clonedLines: Prisma.DocumentLineUncheckedCreateWithoutDocumentInput[] =
      source.lines.map((line, index) => ({
        lineNumber: index + 1,
        lineType: line.lineType,
        code: line.code,
        productId: line.productId,
        productVariantId: line.productVariantId,
        nameSystem: line.nameSystem,
        descriptionSystem: line.descriptionSystem,
        nameCustomer: line.nameCustomer,
        descriptionCustomer: line.descriptionCustomer,
        quantity: line.quantity,
        unit: line.unit,
        unitPrice: line.unitPrice,
        unitCost: line.unitCost,
        discountPercent: line.discountPercent,
        discountAmount: line.discountAmount,
        lineTotal: line.lineTotal,
        taxRuleId: line.taxRuleId,
        taxPercent: line.taxPercent,
        taxAmount: line.taxAmount,
        vatNatureCode: line.vatNatureCode,
        vatNormReference: line.vatNormReference,
        lineTotalWithTax: line.lineTotalWithTax,
        quantityInvoiced: new Decimal(0),
        quantityDelivered: new Decimal(0),
        quantityReturned: new Decimal(0),
        notes: line.notes,
        customFields: toJsonField(line.customFields as Record<string, unknown>),
        warehouseId: input.warehouseId ?? line.warehouseId,
        parentLineId: null, // reset parent refs in clone
        isComponent: line.isComponent,
        originalUnitPrice: line.originalUnitPrice,
        priceOverrideReason: line.priceOverrideReason,
      }));

    // Build cloned installments (reset payment state)
    const clonedInstallments: Prisma.DocumentPaymentInstallmentUncheckedCreateWithoutDocumentInput[] =
      source.installments.map((inst) => ({
        installmentNumber: inst.installmentNumber,
        percentage: inst.percentage,
        amount: inst.amount,
        dueDate: inst.dueDate,
        status: "PENDING" as const,
        paidAmount: new Decimal(0),
        notes: inst.notes,
        paymentMethodId: inst.paymentMethodId,
        remindersSent: 0,
        lateFeeAmount: new Decimal(0),
      }));

    const newDocument = await tx.document.create({
      data: {
        documentType: source.documentType,
        status: targetStatus,
        documentNumber,
        sequenceNumber,
        documentYear: currentYear,
        documentDate: input.documentDate ? new Date(input.documentDate) : new Date(),
        dueDate: source.dueDate,
        deliveryDate: source.deliveryDate,
        validUntil: null,
        tenantId: source.tenantId,
        customerId: input.customerId ?? source.customerId,
        supplierId: source.supplierId,
        contactId: source.contactId,
        opportunityId: source.opportunityId,
        leadId: source.leadId,
        warehouseId: input.warehouseId ?? source.warehouseId,
        paymentMethodId: source.paymentMethodId,
        assignedUserId: source.assignedUserId,
        createdByUserId: userId,
        parentDocumentId: null,
        customerName: source.customerName,
        customerVatNumber: source.customerVatNumber,
        customerTaxCode: source.customerTaxCode,
        customerPec: source.customerPec,
        customerSdiCode: source.customerSdiCode,
        customerAddress: source.customerAddress,
        customerCity: source.customerCity,
        customerPostalCode: source.customerPostalCode,
        customerProvince: source.customerProvince,
        customerCountryCode: source.customerCountryCode,
        customerEmail: source.customerEmail,
        customerPhone: source.customerPhone,
        shippingName: source.shippingName,
        shippingAddress: source.shippingAddress,
        shippingCity: source.shippingCity,
        shippingPostalCode: source.shippingPostalCode,
        shippingProvince: source.shippingProvince,
        shippingCountryCode: source.shippingCountryCode,
        subtotal: source.subtotal,
        discountPercent: source.discountPercent,
        discountAmount: source.discountAmount,
        shippingCost: source.shippingCost,
        shippingTaxAmount: source.shippingTaxAmount,
        taxableAmount: source.taxableAmount,
        taxAmount: source.taxAmount,
        totalAmount: source.totalAmount,
        paidAmount: new Decimal(0),
        currencyCode: source.currencyCode,
        exchangeRate: source.exchangeRate,
        exchangeRateDate: source.exchangeRateDate,
        baseCurrencyCode: source.baseCurrencyCode,
        paymentMethod: source.paymentMethod,
        paymentTerms: source.paymentTerms,
        bankName: source.bankName,
        bankIban: source.bankIban,
        bankSwift: source.bankSwift,
        notes: input.notes ?? source.notes,
        internalNotes: source.internalNotes,
        termsAndConditions: source.termsAndConditions,
        customFields: toJsonField(source.customFields as Record<string, unknown>),
        ...(clonedLines.length > 0 && { lines: { create: clonedLines } }),
        ...(clonedInstallments.length > 0 && {
          installments: { create: clonedInstallments },
        }),
      },
      select: getDocumentSelection(),
    });

    // Link source → clone via DocumentRelation
    await tx.documentRelation.create({
      data: {
        sourceDocumentId: sourceId,
        targetDocumentId: newDocument.id,
        relationType: "CONVERTS_TO",
      },
    });

    return newDocument;
  });

  return sendCreated(c, cloned, "Documento clonato con successo");
};

// ============================================================================
// CONVERT
// ============================================================================

/**
 * Converts a document into a different type (e.g. QUOTE → ORDER, ORDER → INVOICE).
 * Allowed conversions are governed by DOCUMENT_CONVERSION_MAP from shared constants.
 * Only lines with a remaining unfulfilled quantity are carried forward.
 * The source document gains a CONVERTED_TO relation pointing to the new document.
 * @route POST /api/documents/:id/convert
 * @access Private
 */
export const convertDocument = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<DocumentIdParam>(c);
  const input = getValidatedBody<ConvertDocumentInput>(c);
  const userId = c.get("user")!.userId;

  const sourceId = toIntId(id);
  const targetType = input.targetDocumentType as DocumentType;

  const source = await prisma.document.findUnique({
    where: withSoftDelete({ id: sourceId }) as Prisma.DocumentWhereUniqueInput,
    include: {
      lines: {
        orderBy: { lineNumber: "asc" },
      },
    },
  });

  if (!source) {
    throw new NotFoundError("Documento sorgente non trovato");
  }

  // Validate allowed conversion
  const allowedTargets: DocumentType[] =
    DOCUMENT_CONVERSION_MAP[source.documentType as DocumentType] ?? [];

  if (!allowedTargets.includes(targetType)) {
    throw new BadRequestError(
      `Conversione non consentita: ${source.documentType} → ${targetType}`,
    );
  }

  // Source must be in a convertible status
  const convertibleStatuses = ["ACCEPTED", "CONFIRMED", "PARTIALLY_FULFILLED", "SENT"];
  if (!convertibleStatuses.includes(source.status)) {
    throw new BadRequestError(
      `Stato documento non convertibile: ${source.status}`,
    );
  }

  const currentYear = new Date().getFullYear();
  const targetStatus: DocumentStatus = input.status ?? "DRAFT";

  const converted = await prisma.$transaction(async (tx) => {
    // Generate number if required by target status
    let documentNumber: string | null = null;
    let sequenceNumber: number | null = null;

    if (STATUSES_REQUIRING_NUMBER.includes(targetStatus)) {
      const generated = await generateDocumentNumber(targetType, source.tenantId, currentYear, tx);
      documentNumber = generated.documentNumber;
      sequenceNumber = generated.sequenceNumber;
    }

    // Carry only lines with remaining qty (total - delivered - invoiced)
    const eligibleLines = source.lines.filter((line) => {
      const delivered = line.quantityDelivered ?? new Decimal(0);
      const invoiced = line.quantityInvoiced ?? new Decimal(0);
      const remaining = line.quantity
        .sub(delivered)
        .sub(invoiced);
      return remaining.greaterThan(0);
    });

    if (eligibleLines.length === 0) {
      throw new BadRequestError(
        "Tutte le righe sono già evase o fatturate. Nessuna riga da convertire.",
      );
    }

    // Rebuild lines for the target document with remaining quantities
    const convertedLines: Prisma.DocumentLineUncheckedCreateWithoutDocumentInput[] =
      eligibleLines.map((line, index) => {
        const delivered = line.quantityDelivered ?? new Decimal(0);
        const invoiced = line.quantityInvoiced ?? new Decimal(0);
        const remainingQty = line.quantity.sub(delivered).sub(invoiced);

        // Recompute line totals for the remaining quantity
        return {
            lineType: line.lineType,
            lineNumber: index + 1,
            code: line.code ?? undefined,
            productId: line.productId ?? undefined,
            productVariantId: line.productVariantId ?? undefined,
            nameSystem: line.nameSystem,
            descriptionSystem: line.descriptionSystem ?? undefined,
            nameCustomer: line.nameCustomer ?? undefined,
            descriptionCustomer: line.descriptionCustomer ?? undefined,
            quantity: remainingQty,
            unit: line.unit,
            unitPrice: line.unitPrice,
            unitCost: line.unitCost,
            discountPercent: line.discountPercent,
            taxPercent: line.taxPercent,
            taxRuleId: line.taxRuleId ?? undefined,
            vatNatureCode: line.vatNatureCode ?? undefined,
            vatNormReference: line.vatNormReference ?? undefined,
            notes: line.notes ?? undefined,
            customFields: toJsonField(line.customFields),
            warehouseId: line.warehouseId ?? undefined,
            isComponent: line.isComponent,
            originalUnitPrice: line.originalUnitPrice ?? undefined,
            priceOverrideReason: line.priceOverrideReason ?? undefined,
          } satisfies Prisma.DocumentLineUncheckedCreateWithoutDocumentInput
      });

    // Recompute document totals from converted lines
    const lineTotalsForCalc = convertedLines.map((l) => ({
      lineTotal: new Decimal(l.lineTotal as number),
      taxAmount: new Decimal(l.taxAmount as number),
    }));

    const { calculateDocumentTotals } = await import("@mini-erp/shared");
    const totals = calculateDocumentTotals(
      lineTotalsForCalc,
      source.discountPercent.toNumber(),
      source.shippingCost.toNumber(),
    );

    const newDocument = await tx.document.create({
      data: {
        documentType: targetType,
        status: targetStatus,
        documentNumber,
        sequenceNumber,
        documentYear: currentYear,
        documentDate: input.documentDate ? new Date(input.documentDate) : new Date(),
        dueDate: input.dueDate ? new Date(input.dueDate) : source.dueDate,
        deliveryDate: source.deliveryDate,
        validUntil: null,
        tenantId: source.tenantId,
        customerId: source.customerId,
        supplierId: source.supplierId,
        contactId: source.contactId,
        opportunityId: source.opportunityId,
        leadId: source.leadId,
        warehouseId: source.warehouseId,
        paymentMethodId: source.paymentMethodId,
        assignedUserId: source.assignedUserId,
        createdByUserId: userId,
        parentDocumentId: sourceId,
        customerName: source.customerName,
        customerVatNumber: source.customerVatNumber,
        customerTaxCode: source.customerTaxCode,
        customerPec: source.customerPec,
        customerSdiCode: source.customerSdiCode,
        customerAddress: source.customerAddress,
        customerCity: source.customerCity,
        customerPostalCode: source.customerPostalCode,
        customerProvince: source.customerProvince,
        customerCountryCode: source.customerCountryCode,
        customerEmail: source.customerEmail,
        customerPhone: source.customerPhone,
        shippingName: source.shippingName,
        shippingAddress: source.shippingAddress,
        shippingCity: source.shippingCity,
        shippingPostalCode: source.shippingPostalCode,
        shippingProvince: source.shippingProvince,
        shippingCountryCode: source.shippingCountryCode,
        discountPercent: source.discountPercent,
        shippingCost: source.shippingCost,
        currencyCode: source.currencyCode,
        exchangeRate: source.exchangeRate,
        exchangeRateDate: source.exchangeRateDate,
        baseCurrencyCode: source.baseCurrencyCode,
        paymentMethod: source.paymentMethod,
        paymentTerms: source.paymentTerms,
        bankName: source.bankName,
        bankIban: source.bankIban,
        bankSwift: source.bankSwift,
        notes: input.notes ?? source.notes,
        internalNotes: source.internalNotes,
        termsAndConditions: source.termsAndConditions,
        customFields: toJsonField(source.customFields as Record<string, unknown>),
        paidAmount: new Decimal(0),
        ...totals,
        lines: { create: convertedLines },
      },
      select: getDocumentSelection(),
    });

    // Create CONVERTED_TO relation
    await tx.documentRelation.create({
      data: {
        sourceDocumentId: sourceId,
        targetDocumentId: newDocument.id,
        relationType: "CONVERTS_TO",
      },
    });

    return newDocument;
  });

  return sendCreated(c, converted, `Documento convertito in ${targetType} con successo`);
};

// ============================================================================
// RELATIONS
// ============================================================================

/**
 * Creates an explicit relation between two documents.
 * Useful for manual linkage (e.g. linking a credit note to an invoice).
 * Prevents self-relations and duplicate relations.
 * @route POST /api/documents/:id/relations
 * @access Private
 */
export const createDocumentRelation = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<DocumentIdParam>(c);
  const input = getValidatedBody<CreateDocumentRelationInput>(c);

  const sourceId = toIntId(id);
  const targetId = toIntId(input.targetDocumentId, "targetDocumentId");

  if (sourceId === targetId) {
    throw new BadRequestError("Un documento non può essere collegato a se stesso");
  }

  // Verify both documents exist
  const [source, target] = await Promise.all([
    prisma.document.findUnique({
      where: withSoftDelete({ id: sourceId }) as Prisma.DocumentWhereUniqueInput,
      select: { id: true },
    }),
    prisma.document.findUnique({
      where: withSoftDelete({ id: targetId }) as Prisma.DocumentWhereUniqueInput,
      select: { id: true },
    }),
  ]);

  if (!source) throw new NotFoundError("Documento sorgente non trovato");
  if (!target) throw new NotFoundError("Documento target non trovato");

  // Prevent duplicate relation of the same type
  const existing = await prisma.documentRelation.findFirst({
    where: {
      sourceDocumentId: sourceId,
      targetDocumentId: targetId,
      relationType: input.relationType,
    },
  });

  if (existing) {
    throw new BadRequestError(
      `Relazione ${input.relationType} già esistente tra questi documenti`,
    );
  }

  const relation = await prisma.documentRelation.create({
    data: {
      sourceDocumentId: sourceId,
      targetDocumentId: targetId,
      relationType: input.relationType,
    },
  });

  return sendCreated(c, relation, "Relazione creata con successo");
};

/**
 * Returns all relations (both directions) for a document.
 * @route GET /api/documents/:id/relations
 * @access Private
 */
export const getDocumentRelations = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<DocumentIdParam>(c);

  const documentId = toIntId(id);

  const document = await prisma.document.findUnique({
    where: withSoftDelete({ id: documentId }) as Prisma.DocumentWhereUniqueInput,
    select: { id: true },
  });

  if (!document) throw new NotFoundError("Documento non trovato");

  const [outgoing, incoming] = await Promise.all([
    prisma.documentRelation.findMany({
      where: { sourceDocumentId: documentId },
      include: {
        targetDocument: {
          select: {
            id: true,
            documentType: true,
            documentNumber: true,
            status: true,
            documentDate: true,
            customerName: true,
            totalAmount: true,
          },
        },
      },
    }),
    prisma.documentRelation.findMany({
      where: { targetDocumentId: documentId },
      include: {
        sourceDocument: {
          select: {
            id: true,
            documentType: true,
            documentNumber: true,
            status: true,
            documentDate: true,
            customerName: true,
            totalAmount: true,
          },
        },
      },
    }),
  ]);

  return sendSuccess(c, { outgoing, incoming });
};

/**
 * Removes a specific relation between two documents.
 * Only manually-created relations can be deleted (CLONE and CONVERTED_TO are system relations).
 * @route DELETE /api/documents/:id/relations/:targetId
 * @access Private
 */
export const deleteDocumentRelation = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<DocumentIdParam>(c);
  const targetId = toIntId(
    c.req.param("targetId"),
    "targetId",
  );
  const { relationType } = getValidatedBody<{ relationType: DocumentRelationType }>(c);

  const systemRelations = ["CONVERTS_TO"];
  if (systemRelations.includes(relationType)) {
    throw new BadRequestError(
      `Impossibile eliminare una relazione di sistema: ${relationType}`,
    );
  }

  const sourceId = toIntId(id);

  const relation = await prisma.documentRelation.findFirst({
    where: {
      sourceDocumentId: sourceId,
      targetDocumentId: targetId,
      relationType,
    },
  });

  if (!relation) {
    throw new NotFoundError("Relazione non trovata");
  }

  await prisma.documentRelation.delete({
    where: {
      sourceDocumentId_targetDocumentId_relationType: {
        sourceDocumentId: sourceId,
        targetDocumentId: targetId,
        relationType,
      },
    },
  });

  return sendSuccess(c, null, { message: "Relazione eliminata" });
};