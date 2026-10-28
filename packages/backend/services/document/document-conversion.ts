import { Document, DocumentLine, DocumentType, Prisma } from "@/generated/prisma/client";
import { Decimal } from "@prisma/client/runtime/client";
import {
  DOCUMENT_CONVERSION_MAP,
  DOCUMENT_RELATION_TYPES,
  type CreateDocumentLineInput,
} from "@mini-erp/shared";
import { prisma } from "@/config/prisma-config";
import { BadRequestError, NotFoundError } from "@/utils/app-error-utils";
import { withSoftDelete, withTenantId } from "@/helpers/prisma-helper";
import { buildDocumentCreateData } from "./document-create-builder";
import type { DocumentCreateContext, ResolvedLinePricing } from "@/types";

/** Quantity to convert from one source document line. */
export interface ConversionLineQuantity {
  /** Source document line ID. */
  lineId: string;

  /** Quantity to convert into the target document. */
  quantity: Decimal.Value;
}

/** Arguments required to convert an order into a delivery note. */
export interface ConvertOrderToDeliveryNoteArgs {
  /** Source order ID. */
  orderId: string;

  /** Current tenant ID. */
  tenantId: string;

  /** Tenant and authenticated user context. */
  context: DocumentCreateContext;

  /** Lines and quantities to convert. */
  lines: ConversionLineQuantity[];

  /** Optional delivery note date; defaults to now. */
  documentDate?: string;

  /** Optional warehouse override for the delivery note. */
  warehouseId?: string;
}

/**
 * Converts an order into a DRAFT delivery note.
 *
 * The order is not modified during conversion: its fulfillment quantities are
 * updated only when the delivery note is formalized.
 * A FULFILLS relation is created between the order and the delivery note.
 *
 * @param args - Order, conversion lines and tenant context
 * @param args.orderId - Source order ID
 * @param args.tenantId - Current tenant ID
 * @param args.context - Tenant and authenticated user context
 * @param args.lines - Lines and quantities to convert
 * @param args.documentDate - Optional delivery note date
 * @param args.warehouseId - Optional warehouse override
 * @returns The created DRAFT delivery note
 * @throws NotFoundError when the order or a line does not exist
 * @throws BadRequestError when the conversion is not allowed or quantities are invalid
 */
export async function convertOrderToDeliveryNote(
  args: ConvertOrderToDeliveryNoteArgs,
): Promise<Document> {
  const { orderId, tenantId, context, lines, documentDate, warehouseId } = args;

  return prisma.$transaction(async (tx) => {
    const order = await tx.document.findFirst({
      where: withSoftDelete(
        withTenantId(
          {
            id: orderId,
            documentType: "ORDER",
          },
          tenantId,
        ),
      ),
      include: {
        lines: true,
      },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    assertConversionIsAllowed({
      sourceDocumentType: order.documentType,
      targetDocumentType: "DELIVERY_NOTE",
    });

    const linesById = new Map(order.lines.map((line) => [line.id, line]));

    const conversionLines: Array<{
      sourceLine: DocumentLine;
      quantity: Decimal;
    }> = [];

    for (const item of lines) {
      const sourceLine = linesById.get(item.lineId);

      if (!sourceLine) {
        throw new NotFoundError(`Order line ${item.lineId} not found`);
      }

      const quantity = new Decimal(item.quantity);

      if (quantity.lessThanOrEqualTo(0)) {
        throw new BadRequestError("Conversion quantity must be greater than zero");
      }

      const remainingQuantity = sourceLine.quantity.minus(sourceLine.quantityDelivered);

      if (quantity.greaterThan(remainingQuantity)) {
        throw new BadRequestError(
          `Conversion quantity exceeds remaining quantity for line ${item.lineId}`,
        );
      }

      conversionLines.push({
        sourceLine,
        quantity,
      });
    }

    if (conversionLines.length === 0) {
      throw new BadRequestError("At least one line is required to create a delivery note");
    }

    const documentLines: CreateDocumentLineInput[] = conversionLines.map(
      ({ sourceLine, quantity }) =>
        ({
          productVariantId: sourceLine.productVariantId,
          lineType: sourceLine.lineType,
          code: sourceLine.code,
          nameSystem: sourceLine.nameSystem,
          descriptionSystem: sourceLine.descriptionSystem,
          nameCustomer: sourceLine.nameCustomer,
          descriptionCustomer: sourceLine.descriptionCustomer,
          quantity: quantity.toString(),
          unit: sourceLine.unit,
          unitPrice: sourceLine.unitPrice.toString(),
          unitCost: sourceLine.unitCost.toString(),
          discountPercent: sourceLine.discountPercent.toString(),
          taxRuleId: sourceLine.taxRuleId,
          taxPercent: sourceLine.taxPercent.toString(),
          vatNatureCode: sourceLine.vatNatureCode,
          vatNormReference: sourceLine.vatNormReference,
          isReverseCharge: sourceLine.isReverseCharge,
          isSelfInvoice: sourceLine.isSelfInvoice,
          warehouseId: warehouseId ?? sourceLine.warehouseId,
          isComponent: sourceLine.isComponent,
          originalUnitPrice: sourceLine.originalUnitPrice?.toString() ?? null,
          priceOverrideReason: sourceLine.priceOverrideReason,
          notes: sourceLine.notes,
          customFields: sourceLine.customFields,
          discountAmount: 0,
        }) satisfies CreateDocumentLineInput,
    );

    const linePricing: ResolvedLinePricing[] = conversionLines.map(({ sourceLine }) => ({
      unitPrice: sourceLine.unitPrice.toString(),
      originalUnitPrice: sourceLine.originalUnitPrice?.toString() ?? null,
      priceOverrideReason: sourceLine.priceOverrideReason,
      productId: sourceLine.productId
    }));

    const documentData = buildDocumentCreateData({
      input: {
        documentType: "DELIVERY_NOTE",
        customerId: order.customerId,
        supplierId: order.supplierId,
        contactId: order.contactId,
        opportunityId: order.opportunityId,
        leadId: order.leadId,
        warehouseId: warehouseId ?? order.warehouseId,
        documentDate: documentDate ?? new Date().toISOString(),
        currencyCode: order.currencyCode,
        exchangeRate: order.exchangeRate.toString(),
        exchangeRateDate: order.exchangeRateDate.toISOString(),
        baseCurrencyCode: order.baseCurrencyCode,
        carrierId: order.carrierId,
        paymentMethodId: order.paymentMethodId,
        notes: order.notes,
        internalNotes: order.internalNotes,
        termsAndConditions: order.termsAndConditions,
        customFields: order.customFields,
        lines: documentLines,
        installments: [],
      },
      context,
      linePricing,
    });

    const deliveryNote = await tx.document.create({
      data: documentData,
    });

    await tx.documentRelation.create({
      data: {
        tenantId,
        sourceDocumentId: order.id,
        targetDocumentId: deliveryNote.id,
        relationType: DOCUMENT_RELATION_TYPES.FULFILLS,
      },
    });

    return deliveryNote;
  });
}

/**
 * Ensures that a source document type can be converted into a target type.
 *
 * @param args - Conversion context
 * @param args.sourceDocumentType - Source document type
 * @param args.targetDocumentType - Target document type
 * @throws BadRequestError when the conversion is not allowed
 */
function assertConversionIsAllowed(args: {
  sourceDocumentType: DocumentType;
  targetDocumentType: DocumentType;
}): void {
  const { sourceDocumentType, targetDocumentType } = args;

  const allowedTargets = DOCUMENT_CONVERSION_MAP[sourceDocumentType] ?? [];

  if (!allowedTargets.includes(targetDocumentType)) {
    throw new BadRequestError(
      `Conversion from ${sourceDocumentType} to ${targetDocumentType} is not allowed`,
    );
  }
}
