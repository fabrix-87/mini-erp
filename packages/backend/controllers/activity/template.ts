import { Response } from "express";
import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../config/prisma-client";
import asyncHandler from "../../middleware/async-handler";
import {
  sendSuccess,
  sendCreated,
  sendDeleted,
  sendError,
} from "../../utils/response";
import { AuthenticatedValidatedRequest } from "@/types/validate";
import {
  CreateActivityTemplateInput,
  UpdateActivityTemplateInput,
  CreateActivityFromTemplateInput,
} from "@mini-erp/shared/types";
import {
  clean,
  connectOrDisconnectById,
  toDate,
  toRequiredDate,
} from "../../helpers/prisma";

// ============================================================================
// ACTIVITY TEMPLATE CONTROLLER
// ============================================================================

/**
 * @desc    Get all Activity Templates
 * @route   GET /api/activity-templates
 * @access  Private (activity:read)
 */
export const getAllActivityTemplates = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const {
      active,
      type,
      sortBy = "name",
      sortOrder = "asc",
    } = req.validatedQuery ?? {};

    const where: Prisma.ActivityTemplateWhereInput = {};
    if (active !== undefined)
      where.active = active === true || active === "true";
    if (type) where.type = type as any;

    const templates = await prisma.activityTemplate.findMany({
      where,
      orderBy: { [sortBy as string]: sortOrder },
    });

    sendSuccess(res, templates, { results: templates.length });
  },
);

/**
 * @desc    Get Activity Template by ID
 * @route   GET /api/activity-templates/:id
 * @access  Private (activity:read)
 */
export const getActivityTemplateById = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams;

    const template = await prisma.activityTemplate.findUnique({
      where: { id: Number(id) },
    });
    if (!template) {
      sendError(res, { statusCode: 404, message: "Template non trovato" });
      return;
    }

    sendSuccess(res, template);
  },
);

/**
 * @desc    Create new Activity Template
 * @route   POST /api/activity-templates
 * @access  Private (activity:manage)
 */
export const createActivityTemplate = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const data = req.validatedBody as CreateActivityTemplateInput;

    const template = await prisma.activityTemplate.create({ data });

    sendCreated(res, template, "Template creato con successo");
  },
);

/**
 * @desc    Update Activity Template
 * @route   PUT /api/activity-templates/:id
 * @access  Private (activity:manage)
 */
export const updateActivityTemplate = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams;
    const data = req.validatedBody as UpdateActivityTemplateInput;

    const existing = await prisma.activityTemplate.findUnique({
      where: { id: Number(id) },
    });
    if (!existing) {
      sendError(res, { statusCode: 404, message: "Template non trovato" });
      return;
    }

    const template = await prisma.activityTemplate.update({
      where: { id: Number(id) },
      data: clean({ ...(data as any) }),
    });

    sendSuccess(res, template, { message: "Template aggiornato con successo" });
  },
);

/**
 * @desc    Delete Activity Template
 * @route   DELETE /api/activity-templates/:id
 * @access  Private (activity:manage)
 */
export const deleteActivityTemplate = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams;

    const template = await prisma.activityTemplate.findUnique({
      where: { id: Number(id) },
    });
    if (!template) {
      sendError(res, { statusCode: 404, message: "Template non trovato" });
      return;
    }

    await prisma.activityTemplate.delete({ where: { id: Number(id) } });

    sendDeleted(res, "Template eliminato con successo");
  },
);

/**
 * @desc    Create Activity from Template
 * @route   POST /api/activity-templates/:id/create-activity
 * @access  Private (activity:create)
 */
export const createActivityFromTemplate = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams;
    const {
      scheduledStart,
      scheduledEnd,
      subject,
      description,
      companyId,
      customerId,
      opportunityId,
      assignedUserId,
    } = req.validatedBody as CreateActivityFromTemplateInput;

    const userId = req.user!.userId;

    const template = await prisma.activityTemplate.findUnique({
      where: { id: Number(id) },
    });
    if (!template) {
      sendError(res, { statusCode: 404, message: "Template non trovato" });
      return;
    }

    if (!template.active) {
      sendError(res, {
        statusCode: 400,
        status: "fail",
        message: "Template non attivo",
      });
      return;
    }

    if (!companyId && !customerId && !opportunityId) {
      sendError(res, {
        statusCode: 400,
        status: "fail",
        message:
          "Almeno una relazione (company, customer o opportunity) è obbligatoria",
      });
      return;
    }

    const assignedUser = await prisma.user.findUnique({
      where: { id: assignedUserId },
    });
    if (!assignedUser) {
      sendError(res, {
        statusCode: 404,
        message: "Utente assegnato non trovato",
      });
      return;
    }

    // Auto-calculate scheduledEnd from defaultDuration if not provided
    let calculatedEnd: string | undefined = scheduledEnd ?? undefined;
    if (!scheduledEnd && template.defaultDuration) {
      const start = new Date(scheduledStart as any);
      calculatedEnd = new Date(
        start.getTime() + template.defaultDuration * 60_000,
      ).toISOString();
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

      customFields: template.checklist
        ? { checklist: template.checklist }
        : undefined,
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

    sendCreated(res, activity, "Activity creata da template con successo");
  },
);

/**
 * @desc    Toggle active status of a Template
 * @route   PATCH /api/activity-templates/:id/toggle-active
 * @access  Private (activity:manage)
 */
export const toggleTemplateActive = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams;
    const { active } = req.validatedBody as { active: boolean };

    const template = await prisma.activityTemplate.findUnique({
      where: { id: Number(id) },
    });
    if (!template) {
      sendError(res, { statusCode: 404, message: "Template non trovato" });
      return;
    }

    const updated = await prisma.activityTemplate.update({
      where: { id: Number(id) },
      data: { active },
    });

    sendSuccess(res, updated, {
      message: `Template ${active ? "attivato" : "disattivato"} con successo`,
    });
  },
);
