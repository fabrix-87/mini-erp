// src/controllers/company.ts
import { Request, Response } from "express";
import { prisma } from "../config/prisma-client";
import { formatPaginatedResponse } from "../utils/response";
import { AuthenticatedValidatedRequest } from "@/types/validate";
import asyncHandler from "@/middleware/async-handler";
import { CompanyQueryInput } from "@mini-erp/shared/types";

/**
 * GET /companies
 * List / search companies with pagination
 */
export const listCompanies = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    // query already validated by middleware; coerce defaults here
    const { search, page, limit, countryCode, status, sortBy, sortOrder } =
      req.validatedQuery as CompanyQueryInput;

    const where: any = {};

    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { companyName: { contains: search, mode: "insensitive" } },
        { tradeName: { contains: search, mode: "insensitive" } },
      ];
    }

    if (countryCode) where.countryCode = countryCode;
    if (status) where.status = status;

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
          totalOrders: true,
        },
      }),
    ]);

    res.json(formatPaginatedResponse(data, total, page, limit));
  },
);

/**
 * GET /companies/:id
 */
export const getCompanyById = async (
  req: AuthenticatedValidatedRequest,
  res: Response,
) => {
  try {
    const id = Number(req.validatedParams.id);
    const company = await prisma.company.findUnique({
      where: { id },
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
    if (!company) return res.status(404).json({ message: "Company not found" });
    return res.json(company);
  } catch (error) {
    console.error("getCompanyById error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
