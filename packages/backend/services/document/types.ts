import type { Prisma } from "@/generated/prisma/client";
import type { CreateDocumentInput } from "@mini-erp/shared";

/** Authenticated and tenant-scoped context required to create a document. */
export interface DocumentCreateContext {
  /** Current tenant ID. */
  tenantId: string;
  /** Authenticated user ID, used for Document.createdByUserId. */
  userId: string;
}

/** Server-resolved snapshots required by the document create builder. */
export interface DocumentCreateSnapshots {
  /** Party snapshots: COUNTERPARTY, TENANT and, when applicable, SHIPPING/CARRIER. */
  parties: Prisma.DocumentPartyUncheckedCreateWithoutDocumentInput[];
  /** Payment snapshot resolved from PaymentMethod when paymentMethodId is provided. */
  payment: {
    paymentMethodCode: string;
    paymentTermsLabel?: string;
  };
  /** Bank snapshot resolved from BankAccount when paymentBankAccountId is provided. */
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
  contribution?: {
    contributionPercent: Prisma.Decimal;
    contributionAmount: Prisma.Decimal;
  };
}

/** Input accepted by the document create service. */
export type DocumentCreateInput = CreateDocumentInput;
