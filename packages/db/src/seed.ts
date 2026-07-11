import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.giftCardRedemption.deleteMany();
  await prisma.giftCard.deleteMany();
  await prisma.discount.deleteMany();
  await prisma.personalizationField.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // Create Categories
  const categoryApparel = await prisma.category.create({
    data: {
      name: "Apparel",
      slug: "apparel",
      description: "Custom hoodies, t-shirts, and caps.",
      sortOrder: 1,
    },
  });

  const categoryEngraving = await prisma.category.create({
    data: {
      name: "Engraving",
      slug: "engraving",
      description: "Custom engraved tumblers and gifts.",
      sortOrder: 2,
    },
  });

  console.log("Categories created.");

  // Create Products
  // 1. Customizable T-Shirt
  const tShirt = await prisma.product.create({
    data: {
      name: "Custom Corporate T-Shirt",
      slug: "custom-corporate-t-shirt",
      description:
        "Premium cotton corporate t-shirt, customizable with your logo and name.",
      basePrice: 19.99,
      isCustomizable: true,
    },
  });

  await prisma.productCategory.create({
    data: {
      productId: tShirt.id,
      categoryId: categoryApparel.id,
    },
  });

  await prisma.productImage.createMany({
    data: [
      {
        productId: tShirt.id,
        url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
        altText: "Custom Corporate T-Shirt Front",
        sortOrder: 1,
      },
      {
        productId: tShirt.id,
        url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
        altText: "Custom Corporate T-Shirt Back",
        sortOrder: 2,
      },
    ],
  });

  await prisma.productVariant.createMany({
    data: [
      {
        productId: tShirt.id,
        sku: "TSHIRT-S",
        price: 19.99,
        compareAt: 24.99,
        inventoryQty: 50,
        optionValues: { Size: "S", Color: "Navy" },
      },
      {
        productId: tShirt.id,
        sku: "TSHIRT-M",
        price: 19.99,
        compareAt: 24.99,
        inventoryQty: 100,
        optionValues: { Size: "M", Color: "Navy" },
      },
      {
        productId: tShirt.id,
        sku: "TSHIRT-L",
        price: 21.99,
        compareAt: 26.99,
        inventoryQty: 75,
        optionValues: { Size: "L", Color: "Navy" },
      },
    ],
  });

  await prisma.personalizationField.createMany({
    data: [
      {
        productId: tShirt.id,
        label: "Employee Name",
        fieldType: "text",
        maxLength: 20,
        extraPrice: 3.5,
        isRequired: true,
      },
      {
        productId: tShirt.id,
        label: "Company Logo",
        fieldType: "file",
        extraPrice: 5.0,
        isRequired: false,
      },
    ],
  });

  // 2. Engraved Tumbler
  const tumbler = await prisma.product.create({
    data: {
      name: "Custom Engraved Tumbler",
      slug: "custom-engraved-tumbler",
      description:
        "Double-walled vacuum insulated stainless steel tumbler. Keeps drinks ice cold or piping hot.",
      basePrice: 29.99,
      isCustomizable: true,
    },
  });

  await prisma.productCategory.create({
    data: {
      productId: tumbler.id,
      categoryId: categoryEngraving.id,
    },
  });

  await prisma.productImage.create({
    data: {
      productId: tumbler.id,
      url: "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?q=80&w=800&auto=format&fit=crop",
      altText: "Engraved Tumbler Showcase",
      sortOrder: 1,
    },
  });

  await prisma.productVariant.createMany({
    data: [
      {
        productId: tumbler.id,
        sku: "TUMBLER-20OZ",
        price: 29.99,
        inventoryQty: 120,
        optionValues: { Capacity: "20oz", Color: "Matte Black" },
      },
      {
        productId: tumbler.id,
        sku: "TUMBLER-30OZ",
        price: 34.99,
        inventoryQty: 80,
        optionValues: { Capacity: "30oz", Color: "Matte Black" },
      },
    ],
  });

  await prisma.personalizationField.create({
    data: {
      productId: tumbler.id,
      label: "Custom Name / Text",
      fieldType: "text",
      maxLength: 15,
      extraPrice: 4.0,
      isRequired: true,
    },
  });

  // 3. Regular T-Shirt (Not Customizable)
  const classicCap = await prisma.product.create({
    data: {
      name: "Midnight Classics Dad Cap",
      slug: "midnight-classics-dad-cap",
      description:
        "Minimalist classic dad cap with embroidered logo on front. One size fits all.",
      basePrice: 24.99,
      isCustomizable: false,
    },
  });

  await prisma.productCategory.create({
    data: {
      productId: classicCap.id,
      categoryId: categoryApparel.id,
    },
  });

  await prisma.productImage.create({
    data: {
      productId: classicCap.id,
      url: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800&auto=format&fit=crop",
      altText: "Classic Dad Cap",
    },
  });

  await prisma.productVariant.create({
    data: {
      productId: classicCap.id,
      sku: "CAP-BLACK-OS",
      price: 24.99,
      inventoryQty: 40,
      optionValues: { Color: "Midnight Black" },
    },
  });

  // 4. Classic Hoodie
  const classicHoodie = await prisma.product.create({
    data: {
      name: "Midnight Cozy Hoodie",
      slug: "midnight-cozy-hoodie",
      description: "Super soft premium fleece hoodie. Perfect for cold nights in New England.",
      basePrice: 44.99,
      isCustomizable: false,
    },
  });

  await prisma.productCategory.create({
    data: {
      productId: classicHoodie.id,
      categoryId: categoryApparel.id,
    },
  });

  await prisma.productImage.create({
    data: {
      productId: classicHoodie.id,
      url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
      altText: "Cozy Hoodie Showcase",
    },
  });

  await prisma.productVariant.create({
    data: {
      productId: classicHoodie.id,
      sku: "HOODIE-BLACK-M",
      price: 44.99,
      inventoryQty: 30,
      optionValues: { Size: "M", Color: "Midnight Black" },
    },
  });

  // 5. Engraved Coaster Set
  const coasterSet = await prisma.product.create({
    data: {
      name: "Slate Coaster Set (4-Pack)",
      slug: "slate-coaster-set-4pack",
      description: "Natural slate stone coasters. Custom laser-engraved with your initials or design.",
      basePrice: 19.99,
      isCustomizable: true,
    },
  });

  await prisma.productCategory.create({
    data: {
      productId: coasterSet.id,
      categoryId: categoryEngraving.id,
    },
  });

  await prisma.productImage.create({
    data: {
      productId: coasterSet.id,
      url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=800&auto=format&fit=crop",
      altText: "Coaster Set",
    },
  });

  await prisma.productVariant.create({
    data: {
      productId: coasterSet.id,
      sku: "COASTER-SLATE-4P",
      price: 19.99,
      inventoryQty: 100,
      optionValues: { Style: "Square", Material: "Natural Slate" },
    },
  });

  await prisma.personalizationField.create({
    data: {
      productId: coasterSet.id,
      label: "Family Initials",
      fieldType: "text",
      maxLength: 3,
      extraPrice: 2.0,
      isRequired: true,
    },
  });

  // 6. Custom Mug
  const customMug = await prisma.product.create({
    data: {
      name: "Custom Engraved Coffee Mug",
      slug: "custom-engraved-coffee-mug",
      description: "Ceramic custom coffee mug with laser-engraved details.",
      basePrice: 14.99,
      isCustomizable: true,
    },
  });

  await prisma.productCategory.create({
    data: {
      productId: customMug.id,
      categoryId: categoryEngraving.id,
    },
  });

  await prisma.productImage.create({
    data: {
      productId: customMug.id,
      url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop",
      altText: "Coffee Mug Showcase",
    },
  });

  await prisma.productVariant.create({
    data: {
      productId: customMug.id,
      sku: "MUG-12OZ-WHITE",
      price: 14.99,
      inventoryQty: 60,
      optionValues: { Capacity: "12oz", Color: "White" },
    },
  });

  await prisma.personalizationField.create({
    data: {
      productId: customMug.id,
      label: "Mug Text",
      fieldType: "text",
      maxLength: 10,
      extraPrice: 1.5,
      isRequired: true,
    },
  });

  // 7. Premium Polo
  const premiumPolo = await prisma.product.create({
    data: {
      name: "Premium Knit Polo",
      slug: "premium-knit-polo",
      description: "Sophisticated pique knit polo shirt. Soft, breathable, and highly durable.",
      basePrice: 29.99,
      isCustomizable: false,
    },
  });

  await prisma.productCategory.create({
    data: {
      productId: premiumPolo.id,
      categoryId: categoryApparel.id,
    },
  });

  await prisma.productImage.create({
    data: {
      productId: premiumPolo.id,
      url: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=800&auto=format&fit=crop",
      altText: "Premium Knit Polo",
    },
  });

  await prisma.productVariant.create({
    data: {
      productId: premiumPolo.id,
      sku: "POLO-WHITE-L",
      price: 29.99,
      inventoryQty: 45,
      optionValues: { Size: "L", Color: "White" },
    },
  });

  // 8. Embroidered Beanie
  const embroideredBeanie = await prisma.product.create({
    data: {
      name: "Cozy Ribbed Beanie",
      slug: "cozy-ribbed-beanie",
      description: "Warm knit ribbed beanie with high quality front embroidery.",
      basePrice: 18.99,
      isCustomizable: false,
    },
  });

  await prisma.productCategory.create({
    data: {
      productId: embroideredBeanie.id,
      categoryId: categoryApparel.id,
    },
  });

  await prisma.productImage.create({
    data: {
      productId: embroideredBeanie.id,
      url: "https://images.unsplash.com/photo-1608060434411-0c3fa9049e7b?q=80&w=800&auto=format&fit=crop",
      altText: "Cozy Ribbed Beanie",
    },
  });

  await prisma.productVariant.create({
    data: {
      productId: embroideredBeanie.id,
      sku: "BEANIE-GREY-OS",
      price: 18.99,
      inventoryQty: 100,
      optionValues: { Color: "Heather Grey" },
    },
  });

  // 9. Engraved Wood Platter
  const woodPlatter = await prisma.product.create({
    data: {
      name: "Engraved Serving Platter",
      slug: "engraved-serving-platter",
      description: "Premium acacia wood serving platter. Custom engraved with family monogram.",
      basePrice: 39.99,
      isCustomizable: true,
    },
  });

  await prisma.productCategory.create({
    data: {
      productId: woodPlatter.id,
      categoryId: categoryEngraving.id,
    },
  });

  await prisma.productImage.create({
    data: {
      productId: woodPlatter.id,
      url: "https://images.unsplash.com/photo-1606744824163-985d376605aa?q=80&w=800&auto=format&fit=crop",
      altText: "Serving Platter Showcase",
    },
  });

  await prisma.productVariant.create({
    data: {
      productId: woodPlatter.id,
      sku: "PLATTER-ACACIA-OS",
      price: 39.99,
      inventoryQty: 25,
      optionValues: { Material: "Acacia Wood" },
    },
  });

  await prisma.personalizationField.create({
    data: {
      productId: woodPlatter.id,
      label: "Family Crest Monogram Letter",
      fieldType: "text",
      maxLength: 1,
      extraPrice: 5.0,
      isRequired: true,
    },
  });

  // Seed Discounts (Promo Codes)
  await prisma.discount.createMany({
    data: [
      {
        code: "WELCOME10",
        type: "percentage",
        value: 10.00,
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        maxUses: 100,
        usedCount: 0,
        isActive: true,
      },
      {
        code: "MIN20",
        type: "fixed",
        value: 20.00,
        minSpend: 100.00,
        startsAt: new Date(),
        maxUses: 50,
        usedCount: 0,
        isActive: true,
      },
      {
        code: "EXPIRED",
        type: "percentage",
        value: 15.00,
        startsAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        endsAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // expired yesterday
        maxUses: 10,
        usedCount: 5,
        isActive: true,
      }
    ]
  });

  // Seed Gift Cards
  await prisma.giftCard.createMany({
    data: [
      {
        code: "GIFTY50",
        initialValue: 50.00,
        balance: 50.00,
        isActive: true,
      },
      {
        code: "GIFTY10",
        initialValue: 10.00,
        balance: 10.00,
        isActive: true,
      },
      {
        code: "GIFTYEXPIRED",
        initialValue: 100.00,
        balance: 100.00,
        isActive: false,
      }
    ]
  });

  console.log("Products, discounts, and gift cards seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
