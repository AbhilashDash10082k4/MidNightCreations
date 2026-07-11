import Link from "next/link";

import { ProductRepository } from "@repo/db";
import { CatalogFilter } from "../features/catalog/components/catalog-filter";
import { ProductCard } from "../features/catalog/components/product-card";
import { getCurrentUser } from "../lib/auth";
import { Header } from "../features/catalog/components/header";

export const dynamic = "force-dynamic";

type HomePageProps = {
  searchParams?:
    | Promise<{
        q?: string;
        category?: string;
        sort?: string;
        minPrice?: string;
        maxPrice?: string;
        page?: string;
      }>
    | {
        q?: string;
        category?: string;
        sort?: string;
        minPrice?: string;
        maxPrice?: string;
        page?: string;
      };
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);

  const q = resolvedSearchParams?.q || "";
  const category = resolvedSearchParams?.category || "";
  const sort = resolvedSearchParams?.sort || "relevance";
  const minPrice = resolvedSearchParams?.minPrice
    ? Number(resolvedSearchParams.minPrice)
    : undefined;
  const maxPrice = resolvedSearchParams?.maxPrice
    ? Number(resolvedSearchParams.maxPrice)
    : undefined;
  const page = resolvedSearchParams?.page
    ? Number(resolvedSearchParams.page)
    : 1;

  const [productsData, categories, user] = await Promise.all([
    ProductRepository.getProducts({
      q,
      category,
      sort: sort as any,
      minPrice,
      maxPrice,
      page,
      limit: 12,
    }),
    ProductRepository.getCategories(),
    getCurrentUser(),
  ]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 selection:bg-indigo-500/30">
      {/* Header */}
      <Header user={user} />

      {/* Hero section */}
      <section className="relative overflow-hidden py-12 text-center shrink-0">
        <div className="absolute inset-0 bg-radial-to-b from-indigo-500/10 via-transparent to-transparent opacity-50" />
        <div className="relative mx-auto max-w-3xl px-4">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-3 bg-linear-to-r from-white via-neutral-100 to-neutral-500 bg-clip-text text-transparent">
            Crafted for Community.
          </h1>
          <p className="text-sm text-neutral-400 max-w-2xl mx-auto">
            Premium custom apparel, engraving, and promotional items made
            locally in Orange, CT. High quality and personalized options.
          </p>
        </div>
      </section>

      {/* Content area: filter + catalog side by side */}
      <div className="container mx-auto px-4 pb-12 flex flex-col lg:flex-row gap-6">
        {/* Filter sidebar — sticky below header */}
        <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-20 self-start no-scrollbar mb-6 lg:mb-0">
          <CatalogFilter
            categories={categories}
            currentCategory={category}
            currentSort={sort}
            currentMinPrice={resolvedSearchParams?.minPrice || ""}
            currentMaxPrice={resolvedSearchParams?.maxPrice || ""}
            currentQ={q}
          />
        </aside>

        {/* Product catalog */}
        <main className="flex-1 min-h-0">
          {productsData.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 py-12 px-6 text-center backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-2">No products found</h2>
              <p className="text-neutral-400 mb-6">
                Try adjusting search filter criteria
              </p>
              {(q ||
                category ||
                minPrice !== undefined ||
                maxPrice !== undefined) && (
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400 transition hover:cursor-pointer"
                >
                  Clear all filters
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {productsData.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
