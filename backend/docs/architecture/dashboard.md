# 📊 Dashboard Module - Struttura Modulare

## 📁 Struttura File

```
src/
├── helpers/
│   └── dashboard.ts         # Utility functions riutilizzabili
│
├── validators/
│   └── dashboard.ts       # Zod schemas (compatto)
│
├── controllers/
│   ├── dashboard.ts      # Main export file
│   ├── dashboard/overview.ts
│   ├── dashboard/sales.ts
│   ├── dashboard/opportunity.ts
│   ├── dashboard/product.ts       # TODO
│   ├── dashboard/customer.ts      # TODO
│   ├── dashboard/document.ts      # TODO
│   ├── dashboard/financial.ts     # TODO
│   └── dashboard/warehouse.ts     # TODO
│
└── routes/
    └── dashboard.routes.ts          # Routes con validazioni Zod
```

---

## 🎯 Principi Architetturali

### 1. **Separazione delle Responsabilità**
- **Helpers**: Logica riutilizzabile (date, calcoli, trasformazioni)
- **Validators**: Solo definizione schema Zod
- **Controllers**: Business logic specifica per sezione
- **Routes**: Routing + middleware

### 2. **File Compatti**
- Ogni controller < 150 righe
- Helpers condivisi estrapolati
- Validators snelli con Zod

### 3. **Riusabilità**
```typescript
// Helper usato in tutti i controller
import { getDateRangeFromPeriod, toNumber } from '../helpers/dashboard.helpers';
```

---

## 📦 Helpers Disponibili

### **dashboard.helpers.ts**

#### `getDateRangeFromPeriod(period?: string)`
Converte periodo predefinito in date range.
```typescript
const { startDate, endDate } = getDateRangeFromPeriod('last30days');
```

#### `getPreviousPeriod(startDate: Date, endDate: Date)`
Calcola periodo precedente per confronti.
```typescript
const prevPeriod = getPreviousPeriod(startDate, endDate);
```

#### `calculateGrowth(current: number, previous: number)`
Calcola percentuale di crescita.
```typescript
const growth = calculateGrowth(125000, 108000); // "15.74"
```

#### `groupByPeriod(data, groupBy)`
Raggruppa dati per giorno/settimana/mese/anno.
```typescript
const grouped = groupByPeriod(documents, 'month');
```

#### `toNumber(value: any)`
Converte Prisma Decimal a number.
```typescript
const amount = toNumber(document.totalAmount);
```

#### `daysBetween(date1: Date, date2: Date)`
Calcola giorni tra due date.
```typescript
const days = daysBetween(createdAt, closedDate);
```

#### `STAGE_PROBABILITY_MAP`
Costante per mapping stage → probabilità.
```typescript
const prob = STAGE_PROBABILITY_MAP['PROSPECTING']; // 20
```

---

## 🔧 Validators (Zod)

### Schema Compatti
```typescript
// Base schema riutilizzabile
const DateRangeQuerySchema = z.object({
  startDate: z.string().datetime().optional()
    .transform(val => val ? new Date(val) : undefined),
  endDate: z.string().datetime().optional()
    .transform(val => val ? new Date(val) : undefined),
  period: PeriodSchema.optional().default('last30days'),
});

// Schema specifici estendono il base
const SalesQuerySchema = DateRangeQuerySchema.extend({
  customerId: z.string().optional()
    .transform(val => val ? parseInt(val, 10) : undefined),
  groupBy: GroupBySchema.optional().default('day'),
});
```

### Features
- ✅ Transform automatici (string → number, string → Date)
- ✅ Defaults intelligenti
- ✅ Type safety completo
- ✅ Validazioni inline

---

## 🎮 Controllers Modulari

### Pattern Comune

Ogni controller segue questo pattern:

```typescript
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { getDateRangeFromPeriod, toNumber } from '../helpers/dashboard.helpers';

const prisma = new PrismaClient();

export const getXxxStatistics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Extract query params (già validati da Zod)
    const { period, startDate, endDate } = req.query;
    
    // 2. Calculate date range
    const range = startDate && endDate
      ? { startDate: new Date(startDate), endDate: new Date(endDate) }
      : getDateRangeFromPeriod(period);
    
    // 3. Parallel queries con Promise.all
    const [data1, data2] = await Promise.all([
      prisma.model1.aggregate({...}),
      prisma.model2.findMany({...}),
    ]);
    
    // 4. Transform e enrich data
    const enriched = await Promise.all(
      data.map(async (item) => {
        // Fetch related data
        return { ...item, extra: ... };
      })
    );
    
    // 5. Format response
    res.status(200).json({
      success: true,
      data: {
        period: range,
        summary: {...},
        details: enriched,
      },
    });
  } catch (error) {
    next(error);
  }
};
```

### Benefits
- ✅ Chiaro e leggibile
- ✅ Query parallele per performance
- ✅ Error handling consistente
- ✅ Response format standardizzato

---

## 🚀 Controllers Implementati

### ✅ **1. Overview** (`dashboard.overview.ts`)
KPI principali aggregati:
- Sales totali con crescita vs periodo precedente
- Opportunità per status
- Clienti per lead status
- Documenti per tipo
- Attività recenti

**Features:**
- Confronto periodo precedente automatico
- 5 query parallele con `Promise.all`
- Formattazione aggregati

### ✅ **2. Sales** (`dashboard.sales.ts`)
Statistiche vendite dettagliate:
- Totali (revenue, tax, paid, average)
- Trend raggruppato (day/week/month/year)
- Top 10 prodotti
- Top 10 clienti

**Features:**
- Grouping dinamico con helper
- Enrichment prodotti con traduzioni
- Enrichment clienti con company data
- 4 query parallele

### ✅ **3. Opportunities** (`dashboard.opportunity.ts`)
Pipeline CRM:
- Pipeline per stage con valori
- Metriche: Win Rate, Avg Deal Size, Sales Cycle
- Top 10 performers

**Features:**
- Calcolo Win Rate automatico
- Sales Cycle calcolato da date
- Enrichment users con dettagli

---

## 📝 Controllers TODO

### **4. Products** (`dashboard.product.ts`)
```typescript
export const getProductStatistics = async (...) => {
  // - Best sellers
  // - Low stock alerts
  // - Category performance
  // - Product status summary
};
```

### **5. Customers** (`dashboard.customer.ts`)
```typescript
export const getCustomerStatistics = async (...) => {
  // - Distribution by type/segment/status
  // - Lifetime value ranges
  // - Top revenue customers
  // - New vs active
};
```

### **6. Documents** (`dashboard.document.ts`)
```typescript
export const getDocumentStatistics = async (...) => {
  // - By type and status
  // - Payment tracking
  // - Overdue invoices
  // - Document flow
};
```

### **7. Financial** (`dashboard.financial.ts`)
```typescript
export const getFinancialStatistics = async (...) => {
  // - Revenue, Expenses, Profit
  // - Cash Flow
  // - Accounts Receivable/Payable
  // - Tax summary
};
```

### **8. Warehouse** (`dashboard.warehouse.ts`)
```typescript
export const getWarehouseStatistics = async (...) => {
  // - Stock value
  // - Stock by warehouse
  // - Movements by type
  // - Recent movements
  // - Inventory turnover
};
```

---

## 🔗 Routes

### Pattern Consistente
```typescript
router.get(
  '/endpoint',
  authenticateToken,
  authorize(['dashboard:read', 'dashboard:manage']),
  validate(QuerySchema, 'Context', { source: ['query'] }),
  getController
);
```

### Features
- ✅ Auth + authorization
- ✅ Zod validation middleware
- ✅ Source specification (query/body/params)
- ✅ Documentazione inline

---

## 💻 Esempio Completo

### Request
```http
GET /api/dashboard/sales?period=thisMonth&groupBy=week&customerId=5
Authorization: Bearer <token>
```

### Validazione (Automatica)
```typescript
// SalesQuerySchema trasforma e valida:
{
  period: 'thisMonth',          // ✅ Enum validato
  startDate: Date(2025-01-01),  // ✅ Calcolato da period
  endDate: Date(2025-01-31),    // ✅ Calcolato da period
  groupBy: 'week',              // ✅ Enum validato, default 'day'
  customerId: 5                 // ✅ Transform string → number
}
```

### Controller Logic
```typescript
// 1. Extract (già validato e trasformato)
const { period, customerId, groupBy } = req.query;

// 2. Date range
const { startDate, endDate } = getDateRangeFromPeriod(period);

// 3. Query
const documents = await prisma.document.findMany({
  where: {
    documentDate: { gte: startDate, lte: endDate },
    customerId,
  }
});

// 4. Group
const trend = groupByPeriod(documents, groupBy);

// 5. Response
res.json({ success: true, data: { trend } });
```

### Response
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2025-01-01T00:00:00.000Z",
      "endDate": "2025-01-31T23:59:59.000Z"
    },
    "totals": {
      "revenue": 125000,
      "count": 45,
      "average": 2777.78
    },
    "trend": [
      {
        "period": "2025-01-01",
        "totalAmount": 15000,
        "count": 5,
        "byType": { "INVOICE": 3, "ORDER": 2 }
      }
    ]
  }
}
```

---

## 🎯 Best Practices

### 1. **Usa Sempre Helpers**
```typescript
// ❌ Non fare
const amount = parseFloat(document.totalAmount.toString());

// ✅ Fai
const amount = toNumber(document.totalAmount);
```

### 2. **Query Parallele**
```typescript
// ❌ Sequenziali
const sales = await prisma.document.aggregate({...});
const customers = await prisma.customer.count({...});

// ✅ Parallele
const [sales, customers] = await Promise.all([
  prisma.document.aggregate({...}),
  prisma.customer.count({...}),
]);
```

### 3. **Transform nei Validators**
```typescript
// ✅ Transform automatico
customerId: z.string()
  .transform(val => val ? parseInt(val, 10) : undefined)

// Controller riceve già number
const { customerId } = req.query; // Type: number | undefined
```

### 4. **Enrich Solo Necessario**
```typescript
// Enrich solo top 10, non tutti
const enriched = await Promise.all(
  topProducts.slice(0, 10).map(async (p) => {
    // fetch related data
  })
);
```

---

## 🚀 Performance Tips

1. **Use `select` to limit fields**
```typescript
select: { id: true, name: true } // Solo campi necessari
```

2. **Use `take` for pagination**
```typescript
take: 10 // Limita risultati
```

3. **Index important fields**
```sql
CREATE INDEX idx_document_date_type ON "Document"("documentDate", "documentType");
```

4. **Cache risultati**
```typescript
// Redis cache per dashboard overview (aggiorna ogni 5min)
```

---

## 📚 Prossimi Step

### Completare Controllers Mancanti
1. Products
2. Customers  
3. Documents
4. Financial
5. Warehouse

### Features Aggiuntive
- [ ] Export PDF/Excel reports
- [ ] Real-time updates (WebSocket)
- [ ] Custom dashboard builder
- [ ] Scheduled email reports
- [ ] Comparative analysis (YoY, MoM)

---

## 🔍 Testing Example

```typescript
import { getSalesStatistics } from './dashboard.sales.controller';

describe('Sales Statistics', () => {
  it('should return sales data for period', async () => {
    const req = {
      query: { period: 'last30days' }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    await getSalesStatistics(req, res, jest.fn());
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.any(Object)
      })
    );
  });
});
```

---

**Versione:** 2.0.0 (Modulare)  
**Ultima modifica:** Dicembre 2025