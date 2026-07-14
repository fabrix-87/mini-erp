import { Prisma } from "@/generated/prisma/client";
import { Contact } from "@mini-erp/shared";

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
export const getContactCompaniesInclude = (filterByCompanyId?: string) => {
  return {
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
            tradeName: true,
            mainEmail: true,
            mainPhone: true,
            customer: { select: { id: true } },
            supplier: { select: { id: true } },
          },
        },
      },
      ...(filterByCompanyId !== undefined && {
        where: { companyId: filterByCompanyId },
      }),
    },
  } satisfies Prisma.ContactInclude;
};

export type PrismaContactPayload = Prisma.ContactGetPayload<{
  include: ReturnType<typeof getContactCompaniesInclude>;
}>;

/**
 * Transforms the raw Prisma contact query payload (with selected company fields)
 * into a domain-level Contact, adding the required 'isCustomer' and 'isSupplier' flags.
 *
 * @param {PrismaContactPayload} contact - The raw contact database record returned by Prisma.
 * @returns {Contact} The fully typed Contact object with resolved CompanyRoles.
 */
export function mapContactCompanyFlags(contact: PrismaContactPayload): Contact {
  return {
    ...contact,
    // Gestiamo i campi opzionali mappandoli a null se sono undefined nel DB
    lastName: contact.lastName ?? null,
    email: contact.email ?? null,
    phone: contact.phone ?? null,
    mobilePhone: contact.mobilePhone ?? null,
    notes: contact.notes ?? null,
    documents: [], // Se non inclusi nella query, inizializzali vuoti
    activities: [],
    activityParticipants: [],

    companies: contact.companies.map((item) => {
      return {
        id: item.id,
        companyId: item.companyId,
        isPrimaryContact: item.isPrimaryContact,
        position: item.position ?? "",
        department: item.department ?? "",
        company: {
          id: item.company.id,
          code: item.company.code,
          companyName: item.company.companyName,
          tradeName: item.company.tradeName,
          mainEmail: item.company.mainEmail,
          mainPhone: item.company.mainPhone,
          // Gestiamo la presenza di customer e supplier
          customer: item.company.customer ? { id: item.company.customer.id } : null,
          supplier: item.company.supplier ? { id: item.company.supplier.id } : null,
          // Iniettiamo i flag booleani richiesti dal tipo CompanyRole
          isCustomer: item.company.customer !== null,
          isSupplier: item.company.supplier !== null,
        },
      };
    }),
  };
}
