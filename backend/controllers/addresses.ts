// controllers/addresses.ts
import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma-client";
import { normalizeAddress } from "../utils/company";
import {
  buildAddressWhereClause,
  getAddressInclude,  
  clearPrimaryAddresses,
} from '../helpers/company';


export const getAllAddresses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const where = buildAddressWhereClause(req.query as any);
    const addresses = await prisma.companyAddress.findMany({
      where,
      include: getAddressInclude(),
      orderBy: [{ isPrimary: 'desc' }, { addressType: 'asc' }],
    });
    res.json({ success: true, data: addresses, count: addresses.length });
  } catch (error) {
    next(error);
  }
};

export const getAddressById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const address = await prisma.companyAddress.findUnique({
      where: { id: parseInt(req.params.id) },
      include: getAddressInclude(),
    });
    if (!address) {
      res.status(404).json({ success: false, message: 'Indirizzo non trovato' });
      return;
    }
    res.json({ success: true, data: address });
  } catch (error) {
    next(error);
  }
};

export const createAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    
    const company = await prisma.company.findUnique({ where: { id: data.companyId } });
    if (!company) {
      res.status(404).json({ success: false, message: 'Company non trovata' });
      return;
    }

    data.address = normalizeAddress(data.address);
    data.city = normalizeAddress(data.city);

    if (data.isPrimary) {
      await clearPrimaryAddresses(prisma, data.companyId, data.addressType);
    }

    const address = await prisma.companyAddress.create({
      data,
      include: getAddressInclude(),
    });

    res.status(201).json({ success: true, message: 'Indirizzo creato', data: address });
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const existing = await prisma.companyAddress.findUnique({ where: { id: parseInt(id) } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Indirizzo non trovato' });
      return;
    }

    if (data.address) data.address = normalizeAddress(data.address);
    if (data.city) data.city = normalizeAddress(data.city);

    if (data.isPrimary && !existing.isPrimary) {
      await clearPrimaryAddresses(prisma, existing.companyId, existing.addressType);
    }

    const address = await prisma.companyAddress.update({
      where: { id: parseInt(id) },
      data,
      include: getAddressInclude(),
    });

    res.json({ success: true, message: 'Indirizzo aggiornato', data: address });
  } catch (error) {
    next(error);
  }
};

export const setPrimaryAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const address = await prisma.companyAddress.findUnique({ where: { id: parseInt(id) } });
    
    if (!address) {
      res.status(404).json({ success: false, message: 'Indirizzo non trovato' });
      return;
    }

    await clearPrimaryAddresses(prisma, address.companyId, address.addressType);
    const updated = await prisma.companyAddress.update({
      where: { id: parseInt(id) },
      data: { isPrimary: true },
      include: getAddressInclude(),
    });

    res.json({ success: true, message: 'Indirizzo primario impostato', data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const address = await prisma.companyAddress.findUnique({ where: { id: parseInt(id) } });
    
    if (!address) {
      res.status(404).json({ success: false, message: 'Indirizzo non trovato' });
      return;
    }

    if (address.addressType === 'LEGAL') {
      const count = await prisma.companyAddress.count({
        where: { companyId: address.companyId, addressType: 'LEGAL' },
      });
      if (count === 1) {
        res.status(400).json({ success: false, message: 'Non puoi eliminare l\'unico indirizzo legale' });
        return;
      }
    }

    await prisma.companyAddress.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'Indirizzo eliminato' });
  } catch (error) {
    next(error);
  }
};