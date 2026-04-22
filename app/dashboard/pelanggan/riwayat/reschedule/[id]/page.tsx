import { prisma } from "@/app/lib/db";
import { ambilSesi } from "@/app/lib/sesi";
import { redirect, notFound } from "next/navigation";
import { ListReschedule } from "@/app/dashboard/pelanggan/riwayat/reschedule/[id]/client";

export default async function HalamanReschedule(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tgl?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const sesi = await ambilSesi();
  if (!sesi || !sesi.penggunaId) redirect("/masuk");

  // Ambil data pemesanan lama
  const pesanan = await prisma.pemesanan.findUnique({
    where: { id: params.id, penggunaId: sesi.penggunaId },
    include: { slotWaktu: { include: { lapangan: true } } }
  });

  if (!pesanan) return notFound();

  const tglFilter = searchParams?.tgl || new Date().toLocaleDateString('en-CA'); 
  const tglMulai = new Date(`${tglFilter}T00:00:00.000Z`);
  const tglHariBerikut = new Date(tglMulai);
  tglHariBerikut.setDate(tglHariBerikut.getDate() + 1);

  // Ambil jadwal tersedia untuk reschedule
  const jadwalRaw = await prisma.slotwaktu.findMany({
    where: {
      sudahDipesan: false,
      diblokir: false,
      tanggal: {
        gte: tglMulai,
        lt: tglHariBerikut
      }
    },
    include: {
      lapangan: true
    },
    orderBy: [
      { jamMulai: "asc" },
      { lapangan: { nama: "asc"} }
    ]
  });

  const now = new Date();
  const tglSekarangWIB = now.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
  const jamSekarangWIB = parseInt(now.toLocaleTimeString("en-GB", { timeZone: "Asia/Jakarta", hour: "2-digit" }));
  const menitSekarangWIB = parseInt(now.toLocaleTimeString("en-GB", { timeZone: "Asia/Jakarta", minute: "2-digit" }));

  const jadwal = jadwalRaw
    .map((j) => ({
      ...j,
      lapangan: {
        ...j.lapangan,
        hargaPerJam: Number(j.lapangan.hargaPerJam)
      }
    }))
    .filter((j) => {
      const tglSlot = j.tanggal.toISOString().split("T")[0];
      if (tglSlot === tglSekarangWIB) {
        const [jamMulai, menitMulai] = j.jamMulai.split(":").map(Number);
        if (jamMulai < jamSekarangWIB) return false;
        if (jamMulai === jamSekarangWIB && menitMulai <= menitSekarangWIB) return false;
      }
      return true;
    });

  return (
    <>
      <div className="konten-header" style={{ justifyContent: "space-between" }}>
        <div>
          <h1 style={{ marginBottom: "0.25rem" }}>Reschedule Jadwal</h1>
          <p style={{ fontSize: "0.9rem", color: "var(--abu-500)" }}>
            Mengubah jadwal untuk <strong>#{pesanan.kodePemesanan}</strong>
          </p>
        </div>
        <form method="get" style={{ display: "flex", gap: "0.5rem" }}>
          <input 
            type="date" 
            name="tgl" 
            defaultValue={tglFilter} 
            min={tglSekarangWIB}
            className="form-input" 
            style={{ width: "auto" }} 
            required 
          />
          <button type="submit" className="tombol-primer" style={{ padding: "0.5rem 1rem" }}>Cari</button>
        </form>
      </div>
      <div className="konten-body">
        <div style={{ marginBottom: "2rem", padding: "1.5rem", background: "white", borderRadius: "var(--radius-md)", border: "1.5px solid var(--biru-border)" }}>
          <h3 style={{ fontSize: "0.9rem", color: "var(--biru-primer)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>Jadwal Saat Ini</h3>
          <div style={{ fontWeight: 700, fontSize: "1.2rem" }}>{pesanan.slotWaktu.lapangan.nama}</div>
          <div style={{ color: "var(--abu-600)" }}>
            {pesanan.slotWaktu.tanggal.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'})}
          </div>
          <div style={{ fontWeight: 600 }}>{pesanan.slotWaktu.jamMulai} - {pesanan.slotWaktu.jamSelesai}</div>
        </div>

        <h3 style={{ marginBottom: "1.25rem" }}>Pilih Jadwal Pengganti</h3>
        <ListReschedule jadwalLapangan={jadwal} pemesananId={pesanan.id} />
      </div>
    </>
  );
}
