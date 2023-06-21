import { PrismaClient } from "@prisma/client";

import { CONFIG } from "../Config";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (CONFIG.SERVER.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
