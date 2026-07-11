import React from "react";
import Link from "next/link";
import { requireCurrentUser } from "../../lib/auth";
import { AccountService } from "../../features/account/account.service";
import { prisma } from "@repo/db";
import { TabsContainer } from "./components/tabs-container";

/**
 * Server component loading initial customer identity details, address arrays,
 * and order history from DB. Renders TabsContainer component.
 */
export default async function AccountPage() {
  // Ensure user is authenticated
  const user = await requireCurrentUser();

  // Load addresses, payments, orders under current user context
  const [addresses, payments, orders, oauthAccounts, dbUser] = await Promise.all([
    AccountService.getAddresses(user.id),
    AccountService.getPaymentMethods(user.id, user.role),
    AccountService.getOrders(user.id),
    prisma.oauthAccount.findMany({
      where: { userId: user.id },
      select: { provider: true, createdAt: true },
    }),
    prisma.user.findUnique({
      where: { id: user.id },
      select: {
        emailVerifiedAt: true,
        phone: true,
        avatarUrl: true,
        firstName: true,
        lastName: true,
      },
    }),
  ]);

  // Format prisma objects for serializability to client component
  const formattedAddresses = addresses.map((a) => ({
    id: a.id,
    label: a.label,
    fullName: a.fullName,
    line1: a.line1,
    line2: a.line2,
    city: a.city,
    state: a.state,
    postalCode: a.postalCode,
    country: a.country,
    phone: a.phone,
    isDefault: a.isDefault,
  }));

  const formattedPayments = payments.map((p) => ({
    id: p.id,
    brand: p.brand,
    last4: p.last4,
    expMonth: p.expMonth,
    expYear: p.expYear,
    isDefault: p.isDefault,
  }));

  const formattedOrders = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: String(o.status),
    subtotal: String(o.subtotal),
    taxTotal: String(o.taxTotal),
    shippingTotal: String(o.shippingTotal),
    discountTotal: String(o.discountTotal),
    grandTotal: String(o.grandTotal),
    fulfillmentMethod: o.fulfillmentMethod,
    placedAt: o.placedAt.toISOString(),
    createdAt: o.createdAt.toISOString(),
    shippingAddress: o.shippingAddress ? {
      fullName: o.shippingAddress.fullName,
      line1: o.shippingAddress.line1,
      line2: o.shippingAddress.line2,
      city: o.shippingAddress.city,
      state: o.shippingAddress.state,
      postalCode: o.shippingAddress.postalCode,
    } : null,
    billingAddress: o.billingAddress ? {
      fullName: o.billingAddress.fullName,
      line1: o.billingAddress.line1,
      line2: o.billingAddress.line2,
      city: o.billingAddress.city,
      state: o.billingAddress.state,
      postalCode: o.billingAddress.postalCode,
    } : null,
    items: o.items.map((item) => ({
      id: item.id,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice: String(item.unitPrice),
      personalization: item.personalization,
      variant: {
        sku: item.variant.sku,
        optionValues: item.variant.optionValues,
        product: {
          name: item.variant.product.name,
          images: item.variant.product.images.map((img) => ({ url: img.url })),
        },
      },
    })),
  }));

  const formattedOAuths = oauthAccounts.map((oa) => ({
    provider: oa.provider,
    createdAt: oa.createdAt.toISOString(),
  }));

  const emailVerified = dbUser?.emailVerifiedAt !== null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-start px-4 py-16 gap-8">
      {/* Header section with back navigation */}
      <div className="flex items-center justify-between w-full">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-indigo-300/80">
            Storefront Portal
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Customer Account
          </h1>
        </div>
        <div className="flex gap-3">
          <Link
            href="/"
            className="rounded-2xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-white transition hover:border-indigo-400/50 hover:bg-white/5 cursor-pointer"
          >
            Back to store
          </Link>
          <form action="/api/v1/auth/logout" method="post">
            <button
              type="submit"
              className="rounded-2xl bg-white px-4 py-2.5 text-xs font-bold text-neutral-950 transition hover:bg-neutral-200 cursor-pointer"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>

      {/* Main glassmorphic account dashboard tabs */}
      <section className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 md:p-10 shadow-2xl shadow-black/30 backdrop-blur">
        <TabsContainer
          user={{
            id: user.id,
            email: user.email,
            firstName: dbUser?.firstName || null,
            lastName: dbUser?.lastName || null,
            phone: dbUser?.phone || null,
            avatarUrl: dbUser?.avatarUrl || null,
            role: user.role,
          }}
          addresses={formattedAddresses}
          payments={formattedPayments}
          orders={formattedOrders}
          oauthAccounts={formattedOAuths}
          emailVerified={emailVerified}
        />
      </section>
    </main>
  );
}