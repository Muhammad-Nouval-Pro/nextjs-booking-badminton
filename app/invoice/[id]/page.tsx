import { prisma } from "@/app/lib/db";
import { ambilSesi } from "@/app/lib/sesi";
import { redirect } from "next/navigation";
import ClientPrintBtn from "./client"; // We'll create a small client component for the print button

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const sesi = await ambilSesi();
  // Bisa juga tanpa login jika ingin publik (seperti link struk), tapi kita amankan saja.
  if (!sesi || !sesi.penggunaId) redirect("/masuk");

  const resolvedParams = await params;
  const { id } = resolvedParams;

  const pemesanan = await prisma.pemesanan.findUnique({
    where: {
      idPemesanan: id,
    },
    include: {
      slotWaktu: {
        include: { lapangan: true },
      },
      pembayaran: true,
      pengguna: true,
    },
  });

  // Pastikan pemesanan ada dan milik user yang login (atau admin/pemilik)
  if (!pemesanan || (pemesanan.penggunaId !== sesi.penggunaId && sesi.peran === "PELANGGAN")) {
    redirect("/dashboard/pelanggan/riwayat");
  }

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(angka);
  };

  const statusLunas = pemesanan.status === "DIKONFIRMASI" || pemesanan.status === "SELESAI";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6", padding: "2.5rem 1rem", fontFamily: "sans-serif", color: "#1f2937" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", backgroundColor: "#ffffff", padding: "3rem", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #e5e7eb", paddingBottom: "1.5rem", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ fontSize: "2.5rem", fontWeight: "800", color: "#2563eb", margin: "0 0 0.25rem 0", letterSpacing: "-0.025em" }}>INVOICE</h1>
            <p style={{ color: "#6b7280", margin: 0, fontSize: "1rem" }}>Bukti Pemesanan & Pembayaran</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#111827", margin: "0 0 0.25rem 0" }}>GOR Garuda Nusantara</h2>
            <p style={{ color: "#4b5563", margin: "0 0 0.125rem 0", fontSize: "0.875rem" }}>Jl. Pintu Satu Senayan, Jakarta</p>
            <p style={{ color: "#4b5563", margin: 0, fontSize: "0.875rem" }}>Telp: (0857-8012-2260)</p>
          </div>
        </div>

        {/* Info Pelanggan & Pemesanan */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2.5rem" }}>
          <div>
            <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem", margin: 0 }}>Ditagihkan Kepada</p>
            <p style={{ fontWeight: "700", color: "#1f2937", margin: "0.25rem 0", fontSize: "1.125rem" }}>{pemesanan.pengguna.nama}</p>
            <p style={{ color: "#4b5563", margin: "0 0 0.25rem 0", fontSize: "0.875rem" }}>{pemesanan.pengguna.email}</p>
            <p style={{ color: "#4b5563", margin: 0, fontSize: "0.875rem" }}>{pemesanan.pengguna.nomorHp || "-"}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem", margin: 0 }}>Kode Pemesanan</p>
            <p style={{ fontWeight: "800", color: "#1f2937", fontSize: "1.25rem", margin: "0.25rem 0 1rem 0" }}>#{pemesanan.kodePemesanan}</p>

            <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem", margin: 0 }}>Tanggal Terbit</p>
            <p style={{ color: "#4b5563", margin: "0.25rem 0 0 0", fontSize: "0.875rem" }}>{pemesanan.dibuatPada.toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Detail Pesanan */}
        <div style={{ marginBottom: "2rem", border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
          <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              <tr>
                <th style={{ padding: "1rem", fontSize: "0.875rem", fontWeight: "700", color: "#4b5563" }}>Deskripsi</th>
                <th style={{ padding: "1rem", fontSize: "0.875rem", fontWeight: "700", color: "#4b5563", textAlign: "right" }}>Harga</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: "1.5rem 1rem", borderBottom: "1px solid #f3f4f6" }}>
                  <p style={{ fontWeight: "700", color: "#1f2937", margin: "0 0 0.5rem 0", fontSize: "1.05rem" }}>Sewa {pemesanan.slotWaktu?.lapangan.nama || "Lapangan"}</p>
                  <p style={{ color: "#6b7280", margin: "0 0 0.25rem 0", fontSize: "0.9rem" }}>
                    Jadwal: <strong style={{ color: "#374151" }}>{pemesanan.slotWaktu ? pemesanan.slotWaktu.tanggal.toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : "-"}</strong>
                  </p>
                  <p style={{ color: "#6b7280", margin: 0, fontSize: "0.9rem" }}>
                    Waktu: <strong style={{ color: "#374151" }}>{pemesanan.slotWaktu?.jamMulai} - {pemesanan.slotWaktu?.jamSelesai}</strong>
                  </p>
                </td>
                <td style={{ padding: "1.5rem 1rem", textAlign: "right", fontWeight: "700", color: "#1f2937", verticalAlign: "top", fontSize: "1.1rem" }}>
                  {formatRupiah(Number(pemesanan.totalHarga))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Ringkasan Pembayaran */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2.5rem" }}>
          <div style={{ flex: 1, paddingRight: "2rem" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem", margin: 0 }}>Status Pembayaran</p>
            <div style={{ marginTop: "0.5rem" }}>
              {statusLunas ? (
                <span style={{ display: "inline-block", padding: "0.35rem 0.75rem", backgroundColor: "#d1fae5", color: "#047857", borderRadius: "6px", fontSize: "0.875rem", fontWeight: "800", border: "1px solid #a7f3d0" }}>
                  LUNAS
                </span>
              ) : (
                <span style={{ display: "inline-block", padding: "0.35rem 0.75rem", backgroundColor: "#fef3c7", color: "#b45309", borderRadius: "6px", fontSize: "0.875rem", fontWeight: "800", border: "1px solid #fde68a" }}>
                  BELUM LUNAS
                </span>
              )}
            </div>

            {pemesanan.pembayaran?.metodeBayar && (
              <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: "1.5rem 0 0.25rem 0" }}>
                Metode: <strong style={{ textTransform: "uppercase", color: "#374151" }}>{pemesanan.pembayaran.metodeBayar.replace(/_/g, " ")}</strong>
              </p>
            )}
            {pemesanan.pembayaran?.dibayarPada && (
              <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: 0 }}>
                Dibayar: <strong style={{ color: "#374151" }}>{pemesanan.pembayaran.dibayarPada.toLocaleString("id-ID")}</strong>
              </p>
            )}
          </div>

          <div style={{ flex: 1, backgroundColor: "#f9fafb", padding: "1.5rem", borderRadius: "8px", border: "1px solid #e5e7eb", minWidth: "250px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#4b5563", fontSize: "0.95rem", marginBottom: "0.75rem" }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: "600" }}>{formatRupiah(Number(pemesanan.totalHarga))}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "800", fontSize: "1.5rem", color: "#2563eb", paddingTop: "1rem", borderTop: "2px dashed #e5e7eb" }}>
              <span>Total</span>
              <span>{formatRupiah(Number(pemesanan.totalHarga))}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", color: "#6b7280", fontSize: "0.875rem", marginTop: "3rem", paddingTop: "1.5rem", borderTop: "1px solid #e5e7eb" }}>
          <p style={{ margin: "0 0 0.25rem 0", fontWeight: "500" }}>Terima kasih telah memesan lapangan di GOR Garuda Nusantara.</p>
          <p style={{ margin: 0 }}>Harap tunjukkan invoice ini kepada petugas lapangan saat akan bermain.</p>
        </div>

        {/* Action Buttons (Hidden on Print) */}
        <ClientPrintBtn />

      </div>
    </div>
  );
}
