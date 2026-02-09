// prisma/seeds/currencies.seed.ts
import { prisma } from "@/config/prisma-client";

const CURRENCY_DATA = [
  {
    code: 'EUR',
    symbol: '€',
    symbolNative: '€',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    decimalSeparator: ',',
    thousandSeparator: '.',
    isBaseCurrency: true,
    exchangeRate: 1.0,
    exchangeRateSource: 'base',
    active: true,
    priority: 1,
    countryCode: 'IT',
  },
  {
    code: 'USD',
    symbol: '$',
    symbolNative: '$',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandSeparator: ',',
    isBaseCurrency: false,
    exchangeRate: 1.08,
    exchangeRateSource: 'ECB',
    active: true,
    priority: 2,
    countryCode: 'US',
  },
  {
    code: 'GBP',
    symbol: '£',
    symbolNative: '£',
    decimalDigits: 2,
    rounding: 0,
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandSeparator: ',',
    isBaseCurrency: false,
    exchangeRate: 0.86,
    exchangeRateSource: 'ECB',
    active: true,
    priority: 3,
    countryCode: 'GB',
  },
  {
    code: 'CHF',
    symbol: 'CHF',
    symbolNative: 'CHF',
    decimalDigits: 2,
    rounding: 0.05,
    symbolPosition: 'after',
    decimalSeparator: '.',
    thousandSeparator: "'",
    isBaseCurrency: false,
    exchangeRate: 0.95,
    exchangeRateSource: 'ECB',
    active: true,
    priority: 4,
    countryCode: 'CH',
  },
  {
    code: 'JPY',
    symbol: '¥',
    symbolNative: '¥',
    decimalDigits: 0,
    rounding: 0,
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandSeparator: ',',
    isBaseCurrency: false,
    exchangeRate: 161.5,
    exchangeRateSource: 'ECB',
    active: true,
    priority: 5,
    countryCode: 'JP',
  },
];

const CURRENCY_TRANSLATIONS = [
  // EUR - Euro
  { currencyCode: 'EUR', languageId: 1, name: 'Euro', namePlural: 'Euro' },
  { currencyCode: 'EUR', languageId: 2, name: 'Euro', namePlural: 'Euros' },
  { currencyCode: 'EUR', languageId: 3, name: 'Euro', namePlural: 'Euros' },
  { currencyCode: 'EUR', languageId: 4, name: 'Euro', namePlural: 'Euro' },
  { currencyCode: 'EUR', languageId: 5, name: 'Euro', namePlural: 'Euros' },
  
  // USD - US Dollar
  { currencyCode: 'USD', languageId: 1, name: 'Dollaro statunitense', namePlural: 'Dollari statunitensi' },
  { currencyCode: 'USD', languageId: 2, name: 'US Dollar', namePlural: 'US Dollars' },
  { currencyCode: 'USD', languageId: 3, name: 'Dollar américain', namePlural: 'Dollars américains' },
  { currencyCode: 'USD', languageId: 4, name: 'US-Dollar', namePlural: 'US-Dollar' },
  { currencyCode: 'USD', languageId: 5, name: 'Dólar estadounidense', namePlural: 'Dólares estadounidenses' },
  
  // GBP - British Pound
  { currencyCode: 'GBP', languageId: 1, name: 'Sterlina britannica', namePlural: 'Sterline britanniche' },
  { currencyCode: 'GBP', languageId: 2, name: 'British Pound', namePlural: 'British Pounds' },
  { currencyCode: 'GBP', languageId: 3, name: 'Livre sterling', namePlural: 'Livres sterling' },
  { currencyCode: 'GBP', languageId: 4, name: 'Britisches Pfund', namePlural: 'Britische Pfund' },
  { currencyCode: 'GBP', languageId: 5, name: 'Libra esterlina', namePlural: 'Libras esterlinas' },
  
  // CHF - Swiss Franc
  { currencyCode: 'CHF', languageId: 1, name: 'Franco svizzero', namePlural: 'Franchi svizzeri' },
  { currencyCode: 'CHF', languageId: 2, name: 'Swiss Franc', namePlural: 'Swiss Francs' },
  { currencyCode: 'CHF', languageId: 3, name: 'Franc suisse', namePlural: 'Francs suisses' },
  { currencyCode: 'CHF', languageId: 4, name: 'Schweizer Franken', namePlural: 'Schweizer Franken' },
  { currencyCode: 'CHF', languageId: 5, name: 'Franco suizo', namePlural: 'Francos suizos' },
  
  // JPY - Japanese Yen
  { currencyCode: 'JPY', languageId: 1, name: 'Yen giapponese', namePlural: 'Yen giapponesi' },
  { currencyCode: 'JPY', languageId: 2, name: 'Japanese Yen', namePlural: 'Japanese Yen' },
  { currencyCode: 'JPY', languageId: 3, name: 'Yen japonais', namePlural: 'Yens japonais' },
  { currencyCode: 'JPY', languageId: 4, name: 'Japanischer Yen', namePlural: 'Japanische Yen' },
  { currencyCode: 'JPY', languageId: 5, name: 'Yen japonés', namePlural: 'Yenes japoneses' },
];

async function seedCurrencies() {
  console.log('🌍 Seeding currencies...');
  
  // Inserisci le valute
  for (const currency of CURRENCY_DATA) {
    const upserted = await prisma.currency.upsert({
      where: { code: currency.code },
      update: currency,
      create: currency,
    });
    console.log(`  ✓ Currency ${currency.code} (ID: ${upserted.id})`);
  }

  console.log('🗣️  Seeding currency translations...');
  
  // Inserisci le traduzioni
  for (const translation of CURRENCY_TRANSLATIONS) {
    // Recupera la valuta per ottenere l'id
    const currency = await prisma.currency.findUnique({
      where: { code: translation.currencyCode },
    });
    
    if (!currency) {
      console.error(`  ✗ Currency ${translation.currencyCode} not found`);
      continue;
    }
    
    await prisma.currencyTranslation.upsert({
      where: {
        currencyId_languageId: {
          currencyId: currency.id,
          languageId: translation.languageId,
        },
      },
      update: {
        name: translation.name,
        namePlural: translation.namePlural,
      },
      create: {
        currencyId: currency.id,
        languageId: translation.languageId,
        name: translation.name,
        namePlural: translation.namePlural,
      },
    });
    console.log(`  ✓ Translation ${translation.currencyCode} - Language ${translation.languageId}: ${translation.name}`);
  }
  
  console.log('✅ Currencies and translations seeded successfully');
}


// Se eseguito direttamente
if (require.main === module) {
  seedCurrencies()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
