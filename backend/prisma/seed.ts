// seed.ts
import { prisma } from '../config/prisma-client'
import bcrypt from 'bcryptjs';

// Assunzione: L'ID per le lingue è sequenziale e parte da 1.
// Questo è fondamentale per il corretto collegamento con TaxRuleTranslation.
const LANGUAGE_DATA = [
  { id: 1, iso_code: 'it', name: 'Italiano', language_code: 'it_IT' },
  { id: 2, iso_code: 'en', name: 'English', language_code: 'en_US' },
  { id: 3, iso_code: 'fr', name: 'Français', language_code: 'fr_FR' },
  { id: 4, iso_code: 'de', name: 'Deutsch', language_code: 'de_DE' },
  { id: 5, iso_code: 'es', name: 'Español', language_code: 'es_ES' },
];

const TAX_RATE_DATA = [
  { id: 1, rate: 22.00, name: 'IVA Ordinaria 22%', active: true },
  { id: 2, rate: 10.00, name: 'IVA Ridotta 10%', active: true },
  { id: 3, rate: 4.00, name: 'IVA Minima 4%', active: true },
  { id: 4, rate: 0.00, name: 'Aliquota Zero', active: true },
];

const TAX_RULE_DATA = [
  { id: 100, code: 'I22', taxRateId: 1, operationType: 'Imponibile', name: 'Cessioni interne IVA 22%' },
  { id: 101, code: 'I10', taxRateId: 2, operationType: 'Imponibile', name: 'Cessioni interne IVA 10%' },
  { id: 200, code: 'N2', taxRateId: 4, operationType: 'Esente', name: 'Operazioni Esenti Art. 10 (Servizi medici, ecc.)' },
  { id: 201, code: 'N3.2', taxRateId: 4, operationType: 'NonImponibile', name: 'Cessione Intracomunitaria Art. 41' },
  { id: 202, code: 'N7', taxRateId: 4, operationType: 'NonImponibile', name: 'IVA non soggetta (Esportazioni Extra UE, Art. 8/2)' },
];

const TAX_RULE_TRANSLATION_DATA = [
  // --- Regola 100: I22 (IT, EN, FR, DE, ES) ---
  { taxRuleId: 100, languageId: 1, name: "Cessioni interne IVA 22%" },
  { taxRuleId: 100, languageId: 2, name: "Domestic Supplies VAT 22%" },
  { taxRuleId: 100, languageId: 3, name: "Livraisons nationales TVA 22%" },
  { taxRuleId: 100, languageId: 4, name: "Inlandsleistungen MwSt 22%" },
  { taxRuleId: 100, languageId: 5, name: "Suministros nacionales IVA 22%" },

  // --- Regola 201: N3.2 (Intra-UE) ---
  { "taxRuleId": 201, "languageId": 1, "name": "Cessione Intracomunitaria Art. 41" },
  { "taxRuleId": 201, "languageId": 2, "name": "Intra-Community Supply Art. 41" },
  { "taxRuleId": 201, "languageId": 3, "name": "Livraison intracommunautaire Art. 41" },
  { "taxRuleId": 201, "languageId": 4, "name": "Innergemeinschaftliche Lieferung Art. 41" },
  { "taxRuleId": 201, "languageId": 5, "name": "Entrega intracomunitaria Art. 41" },

  // --- Regola 202: N7 (Extra-UE) ---
  { "taxRuleId": 202, "languageId": 1, "name": "IVA non soggetta (Esportazioni Extra UE, Art. 8/2)" },
  { "taxRuleId": 202, "languageId": 2, "name": "VAT not subject (Non-EU Exports, Art. 8/2)" },
  { "taxRuleId": 202, "languageId": 3, "name": "TVA non soumise (Exportations Hors UE, Art. 8/2)" },
  { "taxRuleId": 202, "languageId": 4, "name": "Nicht der MwSt unterliegend (Export Nicht-EU, Art. 8/2)" },
  { "taxRuleId": 202, "languageId": 5, "name": "IVA no sujeta (Exportaciones Extra UE, Art. 8/2)" }
];

const ADMIN_EMAIL = 'f.menza@gmail.com';
const ADMIN_USERNAME = 'fmenza'; // Nuovo campo richiesto dal modello User
const ADMIN_PASSWORD_CLEAR = 'Admin123.';
const ADMIN_ROLE_CODE = 'ADMIN';

// Definisce l'elenco completo dei permessi necessari per i documenti
const documentPermissions = [
  // Documenti di Vendita (Quote, Order, Invoice, CreditNote)
  'document:read', 'document:create', 'document:update', 'document:delete',
  'document:approve', 'document:export',
  
  // Specifici per la fatturazione
  'invoice:read', 'invoice:create', 'invoice:update', 'invoice:send_sdi',
  
  // Specifici per la logistica
  'delivery_note:read', 'delivery_note:create', 'delivery_note:update',
  
  // Specifici per i preventivi
  'quote:read', 'quote:create', 'quote:update',
  
  // Prodotti e Magazzino
  'product:read', 'product:create', 'product:update', 'warehouse:manage_stock',

  // Anagrafica e ACL
  'company:read', 'company:create', 'company:update',
  'user:manage', 'role:manage', 'permission:manage',
];

async function main() {
  console.log('Inizio del seeding...');

  // 1. LANGUAGE
  console.log('Seeding Language...');
  for (const lang of LANGUAGE_DATA) {
    await prisma.language.upsert({
      where: { iso_code: lang.iso_code },
      update: {},
      create: lang,
    });
  }
  
  // 2. TAX RATE
  console.log('Seeding TaxRate...');
  for (const rate of TAX_RATE_DATA) {
    await prisma.taxRate.upsert({
      where: { rate: rate.rate }, // Usa 'rate' come chiave univoca
      update: {},
      create: rate
    });
  }

  // 3. TAX RULE
  console.log('Seeding TaxRule...');
  for (const rule of TAX_RULE_DATA) {
    await prisma.taxRule.upsert({
      where: { code: rule.code },
      update: {},
      create: rule,
    });
  }

  // 4. TAX RULE TRANSLATION
  console.log('Seeding TaxRuleTranslation...');
  for (const translation of TAX_RULE_TRANSLATION_DATA) {
    await prisma.taxRuleTranslation.create({
      data: translation,
    });
  }

  console.log('Inizio del seeding per l\'utente amministratore...');

  // --- A. Creazione/Recupero dei Permessi ---
  const allPermissions = await Promise.all(
    documentPermissions.map(code => {
      const [resource, action] = code.split(':');
      return prisma.permission.upsert({
        where: { code: code },
        update: {},
        create: { code, resource, action, description: `Permesso di ${action} sulla risorsa ${resource}` },
      });
    })
  );
  console.log(`Creati o aggiornati ${allPermissions.length} permessi.`);

  // --- B. Creazione del Ruolo Amministratore ---
  const adminRole = await prisma.role.upsert({
    where: { code: ADMIN_ROLE_CODE },
    update: { name: 'Amministratore di Sistema' },
    create: {
      code: ADMIN_ROLE_CODE,
      name: 'Amministratore di Sistema',
      description: 'Accesso completo e illimitato al sistema ERP.',
      isDefault: false,
    },
  });
  console.log(`Ruolo ADMIN creato/aggiornato (ID: ${adminRole.id}).`);

  // --- C. Assegnazione di TUTTI i permessi al Ruolo Amministratore ---
  // Elimina i vecchi permessi del ruolo prima di crearne di nuovi
  await prisma.rolePermission.deleteMany({
    where: { roleId: adminRole.id }
  });

  const rolePermissionsData = allPermissions.map(perm => ({
    roleId: adminRole.id,
    permissionId: perm.id,
  }));

  await prisma.rolePermission.createMany({
    data: rolePermissionsData,
    skipDuplicates: true,
  });
  console.log(`Assegnati ${rolePermissionsData.length} permessi al ruolo ADMIN.`);

  // --- D. Creazione dell'Utente Amministratore ---
  const HASHED_PASSWORD = await bcrypt.hash(ADMIN_PASSWORD_CLEAR, 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { 
      password: HASHED_PASSWORD,
      active: true,
      username: ADMIN_USERNAME, 
      // Aggiornamento nidificato dei dettagli
      details: {
          update: {
              firstName: 'Fabrizio',
              lastName: 'Menza',
          }
      }
    },
    create: {
      email: ADMIN_EMAIL,
      username: ADMIN_USERNAME, // Campo obbligatorio
      password: HASHED_PASSWORD,
      active: true,
      
      // CREAZIONE NIDIFICATA DEL MODELLO UserDetails
      details: {
          create: {
              firstName: 'Fabrizio',
              lastName: 'Menza',
              // Gli altri campi opzionali (phone, address, etc.) 
              // vengono lasciati con i loro valori di default o null.
          }
      },
      
      // Collegamento al Ruolo
      roles: {
        connect: { id: adminRole.id }
      }
    },
  });

  console.log(`Utente ADMIN creato/aggiornato (ID: ${adminUser.id}, Email: ${adminUser.email}).`);

  console.log('Seeding completato.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });