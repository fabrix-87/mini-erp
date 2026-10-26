# Document Creation — Backend Implementation Guide

## Obiettivo

Gestire la creazione e la modifica progressiva dei documenti commerciali
(ordini, preventivi, fatture, DDT) come bozze persistenti, con righe salvate
atomicamente, totali ricalcolati dal backend e snapshot/numerazione generati
solo alla formalizzazione del documento.

## Stato target

Un documento nasce sempre come `DRAFT` e non ha numero documento.

```text
DRAFT → PENDING_APPROVAL → SENT
DRAFT → SENT
```

- `DRAFT`: documento esistente, modificabile, senza numero.
- `PENDING_APPROVAL`: opzionale, se il workflow richiede approvazione.
- `SENT`: primo stato di formalizzazione.
- `ACCEPTED`: risposta della controparte; non è un punto di snapshot.

## Creazione documento

### Trigger di creazione

Il documento viene creato al primo salvataggio significativo:

- selezione cliente/fornitore + prima riga;
- pressione di “Salva bozza”;
- primo autosave valido.

Non creare un documento al semplice accesso alla pagina “Nuovo”.
Questo evita bozze vuote e consumi inutili di risorse.

### Regole

- Il documento è sempre creato con `status = DRAFT`.
- `direction` è derivata da `documentType` tramite `isInboundDocumentType`.
- `tenantId` e `createdByUserId` sono sempre presi dal contesto autenticato.
- `documentNumber` e `sequenceNumber` restano `null` in `DRAFT`.
- Gli snapshot di controparte, pagamento e banca NON vengono creati in `DRAFT`.
- I totali inviati dal client vengono ignorati e ricalcolati dal backend.

### Idempotency key

La creazione del documento deve accettare un header:

```http
Idempotency-Key: <uuid>
```

Comportamento atteso:

1. Il frontend genera la chiave quando l’utente inizia una nuova creazione.
2. Il backend salva la chiave insieme al documento creato.
3. Se la stessa chiave viene inviata nuovamente, il backend restituisce il documento esistente.
4. Se la stessa chiave arriva con un payload diverso, il backend risponde con `ConflictError`.

La chiave deve essere scoped per tenant e conservata almeno 24–48 ore.

## Righe documento

Le righe sono gestite con operazioni atomiche:

- `POST /documents/:id/lines` — crea riga.
- `PATCH /documents/:id/lines/:lineId` — aggiorna riga.
- `DELETE /documents/:id/lines/:lineId` — elimina riga.
- `POST /documents/:id/lines/reorder` — rinumera le righe, se necessario.

### Regole

- Le righe possono essere modificate solo se il documento è `DRAFT`.
- `lineNumber` è gestito dal backend, non dal client.
- `tenantId` e `documentId` delle righe sono derivati dalla relazione con `Document`
  durante il nested create; non vanno impostati manualmente nel tipo
  `DocumentLineUncheckedCreateWithoutDocumentInput`.
- Se una riga viene creata direttamente con `tx.documentLine.create`,
  invece che tramite nested create, `tenantId` e `documentId` sono obbligatori.
- I totali riga sono sempre ricalcolati dal backend.
- `unitCost` non è un dato client arbitrario: va derivato o autorizzato esplicitamente.
- `uomId` e `uomFactor` richiedono supporto nello schema condiviso prima di essere accettati.

## Pricing

Il prezzo unitario è risolto dal pricing resolver, non dal builder.

Il resolver deve:

1. Identificare il listino applicabile.
2. Calcolare il prezzo, anche attraverso listini derivati.
3. Applicare `PriceList.roundingMethod` al prezzo unitario finale.
4. Restituire `ResolvedLinePricing`.

```ts
interface ResolvedLinePricing {
  unitPrice: string;
  originalUnitPrice: string | null;
  priceOverrideReason: string | null;
}
```

`PriceRoundingMethod` resta una responsabilità del listino.
Non deve essere accettato dal client né passato come parametro separato
al builder delle righe.

I totali di riga e documento usano una regola monetaria fissa:
arrotondamento a 2 decimali, idealmente `ROUND_HALF_UP`.

## Snapshot e numerazione

Snapshot e numerazione vengono creati alla prima formalizzazione:

```text
DRAFT → SENT
```

oppure, se il workflow prevede approvazione obbligatoria:

```text
DRAFT → PENDING_APPROVAL → SENT
```

### Al momento della formalizzazione

In una singola transazione Prisma:

1. Verificare che il documento sia ancora modificabile.
2. Generare `documentNumber` e `sequenceNumber`, solo per OUTBOUND.
3. Creare gli snapshot delle parti.
4. Congelare pagamento e banca.
5. Impostare `snapshotLockedAt`.

### Snapshot da creare

- `COUNTERPARTY`: cliente o fornitore.
- `TENANT`: identità legale del tenant.
- `SHIPPING`: solo se presente un indirizzo di spedizione.
- `CARRIER`: solo se presente un vettore.
- `paymentMethodCode`.
- Snapshot bancario: `bankName`, `bankIban`, `bankSwift`, `bankAccountHolder`.

### Dati sorgente

- `Customer` e `Supplier` sono profili commerciali collegati a `Company`.
- I dati fiscali e anagrafici stanno su `Company` e, quando presente,
  sulla `CompanyVersion` corrente.
- `PaymentMethod` espone `code`; non espone una label delle condizioni di pagamento.
- `BankAccount` espone `bankName`, `iban`, `bic` e `accountHolder`.

### Ritenute e contributi

`withholdingTaxAmount`, `withholdingTaxBase`, `contributionAmount` e
`contributionPercent` non devono essere accettati dal client.

Il calcolo richiede una regola fiscale esplicita basata su:

- `WithholdingTaxType.taxableBasePercent`;
- `WithholdingTaxType.rate`;
- `SocialSecurityFund.defaultRate`;
- `SocialSecurityFund.addsTaxableBase`.

Finché la regola non è implementata, non popolare questi campi e mantenere:

```text
netPayableAmount = totalAmount
```

## Pulizia bozze orphan

NON eseguire la pulizia dentro `getAll`.

Creare un job schedulato oppure un endpoint amministrativo dedicato.

Una bozza è candidata alla pulizia se:

- `status = DRAFT`;
- `deletedAt = null`;
- non ha righe;
- non ha allegati;
- non ha rate;
- non ha relazioni con altri documenti;
- `updatedAt < now() - 48h`.

La pulizia deve essere un soft delete:

- `deletedAt = now()`;
- `deletedBy = system-user-id` oppure identificatore di sistema dedicato.

## Concurrenza e permessi

Per la prima versione funzionante:

- Filtrare sempre per `tenantId`.
- Salvare sempre `createdByUserId`.
- Impedire la modifica di documenti non `DRAFT`.
- Non generare numerazione su documenti già numerati.
- Non esporre documenti di altri tenant.

TODO da presidiare in seguito:

```ts
// TODO(concurrency): prevent concurrent edits using optimistic locking or document versioning.
// TODO(authorization): enforce team-based visibility and edit permissions for drafts.
```

## Priorità di implementazione

1. Schema condiviso e validatori aggiornati.
2. Builder righe e documento.
3. Resolver prezzi.
4. Resolver snapshot.
5. Endpoint creazione documento con idempotency key.
6. Endpoint CRUD righe.
7. Transizione di formalizzazione con snapshot e numerazione.
8. Job di pulizia bozze orphan.
9. Concurrenza ottimistica.
10. Permessi team.
