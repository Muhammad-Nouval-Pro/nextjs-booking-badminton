require('ts-node').register();
const { PrismaClient } = require('@prisma/client');



async function check() {
  const prisma = new PrismaClient();
  const res = await prisma.slotwaktu.findMany({
    select: {
      tanggal: true,
      jamMulai: true,
      lapanganId: true
    }
  });
  console.log("TOTAL DATA:", res.length);
  if(res.length > 0) {
    console.log("Sample 1:", {
      tanggalRaw: res[0].tanggal, // typeof Date
      tanggalISO: res[0].tanggal.toISOString(),
      jamMulai: res[0].jamMulai
    });
  }
}

check().catch(console.error);
