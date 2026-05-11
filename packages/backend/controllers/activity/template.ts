import { Response } from "express";
import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../config/prisma-config";
import asyncHandler from "../../middleware/async-handler-middleware";
import {
  sendSuccess,
  sendCreated,
  sendDeleted,
  sendError,
  sendNotFound,
} from "../../utils/response-utils";
import {
  CreateActivityTemplateInput,
  UpdateActivityTemplateInput,
  CreateActivityFromTemplateInput,
  ActivityTemplateQueryInput,
  ActivityTemplateIdParam,
} from "@mini-erp/shared/types";
import {
  clean,
  connectOrDisconnectById,
  toDate,
  toRequiredDate,
} from "../../helpers/prisma-helper";
import { Context } from "hono";
import { AppBindings } from "@/lib/hono-app";
import {
  getValidatedBody,
  getValidatedParams,
  getValidatedQuery,
} from "@/helpers/validated-context";

// ============================================================================
// ACTIVITY TEMPLATE CONTROLLER
// ============================================================================

/**
 * @desc    Get all Activity Templates
 * @route   GET /api/activity-templates
 * @access  Private (activity:read)
 */
export const getAllActivityTemplates = async (c: Context<AppBindings>) => {
  const {
    active,
    type,
    sortBy = "name",
    sortOrder = "asc",
  } = getValidatedQuery<ActivityTemplateQueryInput>(c);

  const where: Prisma.ActivityTemplateWhereInput = {};
  if (active !== undefined) where.active = active;
  if (type) where.type = type;

  const templates = await prisma.activityTemplate.findMany({
    where,
    orderBy: { [sortBy as string]: sortOrder },
  });

  return sendSuccess(c, templates, { results: templates.length });
};

/**
 * @desc    Get Activity Template by ID
 * @route   GET /api/activity-templates/:id
 * @access  Private (activity:read)
 */
export const getActivityTemplateById = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<ActivityTemplateIdParam>(c);

  const template = await prisma.activityTemplate.findUnique({
    where: { id: Number(id) },
  });
  if (!template) {
    return sendNotFound(c, "Template non trovato");
  }

  return sendSuccess(c, template);
};

/**
 * @desc    Create new Activity Template
 * @route   POST /api/activity-templates
 * @access  Private (activity:manage)
 */
export const createActivityTemplate = async (c: Context<AppBindings>) => {
  const data = getValidatedBody<CreateActivityTemplateInput>(c);

  const template = await prisma.activityTemplate.create({ data });

  return sendCreated(c, template, "Template creato con successo");
};

/**
 * @desc    Update Activity Template
 * @route   PUT /api/activity-templates/:id
 * @access  Private (activity:manage)
 */
export const updateActivityTemplate = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<ActivityTemplateIdParam>(c);
  const data = getValidatedBody<UpdateActivityTemplateInput>(c);

  const existing = await prisma.activityTemplate.findUnique({
    where: { id: Number(id) },
  });
  if (!existing) {
    return sendNotFound(c, "Template non trovato");
  }

  const template = await prisma.activityTemplate.update({
    where: { id: Number(id) },
    data: clean({ ...(data as any) }),
  });

  return sendSuccess(c, template, { message: "Template aggiornato con successo" });
};

/**
 * @desc    Delete Activity Template
 * @route   DELETE /api/activity-templates/:id
 * @access  Private (activity:manage)
 */
export const deleteActivityTemplate = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<ActivityTemplateIdParam>(c);

  const template = await prisma.activityTemplate.findUnique({
    where: { id: Number(id) },
  });
  if (!template) {
    return sendNotFound(c, "Template non trovato");
  }

  await prisma.activityTemplate.delete({ where: { id: Number(id) } });

  return sendDeleted(c, "Template eliminato con successo");
};

/**
 * @desc    Create Activity from Template
 * @route   POST /api/activity-templates/:id/create-activity
 * @access  Private (activity:create)
 */
export const createActivityFromTemplate = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<ActivityTemplateIdParam>(c);
  const {
    scheduledStart,
    scheduledEnd,
    subject,
    description,
    companyId,
    customerId,
    opportunityId,
    assignedUserId,
  } = getValidatedBody<CreateActivityFromTemplateInput>(c);

  const userId = c.get("user")!.userId;

  const template = await prisma.activityTemplate.findUnique({
    where: { id: Number(id) },
  });
  if (!template) {
    return sendNotFound(c, "Template non trovato");
  }

  if (!template.active) {
    return sendError(c, {
      statusCode: 400,
      status: "fail",
      message: "Template non attivo",
    });
  }

  if (!companyId && !customerId && !opportunityId) {
    return sendError(c, {
      statusCode: 400,
      status: "fail",
      message: "Almeno una relazione (company, customer o opportunity) è obbligatoria",
    });
  }

  const assignedUser = await prisma.user.findUnique({
    where: { id: assignedUserId },
  });
  if (!assignedUser) {
    return sendNotFound(c, "Utente assegnato non trovato");
  }

  // Auto-calculate scheduledEnd from defaultDuration if not provided
  let calculatedEnd: string | undefined = scheduledEnd ?? undefined;
  if (!scheduledEnd && template.defaultDuration) {
    const start = new Date(scheduledStart as any);
    calculatedEnd = new Date(start.getTime() + template.defaultDuration * 60_000).toISOString();
  }

  const prismaData: Prisma.ActivityCreateInput = clean({
    type: template.type,
    priority: template.priority,
    status: "SCHEDULED",
    subject: subject ?? template.defaultSubject,
    description: description ?? template.defaultDescription,

    // Date
    scheduledStart: toRequiredDate(scheduledStart as string)!,
    scheduledEnd: toDate(calculatedEnd as string),
    duration: template.defaultDuration,

    // Relazioni obbligatorie
    createdBy: { connect: { id: userId } },
    assignedUser: { connect: { id: assignedUserId } },

    // Relazioni opzionali
    company: connectOrDisconnectById(companyId),
    customer: connectOrDisconnectById(customerId),
    opportunity: connectOrDisconnectById(opportunityId),

    customFields: template.checklist ? { checklist: template.checklist } : undefined,
  });

  const activity = await prisma.activity.create({
    data: prismaData,
    include: {
      company: true,
      customer: true,
      opportunity: true,
      assignedUser: { select: { id: true, username: true, email: true } },
    },
  });

  return sendCreated(c, activity, "Activity creata da template con successo");
};

/**
 * @desc    Toggle active status of a Template
 * @route   PATCH /api/activity-templates/:id/toggle-active
 * @access  Private (activity:manage)
 */
export const toggleTemplateActive = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<ActivityTemplateIdParam>(c);
  const { active } = getValidatedBody<{ active: boolean }>(c);

  const template = await prisma.activityTemplate.findUnique({
    where: { id: Number(id) },
  });
  if (!template) {
    return sendNotFound(c, "Template non trovato");
  }

  const updated = await prisma.activityTemplate.update({
    where: { id: Number(id) },
    data: { active },
  });

  return sendSuccess(c, updated, {
    message: `Template ${active ? "attivato" : "disattivato"} con successo`,
  });
};
