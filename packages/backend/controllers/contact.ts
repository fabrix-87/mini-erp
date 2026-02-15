import { NextFunction, Response } from "express";
import { prisma } from "../config/prisma-client";
import { formatPaginatedResponse } from "../utils/response";
import asyncHandler from "../middleware/async-handler";
import { AuthenticatedValidatedRequest } from "../types/validate";
import {
  CheckMailInput,
  CompanyIdAsCompanyIdParam,
  ContactIdInput,
  ContactQueryInput,
  CreateContactInput,
  ToggleContactActiveInput,
  UpdateContactInput,
} from "@mini-erp/shared/types";

export const getAllContacts = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const {
      companyId,
      active,
      isPrimaryContact,
      search,
      page,
      limit,
      sortBy = "lastName",
      sortOrder = "asc",
    } = req.validatedQuery as ContactQueryInput;
    const where: any = {};

    if (companyId) where.companyId = companyId;
    if (active !== undefined) where.active = active === true;
    if (isPrimaryContact !== undefined)
      where.isPrimaryContact = isPrimaryContact === true;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Configurazione paginazione
    const skip = (page - 1) * limit;

    // Configurazione ordinamento dinamico
    let orderBy: any = [{ isPrimaryContact: "desc" }, { lastName: "asc" }];

    if (sortBy && sortOrder) {
      orderBy = [{ [sortBy]: sortOrder.toLowerCase() }];
    }

    // Query con paginazione
    const [contacts, totalCount] = await Promise.all([
      prisma.contact.findMany({
        where,
        include: {
          company: { select: { id: true, code: true, companyName: true } },
        },
        orderBy,
        skip,
        take: limit as number,
      }),
      prisma.contact.count({ where }),
    ]);

    res.json(formatPaginatedResponse(contacts, totalCount, page, limit));
  },
);

export const getContactById = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams as ContactIdInput;
    const contact = await prisma.contact.findUnique({
      where: { id },
      include: { company: true },
    });
    if (!contact) {
      res.status(404).json({ success: false, message: "Contatto non trovato" });
      return;
    }
    res.json({ success: true, data: contact });
  },
);

export const createContact = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const data = req.validatedBody as CreateContactInput;

    const company = await prisma.company.findUnique({
      where: { id: data.companyId },
    });
    if (!company) {
      res.status(404).json({ success: false, message: "Company non trovata" });
      return;
    }

    const existingEmail = await prisma.contact.findFirst({
      where: { companyId: data.companyId, email: data.email },
    });
    if (existingEmail) {
      res.status(400).json({
        success: false,
        message: "Email già esistente per questa company",
      });
      return;
    }

    if (data.isPrimaryContact) {
      await prisma.contact.updateMany({
        where: { companyId: data.companyId, isPrimaryContact: true },
        data: { isPrimaryContact: false },
      });
    }

    const contact = await prisma.contact.create({ data });
    res
      .status(201)
      .json({ success: true, message: "Contatto creato", data: contact });
  },
);

export const updateContact = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams as ContactIdInput;
    const data = req.validatedBody as UpdateContactInput;

    const existing = await prisma.contact.findUnique({
      where: { id },
    });
    if (!existing) {
      res.status(404).json({ success: false, message: "Contatto non trovato" });
      return;
    }

    if (data.isPrimaryContact && !existing.isPrimaryContact) {
      await prisma.contact.updateMany({
        where: { companyId: existing.companyId, isPrimaryContact: true },
        data: { isPrimaryContact: false },
      });
    }

    const contact = await prisma.contact.update({
      where: { id },
      data,
    });
    res.json({ success: true, message: "Contatto aggiornato", data: contact });
  },
);

export const toggleContactActive = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams as ContactIdInput;
    const { active } = req.validatedBody as ToggleContactActiveInput;
    const contact = await prisma.contact.update({
      where: { id },
      data: { active },
    });
    res.json({
      success: true,
      message: `Contatto ${active ? "attivato" : "disattivato"}`,
      data: contact,
    });
  },
);

export const setPrimaryContact = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams as ContactIdInput;
    const contact = await prisma.contact.findUnique({
      where: { id },
    });

    if (!contact) {
      res.status(404).json({ success: false, message: "Contatto non trovato" });
      return;
    }

    await prisma.contact.updateMany({
      where: { companyId: contact.companyId, isPrimaryContact: true },
      data: { isPrimaryContact: false },
    });

    const updated = await prisma.contact.update({
      where: { id },
      data: { isPrimaryContact: true },
    });

    res.json({
      success: true,
      message: "Contatto primario impostato",
      data: updated,
    });
  },
);

export const deleteContact = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams as ContactIdInput;
    const contact = await prisma.contact.findUnique({
      where: { id },
      include: { _count: { select: { documents: true } } },
    });

    if (!contact) {
      res.status(404).json({ success: false, message: "Contatto non trovato" });
      return;
    }

    if (contact._count.documents > 0) {
      res.status(400).json({
        success: false,
        message: `Impossibile eliminare: ${contact._count.documents} documenti associati`,
      });
      return;
    }

    await prisma.contact.delete({ where: { id } });
    res.json({ success: true, message: "Contatto eliminato" });
  },
);

export const checkEmail = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { companyId, email } = req.validatedQuery as CheckMailInput;

    const existingEmail = await prisma.contact.findFirst({
      where: { companyId, email },
    });
    if (existingEmail) {
      res.status(400).json({
        status: "failed",
        data: { unique: false },
        message: "Email già esistente per questa company",
      });
    } else {
      res.json({
        status: "success",
        data: { unique: true },
        message: "Email non presente",
      });
    }
    return;
  },
);

export const getContactsByCompany = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { companyId } = req.validatedParams as CompanyIdAsCompanyIdParam;

    // Verifica che la company esista
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      res.status(404).json({
        status: "failed",
        message: "Company non trovata",
      });
      return;
    }

    // Trova il contatto primario
    const Contacts = await prisma.contact.findMany({
      where: {
        companyId,
        active: true, // Opzionale: solo contatti attivi
      },
      include: {
        company: {
          select: {
            id: true,
            code: true,
            companyName: true,
          },
        },
      },
    });

    res.json({
      status: "success",
      data: Contacts,
      message: "Contatti recuperati con successo",
    });
  },
);

export const getPrimaryContactByCompany = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { companyId } = req.validatedParams as CompanyIdAsCompanyIdParam;

    // Verifica che la company esista
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      res.status(404).json({
        status: "failed",
        message: "Company non trovata",
      });
      return;
    }

    // Trova il contatto primario
    const primaryContact = await prisma.contact.findFirst({
      where: {
        companyId,
        isPrimaryContact: true,
        active: true, // Opzionale: solo contatti attivi
      },
      include: {
        company: {
          select: {
            id: true,
            code: true,
            companyName: true,
          },
        },
      },
    });

    if (!primaryContact) {
      res.status(404).json({
        status: "failed",
        message: "Nessun contatto primario trovato per questa company",
      });
      return;
    }

    res.json({
      status: "success",
      data: primaryContact,
      message: "Contatto primario recuperato con successo",
    });
  },
);
