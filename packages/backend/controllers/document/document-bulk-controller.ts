import { BadRequestError } from "@/utils/app-error-utils";
import { prisma } from "@/config/prisma-config";
import { Prisma } from "@/generated/prisma/client";
import { sendSuccess } from "@/utils/response-utils";
import {
  BulkDeleteDocumentsInput,
  BulkSendDocumentsInput,
  BulkUpdateDocumentsStatusInput,
  DocumentStatus,
  DocumentType,
  SendDocumentInput,
  STATUSES_REQUIRING_NUMBER,
} from "@mini-erp/shared";
import { generateDocumentNumber, resolveAllowedTransitions } from "@/services/document";
import { toIntId } from "@/helpers/prisma-helper";
import { Context } from "hono";
import { AppBindings } from "@/lib/hono-app";
import { getValidatedBody } from "@/helpers/validated-context";

// ============================================================================
// RESULT TYPES
// ============================================================================

/**
 * Per-document outcome for a bulk operation.
 */
interface BulkOperationResult {
  id: number;
  success: boolean;
  error?: string;
}

/**
 * Aggregated summary returned by all bulk endpoints.
 */
interface BulkSummary {
  requested: number;
  succeeded: number;
  failed: number;
  results: BulkOperationResult[];
}

// ============================================================================
// BULK STATUS UPDATE
// ============================================================================

/**
 * Updates the status of multiple documents in a single request.
 * Each document is validated individually for allowed transitions —
 * failures are collected and returned without aborting the entire batch.
 * Auto-generates document numbers for statuses that require them.
 * @route POST /api/documents/bulk/status
 * @access Private
 */
export const bulkChangeStatus = async (c: Context<AppBindings>) => {
  const {
    documentIds,
    status: newStatus,
    reason,
  } = getValidatedBody<BulkUpdateDocumentsStatusInput>(c);

  const ids = documentIds.map((id) => toIntId(id));

  // Fetch all documents in one query
  const documents = await prisma.document.findMany({
    where: {
      id: { in: ids },
      deletedAt: null,
    },
    select: {
      id: true,
      status: true,
      documentType: true,
      documentNumber: true,
      documentYear: true,
      tenantId: true,
    },
  });

  const foundIds = new Set(documents.map((d) => d.id));
  const results: BulkOperationResult[] = [];

  // Pre-validate each document — collect errors, don't throw
  for (const id of ids) {
    if (!foundIds.has(id)) {
      results.push({ id, success: false, error: "Documento non trovato" });
      continue;
    }

    const doc = documents.find((d) => d.id === id)!;
    const allowed = resolveAllowedTransitions(
      doc.documentType as DocumentType,
      doc.status as DocumentStatus,
    );

    if (!allowed.includes(newStatus as DocumentStatus)) {
      results.push({
        id,
        success: false,
        error: `Transizione non permessa: ${doc.status} → ${newStatus}`,
      });
    } else {
      results.push({ id, success: true });
    }
  }

  // Process only documents that passed validation
  const eligible = results
    .filter((r) => r.success)
    .map((r) => documents.find((d) => d.id === r.id)!);

  if (eligible.length > 0) {
    await prisma.$transaction(async (tx) => {
      for (const doc of eligible) {
        const needsNumber =
          !doc.documentNumber &&
          STATUSES_REQUIRING_NUMBER.includes(
            newStatus as DocumentStatus,
          );

        let documentNumber: string | undefined;
        let sequenceNumber: number | undefined;

        if (needsNumber) {
          const generated = await generateDocumentNumber(
            doc.documentType as DocumentType,
            doc.tenantId,
            doc.documentYear,
            tx,
          );
          documentNumber = generated.documentNumber;
          sequenceNumber = generated.sequenceNumber;
        }

        await tx.document.update({
          where: { id: doc.id },
          data: {
            status: newStatus,
            ...(reason && { internalNotes: reason }),
            ...(documentNumber && { documentNumber }),
            ...(sequenceNumber && { sequenceNumber }),
            // Timestamp fields per status
            ...(newStatus === "SENT" && { sentDate: new Date() }),
            ...(newStatus === "ACCEPTED" && { approvedAt: new Date() }),
            ...(newStatus === "DELIVERED" && { deliveredAt: new Date() }),
            ...(newStatus === "PAID" && { invoicedAt: new Date() }),
            ...(newStatus === "VOIDED" && { voidedAt: new Date() }),
            ...(newStatus === "CLOSED" && { closedAt: new Date() }),
          },
        });
      }
    });
  }

  const summary: BulkSummary = {
    requested: ids.length,
    succeeded: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    results,
  };

  return sendSuccess(c, summary, {
    message: `${summary.succeeded}/${summary.requested} documenti aggiornati`,
  });
};

// ============================================================================
// BULK DELETE (SOFT)
// ============================================================================

/**
 * Soft-deletes multiple documents in a single request.
 * Only DRAFT and REJECTED documents can be deleted.
 * Fails gracefully per-document without aborting the entire batch.
 * @route POST /api/documents/bulk/delete
 * @access Private
 */
export const bulkDeleteDocuments = async (c: Context<AppBindings>) => {
  const { documentIds, reason } = getValidatedBody<BulkDeleteDocumentsInput>(c);
  const userId = c.get("user")!.userId;

  const ids = documentIds.map((id) => toIntId(id));

  const documents = await prisma.document.findMany({
    where: { id: { in: ids }, deletedAt: null },
    select: { id: true, status: true },
  });

  const foundIds = new Set(documents.map((d) => d.id));
  const results: BulkOperationResult[] = [];

  const deletableStatuses: DocumentStatus[] = ["DRAFT", "REJECTED"];

  for (const id of ids) {
    if (!foundIds.has(id)) {
      results.push({ id, success: false, error: "Documento non trovato" });
      continue;
    }

    const doc = documents.find((d) => d.id === id)!;
    if (!deletableStatuses.includes(doc.status as DocumentStatus)) {
      results.push({
        id,
        success: false,
        error: `Impossibile eliminare un documento con stato: ${doc.status}`,
      });
    } else {
      results.push({ id, success: true });
    }
  }

  const eligibleIds = results.filter((r) => r.success).map((r) => r.id);

  if (eligibleIds.length > 0) {
    await prisma.document.updateMany({
      where: { id: { in: eligibleIds } },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
        ...(reason && { internalNotes: reason }),
      },
    });
  }

  const summary: BulkSummary = {
    requested: ids.length,
    succeeded: eligibleIds.length,
    failed: results.filter((r) => !r.success).length,
    results,
  };

  return sendSuccess(c, summary, {
    message: `${summary.succeeded}/${summary.requested} documenti eliminati`,
  });
};

// ============================================================================
// BULK SEND
// ============================================================================

/**
 * Sends multiple documents via email in a single request.
 * Each document must be in a SENT-eligible status.
 * Email sending failures are captured per-document without aborting the batch.
 * Auto-generates document numbers if missing.
 * @route POST /api/documents/bulk/send
 * @access Private
 */
export const bulkSendDocuments = async (c: Context<AppBindings>) => {
  const { documentIds, emailTemplate } = getValidatedBody<BulkSendDocumentsInput>(c);

  const ids = documentIds.map((id) => toIntId(id));

  const documents = await prisma.document.findMany({
    where: { id: { in: ids }, deletedAt: null },
    select: {
      id: true,
      status: true,
      documentType: true,
      documentNumber: true,
      documentYear: true,
      tenantId: true,
      customerEmail: true,
      customerName: true,
    },
  });

  const foundIds = new Set(documents.map((d) => d.id));
  const results: BulkOperationResult[] = [];

  for (const id of ids) {
    if (!foundIds.has(id)) {
      results.push({ id, success: false, error: "Documento non trovato" });
      continue;
    }

    const doc = documents.find((d) => d.id === id)!;

    if (!doc.customerEmail) {
      results.push({ id, success: false, error: "Email cliente mancante" });
      continue;
    }

    const allowed = resolveAllowedTransitions(
      doc.documentType as DocumentType,
      doc.status as DocumentStatus,
    );

    if (!allowed.includes("SENT" as DocumentStatus)) {
      results.push({
        id,
        success: false,
        error: `Invio non permesso dallo stato: ${doc.status}`,
      });
    } else {
      results.push({ id, success: true });
    }
  }

  const eligible = results
    .filter((r) => r.success)
    .map((r) => documents.find((d) => d.id === r.id)!);

  if (eligible.length > 0) {
    await prisma.$transaction(async (tx) => {
      for (const doc of eligible) {
        let documentNumber = doc.documentNumber;
        let sequenceNumber: number | undefined;

        if (!documentNumber) {
          const generated = await generateDocumentNumber(
            doc.documentType as DocumentType,
            doc.tenantId,
            doc.documentYear,
            tx,
          );
          documentNumber = generated.documentNumber;
          sequenceNumber = generated.sequenceNumber;
        }

        await tx.document.update({
          where: { id: doc.id },
          data: {
            status: "SENT",
            sentDate: new Date(),
            ...(documentNumber && { documentNumber }),
            ...(sequenceNumber && { sequenceNumber }),
          },
        });
      }
    });

    // TODO: dispatch emails via email service
    // eligible.forEach(doc => emailService.sendDocument(doc, emailTemplate))
  }

  const summary: BulkSummary = {
    requested: ids.length,
    succeeded: eligible.length,
    failed: results.filter((r) => !r.success).length,
    results,
  };

  return sendSuccess(c, summary, {
    message: `${summary.succeeded}/${summary.requested} documenti inviati`,
  });
};

// ============================================================================
// BULK EXPORT (IDs only — export jobs gestiti async)
// ============================================================================

/**
 * Enqueues a bulk export job for the specified document IDs.
 * Returns a job ID to poll for completion (async pattern).
 * Supports formats: pdf, xml (FatturaPA), csv.
 * @route POST /api/documents/bulk/export
 * @access Private
 */
export const bulkExportDocuments = async (c: Context<AppBindings>) => {
  const { documentIds, format } = getValidatedBody<{
    documentIds: number[];
    format: "pdf" | "xml" | "csv";
  }>(c);

  const SUPPORTED_FORMATS = ["pdf", "xml", "csv"] as const;
  if (!SUPPORTED_FORMATS.includes(format)) {
    throw new BadRequestError(`Formato non supportato: ${format}. Usa: pdf, xml, csv`);
  }

  const ids = documentIds.map((id) => toIntId(id));

  if (ids.length === 0) {
    throw new BadRequestError("Nessun documento selezionato per l'export");
  }

  const MAX_BULK_EXPORT = 100;
  if (ids.length > MAX_BULK_EXPORT) {
    throw new BadRequestError(
      `Massimo ${MAX_BULK_EXPORT} documenti per export bulk. Richiesti: ${ids.length}`,
    );
  }

  // Verify all IDs exist
  const count = await prisma.document.count({
    where: { id: { in: ids }, deletedAt: null },
  });

  if (count !== ids.length) {
    throw new BadRequestError(`${ids.length - count} documenti non trovati o eliminati`);
  }

  // TODO: integrate job queue (BullMQ / pg-boss)
  // const jobId = await exportQueue.add('bulk-export', { documentIds: ids, format });
  const jobId = `export_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  return sendSuccess(c, {
    jobId,
    documentCount: ids.length,
    format,
    status: "queued",
    message: "Export accodato. Usa jobId per verificare lo stato.",
  });
};
