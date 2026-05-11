import { NotFoundError, BadRequestError, ConflictError } from "../utils/app-error-utils";
import { prisma } from "../config/prisma-config";
import { Prisma } from "../generated/prisma/client";
import { getProductSelection } from "../helpers/product-helper";

import {
  sendCreated,
  sendDeleted,
  sendPaginatedResponse,
  sendSuccess,
} from "@/utils/response-utils";

import {
  CreateManufacturerInput,
  CreateProductCategoryInput,
  CreateProductImageInput,
  CreateProductInput,
  CreateProductVariantInput,
  CreateProductTranslationInput,
  ManufacturerIdParam,
  ProductCategoryIdParam,
  ProductIdAsProductIdParam,
  ProductIdParam,
  ProductImageIdParam,
  ProductQueryInput,
  ProductVariantIdParam,
  UpdateManufacturerInput,
  UpdateProductCategoryInput,
  UpdateProductImageInput,
  UpdateProductInput,
  UpdateProductVariantInput,
  ProductIdLanguageIdParam,
  UpdateProductTranslationInput,
} from "@mini-erp/shared";
import { Context } from "hono";
import { AppBindings } from "@/lib/hono-app";
import {
  getValidatedBody,
  getValidatedParams,
  getValidatedQuery,
} from "@/helpers/validated-context";

// ============================================================================
// PRODUCTS - CRUD Operations
// ============================================================================

/**
 * @desc    Lista tutti i prodotti con filtri e paginazione
 * @route   GET /api/products
 * @access  Public
 */
export const getAllProducts = async (c: Context<AppBindings>) => {
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
    sortBy = "createdAt",
    sortOrder = "desc",
  } = getValidatedQuery<ProductQueryInput>(c);

  const skip = (page - 1) * limit;

  // Costruisci filtri dinamici
  const where: Prisma.ProductWhereInput = {};

  // Filtro ricerca testuale
  if (search) {
    where.OR = [
      { reference: { contains: search, mode: "insensitive" } },
      {
        translations: {
          some: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      },
    ];
  }

  // Filtri semplici
  if (active !== undefined) where.active = active;
  if (type) where.type = type;
  if (condition) where.condition = condition;
  if (onSale !== undefined) where.onSale = onSale;
  if (manufacturerId) where.manufacturerId = manufacturerId;
  if (supplierId) where.supplierId = supplierId;

  // Filtro categoria
  if (categoryId) {
    where.categories = { some: { categoryId } };
  }

  // Filtro range prezzo
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = minPrice;
    if (maxPrice) where.price.lte = maxPrice;
  }

  where.deletedAt = null;

  // Query con paginazione
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: getProductSelection(),
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.product.count({ where }),
  ]);

  return sendPaginatedResponse(c, products, total, page, limit);
};

/**
 * @desc    Ottieni dettagli prodotto
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<ProductIdParam>(c);

  const product = await prisma.product.findUnique({
    where: { id, deletedAt: null },
    select: getProductSelection(),
  });

  if (!product) {
    throw new NotFoundError("Prodotto non trovato");
  }

  return sendSuccess(c, product);
};

/**
 * @desc    Crea un nuovo prodotto
 * @route   POST /api/products
 * @access  Private (Admin, Product Manager)
 */
export const createProduct = async (c: Context<AppBindings>) => {
  const { variants, ...productData } = getValidatedBody<CreateProductInput>(c);

  // Verifica unicità reference
  const existingProduct = await prisma.product.findUnique({
    where: { reference: productData.reference },
  });
  if (existingProduct) throw new ConflictError("Reference prodotto già esistente");

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
  if (!variants.some((v) => v.isDefault === true)) {
    variants[0].isDefault = true;
  }

  // Crea prodotto con varianti in una transazione
  const product = await prisma.$transaction(async (tx) => {
    // Crea il prodotto
    const newProduct = await tx.product.create({
      data: productData as Prisma.ProductCreateInput,
    });

    // Crea le varianti
    await Promise.all(
      variants.map((variant: any) =>
        tx.productVariant.create({
          data: {
            ...variant,
            productId: newProduct.id,
          } as Prisma.ProductVariantCreateInput,
        }),
      ),
    );

    // Ritorna il prodotto completo
    return tx.product.findUnique({
      where: { id: newProduct.id },
      select: getProductSelection(),
    });
  });

  return sendCreated(c, product, "Prodotto creato con successo");
};

/**
 * @desc    Aggiorna un prodotto
 * @route   PUT /api/products/:id
 * @access  Private (Admin, Product Manager)
 */
export const updateProduct = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<ProductIdParam>(c);
  const updateData = getValidatedBody<UpdateProductInput>(c);

  // Verifica esistenza
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError("Prodotto non trovato");

  // Verifica unicità reference se modificato
  if (updateData.reference && updateData.reference !== existing.reference) {
    const duplicate = await prisma.product.findUnique({
      where: { reference: updateData.reference },
    });
    if (duplicate) throw new ConflictError("Reference prodotto già esistente");
  }

  // Strip variants if accidentally passed (updateProductSchema is partial of createProductSchema)
  const { variants: _variants, ...safeData } = updateData as UpdateProductInput & {
    variants?: unknown;
  };

  // Aggiorna prodotto
  const product = await prisma.product.update({
    where: { id },
    data: safeData as Prisma.ProductUpdateInput,
    select: getProductSelection(),
  });

  sendSuccess(c, product, { message: "Prodotto aggiornato con successo" });
};

/**
 * @desc    Elimina un prodotto
 * @route   DELETE /api/products/:id
 * @access  Private (Admin)
 */
export const deleteProduct = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<ProductIdParam>(c);
  const deletedBy = c.get("user")!.userId;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new NotFoundError("Prodotto non trovato");

  await prisma.product.update({
    where: { id },
    data: { deletedAt: new Date(), deletedBy },
  });
  return sendDeleted(c);
};

// ============================================================================
// PRODUCT VARIANTS
// ============================================================================

/**
 * @desc    Lista varianti di un prodotto
 * @route   GET /api/products/:id/variants
 * @access  Public
 */
export const getProductVariants = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<ProductIdParam>(c);

  const variants = await prisma.productVariant.findMany({
    where: { productId: id, deletedAt: null },
    include: {
      attributes: {
        include: {
          attribute: {
            include: { attributeGroup: true, translations: true },
          },
        },
      },
    },
    orderBy: { position: "asc" },
  });

  return sendSuccess(c, variants, { results: variants.length });
};

/**
 * @desc    Ottieni dettagli variante
 * @route   GET /api/products/:productId/variants/:id
 * @access  Public
 */
export const getVariantById = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<ProductVariantIdParam>(c);

  const variant = await prisma.productVariant.findUnique({
    where: { id, deletedAt: null },
    include: {
      product: { select: { id: true, reference: true } },
      attributes: {
        include: {
          attribute: {
            include: { attributeGroup: true, translations: true },
          },
        },
      },
    },
  });

  if (!variant) throw new NotFoundError("Variante non trovata");

  return sendSuccess(c, variant);
};

/**
 * @desc    Crea una nuova variante
 * @route   POST /api/products/:id/variants
 * @access  Private (Admin, Product Manager)
 */
export const createVariant = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<ProductIdParam>(c);
  const variantData = getValidatedBody<CreateProductVariantInput>(c);

  // Verifica esistenza prodotto
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new NotFoundError("Prodotto non trovato");

  // Verifica unicità variantCode
  const existingVariant = await prisma.productVariant.findUnique({
    where: { variantCode: variantData.variantCode },
  });
  if (existingVariant) throw new ConflictError("Codice variante già esistente");

  // Crea variante
  const variant = await prisma.productVariant.create({
    data: {
      ...variantData,
      productId: id,
    } as Prisma.ProductVariantCreateInput,
  });

  return sendCreated(c, variant, "Variante creata con successo");
};

/**
 * @desc    Aggiorna una variante
 * @route   PUT /api/products/:productId/variants/:id
 * @access  Private (Admin, Product Manager)
 */
export const updateVariant = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<ProductVariantIdParam>(c);
  const updateData = getValidatedBody<UpdateProductVariantInput>(c);

  const existing = await prisma.productVariant.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError("Variante non trovata");

  // Verifica unicità variantCode se modificato
  if (updateData.variantCode && updateData.variantCode !== existing.variantCode) {
    const duplicate = await prisma.productVariant.findUnique({
      where: { variantCode: updateData.variantCode },
    });
    if (duplicate) throw new ConflictError("Codice variante già esistente");
  }

  const variant = await prisma.productVariant.update({
    where: { id },
    data: updateData as Prisma.ProductVariantUpdateInput,
  });

  return sendSuccess(c, variant, { message: "Variante aggiornata con successo" });
};

/**
 * @desc    Elimina una variante
 * @route   DELETE /api/products/:productId/variants/:id
 * @access  Private (Admin)
 */
export const deleteVariant = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<ProductVariantIdParam>(c);
  const { productId } = getValidatedParams<ProductIdAsProductIdParam>(c);
  const deletedBy = c.get("user")!.userId;

  const variant = await prisma.productVariant.findUnique({ where: { id } });
  if (!variant) throw new NotFoundError("Variante non trovata");

  // Verifica che non sia l'ultima variante del prodotto
  const variantCount = await prisma.productVariant.count({
    where: { productId },
  });

  if (variantCount <= 1) {
    throw new BadRequestError(
      "Impossibile eliminare l'ultima variante. Un prodotto deve avere almeno una variante.",
    );
  }

  // Se è la variante default, imposta un'altra come default
  if (variant.isDefault) {
    const newDefault = await prisma.productVariant.findFirst({
      where: { productId, id: { not: id } },
      orderBy: { position: "asc" },
    });
    if (newDefault) {
      await prisma.productVariant.update({
        where: { id: newDefault.id },
        data: { isDefault: true },
      });
    }
  }

  await prisma.productVariant.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      deletedBy,
    },
  });

  return sendDeleted(c);
};

// ============================================================================
// PRODUCT TRANSLATIONS
// ============================================================================

/**
 * @desc   List all translations for a product
 * @route  GET /api/products/:id/translations
 * @access Public
 */
export const getProductTranslations = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<ProductIdParam>(c);

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new NotFoundError("Prodotto non trovato");

  const translations = await prisma.productTranslation.findMany({
    where: { productId: id },
    include: {
      language: { select: { id: true, name: true, iso_code: true } },
    },
  });

  return sendSuccess(c, translations, { results: translations.length });
};

/**
 * @desc   Create a translation for a product
 * @route  POST /api/products/:id/translations
 * @access Private (Admin, Product Manager)
 */
export const createProductTranslation = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<ProductIdParam>(c);
  const translationData = getValidatedBody<CreateProductTranslationInput>(c);

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new NotFoundError("Prodotto non trovato");

  const existing = await prisma.productTranslation.findUnique({
    where: {
      productId_languageId: {
        productId: id,
        languageId: translationData.languageId,
      },
    },
  });
  if (existing) throw new ConflictError("Traduzione già esistente per questa lingua");

  const translation = await prisma.productTranslation.create({
    data: { ...translationData, productId: id },
  });

  return sendCreated(c, translation, "Traduzione creata con successo");
};

/**
 * @desc   Update a product translation
 * @route  PUT /api/products/:id/translations/:languageId
 * @access Private (Admin, Product Manager)
 */
export const updateProductTranslation = async (c: Context<AppBindings>) => {
  const { id, languageId } = getValidatedParams<ProductIdLanguageIdParam>(c);
  const updateData = getValidatedBody<UpdateProductTranslationInput>(c);

  const translation = await prisma.productTranslation.update({
    where: { productId_languageId: { productId: id, languageId } },
    data: updateData,
  });

  return sendSuccess(c, translation, {
    message: "Traduzione aggiornata con successo",
  });
};

/**
 * @desc   Delete a product translation
 * @route  DELETE /api/products/:id/translations/:languageId
 * @access Private (Admin, Product Manager)
 */
export const deleteProductTranslation = async (c: Context<AppBindings>) => {
  const { id, languageId } = getValidatedParams<ProductIdLanguageIdParam>(c);

  await prisma.productTranslation.delete({
    where: { productId_languageId: { productId: id, languageId } },
  });

  return sendDeleted(c);
};

// ============================================================================
// PRODUCT IMAGES
// ============================================================================

/**
 * @desc    Lista immagini di un prodotto
 * @route   GET /api/products/:id/images
 * @access  Public
 */
export const getProductImages = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<ProductIdParam>(c);

  const images = await prisma.productImage.findMany({
    where: { productId: id },
    orderBy: { position: "asc" },
  });

  return sendSuccess(c, images, { results: images.length });
};

/**
 * @desc    Crea un'immagine
 * @route   POST /api/products/:id/images
 * @access  Private (Admin, Product Manager)
 */
export const createImage = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<ProductIdParam>(c);
  const imageData = getValidatedBody<CreateProductImageInput>(c);

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new NotFoundError("Prodotto non trovato");

  const image = await prisma.productImage.create({
    data: imageData,
  });

  return sendCreated(c, image, "Immagine aggiunta con successo");
};

/**
 * @desc    Aggiorna un'immagine
 * @route   PUT /api/products/:productId/images/:id
 * @access  Private (Admin, Product Manager)
 */
export const updateImage = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<ProductImageIdParam>(c);
  const updateData = getValidatedBody<UpdateProductImageInput>(c);

  const image = await prisma.productImage.update({
    where: { id: Number(id) },
    data: updateData,
  });

  return sendSuccess(c, image, { message: "Immagine aggiornata con successo" });
};

/**
 * @desc    Elimina un'immagine
 * @route   DELETE /api/products/:productId/images/:id
 * @access  Private (Admin, Product Manager)
 */
export const deleteImage = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<ProductImageIdParam>(c);

  await prisma.productImage.delete({ where: { id } });
  return sendDeleted(c);
};

/**
 * @desc    Imposta immagine come cover
 * @route   PATCH /api/products/:productId/images/:id/set-cover
 * @access  Private (Admin, Product Manager)
 */
export const setCoverImage = async (c: Context<AppBindings>) => {
  const { productId, id } = getValidatedParams<ProductImageIdParam>(c);

  // Rimuovi cover da tutte le altre immagini
  await prisma.productImage.updateMany({
    where: { productId, isCover: true },
    data: { isCover: false },
  });

  // Imposta questa come cover
  const image = await prisma.productImage.update({
    where: { id },
    data: { isCover: true },
  });

  return sendSuccess(c, image, { message: "Cover impostata con successo" });
};

// ============================================================================
// PRODUCT CATEGORIES
// ============================================================================

/**
 * @desc    Lista categorie di un prodotto
 * @route   GET /api/products/:id/categories
 * @access  Public
 */
export const getProductCategories = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<ProductIdParam>(c);

  const categories = await prisma.productCategory.findMany({
    where: { productId: id },
    include: { category: { include: { translations: true } } },
    orderBy: { position: "asc" },
  });

  return sendSuccess(c, categories, { results: categories.length });
};

/**
 * @desc    Associa categoria al prodotto
 * @route   POST /api/products/:id/categories
 * @access  Private (Admin, Product Manager)
 */
export const addCategory = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<ProductIdParam>(c);
  const { categoryId, position = 0 } = getValidatedBody<CreateProductCategoryInput>(c);

  // Verifica se già esiste
  const existing = await prisma.productCategory.findUnique({
    where: { productId_categoryId: { productId: id, categoryId } },
  });
  if (existing) throw new ConflictError("Categoria già associata");

  const productCategory = await prisma.productCategory.create({
    data: { productId: id, categoryId, position },
  });

  return sendCreated(c, productCategory, "Categoria aggiunta con successo");
};

/**
 * @desc    Rimuovi categoria dal prodotto
 * @route   DELETE /api/products/:productId/categories/:categoryId
 * @access  Private (Admin, Product Manager)
 */
export const removeCategory = async (c: Context<AppBindings>) => {
  const { productId, categoryId } = getValidatedParams<ProductCategoryIdParam>(c);

  await prisma.productCategory.delete({
    where: { productId_categoryId: { productId, categoryId } },
  });

  return sendDeleted(c);
};

/**
 * @desc    Aggiorna posizione categoria
 * @route   PATCH /api/products/:productId/categories/:categoryId/position
 * @access  Private (Admin, Product Manager)
 */
export const updateCategoryPosition = async (c: Context<AppBindings>) => {
  const { productId, categoryId } = getValidatedParams<ProductCategoryIdParam>(c);
  const { position } = getValidatedBody<UpdateProductCategoryInput>(c);

  const productCategory = await prisma.productCategory.update({
    where: { productId_categoryId: { productId, categoryId } },
    data: { position },
  });

  return sendSuccess(c, productCategory, {
    message: "Posizione aggiornata con successo",
  });
};

// ============================================================================
// MANUFACTURERS
// ============================================================================

/**
 * @desc    Lista tutti i produttori
 * @route   GET /api/products/manufacturers
 * @access  Public
 */
export const getAllManufacturers = async (c: Context<AppBindings>) => {
  const manufacturers = await prisma.manufacturer.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  return sendSuccess(c, manufacturers, {
    results: manufacturers.length,
  });
};

/**
 * @desc    Ottieni dettagli produttore
 * @route   GET /api/products/manufacturers/:id
 * @access  Public
 */
export const getManufacturerById = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<ManufacturerIdParam>(c);

  const manufacturer = await prisma.manufacturer.findUnique({
    where: { id },
    include: { products: { select: { id: true, reference: true } } },
  });

  if (!manufacturer) throw new NotFoundError("Produttore non trovato");

  return sendSuccess(c, manufacturer);
};

/**
 * @desc    Crea un nuovo produttore
 * @route   POST /api/products/manufacturers
 * @access  Private (Admin, Product Manager)
 */
export const createManufacturer = async (c: Context<AppBindings>) => {
  const manufacturerData = getValidatedBody<CreateManufacturerInput>(c);

  const manufacturer = await prisma.manufacturer.create({
    data: manufacturerData,
  });

  return sendCreated(c, manufacturer, "Produttore creato con successo");
};

/**
 * @desc    Aggiorna un produttore
 * @route   PUT /api/products/manufacturers/:id
 * @access  Private (Admin, Product Manager)
 */
export const updateManufacturer = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<ManufacturerIdParam>(c);
  const updateData = getValidatedBody<UpdateManufacturerInput>(c);

  const manufacturer = await prisma.manufacturer.update({
    where: { id },
    data: updateData,
  });

  return sendSuccess(c, manufacturer, {
    message: "Produttore aggiornato con successo",
  });
};

/**
 * @desc    Elimina un produttore
 * @route   DELETE /api/products/manufacturers/:id
 * @access  Private (Admin)
 */
export const deleteManufacturer = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<ManufacturerIdParam>(c);

  await prisma.manufacturer.delete({ where: { id } });

  return sendDeleted(c);
};

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * @desc    Aggiorna multipli prodotti
 * @route   POST /api/products/bulk-update
 * @access  Private (Admin, Product Manager)
 */
export const bulkUpdateProducts = async (c: Context<AppBindings>) => {
  const { productIds, updateData } = getValidatedBody<{
    productIds: number[];
    updateData: Prisma.ProductUpdateInput;
  }>(c);

  if (!Array.isArray(productIds) || productIds.length === 0) {
    throw new BadRequestError("Array di ID prodotti richiesto");
  }

  const result = await prisma.product.updateMany({
    where: { id: { in: productIds } },
    data: updateData,
  });

  return sendSuccess(
    c,
    { count: result.count },
    {
      message: `${result.count} prodotti aggiornati con successo`,
    },
  );
};

/**
 * @desc    Elimina multipli prodotti
 * @route   POST /api/products/bulk-delete
 * @access  Private (Admin)
 */
export const bulkDeleteProducts = async (c: Context<AppBindings>) => {
  const { productIds } = getValidatedBody<{ productIds: number[] }>(c);

  if (!Array.isArray(productIds) || productIds.length === 0) {
    throw new BadRequestError("Array di ID prodotti richiesto");
  }

  const result = await prisma.product.deleteMany({
    where: { id: { in: productIds } },
  });

  return sendSuccess(
    c,
    { count: result.count },
    {
      message: `${result.count} prodotti eliminati con successo`,
    },
  );
};
