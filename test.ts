import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const data = await prisma.slotwaktu.findMany();
  console.log("Total entries:", data.length);
  if (data.length > 0) {
    console.log(data[0]);
    console.log("ISO Date:", data[0].tanggal.toISOString());
  }
}

main().catch(console.error);
