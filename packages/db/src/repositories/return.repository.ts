import { prisma } from "../client";
import { withTenantContext } from "../tenant-context";

export type ReturnRequestData = {
  orderId: string;
  reason: string;
  photoUrl?: string | null;
};

/**
 * Repository to manage order returns/exchanges.
 * Ensures PostgreSQL RLS by setting tenant context.
 */
export class ReturnRepository {
  /**
   * Retrieves all return requests for a specific order.
   */
  static async getReturnsForOrder(orderId: string, userId: string, role?: string | null) {
    const tenantCtx = { userId, role: role || "customer" };

    return withTenantContext(tenantCtx, async (tx) => {
      // Find the order first to ensure tenant/user access
      const order = await tx.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        throw new Error("Order not found or access denied.");
      }

      return tx.returnRequest.findMany({
        where: { orderId },
        orderBy: { createdAt: "desc" },
      });
    });
  }

  /**
   * Creates a return request.
   */
  static async createReturn(userId: string, data: ReturnRequestData, role?: string | null) {
    const tenantCtx = { userId, role: role || "customer" };

    return withTenantContext(tenantCtx, async (tx) => {
      // Verify order ownership/access
      const order = await tx.order.findUnique({
        where: { id: data.orderId },
      });

      if (!order) {
        throw new Error("Order not found or access denied.");
      }

      return tx.returnRequest.create({
        data: {
          orderId: data.orderId,
          reason: data.reason,
          photoUrl: data.photoUrl || null,
          status: "pending",
        },
      });
    });
  }
}
