import type { DocumentStatus, DocumentType, Prisma } from "@/generated/prisma/client";
import type { CreateDocumentInput, Decimal } from "@mini-erp/shared";

/** Interactive transaction limits: pricing up to MAX_DOCUMENT_LINES lines can be slow. */
export const TRANSACTION_LIMITS_OPTIONS = { maxWait: 5_000, timeout: 20_000 } as const;

/** Authenticated and tenant-scoped context required by document services. */
export interface DocumentCreateContext {
  /** Current tenant ID. */
  tenantId: string;

  /** Authenticated user ID, used for Document.createdByUserId. */
  userId: string;
}

/** Server-resolved pricing data for one document line. */
export interface ResolvedLinePricing {
  /** Final unit price applied to the document line. */
  unitPrice: string;

  /** Original list price before any manual override, or null. */
  originalUnitPrice: string | null;

  /** Mandatory justification when the unit price was overridden. */
  priceOverrideReason: string | null;

  productId: string | null;
}

/** Server-resolved VAT snapshot of one document line, derived from its TaxRule. */
export interface ResolvedLineTax {
  taxRuleId: number | null;
  taxPercent: string;
  vatNatureCode: string | null;
  vatNormReference: string | null;
}

/** Server-resolved snapshots required to formalize a document. */
export interface DocumentFormalizationSnapshots {
  /** Party snapshots: COUNTERPARTY, TENANT and, when applicable, SHIPPING/CARRIER. */
  parties: Prisma.DocumentPartyUncheckedCreateWithoutDocumentInput[];

  /** Payment snapshot resolved from PaymentMethod. */
  payment: {
    paymentMethodCode?: string;
    paymentTermsLabel?: string;
  };

  /** Bank snapshot resolved from BankAccount. */
  bank: {
    bankName?: string;
    bankIban?: string;
    bankSwift?: string;
    bankAccountHolder?: string;
    paymentBankAccountId?: string;
    bankDetailsMismatch: boolean;
  };

  /** Optional withholding-tax snapshot for INBOUND documents. */
  withholding?: {
    withholdingTaxTypeId: string;
    withholdingTaxTypeCode: string;
    withholdingTaxBase: Prisma.Decimal;
    withholdingTaxPercent: Prisma.Decimal;
    withholdingTaxAmount: Prisma.Decimal;
  };

  /** Optional social-security contribution snapshot. */
  contribution?: {
    contributionPercent: Prisma.Decimal;
    contributionAmount: Prisma.Decimal;
  };
}

/** Arguments required by the draft document create builder. */
export interface BuildDocumentCreateDataArgs {
  /** Validated document creation payload. */
  input: CreateDocumentInput;

  /** Tenant and authenticated user context. */
  context: DocumentCreateContext;

  /** Pricing resolved for each input line, in the same order. */
  linePricing: ResolvedLinePricing[];

  lineTax: ResolvedLineTax[];

  /** Source line ID of each line (conversions only), in the same order as `input.lines`. */
  sourceLineIds?: Array<string | null | undefined>;
}

/** Numbering result generated during document formalization. */
export interface DocumentNumberingResult {
  /** Human-readable document number. */
  documentNumber: string;

  /** Monotonic sequence number within tenant, type and year. */
  sequenceNumber: number;
}

/**
 * Arguments required by the document formalization builder.
 */
export interface BuildDocumentFormalizationDataArgs {
  /** Type of the document being formalized. */
  documentType: DocumentType;

  /** Server-resolved snapshots created during formalization. */
  snapshots: DocumentFormalizationSnapshots;

  /** Numbering result; required for OUTBOUND documents. */
  numbering?: DocumentNumberingResult;
}

/** Document-level data that influences price resolution. */
export interface DocumentLinePricingContext {
  /** Current tenant ID. */
  tenantId: string;
  /** Type of the document being created. */
  documentType: DocumentType;
  /** Document currency; the resolver only accepts price lists in this currency. */
  currencyCode: string;
  /** Reference date for price list validity. */
  documentDate: Date;
  /** Customer whose default price list applies, when present. */
  customerId?: string | null;
}

/** Persisted document totals returned by the recalculation. */
export interface DocumentTotalsSummary {
  subtotal: Decimal;
  discountAmount: Decimal;
  taxableAmount: Decimal;
  taxAmount: Decimal;
  totalAmount: Decimal;
}

/** Order statuses from which delivery quantities can be applied. */
export const FULFILLABLE_STATUSES: readonly DocumentStatus[] = [
  "ACCEPTED",
  "PREPARING",
  "PARTIALLY_FULFILLED",
];

/** Line types that carry deliverable quantities. */
export const FULFILLABLE_LINE_TYPES = ["PRODUCT", "SERVICE"] as const;

/** Document types whose fulfillment is tracked. */
export const FULFILLMENT_TRACKED_TYPES: readonly DocumentType[] = ["ORDER"];

/** Fulfillment status computed from document lines. */
export type FulfillmentStatus = "PENDING" | "PARTIALLY_FULFILLED" | "FULFILLED";

export type CreatableDocumentType = CreateDocumentInput["documentType"];

/** Narrows to the types a user can create (SELF_INVOICE is system-generated). */
export function isCreatableType(type: DocumentType): type is CreatableDocumentType {
  return type !== "SELF_INVOICE";
}
