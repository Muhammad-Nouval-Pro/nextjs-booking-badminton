import { prisma } from "@/app/lib/db";
import { ambilSesi } from "@/app/lib/sesi";
import { redirect } from "next/navigation";
import { KontenRating } from "@/app/dashboard/pelanggan/rating/client";

export default async function HalamanRating() {
  const sesi = await ambilSesi();
  if (!sesi || !sesi.penggunaId) redirect("/masuk");

  const pemesananSelesaiRaw = await prisma.pemesanan.findMany({
    where: {
      penggunaId: sesi.penggunaId,
      status: "SELESAI",
    },
    include: {
      slotWaktu: {
        include: { lapangan: true },
      },
    },
    orderBy: { diperbaruiPada: "desc" },
  });

  const pemesananSelesai = pemesananSelesaiRaw.map((p) => ({
    id: p.id,
    kodePemesanan: p.kodePemesanan,
    rating: p.rating,
    ulasan: p.ulasan,
    dibuatPada: p.dibuatPada.toISOString(),
    diperbaruiPada: p.diperbaruiPada.toISOString(),
    lapanganNama: p.slotWaktu?.lapangan?.nama || "Lapangan Tidak Diketahui",
    tanggal: p.slotWaktu?.tanggal
      ? p.slotWaktu.tanggal.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "-",
    jamMulai: p.slotWaktu?.jamMulai || "-",
    jamSelesai: p.slotWaktu?.jamSelesai || "-",
    totalHarga: Number(p.totalHarga),
  }));

  const belumDirating = pemesananSelesai.filter((p) => !p.rating);
  const sudahDirating = pemesananSelesai.filter((p) => p.rating);

  return (
    <>
      <div className="konten-header">
        <h1>Ulasan & Rating</h1>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <span className="badge badge-kuning">
            {belumDirating.length} Belum Diulas
          </span>
          <span className="badge badge-biru">
            {sudahDirating.length} Sudah Diulas
          </span>
        </div>
      </div>
      <div className="konten-body">
        <KontenRating
          belumDirating={belumDirating}
          sudahDirating={sudahDirating}
        />
      </div>
    </>
  );
}
