import { Response } from "express";
import { prisma } from "../config/prisma-client";
import { Prisma } from "../generated/prisma/client";
import { AuthenticatedValidatedRequest } from "@/types/validate";
import asyncHandler from "@/middleware/async-handler";
import {
  OpportunityQueryInput,
  OpportunityIdParam,
  OpportunityCustomerIdParam,
  CreateOpportunityInput,
  UpdateOpportunityInput,
  UpdateOpportunityStageInput,
  UpdateOpportunityStatusInput,
  WinOpportunityInput,
  LoseOpportunityInput,
  BulkAssignOpportunitiesInput,
  BulkUpdateStageInput,
  OpportunityStatsInput,
  SalesFunnelAnalysisInput,
  ClosedReasonQueryInput,
  CreateClosedReasonInput,
  ClosedReasonIdParam,
  UpdateClosedReasonInput,
} from "@mini-erp/shared/types";
import {
  sendCreated,
  sendDeleted,
  sendFail,
  sendPaginatedResponse,
  sendSuccess,
} from "@/utils/response";

// ============================================================================
// HELPERS
// ============================================================================

/** Maps sales stage to default probability percentage */
const STAGE_PROBABILITY_MAP: Record<string, number> = {
  LEAD_QUALIFICATION: 10,
  PROSPECTING: 20,
  NEEDS_ANALYSIS: 40,
  PROPOSAL_SENT: 60,
  NEGOTIATION: 80,
  COMMITMENT: 90,
};

/**
 * Calculates weighted value from estimated value and probability
 * @param estimatedValue - The estimated deal value (null if not set)
 * @param probability    - Probability percentage (0–100)
 */
const calculateWeightedValue = (
  estimatedValue: number | null,
  probability: number,
): number => {
  if (!estimatedValue) return 0;
  return (estimatedValue * probability) / 100;
};

// ============================================================================
// OPPORTUNITY CONTROLLERS
// ============================================================================

/**
 * @desc   Get all opportunities with filters and pagination
 * @route  GET /api/opportunities
 * @access Private (opportunity:read)
 */
export const getAllOpportunities = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const {
      page = 1,
      limit = 10,
      search,
      customerId,
      leadId,
      assignedUserId,
      createdByUserId,
      status,
      stage,
      source,
      minValue,
      maxValue,
      minProbability,
      maxProbability,
      expectedCloseFrom,
      expectedCloseTo,
      closedFrom,
      closedTo,
      isStagnant,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.validatedQuery as OpportunityQueryInput;

    const skip = (page - 1) * limit;
    const where: Prisma.OpportunityWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    if (customerId) where.customerId = customerId;
    if (leadId) where.leadId = leadId;
    if (assignedUserId) where.assignedUserId = assignedUserId;
    if (createdByUserId) where.createdByUserId = createdByUserId;
    if (status) where.status = status;
    if (stage) where.stage = stage;
    if (source) where.source = source;

    if (minValue !== undefined || maxValue !== undefined) {
      where.estimatedValue = {};
      if (minValue !== undefined)
        where.estimatedValue.gte = new Prisma.Decimal(minValue);
      if (maxValue !== undefined)
        where.estimatedValue.lte = new Prisma.Decimal(maxValue);
    }

    if (minProbability !== undefined || maxProbability !== undefined) {
      where.probability = {};
      if (minProbability !== undefined) where.probability.gte = minProbability;
      if (maxProbability !== undefined) where.probability.lte = maxProbability;
    }

    if (expectedCloseFrom || expectedCloseTo) {
      where.expectedCloseDate = {};
      if (expectedCloseFrom)
        where.expectedCloseDate.gte = new Date(expectedCloseFrom);
      if (expectedCloseTo)
        where.expectedCloseDate.lte = new Date(expectedCloseTo);
    }

    if (closedFrom || closedTo) {
      where.closedDate = {};
      if (closedFrom) where.closedDate.gte = new Date(closedFrom);
      if (closedTo) where.closedDate.lte = new Date(closedTo);
    }

    if (isStagnant === true) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      where.status = "OPEN";
      where.lastStageChange = { lt: thirtyDaysAgo };
    }

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
          createdBy: { select: { id: true, username: true, email: true } },
          assignedUser: { select: { id: true, username: true, email: true } },
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
 * @desc   Get opportunities for a specific customer
 * @route  GET /api/opportunities/customer/:customerId
 * @access Private (opportunity:read)
 */
export const getOpportunitiesByCustomer = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { customerId } = req.validatedParams as OpportunityCustomerIdParam;
    const { status } = req.validatedQuery as Pick<
      OpportunityQueryInput,
      "status"
    >;

    const where: Prisma.OpportunityWhereInput = { customerId };
    if (status) where.status = status;

    const opportunities = await prisma.opportunity.findMany({
      where,
      orderBy: [{ expectedCloseDate: "asc" }, { createdAt: "desc" }],
      include: {
        customer: {
          include: {
            company: { select: { id: true, companyName: true } },
          },
        },
        assignedUser: { select: { id: true, username: true } },
      },
    });

    sendSuccess(res, opportunities, { results: opportunities.length });
  },
);

/**
 * @desc   Get a single opportunity by ID
 * @route  GET /api/opportunities/:id
 * @access Private (opportunity:read)
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
              },
              include: {
                addresses: {
                  where: {
                    addressType: "LEGAL",
                  },
                },
              },
            },
          },
        },
        lead: {
          select: {
            id: true,
            code: true,
            companyName: true,
            contactFirstName: true,
            contactLastName: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            username: true,
            email: true,
            details: { select: { firstName: true, lastName: true } },
          },
        },
        assignedUser: {
          select: {
            id: true,
            username: true,
            email: true,
            details: { select: { firstName: true, lastName: true } },
          },
        },
        closedReason: {
          select: {
            id: true,
            code: true,
            description: true,
            isWon: true,
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
      sendFail(res, { statusCode: 404, message: "Opportunità non trovata" });
      return;
    }

    sendSuccess(res, opportunity);
  },
);

/**
 * @desc   Create a new opportunity
 * @route  POST /api/opportunities
 * @access Private (opportunity:create)
 */
export const createOpportunity = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const {
      title,
      description,
      customerId,
      leadId,
      source = "OTHER",
      status = "OPEN",
      stage = "LEAD_QUALIFICATION",
      estimatedValue,
      probability,
      weightedValue: providedWeightedValue,
      expectedCloseDate,
      assignedUserId,
      proposedProducts = [],
      notes,
      customFields,
    } = req.validatedBody as CreateOpportunityInput;

    const currentUserId = req.user!.userId;

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!customer) {
      sendFail(res, { statusCode: 404, message: "Customer non trovato" });
      return;
    }

    if (leadId) {
      const lead = await prisma.lead.findUnique({ where: { id: leadId } });
      if (!lead) {
        sendFail(res, { statusCode: 404, message: "Lead non trovata" });
        return;
      }
    }

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

    const finalProbability =
      probability !== undefined
        ? probability
        : (STAGE_PROBABILITY_MAP[stage] ?? 0);

    const estValNumber = estimatedValue ? Number(estimatedValue) : null;
    const finalWeighted =
      providedWeightedValue !== undefined
        ? Number(providedWeightedValue)
        : calculateWeightedValue(estValNumber, finalProbability);

    const opportunity = await prisma.opportunity.create({
      data: {
        title,
        description,
        customerId,
        leadId: leadId ?? null,
        source,
        status,
        stage,
        estimatedValue: estValNumber ? new Prisma.Decimal(estValNumber) : null,
        probability: finalProbability,
        weightedValue: new Prisma.Decimal(finalWeighted),
        expectedCloseDate: expectedCloseDate
          ? new Date(expectedCloseDate)
          : null,
        createdByUserId: currentUserId,
        assignedUserId: assignedUserId ?? currentUserId,
        proposedProducts: proposedProducts as Prisma.InputJsonValue,
        notes,
        customFields: customFields ?? Prisma.JsonNull,
      },
      include: {
        customer: {
          include: {
            company: { select: { id: true, companyName: true } },
          },
        },
        assignedUser: { select: { id: true, username: true } },
      },
    });

    sendCreated(res, opportunity, "Opportunità creata con successo");
  },
);

/**
 * @desc   Update an existing opportunity
 * @route  PUT /api/opportunities/:id
 * @access Private (opportunity:update)
 */
export const updateOpportunity = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as OpportunityIdParam;
    const {
      title,
      description,
      source,
      status,
      stage,
      estimatedValue,
      probability,
      weightedValue: providedWeightedValue,
      expectedCloseDate,
      assignedUserId,
      proposedProducts,
      notes,
      customFields,
    } = req.validatedBody as UpdateOpportunityInput;

    const existing = await prisma.opportunity.findUnique({ where: { id } });
    if (!existing) {
      sendFail(res, { statusCode: 404, message: "Opportunità non trovata" });
      return;
    }

    if (assignedUserId && assignedUserId !== existing.assignedUserId) {
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

    const data: Record<string, unknown> = {};

    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (source !== undefined) data.source = source;
    if (status !== undefined) data.status = status;
    if (notes !== undefined) data.notes = notes;
    if (assignedUserId !== undefined) data.assignedUserId = assignedUserId;
    if (proposedProducts !== undefined)
      data.proposedProducts = proposedProducts as Prisma.InputJsonValue;
    if (customFields !== undefined)
      data.customFields = customFields ?? Prisma.JsonNull;

    if (stage !== undefined && stage !== existing.stage) {
      data.stage = stage;
      data.lastStageChange = new Date();
      if (probability === undefined) {
        data.probability = STAGE_PROBABILITY_MAP[stage] ?? existing.probability;
      }
    }

    if (probability !== undefined) data.probability = probability;

    if (estimatedValue !== undefined) {
      data.estimatedValue = estimatedValue
        ? new Prisma.Decimal(Number(estimatedValue))
        : null;
    }

    if (expectedCloseDate !== undefined) {
      data.expectedCloseDate = expectedCloseDate
        ? new Date(expectedCloseDate)
        : null;
    }

    // Recalculate weighted value
    const finalEstVal =
      estimatedValue !== undefined
        ? estimatedValue
          ? Number(estimatedValue)
          : null
        : existing.estimatedValue
          ? parseFloat(existing.estimatedValue.toString())
          : null;
    const finalProb =
      probability !== undefined ? probability : existing.probability;

    data.weightedValue =
      providedWeightedValue !== undefined
        ? new Prisma.Decimal(Number(providedWeightedValue))
        : new Prisma.Decimal(calculateWeightedValue(finalEstVal, finalProb));

    const opportunity = await prisma.opportunity.update({
      where: { id },
      data,
      include: {
        customer: {
          include: {
            company: { select: { id: true, companyName: true } },
          },
        },
        assignedUser: { select: { id: true, username: true } },
      },
    });

    sendSuccess(res, opportunity, {
      message: "Opportunità aggiornata con successo",
    });
  },
);

/**
 * @desc   Update only the stage of an opportunity
 * @route  PATCH /api/opportunities/:id/stage
 * @access Private (opportunity:update)
 */
export const updateStage = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as OpportunityIdParam;
    const { stage, probability, notes } =
      req.validatedBody as UpdateOpportunityStageInput;

    const opportunity = await prisma.opportunity.findUnique({ where: { id } });
    if (!opportunity) {
      sendFail(res, { statusCode: 404, message: "Opportunità non trovata" });
      return;
    }

    const finalProbability =
      probability !== undefined
        ? probability
        : (STAGE_PROBABILITY_MAP[stage] ?? 0);

    const estVal = opportunity.estimatedValue
      ? parseFloat(opportunity.estimatedValue.toString())
      : null;

    const updatedOpportunity = await prisma.opportunity.update({
      where: { id },
      data: {
        stage,
        probability: finalProbability,
        weightedValue: new Prisma.Decimal(
          calculateWeightedValue(estVal, finalProbability),
        ),
        lastStageChange: new Date(),
        ...(notes !== undefined && { notes }),
      },
      include: {
        customer: {
          include: {
            company: { select: { id: true, companyName: true } },
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
 * @desc   Generic status update (OPEN, PENDING, CLOSED, WON, LOST)
 * @route  PATCH /api/opportunities/:id/status
 * @access Private (opportunity:update)
 */
export const updateOpportunityStatus = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as OpportunityIdParam;
    const { status, closedReasonId, closedNotes, actualValue } =
      req.validatedBody as UpdateOpportunityStatusInput;

    const opportunity = await prisma.opportunity.findUnique({ where: { id } });
    if (!opportunity) {
      sendFail(res, { statusCode: 404, message: "Opportunità non trovata" });
      return;
    }

    const isClosing = status === "WON" || status === "LOST";

    const updated = await prisma.opportunity.update({
      where: { id },
      data: {
        status,
        ...(isClosing && { closedDate: new Date() }),
        ...(closedReasonId && { closedReasonId }),
        ...(closedNotes !== undefined && { closedNotes }),
        ...(status === "WON" &&
          actualValue && {
            actualValue: new Prisma.Decimal(Number(actualValue)),
            probability: 100,
            weightedValue: new Prisma.Decimal(Number(actualValue)),
          }),
        ...(status === "LOST" && {
          probability: 0,
          weightedValue: new Prisma.Decimal(0),
        }),
      },
      include: {
        customer: {
          include: {
            company: { select: { id: true, companyName: true } },
          },
        },
        closedReason: { select: { id: true, code: true, description: true } },
      },
    });

    sendSuccess(res, updated, {
      message: `Opportunità aggiornata a ${status}`,
    });
  },
);

/**
 * @desc   Close opportunity as WON
 * @route  PATCH /api/opportunities/:id/close-won
 * @access Private (opportunity:update)
 */
export const closeOpportunityWon = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as OpportunityIdParam;
    const { actualValue, closedReasonId, closedNotes, closedDate } =
      req.validatedBody as WinOpportunityInput;

    const opportunity = await prisma.opportunity.findUnique({ where: { id } });
    if (!opportunity) {
      sendFail(res, { statusCode: 404, message: "Opportunità non trovata" });
      return;
    }

    const actualDecimal = new Prisma.Decimal(Number(actualValue));

    const updatedOpportunity = await prisma.opportunity.update({
      where: { id },
      data: {
        status: "WON",
        stage: "COMMITMENT",
        probability: 100,
        actualValue: actualDecimal,
        weightedValue: actualDecimal,
        closedDate: closedDate ? new Date(closedDate) : new Date(),
        closedReasonId,
        closedNotes,
      },
      include: {
        customer: {
          include: {
            company: { select: { id: true, companyName: true } },
          },
        },
        closedReason: { select: { id: true, code: true, description: true } },
      },
    });

    sendSuccess(res, updatedOpportunity, {
      message: "Opportunità chiusa come WON",
    });
  },
);

/**
 * @desc   Close opportunity as LOST
 * @route  PATCH /api/opportunities/:id/close-lost
 * @access Private (opportunity:update)
 */
export const closeOpportunityLost = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as OpportunityIdParam;
    const { closedReasonId, closedNotes, closedDate } =
      req.validatedBody as LoseOpportunityInput;

    const opportunity = await prisma.opportunity.findUnique({ where: { id } });
    if (!opportunity) {
      sendFail(res, { statusCode: 404, message: "Opportunità non trovata" });
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
            company: { select: { id: true, companyName: true } },
          },
        },
        closedReason: { select: { id: true, code: true, description: true } },
      },
    });

    sendSuccess(res, updatedOpportunity, {
      message: "Opportunità chiusa come LOST",
    });
  },
);

/**
 * @desc   Assign opportunity to a user
 * @route  PATCH /api/opportunities/:id/assign
 * @access Private (opportunity:update)
 */
export const assignOpportunity = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as OpportunityIdParam;
    const { assignedUserId } = req.validatedBody as Pick<
      UpdateOpportunityInput,
      "assignedUserId"
    >;

    if (!assignedUserId) {
      sendFail(res, {
        statusCode: 400,
        message: "assignedUserId obbligatorio",
      });
      return;
    }

    const [opportunity, user] = await Promise.all([
      prisma.opportunity.findUnique({ where: { id } }),
      prisma.user.findUnique({ where: { id: assignedUserId } }),
    ]);

    if (!opportunity) {
      sendFail(res, { statusCode: 404, message: "Opportunità non trovata" });
      return;
    }
    if (!user) {
      sendFail(res, { statusCode: 404, message: "Utente non trovato" });
      return;
    }

    const updatedOpportunity = await prisma.opportunity.update({
      where: { id },
      data: { assignedUserId },
      include: {
        assignedUser: { select: { id: true, username: true, email: true } },
      },
    });

    sendSuccess(res, updatedOpportunity, {
      message: "Opportunità assegnata con successo",
    });
  },
);

/**
 * @desc   Bulk assign opportunities to a user
 * @route  POST /api/opportunities/bulk/assign
 * @access Private (opportunity:update)
 */
export const bulkAssignOpportunities = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { opportunityIds, assignedUserId } =
      req.validatedBody as BulkAssignOpportunitiesInput;

    const user = await prisma.user.findUnique({
      where: { id: assignedUserId },
    });
    if (!user) {
      sendFail(res, { statusCode: 404, message: "Utente non trovato" });
      return;
    }

    const result = await prisma.opportunity.updateMany({
      where: { id: { in: opportunityIds } },
      data: { assignedUserId },
    });

    sendSuccess(res, result, {
      message: `${result.count} opportunità assegnate`,
    });
  },
);

/**
 * @desc   Bulk update stage for multiple opportunities
 * @route  POST /api/opportunities/bulk/stage
 * @access Private (opportunity:update)
 */
export const bulkUpdateStage = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { opportunityIds, stage, probability } =
      req.validatedBody as BulkUpdateStageInput;

    const finalProbability =
      probability !== undefined
        ? probability
        : (STAGE_PROBABILITY_MAP[stage] ?? 0);

    const result = await prisma.opportunity.updateMany({
      where: { id: { in: opportunityIds } },
      data: {
        stage,
        probability: finalProbability,
        lastStageChange: new Date(),
      },
    });

    sendSuccess(res, result, {
      message: `Stage aggiornato per ${result.count} opportunità`,
    });
  },
);

/**
 * @desc   Delete an opportunity
 * @route  DELETE /api/opportunities/:id
 * @access Private (opportunity:delete)
 */
export const deleteOpportunity = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as OpportunityIdParam;

    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      include: { documents: { select: { id: true } } },
    });

    if (!opportunity) {
      sendFail(res, { statusCode: 404, message: "Opportunità non trovata" });
      return;
    }

    if (opportunity.documents.length > 0) {
      sendFail(res, {
        statusCode: 409,
        message: "Impossibile eliminare: esistono documenti associati",
      });
      return;
    }

    await prisma.opportunity.delete({ where: { id } });
    sendDeleted(res, "Opportunità eliminata con successo");
  },
);

/**
 * @desc   Get pipeline statistics
 * @route  GET /api/opportunities/stats/pipeline
 * @access Private (opportunity:read)
 */
export const getPipelineStats = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { assignedUserId, customerId, dateFrom, dateTo, source } =
      req.validatedQuery as OpportunityStatsInput;

    const where: Prisma.OpportunityWhereInput = { status: "OPEN" };

    if (assignedUserId) where.assignedUserId = assignedUserId;
    if (customerId) where.customerId = customerId;
    if (source) where.source = source;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
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

    const stats: Record<string, unknown> = {
      total: opportunities.length,
      totalEstimatedValue: 0,
      totalWeightedValue: 0,
      byStage: {} as Record<
        string,
        {
          count: number;
          totalEstimatedValue: number;
          totalWeightedValue: number;
        }
      >,
    };

    for (const opp of opportunities) {
      const st = opp.stage;
      const byStage = stats.byStage as Record<
        string,
        {
          count: number;
          totalEstimatedValue: number;
          totalWeightedValue: number;
        }
      >;

      if (!byStage[st]) {
        byStage[st] = {
          count: 0,
          totalEstimatedValue: 0,
          totalWeightedValue: 0,
        };
      }

      const estV = parseFloat(opp.estimatedValue?.toString() ?? "0");
      const wgtV = parseFloat(opp.weightedValue?.toString() ?? "0");

      byStage[st].count++;
      byStage[st].totalEstimatedValue += estV;
      byStage[st].totalWeightedValue += wgtV;
      (stats.totalEstimatedValue as number) += estV;
      (stats.totalWeightedValue as number) += wgtV;
    }

    sendSuccess(res, stats);
  },
);

/**
 * @desc   Get sales funnel analysis
 * @route  GET /api/opportunities/stats/funnel
 * @access Private (opportunity:read)
 */
export const getSalesFunnel = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const {
      assignedUserId,
      dateFrom,
      dateTo,
      groupBy = "stage",
    } = req.validatedQuery as SalesFunnelAnalysisInput;

    const where: Prisma.OpportunityWhereInput = {};
    if (assignedUserId) where.assignedUserId = assignedUserId;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const opportunities = await prisma.opportunity.findMany({
      where,
      select: {
        stage: true,
        source: true,
        status: true,
        estimatedValue: true,
        weightedValue: true,
        assignedUserId: true,
        createdAt: true,
      },
    });

    // Group by the requested dimension
    const grouped: Record<
      string,
      { count: number; totalValue: number; wonCount: number }
    > = {};

    for (const opp of opportunities) {
      let key: string;
      if (groupBy === "stage") key = opp.stage;
      else if (groupBy === "source") key = opp.source ?? "UNKNOWN";
      else if (groupBy === "assignedUser")
        key = opp.assignedUserId?.toString() ?? "UNASSIGNED";
      else key = new Date(opp.createdAt).toISOString().substring(0, 7); // YYYY-MM

      if (!grouped[key])
        grouped[key] = { count: 0, totalValue: 0, wonCount: 0 };
      grouped[key].count++;
      grouped[key].totalValue += parseFloat(
        opp.estimatedValue?.toString() ?? "0",
      );
      if (opp.status === "WON") grouped[key].wonCount++;
    }

    sendSuccess(res, { groupBy, data: grouped });
  },
);

// ============================================================================
// CLOSED REASON CONTROLLERS
// ============================================================================

/**
 * @desc   Get all closed reasons
 * @route  GET /api/opportunities/closed-reasons
 * @access Private (opportunity:read)
 */
export const getAllClosedReasons = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const {
      isWon,
      active,
      sortBy = "displayOrder",
      sortOrder = "asc",
    } = req.validatedQuery as ClosedReasonQueryInput;

    const where: Prisma.ClosedReasonWhereInput = {};
    if (isWon !== undefined) where.isWon = isWon;
    if (active !== undefined) where.active = active;

    const reasons = await prisma.closedReason.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
    });

    sendSuccess(res, reasons);
  },
);

/**
 * @desc   Create a closed reason
 * @route  POST /api/opportunities/closed-reasons
 * @access Private (opportunity:manage)
 */
export const createClosedReason = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { code, description, isWon, active, displayOrder } =
      req.validatedBody as CreateClosedReasonInput;

    const existing = await prisma.closedReason.findFirst({ where: { code } });
    if (existing) {
      sendFail(res, {
        statusCode: 409,
        message: `Codice "${code}" già esistente`,
      });
      return;
    }

    const reason = await prisma.closedReason.create({
      data: { code, description, isWon, active, displayOrder },
    });

    sendCreated(res, reason, "Motivo chiusura creato con successo");
  },
);

/**
 * @desc   Update a closed reason
 * @route  PUT /api/opportunities/closed-reasons/:id
 * @access Private (opportunity:manage)
 */
export const updateClosedReason = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as ClosedReasonIdParam;
    const payload = req.validatedBody as UpdateClosedReasonInput;

    const existing = await prisma.closedReason.findUnique({ where: { id } });
    if (!existing) {
      sendFail(res, {
        statusCode: 404,
        message: "Motivo chiusura non trovato",
      });
      return;
    }

    const reason = await prisma.closedReason.update({
      where: { id },
      data: payload,
    });
    sendSuccess(res, reason, {
      message: "Motivo chiusura aggiornato con successo",
    });
  },
);

/**
 * @desc   Delete a closed reason
 * @route  DELETE /api/opportunities/closed-reasons/:id
 * @access Private (opportunity:manage)
 */
export const deleteClosedReason = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as ClosedReasonIdParam;

    const existing = await prisma.closedReason.findUnique({ where: { id } });
    if (!existing) {
      sendFail(res, {
        statusCode: 404,
        message: "Motivo chiusura non trovato",
      });
      return;
    }

    // Check if any opportunity references this reason
    const inUse = await prisma.opportunity.count({
      where: { closedReasonId: id },
    });
    if (inUse > 0) {
      sendFail(res, {
        statusCode: 409,
        message:
          "Impossibile eliminare: motivo utilizzato da opportunità esistenti",
      });
      return;
    }

    await prisma.closedReason.delete({ where: { id } });
    sendDeleted(res, "Motivo chiusura eliminato con successo");
  },
);
