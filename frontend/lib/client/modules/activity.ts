import { ApiResponse } from "@/types/api";
import api from "../api";
import {
  Activity,
  ActivityDashboardStats,
  ActivityFormData,
  ActivityPriority,
  ActivityStatus,
  ActivityType,
  getActivitiesParams,
} from "@/types/activitiy";
import { formatDateTime } from "../helpers";

/**
 * Ricava le statistiche per la dashboard delle attività
 * @param userId
 * @returns
 */
export const getActivitiesStats = async (
  userId: number
): Promise<ApiResponse<ActivityDashboardStats>> => {
  const response = await api.get("/activities/dashboard/stats", {
    params: { userId },
  });
  return response.data;
};

/**
 * Ritorna l'attività
 * @param activityId
 * @returns
 */
export const getActivity = async (
  activityId: number
): Promise<ApiResponse<Activity>> => {
  const response = await api.get(`/activities/${activityId}`);
  return response.data;
};

export const getActivities = async (
  params: getActivitiesParams
): Promise<ApiResponse<Activity[]>> => {
  const response = await api.get(`/activities/`, { params });
  return response.data;
};

export const setComplete = async (
  activityId: number,
  outcomeNote: string
): Promise<ApiResponse<Activity>> => {
  const response = await api.post(`/activities/${activityId}/complete`, {
    params: {
      outcome: "successful",
      outcomeNotes: outcomeNote,
    },
  });
  return response.data;
};

export const createFollowUp = async (
  activityId: number,
  scheduledDate: string
): Promise<ApiResponse<Activity>> => {
  const response = await api.post(`/activities/${activityId}/follow-up`, {
    params: { scheduledDate },
  });
  return response.data;
};

export const deleteActivity = async (
  activityId: number
): Promise<ApiResponse<Activity>> => {
  const response = await api.delete(`/activities/${activityId}`);
  return response.data;
};

/**
 * Riceve le attività imminenti dell'utente
 * @param limit
 * @param userId
 * @returns
 */
export const getUpcomingActivities = async (
  limit: number,
  userId: number
): Promise<ApiResponse<Activity[]>> => {
  const response = await api.get("/activities/calendar/upcoming", {
    params: { limit, userId },
  });
  return response.data;
};

export const updateActivity = async (
  activityId: number,
  payload: Partial<Activity>
): Promise<ApiResponse<Activity>> => {
  const response = await api.put(`/activities/${activityId}`, payload);
  return response.data;
};

export const createActivity = async (
  payload: Partial<Activity>
): Promise<ApiResponse<Activity>> => {
  const response = await api.post(`/activities`, payload);
  return response.data;
};

// Array di tipi di attività che richiedono la direzione
const DIRECTION_REQUIRED_TYPES = ["call", "email"];
const ALL_ACTIVITY_PRIORITY = ["low", "medium", "hight"];
const ALL_ACTIVITY_STATUS = [
  "planned",
  "in_progress",
  "completed",
  "cancelled",
];
const ALL_ACTIVITY_TYPES: string[] = [
  "call",
  "email",
  "meeting",
  "task",
  "note",
  "visit",
  "demo",
  "proposal",
  "quote",
  "order",
  "support_ticket",
  "complaint",
  "reminder",
  "other",
];

/**
 * Converte i dati del form in un payload compatibile con l'interfaccia Activity.
 * @param formData I dati grezzi ricevuti dal form.
 * @returns Un oggetto payload tipizzato per l'API.
 */
export const createActivityPayload = (
  formData: ActivityFormData
): Partial<Activity> => {
  // 1. Gestione Date/Time
  const scheduledDateTimeISO = formatDateTime(
    formData.scheduledDate,
    formData.scheduledTime
  );

  const reminderDateTimeISO = formatDateTime(
    formData.reminderDate,
    formData.reminderTime
  );

  // 2. Validazione e Casting di activityType e direction
  const activityTypeValidated = ALL_ACTIVITY_TYPES.includes(
    formData.activityType
  )
    ? (formData.activityType as ActivityType)
    : ("other" as ActivityType); // Fallback di sicurezza

  const directionValidated = DIRECTION_REQUIRED_TYPES.includes(
    activityTypeValidated
  )
    ? (formData.direction as "inbound" | "outbound") || undefined
    : undefined;

  const statusValidated = ALL_ACTIVITY_STATUS.includes(formData.status)
    ? (formData.status as ActivityStatus)
    : undefined;

  const priorityValidated = ALL_ACTIVITY_PRIORITY.includes(formData.priority)
    ? (formData.priority as ActivityPriority)
    : undefined;

  // 3. Costruzione del Payload
  const payload: Partial<Activity> = {
    // Conversione da stringa a numero intero (richiede parseInt)
    companyId: parseInt(formData.companyId, 10),
    contactId: formData.contactId
      ? parseInt(formData.contactId, 10)
      : undefined,

    // Tipi validati
    activityType: activityTypeValidated,
    direction: directionValidated,

    // Stringhe e Booleani (passati direttamente)
    subject: formData.subject,
    description: formData.description || undefined, // undefined se vuoto per l'API
    status: statusValidated,
    priority: priorityValidated,
    isPrivate: formData.isPrivate,
    requiresFollowUp: formData.requiresFollowUp,

    // Date/Ora convertite in stringa ISO o null
    scheduledDate: scheduledDateTimeISO,
    completedDate: formData.completedDate || undefined, // Se è solo data (YYYY-MM-DD)
    reminderDate: reminderDateTimeISO,
    followUpDate: formData.followUpDate || undefined,

    // Numeri
    durationMinutes: formData.durationMinutes
      ? parseInt(formData.durationMinutes, 10)
      : undefined,

    // Stringhe opzionali che possono essere null
    location: formData.location || undefined,
    outcome: formData.outcome || undefined,
    outcomeNotes: formData.outcomeNotes || undefined,
  };

  // Rimuovi le chiavi con valore 'undefined' se l'API non le accetta (buona pratica per PATCH/CREATE)
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  ) as Partial<Activity>;
};
