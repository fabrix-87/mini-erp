// types/activity.ts
import { Contact } from "./contact";

export interface ActivityDashboardStats {
  planned: number;
  completed: number;
  overdue: number;
  todayCount: number;
  upcomingWeek: number;
  completionRate: number;
}

export interface ActivityStatsParams {
  startDate?: string;
  endDate?: string;
  userId?: number;
}

export interface ActivityStats {
  byType: Array<{ type: string; _count: number }>;
  byStatus: Array<{ status: string; _count: number }>;
  byPriority: Array<{ priority: string; _count: number }>;
  byOutcome: Array<{ outcome: string; _count: number }>;
  overdue: number;
  today: number;
  followUp: number;
}

export interface getActivitiesParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  activityType?: string;
  status?: string;
  priority?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  customerId?: number;
  companyId?: number;
}

export type ActivityType = 
  | "CALL"
  | "EMAIL"
  | "MEETING"
  | "TASK"
  | "NOTE"
  | "WHATSAPP"
  | "SMS"
  | "VIDEO_CALL"
  | "SITE_VISIT"
  | "OTHER";

export type ActivityStatus =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "RESCHEDULED"
  | "NO_SHOW";

export type ActivityPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type ActivityOutcome =
  | "SUCCESSFUL"
  | "NO_ANSWER"
  | "LEFT_MESSAGE"
  | "FOLLOW_UP_NEEDED"
  | "NOT_INTERESTED"
  | "WRONG_CONTACT"
  | "CALLBACK_LATER"
  | "POSTPONED"
  | "OTHER";

// Customer come restituito dal backend con i dati della Company
export interface ActivityCustomer {
  id: number;
  leadStatus: string;
  segment: string;
  priority: string;
  type: string;
  company: {
    id: number;
    code: string;
    companyName: string;
    tradeName?: string;
    vatNumber?: string;
    taxCode?: string;
    mainEmail?: string;
    mainPhone?: string;
  };
}

export interface Activity {
  id: number;
  
  // Customer come campo principale
  customerId: number;
  Customer?: ActivityCustomer;
  
  // Gestito dal backend automaticamente
  companyId?: number;
  
  contactId?: number;
  Contact?: Contact;
  
  opportunityId?: number;
  
  assignedUserId: number;
  createdByUserId: number;

  // Campi Principali
  type: ActivityType;
  subject: string;
  description?: string;
  location?: string;

  // Stato e Priorità
  status: ActivityStatus;
  priority: ActivityPriority;
  outcome?: ActivityOutcome;

  // Date e Durata
  scheduledStart: string;
  scheduledEnd?: string;
  actualStart?: string;
  actualEnd?: string;
  duration?: number;

  // Promemoria
  reminderMinutes?: number;
  reminderSent: boolean;

  // Follow-up
  requiresFollowUp: boolean;
  followUpDate?: string;
  followUpActivityId?: number;

  // Risultato
  result?: string;
  internalNotes?: string;

  // Allegati e Custom Fields
  attachments?: any;
  customFields?: any;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface ActivityFormData {
  customerId: string; // Customer ID invece di Company
  contactId: string;
  type: ActivityType;
  subject: string;
  description: string;
  status: ActivityStatus;
  priority: ActivityPriority;
  scheduledStart: string;
  scheduledEnd?: string;
  duration?: string;
  reminderMinutes?: string;
  location: string;
  outcome?: ActivityOutcome | string;
  result?: string;
  internalNotes?: string;
  requiresFollowUp: boolean;
  followUpDate?: string;
  customFields?: any;
}
