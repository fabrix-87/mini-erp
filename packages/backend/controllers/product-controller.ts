import {
  NotFoundError,
  BadRequestError,
  ConflictError,
  UnauthorizedError,
} from "../utils/app-error-utils";
import { prisma } from "../config/prisma-config";
import { Prisma } from "../generated/prisma/client";

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
  ProductIdParam,
  ProductImageIdParam,
  ProductQueryInput,
  UpdateManufacturerInput,
  UpdateProductCategoryInput,
  UpdateProductImageInput,
  UpdateProductInput,
  UpdateProductVariantInput,
  ProductIdLanguageIdParam,
  UpdateProductTranslationInput,
  ProductVariantDetailParams,
} from "@mini-erp/shared";
import { Context } from "hono";
import { AppBindings } from "@/lib/hono-app";
import {
  getRequiredTenantId,
  getValidatedBody,
  getValidatedParams,
  getValidatedQuery,
} from "@/helpers/validated-context";
import { withSoftDelete, withTenantId } from "@/helpers/prisma-helper";
import { createProductAggregate } from "@/services/product/create-product";
import {
  listProductTranslations as listProductTranslationsService,
  createProductTranslation as createProductTranslationService,
  updateProductTranslation as updateProductTranslationService,
  deleteProductTranslation as deleteProductTranslationService,
  updateProduct as updateProductService,
  deleteProduct as deleteProductService,
  getProductDetail,
  listProducts,
  changeProductStatus,
  listProductVariants,
  getProductVariant,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
  listProductImages,
} from "@/services/product";

// ============================================================================
// PRODUCTS - CRUD Operations
// ============================================================================

/**
 * @desc    Lista tutti i prodotti con filtri e paginazione
 * @route   GET /api/products
 * @access  Public
 */
/** Returns a paginated list of products in the current tenant. */
export const getAllProducts = async (c: Context<AppBindings>): Promise<Response> => {
  const tenantId = getRequiredTenantId(c);
  const query = getValidatedQuery<ProductQueryInput>(c);
  const { items, total, page, limit } = await listProducts(tenantId, query);

  return sendPaginatedResponse(c, items, total, page, limit);
};

/**
 * @desc    Ottieni dettagli prodotto
 * @route   GET /api/products/:id
 * @access  Public
 */
/** Returns the catalog detail for a product in the current tenant. */
export const getProductById = async (c: Context<AppBindings>): Promise<Response> => {
  const tenantId = getRequiredTenantId(c);
  const { id } = getValidatedParams<ProductIdParam>(c);

  return sendSuccess(c, await getProductDetail(tenantId, id));
};

/**
 * @desc    Crea un nuovo prodotto
 * @route   POST /api/products
 * @access  Private (product:create, product:manage)
 */
export const createProduct = async (c: Context<AppBindings>): Promise<Response> => {
  const tenantId = getRequiredTenantId(c);
  const input = getValidatedBody<CreateProductInput>(c);
  const product = await createProductAggregate(tenantId, input);

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
  const tenantId = c.get("currentTenantId")!;

  const product = updateProductService(tenantId, id, updateData);

  sendSuccess(c, product, { message: "Prodotto aggiornato con successo" });
};

/**
 * @desc    Soft-deletes an eligible product and records the authenticated actor.
 * @route   DELETE /api/products/:id
 * @access  Private (Admin)
 */
export const deleteProduct = async (c: Context<AppBindings>): Promise<Response> => {
  const tenantId = getRequiredTenantId(c);
  const { id } = getValidatedParams<ProductIdParam>(c);
  const user = c.get("user");

  if (!user) throw new UnauthorizedError("Autenticazione richiesta");

  await deleteProductService(tenantId, id, user.userId);

  return sendDeleted(c);
};

// ============================================================================
// PRODUCT VARIANTS
// ============================================================================

/**
 * @desc    Lists the visible variants of a product in the current tenant.
 * @route   GET /api/products/:id/variants
 * @access  Private (product:read, product:manage)
 */
export const getProductVariants = async (c: Context<AppBindings>): Promise<Response> => {
  const tenantId = getRequiredTenantId(c);
  const { id } = getValidatedParams<ProductIdParam>(c);
  const variants = await listProductVariants(tenantId, id);

  return sendSuccess(c, variants, { results: variants.length });
};

/**
 * @desc    Returns a variant belonging to the product identified by the route.
 * @route   GET /api/products/:productId/variants/:id
 * @access  Private (product:read, product:manage)
 */
export const getVariantById = async (c: Context<AppBindings>): Promise<Response> => {
  const tenantId = getRequiredTenantId(c);
  const { productId, id } = getValidatedParams<ProductVariantDetailParams>(c);

  return sendSuccess(c, await getProductVariant(tenantId, productId, id));
};

/**
 * @desc    Creates a variant for an existing product in the current tenant.
 * @route   POST /api/products/:id/variants
 * @access  Private (product:create, product:manage)
 */
export const createVariant = async (c: Context<AppBindings>): Promise<Response> => {
  const tenantId = getRequiredTenantId(c);
  const { id } = getValidatedParams<ProductIdParam>(c);
  const input = getValidatedBody<CreateProductVariantInput>(c);

  const variant = await createProductVariant(tenantId, id, input);

  return sendCreated(c, variant, "Variante creata con successo");
};

/**
 * @desc    Updates editable fields of a variant belonging to the route product.
 * @route   PUT /api/products/:productId/variants/:id
 * @access  Private (product:update, product:manage)
 */
export const updateVariant = async (c: Context<AppBindings>) => {
  const { productId, id } = getValidatedParams<ProductVariantDetailParams>(c);
  const updateData = getValidatedBody<UpdateProductVariantInput>(c);
  const tenantId = getRequiredTenantId(c);

  const variant = await updateProductVariant(tenantId, productId, id, updateData);

  return sendSuccess(c, variant, { message: "Variante aggiornata con successo" });
};

/**
 * @desc    Soft-deletes an unused variant and promotes an active default when needed.
 * @route   DELETE /api/products/:productId/variants/:id
 * @access  Private (product:delete, product:manage)
 */
export const deleteVariant = async (c: Context<AppBindings>): Promise<Response> => {
  const tenantId = getRequiredTenantId(c);
  const { productId, id } = getValidatedParams<ProductVariantDetailParams>(c);
  const user = c.get("user");

  if (!user) throw new UnauthorizedError("Autenticazione richiesta");

  await deleteProductVariant(tenantId, productId, id, user.userId);

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
  const tenantId = getRequiredTenantId(c);

  const translations = await listProductTranslationsService(tenantId, id);

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
  const tenantId = getRequiredTenantId(c);

  const translation = await createProductTranslationService(tenantId, id, translationData);

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
  const tenantId = getRequiredTenantId(c);

  const translation = await updateProductTranslationService(tenantId, id, languageId, updateData);

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
  const tenantId = getRequiredTenantId(c);

  await deleteProductTranslationService(tenantId, id, languageId);

  return sendDeleted(c);
};

// ============================================================================
// PRODUCT IMAGES
// ============================================================================

/**
 * @desc    Lists images of a product, excluding images bound to deleted variants.
 * @route   GET /api/products/:id/images
 * @access  Private (product:read, product:manage)
 */
export const getProductImages = async (c: Context<AppBindings>): Promise<Response> => {
  const tenantId = getRequiredTenantId(c);
  const { id } = getValidatedParams<ProductIdParam>(c);

  const images = await listProductImages(tenantId, id);

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
  const tenantId = c.get("currentTenantId")!;

  const manufacturer = await prisma.manufacturer.create({
    data: {
      ...manufacturerData,
      tenantId,
    },
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
  const tenantId = c.get("currentTenantId")!;

  if (!Array.isArray(productIds) || productIds.length === 0) {
    throw new BadRequestError("Array di ID prodotti richiesto");
  }

  const result = await prisma.product.updateMany({
    where: withSoftDelete(withTenantId({ id: { in: productIds } }, tenantId)),
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
  const tenantId = c.get("currentTenantId")!;
  const { userId } = c.get("user")!;

  if (!Array.isArray(productIds) || productIds.length === 0) {
    throw new BadRequestError("Array di ID prodotti richiesto");
  }

  const result = await prisma.product.updateMany({
    where: withSoftDelete(withTenantId({ id: { in: productIds } }, tenantId)),
    data: {
      deletedAt: new Date(),
      deletedBy: userId,
    },
  });

  return sendSuccess(
    c,
    { count: result.count },
    {
      message: `${result.count} prodotti eliminati con successo`,
    },
  );
};

/**
 * @desc    Activates a draft product or reactivates an archived product
 * @route   POST /:id/activate
 * @access  Private (product:update, product:manage)
 */
export const activateProduct = async (c: Context<AppBindings>): Promise<Response> => {
  const tenantId = getRequiredTenantId(c);
  const { id } = getValidatedParams<ProductIdParam>(c);

  return sendSuccess(c, await changeProductStatus(tenantId, id, "activate"));
};

/**
 * @desc    Archives an active product without removing its historical references.
 * @route   POST /:id/archive
 * @access  Private (product:update, product:manage)
 */
export const archiveProduct = async (c: Context<AppBindings>): Promise<Response> => {
  const tenantId = getRequiredTenantId(c);
  const { id } = getValidatedParams<ProductIdParam>(c);

  return sendSuccess(c, await changeProductStatus(tenantId, id, "archive"));
};
