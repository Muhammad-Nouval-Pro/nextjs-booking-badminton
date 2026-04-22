import { prisma } from "@/app/lib/db";

export default async function DashboardAdmin() {
  // Ambil total lapangan
  const totalLapangan = await prisma.lapangan.count();

  // Ambil statistik booking (contoh sederhana)
  // Tanggal mulai hari ini pukul 00:00:00
  const hariIni = new Date();
  hariIni.setHours(0, 0, 0, 0);

  const bookingHariIni = await prisma.pemesanan.count({
    where: {
      dibuatPada: {
        gte: hariIni,
      },
    },
  });

  const menungguVerifikasi = await prisma.pembayaran.count({
    where: { status: "MENUNGGU" },
  });

  const bulanIni = new Date();
  bulanIni.setDate(1);
  bulanIni.setHours(0, 0, 0, 0);

  // Agregasi pendapatan bulan ini
  const pendapatanBulanIniRaw = await prisma.pembayaran.aggregate({
    _sum: {
      jumlah: true,
    },
    where: {
      status: "LUNAS",
      dibayarPada: {
        gte: bulanIni,
      },
    },
  });

  const pendapatanBulanIni = pendapatanBulanIniRaw._sum.jumlah ? Number(pendapatanBulanIniRaw._sum.jumlah) : 0;

  // Formatting rupiah
  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(angka);
  };

  return (
    <>
      <div className="konten-header">
        <h1>Dashboard Admin</h1>
      </div>
      <div className="konten-body">
        <div className="grid-statistik">
          {[
            { label: "Total Lapangan", nilai: totalLapangan.toString(), ikon: "🏸", warna: "ikon-biru" },
            { label: "Booking Hari Ini", nilai: bookingHariIni.toString(), ikon: "📅", warna: "ikon-biru" },
            { label: "Menunggu Verifikasi", nilai: menungguVerifikasi.toString(), ikon: "⏳", warna: "ikon-kuning" },
            { label: "Pendapatan Bulan Ini", nilai: formatRupiah(pendapatanBulanIni), ikon: "💰", warna: "ikon-biru" },
          ].map((stat) => (
            <div key={stat.label} className="kartu-statistik">
              <div className="kartu-statistik-atas">
                <span className="kartu-statistik-label">{stat.label}</span>
                <div className={`kartu-statistik-ikon ${stat.warna}`}>{stat.ikon}</div>
              </div>
              <div className="kartu-statistik-nilai">{stat.nilai}</div>
              <div className="kartu-statistik-sub">Data terkini</div>
            </div>
          ))}
        </div>

        <div className="kartu">
          <div className="kartu-header">
            <span className="kartu-judul">Booking Terbaru</span>
          </div>
          <div className="kartu-body" style={{ textAlign: "center", padding: "3rem", color: "var(--abu-500)" }}>
            Belum ada booking. Data akan muncul setelah pelanggan melakukan pemesanan.
          </div>
        </div>
      </div>
    </>
  );
}
