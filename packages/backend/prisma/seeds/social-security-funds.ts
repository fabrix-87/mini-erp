// seed/social-security-funds.ts

import { prisma } from "@/config/prisma-config";
import { Prisma } from "@/generated/prisma/client";

// Array corretto secondo l'Allegato A delle Specifiche Tecniche dell'Agenzia delle Entrate
const funds = [
  { code: "TC01", description: "Cassa Nazionale Previdenza e Assistenza Avvocati e Procuratori Legali", defaultRate: null, addsTaxableBase: false },
  { code: "TC02", description: "Cassa Previdenza Dottori Commercialisti", defaultRate: null, addsTaxableBase: false },
  { code: "TC03", description: "Cassa Previdenza e Assistenza Geometri", defaultRate: null, addsTaxableBase: false },
  { code: "TC04", description: "Cassa Nazionale Previdenza e Assistenza Ingegneri e Architetti Liberi Professionisti", defaultRate: null, addsTaxableBase: false },
  { code: "TC05", description: "Cassa Nazionale del Notariato", defaultRate: null, addsTaxableBase: false },
  { code: "TC06", description: "Cassa Nazionale Previdenza e Assistenza Ragionieri e Periti Commerciali", defaultRate: null, addsTaxableBase: false },
  { code: "TC07", description: "Ente Nazionale Assistenza Agenti e Rappresentanti di Commercio (ENASARCO)", defaultRate: 4.00, addsTaxableBase: true },
  { code: "TC08", description: "Ente Nazionale Previdenza e Assistenza Consulenti del Lavoro (ENPACL)", defaultRate: null, addsTaxableBase: false },
  { code: "TC09", description: "Ente Nazionale Previdenza e Assistenza Medici (ENPAM)", defaultRate: null, addsTaxableBase: false },
  { code: "TC10", description: "Ente Nazionale Previdenza e Assistenza Farmacisti (ENPAF)", defaultRate: null, addsTaxableBase: false },
  { code: "TC11", description: "Ente Nazionale Previdenza e Assistenza Veterinari (ENPAV)", defaultRate: null, addsTaxableBase: false },
  { code: "TC12", description: "Ente Nazionale Previdenza e Assistenza Impiegati dell'Agricoltura (ENPAIA)", defaultRate: null, addsTaxableBase: false },
  { code: "TC13", description: "Fondo Previdenza Impiegati Imprese di Spedizione e Agenzie Marittime", defaultRate: null, addsTaxableBase: false },
  { code: "TC14", description: "Istituto Nazionale Previdenza Giornalisti Italiani (INPGI)", defaultRate: null, addsTaxableBase: false },
  { code: "TC15", description: "Opera Nazionale Assistenza Orfani Sanitari Italiani (ONAOSI)", defaultRate: null, addsTaxableBase: false },
  { code: "TC16", description: "Cassa Autonoma Assistenza Integrativa Giornalisti Italiani (CASAGIT)", defaultRate: null, addsTaxableBase: false },
  { code: "TC17", description: "Ente Previdenza Periti Industriali e Periti Industriali Laureati (EPPI)", defaultRate: null, addsTaxableBase: false },
  { code: "TC18", description: "Ente Previdenza e Assistenza Pluricategoriale (EPAP)", defaultRate: null, addsTaxableBase: false },
  { code: "TC19", description: "Ente Nazionale Previdenza e Assistenza Biologi (ENPAB)", defaultRate: null, addsTaxableBase: false },
  { code: "TC20", description: "Ente Nazionale Previdenza e Assistenza Professione Infermieristica (ENPAPI)", defaultRate: null, addsTaxableBase: false },
  { code: "TC21", description: "Ente Nazionale Previdenza e Assistenza Psicologi (ENPAP)", defaultRate: null, addsTaxableBase: false },
  { code: "TC22", description: "INPS", defaultRate: null, addsTaxableBase: false }
];

async function main() {
  console.log('🌱 Start seeding Social Security Funds (TC01-TC22)...');

  for (const fund of funds) {
    // Gestione corretta del tipo Decimal per Prisma
    const defaultRateDecimal = fund.defaultRate !== null 
      ? new Prisma.Decimal(fund.defaultRate) 
      : null;

    await prisma.socialSecurityFund.upsert({
      where: { code: fund.code },
      update: {
        description: fund.description,
        defaultRate: defaultRateDecimal,
        addsTaxableBase: fund.addsTaxableBase,
      },
      create: {
        code: fund.code,
        description: fund.description,
        defaultRate: defaultRateDecimal,
        addsTaxableBase: fund.addsTaxableBase,
        active: true, // Di default attivo
      },
    });
  }

  console.log('✅ Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });