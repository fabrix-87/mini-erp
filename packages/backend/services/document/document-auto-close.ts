import type { Document, Prisma } from "@/generated/prisma/client";
import { canTransition } from "@mini-erp/shared";
import type { DocumentCreateContext } from "@/types";
import { buildLifecycleData } from "./document-lifecycle";
import { createStatusHistory } from "./document-status-history";

const TRACKED_LINE_TYPES = ["PRODUCT", "SERVICE", "DISCOUNT"] as const;

/**
 * Closes an order or delivery note that is DELIVERED and fully processed: every product/service
 * line is invoiced (and, for orders, delivered); order discount lines are invoiced.
 * The caller must have locked the document in the same transaction.
 *
 * @param args - Document (current row), context and transaction client
 * @returns The closed document, or the same document when nothing changes
 */
export async function closeIfFullyProcessed(args: {
  document: Document;
  context: DocumentCreateContext;
  tx: Prisma.TransactionClient;
}): Promise<Document> {
  const { document, context, tx } = args;
  const { documentType, tenantId } = document;
  if (document.status !== "DELIVERED") return document;
  if (documentType !== "ORDER" && documentType !== "DELIVERY_NOTE") return document;
  if (!canTransition(documentType, "DELIVERED", "CLOSED")) return document;

  const lines = await tx.documentLine.findMany({
    where: { tenantId, documentId: document.id, lineType: { in: [...TRACKED_LINE_TYPES] } },
    select: { lineType: true, quantity: true, quantityDelivered: true, quantityInvoiced: true },
  });
  const complete =
    lines.length > 0 &&
    lines.every(
      (line) =>
        line.quantityInvoiced.greaterThanOrEqualTo(line.quantity) &&
        (documentType === "DELIVERY_NOTE" ||
          line.lineType === "DISCOUNT" ||
          line.quantityDelivered.greaterThanOrEqualTo(line.quantity)),
    );
  if (!complete) return document;

  const closed = await tx.document.update({
    where: { tenantId_id: { tenantId, id: document.id } },
    data: {
      status: "CLOSED",
      ...buildLifecycleData({ document, fromStatus: "DELIVERED", targetStatus: "CLOSED", context }),
    },
  });
  await createStatusHistory({
    documentId: document.id,
    fromStatus: "DELIVERED",
    toStatus: "CLOSED",
    context,
    reason: "Fully delivered and invoiced",
    tx,
  });
  return closed;
}