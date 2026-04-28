import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({
  adapter,
  log: [
    {
      emit: "event",
      level: "query",
    },
    {
      emit: "event",
      level: "error",
    },
    {
      emit: "event",
      level: "info",
    },
    {
      emit: "event",
      level: "warn",
    },
  ],
});

// Gestione degli eventi Prisma
prisma.$on("error", (event) => {
  console.error("Prisma Client Error:", event);
});

prisma.$on("warn", (event) => {
  console.warn("Prisma Client Warning:", event);
});

prisma.$on("query", (e) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`Query[${new Date().toISOString()}]: ${e.query}`);
    console.log("Params: " + e.params);
    console.log("Duration: " + e.duration + "ms");
  }
});

export { prisma };
