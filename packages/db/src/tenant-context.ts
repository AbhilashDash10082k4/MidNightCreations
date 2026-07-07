import { Prisma } from "../generated/prisma/client";

import { prisma } from "./client";

export type TenantContext = {
  userId?: string | null;
  role?: string | null;
  storeId?: string | null;
};

export async function withTenantContext<T>(
  context: TenantContext,
  operation: (tx: Prisma.TransactionClient) => Promise<T>,
) {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      select set_config('app.current_user_id', ${context.userId ?? ""}, true)
    `;
    await tx.$executeRaw`
      select set_config('app.current_role', ${context.role ?? "customer"}, true)
    `;
    await tx.$executeRaw`
      select set_config('app.current_store_id', ${context.storeId ?? ""}, true)
    `;

    return operation(tx);
  });
}

export function hasTenantContext(context: TenantContext) {
  return Boolean(context.userId || context.role || context.storeId);
}