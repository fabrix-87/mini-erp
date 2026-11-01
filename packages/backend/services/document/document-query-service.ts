import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/config/prisma-config";
import { STATUS_CATEGORIES, type DocumentQueryInput } from "@mini-erp/shared";
import { BadRequestError, NotFoundError } from "@/utils/app-error-utils";
import { toPagination, withSoftDelete, withTenantId } from "@/helpers/prisma-helper";
import { getDocumentDetailInclude, getDocumentListSelection } from "@/helpers/document";

type StatusFilter = Prisma.DocumentWhereInput["status"];
const UNPAID_STATUSES = ["UNPAID", "PARTIALLY_PAID", "OVERDUE"] as const;

/** Builds an inclusive date range filter, or undefined when no bound is given. */
function toDateRange(from?: string, to?: string): Prisma.DateTimeFilter | undefined {
  if (!from && !to) return undefined;
  return { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) };
}

/** Combines `status` and `statusCategory`; the intersection may be empty. */
function resolveStatusFilter(
  status: DocumentQueryInput["status"],
  category: DocumentQueryInput["statusCategory"],
): StatusFilter {
  const categoryStatuses = category ? [...STATUS_CATEGORIES[category]] : undefined;
  if (status) return categoryStatuses && !categoryStatuses.includes(status) ? { in: [] } : status;
  return categoryStatuses ? { in: categoryStatuses } : undefined;
}

/** Builds the tenant-scoped, soft-delete-safe where clause of the list endpoint. */
function buildDocumentListWhere(
  query: DocumentQueryInput,
  tenantId: string,
): Prisma.DocumentWhereInput {
  const and: Prisma.DocumentWhereInput[] = [];

  if (query.search) {
    const contains = { contains: query.search, mode: "insensitive" as const };
    and.push({
      OR: [
        { documentNumber: contains },
        { counterpartyDocumentNumber: contains },
        { customer: { company: { companyName: contains } } },
        { supplier: { company: { companyName: contains } } },
        { parties: { some: { role: "COUNTERPARTY", name: contains } } },
      ],
    });
  }

  if (query.overdue) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    and.push({ dueDate: { lt: today }, status: { in: [...UNPAID_STATUSES] } });
  }

  const filters = {
    documentType: query.documentType,
    direction: query.direction,
    status: resolveStatusFilter(query.status, query.statusCategory),
    customerId: query.customerId,
    supplierId: query.supplierId,
    opportunityId: query.opportunityId,
    leadId: query.leadId,
    warehouseId: query.warehouseId,
    assignedUserId: query.assignedUserId,
    carrierId: query.carrierId,
    currencyCode: query.currencyCode,
    bankDetailsMismatch: query.bankDetailsMismatch,
    documentDate: toDateRange(query.dateFrom ?? undefined, query.dateTo ?? undefined),
    dueDate: toDateRange(query.dueDateFrom ?? undefined, query.dueDateTo ?? undefined),
    totalAmount: { gte: query.minAmount, lte: query.maxAmount },
    ...(and.length > 0 && { AND: and }),
  } satisfies Prisma.DocumentWhereInput;

  // TODO: decide how the deleted-documents history is used (permission, UI, retention).
  const scoped = withSoftDelete(withTenantId(filters, tenantId), query.deleted === true);
  return (
    query.deleted ? { ...scoped, deletedAt: { not: null } } : scoped
  ) as Prisma.DocumentWhereInput;
}

/**
 * Lists the tenant's documents with filters, sorting and pagination.
 * @param query - Validated query string.
 * @param tenantId - Current tenant ID.
 * @returns Page items and the total count.
 * @throws BadRequestError when the unsupported `deleted` filter is requested.
 */
export async function listDocuments(query: DocumentQueryInput, tenantId: string) {
  const where = buildDocumentListWhere(query, tenantId);
  const { skip, take } = toPagination(query.page, query.limit);
  const orderBy = [
    { [query.sortBy]: query.sortOrder },
    { id: "asc" },
  ] as Prisma.DocumentOrderByWithRelationInput[];

  const [items, total] = await Promise.all([
    prisma.document.findMany({ where, select: getDocumentListSelection(), orderBy, skip, take }),
    prisma.document.count({ where }),
  ]);
  return { items, total };
}

/**
 * Returns the full detail of a tenant document.
 * @param documentId - Document CUID.
 * @param tenantId - Current tenant ID.
 * @param db - Prisma client or transaction client (defaults to the shared client).
 * @throws NotFoundError when the document does not exist for this tenant.
 */
export async function getDocumentDetail(
  documentId: string,
  tenantId: string,
  db: Pick<Prisma.TransactionClient, "document"> = prisma,
) {
  const document = await db.document.findFirst({
    where: withSoftDelete(withTenantId({ id: documentId }, tenantId)) as Prisma.DocumentWhereInput,
    include: getDocumentDetailInclude(),
  });
  if (!document) throw new NotFoundError("Document not found");
  return document;
}
