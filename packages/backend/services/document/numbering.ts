// ============================================================================
// DOCUMENT NUMBERING SERVICE
// Handles sequential document number generation
// ============================================================================

import { Prisma, DocumentType, PrismaClient } from "@/generated/prisma/client";
import { DOCUMENT_NUMBER_PADDING, DOCUMENT_PREFIXES } from "@mini-erp/shared";

/**
 * Genera il numero documento in modo atomico usando DocumentSequence
 *
 * IMPORTANTE: Questa funzione DEVE essere chiamata dentro una transaction!
 *
 * @param documentType - Tipo di documento (INVOICE, ORDER, ecc.)
 * @param year - Anno di riferimento (default: anno corrente)
 * @param tx - Transaction Prisma Client
 * @returns Oggetto con sequenceNumber e documentNumber
 *
 * @example
 * ```typescript
 * await prisma.$transaction(async (tx) => {
 *   const numbering = await generateDocumentNumber('INVOICE', 2026, tx);
 *   // { sequenceNumber: 123, documentNumber: "FT/2026/00123", year: 2026, prefix: "FT" }
 *
 *   await tx.document.update({
 *     where: { id: documentId },
 *     data: {
 *       sequenceNumber: numbering.sequenceNumber,
 *       documentNumber: numbering.documentNumber
 *     }
 *   });
 * });
 * ```
 */
interface GeneratedDocumentNumber {
  sequenceNumber: number;
  documentNumber: string;
  year: number;
  prefix: string;
}

export async function generateDocumentNumber(
  documentType: DocumentType,
  tenantId: number,
  year: number,
  tx: Prisma.TransactionClient,
): Promise<GeneratedDocumentNumber> {
  const prefix = DOCUMENT_PREFIXES[documentType];
  const padding = DOCUMENT_NUMBER_PADDING[documentType];

  // 1. Trova o crea sequenza per questo tipo+anno
  let sequence = await tx.documentSequence.findUnique({
    where: {
      tenantId_documentType_year: {
        tenantId,
        documentType,
        year,
      },
    },
  });

  if (!sequence) {
    // Crea nuova sequenza (primo documento dell'anno per questo tipo)
    sequence = await tx.documentSequence.create({
      data: {
        documentType,
        tenantId,
        year,
        lastNumber: 0,
        prefix,
      },
    });
  }

  // 2. Incrementa atomicamente il numero
  const updated = await tx.documentSequence.update({
    where: { id: sequence.id },
    data: {
      lastNumber: { increment: 1 },
    },
  });

  // 3. Costruisci il numero documento completo
  const sequenceNumber = updated.lastNumber;
  const paddedNumber = sequenceNumber.toString().padStart(padding, "0");
  const documentNumber = `${prefix}/${year}/${paddedNumber}`;

  return {
    sequenceNumber,
    documentNumber,
    year,
    prefix,
  };
}

/**
 * Assegna numero a un documento in DRAFT
 * Usa questa funzione quando approvi/invii un documento
 *
 * @param documentId - ID del documento
 * @param prisma - PrismaClient
 * @returns Documento aggiornato con numero
 */
export async function assignDocumentNumber(documentId: number, prisma: PrismaClient) {
  return prisma.$transaction(async (tx) => {
    // 1. Recupera documento
    const document = await tx.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new Error(`Documento ${documentId} non trovato`);
    }

    // 2. Verifica che sia in bozza
    if (document.documentNumber) {
      throw new Error("Documento già numerato");
    }

    if (!["DRAFT", "PENDING_APPROVAL"].includes(document.status)) {
      throw new Error("Solo bozze possono essere numerate");
    }

    // 3. Genera numero
    const numbering = await generateDocumentNumber(
      document.documentType,
      document.tenantId,
      document.documentYear,
      tx,
    );

    // 4. Aggiorna documento
    return tx.document.update({
      where: { id: documentId },
      data: {
        sequenceNumber: numbering.sequenceNumber,
        documentNumber: numbering.documentNumber,
        approvedAt: new Date(),
      },
    });
  });
}
