# Attribute Management Guide

This guide describes how the Attribute module works in Mini-ERP, covering
attribute groups, individual attribute values, multilingual translations,
and their assignment to product variants.

---

## Overview

**Attributes** define the configurable dimensions of a product variant (e.g. colour, size,
material). They are organised in **Attribute Groups**, which define the display type and the
set of selectable values.

---

## Attribute Groups (`AttributeGroup`)

An `AttributeGroup` represents a characteristic dimension (e.g. "Colour", "Size").

| Field         | Description                                                |
|---------------|------------------------------------------------------------|
| `code`        | Unique slug identifier (e.g. `color`, `size`)             |
| `displayType` | How values are shown in the UI (see below)                 |
| `position`    | Ordering within UI attribute selectors                     |
| `isPublic`    | Whether the group is visible on the frontend               |

### Display Types

| Value    | Description                                     |
|----------|-------------------------------------------------|
| `SELECT` | Dropdown select input                           |
| `RADIO`  | Radio button group                              |
| `COLOR`  | Colour swatch (uses `colorHex` fields)          |
| `IMAGE`  | Image/icon picker (uses `imageUrl` field)       |

---

## Attribute Values (`Attribute`)

Each `Attribute` represents a specific value within a group (e.g. "Red" within "Colour").

| Field          | Description                                              |
|----------------|----------------------------------------------------------|
| `attributeGroupId` | FK to the parent `AttributeGroup`                   |
| `code`         | Unique slug within the group (e.g. `red`, `xl`)         |
| `colorHex`     | Primary hex colour code (e.g. `#FF0000`)                |
| `colorHex2`    | Secondary hex colour (e.g. for gradients)               |
| `colorPms`     | Primary Pantone/PMS colour code (e.g. `PMS 485C`)       |
| `colorPms2`    | Secondary PMS colour                                    |
| `imageUrl`     | URL for icon or texture image                           |
| `position`     | Ordering within the group                               |

> `code` is unique within a group via `@@unique([attributeGroupId, code])`.
> The same slug (e.g. `red`) can exist in different groups without conflict.

---

## Multilingual Translations

Both `AttributeGroup` and `Attribute` support full multilingual translation.

### `AttributeGroupTranslation`

| Field        | Description                                          |
|--------------|------------------------------------------------------|
| `name`       | Backend/admin label (e.g. `Colore`, `Color`)        |
| `publicName` | Optional frontend label if different from admin name |
| `languageId` | FK to `Language` table                              |

### `AttributeTranslation`

| Field        | Description                              |
|--------------|------------------------------------------|
| `name`       | Translated value label (e.g. `Rosso`, `Red`) |
| `languageId` | FK to `Language` table                   |

> Each translation is unique per `(entity, language)` pair, enforced by `@@unique`.

---

## Assigning Attributes to Variants (`ProductVariantAttribute`)

Attributes are linked to product variants via an explicit **many-to-many join table**:

```

ProductVariant ◄──── ProductVariantAttribute ────► Attribute

```

| Field              | Description                                 |
|--------------------|---------------------------------------------|
| `productVariantId` | FK to `ProductVariant`                      |
| `attributeId`      | FK to `Attribute`                           |

The composite PK `@@id([productVariantId, attributeId])` ensures that a variant cannot
have the same attribute assigned twice.

> On either side deletion, the join record is removed via `Cascade`.

---

## Typical Data Structure

```

AttributeGroup (code: "color", displayType: COLOR)
├── AttributeGroupTranslation (IT: "Colore", EN: "Color")
├── Attribute (code: "red", colorHex: "\#FF0000")
│     └── AttributeTranslation (IT: "Rosso", EN: "Red")
├── Attribute (code: "blue", colorHex: "\#0000FF")
│     └── AttributeTranslation (IT: "Blu", EN: "Blue")
└── ...

ProductVariant (variantCode: "SHIRT-RED-L")
├── ProductVariantAttribute → Attribute (code: "red")   [group: color]
└── ProductVariantAttribute → Attribute (code: "l")     [group: size]

```

---

## Database Indexes

| Index                          | Purpose                                  |
|--------------------------------|------------------------------------------|
| `AttributeGroup.position`      | Ordered listing of groups                |
| `AttributeGroupTranslation.languageId` | Language-filtered queries        |
| `Attribute.attributeGroupId`   | List attributes by group                 |
| `AttributeTranslation.languageId` | Language-filtered attribute queries   |
| `ProductVariantAttribute.attributeId` | Reverse lookup: variants by attribute |


***