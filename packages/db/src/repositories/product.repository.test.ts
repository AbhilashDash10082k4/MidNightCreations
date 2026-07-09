import { describe, test, expect, mock } from "bun:test";
import { ProductRepository } from "./product.repository";
import { prisma } from "../client";

// Mock prisma client
mock.module("../client", () => {
  return {
    prisma: {
      product: {
        findMany: () =>
          Promise.resolve([
            {
              id: "1",
              slug: "test-product",
              name: "Test Product",
              description: "Test Description",
              basePrice: 10.0,
              status: "active",
              images: [],
              variants: [],
              categories: [],
            },
          ]),
        count: () => Promise.resolve(1),
        findFirst: () =>
          Promise.resolve({
            id: "1",
            slug: "test-product",
            name: "Test Product",
            description: "Test Description",
            basePrice: 10.0,
            status: "active",
            images: [],
            variants: [],
            categories: [],
            personalizations: [],
          }),
      },
      category: {
        findMany: () =>
          Promise.resolve([
            { id: "cat-1", name: "Shirts", slug: "shirts", sortOrder: 0 },
          ]),
        findUnique: () =>
          Promise.resolve({
            id: "cat-1",
            name: "Shirts",
            slug: "shirts",
            sortOrder: 0,
          }),
      },
    },
  };
});

describe("ProductRepository", () => {
  test("getProducts retrieves list and total count", async () => {
    const result = await ProductRepository.getProducts({ page: 1, limit: 12 });
    expect(result.items.length).toBe(1);
    expect(result.items[0]?.name).toBe("Test Product");
    expect(result.total).toBe(1);
  });

  test("getProductBySlug retrieves a single product", async () => {
    const product = await ProductRepository.getProductBySlug("test-product");
    expect(product).not.toBeNull();
    expect(product?.slug).toBe("test-product");
  });

  test("getCategories retrieves all categories", async () => {
    const categories = await ProductRepository.getCategories();
    expect(categories.length).toBe(1);
    expect(categories[0]?.name).toBe("Shirts");
  });

  test("getCategoryBySlug retrieves single category", async () => {
    const category = await ProductRepository.getCategoryBySlug("shirts");
    expect(category).not.toBeNull();
    expect(category?.slug).toBe("shirts");
  });
});
