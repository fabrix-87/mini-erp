// types/opportunity.ts

import { Company } from "./company";
import { Contact } from "./contact";
// Assicurati di avere un tipo Contact. Se non lo hai, definiscilo qui.

/**
 * Tipi uniti per i campi ENUM
 */
export type OpportunityStage =
  | "prospecting"
  | "qualification"
  | "proposal"
  | "negotiation"
  | "closed_won"
  | "closed_lost";

export type OpportunityType =
  | "new_business"
  | "existing_business"
  | "upsell"
  | "cross_sell"
  | "renewal";

export type OpportunityPriority = "low" | "medium" | "high" | "critical";

export type OpportunityStatus = "open" | "won" | "lost" | "abandoned";

export type LossReasonCategory =
  | "price"
  | "competitor"
  | "timing"
  | "budget"
  | "no_need"
  | "other";

/**
 * Tipo di base per Opportunity
 * Le date vengono gestite come stringhe (formato ISO 8601) in JSON.
 * I decimali (es. estimatedValue) vengono tipizzati come number (o string se preferisci gestirli come tali)
 */
export interface Opportunity {
  // Identificativi e Relazioni
  id: number;
  code: string; // VARCHAR(64), unique, not null

  companyId: number; // Relazione obbligatoria
  contactId?: number; // Relazione opzionale
  assignedUserId: number; // Commerciale responsabile
  teamId?: number;
  campaignId?: number;
  relatedOrderId?: number;

  // Dati opportunità
  name: string; // VARCHAR(255), not null
  description?: string; // TEXT

  // Valore economico
  estimatedValue: number; // DECIMAL(15, 2)
  actualValue: number; // DECIMAL(15, 2)
  currency: string; // VARCHAR(3), es. 'EUR'

  // Pipeline e Stage
  pipeline: string; // VARCHAR(50)
  stage: OpportunityStage; // ENUM
  stageOrder: number;

  // Probabilità e previsione
  probability: number; // INTEGER (0-100)
  weightedValue: number; // DECIMAL(15, 2) (Calcolato)

  // Date
  expectedCloseDate?: string; // DATEONLY
  actualCloseDate?: string; // DATEONLY
  lastActivityDate?: string; // DATE
  nextActionDate?: string; // DATE

  // Origine e Priorità
  source?: string; // VARCHAR(100)
  type: OpportunityType; // ENUM
  priority: OpportunityPriority; // ENUM

  // Status e Motivi Perdita
  status: OpportunityStatus; // ENUM
  lossReason?: string; // VARCHAR(255)
  lossReasonCategory?: LossReasonCategory; // ENUM

  // Campi JSON (Array/Oggetto nel DB)
  competitors?: any[]; // JSON (Array di competitor)
  products?: any[]; // JSON (Array di prodotti/servizi)
  decisionMakers?: any[]; // JSON (Array di decision makers)
  relatedQuoteIds?: number[]; // JSON (Array di ID preventivi)
  attachments?: any[]; // JSON (Array di documenti allegati)
  tags?: string[]; // JSON (Array di tag)
  customFields?: Record<string, any>; // JSON (Campi custom)

  // Altri campi
  customerBudget?: number; // DECIMAL(15, 2)
  hasApprovedBudget: boolean;
  decisionCriteria?: string; // TEXT
  nextSteps?: string; // TEXT
  notes?: string; // TEXT

  // Metadata (Sequelize Timestamps)
  createdAt: string;
  updatedAt: string;

  // Relazioni (incluse nella risposta API)
  Company?: Company;
  Contact?: Contact;
}

export interface OpportunityDashboardStats {
  totalOpen: number;
  totalValue: number;
  totalWeightedValue: number;
  wonThisMonth: number;
  wonValueThisMonth: number;
  byStage: {
    prospecting: number;
    qualification: number;
    proposal: number;
    negotiation: number;
    closed_won: number;
    closed_lost: number;
  };
}
