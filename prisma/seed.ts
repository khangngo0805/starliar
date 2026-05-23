import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.campaignMedia.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.collection.deleteMany();

  const collection = await prisma.collection.create({
    data: {
      slug: "first-signal",
      name: "First Signal",
      description: "A cold opening drop for Starliar."
    }
  });

  await prisma.campaignMedia.create({
    data: {
      title: "Starliar Hero",
      kind: "video",
      src: "/media/starliar-hero.mp4",
      alt: "Starliar opening campaign video",
      hero: true,
      position: 0
    }
  });

  const products = [
    {
      slug: "orbital-shell-jacket",
      name: "Orbital Shell Jacket",
      description: "Structured unisex outerwear with a cold reflective shell.",
      priceVnd: 2890000,
      image: "/media/placeholders/orbital-shell.svg",
      sizes: ["S", "M", "L"]
    },
    {
      slug: "nocturne-layer-shirt",
      name: "Nocturne Layer Shirt",
      description: "A sharp daily layer with elongated lines and quiet hardware.",
      priceVnd: 1590000,
      image: "/media/placeholders/nocturne-shirt.svg",
      sizes: ["S", "M", "L", "XL"]
    },
    {
      slug: "signal-wide-trouser",
      name: "Signal Wide Trouser",
      description: "Wide unisex trouser with a clean fall and controlled volume.",
      priceVnd: 1890000,
      image: "/media/placeholders/signal-trouser.svg",
      sizes: ["S", "M", "L"]
    },
    {
      slug: "static-crossbody",
      name: "Static Crossbody",
      description: "Compact technical bag for the First Signal campaign.",
      priceVnd: 1290000,
      image: "/media/placeholders/static-crossbody.svg",
      sizes: ["OS"]
    }
  ];

  for (const product of products) {
    await prisma.product.create({
      data: {
        slug: product.slug,
        name: product.name,
        description: product.description,
        priceVnd: product.priceVnd,
        published: true,
        collectionId: collection.id,
        images: {
          create: [{ src: product.image, alt: product.name, position: 0 }]
        },
        variants: {
          create: product.sizes.map((size) => ({
            size,
            sku: `STAR-${product.slug.toUpperCase().replaceAll("-", "_")}-${size}`,
            stock: 8
          }))
        }
      }
    });
  }

  if (process.env.ADMIN_SEED_EMAIL && process.env.ADMIN_SEED_PASSWORD) {
    await prisma.adminUser.upsert({
      where: { email: process.env.ADMIN_SEED_EMAIL },
      update: {},
      create: {
        email: process.env.ADMIN_SEED_EMAIL,
        passwordHash: await bcrypt.hash(process.env.ADMIN_SEED_PASSWORD, 12)
      }
    });
  }
}

main().finally(async () => prisma.$disconnect());
