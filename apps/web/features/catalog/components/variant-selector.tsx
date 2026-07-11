"use client";

import { useEffect, useState } from "react";

type Variant = {
  id: string;
  sku: string;
  price: { toString(): string };
  compareAt: { toString(): string } | null;
  inventoryQty: number;
  optionValues: any; // JSON object: { Size: "M", Color: "Black" }
  isActive: boolean;
};

type VariantSelectorProps = {
  variants: Variant[];
  onVariantSelect: (variant: Variant | null) => void;
};

export function VariantSelector({ variants, onVariantSelect }: VariantSelectorProps) {
  // Extract options from variants
  const optionsMap: Record<string, string[]> = {};
  variants.forEach((v) => {
    if (!v.isActive) return;
    const opts = v.optionValues as Record<string, string>;
    if (opts && typeof opts === "object") {
      Object.entries(opts).forEach(([key, val]) => {
        if (!optionsMap[key]) {
          optionsMap[key] = [];
        }
        if (!optionsMap[key].includes(val)) {
          optionsMap[key].push(val);
        }
      });
    }
  });

  const optionNames = Object.keys(optionsMap);

  // Default select first values or empty
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    optionNames.forEach((name) => {
      const vals = optionsMap[name];
      if (vals?.[0]) {
        defaults[name] = vals[0];
      }
    });
    return defaults;
  });

  // Find active matching variant
  useEffect(() => {
    const matched = variants.find((v) => {
      if (!v.isActive) return false;
      const opts = v.optionValues as Record<string, string>;
      return optionNames.every((name) => opts[name] === selections[name]);
    });
    onVariantSelect(matched || null);
  }, [selections, variants]);

  function handleSelect(name: string, value: string) {
    setSelections((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  if (optionNames.length === 0) return null;

  return (
    <div className="space-y-4">
      {optionNames.map((name) => {
        const values = optionsMap[name] || [];
        return (
          <div key={name}>
            <h4 className="text-sm font-semibold text-neutral-300 mb-2">{name}</h4>
            <div className="flex flex-wrap gap-2">
              {values.map((val) => {
                const isSelected = selections[name] === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleSelect(name, val)}
                    className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all hover:cursor-pointer ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-500/20 text-indigo-300 ring-2 ring-indigo-500/20"
                        : "border-white/10 bg-neutral-900/40 text-neutral-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
