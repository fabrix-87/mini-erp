import { Context } from "hono";
import { prisma } from "../config/prisma-config";
import {
  sendCreated,
  sendDeleted,
  sendFail,
  sendNotFound,
  sendSuccess,
} from "../utils/response-utils";
import { getValidatedBody, getValidatedParams } from "@/helpers/validated-context";
import { AppBindings } from "@/lib/hono-app";
import { CreateCompanyContactInput, UpdateCompanyContactInput } from "@mini-erp/shared/types";
import { getContactCompaniesInclude } from "@/helpers/contact-helper";

// ============================================================================
// PARAM TYPE (locale al controller)
// ============================================================================

type CompanyContactParams = {
  contactId: number;
  companyId: number;
};

// ============================================================================
// CREATE
// ============================================================================

/**
 * Creates a new CompanyContact association between an existing contact and company.
 * If isPrimaryContact is true, resets any existing primary for that company atomically.
 *
 * @route POST /api/company-contacts
 */
export const createCompanyContact = async (c: Context<AppBindings>) => {
  const { contactId, companyId, position, department, isPrimaryContact } =
    getValidatedBody<CreateCompanyContactInput>(c);

  // Verifica esistenza contact
  const contact = await prisma.contact.findUnique({ where: { id: contactId } });
  if (!contact) {
    return sendNotFound(c, "Contatto non trovato");
  }

  // Verifica esistenza company
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) {
    return sendNotFound(c, "Company non trovata");
  }

  // Verifica che l'associazione non esista già
  const existing = await prisma.companyContact.findUnique({
    where: { companyId_contactId: { contactId, companyId } },
  });
  if (existing) {
    return sendFail(c, {
      message: "Il contatto è già associato a questa company",
    });
  }

  const link = await prisma.$transaction(async (tx) => {
    // Se isPrimaryContact, azzera il primario esistente per questa company
    if (isPrimaryContact) {
      await tx.companyContact.updateMany({
        where: { companyId, isPrimaryContact: true },
        data: { isPrimaryContact: false },
      });
    }

    return tx.companyContact.create({
      data: {
        contactId,
        companyId,
        isPrimaryContact: isPrimaryContact ?? false,
        position: position ?? null,
        department: department ?? null,
      },
      include: {
        contact: { include: getContactCompaniesInclude() },
        company: { select: { id: true, code: true, companyName: true } },
      },
    });
  });

  return sendCreated(c, link.contact, "Associazione creata");
};

// ============================================================================
// UPDATE
// ============================================================================

/**
 * Updates position, department and/or isPrimaryContact for an existing CompanyContact.
 * If isPrimaryContact is set to true, demotes any other primary for the same company atomically.
 *
 * @route PATCH /api/company-contacts/:contactId/:companyId
 */
export const updateCompanyContact = async (c: Context<AppBindings>) => {
  const { contactId, companyId } = getValidatedParams<CompanyContactParams>(c);
  const data = getValidatedBody<UpdateCompanyContactInput>(c);

  const link = await prisma.companyContact.findUnique({
    where: { companyId_contactId: { contactId, companyId } },
  });
  if (!link) {
    return sendNotFound(c, "Associazione contatto-company non trovata");
  }

  const updated = await prisma.$transaction(async (tx) => {
    // Se si sta impostando come primario, azzera prima gli altri
    if (data.isPrimaryContact === true) {
      await tx.companyContact.updateMany({
        where: {
          companyId,
          isPrimaryContact: true,
          NOT: { contactId }, // escludi la riga corrente
        },
        data: { isPrimaryContact: false },
      });
    }

    return tx.companyContact.update({
      where: { companyId_contactId: { contactId, companyId } },
      data: {
        ...(data.position !== undefined && { position: data.position }),
        ...(data.department !== undefined && { department: data.department }),
        ...(data.isPrimaryContact !== undefined && {
          isPrimaryContact: data.isPrimaryContact,
        }),
      },
      include: {
        contact: { include: getContactCompaniesInclude() },
      },
    });
  });

  // Ritorniamo il Contact aggiornato (con tutte le companies) come fanno gli altri endpoint
  return sendSuccess(c, updated.contact, { message: "Associazione aggiornata" });
};

// ============================================================================
// DELETE
// ============================================================================

/**
 * Removes a CompanyContact association.
 * If the deleted link was the primary contact for that company, no automatic
 * promotion is performed — the caller decides who becomes primary.
 *
 * @route DELETE /api/company-contacts/:contactId/:companyId
 */
export const deleteCompanyContact = async (c: Context<AppBindings>) => {
  const { contactId, companyId } = getValidatedParams<CompanyContactParams>(c);

  const link = await prisma.companyContact.findUnique({
    where: { companyId_contactId: { contactId, companyId } },
  });
  if (!link) {
    return sendNotFound(c, "Associazione contatto-company non trovata");
  }

  await prisma.companyContact.delete({
    where: { companyId_contactId: { contactId, companyId } },
  });

  return sendDeleted(c, "Associazione rimossa");
};
