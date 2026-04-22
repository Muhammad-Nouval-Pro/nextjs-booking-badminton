import { prisma } from "@/app/lib/db";
import { ListJadwalTersedia } from "./client";

export default async function PesanLapangan(props: {
  searchParams: Promise<{ tgl?: string }>;
}) {
  const searchParams = await props.searchParams;
  // Format stabil ke bentuk yyyy-mm-dd
  // Default timezone offset ke WIB bisa bervariasi, kita parse dengan T00:00:00.000Z 
  // agar query Prisma benar-benar dihitung satu hari yang sama persis seperti saat Admin men-generate jadwal.
  const tglFilter = searchParams?.tgl || new Date().toLocaleDateString('en-CA'); // en-CA format: YYYY-MM-DD
  const filterDate = new Date(`${tglFilter}T00:00:00.000Z`);

  // Buat range pencarian hari penuh untuk menghindari timezone mismatch di driver database
  const tglMulai = new Date(`${tglFilter}T00:00:00.000Z`);
  const tglHariBerikut = new Date(tglMulai);
  tglHariBerikut.setDate(tglHariBerikut.getDate() + 1);

  const jadwalRaw = await prisma.slotwaktu.findMany({
    where: {
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
  const tglSekarangWIB = now.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" }); // YYYY-MM-DD
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
      // Jika tanggal slot adalah HARI INI, cek jam nya
      if (tglSlot === tglSekarangWIB) {
        const [jamMulai, menitMulai] = j.jamMulai.split(":").map(Number);
        if (jamMulai < jamSekarangWIB) return false;
        if (jamMulai === jamSekarangWIB && menitMulai <= menitSekarangWIB) return false;
      }
      // Jika terpilih tanggal lalu, sembunyikan semua
      if (tglSlot < tglSekarangWIB) return false;
      
      return true;
    });

  return (
    <>
      <div className="konten-header" style={{ justifyContent: "space-between" }}>
        <h1>Pilih Lapangan & Waktu</h1>
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
        <div style={{ marginBottom: "2rem", color: "var(--abu-500)" }}>
          Menampilkan Ketersediaan pada <strong>{filterDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'})}</strong>
        </div>
        <ListJadwalTersedia jadwalLapangan={jadwal} />
      </div>
    </>
  );
}
