# Activity Tracking Guide

This guide explains how Activities work in the Mini-ERP CRM. Activities represent all
interactions and tasks associated with Leads, Customers, Contacts, and Opportunities.

---

## Overview

An **Activity** is any trackable interaction or task within the CRM. It can be linked to one
or more entities: a `Lead`, a `Customer`, a `Contact`, and/or an `Opportunity`.

---

## Activity Types

| Type          | Description                       |
|---------------|-----------------------------------|
| `CALL`        | Outbound or inbound phone call    |
| `EMAIL`       | Email communication               |
| `MEETING`     | In-person or scheduled meeting    |
| `TASK`        | Generic to-do item                |
| `NOTE`        | Internal memo or note             |
| `WHATSAPP`    | WhatsApp message                  |
| `SMS`         | SMS message                       |
| `VIDEO_CALL`  | Video conference                  |
| `SITE_VISIT`  | On-site visit to the client       |
| `OTHER`       | Catch-all type                    |

---

## Activity Statuses

| Status        | Description                          |
|---------------|--------------------------------------|
| `SCHEDULED`   | Planned for the future               |
| `IN_PROGRESS` | Currently happening                  |
| `COMPLETED`   | Successfully finished                |
| `CANCELLED`   | Cancelled before execution           |
| `RESCHEDULED` | Moved to a new date/time             |
| `NO_SHOW`     | Participant(s) did not show up       |

---

## Activity Outcomes

After completing an activity, record the outcome using the `outcome` field:

`SUCCESSFUL`, `NO_ANSWER`, `LEFT_MESSAGE`, `FOLLOW_UP_NEEDED`,
`NOT_INTERESTED`, `WRONG_CONTACT`, `CALLBACK_LATER`, `POSTPONED`, `OTHER`

---

## Scheduling & Duration

| Field            | Description                                |
|------------------|--------------------------------------------|
| `scheduledStart` | Planned start datetime (required)          |
| `scheduledEnd`   | Planned end datetime                       |
| `actualStart`    | Actual start time (set when started)       |
| `actualEnd`      | Actual end time (set when completed)       |
| `duration`       | Duration in minutes (can be pre-set)       |

---

## Reminders

| Field             | Description                                          |
|-------------------|------------------------------------------------------|
| `reminderMinutes` | Minutes before start to trigger a reminder (e.g. 15)|
| `reminderSent`    | Boolean flag, set to `true` after sending            |

---

## Linking to Entities

An activity can be simultaneously linked to multiple entities:

| Field           | Links to      | On Delete     |
|-----------------|---------------|---------------|
| `leadId`        | `Lead`        | `Cascade`     |
| `customerId`    | `Customer`    | `Cascade`     |
| `companyId`     | `Company`     | `Cascade`     |
| `contactId`     | `Contact`     | `SetNull`     |
| `opportunityId` | `Opportunity` | `SetNull`     |

> When a Lead or Customer is deleted, all linked activities are also deleted (Cascade).
> Contact and Opportunity deletions only nullify the FK (SetNull).

---

## Participants (`ActivityParticipant`)

For `MEETING` and `VIDEO_CALL` types, participants can be tracked via the
`ActivityParticipant` join model:

| Field           | Description                                           |
|-----------------|-------------------------------------------------------|
| `userId`        | Internal user participant                             |
| `contactId`     | External contact participant                          |
| `externalEmail` | Email for participants outside the system             |
| `externalName`  | Name for external participants                        |
| `status`        | `invited` / `accepted` / `declined` / `attended` / `no_show` |
| `role`          | `organizer` / `required` / `optional`                 |

---

## Follow-Up Chain

Activities support recursive follow-up tracking:

| Field               | Description                                              |
|---------------------|----------------------------------------------------------|
| `requiresFollowUp`  | Boolean flag to mark that a follow-up is needed          |
| `followUpDate`      | Scheduled date for the follow-up                         |
| `followUpActivityId`| FK to the new Activity created as follow-up              |
| `followedUpBy`      | Inverse: activities that were generated as follow-ups    |

---

## Activity Templates (`ActivityTemplate`)

Reusable templates allow teams to standardise common activity types:

| Field                | Description                                   |
|----------------------|-----------------------------------------------|
| `type`               | Activity type this template applies to        |
| `defaultSubject`     | Pre-filled subject line                       |
| `defaultDescription` | Pre-filled description                        |
| `defaultDuration`    | Pre-filled duration in minutes                |
| `checklist`          | JSON array of steps/items to complete         |
| `active`             | Whether the template is available for use     |

---

## Database Indexes

Key indexes for performance:

- `type`, `status`, `priority`
- `companyId`, `customerId`, `opportunityId`, `leadId`
- `assignedUserId` — for "my activities" queries
- `scheduledStart`, `scheduledEnd` — for calendar/agenda queries