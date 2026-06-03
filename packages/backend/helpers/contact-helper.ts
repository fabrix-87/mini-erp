import { Prisma } from "@/generated/prisma/client";

/** Standard include for CompanyContact relation */
export const getContactCompaniesInclude = (filterByCompanyId?: number) =>
  ({
    companies: {
      select: {
        id: true,
        companyId: true,
        isPrimaryContact: true,
        position: true,
        department: true,
        company: { select: { id: true, code: true, companyName: true } },
      },
      ...(filterByCompanyId && { where: { companyId: filterByCompanyId } }),
    },
  }) satisfies Prisma.ContactInclude;
