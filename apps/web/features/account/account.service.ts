import { prisma, UserPaymentRepository, ReturnRepository } from "@repo/db";
import { hashPassword, verifyPassword } from "../../lib/auth";
import type {
  UpdateProfileInput,
  ChangePasswordInput,
  AddressInput,
  SavePaymentMethodInput,
  ReturnRequestInput,
} from "@repo/shared-types";

/**
 * Service handling customer account/profile business logic.
 */
export class AccountService {
  /**
   * Updates profile data (first name, last name, phone, avatar url).
   */
  static async updateProfile(userId: string, data: UpdateProfileInput) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName !== undefined ? data.firstName : undefined,
        lastName: data.lastName !== undefined ? data.lastName : undefined,
        phone: data.phone !== undefined ? data.phone : undefined,
        avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : undefined,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        role: true,
      },
    });
  }

  /**
   * Updates user password if current password matches.
   */
  static async changePassword(userId: string, data: ChangePasswordInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found.");
    }

    // If password hash exists, verify it
    if (user.passwordHash && data.currentPassword) {
      const match = verifyPassword(data.currentPassword, user.passwordHash);
      if (!match) {
        throw new Error("Current password is incorrect.");
      }
    } else if (user.passwordHash && !data.currentPassword) {
      throw new Error("Current password is required.");
    }

    if (!data.newPassword) {
      throw new Error("New password is required.");
    }

    const hashed = hashPassword(data.newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashed },
    });

    return { success: true };
  }

  /**
   * Retrieves user address list.
   */
  static async getAddresses(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: "desc" },
    });
  }

  /**
   * Saves a new shipping/billing address.
   */
  static async createAddress(userId: string, data: AddressInput) {
    const isDefault = data.isDefault ?? false;

    if (isDefault) {
      // Set all other addresses for the user as non-default
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return prisma.address.create({
      data: {
        userId,
        label: data.label || null,
        fullName: data.fullName,
        line1: data.line1,
        line2: data.line2 || null,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country || "US",
        phone: data.phone || null,
        isDefault,
      },
    });
  }

  /**
   * Updates an existing address.
   */
  static async updateAddress(userId: string, addressId: string, data: AddressInput) {
    // Confirm ownership
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!existing) {
      throw new Error("Address not found or access denied.");
    }

    const isDefault = data.isDefault ?? false;

    if (isDefault) {
      // Set other addresses to non-default
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return prisma.address.update({
      where: { id: addressId },
      data: {
        label: data.label !== undefined ? data.label : undefined,
        fullName: data.fullName,
        line1: data.line1,
        line2: data.line2 !== undefined ? data.line2 : undefined,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        phone: data.phone !== undefined ? data.phone : undefined,
        isDefault,
      },
    });
  }

  /**
   * Deletes an address.
   */
  static async deleteAddress(userId: string, addressId: string) {
    // Confirm ownership
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!existing) {
      throw new Error("Address not found or access denied.");
    }

    return prisma.address.delete({
      where: { id: addressId },
    });
  }

  /**
   * Retrieves saved tokenized payment methods.
   */
  static async getPaymentMethods(userId: string, role?: string | null) {
    return UserPaymentRepository.getSavedMethods(userId, role);
  }

  /**
   * Saves a tokenized payment method.
   */
  static async createPaymentMethod(userId: string, data: SavePaymentMethodInput, role?: string | null) {
    return UserPaymentRepository.createSavedMethod(userId, data, role);
  }

  /**
   * Sets a default payment method.
   */
  static async setDefaultPaymentMethod(userId: string, id: string, role?: string | null) {
    return UserPaymentRepository.setDefaultMethod(userId, id, role);
  }

  /**
   * Deletes a payment method.
   */
  static async deletePaymentMethod(userId: string, id: string, role?: string | null) {
    return UserPaymentRepository.deleteSavedMethod(userId, id, role);
  }

  /**
   * Retrieves user order history.
   */
  static async getOrders(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      orderBy: { placedAt: "desc" },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: true,
                  },
                },
              },
            },
          },
        },
        shippingAddress: true,
        billingAddress: true,
      },
    });
  }

  /**
   * Retrieves single order details.
   */
  static async getOrderDetails(userId: string, orderId: string, role?: string | null) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: true,
                  },
                },
              },
            },
          },
        },
        shippingAddress: true,
        billingAddress: true,
        returnRequests: true,
      },
    });

    if (!order) {
      throw new Error("Order not found or access denied.");
    }

    return order;
  }

  /**
   * Prepares list of reorder items from a past order.
   */
  static async prepareReorder(userId: string, orderId: string, role?: string | null) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new Error("Order not found or access denied.");
    }

    // Format items to client-side CartItem structure
    return order.items.map((item) => ({
      productId: item.variant.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      personalization: item.personalization as Record<string, string>,
      productName: item.variant.product.name,
      productImage: item.variant.product.images[0]?.url || "",
      variantName: Object.entries(item.variant.optionValues as Record<string, string>)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", "),
    }));
  }

  /**
   * Creates a return/exchange request.
   */
  static async createReturn(userId: string, data: ReturnRequestInput, role?: string | null) {
    return ReturnRepository.createReturn(userId, data, role);
  }
}
