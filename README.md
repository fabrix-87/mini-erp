# 🏢 Mini-ERP

### Enterprise Resource Planning System — Full-Stack, Production-Ready

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Bun](https://img.shields.io/badge/Runtime-Bun-f9f1e1?logo=bun)](https://bun.sh/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docker.com/)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPLv3-blue.svg)](LICENSE)

> A modular, scalable ERP/CRM platform built from scratch with a modern TypeScript monorepo
> architecture. Designed to demonstrate enterprise-grade backend patterns, real-time capabilities,
> and a clean full-stack separation of concerns.

---

## 🎯 Project Overview

Mini-ERP is a **self-built, production-oriented ERP system** developed to apply and showcase
advanced full-stack engineering skills. It covers the full spectrum of a real enterprise
application: a multi-module REST API, async job queues, real-time WebSockets, S3-compatible file
storage, caching, and a polished React frontend — all wired together in a well-structured Bun
monorepo.

This project is not a tutorial clone — it reflects the kind of architecture decisions a senior
engineer makes when designing systems intended to scale.

---

## 🧠 Key Engineering Highlights

| Area | Implementation |
|---|---|
| **Monorepo** | Bun workspaces with shared types/validators across packages |
| **Type Safety** | End-to-end TypeScript + Zod schemas shared between frontend & backend |
| **API Design** | RESTful Express API with layered middleware, controllers, services |
| **API Framework** | Hono — lightweight, Zod-native, edge-compatible REST API |
| **Database** | PostgreSQL + Prisma ORM with migrations and seed scripts |
| **Auth** | JWT-based authentication with access & refresh tokens |
| **Async Processing** | BullMQ job queues backed by Redis |
| **Real-Time** | Socket.io WebSocket integration |
| **File Storage** | MinIO (S3-compatible) for object/document management |
| **Caching** | Redis for session/data caching |
| **Logging** | Structured logging via Winston |
| **i18n** | next-intl with user-preference-based locale (no URL segment) |
| **Containerization** | Docker Compose for all infrastructure services |

---

## 🏗️ Architecture

The project is structured as a **Bun monorepo** with three independent packages sharing a common
foundation:

```

mini-erp/
├── packages/
│   ├── shared/        \# Zod validators, TypeScript types, constants, utils
│   ├── backend/       \# Express REST API · Prisma · Redis · BullMQ · Socket.io
│   └── frontend/      \# Next.js 16 · React 19 · TanStack · shadcn/ui
├── docker-compose.yml \# PostgreSQL · Redis · MinIO · Adminer
└── package.json       \# Workspace root

```

The `shared` package is the backbone of the type system — validators defined once in Zod are
consumed by both the API and the UI, ensuring contract consistency without duplication.

---

## 🛠️ Tech Stack

### Backend (`packages/backend`)
- **Runtime**: [Bun](https://bun.sh) — fast JS/TS runtime with native bundling
- **Framework**: [Hono](https://hono.dev) — ultrafast, edge-ready web framework
- **Validation**: Zod + `@hono/zod-validator` (shared schemas from `@mini-erp/shared`)
- **ORM**: Prisma 7 with PostgreSQL 16 (`@prisma/adapter-pg`)
- **Auth**: JWT (`jsonwebtoken`) with bcrypt password hashing
- **Queue**: BullMQ + Redis
- **File Upload**: Multer + MinIO (S3-compatible)
- **Logging**: Winston + `winston-daily-rotate-file`

### Frontend (`packages/frontend`)
- **Framework**: Next.js 16 with App Router
- **React**: v19 (latest stable)
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui + Radix UI
- **Forms**: React Hook Form + Zod
- **Data Fetching**: TanStack Query
- **Tables**: TanStack Table
- **Charts**: Recharts
- **i18n**: next-intl

### Infrastructure
- **PostgreSQL 16** — primary data store
- **Redis** — cache + BullMQ backend
- **MinIO** — S3-compatible object storage
- **Docker Compose** — full local stack in one command

---

## 📁 Project Structure

```

packages/
├── shared/
│   └── src/
│       ├── validators/     \# Zod schemas (user, customer, activity…)
│       ├── types/          \# Shared TypeScript types
│       ├── constants/      \# Enums and app-wide constants
│       └── utils/          \# Pure utility functions
│
├── backend/
│   ├── config/             \# App configuration
│   ├── controllers/        \# Route handlers
│   ├── middleware/         \# Auth, error handling, rate limiting…
│   ├── routes/             \# API route definitions
│   ├── services/           \# Business logic \& external integrations
│   ├── helpers/            \# Internal utilities
│   ├── lib/                \# Shared singletons (Prisma client, Redis…)
│   ├── validators/         \# Backend-specific validators (extends shared)
│   ├── types/              \# Backend type augmentations
│   ├── prisma/
│   │   ├── schema.prisma   \# Data model
│   │   └── migrations/     \# Migration history
│   ├── create-app.ts       \# Express app factory
│   └── server.ts           \# Entry point
│
└── frontend/
    ├── app/
    │   ├── (protected)/        # Auth-guarded routes (layout with auth check)
    │   │   ├── activities/
    │   │   ├── admin/
    │   │   ├── crm/
    │   │   ├── dashboard/
    │   │   ├── sales/
    │   │   ├── settings/
    │   │   ├── system/
    │   │   └── layout.tsx      # Protected layout (auth middleware)
    │   ├── (public)/           # Unauthenticated routes (login, etc.)
    │   ├── css/
    │   ├── layout.tsx          # Root layout
    │   ├── page.tsx            # Root redirect
    │   ├── providers.tsx       # Global providers (TanStack Query, etc.)
    │   └── not-found.tsx
    ├── components/
    │   ├── ui/                 # shadcn/ui primitives
    │   ├── forms/              # Form components
    │   └── layout/             # Layout components
    └── lib/
        ├── api/                # Typed API client
        └── hooks/              # Custom React hooks

```

---

## 🚀 Quick Start

### Prerequisites
- [Bun](https://bun.sh) >= 1.0
- [Docker](https://docker.com) & Docker Compose

### 1. Clone & Install

```bash
git clone https://github.com/fabrix-87/mini-erp.git
cd mini-erp
bun install
```


### 2. Configure Environment

```bash
cp .env.example .env
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.example packages/frontend/.env
```


### 3. Start Infrastructure

```bash
docker-compose up -d
# PostgreSQL :5432 · Redis :6379 · MinIO :9000 · Adminer :8080
```


### 4. Setup Database

```bash
cd packages/backend
bun run prisma:generate
bun run prisma:migrate
bun run prisma:seed   # optional
```


### 5. Start Development Servers

```bash
# Terminal 1 — shared (watch mode)
cd packages/shared && bun run dev

# Terminal 2 — backend
cd packages/backend && bun run dev

# Terminal 3 — frontend
cd packages/frontend && bun run dev
```


### Access

| Service | URL |
| :-- | :-- |
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001 |
| Adminer (DB) | http://localhost:8080 |
| MinIO Console | http://localhost:9001 |


---

## 📦 Scripts

```bash
# Root
bun install           # Install all workspace deps
bun run build         # Build all packages
bun run check         # Type-check all packages
bun run clean         # Clean build artifacts

# Backend
bun run dev           # Dev server with hot reload
bun run prisma:migrate
bun test

# Frontend
bun run dev
bun run build
bun run lint
```


---

## 🧪 Testing

```bash
cd packages/backend && bun test
cd packages/frontend && bun test
```


---

## 🐳 Production Build

```bash
bun run build
docker-compose -f docker-compose.prod.yml up -d
```


---

## 🔐 Environment Variables

**Backend** (`packages/backend/.env`):

```env
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://user:password@localhost:5432/minierp"
JWT_SECRET=your-secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
REDIS_HOST=localhost
REDIS_PORT=6379
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=mini-erp
```

**Frontend** (`packages/frontend/.env`):

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```


---

## 👤 Author

**Fabrizio Menza** — Full-Stack Engineer · Catania, Italy

- GitHub: [@fabrix-87](https://github.com/fabrix-87)
- Specializations: TypeScript · Node.js · PostgreSQL · Next.js · ERP/SaaS architecture

---

## 📄 License

Released under the [GNU AGPLv3](LICENSE) license.

```