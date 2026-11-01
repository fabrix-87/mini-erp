import { Prisma, type Document } from "@/generated/prisma/client";
import { prisma } from "@/config/prisma-config";
import {
  DOCUMENTS_REQUIRING_CUSTOMER,
  DOCUMENTS_REQUIRING_SUPPLIER,
  isInboundDocumentType,
  type UpdateDocumentInput,
} from "@mini-erp/shared";
import { BadRequestError, ConflictError } from "@/utils/app-error-utils";
import { parseOptionalDate, toDecimal, toJsonField, toRequiredDate } from "@/helpers/prisma-helper";
import type { DocumentCreateContext } from "@/types";
import { assertDocumentEditable, findDocumentOrThrow } from "./document-guards";
import { lockDocumentStatus } from "./document-concurrency";
import { recalculateDocumentTotals } from "./document-totals-service";
import { getDocumentDetail } from "./document-query-service";

/** Arguments of a draft header update. */
export interface UpdateDocumentHeaderArgs {
  documentId: string;
  input: UpdateDocumentInput;
  context: DocumentCreateContext;
}

/**
 * Maps a validated partial payload to a Prisma update.
 * `undefined` leaves a field untouched; `null` explicitly clears a nullable column.
 * Totals and snapshot fields are never writable here.
 */
function buildDocumentHeaderUpdateData(
  input: UpdateDocumentInput,
  userId: string,
): Prisma.DocumentUncheckedUpdateInput {
  return {
    customerId: input.customerId,
    supplierId: input.supplierId,
    contactId: input.contactId,
    assignedUserId: input.assignedUserId,
    opportunityId: input.opportunityId,
    leadId: input.leadId,
    warehouseId: input.warehouseId,
    shippingAddressId: input.shippingAddressId,
    carrierId: input.carrierId,
    paymentMethodId: input.paymentMethodId,
    paymentBankAccountId: input.paymentBankAccountId,
    documentDate: toRequiredDate(input.documentDate ?? undefined),
    dueDate: parseOptionalDate(input.dueDate),
    deliveryDate: parseOptionalDate(input.deliveryDate),
    validUntil: parseOptionalDate(input.validUntil),
    receivedDate: parseOptionalDate(input.receivedDate),
    registrationDate: parseOptionalDate(input.registrationDate),
    counterpartyDocumentNumber: input.counterpartyDocumentNumber,
    discountPercent: toDecimal(input.discountPercent),
    currencyCode: input.currencyCode,
    baseCurrencyCode: input.baseCurrencyCode,
    exchangeRate: toDecimal(input.exchangeRate),
    exchangeRateDate: toRequiredDate(input.exchangeRateDate ?? undefined),
    trackingNumber: input.trackingNumber,
    notes: input.notes,
    internalNotes: input.internalNotes,
    termsAndConditions: input.termsAndConditions,
    customFields: input.customFields === undefined ? undefined : toJsonField(input.customFields),
    updatedByUserId: userId,
  } satisfies Prisma.DocumentUncheckedUpdateInput;
}

/** Rejects updates inconsistent with the document type or its current lines. */
async function assertHeaderUpdateAllowed(
  tx: Prisma.TransactionClient,
  document: Document,
  input: UpdateDocumentInput,
): Promise<void> {
  const inbound = isInboundDocumentType(document.documentType);

  if (!inbound) {
    for (const field of [
      "counterpartyDocumentNumber",
      "receivedDate",
      "registrationDate",
      "withholdingTaxTypeId",
    ] as const) {
      if (input[field]) throw new BadRequestError(`${field} is only allowed on inbound documents`);
    }
  }
  if (inbound && input.counterpartyDocumentNumber === null) {
    throw new BadRequestError("counterpartyDocumentNumber cannot be cleared on inbound documents");
  }
  if (input.customerId === null && DOCUMENTS_REQUIRING_CUSTOMER.includes(document.documentType)) {
    throw new BadRequestError(`A customer is required for ${document.documentType}`);
  }
  if (input.supplierId === null && DOCUMENTS_REQUIRING_SUPPLIER.includes(document.documentType)) {
    throw new BadRequestError(`A supplier is required for ${document.documentType}`);
  }
  if (input.currencyCode && input.currencyCode !== document.currencyCode) {
    const lineCount = await tx.documentLine.count({
      where: { tenantId: document.tenantId, documentId: document.id },
    });
    if (lineCount > 0)
      throw new BadRequestError("Currency cannot be changed on a document that already has lines");
  }
}

/**
 * Updates the header of an editable (DRAFT / PENDING_APPROVAL) document.
 * Recalculates totals when the document discount changes. Lines are not repriced.
 * @returns The updated document detail.
 * @throws NotFoundError | BadRequestError | ConflictError
 */
export async function updateDocumentHeader(args: UpdateDocumentHeaderArgs) {
  const { documentId, input, context } = args;
  try {
    return await prisma.$transaction(async (tx) => {
      const document = await findDocumentOrThrow(tx, documentId, context.tenantId);
      assertDocumentEditable(document);
      await assertHeaderUpdateAllowed(tx, document, input);
      await lockDocumentStatus(tx, document);

      await tx.document.update({
        where: { tenantId_id: { tenantId: document.tenantId, id: document.id }, deletedAt: null },
        data: buildDocumentHeaderUpdateData(input, context.userId),
      });
      if (input.discountPercent !== undefined) {
        await recalculateDocumentTotals(
          tx,
          { documentId, tenantId: document.tenantId },
          context.userId,
        );
      }
      return getDocumentDetail(documentId, context.tenantId, tx);
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002")
        throw new ConflictError("A document with the same unique data already exists");
      if (error.code === "P2003")
        throw new BadRequestError("A referenced record does not exist for this tenant");
    }
    throw error;
  }
}
