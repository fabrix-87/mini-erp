# CRM Data Model — Architecture

This document describes the data architecture of the CRM module in Mini-ERP,
covering the Lead, Activity, and Opportunity models and their relationships.

---

## Entity Overview

```

Country ──────────────────────────────────────────────────────────┐
                                                                  │
User ──────────────────────────────────────────────────────────┐  │
                                                               │  │
Lead ───────────────────────────────────────────────────────┐  │  │
│   (1:N)                                                   │  │  │
├──► Activity (leadId)                                      │  │  │
├──► Document (leadId)                                      │  │  │
├──► Opportunity (leadId, nullable)                         │  │  │
└──► Customer (convertedToId, 1:1 unique)                   │  │  │
                                                            │  │  │
Opportunity ─────────────────────────────────────────┐      │  │  │
│   (1:N)                                            │      │  │  │
├──► Activity (opportunityId)                        │      │  │  │
├──► Document (opportunityId)                        │      │  │  │
└──► ClosedReason (closedReasonId, N:1)              │      │  │  │
                                                     │      │  │  │
Activity ─────────────────────────────────────────┐  │      │  │  │
│   (1:N)                                         │  │      │  │  │
├──► ActivityParticipant (activityId)             │  │      │  │  │
└──► Activity (followUpActivityId, self-ref)      │  │      │  │  │
                                                  │  │      │  │  │
ActivityTemplate (standalone lookup)              │  │      │  │  │
ClosedReason (standalone lookup)                  │  │      │  │  │

```

---

## Schema Files

| Model                 | File                                            |
|-----------------------|-------------------------------------------------|
| `Lead`                | `prisma/schema/lead.prisma`                     |
| `Activity`            | `prisma/schema/activity.prisma`                 |
| `ActivityParticipant` | `prisma/schema/activity.prisma`                 |
| `ActivityTemplate`    | `prisma/schema/activity.prisma`                 |
| `Opportunity`         | `prisma/schema/opportunity.prisma`              |
| `ClosedReason`        | `prisma/schema/opportunity.prisma`              |

---

## Lead Model

### Key Enums

| Enum          | Values                                                                     |
|---------------|----------------------------------------------------------------------------|
| `LeadStatus`  | `NEW`, `CONTACTED`, `QUALIFIED`, `UNQUALIFIED`, `NURTURING`, `CONVERTED`, `LOST`, `DUPLICATE`, `ARCHIVED` |
| `LeadSource`  | `WEBSITE`, `REFERRAL`, `SOCIAL_MEDIA`, `EMAIL_CAMPAIGN`, `PHONE_CALL`, `COLD_CALL`, `EVENT`, `PARTNER`, `ADVERTISING`, `CONTENT`, `DIRECT`, `CHAT`, `OTHER` |
| `LeadQuality` | `HOT`, `WARM`, `COLD`                                                      |

### Field Groups

| Group                     | Key Fields                                                         |
|---------------------------|--------------------------------------------------------------------|
| Identity                  | `id`, `code` (unique, `LEAD-YYYY-NNNN`)                           |
| Company Data              | `companyName`, `tradeName`, `website`, `vatNumber`, `taxCode`      |
| Primary Contact           | `contactFirstName`, `contactLastName`, `contactEmail`, `contactPhone` |
| Address                   | `address`, `city`, `provinceCode`, `zipCode`, `countryCode`        |
| Sales Pipeline            | `status`, `source`, `quality`, `score`                            |
| Qualification (BANT)      | `budget`, `decisionAuthority`, `primaryNeed`, `purchaseTimeframe`, `bantQualified` |
| Tracking                  | `firstContactDate`, `lastContactDate`, `nextFollowUpDate`, `contactAttempts` |
| Conversion                | `convertedAt`, `convertedToId`, `convertedByUserId`               |
| GDPR                      | `privacyConsent`, `marketingConsent`, `doNotCall`, `doNotEmail`    |
| UTM / Campaign            | `campaignName`, `utmSource`, `utmMedium`, `utmCampaign`, `landingPage` |
| Meta                      | `notes`, `description`, `customFields`, `competitors`              |

---

## Activity Model

### Key Enums

| Enum               | Values                                                                           |
|--------------------|----------------------------------------------------------------------------------|
| `ActivityType`     | `CALL`, `EMAIL`, `MEETING`, `TASK`, `NOTE`, `WHATSAPP`, `SMS`, `VIDEO_CALL`, `SITE_VISIT`, `OTHER` |
| `ActivityStatus`   | `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `RESCHEDULED`, `NO_SHOW`  |
| `ActivityPriority` | `LOW`, `MEDIUM`, `HIGH`, `URGENT`                                                |
| `ActivityOutcome`  | `SUCCESSFUL`, `NO_ANSWER`, `LEFT_MESSAGE`, `FOLLOW_UP_NEEDED`, `NOT_INTERESTED`, `WRONG_CONTACT`, `CALLBACK_LATER`, `POSTPONED`, `OTHER` |

### Polymorphic Entity Links

Activity uses optional FKs to link to multiple entity types simultaneously. This is a
**nullable multi-FK pattern** rather than a polymorphic association:

```

Activity
├── leadId?        → Lead
├── customerId?    → Customer
├── companyId?     → Company
├── contactId?     → Contact
└── opportunityId? → Opportunity

```

### Self-Referential Follow-Up

```

Activity (parent)
└──► followUpActivityId → Activity (child/follow-up)
└──► followedUpBy[] ← (inverse relation)

```

---

## Opportunity Model

### Key Enums

| Enum                  | Values                                                                      |
|-----------------------|-----------------------------------------------------------------------------|
| `OpportunityStatus`   | `OPEN`, `WON`, `LOST`, `PENDING`, `CLOSED`                                  |
| `SalesStage`          | `LEAD_QUALIFICATION`, `PROSPECTING`, `NEEDS_ANALYSIS`, `PROPOSAL_SENT`, `NEGOTIATION`, `COMMITMENT` |
| `OpportunitySource`   | `LEAD`, `CUSTOMER`, `INBOUND`, `OUTBOUND`, `REFERRAL`, `PARTNER`, `EVENT`, `OTHER` |

### Weighted Value Computation

```

weightedValue = estimatedValue × (probability / 100)

```

This field is **not computed at DB level** — it must be recalculated in the service layer
on every update to `estimatedValue` or `probability`.

### Dual Entity Linkage

```

Opportunity
├── customerId  (required) → Customer
└── leadId      (optional) → Lead

```

An opportunity always belongs to a Customer. The `leadId` traces its CRM origin.

---

## Inter-Module Relationships

```

Lead ──────────► Opportunity ──────────► Activity
│                                          ▲
└──────────────────────────────────────────┘
(direct leadId FK)

Lead ──────────► Customer
(convertedToId, 1:1)

```

### Cascade & Nullify Strategy

| Parent Deleted | Child Affected         | Behaviour      |
|----------------|------------------------|----------------|
| `Lead`         | `Activity`             | `Cascade`      |
| `Lead`         | `Document`             | (see document.prisma) |
| `Customer`     | `Opportunity`          | `Cascade`      |
| `Opportunity`  | `Activity`             | `SetNull`      |
| `Contact`      | `Activity`             | `SetNull`      |
| `User`         | `Lead` (assignedUser)  | `SetNull`      |

---

## Controllers

| Module        | Controller File                               |
|---------------|-----------------------------------------------|
| Activity      | `controllers/activity.ts` + `controllers/activity/` |
| Opportunity   | `controllers/opportunity.ts`                  |
| _(Lead)_      | _(controller not yet present — to be created)_ |

---

## Design Decisions & Notes

1. **Split Prisma schema**: Each domain has its own `.prisma` file under `prisma/schema/`.
   This improves maintainability in large monorepos.

2. **Lead code generation**: The `code` field (`LEAD-YYYY-NNNN`) is `@unique` and should be
   auto-generated at the service layer before `prisma.lead.create()`.

3. **No OpportunityProduct join table**: `proposedProducts` uses a JSON field for simplicity.
   Consider migrating to a proper join table if product-level reporting is required.

4. **`daysInCurrentStage` & `totalActivities`**: These are denormalized counters.
   They must be updated synchronously in the service layer or via a scheduled job.

5. **GDPR fields on Lead**: Consent fields are on `Lead` directly (not on a separate consent
   table). This is acceptable at the current scale; a dedicated `Consent` model is recommended
   if regulatory requirements increase.

6. **`customFields: Json?`**: All three core models support arbitrary JSON for extensibility
   without schema migrations.