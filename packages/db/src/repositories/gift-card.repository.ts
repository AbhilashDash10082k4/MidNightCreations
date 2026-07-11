import { prisma } from "../client";
import { Prisma } from "../../generated/prisma/client";

export class GiftCardRepository {
  static async getByCode(code: string) {
    return prisma.giftCard.findUnique({
      where: {
        code: code.toUpperCase().trim(),
      },
    });
  }

  static async redeem(
    giftCardId: string,
    orderId: string,
    amount: number,
    tx: Prisma.TransactionClient,
  ) {
    // Deduct balance from gift card
    await tx.giftCard.update({
      where: { id: giftCardId },
      data: {
        balance: {
          decrement: new Prisma.Decimal(amount),
        },
      },
    });

    // Create redemption record
    return tx.giftCardRedemption.create({
      data: {
        giftCardId,
        orderId,
        amount: new Prisma.Decimal(amount),
      },
    });
  }
}
