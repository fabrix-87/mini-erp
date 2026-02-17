# Lead Management Guide

This guide describes how the Lead module works in the Mini-ERP CRM, covering the full lifecycle
from creation to conversion or loss.

---

## Overview

A **Lead** represents a potential business contact or company that has not yet been qualified
as a Customer. Each lead is assigned a unique auto-generated code (e.g. `LEAD-2026-0001`).

---

## Lead Lifecycle

```
NEW → CONTACTED → QUALIFIED → [Opportunity created] → CONVERTED
↓
UNQUALIFIED / NURTURING / LOST / DUPLICATE / ARCHIVED
```

### Status Descriptions

| Status        | Description                                         |
|---------------|-----------------------------------------------------|
| `NEW`         | Lead just entered the system, not yet contacted     |
| `CONTACTED`   | First contact has been made                         |
| `QUALIFIED`   | Lead meets criteria; ready to become an Opportunity |
| `UNQUALIFIED` | Does not meet target criteria                       |
| `NURTURING`   | In long-term cultivation (e.g. content, drip email) |
| `CONVERTED`   | Successfully converted to a Customer                |
| `LOST`        | Disqualified or not interested                      |
| `DUPLICATE`   | Identified as a duplicate of another lead           |
| `ARCHIVED`    | Archived, no further action                         |

---

## Lead Quality & Scoring

Each lead has two complementary fields for prioritisation:

- **`quality`** (`HOT` / `WARM` / `COLD`) — manually set by the sales rep
- **`score`** (0–100 integer) — intended for automated scoring based on:
  - Demographic fit (company size, industry)
  - Behavioural signals (site visits, email opens)
  - Engagement level (contact attempts, response rate)

> Composite index `(quality, score)` ensures efficient queries for prioritised lead lists.

---

## BANT Qualification

The Lead model supports the **BANT** framework (Budget, Authority, Need, Timeframe):

| Field                | Purpose                                    |
|----------------------|--------------------------------------------|
| `budget`             | Estimated available budget                 |
| `decisionAuthority`  | Role of the contact (Decision Maker, etc.) |
| `primaryNeed`        | Main pain point or need                    |
| `purchaseTimeframe`  | Estimated buying horizon                   |
| `bantQualified`      | Boolean flag set after BANT validation     |
| `bantNotes`          | Free-text notes on the qualification       |

---

## Lead Sources

Leads can be tracked by acquisition channel via the `source` enum:

`WEBSITE`, `REFERRAL`, `SOCIAL_MEDIA`, `EMAIL_CAMPAIGN`, `PHONE_CALL`, `COLD_CALL`,
`EVENT`, `PARTNER`, `ADVERTISING`, `CONTENT`, `DIRECT`, `CHAT`, `OTHER`

UTM tracking fields (`utmSource`, `utmMedium`, `utmCampaign`, `landingPage`, `referrer`)
are available for digital campaign attribution.

---

## GDPR Consent Fields

| Field                  | Description                              |
|------------------------|------------------------------------------|
| `privacyConsent`       | General data processing consent          |
| `privacyConsentDate`   | Date consent was given                   |
| `marketingConsent`     | Consent to receive marketing             |
| `marketingConsentDate` | Date marketing consent was given         |
| `doNotCall`            | Opt-out from phone outreach              |
| `doNotEmail`           | Opt-out from email outreach              |

---

## Lead Conversion

When a lead is converted to a Customer:

1. Set `status = CONVERTED`
2. Populate `convertedAt` (DateTime), `convertedToId` (Customer FK), `convertedByUserId`
3. Any linked `Opportunity` with `leadId` continues to exist and is re-linked to `customerId`

> `convertedToId` has a `@unique` constraint — one lead maps to exactly one Customer.

---

## Contact Tracking

| Field               | Description                                  |
|---------------------|----------------------------------------------|
| `firstContactDate`  | Date of first outreach                       |
| `lastContactDate`   | Date of most recent contact                  |
| `nextFollowUpDate`  | Scheduled next follow-up (indexed)           |
| `contactAttempts`   | Counter of outreach attempts                 |
| `lastStatusChange`  | DateTime of last status update               |

---

## Relationships

| Relation        | Type         | Description                                  |
|-----------------|--------------|----------------------------------------------|
| `activities`    | `Activity[]` | All CRM activities linked to this lead       |
| `documents`     | `Document[]` | Attached files and documents                 |
| `opportunities` | `Opportunity[]` | Opportunities originated from this lead   |
| `assignedUser`  | `User`       | Sales rep responsible for the lead           |
| `convertedTo`   | `Customer`   | Customer created upon conversion             |
| `country`       | `Country`    | Country of origin (default: `IT`)            |

---

## Database Indexes

Key indexes for performance:

- `status`, `source`, `quality`, `score`
- `assignedUserId` — for "my leads" queries
- `contactEmail` — for deduplication
- `nextFollowUpDate` — for follow-up dashboards
- `(status, assignedUserId)` — composite for filtered listing
- `(quality, score)` — composite for lead ranking