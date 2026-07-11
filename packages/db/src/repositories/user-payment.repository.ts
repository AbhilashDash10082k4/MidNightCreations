import { prisma } from "../client";
import { withTenantContext } from "../tenant-context";

export type SavedPaymentMethodData = {
  stripePaymentMethodId: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault?: boolean;
};

/**
 * Repository to manage tokenized saved payment methods.
 * Ensures PostgreSQL RLS by setting tenant context.
 */
export class UserPaymentRepository {
  /**
   * Retrieves all saved payment methods for a user.
   */
  static async getSavedMethods(userId: string, role?: string | null) {
    const tenantCtx = { userId, role: role || "customer" };

    return withTenantContext(tenantCtx, async (tx) => {
      return tx.savedPaymentMethod.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
    });
  }

  /**
   * Creates a new saved payment method.
   * If isDefault is true, marks all other payment methods as non-default first.
   */
  static async createSavedMethod(
    userId: string,
    data: SavedPaymentMethodData,
    role?: string | null,
  ) {
    const tenantCtx = { userId, role: role || "customer" };

    return withTenantContext(tenantCtx, async (tx) => {
      const isDefault = data.isDefault ?? false;

      if (isDefault) {
        // Reset defaults for user
        await tx.savedPaymentMethod.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.savedPaymentMethod.create({
        data: {
          userId,
          stripePaymentMethodId: data.stripePaymentMethodId,
          brand: data.brand,
          last4: data.last4,
          expMonth: data.expMonth,
          expYear: data.expYear,
          isDefault,
        },
      });
    });
  }

  /**
   * Sets a specific payment method as the default.
   */
  static async setDefaultMethod(userId: string, id: string, role?: string | null) {
    const tenantCtx = { userId, role: role || "customer" };

    return withTenantContext(tenantCtx, async (tx) => {
      // 1. Reset all to non-default
      await tx.savedPaymentMethod.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });

      // 2. Set target to default
      return tx.savedPaymentMethod.update({
        where: { id, userId },
        data: { isDefault: true },
      });
    });
  }

  /**
   * Deletes a saved payment method.
   */
  static async deleteSavedMethod(userId: string, id: string, role?: string | null) {
    const tenantCtx = { userId, role: role || "customer" };

    return withTenantContext(tenantCtx, async (tx) => {
      return tx.savedPaymentMethod.delete({
        where: { id, userId },
      });
    });
  }
}
