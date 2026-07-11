import { CatalogService } from "./catalog";
import { productListQuerySchema, productSlugSchema } from "@repo/shared-types";

export class CatalogController {
  static async getProducts(urlSearchParams: URLSearchParams, storeId?: string) {
    const rawQuery = {
      q: urlSearchParams.get("q") || undefined,
      category: urlSearchParams.get("category") || undefined,
      sort: urlSearchParams.get("sort") || undefined,
      minPrice: urlSearchParams.get("minPrice") || undefined,
      maxPrice: urlSearchParams.get("maxPrice") || undefined,
      page: urlSearchParams.get("page") || undefined,
      limit: urlSearchParams.get("limit") || undefined,
    };

    const parsed = productListQuerySchema.safeParse(rawQuery);
    if (!parsed.success) {
      throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
    }

    return CatalogService.listProducts(parsed.data, storeId);
  }

  static async getProductBySlug(slug: string, storeId?: string) {
    const parsed = productSlugSchema.safeParse({ slug });
    if (!parsed.success) {
      throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
    }

    const product = await CatalogService.getProductBySlug(
      parsed.data.slug,
      storeId,
    );
    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  }

  static async getCategories() {
    return CatalogService.listCategories();
  }
}
