import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../config/prisma-config";
import {
  ActivityIdParam,
  ActivityQueryInput,
  ActivityStatsInput,
  CompleteActivityInput,
  CreateActivityInput,
  UpdateActivityInput,
  UpdateActivityStatusInput,
} from "@mini-erp/shared/types";
import {
  sendCreated,
  sendDeleted,
  sendNotFound,
  sendPaginatedResponse,
  sendSuccess,
} from "@/utils/response-utils";
import { clean, parseOptionalDate } from "@/helpers/prisma-helper";
import { completeActivity as completeActivityService } from "../../services/activity/activity-service";
import { Context } from "hono";
import { AppBindings } from "@/lib/hono-app";
import {
  getValidatedBody,
  getValidatedParams,
  getValidatedQuery,
} from "@/helpers/validated-context";

// ============================================================================
// ACTIVITY CONTROLLER
// ============================================================================

/**
 * @desc    Ottieni tutte le Activities con filtri e paginazione
 * @route   GET /api/activities
 * @access  Private (activity:read)
 */
export const getAllActivities = async (c: Context<AppBindings>) => {
  const {
    page = 1,
    limit = 20,
    search,
    type,
    status,
    priority,
    outcome,
    companyId,
    customerId,
    opportunityId,
    assignedUserId,
    startDate,
    endDate,
    overdue,
    hasFollowUpActivity,
    myActivities,
    sortBy = "scheduledStart",
    sortOrder = "asc",
  } = getValidatedQuery<ActivityQueryInput>(c);

  const skip = (page - 1) * limit;
  const where: Prisma.ActivityWhereInput = {};

  // Filtro ricerca
  if (search) {
    where.OR = [
      { subject: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  // Filtri enum
  if (type) where.type = type;
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (outcome) where.outcome = outcome;

  // Filtri relazioni
  if (companyId) where.companyId = companyId;
  if (customerId) where.customerId = customerId;
  if (opportunityId) where.opportunityId = opportunityId;

  // Filtro utente assegnato o "le mie attività"
  if (myActivities) {
    where.assignedUserId = c.get("user")!.userId;
  } else if (assignedUserId) {
    where.assignedUserId = assignedUserId;
  }

  // Filtri data
  if (startDate || endDate) {
    where.scheduledStart = {};
    if (startDate) where.scheduledStart.gte = new Date(startDate);
    if (endDate) where.scheduledStart.lte = new Date(endDate);
  }

  // Filtro attività scadute
  if (overdue) {
    where.AND = [
      { scheduledStart: { lt: new Date() } },
      { status: { in: ["SCHEDULED", "IN_PROGRESS"] } },
    ];
  }

  // Filtro follow-up necessario
  if (hasFollowUpActivity) {
    where.followUpActivityId = { not: null };
  }

  const [activities, total] = await Promise.all([
    prisma.activity.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { [sortBy]: sortOrder },
      include: {
        company: {
          select: {
            id: true,
            code: true,
            companyName: true,
          },
        },
        customer: {
          select: {
            id: true,
            company: {
              select: {
                companyName: true,
              },
            },
          },
        },
        lead: {
          select: {
            code: true,
            companyName: true,
            contactFirstName: true,
            contactLastName: true,
            contactEmail: true,
            contactPhone: true,
            contactMobile: true,
          },
        },
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        opportunity: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            username: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
            contact: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        followUpActivity: {
          select: {
            id: true,
            subject: true,
            scheduledStart: true,
          },
        },
      },
    }),
    prisma.activity.count({ where }),
  ]);

  return sendPaginatedResponse(c, activities, total, page, limit);
};

/**
 * @desc    Get Activity by ID
 * @route   GET /api/activities/:id
 * @access  Private (activity:read)
 */
export const getActivityById = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<ActivityIdParam>(c);

  const activity = await prisma.activity.findUnique({
    where: { id: Number(id) },
    include: {
      company: { include: { country: true } },
      customer: { include: { company: { include: { country: true } } } },
      lead: true,
      contact: true,
      opportunity: true,
      assignedUser: {
        select: { id: true, username: true, email: true, details: true },
      },
      createdBy: {
        select: { id: true, username: true, email: true },
      },
      participants: {
        include: {
          user: {
            select: { id: true, username: true, email: true, details: true },
          },
          contact: true,
        },
      },
      followUpActivity: true,
      followedUpBy: {
        select: {
          id: true,
          subject: true,
          type: true,
          status: true,
          scheduledStart: true,
        },
      },
    },
  });

  if (!activity) {
    return sendNotFound(c, "Activity non trovata");
  }

  return sendSuccess(c, activity);
};

/**
 * @desc    Crea nuova Activity
 * @route   POST /api/activities
 * @access  Private (activity:create)
 */
export const createActivity = async (c: Context<AppBindings>) => {
  const data = getValidatedBody<CreateActivityInput>(c);
  const userId = c.get("user")!.userId;

  // Validazioni relazioni
  if (data.companyId) {
    const company = await prisma.company.findUnique({
      where: { id: data.companyId },
    });
    if (!company) {
      return sendNotFound(c, "Company non trovata");
    }
  }

  if (data.customerId) {
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
    });
    if (!customer) {
      return sendNotFound(c, "Customer non trovato");
    }
  }

  if (data.opportunityId) {
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: data.opportunityId },
    });
    if (!opportunity) {
      return sendNotFound(c, "Opportunity non trovata");
    }
  }

  if (data.leadId) {
    const lead = await prisma.lead.findUnique({ where: { id: data.leadId } });
    if (!lead) {
      return sendNotFound(c, "Lead non trovata");
    }
  }

  if (data.contactId) {
    const contact = await prisma.contact.findUnique({
      where: { id: data.contactId },
    });
    if (!contact) {
      return sendNotFound(c, "Contact non trovato");
    }
  }

  const activity = await prisma.activity.create({
    data: { ...data, createdByUserId: userId },
    include: {
      company: true,
      customer: true,
      contact: true,
      opportunity: true,
      lead: true,
      assignedUser: { select: { id: true, username: true, email: true } },
    },
  });

  return sendCreated(c, activity, "Activity creata con successo");
};

/**
 * @desc    Update Activity
 * @route   PUT /api/activities/:id
 * @access  Private (activity:update)
 */
export const updateActivity = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<ActivityIdParam>(c);
  const data = getValidatedBody<UpdateActivityInput>(c);

  const existing = await prisma.activity.findUnique({
    where: { id: Number(id) },
  });
  if (!existing) {
    return sendNotFound(c, "Activity non trovata");
  }

  const activity = await prisma.activity.update({
    where: { id: Number(id) },
    data,
    include: {
      company: true,
      customer: true,
      contact: true,
      opportunity: true,
      assignedUser: { select: { id: true, username: true, email: true } },
      participants: true,
    },
  });

  return sendSuccess(c, activity, { message: "Activity aggiornata con successo" });
};

/**
 * @desc    Update Activity status
 * @route   PATCH /api/activities/:id/status
 * @access  Private (activity:update)
 */
export const updateActivityStatus = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<ActivityIdParam>(c);
  const { status, outcome, result, actualStart, actualEnd } =
    getValidatedBody<UpdateActivityStatusInput>(c);

  const activity = await prisma.activity.findUnique({
    where: { id: Number(id) },
  });
  if (!activity) {
    return sendNotFound(c, "Activity non trovata");
  }

  const parsedStart = parseOptionalDate(actualStart);
  const parsedEnd = parseOptionalDate(actualEnd);

  /**
   * Auto timestamp transizioni di stato
   */
  const shouldAutoStart =
    status === "IN_PROGRESS" && !activity.actualStart && parsedStart === undefined;

  const shouldAutoEnd = status === "COMPLETED" && !activity.actualEnd && parsedEnd === undefined;

  const updateData = clean({
    status,
    outcome,
    result,
    actualStart: parsedStart !== undefined ? parsedStart : shouldAutoStart ? new Date() : undefined,
    actualEnd: parsedEnd !== undefined ? parsedEnd : shouldAutoEnd ? new Date() : undefined,
  }) satisfies Prisma.ActivityUpdateInput;

  const updated = await prisma.activity.update({
    where: { id: Number(id) },
    data: updateData,
    include: {
      company: true,
      assignedUser: { select: { id: true, username: true, email: true } },
    },
  });

  return sendSuccess(c, updated, { message: "Status aggiornato con successo" });
};

/**
 * @desc    Complete Activity with optional follow-up creation
 * @route   PATCH /api/activities/:id/complete
 * @access  Private (activity:update)
 */
export const completeActivity = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<ActivityIdParam>(c);
  const input = getValidatedBody<CompleteActivityInput>(c);
  const userId = c.get("user")!.userId;

  const updated = await completeActivityService(Number(id), input, userId);

  if (!updated) {
    return sendNotFound(c, "Activity non trovata");
  }

  return sendSuccess(c, updated, { message: "Activity completata con successo" });
};

/**
 * @desc    Delete Activity
 * @route   DELETE /api/activities/:id
 * @access  Private (activity:delete)
 */
export const deleteActivity = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<ActivityIdParam>(c);

  const activity = await prisma.activity.findUnique({
    where: { id: Number(id) },
  });
  if (!activity) {
    return sendNotFound(c, "Activity non trovata");
  }

  await prisma.activity.delete({ where: { id: Number(id) } });

  return sendDeleted(c, "Activity eliminata con successo");
};

/**
 * @desc    Get Activity statistics
 * @route   GET /api/activities/stats
 * @access  Private (activity:read)
 */
export const getActivityStats = async (c: Context<AppBindings>) => {
  const { startDate, endDate, userId } = getValidatedQuery<ActivityStatsInput>(c);
  const currentUserId = c.get("user")!.userId;

  const where: Prisma.ActivityWhereInput = {
    assignedUserId: userId ? Number(userId) : currentUserId,
  };

  if (startDate || endDate) {
    where.scheduledStart = {};
    if (startDate) where.scheduledStart.gte = new Date(startDate);
    if (endDate) where.scheduledStart.lte = new Date(endDate);
  }

  const [byType, byStatus, byPriority, byOutcome, overdueCount, todayCount, followUpCount] =
    await Promise.all([
      prisma.activity.groupBy({ by: ["type"], where, _count: true }),
      prisma.activity.groupBy({ by: ["status"], where, _count: true }),
      prisma.activity.groupBy({ by: ["priority"], where, _count: true }),
      prisma.activity.groupBy({
        by: ["outcome"],
        where: { ...where, outcome: { not: null } },
        _count: true,
      }),
      prisma.activity.count({
        where: {
          assignedUserId: where.assignedUserId,
          scheduledStart: { lt: new Date() },
          status: { in: ["SCHEDULED", "IN_PROGRESS"] },
        },
      }),
      prisma.activity.count({
        where: {
          assignedUserId: where.assignedUserId,
          scheduledStart: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(24, 0, 0, 0)),
          },
        },
      }),
      prisma.activity.count({
        where: {
          assignedUserId: where.assignedUserId,
          followUpActivityId: { not: null },
        },
      }),
    ]);

  return sendSuccess(c, {
    byType,
    byStatus,
    byPriority,
    byOutcome,
    overdue: overdueCount,
    today: todayCount,
    followUp: followUpCount,
  });
};
