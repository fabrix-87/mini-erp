import { BaseCompany } from "./company";
import { Contact } from "./contact";

/**
 * Statistiche per la dashboard delle attività
 */
export interface ActivityDashboardStats {
  planned: number;
  completed: number;
  overdue: number;
  todayCount: number;
  upcomingWeek: number;
  completionRate: number;
}

export interface getActivitiesParams {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: string;
  activityType?: string;
  status?: string;
  priority?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  companyId?: number;
}


/**
 * Tipi possibili per il Tipo di Attività
 */
export type ActivityType = "call" | "meeting" | "email" | "task" | "other";

/**
 * Tipi possibili per lo Status
 */
export type ActivityStatus =
  | "planned"
  | "in_progress"
  | "completed"
  | "cancelled";

/**
 * Tipi possibili per la Priority
 */
export type ActivityPriority = "low" | "medium" | "high";

/**
 * Tipo principale per l'entità Attività (Activity)
 */
export interface Activity {
  // Campi Identificativi e Relazioni
  id: number;
  companyId: number;
  contactId?: number; // Opzionale
  assignedUserId: number;
  createdByUserId: number;

  // Campi Principali
  activityType: ActivityType;
  direction?: "inbound" | "outbound"; // Se definito nel DB
  subject: string;
  description?: string;

  // Stato e Priorità
  status: ActivityStatus;
  priority: ActivityPriority;

  // Date e Durata
  scheduledDate: string; // Utilizza string per le date serializzate JSON
  durationMinutes?: number;
  completedDate?: string;
  reminderDate?: string;

  // Risultato e Follow-up
  location?: string;
  outcome?: string;
  outcomeNotes?: string;
  requiresFollowUp: boolean;
  followUpDate?: string;
  followUpActivityId?: number;

  // Campi Correlati
  relatedOpportunityId?: number;
  relatedQuoteId?: number;
  relatedOrderId?: number;

  // Metadata e Privacy
  participants?: any[]; // 
  attachments?: any[]; // 
  tags?: string[];
  isPrivate: boolean;

  createdAt: string;
  updatedAt: string;

  // Inclusione delle Relazioni (come ritornate dagli endpoint)
  Company?: BaseCompany;
  Contact?: Contact;
  followUpActivity?: Activity; // Auto-referenziante per l'attività di follow-up
}

export interface ActivityFormData {
  companyId: string
  contactId: string
  activityType: string
  direction: string
  subject: string
  description: string
  status: string
  priority: string
  scheduledDate: string
  scheduledTime: string
  completedDate: string
  durationMinutes: string
  reminderDate: string
  reminderTime: string
  location: string
  outcome: string
  outcomeNotes: string
  requiresFollowUp: boolean
  followUpDate: string
  isPrivate: boolean
}