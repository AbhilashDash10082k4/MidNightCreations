"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type CatalogFilterProps = {
  categories: Category[];
  currentCategory?: string;
  currentSort?: string;
  currentMinPrice?: string;
  currentMaxPrice?: string;
  currentQ?: string;
};

export function CatalogFilter({
  categories,
  currentCategory = "",
  currentSort = "relevance",
  currentMinPrice = "",
  currentMaxPrice = "",
  currentQ = "",
}: CatalogFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useState(currentQ);
  const [minPrice, setMinPrice] = useState(currentMinPrice);
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice);

  function applyFilters(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    // Reset page on filter change
    params.delete("page");

    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  }

  return (
    <aside className="w-full lg:w-64 shrink-0 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-xl shadow-black/20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 lg:space-y-6 lg:gap-0">
        {/* Search */}
        <div className="col-span-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
            Search
          </h3>
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  applyFilters({ q });
                }
              }}
              className="w-full rounded-2xl border border-white/10 bg-neutral-900/60 px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-indigo-500/50"
            />
            {q && (
              <button
                onClick={() => {
                  setQ("");
                  applyFilters({ q: "" });
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
            Categories
          </h3>
          <div className="flex flex-row flex-wrap gap-2 lg:flex-col lg:space-y-1 lg:gap-0">
            <button
              onClick={() => applyFilters({ category: "" })}
              className={`w-auto lg:w-full text-center lg:text-left px-3.5 py-2 rounded-xl text-xs sm:text-sm transition-colors hover:cursor-pointer ${
                currentCategory === ""
                  ? "bg-indigo-500/20 text-indigo-300 font-semibold"
                  : "text-neutral-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => applyFilters({ category: cat.slug })}
                className={`w-auto lg:w-full text-center lg:text-left px-3.5 py-2 rounded-xl text-xs sm:text-sm transition-colors hover:cursor-pointer ${
                  currentCategory === cat.slug
                    ? "bg-indigo-500/20 text-indigo-300 font-semibold"
                    : "text-neutral-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="col-span-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
            Price Range
          </h3>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-neutral-900/60 px-3 py-2 text-sm text-white placeholder-neutral-600 outline-none focus:border-indigo-500/50"
            />
            <span className="text-neutral-600 text-sm">-</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-neutral-900/60 px-3 py-2 text-sm text-white placeholder-neutral-600 outline-none focus:border-indigo-500/50"
            />
          </div>
          <button
            onClick={() => applyFilters({ minPrice, maxPrice })}
            className="w-full mt-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 py-2 text-xs font-semibold text-indigo-300 hover:text-indigo-200 transition hover:cursor-pointer"
          >
            Apply Price
          </button>
        </div>

        {/* Sorting */}
        <div className="col-span-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
            Sort By
          </h3>
          <select
            value={currentSort}
            onChange={(e) => applyFilters({ sort: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-neutral-900/60 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/50 hover:cursor-pointer"
          >
            <option value="relevance">Relevance</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest Arrival</option>
          </select>
        </div>
      </div>

      {isPending && (
        <div className="mt-4 text-center text-xs text-indigo-400/70 animate-pulse">
          Updating catalog...
        </div>
      )}
    </aside>
  );
}
