import {
  isPlainObject,
  failure,
  readOptionalTrimmedString,
  readPositiveInteger,
  readTrimmedString,
  success,
  type Schema,
} from "./schema";

export type ProductListQuery = {
  q?: string;
  category?: string;
  sort?: "relevance" | "price-asc" | "price-desc" | "newest";
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
};

export type ProductSlug = {
  slug: string;
};

export const productListQuerySchema: Schema<ProductListQuery> = {
  safeParse(value: unknown) {
    if (!isPlainObject(value)) {
      return failure("Invalid product query.");
    }

    const sort = readOptionalTrimmedString(value.sort);
    const parsedSort =
      sort === undefined ||
      sort === "relevance" ||
      sort === "price-asc" ||
      sort === "price-desc" ||
      sort === "newest"
        ? sort
        : null;

    if (sort && !parsedSort) {
      return failure("Invalid sort order.");
    }

    const minPrice =
      value.minPrice === undefined || value.minPrice === ""
        ? undefined
        : Number(value.minPrice);
    const maxPrice =
      value.maxPrice === undefined || value.maxPrice === ""
        ? undefined
        : Number(value.maxPrice);
    const page =
      value.page === undefined || value.page === ""
        ? undefined
        : readPositiveInteger(value.page);
    const limit =
      value.limit === undefined || value.limit === ""
        ? undefined
        : readPositiveInteger(value.limit, 100);

    if (minPrice !== undefined && Number.isNaN(minPrice)) {
      return failure("Invalid minimum price.");
    }

    if (maxPrice !== undefined && Number.isNaN(maxPrice)) {
      return failure("Invalid maximum price.");
    }

    if (page === null) {
      return failure("Invalid page.");
    }

    if (limit === null) {
      return failure("Invalid limit.");
    }

    return success({
      q: readOptionalTrimmedString(value.q),
      category: readOptionalTrimmedString(value.category),
      sort: parsedSort === null ? undefined : parsedSort,
      minPrice,
      maxPrice,
      page,
      limit,
    });
  },
};

export const productSlugSchema: Schema<ProductSlug> = {
  safeParse(value: unknown) {
    if (!isPlainObject(value)) {
      return failure("Invalid product slug.");
    }

    const slug = readTrimmedString(value.slug);
    if (!slug) {
      return failure("Slug is required.");
    }

    return success({ slug });
  },
};
