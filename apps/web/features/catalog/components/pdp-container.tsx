"use client";

import { useState } from "react";
import { ProductGallery } from "./product-gallery";
import { VariantSelector } from "./variant-selector";
import { PersonalizationForm } from "./personalization-form";
import { calculateItemPrice } from "@repo/domain";
import { useCart } from "../../cart/context/cart-context";

type ProductType = {
  id: string;
  name: string;
  description: string | null;
  basePrice: { toString(): string };
  isCustomizable: boolean;
  images: any[];
  variants: any[];
  categories: any[];
  personalizations: any[];
};

type PdpContainerProps = {
  product: ProductType;
};

const DEFAULT_DESCRIPTION =
  "Premium crafted product. Custom printed or engraved locally in Orange, CT. Built for comfort and durability.";

export function PdpContainer({ product }: PdpContainerProps) {
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [personalization, setPersonalization] = useState<{
    values: Record<string, string>;
    extraPrice: number;
    isValid: boolean;
  }>({
    values: {},
    extraPrice: 0,
    isValid: true,
  });

  const [quantity, setQuantity] = useState(1);

  // Compute active price
  const basePrice = selectedVariant
    ? Number(selectedVariant.price.toString())
    : Number(product.basePrice.toString());

  const unitPrice = calculateItemPrice(basePrice, [
    { extraPrice: personalization.extraPrice },
  ]);

  const compareAtPrice = selectedVariant?.compareAt
    ? Number(selectedVariant.compareAt.toString())
    : null;

  const { addItem } = useCart();
  const description = product.description || DEFAULT_DESCRIPTION;

  function handleAddToCart() {
    if (product.isCustomizable && !personalization.isValid) {
      alert("Please fill out all required personalization options.");
      return;
    }

    const variantId = selectedVariant?.id || product.variants[0]?.id;
    if (!variantId) {
      alert("Please select a variant.");
      return;
    }

    const variantName = selectedVariant?.optionValues
      ? Object.values(selectedVariant.optionValues as Record<string, string>).join(" / ")
      : undefined;

    addItem({
      productId: product.id,
      variantId,
      quantity,
      unitPrice,
      personalization: personalization.values,
      productName: product.name,
      productImage: selectedVariant?.imageUrl || product.images?.[0]?.url || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600&auto=format&fit=crop",
      variantName,
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Left Gallery Column */}
      <ProductGallery images={product.images} />

      {/* Right Product Info Column */}
      <div className="space-y-6">
        <div>
          <div className="flex gap-2 text-xs text-neutral-500 mb-2">
            {product.categories.map((c, i) => (
              <span key={c.category.id}>
                {i > 0 && <span className="mx-1">/</span>}
                <span className="hover:text-neutral-400 hover:cursor-pointer">{c.category.name}</span>
              </span>
            ))}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {product.name}
          </h1>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-2xl font-bold text-white">${unitPrice.toFixed(2)}</span>
            {compareAtPrice && compareAtPrice > unitPrice && (
              <span className="text-lg text-neutral-500 line-through">
                ${compareAtPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-neutral-300">Description</h3>
          <p className="mt-2 text-sm text-neutral-400 leading-relaxed">{description}</p>
        </div>

        {/* Variant Selectors */}
        {product.variants.length > 0 && (
          <VariantSelector
            variants={product.variants}
            onVariantSelect={setSelectedVariant}
          />
        )}

        {/* Personalization Options */}
        {product.isCustomizable && product.personalizations.length > 0 && (
          <PersonalizationForm
            fields={product.personalizations}
            onChange={setPersonalization}
          />
        )}

        {/* Purchase Area */}
        <div className="border-t border-white/10 pt-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-32 shrink-0">
              <label className="block text-xs font-semibold text-neutral-400 mb-2">
                Quantity
              </label>
              <div className="flex rounded-xl border border-white/10 bg-neutral-900/60 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 py-2.5 text-neutral-400 hover:text-white transition hover:cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-transparent text-center text-sm font-medium text-white outline-none ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 py-2.5 text-neutral-400 hover:text-white transition hover:cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex-1 mt-6">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={
                  selectedVariant && selectedVariant.inventoryQty <= 0
                }
                className="w-full rounded-2xl bg-indigo-500 hover:bg-indigo-400 disabled:bg-neutral-800 disabled:text-neutral-500 py-3 font-semibold text-white transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98] hover:cursor-pointer disabled:cursor-not-allowed"
              >
                {selectedVariant && selectedVariant.inventoryQty <= 0
                  ? "Out of Stock"
                  : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
