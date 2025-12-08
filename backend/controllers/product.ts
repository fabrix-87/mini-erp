import { Response } from 'express';
import { AuthRequest } from '../types/user';
import asyncHandler from '../middleware/async-handler';
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
} from '../utils/app-error';
import { prisma } from '../config/prisma-client';
import { Prisma } from '../generated/prisma/client';
import { generateVariantCode, getProductSelection } from '../helpers/product'

// ============================================================================
// PRODUCTS - CRUD Operations
// ============================================================================

/**
 * @desc    Lista tutti i prodotti con filtri e paginazione
 * @route   GET /api/products
 * @access  Public
 */
export const getAllProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    page = 1,
    limit = 20,
    search,
    active,
    categoryId,
    manufacturerId,
    supplierId,
    type,
    condition,
    minPrice,
    maxPrice,
    onSale,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  // Costruisci filtri dinamici
  const where: Prisma.ProductWhereInput = {};

  // Filtro ricerca testuale
  if (search) {
    where.OR = [
      { reference: { contains: search as string, mode: 'insensitive' } },
      {
        translations: {
          some: {
            OR: [
              { name: { contains: search as string, mode: 'insensitive' } },
              { description: { contains: search as string, mode: 'insensitive' } },
            ],
          },
        },
      },
    ];
  }

  // Filtri semplici
  if (active !== undefined) where.active = active === 'true';
  if (type) where.type = type as any;
  if (condition) where.condition = condition as any;
  if (onSale !== undefined) where.onSale = onSale === 'true';
  if (manufacturerId) where.manufacturerId = Number(manufacturerId);
  if (supplierId) where.supplierId = Number(supplierId);

  // Filtro categoria
  if (categoryId) {
    where.categories = {
      some: { categoryId: Number(categoryId) },
    };
  }

  // Filtro range prezzo
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }

  // Query con paginazione
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: getProductSelection(),
      skip,
      take,
      orderBy: { [sortBy as string]: sortOrder },
    }),
    prisma.product.count({ where }),
  ]);

  res.json({
    status: 'success',
    results: products.length,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
    data: products,
  });
});

/**
 * @desc    Ottieni dettagli prodotto
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
    select: getProductSelection(),
  });

  if (!product) {
    throw new NotFoundError('Prodotto non trovato');
  }

  res.json({
    status: 'success',
    data: product,
  });
});

/**
 * @desc    Crea un nuovo prodotto
 * @route   POST /api/products
 * @access  Private (Admin, Product Manager)
 */
export const createProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { variants, ...productData } = req.body;

  // Verifica unicità reference
  const existingProduct = await prisma.product.findUnique({
    where: { reference: productData.reference },
  });

  if (existingProduct) {
    throw new ConflictError('Reference prodotto già esistente');
  }

  // Verifica che sia fornita almeno una variante
  if (!variants || !Array.isArray(variants) || variants.length === 0) {
    throw new BadRequestError('Almeno una variante è obbligatoria');
  }

  // Verifica unicità variantCode
  for (const variant of variants) {
    if (variant.variantCode) {
      const existingVariant = await prisma.productVariant.findUnique({
        where: { variantCode: variant.variantCode },
      });
      if (existingVariant) {
        throw new ConflictError(`Codice variante '${variant.variantCode}' già esistente`);
      }
    }
  }

  // Assicurati che almeno una variante sia impostata come default
  const hasDefault = variants.some(v => v.isDefault === true);
  if (!hasDefault) {
    variants[0].isDefault = true;
  }

  // Crea prodotto con varianti in una transazione
  const product = await prisma.$transaction(async (tx) => {
    // Crea il prodotto
    const newProduct = await tx.product.create({
      data: productData,
    });

    // Crea le varianti
    const createdVariants = await Promise.all(
      variants.map((variant: any) =>
        tx.productVariant.create({
          data: {
            ...variant,
            productId: newProduct.id,
          },
        })
      )
    );

    // Ritorna il prodotto completo
    return tx.product.findUnique({
      where: { id: newProduct.id },
      select: getProductSelection(),
    });
  });

  res.status(201).json({
    status: 'success',
    message: 'Prodotto creato con successo',
    data: product,
  });
});

/**
 * @desc    Aggiorna un prodotto
 * @route   PUT /api/products/:id
 * @access  Private (Admin, Product Manager)
 */
export const updateProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  // Verifica esistenza
  const existingProduct = await prisma.product.findUnique({
    where: { id: Number(id) },
  });

  if (!existingProduct) {
    throw new NotFoundError('Prodotto non trovato');
  }

  // Verifica unicità reference se modificato
  if (updateData.reference && updateData.reference !== existingProduct.reference) {
    const duplicateReference = await prisma.product.findUnique({
      where: { reference: updateData.reference },
    });

    if (duplicateReference) {
      throw new ConflictError('Reference prodotto già esistente');
    }
  }

  // Aggiorna prodotto
  const product = await prisma.product.update({
    where: { id: Number(id) },
    data: updateData,
    select: getProductSelection(),
  });

  res.json({
    status: 'success',
    message: 'Prodotto aggiornato con successo',
    data: product,
  });
});

/**
 * @desc    Elimina un prodotto
 * @route   DELETE /api/products/:id
 * @access  Private (Admin)
 */
export const deleteProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
  });

  if (!product) {
    throw new NotFoundError('Prodotto non trovato');
  }

  // Elimina prodotto (cascade gestirà le relazioni)
  await prisma.product.delete({
    where: { id: Number(id) },
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// ============================================================================
// PRODUCT VARIANTS
// ============================================================================

/**
 * @desc    Lista varianti di un prodotto
 * @route   GET /api/products/:id/variants
 * @access  Public
 */
export const getProductVariants = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const variants = await prisma.productVariant.findMany({
    where: { productId: Number(id) },
    include: {
      attributes: {
        include: {
          attribute: {
            include: {
              attributeGroup: true,
              translations: true,
            },
          },
        },
      },
    },
    orderBy: { position: 'asc' },
  });

  res.json({
    status: 'success',
    results: variants.length,
    data: variants,
  });
});

/**
 * @desc    Ottieni dettagli variante
 * @route   GET /api/products/:productId/variants/:id
 * @access  Public
 */
export const getVariantById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const variant = await prisma.productVariant.findUnique({
    where: { id: Number(id) },
    include: {
      product: {
        select: { id: true, reference: true },
      },
      attributes: {
        include: {
          attribute: {
            include: {
              attributeGroup: true,
              translations: true,
            },
          },
        },
      },
    },
  });

  if (!variant) {
    throw new NotFoundError('Variante non trovata');
  }

  res.json({
    status: 'success',
    data: variant,
  });
});

/**
 * @desc    Crea una nuova variante
 * @route   POST /api/products/:id/variants
 * @access  Private (Admin, Product Manager)
 */
export const createVariant = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const variantData = req.body;

  // Verifica esistenza prodotto
  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
  });

  if (!product) {
    throw new NotFoundError('Prodotto non trovato');
  }

  // Verifica unicità variantCode
  const existingVariant = await prisma.productVariant.findUnique({
    where: { variantCode: variantData.variantCode },
  });

  if (existingVariant) {
    throw new ConflictError('Codice variante già esistente');
  }

  // Crea variante
  const variant = await prisma.productVariant.create({
    data: {
      ...variantData,
      productId: Number(id),
    },
  });

  res.status(201).json({
    status: 'success',
    message: 'Variante creata con successo',
    data: variant,
  });
});

/**
 * @desc    Aggiorna una variante
 * @route   PUT /api/products/:productId/variants/:id
 * @access  Private (Admin, Product Manager)
 */
export const updateVariant = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const existingVariant = await prisma.productVariant.findUnique({
    where: { id: Number(id) },
  });

  if (!existingVariant) {
    throw new NotFoundError('Variante non trovata');
  }

  // Verifica unicità variantCode se modificato
  if (updateData.variantCode && updateData.variantCode !== existingVariant.variantCode) {
    const duplicateCode = await prisma.productVariant.findUnique({
      where: { variantCode: updateData.variantCode },
    });

    if (duplicateCode) {
      throw new ConflictError('Codice variante già esistente');
    }
  }

  const variant = await prisma.productVariant.update({
    where: { id: Number(id) },
    data: updateData,
  });

  res.json({
    status: 'success',
    message: 'Variante aggiornata con successo',
    data: variant,
  });
});

/**
 * @desc    Elimina una variante
 * @route   DELETE /api/products/:productId/variants/:id
 * @access  Private (Admin)
 */
export const deleteVariant = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id, productId } = req.params;

  const variant = await prisma.productVariant.findUnique({
    where: { id: Number(id) },
  });

  if (!variant) {
    throw new NotFoundError('Variante non trovata');
  }

  // Verifica che non sia l'ultima variante del prodotto
  const variantCount = await prisma.productVariant.count({
    where: { productId: Number(productId) },
  });

  if (variantCount <= 1) {
    throw new BadRequestError(
      'Impossibile eliminare l\'ultima variante. Un prodotto deve avere almeno una variante.'
    );
  }

  // Se è la variante default, imposta un'altra come default
  if (variant.isDefault) {
    const newDefault = await prisma.productVariant.findFirst({
      where: {
        productId: Number(productId),
        id: { not: Number(id) },
      },
      orderBy: { position: 'asc' },
    });

    if (newDefault) {
      await prisma.productVariant.update({
        where: { id: newDefault.id },
        data: { isDefault: true },
      });
    }
  }

  await prisma.productVariant.delete({
    where: { id: Number(id) },
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

/**
 * @desc    Crea prodotto semplice (helper)
 * @route   POST /api/products/simple
 * @access  Private (Admin, Product Manager)
 * @note    Questo endpoint semplifica la creazione di prodotti senza varianti complesse
 */
export const createSimpleProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    // Dati prodotto
    reference,
    defaultTaxRuleId,
    manufacturerId,
    supplierId,
    type = 'STANDARD',
    condition = 'NEW',
    
    // Dati variante (i dati "reali" del prodotto)
    sku,
    ean13,
    price,
    wholesalePrice,
    quantity = 0,
    weight,
    width,
    height,
    depth,
    location,
    
    // Traduzioni (almeno una lingua)
    translations,
    
    // Opzionale
    images,
    categoryIds,
    ...otherData
  } = req.body;

  // Validazioni base
  if (!reference || !defaultTaxRuleId) {
    throw new BadRequestError('Reference e defaultTaxRuleId sono obbligatori');
  }

  if (!translations || translations.length === 0) {
    throw new BadRequestError('Almeno una traduzione è obbligatoria');
  }

  // Verifica unicità reference
  const existingProduct = await prisma.product.findUnique({
    where: { reference },
  });

  if (existingProduct) {
    throw new ConflictError('Reference prodotto già esistente');
  }

  // Genera variantCode automaticamente
  const variantCode = generateVariantCode(reference);

  // Crea prodotto con variante default in transazione
  const product = await prisma.$transaction(async (tx) => {
    // 1. Crea il prodotto
    const newProduct = await tx.product.create({
      data: {
        reference,
        type,
        condition,
        defaultTaxRuleId,
        manufacturerId,
        supplierId,
        price: price || 0,
        wholesalePrice: wholesalePrice || 0,
        ...otherData,
      },
    });

    // 2. Crea la variante default
    await tx.productVariant.create({
      data: {
        productId: newProduct.id,
        variantCode,
        sku: sku || reference,
        ean13,
        price,
        wholesalePrice,
        quantity,
        weight,
        width,
        height,
        depth,
        location,
        isDefault: true,
        active: true,
      },
    });

    // 3. Crea le traduzioni
    if (translations && Array.isArray(translations)) {
      await Promise.all(
        translations.map((translation: any) =>
          tx.productTranslation.create({
            data: {
              productId: newProduct.id,
              languageId: translation.languageId,
              name: translation.name,
              description: translation.description,
              shortDescription: translation.shortDescription,
              metaTitle: translation.metaTitle,
              metaDescription: translation.metaDescription,
              linkRewrite: translation.linkRewrite,
            },
          })
        )
      );
    }

    // 4. Aggiungi immagini se presenti
    if (images && Array.isArray(images)) {
      await Promise.all(
        images.map((image: any, index: number) =>
          tx.productImage.create({
            data: {
              productId: newProduct.id,
              imageUrl: image.imageUrl,
              imageType: image.imageType || 'extra',
              position: image.position || index,
              isCover: index === 0, // Prima immagine come cover
            },
          })
        )
      );
    }

    // 5. Associa categorie se presenti
    if (categoryIds && Array.isArray(categoryIds)) {
      await Promise.all(
        categoryIds.map((categoryId: number, index: number) =>
          tx.productCategory.create({
            data: {
              productId: newProduct.id,
              categoryId,
              position: index,
            },
          })
        )
      );
    }

    // Ritorna prodotto completo
    return tx.product.findUnique({
      where: { id: newProduct.id },
      select: getProductSelection(),
    });
  });

  res.status(201).json({
    status: 'success',
    message: 'Prodotto semplice creato con successo',
    data: product,
  });
});

// ============================================================================
// PRODUCT TRANSLATIONS
// ============================================================================

/**
 * @desc    Lista traduzioni di un prodotto
 * @route   GET /api/products/:id/translations
 * @access  Public
 */
export const getProductTranslations = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const translations = await prisma.productTranslation.findMany({
    where: { productId: Number(id) },
    include: {
      language: {
        select: { id: true, name: true, iso_code: true },
      },
    },
  });

  res.json({
    status: 'success',
    results: translations.length,
    data: translations,
  });
});

/**
 * @desc    Crea una traduzione
 * @route   POST /api/products/:id/translations
 * @access  Private (Admin, Product Manager)
 */
export const createTranslation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const translationData = req.body;

  // Verifica esistenza prodotto
  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
  });

  if (!product) {
    throw new NotFoundError('Prodotto non trovato');
  }

  // Verifica se esiste già una traduzione per questa lingua
  const existingTranslation = await prisma.productTranslation.findUnique({
    where: {
      productId_languageId: {
        productId: Number(id),
        languageId: translationData.languageId,
      },
    },
  });

  if (existingTranslation) {
    throw new ConflictError('Traduzione già esistente per questa lingua');
  }

  const translation = await prisma.productTranslation.create({
    data: {
      ...translationData,
      productId: Number(id),
    },
  });

  res.status(201).json({
    status: 'success',
    message: 'Traduzione creata con successo',
    data: translation,
  });
});

/**
 * @desc    Aggiorna una traduzione
 * @route   PUT /api/products/:id/translations/:languageId
 * @access  Private (Admin, Product Manager)
 */
export const updateTranslation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id, languageId } = req.params;
  const updateData = req.body;

  const translation = await prisma.productTranslation.update({
    where: {
      productId_languageId: {
        productId: Number(id),
        languageId: Number(languageId),
      },
    },
    data: updateData,
  });

  res.json({
    status: 'success',
    message: 'Traduzione aggiornata con successo',
    data: translation,
  });
});

/**
 * @desc    Elimina una traduzione
 * @route   DELETE /api/products/:id/translations/:languageId
 * @access  Private (Admin, Product Manager)
 */
export const deleteTranslation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id, languageId } = req.params;

  await prisma.productTranslation.delete({
    where: {
      productId_languageId: {
        productId: Number(id),
        languageId: Number(languageId),
      },
    },
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// ============================================================================
// PRODUCT IMAGES
// ============================================================================

/**
 * @desc    Lista immagini di un prodotto
 * @route   GET /api/products/:id/images
 * @access  Public
 */
export const getProductImages = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const images = await prisma.productImage.findMany({
    where: { productId: Number(id) },
    orderBy: { position: 'asc' },
  });

  res.json({
    status: 'success',
    results: images.length,
    data: images,
  });
});

/**
 * @desc    Crea un'immagine
 * @route   POST /api/products/:id/images
 * @access  Private (Admin, Product Manager)
 */
export const createImage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const imageData = req.body;

  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
  });

  if (!product) {
    throw new NotFoundError('Prodotto non trovato');
  }

  const image = await prisma.productImage.create({
    data: {
      ...imageData,
      productId: Number(id),
    },
  });

  res.status(201).json({
    status: 'success',
    message: 'Immagine aggiunta con successo',
    data: image,
  });
});

/**
 * @desc    Aggiorna un'immagine
 * @route   PUT /api/products/:productId/images/:id
 * @access  Private (Admin, Product Manager)
 */
export const updateImage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const image = await prisma.productImage.update({
    where: { id: Number(id) },
    data: updateData,
  });

  res.json({
    status: 'success',
    message: 'Immagine aggiornata con successo',
    data: image,
  });
});

/**
 * @desc    Elimina un'immagine
 * @route   DELETE /api/products/:productId/images/:id
 * @access  Private (Admin, Product Manager)
 */
export const deleteImage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  await prisma.productImage.delete({
    where: { id: Number(id) },
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

/**
 * @desc    Imposta immagine come cover
 * @route   PATCH /api/products/:productId/images/:id/set-cover
 * @access  Private (Admin, Product Manager)
 */
export const setCoverImage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { productId, id } = req.params;

  // Rimuovi cover da tutte le altre immagini
  await prisma.productImage.updateMany({
    where: { productId: Number(productId), isCover: true },
    data: { isCover: false },
  });

  // Imposta questa come cover
  const image = await prisma.productImage.update({
    where: { id: Number(id) },
    data: { isCover: true },
  });

  res.json({
    status: 'success',
    message: 'Cover impostata con successo',
    data: image,
  });
});

// ============================================================================
// PRODUCT CATEGORIES
// ============================================================================

/**
 * @desc    Lista categorie di un prodotto
 * @route   GET /api/products/:id/categories
 * @access  Public
 */
export const getProductCategories = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const categories = await prisma.productCategory.findMany({
    where: { productId: Number(id) },
    include: {
      category: {
        include: {
          translations: true,
        },
      },
    },
    orderBy: { position: 'asc' },
  });

  res.json({
    status: 'success',
    results: categories.length,
    data: categories,
  });
});

/**
 * @desc    Associa categoria al prodotto
 * @route   POST /api/products/:id/categories
 * @access  Private (Admin, Product Manager)
 */
export const addCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { categoryId, position = 0 } = req.body;

  // Verifica se già esiste
  const existing = await prisma.productCategory.findUnique({
    where: {
      productId_categoryId: {
        productId: Number(id),
        categoryId: Number(categoryId),
      },
    },
  });

  if (existing) {
    throw new ConflictError('Categoria già associata');
  }

  const productCategory = await prisma.productCategory.create({
    data: {
      productId: Number(id),
      categoryId: Number(categoryId),
      position,
    },
  });

  res.status(201).json({
    status: 'success',
    message: 'Categoria aggiunta con successo',
    data: productCategory,
  });
});

/**
 * @desc    Rimuovi categoria dal prodotto
 * @route   DELETE /api/products/:productId/categories/:categoryId
 * @access  Private (Admin, Product Manager)
 */
export const removeCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { productId, categoryId } = req.params;

  await prisma.productCategory.delete({
    where: {
      productId_categoryId: {
        productId: Number(productId),
        categoryId: Number(categoryId),
      },
    },
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

/**
 * @desc    Aggiorna posizione categoria
 * @route   PATCH /api/products/:productId/categories/:categoryId/position
 * @access  Private (Admin, Product Manager)
 */
export const updateCategoryPosition = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { productId, categoryId } = req.params;
  const { position } = req.body;

  const productCategory = await prisma.productCategory.update({
    where: {
      productId_categoryId: {
        productId: Number(productId),
        categoryId: Number(categoryId),
      },
    },
    data: { position },
  });

  res.json({
    status: 'success',
    message: 'Posizione aggiornata con successo',
    data: productCategory,
  });
});

// ============================================================================
// MANUFACTURERS
// ============================================================================

/**
 * @desc    Lista tutti i produttori
 * @route   GET /api/products/manufacturers
 * @access  Public
 */
export const getAllManufacturers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const manufacturers = await prisma.manufacturer.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
  });

  res.json({
    status: 'success',
    results: manufacturers.length,
    data: manufacturers,
  });
});

/**
 * @desc    Ottieni dettagli produttore
 * @route   GET /api/products/manufacturers/:id
 * @access  Public
 */
export const getManufacturerById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const manufacturer = await prisma.manufacturer.findUnique({
    where: { id: Number(id) },
    include: {
      products: {
        select: { id: true, reference: true },
      },
    },
  });

  if (!manufacturer) {
    throw new NotFoundError('Produttore non trovato');
  }

  res.json({
    status: 'success',
    data: manufacturer,
  });
});

/**
 * @desc    Crea un nuovo produttore
 * @route   POST /api/products/manufacturers
 * @access  Private (Admin, Product Manager)
 */
export const createManufacturer = asyncHandler(async (req: AuthRequest, res: Response) => {
  const manufacturerData = req.body;

  const manufacturer = await prisma.manufacturer.create({
    data: manufacturerData,
  });

  res.status(201).json({
    status: 'success',
    message: 'Produttore creato con successo',
    data: manufacturer,
  });
});

/**
 * @desc    Aggiorna un produttore
 * @route   PUT /api/products/manufacturers/:id
 * @access  Private (Admin, Product Manager)
 */
export const updateManufacturer = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const manufacturer = await prisma.manufacturer.update({
    where: { id: Number(id) },
    data: updateData,
  });

  res.json({
    status: 'success',
    message: 'Produttore aggiornato con successo',
    data: manufacturer,
  });
});

/**
 * @desc    Elimina un produttore
 * @route   DELETE /api/products/manufacturers/:id
 * @access  Private (Admin)
 */
export const deleteManufacturer = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  await prisma.manufacturer.delete({
    where: { id: Number(id) },
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * @desc    Aggiorna multipli prodotti
 * @route   POST /api/products/bulk-update
 * @access  Private (Admin, Product Manager)
 */
export const bulkUpdateProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { productIds, updateData } = req.body;

  if (!Array.isArray(productIds) || productIds.length === 0) {
    throw new BadRequestError('Array di ID prodotti richiesto');
  }

  const result = await prisma.product.updateMany({
    where: {
      id: { in: productIds },
    },
    data: updateData,
  });

  res.json({
    status: 'success',
    message: `${result.count} prodotti aggiornati con successo`,
    data: { count: result.count },
  });
});

/**
 * @desc    Elimina multipli prodotti
 * @route   POST /api/products/bulk-delete
 * @access  Private (Admin)
 */
export const bulkDeleteProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { productIds } = req.body;

  if (!Array.isArray(productIds) || productIds.length === 0) {
    throw new BadRequestError('Array di ID prodotti richiesto');
  }

  const result = await prisma.product.deleteMany({
    where: {
      id: { in: productIds },
    },
  });

  res.json({
    status: 'success',
    message: `${result.count} prodotti eliminati con successo`,
    data: { count: result.count },
  });
});