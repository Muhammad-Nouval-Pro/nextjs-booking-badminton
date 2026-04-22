import { prisma } from "@/app/lib/db";
import { TombolExportExcel } from "./client";

export default async function LaporanPendapatanPemilik() {
  const pembayaranFixRaw = await prisma.pembayaran.findMany({
    where: {
      status: "LUNAS",
    },
    include: {
      pemesanan: {
        include: { pengguna: true }
      }
    },
    orderBy: {
      dibayarPada: "desc"
    }
  });

  const pembayaranFix = pembayaranFixRaw.map((p) => ({
    ...p,
    jumlah: Number(p.jumlah),
    dibayarPada: p.dibayarPada?.toISOString(),
    dibuatPada: p.dibuatPada.toISOString(),
    pemesanan: p.pemesanan ? {
      ...p.pemesanan,
      totalHarga: Number(p.pemesanan.totalHarga),
      dibuatPada: p.pemesanan.dibuatPada.toISOString(),
      diperbaruiPada: p.pemesanan.diperbaruiPada.toISOString(),
    } : null
  }));

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(angka);
  };

  const totalPendapatan = pembayaranFix.reduce((acc, curr) => acc + Number(curr.jumlah), 0);

  return (
    <>
      <div className="konten-header">
        <h1>Laporan Pendapatan Tunai/Lunas</h1>
        <TombolExportExcel data={pembayaranFix} />
      </div>
      <div className="konten-body">
        <div className="kartu-statistik" style={{ marginBottom: "2rem", width: "max-content", paddingRight: "4rem" }}>
          <div className="kartu-statistik-atas">
            <span className="kartu-statistik-label">Total Omset Bersih Tersimpan</span>
            <div className="kartu-statistik-ikon ikon-biru">💰</div>
          </div>
          <div className="kartu-statistik-nilai">{formatRupiah(totalPendapatan)}</div>
        </div>

        <div className="kartu">
          <div className="kartu-header">
            <span className="kartu-judul">💳 Daftar Transaksi Masuk</span>
          </div>
          <div className="tabel-wrapper">
            <table className="tabel">
              <thead>
                <tr>
                  <th>ID Validasi</th>
                  <th>Tanggal Dibayar</th>
                  <th>Customer</th>
                  <th>Metode</th>
                  <th>Nominal Masuk</th>
                  <th>Status Dana</th>
                </tr>
              </thead>
              <tbody>
                {pembayaranFix.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--abu-500)" }}>Belum ada data pendapatan</td>
                  </tr>
                ) : (
                  pembayaranFix.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontSize: "0.8rem", color: "var(--abu-500)", fontFamily: "monospace" }}>{p.id.split("-")[0]}</td>
                      <td style={{ fontWeight: 600 }}>
                        {p.dibayarPada ? 
                          new Date(p.dibayarPada).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : 
                          new Date(p.dibuatPada).toLocaleDateString("id-ID")
                        }
                      </td>
                      <td>{p.pemesanan?.pengguna?.nama || "Unknown"}</td>
                      <td style={{ fontWeight: 600 }}>{p.metodeBayar || "Manual"}</td>
                      <td style={{ fontWeight: 600, color: "var(--biru-primer)" }}>{formatRupiah(Number(p.jumlah))}</td>
                      <td><span className="badge badge-biru">Lunas</span></td>
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
