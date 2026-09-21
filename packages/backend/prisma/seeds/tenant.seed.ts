// prisma/seeds/tenant.seed.ts
import { prisma } from "@/config/prisma-config";

async function seedTenants() {
  console.log("🏢 Seeding tenants...");

  const tenantsData = [
    // ── Tenant 1 ─────────────────────────────────────────────────────────
    {
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

    // ── Tenant 2 ─────────────────────────────────────────────────────────
    {
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

  // Fail fast: FK prerequisites for Company.countryCode / Tenant.defaultCurrencyCode /
  // BankAccount.currencyCode. Run country.seed.ts and currrencies.seed.ts first.
  const requiredCountryCodes = [...new Set(tenantsData.map((d) => d.company.countryCode))];
  const requiredCurrencyCodes = [
    ...new Set([
      ...tenantsData.map((d) => d.tenant.defaultCurrencyCode),
      ...tenantsData.map((d) => d.bankAccount.currencyCode),
    ]),
  ];

  const [foundCountries, foundCurrencies] = await Promise.all([
    prisma.country.findMany({
      where: { code: { in: requiredCountryCodes } },
      select: { code: true },
    }),
    prisma.currency.findMany({
      where: { code: { in: requiredCurrencyCodes } },
      select: { code: true },
    }),
  ]);

  const missingCountries = requiredCountryCodes.filter(
    (c) => !foundCountries.some((f) => f.code === c),
  );
  const missingCurrencies = requiredCurrencyCodes.filter(
    (c) => !foundCurrencies.some((f) => f.code === c),
  );

  if (missingCountries.length > 0 || missingCurrencies.length > 0) {
    throw new Error(
      `Prerequisiti mancanti — eseguire prima i seed di riferimento. ` +
        `Country mancanti: [${missingCountries.join(", ") || "-"}], ` +
        `Currency mancanti: [${missingCurrencies.join(", ") || "-"}].`,
    );
  }

  let createdCount = 0;
  let skippedCount = 0;

  for (const data of tenantsData) {
    // Skip if already seeded (idempotent re-run).
    const existing = await prisma.tenant.findUnique({
      where: { code: data.tenant.code },
    });
    if (existing) {
      console.log(`   ⏭️  Tenant "${data.tenant.code}" già presente, skip.`);
      skippedCount++;
      continue;
    }

    // Step 1-3 break the Tenant ↔ Company circular FK:
    // Tenant.companyId is mandatory, but Company.tenantId is back-filled only
    // after the Tenant row exists (documented bootstrap window in company.prisma).
    const { tenant, company } = await prisma.$transaction(async (tx) => {
      // 1. Create Company without tenantId (nullable during bootstrap).
      const company = await tx.company.create({
        data: {
          ...data.company,
          addresses: { create: data.address },
        },
      });

      // 2. Create Tenant pointing to the just-created Company.
      const tenant = await tx.tenant.create({
        data: {
          ...data.tenant,
          companyId: company.id,
        },
      });

      // 3. Back-fill Company.tenantId now that the Tenant exists.
      await tx.company.update({
        where: { id: company.id },
        data: { tenantId: tenant.id },
      });

      // 4. Tenant's own default bank account.
      // NOTE: the model is `BankAccount` (relation name "TenantBankAccounts" on Tenant),
      // NOT `TenantBankAccount` — that Prisma Client property does not exist.
      await tx.bankAccount.create({
        data: { tenantId: tenant.id, ...data.bankAccount },
      });

      return { tenant, company };
    });

    console.log(
      `   ✅ Tenant "${tenant.code}" creato (company: ${company.companyName}, id: ${tenant.id})`,
    );
    createdCount++;
  }

  console.log("\n📊 Seed Summary:");
  console.log(`   - ${createdCount} tenant creati`);
  console.log(`   - ${skippedCount} tenant già presenti (skip)`);
  console.log("\n✅ Tenant seed completed successfully!\n");
}

seedTenants()
  .catch((e) => {
    console.error("❌ Errore durante il seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export default seedTenants;
