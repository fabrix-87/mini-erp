import { Prisma, PrismaClient } from "@/generated/prisma/client";

/** Accepts either the global PrismaClient or an interactive transaction client. */
export type PrismaClientOrTx = PrismaClient | Prisma.TransactionClient;
