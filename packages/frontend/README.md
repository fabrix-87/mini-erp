# 🖥️ Mini-ERP — Frontend

### Enterprise-Grade React Application · Next.js 16 · React 19 · TypeScript 5

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-FF4154?logo=reactquery&logoColor=white)](https://tanstack.com/query)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-latest-000?logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)

> Production-oriented frontend package of the Mini-ERP monorepo.  
> A modular, component-first Next.js application covering CRM, admin, sales, and dashboard modules —  
> designed with the architecture standards expected in senior frontend engineering roles.

Part of the [`fabrix-87/mini-erp`](https://github.com/fabrix-87/mini-erp) monorepo.

---

## 🎯 What This Demonstrates

This is **not a UI kit showcase** — it's a real application layer built around production patterns
a senior frontend engineer would apply in a SaaS or ERP product:

- **App Router** architecture with protected and public route groups
- **Server Actions** as the mutation layer (no REST calls from the client for writes)
- **End-to-end type safety** via shared Zod validators from `@mini-erp/shared`
- **Feature-colocated components** — domain logic lives next to its route, not in a global folder
- **Zero duplication** — types and validators defined once, consumed everywhere
- **i18n-first** — all user-facing strings managed through `next-intl`, locale resolved from user preference (no URL segment)
- **Accessibility** — semantic HTML, keyboard navigation, ARIA attributes on interactive elements

---

## 🧠 Engineering Highlights

| Pattern | Implementation |
|---|---|
| **Routing** | Next.js App Router with `(protected)` / `(public)` route groups |
| **Auth guard** | Middleware-based session validation via `jose` (JWT) |
| **Server Actions** | Mutations handled server-side with `revalidatePath` after every write |
| **Server State** | TanStack Query v5 — query keys, invalidation, optimistic updates |
| **Forms** | React Hook Form v7 + Zod v4, schema imported from `@mini-erp/shared` |
| **Tables** | TanStack Table v8 — sortable, filterable, paginated data grids |
| **DnD** | `@dnd-kit` for drag-and-drop interactions (e.g. Kanban boards) |
| **Charts** | Recharts for dashboard analytics |
| **Theming** | `next-themes` with light/dark mode support |
| **API Layer** | Axios-based typed service clients with a reverse proxy (`proxy.ts`) |
| **Type Safety** | Strict TypeScript 5.9, `declaration: true`, no `any` |
| **i18n** | `next-intl` v4, locale from user preference, keys organized by domain |
| **Notifications** | `sonner` toasts for all mutation feedback |
| **Containerization** | Dockerfile with multi-stage build |

---

## 🗂️ Application Modules

The app covers a realistic cross-section of a CRM/ERP product surface:

- **Dashboard** — KPI widgets, charts, recent activity
- **CRM** — Companies, Contacts, Leads, Documents
- **Sales** — Sales pipeline and deal management
- **Activities** — Task and activity tracking
- **Admin** — User management, roles, permissions
- **Settings** — User preferences, locale, theme
- **System** — System-level configuration

---

## 📁 Package Structure

```

packages/frontend/
├── app/
│   ├── (protected)/            \# Auth-guarded routes
│   │   ├── admin/users/
│   │   │   ├── components/     \# Domain components (co-located)
│   │   │   └── page.tsx
│   │   ├── crm/companies/
│   │   ├── crm/contacts/
│   │   ├── crm/leads/
│   │   ├── crm/documents/
│   │   ├── dashboard/
│   │   ├── sales/
│   │   ├── activities/
│   │   ├── settings/
│   │   └── system/
│   └── (public)/               \# Login and unauthenticated routes
├── actions/                    \# Server Actions — one file per domain
├── components/                 \# Global/shared components only
│   └── ui/                     \# shadcn/ui primitives (never modified directly)
├── hooks/                      \# Custom React hooks
├── helpers/                    \# Pure utility functions
├── utils/                      \# Formatting and transform helpers
├── services/                   \# Axios API client layer
├── providers/                  \# React context providers
├── i18n/ + messages/           \# next-intl config and translation files
├── types/                      \# Frontend-only TypeScript types
├── lib/
│   └── server/revalidate.ts    \# Revalidation utility for Server Actions
└── proxy.ts                    \# Reverse proxy for API routing

```

### Component Placement Rule

Domain components are **always co-located with their route**, not dumped in a global folder:

```

✅ app/(protected)/crm/leads/components/lead-kanban.tsx
✅ app/(protected)/admin/users/components/user-form.tsx

❌ components/lead-kanban.tsx   ← global folder is for shared-only

```

Each domain folder follows a consistent split:

```

users/components/
├── user-table.tsx
├── user-form.tsx
├── user-form.schema.ts   ← extends @mini-erp/shared validator
├── user-columns.tsx
├── user-delete-dialog.tsx
└── index.ts              ← barrel export

```

---

## 🛠️ Tech Stack

| Category | Library / Tool |
|---|---|
| Framework | Next.js 16.2.4 (App Router) |
| UI Runtime | React 19 |
| Language | TypeScript 5.9 (strict) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui + Radix UI |
| Server State | TanStack Query v5 |
| Tables | TanStack Table v8 |
| Forms | React Hook Form v7 + Zod v4 |
| Drag & Drop | @dnd-kit |
| Charts | Recharts |
| i18n | next-intl v4 |
| Auth | jose (JWT) |
| HTTP Client | Axios |
| Notifications | sonner |
| Icons | @tabler/icons-react · lucide-react |
| Date Utilities | date-fns v4 |
| Package Manager | Bun |

---

## 🚀 Local Development

### Prerequisites

- [Bun](https://bun.sh) >= 1.0
- Backend running (see [`packages/backend`](../backend/README.md))

### Install & Run

```bash
# From monorepo root
bun install

# Configure environment
cp packages/frontend/.env.example packages/frontend/.env

# Start shared in watch mode (required)
cd packages/shared && bun run dev

# Start frontend dev server
cd packages/frontend && bun run dev
```

Frontend available at **http://localhost:3000**

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```


---

## 📦 Available Scripts

```bash
bun run dev       # Start development server with hot reload
bun run build     # Production build
bun run start     # Start production server
bun run lint      # ESLint check
bun run check     # TypeScript type-check
```


---

## 🏗️ Coding Standards

All public functions, hooks, and components carry **mandatory JSDoc** in English:

```typescript
/**
 * Fetches paginated leads from the CRM API.
 * @param filters - Active filter state from the leads toolbar
 * @returns TanStack Query result with lead list and pagination metadata
 */
export function useLeads(filters: LeadFilters): UseQueryResult<PaginatedLeads> { ... }
```

Key conventions enforced across the codebase:

- **No `any`** — strict TypeScript everywhere
- **No local type duplication** — domain types live in `@mini-erp/shared`, UI-only types in `types/`
- **No CSS modules or inline styles** — Tailwind utility classes only
- **No global state libraries** — TanStack Query for server state, `useState`/Context for UI state
- **Every mutation revalidates** — `lib/server/revalidate.ts` called after every Server Action
- **Every folder has a barrel** — `index.ts` with named exports

---

## 🔗 Related Packages

| Package | Description |
| :-- | :-- |
| [`@mini-erp/shared`](../shared/) | Zod validators, shared TypeScript types, constants |
| [`@mini-erp/backend`](../backend/) | Hono REST API, Prisma, BullMQ, Socket.io |


---

## 👤 Author

**Fabrizio Menza** — Senior Full-Stack Engineer · Rome, Italy

- GitHub: [@fabrix-87](https://github.com/fabrix-87)
- Specializations: TypeScript · React / Next.js · ERP/SaaS product architecture · DX \& code quality

---

*Part of the [Mini-ERP](https://github.com/fabrix-87/mini-erp) open-source project — released under [AGPLv3](../../LICENSE).*

```