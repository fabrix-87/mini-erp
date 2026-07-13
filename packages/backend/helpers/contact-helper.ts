import { Prisma } from "@/generated/prisma/client";

/**
 * Builds a Prisma include clause for the `companies` relation on a Contact.
 *
 * Selects CompanyContact join rows with their nested Company summary
 * (id, code, companyName). When `filterByCompanyId` is provided, only
 * the join row for that specific company is returned — useful when loading
 * a contact in the context of a single company detail page.
 *
 * @param filterByCompanyId - Optional CUID of the company to restrict results to.
 * @returns Prisma.ContactInclude ready to be spread into a findUnique/findFirst query.
 */
export const getContactCompaniesInclude = (filterByCompanyId?: string): Prisma.ContactInclude => ({
  companies: {
    select: {
      id: true,
      companyId: true,
      isPrimaryContact: true,
      position: true,
      department: true,
      company: {
        select: {
          id: true,
          code: true,
          companyName: true,
        },
      },
    },
    ...(filterByCompanyId !== undefined && {
      where: { companyId: filterByCompanyId },
    }),
  },
});
