// prisma/seeds/currencies.seed.ts
import { prisma } from "@/config/prisma-config";

const CURRENCY_DATA = [
  {
    code:           'EUR',
    numericCode:    '978',
    symbol:         '€',
    symbolNative:   '€',
    minorUnit:      2,
    rounding:       0,
    isBaseCurrency: true,
    active:         true,
    priority:       1,
    // countryCode omesso: Country non esiste ancora al momento del seed valute
  },
  {
    code:           'USD',
    numericCode:    '840',
    symbol:         '$',
    symbolNative:   '$',
    minorUnit:      2,
    rounding:       0,
    isBaseCurrency: false,
    active:         true,
    priority:       2,
  },
  {
    code:           'GBP',
    numericCode:    '826',
    symbol:         '£',
    symbolNative:   '£',
    minorUnit:      2,
    rounding:       0,
    isBaseCurrency: false,
    active:         true,
    priority:       3,
  },
  {
    code:           'CHF',
    numericCode:    '756',
    symbol:         'Fr',
    symbolNative:   'Fr',
    minorUnit:      2,
    rounding:       0.05,
    isBaseCurrency: false,
    active:         true,
    priority:       4,
  },
  {
    code:           'JPY',
    numericCode:    '392',
    symbol:         '¥',
    symbolNative:   '¥',
    minorUnit:      0,
    rounding:       0,
    isBaseCurrency: false,
    active:         true,
    priority:       5,
  },
  // Valute extra richieste dal seed Country
  { code: 'BGN', numericCode: '975', symbol: 'лв',  symbolNative: 'лв',   minorUnit: 2, rounding: 0, isBaseCurrency: false, active: true, priority: 0 },
  { code: 'CZK', numericCode: '203', symbol: 'Kč',  symbolNative: 'Kč',   minorUnit: 2, rounding: 0, isBaseCurrency: false, active: true, priority: 0 },
  { code: 'DKK', numericCode: '208', symbol: 'kr',  symbolNative: 'kr',   minorUnit: 2, rounding: 0, isBaseCurrency: false, active: true, priority: 0 },
  { code: 'HUF', numericCode: '348', symbol: 'Ft',  symbolNative: 'Ft',   minorUnit: 2, rounding: 0, isBaseCurrency: false, active: true, priority: 0 },
  { code: 'PLN', numericCode: '985', symbol: 'zł',  symbolNative: 'zł',   minorUnit: 2, rounding: 0, isBaseCurrency: false, active: true, priority: 0 },
  { code: 'RON', numericCode: '946', symbol: 'lei', symbolNative: 'lei',  minorUnit: 2, rounding: 0, isBaseCurrency: false, active: true, priority: 0 },
  { code: 'SEK', numericCode: '752', symbol: 'kr',  symbolNative: 'kr',   minorUnit: 2, rounding: 0, isBaseCurrency: false, active: true, priority: 0 },
  { code: 'NOK', numericCode: '578', symbol: 'kr',  symbolNative: 'kr',   minorUnit: 2, rounding: 0, isBaseCurrency: false, active: true, priority: 0 },
  { code: 'ISK', numericCode: '352', symbol: 'kr',  symbolNative: 'kr',   minorUnit: 0, rounding: 0, isBaseCurrency: false, active: true, priority: 0 },
  { code: 'RSD', numericCode: '941', symbol: 'din', symbolNative: 'дин', minorUnit: 2, rounding: 0, isBaseCurrency: false, active: true, priority: 0 },
  { code: 'UAH', numericCode: '980', symbol: '₴',   symbolNative: '₴',    minorUnit: 2, rounding: 0, isBaseCurrency: false, active: true, priority: 0 },
  { code: 'TRY', numericCode: '949', symbol: '₺',   symbolNative: '₺',    minorUnit: 2, rounding: 0, isBaseCurrency: false, active: true, priority: 0 },
  { code: 'ALL', numericCode: '008', symbol: 'L',   symbolNative: 'L',    minorUnit: 2, rounding: 0, isBaseCurrency: false, active: true, priority: 0 },
  { code: 'BAM', numericCode: '977', symbol: 'KM',  symbolNative: 'KM',   minorUnit: 2, rounding: 0, isBaseCurrency: false, active: true, priority: 0 },
  { code: 'MKD', numericCode: '807', symbol: 'ден', symbolNative: 'ден',  minorUnit: 2, rounding: 0, isBaseCurrency: false, active: true, priority: 0 },
  { code: 'BYN', numericCode: '933', symbol: 'Br',  symbolNative: 'Br',   minorUnit: 2, rounding: 0, isBaseCurrency: false, active: true, priority: 0 },
  { code: 'MDL', numericCode: '498', symbol: 'L',   symbolNative: 'L',    minorUnit: 2, rounding: 0, isBaseCurrency: false, active: true, priority: 0 },
  { code: 'RUB', numericCode: '643', symbol: '₽',   symbolNative: '₽',    minorUnit: 2, rounding: 0, isBaseCurrency: false, active: true, priority: 0 },
  { code: 'CAD', numericCode: '124', symbol: 'CA$', symbolNative: '$',    minorUnit: 2, rounding: 0, isBaseCurrency: false, active: true, priority: 0 },
  { code: 'MXN', numericCode: '484', symbol: 'MX$', symbolNative: '$',    minorUnit: 2, rounding: 0, isBaseCurrency: false, active: true, priority: 0 },
  { code: 'BRL', numericCode: '986', symbol: 'R$',  symbolNative: 'R$',   minorUnit: 2, rounding: 0, isBaseCurrency: false, active: true, priority: 0 },
  { code: 'ARS', numericCode: '032', symbol: '$',   symbolNative: '$',    minorUnit: 2, rounding: 0, isBaseCurrency: false, active: true, priority: 0 },
  { code: 'CNY', numericCode: '156', symbol: 'CN¥', symbolNative: '¥',   minorUnit: 2, rounding: 0, isBaseCurrency: false, active: true, priority: 0 },
  { code: 'KRW', numericCode: '410', symbol: '₩',   symbolNative: '₩',    minorUnit: 0, rounding: 0, isBaseCurrency: false, active: true, priority: 0 },
  { code: 'INR', numericCode: '356', symbol: '₹',   symbolNative: '₹',    minorUnit: 2, rounding: 0, isBaseCurrency: false, active: true, priority: 0 },
  { code: 'AUD', numericCode: '036', symbol: 'A$',  symbolNative: '$',    minorUnit: 2, rounding: 0, isBaseCurrency: false, active: true, priority: 0 },
  { code: 'NZD', numericCode: '554', symbol: 'NZ$', symbolNative: '$',    minorUnit: 2, rounding: 0, isBaseCurrency: false, active: true, priority: 0 },
  { code: 'ZAR', numericCode: '710', symbol: 'R',   symbolNative: 'R',    minorUnit: 2, rounding: 0, isBaseCurrency: false, active: true, priority: 0 },
  { code: 'EGP', numericCode: '818', symbol: 'E£',  symbolNative: 'ج.م', minorUnit: 2, rounding: 0, isBaseCurrency: false, active: true, priority: 0 },
  { code: 'SAR', numericCode: '682', symbol: 'SR',  symbolNative: '﷼',   minorUnit: 2, rounding: 0, isBaseCurrency: false, active: true, priority: 0 },
  { code: 'AED', numericCode: '784', symbol: 'AED', symbolNative: 'د.إ', minorUnit: 2, rounding: 0, isBaseCurrency: false, active: true, priority: 0 },
  { code: 'SGD', numericCode: '702', symbol: 'S$',  symbolNative: '$',    minorUnit: 2, rounding: 0, isBaseCurrency: false, active: true, priority: 0 },
  { code: 'THB', numericCode: '764', symbol: '฿',   symbolNative: '฿',    minorUnit: 2, rounding: 0, isBaseCurrency: false, active: true, priority: 0 },
  { code: 'IDR', numericCode: '360', symbol: 'Rp',  symbolNative: 'Rp',   minorUnit: 2, rounding: 0, isBaseCurrency: false, active: true, priority: 0 },
  { code: 'MYR', numericCode: '458', symbol: 'RM',  symbolNative: 'RM',   minorUnit: 2, rounding: 0, isBaseCurrency: false, active: true, priority: 0 },
  { code: 'PHP', numericCode: '608', symbol: '₱',   symbolNative: '₱',    minorUnit: 2, rounding: 0, isBaseCurrency: false, active: true, priority: 0 },
  { code: 'VND', numericCode: '704', symbol: '₫',   symbolNative: '₫',    minorUnit: 0, rounding: 0, isBaseCurrency: false, active: true, priority: 0 },
];

const CURRENCY_TRANSLATIONS = [
  { currencyCode: 'EUR', languageId: 1, name: 'Euro',                  namePlural: 'Euro' },
  { currencyCode: 'EUR', languageId: 2, name: 'Euro',                  namePlural: 'Euros' },
  { currencyCode: 'EUR', languageId: 3, name: 'Euro',                  namePlural: 'Euros' },
  { currencyCode: 'EUR', languageId: 4, name: 'Euro',                  namePlural: 'Euro' },
  { currencyCode: 'EUR', languageId: 5, name: 'Euro',                  namePlural: 'Euros' },
  { currencyCode: 'USD', languageId: 1, name: 'Dollaro statunitense',  namePlural: 'Dollari statunitensi' },
  { currencyCode: 'USD', languageId: 2, name: 'US Dollar',             namePlural: 'US Dollars' },
  { currencyCode: 'USD', languageId: 3, name: 'Dollar américain',      namePlural: 'Dollars américains' },
  { currencyCode: 'USD', languageId: 4, name: 'US-Dollar',             namePlural: 'US-Dollar' },
  { currencyCode: 'USD', languageId: 5, name: 'Dólar estadounidense',  namePlural: 'Dólares estadounidenses' },
  { currencyCode: 'GBP', languageId: 1, name: 'Sterlina britannica',   namePlural: 'Sterline britanniche' },
  { currencyCode: 'GBP', languageId: 2, name: 'British Pound',         namePlural: 'British Pounds' },
  { currencyCode: 'GBP', languageId: 3, name: 'Livre sterling',        namePlural: 'Livres sterling' },
  { currencyCode: 'GBP', languageId: 4, name: 'Britisches Pfund',      namePlural: 'Britische Pfund' },
  { currencyCode: 'GBP', languageId: 5, name: 'Libra esterlina',       namePlural: 'Libras esterlinas' },
  { currencyCode: 'CHF', languageId: 1, name: 'Franco svizzero',       namePlural: 'Franchi svizzeri' },
  { currencyCode: 'CHF', languageId: 2, name: 'Swiss Franc',           namePlural: 'Swiss Francs' },
  { currencyCode: 'CHF', languageId: 3, name: 'Franc suisse',          namePlural: 'Francs suisses' },
  { currencyCode: 'CHF', languageId: 4, name: 'Schweizer Franken',     namePlural: 'Schweizer Franken' },
  { currencyCode: 'CHF', languageId: 5, name: 'Franco suizo',          namePlural: 'Francos suizos' },
  { currencyCode: 'JPY', languageId: 1, name: 'Yen giapponese',        namePlural: 'Yen giapponesi' },
  { currencyCode: 'JPY', languageId: 2, name: 'Japanese Yen',          namePlural: 'Japanese Yen' },
  { currencyCode: 'JPY', languageId: 3, name: 'Yen japonais',          namePlural: 'Yens japonais' },
  { currencyCode: 'JPY', languageId: 4, name: 'Japanischer Yen',       namePlural: 'Japanische Yen' },
  { currencyCode: 'JPY', languageId: 5, name: 'Yen japonés',           namePlural: 'Yenes japoneses' },
];

async function seedCurrencies() {
  console.log('💶 Seeding currencies...');

  for (const currency of CURRENCY_DATA) {
    const upserted = await prisma.currency.upsert({
      where:  { code: currency.code },
      update: {
        symbol:         currency.symbol,
        symbolNative:   currency.symbolNative,
        minorUnit:      currency.minorUnit,
        rounding:       currency.rounding,
        isBaseCurrency: currency.isBaseCurrency,
        active:         currency.active,
        priority:       currency.priority,
      },
      create: currency,
    });
    console.log(`  ✓ ${currency.code} (id: ${upserted.id})`);
  }

  console.log('🗣️  Seeding currency translations...');

  for (const t of CURRENCY_TRANSLATIONS) {
    const currency = await prisma.currency.findUnique({ where: { code: t.currencyCode } });
    if (!currency) {
      console.warn(`  ✗ Currency ${t.currencyCode} non trovata, skip.`);
      continue;
    }
    await prisma.currencyTranslation.upsert({
      where: {
        currencyId_languageId: {
          currencyId: currency.id,
          languageId: t.languageId,
        },
      },
      update: { name: t.name, namePlural: t.namePlural },
      create: {
        currencyId: currency.id,
        languageId: t.languageId,
        name:       t.name,
        namePlural: t.namePlural,
      },
    });
    console.log(`  ✓ ${t.currencyCode} - lang ${t.languageId}: ${t.name}`);
  }

  console.log('✅ Currencies seeded.');
}

if (require.main === module) {
  seedCurrencies()
    .catch(e => { console.error(e); process.exit(1) })
    .finally(() => prisma.$disconnect());
}

export { seedCurrencies };