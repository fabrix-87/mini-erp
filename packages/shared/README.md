# 📦 `@mini-erp/shared`

### The Type-Safe Contract Layer — Shared Validators, Types & Utilities

> The backbone of the mini-erp monorepo. Every validator, type, constant and utility is defined
> **once here** and consumed by both the backend API and the Next.js frontend — zero duplication,
> zero contract drift.

***

## 🎯 Why This Package Matters

In large-scale full-stack projects, the biggest source of runtime bugs is the mismatch between
what the API expects and what the frontend sends. `@mini-erp/shared` eliminates this entirely.

Validators written with **Zod v4** are the single source of truth for data shapes. The backend
uses them to parse and validate incoming HTTP requests; the frontend uses the same schemas to
drive form validation via `react-hook-form` with `standardSchemaResolver`. One schema, two
consumers, zero inconsistency.

This is not glue code — it is **domain modelling as a discipline**.

***

## 🧠 Engineering Highlights

| Aspect | Detail |
|---|---|
| **Schema-first design** | All domain schemas authored in Zod v4 with strict mode |
| **End-to-end type safety** | TypeScript types inferred directly from Zod schemas (`z.infer<>`) — no manual duplication |
| **Primitive reuse** | Shared building blocks: `createIdSchema()`, `emailSchema`, `phoneSchema`, `paginationSchema`, etc. |
| **Domain coverage** | 25+ validators spanning the full ERP domain (see list below) |
| **Zero runtime deps** | Pure TypeScript + Zod — no framework-specific code leaks into this layer |
| **ESM build** | Compiled and published as an ES Module via Bun for maximal compatibility |
| **Strict conventions** | kebab-case filenames, barrel exports, JSDoc on every public function |

***

## 🏗️ Package Structure

```
packages/shared/src/
├── validators/           # Zod schemas: create / update / id / query variants per entity
│   ├── primitives/       # Reusable field-level schemas (id, email, phone, pagination…)
│   ├── query/            # Shared query/filter schemas (pagination, sorting, search)
│   ├── forms/            # Form-specific schema wrappers
│   ├── business/         # Business-logic groupings
│   ├── activity.ts
│   ├── address.ts
│   ├── attribute.ts
│   ├── audit.ts
│   ├── auth.ts
│   ├── category.ts
│   ├── company.ts
│   ├── contact.ts
│   ├── customer.ts
│   ├── document.ts       # Largest schema: full document lifecycle (23 KB)
│   ├── intrastat.ts      # EU fiscal compliance schemas
│   ├── lead.ts
│   ├── opportunity.ts
│   ├── payment.ts
│   ├── pricelist.ts
│   ├── product.ts
│   ├── role.ts
│   ├── supplier.ts
│   ├── tax.ts
│   ├── tenant.ts
│   ├── user.ts
│   ├── warehouse.ts
│   └── ...
├── types/                # Shared TypeScript interfaces and utility types
├── constants/            # Enums and application-wide constants
├── helpers/              # Pure domain-specific helper functions
├── services/             # Shared service abstractions
├── utils/                # Pure utility functions (formatting, parsing, etc.)
└── index.ts              # Root barrel export
```

***

## ✍️ Schema Conventions

Every entity module follows a **strict, consistent structure**:

```typescript
// 1. Enum definitions
export const ActivityTypeEnum = z.enum(['CALL', 'EMAIL', 'MEETING']);

// 2. Base schema (shared fields)
const activityBaseSchema = z.object({ ... });

// 3. Create schema — strict, no extra keys allowed
export const createActivitySchema = activityBaseSchema.strict();

// 4. Update schema — all fields optional, still strict
export const updateActivitySchema = activityBaseSchema.omit({ ... }).partial().strict();

// 5. ID param schema
export const activityIdParamSchema = createIdSchema('activityId');

// 6. Query/filter schema
export const activityQuerySchema = paginationSchema.extend({ ... });
```

This pattern means any new engineer can open any validator file and immediately understand its
structure without reading documentation. **Predictability is a feature.**

***

## 🔌 Integration Points

### Backend (Hono + Zod Validator)

```typescript
import { createActivitySchema, activityIdParamSchema } from '@mini-erp/shared';

app.post('/activities', zValidator('json', createActivitySchema), createActivityController);
```

### Frontend (React Hook Form + Standard Schema Resolver)

```typescript
import { createActivitySchema } from '@mini-erp/shared';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';

const form = useForm({
  resolver: standardSchemaResolver(createActivitySchema),
  mode: 'onTouched',
});
```

The frontend **never** imports `zodResolver` — the `standardSchemaResolver` approach ensures
framework-agnostic compatibility and consistency with the Zod v4 Standard Schema spec.

***

## 📐 Domain Coverage

The validators cover the full lifecycle of an enterprise CRM/ERP platform:

| Domain | Modules |
|---|---|
| **CRM** | `lead`, `contact`, `company`, `customer`, `activity`, `opportunity` |
| **Sales** | `document`, `pricelist`, `payment`, `product` |
| **Inventory** | `warehouse`, `category`, `attribute`, `manufacturer` |
| **Finance** | `tax`, `currency`, `intrastat` (EU compliance) |
| **Identity** | `user`, `role`, `tenant`, `auth`, `user-membership`, `user-setting` |
| **Infrastructure** | `address`, `country`, `language`, `audit`, `dashboard` |

***

## 🚀 Local Development

This package is consumed as a Bun workspace dependency — no publishing needed.

```bash
# From monorepo root
bun install

# Watch mode (rebuild on change)
cd packages/shared && bun run dev

# Type check
bun run check

# Build for production
bun run build
```

The built output is an ESM bundle consumed directly by `packages/backend` and
`packages/frontend` via the workspace alias `@mini-erp/shared`.

***

## 👤 Author

**Fabrizio Menza** — Full-Stack Engineer · Catania, Italy

- GitHub: [@fabrix-87](https://github.com/fabrix-87)
- Specializations: TypeScript · Zod · Monorepo Architecture · ERP/SaaS Domain Modelling

***

## 🔗 See Also

- [Mini-ERP — Root README](https://github.com/fabrix-87/mini-erp#readme)
- [packages/backend](https://github.com/fabrix-87/mini-erp/tree/main/packages/backend)
- [packages/frontend](https://github.com/fabrix-87/mini-erp/tree/main/packages/frontend)

***

*Part of the [mini-erp](https://github.com/fabrix-87/mini-erp) monorepo — Released under [AGPLv3](../../LICENSE)*