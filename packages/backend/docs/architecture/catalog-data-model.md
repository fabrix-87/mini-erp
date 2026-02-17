# Catalog Data Model — Architecture

This document describes the data architecture of the Catalog module in Mini-ERP,
covering Product, ProductVariant, Category, Attribute, and their interconnections.

---

## Entity Overview

```

Language ───────────────────────────────────────────────────────┐
                                                                │
TaxRule ────────────────────────────────────────────────────┐   │
                                                            │   │
Manufacturer ────────────────────────────────────────────┐  │   │
Supplier ────────────────────────────────────────────────┤  │   │
                                                         │  │   │
Product ─────────────────────────────────────────────────┤  │   │
│ (1:N)                                                  │  │   │
├──► ProductVariant                                      │  │   │
│     │ (1:N)                                            │  │   │
│     ├──► ProductVariantTranslation  ───────────────────┤  │   │
│     ├──► ProductVariantAttribute ──► Attribute         │  │   │
│     ├──► ProductImage                                  │  │   │
│     ├──► StockMovement / StockBatch / StockReservation │  │   |
│     ├──► PriceListItem                                 │  │   │
│     └──► DocumentLine                                  │  │   │
│                                                        │  │   │
├──► ProductImage (product-level)                        │  │   │
├──► ProductCategory ──► Category                        │  │   │
└──► DocumentLine                                        │  │   │
                                                         │  │   │
Category ────────────────────────────────────────────────┘  │   │
│ (self-referential)                                        │   │
├──► Category (children)                                    │   │
└──► CategoryTranslation  ──────────────────────────────────┤   │
                                                            │   │
AttributeGroup  ────────────────────────────────────────────┤   │
│ (1:N)                                                     │   │
├──► AttributeGroupTranslation ─────────────────────────────┤   │
└──► Attribute                                              │   │
│ (1:N)                                                     │   │
├──► AttributeTranslation ──────────────────────────────────┤   │
└──► ProductVariantAttribute                                │   │

```

---

## Schema Files

| Model(s)                              | File                                          |
|---------------------------------------|-----------------------------------------------|
| `Product`, `ProductVariant`, `ProductVariantTranslation`, `ProductImage`, `ProductCategory`, `Manufacturer` | `prisma/schema/product.prisma` |
| `Category`, `CategoryTranslation`    | `prisma/schema/category.prisma`               |
| `AttributeGroup`, `AttributeGroupTranslation`, `Attribute`, `AttributeTranslation`, `ProductVariantAttribute` | `prisma/schema/attribute.prisma` |

---

## Product / Variant Split

The catalogue follows a **Product → Variant** hierarchy:

| Level             | Model            | Holds                                           |
|-------------------|------------------|-------------------------------------------------|
| Product (master)  | `Product`        | Type, status, shared metadata, default tax rule |
| Variant (SKU)     | `ProductVariant` | SKU, barcode, stock, prices, dimensions         |

### Design Rationale

- All **transactional references** (`DocumentLine`, `StockMovement`, `PriceListItem`) point to `ProductVariant`, never to `Product`.
- `Product.price` is informational ("starting from"). The authoritative price is `ProductVariant.price`, which overrides the parent when set.
- A variant with `isDefault = true` is the one displayed in catalogue listings.

---

## Category Model

### Self-Referential Hierarchy

```

Category
├── parent?  → Category (nullable FK, parentId)
└── children → Category[] (inverse relation "CategoryHierarchy")

```

### Denormalized `level` Field

The `level` field stores the depth of the node to avoid recursive queries:

| Level | Meaning                       |
|-------|-------------------------------|
| `0`   | Root category                 |
| `1`   | First-level child             |
| `n`   | nth-level descendant          |

> `level` must be maintained at the application layer whenever a category is
> created, moved, or re-parented.

---

## Attribute Model

### Two-Level Structure

```

AttributeGroup (e.g. "Colour")
└── Attribute (e.g. "Red", "Blue", "Green")

```

### Display Type Enum

| Value    | Use Case                              |
|----------|---------------------------------------|
| `SELECT` | Standard dropdown                     |
| `RADIO`  | Radio button selection                |
| `COLOR`  | Hex-based colour swatches             |
| `IMAGE`  | Icon or texture image picker          |

### Variant–Attribute Assignment

```

ProductVariant ◄── ProductVariantAttribute ──► Attribute

```

- Composite PK `@@id([productVariantId, attributeId])` prevents duplicate assignments.
- Both FKs use `Cascade` on delete.
- This explicit join table is preferred over Prisma's implicit `@relation` M:N to allow
  future extension (e.g. adding a `position` field to the join record).

---

## Multilingual Architecture

All user-visible text uses a **Translation table pattern**:

| Base Model      | Translation Model                | Unique Constraint                   |
|-----------------|----------------------------------|-------------------------------------|
| `Product` / `ProductVariant` | `ProductVariantTranslation` | `(productVariantId, languageId)` |
| `Category`      | `CategoryTranslation`            | `(categoryId, languageId)`          |
| `AttributeGroup`| `AttributeGroupTranslation`      | `(attributeGroupId, languageId)`    |
| `Attribute`     | `AttributeTranslation`           | `(attributeId, languageId)`         |

> All translation tables have `onDelete: Cascade` — deleting the parent removes all translations.

---

## Soft Delete Strategy

`Product` and `ProductVariant` implement soft delete via:

```

deletedAt DateTime?   // null = active, not-null = deleted
deletedBy Int?        // User ID who deleted the record

```

- Hard deletes are **not performed** on products or variants to preserve document/order history.
- All listing queries must filter `WHERE deletedAt IS NULL`.
- The `@@index([deletedAt])` on both models ensures this filter is index-accelerated.

---

## Cascade & Nullify Strategy

| Parent Deleted     | Child Affected                  | Behaviour  |
|--------------------|---------------------------------|------------|
| `Product`          | `ProductVariant`                | `Cascade`  |
| `Product`          | `ProductImage`                  | `Cascade`  |
| `Product`          | `ProductCategory`               | `Cascade`  |
| `ProductVariant`   | `ProductVariantTranslation`     | `Cascade`  |
| `ProductVariant`   | `ProductVariantAttribute`       | `Cascade`  |
| `ProductVariant`   | `ProductImage` (variant-linked) | `Cascade`  |
| `Category`         | `CategoryTranslation`           | `Cascade`  |
| `Category`         | `ProductCategory`               | `Cascade`  |
| `AttributeGroup`   | `Attribute`                     | `Cascade`  |
| `AttributeGroup`   | `AttributeGroupTranslation`     | `Cascade`  |
| `Attribute`        | `AttributeTranslation`          | `Cascade`  |
| `Attribute`        | `ProductVariantAttribute`       | `Cascade`  |

---

## Design Decisions & Notes

1. **Translations at variant level, not product level**: `ProductVariantTranslation` covers
   both the product name and variant-specific content (availability labels, SEO fields).
   This simplifies the query path: one join instead of two.

2. **`linkRewrite` globally unique**: The `@unique` constraint on
   `ProductVariantTranslation.linkRewrite` enforces URL uniqueness across the entire
   catalogue. Ensure your slug-generation logic accounts for this.

3. **`quantity` is denormalized**: `ProductVariant.quantity` is a cached counter maintained
   by stock movement logic. Do not write to it directly; recalculate from `StockMovement`.

4. **`proposedProducts` JSON on Opportunity**: The `Opportunity` model references products
   via a JSON field. If cross-catalogue reporting is needed (e.g. "which products appear
   most in proposals"), a dedicated `OpportunityProduct` join table should be introduced.

5. **`Manufacturer` is a simple lookup**: It has no translation table. If multilingual
   brand names are needed in future, a `ManufacturerTranslation` model should be added
   following the same translation pattern used elsewhere.

6. **`visibility` as a string field**: `Product.visibility` is currently a plain
   `VarChar(20)` with valid values `both`, `catalog`, `search`, `none`. Consider
   migrating to an enum (`ProductVisibility`) for compile-time safety.

***