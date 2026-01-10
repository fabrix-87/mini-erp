# Mini-ERP

Sistema CRM/ERP completo costruito con Node.js, Next.js e PostgreSQL.

## 🏗️ Architettura

Questo progetto è strutturato come un **monorepo** con workspace gestiti tramite Bun.

    mini-erp/
    ├── packages/
    │ ├── shared/ # Validatori Zod, types e utils condivisi
    │ ├── backend/ # API REST con Express, Prisma, PostgreSQL
    │ └── frontend/ # App Next.js con React 19 e shadcn/ui
    ├── docker-compose.yml # PostgreSQL, Redis, MinIO
    └── package.json # Workspace root


## 🛠️ Stack Tecnologico

### Backend
- **Runtime**: Bun
- **Framework**: Express.js
- **Database**: PostgreSQL con Prisma ORM
- **Validazione**: Zod
- **Auth**: JWT (jsonwebtoken)
- **Cache**: Redis
- **Storage**: MinIO (S3-compatible)
- **Queue**: BullMQ
- **WebSocket**: Socket.io
- **Logging**: Winston

### Frontend
- **Framework**: Next.js 16 (App Router)
- **React**: 19
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui + Radix UI
- **Forms**: React Hook Form + Zod
- **State Management**: TanStack Query
- **Tables**: TanStack Table
- **Charts**: Recharts
- **i18n**: next-intl
- **Icons**: Tabler Icons, Lucide

### Shared Package
- **Validazione**: Zod schemas
- **Types**: TypeScript types condivisi
- **Constants**: Enum e costanti
- **Utils**: Funzioni utility

## 📋 Prerequisiti

- [Bun](https://bun.sh) >= 1.0
- [Docker](https://www.docker.com/) e Docker Compose
- PostgreSQL 16+ (via Docker o locale)

## 🚀 Quick Start

### 1. Clona il Repository

```bash
git clone https://github.com/fabrix-87/mini-erp.git
cd mini-erp
```
### 2. Installa Dipendenze
``` bash
bun install
```
### 3. Setup Environment
```bash
# Copia i file .env.example
cp .env.example .env
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.example packages/frontend/.env

# Modifica le variabili secondo necessità
nano packages/backend/.env
```
### 4. Avvia Servizi Docker
```bash
docker-compose up -d
```
Questo avvia:

PostgreSQL (porta 5432)

Redis (porta 6379)

MinIO (porta 9000)

Adminer (porta 8080)

### 5. Setup Database
```bash
cd packages/backend

# Genera Prisma Client
bun run prisma:generate

# Esegui migrations
bun run prisma:migrate

# (Opzionale) Seed database
bun run prisma:seed
```
### 6. Build Shared Package

```bash
cd packages/shared
bun run build
cd ../..
```
7. Avvia Development Servers
Apri 3 terminali separati:

#### Terminal 1 - Shared (watch mode)

```bash
cd packages/shared
bun run dev
```

#### Terminal 2 - Backend

```bash
cd packages/backend
bun run dev
```

#### Terminal 3 - Frontend

```bash
cd packages/frontend
bun run dev
```

### 8. Accedi all'Applicazione
Frontend: http://localhost:3000

Backend API: http://localhost:3001

Adminer: http://localhost:8080

MinIO Console: http://localhost:9001


# 📦 Scripts Disponibili
### Root
``` bash
bun install              # Installa tutte le dipendenze
bun run build            # Build di tutti i package
bun run build:shared     # Build solo shared
bun run clean            # Pulisci build artifacts
bun run check            # Type-check tutti i package
``` 
### Shared Package
``` bash
cd packages/shared
bun run build            # Build TypeScript
bun run dev              # Watch mode (rebuild automatico)
bun run clean            # Rimuovi dist/
bun run type-check       # Type-check senza emit
``` 
### Backend
``` bash
cd packages/backend
bun run dev              # Development server con hot reload
bun run build            # Build per production
bun run start            # Avvia server production
bun run prisma:generate  # Genera Prisma Client
bun run prisma:migrate   # Esegui migrations
bun run prisma:seed      # Seed database
bun test                 # Esegui test
``` 

### Frontend
``` bash
cd packages/frontend
bun run dev              # Development server
bun run build            # Build per production
bun run start            # Avvia server production
bun run lint             # Lint codice
``` 

# 🗂️ Struttura del Progetto

    mini-erp/
    ├── packages/
    │   ├── shared/                    # Package condiviso
    │   │   ├── src/
    │   │   │   ├── validators/        # Zod schemas
    │   │   │   │   ├── user.ts
    │   │   │   │   ├── customer.ts
    │   │   │   │   ├── activity.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── types/             # TypeScript types
    │   │   │   ├── constants/         # Costanti & enums
    │   │   │   ├── utils/             # Utility functions
    │   │   │   └── index.ts
    │   │   ├── dist/                  # Build output (gitignored)
    │   │   ├── package.json
    │   │   └── tsconfig.json
    │   │
    │   ├── backend/                   # API Backend
    │   │   ├── config/                # Configurazioni
    │   │   ├── controllers/           # Route controllers
    │   │   ├── middleware/            # Express middleware
    │   │   ├── models/                # Business logic
    │   │   ├── routes/                # API routes
    │   │   ├── services/              # Servizi esterni
    │   │   ├── utils/                 # Utility functions
    │   │   ├── validators/            # Validators (usa @mini-erp/shared)
    │   │   ├── prisma/                # Prisma schema & migrations
    │   │   │   ├── schema.prisma
    │   │   │   └── migrations/
    │   │   ├── server.ts              # Entry point
    │   │   ├── package.json
    │   │   └── tsconfig.json
    │   │
    │   └── frontend/                  # Next.js App
    │       ├── app/                   # App Router
    │       │   ├── [locale]/          # Internazionalizzazione
    │       │   ├── api/               # API routes (se necessario)
    │       │   └── layout.tsx
    │       ├── components/            # React components
    │       │   ├── ui/                # shadcn/ui components
    │       │   ├── forms/             # Form components
    │       │   └── layout/            # Layout components
    │       ├── lib/                   # Utilities
    │       │   ├── api/               # API client
    │       │   ├── hooks/             # Custom hooks
    │       │   └── utils.ts
    │       ├── types/                 # TypeScript types
    │       ├── public/                # Static assets
    │       ├── package.json
    │       ├── next.config.js
    │       └── tsconfig.json
    │
    ├── docker-compose.yml             # Docker services
    ├── .env.example                   # Template variabili ambiente
    ├── .gitignore
    ├── package.json                   # Root workspace
    ├── bun.lockb                      # Lock file (unico per workspace)
    └── README.md

# 🔧 Configurazione
Variabili d'Ambiente
Backend (packages/backend/.env)

    NODE_ENV=development
    PORT=3001

    # Database
    DATABASE_URL="postgresql://user:password@localhost:5432/minierp"

    # JWT
    JWT_SECRET=your-super-secret-key
    JWT_EXPIRES_IN=7d
    JWT_REFRESH_EXPIRES_IN=30d

    # Redis
    REDIS_HOST=localhost
    REDIS_PORT=6379

    # MinIO
    MINIO_ENDPOINT=localhost
    MINIO_PORT=9000
    MINIO_ACCESS_KEY=minioadmin
    MINIO_SECRET_KEY=minioadmin
    MINIO_BUCKET=mini-erp

    # Email (opzionale)
    SMTP_HOST=
    SMTP_PORT=
    SMTP_USER=
    SMTP_PASS=

Frontend (packages/frontend/.env)

    NEXT_PUBLIC_API_URL=http://localhost:3001
    NEXT_PUBLIC_APP_URL=http://localhost:3000

## 🔄 Workflow di Sviluppo

Modifica Shared Package
Quando modifichi validators/types in packages/shared:

1.  Il watch mode (bun run dev) rebuilda automaticamente

2. Backend e Frontend vedranno le modifiche al prossimo hot reload

Aggiungere un Nuovo Validator
``` typescript
// packages/shared/src/validators/product.ts
import { z } from 'zod';

export const ProductSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  sku: z.string().min(1),
});

export type Product = z.infer<typeof ProductSchema>;
``` 

``` typescript
// packages/shared/src/validators/index.ts
export * from './user';
export * from './customer';
export * from './product';  // Aggiungi export
``` 

``` typescript
// Usa nel backend
import { ProductSchema } from '@mini-erp/shared/validators/product';

// Usa nel frontend
import { ProductSchema, type Product } from '@mini-erp/shared/validators/product';
``` 

Aggiungere una Nuova Feature
1. Database: Aggiungi model in packages/backend/prisma/schema.prisma

2. Migration: bun run prisma:migrate

3. Validator: Crea schema in packages/shared/src/validators/

4. Backend:

    - Controller in packages/backend/controllers/

    - Route in packages/backend/routes/

5. Frontend:

    - API client in packages/frontend/lib/api/

    - Components in packages/frontend/components/

    - Pages in packages/frontend/app/

## 🧪 Testing
``` bash
# Backend tests
cd packages/backend
bun test

# Frontend tests (se configurato)
cd packages/frontend
bun test
``` 

## 🏗️ Build per Production
``` bash
# Build tutti i package
bun run build

# Oppure individualmente
cd packages/shared && bun run build
cd packages/backend && bun run build
cd packages/frontend && bun run build
``` 

### 🐳 Deploy con Docker
``` bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Avvia in produzione
docker-compose -f docker-compose.prod.yml up -d
``` 
### 🔍 Troubleshooting
"Cannot find module '@mini-erp/shared'"
``` bash
# Rebuilda shared e reinstalla dipendenze
cd packages/shared
bun run build
cd ../..
bun install
``` 
### Backend non parte dopo modifica shared
``` bash
# Controlla che shared sia buildato
ls packages/shared/dist/

# Se dist/ è vuoto
cd packages/shared
bun run build
``` 
### TypeScript errors su imports
``` bash
# Type-check tutti i package
cd packages/shared && bun x tsc --noEmit
cd packages/backend && bun x tsc --noEmit
cd packages/frontend && bun x tsc --noEmit
``` 
Hot reload non funziona
- Verifica che shared sia in watch mode (bun run dev)

- Riavvia backend/frontend

- Pulisci cache: rm -rf packages/*/node_modules packages/*/.next

## 📚 Documentazione Aggiuntiva
- [Bun Documentation](https://bun.sh/docs)

- [Next.js Documentation](https://nextjs.org/docs)

- [Prisma Documentation](https://www.prisma.io/docs)

- [Zod Documentation](https://zod.dev/)

- [shadcn/ui Documentation](https://ui.shadcn.com/)

## 🤝 Contribuire
1. Fork il progetto

2. Crea un branch per la feature (git checkout -b feature/AmazingFeature)

3. Commit le modifiche (git commit -m 'Add some AmazingFeature')

4. Push al branch (git push origin feature/AmazingFeature)

5. Apri una Pull Request

### 📄 Licenza
Questo progetto è rilasciato sotto licenza [GNU AGPLv3](LICENSE).

### 👤 Autore
Fabrix

- GitHub: [@fabrix-87](https://github.com/fabrix-87)

⭐ Se questo progetto ti è utile, lascia una stella su GitHub!