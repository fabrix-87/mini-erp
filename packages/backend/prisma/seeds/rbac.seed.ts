
import bcrypt from 'bcryptjs';

import { prisma } from '../../config/prisma-client'

async function seedRBAC() {
  console.log('🌱 Starting RBAC seed...');

  try {
    // ========================================================================
    // 1. PERMESSI
    // ========================================================================
    console.log('📝 Creating permissions...');

    const permissions = [
      // User permissions
      { code: 'user:read', resource: 'user', action: 'read', description: 'Lettura utenti' },
      { code: 'user:create', resource: 'user', action: 'create', description: 'Creazione utenti' },
      { code: 'user:update', resource: 'user', action: 'update', description: 'Modifica utenti' },
      { code: 'user:delete', resource: 'user', action: 'delete', description: 'Eliminazione utenti' },
      { code: 'user:manage', resource: 'user', action: 'manage', description: 'Gestione completa utenti' },

      // Activity permissions
      { code: 'activity:read', resource: 'activity', action: 'read', description: 'Lettura attività' },
      { code: 'activity:create', resource: 'activity', action: 'create', description: 'Creazione attività' },
      { code: 'activity:update', resource: 'activity', action: 'update', description: 'Modifica attività' },
      { code: 'activity:delete', resource: 'activity', action: 'delete', description: 'Eliminazione attività' },
      { code: 'activity:manage', resource: 'activity', action: 'manage', description: 'Gestione completa attività' },

      // Role permissions
      { code: 'role:read', resource: 'role', action: 'read', description: 'Lettura ruoli' },
      { code: 'role:create', resource: 'role', action: 'create', description: 'Creazione ruoli' },
      { code: 'role:update', resource: 'role', action: 'update', description: 'Modifica ruoli' },
      { code: 'role:delete', resource: 'role', action: 'delete', description: 'Eliminazione ruoli' },
      { code: 'role:manage', resource: 'role', action: 'manage', description: 'Gestione completa ruoli' },

      // Permission permissions
      { code: 'permission:read', resource: 'permission', action: 'read', description: 'Lettura permessi' },
      { code: 'permission:create', resource: 'permission', action: 'create', description: 'Creazione permessi' },
      { code: 'permission:update', resource: 'permission', action: 'update', description: 'Modifica permessi' },
      { code: 'permission:delete', resource: 'permission', action: 'delete', description: 'Eliminazione permessi' },
      { code: 'permission:manage', resource: 'permission', action: 'manage', description: 'Gestione completa permessi' },

      // Dashboard permissions
      { code: 'dashboard:read', resource: 'dashboard', action: 'read', description: 'Lettura Dashboard' },
      { code: 'dashboard:manage', resource: 'dashboard', action: 'manage', description: 'Gestione completa Dashboard' },

      // Country permissions
      { code: 'country:read', resource: 'country', action: 'read', description: 'Lettura Stati' },
      { code: 'country:manage', resource: 'country', action: 'manage', description: 'Gestione completa Stati' },

      // Product permissions
      { code: 'product:read', resource: 'product', action: 'read', description: 'Lettura prodotti' },
      { code: 'product:create', resource: 'product', action: 'create', description: 'Creazione prodotti' },
      { code: 'product:update', resource: 'product', action: 'update', description: 'Modifica prodotti' },
      { code: 'product:delete', resource: 'product', action: 'delete', description: 'Eliminazione prodotti' },
      { code: 'product:manage', resource: 'product', action: 'manage', description: 'Gestione completa prodotti' },

      // Document permissions
      { code: 'document:read', resource: 'document', action: 'read', description: 'Lettura documenti' },
      { code: 'document:create', resource: 'document', action: 'create', description: 'Creazione documenti' },
      { code: 'document:update', resource: 'document', action: 'update', description: 'Modifica documenti' },
      { code: 'document:delete', resource: 'document', action: 'delete', description: 'Eliminazione documenti' },
      { code: 'document:manage', resource: 'document', action: 'manage', description: 'Gestione completa documenti' },

      // Company permissions
      { code: 'company:read', resource: 'company', action: 'read', description: 'Lettura aziende' },
      { code: 'company:create', resource: 'company', action: 'create', description: 'Creazione aziende' },
      { code: 'company:update', resource: 'company', action: 'update', description: 'Modifica aziende' },
      { code: 'company:delete', resource: 'company', action: 'delete', description: 'Eliminazione aziende' },
      { code: 'company:manage', resource: 'company', action: 'manage', description: 'Gestione completa aziende' },

      // Customer permissions
      { code: 'customer:read', resource: 'customer', action: 'read', description: 'Lettura Clienti' },
      { code: 'customer:create', resource: 'customer', action: 'create', description: 'Creazione Clienti' },
      { code: 'customer:update', resource: 'customer', action: 'update', description: 'Modifica Clienti' },
      { code: 'customer:delete', resource: 'customer', action: 'delete', description: 'Eliminazione Clienti' },
      { code: 'customer:manage', resource: 'customer', action: 'manage', description: 'Gestione completa Clienti' },

      // Contact permissions
      { code: 'contact:read', resource: 'contact', action: 'read', description: 'Lettura Contatti' },
      { code: 'contact:create', resource: 'contact', action: 'create', description: 'Creazione Contatti' },
      { code: 'contact:update', resource: 'contact', action: 'update', description: 'Modifica Contatti' },
      { code: 'contact:delete', resource: 'contact', action: 'delete', description: 'Eliminazione Contatti' },
      { code: 'contact:manage', resource: 'contact', action: 'manage', description: 'Gestione completa Contatti' },

      // Address permissions
      { code: 'address:read', resource: 'address', action: 'read', description: 'Lettura Indirizzi' },
      { code: 'address:create', resource: 'address', action: 'create', description: 'Creazione Indirizzi' },
      { code: 'address:update', resource: 'address', action: 'update', description: 'Modifica Indirizzi' },
      { code: 'address:delete', resource: 'address', action: 'delete', description: 'Eliminazione Indirizzi' },
      { code: 'address:manage', resource: 'address', action: 'manage', description: 'Gestione completa Indirizzi' },

      // Supplier permissions
      { code: 'supplier:read', resource: 'supplier', action: 'read', description: 'Lettura Fornitori' },
      { code: 'supplier:create', resource: 'supplier', action: 'create', description: 'Creazione Fornitori' },
      { code: 'supplier:update', resource: 'supplier', action: 'update', description: 'Modifica Fornitori' },
      { code: 'supplier:delete', resource: 'supplier', action: 'delete', description: 'Eliminazione Fornitori' },
      { code: 'supplier:manage', resource: 'supplier', action: 'manage', description: 'Gestione completa Fornitori' },

      // Warehouse permissions
      { code: 'warehouse:read', resource: 'warehouse', action: 'read', description: 'Lettura magazzino' },
      { code: 'warehouse:update', resource: 'warehouse', action: 'update', description: 'Modifica magazzino' },
      { code: 'warehouse:manage', resource: 'warehouse', action: 'manage', description: 'Gestione completa magazzino' },

      // Payment permissions
      { code: 'payment:read', resource: 'payment', action: 'read', description: 'Lettura pagamenti' },
      { code: 'payment:create', resource: 'payment', action: 'create', description: 'Creazione pagamenti' },
      { code: 'payment:update', resource: 'payment', action: 'update', description: 'Modifica pagamenti' },
      { code: 'payment:delete', resource: 'payment', action: 'delete', description: 'Elimina pagamenti' },
      { code: 'payment:manage', resource: 'payment', action: 'manage', description: 'Gestione completa pagamenti' },

      // Tax permissions
      { code: 'tax:read', resource: 'tax', action: 'read', description: 'Lettura aliquota tasse' },
      { code: 'tax:create', resource: 'tax', action: 'create', description: 'Creazione aliquota tasse' },
      { code: 'tax:update', resource: 'tax', action: 'update', description: 'Modifica aliquota tasse' },
      { code: 'tax:delete', resource: 'tax', action: 'delete', description: 'Elimina aliquota tasse' },
      { code: 'tax:manage', resource: 'tax', action: 'manage', description: 'Gestione completa aliquota tasse' },

      // pricelist permissions
      { code: 'pricelist:read', resource: 'pricelist', action: 'read', description: 'Lettura Listini' },
      { code: 'pricelist:create', resource: 'pricelist', action: 'create', description: 'Creazione Listini' },
      { code: 'pricelist:update', resource: 'pricelist', action: 'update', description: 'Modifica Listini' },
      { code: 'pricelist:delete', resource: 'pricelist', action: 'delete', description: 'Elimina Listini' },
      { code: 'pricelist:manage', resource: 'pricelist', action: 'manage', description: 'Gestione completa Listini' },

      // Report permissions
      { code: 'report:read', resource: 'report', action: 'read', description: 'Visualizzazione report' },
      { code: 'report:export', resource: 'report', action: 'export', description: 'Esportazione report' },
    ];

    const createdPermissions = await Promise.all(
      permissions.map((permission) =>
        prisma.permission.upsert({
          where: { code: permission.code },
          update: permission,
          create: permission,
        })
      )
    );

    console.log(`✅ Created ${createdPermissions.length} permissions`);

    // Mappa permessi per code
    const permissionMap = Object.fromEntries(
      createdPermissions.map((p) => [p.code, p.id])
    );

    // ========================================================================
    // 2. RUOLI
    // ========================================================================
    console.log('👥 Creating roles...');

    // ADMIN - Tutti i permessi
    const adminRole = await prisma.role.upsert({
      where: { code: 'ADMIN' },
      update: {},
      create: {
        code: 'ADMIN',
        name: 'Administrator',
        description: 'Accesso completo al sistema',
        isDefault: false,
      },
    });

    // Assegna tutti i permessi ad ADMIN
    await prisma.rolePermission.createMany({
      data: createdPermissions.map((p) => ({
        roleId: adminRole.id,
        permissionId: p.id,
      })),
      skipDuplicates: true,
    });

    // MANAGER - Gestione operativa
    const managerRole = await prisma.role.upsert({
      where: { code: 'MANAGER' },
      update: {},
      create: {
        code: 'MANAGER',
        name: 'Manager',
        description: 'Gestione vendite, magazzino e documenti',
        isDefault: false,
      },
    });

    await prisma.rolePermission.createMany({
      data: [
        'product:read',
        'product:create',
        'product:update',
        'product:delete',
        'document:read',
        'document:create',
        'document:update',
        'company:read',
        'company:create',
        'company:update',
        'warehouse:read',
        'warehouse:update',
        'report:read',
      ].map((code) => ({
        roleId: managerRole.id,
        permissionId: permissionMap[code],
      })),
      skipDuplicates: true,
    });

    // SALES - Solo vendite
    const salesRole = await prisma.role.upsert({
      where: { code: 'SALES' },
      update: {},
      create: {
        code: 'SALES',
        name: 'Sales Representative',
        description: 'Gestione vendite e clienti',
        isDefault: false,
      },
    });

    await prisma.rolePermission.createMany({
      data: [
        'product:read',
        'document:read',
        'document:create',
        'document:update',
        'company:read',
        'company:create',
        'company:update',
        'report:read',
      ].map((code) => ({
        roleId: salesRole.id,
        permissionId: permissionMap[code],
      })),
      skipDuplicates: true,
    });

    // WAREHOUSE - Solo magazzino
    const warehouseRole = await prisma.role.upsert({
      where: { code: 'WAREHOUSE' },
      update: {},
      create: {
        code: 'WAREHOUSE',
        name: 'Warehouse Operator',
        description: 'Gestione magazzino e stock',
        isDefault: false,
      },
    });

    await prisma.rolePermission.createMany({
      data: ['product:read', 'warehouse:read', 'warehouse:update'].map((code) => ({
        roleId: warehouseRole.id,
        permissionId: permissionMap[code],
      })),
      skipDuplicates: true,
    });

    // USER - Ruolo base (default)
    const userRole = await prisma.role.upsert({
      where: { code: 'USER' },
      update: {},
      create: {
        code: 'USER',
        name: 'User',
        description: 'Utente base con permessi limitati',
        isDefault: true, // Assegnato automaticamente
      },
    });

    await prisma.rolePermission.createMany({
      data: ['product:read', 'document:read', 'company:read', 'report:read'].map((code) => ({
        roleId: userRole.id,
        permissionId: permissionMap[code],
      })),
      skipDuplicates: true,
    });

    console.log('✅ Created 5 roles: ADMIN, MANAGER, SALES, WAREHOUSE, USER');

    // ========================================================================
    // 3. UTENTI DI TEST (Opzionale)
    // ========================================================================
    console.log('👤 Creating test users...');

    const hashedPassword = await bcrypt.hash('Password123!', 12);

    // Admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        active: true,
        roles: {
          connect: { id: adminRole.id },
        },
        details: {
          create: {
            firstName: 'Admin',
            lastName: 'User',
          },
        },
      },
    });

    // Manager user
    const managerUser = await prisma.user.upsert({
      where: { email: 'manager@example.com' },
      update: {},
      create: {
        username: 'manager',
        email: 'manager@example.com',
        password: hashedPassword,
        active: true,
        roles: {
          connect: { id: managerRole.id },
        },
        details: {
          create: {
            firstName: 'Manager',
            lastName: 'User',
          },
        },
      },
    });

    // Sales user
    const salesUser = await prisma.user.upsert({
      where: { email: 'sales@example.com' },
      update: {},
      create: {
        username: 'sales',
        email: 'sales@example.com',
        password: hashedPassword,
        active: true,
        roles: {
          connect: { id: salesRole.id },
        },
        details: {
          create: {
            firstName: 'Sales',
            lastName: 'User',
          },
        },
      },
    });

    console.log('✅ Created 3 test users');
    console.log('\n📋 Test Credentials:');
    console.log('-----------------------------------');
    console.log('Admin:   admin@example.com / Password123!');
    console.log('Manager: manager@example.com / Password123!');
    console.log('Sales:   sales@example.com / Password123!');
    console.log('-----------------------------------\n');

    // ========================================================================
    // 4. RIEPILOGO
    // ========================================================================
    console.log('📊 Seed Summary:');
    console.log(`  - ${createdPermissions.length} permissions created`);
    console.log(`  - 5 roles created (ADMIN, MANAGER, SALES, WAREHOUSE, USER)`);
    console.log(`  - 3 test users created`);
    console.log('\n✅ RBAC seed completed successfully!\n');
  } catch (error) {
    console.error('❌ Error seeding RBAC:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Esegui seed
seedRBAC()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

// ============================================================================
// EXPORT per uso come modulo
// ============================================================================
export default seedRBAC;