# Activity API - Esempi di Utilizzo

## 📋 Panoramica Sistema Activities

Il sistema di gestione activities permette di tracciare e gestire tutte le interazioni CRM:
- ☎️ **Chiamate** telefoniche
- 📧 **Email** e comunicazioni
- 🤝 **Meeting** e appuntamenti
- ✅ **Task** e todo
- 📝 **Note** e promemoria
- 💬 WhatsApp, SMS, Videochiamate
- 🏢 Visite in loco

---

## 1. GESTIONE ACTIVITIES

### Crea una chiamata di follow-up
```http
POST /api/activities
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "CALL",
  "priority": "HIGH",
  "subject": "Follow-up trattativa Q4 2025",
  "description": "Chiamare per discutere proposta commerciale",
  "scheduledStart": "2025-12-15T10:00:00Z",
  "duration": 30,
  "reminderMinutes": 15,
  "customerId": 42,
  "contactId": 15,
  "opportunityId": 8,
  "assignedUserId": 5,
  "requiresFollowUp": true,
  "followUpDate": "2025-12-20T10:00:00Z"
}
```

### Crea un meeting con partecipanti
```http
POST /api/activities
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "MEETING",
  "priority": "MEDIUM",
  "subject": "Demo prodotto - Acme Corp",
  "description": "Presentazione piattaforma e Q&A",
  "location": "https://meet.google.com/abc-defg-hij",
  "scheduledStart": "2025-12-10T14:00:00Z",
  "scheduledEnd": "2025-12-10T15:30:00Z",
  "duration": 90,
  "reminderMinutes": 30,
  "companyId": 25,
  "customerId": 42,
  "contactId": 15,
  "assignedUserId": 5
}

# Poi aggiungi partecipanti:
POST /api/activities/123/participants
{
  "activityId": 123,
  "userId": 7,
  "role": "required",
  "status": "invited"
}

POST /api/activities/123/participants
{
  "activityId": 123,
  "contactId": 15,
  "role": "organizer",
  "status": "accepted"
}
```

### Completa un'attività
```http
PATCH /api/activities/123/complete
Authorization: Bearer {token}
Content-Type: application/json

{
  "outcome": "SUCCESSFUL",
  "result": "Cliente interessato. Ha richiesto preventivo per 100 licenze. Ottima opportunità!",
  "requiresFollowUp": true,
  "followUpDate": "2025-12-18T10:00:00Z",
  "internalNotes": "Budget disponibile Q1 2026. Decision maker: Mario Rossi."
}
```

### Filtra attività - Dashboard personale
```http
# Le mie attività di oggi
GET /api/activities?myActivities=true&startDate=2025-12-05T00:00:00Z&endDate=2025-12-05T23:59:59Z

# Attività scadute che richiedono attenzione
GET /api/activities?myActivities=true&overdue=true&status=SCHEDULED

# Tutte le chiamate completate questo mese
GET /api/activities?type=CALL&status=COMPLETED&startDate=2025-12-01T00:00:00Z

# Attività che richiedono follow-up
GET /api/activities?requiresFollowUp=true&myActivities=true
```

---

## 2. TEMPLATES - Automazione

### Crea template per chiamata di benvenuto
```http
POST /api/activity-templates
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Chiamata Benvenuto Nuovo Cliente",
  "description": "Prima chiamata dopo conversione lead",
  "type": "CALL",
  "priority": "HIGH",
  "defaultDuration": 20,
  "defaultSubject": "Chiamata di benvenuto - {CUSTOMER_NAME}",
  "defaultDescription": "Ringraziare per la fiducia, confermare dettagli ordine, spiegare processo onboarding",
  "checklist": {
    "items": [
      "Presentarsi e ringraziare",
      "Confermare dati di contatto",
      "Spiegare processo di onboarding",
      "Rispondere a domande",
      "Pianificare prossimi step"
    ]
  },
  "active": true
}
```

### Usa template per creare activity
```http
POST /api/activity-templates/5/create-activity
Authorization: Bearer {token}
Content-Type: application/json

{
  "templateId": 5,
  "scheduledStart": "2025-12-06T09:00:00Z",
  "subject": "Chiamata di benvenuto - Acme Corp",
  "customerId": 42,
  "companyId": 25,
  "assignedUserId": 5
}

# Il sistema crea automaticamente l'activity con:
# - Tipo, priorità e durata dal template
# - Checklist copiata nei customFields
# - Subject personalizzato
```

---

## 3. STATISTICHE E REPORTISTICA

### Dashboard attività utente
```http
GET /api/activities/stats
Authorization: Bearer {token}

# Risposta:
{
  "success": true,
  "data": {
    "byType": [
      { "type": "CALL", "_count": 45 },
      { "type": "EMAIL", "_count": 32 },
      { "type": "MEETING", "_count": 18 }
    ],
    "byStatus": [
      { "status": "COMPLETED", "_count": 67 },
      { "status": "SCHEDULED", "_count": 23 },
      { "status": "IN_PROGRESS", "_count": 5 }
    ],
    "byOutcome": [
      { "outcome": "SUCCESSFUL", "_count": 45 },
      { "outcome": "FOLLOW_UP_NEEDED", "_count": 12 },
      { "outcome": "NO_ANSWER", "_count": 8 }
    ],
    "overdue": 3,
    "today": 8,
    "followUp": 5
  }
}
```

### Statistiche team (manager)
```http
GET /api/activities/stats?userId=7&startDate=2025-12-01T00:00:00Z&endDate=2025-12-31T23:59:59Z
Authorization: Bearer {token}

# Analizza performance di un commerciale nel mese
```

---

## 4. CASI D'USO AVANZATI

### A) Pipeline Vendita Completa

```http
# 1. Lead arriva dal sito
POST /api/customers
{
  "companyId": 99,
  "type": "LEAD",
  "leadStatus": "NEW"
}

# 2. Sistema crea automaticamente task di qualificazione
POST /api/activities
{
  "type": "TASK",
  "priority": "HIGH",
  "subject": "Qualificare nuovo lead - TechStart SRL",
  "scheduledStart": "2025-12-05T09:00:00Z",
  "customerId": 150,
  "assignedUserId": 5
}

# 3. Commerciale qualifica e programma chiamata
PATCH /api/activities/456/complete
{
  "outcome": "SUCCESSFUL",
  "result": "Lead qualificato. Budget 50k€, decision maker confermato",
  "requiresFollowUp": true,
  "followUpDate": "2025-12-06T10:00:00Z"
}

POST /api/activities
{
  "type": "CALL",
  "subject": "Discovery call - TechStart",
  "scheduledStart": "2025-12-06T10:00:00Z",
  "customerId": 150,
  "opportunityId": 89,
  "followUpActivityId": 456,
  "assignedUserId": 5
}

# 4. Dopo discovery, programma demo
PATCH /api/activities/457/complete
{
  "outcome": "SUCCESSFUL",
  "result": "Esigenze confermate. Richiesta demo piattaforma"
}

POST /api/activities
{
  "type": "MEETING",
  "subject": "Demo prodotto - TechStart",
  "scheduledStart": "2025-12-10T14:00:00Z",
  "customerId": 150,
  "opportunityId": 89
}
```

### B) Gestione Follow-up Automatici

```http
# Query mattutina: cosa devo fare oggi?
GET /api/activities?myActivities=true&startDate=2025-12-05T00:00:00Z&endDate=2025-12-05T23:59:59Z&sortBy=scheduledStart&sortOrder=asc

# Risposta mostra timeline giornaliera:
[
  {
    "id": 501,
    "type": "CALL",
    "priority": "HIGH",
    "subject": "Follow-up proposta - Acme Corp",
    "scheduledStart": "2025-12-05T09:00:00Z",
    "customer": { "company": { "companyName": "Acme Corp" } },
    "requiresFollowUp": false
  },
  {
    "id": 502,
    "type": "MEETING",
    "subject": "Demo - Beta SRL",
    "scheduledStart": "2025-12-05T11:00:00Z",
    "location": "https://meet.google.com/xyz",
    "participants": [...]
  }
]
```

### C) Report Manager - Team Performance

```http
# Attività team ultimo mese
GET /api/activities?startDate=2025-11-01T00:00:00Z&endDate=2025-11-30T23:59:59Z&limit=1000

# Filtra per commerciale più produttivo
GET /api/activities?assignedUserId=5&status=COMPLETED&outcome=SUCCESSFUL&startDate=2025-11-01T00:00:00Z

# Identifica bottleneck: attività scadute per utente
GET /api/activities?overdue=true&assignedUserId=5
```

---

## 5. BEST PRACTICES

### ✅ Linking Corretto

```javascript
// SEMPRE collegare activities a entità business
{
  "companyId": 25,        // Company base
  "customerId": 42,       // Se è un customer
  "contactId": 15,        // Persona specifica
  "opportunityId": 8      // Deal specifico
}

// ❌ MAI creare activity senza relazioni
{
  "subject": "Chiamata generica"
  // ERRORE: nessuna relazione specificata
}
```

### 🎯 Outcome Tracking

```javascript
// Traccia SEMPRE l'outcome delle attività completate
{
  "status": "COMPLETED",
  "outcome": "SUCCESSFUL",              // Cosa è successo?
  "result": "Testo descrittivo...",      // Dettagli
  "requiresFollowUp": true,              // Serve altro?
  "followUpDate": "2025-12-10T10:00:00Z" // Quando?
}
```

### 📊 Reminder e Notifiche

```javascript
{
  "scheduledStart": "2025-12-10T10:00:00Z",
  "reminderMinutes": 15,  // Notifica 15 min prima
  "reminderSent": false   // Sistema traccia invio
}
```

---

## 6. PERMESSI RICHIESTI

```typescript
// Lettura activities
['activity:read', 'activity:manage']

// Creazione/Modifica
['activity:create', 'activity:update', 'activity:manage']

// Eliminazione
['activity:delete', 'activity:manage']

// Templates (solo admin)
['activity:manage']
```

---

## 🚀 Funzionalità Avanzate Future

- [ ] Ricorrenze (meeting settimanali)
- [ ] Sincronizzazione Google Calendar / Outlook
- [ ] AI-powered suggestions per follow-up
- [ ] Email tracking integration
- [ ] Call recording transcription
- [ ] Sentiment analysis su outcome
- [ ] Pipeline automation basata su activity outcomes