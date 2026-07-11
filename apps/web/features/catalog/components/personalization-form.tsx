"use client";

import { useEffect, useState } from "react";

type PersonalizationField = {
  id: string;
  label: string;
  fieldType: string; // "text" | "number" | "file"
  maxLength: number | null;
  extraPrice: { toString(): string };
  isRequired: boolean;
};

type PersonalizationFormProps = {
  fields: PersonalizationField[];
  onChange: (data: {
    values: Record<string, string>;
    extraPrice: number;
    isValid: boolean;
  }) => void;
};

export function PersonalizationForm({ fields, onChange }: PersonalizationFormProps) {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    // Compute total extra price and validity
    let extraPriceTotal = 0;
    let isValid = true;

    fields.forEach((field) => {
      const val = values[field.id] || "";
      const isFilled = val.trim() !== "";

      if (field.isRequired && !isFilled) {
        isValid = false;
      }

      if (isFilled) {
        extraPriceTotal += Number(field.extraPrice.toString());
      }
    });

    onChange({
      values,
      extraPrice: extraPriceTotal,
      isValid,
    });
  }, [values, fields]);

  function handleChange(fieldId: string, value: string) {
    setValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  }

  if (fields.length === 0) return null;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm space-y-4">
      <div className="border-b border-white/10 pb-3 mb-2">
        <h4 className="text-base font-bold text-white">Personalization options</h4>
        <p className="text-xs text-neutral-400 mt-1">
          Customize this item with your own details.
        </p>
      </div>

      {fields.map((field) => {
        const value = values[field.id] || "";
        const extraCost = Number(field.extraPrice.toString());

        return (
          <div key={field.id} className="space-y-1.5">
            <label className="block text-sm font-medium text-neutral-300">
              {field.label}
              {field.isRequired && <span className="text-indigo-400 ml-1">*</span>}
              {extraCost > 0 && (
                <span className="text-xs font-semibold text-indigo-300 bg-indigo-500/10 rounded-full px-2.5 py-0.5 ml-2">
                  +${extraCost.toFixed(2)}
                </span>
              )}
            </label>

            {field.fieldType === "file" ? (
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    // Save a fake/mock URL for local display as requested by user
                    const file = e.target.files?.[0];
                    if (file) {
                      handleChange(field.id, URL.createObjectURL(file));
                    } else {
                      handleChange(field.id, "");
                    }
                  }}
                  className="w-full text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 file:cursor-pointer"
                />
                {value && (
                  <div className="mt-2 aspect-video w-32 overflow-hidden rounded-xl border border-white/10 bg-neutral-950 p-1 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={value} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            ) : (
              <input
                type={field.fieldType === "number" ? "number" : "text"}
                maxLength={field.maxLength || undefined}
                placeholder={`Enter custom ${field.label.toLowerCase()}...`}
                value={value}
                onChange={(e) => handleChange(field.id, e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-neutral-900/60 px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none focus:border-indigo-500/50"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
