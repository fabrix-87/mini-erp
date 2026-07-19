// controllers/addresses-controller.ts
import { prisma } from "../config/prisma-config";
import { normalizeAddress } from "../utils/company-utils";
import {
  buildAddressWhereClause,
  getAddressInclude,
  setPrimaryAddressAtomic,
} from "../helpers/company-helper";

import {
  AddressIdParam,
  AddressQueryInput,
  CreateAddressInput,
  UpdateAddressInput,
} from "@mini-erp/shared/types";
import { Context } from "hono";
import { AppBindings } from "@/lib/hono-app";
import {
  getRequiredTenantId,
  getValidatedBody,
  getValidatedParams,
  getValidatedQuery,
} from "@/helpers/validated-context";
import {
  sendCreated,
  sendDeleted,
  sendFail,
  sendNotFound,
  sendSuccess,
} from "@/utils/response-utils";
import { withTenantId } from "@/helpers/prisma-helper";
import { NotFoundError } from "@/utils/app-error-utils";

export const getAllAddresses = async (c: Context<AppBindings>) => {
  const filters = getValidatedQuery<AddressQueryInput>(c);
  const tenantId = getRequiredTenantId(c);

  const company = await prisma.company.findFirst({
    where: withTenantId({ id: filters.companyId }, tenantId),
    select: { id: true },
  });

  if (!company) {
    throw new NotFoundError("Company not found");
  }

  const where = buildAddressWhereClause(filters);

  const addresses = await prisma.companyAddress.findMany({
    where,
    include: getAddressInclude(),
    orderBy: [{ isPrimary: "desc" }, { addressType: "asc" }],
  });
  return sendSuccess(c, addresses, {
    message: "Indirizzi recuperati con successo",
    results: addresses.length,
  });
};

export const getAddressById = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<AddressIdParam>(c);
  const address = await prisma.companyAddress.findUnique({
    where: { id },
    include: getAddressInclude(),
  });
  if (!address) {
    return sendNotFound(c, "Indirizzo non trovato");
  }
  return sendSuccess(c, address);
};

export const createAddress = async (c: Context<AppBindings>) => {
  const data = getValidatedBody<CreateAddressInput>(c);

  const company = await prisma.company.findUnique({
    where: { id: data.companyId },
  });
  if (!company) {
    return sendNotFound(c, "Company non trovata");
  }

  data.address = normalizeAddress(data.address);
  data.city = normalizeAddress(data.city);

  const address = await prisma.$transaction(async (tx) => {
    // Resetta gli altri primary solo se necessario
    if (data.isPrimary) {
      await tx.companyAddress.updateMany({
        where: {
          companyId: data.companyId,
          addressType: data.addressType,
          isPrimary: true,
        },
        data: { isPrimary: false },
      });
    }

    return tx.companyAddress.create({
      data,
      include: getAddressInclude(),
    });
  });

  return sendCreated(c, address, "Indirizzo creato");
};

export const updateAddress = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<AddressIdParam>(c);
  const data = getValidatedBody<UpdateAddressInput>(c);

  const existing = await prisma.companyAddress.findUnique({
    where: { id },
  });
  if (!existing) {
    return sendNotFound(c, "Indirizzo non trovato");
  }

  if (data.address) data.address = normalizeAddress(data.address);
  if (data.city) data.city = normalizeAddress(data.city);

  const { isPrimary } = data;

  if (isPrimary && !existing.isPrimary) {
    await setPrimaryAddressAtomic(prisma, id);
  }

  const address = await prisma.companyAddress.update({
    where: { id },
    data: data,
    include: getAddressInclude(),
  });
  return sendSuccess(c, address, { message: "Indirizzo aggiornato" });
};

export const setPrimaryAddress = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<AddressIdParam>(c);

  const address = await prisma.companyAddress.findUnique({
    where: { id },
  });

  if (!address) {
    return sendNotFound(c, "Indirizzo non trovato");
  }

  // Usa la versione atomica con transazione
  const updated = await setPrimaryAddressAtomic(prisma, id);

  return sendSuccess(c, updated, {
    message: "Indirizzo primario impostato",
  });
};

export const deleteAddress = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<AddressIdParam>(c);
  const address = await prisma.companyAddress.findUnique({
    where: { id },
  });

  if (!address) {
    return sendNotFound(c, "Indirizzo non trovato");
  }

  if (address.addressType === "LEGAL") {
    const count = await prisma.companyAddress.count({
      where: { companyId: address.companyId, addressType: "LEGAL" },
    });
    if (count === 1) {
      return sendFail(c, {
        statusCode: 400,
        message: "Non puoi eliminare l'unico indirizzo legale",
      });
    }
  }
  await prisma.companyAddress.delete({ where: { id } });
  return sendDeleted(c, "Indirizzo eliminato");
};
