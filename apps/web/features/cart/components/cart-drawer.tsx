"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { useCart } from "../context/cart-context";

export function CartDrawer() {
  const { items, updateQuantity, removeItem, isOpen, setIsOpen, subtotal, totalCount } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key press
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent background scroll
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, setIsOpen]);

  // Close on outside click
  function handleBackdropClick(e: React.MouseEvent) {
    if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity duration-300"
    >
      {/* Drawer Container */}
      <div
        ref={drawerRef}
        className="w-full max-w-md bg-neutral-950 border-l border-white/10 h-full flex flex-col shadow-2xl animate-slide-in-right"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Shopping Cart
            {totalCount > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">
                {totalCount} {totalCount === 1 ? "item" : "items"}
              </span>
            )}
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-2 text-neutral-400 hover:text-white hover:bg-white/5 transition hover:cursor-pointer"
            aria-label="Close cart"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center mb-4 text-neutral-500 border border-white/5">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Your cart is empty</h3>
              <p className="text-neutral-500 text-sm max-w-xs mb-6">
                Add products to your cart to see them listed here.
              </p>
              <button
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center justify-center rounded-xl bg-indigo-500 hover:bg-indigo-400 px-5 py-2.5 text-xs font-semibold text-white transition hover:cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 rounded-2xl border border-white/5 bg-white/2 backdrop-blur-md"
                >
                  {/* Image */}
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-neutral-900">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-sm font-bold text-white truncate">
                          {item.productName}
                        </h4>
                        <span className="text-sm font-semibold text-neutral-200">
                          ${(item.unitPrice * item.quantity).toFixed(2)}
                        </span>
                      </div>
                      {item.variantName && (
                        <p className="text-xs text-neutral-400 mt-0.5">
                          Variant: {item.variantName}
                        </p>
                      )}
                      {Object.keys(item.personalization || {}).length > 0 && (
                        <div className="mt-1 space-y-0.5 border-l border-white/10 pl-2">
                          {Object.entries(item.personalization).map(([key, val]) => (
                            <p key={key} className="text-[10px] text-neutral-500">
                              <span className="font-semibold text-neutral-400 capitalize">{key}:</span> {val}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Selector */}
                      <div className="flex items-center rounded-lg border border-white/10 bg-neutral-900/60 overflow-hidden h-7">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 text-xs text-neutral-400 hover:text-white transition hover:cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-semibold text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 text-xs text-neutral-400 hover:text-white transition hover:cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-xs text-neutral-500 hover:text-red-400 transition hover:cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-white/10 bg-neutral-950 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Subtotal</span>
              <span className="text-lg font-bold text-white">${subtotal.toFixed(2)}</span>
            </div>
            <p className="text-[10px] text-neutral-500">
              Shipping, taxes, and discounts calculated at checkout.
            </p>
            <div className="flex gap-3">
              <Link
                href="/checkout"
                onClick={() => setIsOpen(false)}
                className="flex-1 rounded-xl bg-indigo-500 hover:bg-indigo-400 py-3 text-sm font-semibold text-white transition shadow-lg shadow-indigo-500/25 hover:cursor-pointer text-center"
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
