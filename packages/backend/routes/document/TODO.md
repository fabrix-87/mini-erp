# Backend TODO — Endpoint da implementare

Priorità: 🔴 Alta · 🟡 Media · 🟢 Bassa  
Stato: ⬜ Da fare · 🔄 In corso · ✅ Fatto

---

## 📄 Documents

### Export & Print
| Priorità | Endpoint | Controller | Note |
|----------|----------|------------|------|
| 🔴 | `GET /api/documents/:id/export/pdf` | `document-export-controller.ts` | Genera PDF con template Handlebars/Puppeteer |
| 🔴 | `GET /api/documents/:id/export/excel` | `document-export-controller.ts` | Export XLSX riga per riga |
| 🟡 | `GET /api/documents/:id/print` | `document-export-controller.ts` | HTML print-ready, nessuna dipendenza esterna |
| 🟡 | `POST /api/documents/bulk-export` | già in `document-bulk-controller.ts` | ZIP multipli PDF — `bulkExportDocuments` è stub |

### Allegati
| Priorità | Endpoint | Controller | Note |
|----------|----------|------------|------|
| 🔴 | `POST /api/documents/:id/attachments` | `document-attachments-controller.ts` | Multipart upload — valutare S3 vs local storage |
| 🔴 | `GET /api/documents/:id/attachments` | `document-attachments-controller.ts` | Lista allegati con URL firmati |
| 🔴 | `DELETE /api/documents/:id/attachments/:attachmentId` | `document-attachments-controller.ts` | Soft delete + rimozione file fisico |
| 🟢 | `GET /api/documents/:id/attachments/:attachmentId/download` | `document-attachments-controller.ts` | Stream diretto del file |

### Email
| Priorità | Endpoint | Controller | Note |
|----------|----------|------------|------|
| 🔴 | `POST /api/documents/:id/send-email` | `document-email-controller.ts` | Invia documento via email con PDF allegato |
| 🟡 | `GET /api/documents/:id/email-preview` | `document-email-controller.ts` | Anteprima HTML dell'email da inviare |
| 🟡 | `GET /api/documents/:id/email-history` | `document-email-controller.ts` | Storico invii email per documento |

### Template
| Priorità | Endpoint | Controller | Note |
|----------|----------|------------|------|
| 🟡 | `POST /api/documents/:id/create-template` | `document-template-controller.ts` | Salva documento come template riutilizzabile |
| 🟡 | `POST /api/documents/from-template` | `document-template-controller.ts` | Crea documento da template esistente |
| 🟢 | `GET /api/documents/templates` | `document-template-controller.ts` | Lista template disponibili per tipo documento |

### Validazione Fiscale
| Priorità | Endpoint | Controller | Note |
|----------|----------|------------|------|
| 🔴 | `GET /api/documents/:id/validate-fiscal` | `document-fiscal-controller.ts` | Verifica campi obbligatori SDI, P.IVA, CF |
| 🟡 | `POST /api/documents/:id/generate-xml` | `document-fiscal-controller.ts` | Genera XML FatturaPA (SDI) |
| 🟡 | `GET /api/documents/:id/xml-status` | `document-fiscal-controller.ts` | Stato trasmissione SDI |

### Magazzino
| Priorità | Endpoint | Controller | Note |
|----------|----------|------------|------|
| 🔴 | `POST /api/documents/:id/generate-stock-movements` | `document-fulfillment-controller.ts` | Genera movimenti da DDT/ordine confermato |
| 🟡 | `GET /api/documents/:id/stock-movements` | `document-fulfillment-controller.ts` | Movimenti già generati per il documento |

### Notifiche & Alerting
| Priorità | Endpoint | Controller | Note |
|----------|----------|------------|------|
| 🟡 | `GET /api/documents/expiring` | `document-reports-controller.ts` | Documenti in scadenza nei prossimi N giorni |
| 🟡 | `GET /api/documents/overdue` | `document-reports-controller.ts` | Fatture scadute non pagate (≠ installments overdue) |

### Report mancanti
| Priorità | Endpoint | Controller | Note |
|----------|----------|------------|------|
| 🟡 | `GET /api/documents/reports/top-customers` | `document-reports-controller.ts` | Top clienti per fatturato — simile a `getTopProducts` |
| 🟢 | `GET /api/documents/reports/margin` | `document-reports-controller.ts` | Margine netto per documento (unitPrice vs unitCost) |
| 🟢 | `GET /api/documents/reports/payment-forecast` | `document-reports-controller.ts` | Previsione incassi da rate future |

---

## 🔧 Refactoring & Tech Debt

| Priorità | Task | Note |
|----------|------|------|
| 🟡 | `getAllDocuments` — gestire `documentType` iniettato da route `/quotes`, `/orders`, etc. | Attualmente il filtro è delegato alla query string — va automatizzato nel controller |
| 🟡 | `bulkExportDocuments` in `document-bulk-controller.ts` — attualmente stub | Implementare ZIP con `archiver` + chiamata a export PDF |
| 🟢 | Separare `document-validator.ts` in sotto-file per specchio dei controller | Es. `document-lines-validator.ts`, `document-bulk-validator.ts` |