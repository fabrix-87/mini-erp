# Guide: Gestione Regole IVA (TaxRule)

## Panoramica

Il sistema fiscale del CRM/ERP si basa su un'architettura **semplificata** con solo due entità:

- **TaxRule**: Regola fiscale con aliquota fissa per un paese specifico
- **VatNature**: Codici natura IVA per fatturazione elettronica italiana (opzionali)

Questa struttura copre **tutti i casi d'uso** IVA italiani ed europei senza complessità inutili.

---

## TaxRule: Regola Fiscale Base

### Concetto

Ogni `TaxRule` rappresenta una singola aliquota IVA applicabile in un paese:

```

TaxRule "IVA_22" (Italia)
├─ rate: 22.00%
├─ countryCode: "IT"
└─ vatNatureCode: null (imponibile standard)

TaxRule "IVA_10_FOOD" (Italia)
├─ rate: 10.00%
├─ countryCode: "IT"
└─ vatNatureCode: null (imponibile ridotto)

TaxRule "IVA_EXP_EU" (Italia)
├─ rate: 0.00%
├─ countryCode: "IT"
└─ vatNatureCode: "N3.1" (cessione intracomunitaria)

```

### Campi

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `code` | String(50) | Codice univoco (es. `IVA_22`, `IVA_10_FOOD`) |
| `name` | String(100) | Nome leggibile (es. "IVA ordinaria 22%") |
| `rate` | Decimal(5,2) | Aliquota IVA (22.00, 10.00, 4.00, 0.00) |
| `countryCode` | Char(2) | Paese ISO 2 (IT, FR, DE) |
| `vatNatureCode` | String(10)? | Codice natura IVA (opzionale, solo per casi speciali) |
| `active` | Boolean | Se attiva (default: true) |

### Quando Usare TaxRule

1. **Prodotto standard imponibile**: Collegare il prodotto a `TaxRule` con `rate` appropriato e `vatNatureCode: null`
2. **Prodotto con aliquota ridotta**: Usare `TaxRule` con `rate: 10.00` o `4.00`
3. **Operazione non imponibile**: Usare `TaxRule` con `rate: 0.00` + `vatNatureCode` appropriato (es. `N3.1`)

---

## VatNature: Codici Natura IVA

### Concetto

I codici `VatNature` sono **richiesti dalla fattura elettronica italiana** per specificare la ragione di operazioni non imponibili o esenti.

**Regola d'oro**: Se `rate = 0`, probabilmente serve un `vatNatureCode`.

### Codici Principali

| Codice | Descrizione | Quando Usare |
|--------|-------------|--------------|
| `N1` | Esclusione ex art. 15 | Operazioni fuori campo IVA |
| `N2.1` | Non soggette (altri casi) | Operazioni fuori UE art. 7-ter |
| `N2.2` | Non soggette (altri casi) | Regime del margine, agenzie viaggio |
| `N3.1` | Non imponibili - esportazioni | Cessioni intracomunitarie |
| `N3.2` | Non imponibili - cessioni intracomunitarie | Cessioni verso San Marino |
| `N3.3` | Non imponibili - cessioni verso San Marino | Operazioni con non residenti |
| `N3.4` | Non imponibili - operazioni assimilate | Esportazioni triangolari |
| `N3.5` | Non imponibili - seguito dichiarazione intento | A seguito dichiarazione d'intento |
| `N3.6` | Non imponibili - altre operazioni | Altri casi non imponibili |
| `N4` | Esenti | Esenzioni art. 10 (sanitarie, educative) |
| `N5` | Regime del margine | Beni usati, agenzie viaggio |
| `N6.1` | Inversione contabile - cessione rottami | Cessione rottami/materiali recupero |
| `N6.2` | Inversione contabile - cessione oro/argento | Oro e argento puro |
| `N6.3` | Inversione contabile - subappalto edilizia | Subappalto settore edile |
| `N6.4` | Inversione contabile - cessione fabbricati | Cessione fabbricati |
| `N6.5` | Inversione contabile - cessione telefoni/chip | Telefoni cellulari/tablet |
| `N6.6` | Inversione contabile - cessione console videogame | Console, laptop, tablet |
| `N6.7` | Inversione contabile - prestazioni settore edile | Prestazioni edili pure |
| `N6.8` | Inversione contabile - energia/gas | Settore energetico |
| `N6.9` | Inversione contabile - altri casi | Altri casi reverse charge |
| `N7` | IVA assolta in altro Stato UE | Vendite a distanza |

### Quando NON Serve VatNature

- Operazioni **imponibili standard** (rate 22%, 10%, 4%): `vatNatureCode = null`
- Prodotti normali con IVA: Non specificare natura

### Quando Serve VatNature

- Operazioni con **rate = 0%** (esportazioni, intracomunitarie, esenti)
- Operazioni in **reverse charge** (inversione contabile)
- Vendite **fuori campo IVA**

---

## Esempi Pratici

### 1. Prodotto Standard (IVA 22%)

```typescript
await prisma.taxRule.create({
  data: {
    code: 'IVA_22',
    name: 'IVA ordinaria 22%',
    rate: 22.00,
    countryCode: 'IT',
    vatNatureCode: null, // ✅ Operazione imponibile normale
    active: true,
  },
});

await prisma.product.create({
  data: {
    reference: 'PROD-001',
    defaultTaxRuleId: taxRuleIVA22.id, // ✅ Collegamento diretto
    // ...
  },
});
```


### 2. Alimentari (IVA 10%)

```typescript
await prisma.taxRule.create({
  data: {
    code: 'IVA_10_FOOD',
    name: 'IVA ridotta alimentari 10%',
    rate: 10.00,
    countryCode: 'IT',
    vatNatureCode: null, // ✅ Imponibile ridotto
    active: true,
  },
});
```


### 3. Cessione Intracomunitaria (0% + N3.1)

```typescript
await prisma.taxRule.create({
  data: {
    code: 'IVA_EXP_EU',
    name: 'Cessione intracomunitaria',
    rate: 0.00,
    countryCode: 'IT',
    vatNatureCode: 'N3.1', // ✅ Non imponibile art. 41 DL 331/93
    active: true,
  },
});
```


### 4. Reverse Charge Edilizia (0% + N6.7)

```typescript
await prisma.taxRule.create({
  data: {
    code: 'IVA_RC_EDILIZIA',
    name: 'Inversione contabile edilizia',
    rate: 0.00,
    countryCode: 'IT',
    vatNatureCode: 'N6.7', // ✅ Reverse charge prestazioni edili
    active: true,
  },
});
```


### 5. Esportazione Extra-UE (0% + N3.1)

```typescript
await prisma.taxRule.create({
  data: {
    code: 'IVA_EXP_EXTRA',
    name: 'Esportazione extra-UE',
    rate: 0.00,
    countryCode: 'IT',
    vatNatureCode: 'N3.1', // ✅ Non imponibile esportazioni
    active: true,
  },
});
```


---

## Flusso di Applicazione IVA

### 1. Su Prodotto (Default)

Il prodotto ha un `defaultTaxRuleId`:

```typescript
const product = await prisma.product.findUnique({
  where: { id: productId },
  include: { defaultTaxRule: true },
});

// Usa product.defaultTaxRule.rate
```


### 2. Su Riga Documento (Override)

La riga documento può sovrascrivere la regola fiscale:

```typescript
await prisma.documentLine.create({
  data: {
    documentId: doc.id,
    productId: product.id,
    taxRuleId: overrideTaxRule.id, // ✅ Override per questa riga
    quantity: 10,
    unitPrice: 100,
    // taxAmount viene calcolato automaticamente
  },
});
```


### 3. Calcolo IVA

```typescript
// Pseudo-codice calcolo
const netAmount = quantity * unitPrice;
const taxRate = taxRule.rate / 100;
const taxAmount = netAmount * taxRate;
const grossAmount = netAmount + taxAmount;
```


---

## Best Practices

### ✅ DO

- **Una regola, un'aliquota**: Creare regole separate per ogni combinazione paese + aliquota
- **Nomenclatura chiara**: Usare codici descrittivi (`IVA_22`, `IVA_10_FOOD`)
- **VatNature solo se necessario**: Lasciare `null` per operazioni imponibili
- **Paese specifico**: Ogni regola è per UN solo paese


### ❌ DON'T

- **Non creare regole complesse**: No "IVA variabile 10-22%"
- **Non riusare regole tra paesi**: Italia e Francia hanno regole separate
- **Non dimenticare VatNature**: Se `rate = 0`, probabilmente serve un codice natura
- **Non duplicare codici**: Ogni `code` è univoco globalmente

---

## FAQ

**Q: Posso avere più aliquote in una TaxRule?**
A: No. Una `TaxRule` = un'aliquota fissa. Creare regole separate per 22%, 10%, 4%.

**Q: Come gestisco IVA per clienti UE/Extra-UE?**
A: Creare regole con `rate: 0.00` + `vatNatureCode` appropriato (es. `N3.1` per intra-UE).

**Q: VatNature è obbligatorio?**
A: No. Solo per operazioni **non imponibili/esenti/reverse charge**. Per IVA normale (22%, 10%), lasciare `null`.

**Q: Come gestisco reverse charge?**
A: Regola con `rate: 0.00` + `vatNatureCode: N6.*` (es. `N6.7` per edilizia).

**Q: Posso cambiare rate di una TaxRule?**
A: Sì, ma meglio creare nuova regola e disattivare la vecchia (`active: false`) per mantenere storico.

---

## Riferimenti

- [Agenzia delle Entrate - Codici Natura IVA](https://www.agenziaentrate.gov.it)
- [Fattura Elettronica - Specifiche Tecniche](https://www.fatturapa.gov.it/export/documenti/fatturapa/v1.2.2/Rappresentazione_tabellare_del_tracciato_FatturaPA_versione_1.2.2.pdf)
- Schema Prisma: `packages/backend/prisma/schema/tax.prisma`