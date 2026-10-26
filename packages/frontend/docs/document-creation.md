# Document Creation — Frontend Implementation Guide

## Obiettivo

Supportare la creazione progressiva di un documento come bozza persistente,
con salvataggio automatico delle righe, senza creare documenti vuoti e senza
generare numerazione finché il documento non viene formalizzato.

## Flusso utente

```text
1. Utente apre “Nuovo documento”
2. Seleziona cliente o fornitore
3. Aggiunge la prima riga oppure preme “Salva bozza”
4. Il backend crea il documento DRAFT
5. Ogni modifica successiva viene salvata atomicamente
6. “Salva” mantiene lo stato DRAFT
7. “Invia” / “Approva” / “Conferma” formalizza il documento
```

## Pagina “Nuovo documento”

All’apertura della pagina:

- NON chiamare `POST /documents`.
- Inizializzare uno stato locale di bozza.
- Generare una `Idempotency-Key` UUID.
- Conservare la chiave finché la creazione non è confermata dal backend.

La bozza locale contiene almeno:

- tipo documento;
- cliente o fornitore;
- righe in editing;
- date;
- note;
- eventuali campi commerciali.

## Selezione controparte

La selezione del cliente o fornitore deve avvenire prima dell’inserimento
delle righe, oppure almeno prima del primo salvataggio.

Al cambio di controparte:

- il frontend deve richiedere il contesto commerciale applicabile;
- listino, prezzi, IVA e snapshot non devono essere calcolati dal frontend;
- se il documento è già stato creato, il cambio di controparte richiede
  una conferma esplicita, perché può invalidare righe e prezzi già salvati.

## Prima riga e creazione bozza

Quando l’utente aggiunge la prima riga:

1. Il frontend valida localmente i dati minimi della riga.
2. Invia la richiesta di creazione documento con:
   - `Idempotency-Key`;
   - tipo documento;
   - controparte;
   - prima riga.
3. Il backend crea il documento `DRAFT` e la prima riga.
4. Il frontend salva l’ID documento restituito.
5. Da questo momento, ogni operazione avviene su un documento esistente.

Se l’utente preme “Salva bozza” senza righe, il backend può creare comunque
un `DRAFT`, purché la controparte sia selezionata.

## Autosave righe

Ogni riga è una risorsa indipendente.

### Aggiunta riga

```http
POST /documents/:id/lines
```

- Attendere la risposta del backend.
- Sostituire la riga locale con la riga restituita dal backend.
- Usare l’ID riga restituito per update e delete.

### Modifica riga

```http
PATCH /documents/:id/lines/:lineId
```

- Applicare un debounce ragionevole, ad esempio 500–1000 ms.
- Non inviare una richiesta per ogni keystroke.
- Se l’utente modifica più campi rapidamente, inviare solo l’ultimo stato valido.
- Non calcolare o inviare totali definitivi: il backend li ricalcola.

### Eliminazione riga

```http
DELETE /documents/:id/lines/:lineId
```

- Rimuovere la riga dallo stato locale solo dopo la conferma del backend.
- In caso di errore, ripristinare la riga e mostrare un messaggio.

### Riordino righe

Se l’utente può riordinare le righe:

- non ricalcolare `lineNumber` nel frontend;
- inviare l’ordine desiderato a un endpoint dedicato;
- applicare l’ordine restituito dal backend.

## Totali

Il frontend può mostrare totali provvisori per feedback immediato, ma:

- non deve considerarsi fonte di verità;
- deve sostituirli sempre con i totali restituiti dal backend;
- non deve inviare `subtotal`, `taxAmount`, `totalAmount` o `netPayableAmount`
  come valori autorevoli.

Dopo ogni operazione su righe, sconto o spedizione, il backend restituisce
i totali aggiornati.

## Stato “Salva”

“Salva bozza” NON cambia lo stato del documento.

Comportamento:

- valida i dati;
- persiste la bozza;
- resta `DRAFT`;
- non genera numero documento;
- non crea snapshot.

Il numero documento viene generato solo alla formalizzazione.

## Formalizzazione

Il pulsante di invio, approvazione o conferma dipende dal workflow.

Esempio:

```text
Salva bozza → DRAFT
Invia → SENT
```

Se esiste approvazione obbligatoria:

```text
Salva bozza → DRAFT
Richiedi approvazione → PENDING_APPROVAL
Approva e invia → SENT
```

Al momento della formalizzazione:

- il backend genera numero e sequenza;
- il backend crea gli snapshot;
- il frontend ricarica il documento dal backend;
- il documento diventa non modificabile, secondo le regole di stato.

## Idempotency key

Generare una UUID quando l’utente avvia una nuova creazione:

```ts
const idempotencyKey = crypto.randomUUID();
```

Inviala solo sulla creazione:

```http
Idempotency-Key: <uuid>
```

Regole:

- Non rigenerarla a ogni retry della stessa creazione.
- Conservarla finché il backend non conferma la creazione.
- Se l’utente annulla e ricomincia da zero, generare una nuova chiave.
- Non usarla per update o delete di righe già esistenti.

## Gestione errori

### Rete non disponibile

- Mantenere la bozza locale.
- Consentire il retry.
- Non duplicare la creazione grazie alla idempotency key.

### Errore di validazione

- Mostrare gli errori per campo.
- Non rimuovere la riga dallo stato locale.
- Non considerare la riga salvata finché il backend non restituisce un ID.

### Conflitto

- Se il backend risponde con conflitto, ricaricare il documento.
- Avvisare l’utente che il documento è stato modificato altrove.
- Non sovrascrivere automaticamente i dati.

## UX consigliata

- Indicare chiaramente lo stato: “Bozza non salvata”, “Bozza salvata”, “Invio in corso”.
- Mostrare un indicatore di salvataggio per riga.
- Disabilitare l’invio finché la bozza non è valida.
- Chiedere conferma prima di cambiare cliente/fornitore su una bozza già salvata.
- Evitare di mostrare un numero documento finché non è stato generato dal backend.

## TODO iniziali

```ts
// TODO(concurrency): handle concurrent editing with optimistic locking.
// TODO(authorization): implement team-based visibility and edit permissions.
// TODO(draft-cleanup): inform users before automatic draft cleanup, if required.
```

## Priorità di implementazione

1. Stato locale della bozza.
2. Creazione documento con idempotency key.
3. CRUD righe atomico.
4. Sincronizzazione totali dal backend.
5. Salvataggio bozza senza cambio stato.
6. Formalizzazione con reload dal backend.
7. Gestione errori e retry.
8. Concurrenza e permessi team.
