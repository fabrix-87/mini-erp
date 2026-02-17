# Category Management Guide

This guide explains how the Category module works in Mini-ERP, including the
hierarchical tree structure, multilingual support, and product assignment.

---

## Overview

**Categories** organise products into a tree hierarchy of unlimited depth. Each category
can have a parent, an ordered list of children, and translated content per language.

---

## Category Model

| Field      | Description                                                       |
|------------|-------------------------------------------------------------------|
| `id`       | Auto-incremented primary key                                      |
| `parentId` | FK to parent `Category` (nullable — null means root category)     |
| `code`     | Optional unique slug identifier (e.g. `electronics`, `apparel`)  |
| `active`   | Whether the category is visible/active                            |
| `position` | Ordering among siblings                                           |
| `level`    | Depth level in the tree (root = `0`, first child = `1`, etc.)    |

> `level` is a **denormalized** field that must be set at the service layer when creating
> or moving a category. It enables efficient depth-based queries without recursive CTEs.

---

## Hierarchical Structure

The category tree is modelled with a **self-referential relation**:

```

Category (id: 1, parentId: null, level: 0)   ← Root
└── Category (id: 5, parentId: 1, level: 1) ← First level
├── Category (id: 9,  parentId: 5, level: 2)  ← Second level
└── Category (id: 10, parentId: 5, level: 2)  ← Second level

```

| Relation   | Direction         | Description                              |
|------------|-------------------|------------------------------------------|
| `parent`   | `Category → Category` | The direct parent node               |
| `children` | `Category[] ← Category` | All direct child nodes              |

> When building full tree queries, use recursive Prisma calls or a raw SQL CTE.
> The `level` field allows you to filter by depth without full recursion.

---

## Multilingual Support (`CategoryTranslation`)

Each category has one translation record per language:

| Field             | Description                                               |
|-------------------|-----------------------------------------------------------|
| `name`            | Category display name (required)                          |
| `slug`            | URL-friendly path segment                                 |
| `description`     | Full description text                                     |
| `linkRewrite`     | Custom URL rewrite rule                                   |
| `metaTitle`       | SEO `<title>` tag content                                 |
| `metaDescription` | SEO meta description content                              |

> `@@unique([categoryId, languageId])` ensures one translation per language per category.

---

## Product Assignment (`ProductCategory`)

Products are assigned to categories via the **many-to-many join table** `ProductCategory`:

```

Product ◄──── ProductCategory ────► Category

```

| Field       | Description                                       |
|-------------|---------------------------------------------------|
| `productId` | FK to `Product`                                   |
| `categoryId`| FK to `Category`                                  |
| `position`  | Display order of the product within the category  |

The composite PK `@@id([productId, categoryId])` prevents duplicate assignments.
Both foreign keys use `Cascade` on delete.

---

## Typical Data Structure

```

Category (code: "apparel", level: 0)
├── CategoryTranslation (IT: "Abbigliamento", EN: "Apparel")
└── children:
├── Category (code: "men", level: 1)
│     └── CategoryTranslation (IT: "Uomo", EN: "Men")
└── Category (code: "women", level: 1)
└── CategoryTranslation (IT: "Donna", EN: "Women")

```

---

## Database Indexes

| Index                          | Purpose                                       |
|--------------------------------|-----------------------------------------------|
| `Category.parentId`            | Fetch direct children of a node               |
| `Category.active`              | Filter active categories                      |
| `Category.level`               | Depth-based filtering (e.g. show top 2 levels)|
| `CategoryTranslation.languageId` | Language-filtered translation queries       |
| `ProductCategory.categoryId`   | List products within a category               |
```


***