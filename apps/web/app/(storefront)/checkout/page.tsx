"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "../../../features/cart/context/cart-context";

type ShippingAddress = {
  fullName: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
};

export default function CheckoutPage() {
  const { items, updateQuantity, removeItem, subtotal, clearCart } = useCart();
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<any>(null);
  
  // Shipping details
  const [fulfillmentMethod, setFulfillmentMethod] = useState<"ship" | "pickup">("ship");
  const [address, setAddress] = useState<ShippingAddress>({
    fullName: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
    phone: "",
  });

  // Promo details
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");

  // Gift card details
  const [giftCardCode, setGiftCardCode] = useState("");
  const [appliedGiftCard, setAppliedGiftCard] = useState<any>(null);
  const [giftCardError, setGiftCardError] = useState("");
  const [giftCardSuccess, setGiftCardSuccess] = useState("");

  // Order notes
  const [notes, setNotes] = useState("");

  // Checkout submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  // Fetch current user details on load
  useEffect(() => {
    async function checkUser() {
      try {
        const res = await fetch("/api/v1/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
            setEmail(data.user.email);
            setAddress((prev) => ({
              ...prev,
              fullName: `${data.user.firstName || ""} ${data.user.lastName || ""}`.trim(),
            }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch user", err);
      }
    }
    checkUser();
  }, []);

  // Handle promo code application
  async function applyPromo() {
    setPromoError("");
    setPromoSuccess("");
    if (!promoCode.trim()) {
      setPromoError("Enter promo code.");
      return;
    }

    try {
      const res = await fetch("/api/v1/discounts/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode, subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPromoError(data.error || "Promo code invalid.");
        setAppliedPromo(null);
      } else {
        setAppliedPromo(data.discount);
        setPromoSuccess(`Promo applied: ${data.discount.code}`);
      }
    } catch (err) {
      setPromoError("Failed to validate promo.");
    }
  }

  // Handle gift card application
  async function applyGiftCard() {
    setGiftCardError("");
    setGiftCardSuccess("");
    if (!giftCardCode.trim()) {
      setGiftCardError("Enter gift card code.");
      return;
    }

    try {
      const res = await fetch("/api/v1/gift-cards/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: giftCardCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGiftCardError(data.error || "Gift card invalid.");
        setAppliedGiftCard(null);
      } else {
        setAppliedGiftCard(data.giftCard);
        setGiftCardSuccess(`Gift card applied: ${data.giftCard.code}`);
      }
    } catch (err) {
      setGiftCardError("Failed to validate gift card.");
    }
  }

  // Calculate pricing values
  const shippingCost = fulfillmentMethod === "pickup" ? 0 : (subtotal >= 75 ? 0 : 5.00);
  
  let promoDiscount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === "percentage") {
      promoDiscount = Number((subtotal * (appliedPromo.value / 100)).toFixed(2));
    } else if (appliedPromo.type === "fixed") {
      promoDiscount = appliedPromo.value;
    }
    promoDiscount = Math.min(promoDiscount, subtotal);
  }

  const taxableAmount = Math.max(0, subtotal - promoDiscount);
  const taxCost = Number((taxableAmount * 0.0635).toFixed(2));
  const preGiftCardTotal = Number((taxableAmount + shippingCost + taxCost).toFixed(2));
  
  let giftCardDeduction = 0;
  if (appliedGiftCard) {
    giftCardDeduction = Number(Math.min(appliedGiftCard.balance, preGiftCardTotal).toFixed(2));
  }

  const grandTotal = Number(Math.max(0, preGiftCardTotal - giftCardDeduction).toFixed(2));

  // Handle Checkout submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    setIsSubmitting(true);

    if (!email) {
      setSubmitError("Email is required.");
      setIsSubmitting(false);
      return;
    }

    if (items.length === 0) {
      setSubmitError("Cart is empty.");
      setIsSubmitting(false);
      return;
    }

    // Form payload matching CheckoutInput
    const payload = {
      checkout: {
        email,
        shippingAddress: {
          fullName: address.fullName || "Guest Customer",
          line1: address.line1 || "No Address",
          line2: address.line2 || undefined,
          city: address.city || "Orange",
          state: address.state || "CT",
          postalCode: address.postalCode || "06477",
          country: address.country || "US",
          phone: address.phone || undefined,
        },
        billingAddress: undefined,
        fulfillmentMethod,
        discountCode: appliedPromo ? appliedPromo.code : undefined,
        giftCardCode: appliedGiftCard ? appliedGiftCard.code : undefined,
        notes: notes || undefined,
      },
      items,
    };

    try {
      const res = await fetch("/api/v1/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "Order placement failed.");
      } else {
        setPlacedOrder(data.order);
        clearCart();
      }
    } catch (err) {
      setSubmitError("Network error. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Render Order Confirmation screen on success
  if (placedOrder) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white/2 border border-white/5 rounded-3xl p-8 backdrop-blur-xl text-center space-y-6 animate-fade-in shadow-2xl">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight">Order Placed Successfully!</h1>
            <p className="text-neutral-400 text-sm">
              Thank you for your order. We have sent a confirmation email to <span className="text-white font-semibold">{email}</span>.
            </p>
          </div>

          <div className="bg-neutral-900/60 rounded-2xl p-6 border border-white/10 text-left space-y-4 max-w-md mx-auto">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Order Number</span>
              <span className="text-white font-bold">{placedOrder.orderNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Fulfillment Method</span>
              <span className="text-white capitalize">{placedOrder.fulfillmentMethod === "pickup" ? "Local Pickup (Orange, CT)" : "Shipping"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Grand Total</span>
              <span className="text-white font-semibold">${Number(placedOrder.grandTotal).toFixed(2)}</span>
            </div>
            {placedOrder.notes && (
              <div className="text-xs border-t border-white/5 pt-3">
                <span className="text-neutral-400 font-semibold block mb-1">Notes:</span>
                <p className="text-neutral-300 italic">{placedOrder.notes}</p>
              </div>
            )}
          </div>

          <div className="pt-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-indigo-500 hover:bg-indigo-400 px-6 py-3 text-sm font-semibold text-white transition shadow-lg shadow-indigo-500/25 hover:cursor-pointer"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto h-16 px-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tighter text-white">
            MIDNIGHT<span className="text-indigo-400">CREATIONS</span>
          </Link>
          <Link href="/" className="text-xs font-semibold text-neutral-400 hover:text-white transition">
            &larr; Back to Catalog
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-extrabold tracking-tight mb-8">Checkout</h1>

        {items.length === 0 ? (
          <div className="text-center py-16 bg-white/2 border border-white/5 rounded-3xl backdrop-blur-xl">
            <h2 className="text-xl font-bold mb-3">Your cart is empty</h2>
            <p className="text-neutral-400 text-sm mb-6">Add items from the catalog before proceeding to checkout.</p>
            <Link href="/" className="inline-flex items-center justify-center rounded-xl bg-indigo-500 hover:bg-indigo-400 px-5 py-2.5 text-xs font-semibold text-white transition">
              Browse Catalog
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Form Details */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Customer Info */}
              <div className="bg-white/2 border border-white/5 rounded-2xl p-6 backdrop-blur-md space-y-4">
                <h3 className="text-lg font-bold text-white">1. Contact Information</h3>
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-neutral-400 mb-2">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-hidden focus:border-indigo-500 transition"
                  />
                  {user && (
                    <p className="text-[10px] text-indigo-400 mt-1.5">Logged in as {user.firstName || user.email}</p>
                  )}
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-white/2 border border-white/5 rounded-2xl p-6 backdrop-blur-md space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white">2. Delivery Method</h3>
                </div>
                
                {/* Method selector */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFulfillmentMethod("ship")}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition hover:cursor-pointer ${
                      fulfillmentMethod === "ship"
                        ? "border-indigo-500 bg-indigo-500/5 text-white"
                        : "border-white/10 bg-neutral-900/40 text-neutral-400 hover:border-white/20"
                    }`}
                  >
                    <svg className="w-5 h-5 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    <span className="text-xs font-bold">Standard Shipping</span>
                    <span className="text-[10px] text-neutral-500 mt-0.5">$5.00 or Free over $75</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setFulfillmentMethod("pickup")}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition hover:cursor-pointer ${
                      fulfillmentMethod === "pickup"
                        ? "border-indigo-500 bg-indigo-500/5 text-white"
                        : "border-white/10 bg-neutral-900/40 text-neutral-400 hover:border-white/20"
                    }`}
                  >
                    <svg className="w-5 h-5 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-xs font-bold">Local Pickup</span>
                    <span className="text-[10px] text-neutral-500 mt-0.5">Orange, CT (Free)</span>
                  </button>
                </div>

                {fulfillmentMethod === "pickup" && (
                  <div className="p-4 rounded-xl bg-neutral-900/80 border border-white/5 text-xs text-neutral-400 space-y-1">
                    <p className="font-bold text-white">Pickup Location:</p>
                    <p>Midnight Creations USA</p>
                    <p>421 Derby Ave, Orange, CT 06477</p>
                  </div>
                )}

                {/* Address Form fields */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Shipping Address</h4>
                  
                  <div>
                    <label htmlFor="fullName" className="block text-xs font-semibold text-neutral-400 mb-2">Full Name</label>
                    <input
                      type="text"
                      id="fullName"
                      required
                      value={address.fullName}
                      onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                      placeholder="John Doe"
                      className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-hidden focus:border-indigo-500 transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="line1" className="block text-xs font-semibold text-neutral-400 mb-2">Address Line 1</label>
                      <input
                        type="text"
                        id="line1"
                        required
                        value={address.line1}
                        onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                        placeholder="123 Main St"
                        className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-hidden focus:border-indigo-500 transition"
                      />
                    </div>
                    <div>
                      <label htmlFor="line2" className="block text-xs font-semibold text-neutral-400 mb-2">Address Line 2 (Optional)</label>
                      <input
                        type="text"
                        id="line2"
                        value={address.line2}
                        onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                        placeholder="Apt 4B"
                        className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-hidden focus:border-indigo-500 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="col-span-2">
                      <label htmlFor="city" className="block text-xs font-semibold text-neutral-400 mb-2">City</label>
                      <input
                        type="text"
                        id="city"
                        required
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        placeholder="Orange"
                        className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-hidden focus:border-indigo-500 transition"
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-xs font-semibold text-neutral-400 mb-2">State</label>
                      <input
                        type="text"
                        id="state"
                        required
                        value={address.state}
                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                        placeholder="CT"
                        className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-hidden focus:border-indigo-500 transition"
                      />
                    </div>
                    <div>
                      <label htmlFor="postalCode" className="block text-xs font-semibold text-neutral-400 mb-2">ZIP Code</label>
                      <input
                        type="text"
                        id="postalCode"
                        required
                        value={address.postalCode}
                        onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                        placeholder="06477"
                        className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-hidden focus:border-indigo-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-xs font-semibold text-neutral-400 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      placeholder="(203) 555-0199"
                      className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-hidden focus:border-indigo-500 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Order Notes */}
              <div className="bg-white/2 border border-white/5 rounded-2xl p-6 backdrop-blur-md space-y-4">
                <h3 className="text-lg font-bold text-white">3. Special Instructions</h3>
                <div>
                  <label htmlFor="notes" className="block text-xs font-semibold text-neutral-400 mb-2">Order Notes / Custom Requests</label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="E.g., Please rush embroidery order, call before printing details, etc."
                    rows={3}
                    className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-hidden focus:border-indigo-500 transition resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Review */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Order Items Cart Review */}
              <div className="bg-white/2 border border-white/5 rounded-2xl p-6 backdrop-blur-md space-y-6">
                <h3 className="text-lg font-bold text-white border-b border-white/5 pb-3">4. Review Cart Items</h3>
                
                <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1 no-scrollbar">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-3 rounded-xl border border-white/5 bg-neutral-950/40">
                      {/* Product Image */}
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-neutral-900">
                        <img src={item.productImage} alt={item.productName} className="h-full w-full object-cover" />
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-xs font-bold text-white truncate">{item.productName}</h4>
                            <span className="text-xs font-semibold text-neutral-200">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                          </div>
                          {item.variantName && (
                            <p className="text-[10px] text-neutral-400 mt-0.5">Variant: {item.variantName}</p>
                          )}
                          {Object.keys(item.personalization || {}).length > 0 && (
                            <div className="mt-1 space-y-0.5 border-l border-white/10 pl-2">
                              {Object.entries(item.personalization).map(([k, v]) => (
                                <p key={k} className="text-[9px] text-neutral-500">
                                  <span className="font-semibold text-neutral-400 capitalize">{k}:</span> {String(v)}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          {/* Quantity Selector */}
                          <div className="flex items-center rounded-md border border-white/10 bg-neutral-900 overflow-hidden h-6">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-6 text-xs text-neutral-400 hover:text-white transition hover:cursor-pointer"
                            >
                              -
                            </button>
                            <span className="w-6 text-center text-[10px] font-semibold text-white">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-6 text-xs text-neutral-400 hover:text-white transition hover:cursor-pointer"
                            >
                              +
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-[10px] text-neutral-500 hover:text-red-400 transition hover:cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Promo Code Input */}
                <div className="pt-4 border-t border-white/5 space-y-2">
                  <label htmlFor="promo" className="block text-xs font-semibold text-neutral-400">Promo Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="promo"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="WELCOME10"
                      className="flex-1 bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-hidden focus:border-indigo-500 transition"
                    />
                    <button
                      type="button"
                      onClick={applyPromo}
                      className="bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl px-4 py-2 text-xs font-semibold transition hover:cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && <p className="text-[10px] text-red-400 mt-1">{promoError}</p>}
                  {promoSuccess && <p className="text-[10px] text-emerald-400 mt-1">{promoSuccess}</p>}
                </div>

                {/* Gift Card Input */}
                <div className="pt-2 space-y-2">
                  <label htmlFor="giftCard" className="block text-xs font-semibold text-neutral-400">Gift Card</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="giftCard"
                      value={giftCardCode}
                      onChange={(e) => setGiftCardCode(e.target.value)}
                      placeholder="GIFTY50"
                      className="flex-1 bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-hidden focus:border-indigo-500 transition"
                    />
                    <button
                      type="button"
                      onClick={applyGiftCard}
                      className="bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl px-4 py-2 text-xs font-semibold transition hover:cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {giftCardError && <p className="text-[10px] text-red-400 mt-1">{giftCardError}</p>}
                  {giftCardSuccess && <p className="text-[10px] text-emerald-400 mt-1">{giftCardSuccess}</p>}
                </div>

                {/* Pricing Summary Breakdown */}
                <div className="pt-4 border-t border-white/5 space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Subtotal</span>
                    <span className="text-neutral-200">${subtotal.toFixed(2)}</span>
                  </div>
                  
                  {fulfillmentMethod === "ship" && (
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Estimated Shipping</span>
                      <span className="text-neutral-200">
                        {shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}
                      </span>
                    </div>
                  )}
                  {fulfillmentMethod === "pickup" && (
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Pickup Shipping</span>
                      <span className="text-neutral-200">Free</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-neutral-400">Estimated Tax</span>
                    <span className="text-neutral-200">${taxCost.toFixed(2)}</span>
                  </div>

                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Promo Discount ({appliedPromo?.code})</span>
                      <span>-${promoDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  {giftCardDeduction > 0 && (
                    <div className="flex justify-between text-emerald-400 border-b border-white/5 pb-3">
                      <span>Gift Card ({appliedGiftCard?.code})</span>
                      <span>-${giftCardDeduction.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-base font-bold pt-2">
                    <span className="text-white">Grand Total</span>
                    <span className="text-indigo-400">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Place Order Trigger */}
                <div className="space-y-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-indigo-500 hover:bg-indigo-400 disabled:bg-neutral-800 disabled:text-neutral-500 text-white rounded-xl py-3.5 text-sm font-bold tracking-wide transition shadow-lg shadow-indigo-500/25 disabled:shadow-none hover:cursor-pointer"
                  >
                    {isSubmitting ? "Processing Order..." : "Place Order"}
                  </button>
                  {submitError && (
                    <p className="text-xs text-red-400 text-center font-medium bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                      {submitError}
                    </p>
                  )}
                </div>

              </div>

            </div>

          </form>
        )}
      </div>
    </div>
  );
}
