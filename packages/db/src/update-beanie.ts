import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const beanie = await prisma.product.findUnique({
    where: { slug: "cozy-ribbed-beanie" },
    include: { images: true }
  });
  if (beanie && beanie.images.length > 0) {
    await prisma.productImage.update({
      where: { id: beanie.images[0].id },
      data: { url: "https://images.unsplash.com/photo-1608060434411-0c3fa9049e7b?q=80&w=800&auto=format&fit=crop" }
    });
    console.log("Updated beanie image URL in database!");
  } else {
    console.log("Beanie product or image not found in database!");
  }
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
