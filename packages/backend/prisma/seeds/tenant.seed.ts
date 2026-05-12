import { prisma } from "@/config/prisma-config";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Seeds the default tenant with its associated company (legal entity).
 * This represents the business that owns and operates the ERP system.
 * Must run AFTER: language.seed, vatNatures.seed (TaxRule IDs must exist).
 */
export async function seedTenant(prisma: PrismaClient): Promise<void> {
  console.log("  → Seeding Tenant...");

  // -------------------------------------------------------------------------
  // 1. Company — anagrafica fiscale dell'azienda emittente
  //    Usata come snapshot nei documenti (nome, P.IVA, SDI, ecc.)
  // -------------------------------------------------------------------------
  const tenantCompany = await prisma.company.upsert({
    where: { code: "MY-COMPANY" },
    update: {
      companyName: "Acme S.r.l.",
      vatNumber: "12345678901",
      taxCode: "12345678901",
      sdiCode: "0000000",
      pec: "acme@pec.it",
      mainEmail: "info@acme.it",
      mainPhone: "+39 02 12345678",
      countryCode: "IT",
      entityType: "JURIDICAL",
      status: "ACTIVE",
    },
    create: {
      code: "MY-COMPANY",
      companyName: "Acme S.r.l.",
      tradeName: "Acme",
      legalForm: "S.r.l.",
      entityType: "JURIDICAL",
      status: "ACTIVE",
      vatNumber: "12345678901",
      taxCode: "12345678901",
      sdiCode: "0000000", // '0000000' = nessun codice SDI, usare PEC
      pec: "acme@pec.it",
      mainEmail: "info@acme.it",
      mainPhone: "+39 02 12345678",
      countryCode: "IT",
    },
  });

  console.log(`     Company: ${tenantCompany.companyName} (ID: ${tenantCompany.id})`);

  // -------------------------------------------------------------------------
  // 2. Indirizzo legale della company
  // -------------------------------------------------------------------------
  const existingLegalAddress = await prisma.companyAddress.findFirst({
    where: {
      companyId: tenantCompany.id,
      addressType: "LEGAL",
    },
    select: { id: true },
  });

  if (existingLegalAddress) {
    await prisma.companyAddress.update({
      where: { id: existingLegalAddress.id },
      data: {
        address: "Via Roma 1",
        city: "Milano",
        provinceCode: "MI",
        zipCode: "20121",
        countryCode: "IT",
        isPrimary: true,
      },
    });
  } else {
    await prisma.companyAddress.create({
      data: {
        companyId: tenantCompany.id,
        addressType: "LEGAL",
        isPrimary: true,
        address: "Via Roma 1",
        city: "Milano",
        provinceCode: "MI",
        zipCode: "20121",
        countryCode: "IT",
      },
    });
  }

  console.log(`     Indirizzo legale creato/aggiornato`);

  // -------------------------------------------------------------------------
  // 3. TaxRule di default — IVA ordinaria 22% per vendite e acquisti
  //    ID 100 = I22 (vendite), ID 101 = I10 (acquisti) dal seed principale
  //    Adjust these IDs based on your actual TaxRule seed data
  // -------------------------------------------------------------------------
  const defaultSalesTaxRule = await prisma.taxRule.findFirst({
    where: { code: "I22", active: true },
    select: { id: true },
  });

  const defaultPurchasesTaxRule = await prisma.taxRule.findFirst({
    where: { code: "I22", active: true, applicableFor: { in: ["purchases", "both"] } },
    select: { id: true },
  });

  // -------------------------------------------------------------------------
  // 4. Tenant — entità operativa SaaS
  // -------------------------------------------------------------------------
  const tenant = await prisma.tenant.upsert({
    where: { code: "acme-srl" },
    update: {
      status: "ACTIVE",
      plan: "PROFESSIONAL",
      companyId: tenantCompany.id,
      taxRegime: "RF01",
      defaultCurrency: "EUR",
      defaultLanguageId: 1, // Italiano (ID 1 dal language seed)
      sdiTransmissionFormat: "FPR12", // Privati/Aziende (non PA)
      ...(defaultSalesTaxRule && {
        defaultSalesTaxRuleId: defaultSalesTaxRule.id,
      }),
      ...(defaultPurchasesTaxRule && {
        defaultPurchasesTaxRuleId: defaultPurchasesTaxRule.id,
      }),
    },
    create: {
      code: "acme-srl",
      status: "ACTIVE",
      plan: "PROFESSIONAL",
      companyId: tenantCompany.id,
      taxRegime: "RF01",
      defaultCurrency: "EUR",
      defaultLanguageId: 1,
      sdiTransmissionFormat: "FPR12",
      sdiCertificatePath: null, // Da configurare in produzione
      ...(defaultSalesTaxRule && {
        defaultSalesTaxRuleId: defaultSalesTaxRule.id,
      }),
      ...(defaultPurchasesTaxRule && {
        defaultPurchasesTaxRuleId: defaultPurchasesTaxRule.id,
      }),
    },
  });

  console.log(`     Tenant: ${tenant.code} (ID: ${tenant.id})`);
  console.log(`     Regime fiscale: ${tenant.taxRegime}`);
  console.log(`     TaxRule vendite ID: ${tenant.defaultSalesTaxRuleId ?? "non trovata"}`);
  console.log(`     TaxRule acquisti ID: ${tenant.defaultPurchasesTaxRuleId ?? "non trovata"}`);
  console.log("  ✓ Tenant seeding completato");
}

seedTenant(prisma)
  .catch((error) => {
    console.error("❌ Error seeding tenant data:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
