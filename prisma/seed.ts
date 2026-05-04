import { PrismaClient } from "@prisma/client";


import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Memulai proses seeding...");

  // Kata sandi default: rahasia123
  const kataSandiHash = await bcrypt.hash("rahasia123", 12);

  // Buat Admin
  const admin = await prisma.pengguna.upsert({
    where: { email: "admin@gor.com" },
    update: {},
    create: {
      nama: "Admin GOR",
      email: "admin@gor.com",
      kataSandi: kataSandiHash,
      peran: "ADMIN",
    },
  });

  // Buat Pemilik
  const pemilik = await prisma.pengguna.upsert({
    where: { email: "pemilik@gor.com" },
    update: {},
    create: {
      nama: "Pemilik GOR",
      email: "pemilik@gor.com",
      kataSandi: kataSandiHash,
      peran: "PEMILIK",
    },
  });

  console.log("Seeding selesai!");
  console.log("--- Kredensial ---");
  console.log("Admin   : admin@gor.com   | Password: rahasia123");
  console.log("Pemilik : pemilik@gor.com | Password: rahasia123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
