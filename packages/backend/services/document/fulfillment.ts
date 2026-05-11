// ============================================================================
// DOCUMENT FULFILLMENT SERVICE
// ============================================================================

import { prisma } from "@/config/prisma-config";
import { DocumentStatus } from "@/generated/prisma/client";
import { Decimal } from "@prisma/client/runtime/client";

/**
 * Calculate fulfillment status based on DocumentLine quantities
 */
export async function calculateFulfillmentStatus(documentId: number): Promise<{
  status: "PENDING" | "PARTIALLY_FULFILLED" | "FULFILLED";
  totalQuantity: number;
  deliveredQuantity: number;
  fulfillmentRate: number;
}> {
  const lines = await prisma.documentLine.findMany({
    where: { documentId },
    select: {
      quantity: true,
      quantityDelivered: true,
    },
  });

  const totalQuantity = lines.reduce(
    (sum, line) => sum + parseFloat(line.quantity.toString()),
    0,
  );

  const deliveredQuantity = lines.reduce(
    (sum, line) => sum + parseFloat(line.quantityDelivered.toString()),
    0,
  );

  const fulfillmentRate =
    totalQuantity > 0 ? (deliveredQuantity / totalQuantity) * 100 : 0;

  let status: "PENDING" | "PARTIALLY_FULFILLED" | "FULFILLED";

  if (deliveredQuantity === 0) {
    status = "PENDING";
  } else if (deliveredQuantity < totalQuantity) {
    status = "PARTIALLY_FULFILLED";
  } else {
    status = "FULFILLED";
  }

  return {
    status,
    totalQuantity,
    deliveredQuantity,
    fulfillmentRate,
  };
}

/**
 * Update document status based on line fulfillment
 * Call this after updating quantityDelivered on any DocumentLine
 */
export async function updateDocumentFulfillmentStatus(
  documentId: number,
): Promise<void> {
  const { status } = await calculateFulfillmentStatus(documentId);

  let newStatus: DocumentStatus;

  switch (status) {
    case "FULFILLED":
      newStatus = "FULFILLED";
      break;
    case "PARTIALLY_FULFILLED":
      newStatus = "PARTIALLY_FULFILLED";
      break;
    default:
      newStatus = "ACCEPTED"; // Still pending fulfillment
  }

  await prisma.document.update({
    where: { id: documentId },
    data: { status: newStatus },
  });
}

/**
 * Get fulfillment details for a document including per-line breakdown
 */
export async function getDocumentFulfillmentDetails(documentId: number): Promise<{
  overall: {
    status: string;
    totalQuantity: number;
    deliveredQuantity: number;
    fulfillmentRate: number;
  };
  lines: Array<{
    lineNumber: number;
    productName: string | null;
    quantity: number;
    quantityDelivered: number;
    quantityRemaining: number;
    fulfillmentRate: number;
  }>;
}> {
  const overall = await calculateFulfillmentStatus(documentId);

  const lines = await prisma.documentLine.findMany({
    where: { documentId },
    select: {
      lineNumber: true,
      nameSystem: true,
      quantity: true,
      quantityDelivered: true,
    },
    orderBy: { lineNumber: "asc" },
  });

  const lineDetails = lines.map((line) => {
    const qty = parseFloat(line.quantity.toString());
    const delivered = parseFloat(line.quantityDelivered.toString());
    const remaining = qty - delivered;
    const rate = qty > 0 ? (delivered / qty) * 100 : 0;

    return {
      lineNumber: line.lineNumber,
      productName: line.nameSystem,
      quantity: qty,
      quantityDelivered: delivered,
      quantityRemaining: remaining,
      fulfillmentRate: rate,
    };
  });

  return {
    overall,
    lines: lineDetails,
  };
}

/**
 * Update delivered quantity for a specific document line
 * Automatically updates parent document fulfillment status
 */
export async function updateLineDeliveredQuantity(
  lineId: number,
  quantityDelivered: Decimal,
): Promise<void> {
  const line = await prisma.documentLine.update({
    where: { id: lineId },
    data: { quantityDelivered },
    select: { documentId: true },
  });

  // Automatically update parent document status
  await updateDocumentFulfillmentStatus(line.documentId);
}

/**
 * Create partial delivery note from order
 * Returns the new delivery note document ID
 */
export async function createPartialDeliveryNote(
  orderId: number,
  lineQuantities: Array<{ lineId: number; quantity: number }>,
  userId: number,
): Promise<number> {
  return await prisma.$transaction(async (tx) => {
    // Get order details
    const order = await tx.document.findUnique({
      where: { id: orderId },
      include: {
        lines: true,
        company: true,
      },
    });

    if (!order) throw new Error("Order not found");

    // Create delivery note
    const deliveryNote = await tx.document.create({
      data: {
        documentType: "DELIVERY_NOTE",
        statusCategory: "FULFILLMENT_PHASE",
        status: "PREPARING",
        documentYear: new Date().getFullYear(),
        companyId: order.companyId,
        customerId: order.customerId,
        supplierId: order.supplierId,
        warehouseId: order.warehouseId,
        parentDocumentId: orderId,
        
        // Copy customer snapshot
        customerName: order.customerName,
        customerVatNumber: order.customerVatNumber,
        customerAddress: order.customerAddress,
        customerCity: order.customerCity,
        customerPostalCode: order.customerPostalCode,
        customerProvince: order.customerProvince,
        customerCountryCode: order.customerCountryCode,
        
        // Copy shipping snapshot
        shippingName: order.shippingName,
        shippingAddress: order.shippingAddress,
        shippingCity: order.shippingCity,
        shippingPostalCode: order.shippingPostalCode,
        shippingProvince: order.shippingProvince,
        shippingCountryCode: order.shippingCountryCode,
        
        currencyCode: order.currencyCode,
        createdByUserId: userId,
      },
    });

    // Create delivery note lines
    for (const item of lineQuantities) {
      const orderLine = order.lines.find((l) => l.id === item.lineId);
      if (!orderLine) continue;

      await tx.documentLine.create({
        data: {
          documentId: deliveryNote.id,
          productVariantId: orderLine.productVariantId,
          productId: orderLine.productId,
          lineNumber: orderLine.lineNumber,
          lineType: orderLine.lineType,
          code: orderLine.code,
          nameSystem: orderLine.nameSystem,
          descriptionSystem: orderLine.descriptionSystem,
          quantity: item.quantity,
          quantityDelivered: item.quantity,
          unit: orderLine.unit,
          unitPrice: orderLine.unitPrice,
          warehouseId: orderLine.warehouseId,
        },
      });

      // Update order line delivered quantity
      await tx.documentLine.update({
        where: { id: item.lineId },
        data: {
          quantityDelivered: {
            increment: item.quantity,
          },
        },
      });
    }

    // Update order fulfillment status
    const { status } = await calculateFulfillmentStatus(orderId);
    await tx.document.update({
      where: { id: orderId },
      data: {
        status:
          status === "FULFILLED"
            ? "FULFILLED"
            : status === "PARTIALLY_FULFILLED"
              ? "PARTIALLY_FULFILLED"
              : "ACCEPTED",
      },
    });

    return deliveryNote.id;
  });
}
