// packages/backend/prisma/seeds/vatNatures.seed.ts

import { prisma } from '@/config/prisma-config';
import { VatNatureCategory } from '@/generated/prisma/enums';

const vatNatures = [
  // ========================================
  // N1 - ESCLUSE
  // ========================================
  {
    code: 'N1',
    category: 'EXCLUDED' as VatNatureCategory,
    description: 'Operazioni escluse ex art. 15 DPR 633/72',
    extendedDescription: 'Operazioni fuori campo IVA per carenza del presupposto oggettivo (es. cessioni gratuite, cessioni di azienda, etc.)',
    legalReference: 'art. 15 DPR 633/72',
    applicableToEntityTypes: null,
    validForSales: true,
    validForPurchases: false,
    vatReturnLine: 'VE38',
    requiresNormReference: true,
    usageExamples: 'Cessioni gratuite di beni, cessioni di azienda, prestazioni non a titolo oneroso',
    operationalNotes: 'Utilizzare quando l\'operazione è esclusa dal campo di applicazione dell\'IVA',
    active: true,
    displayOrder: 1
  },

  // ========================================
  // N2.x - NON SOGGETTE
  // ========================================
  {
    code: 'N2.1',
    category: 'NOT_SUBJECT' as VatNatureCategory,
    description: 'Non soggette ad IVA ai sensi degli artt. da 7 a 7-septies del DPR 633/72',
    extendedDescription: 'Operazioni non soggette per mancanza del requisito territoriale',
    legalReference: 'artt. 7-7septies DPR 633/72',
    applicableToEntityTypes: null,
    validForSales: true,
    validForPurchases: false,
    vatReturnLine: 'VE38',
    requiresNormReference: true,
    usageExamples: 'Servizi resi/ricevuti fuori dall\'UE, cessioni di beni in transito',
    operationalNotes: 'Operazioni con controparti extra-UE senza territorialità italiana',
    active: true,
    displayOrder: 2
  },
  {
    code: 'N2.2',
    category: 'NOT_SUBJECT' as VatNatureCategory,
    description: 'Non soggette - altri casi',
    extendedDescription: 'Operazioni non soggette per altre ragioni (es. regime forfettario, regime dei minimi)',
    legalReference: 'L. 190/2014 (forfettari) - L. 244/2007 (minimi)',
    applicableToEntityTypes: 'B,A',
    validForSales: true,
    validForPurchases: false,
    vatReturnLine: 'VE38',
    requiresNormReference: true,
    usageExamples: 'Fatture emesse da contribuenti in regime forfettario o regime dei minimi',
    operationalNotes: 'Codice più utilizzato per forfettari. Indicare sempre riferimento normativo',
    active: true,
    displayOrder: 3
  },

  // ========================================
  // N3.x - NON IMPONIBILI
  // ========================================
  {
    code: 'N3.1',
    category: 'NOT_TAXABLE' as VatNatureCategory,
    description: 'Non imponibili - esportazioni',
    extendedDescription: 'Cessioni all\'esportazione (vendite fuori UE)',
    legalReference: 'art. 8, c. 1 lett. a) e b) DPR 633/72',
    applicableToEntityTypes: null,
    validForSales: true,
    validForPurchases: false,
    vatReturnLine: 'VE30',
    requiresNormReference: true,
    usageExamples: 'Vendita di beni con destinazione extra-UE con prova documentale',
    operationalNotes: 'Necessaria documentazione doganale (bolle export, CMR internazionale)',
    active: true,
    displayOrder: 4
  },
  {
    code: 'N3.2',
    category: 'NOT_TAXABLE' as VatNatureCategory,
    description: 'Non imponibili - cessioni intracomunitarie',
    extendedDescription: 'Cessioni di beni verso soggetti passivi IVA UE',
    legalReference: 'art. 41 DL 331/93',
    applicableToEntityTypes: null,
    validForSales: true,
    validForPurchases: false,
    vatReturnLine: 'VE31',
    requiresNormReference: true,
    usageExamples: 'Vendita a cliente business con VIES valida in altro Paese UE',
    operationalNotes: 'Verificare validità VIES controparte. Emettere modello INTRASTAT se supera soglia',
    active: true,
    displayOrder: 5
  },
  {
    code: 'N3.3',
    category: 'NOT_TAXABLE' as VatNatureCategory,
    description: 'Non imponibili - cessioni verso San Marino',
    extendedDescription: 'Cessioni di beni destinati alla Repubblica di San Marino',
    legalReference: 'art. 71 DPR 633/72',
    applicableToEntityTypes: null,
    validForSales: true,
    validForPurchases: false,
    vatReturnLine: 'VE32',
    requiresNormReference: true,
    usageExamples: 'Vendite a soggetti sammarinesi con operatore economico registrato',
    operationalNotes: 'Richiesto bollettario di cauzione doganale o dichiarazione importatore SM',
    active: true,
    displayOrder: 6
  },
  {
    code: 'N3.4',
    category: 'NOT_TAXABLE' as VatNatureCategory,
    description: 'Non imponibili - operazioni assimilate alle cessioni all\'esportazione',
    extendedDescription: 'Operazioni con enti internazionali, ambasciate, forze NATO, etc.',
    legalReference: 'art. 8, c. 1 lett. c) DPR 633/72',
    applicableToEntityTypes: null,
    validForSales: true,
    validForPurchases: false,
    vatReturnLine: 'VE33',
    requiresNormReference: true,
    usageExamples: 'Vendite a ambasciate, ONU, NATO, Vaticano con esenzione diplomatica',
    operationalNotes: 'Necessario visto doganale su fattura',
    active: true,
    displayOrder: 7
  },
  {
    code: 'N3.5',
    category: 'NOT_TAXABLE' as VatNatureCategory,
    description: 'Non imponibili - a seguito di dichiarazioni d\'intento',
    extendedDescription: 'Cessioni/prestazioni a esportatori abituali con plafond',
    legalReference: 'art. 8, c. 1 lett. c) DPR 633/72',
    applicableToEntityTypes: null,
    validForSales: true,
    validForPurchases: false,
    vatReturnLine: 'VE31',
    requiresNormReference: true,
    usageExamples: 'Vendite a cliente esportatore abituale che ha inviato lettera d\'intento valida',
    operationalNotes: 'Verificare protocollo telematico dichiarazione d\'intento su portale AdE',
    active: true,
    displayOrder: 8
  },
  {
    code: 'N3.6',
    category: 'NOT_TAXABLE' as VatNatureCategory,
    description: 'Non imponibili - altre operazioni che non concorrono alla formazione del plafond',
    extendedDescription: 'Operazioni non imponibili diverse dalle precedenti',
    legalReference: 'art. 9 DPR 633/72',
    applicableToEntityTypes: null,
    validForSales: true,
    validForPurchases: false,
    vatReturnLine: 'VE34',
    requiresNormReference: true,
    usageExamples: 'Servizi internazionali, trasporti internazionali, operazioni triangolari',
    operationalNotes: 'Categoria residuale per operazioni non imponibili non classificabili altrove',
    active: true,
    displayOrder: 9
  },

  // ========================================
  // N4 - ESENTI
  // ========================================
  {
    code: 'N4',
    category: 'EXEMPT' as VatNatureCategory,
    description: 'Operazioni esenti',
    extendedDescription: 'Operazioni esenti da IVA per legge (sanitarie, educative, finanziarie, etc.)',
    legalReference: 'art. 10 DPR 633/72',
    applicableToEntityTypes: null,
    validForSales: true,
    validForPurchases: false,
    vatReturnLine: 'VE35',
    requiresNormReference: true,
    usageExamples: 'Prestazioni sanitarie, formazione, assicurazioni, operazioni bancarie/finanziarie',
    operationalNotes: 'IVA non detraibile a monte per fornitore. Specificare comma art. 10 applicabile',
    active: true,
    displayOrder: 10
  },

  // ========================================
  // N5 - REGIME DEL MARGINE
  // ========================================
  {
    code: 'N5',
    category: 'MARGIN' as VatNatureCategory,
    description: 'Regime del margine / IVA non esposta in fattura',
    extendedDescription: 'Applicazione IVA sul margine (beni usati, oggetti d\'arte, antiquariato, agenzie viaggio)',
    legalReference: 'art. 36 e 74-ter DPR 633/72',
    applicableToEntityTypes: null,
    validForSales: true,
    validForPurchases: false,
    vatReturnLine: null,
    requiresNormReference: false,
    usageExamples: 'Vendita auto usate, oggetti antiquariato, pacchetti turistici',
    operationalNotes: 'IVA calcolata sul margine, non esposta in fattura al cliente',
    active: true,
    displayOrder: 11
  },

  // ========================================
  // N6.x - REVERSE CHARGE (INVERSIONE CONTABILE)
  // ========================================
  {
    code: 'N6.1',
    category: 'REVERSE' as VatNatureCategory,
    description: 'Inversione contabile - cessione di rottami e altri materiali di recupero',
    extendedDescription: 'Reverse charge su rottami metallici e materiali di recupero',
    legalReference: 'art. 74, c. 7 e 8 DPR 633/72',
    applicableToEntityTypes: null,
    validForSales: true,
    validForPurchases: true,
    vatReturnLine: 'VE36',
    requiresNormReference: true,
    usageExamples: 'Vendita rottami ferrosi, non ferrosi, carta da macero, vetro',
    operationalNotes: 'IVA a carico del cessionario. Fornitore emette fattura senza IVA',
    active: true,
    displayOrder: 12
  },
  {
    code: 'N6.2',
    category: 'REVERSE' as VatNatureCategory,
    description: 'Inversione contabile - cessione di oro e argento puro',
    extendedDescription: 'Reverse charge su oro da investimento e argento puro',
    legalReference: 'art. 74, c. 7 e 8 DPR 633/72',
    applicableToEntityTypes: null,
    validForSales: true,
    validForPurchases: true,
    vatReturnLine: 'VE36',
    requiresNormReference: true,
    usageExamples: 'Cessioni di oro da investimento purezza >= 995‰, argento purezza >= 999‰',
    operationalNotes: 'Applicabile solo per metalli puri sopra specifiche purezze',
    active: true,
    displayOrder: 13
  },
  {
    code: 'N6.3',
    category: 'REVERSE' as VatNatureCategory,
    description: 'Inversione contabile - subappalto nel settore edile',
    extendedDescription: 'Reverse charge per prestazioni di subappalto in edilizia',
    legalReference: 'art. 17, c. 6 lett. a) DPR 633/72',
    applicableToEntityTypes: null,
    validForSales: true,
    validForPurchases: true,
    vatReturnLine: 'VE36',
    requiresNormReference: true,
    usageExamples: 'Prestazioni di subappalto costruzione/ristrutturazione edifici',
    operationalNotes: 'Applicabile solo tra soggetti passivi IVA in ambito subappalto edilizio',
    active: true,
    displayOrder: 14
  },
  {
    code: 'N6.4',
    category: 'REVERSE' as VatNatureCategory,
    description: 'Inversione contabile - cessione di fabbricati',
    extendedDescription: 'Reverse charge su cessioni di fabbricati strumentali',
    legalReference: 'art. 17, c. 6 lett. a-bis) DPR 633/72',
    applicableToEntityTypes: null,
    validForSales: true,
    validForPurchases: true,
    vatReturnLine: 'VE36',
    requiresNormReference: true,
    usageExamples: 'Vendita fabbricati strumentali tra soggetti IVA entro 5 anni da ultimazione',
    operationalNotes: 'Solo per fabbricati a destinazione abitativa entro 5 anni o opzione per imponibilità',
    active: true,
    displayOrder: 15
  },
  {
    code: 'N6.5',
    category: 'REVERSE' as VatNatureCategory,
    description: 'Inversione contabile - cessione di telefoni cellulari',
    extendedDescription: 'Reverse charge su cessioni di telefoni cellulari',
    legalReference: 'art. 17, c. 6 lett. b) DPR 633/72',
    applicableToEntityTypes: null,
    validForSales: true,
    validForPurchases: true,
    vatReturnLine: 'VE36',
    requiresNormReference: true,
    usageExamples: 'Cessioni tra operatori commerciali di cellulari, smartphone, tablet',
    operationalNotes: 'Applicabile cessioni tra soggetti passivi IVA',
    active: true,
    displayOrder: 16
  },
  {
    code: 'N6.6',
    category: 'REVERSE' as VatNatureCategory,
    description: 'Inversione contabile - cessione di prodotti elettronici',
    extendedDescription: 'Reverse charge su cessioni di console, laptop e altri dispositivi elettronici',
    legalReference: 'art. 17, c. 6 lett. b) DPR 633/72',
    applicableToEntityTypes: null,
    validForSales: true,
    validForPurchases: true,
    vatReturnLine: 'VE36',
    requiresNormReference: true,
    usageExamples: 'Console da gioco, laptop, tablet PC',
    operationalNotes: 'Limitato a specifiche categorie merceologiche previste dalla norma',
    active: true,
    displayOrder: 17
  },
  {
    code: 'N6.7',
    category: 'REVERSE' as VatNatureCategory,
    description: 'Inversione contabile - prestazioni comparto edile e settori connessi',
    extendedDescription: 'Reverse charge per prestazioni di servizi nel settore edile',
    legalReference: 'art. 17, c. 6 lett. a-ter) DPR 633/72',
    applicableToEntityTypes: null,
    validForSales: true,
    validForPurchases: true,
    vatReturnLine: 'VE36',
    requiresNormReference: true,
    usageExamples: 'Prestazioni di pulizia, demolizione, installazioni impianti, completamento edifici',
    operationalNotes: 'Ampia casistica servizi edili. Consultare elenco codici ATECO applicabili',
    active: true,
    displayOrder: 18
  },
  {
    code: 'N6.8',
    category: 'REVERSE' as VatNatureCategory,
    description: 'Inversione contabile - operazioni settore energetico',
    extendedDescription: 'Reverse charge su cessioni di gas ed energia elettrica',
    legalReference: 'art. 17, c. 6 lett. a-quinquies) DPR 633/72',
    applicableToEntityTypes: null,
    validForSales: true,
    validForPurchases: true,
    vatReturnLine: 'VE36',
    requiresNormReference: true,
    usageExamples: 'Cessioni gas metano, energia elettrica tra operatori del settore',
    operationalNotes: 'Solo tra soggetti passivi IVA con specifica abilitazione settore energetico',
    active: true,
    displayOrder: 19
  },
  {
    code: 'N6.9',
    category: 'REVERSE' as VatNatureCategory,
    description: 'Inversione contabile - altri casi',
    extendedDescription: 'Reverse charge per altri casi previsti dalla normativa',
    legalReference: 'art. 17, c. 6 DPR 633/72',
    applicableToEntityTypes: null,
    validForSales: true,
    validForPurchases: true,
    vatReturnLine: 'VE36',
    requiresNormReference: true,
    usageExamples: 'Trasferimenti quote gas serra, certificati energetici, altri casi specifici',
    operationalNotes: 'Categoria residuale per casi non rientranti nelle altre fattispecie N6.x',
    active: true,
    displayOrder: 20
  },

  // ========================================
  // N7 - IVA ALTRO STATO UE
  // ========================================
  {
    code: 'N7',
    category: 'EU_VAT' as VatNatureCategory,
    description: 'IVA assolta in altro stato UE',
    extendedDescription: 'Vendite a distanza o servizi digitali con IVA assolta nello Stato membro del cliente',
    legalReference: 'art. 7-octies lett. a) e art. 74-sexies DPR 633/72',
    applicableToEntityTypes: null,
    validForSales: true,
    validForPurchases: false,
    vatReturnLine: null,
    requiresNormReference: false,
    usageExamples: 'E-commerce B2C verso privati UE, servizi digitali/telecom via OSS',
    operationalNotes: 'Utilizzare per regime speciale OSS (One Stop Shop). IVA versata nel paese del cliente',
    active: true,
    displayOrder: 21
  },

  // ========================================
  // CODICI LEGACY (deprecati dal 01/01/2021)
  // ========================================
  {
    code: 'N2',
    category: 'NOT_SUBJECT' as VatNatureCategory,
    description: '[DEPRECATO] Non soggette',
    extendedDescription: 'Codice generico sostituito da N2.1 e N2.2 dal 01/01/2021',
    legalReference: null,
    applicableToEntityTypes: null,
    validForSales: false,
    validForPurchases: false,
    vatReturnLine: null,
    requiresNormReference: false,
    usageExamples: null,
    operationalNotes: 'NON PIÙ UTILIZZABILE - Sostituito da N2.1 o N2.2',
    active: false,
    validFrom: new Date('2017-07-01'),
    validTo: new Date('2020-12-31'),
    replacedByCode: 'N2.1',
    displayOrder: 99
  },
  {
    code: 'N3',
    category: 'NOT_TAXABLE' as VatNatureCategory,
    description: '[DEPRECATO] Non imponibili',
    extendedDescription: 'Codice generico sostituito da N3.1-N3.6 dal 01/01/2021',
    legalReference: null,
    applicableToEntityTypes: null,
    validForSales: false,
    validForPurchases: false,
    vatReturnLine: null,
    requiresNormReference: false,
    usageExamples: null,
    operationalNotes: 'NON PIÙ UTILIZZABILE - Sostituire con N3.1, N3.2, N3.3, N3.4, N3.5 o N3.6',
    active: false,
    validFrom: new Date('2017-07-01'),
    validTo: new Date('2020-12-31'),
    replacedByCode: 'N3.1',
    displayOrder: 100
  },
  {
    code: 'N6',
    category: 'REVERSE' as VatNatureCategory,
    description: '[DEPRECATO] Inversione contabile',
    extendedDescription: 'Codice generico sostituito da N6.1-N6.9 dal 01/01/2021',
    legalReference: null,
    applicableToEntityTypes: null,
    validForSales: false,
    validForPurchases: false,
    vatReturnLine: null,
    requiresNormReference: false,
    usageExamples: null,
    operationalNotes: 'NON PIÙ UTILIZZABILE - Specificare con N6.1-N6.9 il tipo di reverse charge',
    active: false,
    validFrom: new Date('2017-07-01'),
    validTo: new Date('2020-12-31'),
    replacedByCode: 'N6.9',
    displayOrder: 101
  }
];

async function seedVatNatures() {
  console.log('🌱 Seeding VAT Natures...');

  for (const nature of vatNatures) {
    await prisma.vatNature.upsert({
      where: { code: nature.code },
      update: nature,
      create: nature
    });
  }

  console.log(`✅ Seeded ${vatNatures.length} VAT Nature codes`);
}

seedVatNatures()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export default seedVatNatures;
