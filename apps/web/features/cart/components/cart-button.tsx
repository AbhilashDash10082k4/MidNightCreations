"use client";

import React from "react";
import { useCart } from "../context/cart-context";

export function CartButton() {
  const { totalCount, setIsOpen } = useCart();

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium hover:text-indigo-400 transition-colors mr-2 hover:cursor-pointer"
    >
      Cart ({totalCount})
    </button>
  );
}
