import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma-client";
import { ApiResponse } from "../types/api-response"
import logger from "../config/logger";

export const getAllContacts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId, active, isPrimaryContact, search, pagination } = req.query;
    const where: any = {};
    
    if (companyId) where.companyId = parseInt(companyId as string);
    if (active !== undefined) where.active = active === 'true';
    if (isPrimaryContact !== undefined) where.isPrimaryContact = isPrimaryContact === 'true';
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Parsing dei parametri di paginazione
    const paginationParams = pagination ? JSON.parse(pagination as string) : null;
    
    // Configurazione paginazione
    const page = paginationParams?.page || 1;
    const limit = paginationParams?.limit || 50;
    const skip = (page - 1) * limit;

    // Configurazione ordinamento dinamico
    let orderBy: any = [{ isPrimaryContact: 'desc' }, { lastName: 'asc' }];
    
    if (paginationParams?.sortBy && paginationParams?.sortOrder) {
      const sortFieldMap: Record<string, string> = {
        firstname: 'firstName',
        lastname: 'lastName',
        companyId: 'companyId',
        email: 'email'
      };
      
      const sortField = sortFieldMap[paginationParams.sortBy];
      orderBy = [{ [sortField]: paginationParams.sortOrder }];
    }

    // Query con paginazione
    const [contacts, totalCount] = await Promise.all([
      prisma.contact.findMany({
        where,
        include: { company: { select: { id: true, code: true, companyName: true } } },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.contact.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    const response: ApiResponse = {
      status: "success",
      data: contacts,
      results: contacts.length,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};


export const getContactById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { company: true },
    });
    if (!contact) {
      res.status(404).json({ success: false, message: 'Contatto non trovato' });
      return;
    }
    res.json({ success: true, data: contact });
  } catch (error) {
    next(error);
  }
};

export const createContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    
    const company = await prisma.company.findUnique({ where: { id: data.companyId } });
    if (!company) {
      res.status(404).json({ success: false, message: 'Company non trovata' });
      return;
    }

    const existingEmail = await prisma.contact.findFirst({
      where: { companyId: data.companyId, email: data.email },
    });
    if (existingEmail) {
      res.status(400).json({ success: false, message: 'Email già esistente per questa company' });
      return;
    }

    if (data.isPrimaryContact) {
      await prisma.contact.updateMany({
        where: { companyId: data.companyId, isPrimaryContact: true },
        data: { isPrimaryContact: false },
      });
    }

    const contact = await prisma.contact.create({ data });
    res.status(201).json({ success: true, message: 'Contatto creato', data: contact });
  } catch (error) {
    next(error);
  }
};

export const updateContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const existing = await prisma.contact.findUnique({ where: { id: parseInt(id) } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Contatto non trovato' });
      return;
    }

    if (data.isPrimaryContact && !existing.isPrimaryContact) {
      await prisma.contact.updateMany({
        where: { companyId: existing.companyId, isPrimaryContact: true },
        data: { isPrimaryContact: false },
      });
    }

    const contact = await prisma.contact.update({ where: { id: parseInt(id) }, data });
    res.json({ success: true, message: 'Contatto aggiornato', data: contact });
  } catch (error) {
    next(error);
  }
};

export const toggleContactActive = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { active } = req.body;
    const contact = await prisma.contact.update({
      where: { id: parseInt(id) },
      data: { active },
    });
    res.json({ success: true, message: `Contatto ${active ? 'attivato' : 'disattivato'}`, data: contact });
  } catch (error) {
    next(error);
  }
};

export const setPrimaryContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const contact = await prisma.contact.findUnique({ where: { id: parseInt(id) } });
    
    if (!contact) {
      res.status(404).json({ success: false, message: 'Contatto non trovato' });
      return;
    }

    await prisma.contact.updateMany({
      where: { companyId: contact.companyId, isPrimaryContact: true },
      data: { isPrimaryContact: false },
    });

    const updated = await prisma.contact.update({
      where: { id: parseInt(id) },
      data: { isPrimaryContact: true },
    });

    res.json({ success: true, message: 'Contatto primario impostato', data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const contact = await prisma.contact.findUnique({
      where: { id: parseInt(id) },
      include: { _count: { select: { documents: true } } },
    });

    if (!contact) {
      res.status(404).json({ success: false, message: 'Contatto non trovato' });
      return;
    }

    if (contact._count.documents > 0) {
      res.status(400).json({
        success: false,
        message: `Impossibile eliminare: ${contact._count.documents} documenti associati`,
      });
      return;
    }

    await prisma.contact.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'Contatto eliminato' });
  } catch (error) {
    next(error);
  }
};
