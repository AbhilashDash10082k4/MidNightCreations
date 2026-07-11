import { AccountService } from "./account.service";
import {
  updateProfileSchema,
  changePasswordSchema,
  addressInputSchema,
  savePaymentMethodSchema,
  returnRequestSchema,
} from "@repo/shared-types";

/**
 * Controller for validating parameters and routing requests to AccountService.
 */
export class AccountController {
  static async updateProfile(userId: string, payload: unknown) {
    const parsed = updateProfileSchema.safeParse(payload);
    if (!parsed.success) {
      throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
    }
    return AccountService.updateProfile(userId, parsed.data);
  }

  static async changePassword(userId: string, payload: unknown) {
    const parsed = changePasswordSchema.safeParse(payload);
    if (!parsed.success) {
      throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
    }
    return AccountService.changePassword(userId, parsed.data);
  }

  static async getAddresses(userId: string) {
    return AccountService.getAddresses(userId);
  }

  static async createAddress(userId: string, payload: unknown) {
    const parsed = addressInputSchema.safeParse(payload);
    if (!parsed.success) {
      throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
    }
    return AccountService.createAddress(userId, parsed.data);
  }

  static async updateAddress(userId: string, addressId: string, payload: unknown) {
    const parsed = addressInputSchema.safeParse(payload);
    if (!parsed.success) {
      throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
    }
    return AccountService.updateAddress(userId, addressId, parsed.data);
  }

  static async deleteAddress(userId: string, addressId: string) {
    return AccountService.deleteAddress(userId, addressId);
  }

  static async getPaymentMethods(userId: string, role?: string | null) {
    return AccountService.getPaymentMethods(userId, role);
  }

  static async createPaymentMethod(userId: string, payload: unknown, role?: string | null) {
    const parsed = savePaymentMethodSchema.safeParse(payload);
    if (!parsed.success) {
      throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
    }
    return AccountService.createPaymentMethod(userId, parsed.data, role);
  }

  static async setDefaultPaymentMethod(userId: string, id: string, role?: string | null) {
    return AccountService.setDefaultPaymentMethod(userId, id, role);
  }

  static async deletePaymentMethod(userId: string, id: string, role?: string | null) {
    return AccountService.deletePaymentMethod(userId, id, role);
  }

  static async getOrders(userId: string) {
    return AccountService.getOrders(userId);
  }

  static async getOrderDetails(userId: string, orderId: string, role?: string | null) {
    return AccountService.getOrderDetails(userId, orderId, role);
  }

  static async prepareReorder(userId: string, orderId: string, role?: string | null) {
    return AccountService.prepareReorder(userId, orderId, role);
  }

  static async createReturn(userId: string, payload: unknown, role?: string | null) {
    const parsed = returnRequestSchema.safeParse(payload);
    if (!parsed.success) {
      throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
    }
    return AccountService.createReturn(userId, parsed.data, role);
  }
}
