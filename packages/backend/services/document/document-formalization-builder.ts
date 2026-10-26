import { Prisma } from "@/generated/prisma/client";
import { getDocumentFormalizationStatus, isInboundDocumentType } from "@mini-erp/shared";
import type { BuildDocumentFormalizationDataArgs } from "@/types";

/**
 * Builds a Prisma DocumentUncheckedUpdateInput for document formalization.
 *
 * Formalization is the transition that makes a document official:
 * - assigns the generated document number for OUTBOUND documents;
 * - creates immutable party, payment and bank snapshots;
 * - locks document-owned snapshots.
 *
 * The caller must execute numbering generation, snapshot resolution and the
 * resulting document update inside the same Prisma transaction.
 *
 * @param args - Document input, formalization snapshots and generated numbering
 * @returns Prisma update input ready for tx.document.update({ data })
 * @throws Error when the document type has no formalization status
 * @throws Error when an OUTBOUND document is formalized without numbering
 */
export function buildDocumentFormalizationData(
  args: BuildDocumentFormalizationDataArgs,
): Prisma.DocumentUncheckedUpdateInput {
  const { documentType, snapshots, numbering } = args;

  const formalizationStatus = getDocumentFormalizationStatus(documentType);

  if (!formalizationStatus) {
    throw new Error(`Document type ${documentType} has no formalization status`);
  }
  const inbound = isInboundDocumentType(documentType);

  if (!inbound && !numbering) {
    throw new Error("Numbering is required to formalize an OUTBOUND document");
  }

  if (inbound && numbering) {
    throw new Error("Numbering must not be generated for an INBOUND document");
  }

  const data: Prisma.DocumentUncheckedUpdateInput = {
    status: formalizationStatus,

    // OUTBOUND documents receive the tenant-generated number.
    // INBOUND documents keep the counterparty document number only.
    ...(inbound
      ? {}
      : {
          documentNumber: numbering?.documentNumber,
          sequenceNumber: numbering?.sequenceNumber,
        }),

    // Payment snapshot.
    paymentMethodCode: snapshots.payment.paymentMethodCode,
    paymentTermsLabel: snapshots.payment.paymentTermsLabel ?? undefined,

    // Bank snapshot.
    bankName: snapshots.bank.bankName ?? undefined,
    bankIban: snapshots.bank.bankIban ?? undefined,
    bankSwift: snapshots.bank.bankSwift ?? undefined,
    bankAccountHolder: snapshots.bank.bankAccountHolder ?? undefined,
    paymentBankAccountId: snapshots.bank.paymentBankAccountId ?? undefined,
    bankDetailsMismatch: snapshots.bank.bankDetailsMismatch,

    // Withholding-tax snapshot.
    withholdingTaxTypeId: snapshots.withholding?.withholdingTaxTypeId,
    withholdingTaxTypeCode: snapshots.withholding?.withholdingTaxTypeCode,
    withholdingTaxBase: snapshots.withholding?.withholdingTaxBase,
    withholdingTaxPercent: snapshots.withholding?.withholdingTaxPercent,
    withholdingTaxAmount: snapshots.withholding?.withholdingTaxAmount,

    // Social-security contribution snapshot.
    contributionPercent: snapshots.contribution?.contributionPercent,
    contributionAmount: snapshots.contribution?.contributionAmount,

    // Immutable party snapshots.
    parties: {
      create: snapshots.parties,
    },

    // After this timestamp, database triggers must reject party snapshot writes.
    snapshotLockedAt: new Date(),
  };

  return data satisfies Prisma.DocumentUncheckedUpdateInput;
}
