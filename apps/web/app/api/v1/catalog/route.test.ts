import { describe, test, expect, mock } from "bun:test";
import { NextRequest } from "next/server";
import { GET } from "./route";

mock.module("../../../../features/catalog/catalog.controller", () => {
  return {
    CatalogController: {
      getProducts: () =>
        Promise.resolve({
          items: [{ id: "1", name: "Mock Product", basePrice: 10.0 }],
          total: 1,
          page: 1,
          limit: 12,
          totalPages: 1,
        }),
    },
  };
});

describe("Catalog API Route", () => {
  test("GET retrieves products", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/v1/catalog?q=mock",
    );
    const response = await GET(request);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.items.length).toBe(1);
    expect(body.items[0]?.name).toBe("Mock Product");
  });
});
