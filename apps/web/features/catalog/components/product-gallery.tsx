"use client";

import { useState } from "react";

type ImageType = {
  id: string;
  url: string;
  altText: string | null;
};

type ProductGalleryProps = {
  images: ImageType[];
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop";

export function ProductGallery({ images }: ProductGalleryProps) {
  const list = images.length > 0 ? images : [{ id: "placeholder", url: DEFAULT_IMAGE, altText: "Product Placeholder" }];
  const [activeImage, setActiveImage] = useState(list[0]);

  return (
    <div className="space-y-4">
      {/* Active Display */}
      <div className="aspect-[4/3] w-full overflow-hidden rounded-3xl border border-white/10 bg-neutral-900 shadow-inner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeImage?.url || DEFAULT_IMAGE}
          alt={activeImage?.altText || "Product Image"}
          className="h-full w-full object-cover transition-all duration-300"
        />
      </div>

      {/* Thumbnail List */}
      {list.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {list.map((img) => (
            <button
              key={img.id}
              onClick={() => setActiveImage(img)}
              className={`relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-xl border transition-all hover:cursor-pointer ${
                activeImage?.id === img.id
                  ? "border-indigo-500 ring-2 ring-indigo-500/20 scale-95"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.altText || "Thumbnail"}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
