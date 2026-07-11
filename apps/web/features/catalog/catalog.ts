import { ProductRepository } from "@repo/db";
import type { ProductListQuery } from "@repo/shared-types";

export class CatalogService {
  static async listProducts(query: ProductListQuery, storeId?: string) {
    return ProductRepository.getProducts(query, storeId);
  }

  static async getProductBySlug(slug: string, storeId?: string) {
    return ProductRepository.getProductBySlug(slug, storeId);
  }

  static async listCategories() {
    return ProductRepository.getCategories();
  }

  static async getCategoryBySlug(slug: string) {
    return ProductRepository.getCategoryBySlug(slug);
  }
}
