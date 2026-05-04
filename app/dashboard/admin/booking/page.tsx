import { prisma } from "@/app/lib/db";
import { TabelBooking } from "./client";

export default async function SemuaBooking() {
  const pemesananRaw = await prisma.pemesanan.findMany({
    include: {
      pengguna: { select: { nama: true, nomorHp: true } },
      slotWaktu: {
        include: { lapangan: true },
      },
    },
    orderBy: { dibuatPada: "desc" },
  });

  // Otomatisasi: Update status menjadi SELESAI jika waktu main sudah lewat
  const sekarang = new Date();
  await Promise.all(
    pemesananRaw.map(async (p) => {
      if (p.status === "DIKONFIRMASI" && p.slotWaktu) {
        const [jam, menit] = p.slotWaktu.jamSelesai.split(":").map(Number);
        const waktuSelesai = new Date(p.slotWaktu.tanggal);
        waktuSelesai.setHours(jam, menit, 0, 0);

        if (sekarang > waktuSelesai) {
          await prisma.pemesanan.update({
            where: { idPemesanan: p.idPemesanan },
            data: { status: "SELESAI" },
          });
          p.status = "SELESAI";
        }
      }
    })
  );

  // Serialize ke plain object agar bisa dikirim ke Client Component
  const pemesanan = pemesananRaw.map((p) => ({
    idPemesanan: p.idPemesanan,
    kodePemesanan: p.kodePemesanan,
    status: p.status,
    totalHarga: Number(p.totalHarga),
    dibuatPada: p.dibuatPada.toISOString(),
    ulasan: p.ulasan ?? null,
    pengguna: {
      nama: p.pengguna.nama,
      nomorHp: p.pengguna.nomorHp ?? null,
    },
    slotWaktu: p.slotWaktu
      ? {
          tanggal: p.slotWaktu.tanggal.toISOString(),
          jamMulai: p.slotWaktu.jamMulai,
          jamSelesai: p.slotWaktu.jamSelesai,
          lapangan: { nama: p.slotWaktu.lapangan.nama },
        }
      : null,
  }));

  return (
    <>
      <div className="konten-header">
        <h1>Semua Booking</h1>
      </div>
      <div className="konten-body">
        <div className="kartu">
          <div className="kartu-header">
            <span className="kartu-judul">Riwayat &amp; Data Pesanan</span>
          </div>
          <TabelBooking pemesanan={pemesanan} />
        </div>
      </div>
    </>
  );
}
