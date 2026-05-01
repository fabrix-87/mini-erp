import { Prisma } from "@/generated/prisma/client";
import { prisma as prismaGlobal } from "../config/prisma-config";

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Generates a unique, atomic lead code using a PostgreSQL sequence.
 * Guaranteed collision-free without requiring a serializable transaction.
 *
 * @param tx - Prisma transaction client or global client
 * @returns A unique lead code string (e.g. LEAD-0042)
 */
export const generateLeadCode = async (
  tx: Prisma.TransactionClient = prismaGlobal,
): Promise<string> => {
  const result = await tx.$queryRaw<[{ nextval: bigint }]>`
    SELECT nextval('lead_code_seq')
  `;

  const nextNumber = Number(result[0].nextval);
  return `LEAD-${String(nextNumber).padStart(4, "0")}`;
};