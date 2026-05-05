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
  ToggleContactActiveInput,
  UpdateContactInput,
} from "@mini-erp/shared/types";
import {
  getValidatedBody,
  getValidatedParams,
  getValidatedQuery,
} from "@/helpers/validated-context";
import { Context } from "hono";
import { AppBindings } from "@/lib/hono-app";
import { Prisma } from "@/generated/prisma/client";
import { CONTACT_SORT_FIELDS } from "@mini-erp/shared";
import { getContactCompaniesInclude } from "@/helpers/contact-helper";

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

  const where: Prisma.ContactWhereInput = {
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
          ...(position && { position: { contains: position, mode: "insensitive" } }),
        },
      },
    }),
  };

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

  const contact = await prisma.contact.findUnique({
    where: { id },
    include: getContactCompaniesInclude(),
  });

  if (!contact) {
    return sendNotFound(c, "Contatto non trovato");
  }

  return sendSuccess(c, contact);
};

// ============================================================================
// CREATE
// ============================================================================

/**
 * Creates a new Contact and its CompanyContact association in a single transaction.
 * If isPrimaryContact is true, resets any existing primary for the same company.
 */
export const createContact = async (c: Context<AppBindings>) => {
  const {
    companyId,
    isPrimaryContact = false,
    position,
    department,
    ...contactData
  } = getValidatedBody<CreateContactInput>(c);

  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) {
    return sendNotFound(c, "Company non trovata");
  }

  if (contactData.email) {
    const existingEmail = await prisma.contact.findFirst({
      where: { email: contactData.email },
    });
    if (existingEmail) {
      return sendFail(c, { message: "Email già utilizzata da un altro contatto" });
    }
  }

  const contact = await prisma.$transaction(async (tx) => {
    if (isPrimaryContact) {
      await tx.companyContact.updateMany({
        where: { companyId, isPrimaryContact: true },
        data: { isPrimaryContact: false },
      });
    }

    return tx.contact.create({
      data: {
        ...contactData,
        companies: {
          create: {
            companyId,
            isPrimaryContact,
            position: position ?? null,
            department: department ?? null,
          },
        },
      },
      include: getContactCompaniesInclude(companyId),
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

  const existing = await prisma.contact.findUnique({ where: { id } });
  if (!existing) {
    return sendNotFound(c, "Contatto non trovato");
  }

  if (data.email && data.email !== existing.email) {
    const duplicate = await prisma.contact.findFirst({
      where: { email: data.email, NOT: { id } },
    });
    if (duplicate) {
      return sendFail(c, { message: "Email già utilizzata da un altro contatto" });
    }
  }

  // Strip CompanyContact fields — non appartengono al modello Contact diretto
  const { isPrimaryContact, position, department, companyId: _cid, ...contactData } = data as any;

  const contact = await prisma.contact.update({
    where: { id },
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

  const existing = await prisma.contact.findUnique({ where: { id } });
  if (!existing) {
    return sendNotFound(c, "Contatto non trovato");
  }

  const contact = await prisma.contact.update({
    where: { id },
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
  const { id } = getValidatedParams<ContactIdParam>(c);
  const { companyId } = getValidatedQuery<{ companyId: number }>(c);

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

  const contact = await prisma.contact.findUnique({
    where: { id },
    include: { _count: { select: { documents: true } } },
  });

  if (!contact) {
    return sendNotFound(c, "Contatto non trovato");
  }

  if (contact._count.documents > 0) {
    return sendFail(c, {
      message: `Impossibile eliminare: ${contact._count.documents} documenti associati`,
    });
  }

  await prisma.contact.delete({ where: { id } });

  return sendDeleted(c, "Contatto eliminato");
};

// ============================================================================
// CHECK EMAIL
// ============================================================================

/**
 * Checks whether an email address is already in use globally.
 */
export const checkEmail = async (c: Context<AppBindings>) => {
  const { email } = getValidatedQuery<CheckEmailInput>(c);

  const existing = await prisma.contact.findFirst({ where: { email } });

  if (existing) {
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
  const companyId = Number(c.req.param("companyId"));

  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) {
    return sendNotFound(c, "Company non trovata");
  }

  const contacts = await prisma.contact.findMany({
    where: {
      active: true,
      companies: { some: { companyId } },
    },
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
  const companyId = Number(c.req.param("companyId"));

  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) {
    return sendNotFound(c, "Company non trovata");
  }

  const primaryContact = await prisma.contact.findFirst({
    where: {
      active: true,
      companies: { some: { companyId, isPrimaryContact: true } },
    },
    include: getContactCompaniesInclude(companyId),
  });

  if (!primaryContact) {
    return sendNotFound(c, "Nessun contatto primario trovato per questa company");
  }

  return sendSuccess(c, primaryContact);
};
