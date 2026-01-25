import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma-client";
import { Prisma } from "../generated/prisma/client";
import { AuthenticatedValidatedRequest } from "@/types/validate";
import asyncHandler from "@/middleware/async-handler";
import {
  AssignUserInput,
  CloseOpportunityLostInput,
  CloseOpportunityWonInput,
  CreateOpportunityInput,
  CustomerIdParam,
  OpportunityIdParam,
  OpportunityQueryByStatusInput,
  OpportunityQueryInput,
  UpdateOpportunityInput,
  UpdateStageInput,
} from "@mini-erp/shared";
import {
  sendCreated,
  sendDeleted,
  sendFail,
  sendPaginatedResponse,
  sendSuccess,
} from "@/utils/response";

// ============================================================================
// OPPORTUNITY CONTROLLER
// ============================================================================

/**
 * Mappa stage a probabilità default
 */
const STAGE_PROBABILITY_MAP: Record<string, number> = {
  LEAD_QUALIFICATION: 10,
  PROSPECTING: 20,
  NEEDS_ANALYSIS: 40,
  PROPOSAL_SENT: 60,
  NEGOTIATION: 80,
  COMMITMENT: 90,
};

/**
 * Calcola weighted value
 */
const calculateWeightedValue = (
  estimatedValue: number | null,
  probability: number,
): number => {
  if (!estimatedValue) return 0;
  return (estimatedValue * probability) / 100;
};

/**
 * @desc    Ottieni tutte le opportunità con filtri e paginazione
 * @route   GET /api/opportunities
 * @access  Private (opportunity:read)
 */
export const getAllOpportunities = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const {
      page = 1,
      limit = 10,
      search,
      customerId,
      assignedUserId,
      status,
      stage,
      minValue,
      maxValue,
      minProbability,
      maxProbability,
      expectedCloseDateFrom,
      expectedCloseDateTo,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.validatedQuery as OpportunityQueryInput;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.OpportunityWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
        { notes: { contains: search as string, mode: "insensitive" } },
      ];
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (assignedUserId) {
      where.assignedUserId = assignedUserId;
    }

    if (status) {
      where.status = status;
    }

    if (stage) {
      where.stage = stage;
    }

    if (minValue || maxValue) {
      where.estimatedValue = {};
      if (minValue) where.estimatedValue.gte = minValue;
      if (maxValue) where.estimatedValue.lte = maxValue;
    }

    if (minProbability !== undefined || maxProbability !== undefined) {
      where.probability = {};
      if (minProbability !== undefined) where.probability.gte = minProbability;
      if (maxProbability !== undefined) where.probability.lte = maxProbability;
    }

    if (expectedCloseDateFrom || expectedCloseDateTo) {
      where.expectedCloseDate = {};
      if (expectedCloseDateFrom)
        where.expectedCloseDate.gte = new Date(expectedCloseDateFrom);
      if (expectedCloseDateTo)
        where.expectedCloseDate.lte = new Date(expectedCloseDateTo);
    }

    // Execute query
    const [opportunities, total] = await Promise.all([
      prisma.opportunity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          customer: {
            include: {
              company: {
                select: {
                  id: true,
                  code: true,
                  companyName: true,
                  tradeName: true,
                },
              },
            },
          },
          createdBy: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          assignedUser: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          documents: {
            select: {
              id: true,
              documentNumber: true,
              documentType: true,
              totalAmount: true,
            },
          },
        },
      }),
      prisma.opportunity.count({ where }),
    ]);

    sendPaginatedResponse(res, opportunities, total, page, limit);
  },
);

/**
 * @desc    Ottieni opportunità per Customer ID
 * @route   GET /api/opportunities/customer/:customerId
 * @access  Private (opportunity:read)
 */
export const getOpportunitiesByCustomer = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { customerId } = req.validatedParams as CustomerIdParam;
    const { status } = req.validatedQuery as OpportunityQueryByStatusInput;

    const where: Prisma.OpportunityWhereInput = {
      customerId,
    };

    if (status) {
      where.status = status;
    }

    const opportunities = await prisma.opportunity.findMany({
      where,
      orderBy: [{ expectedCloseDate: "asc" }, { createdAt: "desc" }],
      include: {
        customer: {
          include: {
            company: {
              select: {
                id: true,
                companyName: true,
              },
            },
          },
        },
        assignedUser: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    sendSuccess(res, opportunities, {
      results: opportunities.length,
    });
  },
);

/**
 * @desc    Ottieni un'opportunità per ID
 * @route   GET /api/opportunities/:id
 * @access  Private (opportunity:read)
 */
export const getOpportunityById = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as OpportunityIdParam;

    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      include: {
        customer: {
          include: {
            company: {
              select: {
                id: true,
                code: true,
                companyName: true,
                tradeName: true,
                mainEmail: true,
                mainPhone: true,
                legalAddress: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            username: true,
            email: true,
            details: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        assignedUser: {
          select: {
            id: true,
            username: true,
            email: true,
            details: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        documents: {
          select: {
            id: true,
            documentNumber: true,
            documentType: true,
            status: true,
            documentDate: true,
            totalAmount: true,
          },
          orderBy: { documentDate: "desc" },
        },
      },
    });

    if (!opportunity) {
      sendFail(res, {
        statusCode: 404,
        message: "Opportunità non trovata",
      });
      return;
    }

    sendSuccess(res, opportunity);
  },
);

/**
 * @desc    Crea nuova opportunità
 * @route   POST /api/opportunities
 * @access  Private (opportunity:create)
 */
export const createOpportunity = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const {
      title,
      description,
      customerId,
      status = "OPEN",
      stage = "LEAD_QUALIFICATION",
      estimatedValue,
      probability,
      expectedCloseDate,
      assignedUserId,
      notes,
      customFields,
    } = req.validatedBody as CreateOpportunityInput;

    // Verifica che il customer esista
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      sendFail(res, {
        statusCode: 404,
        message: "Customer non trovato",
      });
      return;
    }

    // Se assignedUserId è fornito, verifica che l'utente esista
    if (assignedUserId) {
      const user = await prisma.user.findUnique({
        where: { id: assignedUserId },
      });

      if (!user) {
        sendFail(res, {
          statusCode: 404,
          message: "Utente assegnato non trovato",
        });
        return;
      }
    }

    // Calcola probabilità default da stage se non fornita
    const finalProbability =
      probability !== undefined
        ? probability
        : STAGE_PROBABILITY_MAP[stage] || 0;

    // Calcola weighted value
    const weightedValue = calculateWeightedValue(
      estimatedValue ? estimatedValue : null,
      finalProbability,
    );

    // Ottieni l'utente corrente dal token
    const currentUserId = (req as any).user?.id;

    // Crea l'opportunità
    const opportunity = await prisma.opportunity.create({
      data: {
        title,
        description,
        customerId,
        status,
        stage,
        estimatedValue: estimatedValue
          ? new Prisma.Decimal(estimatedValue)
          : null,
        probability: finalProbability,
        weightedValue: new Prisma.Decimal(weightedValue),
        expectedCloseDate: expectedCloseDate
          ? new Date(expectedCloseDate)
          : null,
        createdByUserId: currentUserId,
        assignedUserId: assignedUserId || currentUserId,
        notes,
        customFields: customFields ? JSON.parse(customFields) : undefined,
      },
      include: {
        customer: {
          include: {
            company: {
              select: {
                id: true,
                companyName: true,
              },
            },
          },
        },
        assignedUser: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    sendCreated(res, opportunity, "Opportunità creata con successo");
  },
);

/**
 * @desc    Aggiorna opportunità
 * @route   PUT /api/opportunities/:id
 * @access  Private (opportunity:update)
 */
export const updateOpportunity = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as OpportunityIdParam;
    const {
      title,
      description,
      status,
      stage,
      estimatedValue,
      probability,
      expectedCloseDate,
      closedDate,
      closedReasonId,
      closedNotes,
      assignedUserId,
      notes,
      customFields,
    } = req.validatedBody as UpdateOpportunityInput;

    // Verifica esistenza opportunità
    const existingOpportunity = await prisma.opportunity.findUnique({
      where: { id },
    });

    if (!existingOpportunity) {
      sendFail(res, {
        statusCode: 404,
        message: "Opportunità non trovata",
      });
      return;
    }

    // Se assignedUserId viene cambiato, verifica che l'utente esista
    if (
      assignedUserId &&
      assignedUserId !== existingOpportunity.assignedUserId
    ) {
      const user = await prisma.user.findUnique({
        where: { id: assignedUserId },
      });

      if (!user) {
        sendFail(res, {
          statusCode: 404,
          message: "Utente assegnato non trovato",
        });
        return;
      }
    }

    // Prepara i dati per l'aggiornamento
    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (assignedUserId !== undefined)
      updateData.assignedUserId = assignedUserId;
    if (closedReasonId !== undefined)
      updateData.closedReasonId = closedReasonId;
    if (closedNotes !== undefined) updateData.closedNotes = closedNotes;

    // Se stage cambia, aggiorna lastStageChange
    if (stage !== undefined && stage !== existingOpportunity.stage) {
      updateData.stage = stage;
      updateData.lastStageChange = new Date();

      // Aggiorna probabilità se non fornita esplicitamente
      if (probability === undefined) {
        updateData.probability =
          STAGE_PROBABILITY_MAP[stage] || existingOpportunity.probability;
      }
    }

    if (probability !== undefined) updateData.probability = probability;

    if (estimatedValue !== undefined) {
      updateData.estimatedValue = estimatedValue
        ? new Prisma.Decimal(estimatedValue)
        : null;
    }

    if (expectedCloseDate !== undefined) {
      updateData.expectedCloseDate = expectedCloseDate
        ? new Date(expectedCloseDate)
        : null;
    }

    if (closedDate !== undefined) {
      updateData.closedDate = closedDate ? new Date(closedDate) : null;
    }

    if (customFields !== undefined) {
      updateData.customFields = JSON.parse(customFields);
    }

    // Ricalcola weighted value se necessario
    const finalEstimatedValue =
      estimatedValue !== undefined
        ? estimatedValue
          ? estimatedValue
          : null
        : existingOpportunity.estimatedValue
          ? parseFloat(existingOpportunity.estimatedValue.toString())
          : null;

    const finalProbability =
      probability !== undefined ? probability : existingOpportunity.probability;

    updateData.weightedValue = new Prisma.Decimal(
      calculateWeightedValue(finalEstimatedValue, finalProbability),
    );

    // Aggiorna opportunità
    const opportunity = await prisma.opportunity.update({
      where: { id },
      data: updateData,
      include: {
        customer: {
          include: {
            company: {
              select: {
                id: true,
                companyName: true,
              },
            },
          },
        },
        assignedUser: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    sendSuccess(res, opportunity, {
      message: "Opportunità aggiornata con successo",
    });
  },
);

/**
 * @desc    Aggiorna stage opportunità
 * @route   PATCH /api/opportunities/:id/stage
 * @access  Private (opportunity:update)
 */
export const updateStage = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as OpportunityIdParam;
    const { stage, probability } = req.validatedBody as UpdateStageInput;

    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
    });

    if (!opportunity) {
      sendFail(res, {
        statusCode: 404,
        message: "Opportunità non trovata",
      });
      return;
    }

    const finalProbability =
      probability !== undefined
        ? probability
        : STAGE_PROBABILITY_MAP[stage] || 0;

    const estimatedValue = opportunity.estimatedValue
      ? parseFloat(opportunity.estimatedValue.toString())
      : null;

    const weightedValue = calculateWeightedValue(
      estimatedValue,
      finalProbability,
    );

    const updatedOpportunity = await prisma.opportunity.update({
      where: { id },
      data: {
        stage,
        probability: finalProbability,
        weightedValue: new Prisma.Decimal(weightedValue),
        lastStageChange: new Date(),
      },
      include: {
        customer: {
          include: {
            company: {
              select: {
                id: true,
                companyName: true,
              },
            },
          },
        },
      },
    });

    sendSuccess(res, updatedOpportunity, {
      message: "Stage aggiornato con successo",
    });
  },
);

/**
 * @desc    Chiudi opportunità come WON
 * @route   PATCH /api/opportunities/:id/close-won
 * @access  Private (opportunity:update)
 */
export const closeOpportunityWon = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as OpportunityIdParam;
    const { closedDate, closedNotes } =
      req.validatedBody as CloseOpportunityWonInput;

    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
    });

    if (!opportunity) {
      sendFail(res, {
        statusCode: 404,
        message: "Opportunità non trovata",
      });
      return;
    }

    const updatedOpportunity = await prisma.opportunity.update({
      where: { id },
      data: {
        status: "WON",
        stage: "COMMITMENT",
        probability: 100,
        closedDate: closedDate ? new Date(closedDate) : new Date(),
        closedNotes,
        weightedValue: opportunity.estimatedValue || new Prisma.Decimal(0),
      },
      include: {
        customer: {
          include: {
            company: {
              select: {
                id: true,
                companyName: true,
              },
            },
          },
        },
      },
    });

    sendSuccess(res, updatedOpportunity, {
      message: "Opportunità chiusa come WON",
    });
  },
);

/**
 * @desc    Chiudi opportunità come LOST
 * @route   PATCH /api/opportunities/:id/close-lost
 * @access  Private (opportunity:update)
 */
export const closeOpportunityLost = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as OpportunityIdParam;
    const { closedReasonId, closedDate, closedNotes } =
      req.validatedBody as CloseOpportunityLostInput;

    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
    });

    if (!opportunity) {
      sendFail(res, {
        statusCode: 404,
        message: "Opportunità non trovata",
      });
      return;
    }

    const updatedOpportunity = await prisma.opportunity.update({
      where: { id },
      data: {
        status: "LOST",
        probability: 0,
        weightedValue: new Prisma.Decimal(0),
        closedDate: closedDate ? new Date(closedDate) : new Date(),
        closedReasonId,
        closedNotes,
      },
      include: {
        customer: {
          include: {
            company: {
              select: {
                id: true,
                companyName: true,
              },
            },
          },
        },
      },
    });

    sendSuccess(res, updateOpportunity, {
      message: "Opportunità chiusa come LOST",
    });
  },
);

/**
 * @desc    Assegna opportunità a utente
 * @route   PATCH /api/opportunities/:id/assign
 * @access  Private (opportunity:update)
 */
export const assignOpportunity = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as OpportunityIdParam;
    const { assignedUserId } = req.validatedBody as AssignUserInput;

    const [opportunity, user] = await Promise.all([
      prisma.opportunity.findUnique({ where: { id } }),
      prisma.user.findUnique({ where: { id: assignedUserId } }),
    ]);

    if (!opportunity) {
      sendFail(res, {
        statusCode: 404,
        message: "Opportunità non trovata",
      });
      return;
    }

    if (!user) {
      sendFail(res, {
        statusCode: 404,
        message: "Utente non trovato",
      });
      return;
    }

    const updatedOpportunity = await prisma.opportunity.update({
      where: { id },
      data: { assignedUserId },
      include: {
        assignedUser: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    sendSuccess(res, updateOpportunity, {
      message: "Opportunità assegnata con successo",
    });
  },
);

/**
 * @desc    Elimina opportunità
 * @route   DELETE /api/opportunities/:id
 * @access  Private (opportunity:delete)
 */
export const deleteOpportunity = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as OpportunityIdParam;

    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      include: {
        documents: {
          select: { id: true },
        },
      },
    });

    if (!opportunity) {
      sendFail(res, {
        statusCode: 404,
        message: "Opportunità non trovata",
      });
      return;
    }

    // Verifica se ha documenti associati
    if (opportunity.documents.length > 0) {
      sendFail(res, {
        statusCode: 404,
        message:
          "Impossibile eliminare: opportunità associata a documenti esistenti",
      });
      return;
    }

    await prisma.opportunity.delete({
      where: { id },
    });

    sendDeleted(res, "Opportunità eliminata con successo");
  },
);

/**
 * @desc    Ottieni statistiche pipeline
 * @route   GET /api/opportunities/stats/pipeline
 * @access  Private (opportunity:read)
 */
export const getPipelineStats = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { assignedUserId } = req.validatedQuery as AssignUserInput;

    const where: Prisma.OpportunityWhereInput = {
      status: "OPEN",
    };

    if (assignedUserId) {
      where.assignedUserId = assignedUserId;
    }

    const opportunities = await prisma.opportunity.findMany({
      where,
      select: {
        stage: true,
        estimatedValue: true,
        weightedValue: true,
        probability: true,
      },
    });

    const stats: any = {
      total: opportunities.length,
      totalEstimatedValue: 0,
      totalWeightedValue: 0,
      byStage: {},
    };

    opportunities.forEach((opp) => {
      const stage = opp.stage;
      if (!stats.byStage[stage]) {
        stats.byStage[stage] = {
          count: 0,
          totalEstimatedValue: 0,
          totalWeightedValue: 0,
        };
      }

      stats.byStage[stage].count++;
      stats.byStage[stage].totalEstimatedValue += parseFloat(
        opp.estimatedValue?.toString() || "0",
      );
      stats.byStage[stage].totalWeightedValue += parseFloat(
        opp.weightedValue?.toString() || "0",
      );

      stats.totalEstimatedValue += parseFloat(
        opp.estimatedValue?.toString() || "0",
      );
      stats.totalWeightedValue += parseFloat(
        opp.weightedValue?.toString() || "0",
      );
    });

    sendSuccess(res, stats);
  },
);
