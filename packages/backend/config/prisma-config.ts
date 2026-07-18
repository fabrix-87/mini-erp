import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

/**
 * pg.Pool is used instead of pg.Client to prevent the DeprecationWarning
 * "Calling client.query() when the client is already executing a query"
 * raised by pg@8.x when multiple concurrent queries are issued on a single
 * Client instance. A Pool assigns a dedicated connection per query, making
 * concurrent Prisma operations safe.
 *
 * Pool sizing guidance:
 *  - max: 10 is a safe default for a single-process Node/Bun server.
 *  - idleTimeoutMillis: close idle connections after 30 s to avoid holding
 *    PostgreSQL connections unnecessarily.
 *  - connectionTimeoutMillis: fail fast if the pool is exhausted (avoid
 *    hanging requests under load).
 */
const pool = new pg.Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: [
    { emit: "event", level: "query" },
    { emit: "event", level: "error" },
    { emit: "event", level: "info" },
    { emit: "event", level: "warn" },
  ],
});

prisma.$on("error", (event) => {
  console.error("Prisma Client Error:", event);
});

prisma.$on("warn", (event) => {
  console.warn("Prisma Client Warning:", event);
});

prisma.$on("info", (event) => {
  console.info("Prisma Client Info:", event);
});

export { prisma };