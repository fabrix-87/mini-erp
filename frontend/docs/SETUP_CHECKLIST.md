# ✅ Setup Checklist - Autenticazione Avanzata Frontend

## 📦 1. Installazione Dipendenze

```bash
# Navigate to frontend directory
cd frontend

# Install required packages
npm install jose @fingerprintjs/fingerprintjs

# Verify installation
npm list jose @fingerprintjs/fingerprintjs
```

---

## 🔧 2. Configurazione Environment

### Frontend `.env.local`

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
API_URL=http://localhost:5000

# JWT Configuration (must match backend)
JWT_SECRET=your-secret-key-min-32-chars
JWT_ISSUER=your-app-backend
JWT_AUDIENCE=your-app-frontend

# App Configuration
NODE_ENV=development
```

### Backend `.env`

```bash
# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_ISSUER=your-app-backend
JWT_AUDIENCE=your-app-frontend

# Security
FINGERPRINT_ENABLED=true
SESSION_SLIDING=true
MAX_CONCURRENT_SESSIONS=5
```

---

## 📁 3. Struttura File da Creare

### Core Utilities

- [ ] `lib/jwt.ts` - JWT verification con jose
- [ ] `lib/fingerprint.ts` - Browser fingerprinting

### Middleware

- [ ] `proxy.ts` - Next.js 16 middleware

### API Routes

- [ ] `app/api/auth/login/route.ts`
- [ ] `app/api/auth/logout/route.ts`
- [ ] `app/api/auth/refresh/route.ts`

### API Client

- [ ] `lib/api/client.ts` (update existing)
- [ ] `lib/api/modules/auth.ts` (update existing)
- [ ] `lib/api/modules/user.ts` (update existing)

### Providers

- [ ] `providers/auth-provider.tsx` (update existing)

### Components

- [ ] `components/auth/login-form.tsx`
- [ ] `app/login/page.tsx`
- [ ] `app/dashboard/page.tsx` (example)
- [ ] `components/dashboard/user-profile-editor.tsx` (example)

---

## 🚀 4. Services da Avviare

### Redis

```bash
# Using Docker (Recommended)
docker run -d \
  --name redis-auth \
  -p 6379:6379 \
  redis:7-alpine

# Verify Redis is running
redis-cli ping
# Expected: PONG

# Monitor Redis operations (optional)
redis-cli monitor
```

### Backend Express

```bash
cd backend
npm run dev

# Verify backend is running
curl http://localhost:5000/health
```

### Frontend Next.js

```bash
cd frontend
npm run dev

# Open browser
open http://localhost:3000
```

---

## 🧪 5. Test Flow

### Test 1: Login

```bash
# Test login endpoint
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }' \
  -c cookies.txt \
  -v

# Expected: 200 OK with Set-Cookie headers
```

### Test 2: Protected Endpoint

```bash
# Test authenticated request
curl http://localhost:3000/api/users/me \
  -b cookies.txt \
  -v

# Expected: 200 OK with user data
```

### Test 3: Refresh Token

```bash
# Test refresh endpoint
curl -X POST http://localhost:3000/api/auth/refresh \
  -b cookies.txt \
  -c cookies-new.txt \
  -v

# Expected: 200 OK with new Set-Cookie headers
```

### Test 4: Logout

```bash
# Test logout
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt \
  -v

# Expected: 200 OK with cookies cleared
```

---

## 🔍 6. Verifiche Redis

```bash
# Connect to Redis
redis-cli

# Check session exists
GET session:1

# Check refresh token whitelist
LRANGE refresh:1 0 -1

# Check blacklist (after logout)
GET blacklist:{jti-from-token}

# Check rate limits
ZRANGE rate:login:127.0.0.1 0 -1 WITHSCORES

# Exit Redis CLI
exit
```

---

## 🎨 7. Browser Testing

### Manual Flow Test

1. **Open Browser**
   ```
   http://localhost:3000/login
   ```

2. **Login**
   - Email: `admin@example.com`
   - Password: `admin123`
   - Should redirect to `/dashboard`

3. **Check Cookies**
   - Open DevTools → Application → Cookies
   - Verify `accessToken` and `refreshToken` exist
   - Verify httpOnly flag is set

4. **Navigate Protected Pages**
   - Click around dashboard
   - Should NOT see login page

5. **Wait for Token Refresh**
   - Open Console
   - Wait 10+ minutes (or modify threshold)
   - Should see automatic refresh logs

6. **Logout**
   - Click logout button
   - Should redirect to `/login`
   - Cookies should be cleared

---

## 🐛 8. Common Issues & Solutions

### Issue: "JWT verification failed"

**Cause:** JWT_SECRET mismatch between frontend and backend

**Solution:**
```bash
# Ensure secrets match in both .env files
# Frontend .env.local
JWT_SECRET=same-secret-key

# Backend .env
JWT_SECRET=same-secret-key
```

---

### Issue: "Redis connection failed"

**Cause:** Redis not running or wrong URL

**Solution:**
```bash
# Check Redis is running
docker ps | grep redis

# Test connection
redis-cli ping

# Check URL in backend .env
REDIS_URL=redis://localhost:6379
```

---

### Issue: "Cannot set cookies"

**Cause:** CORS or httpOnly configuration

**Solution:**
```typescript
// Verify in route handlers
response.cookies.set('accessToken', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 900,
  path: '/',
});
```

---

### Issue: "401 on every request"

**Cause:** Token not being sent or fingerprint mismatch

**Solution:**
```bash
# Check cookies in browser DevTools
# Verify withCredentials in axios config
withCredentials: true

# Check fingerprint is being sent
# Frontend: lib/fingerprint.ts
# Backend: verify fingerprint middleware
```

---

### Issue: "Refresh loop"

**Cause:** Refresh token also expired or invalid

**Solution:**
```bash
# Check refresh token in Redis
redis-cli
LRANGE refresh:1 0 -1

# Verify refresh token expiry
# Backend .env
JWT_REFRESH_EXPIRES_IN=7d  # Should be longer than access
```

---

## 📊 9. Monitoring & Debugging

### Enable Debug Logs

```typescript
// proxy.ts - Add console.logs
console.log('🔍 Token status:', {
  valid: !!payload,
  expired: isTokenExpired(payload),
  expiringSoon: isTokenExpiringSoon(payload),
});

// client.ts - Add interceptor logs
console.log('📡 Request:', config.url);
console.log('📨 Response:', response.status);
```

### Monitor Redis Operations

```bash
# Real-time monitoring
redis-cli monitor

# Count active sessions
redis-cli KEYS "session:*" | wc -l

# Check memory usage
redis-cli INFO memory
```

### Check JWT Payload

```javascript
// In browser console
const token = document.cookie
  .split('; ')
  .find(row => row.startsWith('accessToken='))
  ?.split('=')[1];

const payload = JSON.parse(atob(token.split('.')[1]));
console.log('JWT Payload:', payload);
```

---

## ✅ 10. Final Checklist

### Security Checks

- [ ] JWT_SECRET is strong (min 32 chars)
- [ ] httpOnly cookies enabled
- [ ] secure flag enabled in production
- [ ] CORS properly configured
- [ ] Fingerprinting enabled
- [ ] Rate limiting active

### Functionality Checks

- [ ] Login works
- [ ] Protected routes accessible
- [ ] Token refresh automatic
- [ ] Logout cleans up everything
- [ ] 401 triggers auto-refresh
- [ ] Multiple tabs work correctly

### Performance Checks

- [ ] JWT verified locally (no backend call)
- [ ] Refresh only when needed
- [ ] Request queue during refresh
- [ ] Redis connection pooled
- [ ] No memory leaks

### UX Checks

- [ ] Loading states visible
- [ ] Error messages clear
- [ ] Smooth navigation
- [ ] No unexpected redirects
- [ ] Toast notifications work

---

## 🎓 11. Next Steps

1. **Customize UI**
   - Update login form styling
   - Add company logo
   - Customize error messages

2. **Add Features**
   - Remember me checkbox
   - Two-factor authentication
   - Social login (Google, GitHub)

3. **Implement Monitoring**
   - Sentry for error tracking
   - Analytics for auth events
   - Performance monitoring

4. **Security Enhancements**
   - Add CAPTCHA on login
   - Implement IP whitelist
   - Add suspicious activity alerts

5. **Testing**
   - Write unit tests
   - Add E2E tests with Playwright
   - Load testing with k6

---

## 📞 Support

If you encounter issues not covered here:

1. Check browser console for errors
2. Check backend logs
3. Verify Redis is running and accessible
4. Ensure environment variables are set correctly
5. Review the AUTH_FLOW.md documentation

---

**Status:** Ready for Development ✅  
**Version:** 1.0.0  
**Last Updated:** December 2025