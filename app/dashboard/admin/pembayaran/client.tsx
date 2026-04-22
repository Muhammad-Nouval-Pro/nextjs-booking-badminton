"use client";

import { konfirmasiPembayaran, tolakPembayaran } from "@/app/actions/admin";

export function TabelPembayaranClient({ pembayaran }: { pembayaran: any[] }) {
  const formatRupiah = (angka: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(angka);

  return (
    <div className="kartu">
      <div className="kartu-header">
        <span className="kartu-judul">Daftar Transaksi Pembayaran</span>
      </div>
      <div className="tabel-wrapper">
        <table className="tabel">
          <thead>
            <tr>
              <th>ID Validasi</th>
              <th>Metode</th>
              <th>Total</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pembayaran.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "var(--abu-500)" }}>Belum ada data pembayaran untuk diverifikasi</td>
              </tr>
            ) : (
              pembayaran.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontSize: "0.8rem", color: "var(--abu-500)", fontFamily: "monospace" }}>{p.id.split("-")[0]}</td>
                  <td style={{ fontWeight: 600 }}>{p.metodeBayar || p.metode || "Manual"}</td>
                  <td style={{ fontWeight: 600, color: "var(--biru-primer)" }}>{formatRupiah(Number(p.jumlah))}</td>
                  <td>
                    {p.status === "MENUNGGU" && <span className="badge badge-kuning">Menunggu</span>}
                    {p.status === "LUNAS" && <span className="badge badge-biru">Lunas</span>}
                    {p.status === "GAGAL" && <span className="badge badge-merah">Gagal/Ditolak</span>}
                  </td>
                  <td style={{ display: "flex", gap: "0.5rem" }}>
                    {p.status === "MENUNGGU" && (
                      <>
                        <button
                          onClick={() => {
                            if (confirm("Konfirmasi pembayaran ini valid dan lunas?")) konfirmasiPembayaran(p.id, p.pemesananId);
                          }}
                          style={{
                            padding: "0.4rem 0.75rem",
                            background: "var(--biru-primer)",
                            color: "white",
                            border: "none",
                            borderRadius: "var(--radius-sm)",
                            fontSize: "0.8rem",
                            cursor: "pointer",
                            fontWeight: 600
                          }}>
                          Verifikasi
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Tolak pembayaran ini dan batalkan pesanan?")) tolakPembayaran(p.id, p.pemesananId);
                          }}
                          style={{
                            padding: "0.4rem 0.75rem",
                            background: "#fee2e2",
                            color: "var(--merah)",
                            border: "none",
                            borderRadius: "var(--radius-sm)",
                            fontSize: "0.8rem",
                            cursor: "pointer",
                            fontWeight: 600
                          }}>
                          Tolak
                        </button>
                      </>
                    )}
                    {p.status !== "MENUNGGU" && (
                      <span style={{ fontSize: "0.8rem", color: "var(--abu-500)", fontStyle: "italic" }}>
                        Sudah direspon
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
