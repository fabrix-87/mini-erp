import { prisma } from "../config/prisma-config";
import {
  sendCreated,
  sendDeleted,
  sendFail,
  sendNotFound,
  sendPaginatedResponse,
  sendSuccess,
} from "../utils/response-utils";

import {
  CheckEmailInput,
  CompanyIdAsCompanyIdParam,
  ContactIdParam,
  ContactQueryInput,
  CreateContactInput,
  SetPrimaryContactIdParams,
  ToggleContactActiveInput,
  UpdateContactInput,
} from "@mini-erp/shared/types";
import {
  getRequiredTenantId,
  getValidatedBody,
  getValidatedParams,
  getValidatedQuery,
} from "@/helpers/validated-context";
import { Context } from "hono";
import { AppBindings } from "@/lib/hono-app";
import { Prisma } from "@/generated/prisma/client";
import { CONTACT_SORT_FIELDS } from "@mini-erp/shared";
import { getContactCompaniesInclude, mapContactCompanyFlags } from "@/helpers/contact-helper";
import { connectById, tenantFilter, withTenantId } from "@/helpers/prisma-helper";
import { ConflictError } from "@/utils/app-error-utils";

// ============================================================================
// GET ALL
// ============================================================================

/**
 * Returns a paginated list of contacts with optional filters.
 * Supports filtering by companyId, active, isPrimaryContact and free-text search.
 */
export const getAllContacts = async (c: Context<AppBindings>) => {
  const {
    companyId,
    active,
    isPrimaryContact,
    search,
    department,
    position,
    page = 1,
    limit = 20,
    sortBy = "lastName",
    sortOrder = "asc",
  } = getValidatedQuery<ContactQueryInput>(c);
  const tenantId = getRequiredTenantId(c);

  const where: Prisma.ContactWhereInput = tenantFilter(tenantId, {
    ...(active !== undefined && { active }),
    ...(search && {
      OR: [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...((companyId !== undefined || isPrimaryContact !== undefined || department || position) && {
      companies: {
        some: {
          ...(companyId !== undefined && { companyId }),
          ...(isPrimaryContact !== undefined && { isPrimaryContact }),
          ...(department && { department: { contains: department, mode: "insensitive" } }),
          ...(search && { position: { contains: search, mode: "insensitive" } }),
        },
      },
    }),
  });

  const skip = (page - 1) * limit;

  const orderBy: Prisma.ContactOrderByWithRelationInput[] = CONTACT_SORT_FIELDS.has(sortBy as any)
    ? [{ [sortBy]: sortOrder }]
    : [{ lastName: "asc" }];

  const [contacts, totalCount] = await Promise.all([
    prisma.contact.findMany({
      where,
      include: getContactCompaniesInclude(companyId),
      orderBy,
      skip,
      take: limit,
    }),
    prisma.contact.count({ where }),
  ]);

  return sendPaginatedResponse(c, contacts, totalCount, page, limit);
};

// ============================================================================
// GET BY ID
// ============================================================================

/**
 * Returns a single contact by its ID with all company associations.
 */
export const getContactById = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<ContactIdParam>(c);
  const tenantId = getRequiredTenantId(c);

  const contact = await prisma.contact.findFirst({
    where: tenantFilter(tenantId, { id }),
    include: getContactCompaniesInclude(),
  });

  if (!contact) {
    return sendNotFound(c, "Contatto non trovato");
  }

  return sendSuccess(c, mapContactCompanyFlags(contact));
};

// ============================================================================
// CREATE
// ============================================================================

/**
 * Creates a new Contact with one or more CompanyContact associations in a single transaction.
 * For each entry in companies[], if isPrimaryContact is true, resets any existing primary
 * for that company before setting the new one.
 */
export const createContact = async (c: Context<AppBindings>) => {
  const { companies, ...contactData } = getValidatedBody<CreateContactInput>(c);
  const tenantId = getRequiredTenantId(c);

  // Verifica che tutte le company esistano
  const companyIds = companies.map((entry) => entry.companyId);
  const foundCompanies = await prisma.company.findMany({
    where: withTenantId({ id: { in: companyIds } }, tenantId),
    select: { id: true },
  });

  if (foundCompanies.length !== companyIds.length) {
    const foundIds = foundCompanies.map((c) => c.id);
    const missing = companyIds.filter((id) => !foundIds.includes(id));
    return sendNotFound(c, `Company non trovate: ${missing.join(", ")}`);
  }

  // Verifica email duplicata
  if (contactData.email) {
    const existingEmail = await prisma.contact.findFirst({
      where: tenantFilter(tenantId, { email: contactData.email }),
    });
    if (existingEmail) {
      return sendFail(c, { message: "Email già utilizzata da un altro contatto" });
    }
  }

  const contact = await prisma.$transaction(async (tx) => {
    // Per ogni entry che dichiara isPrimaryContact, azzera il primario esistente
    const primaryEntries = companies.filter((entry) => entry.isPrimaryContact);
    if (primaryEntries.length > 0) {
      await tx.companyContact.updateMany({
        where: {
          companyId: { in: primaryEntries.map((e) => e.companyId) },
          isPrimaryContact: true,
        },
        data: { isPrimaryContact: false },
      });
    }

    return tx.contact.create({
      data: {
        ...contactData,
        tenant: connectById(tenantId),
        companies: {
          create: companies.map((entry) => ({
            companyId: entry.companyId,
            isPrimaryContact: entry.isPrimaryContact ?? false,
            position: entry.position ?? null,
            department: entry.department ?? null,
          })),
        },
      },
      include: getContactCompaniesInclude(),
    });
  });

  return sendCreated(c, contact, "Contatto creato");
};

// ============================================================================
// UPDATE
// ============================================================================

/**
 * Updates a Contact's base fields.
 * CompanyContact contextual fields (position, department, isPrimaryContact)
 * must be updated via the dedicated /company-contacts endpoint.
 */
export const updateContact = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<ContactIdParam>(c);
  const data = getValidatedBody<UpdateContactInput>(c);
  const tenantId = getRequiredTenantId(c);

  const existing = await prisma.contact.findFirst({
    where: tenantFilter(tenantId, { id }),
    select: { email: true },
  });
  if (!existing) {
    return sendNotFound(c, "Contatto non trovato");
  }

  if (data.email && data.email !== existing.email) {
    const duplicate = await prisma.contact.findFirst({
      where: tenantFilter(tenantId, { email: data.email, NOT: { id } }),
    });
    if (duplicate) {
      return sendFail(c, { message: "Email già utilizzata da un altro contatto" });
    }
  }

  // Strip CompanyContact fields — non appartengono al modello Contact diretto
  const { companies: _companies, ...contactData } = data;

  const contact = await prisma.contact.update({
    where: { id, tenantId },
    data: contactData,
    include: getContactCompaniesInclude(),
  });

  return sendSuccess(c, contact, { message: "Contatto aggiornato" });
};

// ============================================================================
// TOGGLE ACTIVE
// ============================================================================

/**
 * Activates or deactivates a contact.
 */
export const toggleContactActive = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<ContactIdParam>(c);
  const { active } = getValidatedBody<ToggleContactActiveInput>(c);
  const tenantId = getRequiredTenantId(c);

  const existing = await prisma.contact.findFirst({ where: tenantFilter(tenantId, { id }) });
  if (!existing) {
    return sendNotFound(c, "Contatto non trovato");
  }

  const contact = await prisma.contact.update({
    where: { id, tenantId },
    data: { active },
    include: getContactCompaniesInclude(),
  });

  return sendSuccess(c, contact, {
    message: `Contatto ${active ? "attivato" : "disattivato"}`,
  });
};

// ============================================================================
// SET PRIMARY (per CompanyContact)
// ============================================================================

/**
 * Promotes a contact as primary for a given company association.
 * Resets any other primary contact for the same company atomically.
 *
 * @param id        - Contact ID
 * @param companyId - Company ID (from query param)
 */
export const setPrimaryContact = async (c: Context<AppBindings>) => {
  const { id, companyId } = getValidatedParams<SetPrimaryContactIdParams>(c);

  const link = await prisma.companyContact.findUnique({
    where: { companyId_contactId: { contactId: id, companyId } },
  });

  if (!link) {
    return sendNotFound(c, "Associazione contatto-company non trovata");
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.companyContact.updateMany({
      where: { companyId, isPrimaryContact: true },
      data: { isPrimaryContact: false },
    });

    return tx.companyContact.update({
      where: { companyId_contactId: { contactId: id, companyId } },
      data: { isPrimaryContact: true },
      include: {
        contact: { include: getContactCompaniesInclude(companyId) },
      },
    });
  });

  return sendSuccess(c, updated.contact, { message: "Contatto primario impostato" });
};

// ============================================================================
// DELETE
// ============================================================================

/**
 * Deletes a contact only if it has no associated documents.
 */
export const deleteContact = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<ContactIdParam>(c);
  const tenantId = getRequiredTenantId(c);
  const { userId } = c.get("user")!;

  const contact = await prisma.contact.findFirst({
    where: tenantFilter(tenantId, { id }),
    include: { _count: { select: { documents: true } } },
  });

  if (!contact) {
    return sendNotFound(c, "Contatto non trovato");
  }

  if (contact._count.documents > 0) {
    throw new ConflictError(
      `Impossibile eliminare il contatto: ${contact._count.documents} document${contact._count.documents === 1 ? "o associato" : "i associati"}`,
    );
  }

  await prisma.contact.update({
    where: { id, tenantId },
    data: {
      deletedAt: new Date(),
      deletedBy: userId,
    },
  });

  return sendDeleted(c, "Contatto eliminato");
};

// ============================================================================
// CHECK EMAIL
// ============================================================================

/**
 * Checks whether an email address is already in use globally.
 */
export const checkEmail = async (c: Context<AppBindings>) => {
  const { email, contactId } = getValidatedQuery<CheckEmailInput>(c);
  const tenantId = getRequiredTenantId(c);

  const existing = await prisma.contact.findFirst({
    where: tenantFilter(tenantId, { email }),
    select: { id: true },
  });

  // se sto modificando lo stesso utente, non devo dare errore
  if (existing && existing.id !== contactId) {
    return sendFail(c, { message: "Email già esistente" });
  }

  return sendSuccess(c, { unique: true }, { message: "Email disponibile" });
};

// ============================================================================
// GET BY COMPANY
// ============================================================================

/**
 * Returns all active contacts associated with a specific company.
 * Uses the CompanyContact join table instead of a direct companyId field.
 */
export const getContactsByCompany = async (c: Context<AppBindings>) => {
  const { companyId } = getValidatedParams<CompanyIdAsCompanyIdParam>(c);
  const tenantId = getRequiredTenantId(c);

  const company = await prisma.company.findFirst({
    where: tenantFilter(tenantId, { id: companyId }),
  });
  if (!company) {
    return sendNotFound(c, "Company non trovata");
  }

  const contacts = await prisma.contact.findMany({
    where: tenantFilter(tenantId, {
      active: true,
      companies: { some: { companyId } },
    }),
    include: getContactCompaniesInclude(companyId),
  });

  return sendSuccess(c, contacts);
};

// ============================================================================
// GET PRIMARY BY COMPANY
// ============================================================================

/**
 * Returns the primary active contact for a specific company.
 */
export const getPrimaryContactByCompany = async (c: Context<AppBindings>) => {
  const { companyId } = getValidatedParams<CompanyIdAsCompanyIdParam>(c);
  const tenantId = getRequiredTenantId(c);

  const company = await prisma.company.findFirst({
    where: tenantFilter(tenantId, { id: companyId }),
  });
  if (!company) {
    return sendNotFound(c, "Company non trovata");
  }

  const primaryContact = await prisma.contact.findFirst({
    where: tenantFilter(tenantId, {
      active: true,
      companies: { some: { companyId, isPrimaryContact: true } },
    }),
    include: getContactCompaniesInclude(companyId),
  });

  if (!primaryContact) {
    return sendNotFound(c, "Nessun contatto primario trovato per questa company");
  }

  return sendSuccess(c, primaryContact);
};
