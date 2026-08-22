import { prisma } from "../config/prisma-config";
import { AddressType, CompanyStatus, CreditCheckStatus, Prisma } from "../generated/prisma/client";
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
  LeadStats,
  CreateCompanyInput,
  CreateCustomerInput,
  AssignUserIdInput,
} from "@mini-erp/shared";
import {
  sendCreated,
  sendDeleted,
  sendFail,
  sendNotFound,
  sendPaginatedResponse,
  sendSuccess,
} from "@/utils/response-utils";
import { startOfWeek, startOfMonth } from "date-fns";
import {
  connectById,
  parseOptionalDate,
  parseOptionalDecimal,
  tenantFilter,
  withTenantId,
} from "@/helpers/prisma-helper";
import { Context } from "hono";
import { AppBindings } from "@/lib/hono-app";
import {
  getRequiredTenantId,
  getValidatedBody,
  getValidatedParams,
  getValidatedQuery,
} from "@/helpers/validated-context";
import { generateLeadCode } from "@/helpers/lead-helper";
import { generateUniqueCompanyCode, getCustomerInclude } from "@/helpers/company-helper";
import { buildCompanyCreateData, buildCustomerCreateData } from "@/services/company/company";

// ============================================================================
// LEAD CONTROLLERS
// ============================================================================

/**
 * @desc   Get all leads with filters and pagination
 * @route  GET /api/leads
 * @access Private (lead:read)
 */
export const getAllLeads = async (c: Context<AppBindings>) => {
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
    hasPendingActivity,
    campaignName,
    createdFrom,
    createdTo,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = getValidatedQuery<LeadQueryInput>(c);

  const tenantId = getRequiredTenantId(c);

  const skip = (page - 1) * limit;
  const where: Prisma.LeadWhereInput = tenantFilter(tenantId);

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
  if (campaignName) where.campaignName = { contains: campaignName, mode: "insensitive" };

  if (minScore !== undefined || maxScore !== undefined) {
    where.score = {};
    if (minScore !== undefined) where.score.gte = minScore;
    if (maxScore !== undefined) where.score.lte = maxScore;
  }

  if (bantQualified !== undefined) where.bantQualified = bantQualified;
  if (privacyConsent !== undefined) where.privacyConsent = privacyConsent;
  if (marketingConsent !== undefined) where.marketingConsent = marketingConsent;

  if (hasPendingActivity === true) {
    where.activities = {
      some: {
        status: { in: ["SCHEDULED", "IN_PROGRESS"] },
      },
    };
  }
  if (hasPendingActivity === false) {
    where.activities = {
      none: {
        status: { in: ["SCHEDULED", "IN_PROGRESS"] },
      },
    };
  }

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
        activities: {
          where: {
            status: { in: ["SCHEDULED", "IN_PROGRESS"] },
          },
          select: {
            id: true,
            type: true,
            subject: true,
            scheduledStart: true,
            priority: true,
          },
          orderBy: { scheduledStart: "asc" },
          take: 1, // solo la prossima — utile per mostrare la scadenza in lista
        },
      },
    }),
    prisma.lead.count({ where }),
  ]);

  return sendPaginatedResponse(c, leads, total, page, limit);
};

/**
 * @desc   Get a single lead by ID
 * @route  GET /api/leads/:id
 * @access Private (lead:read)
 */
export const getLeadById = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<LeadIdParam>(c);
  const tenantId = getRequiredTenantId(c);

  const lead = await prisma.lead.findFirst({
    where: tenantFilter(tenantId, { id }),
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
      activities: {
        where: {
          status: { in: ["SCHEDULED", "IN_PROGRESS"] },
        },
        select: {
          id: true,
          type: true,
          subject: true,
          status: true,
          priority: true,
          scheduledStart: true,
          assignedUser: { select: { id: true, username: true } },
        },
        orderBy: { scheduledStart: "asc" },
        take: 5, // le prossime 5 attività pianificate
      },
    },
  });

  if (!lead) {
    return sendFail(c, { statusCode: 404, message: "Lead non trovata" });
  }

  return sendSuccess(c, lead);
};

/**
 * @desc   Create a new lead
 * @route  POST /api/leads
 * @access Private (lead:create)
 */
export const createLead = async (c: Context<AppBindings>) => {
  const body = getValidatedBody<CreateLeadInput>(c);
  const currentUserId = c.get("user")?.userId;
  const tenantId = getRequiredTenantId(c);

  // Verify assignedUser if provided
  if (body.assignedUserId) {
    const user = await prisma.user.findFirst({
      where: tenantFilter(tenantId, { id: body.assignedUserId }),
    });
    if (!user) {
      return sendNotFound(c, "Utente assegnato non trovato");
    }
  }

  const lead = await prisma.$transaction(async (tx) => {
    // Auto-generate code
    const code = await generateLeadCode(tx);

    return tx.lead.create({
      data: {
        // ── Spread body escludendo i campi che override manualmente ──────────────
        ...(body as Prisma.LeadUncheckedCreateInput),

        // ── Override espliciti ───────────────────────────────────────────────────
        code,
        assignedUserId: body.assignedUserId ?? currentUserId,
        tenantId: tenantId,
        customFields: body.customFields ?? Prisma.JsonNull,

        // ── Conversioni di tipo ──────────────────────────────────────────────────
        estimatedValue: parseOptionalDecimal(body.estimatedValue),
        annualRevenue: parseOptionalDecimal(body.annualRevenue),
        budget: parseOptionalDecimal(body.budget),
        privacyConsentDate: parseOptionalDate(body.privacyConsentDate),
        marketingConsentDate: parseOptionalDate(body.marketingConsentDate),
      } satisfies Prisma.LeadUncheckedCreateInput,
      include: {
        assignedUser: { select: { id: true, username: true } },
      },
    });
  });

  return sendCreated(c, lead, "Lead creata con successo");
};

export const updateLead = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<LeadIdParam>(c);
  const body = getValidatedBody<UpdateLeadInput>(c);
  const tenantId = getRequiredTenantId(c);

  const existing = await prisma.lead.findFirst({ where: tenantFilter(tenantId, { id }) });
  if (!existing) {
    return sendNotFound(c, "Lead non trovata");
  }

  if (body.assignedUserId && body.assignedUserId !== existing.assignedUserId) {
    const user = await prisma.user.findFirst({
      where: tenantFilter(tenantId, { id: body.assignedUserId }),
    });
    if (!user) {
      return sendNotFound(c, "Utente assegnato non trovato");
    }
  }

  const lead = await prisma.lead.update({
    where: { id },
    data: {
      ...(body as Prisma.LeadUncheckedUpdateInput),

      estimatedValue: parseOptionalDecimal(body.estimatedValue),
      annualRevenue: parseOptionalDecimal(body.annualRevenue),
      budget: parseOptionalDecimal(body.budget),
      privacyConsentDate: parseOptionalDate(body.privacyConsentDate),
      marketingConsentDate: parseOptionalDate(body.marketingConsentDate),
      customFields:
        body.customFields !== undefined ? (body.customFields ?? Prisma.JsonNull) : undefined,
    } satisfies Prisma.LeadUncheckedUpdateInput,
    include: {
      assignedUser: { select: { id: true, username: true } },
    },
  });

  return sendSuccess(c, lead, { message: "Lead aggiornata con successo" });
};

/**
 * @desc   Update lead status
 * @route  PATCH /api/leads/:id/status
 * @access Private (lead:update)
 */
export const updateLeadStatus = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<LeadIdParam>(c);
  const { status, lostReason, notes } = getValidatedBody<UpdateLeadStatusInput>(c);
  const tenantId = getRequiredTenantId(c);

  const existing = await prisma.lead.findFirst({ where: tenantFilter(tenantId, { id }) });
  if (!existing) {
    return sendNotFound(c, "Lead non trovata");
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

  return sendSuccess(c, lead, { message: `Status aggiornato a ${status}` });
};

/**
 * @desc   Update lead score
 * @route  PATCH /api/leads/:id/score
 * @access Private (lead:update)
 */
export const updateLeadScore = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<LeadIdParam>(c);
  const { score, notes } = getValidatedBody<UpdateLeadScoreInput>(c);
  const tenantId = getRequiredTenantId(c);

  const existing = await prisma.lead.findFirst({ where: tenantFilter(tenantId, { id }) });
  if (!existing) {
    return sendNotFound(c, "Lead non trovata");
  }

  const lead = await prisma.lead.update({
    where: { id },
    data: {
      score,
      ...(notes !== undefined && { notes }),
    },
  });

  return sendSuccess(c, lead, { message: "Score aggiornato con successo" });
};

/**
 * @desc   Qualify a lead using BANT methodology
 * @route  PATCH /api/leads/:id/qualify
 * @access Private (lead:update)
 */
export const qualifyLead = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<LeadIdParam>(c);
  const payload = getValidatedBody<QualifyLeadInput>(c);
  const tenantId = getRequiredTenantId(c);

  const existing = await prisma.lead.findFirst({ where: tenantFilter(tenantId, { id }) });
  if (!existing) {
    return sendNotFound(c, "Lead non trovata");
  }

  const lead = await prisma.lead.update({
    where: { id },
    data: {
      bantQualified: payload.bantQualified,
      bantNotes: payload.bantNotes,
      primaryNeed: payload.primaryNeed,
      decisionAuthority: payload.decisionAuthority,
      purchaseTimeframe: payload.purchaseTimeframe,
      budget: payload.budget ? new Prisma.Decimal(Number(payload.budget)) : undefined,
      // Auto-upgrade status if qualified
      ...(payload.bantQualified &&
        existing.status === "NEW" && {
          status: "QUALIFIED",
        }),
    },
  });

  return sendSuccess(c, lead, {
    message: payload.bantQualified
      ? "Lead qualificata con successo"
      : "Lead aggiornata (non qualificata)",
  });
};

/**
 * @desc   Convert a lead to a customer
 *         Flow: Create Company → Create Customer → Create Contact → Update Lead
 * @route  POST /api/leads/:id/convert
 * @access Private (lead:convert)
 */
export const convertLead = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<LeadIdParam>(c);
  const payload = getValidatedBody<ConvertLeadInput>(c);
  const tenantId = getRequiredTenantId(c);

  const lead = await prisma.lead.findFirst({ where: tenantFilter(tenantId, { id }) });
  if (!lead) {
    return sendNotFound(c, "Lead non trovata");
  }

  if (lead.status === "CONVERTED") {
    return sendFail(c, { statusCode: 409, message: "Lead già convertita" });
  }

  const currentUserId = c.get("user")!.userId;

  // Auto-generate company code

  const result = await prisma.$transaction(async (tx) => {
    const companyCode = await generateUniqueCompanyCode("customer", tenantId, tx);

    // STEP 1: Create Company (base entity that holds fiscal + contact data)
    const companyData = {
      companyName: payload.companyName ?? lead.companyName,
      tradeName: lead.tradeName ?? undefined,
      vatNumber: payload.vatNumber ?? lead.vatNumber ?? undefined,
      taxCode: payload.taxCode ?? lead.taxCode ?? undefined,
      entityType: payload.entityType ?? "JURIDICAL",
      mainEmail: lead.contactEmail,
      mainPhone: lead.contactPhone ?? undefined,
      mainWebsite: lead.website ?? "",
      status: CompanyStatus.ACTIVE,
      countryCode: lead.countryCode || "IT",
      sdiCode: undefined,
      vatId: lead.vatNumber ?? undefined,
      eoriNumber: undefined,
      legalAddress: {
        address: lead.address || "",
        city: lead.city || "",
        countryCode: lead.countryCode || "IT",
        zipCode: lead.zipCode || "",
        addressType: AddressType.BILLING,
        isPrimary: true,
      },
    } satisfies CreateCompanyInput;

    // STEP 2: Create Customer (CRM-specific data) — linked to Company
    const customerData = {
      type: payload.customerType ?? "PROSPECT",
      priority: payload.priority ?? "LOW",
      segment: payload.segment ?? "STANDARD",
      size: lead.estimatedSize ?? "SMALL",
      creditStatus: CreditCheckStatus.PENDING,
      company: companyData,
    } satisfies CreateCustomerInput;

    const customer = await tx.customer.create({
      data: buildCustomerCreateData(
        customerData,
        buildCompanyCreateData(companyData, companyCode, tenantId),
        tenantId,
      ),
      include: getCustomerInclude(false),
    });

    // STEP 3: Create primary Contact — linked to Company (NOT Customer)
    await tx.contact.create({
      data: {
        firstName: lead.contactFirstName,
        lastName: lead.contactLastName,
        email: lead.contactEmail,
        phone: lead.contactPhone ?? undefined,
        mobilePhone: lead.contactMobile ?? undefined,
        tenant: connectById(tenantId),
        companies: {
          create: [
            {
              companyId: customer.companyId,
              position: lead.contactPosition ?? undefined,
              department: lead.contactDepartment ?? undefined,
              isPrimaryContact: true,
            },
          ],
        },
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
        id: customer.companyId,
        code: customer.company.code,
        companyName: customer.company.companyName,
      },
      customer: { id: customer.id, type: customer.type },
      lead: {
        id: updatedLead.id,
        status: updatedLead.status,
        convertedAt: updatedLead.convertedAt,
      },
    };
  });

  return sendCreated(c, result, "Lead convertita in customer con successo");
};

/**
 * @desc   Assign a lead to a user
 * @route  PATCH /api/leads/:id/assign
 * @access Private (lead:update)
 */
export const assignLead = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<LeadIdParam>(c);
  const { assignedUserId } = getValidatedBody<AssignUserIdInput>(c);
  const tenantId = getRequiredTenantId(c);

  if (!assignedUserId) {
    return sendFail(c, {
      statusCode: 400,
      message: "assignedUserId obbligatorio",
    });
  }

  const [lead, user] = await Promise.all([
    prisma.lead.findFirst({ where: tenantFilter(tenantId, { id }) }),
    prisma.user.findFirst({ where: tenantFilter(tenantId, { id: assignedUserId }) }),
  ]);

  if (!lead) {
    return sendNotFound(c, "Lead non trovata");
  }
  if (!user) {
    return sendNotFound(c, "Utente non trovato");
  }

  const updatedLead = await prisma.lead.update({
    where: { id },
    data: { assignedUserId },
    include: {
      assignedUser: { select: { id: true, username: true, email: true } },
    },
  });

  return sendSuccess(c, updatedLead, { message: "Lead assegnata con successo" });
};

/**
 * @desc   Bulk assign leads to a user
 * @route  POST /api/leads/bulk/assign
 * @access Private (lead:update)
 */
export const bulkAssignLeads = async (c: Context<AppBindings>) => {
  const { leadIds, assignedUserId } = getValidatedBody<BulkAssignLeadsInput>(c);
  const tenantId = getRequiredTenantId(c);

  const user = await prisma.user.findFirst({
    where: tenantFilter(tenantId, { id: assignedUserId }),
  });
  if (!user) {
    return sendNotFound(c, "Utente non trovato");
  }

  const result = await prisma.lead.updateMany({
    where: tenantFilter(tenantId, { id: { in: leadIds } }),
    data: { assignedUserId },
  });

  return sendSuccess(c, result, { message: `${result.count} lead assegnate` });
};

/**
 * @desc   Bulk update lead status
 * @route  POST /api/leads/bulk/status
 * @access Private (lead:update)
 */
export const bulkUpdateLeadStatus = async (c: Context<AppBindings>) => {
  const { leadIds, status, lostReason } = getValidatedBody<BulkUpdateLeadStatusInput>(c);
  const tenantId = getRequiredTenantId(c);

  const result = await prisma.lead.updateMany({
    where: tenantFilter(tenantId, { id: { in: leadIds } }),
    data: {
      status,
      ...(lostReason && { lostReason }),
    },
  });

  return sendSuccess(c, result, {
    message: `${result.count} lead aggiornate a ${status}`,
  });
};

/**
 * @desc   Delete a lead
 * @route  DELETE /api/leads/:id
 * @access Private (lead:delete)
 */
export const deleteLead = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<LeadIdParam>(c);
  const tenantId = getRequiredTenantId(c);
  const { userId } = c.get("user")!;

  const lead = await prisma.lead.findFirst({
    where: tenantFilter(tenantId, { id }),
    include: { opportunities: { select: { id: true } } },
  });

  if (!lead) {
    return sendNotFound(c, "Lead non trovata");
  }

  if (lead.status === "CONVERTED") {
    return sendFail(c, {
      statusCode: 409,
      message: "Impossibile eliminare una lead già convertita",
    });
  }

  if (lead.opportunities.length > 0) {
    return sendFail(c, {
      statusCode: 409,
      message: "Impossibile eliminare: esistono opportunità associate",
    });
  }

  await prisma.lead.update({
    where: { id, tenantId },
    data: {
      deletedAt: new Date(),
      deletedBy: connectById(userId),
    },
  });
  return sendDeleted(c, "Lead eliminata con successo");
};

/**
 * @desc   Get lead statistics with database-level aggregations
 * @route  GET /api/leads/stats
 * @access Private (lead:read)
 */
export const getLeadStats = async (c: Context<AppBindings>) => {
  const { assignedUserId, dateFrom, dateTo, source, campaignName } =
    getValidatedQuery<LeadStatsInput>(c);
  const tenantId = getRequiredTenantId(c);

  // ── Where clause ─────────────────────────────────────────────────────────
  const where: Prisma.LeadWhereInput = tenantFilter(tenantId, {});
  if (assignedUserId) where.assignedUserId = assignedUserId;
  if (source) where.source = source;
  if (campaignName) where.campaignName = campaignName;
  if (dateFrom || dateTo) {
    where.createdAt = {
      ...(dateFrom && { gte: new Date(dateFrom) }),
      ...(dateTo && { lte: new Date(dateTo) }),
    };
  }

  // ── Date boundaries ───────────────────────────────────────────────────────
  const now = new Date();
  // startOfWeek con locale Monday (weekStartsOn: 1)
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);

  // ── Parallel DB queries (aggregazioni delegate al DB) ────────────────────
  const [
    byStatusRaw,
    bySourceRaw,
    byQualityRaw,
    aggregates,
    conversionTimeRaw,
    estimatedValueRaw,
    newThisWeekCount,
    newThisMonthCount,
    overdueFollowUpCount,
    scheduledFollowUpCount,
  ] = await Promise.all([
    // Conteggi per status
    prisma.lead.groupBy({
      by: ["status"],
      where,
      _count: { _all: true },
    }),

    // Conteggi per source
    prisma.lead.groupBy({
      by: ["source"],
      where,
      _count: { _all: true },
    }),

    // Conteggi per quality
    prisma.lead.groupBy({
      by: ["quality"],
      where,
      _count: { _all: true },
    }),

    // Aggregati globali: total, avgScore, bantQualified, lost
    prisma.lead.aggregate({
      where,
      _count: { _all: true, bantQualified: true },
      _avg: { score: true },
    }),

    // Tempo medio di conversione: prendiamo solo i converted con convertedAt
    prisma.lead.findMany({
      where: { ...where, status: "CONVERTED", convertedAt: { not: null } },
      select: { createdAt: true, convertedAt: true },
    }),

    // Somma estimatedValue (esclusi LOST, ARCHIVED, DUPLICATE)
    prisma.lead.aggregate({
      where: {
        ...where,
        status: { notIn: ["LOST", "ARCHIVED", "DUPLICATE"] },
        estimatedValue: { not: null },
      },
      _sum: { estimatedValue: true },
    }),

    // Nuovi questa settimana
    prisma.lead.count({
      where: { ...where, createdAt: { gte: weekStart } },
    }),

    // Nuovi questo mese
    prisma.lead.count({
      where: { ...where, createdAt: { gte: monthStart } },
    }),

    // Follow-up scaduti: activity SCHEDULED passata, collegata a un lead attivo
    prisma.activity.count({
      where: {
        leadId: { not: null },
        status: { in: ["SCHEDULED", "IN_PROGRESS"] },
        scheduledStart: { lt: now },
        lead: {
          status: { notIn: ["CONVERTED", "LOST", "ARCHIVED", "DUPLICATE"] },
          ...(assignedUserId ? { assignedUserId } : {}),
        },
      },
    }),

    // Follow-up pianificati futuri
    prisma.activity.count({
      where: {
        leadId: { not: null },
        status: "SCHEDULED",
        scheduledStart: { gt: now },
        lead: {
          status: { notIn: ["CONVERTED", "LOST", "ARCHIVED", "DUPLICATE"] },
          ...(assignedUserId ? { assignedUserId } : {}),
        },
      },
    }),
  ]);

  // ── Trasformazione risultati ──────────────────────────────────────────────
  const byStatus = Object.fromEntries(byStatusRaw.map((r) => [r.status, r._count._all]));

  const bySource = Object.fromEntries(bySourceRaw.map((r) => [r.source, r._count._all]));

  const byQuality = Object.fromEntries(byQualityRaw.map((r) => [r.quality, r._count._all]));

  const total = aggregates._count._all;
  const converted = byStatus["CONVERTED"] ?? 0;
  const lost = byStatus["LOST"] ?? 0;

  /**
   * Calculates the average conversion time in days for converted leads.
   * Returns 0 if no converted leads with valid dates are found.
   */
  const averageConversionTime = (() => {
    if (conversionTimeRaw.length === 0) return 0;
    const totalDays = conversionTimeRaw.reduce((sum, lead) => {
      const days = Math.round(
        (lead.convertedAt!.getTime() - lead.createdAt.getTime()) / (1000 * 60 * 60 * 24),
      );
      return sum + days;
    }, 0);
    return Math.round(totalDays / conversionTimeRaw.length);
  })();

  const stats = {
    total,
    byStatus,
    bySource,
    byQuality,
    newThisWeek: newThisWeekCount,
    newThisMonth: newThisMonthCount,
    converted,
    lost,
    conversionRate: total > 0 ? Math.round((converted / total) * 100) : 0,
    averageScore: Math.round(aggregates._avg.score ?? 0),
    averageConversionTime,
    totalEstimatedValue: estimatedValueRaw._sum.estimatedValue ?? new Prisma.Decimal(0),
    qualifiedLeads: aggregates._count.bantQualified,
    needFollowUp: overdueFollowUpCount,
    overdueFollowUp: scheduledFollowUpCount,
  } satisfies LeadStats;

  return sendSuccess(c, stats);
};
