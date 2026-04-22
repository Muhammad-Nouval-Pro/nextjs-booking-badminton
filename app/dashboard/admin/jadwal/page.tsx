import { prisma } from "@/app/lib/db";
import { FormGenerateJadwal, TabelJadwal } from "./client";

export default async function KelolaJadwal() {
  const daftarLapangan = await prisma.lapangan.findMany({
    select: { id: true, nama: true },
    orderBy: { nama: "asc" }
  });

  // Ambil jadwal mulai hari ini ke depan
  // Ambil tanggal hari ini dalam zona waktu Asia/Jakarta (WIB)
  const now = new Date();
  const tglSekarangWIB = now.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" }); // YYYY-MM-DD
  const jamSekarangWIB = parseInt(now.toLocaleTimeString("en-GB", { timeZone: "Asia/Jakarta", hour: "2-digit" }));
  
  // Date object untuk kueri Prisma (jam 00:00:00 UTC dari tanggal lokal)
  const filterHariIni = new Date(`${tglSekarangWIB}T00:00:00.000Z`);

  const jadwalRaw = await prisma.slotwaktu.findMany({
    where: {
      tanggal: { gte: filterHariIni }
    },
    include: {
      lapangan: { select: { nama: true } }
    },
    orderBy: [
      { tanggal: "asc" },
      { jamMulai: "asc" },
      { lapangan: { nama: "asc" } }
    ]
  });

  // Filter jam yang sudah lewat khusus untuk hari ini
  const jadwal = jadwalRaw.filter((j) => {
    const tglSlot = j.tanggal.toISOString().split("T")[0];
    if (tglSlot === tglSekarangWIB) {
      const [jamMulai] = j.jamMulai.split(":").map(Number);
      return jamMulai >= jamSekarangWIB;
    }
    // Jika ada sisa data di bawah hari ini (karena timezone mismatch di DB), hapus saja
    if (tglSlot < tglSekarangWIB) return false;
    
    return true;
  });

  return (
    <>
      <div className="konten-header">
        <h1>Atur Jadwal</h1>
      </div>
      <div className="konten-body">
        <FormGenerateJadwal lapanganParams={daftarLapangan} />
        <TabelJadwal jadwal={jadwal} />
      </div>
    </>
  );
}
