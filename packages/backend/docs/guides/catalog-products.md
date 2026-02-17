# Product Catalogue Guide

This guide describes the Product module in Mini-ERP: product structure, variants,
images, pricing, stock fields, soft delete, and relationships to other modules.

---

## Overview

The product catalogue is built around two core models:

- **`Product`** — the master record, holding shared data and defaults
- **`ProductVariant`** — the purchasable/sellable unit, holding SKU-level data

A product **must have at least one variant**. All transactional operations
(orders, stock, price lists) reference `ProductVariant`, never `Product` directly.

---

## Product Types & Statuses

### `ProductType`

| Value      | Description                                                   |
|------------|---------------------------------------------------------------|
| `STANDARD` | Physical product with inventory tracking                      |
| `PACK`     | Bundle of multiple variants or products                       |
| `VIRTUAL`  | Digital or downloadable product (no physical stock)           |
| `SERVICE`  | Service item, typically not stocked                           |

### `ProductStatus`

| Value      | Description                                        |
|------------|----------------------------------------------------|
| `DRAFT`    | Not yet published; invisible to frontend           |
| `ACTIVE`   | Published and available                            |
| `ARCHIVED` | Deactivated; kept for historical reference         |

### `ProductCondition`

| Value         | Description                     |
|---------------|---------------------------------|
| `NEW`         | Brand new item                  |
| `USED`        | Pre-owned item                  |
| `REFURBISHED` | Restored/reconditioned item     |

---

## Product Fields

### Visibility & Availability

| Field               | Description                                           |
|---------------------|-------------------------------------------------------|
| `active`            | Master switch for the product                         |
| `availableForOrder` | Can be added to orders                                |
| `showPrice`         | Whether price is displayed on frontend                |
| `onlineOnly`        | Sold exclusively online                               |
| `onSale`            | Flagged as on-sale (for promotional display)          |
| `visibility`        | `both`, `catalog`, `search`, `none`                  |

### Base Pricing

| Field            | Description                                               |
|------------------|-----------------------------------------------------------|
| `price`          | Base list price (may be overridden at variant level)      |
| `wholesalePrice` | Purchase/cost price                                       |
| `ecotax`         | Eco-contribution tax amount                               |
| `defaultTaxRuleId` | FK to `TaxRule` — the default VAT rule for the product  |

> Base prices on `Product` are indicative (e.g. "Starting from...").
> The actual transactional price is always on `ProductVariant`.

### Relationships

| Relation         | Description                                          |
|------------------|------------------------------------------------------|
| `manufacturer`   | Brand/manufacturer of the product                    |
| `supplier`       | Default supplier (FK to `Supplier`)                  |
| `variants`       | All `ProductVariant` records for this product        |
| `images`         | All `ProductImage` records                           |
| `categories`     | Many-to-many via `ProductCategory`                   |
| `documentLines`  | References in order/invoice document lines           |

---

## Product Variants (`ProductVariant`)

A variant is the **sellable unit**. It holds all SKU-specific data.

### Identifiers

| Field         | Description                                       |
|---------------|---------------------------------------------------|
| `variantCode` | Internal unique variant identifier (required)     |
| `sku`         | Stock Keeping Unit code (optional, unique)        |
| `ean13`       | EAN-13 barcode (unique)                           |
| `upc`         | UPC-A barcode                                     |
| `isbn`        | ISBN (for books/media)                            |
| `mpn`         | Manufacturer Part Number                          |

### Stock Fields

| Field                 | Description                                          |
|-----------------------|------------------------------------------------------|
| `quantity`            | Current stock (computed from stock movements)        |
| `minimalQuantity`     | Minimum order quantity                               |
| `lowStockThreshold`   | Threshold to trigger low-stock alert                 |
| `lowStockAlertEnabled`| Whether low-stock alert is active                    |
| `location`            | Shelf/bin location in the warehouse                  |
| `outOfStockType`      | Behaviour when out of stock (allow/deny/default)     |
| `availableDate`       | Date when stock is expected to be available          |

> `quantity` is a denormalized counter. It is recalculated from `StockMovement` records.
> Never update it directly — always create stock movements.

### Variant Pricing

| Field            | Description                                               |
|------------------|-----------------------------------------------------------|
| `price`          | Override price for this variant (nullable — falls back to `Product.price`) |
| `wholesalePrice` | Override cost price for this variant                      |
| `unitPriceRatio` | Unit price ratio for price-per-unit display               |

### Physical Dimensions

| Field    | Description               |
|----------|---------------------------|
| `weight` | Weight (kg)               |
| `width`  | Width (cm)                |
| `height` | Height (cm)               |
| `depth`  | Depth/length (cm)         |

### Configuration Flags

| Field               | Description                                                    |
|---------------------|----------------------------------------------------------------|
| `isDefault`         | If `true`, this is the variant shown first in the catalogue    |
| `active`            | Individual activation switch for this variant                  |
| `availableForOrder` | Can this specific variant be ordered                           |
| `position`          | Display order among siblings                                   |

### Intrastat

| Field           | Description                                             |
|-----------------|---------------------------------------------------------|
| `commodityCode` | NC8 Combined Nomenclature code for customs declarations |
| `commodity`     | FK to `IntrastatCommodityCode`                          |

### Variant Relationships

| Relation            | Description                                         |
|---------------------|-----------------------------------------------------|
| `attributes`        | `ProductVariantAttribute[]` — assigned attributes   |
| `stockMovement`     | `StockMovement[]` — all stock in/out events         |
| `stockReservations` | `StockReservation[]` — reserved quantities          |
| `stockBatchs`       | `StockBatch[]` — lot/batch tracking                 |
| `virtualStock`      | `VirtualStock[]` — projected future stock           |
| `documentLines`     | `DocumentLine[]` — order/invoice line references    |
| `priceListItems`    | `PriceListItem[]` — custom pricing rules            |
| `images`            | `ProductImage[]` — variant-specific images          |
| `translations`      | `ProductVariantTranslation[]` — multilingual content|

---

## Multilingual Content (`ProductVariantTranslation`)

Translations are at **variant level** (not product level):

| Field                  | Description                                         |
|------------------------|-----------------------------------------------------|
| `name`                 | Variant/product display name                        |
| `description`          | Full HTML/text description                          |
| `shortDescription`     | Short summary (max 500 chars)                       |
| `tags`                 | Comma-separated search tags                         |
| `metaTitle`            | SEO title                                           |
| `metaDescription`      | SEO description                                     |
| `metaKeywords`         | SEO keywords                                        |
| `linkRewrite`          | URL slug (globally unique)                          |
| `availableNowLabel`    | In-stock label (default: `"In stock"`)              |
| `availableLaterLabel`  | Out-of-stock label (default: `"Available soon"`)    |
| `deliveryTimeInStockNote`    | Delivery time shown when in stock              |
| `deliveryTimeOutOfStockNote` | Delivery time shown when out of stock          |

> `linkRewrite` is globally `@unique` — no two variant translations may share the same URL slug.

---

## Product Images (`ProductImage`)

Images can belong to either the **product** (shared) or a **specific variant**:

| Field       | Description                                          |
|-------------|------------------------------------------------------|
| `productId` | Required FK to `Product`                             |
| `variantId` | Optional FK to `ProductVariant`                      |
| `imageUrl`  | Full URL of the image                                |
| `imageType` | `main`, `extra`, `variant`, `print`, `neutral`       |
| `isCover`   | Whether this is the primary cover image              |
| `position`  | Display order                                        |
| `altText`   | JSON object with per-language alt text               |
| `width`     | Image width in pixels                                |
| `height`    | Image height in pixels                               |
| `fileSize`  | File size in bytes                                   |
| `mimeType`  | MIME type (e.g. `image/jpeg`, `image/webp`)          |

---

## Manufacturer (`Manufacturer`)

A simple lookup model for product brands:

| Field         | Description                         |
|---------------|-------------------------------------|
| `name`        | Brand/manufacturer name             |
| `active`      | Whether the manufacturer is active  |
| `customFields`| JSON for extensible metadata        |

---

## Soft Delete

Both `Product` and `ProductVariant` implement **soft delete**:

| Field       | Description                                          |
|-------------|------------------------------------------------------|
| `deletedAt` | `null` = active; non-null = soft-deleted timestamp   |
| `deletedBy` | User ID who performed the deletion                   |

> All standard queries must include a `WHERE deletedAt IS NULL` filter.
> The `@@index([deletedAt])` index ensures this filter remains efficient.

---

## Database Indexes

### `Product`

| Index           | Purpose                                      |
|-----------------|----------------------------------------------|
| `reference`     | Unique internal reference lookup             |
| `active`        | Filter active products                       |
| `supplierId`    | List products by supplier                    |
| `deletedAt`     | Exclude soft-deleted records efficiently     |

### `ProductVariant`

| Index          | Purpose                                       |
|----------------|-----------------------------------------------|
| `productId`    | List variants of a product                    |
| `variantCode`  | Unique variant code lookup                    |
| `isDefault`    | Quickly find the default/display variant      |
| `deletedAt`    | Exclude soft-deleted variants                 |
| `sku`, `ean13` | Unique barcode/SKU lookups                    |

### `ProductImage`

| Index       | Purpose                                         |
|-------------|-------------------------------------------------|
| `productId` | List all images for a product                   |
| `variantId` | List variant-specific images                    |
| `imageType` | Filter by image type (e.g. only `main` images)  |
| `position`  | Ordered image galleries                         |
```


***