// src/controllers/company.ts
import { Request, Response } from "express";
import { prisma } from "../config/prisma-client";
import { formatPaginatedResponse } from "../utils/response";
import { AuthenticatedValidatedRequest } from '@/types/validate';

/**
 * GET /companies
 * List / search companies with pagination
 */
export const listCompanies = async (req: AuthenticatedValidatedRequest, res: Response) => {
  try {
    // query already validated by middleware; coerce defaults here
    const q = (req.query.search as string) || undefined;
    const page = Number((req.query.page as unknown) || 1);
    const perPage = Number((req.query.limit as unknown) || 20);
    const countryCode = (req.query.countryCode as string) || undefined;
    const status = (req.query.status as string) || undefined;
    const sortBy = (req.query.sortBy as string) || "companyName";
    const sortDir = (req.query.sortOrder as string) === "desc" ? "desc" : "asc";

    const where: any = {};

    if (q) {
      where.OR = [
        { code: { contains: q, mode: "insensitive" } },
        { companyName: { contains: q, mode: "insensitive" } },
        { tradeName: { contains: q, mode: "insensitive" } },
      ];
    }

    if (countryCode) where.countryCode = countryCode;
    if (status) where.status = status;

    const [total, data] = await Promise.all([
      prisma.company.count({ where }),
      prisma.company.findMany({
        where,
        orderBy: { [sortBy]: sortDir },
        skip: (page - 1) * perPage,
        take: perPage,
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

    return res.json(formatPaginatedResponse(data, total, page, perPage))
  } catch (error) {
    console.error("listCompanies error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /companies/:id
 */
export const getCompanyById = async (req: AuthenticatedValidatedRequest, res: Response) => {
  try {
    const id = Number(req.validatedParams.id);
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        legalAddress: true,
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
