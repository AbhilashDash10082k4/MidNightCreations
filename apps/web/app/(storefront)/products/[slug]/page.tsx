import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductRepository } from "@repo/db";
import { PdpContainer } from "../../../../features/catalog/components/pdp-container";
import { getCurrentUser } from "../../../../lib/auth";
import { Header } from "../../../../features/catalog/components/header";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{ slug: string }> | { slug: string };
};

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;

  const [product, user] = await Promise.all([
    ProductRepository.getProductBySlug(slug),
    getCurrentUser(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 selection:bg-indigo-500/30">
      {/* Header */}
      <Header user={user} />

      {/* Main Details Body */}
      <main className="container mx-auto px-4 py-12">
        <div className="mb-6 flex items-center gap-2 text-xs text-neutral-500">
          <Link href="/" className="hover:underline hover:cursor-pointer">
            Catalog
          </Link>
          <span>/</span>
          {product.categories[0] && (
            <>
              <Link
                href={`/category/${product.categories[0].category.slug}`}
                className="hover:underline hover:cursor-pointer"
              >
                {product.categories[0].category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-neutral-400 font-medium">{product.name}</span>
        </div>

        <PdpContainer product={JSON.parse(JSON.stringify(product))} />
      </main>
    </div>
  );
}
