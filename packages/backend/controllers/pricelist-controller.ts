import { prisma } from "../config/prisma-config";
import { Prisma } from "../generated/prisma/client";

import {
  BulkImportInput,
  CalculatePriceInput,
  CreatePriceListInput,
  CreatePriceListItemInput,
  PriceListIdParam,
  PriceListItemIdParam,
  PriceListItemQueryInput,
  PriceListQueryInput,
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
  getValidatedBody,
  getValidatedParams,
  getValidatedQuery,
} from "@/helpers/validated-context";
import { calculatePriceFromParent } from "@/helpers/pricelist-helper";

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

  const where: Prisma.PriceListWhereInput = {};

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

  const priceList = await prisma.priceList.findUnique({
    where: { id },
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
              variantCode: true,
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
    roundingMethod = "none",
  } = getValidatedBody<CreatePriceListInput>(c);

  // Verifica unicità code
  const existingCode = await prisma.priceList.findUnique({
    where: { code },
  });

  if (existingCode) {
    return sendFail(c, {
      message: "Codice già esistente",
    });
  }

  // Se parentListId fornito, verifica esistenza
  if (parentListId) {
    const parentList = await prisma.priceList.findUnique({
      where: { id: parentListId },
    });

    if (!parentList) {
      return sendNotFound(c, "Parent Price List non trovato");
    }

    // Verifica cicli (non può essere parent di se stesso o suoi antenati)
    let currentParent = parentList;
    while (currentParent.parentListId) {
      if (currentParent.parentListId === parentListId) {
        return sendFail(c, {
          message: "Rilevato ciclo nella gerarchia dei listini",
        });
      }
      const nextParent = await prisma.priceList.findUnique({
        where: { id: currentParent.parentListId },
      });
      if (!nextParent) break;
      currentParent = nextParent;
    }
  }

  const priceList = await prisma.priceList.create({
    data: {
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

  const existingPriceList = await prisma.priceList.findUnique({
    where: { id },
  });

  if (!existingPriceList) {
    return sendNotFound(c, "Price List non trovata");
  }

  // Se code cambia, verifica unicità
  if (code && code !== existingPriceList.code) {
    const duplicateCode = await prisma.priceList.findUnique({
      where: { code },
    });

    if (duplicateCode) {
      return sendFail(c, {
        message: "Codice già esistente",
      });
    }
  }

  // Se parentListId cambia, verifica esistenza e cicli
  if (parentListId !== undefined && parentListId !== existingPriceList.parentListId) {
    if (parentListId !== null) {
      const parentList = await prisma.priceList.findUnique({
        where: { id: parentListId },
      });

      if (!parentList) {
        return sendNotFound(c, "Parent Price List non trovata");
      }

      // Verifica cicli
      if (parentListId === id) {
        return sendFail(c, {
          message: "Un listino non può essere parent di se stesso",
        });
      }
    }
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
    where: { id },
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

  const priceList = await prisma.priceList.findUnique({
    where: { id },
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
    where: { id },
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

  const where: Prisma.PriceListItemWhereInput = {
    priceListId,
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
    orderBy: [{ variant: { variantCode: "asc" } }, { minQuantity: "asc" }],
  });

  return sendSuccess(c, items, {
    results: items.length,
  });
};

/**
 * @desc    Crea Price List Item
 * @route   POST /api/price-lists/items
 * @access  Private (pricelist:create)
 */
export const createPriceListItem = async (c: Context<AppBindings>) => {
  const {
    priceListId,
    variantId,
    minQuantity = 1,
    price,
    discountPercent,
    validFrom,
    validTo,
  } = getValidatedBody<CreatePriceListItemInput>(c);

  // Verifica esistenza Price List e Variant
  const [priceList, variant] = await Promise.all([
    prisma.priceList.findUnique({ where: { id: priceListId } }),
    prisma.productVariant.findUnique({ where: { id: variantId } }),
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
    },
  });

  if (existing) {
    return sendNotFound(c, "Item già esistente per questa combinazione");
  }

  const item = await prisma.priceListItem.create({
    data: {
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

  const existingItem = await prisma.priceListItem.findUnique({
    where: { id },
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
    where: { id },
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

  const item = await prisma.priceListItem.findUnique({
    where: { id },
  });

  if (!item) {
    return sendNotFound(c, "Price List Item non trovato");
  }

  await prisma.priceListItem.delete({
    where: { id },
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

  const priceList = await prisma.priceList.findUnique({
    where: { id: priceListId },
  });

  if (!priceList) {
    return sendNotFound(c, "Price List Item non trovato");
  }

  const created = [];
  const errors = [];

  for (const item of items) {
    try {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
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
        },
        update: {
          price: new Prisma.Decimal(item.price),
          discountPercent: item.discountPercent ? new Prisma.Decimal(item.discountPercent) : null,
        },
        create: {
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
 * @desc    Calcola prezzo per variant
 * @route   POST /api/price-lists/calculate-price
 * @access  Private (pricelist:read)
 */
export const calculatePrice = async (c: Context<AppBindings>) => {
  const { priceListId, variantId, quantity = 1 } = getValidatedBody<CalculatePriceInput>(c);

  const price = await calculatePriceFromParent(priceListId, variantId, quantity);

  if (price === null) {
    return sendNotFound(c, "Prezzo non trovato per questa combinazione");
  }

  return sendSuccess(c, {
    priceListId,
    variantId,
    quantity,
    price: price.toFixed(4),
  });
};
