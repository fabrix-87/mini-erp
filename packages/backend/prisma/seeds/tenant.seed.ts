// prisma/seeds/tenant.seed.ts
import { prisma } from "@/config/prisma-config";

async function seedTenants() {
  console.log("🏢 Seeding tenants...");

  const tenantsData = [
    {
      // ── Tenant 1 ─────────────────────────────────────────────────────────
      tenant: {
        code: "acme-srl",
        status: "ACTIVE" as const,
        plan: "PROFESSIONAL" as const,
        taxRegime: "RF01" as const,
        defaultCurrencyCode: "EUR",
      },
      company: {
        code: "ACME-001",
        companyName: "Acme S.r.l.",
        tradeName: "Acme",
        legalForm: "S.r.l.",
        entityType: "JURIDICAL" as const,
        status: "ACTIVE" as const,
        vatNumber: "IT12345678901",
        taxCode: "12345678901",
        sdiCode: "ABCDE12",
        countryCode: "IT",
        mainEmail: "info@acme.it",
        mainPhone: "+39 02 1234567",
      },
      address: {
        addressType: "LEGAL" as const,
        isPrimary: true,
        address: "Via Roma 1",
        city: "Milano",
        provinceCode: "MI",
        zipCode: "20121",
        countryCode: "IT",
      },
      bankAccount: {
        name: "Conto principale EUR",
        bankName: "Banca Acme",
        iban: "IT60X0542811101000000123456",
        bic: "BPMOIT22XXX",
        currencyCode: "EUR",
        isDefault: true,
      },
    },
    {
      // ── Tenant 2 ─────────────────────────────────────────────────────────
      tenant: {
        code: "beta-spa",
        status: "TRIAL" as const,
        plan: "STARTER" as const,
        taxRegime: "RF19" as const,
        defaultCurrencyCode: "EUR",
      },
      company: {
        code: "BETA-001",
        companyName: "Beta S.p.A.",
        tradeName: "Beta",
        legalForm: "S.p.A.",
        entityType: "JURIDICAL" as const,
        status: "ACTIVE" as const,
        vatNumber: "IT98765432109",
        taxCode: "98765432109",
        sdiCode: "XYZ9876",
        countryCode: "IT",
        mainEmail: "info@beta.it",
        mainPhone: "+39 06 9876543",
      },
      address: {
        addressType: "LEGAL" as const,
        isPrimary: true,
        address: "Via Veneto 42",
        city: "Roma",
        provinceCode: "RM",
        zipCode: "00187",
        countryCode: "IT",
      },
      bankAccount: {
        name: "Conto principale EUR",
        bankName: "Banca Beta",
        iban: "IT40S0503403211000000029123",
        bic: "BAPPIT21XXX",
        currencyCode: "EUR",
        isDefault: true,
      },
    },
  ];

  for (const data of tenantsData) {
    // Controlla se esiste già
    const existing = await prisma.tenant.findUnique({
      where: { code: data.tenant.code },
    });
    if (existing) {
      console.log(`  ⏭️  Tenant "${data.tenant.code}" già presente, skip.`);
      continue;
    }

    // ── Step 1: crea un Tenant placeholder senza companyId
    //    Usiamo una transaction per garantire atomicità.
    //    Il ciclo Tenant ↔ Company si spezza creando prima la Company
    //    con un tenantId "provvisorio" ottenuto dal Tenant placeholder,
    //    poi aggiornando Tenant.companyId.
    const result = await prisma.$transaction(async (tx) => {
      // 1. Crea Company senza tenantId (ora nullable)
      const company = await tx.company.create({
        data: {
          ...data.company,
          // tenantId: omesso — nullable
          addresses: { create: data.address },
        },
      });

      // 2. Crea Tenant con companyId reale
      const tenant = await tx.tenant.create({
        data: {
          ...data.tenant,
          companyId: company.id,
        },
      });

      // 3. Collega Company → Tenant
      await tx.company.update({
        where: { id: company.id },
        data: { tenantId: tenant.id },
      });

      // 4. BankAccount
      await tx.tenantBankAccount.create({
        data: { tenantId: tenant.id, ...data.bankAccount },
      });

      return { tenant, company };
    });
  }
}

seedTenants()
  .catch((e) => {
    console.error("❌ Errore durante il seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

