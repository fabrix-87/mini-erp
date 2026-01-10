import { prisma } from '../../config/prisma-client';

async function main() {
  console.log('🌱 Inizio seeding Country & Language...');

  // Svuota solo la tabella Country (mantiene Language esistenti)
  console.log('🗑️  Svuotamento tabella Country...');
  await prisma.country.deleteMany({});
  console.log('✅ Tabella Country svuotata');

  // Seed Countries
  console.log('🌍 Creazione paesi...');
  
  const countriesData = [
    // Paesi EU (27 membri attuali)
    { code: 'AT', name: 'Austria', isEU: true, languages: ['de'] },
    { code: 'BE', name: 'Belgio', isEU: true, languages: ['nl', 'fr', 'de'] },
    { code: 'BG', name: 'Bulgaria', isEU: true, languages: [] },
    { code: 'HR', name: 'Croazia', isEU: true, languages: [] },
    { code: 'CY', name: 'Cipro', isEU: true, languages: [] },
    { code: 'CZ', name: 'Repubblica Ceca', isEU: true, languages: [] },
    { code: 'DK', name: 'Danimarca', isEU: true, languages: [] },
    { code: 'EE', name: 'Estonia', isEU: true, languages: [] },
    { code: 'FI', name: 'Finlandia', isEU: true, languages: [] },
    { code: 'FR', name: 'Francia', isEU: true, languages: ['fr'] },
    { code: 'DE', name: 'Germania', isEU: true, languages: ['de'] },
    { code: 'GR', name: 'Grecia', isEU: true, languages: [] },
    { code: 'HU', name: 'Ungheria', isEU: true, languages: [] },
    { code: 'IE', name: 'Irlanda', isEU: true, languages: ['en'] },
    { code: 'IT', name: 'Italia', isEU: true, languages: ['it'] },
    { code: 'LV', name: 'Lettonia', isEU: true, languages: [] },
    { code: 'LT', name: 'Lituania', isEU: true, languages: [] },
    { code: 'LU', name: 'Lussemburgo', isEU: true, languages: ['fr', 'de'] },
    { code: 'MT', name: 'Malta', isEU: true, languages: ['en'] },
    { code: 'NL', name: 'Paesi Bassi', isEU: true, languages: [] },
    { code: 'PL', name: 'Polonia', isEU: true, languages: [] },
    { code: 'PT', name: 'Portogallo', isEU: true, languages: [] },
    { code: 'RO', name: 'Romania', isEU: true, languages: [] },
    { code: 'SK', name: 'Slovacchia', isEU: true, languages: [] },
    { code: 'SI', name: 'Slovenia', isEU: true, languages: [] },
    { code: 'ES', name: 'Spagna', isEU: true, languages: ['es'] },
    { code: 'SE', name: 'Svezia', isEU: true, languages: [] },

    // Altri paesi europei (non-EU)
    { code: 'GB', name: 'Regno Unito', isEU: false, languages: ['en'] },
    { code: 'CH', name: 'Svizzera', isEU: false, languages: ['de', 'fr', 'it'] },
    { code: 'NO', name: 'Norvegia', isEU: false, languages: [] },
    { code: 'IS', name: 'Islanda', isEU: false, languages: [] },
    { code: 'RS', name: 'Serbia', isEU: false, languages: [] },
    { code: 'UA', name: 'Ucraina', isEU: false, languages: [] },
    { code: 'TR', name: 'Turchia', isEU: false, languages: [] },
    { code: 'AL', name: 'Albania', isEU: false, languages: [] },
    { code: 'BA', name: 'Bosnia ed Erzegovina', isEU: false, languages: [] },
    { code: 'MK', name: 'Macedonia del Nord', isEU: false, languages: [] },
    { code: 'ME', name: 'Montenegro', isEU: false, languages: [] },
    { code: 'XK', name: 'Kosovo', isEU: false, languages: [] },
    { code: 'BY', name: 'Bielorussia', isEU: false, languages: [] },
    { code: 'MD', name: 'Moldavia', isEU: false, languages: [] },
    { code: 'RU', name: 'Russia', isEU: false, languages: [] },

    // Principali paesi mondiali
    { code: 'US', name: 'Stati Uniti', isEU: false, languages: ['en'] },
    { code: 'CA', name: 'Canada', isEU: false, languages: ['en', 'fr'] },
    { code: 'MX', name: 'Messico', isEU: false, languages: ['es'] },
    { code: 'BR', name: 'Brasile', isEU: false, languages: [] },
    { code: 'AR', name: 'Argentina', isEU: false, languages: ['es'] },
    { code: 'CN', name: 'Cina', isEU: false, languages: [] },
    { code: 'JP', name: 'Giappone', isEU: false, languages: [] },
    { code: 'KR', name: 'Corea del Sud', isEU: false, languages: [] },
    { code: 'IN', name: 'India', isEU: false, languages: ['en'] },
    { code: 'AU', name: 'Australia', isEU: false, languages: ['en'] },
    { code: 'NZ', name: 'Nuova Zelanda', isEU: false, languages: ['en'] },
    { code: 'ZA', name: 'Sudafrica', isEU: false, languages: ['en'] },
    { code: 'EG', name: 'Egitto', isEU: false, languages: [] },
    { code: 'SA', name: 'Arabia Saudita', isEU: false, languages: [] },
    { code: 'AE', name: 'Emirati Arabi Uniti', isEU: false, languages: ['en'] },
    { code: 'SG', name: 'Singapore', isEU: false, languages: ['en'] },
    { code: 'TH', name: 'Thailandia', isEU: false, languages: [] },
    { code: 'ID', name: 'Indonesia', isEU: false, languages: [] },
    { code: 'MY', name: 'Malaysia', isEU: false, languages: ['en'] },
    { code: 'PH', name: 'Filippine', isEU: false, languages: ['en'] },
    { code: 'VN', name: 'Vietnam', isEU: false, languages: [] },
  ];

  // Recupera le lingue disponibili dal database
  const availableLanguages = await prisma.language.findMany({
    select: { iso_code: true }
  });
  const availableIsoCodes = new Set(availableLanguages.map(l => l.iso_code));

  for (const country of countriesData) {
    // Filtra solo le lingue che esistono nel database
    const validLanguages = country.languages.filter(iso => availableIsoCodes.has(iso));

    await prisma.country.create({
      data: {
        code: country.code,
        name: country.name,
        isEU: country.isEU,
        languages: validLanguages.length > 0 ? {
          connect: validLanguages.map(iso => ({ iso_code: iso })),
        } : undefined,
      },
    });
  }

  console.log(`✅ Creati ${countriesData.length} paesi`);
  console.log(`   - ${countriesData.filter(c => c.isEU).length} paesi EU`);
  console.log(`   - ${countriesData.filter(c => !c.isEU).length} paesi extra-EU`);
  console.log('🎉 Seeding Country completato!');
}

main()
  .catch((e) => {
    console.error('❌ Errore durante il seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
