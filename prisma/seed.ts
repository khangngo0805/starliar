import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.favorite.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.campaignMedia.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.user.deleteMany();

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
      category: "Jacket",
      description: "Structured unisex outerwear with a cold reflective shell.",
      priceVnd: 2890000,
      image: "/media/placeholders/orbital-shell.svg",
      sizes: ["S", "M", "L"]
    },
    {
      slug: "nocturne-layer-shirt",
      name: "Nocturne Layer Shirt",
      category: "Shirt",
      description: "A sharp daily layer with elongated lines and quiet hardware.",
      priceVnd: 1590000,
      image: "/media/placeholders/nocturne-shirt.svg",
      sizes: ["S", "M", "L", "XL"]
    },
    {
      slug: "signal-wide-trouser",
      name: "Signal Wide Trouser",
      category: "Trousers",
      description: "Wide unisex trouser with a clean fall and controlled volume.",
      priceVnd: 1890000,
      image: "/media/placeholders/signal-trouser.svg",
      sizes: ["S", "M", "L"]
    },
    {
      slug: "static-crossbody",
      name: "Static Crossbody",
      category: "Accessories",
      description: "Compact technical bag for the First Signal campaign.",
      priceVnd: 1290000,
      image: "/media/placeholders/static-crossbody.svg",
      sizes: ["OS"]
    },
    {
      slug: "void-basic-tee",
      name: "Void Basic Tee",
      category: "T-Shirt",
      description: "Dense cotton tee with a boxy unisex fit and low-gloss finish.",
      priceVnd: 890000,
      image: "/media/placeholders/nocturne-shirt.svg",
      sizes: ["XS", "S", "M", "L", "XL"]
    },
    {
      slug: "glass-logo-tee",
      name: "Glass Logo Tee",
      category: "T-Shirt",
      description: "Minimal logo tee with a pale reflective chest mark.",
      priceVnd: 990000,
      image: "/media/placeholders/nocturne-shirt.svg",
      sizes: ["S", "M", "L", "XL"]
    },
    {
      slug: "silent-poplin-shirt",
      name: "Silent Poplin Shirt",
      category: "Shirt",
      description: "Crisp poplin shirt cut long with a clean hidden placket.",
      priceVnd: 1690000,
      image: "/media/placeholders/nocturne-shirt.svg",
      sizes: ["S", "M", "L"]
    },
    {
      slug: "axis-cropped-shirt",
      name: "Axis Cropped Shirt",
      category: "Shirt",
      description: "Cropped technical shirt with a boxy shoulder and cold hand feel.",
      priceVnd: 1790000,
      image: "/media/placeholders/nocturne-shirt.svg",
      sizes: ["S", "M", "L"]
    },
    {
      slug: "afterimage-long-sleeve",
      name: "Afterimage Long Sleeve",
      category: "Long Sleeve",
      description: "Slim long sleeve layer with elongated cuff and quiet seam lines.",
      priceVnd: 1190000,
      image: "/media/placeholders/nocturne-shirt.svg",
      sizes: ["S", "M", "L", "XL"]
    },
    {
      slug: "frost-mesh-long-sleeve",
      name: "Frost Mesh Long Sleeve",
      category: "Long Sleeve",
      description: "Semi-sheer mesh layer designed for stacked editorial styling.",
      priceVnd: 1390000,
      image: "/media/placeholders/nocturne-shirt.svg",
      sizes: ["S", "M", "L"]
    },
    {
      slug: "archive-hoodie",
      name: "Archive Hoodie",
      category: "Hoodie",
      description: "Heavyweight hoodie with dropped shoulder and hidden side pockets.",
      priceVnd: 2190000,
      image: "/media/placeholders/orbital-shell.svg",
      sizes: ["S", "M", "L", "XL"]
    },
    {
      slug: "signal-zip-hoodie",
      name: "Signal Zip Hoodie",
      category: "Hoodie",
      description: "Two-way zip hoodie with a cold metal pull and cropped body.",
      priceVnd: 2390000,
      image: "/media/placeholders/orbital-shell.svg",
      sizes: ["S", "M", "L"]
    },
    {
      slug: "mirror-bomber",
      name: "Mirror Bomber",
      category: "Jacket",
      description: "Short bomber with a reflective face and compact silhouette.",
      priceVnd: 3290000,
      image: "/media/placeholders/orbital-shell.svg",
      sizes: ["S", "M", "L"]
    },
    {
      slug: "lowlight-cargo-trouser",
      name: "Lowlight Cargo Trouser",
      category: "Trousers",
      description: "Technical cargo trouser with wide leg and flat side pockets.",
      priceVnd: 2190000,
      image: "/media/placeholders/signal-trouser.svg",
      sizes: ["S", "M", "L", "XL"]
    },
    {
      slug: "cold-cut-short",
      name: "Cold Cut Short",
      category: "Shorts",
      description: "Structured knee-length short with a crisp front crease.",
      priceVnd: 1490000,
      image: "/media/placeholders/signal-trouser.svg",
      sizes: ["S", "M", "L"]
    },
    {
      slug: "trace-cap",
      name: "Trace Cap",
      category: "Accessories",
      description: "Low-profile cap with tonal embroidery and adjustable back strap.",
      priceVnd: 690000,
      image: "/media/placeholders/static-crossbody.svg",
      sizes: ["OS"]
    }
  ];

  for (const product of products) {
    await prisma.product.create({
      data: {
        slug: product.slug,
        name: product.name,
        category: product.category,
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

  await prisma.user.upsert({
    where: { email: "user@starliar.local" },
    update: {},
    create: {
      email: "user@starliar.local",
      name: "Starliar User",
      passwordHash: await bcrypt.hash("change-this-password", 12)
    }
  });
}

main().finally(async () => prisma.$disconnect());
