import { prisma } from "@/config/prisma-config";
import { ProductType } from "@/generated/prisma/enums";
import bcrypt from "bcryptjs";
import { create } from "node:domain";

async function seedDemoData() {
  console.log("🌱 Seeding demo data...");

  // ============================================================================
  // 1. COUNTRIES (prerequisito)
  // ============================================================================
  console.log("📍 Creating countries...");

  const countries = await Promise.all([
    prisma.country.upsert({
      where: { code: "IT" },
      update: {},
      create: {
        code: "IT",
        name: "Italia",
        iso3: "ITA",
        numericCode: "380",
        phoneCode: "+39",
        currencyCode: "EUR",
        continent: "Europe",
        active: true,
      },
    }),
    prisma.country.upsert({
      where: { code: "DE" },
      update: {},
      create: {
        code: "DE",
        name: "Germania",
        iso3: "DEU",
        numericCode: "276",
        phoneCode: "+49",
        currencyCode: "EUR",
        continent: "Europe",
        active: true,
      },
    }),
    prisma.country.upsert({
      where: { code: "FR" },
      update: {},
      create: {
        code: "FR",
        name: "Francia",
        iso3: "FRA",
        numericCode: "250",
        phoneCode: "+33",
        currencyCode: "EUR",
        continent: "Europe",
        active: true,
      },
    }),
    prisma.country.upsert({
      where: { code: "CH" },
      update: {},
      create: {
        code: "CH",
        name: "Svizzera",
        iso3: "CHE",
        numericCode: "756",
        phoneCode: "+41",
        currencyCode: "CHF",
        continent: "Europe",
        active: true,
      },
    }),
  ]);

  // ============================================================================
  // 2. TAX RULES (prerequisito per Product)
  // ============================================================================
  console.log("💰 Creating tax rules...");

  const taxRuleIVA22 = await prisma.taxRule.upsert({
    where: { code: "IT-IVA22" },
    update: {},
    create: {
      code: "IT-IVA22",
      name: "IVA ordinaria 22%",
      description: "Aliquota IVA standard italiana",
      rate: 22.0,
      vatNatureId: null,
      countryCode: "IT",
      applicableFor: "both",
      active: true,
      isDefault: true,
      displayOrder: 1,
    },
  });

  const taxRuleIVA10 = await prisma.taxRule.upsert({
    where: { code: "IT-IVA10" },
    update: {},
    create: {
      code: "IT-IVA10",
      name: "IVA ridotta 10%",
      description: "Aliquota IVA ridotta per alimentari e servizi",
      rate: 10.0,
      vatNatureId: null,
      countryCode: "IT",
      applicableFor: "both",
      active: true,
      displayOrder: 2,
    },
  });

  const taxRuleIVA4 = await prisma.taxRule.upsert({
    where: { code: "IT-IVA4" },
    update: {},
    create: {
      code: "IT-IVA4",
      name: "IVA super-ridotta 4%",
      description: "Aliquota IVA super-ridotta per beni di prima necessità",
      rate: 4.0,
      vatNatureId: null,
      countryCode: "IT",
      applicableFor: "both",
      active: true,
      displayOrder: 3,
    },
  });

  // ============================================================================
  // 3. USERS (prerequisito per Company.assignedUser)
  // ============================================================================
  console.log("👤 Creating users...");

  const adminRole = await prisma.role.findFirst({
    where: { code: "ADMIN" },
  });

  if (!adminRole) return;

  const hashedPassword = await bcrypt.hash("Password123!", 12);

  const user = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      username: "admin",
      email: "admin@example.com",
      password: hashedPassword,
      active: true,
      roles: {
        connect: { id: adminRole.id },
      },
      details: {
        create: {
          firstName: "Admin",
          lastName: "User",
        },
      },
    },
  });

  // ============================================================================
  // 4. COMPANIES + SUPPLIERS
  // ============================================================================
  console.log("🏢 Creating companies and suppliers...");

  // Supplier 1: Fornitore italiano materiale elettrico
  const companyElettroItalia = await prisma.company.upsert({
    where: { code: "SUPP-001" },
    update: {},
    create: {
      code: "SUPP-001",
      companyName: "Elettro Italia S.r.l.",
      tradeName: "Elettro Italia",
      legalForm: "S.r.l.",
      status: "ACTIVE",
      entityType: "JURIDICAL",
      vatNumber: "12345678901",
      taxCode: "12345678901",
      sdiCode: "ABCDEFG",
      pec: "elettroitalia@pec.it",
      countryCode: "IT",
      mainEmail: "info@elettroitalia.it",
      mainPhone: "+39 02 1234567",
      assignedUserId: user.id,
      addresses: {
        create: [
          {
            addressType: "LEGAL",
            address: "Via Giuseppe Verdi, 15",
            city: "Milano",
            provinceCode: "MI",
            zipCode: "20121",
            countryCode: "IT",
            isPrimary: true,
          },
        ],
      },
      suppliers: {
        create: {
          paymentTerms: "60 giorni data fattura fine mese",
          creditLimit: 50000.0,
          bankAccount: "IT60X0542811101000000123456",
          leadTimeDays: 7,
          transportCost: 15.0,
          rating: 5,
        },
      },
    },
    include: {
      suppliers: true,
    },
  });

  // Supplier 2: Fornitore tedesco componenti elettronici
  const companyTechnoGmbH = await prisma.company.upsert({
    where: { code: "SUPP-002" },
    update: {},
    create: {
      code: "SUPP-002",
      companyName: "TechnoComponents GmbH",
      tradeName: "TechnoComponents",
      legalForm: "GmbH",
      status: "ACTIVE",
      entityType: "FOREIGN",
      vatNumber: "DE123456789",
      vatId: "DE123456789",
      eoriNumber: "DE123456789000",
      countryCode: "DE",
      mainEmail: "info@technocomp.de",
      mainPhone: "+49 30 12345678",
      assignedUserId: user.id,
      addresses: {
        create: [
          {
            addressType: "LEGAL",
            address: "Hauptstraße 42",
            city: "Berlin",
            zipCode: "10115",
            countryCode: "DE",
            isPrimary: true,
          },
        ],
      },
      suppliers: {
        create: {
          paymentTerms: "30 giorni data fattura",
          creditLimit: 100000.0,
          bankAccount: "DE89370400440532013000",
          leadTimeDays: 14,
          transportCost: 50.0,
          rating: 4,
        },
      },
    },
    include: {
      suppliers: true,
    },
  });

  // Supplier 3: Fornitore francese materiale idraulico
  const companyPlomberieFR = await prisma.company.upsert({
    where: { code: "SUPP-003" },
    update: {},
    create: {
      code: "SUPP-003",
      companyName: "Plomberie Dupont S.A.S.",
      tradeName: "Dupont Plomberie",
      legalForm: "S.A.S.",
      status: "ACTIVE",
      entityType: "FOREIGN",
      vatNumber: "FR12345678901",
      vatId: "FR12345678901",
      eoriNumber: "FR12345678901000",
      countryCode: "FR",
      mainEmail: "contact@dupontplomberie.fr",
      mainPhone: "+33 1 42 12 34 56",
      assignedUserId: user.id,
      addresses: {
        create: [
          {
            addressType: "LEGAL",
            address: "25 Avenue des Champs-Élysées",
            city: "Paris",
            zipCode: "75008",
            countryCode: "FR",
            isPrimary: true,
          },
        ],
      },
      suppliers: {
        create: {
          paymentTerms: "45 giorni data fattura",
          creditLimit: 30000.0,
          bankAccount: "FR1420041010050500013M02606",
          leadTimeDays: 10,
          transportCost: 35.0,
          rating: 4,
        },
      },
    },
    include: {
      suppliers: true,
    },
  });

  // Supplier 4: Fornitore svizzero utensili professionali
  const companySwissTools = await prisma.company.upsert({
    where: { code: "SUPP-004" },
    update: {},
    create: {
      code: "SUPP-004",
      companyName: "Swiss Professional Tools AG",
      tradeName: "SwissTools",
      legalForm: "AG",
      status: "ACTIVE",
      entityType: "FOREIGN",
      vatNumber: "CHE-123.456.789",
      countryCode: "CH",
      mainEmail: "info@swisstools.ch",
      mainPhone: "+41 44 123 45 67",
      assignedUserId: user.id,
      addresses: {
        create: [
          {
            addressType: "LEGAL",
            address: "Bahnhofstrasse 100",
            city: "Zürich",
            zipCode: "8001",
            countryCode: "CH",
            isPrimary: true,
          },
        ],
      },
      suppliers: {
        create: {
          paymentTerms: "30 giorni data fattura",
          creditLimit: 75000.0,
          bankAccount: "CH9300762011623852957",
          leadTimeDays: 5,
          transportCost: 25.0,
          rating: 5,
        },
      },
    },
    include: {
      suppliers: true,
    },
  });

  console.log(`✅ Created ${4} companies with suppliers`);

  // ============================================================================
  // 5. PRODUCT CATEGORIES
  // ============================================================================
  console.log("📂 Creating product categories...");

  // Lingua italiana (default)
  const italianLanguage = await prisma.language.findFirst({
    where: { iso_code: "it" },
  });

  if (!italianLanguage) {
    throw new Error("Italian language not found. Run language seed first.");
  }

  const categoryElettrico = await prisma.category.upsert({
    where: { code: "materiale-elettrico" },
    update: {},
    create: {
      code: "materiale-elettrico",
      active: true,
      position: 1,
      translations: {
        create: {
          languageId: italianLanguage.id,
          name: "Materiale Elettrico",
          slug: "materiale-elettrico",
          description: "Cavi, prese, interruttori e materiale elettrico vario",
        },
      },
    },
  });

  const categoryElettronico = await prisma.category.upsert({
    where: { code: "componenti-elettronici" },
    update: {},
    create: {
      code: "componenti-elettronici",
      active: true,
      position: 2,
      translations: {
        create: {
          languageId: italianLanguage.id,
          name: "Componenti Elettronici",
          slug: "componenti-elettronici",
          description: "Resistenze, condensatori, circuiti integrati",
        },
      },
    },
  });

  const categoryIdraulico = await prisma.category.upsert({
    where: { code: "materiale-idraulico" },
    update: {},
    create: {
      code: "materiale-idraulico",

      active: true,
      position: 3,
      translations: {
        create: {
          languageId: italianLanguage.id,
          name: "Materiale Idraulico",
          slug: "materiale-idraulico",
          description: "Tubi, raccordi, rubinetteria",
        },
      },
    },
  });

  const categoryUtensili = await prisma.category.upsert({
    where: { code: "utensili-professionali" },
    update: {},
    create: {
      code: "utensili-professionali",

      active: true,
      position: 4,
      translations: {
        create: {
          languageId: italianLanguage.id,
          name: "Utensili Professionali",
          slug: "utensili-professionali",
          description: "Utensili manuali ed elettrici per professionisti",
        },
      },
    },
  });

  // ============================================================================
  // PRODUCTS with VARIANTS & TRANSLATIONS
  // ============================================================================
  console.log("📦 Creating products with variants...");

  

  // Prodotto 1: Cavo elettrico
  const productCavo = await prisma.product.create({
    data: {
      reference: "CAV-001",
      type: "STANDARD",
      active: true,
      availableForOrder: true,
      showPrice: true,

      defaultTaxRuleId: taxRuleIVA22.id,
      supplierId: companyElettroItalia.suppliers[0].id,

      // Prezzo base "A partire da..."
      price: 2.5,
      wholesalePrice: 1.2,

      variants: {
        create: [
          {
            variantCode: "CAV-001-3X1.5",
            sku: "CAV-001-3X1.5",
            ean13: "8001234567890",
            isDefault: true, // ✅ Prima variante = default
            active: true,
            availableForOrder: true,

            price: 2.5,
            wholesalePrice: 1.2,
            weight: 0.045,

            quantity: 0,
            minimalQuantity: 10,
            lowStockThreshold: 50,
            lowStockAlertEnabled: true,

            translations: {
              create: {
                languageId: italianLanguage.id,
                name: "Cavo elettrico 3x1.5 mm²",
                description:
                  "Cavo elettrico flessibile tripolare 3x1.5mm² per impianti civili e industriali",
                shortDescription: "Cavo tripolare 3x1.5mm²",
                metaTitle: "Cavo elettrico 3x1.5 mm² - Materiale Elettrico",
                metaDescription:
                  "Cavo elettrico flessibile tripolare 3x1.5mm² per impianti",
                linkRewrite: "cavo-elettrico-3x15mm",
              },
            },
          },
          {
            variantCode: "CAV-001-3X2.5",
            sku: "CAV-001-3X2.5",
            ean13: "8001234567891",
            isDefault: false,
            active: true,
            availableForOrder: true,

            price: 3.75,
            wholesalePrice: 1.8,
            weight: 0.07,

            quantity: 0,
            minimalQuantity: 10,

            translations: {
              create: {
                languageId: italianLanguage.id,
                name: "Cavo elettrico 3x2.5 mm²",
                description:
                  "Cavo elettrico flessibile tripolare 3x2.5mm² per impianti civili e industriali",
                shortDescription: "Cavo tripolare 3x2.5mm²",
                metaTitle: "Cavo elettrico 3x2.5 mm² - Materiale Elettrico",
                linkRewrite: "cavo-elettrico-3x25mm",
              },
            },
          },
          {
            variantCode: "CAV-001-3X4",
            sku: "CAV-001-3X4",
            ean13: "8001234567892",
            isDefault: false,
            active: true,
            availableForOrder: true,

            price: 5.8,
            wholesalePrice: 2.8,
            weight: 0.11,

            quantity: 0,
            minimalQuantity: 10,

            translations: {
              create: {
                languageId: italianLanguage.id,
                name: "Cavo elettrico 3x4 mm²",
                description:
                  "Cavo elettrico flessibile tripolare 3x4mm² per impianti civili e industriali",
                shortDescription: "Cavo tripolare 3x4mm²",
                metaTitle: "Cavo elettrico 3x4 mm² - Materiale Elettrico",
                linkRewrite: "cavo-elettrico-3x4mm",
              },
            },
          },
        ],
      },
    },
    include: {
      variants: {
        include: {
          translations: true,
        },
      },
    },
  });

  // Prodotto 2: Interruttori differenziali
  const productDifferenziale = await prisma.product.create({
    data: {
      reference: "INT-001",
      type: "STANDARD",
      active: true,
      availableForOrder: true,
      showPrice: true,

      defaultTaxRuleId: taxRuleIVA22.id,
      supplierId: companyElettroItalia.suppliers[0].id,

      price: 52.0,
      wholesalePrice: 25.0,

      variants: {
        create: [
          {
            variantCode: "INT-001-16A",
            sku: "INT-001-16A",
            ean13: "8001234568890",
            isDefault: true,
            active: true,
            availableForOrder: true,

            price: 52.0,
            wholesalePrice: 25.0,
            weight: 0.25,

            quantity: 0,
            minimalQuantity: 1,
            lowStockThreshold: 10,
            lowStockAlertEnabled: true,

            translations: {
              create: {
                languageId: italianLanguage.id,
                name: "Interruttore differenziale 16A 2P",
                description:
                  "Interruttore magnetotermico differenziale salvavita bipolare 16A 30mA",
                shortDescription: "Differenziale bipolare 16A 30mA",
                metaTitle: "Interruttore Differenziale 16A 2P - Salvavita",
                linkRewrite: "interruttore-differenziale-16a-2p",
              },
            },
          },
          {
            variantCode: "INT-001-25A",
            sku: "INT-001-25A",
            ean13: "8001234568891",
            isDefault: false,
            active: true,
            availableForOrder: true,

            price: 58.0,
            wholesalePrice: 28.0,
            weight: 0.27,

            quantity: 0,
            minimalQuantity: 1,

            translations: {
              create: {
                languageId: italianLanguage.id,
                name: "Interruttore differenziale 25A 2P",
                description:
                  "Interruttore magnetotermico differenziale salvavita bipolare 25A 30mA",
                shortDescription: "Differenziale bipolare 25A 30mA",
                metaTitle: "Interruttore Differenziale 25A 2P - Salvavita",
                linkRewrite: "interruttore-differenziale-25a-2p",
              },
            },
          },
        ],
      },
    },
    include: {
      variants: {
        include: {
          translations: true,
        },
      },
    },
  });

  // Prodotto 3: Resistenze elettroniche
  const productResistenze = await prisma.product.create({
    data: {
      reference: "RES-001",
      type: "STANDARD",
      active: true,
      availableForOrder: true,
      showPrice: true,

      defaultTaxRuleId: taxRuleIVA22.id,
      supplierId: companyTechnoGmbH.suppliers[0].id,

      price: 0.12,
      wholesalePrice: 0.05,

      variants: {
        create: [
          {
            variantCode: "RES-001-1K",
            sku: "RES-001-1K",
            ean13: "4012345678901",
            isDefault: true,
            active: true,
            availableForOrder: true,

            price: 0.12,
            wholesalePrice: 0.05,
            weight: 0.001,

            quantity: 0,
            minimalQuantity: 100,

            translations: {
              create: {
                languageId: italianLanguage.id,
                name: "Resistenza 1KΩ 1% 0.25W",
                description:
                  "Resistenza a film metallico 1000 Ohm tolleranza 1% potenza 0.25W",
                shortDescription: "Resistenza 1KΩ di precisione",
                metaTitle: "Resistenza 1KΩ 1% 0.25W - Componenti Elettronici",
                linkRewrite: "resistenza-1kohm-1-025w",
              },
            },
          },
          {
            variantCode: "RES-001-10K",
            sku: "RES-001-10K",
            ean13: "4012345678902",
            isDefault: false,
            active: true,
            availableForOrder: true,

            price: 0.12,
            wholesalePrice: 0.05,
            weight: 0.001,

            quantity: 0,
            minimalQuantity: 100,

            translations: {
              create: {
                languageId: italianLanguage.id,
                name: "Resistenza 10KΩ 1% 0.25W",
                description:
                  "Resistenza a film metallico 10000 Ohm tolleranza 1% potenza 0.25W",
                shortDescription: "Resistenza 10KΩ di precisione",
                linkRewrite: "resistenza-10kohm-1-025w",
              },
            },
          },
          {
            variantCode: "RES-001-100K",
            sku: "RES-001-100K",
            ean13: "4012345678903",
            isDefault: false,
            active: true,
            availableForOrder: true,

            price: 0.12,
            wholesalePrice: 0.05,
            weight: 0.001,

            quantity: 0,
            minimalQuantity: 100,

            translations: {
              create: {
                languageId: italianLanguage.id,
                name: "Resistenza 100KΩ 1% 0.25W",
                description:
                  "Resistenza a film metallico 100000 Ohm tolleranza 1% potenza 0.25W",
                shortDescription: "Resistenza 100KΩ di precisione",
                linkRewrite: "resistenza-100kohm-1-025w",
              },
            },
          },
        ],
      },
    },
    include: {
      variants: {
        include: {
          translations: true,
        },
      },
    },
  });

  // Prodotto 4: Raccordi idraulici
  const productRaccordi = await prisma.product.create({
    data: {
      reference: "RAC-001",
      type: "STANDARD",
      active: true,
      availableForOrder: true,
      showPrice: true,

      defaultTaxRuleId: taxRuleIVA22.id,
      supplierId: companyPlomberieFR.suppliers[0].id,

      price: 7.5,
      wholesalePrice: 3.5,

      variants: {
        create: [
          {
            variantCode: "RAC-001-1/2",
            sku: "RAC-001-1/2",
            ean13: "3012345678901",
            isDefault: true,
            active: true,
            availableForOrder: true,

            price: 7.5,
            wholesalePrice: 3.5,
            weight: 0.08,

            quantity: 0,
            minimalQuantity: 5,

            translations: {
              create: {
                languageId: italianLanguage.id,
                name: 'Raccordo a T 1/2" in ottone',
                description:
                  "Raccordo idraulico a T filettato 1/2 pollice in ottone cromato",
                shortDescription: 'Raccordo T 1/2" ottone cromato',
                metaTitle: 'Raccordo a T 1/2" in Ottone - Idraulica',
                linkRewrite: "raccordo-t-12-ottone",
              },
            },
          },
          {
            variantCode: "RAC-001-3/4",
            sku: "RAC-001-3/4",
            ean13: "3012345678902",
            isDefault: false,
            active: true,
            availableForOrder: true,

            price: 10.0,
            wholesalePrice: 4.8,
            weight: 0.12,

            quantity: 0,
            minimalQuantity: 5,

            translations: {
              create: {
                languageId: italianLanguage.id,
                name: 'Raccordo a T 3/4" in ottone',
                description:
                  "Raccordo idraulico a T filettato 3/4 pollice in ottone cromato",
                shortDescription: 'Raccordo T 3/4" ottone cromato',
                linkRewrite: "raccordo-t-34-ottone",
              },
            },
          },
          {
            variantCode: "RAC-001-1",
            sku: "RAC-001-1",
            ean13: "3012345678903",
            isDefault: false,
            active: true,
            availableForOrder: true,

            price: 13.5,
            wholesalePrice: 6.5,
            weight: 0.18,

            quantity: 0,
            minimalQuantity: 5,

            translations: {
              create: {
                languageId: italianLanguage.id,
                name: 'Raccordo a T 1" in ottone',
                description:
                  "Raccordo idraulico a T filettato 1 pollice in ottone cromato",
                shortDescription: 'Raccordo T 1" ottone cromato',
                linkRewrite: "raccordo-t-1-ottone",
              },
            },
          },
        ],
      },
    },
    include: {
      variants: {
        include: {
          translations: true,
        },
      },
    },
  });

  // Prodotto 5: Trapano avvitatore
  const productTrapano = await prisma.product.create({
    data: {
      reference: "UTN-001",
      type: "STANDARD",
      active: true,
      availableForOrder: true,
      showPrice: true,

      defaultTaxRuleId: taxRuleIVA22.id,
      supplierId: companySwissTools.suppliers[0].id,

      price: 175.0,
      wholesalePrice: 85.0,

      variants: {
        create: [
          {
            variantCode: "UTN-001-BASIC",
            sku: "UTN-001-BASIC",
            ean13: "7612345678901",
            isDefault: true,
            active: true,
            availableForOrder: true,

            price: 175.0,
            wholesalePrice: 85.0,
            weight: 1.85,

            quantity: 0,
            minimalQuantity: 1,
            lowStockThreshold: 5,
            lowStockAlertEnabled: true,

            translations: {
              create: {
                languageId: italianLanguage.id,
                name: "Trapano avvitatore 18V Base",
                description:
                  "Trapano avvitatore professionale a batteria 18V Li-Ion con 1 batteria 2Ah e caricabatterie",
                shortDescription: "Trapano 18V con 1 batteria 2Ah",
                metaTitle:
                  "Trapano Avvitatore 18V Base - Utensili Professionali",
                linkRewrite: "trapano-avvitatore-18v-base",
              },
            },
          },
          {
            variantCode: "UTN-001-PRO",
            sku: "UTN-001-PRO",
            ean13: "7612345678902",
            isDefault: false,
            active: true,
            availableForOrder: true,

            price: 295.0,
            wholesalePrice: 145.0,
            weight: 3.2,

            quantity: 0,
            minimalQuantity: 1,

            translations: {
              create: {
                languageId: italianLanguage.id,
                name: "Trapano avvitatore 18V Professional",
                description:
                  "Trapano avvitatore professionale a batteria 18V Li-Ion con 2 batterie 4Ah, caricabatterie e valigetta",
                shortDescription: "Trapano 18V con 2 batterie 4Ah + valigetta",
                metaTitle: "Trapano Avvitatore 18V Professional - Utensili",
                linkRewrite: "trapano-avvitatore-18v-professional",
              },
            },
          },
        ],
      },
    },
    include: {
      variants: {
        include: {
          translations: true,
        },
      },
    },
  });

  // Prodotto 6: Set cacciaviti
  const productCacciaviti = await prisma.product.create({
    data: {
      reference: "UTN-002",
      type: "STANDARD",
      active: true,
      availableForOrder: true,
      showPrice: true,

      defaultTaxRuleId: taxRuleIVA22.id,
      supplierId: companySwissTools.suppliers[0].id,

      price: 38.0,
      wholesalePrice: 18.0,

      variants: {
        create: [
          {
            variantCode: "UTN-002-6PZ",
            sku: "UTN-002-6PZ",
            ean13: "7612345679901",
            isDefault: true,
            active: true,
            availableForOrder: true,

            price: 38.0,
            wholesalePrice: 18.0,
            weight: 0.45,

            quantity: 0,
            minimalQuantity: 1,

            translations: {
              create: {
                languageId: italianLanguage.id,
                name: "Set 6 cacciaviti professionali",
                description:
                  "Set di 6 cacciaviti di precisione con impugnatura ergonomica: 3 piatti + 3 a croce",
                shortDescription: "Set 6 pezzi: 3 piatti + 3 croce",
                metaTitle: "Set 6 Cacciaviti Professionali - Utensili",
                linkRewrite: "set-6-cacciaviti-professionali",
              },
            },
          },
          {
            variantCode: "UTN-002-12PZ",
            sku: "UTN-002-12PZ",
            ean13: "7612345679902",
            isDefault: false,
            active: true,
            availableForOrder: true,

            price: 68.0,
            wholesalePrice: 32.0,
            weight: 0.85,

            quantity: 0,
            minimalQuantity: 1,

            translations: {
              create: {
                languageId: italianLanguage.id,
                name: "Set 12 cacciaviti professionali",
                description:
                  "Set di 12 cacciaviti di precisione con impugnatura ergonomica e valigetta: 6 piatti + 6 a croce",
                shortDescription: "Set 12 pezzi con valigetta",
                metaTitle: "Set 12 Cacciaviti Professionali - Utensili",
                linkRewrite: "set-12-cacciaviti-professionali",
              },
            },
          },
        ],
      },
    },
    include: {
      variants: {
        include: {
          translations: true,
        },
      },
    },
  });

  // Prodotto 7: Servizio installazione
  const productServizio = await prisma.product.create({
    data: {
      reference: "SRV-001",
      type: "VIRTUAL", // Servizio
      active: true,
      availableForOrder: true,
      showPrice: true,

      defaultTaxRuleId: taxRuleIVA22.id,

      price: 45.0,
      wholesalePrice: 0.0,

      variants: {
        create: [
          {
            variantCode: "SRV-001-BASE",
            sku: "SRV-001-BASE",
            isDefault: true,
            active: true,
            availableForOrder: true,

            price: 45.0,
            wholesalePrice: 0.0,
            weight: 0.0,

            quantity: 999, // Servizio sempre disponibile
            minimalQuantity: 1,

            translations: {
              create: {
                languageId: italianLanguage.id,
                name: "Servizio installazione standard",
                description:
                  "Servizio di installazione e configurazione impianto elettrico con 1 tecnico specializzato",
                shortDescription: "Installazione standard con 1 tecnico",
                metaTitle: "Servizio Installazione Impianto Standard",
                linkRewrite: "servizio-installazione-standard",
              },
            },
          },
          {
            variantCode: "SRV-001-URGENZA",
            sku: "SRV-001-URGENZA",
            isDefault: false,
            active: true,
            availableForOrder: true,

            price: 75.0,
            wholesalePrice: 0.0,
            weight: 0.0,

            quantity: 999,
            minimalQuantity: 1,

            translations: {
              create: {
                languageId: italianLanguage.id,
                name: "Servizio installazione urgenza",
                description:
                  "Servizio di installazione urgente in giornata con priorità massima",
                shortDescription: "Installazione urgente in giornata",
                metaTitle: "Servizio Installazione Impianto Urgenza",
                linkRewrite: "servizio-installazione-urgenza",
              },
            },
          },
        ],
      },
    },
    include: {
      variants: {
        include: {
          translations: true,
        },
      },
    },
  });

  console.log(`✅ Created 7 products with multiple variants and translations`);

  // ============================================================================
  // 7. CONTACTS per Suppliers
  // ============================================================================
  console.log("📞 Creating supplier contacts...");

  await prisma.contact.createMany({
    data: [
      {
        companyId: companyElettroItalia.id,
        firstName: "Giuseppe",
        lastName: "Bianchi",
        email: "g.bianchi@elettroitalia.it",
        phone: "+39 02 1234567",
        mobilePhone: "+39 340 1234567",
        position: "Responsabile Commerciale",
        department: "Vendite",
        isPrimaryContact: true,
        active: true,
      },
      {
        companyId: companyTechnoGmbH.id,
        firstName: "Hans",
        lastName: "Schmidt",
        email: "h.schmidt@technocomp.de",
        phone: "+49 30 12345678",
        mobilePhone: "+49 170 1234567",
        position: "Sales Manager",
        department: "Sales",
        isPrimaryContact: true,
        active: true,
      },
      {
        companyId: companyPlomberieFR.id,
        firstName: "Pierre",
        lastName: "Dubois",
        email: "p.dubois@dupontplomberie.fr",
        phone: "+33 1 42 12 34 56",
        mobilePhone: "+33 6 12 34 56 78",
        position: "Responsable Commercial",
        department: "Ventes",
        isPrimaryContact: true,
        active: true,
      },
      {
        companyId: companySwissTools.id,
        firstName: "Peter",
        lastName: "Müller",
        email: "p.mueller@swisstools.ch",
        phone: "+41 44 123 45 67",
        mobilePhone: "+41 79 123 45 67",
        position: "Verkaufsleiter",
        department: "Verkauf",
        isPrimaryContact: true,
        active: true,
      },
    ],
  });

  console.log(`✅ Created contacts for suppliers`);

  // ============================================================================
  // SUMMARY
  // ============================================================================
  const totalCompanies = await prisma.company.count();
  const totalSuppliers = await prisma.supplier.count();
  const totalProducts = await prisma.product.count();
  const totalVariants = await prisma.productVariant.count();
  const totalContacts = await prisma.contact.count();

  console.log("\n📊 Summary:");
  console.log(`   Companies: ${totalCompanies}`);
  console.log(`   Suppliers: ${totalSuppliers}`);
  console.log(`   Products: ${totalProducts}`);
  console.log(`   Product Variants: ${totalVariants}`);
  console.log(`   Contacts: ${totalContacts}`);
  console.log("\n✅ Demo data seeding completed!\n");
}

// ============================================================================
// EXECUTE
// ============================================================================
seedDemoData()
  .catch((error) => {
    console.error("❌ Error seeding demo data:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
