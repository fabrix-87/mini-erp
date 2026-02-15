// controllers/addresses.ts
import { Response } from "express";
import { AuthenticatedValidatedRequest } from "@/types/validate";
import { prisma } from "../config/prisma-client";
import { normalizeAddress } from "../utils/company";
import {
  buildAddressWhereClause,
  getAddressInclude,
  clearPrimaryAddresses,
  setPrimaryAddressAtomic,
} from "../helpers/company";

import asyncHandler from "@/middleware/async-handler";
import {
  AddressIdParam,
  AddressQueryInput,
  CreateAddressInput,
  UpdateAddressInput,
} from "@mini-erp/shared/types";

export const getAllAddresses = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const where = buildAddressWhereClause(
      req.validatedQuery as AddressQueryInput,
    );
    const addresses = await prisma.companyAddress.findMany({
      where,
      include: getAddressInclude(),
      orderBy: [{ isPrimary: "desc" }, { addressType: "asc" }],
    });
    res.json({ success: true, data: addresses, count: addresses.length });
  },
);

export const getAddressById = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams as AddressIdParam;
    const address = await prisma.companyAddress.findUnique({
      where: { id },
      include: getAddressInclude(),
    });
    if (!address) {
      res
        .status(404)
        .json({ success: false, message: "Indirizzo non trovato" });
      return;
    }
    res.json({ success: true, data: address });
  },
);

export const createAddress = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const data = req.validatedBody as CreateAddressInput;

    // Verifica company esiste
    const company = await prisma.company.findUnique({
      where: { id: data.companyId },
    });

    if (!company) {
      res.status(404).json({
        success: false,
        message: "Company non trovata",
      });
      return;
    }

    // Normalizza indirizzo
    data.address = normalizeAddress(data.address);
    data.city = normalizeAddress(data.city);

    // Se isPrimary, usa transazione atomica
    if (data.isPrimary) {
      const address = await prisma.$transaction(async (tx) => {
        // 1. Rimuovi flag primary da altri
        await tx.companyAddress.updateMany({
          where: {
            companyId: data.companyId,
            addressType: data.addressType,
            isPrimary: true,
          },
          data: {
            isPrimary: false,
          },
        });

        // 2. Crea nuovo indirizzo
        return tx.companyAddress.create({
          data,
          include: getAddressInclude(),
        });
      });

      res.status(201).json({
        success: true,
        message: "Indirizzo creato",
        data: address,
      });
    } else {
      // Creazione normale senza transazione
      const address = await prisma.companyAddress.create({
        data,
        include: getAddressInclude(),
      });

      res.status(201).json({
        success: true,
        message: "Indirizzo creato",
        data: address,
      });
    }
  },
);

export const updateAddress = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams as AddressIdParam;
    const data = req.validatedBody as UpdateAddressInput;

    const existing = await prisma.companyAddress.findUnique({
      where: { id },
    });
    if (!existing) {
      res
        .status(404)
        .json({ success: false, message: "Indirizzo non trovato" });
      return;
    }

    if (data.address) data.address = normalizeAddress(data.address);
    if (data.city) data.city = normalizeAddress(data.city);

    if (data.isPrimary && !existing.isPrimary) {
      await clearPrimaryAddresses(
        prisma,
        existing.companyId,
        existing.addressType,
      );
    }

    const address = await prisma.companyAddress.update({
      where: { id },
      data,
      include: getAddressInclude(),
    });

    res.json({ success: true, message: "Indirizzo aggiornato", data: address });
  },
);

export const setPrimaryAddress = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as AddressIdParam;

    const address = await prisma.companyAddress.findUnique({
      where: { id },
    });

    if (!address) {
      res.status(404).json({
        success: false,
        message: "Indirizzo non trovato",
      });
      return;
    }

    // Usa la versione atomica con transazione
    const updated = await setPrimaryAddressAtomic(prisma, id);

    res.json({
      success: true,
      message: "Indirizzo primario impostato",
      data: updated,
    });
  },
);

export const deleteAddress = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams as AddressIdParam;
    const address = await prisma.companyAddress.findUnique({
      where: { id },
    });

    if (!address) {
      res
        .status(404)
        .json({ success: false, message: "Indirizzo non trovato" });
      return;
    }

    if (address.addressType === "LEGAL") {
      const count = await prisma.companyAddress.count({
        where: { companyId: address.companyId, addressType: "LEGAL" },
      });
      if (count === 1) {
        res.status(400).json({
          success: false,
          message: "Non puoi eliminare l'unico indirizzo legale",
        });
        return;
      }
    }

    await prisma.companyAddress.delete({ where: { id } });
    res.json({ success: true, message: "Indirizzo eliminato" });
  },
);
