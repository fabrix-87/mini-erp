import { Response } from "express";
import { prisma } from "../config/prisma-client";
import { Prisma } from "../generated/prisma/client";
import { AuthenticatedValidatedRequest } from "@/types/validate";
import asyncHandler from "@/middleware/async-handler";
import {
  LeadQueryInput,
  LeadIdParam,
  CreateLeadInput,
  UpdateLeadInput,
  UpdateLeadStatusInput,
  UpdateLeadScoreInput,
  QualifyLeadInput,
  ConvertLeadInput,
  BulkAssignLeadsInput,
  BulkUpdateLeadStatusInput,
  LeadStatsInput,
} from "@mini-erp/shared";
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

/**
 * Generates a sequential lead code (e.g. LEAD-000042)
 * Falls back to timestamp-based code on collision
 */
const generateLeadCode = async (): Promise<string> => {
  const count = await prisma.lead.count();
  return `LEAD-${String(count + 1).padStart(6, "0")}`;
};

// ============================================================================
// LEAD CONTROLLERS
// ============================================================================

/**
 * @desc   Get all leads with filters and pagination
 * @route  GET /api/leads
 * @access Private (lead:read)
 */
export const getAllLeads = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      source,
      quality,
      assignedUserId,
      countryCode,
      minScore,
      maxScore,
      estimatedSize,
      industry,
      bantQualified,
      privacyConsent,
      marketingConsent,
      hasNextFollowUp,
      campaignName,
      createdFrom,
      createdTo,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.validatedQuery as LeadQueryInput;

    const skip = (page - 1) * limit;
    const where: Prisma.LeadWhereInput = {};

    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: "insensitive" } },
        { contactFirstName: { contains: search, mode: "insensitive" } },
        { contactLastName: { contains: search, mode: "insensitive" } },
        { contactEmail: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) where.status = status;
    if (source) where.source = source;
    if (quality) where.quality = quality;
    if (assignedUserId) where.assignedUserId = assignedUserId;
    if (countryCode) where.countryCode = countryCode;
    if (estimatedSize) where.estimatedSize = estimatedSize;
    if (industry) where.industry = { contains: industry, mode: "insensitive" };
    if (campaignName)
      where.campaignName = { contains: campaignName, mode: "insensitive" };

    if (minScore !== undefined || maxScore !== undefined) {
      where.score = {};
      if (minScore !== undefined) where.score.gte = minScore;
      if (maxScore !== undefined) where.score.lte = maxScore;
    }

    if (bantQualified !== undefined) where.bantQualified = bantQualified;
    if (privacyConsent !== undefined) where.privacyConsent = privacyConsent;
    if (marketingConsent !== undefined)
      where.marketingConsent = marketingConsent;

    if (hasNextFollowUp === true) where.nextFollowUpDate = { not: null };
    if (hasNextFollowUp === false) where.nextFollowUpDate = null;

    if (createdFrom || createdTo) {
      where.createdAt = {};
      if (createdFrom) where.createdAt.gte = new Date(createdFrom);
      if (createdTo) where.createdAt.lte = new Date(createdTo);
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          assignedUser: { select: { id: true, username: true, email: true } },
          opportunities: {
            select: {
              id: true,
              title: true,
              status: true,
              estimatedValue: true,
            },
          },
        },
      }),
      prisma.lead.count({ where }),
    ]);

    sendPaginatedResponse(res, leads, total, page, limit);
  },
);

/**
 * @desc   Get a single lead by ID
 * @route  GET /api/leads/:id
 * @access Private (lead:read)
 */
export const getLeadById = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as LeadIdParam;

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        assignedUser: {
          select: {
            id: true,
            username: true,
            email: true,
            details: { select: { firstName: true, lastName: true } },
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
        opportunities: {
          select: {
            id: true,
            title: true,
            status: true,
            stage: true,
            estimatedValue: true,
            expectedCloseDate: true,
          },
          orderBy: { createdAt: "desc" },
        },
        convertedTo: {
          select: {
            id: true,
            type: true,
            company: {
              select: { id: true, code: true, companyName: true },
            },
          },
        },
      },
    });

    if (!lead) {
      sendFail(res, { statusCode: 404, message: "Lead non trovata" });
      return;
    }

    sendSuccess(res, lead);
  },
);

/**
 * @desc   Create a new lead
 * @route  POST /api/leads
 * @access Private (lead:create)
 */
export const createLead = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const body = req.validatedBody as CreateLeadInput;
    const currentUserId = req.user?.userId;

    // Auto-generate code if not provided
    const code = body.code ?? (await generateLeadCode());

    // Verify assignedUser if provided
    if (body.assignedUserId) {
      const user = await prisma.user.findUnique({
        where: { id: body.assignedUserId },
      });
      if (!user) {
        sendFail(res, {
          statusCode: 404,
          message: "Utente assegnato non trovato",
        });
        return;
      }
    }

    const lead = await prisma.lead.create({
      data: {
        ...body,
        code,
        estimatedValue: body.estimatedValue
          ? new Prisma.Decimal(Number(body.estimatedValue))
          : null,
        annualRevenue: body.annualRevenue
          ? new Prisma.Decimal(Number(body.annualRevenue))
          : null,
        budget: body.budget ? new Prisma.Decimal(Number(body.budget)) : null,
        nextFollowUpDate: body.nextFollowUpDate
          ? new Date(body.nextFollowUpDate)
          : null,
        privacyConsentDate: body.privacyConsentDate
          ? new Date(body.privacyConsentDate)
          : null,
        marketingConsentDate: body.marketingConsentDate
          ? new Date(body.marketingConsentDate)
          : null,
        createdByUserId: currentUserId,
        assignedUserId: body.assignedUserId ?? currentUserId,
        customFields: body.customFields ?? Prisma.JsonNull,
      },
      include: {
        assignedUser: { select: { id: true, username: true } },
      },
    });

    sendCreated(res, lead, "Lead creata con successo");
  },
);

/**
 * @desc   Update an existing lead
 * @route  PUT /api/leads/:id
 * @access Private (lead:update)
 */
export const updateLead = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as LeadIdParam;
    const body = req.validatedBody as UpdateLeadInput;

    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      sendFail(res, { statusCode: 404, message: "Lead non trovata" });
      return;
    }

    if (
      body.assignedUserId &&
      body.assignedUserId !== existing.assignedUserId
    ) {
      const user = await prisma.user.findUnique({
        where: { id: body.assignedUserId },
      });
      if (!user) {
        sendFail(res, {
          statusCode: 404,
          message: "Utente assegnato non trovato",
        });
        return;
      }
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        ...body,
        estimatedValue:
          body.estimatedValue !== undefined
            ? body.estimatedValue
              ? new Prisma.Decimal(Number(body.estimatedValue))
              : null
            : undefined,
        annualRevenue:
          body.annualRevenue !== undefined
            ? body.annualRevenue
              ? new Prisma.Decimal(Number(body.annualRevenue))
              : null
            : undefined,
        budget:
          body.budget !== undefined
            ? body.budget
              ? new Prisma.Decimal(Number(body.budget))
              : null
            : undefined,
        nextFollowUpDate:
          body.nextFollowUpDate !== undefined
            ? body.nextFollowUpDate
              ? new Date(body.nextFollowUpDate)
              : null
            : undefined,
        privacyConsentDate:
          body.privacyConsentDate !== undefined
            ? body.privacyConsentDate
              ? new Date(body.privacyConsentDate)
              : null
            : undefined,
        marketingConsentDate:
          body.marketingConsentDate !== undefined
            ? body.marketingConsentDate
              ? new Date(body.marketingConsentDate)
              : null
            : undefined,
        customFields:
          body.customFields !== undefined
            ? (body.customFields ?? Prisma.JsonNull)
            : undefined,
      },
      include: {
        assignedUser: { select: { id: true, username: true } },
      },
    });

    sendSuccess(res, lead, { message: "Lead aggiornata con successo" });
  },
);

/**
 * @desc   Update lead status
 * @route  PATCH /api/leads/:id/status
 * @access Private (lead:update)
 */
export const updateLeadStatus = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as LeadIdParam;
    const { status, lostReason, notes } =
      req.validatedBody as UpdateLeadStatusInput;

    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      sendFail(res, { statusCode: 404, message: "Lead non trovata" });
      return;
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        status,
        ...(lostReason !== undefined && { lostReason }),
        ...(notes !== undefined && { notes }),
        ...(status === "CONVERTED" && { convertedAt: new Date() }),
      },
    });

    sendSuccess(res, lead, { message: `Status aggiornato a ${status}` });
  },
);

/**
 * @desc   Update lead score
 * @route  PATCH /api/leads/:id/score
 * @access Private (lead:update)
 */
export const updateLeadScore = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as LeadIdParam;
    const { score, notes } = req.validatedBody as UpdateLeadScoreInput;

    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      sendFail(res, { statusCode: 404, message: "Lead non trovata" });
      return;
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        score,
        ...(notes !== undefined && { notes }),
      },
    });

    sendSuccess(res, lead, { message: "Score aggiornato con successo" });
  },
);

/**
 * @desc   Qualify a lead using BANT methodology
 * @route  PATCH /api/leads/:id/qualify
 * @access Private (lead:update)
 */
export const qualifyLead = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as LeadIdParam;
    const payload = req.validatedBody as QualifyLeadInput;

    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      sendFail(res, { statusCode: 404, message: "Lead non trovata" });
      return;
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        bantQualified: payload.bantQualified,
        bantNotes: payload.bantNotes,
        primaryNeed: payload.primaryNeed,
        decisionAuthority: payload.decisionAuthority,
        purchaseTimeframe: payload.purchaseTimeframe,
        budget: payload.budget
          ? new Prisma.Decimal(Number(payload.budget))
          : undefined,
        // Auto-upgrade status if qualified
        ...(payload.bantQualified &&
          existing.status === "NEW" && {
            status: "QUALIFIED",
          }),
      },
    });

    sendSuccess(res, lead, {
      message: payload.bantQualified
        ? "Lead qualificata con successo"
        : "Lead aggiornata (non qualificata)",
    });
  },
);

/**
 * @desc   Convert a lead to a customer
 *         Flow: Create Company → Create Customer → Create Contact → Update Lead
 * @route  POST /api/leads/:id/convert
 * @access Private (lead:convert)
 */
export const convertLead = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as LeadIdParam;
    const payload = req.validatedBody as ConvertLeadInput;

    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      sendFail(res, { statusCode: 404, message: "Lead non trovata" });
      return;
    }

    if (lead.status === "CONVERTED") {
      sendFail(res, { statusCode: 409, message: "Lead già convertita" });
      return;
    }

    const currentUserId = req.user!.userId;

    // Auto-generate company code
    const companyCount = await prisma.company.count();
    const companyCode = `COMP-${String(companyCount + 1).padStart(6, "0")}`;

    const result = await prisma.$transaction(async (tx) => {
      // STEP 1: Create Company (base entity that holds fiscal + contact data)
      const company = await tx.company.create({
        data: {
          code: companyCode,
          companyName: payload.companyName ?? lead.companyName,
          tradeName: lead.tradeName ?? undefined,
          vatNumber: payload.vatNumber ?? lead.vatNumber ?? undefined,
          taxCode: payload.taxCode ?? lead.taxCode ?? undefined,
          countryCode: payload.countryCode ?? lead.countryCode,
          entityType: payload.entityType ?? "JURIDICAL",
          mainEmail: lead.contactEmail,
          mainPhone: lead.contactPhone ?? undefined,
        },
      });

      // STEP 2: Create Customer (CRM-specific data) — linked to Company
      const customer = await tx.customer.create({
        data: {
          companyId: company.id,
          type: payload.customerType ?? "PROSPECT",
          priority: payload.priority ?? "LOW",
          segment: payload.segment ?? "STANDARD",
          size: lead.estimatedSize ?? "SMALL",
          customerSince: new Date(),
        },
      });

      // STEP 3: Create primary Contact — linked to Company (NOT Customer)
      await tx.contact.create({
        data: {
          companyId: company.id,
          firstName: lead.contactFirstName,
          lastName: lead.contactLastName,
          email: lead.contactEmail,
          phone: lead.contactPhone ?? undefined,
          mobilePhone: lead.contactMobile ?? undefined,
          position: lead.contactPosition ?? undefined,
          department: lead.contactDepartment ?? undefined,
          isPrimaryContact: true,
        },
      });

      // STEP 4: Mark lead as converted
      const updatedLead = await tx.lead.update({
        where: { id },
        data: {
          status: "CONVERTED",
          convertedAt: new Date(),
          convertedToId: customer.id, // ← campo corretto
          convertedByUserId: currentUserId,
          lastStatusChange: new Date(),
        },
      });

      return {
        company: {
          id: company.id,
          code: company.code,
          companyName: company.companyName,
        },
        customer: { id: customer.id, type: customer.type },
        lead: {
          id: updatedLead.id,
          status: updatedLead.status,
          convertedAt: updatedLead.convertedAt,
        },
      };
    });

    sendCreated(res, result, "Lead convertita in customer con successo");
  },
);

/**
 * @desc   Assign a lead to a user
 * @route  PATCH /api/leads/:id/assign
 * @access Private (lead:update)
 */
export const assignLead = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as LeadIdParam;
    const { assignedUserId } = req.validatedBody as Pick<
      UpdateLeadInput,
      "assignedUserId"
    >;

    if (!assignedUserId) {
      sendFail(res, {
        statusCode: 400,
        message: "assignedUserId obbligatorio",
      });
      return;
    }

    const [lead, user] = await Promise.all([
      prisma.lead.findUnique({ where: { id } }),
      prisma.user.findUnique({ where: { id: assignedUserId } }),
    ]);

    if (!lead) {
      sendFail(res, { statusCode: 404, message: "Lead non trovata" });
      return;
    }
    if (!user) {
      sendFail(res, { statusCode: 404, message: "Utente non trovato" });
      return;
    }

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: { assignedUserId },
      include: {
        assignedUser: { select: { id: true, username: true, email: true } },
      },
    });

    sendSuccess(res, updatedLead, { message: "Lead assegnata con successo" });
  },
);

/**
 * @desc   Bulk assign leads to a user
 * @route  POST /api/leads/bulk/assign
 * @access Private (lead:update)
 */
export const bulkAssignLeads = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { leadIds, assignedUserId } =
      req.validatedBody as BulkAssignLeadsInput;

    const user = await prisma.user.findUnique({
      where: { id: assignedUserId },
    });
    if (!user) {
      sendFail(res, { statusCode: 404, message: "Utente non trovato" });
      return;
    }

    const result = await prisma.lead.updateMany({
      where: { id: { in: leadIds } },
      data: { assignedUserId },
    });

    sendSuccess(res, result, { message: `${result.count} lead assegnate` });
  },
);

/**
 * @desc   Bulk update lead status
 * @route  POST /api/leads/bulk/status
 * @access Private (lead:update)
 */
export const bulkUpdateLeadStatus = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { leadIds, status, lostReason } =
      req.validatedBody as BulkUpdateLeadStatusInput;

    const result = await prisma.lead.updateMany({
      where: { id: { in: leadIds } },
      data: {
        status,
        ...(lostReason && { lostReason }),
      },
    });

    sendSuccess(res, result, {
      message: `${result.count} lead aggiornate a ${status}`,
    });
  },
);

/**
 * @desc   Delete a lead
 * @route  DELETE /api/leads/:id
 * @access Private (lead:delete)
 */
export const deleteLead = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as LeadIdParam;

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: { opportunities: { select: { id: true } } },
    });

    if (!lead) {
      sendFail(res, { statusCode: 404, message: "Lead non trovata" });
      return;
    }

    if (lead.status === "CONVERTED") {
      sendFail(res, {
        statusCode: 409,
        message: "Impossibile eliminare una lead già convertita",
      });
      return;
    }

    if (lead.opportunities.length > 0) {
      sendFail(res, {
        statusCode: 409,
        message: "Impossibile eliminare: esistono opportunità associate",
      });
      return;
    }

    await prisma.lead.delete({ where: { id } });
    sendDeleted(res, "Lead eliminata con successo");
  },
);

/**
 * @desc   Get lead statistics
 * @route  GET /api/leads/stats
 * @access Private (lead:read)
 */
export const getLeadStats = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { assignedUserId, dateFrom, dateTo, source, campaignName } =
      req.validatedQuery as LeadStatsInput;

    const where: Prisma.LeadWhereInput = {};
    if (assignedUserId) where.assignedUserId = assignedUserId;
    if (source) where.source = source;
    if (campaignName) where.campaignName = campaignName;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const leads = await prisma.lead.findMany({
      where,
      select: {
        status: true,
        source: true,
        quality: true,
        score: true,
        bantQualified: true,
      },
    });

    const stats = {
      total: leads.length,
      byStatus: {} as Record<string, number>,
      bySource: {} as Record<string, number>,
      byQuality: {} as Record<string, number>,
      qualified: leads.filter((l) => l.bantQualified).length,
      avgScore: leads.length
        ? Math.round(leads.reduce((acc, l) => acc + l.score, 0) / leads.length)
        : 0,
    };

    for (const lead of leads) {
      stats.byStatus[lead.status] = (stats.byStatus[lead.status] ?? 0) + 1;
      stats.bySource[lead.source] = (stats.bySource[lead.source] ?? 0) + 1;
      stats.byQuality[lead.quality] = (stats.byQuality[lead.quality] ?? 0) + 1;
    }

    sendSuccess(res, stats);
  },
);
