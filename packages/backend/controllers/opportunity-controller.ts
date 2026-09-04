import { prisma } from "../config/prisma-config";
import { Prisma } from "../generated/prisma/client";
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
  OpportunityStats,
} from "@mini-erp/shared/types";
import {
  sendCreated,
  sendDeleted,
  sendFail,
  sendNotFound,
  sendPaginatedResponse,
  sendSuccess,
} from "@/utils/response-utils";
import { Context } from "hono";
import { AppBindings } from "@/lib/hono-app";
import {
  getRequiredLanguageId,
  getRequiredTenantId,
  getValidatedBody,
  getValidatedParams,
  getValidatedQuery,
} from "@/helpers/validated-context";
import { calculateWeightedValue, STAGE_PROBABILITY_MAP } from "@/helpers/opportunity-helper";
import { connectOrDisconnectById, tenantFilter, userTenantFilter } from "@/helpers/prisma-helper";
import { OpportunitySource, OpportunityStatus, SalesStage } from "@mini-erp/shared";

// ============================================================================
// OPPORTUNITY CONTROLLERS
// ============================================================================

/**
 * @desc   Get all opportunities with filters and pagination
 * @route  GET /api/opportunities
 * @access Private (opportunity:read)
 */
export const getAllOpportunities = async (c: Context<AppBindings>) => {
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
  } = getValidatedQuery<OpportunityQueryInput>(c);

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
    if (minValue !== undefined) where.estimatedValue.gte = new Prisma.Decimal(minValue);
    if (maxValue !== undefined) where.estimatedValue.lte = new Prisma.Decimal(maxValue);
  }

  if (minProbability !== undefined || maxProbability !== undefined) {
    where.probability = {};
    if (minProbability !== undefined) where.probability.gte = minProbability;
    if (maxProbability !== undefined) where.probability.lte = maxProbability;
  }

  if (expectedCloseFrom || expectedCloseTo) {
    where.expectedCloseDate = {};
    if (expectedCloseFrom) where.expectedCloseDate.gte = new Date(expectedCloseFrom);
    if (expectedCloseTo) where.expectedCloseDate.lte = new Date(expectedCloseTo);
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

  return sendPaginatedResponse(c, opportunities, total, page, limit);
};

/**
 * @desc   Get opportunities for a specific customer
 * @route  GET /api/opportunities/customer/:customerId
 * @access Private (opportunity:read)
 */
export const getOpportunitiesByCustomer = async (c: Context<AppBindings>) => {
  const { customerId } = getValidatedParams<OpportunityCustomerIdParam>(c);
  const { status } = getValidatedQuery<Pick<OpportunityQueryInput, "status">>(c);

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

  return sendSuccess(c, opportunities, { results: opportunities.length });
};

/**
 * @desc   Get a single opportunity by ID
 * @route  GET /api/opportunities/:id
 * @access Private (opportunity:read)
 */
export const getOpportunityById = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<OpportunityIdParam>(c);
  const tenantId = getRequiredTenantId(c);
  const languageId = getRequiredLanguageId(c);

  const opportunity = await prisma.opportunity.findUnique({
    where: { tenantId, id },
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
              addresses: {
                where: {
                  addressType: "LEGAL",
                },
                select: {
                  id: true,
                  addressType: true,
                  address: true,
                  city: true,
                  zipCode: true,
                  country: true,
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
          isWon: true,
          translations: {
            where: { languageId }
          }
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
    return sendNotFound(c, "Opportunità non trovata");
  }

  return sendSuccess(c, opportunity);
};

/**
 * @desc   Create a new opportunity
 * @route  POST /api/opportunities
 * @access Private (opportunity:create)
 */
export const createOpportunity = async (c: Context<AppBindings>) => {
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
  } = getValidatedBody<CreateOpportunityInput>(c);

  const currentUserId = c.get("user")!.userId;
  const tenantId = getRequiredTenantId(c);

  const customer = await prisma.customer.findFirst({
    where: tenantFilter(tenantId, { id: customerId }),
  });
  if (!customer) {
    return sendNotFound(c, "Customer non trovato");
  }

  if (leadId) {
    const lead = await prisma.lead.findFirst({ where: tenantFilter(tenantId, { id: leadId }) });
    if (!lead) {
      return sendNotFound(c, "Lead non trovata");
    }
  }

  if (assignedUserId) {
    const user = await prisma.user.findFirst({
      where: userTenantFilter(assignedUserId, tenantId),
    });
    if (!user) {
      return sendNotFound(c, "Utente assegnato non trovato");
    }
  }

  const finalProbability =
    probability !== undefined ? probability : (STAGE_PROBABILITY_MAP[stage] ?? 0);

  const estValNumber = estimatedValue ? Number(estimatedValue) : null;
  const finalWeighted =
    providedWeightedValue !== undefined
      ? Number(providedWeightedValue)
      : calculateWeightedValue(estValNumber, finalProbability);

  const opportunity = await prisma.opportunity.create({
    data: {
      title,
      tenantId,
      description,
      customerId,
      leadId: leadId ?? null,
      source,
      status,
      stage,
      estimatedValue: estValNumber ? new Prisma.Decimal(estValNumber) : null,
      probability: finalProbability,
      weightedValue: new Prisma.Decimal(finalWeighted),
      expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
      createdByUserId: currentUserId,
      assignedUserId: assignedUserId ?? currentUserId,
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

  // TODO - Aggiungere proposed products
  return sendCreated(c, opportunity, "Opportunità creata con successo");
};

/**
 * @desc   Update an existing opportunity
 * @route  PUT /api/opportunities/:id
 * @access Private (opportunity:update)
 */
export const updateOpportunity = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<OpportunityIdParam>(c);
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
  } = getValidatedBody<UpdateOpportunityInput>(c);
  const tenantId = getRequiredTenantId(c);

  const existing = await prisma.opportunity.findUnique({ where: { id, tenantId } });
  if (!existing) {
    return sendNotFound(c, "Opportunità non trovata");
  }

  if (assignedUserId && assignedUserId !== existing.assignedUserId) {
    const user = await prisma.user.findFirst({
      where: tenantFilter(tenantId, { id: assignedUserId }),
    });
    if (!user) {
      return sendNotFound(c, "Utente assegnato non trovato");
    }
  }

  const data: Prisma.OpportunityUpdateInput = {};

  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (source !== undefined) data.source = source;
  if (status !== undefined) data.status = status;
  if (notes !== undefined) data.notes = notes;
  if (assignedUserId !== undefined) data.assignedUser = connectOrDisconnectById(assignedUserId);
  /*
  if (proposedProducts !== undefined)
    data.proposedProducts = proposedProducts as Prisma.InputJsonValue;
  */
  if (customFields !== undefined) data.customFields = customFields ?? Prisma.JsonNull;

  if (stage !== undefined && stage !== existing.stage) {
    data.stage = stage;
    data.lastStageChange = new Date();
    if (probability === undefined) {
      data.probability = STAGE_PROBABILITY_MAP[stage] ?? existing.probability;
    }
  }

  if (probability !== undefined) data.probability = probability;

  if (estimatedValue !== undefined) {
    data.estimatedValue = estimatedValue ? new Prisma.Decimal(Number(estimatedValue)) : null;
  }

  if (expectedCloseDate !== undefined) {
    data.expectedCloseDate = expectedCloseDate ? new Date(expectedCloseDate) : null;
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
  const finalProb = probability !== undefined ? probability : existing.probability;

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

  return sendSuccess(c, opportunity, {
    message: "Opportunità aggiornata con successo",
  });
};

/**
 * @desc   Update only the stage of an opportunity
 * @route  PATCH /api/opportunities/:id/stage
 * @access Private (opportunity:update)
 */
export const updateStage = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<OpportunityIdParam>(c);
  const { stage, probability, notes } = getValidatedBody<UpdateOpportunityStageInput>(c);

  const opportunity = await prisma.opportunity.findUnique({ where: { id } });
  if (!opportunity) {
    return sendNotFound(c, "Opportunità non trovata");
  }

  const finalProbability =
    probability !== undefined ? probability : (STAGE_PROBABILITY_MAP[stage] ?? 0);

  const estVal = opportunity.estimatedValue
    ? parseFloat(opportunity.estimatedValue.toString())
    : null;

  const updatedOpportunity = await prisma.opportunity.update({
    where: { id },
    data: {
      stage,
      probability: finalProbability,
      weightedValue: new Prisma.Decimal(calculateWeightedValue(estVal, finalProbability)),
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

  return sendSuccess(c, updatedOpportunity, {
    message: "Stage aggiornato con successo",
  });
};

/**
 * @desc   Generic status update (OPEN, PENDING, CLOSED, WON, LOST)
 * @route  PATCH /api/opportunities/:id/status
 * @access Private (opportunity:update)
 */
export const updateOpportunityStatus = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<OpportunityIdParam>(c);
  const { status, closedReasonId, closedNotes, actualValue } =
    getValidatedBody<UpdateOpportunityStatusInput>(c);

  const opportunity = await prisma.opportunity.findUnique({ where: { id } });
  if (!opportunity) {
    return sendNotFound(c, "Opportunità non trovata");
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

  return sendSuccess(c, updated, {
    message: `Opportunità aggiornata a ${status}`,
  });
};

/**
 * @desc   Close opportunity as WON
 * @route  PATCH /api/opportunities/:id/close-won
 * @access Private (opportunity:update)
 */
export const closeOpportunityWon = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<OpportunityIdParam>(c);
  const { actualValue, closedReasonId, closedNotes, closedDate } =
    getValidatedBody<WinOpportunityInput>(c);

  const opportunity = await prisma.opportunity.findUnique({ where: { id } });
  if (!opportunity) {
    return sendNotFound(c, "Opportunità non trovata");
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

  return sendSuccess(c, updatedOpportunity, {
    message: "Opportunità chiusa come WON",
  });
};

/**
 * @desc   Close opportunity as LOST
 * @route  PATCH /api/opportunities/:id/close-lost
 * @access Private (opportunity:update)
 */
export const closeOpportunityLost = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<OpportunityIdParam>(c);
  const { closedReasonId, closedNotes, closedDate } = getValidatedBody<LoseOpportunityInput>(c);

  const opportunity = await prisma.opportunity.findUnique({ where: { id } });
  if (!opportunity) {
    return sendNotFound(c, "Opportunità non trovata");
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

  return sendSuccess(c, updatedOpportunity, {
    message: "Opportunità chiusa come LOST",
  });
};

/**
 * @desc   Assign opportunity to a user
 * @route  PATCH /api/opportunities/:id/assign
 * @access Private (opportunity:update)
 */
export const assignOpportunity = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<OpportunityIdParam>(c);
  const { assignedUserId } = getValidatedBody<Pick<UpdateOpportunityInput, "assignedUserId">>(c);

  if (!assignedUserId) {
    return sendFail(c, {
      statusCode: 400,
      message: "assignedUserId obbligatorio",
    });
  }

  const [opportunity, user] = await Promise.all([
    prisma.opportunity.findUnique({ where: { id } }),
    prisma.user.findUnique({ where: { id: assignedUserId } }),
  ]);

  if (!opportunity) {
    return sendNotFound(c, "Opportunità non trovata");
  }
  if (!user) {
    return sendNotFound(c, "Utente non trovato");
  }

  const updatedOpportunity = await prisma.opportunity.update({
    where: { id },
    data: { assignedUserId },
    include: {
      assignedUser: { select: { id: true, username: true, email: true } },
    },
  });

  return sendSuccess(c, updatedOpportunity, {
    message: "Opportunità assegnata con successo",
  });
};

/**
 * @desc   Bulk assign opportunities to a user
 * @route  POST /api/opportunities/bulk/assign
 * @access Private (opportunity:update)
 */
export const bulkAssignOpportunities = async (c: Context<AppBindings>) => {
  const { opportunityIds, assignedUserId } = getValidatedBody<BulkAssignOpportunitiesInput>(c);

  const user = await prisma.user.findUnique({
    where: { id: assignedUserId },
  });
  if (!user) {
    return sendNotFound(c, "Utente non trovato");
  }

  const result = await prisma.opportunity.updateMany({
    where: { id: { in: opportunityIds } },
    data: { assignedUserId },
  });

  return sendSuccess(c, result, {
    message: `${result.count} opportunità assegnate`,
  });
};

/**
 * @desc   Bulk update stage for multiple opportunities
 * @route  POST /api/opportunities/bulk/stage
 * @access Private (opportunity:update)
 */
export const bulkUpdateStage = async (c: Context<AppBindings>) => {
  const { opportunityIds, stage, probability } = getValidatedBody<BulkUpdateStageInput>(c);

  const finalProbability =
    probability !== undefined ? probability : (STAGE_PROBABILITY_MAP[stage] ?? 0);

  const result = await prisma.opportunity.updateMany({
    where: { id: { in: opportunityIds } },
    data: {
      stage,
      probability: finalProbability,
      lastStageChange: new Date(),
    },
  });

  return sendSuccess(c, result, {
    message: `Stage aggiornato per ${result.count} opportunità`,
  });
};

/**
 * @desc   Delete an opportunity
 * @route  DELETE /api/opportunities/:id
 * @access Private (opportunity:delete)
 */
export const deleteOpportunity = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<OpportunityIdParam>(c);

  const opportunity = await prisma.opportunity.findUnique({
    where: { id },
    include: { documents: { select: { id: true } } },
  });

  if (!opportunity) {
    return sendNotFound(c, "Opportunità non trovata");
  }

  if (opportunity.documents.length > 0) {
    return sendFail(c, {
      statusCode: 409,
      message: "Impossibile eliminare: esistono documenti associati",
    });
  }

  await prisma.opportunity.delete({ where: { id } });
  return sendDeleted(c, "Opportunità eliminata con successo");
};

/**
 * @desc   Get pipeline statistics
 * @route  GET /api/opportunities/stats/pipeline
 * @access Private (opportunity:read)
 */
export const getPipelineStats = async (c: Context<AppBindings>) => {
  const { assignedUserId, customerId, dateFrom, dateTo, source } =
    getValidatedQuery<OpportunityStatsInput>(c);

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

  return sendSuccess(c, stats);
};

/**
 * @desc   Get sales funnel analysis
 * @route  GET /api/opportunities/stats/funnel
 * @access Private (opportunity:read)
 */
export const getSalesFunnel = async (c: Context<AppBindings>) => {
  const {
    assignedUserId,
    dateFrom,
    dateTo,
    groupBy = "stage",
  } = getValidatedQuery<SalesFunnelAnalysisInput>(c);

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
  const grouped: Record<string, { count: number; totalValue: number; wonCount: number }> = {};

  for (const opp of opportunities) {
    let key: string;
    if (groupBy === "stage") key = opp.stage;
    else if (groupBy === "source") key = opp.source ?? "UNKNOWN";
    else if (groupBy === "assignedUser") key = opp.assignedUserId?.toString() ?? "UNASSIGNED";
    else key = new Date(opp.createdAt).toISOString().substring(0, 7); // YYYY-MM

    if (!grouped[key]) grouped[key] = { count: 0, totalValue: 0, wonCount: 0 };
    grouped[key].count++;
    grouped[key].totalValue += parseFloat(opp.estimatedValue?.toString() ?? "0");
    if (opp.status === "WON") grouped[key].wonCount++;
  }

  return sendSuccess(c, { groupBy, data: grouped });
};

// ============================================================================
// OPPORTUNITY STATS
// ============================================================================

/**
 * Initialises a zero-filled Record for every value of a string-union enum.
 * @param keys - Array of all enum member strings.
 * @returns A Record with every key set to 0.
 */
function zeroRecord<T extends string>(keys: readonly T[]): Record<T, number> {
  return Object.fromEntries(keys.map((k) => [k, 0])) as Record<T, number>;
}

/**
 * @desc   Get aggregated statistics for all opportunities in the current tenant
 * @route  GET /api/opportunities/stats
 * @access Private (opportunity:read)
 */
export const getOpportunityStats = async (c: Context<AppBindings>): Promise<Response> => {
  const tenantId = getRequiredTenantId(c);

  const baseWhere: Prisma.OpportunityWhereInput = { tenantId };

  // ── 1. GROUP-BY aggregations (DB-side, minimal memory) ────────────────────

  const [statusGroups, stageGroups, sourceGroups] = await Promise.all([
    prisma.opportunity.groupBy({
      by: ["status"],
      where: baseWhere,
      _count: { _all: true },
    }),
    prisma.opportunity.groupBy({
      by: ["stage"],
      where: baseWhere,
      _count: { _all: true },
    }),
    prisma.opportunity.groupBy({
      by: ["source"],
      where: baseWhere,
      _count: { _all: true },
    }),
  ]);

  // ── 2. Scalar aggregations (single round-trip) ────────────────────────────

  const aggregate = await prisma.opportunity.aggregate({
    where: baseWhere,
    _count: { _all: true },
    _sum: {
      estimatedValue: true,
      weightedValue: true,
    },
  });

  // WON-only aggregation
  const wonAggregate = await prisma.opportunity.aggregate({
    where: { ...baseWhere, status: "WON" },
    _count: { _all: true },
    _sum: { actualValue: true },
    _avg: { actualValue: true },
  });

  // ── 3. Average sales cycle (days) via raw SQL — avoids fetching all rows ──

  type AvgCycleRow = { avg_days: number | null };
  const [cycleRow] = await prisma.$queryRaw<AvgCycleRow[]>`
    SELECT AVG(
      EXTRACT(EPOCH FROM (closed_date - created_at)) / 86400.0
    )::float AS avg_days
    FROM opportunities
    WHERE tenant_id = ${tenantId}
      AND status = 'WON'
      AND closed_date IS NOT NULL
  `;

  // ── 4. Total proposed products (OpportunityProduct rows for this tenant) ──

  const totalProposedProducts = await prisma.opportunityProduct.count({
    where: { tenantId },
  });

  // ── 5. Conversion rate: opportunities with ≥1 linked document ─────────────

  const withDocuments = await prisma.opportunity.count({
    where: {
      ...baseWhere,
      documents: { some: {} },
    },
  });

  // ── 6. Build typed output ──────────────────────────────────────────────────

  const total = aggregate._count._all;
  const wonCount = wonAggregate._count._all;
  const lostCount = statusGroups.find((g) => g.status === "LOST")?._count._all ?? 0;
  const openCount = statusGroups.find((g) => g.status === "OPEN")?._count._all ?? 0;
  const pendingCount = statusGroups.find((g) => g.status === "PENDING")?._count._all ?? 0;

  // Populate enum Records, defaulting every key to 0
  const byStatus = zeroRecord(OpportunityStatus);
  for (const g of statusGroups) byStatus[g.status] = g._count._all;

  const byStage = zeroRecord(SalesStage);
  for (const g of stageGroups) byStage[g.stage] = g._count._all;

  const bySource = zeroRecord(OpportunitySource);
  for (const g of sourceGroups) bySource[g.source] = g._count._all;

  const totalEstimatedValue = aggregate._sum.estimatedValue ?? new Prisma.Decimal(0);
  const totalWeightedValue = aggregate._sum.weightedValue ?? new Prisma.Decimal(0);
  const totalWonValue = wonAggregate._sum.actualValue ?? new Prisma.Decimal(0);
  const averageWinValue = wonAggregate._avg.actualValue ?? new Prisma.Decimal(0);

  // averageDealSize = totalEstimatedValue / total (or 0 when empty)
  const averageDealSize =
    total > 0 ? totalEstimatedValue.div(new Prisma.Decimal(total)) : new Prisma.Decimal(0);

  // winRate = wonCount / (wonCount + lostCount) * 100 — excludes open/pending
  const closedCount = wonCount + lostCount;
  const winRate = closedCount > 0 ? (wonCount / closedCount) * 100 : 0;

  const averageSalesCycle = cycleRow.avg_days ?? 0;

  const conversionRate = total > 0 ? (withDocuments / total) * 100 : 0;

  const stats = {
    total,
    open: openCount,
    won: wonCount,
    lost: lostCount,
    pending: pendingCount,
    byStatus,
    byStage,
    bySource,
    totalEstimatedValue,
    totalWeightedValue,
    totalWonValue,
    averageWinValue,
    winRate,
    averageDealSize,
    averageSalesCycle,
    totalProposedProducts,
    conversionRate,
  } satisfies OpportunityStats;

  return sendSuccess(c, stats);
};

// ============================================================================
// CLOSED REASON CONTROLLERS
// ============================================================================

/**
 * @desc   Get all closed reasons
 * @route  GET /api/opportunities/closed-reasons
 * @access Private (opportunity:read)
 */
export const getAllClosedReasons = async (c: Context<AppBindings>) => {
  const {
    isWon,
    active,
    sortBy = "displayOrder",
    sortOrder = "asc",
  } = getValidatedQuery<ClosedReasonQueryInput>(c);

  const where: Prisma.ClosedReasonWhereInput = {};
  if (isWon !== undefined) where.isWon = isWon;
  if (active !== undefined) where.active = active;

  const reasons = await prisma.closedReason.findMany({
    where,
    orderBy: { [sortBy]: sortOrder },
  });

  return sendSuccess(c, reasons);
};

/**
 * @desc   Create a closed reason
 * @route  POST /api/opportunities/closed-reasons
 * @access Private (opportunity:manage)
 */
export const createClosedReason = async (c: Context<AppBindings>) => {
  const { code, description, isWon, active, displayOrder } =
    getValidatedBody<CreateClosedReasonInput>(c);

  const existing = await prisma.closedReason.findFirst({ where: { code } });
  if (existing) {
    return sendFail(c, {
      statusCode: 409,
      message: `Codice "${code}" già esistente`,
    });
  }

  const reason = await prisma.closedReason.create({
    data: { code, description, isWon, active, displayOrder },
  });

  return sendCreated(c, reason, "Motivo chiusura creato con successo");
};

/**
 * @desc   Update a closed reason
 * @route  PUT /api/opportunities/closed-reasons/:id
 * @access Private (opportunity:manage)
 */
export const updateClosedReason = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<ClosedReasonIdParam>(c);
  const payload = getValidatedBody<UpdateClosedReasonInput>(c);

  const existing = await prisma.closedReason.findUnique({ where: { id } });
  if (!existing) {
    return sendNotFound(c, "Motivo chiusura non trovato");
  }

  const reason = await prisma.closedReason.update({
    where: { id },
    data: payload,
  });
  return sendSuccess(c, reason, {
    message: "Motivo chiusura aggiornato con successo",
  });
};

/**
 * @desc   Delete a closed reason
 * @route  DELETE /api/opportunities/closed-reasons/:id
 * @access Private (opportunity:manage)
 */
export const deleteClosedReason = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<ClosedReasonIdParam>(c);

  const existing = await prisma.closedReason.findUnique({ where: { id } });
  if (!existing) {
    return sendNotFound(c, "Motivo chiusura non trovato");
  }

  // Check if any opportunity references this reason
  const inUse = await prisma.opportunity.count({
    where: { closedReasonId: id },
  });
  if (inUse > 0) {
    return sendFail(c, {
      statusCode: 409,
      message: "Impossibile eliminare: motivo utilizzato da opportunità esistenti",
    });
    return;
  }

  await prisma.closedReason.delete({ where: { id } });
  return sendDeleted(c, "Motivo chiusura eliminato con successo");
};
