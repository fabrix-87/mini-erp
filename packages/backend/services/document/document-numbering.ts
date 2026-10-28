import { Prisma } from "@/generated/prisma/client";
import {
  DOCUMENT_NUMBER_PADDING,
  DOCUMENT_PREFIXES,
  formatDocumentNumber,
  type OutboundDocumentType,
} from "@mini-erp/shared";

/** Result of an atomic document numbering operation. */
export interface GeneratedDocumentNumber {
  /** Monotonic sequence number within tenant, document type and year. */
  sequenceNumber: number;

  /** Human-readable document number. */
  documentNumber: string;

  /** Year of the numbering sequence. */
  year: number;

  /** Prefix used by the document type. */
  prefix: string;
}

/**
 * Generates the next document number for an OUTBOUND document type.
 * Must be called inside a Prisma transaction.
 *
 * The sequence row is created atomically when missing, then incremented.
 * This avoids duplicate-sequence errors when two documents are formalized
 * concurrently.
 *
 * @param documentType - OUTBOUND document type
 * @param tenantId - Current tenant ID
 * @param year - Document year
 * @param tx - Prisma transaction client
 * @returns Generated sequence and document number
 */
export async function generateDocumentNumber(
  documentType: OutboundDocumentType,
  tenantId: string,
  year: number,
  tx: Prisma.TransactionClient,
): Promise<GeneratedDocumentNumber> {
  const prefix = DOCUMENT_PREFIXES[documentType];

  const sequence = await tx.documentSequence.upsert({
    where: {
      tenantId_documentType_year: {
        tenantId,
        documentType,
        year,
      },
    },
    create: {
      tenantId,
      documentType,
      year,
      lastNumber: 0,
      prefix,
    },
    update: {},
  });

  const updated = await tx.documentSequence.update({
    where: { id: sequence.id },
    data: {
      lastNumber: {
        increment: 1,
      },
    },
  });

  const sequenceNumber = updated.lastNumber;
  const documentNumber = formatDocumentNumber(documentType, year, sequenceNumber);

  return {
    sequenceNumber,
    documentNumber,
    year,
    prefix,
  };
}
