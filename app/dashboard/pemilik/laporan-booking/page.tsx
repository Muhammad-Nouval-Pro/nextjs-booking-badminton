import { prisma } from "@/app/lib/db";

export default async function LaporanBookingPemilik() {
  const pemesanan = await prisma.pemesanan.findMany({
    include: {
      pengguna: { select: { nama: true, nomorHp: true } },
      pembayaran: true,
      slotWaktu: {
        include: { lapangan: true }
      }
    },
    orderBy: { dibuatPada: "desc" }
  });

  const formatRupiah = (angka: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(angka);

  return (
    <>
      <div className="konten-header">
        <h1>Laporan Booking</h1>
      </div>
      <div className="konten-body">
        <div className="kartu">
          <div className="kartu-header">
            <span className="kartu-judul">📋 Seluruh Aktivitas Pemesanan Lapangan</span>
          </div>
          <div className="tabel-wrapper">
            <table className="tabel">
              <thead>
                <tr>
                  <th>ID Pesanan</th>
                  <th>Pemesan</th>
                  <th>Jadwal & Lapangan</th>
                  <th>Total Transaksi</th>
                  <th>Status</th>
                  <th>Tanggal Booking</th>
                </tr>
              </thead>
              <tbody>
                {pemesanan.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--abu-500)" }}>Belum ada data pemesanan</td>
                  </tr>
                ) : (
                  pemesanan.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontSize: "0.8rem", color: "var(--abu-500)", fontFamily: "monospace" }}>{p.id.split("-")[0]}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{p.pengguna.nama}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--abu-500)" }}>{p.pengguna.nomorHp || "-"}</div>
                      </td>
                      <td style={{ fontSize: "0.85rem" }}>
                        {p.slotWaktu ? (
                          <>
                            <div style={{ fontWeight: 600, color: "var(--biru-primer)" }}>{p.slotWaktu.lapangan.nama}</div>
                            <div>{p.slotWaktu.tanggal.toLocaleDateString("id-ID")}</div>
                            <div style={{ color: "var(--abu-500)" }}>
                              {p.slotWaktu.jamMulai} - {p.slotWaktu.jamSelesai}
                            </div>
                          </>
                        ) : "-"}
                      </td>
                      <td style={{ fontWeight: 600 }}>{formatRupiah(Number(p.totalHarga))}</td>
                      <td>
                        {p.status === "MENUNGGU" && <span className="badge badge-kuning">Menunggu</span>}
                        {p.status === "DIKONFIRMASI" && <span className="badge badge-biru">Dikonfirmasi</span>}
                        {p.status === "SELESAI" && <span className="badge badge-biru">Selesai</span>}
                        {p.status === "DIBATALKAN" && <span className="badge badge-merah">Dibatalkan</span>}
                      </td>
                      <td style={{ fontSize: "0.85rem", color: "var(--abu-500)" }}>
                        {p.dibuatPada.toLocaleDateString("id-ID")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
