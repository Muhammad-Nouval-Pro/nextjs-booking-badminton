import { prisma } from "../app/lib/db";

async function main() {
  const users = await prisma.pengguna.findMany({
    where: { peran: 'PELANGGAN' },
    select: { nama: true, email: true }
  })
  console.log(JSON.stringify(users, null, 2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
