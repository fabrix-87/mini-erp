# 📦 Istruzioni per il Packaging Shared del Mini-ERP

## Contesto del Progetto

Stiamo sviluppando un CRM/ERP enterprise:

| Layer | Stack |
|-------|-------|
| **Backend** | Bun + Hono + Prisma (^7) + Zod (^4) + TypeScript + PostgreSQL |
| **Frontend** | NextJS 16 + Shadcn UI + TypeScript |
| **Shared** | Pacchetti reutilizzabili (types, validators, constants, services) |

🔗 **Repository:** [https://github.com/fabrix-87/mini-erp](https://github.com/fabrix-87/mini-erp)

---

## 📁 Struttura Percorsi

```
mini-erp/
├── packages/backend/          # Hono + Prisma server
├── packages/frontend/         # NextJS app
└── packages/shared/           # Packages reutilizzabili
    ├── src/
    │   ├── types/             # Type definitions (Zod schemas, Prisma models)
    │   ├── validators/        # Zod validators (Zod ^4)
    │   ├── constants/         # Costanti business logic
    │   ├── services/          # Servizi condivisi (email, storage, etc.)
    │   ├── helpers/           # Funzioni utility
    │   └── utils/             # Utility functions
    └── dist/                  # Build output
```

---

## 📋 Istruzioni per Nuove Funzioni nel Pacchetto Shared

### 1. Nominazione File

Usa sempre nomi in **kebab-case**:

- ✅ `user-validation.ts`, `address-utils.ts`
- Mantieni lo stesso pattern: `{entità}-{tipo}.ts`
  - es. `payment-validator.ts`, `contact-helper.ts`

---

### 2. Documentazione

Aggiungi sempre commenti **JSDoc in inglese** per ogni nuova funzione.

Pattern da seguire:

```ts
/**
 * Validates an email address format.
 *
 * @param email - The email string to validate
 * @returns true if valid, throws ValidationError if invalid
 * @throws ValidationError - If the email format is invalid
 * @see {@link ./primitives/string} for base validation utilities
 */
export function validateEmail(email: string): email is ValidatedEmail {
  // ...
}
```

---

### 3. Export Pattern

**Main `index.ts`:**

```ts
// packages/shared/src/index.ts
export * from './types';
export * from './validators';
export * from './constants';
export * from './services';
export * from './helpers';
export * from './utils';
```

**Subdirectory `index.ts`** (esportazione barrel):

```ts
// packages/shared/src/validators/index.ts
export * from './business';
export * from './query';
export * from './base';
```

---

### 4. Best Practices TypeScript Enterprise

| Regola | Descrizione |
|--------|-------------|
| `strict: true` | Always enable strict mode |
| `esModuleInterop: true` | Compatible con import ES modules |
| `declaration: true` | Genera sempre `.d.ts` |
| `sourceMap: true` | Mantiene mapping per debugging |
| `forceConsistentCasingInFileNames` | Previene errori su macOS/Linux |

---

### 5. Pubblicazione dei Moduli

Il pacchetto shared è configurato come **ES module**:

```json
{
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./validators": "./dist/validators/index.js",
    "./types": "./dist/types/index.js",
    "./constants": "./dist/constants/index.js",
    "./utils": "./dist/utils/index.js"
  }
}
```

---

### 6. Build Commands

```bash
# Build produzione
bun run build

# Dev con watch
bun run dev

# Pulizia build
bun run clean

# Type checking
bun run type-check
```

---

### 7. Integrazione nei `package.json`

**Backend** (già configurato):

```json
{
  "dependencies": {
    "@mini-erp/shared": "workspace:*"
  }
}
```

**Frontend** (da configurare):

```json
{
  "dependencies": {
    "@mini-erp/shared": "workspace:*"
  }
}
```

---

### 8. Monorepo Workflows

Usa `npm workspaces` o `bun workspaces`:

```bash
# Install workspace dependencies
bun install

# Link workspace packages
bun link

# Build tutti i workspace
bun run --filter "@mini-erp/shared" build
```

---

## ⚠️ NON FARE MAI

| ❌ | Descrizione |
|----|-------------|
| ❌ | Non modificare mai direttamente i file nel repository GitHub |
| ❌ | Non usare nomi camelCase per i file: `userData.ts` → ❌, `user-data.ts` → ✅ |
| ❌ | Non esportare funzioni private: usa `export default` con namespace se necessario |
| ❌ | Non duplicare validatori: ogni validator deve essere nell'`@mini-erp/shared` |
| ❌ | Non usare date relative nei commenti: `2026-05-12` → ✅, `next year` → ❌ |

---

## ✅ FAI SEMPRE

| ✅ | Descrizione |
|----|-------------|
| ✅ | Aggiungi JSDoc in inglese per ogni funzione pubblica |
| ✅ | Usa relative imports all'interno del pacchetto |
| ✅ | Genera type declarations (`declaration: true`) |
| ✅ | Mantieni le dipendenze leggere (solo ciò che è necessario) |
| ✅ | Usa gli export barrel per semplificare l'import |

---

## 🔗 Link Utili

| File | Percorso |
|------|----------|
| README | `packages/shared/README.md` |
| TSConfig | `packages/shared/tsconfig.json` |
| Package | `packages/shared/package.json` |