import { prisma } from "../client";
import { withTenantContext } from "../tenant-context";
import { Prisma } from "../../generated/prisma/client";
import { GiftCardRepository } from "./gift-card.repository";

export type OrderCreationData = {
  userId?: string | null;
  role?: string | null;
  storeId?: string | null;
  email: string;
  fulfillmentMethod: string;
  notes?: string;
  shippingAddress: {
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  billingAddress?: {
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  } | null;
  items: Array<{
    variantId: string;
    quantity: number;
    unitPrice: number;
    personalization: Record<string, any>;
  }>;
  pricing: {
    subtotal: number;
    shippingTotal: number;
    taxTotal: number;
    discountTotal: number;
    grandTotal: number;
    discountId?: string | null;
    giftCardId?: string | null;
    giftCardRedeemedAmount?: number | null;
  };
};

export class OrderRepository {
  static async createOrder(data: OrderCreationData) {
    const tenantCtx = {
      userId: data.userId,
      role: data.role || "customer",
      storeId: data.storeId,
    };

    return withTenantContext(tenantCtx, async (tx) => {
      // 1. Create Address records if shipping/billing addresses are supplied
      const shippingAddr = await tx.address.create({
        data: {
          userId: data.userId || null,
          fullName: data.shippingAddress.fullName,
          line1: data.shippingAddress.line1,
          line2: data.shippingAddress.line2 || null,
          city: data.shippingAddress.city,
          state: data.shippingAddress.state,
          postalCode: data.shippingAddress.postalCode,
          country: data.shippingAddress.country || "US",
          phone: data.shippingAddress.phone || null,
          label: "Shipping",
        },
      });

      let billingAddrId: string | null = null;
      if (data.billingAddress) {
        const billingAddr = await tx.address.create({
          data: {
            userId: data.userId || null,
            fullName: data.billingAddress.fullName,
            line1: data.billingAddress.line1,
            line2: data.billingAddress.line2 || null,
            city: data.billingAddress.city,
            state: data.billingAddress.state,
            postalCode: data.billingAddress.postalCode,
            country: data.billingAddress.country || "US",
            phone: data.billingAddress.phone || null,
            label: "Billing",
          },
        });
        billingAddrId = billingAddr.id;
      } else {
        billingAddrId = shippingAddr.id; // Fallback to shipping address
      }

      // Generate order number
      const orderCount = await tx.order.count();
      const orderNumber = `MC-${100000 + orderCount + 1}`;

      // 2. Create the Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: data.userId || null,
          storeId: data.storeId || null,
          status: "paid",
          subtotal: new Prisma.Decimal(data.pricing.subtotal),
          shippingTotal: new Prisma.Decimal(data.pricing.shippingTotal),
          taxTotal: new Prisma.Decimal(data.pricing.taxTotal),
          discountTotal: new Prisma.Decimal(data.pricing.discountTotal),
          grandTotal: new Prisma.Decimal(data.pricing.grandTotal),
          shippingAddressId: shippingAddr.id,
          billingAddressId: billingAddrId,
          fulfillmentMethod: data.fulfillmentMethod,
          notes: data.notes || null,
          items: {
            create: data.items.map((item) => ({
              variantId: item.variantId,
              quantity: item.quantity,
              unitPrice: new Prisma.Decimal(item.unitPrice),
              personalization: item.personalization,
            })),
          },
          statusHistory: {
            create: {
              status: "paid",
              note: "Order created and paid successfully.",
              changedBy: data.userId || null,
            },
          },
        },
      });

      // 3. Deduct variant inventories
      for (const item of data.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            inventoryQty: {
              decrement: item.quantity,
            },
          },
        });
      }

      // 4. Update Discount usage if applied
      if (data.pricing.discountId) {
        await tx.discount.update({
          where: { id: data.pricing.discountId },
          data: {
            usedCount: {
              increment: 1,
            },
          },
        });
      }

      // 5. Redeem Gift Card if applied
      if (data.pricing.giftCardId && data.pricing.giftCardRedeemedAmount) {
        await GiftCardRepository.redeem(
          data.pricing.giftCardId,
          order.id,
          data.pricing.giftCardRedeemedAmount,
          tx,
        );
      }

      return order;
    });
  }

  static async getOrderById(id: string, userId?: string | null, role?: string | null) {
    const tenantCtx = {
      userId,
      role: role || "customer",
    };

    return withTenantContext(tenantCtx, async (tx) => {
      return tx.order.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: true,
                },
              },
            },
          },
          shippingAddress: true,
          billingAddress: true,
          giftCardRedemptions: {
            include: {
              giftCard: true,
            },
          },
        },
      });
    });
  }
}
