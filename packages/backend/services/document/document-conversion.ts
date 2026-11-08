import {
  Prisma,
  type Document,
  type DocumentLine,
  type DocumentRelationType,
  type DocumentStatus,
  type DocumentType,
} from "@/generated/prisma/client";
import {
  DOCUMENT_CONVERSION_MAP,
  DOCUMENT_TYPES,
  Decimal,
  isInboundDocumentType,
  type CloneDocumentInput,
  type ConvertDocumentInput,
  type CreateDocumentInput,
} from "@mini-erp/shared";
import { prisma } from "@/config/prisma-config";
import { BadRequestError, ConflictError, NotFoundError } from "@/utils/app-error-utils";
import { withSoftDelete, withTenantId } from "@/helpers/prisma-helper";
import {
  CreatableDocumentType,
  FULFILLABLE_STATUSES,
  isCreatableType,
  TRANSACTION_LIMITS_OPTIONS,
  type DocumentCreateContext,
  type DocumentLinePricingContext,
} from "@/types";
import { buildDocumentCreateData } from "./document-create-builder";
import type { CreatedDocument } from "./document-create-service";
import { findDocumentOrThrow } from "./document-guards";
import { lockDocumentStatus } from "./document-concurrency";
import { copyLine, type CopiedLine } from "./document-line-copy";
import { resolveDocumentLinesTax } from "./document-line-tax-service";

/** How the lines of the source are carried into the target. */
type ConversionMode = "FULL" | "REMAINING_TO_DELIVER";

interface ConversionRule {
  mode: ConversionMode;
  /** Source statuses from which the conversion is allowed. */
  sourceStatuses: readonly DocumentStatus[];
  relationType: DocumentRelationType;
}

const FULL_COPY_RULE: ConversionRule = {
  mode: "FULL",
  sourceStatuses: ["ACCEPTED"],
  relationType: "CONVERTS_TO",
};

/**
 * Conversions available today. Pairs present in DOCUMENT_CONVERSION_MAP but missing here
 * (invoicing, credit notes, purchase chain) are not available yet.
 */
const CONVERSION_RULES: Partial<
  Record<DocumentType, Partial<Record<DocumentType, ConversionRule>>>
> = {
  QUOTE: { ORDER: FULL_COPY_RULE, PROFORMA: FULL_COPY_RULE, INVOICE: FULL_COPY_RULE },
  PROFORMA: { ORDER: FULL_COPY_RULE, INVOICE: FULL_COPY_RULE },
  ORDER: {
    DELIVERY_NOTE: {
      mode: "REMAINING_TO_DELIVER",
      sourceStatuses: FULFILLABLE_STATUSES,
      relationType: "FULFILLS",
    },
  },
};

const DELIVERABLE_LINE_TYPES = ["PRODUCT", "SERVICE"];

/** Runs a conversion transaction and maps constraint violations to AppErrors. */
async function runConversionTransaction<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  try {
    return await prisma.$transaction(fn, TRANSACTION_LIMITS_OPTIONS);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002")
        throw new ConflictError("Conflict while creating the document, please retry");
      if (error.code === "P2003") {
        throw new BadRequestError("A referenced record is not valid for the new document");
      }
    }
    throw error;
  }
}

/** Builds the creation payload of a derived document from the source header. */
function buildDerivedInput(args: {
  source: Document;
  documentType: CreatableDocumentType;
  documentDate: string;
  notes?: string | null;
  copies: CopiedLine[];
}): CreateDocumentInput {
  const { source } = args;

  return {
    documentType: args.documentType,
    customerId: source.customerId,
    supplierId: source.supplierId,
    contactId: source.contactId,
    opportunityId: source.opportunityId,
    leadId: source.leadId,
    assignedUserId: source.assignedUserId,
    warehouseId: source.warehouseId,
    shippingAddressId: source.shippingAddressId,
    carrierId: source.carrierId,
    paymentMethodId: source.paymentMethodId,
    paymentMethodCode: source.paymentMethodCode ?? undefined,
    paymentBankAccountId: source.paymentBankAccountId,
    documentDate: args.documentDate,
    discountPercent: source.discountPercent.toFixed(2),
    currencyCode: source.currencyCode,
    exchangeRate: source.exchangeRate.toFixed(6),
    exchangeRateDate: source.exchangeRateDate.toISOString(),
    baseCurrencyCode: source.baseCurrencyCode,
    notes: args.notes ?? source.notes,
    internalNotes: source.internalNotes,
    termsAndConditions: source.termsAndConditions,
    customFields: source.customFields,
    lines: args.copies.map((copy) => copy.input),
    installments: [],
    dueDate: undefined,
    deliveryDate: undefined,
    validUntil: undefined,
    receivedDate: undefined,
    registrationDate: undefined,
  } satisfies CreateDocumentInput;
}

/**
 * Creates the derived DRAFT document with its relation to the source, inside the caller's
 * transaction. Taxes are re-resolved from each line's tax rule at the new document date;
 * prices are the persisted ones.
 */
async function createDerivedDocument(args: {
  tx: Prisma.TransactionClient;
  source: Document;
  documentType: CreatableDocumentType;
  documentDate: string;
  notes?: string | null;
  copies: CopiedLine[];
  relationType: DocumentRelationType;
  linkSourceLines: boolean;
  context: DocumentCreateContext;
}): Promise<CreatedDocument> {
  const { tx, source, copies, context } = args;
  const input = buildDerivedInput(args);

  const pricingContext = {
    tenantId: source.tenantId,
    documentType: args.documentType,
    currencyCode: source.currencyCode,
    documentDate: new Date(args.documentDate),
    customerId: source.customerId,
  } satisfies DocumentLinePricingContext;
  const lineTax = await resolveDocumentLinesTax(tx, pricingContext, input.lines);

  const document = await tx.document.create({
    data: buildDocumentCreateData({
      input,
      context,
      linePricing: copies.map((copy) => copy.pricing),
      lineTax,
      sourceLineIds: args.linkSourceLines ? copies.map((copy) => copy.sourceLineId) : undefined,
    }),
    include: { lines: true },
  });

  await tx.documentRelation.create({
    data: {
      tenantId: source.tenantId,
      sourceDocumentId: source.id,
      targetDocumentId: document.id,
      relationType: args.relationType,
    },
  });
  return document;
}

/** Remaining deliverable quantity of an order line. */
function remainingToDeliver(line: DocumentLine): Decimal {
  return new Decimal(line.quantity.toString()).minus(line.quantityDelivered.toString());
}

/**
 * Picks the order lines (and quantities) for a delivery note.
 * Without a request: every product/service line with a remaining quantity.
 * With a request: the requested lines; descriptive lines are copied as they are.
 */
function selectLinesToDeliver(
  lines: DocumentLine[],
  requested: ConvertDocumentInput["lines"],
): Array<{ line: DocumentLine; quantity: Decimal }> {
  const deliverable = (line: DocumentLine) => DELIVERABLE_LINE_TYPES.includes(line.lineType);

  if (!requested) {
    return lines
      .filter((line) => deliverable(line) && remainingToDeliver(line).greaterThan(0))
      .map((line) => ({ line, quantity: remainingToDeliver(line) }));
  }

  const byId = new Map(lines.map((line) => [line.id, line]));
  return requested
    .map((entry) => {
      const line = byId.get(entry.lineId);
      if (!line) throw new NotFoundError(`Order line ${entry.lineId} not found`);
      if (line.lineType === "DISCOUNT") {
        throw new BadRequestError("Discount lines cannot be delivered");
      }
      if (!deliverable(line)) return { line, quantity: new Decimal(0) };
      if (entry.quantity === undefined) {
        throw new BadRequestError(`Quantity is required for line ${entry.lineId}`);
      }
      const quantity = new Decimal(entry.quantity);
      if (quantity.greaterThan(remainingToDeliver(line))) {
        throw new BadRequestError(
          `Quantity exceeds the remaining quantity of line ${entry.lineId}`,
        );
      }
      return { line, quantity };
    })
    .sort((a, b) => a.line.lineNumber - b.line.lineNumber);
}

/**
 * Converts a document into another type as a DRAFT and links it to the source.
 * The source is not modified: delivered quantities change when the delivery note is formalized.
 *
 * @param args - Source ID, validated input and context
 * @returns The created document with its lines
 * @throws NotFoundError | BadRequestError | ConflictError
 */
export async function convertDocument(args: {
  sourceId: string;
  input: ConvertDocumentInput;
  context: DocumentCreateContext;
}): Promise<CreatedDocument> {
  const { sourceId, input, context } = args;
  const target = input.targetDocumentType;

  return runConversionTransaction(async (tx) => {
    const source = await findDocumentOrThrow(tx, sourceId, context.tenantId);

    if (!DOCUMENT_CONVERSION_MAP[source.documentType].includes(target)) {
      throw new BadRequestError(
        `Conversion from ${source.documentType} to ${target} is not allowed`,
      );
    }
    const rule = CONVERSION_RULES[source.documentType]?.[target];
    if (!rule) {
      throw new BadRequestError(
        `Conversion from ${source.documentType} to ${target} is not available yet`,
      );
    }
    if (!rule.sourceStatuses.includes(source.status)) {
      throw new BadRequestError(
        `A ${source.documentType} in status ${source.status} cannot be converted to ${target}`,
      );
    }
    await lockDocumentStatus(tx, source);

    if (rule.mode === "FULL") {
      if (input.lines) {
        throw new BadRequestError("Partial conversion is not available for this conversion");
      }
      const existing = await tx.documentRelation.findFirst({
        where: {
          tenantId: source.tenantId,
          sourceDocumentId: source.id,
          relationType: rule.relationType,
          targetDocument: { deletedAt: null, status: { not: "VOIDED" } },
        },
        select: { targetDocumentId: true },
      });
      if (existing) {
        throw new ConflictError(`This ${source.documentType} has already been converted`);
      }
    }

    const sourceLines = await tx.documentLine.findMany({
      where: { tenantId: source.tenantId, documentId: source.id },
      orderBy: { lineNumber: "asc" },
    });

    const selection =
      rule.mode === "FULL"
        ? sourceLines.map((line) => ({ line, quantity: new Decimal(line.quantity.toString()) }))
        : selectLinesToDeliver(sourceLines, input.lines);
    if (
      !selection.some(
        ({ line }) =>
          DELIVERABLE_LINE_TYPES.includes(line.lineType) || line.lineType === "DISCOUNT",
      )
    ) {
      throw new BadRequestError("There are no lines to convert");
    }

    return createDerivedDocument({
      tx,
      source,
      documentType: target,
      documentDate: input.documentDate,
      notes: input.notes,
      copies: selection.map(({ line, quantity }) => copyLine(line, quantity)),
      relationType: rule.relationType,
      linkSourceLines: true,
      context,
    });
  });
}

/**
 * Clones a document as a new DRAFT of the same type, with the same counterparty.
 * Lines keep their persisted prices; taxes are re-resolved at the new date; installments
 * are not copied. Received documents, self-invoices and archived documents cannot be cloned.
 *
 * @param args - Source ID, validated input and context
 * @returns The created document with its lines
 * @throws NotFoundError | BadRequestError
 */
export async function cloneDocument(args: {
  sourceId: string;
  input: CloneDocumentInput;
  context: DocumentCreateContext;
}): Promise<CreatedDocument> {
  const { sourceId, input, context } = args;

  return runConversionTransaction(async (tx) => {
    const source = await findDocumentOrThrow(tx, sourceId, context.tenantId);

    const { documentType } = source;
    if (
      !isCreatableType(documentType) ||
      isInboundDocumentType(documentType) ||
      documentType === "ARCHIVED"
    ) {
      throw new BadRequestError(`${documentType} documents cannot be cloned`);
    }

    if (
      isInboundDocumentType(source.documentType) ||
      source.documentType === "SELF_INVOICE" ||
      source.documentType === "ARCHIVED"
    ) {
      throw new BadRequestError(`${source.documentType} documents cannot be cloned`);
    }

    const sourceLines = await tx.documentLine.findMany({
      where: { tenantId: source.tenantId, documentId: source.id },
      orderBy: { lineNumber: "asc" },
    });

    return createDerivedDocument({
      tx,
      source,
      documentType: source.documentType,
      documentDate: input.documentDate,
      notes: input.notes,
      copies: sourceLines.map((line) => copyLine(line, line.quantity.toString())),
      relationType: "CLONED_FROM",
      linkSourceLines: false,
      context,
    });
  });
}

/**
 * Returns the documents linked to a document, in both directions.
 *
 * @param documentId - Document ID
 * @param tenantId - Current tenant ID
 * @returns Outgoing relations (this document is the source) and incoming ones
 * @throws NotFoundError when the document does not exist
 */
export async function getDocumentRelations(documentId: string, tenantId: string) {
  const document = await prisma.document.findFirst({
    where: withSoftDelete(withTenantId({ id: documentId }, tenantId)) as Prisma.DocumentWhereInput,
    select: { id: true },
  });
  if (!document) throw new NotFoundError("Document not found");

  const linked = {
    id: true,
    documentType: true,
    documentNumber: true,
    status: true,
    documentDate: true,
    totalAmount: true,
  } satisfies Prisma.DocumentSelect;

  const [outgoing, incoming] = await Promise.all([
    prisma.documentRelation.findMany({
      where: { tenantId, sourceDocumentId: documentId, targetDocument: { deletedAt: null } },
      select: { relationType: true, createdAt: true, targetDocument: { select: linked } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.documentRelation.findMany({
      where: { tenantId, targetDocumentId: documentId, sourceDocument: { deletedAt: null } },
      select: { relationType: true, createdAt: true, sourceDocument: { select: linked } },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  return { outgoing, incoming };
}
