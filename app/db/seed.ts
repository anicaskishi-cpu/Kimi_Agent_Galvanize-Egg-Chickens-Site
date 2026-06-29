import { getDb } from "../api/queries/connection";
import { products, localUsers } from "./schema";
import { hashSync } from "bcryptjs";

async function seed() {
  const db = getDb();

  // Seed products
  const existingProducts = await db.select().from(products);
  if (existingProducts.length === 0) {
    await db.insert(products).values([
      {
        name: "Standard Single-Tier Layer Cage",
        slug: "standard-single-tier",
        description:
          "Reliable single-deck cage for small-scale egg production. Features galvanized steel wire construction with a built-in feeding trough and waste collection tray. Ideal for backyard farmers starting their poultry journey. Holds 3-4 layers comfortably.",
        shortDesc:
          "Reliable single-deck cage for small-scale egg production, ideal for backyard farmers",
        price: "1200.00",
        image: "/products/standard-single-tier.jpg",
        badge: "best-seller",
        inStock: true,
        sortOrder: 1,
      },
      {
        name: "Premium 3-Tier Commercial Layer Cage",
        slug: "premium-3tier-commercial",
        description:
          "High-capacity triple-deck system designed for commercial farming operations. Maximizes vertical space efficiency while maintaining easy access to all tiers. Each level has individual feeding troughs, water nipples, and egg collection rolls. Heavy-duty galvanized frame ensures years of rust-free service.",
        shortDesc:
          "High-capacity triple-deck system for commercial farms, maximizing space efficiency",
        price: "3500.00",
        image: "/products/premium-3tier.jpg",
        badge: "new-arrival",
        inStock: true,
        sortOrder: 2,
      },
      {
        name: "Heavy Duty Breeder Colony Cage",
        slug: "heavy-duty-breeder",
        description:
          "Spacious reinforced enclosure designed for breeder hens and rooster pairs. Extra-wide design allows natural mating behavior. Reinforced wire mesh withstands heavier bird activity. Includes partition panels for flexible colony sizing. Built for the serious breeder.",
        shortDesc:
          "Spacious reinforced enclosure designed for breeder hens and rooster pairs",
        price: "2800.00",
        image: "/products/heavy-duty-breeder.jpg",
        badge: "out-of-stock",
        inStock: false,
        sortOrder: 3,
      },
      {
        name: "Collapsible Transport & Grow-out Cage",
        slug: "collapsible-transport",
        description:
          "Foldable portable cage perfect for moving chickens between locations or raising young birds. Collapses flat for easy storage and transport. Sturdy carrying handle and secure locking latches. Also doubles as a temporary grow-out pen for chicks transitioning to adult housing.",
        shortDesc:
          "Foldable portable cage perfect for moving chickens or raising young birds",
        price: "950.00",
        image: "/products/collapsible-transport.jpg",
        badge: "pre-order",
        inStock: true,
        sortOrder: 4,
      },
    ]);
    console.log("✅ Products seeded");
  } else {
    console.log("ℹ️ Products already exist, skipping");
  }

  // Seed admin user (local auth)
  const existingAdmins = await db.select().from(localUsers);
  if (existingAdmins.length === 0) {
    await db.insert(localUsers).values({
      username: "admin",
      displayName: "Administrator",
      passwordHash: hashSync("admin123", 10),
      role: "admin",
    });
    console.log("✅ Admin user seeded (username: admin, password: admin123)");
  } else {
    console.log("ℹ️ Local users already exist, skipping");
  }

  console.log("🌱 Seed complete");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
