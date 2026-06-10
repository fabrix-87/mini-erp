# Models TODO — Prisma Models to implement

Priority: 🔴 Alta · 🟡 Media · 🟢 Bassa     

- 🔴 [ ] User model - Cambiare il type di ID da Int autoincrement() a String CUID

`id String @id @default(cuid())`

- 🔴 Farlo su User, Tenant, Product, Document, Customer, Lead