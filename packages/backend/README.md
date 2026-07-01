# @mini-erp/backend

> **Production-grade REST API** for a complete multi-tenant CRM/ERP platform — part of the [mini-erp](https://github.com/fabrix-87/mini-erp) monorepo, built on a modern, strictly-typed TypeScript stack.

***

## Overview

This package implements the entire API surface of mini-erp — a full-featured CRM/ERP system covering the commercial, fiscal, warehouse and accounting lifecycle of a business. It is one of three workspace packages:

| Package | Role |
|---|---|
| `@mini-erp/backend` | REST API (this package) |
| `@mini-erp/frontend` | Next.js 16 app (React 19, shadcn/ui, TanStack) |
| `@mini-erp/shared` | Zod schemas, TypeScript types, shared utilities |

***

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | [Bun](https://bun.sh/) — native TypeScript, fast startup |
| **Framework** | [Hono](https://hono.dev/) — lightweight, edge-ready web framework |
| **ORM** | [Prisma](https://www.prisma.io/) v7 with PostgreSQL |
| **Validation** | [Zod](https://zod.dev/) v4 — schemas shared across packages via `@mini-erp/shared` |
| **Database** | PostgreSQL |
| **Queue** | [BullMQ](https://bullmq.io/) + Redis — background job processing |
| **Storage** | MinIO — S3-compatible object storage |
| **Security** | JWT (`jsonwebtoken`) · bcrypt · Helmet · CORS |
| **Logging** | Winston + daily log rotation (`winston-daily-rotate-file`) |
| **Language** | TypeScript strict mode |

***

## 🏗️ Architecture

The backend follows a clean layered structure designed for maintainability, correctness, and fast onboarding:

```
routes/<domain>/        → HTTP routing + ordered middleware chain
validators/<domain>/    → validation wrappers using shared schemas
controllers/<domain>/   → thin request/response handlers
services/<domain>/      → business logic + Prisma queries
```

### Authentication & Authorisation

Protected routes follow a consistent middleware sequence applied at the router-group level:

```
authenticateToken → authorize([...permissions]) → requireTenantScope → validateXxx → handler
```

This keeps authentication centralized, authorization explicit, and tenant scoping impossible to bypass accidentally.

### ID Strategy

The backend uses a **model-driven ID strategy** defined directly in the Prisma schema, not a single rule applied to every entity.

Several core business entities use `String @default(cuid())`, so route params, relation payloads, and Prisma queries must always follow the actual model definition instead of assuming numeric IDs. In practice, this is an important signal of engineering discipline: ID handling is verified case by case against the schema before writing controllers, services, or route validators.

### Data Integrity Patterns

- Soft-deletable models are queried through a dedicated soft-delete pattern rather than raw lookups.
- Multi-table writes are wrapped in `prisma.$transaction()` to preserve consistency.
- Financial and document totals are derived through shared calculation helpers instead of duplicated controller logic.
- Typed helpers keep validated body, params, and query access consistent across handlers.

***

## 📦 Domain Coverage

The backend covers a broad ERP/CRM surface, including:

- **Authentication & access control** — login, refresh, roles, permissions, memberships
- **CRM** — leads, opportunities, customers, companies, contacts, activities
- **Sales** — products, pricelists, taxes, commercial documents
- **Finance** — payments, currencies, fiscal flows
- **Master data** — languages, countries, addresses, suppliers
- **System administration** — user management, tenant-aware permissions, audit-oriented workflows

This breadth is one of the strongest portfolio signals in the package: the codebase is not a toy CRUD API, but a business-oriented backend with multiple stateful domains.

***

## 🔑 Engineering Highlights

- **Shared contracts across the monorepo** — validation schemas and types come from `@mini-erp/shared`, reducing drift between frontend and backend
- **Thin controllers, explicit services** — transport concerns stay separated from business rules
- **Transactional thinking** — dependent writes are grouped atomically rather than chained optimistically
- **State-aware business logic** — document lifecycle and other stateful flows are guarded explicitly
- **Operational readiness** — Redis, BullMQ, MinIO, Docker, structured logging, and environment-based configuration are already part of the package
- **Recruiter-friendly signal** — the project demonstrates real backend architecture choices instead of only framework familiarity

***

## 🛠️ Getting Started

> Full monorepo setup instructions are available in the [root README](../../README.md).

### Prerequisites

- [Bun](https://bun.sh/) >= 1.0
- [Docker](https://www.docker.com/) and Docker Compose
- Shared package built before backend runtime when needed

### Setup

```bash
cp .env.example .env

# from the repository root
docker-compose up -d

cd packages/backend
bun run prisma:generate
bun run prisma:migrate
bun run prisma:seed   # optional
bun run dev
```

The API runs locally on **http://localhost:3001**.

### Key Scripts

```bash
bun run dev
bun run build
bun run start
bun run prisma:generate
bun run prisma:migrate
bun run prisma:seed
bun test
```

***

## 🗂️ Package Structure

```
packages/backend/
├── config/             # runtime and environment configuration
├── controllers/        # domain controllers
├── docs/               # backend-focused documentation
├── helpers/            # typed helpers for validated request data
├── lib/                # app bootstrap and shared backend utilities
├── middleware/         # auth, authorization, tenant scope, validation
├── prisma/             # schema, migrations, seeds
├── routes/             # route registration by domain and scope
├── services/           # business logic layer
├── types/              # backend-specific types and bindings
├── utils/              # response + error utilities
├── validators/         # backend wrappers around shared schemas
├── create-app.ts       # app factory
└── server.ts           # runtime entry point
```

***

## 📐 Coding Conventions

| Concern | Convention |
|---|---|
| File names | `kebab-case` |
| Function exports | `camelCase` |
| Types / Interfaces | `PascalCase` |
| Validation source | `@mini-erp/shared` |
| Public functions | JSDoc comments in English |
| TypeScript mode | strict |

***

## 👤 Author

**Fabrizio Menza** — Full-Stack Engineer · Catania, Italy

- GitHub: [@fabrix-87](https://github.com/fabrix-87)
- Specializations: TypeScript · Zod · Monorepo Architecture · ERP/SaaS Domain Modelling

***

## 📄 Licence

[GNU AGPLv3](../../LICENSE)

***