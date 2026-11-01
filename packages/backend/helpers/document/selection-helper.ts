// ============================================================================
// DOCUMENT SELECTION HELPERS
// Prisma query selections for consistent data fetching
// ============================================================================

import { Prisma } from "@/generated/prisma/client";

const partyRelationSelect = {
  id: true,
  company: { select: { companyName: true, vatNumber: true, mainEmail: true } },
} as const;

/**
 * Lightweight selection for document lists.
 * Drafts have no party snapshot, so the live relation names are selected too.
 */
export const getDocumentListSelection = () =>
  ({
    id: true,
    documentType: true,
    direction: true,
    status: true,
    documentNumber: true,
    counterpartyDocumentNumber: true,
    documentYear: true,
    documentDate: true,
    dueDate: true,
    currencyCode: true,
    totalAmount: true,
    paidAmount: true,
    snapshotLockedAt: true,
    createdAt: true,
    customerId: true,
    supplierId: true,
    customer: { select: { id: true, company: { select: { companyName: true } } } },
    supplier: { select: { id: true, company: { select: { companyName: true } } } },
    parties: { where: { role: "COUNTERPARTY" as const }, select: { name: true } },
  }) satisfies Prisma.DocumentSelect;

/** Full document detail: header scalars, lines, installments, party snapshots and live relations. */
export const getDocumentDetailInclude = () =>
  ({
    lines: { orderBy: { lineNumber: "asc" as const } },
    installments: { orderBy: { installmentNumber: "asc" as const } },
    parties: true,
    customer: { select: partyRelationSelect },
    supplier: { select: partyRelationSelect },
    warehouse: { select: { id: true, name: true, location: true } },
    paymentMethodRel: {
      select: { id: true, code: true, translations: { select: { name: true } } },
    },
    createdBy: { select: { id: true, username: true, email: true } },
    assignedUser: { select: { id: true, username: true, email: true } },
  }) satisfies Prisma.DocumentInclude;

/**
 * Document line selection with product info
 */
export const getDocumentLineWithProductSelection = () =>
  ({
    id: true,
    lineNumber: true,
    nameSystem: true,
    quantity: true,
    quantityDelivered: true,
    unitPrice: true,
    lineTotal: true,
    productVariant: {
      select: {
        id: true,
        sku: true,
        minimalQuantity: true,
        product: {
          select: {
            id: true,
            reference: true,
          },
        },
      },
    },
  }) satisfies Prisma.DocumentLineSelect;
