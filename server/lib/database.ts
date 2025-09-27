import { PrismaClient } from "@prisma/client";

// Global prisma client instance for connection pooling
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Ensure DATABASE_URL is available
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is required");
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" 
    ? ["query", "error", "warn"] 
    : ["error"],
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

// Connection pool configuration
prisma.$connect()
  .then(() => {
    console.log("✅ Database connected successfully");
  })
  .catch((error) => {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  });

// Handle graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
  console.log("Database connection closed");
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  console.log("Database connection closed due to SIGINT");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  console.log("Database connection closed due to SIGTERM");
  process.exit(0);
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
