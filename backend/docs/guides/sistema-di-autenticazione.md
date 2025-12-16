# 🔐 Sistema di Autenticazione - Documentazione

## 🎯 Overview

Sistema di autenticazione JWT enterprise-grade con:
- ✅ **Redis Session Store** - Sessioni persistenti e scalabili
- ✅ **Token Rotation** - Refresh token rotation automatica
- ✅ **Blacklist JTI** - Invalidazione token su logout
- ✅ **Browser Fingerprinting** - Prevenzione token theft
- ✅ **Rate Limiting** - Protezione contro attacchi brute-force
- ✅ **Sliding Sessions** - Auto-rinnovo sessioni attive
- ✅ **JWT Claims Completi** - iss, aud, jti, exp, iat

---

## 📡 API Endpoints

### 🔓 Public Endpoints (Autenticazione)

#### 1️⃣ **POST** `/api/users/register`
**Descrizione:** Registra un nuovo utente
**Rate Limit:** 3 registrazioni/ora per IP

**Request Body:**
```json
{
  "username": "mario.rossi",
  "email": "mario@example.com",
  "password": "SecurePass123!",
  "details": {
    "firstName": "Mario",
    "lastName": "Rossi"
  }
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Utente registrato con successo",
  "data": {
    "id": 1,
    "username": "mario.rossi",
    "email": "mario@example.com",
    "roles": [
      {
        "id": 1,
        "code": "USER",
        "name": "Utente Base"
      }
    ],
    "details": {
      "firstName": "Mario",
      "lastName": "Rossi"
    }
  }
}
```

---

#### 2️⃣ **POST** `/api/users/login`
**Descrizione:** Login utente con generazione sessione Redis
**Rate Limit:** 5 tentativi/15min per IP

**Request Body:**
```json
{
  "email": "mario@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Login effettuato con successo",
  "data": {
    "user": {
      "id": 1,
      "username": "mario.rossi",
      "email": "mario@example.com",
      "roles": [
        {
          "id": 1,
          "code": "USER",
          "name": "Utente Base"
        }
      ],
      "details": {
        "firstName": "Mario",
        "lastName": "Rossi",
        "lastLogin": "2024-12-16T10:30:00.000Z"
      }
    },
    "expiresIn": 900000
  }
}
```

**Cookies Impostati:**
```
Set-Cookie: accessToken=eyJhbGc...; HttpOnly; Secure; SameSite=Strict; Max-Age=900; Path=/
Set-Cookie: refreshToken=eyJhbGc...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/api/users/refresh-token
```

**Redis Data Salvati:**
```
session:1 -> {userId, username, email, roles, fingerprint, loginAt, lastActivity}
refresh:1 -> [refreshTokenId1, refreshTokenId2, ...]
```

---

#### 3️⃣ **POST** `/api/users/logout`
**Descrizione:** Logout con rimozione sessione e blacklist JTI
**Autenticazione:** ✅ Richiesta (accessToken cookie)

**Response (200):**
```json
{
  "status": "success",
  "message": "Logout effettuato con successo"
}
```

**Cookies Rimossi:**
```
Set-Cookie: accessToken=; Max-Age=0
Set-Cookie: refreshToken=; Max-Age=0
```

**Redis Operations (Atomic MULTI/EXEC):**
```
DEL session:1
DEL refresh:1
SET blacklist:jti-uuid "blacklisted" EX 900
```

---

#### 4️⃣ **POST** `/api/users/refresh-token`
**Descrizione:** Refresh access token con token rotation
**Rate Limit:** 30 refresh/5min per utente

**Request:** Cookie `refreshToken` automatico

**Response (200):**
```json
{
  "status": "success",
  "message": "Token aggiornato con successo",
  "data": {
    "expiresIn": 900000
  }
}
```

**Cookies Aggiornati:**
```
Set-Cookie: accessToken=NEW_TOKEN; ...
Set-Cookie: refreshToken=NEW_REFRESH_TOKEN; ...
```

**Redis Operations:**
```
LREM refresh:1 oldRefreshTokenId
LPUSH refresh:1 newRefreshTokenId
SET session:1 {...} EX 604800
```

---

#### 5️⃣ **POST** `/api/users/forgot-password`
**Descrizione:** Richiedi reset password
**Rate Limit:** 3 richieste/ora per IP

**Request Body:**
```json
{
  "email": "mario@example.com"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Se l'email esiste, riceverai le istruzioni per il reset"
}
```

---

### 🔒 Private Endpoints (Richiedono Autenticazione)

#### 6️⃣ **GET** `/api/users/me`
**Descrizione:** Ottieni profilo utente corrente
**Autenticazione:** ✅ Richiesta

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "username": "mario.rossi",
    "email": "mario@example.com",
    "active": true,
    "roles": [
      {
        "id": 1,
        "code": "USER",
        "name": "Utente Base"
      }
    ],
    "details": {
      "firstName": "Mario",
      "lastName": "Rossi",
      "phone": "+39 333 1234567",
      "lastLogin": "2024-12-16T10:30:00.000Z"
    },
    "preferredLanguageId": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-12-16T10:30:00.000Z"
  }
}
```

---

#### 7️⃣ **PUT** `/api/users/me/profile`
**Descrizione:** Aggiorna profilo utente
**Autenticazione:** ✅ Richiesta

**Request Body:**
```json
{
  "username": "mario.rossi.new",
  "email": "mario.new@example.com",
  "preferredLanguageId": 2,
  "details": {
    "phone": "+39 333 9999999"
  }
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Profilo aggiornato con successo",
  "data": {
    "id": 1,
    "username": "mario.rossi.new",
    "email": "mario.new@example.com",
    "roles": [...],
    "details": {...}
  }
}
```

---

#### 8️⃣ **PUT** `/api/users/me/change-password`
**Descrizione:** Cambia password utente
**Autenticazione:** ✅ Richiesta

**Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecurePass456!"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Password modificata con successo"
}
```

---

### 👑 Admin Endpoints (Richiedono Permessi)

#### 9️⃣ **GET** `/api/users`
**Descrizione:** Lista utenti con filtri e paginazione
**Autenticazione:** ✅ Richiesta
**Permessi:** `user:read` o `user:manage`

**Query Parameters:**
```
page=1
limit=10
search=mario
active=true
roleId=2
sortBy=createdAt
sortOrder=desc
```

**Response (200):**
```json
{
  "status": "success",
  "results": 2,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "pages": 1
  },
  "data": [
    {
      "id": 1,
      "username": "mario.rossi",
      "email": "mario@example.com",
      "active": true,
      "roles": [...],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### 🔟 **GET** `/api/users/:id`
**Descrizione:** Ottieni dettagli utente specifico
**Autenticazione:** ✅ Richiesta
**Permessi:** `user:read` o `user:manage`

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "username": "mario.rossi",
    "email": "mario@example.com",
    "active": true,
    "roles": [...],
    "details": {...},
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-12-16T10:30:00.000Z"
  }
}
```

---

#### 1️⃣1️⃣ **POST** `/api/users`
**Descrizione:** Crea nuovo utente (Admin)
**Autenticazione:** ✅ Richiesta
**Permessi:** `user:create` o `user:manage`

**Request Body:**
```json
{
  "username": "new.user",
  "email": "new@example.com",
  "password": "TempPass123!",
  "roleIds": [1, 2],
  "preferredLanguageId": 1,
  "details": {
    "firstName": "Nuovo",
    "lastName": "Utente"
  }
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Utente creato con successo",
  "data": {
    "id": 2,
    "username": "new.user",
    "email": "new@example.com",
    "roles": [...],
    "details": {...}
  }
}
```

---

#### 1️⃣2️⃣ **PUT** `/api/users/:id/roles`
**Descrizione:** Aggiorna ruoli utente
**Autenticazione:** ✅ Richiesta
**Permessi:** `user:manage`

**Request Body:**
```json
{
  "roleIds": [2, 3]
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Ruoli aggiornati con successo",
  "data": {
    "id": 2,
    "username": "new.user",
    "roles": [
      { "id": 2, "code": "MANAGER", "name": "Manager" },
      { "id": 3, "code": "EDITOR", "name": "Editor" }
    ]
  }
}
```

---

#### 1️⃣3️⃣ **PATCH** `/api/users/:id/toggle-active`
**Descrizione:** Attiva/Disattiva utente
**Autenticazione:** ✅ Richiesta
**Permessi:** `user:manage`

**Request Body:**
```json
{
  "active": false
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Utente disattivato con successo",
  "data": {
    "userId": 2,
    "active": false
  }
}
```

---

#### 1️⃣4️⃣ **DELETE** `/api/users/:id`
**Descrizione:** Elimina utente
**Autenticazione:** ✅ Richiesta
**Permessi:** `user:delete` o `user:manage`

**Response (204):**
```json
{
  "status": "success",
  "data": null
}
```

---

## 🔐 JWT Token Structure

### Access Token Payload
```json
{
  "userId": 1,
  "email": "mario@example.com",
  "username": "mario.rossi",
  "roles": [
    { "id": 1, "code": "USER", "name": "Utente Base" }
  ],
  "fingerprint": "a1b2c3d4...",
  "jti": "550e8400-e29b-41d4-a716-446655440000",
  "iat": 1702728600,
  "exp": 1702729500,
  "iss": "your-app-backend",
  "aud": "your-app-frontend"
}
```

### Refresh Token Payload
```json
{
  "userId": 1,
  "jti": "650e8400-e29b-41d4-a716-446655440001",
  "type": "refresh",
  "iat": 1702728600,
  "exp": 1703333400,
  "iss": "your-app-backend",
  "aud": "your-app-frontend"
}
```

---

## 🛡️ Security Features

### 1. Browser Fingerprinting
```typescript
// Generato da User-Agent, Accept-Language, IP
fingerprint: "a1b2c3d4e5f6..."

// Verificato ad ogni richiesta
if (tokenFingerprint !== currentFingerprint) {
  throw new UnauthorizedError('Token theft detected');
}
```

### 2. Token Blacklist (JTI)
```redis
# Su logout, il JTI viene aggiunto alla blacklist
SET blacklist:jti-uuid "blacklisted" EX 900

# Verificato ad ogni richiesta autenticata
GET blacklist:jti-uuid
```

### 3. Session Store (Redis)
```redis
# Dati sessione persistenti
SET session:1 {
  "userId": 1,
  "username": "mario.rossi",
  "fingerprint": "abc...",
  "loginAt": "2024-12-16T10:00:00Z",
  "lastActivity": "2024-12-16T10:30:00Z"
} EX 604800

# Sliding session: TTL aggiornato ad ogni richiesta
EXPIRE session:1 604800
```

### 4. Refresh Token Whitelist
```redis
# Lista refresh token validi per utente
LPUSH refresh:1 "refresh-jti-1"
LPUSH refresh:1 "refresh-jti-2"
LTRIM refresh:1 0 4  # Max 5 sessioni contemporanee
EXPIRE refresh:1 604800
```

### 5. Token Rotation
```typescript
// Ad ogni refresh:
1. Verifica vecchio refresh token in whitelist
2. Genera NUOVO access + refresh token
3. Rimuovi vecchio refresh token
4. Aggiungi nuovo refresh token
5. Aggiorna sessione
// ✅ Operazione atomica (Redis MULTI/EXEC)
```

### 6. Rate Limiting (Redis Sliding Window)
```redis
# Sliding window preciso con ZSET
ZADD rate:login:192.168.1.1 1702728600000 "1702728600000"
ZREMRANGEBYSCORE rate:login:192.168.1.1 0 1702727700000  # Rimuovi vecchi
ZCARD rate:login:192.168.1.1  # Conta richieste nella finestra
```

---

## ⚙️ Configuration (.env)

```bash
# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
JWT_ISSUER="your-app-backend"
JWT_AUDIENCE="your-app-frontend"

# Security
FINGERPRINT_ENABLED="true"
SESSION_SLIDING="true"
MAX_CONCURRENT_SESSIONS="5"
SINGLE_REFRESH_TOKEN="false"
```

---

## 🚀 Setup Instructions

### 1. Installa Dipendenze
```bash
npm install redis uuid
npm install --save-dev @types/uuid
```

### 2. Avvia Redis
```bash
# Docker (Raccomandato)
docker run -d --name redis-auth -p 6379:6379 redis:7-alpine

# Verifica connessione
redis-cli ping  # Output: PONG
```

### 3. Configura .env
Copia le variabili d'ambiente e modifica i secrets.

### 4. Aggiorna Import
Aggiungi nei controller:
```typescript
import { generateFingerprint, saveSession, destroySession, ... } from '../helpers/user';
```

### 5. Test
```bash
# Login
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}' \
  -c cookies.txt

# Verifica Redis
redis-cli
> GET session:1
> LRANGE refresh:1 0 -1

# Protected endpoint
curl http://localhost:5000/api/users/me \
  -b cookies.txt

# Logout
curl -X POST http://localhost:5000/api/users/logout \
  -b cookies.txt

# Verifica blacklist
redis-cli
> GET blacklist:jti-uuid
```

---

## 📊 Redis Data Structure

```
┌─────────────────────────────────────────┐
│         Redis Key Structure             │
├─────────────────────────────────────────┤
│ session:{userId}                        │
│   → JSON: user data + metadata          │
│   → TTL: 7 days (sliding)               │
├─────────────────────────────────────────┤
│ refresh:{userId}                        │
│   → LIST: [jti1, jti2, ...]            │
│   → MAX: 5 items (configurable)        │
│   → TTL: 7 days                         │
├─────────────────────────────────────────┤
│ blacklist:{jti}                         │
│   → STRING: "blacklisted"               │
│   → TTL: token remaining lifetime       │
├─────────────────────────────────────────┤
│ rate:{scope}:{identifier}               │
│   → ZSET: timestamp → request           │
│   → TTL: window duration                │
└─────────────────────────────────────────┘
```

---

## 🎯 Vantaggi Sistema

✅ **Scalabilità**: Redis distribuito supporta milioni di sessioni  
✅ **Sicurezza**: Multi-layer (fingerprint, blacklist, rotation)  
✅ **Performance**: Verifica locale JWT + lazy Redis check  
✅ **Flessibilità**: Configurabile per diversi use case  
✅ **Monitoraggio**: Tutti gli accessi tracciati in Redis  
✅ **Compliance**: Logout istantaneo + revoca token

---

## 🔄 Flow Diagram Implementato

```
LOGIN
------
1. Validate credentials (DB)
2. Generate fingerprint (req headers)
3. Generate JWT pair (access + refresh) with jti
4. Save session in Redis (MULTI/EXEC):
   - SET session:{userId}
   - LPUSH refresh:{userId} refreshTokenId
5. Set httpOnly cookies
6. Return user data

PROTECTED REQUEST
-----------------
1. Read accessToken from cookie
2. Verify JWT signature (local)
3. Validate claims (iss, aud, exp)
4. Check jti NOT in blacklist (Redis)
5. Check session exists (Redis)
6. Verify fingerprint matches
7. Update session TTL if sliding enabled
8. Process request

REFRESH TOKEN
-------------
1. Read refreshToken from cookie
2. Verify JWT signature
3. Check jti in whitelist (Redis)
4. Generate NEW token pair
5. Rotate refresh token (MULTI/EXEC):
   - LREM old refreshTokenId
   - LPUSH new refreshTokenId
6. Update session
7. Set new cookies

LOGOUT
------
1. Get jti from access token
2. Calculate TTL remaining
3. Destroy session (MULTI/EXEC):
   - DEL session:{userId}
   - DEL refresh:{userId}
   - SET blacklist:{jti} EX {ttl}
4. Clear cookies
```

---

## 📞 Support

Per domande o problemi, verifica:
1. Redis è in esecuzione: `redis-cli ping`
2. Variabili .env sono configurate correttamente
3. I cookie sono httpOnly e secure in produzione
4. Le routes usano i middleware corretti