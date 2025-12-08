# 🔐 Sistema RBAC - Role-Based Access Control

Sistema completo di gestione ruoli e permessi per applicazioni enterprise.

## 📋 Indice

- [Caratteristiche](#caratteristiche)
- [Installazione](#installazione)
- [Struttura](#struttura)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Frontend Integration](#frontend-integration)
- [Best Practices](#best-practices)

## ✨ Caratteristiche

- ✅ **RBAC Completo**: Users → Roles → Permissions
- ✅ **Permessi Granulari**: Formato `resource:action`
- ✅ **Ruoli Multipli**: Un utente può avere più ruoli
- ✅ **Permessi Dinamici**: Gestione runtime senza ricompilare
- ✅ **Middleware Express**: Protezione automatica routes
- ✅ **React Hooks**: Hook pronti per Next.js
- ✅ **TypeScript**: Type-safe al 100%
- ✅ **Seed Script**: Setup database automatico

## 🚀 Installazione

### 1. Registra le routes

```typescript
// server.ts
import roleRoutes from './routes/roles.routes';

app.use('/api/roles', roleRoutes);
```

### 2. Esegui seed database

```bash
# Aggiungi script in package.json
"scripts": {
  "seed:rbac": "ts-node prisma/seeds/seed-rbac.ts"
}

# Esegui seed
npm run seed:rbac
```

### 3. Testa il sistema

```bash
# Login come admin
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Password123!"}'

# Verifica ruoli
curl http://localhost:5000/api/roles \
  -H "Authorization: Bearer <token>"
```

## 🏗️ Struttura

```
User (Utente)
  ↓ molti a molti
Role (Ruolo)
  ↓ molti a molti
Permission (Permesso)
```

### Formato Permessi

```
resource:action

Esempi:
- product:read
- product:create
- product:update
- product:delete
- product:manage  // tutti i permessi sulla risorsa
```

### Ruoli Predefiniti

| Ruolo | Codice | Descrizione | isDefault |
|-------|--------|-------------|-----------|
| Administrator | ADMIN | Accesso completo | No |
| Manager | MANAGER | Gestione operativa | No |
| Sales | SALES | Vendite e clienti | No |
| Warehouse | WAREHOUSE | Solo magazzino | No |
| User | USER | Utente base | **Sì** |

## 🎯 Quick Start

### Backend: Proteggere una Route

```typescript
import { authenticateToken, authorize } from '../middleware/auth';

// Singolo permesso
router.get(
  '/products',
  authenticateToken,
  authorize(['product:read']),
  getAllProducts
);

// Permessi multipli (OR logic)
router.post(
  '/products',
  authenticateToken,
  authorize(['product:create', 'product:manage']),
  createProduct
);

// Solo admin
router.delete(
  '/products/:id',
  authenticateToken,
  authorize(['product:delete', 'product:manage']),
  deleteProduct
);
```

### Frontend: Hook Personalizzato

```typescript
// hooks/usePermissions.ts
import { useAuth } from '@/context/AuthContext';

export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = (permissionCode: string): boolean => {
    if (!user) return false;
    return user.roles.some(role => 
      role.permissions?.some(p => p.code === permissionCode)
    );
  };

  return { hasPermission };
};
```

### Frontend: Proteggere UI

```typescript
// components/ProtectedButton.tsx
import { usePermissions } from '@/hooks/usePermissions';

export default function ProductActions() {
  const { hasPermission } = usePermissions();

  return (
    <div>
      {hasPermission('product:create') && (
        <button onClick={handleCreate}>
          Crea Prodotto
        </button>
      )}

      {hasPermission('product:delete') && (
        <button onClick={handleDelete}>
          Elimina
        </button>
      )}
    </div>
  );
}
```

## 📚 API Reference

### Roles

```bash
GET    /api/roles                    # Lista ruoli
GET    /api/roles/:id                # Dettagli ruolo
GET    /api/roles/code/:code         # Ruolo per codice
POST   /api/roles                    # Crea ruolo
PUT    /api/roles/:id                # Aggiorna ruolo
DELETE /api/roles/:id                # Elimina ruolo
GET    /api/roles/:id/permissions    # Permessi ruolo
POST   /api/roles/:id/permissions    # Assegna permessi
DELETE /api/roles/:id/permissions    # Rimuovi permessi
GET    /api/roles/:id/users          # Utenti con ruolo
```

### Permissions

```bash
GET    /api/roles/permissions              # Lista permessi
GET    /api/roles/permissions/:id          # Dettagli permesso
POST   /api/roles/permissions              # Crea permesso
PUT    /api/roles/permissions/:id          # Aggiorna permesso
DELETE /api/roles/permissions/:id          # Elimina permesso
GET    /api/roles/permissions/:id/roles    # Ruoli con permesso
POST   /api/roles/sync-permissions         # Sincronizza permessi
```

### User Management

```bash
POST /api/roles/users/assign              # Assegna ruoli
POST /api/roles/users/remove              # Rimuovi ruoli
GET  /api/roles/users/:userId/roles       # Ruoli utente
GET  /api/roles/users/:userId/permissions # Permessi utente
POST /api/roles/users/check-permission    # Verifica permesso
```

## 🔧 Esempi Pratici

### Creare un Nuovo Ruolo

```typescript
const response = await api.post('/roles', {
  code: 'ACCOUNTANT',
  name: 'Contabile',
  description: 'Gestione documenti fiscali',
  isDefault: false,
  permissionIds: [21, 22, 23, 24] // document permissions
});
```

### Assegnare Ruoli a Utente

```typescript
await api.post('/roles/users/assign', {
  userId: 5,
  roleIds: [2, 3] // Manager + Sales
});
```

### Verificare Permesso

```typescript
const { data } = await api.post('/roles/users/check-permission', {
  userId: 5,
  permissionCode: 'product:delete'
});

if (data.hasPermission) {
  // Mostra bottone elimina
}
```

### Sincronizzare Permessi

```typescript
// Aggiorna database con nuovi permessi dal codice
await api.post('/roles/sync-permissions');
```

## 🎨 Frontend Integration

### Context Provider

```typescript
// context/AuthContext.tsx
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const refreshUser = async () => {
    const { data } = await api.get('/users/me');
    setUser(data.data); // Include roles e permissions
  };

  // ...
}
```

### Protected Component

```typescript
// components/ProtectedElement.tsx
export default function ProtectedElement({
  children,
  permission,
  fallback = null
}) {
  const { hasPermission } = usePermissions();

  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
}
```

### Usage

```typescript
<ProtectedElement permission="product:delete">
  <DeleteButton />
</ProtectedElement>
```

## ✅ Best Practices

### Nomenclatura

```typescript
// ✅ CORRETTO
Role: "ADMIN", "MANAGER", "SALES"  // UPPERCASE
Permission: "product:read", "user:manage"  // lowercase

// ❌ SBAGLIATO
Role: "Admin", "manager"
Permission: "Product:Read", "USER_MANAGE"
```

### Gerarchia Permessi

```typescript
// Usa sempre pattern con "manage"
product:read     // Lettura
product:create   // Creazione
product:update   // Modifica
product:delete   // Eliminazione
product:manage   // TUTTI i permessi

// Nel middleware
authorize(['product:create', 'product:manage'])
// Chi ha "manage" può fare tutto
```

### Sicurezza

```typescript
// ✅ SEMPRE verificare nel backend
router.delete('/products/:id',
  authenticateToken,
  authorize(['product:delete']),  // Backend check
  deleteProduct
);

// ❌ MAI fare SOLO controlli frontend
{hasPermission('product:delete') && <DeleteButton />}
// Nasconde solo UI, API deve verificare comunque!
```

### Gestione Ruoli

```typescript
// ✅ Permetti ruoli multipli
user.roles = [MANAGER, SALES]

// ✅ Usa ruolo USER come default
{ isDefault: true }

// ✅ Non lasciare utenti senza ruoli
if (remainingRoles.length === 0) {
  throw new Error('Almeno un ruolo richiesto');
}
```

## 🐛 Troubleshooting

### Utente non può accedere

```bash
# 1. Verifica permessi utente
GET /api/roles/users/5/permissions

# 2. Verifica ruoli assegnati
GET /api/roles/users/5/roles

# 3. Verifica permesso specifico
POST /api/roles/users/check-permission
{ "userId": 5, "permissionCode": "product:delete" }
```

### Permesso non funziona

```bash
# 1. Sincronizza permessi
POST /api/roles/sync-permissions

# 2. Verifica formato code
product:delete  ✅
Product:Delete  ❌
```

### Ruolo non può essere eliminato

```bash
# Verifica utenti assegnati
GET /api/roles/2/users

# Riassegna utenti ad altro ruolo
POST /api/roles/users/assign
```

## 📖 Risorse

- [Guida Completa RBAC](./docs/rbac-guide.md)
- [API Documentation](./docs/api-reference.md)
- [Frontend Examples](./docs/frontend-examples.md)

## 📝 License

MIT