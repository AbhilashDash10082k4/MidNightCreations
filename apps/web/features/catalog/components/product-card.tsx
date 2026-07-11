import Link from "next/link";

type ProductCardProps = {
  product: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    basePrice: { toString(): string };
    isCustomizable: boolean;
    images?: { url: string }[];
  };
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600&auto=format&fit=crop";
const DEFAULT_DESCRIPTION =
  "Premium crafted product. Custom printed or engraved locally in Orange, CT. Built for comfort and durability.";

export function ProductCard({ product }: ProductCardProps) {
  const image = product.images?.[0]?.url || DEFAULT_IMAGE;
  const description = product.description || DEFAULT_DESCRIPTION;
  const price = product.basePrice.toString();

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition-all duration-300 hover:border-indigo-500/50 hover:bg-white/10 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 hover:cursor-pointer"
    >
      {/* Visual Image container */}
      <div className="aspect-square sm:aspect-[4/3] w-full overflow-hidden bg-neutral-900 relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        {product.isCustomizable && (
          <span className="absolute top-2 right-2 sm:top-4 sm:right-4 inline-flex items-center rounded-full bg-indigo-500/90 px-2 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-xs font-bold text-white shadow-lg backdrop-blur-md">
            Customizable
          </span>
        )}
      </div>

      {/* Info details */}
      <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-5">
        <div>
          <h3 className="text-sm sm:text-lg font-bold text-white line-clamp-1 group-hover:text-indigo-300 transition-colors">
            {product.name}
          </h3>
          <p className="mt-1 text-[10px] sm:text-xs text-neutral-400 line-clamp-2">
            {description}
          </p>
        </div>
        <div className="mt-3 sm:mt-4 flex items-center justify-between">
          <span className="text-sm sm:text-lg font-semibold text-neutral-200">${price}</span>
          <span className="text-[10px] sm:text-xs font-medium text-indigo-400 group-hover:underline">
            View Details &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
