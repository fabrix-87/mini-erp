// prisma/seeds/currencies.seed.ts

import { prisma } from "@/config/prisma-client";

async function seedCurrencies() {
  console.log('💱 Seeding currencies...');

  const currencies = [
    {
      code: 'EUR',
      name: 'Euro',
      namePlural: 'euros',
      symbol: '€',
      symbolNative: '€',
      decimalDigits: 2,
      rounding: 0.01,
      symbolPosition: 'after',
      decimalSeparator: ',',
      thousandSeparator: '.',
      isBaseCurrency: true,
      exchangeRate: 1.0,
      active: true,
      priority: 1,
      countryCode: 'IT',
    },
    {
      code: 'USD',
      name: 'US Dollar',
      namePlural: 'US dollars',
      symbol: '$',
      symbolNative: '$',
      decimalDigits: 2,
      rounding: 0.01,
      symbolPosition: 'before',
      decimalSeparator: '.',
      thousandSeparator: ',',
      isBaseCurrency: false,
      exchangeRate: 1.08, // 1 USD = 1.08 EUR (esempio)
      active: true,
      priority: 2,
      countryCode: 'US',
    },
    {
      code: 'CHF',
      name: 'Swiss Franc',
      namePlural: 'Swiss francs',
      symbol: 'CHF',
      symbolNative: 'CHF',
      decimalDigits: 2,
      rounding: 0.05, // Svizzera arrotonda a 5 centesimi
      symbolPosition: 'after',
      decimalSeparator: ',',
      thousandSeparator: "'",
      isBaseCurrency: false,
      exchangeRate: 0.95, // 1 CHF = 0.95 EUR (esempio)
      active: true,
      priority: 3,
      countryCode: 'CH',
    },
    {
      code: 'GBP',
      name: 'British Pound',
      namePlural: 'British pounds',
      symbol: '£',
      symbolNative: '£',
      decimalDigits: 2,
      rounding: 0.01,
      symbolPosition: 'before',
      decimalSeparator: '.',
      thousandSeparator: ',',
      isBaseCurrency: false,
      exchangeRate: 0.85, // 1 GBP = 0.85 EUR (esempio)
      active: true,
      priority: 4,
      countryCode: 'GB',
    },
    {
      code: 'JPY',
      name: 'Japanese Yen',
      namePlural: 'Japanese yen',
      symbol: '¥',
      symbolNative: '￥',
      decimalDigits: 0, // Yen non ha decimali
      rounding: 1.0,
      symbolPosition: 'before',
      decimalSeparator: '.',
      thousandSeparator: ',',
      isBaseCurrency: false,
      exchangeRate: 160.0, // 1 JPY = 0.00625 EUR (esempio)
      active: true,
      priority: 5,
      countryCode: 'JP',
    },
  ];

  for (const curr of currencies) {
    await prisma.currency.upsert({
      where: { code: curr.code },
      update: curr,
      create: curr,
    });
  }

  console.log(`✅ Created ${currencies.length} currencies`);
}

seedCurrencies()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
