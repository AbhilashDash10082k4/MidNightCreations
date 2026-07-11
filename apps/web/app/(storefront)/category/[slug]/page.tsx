import { ProductRepository } from "@repo/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CatalogFilter } from "../../../../features/catalog/components/catalog-filter";
import { ProductCard } from "../../../../features/catalog/components/product-card";
import { getCurrentUser } from "../../../../lib/auth";
import { Header } from "../../../../features/catalog/components/header";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{ slug: string }> | { slug: string };
  searchParams?:
    | Promise<{
        q?: string;
        sort?: string;
        minPrice?: string;
        maxPrice?: string;
        page?: string;
      }>
    | {
        q?: string;
        sort?: string;
        minPrice?: string;
        maxPrice?: string;
        page?: string;
      };
};

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams);

  const slug = resolvedParams.slug;
  const category = await ProductRepository.getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const q = resolvedSearchParams?.q || "";
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
      category: slug,
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

      {/* Main Body */}
      <div className="container mx-auto px-4 pb-12 flex flex-col lg:flex-row gap-6 pt-12">
        {/* Filter sidebar — sticky below header */}
        <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-20 self-start no-scrollbar mb-6 lg:mb-0">
          <CatalogFilter
            categories={categories}
            currentCategory={slug}
            currentSort={sort}
            currentMinPrice={resolvedSearchParams?.minPrice || ""}
            currentMaxPrice={resolvedSearchParams?.maxPrice || ""}
            currentQ={q}
          />
        </aside>

        {/* Product catalog */}
        <main className="flex-1 min-h-0">
          <div className="mb-10">
            <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2">
              <Link href="/" className="hover:underline hover:cursor-pointer">
                Catalog
              </Link>
              <span>/</span>
              <span className="text-neutral-400 font-medium">
                {category.name}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-neutral-400 max-w-xl text-sm">
                {category.description}
              </p>
            )}
          </div>

          {productsData.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 py-24 backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-2">No products found</h2>
              <p className="text-sm text-neutral-400">
                Try adjusting your filter settings.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {productsData.items.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
