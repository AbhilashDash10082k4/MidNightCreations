"use client";

import React, { useState } from "react";
import { useCart } from "../../../features/cart/context/cart-context";
import { ProfileTab } from "./profile-tab";
import { AddressesTab } from "./addresses-tab";
import { OrdersTab } from "./orders-tab";

type UserType = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: string;
};

type AddressType = {
  id: string;
  label: string | null;
  fullName: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
};

type PaymentMethodType = {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
};

type OrderType = {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: string;
  taxTotal: string;
  shippingTotal: string;
  discountTotal: string;
  grandTotal: string;
  fulfillmentMethod: string;
  placedAt: string;
  createdAt: string;
  shippingAddress: any;
  billingAddress: any;
  items: any[];
  returnRequests?: any[];
};

type OAuthAccountType = {
  provider: string;
  createdAt: string;
};

interface TabsContainerProps {
  user: UserType;
  addresses: AddressType[];
  payments: PaymentMethodType[];
  orders: OrderType[];
  oauthAccounts: OAuthAccountType[];
  emailVerified: boolean;
}

export function TabsContainer({
  user,
  addresses,
  payments,
  orders,
  oauthAccounts,
  emailVerified,
}: TabsContainerProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "addresses" | "orders">("profile");
  const { addItem, setIsOpen } = useCart();

  const handleReorder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/v1/account/orders/${orderId}/reorder`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Reorder failed");
      const data = await res.json();

      if (data.items && Array.isArray(data.items)) {
        // Add items sequentially to cart
        data.items.forEach((item: any) => {
          addItem({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            personalization: item.personalization,
            productName: item.productName,
            productImage: item.productImage,
            variantName: item.variantName,
          });
        });
        setIsOpen(true);
      }
    } catch (err) {
      console.error("Reorder failed", err);
      alert("Failed to reorder items. Please try again.");
    }
  };

  return (
    <div className="w-full text-white">
      {/* Sleek Tab switcher */}
      <div className="flex border-b border-white/10 pb-2 mb-8 gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-2 px-1 text-sm font-semibold tracking-wider transition relative cursor-pointer ${
            activeTab === "profile" ? "text-indigo-400 font-bold" : "text-neutral-400 hover:text-white"
          }`}
        >
          Profile Details
          {activeTab === "profile" && (
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-indigo-400 animate-slideIn" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("addresses")}
          className={`pb-2 px-1 text-sm font-semibold tracking-wider transition relative cursor-pointer ${
            activeTab === "addresses" ? "text-indigo-400 font-bold" : "text-neutral-400 hover:text-white"
          }`}
        >
          Saved Addresses & Cards
          {activeTab === "addresses" && (
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-indigo-400 animate-slideIn" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`pb-2 px-1 text-sm font-semibold tracking-wider transition relative cursor-pointer ${
            activeTab === "orders" ? "text-indigo-400 font-bold" : "text-neutral-400 hover:text-white"
          }`}
        >
          Order History
          {activeTab === "orders" && (
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-indigo-400 animate-slideIn" />
          )}
        </button>
      </div>

      {/* Render active content */}
      <div className="min-h-[400px]">
        {activeTab === "profile" && (
          <ProfileTab
            initialUser={user}
            initialOAuths={oauthAccounts}
            initialVerified={emailVerified}
          />
        )}
        {activeTab === "addresses" && (
          <AddressesTab
            initialAddresses={addresses}
            initialPayments={payments}
          />
        )}
        {activeTab === "orders" && (
          <OrdersTab
            initialOrders={orders}
            onReorder={handleReorder}
          />
        )}
      </div>
    </div>
  );
}
