import { prisma } from "../client";
import { withTenantContext } from "../tenant-context";
import type { ProductListQuery } from "@repo/shared-types";
import { Prisma } from "../../generated/prisma/client";

export class ProductRepository {
  static async getProducts(query: ProductListQuery, storeId?: string) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      status: "active",
    };

    if (query.q) {
      where.OR = [
        { name: { contains: query.q, mode: "insensitive" } },
        { description: { contains: query.q, mode: "insensitive" } },
      ];
    }

    if (query.category) {
      where.categories = {
        some: {
          category: {
            slug: query.category,
          },
        },
      };
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.basePrice = {};
      if (query.minPrice !== undefined) {
        where.basePrice.gte = new Prisma.Decimal(query.minPrice);
      }
      if (query.maxPrice !== undefined) {
        where.basePrice.lte = new Prisma.Decimal(query.maxPrice);
      }
    }

    if (storeId) {
      where.storeProducts = {
        some: {
          storeId,
        },
      };
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    if (query.sort === "price-asc") {
      orderBy.basePrice = "asc";
    } else if (query.sort === "price-desc") {
      orderBy.basePrice = "desc";
    } else if (query.sort === "newest") {
      orderBy.createdAt = "desc";
    } else {
      orderBy.name = "asc";
    }

    const execute = async (client: Prisma.TransactionClient | typeof prisma) => {
      const [items, total] = await Promise.all([
        client.product.findMany({
          where,
          include: {
            images: {
              orderBy: { sortOrder: "asc" },
            },
            variants: {
              where: { isActive: true },
            },
            categories: {
              include: {
                category: true,
              },
            },
          },
          orderBy,
          skip,
          take: limit,
        }),
        client.product.count({ where }),
      ]);

      return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    };

    if (storeId) {
      return withTenantContext({ storeId }, async (tx) => execute(tx));
    }

    return execute(prisma);
  }

  static async getProductBySlug(slug: string, storeId?: string) {
    const where: Prisma.ProductWhereInput = {
      slug,
      status: "active",
    };

    if (storeId) {
      where.storeProducts = {
        some: {
          storeId,
        },
      };
    }

    const execute = async (client: Prisma.TransactionClient | typeof prisma) => {
      return client.product.findFirst({
        where,
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
          },
          variants: {
            where: { isActive: true },
          },
          categories: {
            include: {
              category: true,
            },
          },
          personalizations: true,
        },
      });
    };

    if (storeId) {
      return withTenantContext({ storeId }, async (tx) => execute(tx));
    }

    return execute(prisma);
  }

  static async getCategories() {
    return prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        parent: true,
      },
    });
  }

  static async getCategoryBySlug(slug: string) {
    return prisma.category.findUnique({
      where: { slug },
      include: {
        parent: true,
      },
    });
  }
}
