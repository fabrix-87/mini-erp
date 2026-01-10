import { Request, Response, NextFunction } from "express";
import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../config/prisma-client";
import asyncHandler from "../../middleware/async-handler";
import { AuthenticatedValidatedRequest } from "../../types/validate";
import { ActivityStatsInput } from "../../validators/activity";

// ============================================================================
// ACTIVITY CONTROLLER
// ============================================================================

/**
 * @desc    Ottieni tutte le Activities con filtri e paginazione
 * @route   GET /api/activities
 * @access  Private (activity:read)
 */
export const getAllActivities = async (
  req: AuthenticatedValidatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
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
      requiresFollowUp,
      myActivities,
      sortBy = "scheduledStart",
      sortOrder = "asc",
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const where: Prisma.ActivityWhereInput = {};

    // Filtro ricerca
    if (search) {
      where.OR = [
        { subject: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
      ];
    }

    // Filtri enum
    if (type) where.type = type as any;
    if (status) where.status = status as any;
    if (priority) where.priority = priority as any;
    if (outcome) where.outcome = outcome as any;

    // Filtri relazioni
    if (companyId) where.companyId = Number(companyId);
    if (customerId) where.customerId = Number(customerId);
    if (opportunityId) where.opportunityId = Number(opportunityId);

    // Filtro utente assegnato o "le mie attività"
    if (myActivities) {
      where.assignedUserId = (req as any).user.id;
    } else if (assignedUserId) {
      where.assignedUserId = Number(assignedUserId);
    }

    // Filtri data
    if (startDate || endDate) {
      where.scheduledStart = {};
      if (startDate) where.scheduledStart.gte = new Date(startDate as string);
      if (endDate) where.scheduledStart.lte = new Date(endDate as string);
    }

    // Filtro attività scadute
    if (overdue) {
      where.AND = [
        { scheduledStart: { lt: new Date() } },
        { status: { in: ["SCHEDULED", "IN_PROGRESS"] } },
      ];
    }

    // Filtro follow-up necessario
    if (requiresFollowUp) {
      where.requiresFollowUp = true;
    }

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [sortBy as string]: sortOrder },
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

    res.status(200).json({
      success: true,
      data: activities,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Ottieni Activity per ID
 * @route   GET /api/activities/:id
 * @access  Private (activity:read)
 */
export const getActivityById = async (
  req: AuthenticatedValidatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.validatedParams;

    const activity = await prisma.activity.findUnique({
      where: { id: parseInt(id) },
      include: {
        company: {
          include: {
            country: true,
            legalAddress: true,
          },
        },
        customer: {
          include: {
            company: {
              include: {
                country: true,
              },
            },
          },
        },
        contact: true,
        opportunity: true,
        assignedUser: {
          select: {
            id: true,
            username: true,
            email: true,
            details: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                details: true,
              },
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
      res.status(404).json({
        success: false,
        message: "Activity non trovata",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Crea nuova Activity
 * @route   POST /api/activities
 * @access  Private (activity:create)
 */
export const createActivity = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const data = req.validatedBody;
    const userId = req.user!.userId;

    // Validazioni relazioni
    if (data.companyId) {
      const company = await prisma.company.findUnique({
        where: { id: data.companyId },
      });
      if (!company) {
        res.status(404).json({
          success: false,
          message: "Company non trovata",
        });
        return;
      }
    }

    if (data.customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: data.customerId },
      });
      if (!customer) {
        res.status(404).json({
          success: false,
          message: "Customer non trovato",
        });
        return;
      }
    }

    if (data.opportunityId) {
      const opportunity = await prisma.opportunity.findUnique({
        where: { id: data.opportunityId },
      });
      if (!opportunity) {
        res.status(404).json({
          success: false,
          message: "Opportunity non trovata",
        });
        return;
      }
    }

    if (data.contactId) {
      const contact = await prisma.contact.findUnique({
        where: { id: data.contactId },
      });
      if (!contact) {
        res.status(404).json({
          success: false,
          message: "Contact non trovato",
        });
        return;
      }
    }

    // Verifica utente creatore
    const createdBy = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!createdBy) {
      res.status(404).json({
        success: false,
        message: "Utente creazione non trovato",
      });
      return;
    }

    const activity = await prisma.activity.create({
      data: {
        ...data,
        createdByUserId: userId,
      },
      include: {
        company: true,
        customer: true,
        contact: true,
        opportunity: true,
        assignedUser: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Activity creata con successo",
      data: activity,
    });
});

/**
 * @desc    Aggiorna Activity
 * @route   PUT /api/activities/:id
 * @access  Private (activity:update)
 */
export const updateActivity = async (
  req: AuthenticatedValidatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.validatedParams;
    const data = req.validatedBody;

    const existingActivity = await prisma.activity.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingActivity) {
      res.status(404).json({
        success: false,
        message: "Activity non trovata",
      });
      return;
    }

    const activity = await prisma.activity.update({
      where: { id: parseInt(id) },
      data,
      include: {
        company: true,
        customer: true,
        contact: true,
        opportunity: true,
        assignedUser: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        participants: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Activity aggiornata con successo",
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Aggiorna status Activity
 * @route   PATCH /api/activities/:id/status
 * @access  Private (activity:update)
 */
export const updateActivityStatus = async (
  req: AuthenticatedValidatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.validatedParams;
    const { status, outcome, result, actualStart, actualEnd } = req.validatedBody;

    const activity = await prisma.activity.findUnique({
      where: { id: parseInt(id) },
    });

    if (!activity) {
      res.status(404).json({
        success: false,
        message: "Activity non trovata",
      });
      return;
    }

    const updateData: any = { status };
    if (outcome !== undefined) updateData.outcome = outcome;
    if (result !== undefined) updateData.result = result;
    if (actualStart !== undefined)
      updateData.actualStart = new Date(actualStart);
    if (actualEnd !== undefined) updateData.actualEnd = new Date(actualEnd);

    // Se status diventa IN_PROGRESS e non c'è actualStart, impostalo ora
    if (status === "IN_PROGRESS" && !activity.actualStart && !actualStart) {
      updateData.actualStart = new Date();
    }

    // Se status diventa COMPLETED e non c'è actualEnd, impostalo ora
    if (status === "COMPLETED" && !activity.actualEnd && !actualEnd) {
      updateData.actualEnd = new Date();
    }

    const updatedActivity = await prisma.activity.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        company: true,
        assignedUser: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Status aggiornato con successo",
      data: updatedActivity,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Completa Activity
 * @route   PATCH /api/activities/:id/complete
 * @access  Private (activity:update)
 */
export const completeActivity = async (
  req: AuthenticatedValidatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.validatedParams;
    const { outcome, result, requiresFollowUp, followUpDate, internalNotes } =
      req.validatedBody;

    const activity = await prisma.activity.findUnique({
      where: { id: parseInt(id) },
    });

    if (!activity) {
      res.status(404).json({
        success: false,
        message: "Activity non trovata",
      });
      return;
    }

    const updateData: any = {
      status: "COMPLETED",
      outcome,
      result,
      requiresFollowUp,
      actualEnd: new Date(),
    };

    if (internalNotes) updateData.internalNotes = internalNotes;
    if (followUpDate) updateData.followUpDate = new Date(followUpDate);
    if (!activity.actualStart) updateData.actualStart = new Date();

    const updatedActivity = await prisma.activity.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        company: true,
        customer: true,
        opportunity: true,
        assignedUser: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Activity completata con successo",
      data: updatedActivity,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Elimina Activity
 * @route   DELETE /api/activities/:id
 * @access  Private (activity:delete)
 */
export const deleteActivity = async (
  req: AuthenticatedValidatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.validatedParams;

    const activity = await prisma.activity.findUnique({
      where: { id: parseInt(id) },
    });

    if (!activity) {
      res.status(404).json({
        success: false,
        message: "Activity non trovata",
      });
      return;
    }

    await prisma.activity.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: "Activity eliminata con successo",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Ottieni statistiche activities
 * @route   GET /api/activities/stats
 * @access  Private (activity:read)
 */
export const getActivityStats = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { startDate, endDate, userId } = req.validatedQuery as ActivityStatsInput;
    const currentUserId = (req as any).user.id;

    const where: Prisma.ActivityWhereInput = {};

    // Filtro utente (se non specificato, usa l'utente corrente)
    where.assignedUserId = userId ? Number(userId) : currentUserId;

    // Filtro date
    if (startDate || endDate) {
      where.scheduledStart = {};
      if (startDate) where.scheduledStart.gte = new Date(startDate as string);
      if (endDate) where.scheduledStart.lte = new Date(endDate as string);
    }

    // Statistiche per tipo
    const byType = await prisma.activity.groupBy({
      by: ["type"],
      where,
      _count: true,
    });

    // Statistiche per status
    const byStatus = await prisma.activity.groupBy({
      by: ["status"],
      where,
      _count: true,
    });

    // Statistiche per priorità
    const byPriority = await prisma.activity.groupBy({
      by: ["priority"],
      where,
      _count: true,
    });

    // Statistiche per outcome
    const byOutcome = await prisma.activity.groupBy({
      by: ["outcome"],
      where: {
        ...where,
        outcome: { not: null },
      },
      _count: true,
    });

    // Attività scadute
    const overdueCount = await prisma.activity.count({
      where: {
        assignedUserId: where.assignedUserId,
        scheduledStart: { lt: new Date() },
        status: { in: ["SCHEDULED", "IN_PROGRESS"] },
      },
    });

    // Attività oggi
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayCount = await prisma.activity.count({
      where: {
        assignedUserId: where.assignedUserId,
        scheduledStart: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Attività che richiedono follow-up
    const followUpCount = await prisma.activity.count({
      where: {
        assignedUserId: where.assignedUserId,
        requiresFollowUp: true,
        status: "COMPLETED",
      },
    });

    res.status(200).json({
      success: true,
      data: {
        byType,
        byStatus,
        byPriority,
        byOutcome,
        overdue: overdueCount,
        today: todayCount,
        followUp: followUpCount,
      },
    });
  }
);
