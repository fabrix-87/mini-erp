# Opportunity Pipeline Guide

This guide explains how to manage sales Opportunities in the Mini-ERP CRM, from lead
qualification through to won or lost deals.

---

## Overview

An **Opportunity** represents a concrete sales potential with a quantifiable value and a
defined sales process stage. It is the bridge between a qualified `Lead` and a closed deal.

---

## Opportunity Lifecycle
```
LEAD_QUALIFICATION → PROSPECTING → NEEDS_ANALYSIS → PROPOSAL_SENT → NEGOTIATION → COMMITMENT
↓
WON / LOST / PENDING / CLOSED
```

### Sales Stages

| Stage                | Description                                      | Typical Probability |
|----------------------|--------------------------------------------------|---------------------|
| `LEAD_QUALIFICATION` | Assessing fit and interest                       | 10–20%              |
| `PROSPECTING`        | Active outreach and discovery                    | 20–30%              |
| `NEEDS_ANALYSIS`     | Deep dive into client needs                      | 30–50%              |
| `PROPOSAL_SENT`      | Formal proposal or quote delivered               | 50–70%              |
| `NEGOTIATION`        | Terms and pricing being negotiated               | 70–85%              |
| `COMMITMENT`         | Agreement reached, awaiting formal closure       | 85–95%              |

### Opportunity Statuses

| Status    | Description                               |
|-----------|-------------------------------------------|
| `OPEN`    | Active opportunity, being worked on       |
| `WON`     | Successfully closed deal                  |
| `LOST`    | Deal was lost to competition or no budget |
| `PENDING` | Awaiting an external decision             |
| `CLOSED`  | Generically closed (non-WON/LOST)         |

---

## Financial Metrics

| Field            | Description                                        |
|------------------|----------------------------------------------------|
| `estimatedValue` | Expected deal value (Decimal, 15,2)                |
| `probability`    | Win probability percentage (0–100, maps to Stage)  |
| `weightedValue`  | Computed: `estimatedValue × (probability / 100)`   |
| `actualValue`    | Real value at closure (set when WON)               |

> `weightedValue` should be recalculated whenever `estimatedValue` or `probability` changes.
> This is enforced at the application/service layer, not at DB level.

---

## Entity Linkage

An opportunity **must** have a `customerId`. The `leadId` is optional and represents the
originating lead before full conversion.

| Field        | Required | Description                                          |
|--------------|----------|------------------------------------------------------|
| `customerId` | ✅ Yes   | The Customer this opportunity belongs to             |
| `leadId`     | ❌ No    | The Lead that originated this opportunity (nullable) |

> Validation rule: at least one of `leadId` or a direct customer-originated source must be traceable.
> Enforced at application level, not DB level.

---

## Sources

| Source     | Description                                 |
|------------|---------------------------------------------|
| `LEAD`     | Originated from a converted/qualifying Lead |
| `CUSTOMER` | Upsell or cross-sell from existing customer |
| `INBOUND`  | Inbound request                             |
| `OUTBOUND` | Outbound sales action                       |
| `REFERRAL` | Customer or partner referral                |
| `PARTNER`  | Channel partner                             |
| `EVENT`    | Trade show or event                         |
| `OTHER`    | Unspecified                                 |

---

## Stage Stagnation Monitoring

| Field                | Description                                             |
|----------------------|---------------------------------------------------------|
| `lastStageChange`    | DateTime of last stage update (auto-set to `now()`)     |
| `daysInCurrentStage` | Computed integer; identifies stagnant opportunities     |

> `daysInCurrentStage` must be kept in sync at the application layer (e.g. via a nightly job
> or recalculated on each `stage` update).

---

## Closing an Opportunity

When closing (WON or LOST):

1. Set `status` to `WON` or `LOST`
2. Set `closedDate` to current datetime
3. Populate `closedReasonId` from the `ClosedReason` lookup table
4. Add `closedNotes` for internal context
5. For WON: set `actualValue`

### ClosedReason

The `ClosedReason` model is a configurable lookup:

| Field          | Description                                       |
|----------------|---------------------------------------------------|
| `code`         | Unique code, e.g. `PRICE`, `COMPETITOR`, `NO_BUDGET` |
| `description`  | Human-readable label                              |
| `isWon`        | `true` = win reason, `false` = loss reason        |
| `active`       | Whether this reason is selectable in the UI       |
| `displayOrder` | UI ordering                                       |

---

## Activity & Document Tracking

| Relation          | Description                                          |
|-------------------|------------------------------------------------------|
| `activities`      | All CRM activities linked to this opportunity        |
| `documents`       | Attached documents (proposals, contracts, etc.)      |
| `totalActivities` | Counter of linked activities (updated at app layer)  |
| `lastActivityDate`| DateTime of most recent activity                     |

---

## Proposed Products

The `proposedProducts` field is a flexible JSON array:

```json
[
  { "productId": 42, "quantity": 10, "price": 99.00, "discount": 5 },
  { "productId": 17, "quantity": 2,  "price": 450.00, "discount": 0 }
]
```

This is a simplified approach. A dedicated OpportunityProduct join table should be
considered if advanced reporting per product is needed.

Database Indexes
Key indexes for performance:

status, stage, source

leadId, customerId

assignedUserId — for "my pipeline" queries

expectedCloseDate — for forecast reports

closedDate — for historical analysis


