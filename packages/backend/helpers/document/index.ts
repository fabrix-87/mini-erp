import { Prisma } from "@/generated/prisma/client";
import { DocumentQueryInput } from "@mini-erp/shared";

// ============================================================================
// DOCUMENT HELPERS - MAIN EXPORT
// ============================================================================

export function buildDocumentOrderBy(
  sortBy: DocumentQueryInput["sortBy"],
  order: DocumentQueryInput["sortOrder"],
): Prisma.DocumentOrderByWithRelationInput[] {
  const primary: Prisma.DocumentOrderByWithRelationInput[] =
    sortBy === "customerName"
      ? [
          { customer: { company: { companyName: order } } },
          { supplier: { company: { companyName: order } } },
        ]
      : [{ [sortBy]: order }];
  return [...primary, { id: "asc" }];
}

export * from "./document-context";
export * from "./selection-helper";
