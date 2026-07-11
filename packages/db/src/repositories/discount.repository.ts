import { prisma } from "../client";
import { Prisma } from "../../generated/prisma/client";

export class DiscountRepository {
  static async getByCode(code: string) {
    return prisma.discount.findUnique({
      where: {
        code: code.toUpperCase().trim(),
      },
    });
  }

  static async incrementUsedCount(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.discount.update({
      where: { id },
      data: {
        usedCount: {
          increment: 1,
        },
      },
    });
  }
}
