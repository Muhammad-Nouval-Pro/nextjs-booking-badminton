import { prisma } from "@/app/lib/db";

export default async function DashboardPemilik() {
  const bulanIni = new Date();
  bulanIni.setDate(1);
  bulanIni.setHours(0, 0, 0, 0);

  // Pendapatan Bulan Ini
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
  const totalPendapatan = pendapatanBulanIniRaw._sum.jumlah ? Number(pendapatanBulanIniRaw._sum.jumlah) : 0;

  // Total Booking Bulan Ini
  const totalBooking = await prisma.pemesanan.count({
    where: {
      dibuatPada: { gte: bulanIni }
    }
  });

  // Total Pelanggan Aktif
  const totalPelanggan = await prisma.pengguna.count({
    where: { peran: "PELANGGAN" }
  });

  // Ambil booking terbaru (Limit 5)
  const bookingTerbaru = await prisma.pemesanan.findMany({
    orderBy: { dibuatPada: "desc" },
    include: {
      pengguna: { select: { nama: true } },
      slotWaktu: { include: { lapangan: { select: { nama: true } } } }
    }
  });

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
        <h1>Dashboard Monitoring</h1>
      </div>
      <div className="konten-body">
        <div className="grid-statistik">
          {[
            { label: "Pendapatan Bulan Ini", nilai: formatRupiah(totalPendapatan), ikon: "💰", warna: "ikon-biru", sub: "Lunas" },
            { label: "Booking Bulan Ini", nilai: totalBooking.toString(), ikon: "📅", warna: "ikon-biru", sub: "Total pesanan" },
            { label: "Total Pelanggan", nilai: totalPelanggan.toString(), ikon: "👤", warna: "ikon-kuning", sub: "Terdaftar" },
          ].map((stat) => (
            <div key={stat.label} className="kartu-statistik">
              <div className="kartu-statistik-atas">
                <span className="kartu-statistik-label">{stat.label}</span>
                <div className={`kartu-statistik-ikon ${stat.warna}`}>{stat.ikon}</div>
              </div>
              <div className="kartu-statistik-nilai">{stat.nilai}</div>
              <div className="kartu-statistik-sub">{stat.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.25rem", marginTop: "2rem" }}>
          <div className="kartu">
            <div className="kartu-header">
              <span className="kartu-judul">📋 Seluruh Pemesanan</span>
            </div>
            <div className="tabel-wrapper">
              <table className="tabel">
                <thead>
                  <tr>
                    <th>Pelanggan</th>
                    <th>Lapangan</th>
                    <th>Tanggal & Waktu</th>
                    <th>Total Biaya</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingTerbaru.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "1rem" }}>Belum ada booking.</td>
                    </tr>
                  ) : (
                    bookingTerbaru.map((b) => (
                      <tr key={b.idPemesanan}>
                        <td>{b.pengguna.nama}</td>
                        <td>{b.slotWaktu?.lapangan?.nama || "-"}</td>
                        <td>
                          {b.slotWaktu ? `${b.slotWaktu.tanggal.toLocaleDateString('id-ID')} | ${b.slotWaktu.jamMulai}` : "-"}
                        </td>
                        <td style={{ fontWeight: 600 }}>{formatRupiah(Number(b.totalHarga))}</td>
                        <td>
                          {b.status === "MENUNGGU" && <span className="badge badge-kuning">Menunggu</span>}
                          {b.status === "DIKONFIRMASI" && <span className="badge badge-biru">Dikonfirmasi</span>}
                          {b.status === "SELESAI" && <span className="badge badge-biru">Selesai</span>}
                          {b.status === "DIBATALKAN" && <span className="badge badge-merah">Batal</span>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
