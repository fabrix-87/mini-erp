# Architecture: Tax Engine

## Overview

Il **Tax Engine** del CRM/ERP gestisce il calcolo e l'applicazione dell'IVA attraverso un'architettura semplificata basata su due entità principali:

1. **TaxRule**: Regola fiscale con aliquota fissa per paese
2. **VatNature**: Codici natura IVA per fatturazione elettronica italiana

Questa architettura elimina la complessità di sistemi multi-livello (zone, classi, range) mantenendo piena copertura di tutti i casi d'uso IVA italiani ed europei.

---

## Design Principles

### 1. **Semplicità > Complessità**

❌ **Evitato**:
```

TaxRule
├─ TaxZone (EU, Extra-EU, Domestic)
│   └─ TaxClass (Standard, Reduced, Zero)
│       └─ TaxRate (22%, 10%, 4%)
│           └─ DateRange (dal/al)

```

✅ **Adottato**:
```

TaxRule (IVA_22, IT, 22%)
TaxRule (IVA_10_FOOD, IT, 10%)
TaxRule (IVA_EXP_EU, IT, 0%, N3.1)

```

**Rationale**: 
- 95% dei casi usa aliquota fissa per paese
- Complessità zone/classi aggiunge overhead senza vantaggi reali
- Più facile da debuggare, testare, manutenere

### 2. **One Rate, One Rule**

Ogni `TaxRule` ha un'aliquota IVA fissa (`rate`). Non esistono regole "variabili".

**Vantaggi**:
- Query semplici: `SELECT rate FROM TaxRule WHERE id = ?`
- Zero ambiguità: Una regola = un comportamento
- Storicizzazione facile: Disattivare vecchia regola, crearne nuova

### 3. **Country-Specific**

Ogni `TaxRule` è legata a UN paese (`countryCode`). No regole "globali" o "multi-paese".

**Vantaggi**:
- Conformità locale garantita
- Norme fiscali per paese separate
- Facile espansione internazionale

### 4. **VatNature Optional**

`vatNatureCode` è `NULL` per operazioni imponibili standard. Si valorizza **solo** per:
- Operazioni non imponibili (esportazioni, intra-UE)
- Esenzioni IVA
- Reverse charge

**Vantaggi**:
- 80% delle righe non ha natura IVA → DB più leggero
- FE italiana coperta al 100%
- Facile validazione: `rate = 0 AND vatNatureCode IS NULL` → Warning

---

## Data Model

### Entity Relationship Diagram

```

┌─────────────┐         ┌──────────────┐
│   Country   │────────▶│   TaxRule    │
│  (IT, FR)   │  1:N    │ (IVA_22, 22%)│
└─────────────┘         └──────┬───────┘
│ N:1
│
┌──────▼───────┐
│  VatNature   │
│ (N3.1, N6.7) │
└──────────────┘
▲
│ 1:N
┌──────────────┴────────────┐
│                           │
┌──────▼─────┐            ┌───────▼──────┐
│  Product   │            │ DocumentLine │
│(defaultTax)│            │  (taxRule)   │
└────────────┘            └──────────────┘

```

### Schema Prisma

```prisma
model TaxRule {
  id   Int    @id @default(autoincrement())
  code String @unique @db.VarChar(50)
  name String @db.VarChar(100)

  // Core tax data
  rate          Decimal @db.Decimal(5, 2) // 22.00, 10.00, 4.00, 0.00
  countryCode   String  @db.Char(2)
  vatNatureCode String? @db.VarChar(10)

  // Relations
  country   Country    @relation(fields: [countryCode], references: [code])
  vatNature VatNature? @relation(fields: [vatNatureCode], references: [code])

  products      Product[]
  documentLines DocumentLine[]

  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([countryCode])
  @@index([vatNatureCode])
  @@index([active])
}

model VatNature {
  code        String  @id @db.VarChar(10) // "N1", "N3.1", "N6.7"
  description String  @db.VarChar(255)
  isExempt    Boolean @default(false)
  requiresRef Boolean @default(false)

  taxRules TaxRule[]

  @@index([isExempt])
}
```


---

## Tax Calculation Flow

### 1. Product-Level Default

Ogni prodotto ha una `defaultTaxRule`:

```typescript
const product = await prisma.product.findUnique({
  where: { id: productId },
  include: { defaultTaxRule: true },
});

// product.defaultTaxRule.rate → 22.00
// product.defaultTaxRule.vatNatureCode → null
```


### 2. Document Line Override

La riga documento può sovrascrivere la regola fiscale:

```typescript
await prisma.documentLine.create({
  data: {
    documentId: invoice.id,
    productId: product.id,
    taxRuleId: specialTaxRule.id, // ✅ Override per questa vendita
    quantity: 10,
    unitPrice: 100.00,
    // Calcolo automatico:
    // netAmount = 1000.00
    // taxAmount = 1000.00 * 0.22 = 220.00
    // grossAmount = 1220.00
  },
});
```


### 3. Tax Calculation Algorithm

```typescript
// shared/types/money.ts
import Decimal from "decimal.js";
export type Money = Decimal;

// shared/types/tax.ts

interface TaxCalculationInput {
  netAmount: Decimal;
  taxRule: TaxRule;
}

interface TaxCalculationResult {
  netAmount: Decimal;
  taxRate: Decimal;
  taxAmount: Decimal;
  grossAmount: Decimal;
  vatNatureCode: string | null;
}

// shared/services/tax/tax-calculator.ts
function calculateTax(input: TaxCalculationInput): TaxCalculationResult {
  const { netAmount, taxRule } = input;
  
  const taxRate = taxRule.rate; // 22.00
  const taxAmount = netAmount.mul(taxRate).div(100); // netAmount * 22 / 100
  const grossAmount = netAmount.add(taxAmount);

  return {
    netAmount,
    taxRate,
    taxAmount,
    grossAmount,
    vatNatureCode: taxRule.vatNatureCode,
  };
}
```


### 4. Document Totals Aggregation

```typescript
// Calcolo totali documento
const lines = await prisma.documentLine.findMany({
  where: { documentId: doc.id },
  include: { taxRule: true },
});

let totalNet = new Decimal(0);
let totalTax = new Decimal(0);

for (const line of lines) {
  const lineNet = line.quantity.mul(line.unitPrice);
  const lineTax = lineNet.mul(line.taxRule.rate).div(100);
  
  totalNet = totalNet.add(lineNet);
  totalTax = totalTax.add(lineTax);
}

const totalGross = totalNet.add(totalTax);

await prisma.document.update({
  where: { id: doc.id },
  data: {
    totalNet,
    totalTax,
    totalGross,
  },
});
```


---

## Tax Rule Selection Logic

### Decision Tree

```
┌─────────────────────────────────────┐
│ Selezione TaxRule per DocumentLine  │
└────────────────┬────────────────────┘
                 │
                 ▼
        ┌────────────────┐
        │ Override manuale│ YES ──▶ Usa taxRuleId specificato
        │ su DocumentLine?│
        └────────┬───────┘
                 │ NO
                 ▼
        ┌────────────────┐
        │  Cliente B2B    │ YES ──▶ Verifica se UE/Extra-UE
        │  (partita IVA)? │         └─▶ Rate 0% + VatNature
        └────────┬───────┘
                 │ NO (B2C)
                 ▼
        ┌────────────────┐
        │ Usa defaultTax  │
        │ del Prodotto    │
        └─────────────────┘
```


### Service Implementation

```typescript
// services/tax-rule-resolver.service.ts

interface TaxRuleResolutionInput {
  product: Product & { defaultTaxRule: TaxRule };
  customer: Customer;
  deliveryCountryCode: string;
}

async function resolveTaxRule(
  input: TaxRuleResolutionInput
): Promise<TaxRule> {
  const { product, customer, deliveryCountryCode } = input;

  // 1. Cliente B2B con partita IVA EU (non Italia)?
  if (
    customer.vatNumber &&
    deliveryCountryCode !== 'IT' &&
    isEUCountry(deliveryCountryCode)
  ) {
    // Cessione intracomunitaria (rate 0%, N3.1)
    return await prisma.taxRule.findFirst({
      where: {
        countryCode: 'IT',
        vatNatureCode: 'N3.1',
        active: true,
      },
    });
  }

  // 2. Cliente Extra-UE?
  if (!isEUCountry(deliveryCountryCode)) {
    // Esportazione (rate 0%, N3.1)
    return await prisma.taxRule.findFirst({
      where: {
        countryCode: 'IT',
        vatNatureCode: 'N3.1',
        active: true,
      },
    });
  }

  // 3. Default: usa TaxRule del prodotto
  return product.defaultTaxRule;
}
```


---

## VatNature Integration

### Fattura Elettronica Mapping

Quando `DocumentLine.taxRule.vatNatureCode` è valorizzato, va incluso nella FE:

```xml
<!-- XML Fattura Elettronica -->
<DettaglioLinee>
  <NumeroLinea>1</NumeroLinea>
  <Descrizione>Cessione intracomunitaria</Descrizione>
  <Quantita>10</Quantita>
  <PrezzoUnitario>100.00</PrezzoUnitario>
  <PrezzoTotale>1000.00</PrezzoTotale>
  <AliquotaIVA>0.00</AliquotaIVA>
  <Natura>N3.1</Natura> <!-- ✅ Da TaxRule.vatNatureCode -->
</DettaglioLinee>
```


### Validation Rules

```typescript
// Validazione coerenza rate + vatNature
function validateTaxRule(taxRule: TaxRule): void {
  // Se rate = 0, DEVE avere vatNatureCode
  if (taxRule.rate.equals(0) && !taxRule.vatNatureCode) {
    throw new Error(
      `TaxRule ${taxRule.code}: rate 0% richiede vatNatureCode`
    );
  }

  // Se rate > 0, NON DEVE avere vatNatureCode
  if (taxRule.rate.greaterThan(0) && taxRule.vatNatureCode) {
    throw new Error(
      `TaxRule ${taxRule.code}: rate ${taxRule.rate}% non può avere vatNatureCode`
    );
  }
}
```


---

## Performance Considerations

### Indexes

```prisma
@@index([countryCode])        // Query per paese
@@index([vatNatureCode])      // Filter FE
@@index([active])             // Solo regole attive
@@index([countryCode, active]) // Composite per selezione
```


### Caching Strategy

```typescript
// Redis cache per TaxRule attive
const CACHE_KEY = 'tax:rules:active';
const CACHE_TTL = 3600; // 1 ora

async function getActiveTaxRules(): Promise<TaxRule[]> {
  // 1. Prova cache
  const cached = await redis.get(CACHE_KEY);
  if (cached) {
    return JSON.parse(cached);
  }

  // 2. Fallback DB
  const rules = await prisma.taxRule.findMany({
    where: { active: true },
    include: { vatNature: true },
  });

  // 3. Salva cache
  await redis.setEx(CACHE_KEY, CACHE_TTL, JSON.stringify(rules));

  return rules;
}
```


### Query Optimization

```typescript
// ❌ N+1 query problem
for (const line of documentLines) {
  const taxRule = await prisma.taxRule.findUnique({
    where: { id: line.taxRuleId },
  });
  // Calcola IVA...
}

// ✅ Batch loading
const taxRuleIds = documentLines.map((l) => l.taxRuleId);
const taxRules = await prisma.taxRule.findMany({
  where: { id: { in: taxRuleIds } },
});

const taxRuleMap = new Map(taxRules.map((r) => [r.id, r]));

for (const line of documentLines) {
  const taxRule = taxRuleMap.get(line.taxRuleId);
  // Calcola IVA...
}
```


---

## Extension Points

### 1. Multi-Country Expansion

Aggiungere nuovi paesi:

```typescript
// Seed Francia
await prisma.taxRule.createMany({
  data: [
    { code: 'TVA_20', name: 'TVA normale 20%', rate: 20.00, countryCode: 'FR' },
    { code: 'TVA_10', name: 'TVA ridotta 10%', rate: 10.00, countryCode: 'FR' },
    { code: 'TVA_5.5', name: 'TVA super-ridotta 5.5%', rate: 5.50, countryCode: 'FR' },
  ],
});
```


### 2. Historical Rate Changes

Disattivare vecchia regola, crearne nuova:

```typescript
// 1. Disattiva vecchia regola (IVA 21%)
await prisma.taxRule.update({
  where: { code: 'IVA_21_OLD' },
  data: { active: false },
});

// 2. Crea nuova regola (IVA 22%)
await prisma.taxRule.create({
  data: {
    code: 'IVA_22',
    name: 'IVA ordinaria 22%',
    rate: 22.00,
    countryCode: 'IT',
    active: true,
  },
});

// ✅ Documenti vecchi mantengono rate storico
// ✅ Nuovi documenti usano rate aggiornato
```


### 3. Custom VatNature Codes

Aggiungere nuovi codici natura:

```typescript
await prisma.vatNature.create({
  data: {
    code: 'N6.10',
    description: 'Inversione contabile - Nuovo caso specifico',
    isExempt: false,
    requiresRef: true,
  },
});
```


---

## Testing Strategy

### Unit Tests

```typescript
// __tests__/tax-calculator.test.ts

describe('TaxCalculator', () => {
  it('should calculate tax for standard rate', () => {
    const result = calculateTax({
      netAmount: new Decimal(1000),
      taxRule: { rate: new Decimal(22), vatNatureCode: null },
    });

    expect(result.taxAmount.toNumber()).toBe(220);
    expect(result.grossAmount.toNumber()).toBe(1220);
  });

  it('should handle zero rate with vatNature', () => {
    const result = calculateTax({
      netAmount: new Decimal(1000),
      taxRule: { rate: new Decimal(0), vatNatureCode: 'N3.1' },
    });

    expect(result.taxAmount.toNumber()).toBe(0);
    expect(result.grossAmount.toNumber()).toBe(1000);
    expect(result.vatNatureCode).toBe('N3.1');
  });
});
```


### Integration Tests

```typescript
// __tests__/tax-rule-resolver.test.ts

describe('TaxRuleResolver', () => {
  it('should use intra-EU rule for EU B2B customer', async () => {
    const taxRule = await resolveTaxRule({
      product: productWithIVA22,
      customer: customerWithEUVat,
      deliveryCountryCode: 'FR',
    });

    expect(taxRule.rate.toNumber()).toBe(0);
    expect(taxRule.vatNatureCode).toBe('N3.1');
  });

  it('should use default rule for domestic B2C', async () => {
    const taxRule = await resolveTaxRule({
      product: productWithIVA22,
      customer: customerB2C,
      deliveryCountryCode: 'IT',
    });

    expect(taxRule.rate.toNumber()).toBe(22);
    expect(taxRule.vatNatureCode).toBeNull();
  });
});
```


---

## Troubleshooting

### Common Issues

**Q: TaxRule non trovata per paese X**

```typescript
// Soluzione: Creare regole per nuovo paese
await prisma.taxRule.create({
  data: {
    code: 'VAT_XX',
    name: 'VAT Country X',
    rate: 20.00,
    countryCode: 'XX',
  },
});
```

**Q: Fattura elettronica rifiutata per "Natura IVA mancante"**

```typescript
// Soluzione: Aggiungere vatNatureCode alla regola con rate 0
await prisma.taxRule.update({
  where: { code: 'IVA_EXP' },
  data: { vatNatureCode: 'N3.1' },
});
```

**Q: Calcolo IVA errato su arrotondamenti**

```typescript
// Soluzione: Usare Decimal con precisione corretta
import { Decimal } from '@prisma/client/runtime/library';

const taxAmount = netAmount
  .mul(taxRate)
  .div(100)
  .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
```


---

## References

- **Agenzia delle Entrate**: [Codici Natura IVA](https://www.agenziaentrate.gov.it)
- **Fattura Elettronica**: [Specifiche Tecniche v1.2.2](https://www.fatturapa.gov.it)
- **EU VAT Rates**: [European Commission VAT Database](https://ec.europa.eu/taxation_customs/tedb)
- **Prisma Schema**: `packages/backend/prisma/schema/tax.prisma`
- **Tax Calculator Service**: `packages/backend/services/tax-calculator.service.ts`

---

## Changelog

| Version | Date | Changes |
| :-- | :-- | :-- |
| 1.0.0 | 2026-02-15 | Initial architecture with TaxRule + VatNature |
| 1.1.0 | TBD | Multi-country expansion (FR, DE, ES) |
| 2.0.0 | TBD | Real-time ECB exchange rate integration |