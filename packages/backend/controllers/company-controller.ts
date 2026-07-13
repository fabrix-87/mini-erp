// src/controllers/company-controller.ts
import { Context } from "hono";
import { prisma } from "../config/prisma-config";
import { sendNotFound, sendPaginatedResponse, sendSuccess } from "../utils/response-utils";
import { CompanyIdParam, CompanyQueryInput } from "@mini-erp/shared/types";
import { AppBindings } from "@/lib/hono-app";
import {
  getRequiredTenantId,
  getValidatedParams,
  getValidatedQuery,
} from "@/helpers/validated-context";
import { CompanyWhereInput } from "@/generated/prisma/models";
import { withTenantId } from "@/helpers/prisma-helper";

/**
 * GET /companies
 * List / search companies with pagination
 */
export const listCompanies = async (c: Context<AppBindings>) => {
  // query already validated by middleware; coerce defaults here
  const { search, page, limit, countryCode, status, sortBy, sortOrder } =
    getValidatedQuery<CompanyQueryInput>(c);
  const tenantId = getRequiredTenantId(c);

  const where: CompanyWhereInput = withTenantId({}, tenantId);

  if (search) {
    where.OR = [
      { code: { contains: search, mode: "insensitive" } },
      { companyName: { contains: search, mode: "insensitive" } },
      { tradeName: { contains: search, mode: "insensitive" } },
    ];
  }

  if (countryCode) where.countryCode = countryCode;
  if (status) where.status = status;

  where.AND = [
    {
      OR: [
        {
          customer: {
            is: {
              deletedAt: null,
            },
          },
        },
        {
          supplier: {
            is: {
              deletedAt: null,
            },
          },
        },
      ],
    },
  ];

  const [total, data] = await Promise.all([
    prisma.company.count({ where }),
    prisma.company.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        code: true,
        companyName: true,
        tradeName: true,
        countryCode: true,
        status: true,
        mainEmail: true,
        mainPhone: true,
      },
    }),
  ]);

  return sendPaginatedResponse(c, data, total, page, limit);
};

/**
 * GET /companies/:id
 */
export const getCompanyById = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<CompanyIdParam>(c);
  const tenantId = getRequiredTenantId(c);

  const company = await prisma.company.findFirst({
    where: withTenantId({ id }, tenantId),
    include: {
      addresses: {
        where: {
          addressType: "LEGAL",
        },
      },
      documents: true,
      notes: true,
    },
  });
  if (!company) return sendNotFound(c, "Company not found");
  return sendSuccess(c, company);
};
