import { prisma } from "../config/prisma-config";
import { Prisma } from "../generated/prisma/client";

import {
  BulkImportInput,
  CreatePriceListInput,
  CreatePriceListItemInput,
  PriceListIdParam,
  PriceListItemIdParam,
  PriceListItemQueryInput,
  PriceListQueryInput,
  ResolvePriceInput,
  UpdatePriceListInput,
  UpdatePriceListItemInput,
} from "@mini-erp/shared";
import {
  sendCreated,
  sendDeleted,
  sendFail,
  sendNotFound,
  sendSuccess,
} from "@/utils/response-utils";
import { Context } from "hono";
import { AppBindings } from "@/lib/hono-app";
import {
  getRequiredTenantId,
  getValidatedBody,
  getValidatedParams,
  getValidatedQuery,
} from "@/helpers/validated-context";
import { assertValidPriceListParent, PriceListError } from "@/helpers/pricelist-helper";
import { withTenantId } from "@/helpers/prisma-helper";
import { resolveVariantPrice } from "@/services/pricelist/price-resolver-service";

// ============================================================================
// PRICE LIST CONTROLLER
// ============================================================================

/**
 * @desc    Ottieni tutti i Price Lists
 * @route   GET /api/price-lists
 * @access  Private (pricelist:read)
 */
export const getAllPriceLists = async (c: Context<AppBindings>) => {
  const {
    active,
    type,
    currencyCode,
    validAt,
    sortBy = "code",
    sortOrder = "asc",
  } = getValidatedQuery<PriceListQueryInput>(c);
  const tenantId = getRequiredTenantId(c);

  const where: Prisma.PriceListWhereInput = withTenantId({}, tenantId);

  if (active !== undefined) {
    where.active = active === true;
  }

  if (type) {
    where.type = type;
  }

  if (currencyCode) {
    where.currencyCode = currencyCode;
  }

  if (validAt) {
    where.AND = [
      { OR: [{ validFrom: { lte: validAt } }, { validFrom: null }] },
      { OR: [{ validTo: { gte: validAt } }, { validTo: null }] },
    ];
  }

  const priceLists = await prisma.priceList.findMany({
    where,
    orderBy: { [sortBy as string]: sortOrder },
    include: {
      parentList: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      childrenLists: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      _count: {
        select: {
          items: true,
          customers: true,
        },
      },
    },
  });

  return sendSuccess(c, priceLists, {
    message: "PriceList recuperati",
    results: priceLists.length,
  });
};

/**
 * @desc    Ottieni Price List per ID
 * @route   GET /api/price-lists/:id
 * @access  Private (pricelist:read)
 */
export const getPriceListById = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<PriceListIdParam>(c);
  const tenantId = getRequiredTenantId(c);

  const priceList = await prisma.priceList.findUnique({
    where: { id, tenantId },
    include: {
      parentList: {
        select: {
          id: true,
          code: true,
          name: true,
          strategy: true,
        },
      },
      childrenLists: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      items: {
        include: {
          variant: {
            select: {
              id: true,
              sku: true,
              product: {
                select: {
                  id: true,
                  reference: true,
                },
              },
            },
          },
        },
        take: 50,
      },
      customers: {
        select: {
          id: true,
          company: {
            select: {
              id: true,
              companyName: true,
            },
          },
        },
        take: 10,
      },
    },
  });

  if (!priceList) {
    return sendNotFound(c, "Price List non trovata");
  }

  return sendSuccess(c, priceList, {
    message: "Price List recuperato",
  });
};

/**
 * @desc    Crea nuovo Price List
 * @route   POST /api/price-lists
 * @access  Private (pricelist:create)
 */
export const createPriceList = async (c: Context<AppBindings>) => {
  const {
    code,
    name,
    currencyCode = "EUR",
    type = "SALE",
    validFrom,
    validTo,
    active = true,
    parentListId,
    strategy = "EXPLICIT",
    strategyValue = 0,
    roundingMethod = "NONE",
  } = getValidatedBody<CreatePriceListInput>(c);
  const tenantId = getRequiredTenantId(c);

  // Verifica unicità code
  const existingCode = await prisma.priceList.findUnique({
    where: { tenantId_code: { code, tenantId } },
  });

  if (existingCode) {
    return sendFail(c, {
      message: "Codice già esistente",
    });
  }

  // Se parentListId fornito, verifica esistenza
  if (parentListId) {
    await assertValidPriceListParent(prisma, tenantId, {
      parentListId,
      currencyCode: currencyCode ?? currencyCode,
    });
  }

  const priceList = await prisma.priceList.create({
    data: {
      tenantId,
      code,
      name,
      currencyCode,
      type,
      validFrom: validFrom ? new Date(validFrom) : null,
      validTo: validTo ? new Date(validTo) : null,
      active,
      parentListId,
      strategy,
      strategyValue: new Prisma.Decimal(strategyValue),
      roundingMethod,
    },
    include: {
      parentList: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
    },
  });

  return sendCreated(c, priceList, "Price List creato con successo");
};

/**
 * @desc    Aggiorna Price List
 * @route   PUT /api/price-lists/:id
 * @access  Private (pricelist:update)
 */
export const updatePriceList = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<PriceListIdParam>(c);
  const {
    code,
    name,
    currencyCode,
    type,
    validFrom,
    validTo,
    active,
    parentListId,
    strategy,
    strategyValue,
    roundingMethod,
  } = getValidatedBody<UpdatePriceListInput>(c);
  const tenantId = getRequiredTenantId(c);

  const existingPriceList = await prisma.priceList.findUnique({
    where: { id, tenantId },
  });

  if (!existingPriceList) {
    return sendNotFound(c, "Price List non trovata");
  }

  // Se code cambia, verifica unicità
  if (code && code !== existingPriceList.code) {
    const duplicateCode = await prisma.priceList.findUnique({
      where: { tenantId_code: { tenantId, code } },
    });

    if (duplicateCode) {
      return sendFail(c, {
        message: "Codice già esistente",
      });
    }
  }

  // Se parentListId cambia, verifica esistenza e cicli
  if (parentListId) {
    await assertValidPriceListParent(prisma, tenantId, {
      listId: id,
      parentListId,
      currencyCode: currencyCode ?? existingPriceList.currencyCode,
    });
  }

  const updateData: any = {};
  if (code !== undefined) updateData.code = code;
  if (name !== undefined) updateData.name = name;
  if (currencyCode !== undefined) updateData.currency = currencyCode;
  if (type !== undefined) updateData.type = type;
  if (validFrom !== undefined) updateData.validFrom = validFrom ? new Date(validFrom) : null;
  if (validTo !== undefined) updateData.validTo = validTo ? new Date(validTo) : null;
  if (active !== undefined) updateData.active = active;
  if (parentListId !== undefined) updateData.parentListId = parentListId;
  if (strategy !== undefined) updateData.strategy = strategy;
  if (strategyValue !== undefined) updateData.strategyValue = new Prisma.Decimal(strategyValue);
  if (roundingMethod !== undefined) updateData.roundingMethod = roundingMethod;

  const priceList = await prisma.priceList.update({
    where: { id, tenantId },
    data: updateData,
    include: {
      parentList: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
    },
  });

  return sendSuccess(c, priceList, {
    message: "Price List aggiornato con successo",
  });
};

/**
 * @desc    Elimina Price List
 * @route   DELETE /api/price-lists/:id
 * @access  Private (pricelist:delete)
 */
export const deletePriceList = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<PriceListIdParam>(c);
  const tenantId = getRequiredTenantId(c);

  const priceList = await prisma.priceList.findUnique({
    where: { id, tenantId },
    include: {
      items: { select: { id: true } },
      customers: { select: { id: true } },
      childrenLists: { select: { id: true } },
    },
  });

  if (!priceList) {
    return sendNotFound(c, "Price List non trovato");
  }

  const totalUsage =
    priceList.items.length + priceList.customers.length + priceList.childrenLists.length;

  if (totalUsage > 0) {
    return sendFail(c, {
      message: "Impossibile eliminare: Price List in uso",
    });
    /*
      usage: {
          items: priceList.items.length,
          customers: priceList.customers.length,
          childrenLists: priceList.childrenLists.length,
        },
        */
  }

  await prisma.priceList.delete({
    where: { id, tenantId },
  });
  return sendDeleted(c, `Price List #${id} eliminato con successo`);
};

// ============================================================================
// PRICE LIST ITEM CONTROLLER
// ============================================================================

/**
 * @desc    Ottieni items di un Price List
 * @route   GET /api/price-lists/:priceListId/items
 * @access  Private (pricelist:read)
 */
export const getPriceListItems = async (c: Context<AppBindings>) => {
  const { priceListId } = getValidatedParams<PriceListItemIdParam>(c);
  const { variantId, minPrice, maxPrice } = getValidatedQuery<PriceListItemQueryInput>(c);
  const tenantId = getRequiredTenantId(c);

  const where: Prisma.PriceListItemWhereInput = {
    priceListId,
    tenantId,
  };

  if (variantId) {
    where.variantId = variantId;
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = minPrice;
    if (maxPrice) where.price.lte = maxPrice;
  }

  const items = await prisma.priceListItem.findMany({
    where,
    include: {
      variant: {
        include: {
          product: {
            select: {
              id: true,
              reference: true,
              translations: {
                select: {
                  name: true,
                  languageId: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: [{ variant: { sku: "asc" } }, { minQuantity: "asc" }],
  });

  return sendSuccess(c, items, {
    results: items.length,
  });
};

/**
 * @desc    Crea Price List Item
 * @route   POST /api/price-lists/:id/items
 * @access  Private (pricelist:create)
 */
export const createPriceListItem = async (c: Context<AppBindings>) => {
  const {
    variantId,
    minQuantity = 1,
    price,
    discountPercent,
    validFrom,
    validTo,
  } = getValidatedBody<CreatePriceListItemInput>(c);
  const tenantId = getRequiredTenantId(c);
  const { id: priceListId } = getValidatedParams<PriceListIdParam>(c);

  // Verifica esistenza Price List e Variant
  const [priceList, variant] = await Promise.all([
    prisma.priceList.findUnique({ where: { id: priceListId, tenantId } }),
    prisma.productVariant.findUnique({ where: { id: variantId, tenantId } }),
  ]);

  if (!priceList) {
    return sendNotFound(c, "Price List non trovato");
  }

  if (!variant) {
    return sendNotFound(c, "Product Variant non trovato");
  }

  // Verifica duplicati
  const existing = await prisma.priceListItem.findUnique({
    where: {
      priceListId_variantId_minQuantity: {
        priceListId,
        variantId,
        minQuantity,
      },
      tenantId,
    },
  });

  if (existing) {
    return sendNotFound(c, "Item già esistente per questa combinazione");
  }

  const item = await prisma.priceListItem.create({
    data: {
      tenantId,
      priceListId,
      variantId,
      minQuantity,
      price: price || 0,
      discountPercent: discountPercent ? new Prisma.Decimal(discountPercent) : null,
      validFrom: validFrom ? new Date(validFrom) : null,
      validTo: validTo ? new Date(validTo) : null,
    },
    include: {
      variant: {
        include: {
          product: {
            select: {
              reference: true,
            },
          },
        },
      },
    },
  });
  return sendCreated(c, item, "Price List Item creato con successo");
};

/**
 * @desc    Aggiorna Price List Item
 * @route   PUT /api/price-lists/items/:id
 * @access  Private (pricelist:update)
 */
export const updatePriceListItem = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<PriceListIdParam>(c);
  const { minQuantity, price, discountPercent, validFrom, validTo } =
    getValidatedBody<UpdatePriceListItemInput>(c);
  const tenantId = getRequiredTenantId(c);

  const existingItem = await prisma.priceListItem.findUnique({
    where: { id, tenantId },
  });

  if (!existingItem) {
    return sendNotFound(c, "Price List Item non trovato");
  }

  const updateData: any = {};
  if (minQuantity !== undefined) updateData.minQuantity = minQuantity;
  if (price !== undefined) updateData.price = new Prisma.Decimal(price);
  if (discountPercent !== undefined)
    updateData.discountPercent = discountPercent ? new Prisma.Decimal(discountPercent) : null;
  if (validFrom !== undefined) updateData.validFrom = validFrom ? new Date(validFrom) : null;
  if (validTo !== undefined) updateData.validTo = validTo ? new Date(validTo) : null;

  const item = await prisma.priceListItem.update({
    where: { id, tenantId },
    data: updateData,
    include: {
      variant: true,
    },
  });

  return sendSuccess(c, item, {
    message: "Price List Item aggiornato con successo",
  });
};

/**
 * @desc    Elimina Price List Item
 * @route   DELETE /api/price-lists/items/:id
 * @access  Private (pricelist:delete)
 */
export const deletePriceListItem = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<PriceListIdParam>(c);
  const tenantId = getRequiredTenantId(c);

  const item = await prisma.priceListItem.findUnique({
    where: { id, tenantId },
  });

  if (!item) {
    return sendNotFound(c, "Price List Item non trovato");
  }

  await prisma.priceListItem.delete({
    where: { id, tenantId },
  });

  return sendDeleted(c, "Price List Item eliminato con successo");
};

/**
 * @desc    Bulk import items
 * @route   POST /api/price-lists/:priceListId/items/bulk
 * @access  Private (pricelist:create)
 */
export const bulkImportItems = async (c: Context<AppBindings>) => {
  const { priceListId } = getValidatedParams<PriceListItemIdParam>(c);
  const { items } = getValidatedBody<BulkImportInput>(c);
  const tenantId = getRequiredTenantId(c);

  const priceList = await prisma.priceList.findUnique({
    where: { id: priceListId, tenantId },
  });

  if (!priceList) {
    return sendNotFound(c, "Price List Item non trovato");
  }

  const created = [];
  const errors = [];

  for (const item of items) {
    try {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId, tenantId },
      });

      if (!variant) {
        errors.push({
          variantId: item.variantId,
          error: "Variant non trovato",
        });
        continue;
      }

      // Upsert (create or update)
      const priceListItem = await prisma.priceListItem.upsert({
        where: {
          priceListId_variantId_minQuantity: {
            priceListId,
            variantId: item.variantId,
            minQuantity: item.minQuantity || 1,
          },
          tenantId,
        },
        update: {
          price: new Prisma.Decimal(item.price),
          discountPercent: item.discountPercent ? new Prisma.Decimal(item.discountPercent) : null,
        },
        create: {
          tenantId,
          priceListId,
          variantId: item.variantId,
          minQuantity: item.minQuantity || 1,
          price: new Prisma.Decimal(item.price),
          discountPercent: item.discountPercent ? new Prisma.Decimal(item.discountPercent) : null,
        },
      });

      created.push(priceListItem);
    } catch (err) {
      errors.push({
        variantId: item.variantId,
        error: (err as Error).message,
      });
    }
  }

  return sendSuccess(
    c,
    {
      created: created.length,
      errors: errors.length,
      errorDetails: errors,
    },
    {
      message: `${created.length} items importati con successo`,
    },
  );
};

/**
 * @desc    Resolve the unit price of a variant
 * @route   POST /api/price-lists/resolve-price
 * @access  Private (pricelist:read)
 */
export const resolvePrice = async (c: Context<AppBindings>) => {
  const input = getValidatedBody<ResolvePriceInput>(c);
  const tenantId = getRequiredTenantId(c);

  try {
    const resolved = await resolveVariantPrice(prisma, tenantId, input);
    return sendSuccess(c, resolved, {
      message: resolved.unitPrice === null ? "Nessun prezzo disponibile" : "Prezzo risolto",
    });
  } catch (err) {
    if (err instanceof PriceListError) {
      return err.code === "NOT_FOUND"
        ? sendNotFound(c, err.message)
        : sendFail(c, { message: err.message });
    }
    throw err;
  }
};
