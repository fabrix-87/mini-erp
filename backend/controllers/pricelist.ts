import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma-client';
import { Prisma } from '../generated/prisma/client';
import { BulkImportInput, CalculatePriceInput, PriceListItemQueryInput, PriceListQueryInput } from '../validators/pricelist';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Applica strategia di pricing
 */
const applyPricingStrategy = (
  basePrice: number,
  strategy: string,
  strategyValue: number,
  roundingMethod: string | null
): number => {
  let finalPrice = basePrice;

  switch (strategy) {
    case 'PERCENT_DECREASE':
      finalPrice = basePrice * (1 - strategyValue / 100);
      break;
    case 'PERCENT_INCREASE':
      finalPrice = basePrice * (1 + strategyValue / 100);
      break;
    case 'FIXED_DECREASE':
      finalPrice = basePrice - strategyValue;
      break;
    case 'FIXED_INCREASE':
      finalPrice = basePrice + strategyValue;
      break;
    case 'EXPLICIT':
    default:
      finalPrice = basePrice;
  }

  // Arrotondamento
  if (roundingMethod) {
    switch (roundingMethod) {
      case 'nearest_05':
        finalPrice = Math.round(finalPrice * 20) / 20;
        break;
      case 'nearest_10':
        finalPrice = Math.round(finalPrice / 10) * 10;
        break;
      case 'up':
        finalPrice = Math.ceil(finalPrice);
        break;
      case 'down':
        finalPrice = Math.floor(finalPrice);
        break;
    }
  }

  return Math.max(0, finalPrice);
};

/**
 * Calcola prezzo ricorsivamente da listini parent
 */
const calculatePriceFromParent = async (
  priceListId: number,
  variantId: number,
  quantity: number = 1
): Promise<number | null> => {
  const priceList = await prisma.priceList.findUnique({
    where: { id: priceListId },
    include: {
      parentList: true,
    },
  });

  if (!priceList) return null;

  // Cerca prezzo esplicito nel listino corrente
  const item = await prisma.priceListItem.findFirst({
    where: {
      priceListId,
      variantId,
      minQuantity: { lte: quantity },
    },
    orderBy: { minQuantity: 'desc' },
  });

  if (item && priceList.strategy === 'EXPLICIT') {
    return parseFloat(item.price.toString());
  }

  // Se non trovato o strategia dinamica, cerca nel parent
  if (priceList.parentListId) {
    const parentPrice = await calculatePriceFromParent(
      priceList.parentListId,
      variantId,
      quantity
    );

    if (parentPrice !== null) {
      return applyPricingStrategy(
        parentPrice,
        priceList.strategy,
        parseFloat(priceList.strategyValue.toString()),
        priceList.roundingMethod
      );
    }
  }

  // Se esiste item esplicito ma strategia dinamica
  if (item) {
    return parseFloat(item.price.toString());
  }

  return null;
};

// ============================================================================
// PRICE LIST CONTROLLER
// ============================================================================

/**
 * @desc    Ottieni tutti i Price Lists
 * @route   GET /api/price-lists
 * @access  Private (pricelist:read)
 */
export const getAllPriceLists = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      active,
      type,
      currency,
      validAt,
      sortBy = 'code',
      sortOrder = 'asc',
    } = req.query as unknown as PriceListQueryInput;

    const where: Prisma.PriceListWhereInput = {};

    if (active !== undefined) {
      where.active = active === true;
    }

    if (type) {
      where.type = type as any;
    }

    if (currency) {
      where.currency = currency as string;
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

    res.status(200).json({
      success: true,
      data: priceLists,
      count: priceLists.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Ottieni Price List per ID
 * @route   GET /api/price-lists/:id
 * @access  Private (pricelist:read)
 */
export const getPriceListById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const priceList = await prisma.priceList.findUnique({
      where: { id: parseInt(id) },
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
      res.status(404).json({
        success: false,
        message: 'Price List non trovato',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: priceList,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Crea nuovo Price List
 * @route   POST /api/price-lists
 * @access  Private (pricelist:create)
 */
export const createPriceList = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      code,
      name,
      currency = 'EUR',
      type = 'SALE',
      validFrom,
      validTo,
      active = true,
      parentListId,
      strategy = 'EXPLICIT',
      strategyValue = 0,
      roundingMethod = 'none',
    } = req.body;

    // Verifica unicità code
    const existingCode = await prisma.priceList.findUnique({
      where: { code },
    });

    if (existingCode) {
      res.status(400).json({
        success: false,
        message: 'Codice già esistente',
      });
      return;
    }

    // Se parentListId fornito, verifica esistenza
    if (parentListId) {
      const parentList = await prisma.priceList.findUnique({
        where: { id: parentListId },
      });

      if (!parentList) {
        res.status(404).json({
          success: false,
          message: 'Parent Price List non trovato',
        });
        return;
      }

      // Verifica cicli (non può essere parent di se stesso o suoi antenati)
      let currentParent = parentList;
      while (currentParent.parentListId) {
        if (currentParent.parentListId === parentListId) {
          res.status(400).json({
            success: false,
            message: 'Rilevato ciclo nella gerarchia dei listini',
          });
          return;
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
        currency,
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

    res.status(201).json({
      success: true,
      message: 'Price List creato con successo',
      data: priceList,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Aggiorna Price List
 * @route   PUT /api/price-lists/:id
 * @access  Private (pricelist:update)
 */
export const updatePriceList = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      code,
      name,
      currency,
      type,
      validFrom,
      validTo,
      active,
      parentListId,
      strategy,
      strategyValue,
      roundingMethod,
    } = req.body;

    const existingPriceList = await prisma.priceList.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingPriceList) {
      res.status(404).json({
        success: false,
        message: 'Price List non trovato',
      });
      return;
    }

    // Se code cambia, verifica unicità
    if (code && code !== existingPriceList.code) {
      const duplicateCode = await prisma.priceList.findUnique({
        where: { code },
      });

      if (duplicateCode) {
        res.status(400).json({
          success: false,
          message: 'Codice già esistente',
        });
        return;
      }
    }

    // Se parentListId cambia, verifica esistenza e cicli
    if (parentListId !== undefined && parentListId !== existingPriceList.parentListId) {
      if (parentListId !== null) {
        const parentList = await prisma.priceList.findUnique({
          where: { id: parentListId },
        });

        if (!parentList) {
          res.status(404).json({
            success: false,
            message: 'Parent Price List non trovato',
          });
          return;
        }

        // Verifica cicli
        if (parentListId === parseInt(id)) {
          res.status(400).json({
            success: false,
            message: 'Un listino non può essere parent di se stesso',
          });
          return;
        }
      }
    }

    const updateData: any = {};
    if (code !== undefined) updateData.code = code;
    if (name !== undefined) updateData.name = name;
    if (currency !== undefined) updateData.currency = currency;
    if (type !== undefined) updateData.type = type;
    if (validFrom !== undefined)
      updateData.validFrom = validFrom ? new Date(validFrom) : null;
    if (validTo !== undefined) updateData.validTo = validTo ? new Date(validTo) : null;
    if (active !== undefined) updateData.active = active;
    if (parentListId !== undefined) updateData.parentListId = parentListId;
    if (strategy !== undefined) updateData.strategy = strategy;
    if (strategyValue !== undefined)
      updateData.strategyValue = new Prisma.Decimal(strategyValue);
    if (roundingMethod !== undefined) updateData.roundingMethod = roundingMethod;

    const priceList = await prisma.priceList.update({
      where: { id: parseInt(id) },
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

    res.status(200).json({
      success: true,
      message: 'Price List aggiornato con successo',
      data: priceList,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Elimina Price List
 * @route   DELETE /api/price-lists/:id
 * @access  Private (pricelist:delete)
 */
export const deletePriceList = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const priceList = await prisma.priceList.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: { select: { id: true } },
        customers: { select: { id: true } },
        childrenLists: { select: { id: true } },
      },
    });

    if (!priceList) {
      res.status(404).json({
        success: false,
        message: 'Price List non trovato',
      });
      return;
    }

    const totalUsage =
      priceList.items.length +
      priceList.customers.length +
      priceList.childrenLists.length;

    if (totalUsage > 0) {
      res.status(400).json({
        success: false,
        message: 'Impossibile eliminare: Price List in uso',
        usage: {
          items: priceList.items.length,
          customers: priceList.customers.length,
          childrenLists: priceList.childrenLists.length,
        },
      });
      return;
    }

    await prisma.priceList.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: 'Price List eliminato con successo',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// PRICE LIST ITEM CONTROLLER
// ============================================================================

/**
 * @desc    Ottieni items di un Price List
 * @route   GET /api/price-lists/:priceListId/items
 * @access  Private (pricelist:read)
 */
export const getPriceListItems = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { priceListId } = req.params;
    const { variantId, minPrice, maxPrice } = req.query as PriceListItemQueryInput;

    const where: Prisma.PriceListItemWhereInput = {
      priceListId: parseInt(priceListId),
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
      orderBy: [{ variant: { variantCode: 'asc' } }, { minQuantity: 'asc' }],
    });

    res.status(200).json({
      success: true,
      data: items,
      count: items.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Crea Price List Item
 * @route   POST /api/price-lists/items
 * @access  Private (pricelist:create)
 */
export const createPriceListItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      priceListId,
      variantId,
      minQuantity = 1,
      price,
      discountPercent,
      validFrom,
      validTo,
    } = req.body;

    // Verifica esistenza Price List e Variant
    const [priceList, variant] = await Promise.all([
      prisma.priceList.findUnique({ where: { id: priceListId } }),
      prisma.productVariant.findUnique({ where: { id: variantId } }),
    ]);

    if (!priceList) {
      res.status(404).json({
        success: false,
        message: 'Price List non trovato',
      });
      return;
    }

    if (!variant) {
      res.status(404).json({
        success: false,
        message: 'Product Variant non trovato',
      });
      return;
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
      res.status(400).json({
        success: false,
        message: 'Item già esistente per questa combinazione',
      });
      return;
    }

    const item = await prisma.priceListItem.create({
      data: {
        priceListId,
        variantId,
        minQuantity,
        price: new Prisma.Decimal(price),
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

    res.status(201).json({
      success: true,
      message: 'Price List Item creato con successo',
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Aggiorna Price List Item
 * @route   PUT /api/price-lists/items/:id
 * @access  Private (pricelist:update)
 */
export const updatePriceListItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { minQuantity, price, discountPercent, validFrom, validTo } = req.body;

    const existingItem = await prisma.priceListItem.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingItem) {
      res.status(404).json({
        success: false,
        message: 'Price List Item non trovato',
      });
      return;
    }

    const updateData: any = {};
    if (minQuantity !== undefined) updateData.minQuantity = minQuantity;
    if (price !== undefined) updateData.price = new Prisma.Decimal(price);
    if (discountPercent !== undefined)
      updateData.discountPercent = discountPercent
        ? new Prisma.Decimal(discountPercent)
        : null;
    if (validFrom !== undefined)
      updateData.validFrom = validFrom ? new Date(validFrom) : null;
    if (validTo !== undefined) updateData.validTo = validTo ? new Date(validTo) : null;

    const item = await prisma.priceListItem.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        variant: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Price List Item aggiornato con successo',
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Elimina Price List Item
 * @route   DELETE /api/price-lists/items/:id
 * @access  Private (pricelist:delete)
 */
export const deletePriceListItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const item = await prisma.priceListItem.findUnique({
      where: { id: parseInt(id) },
    });

    if (!item) {
      res.status(404).json({
        success: false,
        message: 'Price List Item non trovato',
      });
      return;
    }

    await prisma.priceListItem.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: 'Price List Item eliminato con successo',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Bulk import items
 * @route   POST /api/price-lists/:priceListId/items/bulk
 * @access  Private (pricelist:create)
 */
export const bulkImportItems = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { priceListId } = req.params;
    const { items } = req.body as BulkImportInput;

    const priceList = await prisma.priceList.findUnique({
      where: { id: parseInt(priceListId) },
    });

    if (!priceList) {
      res.status(404).json({
        success: false,
        message: 'Price List non trovato',
      });
      return;
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
            error: 'Variant non trovato',
          });
          continue;
        }

        // Upsert (create or update)
        const priceListItem = await prisma.priceListItem.upsert({
          where: {
            priceListId_variantId_minQuantity: {
              priceListId: parseInt(priceListId),
              variantId: item.variantId,
              minQuantity: item.minQuantity || 1,
            },
          },
          update: {
            price: new Prisma.Decimal(item.price),
            discountPercent: item.discountPercent
              ? new Prisma.Decimal(item.discountPercent)
              : null,
          },
          create: {
            priceListId: parseInt(priceListId),
            variantId: item.variantId,
            minQuantity: item.minQuantity || 1,
            price: new Prisma.Decimal(item.price),
            discountPercent: item.discountPercent
              ? new Prisma.Decimal(item.discountPercent)
              : null,
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

    res.status(201).json({
      success: true,
      message: `${created.length} items importati con successo`,
      data: {
        created: created.length,
        errors: errors.length,
        errorDetails: errors,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Calcola prezzo per variant
 * @route   POST /api/price-lists/calculate-price
 * @access  Private (pricelist:read)
 */
export const calculatePrice = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { priceListId, variantId, quantity = 1 } = req.body as CalculatePriceInput;

    const price = await calculatePriceFromParent(priceListId, variantId, quantity);

    if (price === null) {
      res.status(404).json({
        success: false,
        message: 'Prezzo non trovato per questa combinazione',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        priceListId,
        variantId,
        quantity,
        price: price.toFixed(4),
      },
    });
  } catch (error) {
    next(error);
  }
};