"use client";

import React, { useState } from "react";

type Address = {
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

type PaymentMethod = {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
};

interface AddressesTabProps {
  initialAddresses: Address[];
  initialPayments: PaymentMethod[];
}

export function AddressesTab({ initialAddresses, initialPayments }: AddressesTabProps) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [payments, setPayments] = useState<PaymentMethod[]>(initialPayments);

  // Address form states
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [fullName, setFullName] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  // Payment form states
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [cardBrand, setCardBrand] = useState("Visa");
  const [last4, setLast4] = useState("");
  const [expMonth, setExpMonth] = useState("12");
  const [expYear, setExpYear] = useState("2028");
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const startAddAddress = () => {
    setEditingAddressId(null);
    setLabel("Shipping");
    setFullName("");
    setLine1("");
    setLine2("");
    setCity("");
    setState("");
    setPostalCode("");
    setPhone("");
    setIsDefault(false);
    setShowAddressForm(true);
    setAddressError(null);
  };

  const startEditAddress = (addr: Address) => {
    setEditingAddressId(addr.id);
    setLabel(addr.label || "Shipping");
    setFullName(addr.fullName);
    setLine1(addr.line1);
    setLine2(addr.line2 || "");
    setCity(addr.city);
    setState(addr.state);
    setPostalCode(addr.postalCode);
    setPhone(addr.phone || "");
    setIsDefault(addr.isDefault);
    setShowAddressForm(true);
    setAddressError(null);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError(null);
    const payload = { label, fullName, line1, line2: line2 || undefined, city, state, postalCode, country: "US", phone: phone || undefined, isDefault };

    try {
      const url = editingAddressId ? `/api/v1/account/addresses/${editingAddressId}` : "/api/v1/account/addresses";
      const method = editingAddressId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save address");

      if (editingAddressId) {
        setAddresses((prev) =>
          prev.map((a) => {
            if (a.id === editingAddressId) return data.address;
            if (isDefault) return { ...a, isDefault: false };
            return a;
          }),
        );
      } else {
        setAddresses((prev) => [
          data.address,
          ...(isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : prev),
        ]);
      }
      setShowAddressForm(false);
    } catch (err: any) {
      setAddressError(err.message);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      const res = await fetch(`/api/v1/account/addresses/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetDefaultAddress = async (addr: Address) => {
    try {
      const res = await fetch(`/api/v1/account/addresses/${addr.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...addr, isDefault: true }),
      });
      if (res.ok) {
        setAddresses((prev) =>
          prev.map((a) => ({ ...a, isDefault: a.id === addr.id })),
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);
    const mockToken = `pm_mock_${Math.random().toString(36).substr(2, 9)}`;
    const payload = {
      stripePaymentMethodId: mockToken,
      brand: cardBrand,
      last4,
      expMonth: Number(expMonth),
      expYear: Number(expYear),
      isDefault: payments.length === 0,
    };

    try {
      const res = await fetch("/api/v1/account/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save card");

      setPayments((prev) => [data.paymentMethod, ...prev]);
      setShowPaymentForm(false);
      setLast4("");
    } catch (err: any) {
      setPaymentError(err.message);
    }
  };

  const handleDeletePayment = async (id: string) => {
    if (!confirm("Are you sure you want to remove this card?")) return;
    try {
      const res = await fetch(`/api/v1/account/payment-methods/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPayments((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetDefaultPayment = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/account/payment-methods/${id}`, { method: "PUT" });
      if (res.ok) {
        setPayments((prev) =>
          prev.map((p) => ({ ...p, isDefault: p.id === id })),
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2 animate-fadeIn text-white">
      {/* Addresses Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Addresses</h2>
          {!showAddressForm && (
            <button
              onClick={startAddAddress}
              className="rounded-xl bg-white px-4 py-2 text-xs font-semibold text-neutral-950 transition hover:bg-neutral-200 cursor-pointer"
            >
              Add New Address
            </button>
          )}
        </div>

        {showAddressForm ? (
          <form onSubmit={handleSaveAddress} className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
            <h3 className="font-semibold text-indigo-300">
              {editingAddressId ? "Edit Address" : "New Address"}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Address Label (e.g. Home, Work)"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-neutral-950 px-3 py-2 text-sm focus:outline-none"
              />
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-neutral-950 px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <input
              type="text"
              placeholder="Address Line 1"
              value={line1}
              onChange={(e) => setLine1(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-neutral-950 px-3 py-2 text-sm focus:outline-none"
            />
            <input
              type="text"
              placeholder="Address Line 2 (Optional)"
              value={line2}
              onChange={(e) => setLine2(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-neutral-950 px-3 py-2 text-sm focus:outline-none"
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <input
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-neutral-950 px-3 py-2 text-sm focus:outline-none"
              />
              <input
                type="text"
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-neutral-950 px-3 py-2 text-sm focus:outline-none"
              />
              <input
                type="text"
                placeholder="Postal Code"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-neutral-950 px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <input
              type="tel"
              placeholder="Phone (Optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-neutral-950 px-3 py-2 text-sm focus:outline-none"
            />
            <label className="flex items-center gap-2 text-sm text-neutral-300">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="rounded border-white/10 bg-neutral-950 text-indigo-600 focus:ring-0"
              />
              Set as default address
            </label>

            {addressError && <p className="text-xs text-red-400">{addressError}</p>}

            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold transition hover:bg-indigo-500 cursor-pointer"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowAddressForm(false)}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs transition hover:bg-white/5 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        <div className="space-y-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="group relative rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:border-indigo-400/50"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-400 border border-indigo-500/20">
                    {addr.label || "Address"}
                  </span>
                  {addr.isDefault && (
                    <span className="ml-2 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
                      Default
                    </span>
                  )}
                  <p className="mt-2 text-sm font-semibold text-white">{addr.fullName}</p>
                  <p className="text-xs text-neutral-400">{addr.line1}</p>
                  {addr.line2 && <p className="text-xs text-neutral-400">{addr.line2}</p>}
                  <p className="text-xs text-neutral-400">
                    {addr.city}, {addr.state} {addr.postalCode}
                  </p>
                  {addr.phone && <p className="mt-1 text-xs text-neutral-500">{addr.phone}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => startEditAddress(addr)}
                    className="text-left text-xs text-neutral-400 hover:text-white cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="text-left text-xs text-red-400 hover:text-red-300 cursor-pointer"
                  >
                    Delete
                  </button>
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefaultAddress(addr)}
                      className="text-left text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer"
                    >
                      Make Default
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Payment Methods Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Payment Methods</h2>
          {!showPaymentForm && (
            <button
              onClick={() => setShowPaymentForm(true)}
              className="rounded-xl bg-white px-4 py-2 text-xs font-semibold text-neutral-950 transition hover:bg-neutral-200 cursor-pointer"
            >
              Link a Card
            </button>
          )}
        </div>

        {showPaymentForm ? (
          <form onSubmit={handleSavePayment} className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
            <h3 className="font-semibold text-indigo-300">Link Payment Card (Simulated Vault)</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                value={cardBrand}
                onChange={(e) => setCardBrand(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-neutral-950 px-3 py-2 text-sm focus:outline-none"
              >
                <option value="Visa">Visa</option>
                <option value="Mastercard">Mastercard</option>
                <option value="Amex">American Express</option>
                <option value="Discover">Discover</option>
              </select>
              <input
                type="text"
                maxLength={4}
                placeholder="Last 4 Digits"
                value={last4}
                onChange={(e) => setLast4(e.target.value.replace(/\D/g, ""))}
                required
                className="w-full rounded-xl border border-white/10 bg-neutral-950 px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="number"
                min={1}
                max={12}
                placeholder="Exp Month (MM)"
                value={expMonth}
                onChange={(e) => setExpMonth(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-neutral-950 px-3 py-2 text-sm focus:outline-none"
              />
              <input
                type="number"
                min={new Date().getFullYear()}
                placeholder="Exp Year (YYYY)"
                value={expYear}
                onChange={(e) => setExpYear(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-neutral-950 px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            {paymentError && <p className="text-xs text-red-400">{paymentError}</p>}

            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold transition hover:bg-indigo-500 cursor-pointer"
              >
                Vault Card
              </button>
              <button
                type="button"
                onClick={() => setShowPaymentForm(false)}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs transition hover:bg-white/5 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-1">
          {payments.map((p) => (
            <div
              key={p.id}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-neutral-900 via-neutral-900 to-indigo-950 p-5 shadow-lg shadow-black/20"
            >
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-semibold tracking-wider text-neutral-300">
                    {p.brand.toUpperCase()} RELATION
                  </p>
                  <p className="mt-4 text-xl font-bold tracking-widest text-white">
                    ••••  ••••  ••••  {p.last4}
                  </p>
                  <div className="mt-4 flex items-center gap-6">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-neutral-500">Expires</p>
                      <p className="text-xs text-white">
                        {String(p.expMonth).padStart(2, "0")}/{String(p.expYear).slice(-2)}
                      </p>
                    </div>
                    {p.isDefault && (
                      <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[9px] font-bold text-indigo-400 border border-indigo-500/35">
                        Default Method
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <span className="text-xs text-neutral-500">Tokenized</span>
                  <div className="flex gap-2">
                    {!p.isDefault && (
                      <button
                        onClick={() => handleSetDefaultPayment(p.id)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleDeletePayment(p.id)}
                      className="text-xs text-red-400 hover:text-red-300 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
