import { NextRequest, NextResponse } from "next/server";
import { CatalogController } from "../../../../features/catalog/catalog.controller";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId") || undefined;
    const result = await CatalogController.getProducts(searchParams, storeId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch products" },
      { status: 400 },
    );
  }
}
