import { Response } from "express";
import asyncHandler from "../middleware/async-handler";
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
} from "../utils/app-error";
import { prisma } from "../config/prisma-client";
import { Prisma } from "../generated/prisma/client";
import { generateVariantCode, getProductSelection } from "../helpers/product";
import { AuthenticatedValidatedRequest } from "@/types/validate";

import {
  sendCreated,
  sendDeleted,
  sendPaginatedResponse,
  sendSuccess,
} from "@/utils/response";

import {
  CreateManufacturerInput,
  CreateProductCategoryInput,
  CreateProductImageInput,
  CreateProductInput,
  CreateProductVariantInput,
  CreateProductVariantTranslationInput,
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
} from "@mini-erp/shared";

// ============================================================================
// PRODUCTS - CRUD Operations
// ============================================================================

/**
 * @desc    Lista tutti i prodotti con filtri e paginazione
 * @route   GET /api/products
 * @access  Public
 */
export const getAllProducts = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
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
    } = req.validatedQuery as ProductQueryInput;

    const skip = (page - 1) * limit;

    // Costruisci filtri dinamici
    const where: Prisma.ProductWhereInput = {};

    // Filtro ricerca testuale
    if (search) {
      where.OR = [
        { reference: { contains: search, mode: "insensitive" } },
        {
          variants: {
            some: {
              translations: {
                some: {
                  OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } },
                  ],
                },
              },
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

    sendPaginatedResponse(res, products, total, page, limit);
  },
);

/**
 * @desc    Ottieni dettagli prodotto
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams as ProductIdParam;

    const product = await prisma.product.findUnique({
      where: { id, deletedAt: null },
      select: getProductSelection(),
    });

    if (!product) {
      throw new NotFoundError("Prodotto non trovato");
    }

    sendSuccess(res, product);
  },
);

/**
 * @desc    Crea un nuovo prodotto
 * @route   POST /api/products
 * @access  Private (Admin, Product Manager)
 */
export const createProduct = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { variants, ...productData } =
      req.validatedBody as CreateProductInput;

    // Verifica unicità reference
    const existingProduct = await prisma.product.findUnique({
      where: { reference: productData.reference },
    });
    if (existingProduct)
      throw new ConflictError("Reference prodotto già esistente");

    // Verifica unicità variantCode
    for (const variant of variants) {
      if (variant.variantCode) {
        const existingVariant = await prisma.productVariant.findUnique({
          where: { variantCode: variant.variantCode },
        });
        if (existingVariant) {
          throw new ConflictError(
            `Codice variante '${variant.variantCode}' già esistente`,
          );
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

    sendCreated(res, product, "Prodotto creato con successo");
  },
);

/**
 * @desc    Aggiorna un prodotto
 * @route   PUT /api/products/:id
 * @access  Private (Admin, Product Manager)
 */
export const updateProduct = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams as ProductIdParam;
    const updateData = req.validatedBody as UpdateProductInput;

    // Verifica esistenza
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Prodotto non trovato");

    // Verifica unicità reference se modificato
    if (updateData.reference && updateData.reference !== existing.reference) {
      const duplicate = await prisma.product.findUnique({
        where: { reference: updateData.reference },
      });
      if (duplicate)
        throw new ConflictError("Reference prodotto già esistente");
    }

    // Strip variants if accidentally passed (updateProductSchema is partial of createProductSchema)
    const { variants: _variants, ...safeData } =
      updateData as UpdateProductInput & { variants?: unknown };

    // Aggiorna prodotto
    const product = await prisma.product.update({
      where: { id },
      data: safeData as Prisma.ProductUpdateInput,
      select: getProductSelection(),
    });

    sendSuccess(res, product, { message: "Prodotto aggiornato con successo" });
  },
);

/**
 * @desc    Elimina un prodotto
 * @route   DELETE /api/products/:id
 * @access  Private (Admin)
 */
export const deleteProduct = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams as ProductIdParam;
    const deletedBy = req.user!.userId;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundError("Prodotto non trovato");

    await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy },
    });
    sendDeleted(res);
  },
);

// ============================================================================
// PRODUCT VARIANTS
// ============================================================================

/**
 * @desc    Lista varianti di un prodotto
 * @route   GET /api/products/:id/variants
 * @access  Public
 */
export const getProductVariants = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams as ProductIdParam;

    const variants = await prisma.productVariant.findMany({
      where: { productId: id, deletedAt: null },
      include: {
        translations: {
          include: {
            language: { select: { id: true, name: true, iso_code: true } },
          },
        },
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

    sendSuccess(res, variants, { results: variants.length });
  },
);

/**
 * @desc    Ottieni dettagli variante
 * @route   GET /api/products/:productId/variants/:id
 * @access  Public
 */
export const getVariantById = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams as ProductVariantIdParam;

    const variant = await prisma.productVariant.findUnique({
      where: { id, deletedAt: null },
      include: {
        product: { select: { id: true, reference: true } },
        translations: {
          include: {
            language: { select: { id: true, name: true, iso_code: true } },
          },
        },
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

    sendSuccess(res, variant);
  },
);

/**
 * @desc    Crea una nuova variante
 * @route   POST /api/products/:id/variants
 * @access  Private (Admin, Product Manager)
 */
export const createVariant = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams as ProductIdParam;
    const variantData = req.validatedBody as CreateProductVariantInput;

    // Verifica esistenza prodotto
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundError("Prodotto non trovato");

    // Verifica unicità variantCode
    const existingVariant = await prisma.productVariant.findUnique({
      where: { variantCode: variantData.variantCode },
    });
    if (existingVariant)
      throw new ConflictError("Codice variante già esistente");

    // Crea variante
    const variant = await prisma.productVariant.create({
      data: {
        ...variantData,
        productId: id,
      } as Prisma.ProductVariantCreateInput,
    });

    sendCreated(res, variant, "Variante creata con successo");
  },
);

/**
 * @desc    Aggiorna una variante
 * @route   PUT /api/products/:productId/variants/:id
 * @access  Private (Admin, Product Manager)
 */
export const updateVariant = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams as ProductVariantIdParam;
    const updateData = req.validatedBody as UpdateProductVariantInput;

    const existing = await prisma.productVariant.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Variante non trovata");

    // Verifica unicità variantCode se modificato
    if (
      updateData.variantCode &&
      updateData.variantCode !== existing.variantCode
    ) {
      const duplicate = await prisma.productVariant.findUnique({
        where: { variantCode: updateData.variantCode },
      });
      if (duplicate) throw new ConflictError("Codice variante già esistente");
    }

    const variant = await prisma.productVariant.update({
      where: { id },
      data: updateData as Prisma.ProductVariantUpdateInput,
    });

    sendSuccess(res, variant, { message: "Variante aggiornata con successo" });
  },
);

/**
 * @desc    Elimina una variante
 * @route   DELETE /api/products/:productId/variants/:id
 * @access  Private (Admin)
 */
export const deleteVariant = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams as ProductVariantIdParam;
    const { productId } = req.validatedParams as ProductIdAsProductIdParam;
    const deletedBy = req.user!.userId;

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

    sendDeleted(res);
  },
);

/**
 * @desc    Crea prodotto semplice (helper)
 * @route   POST /api/products/simple
 * @access  Private (Admin, Product Manager)
 * @note    Questo endpoint semplifica la creazione di prodotti senza varianti complesse
 */
export const createSimpleProduct = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const {
      reference,
      defaultTaxRuleId,
      manufacturerId,
      supplierId,
      type = "STANDARD",
      condition = "NEW",
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
      translations,
      images,
      categoryIds,
      ...otherData
    } = req.validatedBody;

    // Validazioni base
    if (!reference || !defaultTaxRuleId) {
      throw new BadRequestError(
        "Reference e defaultTaxRuleId sono obbligatori",
      );
    }
    if (!Array.isArray(translations) || translations.length === 0) {
      throw new BadRequestError("Almeno una traduzione è obbligatoria");
    }

    // Verifica unicità reference
    const existingProduct = await prisma.product.findUnique({
      where: { reference },
    });

    if (existingProduct)
      throw new ConflictError("Reference prodotto già esistente");

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
      const newVariant = await tx.productVariant.create({
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
      await Promise.all(
        (
          translations as Array<Partial<CreateProductVariantTranslationInput>>
        ).map((t) =>
          tx.productVariantTranslation.create({
            data: {
              productVariantId: newVariant.id,
              languageId: t.languageId!,
              name: t.name!,
              description: t.description,
              shortDescription: t.shortDescription,
              metaTitle: t.metaTitle,
              metaDescription: t.metaDescription,
              linkRewrite: t.linkRewrite,
            },
          }),
        ),
      );

      // 4. Aggiungi immagini se presenti
      if (Array.isArray(images)) {
        await Promise.all(
          (images as Array<Partial<CreateProductImageInput>>).map(
            (image, index) =>
              tx.productImage.create({
                data: {
                  productId: newProduct.id,
                  imageUrl: image.imageUrl!,
                  imageType: image.imageType ?? "extra",
                  position: image.position ?? index,
                  isCover: index === 0,
                },
              }),
          ),
        );
      }

      // 5. Associa categorie se presenti
      if (Array.isArray(categoryIds)) {
        await Promise.all(
          (categoryIds as number[]).map((categoryId, index) =>
            tx.productCategory.create({
              data: { productId: newProduct.id, categoryId, position: index },
            }),
          ),
        );
      }

      // Ritorna prodotto completo
      return tx.product.findUnique({
        where: { id: newProduct.id },
        select: getProductSelection(),
      });
    });

    sendCreated(res, product, "Prodotto semplice creato con successo");
  },
);

// ============================================================================
// VARIANT TRANSLATIONS (ProductVariantTranslation)
// ============================================================================
/**
 * @desc   List all translations for a variant
 * @route  GET /api/products/:productId/variants/:variantId/translations
 * @access Public
 */
export const getVariantTranslations = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams;

    const translations = await prisma.productTranslation.findMany({
      where: { productId: Number(id) },
      include: {
        language: {
          select: { id: true, name: true, iso_code: true },
        },
      },
    });

    sendSuccess(res, translations, { results: translations.length });
  },
);

/**
 * @desc    Crea una traduzione
 * @route   POST /api/products/:id/translations
 * @access  Private (Admin, Product Manager)
 */
export const createTranslation = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams;
    const translationData = req.validatedBody as CreateProductTranslationInput;

    // Verifica esistenza prodotto
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
    });

    if (!product) {
      throw new NotFoundError("Prodotto non trovato");
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
      throw new ConflictError("Traduzione già esistente per questa lingua");
    }

    const translation = await prisma.productTranslation.create({
      data: {
        ...translationData,
        productId: Number(id),
      },
    });

    sendCreated(res, translation, "Traduzione creata con successo");
  },
);

/**
 * @desc    Aggiorna una traduzione
 * @route   PUT /api/products/:id/translations/:languageId
 * @access  Private (Admin, Product Manager)
 */
export const updateTranslation = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id, languageId } = req.validatedParams;
    const updateData = req.validatedBody as UpdateProductTranslationInput;

    const translation = await prisma.productTranslation.update({
      where: {
        productId_languageId: {
          productId: Number(id),
          languageId: Number(languageId),
        },
      },
      data: updateData,
    });

    sendSuccess(res, translation, {
      message: "Traduzione aggiornata con successo",
    });
  },
);

/**
 * @desc    Elimina una traduzione
 * @route   DELETE /api/products/:id/translations/:languageId
 * @access  Private (Admin, Product Manager)
 */
export const deleteTranslation = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id, languageId } = req.validatedParams as ProductIdLanguageIdParam;

    await prisma.productTranslation.delete({
      where: {
        productId_languageId: {
          productId: Number(id),
          languageId: Number(languageId),
        },
      },
    });

    sendDeleted(res);
  },
);

// ============================================================================
// PRODUCT IMAGES
// ============================================================================

/**
 * @desc    Lista immagini di un prodotto
 * @route   GET /api/products/:id/images
 * @access  Public
 */
export const getProductImages = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams as ProductIdParam;

    const images = await prisma.productImage.findMany({
      where: { productId: id },
      orderBy: { position: "asc" },
    });

    sendSuccess(res, images, { results: images.length });
  },
);

/**
 * @desc    Crea un'immagine
 * @route   POST /api/products/:id/images
 * @access  Private (Admin, Product Manager)
 */
export const createImage = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams as ProductIdParam;
    const imageData = req.validatedBody as CreateProductImageInput;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundError("Prodotto non trovato");

    const image = await prisma.productImage.create({
      data: imageData,
    });

    sendCreated(res, image, "Immagine aggiunta con successo");
  },
);

/**
 * @desc    Aggiorna un'immagine
 * @route   PUT /api/products/:productId/images/:id
 * @access  Private (Admin, Product Manager)
 */
export const updateImage = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams as ProductImageIdParam;
    const updateData = req.validatedBody as UpdateProductImageInput;

    const image = await prisma.productImage.update({
      where: { id: Number(id) },
      data: updateData,
    });

    sendSuccess(res, image, { message: "Immagine aggiornata con successo" });
  },
);

/**
 * @desc    Elimina un'immagine
 * @route   DELETE /api/products/:productId/images/:id
 * @access  Private (Admin, Product Manager)
 */
export const deleteImage = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams as ProductImageIdParam;

    await prisma.productImage.delete({ where: { id } });
    sendDeleted(res);
  },
);

/**
 * @desc    Imposta immagine come cover
 * @route   PATCH /api/products/:productId/images/:id/set-cover
 * @access  Private (Admin, Product Manager)
 */
export const setCoverImage = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { productId, id } = req.validatedParams as ProductImageIdParam;

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

    sendSuccess(res, image, { message: "Cover impostata con successo" });
  },
);

// ============================================================================
// PRODUCT CATEGORIES
// ============================================================================

/**
 * @desc    Lista categorie di un prodotto
 * @route   GET /api/products/:id/categories
 * @access  Public
 */
export const getProductCategories = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams as ProductIdParam;

    const categories = await prisma.productCategory.findMany({
      where: { productId: id },
      include: { category: { include: { translations: true } } },
      orderBy: { position: "asc" },
    });

    sendSuccess(res, categories, { results: categories.length });
  },
);

/**
 * @desc    Associa categoria al prodotto
 * @route   POST /api/products/:id/categories
 * @access  Private (Admin, Product Manager)
 */
export const addCategory = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams as ProductIdParam;
    const { categoryId, position = 0 } = req.validatedBody as CreateProductCategoryInput;

    // Verifica se già esiste
    const existing = await prisma.productCategory.findUnique({
      where: { productId_categoryId: { productId: id, categoryId } },
    });
    if (existing) throw new ConflictError("Categoria già associata");

    const productCategory = await prisma.productCategory.create({
      data: { productId: id, categoryId, position },
    });

    sendCreated(res, productCategory, "Categoria aggiunta con successo");
  },
);

/**
 * @desc    Rimuovi categoria dal prodotto
 * @route   DELETE /api/products/:productId/categories/:categoryId
 * @access  Private (Admin, Product Manager)
 */
export const removeCategory = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { productId, categoryId } = req.validatedParams as ProductCategoryIdParam;

    await prisma.productCategory.delete({
      where: { productId_categoryId: { productId, categoryId } },
    });

    sendDeleted(res);
  },
);

/**
 * @desc    Aggiorna posizione categoria
 * @route   PATCH /api/products/:productId/categories/:categoryId/position
 * @access  Private (Admin, Product Manager)
 */
export const updateCategoryPosition = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { productId, categoryId } = req.validatedParams;
    const { position } = req.validatedBody as UpdateProductCategoryInput;

    const productCategory = await prisma.productCategory.update({
      where: { productId_categoryId: { productId, categoryId } },
      data:  { position },
    });

    sendSuccess(res, productCategory, {
      message: "Posizione aggiornata con successo",
    });
  },
);

// ============================================================================
// MANUFACTURERS
// ============================================================================

/**
 * @desc    Lista tutti i produttori
 * @route   GET /api/products/manufacturers
 * @access  Public
 */
export const getAllManufacturers = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const manufacturers = await prisma.manufacturer.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });

    sendSuccess(res, manufacturers, {
      results: manufacturers.length,
    });
  },
);

/**
 * @desc    Ottieni dettagli produttore
 * @route   GET /api/products/manufacturers/:id
 * @access  Public
 */
export const getManufacturerById = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams as ManufacturerIdParam;

    const manufacturer = await prisma.manufacturer.findUnique({
      where:   { id },
      include: { products: { select: { id: true, reference: true } } },
    });

    if (!manufacturer) throw new NotFoundError("Produttore non trovato");

    sendSuccess(res, manufacturer);
  },
);

/**
 * @desc    Crea un nuovo produttore
 * @route   POST /api/products/manufacturers
 * @access  Private (Admin, Product Manager)
 */
export const createManufacturer = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const manufacturerData = req.validatedBody as CreateManufacturerInput;

    const manufacturer = await prisma.manufacturer.create({
      data: manufacturerData,
    });

    sendCreated(res, manufacturer, "Produttore creato con successo");
  },
);

/**
 * @desc    Aggiorna un produttore
 * @route   PUT /api/products/manufacturers/:id
 * @access  Private (Admin, Product Manager)
 */
export const updateManufacturer = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams as ManufacturerIdParam;
    const updateData = req.validatedBody as UpdateManufacturerInput;

    const manufacturer = await prisma.manufacturer.update({
      where: { id },
      data:  updateData,
    });

    sendSuccess(res, manufacturer, {
      message: "Produttore aggiornato con successo",
    });
  },
);

/**
 * @desc    Elimina un produttore
 * @route   DELETE /api/products/manufacturers/:id
 * @access  Private (Admin)
 */
export const deleteManufacturer = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { id } = req.validatedParams as ManufacturerIdParam;

    await prisma.manufacturer.delete({ where: { id } });

    sendDeleted(res);
  },
);

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * @desc    Aggiorna multipli prodotti
 * @route   POST /api/products/bulk-update
 * @access  Private (Admin, Product Manager)
 */
export const bulkUpdateProducts = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { productIds, updateData } = req.validatedBody as {
      productIds: number[];
      updateData: Prisma.ProductUpdateInput;
    };

    if (!Array.isArray(productIds) || productIds.length === 0) {
      throw new BadRequestError("Array di ID prodotti richiesto");
    }

    const result = await prisma.product.updateMany({
      where: { id: { in: productIds } },
      data:  updateData,
    });

    sendSuccess(res, { count: result.count }, {
      message: `${result.count} prodotti aggiornati con successo`,
    });
  },
);

/**
 * @desc    Elimina multipli prodotti
 * @route   POST /api/products/bulk-delete
 * @access  Private (Admin)
 */
export const bulkDeleteProducts = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { productIds } = req.validatedBody as { productIds: number[] };

    if (!Array.isArray(productIds) || productIds.length === 0) {
      throw new BadRequestError("Array di ID prodotti richiesto");
    }

    const result = await prisma.product.deleteMany({
      where: { id: { in: productIds } },
    });

    sendSuccess(res, { count: result.count }, {
      message: `${result.count} prodotti eliminati con successo`,
    });
  },
);
